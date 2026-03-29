// 情绪卡片系统 — 每张卡片代表一种具体的情绪状态/场景

import type { MoodEmotion } from "./mood-descriptions";
import { getProfileTags } from "./profile";
import { isDeepSleep } from "./supabase";

export interface EmotionCard {
  id: string;
  name: string;           // 卡片标题
  emotion: MoodEmotion;   // 情绪类型
  description?: string;   // 副标题
  icon?: string;          // emoji
  isCustom?: boolean;     // 用户自建/AI生成
  createdAt: string;
}

const CARDS_KEY = "chuangqian_emotion_cards";
const AI_CARD_QUOTA_KEY = "chuangqian_ai_card_week";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ===== 预设模板池 =====

interface CardTemplate {
  name: string;
  emotion: MoodEmotion;
  description?: string;
  icon: string;
  tags: string[]; // 匹配用户 profile tags
}

const UNIVERSAL_TEMPLATES: CardTemplate[] = [
  { name: "睡不着的焦虑", emotion: "anxious", description: "闭上眼脑子却停不下来", icon: "🌀", tags: [] },
  { name: "说不清的难受", emotion: "heavy", description: "就是不舒服，但说不出为什么", icon: "🫧", tags: [] },
  { name: "平静但空洞", emotion: "numb", description: "没什么大事，但也没什么感觉", icon: "🪞", tags: [] },
  { name: "今天还不错", emotion: "warm", description: "难得的轻松时刻", icon: "🌤️", tags: [] },
  { name: "莫名烦躁", emotion: "angry", description: "一点小事就想发火", icon: "🔥", tags: [] },
  { name: "累到没感觉", emotion: "tired", description: "身体在，灵魂已经下班了", icon: "🔋", tags: [] },
  { name: "深夜的孤独", emotion: "melancholy", description: "世界很大，但此刻只有自己", icon: "🌑", tags: [] },
  { name: "想哭的冲动", emotion: "heavy", description: "眼眶热热的，不知道为了什么", icon: "💧", tags: [] },
  { name: "难得的平静", emotion: "calm", description: "终于安静下来了", icon: "🍃", tags: [] },
  { name: "小小的开心", emotion: "alive", description: "今天有一件让你笑的事", icon: "✨", tags: [] },
  { name: "对未来的不安", emotion: "anxious", description: "不知道明天会怎样", icon: "🌫️", tags: [] },
  { name: "被掏空的感觉", emotion: "tired", description: "什么都给出去了，自己什么都没剩", icon: "🕳️", tags: [] },
];

const TAGGED_TEMPLATES: CardTemplate[] = [
  // work/office
  { name: "加班后的空虚", emotion: "tired", description: "做了很多事但好像什么都没做", icon: "💼", tags: ["office", "work"] },
  { name: "周日晚的恐惧", emotion: "anxious", description: "明天又要上班了", icon: "📅", tags: ["office", "work"] },
  { name: "会议后的疲惫", emotion: "tired", description: "说了很多话但没人在听", icon: "🗣️", tags: ["office", "work"] },
  { name: "KPI 压力", emotion: "anxious", description: "数字追着你跑", icon: "📊", tags: ["office", "work"] },
  { name: "通勤路上的麻木", emotion: "numb", description: "每天同样的路，同样的空", icon: "🚇", tags: ["office", "work"] },

  // student/study
  { name: "考试前的焦虑", emotion: "anxious", description: "时间不够了", icon: "📝", tags: ["student", "study"] },
  { name: "论文写不出来", emotion: "anxious", description: "光标闪了一整晚", icon: "💻", tags: ["student", "study"] },
  { name: "室友都睡了只有我", emotion: "melancholy", description: "台灯下的孤独", icon: "💡", tags: ["student", "study"] },
  { name: "和同学比较后", emotion: "heavy", description: "大家都有方向了，我呢", icon: "👥", tags: ["student", "study"] },
  { name: "毕业的迷茫", emotion: "anxious", description: "下一步在哪", icon: "🎓", tags: ["student", "study", "future"] },

  // family
  { name: "和父母通话后", emotion: "melancholy", description: "挂了电话才想起没说想他们", icon: "📱", tags: ["family"] },
  { name: "回家的复杂心情", emotion: "heavy", description: "想回去又害怕回去", icon: "🏠", tags: ["family"] },
  { name: "被期望压着", emotion: "heavy", description: "他们的期望像穿不脱的毛衣", icon: "🧶", tags: ["family", "teen"] },
  { name: "家里的争吵", emotion: "angry", description: "声音隔了很多年还是很清楚", icon: "💢", tags: ["family"] },

  // finance
  { name: "月底看余额", emotion: "anxious", description: "打开银行 app 需要勇气", icon: "💳", tags: ["finance"] },
  { name: "存不下钱的无力", emotion: "heavy", description: "努力了但沙漏倒不过来", icon: "⏳", tags: ["finance"] },

  // emotion/single
  { name: "想念一个人", emotion: "melancholy", description: "手机拿起来又放下", icon: "💭", tags: ["single", "emotion"] },
  { name: "一个人吃饭", emotion: "melancholy", description: "买菜的时候忽然难过", icon: "🍜", tags: ["single", "emotion"] },

  // emotion/in-relationship
  { name: "吵架后的沉默", emotion: "heavy", description: "安静比吵架更难受", icon: "🤐", tags: ["in-relationship", "emotion"] },
  { name: "说不出口的话", emotion: "melancholy", description: "删了又打，打了又删", icon: "✏️", tags: ["in-relationship", "emotion"] },
  { name: "感觉在渐行渐远", emotion: "melancholy", description: "晚安的方式变了", icon: "🌙", tags: ["in-relationship", "emotion"] },

  // health
  { name: "身体在发出信号", emotion: "anxious", description: "不敢忽略但也不敢面对", icon: "🩺", tags: ["health"] },
  { name: "吃了药还是睡不着", emotion: "tired", description: "药管身体，但管不了心", icon: "💊", tags: ["health", "mental-health-aware"] },

  // appearance
  { name: "讨厌镜子里的自己", emotion: "heavy", description: "今天又对自己不满意", icon: "🪞", tags: ["appearance"] },

  // social
  { name: "社交电量耗尽", emotion: "tired", description: "笑了一天，回家什么都不想说", icon: "🔌", tags: ["social"] },
  { name: "朋友越来越少", emotion: "melancholy", description: "不是走散了，是不敢打扰了", icon: "👋", tags: ["social"] },

  // future/identity
  { name: "不知道自己想要什么", emotion: "anxious", description: "所有人都在赶路，只有我在问去哪", icon: "🧭", tags: ["future"] },
  { name: "活成了不喜欢的样子", emotion: "heavy", description: "小时候的自己会失望吗", icon: "🎭", tags: ["identity"] },

  // high-anxiety
  { name: "脑子里的声音太吵", emotion: "anxious", description: "想关掉但找不到开关", icon: "📢", tags: ["high-anxiety"] },
  { name: "反复确认的强迫", emotion: "anxious", description: "门锁、闹钟、再看一遍", icon: "🔒", tags: ["high-anxiety"] },

  // parent
  { name: "孩子睡了终于喘口气", emotion: "tired", description: "一天的第一个属于自己的时刻", icon: "👶", tags: ["parent"] },
  { name: "做妈妈/爸爸好累", emotion: "tired", description: "爱他们但也需要被爱", icon: "🫂", tags: ["parent", "family"] },

  // entrepreneur
  { name: "创业的孤独", emotion: "melancholy", description: "做了决定但没人能商量", icon: "🚀", tags: ["entrepreneur"] },
  { name: "资金链的焦虑", emotion: "anxious", description: "数字背后是所有人的信任", icon: "📉", tags: ["entrepreneur", "finance"] },

  // freelance
  { name: "自律崩塌的一天", emotion: "numb", description: "计划表是空的", icon: "📋", tags: ["freelance"] },
  { name: "收入的不确定", emotion: "anxious", description: "自由的代价是不安全感", icon: "🎲", tags: ["freelance", "finance"] },
];

// ===== CRUD =====

export function getEmotionCards(): EmotionCard[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CARDS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCards(cards: EmotionCard[]): void {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function addEmotionCard(card: Omit<EmotionCard, "id" | "createdAt">): EmotionCard {
  const entry: EmotionCard = {
    ...card,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const cards = getEmotionCards();
  cards.push(entry);
  saveCards(cards);
  return entry;
}

export function updateEmotionCard(id: string, updates: Partial<EmotionCard>): void {
  const cards = getEmotionCards();
  const idx = cards.findIndex(c => c.id === id);
  if (idx !== -1) {
    cards[idx] = { ...cards[idx], ...updates };
    saveCards(cards);
  }
}

export function deleteEmotionCard(id: string): void {
  const cards = getEmotionCards().filter(c => c.id !== id);
  saveCards(cards);
}

// ===== 初始化 =====

export function isCardsInitialized(): boolean {
  return getEmotionCards().length > 0;
}

export function initializeCards(): EmotionCard[] {
  const profileTags = getProfileTags();
  const cards: EmotionCard[] = [];

  // 8 张通用卡
  const universalPicks = UNIVERSAL_TEMPLATES
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  universalPicks.forEach(t => {
    cards.push({
      id: generateId(),
      name: t.name,
      emotion: t.emotion,
      description: t.description,
      icon: t.icon,
      createdAt: new Date().toISOString(),
    });
  });

  // 7 张基于 tags 匹配
  const scored = TAGGED_TEMPLATES.map(t => {
    const matches = t.tags.filter(tag => profileTags.includes(tag)).length;
    return { template: t, score: matches };
  }).filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score + (Math.random() - 0.5) * 0.3);

  const taggedPicks = scored.slice(0, 7).map(s => s.template);

  // 如果匹配不足 7 张，从通用模板补充
  if (taggedPicks.length < 7) {
    const remaining = UNIVERSAL_TEMPLATES
      .filter(t => !universalPicks.includes(t))
      .sort(() => Math.random() - 0.5)
      .slice(0, 7 - taggedPicks.length);
    taggedPicks.push(...remaining.map(t => ({ ...t, tags: [] })));
  }

  taggedPicks.forEach(t => {
    cards.push({
      id: generateId(),
      name: t.name,
      emotion: t.emotion,
      description: t.description,
      icon: t.icon,
      createdAt: new Date().toISOString(),
    });
  });

  saveCards(cards);
  return cards;
}

// ===== AI 卡片限额 =====

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday as start
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export function getAiCardCount(): number {
  if (typeof window === "undefined") return 0;
  const data = localStorage.getItem(AI_CARD_QUOTA_KEY);
  if (!data) return 0;
  const { weekStart, count } = JSON.parse(data);
  if (weekStart !== getWeekStart()) return 0; // New week, reset
  return count;
}

export function canCreateAiCard(): boolean {
  const limit = isDeepSleep() ? 20 : 5;
  return getAiCardCount() < limit;
}

export function getAiCardLimit(): number {
  return isDeepSleep() ? 20 : 5;
}

export function incrementAiCardCount(): void {
  const weekStart = getWeekStart();
  const current = getAiCardCount();
  localStorage.setItem(AI_CARD_QUOTA_KEY, JSON.stringify({
    weekStart,
    count: current + 1,
  }));
}

// 情绪对应的 emoji 默认值
export const EMOTION_ICONS: Record<string, string> = {
  heavy: "🫧",
  anxious: "🌀",
  tired: "🔋",
  numb: "🪞",
  melancholy: "🌑",
  calm: "🍃",
  hopeful: "🌤️",
  warm: "☀️",
  angry: "🔥",
  alive: "✨",
};
