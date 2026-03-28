"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addSleepLog,
  getRecentSleepLogs,
  getSleepTrend,
} from "@/lib/store";

type OnsetRange = "<15" | "15-30" | "30-60" | ">60";

const ONSET_OPTIONS: { value: OnsetRange; label: string; minutes: number }[] = [
  { value: "<15", label: "<15分钟", minutes: 10 },
  { value: "15-30", label: "15-30分钟", minutes: 22 },
  { value: "30-60", label: "30-60分钟", minutes: 45 },
  { value: ">60", label: ">1小时", minutes: 75 },
];

function getDefaultBedtime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 30);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

interface SleepDiaryProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function SleepDiary({ onComplete, onClose }: SleepDiaryProps) {
  const [step, setStep] = useState<"form" | "trend">("form");
  const [bedtime, setBedtime] = useState(getDefaultBedtime);
  const [onsetRange, setOnsetRange] = useState<OnsetRange | null>(null);
  const [wakeTime, setWakeTime] = useState(getCurrentTime);

  const handleSubmit = () => {
    if (!onsetRange) return;

    const selected = ONSET_OPTIONS.find((o) => o.value === onsetRange);
    addSleepLog({
      date: new Date().toISOString(),
      bedtime,
      sleepOnsetMinutes: selected?.minutes ?? 30,
      wakeTime,
      worryCount: 0,
      guidanceCompleted: false,
    });

    setStep("trend");
  };

  const trend = useMemo(() => (step === "trend" ? getSleepTrend() : null), [step]);
  const recentLogs = useMemo(
    () => (step === "trend" ? getRecentSleepLogs(7) : []),
    [step]
  );

  // Build chart data: last 7 days, fill in missing days
  const chartData = useMemo(() => {
    if (step !== "trend") return [];
    const days: { label: string; minutes: number | null }[] = [];
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const log = recentLogs.find(
        (l) => new Date(l.date).toDateString() === dateStr
      );
      days.push({
        label: weekdays[d.getDay()],
        minutes: log?.sleepOnsetMinutes ?? null,
      });
    }
    return days;
  }, [step, recentLogs]);

  const maxMinutes = useMemo(() => {
    const vals = chartData
      .map((d) => d.minutes)
      .filter((m): m is number => m !== null);
    return vals.length > 0 ? Math.max(...vals, 30) : 60;
  }, [chartData]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-night-900/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 关闭按钮 */}
      <button
        onClick={step === "trend" ? () => { onComplete(); onClose(); } : onClose}
        className="absolute top-12 right-6 text-warm-300/30 text-sm active:text-warm-300/50"
      >
        {step === "trend" ? "完成" : "退出"}
      </button>

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            className="flex flex-col items-center w-full max-w-sm px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-warm-200/80 text-lg mb-1">睡眠日记</p>
            <p className="text-warm-300/40 text-sm mb-8">
              30秒记录，看见你的进步
            </p>

            {/* Q1: 几点躺下 */}
            <div className="w-full mb-6">
              <label className="text-warm-300/50 text-sm mb-2 block">
                几点躺下？
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full bg-night-700/50 border border-night-600/50 rounded-xl px-4 py-3
                           text-warm-100 text-center text-lg
                           focus:outline-none focus:border-accent/40 transition-colors
                           [color-scheme:dark]"
              />
            </div>

            {/* Q2: 多久睡着 */}
            <div className="w-full mb-6">
              <label className="text-warm-300/50 text-sm mb-2 block">
                大概多久睡着？
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ONSET_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOnsetRange(opt.value)}
                    className={`py-3 rounded-xl text-sm transition-colors ${
                      onsetRange === opt.value
                        ? "bg-accent/20 border border-accent/40 text-accent"
                        : "bg-night-700/50 border border-night-600/50 text-warm-300/60 active:bg-night-600/50"
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Q3: 几点醒 */}
            <div className="w-full mb-8">
              <label className="text-warm-300/50 text-sm mb-2 block">
                今晨几点醒？
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-night-700/50 border border-night-600/50 rounded-xl px-4 py-3
                           text-warm-100 text-center text-lg
                           focus:outline-none focus:border-accent/40 transition-colors
                           [color-scheme:dark]"
              />
            </div>

            {/* 提交 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!onsetRange}
              className={`w-full py-3.5 rounded-full text-base transition-colors ${
                onsetRange
                  ? "bg-accent/20 border border-accent/30 text-accent active:bg-accent/30"
                  : "bg-night-700/30 border border-night-600/30 text-warm-300/20"
              }`}
            >
              记录完成
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="trend"
            className="flex flex-col items-center w-full max-w-sm px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Positive message */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-success/80 text-lg mb-1">已记录 ✓</p>
              <p className="text-warm-200/70 text-sm leading-relaxed max-w-64">
                {trend?.message}
              </p>
            </motion.div>

            {/* Bar chart: onset minutes over 7 days */}
            <motion.div
              className="w-full bg-night-800/60 rounded-2xl p-5 border border-night-600/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <p className="text-warm-300/40 text-xs mb-4">
                近7天入睡时间（分钟）
              </p>
              <div className="flex items-end justify-between gap-2 h-32">
                {chartData.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-24">
                      {day.minutes !== null ? (
                        <motion.div
                          className={`w-full max-w-6 rounded-t-md ${
                            day.minutes <= 30
                              ? "bg-accent/50"
                              : "bg-warm-400/30"
                          }`}
                          initial={{ height: 0 }}
                          animate={{
                            height: `${Math.max((day.minutes / maxMinutes) * 100, 8)}%`,
                          }}
                          transition={{
                            delay: 0.4 + i * 0.06,
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                        />
                      ) : (
                        <div className="w-full max-w-6 h-1 rounded bg-night-600/30" />
                      )}
                    </div>
                    {/* Label */}
                    <span className="text-warm-300/30 text-[10px]">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 30-min reference line label */}
              <div className="flex items-center mt-3 gap-2">
                <div className="h-px flex-1 bg-accent/15" />
                <span className="text-warm-300/25 text-[10px]">
                  30分钟内 = 不错
                </span>
                <div className="h-px flex-1 bg-accent/15" />
              </div>
            </motion.div>

            {/* Stats summary */}
            {trend && trend.totalNights > 0 && (
              <motion.div
                className="flex gap-6 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="text-center">
                  <p className="text-accent/80 text-xl font-light">
                    {Math.round(trend.avgOnsetMinutes)}
                  </p>
                  <p className="text-warm-300/30 text-[10px] mt-0.5">
                    平均入睡(分钟)
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-accent/80 text-xl font-light">
                    {trend.goodNights}/{trend.totalNights}
                  </p>
                  <p className="text-warm-300/30 text-[10px] mt-0.5">
                    30分内入睡
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
