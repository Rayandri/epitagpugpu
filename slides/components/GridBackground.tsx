"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export function GridBackground() {
  const dots = useMemo(() => {
    const items = [];
    const cols = 50;
    const rows = 30;
    for (let i = 0; i < cols * rows; i++) {
      const x = i % cols;
      const y = Math.floor(i / cols);
      items.push({
        id: i,
        x: x * (100 / cols),
        y: y * (100 / rows),
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        size: Math.random() > 0.95 ? 2 : 1,
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#76B900]/5 via-transparent to-[#76B900]/5" />
      
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-[#76B900]"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
          }}
          animate={{
            opacity: [0.05, 0.3, 0.05],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#76B900]/50 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#76B900]/30 to-transparent"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
