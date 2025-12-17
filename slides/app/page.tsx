"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { SlideTitle } from "@/components/slides/SlideTitle";
import { SlideContext } from "@/components/slides/SlideContext";
import { SlidePipeline } from "@/components/slides/SlidePipeline";
import { SlideAlgorithms } from "@/components/slides/SlideAlgorithms";
import { SlideGPU } from "@/components/slides/SlideGPU";
import { SlideOptimization } from "@/components/slides/SlideOptimization";
import { SlideBenchmarks } from "@/components/slides/SlideBenchmarks";
import { SlideSpeedup } from "@/components/slides/SlideSpeedup";
import { SlideDemo } from "@/components/slides/SlideDemo";
import { SlideConclusion } from "@/components/slides/SlideConclusion";

const slides = [
  SlideTitle,
  SlideContext,
  SlidePipeline,
  SlideAlgorithms,
  SlideGPU,
  SlideOptimization,
  SlideBenchmarks,
  SlideSpeedup,
  SlideDemo,
  SlideConclusion,
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "Backspace") {
        e.preventDefault();
        prevSlide();
      } else if (e.key >= "1" && e.key <= "9") {
        goToSlide(parseInt(e.key) - 1);
      } else if (e.key === "0") {
        goToSlide(9);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  const CurrentSlideComponent = slides[currentSlide];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <GridBackground />
      
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#76B900] scale-125"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      <div className="fixed bottom-6 right-6 text-white/50 text-sm font-mono z-50">
        {currentSlide + 1} / {slides.length}
      </div>

      <div className="fixed bottom-6 left-6 text-white/30 text-xs z-50">
        ← → ou 1-0 pour naviguer
      </div>
    </main>
  );
}
