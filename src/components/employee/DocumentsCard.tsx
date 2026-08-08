import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { EmployeeDocument } from "@/hooks/useProfile";
import { useDocuments } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { getActiveLocale } from "@/lib/i18n/active";
import { useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";
import { cn } from "@/lib/utils";

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
export const MAX_SIZE = 20 * 1024 * 1024;
export const BUCKET = "employee-documents";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsCard({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const { data: documents = [] } = useDocuments(userId);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error(t("docs.errorType"));
      }
      if (file.size > MAX_SIZE) throw new Error(t("docs.errorSize"));

      setProgress(12);
      const timer = window.setInterval(
        () => setProgress((prev) => (prev !== null && prev < 88 ? prev + 8 : prev)),
        160,
      );

      try {
        const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
        const path = `${userId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("employee_documents").insert({
          user_id: userId,
          file_name: file.name,
          storage_path: path,
          mime_type: file.type,
          file_size: file.size,
        });
        if (insertError) throw insertError;
        setProgress(100);
      } finally {
        window.clearInterval(timer);
      }
    },
    onSuccess: () => {
      toast.success(t("docs.uploaded"));
      queryClient.invalidateQueries({ queryKey: ["documents", userId] });
      window.setTimeout(() => setProgress(null), 600);
    },
    onError: (error: Error) => {
      setProgress(null);
      toast.error(error.message);
    },
  });

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("docs.title")}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("docs.subtitle")}
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) upload.mutate(file);
        }}
        className={cn(
          "mt-5 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragging ? "border-accent bg-accent/5" : "border-border glass-inset",
        )}
      >
        <UploadCloud className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">{t("docs.dragDrop")}</p>
        <p className="text-xs text-muted-foreground">{t("docs.chooseFile")}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload.mutate(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("docs.upload")}
        </Button>
        {progress !== null ? (
          <div className="mt-4">
            <Progress value={progress} />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("docs.uploading", { percent: progress })}
            </p>
          </div>
        ) : null}
      </div>

      <ul className="mt-5 space-y-3">
        {documents.length === 0 ? (
          <li className="text-sm text-muted-foreground">{t("docs.empty")}</li>
        ) : (
          documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-xl border glass-inset p-3">
              <DocumentThumb doc={doc} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.file_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(Number(doc.file_size))} · {formatDateTime(doc.created_at)}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function DocumentThumb({ doc }: { doc: EmployeeDocument }) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = doc.mime_type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return;
    let active = true;
    supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storage_path, 3600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [doc.storage_path, isImage]);

  if (isImage && url) {
    return (
      <img
        src={url}
        alt={`${getActiveLocale() === "en" ? "Preview of" : ""} ${doc.file_name}`.trim()}
        className="size-12 shrink-0 rounded-lg border object-cover"
      />
    );
  }

  return (
    <div className="grid size-12 shrink-0 place-items-center glass-inset">
      <FileText className="size-5 text-muted-foreground" />
    </div>
  );
}
