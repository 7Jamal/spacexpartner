import logoAsset from "@/assets/spacex-logo.png.asset.json";
import logoLightAsset from "@/assets/spacex-logo-light.png.asset.json";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 sm:h-9",
  md: "h-9 sm:h-11",
  lg: "h-11 sm:h-14",
  xl: "h-14 sm:h-20",
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
  const src = tone === "onDark" ? logoLightAsset.url : logoAsset.url;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden",
          tone === "onDark" && "drop-shadow-[0_0_12px_rgba(255,255,255,0.12)]",
        )}
      >
        <img
          src={src}
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
