import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw, Send, ChevronDown, ChevronRight,
  HelpCircle, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tickets")({
  head: () => ({ meta: [{ title: "Support Tickets · Admin" }] }),
  component: AdminTickets,
});

type TicketRow = {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};
type MsgRow = { id: string; body: string; is_staff: boolean; created_at: string; };

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  open:     { label: "Open",     className: "bg-primary/15 text-primary",           icon: Clock         },
  pending:  { label: "Pending",  className: "bg-warning/15 text-warning",           icon: Clock         },
  resolved: { label: "Resolved", className: "bg-profit/15 text-profit",             icon: CheckCircle2  },
  closed:   { label: "Closed",   className: "bg-muted/20 text-muted-foreground",    icon: CheckCircle2  },
};

const PRI_CONFIG: Record<string, { label: string; className: string }> = {
  low:    { label: "Low",    className: "text-muted-foreground"         },
  medium: { label: "Medium", className: "text-primary"                  },
  high:   { label: "High",   className: "text-warning font-semibold"    },
  urgent: { label: "Urgent", className: "text-loss font-bold"           },
};

type FilterType = "all" | "open" | "pending" | "resolved" | "closed";

function AdminTickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MsgRow[]>>({});
  const [reply, setReply] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: { user } }] = await Promise.all([
      supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase.auth.getUser(),
    ]);
    setTickets((data as TicketRow[]) ?? []);
    if (user) setAdminId(user.id);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadMessages = async (ticketId: string) => {
    if (messages[ticketId]) return;
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at");
    setMessages(p => ({ ...p, [ticketId]: (data as MsgRow[]) ?? [] }));
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    loadMessages(id);
  };

  const sendReply = async (ticket: TicketRow) => {
    const text = reply[ticket.id]?.trim();
    if (!text) return;
    setReplying(ticket.id);

    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: ticket.id, user_id: adminId, body: text, is_staff: true })
      .select()
      .single();

    if (error) { toast.error("Failed to send reply"); setReplying(null); return; }

    setMessages(p => ({ ...p, [ticket.id]: [...(p[ticket.id] ?? []), data as MsgRow] }));
    await supabase
      .from("support_tickets")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", ticket.id);
    setTickets(p => p.map(t => t.id === ticket.id ? { ...t, status: "pending" } : t));
    setReply(p => ({ ...p, [ticket.id]: "" }));
    setReplying(null);
    toast.success("Reply sent");
  };

  const resolveTicket = async (id: string) => {
    await supabase
      .from("support_tickets")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("id", id);
    setTickets(p => p.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    toast.success("Ticket marked as resolved");
  };

  const visible = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const counts: Record<FilterType, number> = {
    all:      tickets.length,
    open:     tickets.filter(t => t.status === "open").length,
    pending:  tickets.filter(t => t.status === "pending").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    closed:   tickets.filter(t => t.status === "closed").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="size-6 text-primary" />
            Support Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.open > 0 ? (
              <span className="text-warning font-medium">{counts.open} open ticket{counts.open > 1 ? "s" : ""} requiring attention</span>
            ) : (
              <span>All caught up — no open tickets.</span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "pending", "resolved", "closed"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
            {counts[f] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-border/60"}`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-gradient-surface p-12 text-center">
          <AlertCircle className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">No {filter !== "all" ? filter : ""} tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(t => {
            const statusConf = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
            const priConf    = PRI_CONFIG[t.priority] ?? PRI_CONFIG.low;
            const StatusIcon = statusConf.icon;
            const isOpen     = expanded === t.id;
            const isActionable = t.status !== "resolved" && t.status !== "closed";

            return (
              <div
                key={t.id}
                className={`rounded-2xl border bg-gradient-surface shadow-card overflow-hidden transition-all ${
                  t.status === "open" ? "border-primary/30" : "border-border/60"
                }`}
              >
                {/* Ticket header */}
                <button
                  onClick={() => toggleExpand(t.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface/50 transition-colors text-left"
                >
                  {isOpen
                    ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.user_id.slice(0, 14)}… · {new Date(t.created_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs capitalize ${priConf.className}`}>{priConf.label}</span>
                    <Badge className={`text-xs border-0 capitalize flex items-center gap-1 ${statusConf.className}`}>
                      <StatusIcon className="size-3" />
                      {statusConf.label}
                    </Badge>
                  </div>
                </button>

                {/* Expanded: messages + reply */}
                {isOpen && (
                  <div className="border-t border-border/40 p-5 space-y-4">

                    {/* Message thread */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {(messages[t.id] ?? []).length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No messages yet.</p>
                      ) : (
                        (messages[t.id] ?? []).map(m => (
                          <div key={m.id} className={`flex ${m.is_staff ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs sm:max-w-sm rounded-xl px-3.5 py-2.5 ${
                              m.is_staff
                                ? "bg-primary/15 border border-primary/20"
                                : "bg-surface border border-border/60"
                            }`}>
                              <p className="text-sm leading-relaxed">{m.body}</p>
                              <p className="text-[10px] text-muted-foreground mt-1.5">
                                {m.is_staff ? "Support staff" : "User"} · {new Date(m.created_at).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply input */}
                    {isActionable && (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type a reply to the user…"
                          value={reply[t.id] ?? ""}
                          onChange={e => setReply(p => ({ ...p, [t.id]: e.target.value }))}
                          className="resize-none text-sm min-h-[72px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={replying === t.id || !reply[t.id]?.trim()}
                            onClick={() => sendReply(t)}
                            className="bg-gradient-primary shadow-glow hover:opacity-95 gap-1.5"
                          >
                            {replying === t.id
                              ? <><Loader className="size-3 animate-spin" />Sending…</>
                              : <><Send className="size-3.5" />Send reply</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveTicket(t.id)}
                            className="gap-1.5 text-profit border-profit/30 hover:bg-profit/10 hover:text-profit"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Mark resolved
                          </Button>
                        </div>
                      </div>
                    )}

                    {!isActionable && (
                      <div className="rounded-lg bg-profit/10 border border-profit/20 px-4 py-2.5 flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-profit shrink-0" />
                        <p className="text-xs text-profit font-medium">This ticket has been {t.status}.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline loader component to avoid extra import
function Loader({ className }: { className?: string }) {
  return <RefreshCw className={className} />;
}
