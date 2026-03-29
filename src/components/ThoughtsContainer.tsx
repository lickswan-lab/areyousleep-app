"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  addWorry, updateWorry, getWorries, type Worry,
  addInspiration, getInspirations, deleteInspiration, type Inspiration,
  addThought, getThoughts, deleteThought, type Thought,
} from "@/lib/store";

type Category = "anxiety" | "inspiration" | "thoughts";

interface ThoughtsContainerProps {
  onSealWorry: (worry: Worry) => void;
}

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: "anxiety", label: "焦虑", icon: "🌀", color: "rgba(160,110,200,0.7)" },
  { key: "inspiration", label: "灵感", icon: "💡", color: "rgba(220,180,80,0.7)" },
  { key: "thoughts", label: "思绪", icon: "☁️", color: "rgba(140,160,200,0.7)" },
];

// 统一的记录类型
interface UnifiedEntry {
  id: string;
  content: string;
  category: Category;
  createdAt: string;
  // worry-specific
  aiResponse?: string;
  resolved?: boolean;
}

export default function ThoughtsContainer({ onSealWorry }: ThoughtsContainerProps) {
  const [category, setCategory] = useState<Category>("anxiety");
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<UnifiedEntry[]>([]);

  const refreshEntries = useCallback(() => {
    const worries: UnifiedEntry[] = getWorries().map(w => ({
      id: w.id, content: w.content, category: "anxiety" as Category,
      createdAt: w.createdAt, aiResponse: w.aiResponse, resolved: w.resolved,
    }));
    const inspirations: UnifiedEntry[] = getInspirations().map(i => ({
      id: i.id, content: i.content, category: "inspiration" as Category, createdAt: i.createdAt,
    }));
    const thoughts: UnifiedEntry[] = getThoughts().map(t => ({
      id: t.id, content: t.content, category: "thoughts" as Category, createdAt: t.createdAt,
    }));

    // 合并并按时间倒序
    const all = [...worries, ...inspirations, ...thoughts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setEntries(all);
  }, []);

  useEffect(() => { refreshEntries(); }, [refreshEntries]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    setIsSubmitting(true);
    setInput("");

    if (category === "anxiety") {
      const worry = addWorry(text);
      refreshEntries();
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        const analysis = await res.json();
        updateWorry(worry.id, { category: analysis.category, aiResponse: analysis.response });
        refreshEntries();
      } catch { /* silent */ }
    } else if (category === "inspiration") {
      addInspiration(text);
      refreshEntries();
    } else {
      addThought(text);
      refreshEntries();
    }

    setIsSubmitting(false);
  };

  const handleDelete = (entry: UnifiedEntry) => {
    if (entry.category === "anxiety") {
      updateWorry(entry.id, { resolved: true });
    } else if (entry.category === "inspiration") {
      deleteInspiration(entry.id);
    } else {
      deleteThought(entry.id);
    }
    refreshEntries();
  };

  const getCategoryInfo = (cat: Category) => CATEGORIES.find(c => c.key === cat)!;
  const currentCat = getCategoryInfo(category);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("zh", { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `今天 ${time}`;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return `昨天 ${time}`;
    return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
  };

  // 过滤掉已解决的焦虑
  const visibleEntries = entries.filter(e => !(e.category === "anxiety" && e.resolved));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-3xl overflow-hidden mb-4"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="p-4">
        {/* 类别选择 */}
        <div className="flex gap-2 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all press-feedback
                ${category === cat.key ? "text-warm-100" : "text-warm-300/35"}`}
              style={{
                background: category === cat.key
                  ? cat.color.replace(/[\d.]+\)$/, "0.15)")
                  : "transparent",
                boxShadow: category === cat.key
                  ? `0 0 0 1px ${cat.color.replace(/[\d.]+\)$/, "0.2)")}`
                  : undefined,
              }}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* 统一输入框 */}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            placeholder={
              category === "anxiety" ? "写下你的担忧..."
              : category === "inspiration" ? "记下这个灵感..."
              : "随便写点什么..."
            }
            maxLength={500}
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            className="flex-1 bg-transparent text-warm-100 text-sm placeholder:text-warm-300/20
              focus:outline-none resize-none rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${currentCat.color.replace(/[\d.]+\)$/, "0.1)")}`,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSubmitting}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center press-feedback disabled:opacity-30 transition-all"
            style={{
              background: currentCat.color.replace(/[\d.]+\)$/, "0.2)"),
            }}
          >
            <span className="text-warm-100 text-sm">↑</span>
          </button>
        </div>

        {/* 过往记录列表 */}
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
          {visibleEntries.length === 0 && (
            <p className="text-center text-warm-300/20 text-xs py-6">
              还没有记录，写下第一条吧
            </p>
          )}

          <AnimatePresence>
            {visibleEntries.map((entry) => {
              const cat = getCategoryInfo(entry.category);
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{
                    background: cat.color.replace(/[\d.]+\)$/, "0.04)"),
                    border: `1px solid ${cat.color.replace(/[\d.]+\)$/, "0.06)")}`,
                  }}
                >
                  {/* 类别标识 */}
                  <span className="text-sm shrink-0 mt-0.5">{cat.icon}</span>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-warm-100 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>

                    {/* AI 回应（仅焦虑类） */}
                    {entry.category === "anxiety" && entry.aiResponse && (
                      <p className="text-warm-300/40 text-xs mt-2 pl-2 leading-relaxed"
                        style={{ borderLeft: `2px solid ${cat.color.replace(/[\d.]+\)$/, "0.2)")}` }}>
                        {entry.aiResponse}
                      </p>
                    )}

                    {/* 时间 + 类别 */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px]" style={{ color: cat.color.replace(/[\d.]+\)$/, "0.5)") }}>
                        {cat.label}
                      </span>
                      <span className="text-warm-300/15 text-[10px]">·</span>
                      <span className="text-warm-300/20 text-[10px]">{formatTime(entry.createdAt)}</span>
                    </div>
                  </div>

                  {/* 删除/封印 */}
                  <button
                    onClick={() => {
                      if (entry.category === "anxiety") {
                        onSealWorry({ id: entry.id, content: entry.content, createdAt: entry.createdAt } as Worry);
                      } else {
                        handleDelete(entry);
                      }
                    }}
                    className="text-warm-300/20 text-xs press-feedback shrink-0 mt-0.5"
                  >
                    {entry.category === "anxiety" ? "📦" : "×"}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
