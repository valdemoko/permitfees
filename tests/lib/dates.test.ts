import { describe, expect, it } from "vitest";

import {
  compareIsoDates,
  daysBetween,
  formatIsoDate,
  isIsoDate,
  isWithinEffectiveWindow,
  normalizeIsoDate,
} from "@/lib/dates";

describe("isIsoDate", () => {
  it("accepts a real date", () => {
    expect(isIsoDate("2026-09-23")).toBe(true);
    expect(isIsoDate("2024-02-29")).toBe(true); // leap year
  });

  it("rejects dates that do not exist", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("2026-00-10")).toBe(false);
    expect(isIsoDate("2025-02-29")).toBe(false); // not a leap year
  });

  it("rejects anything that is not the canonical shape", () => {
    for (const bad of ["2026-9-23", "23/09/2026", "20260923", "yesterday", ""]) {
      expect(isIsoDate(bad), `expected "${bad}" to be invalid`).toBe(false);
    }
  });
});

describe("normalizeIsoDate", () => {
  it("keeps a plain date as-is", () => {
    expect(normalizeIsoDate("2026-09-23")).toBe("2026-09-23");
  });

  it("reduces a timestamp to its date part", () => {
    expect(normalizeIsoDate("2026-09-23T14:31:00.000Z")).toBe("2026-09-23");
  });

  it("throws rather than silently using today", () => {
    expect(() => normalizeIsoDate("not-a-date")).toThrow(TypeError);
    expect(() => normalizeIsoDate(new Date("nope"))).toThrow(TypeError);
  });
});

describe("compareIsoDates", () => {
  it("orders lexicographically, which is also chronologically", () => {
    expect(compareIsoDates("2026-01-01", "2026-01-02")).toBe(-1);
    expect(compareIsoDates("2026-02-01", "2026-01-31")).toBe(1);
    expect(compareIsoDates("2026-01-01", "2026-01-01")).toBe(0);
  });
});

describe("isWithinEffectiveWindow", () => {
  it("is inclusive of the start date", () => {
    expect(isWithinEffectiveWindow("2026-07-01", "2026-07-01", null)).toBe(true);
    expect(isWithinEffectiveWindow("2026-06-30", "2026-07-01", null)).toBe(false);
  });

  it("is exclusive of the end date, so consecutive rules never overlap", () => {
    // Half-open `[from, to)`: a rule that ends on 2026-06-30 has already stopped
    // applying on that day, so a replacement starting on 2026-06-30 takes over
    // with no day where both rules apply and no day where neither does.
    expect(isWithinEffectiveWindow("2026-06-29", "2024-01-01", "2026-06-30")).toBe(true);
    expect(isWithinEffectiveWindow("2026-06-30", "2024-01-01", "2026-06-30")).toBe(false);
    expect(isWithinEffectiveWindow("2026-06-30", "2026-06-30", null)).toBe(true);
  });

  it("treats a null end date as open-ended", () => {
    expect(isWithinEffectiveWindow("2099-01-01", "2024-01-01", null)).toBe(true);
  });
});

describe("daysBetween", () => {
  it("counts days across a leap day and a year boundary", () => {
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
    expect(daysBetween("2026-09-23", "2026-09-23")).toBe(0);
  });
});

describe("formatIsoDate", () => {
  it("renders a deterministic, locale-independent date", () => {
    expect(formatIsoDate("2026-09-23")).toBe("September 23, 2026");
    expect(formatIsoDate("2026-01-05", { short: true })).toBe("Jan 5, 2026");
  });
});
