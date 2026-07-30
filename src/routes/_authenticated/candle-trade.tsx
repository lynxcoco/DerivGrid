import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, RefreshCw, History,
  AlertCircle, Timer, ChevronUp, ChevronDown,
  BarChart2, X, ShieldCheck, HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/candle-trade")({
  head: () => ({ meta: [{ title: "Candle Predict · DerivGrid" }] }),
  component: CandleTradePage,
});

const EDGE_FN       = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resolve-bet`;
const ANON_KEY      = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;
const CANDLE_MS     = 10000;
const MAX_CANDLES   = 500;  // ~1 hour of history at 8s per candle
const BET_RESOLVE_S = 10;
const RESULT_MS     = 5500;

// ── Types ──────────────────────────────────────────────────────────────────────
type BetResult = {
  multiplier: number; net_profit_cents: number;
  gross_return_cents: number; is_win: boolean;
  message: string; new_balance_cents: number;
  outcome_candle: "green" | "red";
};
type BetHistoryRow = {
  id: string; bet_amount_cents: number; prediction: string;
  outcome: string; multiplier: number; net_profit_cents: number;
  created_at: string;
};
type LWCandle = { time: number; open: number; high: number; low: number; close: number };
type EngineCandle = LWCandle & { isLive: boolean };

// ── Winners + Result shared animation keyframes ────────────────────────────────
const OVERLAY_STYLE = `
  @keyframes pop-in {
    0%   { opacity:0; transform:translateY(14px) scale(0.92); }
    14%  { opacity:1; transform:translateY(0)    scale(1.03); }
    22%  { opacity:1; transform:translateY(0)    scale(1);    }
    74%  { opacity:1; transform:translateY(0)    scale(1);    }
    100% { opacity:0; transform:translateY(-8px) scale(0.96); }
  }
`;

// ── Kenyan winners data ────────────────────────────────────────────────────────
const KENYAN_NAMES = [
  "Brian Otieno","Faith Wanjiku","Kevin Mwangi","Grace Akinyi","Dennis Ochieng",
  "Mercy Njeri","Ian Kamau","Winnie Wambui","Victor Kipchoge","Esther Muthoni",
  "Collins Omondi","Joyce Wairimu","Edwin Mutua","Caroline Adhiambo","Francis Kiprotich",
  "Beatrice Njoku","Samuel Koech","Purity Wangari","George Lumumba","Alice Chebet",
  "Patrick Otiende","Lilian Auma","Michael Njoroge","Susan Waweru","Robert Ruto",
  "Ann Mwende","Daniel Maina","Catherine Awuor","Peter Rotich","Agnes Wangeci",
  "Kelvin Oduya","Tabitha Mumo","Stephen Ingosi","Pauline Chesang","Tony Karanja",
  "Vivian Okeyo","Alex Kibet","Jackline Wanjiru","Simon Onyango","Hilda Ndung'u",
];
function randWinAmount() {
  const r = Math.random();
  if (r < 0.10) return Math.round(150  + Math.random() * 650);
  if (r < 0.80) return Math.round(800  + Math.random() * 1700);
  return          Math.round(2500 + Math.random() * 7500);
}
type WinnerEntry = { id: number; name: string; amount: number; multiplier: string };

// ── Fixed winner overlay — bottom-right, above mobile nav ─────────────────────
// Shared winners data hook
function useWinnersData() {
  const [current, setCurrent] = useState<WinnerEntry | null>(null);
  const [key, setKey] = useState(0);
  const counter = useRef(0);
  useEffect(() => {
    const cycle = () => {
      setCurrent({ id: ++counter.current,
        name: KENYAN_NAMES[Math.floor(Math.random() * KENYAN_NAMES.length)],
        amount: randWinAmount(),
        multiplier: (1.1 + Math.random() * 3.47).toFixed(2) });
      setKey(k => k + 1);
    };
    const t = setTimeout(cycle, 2600);
    const iv = setInterval(cycle, 5200);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);
  return { current, key };
}

// Desktop only — fixed bottom-right corner
function LiveWinnersOverlay() {
  const { current, key } = useWinnersData();
  if (!current) return null;
  return (
    <>
      <style>{OVERLAY_STYLE}</style>
      <div key={key}
        className="hidden lg:flex fixed bottom-6 right-4 z-50
          items-center gap-2.5 px-3 py-2.5 rounded-xl
          bg-gradient-surface border border-profit/30 shadow-elevated backdrop-blur-sm pointer-events-none"
        style={{ animation: `pop-in ${RESULT_MS / 1000 + 0.3}s ease-in-out forwards` }}>
        <span className="text-xl shrink-0">🎉</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate max-w-[180px]">{current.name}</p>
          <p className="text-[10px] text-muted-foreground">Just Won</p>
        </div>
        <span className="text-sm font-bold text-profit font-mono shrink-0">+KES {current.amount.toLocaleString()}</span>
      </div>
    </>
  );
}

// Mobile only — compact, sits on same row as last chip (e.g. 1000), fills remaining flex space
function LiveWinnersInline() {
  const { current, key } = useWinnersData();
  if (!current) return null;

  return (
    <>
      <style>{OVERLAY_STYLE}</style>
      <div key={key}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg w-full min-w-0
          bg-profit/10 border border-profit/30"
        style={{ animation: `pop-in ${RESULT_MS / 1000 + 0.3}s ease-in-out forwards` }}>
        <span className="text-sm shrink-0">🎉</span>
        <div className="min-w-0 leading-tight flex-1">
          <p className="text-[10px] font-semibold text-foreground truncate">{current.name.split(" ")[0]}</p>
          <p className="text-[9px] text-muted-foreground truncate">Just Won</p>
        </div>
        <span className="text-[10px] font-bold text-profit font-mono shrink-0">+KES {current.amount.toLocaleString()}</span>
      </div>
    </>
  );
}
// ── Trade result overlay — SAME animation, same position offset, different styling ──
// Stacked just above the winners badge so both can briefly coexist
function TradeResultOverlay({ result, onDismiss }: { result: BetResult; onDismiss: () => void }) {
  const [key] = useState(() => Date.now());
  useEffect(() => {
    const t = setTimeout(onDismiss, RESULT_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isWin  = result.is_win;
  const profit = result.net_profit_cents;
  const green  = result.outcome_candle === "green";

  return (
    <>
      <style>{OVERLAY_STYLE}</style>
      {/* Positioned above the winners badge: bottom-40 mobile, bottom-24 desktop */}
      <div key={key}
        className="fixed bottom-40 lg:bottom-24 right-3 sm:right-4 z-50
          flex items-center gap-2.5 px-3 py-2.5 rounded-xl shadow-elevated pointer-events-none
          border backdrop-blur-sm"
        style={{
          animation: `pop-in ${RESULT_MS / 1000}s ease-in-out forwards`,
          background: isWin ? "oklch(0.22 0.06 142 / 0.92)" : "oklch(0.22 0.06 25 / 0.92)",
          borderColor: isWin ? "oklch(0.60 0.18 142 / 0.5)" : "oklch(0.55 0.20 25 / 0.5)",
        }}>
        {/* Big W / L icon */}
        <span className={`size-9 rounded-xl flex items-center justify-center shrink-0 text-base font-black
          ${isWin ? "bg-profit/30 text-profit" : "bg-loss/30 text-loss"}`}>
          {isWin ? "W" : "L"}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-bold font-mono ${isWin ? "text-profit" : "text-loss"}`}>
            {isWin ? "+" : "−"}KES {(Math.abs(profit) / 100).toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Candle {green ? "▲ green" : "▼ red"}
          </p>
        </div>
      </div>
    </>
  );
}


// ── Lightweight-charts ─────────────────────────────────────────────────────────
function CandleChart({ candles }: { candles: LWCandle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<any>(null);
  const seriesRef    = useRef<any>(null);
  const initialViewSet = useRef(false);
  useEffect(() => {
    let cancelled = false; let ro: ResizeObserver | null = null;
    (async () => {
      try {
        const { createChart, CandlestickSeries } = await import("lightweight-charts");
        if (cancelled || !containerRef.current) return;
        const chart = createChart(containerRef.current, {
          layout: { background: { color: "transparent" }, textColor: "#8b99b5" },
          grid: { vertLines: { color: "rgba(50,60,80,0.28)" }, horzLines: { color: "rgba(50,60,80,0.28)" } },
          crosshair: { mode: 1 },
          localization: {
            // Force 5 decimal places on the Y-axis (EUR/USD pip-level precision)
            priceFormatter: (price: number) => price.toFixed(5),
            // Display time in EAT (UTC+3)
            timeFormatter: (time: number) => {
              const d = new Date((time) * 1000);
              return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Africa/Nairobi" });
            },
          },
          rightPriceScale: {
            borderColor: "rgba(50,60,80,0.4)",
            minimumWidth: 70,
            autoScale: true,
            scaleMargins: { top: 0.08, bottom: 0.08 },
          },
          timeScale: {
            borderColor: "rgba(50,60,80,0.4)",
            timeVisible: true,
            secondsVisible: true,
            tickMarkFormatter: (time: number) => {
              const d = new Date(time * 1000);
              return d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Nairobi" });
            },
          },
          width:  containerRef.current.offsetWidth  || 600,
          height: containerRef.current.offsetHeight || 300,
        });
        const series = chart.addSeries(CandlestickSeries, {
          upColor: "#22c55e", downColor: "#ef4444",
          borderUpColor: "#22c55e", borderDownColor: "#ef4444",
          wickUpColor: "#22c55e", wickDownColor: "#ef4444",
        });
        if (!cancelled) {
          chartRef.current = chart; seriesRef.current = series;
          ro = new ResizeObserver(() => {
            if (chartRef.current && containerRef.current)
              chartRef.current.applyOptions({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
          });
          ro.observe(containerRef.current);
        } else { chart.remove(); }
      } catch (e) { console.warn("Chart init failed:", e); }
    })();
    return () => {
      cancelled = true; if (ro) ro.disconnect();
      if (chartRef.current) { try { chartRef.current.remove(); } catch {} chartRef.current = null; }
      seriesRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;
    try {
      seriesRef.current.setData(candles as any);
      // First load only: show last ~20 candles so they fill the chart at good size.
      // After that, don't override — lets the user freely scroll back through history.
      if (!initialViewSet.current && chartRef.current) {
        const last  = candles[candles.length - 1].time;
        const first = candles[Math.max(0, candles.length - 20)].time;
        chartRef.current.timeScale().setVisibleRange({
          from: first as any,
          to: (last + (CANDLE_MS / 1000) * 2) as any,
        });
        initialViewSet.current = true;
      }
    } catch {}
  }, [candles]);
  return <div ref={containerRef} className="w-full h-full" />;
}

function seedEngineCandles(count: number): EngineCandle[] {
  let price = 1.0850 + (Math.random() - 0.5) * 0.005;
  let momentum = 0;
  let sameColorStreak = 0;
  let lastWasGreen: boolean | null = null;
  const nowSec = Math.floor(Date.now() / 1000);

  return Array.from({ length: count }, (_, i) => {
    momentum = momentum * 0.82 + (Math.random() - 0.5) * 0.00025;
    const o = price;
    const bodySize = price * (0.001 + Math.random() * 0.005);

    // If same color has appeared 5 times in a row, force the opposite direction
    let bodyDir: number;
    if (lastWasGreen !== null && sameColorStreak >= 5) {
      bodyDir = lastWasGreen ? -1 : 1; // force opposite
    } else {
      bodyDir = momentum > 0 ? 1 : momentum < 0 ? -1 : (Math.random() > 0.5 ? 1 : -1);
    }

    const c = Math.max(price * 0.994, Math.min(price * 1.006, o + bodyDir * bodySize * (0.4 + Math.random() * 0.6)));
    const upperWick = Math.abs(c - o) * (0.1 + Math.random() * 1.5);
    const lowerWick = Math.abs(c - o) * (0.1 + Math.random() * 1.5);
    const h = Math.max(o, c) + upperWick;
    const l = Math.min(o, c) - lowerWick;
    price = c;

    const isGreen = c >= o;
    if (lastWasGreen === isGreen) {
      sameColorStreak++;
    } else {
      sameColorStreak = 1;
      lastWasGreen = isGreen;
    }

    return { time: nowSec - (count - i) * (CANDLE_MS / 1000), open: o, high: h, low: l, close: c, isLive: false };
  });
}

// ── Trade result — shown ON the chart, centered, same pop-in animation ─────────
function TradeResultOnChart({ result, onDismiss }: { result: BetResult; onDismiss: () => void }) {
  const [key] = useState(() => Date.now());
  useEffect(() => {
    const t = setTimeout(onDismiss, RESULT_MS);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isWin  = result.is_win;
  const profit = result.net_profit_cents;
  const green  = result.outcome_candle === "green";

  return (
    <>
      <style>{OVERLAY_STYLE}</style>
      {/* Centered in the chart — absolute center */}
      <div key={key}
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-elevated border backdrop-blur-md"
          style={{
            animation: `pop-in ${RESULT_MS / 1000}s ease-in-out forwards`,
            background: isWin ? "oklch(0.18 0.06 142 / 0.95)" : "oklch(0.18 0.06 25 / 0.95)",
            borderColor: isWin ? "oklch(0.60 0.18 142 / 0.6)" : "oklch(0.55 0.20 25 / 0.6)",
          }}>
          {/* W / L badge */}
          <span className={`size-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black
            ${isWin ? "bg-profit/30 text-profit" : "bg-loss/30 text-loss"}`}>
            {isWin ? "W" : "L"}
          </span>
          <div>
            <p className={`text-lg font-bold font-mono leading-tight ${isWin ? "text-profit" : "text-loss"}`}>
              {isWin ? "+" : "−"}KES {(Math.abs(profit) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/70 font-mono mt-0.5">
              Candle {green ? "▲ green" : "▼ red"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Countdown chip (absolute top-right of chart, z-index above everything) ────
function CountdownChip({ total, remaining }: { total: number; remaining: number }) {
  const R = 16, C = 2 * Math.PI * R, progress = remaining / total;
  const clr = remaining > total * 0.5 ? "oklch(0.72 0.17 162)" : remaining > total * 0.25 ? "oklch(0.80 0.15 75)" : "oklch(0.65 0.23 25)";
  return (
    <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full bg-[oklch(0.14_0.02_255/0.92)] border border-border/60 backdrop-blur-sm shadow-elevated">
      <div className="relative flex items-center justify-center size-8 shrink-0">
        <svg className="-rotate-90 size-8" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3.5" />
          <circle cx="20" cy="20" r={R} fill="none" stroke={clr} strokeWidth="3.5"
            strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s" }} />
        </svg>
        <Timer className="absolute size-3.5 text-white/80" />
      </div>
      <span className="text-xs font-bold font-mono text-white/90">{remaining.toFixed(1)}s</span>
    </div>
  );
}

// ── History list ───────────────────────────────────────────────────────────────
function HistoryList({ history, loading, fmtKes }: { history: BetHistoryRow[]; loading: boolean; fmtKes: (c: number) => string }) {
  if (loading) return <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>;
  if (!history.length) return (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">No trades yet.</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Your history will appear here.</p>
    </div>
  );
  return (
    <div className="divide-y divide-border/30">
      {history.map(row => {
        const d = new Date(row.created_at);
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <div key={row.id} className="px-4 py-3 flex items-center justify-between hover:bg-surface/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`size-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${row.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                {row.outcome === "win" ? "W" : "L"}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-medium flex items-center gap-1">
  <span className={row.prediction === "up" ? "text-profit" : "text-loss"}>{row.prediction === "up" ? "▲ BUY" : "▼ SELL"}</span>
</div>
                <p className="text-[10px] text-muted-foreground">
                  {isToday ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-mono font-semibold ${row.net_profit_cents >= 0 ? "text-profit" : "text-loss"}`}>
                {row.net_profit_cents >= 0 ? "+" : "−"}{fmtKes(Math.abs(row.net_profit_cents))}
              </p>
              <p className="text-[10px] text-muted-foreground">{fmtKes(row.bet_amount_cents)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ── Main page ─────────────────────────────────────────────────────────────────
function CandleTradePage() {
  const { settings, loaded: settingsLoaded } = usePlatformSettings();
  const MIN_BET = settings.min_bet_kes;

  const [balance,      setBalance]      = useState<number | null>(null);
  // Empty string initially — updated to the DB min bet once settings load
  const [betAmount,    setBetAmount]    = useState("");
  const [betAmountErr, setBetAmountErr] = useState("");
  const [candles,      setCandles]      = useState<EngineCandle[]>([]);
  const [pending,      setPending]      = useState(false);
  const [countdown,    setCountdown]    = useState(0);
  const [lastResult,   setLastResult]   = useState<BetResult | null>(null);
  const [showResult,   setShowResult]   = useState(false);
  const [history,      setHistory]      = useState<BetHistoryRow[]>([]);
  const [histLoading,  setHistLoading]  = useState(true);
  const [showHistory,  setShowHistory]  = useState(false);

  // Sync default bet amount to admin-configured minimum once DB settings load
  useEffect(() => {
    if (settingsLoaded && MIN_BET > 0) {
      setBetAmount(prev => prev === "" ? String(MIN_BET) : prev);
    }
  }, [settingsLoaded, MIN_BET]);
  const [showHowTo,    setShowHowTo]    = useState(false);

  const processingRef  = useRef(false);
  const tickTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const candleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveCandleTime = useRef<number>(0);
  const streakRef      = useRef<{ count: number; green: boolean | null }>({ count: 0, green: null });

  const startEngine = useCallback(() => {
    let momentum = 0;

    tickTimerRef.current = setInterval(() => {
      momentum = momentum * 0.82 + (Math.random() - 0.5) * 0.00025;
      setCandles(prev => {
        if (!prev.length) return prev;
        const next = [...prev]; const last = next[next.length - 1];
        const move = momentum * last.open + (Math.random() - 0.5) * last.open * 0.0012;
        const close = Math.max(last.open * 0.995, Math.min(last.open * 1.005, last.close + move));
        next[next.length - 1] = { ...last, close, high: Math.max(last.high, close), low: Math.min(last.low, close) };
        return next;
      });
    }, 400);

    candleTimerRef.current = setInterval(() => {
      setCandles(prev => {
        if (!prev.length) return prev;
        const t = Math.floor(Date.now() / 1000);
        liveCandleTime.current = t;

        // Track streak of closed candle
        const closed = prev[prev.length - 1];
        const isGreen = closed.close >= closed.open;
        const s = streakRef.current;
        if (s.green === isGreen) {
          s.count++;
        } else {
          s.count = 1;
          s.green = isGreen;
        }

        // If 5 in a row, nudge momentum to flip next candle
        if (s.count >= 5) {
          momentum = isGreen ? -0.0008 : 0.0008;
        }

        const p = closed.close;
        return [...prev.slice(-(MAX_CANDLES - 1)), { time: t, open: p, high: p, low: p, close: p, isLive: true }];
      });
    }, CANDLE_MS);
  }, []);

  const stopEngine = useCallback(() => {
    if (tickTimerRef.current)   { clearInterval(tickTimerRef.current);   tickTimerRef.current   = null; }
    if (candleTimerRef.current) { clearInterval(candleTimerRef.current); candleTimerRef.current = null; }
  }, []);

  useEffect(() => {
    const seeded = seedEngineCandles(MAX_CANDLES - 1);
    const now = Math.floor(Date.now() / 1000), lc = seeded[seeded.length - 1].close;
    liveCandleTime.current = now;
    setCandles([...seeded, { time: now, open: lc, high: lc, low: lc, close: lc, isLive: true }]);
    startEngine(); return stopEngine;
  }, [startEngine, stopEngine]);

  const loadBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const res = await (supabase.from("wallets") as any).select("balance_cents").eq("user_id", user.id).eq("wallet_type", "main").single();
    if (res.data) setBalance((res.data as any).balance_cents);
  };

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setHistLoading(true);
    const { data } = await (supabase.from("candle_bets") as any)
      .select("id,bet_amount_cents,prediction,outcome,multiplier,net_profit_cents,created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    setHistory((data as BetHistoryRow[]) ?? []);
    setHistLoading(false);
  };

  useEffect(() => {
    loadBalance(); loadHistory();
    let sub: any = null; let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user || cancelled) return;
      const uid = session.user.id;
      sub = supabase.channel(`ct-${uid}-${Date.now()}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "wallets", filter: `user_id=eq.${uid}` },
          (p) => { if ((p.new as any)?.wallet_type === "main") setBalance((p.new as any).balance_cents ?? 0); })
        .subscribe();
    });
    return () => { cancelled = true; if (sub) supabase.removeChannel(sub); };
  }, []);


  const placeBet = async (prediction: "up" | "down") => {
    if (processingRef.current) return;
    const amt = parseFloat(betAmount);
    if (!betAmount || isNaN(amt) || amt < MIN_BET) { setBetAmountErr(`Minimum KES ${MIN_BET.toLocaleString()}`); return; }
    if (balance !== null && Math.round(amt * 100) > balance) {
      setBetAmountErr(balance === 0 ? "Insufficient balance. Please deposit."
        : `Insufficient. Available: KES ${(balance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`);
      return;
    }
    setBetAmountErr(""); processingRef.current = true; setPending(true); setShowResult(false);

    // Record when the bet started so we can wait the full 10s no matter how fast the server responds
    const betStartMs = Date.now();
    let timeLeft = BET_RESOLVE_S; setCountdown(timeLeft);
    countdownRef.current = setInterval(() => {
      timeLeft = +(timeLeft - 0.1).toFixed(1); setCountdown(timeLeft);
      if (timeLeft <= 0) { clearInterval(countdownRef.current!); countdownRef.current = null; }
    }, 100);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Fire the bet request immediately — don't wait for result until countdown finishes
      const fetchPromise = fetch(EDGE_FN, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? ""}`, "apikey": ANON_KEY },
        body: JSON.stringify({ bet_amount_cents: Math.round(amt * 100), prediction }),
      });

      // Always wait the FULL BET_RESOLVE_S seconds before showing the result
      const fullWaitMs = BET_RESOLVE_S * 1000 + 400;
      const elapsed = Date.now() - betStartMs;
      const [res] = await Promise.all([
        fetchPromise,
        new Promise(r => setTimeout(r, Math.max(0, fullWaitMs - elapsed))),
      ]);

      const data = await (res as Response).json();
      if (!(res as Response).ok) throw new Error((data as any).error ?? "Bet failed");

      const result = data as BetResult;
      setLastResult(result); setBalance(result.new_balance_cents); setShowResult(true);
      setCandles(prev => {
        if (!prev.length) return prev;
        const next = [...prev]; const last = next[next.length - 1];
        const nudge = result.outcome_candle === "green"
          ? last.open + Math.abs(last.close - last.open) + last.open * 0.0003
          : last.open - Math.abs(last.close - last.open) - last.open * 0.0003;
        next[next.length - 1] = { ...last, close: nudge, high: Math.max(last.high, nudge), low: Math.min(last.low, nudge) };
        return next;
      });
      loadHistory();
    } catch (e: any) {
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
      toast.error(e?.message ?? "Bet failed. Try again.");
    } finally { setPending(false); processingRef.current = false; setCountdown(0); }
  };

  const fmtKes = (c: number) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  const quickAmts = [MIN_BET, 200, 500, 1000].filter((a, i) => i === 0 || a > MIN_BET).slice(0, 4);
  const maxBet = balance !== null ? Math.floor(balance / 100) : 0;
  const avgMult = useMemo(() => {
    const wins = history.filter(h => h.outcome === "win");
    return wins.length ? (wins.reduce((s, h) => s + h.multiplier, 0) / wins.length).toFixed(2) : null;
  }, [history]);

  const lastPrice = candles[candles.length - 1]?.close ?? 0;
  const prevClose = candles[candles.length - 2]?.close ?? lastPrice;
  const priceUp   = lastPrice >= prevClose;
  const pctChange = prevClose ? ((lastPrice - prevClose) / prevClose) * 100 : 0;
  const chartCandles: LWCandle[] = candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close }));


  return (
    // KEY: height fills the viewport minus the top nav (3.5rem). overflow-hidden ensures NO page scroll.
    <div className="flex flex-col overflow-hidden bg-background" style={{ height: "calc(100dvh - 3.5rem)" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <BarChart2 className="size-3.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm">EUR/USD</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-profit animate-pulse" />Live
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-none">Candle Predict · 10s </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* How to trade button */}
          <button onClick={() => setShowHowTo(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors text-xs font-medium"
            aria-label="How to trade">
            How to <HelpCircle className="size-3.5" />
          </button>
          <button onClick={() => setShowHistory(true)}
            className="size-8 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 text-muted-foreground hover:bg-surface transition-colors"
            aria-label="Trade history"><History className="size-4" /></button>
        </div>
      </div>

      {/* ── Body — flex row on lg, flex col on mobile (no scroll) ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* ── LEFT: chart flex-grows, betting panel is fixed-height ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-2 sm:p-3 gap-2">
          {/* Price row */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-base sm:text-xl font-bold font-mono tabular-nums ${priceUp ? "text-profit" : "text-loss"}`}>
              {lastPrice.toFixed(5)}
            </span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${priceUp ? "text-profit" : "text-loss"}`}>
              {priceUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {priceUp ? "+" : ""}{pctChange.toFixed(3)}%
            </span>
          </div>

          {/* ── Chart: flex-1 so it fills all remaining space ── */}
          {/* NOTE: no overflow-hidden here — CountdownChip needs to be visible on mobile */}
          <div className="relative rounded-xl border border-border/60 bg-[oklch(0.14_0.02_255)] shadow-card flex-1 min-h-0"
            style={{ isolation: "isolate" }}>
            {/* Clip inner chart content to rounded corners without hiding overlays */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {candles.length === 0 ? <Skeleton className="absolute inset-0" /> : <CandleChart candles={chartCandles} />}
            </div>

            {/* Countdown chip — sits on top of chart, visible on all screen sizes */}
            {pending && countdown > 0 && (
              <CountdownChip total={BET_RESOLVE_S} remaining={countdown} />
            )}

            {/* Trade result — pops up on the chart after countdown ends */}
            {showResult && lastResult && (
              <TradeResultOnChart result={lastResult} onDismiss={() => setShowResult(false)} />
            )}
          </div>

          {/* ── Betting panel: shrink-0 so it never gets squashed ── */}
          <div className="rounded-xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4 shrink-0 space-y-2.5">

            {/* Header row: label + how-to hint */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Trade Amount</span>
              <button onClick={() => setShowHowTo(true)}
                className="text-[10px] text-primary hover:underline flex items-center gap-1">
                <HelpCircle className="size-3" />How to trade
              </button>
            </div>

            {/* Input + MAX + quick chips — all on one line, chips wrap if needed */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Amount input — fixed width, not full-width */}
              <div className="relative w-32 shrink-0">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-mono">KES</span>
                <Input id="bet-amt" type="number" min={MIN_BET} placeholder={String(MIN_BET)}
                  className="h-9 pl-9 font-mono text-sm w-full"
                  value={betAmount}
                  onChange={e => { setBetAmount(e.target.value); setBetAmountErr(""); }}
                  disabled={pending} />
              </div>
              {/* MAX button */}
              {maxBet > 0 && (
                <button disabled={pending} type="button"
                  onClick={() => { setBetAmount(String(maxBet)); setBetAmountErr(""); }}
                  className="h-9 px-3 rounded-lg text-xs font-bold border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-40">
                  MAX
                </button>
              )}
              {/* Quick chips — flex-shrink allowed so they compress on tiny screens */}
              {quickAmts.map(a => (
                <button key={a} disabled={pending} type="button"
                  onClick={() => { setBetAmount(String(a)); setBetAmountErr(""); }}
                  className={`h-9 px-2.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 shrink-0 ${
                    betAmount === String(a) ? "border-primary/60 bg-primary/15 text-primary" : "border-border/60 bg-surface/60 hover:bg-primary/10 hover:border-primary/40"
                  }`}>{a}</button>
              ))}
              {/* Winners ticker — sits on same row as 500 chip on mobile, fills remaining space */}
              <div className="lg:hidden flex-1 min-w-0">
                <LiveWinnersInline />
              </div>
            </div>

            {betAmountErr && (
              <div className="text-xs text-destructive flex items-start gap-1.5 bg-destructive/8 border border-destructive/20 rounded-lg px-2.5 py-1.5">
                <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                <span>{betAmountErr}{" "}
                  {betAmountErr.includes("Insufficient") && <Link to="/wallet/deposit" className="underline font-medium">Deposit →</Link>}
                </span>
              </div>
            )}

            {/* UP / DOWN buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button disabled={pending} onClick={() => placeBet("up")}
                className="group relative h-12 sm:h-14 rounded-xl border-2 border-profit/40 bg-profit/10 hover:bg-profit/20 hover:border-profit/70 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5">
                <ChevronUp className="size-4 sm:size-5 text-profit group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-profit">BUY</span>
                {pending && <span className="absolute inset-0 rounded-xl bg-profit/5 animate-pulse" />}
              </button>
              <button disabled={pending} onClick={() => placeBet("down")}
                className="group relative h-12 sm:h-14 rounded-xl border-2 border-loss/40 bg-loss/10 hover:bg-loss/20 hover:border-loss/70 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5">
                <ChevronDown className="size-4 sm:size-5 text-loss group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold text-loss">SELL</span>
                {pending && <span className="absolute inset-0 rounded-xl bg-loss/5 animate-pulse" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
              <ShieldCheck className="size-3 shrink-0" />
              <Link to="/wallet/deposit" className="text-primary hover:underline">Deposit funds</Link>
            </div>
          </div>
        </div>

        {/* ── Desktop history sidebar ── */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 border-l border-border/50 bg-gradient-surface min-h-0">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Trade History</span>
            </div>
            <button onClick={() => { loadBalance(); loadHistory(); }}
              className="size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors" aria-label="Refresh">
              <RefreshCw className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <HistoryList history={history} loading={histLoading} fmtKes={fmtKes} />
          </div>
        </div>

      </div>

      {/* ── Mobile history bottom sheet ── */}
      {showHistory && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={() => setShowHistory(false)} />
          <div className="relative bg-background rounded-t-2xl border-t border-border/60 shadow-elevated max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-2.5 pb-1 shrink-0"><div className="h-1 w-10 rounded-full bg-border" /></div>
            <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Trade History</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { loadBalance(); loadHistory(); }} className="size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors" aria-label="Refresh">
                  <RefreshCw className="size-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => setShowHistory(false)} className="size-7 rounded-lg flex items-center justify-center hover:bg-surface transition-colors" aria-label="Close">
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <HistoryList history={history} loading={histLoading} fmtKes={fmtKes} />
            </div>
          </div>
        </div>
      )}

      <LiveWinnersOverlay />

      {/* ── How To Trade modal ── */}
      {showHowTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHowTo(false)} />
          <div className="relative w-full max-w-sm bg-background rounded-2xl border border-border/60 shadow-elevated animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                <span className="font-bold text-sm">How to Trade</span>
              </div>
              <button onClick={() => setShowHowTo(false)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>
            {/* Steps */}
            <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {[
                { n: "1", title: "Instant Funding", desc: "Top up your account in seconds using your preferred payment method." },
                { n: "2", title: "Pick Your Forecast", desc: "Predict whether the price will RISE or FALL after the trade window closes." },
                { n: "3", title: "Enter Your Trade", desc: "Set your trade amount and select BUY if you predict a rise in price or SELL if you predict a fall in price, to place your trade, depending on your prediction." },
                { n: "4", title: "Wait for Processing", desc: "Your trade is locked for 10 seconds while the candle resolves." },
                { n: "5", title: "Claim Your Payout", desc: "Winnings are credited to your Wallet instantly on a win." },
                { n: "6", title: "Support", desc: "Submit a support ticket from your dashboard if you need any help." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex items-start gap-3">
                  <span className="size-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-border/40 flex gap-2">
              <Link to="/wallet/deposit"
                className="flex-1 h-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity">
                Deposit funds
              </Link>
              <button onClick={() => setShowHowTo(false)}
                className="flex-1 h-9 rounded-lg border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}