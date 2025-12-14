#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Cleaning build directory..."
rm -rf build

echo "Configuring CMake..."
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release

echo "Building..."
cmake --build build --parallel

echo "Build complete! Executable: ./build/stream"

