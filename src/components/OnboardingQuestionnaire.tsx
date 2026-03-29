"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Gender, type AgeRange, type Relationship, type Occupation,
  type MentalState, type Concern, type UserProfile,
  GENDER_LABELS, AGE_LABELS, RELATIONSHIP_LABELS, OCCUPATION_LABELS,
  MENTAL_STATE_LABELS, CONCERN_LABELS,
  updateUserProfile, occupationToPersona,
} from "@/lib/profile";
import { updateUserSettings } from "@/lib/store";

interface OnboardingQuestionnaireProps {
  onComplete: () => void;
}

// 每个问题的配色主题
const STEP_THEMES = [
  { gradient: "from-[#1a1a3e]/90 via-night-900/95 to-night-900", accent: "rgba(140,160,220,0.7)", glow: "rgba(140,160,220,0.15)" },
  { gradient: "from-[#1e2a1e]/90 via-night-900/95 to-night-900", accent: "rgba(140,200,160,0.7)", glow: "rgba(140,200,160,0.15)" },
  { gradient: "from-[#2a1a2a]/90 via-night-900/95 to-night-900", accent: "rgba(180,140,200,0.7)", glow: "rgba(180,140,200,0.15)" },
  { gradient: "from-[#1a2a2e]/90 via-night-900/95 to-night-900", accent: "rgba(140,200,200,0.7)", glow: "rgba(140,200,200,0.15)" },
  { gradient: "from-[#2a2a1a]/90 via-night-900/95 to-night-900", accent: "rgba(200,180,120,0.7)", glow: "rgba(200,180,120,0.15)" },
  { gradient: "from-[#2a1a1e]/90 via-night-900/95 to-night-900", accent: "rgba(200,140,150,0.7)", glow: "rgba(200,140,150,0.15)" },
  { gradient: "from-[#1a1e2a]/90 via-night-900/95 to-night-900", accent: "rgba(120,160,210,0.7)", glow: "rgba(120,160,210,0.15)" },
  { gradient: "from-[#1e1a2a]/90 via-night-900/95 to-night-900", accent: "rgba(160,140,210,0.7)", glow: "rgba(160,140,210,0.15)" },
  { gradient: "from-[#1a2a20]/90 via-night-900/95 to-night-900", accent: "rgba(130,190,160,0.7)", glow: "rgba(130,190,160,0.15)" },
];

export default function OnboardingQuestionnaire({ onComplete }: OnboardingQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({});
  const [direction, setDirection] = useState(1);

  const totalSteps = 9; // 每页一个问题

  const theme = STEP_THEMES[step % STEP_THEMES.length];

  const update = (updates: Partial<UserProfile>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    updateUserProfile(updates);
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const finish = () => {
    updateUserProfile({ completedAt: new Date().toISOString() });
    updateUserSettings({ persona: occupationToPersona(profile.occupation) as any });
    onComplete();
  };

  const skip = () => {
    updateUserProfile({ completedAt: new Date().toISOString() });
    updateUserSettings({ persona: profile.occupation ? occupationToPersona(profile.occupation) as any : "general" });
    onComplete();
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0, scale: 0.95 }),
  };

  // 选项按钮 — 单选
  const OptionButton = ({ selected, onClick, children, wide }: {
    selected: boolean; onClick: () => void; children: React.ReactNode; wide?: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl text-sm transition-all press-feedback
        ${wide ? "w-full py-4 px-5 text-left" : "px-5 py-3.5"}
        ${selected
          ? "text-warm-100 ring-1"
          : "text-warm-300/60"
        }`}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${theme.glow}, rgba(255,255,255,0.04))`
          : "rgba(255,255,255,0.03)",
        borderColor: selected ? theme.accent : "transparent",
        boxShadow: selected ? `0 0 20px ${theme.glow}, 0 0 0 1px ${theme.accent}` : undefined,
      }}
    >
      {/* 选中态光效 */}
      {selected && (
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 70%)` }} />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{ background: "#0a0e1a" }}
    >
      {/* 渐变背景 */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} transition-all duration-700`} />

      {/* 装饰光斑 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }} />

      <div className="relative z-10 flex flex-col flex-1 px-6">
        {/* 顶栏 */}
        <div className="flex items-center justify-between pt-6 pb-2">
          {/* 进度 */}
          <div className="flex gap-1.5 flex-1 mr-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="h-[3px] flex-1 rounded-full transition-all duration-500"
                style={{
                  background: i <= step ? theme.accent : "rgba(255,255,255,0.06)",
                }} />
            ))}
          </div>
          <button onClick={skip} className="text-warm-300/30 text-xs press-feedback shrink-0 ml-2">
            跳过
          </button>
        </div>

        {/* 步数 */}
        <p className="text-warm-300/20 text-xs mt-4 mb-2" style={{ color: theme.accent }}>
          {step + 1} / {totalSteps}
        </p>

        {/* 问题内容 */}
        <div className="flex-1 flex flex-col justify-center -mt-12">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: 性别 */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">你的性别</h2>
                <p className="text-warm-300/35 text-sm mb-10">帮我为你选择更贴切的表达</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([k, v]) => (
                    <OptionButton key={k} selected={profile.gender === k}
                      onClick={() => update({ gender: k })}>{v}</OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: 年龄段 */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">你的年龄段</h2>
                <p className="text-warm-300/35 text-sm mb-10">不同阶段有不同的心事</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.entries(AGE_LABELS) as [AgeRange, string][]).map(([k, v]) => (
                    <OptionButton key={k} selected={profile.ageRange === k}
                      onClick={() => update({ ageRange: k })}>{v}</OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: 情感状态 */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">情感状态</h2>
                <p className="text-warm-300/35 text-sm mb-10">夜晚的心情和这个有关</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.entries(RELATIONSHIP_LABELS) as [Relationship, string][]).map(([k, v]) => (
                    <OptionButton key={k} selected={profile.relationship === k}
                      onClick={() => update({ relationship: k })}>{v}</OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: 身份 */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">你是</h2>
                <p className="text-warm-300/35 text-sm mb-10">不同身份，不同的疲惫</p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(OCCUPATION_LABELS) as [Occupation, string][]).map(([k, v]) => (
                    <OptionButton key={k} selected={profile.occupation === k}
                      onClick={() => update({ occupation: k })}>{v}</OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: 压力 */}
            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">日常压力有多大？</h2>
                <p className="text-warm-300/35 text-sm mb-10">凭直觉选</p>
                <div className="flex justify-between gap-2">
                  {[
                    { level: 1, emoji: "😌", label: "很轻松" },
                    { level: 2, emoji: "🙂", label: "还好" },
                    { level: 3, emoji: "😐", label: "一般" },
                    { level: 4, emoji: "😮‍💨", label: "有点大" },
                    { level: 5, emoji: "😰", label: "很大" },
                  ].map((item) => (
                    <motion.button
                      key={item.level}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => update({ stressLevel: item.level })}
                      className="flex flex-col items-center gap-2 flex-1 py-5 rounded-2xl transition-all press-feedback"
                      style={{
                        background: profile.stressLevel === item.level
                          ? `linear-gradient(180deg, ${theme.glow}, rgba(255,255,255,0.02))`
                          : "rgba(255,255,255,0.03)",
                        boxShadow: profile.stressLevel === item.level ? `0 0 24px ${theme.glow}` : undefined,
                      }}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className={`text-[11px] ${profile.stressLevel === item.level ? "text-warm-100" : "text-warm-300/35"}`}>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: 精神状态 */}
            {step === 5 && (
              <motion.div key="s5" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">最近的精神状态</h2>
                <p className="text-warm-300/35 text-sm mb-10">没有对错，真实选就好</p>
                <div className="space-y-3">
                  {(Object.entries(MENTAL_STATE_LABELS) as [MentalState, string][]).map(([k, v]) => (
                    <OptionButton key={k} wide selected={profile.mentalState === k}
                      onClick={() => update({ mentalState: k })}>{v}</OptionButton>
                  ))}
                </div>

                {profile.mentalState === "suspected-condition" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-2xl p-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(100,140,200,0.12), rgba(120,100,180,0.08))",
                      border: "1px solid rgba(100,140,200,0.15)",
                    }}
                  >
                    <p className="text-warm-200/60 text-sm leading-relaxed">
                      💙 我们建议你寻求专业帮助。床前可以陪伴你，但无法替代专业治疗。
                    </p>
                    <p className="text-accent/50 text-xs mt-2">
                      全国心理援助热线：400-161-9995
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 6: 是否接受专业帮助 */}
            {step === 6 && (
              <motion.div key="s6" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">目前有接受专业帮助吗？</h2>
                <p className="text-warm-300/35 text-sm mb-10">比如心理咨询、药物治疗等</p>
                <div className="flex gap-4">
                  {[
                    { val: true, label: "有" },
                    { val: false, label: "没有" },
                  ].map((item) => (
                    <OptionButton key={String(item.val)} selected={profile.seekingHelp === item.val}
                      onClick={() => update({ seekingHelp: item.val })}>{item.label}</OptionButton>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 7: 关注方面 */}
            {step === 7 && (
              <motion.div key="s7" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
                <h2 className="text-2xl font-light text-warm-100 mb-2">最近在意什么</h2>
                <p className="text-warm-300/35 text-sm mb-10">可以多选，选那些让你睡不好的</p>
                <div className="flex flex-wrap gap-3">
                  {(Object.entries(CONCERN_LABELS) as [Concern, string][]).map(([k, v]) => {
                    const selected = profile.concerns?.includes(k);
                    return (
                      <OptionButton key={k} selected={!!selected}
                        onClick={() => {
                          const concerns = profile.concerns || [];
                          update({ concerns: selected ? concerns.filter(c => c !== k) : [...concerns, k] });
                        }}>{v}</OptionButton>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 8: 完成 */}
            {step === 8 && (
              <motion.div key="s8" custom={direction} variants={variants}
                initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-center"
              >
                <motion.span
                  className="text-5xl block mb-6"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  🌙
                </motion.span>
                <h2 className="text-2xl font-light text-warm-100 mb-3">认识你很高兴</h2>
                <p className="text-warm-300/40 text-sm leading-relaxed">
                  接下来的每个夜晚<br />我会用更懂你的方式陪你
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部导航 */}
        <div className="pb-8 pt-4 space-y-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            className="w-full py-4 rounded-full text-base press-feedback transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.accent.replace(/[\d.]+\)$/, "0.25)")}, ${theme.accent.replace(/[\d.]+\)$/, "0.1)")})`,
              boxShadow: `0 0 30px ${theme.glow}`,
              color: theme.accent,
              border: `1px solid ${theme.accent.replace(/[\d.]+\)$/, "0.2)")}`,
            }}
          >
            {step === totalSteps - 1 ? "开始使用" : "继续"}
          </motion.button>

          {step > 0 && (
            <button onClick={goBack} className="w-full py-2 text-warm-300/25 text-sm press-feedback">
              上一步
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
