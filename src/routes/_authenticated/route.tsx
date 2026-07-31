import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  User,
  LogOut,
  Settings,
  HelpCircle,
  History,
  BellRing,
  ShieldCheck,
  ChevronRight,
  CandlestickChart,
  BarChart2,
  Home,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  // Show a layout-matching skeleton while auth check runs (eliminates "error" flash)
  pendingComponent: () => (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex flex-col w-64 border-r border-sidebar-border bg-sidebar shrink-0 animate-pulse">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="h-7 w-32 rounded-lg bg-sidebar-accent" />
        </div>
        <div className="px-4 py-3 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-sidebar-accent shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-sidebar-accent" />
              <div className="h-3 w-12 rounded bg-sidebar-accent/60" />
            </div>
          </div>
        </div>
        <div className="p-3 space-y-1">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-sidebar-accent/50" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 sm:h-16 border-b border-border/60 animate-pulse flex items-center px-4 gap-3">
          <div className="lg:hidden size-9 rounded-lg bg-surface" />
          <div className="lg:hidden h-7 w-28 rounded-lg bg-surface" />
          <div className="ml-auto flex gap-2">
            <div className="h-9 w-32 rounded-lg bg-surface" />
            <div className="size-9 rounded-full bg-surface" />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6 space-y-4 animate-pulse">
          <div className="h-8 w-56 rounded-lg bg-surface" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-surface" />)}
          </div>
          <div className="h-64 rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  ),
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Fetch ALL role rows — admin users may have multiple rows (user + admin)
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const isAdmin = (roleRows ?? []).some((r: any) => r.role === "admin");

    // Always redirect admins to admin panel
    if (isAdmin && !location.pathname.startsWith("/admin")) {
      throw redirect({ to: "/admin/overview" });
    }

    const role = isAdmin ? "admin"
      : (roleRows ?? []).some((r: any) => r.role === "marketer") ? "marketer"
      : (roleRows ?? []).some((r: any) => r.role === "support")  ? "support"
      : "user";

    return { user: data.user, role };
  },
  component: AuthedLayout,
});

// ─── Sidebar nav groups ────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Trading",
    items: [
      { to: "/candle-trade", label: "Candle Predict 🔥 HOT", icon: CandlestickChart },
      { to: "/trade",        label: "Pro Trader",      icon: LineChart },
      { to: "/history",      label: "Trade History",   icon: History },
      { to: "/alerts",       label: "Price Alerts",    icon: BellRing },
    ],
  },
  {
    label: "Funds",
    items: [
      { to: "/wallet",          label: "Wallet",    icon: Wallet },
      { to: "/wallet/deposit",  label: "Deposit",   icon: ArrowDownToLine },
      { to: "/wallet/withdraw", label: "Withdraw",  icon: ArrowUpFromLine },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/support",       label: "Support",        icon: HelpCircle },
    ],
  },
] as const;

function AuthedLayout() {
  const { user } = Route.useRouteContext() as { user: { email?: string; user_metadata?: any } };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAdmin, isLoading: roleLoading } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load real balance + realtime subscription
  useEffect(() => {
    let sub: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const fetchBalance = async (uid: string) => {
      // Only sum the main wallet (single wallet setup)
      const { data: ws } = await supabase
        .from("wallets")
        .select("balance_cents")
        .eq("user_id", uid)
        .eq("wallet_type", "main")
        .single();
      if (ws) setTotalBalance((ws as any).balance_cents ?? 0);
      const { count } = await supabase.from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid).eq("is_read", false);
      setUnreadCount(count ?? 0);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user || cancelled) return;
      const uid = session.user.id;
      fetchBalance(uid);

      // Poll every 8 seconds as a guaranteed fallback for edge cases
      const poll = setInterval(() => { if (!cancelled) fetchBalance(uid); }, 8000);

      // Unique channel name prevents React strict mode double-subscribe errors
      sub = supabase
        .channel(`header-balance-${uid}-${Date.now()}`)
        .on("postgres_changes", {
          event: "UPDATE", schema: "public", table: "wallets",
          filter: `user_id=eq.${uid}`,
        }, (payload) => {
          if ((payload.new as any)?.wallet_type === "main") {
            setTotalBalance((payload.new as any).balance_cents ?? 0);
          }
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "wallets", filter: `user_id=eq.${uid}` }, () => fetchBalance(uid))
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, () => setUnreadCount(n => n + 1))
        .subscribe();

      return () => clearInterval(poll);
    });

    return () => {
      cancelled = true;
      if (sub) supabase.removeChannel(sub);
    };
  }, []);

  const handleLogout = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Trader";
  const initial = displayName.slice(0, 1).toUpperCase();

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  return (
    <div className="h-screen overflow-hidden flex bg-background">
      {/* When on admin routes, skip the trader shell — admin has its own full layout */}
      {/* Also show nothing for admins on non-admin routes (redirect is in flight) */}
      {pathname.startsWith("/admin") ? (
        <div className="flex-1 min-w-0 h-full overflow-y-auto">
          <Outlet />
        </div>
      ) : isAdmin && !roleLoading ? (
        // Admin landed on a user route — beforeLoad redirect is firing, show blank
        <div className="flex-1 flex items-center justify-center">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
      {/* ─── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 h-full border-r border-sidebar-border bg-sidebar shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Logo size="sm" />
        </div>

        {/* User info strip */}
        <div className="px-4 py-3 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-glow shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {roleLoading ? (
                  <span className="h-3.5 w-8 rounded bg-surface animate-pulse" />
                ) : isAdmin ? (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 font-semibold">ADMIN</Badge>
                ) : (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-surface text-muted-foreground border border-border/60">TRADER</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto overscroll-contain">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 font-semibold">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => {
                  const active = pathname === to ||
                    (to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to)) ||
                    (to === "/wallet" && pathname === "/wallet");
                  return (
                    <Link key={to} to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}>
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary/60 px-3 pb-1.5 font-semibold">
                Administration
              </p>
              <Link to="/admin/overview"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${
                  pathname.startsWith("/admin")
                    ? "bg-primary/15 text-primary border-primary/30 font-medium"
                    : "text-primary/70 border-primary/15 hover:bg-primary/10 hover:text-primary"
                }`}>
                <ShieldCheck className="size-4 shrink-0" />
                <span>Admin Panel</span>
                <ChevronRight className="size-3 ml-auto opacity-60" />
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom: Profile / Settings / Logout */}
        <div className="p-3 border-t border-sidebar-border space-y-0.5 shrink-0">
          <Link to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
            <User className="size-4" />Profile
          </Link>
          <Link to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
            <Settings className="size-4" />Settings
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors">
            <LogOut className="size-4" />Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <header className="h-14 sm:h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 hover:bg-surface transition-colors"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <Logo size="sm" />
          </div>

          {/* Desktop: just spacer */}
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin/overview"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                <ShieldCheck className="size-3" />Admin
              </Link>
            )}
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-surface/80 border border-border/60 min-w-0 max-w-[130px] sm:max-w-none">
              <Wallet className="size-3 text-muted-foreground shrink-0 hidden sm:block" />
              <span className="font-mono font-semibold text-xs sm:text-sm tabular-nums transition-all duration-300 truncate">
                {totalBalance === null ? "…" : `KES ${(totalBalance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <Button size="sm" variant="ghost" className="size-9 p-0 relative" asChild>
              <Link to="/notifications">
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </Button>
            <Link to="/profile"
              className="size-9 rounded-full bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shadow-glow">
              {initial}
            </Link>
          </div>
        </header>

        {/* ─── Mobile slide-out drawer ────────────────────────────────────── */}
        {/* Backdrop */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Drawer panel */}
        <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Drawer header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Logo size="sm" />
            <button onClick={() => setMobileMenuOpen(false)}
              className="size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60 transition-colors">
              <X className="size-5" />
            </button>
          </div>

          {/* User strip */}
          <div className="px-4 py-3 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {roleLoading ? <span className="h-3.5 w-8 rounded bg-surface animate-pulse" />
                    : isAdmin
                    ? <Badge className="text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0">ADMIN</Badge>
                    : <Badge className="text-[10px] px-1.5 py-0 h-4 bg-surface text-muted-foreground border border-border/60">TRADER</Badge>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Drawer nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {NAV_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 font-semibold">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ to, label, icon: Icon }) => {
                    const active = pathname === to ||
                      (to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to)) ||
                      (to === "/wallet" && pathname === "/wallet");
                    return (
                      <Link key={to} to={to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                        }`}>
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {isAdmin && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary/60 px-3 pb-1.5 font-semibold">Administration</p>
                <Link to="/admin/overview"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-primary/15 text-primary border-primary/30 font-medium"
                      : "text-primary/70 border-primary/15 hover:bg-primary/10"
                  }`}>
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>Admin Panel</span>
                  <ChevronRight className="size-3 ml-auto opacity-60" />
                </Link>
              </div>
            )}
          </nav>

          {/* Drawer footer */}
          <div className="p-3 border-t border-sidebar-border space-y-0.5">
            <Link to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
              <User className="size-4" />Profile
            </Link>
            <Link to="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
              <Settings className="size-4" />Settings
            </Link>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors">
              <LogOut className="size-4" />Sign out
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 overscroll-contain">
          <Outlet />
        </main>

        {/* ─── Mobile bottom tab bar (quick access) ──────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border pb-[env(safe-area-inset-bottom)]">
          <div className="grid grid-cols-5 max-w-lg mx-auto">
            {[
              { to: "/dashboard",      label: "Home",    icon: LayoutDashboard },
              { to: "/candle-trade",   label: "🔥 Predict", icon: CandlestickChart },
              { to: "/wallet/deposit", label: "Deposit", icon: ArrowDownToLine },
              { to: "/wallet",         label: "Wallet",  icon: Wallet },
              { to: "/profile",        label: "Me",      icon: User },
            ].map(({ to, label, icon: Icon }) => {
              const active = pathname === to ||
                (to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to)) ||
                (to === "/wallet" && pathname === "/wallet");
              return (
                <Link key={to} to={to}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}>
                  <span className={`size-7 rounded-lg flex items-center justify-center transition-colors ${
                    active ? "bg-primary/15" : ""
                  }`}>
                    <Icon className="size-4" />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      </>
      )}
    </div>
  );
}
