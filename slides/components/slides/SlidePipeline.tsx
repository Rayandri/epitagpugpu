"use client";

import { motion } from "framer-motion";

export function SlidePipeline() {
  const steps = [
    { num: 1, title: "Background", desc: "Weighted Reservoir Sampling", color: "#76B900" },
    { num: 2, title: "Motion Mask", desc: "Différence RGB", color: "#5a9000" },
    { num: 3, title: "Érosion", desc: "Suppression du bruit", color: "#4a7a00" },
    { num: 4, title: "Dilatation", desc: "Restauration des formes", color: "#3a6000" },
    { num: 5, title: "Hystérésis", desc: "Double seuillage", color: "#2a4a00" },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-12">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white mb-8"
      >
        Pipeline de Traitement
      </motion.h2>

      <div className="flex items-center gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl nvidia-glow"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="mt-4 text-center"
              >
                <div className="text-white font-semibold">{step.title}</div>
                <div className="text-white/50 text-sm">{step.desc}</div>
              </motion.div>
            </div>
            
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="w-16 h-1 bg-gradient-to-r from-[#76B900] to-[#76B900]/30 mx-2"
                style={{ originX: 0 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-white/60 text-lg"
      >
        Chaque étape exécutée par un <span className="text-[#76B900]">kernel CUDA</span> dédié
      </motion.div>
    </div>
  );
}

