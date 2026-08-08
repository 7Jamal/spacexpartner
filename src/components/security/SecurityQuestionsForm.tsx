import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { useT } from "@/lib/i18n";
import { saveMySecurityAnswers } from "@/lib/recovery.functions";
import { SECURITY_QUESTIONS } from "@/lib/security-questions";

const DEFAULTS = ["birth_city", "first_school", "childhood_nickname"];

/** Lets a partner choose and answer the three questions that recover their account. */
export function SecurityQuestionsForm({
  initialQuestionIds,
  onSaved,
}: {
  initialQuestionIds?: string[] | undefined;
  onSaved?: (() => void) | undefined;
}) {
  const t = useT();
  const save = useServerFn(saveMySecurityAnswers);
  const [busy, setBusy] = useState(false);
  const [questionIds, setQuestionIds] = useState<string[]>(() => {
    const seeded = (initialQuestionIds ?? []).filter(Boolean);
    return [0, 1, 2].map((index) => seeded[index] ?? DEFAULTS[index]!);
  });
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  function setQuestion(index: number, value: string) {
    setQuestionIds((current) => current.map((item, i) => (i === index ? value : item)));
  }

  async function submit() {
    if (new Set(questionIds).size !== 3) {
      toast.error(t("sq.errorDuplicate"));
      return;
    }
    if (answers.some((answer) => answer.trim().length < 2)) {
      toast.error(t("sq.errorAnswers"));
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          answers: questionIds.map((questionId, index) => ({
            slot: index + 1,
            questionId,
            answer: answers[index]!.trim(),
          })),
        },
      });
      setAnswers(["", "", ""]);
      toast.success(t("sq.saved"));
      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {questionIds.map((questionId, index) => (
        <div key={index} className="space-y-2">
          <Label>{t("sq.questionN", { n: index + 1 })}</Label>
          <Select value={questionId} onValueChange={(value) => setQuestion(index, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECURITY_QUESTIONS.map((question) => (
                <SelectItem
                  key={question.id}
                  value={question.id}
                  disabled={questionIds.includes(question.id) && question.id !== questionId}
                >
                  {t(question.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={answers[index]}
            onChange={(event) =>
              setAnswers((current) =>
                current.map((item, i) => (i === index ? event.target.value : item)),
              )
            }
            placeholder={t("sq.answerPlaceholder")}
            autoComplete="off"
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{t("sq.hint")}</p>
      <Button onClick={submit} disabled={busy} className="w-full">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {t("sq.save")}
      </Button>
    </div>
  );
}
