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
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/payroll";

export function AnnouncementComposer({
  adminId,
  employees,
}: {
  adminId: string;
  employees: EmployeeRecord[];
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [target, setTarget] = useState<string>("all");

  const publish = useMutation({
    mutationFn: async () => {
      const cleanTitle = title.trim();
      const cleanMessage = message.trim();
      if (cleanTitle.length < 3) throw new Error("Please enter a notification title.");
      if (cleanMessage.length < 3) throw new Error("Please write the full message.");

      if (target === "all") {
        // Announcement row keeps the full message; a database trigger delivers the
        // complete title AND message to every employee as a notification.
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
      toast.success(
        target === "all" ? "Announcement published to every employee." : "Notification sent.",
      );
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
        <h2 className="font-display text-base font-semibold">Post an announcement</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        The complete message is stored and delivered to employees, who can open it in full.
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
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Important payment update"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="announcement-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_CATEGORIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement-target">Send to</Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger id="announcement-target">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees (notice board + notification)</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name} · {employee.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement-message">Full message</Label>
          <Textarea
            id="announcement-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            placeholder="Write the complete message here. Multiple paragraphs are supported and will be shown to employees in full."
            required
          />
          <p className="text-[11px] text-muted-foreground">{message.trim().length} characters</p>
        </div>

        <Button type="submit" disabled={publish.isPending}>
          {publish.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Publish
        </Button>
      </form>
    </section>
  );
}