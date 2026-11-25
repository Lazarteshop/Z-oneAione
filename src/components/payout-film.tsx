import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { palette } from "@/lib/palette";
import { formatGcash } from "@/lib/format";

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function PayoutFilm({
  script,
  username,
  amountLabel,
  gcash,
}: {
  script: string;
  username: string;
  amountLabel: string;
  gcash: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const [spoken, setSpoken] = useState(0);
  const playingRef = useRef(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    const started = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = (now: number) => {
      const t = reduce ? 0 : (now - started) / 1000;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 2 && h > 2) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = palette.bg;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = palette.line;
          ctx.strokeRect(10, 10, w - 20, h - 20);
          ctx.fillStyle = palette.muted;
          ctx.font = "600 11px Outfit, sans-serif";
          ctx.fillText("PAYOUT FILM", 20, 32);
          ctx.fillStyle = palette.accent;
          ctx.font = "600 36px Fraunces, serif";
          ctx.fillText(amountLabel, 20, 78);
          ctx.fillStyle = palette.fg;
          ctx.font = "500 14px Outfit, sans-serif";
          ctx.fillText(username, 20, 104);
          ctx.fillStyle = palette.muted;
          ctx.fillText(formatGcash(gcash), 20, 124);
          const bars = 28;
          const energy = playingRef.current ? 1 : 0.25;
          for (let i = 0; i < bars; i += 1) {
            const wave = Math.abs(Math.sin(t * 6 + i * 0.45)) * energy;
            const bh = 8 + wave * 36;
            ctx.fillStyle = i % 5 === 0 ? palette.accent : palette.raised;
            ctx.fillRect(20 + i * ((w - 40) / bars), h - 28 - bh, 4, bh);
          }
          ctx.fillStyle = palette.fg;
          ctx.font = "500 13px Outfit, sans-serif";
          const lines = wrap(ctx, script, w - 40).slice(0, 4);
          lines.forEach((line, index) => ctx.fillText(line, 20, 156 + index * 18));
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [amountLabel, gcash, script, username]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggle() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.92;
    const voice =
      window.speechSynthesis.getVoices().find((item) => /en-PH/i.test(item.lang)) ||
      window.speechSynthesis.getVoices().find((item) => /^en/i.test(item.lang)) ||
      null;
    if (voice) utterance.voice = voice;
    utterance.onboundary = (event) => {
      if (typeof event.charIndex === "number") setSpoken(event.charIndex);
    };
    utterance.onend = () => {
      setPlaying(false);
      setSpoken(script.length);
    };
    setSpoken(0);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-bg">
        <canvas ref={canvasRef} className="h-full w-full" />
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-3 left-3 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg"
        >
          {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
          {playing ? "Stop" : "Play film"}
        </button>
      </div>
      <p className="text-sm leading-relaxed">
        <span className="text-fg">{script.slice(0, spoken)}</span>
        <span className="text-muted">{script.slice(spoken)}</span>
      </p>
    </div>
  );
}
