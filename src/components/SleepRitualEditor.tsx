"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type SleepRitual, type RitualStepType,
  getSleepRituals, createRitual, updateRitual, deleteRitual,
  setActiveRitual, getActiveRitualId,
  canCreateRitual, getRitualLimit,
  STEP_TEMPLATES, getStepTemplate,
  removeStepFromRitual, addStepToRitual,
} from "@/lib/sleep-ritual";

interface SleepRitualEditorProps {
  onStartRitual: (ritual: SleepRitual) => void;
  onClose: () => void;
}

export default function SleepRitualEditor({ onStartRitual, onClose }: SleepRitualEditorProps) {
  const [rituals, setRituals] = useState<SleepRitual[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingRitual, setEditingRitual] = useState<SleepRitual | null>(null);
  const [showStepPicker, setShowStepPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => { refresh(); }, []);

  const refresh = () => {
    setRituals(getSleepRituals());
    setActiveId(getActiveRitualId());
  };

  const refreshEditing = () => {
    if (editingRitual) {
      const updated = getSleepRituals().find(r => r.id === editingRitual.id);
      if (updated) setEditingRitual(updated);
    }
    refresh();
  };

  const getTotalDuration = (steps: { type: RitualStepType; duration?: number }[]) =>
    steps.reduce((sum, s) => sum + (s.duration || getStepTemplate(s.type).defaultDuration || 0), 0);

  // === 编辑视图 ===
  if (editingRitual) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom">
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setEditingRitual(null)} className="text-warm-300/40 text-sm press-feedback">← 返回</button>
            <h2 className="text-warm-100 text-base">编辑仪式</h2>
            <div className="w-10" />
          </div>

          {/* 名称 */}
          <div className="glass-md rounded-2xl p-4 mb-4">
            {editingName ? (
              <div className="flex gap-2">
                <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value.slice(0, 20))}
                  maxLength={20} autoFocus onKeyDown={(e) => {
                    if (e.key === "Enter") { updateRitual(editingRitual.id, { name: nameInput.trim() || editingRitual.name }); setEditingName(false); refreshEditing(); }
                  }}
                  className="flex-1 bg-transparent text-warm-100 text-base focus:outline-none border-b border-warm-300/20 pb-1" />
                <button onClick={() => { updateRitual(editingRitual.id, { name: nameInput.trim() || editingRitual.name }); setEditingName(false); refreshEditing(); }}
                  className="text-accent text-sm press-feedback">确定</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-warm-100 text-lg font-medium">{editingRitual.name}</h3>
                  <p className="text-warm-300/30 text-xs mt-1">{editingRitual.steps.length} 步 · 约 {getTotalDuration(editingRitual.steps)} 分钟</p>
                </div>
                <button onClick={() => { setEditingName(true); setNameInput(editingRitual.name); }}
                  className="text-warm-300/40 text-xs px-3 py-1.5 rounded-full glass press-feedback">重命名</button>
              </div>
            )}
          </div>

          {/* 步骤列表 */}
          <div className="space-y-2 mb-4">
            {editingRitual.steps.map((step, i) => {
              const t = getStepTemplate(step.type);
              return (
                <motion.div key={step.id} layout className="flex items-center gap-3 glass rounded-xl p-3">
                  <span className="text-warm-300/20 text-xs w-5 text-center shrink-0">{i + 1}</span>
                  <span className="text-lg shrink-0">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-warm-100 text-sm">{t.label}</p>
                    {(step.duration || t.defaultDuration) && <p className="text-warm-300/30 text-[10px]">{step.duration || t.defaultDuration} 分钟</p>}
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => {
                      if (i === 0) return;
                      const steps = [...editingRitual.steps];
                      [steps[i], steps[i-1]] = [steps[i-1], steps[i]];
                      updateRitual(editingRitual.id, { steps }); refreshEditing();
                    }} disabled={i === 0} className="text-warm-300/25 text-[10px] press-feedback disabled:opacity-20">▲</button>
                    <button onClick={() => {
                      if (i === editingRitual.steps.length - 1) return;
                      const steps = [...editingRitual.steps];
                      [steps[i], steps[i+1]] = [steps[i+1], steps[i]];
                      updateRitual(editingRitual.id, { steps }); refreshEditing();
                    }} disabled={i === editingRitual.steps.length - 1} className="text-warm-300/25 text-[10px] press-feedback disabled:opacity-20">▼</button>
                  </div>
                  <button onClick={() => { removeStepFromRitual(editingRitual.id, step.id); refreshEditing(); }}
                    className="text-warm-300/20 text-xs press-feedback shrink-0">×</button>
                </motion.div>
              );
            })}
          </div>

          <button onClick={() => setShowStepPicker(true)}
            className="w-full py-3 rounded-xl text-sm text-warm-300/40 press-feedback mb-6"
            style={{ border: "2px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            + 添加步骤
          </button>

          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => { setActiveRitual(editingRitual.id); onStartRitual(editingRitual); }}
            className="w-full py-4 rounded-full glass-heavy glow-sm text-accent text-base press-feedback">
            开始仪式
          </motion.button>

          {/* 步骤选择器 */}
          <AnimatePresence>
            {showStepPicker && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowStepPicker(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[70vh] overflow-y-auto safe-bottom"
                  style={{ background: "rgba(15,20,35,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="p-5">
                    <div className="w-10 h-1 rounded-full bg-warm-300/15 mx-auto mb-4" />
                    <h3 className="text-warm-100 text-base mb-4">选择步骤</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {STEP_TEMPLATES.map((t) => (
                        <button key={t.type}
                          onClick={() => { if (t.available) { addStepToRitual(editingRitual.id, t.type); setShowStepPicker(false); refreshEditing(); } }}
                          disabled={!t.available}
                          className={`rounded-xl p-3 text-left press-feedback ${!t.available ? "opacity-30" : ""}`}
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span className="text-lg block mb-1">{t.emoji}</span>
                          <p className="text-warm-100 text-xs">{t.label}</p>
                          <p className="text-warm-300/30 text-[10px]">{t.defaultDuration ? `${t.defaultDuration}分钟` : t.description}</p>
                          {!t.available && <p className="text-warm-300/20 text-[9px] mt-0.5">即将上线</p>}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // === 列表视图 ===
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto safe-top safe-bottom">
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">← 返回</button>
          <h2 className="text-warm-100 text-base">我的睡眠仪式</h2>
          <div className="w-10" />
        </div>

        <div className="space-y-3 mb-6">
          {rituals.map((ritual) => {
            const isActive = activeId === ritual.id;
            return (
              <motion.div key={ritual.id} layout
                className={`rounded-2xl p-4 ${isActive ? "ring-1 ring-accent/30" : ""}`}
                style={{
                  background: isActive ? "linear-gradient(135deg, rgba(107,140,206,0.12), rgba(255,255,255,0.03))" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? "rgba(107,140,206,0.2)" : "rgba(255,255,255,0.06)"}`,
                }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-warm-100 text-sm font-medium">{ritual.name}</h3>
                    {isActive && <span className="text-accent text-[10px] px-1.5 py-0.5 rounded-full glass">当前</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingRitual(ritual)} className="text-warm-300/40 text-xs px-2 py-1 rounded-lg glass press-feedback">编辑</button>
                    <button onClick={() => { deleteRitual(ritual.id); refresh(); }} className="text-red-400/40 text-xs px-2 py-1 rounded-lg glass press-feedback">删除</button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {ritual.steps.map((step, i) => (
                    <span key={step.id} className="flex items-center gap-0.5">
                      <span className="text-sm">{getStepTemplate(step.type).emoji}</span>
                      {i < ritual.steps.length - 1 && <span className="text-warm-300/15 text-[10px]">→</span>}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-warm-300/30 text-[10px]">{ritual.steps.length} 步 · 约 {getTotalDuration(ritual.steps)} 分钟</p>
                  <div className="flex gap-2">
                    {!isActive && <button onClick={() => { setActiveRitual(ritual.id); refresh(); }} className="text-warm-300/40 text-[10px] press-feedback">设为当前</button>}
                    <button onClick={() => { setActiveRitual(ritual.id); onStartRitual(ritual); }} className="text-accent text-xs press-feedback">开始</button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {rituals.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">🌙</span>
              <p className="text-warm-200/60 text-sm mb-2">还没有睡眠仪式</p>
              <p className="text-warm-300/30 text-xs">创建你的第一个专属仪式</p>
            </div>
          )}
        </div>

        <button onClick={() => { if (canCreateRitual()) { const r = createRitual(); setEditingRitual(r); refresh(); } }}
          disabled={!canCreateRitual()}
          className="w-full py-4 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback disabled:opacity-30">
          {canCreateRitual() ? `+ 新建仪式（${rituals.length}/${getRitualLimit()}）` : `已达上限（${rituals.length}/${getRitualLimit()}）`}
        </button>
      </div>
    </motion.div>
  );
}
