import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { E as Plus, J as ChevronDown, T as RefreshCw, k as MessageSquare, lt as CircleQuestionMark, ot as LoaderCircle, q as ChevronRight, x as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { i as stringType, n as enumType, r as objectType } from "../_libs/zod.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DyyAjTF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-CS8MWE3O.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ticketSchema = objectType({
	subject: stringType().trim().min(5, "Subject too short").max(120),
	body: stringType().trim().min(20, "Please describe your issue in more detail").max(2e3),
	priority: enumType([
		"low",
		"medium",
		"high"
	])
});
var FAQ_ITEMS = [
	{
		q: "How do I deposit funds?",
		a: "Go to Wallet → Deposit. We support M-Pesa (instant) and Visa/Mastercard. M-Pesa deposits reflect in seconds after entering your PIN."
	},
	{
		q: "How long do withdrawals take?",
		a: "Withdrawals are processed within 1–2 business days. Funds are sent directly to your M-Pesa account once approved by our team."
	},
	{
		q: "What is a lot size?",
		a: "A lot size is the quantity of an asset you're trading. 0.01 lots (micro) is the minimum on DerivGrid. 1 standard lot = 100,000 units of base currency."
	},
	{
		q: "How do I set a Stop Loss or Take Profit?",
		a: "In the Trade terminal, fill in the Stop Loss and Take Profit fields in the order ticket before clicking Buy/Sell."
	},
	{
		q: "What are Synthetic Indices?",
		a: "Simulated markets that run 24/7 with fixed volatility, unaffected by real-world events. They offer constant trading opportunities any time of day."
	},
	{
		q: "How do I transfer between wallets?",
		a: "You only have one wallet — your main wallet. All deposits go directly there and you can trade immediately without any transfer."
	},
	{
		q: "Why was my withdrawal rejected?",
		a: "Withdrawals can be rejected for insufficient balance, security review, or incorrect phone number. Rejected funds are automatically returned to your wallet."
	}
];
var STATUS_COLOR = {
	open: "bg-primary/20 text-primary",
	pending: "bg-warning/20 text-warning",
	resolved: "bg-profit/20 text-profit",
	closed: "bg-muted/30 text-muted-foreground"
};
var PRI_COLOR = {
	low: "text-muted-foreground",
	medium: "text-primary",
	high: "text-warning",
	urgent: "text-loss"
};
function SupportPage() {
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [loadingTickets, setLoadingTickets] = (0, import_react.useState)(true);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [openFaq, setOpenFaq] = (0, import_react.useState)(null);
	const [expandedTicket, setExpandedTicket] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)({});
	const [replyText, setReplyText] = (0, import_react.useState)({});
	const [sendingReply, setSendingReply] = (0, import_react.useState)(null);
	const [userId, setUserId] = (0, import_react.useState)("");
	const messagesEndRef = (0, import_react.useRef)(null);
	const form = useForm({
		resolver: u(ticketSchema),
		defaultValues: {
			subject: "",
			body: "",
			priority: "medium"
		}
	});
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			setUserId(user.id);
			loadTickets(user.id);
		})();
	}, []);
	const loadTickets = async (uid) => {
		setLoadingTickets(true);
		const { data } = await supabase.from("support_tickets").select("*").eq("user_id", uid).order("updated_at", { ascending: false });
		setTickets(data ?? []);
		setLoadingTickets(false);
	};
	const loadMessages = async (ticketId) => {
		const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
		setMessages((p) => ({
			...p,
			[ticketId]: data ?? []
		}));
		setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
	};
	const toggleTicket = (id) => {
		if (expandedTicket === id) {
			setExpandedTicket(null);
			return;
		}
		setExpandedTicket(id);
		loadMessages(id);
	};
	const sendReply = async (ticket) => {
		const text = replyText[ticket.id]?.trim();
		if (!text) return;
		setSendingReply(ticket.id);
		const { data, error } = await supabase.from("ticket_messages").insert({
			ticket_id: ticket.id,
			user_id: userId,
			body: text,
			is_staff: false
		}).select().single();
		if (error) {
			toast.error("Failed to send");
			setSendingReply(null);
			return;
		}
		setMessages((p) => ({
			...p,
			[ticket.id]: [...p[ticket.id] ?? [], data]
		}));
		setReplyText((p) => ({
			...p,
			[ticket.id]: ""
		}));
		if (ticket.status === "resolved") {
			await supabase.from("support_tickets").update({
				status: "open",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", ticket.id);
			setTickets((p) => p.map((t) => t.id === ticket.id ? {
				...t,
				status: "open"
			} : t));
		}
		setSendingReply(null);
		setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
	};
	const onSubmit = async (values) => {
		setSubmitting(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");
			const { data, error } = await supabase.from("support_tickets").insert({
				user_id: user.id,
				subject: values.subject,
				status: "open",
				priority: values.priority
			}).select().single();
			if (error) throw error;
			await supabase.from("ticket_messages").insert({
				ticket_id: data.id,
				user_id: user.id,
				body: values.body,
				is_staff: false
			});
			setTickets((p) => [data, ...p]);
			form.reset();
			toast.success("Ticket submitted. We'll reply within 24 hours.");
			setExpandedTicket(data.id);
			loadMessages(data.id);
		} catch (e) {
			toast.error(e?.message ?? "Could not submit ticket");
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-4xl lg:max-w-6xl mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl sm:text-3xl font-bold",
			children: "Support Center"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1",
			children: "Browse our FAQ, open a ticket, or reply to an existing conversation."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "faq",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "grid grid-cols-3 w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "faq",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-3.5 mr-1.5" }), "FAQ"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "tickets",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5 mr-1.5" }),
								"My Tickets",
								tickets.filter((t) => t.status === "pending").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center",
									children: tickets.filter((t) => t.status === "pending").length
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "new",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5 mr-1.5" }), "New Ticket"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "faq",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden divide-y divide-border/40",
						children: FAQ_ITEMS.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setOpenFaq(openFaq === i ? null : i),
							className: "w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface/50 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-sm pr-4",
								children: item.q
							}), openFaq === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted-foreground" })]
						}), openFaq === i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-6 pb-4 text-sm text-muted-foreground leading-relaxed",
							children: item.a
						})] }, i))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "tickets",
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end mb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => loadTickets(userId),
							disabled: loadingTickets,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loadingTickets ? "animate-spin" : ""}` })
						})
					}), loadingTickets ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: [...Array(3)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-2xl" }, i))
					}) : tickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface p-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-10 text-muted-foreground mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-sm",
							children: "No tickets yet. Open one if you need help."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: tickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => toggleTicket(t.id),
								className: "w-full flex items-center gap-3 px-5 py-4 hover:bg-surface/50 transition-colors text-left",
								children: [
									expandedTicket === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-sm truncate",
											children: t.subject
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: [
												new Date(t.created_at).toLocaleDateString(),
												" · Updated ",
												new Date(t.updated_at).toLocaleDateString()
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-xs font-medium capitalize ${PRI_COLOR[t.priority]}`,
											children: t.priority
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: `text-xs border-0 capitalize ${STATUS_COLOR[t.status] ?? ""}`,
											children: t.status
										})]
									})
								]
							}), expandedTicket === t.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-5 py-4 space-y-3 max-h-72 overflow-y-auto",
									children: [(messages[t.id] ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground text-center py-4",
										children: "Loading messages…"
									}) : (messages[t.id] ?? []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `flex ${m.is_staff ? "justify-start" : "justify-end"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${m.is_staff ? "bg-surface border border-border/50 text-foreground" : "bg-primary/20 text-foreground"}`,
											children: [
												m.is_staff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] font-semibold text-primary mb-1",
													children: "DerivGrid Support"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "leading-relaxed",
													children: m.body
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground mt-1.5 text-right",
													children: new Date(m.created_at).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit"
													})
												})
											]
										})
									}, m.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })]
								}), t.status !== "closed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "px-5 pb-4 flex gap-2 border-t border-border/30 pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										placeholder: "Type a reply…",
										value: replyText[t.id] ?? "",
										onChange: (e) => setReplyText((p) => ({
											...p,
											[t.id]: e.target.value
										})),
										onKeyDown: (e) => {
											if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(t);
										},
										className: "resize-none text-sm min-h-[60px] flex-1",
										rows: 2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										disabled: sendingReply === t.id || !replyText[t.id]?.trim(),
										onClick: () => sendReply(t),
										className: "bg-gradient-primary shadow-glow hover:opacity-95 self-end h-10 px-3",
										children: sendingReply === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
									})]
								})]
							})]
						}, t.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "new",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold mb-4",
							children: "Open a new ticket"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: form.handleSubmit(onSubmit),
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Subject" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1.5 h-11",
										placeholder: "Brief description of your issue",
										...form.register("subject")
									}),
									form.formState.errors.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-destructive mt-1",
										children: form.formState.errors.subject.message
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Priority" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									...form.register("priority"),
									className: "mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "low",
											children: "Low — General question"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "medium",
											children: "Medium — Issue affecting usage"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "high",
											children: "High — Urgent / financial issue"
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Message" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "mt-1.5 min-h-[120px] resize-none",
										placeholder: "Describe your issue in detail…",
										...form.register("body")
									}),
									form.formState.errors.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-destructive mt-1",
										children: form.formState.errors.body.message
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: submitting,
									className: "bg-gradient-primary shadow-glow hover:opacity-95",
									children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 mr-1.5" }), "Submit ticket"] })
								})
							]
						})]
					})
				})
			]
		})]
	});
}
//#endregion
export { SupportPage as component };
