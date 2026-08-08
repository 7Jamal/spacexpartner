import logoAsset from "@/assets/spacex-logo.png.asset.json";
import logoLightAsset from "@/assets/spacex-logo-light.png.asset.json";
import { useBackdropContrast } from "@/hooks/useBackdropContrast";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: { height: "clamp(1.85rem, 6.5vw, 2.5rem)" },
  md: { height: "clamp(2.25rem, 8vw, 3.25rem)" },
  lg: { height: "clamp(2.75rem, 11vw, 4.5rem)" },
  xl: { height: "clamp(3.25rem, 14vw, 6rem)" },
} as const;

const wordmarkSize = {
  sm: "text-[0.62rem] sm:text-[0.7rem]",
  md: "text-[0.7rem] sm:text-[0.8rem]",
  lg: "text-xs sm:text-sm",
  xl: "text-sm sm:text-base",
} as const;

const logoFilter = {
  default:
    "drop-shadow(0 1px 3px rgba(15,23,42,0.2)) drop-shadow(0 0 24px rgba(212,168,83,0.35))",
  onDark:
    "drop-shadow(0 1px 4px rgba(0,0,0,0.65)) drop-shadow(0 0 28px rgba(255,255,255,0.55))",
};

const textShadow = {
  default: "0 1px 3px color-mix(in oklab, var(--foreground) 18%, transparent)",
  onDark: "0 1px 4px color-mix(in oklab, #000 55%, transparent), 0 0 22px color-mix(in oklab, #fff 35%, transparent)",
};

export function BrandMark({
  className,
  size = "md",
  showText = true,
  layout = "stacked",
  textClassName,
  tone = "auto",
}: {
  className?: string;
  size?: keyof typeof sizeStyles;
  showText?: boolean;
  layout?: "stacked" | "inline";
  textClassName?: string;
  tone?: "default" | "onDark" | "auto";
}) {
  const { ref, tone: measuredTone, needsScrim } = useBackdropContrast(tone === "auto");
  const resolvedTone = tone === "auto" ? measuredTone : tone;
  const src = resolvedTone === "onDark" ? logoLightAsset.url : logoAsset.url;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        "flex min-w-0 max-w-full",
        layout === "stacked"
          ? "flex-col items-center gap-1.5 text-center"
          : "flex-row items-center gap-3",
        className,
      )}
      data-contrast-tone={resolvedTone}
      data-contrast-scrim={needsScrim ? "on" : "off"}
    >
      <div className="relative flex min-w-0 max-w-full items-center justify-center">
        {needsScrim ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full blur-md"
            style={{
              background:
                resolvedTone === "onDark"
                  ? "radial-gradient(60% 70% at 50% 50%, color-mix(in oklab, #000 42%, transparent), transparent 75%)"
                  : "radial-gradient(60% 70% at 50% 50%, color-mix(in oklab, #fff 62%, transparent), transparent 75%)",
            }}
          />
        ) : null}
        <img
          src={src}
          alt="SpaceX Partnership Portal"
          className="relative block h-auto w-auto max-w-full object-contain"
          style={{ ...sizeStyles[size], filter: logoFilter[resolvedTone] }}
        />
      </div>
      {showText ? (
        <p
          className={cn(
            "relative flex min-w-0 max-w-full items-baseline justify-center gap-[0.12em] font-display font-semibold tracking-[0.16em] uppercase whitespace-nowrap",
            wordmarkSize[size],
            textClassName,
            resolvedTone === "onDark" ? "text-primary-foreground" : "text-foreground",
          )}
          style={{
            textShadow: needsScrim
              ? `${textShadow[resolvedTone]}, ${
                  resolvedTone === "onDark"
                    ? "0 0 10px color-mix(in oklab, #000 75%, transparent)"
                    : "0 0 10px color-mix(in oklab, #fff 85%, transparent)"
                }`
              : textShadow[resolvedTone],
          }}
        >
          <span>Space</span>
          <span
            className="font-[family-name:'Space_Grotesk',var(--font-display)] text-[1.55em] leading-[0.8] font-bold text-accent"
            style={{
              textShadow: `0 0 18px color-mix(in oklab, var(--accent) 55%, transparent)${
                resolvedTone === "onDark"
                  ? ", 0 1px 3px color-mix(in oklab, #000 70%, transparent)"
                  : ", 0 1px 2px color-mix(in oklab, #3b2a06 55%, transparent)"
              }`,
            }}
          >
            X
          </span>
          <span className="ml-[0.25em]">Partnership Portal</span>
        </p>
      ) : null}
    </div>
  );
}


