#!/bin/bash
set -e

cd "$(dirname "$0")"

VIDEOS=(
    "samples/ACET.mp4"
    "samples/lil_clown_studio.mp4"
    "samples/1023-142621257_large.mp4"
    "samples/27999-366978301_large.mp4"
    "samples/3630-172488409_large.mp4"
    "samples/6387-191695740_large.mp4"
    "samples/20895-313083562_large.mp4"
)
OUTPUT_DIR="../tmp/benchmark_output"
RESULTS_FILE="benchmark_gpu_results.txt"

mkdir -p "$OUTPUT_DIR"

echo "=== BENCHMARK GPU ONLY ===" | tee "$RESULTS_FILE"
echo "Date: $(date)" | tee -a "$RESULTS_FILE"
echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

for video in "${VIDEOS[@]}"; do
    video_name=$(basename "$video")
    echo "--- $video_name ---" | tee -a "$RESULTS_FILE"
    
    GPU_START=$(date +%s.%N)
    ./build/stream --mode=gpu "$video" --output="$OUTPUT_DIR/gpu_$video_name" 2>/dev/null
    GPU_END=$(date +%s.%N)
    GPU_TIME=$(echo "$GPU_END - $GPU_START" | bc)
    echo "[GPU] ${GPU_TIME}s" | tee -a "$RESULTS_FILE"
    echo "" | tee -a "$RESULTS_FILE"
done

echo "=== COMPLETE ===" | tee -a "$RESULTS_FILE"

