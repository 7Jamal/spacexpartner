import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, FileText, ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { EmployeeDocument } from "@/hooks/useProfile";
import { useDocuments } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { formatDateTime } from "@/lib/payroll";
import { cn } from "@/lib/utils";

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
export const MAX_SIZE = 20 * 1024 * 1024;
export const BUCKET = "employee-documents";

type Side = "front" | "back";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sideOf(doc: EmployeeDocument): Side | null {
  const name = doc.file_name.toLowerCase();
  if (name.startsWith("front-")) return "front";
  if (name.startsWith("back-")) return "back";
  return null;
}

export function DocumentsCard({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const t = useT();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [activeSide, setActiveSide] = useState<Side | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const { data: documents = [] } = useDocuments(userId);
  const frontDoc = documents.find((doc) => sideOf(doc) === "front");
  const backDoc = documents.find((doc) => sideOf(doc) === "back");

  const upload = useMutation({
    mutationFn: async ({ file, side }: { file: File; side: Side }) => {
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
        const ext = file.name.split(".").pop()?.replace(/[^A-Za-z0-9]/g, "") || "jpg";
        const fileName = `${side}-card-${Date.now()}.${ext}`;
        const path = `${userId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("employee_documents").insert({
          user_id: userId,
          file_name: fileName,
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
      window.setTimeout(() => {
        setProgress(null);
        setActiveSide(null);
      }, 600);
    },
    onError: (error: Error) => {
      setProgress(null);
      setActiveSide(null);
      toast.error(error.message);
    },
  });

  const pick = (side: Side) => {
    setActiveSide(side);
    (side === "front" ? frontInputRef : backInputRef).current?.click();
  };

  const renderSlot = (side: Side, doc: EmployeeDocument | undefined) => {
    const isActive = activeSide === side && upload.isPending;
    return (
      <div
        className={cn(
          "glass-inset flex flex-col items-center gap-3 rounded-xl border p-5 text-center",
          doc ? "border-status-successful/40" : "border-dashed border-border",
        )}
      >
        {doc ? (
          <>
            <DocumentThumb doc={doc} large />
            <p className="flex items-center gap-1.5 text-sm font-semibold text-status-successful">
              <Check className="size-4" />
              {side === "front" ? t("docs.frontDone") : t("docs.backDone")}
            </p>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-full border border-accent/40 bg-accent/10">
              <Camera className="size-5 text-accent" />
            </span>
            <p className="text-sm font-semibold">
              {side === "front" ? t("docs.frontTitle") : t("docs.backTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {side === "front" ? t("docs.frontHint") : t("docs.backHint")}
            </p>
          </>
        )}
        <Button
          type="button"
          variant={doc ? "outline" : "default"}
          size="sm"
          onClick={() => pick(side)}
          disabled={upload.isPending}
        >
          {isActive ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {doc
            ? t("docs.replace")
            : side === "front"
              ? t("docs.uploadFront")
              : t("docs.uploadBack")}
        </Button>
        {isActive && progress !== null ? (
          <div className="w-full">
            <Progress value={progress} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t("docs.uploading", { percent: progress })}
            </p>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section className="glass-panel p-6">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">{t("docs.title")}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t("docs.subtitle")}</p>

      <input
        ref={frontInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate({ file, side: "front" });
          event.target.value = "";
        }}
      />
      <input
        ref={backInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload.mutate({ file, side: "back" });
          event.target.value = "";
        }}
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {renderSlot("front", frontDoc)}
        {renderSlot("back", backDoc)}
      </div>

      {documents.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 rounded-xl border glass-inset p-3">
              <DocumentThumb doc={doc} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.file_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(Number(doc.file_size))} · {formatDateTime(doc.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function DocumentThumb({ doc, large }: { doc: EmployeeDocument; large?: boolean }) {
  const t = useT();
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

  const sizeClass = large ? "h-24 w-36" : "size-12";

  if (isImage && url) {
    return (
      <img
        src={url}
        alt={t("docs.previewAlt", { name: doc.file_name })}
        className={cn(sizeClass, "shrink-0 rounded-lg border object-cover")}
      />
    );
  }

  return (
    <div className={cn(sizeClass, "grid shrink-0 place-items-center glass-inset")}>
      <FileText className="size-5 text-muted-foreground" />
    </div>
  );
}
