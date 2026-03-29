// 100+ 情感描述池
// style: direct(直白) | literary(文学) | metaphor(比喻) | question(自问) | scene(场景)
// emotion: heavy(沉重) | anxious(焦虑) | tired(疲惫) | numb(麻木) | melancholy(忧郁) | calm(平静) | hopeful(温暖) | warm(舒适) | angry(愤怒) | alive(生机)

export type MoodStyle = "direct" | "literary" | "metaphor" | "question" | "scene";
export type MoodEmotion = "heavy" | "anxious" | "tired" | "numb" | "melancholy" | "calm" | "hopeful" | "warm" | "angry" | "alive";
export type MoodPersona = "highschool" | "college" | "worker" | "homemaker" | "entrepreneur" | "freelance" | "general";

export interface MoodDescription {
  id: string;
  text: string;
  sub?: string;
  style: MoodStyle;
  emotion: MoodEmotion;
  moodValue: number; // 1-5
  persona?: MoodPersona; // undefined or 'general' = universal, shown to everyone
  tags?: string[];  // for profile-based matching
  intensity?: "light" | "moderate" | "deep";
}

export const MOOD_DESCRIPTIONS: MoodDescription[] = [
  // ═══════════════════════════════════════
  // 直白型 (direct) — 简短、日常、一眼看懂
  // ═══════════════════════════════════════

  { id: "d01", text: "脑子停不下来", style: "direct", emotion: "anxious", moodValue: 2 },
  { id: "d02", text: "从早撑到现在，终于躺下了", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "d03", text: "心里堵堵的", style: "direct", emotion: "heavy", moodValue: 1 },
  { id: "d04", text: "明天的事还没着落", style: "direct", emotion: "anxious", moodValue: 2, tags: ["work", "future"] },
  { id: "d05", text: "说不上来的难受", style: "direct", emotion: "numb", moodValue: 1 },
  { id: "d06", text: "什么都不想做", style: "direct", emotion: "tired", moodValue: 1 },
  { id: "d07", text: "想哭但哭不出来", style: "direct", emotion: "heavy", moodValue: 1 },
  { id: "d08", text: "还好，就是睡不着", style: "direct", emotion: "calm", moodValue: 3 },
  { id: "d09", text: "活着，但也仅此而已", style: "direct", emotion: "numb", moodValue: 3 },
  { id: "d10", text: "今天居然没有一件烂事", style: "direct", emotion: "warm", moodValue: 5 },
  { id: "d11", text: "对自己有点失望", style: "direct", emotion: "heavy", moodValue: 2, tags: ["identity"] },
  { id: "d12", text: "躺下了但待办清单还在脑子里滚", style: "direct", emotion: "anxious", moodValue: 2, tags: ["work"] },
  { id: "d13", text: "被掏空了", style: "direct", emotion: "tired", moodValue: 1 },
  { id: "d14", text: "叹了好多次气", style: "direct", emotion: "melancholy", moodValue: 2 },
  { id: "d15", text: "不想睡，也不想醒着", style: "direct", emotion: "numb", moodValue: 2 },
  { id: "d16", text: "习惯性刷手机", style: "direct", emotion: "numb", moodValue: 3 },
  { id: "d17", text: "躺下了但不困", style: "direct", emotion: "calm", moodValue: 3 },
  { id: "d18", text: "翻了三遍通讯录没找到能打的电话", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["social", "single"] },
  { id: "d19", text: "被子是暖的，今天还行", style: "direct", emotion: "hopeful", moodValue: 4 },
  { id: "d20", text: "平静，想安静一会儿", style: "direct", emotion: "calm", moodValue: 4 },
  { id: "d21", text: "委屈", style: "direct", emotion: "heavy", moodValue: 1 },
  { id: "d22", text: "想找人聊聊但不知道找谁", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["social"] },
  { id: "d23", text: "感觉自己透明了", style: "direct", emotion: "numb", moodValue: 1 },
  { id: "d24", text: "电量见底了", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "d25", text: "今天对自己挺满意", style: "direct", emotion: "warm", moodValue: 5 },
  { id: "d26", text: "终于可以不装了", style: "direct", emotion: "tired", moodValue: 2 },
  { id: "d27", text: "脑子里全是明天的事", style: "direct", emotion: "anxious", moodValue: 2, tags: ["work"] },
  { id: "d28", text: "心跳得快但说不清在怕什么", style: "direct", emotion: "anxious", moodValue: 3, tags: ["high-anxiety"] },
  { id: "d29", text: "难得什么消息都不用回", style: "direct", emotion: "warm", moodValue: 5 },
  { id: "d30", text: "还在生气", style: "direct", emotion: "heavy", moodValue: 1 },

  // ═══════════════════════════════════════
  // 文学型 (literary) — 引用/化用经典
  // ═══════════════════════════════════════

  { id: "l01", text: "疲倦的日子也终将过去", sub: "里尔克意", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "l02", text: "生活在别处", sub: "米兰·昆德拉", style: "literary", emotion: "melancholy", moodValue: 2 },
  { id: "l03", text: "我只是想在天亮之前安静地待一会儿", style: "literary", emotion: "calm", moodValue: 3 },
  { id: "l04", text: "所有人都在催你长大，只有夜晚肯等你", style: "literary", emotion: "melancholy", moodValue: 3 },
  { id: "l05", text: "活着就是不断失去的过程", sub: "余华意", style: "literary", emotion: "heavy", moodValue: 1 },
  { id: "l06", text: "不必每天都有意义，躺着也算活着", style: "literary", emotion: "hopeful", moodValue: 4 },
  { id: "l07", text: "温柔的人是在不动声色地崩溃", style: "literary", emotion: "heavy", moodValue: 1 },
  { id: "l08", text: "白天是别人的，只有夜晚是自己的", style: "literary", emotion: "calm", moodValue: 3 },
  { id: "l09", text: "我们都是在黑暗中行走的孩子", style: "literary", emotion: "melancholy", moodValue: 2 },
  { id: "l10", text: "熬过今晚就好了吧", sub: "虽然昨晚也这么说", style: "literary", emotion: "hopeful", moodValue: 4 },
  { id: "l11", text: "白天演了一整天，夜晚才轮到自己", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "l12", text: "把不安的心交给月亮保管", style: "literary", emotion: "calm", moodValue: 4 },
  { id: "l13", text: "世上只有一种英雄主义：认清生活后依然热爱它", sub: "罗曼·罗兰意", style: "literary", emotion: "hopeful", moodValue: 4 },
  { id: "l14", text: "夜来了，没有声音，所有的声音都在心里", style: "literary", emotion: "melancholy", moodValue: 2 },
  { id: "l15", text: "大人只是长大了的小孩", sub: "小王子意", style: "literary", emotion: "melancholy", moodValue: 3 },
  { id: "l16", text: "凌晨三点半的灵魂是最诚实的", style: "literary", emotion: "calm", moodValue: 3 },
  { id: "l17", text: "所有坚强都是温柔生的茧", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "l18", text: "月亮知道我所有不敢说出口的话", style: "literary", emotion: "melancholy", moodValue: 2 },
  { id: "l19", text: "有些疲惫是洗澡都洗不掉的", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "l20", text: "你不必刻意成长，生活会推着你走", style: "literary", emotion: "calm", moodValue: 3 },
  { id: "l21", text: "人要学会和自己的心事和平相处", style: "literary", emotion: "calm", moodValue: 4 },
  { id: "l22", text: "那些杀不死你的，最终都会让你更疲惫", style: "literary", emotion: "tired", moodValue: 2 },
  { id: "l23", text: "永远不要对自己的感受感到抱歉", style: "literary", emotion: "warm", moodValue: 4 },
  { id: "l24", text: "今天的月亮值得一看", style: "literary", emotion: "warm", moodValue: 5 },

  // ═══════════════════════════════════════
  // 比喻型 (metaphor) — 意象化表达
  // ═══════════════════════════════════════

  { id: "m01", text: "像一杯放凉的茶", style: "metaphor", emotion: "tired", moodValue: 2 },
  { id: "m02", text: "像手机只剩1%的电", style: "metaphor", emotion: "tired", moodValue: 1 },
  { id: "m03", text: "心里像下着小雨", style: "metaphor", emotion: "melancholy", moodValue: 2 },
  { id: "m04", text: "整个人像一根绷紧的弦", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "m05", text: "感觉自己在水里", sub: "听得见外面的声音但够不到", style: "metaphor", emotion: "numb", moodValue: 1 },
  { id: "m06", text: "像一片飘在半空的云", sub: "不上不下", style: "metaphor", emotion: "numb", moodValue: 3 },
  { id: "m07", text: "脑子里住了一千个小人在开会", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "m08", text: "像是穿了一天的鞋终于脱下来了", style: "metaphor", emotion: "tired", moodValue: 3 },
  { id: "m09", text: "心里有块石头", sub: "不大，但一直在", style: "metaphor", emotion: "heavy", moodValue: 2 },
  { id: "m10", text: "像是暴风雨后的晴天", style: "metaphor", emotion: "hopeful", moodValue: 4 },
  { id: "m11", text: "整个人像一块被拧干的毛巾", style: "metaphor", emotion: "tired", moodValue: 1 },
  { id: "m12", text: "像深夜便利店的灯光", sub: "微弱但温暖", style: "metaphor", emotion: "warm", moodValue: 4 },
  { id: "m13", text: "心里的闹钟一直在响", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "m14", text: "像一朵快要散开的蒲公英", style: "metaphor", emotion: "numb", moodValue: 2 },
  { id: "m15", text: "身体很重，灵魂很轻", style: "metaphor", emotion: "tired", moodValue: 2 },
  { id: "m16", text: "像月亮一样", sub: "缺了一角也在发光", style: "metaphor", emotion: "hopeful", moodValue: 4 },
  { id: "m17", text: "心里有团雾", sub: "看不清前面的路", style: "metaphor", emotion: "anxious", moodValue: 2 },
  { id: "m18", text: "像一首听了很多遍的老歌", sub: "熟悉的疲惫", style: "metaphor", emotion: "tired", moodValue: 3 },
  { id: "m19", text: "像被按了静音键", style: "metaphor", emotion: "numb", moodValue: 2 },
  { id: "m20", text: "像窗台上那盆刚浇过水的花", sub: "在慢慢恢复", style: "metaphor", emotion: "hopeful", moodValue: 4 },

  // ═══════════════════════════════════════
  // 自问型 (question) — 内省、自我对话
  // ═══════════════════════════════════════

  { id: "q01", text: "为什么总是在深夜才诚实？", style: "question", emotion: "melancholy", moodValue: 2 },
  { id: "q02", text: "今天真的尽力了吗？", style: "question", emotion: "anxious", moodValue: 2, tags: ["work"] },
  { id: "q03", text: "如果不用在意别人的看法呢？", style: "question", emotion: "calm", moodValue: 3 },
  { id: "q04", text: "这件事，明天还会那么重要吗？", style: "question", emotion: "calm", moodValue: 3 },
  { id: "q05", text: "我上一次开心是什么时候？", style: "question", emotion: "melancholy", moodValue: 2 },
  { id: "q06", text: "如果可以对今天说一句话？", style: "question", emotion: "calm", moodValue: 3 },
  { id: "q07", text: "我在逃避什么？", style: "question", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "q08", text: "上一次不带目的地笑是什么时候？", style: "question", emotion: "melancholy", moodValue: 2 },
  { id: "q09", text: "如果不用懂事了呢？", style: "question", emotion: "calm", moodValue: 3 },
  { id: "q10", text: "如果明天是假期呢？", style: "question", emotion: "hopeful", moodValue: 4 },
  { id: "q11", text: "这份焦虑是真实的还是想象的？", style: "question", emotion: "anxious", moodValue: 3 },
  { id: "q12", text: "今天有没有一个好的瞬间？", style: "question", emotion: "hopeful", moodValue: 4 },
  { id: "q13", text: "如果现在不需要坚强呢？", style: "question", emotion: "heavy", moodValue: 2 },
  { id: "q14", text: "睡不着的时候，你的心在想谁？", style: "question", emotion: "melancholy", moodValue: 2, tags: ["emotion"] },
  { id: "q15", text: "为什么休息的时候也在想着还没做完的事？", style: "question", emotion: "tired", moodValue: 2, tags: ["work"] },

  // ═══════════════════════════════════════
  // 场景型 (scene) — 画面感、代入感
  // ═══════════════════════════════════════

  { id: "s01", text: "一个人坐在出租车后座，看窗外的路灯一盏一盏地过", style: "scene", emotion: "melancholy", moodValue: 2 },
  { id: "s02", text: "关上门的那一刻才卸下了笑容", style: "scene", emotion: "tired", moodValue: 2 },
  { id: "s03", text: "在超市结账的时候突然忘了要买什么", style: "scene", emotion: "numb", moodValue: 3 },
  { id: "s04", text: "看着天花板数裂缝的第38分钟", style: "scene", emotion: "anxious", moodValue: 2 },
  { id: "s05", text: "深夜外卖到了，打开盒子的热气扑到脸上", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "s06", text: "回复了所有消息，但没有人问你还好吗", style: "scene", emotion: "melancholy", moodValue: 1, tags: ["social"] },
  { id: "s07", text: "耳机里的歌单循环了三遍还是这首", style: "scene", emotion: "numb", moodValue: 3 },
  { id: "s08", text: "洗完澡穿上干净的睡衣，有点舒服", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "s09", text: "在备忘录里写了一大段话然后全部删掉", style: "scene", emotion: "heavy", moodValue: 1 },
  { id: "s10", text: "把手机翻过来扣在床头，不想再看了", style: "scene", emotion: "tired", moodValue: 2 },
  { id: "s11", text: "对着镜子里的自己说了一句辛苦了", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "s12", text: "打了一半的字又撤回了", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion", "social"] },
  { id: "s13", text: "站在阳台上吹了会儿风，什么都没想", style: "scene", emotion: "calm", moodValue: 4 },
  { id: "s14", text: "闹钟设了三个但知道自己明天还是会迟到", style: "scene", emotion: "tired", moodValue: 3 },
  { id: "s15", text: "收到一条「早点睡」的消息，嘴角动了一下", style: "scene", emotion: "warm", moodValue: 5 },
  { id: "s16", text: "盯着微信对话框的「对方正在输入」看了很久", style: "scene", emotion: "anxious", moodValue: 2, tags: ["emotion"] },

  // ═══════════════════════════════════════
  // 愤怒型 (angry) — 红色系
  // ═══════════════════════════════════════

  { id: "a01", text: "还在生那个人的气", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "a02", text: "凭什么", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "a03", text: "越想越气", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "a04", text: "心里有一团火烧不掉", style: "metaphor", emotion: "angry", moodValue: 1 },
  { id: "a05", text: "像一壶烧开的水", sub: "盖子快被顶飞了", style: "metaphor", emotion: "angry", moodValue: 1 },
  { id: "a06", text: "想摔手机", style: "direct", emotion: "angry", moodValue: 1 },
  { id: "a07", text: "被误解了但解释不清", style: "direct", emotion: "angry", moodValue: 2 },
  { id: "a08", text: "那句话一直在脑子里回放", style: "scene", emotion: "angry", moodValue: 2 },
  { id: "a09", text: "不是我的错，但所有人都觉得是", style: "scene", emotion: "angry", moodValue: 1 },
  { id: "a10", text: "愤怒的背后藏着一个受伤的自己", style: "literary", emotion: "angry", moodValue: 2 },
  { id: "a11", text: "为什么总是我在忍？", style: "question", emotion: "angry", moodValue: 1 },
  { id: "a12", text: "编辑了一大段消息然后全删了", sub: "算了", style: "scene", emotion: "angry", moodValue: 2 },

  // ═══════════════════════════════════════
  // 生机型 (alive) — 绿色系
  // ═══════════════════════════════════════

  { id: "v01", text: "今天做了一件让自己骄傲的事", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "v02", text: "突然觉得活着真好", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "v03", text: "跑完步的那种畅快还在", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "v04", text: "有了一个新的想法，迫不及待想试试", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "v05", text: "像春天的第一棵芽", sub: "什么都在生长", style: "metaphor", emotion: "alive", moodValue: 5 },
  { id: "v06", text: "和朋友大笑了一场，脸都笑疼了", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "v07", text: "被夸了，偷偷开心了好久", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "v08", text: "有些日子就是值得被记住的", style: "literary", emotion: "alive", moodValue: 5 },
  { id: "v09", text: "今天的自己有点发光", style: "metaphor", emotion: "alive", moodValue: 5 },
  { id: "v10", text: "好久没有这种心跳加速的感觉了", style: "direct", emotion: "alive", moodValue: 4 },
  { id: "v11", text: "明天也想这样过", style: "direct", emotion: "alive", moodValue: 5 },
  { id: "v12", text: "如果今天可以重播一遍就好了", style: "question", emotion: "alive", moodValue: 5 },

  // ═══════════════════════════════════════
  // 职场人 (worker) — ~35%
  // ═══════════════════════════════════════

  { id: "pw01", text: "被老板cue了但没准备好", style: "scene", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw02", text: "\"收到\"两个字打了删删了打", style: "scene", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw03", text: "地铁上闭着眼但根本没睡着", style: "scene", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw04", text: "想辞职但不敢", style: "direct", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw05", text: "PPT做到第27版", style: "scene", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw06", text: "工位上偷偷红了眼眶", sub: "假装在看电脑", style: "scene", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw07", text: "周末也在回消息", sub: "工作和生活的边界模糊了", style: "scene", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw08", text: "开了一天的会，脑子像浆糊", style: "metaphor", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw09", text: "KPI像一座山压在胸口", style: "metaphor", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw10", text: "加班到现在，外面已经没有地铁了", style: "scene", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw11", text: "领导的已读不回比什么都可怕", style: "scene", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw12", text: "职场里没有真朋友吧", style: "question", emotion: "melancholy", moodValue: 2, persona: "worker", tags: ["office", "work", "social"] },
  { id: "pw13", text: "厕所是今天唯一的避难所", style: "scene", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw14", text: "年终总结写了三遍还是觉得自己什么都没做", style: "scene", emotion: "numb", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw15", text: "周日晚上的恐惧比周一早上还重", style: "direct", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw16", text: "工位上的绿植都比我活得好", style: "metaphor", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw17", text: "体检报告到了但不敢打开", style: "scene", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "health"] },
  { id: "pw18", text: "下班了但心还没下班", style: "direct", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw19", text: "被甲方改需求改到怀疑人生", style: "scene", emotion: "angry", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pw20", text: "在工位上偷偷深呼吸了好多次", style: "scene", emotion: "anxious", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw21", text: "被裁了但还没告诉家人", style: "scene", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work", "family"] },
  { id: "pw22", text: "电梯里碰到同事假笑了一下", sub: "脸都僵了", style: "scene", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw23", text: "工资到账的那一秒是本月最开心的时刻", style: "scene", emotion: "warm", moodValue: 4, persona: "worker", tags: ["office", "work", "finance"] },
  { id: "pw24", text: "新来的领导比我年轻", sub: "说不出什么感觉", style: "scene", emotion: "melancholy", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw25", text: "在厕所里躲了十分钟才出来", style: "scene", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw26", text: "对着电脑发呆被同事喊了三遍", style: "scene", emotion: "numb", moodValue: 2, persona: "worker", tags: ["office", "work"] },
  { id: "pw27", text: "35岁了开始怕被优化", style: "direct", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "future"] },
  { id: "pw28", text: "周五下午的快乐只维持到周日晚上", style: "scene", emotion: "melancholy", moodValue: 3, persona: "worker", tags: ["office", "work"] },

  // ═══════════════════════════════════════
  // 学生 (student) — ~25%
  // ═══════════════════════════════════════

  { id: "ps01", text: "考试倒计时但什么都没看", style: "direct", emotion: "anxious", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps02", text: "室友睡了我还在焦虑", style: "scene", emotion: "anxious", moodValue: 2, persona: "college", tags: ["student", "study"] },
  { id: "ps03", text: "论文一个字没写", style: "direct", emotion: "anxious", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps04", text: "GPA算了又算还是不够", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps05", text: "毕业照笑得很开心", sub: "但不知道下一步往哪走", style: "scene", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps06", text: "考研二战了还是没把握", sub: "但也不敢停", style: "direct", emotion: "anxious", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps07", text: "图书馆坐了一天但效率为零", style: "scene", emotion: "tired", moodValue: 2, persona: "college", tags: ["student", "study"] },
  { id: "ps08", text: "实习日报写了一个小时", sub: "但没有人会看", style: "scene", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study", "work"] },
  { id: "ps09", text: "选课像赌博", sub: "赌输了一整个学期", style: "metaphor", emotion: "heavy", moodValue: 2, persona: "college", tags: ["student", "study"] },
  { id: "ps10", text: "存款只剩两位数但朋友约吃饭", sub: "不好意思说没钱", style: "scene", emotion: "heavy", moodValue: 2, persona: "college", tags: ["student", "study", "finance"] },
  { id: "ps11", text: "实习投了50份简历，已读不回", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps12", text: "室友都睡了我戴着耳机假装没哭", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps13", text: "父母问成绩的时候不知道怎么回答", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study", "family"] },
  { id: "ps14", text: "大学过了一半还是不知道自己喜欢什么", style: "question", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps15", text: "期末周像一场打不完的仗", style: "metaphor", emotion: "anxious", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps16", text: "考研还是就业？", sub: "每天都在纠结", style: "question", emotion: "anxious", moodValue: 2, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps17", text: "同学保研的保研留学的留学", sub: "我连简历都写不满一页", style: "scene", emotion: "heavy", moodValue: 2, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps18", text: "考研自习室只剩我一个人了", sub: "不知道是坚持还是死撑", style: "scene", emotion: "melancholy", moodValue: 2, persona: "college", tags: ["student", "study"] },
  { id: "ps19", text: "实习被当免费劳动力", sub: "但简历不能空着", style: "direct", emotion: "angry", moodValue: 2, persona: "college", tags: ["student", "study", "work"] },
  { id: "ps20", text: "秋招投了五十份简历没一个回音", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps21", text: "室友打游戏到凌晨三点", sub: "我在假装睡着", style: "scene", emotion: "angry", moodValue: 2, persona: "college", tags: ["student", "study", "social"] },
  { id: "ps22", text: "分手了但期末还要复习", sub: "眼泪和公式一起背", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study", "emotion"] },
  { id: "ps23", text: "奖学金差0.1分", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps24", text: "四个人的寝室四个微信群", sub: "表面和谐心里疏离", style: "scene", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study", "social"] },
  { id: "ps25", text: "第一次离家这么远", sub: "想家但不敢说", style: "direct", emotion: "melancholy", moodValue: 2, persona: "college", tags: ["student", "study", "family"] },
  { id: "ps26", text: "食堂吃腻了外卖又贵", style: "direct", emotion: "tired", moodValue: 3, persona: "college", tags: ["student", "study"] },
  { id: "ps27", text: "导师又把我的方案否了", style: "scene", emotion: "heavy", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps28", text: "答辩前一晚通宵了", sub: "脑子已经是空的", style: "scene", emotion: "tired", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps29", text: "同学都在考公考研我还在纠结", style: "direct", emotion: "anxious", moodValue: 2, persona: "college", tags: ["student", "study", "future"] },
  { id: "ps30", text: "学费又涨了不好意思和家里说", style: "scene", emotion: "heavy", moodValue: 2, persona: "college", tags: ["student", "study", "finance"] },
  { id: "ps31", text: "寝室关系表面和谐", sub: "群聊之外还有群聊", style: "scene", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study", "social"] },
  { id: "ps32", text: "毕业设计像一座搬不动的山", style: "metaphor", emotion: "anxious", moodValue: 1, persona: "college", tags: ["student", "study"] },
  { id: "ps33", text: "大学四年好像什么也没学到", style: "question", emotion: "numb", moodValue: 2, persona: "college", tags: ["student", "study"] },

  // ═══════════════════════════════════════
  // 全职妈妈/爸爸 (homemaker) — ~15%
  // ═══════════════════════════════════════

  { id: "ph01", text: "孩子终于睡了我终于是自己了", style: "scene", emotion: "tired", moodValue: 3, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph02", text: "今天被熊孩子气哭了", style: "direct", emotion: "angry", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph03", text: "孩子喊第100遍妈妈的时候想消失五分钟", style: "direct", emotion: "tired", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph04", text: "在超市因为选错酸奶突然崩溃了", style: "scene", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph05", text: "\"你不就带个孩子吗\"", sub: "这句话的杀伤力他永远不懂", style: "scene", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph06", text: "孩子的笑是今天唯一的光", style: "literary", emotion: "warm", moodValue: 4, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph07", text: "一个人撑起一整个家的感觉", sub: "又骄傲又疲惫", style: "direct", emotion: "tired", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph08", text: "朋友聚会只能聊孩子", sub: "别的话题插不上嘴了", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "social"] },
  { id: "ph09", text: "我的价值不只是带孩子做饭吧？", style: "question", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family", "identity"] },
  { id: "ph10", text: "把客厅收拾干净的那十分钟是今天的高光", style: "scene", emotion: "warm", moodValue: 4, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph11", text: "在厨房里站了三个小时，腰快断了", style: "scene", emotion: "tired", moodValue: 1, persona: "homemaker", tags: ["parent", "family", "health"] },
  { id: "ph12", text: "半夜起来喂奶觉得世界只剩自己一个人", style: "scene", emotion: "melancholy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph13", text: "想找个人聊天但话题只剩孩子了", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "social"] },
  { id: "ph14", text: "半夜起来给孩子盖被子，突然心软了", style: "scene", emotion: "warm", moodValue: 4, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph15", text: "孩子问妈妈你怎么不开心", sub: "原来我连装都装不好了", style: "scene", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph16", text: "像一台不能关机的电脑", sub: "后台永远在运行", style: "metaphor", emotion: "tired", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph17", text: "孩子发烧了整夜没睡", sub: "明天还要继续", style: "scene", emotion: "tired", moodValue: 1, persona: "homemaker", tags: ["parent", "family", "health"] },
  { id: "ph18", text: "全职在家被说不工作", style: "direct", emotion: "angry", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph19", text: "朋友圈都在晒事业我在晒娃", sub: "有时候会恍惚", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "identity"] },
  { id: "ph20", text: "你又没上班累什么", sub: "这句话像刀", style: "scene", emotion: "angry", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph21", text: "想回职场但简历上空白期太长了", style: "direct", emotion: "anxious", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "future"] },
  { id: "ph22", text: "终于等到孩子午睡的自由时光", style: "scene", emotion: "calm", moodValue: 4, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph23", text: "菜价涨了在超市算了半天", style: "scene", emotion: "anxious", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "finance"] },
  { id: "ph24", text: "家长群的消息一条比一条焦虑", style: "scene", emotion: "anxious", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph25", text: "孩子叫了一声妈妈/爸爸就值了", style: "scene", emotion: "warm", moodValue: 5, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph26", text: "今天出门买菜是唯一和外界接触的时间", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "social"] },
  { id: "ph27", text: "孩子不听话的时候觉得自己好失败", style: "direct", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph28", text: "老人帮忙带娃但观念冲突不断", style: "direct", emotion: "angry", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph29", text: "镜子里的人好陌生", sub: "什么时候变成这样了", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "appearance"] },
  { id: "ph30", text: "三年没买过一件自己的衣服了", style: "scene", emotion: "melancholy", moodValue: 2, persona: "homemaker", tags: ["parent", "family", "finance"] },
  { id: "ph31", text: "做了一桌菜没人说好吃", style: "scene", emotion: "heavy", moodValue: 2, persona: "homemaker", tags: ["parent", "family"] },
  { id: "ph32", text: "有时候锁上厕所门就是为了哭一下", style: "scene", emotion: "heavy", moodValue: 1, persona: "homemaker", tags: ["parent", "family"] },

  // ═══════════════════════════════════════
  // 中年 (midlife) — ~15%
  // ═══════════════════════════════════════

  { id: "pm01", text: "上有老下有小", style: "direct", emotion: "heavy", moodValue: 2, persona: "worker", tags: ["office", "work", "family"] },
  { id: "pm02", text: "房贷还有二十年", style: "direct", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "finance"] },
  { id: "pm03", text: "身体发出了警报", style: "direct", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "health"] },
  { id: "pm04", text: "朋友圈都不敢刷了", sub: "每条都在提醒我落后了", style: "scene", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work", "social"] },
  { id: "pm05", text: "不敢生病不敢停", style: "direct", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work", "health"] },
  { id: "pm06", text: "半夜醒来想到的第一件事是钱", style: "scene", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "finance"] },
  { id: "pm07", text: "四十岁了还在找自己", style: "question", emotion: "melancholy", moodValue: 2, persona: "worker", tags: ["office", "work", "identity"] },
  { id: "pm08", text: "体检报告不敢打开", style: "scene", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "health"] },
  { id: "pm09", text: "孩子的学费、父母的医药费、自己的焦虑", sub: "哪个都放不下", style: "direct", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work", "family", "finance"] },
  { id: "pm10", text: "像一棵树", sub: "所有人都在乘凉但没人问树累不累", style: "metaphor", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work", "family"] },
  { id: "pm11", text: "年轻时的梦想现在想起来有点心酸", style: "literary", emotion: "melancholy", moodValue: 2, persona: "worker", tags: ["office", "work", "identity"] },
  { id: "pm12", text: "车停好了但不想上楼", sub: "在车里坐了二十分钟", style: "scene", emotion: "numb", moodValue: 2, persona: "worker", tags: ["office", "work", "family"] },
  { id: "pm13", text: "老婆说我变了，可能她是对的", style: "scene", emotion: "heavy", moodValue: 2, persona: "worker", tags: ["office", "work", "emotion"] },
  { id: "pm14", text: "背上的责任越来越重，肩膀越来越疼", style: "metaphor", emotion: "tired", moodValue: 1, persona: "worker", tags: ["office", "work", "family"] },
  { id: "pm15", text: "如果可以重来一次会怎样？", style: "question", emotion: "melancholy", moodValue: 2, persona: "worker", tags: ["office", "work", "identity"] },
  { id: "pm16", text: "失眠的原因太多，数不过来", style: "direct", emotion: "anxious", moodValue: 1, persona: "worker", tags: ["office", "work", "high-anxiety"] },
  { id: "pm17", text: "中年人的崩溃都是静悄悄的", style: "literary", emotion: "heavy", moodValue: 1, persona: "worker", tags: ["office", "work"] },
  { id: "pm18", text: "今天也假装没事地过完了一天", style: "scene", emotion: "tired", moodValue: 2, persona: "worker", tags: ["office", "work"] },

  // ═══════════════════════════════════════
  // 银发族 (senior) — ~10%
  // ═══════════════════════════════════════

  { id: "pe01", text: "今天去医院排了一天队", style: "scene", emotion: "tired", moodValue: 1, persona: "freelance", tags: ["freelance", "health"] },
  { id: "pe02", text: "孩子们好久没来电话了", style: "direct", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance", "family"] },
  { id: "pe03", text: "老伴的身体让我担心", style: "direct", emotion: "anxious", moodValue: 2, persona: "freelance", tags: ["freelance", "family", "health"] },
  { id: "pe04", text: "凌晨四点就醒了", sub: "天亮得好慢", style: "scene", emotion: "tired", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "pe05", text: "看着老照片想起好多事", style: "scene", emotion: "melancholy", moodValue: 3, persona: "freelance", tags: ["freelance"] },
  { id: "pe06", text: "公园里走了两圈，今天还不错", style: "scene", emotion: "warm", moodValue: 4, persona: "freelance", tags: ["freelance", "health"] },
  { id: "pe07", text: "药又涨价了", style: "direct", emotion: "anxious", moodValue: 2, persona: "freelance", tags: ["freelance", "health", "finance"] },
  { id: "pe08", text: "年轻时觉得来日方长", sub: "现在才懂珍惜", style: "literary", emotion: "melancholy", moodValue: 3, persona: "freelance", tags: ["freelance"] },
  { id: "pe09", text: "老朋友又少了一个", style: "direct", emotion: "heavy", moodValue: 1, persona: "freelance", tags: ["freelance", "social"] },
  { id: "pe10", text: "摔了一跤没敢告诉孩子", sub: "怕他们担心", style: "scene", emotion: "heavy", moodValue: 2, persona: "freelance", tags: ["freelance", "family", "health"] },
  { id: "pe11", text: "一个人吃饭的时候特别安静", style: "scene", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance", "social"] },
  { id: "pe12", text: "腿脚不如从前了", sub: "但今天还是走出了门", style: "direct", emotion: "hopeful", moodValue: 3, persona: "freelance", tags: ["freelance", "health"] },
  { id: "pe13", text: "孙子的视频看了好多遍", style: "scene", emotion: "warm", moodValue: 5, persona: "freelance", tags: ["freelance", "family"] },
  { id: "pe14", text: "晚上的时间特别长", style: "direct", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "pe15", text: "今天阳光很好，晒了会儿太阳", style: "scene", emotion: "calm", moodValue: 4, persona: "freelance", tags: ["freelance"] },
  { id: "pe16", text: "手机上的字太小了", sub: "连看个消息都费劲", style: "scene", emotion: "tired", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl01", text: "回复\"在忙\"但其实一整天没人找", style: "scene", emotion: "numb", moodValue: 2, persona: "freelance", tags: ["freelance", "social"] },
  { id: "fl02", text: "收入不稳定的焦虑", sub: "这个月还没接到活", style: "direct", emotion: "anxious", moodValue: 1, persona: "freelance", tags: ["freelance", "finance"] },
  { id: "fl03", text: "今天没有一个人找我", style: "direct", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance", "social"] },
  { id: "fl04", text: "咖啡馆坐了一天产出为零", sub: "但至少出了门", style: "scene", emotion: "tired", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl05", text: "退休了才发现朋友都是单位里的", style: "direct", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance", "social"] },
  { id: "fl06", text: "从忙碌到清闲的落差感", sub: "像突然被按了暂停", style: "metaphor", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl07", text: "不用定闹钟了但失眠了", style: "direct", emotion: "anxious", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl08", text: "别人的周末是放松", sub: "我的周末是焦虑的延续", style: "direct", emotion: "anxious", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl09", text: "甲方的需求改了又改", sub: "但不敢说不", style: "scene", emotion: "angry", moodValue: 2, persona: "freelance", tags: ["freelance", "work"] },
  { id: "fl10", text: "别人问我做什么的我不知道怎么回答", style: "scene", emotion: "numb", moodValue: 2, persona: "freelance", tags: ["freelance", "identity"] },
  { id: "fl11", text: "自己交社保的那一刻觉得好孤独", style: "scene", emotion: "melancholy", moodValue: 2, persona: "freelance", tags: ["freelance", "finance"] },
  { id: "fl12", text: "今天终于把拖了半个月的活交了", style: "scene", emotion: "hopeful", moodValue: 4, persona: "freelance", tags: ["freelance"] },
  { id: "fl13", text: "下午三点的咖啡馆只有我在工作", style: "scene", emotion: "calm", moodValue: 3, persona: "freelance", tags: ["freelance"] },
  { id: "fl14", text: "接了一个不太想做的项目", sub: "但需要钱", style: "direct", emotion: "heavy", moodValue: 2, persona: "freelance", tags: ["freelance", "finance"] },
  { id: "fl15", text: "自由职业的自由是假的", sub: "只是换了个地方焦虑", style: "literary", emotion: "anxious", moodValue: 2, persona: "freelance", tags: ["freelance"] },
  { id: "fl16", text: "早上醒来没有闹钟", sub: "但也没有方向", style: "metaphor", emotion: "numb", moodValue: 3, persona: "freelance", tags: ["freelance", "future"] },

  // ═══════════════════════════════════════
  // 中小学生 (highschool)
  // ═══════════════════════════════════════
  { id: "hs01", text: "作业写不完了", style: "direct", emotion: "anxious", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs02", text: "当着全班被点名批评", sub: "恨不得钻进地里", style: "scene", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs03", text: "考试没考好怕回家被骂", style: "direct", emotion: "anxious", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs04", text: "好朋友突然不理我了", style: "direct", emotion: "melancholy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "social"] },
  { id: "hs05", text: "妈偷看了我的聊天记录", style: "scene", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs06", text: "月考排名贴在走廊上", sub: "经过的时候假装没看", style: "scene", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs07", text: "爸妈又吵架了", style: "direct", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs08", text: "明天有考试但什么都没复习", style: "direct", emotion: "anxious", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs09", text: "被同学嘲笑了装作不在意", style: "scene", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "social"] },
  { id: "hs10", text: "在被子里偷偷看手机", sub: "这是一天里唯一属于自己的时间", style: "scene", emotion: "calm", moodValue: 3, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs11", text: "暗恋的人今天看了我一眼", style: "scene", emotion: "alive", moodValue: 5, persona: "highschool", tags: ["student", "teen", "study", "emotion"] },
  { id: "hs12", text: "周末终于可以睡懒觉了", style: "direct", emotion: "hopeful", moodValue: 5, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs13", text: "大人根本不理解我", style: "direct", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs14", text: "学这些到底有什么用？", sub: "没人回答过我", style: "question", emotion: "numb", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs15", text: "喜欢一个人但连看都不敢多看", style: "direct", emotion: "melancholy", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study", "emotion"] },
  { id: "hs16", text: "中考倒计时每天少一天", sub: "心跳也跟着加速", style: "direct", emotion: "anxious", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs17", text: "日记被爸妈偷看了", style: "scene", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs18", text: "补课补到想吐", sub: "周末比上学还累", style: "direct", emotion: "tired", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs19", text: "喜欢的人换了同桌", style: "scene", emotion: "melancholy", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study", "emotion"] },
  { id: "hs20", text: "月考排名又掉了", style: "direct", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs21", text: "又被拿来和别人家的孩子比了", style: "direct", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs22", text: "在学校装开朗回家才敢丧", style: "scene", emotion: "tired", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs23", text: "班主任说要叫家长", sub: "回家的路走得特别慢", style: "scene", emotion: "anxious", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs24", text: "和爸妈说什么都说不通", style: "direct", emotion: "angry", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs25", text: "书包被翻了", sub: "连最后一点隐私都没有", style: "scene", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs26", text: "晚自习偷偷写了一封没寄出去的信", style: "scene", emotion: "melancholy", moodValue: 3, persona: "highschool", tags: ["student", "teen", "study", "emotion"] },
  { id: "hs27", text: "明明很努力了成绩就是上不去", style: "direct", emotion: "heavy", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs28", text: "手机被没收了感觉和世界断开了", style: "scene", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study", "family"] },
  { id: "hs29", text: "高考像一座山", sub: "翻过去才能看见风景", style: "metaphor", emotion: "anxious", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs30", text: "班主任找我谈话了又", style: "scene", emotion: "anxious", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs31", text: "不想上学但也说不出为什么", style: "direct", emotion: "numb", moodValue: 2, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs32", text: "凭什么大人可以我就不行", style: "question", emotion: "angry", moodValue: 1, persona: "highschool", tags: ["student", "teen", "study"] },
  { id: "hs33", text: "下课十分钟是全天最自由的时候", style: "scene", emotion: "calm", moodValue: 4, persona: "highschool", tags: ["student", "teen", "study"] },

  // ═══════════════════════════════════════
  // 创业/投资者 (entrepreneur)
  // ═══════════════════════════════════════
  { id: "en01", text: "融资又黄了", style: "direct", emotion: "heavy", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en02", text: "现金流只够撑两个月", style: "direct", emotion: "anxious", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en03", text: "合伙人开始偷偷投简历了", style: "scene", emotion: "heavy", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en04", text: "今天签了一个大单", style: "direct", emotion: "alive", moodValue: 5, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en05", text: "半夜还在回客户消息", style: "scene", emotion: "tired", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en06", text: "PPT里的增长曲线只存在于PPT里", style: "scene", emotion: "numb", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en07", text: "员工离职了我一个人顶", style: "direct", emotion: "tired", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en08", text: "发完工资看着账户余额发呆", style: "scene", emotion: "anxious", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en09", text: "所有人都觉得我疯了", sub: "但我知道这条路是对的", style: "metaphor", emotion: "calm", moodValue: 3, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en10", text: "面试别人的时候在想", sub: "我自己也想被面试", style: "scene", emotion: "tired", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en11", text: "用户数据终于涨了", style: "direct", emotion: "alive", moodValue: 5, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en12", text: "已经记不清上次放假是什么时候了", style: "direct", emotion: "tired", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en13", text: "凌晨三点还在改BP", style: "scene", emotion: "tired", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en14", text: "如果失败了怎么办？", style: "question", emotion: "anxious", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance", "future"] },
  { id: "en15", text: "家人问什么时候能挣到钱", sub: "我笑了笑没说话", style: "scene", emotion: "heavy", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance", "family"] },
  { id: "en16", text: "市场验证了我的判断", sub: "那一刻值了", style: "scene", emotion: "alive", moodValue: 5, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en17", text: "产品上线了但没人用", style: "direct", emotion: "heavy", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en18", text: "被投资人问了三个小时", sub: "像在过堂", style: "scene", emotion: "tired", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en19", text: "团建时装作轻松", sub: "其实下个月工资还没着落", style: "scene", emotion: "anxious", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en20", text: "家人不理解为什么不去找个稳定工作", style: "direct", emotion: "heavy", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance", "family"] },
  { id: "en21", text: "看着账上的数字心跳加速", sub: "不是激动是害怕", style: "scene", emotion: "anxious", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en22", text: "竞对抄了我们的方案", style: "direct", emotion: "angry", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en23", text: "深夜一个人在办公室", sub: "整栋楼只有我的灯亮着", style: "scene", emotion: "melancholy", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en24", text: "第一个付费用户来了", style: "direct", emotion: "alive", moodValue: 5, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en25", text: "股市收盘后才敢看手机", style: "scene", emotion: "anxious", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en26", text: "投资人说再考虑考虑", sub: "这句话听了无数遍", style: "scene", emotion: "numb", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en27", text: "核心成员要走了", sub: "比失恋还难受", style: "direct", emotion: "heavy", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en28", text: "发工资的日子比任何deadline都紧张", style: "direct", emotion: "anxious", moodValue: 1, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en29", text: "终于拿到了term sheet", style: "direct", emotion: "alive", moodValue: 5, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en30", text: "创业三年没休过一个完整的假", style: "direct", emotion: "tired", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en31", text: "demo day讲完了浑身发抖", style: "scene", emotion: "anxious", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance"] },
  { id: "en32", text: "朋友们聚会聊生活我只能聊项目", style: "scene", emotion: "melancholy", moodValue: 2, persona: "entrepreneur", tags: ["entrepreneur", "finance", "social"] },

  // ═══════════════════════════════════════
  // 触动心弦 — 按关注方面分组
  // ═══════════════════════════════════════

  // --- 家庭 ---
  { id: "t01", text: "妈妈打来电话，挂掉之后才想起没说想她", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["family"] },
  { id: "t02", text: "家里那张饭桌越来越安静了", style: "scene", emotion: "heavy", moodValue: 2, tags: ["family"] },
  { id: "t03", text: "父母老了，可我连自己都照顾不好", style: "direct", emotion: "heavy", moodValue: 1, tags: ["family"] },
  { id: "t04", text: "在外面笑着，回家才敢叹气", style: "scene", emotion: "tired", moodValue: 2, tags: ["family"] },
  { id: "t05", text: "他们的期望像一件穿不脱的毛衣", style: "metaphor", emotion: "heavy", moodValue: 2, tags: ["family", "teen"] },
  { id: "t06", text: "过年回家是想家和害怕回家的拉扯", style: "direct", emotion: "anxious", moodValue: 2, tags: ["family"] },
  { id: "t07", text: "爸妈吵架的声音，隔了二十年还是很清楚", style: "scene", emotion: "heavy", moodValue: 1, tags: ["family"] },
  { id: "t08", text: "学会了用懂事来保护自己", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["family", "teen"] },
  { id: "t09", text: "想回家，又不知道回去之后说什么", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["family"] },
  { id: "t10", text: "小时候的房间还在，但已经不是我的了", style: "scene", emotion: "melancholy", moodValue: 3, tags: ["family"] },

  // --- 经济 ---
  { id: "t11", text: "月底了，打开银行app需要勇气", style: "scene", emotion: "anxious", moodValue: 2, tags: ["finance"] },
  { id: "t12", text: "在超市放下了想买的东西", style: "scene", emotion: "heavy", moodValue: 2, tags: ["finance"] },
  { id: "t13", text: "工资到账的那一秒是这个月唯一的安全感", style: "direct", emotion: "anxious", moodValue: 2, tags: ["finance", "office"] },
  { id: "t14", text: "怕生病，不是怕痛，是怕花钱", style: "direct", emotion: "anxious", moodValue: 1, tags: ["finance", "health"] },
  { id: "t15", text: "朋友聚餐前先看了看余额", style: "scene", emotion: "anxious", moodValue: 2, tags: ["finance", "social"] },
  { id: "t16", text: "连焦虑都是按月收费的", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["finance"] },
  { id: "t17", text: "存不下钱的日子，像沙漏倒不过来", style: "metaphor", emotion: "heavy", moodValue: 2, tags: ["finance"] },
  { id: "t18", text: "年薪百万的梦做完了，闹钟响了", style: "scene", emotion: "numb", moodValue: 3, tags: ["finance"] },

  // --- 外貌/身体 ---
  { id: "t19", text: "又在镜子前站了很久", style: "scene", emotion: "heavy", moodValue: 2, tags: ["appearance"] },
  { id: "t20", text: "别人夸好看的时候不知道该不该信", style: "direct", emotion: "numb", moodValue: 3, tags: ["appearance"] },
  { id: "t21", text: "讨厌自己身体的夜晚来得很突然", style: "direct", emotion: "heavy", moodValue: 1, tags: ["appearance"] },
  { id: "t22", text: "照片里的自己和镜子里的是两个人", style: "direct", emotion: "numb", moodValue: 2, tags: ["appearance"] },
  { id: "t23", text: "刷到好看的人，下意识低头", style: "scene", emotion: "heavy", moodValue: 2, tags: ["appearance", "social"] },
  { id: "t24", text: "衣柜满了但明天还是没衣服穿", style: "scene", emotion: "numb", moodValue: 3, tags: ["appearance"] },

  // --- 情感/关系 ---
  { id: "t25", text: "想他了，但手机拿起来又放下", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion"] },
  { id: "t26", text: "吵完架的安静比吵架本身更难受", style: "direct", emotion: "heavy", moodValue: 1, tags: ["emotion", "in-relationship"] },
  { id: "t27", text: "两个人的床，只暖了一半", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion", "in-relationship"] },
  { id: "t28", text: "删掉又打出来的那句话，才是真心话", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion"] },
  { id: "t29", text: "一个人吃饭的时候不觉得，买菜的时候忽然难过", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion", "single"] },
  { id: "t30", text: "又在约会软件上左滑到拇指酸", style: "scene", emotion: "tired", moodValue: 2, tags: ["emotion", "single"] },
  { id: "t31", text: "他说晚安的方式变了，但我没敢问", style: "scene", emotion: "anxious", moodValue: 2, tags: ["emotion", "in-relationship"] },
  { id: "t32", text: "分手后第一次路过那家店", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["emotion"] },
  { id: "t33", text: "不是不想爱了，是累了", style: "direct", emotion: "tired", moodValue: 2, tags: ["emotion"] },
  { id: "t34", text: "习惯了等一个不会来的消息", style: "direct", emotion: "melancholy", moodValue: 1, tags: ["emotion"] },

  // --- 工作 ---
  { id: "t35", text: "胸口像压了一块石头，从早上开始", style: "direct", emotion: "heavy", moodValue: 1, tags: ["work", "office"] },
  { id: "t36", text: "周日晚上的恐惧比周一本身更折磨", style: "direct", emotion: "anxious", moodValue: 2, tags: ["work", "office"] },
  { id: "t37", text: "开完会发现一天就没了", style: "direct", emotion: "tired", moodValue: 2, tags: ["work", "office"] },
  { id: "t38", text: "在厕所多待了五分钟不想出去", style: "scene", emotion: "tired", moodValue: 2, tags: ["work", "office"] },
  { id: "t39", text: "领导说'辛苦了'，但从来没问过累不累", style: "scene", emotion: "numb", moodValue: 2, tags: ["work", "office"] },
  { id: "t40", text: "通勤的地铁上，每张脸都写着疲惫", style: "scene", emotion: "tired", moodValue: 2, tags: ["work", "office"] },
  { id: "t41", text: "KPI是别人定的，但失眠是自己的", style: "direct", emotion: "anxious", moodValue: 2, tags: ["work", "office"] },
  { id: "t42", text: "加班不可怕，可怕的是加班成了日常", style: "direct", emotion: "numb", moodValue: 2, tags: ["work", "office"] },
  { id: "t43", text: "邮件已读未回，心里已经回了八百遍", style: "scene", emotion: "anxious", moodValue: 2, tags: ["work"] },
  { id: "t44", text: "做了一天有意义的工作，回家路上忽然开心", style: "scene", emotion: "warm", moodValue: 5, tags: ["work"] },

  // --- 学习 ---
  { id: "t45", text: "图书馆关灯了，书还没看完", style: "scene", emotion: "anxious", moodValue: 2, tags: ["study", "student"] },
  { id: "t46", text: "室友都睡了，只有我的台灯还亮着", style: "scene", emotion: "tired", moodValue: 2, tags: ["study", "student"] },
  { id: "t47", text: "成绩出来的前一秒比考试还紧张", style: "direct", emotion: "anxious", moodValue: 2, tags: ["study", "student"] },
  { id: "t48", text: "同学们都有方向了，我还在原地转", style: "direct", emotion: "anxious", moodValue: 2, tags: ["study", "student", "future"] },
  { id: "t49", text: "论文写不出来，光标闪了一晚上", style: "scene", emotion: "anxious", moodValue: 2, tags: ["study", "student"] },
  { id: "t50", text: "考完试走出教室那一刻，天好蓝", style: "scene", emotion: "hopeful", moodValue: 4, tags: ["study", "student"] },

  // --- 健康 ---
  { id: "t51", text: "身体发出的信号，越来越不敢忽略了", style: "direct", emotion: "anxious", moodValue: 2, tags: ["health"] },
  { id: "t52", text: "吃了药还是睡不着的夜晚", style: "scene", emotion: "tired", moodValue: 1, tags: ["health", "mental-health-aware"] },
  { id: "t53", text: "体检报告都不敢自己一个人看", style: "direct", emotion: "anxious", moodValue: 2, tags: ["health"] },
  { id: "t54", text: "连续头疼的第三天", style: "direct", emotion: "tired", moodValue: 1, tags: ["health"] },
  { id: "t55", text: "身体在说停下来，脑子不答应", style: "metaphor", emotion: "tired", moodValue: 2, tags: ["health", "work"] },

  // --- 社交 ---
  { id: "t56", text: "聚会上笑得最大声的人，回家最安静", style: "scene", emotion: "melancholy", moodValue: 2, tags: ["social"] },
  { id: "t57", text: "朋友越来越少，不是走散了，是不敢打扰", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["social"] },
  { id: "t58", text: "收到群消息没有想回的欲望", style: "direct", emotion: "numb", moodValue: 3, tags: ["social"] },
  { id: "t59", text: "社交电量耗尽，需要独处充电", style: "metaphor", emotion: "tired", moodValue: 3, tags: ["social"] },
  { id: "t60", text: "朋友圈越来越不想发了", style: "direct", emotion: "numb", moodValue: 3, tags: ["social"] },

  // --- 未来/自我 ---
  { id: "t61", text: "二十五岁了，还是不知道自己想要什么", style: "direct", emotion: "anxious", moodValue: 2, tags: ["future", "young-adult"] },
  { id: "t62", text: "所有人都在赶路，只有我在问去哪", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["future"] },
  { id: "t63", text: "计划赶不上变化，变化赶不上焦虑", style: "direct", emotion: "anxious", moodValue: 2, tags: ["future"] },
  { id: "t64", text: "简历改了十遍，自我介绍还是不知道怎么写", style: "scene", emotion: "anxious", moodValue: 2, tags: ["future", "work"] },
  { id: "t65", text: "梦想这个词开始让人心虚了", style: "direct", emotion: "melancholy", moodValue: 2, tags: ["future"] },
  { id: "t66", text: "不知道自己是在成长还是在麻木", style: "question", emotion: "numb", moodValue: 2, tags: ["identity"] },
  { id: "t67", text: "活成了小时候不喜欢的那种大人", style: "direct", emotion: "heavy", moodValue: 1, tags: ["identity"] },
  { id: "t68", text: "戴了太久面具，不确定哪个是真的自己", style: "metaphor", emotion: "numb", moodValue: 2, tags: ["identity"] },

  // --- 认知模式（高焦虑用户）---
  { id: "t69", text: "又在想最坏的情况了", style: "direct", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "t70", text: "脑子里的声音今晚特别吵", style: "direct", emotion: "anxious", moodValue: 1, tags: ["high-anxiety"] },
  { id: "t71", text: "想关掉脑子但找不到开关", style: "metaphor", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "t72", text: "反复确认了三遍门锁和闹钟", style: "scene", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "t73", text: "道理都懂，但焦虑不听道理", style: "direct", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "t74", text: "在脑子里排练了明天所有可能出错的场景", style: "scene", emotion: "anxious", moodValue: 2, tags: ["high-anxiety"] },
  { id: "t75", text: "焦虑到连焦虑本身都让我焦虑", style: "direct", emotion: "anxious", moodValue: 1, tags: ["high-anxiety"] },

  // --- 微观时刻（通用，触动人心）---
  { id: "t76", text: "半夜醒来，看了一眼手机，3:47", style: "scene", emotion: "numb", moodValue: 3 },
  { id: "t77", text: "听到楼上的脚步声，原来不只我没睡", style: "scene", emotion: "calm", moodValue: 3 },
  { id: "t78", text: "雨打在窗户上，像有人在轻轻敲", style: "scene", emotion: "calm", moodValue: 4 },
  { id: "t79", text: "被子里找到了白天丢失的安全感", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "t80", text: "闭上眼，今天所有的脸一个一个飘过", style: "scene", emotion: "calm", moodValue: 3 },
  { id: "t81", text: "外卖小哥说了句注意身体，忽然鼻酸", style: "scene", emotion: "warm", moodValue: 3 },
  { id: "t82", text: "等红绿灯的时候忽然想通了一件事", style: "scene", emotion: "hopeful", moodValue: 4 },
  { id: "t83", text: "洗完澡出来，镜子上的雾慢慢散了", style: "scene", emotion: "calm", moodValue: 4 },
  { id: "t84", text: "今天第一次笑是在地铁上看到小孩摔了一跤又自己爬起来", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "t85", text: "睡前把手机翻了个面，屏幕朝下", style: "scene", emotion: "calm", moodValue: 4 },

  // --- 心理健康友好 ---
  { id: "t86", text: "今天的药按时吃了，这就够了", style: "direct", emotion: "calm", moodValue: 3, tags: ["mental-health-aware"] },
  { id: "t87", text: "跟咨询师说出口的那一刻，哭了", style: "scene", emotion: "hopeful", moodValue: 3, tags: ["mental-health-aware"] },
  { id: "t88", text: "坏的日子会过去，好的日子会来，普通的日子最多", style: "literary", emotion: "calm", moodValue: 3, tags: ["mental-health-aware"] },
  { id: "t89", text: "允许自己今天只做到了60分", style: "direct", emotion: "calm", moodValue: 3, tags: ["mental-health-aware"] },
  { id: "t90", text: "开始学着跟自己的情绪打招呼而不是打架", style: "metaphor", emotion: "hopeful", moodValue: 4, tags: ["mental-health-aware"] },

  // --- 温暖/希望/生机 ---
  { id: "t91", text: "路过花店，买了一束不知道名字的花", style: "scene", emotion: "alive", moodValue: 5, tags: [] },
  { id: "t92", text: "朋友突然发来一张搞笑图，没有原因", style: "scene", emotion: "warm", moodValue: 5 },
  { id: "t93", text: "阳台上的植物又长了一片叶子", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "t94", text: "风吹过的时候整个人轻了一点", style: "scene", emotion: "hopeful", moodValue: 4 },
  { id: "t95", text: "今天的天空是好看的那种蓝", style: "scene", emotion: "alive", moodValue: 5 },
  { id: "t96", text: "走在路上忽然闻到小时候的味道", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "t97", text: "泡了杯热茶，暖意从手心传到心里", style: "scene", emotion: "warm", moodValue: 4 },
  { id: "t98", text: "听到一首歌正好是现在的心情", style: "scene", emotion: "calm", moodValue: 4 },
  { id: "t99", text: "有人记得你说过的一句无关紧要的话", style: "scene", emotion: "warm", moodValue: 5 },
  { id: "t100", text: "今天没有什么特别的事，但就是觉得还好", style: "direct", emotion: "calm", moodValue: 4 },
];

// 情绪颜色映射
export const EMOTION_COLORS: Record<MoodEmotion, string> = {
  heavy: "rgba(90, 115, 180, 0.75)",      // 深蓝灰 — 更饱和
  anxious: "rgba(160, 110, 200, 0.75)",    // 紫 — 更鲜明
  tired: "rgba(180, 145, 100, 0.65)",      // 暖棕 — 更暖
  numb: "rgba(130, 145, 165, 0.55)",       // 冷灰蓝
  melancholy: "rgba(80, 160, 190, 0.7)",   // 青 — 更清冷
  calm: "rgba(100, 145, 220, 0.7)",        // 蓝 — 更亮
  hopeful: "rgba(220, 180, 80, 0.75)",     // 金 — 更暖亮
  warm: "rgba(210, 140, 90, 0.75)",        // 橙 — 更鲜活
  angry: "rgba(200, 80, 80, 0.75)",        // 红 — 愤怒
  alive: "rgba(80, 190, 120, 0.75)",       // 绿 — 生机
};
