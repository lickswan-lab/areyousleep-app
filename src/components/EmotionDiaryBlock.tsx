"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getEmotionCards, isCardsInitialized, initializeCards } from "@/lib/emotion-cards";
import { getTodayMood, getEmotionLabel } from "@/lib/store";
import { EMOTION_COLORS } from "@/lib/mood-descriptions";

interface EmotionDiaryBlockProps {
  onOpen: () => void;
}

export default function EmotionDiaryBlock({ onOpen }: EmotionDiaryBlockProps) {
  const [cardCount, setCardCount] = useState(0);
  const [todayEmotion, setTodayEmotion] = useState<string | null>(null);

  useEffect(() => {
    if (!isCardsInitialized()) {
      setCardCount(initializeCards().length);
    } else {
      setCardCount(getEmotionCards().length);
    }
    const today = getTodayMood();
    if (today?.emotion) setTodayEmotion(today.emotion);
  }, []);

  const color = todayEmotion
    ? EMOTION_COLORS[todayEmotion as keyof typeof EMOTION_COLORS]
    : "rgba(180,150,220,0.6)";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      className="rounded-3xl text-left press-feedback overflow-hidden relative"
      style={{
        height: "220px",
        background: `linear-gradient(160deg, ${color?.replace(/[\d.]+\)$/, "0.18)")}, rgba(40,30,60,0.4), rgba(20,15,35,0.6))`,
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Warm glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color?.replace(/[\d.]+\)$/, "0.3)")}, transparent 70%)` }}
      />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        <div>
          <span className="text-3xl block mb-3">📖</span>
          <p className="text-warm-100 text-lg font-light">情绪日记</p>
          <p className="text-warm-200/30 text-[11px] mt-1">选一张最像你的卡片</p>
        </div>

        <div className="flex items-center justify-between">
          {todayEmotion ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full"
              style={{ background: color?.replace(/[\d.]+\)$/, "0.15)") }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[11px]" style={{ color: color?.replace(/[\d.]+\)$/, "0.8)") }}>
                {getEmotionLabel(todayEmotion)}
              </span>
            </div>
          ) : (
            <span className="text-warm-300/20 text-[11px]">{cardCount} 张卡片</span>
          )}
          <span className="text-warm-300/20 text-sm">→</span>
        </div>
      </div>
    </motion.button>
  );
}
