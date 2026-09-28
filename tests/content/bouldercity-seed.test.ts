import { describe, expect, it } from "vitest";

import { BOULDER_PUBLISHED_PERMIT_PAGES, boulderCitySeed } from "@/content/bouldercity";
import { clarkCountySeed } from "@/content/clarkcounty";
import { houstonSeed } from "@/content/houston";
import { calculatePermitFees, validateFeeRule, type FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Boulder City's content, checked against the document it came from — without a
 * database, so this runs everywhere.
 *
 * What is worth pinning here, beyond the usual completeness checks:
 *
 *  1. **The bracket table chains, and it does so without the rounding that Clark
 *     County needed.** $414.50 and $639.50 are what the row below produces at
 *     each handover, to the cent, because every published rate here is whole
 *     cents. Two Nevada schedules, one convention each, both asserted.
 *  2. **The issuance fee is charged exactly once, and only where the schedule
 *     indicates.** The building rule set carries it; neither trade rule set does,
 *     because each trade block prints "Price Includes Issuance Fee".
 *  3. **The valuation example comes from the City's own unit costs.** The worked
 *     example's input is $112,650 — 1,000 sq ft at the schedule's published
 *     $112.65 — so the whole chain on the page is one document's arithmetic.
 */

const AS_OF = "2026-09-24";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  boulderCitySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const buildingTotal = (valuationCents: number): number =>
  calculatePermitFees({ asOf: AS_OF, valuationCents }, rulesFor("building")).totalCents;

describe("Boulder City payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of boulderCitySeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(boulderCitySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(boulderCitySeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...boulderCitySeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of boulderCitySeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of boulderCitySeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of boulderCitySeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }
  });

  it("defines Nevada as a city inside Clark County, sharing the county row", () => {
    expect(boulderCitySeed.state.code).toBe("NV");
    expect(boulderCitySeed.state).toEqual(clarkCountySeed.state);
    expect(boulderCitySeed.county).toEqual(clarkCountySeed.county);
    expect(boulderCitySeed.jurisdiction.type).toBe("city");
    expect(boulderCitySeed.jurisdiction.countyKey).toBe(clarkCountySeed.jurisdiction.countyKey);
    expect(boulderCitySeed.permitTypes).toEqual([]);
    expect(boulderCitySeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: the building permit and the two trades the schedule prices", () => {
    expect(BOULDER_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(boulderCitySeed.permitPages.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    // Mechanical IS priced — $75 and $100 by tonnage, plus per additional unit —
    // but it is not one of the three pages this jurisdiction earns. Asserting
    // the absence keeps it a decision rather than an oversight.
    expect(boulderCitySeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(
      false,
    );
    const mechanical = boulderCitySeed.jurisdictionPermitTypes.find(
      (link) => link.permitTypeKey === "mechanical",
    );
    expect(mechanical?.isAvailable).toBe(true);
    expect(mechanical?.notes).toContain("No mechanical page is published in this release");
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of BOULDER_PUBLISHED_PERMIT_PAGES) {
      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: boulderCitySeed.sources.filter((source) => source.isPrimary).length,
        feeRuleCount: rulesFor(page.permitTypeKey).filter((rule) => rule.status === "active")
          .length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.publishable).toBe(true);
      expect(page.intro.length).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
    }
  });

  it("gives every published page a unique title and description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of BOULDER_PUBLISHED_PERMIT_PAGES) {
      expect(page.seoTitle.trim().length).toBeGreaterThan(0);
      expect(page.seoDescription.trim().length).toBeGreaterThan(0);
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }

    expect(titles.has(boulderCitySeed.profile.seoTitle)).toBe(false);
    expect(descriptions.has(boulderCitySeed.profile.seoDescription)).toBe(false);
  });

  it("dates every source and every verification with the day it was actually read", () => {
    for (const source of boulderCitySeed.sources) {
      expect(source.retrievedAt).toBe("2026-09-24");
      expect(source.lastVerifiedAt).toBe("2026-09-24");
    }
    for (const verification of boulderCitySeed.verifications) {
      expect(verification.verifiedAt).toBe("2026-09-24");
    }
    // The schedule states its own effective date; nothing is inferred.
    expect(boulderCitySeed.feeSchedules[0]?.effectiveFrom).toBe("2020-08-03");
    expect(boulderCitySeed.sources[0]?.notes).toContain("Effective as of August 3, 2020");
    expect(boulderCitySeed.sources[0]?.notes).toContain("was mis-paired by `pdftotext -layout`");
  });

  it("records the Division's own contact details from the schedule's header", () => {
    const department = boulderCitySeed.departments[0];
    expect(department?.phone).toBe("(702) 293-9282");
    expect(department?.email).toBe("buildingpermits@bcnv.org");
    expect(department?.addressLine).toContain("401 California Avenue");
    expect(department?.hours).toBeNull();
    expect(department?.notes).toContain("not printed there and are not recorded");
  });

  it("cites no rate from the Division's landing page", () => {
    for (const entry of boulderCitySeed.feeRules) {
      expect(entry.rule.sourceId).not.toBe("boulder-permit-guidelines");
    }
    const landing = boulderCitySeed.sources.find(
      (source) => source.key === "boulder-permit-guidelines",
    );
    expect(landing?.isPrimary).toBe(false);
    expect(landing?.notes).toContain("no figure on this site is taken from it");
  });
});

describe("Boulder City Valuation Table — the City's own figures", () => {
  it("models the bracket table, both rate rows and the issuance fee — four rules", () => {
    const rules = rulesFor("building");
    expect(rules).toHaveLength(4);
    expect(new Set(rules.map((rule) => rule.feeType))).toEqual(
      new Set(["tiered_table", "per_thousand", "flat"]),
    );
    expect(rules.every((rule) => rule.sourceId === "boulder-fee-schedule")).toBe(true);
  });

  it("reproduces the published brackets at their boundaries", () => {
    expect(buildingTotal(1_00)).toBe(2_700 + 4_000); // $27 + $40 issuance
    expect(buildingTotal(500_00)).toBe(2_700 + 4_000); // top of the first bracket
    expect(buildingTotal(501_00)).toBe(3_600 + 4_000); // the next one up
    expect(buildingTotal(25_000_00)).toBe(25_200 + 4_000); // $252 at $25,000
    expect(buildingTotal(50_000_00)).toBe(41_450 + 4_000); // $414.50 at $50,000
  });

  it("closes both handovers to the cent — the convention Clark County's does not have", () => {
    expect(buildingTotal(50_000_00)).toBe(41_450 + 4_000); // table -> $4.50 band
    expect(buildingTotal(100_000_00)).toBe(63_950 + 4_000); // $4.50 band -> $3.50 band
    // At $50,001 the band above takes over, one increment higher than the table.
    expect(buildingTotal(50_001_00)).toBe(41_450 + 450 + 4_000);
    expect(buildingTotal(100_001_00)).toBe(63_950 + 350 + 4_000);
  });

  it("computes the building worked example from the City's own unit cost", () => {
    // 1,000 sq ft of wood-framed dwelling with A/C at the schedule's $112.65/sf.
    expect(1_000 * 112_65).toBe(11_265_000);
    expect(buildingTotal(11_265_000)).toBe(68_500 + 4_000); // $685.00 + $40 = $725.00
  });

  it("charges the $40 issuance fee once, and only on the building permit", () => {
    expect(buildingTotal(100_000)).toBeGreaterThan(
      calculatePermitFees({ asOf: AS_OF, valuationCents: 100_000 }, rulesFor("building").filter(
        (rule) => rule.code !== "ISSUANCE-40",
      )).totalCents,
    );

    // Neither trade rule set carries it: both blocks print "Price Includes
    // Issuance Fee", which is the schedule indicating otherwise for them.
    for (const key of ["electrical", "plumbing"]) {
      expect(rulesFor(key).some((rule) => rule.code === "ISSUANCE-40")).toBe(false);
    }
  });

  it("models no valuation basis on either trade", () => {
    for (const key of ["electrical", "plumbing"]) {
      for (const rule of rulesFor(key)) {
        const config = rule.config as Record<string, unknown>;
        expect(config.basis, `${key}/${rule.code}`).toBeUndefined();
        expect(rule.feeType === "tiered_table" || rule.feeType === "per_thousand").toBe(false);
      }
    }
  });

  it("prices each published electrical item at its figure", () => {
    const expected: Record<string, number> = {
      service_change_200: 8_000,
      service_change_1000: 10_000,
      service_change_over_1000: 12_500,
      temporary_power: 29_000,
    };

    for (const [item, cents] of Object.entries(expected)) {
      const result = calculatePermitFees(
        { asOf: AS_OF, custom: { schedule_item: item } },
        rulesFor("electrical"),
      );
      expect(result.totalCents, item).toBe(cents);
      expect(result.components, item).toHaveLength(1);
    }
  });

  it("computes the electrical worked example: a 400-amp service change", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, custom: { schedule_item: "service_change_1000" } },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(10_000); // $100.00, issuance fee inside it
  });

  it("prices a water heater per unit, which is where flat and per-unit differ", () => {
    const one = calculatePermitFees(
      { asOf: AS_OF, custom: { schedule_item: "water_heater", heaters: 1 } },
      rulesFor("plumbing"),
    );
    const two = calculatePermitFees(
      { asOf: AS_OF, custom: { schedule_item: "water_heater", heaters: 2 } },
      rulesFor("plumbing"),
    );
    expect(one.totalCents).toBe(5_000);
    expect(two.totalCents).toBe(10_000);

    // The gas line is the other published row, and it is flat.
    const gasLine = calculatePermitFees(
      { asOf: AS_OF, custom: { schedule_item: "gas_line_test" } },
      rulesFor("plumbing"),
    );
    expect(gasLine.totalCents).toBe(7_000);
  });

  it("computes the plumbing worked example: two water heaters on one permit", () => {
    const page = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (candidate) => candidate.slug === "plumbing-permit-cost",
    );
    expect(page?.workedExample).not.toBeNull();
    const result = calculatePermitFees(
      { asOf: AS_OF, ...page!.workedExample!.inputs },
      rulesFor("plumbing"),
    );
    expect(result.totalCents).toBe(10_000);
    expect(result.components).toHaveLength(1);
  });

  it("models no plan review, and says why on every page", () => {
    for (const entry of boulderCitySeed.feeRules) {
      expect(entry.rule.componentType).not.toBe("plan_review");
    }
    for (const page of BOULDER_PUBLISHED_PERMIT_PAGES) {
      expect(page.notIncluded, page.slug).toContain("Plan review");
    }

    // The building page is where the deposit is named in full.
    const building = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "building-permit-cost",
    );
    expect(building?.notIncluded).toContain("non-refundable deposit");
  });

  it("names every fee the schedule publishes but this release does not model", () => {
    for (const page of BOULDER_PUBLISHED_PERMIT_PAGES) {
      expect(page.notIncluded, page.slug).toContain("Privilege tax");
      expect(page.notIncluded, page.slug).toContain("Resolution 6570");
      expect(page.notIncluded, page.slug).toContain("Clark County");
    }

    // Mechanical is priced on page 1 and named here as unmodelled.
    const building = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "building-permit-cost",
    );
    expect(building?.notIncluded).toContain("Mechanical (HVAC) permits");
    expect(building?.notIncluded).toContain("$75.00 for a 1-3 ton unit");
  });
});

describe("Boulder City — the schedule's own words on every page", () => {
  it("quotes the Valuation Table's banner where a reader needs it", () => {
    expect(boulderCitySeed.profile.valuationBasis).toContain(
      "VALUATION SHALL INCLUDE LABOR & MATERIALS",
    );
    const requirement = boulderCitySeed.requirements.find(
      (entry) => entry.title === "A valuation of labor and materials for the work being permitted",
    );
    expect(requirement?.description).toContain("EVEN IF WORK IS COMPLETED AS OWNER/BUILDER");
    expect(requirement?.isMandatory).toBe(true);
  });

  it("publishes the City's unit costs as a way to derive an input, never a fee", () => {
    const requirement = boulderCitySeed.requirements.find(
      (entry) => entry.title === "The valuation, when there is no contract price",
    );
    expect(requirement?.description).toContain("$112.65 per square foot");
    expect(requirement?.isMandatory).toBe(false);
    expect(requirement?.description).toContain("not retrieved in this pass");

    // The hub must never present a square-foot rate as a charge.
    expect(boulderCitySeed.profile.valuationBasis).toContain(
      "a rate for computing an input, not a fee",
    );
  });

  it("states the $40 reading plainly on the hub and the building page", () => {
    expect(boulderCitySeed.profile.localContext).toContain(
      "Unless indicated a $40 Issuance Fee will be applied to every permit",
    );
    const building = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "building-permit-cost",
    );
    expect(building?.localSummary).toContain("$40 high");
    expect(building?.faqs?.some((faq) => faq.answer.includes("$40"))).toBe(true);

    // And says the opposite reading is already inside the trade figures.
    for (const slug of ["electrical-permit-cost", "plumbing-permit-cost"]) {
      const page = BOULDER_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
      expect(page?.localSummary).toContain("Price Includes Issuance Fee");
      expect(page?.notIncluded).toContain("already inside it");
    }
  });

  it("states the \"Replacement only\" qualifier rather than trimming it to the figure", () => {
    const page = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (candidate) => candidate.slug === "plumbing-permit-cost",
    );
    expect(page?.intro).toContain("Replacement only");
    expect(page?.localSummary).toContain("Replacement only");
    expect(page?.faqs?.some((faq) => faq.answer.includes("Replacement only"))).toBe(true);

    const requirement = boulderCitySeed.requirements.find(
      (entry) => entry.title === "Whether the water heater is a replacement",
    );
    expect(requirement?.isMandatory).toBe(true);
    expect(requirement?.description).toContain("(Replacement only, per each unit/tank)");
  });

  it("says plainly where a schedule has no rate instead of borrowing a neighbour's", () => {
    const electrical = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "electrical-permit-cost",
    );
    expect(electrical?.localSummary).toContain("no valuation route here");
    expect(electrical?.intro).toContain("no rate for a remodel's circuits");

    const plumbing = BOULDER_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "plumbing-permit-cost",
    );
    expect(plumbing?.localSummary).toContain("no plumbing figures at all");
  });

  it("counts an answer to every question a reader arriving from search has", () => {
    for (const page of BOULDER_PUBLISHED_PERMIT_PAGES) {
      expect(page.faqs?.length, page.slug).toBeGreaterThanOrEqual(6);
      for (const faq of page.faqs ?? []) {
        expect(faq.answer.length, `${page.slug}: ${faq.question}`).toBeGreaterThan(60);
      }
    }
  });
});
