import { supabase } from "@/integrations/supabase/client";

const BUCKET = "employee-documents";

/**
 * Opens or downloads a stored document. Phones block pop-ups opened after an
 * await, so the tab is opened synchronously and downloads use a blob link.
 */
export async function openStoredDocument(path: string, fileName: string, download = false) {
  if (download) {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) throw error ?? new Error("Download failed");
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return;
  }
  const tab = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data) {
    tab?.close();
    throw error ?? new Error("Could not open document");
  }
  if (tab) tab.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}
