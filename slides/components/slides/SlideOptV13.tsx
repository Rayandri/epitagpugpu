"use client";

import { motion } from "framer-motion";

export function SlideOptV13() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        v1.2 → v1.3 : Shared Memory
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        Resultat : -2.9% (echec)
      </motion.div>

      <div className="grid grid-cols-2 gap-8 w-full mt-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#76B900]/10 border border-[#76B900]/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-[#76B900] mb-4">Idee</h3>
          <p className="text-white/80 text-lg mb-4">
            Utiliser la shared memory (5 cycles) au lieu de la global memory (400 cycles) pour l&apos;erosion/dilatation.
          </p>
          <div className="font-mono text-sm bg-black/30 p-4 rounded-lg">
            <div className="text-[#76B900]">__shared__ uint8_t tile[22][22];</div>
            <div className="mt-2 text-white/50">// Charger bloc + halo</div>
            <div>tile[ty][tx] = global[y][x];</div>
            <div className="text-orange-400">__syncthreads();</div>
            <div className="mt-2 text-white/50">// Lire depuis shared</div>
            <div>for (dy = -3; dy {"<"}= 3; dy++)</div>
            <div className="pl-4">min_val = min(tile[ty+dy][tx+dx]);</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-red-400 mb-4">Pourquoi l&apos;echec</h3>
          <div className="space-y-4 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">1.</span>
              <div>
                <p><span className="text-orange-400 font-bold">Rayon trop petit (3px)</span></p>
                <p className="text-sm text-white/60">Bloc 16×16 → charge 22×22 → ratio utile 53%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">2.</span>
              <div>
                <p><span className="text-orange-400 font-bold">Cache L2 deja efficace</span></p>
                <p className="text-sm text-white/60">RTX 5060 : 8 Mo L2, image : 2 Mo → tout tient!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">3.</span>
              <div>
                <p><span className="text-orange-400 font-bold">Overhead __syncthreads()</span></p>
                <p className="text-sm text-white/60">~20 cycles par sync, pas rentable pour petit rayon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 grid grid-cols-2 gap-6 w-full"
      >
        <div className="p-4 bg-red-500/10 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-400">Rayon 3px</div>
          <div className="text-white/50">Shared memory inutile</div>
        </div>
        <div className="p-4 bg-[#76B900]/10 rounded-xl text-center">
          <div className="text-2xl font-bold text-[#76B900]">Rayon 10px+</div>
          <div className="text-white/50">Shared memory efficace</div>
        </div>
      </motion.div>
    </div>
  );
}

