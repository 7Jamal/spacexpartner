import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  NotificationDetailDialog,
  type AppNotification,
} from "@/components/notifications/NotificationDetailDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/payroll";
import { cn } from "@/lib/utils";

export function NotificationsPanel({
  notifications,
  userId,
}: {
  notifications: AppNotification[];
  userId: string | undefined;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<AppNotification | null>(null);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  return (
    <section className="glass-panel flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <BellRing className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">Notifications</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Tap a notification to read the full message.
      </p>

      {notifications.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing new right now.</p>
      ) : (
        <ScrollArea className="mt-4 max-h-96 pr-3">
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(notification);
                    if (!notification.is_read) markRead.mutate(notification.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border glass-inset p-3 text-left transition hover:shadow-soft",
                    !notification.is_read && "border-accent/40 bg-accent/5",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{notification.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {formatDateTime(notification.created_at)} · {notification.sender_name}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}

      <NotificationDetailDialog
        notification={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </section>
  );
}