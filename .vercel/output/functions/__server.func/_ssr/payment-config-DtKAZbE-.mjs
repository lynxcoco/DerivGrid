import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { B as EyeOff, C as Save, F as Info, T as RefreshCw, _ as Smartphone, at as TriangleAlert, dt as CircleCheck, ot as LoaderCircle, y as ShieldCheck, z as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Separator } from "./separator-B3hsz7IR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payment-config-DtKAZbE-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SASAPAY_FIELDS = [
	{
		key: "sasapay_base_url",
		label: "SasaPay Base URL",
		placeholder: "https://sandbox.sasapay.app",
		hint: "Use https://sandbox.sasapay.app for testing, https://api.sasapay.app for production.",
		secret: false,
		options: [{
			label: "Production",
			value: "https://api.sasapay.app"
		}, {
			label: "Sandbox (testing)",
			value: "https://sandbox.sasapay.app"
		}]
	},
	{
		key: "sasapay_client_id",
		label: "Client ID",
		placeholder: "From SasaPay Developer Portal → Your App",
		hint: "Found in your SasaPay developer portal application credentials.",
		secret: true
	},
	{
		key: "sasapay_client_secret",
		label: "Client Secret",
		placeholder: "From SasaPay Developer Portal → Your App",
		hint: "Found in your SasaPay developer portal application credentials. Keep this confidential.",
		secret: true
	},
	{
		key: "sasapay_merchant_code",
		label: "Merchant Code",
		placeholder: "e.g. 600980",
		hint: "Your SasaPay merchant code (Paybill or Till number).",
		secret: false
	},
	{
		key: "sasapay_network_code",
		label: "Default Network Code",
		placeholder: "63902",
		hint: "The mobile money network used for STK push deposits. 63902 = M-PESA (recommended).",
		secret: false,
		options: [
			{
				label: "M-PESA (63902)",
				value: "63902"
			},
			{
				label: "Airtel Money (63903)",
				value: "63903"
			},
			{
				label: "T-Kash (63907)",
				value: "63907"
			},
			{
				label: "SasaPay Wallet (0)",
				value: "0"
			}
		]
	},
	{
		key: "sasapay_callback_base",
		label: "Callback Base URL",
		placeholder: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sasapay-callback",
		hint: "Your Supabase Edge Function URL — replace YOUR_PROJECT_REF with your actual project reference.",
		secret: false
	}
];
var DARAJA_FIELDS = [
	{
		key: "daraja_base_url",
		label: "Daraja Base URL",
		placeholder: "https://api.safaricom.co.ke",
		hint: "Legacy Daraja credentials — no longer used by the payment system.",
		secret: false,
		options: [{
			label: "Production",
			value: "https://api.safaricom.co.ke"
		}, {
			label: "Sandbox (testing)",
			value: "https://sandbox.safaricom.co.ke"
		}]
	},
	{
		key: "daraja_consumer_key",
		label: "Consumer Key",
		placeholder: "Daraja consumer key",
		hint: "Legacy — not used.",
		secret: true
	},
	{
		key: "daraja_consumer_secret",
		label: "Consumer Secret",
		placeholder: "Daraja consumer secret",
		hint: "Legacy — not used.",
		secret: true
	},
	{
		key: "stk_shortcode",
		label: "STK Shortcode",
		placeholder: "e.g. 174379",
		hint: "Legacy — not used.",
		secret: false
	},
	{
		key: "stk_passkey",
		label: "STK Passkey",
		placeholder: "Daraja passkey",
		hint: "Legacy — not used.",
		secret: true
	},
	{
		key: "b2c_shortcode",
		label: "B2C Shortcode",
		placeholder: "e.g. 600998",
		hint: "Legacy — not used.",
		secret: false
	},
	{
		key: "b2c_initiator_name",
		label: "B2C Initiator Name",
		placeholder: "e.g. api_operator",
		hint: "Legacy — not used.",
		secret: false
	},
	{
		key: "daraja_security_credential",
		label: "B2C Security Credential",
		placeholder: "Encrypted credential",
		hint: "Legacy — not used.",
		secret: true
	},
	{
		key: "daraja_callback_base",
		label: "Daraja Callback URL",
		placeholder: "Daraja callback URL",
		hint: "Legacy — not used.",
		secret: false
	}
];
var ALL_KEYS = [...SASAPAY_FIELDS.map((f) => f.key), ...DARAJA_FIELDS.map((f) => f.key)];
var EMPTY = Object.fromEntries(ALL_KEYS.map((k) => [k, ""]));
function PaymentConfig() {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [testing, setTesting] = (0, import_react.useState)(false);
	const [testResult, setTestResult] = (0, import_react.useState)(null);
	const [config, setConfig] = (0, import_react.useState)(EMPTY);
	const [show, setShow] = (0, import_react.useState)({});
	const [lastSaved, setLastSaved] = (0, import_react.useState)(null);
	const [showLegacy, setShowLegacy] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		const { data } = await supabase.from("platform_settings").select("*").eq("id", "global").single();
		if (data) {
			const loaded = { ...EMPTY };
			for (const key of ALL_KEYS) if (data[key]) loaded[key] = data[key];
			setConfig(loaded);
			setLastSaved(data.updated_at ?? null);
		}
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const set = (key, val) => {
		setConfig((prev) => ({
			...prev,
			[key]: val
		}));
		setTestResult(null);
	};
	const toggleShow = (key) => setShow((prev) => ({
		...prev,
		[key]: !prev[key]
	}));
	const save = async () => {
		const empty = [
			"sasapay_client_id",
			"sasapay_client_secret",
			"sasapay_merchant_code",
			"sasapay_callback_base"
		].filter((k) => !config[k].trim());
		if (empty.length) {
			const labels = SASAPAY_FIELDS.filter((f) => empty.includes(f.key)).map((f) => f.label);
			toast.error(`Please fill in: ${labels.join(", ")}`);
			return;
		}
		setSaving(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			const update = {
				updated_by: user?.id ?? null,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			for (const key of ALL_KEYS) update[key] = config[key] || null;
			const { error } = await supabase.from("platform_settings").upsert({
				id: "global",
				...update
			});
			if (error) throw new Error(error.message);
			setLastSaved((/* @__PURE__ */ new Date()).toISOString());
			toast.success("Payment configuration saved — changes are live immediately.");
		} catch (e) {
			toast.error(e?.message ?? "Failed to save");
		} finally {
			setSaving(false);
		}
	};
	const testConnection = async () => {
		if (!config.sasapay_client_id || !config.sasapay_client_secret) {
			toast.error("Fill in Client ID and Client Secret first.");
			return;
		}
		setTesting(true);
		setTestResult(null);
		try {
			const res = await fetch(`https://oevuqograxqkensvqxzt.supabase.co/functions/v1/sasapay-proxy?action=test-token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"apikey": "sb_publishable_CfibYkdx9UyiVEm0h3oW6A_7MlgOr8k"
				},
				body: JSON.stringify({
					base_url: config.sasapay_base_url || "https://sandbox.sasapay.app",
					client_id: config.sasapay_client_id,
					client_secret: config.sasapay_client_secret
				})
			});
			const data = await res.json();
			if (res.ok && data.ok) {
				setTestResult("ok");
				toast.success("Connection successful! SasaPay credentials are valid.");
			} else {
				setTestResult("fail");
				toast.error(`Connection failed: ${data.error ?? "Invalid credentials"}`);
			}
		} catch {
			setTestResult("fail");
			toast.error("Could not reach the payment service.");
		} finally {
			setTesting(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-64 rounded-xl" }), [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-2xl" }, i))]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 pb-12 space-y-6 max-w-2xl mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-5 sm:size-6 text-primary shrink-0" }), "Payment Configuration"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs sm:text-sm text-muted-foreground mt-1",
							children: "SasaPay credentials for processing deposits and withdrawals."
						}),
						lastSaved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground/70 mt-0.5",
							children: ["Last saved: ", new Date(lastSaved).toLocaleString()]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: load,
					className: "shrink-0 size-9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-4 text-primary shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-foreground",
						children: "Changes take effect immediately — no redeploy needed."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Credentials are saved to the database and the payment Edge Functions read them on every transaction. See ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "PAYMENTS.md" }),
						" for setup instructions."
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: "SasaPay Credentials"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: SASAPAY_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
					field,
					value: config[field.key],
					shown: !!show[field.key],
					onChange: (val) => set(field.key, val),
					onToggleShow: () => toggleShow(field.key)
				}, field.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: testConnection,
					disabled: testing || saving,
					className: "flex-1 sm:flex-none h-11",
					children: testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-2 animate-spin" }), "Testing…"] }) : testResult === "ok" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 mr-2 text-profit" }), "Connected"] }) : testResult === "fail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 mr-2 text-loss" }), "Failed — retry"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4 mr-2" }), "Test connection"] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving || testing,
					className: "flex-1 sm:flex-none h-11 bg-gradient-primary shadow-glow hover:opacity-95 px-8 font-semibold",
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 mr-2 animate-spin" }), "Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4 mr-2" }), "Save configuration"] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 text-xs text-muted-foreground rounded-xl border border-border/40 bg-surface/50 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5 mt-0.5 shrink-0 text-profit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Credentials are stored in the Supabase database with row-level security. Only admins can read or write payment configuration. The payment system reads credentials directly from the database on each transaction — no redeploy needed. Secret values are masked in the UI." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border/40 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowLegacy((p) => !p),
					className: "w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legacy Daraja / M-Pesa Direct credentials (not used)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px]",
						children: showLegacy ? "▲ Hide" : "▼ Show"
					})]
				}), showLegacy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 pb-5 pt-2 space-y-5 border-t border-border/30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "These fields are no longer used by the payment system since migrating to SasaPay. They are kept here for reference only."
					}), DARAJA_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldRow, {
						field,
						value: config[field.key],
						shown: !!show[field.key],
						onChange: (val) => set(field.key, val),
						onToggleShow: () => toggleShow(field.key)
					}, field.key))]
				})]
			})
		]
	});
}
function FieldRow({ field, value, shown, onChange, onToggleShow }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: field.key,
				className: "text-sm font-medium",
				children: field.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: field.hint
			}),
			field.options ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: field.options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(opt.value),
					className: `flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all ${value === opt.value ? "border-primary/60 bg-primary/10 text-primary font-semibold" : "border-border/60 bg-surface/60 hover:border-primary/30"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: opt.label }), value === opt.value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-primary" })]
				}, opt.value))
			}) : field.secret ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: field.key,
					type: shown ? "text" : "password",
					placeholder: field.placeholder,
					className: "h-11 pr-10 font-mono text-sm",
					value,
					onChange: (e) => onChange(e.target.value),
					autoComplete: "off"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onToggleShow,
					className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
					"aria-label": shown ? "Hide" : "Show",
					children: shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: field.key,
				placeholder: field.placeholder,
				className: "h-11 font-mono text-sm",
				value,
				onChange: (e) => onChange(e.target.value),
				autoComplete: "off"
			})
		]
	});
}
//#endregion
export { PaymentConfig as component };
