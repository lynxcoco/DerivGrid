import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import {
  ArrowRight,
  LineChart,
  ShieldCheck,
  Zap,
  Smartphone,
  TrendingUp,
  Globe2,
  Wallet,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { ASSETS, tick as getNextTick, formatPrice, type Tick } from "@/lib/market-simulator";

const LANDING_WATCHLIST = ["EUR/USD", "BTC/USD", "XAU/USD", "Volatility 75", "AAPL"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DerivGrid — Trade Forex, Indices, Crypto & More" },
      {
        name: "description",
        content:
          "Open a DerivGrid account in minutes. Deposit instantly via M-Pesa or card and trade global markets with professional tools.",
      },
      { property: "og:title", content: "DerivGrid — Trade Smarter" },
      {
        property: "og:description",
        content: "Premium online trading. Forex, indices, crypto, commodities & stocks.",
      },
    ],
  }),
  component: Landing,
});

// Live ticker widget powered by market simulator
function LiveTickerWidget() {
  const assets = ASSETS.filter(a => LANDING_WATCHLIST.includes(a.symbol));
  const [ticks, setTicks] = useState<Record<string, Tick> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const snap: Record<string, Tick> = {};
    assets.forEach(a => { snap[a.symbol] = getNextTick(a); });
    setTicks(snap);

    timerRef.current = setInterval(() => {
      setTicks(prev => {
        const next = { ...(prev ?? {}) };
        assets.forEach(a => { next[a.symbol] = getNextTick(a); });
        return next;
      });
    }, 1200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-elevated p-5 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live markets</span>
        <span className="size-2 rounded-full bg-profit animate-pulse" />
      </div>
      <div className="space-y-3">
        {LANDING_WATCHLIST.map(sym => {
          const t = ticks?.[sym];
          const asset = ASSETS.find(a => a.symbol === sym);
          const up = (t?.changePct ?? 0) >= 0;
          return (
            <div key={sym} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <span className="font-medium text-sm">{sym}</span>
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="text-foreground tabular-nums">
                  {t && asset ? formatPrice(t.price, asset.pipSize) : <span className="inline-block w-20 h-4 rounded bg-muted/40 animate-pulse" />}
                </span>
                <span className={`text-xs font-semibold w-14 text-right ${up ? "text-profit" : "text-loss"}`}>
                  {t ? `${up ? "+" : ""}${t.changePct.toFixed(2)}%` : <span className="inline-block w-10 h-3 rounded bg-muted/40 animate-pulse" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const categories = [
  { icon: BarChart3, name: "Synthetic Indices", desc: "24/7 simulated markets", count: "20+" },
  { icon: TrendingUp, name: "Volatility Indices", desc: "Constant volatility exposure", count: "15+" },
  { icon: LineChart, name: "Commodities", desc: "Gold, silver, oil & more", count: "12+" },
  { icon: Zap, name: "Cryptocurrency", desc: "BTC, ETH and top altcoins", count: "30+" },
  { icon: BarChart3, name: "Stocks & Indices", desc: "Global blue-chip equities", count: "100+" },
];

const features = [
  {
    icon: Zap,
    title: "Instant deposits",
    desc: "Fund your account in seconds with M-Pesa STK push or international cards.",
  },
  {
    icon: LineChart,
    title: "Pro-grade charts",
    desc: "Candlestick charts, multiple timeframes and technical indicators built in.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-level security",
    desc: "Encrypted sessions, secure authentication and full activity logging.",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    desc: "A premium experience on every device — trade from anywhere.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const parseParams = (str: string) => new URLSearchParams(str.replace(/^[?#]/, ""));

    const qp = parseParams(window.location.search);
    const hp = parseParams(window.location.hash);

    const errorCode = qp.get("error_code") || hp.get("error_code");
    const error = qp.get("error") || hp.get("error");

    if (error || errorCode) {
      window.history.replaceState({}, "", "/");
      navigate({ to: "/reset-password" });
    }

    const accessToken = hp.get("access_token");
    const type = hp.get("type") || qp.get("type");
    if (accessToken && type === "recovery") {
      window.history.replaceState({}, "", "/");
      navigate({ to: "/reset-password" });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#markets" className="relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Markets</a>
            <a href="#features" className="relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Features</a>
            <a href="#pricing" className="relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth" search={{ tab: "register" }}>
                Get started
              </Link>
            </Button>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-sidebar border-l border-sidebar-border flex flex-col p-4">
              <div className="flex items-center justify-between mb-6">
                <Logo size="sm" />
                <button onClick={() => setMobileNavOpen(false)} className="size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4 text-sm">
                <a href="#markets" onClick={() => setMobileNavOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors py-2">Markets</a>
                <a href="#features" onClick={() => setMobileNavOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors py-2">Features</a>
                <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors py-2">Pricing</a>
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/auth" search={{ tab: "register" }}>Get started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-70" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24 sm:pt-20 lg:pt-28 lg:pb-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <span className="size-1.5 rounded-full bg-profit animate-pulse" />
              Live markets · Real-time pricing
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] sm:leading-[1.08]">
              Trade global markets with
              <span className="block bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                professional precision.
              </span>
            </h1>
            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              DerivGrid gives you everything a serious trader needs — live forex,
              synthetic & volatility indices, crypto, commodities and stocks. Fund
              instantly via M-Pesa or card and start trading in minutes.
            </p>
            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="h-12 px-6 w-full sm:w-auto">
                <Link to="/auth" search={{ tab: "register" }}>
                  Open free account
                  <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6 w-full sm:w-auto">
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg">
              <Stat label="Markets" value="200+" />
              <Stat label="Avg. execution" value="<25ms" />
              <Stat label="Uptime" value="99.99%" />
            </div>
          </div>

          {/* Floating tickers preview — hidden on tablet and below */}
          <div className="hidden xl:block absolute right-6 top-24 w-[420px]">
            <LiveTickerWidget />
          </div>
        </div>
      </section>

      {/* Asset categories */}
      <section id="markets" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Every market, one platform.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Diversify across asset classes from a single account with unified margin.
          </p>
        </div>
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ icon: Icon, name, desc, count }) => (
            <div
              key={name}
              className="group relative rounded-2xl border border-border/60 bg-gradient-surface p-5 sm:p-6 shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex size-10 sm:size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:bg-primary/25 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">{count}</span>
              </div>
              <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Built for traders who care about execution.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Every detail — from chart rendering to order routing — is engineered to
              feel fast, calm and trustworthy.
            </p>
            <div className="mt-6 sm:mt-8 grid sm:grid-cols-2 gap-4 sm:gap-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-border/60 bg-surface/60 p-4 sm:p-5">
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-3 font-semibold text-sm sm:text-base">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-gradient-surface p-2 shadow-elevated">
            <div className="rounded-2xl bg-background/60 p-5 sm:p-6 h-full">
              <LivePriceDisplay />
              <svg viewBox="0 0 400 160" className="mt-6 w-full h-32 sm:h-40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.17 162)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.72 0.17 162)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,75 L280,40 L320,55 L360,30 L400,45 L400,160 L0,160 Z"
                  fill="url(#g)"
                />
                <path
                  d="M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,75 L280,40 L320,55 L360,30 L400,45"
                  fill="none"
                  stroke="oklch(0.72 0.17 162)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-surface p-8 sm:p-12 lg:p-14 shadow-elevated text-center">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
              Ready to trade smarter?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Create an account in minutes. No KYC required to start — deposit and
              begin trading instantly.
            </p>
            <Button size="lg" asChild className="mt-6 sm:mt-8 h-12 px-6 sm:px-7 w-full sm:w-auto">
              <Link to="/auth" search={{ tab: "register" }}>
                Open your account
                <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © 2026 DerivGrid. All rights reserved. Trading involves risk.
          </p>
        </div>
      </footer>
    </div>
  );
}

function LivePriceDisplay() {
  const btcAsset = ASSETS.find(a => a.symbol === "BTC/USD")!;
  const [t, setT] = useState<Tick | null>(null);
  useEffect(() => {
    setT(getNextTick(btcAsset));
    const id = setInterval(() => setT(getNextTick(btcAsset)), 1500);
    return () => clearInterval(id);
  }, []);
  const up = (t?.changePct ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">BTC/USD</p>
        {t ? (
          <>
            <p className="text-2xl font-mono font-semibold mt-1">{formatPrice(t.price, btcAsset.pipSize)}</p>
            <p className={`text-sm font-mono ${up ? "text-profit" : "text-loss"}`}>
              {up ? "+" : ""}{t.change.toFixed(2)} ({up ? "+" : ""}{t.changePct.toFixed(2)}%)
            </p>
          </>
        ) : (
          <>
            <div className="h-8 w-36 rounded bg-muted/40 animate-pulse mt-1" />
            <div className="h-4 w-24 rounded bg-muted/40 animate-pulse mt-1" />
          </>
        )}
      </div>
      <Wallet className="size-8 text-primary/40" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl sm:text-2xl font-bold font-mono">{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
