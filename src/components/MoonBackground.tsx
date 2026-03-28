"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Night mode data ---

// Stars: 3 sizes (20 total)
const STARS = [
  // Small (1px) x12
  ...Array.from({ length: 12 }, (_, i) => ({
    size: 1, x: 10 + ((i * 37) % 80), y: 5 + ((i * 23) % 60),
    opacity: [0.08, 0.3, 0.08] as number[], dur: 3 + (i % 3) * 2, delay: i * 0.4, glow: false,
  })),
  // Medium (2px) x5
  ...Array.from({ length: 5 }, (_, i) => ({
    size: 2, x: 15 + ((i * 53) % 70), y: 8 + ((i * 41) % 55),
    opacity: [0.1, 0.45, 0.1] as number[], dur: 4 + (i % 2) * 3, delay: i * 0.7, glow: false,
  })),
  // Large (3px, with cross glow) x3
  ...Array.from({ length: 3 }, (_, i) => ({
    size: 3, x: 20 + ((i * 67) % 60), y: 10 + ((i * 31) % 50),
    opacity: [0.15, 0.5, 0.15] as number[], dur: 5 + i * 2, delay: i * 1.2, glow: true,
  })),
];

// Floating particles (night)
const PARTICLES = Array.from({ length: 7 }, (_, i) => ({
  x: 5 + ((i * 41) % 90),
  startY: 85 + ((i * 17) % 15),
  dur: 18 + ((i * 7) % 12),
  delay: i * 3,
  opacity: 0.06 + (i % 3) * 0.04,
}));

// Day mode: just 3 faint particles
const DAY_PARTICLES = Array.from({ length: 3 }, (_, i) => ({
  x: 15 + i * 30,
  startY: 80 + i * 5,
  dur: 25 + i * 5,
  delay: i * 4,
  opacity: 0.03 + i * 0.01,
}));

// Constellation definitions (relative coordinates 0-100 for viewBox)
// Each constellation: stars (cx, cy) and lines [fromIdx, toIdx]
const CONSTELLATIONS = [
  {
    // Orion-like (7 stars)
    id: "orion",
    cx: 18, cy: 30, // position on screen (%)
    rotDuration: 90, // seconds per revolution
    stars: [
      { x: 20, y: 5 },   // head
      { x: 15, y: 25 },  // left shoulder
      { x: 25, y: 25 },  // right shoulder
      { x: 17, y: 40 },  // belt left
      { x: 20, y: 40 },  // belt center
      { x: 23, y: 40 },  // belt right
      { x: 14, y: 60 },  // left foot
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [1, 6]] as [number, number][],
  },
  {
    // Big Dipper-like (7 stars)
    id: "dipper",
    cx: 72, cy: 18,
    rotDuration: 120,
    stars: [
      { x: 10, y: 10 },
      { x: 20, y: 8 },
      { x: 30, y: 15 },
      { x: 38, y: 25 },
      { x: 48, y: 28 },
      { x: 55, y: 20 },
      { x: 48, y: 12 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] as [number, number][],
  },
  {
    // Simple triangle (3 stars)
    id: "triangle",
    cx: 45, cy: 55,
    rotDuration: 75,
    stars: [
      { x: 25, y: 10 },
      { x: 10, y: 45 },
      { x: 40, y: 45 },
    ],
    lines: [[0, 1], [1, 2], [2, 0]] as [number, number][],
  },
];

// Nebula clouds
const NEBULAE = [
  { cx: 25, cy: 35, r: 180, color: "rgba(120,80,160,0.04)", dur: 30, delay: 0 },
  { cx: 70, cy: 20, r: 150, color: "rgba(80,100,180,0.035)", dur: 35, delay: 5 },
  { cx: 50, cy: 65, r: 200, color: "rgba(160,80,130,0.03)", dur: 40, delay: 10 },
];

export default function MoonBackground() {
  const [isNight, setIsNight] = useState(true);

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setIsNight(h >= 20 || h < 6);
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence mode="wait">
        {isNight ? <NightMode key="night" /> : <DayMode key="day" />}
      </AnimatePresence>

      {/* Bottom fog -- always present */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(7,11,20,1) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ============================================================
// Day Mode: warm bright sky with soft clouds and light
// ============================================================
function DayMode() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      {/* Monet-inspired sky — layered soft color washes */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              #1a2035 0%,
              #1e2845 20%,
              #1a2540 40%,
              #182238 60%,
              #141c30 100%)`,
        }}
      />

      {/* Monet water-lily warm wash (top-right, like sunset reflection) */}
      <motion.div
        className="absolute -top-10 -right-10 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(220,180,120,0.14) 0%, rgba(240,190,140,0.06) 40%, transparent 70%)",
          willChange: "transform, opacity",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Lavender glow (center, like Monet's purple shadows) */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(140,120,180,0.06) 0%, rgba(120,130,190,0.03) 40%, transparent 60%)",
          willChange: "opacity",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rose-gold bottom glow (water reflection) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: "linear-gradient(to top, rgba(180,140,110,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Soft impressionist color patches — like brushstrokes */}
      {[
        { x: "10%", y: "15%", w: 200, h: 80, color: "rgba(180,160,200,0.04)", dur: 35, rx: 40 },
        { x: "50%", y: "25%", w: 240, h: 70, color: "rgba(200,180,140,0.05)", dur: 40, rx: 35 },
        { x: "20%", y: "45%", w: 180, h: 90, color: "rgba(140,170,190,0.04)", dur: 45, rx: 45 },
        { x: "60%", y: "55%", w: 160, h: 60, color: "rgba(190,160,140,0.035)", dur: 38, rx: 30 },
        { x: "35%", y: "70%", w: 220, h: 75, color: "rgba(160,140,180,0.03)", dur: 42, rx: 38 },
      ].map((patch, i) => (
        <motion.div
          key={`patch-${i}`}
          className="absolute"
          style={{
            left: patch.x,
            top: patch.y,
            width: patch.w,
            height: patch.h,
            borderRadius: patch.rx,
            background: `radial-gradient(ellipse, ${patch.color} 0%, transparent 70%)`,
            willChange: "transform",
          }}
          animate={{ x: ["-3%", "3%", "-3%"], y: ["-2%", "2%", "-2%"] }}
          transition={{ duration: patch.dur, repeat: Infinity, ease: "easeInOut", delay: i * 2 }}
        />
      ))}

      {/* Floating light motes */}
      {DAY_PARTICLES.map((p, i) => (
        <motion.div
          key={`day-p-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.x}%`,
            background: "rgba(240,220,180,0.15)",
            willChange: "transform",
          }}
          initial={{ y: `${p.startY}vh`, opacity: 0 }}
          animate={{
            y: [`${p.startY}vh`, "-5vh"],
            opacity: [0, p.opacity * 3, p.opacity * 3, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
            times: [0, 0.1, 0.85, 1],
          }}
        />
      ))}
    </motion.div>
  );
}

// ============================================================
// Night Mode: full experience
// ============================================================
function NightMode() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      {/* Moon glow (top-right) */}
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,170,240,0.1) 0%, transparent 70%)",
          willChange: "transform, opacity",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Warm glow (bottom-left) */}
      <motion.div
        className="absolute -bottom-10 -left-16 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(196,139,107,0.04) 0%, transparent 70%)",
          willChange: "transform, opacity",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora band */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-48"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(107,140,206,0.02) 30%, rgba(160,112,180,0.015) 60%, transparent 100%)",
          willChange: "transform",
        }}
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Nebula clouds */}
      {NEBULAE.map((n, i) => (
        <motion.div
          key={`nebula-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${n.cx}%`,
            top: `${n.cy}%`,
            width: n.r,
            height: n.r,
            marginLeft: -n.r / 2,
            marginTop: -n.r / 2,
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            willChange: "transform, opacity",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.7, 1, 0.7],
            x: [0, 15, -10, 0],
            y: [0, -10, 8, 0],
          }}
          transition={{
            duration: n.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: n.delay,
          }}
        />
      ))}

      {/* Stars */}
      {STARS.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-warm-200"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            willChange: "opacity",
          }}
          animate={{ opacity: star.opacity }}
          transition={{
            duration: star.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        >
          {star.glow && (
            <div
              className="absolute -inset-2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(240,230,211,0.2) 0%, transparent 70%)",
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Constellations */}
      {CONSTELLATIONS.map((c) => (
        <motion.div
          key={c.id}
          className="absolute"
          style={{
            left: `${c.cx}%`,
            top: `${c.cy}%`,
            width: 120,
            height: 120,
            marginLeft: -60,
            marginTop: -60,
            willChange: "transform",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: c.rotDuration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox="0 0 60 60"
            width="120"
            height="120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Constellation lines */}
            {c.lines.map(([a, b], li) => (
              <line
                key={`${c.id}-l-${li}`}
                x1={c.stars[a].x}
                y1={c.stars[a].y}
                x2={c.stars[b].x}
                y2={c.stars[b].y}
                stroke="rgba(200,210,240,0.08)"
                strokeWidth="0.4"
              />
            ))}
            {/* Constellation stars */}
            {c.stars.map((s, si) => (
              <circle
                key={`${c.id}-s-${si}`}
                cx={s.x}
                cy={s.y}
                r="0.8"
                fill="rgba(220,225,245,0.15)"
              />
            ))}
          </svg>
        </motion.div>
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-0.5 h-0.5 rounded-full bg-warm-200"
          style={{ left: `${p.x}%`, willChange: "transform" }}
          initial={{ y: `${p.startY}vh`, opacity: 0 }}
          animate={{
            y: [`${p.startY}vh`, "-5vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
            times: [0, 0.1, 0.85, 1],
          }}
        />
      ))}
    </motion.div>
  );
}
