import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password | SpaceX Partnership Portal" },
      {
        name: "description",
        content: "Set a new password for your SpaceX Partnership Portal partner account.",
      },
      { property: "og:title", content: "Reset password | SpaceX Partnership Portal" },
      {
        property: "og:description",
        content: "Set a new password for your SpaceX Partnership Portal account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <BrandMark size="lg" className="mb-8 justify-center" />
        <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-7">
          <div>
            <h1 className="font-display text-xl font-semibold">Choose a new password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You must already be signed in to change your password here. If you can't sign in,
              use “Forgot password?” on the sign-in page with your recovery code — no email needed.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            Update password
          </Button>
        </form>
      </div>
    </main>
  );
}