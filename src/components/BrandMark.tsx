import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  showText = true,
  tone = "default",
}: {
  className?: string;
  showText?: boolean;
  tone?: "default" | "onDark";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-soft">
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-accent/30" />
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" className="text-accent" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="text-accent/70"
            transform="rotate(-24 12 12)"
          />
        </svg>
      </div>
      {showText ? (
        <div className="leading-tight">
          <p
            className={cn(
              "font-display text-sm font-semibold tracking-wide uppercase",
              tone === "onDark" ? "text-primary-foreground" : "text-foreground",
            )}
          >
            <span>Space</span>
            <span
              className="relative inline-block translate-y-[-0.5px] text-base font-bold text-accent"
              style={{ fontFamily: "var(--font-brand-x)" }}
            >
              X
            </span>
            <span> Partnership</span>
          </p>
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground">
            Portal
          </p>
        </div>
      ) : null}
    </div>
  );
}