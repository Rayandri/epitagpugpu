"use client";

import { motion } from "framer-motion";

const versions = [
  { version: "v1.0", desc: "Baseline (hysteresis CPU)", speedup: "1.3x", color: "rgba(255,255,255,0.5)" },
  { version: "v1.1", desc: "Hysteresis full GPU", speedup: "5.8x", color: "#76B900" },
  { version: "v1.2", desc: "Sans cudaDeviceSync()", speedup: "5.6x", color: "#f97316" },
  { version: "v1.3", desc: "Shared memory morpho", speedup: "5.7x", color: "#f97316" },
  { version: "v1.4", desc: "Fusion kernels", speedup: "5.6x", color: "#f97316" },
  { version: "v1.5", desc: "Retour v1.1 (code simple)", speedup: "5.8x", color: "#76B900" },
];

export function SlideVersions() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12 max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Resume des versions
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl text-white/60"
      >
        Git tags : v1.0 → v1.5
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-3 bg-white/5 p-4 text-white/70 text-lg font-semibold">
          <div>Version</div>
          <div>Description</div>
          <div className="text-center">Speedup vs CPU</div>
        </div>
        
        {versions.map((v, i) => (
          <motion.div
            key={v.version}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className={`grid grid-cols-3 p-4 border-t border-white/5 items-center ${
              v.version === "v1.1" || v.version === "v1.5" ? "bg-[#76B900]/10" : ""
            }`}
          >
            <div className="font-mono font-bold text-2xl" style={{ color: v.color }}>
              {v.version}
            </div>
            <div className="text-white/80 text-lg">{v.desc}</div>
            <div className="text-center font-bold text-2xl" style={{ color: v.color }}>
              {v.speedup}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-center"
      >
        <div className="text-white/50 text-lg">Code final = v1.5 = v1.1</div>
        <div className="text-[#76B900] text-xl font-bold mt-2">
          Simple et efficace &gt; micro-optimisations inutiles
        </div>
      </motion.div>
    </div>
  );
}
