import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DocumentThumb } from "@/components/employee/DocumentsCard";
import { StatusBadge } from "@/components/StatusBadge";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useEmployeeDocuments,
  useEmployeeNotifications,
  type EmployeeRecord,
} from "@/hooks/useAdmin";
import type { Payment } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { deleteEmployee } from "@/lib/admin.functions";
import {
  PAYMENT_STATUSES,
  STATUS_META,
  formatDate,
  formatDateTime,
  formatMoney,
  parseDateOnly,
  type PaymentStatus,
} from "@/lib/payroll";

const BUCKET = "employee-documents";

export function EmployeeDetailSheet({
  employee,
  payments,
  onOpenChange,
}: {
  employee: EmployeeRecord | null;
  payments: Payment[];
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const removeEmployee = useServerFn(deleteEmployee);
  const { data: documents = [] } = useEmployeeDocuments(employee?.id);
  const { data: messages = [] } = useEmployeeNotifications(employee?.id);
  const [fullName, setFullName] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [salary, setSalary] = useState("");
  const [initialised, setInitialised] = useState<string | null>(null);

  if (employee && initialised !== employee.id) {
    setInitialised(employee.id);
    setFullName(employee.full_name);
    setNextDate(employee.next_payment_date);
    setSalary(String(Number(employee.weekly_salary)));
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const saveDetails = useMutation({
    mutationFn: async () => {
      if (!employee) return;
      if (fullName.trim().length < 2) throw new Error("Enter the employee's full name.");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          next_payment_date: nextDate,
          weekly_salary: Number(salary) || 0,
        })
        .eq("id", employee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee details updated.");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setStatus = useMutation({
    mutationFn: async (status: PaymentStatus) => {
      if (!employee) return;
      const { error } = await supabase
        .from("profiles")
        .update({ payment_status: status })
        .eq("id", employee.id);
      if (error) throw error;

      const existing = payments.find(
        (p) => p.user_id === employee.id && p.payment_date === employee.next_payment_date,
      );
      if (existing) {
        await supabase.from("payments").update({ status }).eq("id", existing.id);
      } else {
        await supabase.from("payments").insert({
          user_id: employee.id,
          payment_date: employee.next_payment_date,
          amount: Number(employee.weekly_salary),
          status,
        });
      }

      await supabase.from("notifications").insert({
        user_id: employee.id,
        title: `Payment status updated: ${STATUS_META[status].label}`,
        message: `Your payment of ${formatMoney(Number(employee.weekly_salary))} scheduled for ${formatDate(
          parseDateOnly(employee.next_payment_date),
        )} is now marked as "${STATUS_META[status].label}". ${STATUS_META[status].description}`,
        type: "payment_processing",
        sender_name: "Super Administrator",
      });
    },
    onSuccess: () => {
      toast.success("Payment status updated and the employee has been notified.");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleSuspend = useMutation({
    mutationFn: async () => {
      if (!employee) return;
      const next = employee.account_status === "active" ? "suspended" : "active";
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: next })
        .eq("id", employee.id);
      if (error) throw error;
      await supabase.from("notifications").insert({
        user_id: employee.id,
        title: next === "suspended" ? "Account suspended" : "Account reactivated",
        message:
          next === "suspended"
            ? "Your employee account has been suspended by the administrator. Payments are paused until your account is reactivated. Please contact the administrator for details."
            : "Your employee account has been reactivated. Weekly payments will resume on your normal schedule.",
        type: "policy",
        sender_name: "Super Administrator",
      });
    },
    onSuccess: () => {
      toast.success("Account status updated.");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const destroy = useMutation({
    mutationFn: async () => {
      if (!employee) return;
      await removeEmployee({ data: { userId: employee.id } });
    },
    onSuccess: () => {
      toast.success("Employee deleted.");
      onOpenChange(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteDocument = useMutation({
    mutationFn: async (doc: { id: string; storage_path: string }) => {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      const { error } = await supabase.from("employee_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function openDocument(path: string, download = false) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600, download ? { download: true } : undefined);
    if (error || !data) {
      toast.error(error?.message ?? "Could not open the document.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  const employeePayments = employee ? payments.filter((p) => p.user_id === employee.id) : [];

  return (
    <Sheet open={Boolean(employee)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {employee ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-left">{employee.full_name}</SheetTitle>
              <SheetDescription className="text-left">
                {employee.email} · registered {formatDate(employee.created_at)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={employee.payment_status} />
                <span
                  className={
                    employee.account_status === "active"
                      ? "rounded-full border border-status-successful/35 bg-status-successful/10 px-2.5 py-1 text-xs font-semibold text-status-successful"
                      : "rounded-full border border-status-failed/35 bg-status-failed/10 px-2.5 py-1 text-xs font-semibold text-status-failed"
                  }
                >
                  {employee.account_status === "active" ? "Active" : "Suspended"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Last login {formatDateTime(employee.last_login_at)}
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="font-display text-sm font-semibold">Submitted profile information</h3>
                <dl className="grid gap-2 rounded-xl border glass-inset p-4 text-sm sm:grid-cols-2">
                  <Row label="Full name" value={employee.full_name || "—"} />
                  <Row label="Email" value={employee.email || "—"} />
                  <Row label="Phone" value={employee.phone || "—"} />
                  <Row label="Job title" value={employee.job_title || "—"} />
                  <Row label="Account status" value={employee.account_status} />
                  <Row label="Payment status" value={STATUS_META[employee.payment_status].label} />
                  <Row label="Weekly salary" value={formatMoney(Number(employee.weekly_salary))} />
                  <Row
                    label="Next payment"
                    value={formatDate(parseDateOnly(employee.next_payment_date))}
                  />
                  <Row label="Registered" value={formatDateTime(employee.created_at)} />
                  <Row label="Last updated" value={formatDateTime(employee.updated_at)} />
                  <Row label="Last login" value={formatDateTime(employee.last_login_at)} />
                  <Row label="Employee ID" value={employee.id} />
                  <Row label="Documents submitted" value={String(documents.length)} />
                  <Row
                    label="Bank details"
                    value={employee.bank ? "Submitted" : "Not submitted"}
                  />
                </dl>
              </section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold">Payment controls</h3>
                <div className="space-y-2">
                  <Label>Payment status</Label>
                  <Select
                    value={employee.payment_status}
                    onValueChange={(value) => setStatus.mutate(value as PaymentStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_META[status].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emp-next-date">Next payment date</Label>
                    <Input
                      id="emp-next-date"
                      type="date"
                      value={nextDate}
                      onChange={(event) => setNextDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-salary">Weekly salary (USD)</Label>
                    <Input
                      id="emp-salary"
                      type="number"
                      min={0}
                      value={salary}
                      onChange={(event) => setSalary(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-name">Full name</Label>
                  <Input
                    id="emp-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <Button onClick={() => saveDetails.mutate()} disabled={saveDetails.isPending}>
                  {saveDetails.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save changes
                </Button>
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-sm font-semibold">Bank details</h3>
                {employee.bank ? (
                  <dl className="grid gap-2 rounded-xl border glass-inset p-4 text-sm sm:grid-cols-2">
                    <Row label="Account name" value={employee.bank.account_name} />
                    <Row label="Bank name" value={employee.bank.bank_name} />
                    <Row label="Account number" value={employee.bank.account_number} />
                    <Row label="Swift code" value={employee.bank.swift_code ?? "—"} />
                    <Row label="Country" value={employee.bank.country} />
                    <Row label="Currency" value={employee.bank.currency} />
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] tracking-wide uppercase text-muted-foreground">
                        Instructions
                      </dt>
                      <dd className="whitespace-pre-wrap">{employee.bank.instructions ?? "—"}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This employee has not submitted bank details yet.
                  </p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-sm font-semibold">Uploaded documents</h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 rounded-xl border glass-inset p-3"
                      >
                        <DocumentThumb doc={doc} />
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => openDocument(doc.storage_path)}
                            className="block max-w-full truncate text-left text-sm font-semibold hover:underline"
                          >
                            {doc.file_name}
                          </button>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDateTime(doc.created_at)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Download document"
                          onClick={() => openDocument(doc.storage_path, true)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete document"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteDocument.mutate(doc)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="font-display text-sm font-semibold">Payment history</h3>
                {employeePayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payment records yet.</p>
                ) : (
                  <ul className="divide-y rounded-xl border">
                    {employeePayments.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                      >
                        <span>{formatDate(parseDateOnly(payment.payment_date))}</span>
                        <span className="tabular-nums">{formatMoney(Number(payment.amount))}</span>
                        <StatusBadge size="sm" status={payment.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="flex flex-wrap gap-2 border-t pt-5">
                <div className="w-full space-y-2 pb-4">
                  <h3 className="font-display text-sm font-semibold">Message history</h3>
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages sent yet.</p>
                  ) : (
                    <ul className="max-h-72 space-y-2 overflow-y-auto rounded-xl border p-2">
                      {messages.map((message) => (
                        <li key={message.id} className="rounded-lg glass-inset p-3">
                          <p className="text-sm font-semibold">{message.title}</p>
                          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                            {message.message}
                          </p>
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            {message.sender_name} · {formatDateTime(message.created_at)} ·{" "}
                            {message.is_read ? "Read" : "Unread"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button variant="outline" onClick={() => toggleSuspend.mutate()}>
                  {employee.account_status === "active" ? "Suspend employee" : "Reactivate employee"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Permanently delete ${employee.full_name}? This removes their login, payments and documents.`,
                      )
                    ) {
                      destroy.mutate();
                    }
                  }}
                  disabled={destroy.isPending}
                >
                  {destroy.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Delete employee
                </Button>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-wide uppercase text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  );
}