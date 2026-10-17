import { openStoredDocument } from "@/lib/open-document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BUCKET, DocumentThumb, formatBytes } from "@/components/employee/DocumentsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllDocuments, type EmployeeRecord } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";

export function AllDocumentsPanel({ employees }: { employees: EmployeeRecord[] }) {
  const queryClient = useQueryClient();
  const t = useT();
  const { data: documents = [], isLoading, error } = useAllDocuments();
  const [query, setQuery] = useState("");

  const owners = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) => {
      const owner = doc.owner ?? owners.get(doc.user_id);
      return (
        doc.file_name.toLowerCase().includes(term) ||
        (owner?.full_name ?? "").toLowerCase().includes(term) ||
        (owner?.email ?? "").toLowerCase().includes(term)
      );
    });
  }, [documents, owners, query]);

  const remove = useMutation({
    mutationFn: async (doc: { id: string; storage_path: string }) => {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      const { error } = await supabase.from("employee_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("allDocs.deleted"));
      queryClient.invalidateQueries({ queryKey: ["admin", "documents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function openDocument(path: string, download = false, fileName = "document") {
    try {
      await openStoredDocument(path, fileName, download);
    } catch (error) {
      toast.error((error as Error)?.message ?? t("allDocs.openError"));
    }
  }

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-accent" />
          <h2 className="font-display text-base font-semibold">{t("allDocs.title")}</h2>
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {documents.length}
          </span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("allDocs.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {error ? (
          <li role="alert" className="text-sm text-destructive">{error.message}</li>
        ) : isLoading ? (
          <li className="text-sm text-muted-foreground">{t("allDocs.loading")}</li>
        ) : filtered.length === 0 ? (
          <li className="text-sm text-muted-foreground">{t("allDocs.empty")}</li>
        ) : (
          filtered.map((doc) => {
            const owner = doc.owner ?? owners.get(doc.user_id);
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border glass-inset p-3"
              >
                <DocumentThumb doc={doc} />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold">
                    {owner?.full_name || owner?.email || t("allDocs.unknownPartner")}
                  </p>
                  {owner?.email ? <p className="break-all text-xs text-muted-foreground">{owner.email}</p> : null}
                  {!owner ? <p className="break-all text-xs text-muted-foreground">{doc.user_id}</p> : null}
                  <p className="mt-1 break-all text-xs">{doc.file_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(Number(doc.file_size))} · {formatDateTime(doc.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(doc.storage_path, false, doc.file_name)}
                  >
                    <Eye className="size-4" />
                    {t("common.view")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label={t("common.download")}
                    title={t("common.download")}
                    onClick={() => openDocument(doc.storage_path, true, doc.file_name)}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    aria-label={t("common.delete")}
                    title={t("common.delete")}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate({ id: doc.id, storage_path: doc.storage_path })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
