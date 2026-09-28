import { describe, expect, it } from "vitest";

import { providenceSeed } from "@/content/providence";
import { warwickSeed } from "@/content/warwick";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof providenceSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof providenceSeed, permitTypeKey: string) {
  const page = seed.permitPages.find(
    (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
  );
  if (!page || !page.workedExample) return null;
  const input: CalculationInput = {
    asOf: AS_OF,
    ...(page.workedExample.inputs as Partial<CalculationInput>),
  };
  return calculatePermitFees(input, activeRules(seed, permitTypeKey));
}

function editorialSuite(seed: typeof providenceSeed, name: string) {
  it(`${name}: validates all fee rules through engine schema`, () => {
    for (const entry of seed.feeRules) {
      expect(() => validateFeeRule(entry.rule)).not.toThrow();
    }
  });

  it(`${name}: has 3 published permit pages passing the editorial gate`, () => {
    expect(seed.permitPages).toHaveLength(3);
    for (const page of seed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);
      const evalResult = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: seed.sources.length,
        feeRuleCount: seed.feeRules.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(evalResult.publishable).toBe(true);
    }
  });

  it(`${name}: computes every published worked example above zero with no invalid exclusions`, () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const result = computeExample(seed, permitTypeKey);
      expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
      expect(result!.components.length).toBeGreaterThan(0);
      expect(result!.totalCents).toBeGreaterThan(0);
      for (const excluded of result!.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
      }
    }
  });

  it(`${name}: carries only official primary sources with verification dates`, () => {
    expect(seed.sources.length).toBeGreaterThan(0);
    for (const source of seed.sources) {
      expect(source.isPrimary).toBe(true);
      expect(source.lastVerifiedAt).not.toBeNull();
    }
  });
}

describe("Rhode Island Seeds — Providence and Warwick", () => {
  editorialSuite(providenceSeed, "Providence");

  it("is tied to Rhode Island and Providence County", () => {
    expect(providenceSeed.state).toMatchObject({ code: "RI", fipsCode: "44" });
    expect(providenceSeed.county).toMatchObject({ name: "Providence County", fipsCode: "44007" });
  });

  it("reproduces the statewide schedule's chained bands", () => {
    const rules = activeRules(providenceSeed, "building");
    // $50,000 -> $1,070.00 (chained base of the top band).
    const at50k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
      rules,
    );
    expect(at50k.totalCents).toBe(107_000);
    // $150,000 -> $1,070 + 100 x $19 = $2,970.00.
    const at150k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 15_000_000, occupancy: "commercial" },
      rules,
    );
    expect(at150k.totalCents).toBe(297_000);
    // $25,000 -> $230 + 15 x $21 = $545.00.
    const at25k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_500_000, occupancy: "residential" },
      rules,
    );
    expect(at25k.totalCents).toBe(54_500);
  });

  it("binds the $125 minimum on small valuations", () => {
    const rules = activeRules(providenceSeed, "building");
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 300_000, occupancy: "residential" }, // $3,000 -> $69 computed
      rules,
    );
    expect(result.totalCents).toBe(12_500);
  });

  it("prices the electrical and plumbing scopes on the same ladder", () => {
    // $12,000 electrical scope -> $230 + 2 x $21 = $272.00.
    const elec = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_200_000, occupancy: "commercial" },
      activeRules(providenceSeed, "electrical"),
    );
    expect(elec.totalCents).toBe(27_200);
    // $20,000 plumbing scope -> $230 + 10 x $21 = $440.00.
    const pl = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_000_000, occupancy: "residential" },
      activeRules(providenceSeed, "plumbing"),
    );
    expect(pl.totalCents).toBe(44_000);
  });

  editorialSuite(warwickSeed, "Warwick");

  it("is tied to Rhode Island and Kent County", () => {
    expect(warwickSeed.state).toMatchObject({ code: "RI", fipsCode: "44" });
    expect(warwickSeed.county).toMatchObject({ name: "Kent County", fipsCode: "44003" });
  });

  it("reproduces Warwick's chained bands and minimum", () => {
    const rules = activeRules(warwickSeed, "building");
    // $50,000 -> $420.00 (chained base).
    const at50k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
      rules,
    );
    expect(at50k.totalCents).toBe(42_000);
    // $150,000 -> $420 + 100 x $6 = $1,020.00.
    const at150k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 15_000_000, occupancy: "residential" },
      rules,
    );
    expect(at150k.totalCents).toBe(102_000);
    // $30,000 -> $100 + 20 x $8 = $260.00.
    const at30k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 3_000_000, occupancy: "residential" },
      rules,
    );
    expect(at30k.totalCents).toBe(26_000);
    // $3,000 -> $30 computed, $75 minimum binds.
    const at3k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 300_000, occupancy: "residential" },
      rules,
    );
    expect(at3k.totalCents).toBe(7_500);
    // $15,000 plumbing scope -> $100 + 5 x $8 = $140.00.
    const pl = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_500_000, occupancy: "residential" },
      activeRules(warwickSeed, "plumbing"),
    );
    expect(pl.totalCents).toBe(14_000);
  });
});
