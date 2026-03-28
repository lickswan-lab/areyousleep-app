import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "睡了么 — 你的睡前情绪仪式",
  description: "不是白噪音，不是冥想。帮你在睡前把脑子里的事清空，和睡不着这件事和解。",
};

export default function DownloadPage() {
  return (
    <main className="min-h-dvh bg-[#070b14] text-[#f0e6d3] overflow-x-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        {/* 背景光效 */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(139,170,240,0.1) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-10 -left-16 w-96 h-96 rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(196,139,107,0.04) 0%, transparent 70%)" }} />

        <div className="relative z-10">
          <p className="text-6xl mb-6">🌙</p>
          <h1 className="text-4xl font-light mb-4 tracking-wide">睡了么</h1>
          <p className="text-[#d4be96]/60 text-lg mb-2">你的睡前情绪仪式</p>
          <p className="text-[#d4be96]/30 text-sm max-w-xs mx-auto leading-relaxed mb-10">
            不是白噪音，不是冥想。<br />
            帮你在睡前把脑子里的事清空。
          </p>

          <div className="flex flex-col gap-3 items-center">
            <a href="/"
              className="px-8 py-3.5 rounded-full text-sm font-medium transition-all
                         bg-gradient-to-r from-[#6b8cce] to-[#9678b4] text-white
                         hover:opacity-90 active:scale-95">
              立即使用（网页版）
            </a>
            <p className="text-[#d4be96]/20 text-xs">APK 安卓版即将上线</p>
          </div>
        </div>

        {/* 向下滚动提示 */}
        <div className="absolute bottom-8 text-[#d4be96]/20 text-xs animate-bounce">
          ↓ 了解更多
        </div>
      </section>

      {/* 功能介绍 */}
      <section className="px-6 py-20 max-w-lg mx-auto">
        <h2 className="text-2xl font-light text-center mb-12">为什么是「睡了么」</h2>

        <div className="space-y-12">
          {[
            {
              emoji: "🧠",
              title: "不是让你放松，是帮你卸货",
              desc: "85%的失眠是因为脑子停不下来。写下来，脑子就不用一直记着了。",
            },
            {
              emoji: "🎭",
              title: "337种情绪，总有一个是你",
              desc: "不是冷冰冰的「你的心情如何？」，而是「翻了三遍通讯录没找到能打的电话」。",
            },
            {
              emoji: "🤖",
              title: "AI 不给建议，只是陪你",
              desc: "不说「别想了」「放松点」。像一个凌晨还在回你消息的朋友。",
            },
            {
              emoji: "📊",
              title: "你担心的事，大部分不会发生",
              desc: "每天早上回顾昨晚的担忧。用你自己的数据告诉你：没那么可怕。",
            },
            {
              emoji: "🌙",
              title: "每晚3分钟的关机仪式",
              desc: "不需要30分钟冥想。选个心情，写两句话，做个呼吸，收到一张晚安卡。",
            },
            {
              emoji: "💎",
              title: "DeepSleep 深度陪伴",
              desc: "AI 深度沟通 · 独家定制情绪库 · 更多自定义 · ¥15/月",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-2xl shrink-0 mt-1">{item.emoji}</span>
              <div>
                <h3 className="text-base font-medium mb-1.5 text-[#f0e6d3]">{item.title}</h3>
                <p className="text-sm text-[#d4be96]/40 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 用户画像 */}
      <section className="px-6 py-16 max-w-lg mx-auto">
        <h2 className="text-xl font-light text-center mb-8">谁在用「睡了么」</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: "📚", label: "中学生" },
            { emoji: "🎓", label: "大学生" },
            { emoji: "💼", label: "打工人" },
            { emoji: "🏠", label: "全职父母" },
            { emoji: "🚀", label: "创业者" },
            { emoji: "☕", label: "自由职业" },
          ].map((p) => (
            <div key={p.label} className="py-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-xl block mb-1">{p.emoji}</span>
              <p className="text-xs text-[#d4be96]/50">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <p className="text-2xl font-light mb-3">今晚，试试？</p>
        <p className="text-[#d4be96]/30 text-sm mb-8">3分钟，给脑子做个 skincare</p>
        <a href="/"
          className="inline-block px-10 py-4 rounded-full text-sm font-medium
                     bg-gradient-to-r from-[#6b8cce] to-[#9678b4] text-white
                     hover:opacity-90 active:scale-95 transition-all">
          开始使用
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-[#d4be96]/5">
        <p className="text-[#d4be96]/20 text-xs">© 2026 睡了么 · 你的睡前情绪仪式</p>
      </footer>
    </main>
  );
}
