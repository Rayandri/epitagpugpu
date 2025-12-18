"use client";

import { motion } from "framer-motion";

const benchmarks = [
  { video: "ACET", v10: 6.26, v11: 5.24, gain: "+16%" },
  { video: "lil_clown", v10: 28.70, v11: 9.49, gain: "+202%" },
  { video: "1023", v10: 61.09, v11: 9.52, gain: "+542%" },
  { video: "27999", v10: 33.62, v11: 7.37, gain: "+356%" },
  { video: "3630", v10: 51.81, v11: 11.09, gain: "+367%" },
  { video: "6387", v10: 63.80, v11: 8.78, gain: "+627%" },
  { video: "20895", v10: 142.12, v11: 23.21, gain: "+512%" },
];

export function SlideBenchV1() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-6xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Benchmark v1.0 → v1.1
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-[#76B900] font-semibold"
      >
        Hysteresis GPU : L&apos;optimisation majeure
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-4 bg-white/5 p-3 text-white/70 text-base font-semibold">
          <div>Video</div>
          <div className="text-center">v1.0 (s)</div>
          <div className="text-center">v1.1 (s)</div>
          <div className="text-center">Gain</div>
        </div>
        
        {benchmarks.map((b, i) => (
          <motion.div
            key={b.video}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="grid grid-cols-4 p-3 border-t border-white/5 items-center"
          >
            <div className="text-white/80 font-mono">{b.video}</div>
            <div className="text-center text-red-400 font-bold text-lg">{b.v10}</div>
            <div className="text-center text-[#76B900] font-bold text-lg">{b.v11}</div>
            <div className="text-center text-[#76B900] font-bold text-xl">{b.gain}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 flex gap-8"
      >
        <div className="p-4 bg-red-500/10 rounded-xl text-center">
          <div className="text-3xl font-bold text-red-400">387s</div>
          <div className="text-white/50">Total v1.0</div>
        </div>
        <div className="p-4 bg-[#76B900]/10 rounded-xl text-center">
          <div className="text-3xl font-bold text-[#76B900]">75s</div>
          <div className="text-white/50">Total v1.1</div>
        </div>
        <div className="p-4 bg-[#76B900]/20 rounded-xl text-center">
          <div className="text-3xl font-bold text-[#76B900]">+416%</div>
          <div className="text-white/50">Gain moyen</div>
        </div>
      </motion.div>
    </div>
  );
}

