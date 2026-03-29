"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addMoodEntry, getSeenMoodIds, markMoodSeen, getMoodHistory, addMoodHistory,
  isNightTime, getUserSettings, toggleFavoriteMood, isMoodFavorited,
  incrementRefreshCount, resetRefreshCount,
} from "@/lib/store";
import { MOOD_DESCRIPTIONS, EMOTION_COLORS, type MoodDescription, type MoodEmotion } from "@/lib/mood-descriptions";
import { DAY_MOOD_DESCRIPTIONS } from "@/lib/day-mood-descriptions";
import { getUserProfile, getProfileTags } from "@/lib/profile";

interface MoodCheckInProps {
  onComplete: (mood: number, action: "worry" | "breathe" | "goodnight", emotion?: MoodEmotion) => void;
  onSkip: () => void;
}

// 每张卡片的布局预设——打破矩形排列，创造漂浮感
const CARD_LAYOUTS = [
  // 第一张：左偏大卡，文学感
  { width: "78%", marginLeft: "0%", rotate: -0.8, scale: 1 },
  // 第二张：右偏窄卡
  { width: "70%", marginLeft: "22%", rotate: 0.5, scale: 0.97 },
  // 第三张：居中宽卡
  { width: "85%", marginLeft: "6%", rotate: -0.3, scale: 0.99 },
  // 第四张：左偏小卡
  { width: "65%", marginLeft: "4%", rotate: 0.6, scale: 0.95 },
];

export default function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const [step, setStep] = useState<1 | 2 | "ai" | 3>(1);
  const [options, setOptions] = useState<MoodDescription[]>([]);
  const [selected, setSelected] = useState<MoodDescription | null>(null);
  const [highlight, setHighlight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [continueInput, setContinueInput] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [favorites, setFavorites] = useState<MoodDescription[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customEmotion, setCustomEmotion] = useState<MoodEmotion>("calm");
  const lastBatchRef = useRef<string[]>([]);
  const batchCountRef = useRef(0);

  const fetchBatch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mood-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: getMoodHistory(),
          seenIds: getSeenMoodIds(),
          lastBatchIds: lastBatchRef.current,
        }),
      });
      const data = await res.json();
      const ids: string[] = data.ids || [];
      const descs = ids
        .map((id: string) => MOOD_DESCRIPTIONS.find((d) => d.id === id))
        .filter(Boolean) as MoodDescription[];

      if (descs.length >= 2) {
        setOptions(descs);
        lastBatchRef.current = ids;
        markMoodSeen(ids);
        batchCountRef.current++;
      }
    } catch {
      fallbackPick();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取描述池（夜晚 + 画像筛选 + 自定义）
  const getPool = (): MoodDescription[] => {
    const night = isNightTime();
    const settings = getUserSettings();
    const profileTags = getProfileTags();
    const base = night ? MOOD_DESCRIPTIONS : (DAY_MOOD_DESCRIPTIONS as MoodDescription[]);

    // Tag-based scoring instead of persona filtering
    const scored = base.map(d => {
      let score = 1; // base score for untagged
      if (d.tags && d.tags.length > 0) {
        const matches = d.tags.filter(t => profileTags.includes(t)).length;
        score = matches > 0 ? 1 + matches * 0.5 : 0.3;
      }
      return { ...d, _score: score };
    });

    // Sort by score with randomization, then strip score
    scored.sort((a, b) => b._score - a._score + (Math.random() - 0.5) * 0.3);

    // Add custom moods
    const custom: MoodDescription[] = (settings.customMoods || []).map((text, i) => ({
      id: `custom-${i}`, text, style: "direct" as const, emotion: "calm" as MoodEmotion, moodValue: 3,
    }));

    return [...scored, ...custom];
  };

  const fallbackPick = () => {
    const seen = new Set(getSeenMoodIds());
    const lastBatch = new Set(lastBatchRef.current);
    const pool = getPool().filter((d) => !lastBatch.has(d.id));
    const unseen = pool.filter((d) => !seen.has(d.id));
    const src = (unseen.length >= 4 ? unseen : pool).sort(() => Math.random() - 0.5);
    const result: MoodDescription[] = [];
    const usedEmotions = new Set<string>();
    for (const d of src) {
      if (result.length >= 4) break;
      if (result.length < 2 || !usedEmotions.has(d.emotion)) {
        result.push(d);
        usedEmotions.add(d.emotion);
      }
    }
    for (const d of src) {
      if (result.length >= 4) break;
      if (!result.includes(d)) result.push(d);
    }
    setOptions(result);
    lastBatchRef.current = result.map((d) => d.id);
    markMoodSeen(result.map((d) => d.id));
    batchCountRef.current++;
  };

  // 加载收藏
  useEffect(() => {
    const settings = getUserSettings();
    const favIds = settings.favoriteMoods || [];
    if (favIds.length > 0) {
      const pool = getPool();
      setFavorites(pool.filter((d) => favIds.includes(d.id)));
    }
  }, []);

  // 初次加载
  useEffect(() => {
    resetRefreshCount();
    fallbackPick();
    fetchBatch();
  }, [fetchBatch]);

  // 换一批：本地即时 + 刷新计数
  const handleRefresh = () => {
    const count = incrementRefreshCount();
    if (count >= 3 && !showCustomPrompt) {
      setShowCustomPrompt(true); // 连刷3次，提示自定义
    }
    setMenuOpenId(null);
    setIsExiting(true);
    setTimeout(() => {
      setSelected(null);
      setIsExiting(false);
      fallbackPick();
    }, 250);
  };

  const handleSelect = (desc: MoodDescription) => {
    setSelected(desc);
    addMoodHistory(desc.id);
    setTimeout(() => setStep(2), 1000);
  };

  const handleBack = () => {
    setSelected(null);
    setHighlight("");
    setAiResponse("");
    setStep(1);
  };

  // 写完后请求 AI 疏导
  const fetchAiComfort = async (text: string, emotion: string) => {
    setAiLoading(true);
    setStep("ai");
    addMoodEntry(selected!.moodValue, text || undefined, selected!.emotion);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[情绪: ${emotion}] ${text || selected!.text}`,
        }),
      });
      const data = await res.json();
      setAiResponse(data.response || "嗯，我听到了。今晚先放在这里。");
    } catch {
      // 降级回复
      const fallbacks: Record<string, string> = {
        heavy: "嗯，心里的重量我听到了。今晚先放在这里。",
        anxious: "那些担心的事，大多数不会发生。先深呼吸一下。",
        tired: "辛苦了。今天已经够努力了，可以休息了。",
        numb: "什么都不想也没关系。就这样待着也好。",
        melancholy: "那些说不出口的，我都懂。今晚陪你。",
        calm: "平静是最好的状态。保持这份安宁入睡吧。",
        hopeful: "带着这份温暖入睡，明天也会是好的一天。",
        warm: "真好。记住今天的感觉。",
        angry: "生气说明你在乎。先把火放在这里，别让它烧一晚上。",
        alive: "今天的你在发光呢。好好休息，明天继续。",
      };
      setAiResponse(fallbacks[emotion] || "嗯，记下了。今晚先放在这里。");
    } finally {
      setAiLoading(false);
    }
  };

  // 继续聊
  const handleContinueChat = async () => {
    const text = continueInput.trim();
    if (!text || aiLoading) return;
    setContinueInput("");
    setChatHistory((prev) => [...prev, { role: "user", text }]);
    setAiLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `[情绪: ${selected!.emotion}] ${text}` }),
      });
      const data = await res.json();
      const reply = data.response || "嗯，我在听。";
      setAiResponse(reply);
      setChatHistory((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      const reply = "嗯，我在听。继续说。";
      setAiResponse(reply);
      setChatHistory((prev) => [...prev, { role: "ai", text: reply }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleHighlightDone = () => fetchAiComfort(highlight, selected!.emotion);
  const handleHighlightSkip = () => fetchAiComfort("", selected!.emotion);
  const handleAction = (action: "worry" | "breathe" | "goodnight") => { onComplete(selected!.moodValue, action, selected!.emotion); };

  // ===== 渲染漂浮卡片 =====
  const renderFloatingCard = (desc: MoodDescription, i: number) => {
    const isSelected = selected?.id === desc.id;
    const isFaded = selected !== null && !isSelected;
    const color = EMOTION_COLORS[desc.emotion];
    const layout = CARD_LAYOUTS[i % CARD_LAYOUTS.length];

    // 每张卡有微妙不同的呼吸动画
    const breathDuration = 4 + (i * 1.3);
    const breathDelay = i * 0.7;

    return (
      <motion.button
        key={`${batchCountRef.current}-${desc.id}`}
        initial={{ opacity: 0, y: 30, scale: 0.9, rotate: layout.rotate * 3 }}
        animate={{
          opacity: isExiting ? 0 : isFaded ? 0.15 : 1,
          y: isExiting ? -20 : 0,
          scale: isSelected ? 1.05 : layout.scale,
          rotate: isSelected ? 0 : layout.rotate,
        }}
        transition={{
          delay: isExiting ? 0 : i * 0.12,
          duration: isExiting ? 0.2 : 0.6,
          ease: [0.2, 0.8, 0.3, 1],
        }}
        whileTap={{ scale: 0.95, rotate: 0 }}
        onClick={() => !selected && handleSelect(desc)}
        disabled={!!selected}
        style={{
          width: isSelected ? "90%" : layout.width,
          marginLeft: isSelected ? "5%" : layout.marginLeft,
        }}
        className="relative block text-left transition-all duration-700 ease-out"
      >
        {/* 发光背景层 */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: isSelected
              ? `0 0 40px ${color}, 0 4px 60px ${color.replace(/[\d.]+\)$/, "0.2)")}`
              : `0 0 0px transparent`,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* 呼吸光晕（未选中时） */}
        {!selected && (
          <motion.div
            className="absolute -inset-1 rounded-3xl pointer-events-none"
            animate={{
              boxShadow: [
                `0 0 10px ${color.replace(/[\d.]+\)$/, "0.08)")}`,
                `0 0 28px ${color.replace(/[\d.]+\)$/, "0.2)")}`,
                `0 0 10px ${color.replace(/[\d.]+\)$/, "0.08)")}`,
              ],
            }}
            transition={{
              duration: breathDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: breathDelay,
            }}
          />
        )}

        {/* 卡片主体 */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              ${color.replace(/[\d.]+\)$/, "0.18)")},
              ${color.replace(/[\d.]+\)$/, "0.05)")},
              rgba(15,21,40,0.6))`,
            border: `1px solid ${color.replace(/[\d.]+\)$/, isSelected ? "0.45)" : "0.22)")}`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* 顶部情绪色带 */}
          <div
            className="h-[2.5px] w-full"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${color.replace(/[\d.]+\)$/, "0.8)")}, transparent 95%)`,
              opacity: isSelected ? 1 : 0.6,
            }}
          />

          {/* 角落光斑 */}
          <div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${color.replace(/[\d.]+\)$/, "0.12)")}, transparent 70%)`,
            }}
          />

          <div className={`
            ${desc.style === "metaphor" ? "py-7 px-6" : ""}
            ${desc.style === "scene" ? "py-5 px-6" : ""}
            ${desc.style === "literary" ? "py-5 px-6" : ""}
            ${desc.style === "direct" ? "py-5 px-6" : ""}
            ${desc.style === "question" ? "py-5 px-6" : ""}
          `}>
            {/* direct */}
            {desc.style === "direct" && (
              <p className="text-warm-100/80 text-[15px] leading-relaxed">
                {desc.text}
              </p>
            )}

            {/* literary — 书名号 + 斜体 + 出处 */}
            {desc.style === "literary" && (
              <div className="space-y-2.5">
                <p className="text-warm-100/70 text-[14.5px] leading-relaxed italic tracking-wide">
                  {desc.text}
                </p>
                {desc.sub && (
                  <p
                    className="text-[11px] text-right tracking-widest"
                    style={{ color: color.replace(/[\d.]+\)$/, "0.5)") }}
                  >
                    — {desc.sub}
                  </p>
                )}
              </div>
            )}

            {/* metaphor — 居中大字 */}
            {desc.style === "metaphor" && (
              <div className="text-center space-y-2">
                <p className="text-[17px] leading-relaxed font-light text-warm-100/85">
                  {desc.text}
                </p>
                {desc.sub && (
                  <p className="text-warm-300/30 text-[12px] font-light">{desc.sub}</p>
                )}
              </div>
            )}

            {/* question — 问号发光 */}
            {desc.style === "question" && (
              <p className="text-warm-100/75 text-[15px] leading-relaxed">
                {desc.text.replace(/？$/, "")}
                <motion.span
                  className="inline-block text-[20px] font-light ml-0.5"
                  style={{ color: color.replace(/[\d.]+\)$/, "0.9)") }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  ？
                </motion.span>
              </p>
            )}

            {/* scene — 电影字幕感 */}
            {desc.style === "scene" && (
              <p className="text-warm-100/60 text-[13.5px] leading-[1.9] tracking-wide">
                {desc.text}
              </p>
            )}
          </div>

          {/* ··· 菜单按钮 */}
          {!selected && (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === desc.id ? null : desc.id); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setMenuOpenId(menuOpenId === desc.id ? null : desc.id); } }}
              className="absolute top-2.5 right-3 w-8 h-8 flex items-center justify-center
                         rounded-full glass cursor-pointer"
              style={{ color: color.replace(/[\d.]+\)$/, "0.6)") }}
            >
              <span className="text-base leading-none tracking-widest">···</span>
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {/* Step 1: 漂浮选择 */}
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {isLoading && options.length === 0 ? (
            <motion.div
              className="flex justify-center py-20"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-warm-300/20" />
            </motion.div>
          ) : (
            <>
              {options.map((desc, i) => renderFloatingCard(desc, i))}

              {/* 菜单弹出层 */}
              <AnimatePresence>
                {menuOpenId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50"
                    onClick={() => setMenuOpenId(null)}
                  >
                    <div className="absolute inset-0 bg-night-900/60" />
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-12 left-6 right-6 glass-heavy rounded-2xl p-2 space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(() => {
                        const desc = options.find((d) => d.id === menuOpenId);
                        if (!desc) return null;
                        return (
                          <>
                            <p className="text-warm-200/50 text-xs px-3 pt-2 pb-1 truncate">
                              {desc.text}
                            </p>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                toggleFavoriteMood(desc.id);
                                setFavorites((prev) =>
                                  isMoodFavorited(desc.id)
                                    ? prev.filter((f) => f.id !== desc.id)
                                    : [...prev, desc]
                                );
                                setMenuOpenId(null);
                              }}
                              onKeyDown={() => {}}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl
                                         text-warm-100/80 text-sm active:bg-white/5 cursor-pointer"
                            >
                              <span className="text-base">{isMoodFavorited(desc.id) ? "★" : "☆"}</span>
                              {isMoodFavorited(desc.id) ? "取消收藏" : "收藏这条"}
                            </div>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                // 实时替换：从池中找一个新的替代
                                const pool = getPool();
                                const currentIds = new Set(options.map((o) => o.id));
                                const replacement = pool
                                  .filter((d) => !currentIds.has(d.id))
                                  .sort(() => Math.random() - 0.5)[0];
                                if (replacement) {
                                  setOptions((prev) => prev.map((o) => o.id === desc.id ? replacement : o));
                                }
                                setMenuOpenId(null);
                              }}
                              onKeyDown={() => {}}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl
                                         text-warm-300/50 text-sm active:bg-white/5 cursor-pointer"
                            >
                              <span className="text-base">✕</span>
                              不喜欢这条
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 收藏快速选择 */}
              {selected === null && favorites.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-warm-300/20 text-[10px] w-full mb-1">收藏</span>
                  {favorites.slice(0, 3).map((fav) => (
                    <motion.button
                      key={fav.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelect(fav)}
                      className="text-warm-200/50 text-xs px-3 py-1.5 rounded-full glass press-feedback
                                 border border-warm-300/10"
                      style={{ borderColor: EMOTION_COLORS[fav.emotion]?.replace(/[\d.]+\)$/, "0.2)") }}
                    >
                      {fav.text.length > 10 ? fav.text.slice(0, 10) + "…" : fav.text}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* 自定义情绪输入 */}
              {selected === null && (showCustomPrompt || showCustomInput) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-md rounded-2xl p-4 space-y-3"
                >
                  <p className="text-warm-200/60 text-sm text-center">
                    {showCustomInput ? "写下你现在的状态" : "找不到合适的？自己写一个"}
                  </p>
                  {showCustomInput ? (
                    <div className="space-y-3">
                      {/* 文字输入 */}
                      <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value.slice(0, 50))}
                        placeholder="此刻的感受..."
                        autoFocus
                        className="w-full bg-transparent text-warm-100 text-sm px-4 py-2.5
                                   rounded-full glass placeholder:text-warm-300/25
                                   focus:outline-none focus:ring-1 focus:ring-accent/20"
                      />
                      {/* 情绪类型选择 */}
                      <div>
                        <p className="text-warm-300/30 text-xs mb-2">这个感受更像是</p>
                        <div className="grid grid-cols-5 gap-2">
                          {(Object.entries(EMOTION_COLORS) as [MoodEmotion, string][]).map(([emo, color]) => {
                            const labels: Record<string, string> = {
                              heavy: "沉重", anxious: "焦虑", tired: "疲惫", numb: "麻木",
                              melancholy: "忧郁", calm: "平静", hopeful: "希望", warm: "温暖",
                              angry: "愤怒", alive: "生机",
                            };
                            return (
                              <motion.div
                                key={emo}
                                role="button"
                                tabIndex={0}
                                whileTap={{ scale: 0.85 }}
                                onClick={() => setCustomEmotion(emo)}
                                onKeyDown={() => {}}
                                className={`py-2 rounded-xl text-xs text-center cursor-pointer transition-all
                                  ${customEmotion === emo ? "ring-2 ring-white/30 scale-105" : ""}`}
                                style={{
                                  backgroundColor: color.replace(/[\d.]+\)$/, customEmotion === emo ? "0.45)" : "0.18)"),
                                  color: color.replace(/[\d.]+\)$/, "0.9)"),
                                }}
                              >
                                {labels[emo]}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      {/* 确认按钮 */}
                      <motion.div
                        role="button"
                        tabIndex={0}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (customText.trim()) {
                            const moodValues: Record<string, number> = {
                              heavy: 1, anxious: 2, tired: 2, numb: 3, melancholy: 2,
                              calm: 3, hopeful: 4, warm: 5, angry: 1, alive: 5,
                            };
                            const desc: MoodDescription = {
                              id: `custom-now-${Date.now()}`,
                              text: customText.trim(),
                              style: "direct",
                              emotion: customEmotion,
                              moodValue: moodValues[customEmotion] || 3,
                            };
                            handleSelect(desc);
                            setShowCustomInput(false);
                            setShowCustomPrompt(false);
                            setCustomText("");
                          }
                        }}
                        className="w-full py-3 rounded-full glass-heavy glow-sm text-accent text-sm
                                   text-center cursor-pointer press-feedback"
                        style={{
                          opacity: customText.trim() ? 1 : 0.4,
                          pointerEvents: customText.trim() ? "auto" : "none",
                        }}
                      >
                        确认
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      role="button"
                      tabIndex={0}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowCustomInput(true)}
                      className="w-full py-3 rounded-full glass text-warm-200/60 text-sm
                                 text-center cursor-pointer press-feedback"
                    >
                      自己写一个
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* 换一批 */}
              {selected === null && (
                <motion.div
                  className="flex justify-center pt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    className="w-9 h-9 rounded-full glass flex items-center justify-center
                               text-warm-300/30 text-sm disabled:opacity-20"
                  >
                    <motion.span
                      animate={{ rotate: isLoading ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                    >
                      ↻
                    </motion.span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Step 2: 情绪引导写作 — 每种情绪有独特引导 */}
      {step === 2 && selected && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* 返回按钮 */}
          <button onClick={handleBack} className="text-warm-300/30 text-sm press-feedback active:text-warm-300/50">
            ← 重新选择
          </button>

          {/* 情绪专属引导语 */}
          <p className="text-warm-200/50 text-[15px] text-center">
            {{
              heavy: "心里装着什么？",
              anxious: "在担心什么？",
              tired: "今天累在哪里？",
              numb: "什么都不想说也没关系",
              melancholy: "有什么话一直没说出口？",
              calm: "今晚心里在想什么？",
              hopeful: "今天有什么值得记住的？",
              warm: "让你开心的事是什么？",
              angry: "在气什么？",
              alive: "什么让你感觉活着？",
            }[selected.emotion] || "想说点什么吗？"}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.06)")}, rgba(255,255,255,0.02))`,
              border: `1px solid ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.12)")}`,
            }}
          >
            <div className="h-[2px] w-full" style={{
              background: `linear-gradient(90deg, transparent, ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.3)")}, transparent)`,
            }} />
            <textarea
              value={highlight}
              onChange={(e) => setHighlight(e.target.value.slice(0, 100))}
              rows={2}
              maxLength={100}
              placeholder={{
                heavy: "不用解释，写下来就好...",
                anxious: "写下那些在脑子里转的事...",
                tired: "今天哪一刻最累？",
                numb: "或者就发个呆也行...",
                melancholy: "给今晚的自己留句话...",
                calm: "随便写写...",
                hopeful: "记录这个好的瞬间...",
                warm: "一件小确幸...",
                angry: "想骂什么就骂吧，这里没人看...",
                alive: "什么让你充满能量？",
              }[selected.emotion] || "随便写写..."}
              autoFocus
              className="w-full px-5 py-4 text-warm-100 text-[15px]
                         placeholder:text-warm-300/25 resize-none
                         focus:outline-none bg-transparent"
            />
          </div>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleHighlightDone}
              className="flex-1 py-3 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback">
              写好了
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleHighlightSkip}
              className="flex-1 py-3 rounded-full glass text-warm-300/40 text-sm press-feedback">
              跳过
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step AI: 疏导反馈 */}
      {step === "ai" && selected && (
        <motion.div
          key="step-ai"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {aiLoading ? (
            <motion.div
              className="flex flex-col items-center py-12 gap-4"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.4)") }}
              />
              <p className="text-warm-300/30 text-xs">正在聆听...</p>
            </motion.div>
          ) : (
            <>
              {/* AI 回复 — 用情绪色装饰 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.08)")}, rgba(255,255,255,0.02))`,
                  border: `1px solid ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.15)")}`,
                }}
              >
                <div className="h-[2px] w-full" style={{
                  background: `linear-gradient(90deg, transparent, ${EMOTION_COLORS[selected.emotion]?.replace(/[\d.]+\)$/, "0.4)")}, transparent)`,
                }} />
                <div className="px-6 py-5">
                  <p className="text-warm-100/80 text-[15px] leading-relaxed text-center">
                    {aiResponse}
                  </p>
                </div>
              </motion.div>

              {/* 聊天历史 */}
              {chatHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 max-h-40 overflow-y-auto"
                >
                  {chatHistory.slice(-4).map((msg, i) => (
                    <p key={i} className={`text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "text-warm-200/50 text-right italic"
                        : "text-warm-200/70"
                    }`}>
                      {msg.role === "user" ? `「${msg.text}」` : msg.text}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* 继续输入区 */}
              {showContinue ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={continueInput}
                    onChange={(e) => setContinueInput(e.target.value.slice(0, 200))}
                    onKeyDown={(e) => e.key === "Enter" && handleContinueChat()}
                    placeholder="继续说..."
                    autoFocus
                    className="flex-1 bg-transparent text-warm-100 text-sm px-4 py-2.5
                               rounded-full glass placeholder:text-warm-300/25
                               focus:outline-none focus:ring-1 focus:ring-accent/20"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleContinueChat}
                    disabled={!continueInput.trim() || aiLoading}
                    className="w-10 h-10 rounded-full glass-heavy flex items-center justify-center
                               text-accent text-sm press-feedback disabled:opacity-30"
                  >
                    {aiLoading ? "·" : "→"}
                  </motion.button>
                </motion.div>
              ) : null}

              {/* 按钮组 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-2.5"
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(3)}
                  className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback"
                >
                  准备入睡
                </motion.button>
                {!showContinue && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowContinue(true)}
                    className="w-full py-3 rounded-full glass text-warm-300/40 text-sm press-feedback"
                  >
                    还没说完...
                  </motion.button>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Step 3: 分流 */}
      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          <button onClick={handleBack} className="text-warm-300/30 text-sm press-feedback active:text-warm-300/50">
            ← 重新选择
          </button>
          {selected && selected.moodValue <= 2 ? (
            <>
              <p className="text-warm-200/50 text-[15px] text-center">要写点什么吗？</p>
              <p className="text-warm-300/25 text-xs text-center -mt-3">
                写出来，脑子就不用一直转了
              </p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction("worry")}
                  className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback">
                  写一写
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction("breathe")}
                  className="w-full py-3.5 rounded-full glass text-warm-300/40 text-sm press-feedback">
                  直接关机
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <p className="text-warm-200/50 text-[15px] text-center">做个睡前关机仪式？</p>
              <div className="space-y-2.5">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction("breathe")}
                  className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback">
                  关机引导
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction("goodnight")}
                  className="w-full py-3.5 rounded-full glass text-warm-300/40 text-sm press-feedback">
                  直接晚安
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
