"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface SleepSchedulePickerProps {
  onComplete: (startHour: number, endHour: number) => void;
}

export default function SleepSchedulePicker({ onComplete }: SleepSchedulePickerProps) {
  const [startHour, setStartHour] = useState(22);
  const [endHour, setEndHour] = useState(6);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const fmt = (h: number) => `${String(h).padStart(2, "0")}:00`;

  // Calculate sleep duration
  const duration = startHour > endHour
    ? (24 - startHour + endHour)
    : (endHour - startHour);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <span className="text-4xl mb-4 block">🌙</span>
        <h1 className="text-2xl font-light text-warm-100 mb-2">你通常几点睡？</h1>
        <p className="text-warm-300/40 text-sm">设定你的睡眠时间，我们会在这个时段陪你</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs"
      >
        {/* Sleep/Wake pickers */}
        <div className="flex items-center gap-4 mb-8">
          {/* Bedtime */}
          <div className="flex-1">
            <p className="text-warm-300/50 text-xs text-center mb-2">就寝</p>
            <div className="glass-md rounded-2xl overflow-hidden">
              <div className="h-40 overflow-y-auto snap-y snap-mandatory scrollbar-hide">
                {hours.filter(h => h >= 18 || h <= 4).map((h) => {
                  // Reorder: 18,19,20,21,22,23,0,1,2,3,4
                  return (
                    <button
                      key={h}
                      onClick={() => setStartHour(h)}
                      className={`w-full py-3 snap-center text-center transition-all ${
                        startHour === h
                          ? "text-accent text-lg font-medium bg-accent/10"
                          : "text-warm-300/30 text-sm"
                      }`}
                    >
                      {fmt(h)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <span className="text-warm-300/20 text-xl mt-6">→</span>

          {/* Wake time */}
          <div className="flex-1">
            <p className="text-warm-300/50 text-xs text-center mb-2">起床</p>
            <div className="glass-md rounded-2xl overflow-hidden">
              <div className="h-40 overflow-y-auto snap-y snap-mandatory scrollbar-hide">
                {hours.filter(h => h >= 4 && h <= 12).map((h) => (
                  <button
                    key={h}
                    onClick={() => setEndHour(h)}
                    className={`w-full py-3 snap-center text-center transition-all ${
                      endHour === h
                        ? "text-accent text-lg font-medium bg-accent/10"
                        : "text-warm-300/30 text-sm"
                    }`}
                  >
                    {fmt(h)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Duration display */}
        <p className="text-center text-warm-300/30 text-sm mb-8">
          {fmt(startHour)} → {fmt(endHour)} · 约 {duration} 小时
        </p>

        {/* Continue button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(startHour, endHour)}
          className="w-full py-4 rounded-full glass-heavy glow-sm text-accent text-base press-feedback"
        >
          下一步
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
