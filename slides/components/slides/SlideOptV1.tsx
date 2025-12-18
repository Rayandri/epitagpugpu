"use client";

import { motion } from "framer-motion";

export function SlideOptV1() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        v1.0 → v1.1 : Hysteresis GPU
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-[#76B900] font-semibold"
      >
        L&apos;optimisation qui change tout : +375%
      </motion.div>

      <div className="grid grid-cols-2 gap-8 w-full mt-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-red-400 mb-4">Avant (v1.0)</h3>
          <div className="space-y-3 text-white/80">
            <div className="font-mono text-sm bg-black/30 p-3 rounded-lg">
              <div className="text-red-400">// Pour chaque frame :</div>
              <div>cudaMemcpy2D(GPU → CPU)</div>
              <div className="text-white/50">// 6.2 Mo</div>
              <div className="mt-2">while (!converge) {"{"}</div>
              <div className="pl-4">CPU: parcourir pixels</div>
              <div className="pl-4">CPU: propager voisins</div>
              <div>{"}"}</div>
              <div className="mt-2">cudaMemcpy2D(CPU → GPU)</div>
              <div className="text-white/50">// 6.2 Mo</div>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-2xl">→</span>
              <span>12.4 Mo transfert × 100 iterations</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#76B900]/10 border border-[#76B900]/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-[#76B900] mb-4">Apres (v1.1)</h3>
          <div className="space-y-3 text-white/80">
            <div className="font-mono text-sm bg-black/30 p-3 rounded-lg">
              <div className="text-[#76B900]">// Tout sur GPU :</div>
              <div>int* device_has_changed;</div>
              <div className="mt-2">while (has_changed) {"{"}</div>
              <div className="pl-4">cudaMemset(flag, 0)</div>
              <div className="pl-4">kernel{"<<<"}...{">>>"} (atomicOr)</div>
              <div className="pl-4">cudaMemcpy(flag)</div>
              <div className="pl-4 text-white/50">// 4 bytes seulement!</div>
              <div>{"}"}</div>
            </div>
            <div className="flex items-center gap-2 text-[#76B900]">
              <span className="text-2xl">→</span>
              <span>4 bytes × 100 iterations = 400 bytes</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 grid grid-cols-3 gap-6 w-full"
      >
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className="text-3xl font-bold text-red-400">1.24 Go</div>
          <div className="text-white/50 text-sm">Transfert v1.0 (100 iter)</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl text-center">
          <div className="text-3xl font-bold text-[#76B900]">400 bytes</div>
          <div className="text-white/50 text-sm">Transfert v1.1 (100 iter)</div>
        </div>
        <div className="p-4 bg-[#76B900]/20 rounded-xl text-center">
          <div className="text-3xl font-bold text-[#76B900]">×3,100,000</div>
          <div className="text-white/50 text-sm">Reduction transfert</div>
        </div>
      </motion.div>
    </div>
  );
}

