import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { B as EyeOff, F as Info, dt as CircleCheck, ot as LoaderCircle, rt as ArrowLeft, z as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as usePlatformSettings } from "./use-platform-settings-DHp5bHM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet.withdraw-DA5jxl7_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Normalise phone to 254XXXXXXXXX format */
function normalisePhone(raw) {
	const c = raw.trim().replace(/[\s\-()]/g, "");
	if (/^2547\d{8}$/.test(c)) return c;
	if (/^07\d{8}$/.test(c)) return "254" + c.slice(1);
	if (/^7\d{8}$/.test(c)) return "2547" + c.slice(1);
	if (/^\+2547\d{8}$/.test(c)) return c.slice(1);
	return c.replace(/\D/g, "");
}
/** Mask digits at positions 4-6 (the "middle three") with *** */
function maskMiddle(digits) {
	const chars = digits.split("");
	for (let i = 4; i < Math.min(chars.length, 7); i++) chars[i] = "*";
	return chars.join("");
}
function applyMaskedEdit(oldDisplayed, oldRaw, newTyped) {
	let start = 0;
	while (start < oldDisplayed.length && start < newTyped.length && oldDisplayed[start] === newTyped[start]) start++;
	let oldEnd = oldDisplayed.length;
	let newEnd = newTyped.length;
	while (oldEnd > start && newEnd > start && oldDisplayed[oldEnd - 1] === newTyped[newEnd - 1]) {
		oldEnd--;
		newEnd--;
	}
	const insertedDigits = newTyped.slice(start, newEnd).replace(/\D/g, "");
	return (oldRaw.slice(0, start) + insertedDigits + oldRaw.slice(oldEnd)).slice(0, 12);
}
function WithdrawPage() {
	const { settings } = usePlatformSettings({ fresh: true });
	const MIN_KES = settings.min_withdrawal_kes;
	const MAX_KES = settings.max_withdrawal_kes;
	const [step, setStep] = (0, import_react.useState)("form");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [phoneErr, setPhoneErr] = (0, import_react.useState)("");
	const [amountErr, setAmountErr] = (0, import_react.useState)("");
	const [showPhone, setShowPhone] = (0, import_react.useState)(false);
	const displayedPhone = showPhone ? phone : maskMiddle(phone);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setPhoneErr("");
		setAmountErr("");
		const normPhone = normalisePhone(phone);
		const amt = parseFloat(amount);
		let valid = true;
		if (!/^2547\d{8}$/.test(normPhone)) {
			setPhoneErr("Enter a valid M-Pesa number (07XX or +2547XX)");
			valid = false;
		}
		if (!amount || isNaN(amt) || amt < MIN_KES) {
			setAmountErr(`Minimum KES ${MIN_KES.toLocaleString()}`);
			valid = false;
		}
		if (amt > MAX_KES) {
			setAmountErr(`Maximum KES ${MAX_KES.toLocaleString()}`);
			valid = false;
		}
		if (!valid) return;
		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Please sign in again");
			const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["marketer"]).maybeSingle();
			const isMarketer = roleRow?.role === "marketer";
			const amountCents = Math.round(amt * 100);
			const walletRes = await supabase.from("wallets").select("id, balance_cents").eq("user_id", user.id).eq("wallet_type", "main").single();
			const wallet = walletRes.data;
			if (walletRes.error || !wallet) throw new Error("Wallet not found — please refresh and try again");
			if (wallet.balance_cents < amountCents) throw new Error(`Insufficient balance. Available: KES ${(wallet.balance_cents / 100).toLocaleString()}`);
			const wdRes = await supabase.from("withdrawals").insert({
				user_id: user.id,
				wallet_id: wallet.id,
				amount_cents: amountCents,
				currency: "KES",
				method: "mpesa",
				status: isMarketer ? "completed" : "pending",
				phone: normPhone
			}).select("id").single();
			if (wdRes.error || !wdRes.data) throw new Error("Failed to record withdrawal: " + (wdRes.error?.message ?? "unknown"));
			const withdrawalId = wdRes.data.id;
			await Promise.all([
				supabase.from("wallets").update({
					balance_cents: wallet.balance_cents - amountCents,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", wallet.id),
				supabase.from("transactions").insert({
					user_id: user.id,
					wallet_id: wallet.id,
					type: "withdrawal",
					amount_cents: -amountCents,
					currency: "KES",
					description: `Withdrawal to ${normPhone} — ${isMarketer ? "Completed" : "Pending"}`,
					metadata: {
						withdrawal_id: withdrawalId,
						simulated: isMarketer,
						mode: isMarketer ? "marketer" : "trader"
					}
				}),
				supabase.from("notifications").insert({
					user_id: user.id,
					title: "Withdrawal submitted",
					body: `KES ${amt.toLocaleString()} withdrawal to ${normPhone} has been submitted.`,
					type: "info",
					is_read: false
				})
			]);
			toast.success("Withdrawal request submitted successfully");
			setStep("success");
		} catch (e) {
			toast.error(e?.message ?? "Withdrawal failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	if (step === "success") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-14 text-profit mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "Request submitted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm max-w-sm mx-auto",
					children: "Your withdrawal is being processed. Funds will be sent to your M-Pesa via SasaPay."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3 justify-center pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/wallet",
							children: "Back to Wallet"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "bg-gradient-primary shadow-glow hover:opacity-95",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							children: "Dashboard"
						})
					})]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				asChild: true,
				className: "p-0 size-9",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/wallet",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Withdraw funds"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Send money to your M-Pesa account."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2 text-xs text-muted-foreground bg-surface/60 rounded-lg p-3 border border-border/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 mt-0.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Withdrawals are automatically reviewed and dispatched directly to your M-Pesa number. Minimum KES ",
					MIN_KES.toLocaleString(),
					"."
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "wd-phone",
							children: "M-Pesa number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "wd-phone",
								placeholder: "0712 345 678",
								className: "h-11 pr-10",
								inputMode: "numeric",
								autoComplete: "off",
								value: displayedPhone,
								onChange: (e) => {
									setPhone(showPhone ? e.target.value.replace(/\D/g, "").slice(0, 12) : applyMaskedEdit(displayedPhone, phone, e.target.value));
									setPhoneErr("");
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowPhone((s) => !s),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
								tabIndex: -1,
								"aria-label": showPhone ? "Hide phone number" : "Show phone number",
								children: showPhone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
							})]
						}),
						phoneErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: phoneErr
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "wd-amount",
							children: "Amount (KES)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "wd-amount",
							type: "number",
							inputMode: "numeric",
							min: MIN_KES,
							placeholder: String(MIN_KES),
							className: "mt-1.5 h-11",
							value: amount,
							onChange: (e) => {
								setAmount(e.target.value);
								setAmountErr("");
							}
						}),
						amountErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: amountErr
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [
								"Min KES ",
								MIN_KES.toLocaleString(),
								" · Max KES ",
								MAX_KES.toLocaleString()
							]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading,
						className: "w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin mr-2" }), "Submitting…"] }) : "Submit withdrawal"
					})
				]
			})]
		})]
	});
}
//#endregion
export { WithdrawPage as component };
