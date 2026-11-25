import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as pesos, r as errorText, t as ago } from "./format-CJdfWsUb.mjs";
import { a as Share2, c as Pause, d as Eye, s as Play, u as Heart } from "../_libs/lucide-react.mjs";
import { _ as useCurrentUser, a as cn, g as toggleLike, i as claimWatch, m as startWatch, r as Shell, s as getFeed, v as useCurrentUserState, y as useUi } from "./shell-D_UhZoBT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as TIERS } from "./catalog-jv04zviP.mjs";
import { n as Route$5 } from "./router-DqJ29fN4.mjs";
import { t as Reel } from "./reel-BprjSvxU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLyA-suD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var claimedSessions = /* @__PURE__ */ new Set();
function reasonCopy(reason) {
	switch (reason) {
		case "self": return "This is your film. Views from you do not pay tokens.";
		case "user_24h": return "You already counted a view here in the last 24 hours.";
		case "ip_24h": return "This network already counted a view here in the last 24 hours.";
		case "already": return "That view was already counted.";
		case "too_soon": return "Keep it playing. Five seconds have to pass.";
		default: return "This view was not counted.";
	}
}
function FilmCard({ post, playing, onToggle, onLike }) {
	const me = useCurrentUser();
	const [views, setViews] = (0, import_react.useState)(post.viewCount);
	const [watched, setWatched] = (0, import_react.useState)(0);
	const mine = me?.id === post.ownerId;
	const [note, setNote] = (0, import_react.useState)(post.counted ? reasonCopy("user_24h") : mine ? reasonCopy("self") : null);
	const [settled, setSettled] = (0, import_react.useState)(post.counted || mine);
	const [sessionId, setSessionId] = (0, import_react.useState)(null);
	const accrued = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setViews((count) => Math.max(count, post.viewCount));
	}, [post.viewCount]);
	(0, import_react.useEffect)(() => {
		if (!me?.id || post.ownerId !== me.id) return;
		setSettled(true);
		setNote((current) => current ?? reasonCopy("self"));
	}, [me?.id, post.ownerId]);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		const timer = window.setInterval(() => {
			if (document.hidden) return;
			accrued.current += .2;
			setWatched(accrued.current);
		}, 200);
		return () => window.clearInterval(timer);
	}, [playing]);
	(0, import_react.useEffect)(() => {
		if (!playing || sessionId || settled) return;
		let cancel = false;
		startWatch({ data: { postId: post.id } }).then((res) => {
			if (cancel) return;
			if (res.eligible) setSessionId(res.sessionId);
			else {
				setNote(reasonCopy(res.reason));
				setSettled(true);
			}
		}).catch((err) => {
			if (!cancel) toast.error(errorText(err));
		});
		return () => {
			cancel = true;
		};
	}, [
		playing,
		post.id,
		settled,
		sessionId
	]);
	const ready = watched >= 5.15;
	(0, import_react.useEffect)(() => {
		if (!ready || sessionId == null || settled || claimedSessions.has(sessionId)) return;
		claimedSessions.add(sessionId);
		let cancel = false;
		(async () => {
			let res = null;
			try {
				for (let i = 0; i < 12; i += 1) {
					res = await claimWatch({ data: { sessionId } });
					if (cancel) return;
					if (res.ok || res.reason !== "too_soon") break;
					await new Promise((resolve) => setTimeout(resolve, 400));
				}
			} catch (err) {
				claimedSessions.delete(sessionId);
				if (!cancel) toast.error(errorText(err));
				return;
			}
			if (cancel || !res) return;
			if (!res.ok && res.reason === "too_soon") {
				claimedSessions.delete(sessionId);
				return;
			}
			setSettled(true);
			if (res.ok) {
				setViews(res.viewCount);
				setNote(`Valid view. ${res.tokens} tokens paid to ${post.username}.`);
				toast.success(`${post.username} earned ${res.tokens} tokens`);
			} else setNote(reasonCopy(res.reason));
		})();
		return () => {
			cancel = true;
			claimedSessions.delete(sessionId);
		};
	}, [
		ready,
		sessionId,
		settled,
		post.username
	]);
	async function share() {
		const url = `${window.location.origin}/?v=${post.id}`;
		const payload = {
			title: post.title,
			text: `${post.title} by ${post.username}`,
			url
		};
		try {
			if (navigator.share) {
				await navigator.share(payload);
				return;
			}
			await navigator.clipboard.writeText(url);
			toast.success("Link copied");
		} catch {}
	}
	const remain = Math.max(0, 5 - watched);
	const progress = Math.min(100, watched / 5 * 100);
	const initial = post.username.slice(0, 1).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		id: `post-${post.id}`,
		className: "overflow-hidden rounded-2xl bg-surface shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 px-4 pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-full bg-raised font-semibold text-accent",
						children: initial
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: post.username
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								ago(post.createdAt),
								" · ",
								post.tier
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-semibold text-accent",
						children: [post.tokensPerView, "/view"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-3",
				children: post.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-video bg-bg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, {
						tier: post.tier,
						playing,
						seed: post.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onToggle,
						"aria-label": playing ? "Pause" : "Play",
						className: "absolute inset-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("absolute grid size-11 place-items-center rounded-full bg-fg text-bg", playing ? "top-3 right-3" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"),
							children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-5" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-accent",
							style: { width: `${settled ? 100 : progress}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pointer-events-none absolute bottom-3 left-3 rounded-full bg-bg/80 px-2 py-1 text-xs text-fg",
						children: settled ? "View settled" : !playing ? "Play 5s to count" : watched >= 5 ? "Counting…" : `${remain.toFixed(1)}s to count`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "inline-flex items-center gap-2 tabular-nums",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4 text-muted" }),
						views,
						" ",
						views === 1 ? "view" : "views"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted tabular-nums",
					children: [
						post.likeCount,
						" ",
						post.likeCount === 1 ? "like" : "likes"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 border-t border-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onLike,
					className: "inline-flex h-12 items-center justify-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `size-4 ${post.liked ? "fill-accent text-accent" : ""}` }), "Like"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void share(),
					className: "inline-flex h-12 items-center justify-center gap-2 border-l border-line text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Share"]
				})]
			}),
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-4 py-3 text-sm text-muted",
				children: note
			}) : null
		]
	});
}
function Feed({ focusId }) {
	const [posts, setPosts] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const revision = useUi((s) => s.revision);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		getFeed().then((rows) => {
			if (!cancel) {
				setPosts(rows);
				setError(null);
			}
		}).catch((err) => {
			if (!cancel) setError(errorText(err));
		});
		return () => {
			cancel = true;
		};
	}, [revision]);
	(0, import_react.useEffect)(() => {
		if (!focusId || !posts?.length) return;
		document.getElementById(`post-${focusId}`)?.scrollIntoView({ block: "center" });
	}, [focusId, posts]);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => {
			getFeed().then((rows) => setPosts(rows)).catch(() => {});
		}, 12e3);
		return () => window.clearInterval(timer);
	}, [revision]);
	async function like(post) {
		const prev = posts;
		setPosts((rows) => rows?.map((row) => row.id === post.id ? {
			...row,
			liked: !row.liked,
			likeCount: row.likeCount + (row.liked ? -1 : 1)
		} : row) ?? null);
		try {
			const res = await toggleLike({ data: { postId: post.id } });
			setPosts((rows) => rows?.map((row) => row.id === post.id ? {
				...row,
				liked: res.liked,
				likeCount: res.likeCount
			} : row) ?? null);
		} catch (err) {
			setPosts(prev);
			toast.error(errorText(err));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid items-start gap-6 md:grid-cols-[minmax(0,36rem)_16rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-danger",
					children: error
				}) : null,
				posts == null && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-2xl bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-2xl bg-surface" })]
				}) : null,
				posts?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-surface p-6 text-muted",
					children: "The feed is empty. Buy a film and wait for an admin to publish it."
				}) : null,
				posts?.map((post) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilmCard, {
					post,
					playing: activeId === post.id,
					onToggle: () => setActiveId((id) => id === post.id ? null : post.id),
					onLike: () => void like(post)
				}, post.id))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden rounded-2xl border border-line p-4 md:block md:sticky md:top-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "What counts"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-3 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Play for five seconds. Pausing or leaving the tab stops the clock." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Your own film never pays you." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "One valid view per person, and per network, every 24 hours." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Starter pays 2, Pro pays 4, VIP pays 5." })
				]
			})]
		})]
	});
}
function Landing({ ready }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-5xl items-center justify-between px-5 py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "AI Video Shop"
				}), ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "inline-flex h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink",
					children: "Sign in"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-flex h-11 w-24 rounded-full bg-raised" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid max-w-5xl gap-10 px-5 pb-16 md:grid-cols-2 md:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-accent",
						children: "AI VIDEO SHOP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl leading-tight md:text-5xl",
						children: "Buy a film. Earn when it is actually watched."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-muted",
						children: "Three films. A view counts after five seconds, once per person and once per network each day. Ten tokens make one peso. A payout starts at one thousand tokens."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap gap-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-raised px-3 py-2",
								children: "5 seconds"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-raised px-3 py-2",
								children: "10 tokens = ₱1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-raised px-3 py-2",
								children: "Min payout ₱100"
							})
						]
					}),
					ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "mt-8 inline-flex h-12 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink",
						children: "Create an account"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-8 inline-flex h-12 w-44 rounded-full bg-raised" })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: TIERS.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl bg-surface p-4 shadow-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-2xl",
									children: tier.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl tabular-nums",
									children: pesos(tier.pricePhp)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: tier.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-accent",
								children: [tier.tokensPerView, " tokens per valid view"]
							})
						]
					}, tier.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid max-w-5xl gap-4 px-5 pb-20 md:grid-cols-3",
				children: [
					[
						"1",
						"Pay in GCash",
						"Submit a reference number that has never been used. An admin matches the receipt."
					],
					[
						"2",
						"It hits the feed",
						"Approved films publish under your name, with a view counter and likes."
					],
					[
						"3",
						"Cash out by film",
						"At 1,000 tokens the app speaks a payout request and queues it for admin."
					]
				].map(([step, title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl text-accent",
							children: step
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-lg font-semibold",
							children: title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: body
						})
					]
				}, step))
			})
		]
	});
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	const { v } = Route$5.useSearch();
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feed, { focusId: v }) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, { ready: !isPending });
}
//#endregion
export { Home as component };
