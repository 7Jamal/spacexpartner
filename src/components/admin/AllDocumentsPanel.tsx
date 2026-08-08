import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { BUCKET, DocumentThumb, formatBytes } from "@/components/employee/DocumentsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllDocuments, type EmployeeRecord } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/payroll";

export function AllDocumentsPanel({ employees }: { employees: EmployeeRecord[] }) {
  const queryClient = useQueryClient();
  const { data: documents = [], isLoading } = useAllDocuments();
  const [query, setQuery] = useState("");

  const owners = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter((doc) => {
      const owner = owners.get(doc.user_id);
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

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-accent" />
          <h2 className="font-display text-base font-semibold">All uploaded documents</h2>
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {documents.length}
          </span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file, employee or email"
            className="pl-9"
          />
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {isLoading ? (
          <li className="text-sm text-muted-foreground">Loading documents…</li>
        ) : filtered.length === 0 ? (
          <li className="text-sm text-muted-foreground">No documents found.</li>
        ) : (
          filtered.map((doc) => {
            const owner = owners.get(doc.user_id);
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border glass-inset p-3"
              >
                <DocumentThumb doc={doc} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{doc.file_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {owner?.full_name ?? "Unknown employee"}
                    {owner?.email ? ` · ${owner.email}` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(Number(doc.file_size))} · {formatDateTime(doc.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(doc.storage_path)}
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openDocument(doc.storage_path, true)}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
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
