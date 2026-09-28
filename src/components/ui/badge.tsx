import type { ReactNode } from "react";

/**
 * Badge.
 *
 * Short status facts: verification state, jurisdiction type, source kind.
 * Square-cornered and uppercase, so it reads as a data label rather than a
 * marketing pill.
 *
 * `tone="signal"` is the vermilion family, which the palette reserves for "this
 * is an estimate". Using a tinted badge for the estimate state is a deliberate
 * downgrade from the previous amber alert: the full callout is for the figure the
 * reader came for, and repeating that weight on every row would flatten it.
 */

export type BadgeTone = "neutral" | "accent" | "verified" | "signal" | "danger" | "caution";

const TONES: Record<BadgeTone, string> = {
  neutral: "",
  accent: "badge--accent",
  verified: "badge--verified",
  signal: "badge--signal",
  /** Kept as an alias so callers written against the old name keep working. */
  caution: "badge--signal",
  danger: "badge--danger",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  /** Prefixes a dot in the badge's own colour, so state survives monochrome. */
  dot?: boolean;
}) {
  return (
    <span className={["badge", TONES[tone], dot ? "badge--dot" : ""].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
