import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { J as ChevronDown, T as RefreshCw, W as Clock, dt as CircleCheck, ft as CircleAlert, lt as CircleQuestionMark, q as ChevronRight, x as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-CerwdN0g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_CONFIG = {
	open: {
		label: "Open",
		className: "bg-primary/15 text-primary",
		icon: Clock
	},
	pending: {
		label: "Pending",
		className: "bg-warning/15 text-warning",
		icon: Clock
	},
	resolved: {
		label: "Resolved",
		className: "bg-profit/15 text-profit",
		icon: CircleCheck
	},
	closed: {
		label: "Closed",
		className: "bg-muted/20 text-muted-foreground",
		icon: CircleCheck
	}
};
var PRI_CONFIG = {
	low: {
		label: "Low",
		className: "text-muted-foreground"
	},
	medium: {
		label: "Medium",
		className: "text-primary"
	},
	high: {
		label: "High",
		className: "text-warning font-semibold"
	},
	urgent: {
		label: "Urgent",
		className: "text-loss font-bold"
	}
};
function AdminTickets() {
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [expanded, setExpanded] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)({});
	const [reply, setReply] = (0, import_react.useState)({});
	const [replying, setReplying] = (0, import_react.useState)(null);
	const [adminId, setAdminId] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const load = async () => {
		setLoading(true);
		const [{ data }, { data: { user } }] = await Promise.all([supabase.from("support_tickets").select("*").order("updated_at", { ascending: false }).limit(100), supabase.auth.getUser()]);
		setTickets(data ?? []);
		if (user) setAdminId(user.id);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const loadMessages = async (ticketId) => {
		if (messages[ticketId]) return;
		const { data } = await supabase.from("ticket_messages").select("*").eq("ticket_id", ticketId).order("created_at");
		setMessages((p) => ({
			...p,
			[ticketId]: data ?? []
		}));
	};
	const toggleExpand = (id) => {
		if (expanded === id) {
			setExpanded(null);
			return;
		}
		setExpanded(id);
		loadMessages(id);
	};
	const sendReply = async (ticket) => {
		const text = reply[ticket.id]?.trim();
		if (!text) return;
		setReplying(ticket.id);
		const { data, error } = await supabase.from("ticket_messages").insert({
			ticket_id: ticket.id,
			user_id: adminId,
			body: text,
			is_staff: true
		}).select().single();
		if (error) {
			toast.error("Failed to send reply");
			setReplying(null);
			return;
		}
		setMessages((p) => ({
			...p,
			[ticket.id]: [...p[ticket.id] ?? [], data]
		}));
		await supabase.from("support_tickets").update({
			status: "pending",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", ticket.id);
		setTickets((p) => p.map((t) => t.id === ticket.id ? {
			...t,
			status: "pending"
		} : t));
		setReply((p) => ({
			...p,
			[ticket.id]: ""
		}));
		setReplying(null);
		toast.success("Reply sent");
	};
	const resolveTicket = async (id) => {
		await supabase.from("support_tickets").update({
			status: "resolved",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id);
		setTickets((p) => p.map((t) => t.id === id ? {
			...t,
			status: "resolved"
		} : t));
		toast.success("Ticket marked as resolved");
	};
	const visible = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
	const counts = {
		all: tickets.length,
		open: tickets.filter((t) => t.status === "open").length,
		pending: tickets.filter((t) => t.status === "pending").length,
		resolved: tickets.filter((t) => t.status === "resolved").length,
		closed: tickets.filter((t) => t.status === "closed").length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-6 text-primary" }), "Support Tickets"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: counts.open > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-warning font-medium",
						children: [
							counts.open,
							" open ticket",
							counts.open > 1 ? "s" : "",
							" requiring attention"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "All caught up — no open tickets." })
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: load,
					disabled: loading,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 flex-wrap",
				children: [
					"all",
					"open",
					"pending",
					"resolved",
					"closed"
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setFilter(f),
					className: `px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize flex items-center gap-1.5 ${filter === f ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"}`,
					children: [f === "all" ? "All" : f, counts[f] > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-border/60"}`,
						children: counts[f]
					})]
				}, f))
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-2xl" }, i))
			}) : visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface p-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-8 text-muted-foreground/30 mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground text-sm font-medium",
					children: [
						"No ",
						filter !== "all" ? filter : "",
						" tickets found."
					]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: visible.map((t) => {
					const statusConf = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
					const priConf = PRI_CONFIG[t.priority] ?? PRI_CONFIG.low;
					const StatusIcon = statusConf.icon;
					const isOpen = expanded === t.id;
					const isActionable = t.status !== "resolved" && t.status !== "closed";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-2xl border bg-gradient-surface shadow-card overflow-hidden transition-all ${t.status === "open" ? "border-primary/30" : "border-border/60"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleExpand(t.id),
							className: "w-full flex items-center gap-3 px-5 py-4 hover:bg-surface/50 transition-colors text-left",
							children: [
								isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-sm truncate",
										children: t.subject
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: [
											t.user_id.slice(0, 14),
											"… · ",
											new Date(t.created_at).toLocaleDateString("en-KE", {
												day: "2-digit",
												month: "short",
												year: "numeric"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-xs capitalize ${priConf.className}`,
										children: priConf.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: `text-xs border-0 capitalize flex items-center gap-1 ${statusConf.className}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { className: "size-3" }), statusConf.label]
									})]
								})
							]
						}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border/40 p-5 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3 max-h-72 overflow-y-auto pr-1",
									children: (messages[t.id] ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground text-center py-4",
										children: "No messages yet."
									}) : (messages[t.id] ?? []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `flex ${m.is_staff ? "justify-end" : "justify-start"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `max-w-xs sm:max-w-sm rounded-xl px-3.5 py-2.5 ${m.is_staff ? "bg-primary/15 border border-primary/20" : "bg-surface border border-border/60"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm leading-relaxed",
												children: m.body
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground mt-1.5",
												children: [
													m.is_staff ? "Support staff" : "User",
													" · ",
													new Date(m.created_at).toLocaleTimeString("en-KE", {
														hour: "2-digit",
														minute: "2-digit"
													})
												]
											})]
										})
									}, m.id))
								}),
								isActionable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										placeholder: "Type a reply to the user…",
										value: reply[t.id] ?? "",
										onChange: (e) => setReply((p) => ({
											...p,
											[t.id]: e.target.value
										})),
										className: "resize-none text-sm min-h-[72px]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											size: "sm",
											disabled: replying === t.id || !reply[t.id]?.trim(),
											onClick: () => sendReply(t),
											className: "bg-gradient-primary shadow-glow hover:opacity-95 gap-1.5",
											children: replying === t.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { className: "size-3 animate-spin" }), "Sending…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Send reply"] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											onClick: () => resolveTicket(t.id),
											className: "gap-1.5 text-profit border-profit/30 hover:bg-profit/10 hover:text-profit",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Mark resolved"]
										})]
									})]
								}),
								!isActionable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-profit/10 border border-profit/20 px-4 py-2.5 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-profit shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-profit font-medium",
										children: [
											"This ticket has been ",
											t.status,
											"."
										]
									})]
								})
							]
						})]
					}, t.id);
				})
			})
		]
	});
}
function Loader({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className });
}
//#endregion
export { AdminTickets as component };
