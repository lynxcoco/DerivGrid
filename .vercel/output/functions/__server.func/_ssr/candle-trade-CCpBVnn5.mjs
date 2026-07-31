import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { I as History, J as ChevronDown, K as ChevronUp, T as RefreshCw, c as TrendingUp, ft as CircleAlert, l as TrendingDown, lt as CircleQuestionMark, n as X, p as Timer, pt as ChartNoAxesColumn, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as usePlatformSettings } from "./use-platform-settings-DHp5bHM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/candle-trade-CCpBVnn5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EDGE_FN = `https://oevuqograxqkensvqxzt.supabase.co/functions/v1/resolve-bet`;
var ANON_KEY = "sb_publishable_CfibYkdx9UyiVEm0h3oW6A_7MlgOr8k";
var CANDLE_MS = 1e4;
var MAX_CANDLES = 500;
var BET_RESOLVE_S = 10;
var RESULT_MS = 5500;
var OVERLAY_STYLE = `
  @keyframes pop-in {
    0%   { opacity:0; transform:translateY(14px) scale(0.92); }
    14%  { opacity:1; transform:translateY(0)    scale(1.03); }
    22%  { opacity:1; transform:translateY(0)    scale(1);    }
    74%  { opacity:1; transform:translateY(0)    scale(1);    }
    100% { opacity:0; transform:translateY(-8px) scale(0.96); }
  }
`;
var KENYAN_NAMES = [
	"Brian Otieno",
	"Faith Wanjiku",
	"Kevin Mwangi",
	"Grace Akinyi",
	"Dennis Ochieng",
	"Mercy Njeri",
	"Ian Kamau",
	"Winnie Wambui",
	"Victor Kipchoge",
	"Esther Muthoni",
	"Collins Omondi",
	"Joyce Wairimu",
	"Edwin Mutua",
	"Caroline Adhiambo",
	"Francis Kiprotich",
	"Beatrice Njoku",
	"Samuel Koech",
	"Purity Wangari",
	"George Lumumba",
	"Alice Chebet",
	"Patrick Otiende",
	"Lilian Auma",
	"Michael Njoroge",
	"Susan Waweru",
	"Robert Ruto",
	"Ann Mwende",
	"Daniel Maina",
	"Catherine Awuor",
	"Peter Rotich",
	"Agnes Wangeci",
	"Kelvin Oduya",
	"Tabitha Mumo",
	"Stephen Ingosi",
	"Pauline Chesang",
	"Tony Karanja",
	"Vivian Okeyo",
	"Alex Kibet",
	"Jackline Wanjiru",
	"Simon Onyango",
	"Hilda Ndung'u"
];
function randWinAmount() {
	const r = Math.random();
	if (r < .1) return Math.round(150 + Math.random() * 650);
	if (r < .8) return Math.round(800 + Math.random() * 1700);
	return Math.round(2500 + Math.random() * 7500);
}
function useWinnersData() {
	const [current, setCurrent] = (0, import_react.useState)(null);
	const [key, setKey] = (0, import_react.useState)(0);
	const counter = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const cycle = () => {
			setCurrent({
				id: ++counter.current,
				name: KENYAN_NAMES[Math.floor(Math.random() * KENYAN_NAMES.length)],
				amount: randWinAmount(),
				multiplier: (1.1 + Math.random() * 3.47).toFixed(2)
			});
			setKey((k) => k + 1);
		};
		const t = setTimeout(cycle, 2600);
		const iv = setInterval(cycle, 5200);
		return () => {
			clearTimeout(t);
			clearInterval(iv);
		};
	}, []);
	return {
		current,
		key
	};
}
function LiveWinnersOverlay() {
	const { current, key } = useWinnersData();
	if (!current) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: OVERLAY_STYLE }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden lg:flex fixed bottom-6 right-4 z-50\n          items-center gap-2.5 px-3 py-2.5 rounded-xl\n          bg-gradient-surface border border-profit/30 shadow-elevated backdrop-blur-sm pointer-events-none",
		style: { animation: `pop-in 5.8s ease-in-out forwards` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xl shrink-0",
				children: "🎉"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-foreground truncate max-w-[180px]",
					children: current.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] text-muted-foreground",
					children: "Just Won"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-sm font-bold text-profit font-mono shrink-0",
				children: ["+KES ", current.amount.toLocaleString()]
			})
		]
	}, key)] });
}
function LiveWinnersInline() {
	const { current, key } = useWinnersData();
	if (!current) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: OVERLAY_STYLE }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1 px-2 py-1.5 rounded-lg w-full min-w-0\n          bg-profit/10 border border-profit/30",
		style: { animation: `pop-in 5.8s ease-in-out forwards` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm shrink-0",
				children: "🎉"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 leading-tight flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-semibold text-foreground truncate",
					children: current.name.split(" ")[0]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[9px] text-muted-foreground truncate",
					children: "Just Won"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[10px] font-bold text-profit font-mono shrink-0",
				children: ["+KES ", current.amount.toLocaleString()]
			})
		]
	}, key)] });
}
function CandleChart({ candles }) {
	const containerRef = (0, import_react.useRef)(null);
	const chartRef = (0, import_react.useRef)(null);
	const seriesRef = (0, import_react.useRef)(null);
	const initialViewSet = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let ro = null;
		(async () => {
			try {
				const { createChart, CandlestickSeries } = await import("../_libs/lightweight-charts.mjs").then((n) => n.t);
				if (cancelled || !containerRef.current) return;
				const chart = createChart(containerRef.current, {
					layout: {
						background: { color: "transparent" },
						textColor: "#8b99b5"
					},
					grid: {
						vertLines: { color: "rgba(50,60,80,0.28)" },
						horzLines: { color: "rgba(50,60,80,0.28)" }
					},
					crosshair: { mode: 1 },
					localization: {
						priceFormatter: (price) => price.toFixed(5),
						timeFormatter: (time) => {
							return (/* @__PURE__ */ new Date(time * 1e3)).toLocaleTimeString("en-KE", {
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
								hour12: false,
								timeZone: "Africa/Nairobi"
							});
						}
					},
					rightPriceScale: {
						borderColor: "rgba(50,60,80,0.4)",
						minimumWidth: 70,
						autoScale: true,
						scaleMargins: {
							top: .08,
							bottom: .08
						}
					},
					timeScale: {
						borderColor: "rgba(50,60,80,0.4)",
						timeVisible: true,
						secondsVisible: true,
						tickMarkFormatter: (time) => {
							return (/* @__PURE__ */ new Date(time * 1e3)).toLocaleTimeString("en-KE", {
								hour: "2-digit",
								minute: "2-digit",
								hour12: false,
								timeZone: "Africa/Nairobi"
							});
						}
					},
					width: containerRef.current.offsetWidth || 600,
					height: containerRef.current.offsetHeight || 300
				});
				const series = chart.addSeries(CandlestickSeries, {
					upColor: "#22c55e",
					downColor: "#ef4444",
					borderUpColor: "#22c55e",
					borderDownColor: "#ef4444",
					wickUpColor: "#22c55e",
					wickDownColor: "#ef4444"
				});
				if (!cancelled) {
					chartRef.current = chart;
					seriesRef.current = series;
					ro = new ResizeObserver(() => {
						if (chartRef.current && containerRef.current) chartRef.current.applyOptions({
							width: containerRef.current.offsetWidth,
							height: containerRef.current.offsetHeight
						});
					});
					ro.observe(containerRef.current);
				} else chart.remove();
			} catch (e) {
				console.warn("Chart init failed:", e);
			}
		})();
		return () => {
			cancelled = true;
			if (ro) ro.disconnect();
			if (chartRef.current) {
				try {
					chartRef.current.remove();
				} catch {}
				chartRef.current = null;
			}
			seriesRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!seriesRef.current || !candles.length) return;
		try {
			seriesRef.current.setData(candles);
			if (!initialViewSet.current && chartRef.current) {
				const last = candles[candles.length - 1].time;
				const first = candles[Math.max(0, candles.length - 20)].time;
				chartRef.current.timeScale().setVisibleRange({
					from: first,
					to: last + CANDLE_MS / 1e3 * 2
				});
				initialViewSet.current = true;
			}
		} catch {}
	}, [candles]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: "w-full h-full"
	});
}
function seedEngineCandles(count) {
	let price = 1.085 + (Math.random() - .5) * .005;
	let momentum = 0;
	let sameColorStreak = 0;
	let lastWasGreen = null;
	const nowSec = Math.floor(Date.now() / 1e3);
	return Array.from({ length: count }, (_, i) => {
		momentum = momentum * .82 + (Math.random() - .5) * 25e-5;
		const o = price;
		const bodySize = price * (.001 + Math.random() * .005);
		let bodyDir;
		if (lastWasGreen !== null && sameColorStreak >= 5) bodyDir = lastWasGreen ? -1 : 1;
		else bodyDir = momentum > 0 ? 1 : momentum < 0 ? -1 : Math.random() > .5 ? 1 : -1;
		const c = Math.max(price * .994, Math.min(price * 1.006, o + bodyDir * bodySize * (.4 + Math.random() * .6)));
		const upperWick = Math.abs(c - o) * (.1 + Math.random() * 1.5);
		const lowerWick = Math.abs(c - o) * (.1 + Math.random() * 1.5);
		const h = Math.max(o, c) + upperWick;
		const l = Math.min(o, c) - lowerWick;
		price = c;
		const isGreen = c >= o;
		if (lastWasGreen === isGreen) sameColorStreak++;
		else {
			sameColorStreak = 1;
			lastWasGreen = isGreen;
		}
		return {
			time: nowSec - (count - i) * (CANDLE_MS / 1e3),
			open: o,
			high: h,
			low: l,
			close: c,
			isLive: false
		};
	});
}
function TradeResultOnChart({ result, onDismiss }) {
	const [key] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const t = setTimeout(onDismiss, RESULT_MS);
		return () => clearTimeout(t);
	}, [onDismiss]);
	const isWin = result.is_win;
	const profit = result.net_profit_cents;
	const green = result.outcome_candle === "green";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: OVERLAY_STYLE }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-elevated border backdrop-blur-md",
			style: {
				animation: `pop-in ${RESULT_MS / 1e3}s ease-in-out forwards`,
				background: isWin ? "oklch(0.18 0.06 142 / 0.95)" : "oklch(0.18 0.06 25 / 0.95)",
				borderColor: isWin ? "oklch(0.60 0.18 142 / 0.6)" : "oklch(0.55 0.20 25 / 0.6)"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `size-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black
            ${isWin ? "bg-profit/30 text-profit" : "bg-loss/30 text-loss"}`,
				children: isWin ? "W" : "L"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: `text-lg font-bold font-mono leading-tight ${isWin ? "text-profit" : "text-loss"}`,
				children: [
					isWin ? "+" : "−",
					"KES ",
					(Math.abs(profit) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-white/70 font-mono mt-0.5",
				children: ["Candle ", green ? "▲ green" : "▼ red"]
			})] })]
		})
	}, key)] });
}
function CountdownChip({ total, remaining }) {
	const R = 16, C = 2 * Math.PI * R, progress = remaining / total;
	const clr = remaining > total * .5 ? "oklch(0.72 0.17 162)" : remaining > total * .25 ? "oklch(0.80 0.15 75)" : "oklch(0.65 0.23 25)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-[oklch(0.14_0.02_255/0.92)] border border-border/60 backdrop-blur-sm shadow-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex items-center justify-center size-8 shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				className: "-rotate-90 size-8",
				viewBox: "0 0 40 40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "20",
					cy: "20",
					r: R,
					fill: "none",
					stroke: "rgba(255,255,255,0.12)",
					strokeWidth: "3.5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "20",
					cy: "20",
					r: R,
					fill: "none",
					stroke: clr,
					strokeWidth: "3.5",
					strokeDasharray: C,
					strokeDashoffset: C * (1 - progress),
					strokeLinecap: "round",
					style: { transition: "stroke-dashoffset 0.1s linear, stroke 0.3s" }
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "absolute size-3.5 text-white/80" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-xs font-bold font-mono text-white/90",
			children: [remaining.toFixed(1), "s"]
		})]
	});
}
function HistoryList({ history, loading, fmtKes }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 space-y-2",
		children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 rounded-lg" }, i))
	});
	if (!history.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No trades yet."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground/60 mt-1",
			children: "Your history will appear here."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-border/30",
		children: history.map((row) => {
			const d = new Date(row.created_at);
			const isToday = d.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 py-3 flex items-center justify-between hover:bg-surface/40 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `size-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${row.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
						children: row.outcome === "win" ? "W" : "L"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-medium flex items-center gap-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: row.prediction === "up" ? "text-profit" : "text-loss",
								children: row.prediction === "up" ? "▲ BUY" : "▼ SELL"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: isToday ? d.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit"
							}) : d.toLocaleDateString([], {
								month: "short",
								day: "numeric"
							}) + " · " + d.toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit"
							})
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `text-xs font-mono font-semibold ${row.net_profit_cents >= 0 ? "text-profit" : "text-loss"}`,
						children: [row.net_profit_cents >= 0 ? "+" : "−", fmtKes(Math.abs(row.net_profit_cents))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-muted-foreground",
						children: fmtKes(row.bet_amount_cents)
					})]
				})]
			}, row.id);
		})
	});
}
function CandleTradePage() {
	const { settings, loaded: settingsLoaded } = usePlatformSettings();
	const MIN_BET = settings.min_bet_kes;
	const [balance, setBalance] = (0, import_react.useState)(null);
	const [betAmount, setBetAmount] = (0, import_react.useState)("");
	const [betAmountErr, setBetAmountErr] = (0, import_react.useState)("");
	const [candles, setCandles] = (0, import_react.useState)([]);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [countdown, setCountdown] = (0, import_react.useState)(0);
	const [lastResult, setLastResult] = (0, import_react.useState)(null);
	const [showResult, setShowResult] = (0, import_react.useState)(false);
	const [history, setHistory] = (0, import_react.useState)([]);
	const [histLoading, setHistLoading] = (0, import_react.useState)(true);
	const [showHistory, setShowHistory] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (settingsLoaded && MIN_BET > 0) setBetAmount((prev) => prev === "" ? String(MIN_BET) : prev);
	}, [settingsLoaded, MIN_BET]);
	const [showHowTo, setShowHowTo] = (0, import_react.useState)(false);
	const processingRef = (0, import_react.useRef)(false);
	const tickTimerRef = (0, import_react.useRef)(null);
	const candleTimerRef = (0, import_react.useRef)(null);
	const countdownRef = (0, import_react.useRef)(null);
	const liveCandleTime = (0, import_react.useRef)(0);
	const streakRef = (0, import_react.useRef)({
		count: 0,
		green: null
	});
	const startEngine = (0, import_react.useCallback)(() => {
		let momentum = 0;
		tickTimerRef.current = setInterval(() => {
			momentum = momentum * .82 + (Math.random() - .5) * 25e-5;
			setCandles((prev) => {
				if (!prev.length) return prev;
				const next = [...prev];
				const last = next[next.length - 1];
				const move = momentum * last.open + (Math.random() - .5) * last.open * .0012;
				const close = Math.max(last.open * .995, Math.min(last.open * 1.005, last.close + move));
				next[next.length - 1] = {
					...last,
					close,
					high: Math.max(last.high, close),
					low: Math.min(last.low, close)
				};
				return next;
			});
		}, 400);
		candleTimerRef.current = setInterval(() => {
			setCandles((prev) => {
				if (!prev.length) return prev;
				const t = Math.floor(Date.now() / 1e3);
				liveCandleTime.current = t;
				const closed = prev[prev.length - 1];
				const isGreen = closed.close >= closed.open;
				const s = streakRef.current;
				if (s.green === isGreen) s.count++;
				else {
					s.count = 1;
					s.green = isGreen;
				}
				if (s.count >= 5) momentum = isGreen ? -8e-4 : 8e-4;
				const p = closed.close;
				return [...prev.slice(-499), {
					time: t,
					open: p,
					high: p,
					low: p,
					close: p,
					isLive: true
				}];
			});
		}, CANDLE_MS);
	}, []);
	const stopEngine = (0, import_react.useCallback)(() => {
		if (tickTimerRef.current) {
			clearInterval(tickTimerRef.current);
			tickTimerRef.current = null;
		}
		if (candleTimerRef.current) {
			clearInterval(candleTimerRef.current);
			candleTimerRef.current = null;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const seeded = seedEngineCandles(MAX_CANDLES - 1);
		const now = Math.floor(Date.now() / 1e3), lc = seeded[seeded.length - 1].close;
		liveCandleTime.current = now;
		setCandles([...seeded, {
			time: now,
			open: lc,
			high: lc,
			low: lc,
			close: lc,
			isLive: true
		}]);
		startEngine();
		return stopEngine;
	}, [startEngine, stopEngine]);
	const loadBalance = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const res = await supabase.from("wallets").select("balance_cents").eq("user_id", user.id).eq("wallet_type", "main").single();
		if (res.data) setBalance(res.data.balance_cents);
	};
	const loadHistory = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		setHistLoading(true);
		const { data } = await supabase.from("candle_bets").select("id,bet_amount_cents,prediction,outcome,multiplier,net_profit_cents,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
		setHistory(data ?? []);
		setHistLoading(false);
	};
	(0, import_react.useEffect)(() => {
		loadBalance();
		loadHistory();
		let sub = null;
		let cancelled = false;
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!session?.user || cancelled) return;
			const uid = session.user.id;
			sub = supabase.channel(`ct-${uid}-${Date.now()}`).on("postgres_changes", {
				event: "UPDATE",
				schema: "public",
				table: "wallets",
				filter: `user_id=eq.${uid}`
			}, (p) => {
				if (p.new?.wallet_type === "main") setBalance(p.new.balance_cents ?? 0);
			}).subscribe();
		});
		return () => {
			cancelled = true;
			if (sub) supabase.removeChannel(sub);
		};
	}, []);
	const placeBet = async (prediction) => {
		if (processingRef.current) return;
		const amt = parseFloat(betAmount);
		if (!betAmount || isNaN(amt) || amt < MIN_BET) {
			setBetAmountErr(`Minimum KES ${MIN_BET.toLocaleString()}`);
			return;
		}
		if (balance !== null && Math.round(amt * 100) > balance) {
			setBetAmountErr(balance === 0 ? "Insufficient balance. Please deposit." : `Insufficient. Available: KES ${(balance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`);
			return;
		}
		setBetAmountErr("");
		processingRef.current = true;
		setPending(true);
		setShowResult(false);
		const betStartMs = Date.now();
		let timeLeft = BET_RESOLVE_S;
		setCountdown(timeLeft);
		countdownRef.current = setInterval(() => {
			timeLeft = +(timeLeft - .1).toFixed(1);
			setCountdown(timeLeft);
			if (timeLeft <= 0) {
				clearInterval(countdownRef.current);
				countdownRef.current = null;
			}
		}, 100);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const fetchPromise = fetch(EDGE_FN, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${session?.access_token ?? ""}`,
					"apikey": ANON_KEY
				},
				body: JSON.stringify({
					bet_amount_cents: Math.round(amt * 100),
					prediction
				})
			});
			const fullWaitMs = 10400;
			const elapsed = Date.now() - betStartMs;
			const [res] = await Promise.all([fetchPromise, new Promise((r) => setTimeout(r, Math.max(0, fullWaitMs - elapsed)))]);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? "Bet failed");
			const result = data;
			setLastResult(result);
			setBalance(result.new_balance_cents);
			setShowResult(true);
			setCandles((prev) => {
				if (!prev.length) return prev;
				const next = [...prev];
				const last = next[next.length - 1];
				const nudge = result.outcome_candle === "green" ? last.open + Math.abs(last.close - last.open) + last.open * 3e-4 : last.open - Math.abs(last.close - last.open) - last.open * 3e-4;
				next[next.length - 1] = {
					...last,
					close: nudge,
					high: Math.max(last.high, nudge),
					low: Math.min(last.low, nudge)
				};
				return next;
			});
			loadHistory();
		} catch (e) {
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
				countdownRef.current = null;
			}
			toast.error(e?.message ?? "Bet failed. Try again.");
		} finally {
			setPending(false);
			processingRef.current = false;
			setCountdown(0);
		}
	};
	const fmtKes = (c) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
	const quickAmts = [
		MIN_BET,
		200,
		500,
		1e3
	].filter((a, i) => i === 0 || a > MIN_BET).slice(0, 4);
	const maxBet = balance !== null ? Math.floor(balance / 100) : 0;
	(0, import_react.useMemo)(() => {
		const wins = history.filter((h) => h.outcome === "win");
		return wins.length ? (wins.reduce((s, h) => s + h.multiplier, 0) / wins.length).toFixed(2) : null;
	}, [history]);
	const lastPrice = candles[candles.length - 1]?.close ?? 0;
	const prevClose = candles[candles.length - 2]?.close ?? lastPrice;
	const priceUp = lastPrice >= prevClose;
	const pctChange = prevClose ? (lastPrice - prevClose) / prevClose * 100 : 0;
	const chartCandles = candles.map(({ time, open, high, low, close }) => ({
		time,
		open,
		high,
		low,
		close
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col overflow-hidden bg-background",
		style: { height: "calc(100dvh - 3.5rem)" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "size-3.5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-bold text-sm",
								children: "EUR/USD"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 text-[10px] text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-profit animate-pulse" }), "Live"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-[10px] font-bold text-orange-400",
								children: "🔥 HOT"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] text-muted-foreground leading-none",
						children: [
							"Predict · Win up to ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-profit font-semibold",
								children: "4×"
							}),
							" in 10s"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowHowTo(true),
						className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors text-xs font-medium",
						"aria-label": "How to trade",
						children: ["How to ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-3.5" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowHistory(true),
						className: "size-8 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 text-muted-foreground hover:bg-surface transition-colors",
						"aria-label": "Trade history",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 flex flex-col overflow-hidden min-h-0 p-2 sm:p-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-base sm:text-xl font-bold font-mono tabular-nums ${priceUp ? "text-profit" : "text-loss"}`,
								children: lastPrice.toFixed(5)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `flex items-center gap-0.5 text-xs font-semibold ${priceUp ? "text-profit" : "text-loss"}`,
								children: [
									priceUp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3" }),
									priceUp ? "+" : "",
									pctChange.toFixed(3),
									"%"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-xl border border-border/60 bg-[oklch(0.14_0.02_255)] shadow-card flex-1 min-h-0",
							style: { isolation: "isolate" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute inset-0 rounded-xl overflow-hidden",
									children: candles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "absolute inset-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandleChart, { candles: chartCandles })
								}),
								pending && countdown > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountdownChip, {
									total: BET_RESOLVE_S,
									remaining: countdown
								}),
								showResult && lastResult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeResultOnChart, {
									result: lastResult,
									onDismiss: () => setShowResult(false)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4 shrink-0 space-y-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold text-foreground/80 uppercase tracking-wide",
										children: "Trade Amount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setShowHowTo(true),
										className: "text-[10px] text-primary hover:underline flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-3" }), "How to trade"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative w-32 shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-mono",
												children: "KES"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "bet-amt",
												type: "number",
												min: MIN_BET,
												placeholder: String(MIN_BET),
												className: "h-9 pl-9 font-mono text-sm w-full",
												value: betAmount,
												onChange: (e) => {
													setBetAmount(e.target.value);
													setBetAmountErr("");
												},
												disabled: pending
											})]
										}),
										maxBet > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											disabled: pending,
											type: "button",
											onClick: () => {
												setBetAmount(String(maxBet));
												setBetAmountErr("");
											},
											className: "h-9 px-3 rounded-lg text-xs font-bold border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-40",
											children: "MAX"
										}),
										quickAmts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											disabled: pending,
											type: "button",
											onClick: () => {
												setBetAmount(String(a));
												setBetAmountErr("");
											},
											className: `h-9 px-2.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 shrink-0 ${betAmount === String(a) ? "border-primary/60 bg-primary/15 text-primary" : "border-border/60 bg-surface/60 hover:bg-primary/10 hover:border-primary/40"}`,
											children: a
										}, a)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "lg:hidden flex-1 min-w-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWinnersInline, {})
										})
									]
								}),
								betAmountErr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-destructive flex items-start gap-1.5 bg-destructive/8 border border-destructive/20 rounded-lg px-2.5 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										betAmountErr,
										" ",
										betAmountErr.includes("Insufficient") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/wallet/deposit",
											className: "underline font-medium",
											children: "Deposit →"
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: pending,
										onClick: () => placeBet("up"),
										className: "group relative h-14 sm:h-16 rounded-xl border-2 border-profit/40 bg-profit/10 hover:bg-profit/25 hover:border-profit/70 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_0_12px_rgba(34,197,94,0.15)]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-5 sm:size-6 text-profit group-hover:scale-110 transition-transform" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs sm:text-sm font-black text-profit tracking-wide",
												children: "▲ RISE"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] text-profit/70 font-medium",
												children: "Candle goes green"
											}),
											pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-xl bg-profit/5 animate-pulse" })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: pending,
										onClick: () => placeBet("down"),
										className: "group relative h-14 sm:h-16 rounded-xl border-2 border-loss/40 bg-loss/10 hover:bg-loss/25 hover:border-loss/70 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-5 sm:size-6 text-loss group-hover:scale-110 transition-transform" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs sm:text-sm font-black text-loss tracking-wide",
												children: "▼ FALL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] text-loss/70 font-medium",
												children: "Candle goes red"
											}),
											pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 rounded-xl bg-loss/5 animate-pulse" })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 shrink-0" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Secured by" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground/70",
											children: "DerivGrid"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/wallet/deposit",
											className: "text-primary hover:underline font-medium",
											children: "Add funds →"
										})
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden lg:flex flex-col w-72 xl:w-80 border-l border-border/50 bg-gradient-surface min-h-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-3 border-b border-border/40 flex items-center justify-between shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold text-sm",
								children: "Trade History"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								loadBalance();
								loadHistory();
							},
							className: "size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors",
							"aria-label": "Refresh",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 text-muted-foreground" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto min-h-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, {
							history,
							loading: histLoading,
							fmtKes
						})
					})]
				})]
			}),
			showHistory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:hidden fixed inset-0 z-50 flex flex-col justify-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-black/50 backdrop-blur-[1px]",
					onClick: () => setShowHistory(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative bg-background rounded-t-2xl border-t border-border/60 shadow-elevated max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-center pt-2.5 pb-1 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-10 rounded-full bg-border" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-2.5 border-b border-border/40 flex items-center justify-between shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-sm",
									children: "Trade History"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										loadBalance();
										loadHistory();
									},
									className: "size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors",
									"aria-label": "Refresh",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 text-muted-foreground" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setShowHistory(false),
									className: "size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors",
									"aria-label": "Close",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5 text-muted-foreground" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-y-auto min-h-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, {
								history,
								loading: histLoading,
								fmtKes
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWinnersOverlay, {}),
			showHowTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
					onClick: () => setShowHowTo(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full max-w-sm bg-background rounded-2xl border border-border/60 shadow-elevated animate-in zoom-in-95 duration-200 overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-5 py-4 border-b border-border/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-sm",
									children: "How to Trade"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowHowTo(false),
								className: "size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto",
							children: [
								{
									n: "1",
									title: "Instant Funding",
									desc: "Top up your account in seconds using your preferred payment method."
								},
								{
									n: "2",
									title: "Pick Your Forecast",
									desc: "Predict whether the price will RISE or FALL after the trade window closes."
								},
								{
									n: "3",
									title: "Enter Your Trade",
									desc: "Set your trade amount and select BUY if you predict a rise in price or SELL if you predict a fall in price, to place your trade, depending on your prediction."
								},
								{
									n: "4",
									title: "Wait for Processing",
									desc: "Your trade is locked for 10 seconds while the candle resolves."
								},
								{
									n: "5",
									title: "Claim Your Payout",
									desc: "Winnings are credited to your Wallet instantly on a win."
								},
								{
									n: "6",
									title: "Support",
									desc: "Submit a support ticket from your dashboard if you need any help."
								}
							].map(({ n, title, desc }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5",
									children: n
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold leading-snug",
									children: title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5 leading-snug",
									children: desc
								})] })]
							}, n))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3 border-t border-border/40 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/wallet/deposit",
								className: "flex-1 h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity",
								children: "Deposit funds"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowHowTo(false),
								className: "flex-1 h-9 rounded-lg border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors",
								children: "Got it"
							})]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { CandleTradePage as component };
