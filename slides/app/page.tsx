"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GridBackground } from "@/components/GridBackground";
import { TransitionEffect } from "@/components/TransitionEffect";
import { SlideWrapper } from "@/components/SlideWrapper";
import { SlideTitle } from "@/components/slides/SlideTitle";
import { SlideContext } from "@/components/slides/SlideContext";
import { SlidePipeline } from "@/components/slides/SlidePipeline";
import { SlideAlgorithms } from "@/components/slides/SlideAlgorithms";
import { SlideGPU } from "@/components/slides/SlideGPU";
import { SlideOptimization } from "@/components/slides/SlideOptimization";
import { SlideOptV1 } from "@/components/slides/SlideOptV1";
import { SlideOptV12 } from "@/components/slides/SlideOptV12";
import { SlideOptV13 } from "@/components/slides/SlideOptV13";
import { SlideOptV14 } from "@/components/slides/SlideOptV14";
import { SlideVersions } from "@/components/slides/SlideVersions";
import { SlideBenchmarks } from "@/components/slides/SlideBenchmarks";
import { SlideBenchV1 } from "@/components/slides/SlideBenchV1";
import { SlideBenchV12 } from "@/components/slides/SlideBenchV12";
import { SlideBenchV13 } from "@/components/slides/SlideBenchV13";
import { SlideBenchV14 } from "@/components/slides/SlideBenchV14";
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
  SlideOptV1,
  SlideOptV12,
  SlideOptV13,
  SlideOptV14,
  SlideVersions,
  SlideBenchmarks,
  SlideBenchV1,
  SlideBenchV12,
  SlideBenchV13,
  SlideBenchV14,
  SlideSpeedup,
  SlideDemo,
  SlideConclusion,
];

type SlideVariantType = "zoom" | "slide" | "flip" | "fade" | "split" | "morph" | "rise" | "bounce" | "curtain" | "elegant";

const slideAnimationTypes: SlideVariantType[] = [
  "zoom",     // Titre - zoom explosif
  "fade",     // Contexte - fade parallax
  "slide",    // Pipeline - slide horizontal
  "split",    // Algorithmes - split screen
  "rise",     // GPU - monte du bas
  "morph",    // Optimisation intro - morph
  "split",    // OptV1 hysteresis - split
  "slide",    // OptV12 cudaSync - slide
  "fade",     // OptV13 shared mem - fade
  "slide",    // OptV14 fusion - slide
  "rise",     // Versions resume - rise
  "bounce",   // Benchmarks global - bounce
  "split",    // BenchV1 - split
  "slide",    // BenchV12 - slide
  "fade",     // BenchV13 - fade
  "slide",    // BenchV14 - slide
  "rise",     // Speedup - rise
  "curtain",  // Demo - rideau
  "elegant",  // Conclusion - elegant
];

const createVariants = (type: SlideVariantType): Variants => {
  switch (type) {
    case "zoom":
      return {
        enter: { scale: 0, opacity: 0, rotate: -10 },
        center: { scale: 1, opacity: 1, rotate: 0 },
        exit: { scale: 2, opacity: 0, rotate: 10 },
      };
    case "slide":
      return {
        enter: (d: number) => ({ x: d > 0 ? 1500 : -1500, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 1500 : -1500, opacity: 0 }),
      };
    case "flip":
      return {
        enter: (d: number) => ({ rotateY: d > 0 ? 90 : -90, opacity: 0 }),
        center: { rotateY: 0, opacity: 1 },
        exit: (d: number) => ({ rotateY: d < 0 ? 90 : -90, opacity: 0 }),
      };
    case "fade":
      return {
        enter: { opacity: 0, y: -50 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
      };
    case "split":
      return {
        enter: (d: number) => ({ x: d > 0 ? 1000 : -1000, scaleX: 0.5, opacity: 0 }),
        center: { x: 0, scaleX: 1, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 1000 : -1000, scaleX: 0.5, opacity: 0 }),
      };
    case "morph":
      return {
        enter: { scale: 0.5, opacity: 0, borderRadius: "50%" },
        center: { scale: 1, opacity: 1, borderRadius: "0%" },
        exit: { scale: 1.5, opacity: 0, borderRadius: "50%" },
      };
    case "rise":
      return {
        enter: { y: 800, opacity: 0, scale: 0.8 },
        center: { y: 0, opacity: 1, scale: 1 },
        exit: { y: -800, opacity: 0, scale: 0.8 },
      };
    case "bounce":
      return {
        enter: { scale: 0, opacity: 0 },
        center: { scale: 1, opacity: 1 },
        exit: { scale: 0, opacity: 0 },
      };
    case "curtain":
      return {
        enter: { scaleY: 0, opacity: 0, originY: 0 },
        center: { scaleY: 1, opacity: 1 },
        exit: { scaleY: 0, opacity: 0, originY: 1 },
      };
    case "elegant":
      return {
        enter: { opacity: 0, scale: 0.95, filter: "blur(20px)" },
        center: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 1.05, filter: "blur(20px)" },
      };
    default:
      return {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
};

const getTransition = (type: SlideVariantType) => {
  switch (type) {
    case "zoom":
      return { type: "spring" as const, stiffness: 300, damping: 25 };
    case "bounce":
      return { type: "spring" as const, stiffness: 400, damping: 15, mass: 1.2 };
    case "elegant":
      return { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] as const };
    case "curtain":
      return { duration: 0.6, ease: "easeInOut" as const };
    case "morph":
      return { duration: 0.5, ease: "easeOut" as const };
    default:
      return { type: "spring" as const, stiffness: 200, damping: 25 };
  }
};

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
  const currentAnimationType = slideAnimationTypes[currentSlide];
  const currentVariants = useMemo(() => createVariants(currentAnimationType), [currentAnimationType]);
  const currentTransition = useMemo(() => getTransition(currentAnimationType), [currentAnimationType]);

  return (
    <SlideWrapper>
    <main className="relative w-full h-full overflow-hidden bg-[#0a0a0a]" style={{ perspective: "1500px" }}>
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
          variants={currentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={currentTransition}
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
    </SlideWrapper>
  );
}
