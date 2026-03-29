"use client";

import { motion } from "framer-motion";

interface SleepToolsBlockProps {
  onOpen: () => void;
}

export default function SleepToolsBlock({ onOpen }: SleepToolsBlockProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      className="rounded-2xl text-left flex flex-col justify-between press-feedback overflow-hidden relative"
      style={{
        height: "240px",
        background: "linear-gradient(145deg, rgba(100,180,180,0.12), rgba(80,140,200,0.06))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* 装饰光斑 */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(100,180,180,0.4), transparent 70%)" }} />

      <div className="relative z-10 p-4 flex flex-col justify-between h-full">
        <div>
          <span className="text-2xl block mb-2">🌙</span>
          <p className="text-warm-100 text-base font-medium">助眠</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-warm-300/30 text-[11px]">呼吸 · 冥想 · 白噪音</span>
          <span className="text-warm-300/25 text-xs">→</span>
        </div>
      </div>
    </motion.button>
  );
}
