import { CalendarDays, Clock, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { useT } from "@/lib/i18n";
import { countdownTo, formatDate, formatMoney, parseDateOnly } from "@/lib/payroll";
import type { Profile } from "@/hooks/useProfile";

export function PaymentSummary({ profile }: { profile: Profile }) {
  const t = useT();
  const target = parseDateOnly(profile.next_payment_date);
  const [countdown, setCountdown] = useState(() => countdownTo(target));

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(countdownTo(parseDateOnly(profile.next_payment_date))), 1000);
    return () => window.clearInterval(id);
  }, [profile.next_payment_date]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-sheen relative overflow-hidden rounded-xl border border-[color:var(--glass-border)] bg-gradient-brand p-6 text-primary-foreground shadow-lift md:col-span-1">
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-25 blur-2xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-primary-foreground/70">
          <Wallet className="size-3.5" /> {t("summary.weeklySalary")}
        </p>
        <p className="mt-3 font-display text-4xl font-semibold">
          {formatMoney(Number(profile.weekly_salary))}
        </p>
        <p className="mt-2 text-xs text-primary-foreground/70">{t("summary.paidEveryWeek")}</p>
      </div>

      <div className="glass-panel glass-refract p-6">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <CalendarDays className="size-3.5" /> {t("summary.nextPaymentDate")}
        </p>
        <p className="mt-3 font-display text-2xl font-semibold">
          {formatDate(target)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {countdown.past
            ? t("summary.dateReached")
            : countdown.days === 1
              ? t("summary.dayRemaining")
              : t("summary.daysRemaining", { count: countdown.days })}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={profile.payment_status} />
          <span className="text-xs text-muted-foreground">
            {t(`status.${profile.payment_status}.description`)}
          </span>
        </div>
      </div>

      <div className="glass-panel glass-refract p-6">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <Clock className="size-3.5" /> {t("summary.countdown")}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { label: t("summary.days"), value: countdown.days },
            { label: t("summary.hours"), value: countdown.hours },
            { label: t("summary.minutes"), value: countdown.minutes },
            { label: t("summary.seconds"), value: countdown.seconds },
          ].map((unit) => (
            <div
              key={unit.label}
              className="rounded-xl border glass-inset px-2 py-3 text-center"
            >
              <p className="font-display text-xl font-semibold tabular-nums">
                {`${unit.value}`.padStart(2, "0")}
              </p>
              <p className="text-[10px] tracking-wide uppercase text-muted-foreground">
                {unit.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {countdown.past ? t("summary.windowOpen") : t("summary.untilRelease")}
        </p>
      </div>
    </div>
  );
}