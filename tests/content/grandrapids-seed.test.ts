import { describe, expect, it } from "vitest";

import { grandrapidsSeed } from "@/content/grandrapids";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Michigan, pass 15 — Grand Rapids, the state's second jurisdiction.
 *
 * Detroit prices percentages of *money* with nine printed bands; Grand Rapids
 * prices a four-component stack where two components are percentages of *the
 * fee itself*, made whole by a floor and a cap. The arithmetic below pins the
 * five things that stack can get wrong:
 *
 *  1. the incremental fee **rounds the partial thousand up**, because the
 *     chart's rows are keyed by value ranges ($150,001 is the $1,020.00 row,
 *     not the calculator's $1,013.20);
 *  2. plan review is the chart's own column — `max($50, floor(units × $0.68))`
 *     in **whole dollars** — so it is 501 printed tiers rather than any rate,
 *     and it is **commercial only**: the residential Total never includes it;
 *  3. the zoning fee reads the **permit fee** the run has already charged
 *     ($54 + the steps), floored at $25 and capped at $290, and the $25.12 / cap
 *     boundaries land exactly where the chart's rows say;
 *  4. absent an occupancy declaration the **commercial path applies** — the
 *     larger figure and the one the calculator defaults toward;
 *  5. demolition is refused by all four components, because the schedule prices
 *     wrecking on its own rows.
 *
 * Electrical and plumbing are flat applications plus gated item rows: exactly
 * one amperage band can fire, and the plumbing distribution rows are keyed on a
 * declared pipe size so exactly one of the six can fire.
 */

const AS_OF = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return grandrapidsSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function amountOf(result: ReturnType<typeof calculatePermitFees>, code: string): number | undefined {
  return result.components.find((component) => component.code === code)?.amountCents;
}

describe("Grand Rapids seed", () => {
  it("validates all fee rules through the engine schema", () => {
    for (const entry of grandrapidsSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("has 19 rules across the three permits Grand Rapids publishes", () => {
    expect(grandrapidsSeed.feeRules).toHaveLength(19);
    expect(rulesFor("building")).toHaveLength(5);
    expect(rulesFor("electrical")).toHaveLength(5);
    expect(rulesFor("plumbing")).toHaveLength(9);
  });

  it("publishes exactly building, electrical and plumbing", () => {
    expect(grandrapidsSeed.jurisdictionPermitTypes.map((entry) => entry.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(grandrapidsSeed.permitPages.map((page) => page.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(grandrapidsSeed.profile.notIncluded).toContain("Mechanical permits");
  });

  it("keeps every rule code unique inside a permit type", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("keeps every cited source inside the payload", () => {
    const keys = new Set(grandrapidsSeed.sources.map((source) => source.key));
    for (const entry of grandrapidsSeed.feeRules) {
      if (entry.rule.sourceId) expect(keys.has(entry.rule.sourceId), entry.rule.code).toBe(true);
    }
    for (const page of grandrapidsSeed.permitPages) {
      for (const faq of page.faqs ?? []) {
        expect(keys.has(faq.sourceId as string), `${page.slug}: ${faq.question}`).toBe(true);
      }
    }
    for (const requirement of grandrapidsSeed.requirements) {
      if (requirement.sourceKey) {
        expect(keys.has(requirement.sourceKey), requirement.title).toBe(true);
      }
    }
    for (const verification of grandrapidsSeed.verifications) {
      if (verification.sourceKey) {
        expect(keys.has(verification.sourceKey), verification.entityKey).toBe(true);
      }
    }
  });

  it("has 3 published permit pages that clear the editorial gate", () => {
    expect(grandrapidsSeed.permitPages).toHaveLength(3);
    for (const page of grandrapidsSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const result = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: grandrapidsSeed.sources.length,
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
    for (const page of grandrapidsSeed.permitPages) {
      const faqs = page.faqs ?? [];
      expect(faqs.length, page.slug).toBeGreaterThanOrEqual(4);
      expect(faqs.length, page.slug).toBeLessThanOrEqual(6);
      for (const faq of faqs) {
        expect(faq.sourceId, `${page.slug}: ${faq.question}`).toBeTruthy();
      }
    }
  });

  it("verifies every source and the fee schedule on the research date", () => {
    expect(grandrapidsSeed.sources.length).toBeGreaterThanOrEqual(5);
    for (const source of grandrapidsSeed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
      expect(source.retrievedAt, source.key).toBe(AS_OF);
    }

    const keys = grandrapidsSeed.sources.map((source) => source.key);
    const urls = grandrapidsSeed.sources.map((source) => source.url);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(urls).size).toBe(urls.length);

    expect(grandrapidsSeed.feeSchedules).toHaveLength(1);
    expect(grandrapidsSeed.feeSchedules[0]?.status).toBe("active");
    expect(grandrapidsSeed.feeSchedules[0]?.effectiveFrom).toBe("2026-07-01");
    expect(grandrapidsSeed.feeSchedules[0]?.lastVerifiedAt).toBe(AS_OF);
  });

  it("records verifications for the profile, every page, the schedule and the sources", () => {
    const types = new Set(grandrapidsSeed.verifications.map((entry) => entry.entityType));
    expect(types).toContain("jurisdiction_profile");
    expect(types).toContain("permit_page");
    expect(types).toContain("fee_schedule");
    expect(types).toContain("source");
    expect(types).toContain("fee_rule");

    for (const source of grandrapidsSeed.sources) {
      const record = grandrapidsSeed.verifications.find(
        (entry) => entry.entityType === "source" && entry.entityKey === source.key,
      );
      expect(record, source.key).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    for (const page of grandrapidsSeed.permitPages) {
      const record = grandrapidsSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    // The commercial zoning fee is what the chart and the calculator disagree
    // about — $106.72 against $101.00 at 149 units — and the chart is charged.
    // That disagreement is recorded rather than smoothed over, and it is the
    // only such record in this payload.
    const needsReview = grandrapidsSeed.verifications.filter(
      (entry) => entry.status === "needs_review",
    );
    expect(needsReview.map((entry) => entry.entityKey)).toEqual(["GR-BLD-ZONING-COM"]);
    expect(grandrapidsSeed.verifications.filter((entry) => entry.status === "disputed")).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Building — the four-component stack, as the chart's own rows print it   */
  /* ---------------------------------------------------------------------- */

  it("reproduces the chart's $150,000 commercial row from four published parts", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 15_000_000, occupancy: "commercial", workType: "new_construction" },
      rulesFor("building"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "GR-BLD-APP",
      "GR-BLD-PLAN-REVIEW",
      "GR-BLD-INCREMENTAL",
      "GR-BLD-ZONING-COM",
    ]);
    expect(amountOf(result, "GR-BLD-APP")).toBe(5_400);
    // $150,000 − $1,000 = 149 whole steps of $6.80 = $1,013.20.
    expect(amountOf(result, "GR-BLD-INCREMENTAL")).toBe(101_320);
    // max($50, floor(149 × 0.68)) = $101 in whole dollars, from the chart's own
    // "Com Plan Review" column for that row.
    expect(amountOf(result, "GR-BLD-PLAN-REVIEW")).toBe(10_100);
    // 10% of ($54.00 + $1,013.20) = $106.72 — the chart's zoning column, not
    // the calculator's floor(0.68 × 149) = $101.00.
    expect(amountOf(result, "GR-BLD-ZONING-COM")).toBe(10_672);
    // The chart's Total Commercial column for this row: $1,274.92.
    expect(result.totalCents).toBe(127_492);
    expect(result.warnings).toEqual([]);
  });

  it("rounds the partial thousand up, where the calculator rounds it down", () => {
    const atRow = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 15_000_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    expect(amountOf(atRow, "GR-BLD-INCREMENTAL")).toBe(101_320); // 149 steps

    const oneCentOver = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 15_000_001, occupancy: "commercial" },
      rulesFor("building"),
    );
    // The "$150,001 – $151,000" row charges its own 150 steps: $1,020.00,
    // not the $1,013.20 the calculator's floor() expression produces.
    expect(amountOf(oneCentOver, "GR-BLD-INCREMENTAL")).toBe(102_000);
    expect(oneCentOver.warnings).toEqual([]);
  });

  it("prices a single-family project with no plan review and $25 of zoning", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 4_000_000, occupancy: "residential" },
      rulesFor("building"),
    );

    // $54.00 + 39 steps ($265.20) + $25.00 = $344.20, the chart's residential
    // Total for the row — plan review absent rather than zero.
    expect(result.components.map((component) => component.code)).toEqual([
      "GR-BLD-APP",
      "GR-BLD-INCREMENTAL",
      "GR-BLD-ZONING-RES",
    ]);
    expect(amountOf(result, "GR-BLD-INCREMENTAL")).toBe(26_520);
    expect(amountOf(result, "GR-BLD-ZONING-RES")).toBe(2_500);
    expect(result.totalCents).toBe(34_420);
    expect(
      result.excluded.find((entry) => entry.code === "GR-BLD-PLAN-REVIEW")?.reason,
    ).toBe("conditions_not_met");
    expect(
      result.excluded.find((entry) => entry.code === "GR-BLD-ZONING-COM")?.reason,
    ).toBe("conditions_not_met");
    expect(result.warnings).toEqual([]);
  });

  it("takes the commercial path when no occupancy is declared", () => {
    const commercial = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 4_000_000 },
      rulesFor("building"),
    );

    // Absent the flag the larger figure applies: plan review and the sliding
    // zoning fee both fire, and the residential rows are excluded, not zeroed.
    expect(commercial.components.map((component) => component.code)).toEqual([
      "GR-BLD-APP",
      "GR-BLD-PLAN-REVIEW",
      "GR-BLD-INCREMENTAL",
      "GR-BLD-ZONING-COM",
    ]);
    // floor(0.68 × 39) = $26 computes below the column's own $50 floor, so the
    // floor is what the chart prints — a percentage cannot understate it.
    expect(amountOf(commercial, "GR-BLD-PLAN-REVIEW")).toBe(5_000);
    // 10% of ($54.00 + $265.20) = $31.92 — above the $25 floor, below the cap.
    expect(amountOf(commercial, "GR-BLD-ZONING-COM")).toBe(3_192);
    expect(commercial.totalCents).toBe(40_112);
    expect(commercial.warnings).toEqual([]);
  });

  it("holds the zoning floor at $25 and takes $25.12 first at 29 units", () => {
    const atFloor = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_900_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    // 28 steps: 10% of ($54.00 + $190.40) = $24.44, floored by the rule to $25.
    expect(amountOf(atFloor, "GR-BLD-ZONING-COM")).toBe(2_500);
    expect(
      atFloor.components.find((component) => component.code === "GR-BLD-ZONING-COM")?.steps.some(
        (step) => step.label === "Minimum fee applied",
      ),
    ).toBe(true);

    const firstAbove = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 3_000_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    // 29 steps: 10% of ($54.00 + $197.20) = $25.12 — the chart's first value
    // above its own floor, to the cent.
    expect(amountOf(firstAbove, "GR-BLD-ZONING-COM")).toBe(2_512);
    expect(firstAbove.warnings).toEqual([]);
  });

  it("holds the zoning cap at $290, binding from 419 units", () => {
    const underCap = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 41_900_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    // 418 steps: 10% of ($54.00 + $2,842.40) = $289.64, still under the cap.
    expect(amountOf(underCap, "GR-BLD-ZONING-COM")).toBe(28_964);

    const atCap = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 42_000_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    // 419 steps: 10% of ($54.00 + $2,849.20) = $290.32, held to the $290 cap
    // the schedule prints as a maximum.
    expect(amountOf(atCap, "GR-BLD-ZONING-COM")).toBe(29_000);
    expect(
      atCap.components.find((component) => component.code === "GR-BLD-ZONING-COM")?.steps.some(
        (step) => step.label === "Maximum fee applied",
      ),
    ).toBe(true);
  });

  it("shows the plan-review floor giving way to the formula at the chart's own row", () => {
    const atFloor = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 7_500_000, occupancy: "commercial" },
      rulesFor("building"),
    );
    // The "$74,001 – $75,000" row: floor(0.68 × 74) = $50, still the floor.
    expect(amountOf(atFloor, "GR-BLD-PLAN-REVIEW")).toBe(5_000);

    const oneCentOver = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 7_500_001, occupancy: "commercial" },
      rulesFor("building"),
    );
    // The "$75,001 – $76,000" row: floor(0.68 × 75) = $51, now the formula.
    expect(amountOf(oneCentOver, "GR-BLD-PLAN-REVIEW")).toBe(5_100);
    expect(oneCentOver.warnings).toEqual([]);
  });

  it("charges the chart's very first row at $129.00", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 100_000, occupancy: "commercial" },
      rulesFor("building"),
    );

    // $54.00 application, no incremental step, the $50 plan-review floor and
    // 10% of $54.00 floored to $25 of zoning.
    expect(amountOf(result, "GR-BLD-APP")).toBe(5_400);
    expect(amountOf(result, "GR-BLD-INCREMENTAL")).toBe(0);
    expect(amountOf(result, "GR-BLD-PLAN-REVIEW")).toBe(5_000);
    expect(amountOf(result, "GR-BLD-ZONING-COM")).toBe(2_500);
    expect(result.totalCents).toBe(12_900);
    expect(result.warnings).toEqual([]);
  });

  it("applies the top printed row above $501,000 and warns rather than invent one", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 60_000_000, occupancy: "commercial" },
      rulesFor("building"),
    );

    // The chart's last row is "$500,001 – $501,000": plan review $340.
    expect(amountOf(result, "GR-BLD-PLAN-REVIEW")).toBe(34_000);
    expect(result.warnings.join(" ")).toContain("exceeds the highest published bracket");
    // The zoning cap holds even here: 10% of $4,127.20 would be $412.72.
    expect(amountOf(result, "GR-BLD-ZONING-COM")).toBe(29_000);
    expect(result.totalCents).toBe(475_720);
  });

  it("refuses all four components for demolition, because wrecking has its own rows", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 4_000_000, occupancy: "commercial", workType: "demolition" },
      rulesFor("building"),
    );

    expect(result.components).toEqual([]);
    expect(result.excluded).toHaveLength(5);
    expect(result.excluded.every((entry) => entry.reason === "conditions_not_met")).toBe(true);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });

  it("charges the application fee when no value is declared, and names the absence", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, rulesFor("building"));

    // The application fee is flat — it charges whatever the reader declares —
    // but the steps, the plan-review tiers and the zoning percentage cannot be
    // computed, so they are excluded and the absence is reported, not priced.
    expect(result.components.map((component) => component.code)).toEqual(["GR-BLD-APP"]);
    expect(result.excluded.map((entry) => entry.code)).toEqual(
      expect.arrayContaining([
        "GR-BLD-INCREMENTAL",
        "GR-BLD-PLAN-REVIEW",
        "GR-BLD-ZONING-COM",
      ]),
    );
    expect(result.warnings.join(" ")).toContain("Project valuation");
  });

  /* ---------------------------------------------------------------------- */
  /* Electrical — one application row and four gated service bands           */
  /* ---------------------------------------------------------------------- */

  it("stacks the application with exactly one amperage band", () => {
    const result = calculatePermitFees({ asOf: AS_OF, custom: { amperage: 400 } }, rulesFor("electrical"));

    expect(result.components.map((component) => component.code)).toEqual([
      "GR-ELEC-APP",
      "GR-ELEC-SVC-600",
    ]);
    expect(amountOf(result, "GR-ELEC-APP")).toBe(5_200);
    expect(amountOf(result, "GR-ELEC-SVC-600")).toBe(3_100);
    expect(result.totalCents).toBe(8_300);
    expect(result.warnings).toEqual([]);
  });

  it("holds each band's boundary inclusive, so exactly one can fire", () => {
    const bandAt = (amperage: number) => {
      const result = calculatePermitFees(
        { asOf: AS_OF, custom: { amperage } },
        rulesFor("electrical"),
      );
      const serviceCodes = result.components
        .map((component) => component.code)
        .filter((code) => code !== "GR-ELEC-APP");
      expect(serviceCodes, `amperage ${amperage}`).toHaveLength(1);
      return { code: serviceCodes[0], total: result.totalCents };
    };

    expect(bandAt(200)).toEqual({ code: "GR-ELEC-SVC-200", total: 6_900 }); // $52 + $17
    expect(bandAt(201)).toEqual({ code: "GR-ELEC-SVC-600", total: 8_300 }); // $52 + $31
    expect(bandAt(600)).toEqual({ code: "GR-ELEC-SVC-600", total: 8_300 });
    expect(bandAt(601)).toEqual({ code: "GR-ELEC-SVC-1000", total: 11_500 }); // + $63
    expect(bandAt(1_000)).toEqual({ code: "GR-ELEC-SVC-1000", total: 11_500 });
    expect(bandAt(1_001)).toEqual({ code: "GR-ELEC-SVC-OVER1000", total: 15_700 }); // + $105
  });

  it("charges the application alone when no service size is declared", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, rulesFor("electrical"));

    // The schedule publishes no default band, so none is invented: the four
    // service rows are excluded on their conditions and the $52 is the permit.
    expect(result.components.map((component) => component.code)).toEqual(["GR-ELEC-APP"]);
    expect(result.totalCents).toBe(5_200);
    expect(
      result.excluded
        .filter((entry) => entry.code.startsWith("GR-ELEC-SVC"))
        .every((entry) => entry.reason === "conditions_not_met"),
    ).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Plumbing — application, the closed $5 list, water heater, pipe sizes    */
  /* ---------------------------------------------------------------------- */

  it("charges the application plus every declared plumbing row", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, fixtures: 8, custom: { water_heater: true, water_distribution: "1" } },
      rulesFor("plumbing"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "GR-PLUMB-APP",
      "GR-PLUMB-ITEM",
      "GR-PLUMB-WATER-HEATER",
      "GR-PLUMB-DIST-1",
    ]);
    expect(amountOf(result, "GR-PLUMB-APP")).toBe(5_200);
    expect(amountOf(result, "GR-PLUMB-ITEM")).toBe(4_000); // 8 × $5
    expect(amountOf(result, "GR-PLUMB-WATER-HEATER")).toBe(2_100);
    expect(amountOf(result, "GR-PLUMB-DIST-1")).toBe(1_000); // 1" line
    expect(result.totalCents).toBe(12_300);
    expect(result.warnings).toEqual([]);
  });

  it("selects one distribution row by declared pipe size", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, fixtures: 8, custom: { water_heater: true, water_distribution: "over-2" } },
      rulesFor("plumbing"),
    );

    expect(amountOf(result, "GR-PLUMB-DIST-OVER2")).toBe(3_600);
    expect(
      result.excluded
        .filter((entry) => entry.code.startsWith("GR-PLUMB-DIST"))
        .every((entry) => entry.reason === "conditions_not_met"),
    ).toBe(true);
    // $52 + $40 + $21 + $36 = $149.00, the neighbour the page states.
    expect(result.totalCents).toBe(14_900);
  });

  it("reports a missing fixture count instead of pricing zero items", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { water_distribution: "1" } },
      rulesFor("plumbing"),
    );

    // The application and the declared distribution line still compute; the
    // item row has no count to read and says so rather than charging nothing.
    expect(result.components.map((component) => component.code)).toEqual([
      "GR-PLUMB-APP",
      "GR-PLUMB-DIST-1",
    ]);
    expect(result.totalCents).toBe(6_200);
    expect(result.warnings.join(" ")).toContain('"fixtures"');
    expect(
      result.excluded.find((entry) => entry.code === "GR-PLUMB-ITEM")?.reason,
    ).toBe("missing_input");
  });

  /* ---------------------------------------------------------------------- */
  /* The published worked examples, recomputed                               */
  /* ---------------------------------------------------------------------- */

  it("recomputes each published worked example to the total its notes state", () => {
    const expected: Record<string, { totalCents: number; stated: string }> = {
      "building-permit-cost": { totalCents: 127_492, stated: "$1,274.92" },
      "electrical-permit-cost": { totalCents: 8_300, stated: "$83.00" },
      "plumbing-permit-cost": { totalCents: 12_300, stated: "$123.00" },
    };

    for (const page of grandrapidsSeed.permitPages) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const want = expected[page.slug];
      expect(want, page.slug).toBeDefined();

      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );

      expect(result.totalCents, page.slug).toBe(want!.totalCents);
      expect(result.warnings, page.slug).toEqual([]);
      expect(example!.notes, page.slug).toContain(want!.stated);
    }
  });

  it("names the exclusions the pages must not silently drop", () => {
    const profile = grandrapidsSeed.profile;
    expect(profile.notIncluded).toContain("Mechanical permits");
    expect(profile.notIncluded).toContain("LUDS");
    expect(profile.localContext).toContain("aca-prod.accela.com/GRANDRAPIDS");
    expect(profile.valuationBasis).toContain("$106.72");
    expect(grandrapidsSeed.permitPages[0]?.notIncluded).toContain("501,000");
  });
});
