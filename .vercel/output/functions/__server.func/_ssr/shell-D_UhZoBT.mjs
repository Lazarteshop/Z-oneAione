import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { l as tokenValue, n as authMiddleware } from "./format-CJdfWsUb.mjs";
import { f as Clapperboard, i as Shield, r as Store, t as Wallet } from "../_libs/lucide-react.mjs";
import { i as signOut, t as authClient } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-CUNXgMg-.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-D_UhZoBT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("542db4303661f278e0581ac2429bc4def67d6152c874136a43bc4bc3c51fc1a3"));
var getFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("faff7ef5248d7cfac25c04f3abb0691b225854e6b5583f2dff34577c0bd81409"));
var getShop = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("de6f521b7f7740af96d36f2012615298dd04ead81b29da3af5567e4372db8cc7"));
var submitPurchase = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("5eef6d4f2ececddb0ef26b15175c691814a6841299e3b3e9e68643ecdb3b9fb7"));
var saveGcash = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("2454e6971c9430b72f6de93fd8e6ba83ac673f34c1ab6c05a6da1ea4cb1f83f2"));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8971869f8fd43d682673bff39e43e4cba3bf977b489143b549f122cd7f28e6da"));
var requestWithdrawal = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("bb42b2ac21d0eb30950fd42586af2a3374fa2a33fdff2d8409144f1a8309e3bd"));
var toggleLike = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("9331408a5de42ac4977331610c53cdcc5f0207c6ec23e556697034c82d6884bf"));
var startWatch = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("33b4e943ebabbc035faf6eed368e80137f43589203d36f008b9221402770d03a"));
var claimWatch = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("0eaabfd7ed0761150f801d31960c71f300508c9b6bd2de5aece4c0132d6344f9"));
var getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("75fdaa75a272255d5060e6d6a28457d2ecb4235cb54d70bd43bbc0a35b09da32"));
var reviewPurchase = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("2dde1fa5fd08b3fe7e2602dd13879aab80aeb22b8a57fac980b2292dac3acff4"));
var reviewWithdrawal = createServerFn({ method: "POST" }).validator((data) => data).middleware([authMiddleware]).handler(createSsrRpc("938c8e88fed1bbc3424edd7718f349001730b85282a5e0d4350c1917fc12658a"));
var useUi = create((set) => ({
	tokens: null,
	queue: null,
	revision: 0,
	setTokens: (tokens) => set({ tokens }),
	setSnapshot: (tokens, queue) => set({
		tokens,
		queue
	}),
	touch: () => set((s) => ({ revision: s.revision + 1 }))
}));
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var links = [
	{
		to: "/",
		label: "Feed",
		icon: Clapperboard
	},
	{
		to: "/shop",
		label: "Shop",
		icon: Store
	},
	{
		to: "/wallet",
		label: "Wallet",
		icon: Wallet
	}
];
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest text-accent",
				children: "AI VIDEO SHOP"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl text-fg",
				children: "Buy a film. Earn when it is actually watched."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "Opening your session…"
			})
		]
	});
}
function NavLink({ to, label, icon: Icon, badge, stacked }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		activeOptions: { exact: true },
		className: stacked ? "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs text-muted" : "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm text-muted",
		activeProps: { className: stacked ? "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs text-accent" : "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-raised px-3 text-sm text-fg" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [label, stacked && badge != null && badge > 0 ? ` ${badge}` : ""] }),
			!stacked && badge != null && badge > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full bg-accent px-2 text-xs font-semibold text-accent-ink tabular-nums",
				children: badge
			}) : null
		]
	});
}
function Shell({ children }) {
	const { user } = useCurrentUserState();
	const tokens = useUi((s) => s.tokens);
	const queue = useUi((s) => s.queue);
	const revision = useUi((s) => s.revision);
	const setSnapshot = useUi((s) => s.setSnapshot);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancel = false;
		getMe().then((me) => {
			if (!cancel) setSnapshot(me.walletTokens, me.adminQueue);
		}).catch(() => {
			if (!cancel) setSnapshot(0, null);
		});
		return () => {
			cancel = true;
		};
	}, [
		user?.id,
		revision,
		setSnapshot
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "font-display text-xl leading-none md:text-2xl",
							children: "AI Video Shop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex flex-wrap items-center justify-end gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/wallet",
								className: "inline-flex h-11 items-center rounded-full bg-raised px-3 text-sm font-semibold tabular-nums",
								children: tokens == null ? "Wallet" : tokenValue(tokens)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden w-full gap-1 md:flex",
							children: [links.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, { ...item }, item.to)), queue != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
								to: "/admin",
								label: "Admin",
								icon: Shield,
								badge: queue
							}) : null]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-bg/95 backdrop-blur md:hidden",
				children: [links.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					...item,
					stacked: true
				}, item.to)), queue != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLink, {
					to: "/admin",
					label: "Admin",
					icon: Shield,
					badge: queue,
					stacked: true
				}) : null]
			})
		]
	});
}
//#endregion
export { useCurrentUser as _, cn as a, getShop as c, reviewPurchase as d, reviewWithdrawal as f, toggleLike as g, submitPurchase as h, claimWatch as i, getWallet as l, startWatch as m, RedirectToSignIn as n, getAdmin as o, saveGcash as p, Shell as r, getFeed as s, BootScreen as t, requestWithdrawal as u, useCurrentUserState as v, useUi as y };
