import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { T as RefreshCw, c as TrendingUp, ft as CircleAlert, it as ArrowDownToLine, l as TrendingDown, st as Funnel, tt as ArrowUpFromLine, v as Shield, w as Repeat2 } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-BXtZPC7o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EVENT_META = {
	"deposit:completed": {
		label: "Deposit confirmed",
		icon: ArrowDownToLine,
		color: "text-profit",
		bg: "bg-profit/15"
	},
	"deposit:pending": {
		label: "Deposit pending",
		icon: ArrowDownToLine,
		color: "text-warning",
		bg: "bg-warning/15"
	},
	"deposit:failed": {
		label: "Deposit failed",
		icon: ArrowDownToLine,
		color: "text-loss",
		bg: "bg-loss/15"
	},
	"withdrawal:completed": {
		label: "Withdrawal sent",
		icon: ArrowUpFromLine,
		color: "text-loss",
		bg: "bg-loss/15"
	},
	"withdrawal:pending": {
		label: "Withdrawal pending",
		icon: ArrowUpFromLine,
		color: "text-warning",
		bg: "bg-warning/15"
	},
	"withdrawal:cancelled": {
		label: "Withdrawal cancelled",
		icon: ArrowUpFromLine,
		color: "text-muted-foreground",
		bg: "bg-muted/20"
	},
	"bet:win": {
		label: "Bet — User won",
		icon: TrendingUp,
		color: "text-profit",
		bg: "bg-profit/15"
	},
	"bet:loss": {
		label: "Bet — User lost",
		icon: TrendingDown,
		color: "text-loss",
		bg: "bg-loss/15"
	},
	"txn:deposit": {
		label: "Transaction: deposit",
		icon: ArrowDownToLine,
		color: "text-profit",
		bg: "bg-profit/10"
	},
	"txn:withdrawal": {
		label: "Transaction: withdrawal",
		icon: ArrowUpFromLine,
		color: "text-loss",
		bg: "bg-loss/10"
	},
	"txn:transfer_in": {
		label: "Transaction: transfer in",
		icon: Repeat2,
		color: "text-primary",
		bg: "bg-primary/10"
	},
	"txn:transfer_out": {
		label: "Transaction: transfer out",
		icon: Repeat2,
		color: "text-muted-foreground",
		bg: "bg-muted/20"
	}
};
var DEFAULT_ICON = {
	label: "Event",
	icon: Shield,
	color: "text-muted-foreground",
	bg: "bg-muted/20"
};
var FILTERS = [
	"all",
	"deposit",
	"withdrawal",
	"bet",
	"transaction"
];
function AdminAudit() {
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [hasFetched, setHasFetched] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const load = async () => {
		setLoading(true);
		const [{ data: txs }, { data: deps }, { data: wds }, { data: bets }] = await Promise.all([
			supabase.from("transactions").select("id, user_id, type, amount_cents, currency, created_at").order("created_at", { ascending: false }).limit(60),
			supabase.from("deposits").select("id, user_id, amount_cents, currency, status, created_at, phone").order("created_at", { ascending: false }).limit(40),
			supabase.from("withdrawals").select("id, user_id, amount_cents, currency, status, created_at, phone").order("created_at", { ascending: false }).limit(40),
			supabase.from("candle_bets").select("id, user_id, bet_amount_cents, outcome, created_at").order("created_at", { ascending: false }).limit(60)
		]);
		setEntries([
			...(txs ?? []).map((t) => ({
				id: `txn-${t.id}`,
				event: `txn:${t.type}`,
				category: "transaction",
				user_id: t.user_id,
				amount: `KES ${(Math.abs(t.amount_cents) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
				status: "completed",
				ts: t.created_at
			})),
			...(deps ?? []).map((d) => ({
				id: `dep-${d.id}`,
				event: `deposit:${d.status}`,
				category: "deposit",
				user_id: d.user_id,
				amount: `KES ${(d.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
				status: d.status,
				ts: d.created_at,
				meta: d.phone ?? void 0
			})),
			...(wds ?? []).map((w) => ({
				id: `wd-${w.id}`,
				event: `withdrawal:${w.status}`,
				category: "withdrawal",
				user_id: w.user_id,
				amount: `KES ${(w.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
				status: w.status,
				ts: w.created_at,
				meta: w.phone ?? void 0
			})),
			...(bets ?? []).map((b) => ({
				id: `bet-${b.id}`,
				event: `bet:${b.outcome}`,
				category: "bet",
				user_id: b.user_id,
				amount: `KES ${(b.bet_amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
				status: b.outcome,
				ts: b.created_at
			}))
		].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 200));
		setLoading(false);
		setHasFetched(true);
	};
	const visible = filter === "all" ? entries : entries.filter((e) => e.category === filter);
	const counts = {
		all: entries.length,
		deposit: entries.filter((e) => e.category === "deposit").length,
		withdrawal: entries.filter((e) => e.category === "withdrawal").length,
		bet: entries.filter((e) => e.category === "bet").length,
		transaction: entries.filter((e) => e.category === "transaction").length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-6 text-primary" }), "Audit Log"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "All financial events across the platform in chronological order."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: load,
					disabled: loading,
					className: "bg-gradient-primary shadow-glow hover:opacity-95 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` }), hasFetched ? "Refresh" : "Load records"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 flex-wrap",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "size-4 text-muted-foreground self-center shrink-0" }), FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setFilter(f),
					className: `px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${filter === f ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"}`,
					children: [f === "all" ? "All events" : f, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-border/60"}`,
						children: counts[f]
					})]
				}, f))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 space-y-3",
					children: [...Array(10)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 rounded-lg" }, i))
				}) : !hasFetched ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-20 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-10 text-muted-foreground/30 mx-auto mb-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-sm font-medium",
							children: "Audit log not loaded"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1 mb-5",
							children: "Click \"Load records\" to fetch platform events on demand."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: load,
							className: "bg-gradient-primary shadow-glow hover:opacity-95 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), "Load records"]
						})
					]
				}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-16 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8 text-muted-foreground/40 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-sm",
						children: "No events found for this filter."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border/25",
					children: visible.map((e) => {
						const meta = EVENT_META[e.event] ?? DEFAULT_ICON;
						const Icon = meta.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `size-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 ${meta.color}` })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-xs font-semibold ${meta.color}`,
											children: meta.label
										}), e.meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground font-mono",
											children: e.meta
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] text-muted-foreground font-mono mt-0.5",
										children: [e.user_id.slice(0, 12), "…"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-mono text-sm font-semibold shrink-0 ${meta.color}`,
									children: e.amount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground shrink-0 hidden sm:block tabular-nums",
									children: new Date(e.ts).toLocaleString("en-KE", {
										day: "2-digit",
										month: "short",
										hour: "2-digit",
										minute: "2-digit"
									})
								})
							]
						}, e.id);
					})
				})
			})
		]
	});
}
//#endregion
export { AdminAudit as component };
