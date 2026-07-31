import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { a as tick, t as ASSETS } from "./market-simulator-B0Vqq1wV.mjs";
import { at as TriangleAlert, c as TrendingUp, i as Users, it as ArrowDownToLine, l as TrendingDown, mt as ChartLine, q as ChevronRight, r as Wallet, tt as ArrowUpFromLine, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useRole } from "./use-role-WpM-W494.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-Bk0JphR0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WATCHLIST = [
	"EUR/USD",
	"BTC/USD",
	"XAU/USD",
	"Volatility 75",
	"AAPL"
];
var TX_LABELS = {
	deposit: "Deposit",
	withdrawal: "Withdrawal",
	transfer_in: "Transfer In",
	transfer_out: "Transfer Out",
	trade_profit: "Trade Profit",
	trade_loss: "Trade Loss",
	fee: "Fee"
};
function fmt(cents, currency = "KES") {
	const abs = Math.abs(cents / 100);
	const sign = cents < 0 ? "-" : "";
	if (currency === "KES") return `${sign}KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
	return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function AdminBanner({ stats, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 shadow-glow",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold text-sm",
								children: "Platform Overview"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 font-bold",
								children: "ADMIN"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/overview",
						className: "flex items-center gap-1 text-xs text-primary hover:underline font-medium",
						children: ["Admin Panel ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStat, {
							label: "Total Users",
							value: loading ? null : stats?.totalUsers.toLocaleString() ?? "—",
							icon: Users,
							to: "/admin/users"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStat, {
							label: "Pending Deposits",
							value: loading ? null : stats?.pendingDeposits.toString() ?? "0",
							icon: ArrowDownToLine,
							to: "/admin/deposits",
							urgent: (stats?.pendingDeposits ?? 0) > 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStat, {
							label: "Pending Withdrawals",
							value: loading ? null : stats?.pendingWithdrawals.toString() ?? "0",
							icon: ArrowUpFromLine,
							to: "/admin/withdrawals",
							urgent: (stats?.pendingWithdrawals ?? 0) > 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStat, {
							label: "Open Tickets",
							value: loading ? null : stats?.openTickets.toString() ?? "0",
							icon: TriangleAlert,
							to: "/admin/tickets",
							urgent: (stats?.openTickets ?? 0) > 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStat, {
							label: "Deposit Volume",
							value: loading ? null : fmt(stats?.depositVolume ?? 0),
							icon: TrendingUp,
							to: "/admin/reports"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 mt-4 flex-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/deposits",
							className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-profit/15 text-profit hover:bg-profit/25 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-3" }),
								"Review Deposits",
								(stats?.pendingDeposits ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-4 rounded-full bg-profit text-white text-[10px] font-bold flex items-center justify-center",
									children: stats.pendingDeposits
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/withdrawals",
							className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-loss/15 text-loss hover:bg-loss/25 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpFromLine, { className: "size-3" }),
								"Review Withdrawals",
								(stats?.pendingWithdrawals ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-4 rounded-full bg-loss text-white text-[10px] font-bold flex items-center justify-center",
									children: stats.pendingWithdrawals
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/tickets",
							className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-warning/15 text-warning hover:bg-warning/25 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-3" }),
								"Support Queue",
								(stats?.openTickets ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-4 rounded-full bg-warning text-black text-[10px] font-bold flex items-center justify-center",
									children: stats.openTickets
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/reports",
							className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border/60 text-muted-foreground hover:text-foreground transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { className: "size-3" }), "Reports"]
						})
					]
				})
			]
		})]
	});
}
function AdminStat({ label, value, icon: Icon, to, urgent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: `flex flex-col gap-1 rounded-xl p-3 border transition-colors hover:bg-surface/60 ${urgent ? "border-warning/40 bg-warning/5" : "border-border/50 bg-surface/40"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] uppercase tracking-wider text-muted-foreground truncate",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3 shrink-0 ${urgent ? "text-warning" : "text-muted-foreground"}` })]
		}), value === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-10" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-base font-bold font-mono truncate ${urgent && value !== "0" ? "text-warning" : ""}`,
			children: value
		})]
	});
}
function Dashboard() {
	const [wallets, setWallets] = (0, import_react.useState)([]);
	const [transactions, setTransactions] = (0, import_react.useState)([]);
	const [positions, setPositions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [displayName, setDisplayName] = (0, import_react.useState)("Trader");
	const [ticks, setTicks] = (0, import_react.useState)({});
	const [equityPoints, setEquityPoints] = (0, import_react.useState)([]);
	const [adminStats, setAdminStats] = (0, import_react.useState)(null);
	const [adminStatsLoading, setAdminStatsLoading] = (0, import_react.useState)(true);
	const intervalRef = (0, import_react.useRef)(null);
	const { isAdmin } = useRole();
	const loadData = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader");
		const thirtyDaysAgo = /* @__PURE__ */ new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const [{ data: ws }, { data: txs }, { data: pos }, { data: allTxs }] = await Promise.all([
			supabase.from("wallets").select("id, wallet_type, balance_cents").eq("user_id", user.id),
			supabase.from("transactions").select("id, type, amount_cents, currency, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
			supabase.from("positions").select("id, asset_id, side, lot_size, entry_price, pnl_cents, opened_at, closed_at").eq("user_id", user.id).eq("status", "closed").order("opened_at", { ascending: false }).limit(5),
			supabase.from("transactions").select("amount_cents, created_at").eq("user_id", user.id).gte("created_at", thirtyDaysAgo.toISOString()).order("created_at", { ascending: true })
		]);
		setWallets(ws ?? []);
		setTransactions(txs ?? []);
		setPositions(pos ?? []);
		if (ws && allTxs) {
			const currentBalance = ws.reduce((s, w) => s + w.balance_cents, 0);
			const startBalance = currentBalance - allTxs.reduce((s, t) => s + t.amount_cents, 0);
			const dailyMap = {};
			allTxs.forEach((t) => {
				const day = t.created_at.split("T")[0];
				dailyMap[day] = (dailyMap[day] ?? 0) + t.amount_cents;
			});
			const points = [];
			let running = startBalance;
			for (let i = 29; i >= 0; i--) {
				const d = /* @__PURE__ */ new Date();
				d.setDate(d.getDate() - i);
				const dayStr = d.toISOString().split("T")[0];
				running += dailyMap[dayStr] ?? 0;
				points.push({
					date: dayStr,
					balance_cents: Math.max(0, running)
				});
			}
			if (points.length > 0) points[points.length - 1].balance_cents = currentBalance;
			setEquityPoints(points);
		}
		setLoading(false);
	};
	const loadAdminStats = async () => {
		setAdminStatsLoading(true);
		try {
			const [{ count: users }, { data: deps }, { data: wds }, { count: tickets }] = await Promise.all([
				supabase.from("profiles").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("deposits").select("amount_cents, status"),
				supabase.from("withdrawals").select("amount_cents, status"),
				supabase.from("support_tickets").select("id", {
					count: "exact",
					head: true
				}).eq("status", "open")
			]);
			setAdminStats({
				totalUsers: users ?? 0,
				pendingDeposits: (deps ?? []).filter((d) => d.status === "pending").length,
				pendingWithdrawals: (wds ?? []).filter((w) => w.status === "pending").length,
				openTickets: tickets ?? 0,
				depositVolume: (deps ?? []).filter((d) => d.status === "completed").reduce((s, d) => s + d.amount_cents, 0)
			});
		} catch {}
		setAdminStatsLoading(false);
	};
	(0, import_react.useEffect)(() => {
		loadData();
		if (isAdmin) loadAdminStats();
		const assets = ASSETS.filter((a) => WATCHLIST.includes(a.symbol));
		const snap = {};
		assets.forEach((a) => {
			snap[a.symbol] = tick(a);
		});
		setTicks(snap);
		intervalRef.current = setInterval(() => {
			setTicks((prev) => {
				const next = { ...prev };
				assets.forEach((a) => {
					next[a.symbol] = tick(a);
				});
				return next;
			});
		}, 1500);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [isAdmin]);
	(0, import_react.useEffect)(() => {
		let sub = null;
		let cancelled = false;
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!session?.user || cancelled) return;
			const uid = session.user.id;
			sub = supabase.channel(`dash-wallet-${uid}-${Date.now()}`).on("postgres_changes", {
				event: "*",
				schema: "public",
				table: "wallets",
				filter: `user_id=eq.${uid}`
			}, () => loadData()).on("postgres_changes", {
				event: "INSERT",
				schema: "public",
				table: "transactions",
				filter: `user_id=eq.${uid}`
			}, () => loadData()).subscribe();
		});
		return () => {
			cancelled = true;
			if (sub) supabase.removeChannel(sub);
		};
	}, []);
	const totalBalance = wallets.reduce((s, w) => s + w.balance_cents, 0);
	wallets.find((w) => w.wallet_type === "main");
	wallets.find((w) => w.wallet_type === "main");
	const firstBalance = equityPoints[0]?.balance_cents ?? totalBalance;
	const balanceChange = (equityPoints[equityPoints.length - 1]?.balance_cents ?? totalBalance) - firstBalance;
	const balanceUp = balanceChange >= 0;
	const eqPath = () => {
		if (equityPoints.length < 2) return "";
		const vals = equityPoints.map((p) => p.balance_cents);
		const W = 600;
		const H = 180;
		const min = Math.min(...vals);
		const range = Math.max(...vals) - min || 1;
		return vals.map((v, i) => {
			const x = i / (vals.length - 1) * W;
			const y = H - (v - min) / range * (H - 16) - 8;
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
		}).join(" ");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight truncate",
						children: ["Welcome back, ", loading ? "…" : displayName.split(" ")[0]]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: isAdmin ? "Platform & personal account overview." : "Here's your account snapshot."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 w-full sm:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "bg-gradient-primary shadow-glow hover:opacity-95 flex-1 sm:flex-initial",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet/deposit",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-4 mr-1.5" }), "Deposit"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "flex-1 sm:flex-initial",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet/withdraw",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpFromLine, { className: "size-4 mr-1.5" }), "Withdraw"]
						})
					})]
				})]
			}),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminBanner, {
				stats: adminStats,
				loading: adminStatsLoading
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full sm:max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
					label: "Balance",
					value: loading ? null : fmt(totalBalance),
					icon: Wallet,
					trend: loading ? void 0 : balanceChange === 0 ? "No change this month" : `${balanceUp ? "+" : ""}${fmt(Math.abs(balanceChange))} (30d)`,
					trendUp: balanceChange === 0 ? void 0 : balanceUp,
					accent: true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-2 rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-semibold",
								children: "Portfolio equity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: "30-day balance history"
							})]
						}), !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `font-mono text-sm font-semibold ${balanceUp ? "text-profit" : balanceChange < 0 ? "text-loss" : "text-muted-foreground"}`,
							children: balanceChange === 0 ? "—" : `${balanceUp ? "+" : ""}${fmt(Math.abs(balanceChange))}`
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "w-full h-40 sm:h-44 rounded-xl" }) : equityPoints.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-40 sm:h-44 flex items-center justify-center text-sm text-muted-foreground text-center px-4",
						children: "Make your first deposit to see your equity curve."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: "0 0 600 180",
						className: "w-full h-40 sm:h-44",
						preserveAspectRatio: "none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
								id: "eq",
								x1: "0",
								y1: "0",
								x2: "0",
								y2: "1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "0%",
									stopColor: balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)",
									stopOpacity: "0.35"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
									offset: "100%",
									stopColor: balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)",
									stopOpacity: "0"
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: `${eqPath()} L600,180 L0,180 Z`,
								fill: "url(#eq)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: eqPath(),
								fill: "none",
								stroke: balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)",
								strokeWidth: "2.5",
								strokeLinecap: "round",
								strokeLinejoin: "round"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Markets"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-profit animate-pulse shrink-0" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: WATCHLIST.map((sym) => {
							const t = ticks[sym];
							const up = (t?.changePct ?? 0) >= 0;
							const asset = ASSETS.find((a) => a.symbol === sym);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between items-center text-sm gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium truncate",
									children: sym
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 font-mono shrink-0",
									children: t && asset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.price.toFixed(asset.pipSize < .001 ? 5 : 2) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `text-xs ${up ? "text-profit" : "text-loss"}`,
										children: [
											up ? "+" : "",
											t.changePct.toFixed(2),
											"%"
										]
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" })
								})]
							}, sym);
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Recent trades"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/history",
							className: "text-xs text-primary hover:underline",
							children: "View all"
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 rounded-lg" }, i))
					}) : positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: ["No trades yet. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/trade",
							className: "text-primary hover:underline",
							children: "Start trading →"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto -mx-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm min-w-[280px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-xs text-muted-foreground border-b border-border/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-2 px-1",
										children: "Asset"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-2 px-1",
										children: "Side"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right py-2 px-1",
										children: "P/L"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: positions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/20 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-1 font-medium whitespace-nowrap",
										children: p.asset_id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: p.side === "buy" ? "default" : "destructive",
											className: "text-xs",
											children: p.side.toUpperCase()
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: `py-2.5 px-1 text-right font-mono font-semibold whitespace-nowrap ${(p.pnl_cents ?? 0) >= 0 ? "text-profit" : "text-loss"}`,
										children: p.pnl_cents !== null ? fmt(p.pnl_cents) : "—"
									})
								]
							}, p.id)) })]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Recent transactions"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/wallet",
							className: "text-xs text-primary hover:underline",
							children: "View all"
						})]
					}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 rounded-lg" }, i))
					}) : transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-8 text-center text-sm text-muted-foreground",
						children: ["No transactions yet. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/wallet/deposit",
							className: "text-primary hover:underline",
							children: "Make a deposit →"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto -mx-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm min-w-[280px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-xs text-muted-foreground border-b border-border/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-2 px-1",
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-2 px-1 hidden sm:table-cell",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right py-2 px-1",
										children: "Amount"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: transactions.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/20 last:border-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-1 font-medium whitespace-nowrap",
										children: TX_LABELS[tx.type] ?? tx.type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 px-1 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap",
										children: new Date(tx.created_at).toLocaleDateString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: `py-2.5 px-1 text-right font-mono font-semibold whitespace-nowrap ${tx.amount_cents >= 0 ? "text-profit" : "text-loss"}`,
										children: [tx.amount_cents >= 0 ? "+" : "", fmt(tx.amount_cents, tx.currency)]
									})
								]
							}, tx.id)) })]
						})
					})]
				})]
			})
		]
	});
}
function StatCard({ label, value, icon: Icon, trend, trendUp, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative rounded-2xl border p-4 sm:p-5 shadow-card overflow-hidden ${accent ? "border-primary/30 bg-gradient-surface shadow-glow" : "border-border/60 bg-gradient-surface"}`,
		children: [accent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-gradient-glow opacity-40",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex items-start justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider",
						children: label
					}),
					value === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-7 w-28" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums truncate",
						children: value
					}),
					trend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `mt-1 text-xs font-medium flex items-center gap-1 ${trendUp === true ? "text-profit" : trendUp === false ? "text-loss" : "text-muted-foreground"}`,
						children: [
							trendUp === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3 shrink-0" }),
							trendUp === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: trend
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 ml-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			})]
		})]
	});
}
//#endregion
export { Dashboard as component };
