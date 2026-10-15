import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BankDetails } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";

type FormState = {
  account_name: string;
  bank_name: string;
  account_number: string;
  swift_code: string;
  country: string;
  currency: string;
  instructions: string;
};

const EMPTY: FormState = {
  account_name: "",
  bank_name: "",
  account_number: "",
  swift_code: "",
  country: "",
  currency: "USD",
  instructions: "",
};

export function BankDetailsCard({
  userId,
  bankDetails,
}: {
  userId: string;
  bankDetails: BankDetails | null;
}) {
  const queryClient = useQueryClient();
  const t = useT();
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (bankDetails) {
      setForm({
        account_name: bankDetails.account_name ?? "",
        bank_name: bankDetails.bank_name ?? "",
        account_number: bankDetails.account_number ?? "",
        swift_code: bankDetails.swift_code ?? "",
        country: bankDetails.country ?? "",
        currency: bankDetails.currency ?? "USD",
        instructions: bankDetails.instructions ?? "",
      });
    }
  }, [bankDetails]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.account_name.trim() || !form.bank_name.trim() || !form.account_number.trim()) {
        throw new Error(t("bank.errorRequired"));
      }
      const cardNumber = form.account_number.replace(/[\s-]/g, "");
      if (!/^\d{12,19}$/.test(cardNumber)) {
        throw new Error(t("bank.errorNumber"));
      }
      const { error } = await supabase.from("bank_details").upsert(
        {
          user_id: userId,
          account_name: form.account_name.trim(),
          bank_name: form.bank_name.trim(),
          account_number: cardNumber,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;

    },
    onSuccess: () => {
      toast.success(t("bank.saved"));
      queryClient.invalidateQueries({ queryKey: ["bank-details", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: event.target.value })),
    };
  }

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <Landmark className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("bank.title")}</h2>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-status-successful" />
        {t("bank.subtitle")}
      </p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bank_name">{t("bank.bankName")}</Label>
          <Input id="bank_name" required {...field("bank_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_name">{t("bank.accountName")}</Label>
          <Input id="account_name" required autoComplete="cc-name" {...field("account_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_number">{t("bank.accountNumber")}</Label>
          <Input id="account_number" required inputMode="numeric" autoComplete="cc-number" maxLength={23} {...field("account_number")} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("bank.save")}
          </Button>
        </div>
      </form>
    </section>
  );
}