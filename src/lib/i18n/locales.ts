export type LocaleMeta = {
  code: string;
  /** Name written in the language itself. */
  native: string;
  english: string;
  dir: "ltr" | "rtl";
};

export const LOCALES: LocaleMeta[] = [
  { code: "en", native: "English", english: "English", dir: "ltr" },
  { code: "ar", native: "العربية", english: "Arabic", dir: "rtl" },
  { code: "de", native: "Deutsch", english: "German", dir: "ltr" },
  { code: "es", native: "Español", english: "Spanish", dir: "ltr" },
  { code: "fr", native: "Français", english: "French", dir: "ltr" },
  
  { code: "hi", native: "हिन्दी", english: "Hindi", dir: "ltr" },
  { code: "id", native: "Bahasa Indonesia", english: "Indonesian", dir: "ltr" },

  { code: "it", native: "Italiano", english: "Italian", dir: "ltr" },
  { code: "ja", native: "日本語", english: "Japanese", dir: "ltr" },
  { code: "ko", native: "한국어", english: "Korean", dir: "ltr" },
  { code: "nl", native: "Nederlands", english: "Dutch", dir: "ltr" },
  { code: "pt", native: "Português", english: "Portuguese", dir: "ltr" },
  { code: "ru", native: "Русский", english: "Russian", dir: "ltr" },
  { code: "sw", native: "Kiswahili", english: "Swahili", dir: "ltr" },
  { code: "tr", native: "Türkçe", english: "Turkish", dir: "ltr" },

  { code: "zh", native: "中文", english: "Chinese (Simplified)", dir: "ltr" },
];

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);

export function localeMeta(code: string) {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0]!;
}

/** Best match for a browser language tag such as `pt-BR` or `zh-Hans-CN`. */
export function matchLocale(tags: readonly string[]) {
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    const exact = LOCALE_CODES.find((code) => code === lower);
    if (exact) return exact;
    const base = lower.split("-")[0]!;
    const partial = LOCALE_CODES.find((code) => code === base);
    if (partial) return partial;
  }
  return "en";
}