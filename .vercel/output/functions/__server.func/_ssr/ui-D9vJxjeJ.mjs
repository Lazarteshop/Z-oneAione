import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cn } from "./shell-D_UhZoBT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-D9vJxjeJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Button({ variant = "primary", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50", variant === "primary" && "bg-accent text-accent-ink", variant === "ghost" && "bg-raised text-fg", variant === "danger" && "bg-transparent text-danger ring-1 ring-danger/40", className)
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm text-muted",
				children: hint
			}) : null
		]
	});
}
var inputClass = "h-12 w-full rounded-xl border border-line bg-bg px-3 text-base text-fg outline-none placeholder:text-muted";
function Modal({ title, onClose, children }) {
	const closeRef = (0, import_react.useRef)(onClose);
	closeRef.current = onClose;
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") closeRef.current();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-end sm:place-items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close",
			className: "absolute inset-0 bg-bg/80",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-4 shadow-card sm:max-w-md sm:rounded-3xl sm:p-5",
			children
		})]
	});
}
//#endregion
export { inputClass as i, Field as n, Modal as r, Button as t };
