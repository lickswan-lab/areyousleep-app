"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SealAnimationProps {
  isVisible: boolean;
  worryText: string;
  onComplete: () => void;
}

// 封存动画：担忧文字飘进盒子，盖上盖子
export default function SealAnimation({
  isVisible,
  worryText,
  onComplete,
}: SealAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-72 flex flex-col items-center">
            {/* 担忧文字 — 飘进盒子 */}
            <motion.p
              className="text-warm-200/80 text-sm text-center mb-8 max-w-56 line-clamp-2"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: 60, scale: 0.6 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeIn" }}
            >
              {worryText}
            </motion.p>

            {/* 盒子 */}
            <div className="relative" style={{ perspective: "600px" }}>
              {/* 盒子主体 */}
              <motion.div
                className="w-48 h-28 rounded-xl border-2 border-accent/30 bg-night-700/80"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  boxShadow: "0 0 40px rgba(107,140,206,0.1)",
                }}
              >
                {/* 盒子里的光 */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(107,140,206,0.15) 0%, transparent 70%)",
                  }}
                />
              </motion.div>

              {/* 盒盖 — 合上 */}
              <motion.div
                className="absolute -top-1 left-0 right-0 h-8 rounded-t-xl border-2 border-accent/30
                           border-b-0 bg-night-600/80"
                style={{ transformOrigin: "bottom center" }}
                initial={{ rotateX: -80 }}
                animate={{ rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1.5,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </div>

            {/* 完成提示 */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3 }}
            >
              <p className="text-warm-200/60 text-sm">已放好了</p>
              <p className="text-warm-300/40 text-xs mt-1">明天早上再来看</p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="mt-6 px-6 py-2.5 rounded-full bg-night-700/80 border border-night-600/50
                           text-warm-200/60 text-sm active:bg-night-600/50 transition-colors"
              >
                好的
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
