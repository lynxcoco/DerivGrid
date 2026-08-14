import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Campaign = {
  id: string;
  type: 'deposit_double' | 'referral_bonus';
  name: string;
  is_active: boolean;
  min_deposit_cents: number;
  max_deposit_cents: number;
  bonus_percentage: number;
  max_bonus_cents: number;
  referral_bonus_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      if (data) {
        setCampaigns(data as Campaign[]);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    
    // Subscribe to campaign changes
    const channel = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaigns' },
        () => {
          loadCampaigns();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCampaigns]);

  const getActiveCampaign = useCallback((type: 'deposit_double' | 'referral_bonus') => {
    const now = new Date();
    return campaigns.find(c => 
      c.type === type && 
      c.is_active && 
      (!c.starts_at || new Date(c.starts_at) <= now) &&
      (!c.ends_at || new Date(c.ends_at) > now)
    ) || null;
  }, [campaigns]);

  const calculateDepositBonus = useCallback((amountCents: number): number => {
    const campaign = getActiveCampaign('deposit_double');
    if (!campaign) return 0;
    
    if (amountCents < campaign.min_deposit_cents || 
        amountCents > campaign.max_deposit_cents) {
      return 0;
    }
    
    const bonus = Math.floor(amountCents * (campaign.bonus_percentage / 100));
    return Math.min(bonus, campaign.max_bonus_cents);
  }, [getActiveCampaign]);

  return { 
    campaigns, 
    loading, 
    loadCampaigns, 
    getActiveCampaign,
    calculateDepositBonus 
  };
}