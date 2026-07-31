import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ArrowLeft, Info, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw · DerivGrid" }] }),
  component: WithdrawPage,
});

/** Normalise phone to 254XXXXXXXXX format */
function normalisePhone(raw: string): string {
  const c = raw.trim().replace(/[\s\-()]/g, "");
  if (/^2547\d{8}$/.test(c))   return c;
  if (/^07\d{8}$/.test(c))     return "254" + c.slice(1);
  if (/^7\d{8}$/.test(c))      return "2547" + c.slice(1);
  if (/^\+2547\d{8}$/.test(c)) return c.slice(1);
  // Return digits only — validation below will reject invalid formats
  return c.replace(/\D/g, "");
}

/** Mask digits at positions 4-6 (the "middle three") with *** */
function maskMiddle(digits: string): string {
  const chars = digits.split("");
  for (let i = 4; i < Math.min(chars.length, 7); i++) {
    chars[i] = "*";
  }
  return chars.join("");
}

function applyMaskedEdit(oldDisplayed: string, oldRaw: string, newTyped: string): string {
  let start = 0;
  while (
    start < oldDisplayed.length &&
    start < newTyped.length &&
    oldDisplayed[start] === newTyped[start]
  ) start++;

  let oldEnd = oldDisplayed.length;
  let newEnd = newTyped.length;
  while (
    oldEnd > start &&
    newEnd > start &&
    oldDisplayed[oldEnd - 1] === newTyped[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  const insertedDigits = newTyped.slice(start, newEnd).replace(/\D/g, "");
  return (oldRaw.slice(0, start) + insertedDigits + oldRaw.slice(oldEnd)).slice(0, 12);
}

function WithdrawPage() {
  const { settings } = usePlatformSettings({ fresh: true });
  const MIN_KES = settings.min_withdrawal_kes;
  const MAX_KES = settings.max_withdrawal_kes;

  const [step,        setStep]        = useState<"form" | "success">("form");
  const [loading,     setLoading]     = useState(false);
  const [phone,       setPhone]       = useState("");
  const [amount,      setAmount]      = useState("");
  const [phoneErr,    setPhoneErr]    = useState("");
  const [amountErr,   setAmountErr]   = useState("");
  const [showPhone,   setShowPhone]   = useState(false);

  const displayedPhone = showPhone ? phone : maskMiddle(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneErr(""); setAmountErr("");

    const normPhone = normalisePhone(phone);
    const amt       = parseFloat(amount);
    let valid = true;

    if (!/^2547\d{8}$/.test(normPhone)) {
      setPhoneErr("Enter a valid M-Pesa number (07XX or +2547XX)");
      valid = false;
    }
    if (!amount || isNaN(amt) || amt < MIN_KES) {
      setAmountErr(`Minimum KES ${MIN_KES.toLocaleString()}`);
      valid = false;
    }
    if (amt > MAX_KES) {
      setAmountErr(`Maximum KES ${MAX_KES.toLocaleString()}`);
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again");

      // Check if marketer
      const { data: roleRows } = await (supabase.from("user_roles") as any)
        .select("role")
        .eq("user_id", user.id);
      const isMarketer = (roleRows ?? []).some((r: any) => r.role === "marketer");

      const amountCents = Math.round(amt * 100);

      // Get main wallet
      const walletRes = await (supabase.from("wallets") as any)
        .select("id, balance_cents")
        .eq("user_id", user.id)
        .eq("wallet_type", "main")
        .single();
      const wallet = walletRes.data as { id: string; balance_cents: number } | null;
      if (walletRes.error || !wallet) throw new Error("Wallet not found — please refresh and try again");
      if (wallet.balance_cents < amountCents) {
        throw new Error(`Insufficient balance. Available: KES ${(wallet.balance_cents / 100).toLocaleString()}`);
      }

      // Create withdrawal record — auto-completed for marketers
      const wdRes = await (supabase.from("withdrawals") as any).insert({
        user_id:      user.id,
        wallet_id:    wallet.id,
        amount_cents: amountCents,
        currency:     "KES",
        method:       "mpesa",
        status:       isMarketer ? "completed" : "pending",
        phone:        normPhone,
      }).select("id").single();
      if (wdRes.error || !wdRes.data) throw new Error("Failed to record withdrawal: " + (wdRes.error?.message ?? "unknown"));
      const withdrawalId = wdRes.data.id as string;

      // Deduct balance + record transaction + notify
      await Promise.all([
        (supabase.from("wallets") as any)
          .update({ balance_cents: wallet.balance_cents - amountCents, updated_at: new Date().toISOString() })
          .eq("id", wallet.id),

        (supabase.from("transactions") as any).insert({
          user_id:      user.id,
          wallet_id:    wallet.id,
          type:         "withdrawal",
          amount_cents: -amountCents,
          currency:     "KES",
          description:  `Withdrawal to ${normPhone} — ${isMarketer ? "Completed" : "Pending"}`,
          metadata:     { withdrawal_id: withdrawalId, simulated: isMarketer, mode: isMarketer ? "marketer" : "trader" },
        }),

        (supabase.from("notifications") as any).insert({
          user_id: user.id,
          title:   "Withdrawal submitted",
          body:    `KES ${amt.toLocaleString()} withdrawal to ${normPhone} has been submitted.`,
          type:    "info",
          is_read: false,
        }),
      ]);

      toast.success("Withdrawal request submitted successfully");
      setStep("success");
    } catch (e: any) {
      toast.error(e?.message ?? "Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4">
          <CheckCircle2 className="size-14 text-profit mx-auto" />
          <h2 className="text-2xl font-bold">Request submitted</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your withdrawal is being processed. Funds will be sent to your M-Pesa via SasaPay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="outline" asChild><Link to="/wallet">Back to Wallet</Link></Button>
            <Button className="bg-gradient-primary shadow-glow hover:opacity-95" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-0 size-9">
          <Link to="/wallet"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Withdraw funds</h1>
          <p className="text-sm text-muted-foreground">Send money to your M-Pesa account.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-surface/60 rounded-lg p-3 border border-border/40">
          <Info className="size-3.5 mt-0.5 shrink-0 text-primary" />
          <span>
            Withdrawals are automatically reviewed and dispatched directly to your
            M-Pesa number. Minimum KES {MIN_KES.toLocaleString()}.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wd-phone">M-Pesa number</Label>
            <div className="relative mt-1.5">
              <Input
                id="wd-phone"
                placeholder="0712 345 678"
                className="h-11 pr-10"
                inputMode="numeric"
                autoComplete="off"
                value={displayedPhone}
                onChange={e => {
                  const newRaw = showPhone
                    ? e.target.value.replace(/\D/g, "").slice(0, 12)
                    : applyMaskedEdit(displayedPhone, phone, e.target.value);
                  setPhone(newRaw);
                  setPhoneErr("");
                }}
              />
              <button
                type="button"
                onClick={() => setShowPhone(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPhone ? "Hide phone number" : "Show phone number"}
              >
                {showPhone ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {phoneErr && <p className="text-xs text-destructive mt-1">{phoneErr}</p>}
          </div>

          <div>
            <Label htmlFor="wd-amount">Amount (KES)</Label>
            <Input
              id="wd-amount"
              type="number"
              inputMode="numeric"
              min={MIN_KES}
              placeholder={String(MIN_KES)}
              className="mt-1.5 h-11"
              value={amount}
              onChange={e => { setAmount(e.target.value); setAmountErr(""); }}
            />
            {amountErr && <p className="text-xs text-destructive mt-1">{amountErr}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Min KES {MIN_KES.toLocaleString()} · Max KES {MAX_KES.toLocaleString()}
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95"
          >
            {loading
              ? <><Loader2 className="size-4 animate-spin mr-2" />Submitting…</>
              : "Submit withdrawal"}
          </Button>
        </form>
      </div>
    </div>
  );
}