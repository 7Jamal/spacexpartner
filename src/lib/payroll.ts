import type { Database } from "@/integrations/supabase/types";

export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type AccountStatus = Database["public"]["Enums"]["account_status"];

export const WEEKLY_SALARY = 5000;
export const SUPER_ADMIN_EMAIL = "umakukaemekapeter@gmail.com";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "upcoming",
  "pending",
  "processing",
  "successful",
  "failed",
  "postponed",
  "cancelled",
];

export const STATUS_META: Record<
  PaymentStatus,
  { label: string; className: string; dot: string; description: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "border-status-upcoming/35 bg-status-upcoming/10 text-status-upcoming",
    dot: "bg-status-upcoming",
    description: "Scheduled and awaiting the payment date.",
  },
  pending: {
    label: "Pending",
    className: "border-status-pending/35 bg-status-pending/10 text-status-pending",
    dot: "bg-status-pending",
    description: "Queued for review by the finance team.",
  },
  processing: {
    label: "Processing",
    className: "border-status-processing/35 bg-status-processing/10 text-status-processing",
    dot: "bg-status-processing",
    description: "Funds are being released to your bank.",
  },
  successful: {
    label: "Successful",
    className: "border-status-successful/35 bg-status-successful/10 text-status-successful",
    dot: "bg-status-successful",
    description: "Payment completed successfully.",
  },
  failed: {
    label: "Failed",
    className: "border-status-failed/35 bg-status-failed/10 text-status-failed",
    dot: "bg-status-failed",
    description: "The transfer did not go through.",
  },
  postponed: {
    label: "Postponed",
    className: "border-status-postponed/35 bg-status-postponed/10 text-status-postponed",
    dot: "bg-status-postponed",
    description: "Rescheduled to a later date.",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-status-cancelled/35 bg-status-cancelled/10 text-status-cancelled",
    dot: "bg-status-cancelled",
    description: "This payment cycle was cancelled.",
  },
};

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "payment_postponed", label: "Payment postponed" },
  { value: "payment_processing", label: "Payment processing" },
  { value: "holiday", label: "Company holiday" },
  { value: "policy", label: "New company policy" },
  { value: "weekly_update", label: "Weekly update" },
  { value: "general", label: "General announcement" },
] as const;

export function categoryLabel(value: string) {
  return ANNOUNCEMENT_CATEGORIES.find((c) => c.value === value)?.label ?? "Announcement";
}

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Parses a `YYYY-MM-DD` date column into a local Date at midnight. */
export function parseDateOnly(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toDateOnly(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
};

export function countdownTo(target: Date, now: Date = new Date()): Countdown {
  const diff = target.getTime() - now.getTime();
  const past = diff <= 0;
  const abs = Math.abs(diff);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1000),
    past,
  };
}

/** Upcoming weekly payment dates following the partner's schedule. */
export function upcomingPaymentDates(nextPaymentDate: string, count = 5) {
  const start = parseDateOnly(nextPaymentDate);
  return Array.from({ length: count }, (_, i) => addDays(start, i * 7));
}