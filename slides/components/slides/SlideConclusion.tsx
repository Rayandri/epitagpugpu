"use client";

import { motion } from "framer-motion";

export function SlideConclusion() {
  const points = [
    "Speedup moyen de 5.8× vs CPU",
    "Optimisation clé : hystérésis GPU (+375%)",
    "Bottleneck : transferts Host↔Device",
  ];

  const improvements = [
    "Zero-copy memory",
    "CUDA streams",
    "Persistent kernels",
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 max-w-4xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Conclusion
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <h3 className="text-2xl font-bold text-[#76B900] mb-4">Résultats</h3>
        <div className="space-y-3">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3 text-xl text-white/80"
            >
              <span className="text-[#76B900] text-2xl font-bold">•</span>
              {point}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full mt-4"
      >
        <h3 className="text-2xl font-bold text-white/60 mb-4">Pistes d&apos;amélioration</h3>
        <div className="flex gap-4">
          {improvements.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-center text-white/60"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8 text-center"
      >
        <div className="text-4xl font-bold text-white mb-4">Questions ?</div>
        <div className="text-white/40">
          EPITA ING3 - GPGPU 2025
        </div>
      </motion.div>
    </div>
  );
}

