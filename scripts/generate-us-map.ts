import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Generates the state map geometry.
 *
 * Why a generator rather than a map library: the alternative is shipping
 * topojson plus a projection engine plus the raw boundary data to the browser to
 * draw fifty static shapes. That is hundreds of kilobytes and a client render
 * pass for something that never changes. This runs once, offline, and emits
 * pre-projected path strings that the server can render as plain SVG.
 *
 * The pipeline:
 *
 *   1. Read the boundary file (US Census Bureau cartographic boundaries, 1:20m,
 *      public domain, from the 2010 census — the field is `STATE` for FIPS).
 *   2. Project with **Albers USA**: an equal-area conic for the lower 48, plus
 *      rotated insets for Alaska and Hawaii, at the same scale and offsets the
 *      canonical presentation uses, so the map reads as the United States rather
 *      than as a scatter of shapes.
 *   3. Simplify with Douglas–Peucker against a tolerance measured in final
 *      pixels, round to one decimal, and drop rings too small to see.
 *   4. Emit one path string per state plus the viewBox.
 *
 * The output is committed, so the application has no build-time dependency on
 * this script and no runtime dependency on any of it.
 *
 * Usage, from the repository root, with the boundary file at `.tmp-geo/states.json`:
 *
 *   npx tsx scripts/generate-us-map.ts
 *
 * Source: gz_2010_us_040_00_20m.json (US Census Bureau, public domain).
 */

const SOURCE = resolve(process.cwd(), ".tmp-geo/states.json");
const OUTPUT = resolve(process.cwd(), "src/content/geo/us-states.ts");

/**
 * Drawing canvas.
 *
 * The width is fixed and the height is *derived* from the projected bounds: the
 * lower 48 plus two insets settles at roughly 2:1, and hard-coding a different
 * ratio left a band of dead space that the map then had to be centred inside.
 */
const VIEWBOX_WIDTH = 960;
const PADDING = 6;

/**
 * Simplification tolerance, in final pixels.
 *
 * Verified visually at each step rather than assumed: 0.6 keeps Delaware and
 * Rhode Island recognisable, 0.9 does not.
 */
const TOLERANCE = 0.6;

/** Rings smaller than this (square pixels) are dropped: at 960px they are dust. */
const MIN_RING_AREA = 3;

/** The fifty states, by FIPS, with the USPS code and the URL slug. */
const STATES: Record<string, { code: string; slug: string }> = {
  "01": { code: "AL", slug: "alabama" },
  "02": { code: "AK", slug: "alaska" },
  "04": { code: "AZ", slug: "arizona" },
  "05": { code: "AR", slug: "arkansas" },
  "06": { code: "CA", slug: "california" },
  "08": { code: "CO", slug: "colorado" },
  "09": { code: "CT", slug: "connecticut" },
  "10": { code: "DE", slug: "delaware" },
  "12": { code: "FL", slug: "florida" },
  "13": { code: "GA", slug: "georgia" },
  "15": { code: "HI", slug: "hawaii" },
  "16": { code: "ID", slug: "idaho" },
  "17": { code: "IL", slug: "illinois" },
  "18": { code: "IN", slug: "indiana" },
  "19": { code: "IA", slug: "iowa" },
  "20": { code: "KS", slug: "kansas" },
  "21": { code: "KY", slug: "kentucky" },
  "22": { code: "LA", slug: "louisiana" },
  "23": { code: "ME", slug: "maine" },
  "24": { code: "MD", slug: "maryland" },
  "25": { code: "MA", slug: "massachusetts" },
  "26": { code: "MI", slug: "michigan" },
  "27": { code: "MN", slug: "minnesota" },
  "28": { code: "MS", slug: "mississippi" },
  "29": { code: "MO", slug: "missouri" },
  "30": { code: "MT", slug: "montana" },
  "31": { code: "NE", slug: "nebraska" },
  "32": { code: "NV", slug: "nevada" },
  "33": { code: "NH", slug: "new-hampshire" },
  "34": { code: "NJ", slug: "new-jersey" },
  "35": { code: "NM", slug: "new-mexico" },
  "36": { code: "NY", slug: "new-york" },
  "37": { code: "NC", slug: "north-carolina" },
  "38": { code: "ND", slug: "north-dakota" },
  "39": { code: "OH", slug: "ohio" },
  "40": { code: "OK", slug: "oklahoma" },
  "41": { code: "OR", slug: "oregon" },
  "42": { code: "PA", slug: "pennsylvania" },
  "44": { code: "RI", slug: "rhode-island" },
  "45": { code: "SC", slug: "south-carolina" },
  "46": { code: "SD", slug: "south-dakota" },
  "47": { code: "TN", slug: "tennessee" },
  "48": { code: "TX", slug: "texas" },
  "49": { code: "UT", slug: "utah" },
  "50": { code: "VT", slug: "vermont" },
  "51": { code: "VA", slug: "virginia" },
  "53": { code: "WA", slug: "washington" },
  "54": { code: "WV", slug: "west-virginia" },
  "55": { code: "WI", slug: "wisconsin" },
  "56": { code: "WY", slug: "wyoming" },
};

/* -------------------------------------------------------------------------- */
/* Projection                                                                 */
/* -------------------------------------------------------------------------- */

const RAD = Math.PI / 180;

/**
 * Albers conic equal-area, in the form d3-geo uses: `n`, `c` and `r0` from the
 * two standard parallels, then a per-point radius.
 */
function conicEqualArea(parallelLow: number, parallelHigh: number) {
  const sinLow = Math.sin(parallelLow * RAD);
  const n = (sinLow + Math.sin(parallelHigh * RAD)) / 2;
  const c = 1 + sinLow * (2 * n - sinLow);
  const r0 = Math.sqrt(c) / n;

  return (rotatedLonDeg: number, latDeg: number): [number, number] => {
    const theta = rotatedLonDeg * RAD * n;
    const r = Math.sqrt(c - 2 * n * Math.sin(latDeg * RAD)) / n;
    return [r * Math.sin(theta), r0 - r * Math.cos(theta)];
  };
}

type SubProjection = (lon: number, lat: number) => [number, number];

/**
 * One inset of the composite projection.
 *
 * Two details that are easy to get wrong, and were:
 *
 * 1. **`rotate` is applied to the coordinates, but NOT to `center`.** The center
 *    is given in the projection's own rotated frame — that is what makes
 *    `.center([-0.6, 38.7])` put the lower 48 on its axis. Rotating it as well
 *    pushed every inset hundreds of units off the canvas.
 * 2. **The y axis is negated.** The conic's stack coordinate grows southward; the
 *    drawing's grows downward, and a projected point must therefore be measured
 *    *down* from the inset's translate, not up. Without the negation the whole
 *    country renders upside down.
 *
 * Both are the conventions of the standard Albers USA composite, so the map reads
 * as the United States rather than as a scatter of fifty shapes.
 */
function subProjection(config: {
  rotateDeg: number;
  center: [number, number];
  parallels: [number, number];
  scale: number;
  translate: [number, number];
}): SubProjection {
  const project = conicEqualArea(config.parallels[0], config.parallels[1]);
  const [centerX, centerY] = project(config.center[0], config.center[1]);

  return (lon, lat) => {
    const [x, y] = project(lon + config.rotateDeg, lat);
    return [
      config.translate[0] + config.scale * (x - centerX),
      config.translate[1] - config.scale * (y - centerY),
    ];
  };
}

/* The three insets, at the scale and offsets of the canonical US presentation. */
const LOWER_48 = subProjection({
  rotateDeg: 96,
  center: [-0.6, 38.7],
  parallels: [29.5, 45.5],
  scale: 1070,
  translate: [480, 250],
});

const ALASKA = subProjection({
  rotateDeg: 154,
  center: [-2, 58.5],
  parallels: [55, 65],
  scale: 1070 * 0.35,
  translate: [480 - 0.307 * 1070, 250 + 0.201 * 1070],
});

const HAWAII = subProjection({
  rotateDeg: 157,
  center: [-3, 19.9],
  parallels: [8, 18],
  scale: 1070,
  translate: [480 - 0.205 * 1070, 250 + 0.212 * 1070],
});

const PROJECTIONS: Record<string, SubProjection> = {
  "02": ALASKA,
  "15": HAWAII,
};

/* -------------------------------------------------------------------------- */
/* Geometry                                                                   */
/* -------------------------------------------------------------------------- */

type Point = [number, number];

function ringArea(points: Point[]): number {
  let total = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[j];
    const b = points[i];
    if (!a || !b) continue;
    total += (b[0] - a[0]) * (b[1] + a[1]);
  }
  return Math.abs(total / 2);
}

/** Perpendicular distance from a point to the line through `start`–`end`. */
function perpendicularDistance(point: Point, start: Point, end: Point): number {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + clamped * dx), y - (y1 + clamped * dy));
}

/** Douglas–Peucker. Iterative, because a recursion depth over 5k points is rude. */
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack: Array<[number, number]> = [[0, points.length - 1]];

  while (stack.length > 0) {
    const range = stack.pop();
    if (!range) break;
    const [first, last] = range;

    let maxDistance = 0;
    let index = -1;
    for (let i = first + 1; i < last; i += 1) {
      const point = points[i];
      const start = points[first];
      const end = points[last];
      if (!point || !start || !end) continue;
      const distance = perpendicularDistance(point, start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    if (index !== -1 && maxDistance > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const result: Point[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (keep[i] && point) result.push(point);
  }
  return result;
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                   */
/* -------------------------------------------------------------------------- */

type Feature = {
  properties: { STATE?: string; NAME?: string };
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
};

const geo = JSON.parse(readFileSync(SOURCE, "utf8")) as { features: Feature[] };

type Prepared = {
  code: string;
  name: string;
  slug: string;
  rings: Point[][];
};

const prepared: Prepared[] = [];
const allPoints: Point[] = [];

for (const feature of geo.features) {
  const fips = feature.properties.STATE;
  const name = feature.properties.NAME;
  const meta = fips ? STATES[fips] : undefined;

  // The District of Columbia and Puerto Rico are dropped: this map is the fifty
  // states. Adding DC later means adding it here and to `STATES`.
  if (!fips || !name || !meta) continue;

  const project = PROJECTIONS[fips] ?? LOWER_48;
  const polygons: number[][][][] =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates as number[][][]]
      : (feature.geometry.coordinates as number[][][][]);

  const rings: Point[][] = [];

  for (const polygon of polygons) {
    for (const ring of polygon) {
      const projected: Point[] = ring.map(([lon, lat]) => project(lon ?? 0, lat ?? 0));
      if (projected.length < 4) continue;
      rings.push(projected);
      allPoints.push(...projected);
    }
  }

  prepared.push({ code: meta.code, name, slug: meta.slug, rings });
}

/* Fit the projected drawing into the viewBox. */

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const [x, y] of allPoints) {
  if (x < minX) minX = x;
  if (y < minY) minY = y;
  if (x > maxX) maxX = x;
  if (y > maxY) maxY = y;
}

const usableWidth = VIEWBOX_WIDTH - PADDING * 2;
const contentAspect = (maxX - minX) / (maxY - minY);
const VIEWBOX_HEIGHT = Math.round(usableWidth / contentAspect + PADDING * 2);
const usableHeight = VIEWBOX_HEIGHT - PADDING * 2;
const scale = Math.min(usableWidth / (maxX - minX), usableHeight / (maxY - minY));

if (process.env.DIAG === "1") {
  console.log(`  [diag] aspect=${contentAspect.toFixed(3)} canvas=960x${VIEWBOX_HEIGHT}`);
  console.log(
    `  [diag] bounds x=${minX.toFixed(1)}..${maxX.toFixed(1)} y=${minY.toFixed(1)}..${maxY.toFixed(1)}`,
  );
  const reported = prepared.map((state) => {
    const xs = state.rings.flat().map((p) => p[0]);
    const ys = state.rings.flat().map((p) => p[1]);
    return {
      code: state.code,
      x: [Math.min(...xs), Math.max(...xs)] as [number, number],
      y: [Math.min(...ys), Math.max(...ys)] as [number, number],
    };
  });
  const extremes = [...reported]
    .sort((a, b) => a.x[0] - b.x[0])
    .slice(0, 3)
    .concat([...reported].sort((a, b) => b.x[1] - a.x[1]).slice(0, 2))
    .concat([...reported].sort((a, b) => b.y[1] - a.y[1]).slice(0, 3));
  for (const state of extremes) {
    console.log(
      `    ${state.code} x=${state.x[0].toFixed(0)}..${state.x[1].toFixed(0)} y=${state.y[0].toFixed(0)}..${state.y[1].toFixed(0)}`,
    );
  }
}

const renderedWidth = (maxX - minX) * scale;
const renderedHeight = (maxY - minY) * scale;
const offsetX = PADDING + (usableWidth - renderedWidth) / 2;
const offsetY = PADDING + (usableHeight - renderedHeight) / 2;

const toViewBox = (point: Point): Point => [
  offsetX + (point[0] - minX) * scale,
  offsetY + (point[1] - minY) * scale,
];

/** One decimal place, and no trailing `.0`: a third of the bytes for no loss. */
function round(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

const shapes = prepared
  .map((state) => {
    const paths: string[] = [];

    for (const ring of state.rings) {
      const fitted = ring.map(toViewBox);
      // `fitted` is already in viewBox units, so this is an area in pixels.
      const area = ringArea(fitted);

      if (area < MIN_RING_AREA) continue;

      const reduced = simplify(fitted, TOLERANCE);
      if (reduced.length < 3) continue;

      const [first, ...rest] = reduced;
      if (!first) continue;

      let path = `M${round(first[0])} ${round(first[1])}`;
      for (const point of rest) path += `L${round(point[0])} ${round(point[1])}`;
      path += "Z";
      paths.push(path);
    }

    return { ...state, path: paths.join("") };
  })
  .filter((state) => state.path.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name));

/* -------------------------------------------------------------------------- */
/* Emit                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Writes a standalone preview so the projection can be looked at without starting
 * the application.
 *
 * Projection errors are invisible in the numbers: the first version of this
 * script rendered the country upside down and pushed Alaska and Hawaii off the
 * canvas, and the only symptom was a plausible-looking file. So the output gets
 * looked at. Not readable by the editor, but it is the check that matters.
 */
function writePreview(): void {
  const highlighted = new Set(["TX", "CA", "RI", "DE", "FL", "ME", "AK", "HI", "WA"]);
  const paths = shapes
    .map(
      (state) =>
        `<path d="${state.path}" class="st${highlighted.has(state.code) ? " mk" : ""}" data-state="${state.code}" />`,
    )
    .join("");

  const html = `<!doctype html>
<meta charset="utf-8">
<title>US map projection preview</title>
<style>
  body { margin: 0; background: #faf8f3; }
  svg { display: block; width: 100vw; height: auto; }
  .st { fill: #ece8de; stroke: #fff; stroke-width: 0.6; }
  .mk { fill: #19697c; }
</style>
<svg viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>
`;

  const target = resolve(process.cwd(), ".tmp-geo/preview.html");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, "utf8");
  console.log(`Preview: ${target}`);
}

const body = shapes
  .map(
    (state) =>
      `  {\n    code: ${JSON.stringify(state.code)},\n    name: ${JSON.stringify(state.name)},\n    slug: ${JSON.stringify(state.slug)},\n    path: ${JSON.stringify(state.path)},\n  },`,
  )
  .join("\n");

const file = `/**
 * State map geometry. GENERATED — do not edit by hand.
 *
 * Regenerate with \`npx tsx scripts/generate-us-map.ts\` (see the header of that
 * script for the source file it expects).
 *
 * Source: US Census Bureau cartographic boundary file, 1:20,000,000, public
 * domain. Projected with Albers USA — an equal-area conic for the lower 48 with
 * rotated insets for Alaska and Hawaii — simplified to ${TOLERANCE}px and rounded to
 * one decimal place in the viewBox below.
 *
 * Committed rather than generated at build time so the application has no
 * build-time dependency and no map library: these are plain path strings that
 * render as server-side SVG.
 */

export const US_MAP_VIEWBOX = ${JSON.stringify(`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`)};

export type UsStateShape = {
  /** USPS code, e.g. "TX". */
  code: string;
  name: string;
  /** URL slug, matching the jurisdictions table. */
  slug: string;
  /** One or more closed subpaths, in the viewBox above. */
  path: string;
};

export const US_STATE_SHAPES: readonly UsStateShape[] = [
${body}
];
`;

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, file, "utf8");

writePreview();

const bytes = Buffer.byteLength(file, "utf8");
console.log(`Generated ${shapes.length} state shapes → ${OUTPUT}`);
console.log(`File size: ${(bytes / 1024).toFixed(1)} KB`);

const missing = Object.values(STATES).filter(
  (state) => !shapes.some((shape) => shape.code === state.code),
);
if (missing.length > 0) {
  console.error(`Missing states: ${missing.map((state) => state.code).join(", ")}`);
  process.exit(1);
}
