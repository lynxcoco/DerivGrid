import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users, ArrowDownToLine, ArrowUpFromLine, LineChart,
  TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  Clock, ArrowRight, ShieldCheck, TestTube,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/overview")({
  head: () => ({ meta: [{ title: "Overview · Admin" }] }),
  component: AdminOverview,
});

const STATUS_DOT: Record<string, string> = {
  completed: "bg-profit", pending: "bg-warning",
  failed: "bg-loss", processing: "bg-primary",
};
const STATUS_LABEL: Record<string, string> = {
  completed: "text-profit", pending: "text-warning",
  failed: "text-loss", processing: "text-primary",
};
const fmtKes = (cents: number) =>
  `KES ${(cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

function AdminOverview() {
  const [stats,         setStats]         = useState<any>(null);
  const [realStats,     setRealStats]     = useState<any>(null);
  const [demoStats,     setDemoStats]     = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [recentDeps,    setRecentDeps]    = useState<any[]>([]);
  const [recentWds,     setRecentWds]     = useState<any[]>([]);
  const [marketerIds,   setMarketerIds]   = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);

    const [
      { count: users },
      { data: deps },
      { data: wds },
      { count: trades },
      { count: bets },
      { data: marketerRoles },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("deposits").select("id,user_id,amount_cents,status,currency,created_at,phone").order("created_at", { ascending: false }).limit(500),
      supabase.from("withdrawals").select("id,user_id,amount_cents,status,currency,created_at,phone").order("created_at", { ascending: false }).limit(500),
      supabase.from("positions").select("id", { count: "exact", head: true }),
      (supabase.from("candle_bets") as any).select("id", { count: "exact", head: true }),
      supabase.from("user_roles").select("user_id").eq("role", "marketer"),
    ]);

    const mIds = new Set((marketerRoles ?? []).map((r: any) => r.user_id));
    setMarketerIds(mIds);

    const d = deps ?? [], w = wds ?? [];

    // ── Real trader stats (exclude marketers) ──────────────────────────────
    const realDeps = d.filter((x: any) => !mIds.has(x.user_id));
    const realWds  = w.filter((x: any) => !mIds.has(x.user_id));
    const realDepVol  = realDeps.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);
    const realWdVol   = realWds.filter((x: any)  => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);

    // ── Demo (marketer) stats ──────────────────────────────────────────────
    const demoDeps = d.filter((x: any) => mIds.has(x.user_id));
    const demoWds  = w.filter((x: any) => mIds.has(x.user_id));
    const demoDepVol  = demoDeps.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);
    const demoWdVol   = demoWds.filter((x: any)  => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);

    setStats({
      users:       users ?? 0,
      trades:      trades ?? 0,
      bets:        bets ?? 0,
      pendingDeps: realDeps.filter((x: any) => x.status === "pending").length,
      pendingWds:  realWds.filter((x: any)  => x.status === "pending").length,
    });

    setRealStats({
      depVolume: realDepVol,
      wdVolume:  realWdVol,
      netFlow:   realDepVol - realWdVol,
      pendingDeps: realDeps.filter((x: any) => x.status === "pending").length,
      pendingWds:  realWds.filter((x: any)  => x.status === "pending").length,
    });

    setDemoStats({
      depVolume:   demoDepVol,
      wdVolume:    demoWdVol,
      totalDeps:   demoDeps.length,
      totalWds:    demoWds.length,
      marketers:   mIds.size,
    });

    setRecentDeps(realDeps.slice(0, 6));
    setRecentWds(realWds.slice(0, 6));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Platform health at a glance.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 shrink-0">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Urgent banner */}
      {!loading && stats && (stats.pendingDeps > 0 || stats.pendingWds > 0) && (
        <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="size-4 text-warning shrink-0" />
          <div className="flex-1 text-sm min-w-0">
            <span className="font-semibold text-warning">Action required — </span>
            <span className="text-muted-foreground">
              {stats.pendingDeps > 0 && `${stats.pendingDeps} pending deposit${stats.pendingDeps > 1 ? "s" : ""}`}
              {stats.pendingDeps > 0 && stats.pendingWds > 0 && " · "}
              {stats.pendingWds > 0 && `${stats.pendingWds} pending withdrawal${stats.pendingWds > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            {stats.pendingDeps > 0 && (
              <Button size="sm" variant="outline" className="h-7 text-xs border-warning/40 text-warning hover:bg-warning/10" asChild>
                <Link to="/admin/deposits">Review deposits</Link>
              </Button>
            )}
            {stats.pendingWds > 0 && (
              <Button size="sm" variant="outline" className="h-7 text-xs border-warning/40 text-warning hover:bg-warning/10" asChild>
                <Link to="/admin/withdrawals">Review withdrawals</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Global KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) : [
          { label: "Total Users",    value: stats?.users?.toLocaleString() ?? "0",  icon: Users,      color: "text-primary",  bg: "bg-primary/10",  link: "/admin/users" },
          { label: "Total Trades",   value: stats?.trades?.toLocaleString() ?? "0", icon: LineChart,   color: "text-primary",  bg: "bg-primary/10",  link: "/admin/trades" },
          { label: "Candle Bets",    value: stats?.bets?.toLocaleString()   ?? "0", icon: TrendingUp,  color: "text-warning",  bg: "bg-warning/10",  link: "/admin/trades" },
          { label: "Pending Actions",value: `${(stats?.pendingDeps ?? 0) + (stats?.pendingWds ?? 0)}`,
            icon: Clock,
            color: (stats?.pendingDeps ?? 0) + (stats?.pendingWds ?? 0) > 0 ? "text-warning" : "text-muted-foreground",
            bg:    (stats?.pendingDeps ?? 0) + (stats?.pendingWds ?? 0) > 0 ? "bg-warning/10" : "bg-muted/10",
            link: "/admin/deposits" },
        ].map(({ label, value, icon: Icon, color, bg, link }) => (
          <Link key={label} to={link} className="group rounded-xl border border-border/60 bg-gradient-surface shadow-card px-3 sm:px-4 py-3 flex items-center gap-3 hover:shadow-elevated transition-all">
            <div className={`size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`size-4 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mb-1 truncate">{label}</p>
              <p className={`text-sm font-bold font-mono leading-none ${color}`}>{value}</p>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      {/* ── Real Money (Traders) ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-profit" />
          <h2 className="font-bold text-sm sm:text-base text-profit">Real Money — Traders</h2>
          <span className="px-2 py-0.5 rounded-full bg-profit/15 text-profit text-[10px] font-bold border border-profit/25">LIVE</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />) : [
            { label: "Deposit Volume",   value: fmtKes(realStats?.depVolume ?? 0),  icon: ArrowDownToLine,  color: "text-profit",  bg: "bg-profit/10",  link: "/admin/deposits" },
            { label: "Withdrawal Volume",value: fmtKes(realStats?.wdVolume  ?? 0),  icon: ArrowUpFromLine,  color: "text-loss",    bg: "bg-loss/10",    link: "/admin/withdrawals" },
            { label: "Net Flow",
              value: `${(realStats?.netFlow ?? 0) >= 0 ? "+" : "−"}${fmtKes(Math.abs(realStats?.netFlow ?? 0))}`,
              icon: (realStats?.netFlow ?? 0) >= 0 ? TrendingUp : TrendingDown,
              color: (realStats?.netFlow ?? 0) >= 0 ? "text-profit" : "text-loss",
              bg:    (realStats?.netFlow ?? 0) >= 0 ? "bg-profit/10" : "bg-loss/10",
              link: "/admin/reports" },
            { label: "Pending",
              value: `${realStats?.pendingDeps ?? 0}D · ${realStats?.pendingWds ?? 0}W`,
              icon: Clock,
              color: ((realStats?.pendingDeps ?? 0) + (realStats?.pendingWds ?? 0)) > 0 ? "text-warning" : "text-muted-foreground",
              bg:    ((realStats?.pendingDeps ?? 0) + (realStats?.pendingWds ?? 0)) > 0 ? "bg-warning/10" : "bg-muted/10",
              link: "/admin/deposits" },
          ].map(({ label, value, icon: Icon, color, bg, link }) => (
            <Link key={label} to={link} className="group rounded-xl border border-profit/20 bg-gradient-surface shadow-card px-3 sm:px-4 py-3 flex items-center gap-3 hover:shadow-elevated transition-all">
              <div className={`size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mb-1 truncate">{label}</p>
                <p className={`text-sm font-bold font-mono leading-none truncate ${color}`}>{value}</p>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Demo (Marketers) ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TestTube className="size-4 text-warning" />
          <h2 className="font-bold text-sm sm:text-base text-warning">Demo Accounts — Marketers</h2>
          <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-[10px] font-bold border border-warning/25">DEMO</span>
        </div>
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-4 sm:p-5">
          <p className="text-xs text-warning/80 mb-4">
            These stats reflect simulated activity from marketer accounts. <strong>No real money is involved.</strong>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />) : [
              { label: "Marketers",       value: demoStats?.marketers?.toString() ?? "0" },
              { label: "Demo Deposits",   value: demoStats?.totalDeps?.toString() ?? "0" },
              { label: "Demo Withdrawals",value: demoStats?.totalWds?.toString()  ?? "0" },
              { label: "Simulated Vol",   value: fmtKes(demoStats?.depVolume ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-warning/20 bg-background/40 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-warning/70 font-semibold">{label}</p>
                <p className="text-sm font-bold font-mono text-warning mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Real Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent real deposits */}
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40">
            <h2 className="font-semibold text-sm">Recent Real Deposits</h2>
            <Link to="/admin/deposits" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
          ) : recentDeps.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No real deposits yet.</div>
          ) : (
            <div className="divide-y divide-border/25">
              {recentDeps.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-2 rounded-full shrink-0 ${STATUS_DOT[d.status] ?? "bg-muted"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-semibold truncate">{d.currency} {(d.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.phone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs font-medium capitalize ${STATUS_LABEL[d.status] ?? "text-muted-foreground"}`}>{d.status}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent real withdrawals */}
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40">
            <h2 className="font-semibold text-sm">Recent Real Withdrawals</h2>
            <Link to="/admin/withdrawals" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
          ) : recentWds.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No real withdrawals yet.</div>
          ) : (
            <div className="divide-y divide-border/25">
              {recentWds.map((w, i) => (
                <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-2 rounded-full shrink-0 ${STATUS_DOT[w.status] ?? "bg-muted"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-semibold truncate">{w.currency} {(w.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{w.phone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs font-medium capitalize ${STATUS_LABEL[w.status] ?? "text-muted-foreground"}`}>{w.status}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(w.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
