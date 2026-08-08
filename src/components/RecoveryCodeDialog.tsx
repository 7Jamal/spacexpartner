import { Check, Copy, Download, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";

/** Shows a freshly issued recovery code exactly once, with copy/download helpers. */
export function RecoveryCodeDialog({
  code,
  onClose,
}: {
  code: string | null;
  onClose: () => void;
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("recovery.copied"));
    } catch {
      toast.error(code);
    }
  }

  function download() {
    if (!code) return;
    const blob = new Blob(
      [`SpaceX Partnership Portal\nRecovery code: ${code}\nKeep this safe.\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spacex-partnership-recovery-code.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={Boolean(code)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-accent" />
            {t("recovery.title")}
          </DialogTitle>
          <DialogDescription>{t("recovery.intro")}</DialogDescription>
        </DialogHeader>
        <p className="glass-panel select-all p-4 text-center font-mono text-lg font-semibold tracking-[0.2em] break-all">
          {code}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {t("recovery.copy")}
          </Button>
          <Button type="button" variant="outline" onClick={download}>
            <Download className="size-4" />
            {t("recovery.download")}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{t("recovery.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
