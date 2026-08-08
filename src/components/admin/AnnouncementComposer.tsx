import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Megaphone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EmployeeRecord } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { categoryKey, useT } from "@/lib/i18n";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/payroll";

export function AnnouncementComposer({
  adminId,
  employees,
}: {
  adminId: string;
  employees: EmployeeRecord[];
}) {
  const queryClient = useQueryClient();
  const t = useT();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [target, setTarget] = useState<string>("all");

  const publish = useMutation({
    mutationFn: async () => {
      const cleanTitle = title.trim();
      const cleanMessage = message.trim();
      if (cleanTitle.length < 3) throw new Error(t("composer.errorTitle"));
      if (cleanMessage.length < 3) throw new Error(t("composer.errorMessage"));

      if (target === "all") {
        // Announcement row keeps the full message; a database trigger delivers the
        // complete title AND message to every partner as a notification.
        const { error } = await supabase.from("announcements").insert({
          title: cleanTitle,
          message: cleanMessage,
          category,
          created_by: adminId,
          sender_name: "Super Administrator",
        });
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("notifications").insert({
        user_id: target,
        title: cleanTitle,
        message: cleanMessage,
        type: category,
        sender_name: "Super Administrator",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(target === "all" ? t("composer.published") : t("composer.sent"));
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <Megaphone className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("composer.title")}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("composer.subtitle")}
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          publish.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">{t("composer.titleField")}</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("composer.titlePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-category">{t("composer.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="announcement-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_CATEGORIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(categoryKey(option))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement-target">{t("composer.sendTo")}</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger id="announcement-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("composer.allPartners")}</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name} · {employee.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement-message">{t("composer.message")}</Label>
          <Textarea
            id="announcement-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            placeholder={t("composer.messagePlaceholder")}
            required
          />
          <p className="text-[11px] text-muted-foreground">
            {t("common.characters", { count: message.trim().length })}
          </p>
        </div>

        <Button type="submit" disabled={publish.isPending}>
          {publish.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {t("composer.publish")}
        </Button>
      </form>
    </section>
  );
}