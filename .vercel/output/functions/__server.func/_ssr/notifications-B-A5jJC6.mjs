import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { $ as Bell, F as Info, X as CheckCheck, at as TriangleAlert, c as TrendingUp, it as ArrowDownToLine } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-B-A5jJC6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPE_ICON = {
	trade: TrendingUp,
	deposit: ArrowDownToLine,
	alert: TriangleAlert,
	info: Info
};
function NotificationsPage() {
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
			setItems(data ?? []);
			setLoading(false);
		})();
	}, []);
	const markAllRead = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
		setItems((p) => p.map((n) => ({
			...n,
			is_read: true
		})));
	};
	const markRead = async (id) => {
		await supabase.from("notifications").update({ is_read: true }).eq("id", id);
		setItems((p) => p.map((n) => n.id === id ? {
			...n,
			is_read: true
		} : n));
	};
	const unreadCount = items.filter((n) => !n.is_read).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-bold",
				children: "Notifications"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: [unreadCount, " unread"]
			})] }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: markAllRead,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4 mr-1.5" }), " Mark all read"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-6 space-y-3",
				children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, i))
			}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-12 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-10 text-muted-foreground mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "You're all caught up — no notifications yet."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border/40",
				children: items.map((n) => {
					const Icon = TYPE_ICON[n.type] ?? Info;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => !n.is_read && markRead(n.id),
						className: `w-full flex items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-surface/50 ${!n.is_read ? "bg-primary/5" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${!n.is_read ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-sm font-medium ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`,
										children: n.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground shrink-0",
										children: new Date(n.created_at).toLocaleDateString()
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: n.body
								})]
							}),
							!n.is_read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-2 rounded-full bg-primary shrink-0" })
						]
					}, n.id);
				})
			})
		})]
	});
}
//#endregion
export { NotificationsPage as component };
