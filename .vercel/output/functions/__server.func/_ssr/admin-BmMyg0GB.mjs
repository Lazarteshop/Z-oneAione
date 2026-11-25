import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as pesos, i as formatGcash, r as errorText, t as ago } from "./format-CJdfWsUb.mjs";
import { t as PayoutFilm } from "./payout-film-DsIdsW7H.mjs";
import { d as reviewPurchase, f as reviewWithdrawal, n as RedirectToSignIn, o as getAdmin, r as Shell, t as BootScreen, v as useCurrentUserState, y as useUi } from "./shell-D_UhZoBT.mjs";
import { t as Button } from "./ui-D9vJxjeJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BmMyg0GB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminView() {
	const [tab, setTab] = (0, import_react.useState)("pay");
	const [purchases, setPurchases] = (0, import_react.useState)(null);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const [payouts, setPayouts] = (0, import_react.useState)([]);
	const [paid, setPaid] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const touch = useUi((s) => s.touch);
	const revision = useUi((s) => s.revision);
	function load() {
		return getAdmin().then((res) => {
			setPurchases(res.purchases);
			setRecent(res.recent);
			setPayouts(res.payouts);
			setPaid(res.paid);
			setError(null);
		}).catch((err) => setError(errorText(err)));
	}
	(0, import_react.useEffect)(() => {
		let cancel = false;
		getAdmin().then((res) => {
			if (cancel) return;
			setPurchases(res.purchases);
			setRecent(res.recent);
			setPayouts(res.payouts);
			setPaid(res.paid);
		}).catch((err) => {
			if (!cancel) setError(errorText(err));
		});
		return () => {
			cancel = true;
		};
	}, [revision]);
	async function decidePurchase(id, decision) {
		setBusy(`p-${id}`);
		try {
			if (!(await reviewPurchase({ data: {
				purchaseId: id,
				decision
			} })).ok) toast.error("That receipt was already reviewed.");
			else toast.success(decision === "approve" ? "Published to the feed" : "Receipt rejected");
			touch();
			await load();
		} catch (err) {
			toast.error(errorText(err));
		} finally {
			setBusy(null);
		}
	}
	async function decidePayout(id, decision) {
		setBusy(`w-${id}`);
		try {
			if (!(await reviewWithdrawal({ data: {
				withdrawalId: id,
				decision
			} })).ok) toast.error("That payout was already closed.");
			else toast.success(decision === "paid" ? "Marked paid" : "Tokens returned");
			setConfirm(null);
			touch();
			await load();
		} catch (err) {
			toast.error(errorText(err));
		} finally {
			setBusy(null);
		}
	}
	if (error && purchases == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Admin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: error === "Admin only." ? "This desk is for the platform admin. The first account created becomes admin." : error
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Admin"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Match receipts. Listen to payout films. Then mark them paid."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab("pay"),
					"aria-selected": tab === "pay",
					className: `h-11 rounded-full px-4 text-sm ${tab === "pay" ? "bg-raised text-fg" : "text-muted"}`,
					children: ["Payments ", purchases ? `(${purchases.length})` : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab("out"),
					"aria-selected": tab === "out",
					className: `h-11 rounded-full px-4 text-sm ${tab === "out" ? "bg-raised text-fg" : "text-muted"}`,
					children: [
						"Withdrawals (",
						payouts.length,
						")"
					]
				})]
			})]
		}), tab === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				purchases?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No receipts waiting."
				}) : null,
				purchases == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-2xl bg-surface" }) : null,
				purchases?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl bg-surface p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: row.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl tabular-nums",
								children: pesos(row.pricePhp)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								row.username,
								" · ",
								row.email,
								" · ",
								ago(row.createdAt)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-3 grid gap-2 text-sm sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tracking-widest",
								children: row.reference
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Sender GCash"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "tabular-nums",
								children: formatGcash(row.senderGcash)
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								disabled: busy === `p-${row.id}`,
								onClick: () => void decidePurchase(row.id, "approve"),
								children: "Approve"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "danger",
								disabled: busy === `p-${row.id}`,
								onClick: () => void decidePurchase(row.id, "reject"),
								children: "Reject"
							})]
						})
					]
				}, row.id)),
				recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold tracking-widest text-muted",
						children: "RECENT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2 text-sm",
						children: recent.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-3 border-b border-line py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								row.username,
								" · ",
								row.reference
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: row.status === "approved" ? "text-ok" : "text-danger",
								children: row.status
							})]
						}, row.id))
					})]
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				payouts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "No payout films waiting."
				}) : null,
				payouts.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "space-y-3 rounded-2xl bg-surface p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: row.username
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl tabular-nums",
								children: pesos(row.amountPhp)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								row.email,
								" · ",
								formatGcash(row.gcashNumber),
								" · ",
								row.tokens,
								" tokens · ",
								ago(row.createdAt)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutFilm, {
							script: row.script,
							username: row.username ?? "Member",
							amountLabel: pesos(row.amountPhp),
							gcash: row.gcashNumber
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [confirm === row.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								disabled: busy === `w-${row.id}`,
								onClick: () => void decidePayout(row.id, "paid"),
								children: "Confirm paid"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: () => setConfirm(row.id),
								children: "Mark as paid"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "danger",
								disabled: busy === `w-${row.id}`,
								onClick: () => void decidePayout(row.id, "reject"),
								children: "Reject and refund"
							})]
						})
					]
				}, row.id)),
				paid.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: paid.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 border-b border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							row.username,
							" · ",
							pesos(row.amountPhp)
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: row.status === "paid" ? "text-ok" : "text-danger",
							children: row.status
						})]
					}, row.id))
				}) : null
			]
		})]
	});
}
function AdminPage() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminView, {}) });
}
//#endregion
export { AdminPage as component };
