"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoonBackground from "@/components/MoonBackground";
import SealAnimation from "@/components/SealAnimation";
import BreathGuide from "@/components/BreathGuide";
import QuickBreath from "@/components/QuickBreath";
import EmotionGuide from "@/components/EmotionGuide";
import WeeklyReport from "@/components/WeeklyReport";
import Milestone, { shouldShowMilestone } from "@/components/Milestone";
import GoodnightCard from "@/components/GoodnightCard";
import MoodProfile from "@/components/MoodProfile";
import UserPage from "@/components/UserPage";
import AuthPage from "@/components/AuthPage";
import BetaSurvey, { shouldShowSurvey, deferSurvey } from "@/components/BetaSurvey";
import SleepSchedulePicker from "@/components/SleepSchedulePicker";
import OnboardingQuestionnaire from "@/components/OnboardingQuestionnaire";
import HomeHeader from "@/components/HomeHeader";
import EmotionDiaryBlock from "@/components/EmotionDiaryBlock";
import SleepToolsBlock from "@/components/SleepToolsBlock";
import ThoughtsContainer from "@/components/ThoughtsContainer";
import WhiteNoisePanel from "@/components/WhiteNoisePanel";
import MoodCalendar from "@/components/MoodCalendar";
import EmotionCardList from "@/components/EmotionCardList";
import EmotionCardDetail from "@/components/EmotionCardDetail";
import SleepRitualEditor from "@/components/SleepRitualEditor";
import SleepRitualPlayer from "@/components/SleepRitualPlayer";
import { isProfileComplete } from "@/lib/profile";
import type { EmotionCard } from "@/lib/emotion-cards";
import type { SleepRitual } from "@/lib/sleep-ritual";
import {
  addSleepLog,
  updateWorry,
  getUnresolvedWorries,
  getWorryArchaeology,
  isNightTime,
  getUserSettings,
  updateUserSettings,
  type Worry,
} from "@/lib/store";
import { type MoodEmotion } from "@/lib/mood-descriptions";

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
  | "auth"
  | "emotion-cards"    // 情绪卡片列表
  | "emotion-detail"   // 卡片详情
  | "sleep-tools"      // 助眠工具详情
  | "thoughts"         // 思绪容器详情
  | "ritual-editor"    // 睡眠仪式编辑
  | "ritual-player";   // 睡眠仪式执行

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [greeting, setGreeting] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [moodEmotion, setMoodEmotion] = useState<MoodEmotion | null>(null);
  const [sealingWorry, setSealingWorry] = useState<Worry | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<null | "sleep-schedule" | "questionnaire">(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [whiteNoiseOpen, setWhiteNoiseOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<EmotionCard | null>(null);
  const [playingRitual, setPlayingRitual] = useState<SleepRitual | null>(null);

  // 晨间复盘
  const [showMorning, setShowMorning] = useState(false);
  const [unresolvedWorries, setUnresolvedWorries] = useState<Worry[]>([]);

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
      setOverlay("auth");
    }

    // 首次使用：检查是否完成用户画像
    if (user && !isProfileComplete()) {
      setOnboardingStep("sleep-schedule");
    }

    // 内测问卷
    if (shouldShowSurvey()) {
      setTimeout(() => setShowSurvey(true), 2000);
    }

    // 晨间复盘检查
    const unresolved = getUnresolvedWorries();
    if (hour >= 6 && hour < 12 && unresolved.length > 0) {
      setUnresolvedWorries(unresolved);
      setShowMorning(true);
    }
  }, []);

  // ===== 情绪卡片完成 =====
  const handleCardComplete = (moodVal: number, action: "worry" | "breathe" | "goodnight", emotion?: MoodEmotion) => {
    setMood(moodVal);
    if (emotion) setMoodEmotion(emotion);
    setOverlay(null);
    setSelectedCard(null);

    if (action === "breathe") {
      setOverlay("breath-quick");
    } else if (action === "goodnight") {
      addSleepLog({
        date: new Date().toISOString().slice(0, 10),
        bedtime: new Date().toISOString(),
        worryCount: 0,
        guidanceCompleted: false,
      });
      triggerGoodnight();
    }
    // action === "worry" — 用户可以直接在思绪容器焦虑 tab 中写
  };

  // ===== 担忧封印 =====
  const handleSealWorry = (worry: Worry) => setSealingWorry(worry);
  const handleSealComplete = () => {
    if (sealingWorry) {
      updateWorry(sealingWorry.id, { resolved: true });
      setSealingWorry(null);
    }
  };

  // ===== 晚安流程 =====
  const triggerGoodnight = () => {
    const stats = getStats();
    if (shouldShowMilestone(stats.activeDays)) {
      setOverlay("milestone");
    } else {
      setOverlay("goodnight");
    }
  };

  const handleBreathComplete = () => {
    setOverlay(null);
    addSleepLog({
      date: new Date().toISOString().slice(0, 10),
      bedtime: new Date().toISOString(),
      worryCount: 0,
      guidanceCompleted: true,
    });
    triggerGoodnight();
  };

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
    return <main className="relative min-h-dvh"><MoonBackground /></main>;
  }

  return (
    <main className="relative min-h-dvh">
      <MoonBackground />

      <div className="relative z-10 overflow-y-auto min-h-dvh px-5 pb-8 safe-top safe-bottom">

        {/* ===== 顶栏 ===== */}
        <HomeHeader
          greeting={greeting}
          onWhiteNoiseToggle={() => setWhiteNoiseOpen(true)}
          onProfileClick={() => setOverlay("user-page")}
        />

        {/* ===== 晨间复盘横幅 ===== */}
        <AnimatePresence>
          {showMorning && unresolvedWorries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-md rounded-2xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-warm-100 text-sm">昨晚的担忧</p>
                <button onClick={() => setShowMorning(false)} className="text-warm-300/30 text-xs press-feedback">
                  稍后再看
                </button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {unresolvedWorries.map((w) => (
                  <div key={w.id} className="glass rounded-xl p-3">
                    <p className="text-warm-200/70 text-xs mb-2 line-clamp-2">{w.content}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleMorningAction(w.id, "neverHappened")}
                        className="flex-1 py-1.5 rounded-full text-[10px] bg-success/10 text-success/70 press-feedback">
                        没发生
                      </button>
                      <button onClick={() => handleMorningAction(w.id, "resolved")}
                        className="flex-1 py-1.5 rounded-full text-[10px] glass text-warm-300/40 press-feedback">
                        处理了
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 两个并排大板块 ===== */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <EmotionDiaryBlock onOpen={() => setOverlay("emotion-cards")} />
          <SleepToolsBlock onOpen={() => setOverlay("sleep-tools")} />
        </div>

        {/* ===== 焦虑/灵感/思绪 入口 ===== */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOverlay("thoughts")}
          className="w-full rounded-2xl text-left press-feedback overflow-hidden relative mb-4"
          style={{
            height: "100px",
            background: "linear-gradient(135deg, rgba(180,145,100,0.1), rgba(140,160,200,0.06))",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-20"
            style={{ background: "radial-gradient(circle, rgba(180,145,100,0.5), transparent 70%)" }} />
          <div className="relative z-10 p-4 flex items-center justify-between h-full">
            <div>
              <span className="text-xl block mb-1.5">📦</span>
              <p className="text-warm-100 text-base font-medium">思绪盒子</p>
              <p className="text-warm-300/30 text-[11px]">焦虑 · 灵感 · 随想</p>
            </div>
            <span className="text-warm-300/25 text-xs">→</span>
          </div>
        </motion.button>

        {/* ===== 情绪日历 ===== */}
        <MoodCalendar />

        {/* 底部留白 */}
        <div className="h-4" />
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
          <EmotionGuide onComplete={() => setOverlay(null)} onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "weekly-report" && <WeeklyReport onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "milestone" && (
          <Milestone {...getStats()} onClose={() => { setOverlay("goodnight"); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "goodnight" && (
          <GoodnightCard mood={mood} emotion={moodEmotion} onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "mood-profile" && <MoodProfile onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "user-page" && <UserPage onClose={() => setOverlay(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {overlay === "auth" && <AuthPage onClose={() => setOverlay(null)} onSuccess={() => setOverlay(null)} />}
      </AnimatePresence>

      {/* 情绪卡片列表 overlay */}
      <AnimatePresence>
        {overlay === "emotion-cards" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom"
          >
            <div className="max-w-lg mx-auto px-5 py-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setOverlay(null)} className="text-warm-300/40 text-sm press-feedback">
                  ← 返回
                </button>
                <h2 className="text-warm-100 text-base">情绪日记</h2>
                <div className="w-10" />
              </div>
              <p className="text-warm-300/35 text-sm mb-6">选一张最像你现在的状态</p>
              <EmotionCardList
                onSelectCard={(card) => {
                  setSelectedCard(card);
                  setOverlay("emotion-detail");
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 情绪卡片详情 overlay */}
      <AnimatePresence>
        {overlay === "emotion-detail" && selectedCard && (
          <EmotionCardDetail
            card={selectedCard}
            onComplete={handleCardComplete}
            onClose={() => { setOverlay("emotion-cards"); setSelectedCard(null); }}
          />
        )}
      </AnimatePresence>

      {/* 助眠工具 overlay */}
      <AnimatePresence>
        {overlay === "sleep-tools" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom"
          >
            <div className="max-w-lg mx-auto px-5 py-6">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setOverlay(null)} className="text-warm-300/40 text-sm press-feedback">
                  ← 返回
                </button>
                <h2 className="text-warm-100 text-base">助眠</h2>
                <div className="w-10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { emoji: "✨", label: "我的仪式", sub: "自定义睡前流程", color: "rgba(220,180,80,0.7)", action: () => setOverlay("ritual-editor") },
                  { emoji: "🌬️", label: "4-7-8 呼吸", sub: "7 分钟 · 深度放松", color: "rgba(100,180,200,0.7)", action: () => setOverlay("breath-full") },
                  { emoji: "⚡", label: "快速呼吸", sub: "3 分钟 · 快速平静", color: "rgba(220,180,80,0.7)", action: () => setOverlay("breath-quick") },
                  { emoji: "🧘", label: "身体扫描", sub: "10 分钟 · 渐进放松", color: "rgba(140,180,140,0.7)", disabled: true, action: () => {} },
                  { emoji: "🌊", label: "潮汐冥想", sub: "15 分钟 · 海浪引导", color: "rgba(100,145,220,0.7)", disabled: true, action: () => {} },
                  { emoji: "🎵", label: "白噪音", sub: "8 种 · 自然音效", color: "rgba(160,140,200,0.7)", action: () => { setOverlay(null); setWhiteNoiseOpen(true); } },
                  { emoji: "🌙", label: "睡前故事", sub: "温柔朗读 · 助眠", color: "rgba(200,140,160,0.7)", disabled: true, action: () => {} },
                  { emoji: "💆", label: "肌肉放松", sub: "8 分钟 · 渐进松弛", color: "rgba(180,145,100,0.7)", disabled: true, action: () => {} },
                  { emoji: "😴", label: "直接睡", sub: "记录睡眠 · 晚安", color: "rgba(130,145,165,0.7)", action: () => { setOverlay(null); triggerGoodnight(); } },
                ].map((tool, i) => (
                  <motion.button
                    key={tool.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={tool.disabled ? {} : { scale: 0.95 }}
                    onClick={tool.action}
                    disabled={tool.disabled}
                    className={`relative overflow-hidden rounded-2xl text-left press-feedback aspect-square flex flex-col justify-between p-4
                      ${tool.disabled ? "opacity-40" : ""}`}
                    style={{
                      background: `linear-gradient(145deg, ${tool.color.replace(/[\d.]+\)$/, "0.15)")}, rgba(255,255,255,0.02))`,
                      border: `1px solid ${tool.color.replace(/[\d.]+\)$/, "0.12)")}`,
                    }}
                  >
                    {/* 装饰光斑 */}
                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none opacity-20"
                      style={{ background: `radial-gradient(circle, ${tool.color}, transparent 70%)` }} />

                    <span className="text-2xl relative z-10">{tool.emoji}</span>
                    <div className="relative z-10">
                      <p className="text-warm-100 text-sm font-medium">{tool.label}</p>
                      <p className="text-warm-300/35 text-[10px] mt-0.5">{tool.sub}</p>
                      {tool.disabled && (
                        <span className="text-warm-300/25 text-[9px] mt-1 inline-block">即将上线</span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 思绪盒子 overlay */}
      <AnimatePresence>
        {overlay === "thoughts" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom"
          >
            <div className="max-w-lg mx-auto px-5 py-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setOverlay(null)} className="text-warm-300/40 text-sm press-feedback">
                  ← 返回
                </button>
                <h2 className="text-warm-100 text-base">思绪盒子</h2>
                <div className="w-10" />
              </div>
              <ThoughtsContainer onSealWorry={handleSealWorry} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 睡眠仪式编辑器 */}
      <AnimatePresence>
        {overlay === "ritual-editor" && (
          <SleepRitualEditor
            onStartRitual={(ritual) => {
              setPlayingRitual(ritual);
              setOverlay("ritual-player");
            }}
            onClose={() => setOverlay("sleep-tools")}
          />
        )}
      </AnimatePresence>

      {/* 睡眠仪式执行器 */}
      <AnimatePresence>
        {overlay === "ritual-player" && playingRitual && (
          <SleepRitualPlayer
            ritual={playingRitual}
            onStepAction={(stepType) => {
              if (stepType === "breath-478") setOverlay("breath-full");
              else if (stepType === "breath-quick") setOverlay("breath-quick");
              else if (stepType === "white-noise") { setOverlay(null); setWhiteNoiseOpen(true); }
              else if (stepType === "emotion-checkin") setOverlay("emotion-cards");
              else if (stepType === "journaling") setOverlay("thoughts");
              else if (stepType === "goodnight") { setOverlay(null); triggerGoodnight(); }
            }}
            onComplete={() => { setOverlay(null); setPlayingRitual(null); triggerGoodnight(); }}
            onClose={() => { setOverlay(null); setPlayingRitual(null); }}
          />
        )}
      </AnimatePresence>

      {/* 白噪音侧边面板 */}
      <WhiteNoisePanel isOpen={whiteNoiseOpen} onClose={() => setWhiteNoiseOpen(false)} />

      {/* 内测问卷 */}
      <AnimatePresence>
        {showSurvey && (
          <BetaSurvey
            onClose={() => setShowSurvey(false)}
            onDefer={() => { deferSurvey(); setShowSurvey(false); }}
          />
        )}
      </AnimatePresence>

      {/* 初始化流程 */}
      <AnimatePresence>
        {onboardingStep === "sleep-schedule" && (
          <SleepSchedulePicker
            onComplete={(start, end) => {
              updateUserSettings({ sleepStartHour: start, sleepEndHour: end });
              setOnboardingStep("questionnaire");
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {onboardingStep === "questionnaire" && (
          <OnboardingQuestionnaire
            onComplete={() => setOnboardingStep(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
