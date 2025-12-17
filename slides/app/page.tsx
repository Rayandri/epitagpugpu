"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { TransitionEffect } from "@/components/TransitionEffect";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const triggerTransition = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setIsTransitioning(true);
    setTransitionKey(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 600);
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length && index !== currentSlide) {
      triggerTransition(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    }
  }, [currentSlide, triggerTransition]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      triggerTransition(1);
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, triggerTransition]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      triggerTransition(-1);
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide, triggerTransition]);

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
      scale: 0.8,
      rotateY: direction > 0 ? 15 : -15,
      filter: "blur(10px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 15 : -15,
      filter: "blur(10px)",
    }),
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]" style={{ perspective: "1500px" }}>
      <GridBackground />
      
      <AnimatePresence>
        {isTransitioning && (
          <TransitionEffect key={transitionKey} direction={direction} />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 25,
            mass: 1,
            opacity: { duration: 0.4 },
            filter: { duration: 0.3 },
          }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <CurrentSlideComponent />
        </motion.div>
      </AnimatePresence>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: index === currentSlide ? 1.25 : 1,
              backgroundColor: index === currentSlide ? "#76B900" : "rgba(255,255,255,0.3)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-3 h-3 rounded-full"
          />
        ))}
      </div>

      <motion.div 
        key={`counter-${currentSlide}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 text-white/50 text-sm font-mono z-50"
      >
        <span className="text-[#76B900] font-bold">{currentSlide + 1}</span> / {slides.length}
      </motion.div>

      <div className="fixed bottom-6 left-6 text-white/30 text-xs z-50">
        ← → pour naviguer
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-6 right-6 z-50"
      >
        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#76B900]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </motion.div>
    </main>
  );
}
