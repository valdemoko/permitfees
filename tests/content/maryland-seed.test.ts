import { describe, expect, it } from "vitest";

import { annapolisSeed } from "@/content/annapolis";
import { baltimoreSeed } from "@/content/baltimore";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof baltimoreSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof baltimoreSeed, permitTypeKey: string) {
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

describe("Maryland Seeds — Baltimore and Annapolis", () => {
  describe("Baltimore, MD", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of baltimoreSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(baltimoreSeed.permitPages).toHaveLength(3);
      for (const page of baltimoreSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: baltimoreSeed.sources.length,
          feeRuleCount: baltimoreSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Maryland with the independent-city county and the Building Code", () => {
      expect(baltimoreSeed.county).toMatchObject({ name: "Baltimore City", fipsCode: "24510" });
      expect(baltimoreSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(baltimoreSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the volumetric new-home example with the application fee", () => {
      // 39,600 cu ft rounds up to 40 thousands x $10.00 = $400.00 + $125.00 application.
      const result = computeExample(baltimoreSeed, "building");
      expect(result!.totalCents).toBe(52_500);
      const components = result!.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "BLD-NEW-RES", amountCents: 40_000 });
      expect(components).toContainEqual({ code: "BLD-APPLICATION", amountCents: 12_500 });
    });

    it("rounds each partial thousand of volume up", () => {
      const rules = activeRules(baltimoreSeed, "building");
      const result = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          custom: { cubic_footage: 23_400 },
        },
        rules,
      );
      const base = result.components.find((c) => c.code === "BLD-NEW-RES");
      // 23.4 thousands rounds up to 24 x $10.00 = $240.00.
      expect(base?.amountCents).toBe(24_000);
    });

    it("prices a 200 A service plus 6 circuits at $66.00", () => {
      const rules = activeRules(baltimoreSeed, "electrical");
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", custom: { circuits: 6, amperage: 200 } },
        rules,
      );
      const components = result.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "ELEC-SERVICE", amountCents: 3_000 });
      expect(components).toContainEqual({ code: "ELEC-CIRCUITS", amountCents: 3_600 });
      expect(result.totalCents).toBe(6_600);
    });

    it("prices 5 fixtures plus a dwelling water service at $50.00", () => {
      const rules = activeRules(baltimoreSeed, "plumbing");
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", fixtures: 5 },
        rules,
      );
      const components = result.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "PLUMB-FIXTURES", amountCents: 2_500 });
      expect(components).toContainEqual({ code: "PLUMB-WATER-SVC", amountCents: 2_500 });
      expect(result.totalCents).toBe(5_000);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(baltimoreSeed.sources.length).toBeGreaterThan(0);
      for (const source of baltimoreSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("Annapolis, MD", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of annapolisSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(annapolisSeed.permitPages).toHaveLength(3);
      for (const page of annapolisSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: annapolisSeed.sources.length,
          feeRuleCount: annapolisSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Maryland and Anne Arundel County", () => {
      expect(annapolisSeed.county).toMatchObject({
        name: "Anne Arundel County",
        fipsCode: "24003",
      });
      expect(annapolisSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(annapolisSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("prices a $60,000 addition at $650.00 plus the $200.00 application fee", () => {
      const rules = activeRules(annapolisSeed, "building");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 6_000_000, occupancy: "residential" },
        rules,
      );
      const components = result.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      // $250.00 + 0.8% x $50,000 = $650.00.
      expect(components).toContainEqual({ code: "BLD-OVER-10K", amountCents: 65_000 });
      expect(components).toContainEqual({ code: "BLD-APPLICATION", amountCents: 20_000 });
      expect(result.totalCents).toBe(85_000);
    });

    it("charges the first four bands from the table without the marginal rule", () => {
      const rules = activeRules(annapolisSeed, "building");
      for (const [valueCents, expected] of [
        [50_000, 2_500],
        [300_000, 15_000],
        [500_000, 17_500],
        [1_000_000, 20_000],
      ] as const) {
        const result = calculatePermitFees(
          { asOf: AS_OF, valuationCents: valueCents, occupancy: "residential" },
          rules,
        );
        const base = result.components.find(
          (c) => c.code === "BLD-TABLE" || c.code === "BLD-OVER-10K",
        );
        expect(base?.code, `valuation ${valueCents}`).toBe("BLD-TABLE");
        expect(base?.amountCents, `valuation ${valueCents}`).toBe(expected);
      }
    });

    it("prices the new-dwelling electrical example at $150.00", () => {
      const result = computeExample(annapolisSeed, "electrical");
      expect(result!.totalCents).toBe(15_000);
    });

    it("prices 3 fixtures with no gas work at $90.00", () => {
      const rules = activeRules(annapolisSeed, "plumbing");
      const result = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", fixtures: 3 },
        rules,
      );
      const components = result.components.map((c) => ({ code: c.code, amountCents: c.amountCents }));
      expect(components).toContainEqual({ code: "PLUMB-FIRST-FIXTURE", amountCents: 6_000 });
      expect(components).toContainEqual({ code: "PLUMB-ADD-FIXTURES", amountCents: 3_000 });
      expect(result.totalCents).toBe(9_000);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(annapolisSeed.sources.length).toBeGreaterThan(0);
      for (const source of annapolisSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
