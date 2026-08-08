import logoAsset from "@/assets/spacex-logo.png.asset.json";
import logoLightAsset from "@/assets/spacex-logo-light.png.asset.json";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-10 sm:h-12",
  md: "h-12 sm:h-14",
  lg: "h-14 sm:h-18",
  xl: "h-18 sm:h-24",
};

const logoFilter = {
  default:
    "drop-shadow(0 1px 2px rgba(15,23,42,0.18)) drop-shadow(0 0 18px rgba(212,168,83,0.22))",
  onDark:
    "drop-shadow(0 1px 2px rgba(0,0,0,0.35)) drop-shadow(0 0 16px rgba(255,255,255,0.25))",
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
      <div className="relative flex shrink-0 items-center justify-center overflow-hidden">
        <img
          src={src}
          alt="SpaceX Partnership Portal"
          className={cn("w-auto object-contain", sizeClasses[size])}
          style={{ filter: logoFilter[tone] }}
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


