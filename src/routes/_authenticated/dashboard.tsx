import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  Wallet, LineChart, Activity,
  Users, AlertTriangle, ShieldCheck, ChevronRight, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ASSETS, tick, type Tick } from "@/lib/market-simulator";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · DerivGrid" }] }),
  component: Dashboard,
});

type WalletRow = { id: string; wallet_type: string; balance_cents: number };
type TxRow = { id: string; type: string; amount_cents: number; currency: string; description: string | null; created_at: string; };
type PositionRow = { id: string; asset_id: string; side: string; lot_size: number; entry_price: number; pnl_cents: number | null; opened_at: string; closed_at: string | null; };
type AdminStats = { totalUsers: number; pendingDeposits: number; pendingWithdrawals: number; openTickets: number; depositVolume: number; };
// 30-day balance snapshots from real transaction data
type BalancePoint = { date: string; balance_cents: number };

const WATCHLIST = ["EUR/USD", "BTC/USD", "XAU/USD", "Volatility 75", "AAPL"];
const TX_LABELS: Record<string, string> = {
  deposit: "Deposit", withdrawal: "Withdrawal", transfer_in: "Transfer In",
  transfer_out: "Transfer Out", trade_profit: "Trade Profit", trade_loss: "Trade Loss", fee: "Fee",
};

function fmt(cents: number, currency = "KES") {
  const abs = Math.abs(cents / 100);
  const sign = cents < 0 ? "-" : "";
  if (currency === "KES") return `${sign}KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

// ─── Admin Banner ─────────────────────────────────────────────────────────────
function AdminBanner({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 shadow-glow">
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary shrink-0" />
            <h2 className="font-semibold text-sm">Platform Overview</h2>
            <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 font-bold">ADMIN</Badge>
          </div>
          <Link to="/admin/overview"
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
            Admin Panel <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <AdminStat label="Total Users" value={loading ? null : stats?.totalUsers.toLocaleString() ?? "—"} icon={Users} to="/admin/users" />
          <AdminStat label="Pending Deposits" value={loading ? null : stats?.pendingDeposits.toString() ?? "0"} icon={ArrowDownToLine} to="/admin/deposits" urgent={(stats?.pendingDeposits ?? 0) > 0} />
          <AdminStat label="Pending Withdrawals" value={loading ? null : stats?.pendingWithdrawals.toString() ?? "0"} icon={ArrowUpFromLine} to="/admin/withdrawals" urgent={(stats?.pendingWithdrawals ?? 0) > 0} />
          <AdminStat label="Open Tickets" value={loading ? null : stats?.openTickets.toString() ?? "0"} icon={AlertTriangle} to="/admin/tickets" urgent={(stats?.openTickets ?? 0) > 0} />
          <AdminStat label="Deposit Volume" value={loading ? null : fmt(stats?.depositVolume ?? 0)} icon={TrendingUp} to="/admin/reports" />
        </div>

        {/* Quick actions for admin */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Link to="/admin/deposits"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-profit/15 text-profit hover:bg-profit/25 transition-colors">
            <ArrowDownToLine className="size-3" />
            Review Deposits
            {(stats?.pendingDeposits ?? 0) > 0 && (
              <span className="size-4 rounded-full bg-profit text-white text-[10px] font-bold flex items-center justify-center">
                {stats!.pendingDeposits}
              </span>
            )}
          </Link>
          <Link to="/admin/withdrawals"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-loss/15 text-loss hover:bg-loss/25 transition-colors">
            <ArrowUpFromLine className="size-3" />
            Review Withdrawals
            {(stats?.pendingWithdrawals ?? 0) > 0 && (
              <span className="size-4 rounded-full bg-loss text-white text-[10px] font-bold flex items-center justify-center">
                {stats!.pendingWithdrawals}
              </span>
            )}
          </Link>
          <Link to="/admin/tickets"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-warning/15 text-warning hover:bg-warning/25 transition-colors">
            <AlertTriangle className="size-3" />
            Support Queue
            {(stats?.openTickets ?? 0) > 0 && (
              <span className="size-4 rounded-full bg-warning text-black text-[10px] font-bold flex items-center justify-center">
                {stats!.openTickets}
              </span>
            )}
          </Link>
          <Link to="/admin/reports"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border/60 text-muted-foreground hover:text-foreground transition-colors">
            <LineChart className="size-3" />
            Reports
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ label, value, icon: Icon, to, urgent }: {
  label: string; value: string | null; icon: any; to: string; urgent?: boolean;
}) {
  return (
    <Link to={to}
      className={`flex flex-col gap-1 rounded-xl p-3 border transition-colors hover:bg-surface/60 ${
        urgent ? "border-warning/40 bg-warning/5" : "border-border/50 bg-surface/40"
      }`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
        <Icon className={`size-3 shrink-0 ${urgent ? "text-warning" : "text-muted-foreground"}`} />
      </div>
      {value === null
        ? <Skeleton className="h-5 w-10" />
        : <p className={`text-base font-bold font-mono truncate ${urgent && value !== "0" ? "text-warning" : ""}`}>{value}</p>}
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Trader");
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  // Real 30-day equity curve from transaction history
  const [equityPoints, setEquityPoints] = useState<BalancePoint[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isAdmin } = useRole();

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setDisplayName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Trader");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [{ data: ws }, { data: txs }, { data: pos }, { data: allTxs }] = await Promise.all([
      supabase.from("wallets").select("id, wallet_type, balance_cents").eq("user_id", user.id),
      supabase.from("transactions").select("id, type, amount_cents, currency, description, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
      // All closed positions (for today's P/L calculation)
      supabase.from("positions").select("id, asset_id, side, lot_size, entry_price, pnl_cents, opened_at, closed_at")
        .eq("user_id", user.id).eq("status", "closed").order("opened_at", { ascending: false }).limit(5),
      // Last 30 days of transactions for equity curve
      supabase.from("transactions").select("amount_cents, created_at")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
    ]);

    setWallets((ws as WalletRow[]) ?? []);
    setTransactions((txs as TxRow[]) ?? []);
    setPositions((pos as PositionRow[]) ?? []);

    // Build real equity curve: start from (current balance - 30d net flow), then accumulate
    if (ws && allTxs) {
      const currentBalance = (ws as WalletRow[]).reduce((s, w) => s + w.balance_cents, 0);
      const thirtyDayNet = (allTxs as any[]).reduce((s: number, t: any) => s + t.amount_cents, 0);
      const startBalance = currentBalance - thirtyDayNet;

      // Group transactions by day, then compute running balance
      const dailyMap: Record<string, number> = {};
      (allTxs as any[]).forEach((t: any) => {
        const day = t.created_at.split("T")[0];
        dailyMap[day] = (dailyMap[day] ?? 0) + t.amount_cents;
      });

      // Fill 30 days
      const points: BalancePoint[] = [];
      let running = startBalance;
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split("T")[0];
        running += dailyMap[dayStr] ?? 0;
        points.push({ date: dayStr, balance_cents: Math.max(0, running) });
      }
      // Ensure last point is current balance
      if (points.length > 0) points[points.length - 1].balance_cents = currentBalance;
      setEquityPoints(points);
    }

    setLoading(false);
  };

  const loadAdminStats = async () => {
    setAdminStatsLoading(true);
    try {
      const [
        { count: users },
        { data: deps },
        { data: wds },
        { count: tickets },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("deposits").select("amount_cents, status"),
        supabase.from("withdrawals").select("amount_cents, status"),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);

      setAdminStats({
        totalUsers: users ?? 0,
        pendingDeposits: (deps ?? []).filter((d: any) => d.status === "pending").length,
        pendingWithdrawals: (wds ?? []).filter((w: any) => w.status === "pending").length,
        openTickets: tickets ?? 0,
        depositVolume: (deps ?? []).filter((d: any) => d.status === "completed").reduce((s: number, d: any) => s + d.amount_cents, 0),
      });
    } catch {}
    setAdminStatsLoading(false);
  };

  useEffect(() => {
    loadData();
    if (isAdmin) loadAdminStats();

    // Live market ticks only — no fake equity data
    const assets = ASSETS.filter(a => WATCHLIST.includes(a.symbol));
    const snap: Record<string, Tick> = {};
    assets.forEach(a => { snap[a.symbol] = tick(a); });
    setTicks(snap);

    intervalRef.current = setInterval(() => {
      setTicks(prev => { const next = { ...prev }; assets.forEach(a => { next[a.symbol] = tick(a); }); return next; });
    }, 1500);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAdmin]);

  // Realtime wallet updates
  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user || cancelled) return;
      const uid = session.user.id;
      sub = supabase.channel(`dash-wallet-${uid}-${Date.now()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "wallets", filter: `user_id=eq.${uid}` }, () => loadData())
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${uid}` }, () => loadData())
        .subscribe();
    });
    return () => { cancelled = true; if (sub) supabase.removeChannel(sub); };
  }, []);

  const totalBalance = wallets.reduce((s, w) => s + w.balance_cents, 0);
  const mainWallet = wallets.find(w => w.wallet_type === "main");
  const tradingWallet = wallets.find(w => w.wallet_type === "main");

  // Real 30-day balance change (still used for equity chart header + trend text)
  const firstBalance = equityPoints[0]?.balance_cents ?? totalBalance;
  const lastBalance  = equityPoints[equityPoints.length - 1]?.balance_cents ?? totalBalance;
  const balanceChange = lastBalance - firstBalance;
  const balanceUp = balanceChange >= 0;

  // SVG equity path from real data
  const eqPath = () => {
    if (equityPoints.length < 2) return "";
    const vals = equityPoints.map(p => p.balance_cents);
    const W = 600; const H = 180;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    return vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 16) - 8;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Welcome back, {loading ? "…" : displayName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Platform & personal account overview." : "Here's your account snapshot."}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild className="bg-gradient-primary shadow-glow hover:opacity-95 flex-1 sm:flex-initial">
            <Link to="/wallet/deposit"><ArrowDownToLine className="size-4 mr-1.5" />Deposit</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 sm:flex-initial">
            <Link to="/wallet/withdraw"><ArrowUpFromLine className="size-4 mr-1.5" />Withdraw</Link>
          </Button>
        </div>
      </div>

      {/* ─── Admin Banner (admins only) ──────────────────────────────────── */}
      {isAdmin && (
        <AdminBanner stats={adminStats} loading={adminStatsLoading} />
      )}

      {/* ─── Balance card ───────────────────────────────────────────────── */}
      <div className="w-full sm:max-w-xs">
        <StatCard
          label="Balance"
          value={loading ? null : fmt(totalBalance)}
          icon={Wallet}
          trend={loading ? undefined : balanceChange === 0
            ? "No change this month"
            : `${balanceUp ? "+" : ""}${fmt(Math.abs(balanceChange))} (30d)`}
          trendUp={balanceChange === 0 ? undefined : balanceUp}
          accent
        />
      </div>

      {/* ─── Real equity chart + live markets ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h2 className="font-semibold">Portfolio equity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                30-day balance history
              </p>
            </div>
            {!loading && (
              <span className={`font-mono text-sm font-semibold ${balanceUp ? "text-profit" : balanceChange < 0 ? "text-loss" : "text-muted-foreground"}`}>
                {balanceChange === 0 ? "—" : `${balanceUp ? "+" : ""}${fmt(Math.abs(balanceChange))}`}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="w-full h-40 sm:h-44 rounded-xl" />
          ) : equityPoints.length < 2 ? (
            <div className="h-40 sm:h-44 flex items-center justify-center text-sm text-muted-foreground text-center px-4">
              Make your first deposit to see your equity curve.
            </div>
          ) : (
            <svg viewBox="0 0 600 180" className="w-full h-40 sm:h-44" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)"} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)"} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${eqPath()} L600,180 L0,180 Z`} fill="url(#eq)" />
              <path d={eqPath()} fill="none"
                stroke={balanceUp ? "oklch(0.72 0.20 150)" : "oklch(0.65 0.235 22)"}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Markets</h2>
            <span className="size-2 rounded-full bg-profit animate-pulse shrink-0" />
          </div>
          <ul className="space-y-3">
            {WATCHLIST.map(sym => {
              const t = ticks[sym];
              const up = (t?.changePct ?? 0) >= 0;
              const asset = ASSETS.find(a => a.symbol === sym);
              return (
                <li key={sym} className="flex justify-between items-center text-sm gap-2">
                  <span className="font-medium truncate">{sym}</span>
                  <div className="flex items-center gap-2 font-mono shrink-0">
                    {t && asset ? (
                      <>
                        <span>{t.price.toFixed(asset.pipSize < 0.001 ? 5 : 2)}</span>
                        <span className={`text-xs ${up ? "text-profit" : "text-loss"}`}>{up ? "+" : ""}{t.changePct.toFixed(2)}%</span>
                      </>
                    ) : <Skeleton className="h-4 w-20" />}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* ─── Recent trades + transactions ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent trades</h2>
            <Link to="/history" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
            : positions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No trades yet. <Link to="/trade" className="text-primary hover:underline">Start trading →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[280px]">
                  <thead><tr className="text-xs text-muted-foreground border-b border-border/40">
                    <th className="text-left py-2 px-1">Asset</th><th className="text-left py-2 px-1">Side</th><th className="text-right py-2 px-1">P/L</th>
                  </tr></thead>
                  <tbody>
                    {positions.map(p => (
                      <tr key={p.id} className="border-b border-border/20 last:border-0">
                        <td className="py-2.5 px-1 font-medium whitespace-nowrap">{p.asset_id}</td>
                        <td className="py-2.5 px-1"><Badge variant={p.side === "buy" ? "default" : "destructive"} className="text-xs">{p.side.toUpperCase()}</Badge></td>
                        <td className={`py-2.5 px-1 text-right font-mono font-semibold whitespace-nowrap ${(p.pnl_cents ?? 0) >= 0 ? "text-profit" : "text-loss"}`}>
                          {p.pnl_cents !== null ? fmt(p.pnl_cents) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-4 sm:p-6 shadow-card min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent transactions</h2>
            <Link to="/wallet" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
            : transactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No transactions yet. <Link to="/wallet/deposit" className="text-primary hover:underline">Make a deposit →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[280px]">
                  <thead><tr className="text-xs text-muted-foreground border-b border-border/40">
                    <th className="text-left py-2 px-1">Type</th>
                    <th className="text-left py-2 px-1 hidden sm:table-cell">Date</th>
                    <th className="text-right py-2 px-1">Amount</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-border/20 last:border-0">
                        <td className="py-2.5 px-1 font-medium whitespace-nowrap">{TX_LABELS[tx.type] ?? tx.type}</td>
                        <td className="py-2.5 px-1 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className={`py-2.5 px-1 text-right font-mono font-semibold whitespace-nowrap ${tx.amount_cents >= 0 ? "text-profit" : "text-loss"}`}>
                          {tx.amount_cents >= 0 ? "+" : ""}{fmt(tx.amount_cents, tx.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendUp, accent }: {
  label: string; value: string | null; icon: any; trend?: string; trendUp?: boolean; accent?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border p-4 sm:p-5 shadow-card overflow-hidden ${accent ? "border-primary/30 bg-gradient-surface shadow-glow" : "border-border/60 bg-gradient-surface"}`}>
      {accent && <div className="absolute inset-0 bg-gradient-glow opacity-40" aria-hidden />}
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          {value === null ? <Skeleton className="mt-2 h-7 w-28" /> : <p className="mt-2 text-xl sm:text-2xl font-bold font-mono tabular-nums truncate">{value}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${
              trendUp === true ? "text-profit"
              : trendUp === false ? "text-loss"
              : "text-muted-foreground"
            }`}>
              {trendUp === true && <TrendingUp className="size-3 shrink-0" />}
              {trendUp === false && <TrendingDown className="size-3 shrink-0" />}
              <span className="truncate">{trend}</span>
            </p>
          )}
        </div>
        <span className="size-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 ml-3"><Icon className="size-4" /></span>
      </div>
    </div>
  );
}