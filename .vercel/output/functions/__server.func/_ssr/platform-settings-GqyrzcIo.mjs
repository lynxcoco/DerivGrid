import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { $ as Bell, C as Save, H as DollarSign, T as RefreshCw, b as Settings, c as TrendingUp, v as Shield } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as invalidatePlatformSettings } from "./use-platform-settings-DHp5bHM-.mjs";
import { t as Separator } from "./separator-B3hsz7IR.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-settings-GqyrzcIo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FieldGroup({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-sm font-medium",
				children: label
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}),
			children
		]
	});
}
function SectionCard({ icon: Icon, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2.5 px-4 sm:px-6 py-4 border-b border-border/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-7 rounded-lg bg-primary/12 flex items-center justify-center shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold text-sm sm:text-base",
				children: title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 sm:px-6 py-5 space-y-4",
			children
		})]
	});
}
function ToggleRow({ title, desc, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4 min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium leading-snug",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mt-0.5 leading-snug",
				children: desc
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange,
			className: "shrink-0 mt-0.5"
		})]
	});
}
function AdminSettings() {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [minDeposit, setMinDeposit] = (0, import_react.useState)("10");
	const [maxDeposit, setMaxDeposit] = (0, import_react.useState)("150000");
	const [minWithdrawal, setMinWithdrawal] = (0, import_react.useState)("10");
	const [maxWithdrawal, setMaxWithdrawal] = (0, import_react.useState)("300000");
	const [minBet, setMinBet] = (0, import_react.useState)("10");
	const [autoApproveDeposits, setAutoApproveDeposits] = (0, import_react.useState)(true);
	const [requireAdminWithdrawals, setRequireAdminWithdrawals] = (0, import_react.useState)(true);
	const [maintenanceMode, setMaintenanceMode] = (0, import_react.useState)(false);
	const [emailNotifications, setEmailNotifications] = (0, import_react.useState)(true);
	const [lastUpdated, setLastUpdated] = (0, import_react.useState)(null);
	const load = async () => {
		setLoading(true);
		const { data, error } = await supabase.from("platform_settings").select("*").eq("id", "global").single();
		if (error) {
			toast.error("Failed to load settings");
			setLoading(false);
			return;
		}
		const row = data;
		setMinDeposit(String(row.min_deposit_cents / 100));
		setMaxDeposit(String(row.max_deposit_cents / 100));
		setMinWithdrawal(String(row.min_withdrawal_cents / 100));
		setMaxWithdrawal(String(row.max_withdrawal_cents / 100));
		setMinBet(String((row.min_bet_cents ?? 1e3) / 100));
		setAutoApproveDeposits(row.auto_approve_deposits);
		setRequireAdminWithdrawals(row.require_admin_withdrawals);
		setMaintenanceMode(row.maintenance_mode);
		setEmailNotifications(row.email_notifications);
		setLastUpdated(row.updated_at);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const save = async () => {
		const vals = {
			minDeposit,
			maxDeposit,
			minWithdrawal,
			maxWithdrawal,
			minBet
		};
		for (const [k, v] of Object.entries(vals)) if (!v || isNaN(parseFloat(v)) || parseFloat(v) < 0) {
			toast.error(`Invalid value for ${k.replace(/([A-Z])/g, " $1").toLowerCase()}`);
			return;
		}
		setSaving(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			const { error } = await supabase.from("platform_settings").upsert({
				id: "global",
				min_deposit_cents: Math.round(parseFloat(minDeposit) * 100),
				max_deposit_cents: Math.round(parseFloat(maxDeposit) * 100),
				min_withdrawal_cents: Math.round(parseFloat(minWithdrawal) * 100),
				max_withdrawal_cents: Math.round(parseFloat(maxWithdrawal) * 100),
				min_bet_cents: Math.round(parseFloat(minBet) * 100),
				auto_approve_deposits: autoApproveDeposits,
				require_admin_withdrawals: requireAdminWithdrawals,
				maintenance_mode: maintenanceMode,
				email_notifications: emailNotifications,
				updated_at: (/* @__PURE__ */ new Date()).toISOString(),
				updated_by: user?.id ?? null
			});
			if (error) throw new Error(error.message);
			invalidatePlatformSettings();
			setLastUpdated((/* @__PURE__ */ new Date()).toISOString());
			toast.success("Settings saved successfully");
		} catch (e) {
			toast.error(e?.message ?? "Failed to save settings");
		} finally {
			setSaving(false);
		}
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-56 rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72 rounded" }),
			[...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-44 rounded-2xl" }, i))
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 pb-12 space-y-5 max-w-2xl mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5 sm:size-6 text-primary shrink-0" }), "Platform Settings"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs sm:text-sm text-muted-foreground mt-1",
							children: "Configure platform-wide behaviour. Changes take effect immediately."
						}),
						lastUpdated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground/70 mt-0.5",
							children: ["Last saved: ", new Date(lastUpdated).toLocaleString()]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: load,
					disabled: loading,
					className: "shrink-0 size-9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
				})]
			}),
			maintenanceMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 flex items-start gap-3 text-sm font-medium text-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Maintenance mode is ON — trading and deposits are disabled for all users." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				icon: TrendingUp,
				title: "Trading Limits (KES)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
					label: "Minimum bet amount",
					hint: "Smallest amount a user can bet on Candle Predict",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						className: "h-10 font-mono",
						value: minBet,
						onChange: (e) => setMinBet(e.target.value),
						placeholder: "10"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				icon: DollarSign,
				title: "Payment Limits (KES)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 xs:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
							label: "Min Deposit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								className: "h-10 font-mono",
								value: minDeposit,
								onChange: (e) => setMinDeposit(e.target.value),
								placeholder: "10"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
							label: "Max Deposit",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								className: "h-10 font-mono",
								value: maxDeposit,
								onChange: (e) => setMaxDeposit(e.target.value),
								placeholder: "150000"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
							label: "Min Withdrawal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								className: "h-10 font-mono",
								value: minWithdrawal,
								onChange: (e) => setMinWithdrawal(e.target.value),
								placeholder: "10"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldGroup, {
							label: "Max Withdrawal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								className: "h-10 font-mono",
								value: maxWithdrawal,
								onChange: (e) => setMaxWithdrawal(e.target.value),
								placeholder: "300000"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionCard, {
				icon: Shield,
				title: "Security & Approvals",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						title: "Auto-approve deposits",
						desc: "Credit wallet immediately on M-Pesa confirmation",
						checked: autoApproveDeposits,
						onChange: setAutoApproveDeposits
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						title: "Admin approval for withdrawals",
						desc: "All withdrawals require admin review before processing",
						checked: requireAdminWithdrawals,
						onChange: setRequireAdminWithdrawals
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
						title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-warning",
							children: "Maintenance mode"
						}),
						desc: "Disables all trading and deposits platform-wide",
						checked: maintenanceMode,
						onChange: setMaintenanceMode
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionCard, {
				icon: Bell,
				title: "Admin Notifications",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRow, {
					title: "Email notifications",
					desc: "Receive alerts for pending withdrawals and support tickets",
					checked: emailNotifications,
					onChange: setEmailNotifications
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					disabled: saving,
					className: "bg-gradient-primary shadow-glow hover:opacity-95 w-full sm:w-auto h-11 px-8 text-sm font-semibold",
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 mr-2 animate-spin" }), "Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4 mr-2" }), "Save settings"] })
				})
			})
		]
	});
}
//#endregion
export { AdminSettings as component };
