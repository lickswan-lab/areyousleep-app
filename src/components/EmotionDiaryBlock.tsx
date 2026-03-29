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

  const emotionColor = todayEmotion
    ? EMOTION_COLORS[todayEmotion as keyof typeof EMOTION_COLORS]
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      className="rounded-2xl text-left flex flex-col justify-between press-feedback overflow-hidden relative"
      style={{
        height: "240px",
        background: todayEmotion
          ? `linear-gradient(145deg, ${emotionColor?.replace(/[\d.]+\)$/, "0.2)")}, rgba(255,255,255,0.03))`
          : "linear-gradient(145deg, rgba(160,110,200,0.12), rgba(100,145,220,0.06))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* 装饰光斑 */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(160,110,200,0.4), transparent 70%)" }} />

      <div className="relative z-10 p-4 flex flex-col justify-between h-full">
        <div>
          <span className="text-2xl block mb-2">📖</span>
          <p className="text-warm-100 text-base font-medium">情绪日记</p>
        </div>

        <div className="flex items-center justify-between">
          {todayEmotion ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: emotionColor?.replace(/[\d.]+\)$/, "0.2)"),
                color: emotionColor?.replace(/[\d.]+\)$/, "0.8)"),
              }}>
              今日：{getEmotionLabel(todayEmotion)}
            </span>
          ) : (
            <span className="text-warm-300/30 text-[11px]">{cardCount} 张卡片</span>
          )}
          <span className="text-warm-300/25 text-xs">→</span>
        </div>
      </div>
    </motion.button>
  );
}
