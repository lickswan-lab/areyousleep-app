"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface BetaSurveyProps {
  onClose: () => void;
  onDefer: () => void; // 延后到明天
}

const QUESTIONS = [
  {
    id: "overall",
    question: "整体体验如何？",
    type: "rating" as const,
    labels: ["很差", "不好", "一般", "不错", "很棒"],
  },
  {
    id: "mood_cards",
    question: "心情签到的描述有没有打动你的？",
    type: "rating" as const,
    labels: ["完全没有", "偶尔有", "一般", "经常有", "非常共鸣"],
  },
  {
    id: "ai_chat",
    question: "AI 的回复让你感觉被理解了吗？",
    type: "rating" as const,
    labels: ["完全没有", "有点", "还行", "比较理解", "非常理解"],
  },
  {
    id: "sleep_help",
    question: "用完之后，你觉得更容易入睡了吗？",
    type: "rating" as const,
    labels: ["更难了", "没变化", "有一点", "明显有", "特别有"],
  },
  {
    id: "share",
    question: "你会把晚安卡片发到朋友圈/小红书吗？",
    type: "choice" as const,
    options: ["会，已经发了", "会，但还没发", "可能会", "不会"],
  },
  {
    id: "favorite",
    question: "你最喜欢哪个功能？",
    type: "choice" as const,
    options: ["心情签到", "AI 聊天", "呼吸引导", "晚安卡片", "心情档案", "担忧清单"],
  },
  {
    id: "missing",
    question: "你觉得还缺什么功能？",
    type: "text" as const,
    placeholder: "随便说说...",
  },
  {
    id: "nps",
    question: "你有多大可能向朋友推荐？",
    type: "nps" as const,
  },
  {
    id: "feedback",
    question: "还有什么想说的？",
    type: "text" as const,
    placeholder: "吐槽、建议、感受都可以...",
  },
];

export default function BetaSurvey({ onClose, onDefer }: BetaSurveyProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [textInput, setTextInput] = useState("");

  const q = QUESTIONS[currentQ];
  const progress = (currentQ + 1) / QUESTIONS.length;

  const setAnswer = (value: string | number) => {
    setAnswers({ ...answers, [q.id]: value });
    if (q.type !== "text") {
      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(currentQ + 1);
          setTextInput("");
        } else {
          handleSubmit({ ...answers, [q.id]: value });
        }
      }, 400);
    }
  };

  const handleTextSubmit = () => {
    const val = textInput.trim();
    setAnswers({ ...answers, [q.id]: val });
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setTextInput("");
    } else {
      handleSubmit({ ...answers, [q.id]: val });
    }
  };

  const handleSubmit = (finalAnswers: Record<string, string | number>) => {
    // 存储问卷结果
    localStorage.setItem("chuangqian_survey", JSON.stringify({
      answers: finalAnswers,
      submittedAt: new Date().toISOString(),
    }));
    localStorage.setItem("chuangqian_survey_done", "true");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-4xl block mb-4">💜</span>
          <h2 className="text-xl font-light text-warm-100 mb-2">谢谢你的反馈</h2>
          <p className="text-warm-300/40 text-sm mb-8">你的每一条建议都会让床前变得更好</p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback"
          >
            继续使用
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-night-900/98 backdrop-blur-lg"
    >
      <div className="max-w-sm mx-auto px-6 py-8 flex-1 flex flex-col safe-top safe-bottom">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-warm-300/40 text-xs">{currentQ + 1} / {QUESTIONS.length}</p>
          <button
            onClick={onDefer}
            className="text-warm-300/30 text-xs press-feedback"
          >
            明天再填
          </button>
        </div>

        {/* 进度条 */}
        <div className="h-1 rounded-full bg-white/5 mb-10">
          <motion.div
            className="h-full rounded-full bg-accent/50"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 问题 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-warm-100 text-lg font-light mb-8">{q.question}</h2>

            {/* 评分 1-5 */}
            {q.type === "rating" && (
              <div className="space-y-2.5">
                {q.labels!.map((label, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAnswer(i + 1)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm press-feedback transition-all
                      ${answers[q.id] === i + 1 ? "glass-heavy text-accent" : "glass text-warm-200/70"}`}
                  >
                    <span className="text-warm-300/30 mr-3">{i + 1}</span>
                    {label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* 选择题 */}
            {q.type === "choice" && (
              <div className="space-y-2.5">
                {q.options!.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAnswer(opt)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm press-feedback transition-all
                      ${answers[q.id] === opt ? "glass-heavy text-accent" : "glass text-warm-200/70"}`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {/* NPS 0-10 */}
            {q.type === "nps" && (
              <div>
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: 11 }, (_, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setAnswer(i)}
                      className={`flex-1 py-3 rounded-xl text-xs text-center press-feedback transition-all
                        ${answers[q.id] === i ? "glass-heavy text-accent" : "glass text-warm-300/50"}`}
                    >
                      {i}
                    </motion.button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-warm-300/25 px-1">
                  <span>完全不会</span>
                  <span>非常愿意</span>
                </div>
              </div>
            )}

            {/* 文本输入 */}
            {q.type === "text" && (
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder={q.placeholder}
                  autoFocus
                  className="w-full glass-md rounded-2xl px-5 py-4 text-warm-100 text-sm
                             placeholder:text-warm-300/25 resize-none focus:outline-none bg-transparent"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleTextSubmit}
                    className="flex-1 py-3 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback"
                  >
                    {currentQ === QUESTIONS.length - 1 ? "提交" : "下一题"}
                  </button>
                  {currentQ < QUESTIONS.length - 1 && (
                    <button
                      onClick={() => { setCurrentQ(currentQ + 1); setTextInput(""); }}
                      className="px-4 py-3 rounded-full glass text-warm-300/40 text-sm press-feedback"
                    >
                      跳过
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// 检查是否应该显示问卷
export function shouldShowSurvey(): boolean {
  if (typeof window === "undefined") return false;
  // 已填过就不再显示
  if (localStorage.getItem("chuangqian_survey_done")) return false;
  // 延后到明天
  const deferred = localStorage.getItem("chuangqian_survey_deferred");
  if (deferred) {
    const deferDate = new Date(deferred);
    if (new Date().toDateString() === deferDate.toDateString()) return false;
  }
  // 至少使用过1次（有心情记录）才弹出
  const moods = localStorage.getItem("chuangqian_moods");
  if (!moods) return false;
  try {
    return JSON.parse(moods).length >= 1;
  } catch {
    return false;
  }
}

export function deferSurvey(): void {
  localStorage.setItem("chuangqian_survey_deferred", new Date().toISOString());
}
