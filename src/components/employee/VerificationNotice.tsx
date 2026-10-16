import { BadgeCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function VerificationNotice({ verified }: { verified: boolean }) {
  const t = useT();

  if (verified) {
    return (
      <section className="glass-panel glass-refract border-status-successful/40 p-5">
        <div className="flex items-center gap-3">
          <BadgeCheck className="size-5 shrink-0 text-status-successful" />
          <div>
            <h2 className="font-display text-base font-semibold">{t("verify.pendingTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("verify.pendingBody")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      role="alert"
      className="glass-panel glass-refract animate-rise relative overflow-hidden border-2 border-status-failed/60 p-5 ring-1 ring-status-failed/30"
    >
      <div className="pointer-events-none absolute inset-0 bg-status-failed/10" />
      <div className="relative flex flex-wrap items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-status-failed/50 bg-status-failed/15">
          <ShieldAlert className="size-5 animate-pulse text-status-failed" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-status-failed">
            {t("verify.requiredEyebrow")}
          </p>
          <h2 className="font-display mt-0.5 text-lg font-semibold">{t("verify.requiredTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("verify.requiredBody")}</p>
        </div>
        <Button
          className="shrink-0"
          onClick={() =>
            document
              .getElementById("badge-upload")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        >
          {t("verify.cta")}
        </Button>
      </div>
    </section>
  );
}
