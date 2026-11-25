import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-CJdfWsUb.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-Cf9-4bPe.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
function pesos(php) {
	const whole = Math.abs(php - Math.round(php)) < .001;
	return `₱${php.toLocaleString("en-PH", {
		minimumFractionDigits: whole ? 0 : 2,
		maximumFractionDigits: 2
	})}`;
}
function tokenValue(tokens) {
	return pesos(tokens / 10);
}
function ago(iso) {
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return "";
	const s = Math.max(0, Math.round((Date.now() - t) / 1e3));
	if (s < 45) return "just now";
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.round(h / 24);
	if (d < 14) return `${d}d`;
	return new Date(iso).toLocaleDateString("en-PH", {
		month: "short",
		day: "numeric"
	});
}
function normalizeGcash(input) {
	let n = input.replace(/[^\d]/g, "");
	if (n.startsWith("63") && n.length === 12) n = `0${n.slice(2)}`;
	if (!/^09\d{9}$/.test(n)) return null;
	return n;
}
function formatGcash(n) {
	if (n.length !== 11) return n;
	return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
}
function normalizeRef(input) {
	const s = input.replace(/\s+/g, "").toUpperCase();
	if (!/^[A-Z0-9]{6,32}$/.test(s)) return null;
	return s;
}
function payoutScript(username, amountPhp, gcash) {
	return `Hello Admin, I am ${username}, requesting a payout of ₱${amountPhp.toLocaleString("en-PH", { maximumFractionDigits: 0 })} to my GCash number ${formatGcash(gcash)}.`;
}
function errorText(err) {
	if (err instanceof Error && err.message) return err.message;
	if (typeof err === "object" && err && "message" in err) {
		const message = err.message;
		if (typeof message === "string" && message) return message;
	}
	return "Something went wrong. Try again.";
}
//#endregion
export { normalizeGcash as a, pesos as c, formatGcash as i, tokenValue as l, authMiddleware as n, normalizeRef as o, errorText as r, payoutScript as s, ago as t };
