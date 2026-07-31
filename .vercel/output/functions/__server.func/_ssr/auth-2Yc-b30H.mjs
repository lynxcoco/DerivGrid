import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as useForm, r as require_react, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { m as require_jsx_runtime, n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-qniC-wUe.mjs";
import { t as Input } from "./input-DeTJfB0m.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { B as EyeOff, Y as Check, ot as LoaderCircle, z as Eye } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { P as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType, r as objectType, t as booleanType } from "../_libs/zod.mjs";
import { t as Route } from "./auth-DCkRAm4_.mjs";
import { t as Logo } from "./Logo-Pe2PMluE.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-DyyAjTF9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-2Yc-b30H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var loginSchema = objectType({
	email: stringType().trim().email("Enter a valid email").max(255),
	password: stringType().min(6, "Password must be at least 6 characters").max(128),
	remember: booleanType().optional()
});
var registerSchema = objectType({
	fullName: stringType().trim().min(2, "Name is too short").max(80),
	email: stringType().trim().email("Enter a valid email").max(255),
	password: stringType().min(8, "Use at least 8 characters").max(128).regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number"),
	confirm: stringType()
}).refine((d) => d.password === d.confirm, {
	path: ["confirm"],
	message: "Passwords don't match"
});
function friendlyAuthError(message) {
	const m = message.toLowerCase();
	if (m.includes("user already registered") || m.includes("already been registered")) return "An account with this email already exists. Try signing in instead.";
	if (m.includes("email already in use") || m.includes("already exists")) return "This email is already linked to an account. Sign in or use a different email.";
	if (m.includes("invalid login credentials") || m.includes("invalid credentials")) return "Incorrect email or password. Please try again.";
	if (m.includes("email not confirmed")) return "Please confirm your email address first — check your inbox.";
	if (m.includes("too many requests") || m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
	return message;
}
function AuthPage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const [tab, setTab] = (0, import_react.useState)(search.tab ?? "login");
	const onAuthed = async () => {
		if (search.redirect) {
			navigate({ to: search.redirect });
			return;
		}
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.user) {
				const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
				if (error) console.warn("[useRole] Could not read user_roles:", error.message);
				if (data?.role === "admin") {
					navigate({ to: "/admin/overview" });
					return;
				}
			}
		} catch (e) {
			console.warn("[onAuthed] role check failed:", e);
		}
		navigate({ to: "/dashboard" });
	};
	(0, import_react.useEffect)(() => {
		if (window.location.hash.includes("access_token=")) {
			supabase.auth.getSession().then(({ data: { session } }) => {
				if (session) onAuthed();
			});
			return;
		}
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_IN") onAuthed();
		});
		return () => subscription.unsubscribe();
	}, []);
	const handleGoogle = async () => {
		try {
			const redirectTo = `${window.location.origin}/auth`;
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo,
					queryParams: {
						access_type: "offline",
						prompt: "consent"
					}
				}
			});
			if (error) toast.error(friendlyAuthError(error.message));
		} catch (e) {
			toast.error(e?.message || "Google sign-in failed");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-sidebar p-10 xl:p-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 bg-gradient-glow opacity-60",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-3xl xl:text-4xl font-bold tracking-tight max-w-md leading-tight",
							children: "Trade with the tools and speed of an institutional desk."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground max-w-md",
							children: "Real markets. Instant payouts. Professional tools built for traders who demand speed, precision and results."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 xl:mt-10 grid grid-cols-3 gap-4 xl:gap-6 max-w-md",
							children: [
								["200+", "Markets"],
								["<25ms", "Execution"],
								["24/7", "Synthetics"]
							].map(([v, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono font-semibold text-lg xl:text-xl",
								children: v
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground uppercase tracking-wider mt-1",
								children: l
							})] }, l))
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:hidden mb-8 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { size: "lg" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						value: tab,
						onValueChange: (v) => setTab(v),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid grid-cols-2 w-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "login",
									children: "Sign in"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "register",
									children: "Create account"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "login",
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {
									onSuccess: onAuthed,
									onGoogle: handleGoogle
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "register",
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterForm, {
									onSuccess: onAuthed,
									onGoogle: handleGoogle
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-center text-xs text-muted-foreground",
						children: "By continuing you agree to DerivGrid's Terms and acknowledge our Privacy Policy."
					})
				]
			})
		})]
	});
}
function LoginForm({ onSuccess, onGoogle }) {
	const [show, setShow] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const form = useForm({
		resolver: u(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			remember: true
		}
	});
	const onSubmit = async (values) => {
		setLoading(true);
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password
			});
			if (error) {
				const msg = error.message.toLowerCase();
				if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) toast.error("Incorrect email or password. If you signed up with Google, use the Google button above.");
				else toast.error(friendlyAuthError(error.message));
				return;
			}
			toast.success("Welcome back");
			onSuccess();
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Welcome back"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Sign in to your trading account."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "w-full h-11 active:scale-[0.98] transition-transform",
				onClick: onGoogle,
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), "Continue with Google"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { children: "or sign in with email" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: form.handleSubmit(onSubmit),
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							autoComplete: "email",
							className: "mt-1.5 h-11",
							...form.register("email")
						}),
						form.formState.errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.email.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/forgot-password",
								className: "text-xs text-primary hover:underline",
								children: "Forgot password?"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: show ? "text" : "password",
								autoComplete: "current-password",
								className: "h-11 pr-10",
								...form.register("password")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShow((s) => !s),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
								"aria-label": show ? "Hide password" : "Show password",
								children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
							})]
						}),
						form.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.password.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm text-muted-foreground select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: form.watch("remember"),
							onCheckedChange: (c) => form.setValue("remember", !!c)
						}), "Remember me for 30 days"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading,
						className: "w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95 active:scale-[0.98] transition-transform",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Sign in"
					})
				]
			})
		]
	});
}
function RegisterForm({ onSuccess, onGoogle }) {
	const [show, setShow] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const form = useForm({
		resolver: u(registerSchema),
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirm: ""
		}
	});
	const onSubmit = async (values) => {
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth`,
					data: { full_name: values.fullName }
				}
			});
			if (error) {
				if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists") || error.message.toLowerCase().includes("already been registered")) {
					toast.error("This email is already registered. Sign in instead, or use the Google button if that's how you joined.");
					return;
				}
				toast.error(friendlyAuthError(error.message));
				return;
			}
			if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
				toast.error("This email is already registered. Sign in instead, or use the Google button if that's how you joined.");
				return;
			}
			toast.success("Account created — welcome to DerivGrid!");
			onSuccess();
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Create your account"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Start trading in minutes — no KYC required."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				className: "w-full h-11 active:scale-[0.98] transition-transform",
				onClick: onGoogle,
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleIcon, {}), "Continue with Google"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Divider, { children: "or with email" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: form.handleSubmit(onSubmit),
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "fullName",
							children: "Full name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "fullName",
							className: "mt-1.5 h-11",
							autoComplete: "name",
							...form.register("fullName")
						}),
						form.formState.errors.fullName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.fullName.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "r-email",
							children: "Email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "r-email",
							type: "email",
							autoComplete: "email",
							className: "mt-1.5 h-11",
							...form.register("email")
						}),
						form.formState.errors.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.email.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "r-password",
							children: "Password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mt-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "r-password",
								type: show ? "text" : "password",
								autoComplete: "new-password",
								className: "h-11 pr-10",
								...form.register("password")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShow((s) => !s),
								className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
								"aria-label": show ? "Hide password" : "Show password",
								children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
							})]
						}),
						form.formState.errors.password && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.password.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "confirm",
							children: "Confirm password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "confirm",
							type: show ? "text" : "password",
							autoComplete: "new-password",
							className: "mt-1.5 h-11",
							...form.register("confirm")
						}),
						form.formState.errors.confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive mt-1",
							children: form.formState.errors.confirm.message
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading,
						className: "w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95 active:scale-[0.98] transition-transform",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Create account"
					})
				]
			})
		]
	});
}
function Divider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 border-t border-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-3 text-xs uppercase tracking-wider text-muted-foreground",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 border-t border-border" })
		]
	});
}
function GoogleIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className: "size-4 mr-2",
		viewBox: "0 0 24 24",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "#EA4335",
			d: "M12 10.2v3.9h5.4c-.24 1.4-1.65 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.78 3.8 1.45l2.6-2.5C16.7 3.6 14.55 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.42 0 9-3.8 9-9.15 0-.6-.07-1.05-.15-1.55H12z"
		})
	});
}
//#endregion
export { AuthPage as component };
