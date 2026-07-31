import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { O as redirect, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BVqdvdAT.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./route-BTsIWXj_.mjs");
var Route = createFileRoute("/_authenticated")({
	ssr: false,
	pendingComponent: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:flex flex-col w-64 border-r border-sidebar-border bg-sidebar shrink-0 animate-pulse",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-16 flex items-center px-6 border-b border-sidebar-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-32 rounded-lg bg-sidebar-accent" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-3 border-b border-sidebar-border/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 rounded-full bg-sidebar-accent shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3.5 w-24 rounded bg-sidebar-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-12 rounded bg-sidebar-accent/60" })]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 space-y-1",
					children: [...Array(9)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 rounded-lg bg-sidebar-accent/50" }, i))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "h-14 sm:h-16 border-b border-border/60 animate-pulse flex items-center px-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lg:hidden size-9 rounded-lg bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lg:hidden h-7 w-28 rounded-lg bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-32 rounded-lg bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-9 rounded-full bg-surface" })]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 p-4 sm:p-6 space-y-4 animate-pulse",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-56 rounded-lg bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-2xl bg-surface" }, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 rounded-2xl bg-surface" })
				]
			})]
		})]
	}),
	beforeLoad: async ({ location }) => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		if (location.pathname === "/dashboard") {
			const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
			if (roleRow?.role === "admin") throw redirect({ to: "/admin/overview" });
		}
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
