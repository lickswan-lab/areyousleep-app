"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getGoodnightMessage } from "@/lib/goodnight-messages";
import { getUsageStreak } from "@/lib/store";

interface GoodnightCardProps {
  mood?: number | null;
  emotion?: string | null;
  onClose: () => void;
}

const STARS = [
  { top: "10%", left: "15%", size: 2, delay: 0 },
  { top: "18%", right: "20%", size: 1.5, delay: 0.3 },
  { top: "30%", left: "10%", size: 1, delay: 0.6 },
  { top: "48%", right: "12%", size: 2, delay: 0.2 },
  { top: "62%", left: "22%", size: 1.5, delay: 0.8 },
  { top: "25%", left: "50%", size: 1, delay: 0.5 },
  { top: "72%", right: "28%", size: 1, delay: 0.4 },
];

function formatDate(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[now.getDay()];
  return `${month}月${day}日 · 周${weekday}`;
}

export default function GoodnightCard({ mood, emotion, onClose }: GoodnightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<{ main: string; sub?: string }>({ main: "" });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setMessage(getGoodnightMessage(mood, emotion));
    setStreak(getUsageStreak());
  }, [mood, emotion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/80 backdrop-blur-md p-4"
    >
      {/* === 卡片主体（截图区域） === */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl"
        style={{ aspectRatio: "3 / 4" }}
      >
        {/* 渐变背景（实色，html2canvas 友好） */}
        <div className="absolute inset-0 bg-gradient-to-b from-night-900 via-night-800 to-night-700" />

        {/* 噪点纹理 */}
        <div className="absolute inset-0 noise-overlay" />

        {/* 星星装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {STARS.map((star, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{
                duration: 3,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-warm-200"
              style={{
                top: star.top,
                left: "left" in star ? star.left : undefined,
                right: "right" in star ? star.right : undefined,
                width: star.size,
                height: star.size,
              }}
            />
          ))}
        </div>

        {/* 卡片内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-7 py-8">
          {/* 月牙装饰 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.2 }}
            className="text-5xl mb-6 select-none"
          >
            🌙
          </motion.div>

          {/* 主语 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-warm-100 text-xl leading-relaxed text-center"
          >
            {message.main}
          </motion.p>

          {/* 副语 */}
          {message.sub && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-warm-200/50 text-sm text-center mt-2"
            >
              {message.sub}
            </motion.p>
          )}

          {/* 分割线 */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6 }}
            className="w-16 h-px bg-warm-300/10 mt-8 mb-6"
          />

          {/* 日期 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-warm-300/30 text-xs tracking-widest"
          >
            {formatDate()}
          </motion.p>

          {/* 连续天数 */}
          {streak > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-warm-300/25 text-xs mt-2"
            >
              第{streak}个夜晚
            </motion.p>
          )}

          {/* 水印 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-6 right-7"
          >
            <span className="text-warm-300/15 text-xs tracking-[0.3em]">
              床前
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* === 卡片外部操作区 === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex flex-col items-center gap-4"
      >
        <p className="text-warm-300/50 text-xs">截图分享到小红书</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-8 py-3 rounded-full glass text-warm-200/70 text-sm press-feedback"
        >
          返回
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
