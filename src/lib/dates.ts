/**
 * Date handling.
 *
 * All persisted and engine-facing dates are plain `YYYY-MM-DD` strings, and all
 * comparisons are string comparisons.
 *
 * That is deliberate. `new Date("2026-09-23")` is parsed as UTC midnight, while
 * `new Date("2026-09-23T00:00:00")` is parsed as local midnight; mixing the two
 * is a classic source of off-by-one-day bugs in exactly the kind of
 * effective-dating logic this project depends on. ISO date strings sort
 * lexicographically, so comparing them as strings is both simpler and correct.
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > daysInMonth(year, month)) return false;
  return true;
}

function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Normalize any accepted date input into `YYYY-MM-DD`, or throw. */
export function normalizeIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError("Invalid Date instance passed to normalizeIsoDate");
    }
    return value.toISOString().slice(0, 10);
  }
  const trimmed = value.trim();
  const datePart = trimmed.length > 10 ? trimmed.slice(0, 10) : trimmed;
  if (!isIsoDate(datePart)) {
    throw new TypeError(`Expected an ISO date (YYYY-MM-DD), received "${value}"`);
  }
  return datePart;
}

/** Returns -1, 0 or 1. Safe because ISO dates are lexicographically ordered. */
export function compareIsoDates(left: string, right: string): -1 | 0 | 1 {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

/**
 * Effective windows are HALF-OPEN: `[from, to)`.
 *
 * A rule ending on 2026-06-30 and a replacement starting on 2026-07-01 therefore
 * do not overlap, and a fee change never has a day where two rules both apply.
 */
export function isWithinEffectiveWindow(
  asOf: string,
  effectiveFrom: string,
  effectiveTo: string | null,
): boolean {
  if (compareIsoDates(asOf, effectiveFrom) < 0) return false;
  if (effectiveTo !== null && compareIsoDates(asOf, effectiveTo) >= 0) return false;
  return true;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const to = Date.UTC(
    Number(toIso.slice(0, 4)),
    Number(toIso.slice(5, 7)) - 1,
    Number(toIso.slice(8, 10)),
  );
  return Math.round((to - from) / 86_400_000);
}

/** Human-readable date for display, deterministic and timezone-free. */
export function formatIsoDate(iso: string, options?: { short?: boolean }): string {
  const date = normalizeIsoDate(iso);
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const monthName = MONTH_NAMES[month - 1] ?? "";

  return options?.short
    ? `${monthName.slice(0, 3)} ${day}, ${year}`
    : `${monthName} ${day}, ${year}`;
}
