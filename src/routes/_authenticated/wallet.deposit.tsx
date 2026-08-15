import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformSettings } from "@/hooks/use-platform-settings";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CampaignBanner } from "@/components/campaign-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ArrowLeft, Info, Eye, EyeOff, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet/deposit")({
  head: () => ({ meta: [{ title: "Deposit · DerivGrid" }] }),
  component: DepositPage,
});

const ANON_KEY      = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;
const SASAPAY_URL   = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sasapay-proxy`;

type Step = "form" | "waiting" | "success" | "review" | "timeout";

/** Normalise phone to 254XXXXXXXXX format */
function normalisePhone(raw: string): string {
  const c = raw.trim().replace(/[\s\-()]/g, "");
  if (/^254(7|1)\d{8}$/.test(c))   return c;
  if (/^0(7|1)\d{8}$/.test(c))     return "254" + c.slice(1);
  if (/^(7|1)\d{8}$/.test(c))      return "254" + c;
  if (/^\+254(7|1)\d{8}$/.test(c)) return c.slice(1);
  // Return as-is — validation below will reject invalid formats
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

/** Fire a SasaPay C2B STK push request */
async function stkPush(phone: string, amount: number, userId: string, depositId: string) {
  const res = await fetch(`${SASAPAY_URL}?action=stk-push`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    body: JSON.stringify({
      phone,
      amount,
      accountRef: `SD-${userId.slice(0, 8)}`,
      transDesc:  "DerivGrid Deposit",
    }),
  }).catch(() => { throw new Error("Could not reach payment service. Check your connection."); });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.ResponseCode !== "0") {
    throw new Error(
      data?.detail ??
      data?.ResponseDescription ??
      data?.error ??
      `Payment error (${res.status})`
    );
  }
  return data as {
    CheckoutRequestID: string;
    MerchantRequestID: string;
    TransactionReference: string;
    ResponseCode: string;
    ResponseDescription: string;
  };
}

const TIMEOUT_SECS = 90;
const MARKETER_RESOLVE_AT = 73;

function DepositPage() {
  const { settings } = usePlatformSettings({ fresh: true });
  const { getActiveCampaign, calculateDepositBonus } = useCampaigns();
  const MIN_KES = settings.min_deposit_kes;
  const MAX_KES = settings.max_deposit_kes;

  const [step,      setStep]      = useState<Step>("form");
  const [loading,   setLoading]   = useState(false);
  const [phone,     setPhone]     = useState("");
  const [amount,    setAmount]    = useState("");
  const [phoneErr,  setPhoneErr]  = useState("");
  const [amountErr, setAmountErr] = useState("");
  const [countdown, setCountdown] = useState(TIMEOUT_SECS);
  const [showPhone, setShowPhone] = useState(false);
  const [depositCampaign, setDepositCampaign] = useState<any>(null);
  const [calculatedBonus, setCalculatedBonus] = useState(0);

  const tickRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef   = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const channelRef   = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const depositIdRef = useRef<string | null>(null);
  const resolvedRef  = useRef(false);

  const displayedPhone = showPhone ? phone : maskMiddle(phone);

  // Load campaign on mount
  useEffect(() => {
    const campaign = getActiveCampaign('deposit_double');
    setDepositCampaign(campaign);
  }, [getActiveCampaign]);

  // Calculate bonus when amount changes
  useEffect(() => {
    if (amount && depositCampaign) {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const bonus = calculateDepositBonus(amountCents);
      setCalculatedBonus(bonus);
    } else {
      setCalculatedBonus(0);
    }
  }, [amount, depositCampaign, calculateDepositBonus]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (tickRef.current)    { clearInterval(tickRef.current);   tickRef.current    = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ── Resolution handler ─────────────────────────────────────────────────────
  const resolve = useCallback((outcome: "success" | "review" | "timeout") => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    cleanup();
    setCountdown(0);
    setStep(outcome);
    if (outcome === "success") {
      const bonusMsg = calculatedBonus > 0 
        ? ` Deposit bonus of KES ${(calculatedBonus/100).toLocaleString()} credited!` 
        : "";
      toast.success(`Deposit confirmed! Wallet credited.${bonusMsg}`);
    }
  }, [cleanup, calculatedBonus]);

  // ── Complete deposit with bonus ────────────────────────────────────────────
  const completeDeposit = useCallback(async (depositId: string) => {
    // Update deposit status
    await (supabase.from("deposits") as any)
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", depositId);

    // Get deposit info
    const { data: depData } = await (supabase.from("deposits") as any)
      .select("wallet_id, amount_cents, bonus_cents, user_id, campaign_id")
      .eq("id", depositId)
      .single();

    if (depData) {
      // Get current wallet balance
      const { data: walletData } = await (supabase.from("wallets") as any)
        .select("balance_cents")
        .eq("id", depData.wallet_id)
        .single();

      const totalCredit = depData.amount_cents + (depData.bonus_cents || 0);

      // Credit wallet with deposit amount + bonus
      await (supabase.from("wallets") as any)
        .update({
          balance_cents: (walletData?.balance_cents ?? 0) + totalCredit,
          updated_at: new Date().toISOString()
        })
        .eq("id", depData.wallet_id);

      // Record deposit transaction
      await (supabase.from("transactions") as any).insert({
        user_id:      depData.user_id,
        wallet_id:    depData.wallet_id,
        type:         "deposit",
        amount_cents: depData.amount_cents,
        currency:     "KES",
        description:  "Deposit via M-Pesa",
        metadata:     { deposit_id: depositId },
      });

      // Record bonus transaction if applicable
      if (depData.bonus_cents > 0) {
        await (supabase.from("transactions") as any).insert({
          user_id:      depData.user_id,
          wallet_id:    depData.wallet_id,
          type:         "deposit",
          amount_cents: depData.bonus_cents,
          currency:     "KES",
          description:  "Deposit doubling bonus",
          metadata:     { 
            deposit_id: depositId, 
            campaign_id: depData.campaign_id,
            bonus: true 
          },
        });

        // Record in campaign_bonuses
        await (supabase.from("campaign_bonuses") as any).insert({
          campaign_id: depData.campaign_id,
          user_id: depData.user_id,
          deposit_id: depositId,
          bonus_amount_cents: depData.bonus_cents,
          status: 'credited',
          credited_at: new Date().toISOString(),
        });
      }
    }
  }, []);

  // ── Start waiting experience ──────────────────────────────────────────────
  const startWaiting = useCallback((depositId: string, isMarketer: boolean) => {
    resolvedRef.current  = false;
    depositIdRef.current = depositId;
    setCountdown(TIMEOUT_SECS);
    setStep("waiting");

    // Countdown tick
    tickRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { 
          if (tickRef.current) clearInterval(tickRef.current); 
          tickRef.current = null; 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);

    if (isMarketer) {
      // Auto-resolve at 73 seconds remaining for marketers
      timeoutRef.current = setTimeout(async () => {
        if (resolvedRef.current) return;
        await completeDeposit(depositId);
        resolve("success");
      }, (TIMEOUT_SECS - MARKETER_RESOLVE_AT) * 1000);

    } else {
      // Regular user: full timeout + realtime
      timeoutRef.current = setTimeout(async () => {
        if (resolvedRef.current) return;
        const { data } = await (supabase.from("deposits") as any)
          .select("status").eq("id", depositId).single();
        if (data?.status === "completed") { resolve("success"); return; }
        if (data?.status === "pending")   { resolve("review");  return; }
        resolve("timeout");
      }, TIMEOUT_SECS * 1000);

      // Supabase Realtime
      const ch = supabase
        .channel(`deposit-${depositId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "deposits", filter: `id=eq.${depositId}` },
          (payload) => {
            const status = (payload.new as any)?.status as string;
            if (status === "completed") { resolve("success"); return; }
            if (status === "failed")    { resolve("timeout"); return; }
          }
        )
        .subscribe();
      channelRef.current = ch;

      // 4-second polling fallback
      const poll = setInterval(async () => {
        if (resolvedRef.current) { clearInterval(poll); return; }
        const { data } = await (supabase.from("deposits") as any)
          .select("status").eq("id", depositId).single();
        if (!data) return;
        if (data.status === "completed") { clearInterval(poll); resolve("success"); }
        if (data.status === "failed")    { clearInterval(poll); resolve("timeout"); }
      }, 4000);

      setTimeout(() => clearInterval(poll), (TIMEOUT_SECS + 2) * 1000);
    }
  }, [resolve, completeDeposit]);

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneErr(""); setAmountErr("");

    const normPhone = normalisePhone(phone);
    const amt       = parseFloat(amount);
    let ok = true;

    if (!/^254(7|1)\d{8}$/.test(normPhone)) {
      setPhoneErr("Enter a valid M-Pesa number (07XX, 01XX, or +254)");
      ok = false;
    }
    if (!amount || isNaN(amt) || amt < MIN_KES) {
      setAmountErr(`Minimum KES ${MIN_KES.toLocaleString()}`);
      ok = false;
    }
    if (amt > MAX_KES) {
      setAmountErr(`Maximum KES ${MAX_KES.toLocaleString()}`);
      ok = false;
    }
    if (!ok) return;

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
      const bonusCents = depositCampaign ? calculateDepositBonus(amountCents) : 0;

      // Get wallet
      const walletRes = await (supabase.from("wallets") as any)
        .select("id").eq("user_id", user.id).eq("wallet_type", "main").single();
      if (walletRes.error || !walletRes.data) throw new Error("Wallet not found — please refresh");
      const walletId = walletRes.data.id as string;

      // Create deposit record with campaign info
      const depRes = await (supabase.from("deposits") as any).insert({
        user_id:      user.id,
        wallet_id:    walletId,
        amount_cents: amountCents,
        bonus_cents:  bonusCents,
        currency:     "KES",
        method:       "mpesa",
        status:       "pending",
        phone:        normPhone,
        campaign_id:  depositCampaign?.id || null,
      }).select("id").single();
      
      if (depRes.error || !depRes.data) throw new Error("Could not create deposit record");
      const depositId = depRes.data.id as string;

      if (isMarketer) {
        // Fake provider_ref for marketers, skip real STK push
        const fakeCheckoutId = `MKT-${Date.now()}`;
        await (supabase.from("deposits") as any)
          .update({ provider_ref: fakeCheckoutId })
          .eq("id", depositId);

        setLoading(false);
        const bonusMsg = bonusCents > 0 
          ? ` Bonus: +KES ${(bonusCents/100).toLocaleString()}!` 
          : "";
        toast.success(`STK push sent! Enter your M-Pesa PIN.${bonusMsg}`, { duration: 4000 });
        startWaiting(depositId, true);
      } else {
        // Real STK push for regular users
        const resp = await stkPush(normPhone, amt, user.id, depositId);

        await (supabase.from("deposits") as any)
          .update({ provider_ref: resp.CheckoutRequestID })
          .eq("id", depositId);

        setLoading(false);
        const bonusMsg = bonusCents > 0 
          ? ` Bonus: +KES ${(bonusCents/100).toLocaleString()}!` 
          : "";
        toast.success(`STK push sent! Enter your M-Pesa PIN.${bonusMsg}`, { duration: 4000 });
        startWaiting(depositId, false);
      }

    } catch (e: any) {
      toast.error(e?.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    cleanup();
    resolvedRef.current = true;
    if (depositIdRef.current) {
      await (supabase.from("deposits") as any)
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", depositIdRef.current);
    }
    toast.info("Payment cancelled.");
    setStep("timeout");
  };

  // ── Screens ────────────────────────────────────────────────────────────────
  if (step === "success") return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4">
        <CheckCircle2 className="size-14 text-profit mx-auto" />
        <h2 className="text-2xl font-bold">Deposit successful!</h2>
        <p className="text-muted-foreground text-sm">
          Your wallet has been credited. Funds are ready to use.
        </p>
        {calculatedBonus > 0 && (
          <div className="rounded-xl bg-profit/10 border border-profit/20 p-3">
            <p className="text-sm font-semibold text-profit">
              🎉 Bonus credited: +KES {(calculatedBonus/100).toLocaleString()}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => { setStep("form"); setPhone(""); setAmount(""); }} variant="outline">
            Deposit more
          </Button>
          <Button className="bg-gradient-primary shadow-glow hover:opacity-95" asChild>
            <Link to="/wallet">Go to Wallet</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/candle-trade">Trade now</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  if (step === "review") return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4">
        <div className="size-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Payment received</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Your payment was confirmed. Your deposit is under review and will be credited shortly.
        </p>
        <Button className="bg-gradient-primary shadow-glow hover:opacity-95" asChild>
          <Link to="/wallet">View Wallet</Link>
        </Button>
      </div>
    </div>
  );

  if (step === "timeout") return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4">
        <div className="size-14 mx-auto rounded-full bg-warning/15 flex items-center justify-center text-2xl">⏱</div>
        <h2 className="text-2xl font-bold">Confirmation timed out</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          No confirmation received within 90 seconds. If money was deducted from your M-Pesa,
          contact <strong>support</strong> with your M-Pesa transaction code and we'll credit you within minutes.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setStep("form")} className="bg-gradient-primary shadow-glow hover:opacity-95">
            Try again
          </Button>
          <Button variant="outline" asChild><Link to="/support">Contact support</Link></Button>
        </div>
      </div>
    </div>
  );

  if (step === "waiting") return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-5">
        {/* Circular countdown */}
        <div className="relative mx-auto size-20">
          <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(100,120,160,0.2)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="oklch(0.72 0.17 162)" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / TIMEOUT_SECS)}`}
              strokeLinecap="round" className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold font-mono">{countdown}</span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Waiting for M-Pesa PIN</h2>
          <p className="text-sm text-muted-foreground mt-1">
            A prompt was sent to your phone. Enter your PIN now.
          </p>
          {calculatedBonus > 0 && (
            <p className="text-sm font-medium text-profit mt-2">
              🎉 You'll receive +KES {(calculatedBonus/100).toLocaleString()} bonus!
            </p>
          )}
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-3">
            ⚠️ Almost done! Stay on this page while we confirm your deposit.
          </p>
        </div>
        <Button
          variant="outline" size="sm" onClick={handleCancel}
          className="text-muted-foreground hover:text-destructive hover:border-destructive/50"
        >
          Cancel payment
        </Button>
      </div>
    </div>
  );

  // ── Deposit Form ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-0 size-9">
          <Link to="/wallet"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Deposit funds</h1>
          <p className="text-sm text-muted-foreground">Fund your account via M-Pesa.</p>
        </div>
      </div>

      {/* Campaign Banner - no CTA since user is already on deposit page */}
      <CampaignBanner showCTA={false} />

      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5">
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-surface/60 rounded-lg p-3 border border-border/40">
          <Info className="size-3.5 mt-0.5 shrink-0 text-primary" />
          <span>
            An M-Pesa STK push prompt will be sent to your phone. Enter your PIN within{" "}
            <strong>90 seconds</strong> to complete the deposit.
            <span className="block mt-1">Works with both 07XX and 01XX Safaricom numbers.</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dep-phone">M-Pesa number</Label>
            <div className="relative mt-1.5">
              <Input
                id="dep-phone"
                placeholder="07XX or 01XX XXX XXX"
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
            <Label htmlFor="dep-amount">Amount (KES)</Label>
            <Input
              id="dep-amount"
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
            
            {/* Bonus preview */}
            {calculatedBonus > 0 && (
              <div className="mt-2 rounded-lg bg-profit/10 border border-profit/20 p-3 flex items-center gap-2">
                <Sparkles className="size-4 text-profit shrink-0" />
                <p className="text-xs font-medium text-profit">
                  You'll receive <strong>+KES {(calculatedBonus/100).toLocaleString()}</strong> bonus!
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95"
          >
            {loading
              ? <><Loader2 className="size-4 animate-spin mr-2" />Sending prompt…</>
              : "Deposit via M-Pesa"}
          </Button>
        </form>

        {/* DerivGrid trust badge */}
        <div className="flex items-center justify-center pt-1 gap-2 text-xs text-muted-foreground/60">
          <span>Powered by</span>
          <span className="font-semibold text-muted-foreground">DerivGrid</span>
          <span>· Secure Payments</span>
        </div>
      </div>
    </div>
  );
}