import type { Database } from "@/integrations/supabase/types";
import { getActiveLocale } from "@/lib/i18n/active";

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
  { className: string; dot: string }
> = {
  upcoming: {
    className: "border-status-upcoming/35 bg-status-upcoming/10 text-status-upcoming",
    dot: "bg-status-upcoming",
  },
  pending: {
    className: "border-status-pending/35 bg-status-pending/10 text-status-pending",
    dot: "bg-status-pending",
  },
  processing: {
    className: "border-status-processing/35 bg-status-processing/10 text-status-processing",
    dot: "bg-status-processing",
  },
  successful: {
    className: "border-status-successful/35 bg-status-successful/10 text-status-successful",
    dot: "bg-status-successful",
  },
  failed: {
    className: "border-status-failed/35 bg-status-failed/10 text-status-failed",
    dot: "bg-status-failed",
  },
  postponed: {
    className: "border-status-postponed/35 bg-status-postponed/10 text-status-postponed",
    dot: "bg-status-postponed",
  },
  cancelled: {
    className: "border-status-cancelled/35 bg-status-cancelled/10 text-status-cancelled",
    dot: "bg-status-cancelled",
  },
};

export const ANNOUNCEMENT_CATEGORIES = [
  "payment_postponed",
  "payment_processing",
  "holiday",
  "policy",
  "weekly_update",
  "general",
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat(getActiveLocale(), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(getActiveLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(getActiveLocale(), {
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