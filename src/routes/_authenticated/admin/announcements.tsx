import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone, Trash2, Loader2, Plus, X, Users, Info,
  AlertTriangle, CheckCircle, Bell,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  head: () => ({ meta: [{ title: "Announcements · Admin" }] }),
  component: AdminAnnouncements,
});

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
};

type AnnouncementType = "announcement" | "info" | "warning" | "success";

const TYPE_OPTIONS: { value: AnnouncementType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "announcement", label: "General",  icon: Megaphone,      color: "text-primary"  },
  { value: "info",         label: "Info",     icon: Info,           color: "text-blue-400" },
  { value: "warning",      label: "Warning",  icon: AlertTriangle,  color: "text-warning"  },
  { value: "success",      label: "Good news",icon: CheckCircle,    color: "text-profit"   },
];

const TYPE_BADGE: Record<string, string> = {
  announcement: "bg-primary/15 text-primary",
  info:         "bg-blue-400/15 text-blue-400",
  warning:      "bg-warning/15 text-warning",
  success:      "bg-profit/15 text-profit",
};

function AdminAnnouncements() {
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [annType, setAnnType] = useState<AnnouncementType>("announcement");
  const [userCount, setUserCount] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);

    // Also fetch total user count for the "broadcast to N users" display
    const [notifRes, countRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, title, body, type, created_at")
        .in("type", ["announcement", "info", "warning", "success"])
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    setUserCount(countRes.count ?? 0);

    // Deduplicate by title + same minute (one entry per broadcast, not per user)
    const seen = new Set<string>();
    const unique = (notifRes.data ?? []).filter((item: any) => {
      const key = `${item.title}::${item.created_at.slice(0, 16)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setItems(unique as AnnouncementRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { toast.error("Fill in title and message"); return; }
    setSending(true);
    try {
      const { data: profiles } = await supabase.from("profiles").select("id");
      if (!profiles || profiles.length === 0) {
        toast.error("No users found");
        setSending(false);
        return;
      }
      const rows = profiles.map((p: any) => ({
        user_id:  p.id,
        title:    title.trim(),
        body:     body.trim(),
        type:     annType,
        is_read:  false,
      }));
      const { error } = await supabase.from("notifications").insert(rows);
      if (error) throw error;
      toast.success(`Announcement broadcast to ${profiles.length} users`);
      setTitle(""); setBody(""); setAnnType("announcement"); setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  const del = async (id: string, itemTitle: string, itemTs: string) => {
    // Delete all notifications from the same broadcast batch (same title + minute)
    const minute = itemTs.slice(0, 16);
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("title", itemTitle)
      .gte("created_at", `${minute}:00`)
      .lt("created_at",  `${minute}:59.999`);
    if (error) {
      // Fallback: just delete the single record
      await supabase.from("notifications").delete().eq("id", id);
    }
    setItems(p => p.filter(x => x.id !== id));
    toast.info("Announcement removed");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast messages to all users.
            {userCount !== null && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />{userCount} users
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(v => !v)}
          className="bg-gradient-primary shadow-glow hover:opacity-95 gap-2"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancel" : "New"}
        </Button>
      </div>

      {/* Compose form */}
      {showForm && (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-6">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Megaphone className="size-4 text-primary" />
            Compose Announcement
          </h2>
          <form onSubmit={sendAnnouncement} className="space-y-4">

            {/* Type selector */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Type</Label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnnType(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        annType === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className={`size-3 ${annType === opt.value ? "text-primary" : opt.color}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                placeholder="e.g. Scheduled maintenance on Sunday"
                className="mt-1.5 h-11"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                placeholder="Write your message here…"
                className="mt-1.5 min-h-[90px] resize-none"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            {userCount !== null && userCount > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Bell className="size-3" />
                This will send a notification to <strong>{userCount} users</strong>.
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending || !title.trim() || !body.trim()}
                className="flex-1 bg-gradient-primary shadow-glow hover:opacity-95"
              >
                {sending
                  ? <><Loader2 className="size-4 animate-spin mr-2" />Sending…</>
                  : <><Megaphone className="size-4 mr-2" />Broadcast to all users</>}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-semibold text-sm">Broadcast History</h2>
          <span className="text-xs text-muted-foreground">{items.length} sent</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="size-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">No announcements sent yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Use the "New" button to broadcast a message.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map(item => {
              const typeInfo = TYPE_OPTIONS.find(o => o.value === item.type) ?? TYPE_OPTIONS[0];
              const Icon = typeInfo.icon;
              return (
                <div
                  key={item.id}
                  className="px-5 py-4 flex items-start justify-between gap-3 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_BADGE[item.type] ?? "bg-muted/20"}`}>
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{item.title}</p>
                        <Badge className={`text-[10px] border-0 capitalize px-1.5 py-0 ${TYPE_BADGE[item.type] ?? ""}`}>
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(item.created_at).toLocaleString("en-KE", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => del(item.id, item.title, item.created_at)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
                    title="Delete this announcement"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
