import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invalidatePlatformSettings } from "@/hooks/use-platform-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Shield, Bell, DollarSign, RefreshCw, Save, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/platform-settings")({
  head: () => ({ meta: [{ title: "Platform Settings · Admin" }] }),
  component: AdminSettings,
});

type SettingsRow = {
  id: string;
  min_deposit_cents: number;
  max_deposit_cents: number;
  min_withdrawal_cents: number;
  max_withdrawal_cents: number;
  min_bet_cents: number;
  auto_approve_deposits: boolean;
  require_admin_withdrawals: boolean;
  maintenance_mode: boolean;
  email_notifications: boolean;
  updated_at: string | null;
};

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 sm:px-6 py-4 border-b border-border/40">
        <span className="size-7 rounded-lg bg-primary/12 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-primary" />
        </span>
        <h2 className="font-semibold text-sm sm:text-base">{title}</h2>
      </div>
      <div className="px-4 sm:px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }: {
  title: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="shrink-0 mt-0.5" />
    </div>
  );
}

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [minDeposit,    setMinDeposit]    = useState("10");
  const [maxDeposit,    setMaxDeposit]    = useState("150000");
  const [minWithdrawal, setMinWithdrawal] = useState("10");
  const [maxWithdrawal, setMaxWithdrawal] = useState("300000");
  const [minBet,        setMinBet]        = useState("10");
  const [autoApproveDeposits,     setAutoApproveDeposits]     = useState(true);
  const [requireAdminWithdrawals, setRequireAdminWithdrawals] = useState(true);
  const [maintenanceMode,         setMaintenanceMode]         = useState(false);
  const [emailNotifications,      setEmailNotifications]      = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("platform_settings") as any)
      .select("*").eq("id", "global").single();
    if (error) {
      toast.error("Failed to load settings");
      setLoading(false);
      return;
    }
    const row = data as SettingsRow;
    setMinDeposit(String(row.min_deposit_cents / 100));
    setMaxDeposit(String(row.max_deposit_cents / 100));
    setMinWithdrawal(String(row.min_withdrawal_cents / 100));
    setMaxWithdrawal(String(row.max_withdrawal_cents / 100));
    setMinBet(String((row.min_bet_cents ?? 1000) / 100));
    setAutoApproveDeposits(row.auto_approve_deposits);
    setRequireAdminWithdrawals(row.require_admin_withdrawals);
    setMaintenanceMode(row.maintenance_mode);
    setEmailNotifications(row.email_notifications);
    setLastUpdated(row.updated_at);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    // Validate
    const vals = { minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, minBet };
    for (const [k, v] of Object.entries(vals)) {
      if (!v || isNaN(parseFloat(v)) || parseFloat(v) < 0) {
        toast.error(`Invalid value for ${k.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("platform_settings") as any).upsert({
        id: "global",
        min_deposit_cents:    Math.round(parseFloat(minDeposit)    * 100),
        max_deposit_cents:    Math.round(parseFloat(maxDeposit)    * 100),
        min_withdrawal_cents: Math.round(parseFloat(minWithdrawal) * 100),
        max_withdrawal_cents: Math.round(parseFloat(maxWithdrawal) * 100),
        min_bet_cents:        Math.round(parseFloat(minBet)        * 100),
        auto_approve_deposits:     autoApproveDeposits,
        require_admin_withdrawals: requireAdminWithdrawals,
        maintenance_mode:          maintenanceMode,
        email_notifications:       emailNotifications,
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      });
      if (error) throw new Error(error.message);
      invalidatePlatformSettings();
      setLastUpdated(new Date().toISOString());
      toast.success("Settings saved successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12 space-y-5 max-w-2xl mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 flex-wrap">
            <Settings className="size-5 sm:size-6 text-primary shrink-0" />
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure platform-wide behaviour. Changes take effect immediately.
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Last saved: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="shrink-0 size-9">
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* ── Maintenance banner ── */}
      {maintenanceMode && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 flex items-start gap-3 text-sm font-medium text-warning">
          <Shield className="size-4 shrink-0 mt-0.5" />
          <span>Maintenance mode is ON — trading and deposits are disabled for all users.</span>
        </div>
      )}

      {/* ── Trading Limits ── */}
      <SectionCard icon={TrendingUp} title="Trading Limits (KES)">
        <FieldGroup
          label="Minimum bet amount"
          hint="Smallest amount a user can bet on Candle Predict"
        >
          <Input
            type="number" min={1} className="h-10 font-mono"
            value={minBet} onChange={e => setMinBet(e.target.value)}
            placeholder="10"
          />
        </FieldGroup>
      </SectionCard>

      {/* ── Payment Limits ── */}
      <SectionCard icon={DollarSign} title="Payment Limits (KES)">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <FieldGroup label="Min Deposit">
            <Input type="number" min={1} className="h-10 font-mono"
              value={minDeposit} onChange={e => setMinDeposit(e.target.value)} placeholder="10" />
          </FieldGroup>
          <FieldGroup label="Max Deposit">
            <Input type="number" min={1} className="h-10 font-mono"
              value={maxDeposit} onChange={e => setMaxDeposit(e.target.value)} placeholder="150000" />
          </FieldGroup>
          <FieldGroup label="Min Withdrawal">
            <Input type="number" min={1} className="h-10 font-mono"
              value={minWithdrawal} onChange={e => setMinWithdrawal(e.target.value)} placeholder="10" />
          </FieldGroup>
          <FieldGroup label="Max Withdrawal">
            <Input type="number" min={1} className="h-10 font-mono"
              value={maxWithdrawal} onChange={e => setMaxWithdrawal(e.target.value)} placeholder="300000" />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Security & Approvals ── */}
      <SectionCard icon={Shield} title="Security & Approvals">
        <ToggleRow
          title="Auto-approve deposits"
          desc="Credit wallet immediately on M-Pesa confirmation"
          checked={autoApproveDeposits}
          onChange={setAutoApproveDeposits}
        />
        <Separator />
        <ToggleRow
          title="Admin approval for withdrawals"
          desc="All withdrawals require admin review before processing"
          checked={requireAdminWithdrawals}
          onChange={setRequireAdminWithdrawals}
        />
        <Separator />
        <ToggleRow
          title={<span className="text-warning">Maintenance mode</span> as any}
          desc="Disables all trading and deposits platform-wide"
          checked={maintenanceMode}
          onChange={setMaintenanceMode}
        />
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard icon={Bell} title="Admin Notifications">
        <ToggleRow
          title="Email notifications"
          desc="Receive alerts for pending withdrawals and support tickets"
          checked={emailNotifications}
          onChange={setEmailNotifications}
        />
      </SectionCard>

      {/* ── Save button ── */}
      <div className="pt-1">
        <Button
          onClick={save}
          disabled={saving}
          className="bg-gradient-primary shadow-glow hover:opacity-95 w-full sm:w-auto h-11 px-8 text-sm font-semibold"
        >
          {saving
            ? <><RefreshCw className="size-4 mr-2 animate-spin" />Saving…</>
            : <><Save className="size-4 mr-2" />Save settings</>}
        </Button>
      </div>
    </div>
  );
}
