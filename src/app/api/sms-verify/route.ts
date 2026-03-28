import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "请填写完整" }, { status: 400 });
    }

    // 从 cookie 读取验证码
    const storedCode = req.cookies.get(`sms_${phone}`)?.value;

    if (!storedCode) {
      return NextResponse.json({ error: "请先获取验证码" }, { status: 400 });
    }

    if (storedCode !== code) {
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    // 验证成功，清除 cookie
    const response = NextResponse.json({ success: true, phone });
    response.cookies.delete(`sms_${phone}`);
    return response;
  } catch {
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}
