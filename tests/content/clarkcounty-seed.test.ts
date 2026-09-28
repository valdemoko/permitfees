import { describe, expect, it } from "vitest";

import { CLARK_PUBLISHED_PERMIT_PAGES, clarkCountySeed } from "@/content/clarkcounty";
import { houstonSeed } from "@/content/houston";
import { calculatePermitFees, validateFeeRule, type FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Clark County's content, checked against the document it came from — without a
 * database, so this runs everywhere.
 *
 * Three kinds of check live here:
 *
 *  1. **The payload is internally complete.** Every rule cites a source, a permit
 *     type and a schedule that exist in the same payload or a sibling's; every
 *     published page clears the editorial gate with what the payload provides.
 *  2. **The arithmetic is the County's.** Table 3-A's six bands are boundary
 *     values, and this file pins the property that makes a chained table
 *     checkable at all: the value at each band's top against the opening figure
 *     of the band above. Four seams close to the cent; one does not, by four
 *     cents, and both readings are asserted rather than reconciled.
 *  3. **The capability Clark County needed is used by Clark County and nowhere
 *     else.** `low_voltage_points` is a new per-unit kind; asserting it is
 *     confined to the one rule that describes it stops a future jurisdiction
 *     from adopting it by accident and changing a published total.
 */

const AS_OF = "2026-09-24";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  clarkCountySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const valuationRules = (): FeeRuleRecord[] =>
  clarkCountySeed.feeRules
    .filter((entry) => entry.permitTypeKey === "building")
    .map((entry) => entry.rule);

const feeAt = (valuationCents: number): number =>
  calculatePermitFees({ asOf: AS_OF, valuationCents }, valuationRules()).totalCents;

describe("Clark County payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of clarkCountySeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(clarkCountySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(clarkCountySeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...clarkCountySeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of clarkCountySeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of clarkCountySeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of clarkCountySeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }
  });

  it("defines Nevada and Clark County, but no permit type Houston does not have", () => {
    expect(clarkCountySeed.state.code).toBe("NV");
    expect(clarkCountySeed.state.slug).toBe("nevada");
    expect(clarkCountySeed.county.fipsCode).toBe("32003");
    expect(clarkCountySeed.jurisdiction.type).toBe("county");
    expect(clarkCountySeed.permitTypes).toEqual([]);
    expect(clarkCountySeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: the building permit and the two trades the table prices", () => {
    expect(CLARK_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(clarkCountySeed.permitPages.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    // Mechanical IS priced — Table 3-C exists and is transcribed — but it is not
    // one of the three pages this jurisdiction earns in this release. Asserting
    // the absence keeps it a decision rather than an oversight.
    expect(clarkCountySeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(
      false,
    );
    expect(clarkCountySeed.permitPages.some((page) => page.permitTypeKey === "demolition")).toBe(
      false,
    );
    const mechanical = clarkCountySeed.jurisdictionPermitTypes.find(
      (link) => link.permitTypeKey === "mechanical",
    );
    expect(mechanical?.isAvailable).toBe(true);
    expect(mechanical?.notes).toContain("No mechanical page is published yet");
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of CLARK_PUBLISHED_PERMIT_PAGES) {
      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: clarkCountySeed.sources.filter((source) => source.isPrimary).length,
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

    for (const page of CLARK_PUBLISHED_PERMIT_PAGES) {
      expect(page.seoTitle.trim().length).toBeGreaterThan(0);
      expect(page.seoDescription.trim().length).toBeGreaterThan(0);
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }

    // The jurisdiction's own SEO must not collide with any of its pages'.
    expect(titles.has(clarkCountySeed.profile.seoTitle)).toBe(false);
    expect(descriptions.has(clarkCountySeed.profile.seoDescription)).toBe(false);
  });

  it("dates every source and every verification with the day it was actually read", () => {
    for (const source of clarkCountySeed.sources) {
      expect(source.retrievedAt).toBe("2026-09-24");
      expect(source.lastVerifiedAt).toBe("2026-09-24");
    }
    for (const verification of clarkCountySeed.verifications) {
      expect(verification.verifiedAt).toBe("2026-09-24");
    }
  });

  it("records the client-rendered calculator as read but not as a source of rates", () => {
    const calculator = clarkCountySeed.sources.find(
      (source) => source.key === "clark-fees-calculator",
    );
    expect(calculator).toBeDefined();
    expect(calculator?.isPrimary).toBe(false);
    expect(calculator?.notes).toContain("client-rendered");

    // No fee rule may cite it: it publishes no rate.
    for (const entry of clarkCountySeed.feeRules) {
      expect(entry.rule.sourceId).not.toBe("clark-fees-calculator");
    }
  });

  it("records no telephone number for a document that printed none", () => {
    const department = clarkCountySeed.departments[0];
    expect(department?.phone).toBeNull();
    expect(department?.notes).toContain("a wrong number is worse than none");
    expect(department?.addressLine).toContain("4701 W. Russell Rd.");
  });
});

describe("Clark County Table 3-A — the County's own figures", () => {
  it("models six bands and nothing else on the building permit", () => {
    const rules = rulesFor("building");
    expect(rules).toHaveLength(6);
    expect(new Set(rules.map((rule) => rule.feeType))).toEqual(new Set(["flat", "per_thousand"]));
    expect(rules.every((rule) => rule.status === "active")).toBe(true);
    expect(rules.every((rule) => rule.sourceId === "clark-admin-code")).toBe(true);
  });

  it("reproduces each band at its own boundary", () => {
    // The published figure for a valuation at the top of each band.
    expect(feeAt(50_000)).toBe(5_400); // $54.00, the flat row
    expect(feeAt(200_000)).toBe(7_925); // $79.25, rounded from $79.245
    expect(feeAt(2_500_000)).toBe(24_882); // $248.82
    expect(feeAt(5_000_000)).toBe(36_695); // $366.95
    expect(feeAt(10_000_000)).toBe(53_705); // $537.05
  });

  it("closes four of the five seams to the cent", () => {
    const seams: Array<[number, number]> = [
      [50_000, 5_400], // band 1 -> band 2's base
      [2_500_000, 24_882], // band 3 -> band 4's base
      [5_000_000, 36_695], // band 4 -> band 5's base
      [10_000_000, 53_705], // band 5 -> band 6's base
    ];

    for (const [valuationCents, bandAboveBase] of seams) {
      expect(
        feeAt(valuationCents),
        `the table at $${valuationCents / 100} must equal the band above it`,
      ).toBe(bandAboveBase);
    }
  });

  it("leaves the $2,000 seam four cents apart, as the schedule prints it", () => {
    // The band below charges $54.00 plus $1.683 per additional $100: $79.245,
    // $79.25 rounded. The band above opens at $79.29. Both are published, so
    // both are reproduced and the discrepancy is asserted rather than fixed.
    expect(feeAt(200_000)).toBe(7_925);

    const bandAbove = rulesFor("building").find((rule) => rule.code === "TABLE-3A-2001-25000");
    expect(bandAbove?.config).toMatchObject({ baseCents: 7_929 });
    expect(feeAt(200_000) - 7_929).toBe(-4);
  });

  it("stores the four sub-cent rates as exact fractions, not as whole cents", () => {
    // The regression this jurisdiction was born from: `centsPerThousand: 7_371`
    // reads as 7,371 cents per $1,000, which is ten times the published $7.371.
    // Asserting both the storage and the arithmetic it produces.
    const rules = new Map(
      clarkCountySeed.feeRules.map((entry) => [entry.rule.code, entry.rule]),
    );

    const band3 = rules.get("TABLE-3A-2001-25000");
    expect(band3?.config).toMatchObject({
      rateCentsPerThousand: { numerator: 7_371, denominator: 10 },
    });
    expect((band3?.config as Record<string, unknown>).centsPerThousand).toBeUndefined();

    for (const code of [
      "TABLE-3A-25001-50000",
      "TABLE-3A-50001-100000",
      "TABLE-3A-100001-UP",
    ]) {
      const rule = rules.get(code);
      expect(rule?.config, code).toHaveProperty("rateCentsPerThousand");
      expect((rule?.config as Record<string, unknown>).centsPerThousand).toBeUndefined();
    }

    // And the arithmetic: band 3 at $25,000 is the published $248.82, not
    // $1,774.62 — the figure the whole-cents reading produces.
    expect(feeAt(2_500_000)).toBe(24_882);
  });

  it("charges a cent into a band a whole additional thousand, as \"fraction thereof\" says", () => {
    // $25,001 is band 4 with one whole increment, not a fraction of one.
    expect(feeAt(2_500_100)).toBe(24_882 + 473); // $4.725 rounds up to $4.73
    // Ten thousands in, ten whole increments: $47.25 exactly.
    expect(feeAt(3_500_000)).toBe(24_882 + 4_725);
    // And one dollar in, still one increment: $4.73, not $0.05.
    expect(feeAt(2_510_000)).toBe(24_882 + 473);
  });

  it("computes the building worked example: valuation $250,000", () => {
    expect(feeAt(25_000_000)).toBe(97_715); // $977.15
  });

  it("computes the electrical worked example: $30,000 of electrical work and two subpanels", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 3_000_000, custom: { panels: 2 } },
      rulesFor("electrical"),
    );
    expect(result.totalCents).toBe(28_115); // $272.45 + $8.70 = $281.15
    const subpanels = result.components.find(
      (component) => component.code === "TABLE-3B-SUBPANEL",
    );
    expect(subpanels?.amountCents).toBe(870);
  });

  it("prices a low-voltage point at $0.45 and nothing else reads that count", () => {
    const rule = clarkCountySeed.feeRules.find(
      (entry) => entry.rule.code === "TABLE-3B-LOW-VOLTAGE",
    )?.rule;
    expect(rule?.config).toMatchObject({ unit: "low_voltage_points", centsPerUnit: 45 });

    // The new kind is Clark County's alone: no other rule may read it.
    const others = clarkCountySeed.feeRules.filter(
      (entry) =>
        entry.rule.code !== "TABLE-3B-LOW-VOLTAGE" &&
        JSON.stringify(entry.rule.config).includes("low_voltage_points"),
    );
    expect(others).toEqual([]);
  });

  it("charges the flat trade item instead of the valuation bands, never both", () => {
    const waterHeater = calculatePermitFees(
      { asOf: AS_OF, custom: { schedule_item: "water_heater" } },
      rulesFor("plumbing"),
    );
    expect(waterHeater.totalCents).toBe(5_657); // $56.57
    expect(waterHeater.components).toHaveLength(1);
    expect(waterHeater.components[0]?.code).toBe("TABLE-3D-WATER-HEATER");

    // With no item selected the bands price it, and no flat row does.
    const byValuation = calculatePermitFees({ asOf: AS_OF, valuationCents: 3_000_000 }, rulesFor("plumbing"));
    expect(byValuation.components.some((component) => component.code === "TABLE-3D-WATER-HEATER")).toBe(
      false,
    );
    expect(byValuation.totalCents).toBeGreaterThan(0);
  });

  it("prices each of the five plumbing items at its published figure", () => {
    const expected: Record<string, number> = {
      gas_retag: 6_188,
      repipe: 5_657,
      reverse_osmosis: 5_657,
      water_heater: 5_657,
      water_softener: 5_657,
    };

    for (const [item, cents] of Object.entries(expected)) {
      const result = calculatePermitFees(
        { asOf: AS_OF, custom: { schedule_item: item } },
        rulesFor("plumbing"),
      );
      expect(result.totalCents, item).toBe(cents);
      expect(result.components, item).toHaveLength(1);
    }
  });

  it("prices each of the five electrical items at its published figure", () => {
    const expected: Record<string, number> = {
      electric_retag: 6_188,
      panel_200: 6_188,
      panel_600: 7_056,
      panel_2000: 8_680,
      panel_over_2000: 11_916,
    };

    for (const [item, cents] of Object.entries(expected)) {
      const result = calculatePermitFees(
        { asOf: AS_OF, custom: { schedule_item: item } },
        rulesFor("electrical"),
      );
      expect(result.totalCents, item).toBe(cents);
    }
  });

  it("models no plan review, because this chapter separates it rather than pricing it", () => {
    for (const entry of clarkCountySeed.feeRules) {
      expect(entry.rule.componentType).not.toBe("plan_review");
    }
    for (const page of CLARK_PUBLISHED_PERMIT_PAGES) {
      expect(page.notIncluded).toContain("Plan review");
    }
  });

  it("names every fee the chapter publishes but this release does not model", () => {
    for (const page of CLARK_PUBLISHED_PERMIT_PAGES) {
      expect(page.notIncluded, page.slug).toContain("Tables 3-E");
      expect(page.notIncluded, page.slug).toContain("impact fee");
      expect(page.notIncluded, page.slug).toContain("Las Vegas");
    }

    // The building page is where the grading tables are named in full, because
    // that is where a reader would most expect them to be included.
    const building = CLARK_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "building-permit-cost",
    );
    expect(building?.notIncluded).toContain("Grading permits and grading plan review");
    expect(building?.notIncluded).toContain("Every development impact fee");
  });
});

describe("Clark County — the schedule's own words on every page", () => {
  it("quotes the Table 3-A fallback sentence on both trade pages", () => {
    for (const slug of ["electrical-permit-cost", "plumbing-permit-cost"]) {
      const page = CLARK_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
      expect(page, slug).toBeDefined();
      expect(`${page?.intro}${page?.localSummary}`).toContain(
        "the total value of the scope of work being performed",
      );
    }
  });

  it("states the $54 issuance reading on both trade pages rather than hiding it", () => {
    for (const slug of ["electrical-permit-cost", "plumbing-permit-cost"]) {
      const page = CLARK_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
      expect(page?.notIncluded).toContain("$54.00 permit issuance row");
      expect(page?.faqs?.some((faq) => faq.answer.includes("$54"))).toBe(true);
    }
  });

  it("states the four-cent seam on the hub and on the building page", () => {
    expect(clarkCountySeed.profile.localContext).toContain("$79.245");
    expect(clarkCountySeed.profile.localContext).toContain("$79.29");

    const building = CLARK_PUBLISHED_PERMIT_PAGES.find(
      (page) => page.slug === "building-permit-cost",
    );
    expect(building?.localSummary).toContain("$79.245");
    expect(building?.localSummary).toContain("$79.29");
    expect(building?.faqs?.some((faq) => faq.answer.includes("$79.245"))).toBe(true);
  });

  it("counts an answer to every question a reader arriving from search has", () => {
    for (const page of CLARK_PUBLISHED_PERMIT_PAGES) {
      expect(page.faqs?.length, page.slug).toBeGreaterThanOrEqual(6);
      for (const faq of page.faqs ?? []) {
        expect(faq.answer.length, `${page.slug}: ${faq.question}`).toBeGreaterThan(60);
      }
    }
  });
});
