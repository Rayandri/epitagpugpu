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
RESULTS_FILE="benchmark_results.txt"

mkdir -p "$OUTPUT_DIR"

echo "=== BENCHMARK IRGPU ===" | tee "$RESULTS_FILE"
echo "Date: $(date)" | tee -a "$RESULTS_FILE"
echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

for video in "${VIDEOS[@]}"; do
    video_name=$(basename "$video")
    echo "--- Testing: $video_name ---" | tee -a "$RESULTS_FILE"
    
    echo "[CPU] Processing..." | tee -a "$RESULTS_FILE"
    CPU_START=$(date +%s.%N)
    ./build/stream --mode=cpu "$video" --output="$OUTPUT_DIR/cpu_$video_name" 2>/dev/null
    CPU_END=$(date +%s.%N)
    CPU_TIME=$(echo "$CPU_END - $CPU_START" | bc)
    echo "[CPU] Time: ${CPU_TIME}s" | tee -a "$RESULTS_FILE"
    
    echo "[GPU] Processing..." | tee -a "$RESULTS_FILE"
    GPU_START=$(date +%s.%N)
    ./build/stream --mode=gpu "$video" --output="$OUTPUT_DIR/gpu_$video_name" 2>/dev/null
    GPU_END=$(date +%s.%N)
    GPU_TIME=$(echo "$GPU_END - $GPU_START" | bc)
    echo "[GPU] Time: ${GPU_TIME}s" | tee -a "$RESULTS_FILE"
    
    SPEEDUP=$(echo "scale=2; $CPU_TIME / $GPU_TIME" | bc)
    echo "[SPEEDUP] ${SPEEDUP}x" | tee -a "$RESULTS_FILE"
    echo "" | tee -a "$RESULTS_FILE"
done

echo "=== BENCHMARK COMPLETE ===" | tee -a "$RESULTS_FILE"
echo "Results saved to: $RESULTS_FILE"

