import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ASSETS, type Asset, type Tick,
  tick as getNextTick, generateCandles,
  formatPrice, calcPnlCents,
} from "@/lib/market-simulator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Star, StarOff, X, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trade")({
  head: () => ({ meta: [{ title: "Trade · DerivGrid" }] }),
  component: TradePage,
});

const TIMEFRAMES = [
  { label: "M1",  ms: 60_000 },
  { label: "M5",  ms: 300_000 },
  { label: "M15", ms: 900_000 },
  { label: "H1",  ms: 3_600_000 },
  { label: "H4",  ms: 14_400_000 },
  { label: "D1",  ms: 86_400_000 },
];

type OpenPosition = {
  id: string; symbol: string; side: "buy" | "sell";
  lotSize: number; entryPrice: number;
  tp: number | null; sl: number | null; openedAt: number;
};

type ClosedPosition = {
  id: string; symbol: string; side: "buy" | "sell";
  lot_size: number; entry_price: number; exit_price: number;
  pnl_cents: number; opened_at: string; closed_at: string;
};

function TradePage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["EUR/USD", "BTC/USD", "XAU/USD"]));
  const [search, setSearch] = useState("");
  const [tf, setTf] = useState(TIMEFRAMES[0]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [lotSize, setLotSize] = useState("0.01");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [tradingBalance, setTradingBalance] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeries = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track the live (forming) candle separately — avoids stale closure on candles array
  const liveCandle = useRef<{ time: number; open: number; high: number; low: number; close: number } | null>(null);

  // Load user, balance, open positions, and closed history on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);

      // Wallet balance
      const wRes = await (supabase.from("wallets") as any).select("balance_cents")
        .eq("user_id", uid).eq("wallet_type", "main").single();
      if (wRes.data) setTradingBalance((wRes.data as any).balance_cents);

      // Open positions from DB
      const { data: openPos } = await supabase.from("positions").select("*")
        .eq("user_id", uid).eq("status", "open").order("opened_at", { ascending: false });
      if (openPos) {
        setPositions(openPos.map((p: any) => ({
          id: p.id,
          symbol: p.asset_id, // we store symbol as asset_id
          side: p.side as "buy" | "sell",
          lotSize: p.lot_size,
          entryPrice: p.entry_price,
          tp: p.take_profit,
          sl: p.stop_loss,
          openedAt: new Date(p.opened_at).getTime(),
        })));
      }

      // Recent closed positions
      const { data: closed } = await supabase.from("positions").select("*")
        .eq("user_id", uid).eq("status", "closed")
        .order("closed_at", { ascending: false }).limit(20);
      if (closed) setClosedPositions(closed as ClosedPosition[]);
    });
  }, []);
  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    // Destroy any existing chart first
    if (chartInstance.current) {
      try { chartInstance.current.remove(); } catch {}
      chartInstance.current = null;
      candleSeries.current = null;
      liveCandle.current = null;
    }

    (async () => {
      try {
        const { createChart, CandlestickSeries } = await import("lightweight-charts");
        if (cancelled || !chartRef.current) return;

        const chart = createChart(chartRef.current, {
          layout: { background: { color: "transparent" }, textColor: "#8b99b5" },
          grid: {
            vertLines: { color: "rgba(50,60,80,0.35)" },
            horzLines: { color: "rgba(50,60,80,0.35)" },
          },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: "rgba(50,60,80,0.5)" },
          timeScale: { borderColor: "rgba(50,60,80,0.5)", timeVisible: true, secondsVisible: false },
          width: chartRef.current.offsetWidth || chartRef.current.parentElement?.offsetWidth || 600,
          height: chartRef.current.offsetHeight || chartRef.current.parentElement?.offsetHeight || 380,
        });

        const series = chart.addSeries(CandlestickSeries, {
          upColor: "#22c55e", downColor: "#ef4444",
          borderUpColor: "#22c55e", borderDownColor: "#ef4444",
          wickUpColor: "#22c55e", wickDownColor: "#ef4444",
        });

        const historical = generateCandles(selectedAsset.symbol, 200, tf.ms);
        // Cast to any to satisfy lightweight-charts Time type (UTCTimestamp vs number)
        series.setData(historical as any);
        chart.timeScale().fitContent();
        liveCandle.current = null;

        if (!cancelled) {
          chartInstance.current = chart;
          candleSeries.current = series;
        } else {
          try { chart.remove(); } catch {}
          return;
        }

        ro = new ResizeObserver(() => {
          if (chartInstance.current && chartRef.current) {
            chartInstance.current.applyOptions({
              width: chartRef.current.offsetWidth || chartRef.current.parentElement?.offsetWidth || 600,
              height: chartRef.current.offsetHeight || chartRef.current.parentElement?.offsetHeight || 380,
            });
          }
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
        try { chartInstance.current.remove(); } catch {}
        chartInstance.current = null;
        candleSeries.current = null;
        liveCandle.current = null;
      }
    };
  }, [selectedAsset.symbol, tf]);

  // Live tick feed — runs independently of chart init
  useEffect(() => {
    const snap: Record<string, Tick> = {};
    ASSETS.forEach(a => { snap[a.symbol] = getNextTick(a); });
    setTicks(snap);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTicks(prev => {
        const next = { ...prev };
        ASSETS.forEach(a => { next[a.symbol] = getNextTick(a); });
        return next;
      });
    }, 800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Push live price into the chart — uses liveCandle ref (no stale closure)
  useEffect(() => {
    const t = ticks[selectedAsset.symbol];
    if (!t || !candleSeries.current) return;

    const intervalMs = tf.ms;
    const candleTimeSec = Math.floor(t.timestamp / intervalMs) * (intervalMs / 1000);

    if (!liveCandle.current || liveCandle.current.time !== candleTimeSec) {
      // New candle period — start fresh
      liveCandle.current = {
        time: candleTimeSec,
        open: t.price, high: t.price, low: t.price, close: t.price,
      };
    } else {
      // Update forming candle
      liveCandle.current = {
        time: candleTimeSec,
        open: liveCandle.current.open,
        high: Math.max(liveCandle.current.high, t.price),
        low:  Math.min(liveCandle.current.low,  t.price),
        close: t.price,
      };
    }

    try {
      candleSeries.current.update(liveCandle.current);
    } catch { /* series may not be ready yet */ }
  }, [ticks, selectedAsset.symbol, tf]);

  // Derived values
  const currentTick = ticks[selectedAsset.symbol];
  const isUp = (currentTick?.changePct ?? 0) >= 0;
  const filteredAssets = ASSETS.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // Auto TP/SL checker — runs on every tick batch
  useEffect(() => {
    if (positions.length === 0 || !userId) return;
    positions.forEach(async pos => {
      const t = ticks[pos.symbol];
      if (!t) return;
      const currentPrice = pos.side === "buy" ? t.bid : t.ask;
      let shouldClose = false;
      let reason = "";
      if (pos.tp && pos.side === "buy"  && currentPrice >= pos.tp) { shouldClose = true; reason = "Take Profit ✓"; }
      if (pos.tp && pos.side === "sell" && currentPrice <= pos.tp) { shouldClose = true; reason = "Take Profit ✓"; }
      if (pos.sl && pos.side === "buy"  && currentPrice <= pos.sl) { shouldClose = true; reason = "Stop Loss hit"; }
      if (pos.sl && pos.side === "sell" && currentPrice >= pos.sl) { shouldClose = true; reason = "Stop Loss hit"; }
      if (shouldClose) {
        toast.info(`${pos.symbol} — ${reason}`, { description: `Auto-closed @ ${currentPrice}` });
        await closeTrade(pos.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticks]);  const openTrade = async () => {
    const lot = parseFloat(lotSize);
    if (!lot || lot <= 0 || isNaN(lot)) { toast.error("Enter a valid lot size"); return; }
    if (!currentTick) { toast.error("No price data yet"); return; }
    if (!userId) { toast.error("Not authenticated"); return; }

    // Always fetch LIVE balance from DB
    const liveWalletRes = await (supabase.from("wallets") as any)
      .select("id, balance_cents")
      .eq("user_id", userId)
      .eq("wallet_type", "main")
      .single();
    const liveWallet = liveWalletRes.data as { id: string; balance_cents: number } | null;

    const liveTradingBalance = liveWallet?.balance_cents ?? 0;
    setTradingBalance(liveTradingBalance);

    if (liveTradingBalance <= 0) {
      toast.error("No funds in your Wallet. Please deposit funds first.", { duration: 5000 });
      return;
    }
    const minMargin = Math.round(lot * 10 * 100);
    if (liveTradingBalance < minMargin) {
      toast.error(`Insufficient margin. Need at least KES ${(minMargin / 100).toFixed(2)}.`);
      return;
    }

    const price = side === "buy" ? currentTick.ask : currentTick.bid;

    // Save to DB
    const savedRes = await (supabase.from("positions") as any).insert({
      user_id: userId,
      asset_id: selectedAsset.symbol,
      side,
      lot_size: lot,
      entry_price: price,
      take_profit: tp ? parseFloat(tp) : null,
      stop_loss: sl ? parseFloat(sl) : null,
      status: "open",
      opened_at: new Date().toISOString(),
    }).select().single();
    const saved = savedRes.data as { id: string } | null;
    const error = savedRes.error;

    if (error) {
      toast.error("Failed to save position: " + error.message);
      return;
    }
    if (!saved) {
      toast.error("Failed to save position — please try again.");
      return;
    }

    setPositions(p => [...p, {
      id: saved.id,
      symbol: selectedAsset.symbol,
      side,
      lotSize: lot,
      entryPrice: price,
      tp: tp ? parseFloat(tp) : null,
      sl: sl ? parseFloat(sl) : null,
      openedAt: Date.now(),
    }]);

    toast.success(`${side.toUpperCase()} ${lot} lot ${selectedAsset.symbol} @ ${formatPrice(price, selectedAsset.pipSize)}`);
    setTp(""); setSl("");
  };

  const closeTrade = async (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const asset = ASSETS.find(a => a.symbol === pos.symbol);
    const t = ticks[pos.symbol];
    const exitPrice = t ? (pos.side === "buy" ? t.bid : t.ask) : pos.entryPrice;
    const pnlCents = asset ? calcPnlCents(pos.side, pos.entryPrice, exitPrice, pos.lotSize, asset.pipSize) : 0;

    // Update DB
    const { error } = await (supabase.from("positions") as any).update({
      status: "closed",
      exit_price: exitPrice,
      pnl_cents: pnlCents,
      closed_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId);

    if (error) {
      toast.error("Failed to close position: " + error.message);
      return;
    }

    // Credit/debit wallet
    if (pnlCents !== 0) {
      const walletRes2 = await (supabase.from("wallets") as any).select("balance_cents, id")
        .eq("user_id", userId).eq("wallet_type", "main").single();
      const wallet = walletRes2.data as { id: string; balance_cents: number } | null;
      if (wallet) {
        const newBalance = wallet.balance_cents + pnlCents;
        await (supabase.from("wallets") as any).update({
          balance_cents: Math.max(0, newBalance),
          updated_at: new Date().toISOString(),
        }).eq("id", wallet.id);
        setTradingBalance(Math.max(0, newBalance));

        await (supabase.from("transactions") as any).insert({
          user_id: userId,
          wallet_id: wallet.id,
          type: pnlCents >= 0 ? "trade_profit" : "trade_loss",
          amount_cents: pnlCents,
          currency: "KES",
          description: `${pos.side.toUpperCase()} ${pos.lotSize} lot ${pos.symbol} closed @ ${exitPrice}`,
        });

        await (supabase.from("notifications") as any).insert({
          user_id: userId,
          title: `Position closed — ${pnlCents >= 0 ? "Profit" : "Loss"}`,
          body: `${pos.symbol} ${pos.side.toUpperCase()} ${pos.lotSize} lot closed @ ${exitPrice}. P/L: ${pnlCents >= 0 ? "+" : ""}KES ${(pnlCents / 100).toFixed(2)}`,
          type: "trade",
          is_read: false,
        });
      }
    }

    // Update local state
    setPositions(p => p.filter(x => x.id !== id));
    setClosedPositions(prev => [{
      id,
      symbol: pos.symbol,
      side: pos.side,
      lot_size: pos.lotSize,
      entry_price: pos.entryPrice,
      exit_price: exitPrice,
      pnl_cents: pnlCents,
      opened_at: new Date(pos.openedAt).toISOString(),
      closed_at: new Date().toISOString(),
    }, ...prev.slice(0, 19)]);

    const pnlDisplay = `${pnlCents >= 0 ? "+" : ""}KES ${(pnlCents / 100).toFixed(2)}`;
    toast.success(`Position closed — P/L: ${pnlDisplay}`, {
      description: `${pos.symbol} ${pos.side.toUpperCase()} @ ${exitPrice}`,
    });
  };

  const toggleFav = (sym: string) => {
    setFavorites(f => { const n = new Set(f); n.has(sym) ? n.delete(sym) : n.add(sym); return n; });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Watchlist */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border/50 bg-sidebar shrink-0">
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-surface border border-border/50 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredAssets.map(asset => {
            const t = ticks[asset.symbol];
            const active = asset.symbol === selectedAsset.symbol;
            const up = (t?.changePct ?? 0) >= 0;
            return (
              <div
                key={asset.symbol}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedAsset(asset)}
                onKeyDown={e => e.key === "Enter" && setSelectedAsset(asset)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer transition-colors hover:bg-sidebar-accent/60 ${active ? "bg-sidebar-accent" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{asset.symbol}</p>
                  <p className="text-[10px] text-muted-foreground truncate capitalize">{asset.category}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {t && (
                    <div className="text-right">
                      <p className="text-xs font-mono">{formatPrice(t.price, asset.pipSize)}</p>
                      <p className={`text-[10px] font-mono ${up ? "text-profit" : "text-loss"}`}>
                        {up ? "+" : ""}{t.changePct.toFixed(2)}%
                      </p>
                    </div>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={e => { e.stopPropagation(); toggleFav(asset.symbol); }}
                    onKeyDown={e => { if (e.key === "Enter") { e.stopPropagation(); toggleFav(asset.symbol); } }}
                    className="text-muted-foreground hover:text-primary ml-1 cursor-pointer"
                    aria-label={favorites.has(asset.symbol) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.has(asset.symbol)
                      ? <Star className="size-3 fill-primary text-primary" />
                      : <StarOff className="size-3" />}
                  </span>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </aside>

      {/* Chart + order area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Chart header */}
        <div className="h-12 border-b border-border/50 flex items-center gap-2 px-3 shrink-0 bg-background/80 backdrop-blur overflow-x-auto">
          {/* Mobile asset selector */}
          <select
            value={selectedAsset.symbol}
            onChange={e => {
              const a = ASSETS.find(x => x.symbol === e.target.value);
              if (a) setSelectedAsset(a);
            }}
            className="lg:hidden h-7 rounded-md border border-input bg-surface px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring shrink-0 max-w-[130px]"
          >
            {ASSETS.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>

          <span className="hidden lg:block font-semibold text-sm shrink-0">{selectedAsset.symbol}</span>
          <span className="text-xs text-muted-foreground hidden sm:block shrink-0">{selectedAsset.name}</span>
          {currentTick && (
            <>
              <span className="font-mono font-bold text-sm shrink-0">{formatPrice(currentTick.price, selectedAsset.pipSize)}</span>
              <span className={`text-xs font-mono shrink-0 ${isUp ? "text-profit" : "text-loss"}`}>
                {isUp ? "+" : ""}{currentTick.changePct.toFixed(2)}%
              </span>
              <span className="hidden md:flex items-center gap-2 text-xs font-mono ml-auto shrink-0">
                <span className="text-loss">{formatPrice(currentTick.bid, selectedAsset.pipSize)} <span className="text-muted-foreground">Bid</span></span>
                <span className="text-profit">{formatPrice(currentTick.ask, selectedAsset.pipSize)} <span className="text-muted-foreground">Ask</span></span>
              </span>
            </>
          )}
          <div className={`flex items-center gap-0.5 ml-auto shrink-0`}>
            {TIMEFRAMES.map(t => (
              <button key={t.label} onClick={() => setTf(t)}
                className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                  tf.label === t.label ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Chart */}
          <div className="flex-1 min-w-0 min-h-0 bg-background/50 relative">
            <div ref={chartRef} className="absolute inset-0" />
          </div>

          {/* Order ticket — desktop */}
          <div className="w-64 shrink-0 border-l border-border/50 bg-sidebar flex-col hidden lg:flex">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <span className="font-semibold text-sm">New Order</span>
              <span className="text-xs text-muted-foreground font-mono">
                {tradingBalance > 0
                  ? <span className="text-profit">KES {(tradingBalance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                  : <Link to="/wallet/deposit" className="text-primary hover:underline">Deposit funds →</Link>}
              </span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSide("buy")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${side === "buy" ? "bg-profit text-white" : "bg-surface text-muted-foreground hover:bg-surface/80"}`}>
                  BUY
                </button>
                <button onClick={() => setSide("sell")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${side === "sell" ? "bg-loss text-white" : "bg-surface text-muted-foreground hover:bg-surface/80"}`}>
                  SELL
                </button>
              </div>
              {currentTick && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-loss/10 border border-loss/25 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Sell</p>
                    <p className="font-mono font-bold text-loss text-sm">{formatPrice(currentTick.bid, selectedAsset.pipSize)}</p>
                  </div>
                  <div className="rounded-lg bg-profit/10 border border-profit/25 p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Buy</p>
                    <p className="font-mono font-bold text-profit text-sm">{formatPrice(currentTick.ask, selectedAsset.pipSize)}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground">Lot size</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <button onClick={() => setLotSize(l => String(Math.max(0.01, +l - 0.01).toFixed(2)))}
                    className="size-8 rounded bg-surface border border-border/50 text-sm hover:bg-accent">−</button>
                  <Input value={lotSize} onChange={e => setLotSize(e.target.value)}
                    className="h-8 text-center font-mono text-sm flex-1" />
                  <button onClick={() => setLotSize(l => String((+l + 0.01).toFixed(2)))}
                    className="size-8 rounded bg-surface border border-border/50 text-sm hover:bg-accent">+</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Take Profit</label>
                  <Input placeholder="optional" value={tp} onChange={e => setTp(e.target.value)} className="mt-1 h-8 text-xs font-mono" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Stop Loss</label>
                  <Input placeholder="optional" value={sl} onChange={e => setSl(e.target.value)} className="mt-1 h-8 text-xs font-mono" />
                </div>
              </div>
              <Button onClick={openTrade}
                className={`w-full h-10 font-bold text-sm ${side === "buy" ? "bg-profit hover:bg-profit/90" : "bg-loss hover:bg-loss/90"} text-white`}>
                {side === "buy" ? <TrendingUp className="size-4 mr-1.5" /> : <TrendingDown className="size-4 mr-1.5" />}
                {side.toUpperCase()} {selectedAsset.symbol}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile quick order bar */}
        <div className="lg:hidden border-t border-border/50 bg-sidebar px-3 py-2 flex items-center gap-2 shrink-0">
          <button onClick={() => setSide("buy")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${side === "buy" ? "bg-profit text-white" : "bg-surface text-muted-foreground"}`}>
            BUY {currentTick ? formatPrice(currentTick.ask, selectedAsset.pipSize) : ""}
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setLotSize(l => String(Math.max(0.01, +l - 0.01).toFixed(2)))} className="size-7 rounded bg-surface border border-border/50 text-xs">−</button>
            <span className="font-mono text-xs w-10 text-center">{lotSize}</span>
            <button onClick={() => setLotSize(l => String((+l + 0.01).toFixed(2)))} className="size-7 rounded bg-surface border border-border/50 text-xs">+</button>
          </div>
          <button onClick={() => setSide("sell")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${side === "sell" ? "bg-loss text-white" : "bg-surface text-muted-foreground"}`}>
            SELL {currentTick ? formatPrice(currentTick.bid, selectedAsset.pipSize) : ""}
          </button>
          <button onClick={openTrade}
            className={`px-3 py-2 rounded-lg text-xs font-bold text-white ${side === "buy" ? "bg-profit" : "bg-loss"}`}>
            GO
          </button>
        </div>

        {/* Positions */}
        <div className="border-t border-border/50 bg-background/80 h-36 overflow-hidden flex flex-col shrink-0">
          <Tabs defaultValue="positions" className="flex flex-col h-full">
            <div className="px-4 border-b border-border/50 flex items-center shrink-0">
              <TabsList className="h-8 bg-transparent p-0 gap-4">
                <TabsTrigger value="positions" className="text-xs h-8 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                  Open ({positions.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs h-8 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                  Closed
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="positions" className="flex-1 overflow-y-auto m-0 p-0">
              {positions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No open positions. Use the order ticket to open a trade.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border/40 text-muted-foreground">
                    <th className="text-left px-4 py-1.5">Symbol</th><th className="text-left px-2 py-1.5">Side</th>
                    <th className="text-right px-2 py-1.5">Lots</th><th className="text-right px-2 py-1.5">Entry</th>
                    <th className="text-right px-2 py-1.5">Current</th><th className="text-right px-2 py-1.5">P/L</th>
                    <th className="px-3 py-1.5"></th>
                  </tr></thead>
                  <tbody>
                    {positions.map(pos => {
                      const asset = ASSETS.find(a => a.symbol === pos.symbol);
                      const t = ticks[pos.symbol];
                      const cur = t ? (pos.side === "buy" ? t.bid : t.ask) : pos.entryPrice;
                      const pnl = asset ? calcPnlCents(pos.side, pos.entryPrice, cur, pos.lotSize, asset.pipSize) / 100 : 0;
                      return (
                        <tr key={pos.id} className="border-b border-border/25 hover:bg-surface/30">
                          <td className="px-4 py-1.5 font-semibold">{pos.symbol}</td>
                          <td className="px-2 py-1.5"><Badge variant={pos.side === "buy" ? "default" : "destructive"} className="text-[10px] py-0">{pos.side.toUpperCase()}</Badge></td>
                          <td className="px-2 py-1.5 text-right font-mono">{pos.lotSize}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{asset ? formatPrice(pos.entryPrice, asset.pipSize) : pos.entryPrice}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{asset && t ? formatPrice(cur, asset.pipSize) : "—"}</td>
                          <td className={`px-2 py-1.5 text-right font-mono font-semibold ${pnl >= 0 ? "text-profit" : "text-loss"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            <button onClick={() => closeTrade(pos.id)} className="text-muted-foreground hover:text-destructive"><X className="size-3.5" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </TabsContent>
            <TabsContent value="history" className="flex-1 overflow-y-auto m-0 p-0">
              {closedPositions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">No closed trades yet this session.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border/40 text-muted-foreground">
                    <th className="text-left px-4 py-1.5">Symbol</th><th className="text-left px-2 py-1.5">Side</th>
                    <th className="text-right px-2 py-1.5">Lots</th><th className="text-right px-2 py-1.5">Entry</th>
                    <th className="text-right px-2 py-1.5">Exit</th><th className="text-right px-2 py-1.5">P/L</th>
                    <th className="text-right px-3 py-1.5">Closed</th>
                  </tr></thead>
                  <tbody>
                    {closedPositions.map(pos => {
                      const asset = ASSETS.find(a => a.symbol === pos.symbol);
                      return (
                        <tr key={pos.id} className="border-b border-border/25 hover:bg-surface/30">
                          <td className="px-4 py-1.5 font-semibold">{pos.symbol}</td>
                          <td className="px-2 py-1.5"><Badge variant={pos.side === "buy" ? "default" : "destructive"} className="text-[10px] py-0">{pos.side.toUpperCase()}</Badge></td>
                          <td className="px-2 py-1.5 text-right font-mono">{pos.lot_size}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{asset ? formatPrice(pos.entry_price, asset.pipSize) : pos.entry_price}</td>
                          <td className="px-2 py-1.5 text-right font-mono">{asset ? formatPrice(pos.exit_price, asset.pipSize) : pos.exit_price}</td>
                          <td className={`px-2 py-1.5 text-right font-mono font-semibold ${pos.pnl_cents >= 0 ? "text-profit" : "text-loss"}`}>
                            {pos.pnl_cents >= 0 ? "+" : ""}${(pos.pnl_cents / 100).toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5 text-right text-muted-foreground">
                            {new Date(pos.closed_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
