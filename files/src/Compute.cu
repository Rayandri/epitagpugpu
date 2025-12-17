#include "Compute.hpp"
#include "Image.hpp"
#include <curand_kernel.h>
#include <cstring>
#include <algorithm>

// Device function to find matching reservoir
__device__ int find_matching_reservoir_cu(const rgb8& pixel, const Reservoir* reservoirs)
{
    // First, look for matching reservoir with weight > 0
    for (int i = 0; i < RESERVOIR_COUNT; ++i)
    {
        if (reservoirs[i].w > 0)
        {
            // Check RGB difference - cast to signed to handle unsigned subtraction
            int dr = abs((int)pixel.r - (int)reservoirs[i].rgb.r);
            int dg = abs((int)pixel.g - (int)reservoirs[i].rgb.g);
            int db = abs((int)pixel.b - (int)reservoirs[i].rgb.b);
            
            if (dr < RGB_DIFF_THRESHOLD && dg < RGB_DIFF_THRESHOLD && db < RGB_DIFF_THRESHOLD)
            {
                return i;  // Found matching reservoir
            }
        }
        else
        {
            // Found empty slot, return it
            return i;
        }
    }
    return -1;  // No match and no empty slot
}

// Kernel to initialize curand states
__global__ void init_curand_kernel(curandState* states, int width, int height, unsigned int seed)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x < width && y < height)
    {
        int idx = y * width + x;
        curand_init(seed, idx, 0, &states[idx]);
    }
}

// Kernel for background estimation
__global__ void background_estimation_kernel(
    ImageView<rgb8> current_frame,
    Reservoir* reservoirs,
    curandState* rng_states,
    ImageView<rgb8> background,
    bool should_sample)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= current_frame.width || y >= current_frame.height)
        return;
    
    int pixel_idx = y * current_frame.width + x;
    Reservoir* pixel_reservoirs = &reservoirs[pixel_idx * RESERVOIR_COUNT];
    
    rgb8* pixel_ptr = (rgb8*)((std::byte*)current_frame.buffer + y * current_frame.stride);
    rgb8 current_pixel = pixel_ptr[x];
    
    rgb8* bg_ptr = (rgb8*)((std::byte*)background.buffer + y * background.stride);
    
    // Background estimation
    if (should_sample)
    {
        int m_idx = find_matching_reservoir_cu(current_pixel, pixel_reservoirs);
        
        if (m_idx != -1 && pixel_reservoirs[m_idx].w > 0)
        {
            // Matching reservoir found, update it
            pixel_reservoirs[m_idx].w += 1.0f;
            float w = pixel_reservoirs[m_idx].w;
            pixel_reservoirs[m_idx].rgb.r = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.r + current_pixel.r) / w);
            pixel_reservoirs[m_idx].rgb.g = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.g + current_pixel.g) / w);
            pixel_reservoirs[m_idx].rgb.b = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.b + current_pixel.b) / w);
        }
        else if (m_idx != -1 && pixel_reservoirs[m_idx].w == 0)
        {
            // Empty slot, initialize it
            pixel_reservoirs[m_idx].rgb = current_pixel;
            pixel_reservoirs[m_idx].w = 1.0f;
        }
        else
        {
            // No match and no empty slot, perform weighted reservoir replacement
            int min_idx = 0;
            float min_weight = pixel_reservoirs[0].w;
            float total_weights = 0.0f;
            
            for (int i = 0; i < RESERVOIR_COUNT; ++i)
            {
                total_weights += pixel_reservoirs[i].w;
                if (pixel_reservoirs[i].w < min_weight)
                {
                    min_weight = pixel_reservoirs[i].w;
                    min_idx = i;
                }
            }
            
            // Weighted reservoir sampling
            float rand_val = curand_uniform(&rng_states[pixel_idx]);
            if (total_weights > 0 && rand_val * total_weights >= min_weight)
            {
                pixel_reservoirs[min_idx].rgb = current_pixel;
                pixel_reservoirs[min_idx].w = 1.0f;
            }
        }
        
        // Cap weights to MAX_WEIGHTS
        for (int i = 0; i < RESERVOIR_COUNT; ++i)
        {
            if (pixel_reservoirs[i].w > MAX_WEIGHTS)
                pixel_reservoirs[i].w = MAX_WEIGHTS;
        }
    }
    
    // Select background as reservoir with max weight
    int bg_idx = 0;
    float max_weight = pixel_reservoirs[0].w;
    for (int i = 1; i < RESERVOIR_COUNT; ++i)
    {
        if (pixel_reservoirs[i].w > max_weight)
        {
            max_weight = pixel_reservoirs[i].w;
            bg_idx = i;
        }
    }
    
    bg_ptr[x] = pixel_reservoirs[bg_idx].rgb;
}

// Kernel for motion mask calculation
// Motion mask is a SCORE (0-255), not binary!
__global__ void motion_mask_kernel(
    ImageView<rgb8> current_frame,
    ImageView<rgb8> background,
    ImageView<uint8_t> motion_mask)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= current_frame.width || y >= current_frame.height)
        return;
    
    rgb8* pixel_ptr = (rgb8*)((std::byte*)current_frame.buffer + y * current_frame.stride);
    rgb8* bg_ptr = (rgb8*)((std::byte*)background.buffer + y * background.stride);
    uint8_t* mask_ptr = motion_mask.buffer + y * motion_mask.stride;
    
    rgb8 current_pixel = pixel_ptr[x];
    rgb8 bg_pixel = bg_ptr[x];
    
    int dr = abs((int)current_pixel.r - (int)bg_pixel.r);
    int dg = abs((int)current_pixel.g - (int)bg_pixel.g);
    int db = abs((int)current_pixel.b - (int)bg_pixel.b);
    
    // Motion score (0-255), not binary
    int diff = dr + dg + db;
    mask_ptr[x] = (uint8_t)min(diff, 255);
}

// Kernel for morphological erosion with shared memory
#define BLOCK_SIZE 16
#define MAX_RADIUS 8

__global__ void erosion_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> output,
    int radius)
{
    __shared__ uint8_t tile[BLOCK_SIZE + 2*MAX_RADIUS][BLOCK_SIZE + 2*MAX_RADIUS];
    
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    int tx = threadIdx.x;
    int ty = threadIdx.y;
    
    // Load center tile
    int tile_x = tx + radius;
    int tile_y = ty + radius;
    
    if (x < input.width && y < input.height)
        tile[tile_y][tile_x] = input.buffer[y * input.stride + x];
    else
        tile[tile_y][tile_x] = 255;
    
    // Load halo (borders)
    if (tx < radius) {
        int hx = x - radius;
        tile[tile_y][tx] = (hx >= 0 && y < input.height) ? input.buffer[y * input.stride + hx] : 255;
        hx = x + BLOCK_SIZE;
        tile[tile_y][tx + BLOCK_SIZE + radius] = (hx < input.width && y < input.height) ? input.buffer[y * input.stride + hx] : 255;
    }
    if (ty < radius) {
        int hy = y - radius;
        tile[ty][tile_x] = (hy >= 0 && x < input.width) ? input.buffer[hy * input.stride + x] : 255;
        hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tile_x] = (hy < input.height && x < input.width) ? input.buffer[hy * input.stride + x] : 255;
    }
    // Corners
    if (tx < radius && ty < radius) {
        int hx = x - radius, hy = y - radius;
        tile[ty][tx] = (hx >= 0 && hy >= 0) ? input.buffer[hy * input.stride + hx] : 255;
        hx = x + BLOCK_SIZE; hy = y - radius;
        tile[ty][tx + BLOCK_SIZE + radius] = (hx < input.width && hy >= 0) ? input.buffer[hy * input.stride + hx] : 255;
        hx = x - radius; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx] = (hx >= 0 && hy < input.height) ? input.buffer[hy * input.stride + hx] : 255;
        hx = x + BLOCK_SIZE; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx + BLOCK_SIZE + radius] = (hx < input.width && hy < input.height) ? input.buffer[hy * input.stride + hx] : 255;
    }
    
    __syncthreads();
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t min_val = 255;
    int radius_sq = radius * radius;
    for (int dy = -radius; dy <= radius; ++dy)
    {
        for (int dx = -radius; dx <= radius; ++dx)
        {
            if (dx*dx + dy*dy <= radius_sq)
            {
                uint8_t val = tile[tile_y + dy][tile_x + dx];
                if (val < min_val) min_val = val;
            }
        }
    }
    
    output.buffer[y * output.stride + x] = min_val;
}

// Kernel for morphological dilation with shared memory
__global__ void dilation_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> output,
    int radius)
{
    __shared__ uint8_t tile[BLOCK_SIZE + 2*MAX_RADIUS][BLOCK_SIZE + 2*MAX_RADIUS];
    
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    int tx = threadIdx.x;
    int ty = threadIdx.y;
    
    int tile_x = tx + radius;
    int tile_y = ty + radius;
    
    if (x < input.width && y < input.height)
        tile[tile_y][tile_x] = input.buffer[y * input.stride + x];
    else
        tile[tile_y][tile_x] = 0;
    
    // Load halo
    if (tx < radius) {
        int hx = x - radius;
        tile[tile_y][tx] = (hx >= 0 && y < input.height) ? input.buffer[y * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE;
        tile[tile_y][tx + BLOCK_SIZE + radius] = (hx < input.width && y < input.height) ? input.buffer[y * input.stride + hx] : 0;
    }
    if (ty < radius) {
        int hy = y - radius;
        tile[ty][tile_x] = (hy >= 0 && x < input.width) ? input.buffer[hy * input.stride + x] : 0;
        hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tile_x] = (hy < input.height && x < input.width) ? input.buffer[hy * input.stride + x] : 0;
    }
    if (tx < radius && ty < radius) {
        int hx = x - radius, hy = y - radius;
        tile[ty][tx] = (hx >= 0 && hy >= 0) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE; hy = y - radius;
        tile[ty][tx + BLOCK_SIZE + radius] = (hx < input.width && hy >= 0) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x - radius; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx] = (hx >= 0 && hy < input.height) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx + BLOCK_SIZE + radius] = (hx < input.width && hy < input.height) ? input.buffer[hy * input.stride + hx] : 0;
    }
    
    __syncthreads();
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t max_val = 0;
    int radius_sq = radius * radius;
    for (int dy = -radius; dy <= radius; ++dy)
    {
        for (int dx = -radius; dx <= radius; ++dx)
        {
            if (dx*dx + dy*dy <= radius_sq)
            {
                uint8_t val = tile[tile_y + dy][tile_x + dx];
                if (val > max_val) max_val = val;
            }
        }
    }
    
    output.buffer[y * output.stride + x] = max_val;
}

// Fused kernel: dilation + threshold in one pass
__global__ void dilation_threshold_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> hyst_input,
    ImageView<uint8_t> hyst_output,
    int radius,
    int th_low,
    int th_high)
{
    __shared__ uint8_t tile[BLOCK_SIZE + 2*MAX_RADIUS][BLOCK_SIZE + 2*MAX_RADIUS];
    
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    int tx = threadIdx.x;
    int ty = threadIdx.y;
    
    int tile_x = tx + radius;
    int tile_y = ty + radius;
    
    if (x < input.width && y < input.height)
        tile[tile_y][tile_x] = input.buffer[y * input.stride + x];
    else
        tile[tile_y][tile_x] = 0;
    
    if (tx < radius) {
        int hx = x - radius;
        tile[tile_y][tx] = (hx >= 0 && y < input.height) ? input.buffer[y * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE;
        tile[tile_y][tx + BLOCK_SIZE + radius] = (hx < input.width && y < input.height) ? input.buffer[y * input.stride + hx] : 0;
    }
    if (ty < radius) {
        int hy = y - radius;
        tile[ty][tile_x] = (hy >= 0 && x < input.width) ? input.buffer[hy * input.stride + x] : 0;
        hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tile_x] = (hy < input.height && x < input.width) ? input.buffer[hy * input.stride + x] : 0;
    }
    if (tx < radius && ty < radius) {
        int hx = x - radius, hy = y - radius;
        tile[ty][tx] = (hx >= 0 && hy >= 0) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE; hy = y - radius;
        tile[ty][tx + BLOCK_SIZE + radius] = (hx < input.width && hy >= 0) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x - radius; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx] = (hx >= 0 && hy < input.height) ? input.buffer[hy * input.stride + hx] : 0;
        hx = x + BLOCK_SIZE; hy = y + BLOCK_SIZE;
        tile[ty + BLOCK_SIZE + radius][tx + BLOCK_SIZE + radius] = (hx < input.width && hy < input.height) ? input.buffer[hy * input.stride + hx] : 0;
    }
    
    __syncthreads();
    
    if (x >= input.width || y >= input.height)
        return;
    
    // Dilation
    uint8_t max_val = 0;
    int radius_sq = radius * radius;
    for (int dy = -radius; dy <= radius; ++dy)
    {
        for (int dx = -radius; dx <= radius; ++dx)
        {
            if (dx*dx + dy*dy <= radius_sq)
            {
                uint8_t val = tile[tile_y + dy][tile_x + dx];
                if (val > max_val) max_val = val;
            }
        }
    }
    
    // Threshold directly on dilated value
    hyst_input.buffer[y * hyst_input.stride + x] = (max_val > th_low) ? 255 : 0;
    hyst_output.buffer[y * hyst_output.stride + x] = (max_val > th_high) ? 255 : 0;
}

__global__ void hysteresis_reconstruction_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> output,
    int* has_changed)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t* output_ptr = output.buffer + y * output.stride;
    uint8_t* input_ptr = input.buffer + y * input.stride;
    
    if (output_ptr[x] || !input_ptr[x])
        return;
    
    for (int dy = -1; dy <= 1; ++dy)
    {
        for (int dx = -1; dx <= 1; ++dx)
        {
            if (dx == 0 && dy == 0) continue;
            
            int nx = x + dx;
            int ny = y + dy;
            if (nx >= 0 && nx < input.width && ny >= 0 && ny < input.height)
            {
                if (output.buffer[ny * output.stride + nx])
                {
                    output_ptr[x] = 255;
                    atomicOr(has_changed, 1);
                    return;
                }
            }
        }
    }
}

// Kernel for visualization: input + 0.5 * red * mask
__global__ void visualization_kernel(
    ImageView<rgb8> output_frame,
    ImageView<uint8_t> motion_mask)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= output_frame.width || y >= output_frame.height)
        return;
    
    rgb8* pixel_ptr = (rgb8*)((std::byte*)output_frame.buffer + y * output_frame.stride);
    uint8_t* mask_ptr = motion_mask.buffer + y * motion_mask.stride;
    
    if (mask_ptr[x])
    {
        // Formula: input + 0.5 * red * mask
        // red = (255, 0, 0), so:
        // R = R + 0.5 * 255 = R + 127
        int new_r = pixel_ptr[x].r + 127;
        pixel_ptr[x].r = (uint8_t)min(new_r, 255);
        // G and B stay the same
    }
}

void compute_cu(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp)
{
    static Reservoir* device_reservoirs = nullptr;
    static Image<curandState> device_rng_states;
    static Image<rgb8> device_background;
    static Image<rgb8> device_static_bg;
    static Image<uint8_t> device_motion_mask;
    static Image<uint8_t> device_temp_mask;
    static Image<uint8_t> device_hysteresis_input;
    static Image<uint8_t> device_hysteresis_output;
    static int* device_has_changed = nullptr;
    static bool initialized = false;
    static int frame_count = 0;
    static uint64_t last_sample_time = 0;
    static bool use_static_bg = false;
    static int initialized_width = 0;
    static int initialized_height = 0;
    
    dim3 block(16, 16);
    dim3 grid((in.width + block.x - 1) / block.x, (in.height + block.y - 1) / block.y);
    
    // Initialize on first call or if dimensions changed
    if (!initialized || initialized_width != in.width || initialized_height != in.height)
    {
        int total_pixels = in.width * in.height;
        
        // Free old reservoirs if reinitializing
        if (device_reservoirs != nullptr)
        {
            cudaFree(device_reservoirs);
        }
        
        // Allocate device memory for reservoirs (flat array, no pitch)
        cudaMalloc(&device_reservoirs, total_pixels * RESERVOIR_COUNT * sizeof(Reservoir));
        
        // Initialize reservoirs with w=0
        Reservoir* host_reservoirs = new Reservoir[total_pixels * RESERVOIR_COUNT];
        for (int i = 0; i < total_pixels * RESERVOIR_COUNT; ++i)
        {
            host_reservoirs[i].w = 0;
            host_reservoirs[i].rgb = {0, 0, 0};
            host_reservoirs[i].pad = 0;
        }
        cudaMemcpy(device_reservoirs, host_reservoirs, total_pixels * RESERVOIR_COUNT * sizeof(Reservoir), cudaMemcpyHostToDevice);
        delete[] host_reservoirs;
        
        // Allocate and initialize curand states
        device_rng_states = Image<curandState>(in.width, in.height, true);
        init_curand_kernel<<<grid, block>>>(device_rng_states.buffer, in.width, in.height, 1234);
        cudaDeviceSynchronize();
        
        // Allocate device memory for intermediate buffers
        device_background = Image<rgb8>(in.width, in.height, true);
        device_motion_mask = Image<uint8_t>(in.width, in.height, true);
        device_temp_mask = Image<uint8_t>(in.width, in.height, true);
        device_hysteresis_input = Image<uint8_t>(in.width, in.height, true);
        device_hysteresis_output = Image<uint8_t>(in.width, in.height, true);
        
        if (device_has_changed) cudaFree(device_has_changed);
        cudaMalloc(&device_has_changed, sizeof(int));
        
        // Load static background if provided
        if (params.bg_uri && strlen(params.bg_uri) > 0)
        {
            try {
                Image<rgb8> host_static_bg(params.bg_uri);
                if (host_static_bg.width == in.width && host_static_bg.height == in.height)
                {
                    device_static_bg = Image<rgb8>(in.width, in.height, true);
                    cudaMemcpy2D(device_static_bg.buffer, device_static_bg.stride,
                                host_static_bg.buffer, host_static_bg.stride,
                                in.width * sizeof(rgb8), in.height, cudaMemcpyHostToDevice);
                    use_static_bg = true;
                }
            } catch (...) {
                use_static_bg = false;
            }
        }
        
        initialized = true;
        initialized_width = in.width;
        initialized_height = in.height;
        frame_count = 0;
        last_sample_time = timestamp;
    }
    
    // Check if we should sample this frame
    bool should_sample = false;
    if (!use_static_bg)
    {
        uint64_t time_diff = (timestamp > last_sample_time) ? (timestamp - last_sample_time) : 0;
        uint64_t sampling_interval_ns = params.bg_sampling_rate * 1000000ULL;
        
        if (time_diff >= sampling_interval_ns || frame_count < params.bg_number_frame)
        {
            should_sample = true;
            last_sample_time = timestamp;
        }
    }
    
    // Copy input to device
    Image<rgb8> device_in(in.width, in.height, true);
    cudaMemcpy2D(device_in.buffer, device_in.stride, in.buffer, in.stride,
                 in.width * sizeof(rgb8), in.height, cudaMemcpyHostToDevice);
    
    // Background estimation
    if (use_static_bg)
    {
        cudaMemcpy2D(device_background.buffer, device_background.stride,
                    device_static_bg.buffer, device_static_bg.stride,
                    in.width * sizeof(rgb8), in.height, cudaMemcpyDeviceToDevice);
    }
    else
    {
        background_estimation_kernel<<<grid, block>>>(
            device_in, device_reservoirs, device_rng_states.buffer,
            device_background, should_sample);
    }
    
    // Motion mask calculation
    motion_mask_kernel<<<grid, block>>>(
        device_in, device_background, device_motion_mask);
    
    // Morphological opening: erosion + fused dilation/threshold
    int opening_radius = params.opening_size / 2;
    erosion_kernel<<<grid, block>>>(device_motion_mask, device_temp_mask, opening_radius);
    dilation_threshold_kernel<<<grid, block>>>(
        device_temp_mask, device_hysteresis_input, device_hysteresis_output,
        opening_radius, params.th_low, params.th_high);
    
    int host_has_changed = 1;
    int iterations = 0;
    const int max_iterations = 100;
    
    while (host_has_changed && iterations < max_iterations)
    {
        cudaMemset(device_has_changed, 0, sizeof(int));
        hysteresis_reconstruction_kernel<<<grid, block>>>(
            device_hysteresis_input, device_hysteresis_output, device_has_changed);
        cudaDeviceSynchronize();
        cudaMemcpy(&host_has_changed, device_has_changed, sizeof(int), cudaMemcpyDeviceToHost);
        iterations++;
    }
    
    // Visualization - skip during first frames while background is being estimated
    if (frame_count >= params.bg_number_frame)
    {
        visualization_kernel<<<grid, block>>>(device_in, device_hysteresis_output);
    }
    
    // Copy result back to host
    cudaMemcpy2D(in.buffer, in.stride, device_in.buffer, device_in.stride,
                 in.width * sizeof(rgb8), in.height, cudaMemcpyDeviceToHost);
    
    frame_count++;
}
