import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { T as RefreshCw, W as Clock, at as TriangleAlert, c as TrendingUp, i as Users, it as ArrowDownToLine, l as TrendingDown, mt as ChartLine, nt as ArrowRight, tt as ArrowUpFromLine } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/overview-D_7LblWU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_DOT = {
	completed: "bg-profit",
	pending: "bg-warning",
	failed: "bg-loss",
	processing: "bg-primary"
};
var STATUS_LABEL = {
	completed: "text-profit",
	pending: "text-warning",
	failed: "text-loss",
	processing: "text-primary"
};
function AdminOverview() {
	const [stats, setStats] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [recentDeps, setRecentDeps] = (0, import_react.useState)([]);
	const [recentWds, setRecentWds] = (0, import_react.useState)([]);
	const load = async () => {
		setLoading(true);
		const [{ count: users }, { data: deps }, { data: wds }, { count: trades }] = await Promise.all([
			supabase.from("profiles").select("id", {
				count: "exact",
				head: true
			}),
			supabase.from("deposits").select("id,amount_cents,status,currency,created_at,phone").order("created_at", { ascending: false }).limit(100),
			supabase.from("withdrawals").select("id,amount_cents,status,currency,created_at,phone").order("created_at", { ascending: false }).limit(100),
			supabase.from("positions").select("id", {
				count: "exact",
				head: true
			})
		]);
		const d = deps ?? [], w = wds ?? [];
		const depVol = d.filter((x) => x.status === "completed").reduce((s, x) => s + x.amount_cents, 0);
		const wdVol = w.filter((x) => x.status === "completed").reduce((s, x) => s + x.amount_cents, 0);
		setStats({
			users: users ?? 0,
			trades: trades ?? 0,
			depVolume: depVol,
			wdVolume: wdVol,
			pendingDeps: d.filter((x) => x.status === "pending").length,
			pendingWds: w.filter((x) => x.status === "pending").length,
			netFlow: depVol - wdVol
		});
		setRecentDeps(d.slice(0, 6));
		setRecentWds(w.slice(0, 6));
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const kpiCards = stats ? [
		{
			label: "Total Users",
			value: stats.users.toLocaleString(),
			icon: Users,
			color: "text-primary",
			bg: "bg-primary/10",
			link: "/admin/users"
		},
		{
			label: "Deposit Volume",
			value: `KES ${(stats.depVolume / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
			icon: ArrowDownToLine,
			color: "text-profit",
			bg: "bg-profit/10",
			link: "/admin/deposits"
		},
		{
			label: "Withdrawal Volume",
			value: `KES ${(stats.wdVolume / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
			icon: ArrowUpFromLine,
			color: "text-loss",
			bg: "bg-loss/10",
			link: "/admin/withdrawals"
		},
		{
			label: "Net Platform Flow",
			value: `${stats.netFlow >= 0 ? "+" : "−"}KES ${(Math.abs(stats.netFlow) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
			icon: stats.netFlow >= 0 ? TrendingUp : TrendingDown,
			color: stats.netFlow >= 0 ? "text-profit" : "text-loss",
			bg: stats.netFlow >= 0 ? "bg-profit/10" : "bg-loss/10",
			link: "/admin/reports"
		},
		{
			label: "Total Trades",
			value: stats.trades.toLocaleString(),
			icon: ChartLine,
			color: "text-primary",
			bg: "bg-primary/10",
			link: "/admin/trades"
		},
		{
			label: "Pending Actions",
			value: `${stats.pendingDeps + stats.pendingWds} (${stats.pendingDeps}D · ${stats.pendingWds}W)`,
			icon: Clock,
			color: stats.pendingDeps + stats.pendingWds > 0 ? "text-warning" : "text-muted-foreground",
			bg: stats.pendingDeps + stats.pendingWds > 0 ? "bg-warning/10" : "bg-muted/10",
			link: "/admin/deposits",
			urgent: stats.pendingDeps + stats.pendingWds > 0
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold",
					children: "Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-0.5",
					children: "Platform health and activity at a glance."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: load,
					disabled: loading,
					className: "gap-1.5 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Refresh"
					})]
				})]
			}),
			!loading && stats && (stats.pendingDeps > 0 || stats.pendingWds > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4 text-warning shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 text-sm min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-warning",
							children: "Action required — "
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: [
								stats.pendingDeps > 0 && `${stats.pendingDeps} pending deposit${stats.pendingDeps > 1 ? "s" : ""}`,
								stats.pendingDeps > 0 && stats.pendingWds > 0 && " · ",
								stats.pendingWds > 0 && `${stats.pendingWds} pending withdrawal${stats.pendingWds > 1 ? "s" : ""}`
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 shrink-0 flex-wrap",
						children: [stats.pendingDeps > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-7 text-xs border-warning/40 text-warning hover:bg-warning/10",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/deposits",
								children: "Review deposits"
							})
						}), stats.pendingWds > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							className: "h-7 text-xs border-warning/40 text-warning hover:bg-warning/10",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/withdrawals",
								children: "Review withdrawals"
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3",
				children: loading ? [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[72px] rounded-xl" }, i)) : kpiCards.map(({ label, value, icon: Icon, color, bg, link, urgent }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: link,
					className: `group rounded-xl border bg-gradient-surface shadow-card px-4 py-3 flex items-center gap-3 hover:shadow-elevated transition-all ${urgent ? "border-warning/40" : "border-border/60"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 ${color}` })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mb-1",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `text-sm font-bold font-mono leading-none whitespace-nowrap overflow-hidden text-ellipsis ${color}`,
								children: value
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" })
					]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm",
							children: "Recent Deposits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/deposits",
							className: "text-xs text-primary hover:underline flex items-center gap-1 shrink-0",
							children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 space-y-2",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 rounded-lg" }, i))
					}) : recentDeps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No deposits yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border/25",
						children: recentDeps.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `size-2 rounded-full shrink-0 ${STATUS_DOT[d.status] ?? "bg-muted"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-mono font-semibold truncate",
										children: [
											d.currency,
											" ",
											(d.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground truncate",
										children: d.phone ?? "—"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0 ml-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-xs font-medium capitalize ${STATUS_LABEL[d.status] ?? "text-muted-foreground"}`,
									children: d.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: new Date(d.created_at).toLocaleDateString("en-KE", {
										day: "2-digit",
										month: "short"
									})
								})]
							})]
						}, i))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm",
							children: "Recent Withdrawals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/withdrawals",
							className: "text-xs text-primary hover:underline flex items-center gap-1 shrink-0",
							children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" })]
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 space-y-2",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 rounded-lg" }, i))
					}) : recentWds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-8 text-center text-sm text-muted-foreground",
						children: "No withdrawals yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border/25",
						children: recentWds.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `size-2 rounded-full shrink-0 ${STATUS_DOT[w.status] ?? "bg-muted"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-mono font-semibold truncate",
										children: [
											w.currency,
											" ",
											(w.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground truncate",
										children: w.phone ?? "—"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right shrink-0 ml-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-xs font-medium capitalize ${STATUS_LABEL[w.status] ?? "text-muted-foreground"}`,
									children: w.status
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: new Date(w.created_at).toLocaleDateString("en-KE", {
										day: "2-digit",
										month: "short"
									})
								})]
							})]
						}, i))
					})]
				})]
			})
		]
	});
}
//#endregion
export { AdminOverview as component };
