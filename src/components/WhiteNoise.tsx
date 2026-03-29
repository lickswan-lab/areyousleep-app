"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NOISE_TRACKS, TIMER_OPTIONS, getNoiseEngine } from "@/lib/white-noise";

export default function WhiteNoise() {
  const [expanded, setExpanded] = useState(false);
  const [, forceUpdate] = useState(0);
  const engine = getNoiseEngine();

  // Re-render when state changes
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {}; // Don't stop audio on unmount — persist across overlays
  }, []);

  const handleToggle = (id: string) => {
    engine.toggle(id);
    refresh();
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    engine.setMasterVolume(parseFloat(e.target.value));
    refresh();
  };

  const handleTimer = (minutes: number) => {
    if (engine.timerMinutes === minutes) {
      engine.setTimer(null);
    } else {
      engine.setTimer(minutes);
    }
    refresh();
  };

  const isActive = engine.hasActive();

  return (
    <>
      {/* Collapsed: floating button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`fixed bottom-24 right-5 z-30 w-12 h-12 rounded-full flex items-center justify-center
          press-feedback transition-all ${isActive ? "glass-heavy glow-sm" : "glass"}`}
        animate={isActive ? { boxShadow: ["0 0 8px rgba(107,140,206,0.3)", "0 0 16px rgba(107,140,206,0.5)", "0 0 8px rgba(107,140,206,0.3)"] } : {}}
        transition={isActive ? { duration: 2, repeat: Infinity } : {}}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-lg">{isActive ? "🎵" : "🔇"}</span>
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setExpanded(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-40 right-5 left-5 z-30 glass-heavy rounded-3xl p-5 max-w-sm mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-warm-100 text-sm font-medium">白噪音</p>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-warm-300/40 text-xs press-feedback"
                >
                  收起
                </button>
              </div>

              {/* Sound grid */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {NOISE_TRACKS.map((track) => {
                  const playing = engine.isPlaying(track.id);
                  const canPlay = engine.getActiveCount() < 3 || playing;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleToggle(track.id)}
                      disabled={!canPlay}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all press-feedback
                        ${playing
                          ? "glass-heavy ring-1 ring-accent/40 glow-sm"
                          : canPlay
                            ? "glass"
                            : "glass opacity-30"
                        }`}
                    >
                      <span className="text-xl">{track.emoji}</span>
                      <span className={`text-[10px] ${playing ? "text-accent" : "text-warm-300/50"}`}>
                        {track.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Volume */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-warm-300/40 text-xs">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
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
              <div className="flex gap-2">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => handleTimer(opt.minutes)}
                    className={`flex-1 py-2 rounded-xl text-xs transition-all press-feedback
                      ${engine.timerMinutes === opt.minutes
                        ? "glass-heavy text-accent glow-sm"
                        : "glass text-warm-300/50"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Active count hint */}
              {isActive && (
                <p className="text-center text-warm-300/20 text-[10px] mt-3">
                  最多同时播放 3 种声音
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
