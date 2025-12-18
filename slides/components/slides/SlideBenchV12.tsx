"use client";

import { motion } from "framer-motion";

const benchmarks = [
  { video: "ACET", v11: 5.24, v12: 5.23, gain: "+0.2%" },
  { video: "lil_clown", v11: 9.49, v12: 10.09, gain: "-6.3%" },
  { video: "1023", v11: 9.52, v12: 12.21, gain: "-28%" },
  { video: "27999", v11: 7.37, v12: 5.43, gain: "+36%" },
  { video: "3630", v11: 11.09, v12: 10.94, gain: "+1.4%" },
  { video: "6387", v11: 8.78, v12: 10.85, gain: "-24%" },
  { video: "20895", v11: 23.21, v12: 21.66, gain: "+7.2%" },
];

export function SlideBenchV12() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Benchmark v1.1 → v1.2
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-orange-400 font-semibold"
      >
        cudaDeviceSynchronize() : Resultats inconsistants
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-4 bg-white/5 p-3 text-white/70 text-base font-semibold">
          <div>Video</div>
          <div className="text-center">v1.1 (s)</div>
          <div className="text-center">v1.2 (s)</div>
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
              <div className="text-center text-[#76B900] font-bold text-lg">{b.v11}</div>
              <div className="text-center text-orange-400 font-bold text-lg">{b.v12}</div>
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
        className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30 text-center max-w-2xl"
      >
        <p className="text-white/70 text-lg">
          <span className="text-orange-400 font-bold">Observation : </span>
          Resultats aleatoires (+36% a -28%). Le driver CUDA gere deja l&apos;ordonnancement.
          <br />
          <span className="text-white/50">Moyenne : -3.4%</span>
        </p>
      </motion.div>
    </div>
  );
}

