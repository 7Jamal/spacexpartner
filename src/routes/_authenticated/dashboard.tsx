import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Landmark } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { BankDetailsCard } from "@/components/employee/BankDetailsCard";
import { DocumentsCard } from "@/components/employee/DocumentsCard";
import { NoticeBoard } from "@/components/employee/NoticeBoard";
import { NotificationsPanel } from "@/components/employee/NotificationsPanel";
import { PaymentCalendar } from "@/components/employee/PaymentCalendar";
import { PaymentSummary } from "@/components/employee/PaymentSummary";
import { ProfileCard } from "@/components/employee/ProfileCard";
import { useNotifications } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import {
  useAnnouncements,
  useBankDetails,
  usePayments,
  useProfile,
} from "@/hooks/useProfile";



export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard | SpaceX Partnership Portal" },
      {
        name: "description",
        content:
          "Your weekly salary, next payment date, payment status, notices and secure documents in one place.",
      },
      { property: "og:title", content: "Employee dashboard | SpaceX Partnership Portal" },
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
  const { theme } = useTheme();
  const logoTone = theme === "dark" ? "onDark" : "default";
  const userId = user?.id;
  const { data: profile, isLoading } = useProfile(userId);
  const { data: bankDetails } = useBankDetails(userId);
  const { data: payments = [] } = usePayments(userId);
  const { data: announcements = [] } = useAnnouncements();
  const { data: notifications = [] } = useNotifications(userId);

  if (isLoading || !profile || !userId) {
    return (
      <AppShell>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const firstName = profile.full_name.split(" ")[0] || "there";
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
            tone="onDark"
            className="items-start text-left"
            textClassName="justify-start"
          />
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            Employee dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold">
            Welcome back, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is everything about your weekly payments and company updates.
          </p>
        </header>

        {hasBankDetails ? (
          <PaymentSummary profile={profile} />
        ) : (
          <section className="glass-panel glass-refract p-6">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-accent" />
              <h2 className="font-display text-base font-semibold">
                Your payment schedule hasn’t started yet
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The weekly payment countdown and calendar only begin once you save your bank
              details below. Complete the <span className="font-semibold">Bank details</span>{" "}
              form and your first payment date, countdown and schedule will appear here
              immediately.
            </p>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <NoticeBoard announcements={announcements} />
          <NotificationsPanel notifications={notifications} userId={userId} />
        </div>

        {hasBankDetails ? <PaymentCalendar profile={profile} payments={payments} /> : null}

        <BankDetailsCard userId={userId} bankDetails={bankDetails ?? null} />

        <DocumentsCard userId={userId} />

        <ProfileCard profile={profile} />
      </div>
    </AppShell>
  );
}