import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { SecurityQuestionsForm } from "@/components/security/SecurityQuestionsForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { questionLabelKey } from "@/lib/security-questions";
import { useState } from "react";

/** Dashboard card for reviewing and updating the account recovery questions. */
export function SecurityQuestionsCard({ userId }: { userId: string }) {
  const t = useT();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["security-questions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_answers")
        .select("slot, question_key")
        .eq("user_id", userId)
        .order("slot");
      if (error) throw error;
      return data;
    },
  });

  const configured = (rows?.length ?? 0) >= 3;

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("sq.cardTitle")}</h2>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("sq.cardBody")}</p>

      {!configured ? (
        <p className="mt-3 text-sm text-status-pending">{t("sq.cardMissing")}</p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {rows!.map((row) => (
            <li key={row.slot}>• {t(questionLabelKey(row.question_key))}</li>
          ))}
        </ul>
      )}

      {editing || !configured ? (
        <div className="mt-4">
          <SecurityQuestionsForm
            initialQuestionIds={rows?.map((row) => row.question_key)}
            onSaved={() => {
              setEditing(false);
              queryClient.invalidateQueries({ queryKey: ["security-questions", userId] });
            }}
          />
        </div>
      ) : (
        <Button className="mt-4" variant="outline" onClick={() => setEditing(true)}>
          {t("sq.update")}
        </Button>
      )}
    </section>
  );
}
