import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatDateTime } from "@/lib/payroll";

export function ProfileCard({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [jobTitle, setJobTitle] = useState(profile.job_title ?? "");

  useEffect(() => {
    setFullName(profile.full_name);
    setPhone(profile.phone ?? "");
    setJobTitle(profile.job_title ?? "");
  }, [profile.full_name, profile.phone, profile.job_title]);

  const save = useMutation({
    mutationFn: async () => {
      if (fullName.trim().length < 2) throw new Error("Please enter your full name.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          job_title: jobTitle.trim() || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="surface-card p-6">
      <div className="flex items-center gap-2">
        <UserRound className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">Profile settings</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Registered {formatDate(profile.created_at)} · Last login{" "}
        {formatDateTime(profile.last_login_at)}
      </p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" value={profile.email} readOnly disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Role / job title (optional)</Label>
          <Input
            id="job_title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}