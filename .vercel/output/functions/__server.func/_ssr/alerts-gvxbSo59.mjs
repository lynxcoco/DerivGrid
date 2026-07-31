import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { a as tick, t as ASSETS } from "./market-simulator-B0Vqq1wV.mjs";
import { E as Plus, Q as BellRing, et as BellOff, ot as LoaderCircle, u as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alerts-gvxbSo59.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AlertsPage() {
	const [alerts, setAlerts] = (0, import_react.useState)([]);
	const [dbAssets, setDbAssets] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [showForm, setShowForm] = (0, import_react.useState)(false);
	const [symbol, setSymbol] = (0, import_react.useState)("");
	const [targetPrice, setTargetPrice] = (0, import_react.useState)("");
	const [condition, setCondition] = (0, import_react.useState)("above");
	const [note, setNote] = (0, import_react.useState)("");
	const [symbolErr, setSymbolErr] = (0, import_react.useState)("");
	const [priceErr, setPriceErr] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { data: assets } = await supabase.from("assets").select("id, symbol, name").eq("is_active", true);
			setDbAssets(assets ?? []);
			const { data } = await supabase.from("price_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
			setAlerts(data ?? []);
			setLoading(false);
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		if (alerts.length === 0) return;
		const interval = setInterval(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			setAlerts((prev) => {
				let changed = false;
				const updated = prev.map((alert) => {
					if (alert.is_triggered) return alert;
					const asset = ASSETS.find((a) => a.id === alert.asset_id || a.symbol === alert.asset_id || dbAssets.find((d) => d.id === alert.asset_id)?.symbol === a.symbol);
					if (!asset) return alert;
					const t = tick(asset);
					if (alert.condition === "above" ? t.price >= alert.target_price : t.price <= alert.target_price) {
						changed = true;
						supabase.from("price_alerts").update({
							is_triggered: true,
							triggered_at: (/* @__PURE__ */ new Date()).toISOString()
						}).eq("id", alert.id);
						supabase.from("notifications").insert({
							user_id: user.id,
							title: `Price alert triggered`,
							body: `${asset.symbol} is now ${alert.condition} ${alert.target_price}`,
							type: "alert",
							is_read: false
						});
						toast.success(`🔔 Alert: ${asset.symbol} hit ${alert.target_price}!`);
						return {
							...alert,
							is_triggered: true
						};
					}
					return alert;
				});
				return changed ? updated : prev;
			});
		}, 5e3);
		return () => clearInterval(interval);
	}, [alerts.length, dbAssets]);
	const assetIdFor = (sym) => dbAssets.find((a) => a.symbol === sym)?.id ?? sym;
	const assetSymbol = (assetId) => dbAssets.find((a) => a.id === assetId)?.symbol ?? ASSETS.find((a) => a.symbol === assetId)?.symbol ?? assetId;
	const handleCreate = async (e) => {
		e.preventDefault();
		setSymbolErr("");
		setPriceErr("");
		let valid = true;
		if (!symbol) {
			setSymbolErr("Select an asset");
			valid = false;
		}
		const price = parseFloat(targetPrice);
		if (!targetPrice || isNaN(price) || price <= 0) {
			setPriceErr("Enter a valid price");
			valid = false;
		}
		if (!valid) return;
		setSubmitting(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");
			const { data, error } = await supabase.from("price_alerts").insert({
				user_id: user.id,
				asset_id: assetIdFor(symbol),
				target_price: price,
				condition,
				note: note || null,
				is_triggered: false
			}).select().single();
			if (error) throw error;
			setAlerts((p) => [data, ...p]);
			setSymbol("");
			setTargetPrice("");
			setNote("");
			setCondition("above");
			setShowForm(false);
			toast.success("Price alert created");
		} catch (e) {
			toast.error(e?.message ?? "Could not create alert");
		} finally {
			setSubmitting(false);
		}
	};
	const deleteAlert = async (id) => {
		await supabase.from("price_alerts").delete().eq("id", id);
		setAlerts((p) => p.filter((a) => a.id !== id));
		toast.info("Alert deleted");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl sm:text-3xl font-bold",
					children: "Price Alerts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Get notified when markets reach your target levels."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowForm((v) => !v),
					className: "bg-gradient-primary shadow-glow hover:opacity-95",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1.5" }), "New alert"]
				})]
			}),
			showForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold mb-4",
					children: "Create alert"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreate,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "al-symbol",
									children: "Asset"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									id: "al-symbol",
									value: symbol,
									onChange: (e) => {
										setSymbol(e.target.value);
										setSymbolErr("");
									},
									className: "mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Select asset"
									}), ASSETS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: a.symbol,
										children: a.symbol
									}, a.symbol))]
								}),
								symbolErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive mt-1",
									children: symbolErr
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "al-condition",
								children: "Condition"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "al-condition",
								value: condition,
								onChange: (e) => setCondition(e.target.value),
								className: "mt-1.5 w-full h-11 rounded-lg border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "above",
									children: "Price goes above"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "below",
									children: "Price goes below"
								})]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "al-price",
								children: "Target price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "al-price",
								type: "number",
								step: "any",
								placeholder: "0.00",
								className: "mt-1.5 h-11 font-mono",
								value: targetPrice,
								onChange: (e) => {
									setTargetPrice(e.target.value);
									setPriceErr("");
								}
							}),
							priceErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-destructive mt-1",
								children: priceErr
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "al-note",
							children: "Note (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "al-note",
							placeholder: "e.g. EUR/USD breakout",
							className: "mt-1.5 h-11",
							value: note,
							onChange: (e) => setNote(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setShowForm(false),
								className: "flex-1",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: submitting,
								className: "flex-1 bg-gradient-primary shadow-glow hover:opacity-95",
								children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Create alert"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl border border-border/60 bg-gradient-surface shadow-card overflow-hidden",
				children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-6 space-y-3",
					children: [...Array(4)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full rounded-lg" }, i))
				}) : alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-12 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-10 text-muted-foreground mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground text-sm",
						children: "No alerts yet. Create one to get notified on price moves."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-border/40",
					children: alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `size-8 rounded-lg flex items-center justify-center shrink-0 ${alert.is_triggered ? "bg-profit/15 text-profit" : "bg-primary/15 text-primary"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-sm",
											children: assetSymbol(alert.asset_id)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: alert.condition
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-sm font-bold",
											children: alert.target_price.toLocaleString()
										})
									]
								}), alert.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground truncate",
									children: alert.note
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: `border-0 ${alert.is_triggered ? "bg-profit/20 text-profit" : "bg-primary/15 text-primary"}`,
								children: alert.is_triggered ? "Triggered" : "Active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => deleteAlert(alert.id),
								className: "text-muted-foreground hover:text-destructive transition-colors",
								"aria-label": "Delete alert",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})]
					}, alert.id))
				})
			})
		]
	});
}
//#endregion
export { AlertsPage as component };
