import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Info, TrendingUp, ArrowDownToLine, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications · DerivGrid" }] }),
  component: NotificationsPage,
});

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICON: Record<string, any> = {
  trade: TrendingUp,
  deposit: ArrowDownToLine,
  alert: AlertTriangle,
  info: Info,
};

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setItems((data as Notification[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setItems((p) => p.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setItems((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="size-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">You're all caught up — no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Info;
              return (
                <button
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-surface/50 ${!n.is_read ? "bg-primary/5" : ""}`}
                >
                  <span className={`mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${!n.is_read ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground"}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  {!n.is_read && <span className="mt-2 size-2 rounded-full bg-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
