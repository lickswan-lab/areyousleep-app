// 200个内测邀请码 — DeepSleep 会员 30天
// 格式: SLEEP-XXXX-XXXX (易读易输入)

// 用固定种子生成确定性的邀请码
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function generateCodes(count: number, seed: number): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = seededRandom(seed);
  const codes: string[] = [];
  const seen = new Set<string>();
  while (codes.length < count) {
    let code = "SLEEP-";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(rand() * chars.length)];
    code += "-";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(rand() * chars.length)];
    if (!seen.has(code)) {
      seen.add(code);
      codes.push(code);
    }
  }
  return codes;
}

// 200个固定邀请码（种子固定，每次生成相同结果）
export const INVITE_CODES = generateCodes(200, 20260328);

// 本地已使用的邀请码追踪
const USED_CODES_KEY = "chuangqian_used_codes";

export function getUsedCodes(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USED_CODES_KEY);
  return data ? JSON.parse(data) : [];
}

export function markCodeUsed(code: string): void {
  const used = getUsedCodes();
  if (!used.includes(code)) {
    used.push(code);
    localStorage.setItem(USED_CODES_KEY, JSON.stringify(used));
  }
}

export function isCodeValid(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return INVITE_CODES.includes(normalized) && !getUsedCodes().includes(normalized);
}

export function activateCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  if (!isCodeValid(normalized)) return false;

  markCodeUsed(normalized);

  // 开通 DeepSleep 30天
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  localStorage.setItem("chuangqian_deepsleep", JSON.stringify({
    expiresAt: expiresAt.toISOString(),
    source: "invite_code",
    code: normalized,
  }));

  return true;
}
