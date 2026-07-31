import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight, Info, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals · Admin" }] }),
  component: AdminWithdrawals,
});

const ANON_KEY   = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;
const SASAPAY_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sasapay-proxy`;
const PAGE_SIZE  = 50;

type WithdrawalRow = {
  id: string; user_id: string; wallet_id: string;
  amount_cents: number; currency: string; method: string;
  status: string; phone: string | null; created_at: string;
  provider_ref: string | null; is_marketer?: boolean;
};

const STATUS_COLOR: Record<string, string> = {
  completed:  "bg-profit/15 text-profit border-profit/25",
  pending:    "bg-warning/15 text-warning border-warning/25",
  processing: "bg-primary/15 text-primary border-primary/25",
  failed:     "bg-loss/15 text-loss border-loss/25",
  cancelled:  "bg-muted/30 text-muted-foreground border-border/40",
};
const FILTERS = ["all", "pending", "processing", "completed", "cancelled", "failed"];
const fmtDate = (s: string) => new Date(s).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtKes  = (cents: number, cur = "KES") => `${cur} ${(cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

type AccountTab = "all" | "real" | "demo";

function AdminWithdrawals() {
  const [rows,        setRows]        = useState<WithdrawalRow[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [accountTab,  setAccountTab]  = useState<AccountTab>("all");
  const [page,        setPage]        = useState(0);
  const [processing,  setProcessing]  = useState<string | null>(null);
  const [marketerIds, setMarketerIds] = useState<Set<string>>(new Set());
  const processingRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.from("user_roles").select("user_id").eq("role", "marketer").then(({ data }) => {
      if (data) setMarketerIds(new Set(data.map((r: any) => r.user_id)));
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("withdrawals")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (filter !== "all") q = q.eq("status", filter);
    if (accountTab === "demo" && marketerIds.size > 0) q = q.in("user_id", [...marketerIds]);
    else if (accountTab === "real" && marketerIds.size > 0) q = q.not("user_id", "in", `(${[...marketerIds].join(",")})`);

    const { data, count } = await q;
    const enriched = (data ?? []).map((w: any) => ({ ...w, is_marketer: marketerIds.has(w.user_id) }));
    setRows(enriched as WithdrawalRow[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [filter, page, accountTab, marketerIds]);

  useEffect(() => { setPage(0); }, [filter, accountTab]);
  useEffect(() => { load(); }, [load]);

  const totalPages  = Math.ceil(total / PAGE_SIZE);
  const pendingCount = rows.filter(r => r.status === "pending").length;

  // ── Approve & dispatch B2C ──────────────────────────────────────────────────
  const approve = async (w: WithdrawalRow) => {
    if (processingRef.current) return;
    processingRef.current = w.id; setProcessing(w.id);
    try {
      const claimRes = await (supabase.from("withdrawals") as any)
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", w.id).eq("status", "pending").select("id").single();
      if (claimRes.error || !claimRes.data) {
        const { data: cur } = await (supabase.from("withdrawals") as any).select("status").eq("id", w.id).single();
        toast.error(`Cannot approve — already ${(cur as any)?.status ?? "processing"}`);
        return;
      }
      if (!w.phone) {
        await Promise.all([
          (supabase.from("withdrawals") as any).update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", w.id),
          (supabase.from("transactions") as any).insert({ user_id: w.user_id, wallet_id: w.wallet_id, type: "withdrawal", amount_cents: -w.amount_cents, currency: w.currency, description: "Withdrawal approved (manual — no phone on file)" }),
          (supabase.from("notifications") as any).insert({ user_id: w.user_id, title: "Withdrawal approved", body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal has been approved.`, type: "info", is_read: false }),
        ]);
        toast.success("Approved manually (no phone on file)");
        load(); return;
      }
      const merchantTransRef = `SD-WD-${w.id.slice(0, 8)}-${Date.now()}`;
      await (supabase.from("withdrawals") as any).update({ provider_ref: merchantTransRef }).eq("id", w.id);
      try {
        const res  = await fetch(`${SASAPAY_FN}?action=b2c`, { method: "POST", headers: { "Content-Type": "application/json", "apikey": ANON_KEY }, body: JSON.stringify({ phone: w.phone, amount: Math.round(w.amount_cents / 100), reason: `DerivGrid withdrawal ${w.id.slice(0, 8)}`, merchantTransRef }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.ResponseCode === "0" || data.status === true)) {
          toast.success("B2C dispatched via SasaPay — awaiting confirmation", { duration: 6000 });
        } else {
          const msg = data?.detail ?? data?.ResponseDescription ?? data?.error ?? `HTTP ${res.status}`;
          await refundWithdrawal(w, `B2C rejected: ${msg}`);
          toast.error(`B2C failed: ${msg}. Funds refunded.`, { duration: 8000 });
        }
      } catch { await refundWithdrawal(w, "Network error reaching SasaPay"); toast.error("Could not reach SasaPay. Funds refunded."); }
      load();
    } catch (e: any) { toast.error(e?.message ?? "Approval failed"); }
    finally { processingRef.current = null; setProcessing(null); }
  };

  const reject = async (w: WithdrawalRow) => {
    if (processingRef.current) return;
    processingRef.current = w.id; setProcessing(w.id);
    try {
      const { data: fresh } = await (supabase.from("withdrawals") as any).select("status").eq("id", w.id).single();
      if ((fresh as any)?.status !== "pending") { toast.error(`Cannot reject — already ${(fresh as any)?.status}`); return; }
      const { data: wd } = await supabase.from("wallets").select("balance_cents").eq("id", w.wallet_id).single();
      if (!wd) throw new Error("Wallet not found");
      await Promise.all([
        (supabase.from("wallets") as any).update({ balance_cents: (wd as any).balance_cents + w.amount_cents, updated_at: new Date().toISOString() }).eq("id", w.wallet_id),
        (supabase.from("transactions") as any).insert({ user_id: w.user_id, wallet_id: w.wallet_id, type: "transfer_in", amount_cents: w.amount_cents, currency: w.currency, description: `Withdrawal rejected — ${fmtKes(w.amount_cents, w.currency)} refunded` }),
        (supabase.from("withdrawals") as any).update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", w.id).eq("status", "pending"),
        (supabase.from("notifications") as any).insert({ user_id: w.user_id, title: "Withdrawal rejected", body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal was rejected. Funds returned.`, type: "info", is_read: false }),
      ]);
      toast.info("Rejected — funds refunded"); load();
    } catch (e: any) { toast.error(e?.message ?? "Rejection failed"); }
    finally { processingRef.current = null; setProcessing(null); }
  };

  const refundWithdrawal = async (w: WithdrawalRow, reason: string) => {
    const { data: wd } = await supabase.from("wallets").select("balance_cents").eq("id", w.wallet_id).single();
    const bal = (wd as any)?.balance_cents ?? 0;
    await Promise.all([
      (supabase.from("wallets") as any).update({ balance_cents: bal + w.amount_cents, updated_at: new Date().toISOString() }).eq("id", w.wallet_id),
      (supabase.from("withdrawals") as any).update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", w.id),
      (supabase.from("transactions") as any).insert({ user_id: w.user_id, wallet_id: w.wallet_id, type: "transfer_in", amount_cents: w.amount_cents, currency: w.currency, description: `Withdrawal cancelled — funds refunded (${reason})` }),
      (supabase.from("notifications") as any).insert({ user_id: w.user_id, title: "Withdrawal cancelled", body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal could not be processed. Funds returned.`, type: "info", is_read: false }),
    ]);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Withdrawals</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} records · <span className="text-warning font-medium">{pendingCount} pending</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 shrink-0">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Account type tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "all",  label: "All Accounts",   icon: Users },
          { key: "real", label: "Real Traders",    icon: TrendingUp },
          { key: "demo", label: "Demo (Marketer)", icon: null },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setAccountTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              accountTab === key
                ? key === "demo" ? "bg-warning/20 border-warning/40 text-warning" : "bg-primary/15 border-primary/30 text-primary"
                : "bg-surface border-border/60 text-muted-foreground hover:text-foreground"
            }`}>
            {Icon && <Icon className="size-3" />}
            {label}
            {key === "demo" && <span className="ml-1 px-1 py-0.5 rounded bg-warning/20 text-warning text-[9px] font-bold">DEMO</span>}
          </button>
        ))}
      </div>

      {accountTab === "demo" && (
        <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 flex items-start gap-2 text-xs text-warning">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <span><strong>Demo mode withdrawals</strong> — these are simulated from marketer accounts. No real funds disbursed.</span>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"
            }`}>
            {s}
            {s === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-warning text-black text-[9px] font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center text-sm text-muted-foreground">No withdrawals found.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                  <th className="text-left px-4 py-3 font-semibold">Account</th>
                  <th className="text-left px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(w => (
                  <tr key={w.id} className={`border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0 ${w.is_marketer ? "bg-warning/3" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-muted-foreground">{w.user_id.slice(0, 10)}…</span>
                        {w.is_marketer && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/20 text-warning border border-warning/30">DEMO</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-loss">−{fmtKes(w.amount_cents, w.currency)}</td>
                    <td className="px-4 py-3 text-xs">{w.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLOR[w.status] ?? ""}`}>{w.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(w.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {w.status === "pending" && !w.is_marketer && (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" disabled={processing === w.id} onClick={() => approve(w)} className="h-7 text-profit hover:bg-profit/10 gap-1 text-xs">
                            {processing === w.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}Approve & Send
                          </Button>
                          <Button size="sm" variant="ghost" disabled={!!processing} onClick={() => reject(w)} className="h-7 text-loss hover:bg-loss/10 gap-1 text-xs">
                            <XCircle className="size-3" />Reject
                          </Button>
                        </div>
                      )}
                      {w.status === "pending" && w.is_marketer && <span className="text-[10px] text-warning">demo — auto</span>}
                      {w.status === "processing" && (
                        <span className="text-xs text-primary flex items-center gap-1 justify-end">
                          <Loader2 className="size-3 animate-spin" />Awaiting SasaPay…
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {rows.map(w => (
              <div key={w.id} className={`rounded-xl border bg-gradient-surface p-4 space-y-3 shadow-card ${w.is_marketer ? "border-warning/30" : "border-border/50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-mono font-bold text-base text-loss">−{fmtKes(w.amount_cents, w.currency)}</p>
                      {w.is_marketer && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-warning/20 text-warning border border-warning/30">DEMO</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{w.phone ?? "—"}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_COLOR[w.status] ?? ""}`}>{w.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono">{w.user_id.slice(0, 14)}…</span>
                  <span>{fmtDate(w.created_at)}</span>
                </div>
                {w.status === "pending" && !w.is_marketer && (
                  <div className="flex gap-2 pt-1 border-t border-border/30">
                    <Button size="sm" variant="outline" disabled={processing === w.id} onClick={() => approve(w)} className="flex-1 h-8 text-xs gap-1.5 text-profit border-profit/30 hover:bg-profit/10">
                      {processing === w.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}Approve & Send
                    </Button>
                    <Button size="sm" variant="outline" disabled={!!processing} onClick={() => reject(w)} className="flex-1 h-8 text-xs gap-1.5 text-loss border-loss/30 hover:bg-loss/10">
                      <XCircle className="size-3" />Reject
                    </Button>
                  </div>
                )}
                {w.status === "processing" && (
                  <p className="text-xs text-primary flex items-center gap-1.5 pt-1 border-t border-border/30">
                    <Loader2 className="size-3 animate-spin" />B2C dispatched — awaiting SasaPay confirmation
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages} · {total.toLocaleString()} records</p>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-8 w-8 p-0">
                  <ChevronLeft className="size-4" />
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pg = page < 3 ? i : page - 2 + i;
                  if (pg >= totalPages) return null;
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      className={`h-8 min-w-[2rem] px-2 rounded-lg text-xs font-medium border transition-colors ${pg === page ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}>
                      {pg + 1}
                    </button>
                  );
                })}
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-8 w-8 p-0">
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
