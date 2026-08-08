import { CalendarClock, Languages, UserRound } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { categoryKey, useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  sender_name: string;
  is_read: boolean;
  created_at: string;
  announcement_id: string | null;
};

/**
 * Shows the COMPLETE notification record: full title, the entire message body
 * exactly as the Super Administrator wrote it (paragraphs preserved, scrollable
 * when long), the publication date/time and the sender.
 */
export function NotificationDetailDialog({
  notification,
  onOpenChange,
}: {
  notification: AppNotification | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const { texts, isTranslating } = useTranslatedTexts(
    [notification?.title ?? "", notification?.message ?? ""],
    Boolean(notification),
  );
  const title = texts[0] || notification?.title || "";
  const body = texts[1] ?? notification?.message ?? "";

  return (
    <Dialog open={Boolean(notification)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {notification ? (
          <>
            <DialogHeader>
              <span className="w-fit rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase dark:text-accent">
                {t(categoryKey(notification.type))}
              </span>
              <DialogTitle className="text-left text-lg leading-snug break-words">
                {title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("notif.fullMessageFrom", { sender: notification.sender_name })}
              </DialogDescription>
            </DialogHeader>

            {isTranslating ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Languages className="size-3.5" /> {t("common.translating")}
              </p>
            ) : null}

            <ScrollArea className="max-h-[55vh] pr-3">
              <p className="text-sm/relaxed whitespace-pre-wrap break-words text-foreground">
                {body.trim() ? body : t("notif.noMessage")}
              </p>
            </ScrollArea>

            <div className="mt-2 grid gap-2 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <CalendarClock className="size-3.5" />
                {formatDateTime(notification.created_at)}
              </p>
              <p className="flex items-center gap-2 sm:justify-end">
                <UserRound className="size-3.5" />
                {notification.sender_name}
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}