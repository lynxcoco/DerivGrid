import { useEffect, useState } from "react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Sparkles, Timer, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface CampaignBannerProps {
  showCTA?: boolean;
}

export function CampaignBanner({ showCTA = true }: CampaignBannerProps) {
  const { getActiveCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const active = getActiveCampaign('deposit_double');
    setCampaign(active);
  }, [getActiveCampaign]);

  useEffect(() => {
    if (!campaign?.ends_at) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(campaign.ends_at);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Ended");
        setProgress(0);
        return;
      }

      const start = campaign.starts_at ? new Date(campaign.starts_at) : new Date(campaign.created_at);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      
      // Progress starts at 100% and decreases to 0%
      const remaining = Math.max(0, Math.min(100, 100 - (elapsed / totalDuration) * 100));
      setProgress(remaining);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign?.ends_at, campaign?.starts_at, campaign?.created_at]);

  if (!campaign) return null;

  const minDeposit = campaign.min_deposit_cents / 100;
  const maxDeposit = campaign.max_deposit_cents / 100;
  const maxBonus = campaign.max_bonus_cents / 100;

  // Calculate color based on remaining progress
  const getProgressColor = () => {
    if (progress > 50) return "bg-profit"; // Green
    if (progress > 25) return "bg-warning"; // Yellow/Orange
    return "bg-loss"; // Red
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-5 sm:p-6 shadow-card">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-4 -right-4 size-32 rounded-full bg-primary/20 animate-pulse" />
      </div>
      
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="size-5 text-primary" />
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Deposit Doubling is LIVE!
              </h3>
              <span className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-profit/15 text-profit text-xs font-semibold">
                <span className="size-1.5 rounded-full bg-profit animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface/50 rounded-xl p-3 border border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deposit <strong className="text-foreground">more than KES {minDeposit.toLocaleString()}</strong> and{" "}
            <strong className="text-profit">You get double of your deposit amount instantly!</strong>{" "}
            Maximum bonus <strong className="text-foreground">KES {maxBonus.toLocaleString()}</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Timer className="size-4 text-primary" />
            <span className="text-muted-foreground">Ends in:</span>
            <span className="font-mono font-bold text-primary">{timeLeft}</span>
          </div>
          
          {/* Countdown progress bar - starts full and empties */}
          <div className="relative h-2 rounded-full bg-surface overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {showCTA && (
          <Link
            to="/wallet/deposit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Zap className="size-4" />
            Deposit Now
          </Link>
        )}
      </div>
    </div>
  );
}

export default CampaignBanner;