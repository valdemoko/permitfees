import { describe, expect, it } from "vitest";

import { bridgeportSeed } from "@/content/bridgeport";
import { newHavenSeed } from "@/content/new-haven";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

function activeRules(seed: typeof bridgeportSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof bridgeportSeed, permitTypeKey: string) {
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

describe("Connecticut Seeds — Bridgeport and New Haven", () => {
  describe("Bridgeport, CT", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of bridgeportSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(bridgeportSeed.permitPages).toHaveLength(3);
      for (const page of bridgeportSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: bridgeportSeed.sources.length,
          feeRuleCount: bridgeportSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Connecticut with the correct county", () => {
      expect(bridgeportSeed.state).toMatchObject({ code: "CT", fipsCode: "09" });
      expect(bridgeportSeed.county).toMatchObject({ name: "Fairfield County", fipsCode: "09001" });
      expect(bridgeportSeed.jurisdiction.slug).toBe("bridgeport");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(bridgeportSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the schedule's printed rows with the value-of-work formula", () => {
      const rules = activeRules(bridgeportSeed, "building");
      // $50,000 -> $1,530.00 (printed row).
      const at50k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
        rules,
      );
      expect(at50k.totalCents).toBe(153_000);
      // $100,000 -> $3,030.00 (printed row).
      const at100k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_000_000, occupancy: "residential" },
        rules,
      );
      expect(at100k.totalCents).toBe(303_000);
    });

    it("prices the flat first brackets as printed", () => {
      const rules = activeRules(bridgeportSeed, "building");
      // $0-$500 -> $40.00.
      const at400 = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 40_000, occupancy: "residential" },
        rules,
      );
      expect(at400.totalCents).toBe(4_000);
      // $501-$1,000 -> $60.00.
      const at750 = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 75_000, occupancy: "residential" },
        rules,
      );
      expect(at750.totalCents).toBe(6_000);
    });

    it("rounds each partial thousand up above the first thousand", () => {
      const rules = activeRules(bridgeportSeed, "building");
      // $10,100: 10 whole thousands above the first ('or part of') -> $60 + 10 x $30 = $360.
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 1_010_000, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(36_000);
    });

    it("charges the electrical water-heater row only for that scope", () => {
      const rules = activeRules(bridgeportSeed, "electrical");
      const wh = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", custom: { water_heater_only: true } },
        rules,
      );
      expect(wh.totalCents).toBe(4_000);
      const plain = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", valuationCents: 500_000 },
        rules,
      );
      expect(plain.totalCents).toBe(18_000);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(bridgeportSeed.sources.length).toBeGreaterThan(0);
      for (const source of bridgeportSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });

  describe("New Haven, CT", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of newHavenSeed.feeRules) {
        expect(() => validateFeeRule(entry.rule)).not.toThrow();
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(newHavenSeed.permitPages).toHaveLength(3);
      for (const page of newHavenSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: newHavenSeed.sources.length,
          feeRuleCount: newHavenSeed.feeRules.length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable).toBe(true);
      }
    });

    it("is tied to Connecticut and New Haven County", () => {
      expect(newHavenSeed.state).toMatchObject({ code: "CT", fipsCode: "09" });
      expect(newHavenSeed.county).toMatchObject({ name: "New Haven County", fipsCode: "09009" });
      expect(newHavenSeed.jurisdiction.type).toBe("city");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(newHavenSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the residential table's printed rows", () => {
      const rules = activeRules(newHavenSeed, "building");
      // $50,000 -> $1,386.00 (printed row).
      const at50k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "residential" },
        rules,
      );
      expect(at50k.totalCents).toBe(138_600);
      // $120,000 -> $3,294.20 (printed row, worked example).
      const at120k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 12_000_000, occupancy: "residential" },
        rules,
      );
      expect(at120k.totalCents).toBe(329_420);
    });

    it("switches to the commercial table for non-residential occupancy", () => {
      const rules = activeRules(newHavenSeed, "building");
      // $50,000 commercial -> $1,783.00 (printed row).
      const at50k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 5_000_000, occupancy: "commercial" },
        rules,
      );
      expect(at50k.totalCents).toBe(178_300);
      // $150,000 commercial -> $5,309.00 (printed row).
      const at150k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 15_000_000, occupancy: "commercial" },
        rules,
      );
      expect(at150k.totalCents).toBe(530_900);
    });

    it("rounds partial thousands up to the next printed row", () => {
      const rules = activeRules(newHavenSeed, "building");
      // $25,500 reads at the $26,000 row: $50.26 + 25 x $27.26 = $731.76.
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_550_000, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(73_176);
    });

    it("prices the $5,000 plumbing minimum-cost floor at the printed row", () => {
      const rules = activeRules(newHavenSeed, "plumbing");
      const result = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 500_000, occupancy: "residential" },
        rules,
      );
      expect(result.totalCents).toBe(15_930);
    });

    it("carries only official primary sources with verification dates", () => {
      expect(newHavenSeed.sources.length).toBeGreaterThan(0);
      for (const source of newHavenSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });
  });
});
