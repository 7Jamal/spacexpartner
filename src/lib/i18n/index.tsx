import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { en, type MessageKey } from "./en";
import { LOCALES, localeMeta, matchLocale } from "./locales";

export { LOCALES, localeMeta } from "./locales";
export type { MessageKey } from "./en";

const STORAGE_KEY = "spacex-portal-locale";

/** Locale used by the standalone formatters in `@/lib/payroll`. */
let activeLocale = "en";
export const getActiveLocale = () => activeLocale;

type Vars = Record<string, string | number>;

export type Translate = (key: MessageKey, vars?: Vars) => string;

type I18nValue = {
  locale: string;
  dir: "ltr" | "rtl";
  setLocale: (code: string) => void;
  t: Translate;
  ready: boolean;
};

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

const catalogs: Record<string, Record<string, string>> = { en: en as Record<string, string> };

async function loadCatalog(code: string) {
  if (catalogs[code]) return catalogs[code];
  const modules = import.meta.glob<{ default: Record<string, string> }>(
    "./messages/*.json",
  );
  const loader = modules[`./messages/${code}.json`];
  if (!loader) return null;
  const module = await loader();
  catalogs[code] = module.default;
  return module.default;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("en");
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  const apply = useCallback((code: string) => {
    activeLocale = code;
    setLocaleState(code);
    if (typeof document !== "undefined") {
      const meta = localeMeta(code);
      document.documentElement.lang = code;
      document.documentElement.dir = meta.dir;
    }
  }, []);

  const activate = useCallback(
    async (code: string) => {
      await loadCatalog(code);
      apply(code);
      setVersion((value) => value + 1);
      setReady(true);
    },
    [apply],
  );

  // Instinctive default: remembered choice, otherwise the browser's own languages.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const detected =
      stored && LOCALES.some((item) => item.code === stored)
        ? stored
        : matchLocale(navigator.languages ?? [navigator.language]);
    void activate(detected);
  }, [activate]);

  const setLocale = useCallback(
    (code: string) => {
      window.localStorage.setItem(STORAGE_KEY, code);
      void activate(code);
    },
    [activate],
  );

  const t = useCallback<Translate>(
    (key, vars) => {
      const catalog = catalogs[locale];
      const template = catalog?.[key] ?? (en as Record<string, string>)[key] ?? key;
      return interpolate(template, vars);
    },
    // `version` forces consumers to re-render once a catalog finishes loading.
    [locale, version],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, dir: localeMeta(locale).dir, setLocale, t, ready }),
    [locale, setLocale, t, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>");
  return context;
}

export function useT() {
  return useI18n().t;
}