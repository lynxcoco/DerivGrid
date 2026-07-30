import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Shield, Key, Copy, CheckCheck, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { useRole } from "@/hooks/use-role";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · DerivGrid" }] }),
  component: ProfilePage,
});

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name too short").max(80),
  phone: z.string().optional(),
  country: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(8).max(128).regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const form = useForm({ resolver: zodResolver(profileSchema), defaultValues: { full_name: "", phone: "", country: "" } });
  const pwForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { password: "", confirm: "" } });

  useEffect(() => {
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
          country: data.country ?? "",
        });
      } else {
        form.reset({
          full_name: user.user_metadata?.full_name ?? "",
          phone: "",
          country: "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const onSaveProfile = async (values: any) => {
    setSaving(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      const { error } = await supabase.from("profiles").upsert({
        id: u.id,
        ...values,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: values.full_name } });
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (values: any) => {
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      toast.success("Password updated");
      pwForm.reset();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update password");
    } finally {
      setSavingPw(false);
    }
  };

  const copyReferral = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Trader";
  const { role, isAdmin } = useRole();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and security.</p>
      </div>

      {/* Avatar header */}
      <div className="flex items-center gap-4 p-6 rounded-2xl border border-border/60 bg-gradient-surface shadow-card">
        <div className="size-16 rounded-full bg-gradient-primary text-primary-foreground font-bold text-2xl flex items-center justify-center shadow-glow">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {loading ? <Skeleton className="h-5 w-36" /> : <p className="font-semibold text-lg">{displayName}</p>}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {role === "admin" && (
              <Badge className="text-xs bg-primary/20 text-primary border-0 font-semibold">
                <ShieldCheck className="size-3 mr-1" />Administrator
              </Badge>
            )}
            {role === "support" && (
              <Badge className="text-xs bg-warning/20 text-warning border-0 font-semibold">Support Agent</Badge>
            )}
            {role === "user" && (
              <Badge variant="secondary" className="text-xs">Trader</Badge>
            )}
          </div>
        </div>
        {isAdmin && (
          <Link to="/admin/overview"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/25 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0">
            <ShieldCheck className="size-3.5" />
            Admin Panel
            <ChevronRight className="size-3" />
          </Link>
        )}
      </div>

      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="info"><User className="size-3.5 mr-1.5" />Personal info</TabsTrigger>
          <TabsTrigger value="security"><Key className="size-3.5 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="referral"><Shield className="size-3.5 mr-1.5" />Referral</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card">
            <form onSubmit={form.handleSubmit(onSaveProfile)} className="space-y-4">
              <div>
                <Label>Full name</Label>
                <Input className="mt-1.5 h-11" {...form.register("full_name")} />
                {form.formState.errors.full_name && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.full_name.message}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input className="mt-1.5 h-11" value={user?.email ?? ""} disabled />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1.5 h-11" placeholder="+254 7XX XXX XXX" {...form.register("phone")} />
              </div>
              <div>
                <Label>Country</Label>
                <Input className="mt-1.5 h-11" placeholder="e.g. Kenya" {...form.register("country")} />
              </div>
              <Button type="submit" disabled={saving} className="bg-gradient-primary shadow-glow hover:opacity-95">
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Change password</h3>
              <p className="text-sm text-muted-foreground">Use a strong password with at least 8 characters, one uppercase letter, and one number.</p>
            </div>
            <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div>
                <Label>New password</Label>
                <Input type="password" className="mt-1.5 h-11" {...pwForm.register("password")} />
                {pwForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{pwForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label>Confirm password</Label>
                <Input type="password" className="mt-1.5 h-11" {...pwForm.register("confirm")} />
                {pwForm.formState.errors.confirm && (
                  <p className="text-xs text-destructive mt-1">{pwForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <Button type="submit" disabled={savingPw} className="bg-gradient-primary shadow-glow hover:opacity-95">
                {savingPw ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="referral" className="mt-4">
          <div className="rounded-2xl border border-border/60 bg-gradient-surface p-6 shadow-card space-y-4">
            <h3 className="font-semibold">Your referral code</h3>
            <p className="text-sm text-muted-foreground">Share your code and earn a bonus when friends sign up and deposit.</p>
            {profile?.referral_code ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-surface/60 border border-border/50 rounded-lg px-4 py-2.5">
                  {profile.referral_code}
                </code>
                <Button variant="outline" size="sm" onClick={copyReferral}>
                  {copied ? <CheckCheck className="size-4 text-profit" /> : <Copy className="size-4" />}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No referral code assigned yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
