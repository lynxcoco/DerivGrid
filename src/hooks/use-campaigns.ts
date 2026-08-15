import { useState, useEffect, useCallback, useRef } from "react";
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

// Simple module-level cache to prevent multiple fetches
let cachedCampaigns: Campaign[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(cachedCampaigns || []);
  const [loading, setLoading] = useState(!cachedCampaigns);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadCampaigns = useCallback(async (force = false) => {
    // Check cache first
    if (!force && cachedCampaigns && Date.now() - lastFetchTime < CACHE_DURATION) {
      setCampaigns(cachedCampaigns);
      setLoading(false);
      return;
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        cachedCampaigns = data as Campaign[];
        lastFetchTime = Date.now();
        if (mountedRef.current) {
          setCampaigns(data as Campaign[]);
        }
      }
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      if (mountedRef.current) {
        setError(error?.message || "Failed to load campaigns");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial load
    loadCampaigns();
    
    // Poll every 60 seconds instead of realtime
    const interval = setInterval(() => {
      loadCampaigns(true);
    }, CACHE_DURATION);
    
    // Cleanup
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
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