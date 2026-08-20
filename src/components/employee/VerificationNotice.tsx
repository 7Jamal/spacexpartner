import { AlertTriangle, BadgeCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function VerificationNotice({ verified }: { verified: boolean }) {
  const t = useT();

  if (verified) {
    return (
      <section className="glass-panel glass-refract border-status-successful/40 p-5">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 size-5 text-status-successful" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-status-successful">
              {t("verify.pendingEyebrow")}
            </p>
            <h2 className="font-display text-base font-semibold">{t("verify.pendingTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("verify.pendingBody")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      role="alert"
      className="glass-panel glass-refract animate-rise relative overflow-hidden border-2 border-status-failed/60 p-6 ring-1 ring-status-failed/30"
    >
      <div className="pointer-events-none absolute inset-0 bg-status-failed/10" />
      <div className="relative flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-status-failed/50 bg-status-failed/15">
          <ShieldAlert className="size-5 animate-pulse text-status-failed" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-status-failed">
            {t("verify.requiredEyebrow")}
          </p>
          <h2 className="font-display mt-1 text-lg font-semibold">{t("verify.requiredTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("verify.requiredBody")}</p>

          <ul className="mt-4 space-y-2 text-sm">
            {["verify.consequence1", "verify.consequence2", "verify.consequence3"].map((key) => (
              <li key={key} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-failed" />
                <span className="font-medium">{t(key as "verify.consequence1")}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs font-semibold text-status-failed">
            {t("verify.deadlineNote")}
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              document
                .getElementById("badge-upload")
                ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          >
            {t("verify.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
