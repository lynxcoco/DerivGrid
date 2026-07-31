import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { a as tick, r as formatPrice, t as ASSETS } from "./market-simulator-B0Vqq1wV.mjs";
import { A as Menu, _ as Smartphone, c as TrendingUp, ht as ChartColumn, mt as ChartLine, n as X, nt as ArrowRight, r as Wallet, t as Zap, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { P as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-Pe2PMluE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CFMM_1ob.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LANDING_WATCHLIST = [
	"EUR/USD",
	"BTC/USD",
	"XAU/USD",
	"Volatility 75",
	"AAPL"
];
function LiveTickerWidget() {
	const assets = ASSETS.filter((a) => LANDING_WATCHLIST.includes(a.symbol));
	const [ticks, setTicks] = (0, import_react.useState)(null);
	const timerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const snap = {};
		assets.forEach((a) => {
			snap[a.symbol] = tick(a);
		});
		setTicks(snap);
		timerRef.current = setInterval(() => {
			setTicks((prev) => {
				const next = { ...prev ?? {} };
				assets.forEach((a) => {
					next[a.symbol] = tick(a);
				});
				return next;
			});
		}, 1200);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-elevated p-5 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
				children: "Live markets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-profit animate-pulse" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: LANDING_WATCHLIST.map((sym) => {
				const t = ticks?.[sym];
				const asset = ASSETS.find((a) => a.symbol === sym);
				const up = (t?.changePct ?? 0) >= 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between py-2 border-b border-border/40 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-sm",
						children: sym
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 font-mono text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground tabular-nums",
							children: t && asset ? formatPrice(t.price, asset.pipSize) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-20 h-4 rounded bg-muted/40 animate-pulse" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs font-semibold w-14 text-right ${up ? "text-profit" : "text-loss"}`,
							children: t ? `${up ? "+" : ""}${t.changePct.toFixed(2)}%` : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-10 h-3 rounded bg-muted/40 animate-pulse" })
						})]
					})]
				}, sym);
			})
		})]
	});
}
var categories = [
	{
		icon: ChartColumn,
		name: "Synthetic Indices",
		desc: "24/7 simulated markets",
		count: "20+"
	},
	{
		icon: TrendingUp,
		name: "Volatility Indices",
		desc: "Constant volatility exposure",
		count: "15+"
	},
	{
		icon: ChartLine,
		name: "Commodities",
		desc: "Gold, silver, oil & more",
		count: "12+"
	},
	{
		icon: Zap,
		name: "Cryptocurrency",
		desc: "BTC, ETH and top altcoins",
		count: "30+"
	},
	{
		icon: ChartColumn,
		name: "Stocks & Indices",
		desc: "Global blue-chip equities",
		count: "100+"
	}
];
var features = [
	{
		icon: Zap,
		title: "Instant funding",
		desc: "Top up your account in seconds via mobile money or bank — funds reflect immediately."
	},
	{
		icon: ChartLine,
		title: "Pro-grade charts",
		desc: "Candlestick charts, multiple timeframes and technical indicators built in."
	},
	{
		icon: ShieldCheck,
		title: "Bank-level security",
		desc: "Encrypted sessions, secure authentication and full activity logging."
	},
	{
		icon: Smartphone,
		title: "Mobile-first",
		desc: "A premium experience on every device — trade from anywhere."
	}
];
function Landing() {
	const navigate = useNavigate();
	const [mobileNavOpen, setMobileNavOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const parseParams = (str) => new URLSearchParams(str.replace(/^[?#]/, ""));
		const qp = parseParams(window.location.search);
		const hp = parseParams(window.location.hash);
		const errorCode = qp.get("error_code") || hp.get("error_code");
		if (qp.get("error") || hp.get("error") || errorCode) {
			window.history.replaceState({}, "", "/");
			navigate({ to: "/reset-password" });
		}
		const accessToken = hp.get("access_token");
		const type = hp.get("type") || qp.get("type");
		if (accessToken && type === "recovery") {
			window.history.replaceState({}, "", "/");
			navigate({ to: "/reset-password" });
		}
	}, [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden md:flex items-center gap-8 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#markets",
									className: "relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
									children: "Markets"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#features",
									className: "relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
									children: "Features"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#pricing",
									className: "relative hover:text-foreground transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
									children: "Pricing"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									asChild: true,
									className: "hidden sm:inline-flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "Sign in"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										search: { tab: "register" },
										children: "Get started"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setMobileNavOpen(true),
									className: "md:hidden size-9 rounded-lg flex items-center justify-center border border-border/60 bg-surface/60",
									"aria-label": "Open menu",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								})
							]
						})
					]
				}), mobileNavOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:hidden fixed inset-0 z-50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
						onClick: () => setMobileNavOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute right-0 top-0 bottom-0 w-64 bg-sidebar border-l border-sidebar-border flex flex-col p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setMobileNavOpen(false),
									className: "size-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent/60",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
								className: "flex flex-col gap-4 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#markets",
										onClick: () => setMobileNavOpen(false),
										className: "text-muted-foreground hover:text-foreground transition-colors py-2",
										children: "Markets"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#features",
										onClick: () => setMobileNavOpen(false),
										className: "text-muted-foreground hover:text-foreground transition-colors py-2",
										children: "Features"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#pricing",
										onClick: () => setMobileNavOpen(false),
										className: "text-muted-foreground hover:text-foreground transition-colors py-2",
										children: "Pricing"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-auto flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									asChild: true,
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: "Sign in"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "w-full",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										search: { tab: "register" },
										children: "Get started"
									})
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-gradient-glow opacity-70",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-24 sm:pt-20 lg:pt-28 lg:pb-36",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-3xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-profit animate-pulse" }), "Live markets · Real-time pricing"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-6 text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] sm:leading-[1.08]",
									children: ["Trade global markets with", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent",
										children: "professional precision."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed",
									children: "Join thousands of traders who profit daily on DerivGrid — real-time forex, synthetic indices, crypto, commodities and stocks. Instant funding, lightning-fast execution, and payouts straight to your phone in minutes. Your edge starts here."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										asChild: true,
										className: "h-12 px-6 w-full sm:w-auto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/auth",
											search: { tab: "register" },
											children: ["Open free account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "lg",
										variant: "outline",
										asChild: true,
										className: "h-12 px-6 w-full sm:w-auto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/auth",
											children: "Sign in"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Markets",
											value: "200+"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Avg. execution",
											value: "<25ms"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Uptime",
											value: "99.99%"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden xl:block absolute right-6 top-24 w-[420px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveTickerWidget, {})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "markets",
				className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
						children: "Every market, one platform."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm sm:text-base text-muted-foreground",
						children: "Diversify across asset classes from a single account with unified margin."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
					children: categories.map(({ icon: Icon, name, desc, count }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "group relative rounded-2xl border border-border/60 bg-gradient-surface p-5 sm:p-6 shadow-card hover:shadow-elevated transition-all hover:-translate-y-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex size-10 sm:size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-300 group-hover:bg-primary/25 group-hover:scale-110",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-muted-foreground",
									children: count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 sm:mt-5 text-base sm:text-lg font-semibold",
								children: name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: desc
							})
						]
					}, name))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "features",
				className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight",
							children: "Built for traders who care about execution."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm sm:text-base text-muted-foreground",
							children: "Every detail — from chart rendering to order routing — is engineered to feel fast, calm and trustworthy."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 sm:mt-8 grid sm:grid-cols-2 gap-4 sm:gap-5",
							children: features.map(({ icon: Icon, title, desc }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border/60 bg-surface/60 p-4 sm:p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-3 font-semibold text-sm sm:text-base",
										children: title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: desc
									})
								]
							}, title))
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-3xl border border-border/60 bg-gradient-surface p-2 shadow-elevated",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-background/60 p-5 sm:p-6 h-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePriceDisplay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 400 160",
								className: "mt-6 w-full h-32 sm:h-40",
								preserveAspectRatio: "none",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "g",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: "oklch(0.72 0.17 162)",
											stopOpacity: "0.5"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: "oklch(0.72 0.17 162)",
											stopOpacity: "0"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,75 L280,40 L320,55 L360,30 L400,45 L400,160 L0,160 Z",
										fill: "url(#g)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M0,120 L40,100 L80,110 L120,80 L160,90 L200,60 L240,75 L280,40 L320,55 L360,30 L400,45",
										fill: "none",
										stroke: "oklch(0.72 0.17 162)",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round"
									})
								]
							})]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "pricing",
				className: "mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-surface p-8 sm:p-12 lg:p-14 shadow-elevated text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-gradient-glow opacity-50",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight",
								children: "Ready to trade smarter?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto",
								children: "Create an account in minutes. No KYC required to start — deposit and begin trading instantly."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								asChild: true,
								className: "mt-6 sm:mt-8 h-12 px-6 sm:px-7 w-full sm:w-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/auth",
									search: { tab: "register" },
									children: ["Open your account", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1.5 size-4 transition-transform group-hover:translate-x-0.5" })]
								})
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border/50 py-8 sm:py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground text-center sm:text-right",
						children: "© 2026 DerivGrid. All rights reserved. Trading involves risk."
					})]
				})
			})
		]
	});
}
function LivePriceDisplay() {
	const btcAsset = ASSETS.find((a) => a.symbol === "BTC/USD");
	const [t, setT] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setT(tick(btcAsset));
		const id = setInterval(() => setT(tick(btcAsset)), 1500);
		return () => clearInterval(id);
	}, []);
	const up = (t?.changePct ?? 0) >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground uppercase tracking-wider",
			children: "BTC/USD"
		}), t ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xl font-mono font-semibold mt-1",
			children: formatPrice(t.price, btcAsset.pipSize)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: `text-sm font-mono ${up ? "text-profit" : "text-loss"}`,
			children: [
				up ? "+" : "",
				t.change.toFixed(2),
				" (",
				up ? "+" : "",
				t.changePct.toFixed(2),
				"%)"
			]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-36 rounded bg-muted/40 animate-pulse mt-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-24 rounded bg-muted/40 animate-pulse mt-1" })] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-8 text-primary/40" })]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xl sm:text-2xl font-bold font-mono",
		children: value
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1",
		children: label
	})] });
}
//#endregion
export { Landing as component };
