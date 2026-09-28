import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import { statesNoSchedule } from "@/lib/editorial/no-schedule";

/**
 * The "no published fee schedule" predicate, pinned across the whole dataset.
 *
 * A false positive publishes a page that has a schedule as if it published
 * none; a false negative 404s a page whose honest absence is already written.
 * The zero-rule pages in the dataset are the three Jackson pages, Burlington's
 * electrical and plumbing pages and Charleston WV's plumbing page — every one
 * of them states the absence in prose, and every rule-bearing page in the
 * dataset must not trip the predicate.
 */

/** Pages the dataset deliberately publishes with zero fee rules. */
const ZERO_RULE_PAGE_KEYS = new Set([
  "jackson/building-permit-cost",
  "jackson/electrical-permit-cost",
  "jackson/plumbing-permit-cost",
  "burlington/electrical-permit-fees",
  "burlington/plumbing-permit-fees",
  "charleston-wv/plumbing-permit-cost",
]);

function keyOf(jurisdictionKey: string, slug: string): string {
  return `${jurisdictionKey}/${slug}`;
}

describe("statesNoSchedule across the dataset", () => {
  it("recognises the absence statement on every zero-rule page", () => {
    for (const seed of ALL_SEEDS) {
      for (const page of seed.permitPages) {
        const key = keyOf(seed.jurisdiction.key, page.slug);
        const ruleCount = seed.feeRules.filter(
          (entry) => entry.permitTypeKey === page.permitTypeKey,
        ).length;
        if (!ZERO_RULE_PAGE_KEYS.has(key)) continue;

        expect(ruleCount, `${key} should carry no rules`).toBe(0);
        const detected =
          statesNoSchedule(page.intro) ||
          statesNoSchedule(page.notIncluded) ||
          statesNoSchedule(seed.profile.notIncluded);
        expect(detected, `${key} must state the absence of a schedule`).toBe(true);
      }
    }
  });

  it("never fires on a page that carries fee rules", () => {
    for (const seed of ALL_SEEDS) {
      for (const page of seed.permitPages) {
        const key = keyOf(seed.jurisdiction.key, page.slug);
        if (ZERO_RULE_PAGE_KEYS.has(key)) continue;
        const ruleCount = seed.feeRules.filter(
          (entry) => entry.permitTypeKey === page.permitTypeKey,
        ).length;
        if (ruleCount === 0) continue;

        const detected =
          statesNoSchedule(page.intro) ||
          statesNoSchedule(page.notIncluded) ||
          statesNoSchedule(seed.profile.notIncluded);
        expect(detected, `${key} has rules but the predicate fired`).toBe(false);
      }
    }
  });

  it("treats nullish text as no statement", () => {
    expect(statesNoSchedule(null)).toBe(false);
    expect(statesNoSchedule(undefined)).toBe(false);
    expect(statesNoSchedule("")).toBe(false);
  });

  it("requires the sentence to be about the schedule itself, not an exclusion", () => {
    // States the absence: should fire.
    expect(statesNoSchedule("The City publishes no plumbing fee schedule.")).toBe(true);
    expect(statesNoSchedule("does not publish its fee schedule")).toBe(true);
    expect(statesNoSchedule("A priced electrical fee table — the City publishes none online.")).toBe(
      true,
    );
    // Meres exclusion of another fee: should not fire.
    expect(statesNoSchedule("Impact fees are not included in these figures.")).toBe(false);
    expect(statesNoSchedule("State licensing fees are separate charges.")).toBe(false);
  });
});
