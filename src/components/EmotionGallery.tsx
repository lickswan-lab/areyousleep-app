"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMoodEntries, getEmotionLabel, type MoodEntry } from "@/lib/store";
import { EMOTION_COLORS } from "@/lib/mood-descriptions";

interface EmotionGalleryProps {
  onClose: () => void;
}

export default function EmotionGallery({ onClose }: EmotionGalleryProps) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  useEffect(() => {
    setEntries(getMoodEntries());
  }, []);

  // 按月分组
  const groupedByMonth: Record<string, MoodEntry[]> = {};
  entries.forEach(e => {
    const month = e.date.slice(0, 7); // YYYY-MM
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(e);
  });

  const months = Object.keys(groupedByMonth).sort().reverse();

  // 统计
  const totalDays = new Set(entries.map(e => e.date)).size;
  const dominantEmotion = (() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => { counts[e.emotion || "calm"] = (counts[e.emotion || "calm"] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";
  })();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const formatMonth = (monthStr: string) => {
    const [y, m] = monthStr.split("-");
    return `${y}年${parseInt(m)}月`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom"
    >
      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">← 返回</button>
          <h2 className="text-warm-100 text-base">情绪画廊</h2>
          <div className="w-10" />
        </div>

        {/* 概览卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS]?.replace(/[\d.]+\)$/, "0.15)")}, rgba(255,255,255,0.02))`,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS]?.replace(/[\d.]+\)$/, "0.3)")}, transparent 70%)` }}
          />
          <div className="relative z-10">
            <p className="text-warm-300/40 text-xs mb-3">你的情绪足迹</p>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-warm-100 text-3xl font-light">{totalDays}</p>
                <p className="text-warm-300/30 text-xs">天记录</p>
              </div>
              <div>
                <p className="text-warm-100 text-3xl font-light">{entries.length}</p>
                <p className="text-warm-300/30 text-xs">次签到</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full"
                    style={{ background: EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS] }} />
                  <p className="text-warm-100 text-sm">{getEmotionLabel(dominantEmotion)}</p>
                </div>
                <p className="text-warm-300/30 text-xs">最常情绪</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 情绪色带 — 最近30天 */}
        <div className="mb-6">
          <p className="text-warm-300/30 text-xs mb-2">最近30天</p>
          <div className="flex gap-0.5 h-8 rounded-xl overflow-hidden">
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const dateStr = d.toISOString().slice(0, 10);
              const entry = entries.find(e => e.date === dateStr);
              const color = entry?.emotion
                ? EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS]
                : null;
              return (
                <div key={dateStr} className="flex-1 transition-all hover:opacity-80 cursor-pointer"
                  style={{ background: color?.replace(/[\d.]+\)$/, "0.6)") || "rgba(255,255,255,0.03)" }}
                  onClick={() => entry && setSelectedEntry(entry)}
                  title={dateStr}
                />
              );
            })}
          </div>
        </div>

        {/* 时间线 */}
        {months.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">🌙</span>
            <p className="text-warm-200/50 text-sm">还没有情绪记录</p>
            <p className="text-warm-300/30 text-xs mt-1">从今晚开始，记录你的每一个夜晚</p>
          </div>
        ) : (
          <div className="space-y-6">
            {months.map(month => (
              <div key={month}>
                <p className="text-warm-200/50 text-sm mb-3">{formatMonth(month)}</p>
                <div className="space-y-2">
                  {groupedByMonth[month].map(entry => {
                    const color = EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || "rgba(100,145,220,0.7)";
                    return (
                      <motion.button
                        key={entry.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left press-feedback transition-all"
                        style={{
                          background: selectedEntry?.id === entry.id
                            ? color.replace(/[\d.]+\)$/, "0.1)")
                            : "rgba(255,255,255,0.02)",
                          border: `1px solid ${selectedEntry?.id === entry.id
                            ? color.replace(/[\d.]+\)$/, "0.15)")
                            : "rgba(255,255,255,0.04)"}`,
                        }}
                      >
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-warm-100 text-sm">{getEmotionLabel(entry.emotion || "calm")}</span>
                            <span className="text-warm-300/25 text-[10px]">{formatDate(entry.date)}</span>
                          </div>
                          {entry.highlight && (
                            <p className="text-warm-300/40 text-xs mt-0.5 truncate">{entry.highlight}</p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 详情弹出 */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-5 pb-8 safe-bottom"
              style={{
                background: "rgba(15,20,35,0.98)",
                borderTop: `1px solid ${EMOTION_COLORS[selectedEntry.emotion as keyof typeof EMOTION_COLORS]?.replace(/[\d.]+\)$/, "0.15)") || "rgba(255,255,255,0.08)"}`,
              }}
            >
              <div className="w-10 h-1 rounded-full bg-warm-300/15 mx-auto mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 rounded-full"
                  style={{ background: EMOTION_COLORS[selectedEntry.emotion as keyof typeof EMOTION_COLORS] }} />
                <span className="text-warm-100 text-base">{getEmotionLabel(selectedEntry.emotion || "calm")}</span>
                <span className="text-warm-300/25 text-xs ml-auto">
                  {formatDate(selectedEntry.date)} · {new Date(selectedEntry.createdAt).toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              {selectedEntry.highlight && (
                <p className="text-warm-200/70 text-sm leading-relaxed mb-3">"{selectedEntry.highlight}"</p>
              )}
              {selectedEntry.annotation && (
                <p className="text-warm-300/40 text-xs pl-3" style={{ borderLeft: "2px solid rgba(255,255,255,0.08)" }}>
                  {selectedEntry.annotation}
                </p>
              )}
              <button onClick={() => setSelectedEntry(null)} className="w-full mt-4 py-2 text-warm-300/30 text-xs press-feedback">
                关闭
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
