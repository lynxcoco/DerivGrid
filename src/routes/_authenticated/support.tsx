import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, MessageSquare, Plus, ChevronDown, ChevronRight, Loader2, Send, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({ meta: [{ title: "Support · DerivGrid" }] }),
  component: SupportPage,
});

const ticketSchema = z.object({
  subject: z.string().trim().min(5, "Subject too short").max(120),
  body: z.string().trim().min(20, "Please describe your issue in more detail").max(2000),
  priority: z.enum(["low", "medium", "high"]),
});

const FAQ_ITEMS = [
  { q: "How do I deposit funds?", a: "Go to Wallet → Deposit. We support M-Pesa (instant) and Visa/Mastercard. M-Pesa deposits reflect in seconds after entering your PIN." },
  { q: "How long do withdrawals take?", a: "Withdrawals are processed within 1–2 business days. Funds are sent directly to your M-Pesa account once approved by our team." },
  { q: "What is a lot size?", a: "A lot size is the quantity of an asset you're trading. 0.01 lots (micro) is the minimum on DerivGrid. 1 standard lot = 100,000 units of base currency." },
  { q: "How do I set a Stop Loss or Take Profit?", a: "In the Trade terminal, fill in the Stop Loss and Take Profit fields in the order ticket before clicking Buy/Sell." },
  { q: "What are Synthetic Indices?", a: "Simulated markets that run 24/7 with fixed volatility, unaffected by real-world events. They offer constant trading opportunities any time of day." },
  { q: "How do I transfer between wallets?", a: "You only have one wallet — your main wallet. All deposits go directly there and you can trade immediately without any transfer." },
  { q: "Why was my withdrawal rejected?", a: "Withdrawals can be rejected for insufficient balance, security review, or incorrect phone number. Rejected funds are automatically returned to your wallet." },
];

type TicketRow = { id: string; user_id: string; subject: string; status: string; priority: string; created_at: string; updated_at: string; };
type MsgRow = { id: string; body: string; is_staff: boolean; created_at: string; };

const STATUS_COLOR: Record<string, string> = {
  open: "bg-primary/20 text-primary", pending: "bg-warning/20 text-warning",
  resolved: "bg-profit/20 text-profit", closed: "bg-muted/30 text-muted-foreground",
};
const PRI_COLOR: Record<string, string> = {
  low: "text-muted-foreground", medium: "text-primary", high: "text-warning", urgent: "text-loss",
};

function SupportPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MsgRow[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", body: "", priority: "medium" as "low" | "medium" | "high" },
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      loadTickets(user.id);
    })();
  }, []);

  const loadTickets = async (uid: string) => {
    setLoadingTickets(true);
    const { data } = await supabase.from("support_tickets").select("*")
      .eq("user_id", uid).order("updated_at", { ascending: false });
    setTickets((data as TicketRow[]) ?? []);
    setLoadingTickets(false);
  };

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase.from("ticket_messages").select("*")
      .eq("ticket_id", ticketId).order("created_at");
    setMessages(p => ({ ...p, [ticketId]: (data as MsgRow[]) ?? [] }));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const toggleTicket = (id: string) => {
    if (expandedTicket === id) { setExpandedTicket(null); return; }
    setExpandedTicket(id);
    loadMessages(id);
  };

  const sendReply = async (ticket: TicketRow) => {
    const text = replyText[ticket.id]?.trim();
    if (!text) return;
    setSendingReply(ticket.id);
    const { data, error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id, user_id: userId, body: text, is_staff: false,
    }).select().single();
    if (error) { toast.error("Failed to send"); setSendingReply(null); return; }
    setMessages(p => ({ ...p, [ticket.id]: [...(p[ticket.id] ?? []), data as MsgRow] }));
    setReplyText(p => ({ ...p, [ticket.id]: "" }));
    // Update ticket status to open if resolved
    if (ticket.status === "resolved") {
      await supabase.from("support_tickets").update({ status: "open", updated_at: new Date().toISOString() }).eq("id", ticket.id);
      setTickets(p => p.map(t => t.id === ticket.id ? { ...t, status: "open" } : t));
    }
    setSendingReply(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("support_tickets").insert({
        user_id: user.id, subject: values.subject, status: "open", priority: values.priority,
      }).select().single();
      if (error) throw error;
      await supabase.from("ticket_messages").insert({
        ticket_id: data.id, user_id: user.id, body: values.body, is_staff: false,
      });
      setTickets(p => [data as TicketRow, ...p]);
      form.reset();
      toast.success("Ticket submitted. We'll reply within 24 hours.");
      setExpandedTicket(data.id);
      loadMessages(data.id);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl lg:max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Support Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse our FAQ, open a ticket, or reply to an existing conversation.</p>
      </div>

      <Tabs defaultValue="faq">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="faq"><HelpCircle className="size-3.5 mr-1.5" />FAQ</TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageSquare className="size-3.5 mr-1.5" />
            My Tickets
            {tickets.filter(t => t.status === "pending").length > 0 && (
              <span className="ml-1.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {tickets.filter(t => t.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="new"><Plus className="size-3.5 mr-1.5" />New Ticket</TabsTrigger>
        </TabsList>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden divide-y divide-border/40">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface/50 transition-colors">
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* My tickets */}
        <TabsContent value="tickets" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" onClick={() => loadTickets(userId)} disabled={loadingTickets}>
              <RefreshCw className={`size-4 ${loadingTickets ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {loadingTickets ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
          ) : tickets.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-gradient-surface p-12 text-center">
              <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No tickets yet. Open one if you need help.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(t => (
                <div key={t.id} className="rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden">
                  <button onClick={() => toggleTicket(t.id)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface/50 transition-colors text-left">
                    {expandedTicket === t.id ? <ChevronDown className="size-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(t.created_at).toLocaleDateString()} · Updated {new Date(t.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium capitalize ${PRI_COLOR[t.priority]}`}>{t.priority}</span>
                      <Badge className={`text-xs border-0 capitalize ${STATUS_COLOR[t.status] ?? ""}`}>{t.status}</Badge>
                    </div>
                  </button>

                  {expandedTicket === t.id && (
                    <div className="border-t border-border/40">
                      {/* Messages thread */}
                      <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                        {(messages[t.id] ?? []).length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">Loading messages…</p>
                        ) : (
                          (messages[t.id] ?? []).map(m => (
                            <div key={m.id} className={`flex ${m.is_staff ? "justify-start" : "justify-end"}`}>
                              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                                m.is_staff
                                  ? "bg-surface border border-border/50 text-foreground"
                                  : "bg-primary/20 text-foreground"
                              }`}>
                                {m.is_staff && <p className="text-[10px] font-semibold text-primary mb-1">DerivGrid Support</p>}
                                <p className="leading-relaxed">{m.body}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 text-right">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Reply box */}
                      {t.status !== "closed" && (
                        <div className="px-5 pb-4 flex gap-2 border-t border-border/30 pt-3">
                          <Textarea
                            placeholder="Type a reply…"
                            value={replyText[t.id] ?? ""}
                            onChange={e => setReplyText(p => ({ ...p, [t.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(t); }}
                            className="resize-none text-sm min-h-[60px] flex-1"
                            rows={2}
                          />
                          <Button size="sm" disabled={sendingReply === t.id || !replyText[t.id]?.trim()}
                            onClick={() => sendReply(t)}
                            className="bg-gradient-primary shadow-glow hover:opacity-95 self-end h-10 px-3">
                            {sendingReply === t.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* New ticket */}
        <TabsContent value="new" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card">
            <h2 className="font-semibold mb-4">Open a new ticket</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input className="mt-1.5 h-11" placeholder="Brief description of your issue" {...form.register("subject")} />
                {form.formState.errors.subject && <p className="text-xs text-destructive mt-1">{form.formState.errors.subject.message}</p>}
              </div>
              <div>
                <Label>Priority</Label>
                <select {...form.register("priority")}
                  className="mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="low">Low — General question</option>
                  <option value="medium">Medium — Issue affecting usage</option>
                  <option value="high">High — Urgent / financial issue</option>
                </select>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea className="mt-1.5 min-h-[120px] resize-none" placeholder="Describe your issue in detail…" {...form.register("body")} />
                {form.formState.errors.body && <p className="text-xs text-destructive mt-1">{form.formState.errors.body.message}</p>}
              </div>
              <Button type="submit" disabled={submitting} className="bg-gradient-primary shadow-glow hover:opacity-95">
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <><Send className="size-4 mr-1.5" />Submit ticket</>}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
