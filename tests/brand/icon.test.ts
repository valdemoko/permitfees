import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The header mark and the favicon are the same drawing in two forms.
 *
 * They cannot share a source: the header mark is a React component that inherits
 * `currentColor` and is inlined into the page, while a favicon has to be a
 * standalone file the browser fetches by convention. Two files describing one
 * logo drift apart silently — the favicon is nobody's daily view, so a change to
 * the mark leaves a stale icon behind that only turns up in someone's bookmarks.
 *
 * This test is the mechanism that stops it: it reads both files, compares the bar
 * geometry and the opacity ramp, and fails on any difference.
 */

const root = process.cwd();
const markSource = readFileSync(join(root, "src", "components", "brand", "mark.tsx"), "utf8");
const iconSource = readFileSync(join(root, "src", "app", "icon.svg"), "utf8");

type Bar = { x: number; y: number; width: number; height: number; opacity: number | null };

/** Reads every `<rect>` and normalises it, so attribute order and spacing do not matter. */
function readBars(source: string): Bar[] {
  return [...source.matchAll(/<rect\b([^>]*?)\/?>/g)]
    .map((match) => {
      const attributes = match[1] ?? "";
      const read = (name: string): number | null => {
        const found = attributes.match(new RegExp(`\\b${name}="([0-9.]+)"`));
        return found ? Number(found[1]) : null;
      };

      const x = read("x");
      const y = read("y");
      const width = read("width");
      const height = read("height");

      // The favicon's plate is a rect with no position; it is not part of the mark.
      if (x === null || y === null || width === null || height === null) return null;

      return { x, y, width, height, opacity: read("opacity") };
    })
    .filter((bar): bar is Bar => bar !== null)
    .sort((a, b) => a.x - b.x || a.y - b.y);
}

describe("the brand mark", () => {
  it("is the same drawing in the header and in the favicon", () => {
    expect(readBars(iconSource)).toEqual(readBars(markSource));
  });

  it("draws four rising brackets on one baseline", () => {
    const bars = readBars(markSource);

    // Four brackets plus one baseline rule, and the tallest bracket is the one
    // that carries full opacity — the last step in a marginal schedule.
    expect(bars).toHaveLength(5);
    expect(bars.filter((bar) => bar.height === 1)).toHaveLength(1);

    const brackets = bars.filter((bar) => bar.height > 1).sort((a, b) => a.x - b.x);
    expect(brackets).toHaveLength(4);
    expect(brackets.at(-1)?.opacity).toBeNull();
    expect(brackets.slice(0, 3).map((bar) => bar.opacity)).toEqual([0.26, 0.46, 0.7]);
  });

  it("keeps every bar inside the viewBox, in both files", () => {
    for (const [name, source, viewBox] of [
      ["mark", markSource, 24],
      ["icon", iconSource, 32],
    ] as const) {
      for (const bar of readBars(source)) {
        // The icon wraps the mark in `translate(4 4)`, which is why the bound is
        // generous: geometry is shared, the offset is the icon's own business.
        expect(bar.x + bar.width, `${name} bar overflows horizontally`).toBeLessThanOrEqual(
          viewBox - 2,
        );
        expect(bar.y + bar.height, `${name} bar overflows vertically`).toBeLessThanOrEqual(
          viewBox - 2,
        );
      }
    }
  });

  it("keeps the favicon fetchable as a standalone file", () => {
    expect(iconSource).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(iconSource).toContain('viewBox="0 0 32 32"');
    // A square plate is what keeps the bars visible at 16px on a light tab bar.
    expect(iconSource).toContain("<rect width=\"32\" height=\"32\"");
  });
});
