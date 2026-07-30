import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/assets")({
  head: () => ({ meta: [{ title: "Assets · Admin" }] }),
  component: AdminAssets,
});

type AssetRow = { id: string; symbol: string; name: string; category: string; is_active: boolean; pip_size: number; created_at: string; };

const CAT_COLOR: Record<string, string> = {
  forex:     "bg-primary/15 text-primary",
  crypto:    "bg-warning/20 text-warning",
  synthetic: "bg-profit/15 text-profit",
  commodity: "bg-loss/15 text-loss",
  stock:     "bg-muted/30 text-muted-foreground",
  index:     "bg-accent/30 text-accent-foreground",
};

function AdminAssets() {
  const [assets,  setAssets]  = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("assets").select("*").order("category").order("symbol");
    setAssets((data as AssetRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, current: boolean) => {
    await supabase.from("assets").update({ is_active: !current }).eq("id", id);
    setAssets(p => p.map(a => a.id === id ? { ...a, is_active: !current } : a));
    toast.success(`Asset ${current ? "disabled" : "enabled"}`);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Assets</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{assets.length} tradeable instruments</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
      ) : (
        <>
          {/* ── Desktop table (sm+) ── */}
          <div className="hidden sm:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase">
                  <th className="text-left px-5 py-3 font-semibold">Symbol</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-right px-4 py-3 font-semibold">Pip size</th>
                  <th className="text-center px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id} className="border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0">
                    <td className="px-5 py-3 font-semibold font-mono">{a.symbol}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{a.name}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs border-0 capitalize ${CAT_COLOR[a.category] ?? ""}`}>{a.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{a.pip_size}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${a.is_active ? "text-profit" : "text-muted-foreground"}`}>
                        {a.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toggle(a.id, a.is_active)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {a.is_active ? <ToggleRight className="size-5 text-profit" /> : <ToggleLeft className="size-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards (< sm) ── */}
          <div className="sm:hidden space-y-2">
            {assets.map(a => (
              <div key={a.id} className="rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm">{a.symbol}</span>
                    <Badge className={`text-[10px] border-0 capitalize ${CAT_COLOR[a.category] ?? ""}`}>{a.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pip: {a.pip_size}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-xs font-semibold ${a.is_active ? "text-profit" : "text-muted-foreground"}`}>
                    {a.is_active ? "Active" : "Disabled"}
                  </span>
                  <button onClick={() => toggle(a.id, a.is_active)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {a.is_active ? <ToggleRight className="size-6 text-profit" /> : <ToggleLeft className="size-6" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
