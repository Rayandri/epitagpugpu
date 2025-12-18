"use client";

import { motion } from "framer-motion";

const benchmarks = [
  { video: "ACET", v13: 6.26, v14: 6.41, gain: "-2.4%" },
  { video: "lil_clown", v13: 10.31, v14: 9.36, gain: "+10%" },
  { video: "1023", v13: 9.37, v14: 10.05, gain: "-7.3%" },
  { video: "27999", v13: 7.36, v14: 7.76, gain: "-5.4%" },
  { video: "3630", v13: 11.16, v14: 11.37, gain: "-1.9%" },
  { video: "6387", v13: 8.46, v14: 8.12, gain: "+4.2%" },
  { video: "20895", v13: 23.05, v14: 23.20, gain: "-0.7%" },
];

export function SlideBenchV14() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Benchmark v1.3 → v1.4
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        Fusion Kernels : Aucun impact significatif
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-4 bg-white/5 p-3 text-white/70 text-base font-semibold">
          <div>Video</div>
          <div className="text-center">v1.3 (s)</div>
          <div className="text-center">v1.4 (s)</div>
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
              <div className="text-center text-orange-400 font-bold text-lg">{b.v13}</div>
              <div className="text-center text-orange-400 font-bold text-lg">{b.v14}</div>
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
        className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center max-w-2xl"
      >
        <p className="text-white/70 text-lg">
          <span className="text-white/50 font-bold">Conclusion : </span>
          Variations dans la marge d&apos;erreur (±10%). Le cache L2 rend la fusion inutile.
          <br />
          <span className="text-white/50">Moyenne : -0.6%</span>
        </p>
      </motion.div>
    </div>
  );
}

