// Kimi (Moonshot AI) API 调用层
// 服务端调用，API key 不暴露给客户端

export interface WorryAnalysis {
  category: "work" | "relationship" | "health" | "future" | "self" | "uncontrollable" | "other";
  response: string;
  canControl: boolean;
}

export async function analyzeWorry(content: string): Promise<WorryAnalysis> {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    // 无 API key 时的降级回应
    return {
      category: "other",
      response: "已经记下了。今晚先放在这里，明天再看。",
      canControl: false,
    };
  }

  try {
    const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `你是「床前」App 的睡前助手。用户在睡前写下了让他们担心的事。

你的任务：
1. 将担忧分类为以下之一：work（工作学业）、relationship（人际关系）、health（身体健康）、future（未来规划）、self（自我评价）、uncontrollable（不可控的事）、other
2. 生成一句简短、温暖、有接纳感的回应（不超过25个字）
3. 判断这件事用户是否能控制

回应语气要求：
- 像一个凌晨还在回你消息的好朋友
- 绝对不说"放松""别想了""没什么大不了"这类话
- 不给建议、不说教、不评判
- 承认用户的担心是真实的，同时轻轻提示"今晚先放下"
- 可以用"嗯""我知道了""先放这儿"这种口语

严格输出 JSON 格式（不要输出其他内容）：
{"category": "...", "response": "...", "canControl": true/false}`,
          },
          {
            role: "user",
            content: `用户的担忧：${content}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Kimi API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    // 尝试解析 JSON
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as WorryAnalysis;
    }

    throw new Error("Invalid response format");
  } catch (e) {
    console.error("Kimi API error:", e);
    // 降级：返回通用温暖回应
    return {
      category: "other",
      response: "嗯，记下了。今晚先放在这里。",
      canControl: false,
    };
  }
}

// 类别的中文映射
export const CATEGORY_LABELS: Record<string, string> = {
  work: "工作学业",
  relationship: "人际关系",
  health: "身体健康",
  future: "未来规划",
  self: "自我评价",
  uncontrollable: "不可控的事",
  other: "其他",
};
