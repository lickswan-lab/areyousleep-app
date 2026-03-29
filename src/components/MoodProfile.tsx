"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  getWeekMoodSummary,
  getMonthMoodSummary,
  getYearMoodSummary,
  getEmotionLabel,
  getMoodEntries,
  getSleepLogs,
  updateMoodEntry,
  type MoodEntry,
} from "@/lib/store";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";
import MoodSummaryCard from "./MoodSummaryCard";

interface MoodProfileProps {
  onClose: () => void;
}

type Period = "week" | "month" | "year";

const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "今年" },
];

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function emotionColor(emotion: string | null): string {
  if (!emotion) return "rgba(255,255,255,0.1)";
  return EMOTION_COLORS[emotion as MoodEmotion] || "rgba(255,255,255,0.1)";
}

function getTopEmotions(dist: Record<string, number>, count = 3) {
  const total = Object.values(dist).reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  return Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([emotion, c]) => ({
      emotion,
      label: getEmotionLabel(emotion),
      pct: Math.round((c / total) * 100),
    }));
}

// ===== Week Visualization: 7 large circles =====
function WeekDots() {
  const summary = getWeekMoodSummary();
  const dayEmotions: (string | null)[] = Array(7).fill(null);
  summary.entries.forEach((e) => {
    const d = new Date(e.createdAt);
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    if (!dayEmotions[idx]) dayEmotions[idx] = e.emotion || "calm";
  });

  return (
    <div className="flex items-center justify-between px-2">
      {dayEmotions.map((em, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="rounded-full"
            style={{
              width: 36,
              height: 36,
              backgroundColor: emotionColor(em),
            }}
          />
          <span className="text-warm-300/50 text-[11px]">{DAY_LABELS[i]}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ===== Month Visualization: stacked emotion bars =====
function MonthBars() {
  const summary = getMonthMoodSummary();
  const total = Object.values(summary.emotionDistribution).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return <p className="text-warm-300/50 text-sm text-center py-4">暂无数据</p>;
  }

  const sorted = Object.entries(summary.emotionDistribution).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map(([emotion, count]) => (
        <div key={emotion} className="flex items-center gap-3">
          <span className="text-warm-200/70 text-xs w-10 text-right shrink-0">
            {getEmotionLabel(emotion)}
          </span>
          <div className="flex-1 h-5 rounded-full overflow-hidden bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(count / total) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: emotionColor(emotion) }}
            />
          </div>
          <span className="text-warm-300/50 text-xs w-8">
            {Math.round((count / total) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ===== Year Visualization: 12 month blocks =====
function YearBlocks() {
  const yearData = getYearMoodSummary();
  const MONTH_SHORT = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  return (
    <div className="grid grid-cols-6 gap-2">
      {yearData.monthSummaries.map((m, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.05 * i }}
          className="flex flex-col items-center gap-1"
        >
          <div
            className="w-full aspect-square rounded-lg"
            style={{
              backgroundColor: m.count > 0
                ? emotionColor(m.dominantEmotion)
                : "rgba(255,255,255,0.06)",
            }}
          />
          <span className="text-warm-300/40 text-[10px]">{MONTH_SHORT[i]}月</span>
        </motion.div>
      ))}
    </div>
  );
}

// ===== Single Day Share Card (rendered off-screen for screenshot) =====
function DayShareCard({ entry, cardRef }: { entry: MoodEntry; cardRef: React.RefObject<HTMLDivElement | null> }) {
  const date = new Date(entry.createdAt);
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateLabel = `${date.getMonth() + 1}月${date.getDate()}日 · 周${weekDays[date.getDay()]}`;
  const emotionLabel = getEmotionLabel(entry.emotion || "calm");
  const color = emotionColor(entry.emotion || "calm");

  // Find sleep log for this date
  const logs = getSleepLogs();
  const dayLog = logs.find((l) => l.date === entry.date);
  const bedtime = dayLog?.bedtime
    ? new Date(dayLog.bedtime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      ref={cardRef}
      className="w-[320px] noise-overlay rounded-3xl overflow-hidden"
      style={{
        aspectRatio: "3/4",
        background: `linear-gradient(135deg, ${color.replace(/[\d.]+\)$/, "0.15)")}, #0f1528 40%, #070b14)`,
      }}
    >
      <div className="h-full flex flex-col justify-between p-7">
        {/* Top: date */}
        <p className="text-warm-300/40 text-xs tracking-widest">{dateLabel}</p>

        {/* Center: content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-6">
          {/* Emotion dot */}
          <div
            className="w-10 h-10 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 30px ${color.replace(/[\d.]+\)$/, "0.3)")}`,
            }}
          />
          {/* Emotion label */}
          <p className="text-warm-100 text-lg font-light">{emotionLabel}</p>
          {/* User's highlight text */}
          {entry.highlight && (
            <p className="text-warm-200/60 text-sm leading-relaxed max-w-48 italic">
              「{entry.highlight}」
            </p>
          )}
          {/* Bedtime */}
          {bedtime && (
            <p className="text-warm-300/30 text-xs mt-2">
              入睡 {bedtime}
            </p>
          )}
        </div>

        {/* Bottom: watermark */}
        <div className="flex items-center justify-between">
          <div />
          <p className="text-warm-300/15 text-xs tracking-[0.3em]">床前</p>
        </div>
      </div>
    </div>
  );
}

// ===== Timeline Entry with Detail + Share =====
function TimelineEntry({ entry: initialEntry }: { entry: MoodEntry }) {
  const [entry, setEntry] = useState(initialEntry);
  const [showDetail, setShowDetail] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [annotationInput, setAnnotationInput] = useState(entry.annotation || "");
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const date = new Date(entry.createdAt);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
  const color = emotionColor(entry.emotion || "calm");
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const fullDate = `${date.getMonth() + 1}月${date.getDate()}日 周${weekDays[date.getDay()]}`;

  // 找当天睡眠记录
  const logs = getSleepLogs();
  const dayLog = logs.find((l) => l.date === entry.date);
  const bedtime = dayLog?.bedtime
    ? new Date(dayLog.bedtime).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleSaveAnnotation = () => {
    const text = annotationInput.trim();
    updateMoodEntry(entry.id, { annotation: text || undefined });
    setEntry({ ...entry, annotation: text || undefined });
    setIsEditing(false);
  };

  const handleSave = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `床前心情-${entry.date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch { /* fallback */ } finally {
      setGenerating(false);
      setShowShare(false);
    }
  }, [entry.date]);

  return (
    <>
      {/* 时间线条目（可点击） */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setShowDetail(true)}
        className="flex items-start gap-3 py-3 cursor-pointer active:bg-white/[0.02] rounded-lg -mx-1 px-1"
      >
        <span className="text-warm-300/50 text-xs w-10 shrink-0 pt-0.5">{dateStr}</span>
        <div
          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-warm-200/80 text-sm leading-relaxed">
            {entry.highlight || getEmotionLabel(entry.emotion || "calm")}
          </p>
          {entry.annotation && (
            <p className="text-warm-300/30 text-xs mt-1 italic truncate">
              批注：{entry.annotation}
            </p>
          )}
        </div>
        <span className="text-warm-300/20 text-xs shrink-0 mt-0.5">→</span>
      </motion.div>

      {/* 详情浮层 */}
      <AnimatePresence>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-night-900/98 backdrop-blur-lg overflow-y-auto"
          >
            <div className="max-w-sm mx-auto px-6 py-8 safe-top safe-bottom w-full">
              {/* 头部 */}
              <button
                onClick={() => setShowDetail(false)}
                className="text-warm-300/50 text-sm mb-6 press-feedback"
              >
                ← 返回
              </button>

              {/* 日期 + 情绪 */}
              <div className="text-center mb-8">
                <p className="text-warm-300/40 text-xs tracking-wider mb-4">{fullDate}</p>
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-3"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 30px ${color.replace(/[\d.]+\)$/, "0.3)")}`,
                  }}
                />
                <p className="text-warm-100 text-lg font-light">
                  {getEmotionLabel(entry.emotion || "calm")}
                </p>
              </div>

              {/* 当时写的内容 */}
              {entry.highlight && (
                <div
                  className="rounded-2xl p-5 mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${color.replace(/[\d.]+\)$/, "0.08)")}, rgba(255,255,255,0.02))`,
                    border: `1px solid ${color.replace(/[\d.]+\)$/, "0.15)")}`,
                  }}
                >
                  <p className="text-warm-300/40 text-[10px] mb-2">当时写的</p>
                  <p className="text-warm-100/80 text-[15px] leading-relaxed italic">
                    「{entry.highlight}」
                  </p>
                </div>
              )}

              {/* 睡眠记录 */}
              {bedtime && (
                <div className="glass rounded-2xl p-4 mb-4">
                  <p className="text-warm-300/40 text-[10px] mb-1">入睡时间</p>
                  <p className="text-warm-200/70 text-sm">{bedtime}</p>
                </div>
              )}

              {/* 批注区域 */}
              <div className="glass-md rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-warm-300/40 text-[10px]">后来的批注</p>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-accent/60 text-xs press-feedback"
                    >
                      {entry.annotation ? "编辑" : "写批注"}
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={annotationInput}
                      onChange={(e) => setAnnotationInput(e.target.value.slice(0, 200))}
                      rows={3}
                      placeholder="现在回头看，你想对那时的自己说什么？"
                      autoFocus
                      className="w-full bg-transparent text-warm-100 text-sm
                                 placeholder:text-warm-300/25 resize-none
                                 focus:outline-none leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAnnotation}
                        className="flex-1 py-2 rounded-full glass-heavy text-accent text-xs press-feedback"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setAnnotationInput(entry.annotation || ""); }}
                        className="flex-1 py-2 rounded-full glass text-warm-300/40 text-xs press-feedback"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : entry.annotation ? (
                  <p className="text-warm-200/70 text-sm leading-relaxed italic">
                    {entry.annotation}
                  </p>
                ) : (
                  <p className="text-warm-300/25 text-sm">
                    还没有批注
                  </p>
                )}
              </div>

              {/* 操作 */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDetail(false); setShowShare(true); }}
                  className="flex-1 py-3 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback"
                >
                  分享这天
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share overlay */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/95 backdrop-blur-lg"
          >
            {/* Preview card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <DayShareCard entry={entry} cardRef={cardRef} />
            </motion.div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={generating}
                className="px-6 py-2.5 rounded-full glass-heavy glow-sm text-accent text-sm
                           press-feedback disabled:opacity-50"
              >
                {generating ? "生成中..." : "保存图片"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShare(false)}
                className="px-6 py-2.5 rounded-full glass text-warm-300/50 text-sm press-feedback"
              >
                取消
              </motion.button>
            </div>
            <p className="text-warm-300/25 text-xs mt-3">保存后分享到小红书或朋友圈</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function MoodProfile({ onClose }: MoodProfileProps) {
  const [period, setPeriod] = useState<Period>("week");
  const [showCard, setShowCard] = useState(false);

  const summary = useMemo(() => {
    if (period === "week") return getWeekMoodSummary();
    if (period === "month") return getMonthMoodSummary();
    return null;
  }, [period]);

  const yearData = useMemo(() => {
    if (period === "year") return getYearMoodSummary();
    return null;
  }, [period]);

  const emotionDist = useMemo(() => {
    if (summary) return summary.emotionDistribution;
    if (yearData) {
      // Aggregate year emotion distribution
      const dist: Record<string, number> = {};
      yearData.monthSummaries.forEach((m) => {
        if (m.count > 0) dist[m.dominantEmotion] = (dist[m.dominantEmotion] || 0) + m.count;
      });
      return dist;
    }
    return {};
  }, [summary, yearData]);

  const topEmotions = useMemo(() => getTopEmotions(emotionDist), [emotionDist]);

  const timelineEntries = useMemo(() => {
    const all = getMoodEntries();
    const now = new Date();

    if (period === "week") {
      const dow = now.getDay();
      const mondayOffset = dow === 0 ? 6 : dow - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      monday.setHours(0, 0, 0, 0);
      return all.filter((e) => new Date(e.createdAt) >= monday);
    }

    if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return all.filter((e) => new Date(e.createdAt) >= start);
    }

    // year
    const start = new Date(now.getFullYear(), 0, 1);
    return all.filter((e) => new Date(e.createdAt) >= start);
  }, [period]);

  if (showCard) {
    return <MoodSummaryCard period={period} onClose={() => setShowCard(false)} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto"
      >
        <div className="max-w-lg mx-auto px-5 pb-24 safe-top safe-bottom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 pt-6 pb-4"
          >
            <button
              onClick={onClose}
              className="text-warm-300/70 text-sm flex items-center gap-1"
            >
              <span className="text-lg">&larr;</span>
              <span>返回</span>
            </button>
            <h1 className="text-warm-100 text-lg font-medium">我的心情</h1>
          </motion.div>

          {/* Period tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6"
          >
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  period === tab.key
                    ? "glass-md text-warm-100 shadow-[0_0_12px_rgba(255,200,100,0.15)]"
                    : "glass text-warm-300/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Stats visualization */}
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-md rounded-2xl p-5 mb-5"
          >
            {period === "week" && <WeekDots />}
            {period === "month" && <MonthBars />}
            {period === "year" && <YearBlocks />}
          </motion.div>

          {/* Emotion distribution pills */}
          {topEmotions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {topEmotions.map(({ emotion, label, pct }) => (
                <span
                  key={emotion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    backgroundColor: emotionColor(emotion),
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {label}
                  <span className="opacity-70 text-xs">{pct}%</span>
                </span>
              ))}
            </motion.div>
          )}

          {/* Timeline */}
          {timelineEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl px-4 py-2 mb-6"
            >
              <div className="divide-y divide-warm-300/10">
                {timelineEntries.slice(0, 30).map((entry) => (
                  <TimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </motion.div>
          )}

          {timelineEntries.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-warm-300/40 text-sm py-8"
            >
              还没有心情记录，去签到吧
            </motion.p>
          )}

          {/* Generate card CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-night-900 via-night-900/95 to-transparent safe-bottom"
          >
            <button
              onClick={() => setShowCard(true)}
              className="w-full py-3.5 rounded-2xl bg-warm-400/90 text-night-900 font-medium text-sm
                         active:bg-warm-400 transition-colors flex items-center justify-center gap-2"
            >
              <span>生成总结卡片</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
