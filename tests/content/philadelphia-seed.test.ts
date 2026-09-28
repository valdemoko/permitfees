import { describe, expect, it } from "vitest";

import { philadelphiaSeed } from "@/content/philadelphia";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Pennsylvania, pass 13.
 *
 * Philadelphia is the first jurisdiction whose whole fee stack turns on a
 * *credit* rather than a rate: the filing fee is nonrefundable and applied
 * toward the final permit fee, so it is modelled as a floor on `permit_fee`
 * charged as the shortfall — in three permits, on two occupancy columns for
 * building. The tests below pin the four things that structure turns on: the
 * square-footage band with its "or fraction thereof", the flat residential
 * column against it, the electrical ladder's published minimum *and* published
 * maximum, and the plumbing fixture blocks with the filing floor binding on the
 * small repair rows.
 */

const AS_OF = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return philadelphiaSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

describe("Philadelphia seed", () => {
  it("validates all fee rules through the engine schema", () => {
    for (const entry of philadelphiaSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("has 29 rules across the three permits Philadelphia publishes", () => {
    expect(philadelphiaSeed.feeRules).toHaveLength(29);
    expect(rulesFor("building")).toHaveLength(12);
    expect(rulesFor("electrical")).toHaveLength(5);
    expect(rulesFor("plumbing")).toHaveLength(12);
  });

  it("keeps every rule code unique inside a permit type", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("has 3 published permit pages that clear the editorial gate", () => {
    expect(philadelphiaSeed.permitPages).toHaveLength(3);
    for (const page of philadelphiaSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const result = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: philadelphiaSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(result.publishable, `${page.slug}: ${result.failures.join(" ")}`).toBe(true);
      expect(result.indexable).toBe(true);
    }
  });

  it("gives every page between four and six FAQs that cite a source", () => {
    for (const page of philadelphiaSeed.permitPages) {
      const faqs = page.faqs ?? [];
      expect(faqs.length, page.slug).toBeGreaterThanOrEqual(4);
      expect(faqs.length, page.slug).toBeLessThanOrEqual(6);
      for (const faq of faqs) {
        expect(faq.sourceId, `${page.slug}: ${faq.question}`).toBeTruthy();
      }
    }
  });

  it("verifies every source and the fee schedule on the research date", () => {
    expect(philadelphiaSeed.sources.length).toBeGreaterThanOrEqual(6);
    for (const source of philadelphiaSeed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).toBe("2026-09-25");
      expect(source.retrievedAt, source.key).toBe("2026-09-25");
    }

    const keys = philadelphiaSeed.sources.map((source) => source.key);
    const urls = philadelphiaSeed.sources.map((source) => source.url);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(urls).size).toBe(urls.length);

    expect(philadelphiaSeed.feeSchedules).toHaveLength(1);
    expect(philadelphiaSeed.feeSchedules[0]?.status).toBe("active");
    expect(philadelphiaSeed.feeSchedules[0]?.effectiveFrom).toBe("2025-01-01");
    expect(philadelphiaSeed.feeSchedules[0]?.lastVerifiedAt).toBe("2026-09-25");
  });

  it("records verifications for the profile, every page, the schedule and the sources", () => {
    const types = new Set(philadelphiaSeed.verifications.map((entry) => entry.entityType));
    expect(types).toContain("jurisdiction_profile");
    expect(types).toContain("permit_page");
    expect(types).toContain("fee_schedule");
    expect(types).toContain("source");
    expect(types).toContain("fee_rule");

    for (const page of philadelphiaSeed.permitPages) {
      const record = philadelphiaSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.verifiedAt).toBe("2026-09-25");
    }

    // The City's plumbing page mislabels its alteration rows; the amounts are
    // certain (PG_012 and L&I's regulation agree) so the status is needs_review
    // rather than disputed, and it is the only such record in this payload.
    const needsReview = philadelphiaSeed.verifications.filter(
      (entry) => entry.status === "needs_review",
    );
    expect(needsReview.map((entry) => entry.entityKey)).toEqual(["PLUMB-ALTERATION"]);
    expect(
      philadelphiaSeed.verifications.filter((entry) => entry.status === "disputed"),
    ).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Building — PG_012 page 1, §4-A-902.2                                   */
  /* ---------------------------------------------------------------------- */

  it("prices a new house from the flat residential row, plus surcharges", () => {
    const input: CalculationInput = {
      asOf: AS_OF,
      squareFootage: 2_400,
      workType: "new_construction",
      custom: { single_or_two_family: true },
    };

    const result = calculatePermitFees(input, rulesFor("building"));

    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-NEW-1-2-FAMILY",
      "BLD-CITY-SURCHARGE",
      "BLD-STATE-SURCHARGE",
    ]);
    // $1,328 flat, whatever the size, plus $3.00 and $4.50. The $25 filing fee
    // is credited against a permit fee that already exceeds it: no shortfall.
    expect(result.totalCents).toBe(133_550);
    expect(result.warnings).toEqual([]);
  });

  it("prices other-occupancy new construction in bands, rounding a part hundred up", () => {
    const band = (squareFootage: number) =>
      calculatePermitFees(
        { asOf: AS_OF, squareFootage, workType: "new_construction" },
        rulesFor("building"),
      );

    const thousand = band(1_000);
    expect(thousand.components.find((c) => c.code === "BLD-NEW-OTHER")?.amountCents).toBe(
      61_800, // $253 + 5 × $73
    );
    expect(thousand.totalCents).toBe(62_550); // + $7.50 of surcharges
    expect(thousand.warnings).toEqual([]);

    // "or fraction thereof": 50 square feet more is a whole additional step.
    const thousandAndFifty = band(1_050);
    expect(thousandAndFifty.components.find((c) => c.code === "BLD-NEW-OTHER")?.amountCents).toBe(
      69_100, // $253 + 6 × $73
    );

    // The residential flag picks a different regime, not a different rate.
    expect(
      thousand.appliedRuleIds,
    ).not.toContain("philadelphia-bld-new-1-2-family");
  });

  it("prices a residential alteration off its own base, $76 rather than $75", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 1_800,
        workType: "alteration",
        custom: { single_or_two_family: true },
      },
      rulesFor("building"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-ALTER-1-2-FAMILY",
      "BLD-CITY-SURCHARGE",
      "BLD-STATE-SURCHARGE",
    ]);
    // $76 + 13 × $56 = $804.00, plus $7.50.
    expect(result.totalCents).toBe(81_150);
    expect(result.warnings).toEqual([]);
  });

  it("charges the 2% alteration election instead of the area row, at its $253 minimum", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        valuationCents: 1_240_000, // $12,400 of construction cost -> 2% is $248
        squareFootage: 1_800,
        workType: "alteration",
        custom: { alteration_by_cost: true },
      },
      rulesFor("building"),
    );

    const election = result.components.find((c) => c.code === "BLD-ALTER-BY-COST");
    expect(election?.amountCents).toBe(25_300); // the published $253 minimum binds
    // The two are alternatives: the area row must not fire alongside it.
    expect(result.appliedRuleIds).not.toContain("philadelphia-bld-alter-other");
    expect(result.appliedRuleIds).not.toContain("philadelphia-bld-alter-1-2-family");
    expect(result.totalCents).toBe(26_050); // + $7.50
  });

  it("moves to the three-tier foundation table and out of every area row", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 1_200,
        workType: "new_construction",
        custom: { foundation_only: true },
      },
      rulesFor("building"),
    );

    const foundation = result.components.find((c) => c.code === "BLD-FOUNDATION-ONLY");
    expect(foundation?.amountCents).toBe(44_200); // the 501–2,500 tier
    expect(result.appliedRuleIds).not.toContain("philadelphia-bld-new-other");
    expect(result.totalCents).toBe(44_950); // + $7.50
    expect(result.warnings).toEqual([]);
  });

  it("charges complete demolition per hundred square feet with the printed floor", () => {
    const cheap = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 400, workType: "demolition" },
      rulesFor("building"),
    );
    // 4 × $25.30 = $101.20 of rate, floored at the schedule's $253.
    expect(cheap.components.find((c) => c.code === "BLD-DEMOLITION")?.amountCents).toBe(25_300);
    expect(cheap.totalCents).toBe(26_050);

    const banded = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 1_500, workType: "demolition" },
      rulesFor("building"),
    );
    // 15 hundreds × $25.30 = $379.50, above the floor.
    expect(banded.components.find((c) => c.code === "BLD-DEMOLITION")?.amountCents).toBe(37_950);
    expect(banded.totalCents).toBe(38_700);
  });

  it("stops demolition at the maximum the schedule itself prints", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 2_100_000, workType: "demolition" },
      rulesFor("building"),
    );

    const demolition = result.components.find((c) => c.code === "BLD-DEMOLITION");
    expect(demolition?.amountCents).toBe(5_060_000); // the printed $50,600 ceiling
    expect(demolition?.steps.some((step) => step.label === "Maximum fee applied")).toBe(true);
  });

  /* ---------------------------------------------------------------------- */
  /* Electrical — PG_012 page 2, §4-A-903.2                                 */
  /* ---------------------------------------------------------------------- */

  it("prices electrical work per $1,000 or fraction, rounding a part thousand up", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 1_240_000 }, // $12,400
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-PERMIT-FEE",
      "ELEC-CITY-SURCHARGE",
      "ELEC-STATE-SURCHARGE",
    ]);
    // Thirteen increments × $25 = $325.00; the $100 filing fee is already
    // below it, so the floor adds nothing. + $7.50 of surcharges.
    expect(result.totalCents).toBe(33_250);
    expect(result.warnings).toEqual([]);
  });

  it("lifts a small electrical permit to the filing fee: $63 minimum, then the shortfall", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 100_000 }, // $1,000 -> $25 of rate
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-PERMIT-FEE",
      "ELEC-FILING-FLOOR",
      "ELEC-CITY-SURCHARGE",
      "ELEC-STATE-SURCHARGE",
    ]);
    // The published $63 minimum governs the permit fee, then the credited
    // $100 filing fee tops it up by $37 — the shortfall, never $100 twice.
    const fee = result.components.find((c) => c.code === "ELEC-PERMIT-FEE");
    expect(fee?.amountCents).toBe(6_300);
    const floor = result.components.find((c) => c.code === "ELEC-FILING-FLOOR");
    expect(floor?.amountCents).toBe(3_700);
    expect(result.totalCents).toBe(10_750); // $100 of permit fee + $7.50
    expect(result.warnings).toEqual([]);
  });

  it("caps electrical work at the published maximum of $18,975", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 80_000_000 }, // $800,000 of estimated cost
      rulesFor("electrical"),
    );

    const fee = result.components.find((c) => c.code === "ELEC-PERMIT-FEE");
    expect(fee?.amountCents).toBe(1_897_500);
    expect(fee?.steps.some((step) => step.label === "Maximum fee applied")).toBe(true);
    // Above the cap the filing floor is irrelevant; only surcharges add on.
    expect(result.totalCents).toBe(1_898_250);
  });

  it("holds the optional rough-in outside the permit fee the floor measures", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 100_000, custom: { rough_in: true } },
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-PERMIT-FEE",
      "ELEC-FILING-FLOOR",
      "ELEC-ROUGH-IN",
      "ELEC-CITY-SURCHARGE",
      "ELEC-STATE-SURCHARGE",
    ]);
    // The floor still measures the permit alone: $63 + $37 = $100, plus the
    // $150 rough-in's own application and the $7.50 of surcharges.
    expect(result.totalCents).toBe(25_750);
  });

  /* ---------------------------------------------------------------------- */
  /* Plumbing — PG_012 pages 3-4, §4-A-905.3                                */
  /* ---------------------------------------------------------------------- */

  it("prices new-construction plumbing in the seven-fixture block", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, workType: "new_construction", fixtures: 10 },
      rulesFor("plumbing"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "PLUMB-NEW-CONSTRUCTION",
      "PLUMB-CITY-SURCHARGE",
      "PLUMB-STATE-SURCHARGE",
    ]);
    // $284 for the first seven + 3 × $25 = $359.00, plus $7.50. The residential
    // $50 exception is written for additions, so a new house stays on this row.
    expect(result.totalCents).toBe(36_650);
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-addition-1-2-family");
    expect(result.warnings).toEqual([]);
  });

  it("prices a residential alteration off the $50 block rather than $189", () => {
    const residential = calculatePermitFees(
      {
        asOf: AS_OF,
        workType: "alteration",
        fixtures: 12,
        custom: { single_or_two_family: true },
      },
      rulesFor("plumbing"),
    );
    // $50 + 5 × $22.50 = $162.50, above the $100 filing floor. + $7.50.
    expect(residential.components.map((component) => component.code)).toEqual([
      "PLUMB-ALTERATION-1-2-FAMILY",
      "PLUMB-CITY-SURCHARGE",
      "PLUMB-STATE-SURCHARGE",
    ]);
    expect(residential.totalCents).toBe(17_000);

    const other = calculatePermitFees(
      { asOf: AS_OF, workType: "alteration", fixtures: 12 },
      rulesFor("plumbing"),
    );
    // $189 + 5 × $22.50 = $301.50, plus $7.50.
    expect(other.totalCents).toBe(30_900);
  });

  it("tops a residential water-heater permit up to the credited filing fee", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        workType: "replacement",
        custom: { plumbing_activity: "water_heater", single_or_two_family: true },
      },
      rulesFor("plumbing"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "PLUMB-WATER-HEATER-1-2-FAMILY",
      "PLUMB-FILING-FLOOR",
      "PLUMB-CITY-SURCHARGE",
      "PLUMB-STATE-SURCHARGE",
    ]);
    // The schedule's $31 flat, then the $69 shortfall to the $100 filing fee —
    // $100 of permit fee in total, not $131 — plus $7.50 of surcharges.
    expect(
      result.components.find((component) => component.code === "PLUMB-WATER-HEATER-1-2-FAMILY")
        ?.amountCents,
    ).toBe(3_100);
    expect(result.components.find((c) => c.code === "PLUMB-FILING-FLOOR")?.amountCents).toBe(
      6_900,
    );
    expect(result.totalCents).toBe(10_750);
    expect(result.warnings).toEqual([]);
  });

  it("prices fixture replacement per block and keeps the repair rows apart", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        workType: "replacement",
        fixtures: 9,
        custom: { plumbing_activity: "fixture_replacement" },
      },
      rulesFor("plumbing"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "PLUMB-FIXTURE-REPLACEMENT",
      "PLUMB-FILING-FLOOR",
      "PLUMB-CITY-SURCHARGE",
      "PLUMB-STATE-SURCHARGE",
    ]);
    // $75 for the first seven + 2 × $6.30 = $87.60, topped up by the $12.40
    // shortfall to $100, plus $7.50.
    expect(result.totalCents).toBe(10_750);

    // One calculation names one activity: the water-heater rows and every
    // new-work or alteration block stay out of a fixture-replacement job.
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-water-heater");
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-water-heater-1-2-family");
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-new-construction");
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-alteration");
  });

  it("never lets the new-work and repair regimes fire together", () => {
    const input: CalculationInput = {
      asOf: AS_OF,
      workType: "new_construction",
      fixtures: 10,
      custom: { plumbing_activity: "water_heater", single_or_two_family: true },
    };

    const result = calculatePermitFees(input, rulesFor("plumbing"));

    expect(result.appliedRuleIds).toContain("philadelphia-plumb-new-construction");
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-water-heater-1-2-family");
    // The repair row demands repair or replacement work; the block row is
    // selected by the work type, and only one of them can be true.
    expect(result.appliedRuleIds).not.toContain("philadelphia-plumb-fixture-replacement");
  });
});
