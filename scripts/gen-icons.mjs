import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

function drawIcon(size, maskable) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Background
  ctx.fillStyle = '#070b14';
  if (maskable) {
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const scale = maskable ? 0.65 : 0.85;
  const r = (size / 2) * scale;

  // Moon glow
  const glow = ctx.createRadialGradient(
    cx - r * 0.15, cy - r * 0.1, r * 0.2,
    cx - r * 0.15, cy - r * 0.1, r * 1.3
  );
  glow.addColorStop(0, 'rgba(240, 230, 211, 0.12)');
  glow.addColorStop(0.5, 'rgba(240, 230, 211, 0.04)');
  glow.addColorStop(1, 'rgba(240, 230, 211, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Crescent moon
  const moonR = r * 0.52;
  const moonCx = cx - r * 0.05;
  const moonCy = cy - r * 0.02;
  const cutR = moonR * 0.82;
  const cutOffsetX = moonR * 0.55;
  const cutOffsetY = -moonR * 0.25;

  ctx.beginPath();
  ctx.arc(moonCx, moonCy, moonR, 0, Math.PI * 2);
  ctx.arc(moonCx + cutOffsetX, moonCy + cutOffsetY, cutR, 0, Math.PI * 2, true);
  ctx.closePath();

  const moonGrad = ctx.createLinearGradient(
    moonCx - moonR, moonCy - moonR,
    moonCx + moonR, moonCy + moonR
  );
  moonGrad.addColorStop(0, '#f5ede0');
  moonGrad.addColorStop(0.5, '#f0e6d3');
  moonGrad.addColorStop(1, '#e8dcc6');
  ctx.fillStyle = moonGrad;
  ctx.fill('evenodd');

  // Stars
  const stars = [
    { x: 0.30, y: 0.25, s: 0.012, o: 0.6 },
    { x: 0.72, y: 0.32, s: 0.008, o: 0.4 },
    { x: 0.65, y: 0.68, s: 0.010, o: 0.5 },
    { x: 0.25, y: 0.72, s: 0.007, o: 0.35 },
    { x: 0.78, y: 0.55, s: 0.006, o: 0.3 },
  ];

  stars.forEach(star => {
    const sx = cx + (star.x - 0.5) * size * scale;
    const sy = cy + (star.y - 0.5) * size * scale;
    const sr = size * star.s;

    ctx.fillStyle = `rgba(240, 230, 211, ${star.o})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

const configs = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-192.png', size: 192, maskable: true },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

for (const cfg of configs) {
  const canvas = drawIcon(cfg.size, cfg.maskable);
  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(publicDir, cfg.name), buf);
  console.log(`✓ ${cfg.name} (${buf.length} bytes)`);
}

console.log('\nAll icons generated in public/');
