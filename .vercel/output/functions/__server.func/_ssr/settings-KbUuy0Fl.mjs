import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { $ as Bell, D as Moon, L as Globe, O as Monitor, m as Sun, ot as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Separator } from "./separator-B3hsz7IR.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-KbUuy0Fl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_PREFS = {
	notify_trades: true,
	notify_deposits: true,
	notify_alerts: true,
	notify_promos: false,
	theme: "dark",
	currency: "USD",
	language: "en"
};
function SettingsPage() {
	const [prefs, setPrefs] = (0, import_react.useState)(DEFAULT_PREFS);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const meta = user.user_metadata ?? {};
			setPrefs({
				notify_trades: meta.notify_trades ?? DEFAULT_PREFS.notify_trades,
				notify_deposits: meta.notify_deposits ?? DEFAULT_PREFS.notify_deposits,
				notify_alerts: meta.notify_alerts ?? DEFAULT_PREFS.notify_alerts,
				notify_promos: meta.notify_promos ?? DEFAULT_PREFS.notify_promos,
				theme: meta.theme ?? DEFAULT_PREFS.theme,
				currency: meta.currency ?? DEFAULT_PREFS.currency,
				language: meta.language ?? DEFAULT_PREFS.language
			});
			setLoading(false);
		})();
	}, []);
	const save = async () => {
		setSaving(true);
		try {
			const { error } = await supabase.auth.updateUser({ data: prefs });
			if (error) throw error;
			toast.success("Settings saved");
		} catch (e) {
			toast.error(e?.message ?? "Could not save settings");
		} finally {
			setSaving(false);
		}
	};
	const set = (key, value) => setPrefs((p) => ({
		...p,
		[key]: value
	}));
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-40" }), [...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 rounded-2xl" }, i))]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-bold",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Customize your trading experience. Changes are saved to your account."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Appearance"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm",
						children: "Theme"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2 mt-2",
						children: [
							"dark",
							"light",
							"system"
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => set("theme", t),
							className: `flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm capitalize transition-all ${prefs.theme === t ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/60 hover:border-primary/30"}`,
							children: [t === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5" }) : t === "light" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "size-3.5" }), t]
						}, t))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-sm",
						children: "Display currency"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: prefs.currency,
						onChange: (e) => set("currency", e.target.value),
						className: "mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "USD",
								children: "USD — US Dollar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "KES",
								children: "KES — Kenyan Shilling"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "EUR",
								children: "EUR — Euro"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "GBP",
								children: "GBP — British Pound"
							})
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Notifications"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Trade executed",
						desc: "Notify when a position opens or closes",
						checked: prefs.notify_trades,
						onCheckedChange: (v) => set("notify_trades", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Deposits & withdrawals",
						desc: "Notify on wallet credit / debit",
						checked: prefs.notify_deposits,
						onCheckedChange: (v) => set("notify_deposits", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Price alerts",
						desc: "Notify when your alerts trigger",
						checked: prefs.notify_alerts,
						onCheckedChange: (v) => set("notify_alerts", v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						label: "Promotions & announcements",
						desc: "News and special offers from DerivGrid",
						checked: prefs.notify_promos,
						onCheckedChange: (v) => set("notify_promos", v)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Language"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: prefs.language,
					onChange: (e) => set("language", e.target.value),
					className: "w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "en",
							children: "English"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "sw",
							children: "Swahili"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "fr",
							children: "French"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: save,
				disabled: saving,
				className: "bg-gradient-primary shadow-glow hover:opacity-95",
				children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 mr-1.5 animate-spin" }), "Saving…"] }) : "Save settings"
			})
		]
	});
}
function ToggleRow({ label, desc, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground mt-0.5",
			children: desc
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange
		})]
	});
}
//#endregion
export { SettingsPage as component };
