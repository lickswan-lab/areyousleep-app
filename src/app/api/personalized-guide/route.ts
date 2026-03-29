import { NextResponse } from "next/server";

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_URL = "https://api.moonshot.cn/v1/chat/completions";
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE = "pFZP5JQG7iQjIQuC4Bku"; // Lily voice

export async function POST(req: Request) {
  try {
    const { emotion, cardName, answers, profileContext } = await req.json();

    // Step 1: 用 Kimi AI 生成个性化引导词
    let guideText = getDefaultGuide(emotion);

    if (KIMI_API_KEY) {
      try {
        const prompt = buildPrompt(emotion, cardName, answers, profileContext);
        const res = await fetch(KIMI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${KIMI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            temperature: 0.85,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
          }),
        });
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.length > 50) {
          guideText = content;
        }
      } catch { /* fall through to default */ }
    }

    // Step 2: 用 ElevenLabs TTS 转为语音
    let audioBase64: string | null = null;

    if (ELEVENLABS_KEY) {
      try {
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: guideText,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.8,
                similarity_boost: 0.6,
                style: 0.3,
              },
            }),
          }
        );

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer();
          audioBase64 = Buffer.from(audioBuffer).toString("base64");
        }
      } catch { /* no audio, text only */ }
    }

    return NextResponse.json({
      text: guideText,
      audio: audioBase64, // base64 encoded MP3, or null
    });
  } catch {
    return NextResponse.json({
      text: getDefaultGuide("calm"),
      audio: null,
    });
  }
}

const SYSTEM_PROMPT = `你是「床前」App 的睡前引导师。你的任务是为用户生成一段个性化的睡前引导词。

规则：
- 200-300字
- 用第二人称"你"
- 语气温柔、缓慢、像深夜的朋友在耳边轻声说话
- 融入用户今晚的具体情绪和回答内容
- 包含呼吸引导元素（"深吸一口气...慢慢呼出来..."）
- 包含身体感受描写（"感受被子的温暖..."）
- 以温柔的晚安结尾
- 不说教、不给建议、不评判
- 每一段之间用省略号或换行隔开，方便朗读时停顿
- 直接输出引导词文本，不要加标题或说明`;

function buildPrompt(emotion: string, cardName: string, answers: string[], profileContext?: string) {
  return `用户今晚选择了情绪卡片「${cardName}」（情绪类型：${emotion}）

用户回答的问题：
${answers.map((a, i) => `问题${i + 1}的回答：${a}`).join("\n")}

${profileContext ? `用户背景：${profileContext}` : ""}

请为这位用户生成一段专属的睡前引导词。这段引导词应该：
1. 呼应用户今晚的具体情绪状态
2. 回应用户的回答内容
3. 引导用户从当前情绪过渡到放松状态
4. 包含呼吸和身体感受引导
5. 以温柔的晚安收尾`;
}

function getDefaultGuide(emotion: string): string {
  const guides: Record<string, string> = {
    anxious: `你今晚的心有点不安，对吗...没关系。

深深地吸一口气...感受空气充满你的胸腔...然后慢慢地呼出来，让那些纠结的思绪跟着呼气一起离开。

再来一次...吸气的时候，想象温暖的光从头顶慢慢流下来...经过你的额头、脸颊、肩膀...像一条温暖的毯子裹住你。

那些让你焦虑的事，此刻它们都在门外面。这扇门已经关上了。今晚，这个房间里只有你和你的呼吸。

感受被子的温度...枕头轻轻托着你的头...你的身体一点点变沉，变软。

明天的事交给明天的你。现在唯一要做的事，就是闭上眼睛。

晚安。你今天已经很努力了。`,

    heavy: `嗯...今晚有些沉。

你不需要现在就想明白什么。把那些重的东西，轻轻放在床边就好。

深深地吸一口气...让空气把你的身体微微撑开...然后慢慢呼出来...像叹了一口很长的气。

就这样...再来一次。

你的肩膀可能不知不觉间耸起来了...现在让它们放下来...沉下去...感受重力温柔地拉着你。

今天发生的那些事...那些让你心里堵着的感受...都是真实的，都是对的。你不需要为此道歉。

把手放在胸口...感受那里的温度。那是你活着的证明。你在这里，这就够了。

闭上眼睛...让夜晚抱住你。晚安。`,

    tired: `累了吧...

什么都不用想了。今天你已经把能做的都做了。

深深吸一口气...然后——呼——全部放掉。

你的身体一定很需要休息...从脚趾开始，让它们一个一个松开...脚踝放松...小腿放松...像融化了一样。

膝盖不用绷着了...大腿、臀部，全部交给床。

你的腰和背...今天它们扛了一整天...现在终于可以放下了。

手臂垂在身体两侧...十个手指松开...

感受被子的柔软...枕头承托着你。

你不需要再撑着了。今晚，世界不需要你坚强。

就这样...一点一点...沉下去...

晚安，好好休息。`,

    calm: `今晚的你看起来很平静...这很好。

让我们把这份平静再延长一会儿。

深深地吸一口气...感受夜晚的安静...慢慢呼出来。

你现在的呼吸是缓慢的、均匀的...就让它保持这样。

感受你的身体...从头到脚...每一个部分都是放松的。

被子包裹着你...像云一样轻...像拥抱一样温暖。

窗外的世界还在运转...但此刻跟你无关。这一刻只属于你。

让思绪像天上的云一样...飘过去就好...不用追它们。

闭上眼睛...听听自己的呼吸...

晚安。带着今晚的平静入睡吧。`,
  };

  return guides[emotion] || guides.calm;
}
