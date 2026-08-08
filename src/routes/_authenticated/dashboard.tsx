import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { BankDetailsCard } from "@/components/employee/BankDetailsCard";
import { DocumentsCard } from "@/components/employee/DocumentsCard";
import { NoticeBoard } from "@/components/employee/NoticeBoard";
import { NotificationsPanel } from "@/components/employee/NotificationsPanel";
import { PaymentCalendar } from "@/components/employee/PaymentCalendar";
import { PaymentSummary } from "@/components/employee/PaymentSummary";
import { ProfileCard } from "@/components/employee/ProfileCard";
import { useNotifications } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/hooks/useAuth";
import {
  useAnnouncements,
  useBankDetails,
  usePayments,
  useProfile,
} from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard | SpacX Partnership Portal" },
      {
        name: "description",
        content:
          "Your weekly salary, next payment date, payment status, notices and secure documents in one place.",
      },
      { property: "og:title", content: "Employee dashboard | SpacX Partnership Portal" },
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

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="animate-rise">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            Employee dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is everything about your weekly payments and company updates.
          </p>
        </header>

        <PaymentSummary profile={profile} />

        <div className="grid gap-4 lg:grid-cols-2">
          <NoticeBoard announcements={announcements} />
          <NotificationsPanel notifications={notifications} userId={userId} />
        </div>

        <PaymentCalendar profile={profile} payments={payments} />

        <BankDetailsCard userId={userId} bankDetails={bankDetails ?? null} />

        <DocumentsCard userId={userId} />

        <ProfileCard profile={profile} />
      </div>
    </AppShell>
  );
}