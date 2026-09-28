/**
 * The brand mark.
 *
 * A staircase of bars on a baseline: a marginal fee schedule, which is the
 * mechanism every permit fee in this product is built from — each bracket adds a
 * step, and the last step is the one that applies.
 *
 * It is drawn rather than imported, so it costs no request, inherits
 * `currentColor` (which means it works on paper, in ink and on a dark band), and
 * stays legible at 16px. The opacity ramp implies "a range of brackets" without
 * adding a second colour, which the palette reserves for state meaning.
 *
 * Decorative wherever it appears next to the wordmark, hence `aria-hidden`.
 */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="15" width="4" height="6" fill="currentColor" opacity="0.26" />
      <rect x="8" y="11" width="4" height="10" fill="currentColor" opacity="0.46" />
      <rect x="14" y="7" width="4" height="14" fill="currentColor" opacity="0.7" />
      <rect x="20" y="3" width="2" height="18" fill="currentColor" />
      <rect x="2" y="21" width="20" height="1" fill="currentColor" opacity="0.32" />
    </svg>
  );
}
