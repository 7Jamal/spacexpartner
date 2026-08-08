import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useI18n, localeMeta } from "@/lib/i18n";
import { translateContent } from "@/lib/translate.functions";

/**
 * Translates administrator-written free text (announcements, notification
 * bodies) into the reader's language. Falls back to the original text.
 */
export function useTranslatedTexts(texts: string[], enabled = true) {
  const { locale } = useI18n();
  const translate = useServerFn(translateContent);
  const payload = texts.map((text) => text ?? "");
  const active = enabled && locale !== "en" && payload.some((text) => text.trim().length > 0);

  const query = useQuery({
    queryKey: ["translate", locale, payload],
    enabled: active,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    queryFn: async () => {
      const result = await translate({
        data: { texts: payload, target: locale, targetName: localeMeta(locale).english },
      });
      return result.texts;
    },
  });

  return {
    texts: query.data && query.data.length === payload.length ? query.data : payload,
    isTranslating: active && query.isPending,
    isTranslated: Boolean(active && query.data),
  };
}