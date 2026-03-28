import { NextRequest, NextResponse } from "next/server";
import { MOOD_DESCRIPTIONS } from "@/lib/mood-descriptions";

export async function POST(req: NextRequest) {
  try {
    const { history, seenIds, lastBatchIds } = await req.json() as {
      history: string[];      // 用户最近选过的描述ID
      seenIds: string[];      // 已见过的所有描述ID
      lastBatchIds: string[]; // 上一批的ID（避免连续重复）
    };

    const apiKey = process.env.KIMI_API_KEY;
    const pool = MOOD_DESCRIPTIONS.filter((d) => !lastBatchIds.includes(d.id));

    // 未见过的描述
    const unseen = pool.filter((d) => !seenIds.includes(d.id));
    const seenPool = pool.filter((d) => seenIds.includes(d.id));

    let aiPicks: string[] = [];

    // 尝试 AI 推荐
    if (apiKey && history.length >= 2) {
      try {
        const historyTexts = history.slice(0, 5).map((id) => {
          const d = MOOD_DESCRIPTIONS.find((m) => m.id === id);
          return d ? `${d.id}:「${d.text}」(${d.emotion})` : "";
        }).filter(Boolean);

        // 候选池：排除上一批，取20个候选
        const candidates = pool.slice(0, 30).map((d) =>
          `${d.id}:「${d.text}」(${d.emotion},${d.style})`
        );

        const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            temperature: 0.8,
            messages: [
              {
                role: "system",
                content: `你是一个情绪感知助手。根据用户最近选择的情绪状态，从候选列表中选出2个最可能契合用户当前状态的描述。
注意：
1. 考虑情绪连续性（如果用户近期都选焦虑类，可能仍然焦虑）
2. 但也要有惊喜（不要总是推荐同一类型，可以选一个稍不同但可能引起共鸣的）
3. 优先选择 style 不同的两个（比如一个direct一个metaphor）

严格输出 JSON：{"ids": ["xxx", "yyy"]}`,
              },
              {
                role: "user",
                content: `用户最近选择：${historyTexts.join("、")}

候选列表：
${candidates.join("\n")}`,
              },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          const match = text?.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed.ids)) {
              // 验证 ID 存在
              aiPicks = parsed.ids
                .filter((id: string) => pool.some((d) => d.id === id))
                .slice(0, 2);
            }
          }
        }
      } catch {
        // AI 失败，降级为纯随机
      }
    }

    // 组装最终 4 条
    const result: string[] = [...aiPicks];
    const usedIds = new Set(result);

    // 确保至少 2 条未见过的
    const unseenShuffled = [...unseen].sort(() => Math.random() - 0.5);
    const neededUnseen = Math.max(2, 4 - result.length);
    for (const d of unseenShuffled) {
      if (result.length >= 4) break;
      if (!usedIds.has(d.id)) {
        result.push(d.id);
        usedIds.add(d.id);
      }
    }

    // 如果未见不够，从已见池补充
    if (result.length < 4) {
      const fallback = [...(unseen.length > 0 ? unseen : seenPool)]
        .sort(() => Math.random() - 0.5);
      for (const d of fallback) {
        if (result.length >= 4) break;
        if (!usedIds.has(d.id)) {
          result.push(d.id);
          usedIds.add(d.id);
        }
      }
    }

    // 再兜底
    if (result.length < 4) {
      for (const d of pool.sort(() => Math.random() - 0.5)) {
        if (result.length >= 4) break;
        if (!usedIds.has(d.id)) {
          result.push(d.id);
          usedIds.add(d.id);
        }
      }
    }

    // 确保覆盖至少 2 种 emotion 和 2 种 style
    const resultDescs = result.map((id) => MOOD_DESCRIPTIONS.find((d) => d.id === id)!).filter(Boolean);
    const emotions = new Set(resultDescs.map((d) => d.emotion));
    const styles = new Set(resultDescs.map((d) => d.style));

    // 如果多样性不够，尝试替换最后一个
    if (emotions.size < 2 || styles.size < 2) {
      const diverse = pool
        .filter((d) => !usedIds.has(d.id))
        .find((d) => !emotions.has(d.emotion) || !styles.has(d.style));
      if (diverse && result.length >= 4) {
        result[result.length - 1] = diverse.id;
      }
    }

    return NextResponse.json({ ids: result.slice(0, 4) });
  } catch {
    // 完全降级：随机4个
    const shuffled = [...MOOD_DESCRIPTIONS].sort(() => Math.random() - 0.5);
    return NextResponse.json({
      ids: shuffled.slice(0, 4).map((d) => d.id),
    });
  }
}
