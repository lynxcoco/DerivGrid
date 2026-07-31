import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { T as RefreshCw, d as ToggleRight, f as ToggleLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assets-DqLDS-ah.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CAT_COLOR = {
	forex: "bg-primary/15 text-primary",
	crypto: "bg-warning/20 text-warning",
	synthetic: "bg-profit/15 text-profit",
	commodity: "bg-loss/15 text-loss",
	stock: "bg-muted/30 text-muted-foreground",
	index: "bg-accent/30 text-accent-foreground"
};
function AdminAssets() {
	const [assets, setAssets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = async () => {
		setLoading(true);
		const { data } = await supabase.from("assets").select("*").order("category").order("symbol");
		setAssets(data ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const toggle = async (id, current) => {
		await supabase.from("assets").update({ is_active: !current }).eq("id", id);
		setAssets((p) => p.map((a) => a.id === id ? {
			...a,
			is_active: !current
		} : a));
		toast.success(`Asset ${current ? "disabled" : "enabled"}`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl sm:text-2xl font-bold",
				children: "Assets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs sm:text-sm text-muted-foreground mt-1",
				children: [assets.length, " tradeable instruments"]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: load,
				disabled: loading,
				className: "shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: [...Array(8)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 rounded-xl" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hidden sm:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-5 py-3 font-semibold",
							children: "Symbol"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-4 py-3 font-semibold",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left px-4 py-3 font-semibold",
							children: "Category"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right px-4 py-3 font-semibold",
							children: "Pip size"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-center px-4 py-3 font-semibold",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: assets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-5 py-3 font-semibold font-mono",
							children: a.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm text-muted-foreground",
							children: a.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: `text-xs border-0 capitalize ${CAT_COLOR[a.category] ?? ""}`,
								children: a.category
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right font-mono text-xs",
							children: a.pip_size
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-xs font-medium ${a.is_active ? "text-profit" : "text-muted-foreground"}`,
								children: a.is_active ? "Active" : "Disabled"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => toggle(a.id, a.is_active),
								className: "text-muted-foreground hover:text-foreground transition-colors",
								children: a.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRight, { className: "size-5 text-profit" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "size-5" })
							})
						})
					]
				}, a.id)) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sm:hidden space-y-2",
			children: assets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border/50 bg-gradient-surface p-3.5 shadow-card flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 flex-wrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-bold text-sm",
								children: a.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: `text-[10px] border-0 capitalize ${CAT_COLOR[a.category] ?? ""}`,
								children: a.category
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5 truncate",
							children: a.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[10px] text-muted-foreground mt-0.5",
							children: ["Pip: ", a.pip_size]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-end gap-1.5 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-xs font-semibold ${a.is_active ? "text-profit" : "text-muted-foreground"}`,
						children: a.is_active ? "Active" : "Disabled"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => toggle(a.id, a.is_active),
						className: "text-muted-foreground hover:text-foreground transition-colors",
						children: a.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleRight, { className: "size-6 text-profit" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleLeft, { className: "size-6" })
					})]
				})]
			}, a.id))
		})] })]
	});
}
//#endregion
export { AdminAssets as component };
