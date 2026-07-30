import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, BarChart2, Trophy, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/trades")({
  head: () => ({ meta: [{ title: "Trades · Admin" }] }),
  component: AdminTrades,
});

type CandleBet = {
  id: string; user_id: string; bet_amount_cents: number;
  prediction: "up" | "down"; outcome: "win" | "loss";
  multiplier: number; gross_return_cents: number; net_profit_cents: number; created_at: string;
};

const fmt = (c: number) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function AdminTrades() {
  const [bets,    setBets]    = useState<CandleBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"all" | "win" | "loss">("all");

  const load = async () => {
    setLoading(true);
    let q = (supabase.from("candle_bets") as any).select("*").order("created_at", { ascending: false }).limit(300);
    if (filter !== "all") q = q.eq("outcome", filter);
    const { data } = await q;
    setBets((data as CandleBet[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const totalWins    = bets.filter(b => b.outcome === "win").length;
  const totalLoss    = bets.filter(b => b.outcome === "loss").length;
  const totalBets    = bets.length;
  const totalStake   = bets.reduce((s, b) => s + b.bet_amount_cents, 0);
  const totalPayouts = bets.filter(b => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0);
  const housePnl     = totalStake - totalPayouts;
  const winRate      = totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : "0.0";

  const summaryCards = [
    { label: "Total Bets",       value: totalBets.toLocaleString(),               icon: BarChart2,                              color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Staked",     value: fmt(totalStake),                           icon: TrendingUp,                             color: "text-primary", bg: "bg-primary/10" },
    { label: "House P/L",        value: `${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`, icon: housePnl >= 0 ? TrendingUp : TrendingDown, color: housePnl >= 0 ? "text-profit" : "text-loss", bg: housePnl >= 0 ? "bg-profit/10" : "bg-loss/10" },
    { label: "User Win Rate",    value: `${winRate}%`,                             icon: Trophy,                                 color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Trades</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Candle Predict bet history across all users.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4">
                <span className={`size-7 sm:size-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`size-3.5 sm:size-4 ${color}`} />
                </span>
                <p className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-xs sm:text-base font-bold font-mono mt-0.5 break-all ${color}`}>{value}</p>
              </div>
            ))}
      </div>

      {/* Outcome bar */}
      {!loading && totalBets > 0 && (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h2 className="font-semibold text-sm">Bet Outcomes</h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-profit inline-block" />{totalWins} wins</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-loss inline-block" />{totalLoss} losses</span>
            </div>
          </div>
          <div className="h-2 rounded-full bg-loss/30 overflow-hidden">
            <div className="h-full bg-profit rounded-full transition-all" style={{ width: `${(totalWins / totalBets) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>User wins ({winRate}%)</span>
            <span>House keeps {(100 - parseFloat(winRate)).toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-1.5">
        {(["all", "win", "loss"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"
            }`}>
            {s === "all" ? "All bets" : s === "win" ? "🏆 Wins" : "❌ Losses"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : bets.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center">
          <AlertCircle className="size-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No bets found.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Prediction</th>
                  <th className="text-right px-4 py-3 font-semibold">Stake</th>
                  <th className="text-right px-4 py-3 font-semibold">Payout</th>
                  <th className="text-right px-4 py-3 font-semibold">Net P/L</th>
                  <th className="text-left px-4 py-3 font-semibold">Result</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {bets.map(b => (
                  <tr key={b.id} className="border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{b.user_id.slice(0, 10)}…</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${b.prediction === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                        {b.prediction === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {b.prediction.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm whitespace-nowrap">{fmt(b.bet_amount_cents)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm whitespace-nowrap">{b.outcome === "win" ? fmt(b.gross_return_cents) : "—"}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold whitespace-nowrap ${b.outcome === "win" ? "text-profit" : "text-loss"}`}>
                      {b.outcome === "win" ? `+${fmt(b.net_profit_cents)}` : `−${fmt(b.bet_amount_cents)}`}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border-0 font-semibold ${b.outcome === "win" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>
                        {b.outcome === "win" ? "WIN" : "LOSS"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-2">
            {bets.map(b => (
              <div key={b.id} className="rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${b.prediction === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                      {b.prediction === "up" ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                      {b.prediction.toUpperCase()}
                    </span>
                    <Badge className={`text-[10px] border-0 font-bold ${b.outcome === "win" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"}`}>
                      {b.outcome === "win" ? "WIN" : "LOSS"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{fmtDate(b.created_at)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Stake</p>
                    <p className="text-xs font-mono font-semibold">{fmt(b.bet_amount_cents)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Payout</p>
                    <p className="text-xs font-mono font-semibold text-warning">{b.outcome === "win" ? fmt(b.gross_return_cents) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase">Net P/L</p>
                    <p className={`text-xs font-mono font-semibold ${b.outcome === "win" ? "text-profit" : "text-loss"}`}>
                      {b.outcome === "win" ? `+${fmt(b.net_profit_cents)}` : `−${fmt(b.bet_amount_cents)}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
