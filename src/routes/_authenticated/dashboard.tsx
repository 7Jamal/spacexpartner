import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Landmark } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { BankDetailsCard } from "@/components/employee/BankDetailsCard";
import { DocumentsCard } from "@/components/employee/DocumentsCard";
import { NoticeBoard } from "@/components/employee/NoticeBoard";
import { PaymentCalendar } from "@/components/employee/PaymentCalendar";
import { PaymentSummary } from "@/components/employee/PaymentSummary";
import { ProfileCard } from "@/components/employee/ProfileCard";
import { VerificationNotice } from "@/components/employee/VerificationNotice";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  useAnnouncements,
  useBankDetails,
  useDocuments,
  usePayments,
  useProfile,
} from "@/hooks/useProfile";



export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard | SpaceX Partnership Portal" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content:
          "Your weekly salary, next payment date, payment status, notices and secure documents in one place.",
      },
      { property: "og:title", content: "Partner dashboard | SpaceX Partnership Portal" },
      {
        property: "og:description",
        content: "Track weekly payments, notices and documents securely.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const t = useT();
  const { theme } = useTheme();
  const logoTone = theme === "dark" ? "onDark" : "default";
  const userId = user?.id;
  const { data: profile, isLoading } = useProfile(userId);
  const { data: bankDetails } = useBankDetails(userId);
  usePayments(userId);
  const { data: announcements = [] } = useAnnouncements();
  const { data: documents = [] } = useDocuments(userId);

  if (isLoading || !profile || !userId) {
    return (
      <AppShell>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const firstName = profile.full_name.split(" ")[0] || t("dashboard.welcomeFallback");
  const hasBankDetails = Boolean(
    bankDetails?.account_name?.trim() &&
      bankDetails?.bank_name?.trim() &&
      bankDetails?.account_number?.trim(),
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="animate-rise space-y-4">
          <BrandMark
            size="lg"
            layout="stacked"
            tone={logoTone}
            className="items-start text-left"
            textClassName="justify-start"
          />
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            {t("dashboard.eyebrow")}
          </p>
          <h1 className="font-display text-3xl font-semibold">
            {t("dashboard.welcome", { name: firstName })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </header>

        <VerificationNotice
          verified={
            documents.filter(
              (doc) =>
                doc.mime_type.startsWith("image/") &&
                (doc.file_name.toLowerCase().startsWith("front-") ||
                  doc.file_name.toLowerCase().startsWith("back-")),
            ).length >= 2
          }
        />

        {hasBankDetails ? (
          <PaymentSummary profile={profile} />
        ) : (
          <section className="glass-panel glass-refract p-6">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-accent" />
              <h2 className="font-display text-base font-semibold">
                {t("dashboard.noScheduleTitle")}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {t("dashboard.noScheduleBody")}
            </p>
          </section>
        )}

        <div className="grid gap-4">
          <NoticeBoard announcements={announcements} />
        </div>

        {hasBankDetails ? <PaymentCalendar profile={profile} /> : null}

        <BankDetailsCard userId={userId} bankDetails={bankDetails ?? null} />

        <div id="badge-upload" className="scroll-mt-24">
          <DocumentsCard userId={userId} />
        </div>

        <ProfileCard profile={profile} />

      </div>
    </AppShell>
  );
}