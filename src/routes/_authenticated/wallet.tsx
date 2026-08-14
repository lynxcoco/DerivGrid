import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowDownToLine, ArrowUpFromLine, Wallet,
  RefreshCw, ChevronDown, TrendingUp, TrendingDown, CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CampaignBanner } from "@/components/campaign-banner";
import { ReferralBanner } from "@/components/referral-banner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet · DerivGrid" }] }),
  component: WalletPage,
});

type WalletRow  = { id: string; wallet_type: "main"|"trading"; balance_cents: number; currency: string };
type TxRow      = { id: string; type: string; amount_cents: number; currency: string; description: string|null; created_at: string };

function fmt(cents: number, currency = "KES") {
  const abs = Math.abs(cents / 100);
  return currency === "KES"
    ? `KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`
    : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/** Mask middle 3 digits of a phone number in a string */
function maskPhoneInText(text: string): string {
  return text.replace(/2547\d{8}/g, (match) => {
    const chars = match.split("");
    for (let i = 4; i < 7; i++) chars[i] = "*";
    return chars.join("");
  });
}

/** Strip a trailing multiplier like "— 3.18x" and capitalize "win"/"loss" */
function stripMultiplier(text: string): string {
  return text
    .replace(/\s*[—-]\s*[\d.]+x\b/gi, "")
    .replace(/\bwin\b/gi, "Win")
    .replace(/\bloss\b/gi, "Loss");
}

const TX_LABEL: Record<string,string> = {
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
function TxIcon({ type }: { type: string }) {
  if (["deposit","transfer_in","trade_profit"].includes(type)) return <TrendingUp className="size-3.5" />;
  if (["withdrawal","transfer_out","trade_loss"].includes(type)) return <TrendingDown className="size-3.5" />;
  return <CircleDot className="size-3.5" />;
}

const PAGE = 15;

function WalletPage() {
  const pathname   = useRouterState({ select: s => s.location.pathname });
  const isSubRoute = pathname !== "/wallet";

  const [wallets,      setWallets]      = useState<WalletRow[]>([]);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [txLoading,    setTxLoading]    = useState(false);
  const [page,         setPage]         = useState(0);
  const [hasMore,      setHasMore]      = useState(true);

  const loadWallets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user.id);
    if (error) { toast.error("Could not load wallet"); return; }
    setWallets(data as WalletRow[]);
  };

  const loadTx = async (reset = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setTxLoading(true);
    const pg = reset ? 0 : page;
    const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).range(pg * PAGE, pg * PAGE + PAGE - 1);
    if (data) {
      if (reset) { setTransactions(data as TxRow[]); setPage(1); }
      else { setTransactions(p => [...p, ...(data as TxRow[])]); setPage(pg + 1); }
      setHasMore(data.length === PAGE);
    }
    setTxLoading(false);
  };

  useEffect(() => {
    (async () => { setLoading(true); await Promise.all([loadWallets(), loadTx(true)]); setLoading(false); })();
  }, []);

  const main = wallets.find(w => w.wallet_type === "main");
  if (isSubRoute) return <Outlet />;

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-2xl lg:max-w-4xl mx-auto space-y-4 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Wallet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Balance and transactions.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { loadWallets(); loadTx(true); }} disabled={loading} className="shrink-0">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Campaign Banners */}
      <CampaignBanner />
      <ReferralBanner />

      {/* Balance card */}
      <div className="relative rounded-2xl border border-primary/30 bg-gradient-surface shadow-glow overflow-hidden p-5">
        <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Available balance</p>
            {loading
              ? <Skeleton className="mt-2 h-8 w-36 rounded-lg" />
              : <p className="mt-1.5 text-2xl sm:text-3xl font-bold font-mono leading-none">
                  {fmt(main?.balance_cents ?? 0)}
                </p>
            }
            <p className="mt-1 text-[10px] text-muted-foreground">Kenyan Shillings</p>
          </div>
          <span className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Wallet className="size-5" />
          </span>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <Link to="/wallet/deposit"
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <ArrowDownToLine className="size-4 shrink-0" />Deposit
          </Link>
          <Link to="/wallet/withdraw"
            className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border/60 bg-surface text-foreground text-sm font-semibold hover:bg-surface/80 transition-colors">
            <ArrowUpFromLine className="size-4 shrink-0" />Withdraw
          </Link>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Transactions</h2>
          {!loading && <span className="text-xs text-muted-foreground">{transactions.length} records</span>}
        </div>

        {loading ? (
          <div className="p-3 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="py-14 text-center px-4">
            <Wallet className="size-9 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Make your first deposit to get started.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/30">
              {transactions.map(tx => {
                const isCredit = tx.amount_cents >= 0;
                return (
                  <div key={tx.id} className="px-4 py-3 hover:bg-surface/40 transition-colors">
                    {/* Top row: icon + label + amount */}
                    <div className="flex items-center gap-3">
                      <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${TX_BG[tx.type] ?? "bg-muted/20"} ${TX_COLOR[tx.type] ?? "text-muted-foreground"}`}>
                        <TxIcon type={tx.type} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{TX_LABEL[tx.type] ?? tx.type}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      {/* Amount — right-aligned, never truncates */}
                      <p className={`text-sm font-bold font-mono shrink-0 ${TX_COLOR[tx.type] ?? ""}`}>
                        {isCredit ? "+" : "−"}{fmt(tx.amount_cents, tx.currency)}
                      </p>
                    </div>
                    {/* Description below if present */}
                    {tx.description && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 ml-11 leading-snug line-clamp-2">
                        {stripMultiplier(maskPhoneInText(tx.description))}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <div className="px-4 py-3 border-t border-border/40">
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5" disabled={txLoading} onClick={() => loadTx(false)}>
                  {txLoading ? <RefreshCw className="size-3.5 animate-spin" /> : <><ChevronDown className="size-3.5" />Load more</>}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}