"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4, label: "吸气" },
  { phase: "hold", duration: 7, label: "屏住" },
  { phase: "exhale", duration: 8, label: "呼气" },
  { phase: "rest", duration: 2, label: "" },
];

const TOTAL_CYCLES = 6; // 6个循环约 7.5 分钟

interface BreathGuideProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function BreathGuide({ onComplete, onClose }: BreathGuideProps) {
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
      ? 1.6
      : currentPhase.phase === "exhale"
        ? 0.8
        : currentPhase.phase === "hold"
          ? 1.6
          : 1;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-night-900/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-12 right-6 text-warm-300/30 text-sm active:text-warm-300/50"
      >
        退出
      </button>

      {!isActive ? (
        /* 开始前的引导 */
        <motion.div
          className="flex flex-col items-center text-center px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-warm-200/80 text-lg mb-2">脑子收工仪式</p>
          <p className="text-warm-300/40 text-sm mb-8 max-w-64 leading-relaxed">
            跟着呼吸的节奏，不需要想任何事。
            <br />
            走神了也没关系，拉回来就好。
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
        /* 呼吸引导进行中 */
        <div className="flex flex-col items-center">
          {/* 进度指示 */}
          <p className="text-warm-300/20 text-xs mb-16">
            {cycle + 1} / {TOTAL_CYCLES}
          </p>

          {/* 呼吸圆环 */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* 外圈光晕 */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                scale: circleScale,
                opacity: currentPhase.phase === "rest" ? 0.1 : 0.15,
              }}
              transition={{
                duration: currentPhase.duration,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(circle, rgba(107,140,206,0.2) 0%, transparent 70%)",
              }}
            />

            {/* 主圆 */}
            <motion.div
              className="w-32 h-32 rounded-full border-2 border-accent/30"
              animate={{
                scale: circleScale,
                borderColor:
                  currentPhase.phase === "hold"
                    ? "rgba(107,140,206,0.5)"
                    : "rgba(107,140,206,0.3)",
              }}
              transition={{
                duration: currentPhase.duration,
                ease: "easeInOut",
              }}
              style={{
                boxShadow: "0 0 60px rgba(107,140,206,0.08)",
              }}
            />

            {/* 中心文字 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase.phase}
                className="absolute flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentPhase.label && (
                  <p className="text-accent/80 text-lg tracking-widest">
                    {currentPhase.label}
                  </p>
                )}
                <p className="text-warm-300/30 text-3xl mt-1 font-light">
                  {countdown}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 底部文字引导（随阶段变化） */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`guide-${cycle}-${phaseIndex}`}
              className="mt-16 text-warm-300/25 text-sm text-center max-w-48"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {cycle === 0 && phaseIndex === 0 && "把注意力放在呼吸上"}
              {cycle === 1 && phaseIndex === 0 && "走神了没关系，回来就好"}
              {cycle === 2 && phaseIndex === 0 && "你做得很好"}
              {cycle === 3 && phaseIndex === 0 && "感受身体慢慢变沉"}
              {cycle === 4 && phaseIndex === 0 && "今天已经结束了"}
              {cycle === 5 && phaseIndex === 0 && "最后一轮，慢慢来"}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
