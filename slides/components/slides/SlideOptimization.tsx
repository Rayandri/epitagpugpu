"use client";

import { motion } from "framer-motion";

export function SlideOptimization() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Optimisation Clé
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-[#76B900] font-semibold"
      >
        Hystérésis CPU → GPU
      </motion.div>

      <div className="grid grid-cols-2 gap-8 w-full mt-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-red-400 mb-4">❌ Avant (v1.0)</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400">→</span> cudaMemcpy2D (GPU → CPU)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">→</span> Boucle CPU (100 itérations)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">→</span> cudaMemcpy2D (CPU → GPU)
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-500/20 rounded text-center">
            <span className="text-red-400 font-bold">~60s</span>
            <span className="text-white/50 text-sm block">pour 20895.mp4</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#76B900]/10 border border-[#76B900]/30 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-[#76B900] mb-4">✓ Après (v1.1)</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#76B900]">→</span> Kernel itératif GPU
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#76B900]">→</span> atomicOr pour convergence
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#76B900]">→</span> Zéro transfert mémoire
            </div>
          </div>
          <div className="mt-4 p-3 bg-[#76B900]/20 rounded text-center">
            <span className="text-[#76B900] font-bold">~21s</span>
            <span className="text-white/50 text-sm block">pour 20895.mp4</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-center"
      >
        <span className="text-6xl font-bold text-[#76B900]">+375%</span>
        <span className="text-white/50 block mt-2">d&apos;amélioration moyenne</span>
      </motion.div>
    </div>
  );
}

