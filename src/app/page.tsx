"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoonBackground from "@/components/MoonBackground";
import WorryInput from "@/components/WorryInput";
import WorryCard from "@/components/WorryCard";
import SealAnimation from "@/components/SealAnimation";
import BreathGuide from "@/components/BreathGuide";
import QuickBreath from "@/components/QuickBreath";
import EmotionGuide from "@/components/EmotionGuide";
import WeeklyReport from "@/components/WeeklyReport";
import Milestone, { shouldShowMilestone } from "@/components/Milestone";
import MoodCheckIn from "@/components/MoodCheckIn";
import GoodnightCard from "@/components/GoodnightCard";
import MoodProfile from "@/components/MoodProfile";
import UserPage from "@/components/UserPage";
import AuthPage from "@/components/AuthPage";
import BetaSurvey, { shouldShowSurvey, deferSurvey } from "@/components/BetaSurvey";
import {
  addWorry,
  updateWorry,
  addSleepLog,
  getTonightWorries,
  getUnresolvedWorries,
  getWorryArchaeology,
  isNightTime,
  getUserSettings,
  updateUserSettings,
  PERSONA_LABELS,
  type Worry,
  type MindState,
  type UserPersona,
} from "@/lib/store";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";

// 心理疏导短句 — 根据情绪类型，在流程中轻柔显示
const COMFORT_PHRASES: Record<string, string[]> = {
  angry: [
    "愤怒说明你在乎",
    "生气是正常的，不需要压住",
    "写出来，让火有个出口",
  ],
  anxious: [
    "担心的事，大部分不会发生",
    "你的焦虑是在保护你",
    "先写下来，脑子就不用一直记着",
  ],
  heavy: [
    "重的东西，放下来就好了",
    "你不需要一个人扛",
    "今晚先放在这里",
  ],
  tired: [
    "累是因为你今天尽力了",
    "允许自己休息",
    "卸下来，明天再说",
  ],
  melancholy: [
    "深夜的感受是最真实的",
    "不需要解释为什么难过",
    "让情绪流过去就好",
  ],
  numb: [
    "什么都不想也是一种感受",
    "不用逼自己有感觉",
    "躺着就好",
  ],
  calm: ["平静是最好的礼物", "享受这份安宁"],
  hopeful: ["带着这份温暖入睡吧"],
  warm: ["今天是个好日子"],
  alive: ["带着今天的能量好好休息"],
};

function getComfortPhrase(emotion?: string | null): string {
  if (!emotion) return "";
  const phrases = COMFORT_PHRASES[emotion] || [];
  return phrases[Math.floor(Math.random() * phrases.length)] || "";
}

type AppPhase = "entry" | "worry" | "morning" | "day";

type Overlay =
  | null
  | "breath-full"
  | "breath-quick"
  | "emotion"
  | "weekly-report"
  | "milestone"
  | "goodnight"
  | "mood-profile"
  | "user-page"
  | "auth";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<AppPhase>("entry");
  const [mindState, setMindState] = useState<MindState | null>(null);
  const [worries, setWorries] = useState<Worry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sealingWorry, setSealingWorry] = useState<Worry | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [unresolvedWorries, setUnresolvedWorries] = useState<Worry[]>([]);
  const [greeting, setGreeting] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [moodEmotion, setMoodEmotion] = useState<MoodEmotion | null>(null);
  const [isNightMode, setIsNightMode] = useState(true);
  const [comfortText, setComfortText] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();

    // 时间问候
    if (hour >= 22 || hour < 2) setGreeting("夜深了");
    else if (hour >= 2 && hour < 6) setGreeting("还没睡");
    else if (hour >= 18) setGreeting("晚上好");
    else if (hour >= 12) setGreeting("下午好");
    else if (hour >= 6) setGreeting("早上好");
    else setGreeting("你好");

    // 首次使用：检查是否登录过
    const user = localStorage.getItem("chuangqian_user");
    if (!user) {
      // 未登录，先显示注册页
      setOverlay("auth");
    }

    // 首次使用：检查是否选过画像
    const settings = getUserSettings();
    if (!settings.persona && user) {
      setShowOnboarding(true);
    }

    // 内测问卷
    if (shouldShowSurvey()) {
      setTimeout(() => setShowSurvey(true), 2000);
    }

    // 纯夜晚工具 — 白天打开直接进个人中心
    const night = isNightTime();
    setIsNightMode(night);

    if (!night) {
      // 非睡觉时段：直接打开个人中心
      setPhase("day");
    } else {
      // 晨间复盘检查
      const unresolved = getUnresolvedWorries();
      if (hour >= 6 && hour < 12 && unresolved.length > 0) {
        setUnresolvedWorries(unresolved);
        setPhase("morning");
      }
    }
  }, []);

  const refreshWorries = useCallback(() => {
    setWorries(getTonightWorries());
  }, []);

  useEffect(() => { refreshWorries(); }, [refreshWorries]);

  // ===== 心情签到完成 =====
  const handleMoodComplete = (moodVal: number, action: "worry" | "breathe" | "goodnight", emotion?: MoodEmotion) => {
    setMood(moodVal);
    if (emotion) {
      setMoodEmotion(emotion);
      setComfortText(getComfortPhrase(emotion));
    }
    if (action === "worry") {
      setMindState(moodVal <= 2 ? "emotion" : "work");
      setPhase("worry");
    } else if (action === "breathe") {
      setOverlay("breath-quick");
    } else {
      // 记录睡眠时间（嵌入签到流程）
      addSleepLog({
        date: new Date().toISOString().slice(0, 10),
        bedtime: new Date().toISOString(),
        worryCount: 0,
        guidanceCompleted: false,
      });
      showGoodnight();
    }
  };

  const selectMindState = (state: MindState) => {
    setMindState(state);
    if (state === "emotion") {
      setOverlay("emotion");
    } else {
      setPhase("worry");
    }
  };

  // ===== 担忧操作 =====
  const handleSubmitWorry = async (content: string) => {
    setIsAnalyzing(true);
    const worry = addWorry(content);
    refreshWorries();
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const analysis = await res.json();
      updateWorry(worry.id, { category: analysis.category, aiResponse: analysis.response });
      refreshWorries();
    } catch { /* silent */ } finally { setIsAnalyzing(false); }
  };

  const handleSeal = (worry: Worry) => setSealingWorry(worry);
  const handleSealComplete = () => {
    if (sealingWorry) {
      updateWorry(sealingWorry.id, { resolved: true });
      setSealingWorry(null);
      refreshWorries();
    }
  };

  const sealAll = () => {
    worries.filter((w) => !w.resolved).forEach((w) => updateWorry(w.id, { resolved: true }));
    refreshWorries();
    // 记录睡眠
    addSleepLog({
      date: new Date().toISOString().slice(0, 10),
      bedtime: new Date().toISOString(),
      worryCount: worries.length,
      guidanceCompleted: true,
    });
    showGoodnight();
  };

  const showGoodnight = () => {
    const stats = getStats();
    if (shouldShowMilestone(stats.activeDays)) {
      setOverlay("milestone");
    } else {
      setOverlay("goodnight");
    }
  };

  const handleBreathComplete = () => { setOverlay(null); sealAll(); };
  const handleEmotionComplete = () => { setOverlay(null); setPhase("worry"); };

  const handleMorningAction = (id: string, outcome: "resolved" | "neverHappened") => {
    updateWorry(id, { resolved: outcome === "resolved", neverHappened: outcome === "neverHappened" });
    setUnresolvedWorries((prev) => prev.filter((w) => w.id !== id));
  };

  const getStats = () => {
    const archaeology = getWorryArchaeology();
    const allDates = new Set<string>();
    const stored = typeof window !== "undefined" ? localStorage.getItem("chuangqian_worries") : null;
    if (stored) {
      const ws: Worry[] = JSON.parse(stored);
      ws.forEach((w) => allDates.add(new Date(w.createdAt).toDateString()));
    }
    return { activeDays: allDates.size, totalWorries: archaeology.total, neverHappenedRate: archaeology.neverHappenedRate };
  };

  if (!mounted) {
    return <main className="relative min-h-dvh flex flex-col"><MoonBackground /></main>;
  }

  return (
    <main className="relative min-h-dvh flex flex-col">
      <MoonBackground />

      <div className="relative z-10 flex-1 flex flex-col px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ===== 非睡觉时段：显示个人中心提示 ===== */}
          {phase === "day" && (
            <motion.div
              key="day"
              className="flex-1 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <span className="text-4xl mb-4 block">🌙</span>
                <h1 className="text-2xl font-light text-warm-100 mb-2">{greeting}</h1>
                <p className="text-warm-300/40 text-sm">晚上再来做睡前仪式</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOverlay("user-page")}
                className="px-6 py-3 rounded-full glass-md glow-sm text-warm-200/70 text-sm press-feedback"
              >
                查看我的心情档案
              </motion.button>
            </motion.div>
          )}

          {/* ===== 夜晚入口：心情签到 + 睡前仪式 ===== */}
          {phase === "entry" && (
            <motion.div
              key="entry"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* 顶部：我的心情 */}
              <motion.div
                className="flex items-center justify-between mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOverlay("user-page")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass press-feedback"
                >
                  <span className="w-2 h-2 rounded-full bg-accent/60" />
                  <span className="text-warm-200/50 text-xs">个人中心</span>
                </motion.button>
                <div />
              </motion.div>

              {/* 问候 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <h1 className="text-3xl font-light text-warm-100 mb-2 tracking-[0.02em]">
                  {greeting}
                </h1>
                <p className="text-warm-300/40 text-base">
                  选一个最像你现在的状态
                </p>
              </motion.div>

              {/* 心情签到 */}
              <MoodCheckIn
                onComplete={handleMoodComplete}
                onSkip={() => {}}
              />

              {/* 分隔线 */}
              <motion.div
                className="flex items-center gap-4 my-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex-1 h-px bg-warm-300/10" />
                <span className="text-warm-300/20 text-xs">或者</span>
                <div className="flex-1 h-px bg-warm-300/10" />
              </motion.div>

              {/* 直接入口 */}
              <motion.div
                className="space-y-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { state: "work" as MindState, emoji: "💭", title: "脑子里有事想写下来" },
                  { state: "unsure" as MindState, emoji: "🌙", title: "直接做关机仪式" },
                  { state: "sleep" as MindState, emoji: "😴", title: "直接睡" },
                ].map((item) => (
                  <motion.button
                    key={item.state}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (item.state === "sleep") {
                        addSleepLog({
                          date: new Date().toISOString().slice(0, 10),
                          bedtime: new Date().toISOString(),
                          worryCount: 0,
                          guidanceCompleted: false,
                        });
                        showGoodnight();
                      } else if (item.state === "unsure") setOverlay("breath-quick");
                      else selectMindState(item.state);
                    }}
                    className="w-full text-left px-5 py-4 rounded-2xl glass-md press-feedback tap-highlight"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.emoji}</span>
                      <p className="text-warm-200/70 text-sm">{item.title}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {/* 底部快捷 */}
              <motion.div
                className="mt-auto pt-6 pb-4 flex gap-3 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <button onClick={() => setOverlay("weekly-report")}
                  className="text-warm-300/30 text-xs px-3 py-1.5 rounded-full glass press-feedback">
                  📊 本周报告
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ===== 担忧清单 ===== */}
          {phase === "worry" && (
            <motion.div
              key="worry"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <button onClick={() => setPhase("entry")}
                  className="text-warm-300/30 text-sm mb-4 active:text-warm-300/50">
                  ← 返回
                </button>
                {moodEmotion && (
                  <div className="h-[3px] w-16 rounded-full mb-4"
                    style={{ backgroundColor: EMOTION_COLORS[moodEmotion]?.replace(/[\d.]+\)$/, "0.6)") }} />
                )}
                <h2 className="text-xl font-light text-warm-100 mb-1">
                  {moodEmotion === "angry" && "那些让你生气的事"}
                  {moodEmotion === "anxious" && "脑子里在担心什么"}
                  {moodEmotion === "heavy" && "今晚心里装着什么"}
                  {moodEmotion === "tired" && "今天累在哪里"}
                  {moodEmotion === "melancholy" && "有些话想说出来"}
                  {!moodEmotion || !["angry", "anxious", "heavy", "tired", "melancholy"].includes(moodEmotion) ? (
                    <>
                      {mindState === "work" && "把脑子里的事写出来"}
                      {mindState === "emotion" && "今晚心里装着什么"}
                      {mindState === "unsure" && "随便写点什么"}
                    </>
                  ) : null}
                </h2>
                <p className="text-warm-300/30 text-sm">
                  {moodEmotion === "angry" ? "写出来，别让它在心里烧一晚上。"
                    : moodEmotion === "tired" ? "卸下来，明天再扛。"
                    : "写出来就不用怕忘了。写完可以放进盒子里。"}
                </p>
              </div>

              <WorryInput onSubmit={handleSubmitWorry} isAnalyzing={isAnalyzing} />

              {/* 疏导短句 — 不说教，轻柔的一行字 */}
              {comfortText && (
                <motion.p
                  className="text-center text-warm-300/20 text-xs mt-4 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {comfortText}
                </motion.p>
              )}

              <div className="mt-4 space-y-3 flex-1 overflow-y-auto pb-28">
                <AnimatePresence>
                  {worries.filter((w) => !w.resolved).map((worry, index) => (
                    <WorryCard key={worry.id} worry={worry} index={index} onSeal={() => handleSeal(worry)} />
                  ))}
                </AnimatePresence>

                {worries.filter((w) => !w.resolved).length === 0 && !isAnalyzing && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-center text-warm-300/20 text-sm mt-12"
                  >
                    {worries.length > 0 ? "都放进盒子里了" : "写下第一件让你睡不着的事..."}
                  </motion.p>
                )}
              </div>

              <motion.div
                className="fixed bottom-0 left-0 right-0 p-6 pb-8
                           bg-gradient-to-t from-night-900 via-night-900/95 to-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {worries.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOverlay("breath-full")}
                        className="flex-1 py-3 rounded-full glass-md glow-sm text-accent text-sm press-feedback">
                        关机引导 · 7分钟
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setOverlay("breath-quick")}
                        className="flex-1 py-3 rounded-full glass text-accent/70 text-sm press-feedback">
                        快速版 · 3分钟
                      </motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={sealAll}
                      className="w-full py-3 rounded-full glass text-warm-300/40 text-sm press-feedback">
                      直接睡
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ===== 晨间复盘 ===== */}
          {phase === "morning" && (
            <motion.div
              key="morning"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-light text-warm-100 mb-2">早上好</h2>
                <p className="text-warm-300/40 text-sm">昨晚放进盒子的事，现在看看？</p>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pb-24">
                <AnimatePresence>
                  {unresolvedWorries.map((worry, index) => (
                    <motion.div
                      key={worry.id} layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }} transition={{ delay: index * 0.1 }}
                      className="glass-md rounded-2xl p-5"
                    >
                      <p className="text-warm-100 text-base mb-4 leading-relaxed">{worry.content}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleMorningAction(worry.id, "neverHappened")}
                          className="flex-1 py-2.5 rounded-full bg-success/10 border border-success/20 text-success/80 text-sm press-feedback">
                          没发生 / 不重要了
                        </button>
                        <button onClick={() => handleMorningAction(worry.id, "resolved")}
                          className="flex-1 py-2.5 rounded-full glass text-warm-300/50 text-sm press-feedback">
                          我去处理
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {unresolvedWorries.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-16">
                    <p className="text-warm-200/60 text-lg mb-2">全部处理完了</p>
                    <p className="text-warm-300/30 text-sm">看，大多数担忧都没那么可怕</p>
                    <button onClick={() => setPhase("day")}
                      className="mt-8 px-6 py-2.5 rounded-full glass text-warm-300/40 text-sm press-feedback">
                      今晚见
                    </button>
                  </motion.div>
                )}
              </div>

              {unresolvedWorries.length > 0 && (
                <motion.div className="fixed bottom-0 left-0 right-0 p-6 pb-8
                  bg-gradient-to-t from-night-900 via-night-900/95 to-transparent">
                  <button onClick={() => setPhase("day")}
                    className="w-full py-3 rounded-full glass text-warm-300/40 text-sm press-feedback">
                    晚点再看
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== 覆盖层 ===== */}
      <SealAnimation isVisible={!!sealingWorry} worryText={sealingWorry?.content || ""} onComplete={handleSealComplete} />

      <AnimatePresence>
        {overlay === "breath-full" && <BreathGuide onComplete={handleBreathComplete} onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "breath-quick" && <QuickBreath onComplete={handleBreathComplete} onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "emotion" && (
          <EmotionGuide onComplete={handleEmotionComplete} onClose={() => { setOverlay(null); setPhase("worry"); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "weekly-report" && <WeeklyReport onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "milestone" && (
          <Milestone {...getStats()} onClose={() => { setOverlay(null); setOverlay("goodnight"); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "goodnight" && (
          <GoodnightCard mood={mood} emotion={moodEmotion} onClose={() => { setOverlay(null); setPhase("entry"); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "mood-profile" && (
          <MoodProfile onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "user-page" && (
          <UserPage onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {overlay === "auth" && (
          <AuthPage onClose={() => setOverlay(null)} onSuccess={() => setOverlay(null)} />
        )}
      </AnimatePresence>

      {/* 内测问卷 */}
      <AnimatePresence>
        {showSurvey && (
          <BetaSurvey
            onClose={() => setShowSurvey(false)}
            onDefer={() => { deferSurvey(); setShowSurvey(false); }}
          />
        )}
      </AnimatePresence>

      {/* 首次使用：画像选择 */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10"
            >
              <span className="text-4xl mb-4 block">🌙</span>
              <h1 className="text-3xl font-light text-warm-100 mb-3">睡了么</h1>
              <p className="text-warm-300/50 text-sm">选一个最像你的身份</p>
              <p className="text-warm-300/30 text-xs mt-1">这会帮我更懂你的心情</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm grid grid-cols-2 gap-3"
            >
              {([
                { key: "highschool" as UserPersona, label: "中学生", icon: "📚", sub: "考试·青春·成长", color: "rgba(100,180,220,0.3)", textColor: "rgba(100,180,220,0.9)", silhouette: "M20,28 Q20,22 24,20 Q28,18 28,14 Q28,10 24,8 Q20,6 16,8 Q12,10 12,14 Q12,18 16,20 Q20,22 20,28 Z M10,38 Q12,30 20,28 Q28,30 30,38 Z" },
                { key: "college" as UserPersona, label: "大学生", icon: "🎓", sub: "论文·实习·未来", color: "rgba(120,160,200,0.3)", textColor: "rgba(120,160,200,0.9)", silhouette: "M20,6 L8,14 L20,22 L32,14 Z M20,22 L20,28 M10,38 Q12,30 20,28 Q28,30 30,38 Z" },
                { key: "worker" as UserPersona, label: "打工人", icon: "💼", sub: "加班·通勤·KPI", color: "rgba(180,145,100,0.3)", textColor: "rgba(180,145,100,0.9)", silhouette: "M20,26 Q20,20 24,18 Q28,16 28,12 Q28,8 24,6 Q20,4 16,6 Q12,8 12,12 Q12,16 16,18 Q20,20 20,26 Z M8,38 Q10,30 20,28 Q30,30 32,38 Z M14,28 L14,38 M26,28 L26,38" },
                { key: "homemaker" as UserPersona, label: "全职父母", icon: "🏠", sub: "带娃·家务·自我", color: "rgba(200,140,160,0.3)", textColor: "rgba(200,140,160,0.9)", silhouette: "M18,24 Q18,18 14,16 Q10,14 10,10 Q10,6 14,4 Q18,2 22,4 M28,20 Q28,16 30,14 Q32,12 32,10 Q32,8 30,6 M8,38 Q10,30 18,28 Q22,30 24,38 M24,38 Q26,32 28,28 Q32,30 34,38" },
                { key: "entrepreneur" as UserPersona, label: "创业/投资", icon: "🚀", sub: "融资·产品·孤独", color: "rgba(160,120,200,0.3)", textColor: "rgba(160,120,200,0.9)", silhouette: "M20,26 Q20,20 24,18 Q28,16 28,12 Q28,8 24,6 Q20,4 16,6 Q12,8 12,12 Q12,16 16,18 Q20,20 20,26 Z M6,38 Q8,28 20,26 Q32,28 34,38 Z" },
                { key: "freelance" as UserPersona, label: "自由职业", icon: "☕", sub: "自律·收入·自由", color: "rgba(140,180,140,0.3)", textColor: "rgba(140,180,140,0.9)", silhouette: "M20,26 Q20,20 24,18 Q28,16 28,12 Q28,8 24,6 Q20,4 16,6 Q12,8 12,12 Q12,16 16,18 Q20,20 20,26 Z M10,38 Q12,30 20,28 Q28,30 30,38 Z" },
                { key: "general" as UserPersona, label: "不想选", icon: "🌙", sub: "跳过", color: "rgba(150,150,170,0.15)", textColor: "rgba(150,150,170,0.6)", silhouette: "" },
              ]).map((item, i) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 200 }}
                  whileTap={{ scale: 0.9, rotate: -2 }}
                  onClick={() => {
                    updateUserSettings({ persona: item.key });
                    setShowOnboarding(false);
                  }}
                  className={`relative overflow-hidden rounded-2xl text-left press-feedback
                    ${item.key === "general" ? "col-span-2 py-3 px-5" : "aspect-square p-4 flex flex-col justify-between"}`}
                  style={{
                    background: `linear-gradient(145deg, ${item.color}, rgba(15,21,40,0.85))`,
                    border: `1px solid ${item.color.replace(/[\d.]+\)$/, "0.25)")}`,
                  }}
                >
                  {/* 人物剪影 SVG */}
                  {item.silhouette && item.key !== "general" && (
                    <svg
                      viewBox="0 0 40 40"
                      className="absolute bottom-0 right-0 opacity-15 pointer-events-none"
                      style={{ width: "60%", height: "60%" }}
                    >
                      <path
                        d={item.silhouette}
                        fill={item.textColor}
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                  {/* 角落光斑 */}
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${item.color}, transparent 70%)` }}
                  />
                  {/* 内容 */}
                  <div>
                    <span className={`${item.key === "general" ? "text-xl" : "text-2xl"} block mb-1`}>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: item.textColor }}>{item.label}</p>
                    {item.sub && (
                      <p className="text-[10px] mt-0.5" style={{ color: item.textColor.replace(/[\d.]+\)$/, "0.5)") }}>
                        {item.sub}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
