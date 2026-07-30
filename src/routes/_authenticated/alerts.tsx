import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ASSETS, tick as getNextTick } from "@/lib/market-simulator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BellRing, BellOff, Plus, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({ meta: [{ title: "Price Alerts · DerivGrid" }] }),
  component: AlertsPage,
});

type AlertRow = {
  id: string;
  asset_id: string;
  target_price: number;
  condition: "above" | "below";
  is_triggered: boolean;
  note: string | null;
  created_at: string;
};

function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [dbAssets, setDbAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [symbol, setSymbol] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [note, setNote] = useState("");
  const [symbolErr, setSymbolErr] = useState("");
  const [priceErr, setPriceErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: assets } = await supabase.from("assets").select("id, symbol, name").eq("is_active", true);
      setDbAssets(assets ?? []);
      const { data } = await supabase.from("price_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setAlerts((data as AlertRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // Live tick monitoring — check if alerts should trigger
  useEffect(() => {
    if (alerts.length === 0) return;
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setAlerts(prev => {
        let changed = false;
        const updated = prev.map(alert => {
          if (alert.is_triggered) return alert;
          const asset = ASSETS.find(a => a.id === alert.asset_id || a.symbol === alert.asset_id ||
            dbAssets.find(d => d.id === alert.asset_id)?.symbol === a.symbol);
          if (!asset) return alert;
          const t = getNextTick(asset);
          const triggered = alert.condition === "above" ? t.price >= alert.target_price : t.price <= alert.target_price;
          if (triggered) {
            changed = true;
            supabase.from("price_alerts").update({ is_triggered: true, triggered_at: new Date().toISOString() }).eq("id", alert.id);
            supabase.from("notifications").insert({
              user_id: user.id,
              title: `Price alert triggered`,
              body: `${asset.symbol} is now ${alert.condition} ${alert.target_price}`,
              type: "alert", is_read: false,
            });
            toast.success(`🔔 Alert: ${asset.symbol} hit ${alert.target_price}!`);
            return { ...alert, is_triggered: true };
          }
          return alert;
        });
        return changed ? updated : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts.length, dbAssets]);

  const assetIdFor = (sym: string) => dbAssets.find(a => a.symbol === sym)?.id ?? sym;
  const assetSymbol = (assetId: string) => dbAssets.find(a => a.id === assetId)?.symbol ?? ASSETS.find(a => a.symbol === assetId)?.symbol ?? assetId;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSymbolErr(""); setPriceErr("");
    let valid = true;
    if (!symbol) { setSymbolErr("Select an asset"); valid = false; }
    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price) || price <= 0) { setPriceErr("Enter a valid price"); valid = false; }
    if (!valid) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        asset_id: assetIdFor(symbol),
        target_price: price,
        condition,
        note: note || null,
        is_triggered: false,
      }).select().single();
      if (error) throw error;
      setAlerts(p => [data as AlertRow, ...p]);
      setSymbol(""); setTargetPrice(""); setNote(""); setCondition("above");
      setShowForm(false);
      toast.success("Price alert created");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not create alert");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("price_alerts").delete().eq("id", id);
    setAlerts(p => p.filter(a => a.id !== id));
    toast.info("Alert deleted");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Price Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">Get notified when markets reach your target levels.</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} className="bg-gradient-primary shadow-glow hover:opacity-95">
          <Plus className="size-4 mr-1.5" />New alert
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card">
          <h2 className="font-semibold mb-4">Create alert</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="al-symbol">Asset</Label>
                <select id="al-symbol" value={symbol} onChange={e => { setSymbol(e.target.value); setSymbolErr(""); }}
                  className="mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select asset</option>
                  {ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                </select>
                {symbolErr && <p className="text-xs text-destructive mt-1">{symbolErr}</p>}
              </div>
              <div>
                <Label htmlFor="al-condition">Condition</Label>
                <select id="al-condition" value={condition} onChange={e => setCondition(e.target.value as any)}
                  className="mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="al-price">Target price</Label>
              <Input id="al-price" type="number" step="any" placeholder="0.00" className="mt-1.5 h-11 font-mono"
                value={targetPrice} onChange={e => { setTargetPrice(e.target.value); setPriceErr(""); }} />
              {priceErr && <p className="text-xs text-destructive mt-1">{priceErr}</p>}
            </div>
            <div>
              <Label htmlFor="al-note">Note (optional)</Label>
              <Input id="al-note" placeholder="e.g. EUR/USD breakout" className="mt-1.5 h-11"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1 bg-gradient-primary shadow-glow hover:opacity-95">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : "Create alert"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <BellOff className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No alerts yet. Create one to get notified on price moves.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {alerts.map(alert => (
              <div key={alert.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${alert.is_triggered ? "bg-profit/15 text-profit" : "bg-primary/15 text-primary"}`}>
                    <BellRing className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{assetSymbol(alert.asset_id)}</span>
                      <span className="text-xs text-muted-foreground">{alert.condition}</span>
                      <span className="font-mono text-sm font-bold">{alert.target_price.toLocaleString()}</span>
                    </div>
                    {alert.note && <p className="text-xs text-muted-foreground truncate">{alert.note}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={`border-0 ${alert.is_triggered ? "bg-profit/20 text-profit" : "bg-primary/15 text-primary"}`}>
                    {alert.is_triggered ? "Triggered" : "Active"}
                  </Badge>
                  <button onClick={() => deleteAlert(alert.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete alert">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
