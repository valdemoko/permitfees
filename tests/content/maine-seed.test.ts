import { describe, expect, it } from "vitest";

import { lewistonSeed } from "@/content/lewiston";
import { portlandMeSeed } from "@/content/portlandme";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof portlandMeSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof portlandMeSeed, permitTypeKey: string) {
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

function editorialSuite(seed: typeof portlandMeSeed, name: string) {
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

describe("Maine Seeds — Portland and Lewiston", () => {
  editorialSuite(portlandMeSeed, "Portland");

  it("is tied to Maine and Cumberland County", () => {
    expect(portlandMeSeed.state).toMatchObject({ code: "ME", fipsCode: "23" });
    expect(portlandMeSeed.county).toMatchObject({ name: "Cumberland County", fipsCode: "23005" });
  });

  it("reproduces the cost-of-work formula exactly", () => {
    const rules = activeRules(portlandMeSeed, "building");
    const cases: Array<[number, number]> = [
      [500_00, 3_000], // $500 -> $30 (first-thousand fee)
      [1_000_00, 3_000], // $1,000 -> $30
      [11_000_00, 13_000], // $11,000 -> $30 + 10 x $10 = $130
      [51_000_00, 53_000], // $51,000 -> $30 + 50 x $10 = $530
      [30_000_00, 32_000], // $30,000 (worked example) -> $320
    ];
    for (const [valuationCents, expected] of cases) {
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(expected);
    }
  });

  it("prices the trades on the same formula", () => {
    // $6,000 electrical -> $30 + 5 x $10 = $80.
    const elec = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 600_000, occupancy: "residential" },
      activeRules(portlandMeSeed, "electrical"),
    );
    expect(elec.totalCents).toBe(8_000);
    // $12,000 plumbing -> $30 + 11 x $10 = $140.
    const pl = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_200_000, occupancy: "residential" },
      activeRules(portlandMeSeed, "plumbing"),
    );
    expect(pl.totalCents).toBe(14_000);
  });

  editorialSuite(lewistonSeed, "Lewiston");

  it("is tied to Maine and Androscoggin County", () => {
    expect(lewistonSeed.state).toMatchObject({ code: "ME", fipsCode: "23" });
    expect(lewistonSeed.county).toMatchObject({ name: "Androscoggin County", fipsCode: "23001" });
  });

  it("reproduces the renovation valuation rows", () => {
    const rules = activeRules(lewistonSeed, "building");
    // $40,000 renovation -> $25 + 40 x $5 = $225.
    const at40k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 4_000_000, occupancy: "residential" },
      rules,
    );
    expect(at40k.totalCents).toBe(22_500);
    // $2,000 -> $25 + 2 x $5 = $35.
    const at2k = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 200_000, occupancy: "residential" },
      rules,
    );
    expect(at2k.totalCents).toBe(3_500);
  });

  it("prices the trades on the valuation basis", () => {
    // $10,000 electrical -> $25 + 10 x $5 = $75.
    const elec = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_000_000, occupancy: "residential" },
      activeRules(lewistonSeed, "electrical"),
    );
    expect(elec.totalCents).toBe(7_500);
    // $6,000 plumbing -> $25 + 6 x $5 = $55.
    const pl = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 600_000, occupancy: "residential" },
      activeRules(lewistonSeed, "plumbing"),
    );
    expect(pl.totalCents).toBe(5_500);
  });
});
