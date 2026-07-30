import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Bell, Globe, Moon, Sun, Monitor, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · DerivGrid" }] }),
  component: SettingsPage,
});

const DEFAULT_PREFS = {
  notify_trades: true,
  notify_deposits: true,
  notify_alerts: true,
  notify_promos: false,
  theme: "dark" as "dark" | "light" | "system",
  currency: "USD",
  language: "en",
};

function SettingsPage() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Load preferences from user metadata
      const meta = user.user_metadata ?? {};
      setPrefs({
        notify_trades:   meta.notify_trades   ?? DEFAULT_PREFS.notify_trades,
        notify_deposits: meta.notify_deposits ?? DEFAULT_PREFS.notify_deposits,
        notify_alerts:   meta.notify_alerts   ?? DEFAULT_PREFS.notify_alerts,
        notify_promos:   meta.notify_promos   ?? DEFAULT_PREFS.notify_promos,
        theme:           meta.theme           ?? DEFAULT_PREFS.theme,
        currency:        meta.currency        ?? DEFAULT_PREFS.currency,
        language:        meta.language        ?? DEFAULT_PREFS.language,
      });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: prefs });
      if (error) throw error;
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof typeof DEFAULT_PREFS>(key: K, value: typeof DEFAULT_PREFS[K]) =>
    setPrefs(p => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your trading experience. Changes are saved to your account.</p>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-primary" />
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div>
          <Label className="text-sm">Theme</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(["dark", "light", "system"] as const).map((t) => (
              <button key={t} onClick={() => set("theme", t)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm capitalize transition-all ${
                  prefs.theme === t ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/60 hover:border-primary/30"
                }`}>
                {t === "dark" ? <Moon className="size-3.5" /> : t === "light" ? <Sun className="size-3.5" /> : <Monitor className="size-3.5" />}
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm">Display currency</Label>
          <select value={prefs.currency} onChange={e => set("currency", e.target.value)}
            className="mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="USD">USD — US Dollar</option>
            <option value="KES">KES — Kenyan Shilling</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <ToggleRow label="Trade executed" desc="Notify when a position opens or closes"
          checked={prefs.notify_trades} onCheckedChange={v => set("notify_trades", v)} />
        <Separator />
        <ToggleRow label="Deposits & withdrawals" desc="Notify on wallet credit / debit"
          checked={prefs.notify_deposits} onCheckedChange={v => set("notify_deposits", v)} />
        <Separator />
        <ToggleRow label="Price alerts" desc="Notify when your alerts trigger"
          checked={prefs.notify_alerts} onCheckedChange={v => set("notify_alerts", v)} />
        <Separator />
        <ToggleRow label="Promotions & announcements" desc="News and special offers from DerivGrid"
          checked={prefs.notify_promos} onCheckedChange={v => set("notify_promos", v)} />
      </div>

      {/* Language */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          <h2 className="font-semibold">Language</h2>
        </div>
        <select value={prefs.language} onChange={e => set("language", e.target.value)}
          className="w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="en">English</option>
          <option value="sw">Swahili</option>
          <option value="fr">French</option>
        </select>
      </div>

      <Button onClick={save} disabled={saving} className="bg-gradient-primary shadow-glow hover:opacity-95">
        {saving ? <><Loader2 className="size-4 mr-1.5 animate-spin" />Saving…</> : "Save settings"}
      </Button>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onCheckedChange }: {
  label: string; desc: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
