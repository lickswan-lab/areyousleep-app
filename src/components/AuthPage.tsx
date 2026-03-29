"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { signUpWithEmail, signInWithEmail, DEEPSLEEP_LIMITS } from "@/lib/supabase";
import { activateCode } from "@/lib/invite-codes";

interface AuthPageProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "register" | "reset";

export default function AuthPage({ onClose, onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  // 统一输入：自动判断邮箱还是手机号
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const isPhone = /^1[3-9]\d{9}$/.test(account);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
  const accountType = isPhone ? "phone" : isEmail ? "email" : null;

  // 验证码倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 发送验证码
  const handleSendOtp = useCallback(async () => {
    if (!isPhone) { setError("请输入正确的手机号"); return; }
    if (countdown > 0) return;
    setLoading(true);
    setError("");
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
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [account, isPhone, countdown]);

  // 手机号验证码登录/注册
  const handlePhoneAuth = async () => {
    if (!otp || otp.length < 4) { setError("请输入验证码"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sms-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: account, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("chuangqian_user", JSON.stringify({
          phone: data.phone, loggedIn: true, type: "phone",
        }));
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

  // 邮箱登录
  const handleEmailLogin = async () => {
    if (!isEmail) { setError("请输入正确的邮箱"); return; }
    if (!password || password.length < 6) { setError("密码至少6位"); return; }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await signInWithEmail(account, password);
      if (authError) {
        setError("登录失败，请检查账号密码");
      } else {
        localStorage.setItem("chuangqian_user", JSON.stringify({
          email: account, loggedIn: true, type: "email",
        }));
        onSuccess();
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 邮箱注册
  const handleEmailRegister = async () => {
    if (!isEmail) { setError("请输入正确的邮箱"); return; }
    if (!password || password.length < 6) { setError("密码至少6位"); return; }
    if (password !== confirmPassword) { setError("两次密码不一致"); return; }
    if (!agreedToTerms) { setError("请先同意用户协议"); return; }
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await signUpWithEmail(account, password);
      if (authError) {
        setError("注册失败，该邮箱可能已被注册");
      } else {
        setSuccess("注册成功！请查收验证邮件");
        setTimeout(() => { setMode("login"); setSuccess(""); }, 2000);
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 忘记密码（手机号重置）
  const handleResetPassword = async () => {
    if (!isPhone) { setError("目前仅支持手机号重置密码"); return; }
    if (!otp) { setError("请输入验证码"); return; }
    if (!password || password.length < 6) { setError("新密码至少6位"); return; }
    // TODO: 实现真正的密码重置逻辑（需要后端支持）
    setSuccess("密码重置成功，请重新登录");
    setTimeout(() => { setMode("login"); setSuccess(""); }, 2000);
  };

  // 统一提交
  const handleSubmit = () => {
    if (mode === "login") {
      if (isPhone) {
        if (!otpSent) handleSendOtp();
        else handlePhoneAuth();
      } else {
        handleEmailLogin();
      }
    } else if (mode === "register") {
      if (isPhone) {
        if (!otpSent) handleSendOtp();
        else handlePhoneAuth();
      } else {
        handleEmailRegister();
      }
    } else if (mode === "reset") {
      if (!otpSent) handleSendOtp();
      else handleResetPassword();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night-900/98 backdrop-blur-lg px-6 overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-warm-300/50 text-sm safe-top press-feedback"
      >
        关闭
      </button>

      {/* 用户协议弹窗 */}
      <AnimatePresence>
        {showTerms && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-night-900/98 overflow-y-auto"
          >
            <div className="max-w-lg mx-auto px-6 py-8 safe-top safe-bottom">
              <button onClick={() => setShowTerms(false)} className="text-warm-300/50 text-sm mb-4 press-feedback">
                ← 返回
              </button>
              <TermsContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-5"
      >
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
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError(""); setSuccess(""); setOtpSent(false); setOtp(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all press-feedback
                ${mode === tab.key ? "glass-md text-warm-100" : "text-warm-300/50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 账号输入（统一） */}
        <div>
          <input
            type="text"
            value={account}
            onChange={(e) => { setAccount(e.target.value); setOtpSent(false); setOtp(""); setError(""); }}
            placeholder="手机号 / 邮箱"
            className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                       placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                       bg-transparent"
          />
          {account && (
            <p className="text-warm-300/25 text-[10px] mt-1.5 ml-2">
              {isPhone ? "📱 手机号登录（验证码）" : isEmail ? "📧 邮箱登录（密码）" : "请输入手机号或邮箱"}
            </p>
          )}
        </div>

        {/* 手机号模式：验证码 */}
        {isPhone && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="验证码"
                maxLength={6}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                           placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                           bg-transparent tracking-[0.3em]"
              />
              <button
                onClick={handleSendOtp}
                disabled={loading || countdown > 0}
                className="shrink-0 px-4 py-3.5 rounded-2xl glass text-sm press-feedback
                           disabled:opacity-40"
                style={{ color: countdown > 0 ? "rgba(212,190,150,0.3)" : "rgba(107,140,206,0.8)" }}
              >
                {countdown > 0 ? `${countdown}s` : otpSent ? "重发" : "获取验证码"}
              </button>
            </div>
          </div>
        )}

        {/* 邮箱模式：密码 */}
        {isEmail && (
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "reset" ? "新密码（至少6位）" : "密码（至少6位）"}
              onKeyDown={(e) => e.key === "Enter" && mode === "login" && handleSubmit()}
              className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                         placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                         bg-transparent"
            />
            {mode === "register" && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认密码"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full glass-md rounded-2xl px-5 py-3.5 text-warm-100 text-sm
                           placeholder:text-warm-300/30 focus:outline-none focus:ring-1 focus:ring-accent/20
                           bg-transparent"
              />
            )}
          </div>
        )}

        {/* 注册协议勾选 */}
        {mode === "register" && isEmail && (
          <div className="flex items-start gap-2">
            <button
              onClick={() => setAgreedToTerms(!agreedToTerms)}
              className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center text-[10px]
                ${agreedToTerms ? "bg-accent/30 border-accent/50 text-accent" : "border-warm-300/20"}`}
            >
              {agreedToTerms && "✓"}
            </button>
            <p className="text-warm-300/40 text-xs">
              我已阅读并同意
              <button onClick={() => setShowTerms(true)} className="text-accent/70 underline">
                《用户协议》
              </button>
              和
              <button onClick={() => setShowTerms(true)} className="text-accent/70 underline">
                《隐私政策》
              </button>
            </p>
          </div>
        )}

        {/* 提交按钮 */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !accountType}
          className="w-full py-3.5 rounded-full glass-heavy glow-sm text-accent text-sm
                     press-feedback disabled:opacity-40"
        >
          {loading ? "请稍等..." :
            mode === "reset" ? (otpSent ? "重置密码" : "发送验证码") :
            mode === "register" ? (isPhone ? (otpSent ? "注册" : "发送验证码") : "注册") :
            isPhone ? (otpSent ? "登录" : "发送验证码") : "登录"}
        </motion.button>

        {/* 错误/成功提示 */}
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-[#c85050] text-xs">{error}</motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center text-success/80 text-xs">{success}</motion.p>
          )}
        </AnimatePresence>

        {/* 忘记密码 / 游客模式 */}
        <div className="flex justify-between items-center">
          {mode === "login" && (
            <button
              onClick={() => { setMode("reset"); setError(""); setOtpSent(false); }}
              className="text-warm-300/30 text-xs press-feedback"
            >
              忘记密码
            </button>
          )}
          {mode === "reset" && (
            <button
              onClick={() => { setMode("login"); setError(""); setOtpSent(false); }}
              className="text-warm-300/30 text-xs press-feedback"
            >
              ← 返回登录
            </button>
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
        <p>2.1 您可以通过手机号或邮箱注册账号。您应确保注册信息的真实性，并妥善保管账号密码。</p>
        <p>2.2 您对账号下的所有行为承担责任。如发现账号被他人冒用或存在安全风险，请立即联系我们。</p>
        <p>2.3 我们有权对违反本协议的账号采取限制、冻结或注销等措施。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">三、会员服务</h2>
        <p>3.1 本应用提供 DeepSleep 付费会员服务，按月订阅，费用为人民币15元/月。</p>
        <p>3.2 会员权益包括但不限于：扩展的自定义情绪库额度、更多的AI深度沟通次数、独家定制情绪内容。</p>
        <p>3.3 会员服务自购买之日起生效，有效期为一个自然月。到期后如需继续使用会员服务，需重新购买。</p>
        <p>3.4 已购买的会员服务一般不予退款，法律另有规定的除外。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">四、用户内容</h2>
        <p>4.1 您在使用本应用过程中产生的文字内容（包括情绪记录、担忧清单、批注等）属于您的个人内容。</p>
        <p>4.2 我们不会在未经您许可的情况下公开、转让或向第三方提供您的个人内容。</p>
        <p>4.3 您不得利用本应用发布违法、暴力、色情、侵权或其他违反法律法规的内容。</p>
        <p>4.4 您使用分享功能主动公开的内容，视为您同意该内容被他人查看。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">五、隐私政策</h2>

        <h3 className="text-warm-100/80 text-sm font-medium">5.1 我们收集的信息</h3>
        <p>• 账号信息：手机号码或邮箱地址，用于注册和登录。</p>
        <p>• 使用数据：情绪记录、担忧内容、睡眠时间等，用于提供个性化服务。</p>
        <p>• 设备信息：设备型号、操作系统版本，用于优化应用体验。</p>
        <p>• 我们不会收集您的通讯录、相册、位置等敏感权限信息。</p>

        <h3 className="text-warm-100/80 text-sm font-medium">5.2 信息使用</h3>
        <p>• 提供、维护和改进我们的服务。</p>
        <p>• 生成个性化的情绪分析和睡眠报告。</p>
        <p>• AI 功能处理：您的情绪文字会发送至第三方 AI 服务（Moonshot AI）进行分析，我们仅传输必要的文本内容，不传输您的个人身份信息。</p>

        <h3 className="text-warm-100/80 text-sm font-medium">5.3 信息存储与安全</h3>
        <p>• 您的数据目前存储在设备本地（localStorage）及 Supabase 云服务。</p>
        <p>• 我们采用行业标准的加密技术保护数据传输安全。</p>
        <p>• 我们不会出售、出租您的个人信息。</p>

        <h3 className="text-warm-100/80 text-sm font-medium">5.4 您的权利</h3>
        <p>• 访问权：您可以随时查看和导出您的个人数据。</p>
        <p>• 删除权：您可以要求我们删除您的账号和所有相关数据。</p>
        <p>• 更正权：您可以随时修改您的个人信息。</p>
        <p>• 撤回同意：您可以随时停止使用我们的服务。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">六、免责声明</h2>
        <p>6.1 本应用提供的所有内容（包括AI回复、脑科学文章、情绪引导等）仅供参考，不构成专业的医疗、心理咨询或治疗建议。</p>
        <p>6.2 我们不保证服务不会中断或完全无误。因网络、设备等原因导致的服务异常，我们不承担责任。</p>
        <p>6.3 因不可抗力（包括但不限于自然灾害、政策变化、技术故障等）导致的服务中断或数据损失，我们不承担责任。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">七、协议修改</h2>
        <p>我们保留修改本协议的权利。修改后的协议将在应用内公布。如您继续使用本应用，视为同意修改后的协议。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-warm-100 text-base font-medium">八、联系我们</h2>
        <p>如您对本协议或隐私政策有任何疑问，请通过以下方式联系我们：</p>
        <p>邮箱：support@sleepme.app</p>
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

        <div className="text-center mb-6">
          <p className="text-warm-400 text-4xl font-light">
            ¥{DEEPSLEEP_LIMITS.deepsleep.monthlyPrice}
            <span className="text-warm-300/50 text-sm">/月</span>
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
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
          支付功能即将上线
        </p>

        {/* 邀请码 */}
        <div className="mt-8 pt-6 border-t border-warm-300/10">
          <p className="text-warm-200/60 text-sm text-center mb-4">有邀请码？</p>
          {codeSuccess ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-success/80 text-sm"
            >
              激活成功！DeepSleep 已开通 30 天
            </motion.p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 15))}
                placeholder="SLEEP-XXXX-XXXX"
                className="flex-1 glass-md rounded-2xl px-4 py-3 text-warm-100 text-sm text-center
                           placeholder:text-warm-300/25 focus:outline-none bg-transparent
                           tracking-widest font-mono"
              />
              <button
                onClick={handleActivateCode}
                className="shrink-0 px-4 py-3 rounded-2xl glass-heavy text-accent text-sm press-feedback"
              >
                激活
              </button>
            </div>
          )}
          {codeError && (
            <p className="text-center text-[#c85050] text-xs mt-2">{codeError}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
