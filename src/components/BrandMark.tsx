import logoAsset from "@/assets/spacex-logo.png.asset.json";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-7 sm:h-8",
  md: "h-8 sm:h-10",
  lg: "h-10 sm:h-12",
  xl: "h-12 sm:h-16",
};

export function BrandMark({
  className,
  size = "md",
  showText = false,
  tone = "default",
}: {
  className?: string;
  size?: keyof typeof sizeClasses;
  showText?: boolean;
  tone?: "default" | "onDark";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
          tone === "onDark"
            ? "bg-primary-foreground/95 p-1.5 shadow-sm"
            : "bg-background/50 p-1",
        )}
      >
        <img
          src={logoAsset.url}
          alt="SpaceX Partnership Portal"
          className={cn("w-auto object-contain", sizeClasses[size])}
        />
      </div>
      {showText ? (
        <div className="leading-tight">
          <p
            className={cn(
              "font-display text-sm font-semibold tracking-wide uppercase",
              tone === "onDark" ? "text-primary-foreground" : "text-foreground",
            )}
          >
            SpaceX Partnership
          </p>
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
            Portal
          </p>
        </div>
      ) : null}
    </div>
  );
}
