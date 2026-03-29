import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = supabaseUrl !== "https://placeholder.supabase.co";

// ===== 认证 =====

export async function signUpWithPhone(phone: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    phone,
    password,
  });
  return { data, error };
}

export async function signInWithPhone(phone: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function resetPassword(phone: string, newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
  // 清理本地登录状态
  if (typeof window !== "undefined") {
    localStorage.removeItem("chuangqian_user");
  }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// 检查是否已登录（同时检查 Supabase session 和 localStorage）
export async function isLoggedIn(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  // 先检查 localStorage（快速）
  const localUser = localStorage.getItem("chuangqian_user");
  if (!localUser) return false;
  // 再验证 Supabase session（如果配置了）
  if (isSupabaseConfigured) {
    const session = await getSession();
    return !!session;
  }
  return true;
}

// ===== 用户档案同步 =====

export async function syncProfileToSupabase(profileData: Record<string, unknown>) {
  if (!isSupabaseConfigured) return;
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...profileData, updated_at: new Date().toISOString() });

  if (error) console.error("Profile sync error:", error);
}

export async function fetchProfileFromSupabase() {
  if (!isSupabaseConfigured) return null;
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data;
}

// ===== 数据同步工具 =====

export async function syncDataToSupabase(table: string, records: Record<string, unknown>[]) {
  if (!isSupabaseConfigured) return;
  const user = await getUser();
  if (!user) return;

  const withUserId = records.map(r => ({ ...r, user_id: user.id }));
  const { error } = await supabase.from(table).upsert(withUserId);
  if (error) console.error(`Sync ${table} error:`, error);
}

export async function fetchDataFromSupabase(table: string) {
  if (!isSupabaseConfigured) return [];
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

// ===== 深夜广场 =====

export async function postToNightSquare(content: string, emotion?: string) {
  if (!isSupabaseConfigured) return null;
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("night_square")
    .insert({ user_id: user.id, content, emotion })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function getNightSquarePosts(limit = 20) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("night_square")
    .select("id, content, emotion, stars, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export async function starNightSquarePost(postId: string) {
  if (!isSupabaseConfigured) return;

  await supabase.rpc("increment_stars", { post_id: postId });
}

// ===== DeepSleep 会员 =====

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

// AI 聊天次数限制
export function getAiChatCount(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem("chuangqian_ai_chat_today");
  if (!data) return 0;
  try {
    const { date, count } = JSON.parse(data);
    if (date === new Date().toDateString()) return count;
    return 0;
  } catch { return 0; }
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

export function getCustomMoodCountToday(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem("chuangqian_custom_mood_today");
  if (!data) return 0;
  try {
    const { date, count } = JSON.parse(data);
    if (date === new Date().toDateString()) return count;
    return 0;
  } catch { return 0; }
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
