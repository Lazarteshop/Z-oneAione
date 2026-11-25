import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as normalizeGcash, c as pesos, i as formatGcash, l as tokenValue, r as errorText, s as payoutScript, t as ago } from "./format-CJdfWsUb.mjs";
import { l as Minus, o as Plus } from "../_libs/lucide-react.mjs";
import { t as PayoutFilm } from "./payout-film-DsIdsW7H.mjs";
import { l as getWallet, n as RedirectToSignIn, p as saveGcash, r as Shell, t as BootScreen, u as requestWithdrawal, v as useCurrentUserState, y as useUi } from "./shell-D_UhZoBT.mjs";
import { i as inputClass, n as Field, t as Button } from "./ui-D9vJxjeJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as MIN_WITHDRAW_TOKENS } from "./catalog-jv04zviP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-Y7DCLhUR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var reasonLabel = {
	view: "Valid view",
	withdrawal: "Payout reserved",
	withdrawal_refund: "Payout returned"
};
function WalletView() {
	const [balance, setBalance] = (0, import_react.useState)(null);
	const [username, setUsername] = (0, import_react.useState)("");
	const [gcash, setGcash] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)(MIN_WITHDRAW_TOKENS);
	const [ledger, setLedger] = (0, import_react.useState)([]);
	const [withdrawals, setWithdrawals] = (0, import_react.useState)([]);
	const [film, setFilm] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const setTokens = useUi((s) => s.setTokens);
	const touch = useUi((s) => s.touch);
	const revision = useUi((s) => s.revision);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		getWallet().then((res) => {
			if (cancel) return;
			setBalance(res.me.walletTokens);
			setUsername(res.me.username);
			setGcash(res.me.gcashNumber ?? "");
			setLedger(res.ledger);
			setWithdrawals(res.withdrawals);
			setTokens(res.me.walletTokens);
		}).catch((err) => {
			if (!cancel) setError(errorText(err));
		});
		return () => {
			cancel = true;
		};
	}, [revision, setTokens]);
	const max = balance == null ? 0 : Math.floor(balance / MIN_WITHDRAW_TOKENS) * MIN_WITHDRAW_TOKENS;
	const unlocked = max >= MIN_WITHDRAW_TOKENS;
	const sampleNumber = normalizeGcash(gcash);
	async function saveNumber() {
		setError(null);
		if (!sampleNumber) {
			setError("Enter a Philippine mobile number, like 09171234567.");
			return;
		}
		setBusy(true);
		try {
			await saveGcash({ data: { gcashNumber: sampleNumber } });
			toast.success("GCash number saved");
		} catch (err) {
			setError(errorText(err));
		} finally {
			setBusy(false);
		}
	}
	async function withdraw() {
		if (!sampleNumber || !unlocked) return;
		setBusy(true);
		setError(null);
		try {
			const res = await requestWithdrawal({ data: {
				tokens: amount,
				gcashNumber: sampleNumber
			} });
			setBalance(res.balance);
			setTokens(res.balance);
			setFilm(res.withdrawal);
			setWithdrawals((rows) => [res.withdrawal, ...rows]);
			touch();
			toast.success("Payout film queued for admin");
		} catch (err) {
			setError(errorText(err));
		} finally {
			setBusy(false);
		}
	}
	const progress = Math.min(100, (balance ?? 0) / MIN_WITHDRAW_TOKENS * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["AI wallet", username ? ` · ${username}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl tabular-nums",
					children: balance == null ? "—" : tokenValue(balance)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-muted tabular-nums",
					children: [balance ?? 0, " tokens · 10 tokens = ₱1 · your own views never pay you"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 h-2 overflow-hidden rounded-full bg-raised",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-full bg-accent",
						style: { width: `${progress}%` }
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: unlocked ? "Payout is open." : `${Math.max(0, MIN_WITHDRAW_TOKENS - (balance ?? 0))} tokens until the minimum ₱100 payout.`
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-2xl bg-surface p-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Payout GCash number",
						hint: "This is the number spoken in the payout film.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: gcash,
							onChange: (event) => setGcash(event.target.value),
							inputMode: "numeric",
							autoComplete: "tel",
							placeholder: "09XXXXXXXXX"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						disabled: busy,
						onClick: () => void saveNumber(),
						children: "Save number"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: "Amount"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-full bg-raised",
									disabled: !unlocked || amount <= 1e3,
									onClick: () => setAmount((value) => Math.max(MIN_WITHDRAW_TOKENS, value - MIN_WITHDRAW_TOKENS)),
									"aria-label": "Decrease payout",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "w-28 text-center font-display text-2xl tabular-nums",
									children: unlocked ? pesos(amount / 10) : pesos(100)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-full bg-raised",
									disabled: !unlocked || amount + 1e3 > max,
									onClick: () => setAmount((value) => value + MIN_WITHDRAW_TOKENS),
									"aria-label": "Increase payout",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
								})
							]
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "w-full",
						disabled: !unlocked || busy || !sampleNumber,
						onClick: () => void withdraw(),
						children: unlocked ? "Withdraw via AI TTS video" : "Withdraw locked"
					}),
					sampleNumber ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-line pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-3 text-sm text-muted",
							children: "Rehearsal only. This is not sent to admin and does not move tokens."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutFilm, {
							script: payoutScript(username || "Member", unlocked ? amount / 10 : 100, sampleNumber),
							username: username || "Member",
							amountLabel: pesos(unlocked ? amount / 10 : 100),
							gcash: sampleNumber
						})]
					}) : null
				]
			}),
			film ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Queued payout"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayoutFilm, {
					script: film.script,
					username,
					amountLabel: pesos(film.amountPhp),
					gcash: film.gcashNumber
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Ledger"
				}),
				ledger.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "No token movement yet."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: ledger.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [reasonLabel[row.reason] ?? row.reason, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [" · ", ago(row.createdAt)]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: row.delta > 0 ? `+${row.delta}` : row.delta
						})]
					}, row.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Payouts"
				}),
				withdrawals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "None yet."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: withdrawals.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line px-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: pesos(row.amountPhp)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" · ",
								formatGcash(row.gcashNumber),
								" · ",
								row.status,
								" · ",
								ago(row.createdAt)
							]
						})]
					}, row.id))
				})
			] })
		]
	});
}
function WalletPage() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletView, {}) });
}
//#endregion
export { WalletPage as component };
