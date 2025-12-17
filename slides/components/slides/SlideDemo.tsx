"use client";

import { motion } from "framer-motion";

export function SlideDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Démonstration
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-[800px] h-[450px] bg-black rounded-2xl overflow-hidden border border-[#76B900]/30 nvidia-glow"
      >
        <video
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted
          loop
        >
          <source src="/demo.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
        
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#76B900] animate-pulse" />
          <span className="text-[#76B900] text-sm font-mono">GPU Mode</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-8 text-white/60"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#76B900]">●</span> Zones en mouvement (rouge)
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/50">●</span> Fond estimé
        </div>
      </motion.div>

    </div>
  );
}

