import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/hooks/use-role";
import { usePlatformSettings } from "@/hooks/use-platform-settings";

// Routes that stay reachable during maintenance so people can still sign in.
const AUTH_ROUTES = ["/auth", "/forgot-password"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
          <span className="text-2xl font-extrabold">404</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  // Transient React reconciliation errors (hooks count changes during navigation)
  // should never show an error page — just silently retry
  const isTransient =
    !error?.message ||
    error.message.includes("rendered fewer hooks") ||
    error.message.includes("rendered more hooks") ||
    error.message.includes("Minified React error");

  useEffect(() => {
    console.error("[ErrorBoundary]", error);
    if (isTransient) {
      const t = setTimeout(() => { router.invalidate(); reset(); }, 100);
      return () => clearTimeout(t);
    }
  }, [error, isTransient, router, reset]);

  if (isTransient) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4">
          <span className="text-xl font-bold">!</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-95"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function MaintenanceScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow opacity-40" aria-hidden />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-primary tracking-wider uppercase">
          DerivGrid
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
          Making things even better...
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We're rolling out improvements to speed and stability. Your funds and
          account data are safe — this is routine maintenance.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          We expect to be back shortly. Thanks for your patience.
        </p>
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Upgrade in progress
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0B0F1A" },
      { title: "DerivGrid — Professional Online Trading Platform" },
      {
        name: "description",
        content:
          "Trade forex, synthetic indices, commodities, crypto and stocks on DerivGrid — a premium online brokerage with instant deposits via M-Pesa & card.",
      },
      { name: "author", content: "DerivGrid" },
      { property: "og:title", content: "DerivGrid — Professional Online Trading Platform" },
      {
        property: "og:description",
        content:
          "A premium online trading platform with live markets, fast deposits and an enterprise-grade experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@DerivGrid" },
      { name: "twitter:title", content: "DerivGrid — Professional Online Trading Platform" },
      { name: "description", content: "A modern financial trading web app for immediate trading with secure login and fund deposits." },
      { property: "og:description", content: "A modern financial trading web app for immediate trading with secure login and fund deposits." },
      { name: "twitter:description", content: "A modern financial trading web app for immediate trading with secure login and fund deposits." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Critical: prevent white flash before CSS loads */}
        <style dangerouslySetInnerHTML={{ __html:
          `html,body{background-color:oklch(0.17 0.012 165);color:oklch(0.96 0.006 180);color-scheme:dark;margin:0;padding:0;font-family:Inter,system-ui,sans-serif}`
        }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const { isAdmin, isLoading: roleLoading } = useRole();
  const { settings, loaded: settingsLoaded } = usePlatformSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    // Debounce router invalidation — don't re-run on every auth tick
    let pending = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (pending) return;
      pending = true;
      // Small delay so Supabase session is fully written before we invalidate
      setTimeout(() => {
        pending = false;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }, 100);
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  // Maintenance mode is read from DB platform_settings — admins are always exempt
  const maintenanceMode = settingsLoaded ? settings.maintenance_mode : false;
  const bypassMaintenance = isAuthRoute || isAdmin;

  if (maintenanceMode && !roleLoading && settingsLoaded && !bypassMaintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" theme="dark" richColors duration={3000} />
    </QueryClientProvider>
  );
}