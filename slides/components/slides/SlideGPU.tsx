"use client";

import { motion } from "framer-motion";

export function SlideGPU() {
  const threads = Array.from({ length: 64 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Architecture GPU
      </motion.h2>

      <div className="flex gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="text-[#76B900] font-bold mb-4 text-xl">Thread Grid (8×8)</div>
          <div className="grid grid-cols-8 gap-1 p-4 bg-white/5 rounded-xl">
            {threads.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.01 }}
                className="w-6 h-6 rounded-sm bg-[#76B900] hover:bg-[#8ed000] transition-colors cursor-pointer"
                style={{ opacity: 0.3 + (i % 8) * 0.1 }}
              />
            ))}
          </div>
          <div className="text-white/50 text-sm mt-2">1 thread = 1 pixel</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4"
        >
          <h3 className="text-2xl font-bold text-[#76B900]">Kernels CUDA</h3>
          {[
            "background_estimation_kernel",
            "motion_mask_kernel",
            "erosion_kernel",
            "dilation_kernel",
            "hysteresis_reconstruction_kernel",
            "visualization_kernel",
          ].map((kernel, i) => (
            <motion.div
              key={kernel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="code-block px-4 py-2 text-sm font-mono"
            >
              <span className="text-[#76B900]">__global__</span>{" "}
              <span className="text-white">{kernel}</span>
              <span className="text-white/50">()</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex gap-8 mt-4"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-[#76B900]">RTX 5060</div>
          <div className="text-white/50">Blackwell</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">8 Go</div>
          <div className="text-white/50">VRAM GDDR7</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">CUDA 13</div>
          <div className="text-white/50">Compute 12.0</div>
        </div>
      </motion.div>
    </div>
  );
}

