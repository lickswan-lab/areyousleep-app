// 晚安语库 — 每晚结束时展示，按心情筛选，日期哈希选取

export interface GoodnightMessage {
  main: string;
  sub?: string;
  forLowMood?: boolean;
  emotion?: string; // 特定情绪专用
}

export const MESSAGES: GoodnightMessage[] = [
  // ===== 情绪专属晚安语 =====
  { main: "火会灭的", sub: "睡一觉，明天再说", emotion: "angry" },
  { main: "生气也消耗能量", sub: "先充个电", emotion: "angry" },
  { main: "焦虑的事", sub: "睡醒了再想也不迟", emotion: "anxious" },
  { main: "脑子可以停一停了", sub: "那些事跑不掉的", emotion: "anxious" },
  { main: "辛苦了", sub: "今天的累到此为止", emotion: "tired" },
  { main: "疲惫的一天结束了", sub: "明天可以慢一点", emotion: "tired" },
  { main: "什么都不想也挺好", sub: "就这样躺着吧", emotion: "numb" },
  { main: "有些感受不需要名字", sub: "让它安静地待着就好", emotion: "melancholy" },
  { main: "那些说不出口的话", sub: "月亮替你保管了", emotion: "melancholy" },
  { main: "带着这份平静入睡", sub: "这是最好的状态", emotion: "calm" },
  { main: "今天的开心要记住", sub: "这样的日子会越来越多", emotion: "hopeful" },
  { main: "带着这份温暖", sub: "做个好梦", emotion: "warm" },
  { main: "今天的你在发光", sub: "好好休息，明天继续闪", emotion: "alive" },
  { main: "心里沉沉的", sub: "放下来，明天会轻一些", emotion: "heavy" },

  // ===== 通用（心情3-5） =====
  { main: "今天也辛苦了", sub: "晚安" },
  { main: "月亮替你守着", sub: "你先睡" },
  { main: "世界很大", sub: "但今晚只需要照顾好自己" },
  { main: "脑子可以休息了", sub: "明天的事，明天再说" },
  { main: "今天结束了", sub: "你做得够好了" },
  { main: "夜很长", sub: "但你不需要一直醒着" },
  { main: "放下手机", sub: "闭上眼睛，让月光陪你" },
  { main: "不用赶了", sub: "这一刻只属于你自己" },
  { main: "嗯，都记下了", sub: "明天见" },
  { main: "今晚的星星", sub: "是专门为你亮的" },
  { main: "夜深了", sub: "允许自己什么都不想" },
  { main: "睡吧", sub: "明天是新的一天" },
  { main: "你已经很努力了", sub: "现在可以休息了" },
  { main: "把今天还给今天", sub: "晚安" },
  { main: "不必完美", sub: "活着就很好了" },
  { main: "深呼吸", sub: "然后慢慢沉入夜色" },
  { main: "今晚的事都放好了", sub: "安心睡吧" },

  // ===== 安慰型（心情1-2） =====
  { main: "不容易的一天", sub: "但你撑过来了", forLowMood: true },
  { main: "难过也是可以的", sub: "不用假装没事", forLowMood: true },
  { main: "你不需要一直坚强", sub: "今晚允许自己脆弱", forLowMood: true },
  { main: "抱抱", sub: "你值得被温柔对待", forLowMood: true },
  { main: "今天太累了吧", sub: "先睡一觉，醒来会好一点的", forLowMood: true },
  { main: "没关系", sub: "一切都会慢慢好起来的", forLowMood: true },
  { main: "你已经做得很好了", sub: "不要再苛责自己", forLowMood: true },
  { main: "心里的重量", sub: "先放在这里，明天再扛", forLowMood: true },
  { main: "流过的眼泪", sub: "都是在帮你卸下重量", forLowMood: true },
  { main: "即使今天很难", sub: "你依然选择了照顾自己", forLowMood: true },
  { main: "世界欠你一个拥抱", sub: "今晚让月亮替它还", forLowMood: true },
  { main: "不用撑了", sub: "睡着就好了", forLowMood: true },
  { main: "你比你以为的", sub: "要勇敢得多", forLowMood: true },
];

/**
 * 根据日期和心情选取今晚的晚安语
 * 同一天同一心情 → 同一条消息（日期哈希）
 */
export function getGoodnightMessage(mood?: number | null, emotion?: string | null): GoodnightMessage {
  const dateStr = new Date().toDateString();
  // 简单哈希
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  // 优先匹配特定情绪
  if (emotion) {
    const emotionMsgs = MESSAGES.filter((m) => m.emotion === emotion);
    if (emotionMsgs.length > 0) {
      return emotionMsgs[hash % emotionMsgs.length];
    }
  }

  const isLowMood = mood !== null && mood !== undefined && mood <= 2;
  const candidates = isLowMood
    ? MESSAGES.filter((m) => m.forLowMood)
    : MESSAGES.filter((m) => !m.forLowMood && !m.emotion);

  if (candidates.length === 0) return MESSAGES[0];
  return candidates[hash % candidates.length];
}
