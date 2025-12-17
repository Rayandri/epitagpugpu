# Motion Detection - GPGPU Project

Real-time motion detection using GPU acceleration with CUDA.

## Authors

- Rayan Drissi
- Emre Ulusoy
- Marc Guillemot
- Charlie Chaplin

## Requirements

- CUDA Toolkit 12.0+
- GCC 13+ (C++20)
- GStreamer 1.0
- CMake 3.18+

```bash
sudo apt install libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev \
    libgstreamer-plugins-good1.0-dev libgstreamer-plugins-bad1.0-dev
```

## Build

```bash
cd files
./build.sh
```

## Usage

```bash
./build/stream --mode=gpu input.mp4 --output=output.mp4
./build/stream --mode=cpu input.mp4 --output=output.mp4
```

## Pipeline

1. **Background Estimation** - Weighted Reservoir Sampling (k=4)
2. **Motion Mask** - RGB difference with threshold
3. **Morphological Filtering** - Opening (erosion + dilation)
4. **Hysteresis** - Double thresholding with iterative reconstruction
5. **Visualization** - Red overlay on detected motion

## Project Structure

```
├── files/
│   ├── src/
│   │   ├── Compute.cu      # CUDA kernels
│   │   ├── Compute.cpp     # CPU implementation
│   │   ├── Compute.hpp     # Shared structures
│   │   ├── stream.cpp      # Main entry point
│   │   ├── gstfilter.c     # GStreamer filter
│   │   └── Image.hpp       # Image handling
│   ├── samples/            # Test videos
│   └── CMakeLists.txt
├── benchmarks/
│   ├── benchmark.sh        # Full benchmark (CPU + GPU)
│   └── benchmark_gpu.sh    # GPU-only benchmark
├── latex/
│   ├── rapport.tex         # Project report
│   ├── rayanlib.sty        # Custom LaTeX library
│   └── Makefile
└── BENCHMARKS.md           # Performance results
```

## Performance

| Video | CPU (s) | GPU (s) | Speedup |
|-------|---------|---------|---------|
| ACET.mp4 | 13.19 | 5.32 | 2.5× |
| lil_clown_studio.mp4 | 40.62 | 7.96 | 5.1× |
| 20895-313083562_large.mp4 | 164.57 | 20.99 | 7.8× |

**Average speedup: 5.8×**

## Version History

- **v1.0** - Initial GPU implementation
- **v1.1** - Hysteresis fully on GPU (+375%)
- **v1.5** - Final optimized version

## License

EPITA - ING3 GPGPU 2025

