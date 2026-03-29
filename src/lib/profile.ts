// 用户画像数据 — 初始化问卷收集，用于个性化情绪推荐

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";
export type AgeRange = "under-18" | "18-24" | "25-34" | "35-44" | "45+";
export type Relationship = "single" | "dating" | "married" | "divorced" | "prefer-not-to-say";
export type Occupation = "highschool" | "college" | "worker" | "homemaker" | "entrepreneur" | "freelance" | "other";
export type MentalState = "occasional-anxiety" | "frequent-anxiety" | "suspected-condition" | "good" | "unsure";
export type Concern = "family" | "finance" | "appearance" | "emotion" | "work" | "study" | "health" | "social" | "future" | "identity";

export interface UserProfile {
  gender?: Gender;
  ageRange?: AgeRange;
  relationship?: Relationship;
  occupation?: Occupation;
  stressLevel?: number; // 1-5
  mentalState?: MentalState;
  seekingHelp?: boolean;
  concerns?: Concern[];
  completedAt?: string; // ISO timestamp
}

const PROFILE_KEY = "chuangqian_profile";

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : {};
}

export function updateUserProfile(updates: Partial<UserProfile>): void {
  const current = getUserProfile();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...current, ...updates }));
}

export function isProfileComplete(): boolean {
  const profile = getUserProfile();
  return !!profile.completedAt;
}

// 将用户画像转为 tag 数组，用于情绪描述匹配
export function getProfileTags(): string[] {
  const profile = getUserProfile();
  const tags: string[] = [];

  // 年龄段
  if (profile.ageRange === "under-18") tags.push("teen");
  else if (profile.ageRange === "18-24") tags.push("young-adult");
  else if (profile.ageRange === "25-34") tags.push("adult");
  else if (profile.ageRange === "35-44") tags.push("mid-life");
  else if (profile.ageRange === "45+") tags.push("mature");

  // 职业
  if (profile.occupation === "highschool" || profile.occupation === "college") tags.push("student");
  if (profile.occupation === "worker") tags.push("office");
  if (profile.occupation === "homemaker") tags.push("parent");
  if (profile.occupation === "entrepreneur") tags.push("entrepreneur");
  if (profile.occupation === "freelance") tags.push("freelance");

  // 情感状态
  if (profile.relationship === "single") tags.push("single");
  else if (profile.relationship === "dating" || profile.relationship === "married") tags.push("in-relationship");
  else if (profile.relationship === "divorced") tags.push("divorced");

  // 精神状态
  if (profile.mentalState === "frequent-anxiety" || profile.mentalState === "suspected-condition") {
    tags.push("high-anxiety");
  }
  if (profile.mentalState === "suspected-condition") {
    tags.push("mental-health-aware");
  }

  // 压力等级
  if (profile.stressLevel && profile.stressLevel >= 4) tags.push("high-stress");

  // 关注方面 — 直接作为 tags
  if (profile.concerns) {
    tags.push(...profile.concerns);
  }

  return tags;
}

// 中文标签映射
export const GENDER_LABELS: Record<Gender, string> = {
  male: "男", female: "女", other: "其他", "prefer-not-to-say": "不想说",
};

export const AGE_LABELS: Record<AgeRange, string> = {
  "under-18": "18岁以下", "18-24": "18-24岁", "25-34": "25-34岁", "35-44": "35-44岁", "45+": "45岁以上",
};

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  single: "单身", dating: "恋爱中", married: "已婚", divorced: "离异", "prefer-not-to-say": "不想说",
};

export const OCCUPATION_LABELS: Record<Occupation, string> = {
  highschool: "中学生", college: "大学生", worker: "打工人", homemaker: "全职父母",
  entrepreneur: "创业/投资", freelance: "自由职业", other: "其他",
};

export const MENTAL_STATE_LABELS: Record<MentalState, string> = {
  good: "心理良好", unsure: "不确定",
  "occasional-anxiety": "偶尔焦虑", "frequent-anxiety": "经常焦虑",
  "suspected-condition": "疑似精神疾病",
};

export const CONCERN_LABELS: Record<Concern, string> = {
  family: "家庭", finance: "经济", appearance: "外貌", emotion: "情感",
  work: "工作", study: "学习", health: "健康", social: "社交",
  future: "未来", identity: "自我认同",
};

// Occupation 到 UserPersona 映射（向后兼容）
export function occupationToPersona(occupation?: Occupation): string {
  if (!occupation || occupation === "other") return "general";
  return occupation;
}
