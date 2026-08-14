import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, DollarSign, Gift, Save, Sparkles, Timer, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/campaigns")({
  head: () => ({ meta: [{ title: "Campaigns · Admin" }] }),
  component: CampaignManagement,
});

function CampaignManagement() {
  const { campaigns, loading, loadCampaigns } = useCampaigns();
  const [saving, setSaving] = useState(false);
  
  // Deposit Double Campaign State
  const [ddActive, setDdActive] = useState(false);
  const [ddMinDeposit, setDdMinDeposit] = useState("1000");
  const [ddMaxDeposit, setDdMaxDeposit] = useState("25000");
  const [ddBonusPercent, setDdBonusPercent] = useState("100");
  const [ddMaxBonus, setDdMaxBonus] = useState("25000");
  const [ddStartTime, setDdStartTime] = useState("");
  const [ddEndTime, setDdEndTime] = useState("");
  
  // Referral Campaign State
  const [refActive, setRefActive] = useState(false);
  const [refBonus, setRefBonus] = useState("100");

  useEffect(() => {
    if (campaigns.length > 0) {
      loadCampaignData();
    }
  }, [campaigns]);

  const loadCampaignData = () => {
    const ddCampaign = campaigns.find(c => c.type === 'deposit_double');
    if (ddCampaign) {
      setDdActive(ddCampaign.is_active);
      setDdMinDeposit(String(ddCampaign.min_deposit_cents / 100));
      setDdMaxDeposit(String(ddCampaign.max_deposit_cents / 100));
      setDdBonusPercent(String(ddCampaign.bonus_percentage));
      setDdMaxBonus(String(ddCampaign.max_bonus_cents / 100));
      setDdStartTime(ddCampaign.starts_at ? new Date(ddCampaign.starts_at).toISOString().slice(0, 16) : "");
      setDdEndTime(ddCampaign.ends_at ? new Date(ddCampaign.ends_at).toISOString().slice(0, 16) : "");
    }

    const refCampaign = campaigns.find(c => c.type === 'referral_bonus');
    if (refCampaign) {
      setRefActive(refCampaign.is_active);
      setRefBonus(String(refCampaign.referral_bonus_cents / 100));
    }
  };

  const saveCampaign = async (type: 'deposit_double' | 'referral_bonus') => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (type === 'deposit_double') {
        // Validate inputs
        const minDep = parseFloat(ddMinDeposit);
        const maxDep = parseFloat(ddMaxDeposit);
        const bonusPct = parseFloat(ddBonusPercent);
        const maxBonus = parseFloat(ddMaxBonus);
        
        if (isNaN(minDep) || minDep < 0) throw new Error("Invalid minimum deposit");
        if (isNaN(maxDep) || maxDep < minDep) throw new Error("Invalid maximum deposit");
        if (isNaN(bonusPct) || bonusPct < 0 || bonusPct > 500) throw new Error("Bonus percentage must be between 0-500%");
        if (isNaN(maxBonus) || maxBonus < 0) throw new Error("Invalid maximum bonus");
        
        const existingCampaign = campaigns.find(c => c.type === 'deposit_double');
        
        const campaignData = {
          type: 'deposit_double',
          name: 'Deposit Doubling',
          is_active: ddActive,
          min_deposit_cents: Math.round(minDep * 100),
          max_deposit_cents: Math.round(maxDep * 100),
          bonus_percentage: bonusPct,
          max_bonus_cents: Math.round(maxBonus * 100),
          starts_at: ddStartTime ? new Date(ddStartTime).toISOString() : new Date().toISOString(),
          ends_at: ddEndTime ? new Date(ddEndTime).toISOString() : null,
          updated_at: new Date().toISOString(),
          created_by: user?.id,
        };
        
        if (existingCampaign) {
          await supabase.from("campaigns").update(campaignData).eq("id", existingCampaign.id);
        } else {
          const { data, error } = await supabase.from("campaigns").insert(campaignData).select();
          if (error) throw error;
        }
      } else {
        // Referral campaign
        const bonus = parseFloat(refBonus);
        if (isNaN(bonus) || bonus < 0) throw new Error("Invalid referral bonus");
        
        const existingCampaign = campaigns.find(c => c.type === 'referral_bonus');
        
        const campaignData = {
          type: 'referral_bonus',
          name: 'Referral Bonus',
          is_active: refActive,
          referral_bonus_cents: Math.round(bonus * 100),
          updated_at: new Date().toISOString(),
          created_by: user?.id,
        };
        
        if (existingCampaign) {
          await supabase.from("campaigns").update(campaignData).eq("id", existingCampaign.id);
        } else {
          const { data, error } = await supabase.from("campaigns").insert(campaignData).select();
          if (error) throw error;
        }
      }

      toast.success(`${type === 'deposit_double' ? 'Deposit doubling' : 'Referral bonus'} campaign saved!`);
      await loadCampaigns();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl mx-auto">
        <div className="h-10 w-56 bg-muted/20 rounded-xl animate-pulse" />
        <div className="h-4 w-72 bg-muted/20 rounded animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-64 bg-muted/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-12 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-0 size-9">
          <Link to="/admin"><ArrowLeft className="size-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="size-5 sm:size-6 text-primary" />
            Campaign Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Activate and configure promotional campaigns. Changes take effect immediately.
          </p>
        </div>
      </div>

      {/* Deposit Doubling Campaign */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-primary/5">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-primary/12 flex items-center justify-center">
              <Timer className="size-4 text-primary" />
            </span>
            <div>
              <h2 className="font-semibold text-sm sm:text-base">Deposit Doubling</h2>
              <p className="text-xs text-muted-foreground">Match user deposits with bonus</p>
            </div>
          </div>
          <Switch checked={ddActive} onCheckedChange={setDdActive} />
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <DollarSign className="size-3.5" /> Min Deposit (KES)
              </Label>
              <Input 
                type="number" 
                value={ddMinDeposit}
                onChange={e => setDdMinDeposit(e.target.value)}
                className="h-10 font-mono"
                placeholder="1000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <DollarSign className="size-3.5" /> Max Deposit (KES)
              </Label>
              <Input 
                type="number" 
                value={ddMaxDeposit}
                onChange={e => setDdMaxDeposit(e.target.value)}
                className="h-10 font-mono"
                placeholder="25000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <TrendingUp className="size-3.5" /> Bonus Percentage (%)
              </Label>
              <Input 
                type="number" 
                value={ddBonusPercent}
                onChange={e => setDdBonusPercent(e.target.value)}
                className="h-10 font-mono"
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <DollarSign className="size-3.5" /> Max Bonus (KES)
              </Label>
              <Input 
                type="number" 
                value={ddMaxBonus}
                onChange={e => setDdMaxBonus(e.target.value)}
                className="h-10 font-mono"
                placeholder="25000"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Start Date & Time
              </Label>
              <Input 
                type="datetime-local" 
                value={ddStartTime}
                onChange={e => setDdStartTime(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Clock className="size-3.5" /> End Date & Time
              </Label>
              <Input 
                type="datetime-local" 
                value={ddEndTime}
                onChange={e => setDdEndTime(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <Button 
            onClick={() => saveCampaign('deposit_double')}
            disabled={saving}
            className="w-full sm:w-auto h-10 px-6 bg-gradient-primary shadow-glow hover:opacity-95"
          >
            <Save className="size-4 mr-2" />
            Save Deposit Campaign
          </Button>
        </div>
      </div>

      {/* Referral Campaign */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-primary/5">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-primary/12 flex items-center justify-center">
              <Gift className="size-4 text-primary" />
            </span>
            <div>
              <h2 className="font-semibold text-sm sm:text-base">Referral Bonus</h2>
              <p className="text-xs text-muted-foreground">Reward users for referring friends</p>
            </div>
          </div>
          <Switch checked={refActive} onCheckedChange={setRefActive} />
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5">
              <Users className="size-3.5" /> Bonus per Referral (KES)
            </Label>
            <Input 
              type="number" 
              value={refBonus}
              onChange={e => setRefBonus(e.target.value)}
              className="h-10 font-mono"
              placeholder="100"
            />
            <p className="text-xs text-muted-foreground">
              Both the referrer and referred user receive this bonus.
            </p>
          </div>

          <Button 
            onClick={() => saveCampaign('referral_bonus')}
            disabled={saving}
            className="w-full sm:w-auto h-10 px-6 bg-gradient-primary shadow-glow hover:opacity-95"
          >
            <Save className="size-4 mr-2" />
            Save Referral Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}