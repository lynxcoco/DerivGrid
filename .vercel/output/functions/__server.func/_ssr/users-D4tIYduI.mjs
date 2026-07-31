import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { J as ChevronDown, S as Search, T as RefreshCw, V as Download, a as User, c as TrendingUp, it as ArrowDownToLine, l as TrendingDown, n as X, o as UserCheck, r as Wallet, tt as ArrowUpFromLine, v as Shield, z as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-D4tIYduI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ALL_ROLES = [
	"user",
	"marketer",
	"support",
	"admin"
];
var ROLE_BADGE = {
	admin: "bg-primary/15 text-primary border-primary/25",
	marketer: "bg-warning/15 text-warning border-warning/25",
	support: "bg-profit/15 text-profit border-profit/25",
	user: "bg-surface text-muted-foreground border-border/60"
};
var ROLE_LABEL = {
	admin: "Admin",
	marketer: "Marketer",
	support: "Support",
	user: "User"
};
var STATUS_BADGE = {
	completed: "bg-profit/15 text-profit",
	pending: "bg-warning/15 text-warning",
	failed: "bg-loss/15 text-loss",
	cancelled: "bg-muted/20 text-muted-foreground",
	processing: "bg-primary/15 text-primary"
};
var fmt = (c) => `KES ${(Math.abs(c) / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
var fmtD = (s) => new Date(s).toLocaleString("en-KE", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
});
function primaryRole(roles) {
	if (roles.includes("admin")) return "admin";
	if (roles.includes("support")) return "support";
	if (roles.includes("marketer")) return "marketer";
	return "user";
}
function downloadCSV(filename, headers, rows) {
	const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function UserDetailDrawer({ detail, onClose }) {
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [depFilter, setDepFilter] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		if (detail) setTab("overview");
	}, [detail?.user.id]);
	if (!detail) return null;
	const { user, deposits, withdrawals, bets } = detail;
	const completedDeps = deposits.filter((d) => d.status === "completed");
	const completedWds = withdrawals.filter((w) => w.status === "completed");
	const totalDep = completedDeps.reduce((s, d) => s + d.amount_cents, 0);
	const totalWd = completedWds.reduce((s, w) => s + w.amount_cents, 0);
	const totalStaked = bets.reduce((s, b) => s + b.bet_amount_cents, 0);
	const winBets = bets.filter((b) => b.outcome === "win");
	const totalWon = winBets.reduce((s, b) => s + b.gross_return_cents, 0);
	const houseTake = totalStaked - totalWon;
	const winRate = bets.length > 0 ? (winBets.length / bets.length * 100).toFixed(1) : "0.0";
	const visibleDeps = depFilter === "all" ? deposits : deposits.filter((d) => d.status === depFilter);
	const exportDeposits = () => downloadCSV(`deposits_${user.full_name ?? user.id.slice(0, 8)}.csv`, [
		"Date",
		"Amount (KES)",
		"Status",
		"Phone",
		"Reference"
	], deposits.map((d) => [
		fmtD(d.created_at),
		(d.amount_cents / 100).toFixed(2),
		d.status,
		d.phone ?? "",
		d.provider_ref ?? ""
	]));
	const exportWithdrawals = () => downloadCSV(`withdrawals_${user.full_name ?? user.id.slice(0, 8)}.csv`, [
		"Date",
		"Amount (KES)",
		"Status",
		"Phone",
		"Reference"
	], withdrawals.map((w) => [
		fmtD(w.created_at),
		(w.amount_cents / 100).toFixed(2),
		w.status,
		w.phone ?? "",
		w.provider_ref ?? ""
	]));
	const TABS = [
		{
			key: "overview",
			label: "Overview"
		},
		{
			key: "deposits",
			label: `Deposits (${deposits.length})`
		},
		{
			key: "withdrawals",
			label: `Withdrawals (${withdrawals.length})`
		},
		{
			key: "bets",
			label: `Bets (${bets.length})`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm",
		onClick: onClose
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-background border-l border-border/60 flex flex-col shadow-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-9 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0",
						children: (user.full_name ?? "?").slice(0, 1).toUpperCase()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold truncate",
							children: user.full_name ?? "Unknown"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground font-mono",
							children: user.id
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "size-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex border-b border-border/40 shrink-0 overflow-x-auto",
				children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(t.key),
					className: `px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`,
					children: t.label
				}, t.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto",
				children: [
					tab === "overview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-border/50 bg-surface/40 divide-y divide-border/30",
								children: [
									["Phone", user.phone ?? "—"],
									["Country", user.country ?? "—"],
									["Joined", new Date(user.created_at).toLocaleDateString("en-KE", {
										day: "2-digit",
										month: "long",
										year: "numeric"
									})],
									["Role", primaryRole(user.roles)],
									["Balance", fmt(user.balance)]
								].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between px-4 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium capitalize",
										children: value
									})]
								}, label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3",
								children: "Financial summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									{
										label: "Total deposited",
										value: fmt(totalDep),
										sub: `${completedDeps.length} completed`,
										icon: ArrowDownToLine,
										color: "text-profit",
										bg: "bg-profit/10"
									},
									{
										label: "Total withdrawn",
										value: fmt(totalWd),
										sub: `${completedWds.length} completed`,
										icon: ArrowUpFromLine,
										color: "text-loss",
										bg: "bg-loss/10"
									},
									{
										label: "Current balance",
										value: fmt(user.balance),
										sub: "wallet balance",
										icon: Wallet,
										color: "text-primary",
										bg: "bg-primary/10"
									},
									{
										label: "Net deposited",
										value: `${totalDep - totalWd >= 0 ? "+" : "−"}${fmt(totalDep - totalWd)}`,
										sub: "deposits minus withdrawals",
										icon: totalDep - totalWd >= 0 ? TrendingUp : TrendingDown,
										color: totalDep - totalWd >= 0 ? "text-profit" : "text-loss",
										bg: totalDep - totalWd >= 0 ? "bg-profit/10" : "bg-loss/10"
									},
									{
										label: "Total staked",
										value: fmt(totalStaked),
										sub: `${bets.length} bets`,
										icon: TrendingUp,
										color: "text-primary",
										bg: "bg-primary/10"
									},
									{
										label: "User win rate",
										value: `${winRate}%`,
										sub: `${winBets.length} wins / ${bets.length} bets`,
										icon: TrendingUp,
										color: "text-warning",
										bg: "bg-warning/10"
									}
								].map(({ label, value, sub, icon: Icon, color, bg }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border/50 bg-gradient-surface p-3.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `size-7 rounded-lg ${bg} flex items-center justify-center mb-2`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 ${color}` })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground uppercase tracking-wide",
											children: label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-sm font-bold font-mono mt-0.5 ${color}`,
											children: value
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground mt-0.5",
											children: sub
										})
									]
								}, label))
							})] }),
							(deposits.some((d) => d.status === "pending") || withdrawals.some((w) => w.status === "pending")) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-xs text-warning",
								children: "⚠ This user has pending transactions. Review Deposits / Withdrawals tabs."
							})
						]
					}),
					tab === "deposits" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "Total deposited"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-profit font-mono mt-0.5",
												children: fmt(totalDep)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground",
												children: [completedDeps.length, " completed"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "Pending"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-warning font-mono mt-0.5",
												children: deposits.filter((d) => d.status === "pending").length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "transactions"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "All time"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold font-mono mt-0.5",
												children: deposits.length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "total records"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [[
									"all",
									"completed",
									"pending",
									"failed",
									"cancelled"
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setDepFilter(s),
									className: `px-2.5 py-1 rounded-lg text-[10px] font-medium border capitalize transition-all ${depFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`,
									children: s
								}, s)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: exportDeposits,
									className: "ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-border/60 text-muted-foreground hover:text-foreground transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), "CSV"]
								})]
							}),
							visibleDeps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground text-center py-8",
								children: "No deposits found."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-border/50 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/40 bg-surface/40 text-muted-foreground uppercase",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-4 py-2.5 font-semibold",
													children: "Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-right px-3 py-2.5 font-semibold",
													children: "Amount"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-3 py-2.5 font-semibold",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-3 py-2.5 font-semibold hidden sm:table-cell",
													children: "Reference"
												})
											]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visibleDeps.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/20 hover:bg-surface/30 last:border-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-2.5 text-muted-foreground tabular-nums",
													children: new Date(d.created_at).toLocaleString("en-KE", {
														day: "2-digit",
														month: "short",
														hour: "2-digit",
														minute: "2-digit"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5 text-right font-mono font-semibold text-profit",
													children: fmt(d.amount_cents)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: `text-[10px] border-0 capitalize ${STATUS_BADGE[d.status] ?? ""}`,
														children: d.status
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5 font-mono text-muted-foreground hidden sm:table-cell truncate max-w-[100px]",
													children: d.provider_ref ?? "—"
												})
											]
										}, d.id)) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t-2 border-border/40 bg-surface/50",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-4 py-2 font-bold text-muted-foreground",
													children: [visibleDeps.length, " records"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2 text-right font-mono font-bold text-profit",
													children: fmt(visibleDeps.reduce((s, d) => s + d.amount_cents, 0))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 2 })
											]
										}) })
									]
								})
							})
						]
					}),
					tab === "withdrawals" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "Total withdrawn"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-loss font-mono mt-0.5",
												children: fmt(totalWd)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-muted-foreground",
												children: [completedWds.length, " completed"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "Pending"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold text-warning font-mono mt-0.5",
												children: withdrawals.filter((w) => w.status === "pending").length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "awaiting approval"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border/50 bg-surface/40 p-3 text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground uppercase tracking-wide",
												children: "All time"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-bold font-mono mt-0.5",
												children: withdrawals.length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: "total records"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: exportWithdrawals,
									className: "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-border/60 text-muted-foreground hover:text-foreground transition-all",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3" }), "Export CSV"]
								})
							}),
							withdrawals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground text-center py-8",
								children: "No withdrawals found."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-border/50 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/40 bg-surface/40 text-muted-foreground uppercase",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-4 py-2.5 font-semibold",
													children: "Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-right px-3 py-2.5 font-semibold",
													children: "Amount"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-3 py-2.5 font-semibold",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "text-left px-3 py-2.5 font-semibold hidden sm:table-cell",
													children: "Reference"
												})
											]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: withdrawals.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b border-border/20 hover:bg-surface/30 last:border-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-2.5 text-muted-foreground tabular-nums",
													children: new Date(w.created_at).toLocaleString("en-KE", {
														day: "2-digit",
														month: "short",
														hour: "2-digit",
														minute: "2-digit"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-3 py-2.5 text-right font-mono font-semibold text-loss",
													children: ["−", fmt(w.amount_cents)]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: `text-[10px] border-0 capitalize ${STATUS_BADGE[w.status] ?? ""}`,
														children: w.status
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5 font-mono text-muted-foreground hidden sm:table-cell truncate max-w-[100px]",
													children: w.provider_ref ?? "—"
												})
											]
										}, w.id)) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-t-2 border-border/40 bg-surface/50",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-4 py-2 font-bold text-muted-foreground",
													children: [withdrawals.length, " records"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-3 py-2 text-right font-mono font-bold text-loss",
													children: ["−", fmt(withdrawals.reduce((s, w) => s + w.amount_cents, 0))]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: 2 })
											]
										}) })
									]
								})
							})
						]
					}),
					tab === "bets" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [
								{
									label: "Total staked",
									value: fmt(totalStaked),
									color: "text-primary"
								},
								{
									label: "Total payouts",
									value: fmt(totalWon),
									color: "text-warning"
								},
								{
									label: "Win rate",
									value: `${winRate}%`,
									color: "text-profit"
								},
								{
									label: "House take",
									value: `${houseTake >= 0 ? "+" : "−"}${fmt(houseTake)}`,
									color: houseTake >= 0 ? "text-profit" : "text-loss"
								}
							].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border/50 bg-surface/40 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground uppercase tracking-wide",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: `text-sm font-bold font-mono mt-0.5 ${color}`,
									children: value
								})]
							}, label))
						}), bets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground text-center py-8",
							children: "No bets found."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-border/50 overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border/40 bg-surface/40 text-muted-foreground uppercase",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-4 py-2.5 font-semibold",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-3 py-2.5 font-semibold",
												children: "Stake"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-left px-3 py-2.5 font-semibold",
												children: "Result"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "text-right px-3 py-2.5 font-semibold",
												children: "Payout"
											})
										]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: bets.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b border-border/20 hover:bg-surface/30 last:border-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-2.5 text-muted-foreground tabular-nums",
												children: new Date(b.created_at).toLocaleString("en-KE", {
													day: "2-digit",
													month: "short",
													hour: "2-digit",
													minute: "2-digit"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5 text-right font-mono",
												children: fmt(b.bet_amount_cents)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: `text-[10px] border-0 font-bold ${b.outcome === "win" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`,
													children: b.outcome === "win" ? "WIN" : "LOSS"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: `px-3 py-2.5 text-right font-mono font-semibold ${b.outcome === "win" ? "text-profit" : "text-muted-foreground"}`,
												children: b.outcome === "win" ? fmt(b.gross_return_cents) : "—"
											})
										]
									}, b.id)) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t-2 border-border/40 bg-surface/50",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-4 py-2 font-bold text-muted-foreground",
												children: [bets.length, " bets"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-right font-mono font-bold",
												children: fmt(totalStaked)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-3 py-2 text-right font-mono font-bold text-warning",
												children: fmt(totalWon)
											})
										]
									}) })
								]
							})
						})]
					})
				]
			})
		]
	})] });
}
function AdminUsers() {
	const [users, setUsers] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [acting, setActing] = (0, import_react.useState)(null);
	const [roleMenu, setRoleMenu] = (0, import_react.useState)(null);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const [detailLoading, setDetailLoading] = (0, import_react.useState)(false);
	const load = async () => {
		setLoading(true);
		const [{ data: profiles }, { data: allRoles }, { data: wallets }] = await Promise.all([
			supabase.from("profiles").select("id, full_name, phone, country, created_at").order("created_at", { ascending: false }).limit(300),
			supabase.rpc("admin_get_all_roles"),
			supabase.from("wallets").select("user_id, balance_cents").eq("wallet_type", "main")
		]);
		const roleMap = {};
		for (const r of allRoles ?? []) {
			const uid = r.user_id;
			const role = r.role;
			if (!roleMap[uid]) roleMap[uid] = [];
			if (!roleMap[uid].includes(role)) roleMap[uid].push(role);
		}
		const balMap = {};
		for (const w of wallets ?? []) balMap[w.user_id] = w.balance_cents;
		setUsers((profiles ?? []).map((p) => ({
			id: p.id,
			full_name: p.full_name,
			phone: p.phone,
			country: p.country,
			created_at: p.created_at,
			roles: roleMap[p.id] ?? [],
			balance: balMap[p.id] ?? 0
		})));
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!roleMenu) return;
		const h = () => setRoleMenu(null);
		document.addEventListener("click", h);
		return () => document.removeEventListener("click", h);
	}, [roleMenu]);
	const openDetail = async (user) => {
		setDetail({
			user,
			deposits: [],
			withdrawals: [],
			bets: []
		});
		setDetailLoading(true);
		const [{ data: deps }, { data: wds }, { data: bs }] = await Promise.all([
			supabase.from("deposits").select("id, amount_cents, currency, status, phone, provider_ref, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
			supabase.from("withdrawals").select("id, amount_cents, currency, status, phone, provider_ref, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
			supabase.from("candle_bets").select("id, bet_amount_cents, outcome, gross_return_cents, net_profit_cents, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500)
		]);
		setDetail({
			user,
			deposits: deps ?? [],
			withdrawals: wds ?? [],
			bets: bs ?? []
		});
		setDetailLoading(false);
	};
	const assignRole = async (userId, newRole) => {
		setActing(userId);
		setRoleMenu(null);
		try {
			const { error } = await supabase.rpc("admin_set_user_role", {
				_user_id: userId,
				_new_role: newRole
			});
			if (error) throw new Error(error.message);
			toast.success(`Role updated to ${ROLE_LABEL[newRole]}`);
			load();
		} catch (e) {
			toast.error(e?.message ?? "Failed to update role");
		} finally {
			setActing(null);
		}
	};
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.toLowerCase();
		return users.filter((u) => (u.full_name ?? "").toLowerCase().includes(q) || (u.phone ?? "").includes(q) || u.id.toLowerCase().includes(q));
	}, [users, search]);
	const stats = {
		total: users.length,
		admins: users.filter((u) => u.roles.includes("admin")).length,
		marketers: users.filter((u) => u.roles.includes("marketer")).length,
		support: users.filter((u) => u.roles.includes("support")).length
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold",
						children: "Users"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-0.5",
						children: [
							stats.total,
							" total · ",
							stats.admins,
							" admin",
							stats.admins !== 1 ? "s" : "",
							" · ",
							stats.marketers,
							" marketer",
							stats.marketers !== 1 ? "s" : "",
							" · ",
							stats.support,
							" support"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: load,
						disabled: loading,
						className: "gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Refresh"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name, phone or ID…",
						className: "pl-9 h-9",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-6 space-y-3",
						children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded-lg" }, i))
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-16 text-center text-sm text-muted-foreground",
						children: "No users found."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/40 bg-surface/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
										children: "User"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell",
										children: "Contact"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Balance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell",
										children: "Joined"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((u) => {
								const pRole = primaryRole(u.roles);
								const isOpen = roleMenu === u.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border/20 hover:bg-surface/40 transition-colors last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-5 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-8 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0",
													children: (u.full_name ?? "?").slice(0, 1).toUpperCase()
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-medium truncate max-w-[140px]",
														children: u.full_name ?? "—"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[10px] text-muted-foreground font-mono",
														children: [u.id.slice(0, 14), "…"]
													})]
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3.5 hidden sm:table-cell",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs",
												children: u.phone ?? "—"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[10px] text-muted-foreground",
												children: u.country ?? "—"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-sm font-semibold",
												children: fmt(u.balance)
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 text-xs text-muted-foreground hidden md:table-cell",
											children: new Date(u.created_at).toLocaleDateString("en-KE", {
												day: "2-digit",
												month: "short",
												year: "numeric"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: `text-[10px] capitalize ${ROLE_BADGE[pRole] ?? ""}`,
												children: ROLE_LABEL[pRole] ?? pRole
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-end gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													onClick: () => openDetail(u),
													className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 hover:bg-surface text-xs font-medium transition-all",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3 text-muted-foreground" }), "View"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "relative",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														disabled: acting === u.id,
														onClick: (e) => {
															e.stopPropagation();
															setRoleMenu(isOpen ? null : u.id);
														},
														className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-surface/60 hover:bg-surface text-xs font-medium transition-all disabled:opacity-50",
														children: acting === u.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3 text-muted-foreground" }),
															"Role",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-3 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}` })
														] })
													}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														onClick: (e) => e.stopPropagation(),
														className: "absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-border/60 bg-popover shadow-elevated overflow-hidden",
														children: ALL_ROLES.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															onClick: () => assignRole(u.id, role),
															className: `w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-surface/80 transition-colors text-left ${pRole === role ? "font-semibold" : ""}`,
															children: [
																role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5 text-primary" }),
																role === "marketer" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 text-warning" }),
																role === "support" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 text-profit" }),
																role === "user" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 text-muted-foreground" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ROLE_LABEL[role] }),
																pRole === role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "ml-auto text-[10px] text-muted-foreground",
																	children: "current"
																})
															]
														}, role))
													})]
												})]
											})
										})
									]
								}, u.id);
							}) })]
						})
					})
				})
			]
		}),
		detailLoading && detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" }),
		detailLoading && detail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-y-0 right-0 z-50 w-full sm:w-[520px] bg-background border-l border-border/60 flex flex-col shadow-2xl p-5 space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-48 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-8 rounded-lg" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-full rounded-lg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [...Array(6)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
			]
		}),
		!detailLoading && detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserDetailDrawer, {
			detail,
			onClose: () => setDetail(null)
		})
	] });
}
//#endregion
export { AdminUsers as component };
