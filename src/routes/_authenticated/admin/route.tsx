import { createFileRoute, Outlet, redirect, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine,
  LineChart, Settings, FileText, ShieldCheck, Megaphone,
  HelpCircle, BarChart2, Menu, X, ChevronRight, Smartphone,
  LogOut,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return {};
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data, error } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (error || !data) throw redirect({ to: "/dashboard", search: { _adminDenied: "1" } as any });
    return { adminUser: user };
  },
  component: AdminLayout,
});

const NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { to: "/admin/overview",  label: "Overview", icon: LayoutDashboard },
      { to: "/admin/reports",   label: "Reports",  icon: FileText },
    ],
  },
  {
    label: "Users",
    items: [
      { to: "/admin/users",         label: "All Users",      icon: Users },
      { to: "/admin/announcements", label: "Announcements",  icon: Megaphone },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/admin/deposits",    label: "Deposits",    icon: ArrowDownToLine },
      { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
      { to: "/admin/trades",      label: "Trades",      icon: LineChart },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/admin/assets",  label: "Assets",          icon: BarChart2  },
      { to: "/admin/tickets", label: "Support Tickets",  icon: HelpCircle },
      { to: "/admin/audit",   label: "Audit Log",        icon: ShieldCheck },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/platform-settings", label: "Platform Settings", icon: Settings    },
      { to: "/admin/payment-config",    label: "Payment Config",    icon: Smartphone  },
    ],
  },
] as const;

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

function AdminLayout() {
  const pathname   = useRouterState({ select: s => s.location.pathname });
  const navigate   = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  useEffect(() => {
    if (pathname === "/admin" || pathname === "/admin/") {
      navigate({ to: "/admin/overview", replace: true });
    }
  }, [pathname, navigate]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const currentItem = ALL_NAV.find(n => pathname.startsWith(n.to));
  const currentPage = currentItem?.label ?? "Admin";

  const NavLinks = () => (
    <nav className="flex-1 overflow-y-auto px-2 py-3 overscroll-contain">
      {NAV_GROUPS.map(group => (
        <div key={group.label} className="mb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 py-2 mt-1 select-none">
            {group.label}
          </p>
          {group.items.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to} to={to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${
                  active
                    ? "bg-primary/12 text-primary font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 transition-colors ${active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}`} />
                <span className="truncate">{label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    /*
     * KEY FIX: h-screen + overflow-hidden on the root keeps the layout
     * viewport-locked. The sidebar never scrolls with the page content.
     * Only the <main> column scrolls independently via overflow-y-auto.
     */
    <div className="h-screen overflow-hidden flex bg-background">

      {/* ── Desktop sidebar — fixed height, never scrolls with content ── */}
      <aside className="hidden lg:flex flex-col w-60 h-full border-r border-sidebar-border bg-sidebar shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border gap-3 shrink-0">
          <Logo size="sm" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Panel</span>
            <span className="text-[10px] text-muted-foreground">DerivGrid</span>
          </div>
        </div>

        <NavLinks />

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-loss/10 hover:text-loss transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-out drawer ── */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Admin</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60 transition-colors"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <NavLinks />

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-loss/10 hover:text-loss transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* ── Main content column ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Sticky top bar */}
        <header className="h-14 border-b border-border/60 bg-background/90 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-3 shrink-0 z-30">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 hover:bg-surface transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="hidden lg:block text-xs text-muted-foreground shrink-0">Admin</span>
            <ChevronRight className="hidden lg:block size-3 text-muted-foreground/50 shrink-0" />
            <span className="text-sm font-semibold truncate">{currentPage}</span>
          </div>
        </header>

        {/* Scrollable page content — ONLY this area scrolls */}
        <main className="flex-1 overflow-y-auto bg-background/50 overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
