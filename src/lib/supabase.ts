import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = supabaseUrl !== "https://placeholder.supabase.co";

// ===== 认证 =====

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  return { data, error };
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ===== DeepSleep 会员 =====

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  nickname?: string;
  persona?: string;
  is_deepsleep: boolean;
  deepsleep_expires_at?: string;
  custom_mood_count_today: number;
  ai_chat_count_today: number;
  created_at: string;
}

export const DEEPSLEEP_LIMITS = {
  free: {
    customMoodsPerDay: 2,
    aiChatPerSession: 5,
    label: "免费版",
  },
  deepsleep: {
    customMoodsPerDay: 10,
    aiChatPerSession: 20,
    monthlyPrice: 15,
    label: "DeepSleep",
  },
};

// 检查是否为 DeepSleep 会员（客户端缓存版）
export function isDeepSleep(): boolean {
  if (typeof window === "undefined") return false;
  const data = localStorage.getItem("chuangqian_deepsleep");
  if (!data) return false;
  try {
    const { expiresAt } = JSON.parse(data);
    return expiresAt && new Date(expiresAt) > new Date();
  } catch {
    return false;
  }
}

// 获取当日 AI 聊天次数
export function getAiChatCount(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem("chuangqian_ai_chat_today");
  if (!data) return 0;
  try {
    const { date, count } = JSON.parse(data);
    if (date === new Date().toDateString()) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function incrementAiChatCount(): number {
  const today = new Date().toDateString();
  const current = getAiChatCount();
  const newCount = current + 1;
  localStorage.setItem("chuangqian_ai_chat_today", JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export function getAiChatLimit(): number {
  return isDeepSleep() ? DEEPSLEEP_LIMITS.deepsleep.aiChatPerSession : DEEPSLEEP_LIMITS.free.aiChatPerSession;
}

export function canAiChat(): boolean {
  return getAiChatCount() < getAiChatLimit();
}

// 获取当日自定义情绪条数
export function getCustomMoodCountToday(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem("chuangqian_custom_mood_today");
  if (!data) return 0;
  try {
    const { date, count } = JSON.parse(data);
    if (date === new Date().toDateString()) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function incrementCustomMoodCount(): number {
  const today = new Date().toDateString();
  const current = getCustomMoodCountToday();
  const newCount = current + 1;
  localStorage.setItem("chuangqian_custom_mood_today", JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export function getCustomMoodLimit(): number {
  return isDeepSleep() ? DEEPSLEEP_LIMITS.deepsleep.customMoodsPerDay : DEEPSLEEP_LIMITS.free.customMoodsPerDay;
}

export function canAddCustomMood(): boolean {
  return getCustomMoodCountToday() < getCustomMoodLimit();
}
