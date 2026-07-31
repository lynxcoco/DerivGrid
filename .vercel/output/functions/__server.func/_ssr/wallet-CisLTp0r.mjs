import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { G as CircleDot, J as ChevronDown, T as RefreshCw, c as TrendingUp, it as ArrowDownToLine, l as TrendingDown, r as Wallet, tt as ArrowUpFromLine } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-CisLTp0r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fmt(cents, currency = "KES") {
	const abs = Math.abs(cents / 100);
	return currency === "KES" ? `KES ${abs.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : `$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
/** Mask middle 3 digits of a phone number in a string */
function maskPhoneInText(text) {
	return text.replace(/2547\d{8}/g, (match) => {
		const chars = match.split("");
		for (let i = 4; i < 7; i++) chars[i] = "*";
		return chars.join("");
	});
}
/** Strip a trailing multiplier like "— 3.18x" and capitalize "win"/"loss" (e.g. "Candle win — 3.18x" -> "Candle Win") */
function stripMultiplier(text) {
	return text.replace(/\s*[—-]\s*[\d.]+x\b/gi, "").replace(/\bwin\b/gi, "Win").replace(/\bloss\b/gi, "Loss");
}
var TX_LABEL = {
	deposit: "Deposit",
	withdrawal: "Withdrawal",
	transfer_in: "Transfer In",
	transfer_out: "Transfer Out",
	trade_profit: "Trade Profit",
	trade_loss: "Trade Loss",
	fee: "Fee"
};
var TX_COLOR = {
	deposit: "text-profit",
	transfer_in: "text-profit",
	trade_profit: "text-profit",
	withdrawal: "text-loss",
	transfer_out: "text-loss",
	trade_loss: "text-loss",
	fee: "text-muted-foreground"
};
var TX_BG = {
	deposit: "bg-profit/15",
	transfer_in: "bg-profit/15",
	trade_profit: "bg-profit/15",
	withdrawal: "bg-loss/15",
	transfer_out: "bg-loss/15",
	trade_loss: "bg-loss/15",
	fee: "bg-muted/20"
};
function TxIcon({ type }) {
	if ([
		"deposit",
		"transfer_in",
		"trade_profit"
	].includes(type)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-3.5" });
	if ([
		"withdrawal",
		"transfer_out",
		"trade_loss"
	].includes(type)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-3.5" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, { className: "size-3.5" });
}
var PAGE = 15;
function WalletPage() {
	const isSubRoute = useRouterState({ select: (s) => s.location.pathname }) !== "/wallet";
	const [wallets, setWallets] = (0, import_react.useState)([]);
	const [transactions, setTransactions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [txLoading, setTxLoading] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(0);
	const [hasMore, setHasMore] = (0, import_react.useState)(true);
	const loadWallets = async () => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user.id);
		if (error) {
			toast.error("Could not load wallet");
			return;
		}
		setWallets(data);
	};
	const loadTx = async (reset = false) => {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		setTxLoading(true);
		const pg = reset ? 0 : page;
		const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).range(pg * PAGE, pg * PAGE + PAGE - 1);
		if (data) {
			if (reset) {
				setTransactions(data);
				setPage(1);
			} else {
				setTransactions((p) => [...p, ...data]);
				setPage(pg + 1);
			}
			setHasMore(data.length === PAGE);
		}
		setTxLoading(false);
	};
	(0, import_react.useEffect)(() => {
		(async () => {
			setLoading(true);
			await Promise.all([loadWallets(), loadTx(true)]);
			setLoading(false);
		})();
	}, []);
	const main = wallets.find((w) => w.wallet_type === "main");
	if (isSubRoute) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 max-w-2xl lg:max-w-4xl mx-auto space-y-4 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold",
					children: "Wallet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Balance and transactions."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => {
						loadWallets();
						loadTx(true);
					},
					disabled: loading,
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-4 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative rounded-2xl border border-primary/30 bg-gradient-surface shadow-glow overflow-hidden p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold",
									children: "Available balance"
								}),
								loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-8 w-36 rounded-lg" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-2xl sm:text-3xl font-bold font-mono leading-none",
									children: fmt(main?.balance_cents ?? 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] text-muted-foreground",
									children: "Kenyan Shillings"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-4 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet/deposit",
							className: "flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-4 shrink-0" }), "Deposit"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/wallet/withdraw",
							className: "flex items-center justify-center gap-2 h-10 rounded-xl border border-border/60 bg-surface text-foreground text-sm font-semibold hover:bg-surface/80 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpFromLine, { className: "size-4 shrink-0" }), "Withdraw"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 py-3 border-b border-border/50 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-sm",
						children: "Transactions"
					}), !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [transactions.length, " records"]
					})]
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-3 space-y-2",
					children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-xl" }, i))
				}) : transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-14 text-center px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-9 text-muted-foreground/30 mx-auto mb-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-muted-foreground",
							children: "No transactions yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Make your first deposit to get started."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border/30",
					children: transactions.map((tx) => {
						const isCredit = tx.amount_cents >= 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 hover:bg-surface/40 transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `size-8 rounded-lg flex items-center justify-center shrink-0 ${TX_BG[tx.type] ?? "bg-muted/20"} ${TX_COLOR[tx.type] ?? "text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxIcon, { type: tx.type })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold leading-tight",
											children: TX_LABEL[tx.type] ?? tx.type
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground mt-0.5",
											children: new Date(tx.created_at).toLocaleDateString("en-KE", {
												day: "2-digit",
												month: "short",
												year: "numeric"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: `text-sm font-bold font-mono shrink-0 ${TX_COLOR[tx.type] ?? ""}`,
										children: [isCredit ? "+" : "−", fmt(tx.amount_cents, tx.currency)]
									})
								]
							}), tx.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-muted-foreground mt-1.5 ml-11 leading-snug line-clamp-2",
								children: stripMultiplier(maskPhoneInText(tx.description))
							})]
						}, tx.id);
					})
				}), hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-3 border-t border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						className: "w-full text-xs gap-1.5",
						disabled: txLoading,
						onClick: () => loadTx(false),
						children: txLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" }), "Load more"] })
					})
				})] })]
			})
		]
	});
}
//#endregion
export { WalletPage as component };
