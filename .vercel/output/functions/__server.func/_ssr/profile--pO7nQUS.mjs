import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as Badge } from "./badge-BvYfkwae.mjs";
import { P as Key, U as Copy, X as CheckCheck, a as User, ot as LoaderCircle, q as ChevronRight, v as Shield, y as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType, r as objectType } from "../_libs/zod.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DyyAjTF9.mjs";
import { t as useRole } from "./use-role-WpM-W494.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile--pO7nQUS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var profileSchema = objectType({
	full_name: stringType().trim().min(2, "Name too short").max(80),
	phone: stringType().optional(),
	country: stringType().optional()
});
var passwordSchema = objectType({
	password: stringType().min(8).max(128).regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number"),
	confirm: stringType()
}).refine((d) => d.password === d.confirm, {
	path: ["confirm"],
	message: "Passwords don't match"
});
function ProfilePage() {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [savingPw, setSavingPw] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const form = useForm({
		resolver: u(profileSchema),
		defaultValues: {
			full_name: "",
			phone: "",
			country: ""
		}
	});
	const pwForm = useForm({
		resolver: u(passwordSchema),
		defaultValues: {
			password: "",
			confirm: ""
		}
	});
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			setUser(user);
			const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
			if (data) {
				setProfile(data);
				form.reset({
					full_name: data.full_name ?? user.user_metadata?.full_name ?? "",
					phone: data.phone ?? "",
					country: data.country ?? ""
				});
			} else form.reset({
				full_name: user.user_metadata?.full_name ?? "",
				phone: "",
				country: ""
			});
			setLoading(false);
		})();
	}, []);
	const onSaveProfile = async (values) => {
		setSaving(true);
		try {
			const { data: { user: u } } = await supabase.auth.getUser();
			if (!u) return;
			const { error } = await supabase.from("profiles").upsert({
				id: u.id,
				...values,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (error) throw error;
			await supabase.auth.updateUser({ data: { full_name: values.full_name } });
			toast.success("Profile updated");
		} catch (e) {
			toast.error(e?.message ?? "Could not save profile");
		} finally {
			setSaving(false);
		}
	};
	const onChangePassword = async (values) => {
		setSavingPw(true);
		try {
			const { error } = await supabase.auth.updateUser({ password: values.password });
			if (error) throw error;
			toast.success("Password updated");
			pwForm.reset();
		} catch (e) {
			toast.error(e?.message ?? "Could not update password");
		} finally {
			setSavingPw(false);
		}
	};
	const copyReferral = () => {
		if (profile?.referral_code) {
			navigator.clipboard.writeText(profile.referral_code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2e3);
		}
	};
	const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Trader";
	const { role, isAdmin } = useRole();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl sm:text-3xl font-bold",
				children: "Profile"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Manage your account details and security."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 p-6 rounded-2xl border border-border/60 bg-gradient-surface shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-16 rounded-full bg-gradient-primary text-primary-foreground font-bold text-2xl flex items-center justify-center shadow-glow",
						children: displayName.slice(0, 1).toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-36" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-lg",
								children: displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: user?.email
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mt-1.5",
								children: [
									role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "text-xs bg-primary/20 text-primary border-0 font-semibold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3 mr-1" }), "Administrator"]
									}),
									role === "support" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "text-xs bg-warning/20 text-warning border-0 font-semibold",
										children: "Support Agent"
									}),
									role === "user" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-xs",
										children: "Trader"
									})
								]
							})
						]
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/overview",
						className: "flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/25 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }),
							"Admin Panel",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "info",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid grid-cols-3 w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "info",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3.5 mr-1.5" }), "Personal info"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "security",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "size-3.5 mr-1.5" }), "Security"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "referral",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5 mr-1.5" }), "Referral"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "info",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: form.handleSubmit(onSaveProfile),
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Full name" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "mt-1.5 h-11",
											...form.register("full_name")
										}),
										form.formState.errors.full_name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-destructive mt-1",
											children: form.formState.errors.full_name.message
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1.5 h-11",
										value: user?.email ?? "",
										disabled: true
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1.5 h-11",
										placeholder: "+254 7XX XXX XXX",
										...form.register("phone")
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "mt-1.5 h-11",
										placeholder: "e.g. Kenya",
										...form.register("country")
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: saving,
										className: "bg-gradient-primary shadow-glow hover:opacity-95",
										children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Save changes"
									})
								]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "security",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold mb-1",
								children: "Change password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Use a strong password with at least 8 characters, one uppercase letter, and one number."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: pwForm.handleSubmit(onChangePassword),
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "New password" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "password",
											className: "mt-1.5 h-11",
											...pwForm.register("password")
										}),
										pwForm.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-destructive mt-1",
											children: pwForm.formState.errors.password.message
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Confirm password" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "password",
											className: "mt-1.5 h-11",
											...pwForm.register("confirm")
										}),
										pwForm.formState.errors.confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-destructive mt-1",
											children: pwForm.formState.errors.confirm.message
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: savingPw,
										className: "bg-gradient-primary shadow-glow hover:opacity-95",
										children: savingPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Update password"
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "referral",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: "Your referral code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Share your code and earn a bonus when friends sign up and deposit."
								}),
								profile?.referral_code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "flex-1 font-mono text-sm bg-surface/60 border border-border/50 rounded-lg px-4 py-2.5",
										children: profile.referral_code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										onClick: copyReferral,
										children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-4 text-profit" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground italic",
									children: "No referral code assigned yet."
								})
							]
						})
					})
				]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
