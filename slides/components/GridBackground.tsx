"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export function GridBackground() {
  const dots = useMemo(() => {
    const items = [];
    const cols = 40;
    const rows = 25;
    for (let i = 0; i < cols * rows; i++) {
      items.push({
        id: i,
        x: (i % cols) * (100 / cols),
        y: Math.floor(i / cols) * (100 / rows),
        delay: Math.random() * 2,
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute w-1 h-1 rounded-full bg-[#76B900]"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

