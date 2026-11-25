import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as formatGcash } from "./format-CJdfWsUb.mjs";
import { t as palette } from "./palette-YJBCuM7G.mjs";
import { c as Pause, s as Play } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payout-film-DsIdsW7H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function wrap(ctx, text, max) {
	const words = text.split(" ");
	const lines = [];
	let line = "";
	for (const word of words) {
		const next = line ? `${line} ${word}` : word;
		if (ctx.measureText(next).width > max && line) {
			lines.push(line);
			line = word;
		} else line = next;
	}
	if (line) lines.push(line);
	return lines;
}
function PayoutFilm({ script, username, amountLabel, gcash }) {
	const canvasRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [spoken, setSpoken] = (0, import_react.useState)(0);
	const playingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		playingRef.current = playing;
	}, [playing]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let raf = 0;
		const started = performance.now();
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const frame = (now) => {
			const t = reduce ? 0 : (now - started) / 1e3;
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
					const energy = playingRef.current ? 1 : .25;
					for (let i = 0; i < bars; i += 1) {
						const bh = 8 + Math.abs(Math.sin(t * 6 + i * .45)) * energy * 36;
						ctx.fillStyle = i % 5 === 0 ? palette.accent : palette.raised;
						ctx.fillRect(20 + i * ((w - 40) / bars), h - 28 - bh, 4, bh);
					}
					ctx.fillStyle = palette.fg;
					ctx.font = "500 13px Outfit, sans-serif";
					wrap(ctx, script, w - 40).slice(0, 4).forEach((line, index) => ctx.fillText(line, 20, 156 + index * 18));
				}
			}
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		return () => cancelAnimationFrame(raf);
	}, [
		amountLabel,
		gcash,
		script,
		username
	]);
	(0, import_react.useEffect)(() => () => window.speechSynthesis?.cancel(), []);
	function toggle() {
		if (typeof window === "undefined" || !window.speechSynthesis) return;
		if (playing) {
			window.speechSynthesis.cancel();
			setPlaying(false);
			return;
		}
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(script);
		utterance.rate = .92;
		const voice = window.speechSynthesis.getVoices().find((item) => /en-PH/i.test(item.lang)) || window.speechSynthesis.getVoices().find((item) => /^en/i.test(item.lang)) || null;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-video overflow-hidden rounded-xl bg-bg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "h-full w-full"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: toggle,
				className: "absolute bottom-3 left-3 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg",
				children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4" }), playing ? "Stop" : "Play film"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm leading-relaxed",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-fg",
				children: script.slice(0, spoken)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: script.slice(spoken)
			})]
		})]
	});
}
//#endregion
export { PayoutFilm as t };
