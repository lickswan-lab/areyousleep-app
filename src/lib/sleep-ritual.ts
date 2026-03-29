// 自定义睡眠仪式 — 用户可编排多步骤睡前流程

import { isDeepSleep } from "./supabase";

export type RitualStepType =
  | "breath-478"
  | "breath-quick"
  | "body-scan"
  | "meditation"
  | "white-noise"
  | "journaling"
  | "emotion-checkin"
  | "muscle-relax"
  | "sleep-story"
  | "free-time"
  | "goodnight";

export interface RitualStep {
  id: string;
  type: RitualStepType;
  duration?: number;
  label?: string;
}

export interface SleepRitual {
  id: string;
  name: string;
  steps: RitualStep[];
  createdAt: string;
  updatedAt: string;
}

const RITUALS_KEY = "chuangqian_sleep_rituals";
const ACTIVE_RITUAL_KEY = "chuangqian_active_ritual";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface StepTemplate {
  type: RitualStepType;
  label: string;
  emoji: string;
  defaultDuration?: number;
  fixedDuration?: boolean;
  available: boolean;
  description: string;
}

export const STEP_TEMPLATES: StepTemplate[] = [
  { type: "emotion-checkin", label: "情绪签到", emoji: "📖", description: "选择今天的情绪卡片", available: true },
  { type: "journaling", label: "写作", emoji: "✏️", description: "写下脑中的想法", available: true },
  { type: "breath-478", label: "4-7-8 呼吸", emoji: "🌬️", defaultDuration: 7, fixedDuration: true, description: "7分钟深度放松", available: true },
  { type: "breath-quick", label: "快速呼吸", emoji: "⚡", defaultDuration: 3, fixedDuration: true, description: "3分钟快速平静", available: true },
  { type: "white-noise", label: "白噪音", emoji: "🎵", defaultDuration: 15, description: "自然音效伴眠", available: true },
  { type: "body-scan", label: "身体扫描", emoji: "🧘", defaultDuration: 10, fixedDuration: true, description: "10分钟渐进放松", available: false },
  { type: "meditation", label: "潮汐冥想", emoji: "🌊", defaultDuration: 15, fixedDuration: true, description: "15分钟海浪引导", available: false },
  { type: "muscle-relax", label: "肌肉放松", emoji: "💆", defaultDuration: 8, fixedDuration: true, description: "8分钟渐进松弛", available: false },
  { type: "sleep-story", label: "睡前故事", emoji: "🌙", defaultDuration: 20, fixedDuration: true, description: "温柔朗读助眠", available: false },
  { type: "free-time", label: "自由时间", emoji: "⏳", defaultDuration: 5, description: "自定义等待时间", available: true },
  { type: "goodnight", label: "晚安", emoji: "😴", description: "记录睡眠，生成晚安卡", available: true },
];

export function getStepTemplate(type: RitualStepType): StepTemplate {
  return STEP_TEMPLATES.find(t => t.type === type) || STEP_TEMPLATES[0];
}

export function getSleepRituals(): SleepRitual[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(RITUALS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveRituals(rituals: SleepRitual[]): void {
  localStorage.setItem(RITUALS_KEY, JSON.stringify(rituals));
}

export function getRitualLimit(): number {
  return isDeepSleep() ? 10 : 2;
}

export function canCreateRitual(): boolean {
  return getSleepRituals().length < getRitualLimit();
}

export function getNextRitualName(): string {
  return `睡眠仪式${getSleepRituals().length + 1}`;
}

export function createRitual(name?: string, steps?: RitualStep[]): SleepRitual {
  const ritual: SleepRitual = {
    id: generateId(),
    name: name || getNextRitualName(),
    steps: steps || [
      { id: generateId(), type: "emotion-checkin" },
      { id: generateId(), type: "breath-478" },
      { id: generateId(), type: "goodnight" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const rituals = getSleepRituals();
  rituals.push(ritual);
  saveRituals(rituals);
  return ritual;
}

export function updateRitual(id: string, updates: Partial<SleepRitual>): void {
  const rituals = getSleepRituals();
  const idx = rituals.findIndex(r => r.id === id);
  if (idx !== -1) {
    rituals[idx] = { ...rituals[idx], ...updates, updatedAt: new Date().toISOString() };
    saveRituals(rituals);
  }
}

export function deleteRitual(id: string): void {
  saveRituals(getSleepRituals().filter(r => r.id !== id));
  if (getActiveRitualId() === id) localStorage.removeItem(ACTIVE_RITUAL_KEY);
}

export function getActiveRitualId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_RITUAL_KEY);
}

export function setActiveRitual(id: string): void {
  localStorage.setItem(ACTIVE_RITUAL_KEY, id);
}

export function getActiveRitual(): SleepRitual | null {
  const id = getActiveRitualId();
  if (!id) return null;
  return getSleepRituals().find(r => r.id === id) || null;
}

export function addStepToRitual(ritualId: string, type: RitualStepType): void {
  const rituals = getSleepRituals();
  const ritual = rituals.find(r => r.id === ritualId);
  if (!ritual) return;
  const template = getStepTemplate(type);
  ritual.steps.push({ id: generateId(), type, duration: template.defaultDuration });
  ritual.updatedAt = new Date().toISOString();
  saveRituals(rituals);
}

export function removeStepFromRitual(ritualId: string, stepId: string): void {
  const rituals = getSleepRituals();
  const ritual = rituals.find(r => r.id === ritualId);
  if (!ritual) return;
  ritual.steps = ritual.steps.filter(s => s.id !== stepId);
  ritual.updatedAt = new Date().toISOString();
  saveRituals(rituals);
}
