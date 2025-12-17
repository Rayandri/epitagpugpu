"use client";

import { motion } from "framer-motion";

export function SlideContext() {
  const items = [
    { icon: "🎥", text: "Vidéosurveillance" },
    { icon: "🚗", text: "Véhicules autonomes" },
    { icon: "🏭", text: "Industrie" },
    { icon: "🎮", text: "Gaming / AR" },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-12 p-12 max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Contexte
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-[#76B900]/30 rounded-2xl p-8"
      >
        <p className="text-2xl text-white/80 text-center leading-relaxed">
          La <span className="text-[#76B900] font-semibold">détection de mouvement</span> identifie 
          les pixels qui diffèrent d&apos;un modèle de fond estimé.
          <br /><br />
          Cette tâche est <span className="text-[#76B900] font-semibold">massivement parallélisable</span> : 
          chaque pixel peut être traité indépendamment.
        </p>
      </motion.div>

      <div className="grid grid-cols-4 gap-6 mt-4">
        {items.map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="text-4xl">{item.icon}</span>
            <span className="text-white/70">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

