"use client";

import { motion } from "framer-motion";

const benchmarks = [
  { video: "ACET", v12: 5.23, v13: 6.26, gain: "-20%" },
  { video: "lil_clown", v12: 10.09, v13: 10.31, gain: "-2.2%" },
  { video: "1023", v12: 12.21, v13: 9.37, gain: "+30%" },
  { video: "27999", v12: 5.43, v13: 7.36, gain: "-36%" },
  { video: "3630", v12: 10.94, v13: 11.16, gain: "-2.0%" },
  { video: "6387", v12: 10.85, v13: 8.46, gain: "+28%" },
  { video: "20895", v12: 21.66, v13: 23.05, gain: "-6.4%" },
];

export function SlideBenchV13() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Benchmark v1.2 → v1.3
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        Shared Memory : Impact negatif
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-4 bg-white/5 p-3 text-white/70 text-base font-semibold">
          <div>Video</div>
          <div className="text-center">v1.2 (s)</div>
          <div className="text-center">v1.3 (s)</div>
          <div className="text-center">Gain</div>
        </div>
        
        {benchmarks.map((b, i) => {
          const isNegative = b.gain.startsWith("-");
          return (
            <motion.div
              key={b.video}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="grid grid-cols-4 p-3 border-t border-white/5 items-center"
            >
              <div className="text-white/80 font-mono">{b.video}</div>
              <div className="text-center text-orange-400 font-bold text-lg">{b.v12}</div>
              <div className="text-center text-orange-400 font-bold text-lg">{b.v13}</div>
              <div className={`text-center font-bold text-xl ${isNegative ? "text-red-400" : "text-[#76B900]"}`}>
                {b.gain}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center max-w-2xl"
      >
        <p className="text-white/70 text-lg">
          <span className="text-red-400 font-bold">Conclusion : </span>
          5 videos sur 7 sont plus lentes. L&apos;overhead de __syncthreads() et du chargement du halo depasse le gain.
          <br />
          <span className="text-white/50">Moyenne : -2.9%</span>
        </p>
      </motion.div>
    </div>
  );
}

