"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

function FallingParticle({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="absolute w-0.5 bg-gradient-to-b from-[#76B900] to-transparent"
      style={{ left: `${x}%`, top: -20 }}
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        y: [0, 1200],
        height: [0, 30, 50, 30, 0],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: 5,
        ease: "linear",
      }}
    />
  );
}

function SideStream({ side, delay, yPos }: { side: "left" | "right"; delay: number; yPos: number }) {
  const isLeft = side === "left";
  return (
    <motion.div
      className="absolute h-0.5 bg-gradient-to-r from-transparent via-[#76B900] to-transparent"
      style={{ 
        top: `${yPos}%`,
        [isLeft ? "left" : "right"]: -100,
        width: 100,
      }}
      animate={{ 
        x: isLeft ? [0, 2200] : [0, -2200],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: 8,
        ease: "linear",
      }}
    />
  );
}

function GPUShape() {
  const gpuPoints = useMemo(() => {
    const points = [];
    for (let x = 0; x < 12; x++) {
      for (let y = 0; y < 6; y++) {
        if (x === 0 || x === 11 || y === 0 || y === 5 || (x >= 2 && x <= 9 && y >= 1 && y <= 4)) {
          points.push({ x: x * 8, y: y * 8, delay: (x + y) * 0.05 });
        }
      }
    }
    for (let i = 0; i < 3; i++) {
      points.push({ x: 96 + 12, y: 16 + i * 12, delay: 0.8 + i * 0.1, isConnector: true });
    }
    return points;
  }, []);

  return (
    <motion.div
      className="fixed bottom-20 right-10 pointer-events-none"
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 0.4, x: 0 }}
      transition={{ duration: 2, delay: 1 }}
    >
      <svg width="140" height="60" className="overflow-visible">
        {gpuPoints.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.isConnector ? 3 : 2}
            fill="#76B900"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              delay: point.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.rect
          x={16}
          y={8}
          width={64}
          height={32}
          fill="none"
          stroke="#76B900"
          strokeWidth={0.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </svg>
      <motion.div 
        className="text-[#76B900]/30 text-xs font-mono mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        RTX 5060
      </motion.div>
    </motion.div>
  );
}

function DataFlow() {
  const lanes = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      y: 15 + i * 10,
      delay: i * 0.3,
      speed: 1.5 + Math.random(),
    }));
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
      {lanes.map((lane, i) => (
        <motion.div
          key={i}
          className="absolute left-0 flex gap-4"
          style={{ top: `${lane.y}%` }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 15 / lane.speed,
            delay: lane.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {Array.from({ length: 20 }, (_, j) => (
            <div 
              key={j} 
              className="text-[#76B900] font-mono text-xs whitespace-nowrap"
            >
              {Math.random() > 0.5 ? "█" : "▓"}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export function GridBackground() {
  const dots = useMemo(() => {
    const items = [];
    const cols = 60;
    const rows = 35;
    for (let i = 0; i < cols * rows; i++) {
      if (Math.random() > 0.7) {
        items.push({
          id: i,
          x: (i % cols) * (100 / cols),
          y: Math.floor(i / cols) * (100 / rows),
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4,
        });
      }
    }
    return items;
  }, []);

  const fallingParticles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
    })), []);

  const sideStreams = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      side: (i % 2 === 0 ? "left" : "right") as "left" | "right",
      delay: i * 0.8,
      yPos: 15 + i * 8,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(118,185,0,0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(118,185,0,0.05)_0%,_transparent_40%)]" />
      
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute w-px h-px rounded-full bg-[#76B900]"
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {fallingParticles.map((p) => (
        <FallingParticle key={p.id} x={p.x} delay={p.delay} />
      ))}

      {sideStreams.map((s) => (
        <SideStream key={s.id} side={s.side} delay={s.delay} yPos={s.yPos} />
      ))}

      <DataFlow />
      <GPUShape />

      <motion.div
        className="absolute top-0 left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent, #76B900, transparent)" }}
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent, #76B900, transparent)" }}
        animate={{ opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
    </div>
  );
}
