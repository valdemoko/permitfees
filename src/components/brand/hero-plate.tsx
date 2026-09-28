import type { CSSProperties } from "react";

/**
 * The hero plate.
 *
 * A plotting sheet: engineering-paper rules, and drawn across them the same motif
 * as the brand mark — a marginal fee schedule, the mechanism every permit fee in
 * this product is built from. Each bracket is a step up, and the highest step is
 * the one that applies.
 *
 * Why this and not a gradient: the product is a measured thing, and a graph with
 * an ascending trace communicates that on sight. It is also specific to this
 * product — the same graphic would make no sense on another site, which is the
 * difference between an identity and a template.
 *
 * Four properties that keep it honest:
 *
 *   1. **Decorative.** `aria-hidden`, absolutely positioned, and it carries no
 *      content. It cannot shift layout, and it is not in the accessibility tree.
 *   2. **No new colour.** The rules and the trace are drawn in the existing
 *      hairline and accent inks at low opacity. It adds no hue to the palette.
 *   3. **Entrance, then ambient.** The trace draws itself once, and the nodes arrive
 *      in sequence with it. After that the plate keeps two slow ambient motions: the
 *      sheet drifts 14px over 46 seconds, and one short bright dash travels the
 *      whole path every 9 seconds. The travelling dash is the product's own idea
 *      animated — a schedule being read from the first bracket to the last — which
 *      is why it is the one loop the design system allows. See DESIGN.md §8.
 *   4. **Reduced motion removes both.** The drift and the scan live inside
 *      `prefers-reduced-motion: no-preference`, and the scan is hidden rather than
 *      frozen under `reduce`, because a stopped dash reads as a stray dot.
 *
 * The step geometry is fixed rather than random, so the plate is identical on every
 * render and on every page. `--trace-length` is the exact path length (640
 * horizontal + 232 vertical), which is what makes the draw finish on time instead
 * of finishing early and then coasting.
 */

const STEPS: Array<[number, number]> = [
  [96, 250],
  [96, 214],
  [192, 214],
  [192, 176],
  [288, 176],
  [288, 128],
  [384, 128],
  [384, 84],
  [480, 84],
  [480, 46],
  [576, 46],
  [576, 18],
  [640, 18],
];

const TRACE_LENGTH = 872;

const TRACE_PATH = `M0 250 ${STEPS.map(([x, y]) => `L${x} ${y}`).join(" ")}`;

/** The top of each riser, which is where a marginal rate actually changes. */
const NODES: Array<[number, number]> = [
  [96, 214],
  [192, 176],
  [288, 128],
  [384, 84],
  [480, 46],
  [576, 18],
];

/** The last node is the highest bracket: the one that applies to the largest job. */
const PEAK_NODE_INDEX = NODES.length - 1;

export function HeroPlate() {
  return (
    <div className="hero__plate" aria-hidden="true">
      <svg
        className="hero__trace"
        viewBox="0 0 640 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <line className="hero__trace-base" x1="0" y1="250" x2="640" y2="250" />
        <path
          className="hero__trace-line"
          d={TRACE_PATH}
          style={{ "--trace-length": TRACE_LENGTH } as CSSProperties}
        />
        {/* The same geometry, drawn as the travelling dash. See `.hero__trace-scan`. */}
        <path
          className="hero__trace-scan"
          d={TRACE_PATH}
          style={{ "--trace-length": TRACE_LENGTH } as CSSProperties}
        />
        {NODES.map(([x, y], index) => {
          const isPeak = index === PEAK_NODE_INDEX;
          return (
            <circle
              className={isPeak ? "hero__trace-node hero__trace-node--peak" : "hero__trace-node"}
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="3.25"
              /*
                 The peak node gets its delay from its own rule, because it carries a
                 second, infinite animation and a single inline `animation-delay`
                 would apply to both of them.
              */
              style={isPeak ? undefined : { animationDelay: `${560 + index * 90}ms` }}
            />
          );
        })}
      </svg>
    </div>
  );
}
