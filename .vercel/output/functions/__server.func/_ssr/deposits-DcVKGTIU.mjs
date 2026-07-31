import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { F as Info, T as RefreshCw, ct as CircleX, dt as CircleCheck, ot as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as usePlatformSettings } from "./use-platform-settings-DHp5bHM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deposits-DcVKGTIU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_STYLES = {
	completed: "bg-profit/15 text-profit border-profit/25",
	pending: "bg-warning/15 text-warning border-warning/25",
	failed: "bg-loss/15 text-loss border-loss/25",
	processing: "bg-primary/15 text-primary border-primary/25",
	cancelled: "bg-muted/30 text-muted-foreground border-border/40"
};
var FILTERS = [
	"all",
	"pending",
	"processing",
	"completed",
	"failed"
];
var fmtKes = (c, cur = "KES") => `${cur} ${(c / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
var fmtDate = (s) => new Date(s).toLocaleString("en-KE", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
});
function AdminDeposits() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [acting, setActing] = (0, import_react.useState)(null);
	const { settings } = usePlatformSettings({ fresh: true });
	const autoApprove = settings.auto_approve_deposits ?? true;
	const load = async () => {
		setLoading(true);
		let q = supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(300);
		if (filter !== "all") q = q.eq("status", filter);
		const { data } = await q;
		setRows(data ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [filter]);
	const approve = async (d) => {
		if (acting) return;
		setActing(d.id);
		try {
			const claim = await supabase.from("deposits").update({
				status: "completed",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", d.id).eq("status", "pending").select("wallet_id").single();
			if (claim.error || !claim.data) {
				toast.error("Already processed");
				load();
				return;
			}
			const { data: w } = await supabase.from("wallets").select("balance_cents").eq("id", claim.data.wallet_id).single();
			await Promise.all([
				supabase.from("wallets").update({
					balance_cents: w.balance_cents + d.amount_cents,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", claim.data.wallet_id),
				supabase.from("transactions").insert({
					user_id: d.user_id,
					wallet_id: claim.data.wallet_id,
					type: "deposit",
					amount_cents: d.amount_cents,
					currency: d.currency,
					description: "Admin-approved deposit"
				}),
				supabase.from("notifications").insert({
					user_id: d.user_id,
					title: "Deposit approved ✓",
					body: `${fmtKes(d.amount_cents, d.currency)} has been credited to your wallet.`,
					type: "deposit",
					is_read: false
				})
			]);
			toast.success("Deposit approved");
			load();
		} catch {
			toast.error("Failed to approve");
		}
		setActing(null);
	};
	const reject = async (id) => {
		if (acting) return;
		setActing(id);
		await supabase.from("deposits").update({
			status: "failed",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id);
		toast.info("Deposit rejected");
		load();
		setActing(null);
	};
	const pending = rows.filter((r) => r.status === "pending").length;
	const totalCompleted = rows.filter((r) => r.status === "completed").reduce((s, r) => s + r.amount_cents, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold",
					children: "Deposits"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-0.5",
					children: [
						rows.length,
						" records",
						filter === "all" && totalCompleted > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-profit font-medium",
							children: fmtKes(totalCompleted)
						})] }),
						pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-warning font-semibold",
							children: [pending, " pending"]
						})] })
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: load,
					disabled: loading,
					className: "gap-1.5 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			autoApprove ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-profit/30 bg-profit/8 px-4 py-2.5 flex items-center gap-2 text-xs text-profit",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Auto-approve is ON" }), " — M-Pesa deposits are credited instantly via the SasaPay callback. No manual action needed."] })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-warning/30 bg-warning/8 px-4 py-2.5 flex items-center gap-2 text-xs text-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Manual approval required" }), " — deposits stay pending until you approve. Change this in Platform Settings."] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1.5 flex-wrap",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setFilter(f),
					className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"}`,
					children: [f, f === "pending" && pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-warning text-black text-[9px] font-bold",
						children: pending
					})]
				}, f))
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }, i))
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center text-sm text-muted-foreground",
				children: "No deposits found."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3 font-semibold",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Phone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Reference"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-5 py-3 font-semibold",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3.5 font-mono font-semibold text-sm",
								children: fmtKes(d.amount_cents, d.currency)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium",
									children: d.phone ?? "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] text-muted-foreground font-mono",
									children: [d.user_id.slice(0, 12), "…"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3.5 font-mono text-[10px] text-muted-foreground max-w-[140px] truncate",
								children: d.provider_ref ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-[10px] capitalize ${STATUS_STYLES[d.status] ?? ""}`,
									children: d.status
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap",
								children: fmtDate(d.created_at)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3.5 text-right",
								children: [d.status === "pending" && !autoApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: acting === d.id,
										onClick: () => approve(d),
										className: "h-7 text-xs gap-1 text-profit hover:bg-profit/10",
										children: [acting === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Approve"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: !!acting,
										onClick: () => reject(d.id),
										className: "h-7 text-xs gap-1 text-loss hover:bg-loss/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), "Reject"]
									})]
								}), d.status === "pending" && autoApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground",
									children: "auto-processing"
								})]
							})
						]
					}, d.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:hidden space-y-2",
				children: rows.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/50 bg-gradient-surface p-4 space-y-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono font-bold text-base",
								children: fmtKes(d.amount_cents, d.currency)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: d.phone ?? "—"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `text-[10px] capitalize shrink-0 ${STATUS_STYLES[d.status] ?? ""}`,
								children: d.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[10px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono truncate max-w-[160px]",
								children: d.provider_ref ?? "No reference"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0",
								children: fmtDate(d.created_at)
							})]
						}),
						d.status === "pending" && !autoApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-1 border-t border-border/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: acting === d.id,
								onClick: () => approve(d),
								className: "flex-1 h-8 text-xs gap-1.5 text-profit border-profit/30 hover:bg-profit/10",
								children: [acting === d.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Approve"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: !!acting,
								onClick: () => reject(d.id),
								className: "flex-1 h-8 text-xs gap-1.5 text-loss border-loss/30 hover:bg-loss/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), "Reject"]
							})]
						}),
						d.status === "pending" && autoApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground pt-1 border-t border-border/30",
							children: "Auto-processing via SasaPay callback…"
						})
					]
				}, d.id))
			})] })
		]
	});
}
//#endregion
export { AdminDeposits as component };
