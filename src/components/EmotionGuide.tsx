"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GuidePhase = "naming" | "container" | "body" | "done";

const EMOTION_WORDS = [
  "焦虑", "委屈", "愤怒", "难过", "孤独",
  "害怕", "自责", "疲惫", "迷茫", "心疼",
];

const CONTAINER_TEXTS = [
  "这些感受都是真实的",
  "它们今天陪了你一整天，也累了",
  "现在，想象把它们轻轻放进一个温暖的容器里",
  "容器会替你保管，你不需要一直抱着",
];

const BODY_SCANS = [
  "感受你的头顶...放松",
  "感受你的肩膀...让它们沉下来",
  "感受你的胸口...呼吸变得平缓",
  "感受你的双手...温暖而放松",
  "感受你的双脚...沉沉地落在床上",
];

interface EmotionGuideProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function EmotionGuide({ onComplete, onClose }: EmotionGuideProps) {
  const [phase, setPhase] = useState<GuidePhase>("naming");
  const [selectedEmotions, setSelectedEmotions] = useState<Set<string>>(new Set());
  const [containerTextIndex, setContainerTextIndex] = useState(0);
  const [containerSinking, setContainerSinking] = useState(false);
  const [bodyScanIndex, setBodyScanIndex] = useState(0);

  // --- Phase 2: Container text progression ---
  useEffect(() => {
    if (phase !== "container") return;

    if (containerTextIndex < CONTAINER_TEXTS.length) {
      const timer = setTimeout(() => {
        setContainerTextIndex((i) => i + 1);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // All texts shown, start sinking animation then advance
    if (!containerSinking) {
      setContainerSinking(true);
      const timer = setTimeout(() => {
        setPhase("body");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, containerTextIndex, containerSinking]);

  // --- Phase 3: Body scan progression ---
  useEffect(() => {
    if (phase !== "body") return;

    if (bodyScanIndex < BODY_SCANS.length) {
      const timer = setTimeout(() => {
        setBodyScanIndex((i) => i + 1);
      }, 6000); // 5s display + 1s transition
      return () => clearTimeout(timer);
    }

    // All body parts done, complete
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [phase, bodyScanIndex, onComplete]);

  const toggleEmotion = useCallback((word: string) => {
    setSelectedEmotions((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  }, []);

  const advanceToContainer = () => {
    if (selectedEmotions.size > 0) {
      setPhase("container");
    }
  };

  const selectedArray = Array.from(selectedEmotions);

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

      <AnimatePresence mode="wait">
        {/* ===== Phase 1: 情绪命名 ===== */}
        {phase === "naming" && (
          <motion.div
            key="naming"
            className="flex flex-col items-center text-center px-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-warm-200/80 text-lg mb-2">情绪命名</p>
            <p className="text-warm-300/40 text-sm mb-8 max-w-64 leading-relaxed">
              选中那些此刻在心里的感受，不用评判对错
            </p>

            {/* 情绪词网格 */}
            <div className="flex flex-wrap justify-center gap-3 max-w-80 mb-10">
              {EMOTION_WORDS.map((word) => {
                const isSelected = selectedEmotions.has(word);
                return (
                  <motion.button
                    key={word}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => toggleEmotion(word)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors duration-300 ${
                      isSelected
                        ? "bg-emotion/25 border border-emotion/50 text-emotion"
                        : "bg-night-700/40 border border-warm-300/10 text-warm-300/50"
                    }`}
                    animate={
                      isSelected
                        ? {
                            boxShadow: [
                              "0 0 0px rgba(196,139,107,0)",
                              "0 0 16px rgba(196,139,107,0.3)",
                              "0 0 8px rgba(196,139,107,0.15)",
                            ],
                          }
                        : { boxShadow: "0 0 0px rgba(196,139,107,0)" }
                    }
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>

            {/* 继续按钮 */}
            <AnimatePresence>
              {selectedEmotions.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={advanceToContainer}
                  className="px-8 py-3.5 rounded-full bg-emotion/20 border border-emotion/30
                             text-emotion text-base active:bg-emotion/30 transition-colors"
                >
                  继续
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== Phase 2: 情绪容器 ===== */}
        {phase === "container" && (
          <motion.div
            key="container"
            className="flex flex-col items-center text-center px-6 relative w-full h-full justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 漂浮的情绪词 */}
            <div className="relative w-72 h-64 mb-8">
              {selectedArray.map((word, i) => {
                const angle = (i / selectedArray.length) * Math.PI * 2;
                const radius = 60 + (i % 2) * 30;
                const baseX = Math.cos(angle) * radius;
                const baseY = Math.sin(angle) * radius * 0.6 - 20;

                return (
                  <motion.span
                    key={word}
                    className="absolute left-1/2 top-1/2 px-3 py-1.5 rounded-full text-sm
                               bg-emotion/15 border border-emotion/30 text-emotion/80"
                    initial={{
                      x: baseX - 20,
                      y: baseY - 10,
                      opacity: 0,
                    }}
                    animate={
                      containerSinking
                        ? {
                            x: baseX * 0.3 - 20,
                            y: 80,
                            opacity: 0,
                            scale: 0.7,
                          }
                        : {
                            x: [baseX - 20, baseX - 14, baseX - 20],
                            y: [baseY - 10, baseY - 18, baseY - 10],
                            opacity: 0.9,
                          }
                    }
                    transition={
                      containerSinking
                        ? { duration: 3, ease: "easeIn", delay: i * 0.3 }
                        : {
                            duration: 4 + i * 0.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2,
                          }
                    }
                  >
                    {word}
                  </motion.span>
                );
              })}

              {/* 容器形状 */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 rounded-b-[40px]
                           border-b-2 border-x-2 border-emotion/20"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: containerSinking ? 0.6 : 0.2,
                }}
                transition={{ duration: 1.5 }}
                style={{
                  background: containerSinking
                    ? "linear-gradient(to top, rgba(196,139,107,0.1), transparent)"
                    : "transparent",
                }}
              />
            </div>

            {/* 引导文字 */}
            <div className="h-16 flex items-center">
              <AnimatePresence mode="wait">
                {containerTextIndex < CONTAINER_TEXTS.length && (
                  <motion.p
                    key={`ct-${containerTextIndex}`}
                    className="text-warm-200/60 text-sm max-w-56 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    {CONTAINER_TEXTS[containerTextIndex]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ===== Phase 3: 身体回归 ===== */}
        {phase === "body" && (
          <motion.div
            key="body"
            className="flex flex-col items-center text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="text-warm-300/20 text-xs mb-12">
              {bodyScanIndex < BODY_SCANS.length
                ? `${bodyScanIndex + 1} / ${BODY_SCANS.length}`
                : ""}
            </p>

            {/* 温暖光晕 */}
            <motion.div
              className="w-48 h-48 rounded-full mb-12"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.08, 0.14, 0.08],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(circle, rgba(196,139,107,0.2) 0%, transparent 70%)",
              }}
            />

            {/* 身体扫描文字 */}
            <div className="h-16 flex items-center -mt-24">
              <AnimatePresence mode="wait">
                {bodyScanIndex < BODY_SCANS.length && (
                  <motion.p
                    key={`bs-${bodyScanIndex}`}
                    className="text-warm-200/70 text-base max-w-56 leading-relaxed tracking-wide"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  >
                    {BODY_SCANS[bodyScanIndex]}
                  </motion.p>
                )}
                {bodyScanIndex >= BODY_SCANS.length && (
                  <motion.p
                    key="bs-end"
                    className="text-warm-200/50 text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                  >
                    好了，今晚到这里就够了
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
