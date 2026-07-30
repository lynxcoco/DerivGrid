import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// ── Full-screen layout skeleton (shown during initial auth check) ─────────────
function GlobalPendingComponent() {
  return (
    <div className="min-h-screen flex bg-background animate-pulse">
      <div className="hidden lg:flex flex-col w-64 border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="h-7 w-32 rounded-lg bg-sidebar-accent" />
        </div>
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-sidebar-accent/60"
              style={{ width: `${60 + Math.sin(i) * 20}%` }} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border/60 bg-background flex items-center px-6 gap-4">
          <div className="ml-auto flex gap-3">
            <div className="h-8 w-28 rounded-lg bg-surface" />
            <div className="h-8 w-8 rounded-full bg-surface" />
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-64 rounded-lg bg-surface" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}

// ── Page-level content shimmer (fast navigations between pages) ───────────────
function PageTransitionSkeleton() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 animate-pulse space-y-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-surface" />
          <div className="h-4 w-64 rounded-lg bg-surface/70" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-surface hidden sm:block" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-surface" />
        <div className="h-64 rounded-2xl bg-surface" />
      </div>
      <div className="h-48 rounded-2xl bg-surface" />
    </div>
  );
}

// ── Route error boundary — suppresses transient React reconciliation errors ───
function RouteErrorBoundary({ error }: { error: Error }) {
  // "Rendered fewer/more hooks" are transient React reconciliation artifacts
  // during fast navigation — show a skeleton instead of an error page
  const isTransient =
    !error?.message ||
    error.message.includes("rendered fewer hooks") ||
    error.message.includes("rendered more hooks") ||
    error.message.includes("Minified React error") ||
    error.message.includes("Cannot update a component");

  if (isTransient) {
    return <PageTransitionSkeleton />;
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="text-center max-w-sm space-y-3">
        <div className="size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto text-xl font-bold">!</div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{error?.message ?? "An unexpected error occurred."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,
    defaultPreload: "intent",
    defaultPendingComponent: GlobalPendingComponent,
    defaultPendingMs: 300,      // Only show skeleton after 300ms — fast loads never see it
    defaultPendingMinMs: 200,   // Keep at least 200ms to avoid flicker on dismiss
    defaultErrorComponent: RouteErrorBoundary,
  });

  return router;
};
