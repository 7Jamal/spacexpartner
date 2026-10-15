import { Wallet } from "lucide-react";

import { StatusBadge } from "@/components/StatusBadge";
import { useT } from "@/lib/i18n";
import { formatMoney } from "@/lib/payroll";
import type { Profile } from "@/hooks/useProfile";

export function PaymentSummary({ profile }: { profile: Profile }) {
  const t = useT();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="glass-sheen relative overflow-hidden rounded-xl border border-[color:var(--glass-border)] bg-gradient-brand p-6 text-primary-foreground shadow-lift">
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
        <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {t("summary.status")}
        </p>
        <div className="mt-4 flex flex-col items-start gap-3">
          <StatusBadge status={profile.payment_status} />
          <span className="text-sm text-muted-foreground">
            {t(`status.${profile.payment_status}.description`)}
          </span>
        </div>
      </div>
    </div>
  );
}
