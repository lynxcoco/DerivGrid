import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { ot as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { F as useRouter, O as redirect, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$30 } from "./auth-DCkRAm4_.mjs";
import { n as usePlatformSettings } from "./use-platform-settings-DHp5bHM-.mjs";
import { t as useRole } from "./use-role-WpM-W494.mjs";
import { t as Route$31 } from "./route-BVqdvdAT.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BBW1ioha.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BRRbwsGk.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var AUTH_ROUTES = ["/auth", "/forgot-password"];
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xl font-extrabold",
						children: "404"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl sm:text-3xl font-bold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-95",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	const router = useRouter();
	const isTransient = !error?.message || error.message.includes("rendered fewer hooks") || error.message.includes("rendered more hooks") || error.message.includes("Minified React error");
	(0, import_react.useEffect)(() => {
		console.error("[ErrorBoundary]", error);
		if (isTransient) {
			const t = setTimeout(() => {
				router.invalidate();
				reset();
			}, 100);
			return () => clearTimeout(t);
		}
	}, [
		error,
		isTransient,
		router,
		reset
	]);
	if (isTransient) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xl font-bold",
						children: "!"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-95",
						children: "Go home"
					})]
				})
			]
		})
	});
}
function MaintenanceScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-gradient-glow opacity-40",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-primary tracking-wider uppercase",
					children: "DerivGrid"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-2xl sm:text-3xl font-bold text-foreground",
					children: "Making things even better..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "We're rolling out improvements to speed and stability. Your funds and account data are safe — this is routine maintenance."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted-foreground",
					children: "We expect to be back shortly. Thanks for your patience."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-pulse" }), "Upgrade in progress"]
				})
			]
		})]
	});
}
var Route$29 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				name: "theme-color",
				content: "#0B0F1A"
			},
			{ title: "DerivGrid — Professional Online Trading Platform" },
			{
				name: "description",
				content: "Trade forex, synthetic indices, commodities, crypto and stocks on DerivGrid — a premium online brokerage with instant deposits via M-Pesa & card."
			},
			{
				name: "author",
				content: "DerivGrid"
			},
			{
				property: "og:title",
				content: "DerivGrid — Professional Online Trading Platform"
			},
			{
				property: "og:description",
				content: "A premium online trading platform with live markets, fast deposits and an enterprise-grade experience."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@DerivGrid"
			},
			{
				name: "twitter:title",
				content: "DerivGrid — Professional Online Trading Platform"
			},
			{
				name: "description",
				content: "A modern financial trading web app for immediate trading with secure login and fund deposits."
			},
			{
				property: "og:description",
				content: "A modern financial trading web app for immediate trading with secure login and fund deposits."
			},
			{
				name: "twitter:description",
				content: "A modern financial trading web app for immediate trading with secure login and fund deposits."
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon.png"
			},
			{
				rel: "apple-touch-icon",
				href: "/favicon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: `html,body{background-color:oklch(0.17 0.012 165);color:oklch(0.96 0.006 180);color-scheme:dark;margin:0;padding:0;font-family:Inter,system-ui,sans-serif}` } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$29.useRouteContext();
	const router = useRouter();
	const { isAdmin, isLoading: roleLoading } = useRole();
	const { settings, loaded: settingsLoaded } = usePlatformSettings();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		let pending = false;
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			if (pending) return;
			pending = true;
			setTimeout(() => {
				pending = false;
				router.invalidate();
				if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
			}, 100);
		});
		return () => sub.subscription.unsubscribe();
	}, [router, queryClient]);
	const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
	if ((settingsLoaded ? settings.maintenance_mode : false) && !roleLoading && settingsLoaded && !(isAuthRoute || isAdmin)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaintenanceScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			position: "top-right",
			theme: "dark",
			richColors: true,
			duration: 3e3
		})]
	});
}
var BASE_URL = "https://derivgrid.com";
var Route$28 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...[{
			path: "/",
			changefreq: "weekly",
			priority: "1.0"
		}, {
			path: "/auth",
			changefreq: "monthly",
			priority: "0.5"
		}].map((e) => `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`),
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$27 = () => import("./reset-password-CtGD0FRR.mjs");
var Route$27 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Set a new password · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./forgot-password-DsS8PNLs.mjs");
var Route$26 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [{ title: "Reset your password · DerivGrid" }, {
		name: "description",
		content: "Request a password reset link for your DerivGrid account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./routes-CFMM_1ob.mjs");
var Route$25 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "DerivGrid — Trade Forex, Indices, Crypto & More" },
		{
			name: "description",
			content: "Open a DerivGrid account in minutes. Deposit instantly via M-Pesa or card and trade global markets with professional tools."
		},
		{
			property: "og:title",
			content: "DerivGrid — Trade Smarter"
		},
		{
			property: "og:description",
			content: "Premium online trading. Forex, indices, crypto, commodities & stocks."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./wallet-CisLTp0r.mjs");
var Route$24 = createFileRoute("/_authenticated/wallet")({
	head: () => ({ meta: [{ title: "Wallet · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
/** Mask middle 3 digits of a phone number in a string */
/** Strip a trailing multiplier like "— 3.18x" and capitalize "win"/"loss" (e.g. "Candle win — 3.18x" -> "Candle Win") */
var $$splitComponentImporter$23 = () => import("./trade-BFoi1Efx.mjs");
var Route$23 = createFileRoute("/_authenticated/trade")({
	head: () => ({ meta: [{ title: "Trade · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./support-CS8MWE3O.mjs");
var Route$22 = createFileRoute("/_authenticated/support")({
	head: () => ({ meta: [{ title: "Support · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./settings-KbUuy0Fl.mjs");
var Route$21 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Settings · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./profile--pO7nQUS.mjs");
var Route$20 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [{ title: "Profile · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./notifications-B-A5jJC6.mjs");
var Route$19 = createFileRoute("/_authenticated/notifications")({
	head: () => ({ meta: [{ title: "Notifications · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./history-g8OtrZfW.mjs");
var Route$18 = createFileRoute("/_authenticated/history")({
	head: () => ({ meta: [{ title: "History · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./dashboard-Bk0JphR0.mjs");
var Route$17 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./candle-trade-CCpBVnn5.mjs");
var Route$16 = createFileRoute("/_authenticated/candle-trade")({
	head: () => ({ meta: [{ title: "Candle Predict · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./alerts-gvxbSo59.mjs");
var Route$15 = createFileRoute("/_authenticated/alerts")({
	head: () => ({ meta: [{ title: "Price Alerts · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./route-DypJp-Sp.mjs");
var Route$14 = createFileRoute("/_authenticated/admin")({
	beforeLoad: async () => {
		if (typeof window === "undefined") return {};
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw redirect({ to: "/auth" });
		const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
		if (error || !data) throw redirect({
			to: "/dashboard",
			search: { _adminDenied: "1" }
		});
		return { adminUser: user };
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./wallet.withdraw-DA5jxl7_.mjs");
var Route$13 = createFileRoute("/_authenticated/wallet/withdraw")({
	head: () => ({ meta: [{ title: "Withdraw · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
/** Normalise phone to 254XXXXXXXXX format */
/** Mask digits at positions 4-6 (the "middle three") with *** */
var $$splitComponentImporter$12 = () => import("./wallet.deposit-CNAh7kcu.mjs");
var Route$12 = createFileRoute("/_authenticated/wallet/deposit")({
	head: () => ({ meta: [{ title: "Deposit · DerivGrid" }] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
/** Normalise phone to 254XXXXXXXXX format */
/** Mask digits at positions 4-6 (the "middle three") with *** */
/** Fire a SasaPay C2B STK push request */
var $$splitComponentImporter$11 = () => import("./withdrawals-DaWu32B_.mjs");
var Route$11 = createFileRoute("/_authenticated/admin/withdrawals")({
	head: () => ({ meta: [{ title: "Withdrawals · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./users-D4tIYduI.mjs");
var Route$10 = createFileRoute("/_authenticated/admin/users")({
	head: () => ({ meta: [{ title: "Users · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./trades-DEVgY4fF.mjs");
var Route$9 = createFileRoute("/_authenticated/admin/trades")({
	head: () => ({ meta: [{ title: "Trades · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./tickets-CerwdN0g.mjs");
var Route$8 = createFileRoute("/_authenticated/admin/tickets")({
	head: () => ({ meta: [{ title: "Support Tickets · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./reports-J6XkMrKH.mjs");
var Route$7 = createFileRoute("/_authenticated/admin/reports")({
	head: () => ({ meta: [{ title: "Finance Reports · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./platform-settings-GqyrzcIo.mjs");
var Route$6 = createFileRoute("/_authenticated/admin/platform-settings")({
	head: () => ({ meta: [{ title: "Platform Settings · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./payment-config-DtKAZbE-.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/payment-config")({
	head: () => ({ meta: [{ title: "Payment Configuration · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./overview-D_7LblWU.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/overview")({
	head: () => ({ meta: [{ title: "Overview · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./deposits-DcVKGTIU.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/deposits")({
	head: () => ({ meta: [{ title: "Deposits · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./audit-BXtZPC7o.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/audit")({
	head: () => ({ meta: [{ title: "Audit Log · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./assets-DqLDS-ah.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/assets")({
	head: () => ({ meta: [{ title: "Assets · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./announcements-S-MeHZJq.mjs");
var Route = createFileRoute("/_authenticated/admin/announcements")({
	head: () => ({ meta: [{ title: "Announcements · Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SitemapDotxmlRoute = Route$28.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$29
});
var ResetPasswordRoute = Route$27.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$29
});
var ForgotPasswordRoute = Route$26.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$29
});
var AuthRoute = Route$30.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$29
});
var AuthenticatedRouteRoute = Route$31.update({
	id: "/_authenticated",
	getParentRoute: () => Route$29
});
var IndexRoute = Route$25.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$29
});
var AuthenticatedWalletRoute = Route$24.update({
	id: "/wallet",
	path: "/wallet",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTradeRoute = Route$23.update({
	id: "/trade",
	path: "/trade",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSupportRoute = Route$22.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSettingsRoute = Route$21.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$20.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedNotificationsRoute = Route$19.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedHistoryRoute = Route$18.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$17.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCandleTradeRoute = Route$16.update({
	id: "/candle-trade",
	path: "/candle-trade",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAlertsRoute = Route$15.update({
	id: "/alerts",
	path: "/alerts",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAdminRouteRoute = Route$14.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedWalletWithdrawRoute = Route$13.update({
	id: "/withdraw",
	path: "/withdraw",
	getParentRoute: () => AuthenticatedWalletRoute
});
var AuthenticatedWalletDepositRoute = Route$12.update({
	id: "/deposit",
	path: "/deposit",
	getParentRoute: () => AuthenticatedWalletRoute
});
var AuthenticatedAdminWithdrawalsRoute = Route$11.update({
	id: "/withdrawals",
	path: "/withdrawals",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminUsersRoute = Route$10.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminTradesRoute = Route$9.update({
	id: "/trades",
	path: "/trades",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminTicketsRoute = Route$8.update({
	id: "/tickets",
	path: "/tickets",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminReportsRoute = Route$7.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminPlatformSettingsRoute = Route$6.update({
	id: "/platform-settings",
	path: "/platform-settings",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminPaymentConfigRoute = Route$5.update({
	id: "/payment-config",
	path: "/payment-config",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminOverviewRoute = Route$4.update({
	id: "/overview",
	path: "/overview",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminDepositsRoute = Route$3.update({
	id: "/deposits",
	path: "/deposits",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminAuditRoute = Route$2.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminAssetsRoute = Route$1.update({
	id: "/assets",
	path: "/assets",
	getParentRoute: () => AuthenticatedAdminRouteRoute
});
var AuthenticatedAdminRouteRouteChildren = {
	AuthenticatedAdminAnnouncementsRoute: Route.update({
		id: "/announcements",
		path: "/announcements",
		getParentRoute: () => AuthenticatedAdminRouteRoute
	}),
	AuthenticatedAdminAssetsRoute,
	AuthenticatedAdminAuditRoute,
	AuthenticatedAdminDepositsRoute,
	AuthenticatedAdminOverviewRoute,
	AuthenticatedAdminPaymentConfigRoute,
	AuthenticatedAdminPlatformSettingsRoute,
	AuthenticatedAdminReportsRoute,
	AuthenticatedAdminTicketsRoute,
	AuthenticatedAdminTradesRoute,
	AuthenticatedAdminUsersRoute,
	AuthenticatedAdminWithdrawalsRoute
};
var AuthenticatedAdminRouteRouteWithChildren = AuthenticatedAdminRouteRoute._addFileChildren(AuthenticatedAdminRouteRouteChildren);
var AuthenticatedWalletRouteChildren = {
	AuthenticatedWalletDepositRoute,
	AuthenticatedWalletWithdrawRoute
};
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAdminRouteRoute: AuthenticatedAdminRouteRouteWithChildren,
	AuthenticatedAlertsRoute,
	AuthenticatedCandleTradeRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedHistoryRoute,
	AuthenticatedNotificationsRoute,
	AuthenticatedProfileRoute,
	AuthenticatedSettingsRoute,
	AuthenticatedSupportRoute,
	AuthenticatedTradeRoute,
	AuthenticatedWalletRoute: AuthenticatedWalletRoute._addFileChildren(AuthenticatedWalletRouteChildren)
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	ForgotPasswordRoute,
	ResetPasswordRoute,
	SitemapDotxmlRoute
};
var routeTree = Route$29._addFileChildren(rootRouteChildren)._addFileTypes();
function GlobalPendingComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex bg-background animate-pulse",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:flex flex-col w-64 border-r border-sidebar-border bg-sidebar shrink-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-16 flex items-center px-6 border-b border-sidebar-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-32 rounded-lg bg-sidebar-accent" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 space-y-2",
				children: [...Array(8)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-9 rounded-lg bg-sidebar-accent/60",
					style: { width: `${60 + Math.sin(i) * 20}%` }
				}, i))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-16 border-b border-border/60 bg-background flex items-center px-6 gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-28 rounded-lg bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full bg-surface" })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 p-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-64 rounded-lg bg-surface" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-2xl bg-surface" }, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 rounded-2xl bg-surface" })
				]
			})]
		})]
	});
}
function PageTransitionSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex-1 p-4 sm:p-6 lg:p-8 animate-pulse space-y-4 max-w-7xl mx-auto w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-7 w-48 rounded-lg bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-64 rounded-lg bg-surface/70" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-24 rounded-lg bg-surface hidden sm:block" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
				children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-2xl bg-surface" }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "lg:col-span-2 h-64 rounded-2xl bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-64 rounded-2xl bg-surface" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 rounded-2xl bg-surface" })
		]
	});
}
function RouteErrorBoundary({ error }) {
	if (!error?.message || error.message.includes("rendered fewer hooks") || error.message.includes("rendered more hooks") || error.message.includes("Minified React error") || error.message.includes("Cannot update a component")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransitionSkeleton, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[50vh] items-center justify-center p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center max-w-sm space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto text-xl font-bold",
					children: "!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: error?.message ?? "An unexpected error occurred."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => window.location.reload(),
					className: "mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity",
					children: "Reload page"
				})
			]
		})
	});
}
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient({ defaultOptions: { queries: {
			staleTime: 3e4,
			gcTime: 5 * 6e4,
			retry: 1,
			refetchOnWindowFocus: false
		} } }) },
		scrollRestoration: true,
		defaultPreloadStaleTime: 3e4,
		defaultPreload: "intent",
		defaultPendingComponent: GlobalPendingComponent,
		defaultPendingMs: 300,
		defaultPendingMinMs: 200,
		defaultErrorComponent: RouteErrorBoundary
	});
};
//#endregion
export { getRouter };
