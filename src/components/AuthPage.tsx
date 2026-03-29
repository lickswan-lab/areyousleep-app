"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { DEEPSLEEP_LIMITS } from "@/lib/supabase";
import { activateCode } from "@/lib/invite-codes";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "register" | "reset";
type RegisterStep = "phone" | "verify" | "password"; // 注册三步

// 简单密码哈希（MVP，生产环境应用 bcrypt + 后端）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "chuangqian_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// 用户凭证存储
const CREDENTIALS_KEY = "chuangqian_credentials"; // { phone: string, passwordHash: string }[]

function getCredentials(): { phone: string; passwordHash: string }[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CREDENTIALS_KEY);
  return data ? JSON.parse(data) : [];
}

function findCredential(phone: string) {
  return getCredentials().find(c => c.phone === phone);
}

function saveCredential(phone: string, passwordHash: string) {
  const creds = getCredentials().filter(c => c.phone !== phone);
  creds.push({ phone, passwordHash });
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

export default function AuthPage({ onClose, onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("phone");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const isPhone = /^1[3-9]\d{9}$/.test(account);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const resetState = () => {
    setOtpSent(false); setOtpVerified(false); setOtp(""); setPassword("");
    setConfirmPassword(""); setError(""); setSuccess(""); setRegisterStep("phone");
  };

  // 发送验证码
  const handleSendOtp = useCallback(async () => {
    if (!isPhone) { setError("请输入正确的手机号"); return; }
    if (countdown > 0) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/sms-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: account }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(60);
        setSuccess("验证码已发送");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "发送失败");
      }
    } catch { setError("网络错误"); }
    finally { setLoading(false); }
  }, [account, isPhone, countdown]);

  // 验证验证码
  const handleVerifyOtp = async (): Promise<boolean> => {
    if (!otp || otp.length < 4) { setError("请输入验证码"); return false; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/sms-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: account, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        return true;
      } else {
        setError(data.error || "验证码错误");
        return false;
      }
    } catch { setError("网络错误"); return false; }
    finally { setLoading(false); }
  };

  // 完成登录（保存状态）
  const completeLogin = (phone: string) => {
    localStorage.setItem("chuangqian_user", JSON.stringify({
      phone, loggedIn: true, type: "phone", loginAt: new Date().toISOString(),
    }));
    onSuccess();
  };

  // === 登录 ===
  const handleLogin = async () => {
    if (!isPhone) { setError("请输入手机号"); return; }
    if (!password || password.length < 6) { setError("请输入密码（至少6位）"); return; }
    setLoading(true); setError("");
    try {
      const cred = findCredential(account);
      if (!cred) { setError("该手机号未注册"); setLoading(false); return; }
      const hash = await hashPassword(password);
      if (hash !== cred.passwordHash) { setError("密码错误"); setLoading(false); return; }
      completeLogin(account);
    } catch { setError("登录失败"); }
    finally { setLoading(false); }
  };

  // === 注册：步骤流 ===
  const handleRegisterNext = async () => {
    if (registerStep === "phone") {
      // Step 1: 发送验证码
      if (!isPhone) { setError("请输入正确的手机号"); return; }
      const cred = findCredential(account);
      if (cred) { setError("该手机号已注册，请直接登录"); return; }
      await handleSendOtp();
      if (isPhone) setRegisterStep("verify");
    } else if (registerStep === "verify") {
      // Step 2: 验证验证码
      const ok = await handleVerifyOtp();
      if (ok) setRegisterStep("password");
    } else if (registerStep === "password") {
      // Step 3: 设置密码
      if (!password || password.length < 6) { setError("密码至少6位"); return; }
      if (password !== confirmPassword) { setError("两次密码不一致"); return; }
      if (!agreedToTerms) { setError("请先同意用户协议"); return; }
      setLoading(true); setError("");
      try {
        const hash = await hashPassword(password);
        saveCredential(account, hash);
        completeLogin(account);
      } catch { setError("注册失败"); }
      finally { setLoading(false); }
    }
  };

  // === 忘记密码 ===
  const handleReset = async () => {
    if (!otpSent) {
      // Step 1: 发送验证码
      if (!isPhone) { setError("请输入手机号"); return; }
      const cred = findCredential(account);
      if (!cred) { setError("该手机号未注册"); return; }
      await handleSendOtp();
    } else if (!otpVerified) {
      // Step 2: 验证验证码
      await handleVerifyOtp();
    } else {
      // Step 3: 设置新密码
      if (!password || password.length < 6) { setError("新密码至少6位"); return; }
      setLoading(true); setError("");
      try {
        const hash = await hashPassword(password);
        saveCredential(account, hash);
        setSuccess("密码重置成功");
        setTimeout(() => { setMode("login"); resetState(); }, 1500);
      } catch { setError("重置失败"); }
      finally { setLoading(false); }
    }
  };

  // 统一提交
  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else if (mode === "register") handleRegisterNext();
    else if (mode === "reset") handleReset();
  };

  // 按钮文字
  const getButtonText = () => {
    if (loading) return "请稍等...";
    if (mode === "login") return "登录";
    if (mode === "register") {
      if (registerStep === "phone") return "发送验证码";
      if (registerStep === "verify") return "验证";
      return "完成注册";
    }
    if (mode === "reset") {
      if (!otpSent) return "发送验证码";
      if (!otpVerified) return "验证";
      return "重置密码";
    }
    return "确定";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-6 overflow-y-auto"
    >
      <button onClick={onClose}
        className="absolute top-6 right-6 text-warm-300/50 text-sm safe-top press-feedback">
        关闭
      </button>

      {/* 用户协议弹窗 */}
      <AnimatePresence>
        {showTerms && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-night-900/98 overflow-y-auto">
            <div className="max-w-lg mx-auto px-6 py-8 safe-top safe-bottom">
              <button onClick={() => setShowTerms(false)} className="text-warm-300/50 text-sm mb-4 press-feedback">← 返回</button>
              <TermsContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-3xl mb-3 block">🌙</span>
          <h1 className="text-2xl font-light text-warm-100">床前</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 rounded-2xl glass">
          {([
            { key: "login" as AuthMode, label: "登录" },
            { key: "register" as AuthMode, label: "注册" },
          ]).map((tab) => (
            <button key={tab.key}
              onClick={() => { setMode(tab.key); resetState(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all press-feedback
                ${mode === tab.key ? "glass-md text-warm-100" : "text-warm-300/50"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* === 登录模式 === */}
        {mode === "login" && (
          <div className="space-y-3">
            <input type="text" value={account}
              onChange={(e) => { setAccount(e.target.value); setError(""); }}
              placeholder="手机号"
              className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
          </div>
        )}

        {/* === 注册模式 === */}
        {mode === "register" && (
          <div className="space-y-3">
            {/* 注册进度 */}
            <div className="flex gap-2 mb-2">
              {(["phone", "verify", "password"] as RegisterStep[]).map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-1">
                  <div className={`h-1 flex-1 rounded-full transition-all ${
                    (["phone","verify","password"].indexOf(registerStep) >= i) ? "bg-accent/50" : "bg-warm-300/10"}`} />
                </div>
              ))}
            </div>

            {registerStep === "phone" && (
              <>
                <input type="text" value={account}
                  onChange={(e) => { setAccount(e.target.value); setError(""); }}
                  placeholder="手机号"
                  className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                    placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
                <p className="text-warm-300/25 text-[10px] ml-2">我们将发送验证码到你的手机</p>
              </>
            )}

            {registerStep === "verify" && (
              <>
                <p className="text-warm-200/50 text-sm">验证码已发送到 {account}</p>
                <div className="flex gap-2">
                  <input type="text" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="输入验证码" maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="flex-1 glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                      placeholder:text-warm-300/30 focus:outline-none bg-transparent tracking-[0.3em]" />
                  <button onClick={handleSendOtp} disabled={countdown > 0}
                    className="shrink-0 px-4 py-3.5 rounded-2xl glass text-sm press-feedback disabled:opacity-40"
                    style={{ color: countdown > 0 ? "rgba(212,190,150,0.3)" : "rgba(107,140,206,0.8)" }}>
                    {countdown > 0 ? `${countdown}s` : "重发"}
                  </button>
                </div>
              </>
            )}

            {registerStep === "password" && (
              <>
                <p className="text-warm-200/50 text-sm">设置你的登录密码</p>
                <input type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码（至少6位）"
                  className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                    placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
                <input type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="确认密码"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                    placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
                <div className="flex items-start gap-2">
                  <button onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center text-[10px]
                      ${agreedToTerms ? "bg-accent/30 border-accent/50 text-accent" : "border-warm-300/20"}`}>
                    {agreedToTerms && "✓"}
                  </button>
                  <p className="text-warm-300/40 text-xs">
                    我已阅读并同意
                    <button onClick={() => setShowTerms(true)} className="text-accent/70 underline">《用户协议》</button>
                    和
                    <button onClick={() => setShowTerms(true)} className="text-accent/70 underline">《隐私政策》</button>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* === 忘记密码模式 === */}
        {mode === "reset" && (
          <div className="space-y-3">
            <input type="text" value={account}
              onChange={(e) => { setAccount(e.target.value); setError(""); }}
              placeholder="手机号" disabled={otpSent}
              className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                placeholder:text-warm-300/30 focus:outline-none bg-transparent disabled:opacity-50" />

            {otpSent && !otpVerified && (
              <div className="flex gap-2">
                <input type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="验证码" maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="flex-1 glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                    placeholder:text-warm-300/30 focus:outline-none bg-transparent tracking-[0.3em]" />
                <button onClick={handleSendOtp} disabled={countdown > 0}
                  className="shrink-0 px-4 py-3.5 rounded-2xl glass text-sm press-feedback disabled:opacity-40"
                  style={{ color: countdown > 0 ? "rgba(212,190,150,0.3)" : "rgba(107,140,206,0.8)" }}>
                  {countdown > 0 ? `${countdown}s` : "重发"}
                </button>
              </div>
            )}

            {otpVerified && (
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新密码（至少6位）"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                  placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20 bg-transparent" />
            )}
          </div>
        )}

        {/* 提交按钮 */}
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit}
          disabled={loading || (mode === "login" && !isPhone)}
          className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm press-feedback disabled:opacity-40">
          {getButtonText()}
        </motion.button>

        {/* 错误/成功提示 */}
        <AnimatePresence>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-[#c85050] text-xs">{error}</motion.p>}
          {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-success/80 text-xs">{success}</motion.p>}
        </AnimatePresence>

        {/* 底部链接 */}
        <div className="flex justify-between items-center">
          {mode === "login" && (
            <button onClick={() => { setMode("reset"); resetState(); }}
              className="text-warm-300/30 text-xs press-feedback">忘记密码</button>
          )}
          {mode === "reset" && (
            <button onClick={() => { setMode("login"); resetState(); }}
              className="text-warm-300/30 text-xs press-feedback">← 返回登录</button>
          )}
          {mode === "register" && registerStep !== "phone" && (
            <button onClick={() => {
              if (registerStep === "verify") setRegisterStep("phone");
              else if (registerStep === "password") setRegisterStep("verify");
            }} className="text-warm-300/30 text-xs press-feedback">← 上一步</button>
          )}
          <button onClick={onClose} className="text-warm-300/25 text-xs press-feedback ml-auto">
            先不登录
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== 用户协议内容 =====
function TermsContent() {
  return (
    <div className="space-y-6 text-warm-200/70 text-sm leading-relaxed">
      <h1 className="text-warm-100 text-xl font-medium">用户协议与隐私政策</h1>
      <p className="text-warm-300/40 text-xs">最后更新：2026年3月28日</p>
      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">一、服务协议</h2>
        <p>欢迎使用「床前」（以下简称"本应用"）。本应用由床前团队（以下简称"我们"）开发和运营。请您在使用本应用前仔细阅读本协议。</p>
        <p>1.1 本应用是一款睡前情绪管理工具，旨在帮助用户在睡前进行情绪记录、认知卸载和放松引导。本应用不提供医疗诊断、心理治疗或药物建议。</p>
        <p>1.2 如果您正在经历严重的睡眠障碍、心理健康问题或有自我伤害的想法，请及时寻求专业的医疗或心理帮助。全国24小时心理援助热线：400-161-9995。</p>
        <p>1.3 您需要年满14周岁方可注册使用本应用。14-18周岁的用户应在监护人知情同意下使用。</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">二、账号与安全</h2>
        <p>2.1 您可以通过手机号注册账号，并设置登录密码。您应妥善保管账号密码。</p>
        <p>2.2 您的所有个人数据（情绪记录、睡眠仪式、会员状态等）均绑定在您的账号上。</p>
        <p>2.3 如忘记密码，可通过手机验证码重置。</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">三、会员服务</h2>
        <p>3.1 本应用提供 DeepSleep 付费会员服务，按月订阅，费用为人民币15元/月。</p>
        <p>3.2 会员权益包括但不限于：更多睡眠仪式配额、AI 深度沟通、独家定制内容。</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">四、隐私政策</h2>
        <p>• 账号信息：手机号码用于注册和登录，密码加密存储。</p>
        <p>• 使用数据：情绪记录、睡眠仪式等存储在设备本地。</p>
        <p>• AI 功能：情绪文字发送至第三方 AI 服务分析，不传输个人身份信息。</p>
        <p>• 我们不会出售、出租您的个人信息。</p>
      </section>
      <p className="text-warm-300/30 text-xs text-center pt-4">© 2026 床前 保留所有权利</p>
    </div>
  );
}

// ===== DeepSleep 会员页 =====
export function DeepSleepPage({ onClose }: { onClose: () => void }) {
  const [inviteCode, setInviteCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState(false);

  const handleActivateCode = () => {
    if (!inviteCode.trim()) { setCodeError("请输入邀请码"); return; }
    setCodeError("");
    if (activateCode(inviteCode)) {
      setCodeSuccess(true);
      setTimeout(() => onClose(), 1500);
    } else {
      setCodeError("邀请码无效或已被使用");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-night-900/98 backdrop-blur-lg overflow-y-auto">
      <div className="max-w-sm mx-auto px-6 py-12 safe-top safe-bottom">
        <button onClick={onClose} className="text-warm-300/50 text-sm mb-8 press-feedback">← 返回</button>
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full glass-heavy glow-accent flex items-center justify-center">
            <span className="text-2xl">💎</span>
          </motion.div>
          <h1 className="text-2xl font-light text-warm-100 mb-2">DeepSleep</h1>
          <p className="text-warm-300/50 text-sm">更深度的睡前陪伴</p>
        </div>
        <div className="space-y-4 mb-8">
          {[
            { title: "睡眠仪式", free: "2 套", deep: "10 套" },
            { title: "AI 情绪卡片", free: "5 张/周", deep: "20 张/周" },
            { title: "AI 深度沟通", free: `每次 ${DEEPSLEEP_LIMITS.free.aiChatPerSession} 条`, deep: `每次 ${DEEPSLEEP_LIMITS.deepsleep.aiChatPerSession} 条` },
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
        <div className="text-center mb-6">
          <p className="text-warm-400 text-4xl font-light">
            ¥{DEEPSLEEP_LIMITS.deepsleep.monthlyPrice}<span className="text-warm-300/50 text-sm">/月</span>
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            localStorage.setItem("chuangqian_deepsleep", JSON.stringify({ expiresAt: expiresAt.toISOString() }));
            alert("已开通 DeepSleep（演示模式）");
            onClose();
          }}
          className="w-full py-4 rounded-full bg-gradient-to-r from-accent to-[#9678b4] text-white text-sm font-medium press-feedback">
          开通 DeepSleep
        </motion.button>
        <p className="text-center text-warm-300/25 text-xs mt-3">支付功能即将上线</p>

        <div className="mt-8 pt-6 border-t border-warm-300/10">
          <p className="text-warm-200/60 text-sm text-center mb-4">有邀请码？</p>
          {codeSuccess ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-success/80 text-sm">激活成功！DeepSleep 已开通 30 天</motion.p>
          ) : (
            <div className="flex gap-2">
              <input type="text" value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 15))}
                placeholder="SLEEP-XXXX-XXXX"
                className="flex-1 glass-md rounded-2xl px-4 py-3 text-warm-100 text-sm text-center
                  placeholder:text-warm-300/25 focus:outline-none bg-transparent tracking-widest font-mono" />
              <button onClick={handleActivateCode}
                className="shrink-0 px-4 py-3 rounded-2xl glass-heavy text-accent text-sm press-feedback">激活</button>
            </div>
          )}
          {codeError && <p className="text-center text-[#c85050] text-xs mt-2">{codeError}</p>}
        </div>
      </div>
    </motion.div>
  );
}
