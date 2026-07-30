import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Shield, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, TrendingDown, Repeat2, AlertCircle, Filter,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Audit Log · Admin" }] }),
  component: AdminAudit,
});

type AuditEntry = {
  id: string;
  event: string;
  category: "deposit" | "withdrawal" | "bet" | "transaction";
  user_id: string;
  amount: string;
  status: string;
  ts: string;
  meta?: string;
};

const EVENT_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  "deposit:completed":   { label: "Deposit confirmed",    icon: ArrowDownToLine, color: "text-profit",           bg: "bg-profit/15"   },
  "deposit:pending":     { label: "Deposit pending",      icon: ArrowDownToLine, color: "text-warning",          bg: "bg-warning/15"  },
  "deposit:failed":      { label: "Deposit failed",       icon: ArrowDownToLine, color: "text-loss",             bg: "bg-loss/15"     },
  "withdrawal:completed":{ label: "Withdrawal sent",      icon: ArrowUpFromLine, color: "text-loss",             bg: "bg-loss/15"     },
  "withdrawal:pending":  { label: "Withdrawal pending",   icon: ArrowUpFromLine, color: "text-warning",          bg: "bg-warning/15"  },
  "withdrawal:cancelled":{ label: "Withdrawal cancelled", icon: ArrowUpFromLine, color: "text-muted-foreground", bg: "bg-muted/20"    },
  "bet:win":             { label: "Bet — User won",       icon: TrendingUp,      color: "text-profit",           bg: "bg-profit/15"   },
  "bet:loss":            { label: "Bet — User lost",      icon: TrendingDown,    color: "text-loss",             bg: "bg-loss/15"     },
  "txn:deposit":         { label: "Transaction: deposit", icon: ArrowDownToLine, color: "text-profit",           bg: "bg-profit/10"   },
  "txn:withdrawal":      { label: "Transaction: withdrawal", icon: ArrowUpFromLine, color: "text-loss",          bg: "bg-loss/10"     },
  "txn:transfer_in":     { label: "Transaction: transfer in",  icon: Repeat2,    color: "text-primary",          bg: "bg-primary/10"  },
  "txn:transfer_out":    { label: "Transaction: transfer out", icon: Repeat2,    color: "text-muted-foreground", bg: "bg-muted/20"    },
};

const DEFAULT_ICON = { label: "Event", icon: Shield, color: "text-muted-foreground", bg: "bg-muted/20" };

const FILTERS = ["all", "deposit", "withdrawal", "bet", "transaction"] as const;
type FilterType = typeof FILTERS[number];

function AdminAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const load = async () => {
    setLoading(true);

    const [{ data: txs }, { data: deps }, { data: wds }, { data: bets }] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, user_id, type, amount_cents, currency, created_at")
        .order("created_at", { ascending: false })
        .limit(60),
      supabase
        .from("deposits")
        .select("id, user_id, amount_cents, currency, status, created_at, phone")
        .order("created_at", { ascending: false })
        .limit(40),
      supabase
        .from("withdrawals")
        .select("id, user_id, amount_cents, currency, status, created_at, phone")
        .order("created_at", { ascending: false })
        .limit(40),
      (supabase.from("candle_bets") as any)
        .select("id, user_id, bet_amount_cents, outcome, created_at")
        .order("created_at", { ascending: false })
        .limit(60),
    ]);

    const all: AuditEntry[] = [
      ...(txs ?? []).map((t: any) => ({
        id:       `txn-${t.id}`,
        event:    `txn:${t.type}`,
        category: "transaction" as const,
        user_id:  t.user_id,
        amount:   `KES ${(Math.abs(t.amount_cents) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
        status:   "completed",
        ts:       t.created_at,
      })),
      ...(deps ?? []).map((d: any) => ({
        id:       `dep-${d.id}`,
        event:    `deposit:${d.status}`,
        category: "deposit" as const,
        user_id:  d.user_id,
        amount:   `KES ${(d.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
        status:   d.status,
        ts:       d.created_at,
        meta:     d.phone ?? undefined,
      })),
      ...(wds ?? []).map((w: any) => ({
        id:       `wd-${w.id}`,
        event:    `withdrawal:${w.status}`,
        category: "withdrawal" as const,
        user_id:  w.user_id,
        amount:   `KES ${(w.amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
        status:   w.status,
        ts:       w.created_at,
        meta:     w.phone ?? undefined,
      })),
      ...(bets ?? []).map((b: any) => ({
        id:       `bet-${b.id}`,
        event:    `bet:${b.outcome}`,
        category: "bet" as const,
        user_id:  b.user_id,
        amount:   `KES ${(b.bet_amount_cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
        status:   b.outcome,
        ts:       b.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 200);

    setEntries(all);
    setLoading(false);
    setHasFetched(true);
  };

  // No auto-load on mount — admin fetches manually when needed

  const visible = filter === "all" ? entries : entries.filter(e => e.category === filter);

  const counts: Record<FilterType, number> = {
    all:         entries.length,
    deposit:     entries.filter(e => e.category === "deposit").length,
    withdrawal:  entries.filter(e => e.category === "withdrawal").length,
    bet:         entries.filter(e => e.category === "bet").length,
    transaction: entries.filter(e => e.category === "transaction").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All financial events across the platform in chronological order.
          </p>
        </div>
        <Button onClick={load} disabled={loading} className="bg-gradient-primary shadow-glow hover:opacity-95 gap-2">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {hasFetched ? "Refresh" : "Load records"}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <Filter className="size-4 text-muted-foreground self-center shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All events" : f}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-border/60"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : !hasFetched ? (
          <div className="py-20 text-center">
            <Shield className="size-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Audit log not loaded</p>
            <p className="text-xs text-muted-foreground mt-1 mb-5">Click "Load records" to fetch platform events on demand.</p>
            <Button onClick={load} className="bg-gradient-primary shadow-glow hover:opacity-95 gap-2">
              <RefreshCw className="size-4" />Load records
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <AlertCircle className="size-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No events found for this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/25">
            {visible.map((e) => {
              const meta = EVENT_META[e.event] ?? DEFAULT_ICON;
              const Icon = meta.icon;
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface/40 transition-colors"
                >
                  {/* Icon */}
                  <span className={`size-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`size-3.5 ${meta.color}`} />
                  </span>

                  {/* Event + user */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      {e.meta && (
                        <span className="text-[10px] text-muted-foreground font-mono">{e.meta}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {e.user_id.slice(0, 12)}…
                    </p>
                  </div>

                  {/* Amount */}
                  <span className={`font-mono text-sm font-semibold shrink-0 ${meta.color}`}>
                    {e.amount}
                  </span>

                  {/* Timestamp */}
                  <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block tabular-nums">
                    {new Date(e.ts).toLocaleString("en-KE", {
                      day: "2-digit", month: "short",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
