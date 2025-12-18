"use client";

import { motion } from "framer-motion";

export function SlideOptV14() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        v1.3 → v1.4 : Fusion de Kernels
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        Resultat : -0.6% (echec)
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
            Fusionner 2 kernels en 1 pour economiser une passe memoire (ecriture + relecture).
          </p>
          <div className="font-mono text-sm bg-black/30 p-4 rounded-lg">
            <div className="text-white/50">// Avant (2 kernels)</div>
            <div>dilation{"<<<"}...{">>>"};(input, <span className="text-red-400">temp</span>);</div>
            <div>threshold{"<<<"}...{">>>"};(<span className="text-red-400">temp</span>, output);</div>
            <div className="text-white/50 mt-2">// 2 ecritures + 2 lectures</div>
            <div className="mt-4 text-white/50">// Apres (1 kernel fusionne)</div>
            <div className="text-[#76B900]">dilation_threshold{"<<<"}...{">>>"};(input, output);</div>
            <div className="text-white/50">// 1 ecriture + 1 lecture</div>
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
                <p><span className="text-orange-400 font-bold">Cache L2 encore!</span></p>
                <p className="text-sm text-white/60">temp ecrit par dilation reste dans L2, threshold le lit depuis le cache</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">2.</span>
              <div>
                <p><span className="text-orange-400 font-bold">Kernel plus complexe</span></p>
                <p className="text-sm text-white/60">Plus de registres → moins de warps actifs → occupation reduite</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">3.</span>
              <div>
                <p><span className="text-orange-400 font-bold">Bande passante pas le bottleneck</span></p>
                <p className="text-sm text-white/60">RTX 5060 : ~300 Go/s, 2 Mo d&apos;image = instantane</p>
              </div>
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
          La fusion de kernels n&apos;est utile que si le cache L2 est sature (images 4K+) ou si les kernels sont tres simples.
        </p>
      </motion.div>
    </div>
  );
}

