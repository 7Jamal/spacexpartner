import { useCallback, useEffect, useRef, useState } from "react";

type Rgb = { r: number; g: number; b: number };

function parseColor(value: string): { rgb: Rgb; a: number } | null {
  if (!value) return null;
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
  return { rgb: { r: parts[0], g: parts[1], b: parts[2] }, a: parts[3] ?? 1 };
}

function blend(fg: Rgb, fgA: number, bg: Rgb): Rgb {
  return {
    r: fg.r * fgA + bg.r * (1 - fgA),
    g: fg.g * fgA + bg.g * (1 - fgA),
    b: fg.b * fgA + bg.b * (1 - fgA),
  };
}

function luminance({ r, g, b }: Rgb) {
  const chan = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrastRatio(a: number, b: number) {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export type BackdropContrast = {
  /** Resolved tone: light content on a dark backdrop, or dark content on a light backdrop. */
  tone: "default" | "onDark";
  /** Contrast ratio between the resolved wordmark color and the sampled backdrop. */
  ratio: number;
  /** True when the backdrop is translucent/gradient/glass or contrast is below WCAG AA. */
  needsScrim: boolean;
};

/**
 * Samples the effective backdrop behind an element (walking translucent glass layers and
 * gradients up the ancestor chain) and reports whether extra treatment is needed to keep
 * the logo and wordmark readable.
 */
export function useBackdropContrast(enabled = true) {
  const ref = useRef<HTMLElement | null>(null);
  const [result, setResult] = useState<BackdropContrast>({
    tone: "default",
    ratio: 21,
    needsScrim: false,
  });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    let node: HTMLElement | null = el;
    let accum: { rgb: Rgb; a: number } | null = null;
    let ambiguous = false;

    while (node) {
      const cs = window.getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== "none") ambiguous = true;
      if (cs.backdropFilter && cs.backdropFilter !== "none") ambiguous = true;
      const parsed = parseColor(cs.backgroundColor);
      if (parsed && parsed.a > 0.01) {
        accum = accum
          ? { rgb: blend(accum.rgb, accum.a, parsed.rgb), a: Math.min(1, accum.a + parsed.a) }
          : parsed;
        if (parsed.a > 0.985 && accum.a > 0.985) break;
        if (parsed.a < 0.985) ambiguous = true;
      }
      node = node.parentElement;
    }

    const pageBg =
      parseColor(window.getComputedStyle(document.documentElement).backgroundColor)?.rgb ??
      { r: 255, g: 255, b: 255 };
    const backdrop = accum ? blend(accum.rgb, accum.a, pageBg) : pageBg;
    const bgLum = luminance(backdrop);
    const tone: BackdropContrast["tone"] = bgLum < 0.42 ? "onDark" : "default";
    const textLum = tone === "onDark" ? 1 : luminance({ r: 15, g: 23, b: 42 });
    const ratio = contrastRatio(textLum, bgLum);

    setResult((prev) => {
      const next = { tone, ratio, needsScrim: ambiguous || ratio < 4.5 };
      return prev.tone === next.tone &&
        prev.needsScrim === next.needsScrim &&
        Math.abs(prev.ratio - next.ratio) < 0.05
        ? prev
        : next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    measure();

    const raf = window.requestAnimationFrame(measure);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const mo = new MutationObserver(() => measure());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      mo.disconnect();
    };
  }, [enabled, measure]);

  return { ref, ...result };
}