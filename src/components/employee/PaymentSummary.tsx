import { CalendarDays, Clock, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_META, countdownTo, formatDate, formatMoney, parseDateOnly } from "@/lib/payroll";
import type { Profile } from "@/hooks/useProfile";

export function PaymentSummary({ profile }: { profile: Profile }) {
  const target = parseDateOnly(profile.next_payment_date);
  const [countdown, setCountdown] = useState(() => countdownTo(target));

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(countdownTo(parseDateOnly(profile.next_payment_date))), 1000);
    return () => window.clearInterval(id);
  }, [profile.next_payment_date]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-panel relative overflow-hidden bg-gradient-brand p-6 text-primary-foreground md:col-span-1">
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-25 blur-2xl"
          style={{ background: "var(--gradient-gold)" }}
        />
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-primary-foreground/70">
          <Wallet className="size-3.5" /> Weekly salary
        </p>
        <p className="mt-3 font-display text-4xl font-semibold">
          {formatMoney(Number(profile.weekly_salary))}
        </p>
        <p className="mt-2 text-xs text-primary-foreground/70">Paid every week, every partner.</p>
      </div>

      <div className="glass-panel p-6">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <CalendarDays className="size-3.5" /> Next payment date
        </p>
        <p className="mt-3 font-display text-2xl font-semibold">
          {formatDate(target)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {countdown.past
            ? "Payment date reached — awaiting confirmation."
            : `${countdown.days} day${countdown.days === 1 ? "" : "s"} remaining`}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <StatusBadge status={profile.payment_status} />
          <span className="text-xs text-muted-foreground">
            {STATUS_META[profile.payment_status].description}
          </span>
        </div>
      </div>

      <div className="glass-panel p-6">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          <Clock className="size-3.5" /> Countdown
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { label: "Days", value: countdown.days },
            { label: "Hrs", value: countdown.hours },
            { label: "Min", value: countdown.minutes },
            { label: "Sec", value: countdown.seconds },
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
          {countdown.past ? "Payment window is open." : "Until funds are released."}
        </p>
      </div>
    </div>
  );
}