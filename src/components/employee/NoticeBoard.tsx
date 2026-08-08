import { Megaphone } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Announcement } from "@/hooks/useProfile";
import { categoryLabel, formatDateTime } from "@/lib/payroll";

export function NoticeBoard({ announcements }: { announcements: Announcement[] }) {
  return (
    <section className="glass-panel flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">Company notice board</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Announcements published by the administrator.
      </p>

      {announcements.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No announcements have been posted yet.</p>
      ) : (
        <ScrollArea className="mt-4 max-h-96 pr-3">
          <ol className="space-y-4">
            {announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="rounded-xl border glass-inset p-4 animate-rise"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-accent-foreground dark:text-accent">
                    {categoryLabel(announcement.category)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDateTime(announcement.created_at)}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold break-words">{announcement.title}</h3>
                <p className="mt-1 text-sm/relaxed whitespace-pre-wrap break-words text-muted-foreground">
                  {announcement.message}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/80">
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