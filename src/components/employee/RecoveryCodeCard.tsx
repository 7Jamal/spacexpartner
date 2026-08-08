import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RecoveryCodeDialog } from "@/components/RecoveryCodeDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";
import { issueMyRecoveryCode } from "@/lib/recovery.functions";

/** Lets a partner mint the recovery code that replaces email password resets. */
export function RecoveryCodeCard({ userId }: { userId: string }) {
  const t = useT();
  const queryClient = useQueryClient();
  const issue = useServerFn(issueMyRecoveryCode);
  const [code, setCode] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["recovery-code", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recovery_codes")
        .select("created_at, updated_at, last_used_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const generate = useMutation({
    mutationFn: async () => (await issue({})).code,
    onSuccess: (value) => {
      setCode(value);
      queryClient.invalidateQueries({ queryKey: ["recovery-code", userId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("recovery.cardTitle")}</h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("recovery.cardBody")}</p>

      {status ? (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <span>{t("recovery.created", { date: formatDateTime(status.updated_at) })}</span>
          <span>
            {status.last_used_at
              ? t("recovery.lastUsed", { date: formatDateTime(status.last_used_at) })
              : t("recovery.neverUsed")}
          </span>
        </div>
      ) : (
        <p className="mt-4 text-sm text-status-pending">{t("recovery.none")}</p>
      )}

      <Button
        className="mt-4"
        variant="outline"
        onClick={() => generate.mutate()}
        disabled={generate.isPending}
      >
        {generate.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("recovery.generate")}
      </Button>

      <RecoveryCodeDialog code={code} onClose={() => setCode(null)} />
    </section>
  );
}
