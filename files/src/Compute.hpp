#pragma once

#include <stdint.h>

#ifdef __cplusplus
    // Include Image.hpp for rgb8 definition (C++ only)
    #include "Image.hpp"
    
    // Reservoir structure for weighted reservoir sampling
    struct Reservoir {
        rgb8 rgb;      // 3 bytes
        uint8_t pad;   // 1 byte padding to align float on 4-byte boundary
        float w;       // 4 bytes weight
    };
    
    extern "C" {
#endif

// Execution parameters taken from the command line
typedef enum {
    CPU,
    GPU
} e_device_t;

// Constants for background estimation
#define RESERVOIR_COUNT 4  // Number of reservoirs per pixel
#define RGB_DIFF_THRESHOLD 30  // Threshold for RGB difference matching
#define MAX_WEIGHTS 1000  // Maximum weight cap

// Parameters structure
typedef struct  {    
    e_device_t device;
    // Algorithm parameters
    const char* bg_uri;  // Background image URI (empty string = dynamic estimation)
    int opening_size;    // Morphological opening size
    int th_low;          // Low threshold for hysteresis
    int th_high;         // High threshold for hysteresis
    int bg_sampling_rate; // Sampling rate in milliseconds
    int bg_number_frame; // Number of frames for background estimation
} Parameters;

/// Global state initialization
/// This function is called once before any other cpt_* function at the beginning of the program
void cpt_init(Parameters* params);

/// Function called by gstreamer to process the incoming frame
/// timestamp is in nanoseconds (uint64_t)
void cpt_process_frame(uint8_t* buffer, int width, int height, int stride, uint64_t timestamp);

/// Update parameters (called from GStreamer when properties change)
void cpt_update_params(Parameters* params);
    

#ifdef __cplusplus
    }
#endif