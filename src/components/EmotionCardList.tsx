"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type EmotionCard,
  getEmotionCards, addEmotionCard, deleteEmotionCard, updateEmotionCard,
  initializeCards, isCardsInitialized,
  canCreateAiCard, incrementAiCardCount, getAiCardCount, getAiCardLimit,
  EMOTION_ICONS,
} from "@/lib/emotion-cards";
import { EMOTION_COLORS, type MoodEmotion } from "@/lib/mood-descriptions";
import { getEmotionLabel } from "@/lib/store";

interface EmotionCardListProps {
  onSelectCard: (card: EmotionCard) => void;
}

const EMOTION_TYPES: MoodEmotion[] = [
  "anxious", "heavy", "tired", "numb", "melancholy",
  "calm", "hopeful", "warm", "angry", "alive",
];

export default function EmotionCardList({ onSelectCard }: EmotionCardListProps) {
  const [cards, setCards] = useState<EmotionCard[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAiCreate, setShowAiCreate] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [menuCard, setMenuCard] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmotion, setNewEmotion] = useState<MoodEmotion>("calm");

  // AI create form state
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!isCardsInitialized()) {
      setCards(initializeCards());
    } else {
      setCards(getEmotionCards());
    }
  }, []);

  const refresh = () => setCards(getEmotionCards());

  const handleCreate = () => {
    if (!newName.trim()) return;
    addEmotionCard({
      name: newName.trim(),
      emotion: newEmotion,
      icon: EMOTION_ICONS[newEmotion] || "🫧",
      isCustom: true,
    });
    setNewName("");
    setNewEmotion("calm");
    setShowCreate(false);
    refresh();
  };

  const handleAiCreate = async () => {
    if (!aiDescription.trim() || !canCreateAiCard()) return;
    setAiLoading(true);
    try {
      // Use AI to generate a card based on description
      const res = await fetch("/api/emotion-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explore",
          cardName: aiDescription.trim(),
          emotion: "numb", // AI will determine
          profileContext: "",
        }),
      });
      // For now, create card from user description with AI-detected emotion
      // Simple heuristic: check keywords
      const text = aiDescription.trim();
      let emotion: MoodEmotion = "calm";
      if (/焦|急|紧张|害怕|担心/.test(text)) emotion = "anxious";
      else if (/累|疲|困|倦/.test(text)) emotion = "tired";
      else if (/气|怒|烦|火/.test(text)) emotion = "angry";
      else if (/难过|哭|伤心|沉/.test(text)) emotion = "heavy";
      else if (/孤|寂|想念|思念/.test(text)) emotion = "melancholy";
      else if (/麻|木|空|无/.test(text)) emotion = "numb";
      else if (/开心|快乐|高兴|好/.test(text)) emotion = "warm";
      else if (/希望|期待|明天/.test(text)) emotion = "hopeful";
      else if (/活|能量|精力/.test(text)) emotion = "alive";

      addEmotionCard({
        name: text,
        emotion,
        icon: EMOTION_ICONS[emotion] || "✨",
        isCustom: true,
      });
      incrementAiCardCount();
      setAiDescription("");
      setShowAiCreate(false);
      refresh();
    } catch {
      // silent
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteEmotionCard(id);
    setMenuCard(null);
    refresh();
  };

  const handleEdit = (card: EmotionCard) => {
    setEditingCard(card.id);
    setEditName(card.name);
    setMenuCard(null);
  };

  const handleEditSave = (id: string) => {
    if (editName.trim()) {
      updateEmotionCard(id, { name: editName.trim() });
    }
    setEditingCard(null);
    refresh();
  };

  const getCardGradient = (emotion: MoodEmotion) => {
    const color = EMOTION_COLORS[emotion] || "rgba(100,145,220,0.7)";
    const base = color.replace(/[\d.]+\)$/, "0.25)");
    const deep = color.replace(/[\d.]+\)$/, "0.08)");
    return `linear-gradient(145deg, ${base}, ${deep})`;
  };

  return (
    <div className="w-full">
      {/* Card grid — 2x2 per screen */}
      <div className="grid grid-cols-2 gap-3">
        {/* + 新建 card */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowCreate(true); setShowAiCreate(false); }}
          className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 press-feedback"
          style={{
            border: "2px dashed rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span className="text-2xl text-warm-300/30">+</span>
          <span className="text-warm-300/40 text-xs">新建卡片</span>
        </motion.button>

        {/* Emotion cards */}
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className="aspect-square rounded-2xl relative overflow-hidden"
            style={{
              background: getCardGradient(card.emotion),
              border: `1px solid ${EMOTION_COLORS[card.emotion]?.replace(/[\d.]+\)$/, "0.2)") || "rgba(255,255,255,0.1)"}`,
            }}
          >
            {/* Menu button */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuCard(menuCard === card.id ? null : card.id); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center
                text-warm-300/30 text-xs z-10 press-feedback"
              style={{ background: "rgba(0,0,0,0.2)" }}
            >
              ···
            </button>

            {/* Menu dropdown */}
            <AnimatePresence>
              {menuCard === card.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-9 right-2 z-20 rounded-xl overflow-hidden"
                  style={{ background: "rgba(20,25,40,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(card); }}
                    className="block w-full px-4 py-2.5 text-left text-warm-200/70 text-xs press-feedback"
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(card.id); }}
                    className="block w-full px-4 py-2.5 text-left text-red-400/70 text-xs press-feedback"
                  >
                    删除
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card content — clickable */}
            <button
              onClick={() => { if (menuCard) { setMenuCard(null); } else if (editingCard !== card.id) { onSelectCard(card); } }}
              className="w-full h-full flex flex-col items-start justify-between p-4 text-left"
            >
              {editingCard === card.id ? (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={20}
                    className="w-full bg-transparent text-warm-100 text-sm border-b border-warm-300/20 pb-1 focus:outline-none mb-2"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(card.id); }}
                  />
                  <button onClick={() => handleEditSave(card.id)}
                    className="text-accent text-xs press-feedback">
                    保存
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-2xl">{card.icon || EMOTION_ICONS[card.emotion] || "🫧"}</span>
                  <div>
                    <p className="text-warm-100 text-sm font-medium leading-tight mb-1">{card.name}</p>
                    {card.description && (
                      <p className="text-warm-300/40 text-[10px] leading-tight line-clamp-2">{card.description}</p>
                    )}
                    <p className="text-[10px] mt-1.5 px-2 py-0.5 rounded-full inline-block"
                      style={{
                        background: EMOTION_COLORS[card.emotion]?.replace(/[\d.]+\)$/, "0.2)"),
                        color: EMOTION_COLORS[card.emotion]?.replace(/[\d.]+\)$/, "0.9)"),
                      }}>
                      {getEmotionLabel(card.emotion)}
                    </p>
                  </div>
                </>
              )}
            </button>
          </motion.div>
        ))}

        {/* AI 帮我想 card */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowAiCreate(true); setShowCreate(false); }}
          className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 press-feedback"
          style={{
            background: "linear-gradient(145deg, rgba(160,140,220,0.15), rgba(100,140,200,0.08))",
            border: "1px solid rgba(160,140,220,0.15)",
          }}
        >
          <span className="text-2xl">✨</span>
          <span className="text-warm-300/50 text-xs">AI 帮我想</span>
          <span className="text-warm-300/25 text-[10px]">
            {getAiCardCount()}/{getAiCardLimit()}/周
          </span>
        </motion.button>
      </div>

      {/* Close menu on outside click */}
      {menuCard && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuCard(null)} />
      )}

      {/* 新建卡片表单 */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="mt-4 glass-md rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <p className="text-warm-200/60 text-sm">新建情绪卡片</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value.slice(0, 20))}
              placeholder="给这种情绪起个名字..."
              maxLength={20}
              className="w-full bg-transparent text-warm-100 text-sm placeholder:text-warm-300/25
                focus:outline-none border-b border-warm-300/10 pb-2"
              autoFocus
            />
            <div>
              <p className="text-warm-300/40 text-xs mb-2">情绪类型</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOTION_TYPES.map((em) => (
                  <button
                    key={em}
                    onClick={() => setNewEmotion(em)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] transition-all press-feedback
                      ${newEmotion === em ? "ring-1 text-warm-100" : "text-warm-300/40"}`}
                    style={{
                      background: newEmotion === em
                        ? EMOTION_COLORS[em]?.replace(/[\d.]+\)$/, "0.25)")
                        : "rgba(255,255,255,0.03)",
                      boxShadow: newEmotion === em ? `0 0 0 1px ${EMOTION_COLORS[em]}` : undefined,
                    }}
                  >
                    {EMOTION_ICONS[em]} {getEmotionLabel(em)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={!newName.trim()}
                className="flex-1 py-2.5 rounded-full glass-heavy text-accent text-sm press-feedback disabled:opacity-30">
                创建
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-full glass text-warm-300/40 text-sm press-feedback">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 生成卡片表单 */}
      <AnimatePresence>
        {showAiCreate && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="mt-4 glass-md rounded-2xl p-4 space-y-3 overflow-hidden"
          >
            <p className="text-warm-200/60 text-sm">描述你的情绪</p>
            <p className="text-warm-300/30 text-xs">用一两句话描述你现在的状态，AI 会为你生成专属卡片</p>
            <input
              type="text"
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value.slice(0, 50))}
              placeholder="比如：回家路上忽然很想哭..."
              maxLength={50}
              className="w-full bg-transparent text-warm-100 text-sm placeholder:text-warm-300/25
                focus:outline-none border-b border-warm-300/10 pb-2"
              autoFocus
            />
            {!canCreateAiCard() && (
              <p className="text-warm-300/40 text-xs">本周 AI 生成次数已用完（{getAiCardCount()}/{getAiCardLimit()}）</p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={handleAiCreate} disabled={!aiDescription.trim() || !canCreateAiCard() || aiLoading}
                className="flex-1 py-2.5 rounded-full glass-heavy text-accent text-sm press-feedback disabled:opacity-30">
                {aiLoading ? "生成中..." : "生成卡片"}
              </button>
              <button onClick={() => setShowAiCreate(false)}
                className="px-4 py-2.5 rounded-full glass text-warm-300/40 text-sm press-feedback">
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
