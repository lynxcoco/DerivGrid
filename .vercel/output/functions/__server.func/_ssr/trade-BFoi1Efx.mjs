import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { a as tick, i as generateCandles, n as calcPnlCents, r as formatPrice, t as ASSETS } from "./market-simulator-B0Vqq1wV.mjs";
import { S as Search, c as TrendingUp, g as StarOff, h as Star, l as TrendingDown, n as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DyyAjTF9.mjs";
import { a as Viewport, i as ScrollAreaThumb, n as Root, r as ScrollAreaScrollbar, t as Corner } from "../_libs/radix-ui__react-scroll-area.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-BFoi1Efx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollBar, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, {})
	]
}));
ScrollArea.displayName = Root.displayName;
var ScrollBar = import_react.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaScrollbar, {
	ref,
	orientation,
	className: cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
}));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
var TIMEFRAMES = [
	{
		label: "M1",
		ms: 6e4
	},
	{
		label: "M5",
		ms: 3e5
	},
	{
		label: "M15",
		ms: 9e5
	},
	{
		label: "H1",
		ms: 36e5
	},
	{
		label: "H4",
		ms: 144e5
	},
	{
		label: "D1",
		ms: 864e5
	}
];
function TradePage() {
	const [selectedAsset, setSelectedAsset] = (0, import_react.useState)(ASSETS[0]);
	const [ticks, setTicks] = (0, import_react.useState)({});
	const [positions, setPositions] = (0, import_react.useState)([]);
	const [closedPositions, setClosedPositions] = (0, import_react.useState)([]);
	const [userId, setUserId] = (0, import_react.useState)("");
	const [favorites, setFavorites] = (0, import_react.useState)(/* @__PURE__ */ new Set([
		"EUR/USD",
		"BTC/USD",
		"XAU/USD"
	]));
	const [search, setSearch] = (0, import_react.useState)("");
	const [tf, setTf] = (0, import_react.useState)(TIMEFRAMES[0]);
	const [side, setSide] = (0, import_react.useState)("buy");
	const [lotSize, setLotSize] = (0, import_react.useState)("0.01");
	const [tp, setTp] = (0, import_react.useState)("");
	const [sl, setSl] = (0, import_react.useState)("");
	const [tradingBalance, setTradingBalance] = (0, import_react.useState)(0);
	const chartRef = (0, import_react.useRef)(null);
	const chartInstance = (0, import_react.useRef)(null);
	const candleSeries = (0, import_react.useRef)(null);
	const intervalRef = (0, import_react.useRef)(null);
	const liveCandle = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(async ({ data }) => {
			if (!data.user) return;
			const uid = data.user.id;
			setUserId(uid);
			const wRes = await supabase.from("wallets").select("balance_cents").eq("user_id", uid).eq("wallet_type", "main").single();
			if (wRes.data) setTradingBalance(wRes.data.balance_cents);
			const { data: openPos } = await supabase.from("positions").select("*").eq("user_id", uid).eq("status", "open").order("opened_at", { ascending: false });
			if (openPos) setPositions(openPos.map((p) => ({
				id: p.id,
				symbol: p.asset_id,
				side: p.side,
				lotSize: p.lot_size,
				entryPrice: p.entry_price,
				tp: p.take_profit,
				sl: p.stop_loss,
				openedAt: new Date(p.opened_at).getTime()
			})));
			const { data: closed } = await supabase.from("positions").select("*").eq("user_id", uid).eq("status", "closed").order("closed_at", { ascending: false }).limit(20);
			if (closed) setClosedPositions(closed);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let ro = null;
		if (chartInstance.current) {
			try {
				chartInstance.current.remove();
			} catch {}
			chartInstance.current = null;
			candleSeries.current = null;
			liveCandle.current = null;
		}
		(async () => {
			try {
				const { createChart, CandlestickSeries } = await import("../_libs/lightweight-charts.mjs").then((n) => n.t);
				if (cancelled || !chartRef.current) return;
				const chart = createChart(chartRef.current, {
					layout: {
						background: { color: "transparent" },
						textColor: "#8b99b5"
					},
					grid: {
						vertLines: { color: "rgba(50,60,80,0.35)" },
						horzLines: { color: "rgba(50,60,80,0.35)" }
					},
					crosshair: { mode: 1 },
					rightPriceScale: { borderColor: "rgba(50,60,80,0.5)" },
					timeScale: {
						borderColor: "rgba(50,60,80,0.5)",
						timeVisible: true,
						secondsVisible: false
					},
					width: chartRef.current.offsetWidth || chartRef.current.parentElement?.offsetWidth || 600,
					height: chartRef.current.offsetHeight || chartRef.current.parentElement?.offsetHeight || 380
				});
				const series = chart.addSeries(CandlestickSeries, {
					upColor: "#22c55e",
					downColor: "#ef4444",
					borderUpColor: "#22c55e",
					borderDownColor: "#ef4444",
					wickUpColor: "#22c55e",
					wickDownColor: "#ef4444"
				});
				const historical = generateCandles(selectedAsset.symbol, 200, tf.ms);
				series.setData(historical);
				chart.timeScale().fitContent();
				liveCandle.current = null;
				if (!cancelled) {
					chartInstance.current = chart;
					candleSeries.current = series;
				} else {
					try {
						chart.remove();
					} catch {}
					return;
				}
				ro = new ResizeObserver(() => {
					if (chartInstance.current && chartRef.current) chartInstance.current.applyOptions({
						width: chartRef.current.offsetWidth || chartRef.current.parentElement?.offsetWidth || 600,
						height: chartRef.current.offsetHeight || chartRef.current.parentElement?.offsetHeight || 380
					});
				});
				ro.observe(chartRef.current.parentElement || chartRef.current);
			} catch (e) {
				if (!cancelled) console.warn("Chart init failed:", e);
			}
		})();
		return () => {
			cancelled = true;
			if (ro) ro.disconnect();
			if (chartInstance.current) {
				try {
					chartInstance.current.remove();
				} catch {}
				chartInstance.current = null;
				candleSeries.current = null;
				liveCandle.current = null;
			}
		};
	}, [selectedAsset.symbol, tf]);
	(0, import_react.useEffect)(() => {
		const snap = {};
		ASSETS.forEach((a) => {
			snap[a.symbol] = tick(a);
		});
		setTicks(snap);
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = setInterval(() => {
			setTicks((prev) => {
				const next = { ...prev };
				ASSETS.forEach((a) => {
					next[a.symbol] = tick(a);
				});
				return next;
			});
		}, 800);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const t = ticks[selectedAsset.symbol];
		if (!t || !candleSeries.current) return;
		const intervalMs = tf.ms;
		const candleTimeSec = Math.floor(t.timestamp / intervalMs) * (intervalMs / 1e3);
		if (!liveCandle.current || liveCandle.current.time !== candleTimeSec) liveCandle.current = {
			time: candleTimeSec,
			open: t.price,
			high: t.price,
			low: t.price,
			close: t.price
		};
		else liveCandle.current = {
			time: candleTimeSec,
			open: liveCandle.current.open,
			high: Math.max(liveCandle.current.high, t.price),
			low: Math.min(liveCandle.current.low, t.price),
			close: t.price
		};
		try {
			candleSeries.current.update(liveCandle.current);
		} catch {}
	}, [
		ticks,
		selectedAsset.symbol,
		tf
	]);
	const currentTick = ticks[selectedAsset.symbol];
	const isUp = (currentTick?.changePct ?? 0) >= 0;
	const filteredAssets = ASSETS.filter((a) => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()));
	(0, import_react.useEffect)(() => {
		if (positions.length === 0 || !userId) return;
		positions.forEach(async (pos) => {
			const t = ticks[pos.symbol];
			if (!t) return;
			const currentPrice = pos.side === "buy" ? t.bid : t.ask;
			let shouldClose = false;
			let reason = "";
			if (pos.tp && pos.side === "buy" && currentPrice >= pos.tp) {
				shouldClose = true;
				reason = "Take Profit ✓";
			}
			if (pos.tp && pos.side === "sell" && currentPrice <= pos.tp) {
				shouldClose = true;
				reason = "Take Profit ✓";
			}
			if (pos.sl && pos.side === "buy" && currentPrice <= pos.sl) {
				shouldClose = true;
				reason = "Stop Loss hit";
			}
			if (pos.sl && pos.side === "sell" && currentPrice >= pos.sl) {
				shouldClose = true;
				reason = "Stop Loss hit";
			}
			if (shouldClose) {
				toast.info(`${pos.symbol} — ${reason}`, { description: `Auto-closed @ ${currentPrice}` });
				await closeTrade(pos.id);
			}
		});
	}, [ticks]);
	const openTrade = async () => {
		const lot = parseFloat(lotSize);
		if (!lot || lot <= 0 || isNaN(lot)) {
			toast.error("Enter a valid lot size");
			return;
		}
		if (!currentTick) {
			toast.error("No price data yet");
			return;
		}
		if (!userId) {
			toast.error("Not authenticated");
			return;
		}
		const liveTradingBalance = (await supabase.from("wallets").select("id, balance_cents").eq("user_id", userId).eq("wallet_type", "main").single()).data?.balance_cents ?? 0;
		setTradingBalance(liveTradingBalance);
		if (liveTradingBalance <= 0) {
			toast.error("No funds in your Wallet. Please deposit funds first.", { duration: 5e3 });
			return;
		}
		const minMargin = Math.round(lot * 10 * 100);
		if (liveTradingBalance < minMargin) {
			toast.error(`Insufficient margin. Need at least KES ${(minMargin / 100).toFixed(2)}.`);
			return;
		}
		const price = side === "buy" ? currentTick.ask : currentTick.bid;
		const savedRes = await supabase.from("positions").insert({
			user_id: userId,
			asset_id: selectedAsset.symbol,
			side,
			lot_size: lot,
			entry_price: price,
			take_profit: tp ? parseFloat(tp) : null,
			stop_loss: sl ? parseFloat(sl) : null,
			status: "open",
			opened_at: (/* @__PURE__ */ new Date()).toISOString()
		}).select().single();
		const saved = savedRes.data;
		const error = savedRes.error;
		if (error) {
			toast.error("Failed to save position: " + error.message);
			return;
		}
		if (!saved) {
			toast.error("Failed to save position — please try again.");
			return;
		}
		setPositions((p) => [...p, {
			id: saved.id,
			symbol: selectedAsset.symbol,
			side,
			lotSize: lot,
			entryPrice: price,
			tp: tp ? parseFloat(tp) : null,
			sl: sl ? parseFloat(sl) : null,
			openedAt: Date.now()
		}]);
		toast.success(`${side.toUpperCase()} ${lot} lot ${selectedAsset.symbol} @ ${formatPrice(price, selectedAsset.pipSize)}`);
		setTp("");
		setSl("");
	};
	const closeTrade = async (id) => {
		const pos = positions.find((p) => p.id === id);
		if (!pos) return;
		const asset = ASSETS.find((a) => a.symbol === pos.symbol);
		const t = ticks[pos.symbol];
		const exitPrice = t ? pos.side === "buy" ? t.bid : t.ask : pos.entryPrice;
		const pnlCents = asset ? calcPnlCents(pos.side, pos.entryPrice, exitPrice, pos.lotSize, asset.pipSize) : 0;
		const { error } = await supabase.from("positions").update({
			status: "closed",
			exit_price: exitPrice,
			pnl_cents: pnlCents,
			closed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id).eq("user_id", userId);
		if (error) {
			toast.error("Failed to close position: " + error.message);
			return;
		}
		if (pnlCents !== 0) {
			const wallet = (await supabase.from("wallets").select("balance_cents, id").eq("user_id", userId).eq("wallet_type", "main").single()).data;
			if (wallet) {
				const newBalance = wallet.balance_cents + pnlCents;
				await supabase.from("wallets").update({
					balance_cents: Math.max(0, newBalance),
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", wallet.id);
				setTradingBalance(Math.max(0, newBalance));
				await supabase.from("transactions").insert({
					user_id: userId,
					wallet_id: wallet.id,
					type: pnlCents >= 0 ? "trade_profit" : "trade_loss",
					amount_cents: pnlCents,
					currency: "KES",
					description: `${pos.side.toUpperCase()} ${pos.lotSize} lot ${pos.symbol} closed @ ${exitPrice}`
				});
				await supabase.from("notifications").insert({
					user_id: userId,
					title: `Position closed — ${pnlCents >= 0 ? "Profit" : "Loss"}`,
					body: `${pos.symbol} ${pos.side.toUpperCase()} ${pos.lotSize} lot closed @ ${exitPrice}. P/L: ${pnlCents >= 0 ? "+" : ""}KES ${(pnlCents / 100).toFixed(2)}`,
					type: "trade",
					is_read: false
				});
			}
		}
		setPositions((p) => p.filter((x) => x.id !== id));
		setClosedPositions((prev) => [{
			id,
			symbol: pos.symbol,
			side: pos.side,
			lot_size: pos.lotSize,
			entry_price: pos.entryPrice,
			exit_price: exitPrice,
			pnl_cents: pnlCents,
			opened_at: new Date(pos.openedAt).toISOString(),
			closed_at: (/* @__PURE__ */ new Date()).toISOString()
		}, ...prev.slice(0, 19)]);
		const pnlDisplay = `${pnlCents >= 0 ? "+" : ""}KES ${(pnlCents / 100).toFixed(2)}`;
		toast.success(`Position closed — P/L: ${pnlDisplay}`, { description: `${pos.symbol} ${pos.side.toUpperCase()} @ ${exitPrice}` });
	};
	const toggleFav = (sym) => {
		setFavorites((f) => {
			const n = new Set(f);
			n.has(sym) ? n.delete(sym) : n.add(sym);
			return n;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[calc(100vh-4rem)] overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden lg:flex flex-col w-60 border-r border-border/50 bg-sidebar shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 border-b border-border/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-surface border border-border/50 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground",
						placeholder: "Search…",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: filteredAssets.map((asset) => {
					const t = ticks[asset.symbol];
					const active = asset.symbol === selectedAsset.symbol;
					const up = (t?.changePct ?? 0) >= 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "button",
						tabIndex: 0,
						onClick: () => setSelectedAsset(asset),
						onKeyDown: (e) => e.key === "Enter" && setSelectedAsset(asset),
						className: `w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer transition-colors hover:bg-sidebar-accent/60 ${active ? "bg-sidebar-accent" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold truncate",
								children: asset.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground truncate capitalize",
								children: asset.category
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 shrink-0",
							children: [t && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-mono",
									children: formatPrice(t.price, asset.pipSize)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: `text-[10px] font-mono ${up ? "text-profit" : "text-loss"}`,
									children: [
										up ? "+" : "",
										t.changePct.toFixed(2),
										"%"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								role: "button",
								tabIndex: 0,
								onClick: (e) => {
									e.stopPropagation();
									toggleFav(asset.symbol);
								},
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.stopPropagation();
										toggleFav(asset.symbol);
									}
								},
								className: "text-muted-foreground hover:text-primary ml-1 cursor-pointer",
								"aria-label": favorites.has(asset.symbol) ? "Remove from favorites" : "Add to favorites",
								children: favorites.has(asset.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-primary text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarOff, { className: "size-3" })
							})]
						})]
					}, asset.symbol);
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "h-12 border-b border-border/50 flex items-center gap-2 px-3 shrink-0 bg-background/80 backdrop-blur overflow-x-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedAsset.symbol,
							onChange: (e) => {
								const a = ASSETS.find((x) => x.symbol === e.target.value);
								if (a) setSelectedAsset(a);
							},
							className: "lg:hidden h-7 rounded-md border border-input bg-surface px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring shrink-0 max-w-[130px]",
							children: ASSETS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: a.symbol,
								children: a.symbol
							}, a.symbol))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden lg:block font-semibold text-sm shrink-0",
							children: selectedAsset.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground hidden sm:block shrink-0",
							children: selectedAsset.name
						}),
						currentTick && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-bold text-sm shrink-0",
								children: formatPrice(currentTick.price, selectedAsset.pipSize)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `text-xs font-mono shrink-0 ${isUp ? "text-profit" : "text-loss"}`,
								children: [
									isUp ? "+" : "",
									currentTick.changePct.toFixed(2),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden md:flex items-center gap-2 text-xs font-mono ml-auto shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-loss",
									children: [
										formatPrice(currentTick.bid, selectedAsset.pipSize),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Bid"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-profit",
									children: [
										formatPrice(currentTick.ask, selectedAsset.pipSize),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Ask"
										})
									]
								})]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `flex items-center gap-0.5 ml-auto shrink-0`,
							children: TIMEFRAMES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setTf(t),
								className: `text-xs px-1.5 py-0.5 rounded transition-colors ${tf.label === t.label ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-surface"}`,
								children: t.label
							}, t.label))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 flex min-h-0 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 min-w-0 min-h-0 bg-background/50 relative",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: chartRef,
							className: "absolute inset-0"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-64 shrink-0 border-l border-border/50 bg-sidebar flex-col hidden lg:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 border-b border-border/50 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-sm",
								children: "New Order"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground font-mono",
								children: tradingBalance > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-profit",
									children: ["KES ", (tradingBalance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/wallet/deposit",
									className: "text-primary hover:underline",
									children: "Deposit funds →"
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 space-y-3 overflow-y-auto flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setSide("buy"),
										className: `py-2.5 rounded-lg text-sm font-bold transition-colors ${side === "buy" ? "bg-profit text-white" : "bg-surface text-muted-foreground hover:bg-surface/80"}`,
										children: "BUY"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setSide("sell"),
										className: `py-2.5 rounded-lg text-sm font-bold transition-colors ${side === "sell" ? "bg-loss text-white" : "bg-surface text-muted-foreground hover:bg-surface/80"}`,
										children: "SELL"
									})]
								}),
								currentTick && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-loss/10 border border-loss/25 p-2.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground uppercase mb-0.5",
											children: "Sell"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-loss text-sm",
											children: formatPrice(currentTick.bid, selectedAsset.pipSize)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg bg-profit/10 border border-profit/25 p-2.5 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground uppercase mb-0.5",
											children: "Buy"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono font-bold text-profit text-sm",
											children: formatPrice(currentTick.ask, selectedAsset.pipSize)
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs text-muted-foreground",
									children: "Lot size"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setLotSize((l) => String(Math.max(.01, +l - .01).toFixed(2))),
											className: "size-8 rounded bg-surface border border-border/50 text-sm hover:bg-accent",
											children: "−"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: lotSize,
											onChange: (e) => setLotSize(e.target.value),
											className: "h-8 text-center font-mono text-sm flex-1"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setLotSize((l) => String((+l + .01).toFixed(2))),
											className: "size-8 rounded bg-surface border border-border/50 text-sm hover:bg-accent",
											children: "+"
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										children: "Take Profit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "optional",
										value: tp,
										onChange: (e) => setTp(e.target.value),
										className: "mt-1 h-8 text-xs font-mono"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										children: "Stop Loss"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "optional",
										value: sl,
										onChange: (e) => setSl(e.target.value),
										className: "mt-1 h-8 text-xs font-mono"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: openTrade,
									className: `w-full h-10 font-bold text-sm ${side === "buy" ? "bg-profit hover:bg-profit/90" : "bg-loss hover:bg-loss/90"} text-white`,
									children: [
										side === "buy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4 mr-1.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4 mr-1.5" }),
										side.toUpperCase(),
										" ",
										selectedAsset.symbol
									]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:hidden border-t border-border/50 bg-sidebar px-3 py-2 flex items-center gap-2 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSide("buy"),
							className: `flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${side === "buy" ? "bg-profit text-white" : "bg-surface text-muted-foreground"}`,
							children: ["BUY ", currentTick ? formatPrice(currentTick.ask, selectedAsset.pipSize) : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setLotSize((l) => String(Math.max(.01, +l - .01).toFixed(2))),
									className: "size-7 rounded bg-surface border border-border/50 text-xs",
									children: "−"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs w-10 text-center",
									children: lotSize
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setLotSize((l) => String((+l + .01).toFixed(2))),
									className: "size-7 rounded bg-surface border border-border/50 text-xs",
									children: "+"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSide("sell"),
							className: `flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${side === "sell" ? "bg-loss text-white" : "bg-surface text-muted-foreground"}`,
							children: ["SELL ", currentTick ? formatPrice(currentTick.bid, selectedAsset.pipSize) : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: openTrade,
							className: `px-3 py-2 rounded-lg text-xs font-bold text-white ${side === "buy" ? "bg-profit" : "bg-loss"}`,
							children: "GO"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border/50 bg-background/80 h-36 overflow-hidden flex flex-col shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "positions",
						className: "flex flex-col h-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-4 border-b border-border/50 flex items-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "h-8 bg-transparent p-0 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "positions",
										className: "text-xs h-8 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0",
										children: [
											"Open (",
											positions.length,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "history",
										className: "text-xs h-8 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0",
										children: "Closed"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "positions",
								className: "flex-1 overflow-y-auto m-0 p-0",
								children: positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-4 text-center text-xs text-muted-foreground",
									children: "No open positions. Use the order ticket to open a trade."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border/40 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-1.5",
												children: "Symbol"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-2 py-1.5",
												children: "Side"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Lots"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Entry"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Current"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "P/L"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-1.5" })
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: positions.map((pos) => {
										const asset = ASSETS.find((a) => a.symbol === pos.symbol);
										const t = ticks[pos.symbol];
										const cur = t ? pos.side === "buy" ? t.bid : t.ask : pos.entryPrice;
										const pnl = asset ? calcPnlCents(pos.side, pos.entryPrice, cur, pos.lotSize, asset.pipSize) / 100 : 0;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/25 hover:bg-surface/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-1.5 font-semibold",
													children: pos.symbol
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: pos.side === "buy" ? "default" : "destructive",
														className: "text-[10px] py-0",
														children: pos.side.toUpperCase()
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: pos.lotSize
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: asset ? formatPrice(pos.entryPrice, asset.pipSize) : pos.entryPrice
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: asset && t ? formatPrice(cur, asset.pipSize) : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: `px-2 py-1.5 text-right font-mono font-semibold ${pnl >= 0 ? "text-profit" : "text-loss"}`,
													children: [
														pnl >= 0 ? "+" : "",
														"$",
														pnl.toFixed(2)
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-1.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => closeTrade(pos.id),
														className: "text-muted-foreground hover:text-destructive",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
													})
												})
											]
										}, pos.id);
									}) })]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "history",
								className: "flex-1 overflow-y-auto m-0 p-0",
								children: closedPositions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-4 text-center text-xs text-muted-foreground",
									children: "No closed trades yet this session."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border/40 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-1.5",
												children: "Symbol"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-2 py-1.5",
												children: "Side"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Lots"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Entry"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "Exit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-2 py-1.5",
												children: "P/L"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-3 py-1.5",
												children: "Closed"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: closedPositions.map((pos) => {
										const asset = ASSETS.find((a) => a.symbol === pos.symbol);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/25 hover:bg-surface/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-1.5 font-semibold",
													children: pos.symbol
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: pos.side === "buy" ? "default" : "destructive",
														className: "text-[10px] py-0",
														children: pos.side.toUpperCase()
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: pos.lot_size
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: asset ? formatPrice(pos.entry_price, asset.pipSize) : pos.entry_price
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-1.5 text-right font-mono",
													children: asset ? formatPrice(pos.exit_price, asset.pipSize) : pos.exit_price
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: `px-2 py-1.5 text-right font-mono font-semibold ${pos.pnl_cents >= 0 ? "text-profit" : "text-loss"}`,
													children: [
														pos.pnl_cents >= 0 ? "+" : "",
														"$",
														(pos.pnl_cents / 100).toFixed(2)
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-1.5 text-right text-muted-foreground",
													children: new Date(pos.closed_at).toLocaleTimeString()
												})
											]
										}, pos.id);
									}) })]
								})
							})
						]
					})
				})
			]
		})]
	});
}
//#endregion
export { TradePage as component };
