import { NextResponse } from "next/server";

const API_KEY = process.env.KIMI_API_KEY;
const API_URL = "https://api.moonshot.cn/v1/chat/completions";

interface ExploreRequest {
  action: "explore";
  cardName: string;
  emotion: string;
  profileContext?: string; // age, occupation, concerns summary
}

interface CounselRequest {
  action: "counsel";
  cardName: string;
  emotion: string;
  questions: { question: string; answer: string }[];
}

type RequestBody = ExploreRequest | CounselRequest;

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    if (!API_KEY) {
      // Fallback without AI
      if (body.action === "explore") {
        return NextResponse.json({
          questions: getDefaultQuestions(body.emotion),
        });
      } else {
        return NextResponse.json({
          response: getDefaultCounsel(body.emotion),
        });
      }
    }

    if (body.action === "explore") {
      return handleExplore(body);
    } else if (body.action === "counsel") {
      return handleCounsel(body);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleExplore(body: ExploreRequest) {
  const systemPrompt = `你是一个温柔的深夜心理陪伴助手。用户选择了一张情绪卡片，你需要通过 3 个温柔的问题帮助他们更深入地认识自己此刻的情绪。

规则：
- 每个问题要温柔、不说教、不评判
- 每个问题提供 3 个可选的回答选项，选项要具体且贴近生活
- 问题从浅入深，第一个最轻松，最后一个稍微深入
- 用中文回复
- 严格按 JSON 格式回复`;

  const userPrompt = `用户选择了情绪卡片："${body.cardName}"（情绪类型：${body.emotion}）
${body.profileContext ? `用户背景：${body.profileContext}` : ""}

请生成 3 个问题，每个问题带 3 个选项。严格按以下 JSON 格式回复：
{
  "questions": [
    {
      "question": "问题文本",
      "options": ["选项1", "选项2", "选项3"]
    }
  ]
}`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return NextResponse.json({ questions: parsed.questions });
      }
    }

    // Fallback
    return NextResponse.json({ questions: getDefaultQuestions(body.emotion) });
  } catch {
    return NextResponse.json({ questions: getDefaultQuestions(body.emotion) });
  }
}

async function handleCounsel(body: CounselRequest) {
  const systemPrompt = `你是一个温柔的深夜心理陪伴助手。用户刚刚回答了几个关于自己情绪的问题，你需要基于他们的回答给出温暖的心理支持。

规则：
- 150字以内
- 不说教、不给建议、不评判
- 像深夜最好的朋友一样说话
- 承认他们的感受，让他们觉得被理解
- 用中文回复
- 直接回复文本，不要用 JSON`;

  const qaPairs = body.questions.map((qa, i) =>
    `问题${i + 1}: ${qa.question}\n回答: ${qa.answer}`
  ).join("\n\n");

  const userPrompt = `用户选择了情绪卡片："${body.cardName}"（情绪类型：${body.emotion}）

他们回答了以下问题：
${qaPairs}

请给出温柔的回应。`;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        temperature: 0.85,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ response: content || getDefaultCounsel(body.emotion) });
  } catch {
    return NextResponse.json({ response: getDefaultCounsel(body.emotion) });
  }
}

// ===== Fallback content =====

function getDefaultQuestions(emotion: string) {
  const defaults: Record<string, { question: string; options: string[] }[]> = {
    anxious: [
      { question: "这种焦虑是从什么时候开始的？", options: ["今天突然的", "最近一直有", "说不清，好像一直都在"] },
      { question: "身体有什么感觉？", options: ["胸口闷闷的", "心跳有点快", "肩膀很紧"] },
      { question: "如果焦虑有颜色，你觉得是什么色？", options: ["灰紫色", "深红色", "模糊的白色"] },
    ],
    heavy: [
      { question: "这种沉重感最像什么？", options: ["背了一天的书包", "胸口压了块石头", "说不清，就是沉"] },
      { question: "今天有没有一个瞬间让你特别难受？", options: ["有，想起来了", "没有特别的，就是一直这样", "太多了不知道选哪个"] },
      { question: "此刻最想做什么？", options: ["什么都不想做", "想有个人陪", "想大哭一场"] },
    ],
    tired: [
      { question: "今天最累的是哪个部分？", options: ["身体很累", "心很累", "都累"] },
      { question: "有没有一件事一直在消耗你？", options: ["有，但没法停下来", "太多了", "说不清楚"] },
      { question: "此刻身体哪里最需要被关心？", options: ["肩膀和脖子", "眼睛", "整个人"] },
    ],
    numb: [
      { question: "麻木的感觉持续多久了？", options: ["就今天", "好几天了", "好像很久了"] },
      { question: "有没有什么事让你稍微有点感觉？", options: ["有，但很微弱", "完全没有", "不想去想"] },
      { question: "如果可以选，你想感受到什么？", options: ["平静就好", "想感受到开心", "什么都行，有感觉就行"] },
    ],
    melancholy: [
      { question: "这种忧伤跟什么有关？", options: ["想念某个人", "对生活的感叹", "说不清楚"] },
      { question: "最近有没有一个画面一直在脑海里？", options: ["有", "没有特别的", "太多了"] },
      { question: "如果能给此刻配一首歌，是什么感觉的？", options: ["安静的钢琴曲", "有点伤感的老歌", "下雨天的白噪音"] },
    ],
    calm: [
      { question: "这份平静是怎么来的？", options: ["忙完了终于歇下来", "本来就还好", "说不上来，就是安静了"] },
      { question: "想在这份平静里做什么？", options: ["什么都不做", "听听音乐", "想想明天的事"] },
      { question: "希望这种感觉持续到明天吗？", options: ["当然", "随它去吧", "不敢奢望"] },
    ],
    hopeful: [
      { question: "是什么让你有了一点希望？", options: ["发生了好事", "忽然想通了", "说不清，就是感觉还行"] },
      { question: "想把这种感觉分享给谁？", options: ["一个特别的人", "自己留着就好", "发个朋友圈"] },
      { question: "明天想做的第一件事是？", options: ["早起看看天", "好好吃一顿早饭", "还没想好，但不焦虑"] },
    ],
    warm: [
      { question: "今天的温暖来自哪里？", options: ["一个人的善意", "自己做到了某件事", "一个意外的惊喜"] },
      { question: "想用什么方式记住这一刻？", options: ["写下来", "记在心里就好", "拍张照"] },
      { question: "如果给今天打分，几分？", options: ["8分", "9分", "满分"] },
    ],
    angry: [
      { question: "这个愤怒是对谁的？", options: ["对别人", "对自己", "对这个世界"] },
      { question: "身体现在是什么状态？", options: ["拳头是紧的", "呼吸有点急", "胃在翻涌"] },
      { question: "如果可以大声说一句话，你想说什么？", options: ["够了！", "为什么是我？", "我不想忍了"] },
    ],
    alive: [
      { question: "是什么让你感觉活着？", options: ["做了喜欢的事", "见了想见的人", "就是莫名觉得还不错"] },
      { question: "这种感觉在身体的哪里？", options: ["胸口暖暖的", "嘴角是上扬的", "整个人都轻了"] },
      { question: "希望明天也是这样吗？", options: ["希望", "不贪心，今天就够了", "明天的事明天说"] },
    ],
  };

  return defaults[emotion] || defaults.calm;
}

function getDefaultCounsel(emotion: string): string {
  const defaults: Record<string, string> = {
    anxious: "焦虑说明你在乎很多东西，这不是坏事。今晚先把那些担心的事放在这里，让自己的身体先休息。明天的事，明天的你会处理的。",
    heavy: "嗯，今晚确实沉了一些。你不需要现在就想明白，也不需要马上好起来。就这样安静待一会儿，让夜晚陪着你就好。",
    tired: "你今天已经够努力了。这种累不是因为你不够好，是因为你给出去的太多了。今晚什么都不用做了，躺着就是最大的事。",
    numb: "什么都不想感受也没关系。你不需要逼自己有情绪，也不需要解释为什么是这样。就让自己待着，这已经很好了。",
    melancholy: "有些夜晚就是会忧伤一点。这很正常，也很真实。不需要赶走它，就让它安安静静地陪你一会儿。",
    calm: "能在睡前感到平静，是一件很珍贵的事。好好享受这一刻吧，你值得这样的安宁。",
    hopeful: "你心里的那一点光是真实的。哪怕很小很微弱，也足够照亮今晚了。带着它入睡吧。",
    warm: "今天有些温暖的东西留下来了。记住这个感觉，它是属于你的。晚安。",
    angry: "愤怒是一种力量，它说明你有想守护的东西。今晚先让这股火放在安全的地方，不用急着灭掉它。你的感受是对的。",
    alive: "能感受到活着的感觉真好。这一天值得被记住。好好休息，让明天也有这样的可能。",
  };
  return defaults[emotion] || defaults.calm;
}
