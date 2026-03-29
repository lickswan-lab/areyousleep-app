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
      transition={{ delay: 0.2, duration: 0.5 }}
      whileTap={{ scale: 0.96 }}
      onClick={onOpen}
      className="rounded-3xl text-left press-feedback overflow-hidden relative"
      style={{
        height: "220px",
        background: "linear-gradient(160deg, rgba(80,140,160,0.18), rgba(30,50,60,0.4), rgba(15,25,35,0.6))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Warm glow */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(100,180,200,0.25), transparent 70%)" }}
      />

      {/* Stars */}
      <div className="absolute top-8 right-8 w-1 h-1 rounded-full bg-warm-300/20" />
      <div className="absolute top-14 right-14 w-0.5 h-0.5 rounded-full bg-warm-300/15" />
      <div className="absolute top-20 right-6 w-0.5 h-0.5 rounded-full bg-warm-300/10" />

      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        <div>
          <span className="text-3xl block mb-3">🌙</span>
          <p className="text-warm-100 text-lg font-light">助眠</p>
          <p className="text-warm-200/30 text-[11px] mt-1">放松身心，准备入睡</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-warm-300/20 text-[11px]">呼吸 · 冥想 · 白噪音</span>
          <span className="text-warm-300/20 text-sm">→</span>
        </div>
      </div>
    </motion.button>
  );
}
