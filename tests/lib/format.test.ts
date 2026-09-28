import { describe, expect, it } from "vitest";

import {
  formatBps,
  formatCents,
  formatDollars,
  formatNumber,
  indefiniteArticle,
  pluralize,
  truncate,
  withIndefiniteArticle,
} from "@/lib/format";

describe("indefiniteArticle", () => {
  it("uses 'an' before a vowel sound", () => {
    expect(withIndefiniteArticle("electrical permit")).toBe("an electrical permit");
    expect(withIndefiniteArticle("inspection")).toBe("an inspection");
  });

  it("uses 'a' before a consonant sound, including vowel letters that sound like one", () => {
    expect(withIndefiniteArticle("building permit")).toBe("a building permit");
    expect(withIndefiniteArticle("plumbing permit")).toBe("a plumbing permit");
    expect(withIndefiniteArticle("mechanical permit")).toBe("a mechanical permit");
    expect(withIndefiniteArticle("demolition permit")).toBe("a demolition permit");
    expect(withIndefiniteArticle("utility permit")).toBe("a utility permit");
  });

  it("uses 'an' before a silent h", () => {
    expect(indefiniteArticle("honest summary")).toBe("an");
  });

  it("falls back to 'a' for an empty phrase rather than emitting nothing", () => {
    expect(indefiniteArticle("")).toBe("a");
    expect(indefiniteArticle("   ")).toBe("a");
  });

  it("covers every permit name Houston publishes", () => {
    // These are the names in the database. "a electrical permit" was shipped in a
    // caption and in a meta description before this existed.
    const names = [
      "building permit",
      "electrical permit",
      "plumbing permit",
      "mechanical permit",
      "demolition permit",
      "roofing permit",
    ];
    expect(names.map(withIndefiniteArticle)).toEqual([
      "a building permit",
      "an electrical permit",
      "a plumbing permit",
      "a mechanical permit",
      "a demolition permit",
      "a roofing permit",
    ]);
  });
});

describe("formatCents", () => {
  it("formats with two decimals and thousands separators", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(150_00)).toBe("$150.00");
    expect(formatCents(123_456_789)).toBe("$1,234,567.89");
  });

  it("keeps the cent component and pads it", () => {
    expect(formatCents(1_005)).toBe("$10.05");
    expect(formatCents(1_050)).toBe("$10.50");
  });

  it("can drop the cents for large figures where they are noise", () => {
    expect(formatCents(25_000_000, { showCents: false })).toBe("$250,000");
  });

  it("handles negatives, which should never appear but must not render as garbage", () => {
    expect(formatCents(-150_00)).toBe("-$150.00");
  });
});

describe("formatDollars", () => {
  it("formats whole dollars", () => {
    expect(formatDollars(1500)).toBe("$1,500");
    expect(formatDollars(999)).toBe("$999");
  });
});

describe("formatBps", () => {
  it("renders basis points as percentages", () => {
    expect(formatBps(150)).toBe("1.5%");
    expect(formatBps(100)).toBe("1%");
    expect(formatBps(90)).toBe("0.9%");
    expect(formatBps(0)).toBe("0%");
    expect(formatBps(10_000)).toBe("100%");
  });

  it("does not drift on awkward values", () => {
    expect(formatBps(25)).toBe("0.25%");
    expect(formatBps(1)).toBe("0.01%");
  });
});

describe("formatNumber", () => {
  it("groups thousands and keeps fractions", () => {
    expect(formatNumber(1250)).toBe("1,250");
    expect(formatNumber(1_234_567)).toBe("1,234,567");
    expect(formatNumber(2400.5)).toBe("2,400.5");
  });
});

describe("pluralize", () => {
  it("agrees with the count", () => {
    expect(pluralize(1, "dwelling unit")).toBe("1 dwelling unit");
    expect(pluralize(4, "dwelling unit")).toBe("4 dwelling units");
    expect(pluralize(0, "fixture")).toBe("0 fixtures");
  });

  it("accepts an explicit plural", () => {
    expect(pluralize(2, "city", "cities")).toBe("2 cities");
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("short", 20)).toBe("short");
  });

  it("never exceeds the limit, including the ellipsis", () => {
    const result = truncate("word ".repeat(20), 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result.endsWith("…")).toBe(true);
  });

  it("prefers to cut on a word boundary", () => {
    const result = truncate("building permit cost in Houston, Texas", 24);
    expect(result).toBe("building permit cost in…");
  });
});
