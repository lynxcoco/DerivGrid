import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RefreshCw, Search, Shield, UserCheck, User, ChevronDown,
  X, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  Wallet, Eye, Download,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users · Admin" }] }),
  component: AdminUsers,
});

// ── Types ─────────────────────────────────────────────────────────────────────
type UserRow = {
  id: string; full_name: string | null; phone: string | null;
  country: string | null; created_at: string; roles: string[]; balance: number;
};
type DepRow = {
  id: string; amount_cents: number; currency: string;
  status: string; phone: string | null; provider_ref: string | null; created_at: string;
};
type WdRow = {
  id: string; amount_cents: number; currency: string;
  status: string; phone: string | null; provider_ref: string | null; created_at: string;
};
type BetRow = {
  id: string; bet_amount_cents: number; outcome: string;
  gross_return_cents: number; net_profit_cents: number; created_at: string;
};
type UserDetail = {
  user: UserRow;
  deposits: DepRow[];
  withdrawals: WdRow[];
  bets: BetRow[];
};

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_ROLES = ["user", "marketer", "support", "admin"] as const;
type Role = typeof ALL_ROLES[number];

const ROLE_BADGE: Record<string, string> = {
  admin:    "bg-primary/15 text-primary border-primary/25",
  marketer: "bg-warning/15 text-warning border-warning/25",
  support:  "bg-profit/15 text-profit border-profit/25",
  user:     "bg-surface text-muted-foreground border-border/60",
};
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin", marketer: "Marketer", support: "Support", user: "User",
};
const STATUS_BADGE: Record<string, string> = {
  completed:  "bg-profit/15 text-profit",
  pending:    "bg-warning/15 text-warning",
  failed:     "bg-loss/15 text-loss",
  cancelled:  "bg-muted/20 text-muted-foreground",
  processing: "bg-primary/15 text-primary",
};

const fmt   = (c: number) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
const fmtD  = (s: string) => new Date(s).toLocaleString("en-KE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function primaryRole(roles: string[]): string {
  if (roles.includes("admin"))    return "admin";
  if (roles.includes("support"))  return "support";
  if (roles.includes("marketer")) return "marketer";
  return "user";
}

// ── CSV helper ────────────────────────────────────────────────────────────────
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv  = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── User Detail Drawer ────────────────────────────────────────────────────────
function UserDetailDrawer({
  detail, onClose,
}: {
  detail: UserDetail | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "deposits" | "withdrawals" | "bets">("overview");
  const [depFilter, setDepFilter] = useState("all");

  useEffect(() => { if (detail) setTab("overview"); }, [detail?.user.id]);

  if (!detail) return null;
  const { user, deposits, withdrawals, bets } = detail;

  // Computed stats
  const completedDeps = deposits.filter(d => d.status === "completed");
  const completedWds  = withdrawals.filter(w => w.status === "completed");
  const totalDep      = completedDeps.reduce((s, d) => s + d.amount_cents, 0);
  const totalWd       = completedWds.reduce((s, w) => s + w.amount_cents, 0);
  const totalStaked   = bets.reduce((s, b) => s + b.bet_amount_cents, 0);
  const winBets       = bets.filter(b => b.outcome === "win");
  const totalWon      = winBets.reduce((s, b) => s + b.gross_return_cents, 0);
  const houseTake     = totalStaked - totalWon;
  const winRate       = bets.length > 0 ? ((winBets.length / bets.length) * 100).toFixed(1) : "0.0";

  const visibleDeps = depFilter === "all" ? deposits : deposits.filter(d => d.status === depFilter);

  const exportDeposits = () => downloadCSV(
    `deposits_${user.full_name ?? user.id.slice(0, 8)}.csv`,
    ["Date", "Amount (KES)", "Status", "Phone", "Reference"],
    deposits.map(d => [fmtD(d.created_at), (d.amount_cents / 100).toFixed(2), d.status, d.phone ?? "", d.provider_ref ?? ""])
  );

  const exportWithdrawals = () => downloadCSV(
    `withdrawals_${user.full_name ?? user.id.slice(0, 8)}.csv`,
    ["Date", "Amount (KES)", "Status", "Phone", "Reference"],
    withdrawals.map(w => [fmtD(w.created_at), (w.amount_cents / 100).toFixed(2), w.status, w.phone ?? "", w.provider_ref ?? ""])
  );

  const TABS = [
    { key: "overview",     label: "Overview"                    },
    { key: "deposits",     label: `Deposits (${deposits.length})`     },
    { key: "withdrawals",  label: `Withdrawals (${withdrawals.length})` },
    { key: "bets",         label: `Bets (${bets.length})`         },
  ] as const;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-background border-l border-border/60 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
              {(user.full_name ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user.full_name ?? "Unknown"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors shrink-0">
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/40 shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
          {tab === "overview" && (
            <div className="p-5 space-y-5">

              {/* Profile info */}
              <div className="rounded-xl border border-border/50 bg-surface/40 divide-y divide-border/30">
                {[
                  ["Phone",    user.phone    ?? "—"],
                  ["Country",  user.country  ?? "—"],
                  ["Joined",   new Date(user.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })],
                  ["Role",     primaryRole(user.roles)],
                  ["Balance",  fmt(user.balance)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Financial summary</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total deposited",   value: fmt(totalDep),   sub: `${completedDeps.length} completed`,        icon: ArrowDownToLine, color: "text-profit",  bg: "bg-profit/10"  },
                    { label: "Total withdrawn",    value: fmt(totalWd),    sub: `${completedWds.length} completed`,         icon: ArrowUpFromLine, color: "text-loss",    bg: "bg-loss/10"    },
                    { label: "Current balance",    value: fmt(user.balance), sub: "wallet balance",                        icon: Wallet,          color: "text-primary", bg: "bg-primary/10" },
                    { label: "Net deposited",      value: `${(totalDep - totalWd) >= 0 ? "+" : "−"}${fmt(totalDep - totalWd)}`,
                      sub: "deposits minus withdrawals",
                      icon: (totalDep - totalWd) >= 0 ? TrendingUp : TrendingDown,
                      color: (totalDep - totalWd) >= 0 ? "text-profit" : "text-loss",
                      bg:    (totalDep - totalWd) >= 0 ? "bg-profit/10" : "bg-loss/10" },
                    { label: "Total staked",       value: fmt(totalStaked), sub: `${bets.length} bets`,                    icon: TrendingUp,      color: "text-primary", bg: "bg-primary/10" },
                    { label: "User win rate",       value: `${winRate}%`,   sub: `${winBets.length} wins / ${bets.length} bets`, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
                  ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                    <div key={label} className="rounded-xl border border-border/50 bg-gradient-surface p-3.5">
                      <span className={`size-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                        <Icon className={`size-3.5 ${color}`} />
                      </span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className={`text-sm font-bold font-mono mt-0.5 ${color}`}>{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending alerts */}
              {(deposits.some(d => d.status === "pending") || withdrawals.some(w => w.status === "pending")) && (
                <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-xs text-warning">
                  ⚠ This user has pending transactions. Review Deposits / Withdrawals tabs.
                </div>
              )}
            </div>
          )}

          {/* ── DEPOSITS ─────────────────────────────────────────────────────── */}
          {tab === "deposits" && (
            <div className="p-5 space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total deposited</p>
                  <p className="text-sm font-bold text-profit font-mono mt-0.5">{fmt(totalDep)}</p>
                  <p className="text-[10px] text-muted-foreground">{completedDeps.length} completed</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-sm font-bold text-warning font-mono mt-0.5">{deposits.filter(d => d.status === "pending").length}</p>
                  <p className="text-[10px] text-muted-foreground">transactions</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">All time</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{deposits.length}</p>
                  <p className="text-[10px] text-muted-foreground">total records</p>
                </div>
              </div>

              {/* Filter + export */}
              <div className="flex items-center gap-2 flex-wrap">
                {["all", "completed", "pending", "failed", "cancelled"].map(s => (
                  <button key={s} onClick={() => setDepFilter(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border capitalize transition-all ${
                      depFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
                <button onClick={exportDeposits}
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-border/60 text-muted-foreground hover:text-foreground transition-all">
                  <Download className="size-3" />CSV
                </button>
              </div>

              {/* Table */}
              {visibleDeps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No deposits found.</p>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/40 text-muted-foreground uppercase">
                        <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Amount</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                        <th className="text-left px-3 py-2.5 font-semibold hidden sm:table-cell">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDeps.map(d => (
                        <tr key={d.id} className="border-b border-border/20 hover:bg-surface/30 last:border-0">
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                            {new Date(d.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-profit">{fmt(d.amount_cents)}</td>
                          <td className="px-3 py-2.5">
                            <Badge className={`text-[10px] border-0 capitalize ${STATUS_BADGE[d.status] ?? ""}`}>{d.status}</Badge>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-muted-foreground hidden sm:table-cell truncate max-w-[100px]">
                            {d.provider_ref ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-4 py-2 font-bold text-muted-foreground">{visibleDeps.length} records</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-profit">
                          {fmt(visibleDeps.reduce((s, d) => s + d.amount_cents, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── WITHDRAWALS ──────────────────────────────────────────────────── */}
          {tab === "withdrawals" && (
            <div className="p-5 space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total withdrawn</p>
                  <p className="text-sm font-bold text-loss font-mono mt-0.5">{fmt(totalWd)}</p>
                  <p className="text-[10px] text-muted-foreground">{completedWds.length} completed</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-sm font-bold text-warning font-mono mt-0.5">{withdrawals.filter(w => w.status === "pending").length}</p>
                  <p className="text-[10px] text-muted-foreground">awaiting approval</p>
                </div>
                <div className="rounded-xl border border-border/50 bg-surface/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">All time</p>
                  <p className="text-sm font-bold font-mono mt-0.5">{withdrawals.length}</p>
                  <p className="text-[10px] text-muted-foreground">total records</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={exportWithdrawals}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-border/60 text-muted-foreground hover:text-foreground transition-all">
                  <Download className="size-3" />Export CSV
                </button>
              </div>

              {withdrawals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No withdrawals found.</p>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/40 text-muted-foreground uppercase">
                        <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Amount</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                        <th className="text-left px-3 py-2.5 font-semibold hidden sm:table-cell">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map(w => (
                        <tr key={w.id} className="border-b border-border/20 hover:bg-surface/30 last:border-0">
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                            {new Date(w.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-loss">−{fmt(w.amount_cents)}</td>
                          <td className="px-3 py-2.5">
                            <Badge className={`text-[10px] border-0 capitalize ${STATUS_BADGE[w.status] ?? ""}`}>{w.status}</Badge>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-muted-foreground hidden sm:table-cell truncate max-w-[100px]">
                            {w.provider_ref ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-4 py-2 font-bold text-muted-foreground">{withdrawals.length} records</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-loss">
                          −{fmt(withdrawals.reduce((s, w) => s + w.amount_cents, 0))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── BETS ─────────────────────────────────────────────────────────── */}
          {tab === "bets" && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total staked",   value: fmt(totalStaked),   color: "text-primary" },
                  { label: "Total payouts",  value: fmt(totalWon),      color: "text-warning"  },
                  { label: "Win rate",       value: `${winRate}%`,       color: "text-profit"  },
                  { label: "House take",     value: `${houseTake >= 0 ? "+" : "−"}${fmt(houseTake)}`, color: houseTake >= 0 ? "text-profit" : "text-loss" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl border border-border/50 bg-surface/40 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className={`text-sm font-bold font-mono mt-0.5 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {bets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No bets found.</p>
              ) : (
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-surface/40 text-muted-foreground uppercase">
                        <th className="text-left px-4 py-2.5 font-semibold">Date</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Stake</th>
                        <th className="text-left px-3 py-2.5 font-semibold">Result</th>
                        <th className="text-right px-3 py-2.5 font-semibold">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bets.map(b => (
                        <tr key={b.id} className="border-b border-border/20 hover:bg-surface/30 last:border-0">
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                            {new Date(b.created_at).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">{fmt(b.bet_amount_cents)}</td>
                          <td className="px-3 py-2.5">
                            <Badge className={`text-[10px] border-0 font-bold ${b.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
                              {b.outcome === "win" ? "WIN" : "LOSS"}
                            </Badge>
                          </td>
                          <td className={`px-3 py-2.5 text-right font-mono font-semibold ${b.outcome === "win" ? "text-profit" : "text-muted-foreground"}`}>
                            {b.outcome === "win" ? fmt(b.gross_return_cents) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border/40 bg-surface/50">
                        <td className="px-4 py-2 font-bold text-muted-foreground">{bets.length} bets</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{fmt(totalStaked)}</td>
                        <td />
                        <td className="px-3 py-2 text-right font-mono font-bold text-warning">{fmt(totalWon)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users,    setUsers]    = useState<UserRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [acting,   setActing]   = useState<string | null>(null);
  const [roleMenu, setRoleMenu] = useState<string | null>(null);

  // Detail drawer state
  const [detail,        setDetail]        = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Load users list ────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: allRoles }, { data: wallets }] = await Promise.all([
      supabase.from("profiles")
        .select("id, full_name, phone, country, created_at")
        .order("created_at", { ascending: false }).limit(300),
      (supabase.rpc as any)("admin_get_all_roles"),
      supabase.from("wallets").select("user_id, balance_cents").eq("wallet_type", "main"),
    ]);

    const roleMap: Record<string, string[]> = {};
    for (const r of (allRoles ?? [])) {
      const uid = (r as any).user_id; const role = (r as any).role;
      if (!roleMap[uid]) roleMap[uid] = [];
      if (!roleMap[uid].includes(role)) roleMap[uid].push(role);
    }
    const balMap: Record<string, number> = {};
    for (const w of (wallets ?? [])) balMap[(w as any).user_id] = (w as any).balance_cents;

    setUsers((profiles ?? []).map((p: any) => ({
      id: p.id, full_name: p.full_name, phone: p.phone, country: p.country,
      created_at: p.created_at, roles: roleMap[p.id] ?? [], balance: balMap[p.id] ?? 0,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Close role menu on outside click
  useEffect(() => {
    if (!roleMenu) return;
    const h = () => setRoleMenu(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [roleMenu]);

  // ── Open detail drawer ─────────────────────────────────────────────────────
  const openDetail = async (user: UserRow) => {
    setDetail({ user, deposits: [], withdrawals: [], bets: [] });
    setDetailLoading(true);
    const [{ data: deps }, { data: wds }, { data: bs }] = await Promise.all([
      supabase.from("deposits")
        .select("id, amount_cents, currency, status, phone, provider_ref, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      supabase.from("withdrawals")
        .select("id, amount_cents, currency, status, phone, provider_ref, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
      (supabase.from("candle_bets") as any)
        .select("id, bet_amount_cents, outcome, gross_return_cents, net_profit_cents, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
    ]);
    setDetail({
      user,
      deposits:    (deps ?? []) as DepRow[],
      withdrawals: (wds  ?? []) as WdRow[],
      bets:        (bs   ?? []) as BetRow[],
    });
    setDetailLoading(false);
  };

  // ── Assign role ────────────────────────────────────────────────────────────
  const assignRole = async (userId: string, newRole: Role) => {
    setActing(userId); setRoleMenu(null);
    try {
      const { error } = await (supabase.rpc as any)("admin_set_user_role", { _user_id: userId, _new_role: newRole });
      if (error) throw new Error(error.message);
      toast.success(`Role updated to ${ROLE_LABEL[newRole]}`);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update role");
    } finally { setActing(null); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  const stats = {
    total:     users.length,
    admins:    users.filter(u => u.roles.includes("admin")).length,
    marketers: users.filter(u => u.roles.includes("marketer")).length,
    support:   users.filter(u => u.roles.includes("support")).length,
  };

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total} total · {stats.admins} admin{stats.admins !== 1 ? "s" : ""} · {stats.marketers} marketer{stats.marketers !== 1 ? "s" : ""} · {stats.support} support
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input placeholder="Search by name, phone or ID…" className="pl-9 h-9"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Contact</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Balance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const pRole  = primaryRole(u.roles);
                  const isOpen = roleMenu === u.id;
                  return (
                    <tr key={u.id} className="border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0">
                      {/* Avatar + name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                            {(u.full_name ?? "?").slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[140px]">{u.full_name ?? "—"}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 14)}…</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-xs">{u.phone ?? "—"}</p>
                        <p className="text-[10px] text-muted-foreground">{u.country ?? "—"}</p>
                      </td>
                      {/* Balance */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono text-sm font-semibold">{fmt(u.balance)}</span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(u.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={`text-[10px] capitalize ${ROLE_BADGE[pRole] ?? ""}`}>
                          {ROLE_LABEL[pRole] ?? pRole}
                        </Badge>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* View details */}
                          <button onClick={() => openDetail(u)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 hover:bg-surface text-xs font-medium transition-all">
                            <Eye className="size-3 text-muted-foreground" />View
                          </button>

                          {/* Assign role dropdown */}
                          <div className="relative">
                            <button disabled={acting === u.id}
                              onClick={e => { e.stopPropagation(); setRoleMenu(isOpen ? null : u.id); }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 hover:bg-surface text-xs font-medium transition-all disabled:opacity-50">
                              {acting === u.id
                                ? <RefreshCw className="size-3 animate-spin" />
                                : <><UserCheck className="size-3 text-muted-foreground" />Role<ChevronDown className={`size-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} /></>}
                            </button>
                            {isOpen && (
                              <div onClick={e => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-border/60 bg-popover shadow-elevated overflow-hidden">
                                {ALL_ROLES.map(role => (
                                  <button key={role} onClick={() => assignRole(u.id, role)}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-surface/80 transition-colors text-left ${pRole === role ? "font-semibold" : ""}`}>
                                    {role === "admin"    && <Shield className="size-3.5 text-primary" />}
                                    {role === "marketer" && <UserCheck className="size-3.5 text-warning" />}
                                    {role === "support"  && <UserCheck className="size-3.5 text-profit" />}
                                    {role === "user"     && <User className="size-3.5 text-muted-foreground" />}
                                    <span>{ROLE_LABEL[role]}</span>
                                    {pRole === role && <span className="ml-auto text-[10px] text-muted-foreground">current</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

    {/* Detail drawer — loading skeleton overlay */}
    {detailLoading && detail && (
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
    )}
    {detailLoading && detail && (
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-background border-l border-border/60 flex flex-col shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )}

    {/* Detail drawer — loaded */}
    {!detailLoading && detail && (
      <UserDetailDrawer detail={detail} onClose={() => setDetail(null)} />
    )}
    </>
  );
}
