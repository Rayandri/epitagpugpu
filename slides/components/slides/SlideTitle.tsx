"use client";

import { motion } from "framer-motion";

export function SlideTitle() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1 }}
        className="w-32 h-32 nvidia-gradient rounded-2xl flex items-center justify-center nvidia-glow"
      >
        <span className="text-5xl font-bold text-white">GPU</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-6xl font-bold text-white text-center"
      >
        Détection de Mouvement
        <span className="block text-[#76B900] mt-2">Temps Réel</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-white/60"
      >
        Projet GPGPU - EPITA ING3
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex gap-8 mt-8"
      >
        {["Rayan Drissi", "Emre Ulusoy", "Marc Guillemot"].map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
            className="px-4 py-2 bg-white/10 rounded-lg text-white/80"
          >
            {name}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

