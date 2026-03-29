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
      className="flex items-center justify-between py-4 mb-2"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl">🌙</span>
        <div>
          <h1 className="text-warm-100 text-base font-medium leading-tight">床前</h1>
          <p className="text-warm-300/35 text-xs">{greeting}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* White noise button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onWhiteNoiseToggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center press-feedback transition-all
            ${isPlaying ? "glass-heavy glow-sm" : "glass"}`}
        >
          <span className="text-sm">{isPlaying ? "🎵" : "♪"}</span>
        </motion.button>

        {/* Profile button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full glass flex items-center justify-center press-feedback"
        >
          <span className="text-sm">👤</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
