"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export function TransitionEffect({ direction }: { direction: number }) {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.2,
    })), []);

  const lines = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      y: 10 + i * 12,
      delay: i * 0.03,
    })), []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="fixed rounded-full bg-[#76B900] pointer-events-none z-40"
          style={{ 
            width: p.size, 
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          initial={{ 
            scale: 0, 
            opacity: 0,
            x: direction > 0 ? -100 : 100,
          }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            x: direction > 0 ? [100, 0, -100] : [-100, 0, 100],
          }}
          transition={{ 
            duration: 0.6,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
      
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="fixed left-0 h-px pointer-events-none z-40"
          style={{ 
            top: `${line.y}%`,
            background: `linear-gradient(${direction > 0 ? '90deg' : '270deg'}, transparent, #76B900 20%, #76B900 80%, transparent)`,
          }}
          initial={{ 
            width: 0,
            x: direction > 0 ? 0 : "100vw",
            opacity: 0,
          }}
          animate={{ 
            width: ["0%", "100%", "0%"],
            x: direction > 0 ? [0, 0, "100vw"] : ["100vw", 0, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{ 
            duration: 0.5,
            delay: line.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="fixed inset-0 pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.3, 0],
          background: direction > 0 
            ? ["linear-gradient(90deg, transparent, transparent)", "linear-gradient(90deg, transparent, rgba(118,185,0,0.2))", "linear-gradient(90deg, transparent, transparent)"]
            : ["linear-gradient(270deg, transparent, transparent)", "linear-gradient(270deg, transparent, rgba(118,185,0,0.2))", "linear-gradient(270deg, transparent, transparent)"],
        }}
        transition={{ duration: 0.4 }}
      />
    </>
  );
}

