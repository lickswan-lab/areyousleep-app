"use client";

import { motion } from "framer-motion";
import type { Worry } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/kimi";

interface WorryCardProps {
  worry: Worry;
  index: number;
  onSeal: () => void;
}

export default function WorryCard({ worry, index, onSeal }: WorryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.8,
        y: -20,
        transition: { duration: 0.4 },
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
      }}
      className="glass-md rounded-2xl p-5"
    >
      {/* 担忧内容 */}
      <p className="text-warm-100 text-base leading-relaxed mb-3">
        {worry.content}
      </p>

      {/* AI 回应 */}
      {worry.aiResponse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-3 border-l-2 border-accent/30 pl-3 ml-1"
        >
          <p className="text-accent/90 text-sm leading-relaxed">
            {worry.aiResponse}
          </p>
        </motion.div>
      )}

      {/* 底部信息条 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {worry.category && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full glass text-warm-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
              {CATEGORY_LABELS[worry.category] || worry.category}
            </span>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSeal}
          className="text-xs px-4 py-2 rounded-full glass glow-sm text-accent
                     press-feedback"
        >
          放进盒子
        </motion.button>
      </div>
    </motion.div>
  );
}
