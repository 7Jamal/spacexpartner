import { Languages, Megaphone } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { Announcement } from "@/hooks/useProfile";
import { categoryKey, useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";

export function NoticeBoard({ announcements }: { announcements: Announcement[] }) {
  const t = useT();
  // Administrator free text is translated in full for the reader's language.
  const source = announcements.flatMap((item) => [item.title, item.message]);
  const { texts, isTranslating, isTranslated } = useTranslatedTexts(source);

  return (
    <section className="glass-panel flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("notice.title")}</h2>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {t("notice.subtitle")}
        {isTranslating ? (
          <span className="inline-flex items-center gap-1">
            <Languages className="size-3" /> {t("common.translating")}
          </span>
        ) : isTranslated ? (
          <span className="inline-flex items-center gap-1">
            <Languages className="size-3" /> {t("common.translated")}
          </span>
        ) : null}
      </p>

      {announcements.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t("notice.empty")}</p>
      ) : (
        <ScrollArea className="mt-4 max-h-96 pr-3">
          <ol className="space-y-4">
            {announcements.map((announcement, index) => (
              <li
                key={announcement.id}
                className="rounded-xl border glass-inset p-4 animate-rise"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-accent-foreground dark:text-accent">
                    {t(categoryKey(announcement.category))}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateTime(announcement.created_at)}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold break-words">
                  {texts[index * 2] ?? announcement.title}
                </h3>
                <p className="mt-1 text-sm/relaxed whitespace-pre-wrap break-words text-muted-foreground">
                  {texts[index * 2 + 1] ?? announcement.message}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  — {announcement.sender_name}
                </p>
              </li>
            ))}
          </ol>
        </ScrollArea>
      )}
    </section>
  );
}