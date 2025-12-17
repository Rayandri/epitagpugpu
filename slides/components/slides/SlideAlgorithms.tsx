"use client";

import { motion } from "framer-motion";

export function SlideAlgorithms() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-4"
      >
        Algorithmes
      </motion.h2>

      <div className="grid grid-cols-2 gap-8 w-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-[#76B900]/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-[#76B900] mb-4">
            Weighted Reservoir Sampling
          </h3>
          <div className="space-y-3 text-white/80">
            <p>Pour chaque pixel, on maintient <span className="text-[#76B900]">k=4 réservoirs</span></p>
            <div className="code-block p-4 text-sm">
              <code className="text-[#76B900]">if</code> distance RGB &lt; 30 :
              <br />
              &nbsp;&nbsp;poids++
              <br />
              <code className="text-[#76B900]">else</code> :
              <br />
              &nbsp;&nbsp;remplacer le min
            </div>
            <p className="text-white/60 text-sm">
              Adapté aux scènes avec plusieurs fonds alternés
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-[#76B900]/30 rounded-2xl p-6"
        >
          <h3 className="text-2xl font-bold text-[#76B900] mb-4">
            Hystérésis
          </h3>
          <div className="space-y-3 text-white/80">
            <p>Double seuillage avec reconstruction itérative</p>
            <div className="flex gap-4 my-4">
              <div className="flex-1 bg-red-500/20 border border-red-500/50 rounded p-3 text-center">
                <div className="text-red-400 font-bold">T<sub>high</sub></div>
                <div className="text-sm">Mouvement certain</div>
              </div>
              <div className="flex-1 bg-yellow-500/20 border border-yellow-500/50 rounded p-3 text-center">
                <div className="text-yellow-400 font-bold">T<sub>low</sub></div>
                <div className="text-sm">Connecté = valide</div>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Itération jusqu&apos;à convergence avec flag atomique
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

