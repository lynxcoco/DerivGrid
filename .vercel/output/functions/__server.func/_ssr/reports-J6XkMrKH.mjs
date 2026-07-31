import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { J as ChevronDown, K as ChevronUp, R as FileText, S as Search, T as RefreshCw, V as Download, Z as Calendar, c as TrendingUp, ft as CircleAlert, it as ArrowDownToLine, l as TrendingDown, tt as ArrowUpFromLine } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-J6XkMrKH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fmt = (c) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
var STATUS_BADGE = {
	completed: "bg-profit/15 text-profit",
	pending: "bg-warning/15 text-warning",
	failed: "bg-loss/15 text-loss",
	cancelled: "bg-muted/20 text-muted-foreground",
	processing: "bg-primary/15 text-primary"
};
function toISOStart(d) {
	const c = new Date(d);
	c.setHours(0, 0, 0, 0);
	return c.toISOString();
}
function toISOEnd(d) {
	const c = new Date(d);
	c.setHours(23, 59, 59, 999);
	return c.toISOString();
}
function periodRange(p, from, to) {
	const now = /* @__PURE__ */ new Date();
	if (p === "today") return [toISOStart(now), toISOEnd(now)];
	if (p === "yesterday") {
		const y = new Date(now);
		y.setDate(y.getDate() - 1);
		return [toISOStart(y), toISOEnd(y)];
	}
	if (p === "week") {
		const w = new Date(now);
		w.setDate(w.getDate() - 6);
		return [toISOStart(w), toISOEnd(now)];
	}
	if (p === "month") return [toISOStart(new Date(now.getFullYear(), now.getMonth(), 1)), toISOEnd(now)];
	return [toISOStart(new Date(from)), toISOEnd(new Date(to))];
}
function periodLabel(p, from, to) {
	if (p === "today") return "Today";
	if (p === "yesterday") return "Yesterday";
	if (p === "week") return "Last 7 days";
	if (p === "month") return "This month";
	return `${from} → ${to}`;
}
function downloadCSV(filename, headers, rows) {
	const lines = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, "\"\"")}"`).join(","))];
	const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function KpiCard({ label, value, sub, icon: Icon, color, bg }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4 lg:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between mb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `size-7 sm:size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 sm:size-4 ${color}` })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `text-xs sm:text-sm lg:text-base font-bold font-mono mt-0.5 break-all leading-snug ${color}`,
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight",
				children: sub
			})
		]
	});
}
function SectionHeader({ title, count, onDownload, downloading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-5 py-3.5 border-b border-border/40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold text-sm",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[10px] bg-surface border border-border/60 px-2 py-0.5 rounded-full text-muted-foreground",
				children: [count, " records"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			variant: "outline",
			onClick: onDownload,
			disabled: downloading || count === 0,
			className: "h-7 text-xs gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), downloading ? "Exporting…" : "Download CSV"]
		})]
	});
}
function AdminReports() {
	const [period, setPeriod] = (0, import_react.useState)("today");
	const [fromDate, setFromDate] = (0, import_react.useState)(() => {
		const d = /* @__PURE__ */ new Date();
		d.setDate(1);
		return d.toISOString().slice(0, 10);
	});
	const [toDate, setToDate] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
	const [deposits, setDeposits] = (0, import_react.useState)([]);
	const [withdrawals, setWithdrawals] = (0, import_react.useState)([]);
	const [bets, setBets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [hasFetched, setHasFetched] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("summary");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const [sortField, setSortField] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const load = async () => {
		setLoading(true);
		const [start, end] = periodRange(period, fromDate, toDate);
		const [{ data: deps }, { data: wds }, { data: bs }] = await Promise.all([
			supabase.from("deposits").select("id, user_id, amount_cents, currency, status, phone, provider_ref, created_at").gte("created_at", start).lte("created_at", end).order("created_at", { ascending: false }).limit(2e3),
			supabase.from("withdrawals").select("id, user_id, amount_cents, currency, status, phone, provider_ref, created_at").gte("created_at", start).lte("created_at", end).order("created_at", { ascending: false }).limit(2e3),
			supabase.from("candle_bets").select("id, user_id, bet_amount_cents, outcome, gross_return_cents, net_profit_cents, created_at").gte("created_at", start).lte("created_at", end).order("created_at", { ascending: false }).limit(2e3)
		]);
		setDeposits(deps ?? []);
		setWithdrawals(wds ?? []);
		setBets(bs ?? []);
		setHasFetched(true);
		setLoading(false);
	};
	const completedDeps = deposits.filter((d) => d.status === "completed");
	const completedWds = withdrawals.filter((w) => w.status === "completed");
	const totalDepVol = completedDeps.reduce((s, d) => s + d.amount_cents, 0);
	const totalWdVol = completedWds.reduce((s, w) => s + w.amount_cents, 0);
	const netFlow = totalDepVol - totalWdVol;
	const totalStaked = bets.reduce((s, b) => s + b.bet_amount_cents, 0);
	const totalPayouts = bets.filter((b) => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0);
	const housePnl = totalStaked - totalPayouts;
	const winBets = bets.filter((b) => b.outcome === "win").length;
	const winRate = bets.length > 0 ? (winBets / bets.length * 100).toFixed(1) : "0.0";
	const pendingDeps = deposits.filter((d) => d.status === "pending").length;
	const pendingWds = withdrawals.filter((w) => w.status === "pending").length;
	const toggleSort = (field) => {
		if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortField(field);
			setSortDir("desc");
		}
	};
	const SortIcon = ({ field }) => sortField === field ? sortDir === "desc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 inline ml-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3 inline ml-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 inline ml-0.5 opacity-30" });
	const applyDepFilter = (rows) => rows.filter((r) => statusFilter === "all" || r.status === statusFilter).filter((r) => !search || r.phone?.includes(search) || r.user_id.includes(search) || r.provider_ref?.includes(search) || false).sort((a, b) => {
		const av = sortField === "amount_cents" ? a.amount_cents : new Date(a.created_at).getTime();
		const bv = sortField === "amount_cents" ? b.amount_cents : new Date(b.created_at).getTime();
		return sortDir === "asc" ? av - bv : bv - av;
	});
	const applyWdFilter = (rows) => rows.filter((r) => statusFilter === "all" || r.status === statusFilter).filter((r) => !search || r.phone?.includes(search) || r.user_id.includes(search) || false).sort((a, b) => {
		const av = sortField === "amount_cents" ? a.amount_cents : new Date(a.created_at).getTime();
		const bv = sortField === "amount_cents" ? b.amount_cents : new Date(b.created_at).getTime();
		return sortDir === "asc" ? av - bv : bv - av;
	});
	const applyBetFilter = (rows) => rows.filter((r) => statusFilter === "all" || r.outcome === statusFilter).filter((r) => !search || r.user_id.includes(search)).sort((a, b) => {
		const av = sortField === "amount_cents" ? a.bet_amount_cents : new Date(a.created_at).getTime();
		const bv = sortField === "amount_cents" ? b.bet_amount_cents : new Date(b.created_at).getTime();
		return sortDir === "asc" ? av - bv : bv - av;
	});
	const visibleDeps = applyDepFilter(deposits);
	const visibleWds = applyWdFilter(withdrawals);
	const visibleBets = applyBetFilter(bets);
	const label = periodLabel(period, fromDate, toDate).replace(/\s+/g, "_").replace(/→/g, "to");
	const exportDeposits = () => {
		setDownloading(true);
		downloadCSV(`deposits_${label}.csv`, [
			"ID",
			"User ID",
			"Phone",
			"Amount (KES)",
			"Status",
			"Provider Ref",
			"Date"
		], visibleDeps.map((d) => [
			d.id,
			d.user_id,
			d.phone ?? "",
			(d.amount_cents / 100).toFixed(2),
			d.status,
			d.provider_ref ?? "",
			d.created_at
		]));
		setDownloading(false);
	};
	const exportWithdrawals = () => {
		setDownloading(true);
		downloadCSV(`withdrawals_${label}.csv`, [
			"ID",
			"User ID",
			"Phone",
			"Amount (KES)",
			"Status",
			"Provider Ref",
			"Date"
		], visibleWds.map((w) => [
			w.id,
			w.user_id,
			w.phone ?? "",
			(w.amount_cents / 100).toFixed(2),
			w.status,
			w.provider_ref ?? "",
			w.created_at
		]));
		setDownloading(false);
	};
	const exportBets = () => {
		setDownloading(true);
		downloadCSV(`bets_${label}.csv`, [
			"ID",
			"User ID",
			"Stake (KES)",
			"Outcome",
			"Payout (KES)",
			"Net P/L (KES)",
			"Date"
		], visibleBets.map((b) => [
			b.id,
			b.user_id,
			(b.bet_amount_cents / 100).toFixed(2),
			b.outcome,
			b.outcome === "win" ? (b.gross_return_cents / 100).toFixed(2) : "0.00",
			(b.net_profit_cents / 100).toFixed(2),
			b.created_at
		]));
		setDownloading(false);
	};
	const exportSummary = () => {
		setDownloading(true);
		downloadCSV(`summary_${label}.csv`, ["Metric", "Value"], [
			["Period", periodLabel(period, fromDate, toDate)],
			["Total Deposits (completed)", (totalDepVol / 100).toFixed(2)],
			["Total Deposits (count)", completedDeps.length],
			["Pending Deposits", pendingDeps],
			["Total Withdrawals (completed)", (totalWdVol / 100).toFixed(2)],
			["Total Withdrawals (count)", completedWds.length],
			["Pending Withdrawals", pendingWds],
			["Net Cash Flow", (netFlow / 100).toFixed(2)],
			["Total Bets", bets.length],
			["Total Staked", (totalStaked / 100).toFixed(2)],
			["Total Payouts", (totalPayouts / 100).toFixed(2)],
			["House P/L", (housePnl / 100).toFixed(2)],
			["User Win Rate (%)", winRate]
		]);
		setDownloading(false);
	};
	const PERIODS = [
		{
			value: "today",
			label: "Today"
		},
		{
			value: "yesterday",
			label: "Yesterday"
		},
		{
			value: "week",
			label: "Last 7 days"
		},
		{
			value: "month",
			label: "This month"
		},
		{
			value: "custom",
			label: "Custom range"
		}
	];
	const TABS = [
		{
			value: "summary",
			label: "Summary"
		},
		{
			value: "deposits",
			label: `Deposits (${deposits.length})`
		},
		{
			value: "withdrawals",
			label: `Withdrawals (${withdrawals.length})`
		},
		{
			value: "bets",
			label: `Bets (${bets.length})`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-start justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-xl sm:text-2xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 sm:size-6 text-primary shrink-0" }), "Finance Reports"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-1",
					children: "Select a period and fetch records. Export any dataset as CSV."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border/60 bg-gradient-surface shadow-card px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-foreground whitespace-nowrap",
								children: "Reporting Period"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: period,
							onChange: (e) => setPeriod(e.target.value),
							className: "flex-1 sm:flex-none sm:w-44 h-8 rounded-lg border border-border/60 bg-surface text-xs px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary",
							children: PERIODS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.value,
								children: p.label
							}, p.value))
						}),
						period === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								className: "h-8 text-xs w-36 shrink-0",
								value: fromDate,
								onChange: (e) => setFromDate(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground shrink-0",
								children: "→"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								className: "h-8 text-xs w-36 shrink-0",
								value: toDate,
								onChange: (e) => setToDate(e.target.value)
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: load,
							disabled: loading,
							size: "sm",
							className: "bg-gradient-primary shadow-glow hover:opacity-95 gap-1.5 h-8 shrink-0 ml-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` }), loading ? "Loading…" : hasFetched ? "Refresh" : "Fetch"]
						})
					]
				})
			}),
			!hasFetched && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card py-20 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-10 text-muted-foreground/30 mx-auto mb-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-sm font-medium",
						children: "No data loaded yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: "Select a period above and click \"Fetch records\"."
					})
				]
			}),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",
					children: [...Array(8)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-2xl" }, i))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-2xl" })]
			}),
			hasFetched && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Showing: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: periodLabel(period, fromDate, toDate)
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Deposits (completed)",
							value: fmt(totalDepVol),
							sub: `${completedDeps.length} transactions`,
							icon: ArrowDownToLine,
							color: "text-profit",
							bg: "bg-profit/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Withdrawals (completed)",
							value: fmt(totalWdVol),
							sub: `${completedWds.length} transactions`,
							icon: ArrowUpFromLine,
							color: "text-loss",
							bg: "bg-loss/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Net Cash Flow",
							value: `${netFlow >= 0 ? "+" : "−"}${fmt(netFlow)}`,
							sub: netFlow >= 0 ? "More in than out" : "More out than in",
							icon: netFlow >= 0 ? TrendingUp : TrendingDown,
							color: netFlow >= 0 ? "text-profit" : "text-loss",
							bg: netFlow >= 0 ? "bg-profit/10" : "bg-loss/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Pending Actions",
							value: `${pendingDeps + pendingWds}`,
							sub: `${pendingDeps} deposits · ${pendingWds} withdrawals`,
							icon: CircleAlert,
							color: pendingDeps + pendingWds > 0 ? "text-warning" : "text-muted-foreground",
							bg: pendingDeps + pendingWds > 0 ? "bg-warning/10" : "bg-muted/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Total Bets",
							value: bets.length.toLocaleString(),
							sub: `Win rate: ${winRate}%`,
							icon: TrendingUp,
							color: "text-primary",
							bg: "bg-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Total Staked",
							value: fmt(totalStaked),
							sub: `${bets.length} bets placed`,
							icon: TrendingUp,
							color: "text-primary",
							bg: "bg-primary/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "House P/L",
							value: `${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`,
							sub: "Staked minus payouts",
							icon: housePnl >= 0 ? TrendingUp : TrendingDown,
							color: housePnl >= 0 ? "text-profit" : "text-loss",
							bg: housePnl >= 0 ? "bg-profit/10" : "bg-loss/10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Total Payouts",
							value: fmt(totalPayouts),
							sub: `${winBets} winning bets`,
							icon: ArrowUpFromLine,
							color: "text-warning",
							bg: "bg-warning/10"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 border-b border-border/40 overflow-x-auto",
					children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveTab(t.value),
						className: `px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === t.value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
						children: t.label
					}, t.value))
				}),
				activeTab !== "summary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 max-w-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search phone, user ID, reference…",
							className: "pl-9 h-9 text-sm",
							value: search,
							onChange: (e) => setSearch(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 flex-wrap",
						children: [
							activeTab === "deposits" && [
								"all",
								"completed",
								"pending",
								"failed",
								"cancelled"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStatusFilter(s),
								className: `px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`,
								children: s
							}, s)),
							activeTab === "withdrawals" && [
								"all",
								"completed",
								"pending",
								"cancelled"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStatusFilter(s),
								className: `px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`,
								children: s
							}, s)),
							activeTab === "bets" && [
								"all",
								"win",
								"loss"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setStatusFilter(s),
								className: `px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`,
								children: s === "all" ? "All bets" : s === "win" ? "Wins" : "Losses"
							}, s))
						]
					})]
				}),
				activeTab === "summary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Period Summary",
						count: 1,
						onDownload: exportSummary,
						downloading
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border/30",
						children: [
							{
								group: "Deposits",
								rows: [
									[
										"Completed deposits",
										fmt(totalDepVol),
										completedDeps.length + " txns"
									],
									[
										"Pending deposits",
										pendingDeps.toString(),
										"awaiting processing"
									],
									[
										"Failed / cancelled",
										deposits.filter((d) => ["failed", "cancelled"].includes(d.status)).length.toString(),
										""
									]
								]
							},
							{
								group: "Withdrawals",
								rows: [
									[
										"Completed withdrawals",
										fmt(totalWdVol),
										completedWds.length + " txns"
									],
									[
										"Pending withdrawals",
										pendingWds.toString(),
										"awaiting approval"
									],
									[
										"Cancelled",
										withdrawals.filter((w) => w.status === "cancelled").length.toString(),
										""
									]
								]
							},
							{
								group: "Net Flow",
								rows: [[
									"Net cash movement",
									`${netFlow >= 0 ? "+" : "−"}${fmt(netFlow)}`,
									netFlow >= 0 ? "net positive" : "net negative"
								]]
							},
							{
								group: "Trading",
								rows: [
									[
										"Total bets placed",
										bets.length.toLocaleString(),
										""
									],
									[
										"Total staked",
										fmt(totalStaked),
										""
									],
									[
										"Total payouts to winners",
										fmt(totalPayouts),
										`${winBets} wins`
									],
									[
										"House P/L",
										`${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`,
										""
									],
									[
										"User win rate",
										`${winRate}%`,
										`${winBets} wins / ${bets.length} bets`
									]
								]
							}
						].map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-2 bg-surface/40 border-b border-border/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
								children: section.group
							})
						}), section.rows.map(([label, value, note]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-surface/30 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs sm:text-sm text-muted-foreground shrink-0 min-w-0",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-semibold text-xs sm:text-sm break-all",
									children: value
								}), note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground mt-0.5",
									children: note
								})]
							})]
						}, label))] }, section.group))
					})]
				}),
				activeTab === "deposits" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Deposits",
						count: visibleDeps.length,
						onDownload: exportDeposits,
						downloading
					}), visibleDeps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-7 text-muted-foreground/30 mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No deposits match this filter."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-3 sm:px-5 py-3 font-semibold",
											children: "Phone / User"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("amount_cents"),
											children: ["Amount ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "amount_cents" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-2 sm:px-4 py-3 font-semibold",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-3 font-semibold hidden md:table-cell",
											children: "Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("created_at"),
											children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "created_at" })]
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visibleDeps.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 sm:px-5 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-xs font-medium",
												children: d.phone ?? "—"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground font-mono hidden sm:block",
												children: [d.user_id.slice(0, 14), "…"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-semibold text-profit text-xs whitespace-nowrap",
											children: fmt(d.amount_cents)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] border-0 capitalize ${STATUS_BADGE[d.status] ?? ""}`,
												children: d.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-[10px] text-muted-foreground hidden md:table-cell",
											children: d.provider_ref ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden sm:inline",
												children: new Date(d.created_at).toLocaleString("en-KE", {
													day: "2-digit",
													month: "short",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sm:hidden",
												children: new Date(d.created_at).toLocaleDateString("en-KE", {
													day: "2-digit",
													month: "short"
												})
											})]
										})
									]
								}, d.id)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t-2 border-border/40 bg-surface/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase",
											children: [visibleDeps.length, " records"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-bold text-profit text-xs whitespace-nowrap",
											children: fmt(visibleDeps.reduce((s, d) => s + d.amount_cents, 0))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 3 })
									]
								}) })
							]
						})
					})]
				}),
				activeTab === "withdrawals" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Withdrawals",
						count: visibleWds.length,
						onDownload: exportWithdrawals,
						downloading
					}), visibleWds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-7 text-muted-foreground/30 mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No withdrawals match this filter."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-3 sm:px-5 py-3 font-semibold",
											children: "Phone / User"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("amount_cents"),
											children: ["Amount ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "amount_cents" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-2 sm:px-4 py-3 font-semibold",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-4 py-3 font-semibold hidden md:table-cell",
											children: "Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("created_at"),
											children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "created_at" })]
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visibleWds.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 sm:px-5 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-xs font-medium",
												children: w.phone ?? "—"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground font-mono hidden sm:block",
												children: [w.user_id.slice(0, 14), "…"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-semibold text-loss text-xs whitespace-nowrap",
											children: ["−", fmt(w.amount_cents)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] border-0 capitalize ${STATUS_BADGE[w.status] ?? ""}`,
												children: w.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-[10px] text-muted-foreground hidden md:table-cell",
											children: w.provider_ref ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "hidden sm:inline",
												children: new Date(w.created_at).toLocaleString("en-KE", {
													day: "2-digit",
													month: "short",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sm:hidden",
												children: new Date(w.created_at).toLocaleDateString("en-KE", {
													day: "2-digit",
													month: "short"
												})
											})]
										})
									]
								}, w.id)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t-2 border-border/40 bg-surface/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase",
											children: [visibleWds.length, " records"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-bold text-loss text-xs whitespace-nowrap",
											children: ["−", fmt(visibleWds.reduce((s, w) => s + w.amount_cents, 0))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 3 })
									]
								}) })
							]
						})
					})]
				}),
				activeTab === "bets" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
						title: "Candle Bets",
						count: visibleBets.length,
						onDownload: exportBets,
						downloading
					}), visibleBets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-7 text-muted-foreground/30 mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No bets match this filter."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-3 sm:px-5 py-3 font-semibold",
											children: "User ID"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("amount_cents"),
											children: ["Stake ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "amount_cents" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-left px-2 sm:px-4 py-3 font-semibold",
											children: "Result"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right px-2 sm:px-4 py-3 font-semibold",
											children: "Payout"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "text-right px-2 sm:px-4 py-3 font-semibold hidden sm:table-cell",
											children: "House P/L"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											className: "text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none",
											onClick: () => toggleSort("created_at"),
											children: ["Date ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { field: "created_at" })]
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visibleBets.map((b) => {
									const houseTake = b.outcome === "loss" ? b.bet_amount_cents : b.bet_amount_cents - b.gross_return_cents;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-3 sm:px-5 py-3 font-mono text-[10px] text-muted-foreground",
												children: [b.user_id.slice(0, 10), "…"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 sm:px-4 py-3 text-right font-mono font-semibold text-xs whitespace-nowrap",
												children: fmt(b.bet_amount_cents)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 sm:px-4 py-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: `text-[10px] border-0 font-semibold ${b.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
													children: b.outcome === "win" ? "WIN" : "LOSS"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-2 sm:px-4 py-3 text-right font-mono text-xs whitespace-nowrap",
												children: b.outcome === "win" ? fmt(b.gross_return_cents) : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: `px-2 sm:px-4 py-3 text-right font-mono text-xs font-semibold whitespace-nowrap hidden sm:table-cell ${houseTake >= 0 ? "text-profit" : "text-loss"}`,
												children: [houseTake >= 0 ? "+" : "−", fmt(Math.abs(houseTake))]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "hidden sm:inline",
													children: new Date(b.created_at).toLocaleString("en-KE", {
														day: "2-digit",
														month: "short",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "sm:hidden",
													children: new Date(b.created_at).toLocaleDateString("en-KE", {
														day: "2-digit",
														month: "short"
													})
												})]
											})
										]
									}, b.id);
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t-2 border-border/40 bg-surface/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase",
											children: [visibleBets.length, " bets"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-bold text-xs whitespace-nowrap",
											children: fmt(visibleBets.reduce((s, b) => s + b.bet_amount_cents, 0))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-2 sm:px-4 py-3" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-bold text-warning text-xs whitespace-nowrap",
											children: fmt(visibleBets.filter((b) => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2 sm:px-4 py-3 text-right font-mono font-bold text-profit text-xs whitespace-nowrap hidden sm:table-cell",
											children: ["+", fmt(visibleBets.reduce((s, b) => {
												return s + (b.outcome === "loss" ? b.bet_amount_cents : b.bet_amount_cents - b.gross_return_cents);
											}, 0))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {})
									]
								}) })
							]
						})
					})]
				})
			] })
		]
	});
}
//#endregion
export { AdminReports as component };
