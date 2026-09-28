import { describe, expect, it } from "vitest";

import { cedarRapidsSeed } from "@/content/cedarrapids";
import { desMoinesSeed } from "@/content/desmoines";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's shape. */
function activeRules(seed: typeof desMoinesSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof desMoinesSeed, permitTypeKey: string) {
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

describe("Iowa Seeds — Des Moines and Cedar Rapids", () => {
  describe("Des Moines, IA (Permit and Development Center)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of desMoinesSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(desMoinesSeed.permitPages).toHaveLength(3);
      for (const page of desMoinesSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: desMoinesSeed.sources.length,
          feeRuleCount: activeRules(desMoinesSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Iowa with the correct county", () => {
      expect(desMoinesSeed.state).toMatchObject({ code: "IA", fipsCode: "19" });
      expect(desMoinesSeed.county).toMatchObject({ name: "Polk County", fipsCode: "19153" });
      expect(desMoinesSeed.jurisdiction.officialName).toContain("Permit and Development Center");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(desMoinesSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("prices the commercial valuation ladder with whole-$1,000 round-ups", () => {
      const result = computeExample(desMoinesSeed, "building");
      // $52,500: band 3 base $465.00 + 3 steps × $6.44 = $484.32; plan check 65% = $314.81.
      expect(result!.totalCents).toBe(79_913);
      const band = result!.components.find((c) => c.code === "BLD-COMM-BAND-3");
      expect(band?.amountCents).toBe(48_432);
      const planCheck = result!.components.find((c) => c.code === "BLD-PLAN-CHECK-65");
      expect(planCheck?.amountCents).toBe(31_481);
    });

    it("keeps the commercial bands mutually exclusive and charges the flat row under $2,000", () => {
      const rules = activeRules(desMoinesSeed, "building");
      const under2k = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 150_000, occupancy: "commercial" },
        rules,
      );
      // $1,500 of valuation pays the $64.38 flat AND the 65% plan check — the
      // schedule's own words make the plan check apply to any building valued
      // over $1,000, including a $1,500 job: 0.65 × $64.38 = $41.85.
      expect(under2k.components.map((c) => c.code)).toEqual([
        "BLD-COMM-UNDER-2K",
        "BLD-PLAN-CHECK-65",
      ]);
      expect(under2k.components.find((c) => c.code === "BLD-PLAN-CHECK-65")?.amountCents).toBe(
        4_185,
      );

      // The seam: $25,000 exactly pays band 1 with twenty-three whole steps over $2,000,
      // plus the 65% plan check (valuation above $1,000).
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_500_000, occupancy: "commercial" },
        rules,
      );
      expect(atSeam.components.find((c) => c.code === "BLD-COMM-BAND-1")?.amountCents).toBe(
        6_438 + 23 * 906,
      );
      expect(atSeam.components.find((c) => c.code === "BLD-COMM-BAND-2")).toBeUndefined();

      const pastSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 2_500_001, occupancy: "commercial" },
        rules,
      );
      // One cent of valuation above the seam rounds up to a whole $7.75 step in band 2.
      expect(pastSeam.components.find((c) => c.code === "BLD-COMM-BAND-1")).toBeUndefined();
      expect(pastSeam.components.find((c) => c.code === "BLD-COMM-BAND-2")?.amountCents).toBe(
        27_188 + 775,
      );
    });

    it("prices residential building by flat area rows, never by valuation", () => {
      const rules = activeRules(desMoinesSeed, "building");
      const small = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          squareFootage: 1_100,
          custom: { dwelling_type: "single_family" },
        },
        rules,
      );
      expect(small.totalCents).toBe(105_000);

      const large = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          squareFootage: 2_400,
          custom: { dwelling_type: "single_family" },
        },
        rules,
      );
      expect(large.totalCents).toBe(175_000);

      const addition = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", workType: "addition", valuationCents: 9_000_000 },
        rules,
      );
      expect(addition.totalCents).toBe(25_000);
    });

    it("prices commercial electrical as base plus circuit, opening and appliance rows", () => {
      const result = computeExample(desMoinesSeed, "electrical");
      // $75 base + $40 (first ten) + $40 (twenty more) + $14.40 openings + $26 appliances.
      expect(result!.totalCents).toBe(19_540);
      expect(
        result!.components.find((c) => c.code === "ELEC-COMM-CIRCUITS-BLOCK")?.amountCents,
      ).toBe(4_000);
      expect(result!.components.find((c) => c.code === "ELEC-COMM-CIRCUITS-2")?.amountCents).toBe(
        4_000,
      );
      expect(result!.components.find((c) => c.code === "ELEC-COMM-OPENINGS")?.amountCents).toBe(
        1_440,
      );
      expect(result!.components.find((c) => c.code === "ELEC-COMM-APPLIANCES")?.amountCents).toBe(
        2_600,
      );

      // Ten or fewer circuits price per circuit with no block row.
      const small = calculatePermitFees(
        { asOf: AS_OF, occupancy: "commercial", custom: { circuits: 6 } },
        activeRules(desMoinesSeed, "electrical"),
      );
      expect(small.components.find((c) => c.code === "ELEC-COMM-CIRCUITS")?.amountCents).toBe(
        2_400,
      );
      expect(small.components.find((c) => c.code === "ELEC-COMM-CIRCUITS-BLOCK")).toBeUndefined();
    });

    it("charges residential electrical and plumbing flats", () => {
      const rules = activeRules(desMoinesSeed, "electrical");
      const newDwelling = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", workType: "new_construction" },
        rules,
      );
      expect(newDwelling.totalCents).toBe(22_500);

      const plRules = activeRules(desMoinesSeed, "plumbing");
      const plNew = calculatePermitFees(
        { asOf: AS_OF, occupancy: "residential", workType: "new_construction" },
        plRules,
      );
      expect(plNew.totalCents).toBe(20_000);

      const servicesOnly = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          custom: { services_only: true },
        },
        plRules,
      );
      expect(servicesOnly.totalCents).toBe(7_500);
    });

    it("rounds private sewer runs up to whole 100-foot blocks", () => {
      const rules = activeRules(desMoinesSeed, "plumbing");
      const result = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "commercial",
          fixtures: 24,
          custom: {
            connections: 1,
            water_service_connections: 1,
            grease_interceptors: 1,
            linear_feet: 210,
          },
        },
        rules,
      );
      // $75 base + 24×$7.50 + $7.50 + $7.50 + $20 + 3 blocks × $10 = $320.00.
      expect(result.totalCents).toBe(32_000);
      expect(result.components.find((c) => c.code === "PL-COMM-PRIVATE-SEWER")?.amountCents).toBe(
        3_000,
      );
    });

    it("carries primary sources with verification dates, and the superseded sheet is not primary", () => {
      const primary = desMoinesSeed.sources.filter((s) => s.isPrimary);
      expect(primary.length).toBeGreaterThan(0);
      for (const source of desMoinesSeed.sources) {
        expect(source.lastVerifiedAt).not.toBeNull();
      }
      expect(
        desMoinesSeed.sources.find((s) => s.key === "dsm-building-division-fee-schedule-2025")
          ?.isPrimary,
      ).toBe(false);
    });
  });

  describe("Cedar Rapids, IA (Building Services)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of cedarRapidsSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(cedarRapidsSeed.permitPages).toHaveLength(3);
      for (const page of cedarRapidsSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: cedarRapidsSeed.sources.length,
          feeRuleCount: activeRules(cedarRapidsSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Iowa and Linn County, and cites the resolution as its primary source", () => {
      expect(cedarRapidsSeed.state).toMatchObject({ code: "IA", fipsCode: "19" });
      expect(cedarRapidsSeed.county).toMatchObject({ name: "Linn County", fipsCode: "19113" });
      const source = cedarRapidsSeed.sources[0]!;
      expect(source.isPrimary).toBe(true);
      expect(source.sourceType).toBe("ordinance");
      expect(source.effectiveFrom).toBe("2025-01-01");
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(cedarRapidsSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the apartment-building worked example — Table A, admin fee, 40% plan check", () => {
      const result = computeExample(cedarRapidsSeed, "building");
      // $150,000 residential: $671.48 + 50 × $3.68 = $855.48; + $20 admin; + 40% = $342.19.
      expect(result!.totalCents).toBe(121_767);
      expect(result!.components.find((c) => c.code === "BLD-RES-TABLE-A-1")?.amountCents).toBe(
        85_548,
      );
      expect(result!.components.find((c) => c.code === "ADMIN-FEE")?.amountCents).toBe(2_000);
      expect(result!.components.find((c) => c.code === "BLD-PLAN-CHECK-40")?.amountCents).toBe(
        34_219,
      );
    });

    it("prices new dwellings from the flat area table with the trades bundled and no admin fee", () => {
      const rules = activeRules(cedarRapidsSeed, "building");
      const dwelling = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          squareFootage: 1_500,
          custom: { dwelling_type: "single_family", res_new_bundled: true },
        },
        rules,
      );
      expect(dwelling.components.map((c) => c.code)).toEqual(["BLD-RES-NEW-AREA"]);
      expect(dwelling.totalCents).toBe(140_000);
    });

    it("charges Table A by class and keeps the bands mutually exclusive", () => {
      const rules = activeRules(cedarRapidsSeed, "building");
      const residential = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 60_000_000, occupancy: "residential" },
        rules,
      );
      // $600,000: band 2 answers — $2,141.48 + 100 × $3.15 = $2,456.48 — and band 1,
      // whose ceiling is $500,000, stays out. The $20 admin fee rides on top.
      expect(residential.components.find((c) => c.code === "BLD-RES-TABLE-A-2")?.amountCents).toBe(
        245_648,
      );
      expect(
        residential.components.find((c) => c.code === "BLD-RES-TABLE-A-1"),
      ).toBeUndefined();

      const commercial = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 60_000_000, occupancy: "commercial" },
        rules,
      );
      // Commercial band 2: $3,147.90 + 100 × $4.62 = $3,609.90.
      expect(
        commercial.components.find((c) => c.code === "BLD-COMM-TABLE-A-2")?.amountCents,
      ).toBe(360_990);
    });

    it("does not charge the 40% plan check to an R-3 dwelling", () => {
      const rules = activeRules(cedarRapidsSeed, "building");
      const dwelling = calculatePermitFees(
        {
          asOf: AS_OF,
          valuationCents: 15_000_000,
          occupancy: "residential",
          custom: { res_new_bundled: false },
        },
        rules,
      );
      expect(dwelling.components.find((c) => c.code === "BLD-PLAN-CHECK-40")).toBeUndefined();
    });

    it("reproduces the Section B trade ladders", () => {
      const electrical = computeExample(cedarRapidsSeed, "electrical");
      // $40,000 contract price: $25 + 1% × $39,000 = $415.00.
      expect(electrical!.totalCents).toBe(41_500);

      const plumbing = computeExample(cedarRapidsSeed, "plumbing");
      // $120,000 contract price: $1,015 + 0.9% × $20,000 = $1,195.00.
      expect(plumbing!.totalCents).toBe(119_500);
    });

    it("stands Section B down when the trade is declared bundled", () => {
      const rules = activeRules(cedarRapidsSeed, "electrical");
      const bundled = calculatePermitFees(
        {
          asOf: AS_OF,
          valuationCents: 4_000_000,
          occupancy: "commercial",
          custom: { trade_bundled: true },
        },
        rules,
      );
      expect(bundled.totalCents).toBe(0);
    });

    it("chains the Section B ladder exactly at the $100,000 seam", () => {
      const rules = activeRules(cedarRapidsSeed, "electrical");
      const atSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_000_000, occupancy: "commercial" },
        rules,
      );
      // $25 + 1% × $99,000 = $1,015.00 — the printed base of the band above.
      expect(atSeam.totalCents).toBe(101_500);

      const pastSeam = calculatePermitFees(
        { asOf: AS_OF, valuationCents: 10_000_001, occupancy: "commercial" },
        rules,
      );
      // $1,015.00 base + 0.9% × $0.01 — a tenth of a cent, rounded to the cent: $1,015.00.
      expect(pastSeam.totalCents).toBe(101_500);
    });

    it("charges Section A flats and stands them down on bundled new dwellings", () => {
      const rules = activeRules(cedarRapidsSeed, "plumbing");
      const appliance = calculatePermitFees(
        { asOf: AS_OF, custom: { scope: "appliance_replacement" } },
        rules,
      );
      expect(appliance.totalCents).toBe(7_500);

      const bundled = calculatePermitFees(
        {
          asOf: AS_OF,
          occupancy: "residential",
          workType: "new_construction",
          custom: { res_new_bundled: true },
        },
        rules,
      );
      expect(bundled.totalCents).toBe(0);
    });

    it("carries only official primary sources with verification dates", () => {
      for (const source of cedarRapidsSeed.sources) {
        expect(source.lastVerifiedAt).not.toBeNull();
        expect(source.url).toMatch(/^https:/);
      }
    });
  });
});
