import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { adminSetPartnerPassword } from "@/lib/recovery.functions";
import { isValidPin, onlyDigits, PIN_LENGTH, pinToPassword } from "@/lib/pin";

/** Admin-side, email-free account recovery for a single partner. */
export function PartnerPasswordHelp({ userId }: { userId: string }) {
  const t = useT();
  const setPassword = useServerFn(adminSetPartnerPassword);
  const [pin, setPin] = useState("");

  const applyPassword = useMutation({
    mutationFn: async () => {
      if (!isValidPin(pin)) throw new Error(t("auth.errorPin"));
      await setPassword({ data: { userId, password: pinToPassword(pin) } });
    },
    onSuccess: () => {
      setPin("");
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
      <div className="space-y-2">
        <Label htmlFor={`temp-password-${userId}`}>{t("recovery.adminSetPassword")}</Label>
        <div className="flex gap-2">
          <Input
            id={`temp-password-${userId}`}
            value={pin}
            inputMode="numeric"
            maxLength={PIN_LENGTH}
            onChange={(event) => setPin(onlyDigits(event.target.value))}
            className="text-center tracking-[0.5em]"
            placeholder="0000"
          />
          <Button
            onClick={() => applyPassword.mutate()}
            disabled={applyPassword.isPending || !isValidPin(pin)}
          >
            {applyPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("common.save")}
          </Button>
        </div>
      </div>
    </section>
  );
}
