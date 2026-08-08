import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BankDetails = Database["public"]["Tables"]["bank_details"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type EmployeeDocument = Database["public"]["Tables"]["employee_documents"]["Row"];

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useBankDetails(userId: string | undefined) {
  return useQuery({
    queryKey: ["bank-details", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_details")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as BankDetails | null;
    },
  });
}

export function usePayments(userId: string | undefined) {
  return useQuery({
    queryKey: ["payments", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId!)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Payment[];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Announcement[];
    },
  });
}

export function useDocuments(userId: string | undefined) {
  return useQuery({
    queryKey: ["documents", userId],
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