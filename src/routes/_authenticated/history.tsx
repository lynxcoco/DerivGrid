import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { History, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History · DerivGrid" }] }),
  component: HistoryPage,
});

type PositionRow = {
  id: string; asset_id: string; side: "buy"|"sell"; lot_size: number;
  entry_price: number; exit_price: number|null; pnl_cents: number|null;
  status: string; opened_at: string; closed_at: string|null;
};
type TxRow = {
  id: string; type: string; amount_cents: number; currency: string;
  description: string|null; created_at: string;
};

const TX_LABELS: Record<string,string> = {
  deposit:"Deposit", withdrawal:"Withdrawal", transfer_in:"Transfer In",
  transfer_out:"Transfer Out", trade_profit:"Trade Profit", trade_loss:"Trade Loss", fee:"Fee",
};
const TX_COLOR: Record<string,string> = {
  deposit:"text-profit", transfer_in:"text-profit", trade_profit:"text-profit",
  withdrawal:"text-loss", transfer_out:"text-loss", trade_loss:"text-loss", fee:"text-muted-foreground",
};
const TX_BG: Record<string,string> = {
  deposit:"bg-profit/15", transfer_in:"bg-profit/15", trade_profit:"bg-profit/15",
  withdrawal:"bg-loss/15", transfer_out:"bg-loss/15", trade_loss:"bg-loss/15", fee:"bg-muted/20",
};

function fmt(cents: number, currency = "KES") {
  const abs = Math.abs(cents / 100);
  return currency === "KES"
    ? `KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`
    : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function HistoryPage() {
  const [positions,     setPositions]     = useState<PositionRow[]>([]);
  const [transactions,  setTransactions]  = useState<TxRow[]>([]);
  const [loading,       setLoading]       = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: pos }, { data: txs }] = await Promise.all([
      supabase.from("positions").select("*").eq("user_id", user.id)
        .eq("status", "closed").order("closed_at", { ascending: false }).limit(50),
      supabase.from("transactions").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(50),
    ]);
    setPositions((pos as PositionRow[]) ?? []);
    setTransactions((txs as TxRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fmtDate = (s: string | null) => s
    ? new Date(s).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">History</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Closed trades and transactions.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Tabs defaultValue="trades">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* ── TRADES ──────────────────────────────────────────────────────────── */}
        <TabsContent value="trades" className="mt-3">
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : positions.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface py-14 text-center">
              <History className="size-9 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No closed trades yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {positions.map(p => {
                const pnl    = p.pnl_cents ?? 0;
                const isWin  = pnl >= 0;
                return (
                  <div key={p.id} className="rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card">
                    {/* Row 1: asset + side badge + P/L */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${isWin ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                          {isWin ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                        </span>
                        <span className="font-semibold text-sm">{p.asset_id}</span>
                        <Badge
                          variant={p.side === "buy" ? "default" : "destructive"}
                          className="text-[10px] px-1.5 py-0"
                        >{p.side.toUpperCase()}</Badge>
                      </div>
                      <span className={`font-mono font-bold text-sm shrink-0 ${isWin ? "text-profit" : "text-loss"}`}>
                        {pnl >= 0 ? "+" : "−"}{fmt(pnl)}
                      </span>
                    </div>
                    {/* Row 2: entry / exit / lots / date */}
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Entry</span>
                        <span className="font-mono">{p.entry_price}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Exit</span>
                        <span className="font-mono">{p.exit_price ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Lots</span>
                        <span className="font-mono">{p.lot_size}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">Closed</span>
                        <span>{fmtDate(p.closed_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── TRANSACTIONS ─────────────────────────────────────────────────────── */}
        <TabsContent value="transactions" className="mt-3">
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface py-14 text-center">
              <History className="size-9 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
              <div className="divide-y divide-border/30">
                {transactions.map(tx => {
                  const isCredit = tx.amount_cents >= 0;
                  return (
                    <div key={tx.id} className="px-4 py-3 hover:bg-surface/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${TX_BG[tx.type] ?? "bg-muted/20"} ${TX_COLOR[tx.type] ?? "text-muted-foreground"}`}>
                          {isCredit
                            ? <TrendingUp className="size-3.5" />
                            : <TrendingDown className="size-3.5" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight">
                            {TX_LABELS[tx.type] ?? tx.type}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {fmtDate(tx.created_at)}
                          </p>
                        </div>
                        <p className={`text-sm font-bold font-mono shrink-0 ${TX_COLOR[tx.type] ?? ""}`}>
                          {isCredit ? "+" : "−"}{fmt(tx.amount_cents, tx.currency)}
                        </p>
                      </div>
                      {tx.description && (
                        <p className="text-[10px] text-muted-foreground mt-1.5 ml-11 leading-snug line-clamp-2">
                          {tx.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
