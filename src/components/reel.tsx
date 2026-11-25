import { useEffect, useRef } from "react";
import type { TierId } from "@/lib/catalog";
import { palette } from "@/lib/palette";

function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number, top: string, bottom: string) {
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, top);
  wash.addColorStop(1, bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
}

function lamp(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function alley(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  backdrop(ctx, w, h, "#1c2433", "#07080c");
  const vx = w * 0.52;
  const vy = h * 0.38;
  ctx.fillStyle = "#10141c";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.18);
  ctx.lineTo(vx - 18, vy);
  ctx.lineTo(vx - 8, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w, h * 0.22);
  ctx.lineTo(vx + 18, vy);
  ctx.lineTo(vx + 10, h);
  ctx.lineTo(w, h);
  ctx.fill();

  lamp(ctx, vx, vy - 8, 90, "rgba(226,182,87,0.55)");
  ctx.fillStyle = palette.accent;
  ctx.fillRect(vx - 3, vy - 18, 6, 10);

  ctx.strokeStyle = palette.line;
  ctx.globalAlpha = 0.7;
  for (let i = 1; i <= 7; i += 1) {
    const z = i / 8;
    const y = vy + (h - vy) * z * z;
    const half = 18 + z * w * 0.46;
    ctx.beginPath();
    ctx.moveTo(vx - half, y);
    ctx.lineTo(vx + half, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(238,241,246,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 28; i += 1) {
    const x = ((i * 47 + time * 40) % (w + 20)) - 10;
    const y = ((i * 83 + time * 220) % (h + 30)) - 15;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y + 12);
    ctx.stroke();
  }
}

function harbor(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  backdrop(ctx, w, h, "#12182a", "#070910");
  const horizon = h * 0.46;
  ctx.fillStyle = "#0c1422";
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.strokeStyle = "rgba(226,182,87,0.45)";
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(w, horizon);
  ctx.stroke();

  for (let i = 0; i < 8; i += 1) {
    const x = (i + 0.5) * (w / 8);
    const twinkle = 0.35 + Math.abs(Math.sin(time * 1.4 + i)) * 0.65;
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = i % 2 === 0 ? palette.accent : "#9bb7d4";
    ctx.fillRect(x, horizon - 10 - (i % 3) * 8, 3, 8 + (i % 3) * 6);
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(155,183,212,0.35)";
  for (let i = 0; i < 10; i += 1) {
    const y = horizon + 12 + i * ((h - horizon - 20) / 10);
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 12) {
      const wave = Math.sin(x * 0.03 + time * 1.3 + i) * (3 + i * 0.35);
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  const buoy = w * 0.72;
  const pulse = 0.5 + Math.sin(time * 3) * 0.5;
  lamp(ctx, buoy, horizon + 28, 36 + pulse * 18, `rgba(226,182,87,${0.25 + pulse * 0.35})`);
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(buoy, horizon + 28, 5, 0, Math.PI * 2);
  ctx.fill();
}

function goldroom(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  backdrop(ctx, w, h, "#1a1408", "#090b10");
  lamp(ctx, w * 0.62, h * 0.22, w * 0.55, "rgba(226,182,87,0.38)");

  ctx.fillStyle = "rgba(226,182,87,0.08)";
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.12);
  ctx.lineTo(w * 0.28, h * 0.92);
  ctx.lineTo(w * 0.92, h * 0.92);
  ctx.closePath();
  ctx.fill();

  const cx = w * 0.48;
  const cy = h * 0.62;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 36, cy - 48, 46, 58);
  ctx.strokeRect(cx - 42, cy + 10, 70, 10);
  ctx.beginPath();
  ctx.moveTo(cx + 28, cy + 14);
  ctx.lineTo(cx + 54, cy + 28);
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  for (let i = 0; i < 18; i += 1) {
    const drift = (time * 12 + i * 37) % (h * 0.7);
    const x = (i * 53) % w;
    const y = h * 0.15 + drift;
    ctx.globalAlpha = 0.25 + (i % 5) * 0.1;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}

function chrome(ctx: CanvasRenderingContext2D, w: number, h: number, label: string, time: number) {
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = palette.line;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.fg;
  ctx.font = "600 12px Outfit, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, 18, h - 18);
  ctx.fillStyle = palette.muted;
  ctx.textAlign = "right";
  const sec = String(Math.floor(time % 16)).padStart(2, "0");
  ctx.fillText(`0:${sec}  /  0:16`, w - 18, h - 18);
}

function paint(canvas: HTMLCanvasElement, time: number, tier: TierId) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w < 2 || h < 2) return;
  const nextW = Math.floor(w * dpr);
  const nextH = Math.floor(h * dpr);
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (tier === "pro") harbor(ctx, w, h, time);
  else if (tier === "vip") goldroom(ctx, w, h, time);
  else alley(ctx, w, h, time);
  chrome(ctx, w, h, tier === "vip" ? "VIP" : tier === "pro" ? "PRO" : "STARTER", time);
}

export function Reel({ tier, playing, seed = 0 }: { tier: TierId; playing: boolean; seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(seed);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playing && !reduce) timeRef.current += dt;
      paint(canvas, timeRef.current, tier);
      if (playing && !reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, tier]);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" />;
}
