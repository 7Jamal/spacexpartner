import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock, Loader2, Lock, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
import { useT } from "@/lib/i18n";
import { formatMoney, WEEKLY_SALARY } from "@/lib/payroll";
import { isValidPin, onlyDigits, PIN_LENGTH, pinToPassword } from "@/lib/pin";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | SpaceX Partnership Portal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content:
          "Sign in or register for the SpaceX Partnership Portal to track your weekly $5,000 salary, payment status and company notices.",
      },
      { property: "og:title", content: "SpaceX Partnership Portal — Partner Sign In" },
      {
        property: "og:description",
        content: "Secure weekly payment management for SpaceX Partnership partners.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loginPin, setLoginPin] = useState("");
  const [registerPin, setRegisterPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email || !isValidPin(loginPin)) {
      toast.error(t("auth.errorCredentials"));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pinToPassword(loginPin),
    });
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
    toast.success(t("auth.welcomeBack"));
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const country = String(form.get("country") ?? "").trim();
    if (fullName.length < 2) {
      toast.error(t("auth.errorFullName"));
      return;
    }
    if (country.length < 2) {
      toast.error(t("auth.errorCountry"));
      return;
    }
    if (!isValidPin(registerPin)) {
      toast.error(t("auth.errorPin"));
      return;
    }
    if (registerPin !== confirmPin) {
      toast.error(t("auth.errorPinMismatch"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pinToPassword(registerPin),
      options: { data: { full_name: fullName, country } },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.accountCreated"));
    setBusy(false);
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-brand p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <div className="relative">
          <BrandMark size="xl" tone="onDark" layout="stacked" className="items-start text-left" textClassName="justify-start" />
        </div>
        <div className="relative max-w-lg space-y-6 text-primary-foreground">
          <h1 className="font-display text-4xl leading-tight font-semibold">
            {t("auth.heroTitle")}
          </h1>
          <p className="text-sm/relaxed text-primary-foreground/75">
            {t("auth.heroBody")}
          </p>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            <li className="flex items-center gap-3">
              <Wallet className="size-4 text-accent" />
              {t("auth.heroPoint1", { amount: formatMoney(WEEKLY_SALARY) })}
            </li>
            <li className="flex items-center gap-3">
              <CalendarClock className="size-4 text-accent" />
              {t("auth.heroPoint2")}
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-accent" />
              {t("auth.heroPoint3")}
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/55">
          {t("auth.heroFooter")}
        </p>
      </section>

      <section className="glass-bar flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <BrandMark size="md" layout="stacked" className="lg:hidden items-start text-left" textClassName="justify-start" />

          <div className="ml-auto flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="animate-rise">
            <h2 className="font-display text-2xl font-semibold">{t("auth.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("auth.subtitle")}
            </p>
          </div>

          <Tabs defaultValue="login" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.tabSignIn")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.tabRegister")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="glass-panel mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.email")}</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t("auth.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pin">{t("auth.pin")}</Label>
                  <Input
                    id="login-pin"
                    inputMode="numeric"
                    autoComplete="off"
                    type="password"
                    required
                    maxLength={PIN_LENGTH}
                    value={loginPin}
                    onChange={(event) => setLoginPin(onlyDigits(event.target.value))}
                    className="text-center text-lg tracking-[0.6em]"
                    placeholder="••••"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("auth.forgotPin")}
                </button>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                  {t("auth.signIn")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="glass-panel mt-4 space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{t("auth.fullName")}</Label>
                  <Input
                    id="reg-name"
                    name="full_name"
                    required
                    placeholder={t("auth.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t("auth.email")}</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t("auth.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-country">{t("auth.country")}</Label>
                  <Input
                    id="reg-country"
                    name="country"
                    autoComplete="country-name"
                    required
                    placeholder={t("auth.countryPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pin">{t("auth.pin")}</Label>
                  <Input
                    id="reg-pin"
                    inputMode="numeric"
                    type="password"
                    autoComplete="off"
                    required
                    maxLength={PIN_LENGTH}
                    value={registerPin}
                    onChange={(event) => setRegisterPin(onlyDigits(event.target.value))}
                    className="text-center text-lg tracking-[0.6em]"
                    placeholder="••••"
                  />
                  <p className="text-xs text-muted-foreground">{t("auth.pinHint")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pin-confirm">{t("auth.confirmPin")}</Label>
                  <Input
                    id="reg-pin-confirm"
                    inputMode="numeric"
                    type="password"
                    autoComplete="off"
                    required
                    maxLength={PIN_LENGTH}
                    value={confirmPin}
                    onChange={(event) => setConfirmPin(onlyDigits(event.target.value))}
                    className="text-center text-lg tracking-[0.6em]"
                    placeholder="••••"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t("auth.createAccount")}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t("auth.noVerification")}
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auth.forgotTitle")}</DialogTitle>
            <DialogDescription>{t("auth.forgotBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setForgotOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </main>
  );
}
