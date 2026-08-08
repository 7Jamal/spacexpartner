import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock, Loader2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, WEEKLY_SALARY } from "@/lib/payroll";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | SpaceX Partnership Portal" },
      {
        name: "description",
        content:
          "Sign in or register for the SpaceX Partnership Portal to track your weekly $5,000 salary, payment status and company notices.",
      },
      { property: "og:title", content: "SpaceX Partnership Portal — Employee Sign In" },
      {
        property: "og:description",
        content: "Secure weekly payment management for SpaceX Partnership employees.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    if (data.user) {
      await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", data.user.id);
    }
    toast.success("Welcome back.");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (fullName.length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Taking you to your dashboard.");
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleReset() {
    if (!resetEmail.trim()) {
      toast.error("Enter the email address on your account.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setForgotOpen(false);
    toast.success("Password reset link sent. Please check your inbox.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="relative">
          <BrandMark size="xl" tone="onDark" />
        </div>
        <div className="relative max-w-lg space-y-6 text-primary-foreground">
          <h1 className="font-display text-4xl leading-tight font-semibold">
            Payroll clarity for every <span className="text-gradient-gold">partner</span> in the
            company.
          </h1>
          <p className="text-sm/relaxed text-primary-foreground/75">
            Track your weekly salary, follow each payment as it moves through approval, and stay
            current with every company notice — all in one secure workspace.
          </p>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            <li className="flex items-center gap-3">
              <Wallet className="size-4 text-accent" />
              {formatMoney(WEEKLY_SALARY)} paid every week
            </li>
            <li className="flex items-center gap-3">
              <CalendarClock className="size-4 text-accent" />
              Live countdown to your next payment
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-accent" />
              Bank details visible only to the administrator
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/55">
          Encrypted credentials · Protected records · Administrator-only controls
        </p>
      </section>

      <section className="glass-bar flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <BrandMark size="sm" className="lg:hidden" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="animate-rise">
            <h2 className="font-display text-2xl font-semibold">Employee access</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your dashboard, or create an account in under a minute.
            </p>
          </div>

          <Tabs defaultValue="login" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="glass-panel mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email address</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="glass-panel mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full name</Label>
                  <Input id="reg-name" name="full_name" required placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email address</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Create my account
                </Button>
                <p className="text-xs text-muted-foreground">
                  No email verification needed — you can sign in straight away.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              We&apos;ll email you a secure link to choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email address</Label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReset}>Send reset link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
