#include "Compute.hpp"
#include "Image.hpp"

#include <vector>
#include <cstdlib>
#include <cstring>
#include <algorithm>
#include <cmath>

/// Your cpp version of the algorithm
void compute_cpp(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp);

/// Your CUDA version of the algorithm
void compute_cu(ImageView<rgb8> in, const Parameters& params, uint64_t timestamp);

// Helper function to find matching reservoir
static int find_matching_reservoir_cpp(const rgb8& pixel, const Reservoir* reservoirs)
{
    for (int i = 0; i < RESERVOIR_COUNT; ++i)
    {
        if (reservoirs[i].w > 0)
        {
            int dr = abs((int)pixel.r - (int)reservoirs[i].rgb.r);
            int dg = abs((int)pixel.g - (int)reservoirs[i].rgb.g);
            int db = abs((int)pixel.b - (int)reservoirs[i].rgb.b);
            
            if (dr < RGB_DIFF_THRESHOLD && dg < RGB_DIFF_THRESHOLD && db < RGB_DIFF_THRESHOLD)
            {
                return i;
            }
        }
        else
        {
            return i;
        }
    }
    return -1;
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
        
        if (!reservoirs) return;
        
        for (int i = 0; i < total_pixels * RESERVOIR_COUNT; ++i)
        {
            reservoirs[i].w = 0;
            reservoirs[i].rgb = {0, 0, 0};
            reservoirs[i].pad = 0;
        }
        
        if (params.bg_uri && strlen(params.bg_uri) > 0)
        {
            try {
                static_bg = Image<rgb8>(params.bg_uri);
                if (static_bg.width == in.width && static_bg.height == in.height)
                {
                    use_static_bg = true;
                }
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
    
    if (!reservoirs) return;

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
    
    // Create motion mask and background
    Image<uint8_t> motion_mask(in.width, in.height, false);
    Image<rgb8> background(in.width, in.height, false);
    
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
            
            // Background estimation
            if (!use_static_bg && should_sample)
            {
                int m_idx = find_matching_reservoir_cpp(current_pixel, pixel_reservoirs);
                
                if (m_idx != -1 && pixel_reservoirs[m_idx].w > 0)
                {
                    pixel_reservoirs[m_idx].w += 1.0f;
                    float w = pixel_reservoirs[m_idx].w;
                    pixel_reservoirs[m_idx].rgb.r = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.r + current_pixel.r) / w);
                    pixel_reservoirs[m_idx].rgb.g = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.g + current_pixel.g) / w);
                    pixel_reservoirs[m_idx].rgb.b = (uint8_t)(((w - 1) * pixel_reservoirs[m_idx].rgb.b + current_pixel.b) / w);
                }
                else if (m_idx != -1 && pixel_reservoirs[m_idx].w == 0)
                {
                    pixel_reservoirs[m_idx].rgb = current_pixel;
                    pixel_reservoirs[m_idx].w = 1.0f;
                }
                else
                {
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
                    
                    float rand_val = (float)rand() / (float)RAND_MAX;
                    if (total_weights > 0 && rand_val * total_weights >= min_weight)
                    {
                        pixel_reservoirs[min_idx].rgb = current_pixel;
                        pixel_reservoirs[min_idx].w = 1.0f;
                    }
                }
                
                for (int i = 0; i < RESERVOIR_COUNT; ++i)
                {
                    if (pixel_reservoirs[i].w > MAX_WEIGHTS)
                        pixel_reservoirs[i].w = MAX_WEIGHTS;
                }
            }
            
            // Select background
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
            {
                bg_line[x] = ((rgb8*)((std::byte*)static_bg.buffer + y * static_bg.stride))[x];
            }
            else
            {
                bg_line[x] = pixel_reservoirs[bg_idx].rgb;
            }
            
            // Calculate motion mask
            int dr = abs((int)current_pixel.r - (int)bg_line[x].r);
            int dg = abs((int)current_pixel.g - (int)bg_line[x].g);
            int db = abs((int)current_pixel.b - (int)bg_line[x].b);
            
            int diff = dr + dg + db;
            mask_line[x] = (diff > params.th_low) ? 255 : 0;
        }
    }
    
    // Morphological opening: erosion followed by dilation
    Image<uint8_t> temp_mask(in.width, in.height, false);
    int opening_radius = params.opening_size / 2;
    
    // Erosion
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
                    int nx = x + dx;
                    int ny = y + dy;
                    if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                    {
                        uint8_t val = motion_mask.buffer[ny * motion_mask.stride + nx];
                        if (val < min_val)
                            min_val = val;
                    }
                }
            }
            temp_line[x] = min_val;
        }
    }
    
    // Dilation
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
                    int nx = x + dx;
                    int ny = y + dy;
                    if (nx >= 0 && nx < in.width && ny >= 0 && ny < in.height)
                    {
                        uint8_t val = temp_mask.buffer[ny * temp_mask.stride + nx];
                        if (val > max_val)
                            max_val = val;
                    }
                }
            }
            mask_line[x] = max_val;
        }
    }
    
    // Hysteresis thresholding
    Image<uint8_t> marker(in.width, in.height, false);
    Image<uint8_t> output(in.width, in.height, false);
    
    // Initialize markers
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* mask_line = motion_mask.buffer + y * motion_mask.stride;
        uint8_t* marker_line = marker.buffer + y * marker.stride;
        
        for (int x = 0; x < in.width; ++x)
        {
            marker_line[x] = (mask_line[x] > params.th_high) ? 255 : 0;
        }
    }
    
    // Initialize output with markers
    for (int y = 0; y < in.height; ++y)
    {
        uint8_t* marker_line = marker.buffer + y * marker.stride;
        uint8_t* output_line = output.buffer + y * output.stride;
        
        for (int x = 0; x < in.width; ++x)
        {
            output_line[x] = marker_line[x];
        }
    }
    
    // Reconstruction: propagate markers
    bool has_changed = true;
    int iterations = 0;
    const int max_iterations = 100;  // Limit for performance
    
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
    
    // Visualization: input + 0.5 * red * mask
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
                    // red = (255, 0, 0), mask = 1 for active pixels
                    // R = R + 0.5 * 255 = R + 127
                    int new_r = lineptr[x].r + 127;
                    lineptr[x].r = (uint8_t)(new_r > 255 ? 255 : new_r);
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
    {
      g_params = *params;
    }
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
    if (!buffer) return;
    
    auto img = ImageView<rgb8>{(rgb8*)buffer, width, height, stride};
    if (g_params.device == e_device_t::CPU)
    {
      compute_cpp(img, g_params, timestamp);
    }
    else if (g_params.device == e_device_t::GPU)
    {
      compute_cu(img, g_params, timestamp);
    }
  }

}
