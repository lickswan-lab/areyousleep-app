// 白天情绪状态库 — 与夜晚完全不同
// 白天的情绪更多是：工作中的状态、社交后的感受、日常碎片情绪
// 不像夜晚那么沉重内省，更偏向「此刻的状态快照」

import type { MoodStyle, MoodEmotion } from "./mood-descriptions";

export interface DayMoodDescription {
  id: string;
  text: string;
  sub?: string;
  style: MoodStyle;
  emotion: MoodEmotion;
  moodValue: number;
}

export const DAY_MOOD_DESCRIPTIONS: DayMoodDescription[] = [
  // ===== 工作/学习状态 =====
  { id: "dd01", text: "开会开到脑子糊了", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "dd02", text: "摸了一上午鱼，有点心虚", style: "direct", emotion: "numb", moodValue: 3 },
  { id: "dd03", text: "被甲方改了第八版", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "dd04", text: "终于提交了！", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "dd05", text: "下午三点的困意准时到达", style: "scene", emotion: "tired", moodValue: 3 },
  { id: "dd06", text: "Excel公式跑通的那一刻", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "dd07", text: "还有三件事没做完就不想动了", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "dd08", text: "deadline在催我但我在刷手机", style: "direct", emotion: "anxious", moodValue: 2 },
  { id: "dd09", text: "今天效率意外地高", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "dd10", text: "午休没睡着反而更困了", style: "direct", emotion: "tired", moodValue: 2 },

  // ===== 社交/人际 =====
  { id: "dd11", text: "刚和人吵了一架在气头上", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "dd12", text: "被夸了，假装淡定但心里偷笑", style: "scene", emotion: "warm", moodValue: 5 },
  { id: "dd13", text: "尬聊了十分钟终于找到话题了", style: "scene", emotion: "calm", moodValue: 3 },
  { id: "dd14", text: "朋友取消了约会有点失落", style: "direct", emotion: "melancholy", moodValue: 2 },
  { id: "dd15", text: "群消息99+但没一条想回", style: "direct", emotion: "numb", moodValue: 3 },
  { id: "dd16", text: "和好朋友煲了个电话粥", style: "direct", emotion: "warm", moodValue: 5 },
  { id: "dd17", text: "在社交场合演了一天的外向", style: "scene", emotion: "tired", moodValue: 2 },
  { id: "dd18", text: "收到了意想不到的关心", style: "direct", emotion: "warm", moodValue: 5 },

  // ===== 日常碎片 =====
  { id: "dd19", text: "咖啡续了第三杯", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "dd20", text: "午饭吃到了好吃的", style: "direct", emotion: "warm", moodValue: 4 },
  { id: "dd21", text: "阳光刚好照到桌上", style: "scene", emotion: "hopeful", moodValue: 4 },
  { id: "dd22", text: "外卖又送错了", style: "direct", emotion: "angry", moodValue: 2 },
  { id: "dd23", text: "听到一首很对味的歌", style: "direct", emotion: "calm", moodValue: 4 },
  { id: "dd24", text: "发呆了不知道多久", style: "direct", emotion: "numb", moodValue: 3 },
  { id: "dd25", text: "走在路上突然笑了", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "dd26", text: "等一杯奶茶等了半小时", style: "scene", emotion: "numb", moodValue: 3 },

  // ===== 内心独白 =====
  { id: "dd27", text: "今天过得像按了快进", style: "metaphor", emotion: "tired", moodValue: 3 },
  { id: "dd28", text: "像一台还没关机的电脑", sub: "后台程序在慢慢跑", style: "metaphor", emotion: "anxious", moodValue: 2 },
  { id: "dd29", text: "像午后的一杯热茶", sub: "温温的刚刚好", style: "metaphor", emotion: "calm", moodValue: 4 },
  { id: "dd30", text: "像窗外的那片云", sub: "飘着不想动", style: "metaphor", emotion: "numb", moodValue: 3 },
  { id: "dd31", text: "像充到80%的手机", sub: "能用但没满", style: "metaphor", emotion: "calm", moodValue: 3 },
  { id: "dd32", text: "像春天的风吹过来了", style: "metaphor", emotion: "hopeful", moodValue: 4 },

  // ===== 自问型 =====
  { id: "dd33", text: "今天做了什么有意义的事吗？", style: "question", emotion: "melancholy", moodValue: 3 },
  { id: "dd34", text: "为什么每天都这么快？", style: "question", emotion: "anxious", moodValue: 3 },
  { id: "dd35", text: "如果现在可以做任何事呢？", style: "question", emotion: "hopeful", moodValue: 4 },
  { id: "dd36", text: "中午吃什么是今天最大的难题？", style: "question", emotion: "calm", moodValue: 4 },
  { id: "dd37", text: "如果今天可以重新开始？", style: "question", emotion: "melancholy", moodValue: 2 },

  // ===== 文学/灵感型 =====
  { id: "dd38", text: "生活是一袭华美的袍", sub: "上面爬满了虱子", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "dd39", text: "人生就是不断放下", sub: "但遗憾的是没有好好道别", style: "literary", emotion: "melancholy", moodValue: 2 },
  { id: "dd40", text: "今日宜放过自己", style: "literary", emotion: "calm", moodValue: 4 },
  { id: "dd41", text: "活在当下这四个字", sub: "说起来容易做起来难", style: "literary", emotion: "calm", moodValue: 3 },
  { id: "dd42", text: "万物皆有裂痕", sub: "那是光照进来的地方", style: "literary", emotion: "hopeful", moodValue: 4 },
  { id: "dd43", text: "认真生活的人不会输", style: "literary", emotion: "alive", moodValue: 5 },
  { id: "dd44", text: "偶尔停下来也是前进", style: "literary", emotion: "calm", moodValue: 4 },

  // ===== 天气/时间感受 =====
  { id: "dd45", text: "今天的天空很好看", style: "direct", emotion: "hopeful", moodValue: 4 },
  { id: "dd46", text: "下雨天想赖在被窝里", style: "direct", emotion: "calm", moodValue: 3 },
  { id: "dd47", text: "风很大但心很静", style: "metaphor", emotion: "calm", moodValue: 4 },
  { id: "dd48", text: "阴天让一切都慢下来了", style: "scene", emotion: "melancholy", moodValue: 3 },
  { id: "dd49", text: "晒到太阳全身都在充电", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "dd50", text: "下午四点的光线最温柔", style: "scene", emotion: "warm", moodValue: 4 },
];
