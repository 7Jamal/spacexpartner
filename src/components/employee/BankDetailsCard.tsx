import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BankDetails } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

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
        throw new Error("Account name, bank name and account number are required.");
      }
      if (!/^[0-9A-Za-z\s-]{4,34}$/.test(form.account_number.trim())) {
        throw new Error("Enter a valid account number (4–34 letters or digits).");
      }
      const { error } = await supabase.from("bank_details").upsert(
        {
          user_id: userId,
          account_name: form.account_name.trim(),
          bank_name: form.bank_name.trim(),
          account_number: form.account_number.trim(),
          swift_code: form.swift_code.trim() || null,
          country: form.country.trim(),
          currency: form.currency.trim().toUpperCase() || "USD",
          instructions: form.instructions.trim() || null,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;

      // First-time submission starts the payment schedule & countdown.
      if (!bankDetails) {
        const start = new Date();
        start.setDate(start.getDate() + 7);
        const next = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, "0")}-${`${start.getDate()}`.padStart(2, "0")}`;
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ next_payment_date: next })
          .eq("id", userId);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      toast.success("Bank details saved securely.");
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
        <h2 className="font-display text-base font-semibold">Bank details</h2>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-status-successful" />
        Visible only to you and the Super Administrator.
      </p>

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="account_name">Account name</Label>
          <Input id="account_name" required {...field("account_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank name</Label>
          <Input id="bank_name" required {...field("bank_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_number">Account number</Label>
          <Input id="account_number" required {...field("account_number")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="swift_code">Swift code (optional)</Label>
          <Input id="swift_code" {...field("swift_code")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" required {...field("country")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" required maxLength={6} {...field("currency")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructions">Additional payment instructions (optional)</Label>
          <Textarea id="instructions" rows={3} {...field("instructions")} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save bank details
          </Button>
        </div>
      </form>
    </section>
  );
}