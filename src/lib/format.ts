import { BPS_DENOMINATOR, CENTS_PER_DOLLAR } from "./calc/money";

/**
 * Display formatting.
 *
 * Hand-rolled rather than `Intl.NumberFormat` on purpose:
 *
 *   - The engine builds human-readable formulas that are asserted in tests, so
 *     its output must not depend on the runtime's ICU data or the host locale.
 *   - The site is en-US only. Revisit if that changes, at which point this
 *     module becomes the single place that needs a locale parameter.
 *
 * Everything here is pure and has no I/O.
 */

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format integer cents as US dollars: `formatCents(150000)` -> "$1,500.00".
 * `showCents: false` is used where cents add noise (large valuation figures).
 */
export function formatCents(cents: number, options?: { showCents?: boolean }): string {
  const showCents = options?.showCents ?? true;
  const negative = cents < 0;
  const absolute = Math.abs(Math.round(cents));
  const dollars = Math.floor(absolute / CENTS_PER_DOLLAR);
  const remainder = absolute % CENTS_PER_DOLLAR;

  const base = `$${groupThousands(String(dollars))}`;
  const withCents = showCents ? `${base}.${String(remainder).padStart(2, "0")}` : base;
  return negative ? `-${withCents}` : withCents;
}

/** Format dollars (as a number of dollars) for prose: `formatDollars(1500)` -> "$1,500". */
export function formatDollars(dollars: number): string {
  const negative = dollars < 0;
  const absolute = Math.abs(Math.round(dollars));
  return `${negative ? "-" : ""}$${groupThousands(String(absolute))}`;
}

/** Format basis points as a percentage: `formatBps(150)` -> "1.5%", `formatBps(10000)` -> "100%". */
export function formatBps(bps: number): string {
  const percent = bps / (BPS_DENOMINATOR / 100);
  const rounded = Math.round(percent * 1000) / 1000;
  return `${String(rounded)}%`;
}

/**
 * Format a rate held as an exact fraction as a percentage.
 *
 * `formatBps` rounds to three decimals, which is enough for basis points but not
 * for a rate the schedule publishes with more precision — Dallas's `0.027665` is
 * `2.7665%`, and three decimals would print `2.767%`, a different rate from the
 * one in the document. Six decimals are kept and trailing zeros trimmed, so the
 * printed rate still reads as the published figure.
 */
export function formatRateFraction(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  // Multiply before dividing: `0.027665 * 100` carries a binary rounding tail,
  // while `27665 * 100 / 1_000_000` is exact for every rate a schedule publishes.
  const percent = (numerator * 100) / denominator;
  const rounded = Math.round(percent * 1_000_000) / 1_000_000;
  return `${String(rounded)}%`;
}

/**
 * Format a dimensionless factor the way a schedule prints a multiplier: `0.75`,
 * `0.5`, `1`.
 *
 * A lookup-table factor is not a rate against the basis; it is multiplied into
 * the other factors. Printing it as a percentage (`75%`) would invite reading it
 * as a rate on the wrong base, so it is printed the way the schedule prints it —
 * Chicago's scope-of-review table prints `0.75`, not `75%`.
 */
export function formatMultiplier(numerator: number, denominator: number): string {
  if (denominator === 0) return "0";
  const fixed = (numerator / denominator).toFixed(6);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Format a rate stored the way a schedule with per-unit pricing publishes it:
 * cents per unit of the basis. `{ 34569, 1000 }` is 34.569 cents per unit, which
 * the City of Dallas prints as `X 0.34569` against square footage.
 *
 * This exists because the same exact fraction means two different things
depending on the basis. Against a valuation it is a percentage; against square
footage it is an amount. Printing `3456.9% of square footage` would be
arithmetically true and useless to a reader.
 */
export function formatUnitRate(centsPerUnitNumerator: number, denominator: number): string {
  if (denominator === 0) return "$0";
  // Numerator is in cents, so dollars are numerator / (denominator * 100).
  const dollars = centsPerUnitNumerator / (denominator * 100);
  const fixed = dollars.toFixed(6);
  const trimmed = fixed.includes(".") ? fixed.replace(/0+$/, "").replace(/\.$/, "") : fixed;
  return `$${trimmed}`;
}

/** Format a plain number with thousands separators: `formatNumber(1250)` -> "1,250". */
export function formatNumber(value: number): string {
  const negative = value < 0;
  const absolute = Math.abs(value);
  const [whole = "0", fraction] = String(absolute).split(".");
  const grouped = groupThousands(whole);
  return `${negative ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}`;
}

/** Pluralize a simple count: `pluralize(1, "unit")` -> "1 unit". */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${formatNumber(count)} ${word}`;
}

/**
 * Words that start with a vowel letter but a consonant sound: "a university".
 * A naive first-letter test says "an university".
 */
const CONSONANT_SOUND_VOWELS = /^(uni|use|usu|ut|eu|one)/;

/** Words that start with a silent h: "an hour". */
const SILENT_H = /^(hour|honest|honor)/;

/**
 * "a" or "an", for a noun phrase.
 *
 * Exists because a published caption and a meta description both said
 * "a electrical permit". The permit type is data, so the article cannot be
 * stored alongside it — it has to be derived, and derived in one place.
 *
 * Approximate by nature: English spelling does not encode sound. The two
 * exception groups above cover the cases that actually occur in jurisdiction
 * vocabulary; anything else falls back to the vowel-letter rule.
 */
export function indefiniteArticle(phrase: string): string {
  const word = phrase.trim().toLowerCase();
  if (word === "") return "a";
  if (SILENT_H.test(word)) return "an";
  if (CONSONANT_SOUND_VOWELS.test(word)) return "a";
  return /^[aeiou]/.test(word) ? "an" : "a";
}

/** `withIndefiniteArticle("electrical permit")` -> "an electrical permit". */
export function withIndefiniteArticle(phrase: string): string {
  return `${indefiniteArticle(phrase)} ${phrase}`;
}

/**
 * Truncate a string on a word boundary, for title tags and summaries.
 * Never returns a string longer than `maxLength` (including the ellipsis).
 */
export function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;

  // One character is reserved for the ellipsis, then we keep the longest run of
  // whole words that fits. Numbering word by word rather than cutting at the last
  // space keeps a final word that ends exactly on the boundary, which the simpler
  // "lastIndexOf(' ')" approach silently drops.
  const budget = Math.max(1, maxLength - 1);
  const words = trimmed.split(" ");
  let kept = "";

  for (const word of words) {
    const candidate = kept === "" ? word : `${kept} ${word}`;
    if (candidate.length > budget) break;
    kept = candidate;
  }

  // A single word longer than the budget has no boundary to use.
  return kept === "" ? `${trimmed.slice(0, budget)}…` : `${kept}…`;
}
