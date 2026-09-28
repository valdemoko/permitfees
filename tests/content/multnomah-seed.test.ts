import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import {
  MULTNOMAH_LAST_VERIFIED,
  MULTNOMAH_PUBLISHED_PERMIT_PAGES,
  multnomahCountySeed,
} from "@/content/multnomahcounty";
import { portlandSeed } from "@/content/portland";
import { calculatePermitFees, validateFeeRule, type CalculationInput, type FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Unincorporated Multnomah County's content.
 *
 * This is the second half of a pair, so most of what is worth asserting is about the
 * relationship: the county's permits are issued by the City of Portland's permitting
 * department, its building permit fee table is the city's table, and what is *not* there
 * — the Development Services Fee — is the entire difference between the two jurisdictions'
 * totals. The tests below hold both halves to the same figures and compute the difference
 * from the rules rather than from arithmetic done by hand.
 */

const AS_OF = "2026-09-24";

const dollars = (amount: number): number => Math.round(amount * 100);

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  multnomahCountySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const fee = (permitTypeKey: string, input: Omit<CalculationInput, "asOf">) =>
  calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey));

const cityFee = (permitTypeKey: string, input: Omit<CalculationInput, "asOf">) =>
  calculatePermitFees(
    { asOf: AS_OF, ...input },
    portlandSeed.feeRules
      .filter((entry) => entry.permitTypeKey === permitTypeKey)
      .map((entry) => entry.rule),
  );

const countyBuilding = (valuation: number, input: Partial<CalculationInput> = {}) =>
  fee("building", { valuationCents: dollars(valuation), ...input });

type Result = ReturnType<typeof calculatePermitFees>;

const amountOf = (result: Result, code: string): number =>
  result.components.find((component) => component.code === code)?.amountCents ?? -1;

const codesOf = (result: Result): string[] => result.components.map((component) => component.code);

describe("Multnomah County payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of multnomahCountySeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(multnomahCountySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(multnomahCountySeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...multnomahCountySeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of multnomahCountySeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of multnomahCountySeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of multnomahCountySeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }

    for (const requirement of multnomahCountySeed.requirements) {
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }
  });

  it("is a county, in the same state and county as Portland", () => {
    expect(multnomahCountySeed.state.code).toBe("OR");
    expect(multnomahCountySeed.county.slug).toBe("multnomah-county");
    expect(multnomahCountySeed.jurisdiction.type).toBe("county");
    expect(multnomahCountySeed.jurisdiction.slug).toBe("multnomah-county");
    expect(multnomahCountySeed.jurisdiction.countyKey).toBe(portlandSeed.jurisdiction.countyKey);
    expect(multnomahCountySeed.jurisdiction.stateKey).toBe(portlandSeed.jurisdiction.stateKey);
    expect(multnomahCountySeed.permitTypes).toEqual([]);
    expect(multnomahCountySeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: building, electrical and plumbing", () => {
    expect(MULTNOMAH_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(multnomahCountySeed.permitPages.every((page) => page.publishStatus === "published")).toBe(true);
    expect(multnomahCountySeed.permitPages.every((page) => page.noindex === false)).toBe(true);
  });

  it("clears the editorial gate on every page, with an intro of substance", () => {
    for (const page of MULTNOMAH_PUBLISHED_PERMIT_PAGES) {
      expect(page.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: multnomahCountySeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: MULTNOMAH_LAST_VERIFIED,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("links mechanical without publishing a page for it", () => {
    const links = multnomahCountySeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey);
    expect(links).toContain("mechanical");
    expect(multnomahCountySeed.permitPages.map((page) => page.permitTypeKey)).not.toContain("mechanical");
  });

  it("names the City's permitting department as the issuer of the county's permits", () => {
    const department = multnomahCountySeed.departments[0]!;
    expect(department.name).toContain("Portland Permitting");
    expect(department.jurisdictionKey).toBe(multnomahCountySeed.jurisdiction.key);
    expect(department.notes ?? "").toContain("City's");
  });
});

describe("Multnomah County's building permit fee is the city's table", () => {
  it("charges the same figure at every seam the document prints", () => {
    const seams: Array<[number, number, string]> = [
      [500, 16_700, "BUILD-FEE-1"],
      [2_000, 22_085, "BUILD-FEE-1"],
      [2_001, 23_476, "BUILD-FEE-2"],
      [25_000, 54_078, "BUILD-FEE-2"],
      [50_000, 79_728, "BUILD-FEE-3"],
      [100_000, 113_778, "BUILD-FEE-4"],
      [100_001, 114_341, "BUILD-FEE-5"],
      [250_000, 198_228, "BUILD-FEE-5"],
    ];

    for (const [valuation, expected, code] of seams) {
      expect(amountOf(countyBuilding(valuation), code), `$${valuation}`).toBe(expected);
      expect(
        amountOf(cityFee("building", { valuationCents: dollars(valuation) }), code),
        `city at $${valuation}`,
      ).toBe(expected);
    }
  });

  it("charges no Development Services Fee on any valuation", () => {
    for (const valuation of [1_000, 2_000, 250_000, 5_000_000]) {
      const result = countyBuilding(valuation, { custom: { building_class: "commercial" } });
      expect(codesOf(result).filter((code) => code.startsWith("DEV-SERVICES")), `$${valuation}`).toEqual([]);
    }
  });

  it("keeps plan review at 65% of its own permit fee", () => {
    for (const valuation of [40_000, 250_000, 1_000_000]) {
      const result = countyBuilding(valuation, { custom: { building_class: "commercial" } });
      const base = result.components
        .filter((component) => component.componentType === "base")
        .reduce((sum, component) => sum + component.amountCents, 0);
      expect(amountOf(result, "PLAN-REVIEW-65"), `$${valuation}`).toBe(Math.round(base * 0.65));
    }
  });
});

describe("the county and the city differ by the city's own fee and nothing else", () => {
  it("computes the difference as the Development Services Fee at three valuations", () => {
    for (const valuation of [250_000, 1_000_000, 5_000_000]) {
      const input = { valuationCents: dollars(valuation), custom: { building_class: "commercial" } };
      const city = cityFee("building", input);
      const county = fee("building", input);
      const cityFeeCents = city.components
        .filter((component) => component.componentType === "other")
        .reduce((sum, component) => sum + component.amountCents, 0);

      expect(cityFeeCents, `$${valuation}`).toBeGreaterThan(0);
      expect(city.totalCents - county.totalCents, `$${valuation}`).toBe(cityFeeCents);
      // The permit fee, the review and the surcharge are identical in both.
      expect(amountOf(county, "PLAN-REVIEW-65"), `$${valuation}`).toBe(amountOf(city, "PLAN-REVIEW-65"));
      expect(amountOf(county, "STATE-SURCHARGE-12"), `$${valuation}`).toBe(amountOf(city, "STATE-SURCHARGE-12"));
    }
  });

  it("charges the same electrical and plumbing fees as the city on the same inputs", () => {
    const cases: Array<[string, Omit<CalculationInput, "asOf">]> = [
      ["electrical", { squareFootage: 1_700, custom: { electrical_item: "residential_package" } }],
      ["electrical", { custom: { electrical_item: "service", service_amps: 200, circuits: 6 } }],
      ["electrical", { custom: { electrical_item: "circuits", circuits: 6 } }],
      ["plumbing", { fixtures: 4 }],
      ["plumbing", { custom: { dwelling_scope: "new_1_2_family", bathrooms: 2 } }],
      ["plumbing", { custom: { dwelling_scope: "new_1_2_family", bathrooms: 5 } }],
    ];

    for (const [permitTypeKey, input] of cases) {
      const label = `${permitTypeKey}: ${JSON.stringify(input)}`;
      expect(fee(permitTypeKey, input).totalCents, label).toBe(
        cityFee(permitTypeKey, input).totalCents,
      );
      expect(fee(permitTypeKey, input).totalCents, label).toBeGreaterThan(0);
    }
  });

  it("cites its own documents even where the figures agree with the city's", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const countySources = new Set(rulesFor(permitTypeKey).map((rule) => rule.sourceId));
      const citySources = new Set(
        portlandSeed.feeRules
          .filter((entry) => entry.permitTypeKey === permitTypeKey)
          .map((entry) => entry.rule.sourceId),
      );
      for (const source of countySources) {
        expect(source, permitTypeKey).not.toBeNull();
      }
      expect(
        [...countySources].some((source) => !citySources.has(source)),
        `${permitTypeKey} should cite at least one document of its own`,
      ).toBe(true);
    }
  });
});

describe("Multnomah County worked examples — the payload against its own prose", () => {
  const expected: Record<string, number> = {
    "building-permit-cost": 350_863, // $1,982.28 + $1,288.48 + $237.87
    "electrical-permit-cost": 81_378, // $594.00 + $148.50 + $71.28
    "plumbing-permit-cost": 34_524, // $252.00 + $63.00 + $30.24
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of MULTNOMAH_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("prices the electrical example's package by its published 500-square-foot steps", () => {
    const packageAt = (squareFootage: number) =>
      amountOf(
        fee("electrical", { squareFootage, custom: { electrical_item: "residential_package" } }),
        "ELEC-RESIDENTIAL-SQFT-PACKAGE",
      );
    expect(packageAt(1_000)).toBe(40_800);
    expect(packageAt(1_001)).toBe(50_100); // the page's "one square foot past the allowance"
    expect(packageAt(1_700)).toBe(59_400);
    expect(packageAt(2_001)).toBe(68_700);
  });

  it("charges the plumbing example per fixture and not per bath", () => {
    const result = fee("plumbing", { fixtures: 4 });
    expect(amountOf(result, "PLUMB-FIXTURE-EACH")).toBe(25_200);
    expect(codesOf(result).filter((code) => code.startsWith("PLUMB-DWELLING"))).toEqual([]);
  });

  it("prices a new two-bath house by its baths, with no fixture line", () => {
    const result = fee("plumbing", { custom: { dwelling_scope: "new_1_2_family", bathrooms: 2 } });
    expect(result.totalCents).toBe(162_619);
    expect(amountOf(result, "PLUMB-DWELLING-2BATH")).toBe(118_700);
    expect(codesOf(result)).not.toContain("PLUMB-FIXTURE-EACH");
  });
});
