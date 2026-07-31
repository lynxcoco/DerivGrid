import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { I as History, T as RefreshCw, c as TrendingUp, l as TrendingDown } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DyyAjTF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-g8OtrZfW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TX_LABELS = {
	deposit: "Deposit",
	withdrawal: "Withdrawal",
	transfer_in: "Transfer In",
	transfer_out: "Transfer Out",
	trade_profit: "Trade Profit",
	trade_loss: "Trade Loss",
	fee: "Fee"
};
var TX_COLOR = {
	deposit: "text-profit",
	transfer_in: "text-profit",
	trade_profit: "text-profit",
	withdrawal: "text-loss",
	transfer_out: "text-loss",
	trade_loss: "text-loss",
	fee: "text-muted-foreground"
};
var TX_BG = {
	deposit: "bg-profit/15",
	transfer_in: "bg-profit/15",
	trade_profit: "bg-profit/15",
	withdrawal: "bg-loss/15",
	transfer_out: "bg-loss/15",
	trade_loss: "bg-loss/15",
	fee: "bg-muted/20"
};
function fmt(cents, currency = "KES") {
	const abs = Math.abs(cents / 100);
	return currency === "KES" ? `KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function HistoryPage() {
	const [positions, setPositions] = (0, import_react.useState)([]);
	const [transactions, setTransactions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = async () => {
		setLoading(true);
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const [{ data: pos }, { data: txs }] = await Promise.all([supabase.from("positions").select("*").eq("user_id", user.id).eq("status", "closed").order("closed_at", { ascending: false }).limit(50), supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)]);
		setPositions(pos ?? []);
		setTransactions(txs ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const fmtDate = (s) => s ? new Date(s).toLocaleDateString("en-KE", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}) : "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl sm:text-2xl font-bold",
				children: "History"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs sm:text-sm text-muted-foreground mt-0.5",
				children: "Closed trades and transactions."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: load,
				disabled: loading,
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "trades",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "w-full grid grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "trades",
						children: "Trades"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "transactions",
						children: "Transactions"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "trades",
					className: "mt-3",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
					}) : positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface py-14 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-9 text-muted-foreground/30 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No closed trades yet."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: positions.map((p) => {
							const pnl = p.pnl_cents ?? 0;
							const isWin = pnl >= 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `size-7 rounded-lg flex items-center justify-center shrink-0 ${isWin ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
												children: isWin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-sm",
												children: p.asset_id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: p.side === "buy" ? "default" : "destructive",
												className: "text-[10px] px-1.5 py-0",
												children: p.side.toUpperCase()
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `font-mono font-bold text-sm shrink-0 ${isWin ? "text-profit" : "text-loss"}`,
										children: [pnl >= 0 ? "+" : "−", fmt(pnl)]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[10px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Entry"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: p.entry_price
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[10px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Exit"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: p.exit_price ?? "—"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[10px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Lots"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: p.lot_size
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between text-[10px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Closed"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmtDate(p.closed_at) })]
										})
									]
								})]
							}, p.id);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "transactions",
					className: "mt-3",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }, i))
					}) : transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface py-14 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-9 text-muted-foreground/30 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No transactions yet."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-border/30",
							children: transactions.map((tx) => {
								const isCredit = tx.amount_cents >= 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-4 py-3 hover:bg-surface/40 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `size-8 rounded-lg flex items-center justify-center shrink-0 ${TX_BG[tx.type] ?? "bg-muted/20"} ${TX_COLOR[tx.type] ?? "text-muted-foreground"}`,
												children: isCredit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-semibold leading-tight",
													children: TX_LABELS[tx.type] ?? tx.type
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground mt-0.5",
													children: fmtDate(tx.created_at)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: `text-sm font-bold font-mono shrink-0 ${TX_COLOR[tx.type] ?? ""}`,
												children: [isCredit ? "+" : "−", fmt(tx.amount_cents, tx.currency)]
											})
										]
									}), tx.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-muted-foreground mt-1.5 ml-11 leading-snug line-clamp-2",
										children: tx.description
									})]
								}, tx.id);
							})
						})
					})
				})
			]
		})]
	});
}
//#endregion
export { HistoryPage as component };
