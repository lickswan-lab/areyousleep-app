"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GuidedAudioPlayerProps {
  title: string;
  subtitle: string;
  emoji: string;
  audioSrc: string;
  color: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function GuidedAudioPlayer({
  title, subtitle, emoji, audioSrc, color, onComplete, onClose
}: GuidedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });
    audio.addEventListener("ended", () => { setIsPlaying(false); onComplete(); });

    return () => { audio.pause(); audio.src = ""; };
  }, [audioSrc, onComplete]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const colorLight = color.replace(/[\d.]+\)$/, "0.15)");
  const colorMid = color.replace(/[\d.]+\)$/, "0.4)");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${colorLight}, rgba(10,14,26,0.98) 60%)` }} />

      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl"
        style={{ background: color }} />

      <div className="relative z-10 flex flex-col flex-1 px-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <button onClick={() => { audioRef.current?.pause(); onClose(); }}
            className="text-warm-300/40 text-sm press-feedback">
            ← 返回
          </button>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-16">
          {/* Emoji with breathing animation */}
          <motion.div
            animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-8"
          >
            {emoji}
          </motion.div>

          <h2 className="text-2xl font-light text-warm-100 mb-2">{title}</h2>
          <p className="text-warm-300/40 text-sm mb-12">{subtitle}</p>

          {/* Progress ring */}
          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke={colorMid}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>

            {/* Play/Pause button in center */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="absolute inset-0 flex flex-col items-center justify-center press-feedback"
            >
              <span className="text-3xl text-warm-100 mb-1">
                {isPlaying ? "⏸" : "▶"}
              </span>
              <span className="text-warm-300/40 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </motion.button>
          </div>

          {/* Status text */}
          <motion.p
            animate={isPlaying ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.4 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-warm-300/40 text-sm"
          >
            {isPlaying ? "正在播放引导..." : "点击开始"}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
