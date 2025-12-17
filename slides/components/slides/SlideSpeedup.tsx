"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function Counter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(1));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export function SlideSpeedup() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Résultat Final
      </motion.h2>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-[#76B900] blur-3xl opacity-30 rounded-full" />
        <div className="relative text-center p-12">
          <div className="text-[12rem] font-black text-[#76B900] leading-none">
            <Counter value={5.8} />×
          </div>
          <div className="text-3xl text-white/60 mt-4">Speedup moyen</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-3 gap-8 mt-8"
      >
        <div className="text-center p-6 bg-white/5 rounded-xl">
          <div className="text-4xl font-bold text-white">2.5×</div>
          <div className="text-white/50 text-sm mt-2">Minimum</div>
          <div className="text-white/30 text-xs">(ACET.mp4)</div>
        </div>
        <div className="text-center p-6 bg-[#76B900]/20 rounded-xl border border-[#76B900]/50">
          <div className="text-4xl font-bold text-[#76B900]">5.8×</div>
          <div className="text-white/50 text-sm mt-2">Moyenne</div>
          <div className="text-white/30 text-xs">(7 vidéos)</div>
        </div>
        <div className="text-center p-6 bg-white/5 rounded-xl">
          <div className="text-4xl font-bold text-white">7.8×</div>
          <div className="text-white/50 text-sm mt-2">Maximum</div>
          <div className="text-white/30 text-xs">(20895.mp4)</div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-white/50 text-lg mt-4"
      >
        Le speedup augmente avec la taille de la vidéo (amortissement CUDA)
      </motion.p>
    </div>
  );
}

