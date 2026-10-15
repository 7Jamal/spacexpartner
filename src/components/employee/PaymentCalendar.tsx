import { History } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import type { Profile } from "@/hooks/useProfile";
import { useT } from "@/lib/i18n";
import { formatMoney } from "@/lib/payroll";

/** Single-payment history: the one Musk Foundation Benefits payment. */
export function PaymentCalendar({ profile }: { profile: Profile }) {
  const t = useT();
  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <History className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("history.title")}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("history.subtitle")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border glass-inset px-4 py-3">
        <p className="text-sm font-semibold">{t("history.source")}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums">
            {formatMoney(Number(profile.weekly_salary))}
          </span>
          <StatusBadge size="sm" status={profile.payment_status} />
        </div>
      </div>
    </section>
  );
}
