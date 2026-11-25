import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as normalizeGcash, c as pesos, i as formatGcash, o as normalizeRef, r as errorText, t as ago } from "./format-CJdfWsUb.mjs";
import { t as palette } from "./palette-YJBCuM7G.mjs";
import { c as getShop, h as submitPurchase, n as RedirectToSignIn, r as Shell, t as BootScreen, v as useCurrentUserState, y as useUi } from "./shell-D_UhZoBT.mjs";
import { i as inputClass, n as Field, r as Modal, t as Button } from "./ui-D9vJxjeJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as PLATFORM } from "./catalog-jv04zviP.mjs";
import { t as Reel } from "./reel-BprjSvxU.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-BgRcT7m6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function QrSlip({ price }) {
	const [src, setSrc] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		import_lib.toDataURL(PLATFORM.qrPayload, {
			margin: 1,
			width: 280,
			color: {
				dark: palette.bg,
				light: palette.fg
			}
		}).then((url) => {
			if (!cancel) setSrc(url);
		}).catch(() => {
			if (!cancel) setSrc(null);
		});
		return () => {
			cancel = true;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-fg p-4 text-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold tracking-widest",
				children: "PLATFORM GCASH"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid place-items-center rounded-xl bg-fg",
				children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src,
					alt: "GCash QR for AI Video Shop",
					className: "size-52"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "grid size-52 place-items-center text-center text-sm",
					children: PLATFORM.gcashDisplay
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-2xl",
				children: PLATFORM.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "tabular-nums",
				children: PLATFORM.gcashDisplay
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm",
				children: [
					"Pay exactly ",
					pesos(price),
					", then submit the receipt below."
				]
			}),
			PLATFORM.livePayments ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				children: "Demo checkout. Do not send real money. Swap this QR for a live merchant code before taking payments."
			})
		]
	});
}
function Checkout({ asset, onClose, onDone }) {
	const [reference, setReference] = (0, import_react.useState)("");
	const [sender, setSender] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function submit(event) {
		event.preventDefault();
		setError(null);
		if (!normalizeRef(reference)) {
			setError("Reference must be 6 to 32 letters or numbers, and unique.");
			return;
		}
		if (!normalizeGcash(sender)) {
			setError("Use a mobile number like 09171234567.");
			return;
		}
		setBusy(true);
		try {
			await submitPurchase({ data: {
				assetId: asset.id,
				reference,
				senderGcash: sender
			} });
			toast.success("Receipt submitted. An admin still has to approve it.");
			onDone();
		} catch (err) {
			setError(errorText(err));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: `Buy ${asset.title}`,
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: asset.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						pesos(asset.pricePhp),
						" · ",
						asset.tokensPerView,
						" tokens per valid view"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "h-11 px-2 text-sm text-muted",
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrSlip, { price: asset.pricePhp }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void submit(event),
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "GCash reference number",
						hint: "Each receipt can be used once. Spaces are ignored.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: reference,
							onChange: (event) => setReference(event.target.value),
							autoComplete: "off",
							placeholder: "903311224455",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Sender's GCash mobile",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: sender,
							onChange: (event) => setSender(event.target.value),
							inputMode: "numeric",
							autoComplete: "tel",
							placeholder: "09XXXXXXXXX",
							required: true
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						className: "w-full",
						children: busy ? "Submitting…" : "Submit receipt"
					})
				]
			})
		]
	});
}
var statusLabel = {
	pending: "Pending",
	approved: "Published",
	rejected: "Rejected"
};
function ShopView() {
	const [assets, setAssets] = (0, import_react.useState)(null);
	const [purchases, setPurchases] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(null);
	const revision = useUi((s) => s.revision);
	const touch = useUi((s) => s.touch);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		getShop().then((res) => {
			if (cancel) return;
			setAssets(res.assets);
			setPurchases(res.purchases);
			setError(null);
		}).catch((err) => {
			if (!cancel) setError(errorText(err));
		});
		return () => {
			cancel = true;
		};
	}, [revision]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Shop"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-muted",
				children: "Buy a film, send the receipt, and wait. Nothing reaches the feed until an admin approves the reference."
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-3",
				children: [(assets ?? []).map((asset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "overflow-hidden rounded-2xl bg-surface shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative aspect-video",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reel, {
							tier: asset.tier,
							playing: true,
							seed: asset.pricePhp
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: asset.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: asset.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl tabular-nums",
								children: pesos(asset.pricePhp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-accent",
								children: [asset.tokensPerView, " tokens / valid view"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								className: "w-full",
								onClick: () => setOpen(asset),
								children: "Buy asset"
							})
						]
					})]
				}, asset.id)), assets == null && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-80 animate-pulse rounded-2xl bg-surface md:col-span-3" }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Your receipts"
				}),
				purchases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "None yet."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: purchases.map((purchase) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line px-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [purchase.title, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [" · ", purchase.reference]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: purchase.status === "rejected" ? "text-danger" : purchase.status === "approved" ? "text-ok" : "text-accent",
							children: [
								statusLabel[purchase.status],
								" · ",
								formatGcash(purchase.senderGcash),
								" · ",
								ago(purchase.createdAt)
							]
						})]
					}, purchase.id))
				})
			] }),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkout, {
				asset: open,
				onClose: () => setOpen(null),
				onDone: () => {
					setOpen(null);
					touch();
				}
			}) : null
		]
	});
}
function ShopPage() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopView, {}) });
}
//#endregion
export { ShopPage as component };
