import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { B as EyeOff, at as TriangleAlert, ot as LoaderCircle, y as ShieldCheck, z as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
import { t as Logo } from "./Logo-Pe2PMluE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-CtGD0FRR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var schema = objectType({
	password: stringType().min(8, "Use at least 8 characters").max(128).regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number"),
	confirm: stringType()
}).refine((d) => d.password === d.confirm, {
	path: ["confirm"],
	message: "Passwords don't match"
});
function hasRecoveryToken() {
	if (new URLSearchParams(window.location.search).get("code")) return true;
	const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	if (hp.get("access_token") && hp.get("type") === "recovery") return true;
	return false;
}
function hasErrorParams() {
	const qp = new URLSearchParams(window.location.search);
	const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
	return !!(qp.get("error") || qp.get("error_code") || hp.get("error") || hp.get("error_code"));
}
function ResetPassword() {
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const form = useForm({ resolver: u(schema) });
	(0, import_react.useEffect)(() => {
		if (hasErrorParams()) {
			setStatus("invalid");
			return;
		}
		if (!hasRecoveryToken()) {
			setStatus("invalid");
			return;
		}
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") setStatus("ready");
		});
		const timeout = setTimeout(() => {
			setStatus((prev) => prev === "loading" ? "invalid" : prev);
		}, 5e3);
		return () => {
			subscription.unsubscribe();
			clearTimeout(timeout);
		};
	}, []);
	const onSubmit = async (values) => {
		setLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({ password: values.password });
			if (error) {
				toast.error(error.message);
				return;
			}
			toast.success("Password updated — please sign in with your new password.");
			await supabase.auth.signOut();
			navigate({
				to: "/auth",
				search: { tab: "login" }
			});
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen flex items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-2xl border border-border/60 bg-gradient-surface p-8 shadow-elevated",
					children: [
						status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-4 py-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Verifying your reset link…"
							})]
						}),
						status === "invalid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-4 py-4 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-14 rounded-full bg-destructive/10 flex items-center justify-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-7 text-destructive" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-xl font-bold",
									children: "Link expired or already used"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "This password reset link has expired, already been used, or is invalid. Request a fresh one below."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/forgot-password",
									className: "mt-1 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
									children: "Request new link"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
									children: "Back to sign in"
								})
							]
						}),
						status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl font-bold",
								children: "Set a new password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Choose a strong password you'll remember."
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: form.handleSubmit(onSubmit),
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: "New password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative mt-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "password",
											type: showPw ? "text" : "password",
											className: "h-11 pr-10",
											autoComplete: "new-password",
											...form.register("password")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowPw((s) => !s),
											className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
											"aria-label": showPw ? "Hide password" : "Show password",
											children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
										})]
									}),
									form.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-destructive mt-1",
										children: form.formState.errors.password.message
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "confirm",
										children: "Confirm new password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "confirm",
										type: showPw ? "text" : "password",
										className: "mt-1.5 h-11",
										autoComplete: "new-password",
										...form.register("confirm")
									}),
									form.formState.errors.confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-destructive mt-1",
										children: form.formState.errors.confirm.message
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									disabled: loading,
									className: "w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95",
									children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Update password"
								})
							]
						})] })
					]
				}),
				status !== "invalid" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
					children: "← Back to sign in"
				})
			]
		})
	});
}
//#endregion
export { ResetPassword as component };
