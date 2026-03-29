"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NOISE_TRACKS, TIMER_OPTIONS, getNoiseEngine } from "@/lib/white-noise";

interface WhiteNoisePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhiteNoisePanel({ isOpen, onClose }: WhiteNoisePanelProps) {
  const [, forceUpdate] = useState(0);
  const engine = getNoiseEngine();
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const handleToggle = (id: string) => { engine.toggle(id); refresh(); };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => { engine.setMasterVolume(parseFloat(e.target.value)); refresh(); };
  const handleTimer = (minutes: number) => {
    engine.setTimer(engine.timerMinutes === minutes ? null : minutes);
    refresh();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel sliding from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-[340px] flex flex-col
              safe-top safe-bottom"
            style={{
              background: "linear-gradient(180deg, rgba(15,20,35,0.98), rgba(10,14,26,0.99))",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <div>
                <h2 className="text-warm-100 text-base font-medium">白噪音</h2>
                <p className="text-warm-300/30 text-xs mt-0.5">
                  {engine.hasActive() ? `正在播放 ${engine.getActiveCount()} 种声音` : "选择声音开始播放"}
                </p>
              </div>
              <button onClick={onClose} className="text-warm-300/40 text-sm press-feedback">
                ✕
              </button>
            </div>

            {/* Sound list */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="space-y-2">
                {NOISE_TRACKS.map((track) => {
                  const playing = engine.isPlaying(track.id);
                  const canPlay = engine.getActiveCount() < 3 || playing;
                  return (
                    <button
                      key={track.id}
                      onClick={() => canPlay && handleToggle(track.id)}
                      disabled={!canPlay}
                      className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl transition-all press-feedback
                        ${playing ? "ring-1" : ""}
                        ${!canPlay ? "opacity-30" : ""}`}
                      style={{
                        background: playing
                          ? "linear-gradient(135deg, rgba(107,140,206,0.15), rgba(255,255,255,0.03))"
                          : "rgba(255,255,255,0.03)",
                        borderColor: playing ? "rgba(107,140,206,0.3)" : "transparent",
                        boxShadow: playing ? "0 0 0 1px rgba(107,140,206,0.3)" : undefined,
                      }}
                    >
                      <span className="text-xl w-8 text-center">{track.emoji}</span>
                      <span className={`text-sm ${playing ? "text-accent" : "text-warm-200/60"}`}>
                        {track.name}
                      </span>
                      {playing && (
                        <motion.div
                          className="ml-auto flex gap-0.5"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-0.5 rounded-full bg-accent/60"
                              style={{ height: `${8 + i * 3}px` }} />
                          ))}
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Volume */}
              <div className="mt-6 mb-4">
                <p className="text-warm-300/40 text-xs mb-3">音量</p>
                <div className="flex items-center gap-3">
                  <span className="text-warm-300/40 text-xs">🔈</span>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={engine.masterVolume}
                    onChange={handleVolume}
                    className="flex-1 h-1 rounded-full appearance-none bg-night-600/50
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent/80"
                  />
                  <span className="text-warm-300/40 text-xs">🔊</span>
                </div>
              </div>

              {/* Timer */}
              <div>
                <p className="text-warm-300/40 text-xs mb-3">定时关闭</p>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.minutes}
                      onClick={() => handleTimer(opt.minutes)}
                      className={`flex-1 py-2.5 rounded-xl text-xs transition-all press-feedback
                        ${engine.timerMinutes === opt.minutes
                          ? "glass-heavy text-accent glow-sm"
                          : "glass text-warm-300/40"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {engine.hasActive() && (
                <button
                  onClick={() => { engine.stopAll(); refresh(); }}
                  className="w-full mt-4 py-3 rounded-xl glass text-warm-300/40 text-xs press-feedback"
                >
                  全部停止
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
