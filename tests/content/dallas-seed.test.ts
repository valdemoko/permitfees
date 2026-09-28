import { describe, expect, it } from "vitest";

import { DALLAS_PUBLISHED_PERMIT_PAGES, dallasSeed } from "@/content/dallas";
import { HOUSTON_KEYS, houstonSeed } from "@/content/houston";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Dallas's content, checked against the documents it came from — without a
 * database, so this runs everywhere.
 *
 * Three kinds of check live here:
 *
 *  1. **The payload is internally complete.** Every rule cites a source, a permit
 *     type and a schedule that exist in the same payload; every published page
 *     clears the editorial gate with the rules and sources the payload provides.
 *  2. **The arithmetic is the City's.** The bracket figures are recomputed and
 *     compared against the numbers printed in the City's own documents, including
 *     the two that only exist there: the 700 sq ft step in Table A-I and the
 *     commercial brackets above $1,500,000.
 *  3. **The disputed rule stays disarmed.** The plan review rate ships as `draft`
 *     on every permit type, so it cannot enter a total from any page.
 */

const AS_OF = "2026-09-24";
const rules = dallasSeed.feeRules.map((entry) => entry.rule);

describe("Dallas payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of dallasSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(dallasSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(dallasSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...dallasSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of dallasSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of dallasSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of dallasSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
    }

    for (const requirement of dallasSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }

    for (const verification of dallasSeed.verifications) {
      if (verification.sourceKey) {
        expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
      }
    }
  });

  it("adds no state, permit type or project type that Houston already defines", () => {
    // Two cities in one state are one state row; "the building permit" is one
    // concept. Dallas defines none of them and links to Houston's instead, which is
    // what stops the second city from creating a parallel catalogue.
    expect(dallasSeed.state.code).toBe(houstonSeed.state.code);
    expect(dallasSeed.permitTypes).toEqual([]);
    expect(dallasSeed.projectTypes).toEqual([]);
    expect(dallasSeed.jurisdiction.stateKey).toBe("tx");
    expect(dallasSeed.county.key).not.toBe(HOUSTON_KEYS.county);
  });

  it("publishes exactly the three permit pages, and no invented ones", () => {
    expect(DALLAS_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(dallasSeed.permitPages).toHaveLength(3);
  });
});

describe("Dallas payload — the City's own arithmetic", () => {
  function rulesFor(permitTypeKey: string) {
    return dallasSeed.feeRules
      .filter((entry) => entry.permitTypeKey === permitTypeKey)
      .map((entry) => entry.rule);
  }

  const buildingRules = rulesFor("building");

  /**
   * The table fee alone — the `base` component.
   *
   * Not the total: every Dallas permit also carries the trade-count inspection fee
   * and the $15 technology fee, and asserting on the total here would test the
   * technology fee five times and the bracket arithmetic not at all.
   */
  function fee(input: Omit<CalculationInput, "asOf">) {
    const result = calculatePermitFees({ asOf: AS_OF, ...input }, buildingRules);
    return result.components.find((component) => component.componentType === "base")?.amountCents ?? 0;
  }

  /** The same calculation, as a reader sees it: every component, added up. */
  function total(input: Omit<CalculationInput, "asOf">) {
    return calculatePermitFees({ asOf: AS_OF, ...input }, buildingRules).totalCents;
  }

  const house = (squareFootage: number) => ({
    occupancy: "residential" as const,
    workType: "new_construction" as const,
    custom: { project_class: "one_and_two_family", trades: 0 },
    squareFootage,
  });

  it("reproduces Table A-I, including the step at 700 square feet", () => {
    // `x 1.07` up to 700 sq ft, then `x 0.34569 + 300` from 701. The fee falls by
    // $206.67 across that boundary, which is in the published schedule and in the
    // City's own worksheet, and is reproduced rather than smoothed.
    expect(fee(house(700))).toBe(74_900); // $749.00
    expect(fee(house(701))).toBe(54_233); // $542.33
    expect(fee(house(1_000))).toBe(64_569); // $645.69
    expect(fee(house(10_500))).toBe(160_850); // $1,608.50
    expect(fee(house(10_501))).toBe(128_563); // $1,285.63
  });

  it("reproduces the City's residential worksheet example", () => {
    // 2,500 sq ft, four trades, and the $15 technology fee. The City's worksheet
    // prints $2,084.50 for the same house with its $577 plan review line.
    const computed = total({
      squareFootage: 2_500,
      occupancy: "residential",
      workType: "new_construction",
      custom: { project_class: "one_and_two_family", trades: 4 },
    });
    expect(computed).toBe(150_750); // $1,507.50
    expect(computed + 57_700).toBe(208_450); // the City's own total
  });

  it("reproduces Table A-II per dwelling unit", () => {
    const computed = total({
      units: 200,
      occupancy: "residential",
      workType: "new_construction",
      custom: { project_class: "multifamily", trades: 6 },
    });
    // 200 x $652 = $130,400, plus six trades at $125 and the $15 technology fee.
    expect(computed).toBe(13_116_500); // $131,165.00
  });

  it("reproduces the commercial table, including the four brackets S1 omits", () => {
    const commercial = (valuationDollars: number) => ({
      occupancy: "commercial" as const,
      workType: "new_construction" as const,
      custom: { project_class: "commercial", trades: 0 },
      valuationCents: valuationDollars * 100,
    });

    // Printed in S1.
    expect(fee(commercial(2_000))).toBe(7_500); // flat $75
    expect(fee(commercial(20_000))).toBe(29_000); // 0.95% + $100 = $290
    expect(fee(commercial(50_000))).toBe(47_500); // 0.75% + $100 = $475
    expect(fee(commercial(100_000))).toBe(311_650); // 2.7665% + $350 = $3,116.50
    expect(fee(commercial(700_000))).toBe(482_750); // 0.6325% + $400 = $4,827.50
    expect(fee(commercial(1_500_000))).toBe(634_250); // 0.3895% + $500 = $6,342.50

    // Printed only in the City's estimate worksheet. The $6,000,500 row is the one
    // its own example computes, so it is checked against the City's figure rather
    // than against arithmetic of ours.
    expect(fee(commercial(2_000_000))).toBe(842_400); // 0.3862% + $700 = $8,424
    expect(fee(commercial(4_000_000))).toBe(1_537_000); // 0.363% + $850 = $15,370
    expect(fee(commercial(6_000_500))).toBe(3_167_255); // 0.5095% + $1,100 = $31,672.55
    expect(fee(commercial(12_000_000))).toBe(3_162_400); // 0.2527% + $1,300 = $31,624
  });

  it("charges no table fee for a building type it does not have", () => {
    // A valuation with no project class matches no bracket, because the three
    // Dallas tables are separated by what is being built. The technology fee still
    // applies — it is per document, not per table — but no permit fee is invented.
    const input = { valuationCents: 40_000_000, workType: "new_construction" as const };
    expect(fee(input)).toBe(0);
    expect(total(input)).toBe(1_500); // the $15 technology fee, and nothing else
  });
});

describe("Dallas payload — the trade-count mechanism", () => {
  function totalFor(permitTypeKey: string, trades: number): number {
    const permitRules = dallasSeed.feeRules
      .filter((entry) => entry.permitTypeKey === permitTypeKey)
      .map((entry) => entry.rule);
    return calculatePermitFees({ asOf: AS_OF, custom: { trades } }, permitRules).totalCents;
  }

  it("prices a one-trade permit on the electrical page at the minimum plus the technology fee", () => {
    expect(totalFor("electrical", 1)).toBe(14_000); // $125 + $15
  });

  it("prices a two-trade remodel on the plumbing page", () => {
    expect(totalFor("plumbing", 2)).toBe(26_500); // $250 + $15
  });

  it("publishes no per-item trade rate at all", () => {
    // The distinction from Houston, asserted rather than asserted-in-prose: Dallas
    // has no outlets, fixtures, circuits or panels rule on any permit type.
    const units = dallasSeed.feeRules
      .map((entry) => entry.rule)
      .filter((rule) => rule.feeType === "per_unit")
      .map((rule) => (rule.config as { unit?: string }).unit);

    expect([...new Set(units)].sort()).toEqual(["dwelling_units", "trades"]);
    expect(units).not.toContain("outlets");
    expect(units).not.toContain("fixtures");
    expect(units).not.toContain("circuits");
    expect(units).not.toContain("panels");
  });
});

describe("Dallas payload — the disputed plan review stays disarmed", () => {
  it("ships the plan review rule as draft on every permit type", () => {
    const planReview = dallasSeed.feeRules.filter((entry) => entry.rule.code === "PLAN-REVIEW-303");
    expect(planReview).toHaveLength(3);
    for (const entry of planReview) {
      expect(entry.rule.status, `${entry.permitTypeKey}`).toBe("draft");
    }
  });

  it("records the dispute in the ledger, with both readings", () => {
    const record = dallasSeed.verifications.find(
      (verification) => verification.entityKey === "PLAN-REVIEW-303",
    );
    expect(record?.status).toBe("disputed");
    expect(record?.notes).toContain("$0.46");
    expect(record?.notes).toContain("0.046");
  });

  it("never adds the disputed figure to a published total", () => {
    const planReview = rules.find((rule) => rule.code === "PLAN-REVIEW-303");
    expect(planReview).toBeDefined();
    if (!planReview) return;

    const result = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 500_000, custom: { trades: 0 } },
      [planReview],
    );
    expect(result.totalCents).toBe(0);
    expect(result.excluded.map((excluded) => excluded.code)).toContain("PLAN-REVIEW-303");
  });
});

describe("Dallas payload — the editorial gate", () => {
  it("passes for every published page, on the payload's own data", () => {
    for (const page of dallasSeed.permitPages) {
      const permitRules = dallasSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === page.permitTypeKey,
      );
      const activeRules = permitRules.filter((entry) => entry.rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        // Every source in the payload belongs to Dallas, so the page's citations
        // are the set of sources its rules and the profile reference.
        sourceCount: dallasSeed.sources.length,
        feeRuleCount: activeRules.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, `${page.slug}`).toEqual([]);
      expect(gate.publishable, `${page.slug}`).toBe(true);
      expect(gate.indexable, `${page.slug}`).toBe(true);
      expect(gate.warnings.filter((warning) => warning.includes("freshness"))).toEqual([]);
    }
  });

  it("gives each page prose long enough to be worth its URL", () => {
    for (const page of dallasSeed.permitPages) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThan(600);
      expect(page.notIncluded.length, `${page.slug} notIncluded`).toBeGreaterThan(300);
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);
    }
  });

  it("carries a verification date on every page and every source", () => {
    for (const page of dallasSeed.permitPages) {
      expect(page.lastReviewedAt, page.slug).toBe("2026-09-24");
    }
    for (const source of dallasSeed.sources) {
      expect(source.lastVerifiedAt, source.key).toBe("2026-09-24");
      expect(source.url).toMatch(/^https:\/\/dallascityhall\.com\//);
    }
  });

  it("keeps contact details absent rather than unverified", () => {
    // The department's own page could not be reached when this was written, and a
    // wrong phone number on a page that tells someone who to call is a real error.
    const department = dallasSeed.departments[0];
    expect(department?.phone).toBeNull();
    expect(department?.email).toBeNull();
    expect(department?.addressLine).toBeNull();
    expect(department?.notes).toContain("deliberately");
  });
});
