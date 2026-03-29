"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  getWeekMoodSummary,
  getMonthMoodSummary,
  getYearMoodSummary,
  getEmotionLabel,
  type MoodSummary,
} from "@/lib/store";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";

interface MoodSummaryCardProps {
  period: "week" | "month" | "year";
  onClose: () => void;
}

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function emotionColor(emotion: string | null): string {
  if (!emotion) return "rgba(255,255,255,0.1)";
  return EMOTION_COLORS[emotion as MoodEmotion] || "rgba(255,255,255,0.1)";
}

const STARS = [
  { top: "6%", left: "10%", size: 2, delay: 0 },
  { top: "14%", right: "15%", size: 1.5, delay: 0.3 },
  { top: "38%", left: "6%", size: 1, delay: 0.6 },
  { top: "55%", right: "12%", size: 2, delay: 0.2 },
  { top: "72%", left: "22%", size: 1.5, delay: 0.8 },
  { top: "20%", left: "50%", size: 1, delay: 0.5 },
];

function StarsDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
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
  );
}

function Watermark() {
  return (
    <div className="mt-4 flex items-center justify-end">
      <span className="text-warm-300/30 text-xs tracking-widest">床前</span>
    </div>
  );
}

function getMoodPhrase(avgMood: number): string {
  if (avgMood >= 4) return "状态不错";
  if (avgMood >= 3) return "起起伏伏";
  return "有点难";
}

function getDominantPercentage(dist: Record<string, number>): { emotion: string; pct: number } {
  const total = Object.values(dist).reduce((s, v) => s + v, 0);
  if (total === 0) return { emotion: "calm", pct: 0 };
  const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const [emotion, count] = sorted[0];
  return { emotion, pct: Math.round((count / total) * 100) };
}

// ===== Week Card =====
function WeekCardContent({ summary }: { summary: MoodSummary & { weekDayEmotions: (string | null)[] } }) {
  const { emotion, pct } = getDominantPercentage(summary.emotionDistribution);

  return (
    <div className="relative z-10 flex flex-col h-full px-7 py-8">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-warm-300/60 text-xs tracking-wider"
      >
        {summary.label}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 text-warm-100 text-xl font-medium"
      >
        这周的心情
      </motion.h2>

      {/* 7 colored dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center justify-between px-2"
      >
        {summary.weekDayEmotions.map((em, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 300 }}
              className="rounded-full"
              style={{
                width: 28,
                height: 28,
                backgroundColor: emotionColor(em),
              }}
            />
            <span className="text-warm-300/50 text-[10px]">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </motion.div>

      {/* Dominant emotion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex items-baseline gap-2"
      >
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: emotionColor(emotion) }}
        />
        <span className="text-warm-100 text-lg font-medium">
          {getEmotionLabel(emotion)}
        </span>
        <span className="text-warm-300/60 text-sm">{pct}%</span>
      </motion.div>

      {/* Mood phrase */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-3 text-warm-200/70 text-sm"
      >
        {summary.entries.length > 0 ? getMoodPhrase(summary.avgMood) : "还没有记录，试试签到吧"}
      </motion.p>

      <div className="mt-auto" />
      <Watermark />
    </div>
  );
}

// ===== Month Card =====
function MonthCardContent({
  summary,
}: {
  summary: MoodSummary & { moodByDay: (string | null)[] };
}) {
  const { emotion, pct } = getDominantPercentage(summary.emotionDistribution);
  const monthNum = summary.label; // e.g. "3月"

  // Build 5x7 grid (pad to fill rows)
  const days = summary.moodByDay;
  const totalCells = Math.ceil(days.length / 7) * 7;
  const padded = [...days, ...Array(totalCells - days.length).fill(null)];

  return (
    <div className="relative z-10 flex flex-col h-full px-7 py-8">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-warm-300/60 text-xs tracking-wider"
      >
        {summary.label}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 text-warm-100 text-xl font-medium"
      >
        {monthNum}的心情
      </motion.h2>

      {/* 5x7 grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
      >
        {padded.map((em, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.45 + i * 0.01 }}
            className="rounded-sm aspect-square"
            style={{
              backgroundColor: i < days.length ? emotionColor(em) : "transparent",
            }}
          />
        ))}
      </motion.div>

      {/* Dominant emotion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex items-baseline gap-2"
      >
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: emotionColor(emotion) }}
        />
        <span className="text-warm-100 text-lg font-medium">
          {getEmotionLabel(emotion)}
        </span>
        <span className="text-warm-300/60 text-sm">{pct}%</span>
      </motion.div>

      {/* Active days */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-3 text-warm-200/70 text-sm"
      >
        签到了 <span className="text-warm-400 font-semibold">{summary.activeDays}</span> 天
      </motion.p>

      <div className="mt-auto" />
      <Watermark />
    </div>
  );
}

// ===== Year Card =====
function YearCardContent() {
  const yearData = getYearMoodSummary();
  const maxCount = Math.max(...yearData.monthSummaries.map((m) => m.count), 1);
  const { emotion: yearEmotion } = (() => {
    const dist: Record<string, number> = {};
    yearData.monthSummaries.forEach((m) => {
      if (m.count > 0) dist[m.dominantEmotion] = (dist[m.dominantEmotion] || 0) + m.count;
    });
    return getDominantPercentage(dist);
  })();

  return (
    <div className="relative z-10 flex flex-col h-full px-7 py-8">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-warm-300/60 text-xs tracking-wider"
      >
        {yearData.label}
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-5 text-warm-100 text-xl font-medium"
      >
        {yearData.label}年的心情
      </motion.h2>

      {/* 12 horizontal bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-col gap-2"
      >
        {yearData.monthSummaries.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-warm-300/50 text-[10px] w-7 text-right shrink-0">
              {MONTH_LABELS[i]}
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: m.count > 0 ? `${Math.max((m.count / maxCount) * 100, 8)}%` : "4px",
              }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.5, ease: "easeOut" }}
              className="h-3.5 rounded-sm"
              style={{
                backgroundColor: m.count > 0
                  ? emotionColor(m.dominantEmotion)
                  : "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 flex items-baseline gap-4"
      >
        <div>
          <span className="text-warm-400 text-2xl font-bold">{yearData.totalDays}</span>
          <span className="text-warm-200/70 text-sm ml-1">天</span>
        </div>
        {yearData.longestStreak > 0 && (
          <div>
            <span className="text-warm-400 text-2xl font-bold">{yearData.longestStreak}</span>
            <span className="text-warm-200/70 text-sm ml-1">天连续</span>
          </div>
        )}
      </motion.div>

      {/* Dominant */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-3 flex items-center gap-2"
      >
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: emotionColor(yearEmotion) }}
        />
        <span className="text-warm-200/70 text-sm">
          年度情绪：{getEmotionLabel(yearData.dominantEmotion)}
        </span>
      </motion.div>

      <div className="mt-auto" />
      <Watermark />
    </div>
  );
}

export default function MoodSummaryCard({ period, onClose }: MoodSummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [canSave, setCanSave] = useState(false);

  // Build data for week (need per-day emotions)
  const weekSummary = period === "week" ? getWeekMoodSummary() : null;
  const weekDayEmotions: (string | null)[] = (() => {
    if (!weekSummary) return [];
    // Build Mon-Sun emotion array from entries
    const days: (string | null)[] = Array(7).fill(null);
    weekSummary.entries.forEach((e) => {
      const d = new Date(e.createdAt);
      const dow = d.getDay(); // 0=Sun
      const idx = dow === 0 ? 6 : dow - 1;
      if (!days[idx]) days[idx] = e.emotion || "calm";
    });
    return days;
  })();

  const monthSummary = period === "month" ? getMonthMoodSummary() : null;

  useEffect(() => {
    import("html2canvas")
      .then(() => setCanSave(true))
      .catch(() => setCanSave(false));
  }, []);

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      const link = document.createElement("a");
      const periodLabel = period === "week" ? "周" : period === "month" ? "月" : "年";
      link.download = `床前心情${periodLabel}报.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // 静默失败
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/80 backdrop-blur-md p-4"
      >
        {/* 关闭按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-300/50 text-2xl safe-top"
          aria-label="关闭"
        >
          &times;
        </motion.button>

        {/* 卡片主体 */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl"
          style={{ aspectRatio: "3 / 4" }}
        >
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-b from-night-900 via-night-800 to-night-700" />

          {/* 噪点纹理 */}
          <div className="noise-overlay absolute inset-0" />

          {/* 星星 */}
          <StarsDecoration />

          {/* 内容 */}
          {period === "week" && weekSummary && (
            <WeekCardContent
              summary={{ ...weekSummary, weekDayEmotions }}
            />
          )}
          {period === "month" && monthSummary && (
            <MonthCardContent summary={monthSummary} />
          )}
          {period === "year" && <YearCardContent />}
        </motion.div>

        {/* 操作区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-col items-center gap-3"
        >
          {canSave ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-full bg-warm-400/90 text-night-900 font-medium text-sm
                         active:bg-warm-400 transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存图片"}
            </motion.button>
          ) : (
            <p className="text-warm-300/50 text-xs">截图分享到小红书</p>
          )}
          <p className="text-warm-300/40 text-xs">截图分享到小红书</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
