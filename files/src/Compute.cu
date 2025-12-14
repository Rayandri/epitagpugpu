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
__global__ void motion_mask_kernel(
    ImageView<rgb8> current_frame,
    ImageView<rgb8> background,
    ImageView<uint8_t> motion_mask,
    int th_low)
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
    
    int diff = dr + dg + db;
    mask_ptr[x] = (diff > th_low) ? 255 : 0;
}

// Kernel for morphological erosion
__global__ void erosion_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> output,
    int radius)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t min_val = 255;
    for (int dy = -radius; dy <= radius; ++dy)
    {
        for (int dx = -radius; dx <= radius; ++dx)
        {
            int nx = x + dx;
            int ny = y + dy;
            if (nx >= 0 && nx < input.width && ny >= 0 && ny < input.height)
            {
                uint8_t val = input.buffer[ny * input.stride + nx];
                if (val < min_val)
                    min_val = val;
            }
        }
    }
    
    output.buffer[y * output.stride + x] = min_val;
}

// Kernel for morphological dilation
__global__ void dilation_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> output,
    int radius)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t max_val = 0;
    for (int dy = -radius; dy <= radius; ++dy)
    {
        for (int dx = -radius; dx <= radius; ++dx)
        {
            int nx = x + dx;
            int ny = y + dy;
            if (nx >= 0 && nx < input.width && ny >= 0 && ny < input.height)
            {
                uint8_t val = input.buffer[ny * input.stride + nx];
                if (val > max_val)
                    max_val = val;
            }
        }
    }
    
    output.buffer[y * output.stride + x] = max_val;
}

// Kernel for hysteresis reconstruction (one iteration)
__global__ void hysteresis_reconstruction_kernel(
    ImageView<uint8_t> input,
    ImageView<uint8_t> marker,
    ImageView<uint8_t> output,
    bool* has_changed)
{
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    
    if (x >= input.width || y >= input.height)
        return;
    
    uint8_t* output_ptr = output.buffer + y * output.stride;
    uint8_t* input_ptr = input.buffer + y * input.stride;
    
    if (output_ptr[x] || !input_ptr[x])  // Already processed or too low
        return;
    
    // Check neighbors
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
                    *has_changed = true;
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
        // input + 0.5 * red * mask => R = R + 127
        int new_r = pixel_ptr[x].r + 127;
        pixel_ptr[x].r = (uint8_t)(new_r > 255 ? 255 : new_r);
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
    static Image<uint8_t> device_marker;
    static Image<uint8_t> device_hysteresis_output;
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
        device_marker = Image<uint8_t>(in.width, in.height, true);
        device_hysteresis_output = Image<uint8_t>(in.width, in.height, true);
        
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
        cudaDeviceSynchronize();
    }
    
    // Motion mask calculation
    motion_mask_kernel<<<grid, block>>>(
        device_in, device_background, device_motion_mask, params.th_low);
    cudaDeviceSynchronize();
    
    // Morphological opening: erosion
    int opening_radius = params.opening_size / 2;
    erosion_kernel<<<grid, block>>>(device_motion_mask, device_temp_mask, opening_radius);
    cudaDeviceSynchronize();
    
    // Morphological opening: dilation
    dilation_kernel<<<grid, block>>>(device_temp_mask, device_motion_mask, opening_radius);
    cudaDeviceSynchronize();
    
    // Initialize markers for hysteresis (pixels > th_high)
    // We'll do this in a simple kernel or reuse motion_mask
    // For now, we'll use a threshold kernel
    // Actually, we can do this in the reconstruction kernel by checking th_high
    
    // Initialize hysteresis output with markers
    // Create a simple kernel to initialize markers and output
    // For simplicity, we'll do threshold in CPU or create another kernel
    // Let's create a threshold kernel
    // Actually, let's do it inline in the reconstruction
    
    // Hysteresis thresholding - initialize output
    // We need a kernel to set markers and initialize output
    // For now, let's use a simple approach: copy motion_mask to marker with threshold
    // We'll create a threshold kernel
    
    // Simplified: use motion_mask directly and do hysteresis in CPU for now
    // Or create proper kernels
    
    // Copy motion_mask to host for hysteresis (temporary solution)
    // Actually, let's implement proper CUDA hysteresis
    
    // Initialize marker and output
    // We need kernels for threshold operations
    // For now, let's do a simplified version
    
    // Copy motion mask back to host, do hysteresis on CPU, then copy back
    // This is not optimal but will work
    Image<uint8_t> host_motion_mask(in.width, in.height, false);
    cudaMemcpy2D(host_motion_mask.buffer, host_motion_mask.stride,
                device_motion_mask.buffer, device_motion_mask.stride,
                in.width * sizeof(uint8_t), in.height, cudaMemcpyDeviceToHost);
    
    // Do hysteresis on CPU (temporary - should be on GPU)
    Image<uint8_t> host_marker(in.width, in.height, false);
    Image<uint8_t> host_output(in.width, in.height, false);
    
    // Initialize markers
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* mask_line = host_motion_mask.buffer + y * host_motion_mask.stride;
        uint8_t* marker_line = host_marker.buffer + y * host_marker.stride;
        uint8_t* output_line = host_output.buffer + y * host_output.stride;
        
        for (int x = 0; x < in.width; ++x)
        {
            marker_line[x] = (mask_line[x] > params.th_high) ? 255 : 0;
            output_line[x] = marker_line[x];
        }
    }
    
    // Reconstruction
    bool has_changed = true;
    int iterations = 0;
    const int max_iterations = in.width * in.height;
    
    while (has_changed && iterations < max_iterations)
    {
        has_changed = false;
        iterations++;
        
        for (int y = 0; y < in.height; ++y)
        {
            uint8_t* output_line = host_output.buffer + y * host_output.stride;
            uint8_t* mask_line = host_motion_mask.buffer + y * host_motion_mask.stride;
            
            for (int x = 0; x < in.width; ++x)
            {
                if (output_line[x] || !mask_line[x])
                    continue;
                
                for (int dy = -1; dy <= 1; ++dy)
                {
                    for (int dx = -1; dx <= 1; ++dx)
                    {
                        if (dx == 0 && dy == 0) continue;
                        
                        int nx = x + dx;
                        int ny = y + dy;
                        if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                        {
                            if (host_output.buffer[ny * host_output.stride + nx])
                            {
                                output_line[x] = 255;
                                has_changed = true;
                                goto next_pixel_cu;
                            }
                        }
                    }
                }
                next_pixel_cu:;
            }
        }
    }
    
    // Copy back to device
    cudaMemcpy2D(device_hysteresis_output.buffer, device_hysteresis_output.stride,
                host_output.buffer, host_output.stride,
                in.width * sizeof(uint8_t), in.height, cudaMemcpyHostToDevice);
    
    // Visualization - skip during first frames while background is being estimated
    if (frame_count >= params.bg_number_frame)
    {
        visualization_kernel<<<grid, block>>>(device_in, device_hysteresis_output);
        cudaDeviceSynchronize();
    }
    
    // Copy result back to host
    cudaMemcpy2D(in.buffer, in.stride, device_in.buffer, device_in.stride,
                 in.width * sizeof(rgb8), in.height, cudaMemcpyDeviceToHost);
    
    frame_count++;
}