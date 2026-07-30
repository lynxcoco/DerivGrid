import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users, ArrowDownToLine, ArrowUpFromLine, LineChart,
  TrendingUp, TrendingDown, RefreshCw, AlertTriangle,
  Clock, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/overview")({
  head: () => ({ meta: [{ title: "Overview · Admin" }] }),
  component: AdminOverview,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, string> = {
  completed: "bg-profit", pending: "bg-warning",
  failed: "bg-loss", processing: "bg-primary",
};
const STATUS_LABEL: Record<string, string> = {
  completed: "text-profit", pending: "text-warning",
  failed: "text-loss", processing: "text-primary",
};

function AdminOverview() {
  const [stats,      setStats]      = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [recentDeps, setRecentDeps] = useState<any[]>([]);
  const [recentWds,  setRecentWds]  = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [
      { count: users },
      { data: deps },
      { data: wds },
      { count: trades },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("deposits")
        .select("id,amount_cents,status,currency,created_at,phone")
        .order("created_at", { ascending: false }).limit(100),
      supabase.from("withdrawals")
        .select("id,amount_cents,status,currency,created_at,phone")
        .order("created_at", { ascending: false }).limit(100),
      supabase.from("positions").select("id", { count: "exact", head: true }),
    ]);

    const d = deps ?? [], w = wds ?? [];
    const depVol = d.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);
    const wdVol  = w.filter((x: any) => x.status === "completed").reduce((s: number, x: any) => s + x.amount_cents, 0);

    setStats({
      users:       users ?? 0,
      trades:      trades ?? 0,
      depVolume:   depVol,
      wdVolume:    wdVol,
      pendingDeps: d.filter((x: any) => x.status === "pending").length,
      pendingWds:  w.filter((x: any) => x.status === "pending").length,
      netFlow:     depVol - wdVol,
    });
    setRecentDeps(d.slice(0, 6));
    setRecentWds(w.slice(0, 6));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const kpiCards = stats ? [
    {
      label: "Total Users",
      value: stats.users.toLocaleString(),
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      link: "/admin/users",
    },
    {
      label: "Deposit Volume",
      value: `KES ${(stats.depVolume / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
      icon: ArrowDownToLine,
      color: "text-profit",
      bg: "bg-profit/10",
      link: "/admin/deposits",
    },
    {
      label: "Withdrawal Volume",
      value: `KES ${(stats.wdVolume / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
      icon: ArrowUpFromLine,
      color: "text-loss",
      bg: "bg-loss/10",
      link: "/admin/withdrawals",
    },
    {
      label: "Net Platform Flow",
      value: `${stats.netFlow >= 0 ? "+" : "−"}KES ${(Math.abs(stats.netFlow) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
      icon: stats.netFlow >= 0 ? TrendingUp : TrendingDown,
      color: stats.netFlow >= 0 ? "text-profit" : "text-loss",
      bg:    stats.netFlow >= 0 ? "bg-profit/10" : "bg-loss/10",
      link: "/admin/reports",
    },
    {
      label: "Total Trades",
      value: stats.trades.toLocaleString(),
      icon: LineChart,
      color: "text-primary",
      bg: "bg-primary/10",
      link: "/admin/trades",
    },
    {
      label: "Pending Actions",
      value: `${stats.pendingDeps + stats.pendingWds} (${stats.pendingDeps}D · ${stats.pendingWds}W)`,
      icon: Clock,
      color: stats.pendingDeps + stats.pendingWds > 0 ? "text-warning" : "text-muted-foreground",
      bg:    stats.pendingDeps + stats.pendingWds > 0 ? "bg-warning/10" : "bg-muted/10",
      link: "/admin/deposits",
      urgent: (stats.pendingDeps + stats.pendingWds) > 0,
    },
  ] : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Platform health and activity at a glance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 shrink-0">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* ── Urgent actions banner ────────────────────────────────────────────── */}
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
          <div className="flex gap-2 shrink-0 flex-wrap">
            {stats.pendingDeps > 0 && (
              <Button size="sm" variant="outline"
                className="h-7 text-xs border-warning/40 text-warning hover:bg-warning/10" asChild>
                <Link to="/admin/deposits">Review deposits</Link>
              </Button>
            )}
            {stats.pendingWds > 0 && (
              <Button size="sm" variant="outline"
                className="h-7 text-xs border-warning/40 text-warning hover:bg-warning/10" asChild>
                <Link to="/admin/withdrawals">Review withdrawals</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── KPI grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {loading
          ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)
          : kpiCards.map(({ label, value, icon: Icon, color, bg, link, urgent }) => (
            <Link
              key={label} to={link}
              className={`group rounded-xl border bg-gradient-surface shadow-card px-4 py-3 flex items-center gap-3 hover:shadow-elevated transition-all ${
                urgent ? "border-warning/40" : "border-border/60"
              }`}
            >
              {/* Icon — fixed size, never shrinks */}
              <div className={`size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`size-4 ${color}`} />
              </div>

              {/* Label + value stacked — takes all remaining width */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mb-1">
                  {label}
                </p>
                <p className={`text-sm font-bold font-mono leading-none whitespace-nowrap overflow-hidden text-ellipsis ${color}`}>
                  {value}
                </p>
              </div>

              <ArrowRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>
          ))}
      </div>

      {/* ── Recent activity ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent deposits */}
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40">
            <h2 className="font-semibold text-sm">Recent Deposits</h2>
            <Link to="/admin/deposits"
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : recentDeps.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No deposits yet.</div>
          ) : (
            <div className="divide-y divide-border/25">
              {recentDeps.map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-2 rounded-full shrink-0 ${STATUS_DOT[d.status] ?? "bg-muted"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-semibold truncate">
                        {d.currency} {(d.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.phone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs font-medium capitalize ${STATUS_LABEL[d.status] ?? "text-muted-foreground"}`}>
                      {d.status}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(d.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent withdrawals */}
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border/40">
            <h2 className="font-semibold text-sm">Recent Withdrawals</h2>
            <Link to="/admin/withdrawals"
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : recentWds.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No withdrawals yet.</div>
          ) : (
            <div className="divide-y divide-border/25">
              {recentWds.map((w, i) => (
                <div key={i} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-surface/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`size-2 rounded-full shrink-0 ${STATUS_DOT[w.status] ?? "bg-muted"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-semibold truncate">
                        {w.currency} {(w.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{w.phone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className={`text-xs font-medium capitalize ${STATUS_LABEL[w.status] ?? "text-muted-foreground"}`}>
                      {w.status}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(w.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}
                    </p>
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
