import { NextRequest, NextResponse } from "next/server";
import { analyzeWorry } from "@/lib/kimi";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "请写下你的担忧" },
        { status: 400 }
      );
    }

    // 截断过长输入
    const trimmed = content.trim().slice(0, 500);
    const analysis = await analyzeWorry(trimmed);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(
      {
        category: "other",
        response: "嗯，记下了。今晚先放在这里。",
        canControl: false,
      },
      { status: 200 } // 即使出错也返回200，不让用户看到错误
    );
  }
}
