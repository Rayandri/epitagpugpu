"use client";

import { motion } from "framer-motion";

const versions = [
  { 
    version: "v1.0", 
    desc: "Baseline", 
    detail: "Hysteresis sur CPU avec cudaMemcpy2D aller-retour",
    speedup: "1.3x", 
    impact: "", 
    color: "white/50" 
  },
  { 
    version: "v1.1", 
    desc: "Hysteresis GPU", 
    detail: "Kernel iteratif + atomicOr pour detecter convergence",
    speedup: "5.8x", 
    impact: "+375%", 
    color: "#76B900" 
  },
  { 
    version: "v1.2", 
    desc: "Sans cudaDeviceSync()", 
    detail: "Suppression des synchronisations explicites",
    speedup: "5.6x", 
    impact: "-3.4%", 
    color: "#f97316" 
  },
  { 
    version: "v1.3", 
    desc: "Shared memory", 
    detail: "Cache local pour erosion/dilation (rayon 3px)",
    speedup: "5.7x", 
    impact: "-2.9%", 
    color: "#f97316" 
  },
  { 
    version: "v1.4", 
    desc: "Fusion kernels", 
    detail: "Dilation + threshold en un seul kernel",
    speedup: "5.6x", 
    impact: "-0.6%", 
    color: "#f97316" 
  },
  { 
    version: "v1.5", 
    desc: "Retour v1.1", 
    detail: "Code simple sans micro-optimisations inutiles",
    speedup: "5.8x", 
    impact: "=", 
    color: "#76B900" 
  },
];

export function SlideVersions() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 w-full max-w-7xl">
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
        className="text-2xl text-white/60"
      >
        Git tags : v1.0 → v1.5
      </motion.div>

      <div className="w-full mt-4 rounded-2xl overflow-hidden border border-white/10">
        <div className="grid grid-cols-5 bg-white/5 p-4 text-white/70 text-base font-semibold">
          <div>Version</div>
          <div>Optimisation</div>
          <div className="col-span-2">Detail technique</div>
          <div className="text-center">Speedup</div>
        </div>
        
        {versions.map((v, i) => (
          <motion.div
            key={v.version}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`grid grid-cols-5 p-4 border-t border-white/5 items-center ${
              v.version === "v1.1" ? "bg-[#76B900]/10" : ""
            }`}
          >
            <div className="font-mono font-bold text-xl" style={{ color: v.color }}>
              {v.version}
            </div>
            <div className="text-white/80 text-base">{v.desc}</div>
            <div className="col-span-2 text-white/60 text-sm font-mono">{v.detail}</div>
            <div className="text-center">
              <span className="font-bold text-xl" style={{ color: v.color }}>{v.speedup}</span>
              {v.impact && (
                <span 
                  className="ml-2 text-base"
                  style={{ color: v.impact.startsWith("+") ? "#76B900" : v.impact.startsWith("-") ? "#f97316" : "rgba(255,255,255,0.5)" }}
                >
                  ({v.impact})
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-4 grid grid-cols-2 gap-6 w-full"
      >
        <div className="p-5 bg-[#76B900]/10 rounded-2xl border border-[#76B900]/30">
          <h4 className="text-[#76B900] font-bold text-lg mb-2">Pourquoi v1.1 fonctionne</h4>
          <p className="text-white/60 text-base">
            Elimine les transferts CPU↔GPU dans la boucle d&apos;hysteresis (jusqu&apos;a 100 iterations)
          </p>
        </div>
        <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/30">
          <h4 className="text-orange-400 font-bold text-lg mb-2">Pourquoi v1.2-v1.4 echouent</h4>
          <p className="text-white/60 text-base">
            Le driver CUDA pipeline deja les kernels. Le cache L2 (8Mo) garde les donnees. Rayon trop petit pour shared memory.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
