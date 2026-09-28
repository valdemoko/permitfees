import type { ReactNode } from "react";

/**
 * Callout.
 *
 * Carries the product's semantic states. `estimate` is the most important one: it
 * marks every calculated figure, so a reader can never mistake an estimate for a
 * fee the permit office will actually charge.
 *
 * No icons and no emoji: a small uppercase label plus a left rule is unambiguous,
 * survives greyscale, and matches the register of the documents behind it.
 *
 * `figure` is the slot for a calculated amount, set in display type. A number the
 * reader came for deserves more than the same body size as the caveat under it.
 */

export type CalloutVariant = "note" | "estimate" | "warning" | "verified" | "info";

const VARIANTS: Record<CalloutVariant, string> = {
  note: "",
  info: "callout--info",
  estimate: "callout--estimate",
  warning: "callout--warning",
  verified: "callout--verified",
};

const DEFAULT_LABELS: Record<CalloutVariant, string> = {
  note: "Note",
  info: "How this works",
  estimate: "Estimate",
  warning: "Check this",
  verified: "Verified",
};

export function Callout({
  variant = "note",
  title,
  children,
  label,
  figure,
}: {
  variant?: CalloutVariant;
  /** Overrides the default variant label, e.g. "Estimate, not an official fee". */
  label?: string;
  title?: string;
  /** A calculated amount, emphasised. Rendered above the body. */
  figure?: string;
  children: ReactNode;
}) {
  return (
    <div className={["callout", VARIANTS[variant]].filter(Boolean).join(" ")}>
      <p className="callout__label">{label ?? DEFAULT_LABELS[variant]}</p>
      {title ? <p className="callout__title">{title}</p> : null}
      {figure ? <span className="callout__figure tnum">{figure}</span> : null}
      <div className="callout__body">{children}</div>
    </div>
  );
}
