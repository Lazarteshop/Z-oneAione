import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, S as useRouter, X as require_react, b as Link, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as errorText } from "./format-CJdfWsUb.mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-CUNXgMg-.mjs";
import { t as BootScreen, v as useCurrentUserState } from "./shell-D_UhZoBT.mjs";
import { i as inputClass, n as Field, t as Button } from "./ui-D9vJxjeJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BfgPm5Ln.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const router = useRouter();
	const [mode, setMode] = (0, import_react.useState)("up");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const result = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name: name.trim(),
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) {
				setError(result.error.message ?? "Could not sign in.");
				return;
			}
			await router.invalidate();
			await router.navigate({ to: "/" });
		} catch (err) {
			setError(errorText(err));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display text-3xl",
				children: "AI Video Shop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-6 font-display text-4xl",
				children: mode === "up" ? "Create your wallet" : "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "The first account on a fresh platform becomes admin and can approve receipts and payouts."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => void submit(event),
				className: "mt-6 space-y-4",
				children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						hint: "This is the name spoken in a payout film.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							value: name,
							onChange: (event) => setName(event.target.value),
							autoComplete: "name",
							required: true
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							type: "email",
							value: email,
							onChange: (event) => setEmail(event.target.value),
							autoComplete: "email",
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						hint: "At least 8 characters.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputClass,
							type: "password",
							value: password,
							onChange: (event) => setPassword(event.target.value),
							autoComplete: mode === "up" ? "new-password" : "current-password",
							minLength: 8,
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
						children: busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-4 h-11 text-sm text-muted",
				onClick: () => {
					setMode((value) => value === "up" ? "in" : "up");
					setError(null);
				},
				children: mode === "up" ? "Already have an account? Sign in" : "Need an account? Create one"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-2 border-t border-line pt-6",
				children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
					className: "h-11 w-full rounded-full bg-raised text-sm font-semibold",
					children: ["Continue with ", provider.label]
				}, provider.providerId))
			})
		]
	});
}
//#endregion
export { LoginPage as component };
