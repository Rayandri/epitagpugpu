#include "Compute.hpp"
#include "Image.hpp"

#include <vector>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include <cmath>
#include <iostream>

/// Your cpp version of the algorithm
void compute_cpp(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp);

/// Your CUDA version of the algorithm
void compute_cu(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp);


// Helper function to find matching reservoir
// Returns: index of matching reservoir, or empty slot, or -1 if none
static int find_matching_reservoir_cpp(const rgb8& pixel, const Reservoir* reservoirs)
{
    for (int i = 0; i < RESERVOIR_COUNT; ++i)
    {
        if (reservoirs[i].w > 0)
        {
            // Check if pixel matches this reservoir
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
            return i;  // Found empty slot
        }
    }
    return -1;  // No match and no empty slot
}

// CPU version of background estimation and motion detection
void compute_cpp(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp)
{
    static Reservoir* reservoirs = nullptr;
    static Image<rgb8> static_bg;
    static bool initialized = false;
    static int frame_count = 0;
    static uint64_t last_sample_time = 0;
    static bool use_static_bg = false;
    static int last_width = 0;
    static int last_height = 0;
    
    // Initialize on first call or if dimensions changed
    if (!initialized || in.width != last_width || in.height != last_height)
    {
        int total_pixels = in.width * in.height;
        
        if (reservoirs) delete[] reservoirs;
        reservoirs = new Reservoir[total_pixels * RESERVOIR_COUNT];
        
        // Initialize all reservoirs
        for (int i = 0; i < total_pixels * RESERVOIR_COUNT; ++i)
        {
            reservoirs[i].w = 0;
            reservoirs[i].rgb = {0, 0, 0};
            reservoirs[i].pad = 0;
        }
        
        // Load static background if provided
        if (params.bg_uri && strlen(params.bg_uri) > 0)
        {
            try {
                static_bg = Image<rgb8>(params.bg_uri);
                if (static_bg.width == in.width && static_bg.height == in.height)
                    use_static_bg = true;
            } catch (...) {
                use_static_bg = false;
            }
        }
        
        initialized = true;
        frame_count = 0;
        last_sample_time = timestamp;
        last_width = in.width;
        last_height = in.height;
    }
    
    // Check if we should sample this frame for background estimation
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
    
    // Create temporary buffers
    // Motion mask is a SCORE (0-255), not binary!
    Image<uint8_t> motion_mask(in.width, in.height, false);
    Image<rgb8> background(in.width, in.height, false);
    
    // ===== STEP 0: Background Estimation Process =====
    // Process each pixel
    for (int y = 0; y < in.height; ++y)
    {
        rgb8* lineptr = (rgb8*)((std::byte*)in.buffer + y * in.stride);
        uint8_t* mask_line = motion_mask.buffer + y * motion_mask.stride;
        rgb8* bg_line = (rgb8*)((std::byte*)background.buffer + y * background.stride);
        
        for (int x = 0; x < in.width; ++x)
        {
            int pixel_idx = y * in.width + x;
            Reservoir* pixel_reservoirs = &reservoirs[pixel_idx * RESERVOIR_COUNT];
            rgb8 current_pixel = lineptr[x];
            
            // Background estimation (weighted reservoir sampling)
            if (!use_static_bg && should_sample)
            {
                int m_idx = find_matching_reservoir_cpp(current_pixel, pixel_reservoirs);
                
                if (m_idx != -1 && pixel_reservoirs[m_idx].w > 0)
                {
                    // Matching reservoir found - update it
                    pixel_reservoirs[m_idx].w += 1.0f;
                    float w = pixel_reservoirs[m_idx].w;
                    // Running average: new_avg = ((w-1) * old_avg + new_value) / w
                    pixel_reservoirs[m_idx].rgb.r = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.r + current_pixel.r) / w);
                    pixel_reservoirs[m_idx].rgb.g = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.g + current_pixel.g) / w);
                    pixel_reservoirs[m_idx].rgb.b = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.b + current_pixel.b) / w);
                }
                else if (m_idx != -1 && pixel_reservoirs[m_idx].w == 0)
                {
                    // Empty slot found - initialize it
                    pixel_reservoirs[m_idx].rgb = current_pixel;
                    pixel_reservoirs[m_idx].w = 1.0f;
                }
                else
                {
                    // No match and no empty slot - weighted reservoir replacement
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
                    
                    // Probabilistic replacement
                    float rand_val = (float)rand() / (float)RAND_MAX;
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
            
            if (use_static_bg)
                bg_line[x] = ((rgb8*)((std::byte*)static_bg.buffer + y * static_bg.stride))[x];
            else
                bg_line[x] = pixel_reservoirs[bg_idx].rgb;
            
            // ===== STEP 1: Motion mask calculation =====
            // This is a SCORE >= 0, not binary!
            int dr = abs((int)current_pixel.r - (int)bg_line[x].r);
            int dg = abs((int)current_pixel.g - (int)bg_line[x].g);
            int db = abs((int)current_pixel.b - (int)bg_line[x].b);
            int diff = dr + dg + db;
            // Clamp to 255
            mask_line[x] = (uint8_t)std::min(diff, 255);
        }
    }
    
    // ===== STEP 2: Noise removal - Morphological opening =====
    // Erosion followed by dilation with disk of radius opening_size/2
    Image<uint8_t> temp_mask(in.width, in.height, false);
    int opening_radius = params.opening_size / 2;
    
    // Erosion: min in neighborhood
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* temp_line = temp_mask.buffer + y * temp_mask.stride;
        for (int x = 0; x < in.width; ++x)
        {
            uint8_t min_val = 255;
            for (int dy = -opening_radius; dy <= opening_radius; ++dy)
            {
                for (int dx = -opening_radius; dx <= opening_radius; ++dx)
                {
                    // Use circular structuring element (disk)
                    if (dx*dx + dy*dy <= opening_radius*opening_radius)
                    {
                        int nx = x + dx;
                        int ny = y + dy;
                        if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                        {
                            uint8_t val = motion_mask.buffer[ny * motion_mask.stride + nx];
                            if (val < min_val) min_val = val;
                        }
                    }
                }
            }
            temp_line[x] = min_val;
        }
    }
    
    // Dilation: max in neighborhood
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* mask_line = motion_mask.buffer + y * motion_mask.stride;
        for (int x = 0; x < in.width; ++x)
        {
            uint8_t max_val = 0;
            for (int dy = -opening_radius; dy <= opening_radius; ++dy)
            {
                for (int dx = -opening_radius; dx <= opening_radius; ++dx)
                {
                    // Use circular structuring element (disk)
                    if (dx*dx + dy*dy <= opening_radius*opening_radius)
                    {
                        int nx = x + dx;
                        int ny = y + dy;
                        if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                        {
                            uint8_t val = temp_mask.buffer[ny * temp_mask.stride + nx];
                            if (val > max_val) max_val = val;
                        }
                    }
                }
            }
            mask_line[x] = max_val;
        }
    }
    
    // ===== STEP 3: Hysteresis thresholding =====
    // marker = pixels > th_high
    // input = pixels > th_low
    // Propagate markers to connected pixels that are > th_low
    Image<uint8_t> output(in.width, in.height, false);
    
    // Initialize output with markers (pixels > th_high)
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* mask_line = motion_mask.buffer + y * motion_mask.stride;
        uint8_t* output_line = output.buffer + y * output.stride;
        for (int x = 0; x < in.width; ++x)
        {
            output_line[x] = (mask_line[x] > params.th_high) ? 255 : 0;
        }
    }
    
    // Reconstruction: propagate markers to pixels > th_low
    bool has_changed = true;
    int iterations = 0;
    const int max_iterations = 100;
    
    while (has_changed && iterations < max_iterations)
    {
        has_changed = false;
        iterations++;
        
        for (int y = 0; y < in.height; ++y)
        {
            uint8_t* output_line = output.buffer + y * output.stride;
            uint8_t* mask_line = motion_mask.buffer + y * motion_mask.stride;
            
            for (int x = 0; x < in.width; ++x)
            {
                // Skip if already activated or below low threshold
                if (output_line[x] || mask_line[x] <= params.th_low)
                    continue;
                
                // Check if any neighbor is activated
                for (int dy = -1; dy <= 1; ++dy)
                {
                    for (int dx = -1; dx <= 1; ++dx)
                    {
                        if (dx == 0 && dy == 0) continue;
                        int nx = x + dx;
                        int ny = y + dy;
                        if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                        {
                            if (output.buffer[ny * output.stride + nx])
                            {
                                output_line[x] = 255;
                                has_changed = true;
                                goto next_pixel;
                            }
                        }
                    }
                }
                next_pixel:;
            }
        }
    }
    
    // ===== STEP 4: Masking - Visualization =====
    // Formula: output = input + 0.5 * red * mask
    // Skip during first frames while background is being estimated
    if (frame_count >= params.bg_number_frame)
    {
        for (int y = 0; y < in.height; ++y)
        {
            rgb8* lineptr = (rgb8*)((std::byte*)in.buffer + y * in.stride);
            uint8_t* output_line = output.buffer + y * output.stride;
            
            for (int x = 0; x < in.width; ++x)
            {
                if (output_line[x])
                {
                    // input + 0.5 * red * mask
                    // red = (255, 0, 0), so:
                    // R = R + 0.5 * 255 = R + 127.5
                    // G = G + 0.5 * 0 = G
                    // B = B + 0.5 * 0 = B
                    int new_r = lineptr[x].r + 127;
                    lineptr[x].r = (uint8_t)std::min(new_r, 255);
                    // G and B stay the same
                }
            }
        }
    }
    
    frame_count++;
}


extern "C" {

  static Parameters g_params;

  void cpt_init(Parameters* params)
  {
    if (params)
      g_params = *params;
    else
    {
      g_params.device = CPU;
      g_params.bg_uri = "";
      g_params.opening_size = 3;
      g_params.th_low = 30;
      g_params.th_high = 60;
      g_params.bg_sampling_rate = 500;
      g_params.bg_number_frame = 10;
    }
  }

  void cpt_update_params(Parameters* params)
  {
    if (params)
      g_params = *params;
  }

  void cpt_process_frame(uint8_t* buffer, int width, int height, int stride, uint64_t timestamp)
  {
    auto img = ImageView<rgb8>{(rgb8*)buffer, width, height, stride};
    if (g_params.device == e_device_t::CPU)
      compute_cpp(img, g_params, timestamp);
    else if (g_params.device == e_device_t::GPU)
      compute_cu(img, g_params, timestamp);
  }

}
