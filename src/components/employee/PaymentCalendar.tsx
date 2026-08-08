import { CalendarRange, History } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import type { Payment, Profile } from "@/hooks/useProfile";
import { formatDate, formatMoney, parseDateOnly, upcomingPaymentDates } from "@/lib/payroll";

export function PaymentCalendar({
  profile,
  payments,
}: {
  profile: Profile;
  payments: Payment[];
}) {
  const upcoming = upcomingPaymentDates(profile.next_payment_date, 5);
  const history = payments.filter(
    (p) => parseDateOnly(p.payment_date).getTime() <= Date.now(),
  );
  const scheduledFuture = payments.filter(
    (p) => parseDateOnly(p.payment_date).getTime() > Date.now(),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-accent" />
          <h2 className="font-display text-base font-semibold">Payment calendar</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Your next five weekly payment dates.
        </p>
        <ul className="mt-4 space-y-2">
          {upcoming.map((date, index) => {
            const match = scheduledFuture.find((p) => p.payment_date === toKey(date));
            return (
              <li
                key={toKey(date)}
                className="flex items-center justify-between rounded-xl border glass-inset px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{formatDate(date)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {index === 0 ? "Next payment" : `Week ${index + 1}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatMoney(Number(profile.weekly_salary))}
                  </span>
                  <StatusBadge
                    size="sm"
                    status={index === 0 ? profile.payment_status : (match?.status ?? "upcoming")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="glass-panel p-6">
        <div className="flex items-center gap-2">
          <History className="size-4 text-accent" />
          <h2 className="font-display text-base font-semibold">Payment history</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Every recorded payment on your account.</p>
        {history.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No past payments yet — your first payment is on the way.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-wide uppercase text-muted-foreground">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3">{formatDate(parseDateOnly(payment.payment_date))}</td>
                    <td className="py-3 tabular-nums">{formatMoney(Number(payment.amount))}</td>
                    <td className="py-3">
                      <StatusBadge size="sm" status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function toKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}