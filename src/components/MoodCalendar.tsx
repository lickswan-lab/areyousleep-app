"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getRecentMoodByDay } from "@/lib/store";
import { EMOTION_COLORS } from "@/lib/mood-descriptions";

export default function MoodCalendar() {
  const [days, setDays] = useState<{ date: string; emotion: string | null }[]>([]);
  useEffect(() => { setDays(getRecentMoodByDay(7)); }, []);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const isToday = (dateStr: string) => dateStr === new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="rounded-2xl px-3 py-3 mb-2"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="flex justify-between">
        {days.map((day, i) => {
          const d = new Date(day.date + "T00:00:00");
          const dayNum = d.getDate();
          const weekday = weekdays[d.getDay()];
          const today = isToday(day.date);
          const hasEmotion = !!day.emotion;
          const color = day.emotion ? EMOTION_COLORS[day.emotion as keyof typeof EMOTION_COLORS] : null;

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.04 }}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <span className={`text-[10px] ${today ? "text-warm-200/50" : "text-warm-300/20"}`}>
                {weekday}
              </span>

              <div
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: hasEmotion
                    ? color?.replace(/[\d.]+\)$/, "0.35)") || "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.03)",
                  border: today
                    ? `1.5px solid rgba(210,170,100,0.4)`
                    : hasEmotion
                      ? `1px solid ${color?.replace(/[\d.]+\)$/, "0.2)") || "rgba(255,255,255,0.08)"}`
                      : "1px solid rgba(255,255,255,0.04)",
                  boxShadow: today ? "0 0 8px rgba(210,170,100,0.15)" : undefined,
                }}
              >
                <span className={`text-[10px] ${today ? "text-warm-100" : hasEmotion ? "text-warm-100/80" : "text-warm-300/20"}`}>
                  {dayNum}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
