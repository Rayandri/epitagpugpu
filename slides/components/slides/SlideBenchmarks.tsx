"use client";

import { motion } from "framer-motion";

export function SlideBenchmarks() {
  const data = [
    { name: "ACET", cpu: 13.19, gpu: 5.32 },
    { name: "lil_clown", cpu: 40.62, gpu: 7.96 },
    { name: "1023", cpu: 72.27, gpu: 12.02 },
    { name: "27999", cpu: 37.60, gpu: 7.66 },
    { name: "3630", cpu: 64.26, gpu: 8.55 },
    { name: "6387", cpu: 69.01, gpu: 10.22 },
    { name: "20895", cpu: 164.57, gpu: 20.99 },
  ];

  const maxValue = Math.max(...data.map((d) => d.cpu));

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 w-full max-w-5xl">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-white"
      >
        Benchmarks
      </motion.h2>

      <div className="w-full space-y-4 mt-4">
        {data.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="w-20 text-right text-white/70 text-sm font-mono">
              {item.name}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.cpu / maxValue) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                  className="h-5 bg-white/30 rounded-r flex items-center justify-end pr-2"
                >
                  <span className="text-xs text-white/80">{item.cpu}s</span>
                </motion.div>
                <span className="text-xs text-white/50">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.gpu / maxValue) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="h-5 bg-[#76B900] rounded-r flex items-center justify-end pr-2"
                >
                  <span className="text-xs text-white">{item.gpu}s</span>
                </motion.div>
                <span className="text-xs text-[#76B900]">GPU</span>
              </div>
            </div>
            <div className="w-16 text-right">
              <span className="text-[#76B900] font-bold">
                {(item.cpu / item.gpu).toFixed(1)}×
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex gap-8 mt-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/30 rounded" />
          <span className="text-white/50">Ryzen 9 5950X</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#76B900] rounded" />
          <span className="text-white/50">RTX 5060</span>
        </div>
      </motion.div>
    </div>
  );
}

