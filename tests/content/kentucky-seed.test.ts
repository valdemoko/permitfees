import { describe, expect, it } from "vitest";

import { louisvilleSeed } from "@/content/louisville";
import { lexingtonSeed } from "@/content/lexington";
import type { JurisdictionSeed } from "@/content/seed-types";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

const asOf = "2026-09-26";

function rulesFor(seed: JurisdictionSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(
  seed: JurisdictionSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(seed, permitTypeKey));
}

function totalFor(
  seed: JurisdictionSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
): number {
  return calculate(seed, permitTypeKey, input).totalCents;
}

function amountFor(
  seed: JurisdictionSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(seed, permitTypeKey, input).components.find((c) => c.code === code)
    ?.amountCents;
}

function checkSeedShape(
  seed: JurisdictionSeed,
  label: string,
  opts: { hasNoScheduleStatement?: boolean } = {},
) {
  it(`${label}: every fee rule validates through the engine schema`, () => {
    for (const entry of seed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
    const ids = seed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it(`${label}: publishes 3 pages that clear the editorial gate`, () => {
    expect(seed.permitPages).toHaveLength(3);
    expect(seed.permitPages.map((p) => p.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    for (const page of seed.permitPages) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThanOrEqual(
        MIN_LOCAL_SUMMARY_LENGTH,
      );
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: seed.sources.length,
        feeRuleCount: rulesFor(seed, page.permitTypeKey).length,
        hasNoScheduleStatement: opts.hasNoScheduleStatement,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it(`${label}: computes every worked example above zero with only condition exclusions`, () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const page = seed.permitPages.find(
        (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
      );
      if (!page?.workedExample) continue;
      const input: CalculationInput = {
        asOf,
        ...(page.workedExample.inputs as Partial<CalculationInput>),
      };
      const result = calculatePermitFees(input, rulesFor(seed, permitTypeKey));
      expect(result.components.length, `${permitTypeKey} components`).toBeGreaterThan(0);
      expect(result.totalCents, `${permitTypeKey} total`).toBeGreaterThan(0);
      for (const excluded of result.excluded) {
        expect(excluded.reason, `${permitTypeKey}: ${excluded.code}`).toBe("conditions_not_met");
      }
    }
  });

  it(`${label}: ties every rule's source to a declared primary official source`, () => {
    expect(seed.sources.length).toBeGreaterThan(0);
    const sourceKeys = new Set(seed.sources.map((source) => source.key));
    for (const source of seed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).not.toBeNull();
      expect(new URL(source.url).protocol, source.url).toBe("https:");
    }
    for (const entry of seed.feeRules) {
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), entry.rule.sourceId).toBe(true);
      }
    }
  });

  it(`${label}: verifies every permit page in the ledger`, () => {
    for (const page of seed.permitPages) {
      const record = seed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
}

describe("Kentucky seed payloads", () => {
  describe("Louisville, KY", () => {
    checkSeedShape(louisvilleSeed, "Louisville");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(louisvilleSeed.state).toMatchObject({ code: "KY", slug: "kentucky", fipsCode: "21" });
      expect(louisvilleSeed.county).toMatchObject({
        key: "jefferson-county-ky",
        name: "Jefferson County",
        fipsCode: "21111",
      });
      expect(louisvilleSeed.jurisdiction).toMatchObject({
        key: "louisville",
        officialName: expect.stringContaining("Construction Review"),
        websiteUrl: "https://louisvilleky.gov",
      });
    });

    it("prices new residential construction at $.105 per square foot", () => {
      // 4,000 sq ft single-family home: $0.105 x 4,000 = $420
      const input = { squareFootage: 4_000, occupancy: "residential" as const };
      expect(totalFor(louisvilleSeed, "building", input)).toBe(42_000);
      expect(amountFor(louisvilleSeed, "building", input, "LOU-BLD-RES-12FAM")).toBe(42_000);
    });

    it("prices commercial construction by occupancy, defaulting to business $.15", () => {
      // 20,000 sq ft commercial: $0.15 x 20,000 = $3,000
      const input = { squareFootage: 20_000, occupancy: "commercial" as const };
      expect(totalFor(louisvilleSeed, "building", input)).toBe(300_000);
      // A named assembly use prices $.16
      expect(
        totalFor(louisvilleSeed, "building", {
          squareFootage: 10_000,
          occupancy: "other",
          custom: { building_use: "assembly" },
        }),
      ).toBe(160_000);
    });

    it("defaults residential multi-family to the $.15 row at three or more units", () => {
      // 8,000 sq ft, 12 units: $0.15 x 8,000 = $1,200
      expect(
        totalFor(louisvilleSeed, "building", {
          squareFootage: 8_000,
          occupancy: "residential",
          units: 12,
        }),
      ).toBe(120_000);
    });

    it("charges the estimated-cost ladder where square footage cannot be calculated", () => {
      // $20,000: $50 + 20 x $2.50 = $100? No — $2.50 per $1,000 or fraction:
      // $50 base covers the first $1,000, then 19 additional $1,000-or-fraction
      // bands x $2.50 = $47.50. $97.50 total.
      expect(totalFor(louisvilleSeed, "building", { valuationCents: 2_000_000 })).toBe(9_750);
      // A fraction into a band rounds up: $10,500 buys eleven bands.
      expect(
        amountFor(louisvilleSeed, "building", { valuationCents: 1_050_000 }, "LOU-BLD-ESTCOST"),
      ).toBe(7_500);
    });

    it("holds the $75 permit minimum as a shortfall charge", () => {
      // $500 job: $50 ladder + $25 shortfall = $75
      const input = { valuationCents: 50_000 };
      expect(totalFor(louisvilleSeed, "building", input)).toBe(7_500);
      expect(amountFor(louisvilleSeed, "building", input, "LOU-BLD-MINIMUM-75")).toBe(2_500);
      // A fee above $75 charges no shortfall.
      expect(amountFor(louisvilleSeed, "building", { valuationCents: 2_000_000 }, "LOU-BLD-MINIMUM-75")).toBe(0);
    });

    it("prices foundation-only permits at $75 residential and $125 otherwise", () => {
      expect(
        totalFor(louisvilleSeed, "building", {
          occupancy: "residential",
          workType: "other",
          custom: { foundation_only: true },
        }),
      ).toBe(7_500);
      expect(
        totalFor(louisvilleSeed, "building", {
          occupancy: "commercial",
          workType: "other",
          custom: { foundation_only: true },
        }),
      ).toBe(12_500);
    });

    it("prices the initial 1-2 family electrical installation at $200", () => {
      expect(
        totalFor(louisvilleSeed, "electrical", {
          occupancy: "residential",
          workType: "new_construction",
        }),
      ).toBe(20_000);
    });

    it("prices service amperes in three segments: $.25 to 600, $150 flat, $.50 over", () => {
      // 400 A: 400 x $.25 = $100 (+ $100 base = $250 with 2 subpanels' $50)
      const small = {
        occupancy: "commercial" as const,
        workType: "new_construction" as const,
        custom: { amperage: 400, panels: 2 },
      };
      expect(amountFor(louisvilleSeed, "electrical", small, "LOU-ELEC-COMM-AMPS")).toBe(10_000);
      expect(amountFor(louisvilleSeed, "electrical", small, "LOU-ELEC-COMM-SUBPANELS")).toBe(5_000);
      expect(totalFor(louisvilleSeed, "electrical", small)).toBe(25_000);

      // 700 A: $150 first 600 + 100 x $.50 = $200 amperage + $100 base = $300
      const large = {
        occupancy: "commercial" as const,
        workType: "new_construction" as const,
        custom: { amperage: 700 },
      };
      expect(amountFor(louisvilleSeed, "electrical", large, "LOU-ELEC-COMM-AMPS-FIRST600")).toBe(
        15_000,
      );
      expect(amountFor(louisvilleSeed, "electrical", large, "LOU-ELEC-COMM-AMPS-OVER")).toBe(5_000);
      expect(totalFor(louisvilleSeed, "electrical", large)).toBe(30_000);
    });

    it("prices a condo or patio home permit as $150 plus the amperage ladder", () => {
      const input = {
        occupancy: "residential" as const,
        workType: "new_construction" as const,
        custom: { condo_or_patio: true, amperage: 300 },
      };
      // 300 x $.25 = $75 + $150 base = $225; the $200 SFR row must not also fire.
      expect(totalFor(louisvilleSeed, "electrical", input)).toBe(22_500);
      expect(
        calculate(louisvilleSeed, "electrical", input).components.find(
          (c) => c.code === "LOU-ELEC-INIT-SFR",
        ),
      ).toBeUndefined();
    });

    it("prices the $75/$100 work-cost ladder on residential electrical upgrades", () => {
      expect(
        totalFor(louisvilleSeed, "electrical", {
          occupancy: "residential",
          workType: "alteration",
          custom: { work_cost_cents: 50_000 },
        }),
      ).toBe(7_500);
      expect(
        totalFor(louisvilleSeed, "electrical", {
          occupancy: "residential",
          workType: "alteration",
          custom: { work_cost_cents: 100_000 },
        }),
      ).toBe(10_000);
    });

    it("prices a temporary pole at $85 without firing the residence rows", () => {
      const input = {
        occupancy: "residential" as const,
        workType: "other" as const,
        custom: { temporary_service: true },
      };
      expect(totalFor(louisvilleSeed, "electrical", input)).toBe(8_500);
    });

    it("prices the state plumbing permit at $50 plus $14/$20 per opening", () => {
      // Residential: 4 openings x $14 + $50 = $106
      expect(
        totalFor(louisvilleSeed, "plumbing", {
          occupancy: "residential",
          custom: { openings: 4 },
        }),
      ).toBe(10_600);
      // Commercial: 6 openings x $20 + $50 = $170
      expect(
        totalFor(louisvilleSeed, "plumbing", {
          occupancy: "commercial",
          custom: { openings: 6 },
        }),
      ).toBe(17_000);
    });

    it("charges $50 flat for a single water heater replacement", () => {
      const input = {
        occupancy: "residential" as const,
        workType: "replacement" as const,
        custom: { water_heater_only: true },
      };
      const result = calculate(louisvilleSeed, "plumbing", input);
      expect(result.totalCents).toBe(5_000);
      expect(result.components).toHaveLength(1);
      expect(result.components[0]!.code).toBe("KY-PL-WH-ONLY");
    });
  });

  describe("Lexington, KY", () => {
    checkSeedShape(lexingtonSeed, "Lexington");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(lexingtonSeed.state).toMatchObject({ code: "KY", slug: "kentucky", fipsCode: "21" });
      expect(lexingtonSeed.county).toMatchObject({
        key: "fayette-county-ky",
        name: "Fayette County",
        fipsCode: "21067",
      });
      expect(lexingtonSeed.jurisdiction).toMatchObject({
        key: "lexington",
        officialName: expect.stringContaining("Building Inspection"),
      });
    });

    it("prices residential work at $.10 per square foot with the new-dwelling adder", () => {
      // 2,500 sq ft house: $250 area + $180 adder + $25 plan review = $455
      const input = {
        squareFootage: 2_500,
        occupancy: "residential" as const,
        workType: "new_construction" as const,
      };
      expect(totalFor(lexingtonSeed, "building", input)).toBe(45_500);
      expect(amountFor(lexingtonSeed, "building", input, "LEX-BLD-RES-10")).toBe(25_000);
      expect(amountFor(lexingtonSeed, "building", input, "LEX-BLD-RES-ADDER-180")).toBe(18_000);
      expect(amountFor(lexingtonSeed, "building", input, "LEX-BLD-PR-RES")).toBe(2_500);
    });

    it("applies the $150 minimum to small residential area portions", () => {
      // 500 sq ft deck: $50 area -> minimum $150 applies
      expect(
        amountFor(
          lexingtonSeed,
          "building",
          { squareFootage: 500, occupancy: "residential", workType: "addition" as const },
          "LEX-BLD-RES-10",
        ),
      ).toBe(15_000);
      // The $180 adder must NOT fire on an addition (new dwellings only).
      expect(
        calculate(lexingtonSeed, "building", {
          squareFootage: 500,
          occupancy: "residential",
          workType: "addition",
        }).components.find((c) => c.code === "LEX-BLD-RES-ADDER-180"),
      ).toBeUndefined();
    });

    it("adds $100 per dwelling unit on multi-family residential", () => {
      // 6,000 sq ft, 8 units: $600 + 8 x $100 = $1,400 (+ $25 plan review)
      expect(
        totalFor(lexingtonSeed, "building", {
          squareFootage: 6_000,
          occupancy: "residential",
          units: 8,
          workType: "new_construction" as const,
        }),
      ).toBe(142_500);
    });

    it("prices commercial work by the schedule's own occupancy rates", () => {
      // Educational 10,000 sq ft: $0.90 x 10,000 = $9,000 (min $250)
      expect(
        totalFor(lexingtonSeed, "building", {
          squareFootage: 10_000,
          occupancy: "other",
          custom: { building_use: "educational" },
          workType: "new_construction" as const,
        }),
      ).toBe(960_000); // + $0.06 x 10,000 = $600 plan review => $9,600
      // Warehouse 5,000 sq ft: $0.28 x 5,000 = $1,400 + $300 plan review = $1,700
      // (the printed warehouse adder +$.077/sq ft keys only to the named use).
      expect(
        totalFor(lexingtonSeed, "building", {
          squareFootage: 5_000,
          occupancy: "industrial",
          workType: "new_construction" as const,
        }),
      ).toBe(170_000); // 1,400 + 300 = 1,700
    });

    it("defaults commercial to all-other $.42 and industrial to warehouse $.28", () => {
      expect(
        amountFor(
          lexingtonSeed,
          "building",
          {
            squareFootage: 1_000,
            occupancy: "commercial" as const,
            workType: "new_construction" as const,
          },
          "LEX-BLD-ALL-OTHER",
        ),
      ).toBe(42_000);
      expect(
        amountFor(
          lexingtonSeed,
          "building",
          {
            squareFootage: 1_000,
            occupancy: "industrial" as const,
            workType: "new_construction" as const,
          },
          "LEX-BLD-WAREHOUSE",
        ),
      ).toBe(28_000);
    });

    it("prices commercial remodeling at $.10 per square foot with a $250 minimum", () => {
      // 1,000 sq ft commercial remodel: $100 area -> min $250 (+ plan review $60 -> min $50)
      const input = {
        squareFootage: 1_000,
        occupancy: "commercial" as const,
        workType: "remodel" as const,
      };
      expect(amountFor(lexingtonSeed, "building", input, "LEX-BLD-COMM-REMODEL")).toBe(25_000);
      expect(amountFor(lexingtonSeed, "building", input, "LEX-BLD-PR-COMM")).toBe(6_000);
    });

    it("prices the flat $10 electrical permit", () => {
      expect(totalFor(lexingtonSeed, "electrical", {})).toBe(1_000);
      expect(amountFor(lexingtonSeed, "electrical", {}, "LEX-ELEC-PERMIT-10")).toBe(1_000);
    });

    it("prices the state plumbing permit at $50 plus $14/$20 per opening", () => {
      expect(
        totalFor(lexingtonSeed, "plumbing", {
          occupancy: "residential",
          custom: { openings: 5 },
        }),
      ).toBe(12_000); // $50 + 5 x $14
      expect(
        totalFor(lexingtonSeed, "plumbing", {
          occupancy: "commercial",
          custom: { openings: 6 },
        }),
      ).toBe(17_000); // $50 + 6 x $20
    });

    it("charges $50 flat for a single water heater replacement", () => {
      const result = calculate(lexingtonSeed, "plumbing", {
        occupancy: "residential",
        workType: "replacement",
        custom: { water_heater_only: true },
      });
      expect(result.totalCents).toBe(5_000);
      expect(result.components).toHaveLength(1);
      expect(result.components[0]!.code).toBe("KY-PL-WH-ONLY");
    });
  });
});
