import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as Menu, M as LogOut, N as LayoutDashboard, R as FileText, _ as Smartphone, b as Settings, i as Users, it as ArrowDownToLine, j as Megaphone, lt as CircleQuestionMark, mt as ChartLine, n as X, pt as ChartNoAxesColumn, q as ChevronRight, tt as ArrowUpFromLine, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-Pe2PMluE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DypJp-Sp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		label: "Dashboard",
		items: [{
			to: "/admin/overview",
			label: "Overview",
			icon: LayoutDashboard
		}, {
			to: "/admin/reports",
			label: "Reports",
			icon: FileText
		}]
	},
	{
		label: "Users",
		items: [{
			to: "/admin/users",
			label: "All Users",
			icon: Users
		}, {
			to: "/admin/announcements",
			label: "Announcements",
			icon: Megaphone
		}]
	},
	{
		label: "Finance",
		items: [
			{
				to: "/admin/deposits",
				label: "Deposits",
				icon: ArrowDownToLine
			},
			{
				to: "/admin/withdrawals",
				label: "Withdrawals",
				icon: ArrowUpFromLine
			},
			{
				to: "/admin/trades",
				label: "Trades",
				icon: ChartLine
			}
		]
	},
	{
		label: "Platform",
		items: [
			{
				to: "/admin/assets",
				label: "Assets",
				icon: ChartNoAxesColumn
			},
			{
				to: "/admin/tickets",
				label: "Support Tickets",
				icon: CircleQuestionMark
			},
			{
				to: "/admin/audit",
				label: "Audit Log",
				icon: ShieldCheck
			}
		]
	},
	{
		label: "Configuration",
		items: [{
			to: "/admin/platform-settings",
			label: "Platform Settings",
			icon: Settings
		}, {
			to: "/admin/payment-config",
			label: "Payment Config",
			icon: Smartphone
		}]
	}
];
var ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);
function AdminLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const signOut = async () => {
		await supabase.auth.signOut();
		toast.success("Signed out");
		navigate({ to: "/auth" });
	};
	(0, import_react.useEffect)(() => {
		if (pathname === "/admin" || pathname === "/admin/") navigate({
			to: "/admin/overview",
			replace: true
		});
	}, [pathname, navigate]);
	(0, import_react.useEffect)(() => {
		setDrawerOpen(false);
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		if (drawerOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [drawerOpen]);
	const currentPage = ALL_NAV.find((n) => pathname.startsWith(n.to))?.label ?? "Admin";
	const NavLinks = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex-1 overflow-y-auto px-2 py-3 overscroll-contain",
		children: NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 py-2 mt-1 select-none",
				children: group.label
			}), group.items.map(({ to, label, icon: Icon }) => {
				const active = pathname.startsWith(to);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to,
					className: `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group ${active ? "bg-primary/12 text-primary font-semibold" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-4 shrink-0 transition-colors ${active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: label
						}),
						active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-auto size-1.5 rounded-full bg-primary shrink-0" })
					]
				}, to);
			})]
		}, group.label))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-screen overflow-hidden flex bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden lg:flex flex-col w-60 h-full border-r border-sidebar-border bg-sidebar shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-16 flex items-center px-5 border-b border-sidebar-border gap-3 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase tracking-widest text-primary",
								children: "Admin Panel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground",
								children: "DerivGrid"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3 border-t border-sidebar-border shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: signOut,
							className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-loss/10 hover:text-loss transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
						})
					})
				]
			}),
			drawerOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm",
				onClick: () => setDrawerOpen(false),
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `lg:hidden fixed inset-y-0 left-0 z-50 w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-primary uppercase tracking-wide",
								children: "Admin"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setDrawerOpen(false),
							className: "size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60 transition-colors",
							"aria-label": "Close menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavLinks, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3 border-t border-sidebar-border shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: signOut,
							className: "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-loss/10 hover:text-loss transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0 h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "h-14 border-b border-border/60 bg-background/90 backdrop-blur-xl flex items-center px-4 sm:px-6 gap-3 shrink-0 z-30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDrawerOpen(true),
						className: "lg:hidden size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 hover:bg-surface transition-colors shrink-0",
						"aria-label": "Open menu",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden lg:block text-xs text-muted-foreground shrink-0",
								children: "Admin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "hidden lg:block size-3 text-muted-foreground/50 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold truncate",
								children: currentPage
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 overflow-y-auto bg-background/50 overscroll-contain",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})
		]
	});
}
//#endregion
export { AdminLayout as component };
