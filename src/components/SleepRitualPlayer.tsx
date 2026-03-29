"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type SleepRitual, getStepTemplate } from "@/lib/sleep-ritual";

interface SleepRitualPlayerProps {
  ritual: SleepRitual;
  onStepAction: (stepType: string) => void;
  onComplete: () => void;
  onClose: () => void;
}

export default function SleepRitualPlayer({ ritual, onStepAction, onComplete, onClose }: SleepRitualPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const step = ritual.steps[currentStep];
  const template = step ? getStepTemplate(step.type) : null;
  const isLast = currentStep === ritual.steps.length - 1;
  const progress = ((currentStep + (completed.has(currentStep) ? 1 : 0)) / ritual.steps.length) * 100;

  const markDone = () => {
    const next = new Set(completed);
    next.add(currentStep);
    setCompleted(next);
    if (isLast) { onComplete(); } else { setCurrentStep(currentStep + 1); }
  };

  if (!step || !template) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col safe-top safe-bottom"
      style={{ background: "rgba(10,14,26,0.98)" }}>

      {/* 顶部进度 */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">退出</button>
          <p className="text-warm-300/30 text-xs">{ritual.name}</p>
          <p className="text-warm-300/30 text-xs">{currentStep + 1}/{ritual.steps.length}</p>
        </div>
        <div className="h-1 rounded-full bg-night-600/30 overflow-hidden">
          <motion.div className="h-full rounded-full bg-accent/60" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* 步骤流程 */}
      <div className="flex items-center gap-1 px-5 py-3 overflow-x-auto scrollbar-hide">
        {ritual.steps.map((s, i) => {
          const t = getStepTemplate(s.type);
          return (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all
                ${i === currentStep ? "ring-2 ring-accent/40 scale-110" : ""} ${completed.has(i) ? "bg-accent/20" : "bg-night-600/20"}`}>
                {completed.has(i) ? "✓" : t.emoji}
              </div>
              {i < ritual.steps.length - 1 && <div className={`w-4 h-px ${completed.has(i) ? "bg-accent/30" : "bg-warm-300/10"}`} />}
            </div>
          );
        })}
      </div>

      {/* 当前步骤 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }} className="text-center w-full">
            <motion.span className="text-5xl block mb-6"
              initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              {template.emoji}
            </motion.span>
            <h2 className="text-2xl font-light text-warm-100 mb-2">{template.label}</h2>
            <p className="text-warm-300/40 text-sm mb-2">{template.description}</p>
            {(step.duration || template.defaultDuration) && (
              <p className="text-warm-300/25 text-xs">{step.duration || template.defaultDuration} 分钟</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 操作 */}
      <div className="px-5 pb-8 space-y-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onStepAction(step.type)}
          className="w-full py-4 rounded-full glass-heavy glow-sm text-accent text-base press-feedback">
          {template.available ? `开始${template.label}` : `${template.label}（即将上线）`}
        </motion.button>
        <div className="flex gap-3 justify-center">
          <button onClick={markDone} className="text-warm-300/40 text-xs press-feedback">完成此步</button>
          <span className="text-warm-300/10">·</span>
          <button onClick={() => { if (isLast) onComplete(); else setCurrentStep(currentStep + 1); }}
            className="text-warm-300/30 text-xs press-feedback">跳过</button>
        </div>
      </div>
    </motion.div>
  );
}
