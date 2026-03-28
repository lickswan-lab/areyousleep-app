"use client";

import { motion } from "framer-motion";

interface MilestoneProps {
  activeDays: number;
  totalWorries: number;
  neverHappenedRate: number;
  onClose: () => void;
}

// 里程碑消息 — 不是打卡激励，是情感认可
function getMilestoneMessage(days: number): { title: string; body: string } | null {
  if (days === 3) return {
    title: "第三个夜晚",
    body: "你已经连续三天在睡前陪自己了。\n很多人第二天就忘了，但你没有。",
  };
  if (days === 7) return {
    title: "一周了",
    body: "你已经陪自己度过了7个夜晚。\n这意味着你开始有了一个属于自己的睡前仪式。\n这比任何助眠产品都管用。",
  };
  if (days === 14) return {
    title: "两周",
    body: "14个夜晚，你一直在做这件事。\n也许你已经发现：\n大多数担忧，天亮了就没那么可怕了。",
  };
  if (days === 30) return {
    title: "一个月",
    body: "30天。你和自己的关系，\n比一个月前更近了一点。\n睡前的这几分钟，是你送给自己的礼物。",
  };
  if (days === 60) return {
    title: "两个月",
    body: "60个夜晚。这不再是一个工具了，\n这已经是你的习惯，你生活的一部分。\n你做到了。",
  };
  if (days === 100) return {
    title: "第一百个夜晚",
    body: "100天前，你下载了这个App，\n因为脑子停不下来。\n现在你可能还是偶尔会这样，\n但你已经知道怎么和它相处了。",
  };
  return null;
}

// 检查是否应该显示里程碑
export function shouldShowMilestone(activeDays: number): boolean {
  return [3, 7, 14, 30, 60, 100].includes(activeDays);
}

export default function Milestone({
  activeDays,
  totalWorries,
  neverHappenedRate,
  onClose,
}: MilestoneProps) {
  const milestone = getMilestoneMessage(activeDays);
  if (!milestone) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="px-8 text-center max-w-sm">
        {/* 光晕 */}
        <motion.div
          className="w-24 h-24 mx-auto mb-8 rounded-full"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            background: "radial-gradient(circle, rgba(240,230,211,0.08) 0%, transparent 70%)",
          }}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-4xl">🌙</span>
          </motion.div>
        </motion.div>

        {/* 标题 */}
        <motion.p
          className="text-warm-400/80 text-xs tracking-widest uppercase mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          里程碑
        </motion.p>

        <motion.h2
          className="text-2xl font-light text-warm-100 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {milestone.title}
        </motion.h2>

        <motion.p
          className="text-warm-200/60 text-base leading-relaxed mb-8 whitespace-pre-line"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {milestone.body}
        </motion.p>

        {/* 数据 */}
        {totalWorries > 0 && (
          <motion.div
            className="flex justify-center gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="text-center">
              <p className="text-warm-400 text-xl font-light">{totalWorries}</p>
              <p className="text-warm-300/30 text-xs mt-1">件担忧</p>
            </div>
            {neverHappenedRate > 0 && (
              <div className="text-center">
                <p className="text-warm-400 text-xl font-light">
                  {Math.round(neverHappenedRate * 100)}%
                </p>
                <p className="text-warm-300/30 text-xs mt-1">没发生</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-warm-400 text-xl font-light">{activeDays}</p>
              <p className="text-warm-300/30 text-xs mt-1">个夜晚</p>
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-night-700/80 border border-night-600/50
                     text-warm-200/60 text-sm active:bg-night-600/50 transition-colors"
        >
          继续今晚的仪式
        </motion.button>
      </div>
    </motion.div>
  );
}
