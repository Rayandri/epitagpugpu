"use client";

import { motion } from "framer-motion";

export function SlideOptV12() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        v1.1 → v1.2 : cudaDeviceSynchronize()
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        Resultat : -3.4% (echec)
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
            Supprimer les synchronisations explicites entre kernels pour laisser le GPU enchainer sans attendre.
          </p>
          <div className="font-mono text-sm bg-black/30 p-4 rounded-lg">
            <div className="text-white/50">// Avant (v1.1)</div>
            <div>kernel_A{"<<<"}...{">>>"};()</div>
            <div className="text-red-400">cudaDeviceSynchronize();</div>
            <div>kernel_B{"<<<"}...{">>>"};()</div>
            <div className="text-red-400">cudaDeviceSynchronize();</div>
            <div className="mt-4 text-white/50">// Apres (v1.2)</div>
            <div>kernel_A{"<<<"}...{">>>"};()</div>
            <div>kernel_B{"<<<"}...{">>>"};()</div>
            <div className="text-[#76B900]">// Pas de sync!</div>
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
              <p>Le driver CUDA est intelligent : dans le <span className="text-[#76B900] font-bold">meme stream</span>, les kernels s&apos;executent deja dans l&apos;ordre.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">2.</span>
              <p>Le driver fait automatiquement le <span className="text-[#76B900] font-bold">pipelining</span> : pendant que kernel A finit, kernel B est prepare.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">3.</span>
              <p>Les Synchronize() explicites n&apos;ajoutaient <span className="text-orange-400 font-bold">aucun overhead mesurable</span>.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center"
      >
        <p className="text-white/70 text-lg">
          <span className="text-orange-400 font-bold">Lecon : </span>
          Ne pas optimiser ce qui fonctionne deja bien. Le driver CUDA est plus malin qu&apos;on pense.
        </p>
      </motion.div>
    </div>
  );
}

