import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone, RefreshCw, Save, ShieldCheck, Info,
  Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payment-config")({
  head: () => ({ meta: [{ title: "Payment Configuration · Admin" }] }),
  component: PaymentConfig,
});

// ── SasaPay field definitions ──────────────────────────────────────────────────
const SASAPAY_FIELDS = [
  {
    key: "sasapay_base_url",
    label: "SasaPay Base URL",
    placeholder: "https://sandbox.sasapay.app",
    hint: "Use https://sandbox.sasapay.app for testing, https://api.sasapay.app for production.",
    secret: false,
    options: [
      { label: "Production", value: "https://api.sasapay.app" },
      { label: "Sandbox (testing)", value: "https://sandbox.sasapay.app" },
    ],
  },
  {
    key: "sasapay_client_id",
    label: "Client ID",
    placeholder: "From SasaPay Developer Portal → Your App",
    hint: "Found in your SasaPay developer portal application credentials.",
    secret: true,
  },
  {
    key: "sasapay_client_secret",
    label: "Client Secret",
    placeholder: "From SasaPay Developer Portal → Your App",
    hint: "Found in your SasaPay developer portal application credentials. Keep this confidential.",
    secret: true,
  },
  {
    key: "sasapay_merchant_code",
    label: "Merchant Code",
    placeholder: "e.g. 600980",
    hint: "Your SasaPay merchant code (Paybill or Till number).",
    secret: false,
  },
  {
    key: "sasapay_network_code",
    label: "Default Network Code",
    placeholder: "63902",
    hint: "The mobile money network used for STK push deposits. 63902 = M-PESA (recommended).",
    secret: false,
    options: [
      { label: "M-PESA (63902)", value: "63902" },
      { label: "Airtel Money (63903)", value: "63903" },
      { label: "T-Kash (63907)", value: "63907" },
      { label: "SasaPay Wallet (0)", value: "0" },
    ],
  },
  {
    key: "sasapay_callback_base",
    label: "Callback Base URL",
    placeholder: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sasapay-callback",
    hint: "Your Supabase Edge Function URL — replace YOUR_PROJECT_REF with your actual project reference.",
    secret: false,
  },
] as const;

// ── Legacy Daraja fields (kept for reference / migration) ──────────────────────
const DARAJA_FIELDS = [
  {
    key: "daraja_base_url",
    label: "Daraja Base URL",
    placeholder: "https://api.safaricom.co.ke",
    hint: "Legacy Daraja credentials — no longer used by the payment system.",
    secret: false,
    options: [
      { label: "Production", value: "https://api.safaricom.co.ke" },
      { label: "Sandbox (testing)", value: "https://sandbox.safaricom.co.ke" },
    ],
  },
  { key: "daraja_consumer_key",        label: "Consumer Key",           placeholder: "Daraja consumer key",        hint: "Legacy — not used.", secret: true },
  { key: "daraja_consumer_secret",     label: "Consumer Secret",        placeholder: "Daraja consumer secret",     hint: "Legacy — not used.", secret: true },
  { key: "stk_shortcode",              label: "STK Shortcode",          placeholder: "e.g. 174379",                hint: "Legacy — not used.", secret: false },
  { key: "stk_passkey",                label: "STK Passkey",            placeholder: "Daraja passkey",             hint: "Legacy — not used.", secret: true },
  { key: "b2c_shortcode",              label: "B2C Shortcode",          placeholder: "e.g. 600998",                hint: "Legacy — not used.", secret: false },
  { key: "b2c_initiator_name",         label: "B2C Initiator Name",     placeholder: "e.g. api_operator",          hint: "Legacy — not used.", secret: false },
  { key: "daraja_security_credential", label: "B2C Security Credential",placeholder: "Encrypted credential",       hint: "Legacy — not used.", secret: true },
  { key: "daraja_callback_base",       label: "Daraja Callback URL",    placeholder: "Daraja callback URL",        hint: "Legacy — not used.", secret: false },
] as const;

type SasaPayKey = typeof SASAPAY_FIELDS[number]["key"];
type DarajaKey  = typeof DARAJA_FIELDS[number]["key"];
type FieldKey   = SasaPayKey | DarajaKey;

type Config = Record<FieldKey, string>;

const ALL_KEYS = [
  ...SASAPAY_FIELDS.map(f => f.key),
  ...DARAJA_FIELDS.map(f => f.key),
] as const;

const EMPTY: Config = Object.fromEntries(ALL_KEYS.map(k => [k, ""])) as Config;

function PaymentConfig() {
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const [config,     setConfig]     = useState<Config>(EMPTY);
  const [show,       setShow]       = useState<Record<string, boolean>>({});
  const [lastSaved,  setLastSaved]  = useState<string | null>(null);
  const [showLegacy, setShowLegacy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase.from("platform_settings") as any)
      .select("*").eq("id", "global").single();
    if (data) {
      const loaded: Config = { ...EMPTY };
      for (const key of ALL_KEYS) {
        if ((data as any)[key]) loaded[key as FieldKey] = (data as any)[key];
      }
      setConfig(loaded);
      setLastSaved(data.updated_at ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key: FieldKey, val: string) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setTestResult(null);
  };

  const toggleShow = (key: string) =>
    setShow(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    // Validate required SasaPay fields
    const required: SasaPayKey[] = [
      "sasapay_client_id",
      "sasapay_client_secret",
      "sasapay_merchant_code",
      "sasapay_callback_base",
    ];
    const empty = required.filter(k => !config[k].trim());
    if (empty.length) {
      const labels = SASAPAY_FIELDS.filter(f => empty.includes(f.key as SasaPayKey)).map(f => f.label);
      toast.error(`Please fill in: ${labels.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const update: Record<string, string | null> = {
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      };
      for (const key of ALL_KEYS) update[key] = config[key as FieldKey] || null;

      const { error } = await (supabase.from("platform_settings") as any)
        .upsert({ id: "global", ...update });

      if (error) throw new Error(error.message);
      setLastSaved(new Date().toISOString());
      toast.success("Payment configuration saved — changes are live immediately.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.sasapay_client_id || !config.sasapay_client_secret) {
      toast.error("Fill in Client ID and Client Secret first.");
      return;
    }
    setTesting(true); setTestResult(null);
    try {
      const ANON_KEY     = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/sasapay-proxy?action=test-token`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
          body: JSON.stringify({
            base_url:      config.sasapay_base_url || "https://sandbox.sasapay.app",
            client_id:     config.sasapay_client_id,
            client_secret: config.sasapay_client_secret,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult("ok");
        toast.success("Connection successful! SasaPay credentials are valid.");
      } else {
        setTestResult("fail");
        toast.error(`Connection failed: ${data.error ?? "Invalid credentials"}`);
      }
    } catch {
      setTestResult("fail");
      toast.error("Could not reach the payment service.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12 space-y-6 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <Smartphone className="size-5 sm:size-6 text-primary shrink-0" />
            Payment Configuration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            SasaPay credentials for processing deposits and withdrawals.
          </p>
          {lastSaved && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={load} className="shrink-0 size-9">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3 text-sm">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Changes take effect immediately — no redeploy needed.</p>
          <p>Credentials are saved to the database and the payment Edge Functions read them on every transaction. See <strong>PAYMENTS.md</strong> for setup instructions.</p>
        </div>
      </div>

      {/* ── SasaPay Fields ─────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SasaPay Credentials</p>
      </div>

      <div className="space-y-5">
        {SASAPAY_FIELDS.map(field => (
          <FieldRow
            key={field.key}
            field={field as any}
            value={config[field.key]}
            shown={!!show[field.key]}
            onChange={val => set(field.key, val)}
            onToggleShow={() => toggleShow(field.key)}
          />
        ))}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={testConnection}
          disabled={testing || saving}
          className="flex-1 sm:flex-none h-11"
        >
          {testing ? (
            <><Loader2 className="size-4 mr-2 animate-spin" />Testing…</>
          ) : testResult === "ok" ? (
            <><CheckCircle2 className="size-4 mr-2 text-profit" />Connected</>
          ) : testResult === "fail" ? (
            <><AlertTriangle className="size-4 mr-2 text-loss" />Failed — retry</>
          ) : (
            <><Smartphone className="size-4 mr-2" />Test connection</>
          )}
        </Button>

        <Button
          onClick={save}
          disabled={saving || testing}
          className="flex-1 sm:flex-none h-11 bg-gradient-primary shadow-glow hover:opacity-95 px-8 font-semibold"
        >
          {saving
            ? <><RefreshCw className="size-4 mr-2 animate-spin" />Saving…</>
            : <><Save className="size-4 mr-2" />Save configuration</>}
        </Button>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-xl border border-border/40 bg-surface/50 px-4 py-3">
        <ShieldCheck className="size-3.5 mt-0.5 shrink-0 text-profit" />
        <span>
          Credentials are stored in the Supabase database with row-level security. Only admins can read or write payment configuration.
          The payment system reads credentials directly from the database on each transaction — no redeploy needed. Secret values are masked in the UI.
        </span>
      </div>

      {/* ── Legacy Daraja (collapsible) ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLegacy(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface/30"
        >
          <span>Legacy Daraja / M-Pesa Direct credentials (not used)</span>
          <span className="text-[10px]">{showLegacy ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {showLegacy && (
          <div className="px-4 pb-5 pt-2 space-y-5 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              These fields are no longer used by the payment system since migrating to SasaPay. They are kept here for reference only.
            </p>
            {DARAJA_FIELDS.map(field => (
              <FieldRow
                key={field.key}
                field={field as any}
                value={config[field.key as DarajaKey]}
                shown={!!show[field.key]}
                onChange={val => set(field.key as DarajaKey, val)}
                onToggleShow={() => toggleShow(field.key)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Reusable field row ─────────────────────────────────────────────────────────
type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
  secret: boolean;
  options?: { label: string; value: string }[];
};

function FieldRow({
  field,
  value,
  shown,
  onChange,
  onToggleShow,
}: {
  field: FieldDef;
  value: string;
  shown: boolean;
  onChange: (v: string) => void;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key} className="text-sm font-medium">{field.label}</Label>
      <p className="text-xs text-muted-foreground">{field.hint}</p>

      {field.options ? (
        <div className="grid gap-2">
          {field.options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                value === opt.value
                  ? "border-primary/60 bg-primary/10 text-primary font-semibold"
                  : "border-border/60 bg-surface/60 hover:border-primary/30"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <CheckCircle2 className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      ) : field.secret ? (
        <div className="relative">
          <Input
            id={field.key}
            type={shown ? "text" : "password"}
            placeholder={field.placeholder}
            className="h-11 pr-10 font-mono text-sm"
            value={value}
            onChange={e => onChange(e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={shown ? "Hide" : "Show"}
          >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      ) : (
        <Input
          id={field.key}
          placeholder={field.placeholder}
          className="h-11 font-mono text-sm"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
        />
      )}
    </div>
  );
}
