"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { EmotionCard } from "@/lib/emotion-cards";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";
import { addMoodEntry, getEmotionLabel } from "@/lib/store";
import { getUserProfile } from "@/lib/profile";

interface EmotionCardDetailProps {
  card: EmotionCard;
  onComplete: (mood: number, action: "worry" | "breathe" | "goodnight", emotion?: MoodEmotion) => void;
  onClose: () => void;
}

interface Question {
  question: string;
  options: string[];
}

type Phase = "loading" | "questions" | "counseling" | "personalized-guide" | "action";

export default function EmotionCardDetail({ card, onComplete, onClose }: EmotionCardDetailProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [guideText, setGuideText] = useState("");
  const [guideAudio, setGuideAudio] = useState<string | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [isPlayingGuide, setIsPlayingGuide] = useState(false);
  const guideAudioRef = { current: null as HTMLAudioElement | null };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [counselText, setCounselText] = useState("");
  const [counselLoading, setCounselLoading] = useState(false);

  const color = EMOTION_COLORS[card.emotion] || "rgba(100,145,220,0.7)";
  const colorLight = color.replace(/[\d.]+\)$/, "0.15)");
  const colorMid = color.replace(/[\d.]+\)$/, "0.4)");

  // Mood value mapping from emotion
  const moodValueMap: Record<string, number> = {
    heavy: 1, angry: 1, anxious: 2, tired: 2, melancholy: 2,
    numb: 3, calm: 3, hopeful: 4, warm: 5, alive: 5,
  };

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const profile = getUserProfile();
    const profileContext = [
      profile.ageRange,
      profile.occupation,
      profile.concerns?.join("、"),
    ].filter(Boolean).join("，");

    try {
      const res = await fetch("/api/emotion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explore",
          cardName: card.name,
          emotion: card.emotion,
          profileContext,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length >= 3) {
        setQuestions(data.questions.slice(0, 3));
        setPhase("questions");
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      // Use defaults — the API route already handles fallback
      setQuestions([
        { question: "这种感觉持续多久了？", options: ["就今天", "好几天了", "说不清"] },
        { question: "身体有什么感觉？", options: ["有些紧绷", "很沉重", "什么都感觉不到"] },
        { question: "此刻最想做什么？", options: ["什么都不想做", "想找人聊聊", "想安静待一会儿"] },
      ]);
      setPhase("questions");
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setCustomInput("");

    if (currentQ < 2) {
      setCurrentQ(currentQ + 1);
    } else {
      // All 3 answered, fetch counsel
      fetchCounsel(newAnswers);
    }
  };

  const handleCustomAnswer = () => {
    if (customInput.trim()) {
      handleAnswer(customInput.trim());
    }
  };

  const fetchCounsel = async (allAnswers: string[]) => {
    setCounselLoading(true);
    setPhase("counseling");

    const qaData = questions.map((q, i) => ({
      question: q.question,
      answer: allAnswers[i],
    }));

    try {
      const res = await fetch("/api/emotion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "counsel",
          cardName: card.name,
          emotion: card.emotion,
          questions: qaData,
        }),
      });
      const data = await res.json();
      setCounselText(data.response || "嗯，我听到了。今晚先把这些放在这里。");
    } catch {
      setCounselText("嗯，我听到了。今晚先把这些放在这里。你已经很勇敢了。");
    } finally {
      setCounselLoading(false);
    }
  };

  const handleConfirm = () => {
    const moodVal = moodValueMap[card.emotion] || 3;
    addMoodEntry(moodVal, card.name, card.emotion);
    // 生成个性化引导
    generatePersonalizedGuide();
  };

  const generatePersonalizedGuide = async () => {
    setGuideLoading(true);
    setPhase("personalized-guide");
    const profile = getUserProfile();
    const profileContext = [profile.ageRange, profile.occupation, profile.concerns?.join("、")].filter(Boolean).join("，");

    try {
      const res = await fetch("/api/personalized-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: card.emotion,
          cardName: card.name,
          answers,
          profileContext,
        }),
      });
      const data = await res.json();
      setGuideText(data.text || "");
      if (data.audio) {
        setGuideAudio(`data:audio/mpeg;base64,${data.audio}`);
      }
    } catch {
      setGuideText("深深地吸一口气...慢慢呼出来...今晚的一切都可以放下了。晚安。");
    } finally {
      setGuideLoading(false);
    }
  };

  const playGuideAudio = () => {
    if (!guideAudio) return;
    if (guideAudioRef.current) {
      guideAudioRef.current.pause();
      guideAudioRef.current = null;
      setIsPlayingGuide(false);
      return;
    }
    const audio = new Audio(guideAudio);
    guideAudioRef.current = audio;
    audio.play().catch(() => {});
    setIsPlayingGuide(true);
    audio.onended = () => { setIsPlayingGuide(false); guideAudioRef.current = null; };
  };

  const handleAction = (action: "worry" | "breathe" | "goodnight") => {
    const moodVal = moodValueMap[card.emotion] || 3;
    onComplete(moodVal, action, card.emotion as MoodEmotion);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background gradient based on emotion */}
      <div className="absolute inset-0 transition-all duration-700"
        style={{ background: `linear-gradient(180deg, ${colorLight}, rgba(10,14,26,0.98) 60%)` }} />

      {/* Decorative glow */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: color }} />

      <div className="relative z-10 flex flex-col flex-1 px-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">
            ← 返回
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{card.icon}</span>
            <span className="text-warm-100 text-sm">{card.name}</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Emotion badge */}
        <div className="flex justify-center mb-6">
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ background: colorLight, color: colorMid }}>
            {getEmotionLabel(card.emotion)}
          </span>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col justify-center -mt-8">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {phase === "loading" && (
              <motion.div key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-3xl mb-4 inline-block"
                >
                  🌀
                </motion.div>
                <p className="text-warm-300/40 text-sm">正在为你准备问题...</p>
              </motion.div>
            )}

            {/* Questions (one at a time) */}
            {phase === "questions" && questions[currentQ] && (
              <motion.div key={`q-${currentQ}`}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}>

                {/* Progress */}
                <div className="flex gap-2 mb-8">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex-1 h-[3px] rounded-full transition-all"
                      style={{ background: i <= currentQ ? color : "rgba(255,255,255,0.06)" }} />
                  ))}
                </div>

                {/* Question */}
                <h3 className="text-xl font-light text-warm-100 mb-8 leading-relaxed">
                  {questions[currentQ].question}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {questions[currentQ].options.map((opt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(opt)}
                      className="w-full py-4 px-5 rounded-2xl text-left text-sm press-feedback transition-all
                        text-warm-200/70"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>

                {/* Custom input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value.slice(0, 100))}
                    placeholder="或者用自己的话说..."
                    maxLength={100}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomAnswer()}
                    className="flex-1 bg-transparent text-warm-100 text-sm placeholder:text-warm-300/20
                      focus:outline-none border-b border-warm-300/10 pb-2"
                  />
                  {customInput.trim() && (
                    <button onClick={handleCustomAnswer}
                      className="text-accent text-sm press-feedback shrink-0">
                      确定
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Counseling */}
            {phase === "counseling" && (
              <motion.div key="counsel"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-center">

                {counselLoading ? (
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-3xl mb-4 inline-block"
                    >
                      💙
                    </motion.div>
                    <p className="text-warm-300/40 text-sm">正在倾听你的心声...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 rounded-2xl p-6"
                      style={{
                        background: `linear-gradient(135deg, ${colorLight}, rgba(255,255,255,0.02))`,
                        border: `1px solid ${color.replace(/[\d.]+\)$/, "0.15)")}`,
                      }}>
                      <p className="text-warm-100 text-base leading-relaxed">
                        {counselText}
                      </p>
                    </div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirm}
                      className="px-8 py-3.5 rounded-full text-sm press-feedback"
                      style={{
                        background: `linear-gradient(135deg, ${color.replace(/[\d.]+\)$/, "0.3)")}, ${colorLight})`,
                        color: color.replace(/[\d.]+\)$/, "0.9)"),
                        border: `1px solid ${color.replace(/[\d.]+\)$/, "0.2)")}`,
                      }}
                    >
                      记录这张卡片为今日情绪
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* Personalized guide */}
            {phase === "personalized-guide" && (
              <motion.div key="guide"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center">

                {guideLoading ? (
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-4xl mb-6 inline-block">
                      🌙
                    </motion.div>
                    <p className="text-warm-100 text-base mb-2">正在为你编织今晚的引导...</p>
                    <p className="text-warm-300/30 text-xs">每一晚都是独一无二的</p>
                  </div>
                ) : (
                  <>
                    {/* Guide text */}
                    <div className="mb-6 rounded-2xl p-5 text-left max-h-[40vh] overflow-y-auto"
                      style={{
                        background: `linear-gradient(135deg, ${colorLight}, rgba(255,255,255,0.02))`,
                        border: `1px solid ${color.replace(/[\d.]+\)$/, "0.1)")}`,
                      }}>
                      <p className="text-warm-100 text-sm leading-[2] whitespace-pre-line">
                        {guideText}
                      </p>
                    </div>

                    {/* Audio player */}
                    {guideAudio && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={playGuideAudio}
                        className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center press-feedback"
                        style={{
                          background: isPlayingGuide
                            ? `linear-gradient(135deg, ${color.replace(/[\d.]+\)$/, "0.3)")}, ${colorLight})`
                            : colorLight,
                          boxShadow: isPlayingGuide ? `0 0 24px ${color.replace(/[\d.]+\)$/, "0.2)")}` : undefined,
                          border: `1px solid ${color.replace(/[\d.]+\)$/, "0.2)")}`,
                        }}
                      >
                        <span className="text-2xl">{isPlayingGuide ? "⏸" : "▶"}</span>
                      </motion.button>
                    )}
                    <p className="text-warm-300/30 text-xs mb-6">
                      {guideAudio ? (isPlayingGuide ? "正在播放你的专属引导" : "点击播放语音引导") : "今晚的专属引导"}
                    </p>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (guideAudioRef.current) { guideAudioRef.current.pause(); guideAudioRef.current = null; }
                        setPhase("action");
                      }}
                      className="px-8 py-3 rounded-full glass text-warm-200/60 text-sm press-feedback">
                      继续
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}

            {/* Action selection */}
            {phase === "action" && (
              <motion.div key="action"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6">

                <div>
                  <span className="text-4xl block mb-3">{card.icon}</span>
                  <p className="text-warm-100 text-lg mb-1">今日情绪已记录</p>
                  <p className="text-warm-300/40 text-sm">接下来想做什么？</p>
                </div>

                <div className="space-y-3 max-w-xs mx-auto">
                  {(moodValueMap[card.emotion] || 3) <= 2 ? (
                    <>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction("worry")}
                        className="w-full py-4 rounded-2xl glass-heavy glow-sm text-accent text-sm press-feedback">
                        写下脑子里的事
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction("breathe")}
                        className="w-full py-4 rounded-2xl glass text-warm-200/60 text-sm press-feedback">
                        做个呼吸练习
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction("breathe")}
                        className="w-full py-4 rounded-2xl glass-heavy glow-sm text-accent text-sm press-feedback">
                        做个睡前关机仪式
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction("goodnight")}
                        className="w-full py-4 rounded-2xl glass text-warm-200/60 text-sm press-feedback">
                        直接晚安
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
