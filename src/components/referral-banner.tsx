import { useEffect, useState } from "react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";

export function ReferralBanner() {
  const { getActiveCampaign } = useCampaigns();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      }

      // Only try to load referrals if the table exists
      const { data: referrals, error } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", user.id)
        .eq("status", "completed");

      if (!error && referrals) {
        setReferralCount(referrals.length);
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
    }
  };

  const campaign = getActiveCampaign('referral_bonus');
  
  if (!campaign) return null;

  const bonusAmount = campaign.referral_bonus_cents / 100;
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join DerivGrid',
          text: `Join DerivGrid and get KES ${bonusAmount} bonus! Use my referral link:`,
          url: referralLink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-surface p-5 space-y-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Gift className="size-5 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">
            Referral Bonus — Earn KES {bonusAmount} per friend!
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Share your personal link. When a friend signs up and makes their first deposit, 
            you both win — you get KES {bonusAmount} credited instantly.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          <span>{referralCount} friends referred</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border/40 text-xs font-mono truncate">
            {referralLink}
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={copyLink}
            className="shrink-0 h-9"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="ml-1.5">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
        
        <Button 
          size="sm"
          variant="ghost"
          onClick={shareLink}
          className="w-full"
        >
          <Share2 className="size-3.5 mr-1.5" />
          Share now
        </Button>
      </div>
    </div>
  );
}

// Also add default export for safety
export default ReferralBanner;