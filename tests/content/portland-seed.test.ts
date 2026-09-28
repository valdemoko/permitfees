import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import { PORTLAND_LAST_VERIFIED, PORTLAND_PUBLISHED_PERMIT_PAGES, portlandSeed } from "@/content/portland";
import {
  MULTNOMAH_BUILDING_RULES,
  MULTNOMAH_ELECTRICAL_RULES,
  MULTNOMAH_PLUMBING_RULES,
  PORTLAND_BUILDING_RULES,
  PORTLAND_ELECTRICAL_RULES,
  PORTLAND_PLUMBING_RULES,
} from "@/content/portland/fee-rules";
import { calculatePermitFees, validateFeeRule, type CalculationInput, type FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Portland's content, checked against the six documents it came from.
 *
 * Three things here are properties of the state rather than of the city, and they are
 * what these tests exist for:
 *
 * 1. **The building permit fee table is shared with unincorporated Multnomah County.**
 *    The two schedules print the same five bands, so both payloads are built by the same
 *    function with a different source id. Comparing the two rule sets' configs is what
 *    makes "the same fee in two places" checkable rather than asserted in prose.
 * 2. **The Development Services Fee is the city's alone.** It is charged on the same
 *    valuation as the building permit fee, it comes in two published versions, its
 *    commercial first band does not close with its own second band, and it is the whole
 *    of the difference between the two jurisdictions' totals.
 * 3. **The 12% state surcharge and the two plan review percentages.** The surcharge is
 *    read on the permit fee and not on the finished total — the alternative reading is
 *    stated on the pages with its size — and plan review is 65% on a building permit and
 *    25% on a trade permit in the same jurisdiction.
 */

const AS_OF = "2026-09-24";

const dollars = (amount: number): number => Math.round(amount * 100);

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  portlandSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const fee = (permitTypeKey: string, input: Omit<CalculationInput, "asOf">) =>
  calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey));

const building = (valuation: number, input: Partial<CalculationInput> = {}) =>
  fee("building", { valuationCents: dollars(valuation), ...input });

const countyBuilding = (valuation: number, input: Partial<CalculationInput> = {}) =>
  calculatePermitFees(
    { asOf: AS_OF, valuationCents: dollars(valuation), ...input },
    MULTNOMAH_BUILDING_RULES,
  );

type Result = ReturnType<typeof calculatePermitFees>;

/** A component's amount, or -1 when the rule did not apply at all. */
const amountOf = (result: Result, code: string): number =>
  result.components.find((component) => component.code === code)?.amountCents ?? -1;

const ofType = (result: Result, type: string): number =>
  result.components
    .filter((component) => component.componentType === type)
    .reduce((sum, component) => sum + component.amountCents, 0);

const codesOf = (result: Result): string[] => result.components.map((component) => component.code);

describe("Portland payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of portlandSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(portlandSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(portlandSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...portlandSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of portlandSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of portlandSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of portlandSeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }

    for (const requirement of portlandSeed.requirements) {
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }
  });

  it("defines Oregon and Portland, and no permit type Houston does not have", () => {
    expect(portlandSeed.state.code).toBe("OR");
    expect(portlandSeed.state.slug).toBe("oregon");
    expect(portlandSeed.jurisdiction.slug).toBe("portland");
    expect(portlandSeed.county.slug).toBe("multnomah-county");
    expect(portlandSeed.permitTypes).toEqual([]);
    expect(portlandSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: building, electrical and plumbing", () => {
    expect(PORTLAND_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(portlandSeed.permitPages.every((page) => page.publishStatus === "published")).toBe(true);
    expect(portlandSeed.permitPages.every((page) => page.noindex === false)).toBe(true);
  });

  it("clears the editorial gate on every page, with an intro of substance", () => {
    for (const page of PORTLAND_PUBLISHED_PERMIT_PAGES) {
      expect(page.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: portlandSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: PORTLAND_LAST_VERIFIED,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("links mechanical without publishing a page for it", () => {
    const links = portlandSeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey);
    expect(links).toContain("mechanical");
    expect(portlandSeed.permitPages.map((page) => page.permitTypeKey)).not.toContain("mechanical");
  });

  it("leaves the state's own sources unowned rather than attributing them to the city", () => {
    for (const key of ["oregon-oar-918-050-0100", "oregon-bcd-surcharge-backgrounder"]) {
      const source = portlandSeed.sources.find((entry) => entry.key === key);
      expect(source, key).toBeDefined();
      expect(source!.authorityKind, key).toBe("state");
      expect(source!.jurisdictionKey, key).toBeNull();
    }
  });
});

describe("Portland building permit fee — five bands that close", () => {
  it("charges the $167.00 minimum for anything up to $500 of valuation", () => {
    expect(amountOf(building(1), "BUILD-FEE-1")).toBe(16_700);
    expect(amountOf(building(500), "BUILD-FEE-1")).toBe(16_700);
  });

  it("counts the first band in hundreds: $3.59 for each additional $100", () => {
    // $501 rounds up to $600: $167.00 + $3.59.
    expect(amountOf(building(501), "BUILD-FEE-1")).toBe(17_059);
    // $1,000: $167.00 + 5 × $3.59.
    expect(amountOf(building(1_000), "BUILD-FEE-1")).toBe(18_495);
  });

  it("chains exactly at every seam the document prints", () => {
    // The figure the lower band produces at its top is the next band's opening figure.
    expect(amountOf(building(2_000), "BUILD-FEE-1")).toBe(22_085); // $220.85
    expect(amountOf(building(2_001), "BUILD-FEE-2")).toBe(23_476); // $220.85 + $13.91
    expect(amountOf(building(25_000), "BUILD-FEE-2")).toBe(54_078); // $540.78
    expect(amountOf(building(25_001), "BUILD-FEE-3")).toBe(55_104); // $540.78 + $10.26
    expect(amountOf(building(50_000), "BUILD-FEE-3")).toBe(79_728); // $797.28
    expect(amountOf(building(50_001), "BUILD-FEE-4")).toBe(80_409); // $797.28 + $6.81
    expect(amountOf(building(100_000), "BUILD-FEE-4")).toBe(113_778); // $1,137.78
    expect(amountOf(building(100_001), "BUILD-FEE-5")).toBe(114_341); // $1,137.78 + $5.63
    expect(amountOf(building(1_000_000), "BUILD-FEE-5")).toBe(620_478); // $1,137.78 + 900 × $5.63
  });

  it("charges one band only, never two", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: dollars(250_000) }, [
      ...PORTLAND_BUILDING_RULES.filter((rule) => rule.code.startsWith("BUILD-FEE")),
    ]);
    expect(result.components).toHaveLength(1);
    expect(result.totalCents).toBe(198_228); // $1,137.78 + 150 × $5.63
  });
});

describe("Portland plan review and the state surcharge", () => {
  const commercial = (valuation: number) => building(valuation, { custom: { building_class: "commercial" } });

  it("charges plan review as 65% of the permit fee", () => {
    const result = commercial(250_000);
    expect(amountOf(result, "BUILD-FEE-5")).toBe(198_228);
    expect(amountOf(result, "PLAN-REVIEW-65")).toBe(128_848);
  });

  it("reads the surcharge off the permit fee and not off the total", () => {
    const result = commercial(250_000);
    expect(amountOf(result, "STATE-SURCHARGE-12")).toBe(23_787);
    // The reading on the finished total: 12% of everything except the surcharge itself,
    // which is what the page states as the alternative.
    const withoutSurcharge = result.components
      .filter((component) => component.componentType !== "state_surcharge")
      .reduce((sum, component) => sum + component.amountCents, 0);
    expect(Math.round(withoutSurcharge * 0.12)).toBe(47_060);
  });

  it("takes both percentages from the permit fee at every valuation, not just the example", () => {
    for (const valuation of [50_000, 250_000, 1_000_000, 5_000_000]) {
      const result = commercial(valuation);
      const base = ofType(result, "base");
      expect(base, `$${valuation}`).toBeGreaterThan(0);
      expect(amountOf(result, "PLAN-REVIEW-65"), `$${valuation}`).toBe(Math.round(base * 0.65));
      expect(amountOf(result, "STATE-SURCHARGE-12"), `$${valuation}`).toBe(Math.round(base * 0.12));
    }
  });

  it("keeps the Development Services Fee out of the surcharge's subject", () => {
    const withCityFee = commercial(250_000);
    const withoutCityFee = countyBuilding(250_000, { custom: { building_class: "commercial" } });
    expect(ofType(withCityFee, "other")).toBe(65_091);
    expect(amountOf(withCityFee, "STATE-SURCHARGE-12")).toBe(amountOf(withoutCityFee, "STATE-SURCHARGE-12"));
  });
});

describe("Portland's Development Services Fee — the city's own table", () => {
  it("charges the residential table for a dwelling and the commercial table for everything else", () => {
    const residential = building(250_000, { custom: { building_class: "residential" } });
    expect(amountOf(residential, "DEV-SERVICES-RESIDENTIAL-5")).toBe(52_301);
    expect(amountOf(residential, "DEV-SERVICES-COMMERCIAL-5")).toBe(-1);

    const commercial = building(250_000, { custom: { building_class: "commercial" } });
    expect(amountOf(commercial, "DEV-SERVICES-COMMERCIAL-5")).toBe(65_091);
    expect(amountOf(commercial, "DEV-SERVICES-RESIDENTIAL-5")).toBe(-1);
  });

  it("falls back to the commercial table when no occupancy is named", () => {
    // The document's own residual category: the residential table is for one- and
    // two-family dwellings and the commercial table is for everything else.
    const unspecified = building(250_000);
    expect(amountOf(unspecified, "DEV-SERVICES-COMMERCIAL-5")).toBe(65_091);
    expect(unspecified.totalCents).toBe(
      building(250_000, { custom: { building_class: "commercial" } }).totalCents,
    );
  });

  it("does not close at its own first seam, and the residential table does", () => {
    // Commercial: $26.49 + 15 × $1.16 at $2,000 is $43.89, while band 2 opens at
    // $44.79 — ninety cents that exist in the document and are reported rather than
    // smoothed away.
    expect(amountOf(building(2_000, { custom: { building_class: "commercial" } }), "DEV-SERVICES-COMMERCIAL-1")).toBe(
      4_389,
    );
    expect(amountOf(building(2_001, { custom: { building_class: "commercial" } }), "DEV-SERVICES-COMMERCIAL-2")).toBe(
      4_479 + 469,
    );

    // Residential: $21.19 + 15 × $0.97 is $35.74, exactly what its band 2 opens with.
    expect(amountOf(building(2_000, { custom: { building_class: "residential" } }), "DEV-SERVICES-RESIDENTIAL-1")).toBe(
      3_574,
    );
    expect(amountOf(building(2_001, { custom: { building_class: "residential" } }), "DEV-SERVICES-RESIDENTIAL-2")).toBe(
      3_574 + 374,
    );
  });

  it("is charged on the same valuation as the permit fee, one band at a time", () => {
    const result = building(40_000, { custom: { building_class: "commercial" } });
    expect(amountOf(result, "BUILD-FEE-3")).toBe(54_078 + 15 * 1_026); // $540.78 + 15 × $10.26
    expect(amountOf(result, "DEV-SERVICES-COMMERCIAL-3")).toBe(15_266 + 15 * 349);
    expect(codesOf(result).filter((code) => code.startsWith("DEV-SERVICES"))).toHaveLength(1);
  });

  it("is the whole of the difference between the city's total and the county's", () => {
    for (const valuation of [250_000, 1_000_000, 5_000_000]) {
      const city = building(valuation, { custom: { building_class: "commercial" } });
      const county = countyBuilding(valuation, { custom: { building_class: "commercial" } });
      const cityFee = ofType(city, "other");
      expect(cityFee, `$${valuation}`).toBeGreaterThan(0);
      expect(city.totalCents - county.totalCents, `$${valuation}`).toBe(cityFee);
    }
  });
});

describe("Portland electrical permit", () => {
  const electrical = (input: Partial<CalculationInput> = {}) => fee("electrical", input);

  it("charges a 200-ampere service and six circuits bought with it", () => {
    const result = electrical({ custom: { electrical_item: "service", service_amps: 200, circuits: 6 } });
    expect(amountOf(result, "ELEC-SERVICE-200A")).toBe(21_200);
    expect(amountOf(result, "ELEC-CIRCUITS-WITH-SERVICE")).toBe(12_600);
    expect(amountOf(result, "ELEC-PLAN-REVIEW-25")).toBe(Math.round(33_800 * 0.25));
    expect(amountOf(result, "STATE-SURCHARGE-12")).toBe(Math.round(33_800 * 0.12));
    expect(result.totalCents).toBe(46_306);
  });

  it("charges $174.00 for the first circuit when no service fee was paid", () => {
    const one = electrical({ custom: { electrical_item: "circuits", circuits: 1 } });
    expect(amountOf(one, "ELEC-CIRCUITS-WITHOUT-SERVICE")).toBe(17_400);

    const six = electrical({ custom: { electrical_item: "circuits", circuits: 6 } });
    expect(amountOf(six, "ELEC-CIRCUITS-WITHOUT-SERVICE")).toBe(17_400 + 2_100 * 5);
    expect(amountOf(six, "ELEC-CIRCUITS-WITH-SERVICE")).toBe(-1);
    expect(six.totalCents).toBe(38_223);
  });

  it("never charges both circuit rows to one permit", () => {
    for (const custom of [
      { electrical_item: "service", service_amps: 200, circuits: 4 },
      { electrical_item: "circuits", circuits: 4 },
    ]) {
      const rows = codesOf(electrical({ custom })).filter((code) => code.startsWith("ELEC-CIRCUITS"));
      expect(rows, JSON.stringify(custom)).toHaveLength(1);
    }
  });

  it("prices the residential square-foot package by the published 500-square-foot steps", () => {
    const packageAt = (squareFootage: number) =>
      amountOf(
        electrical({ squareFootage, custom: { electrical_item: "residential_package" } }),
        "ELEC-RESIDENTIAL-SQFT-PACKAGE",
      );

    expect(packageAt(800)).toBe(40_800);
    expect(packageAt(1_000)).toBe(40_800);
    expect(packageAt(1_001)).toBe(50_100);
    expect(packageAt(1_500)).toBe(50_100);
    expect(packageAt(1_700)).toBe(59_400);
    expect(packageAt(2_000)).toBe(59_400);
    expect(packageAt(2_001)).toBe(68_700);
  });

  it("charges 25% plan review on a trade permit, not the building permit's 65%", () => {
    const result = electrical({ custom: { electrical_item: "service", service_amps: 200 } });
    expect(amountOf(result, "ELEC-PLAN-REVIEW-25")).toBe(Math.round(21_200 * 0.25));
    expect(codesOf(result)).not.toContain("PLAN-REVIEW-65");
  });

  it("bands services, feeders and temporary services on their own rows", () => {
    const service = (amps: number, item = "service") =>
      electrical({ custom: { electrical_item: item, service_amps: amps } });
    expect(amountOf(service(200), "ELEC-SERVICE-200A")).toBe(21_200);
    expect(amountOf(service(400), "ELEC-SERVICE-201-400A")).toBe(29_800);
    expect(amountOf(service(1_200), "ELEC-SERVICE-OVER-1000A")).toBe(107_700);
    expect(amountOf(service(200, "temporary_service"), "ELEC-TEMP-200A")).toBe(18_700);
    expect(amountOf(service(400, "temporary_service"), "ELEC-TEMP-201-400A")).toBe(28_300);
  });
});

describe("Portland plumbing permit", () => {
  const plumbing = (input: Partial<CalculationInput> = {}) => fee("plumbing", input);

  it("prices a new dwelling by its baths, and adds $334.00 for each one after the third", () => {
    const published: Array<[number, number]> = [
      [1, 79_200],
      [2, 118_700],
      [3, 138_800],
      [4, 138_800 + 33_400],
      [5, 138_800 + 33_400 * 2],
    ];

    for (const [baths, expected] of published) {
      const result = plumbing({ custom: { dwelling_scope: "new_1_2_family", bathrooms: baths } });
      expect(result.totalCents, `${baths} baths`).toBe(
        expected + Math.round(expected * 0.25) + Math.round(expected * 0.12),
      );
      expect(
        codesOf(result).filter((code) => code.startsWith("PLUMB-DWELLING")),
        `${baths} baths`,
      ).toHaveLength(1);
    }
  });

  it("charges $63.00 a fixture when the dwelling row does not apply", () => {
    const four = plumbing({ fixtures: 4 });
    expect(amountOf(four, "PLUMB-FIXTURE-EACH")).toBe(25_200);
    expect(amountOf(four, "PLUMB-PLAN-REVIEW-25")).toBe(6_300);
    expect(amountOf(four, "STATE-SURCHARGE-12")).toBe(3_024);
    expect(four.totalCents).toBe(34_524);
  });

  it("never charges the bath rows and the fixture rows to one permit", () => {
    const dwelling = plumbing({
      fixtures: 6,
      custom: { dwelling_scope: "new_1_2_family", bathrooms: 2 },
    });
    expect(codesOf(dwelling)).not.toContain("PLUMB-FIXTURE-EACH");
    expect(amountOf(dwelling, "PLUMB-DWELLING-2BATH")).toBe(118_700);

    const alteration = plumbing({ fixtures: 6 });
    expect(codesOf(alteration)).not.toContain("PLUMB-DWELLING-2BATH");
    expect(amountOf(alteration, "PLUMB-FIXTURE-EACH")).toBe(37_800);
  });

  it("charges nothing, and says so, when neither a fixture count nor a scope is provided", () => {
    const result = plumbing({});
    expect(result.totalCents).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("Portland worked examples — the payload against its own prose", () => {
  /**
   * Each page states a figure in its notes and its questions. The engine computes what
   * the page renders, so the two must agree: a stored input that is out by a factor of
   * ten passes the schema, the typechecker and every sentence around it.
   */
  const expected: Record<string, number> = {
    "building-permit-cost": 415_954, // $1,982.28 + $650.91 + $1,288.48 + $237.87
    "electrical-permit-cost": 46_306, // $212.00 + $126.00 + $84.50 + $40.56
    "plumbing-permit-cost": 162_619, // $1,187.00 + $296.75 + $142.44
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of PORTLAND_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("computes the county comparison the building page's notes state", () => {
    const page = PORTLAND_PUBLISHED_PERMIT_PAGES.find((p) => p.slug === "building-permit-cost")!;
    const county = countyBuilding(250_000, { custom: { building_class: "commercial" } });
    expect(county.totalCents).toBe(350_863); // $3,508.63
    expect(page.workedExample!.inputs.valuationCents).toBe(25_000_000);
  });
});

describe("the two Oregon schedules agree where their documents agree", () => {
  /** A rule as the engine sees it, so two rule sets can be compared field by field. */
  const shape = (rule: FeeRuleRecord) => ({
    code: rule.code,
    feeType: rule.feeType,
    config: rule.config,
    componentType: rule.componentType,
    priority: rule.priority,
    conditions: rule.conditions,
  });

  it("builds the county's building rules from the city's, minus the city's own table", () => {
    const city = PORTLAND_BUILDING_RULES.filter((rule) => !rule.code.startsWith("DEV-SERVICES")).map(shape);
    const county = MULTNOMAH_BUILDING_RULES.map(shape);
    expect(county).toEqual(city);
  });

  it("gives both jurisdictions the same electrical and plumbing rules", () => {
    expect(MULTNOMAH_ELECTRICAL_RULES.map(shape)).toEqual(PORTLAND_ELECTRICAL_RULES.map(shape));
    expect(MULTNOMAH_PLUMBING_RULES.map(shape)).toEqual(PORTLAND_PLUMBING_RULES.map(shape));
  });

  it("only cites a different source document, not a different fee", () => {
    const citySource = PORTLAND_ELECTRICAL_RULES[0]!.sourceId;
    const countySource = MULTNOMAH_ELECTRICAL_RULES[0]!.sourceId;
    expect(citySource).not.toBe(countySource);
    expect(MULTNOMAH_ELECTRICAL_RULES.every((rule) => rule.sourceId !== null)).toBe(true);
  });

  it("has no Development Services row in the county's schedule at all", () => {
    const codes = [
      ...MULTNOMAH_BUILDING_RULES,
      ...MULTNOMAH_ELECTRICAL_RULES,
      ...MULTNOMAH_PLUMBING_RULES,
    ].map((rule) => rule.code);
    expect(codes.filter((code) => code.startsWith("DEV-SERVICES"))).toEqual([]);
  });
});
