"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getRecentMoodByDay } from "@/lib/store";
import { EMOTION_COLORS } from "@/lib/mood-descriptions";

export default function MoodCalendar() {
  const [days, setDays] = useState<{ date: string; emotion: string | null }[]>([]);
  useEffect(() => {
    setDays(getRecentMoodByDay(7));
  }, []);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().slice(0, 10);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mb-2"
    >
      <div
        className="flex gap-2 justify-between"
      >
        {days.map((day) => {
          const d = new Date(day.date + "T00:00:00");
          const dayNum = d.getDate();
          const weekday = weekdays[d.getDay()];
          const today = isToday(day.date);
          const hasEmotion = !!day.emotion;
          const color = day.emotion ? EMOTION_COLORS[day.emotion as keyof typeof EMOTION_COLORS] : null;

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-1 flex-1 ${today ? "relative" : ""}`}
            >
              {/* Weekday label */}
              <span className={`text-[10px] ${today ? "text-accent/60" : "text-warm-300/25"}`}>
                {weekday}
              </span>

              {/* Dot */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all
                  ${today ? "ring-2 ring-accent/40 ring-offset-1 ring-offset-night-900" : ""}`}
                style={{
                  background: hasEmotion
                    ? color?.replace(/[\d.]+\)$/, "0.5)") || "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: hasEmotion
                    ? `1px solid ${color?.replace(/[\d.]+\)$/, "0.3)") || "rgba(255,255,255,0.1)"}`
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className={`text-[10px] ${hasEmotion ? "text-warm-100" : "text-warm-300/25"}`}>
                  {dayNum}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
