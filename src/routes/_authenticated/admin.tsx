import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminStats } from "@/components/admin/AdminStats";
import { AllDocumentsPanel } from "@/components/admin/AllDocumentsPanel";
import { AnnouncementComposer } from "@/components/admin/AnnouncementComposer";
import { EmployeeDetailSheet } from "@/components/admin/EmployeeDetailSheet";
import { EmployeeTable } from "@/components/admin/EmployeeTable";
import { AppShell } from "@/components/AppShell";
import { NoticeBoard } from "@/components/employee/NoticeBoard";
import { useAllPayments, useEmployees, type EmployeeRecord } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin console | SpaceX Partnership Portal" },
      {
        name: "description",
        content:
          "Super administrator console for managing partners, weekly payments, notices and secure documents.",
      },
      { property: "og:title", content: "Admin console | SpaceX Partnership Portal" },
      {
        property: "og:description",
        content: "Manage partners, payment statuses and company announcements.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useEmployees();
  const { data: payments = [] } = useAllPayments();
  const { data: announcements = [] } = useAnnouncements();
  const [selected, setSelected] = useState<EmployeeRecord | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, isAdmin, navigate]);

  const selectedFresh = selected
    ? employees.find((employee) => employee.id === selected.id) ?? selected
    : null;

  if (loading || isLoading || !user || !isAdmin) {
    return (
      <AppShell>
        <div className="grid min-h-[50vh] place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="animate-rise">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] uppercase text-accent">
            <ShieldCheck className="size-3.5" /> Super administrator
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Admin console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full control over partners, weekly payments, notices and supporting documents.
          </p>
        </header>

        <AdminStats employees={employees} payments={payments} />

        <div className="grid gap-4 lg:grid-cols-2">
          <AnnouncementComposer adminId={user.id} employees={employees} />
          <NoticeBoard announcements={announcements} />
        </div>

        <EmployeeTable employees={employees} onSelect={setSelected} />

        <AllDocumentsPanel employees={employees} />
      </div>

      <EmployeeDetailSheet
        employee={selectedFresh}
        payments={payments}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </AppShell>
  );
}