"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorryInputProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
}

export default function WorryInput({ onSubmit, isAnalyzing }: WorryInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 自动聚焦，但延迟一下以配合动画
    const timer = setTimeout(() => textareaRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isAnalyzing) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写下来，放在这里..."
        maxLength={500}
        rows={3}
        disabled={isAnalyzing}
        className="w-full bg-night-800/80 border border-night-600/50 rounded-2xl px-5 py-4
                   text-warm-100 text-lg placeholder:text-warm-300/30
                   focus:outline-none focus:border-accent-soft/50 focus:ring-1 focus:ring-accent-soft/20
                   resize-none transition-all duration-300
                   disabled:opacity-50"
      />

      <AnimatePresence>
        {text.trim().length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="absolute right-3 bottom-3 w-10 h-10 rounded-full
                       bg-accent/80 flex items-center justify-center
                       active:scale-95 transition-transform
                       disabled:opacity-50"
          >
            {isAnalyzing ? (
              <motion.div
                className="w-5 h-5 border-2 border-warm-50/30 border-t-warm-50 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
