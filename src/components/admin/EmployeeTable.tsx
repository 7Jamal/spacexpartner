import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import type { EmployeeRecord } from "@/hooks/useAdmin";
import { useT } from "@/lib/i18n";
import { formatDate, formatMoney, parseDateOnly } from "@/lib/payroll";

export function EmployeeTable({
  employees,
  onSelect,
}: {
  employees: EmployeeRecord[];
  onSelect: (employee: EmployeeRecord) => void;
}) {
  const t = useT();
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
          <h2 className="font-display text-base font-semibold">{t("table.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("table.subtitle")}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("table.searchPlaceholder")}
            className="pl-9"
            aria-label={t("table.searchLabel")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground">{t("table.noMatch")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="glass-inset text-left text-[11px] tracking-wide uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">{t("table.partner")}</th>
                <th className="px-5 py-3 font-semibold">{t("table.weeklySalary")}</th>
                <th className="px-5 py-3 font-semibold">{t("auth.country")}</th>
                <th className="px-5 py-3 font-semibold">{t("table.status")}</th>
                <th className="px-5 py-3 font-semibold">{t("table.account")}</th>
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
                    {employee.country || "—"}
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
                      {employee.account_status === "active"
                        ? t("common.active")
                        : t("common.suspended")}
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