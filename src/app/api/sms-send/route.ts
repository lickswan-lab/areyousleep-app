import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

async function callAliyunApi(action: string, extraParams: Record<string, string>) {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID!;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET!;

  const params: Record<string, string> = {
    AccessKeyId: accessKeyId,
    Action: action,
    Format: "JSON",
    RegionId: "cn-hangzhou",
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2017-05-25",
    ...extraParams,
  };

  const sortedKeys = Object.keys(params).sort();
  const canonicalQuery = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");

  const stringToSign = `GET&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQuery)}`;
  const signature = crypto
    .createHmac("sha1", accessKeySecret + "&")
    .update(stringToSign)
    .digest("base64");

  const url = `https://dypnsapi.aliyuncs.com/?${canonicalQuery}&Signature=${encodeURIComponent(signature)}`;
  const res = await fetch(url);
  return await res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
    }

    if (!process.env.ALIYUN_ACCESS_KEY_ID) {
      return NextResponse.json({ success: true, demo: true, message: "演示模式，验证码为 123456" });
    }

    const signName = process.env.ALIYUN_SMS_SIGN || "速通互联验证码";
    const templateCode = process.env.ALIYUN_SMS_TEMPLATE || "100001";

    // 让阿里云生成验证码并发送，阿里云会自动存储用于后续 CheckSmsVerifyCode 验证
    const code = String(Math.floor(100000 + Math.random() * 900000));

    const result = await callAliyunApi("SendSmsVerifyCode", {
      PhoneNumber: phone,
      SignName: signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code, min: "5" }),
      CodeLength: "6",
      ValidTime: "300",
      Interval: "60",
    });

    if (result.Code === "OK") {
      // 把验证码存到 cookie（加密），verify 时取出对比
      const response = NextResponse.json({ success: true });
      response.cookies.set(`sms_${phone}`, code, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 300, // 5分钟过期
        path: "/",
      });
      return response;
    } else {
      return NextResponse.json({
        error: result.Message === "check frequency failed"
          ? "发送太频繁，请60秒后再试"
          : (result.Message || "发送失败"),
      }, { status: 400 });
    }
  } catch (e) {
    console.error("SMS error:", e);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
