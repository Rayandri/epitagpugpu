#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

VIDEOS=(
    "$PROJECT_DIR/files/samples/ACET.mp4"
    "$PROJECT_DIR/files/samples/lil_clown_studio.mp4"
    "$PROJECT_DIR/files/samples/1023-142621257_large.mp4"
    "$PROJECT_DIR/files/samples/27999-366978301_large.mp4"
    "$PROJECT_DIR/files/samples/3630-172488409_large.mp4"
    "$PROJECT_DIR/files/samples/6387-191695740_large.mp4"
    "$PROJECT_DIR/files/samples/20895-313083562_large.mp4"
)
OUTPUT_DIR="$PROJECT_DIR/tmp/benchmark_output"
RESULTS_FILE="$SCRIPT_DIR/benchmark_gpu_results.txt"
STREAM_EXEC="$PROJECT_DIR/files/build/stream"

mkdir -p "$OUTPUT_DIR"

echo "=== BENCHMARK GPU ONLY ===" | tee "$RESULTS_FILE"
echo "Date: $(date)" | tee -a "$RESULTS_FILE"
echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

for video in "${VIDEOS[@]}"; do
    video_name=$(basename "$video")
    echo "--- $video_name ---" | tee -a "$RESULTS_FILE"
    
    GPU_START=$(date +%s.%N)
    "$STREAM_EXEC" --mode=gpu "$video" --output="$OUTPUT_DIR/gpu_$video_name" 2>/dev/null
    GPU_END=$(date +%s.%N)
    GPU_TIME=$(echo "$GPU_END - $GPU_START" | bc)
    echo "[GPU] ${GPU_TIME}s" | tee -a "$RESULTS_FILE"
    echo "" | tee -a "$RESULTS_FILE"
done

echo "=== COMPLETE ===" | tee -a "$RESULTS_FILE"

