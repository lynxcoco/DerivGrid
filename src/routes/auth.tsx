import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const authSearchSchema = z.object({
  tab: z.enum(["login", "register"]).optional().catch("login"),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or create account · DerivGrid" },
      { name: "description", content: "Sign in to your DerivGrid trading account or open a new one in minutes." },
    ],
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  remember: z.boolean().optional(),
});

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name is too short").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

// Translate raw Supabase/Auth error messages into user-friendly ones
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (m.includes("email already in use") || m.includes("already exists")) {
    return "This email is already linked to an account. Sign in or use a different email.";
  }
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address first — check your inbox.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">(search.tab ?? "login");

  const onAuthed = async () => {
    if (search.redirect) {
      navigate({ to: search.redirect });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (error) {
          console.warn("[useRole] Could not read user_roles:", error.message);
        }

        // Handle multiple rows — pick highest privilege
        const isAdmin = (data ?? []).some((r: any) => r.role === "admin");
        if (isAdmin) {
          navigate({ to: "/admin/overview" });
          return;
        }
      }
    } catch (e) {
      console.warn("[onAuthed] role check failed:", e);
    }
    navigate({ to: "/dashboard" });
  };

  // Handle both PKCE code exchange and legacy implicit #access_token hash
  useEffect(() => {
    // If Supabase redirected back with a hash token (implicit flow fallback),
    // getSession() will pick it up automatically. Just navigate.
    const hash = window.location.hash;
    if (hash.includes("access_token=")) {
      // Clean up the URL and let Supabase process the session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) onAuthed();
      });
      return;
    }

    // PKCE: listen for the code exchange to complete
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        onAuthed();
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogle = async () => {
    try {
      // Always redirect back to the current origin's /auth path
      // This must be in the Supabase dashboard → Auth → URL Configuration → Redirect URLs
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        toast.error(friendlyAuthError(error.message));
      }
    } catch (e: any) {
      toast.error(e?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel (decor) */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-sidebar p-10 xl:p-14">
        <div className="absolute inset-0 bg-gradient-glow opacity-60" aria-hidden />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative mt-auto">
          <h2 className="text-3xl xl:text-4xl font-bold tracking-tight max-w-md leading-tight">
            Trade with the tools and speed of an institutional desk.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            Real markets. Instant payouts. Professional tools built for traders
            who demand speed, precision and results.
          </p>
          <div className="mt-8 xl:mt-10 grid grid-cols-3 gap-4 xl:gap-6 max-w-md">
            {[
              ["200+", "Markets"],
              ["<25ms", "Execution"],
              ["24/7", "Synthetics"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-mono font-semibold text-lg xl:text-xl">{v}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <LoginForm onSuccess={onAuthed} onGoogle={handleGoogle} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm onSuccess={onAuthed} onGoogle={handleGoogle} />
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to DerivGrid's Terms and acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSuccess, onGoogle }: { onSuccess: () => void; onGoogle: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        // If they signed up via Google, no password exists — guide them
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
          toast.error("Incorrect email or password. If you signed up with Google, use the Google button above.");
        } else {
          toast.error(friendlyAuthError(error.message));
        }
        return;
      }
      toast.success("Welcome back");
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your trading account.</p>
      </div>

      <Button variant="outline" className="w-full h-11 active:scale-[0.98] transition-transform" onClick={onGoogle} type="button">
        <GoogleIcon />
        Continue with Google
      </Button>

      <Divider>or sign in with email</Divider>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-1.5 h-11" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
          <Checkbox
            checked={form.watch("remember")}
            onCheckedChange={(c) => form.setValue("remember", !!c)}
          />
          Remember me for 30 days
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95 active:scale-[0.98] transition-transform"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

function RegisterForm({ onSuccess, onGoogle }: { onSuccess: () => void; onGoogle: () => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: values.fullName },
        },
      });
      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists") ||
          error.message.toLowerCase().includes("already been registered")
        ) {
          toast.error("This email is already registered. Sign in instead, or use the Google button if that's how you joined.");
          return;
        }
        toast.error(friendlyAuthError(error.message));
        return;
      }

      // Supabase returns a fake "success" for duplicate emails when confirmations
      // are disabled — detect it: session exists but identities array is empty
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start trading in minutes — no KYC required.</p>
      </div>

      <Button variant="outline" className="w-full h-11 active:scale-[0.98] transition-transform" onClick={onGoogle} type="button">
        <GoogleIcon />
        Continue with Google
      </Button>

      <Divider>or with email</Divider>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" className="mt-1.5 h-11" autoComplete="name" {...form.register("fullName")} />
          {form.formState.errors.fullName && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="r-email">Email</Label>
          <Input id="r-email" type="email" autoComplete="email" className="mt-1.5 h-11" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="r-password">Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="r-password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              className="h-11 pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            className="mt-1.5 h-11"
            {...form.register("confirm")}
          />
          {form.formState.errors.confirm && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.confirm.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95 active:scale-[0.98] transition-transform"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </div>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">{children}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4 mr-2" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.4-1.65 4.1-5.4 4.1-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.78 3.8 1.45l2.6-2.5C16.7 3.6 14.55 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.42 0 9-3.8 9-9.15 0-.6-.07-1.05-.15-1.55H12z"/>
    </svg>
  );
}
