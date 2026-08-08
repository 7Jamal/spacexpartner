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
import { SecurityQuestionsForm } from "@/components/security/SecurityQuestionsForm";
import {
  resetPasswordWithSecurityAnswers,
  startPasswordRecovery,
} from "@/lib/recovery.functions";
import { questionLabelKey } from "@/lib/security-questions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in | SpaceX Partnership Portal" },
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
  const [resetEmail, setResetEmail] = useState("");
  const [resetQuestions, setResetQuestions] = useState<
    { slot: number; questionId: string }[] | null
  >(null);
  const [resetAnswers, setResetAnswers] = useState<Record<number, string>>({});
  const [resetPassword, setResetPassword] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const startRecovery = useServerFn(startPasswordRecovery);
  const finishRecovery = useServerFn(resetPasswordWithSecurityAnswers);

  useEffect(() => {
    if (!loading && session && !setupOpen) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate, setupOpen]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error(t("auth.errorCredentials"));
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
    toast.success(t("auth.welcomeBack"));
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full_name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (fullName.length < 2) {
      toast.error(t("auth.errorFullName"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("auth.errorPassword"));
      return;
    }
    setBusy(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    toast.success(t("auth.accountCreated"));
    setBusy(false);
    if (signUpData.session) {
      setSetupOpen(true);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  async function loadQuestions() {
    if (!resetEmail.trim()) {
      toast.error(t("auth.errorResetEmail"));
      return;
    }
    setBusy(true);
    try {
      const { questions } = await startRecovery({ data: { email: resetEmail.trim() } });
      setResetQuestions(questions);
      setResetAnswers({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!resetQuestions) return;
    if (resetPassword.length < 8) {
      toast.error(t("auth.errorPassword"));
      return;
    }
    const answers = resetQuestions.map((question) => ({
      slot: question.slot,
      answer: (resetAnswers[question.slot] ?? "").trim(),
    }));
    if (answers.filter((item) => item.answer.length > 0).length < 2) {
      toast.error(t("sq.errorAnswers"));
      return;
    }
    setBusy(true);
    try {
      await finishRecovery({
        data: { email: resetEmail.trim(), answers, password: resetPassword },
      });
      setForgotOpen(false);
      setResetQuestions(null);
      setResetAnswers({});
      setResetPassword("");
      toast.success(t("auth.resetDone"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
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
                  <Label htmlFor="login-password">{t("auth.password")}</Label>
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
                  {t("auth.forgot")}
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
                  <Label htmlFor="reg-password">{t("auth.password")}</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder={t("auth.passwordPlaceholder")}
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

      <Dialog
        open={forgotOpen}
        onOpenChange={(open) => {
          setForgotOpen(open);
          if (!open) {
            setResetQuestions(null);
            setResetAnswers({});
            setResetPassword("");
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("auth.resetTitle")}</DialogTitle>
            <DialogDescription>{t("auth.resetBody")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="reset-email">{t("auth.email")}</Label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              disabled={Boolean(resetQuestions)}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder")}
            />
          </div>

          {resetQuestions ? (
            <div className="space-y-4">
              {resetQuestions.map((question) => (
                <div key={question.slot} className="space-y-2">
                  <Label htmlFor={`answer-${question.slot}`}>
                    {t(questionLabelKey(question.questionId))}
                  </Label>
                  <Input
                    id={`answer-${question.slot}`}
                    autoComplete="off"
                    value={resetAnswers[question.slot] ?? ""}
                    onChange={(event) =>
                      setResetAnswers((current) => ({
                        ...current,
                        [question.slot]: event.target.value,
                      }))
                    }
                    placeholder={t("sq.answerPlaceholder")}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="reset-new-password">{t("auth.newPassword")}</Label>
                <Input
                  id="reset-new-password"
                  type="password"
                  minLength={8}
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("sq.resetRule")}</p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              {t("common.cancel")}
            </Button>
            {resetQuestions ? (
              <Button onClick={handleReset} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {t("auth.resetSubmit")}
              </Button>
            ) : (
              <Button onClick={loadQuestions} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {t("sq.continue")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={setupOpen} onOpenChange={() => undefined}>
        <DialogContent className="max-h-[85vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("sq.setupTitle")}</DialogTitle>
            <DialogDescription>{t("sq.setupBody")}</DialogDescription>
          </DialogHeader>
          <SecurityQuestionsForm
            onSaved={() => {
              setSetupOpen(false);
              navigate({ to: "/dashboard", replace: true });
            }}
          />
        </DialogContent>
      </Dialog>

    </main>
  );
}
