import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download, RefreshCw, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, TrendingDown, Search, FileText, Calendar,
  AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Finance Reports · Admin" }] }),
  component: AdminReports,
});

// ── Types ─────────────────────────────────────────────────────────────────────
type DepositRow = {
  id: string; user_id: string; amount_cents: number; currency: string;
  status: string; phone: string | null; provider_ref: string | null; created_at: string;
};
type WithdrawalRow = {
  id: string; user_id: string; amount_cents: number; currency: string;
  status: string; phone: string | null; provider_ref: string | null; created_at: string;
};
type BetRow = {
  id: string; user_id: string; bet_amount_cents: number; outcome: string;
  gross_return_cents: number; net_profit_cents: number; created_at: string;
};

type ReportType = "deposits" | "withdrawals" | "bets" | "summary";
type Period = "today" | "yesterday" | "week" | "month" | "custom";

const fmt = (c: number) =>
  `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

const STATUS_BADGE: Record<string, string> = {
  completed:  "bg-profit/15 text-profit",
  pending:    "bg-warning/15 text-warning",
  failed:     "bg-loss/15 text-loss",
  cancelled:  "bg-muted/20 text-muted-foreground",
  processing: "bg-primary/15 text-primary",
};

// ── Date range helpers ────────────────────────────────────────────────────────
function toISOStart(d: Date) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c.toISOString();
}
function toISOEnd(d: Date) {
  const c = new Date(d); c.setHours(23, 59, 59, 999); return c.toISOString();
}
function periodRange(p: Period, from: string, to: string): [string, string] {
  const now = new Date();
  if (p === "today") return [toISOStart(now), toISOEnd(now)];
  if (p === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return [toISOStart(y), toISOEnd(y)];
  }
  if (p === "week") {
    const w = new Date(now); w.setDate(w.getDate() - 6);
    return [toISOStart(w), toISOEnd(now)];
  }
  if (p === "month") {
    const m = new Date(now.getFullYear(), now.getMonth(), 1);
    return [toISOStart(m), toISOEnd(now)];
  }
  // custom
  return [toISOStart(new Date(from)), toISOEnd(new Date(to))];
}

function periodLabel(p: Period, from: string, to: string): string {
  if (p === "today") return "Today";
  if (p === "yesterday") return "Yesterday";
  if (p === "week") return "Last 7 days";
  if (p === "month") return "This month";
  return `${from} → ${to}`;
}

// ── CSV export ────────────────────────────────────────────────────────────────
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))];
  const blob  = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-3 sm:p-4 lg:p-5">
      <div className="flex items-start justify-between mb-2">
        <span className={`size-7 sm:size-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`size-3.5 sm:size-4 ${color}`} />
        </span>
      </div>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">{label}</p>
      {/* 
        Use text-xs on mobile so long KES figures never overflow.
        font-mono + break-all ensures the number wraps cleanly if needed.
      */}
      <p className={`text-xs sm:text-sm lg:text-base font-bold font-mono mt-0.5 break-all leading-snug ${color}`}>
        {value}
      </p>
      {sub && <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{sub}</p>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title, count, onDownload, downloading,
}: {
  title: string; count: number;
  onDownload: () => void; downloading: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-[10px] bg-surface border border-border/60 px-2 py-0.5 rounded-full text-muted-foreground">
          {count} records
        </span>
      </div>
      <Button
        size="sm" variant="outline"
        onClick={onDownload}
        disabled={downloading || count === 0}
        className="h-7 text-xs gap-1.5"
      >
        <Download className="size-3" />
        {downloading ? "Exporting…" : "Download CSV"}
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AdminReports() {
  // Period controls
  const [period,  setPeriod]  = useState<Period>("today");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Data
  const [deposits,    setDeposits]    = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [bets,        setBets]        = useState<BetRow[]>([]);
  const [marketerIds, setMarketerIds] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Account type filter: all | real | demo
  const [accountFilter, setAccountFilter] = useState<"all" | "real" | "demo">("all");

  // UI state
  const [activeTab,    setActiveTab]    = useState<ReportType>("summary");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [downloading,  setDownloading]  = useState(false);
  const [sortField,    setSortField]    = useState<string>("created_at");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("desc");

  const load = async () => {
    setLoading(true);
    const [start, end] = periodRange(period, fromDate, toDate);

    const [{ data: deps }, { data: wds }, { data: bs }, { data: mRoles }] = await Promise.all([
      supabase.from("deposits")
        .select("id, user_id, amount_cents, currency, status, phone, provider_ref, created_at")
        .gte("created_at", start).lte("created_at", end)
        .order("created_at", { ascending: false }).limit(2000),
      supabase.from("withdrawals")
        .select("id, user_id, amount_cents, currency, status, phone, provider_ref, created_at")
        .gte("created_at", start).lte("created_at", end)
        .order("created_at", { ascending: false }).limit(2000),
      (supabase.from("candle_bets") as any)
        .select("id, user_id, bet_amount_cents, outcome, gross_return_cents, net_profit_cents, created_at")
        .gte("created_at", start).lte("created_at", end)
        .order("created_at", { ascending: false }).limit(2000),
      supabase.from("user_roles").select("user_id").eq("role", "marketer"),
    ]);

    const mIds = new Set((mRoles ?? []).map((r: any) => r.user_id));
    setMarketerIds(mIds);
    setDeposits((deps ?? []) as DepositRow[]);
    setWithdrawals((wds ?? []) as WithdrawalRow[]);
    setBets((bs ?? []) as BetRow[]);
    setHasFetched(true);
    setLoading(false);
  };

  // ── Computed KPIs ────────────────────────────────────────────────────────────
  // ── Apply account filter to base data ─────────────────────────────────────
  const filteredDeposits = deposits.filter(d =>
    accountFilter === "all" ? true :
    accountFilter === "demo" ? marketerIds.has(d.user_id) :
    !marketerIds.has(d.user_id)
  );
  const filteredWithdrawals = withdrawals.filter(w =>
    accountFilter === "all" ? true :
    accountFilter === "demo" ? marketerIds.has(w.user_id) :
    !marketerIds.has(w.user_id)
  );
  const filteredBets = bets.filter(b =>
    accountFilter === "all" ? true :
    accountFilter === "demo" ? marketerIds.has(b.user_id) :
    !marketerIds.has(b.user_id)
  );

  const completedDeps = filteredDeposits.filter(d => d.status === "completed");
  const completedWds  = filteredWithdrawals.filter(w => w.status === "completed");
  const totalDepVol   = completedDeps.reduce((s, d) => s + d.amount_cents, 0);
  const totalWdVol    = completedWds.reduce((s, w) => s + w.amount_cents, 0);
  const netFlow       = totalDepVol - totalWdVol;
  const totalStaked   = filteredBets.reduce((s, b) => s + b.bet_amount_cents, 0);
  const totalPayouts  = filteredBets.filter(b => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0);
  const housePnl      = totalStaked - totalPayouts;
  const winBets       = filteredBets.filter(b => b.outcome === "win").length;
  const winRate       = filteredBets.length > 0 ? ((winBets / filteredBets.length) * 100).toFixed(1) : "0.0";
  const pendingDeps   = filteredDeposits.filter(d => d.status === "pending").length;
  const pendingWds    = filteredWithdrawals.filter(w => w.status === "pending").length;

  // ── Sort + filter helpers ─────────────────────────────────────────────────
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };
  const SortIcon = ({ field }: { field: string }) =>
    sortField === field
      ? sortDir === "desc" ? <ChevronDown className="size-3 inline ml-0.5" /> : <ChevronUp className="size-3 inline ml-0.5" />
      : <ChevronDown className="size-3 inline ml-0.5 opacity-30" />;

  const applyDepFilter = (rows: DepositRow[]) => rows
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => !search || r.phone?.includes(search) || r.user_id.includes(search) || r.provider_ref?.includes(search) || false)
    .sort((a, b) => {
      const av = sortField === "amount_cents" ? a.amount_cents : new Date(a.created_at).getTime();
      const bv = sortField === "amount_cents" ? b.amount_cents : new Date(b.created_at).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });

  const applyWdFilter = (rows: WithdrawalRow[]) => rows
    .filter(r => statusFilter === "all" || r.status === statusFilter)
    .filter(r => !search || r.phone?.includes(search) || r.user_id.includes(search) || false)
    .sort((a, b) => {
      const av = sortField === "amount_cents" ? a.amount_cents : new Date(a.created_at).getTime();
      const bv = sortField === "amount_cents" ? b.amount_cents : new Date(b.created_at).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });

  const visibleDeps = applyDepFilter(filteredDeposits);
  const visibleWds  = applyWdFilter(filteredWithdrawals);

  const applyBetFilter = (rows: BetRow[]) => rows
    .filter(r => statusFilter === "all" || r.outcome === statusFilter)
    .filter(r => !search || r.user_id.includes(search))
    .sort((a, b) => {
      const av = sortField === "amount_cents" ? a.bet_amount_cents : new Date(a.created_at).getTime();
      const bv = sortField === "amount_cents" ? b.bet_amount_cents : new Date(b.created_at).getTime();
      return sortDir === "asc" ? av - bv : bv - av;
    });

  const visibleBets = applyBetFilter(filteredBets);

  // ── CSV exports ──────────────────────────────────────────────────────────────
  const label = periodLabel(period, fromDate, toDate).replace(/\s+/g, "_").replace(/→/g, "to");

  const exportDeposits = () => {
    setDownloading(true);
    downloadCSV(
      `deposits_${label}.csv`,
      ["ID", "User ID", "Phone", "Amount (KES)", "Status", "Provider Ref", "Date"],
      visibleDeps.map(d => [
        d.id, d.user_id, d.phone ?? "", (d.amount_cents / 100).toFixed(2),
        d.status, d.provider_ref ?? "", d.created_at,
      ])
    );
    setDownloading(false);
  };

  const exportWithdrawals = () => {
    setDownloading(true);
    downloadCSV(
      `withdrawals_${label}.csv`,
      ["ID", "User ID", "Phone", "Amount (KES)", "Status", "Provider Ref", "Date"],
      visibleWds.map(w => [
        w.id, w.user_id, w.phone ?? "", (w.amount_cents / 100).toFixed(2),
        w.status, w.provider_ref ?? "", w.created_at,
      ])
    );
    setDownloading(false);
  };

  const exportBets = () => {
    setDownloading(true);
    downloadCSV(
      `bets_${label}.csv`,
      ["ID", "User ID", "Stake (KES)", "Outcome", "Payout (KES)", "Net P/L (KES)", "Date"],
      visibleBets.map(b => [
        b.id, b.user_id,
        (b.bet_amount_cents / 100).toFixed(2),
        b.outcome,
        b.outcome === "win" ? (b.gross_return_cents / 100).toFixed(2) : "0.00",
        (b.net_profit_cents / 100).toFixed(2),
        b.created_at,
      ])
    );
    setDownloading(false);
  };

  const exportSummary = () => {
    setDownloading(true);
    downloadCSV(
      `summary_${label}.csv`,
      ["Metric", "Value"],
      [
        ["Period", periodLabel(period, fromDate, toDate)],
        ["Total Deposits (completed)", (totalDepVol / 100).toFixed(2)],
        ["Total Deposits (count)", completedDeps.length],
        ["Pending Deposits", pendingDeps],
        ["Total Withdrawals (completed)", (totalWdVol / 100).toFixed(2)],
        ["Total Withdrawals (count)", completedWds.length],
        ["Pending Withdrawals", pendingWds],
        ["Net Cash Flow", (netFlow / 100).toFixed(2)],
        ["Total Bets", bets.length],
        ["Total Staked", (totalStaked / 100).toFixed(2)],
        ["Total Payouts", (totalPayouts / 100).toFixed(2)],
        ["House P/L", (housePnl / 100).toFixed(2)],
        ["User Win Rate (%)", winRate],
      ]
    );
    setDownloading(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const PERIODS: { value: Period; label: string }[] = [
    { value: "today",     label: "Today"     },
    { value: "yesterday", label: "Yesterday" },
    { value: "week",      label: "Last 7 days" },
    { value: "month",     label: "This month"  },
    { value: "custom",    label: "Custom range" },
  ];

  const TABS: { value: ReportType; label: string }[] = [
    { value: "summary",     label: "Summary"     },
    { value: "deposits",    label: `Deposits (${filteredDeposits.length})`    },
    { value: "withdrawals", label: `Withdrawals (${filteredWithdrawals.length})` },
    { value: "bets",        label: `Bets (${filteredBets.length})`        },
  ];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FileText className="size-5 sm:size-6 text-primary shrink-0" />
            Finance Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Select a period and fetch records. Export any dataset as CSV.
          </p>
        </div>
      </div>

      {/* ── Period selector ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-gradient-surface shadow-card px-4 py-3">
        {/* Single row: title | dropdown | [date inputs] | fetch button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="size-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">Reporting Period</span>
          </div>

          {/* Dropdown — grows on mobile, fixed on desktop */}
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as Period)}
            className="flex-1 sm:flex-none sm:w-44 h-8 rounded-lg border border-border/60 bg-surface text-xs px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Custom date range — shown inline when custom is selected */}
          {period === "custom" && (
            <>
              <Input
                type="date" className="h-8 text-xs w-36 shrink-0"
                value={fromDate} onChange={e => setFromDate(e.target.value)}
              />
              <span className="text-xs text-muted-foreground shrink-0">→</span>
              <Input
                type="date" className="h-8 text-xs w-36 shrink-0"
                value={toDate} onChange={e => setToDate(e.target.value)}
              />
            </>
          )}

          <Button
            onClick={load} disabled={loading} size="sm"
            className="bg-gradient-primary shadow-glow hover:opacity-95 gap-1.5 h-8 shrink-0 ml-auto"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : hasFetched ? "Refresh" : "Fetch"}
          </Button>
        </div>
      </div>

      {/* ── Not yet loaded ───────────────────────────────────────────────────── */}
      {!hasFetched && !loading && (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card py-20 text-center">
          <FileText className="size-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm font-medium">No data loaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Select a period above and click "Fetch records".</p>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      )}

      {/* ── Content (shown after fetch) ──────────────────────────────────────── */}
      {hasFetched && !loading && (
        <>
          {/* Period label */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>Showing: <strong className="text-foreground">{periodLabel(period, fromDate, toDate)}</strong></span>
          </div>

          {/* ── Account type filter ───────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Account type:</span>
            {([
              { key: "all",  label: "All Accounts" },
              { key: "real", label: "🟢 Real Traders" },
              { key: "demo", label: "🟡 Demo (Marketer)" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setAccountFilter(key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  accountFilter === key
                    ? key === "demo"
                      ? "bg-warning/20 border-warning/40 text-warning"
                      : "bg-primary/15 border-primary/30 text-primary"
                    : "bg-surface border-border/60 text-muted-foreground hover:text-foreground"
                }`}>
                {label}
              </button>
            ))}
            {accountFilter === "demo" && (
              <span className="text-xs text-warning/80 italic ml-1">
                Demo stats shown — no real money involved
              </span>
            )}
          </div>

          {/* ── KPI summary row ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <KpiCard label="Deposits (completed)" value={fmt(totalDepVol)}
              sub={`${completedDeps.length} transactions`}
              icon={ArrowDownToLine} color="text-profit" bg="bg-profit/10" />
            <KpiCard label="Withdrawals (completed)" value={fmt(totalWdVol)}
              sub={`${completedWds.length} transactions`}
              icon={ArrowUpFromLine} color="text-loss" bg="bg-loss/10" />
            <KpiCard label="Net Cash Flow" value={`${netFlow >= 0 ? "+" : "−"}${fmt(netFlow)}`}
              sub={netFlow >= 0 ? "More in than out" : "More out than in"}
              icon={netFlow >= 0 ? TrendingUp : TrendingDown}
              color={netFlow >= 0 ? "text-profit" : "text-loss"}
              bg={netFlow >= 0 ? "bg-profit/10" : "bg-loss/10"} />
            <KpiCard label="Pending Actions"
              value={`${pendingDeps + pendingWds}`}
              sub={`${pendingDeps} deposits · ${pendingWds} withdrawals`}
              icon={AlertCircle}
              color={pendingDeps + pendingWds > 0 ? "text-warning" : "text-muted-foreground"}
              bg={pendingDeps + pendingWds > 0 ? "bg-warning/10" : "bg-muted/10"} />
            <KpiCard label="Total Bets" value={bets.length.toLocaleString()}
              sub={`Win rate: ${winRate}%`}
              icon={TrendingUp} color="text-primary" bg="bg-primary/10" />
            <KpiCard label="Total Staked" value={fmt(totalStaked)}
              sub={`${bets.length} bets placed`}
              icon={TrendingUp} color="text-primary" bg="bg-primary/10" />
            <KpiCard label="House P/L" value={`${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`}
              sub="Staked minus payouts"
              icon={housePnl >= 0 ? TrendingUp : TrendingDown}
              color={housePnl >= 0 ? "text-profit" : "text-loss"}
              bg={housePnl >= 0 ? "bg-profit/10" : "bg-loss/10"} />
            <KpiCard label="Total Payouts" value={fmt(totalPayouts)}
              sub={`${winBets} winning bets`}
              icon={ArrowUpFromLine} color="text-warning" bg="bg-warning/10" />
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────────────── */}
          <div className="flex gap-1 border-b border-border/40 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.value} onClick={() => setActiveTab(t.value)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === t.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Search + Status filter bar ────────────────────────────────────── */}
          {activeTab !== "summary" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search phone, user ID, reference…"
                  className="pl-9 h-9 text-sm" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeTab === "deposits" && ["all","completed","pending","failed","cancelled"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                      statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
                {activeTab === "withdrawals" && ["all","completed","pending","cancelled"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                      statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
                {activeTab === "bets" && ["all","win","loss"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-all ${
                      statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}>{s === "all" ? "All bets" : s === "win" ? "Wins" : "Losses"}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── SUMMARY TAB ──────────────────────────────────────────────────── */}
          {activeTab === "summary" && (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
              <SectionHeader title="Period Summary" count={1} onDownload={exportSummary} downloading={downloading} />
              <div className="divide-y divide-border/30">
                {[
                  { group: "Deposits",     rows: [
                    ["Completed deposits",          fmt(totalDepVol),          completedDeps.length + " txns"],
                    ["Pending deposits",            pendingDeps.toString(),    "awaiting processing"],
                    ["Failed / cancelled",          deposits.filter(d => ["failed","cancelled"].includes(d.status)).length.toString(), ""],
                  ]},
                  { group: "Withdrawals",  rows: [
                    ["Completed withdrawals",       fmt(totalWdVol),           completedWds.length + " txns"],
                    ["Pending withdrawals",         pendingWds.toString(),     "awaiting approval"],
                    ["Cancelled",                   withdrawals.filter(w => w.status === "cancelled").length.toString(), ""],
                  ]},
                  { group: "Net Flow",     rows: [
                    ["Net cash movement",           `${netFlow >= 0 ? "+" : "−"}${fmt(netFlow)}`, netFlow >= 0 ? "net positive" : "net negative"],
                  ]},
                  { group: "Trading",      rows: [
                    ["Total bets placed",           bets.length.toLocaleString(), ""],
                    ["Total staked",                fmt(totalStaked),           ""],
                    ["Total payouts to winners",    fmt(totalPayouts),          `${winBets} wins`],
                    ["House P/L",                   `${housePnl >= 0 ? "+" : "−"}${fmt(housePnl)}`, ""],
                    ["User win rate",               `${winRate}%`,              `${winBets} wins / ${bets.length} bets`],
                  ]},
                ].map(section => (
                  <div key={section.group}>
                    <div className="px-5 py-2 bg-surface/40 border-b border-border/30">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{section.group}</p>
                    </div>
                    {section.rows.map(([label, value, note]) => (
                      <div key={label} className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-surface/30 transition-colors">
                        <span className="text-xs sm:text-sm text-muted-foreground shrink-0 min-w-0">{label}</span>
                        <div className="text-right min-w-0">
                          <span className="font-mono font-semibold text-xs sm:text-sm break-all">{value}</span>
                          {note && <p className="text-[10px] text-muted-foreground mt-0.5">{note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEPOSITS TAB ─────────────────────────────────────────────────── */}
          {activeTab === "deposits" && (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
              <SectionHeader title="Deposits" count={visibleDeps.length} onDownload={exportDeposits} downloading={downloading} />
              {visibleDeps.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="size-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No deposits match this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                        <th className="text-left px-3 sm:px-5 py-3 font-semibold">Phone / User</th>
                        <th className="text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("amount_cents")}>
                          Amount <SortIcon field="amount_cents" />
                        </th>
                        <th className="text-left px-2 sm:px-4 py-3 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Reference</th>
                        <th className="text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                          Date <SortIcon field="created_at" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDeps.map(d => (
                        <tr key={d.id} className="border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0">
                          <td className="px-3 sm:px-5 py-3">
                            <p className="font-mono text-xs font-medium">{d.phone ?? "—"}</p>
                            <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">{d.user_id.slice(0, 14)}…</p>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-right font-mono font-semibold text-profit text-xs whitespace-nowrap">
                            {fmt(d.amount_cents)}
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <Badge className={`text-[10px] border-0 capitalize ${STATUS_BADGE[d.status] ?? ""}`}>{d.status}</Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground hidden md:table-cell">
                            {d.provider_ref ?? "—"}
                          </td>
                          <td className="px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            <span className="hidden sm:inline">{new Date(d.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            <span className="sm:hidden">{new Date(d.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase">
                          {visibleDeps.length} records
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-right font-mono font-bold text-profit text-xs whitespace-nowrap">
                          {fmt(visibleDeps.reduce((s, d) => s + d.amount_cents, 0))}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── WITHDRAWALS TAB ──────────────────────────────────────────────── */}
          {activeTab === "withdrawals" && (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
              <SectionHeader title="Withdrawals" count={visibleWds.length} onDownload={exportWithdrawals} downloading={downloading} />
              {visibleWds.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="size-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No withdrawals match this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                        <th className="text-left px-3 sm:px-5 py-3 font-semibold">Phone / User</th>
                        <th className="text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("amount_cents")}>
                          Amount <SortIcon field="amount_cents" />
                        </th>
                        <th className="text-left px-2 sm:px-4 py-3 font-semibold">Status</th>
                        <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Reference</th>
                        <th className="text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                          Date <SortIcon field="created_at" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleWds.map(w => (
                        <tr key={w.id} className="border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0">
                          <td className="px-3 sm:px-5 py-3">
                            <p className="font-mono text-xs font-medium">{w.phone ?? "—"}</p>
                            <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">{w.user_id.slice(0, 14)}…</p>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-right font-mono font-semibold text-loss text-xs whitespace-nowrap">
                            −{fmt(w.amount_cents)}
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <Badge className={`text-[10px] border-0 capitalize ${STATUS_BADGE[w.status] ?? ""}`}>{w.status}</Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground hidden md:table-cell">
                            {w.provider_ref ?? "—"}
                          </td>
                          <td className="px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            <span className="hidden sm:inline">{new Date(w.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            <span className="sm:hidden">{new Date(w.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase">
                          {visibleWds.length} records
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-right font-mono font-bold text-loss text-xs whitespace-nowrap">
                          −{fmt(visibleWds.reduce((s, w) => s + w.amount_cents, 0))}
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── BETS TAB ─────────────────────────────────────────────────────── */}
          {activeTab === "bets" && (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
              <SectionHeader title="Candle Bets" count={visibleBets.length} onDownload={exportBets} downloading={downloading} />
              {visibleBets.length === 0 ? (
                <div className="py-12 text-center">
                  <AlertCircle className="size-7 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No bets match this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                        <th className="text-left px-3 sm:px-5 py-3 font-semibold">User ID</th>
                        <th className="text-right px-2 sm:px-4 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("amount_cents")}>
                          Stake <SortIcon field="amount_cents" />
                        </th>
                        <th className="text-left px-2 sm:px-4 py-3 font-semibold">Result</th>
                        <th className="text-right px-2 sm:px-4 py-3 font-semibold">Payout</th>
                        <th className="text-right px-2 sm:px-4 py-3 font-semibold hidden sm:table-cell">House P/L</th>
                        <th className="text-right px-2 sm:px-5 py-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort("created_at")}>
                          Date <SortIcon field="created_at" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleBets.map(b => {
                        const houseTake = b.outcome === "loss" ? b.bet_amount_cents : b.bet_amount_cents - b.gross_return_cents;
                        return (
                          <tr key={b.id} className="border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0">
                            <td className="px-3 sm:px-5 py-3 font-mono text-[10px] text-muted-foreground">
                              {b.user_id.slice(0, 10)}…
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right font-mono font-semibold text-xs whitespace-nowrap">
                              {fmt(b.bet_amount_cents)}
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <Badge className={`text-[10px] border-0 font-semibold ${b.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                                {b.outcome === "win" ? "WIN" : "LOSS"}
                              </Badge>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right font-mono text-xs whitespace-nowrap">
                              {b.outcome === "win" ? fmt(b.gross_return_cents) : "—"}
                            </td>
                            <td className={`px-2 sm:px-4 py-3 text-right font-mono text-xs font-semibold whitespace-nowrap hidden sm:table-cell ${houseTake >= 0 ? "text-profit" : "text-loss"}`}>
                              {houseTake >= 0 ? "+" : "−"}{fmt(Math.abs(houseTake))}
                            </td>
                            <td className="px-2 sm:px-5 py-3 text-right text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                              <span className="hidden sm:inline">{new Date(b.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                              <span className="sm:hidden">{new Date(b.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short" })}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-3 sm:px-5 py-3 text-xs font-bold text-muted-foreground uppercase">
                          {visibleBets.length} bets
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-right font-mono font-bold text-xs whitespace-nowrap">
                          {fmt(visibleBets.reduce((s, b) => s + b.bet_amount_cents, 0))}
                        </td>
                        <td className="px-2 sm:px-4 py-3" />
                        <td className="px-2 sm:px-4 py-3 text-right font-mono font-bold text-warning text-xs whitespace-nowrap">
                          {fmt(visibleBets.filter(b => b.outcome === "win").reduce((s, b) => s + b.gross_return_cents, 0))}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-right font-mono font-bold text-profit text-xs whitespace-nowrap hidden sm:table-cell">
                          +{fmt(visibleBets.reduce((s, b) => {
                            const h = b.outcome === "loss" ? b.bet_amount_cents : b.bet_amount_cents - b.gross_return_cents;
                            return s + h;
                          }, 0))}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

        </>
      )}
    </div>
  );
}
