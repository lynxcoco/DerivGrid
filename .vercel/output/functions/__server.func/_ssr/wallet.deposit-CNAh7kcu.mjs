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
//#region node_modules/.nitro/vite/services/ssr/assets/wallet.deposit-CNAh7kcu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ANON_KEY = "sb_publishable_CfibYkdx9UyiVEm0h3oW6A_7MlgOr8k";
var SASAPAY_URL = `https://oevuqograxqkensvqxzt.supabase.co/functions/v1/sasapay-proxy`;
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
/** Fire a SasaPay C2B STK push request */
async function stkPush(phone, amount, userId, depositId) {
	const res = await fetch(`${SASAPAY_URL}?action=stk-push`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			apikey: ANON_KEY
		},
		body: JSON.stringify({
			phone,
			amount,
			accountRef: `SD-${userId.slice(0, 8)}`,
			transDesc: "DerivGrid Deposit"
		})
	}).catch(() => {
		throw new Error("Could not reach payment service. Check your connection.");
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.ResponseCode !== "0") throw new Error(data?.detail ?? data?.ResponseDescription ?? data?.error ?? `Payment error (${res.status})`);
	return data;
}
var TIMEOUT_SECS = 90;
var MARKETER_RESOLVE_AT = 73;
function DepositPage() {
	const { settings } = usePlatformSettings({ fresh: true });
	const MIN_KES = settings.min_deposit_kes;
	const MAX_KES = settings.max_deposit_kes;
	const [step, setStep] = (0, import_react.useState)("form");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [phoneErr, setPhoneErr] = (0, import_react.useState)("");
	const [amountErr, setAmountErr] = (0, import_react.useState)("");
	const [countdown, setCountdown] = (0, import_react.useState)(TIMEOUT_SECS);
	const [showPhone, setShowPhone] = (0, import_react.useState)(false);
	const tickRef = (0, import_react.useRef)(null);
	const timeoutRef = (0, import_react.useRef)(null);
	const channelRef = (0, import_react.useRef)(null);
	const depositIdRef = (0, import_react.useRef)(null);
	const resolvedRef = (0, import_react.useRef)(false);
	const displayedPhone = showPhone ? phone : maskMiddle(phone);
	const cleanup = (0, import_react.useCallback)(() => {
		if (tickRef.current) {
			clearInterval(tickRef.current);
			tickRef.current = null;
		}
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
			channelRef.current = null;
		}
	}, []);
	(0, import_react.useEffect)(() => () => cleanup(), [cleanup]);
	const resolve = (0, import_react.useCallback)((outcome) => {
		if (resolvedRef.current) return;
		resolvedRef.current = true;
		cleanup();
		setCountdown(0);
		setStep(outcome);
		if (outcome === "success") toast.success("Deposit confirmed! Wallet credited.");
	}, [cleanup]);
	const startWaiting = (0, import_react.useCallback)((depositId, isMarketer) => {
		resolvedRef.current = false;
		depositIdRef.current = depositId;
		setCountdown(TIMEOUT_SECS);
		setStep("waiting");
		tickRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(tickRef.current);
					tickRef.current = null;
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		if (isMarketer) timeoutRef.current = setTimeout(async () => {
			if (resolvedRef.current) return;
			await supabase.from("deposits").update({
				status: "completed",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", depositId);
			const { data: depData } = await supabase.from("deposits").select("wallet_id, amount_cents, user_id").eq("id", depositId).single();
			if (depData) {
				const { data: walletData } = await supabase.from("wallets").select("balance_cents").eq("id", depData.wallet_id).single();
				await supabase.from("wallets").update({
					balance_cents: (walletData?.balance_cents ?? 0) + depData.amount_cents,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", depData.wallet_id);
				await supabase.from("transactions").insert({
					user_id: depData.user_id,
					wallet_id: depData.wallet_id,
					type: "deposit",
					amount_cents: depData.amount_cents,
					currency: "KES",
					description: "Deposit via M-Pesa",
					metadata: {
						deposit_id: depositId,
						simulated: true,
						mode: "marketer"
					}
				});
			}
			resolve("success");
		}, (TIMEOUT_SECS - MARKETER_RESOLVE_AT) * 1e3);
		else {
			timeoutRef.current = setTimeout(async () => {
				if (resolvedRef.current) return;
				const { data } = await supabase.from("deposits").select("status").eq("id", depositId).single();
				if (data?.status === "completed") {
					resolve("success");
					return;
				}
				if (data?.status === "pending") {
					resolve("review");
					return;
				}
				resolve("timeout");
			}, TIMEOUT_SECS * 1e3);
			channelRef.current = supabase.channel(`deposit-${depositId}`).on("postgres_changes", {
				event: "UPDATE",
				schema: "public",
				table: "deposits",
				filter: `id=eq.${depositId}`
			}, (payload) => {
				const status = payload.new?.status;
				if (status === "completed") {
					resolve("success");
					return;
				}
				if (status === "failed") {
					resolve("timeout");
					return;
				}
			}).subscribe();
			const poll = setInterval(async () => {
				if (resolvedRef.current) {
					clearInterval(poll);
					return;
				}
				const { data } = await supabase.from("deposits").select("status").eq("id", depositId).single();
				if (!data) return;
				if (data.status === "completed") {
					clearInterval(poll);
					resolve("success");
				}
				if (data.status === "failed") {
					clearInterval(poll);
					resolve("timeout");
				}
			}, 4e3);
			setTimeout(() => clearInterval(poll), 92 * 1e3);
		}
	}, [resolve]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setPhoneErr("");
		setAmountErr("");
		const normPhone = normalisePhone(phone);
		const amt = parseFloat(amount);
		let ok = true;
		if (!/^2547\d{8}$/.test(normPhone)) {
			setPhoneErr("Enter a valid M-Pesa number (07XX or +2547XX)");
			ok = false;
		}
		if (!amount || isNaN(amt) || amt < MIN_KES) {
			setAmountErr(`Minimum KES ${MIN_KES.toLocaleString()}`);
			ok = false;
		}
		if (amt > MAX_KES) {
			setAmountErr(`Maximum KES ${MAX_KES.toLocaleString()}`);
			ok = false;
		}
		if (!ok) return;
		setLoading(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Please sign in again");
			const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).in("role", ["marketer"]).maybeSingle();
			const isMarketer = roleRow?.role === "marketer";
			const amountCents = Math.round(amt * 100);
			const walletRes = await supabase.from("wallets").select("id").eq("user_id", user.id).eq("wallet_type", "main").single();
			if (walletRes.error || !walletRes.data) throw new Error("Wallet not found — please refresh");
			const walletId = walletRes.data.id;
			const depRes = await supabase.from("deposits").insert({
				user_id: user.id,
				wallet_id: walletId,
				amount_cents: amountCents,
				currency: "KES",
				method: "mpesa",
				status: "pending",
				phone: normPhone
			}).select("id").single();
			if (depRes.error || !depRes.data) throw new Error("Could not create deposit record");
			const depositId = depRes.data.id;
			if (isMarketer) {
				const fakeCheckoutId = `MKT-${Date.now()}`;
				await supabase.from("deposits").update({ provider_ref: fakeCheckoutId }).eq("id", depositId);
				setLoading(false);
				toast.success("STK push sent! Enter your M-Pesa PIN.", { duration: 4e3 });
				startWaiting(depositId, true);
			} else {
				const resp = await stkPush(normPhone, amt, user.id, depositId);
				await supabase.from("deposits").update({ provider_ref: resp.CheckoutRequestID }).eq("id", depositId);
				setLoading(false);
				toast.success("STK push sent! Enter your M-Pesa PIN.", { duration: 4e3 });
				startWaiting(depositId, false);
			}
		} catch (e) {
			toast.error(e?.message ?? "Payment failed. Please try again.");
			setLoading(false);
		}
	};
	const handleCancel = async () => {
		cleanup();
		resolvedRef.current = true;
		if (depositIdRef.current) await supabase.from("deposits").update({
			status: "cancelled",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", depositIdRef.current);
		toast.info("Payment cancelled.");
		setStep("timeout");
	};
	if (step === "success") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-14 text-profit mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "Deposit successful!"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "Your wallet has been credited. Funds are ready to use."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row gap-3 justify-center pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setStep("form");
								setPhone("");
								setAmount("");
							},
							variant: "outline",
							children: "Deposit more"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-gradient-primary shadow-glow hover:opacity-95",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/wallet",
								children: "Go to Wallet"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/candle-trade",
								children: "Trade now"
							})
						})
					]
				})
			]
		})
	});
	if (step === "review") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-8 text-primary" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "Payment received"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm max-w-sm mx-auto",
					children: "Your payment was confirmed. Your deposit is under review and will be credited shortly."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "bg-gradient-primary shadow-glow hover:opacity-95",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/wallet",
						children: "View Wallet"
					})
				})
			]
		})
	});
	if (step === "timeout") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-14 mx-auto rounded-full bg-warning/15 flex items-center justify-center text-2xl",
					children: "⏱"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "Confirmation timed out"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground text-sm max-w-sm mx-auto",
					children: [
						"No confirmation received within 90 seconds. If money was deducted from your M-Pesa, contact ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "support" }),
						" with your M-Pesa transaction code and we'll credit you within minutes."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3 justify-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setStep("form"),
						className: "bg-gradient-primary shadow-glow hover:opacity-95",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/support",
							children: "Contact support"
						})
					})]
				})
			]
		})
	});
	if (step === "waiting") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-lg mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-10 shadow-card text-center space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto size-20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "size-20 -rotate-90",
						viewBox: "0 0 80 80",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "40",
							r: "34",
							fill: "none",
							stroke: "rgba(100,120,160,0.2)",
							strokeWidth: "6"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "40",
							cy: "40",
							r: "34",
							fill: "none",
							stroke: "oklch(0.72 0.17 162)",
							strokeWidth: "6",
							strokeDasharray: `${2 * Math.PI * 34}`,
							strokeDashoffset: `${2 * Math.PI * 34 * (1 - countdown / TIMEOUT_SECS)}`,
							strokeLinecap: "round",
							className: "transition-all duration-1000"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xl font-bold font-mono",
							children: countdown
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Waiting for M-Pesa PIN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "A prompt was sent to your phone. Enter your PIN now."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: handleCancel,
					className: "text-muted-foreground hover:text-destructive hover:border-destructive/50",
					children: "Cancel payment"
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
				children: "Deposit funds"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Fund your account via M-Pesa."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 text-xs text-muted-foreground bg-surface/60 rounded-lg p-3 border border-border/40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5 mt-0.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"An M-Pesa STK push prompt will be sent to your phone. Enter your PIN within",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "90 seconds" }),
						" to complete the deposit."
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "dep-phone",
								children: "M-Pesa number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "dep-phone",
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
								htmlFor: "dep-amount",
								children: "Amount (KES)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "dep-amount",
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
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin mr-2" }), "Sending prompt…"] }) : "Deposit via M-Pesa"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center pt-1 gap-2 text-xs text-muted-foreground/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Powered by" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-muted-foreground",
							children: "DerivGrid"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "· Secure Payments" })
					]
				})
			]
		})]
	});
}
//#endregion
export { DepositPage as component };
