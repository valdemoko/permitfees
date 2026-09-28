import { describe, expect, it } from "vitest";

import { DENVER_LAST_VERIFIED, DENVER_PUBLISHED_PERMIT_PAGES, denverSeed } from "@/content/denver";
import { houstonSeed } from "@/content/houston";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Denver's content, checked against the document it came from — without a database.
 *
 * Table No. 1 is a chained table, so the arithmetic that matters is at the boundaries:
 * the value at each band's top against the opening figure of the band above it. Seven
 * of the eight seams close; the one between $25,000 and $25,001 is a dollar apart in
 * the published document, and both readings are asserted rather than reconciled.
 *
 * Plan review is the table's third column, and the four rows of the policy are four
 * *modes* rather than four charges. The tests below assert that exactly one of them can
 * apply to a given valuation, and that a quick permit takes none.
 */

const AS_OF = "2026-09-24";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  denverSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const feeAt = (valuationCents: number, input: Partial<CalculationInput> = {}) =>
  calculatePermitFees({ asOf: AS_OF, valuationCents, ...input }, rulesFor("building"));

const totalAt = (valuationCents: number, input: Partial<CalculationInput> = {}) =>
  feeAt(valuationCents, input).totalCents;

/** The permit fee alone — Table No. 1's column, before any plan review is added. */
const permitFeeAt = (valuationCents: number, input: Partial<CalculationInput> = {}) =>
  feeAt(valuationCents, input)
    .components.filter((component) => component.componentType !== "plan_review")
    .reduce((sum, component) => sum + component.amountCents, 0);

const componentTotal = (
  valuationCents: number,
  componentType: string,
  input: Partial<CalculationInput> = {},
) =>
  feeAt(valuationCents, input)
    .components.filter((component) => component.componentType === componentType)
    .reduce((sum, component) => sum + component.amountCents, 0);

describe("Denver payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of denverSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(denverSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(denverSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...denverSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of denverSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of denverSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of denverSeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }
  });

  it("defines Colorado and Denver, and no permit type Houston does not have", () => {
    expect(denverSeed.state.code).toBe("CO");
    expect(denverSeed.state.slug).toBe("colorado");
    expect(denverSeed.jurisdiction.slug).toBe("denver");
    expect(denverSeed.permitTypes).toEqual([]);
    expect(denverSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: building, electrical and plumbing", () => {
    expect(DENVER_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(denverSeed.permitPages.every((page) => page.publishStatus === "published")).toBe(
      true,
    );
    expect(denverSeed.permitPages.every((page) => page.noindex === false)).toBe(true);
  });

  it("clears the editorial gate on every page, with an intro of substance", () => {
    for (const page of DENVER_PUBLISHED_PERMIT_PAGES) {
      expect(page.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: denverSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: DENVER_LAST_VERIFIED,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("has no page for mechanical, which the policy prices no permit for", () => {
    const links = denverSeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey);
    expect(links).toContain("mechanical");
    expect(denverSeed.permitPages.map((page) => page.permitTypeKey)).not.toContain("mechanical");
  });
});

describe("Denver Table No. 1 — the fee at every boundary", () => {
  it("charges the flat $20 and $35 rows for the two lowest bands", () => {
    expect(permitFeeAt(1)).toBe(2_000);
    expect(permitFeeAt(50_000)).toBe(2_000);
    expect(permitFeeAt(50_001)).toBe(3_500);
    expect(permitFeeAt(200_000)).toBe(3_500);
  });

  it("steps to $8.00 per additional $1,000 above $2,000, by whole thousands", () => {
    // $2,001 rounds up to $3,000: $35.00 + $8.00.
    expect(permitFeeAt(200_001)).toBe(4_300);
    // $12,000: $35.00 + 10 × $8.00.
    expect(permitFeeAt(1_200_000)).toBe(11_500);
    // Inside a thousand, the fraction is charged.
    expect(permitFeeAt(1_200_001)).toBe(12_300);
  });

  it("prints $220.00 as the opening figure above the $25,000 seam, which band 3 misses by $1.00", () => {
    // Band 3 at its top: $35.00 + 23 × $8.00.
    expect(permitFeeAt(2_500_000)).toBe(21_900);
    // Band 4 declares "$220.00 for the first $25,000", a dollar more than the band
    // below produces at that point — and the first valuation it can charge, $25,001,
    // rounds up to $26,000 and so adds $8.00 on top of it.
    expect(permitFeeAt(2_500_001)).toBe(22_800);
  });

  it("carries the remaining bands to their published opening figures", () => {
    expect(permitFeeAt(5_000_000)).toBe(42_000); // $420.00 at $50,000
    expect(permitFeeAt(5_000_001)).toBe(42_700); // $420.00 + $7.00
    expect(permitFeeAt(10_000_000)).toBe(77_000); // $770.00 at $100,000
    expect(permitFeeAt(10_000_001)).toBe(77_560); // $770.00 + $5.60
    expect(permitFeeAt(50_000_000)).toBe(301_000); // $3,010.00 at $500,000
    expect(permitFeeAt(50_000_001)).toBe(301_475); // $3,010.00 + $4.75
    expect(permitFeeAt(100_000_000)).toBe(538_500); // $5,385.00 at $1,000,000
    expect(permitFeeAt(100_000_001)).toBe(538_865); // $5,385.00 + $3.65
  });

  it("charges one band only, never two", () => {
    const result = feeAt(7_500_000); // $75,000
    expect(result.components.filter((c) => c.componentType !== "plan_review")).toHaveLength(1);
    expect(permitFeeAt(7_500_000)).toBe(59_500); // $420.00 + 25 × $7.00
  });
});

describe("Denver plan review — four rows, one mode at a time", () => {
  it("charges nothing below $2,000 of valuation, where the column prints 0", () => {
    expect(componentTotal(200_000, "plan_review")).toBe(0);
    expect(totalAt(200_000)).toBe(3_500);
  });

  it("charges 50% of the permit fee from $2,000 up", () => {
    // $50,000: permit fee $420.00, review $210.00.
    expect(totalAt(5_000_000)).toBe(63_000);
    expect(componentTotal(5_000_000, "plan_review")).toBe(21_000);
  });

  it("reads the review off the permit fee this run computed, not off the valuation", () => {
    const result = feeAt(5_000_001); // permit fee $427.00, review $213.50
    expect(result.totalCents).toBe(64_050);
    expect(componentTotal(5_000_001, "plan_review")).toBe(21_350);
  });

  it("replaces the column with the express rate, holding a $100 minimum", () => {
    // 20% of $420.00 would be $84.00; the minimum lifts it to $100.00.
    expect(componentTotal(5_000_000, "plan_review", { custom: { review_type: "express" } })).toBe(10_000);
    // Above the minimum the rate binds: at $200,000 the permit fee is $1,330.00 and
    // the express review is 20% of it, $266.00.
    const big = feeAt(20_000_000, { custom: { review_type: "express" } });
    expect(big.totalCents).toBe(133_000 + 26_600);
  });

  it("replaces the column with the type-approved rate", () => {
    const result = feeAt(5_000_000, { custom: { review_type: "type_approved" } });
    expect(result.totalCents).toBe(42_000 + 4_200);
    expect(result.components.filter((c) => c.componentType === "plan_review")).toHaveLength(1);
  });

  it("charges no review on a quick permit", () => {
    const result = feeAt(5_000_000, { custom: { permit_kind: "quick" } });
    expect(result.totalCents).toBe(42_000);
    expect(componentTotal(5_000_000, "plan_review", { custom: { permit_kind: "quick" } })).toBe(0);
  });
});

describe("Denver worked examples — the payload against its own prose", () => {
  /**
   * Each page states a figure in its notes and its FAQs. The engine computes what the
   * page renders, so these two must agree: a stored cent count that is out by a factor
   * of ten passes the schema, the typechecker and every sentence around it. The
   * electrical example shipped that way once — $250,000 stored where $25,000 was meant,
   * rendering $1,610.00 against prose saying $219.00 — and this is what caught it.
   */
  const expected: Record<string, number> = {
    "building-permit-cost": 241_500, // $1,610.00 permit fee + $805.00 review
    "electrical-permit-cost": 21_900, // $219.00
    "plumbing-permit-cost": 8_300, // $83.00
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of DENVER_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("charges the building example's review as 50% of its permit fee", () => {
    const page = DENVER_PUBLISHED_PERMIT_PAGES.find((p) => p.slug === "building-permit-cost")!;
    const result = calculatePermitFees(
      { asOf: AS_OF, ...page.workedExample!.inputs },
      rulesFor(page.permitTypeKey),
    );
    const permit = result.components.filter((c) => c.componentType !== "plan_review");
    const review = result.components.filter((c) => c.componentType === "plan_review");
    expect(permit).toHaveLength(1);
    expect(permit[0]!.amountCents).toBe(161_000);
    expect(review).toHaveLength(1);
    expect(review[0]!.amountCents).toBe(permit[0]!.amountCents / 2);
  });
});

describe("Denver trade permits — the same table on the trade's own valuation", () => {
  it("prices an electrical permit from the trade's valuation", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_200_000 },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(11_500);
    expect(result.components).toHaveLength(1);
  });

  it("prices a plumbing permit from the trade's valuation", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 500_000 },
      rulesFor("plumbing"),
    );
    expect(result.totalCents).toBe(5_900); // $35.00 + 3 × $8.00 at $5,000
  });

  it("keeps the two trades on their own rule sets, with no building band in either", () => {
    for (const key of ["electrical", "plumbing"]) {
      const conditions = JSON.stringify(rulesFor(key).map((rule) => rule.conditions));
      expect(conditions, key).not.toContain("custom.permit_kind");
    }
    expect(rulesFor("electrical").length).toBeGreaterThan(0);
    expect(rulesFor("plumbing").length).toBeGreaterThan(0);
  });
});
