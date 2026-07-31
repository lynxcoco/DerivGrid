import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { $ as Bell, E as Plus, F as Info, at as TriangleAlert, i as Users, j as Megaphone, n as X, ot as LoaderCircle, u as Trash2, ut as CircleCheckBig } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/announcements-S-MeHZJq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPE_OPTIONS = [
	{
		value: "announcement",
		label: "General",
		icon: Megaphone,
		color: "text-primary"
	},
	{
		value: "info",
		label: "Info",
		icon: Info,
		color: "text-blue-400"
	},
	{
		value: "warning",
		label: "Warning",
		icon: TriangleAlert,
		color: "text-warning"
	},
	{
		value: "success",
		label: "Good news",
		icon: CircleCheckBig,
		color: "text-profit"
	}
];
var TYPE_BADGE = {
	announcement: "bg-primary/15 text-primary",
	info: "bg-blue-400/15 text-blue-400",
	warning: "bg-warning/15 text-warning",
	success: "bg-profit/15 text-profit"
};
function AdminAnnouncements() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [sending, setSending] = (0, import_react.useState)(false);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [annType, setAnnType] = (0, import_react.useState)("announcement");
	const [userCount, setUserCount] = (0, import_react.useState)(null);
	const load = async () => {
		setLoading(true);
		const [notifRes, countRes] = await Promise.all([supabase.from("notifications").select("id, title, body, type, created_at").in("type", [
			"announcement",
			"info",
			"warning",
			"success"
		]).order("created_at", { ascending: false }), supabase.from("profiles").select("id", {
			count: "exact",
			head: true
		})]);
		setUserCount(countRes.count ?? 0);
		const seen = /* @__PURE__ */ new Set();
		setItems((notifRes.data ?? []).filter((item) => {
			const key = `${item.title}::${item.created_at.slice(0, 16)}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		}));
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const sendAnnouncement = async (e) => {
		e.preventDefault();
		if (!title.trim() || !body.trim()) {
			toast.error("Fill in title and message");
			return;
		}
		setSending(true);
		try {
			const { data: profiles } = await supabase.from("profiles").select("id");
			if (!profiles || profiles.length === 0) {
				toast.error("No users found");
				setSending(false);
				return;
			}
			const rows = profiles.map((p) => ({
				user_id: p.id,
				title: title.trim(),
				body: body.trim(),
				type: annType,
				is_read: false
			}));
			const { error } = await supabase.from("notifications").insert(rows);
			if (error) throw error;
			toast.success(`Announcement broadcast to ${profiles.length} users`);
			setTitle("");
			setBody("");
			setAnnType("announcement");
			setShowForm(false);
			load();
		} catch (e) {
			toast.error(e?.message ?? "Failed to send announcement");
		} finally {
			setSending(false);
		}
	};
	const del = async (id, itemTitle, itemTs) => {
		const minute = itemTs.slice(0, 16);
		const { error } = await supabase.from("notifications").delete().eq("title", itemTitle).gte("created_at", `${minute}:00`).lt("created_at", `${minute}:59.999`);
		if (error) await supabase.from("notifications").delete().eq("id", id);
		setItems((p) => p.filter((x) => x.id !== id));
		toast.info("Announcement removed");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Announcements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: ["Broadcast messages to all users.", userCount !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3" }),
							userCount,
							" users"
						]
					})]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowForm((v) => !v),
					className: "bg-gradient-primary shadow-glow hover:opacity-95 gap-2",
					children: [showForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), showForm ? "Cancel" : "New"]
				})]
			}),
			showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-semibold text-sm mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-4 text-primary" }), "Compose Announcement"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: sendAnnouncement,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-xs text-muted-foreground uppercase tracking-wider mb-2 block",
							children: "Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 flex-wrap",
							children: TYPE_OPTIONS.map((opt) => {
								const Icon = opt.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setAnnType(opt.value),
									className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${annType === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3 ${annType === opt.value ? "text-primary" : opt.color}` }), opt.label]
								}, opt.value);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-medium",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "e.g. Scheduled maintenance on Sunday",
							className: "mt-1.5 h-11",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-medium",
							children: "Message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							placeholder: "Write your message here…",
							className: "mt-1.5 min-h-[90px] resize-none",
							value: body,
							onChange: (e) => setBody(e.target.value)
						})] }),
						userCount !== null && userCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3" }),
								"This will send a notification to ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [userCount, " users"] }),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setShowForm(false),
								className: "flex-1",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: sending || !title.trim() || !body.trim(),
								className: "flex-1 bg-gradient-primary shadow-glow hover:opacity-95",
								children: sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin mr-2" }), "Sending…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-4 mr-2" }), "Broadcast to all users"] })
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 py-4 border-b border-border/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-sm",
						children: "Broadcast History"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [items.length, " sent"]
					})]
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 space-y-3",
					children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-lg" }, i))
				}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-10 text-muted-foreground/30 mx-auto mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted-foreground text-sm font-medium",
							children: "No announcements sent yet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Use the \"New\" button to broadcast a message."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border/40",
					children: items.map((item) => {
						const typeInfo = TYPE_OPTIONS.find((o) => o.value === item.type) ?? TYPE_OPTIONS[0];
						const Icon = typeInfo.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-4 flex items-start justify-between gap-3 hover:bg-surface/50 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_BADGE[item.type] ?? "bg-muted/20"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 flex-wrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-sm",
												children: item.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] border-0 capitalize px-1.5 py-0 ${TYPE_BADGE[item.type] ?? ""}`,
												children: typeInfo.label
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-0.5 line-clamp-2",
											children: item.body
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground/70 mt-1",
											children: new Date(item.created_at).toLocaleString("en-KE", {
												day: "2-digit",
												month: "short",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit"
											})
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => del(item.id, item.title, item.created_at),
								className: "text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1",
								title: "Delete this announcement",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, item.id);
					})
				})]
			})
		]
	});
}
//#endregion
export { AdminAnnouncements as component };
