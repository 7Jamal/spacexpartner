import logoAsset from "@/assets/spacex-logo.png.asset.json";
import logoLightAsset from "@/assets/spacex-logo-light.png.asset.json";
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
    "drop-shadow(0 1px 3px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(255,255,255,0.45))",
};

export function BrandMark({
  className,
  size = "md",
  showText = true,
  layout = "stacked",
  tone = "default",
}: {
  className?: string;
  size?: keyof typeof sizeStyles;
  showText?: boolean;
  layout?: "stacked" | "inline";
  tone?: "default" | "onDark";
}) {
  const src = tone === "onDark" ? logoLightAsset.url : logoAsset.url;

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full",
        layout === "stacked"
          ? "flex-col items-center gap-1.5 text-center"
          : "flex-row items-center gap-3",
        className,
      )}
    >
      <div className="relative flex min-w-0 max-w-full items-center justify-center">
        <img
          src={src}
          alt="SpaceX Partnership Portal"
          className="block h-auto w-auto max-w-full object-contain"
          style={{ ...sizeStyles[size], filter: logoFilter[tone] }}
        />
      </div>
      {showText ? (
        <p
          className={cn(
            "flex min-w-0 max-w-full items-baseline justify-center gap-[0.12em] font-display font-semibold tracking-[0.16em] uppercase whitespace-nowrap",
            wordmarkSize[size],
            tone === "onDark" ? "text-primary-foreground" : "text-foreground",
          )}
        >
          <span>Space</span>
          <span
            className="font-[family-name:'Space_Grotesk',var(--font-display)] text-[1.55em] leading-[0.8] font-bold text-accent"
            style={{ textShadow: "0 0 18px color-mix(in oklab, var(--accent) 45%, transparent)" }}
          >
            X
          </span>
          <span className="ml-[0.25em]">Partnership Portal</span>
        </p>
      ) : null}
    </div>
  );
}


