import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/payroll";
import { cn } from "@/lib/utils";

import { NotificationDetailDialog, type AppNotification } from "./NotificationDetailDialog";

export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      // Select every stored field so the full message is always available.
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, sender_name, is_read, created_at, announcement_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}

export function NotificationCenter({ userId }: { userId: string | undefined }) {
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useNotifications(userId);
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  function openNotification(notification: AppNotification) {
    setSelected(notification);
    setOpen(false);
    if (!notification.is_read) markRead.mutate([notification.id]);
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-4" />
            {unread > 0 ? (
              <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-display text-sm font-semibold">Notifications</p>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markRead.mutate(notifications.filter((n) => !n.is_read).map((n) => n.id))}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>
          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                You have no notifications yet.
              </p>
            ) : (
              <ul className="divide-y">
                {notifications.map((notification) => (
                  <li key={notification.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        !notification.is_read && "bg-primary/5",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.is_read ? (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                        ) : (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-transparent" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {notification.message || "Open to read the full message."}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground/80">
                            {formatDateTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete notification"
                      onClick={() => remove.mutate(notification.id)}
                      className="absolute top-2.5 right-2 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <NotificationDetailDialog
        notification={selected}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </>
  );
}