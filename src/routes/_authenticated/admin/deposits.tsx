import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/deposits")({
  head: () => ({ meta: [{ title: "Deposits · Admin" }] }),
  component: AdminDeposits,
});

type DepositRow = {
  id: string; user_id: string; amount_cents: number; currency: string;
  method: string; status: string; phone: string | null;
  provider_ref: string | null; created_at: string; wallet_id: string;
};

const STATUS_STYLES: Record<string, string> = {
  completed:  "bg-profit/15 text-profit border-profit/25",
  pending:    "bg-warning/15 text-warning border-warning/25",
  failed:     "bg-loss/15 text-loss border-loss/25",
  processing: "bg-primary/15 text-primary border-primary/25",
  cancelled:  "bg-muted/30 text-muted-foreground border-border/40",
};
const FILTERS = ["all", "pending", "processing", "completed", "failed"];
const fmtKes = (c: number, cur = "KES") =>
  `${cur} ${(c / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-KE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function AdminDeposits() {
  const [rows,    setRows]    = useState<DepositRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [acting,  setActing]  = useState<string | null>(null);
  const { settings } = usePlatformSettings({ fresh: true });
  const autoApprove = settings.auto_approve_deposits ?? true;

  const load = async () => {
    setLoading(true);
    let q = supabase.from("deposits").select("*").order("created_at", { ascending: false }).limit(300);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows((data as DepositRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const approve = async (d: DepositRow) => {
    if (acting) return;
    setActing(d.id);
    try {
      const claim = await (supabase.from("deposits") as any)
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", d.id).eq("status", "pending").select("wallet_id").single();
      if (claim.error || !claim.data) { toast.error("Already processed"); load(); return; }
      const { data: w } = await supabase.from("wallets").select("balance_cents").eq("id", claim.data.wallet_id).single();
      await Promise.all([
        supabase.from("wallets").update({ balance_cents: (w as any).balance_cents + d.amount_cents, updated_at: new Date().toISOString() }).eq("id", claim.data.wallet_id),
        (supabase.from("transactions") as any).insert({ user_id: d.user_id, wallet_id: claim.data.wallet_id, type: "deposit", amount_cents: d.amount_cents, currency: d.currency, description: "Admin-approved deposit" }),
        (supabase.from("notifications") as any).insert({ user_id: d.user_id, title: "Deposit approved ✓", body: `${fmtKes(d.amount_cents, d.currency)} has been credited to your wallet.`, type: "deposit", is_read: false }),
      ]);
      toast.success("Deposit approved");
      load();
    } catch { toast.error("Failed to approve"); }
    setActing(null);
  };

  const reject = async (id: string) => {
    if (acting) return;
    setActing(id);
    await (supabase.from("deposits") as any).update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", id);
    toast.info("Deposit rejected");
    load();
    setActing(null);
  };

  const pending          = rows.filter(r => r.status === "pending").length;
  const totalCompleted   = rows.filter(r => r.status === "completed").reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Deposits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {rows.length} records
            {filter === "all" && totalCompleted > 0 && (
              <> · <span className="text-profit font-medium">{fmtKes(totalCompleted)}</span></>
            )}
            {pending > 0 && <> · <span className="text-warning font-semibold">{pending} pending</span></>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 shrink-0">
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Auto-approve mode banner */}
      {autoApprove ? (
        <div className="rounded-xl border border-profit/30 bg-profit/8 px-4 py-2.5 flex items-center gap-2 text-xs text-profit">
          <Info className="size-3.5 shrink-0" />
          <span><strong>Auto-approve is ON</strong> — M-Pesa deposits are credited instantly via the SasaPay callback. No manual action needed.</span>
        </div>
      ) : (
        <div className="rounded-xl border border-warning/30 bg-warning/8 px-4 py-2.5 flex items-center gap-2 text-xs text-warning">
          <Info className="size-3.5 shrink-0" />
          <span><strong>Manual approval required</strong> — deposits stay pending until you approve. Change this in Platform Settings.</span>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"
            }`}>
            {f}
            {f === "pending" && pending > 0 && (
              <span className="ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-warning text-black text-[9px] font-bold">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center text-sm text-muted-foreground">
          No deposits found.
        </div>
      ) : (
        <>
          {/* ── Desktop table (md+) ── */}
          <div className="hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                  <th className="text-left px-5 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold">Reference</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => (
                  <tr key={d.id} className="border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0">
                    <td className="px-5 py-3.5 font-mono font-semibold text-sm">{fmtKes(d.amount_cents, d.currency)}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium">{d.phone ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{d.user_id.slice(0, 12)}…</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-muted-foreground max-w-[140px] truncate">
                      {d.provider_ref ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_STYLES[d.status] ?? ""}`}>{d.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(d.created_at)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {d.status === "pending" && !autoApprove && (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" disabled={acting === d.id} onClick={() => approve(d)}
                            className="h-7 text-xs gap-1 text-profit hover:bg-profit/10">
                            {acting === d.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" disabled={!!acting} onClick={() => reject(d.id)}
                            className="h-7 text-xs gap-1 text-loss hover:bg-loss/10">
                            <XCircle className="size-3" />Reject
                          </Button>
                        </div>
                      )}
                      {d.status === "pending" && autoApprove && (
                        <span className="text-[10px] text-muted-foreground">auto-processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-2">
            {rows.map(d => (
              <div key={d.id} className="rounded-xl border border-border/50 bg-gradient-surface p-4 space-y-3 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-bold text-base">{fmtKes(d.amount_cents, d.currency)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.phone ?? "—"}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_STYLES[d.status] ?? ""}`}>{d.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="font-mono truncate max-w-[160px]">{d.provider_ref ?? "No reference"}</span>
                  <span className="shrink-0">{fmtDate(d.created_at)}</span>
                </div>
                {d.status === "pending" && !autoApprove && (
                  <div className="flex gap-2 pt-1 border-t border-border/30">
                    <Button size="sm" variant="outline" disabled={acting === d.id} onClick={() => approve(d)}
                      className="flex-1 h-8 text-xs gap-1.5 text-profit border-profit/30 hover:bg-profit/10">
                      {acting === d.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={!!acting} onClick={() => reject(d.id)}
                      className="flex-1 h-8 text-xs gap-1.5 text-loss border-loss/30 hover:bg-loss/10">
                      <XCircle className="size-3" />Reject
                    </Button>
                  </div>
                )}
                {d.status === "pending" && autoApprove && (
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    Auto-processing via SasaPay callback…
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
