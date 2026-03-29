"use client";

import { motion } from "framer-motion";
import { getNoiseEngine } from "@/lib/white-noise";

interface HomeHeaderProps {
  greeting: string;
  onWhiteNoiseToggle: () => void;
  onProfileClick: () => void;
}

export default function HomeHeader({ greeting, onWhiteNoiseToggle, onProfileClick }: HomeHeaderProps) {
  const engine = getNoiseEngine();
  const isPlaying = typeof window !== "undefined" && engine.hasActive();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between pt-5 pb-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          🌙
        </motion.div>
        <div>
          <h1 className="text-warm-100 text-xl font-light">{greeting}</h1>
          <p className="text-warm-300/30 text-[11px] mt-0.5">床前 · 陪你入睡</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onWhiteNoiseToggle}
          className="w-10 h-10 rounded-2xl flex items-center justify-center press-feedback"
          style={{
            background: isPlaying
              ? "linear-gradient(135deg, rgba(160,140,200,0.2), rgba(100,140,200,0.1))"
              : "rgba(255,255,255,0.04)",
            border: `1px solid ${isPlaying ? "rgba(160,140,200,0.25)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: isPlaying ? "0 0 12px rgba(160,140,200,0.15)" : undefined,
          }}
        >
          <span className="text-sm">{isPlaying ? "🎵" : "♪"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onProfileClick}
          className="w-10 h-10 rounded-2xl flex items-center justify-center press-feedback"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-sm">👤</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
