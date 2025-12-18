"use client";

import { motion } from "framer-motion";

const versions = [
  { version: "v1.0", desc: "Baseline (hysteresis CPU)", speedup: "1.3x", impact: "", color: "white/50" },
  { version: "v1.1", desc: "Hysteresis full GPU", speedup: "5.8x", impact: "+375%", color: "#76B900" },
  { version: "v1.2", desc: "Sans cudaDeviceSync()", speedup: "5.6x", impact: "-3.4%", color: "#f97316" },
  { version: "v1.3", desc: "Shared memory morpho", speedup: "5.7x", impact: "-2.9%", color: "#f97316" },
  { version: "v1.4", desc: "Fusion kernels", speedup: "5.6x", impact: "-0.6%", color: "#f97316" },
  { version: "v1.5", desc: "Retour v1.1 (simple)", speedup: "5.8x", impact: "=", color: "#76B900" },
];

export function SlideVersions() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Evolution des versions
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-white/60"
      >
        Git tags : v1.0 → v1.5
      </motion.div>

      <div className="w-full mt-4 rounded-xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-4 bg-white/5 p-3 text-white/70 text-sm font-semibold">
          <div>Version</div>
          <div>Optimisation</div>
          <div className="text-center">Speedup</div>
          <div className="text-center">Impact</div>
        </div>
        
        {versions.map((v, i) => (
          <motion.div
            key={v.version}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`grid grid-cols-4 p-3 border-t border-white/5 ${
              v.version === "v1.1" ? "bg-[#76B900]/10" : ""
            }`}
          >
            <div className="font-mono font-bold" style={{ color: v.color }}>
              {v.version}
            </div>
            <div className="text-white/80 text-sm">{v.desc}</div>
            <div className="text-center font-bold" style={{ color: v.color }}>
              {v.speedup}
            </div>
            <div 
              className="text-center font-bold text-sm"
              style={{ color: v.impact.startsWith("+") ? "#76B900" : v.impact.startsWith("-") ? "#f97316" : "rgba(255,255,255,0.5)" }}
            >
              {v.impact}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 text-center max-w-2xl"
      >
        <p className="text-white/70 text-sm">
          <span className="text-[#76B900] font-bold">Conclusion : </span>
          Les micro-optimisations (shared memory, fusion kernels) n&apos;apportent rien.
          Le bottleneck reste les transferts Host↔Device.
        </p>
      </motion.div>
    </div>
  );
}

