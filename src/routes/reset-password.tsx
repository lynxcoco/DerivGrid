import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Set a new password · DerivGrid" }],
  }),
  component: ResetPassword,
});

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Status = "loading" | "ready" | "invalid";

function hasRecoveryToken(): boolean {
  // PKCE flow: Supabase appends ?code= to the URL
  const qp = new URLSearchParams(window.location.search);
  if (qp.get("code")) return true;

  // Implicit flow fallback: #access_token=...&type=recovery
  const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (hp.get("access_token") && hp.get("type") === "recovery") return true;

  return false;
}

function hasErrorParams(): boolean {
  const qp = new URLSearchParams(window.location.search);
  const hp = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return !!(
    qp.get("error") || qp.get("error_code") ||
    hp.get("error") || hp.get("error_code")
  );
}

function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Case 1: Supabase returned an error (expired / already used / invalid)
    if (hasErrorParams()) {
      setStatus("invalid");
      return;
    }

    // Case 2: No recovery token in the URL at all — user navigated here directly
    // or reused an old link that was already consumed (token is gone from URL).
    if (!hasRecoveryToken()) {
      setStatus("invalid");
      return;
    }

    // Case 3: Token exists in URL — wait for Supabase to fire PASSWORD_RECOVERY.
    // ONLY the PASSWORD_RECOVERY event unlocks the form. A regular SIGNED_IN
    // event (e.g. user already logged in, stale session) must NOT unlock it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    // Fallback: if PASSWORD_RECOVERY hasn't fired within 5s, the token is bad
    const timeout = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "invalid" : prev));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password updated — please sign in with your new password.");
      await supabase.auth.signOut();
      navigate({ to: "/auth", search: { tab: "login" } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-border/60 bg-gradient-surface p-8 shadow-elevated">

          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Link expired or already used</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  This password reset link has expired, already been used, or is invalid.
                  Request a fresh one below.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Request new link
              </Link>
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Set a new password</h1>
                  <p className="text-sm text-muted-foreground">Choose a strong password you'll remember.</p>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type={showPw ? "text" : "password"}
                    className="mt-1.5 h-11"
                    autoComplete="new-password"
                    {...form.register("confirm")}
                  />
                  {form.formState.errors.confirm && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.confirm.message}</p>
                  )}
                </div>
                <Button
                  disabled={loading}
                  className="w-full h-11 bg-gradient-primary shadow-glow hover:opacity-95"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
            </>
          )}

        </div>

        {status !== "invalid" && (
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            ← Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
