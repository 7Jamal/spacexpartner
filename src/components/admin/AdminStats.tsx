import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  UserMinus,
  Users,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { EmployeeRecord } from "@/hooks/useAdmin";
import type { Payment } from "@/hooks/useProfile";

export function AdminStats({
  employees,
  payments,
}: {
  employees: EmployeeRecord[];
  payments: Payment[];
}) {
  const countStatus = (status: Payment["status"]) =>
    payments.filter((p) => p.status === status).length;

  const cards: Array<{ label: string; value: number; icon: LucideIcon; tone: string }> = [
    { label: "Total employees", value: employees.length, icon: Users, tone: "text-primary" },
    {
      label: "Active employees",
      value: employees.filter((e) => e.account_status === "active").length,
      icon: UserCheck,
      tone: "text-status-successful",
    },
    {
      label: "Suspended",
      value: employees.filter((e) => e.account_status === "suspended").length,
      icon: UserMinus,
      tone: "text-status-failed",
    },
    {
      label: "Successful payments",
      value: countStatus("successful"),
      icon: CheckCircle2,
      tone: "text-status-successful",
    },
    {
      label: "Pending payments",
      value: countStatus("pending") + countStatus("processing"),
      icon: Clock,
      tone: "text-status-pending",
    },
    {
      label: "Failed payments",
      value: countStatus("failed"),
      icon: AlertTriangle,
      tone: "text-status-failed",
    },
    {
      label: "Upcoming payments",
      value: countStatus("upcoming"),
      icon: CalendarClock,
      tone: "text-status-upcoming",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="surface-card animate-rise p-5 transition hover:shadow-lift"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              {card.label}
            </p>
            <card.icon className={`size-4 ${card.tone}`} />
          </div>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{card.value}</p>
        </div>
      ))}
    </div>
  );
}