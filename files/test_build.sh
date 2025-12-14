#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "========================================="
echo "Building project..."
echo "========================================="
rm -rf build
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --parallel

if [ ! -f "./build/stream" ]; then
    echo "ERROR: Build failed - stream executable not found"
    exit 1
fi

echo ""
echo "========================================="
echo "Build successful!"
echo "========================================="
echo ""

# Test video
TEST_VIDEO="samples/ACET.mp4"
if [ ! -f "$TEST_VIDEO" ]; then
    echo "Warning: Test video $TEST_VIDEO not found, using first available video"
    TEST_VIDEO=$(ls samples/*.mp4 2>/dev/null | head -1)
fi

if [ -z "$TEST_VIDEO" ] || [ ! -f "$TEST_VIDEO" ]; then
    echo "ERROR: No test video found in samples/"
    exit 1
fi

echo "Using test video: $TEST_VIDEO"
echo ""

echo "========================================="
echo "Testing CPU mode..."
echo "========================================="
./build/stream --mode=cpu "$TEST_VIDEO" --output=output_cpu.mp4 2>&1 | head -20
echo "CPU test completed. Output: output_cpu.mp4"
echo ""

echo "========================================="
echo "Testing CUDA mode..."
echo "========================================="
./build/stream --mode=gpu "$TEST_VIDEO" --output=output_cuda.mp4 2>&1 | head -20
echo "CUDA test completed. Output: output_cuda.mp4"
echo ""

echo "========================================="
echo "All tests completed!"
echo "========================================="

