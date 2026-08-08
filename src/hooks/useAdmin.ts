import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { BankDetails, EmployeeDocument, Payment, Profile } from "@/hooks/useProfile";

export type EmployeeRecord = Profile & { bank: BankDetails | null };

export function useEmployees() {
  return useQuery({
    queryKey: ["admin", "employees"],
    queryFn: async () => {
      const [{ data: profiles, error: profileError }, { data: roles, error: roleError }, { data: banks, error: bankError }] =
        await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("user_roles").select("user_id, role"),
          supabase.from("bank_details").select("*"),
        ]);
      if (profileError) throw profileError;
      if (roleError) throw roleError;
      if (bankError) throw bankError;

      const adminIds = new Set(
        (roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id),
      );
      const bankMap = new Map((banks ?? []).map((b) => [b.user_id, b as BankDetails]));

      return (profiles ?? [])
        .filter((profile) => !adminIds.has(profile.id))
        .map((profile) => ({
          ...(profile as Profile),
          bank: bankMap.get(profile.id) ?? null,
        })) as EmployeeRecord[];
    },
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ["admin", "payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });
}

export function useEmployeeDocuments(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "documents", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EmployeeDocument[];
    },
  });
}