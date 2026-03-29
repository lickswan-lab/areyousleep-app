"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Article {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: "hyperarousal",
    title: "越努力越睡不着",
    subtitle: "过度觉醒的大脑机制",
    emoji: "🧠",
    content: [
      "你有没有发现：越告诉自己「赶紧睡」，反而越清醒？",
      "这不是你的问题。这是大脑的「过度觉醒」（Hyperarousal）状态——当你命令自己入睡时，大脑把这理解成了一个「任务」，于是它更努力地工作。",
      "就像叫一个人「不要想白熊」，他满脑子都是白熊。越努力入睡，你的交感神经越活跃，皮质醇（压力激素）分泌越多。",
      "所以 CBT-I（认知行为疗法）的核心原则是：不要试图入睡。只是允许自己躺着，做一些让大脑从「工作模式」切换到「待机模式」的事情。",
      "「床前」做的，就是帮你完成这个切换。"
    ],
  },
  {
    id: "counting-sheep",
    title: "为什么数羊没用",
    subtitle: "工作记忆与认知负荷",
    emoji: "🐑",
    content: [
      "数羊为什么不管用？因为它太简单了。",
      "你的大脑有一个「工作记忆」系统，像一个容量有限的桌面。数羊只占用了很小一块空间，剩下的空间还是会被担忧填满。",
      "真正有效的方法需要「恰到好处」的认知负荷——足够占用工作记忆，让担忧没地方放；但又不能太复杂，否则大脑会更兴奋。",
      "这就是为什么「写下担忧」比数羊有效得多：写作占用语言中枢和工作记忆，你的大脑在处理「写」这件事时，没有余力同时担忧。",
      "写完之后，大脑会觉得「这件事已经被处理了」（虽然只是记录下来），于是允许自己放松。"
    ],
  },
  {
    id: "dmn",
    title: "为什么脑子晚上特别活跃",
    subtitle: "默认模式网络的秘密",
    emoji: "🌃",
    content: [
      "白天忙的时候不胡思乱想，一躺下脑子就开始转——这不是错觉。",
      "大脑有一个叫「默认模式网络」（DMN）的系统。当你不做具体任务时，它就自动开始运转：回忆过去、规划未来、分析社交关系。",
      "白天你忙着工作学习，DMN 被抑制。但一躺下，没有任务输入了，DMN 立刻启动，开始「自由联想」——就是那些停不下来的念头。",
      "这是正常的大脑功能，不是你的问题。但对于焦虑型的人来说，DMN 的活跃会触发更多担忧循环。",
      "解决方法不是「压制」它（那会触发过度觉醒），而是给它一个温和的替代任务——比如呼吸聚焦、身体扫描，让 DMN 从「担忧模式」切换到「感知模式」。"
    ],
  },
  {
    id: "sleep-anxiety",
    title: "怕睡不着，所以睡不着",
    subtitle: "睡眠焦虑的恶性循环",
    emoji: "🔄",
    content: [
      "如果你开始害怕上床——不是因为床不舒服，而是因为你知道自己又要辗转反侧——你可能已经陷入了「条件性觉醒」。",
      "原理很简单：你的大脑是一台联想机器。如果你反复在床上经历焦虑和清醒，大脑就会把「床」和「焦虑」绑定在一起。",
      "于是一看到床、一躺下，大脑自动进入战斗状态，心率加快、肌肉紧张——这和「入睡」需要的状态完全相反。",
      "CBT-I 的一个核心技术是「刺激控制」：打破床=焦虑的条件反射，重新建立床=放松的联结。",
      "「床前」帮你做的就是：在躺下之前，用担忧清单和关机引导，把「焦虑处理」这个环节提前到床前完成。这样当你真正躺下时，大脑的焦虑负荷已经被大幅降低了。"
    ],
  },
  {
    id: "worry-reality",
    title: "你担心的事，85%不会发生",
    subtitle: "担忧的真实统计学",
    emoji: "📊",
    content: [
      "宾夕法尼亚州立大学的一项研究发现：人们担忧的事情中，有 85% 最终没有发生。而在发生的 15% 中，79% 的人发现自己处理得比预期好。",
      "也就是说：你担心的事，97% 要么不会发生，要么你完全有能力应对。",
      "但在深夜，你的大脑不会告诉你这个统计数据。它只会放大每一个最坏的可能性。",
      "这就是「床前」设计晨间复盘的原因：当你每天早上回顾昨晚的担忧，标记「没发生」或「已处理」，你在用自己的真实数据训练大脑。",
      "几周之后，当你再在深夜写下担忧时，你的大脑会自动调出过往的数据：「上次担心的那些事，大部分都没发生呢。」"
    ],
  },
];

interface BrainScienceProps {
  onClose: () => void;
}

export default function BrainScience({ onClose }: BrainScienceProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-night-900/98 backdrop-blur-lg overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="px-6 py-12 min-h-dvh">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={selectedArticle ? () => setSelectedArticle(null) : onClose}
            className="text-warm-300/40 text-sm active:text-warm-300/60"
            whileTap={{ scale: 0.95 }}
          >
            ← {selectedArticle ? "返回" : "关闭"}
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedArticle ? (
            /* 文章列表 */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-xl font-light text-warm-100 mb-2">
                为什么你睡不着
              </h2>
              <p className="text-warm-300/40 text-sm mb-8">
                懂了原因，就不那么害怕了
              </p>

              <div className="space-y-3">
                {ARTICLES.map((article, i) => (
                  <motion.button
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedArticle(article)}
                    className="w-full text-left p-5 rounded-2xl bg-night-800/60
                               border border-night-600/30 active:bg-night-700/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{article.emoji}</span>
                      <div>
                        <p className="text-warm-100 text-base mb-0.5">
                          {article.title}
                        </p>
                        <p className="text-warm-300/30 text-sm">
                          {article.subtitle}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* 文章详情 */
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-20"
            >
              <div className="mb-8">
                <span className="text-3xl mb-3 block">
                  {selectedArticle.emoji}
                </span>
                <h2 className="text-xl font-light text-warm-100 mb-1">
                  {selectedArticle.title}
                </h2>
                <p className="text-warm-300/40 text-sm">
                  {selectedArticle.subtitle}
                </p>
              </div>

              <div className="space-y-5">
                {selectedArticle.content.map((paragraph, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    className="text-warm-200/80 text-base leading-relaxed"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
