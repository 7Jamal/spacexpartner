import { Check, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, localeMeta, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const current = localeMeta(locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("lang.select")}
          className={cn("liquid-press gap-1.5 px-2", className)}
        >
          <Languages className="size-4" />
          <span className="text-xs font-semibold uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] w-56 overflow-y-auto">
        <DropdownMenuLabel>{t("lang.select")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onSelect={() => setLocale(item.code)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex flex-col">
              <span className="text-sm font-medium">{item.native}</span>
              <span className="text-[11px] text-muted-foreground">{item.english}</span>
            </span>
            {item.code === locale ? <Check className="size-4 text-accent" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}