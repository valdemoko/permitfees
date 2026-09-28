import { describe, expect, it } from "vitest";

import { rapidCitySeed } from "@/content/rapidcity";
import { siouxFallsSeed } from "@/content/siouxfalls";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's shape. */
function activeRules(
  seed: typeof rapidCitySeed | typeof siouxFallsSeed,
  permitTypeKey: string,
): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof rapidCitySeed | typeof siouxFallsSeed, permitTypeKey: string) {
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

function compute(
  seed: typeof rapidCitySeed | typeof siouxFallsSeed,
  permitTypeKey: string,
  input: Partial<CalculationInput>,
) {
  return calculatePermitFees(
    { asOf: AS_OF, ...input } as CalculationInput,
    activeRules(seed, permitTypeKey),
  );
}

describe("South Dakota Seeds — Sioux Falls and Rapid City", () => {
  describe("Sioux Falls, SD (Building Services)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of siouxFallsSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(siouxFallsSeed.permitPages).toHaveLength(3);
      for (const page of siouxFallsSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: siouxFallsSeed.sources.length,
          feeRuleCount: activeRules(siouxFallsSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to South Dakota with Minnehaha County, and cites three primary sources", () => {
      expect(siouxFallsSeed.state).toMatchObject({ code: "SD", fipsCode: "46" });
      expect(siouxFallsSeed.county).toMatchObject({ name: "Minnehaha County", fipsCode: "46099" });
      expect(siouxFallsSeed.jurisdiction.officialName).toContain("Building Services");
      expect(siouxFallsSeed.sources.map((s) => s.key)).toEqual([
        "sioux-falls-fee-schedule-2026",
        "sioux-falls-code-ch150",
        "sioux-falls-mep-permit-fees-2026",
      ]);
      for (const source of siouxFallsSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(siouxFallsSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the commercial worked example — Table 1-B band 5 plus the 25% plan review", () => {
      const result = computeExample(siouxFallsSeed, "building");
      // $450,000: band 5 base $639.50 + 350 × $3.50 = $1,864.50; plan review 25% = $466.13.
      expect(result!.totalCents).toBe(233_063);
      expect(result!.components.find((c) => c.code === "BLD-COM-5")?.amountCents).toBe(186_450);
      expect(result!.components.find((c) => c.code === "BLD-PLAN-REVIEW-25")?.amountCents).toBe(
        46_613,
      );
    });

    it("reproduces the electrical and plumbing worked examples on the common MEP ladder", () => {
      // Electrical $60,000: band 4 base $291.25 + 10 × $4.50 = $336.25.
      const elec = computeExample(siouxFallsSeed, "electrical");
      expect(elec!.totalCents).toBe(33_625);
      expect(elec!.components.find((c) => c.code === "ELEC-MEP-4")?.amountCents).toBe(33_625);

      // Plumbing $18,000: band 2 base $40.00 + 13 × $6.00 = $118.00.
      const pl = computeExample(siouxFallsSeed, "plumbing");
      expect(pl!.totalCents).toBe(11_800);
      expect(pl!.components.find((c) => c.code === "PL-MEP-2")?.amountCents).toBe(11_800);
    });

    it("keeps the residential and commercial ladders mutually exclusive and chained at the seams", () => {
      const rules = activeRules(siouxFallsSeed, "building");

      // Commercial seam at $25,000: band 2 ends at $45 + 23 × $9.00 = $252.00...
      const atSeam = compute(siouxFallsSeed, "building", {
        valuationCents: 2_500_000,
        occupancy: "commercial",
      });
      expect(atSeam.components.find((c) => c.code === "BLD-COM-2")?.amountCents).toBe(25_200);
      expect(atSeam.components.find((c) => c.code === "BLD-COM-3")).toBeUndefined();

      // ...and one cent over starts band 3 with a $6.50 fraction step.
      const pastSeam = compute(siouxFallsSeed, "building", {
        valuationCents: 2_500_001,
        occupancy: "commercial",
      });
      expect(pastSeam.components.find((c) => c.code === "BLD-COM-3")?.amountCents).toBe(
        25_200 + 650,
      );

      // Occupancy gates: $100,000 residential hits band 4 ($433.00 base).
      const res = compute(siouxFallsSeed, "building", {
        valuationCents: 10_000_000,
        occupancy: "residential",
      });
      expect(res.components.find((c) => c.code === "BLD-RES-4")?.amountCents).toBe(43_300);
      expect(res.components.find((c) => c.code === "BLD-COM-4")).toBeUndefined();
    });

    it("charges the $40 flat bands without steps and gates plan review above the $2,000 seam", () => {
      const rules = activeRules(siouxFallsSeed, "building");

      const flat = compute(siouxFallsSeed, "building", {
        valuationCents: 200_000,
        occupancy: "commercial",
      });
      expect(flat.components.find((c) => c.code === "BLD-COM-1")?.amountCents).toBe(4_000);
      // The flat band is a permit-only tier: no plan review below the $2,000 seam.
      expect(flat.components.find((c) => c.code === "BLD-PLAN-REVIEW-25")).toBeUndefined();

      const past = compute(siouxFallsSeed, "building", {
        valuationCents: 200_001,
        occupancy: "commercial",
      });
      expect(past.components.find((c) => c.code === "BLD-COM-2")?.amountCents).toBe(4_500 + 900);
      expect(past.components.find((c) => c.code === "BLD-PLAN-REVIEW-25")?.amountCents).toBe(
        1_350,
      );
    });

    it("documents the residential band-1/band-2 seam that does not chain", () => {
      // $4,000 exactly: the $40 flat band. $4,000.01: band 2's base coverage point
      // is $2,000, so the fee is $32.50 + 3 × $6.00 = $50.50 — the printed jump
      // the research file records (the one seam that does not chain).
      const atFlat = compute(siouxFallsSeed, "building", {
        valuationCents: 400_000,
        occupancy: "residential",
      });
      expect(atFlat.components.find((c) => c.code === "BLD-RES-1")?.amountCents).toBe(4_000);

      const past = compute(siouxFallsSeed, "building", {
        valuationCents: 400_001,
        occupancy: "residential",
      });
      expect(past.components.find((c) => c.code === "BLD-RES-2")?.amountCents).toBe(5_050);
    });

    it("keeps the MEP ladder seams chained and identical across both trades", () => {
      const elecRules = activeRules(siouxFallsSeed, "electrical");
      const plRules = activeRules(siouxFallsSeed, "plumbing");

      // $5,000 exactly: the $40 flat band.
      const flat = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 500_000, occupancy: "commercial" } as CalculationInput,
        elecRules,
      );
      expect(flat.components.find((c) => c.code === "ELEC-MEP-1")?.amountCents).toBe(4_000);

      // One cent over: band 2's first fraction step ($40 + $6 = $46).
      const past = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 500_001, occupancy: "commercial" } as CalculationInput,
        elecRules,
      );
      expect(past.components.find((c) => c.code === "ELEC-MEP-2")?.amountCents).toBe(4_600);

      // Band 2's ceiling: $40 + 20 × $6.00 = $160.00, band 3's base.
      const atCeiling = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_500_000, occupancy: "commercial" } as CalculationInput,
        elecRules,
      );
      expect(atCeiling.components.find((c) => c.code === "ELEC-MEP-2")?.amountCents).toBe(16_000);

      // Plumbing's rules are the same amounts — band 5 at $250,000 = $1,153.75.
      const pl = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 25_000_000, occupancy: "commercial" } as CalculationInput,
        plRules,
      );
      expect(pl.components.find((c) => c.code === "PL-MEP-5")?.amountCents).toBe(115_375);
    });
  });

  describe("Rapid City, SD (Building Services)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of rapidCitySeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(rapidCitySeed.permitPages).toHaveLength(3);
      for (const page of rapidCitySeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: rapidCitySeed.sources.length,
          feeRuleCount: activeRules(rapidCitySeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to South Dakota with Pennington County, and cites both the tables and the code", () => {
      expect(rapidCitySeed.state).toMatchObject({ code: "SD", fipsCode: "46" });
      expect(rapidCitySeed.county).toMatchObject({ name: "Pennington County", fipsCode: "46103" });
      expect(rapidCitySeed.jurisdiction.officialName).toContain("Building Services");
      expect(rapidCitySeed.sources.map((s) => s.key)).toEqual([
        "rapid-city-fee-tables-100a-100c",
        "rapid-city-rcmc-15-04",
      ]);
      for (const source of rapidCitySeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(rapidCitySeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the residential worked example — Table 100-A band 6 plus the 10% plan review", () => {
      const result = computeExample(rapidCitySeed, "building");
      // $320,000: band 6 base $639.50 + 220 × $3.50 = $1,409.50; plan review 10% = $140.95.
      expect(result!.totalCents).toBe(155_045);
      expect(result!.components.find((c) => c.code === "BLD-RES-6")?.amountCents).toBe(140_950);
      expect(
        result!.components.find((c) => c.code === "BLD-PLAN-REVIEW-RES-10")?.amountCents,
      ).toBe(14_095);
    });

    it("reproduces the trade-scale worked examples through Table 100-C", () => {
      // $18,000 declared valuation: band 3 base $69.25 + 16 × $14.00 = $293.25.
      for (const permitTypeKey of ["electrical", "plumbing"]) {
        const result = computeExample(rapidCitySeed, permitTypeKey);
        expect(result!.totalCents).toBe(29_325);
        expect(
          result!.components.find((c) => c.code.startsWith(permitTypeKey === "electrical" ? "ELEC-RC" : "PL-RC"))?.amountCents,
        ).toBe(29_325);
      }
    });

    it("applies the two plan-review percentages by occupancy", () => {
      const rules = activeRules(rapidCitySeed, "building");

      const res = compute(rapidCitySeed, "building", {
        valuationCents: 6_000_000,
        occupancy: "residential",
      });
      const com = compute(rapidCitySeed, "building", {
        valuationCents: 6_000_000,
        occupancy: "commercial",
      });
      // Same $60,000 valuation: residential band 4 is $414.50 + 10 × $4.50 = $459.50,
      // so plan review is 10% of $459.50 = $45.95; commercial band 5 is $713.75 with 50% = $356.88.
      expect(res.components.find((c) => c.code === "BLD-PLAN-REVIEW-RES-10")?.amountCents).toBe(
        4_595,
      );
      expect(res.components.find((c) => c.code === "BLD-PLAN-REVIEW-COM-50")).toBeUndefined();
      expect(com.components.find((c) => c.code === "BLD-PLAN-REVIEW-COM-50")?.amountCents).toBe(
        35_688,
      );
      expect(com.components.find((c) => c.code === "BLD-PLAN-REVIEW-RES-10")).toBeUndefined();
    });

    it("keeps the Table 100-C bands mutually exclusive and chained at the seams", () => {
      const rules = activeRules(rapidCitySeed, "building");

      // $25,000 exactly: band 3 base $69.25 + 23 × $14.00 = $391.25.
      const atSeam = compute(rapidCitySeed, "building", {
        valuationCents: 2_500_000,
        occupancy: "commercial",
      });
      expect(atSeam.components.find((c) => c.code === "BLD-COM-3")?.amountCents).toBe(39_125);
      expect(atSeam.components.find((c) => c.code === "BLD-COM-4")).toBeUndefined();

      // One cent over: band 4's first fraction step ($391.25 + $10.10 = $401.35).
      const pastSeam = compute(rapidCitySeed, "building", {
        valuationCents: 2_500_001,
        occupancy: "commercial",
      });
      expect(pastSeam.components.find((c) => c.code === "BLD-COM-4")?.amountCents).toBe(40_135);

      // Top-band handoff: $1,000,000 exactly prices band 7's ceiling, $5,608.75.
      const atTop = compute(rapidCitySeed, "building", {
        valuationCents: 100_000_000,
        occupancy: "commercial",
      });
      expect(atTop.components.find((c) => c.code === "BLD-COM-7")?.amountCents).toBe(560_875);
    });

    it("models the residential $2,000 seam as printed — the one seam that does not chain", () => {
      const rules = activeRules(rapidCitySeed, "building");

      // $2,000 exactly: band 2's sliver value, $37.00 + $2.00 = $39.00.
      const atSeam = compute(rapidCitySeed, "building", {
        valuationCents: 200_000,
        occupancy: "residential",
      });
      expect(atSeam.components.find((c) => c.code === "BLD-RES-2")?.amountCents).toBe(3_900);

      // $2,001: band 3's base coverage point — $45.00 + one fraction step = $54.00.
      // The $6.00 jump at the seam is the printed non-chain the research file records.
      const pastSeam = compute(rapidCitySeed, "building", {
        valuationCents: 200_001,
        occupancy: "residential",
      });
      expect(pastSeam.components.find((c) => c.code === "BLD-RES-3")?.amountCents).toBe(5_400);
    });
  });
});
