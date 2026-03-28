"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithPhone,
  verifyPhoneOtp,
  DEEPSLEEP_LIMITS,
} from "@/lib/supabase";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "register" | "phone";

export default function AuthPage({ onClose, onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    if (!email || !password) { setError("请填写完整"); return; }
    setLoading(true);
    setError("");
    try {
      const fn = mode === "register" ? signUpWithEmail : signInWithEmail;
      const { error: authError } = await fn(email, password);
      if (authError) {
        setError(mode === "register" ? "注册失败，请换个邮箱试试" : "登录失败，请检查账号密码");
      } else {
        onSuccess();
      }
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) { setError("请输入正确的手机号"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sms-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.demo) setError("演示模式：验证码为 123456");
      } else {
        setError(data.detail || data.error || "发送失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setError("请输入验证码"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sms-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        // 存储登录状态
        localStorage.setItem("chuangqian_user", JSON.stringify({ phone: data.phone, loggedIn: true }));
        onSuccess();
      } else {
        setError(data.error || "验证失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-6"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-warm-300/50 text-sm safe-top press-feedback"
      >
        关闭
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl mb-3 block">🌙</span>
          <h1 className="text-2xl font-light text-warm-100">睡了么</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 rounded-2xl glass">
          {([
            { key: "login" as AuthMode, label: "登录" },
            { key: "register" as AuthMode, label: "注册" },
            { key: "phone" as AuthMode, label: "手机号" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all press-feedback
                ${mode === tab.key ? "glass-md text-warm-100" : "text-warm-300/50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Email login/register */}
        <AnimatePresence mode="wait">
          {(mode === "login" || mode === "register") && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                           placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                           bg-transparent"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                           placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                           bg-transparent"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm
                           press-feedback disabled:opacity-50"
              >
                {loading ? "请稍等..." : mode === "register" ? "注册" : "登录"}
              </motion.button>
            </motion.div>
          )}

          {/* Phone login */}
          {mode === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="手机号"
                className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                           placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                           bg-transparent"
              />
              {otpSent ? (
                <>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="验证码"
                    maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                    className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                               placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                               bg-transparent"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm
                               press-feedback disabled:opacity-50"
                  >
                    {loading ? "验证中..." : "确认"}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm
                             press-feedback disabled:opacity-50"
                >
                  {loading ? "发送中..." : "发送验证码"}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[#c85050] text-xs"
          >
            {error}
          </motion.p>
        )}

        {/* 游客模式 */}
        <button
          onClick={onClose}
          className="w-full text-center text-warm-300/30 text-xs press-feedback"
        >
          先不登录，随便看看
        </button>
      </motion.div>
    </motion.div>
  );
}

// ===== DeepSleep 会员页 =====
export function DeepSleepPage({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-night-900/98 backdrop-blur-lg overflow-y-auto"
    >
      <div className="max-w-sm mx-auto px-6 py-12 safe-top safe-bottom">
        <button onClick={onClose} className="text-warm-300/50 text-sm mb-8 press-feedback">
          ← 返回
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full glass-heavy glow-accent
                       flex items-center justify-center"
          >
            <span className="text-2xl">💎</span>
          </motion.div>
          <h1 className="text-2xl font-light text-warm-100 mb-2">DeepSleep</h1>
          <p className="text-warm-300/50 text-sm">更深度的睡前陪伴</p>
        </div>

        {/* 权益对比 */}
        <div className="space-y-4 mb-8">
          {[
            {
              title: "自定义情绪库",
              free: `每天 ${DEEPSLEEP_LIMITS.free.customMoodsPerDay} 条`,
              deep: `每天 ${DEEPSLEEP_LIMITS.deepsleep.customMoodsPerDay} 条`,
            },
            {
              title: "AI 深度沟通",
              free: `每次 ${DEEPSLEEP_LIMITS.free.aiChatPerSession} 条消息`,
              deep: `每次 ${DEEPSLEEP_LIMITS.deepsleep.aiChatPerSession} 条 · 更细腻的回复`,
            },
            {
              title: "独家定制情绪块",
              free: "无",
              deep: "每月 AI 生成 30 条专属情绪",
            },
          ].map((item) => (
            <div key={item.title} className="glass-md rounded-2xl p-4">
              <p className="text-warm-100 text-sm mb-2">{item.title}</p>
              <div className="flex justify-between text-xs">
                <span className="text-warm-300/40">免费: {item.free}</span>
                <span className="text-accent/80">💎 {item.deep}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 价格 */}
        <div className="text-center mb-6">
          <p className="text-warm-400 text-4xl font-light">
            ¥{DEEPSLEEP_LIMITS.deepsleep.monthlyPrice}
            <span className="text-warm-300/50 text-sm">/月</span>
          </p>
        </div>

        {/* 订阅按钮 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // TODO: 接入微信支付/支付宝
            // 临时：本地模拟开通
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            localStorage.setItem("chuangqian_deepsleep", JSON.stringify({
              expiresAt: expiresAt.toISOString(),
            }));
            alert("已开通 DeepSleep（演示模式）");
            onClose();
          }}
          className="w-full py-4 rounded-full bg-gradient-to-r from-accent to-[#9678b4]
                     text-white text-sm font-medium press-feedback"
        >
          开通 DeepSleep
        </motion.button>

        <p className="text-center text-warm-300/25 text-xs mt-3">
          支付功能即将上线，敬请期待
        </p>
      </div>
    </motion.div>
  );
}
