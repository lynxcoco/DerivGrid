import { useEffect, useState } from "react";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Sparkles, Timer, TrendingUp, Zap } from "lucide-react";

export function CampaignBanner() {
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

      // Calculate total duration
      const start = campaign.starts_at ? new Date(campaign.starts_at) : new Date(campaign.created_at);
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      
      setProgress(Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)));

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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-5 sm:p-6 shadow-card">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-4 -right-4 size-32 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-profit/10 animate-pulse delay-300" />
      </div>
      
      <div className="relative space-y-4">
        {/* Header */}
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

        {/* Offer details */}
        <div className="bg-surface/50 rounded-xl p-3 border border-border/40">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deposit <strong className="text-foreground">KES {minDeposit.toLocaleString()}</strong> –{" "}
            <strong className="text-foreground">KES {maxDeposit.toLocaleString()}</strong> and we match it{" "}
            <strong className="text-profit">100%</strong> — your money doubles instantly!{" "}
            Maximum bonus <strong className="text-foreground">KES {maxBonus.toLocaleString()}</strong>.
          </p>
        </div>

        {/* Timer and progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <Timer className="size-4 text-primary" />
              <span className="text-muted-foreground">Ends in:</span>
              <span className="font-mono font-bold text-primary">{timeLeft}</span>
            </div>
            <span className="text-muted-foreground/60">{progress.toFixed(0)}% elapsed</span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-surface overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-profit to-primary rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => window.location.href = '/wallet/deposit'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Zap className="size-4" />
          Deposit Now
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}