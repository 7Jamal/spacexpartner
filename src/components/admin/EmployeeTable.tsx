import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import type { EmployeeRecord } from "@/hooks/useAdmin";
import { formatDate, formatMoney, parseDateOnly } from "@/lib/payroll";

export function EmployeeTable({
  employees,
  onSelect,
}: {
  employees: EmployeeRecord[];
  onSelect: (employee: EmployeeRecord) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((employee) =>
      [employee.full_name, employee.email, employee.job_title ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [employees, query]);

  return (
    <section className="glass-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="font-display text-base font-semibold">Employees</h2>
          <p className="text-xs text-muted-foreground">
            Select an employee to manage payments, bank details and documents.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name or email"
            className="pl-9"
            aria-label="Search employees"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">No employees match your search.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="glass-inset text-left text-[11px] tracking-wide uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Weekly salary</th>
                <th className="px-5 py-3 font-semibold">Next payment</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => onSelect(employee)}
                  className="cursor-pointer transition hover:glass-inset"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold">{employee.full_name}</p>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                  </td>
                  <td className="px-5 py-4 tabular-nums">
                    {formatMoney(Number(employee.weekly_salary))}
                  </td>
                  <td className="px-5 py-4">
                    {formatDate(parseDateOnly(employee.next_payment_date))}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge size="sm" status={employee.payment_status} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        employee.account_status === "active"
                          ? "text-xs font-semibold text-status-successful"
                          : "text-xs font-semibold text-status-failed"
                      }
                    >
                      {employee.account_status === "active" ? "Active" : "Suspended"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}