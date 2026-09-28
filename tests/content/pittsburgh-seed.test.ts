import { describe, expect, it } from "vitest";

import { pittsburghSeed } from "@/content/pittsburgh";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Pennsylvania, pass 14 — Pittsburgh, the state's second jurisdiction.
 *
 * Philadelphia's stack turned on a *credit*; Pittsburgh's turns on a single
 * multiplication. Every construction permit is total construction value × a
 * rate per $1,000, clamped — and the four things that structure can get wrong
 * are what the arithmetic below pins:
 *
 *  1. the multiplication is **prorated**, because neither the schedule nor the
 *     City's calculator prints "or fraction thereof" ($25,100 is $150.60, not
 *     the $156 a round-up would charge);
 *  2. the **clamp lands on the multiplied figure** ($5,000 of value computes
 *     $30 and pays the printed $130; $20,000,000 computes $140,000 and pays the
 *     printed $95,000);
 *  3. the technology fee's bracket is read off **the base fee itself**, so a
 *     $130 permit still pays $2.00 and a $1,001 base fee jumps a band;
 *  4. the 15% TPA discount is folded into the commercial electrical **row**
 *     ($5.95 with clamps scaled to $514.25 / $80,750), because the engine has
 *     no negative component and scaling commutes with clamping.
 *
 * The column split is asserted too: `custom.structure_type` and nothing else
 * selects the row, and absent the flag the commercial one applies.
 */

const AS_OF = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return pittsburghSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function amountOf(result: ReturnType<typeof calculatePermitFees>, code: string): number | undefined {
  return result.components.find((component) => component.code === code)?.amountCents;
}

describe("Pittsburgh seed", () => {
  it("validates all fee rules through the engine schema", () => {
    for (const entry of pittsburghSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("has 15 rules across the three permits Pittsburgh publishes", () => {
    expect(pittsburghSeed.feeRules).toHaveLength(15);
    expect(rulesFor("building")).toHaveLength(5);
    expect(rulesFor("electrical")).toHaveLength(5);
    expect(rulesFor("mechanical")).toHaveLength(5);
  });

  it("publishes no plumbing page, because the City issues no plumbing permits", () => {
    expect(pittsburghSeed.jurisdictionPermitTypes.map((entry) => entry.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "mechanical",
    ]);
    expect(pittsburghSeed.permitPages.map((page) => page.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "mechanical",
    ]);
    expect(pittsburghSeed.profile.notIncluded).toContain("Allegheny County");
  });

  it("keeps every rule code unique inside a permit type", () => {
    for (const permitTypeKey of ["building", "electrical", "mechanical"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("keeps every cited source inside the payload", () => {
    const keys = new Set(pittsburghSeed.sources.map((source) => source.key));
    for (const entry of pittsburghSeed.feeRules) {
      if (entry.rule.sourceId) expect(keys.has(entry.rule.sourceId), entry.rule.code).toBe(true);
    }
    for (const page of pittsburghSeed.permitPages) {
      for (const faq of page.faqs ?? []) {
        expect(keys.has(faq.sourceId as string), `${page.slug}: ${faq.question}`).toBe(true);
      }
    }
    for (const requirement of pittsburghSeed.requirements) {
      if (requirement.sourceKey) {
        expect(keys.has(requirement.sourceKey), requirement.title).toBe(true);
      }
    }
    for (const verification of pittsburghSeed.verifications) {
      if (verification.sourceKey) {
        expect(keys.has(verification.sourceKey), verification.entityKey).toBe(true);
      }
    }
  });

  it("has 3 published permit pages that clear the editorial gate", () => {
    expect(pittsburghSeed.permitPages).toHaveLength(3);
    for (const page of pittsburghSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const result = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: pittsburghSeed.sources.length,
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
    for (const page of pittsburghSeed.permitPages) {
      const faqs = page.faqs ?? [];
      expect(faqs.length, page.slug).toBeGreaterThanOrEqual(4);
      expect(faqs.length, page.slug).toBeLessThanOrEqual(6);
      for (const faq of faqs) {
        expect(faq.sourceId, `${page.slug}: ${faq.question}`).toBeTruthy();
      }
    }
  });

  it("verifies every source and the fee schedule on the research date", () => {
    expect(pittsburghSeed.sources.length).toBeGreaterThanOrEqual(6);
    for (const source of pittsburghSeed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
      expect(source.retrievedAt, source.key).toBe(AS_OF);
    }

    const keys = pittsburghSeed.sources.map((source) => source.key);
    const urls = pittsburghSeed.sources.map((source) => source.url);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(urls).size).toBe(urls.length);

    expect(pittsburghSeed.feeSchedules).toHaveLength(1);
    expect(pittsburghSeed.feeSchedules[0]?.status).toBe("active");
    expect(pittsburghSeed.feeSchedules[0]?.effectiveFrom).toBe("2026-01-01");
    expect(pittsburghSeed.feeSchedules[0]?.lastVerifiedAt).toBe(AS_OF);
  });

  it("records verifications for the profile, every page, the schedule and the sources", () => {
    const types = new Set(pittsburghSeed.verifications.map((entry) => entry.entityType));
    expect(types).toContain("jurisdiction_profile");
    expect(types).toContain("permit_page");
    expect(types).toContain("fee_schedule");
    expect(types).toContain("source");
    expect(types).toContain("fee_rule");

    for (const source of pittsburghSeed.sources) {
      const record = pittsburghSeed.verifications.find(
        (entry) => entry.entityType === "source" && entry.entityKey === source.key,
      );
      expect(record, source.key).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    for (const page of pittsburghSeed.permitPages) {
      const record = pittsburghSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    // The technology bracket's interaction with the TPA discount is the one
    // reading the sources do not settle; it is recorded rather than smoothed
    // over, and it is the only such record in this payload.
    const needsReview = pittsburghSeed.verifications.filter(
      (entry) => entry.status === "needs_review",
    );
    expect(needsReview.map((entry) => entry.entityKey)).toEqual(["ELEC-TECH-FEE"]);
    expect(pittsburghSeed.verifications.filter((entry) => entry.status === "disputed")).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* The base fee — 2026 schedule, "ALL CONSTRUCTION PERMIT TYPES"           */
  /* ---------------------------------------------------------------------- */

  it("prices a project prorated, never rounded up to the next thousand", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_510_000, custom: { structure_type: "residential" } },
      rulesFor("building"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-BASE-RESIDENTIAL",
      "BLD-TECH-FEE",
      "BLD-DIGITAL-RETENTION",
      "BLD-SETF",
    ]);
    // $25,100 × $6.00/1,000 = $150.60 — not the $156 a round-up would charge —
    // then the $0–$200 technology bracket, $5.00 retention and $4.50 SETF.
    expect(amountOf(result, "BLD-BASE-RESIDENTIAL")).toBe(15_060);
    expect(result.totalCents).toBe(16_210);
    expect(result.warnings).toEqual([]);
  });

  it("lifts a small project to the printed residential minimum", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 500_000, custom: { structure_type: "residential" } },
      rulesFor("building"),
    );

    const base = result.components.find((component) => component.code === "BLD-BASE-RESIDENTIAL");
    // $5,000 × .006 is $30 of arithmetic the schedule's $130 minimum replaces.
    expect(base?.amountCents).toBe(13_000);
    expect(base?.steps.some((step) => step.label === "Minimum fee applied")).toBe(true);
    // The technology fee reads the *clamped* base: $130 is still the $0–$200 band.
    expect(amountOf(result, "BLD-TECH-FEE")).toBe(200);
    expect(result.totalCents).toBe(14_150);
    expect(result.warnings).toEqual([]);
  });

  it("caps a large project at the printed residential maximum", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 200_000_000, custom: { structure_type: "residential" } },
      rulesFor("building"),
    );

    const base = result.components.find((component) => component.code === "BLD-BASE-RESIDENTIAL");
    // $2,000,000 × .006 is $12,000; the schedule's ceiling holds it at $8,000.
    expect(base?.amountCents).toBe(800_000);
    expect(base?.steps.some((step) => step.label === "Maximum fee applied")).toBe(true);
    expect(amountOf(result, "BLD-TECH-FEE")).toBe(1_500); // $8,000 sits in the $1,001–$10,000 band
    expect(result.totalCents).toBe(802_450);
  });

  it("takes the commercial row when no structure type is declared", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 10_000_000 }, rulesFor("building"));

    // Absent the flag the larger figure applies, which is the column default
    // this site uses everywhere — and the residential row is excluded, not zeroed.
    expect(amountOf(result, "BLD-BASE-COMMERCIAL")).toBe(70_000); // $100,000 × $7.00/1,000
    expect(result.appliedRuleIds).not.toContain("pittsburgh-bld-base-residential");
    expect(
      result.excluded.find((entry) => entry.code === "BLD-BASE-RESIDENTIAL")?.reason,
    ).toBe("conditions_not_met");
    expect(result.totalCents).toBe(71_450);
    expect(result.warnings).toEqual([]);
  });

  it("applies the commercial minimum and the 2026 commercial maximum", () => {
    const floored = calculatePermitFees({ asOf: AS_OF, valuationCents: 1_000_000 }, rulesFor("building"));
    // $10,000 × .007 is $70; the printed $605 minimum governs instead.
    expect(amountOf(floored, "BLD-BASE-COMMERCIAL")).toBe(60_500);
    expect(amountOf(floored, "BLD-TECH-FEE")).toBe(500); // $605 is the $201–$1,000 band
    expect(floored.totalCents).toBe(61_950);

    const capped = calculatePermitFees({ asOf: AS_OF, valuationCents: 2_000_000_000 }, rulesFor("building"));
    // $20,000,000 × .007 is $140,000; the 2026 schedule's ceiling is $95,000
    // (its 2025 predecessor printed $80,000 — diffed, not assumed).
    expect(amountOf(capped, "BLD-BASE-COMMERCIAL")).toBe(9_500_000);
    expect(amountOf(capped, "BLD-TECH-FEE")).toBe(2_500);
    expect(capped.totalCents).toBe(9_503_450);
  });

  it("selects the technology bracket from the base fee, inclusive at each ceiling", () => {
    const feeAt = (valuationCents: number) =>
      calculatePermitFees(
        { asOf: AS_OF, valuationCents, custom: { structure_type: "residential" } },
        rulesFor("building"),
      );

    // $200.00 of base fee is still the $2.00 bracket; one cent more is $5.00.
    const atCeiling = feeAt(3_333_334);
    expect(amountOf(atCeiling, "BLD-BASE-RESIDENTIAL")).toBe(20_000);
    expect(amountOf(atCeiling, "BLD-TECH-FEE")).toBe(200);

    const overCeiling = feeAt(3_333_500);
    expect(amountOf(overCeiling, "BLD-BASE-RESIDENTIAL")).toBe(20_001);
    expect(amountOf(overCeiling, "BLD-TECH-FEE")).toBe(500);

    // A $1,500 base fee is the $15.00 band, and the top bracket is open-ended.
    expect(amountOf(feeAt(25_000_000), "BLD-TECH-FEE")).toBe(1_500);

    const commercialAtTop = calculatePermitFees({ asOf: AS_OF, valuationCents: 143_000_000 }, rulesFor("building"));
    expect(amountOf(commercialAtTop, "BLD-BASE-COMMERCIAL")).toBe(1_001_000);
    expect(amountOf(commercialAtTop, "BLD-TECH-FEE")).toBe(2_500);

    const commercialJustUnder = calculatePermitFees({ asOf: AS_OF, valuationCents: 142_857_000 }, rulesFor("building"));
    expect(amountOf(commercialJustUnder, "BLD-BASE-COMMERCIAL")).toBe(999_999);
    expect(amountOf(commercialJustUnder, "BLD-TECH-FEE")).toBe(1_500);
  });

  it("prices the same value identically whatever the work type or occupancy says", () => {
    const totals = (["new_construction", "alteration", "demolition"] as const).map(
      (workType) =>
        calculatePermitFees(
          { asOf: AS_OF, valuationCents: 10_000_000, workType, occupancy: "commercial" },
          rulesFor("building"),
        ).totalCents,
    );

    // The schedule prices the declared structure type and the value. Nothing else.
    expect(new Set(totals).size).toBe(1);
    expect(totals[0]).toBe(71_450);
  });

  /* ---------------------------------------------------------------------- */
  /* Electrical — the one row a published figure reduces                     */
  /* ---------------------------------------------------------------------- */

  it("folds the required TPA discount into the commercial electrical row", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 10_000_000, occupancy: "commercial" },
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-BASE-COMMERCIAL",
      "ELEC-TECH-FEE",
      "ELEC-DIGITAL-RETENTION",
      "ELEC-SETF",
    ]);
    // $7.00 × 0.85 = $5.95 per $1,000 → $595.00 where the undiscounted row
    // would say $700. The discount has a source: the TPA page.
    expect(amountOf(result, "ELEC-BASE-COMMERCIAL")).toBe(59_500);
    expect(
      result.components.find((component) => component.code === "ELEC-BASE-COMMERCIAL")?.sourceId,
    ).toBe("pittsburgh-tpa");
    expect(result.totalCents).toBe(60_950);
    expect(result.warnings).toEqual([]);
  });

  it("scales the clamps with the discount: $514.25 floor and $80,750 ceiling", () => {
    const floored = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 500_000 },
      rulesFor("electrical"),
    );
    // $5,000 × .00595 is $29.75; the floor is the City's own $605 × .85.
    const floorRow = floored.components.find(
      (component) => component.code === "ELEC-BASE-COMMERCIAL",
    );
    expect(floorRow?.amountCents).toBe(51_425);
    expect(floorRow?.steps.some((step) => step.label === "Minimum fee applied")).toBe(true);
    expect(floored.totalCents).toBe(52_875);

    const capped = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_000_000_000 },
      rulesFor("electrical"),
    );
    const capRow = capped.components.find((component) => component.code === "ELEC-BASE-COMMERCIAL");
    expect(capRow?.amountCents).toBe(8_075_000);
    expect(capRow?.steps.some((step) => step.label === "Maximum fee applied")).toBe(true);
    expect(capped.totalCents).toBe(8_078_450);
  });

  it("leaves residential electrical undiscounted, on the schedule's own row", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 10_000_000, custom: { structure_type: "residential" } },
      rulesFor("electrical"),
    );

    // $6.00 per $1,000 — PLI's third-party list does not reach current
    // residential work, so the discount row must not fire here.
    expect(amountOf(result, "ELEC-BASE-RESIDENTIAL")).toBe(60_000);
    expect(result.appliedRuleIds).not.toContain("pittsburgh-elec-base-commercial");
    expect(result.totalCents).toBe(61_450);
  });

  /* ---------------------------------------------------------------------- */
  /* Mechanical — the same rows, and no discount anywhere near them          */
  /* ---------------------------------------------------------------------- */

  it("prices mechanical on the undiscounted rows in both columns", () => {
    const residential = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 6_000_000, custom: { structure_type: "residential" } },
      rulesFor("mechanical"),
    );
    expect(residential.components.map((component) => component.code)).toEqual([
      "MECH-BASE-RESIDENTIAL",
      "MECH-TECH-FEE",
      "MECH-DIGITAL-RETENTION",
      "MECH-SETF",
    ]);
    expect(amountOf(residential, "MECH-BASE-RESIDENTIAL")).toBe(36_000); // $60,000 × $6.00/1,000
    expect(residential.totalCents).toBe(37_450);
    expect(residential.warnings).toEqual([]);

    // The same value without the flag computes $420.00 of rate at $7.00 per
    // $1,000 — and the printed $605 minimum lifts it, so a commercial column
    // can cost more than the arithmetic says. Mechanical never carries the TPA
    // discount either, because it is not on PLI's third-party-inspection list.
    const commercial = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 6_000_000 },
      rulesFor("mechanical"),
    );
    expect(amountOf(commercial, "MECH-BASE-COMMERCIAL")).toBe(60_500);
    expect(commercial.totalCents).toBe(61_950);
  });

  /* ---------------------------------------------------------------------- */
  /* The published worked examples, recomputed                              */
  /* ---------------------------------------------------------------------- */

  it("recomputes each published worked example to the total its notes state", () => {
    const expected: Record<string, { totalCents: number; stated: string }> = {
      "building-permit-cost": { totalCents: 870_450, stated: "$8,704.50" },
      "electrical-permit-cost": { totalCents: 60_950, stated: "$609.50" },
      "mechanical-permit-cost": { totalCents: 37_450, stated: "$374.50" },
    };

    for (const page of pittsburghSeed.permitPages) {
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

  it("charges no value-derived amount when the construction value is missing", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, rulesFor("building"));

    // The two flats are flat — they are charged whatever the reader declares —
    // but the base row and the bracket table cannot be computed, so they are
    // excluded and the absence is reported rather than priced at zero.
    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-DIGITAL-RETENTION",
      "BLD-SETF",
    ]);
    expect(result.excluded.map((entry) => entry.code)).toEqual(
      expect.arrayContaining(["BLD-BASE-RESIDENTIAL", "BLD-BASE-COMMERCIAL", "BLD-TECH-FEE"]),
    );
    expect(result.warnings.join(" ")).toContain("Project valuation");
  });

  it("names the exclusions the pages must not silently drop", () => {
    const profile = pittsburghSeed.profile;
    expect(profile.notIncluded).toContain("Zoning Fee Schedule");
    expect(profile.notIncluded).toContain("40% of Base Fee");
    expect(profile.notIncluded).toContain("reconnect");
    expect(profile.localContext).toContain("OneStopPGH");
    expect(profile.valuationBasis).toContain("$150.60");
  });
});
