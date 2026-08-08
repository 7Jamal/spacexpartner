import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { formatDate, formatDateTime } from "@/lib/payroll";

export function ProfileCard({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const t = useT();
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");

  useEffect(() => {
    setFullName(profile.full_name);
    setPhone(profile.phone ?? "");
  }, [profile.full_name, profile.phone]);

  const save = useMutation({
    mutationFn: async () => {
      if (fullName.trim().length < 2) throw new Error(t("profile.errorName"));
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("profile.updated"));
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <UserRound className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("profile.title")}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("profile.meta", {
          registered: formatDate(profile.created_at),
          lastLogin: formatDateTime(profile.last_login_at),
        })}
      </p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("profile.fullName")}</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("profile.email")}</Label>
          <Input id="email" value={profile.email} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("profile.phone")}</Label>
          <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("common.save")}
          </Button>
        </div>
      </form>
    </section>
  );
}