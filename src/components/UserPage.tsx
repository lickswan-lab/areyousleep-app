"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings, PERSONA_LABELS, type UserSettings, type UserPersona } from "@/lib/store";
import MoodProfile from "./MoodProfile";
import WeeklyReport from "./WeeklyReport";
import AuthPage, { DeepSleepPage } from "./AuthPage";
import { isDeepSleep } from "@/lib/supabase";

interface UserPageProps {
  onClose: () => void;
}

type Tab = "mood" | "report" | "account" | "settings";

export default function UserPage({ onClose }: UserPageProps) {
  const [tab, setTab] = useState<Tab>("mood");
  const [subOverlay, setSubOverlay] = useState<"mood-detail" | "report-detail" | "auth" | "deepsleep" | null>(null);

  // Sub-overlays for full-screen views
  if (subOverlay === "mood-detail") {
    return <MoodProfile onClose={() => setSubOverlay(null)} />;
  }
  if (subOverlay === "report-detail") {
    return <WeeklyReport onClose={() => setSubOverlay(null)} />;
  }
  if (subOverlay === "auth") {
    return <AuthPage onClose={() => setSubOverlay(null)} onSuccess={() => setSubOverlay(null)} />;
  }
  if (subOverlay === "deepsleep") {
    return <DeepSleepPage onClose={() => setSubOverlay(null)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-5 pb-8 safe-top safe-bottom min-h-dvh flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pt-6 pb-4"
        >
          <button onClick={onClose} className="text-warm-300/60 text-sm press-feedback">
            ← 返回
          </button>
          <h1 className="text-warm-100 text-lg font-medium">个人中心</h1>
        </motion.div>

        {/* 用户信息栏 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          {(() => {
            const settings = getUserSettings();
            const deep = isDeepSleep();
            return (
              <div className="flex items-center gap-4">
                {/* 头像 */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: deep
                      ? "linear-gradient(135deg, rgba(107,140,206,0.3), rgba(150,120,180,0.2))"
                      : "rgba(255,255,255,0.06)",
                    border: deep ? "1px solid rgba(107,140,206,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {settings.nickname ? settings.nickname[0] : "🌙"}
                </div>
                {/* 名字+状态 */}
                <div className="flex-1 min-w-0">
                  <p className="text-warm-100 text-base font-medium truncate">
                    {settings.nickname || "未设置昵称"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {deep ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full text-accent"
                        style={{ background: "rgba(107,140,206,0.15)", border: "1px solid rgba(107,140,206,0.25)" }}>
                        💎 DeepSleep
                      </span>
                    ) : (
                      <span className="text-warm-300/40 text-[11px]">免费版</span>
                    )}
                    {settings.persona && settings.persona !== "general" && (
                      <span className="text-warm-300/30 text-[11px]">
                        {PERSONA_LABELS[settings.persona]}
                      </span>
                    )}
                  </div>
                </div>
                {/* 升级/登录 */}
                {!deep && (
                  <button
                    onClick={() => setSubOverlay("deepsleep")}
                    className="text-accent/70 text-xs px-3 py-1.5 rounded-full glass press-feedback shrink-0"
                  >
                    升级
                  </button>
                )}
              </div>
            );
          })()}
        </motion.div>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-1 p-1 rounded-2xl glass mb-6"
        >
          {([
            { key: "mood" as Tab, label: "心情" },
            { key: "report" as Tab, label: "总结" },
            { key: "account" as Tab, label: "账号" },
            { key: "settings" as Tab, label: "设置" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all press-feedback
                ${tab === t.key
                  ? "glass-md text-warm-100"
                  : "text-warm-300/50"
                }`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <MoodQuickView onViewDetail={() => setSubOverlay("mood-detail")} />
            </motion.div>
          )}
          {tab === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <ReportQuickView onViewDetail={() => setSubOverlay("report-detail")} />
            </motion.div>
          )}
          {tab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <AccountView onOpenAuth={() => setSubOverlay("auth")} onOpenDeepSleep={() => setSubOverlay("deepsleep")} />
            </motion.div>
          )}
          {tab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ===== 心情快览 =====
function MoodQuickView({ onViewDetail }: { onViewDetail: () => void }) {
  const { getMoodEntries, getEmotionLabel } = require("@/lib/store");
  const { EMOTION_COLORS } = require("@/lib/mood-descriptions");
  const entries = getMoodEntries().slice(0, 7);

  return (
    <div className="space-y-4">
      <div className="glass-md rounded-2xl p-5">
        <p className="text-warm-200/60 text-sm mb-4">最近心情</p>
        {entries.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {entries.map((e: { id: string; emotion?: string }) => (
              <div
                key={e.id}
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: EMOTION_COLORS[e.emotion || "calm"] || "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-warm-300/30 text-sm">还没有记录</p>
        )}
      </div>

      <button
        onClick={onViewDetail}
        className="w-full py-3.5 rounded-2xl glass-md text-warm-200/70 text-sm press-feedback
                   flex items-center justify-center gap-2"
      >
        查看完整心情档案 →
      </button>
    </div>
  );
}

// ===== 总结快览 =====
function ReportQuickView({ onViewDetail }: { onViewDetail: () => void }) {
  const { getWeeklyStats } = require("@/lib/store");
  const stats = getWeeklyStats();

  return (
    <div className="space-y-4">
      <div className="glass-md rounded-2xl p-5">
        <p className="text-warm-200/60 text-sm mb-2">{stats.dateRange}</p>
        <p className="text-warm-100 text-2xl font-light mb-1">
          {stats.weekWorries} <span className="text-sm text-warm-300/50">件担忧</span>
        </p>
        {stats.neverHappenedRate > 0 && (
          <p className="text-warm-300/40 text-sm">
            其中 {stats.neverHappenedRate}% 第二天就不重要了
          </p>
        )}
      </div>

      <button
        onClick={onViewDetail}
        className="w-full py-3.5 rounded-2xl glass-md text-warm-200/70 text-sm press-feedback
                   flex items-center justify-center gap-2"
      >
        查看完整报告 →
      </button>
    </div>
  );
}

// ===== 设置 =====
// ===== 账号 =====
function AccountView({ onOpenAuth, onOpenDeepSleep }: { onOpenAuth: () => void; onOpenDeepSleep: () => void }) {
  const deep = isDeepSleep();
  const loggedIn = typeof window !== "undefined" && localStorage.getItem("chuangqian_user");

  return (
    <div className="space-y-4">
      {/* 登录状态 */}
      <div className="glass-md rounded-2xl p-5">
        <p className="text-warm-200/60 text-sm mb-3">账号状态</p>
        {loggedIn ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warm-100 text-sm">已登录</p>
              <p className="text-warm-300/40 text-xs mt-0.5">
                {(() => { try { return JSON.parse(loggedIn).phone || JSON.parse(loggedIn).email || ""; } catch { return ""; } })()}
              </p>
            </div>
            <button
              onClick={() => { localStorage.removeItem("chuangqian_user"); window.location.reload(); }}
              className="text-warm-300/40 text-xs px-3 py-1.5 rounded-full glass press-feedback"
            >
              退出
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback"
          >
            登录 / 注册
          </button>
        )}
      </div>

      {/* DeepSleep 会员 */}
      <div
        className="rounded-2xl p-5 cursor-pointer press-feedback"
        style={{
          background: deep
            ? "linear-gradient(135deg, rgba(107,140,206,0.2), rgba(150,120,180,0.15))"
            : "linear-gradient(135deg, rgba(107,140,206,0.1), rgba(150,120,180,0.06))",
          border: `1px solid ${deep ? "rgba(107,140,206,0.3)" : "rgba(107,140,206,0.15)"}`,
        }}
        onClick={onOpenDeepSleep}
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-warm-100 text-sm flex items-center gap-2">
              💎 DeepSleep
              {deep && <span className="text-accent text-xs">已开通</span>}
            </p>
            <p className="text-warm-300/40 text-xs mt-1">更深度的睡前陪伴</p>
          </div>
          <div className="text-right">
            <p className="text-warm-400 text-lg font-light">¥15</p>
            <p className="text-warm-300/30 text-[10px]">/月</p>
          </div>
        </div>
        {!deep && (
          <div className="mt-3 flex gap-2 text-[10px] text-warm-300/40">
            <span className="px-2 py-0.5 rounded-full glass">自定义情绪 10条/天</span>
            <span className="px-2 py-0.5 rounded-full glass">AI深聊 20条/次</span>
            <span className="px-2 py-0.5 rounded-full glass">独家定制</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 设置 =====
function SettingsView() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    setSettings(getUserSettings());
  }, []);

  const save = (updates: Partial<UserSettings>) => {
    updateUserSettings(updates);
    setSettings({ ...settings, ...updates });
  };

  const addCustomMood = () => {
    const text = customInput.trim();
    if (!text || settings.customMoods.includes(text)) return;
    save({ customMoods: [...settings.customMoods, text] });
    setCustomInput("");
  };

  const removeCustomMood = (text: string) => {
    save({ customMoods: settings.customMoods.filter((m) => m !== text) });
  };

  return (
    <div className="space-y-6">
      {/* 昵称 */}
      <div className="glass-md rounded-2xl p-5 space-y-3">
        <p className="text-warm-200/60 text-sm">昵称</p>
        <input
          type="text"
          value={settings.nickname || ""}
          onChange={(e) => save({ nickname: e.target.value.slice(0, 20) })}
          placeholder="给自己起个名字"
          maxLength={20}
          className="w-full bg-transparent text-warm-100 text-base
                     placeholder:text-warm-300/25 focus:outline-none
                     border-b border-warm-300/10 pb-2"
        />
      </div>

      {/* 身份 */}
      <div className="glass-md rounded-2xl p-5 space-y-3">
        <p className="text-warm-200/60 text-sm">我是</p>
        <p className="text-warm-300/30 text-xs">选择后会看到更贴近你的心情描述</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.entries(PERSONA_LABELS) as [UserPersona, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => save({ persona: key })}
              className={`px-3.5 py-2 rounded-full text-xs transition-all press-feedback
                ${settings.persona === key
                  ? "glass-heavy text-warm-100 glow-sm"
                  : "glass text-warm-300/50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 睡觉时段 */}
      <div className="glass-md rounded-2xl p-5 space-y-4">
        <p className="text-warm-200/60 text-sm">睡觉时段</p>
        <p className="text-warm-300/30 text-xs">这个时段内显示完整睡前仪式，其他时间显示白天模式</p>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-warm-300/40 text-xs mb-1 block">开始</label>
            <select
              value={settings.sleepStartHour}
              onChange={(e) => save({ sleepStartHour: Number(e.target.value) })}
              className="w-full bg-night-700/50 text-warm-100 text-sm rounded-xl px-3 py-2.5
                         border border-night-600/30 focus:outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <span className="text-warm-300/30 text-sm mt-4">→</span>
          <div className="flex-1">
            <label className="text-warm-300/40 text-xs mb-1 block">结束</label>
            <select
              value={settings.sleepEndHour}
              onChange={(e) => save({ sleepEndHour: Number(e.target.value) })}
              className="w-full bg-night-700/50 text-warm-100 text-sm rounded-xl px-3 py-2.5
                         border border-night-600/30 focus:outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-warm-300/25 text-xs text-center">
          当前：{String(settings.sleepStartHour).padStart(2, "0")}:00 → {String(settings.sleepEndHour).padStart(2, "0")}:00
        </p>
      </div>

      {/* 自定义心情 */}
      <div className="glass-md rounded-2xl p-5 space-y-4">
        <p className="text-warm-200/60 text-sm">自定义心情描述</p>
        <p className="text-warm-300/30 text-xs">添加属于你自己的心情描述，它们会出现在签到卡片中</p>

        {/* 已添加的 */}
        {settings.customMoods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {settings.customMoods.map((text) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-warm-200/70 text-xs"
              >
                {text}
                <button
                  onClick={() => removeCustomMood(text)}
                  className="text-warm-300/30 hover:text-warm-300/60 ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* 输入新的 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value.slice(0, 50))}
            placeholder="写一个你的心情..."
            maxLength={50}
            onKeyDown={(e) => e.key === "Enter" && addCustomMood()}
            className="flex-1 bg-transparent text-warm-100 text-sm
                       placeholder:text-warm-300/25 focus:outline-none
                       border-b border-warm-300/10 pb-2"
          />
          <button
            onClick={addCustomMood}
            disabled={!customInput.trim()}
            className="text-accent text-sm px-3 py-1 rounded-full glass press-feedback
                       disabled:opacity-30"
          >
            添加
          </button>
        </div>
      </div>

    </div>
  );
}
