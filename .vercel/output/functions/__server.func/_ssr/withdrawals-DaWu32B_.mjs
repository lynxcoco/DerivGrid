import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { T as RefreshCw, ct as CircleX, dt as CircleCheck, ot as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/withdrawals-DaWu32B_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ANON_KEY = "sb_publishable_CfibYkdx9UyiVEm0h3oW6A_7MlgOr8k";
var SASAPAY_FN = `https://oevuqograxqkensvqxzt.supabase.co/functions/v1/sasapay-proxy`;
var STATUS_COLOR = {
	completed: "bg-profit/15 text-profit border-profit/25",
	pending: "bg-warning/15 text-warning border-warning/25",
	processing: "bg-primary/15 text-primary border-primary/25",
	failed: "bg-loss/15 text-loss border-loss/25",
	cancelled: "bg-muted/30 text-muted-foreground border-border/40"
};
var FILTERS = [
	"all",
	"pending",
	"processing",
	"completed",
	"cancelled",
	"failed"
];
var fmtDate = (s) => new Date(s).toLocaleString("en-KE", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
});
var fmtKes = (cents, cur = "KES") => `${cur} ${(cents / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
function AdminWithdrawals() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [processing, setProcessing] = (0, import_react.useState)(null);
	const processingRef = (0, import_react.useRef)(null);
	const load = async () => {
		setLoading(true);
		let q = supabase.from("withdrawals").select("*").order("created_at", { ascending: false }).limit(200);
		if (filter !== "all") q = q.eq("status", filter);
		const { data } = await q;
		setRows(data ?? []);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		load();
	}, [filter]);
	const approve = async (w) => {
		if (processingRef.current) return;
		processingRef.current = w.id;
		setProcessing(w.id);
		try {
			const claimRes = await supabase.from("withdrawals").update({
				status: "processing",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", w.id).eq("status", "pending").select("id").single();
			if (claimRes.error || !claimRes.data) {
				const { data: current } = await supabase.from("withdrawals").select("status").eq("id", w.id).single();
				toast.error(`Cannot approve — already ${current?.status ?? "processing"}`);
				return;
			}
			if (!w.phone) {
				await Promise.all([
					supabase.from("withdrawals").update({
						status: "completed",
						updated_at: (/* @__PURE__ */ new Date()).toISOString()
					}).eq("id", w.id),
					supabase.from("transactions").insert({
						user_id: w.user_id,
						wallet_id: w.wallet_id,
						type: "withdrawal",
						amount_cents: -w.amount_cents,
						currency: w.currency,
						description: "Withdrawal approved (manual — no phone on file)"
					}),
					supabase.from("notifications").insert({
						user_id: w.user_id,
						title: "Withdrawal approved",
						body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal has been approved.`,
						type: "info",
						is_read: false
					})
				]);
				toast.success("Withdrawal approved manually (no phone on file)");
				load();
				return;
			}
			const merchantTransRef = `SD-WD-${w.id.slice(0, 8)}-${Date.now()}`;
			await supabase.from("withdrawals").update({ provider_ref: merchantTransRef }).eq("id", w.id);
			try {
				const res = await fetch(`${SASAPAY_FN}?action=b2c`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"apikey": ANON_KEY
					},
					body: JSON.stringify({
						phone: w.phone,
						amount: Math.round(w.amount_cents / 100),
						reason: `DerivGrid withdrawal ${w.id.slice(0, 8)}`,
						merchantTransRef
					})
				});
				const data = await res.json().catch(() => ({}));
				if (res.ok && (data.ResponseCode === "0" || data.status === true)) toast.success("B2C dispatched via SasaPay — awaiting confirmation", { duration: 6e3 });
				else {
					const msg = data?.detail ?? data?.ResponseDescription ?? data?.error ?? `HTTP ${res.status}`;
					await refundWithdrawal(w, `B2C rejected: ${msg}`);
					toast.error(`B2C failed: ${msg}. Funds refunded to user wallet.`, { duration: 8e3 });
				}
			} catch {
				await refundWithdrawal(w, "Network error reaching SasaPay");
				toast.error("Could not reach SasaPay. Funds refunded to user wallet.");
			}
			load();
		} catch (e) {
			toast.error(e?.message ?? "Approval failed");
		} finally {
			processingRef.current = null;
			setProcessing(null);
		}
	};
	const reject = async (w) => {
		if (processingRef.current) return;
		processingRef.current = w.id;
		setProcessing(w.id);
		try {
			const { data: fresh } = await supabase.from("withdrawals").select("status").eq("id", w.id).single();
			if (fresh?.status !== "pending") {
				toast.error(`Cannot reject — already ${fresh?.status}`);
				return;
			}
			const { data: walletData } = await supabase.from("wallets").select("balance_cents").eq("id", w.wallet_id).single();
			const wallet = walletData;
			if (!wallet) throw new Error("Wallet not found");
			await Promise.all([
				supabase.from("wallets").update({
					balance_cents: wallet.balance_cents + w.amount_cents,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", w.wallet_id),
				supabase.from("transactions").insert({
					user_id: w.user_id,
					wallet_id: w.wallet_id,
					type: "transfer_in",
					amount_cents: w.amount_cents,
					currency: w.currency,
					description: `Withdrawal rejected — ${fmtKes(w.amount_cents, w.currency)} refunded`,
					metadata: { withdrawal_id: w.id }
				}),
				supabase.from("withdrawals").update({
					status: "cancelled",
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", w.id).eq("status", "pending"),
				supabase.from("notifications").insert({
					user_id: w.user_id,
					title: "Withdrawal rejected",
					body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal was rejected. Funds have been returned.`,
					type: "info",
					is_read: false
				})
			]);
			toast.info("Rejected — funds refunded to user");
			load();
		} catch (e) {
			toast.error(e?.message ?? "Rejection failed");
		} finally {
			processingRef.current = null;
			setProcessing(null);
		}
	};
	const refundWithdrawal = async (w, reason) => {
		const { data: walletData } = await supabase.from("wallets").select("balance_cents").eq("id", w.wallet_id).single();
		const wBal = walletData?.balance_cents ?? 0;
		await Promise.all([
			supabase.from("wallets").update({
				balance_cents: wBal + w.amount_cents,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", w.wallet_id),
			supabase.from("withdrawals").update({
				status: "cancelled",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", w.id),
			supabase.from("transactions").insert({
				user_id: w.user_id,
				wallet_id: w.wallet_id,
				type: "transfer_in",
				amount_cents: w.amount_cents,
				currency: w.currency,
				description: `Withdrawal cancelled — funds refunded (${reason})`
			}),
			supabase.from("notifications").insert({
				user_id: w.user_id,
				title: "Withdrawal cancelled",
				body: `Your ${fmtKes(w.amount_cents, w.currency)} withdrawal could not be processed. Funds returned to your wallet.`,
				type: "info",
				is_read: false
			})
		]);
	};
	const pendingCount = rows.filter((r) => r.status === "pending").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-6xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-bold",
					children: "Withdrawals"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs sm:text-sm text-muted-foreground mt-1",
					children: [
						rows.length,
						" records ·",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-warning font-medium",
							children: [pendingCount, " pending"]
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: load,
					disabled: loading,
					className: "shrink-0 gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${loading ? "animate-spin" : ""}` })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1.5 flex-wrap",
				children: FILTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setFilter(s),
					className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === s ? "bg-primary text-primary-foreground" : "bg-surface border border-border/60 text-muted-foreground hover:text-foreground"}`,
					children: [s, s === "pending" && pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1.5 inline-flex size-4 items-center justify-center rounded-full bg-warning text-black text-[9px] font-bold",
						children: pendingCount
					})]
				}, s))
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-xl" }, i))
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface py-16 text-center text-sm text-muted-foreground",
				children: "No withdrawals found."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden md:block rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/40 bg-surface/30 text-xs text-muted-foreground uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-5 py-3 font-semibold",
								children: "User"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Phone"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left px-4 py-3 font-semibold",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right px-5 py-3 font-semibold",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/25 hover:bg-surface/30 transition-colors last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 font-mono text-xs text-muted-foreground",
								children: [w.user_id.slice(0, 12), "…"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 font-mono font-semibold text-loss",
								children: ["−", fmtKes(w.amount_cents, w.currency)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-xs",
								children: w.phone ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-[10px] capitalize ${STATUS_COLOR[w.status] ?? ""}`,
									children: w.status
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap",
								children: fmtDate(w.created_at)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-5 py-3 text-right",
								children: [
									w.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											disabled: processing === w.id,
											onClick: () => approve(w),
											className: "h-7 text-profit hover:bg-profit/10 gap-1 text-xs",
											children: [processing === w.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Approve & Send"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "ghost",
											disabled: !!processing,
											onClick: () => reject(w),
											className: "h-7 text-loss hover:bg-loss/10 gap-1 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), "Reject"]
										})]
									}),
									w.status === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-primary flex items-center gap-1 justify-end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), "Awaiting SasaPay…"]
									}),
									w.status === "completed" && w.provider_ref && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground font-mono",
										children: [w.provider_ref.slice(0, 14), "…"]
									})
								]
							})
						]
					}, w.id)) })]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:hidden space-y-2",
				children: rows.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/50 bg-gradient-surface p-4 space-y-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono font-bold text-base text-loss",
								children: ["−", fmtKes(w.amount_cents, w.currency)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-0.5",
								children: w.phone ?? "—"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `text-[10px] capitalize shrink-0 ${STATUS_COLOR[w.status] ?? ""}`,
								children: w.status
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[10px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: [w.user_id.slice(0, 14), "…"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0",
								children: fmtDate(w.created_at)
							})]
						}),
						w.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-1 border-t border-border/30",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: processing === w.id,
								onClick: () => approve(w),
								className: "flex-1 h-8 text-xs gap-1.5 text-profit border-profit/30 hover:bg-profit/10",
								children: [processing === w.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Approve & Send"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "outline",
								disabled: !!processing,
								onClick: () => reject(w),
								className: "flex-1 h-8 text-xs gap-1.5 text-loss border-loss/30 hover:bg-loss/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), "Reject"]
							})]
						}),
						w.status === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-1 border-t border-border/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-primary flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), "B2C dispatched — awaiting SasaPay confirmation"]
							})
						})
					]
				}, w.id))
			})] })
		]
	});
}
//#endregion
export { AdminWithdrawals as component };
