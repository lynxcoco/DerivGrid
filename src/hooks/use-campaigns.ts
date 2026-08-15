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
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setCampaigns(data as Campaign[]);
      }
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      setError(error?.message || "Failed to load campaigns");
      // Keep existing campaigns if there was an error
      setCampaigns(prev => prev);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadCampaigns();
    
    // Set up realtime subscription with correct order
    const channel = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'campaigns' 
        },
        (payload) => {
          console.log('Campaign change detected:', payload.eventType);
          // Reload campaigns when any change occurs
          loadCampaigns();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to campaign changes');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to campaign changes');
          // Fallback to polling if realtime fails
          const pollInterval = setInterval(() => {
            loadCampaigns();
          }, 30000); // Poll every 30 seconds
          
          // Store interval for cleanup
          (window as any).__campaignPollInterval = pollInterval;
        }
      });
    
    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
      // Clear polling interval if it exists
      if ((window as any).__campaignPollInterval) {
        clearInterval((window as any).__campaignPollInterval);
        delete (window as any).__campaignPollInterval;
      }
    };
  }, [loadCampaigns]);

  const getActiveCampaign = useCallback((type: 'deposit_double' | 'referral_bonus') => {
    const now = new Date();
    const active = campaigns.find(c => 
      c.type === type && 
      c.is_active && 
      (!c.starts_at || new Date(c.starts_at) <= now) &&
      (!c.ends_at || new Date(c.ends_at) > now)
    );
    return active || null;
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
    error,
    loadCampaigns, 
    getActiveCampaign,
    calculateDepositBonus 
  };
}