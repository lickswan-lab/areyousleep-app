"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 3分钟快速版：4-4-6 呼吸，4个循环 ≈ 3.7分钟
type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4, label: "吸气" },
  { phase: "hold", duration: 4, label: "屏住" },
  { phase: "exhale", duration: 6, label: "呼气" },
  { phase: "rest", duration: 1, label: "" },
];

const TOTAL_CYCLES = 4;

const GUIDE_TEXTS = [
  "不用想任何事，跟着呼吸就好",
  "走神了也没关系",
  "你做得很好",
  "慢慢来，最后一轮",
];

interface QuickBreathProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function QuickBreath({ onComplete, onClose }: QuickBreathProps) {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const currentPhase = PHASES[phaseIndex];

  const advancePhase = useCallback(() => {
    const nextIndex = (phaseIndex + 1) % PHASES.length;
    if (nextIndex === 0) {
      const nextCycle = cycle + 1;
      if (nextCycle >= TOTAL_CYCLES) {
        setIsActive(false);
        onComplete();
        return;
      }
      setCycle(nextCycle);
    }
    setPhaseIndex(nextIndex);
    setCountdown(PHASES[nextIndex].duration);
  }, [phaseIndex, cycle, onComplete]);

  useEffect(() => {
    if (!isActive) return;
    if (countdown <= 0) {
      advancePhase();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isActive, countdown, advancePhase]);

  const start = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCycle(0);
    setCountdown(PHASES[0].duration);
  };

  const circleScale =
    currentPhase.phase === "inhale"
      ? 1.4
      : currentPhase.phase === "exhale"
        ? 0.85
        : currentPhase.phase === "hold"
          ? 1.4
          : 1;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-night-900/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-12 right-6 text-warm-300/30 text-sm active:text-warm-300/50"
      >
        退出
      </button>

      {!isActive ? (
        <motion.div
          className="flex flex-col items-center text-center px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-warm-200/80 text-lg mb-2">快速关机</p>
          <p className="text-warm-300/40 text-sm mb-2">3 分钟版</p>
          <p className="text-warm-300/30 text-xs mb-8 max-w-56 leading-relaxed">
            适合没有耐心或只想快速平静下来的时候
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={start}
            className="px-8 py-3.5 rounded-full bg-accent/20 border border-accent/30
                       text-accent text-base active:bg-accent/30 transition-colors"
          >
            开始
          </motion.button>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-warm-300/20 text-xs mb-12">
            {cycle + 1} / {TOTAL_CYCLES}
          </p>

          {/* 呼吸圆环 - 更小更简洁 */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: circleScale,
                opacity: currentPhase.phase === "rest" ? 0.05 : 0.1,
              }}
              transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(circle, rgba(107,140,206,0.15) 0%, transparent 70%)",
              }}
            />
            <motion.div
              className="w-24 h-24 rounded-full border border-accent/30"
              animate={{ scale: circleScale }}
              transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 40px rgba(107,140,206,0.06)" }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase.phase}
                className="absolute flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentPhase.label && (
                  <p className="text-accent/70 text-base tracking-widest">
                    {currentPhase.label}
                  </p>
                )}
                <p className="text-warm-300/25 text-2xl mt-0.5 font-light">
                  {countdown}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`guide-${cycle}`}
              className="mt-12 text-warm-300/25 text-sm text-center max-w-48"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              {phaseIndex === 0 && GUIDE_TEXTS[cycle]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
