"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  getWeeklyStats,
  getWeekMoodSummary,
  getEmotionLabel,
  getSleepLogs,
  type WeeklyStats,
  type MoodSummary,
} from "@/lib/store";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";

interface WeeklyReportProps {
  onClose: () => void;
}

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function emotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion as MoodEmotion] || "rgba(255,255,255,0.2)";
}

export default function WeeklyReport({ onClose }: WeeklyReportProps) {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [moodSummary, setMoodSummary] = useState<MoodSummary | null>(null);
  const [avgBedtime, setAvgBedtime] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [canSave, setCanSave] = useState(false);

  useEffect(() => {
    setStats(getWeeklyStats());
    setMoodSummary(getWeekMoodSummary());
    // 计算本周平均入睡时间
    const logs = getSleepLogs();
    const now = new Date();
    const dow = now.getDay();
    const mondayOffset = dow === 0 ? 6 : dow - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const weekLogs = logs.filter((l) => new Date(l.date) >= monday && l.bedtime);
    if (weekLogs.length > 0) {
      const avgMinutes = weekLogs.reduce((sum, l) => {
        const d = new Date(l.bedtime!);
        let mins = d.getHours() * 60 + d.getMinutes();
        if (mins < 360) mins += 1440; // 凌晨6点前算前一天晚上
        return sum + mins;
      }, 0) / weekLogs.length;
      const h = Math.floor((avgMinutes % 1440) / 60);
      const m = Math.round(avgMinutes % 60);
      setAvgBedtime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
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
      link.download = `床前周报-${stats?.dateRange || "本周"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { /* silent */ } finally { setSaving(false); }
  };

  if (!stats || !moodSummary) return null;

  // 情绪占比（排序）
  const emotionEntries = Object.entries(moodSummary.emotionDistribution)
    .sort((a, b) => b[1] - a[1]);
  const totalEmotions = emotionEntries.reduce((s, [, v]) => s + v, 0);

  // 每天的情绪色
  const dayEmotions: (string | null)[] = Array(7).fill(null);
  moodSummary.entries.forEach((e) => {
    const d = new Date(e.createdAt);
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    if (!dayEmotions[idx]) dayEmotions[idx] = e.emotion || "calm";
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/80 backdrop-blur-md p-4"
      >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="absolute top-6 right-6 text-warm-300/50 text-2xl safe-top"
        >
          &times;
        </motion.button>

        {/* === 卡片 === */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl noise-overlay"
          style={{ aspectRatio: "3 / 4" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-night-900 via-night-800 to-night-700" />

          {/* 星星 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { top: "8%", left: "12%", size: 2, delay: 0 },
              { top: "15%", right: "18%", size: 1.5, delay: 0.3 },
              { top: "52%", right: "10%", size: 2, delay: 0.2 },
              { top: "70%", left: "20%", size: 1.5, delay: 0.8 },
              { top: "22%", left: "45%", size: 1, delay: 0.5 },
            ].map((star, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
                className="absolute rounded-full bg-warm-200"
                style={{
                  top: star.top,
                  left: "left" in star ? star.left : undefined,
                  right: "right" in star ? star.right : undefined,
                  width: star.size, height: star.size,
                }}
              />
            ))}
          </div>

          {/* 内容 */}
          <div className="relative z-10 flex flex-col h-full px-7 py-8">
            {/* 日期 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-warm-300/50 text-xs tracking-wider"
            >
              {stats.dateRange}
            </motion.p>

            {/* 主标题 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5"
            >
              <p className="text-warm-100 text-lg">这周的心情</p>
            </motion.div>

            {/* 7天情绪色点 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 flex items-center justify-between px-1"
            >
              {dayEmotions.map((em, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 300 }}
                    className="rounded-full"
                    style={{
                      width: 28, height: 28,
                      backgroundColor: em ? emotionColor(em) : "rgba(255,255,255,0.08)",
                      boxShadow: em ? `0 0 12px ${emotionColor(em).replace(/[\d.]+\)$/, "0.3)")}` : undefined,
                    }}
                  />
                  <span className="text-warm-300/40 text-[9px]">{DAY_LABELS[i]}</span>
                </div>
              ))}
            </motion.div>

            {/* 情绪占比 */}
            {totalEmotions > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 space-y-2.5"
              >
                <p className="text-warm-300/40 text-xs mb-3">情绪占比</p>
                {emotionEntries.slice(0, 4).map(([emotion, count], i) => {
                  const pct = Math.round((count / totalEmotions) * 100);
                  return (
                    <div key={emotion} className="flex items-center gap-3">
                      <span className="text-warm-200/60 text-[11px] w-8 text-right shrink-0">
                        {getEmotionLabel(emotion)}
                      </span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: 0.7 + i * 0.08, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: emotionColor(emotion) }}
                        />
                      </div>
                      <span className="text-warm-300/40 text-[10px] w-7">{pct}%</span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* 担忧数据 */}
            {stats.weekWorries > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-auto pt-4 border-t border-warm-300/10"
              >
                <div className="flex justify-between">
                  {avgBedtime && (
                    <div>
                      <span className="text-warm-400 text-xl font-semibold">{avgBedtime}</span>
                      <span className="text-warm-300/50 text-xs ml-1">平均入睡</span>
                    </div>
                  )}
                  <div>
                    <span className="text-warm-400 text-xl font-semibold">{stats.activeDays}</span>
                    <span className="text-warm-300/50 text-xs ml-1">个夜晚</span>
                  </div>
                  {stats.weekWorries > 0 && (
                    <div>
                      <span className="text-warm-400 text-xl font-semibold">{stats.weekWorries}</span>
                      <span className="text-warm-300/50 text-xs ml-1">件担忧</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 水印 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex items-center justify-end"
            >
              <span className="text-warm-300/20 text-xs tracking-[0.3em]">床前</span>
            </motion.div>
          </div>
        </motion.div>

        {/* 操作 */}
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
          <p className="text-warm-300/40 text-xs">长按保存，分享到小红书</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
