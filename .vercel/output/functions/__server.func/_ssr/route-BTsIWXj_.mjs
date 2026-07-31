import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { $ as Bell, A as Menu, I as History, M as LogOut, N as LayoutDashboard, Q as BellRing, a as User, b as Settings, gt as ChartCandlestick, it as ArrowDownToLine, lt as CircleQuestionMark, mt as ChartLine, n as X, q as ChevronRight, r as Wallet, tt as ArrowUpFromLine, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-Pe2PMluE.mjs";
import { t as useRole } from "./use-role-WpM-W494.mjs";
import { t as Route } from "./route-BVqdvdAT.mjs";
import { n as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-BTsIWXj_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		label: "Overview",
		items: [{
			to: "/dashboard",
			label: "Dashboard",
			icon: LayoutDashboard
		}]
	},
	{
		label: "Trading",
		items: [
			{
				to: "/candle-trade",
				label: "Candle Predict 🔥 HOT",
				icon: ChartCandlestick
			},
			{
				to: "/trade",
				label: "Pro Trader",
				icon: ChartLine
			},
			{
				to: "/history",
				label: "Trade History",
				icon: History
			},
			{
				to: "/alerts",
				label: "Price Alerts",
				icon: BellRing
			}
		]
	},
	{
		label: "Funds",
		items: [
			{
				to: "/wallet",
				label: "Wallet",
				icon: Wallet
			},
			{
				to: "/wallet/deposit",
				label: "Deposit",
				icon: ArrowDownToLine
			},
			{
				to: "/wallet/withdraw",
				label: "Withdraw",
				icon: ArrowUpFromLine
			}
		]
	},
	{
		label: "Account",
		items: [{
			to: "/notifications",
			label: "Notifications",
			icon: Bell
		}, {
			to: "/support",
			label: "Support",
			icon: CircleQuestionMark
		}]
	}
];
function AuthedLayout() {
	const { user } = Route.useRouteContext();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [totalBalance, setTotalBalance] = (0, import_react.useState)(null);
	const [unreadCount, setUnreadCount] = (0, import_react.useState)(0);
	const { isAdmin, isLoading: roleLoading } = useRole();
	const [mobileMenuOpen, setMobileMenuOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let sub = null;
		let cancelled = false;
		const fetchBalance = async (uid) => {
			const { data: ws } = await supabase.from("wallets").select("balance_cents").eq("user_id", uid).eq("wallet_type", "main").single();
			if (ws) setTotalBalance(ws.balance_cents ?? 0);
			const { count } = await supabase.from("notifications").select("id", {
				count: "exact",
				head: true
			}).eq("user_id", uid).eq("is_read", false);
			setUnreadCount(count ?? 0);
		};
		supabase.auth.getSession().then(({ data: { session } }) => {
			if (!session?.user || cancelled) return;
			const uid = session.user.id;
			fetchBalance(uid);
			const poll = setInterval(() => {
				if (!cancelled) fetchBalance(uid);
			}, 8e3);
			sub = supabase.channel(`header-balance-${uid}-${Date.now()}`).on("postgres_changes", {
				event: "UPDATE",
				schema: "public",
				table: "wallets",
				filter: `user_id=eq.${uid}`
			}, (payload) => {
				if (payload.new?.wallet_type === "main") setTotalBalance(payload.new.balance_cents ?? 0);
			}).on("postgres_changes", {
				event: "INSERT",
				schema: "public",
				table: "wallets",
				filter: `user_id=eq.${uid}`
			}, () => fetchBalance(uid)).on("postgres_changes", {
				event: "INSERT",
				schema: "public",
				table: "notifications",
				filter: `user_id=eq.${uid}`
			}, () => setUnreadCount((n) => n + 1)).subscribe();
			return () => clearInterval(poll);
		});
		return () => {
			cancelled = true;
			if (sub) supabase.removeChannel(sub);
		};
	}, []);
	const handleLogout = async () => {
		await queryClient.cancelQueries();
		queryClient.clear();
		await supabase.auth.signOut();
		toast.success("Signed out");
		navigate({
			to: "/auth",
			replace: true
		});
	};
	const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Trader";
	const initial = displayName.slice(0, 1).toUpperCase();
	(0, import_react.useEffect)(() => {
		setMobileMenuOpen(false);
	}, [pathname]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-screen overflow-hidden flex bg-background",
		children: pathname.startsWith("/admin") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-w-0 h-full overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden lg:flex flex-col w-64 h-full border-r border-sidebar-border bg-sidebar shrink-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-16 flex items-center px-6 border-b border-sidebar-border shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-3 border-b border-sidebar-border/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-glow shrink-0",
							children: initial
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium truncate",
								children: displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1.5 mt-0.5",
								children: roleLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-8 rounded bg-surface animate-pulse" }) : isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0 font-semibold",
									children: "ADMIN"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "text-[10px] px-1.5 py-0 h-4 bg-surface text-muted-foreground border border-border/60",
									children: "TRADER"
								})
							})]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex-1 p-3 space-y-4 overflow-y-auto overscroll-contain",
					children: [NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 font-semibold",
						children: group.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-0.5",
						children: group.items.map(({ to, label, icon: Icon }) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								className: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${pathname === to || to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to) || to === "/wallet" && pathname === "/wallet" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: label
								})]
							}, to);
						})
					})] }, group.label)), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-widest text-primary/60 px-3 pb-1.5 font-semibold",
						children: "Administration"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/overview",
						className: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all border ${pathname.startsWith("/admin") ? "bg-primary/15 text-primary border-primary/30 font-medium" : "text-primary/70 border-primary/15 hover:bg-primary/10 hover:text-primary"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin Panel" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 ml-auto opacity-60" })
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t border-sidebar-border space-y-0.5 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/profile",
							className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }), "Profile"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/settings",
							className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: handleLogout,
							className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "h-14 sm:h-16 border-b border-border/60 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-30 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 lg:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setMobileMenuOpen(true),
								className: "size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60 hover:bg-surface transition-colors",
								"aria-label": "Open menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden lg:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin/overview",
									className: "hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3" }), "Admin"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-surface/80 border border-border/60 min-w-0 max-w-[130px] sm:max-w-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3 text-muted-foreground shrink-0 hidden sm:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-semibold text-xs sm:text-sm tabular-nums transition-all duration-300 truncate",
										children: totalBalance === null ? "…" : `KES ${(totalBalance / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "size-9 p-0 relative",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/notifications",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center",
											children: unreadCount > 9 ? "9+" : unreadCount
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/profile",
									className: "size-9 rounded-full bg-gradient-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shadow-glow",
									children: initial
								})
							]
						})
					]
				}),
				mobileMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
					onClick: () => setMobileMenuOpen(false)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-14 flex items-center justify-between px-4 border-b border-sidebar-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setMobileMenuOpen(false),
								className: "size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60 transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-3 border-b border-sidebar-border/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0",
									children: initial
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold truncate",
										children: displayName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-1.5 mt-0.5",
										children: roleLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3.5 w-8 rounded bg-surface animate-pulse" }) : isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "text-[10px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-0",
											children: "ADMIN"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "text-[10px] px-1.5 py-0 h-4 bg-surface text-muted-foreground border border-border/60",
											children: "TRADER"
										})
									})]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex-1 overflow-y-auto p-3 space-y-4",
							children: [NAV_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 pb-1.5 font-semibold",
								children: group.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-0.5",
								children: group.items.map(({ to, label, icon: Icon }) => {
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to,
										className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${pathname === to || to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to) || to === "/wallet" && pathname === "/wallet" ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
									}, to);
								})
							})] }, group.label)), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] uppercase tracking-widest text-primary/60 px-3 pb-1.5 font-semibold",
								children: "Administration"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/admin/overview",
								className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm border transition-all ${pathname.startsWith("/admin") ? "bg-primary/15 text-primary border-primary/30 font-medium" : "text-primary/70 border-primary/15 hover:bg-primary/10"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin Panel" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3 ml-auto opacity-60" })
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 border-t border-sidebar-border space-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/profile",
									className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }), "Profile"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/settings",
									className: "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" }), "Settings"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleLogout,
									className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "Sign out"]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 overflow-y-auto pb-20 lg:pb-0 overscroll-contain",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border pb-[env(safe-area-inset-bottom)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 max-w-lg mx-auto",
						children: [
							{
								to: "/dashboard",
								label: "Home",
								icon: LayoutDashboard
							},
							{
								to: "/candle-trade",
								label: "🔥 Predict",
								icon: ChartCandlestick
							},
							{
								to: "/wallet/deposit",
								label: "Deposit",
								icon: ArrowDownToLine
							},
							{
								to: "/wallet",
								label: "Wallet",
								icon: Wallet
							},
							{
								to: "/profile",
								label: "Me",
								icon: User
							}
						].map(({ to, label, icon: Icon }) => {
							const active = pathname === to || to !== "/dashboard" && to !== "/wallet" && pathname.startsWith(to) || to === "/wallet" && pathname === "/wallet";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								className: `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `size-7 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-primary/15" : ""}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
								}), label]
							}, to);
						})
					})
				})
			]
		})] })
	});
}
//#endregion
export { AuthedLayout as component };
