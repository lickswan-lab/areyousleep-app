// 极简本地状态管理（MVP 阶段不需要 Redux/Zustand）
// 所有数据先存 localStorage，Supabase 接入后无缝迁移

export type MindState = "work" | "emotion" | "unsure" | "sleep";

export interface Worry {
  id: string;
  content: string;
  category?: string;
  aiResponse?: string;
  createdAt: string;
  remindAt?: string;
  resolved?: boolean;
  neverHappened?: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime?: string;
  sleepOnsetMinutes?: number;
  wakeTime?: string;
  worryCount: number;
  guidanceCompleted: boolean;
}

const WORRIES_KEY = "chuangqian_worries";
const SLEEP_LOGS_KEY = "chuangqian_sleep_logs";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// 担忧清单操作
export function getWorries(): Worry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(WORRIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTonightWorries(): Worry[] {
  const all = getWorries();
  const today = new Date().toDateString();
  return all.filter((w) => new Date(w.createdAt).toDateString() === today);
}

export function getUnresolvedWorries(): Worry[] {
  const all = getWorries();
  return all.filter((w) => !w.resolved && !w.neverHappened);
}

export function addWorry(content: string): Worry {
  const worry: Worry = {
    id: generateId(),
    content,
    createdAt: new Date().toISOString(),
  };
  const worries = getWorries();
  worries.unshift(worry);
  localStorage.setItem(WORRIES_KEY, JSON.stringify(worries));
  return worry;
}

export function updateWorry(id: string, updates: Partial<Worry>): void {
  const worries = getWorries();
  const index = worries.findIndex((w) => w.id === id);
  if (index !== -1) {
    worries[index] = { ...worries[index], ...updates };
    localStorage.setItem(WORRIES_KEY, JSON.stringify(worries));
  }
}

export function resolveWorry(
  id: string,
  outcome: "resolved" | "neverHappened" | "stillWorried"
): void {
  if (outcome === "stillWorried") return;
  updateWorry(id, {
    resolved: outcome === "resolved",
    neverHappened: outcome === "neverHappened",
  });
}

// 担忧考古统计
export function getWorryArchaeology() {
  const all = getWorries();
  const total = all.length;
  const neverHappened = all.filter((w) => w.neverHappened).length;
  const resolved = all.filter((w) => w.resolved).length;
  const reviewed = neverHappened + resolved;
  const neverHappenedRate = reviewed > 0 ? neverHappened / reviewed : 0;

  // 按类别统计
  const categories: Record<string, number> = {};
  all.forEach((w) => {
    const cat = w.category || "other";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  return { total, neverHappened, resolved, reviewed, neverHappenedRate, categories };
}

// 睡眠日记
export function getSleepLogs(): SleepLog[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SLEEP_LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSleepLog(log: Omit<SleepLog, "id">): SleepLog {
  const entry: SleepLog = { ...log, id: generateId() };
  const logs = getSleepLogs();
  logs.unshift(entry);
  localStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(logs));
  return entry;
}

export function getRecentSleepLogs(days: number): SleepLog[] {
  const logs = getSleepLogs();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return logs.filter((log) => new Date(log.date) >= cutoff);
}

export function getSleepTrend(): {
  avgOnsetMinutes: number;
  goodNights: number;
  totalNights: number;
  improving: boolean;
  message: string;
} {
  const logs = getRecentSleepLogs(7);
  const withOnset = logs.filter(
    (l) => l.sleepOnsetMinutes !== undefined && l.sleepOnsetMinutes !== null
  );
  const totalNights = withOnset.length;

  if (totalNights === 0) {
    return {
      avgOnsetMinutes: 0,
      goodNights: 0,
      totalNights: 0,
      improving: false,
      message: "开始记录你的睡眠吧，每天只需30秒",
    };
  }

  const avgOnsetMinutes =
    withOnset.reduce((sum, l) => sum + (l.sleepOnsetMinutes ?? 0), 0) /
    totalNights;
  const goodNights = withOnset.filter(
    (l) => (l.sleepOnsetMinutes ?? 999) <= 30
  ).length;

  // Check if recent half is better than older half
  const sorted = [...withOnset].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const olderHalf = sorted.slice(0, mid);
  const newerHalf = sorted.slice(mid);
  const olderAvg =
    olderHalf.length > 0
      ? olderHalf.reduce((s, l) => s + (l.sleepOnsetMinutes ?? 0), 0) /
        olderHalf.length
      : Infinity;
  const newerAvg =
    newerHalf.length > 0
      ? newerHalf.reduce((s, l) => s + (l.sleepOnsetMinutes ?? 0), 0) /
        newerHalf.length
      : Infinity;
  const improving = newerAvg < olderAvg;

  // Positive framing messages
  let message: string;
  if (goodNights >= totalNights * 0.7) {
    message = `这周有${goodNights}天在30分钟内睡着了，状态不错哦`;
  } else if (improving) {
    message = `入睡时间在缩短，在进步呢`;
  } else if (goodNights > 0) {
    message = `这周有${goodNights}天在30分钟内睡着了，在进步呢`;
  } else {
    message = `坚持记录就是好的开始，慢慢来`;
  }

  return { avgOnsetMinutes, goodNights, totalNights, improving, message };
}

// 周报统计
export interface WeeklyStats {
  weekWorries: number;
  neverHappenedRate: number;
  dailyCounts: number[];
  activeDays: number;
  dateRange: string;
}

export function getWeeklyStats(): WeeklyStats {
  const now = new Date();
  // 计算本周一（周一为起始）
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const allWorries = getWorries();
  const weekWorries = allWorries.filter((w) => {
    const d = new Date(w.createdAt);
    return d >= monday && d <= sunday;
  });

  // 每日计数 [周一..周日]
  const dailyCounts = Array(7).fill(0) as number[];
  weekWorries.forEach((w) => {
    const d = new Date(w.createdAt);
    const day = d.getDay(); // 0=Sun
    const idx = day === 0 ? 6 : day - 1;
    dailyCounts[idx]++;
  });

  // 已回顾的担忧中「没发生」的比例
  const reviewed = weekWorries.filter((w) => w.resolved || w.neverHappened);
  const neverHappened = weekWorries.filter((w) => w.neverHappened).length;
  const neverHappenedRate =
    reviewed.length > 0 ? Math.round((neverHappened / reviewed.length) * 100) : 0;

  // 活跃天数：历史中有记录担忧的不同日期数
  const allDates = new Set(
    allWorries.map((w) => new Date(w.createdAt).toDateString())
  );
  const activeDays = allDates.size;

  // 日期范围文案
  const fmtMonth = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  const dateRange = `${fmtMonth(monday)} - ${fmtMonth(sunday)}`;

  return {
    weekWorries: weekWorries.length,
    neverHappenedRate,
    dailyCounts,
    activeDays,
    dateRange,
  };
}

// ===== 心情签到 =====
export interface MoodEntry {
  id: string;
  mood: number; // 1-5
  emotion?: string;
  highlight?: string;
  annotation?: string; // 后来的批注
  date: string;
  createdAt: string;
}

export function updateMoodEntry(id: string, updates: Partial<MoodEntry>): void {
  const entries = getMoodEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...updates };
    localStorage.setItem(MOODS_KEY, JSON.stringify(entries));
  }
}

const MOODS_KEY = "chuangqian_moods";

export function getMoodEntries(): MoodEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MOODS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTodayMood(): MoodEntry | null {
  const today = new Date().toDateString();
  return getMoodEntries().find((m) => new Date(m.createdAt).toDateString() === today) || null;
}

export function addMoodEntry(mood: number, highlight?: string, emotion?: string): MoodEntry {
  const entry: MoodEntry = {
    id: generateId(),
    mood,
    emotion,
    highlight: highlight?.trim() || undefined,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  const entries = getMoodEntries();
  entries.unshift(entry);
  localStorage.setItem(MOODS_KEY, JSON.stringify(entries));
  return entry;
}

// ===== 情感描述已见追踪 =====
const SEEN_MOODS_KEY = "chuangqian_seen_moods";
const MOOD_HISTORY_KEY = "chuangqian_mood_history";

export function getSeenMoodIds(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SEEN_MOODS_KEY);
  return data ? JSON.parse(data) : [];
}

export function markMoodSeen(ids: string[]): void {
  const seen = getSeenMoodIds();
  const updated = [...new Set([...seen, ...ids])];
  localStorage.setItem(SEEN_MOODS_KEY, JSON.stringify(updated));
}

export function getMoodHistory(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MOOD_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function addMoodHistory(id: string): void {
  const history = getMoodHistory();
  history.unshift(id);
  localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function getUsageStreak(): number {
  // Count consecutive days with any activity (mood or worry)
  const dates = new Set<string>();
  getWorries().forEach((w) => dates.add(new Date(w.createdAt).toDateString()));
  getMoodEntries().forEach((m) => dates.add(new Date(m.createdAt).toDateString()));

  if (dates.size === 0) return 0;

  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (dates.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ===== 心情总结 =====

const EMOTION_LABELS: Record<string, string> = {
  heavy: "沉重", anxious: "焦虑", tired: "疲惫", numb: "麻木",
  melancholy: "忧郁", calm: "平静", hopeful: "希望", warm: "温暖",
  angry: "愤怒", alive: "生机",
};

function computeEmotionDistribution(entries: MoodEntry[]): Record<string, number> {
  const dist: Record<string, number> = {};
  entries.forEach((e) => {
    const em = e.emotion || "calm";
    dist[em] = (dist[em] || 0) + 1;
  });
  return dist;
}

function getDominantEmotion(entries: MoodEntry[]): string {
  const dist = computeEmotionDistribution(entries);
  return Object.entries(dist).sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";
}

export function getEmotionLabel(emotion: string): string {
  return EMOTION_LABELS[emotion] || emotion;
}

export function getMoodsByDateRange(start: Date, end: Date): MoodEntry[] {
  return getMoodEntries().filter((m) => {
    const d = new Date(m.createdAt);
    return d >= start && d <= end;
  });
}

export interface MoodSummary {
  entries: MoodEntry[];
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  avgMood: number;
  activeDays: number;
  label: string;
}

export function getWeekMoodSummary(): MoodSummary {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const entries = getMoodsByDateRange(monday, sunday);
  const activeDays = new Set(entries.map((e) => e.date)).size;
  const avgMood = entries.length > 0
    ? entries.reduce((s, e) => s + e.mood, 0) / entries.length
    : 0;
  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;

  return {
    entries,
    dominantEmotion: getDominantEmotion(entries),
    emotionDistribution: computeEmotionDistribution(entries),
    avgMood: Math.round(avgMood * 10) / 10,
    activeDays,
    label: `${fmt(monday)} - ${fmt(sunday)}`,
  };
}

export function getMonthMoodSummary(month?: number): MoodSummary & { moodByDay: (string | null)[] } {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = now.getFullYear();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  const daysInMonth = end.getDate();

  const entries = getMoodsByDateRange(start, end);
  const activeDays = new Set(entries.map((e) => e.date)).size;
  const avgMood = entries.length > 0
    ? entries.reduce((s, e) => s + e.mood, 0) / entries.length
    : 0;

  // 每天的主要情绪
  const moodByDay: (string | null)[] = Array(daysInMonth).fill(null);
  entries.forEach((e) => {
    const day = new Date(e.createdAt).getDate() - 1;
    if (day >= 0 && day < daysInMonth) {
      moodByDay[day] = e.emotion || "calm";
    }
  });

  return {
    entries,
    dominantEmotion: getDominantEmotion(entries),
    emotionDistribution: computeEmotionDistribution(entries),
    avgMood: Math.round(avgMood * 10) / 10,
    activeDays,
    label: `${m + 1}月`,
    moodByDay,
  };
}

export function getYearMoodSummary(): {
  monthSummaries: { month: number; dominantEmotion: string; avgMood: number; count: number }[];
  totalDays: number;
  longestStreak: number;
  dominantEmotion: string;
  label: string;
} {
  const now = new Date();
  const y = now.getFullYear();
  const allEntries = getMoodEntries().filter((e) => new Date(e.createdAt).getFullYear() === y);

  const monthSummaries = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = allEntries.filter((e) => new Date(e.createdAt).getMonth() === i);
    return {
      month: i,
      dominantEmotion: getDominantEmotion(monthEntries),
      avgMood: monthEntries.length > 0
        ? Math.round((monthEntries.reduce((s, e) => s + e.mood, 0) / monthEntries.length) * 10) / 10
        : 0,
      count: monthEntries.length,
    };
  });

  const totalDays = new Set(allEntries.map((e) => e.date)).size;

  // 最长连续天数
  const dates = new Set(allEntries.map((e) => e.date));
  let longest = 0, current = 0;
  const startDate = new Date(y, 0, 1);
  for (let i = 0; i < 366; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d > now) break;
    if (dates.has(d.toISOString().slice(0, 10))) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return {
    monthSummaries,
    totalDays,
    longestStreak: longest,
    dominantEmotion: getDominantEmotion(allEntries),
    label: `${y}`,
  };
}

// ===== 用户设置 =====
const SETTINGS_KEY = "chuangqian_settings";

export type UserPersona = "highschool" | "college" | "worker" | "homemaker" | "entrepreneur" | "freelance" | "general";

export const PERSONA_LABELS: Record<UserPersona, string> = {
  highschool: "中学生",
  college: "大学生",
  worker: "打工人",
  homemaker: "全职父母",
  entrepreneur: "创业/投资者",
  freelance: "自由职业/退休",
  general: "不想选",
};

export interface UserSettings {
  nickname?: string;
  persona?: UserPersona;
  sleepStartHour: number;
  sleepEndHour: number;
  customMoods: string[];
  favoriteMoods: string[];  // 收藏的情绪描述ID
  refreshCount: number;     // 连续刷新计数（用于触发自定义提示）
}

const DEFAULT_SETTINGS: UserSettings = {
  sleepStartHour: 20,
  sleepEndHour: 6,
  customMoods: [],
  favoriteMoods: [],
  refreshCount: 0,
};

export function toggleFavoriteMood(id: string): void {
  const settings = getUserSettings();
  const favs = settings.favoriteMoods || [];
  if (favs.includes(id)) {
    updateUserSettings({ favoriteMoods: favs.filter((f) => f !== id) });
  } else {
    updateUserSettings({ favoriteMoods: [...favs, id] });
  }
}

export function isMoodFavorited(id: string): boolean {
  return (getUserSettings().favoriteMoods || []).includes(id);
}

export function incrementRefreshCount(): number {
  const settings = getUserSettings();
  const count = (settings.refreshCount || 0) + 1;
  updateUserSettings({ refreshCount: count });
  return count;
}

export function resetRefreshCount(): void {
  updateUserSettings({ refreshCount: 0 });
}

export function getUserSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export function updateUserSettings(updates: Partial<UserSettings>): void {
  const current = getUserSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
}

export function isNightTime(): boolean {
  const { sleepStartHour, sleepEndHour } = getUserSettings();
  const hour = new Date().getHours();
  if (sleepStartHour > sleepEndHour) {
    return hour >= sleepStartHour || hour < sleepEndHour;
  }
  return hour >= sleepStartHour && hour < sleepEndHour;
}
