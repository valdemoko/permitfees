import { describe, expect, it } from "vitest";

import { billingsSeed } from "@/content/billings";
import { missoulaSeed } from "@/content/missoula";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { isWithinEffectiveWindow } from "@/lib/dates";
import { evaluatePublishability } from "@/lib/editorial";

const AS_OF = "2026-09-26";

/** The active rules a page's worked example computes from, in the engine's shape. */
function activeRules(
  seed: typeof billingsSeed | typeof missoulaSeed,
  permitTypeKey: string,
): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule)
    .filter((rule) => rule.status === "active");
}

function computeExample(seed: typeof billingsSeed | typeof missoulaSeed, permitTypeKey: string) {
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
  seed: typeof billingsSeed | typeof missoulaSeed,
  permitTypeKey: string,
  input: Partial<CalculationInput>,
) {
  return calculatePermitFees(
    { asOf: AS_OF, ...input } as CalculationInput,
    activeRules(seed, permitTypeKey),
  );
}

describe("Montana Seeds — Billings and Missoula", () => {
  describe("Billings, MT (Resolution 26-11315)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of billingsSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(billingsSeed.permitPages).toHaveLength(3);
      for (const page of billingsSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: billingsSeed.sources.length,
          feeRuleCount: activeRules(billingsSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Montana with Yellowstone County and cites the resolution", () => {
      expect(billingsSeed.state).toMatchObject({ code: "MT", fipsCode: "30" });
      expect(billingsSeed.county).toMatchObject({ name: "Yellowstone County", fipsCode: "30111" });
      expect(billingsSeed.sources.map((s) => s.key)).toEqual(["billings-res-26-11315"]);
      for (const source of billingsSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(billingsSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          expect(excluded.reason).toBe("conditions_not_met");
        }
      }
    });

    it("reproduces the commercial worked example — band 6 plus the 60% plan review", () => {
      const result = computeExample(billingsSeed, "building");
      // $650,000: band 6 base $1,529.00 + 150 × $2.00 = $1,829.00; 60% review = $1,097.40.
      expect(result!.totalCents).toBe(292_640);
      expect(result!.components.find((c) => c.code === "BLD-6")?.amountCents).toBe(182_900);
      expect(result!.components.find((c) => c.code === "BLD-PLAN-REVIEW-60")?.amountCents).toBe(
        109_740,
      );
    });

    it("keeps ONE ladder for both occupancies and charges no residential plan review", () => {
      const rules = activeRules(billingsSeed, "building");

      const res = compute(billingsSeed, "building", {
        valuationCents: 65_000_000,
        occupancy: "residential",
        custom: { plan_review: true },
      });
      expect(res.components.find((c) => c.code === "BLD-6")?.amountCents).toBe(182_900);
      expect(res.components.find((c) => c.code === "BLD-PLAN-REVIEW-60")).toBeUndefined();
      expect(res.totalCents).toBe(182_900);
    });

    it("keeps the consolidated ladder's bands chained and mutually exclusive", () => {
      const rules = activeRules(billingsSeed, "building");

      // $25,000 exactly: band 2's ceiling $45 + 23 × $8.00 = $229.00.
      const atSeam = compute(billingsSeed, "building", {
        valuationCents: 2_500_000,
        occupancy: "commercial",
      });
      expect(atSeam.components.find((c) => c.code === "BLD-2")?.amountCents).toBe(22_900);
      expect(atSeam.components.find((c) => c.code === "BLD-3")).toBeUndefined();

      // One cent over: band 3's first fraction step ($229 + $5 = $234).
      const pastSeam = compute(billingsSeed, "building", {
        valuationCents: 2_500_001,
        occupancy: "commercial",
      });
      expect(pastSeam.components.find((c) => c.code === "BLD-3")?.amountCents).toBe(23_400);

      // $5,000,000 exactly: band 7's ceiling, $9,529.00.
      const atTop = compute(billingsSeed, "building", {
        valuationCents: 500_000_000,
        occupancy: "residential",
      });
      expect(atTop.components.find((c) => c.code === "BLD-7")?.amountCents).toBe(952_900);
    });

    it("prices residential electrical flats by service size and multi-family by building + unit", () => {
      const rules = activeRules(billingsSeed, "electrical");

      const sfd = compute(billingsSeed, "electrical", {
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(sfd.totalCents).toBe(13_000);

      const sfdLarge = compute(billingsSeed, "electrical", {
        occupancy: "residential",
        workType: "new_construction",
        custom: { dsf: true },
      });
      expect(sfdLarge.totalCents).toBe(20_000);

      // 12 units: $100 per building + 12 × $40 = $580.00 — the § 2.K cap.
      const mf12 = compute(billingsSeed, "electrical", {
        occupancy: "residential",
        units: 12,
        custom: { mf_per_building: true },
      });
      expect(mf12.totalCents).toBe(58_000);

      // 13 units: the per-unit row stands down (commercial ladder is § 2.K's own remedy).
      const mf13 = compute(billingsSeed, "electrical", {
        occupancy: "residential",
        units: 13,
        custom: { mf_per_building: true },
      });
      expect(mf13.totalCents).toBe(10_000);
    });

    it("keeps the commercial electrical ladder's seams chained exactly", () => {
      const rules = activeRules(billingsSeed, "electrical");

      // $1,000 exactly: $30 + 6% × $500 = $60.00.
      const at1k = compute(billingsSeed, "electrical", {
        valuationCents: 100_000,
        occupancy: "commercial",
      });
      expect(at1k.components.find((c) => c.code === "ELEC-COM-2")?.amountCents).toBe(6_000);
      expect(at1k.components.find((c) => c.code === "ELEC-COM-3")).toBeUndefined();

      // $10,000 exactly: $60 + 2% × $9,000 = $240.00.
      const at10k = compute(billingsSeed, "electrical", {
        valuationCents: 1_000_000,
        occupancy: "commercial",
      });
      expect(at10k.components.find((c) => c.code === "ELEC-COM-3")?.amountCents).toBe(24_000);

      // $50,000 exactly: $240 + 0.5% × $40,000 = $440.00.
      const at50k = compute(billingsSeed, "electrical", {
        valuationCents: 5_000_000,
        occupancy: "commercial",
      });
      expect(at50k.components.find((c) => c.code === "ELEC-COM-4")?.amountCents).toBe(44_000);

      // $60,000: $440 + 0.3% × $10,000 = $470.00.
      const at60k = compute(billingsSeed, "electrical", {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      });
      expect(at60k.totalCents).toBe(47_000);
    });

    it("reproduces the plumbing worked example — issuance plus unit rows", () => {
      const result = computeExample(billingsSeed, "plumbing");
      // $20 issuance + 12 × $15 + $7 sewer + 3 × $5 WH + 2 × $7 backflow = $236.00.
      expect(result!.totalCents).toBe(23_600);
      expect(result!.components.find((c) => c.code === "PL-ISSUANCE")?.amountCents).toBe(2_000);
      expect(result!.components.find((c) => c.code === "PL-FIXTURES")?.amountCents).toBe(18_000);
    });
  });

  describe("Missoula, MT (Resolution 8887 FY2026 schedule)", () => {
    it("validates all fee rules through engine schema", () => {
      for (const entry of missoulaSeed.feeRules) {
        const validation = validateFeeRule(entry.rule);
        expect(
          validation.ok,
          `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
        ).toBe(true);
      }
    });

    it("has 3 published permit pages passing the editorial gate", () => {
      expect(missoulaSeed.permitPages).toHaveLength(3);
      for (const page of missoulaSeed.permitPages) {
        expect(page.publishStatus).toBe("published");
        expect(page.noindex).toBe(false);
        const evalResult = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: missoulaSeed.sources.length,
          feeRuleCount: activeRules(missoulaSeed, page.permitTypeKey).length,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf: AS_OF,
        });
        expect(evalResult.publishable, `${page.slug}: ${evalResult.failures.join("; ")}`).toBe(
          true,
        );
      }
    });

    it("is tied to Montana with Missoula County and cites all three instruments", () => {
      expect(missoulaSeed.state).toMatchObject({ code: "MT", fipsCode: "30" });
      expect(missoulaSeed.county).toMatchObject({ name: "Missoula County", fipsCode: "30063" });
      expect(missoulaSeed.sources.map((s) => s.key)).toEqual([
        "missoula-res-8887-fy26-schedule",
        "missoula-res-8970",
        "missoula-valuation-plan-review-packet",
      ]);
      for (const source of missoulaSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(source.lastVerifiedAt).not.toBeNull();
      }
    });

    it("computes every published worked example above zero with no invalid exclusions", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = computeExample(missoulaSeed, permitTypeKey);
        expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
        expect(result!.components.length).toBeGreaterThan(0);
        expect(result!.totalCents).toBeGreaterThan(0);
        for (const excluded of result!.excluded) {
          // Missoula carries both generations: the FY2026 rules exclude the
          // FY2027 successors with `not_effective` (they open 2026-10-01,
          // after this pass's date); everything else excludes on conditions.
          expect(["conditions_not_met", "not_effective"]).toContain(excluded.reason);
        }
      }
    });

    it("reproduces the commercial worked example — wide band 2 plus the 30% plan review", () => {
      const result = computeExample(missoulaSeed, "building");
      // $650,000: $6,563 + 150 × $7.82 = $7,736.00; 30% review = $2,320.80.
      expect(result!.totalCents).toBe(1_005_680);
      expect(result!.components.find((c) => c.code === "BLD-WIDE-2")?.amountCents).toBe(773_600);
      expect(result!.components.find((c) => c.code === "BLD-PLAN-REVIEW-30")?.amountCents).toBe(
        232_080,
      );
    });

    it("reproduces the residential wide-band and the flat rows of the printed grid", () => {
      // $400,000: $1,869 + 300 × $11.73 = $5,388.00 (+ 30% review in the worked example = $7,004.40).
      const wide = computeExample(missoulaSeed, "building");
      expect(wide).not.toBeNull();

      const res400 = compute(missoulaSeed, "building", {
        valuationCents: 40_000_000,
        occupancy: "residential",
      });
      expect(res400.components.find((c) => c.code === "BLD-WIDE-1")?.amountCents).toBe(538_800);

      // The grid's flat rows: $500 → $43, $1,000 → $75, $51,000 → $1,225.
      const at500 = compute(missoulaSeed, "building", { valuationCents: 50_000, occupancy: "residential" });
      expect(at500.totalCents).toBe(4_300);
      const at1k = compute(missoulaSeed, "building", { valuationCents: 200_000, occupancy: "residential" });
      expect(at1k.totalCents).toBe(7_500);
      const at51k = compute(missoulaSeed, "building", { valuationCents: 10_000_000, occupancy: "commercial" });
      expect(at51k.totalCents).toBe(122_500);
    });

    it("hands the schedule to Resolution 8970 on 2026-10-01 with no unpriced day", () => {
      let fy26 = 0;
      let fy27 = 0;
      for (const entry of missoulaSeed.feeRules) {
        const { effectiveFrom, effectiveTo } = entry.rule;
        // Exactly one side of the handover: every rule is either in force on
        // September 30 (FY2026, window closes 2026-10-01 half-open) or on
        // October 1 (FY2027 successors, open-ended) — never both, never neither.
        const onSep30 = isWithinEffectiveWindow("2026-09-30", effectiveFrom, effectiveTo);
        const onOct1 = isWithinEffectiveWindow("2026-10-01", effectiveFrom, effectiveTo);
        expect(onSep30, entry.rule.id).not.toBe(onOct1);
        if (onSep30) {
          fy26 += 1;
          expect(effectiveFrom, entry.rule.id).toBe("2026-01-01");
          expect(effectiveTo, entry.rule.id).toBe("2026-10-01");
        } else {
          fy27 += 1;
          expect(effectiveFrom, entry.rule.id).toBe("2026-10-01");
          expect(effectiveTo, entry.rule.id).toBeNull();
        }
      }
      expect(fy26).toBeGreaterThan(0);
      expect(fy27).toBeGreaterThan(0);
    });

    it("keys the residential electrical flats on dwelling type without overlap", () => {
      const rules = activeRules(missoulaSeed, "electrical");

      // Single-family: $361; duplex: $501; 3-unit multi-family: $278 + 3 × $58.
      const sfd = compute(missoulaSeed, "electrical", {
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(sfd.totalCents).toBe(36_100);

      const duplex = compute(missoulaSeed, "electrical", {
        occupancy: "residential",
        custom: { duplex: true },
      });
      expect(duplex.totalCents).toBe(50_100);

      const mf3 = compute(missoulaSeed, "electrical", {
        occupancy: "residential",
        workType: "new_construction",
        units: 3,
      });
      expect(mf3.components.find((c) => c.code === "ELEC-MF")?.amountCents).toBe(27_800);
      expect(mf3.components.find((c) => c.code === "ELEC-MF-UNIT")?.amountCents).toBe(17_400);
      expect(mf3.components.find((c) => c.code === "ELEC-SFD-100-300A")).toBeUndefined();

      // 13 units: the schedule's own instruction sends the project to § 7.
      const mf13 = compute(missoulaSeed, "electrical", {
        occupancy: "residential",
        workType: "new_construction",
        units: 13,
      });
      expect(mf13.components.find((c) => c.code === "ELEC-MF")).toBeUndefined();
    });

    it("prices the commercial electrical ladder with its printed non-chaining bases", () => {
      const rules = activeRules(missoulaSeed, "electrical");

      // Band bases as printed: $84, $167, $667, $1,229 — gaps at the seams are the
      // printed schedule's own arithmetic (research file, discrepancy 3).
      const at500 = compute(missoulaSeed, "electrical", { valuationCents: 50_000, occupancy: "commercial" });
      expect(at500.totalCents).toBe(8_400);
      const at60k = compute(missoulaSeed, "electrical", {
        valuationCents: 6_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      });
      expect(at60k.totalCents).toBe(152_900);
    });

    it("reproduces the plumbing worked example — issuance plus fixture, heater and gray-water rows", () => {
      const result = computeExample(missoulaSeed, "plumbing");
      // $43 + 12 × $16 + $16 WH + $100 gray water = $351.00.
      expect(result!.totalCents).toBe(35_100);
      expect(result!.components.find((c) => c.code === "PL-ISSUANCE")?.amountCents).toBe(4_300);
      expect(result!.components.find((c) => c.code === "PL-FIXTURES")?.amountCents).toBe(19_200);
    });
  });
});
