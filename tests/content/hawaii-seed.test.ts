import { describe, expect, it } from "vitest";

import { hiloSeed } from "@/content/hilo";
import { honoluluSeed } from "@/content/honolulu";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof honoluluSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof honoluluSeed, permitTypeKey: string) {
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

function editorialSuite(seed: typeof honoluluSeed, name: string, pages: number) {
  it(`${name}: validates all fee rules through engine schema`, () => {
    for (const entry of seed.feeRules) {
      expect(() => validateFeeRule(entry.rule)).not.toThrow();
    }
  });

  it(`${name}: has ${pages} published permit page(s) passing the editorial gate`, () => {
    expect(seed.permitPages).toHaveLength(pages);
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
    for (const permitTypeKey of ["building"]) {
      const result = computeExample(seed, permitTypeKey);
      expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
      expect(result!.components.length).toBeGreaterThan(0);
      expect(result!.totalCents).toBeGreaterThan(0);
      for (const excluded of result!.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
      }
    }
  });

  it(`${name}: carries official sources with verification dates`, () => {
    expect(seed.sources.length).toBeGreaterThan(0);
    for (const source of seed.sources) {
      expect(source.lastVerifiedAt).not.toBeNull();
    }
  });
}

describe("Hawaii Seeds — Honolulu and Hilo", () => {
  editorialSuite(honoluluSeed, "Honolulu", 1);

  it("is tied to Hawaii and Honolulu County", () => {
    expect(honoluluSeed.state).toMatchObject({ code: "HI", fipsCode: "15" });
    expect(honoluluSeed.county).toMatchObject({ name: "Honolulu County", fipsCode: "15003" });
  });

  it("reads the rates on the total valuation and stays monotone across the seams", () => {
    const rules = activeRules(honoluluSeed, "building");
    const cases: Array<[number, number]> = [
      [400_00, 2_400], // $400 -> $20 + 20% review = $24
      [1_000_00, 3_960], // $1,000 -> $8 + 10 x $2.50 = $33; + review = $39.60
      [10_000_00, 27_840], // $10,000 -> $12 + 100 x $2.20 = $232; + review = $278.40
      [50_000_00, 117_840], // $50,000 -> $82 + 50 x $18 = $982; + review = $1,178.40
      [100_000_00, 202_320], // $100,000 -> $286 + 100 x $14 = $1,686; + review
      [500_000_00, 684_000], // $500,000 -> $700 + 500 x $10 = $5,700; + review
      [2_000_000_00, 1_584_000], // $2,000,000 -> $3,200 + 2,000 x $5 = $13,200; + review
    ];
    let previous = 0;
    for (const [valuationCents, expected] of cases) {
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(expected);
      expect(result.totalCents).toBeGreaterThanOrEqual(previous);
      previous = result.totalCents;
    }
  });

  it("adds the 20% plan review capped at $25,000", () => {
    const rules = activeRules(honoluluSeed, "building");
    // $50,000: $982 permit -> $196.40 review.
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
      rules,
    );
    const review = result.components.find((c) => c.code === "HNL-PLAN-REVIEW-20");
    expect(review?.amountCents).toBe(19_640);
  });

  it("is a consolidated permit: no electrical or plumbing pages exist", () => {
    expect(
      honoluluSeed.feeRules.filter((e) => e.permitTypeKey !== "building"),
    ).toHaveLength(0);
    expect(honoluluSeed.permitPages).toHaveLength(1);
  });

  editorialSuite(hiloSeed, "Hilo", 1);

  it("is tied to Hawaii and Hawaii County as a county jurisdiction", () => {
    expect(hiloSeed.state).toMatchObject({ code: "HI", fipsCode: "15" });
    expect(hiloSeed.county).toMatchObject({ name: "Hawaii County", fipsCode: "15001" });
    expect(hiloSeed.jurisdiction.type).toBe("county");
  });

  it("reproduces HCC 5-7-3's chained bands exactly", () => {
    const rules = activeRules(hiloSeed, "building");
    const cases: Array<[number, number]> = [
      [400_00, 1_200], // $400 -> $10 + 20% review = $12
      [2_000_00, 3_900], // $2,000 -> $32.50 (chained base); + review = $39
      [25_000_00, 24_600], // $25,000 -> $205.00; + review = $246
      [50_000_00, 42_600], // $50,000 -> $355.00; + review = $426
      [150_000_00, 78_600], // $150,000 -> $655.00; + review = $786
    ];
    for (const [valuationCents, expected] of cases) {
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(expected);
    }
  });

  it("rounds partial blocks up and adds 20% plan review", () => {
    const rules = activeRules(hiloSeed, "building");
    // $10,100: $32.50 + 9 x $7.50 = $100.00 (the .1 rounds up to a whole thousand).
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_010_000, occupancy: "residential" },
      rules,
    );      expect(result.totalCents).toBe(12_000);
      const base = result.components.find((c) => c.code === "HILO-BLD-B3");
      expect(base?.amountCents).toBe(10_000);
    const review = result.components.find((c) => c.code === "HILO-PLAN-REVIEW-20");
    expect(review?.amountCents).toBe(2_000);
    expect(result.totalCents).toBe(12_000);
  });
});
