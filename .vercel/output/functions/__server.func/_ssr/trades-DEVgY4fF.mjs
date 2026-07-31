import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { T as RefreshCw, c as TrendingUp, ft as CircleAlert, l as TrendingDown, pt as ChartNoAxesColumn, s as Trophy } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trades-DEVgY4fF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fmt = (c) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
var fmtDate = (s) => new Date(s).toLocaleString("en-KE", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
});
function AdminTrades() {
	const [bets, setBets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const load = async () => {
		setLoading(true);
		let q = supabase.from("candle_bets").select("*").order("created_at", { ascending: false }).limit(300);
		if (filter !== "all") q = q.eq("outcome", filter);
		const { data } = await q;
		setBets(data ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [filter]);
	const totalWins = bets.filter((b) => b.outcome === "win").length;
	const totalLoss = bets.filter((b) => b.outcome === "loss").length;
	const totalBets = bets.length;
	const totalStake = bets.reduce((s, b) => s + b.bet_amount_cents, 0);
	const housePnl = totalStake - bets.filter((b) => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0);
	const winRate = totalBets > 0 ? (totalWins / totalBets * 100).toFixed(1) : "0.0";
	const summaryCards = [
		{
			label: "Total Bets",
			value: totalBets.toLocaleString(),
			icon: ChartNoAxesColumn,
			color: "text-primary",
			bg: "bg-primary/10"
		},
		{
			label: "Total Staked",
			value: fmt(totalStake),
			icon: TrendingUp,
			color: "text-primary",
			bg: "bg-primary/10"
		},
		{
			label: "House P/L",
			value: `${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`,
			icon: housePnl >= 0 ? TrendingUp : TrendingDown,
			color: housePnl >= 0 ? "text-profit" : "text-loss",
			bg: housePnl >= 0 ? "bg-profit/10" : "bg-loss/10"
		},
		{
			label: "User Win Rate",
			value: `${winRate}%`,
			icon: Trophy,
			color: "text-warning",
			bg: "bg-warning/10"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold",
					children: "Trades"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-1",
					children: "Candle Predict bet history across all users."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: load,
					disabled: loading,
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3",
				children: loading ? [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-2xl" }, i)) : summaryCards.map(({ label, value, icon: Icon, color, bg }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `size-7 sm:size-8 rounded-lg ${bg} flex items-center justify-center mb-2`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 sm:size-4 ${color}` })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-xs sm:text-base font-bold font-mono mt-0.5 break-all ${color}`,
							children: value
						})
					]
				}, label))
			}),
			!loading && totalBets > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3 gap-2 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold text-sm",
							children: "Bet Outcomes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-profit inline-block" }),
									totalWins,
									" wins"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-loss inline-block" }),
									totalLoss,
									" losses"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-2 rounded-full bg-loss/30 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-profit rounded-full transition-all",
							style: { width: `${totalWins / totalBets * 100}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between mt-1.5 text-[10px] text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"User wins (",
							winRate,
							"%)"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"House keeps ",
							(100 - parseFloat(winRate)).toFixed(1),
							"%"
						] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1.5",
				children: [
					"all",
					"win",
					"loss"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setFilter(s),
					className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"}`,
					children: s === "all" ? "All bets" : s === "win" ? "🏆 Wins" : "❌ Losses"
				}, s))
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" }, i))
			}) : bets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8 text-muted-foreground/40 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "No bets found."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Prediction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-4 py-3 font-semibold",
								children: "Stake"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-4 py-3 font-semibold",
								children: "Payout"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-4 py-3 font-semibold",
								children: "Net P/L"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Result"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3 font-semibold",
								children: "Date"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: bets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 font-mono text-xs text-muted-foreground",
								children: [b.user_id.slice(0, 10), "…"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: `inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${b.prediction === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
									children: [b.prediction === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }), b.prediction.toUpperCase()]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right font-mono text-sm whitespace-nowrap",
								children: fmt(b.bet_amount_cents)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right font-mono text-sm whitespace-nowrap",
								children: b.outcome === "win" ? fmt(b.gross_return_cents) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: `px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${b.outcome === "win" ? "text-profit" : "text-loss"}`,
								children: b.outcome === "win" ? `+${fmt(b.net_profit_cents)}` : `−${fmt(b.bet_amount_cents)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: `text-xs border-0 font-semibold ${b.outcome === "win" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`,
									children: b.outcome === "win" ? "WIN" : "LOSS"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-5 py-3 text-xs text-muted-foreground whitespace-nowrap",
								children: fmtDate(b.created_at)
							})
						]
					}, b.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:hidden space-y-2",
				children: bets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${b.prediction === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
								children: [b.prediction === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-2.5" }), b.prediction.toUpperCase()]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: `text-[10px] border-0 font-bold ${b.outcome === "win" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`,
								children: b.outcome === "win" ? "WIN" : "LOSS"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground shrink-0",
							children: fmtDate(b.created_at)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-2 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] text-muted-foreground uppercase",
								children: "Stake"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-mono font-semibold",
								children: fmt(b.bet_amount_cents)
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] text-muted-foreground uppercase",
								children: "Payout"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-mono font-semibold text-warning",
								children: b.outcome === "win" ? fmt(b.gross_return_cents) : "—"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] text-muted-foreground uppercase",
								children: "Net P/L"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `text-xs font-mono font-semibold ${b.outcome === "win" ? "text-profit" : "text-loss"}`,
								children: b.outcome === "win" ? `+${fmt(b.net_profit_cents)}` : `−${fmt(b.bet_amount_cents)}`
							})] })
						]
					})]
				}, b.id))
			})] })
		]
	});
}
//#endregion
export { AdminTrades as component };
