import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RecoveryCodeDialog } from "@/components/RecoveryCodeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { adminIssueRecoveryCode, adminSetPartnerPassword } from "@/lib/recovery.functions";

/** Admin-side, email-free account recovery for a single partner. */
export function PartnerPasswordHelp({ userId }: { userId: string }) {
  const t = useT();
  const issue = useServerFn(adminIssueRecoveryCode);
  const setPassword = useServerFn(adminSetPartnerPassword);
  const [code, setCode] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState("");

  const issueCode = useMutation({
    mutationFn: async () => (await issue({ data: { userId } })).code,
    onSuccess: (value) => {
      setCode(value);
      toast.success(t("recovery.adminIssued"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const applyPassword = useMutation({
    mutationFn: async () => {
      if (tempPassword.length < 8) throw new Error(t("auth.errorPassword"));
      await setPassword({ data: { userId, password: tempPassword } });
    },
    onSuccess: () => {
      setTempPassword("");
      toast.success(t("recovery.adminPasswordDone"));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
        <KeyRound className="size-4 text-accent" />
        {t("recovery.adminHelp")}
      </h3>
      <Button variant="outline" onClick={() => issueCode.mutate()} disabled={issueCode.isPending}>
        {issueCode.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("recovery.adminIssue")}
      </Button>
      <div className="space-y-2">
        <Label htmlFor={`temp-password-${userId}`}>{t("recovery.adminSetPassword")}</Label>
        <div className="flex gap-2">
          <Input
            id={`temp-password-${userId}`}
            value={tempPassword}
            onChange={(event) => setTempPassword(event.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
          />
          <Button
            onClick={() => applyPassword.mutate()}
            disabled={applyPassword.isPending || tempPassword.length < 8}
          >
            {applyPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("common.save")}
          </Button>
        </div>
      </div>
      <RecoveryCodeDialog code={code} onClose={() => setCode(null)} />
    </section>
  );
}
