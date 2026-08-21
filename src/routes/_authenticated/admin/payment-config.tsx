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
  Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, Cloud,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/payment-config")({
  head: () => ({ meta: [{ title: "Payment Configuration · Admin" }] }),
  component: PaymentConfig,
});

// ── CloudPay field definitions ────────────────────────────────────────────────
const CLOUDPAY_FIELDS = [
  {
    key:         "cloudpay_base_url",
    label:       "CloudPay Base URL",
    placeholder: "https://www.pay.cloud.or.ke/api",
    hint:        "Use https://www.pay.cloud.or.ke/api for live, https://pay.cloud.or.ke/sandbox/api for testing. Note: always include www for the live URL.",
    secret: false,
    options: [
      { label: "Live (production)",  value: "https://www.pay.cloud.or.ke/api" },
      { label: "Sandbox (testing)",  value: "https://pay.cloud.or.ke/sandbox/api" },
    ],
  },
  {
    key:         "cloudpay_consumer_key",
    label:       "Consumer Key",
    placeholder: "Your CloudPay consumer key",
    hint:        "Found in your CloudPay dashboard under the account credentials.",
    secret: true,
  },
  {
    key:         "cloudpay_consumer_secret",
    label:       "Consumer Secret",
    placeholder: "Your CloudPay consumer secret",
    hint:        "Keep this confidential. Shown only once in the CloudPay dashboard.",
    secret: true,
  },
  {
    key:         "cloudpay_callback_url",
    label:       "Callback URL",
    placeholder: "https://YOUR_PROJECT_REF.supabase.co/functions/v1/cloudpay-callback",
    hint:        "Your Supabase Edge Function URL. Configure this in your CloudPay dashboard as the webhook URL.",
    secret: false,
  },
  {
    key:         "cloudpay_signing_secret",
    label:       "Webhook Signing Secret",
    placeholder: "whsec_...",
    hint:        "The signing secret shown next to your callback URL in the CloudPay dashboard. Used to verify webhook authenticity.",
    secret: true,
  },
] as const;

type CloudPayKey = typeof CLOUDPAY_FIELDS[number]["key"];
type Config = Record<CloudPayKey, string>;
const EMPTY: Config = Object.fromEntries(CLOUDPAY_FIELDS.map(f => [f.key, ""])) as Config;

function PaymentConfig() {
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const [config,     setConfig]     = useState<Config>(EMPTY);
  const [show,       setShow]       = useState<Record<string, boolean>>({});
  const [lastSaved,  setLastSaved]  = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase.from("platform_settings") as any)
      .select("*").eq("id", "global").single();
    if (data) {
      const loaded: Config = { ...EMPTY };
      for (const f of CLOUDPAY_FIELDS) {
        if ((data as any)[f.key]) loaded[f.key] = (data as any)[f.key];
      }
      setConfig(loaded);
      setLastSaved(data.updated_at ?? null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key: CloudPayKey, val: string) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setTestResult(null);
  };

  const toggleShow = (key: string) => setShow(prev => ({ ...prev, [key]: !prev[key] }));

  const save = async () => {
    const required: CloudPayKey[] = ["cloudpay_consumer_key", "cloudpay_consumer_secret", "cloudpay_callback_url"];
    const empty = required.filter(k => !config[k].trim());
    if (empty.length) {
      const labels = CLOUDPAY_FIELDS.filter(f => empty.includes(f.key as CloudPayKey)).map(f => f.label);
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
      for (const f of CLOUDPAY_FIELDS) update[f.key] = config[f.key] || null;

      const { error } = await (supabase.from("platform_settings") as any)
        .upsert({ id: "global", ...update });

      if (error) throw new Error(error.message);
      setLastSaved(new Date().toISOString());
      toast.success("CloudPay configuration saved — changes are live immediately.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!config.cloudpay_consumer_key || !config.cloudpay_consumer_secret) {
      toast.error("Fill in Consumer Key and Consumer Secret first.");
      return;
    }
    setTesting(true); setTestResult(null);
    try {
      const ANON_KEY     = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/cloudpay-proxy?action=test-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
        body: JSON.stringify({
          base_url:        config.cloudpay_base_url || "https://pay.cloud.or.ke/api",
          consumer_key:    config.cloudpay_consumer_key,
          consumer_secret: config.cloudpay_consumer_secret,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult("ok");
        toast.success("Connection successful! CloudPay credentials are valid.");
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
            <Cloud className="size-5 sm:size-6 text-primary shrink-0" />
            Payment Configuration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            CloudPay credentials for M-Pesa STK push deposits.
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
          <p>
            Get your credentials from your{" "}
            <a href="https://pay.cloud.or.ke" target="_blank" rel="noopener noreferrer"
              className="text-primary underline">CloudPay dashboard</a>
            {" "}→ select your account → copy the Consumer Key and Secret.
            Set the Callback URL in your CloudPay dashboard to receive payment notifications.
          </p>
        </div>
      </div>

      {/* CloudPay fields */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CloudPay Credentials</p>
      </div>

      <div className="space-y-5">
        {CLOUDPAY_FIELDS.map(field => (
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
        <Button type="button" variant="outline" onClick={testConnection}
          disabled={testing || saving} className="flex-1 sm:flex-none h-11">
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
        <Button onClick={save} disabled={saving || testing}
          className="flex-1 sm:flex-none h-11 bg-gradient-primary shadow-glow hover:opacity-95 px-8 font-semibold">
          {saving
            ? <><RefreshCw className="size-4 mr-2 animate-spin" />Saving…</>
            : <><Save className="size-4 mr-2" />Save configuration</>}
        </Button>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-xl border border-border/40 bg-surface/50 px-4 py-3">
        <ShieldCheck className="size-3.5 mt-0.5 shrink-0 text-profit" />
        <span>
          Credentials are stored in the Supabase database with admin-only row-level security.
          The CloudPay Edge Function reads them on every transaction — no redeploy needed.
        </span>
      </div>
    </div>
  );
}

type FieldDef = {
  key: string; label: string; placeholder: string; hint: string; secret: boolean;
  options?: { label: string; value: string }[];
};

function FieldRow({ field, value, shown, onChange, onToggleShow }: {
  field: FieldDef; value: string; shown: boolean;
  onChange: (v: string) => void; onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.key} className="text-sm font-medium">{field.label}</Label>
      <p className="text-xs text-muted-foreground">{field.hint}</p>
      {field.options ? (
        <div className="grid gap-2">
          {field.options.map(opt => (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                value === opt.value
                  ? "border-primary/60 bg-primary/10 text-primary font-semibold"
                  : "border-border/60 bg-surface/60 hover:border-primary/30"
              }`}>
              <span>{opt.label}</span>
              {value === opt.value && <CheckCircle2 className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      ) : field.secret ? (
        <div className="relative">
          <Input id={field.key} type={shown ? "text" : "password"} placeholder={field.placeholder}
            className="h-11 pr-10 font-mono text-sm" value={value}
            onChange={e => onChange(e.target.value)} autoComplete="off" />
          <button type="button" onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={shown ? "Hide" : "Show"}>
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      ) : (
        <Input id={field.key} placeholder={field.placeholder}
          className="h-11 font-mono text-sm" value={value}
          onChange={e => onChange(e.target.value)} autoComplete="off" />
      )}
    </div>
  );
}
