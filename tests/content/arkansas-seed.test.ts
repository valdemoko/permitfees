import { describe, expect, it } from "vitest";

import { fortsmithSeed } from "@/content/fortsmith";
import { littlerockSeed } from "@/content/littlerock";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

const asOf = "2026-09-26";

function rulesFor(seed: typeof littlerockSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(
  seed: typeof littlerockSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(seed, permitTypeKey));
}

function totalFor(
  seed: typeof littlerockSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
): number {
  return calculate(seed, permitTypeKey, input).totalCents;
}

function amountFor(
  seed: typeof littlerockSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(seed, permitTypeKey, input).components.find((c) => c.code === code)
    ?.amountCents;
}

function computeWorkedExample(seed: typeof littlerockSeed, permitTypeKey: string) {
  const page = seed.permitPages.find(
    (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
  );
  if (!page || !page.workedExample) return null;
  const input: CalculationInput = {
    asOf,
    ...(page.workedExample.inputs as Partial<CalculationInput>),
  };
  return calculatePermitFees(input, rulesFor(seed, permitTypeKey));
}

/** Shared structural checks every Arkansas seed must pass. */
function checkSeedShape(seed: typeof littlerockSeed, label: string) {
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
      const result = computeWorkedExample(seed, permitTypeKey);
      expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
      expect(result!.components.length).toBeGreaterThan(0);
      expect(result!.totalCents, `${permitTypeKey} total`).toBeGreaterThan(0);
      for (const excluded of result!.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
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

describe("Arkansas seed payloads", () => {
  describe("Little Rock, AR", () => {
    it("identifies the jurisdiction, its state and its county", () => {
      expect(littlerockSeed.state).toMatchObject({ code: "AR", slug: "arkansas", fipsCode: "05" });
      expect(littlerockSeed.county).toMatchObject({ key: "pulaski-county-ar", fipsCode: "05119" });
      expect(littlerockSeed.jurisdiction).toMatchObject({
        key: "little-rock",
        slug: "little-rock",
        countyKey: "pulaski-county-ar",
        timezone: "America/Chicago",
        isActive: true,
      });
    });

    checkSeedShape(littlerockSeed, "Little Rock");

    it("reproduces the building worked example — $220,000 commercial build-out", () => {
      const result = computeWorkedExample(littlerockSeed, "building");
      // $318.00 + $2.10 × 120 whole thousands = $570.00; plan check 50% = $285.00;
      // data processing $6.00. Total $861.00.
      expect(result!.totalCents).toBe(86_100);
      expect(result!.components.find((c) => c.code === "BLD-VAL-100K01-500K")?.amountCents).toBe(
        57_000,
      );
      expect(result!.components.find((c) => c.code === "BLD-PLAN-CHECK-50")?.amountCents).toBe(
        28_500,
      );
      expect(result!.components.find((c) => c.code === "LR-DATA-6")?.amountCents).toBe(600);
    });

    it("rounds every building band up — 'or fraction thereof' in all four", () => {
      // $50,001 sits in band 3: $198.00 covers the first $50,000, then one whole
      // $2.40 step for the single dollar of fraction.
      expect(
        amountFor(
          littlerockSeed,
          "building",
          { valuationCents: 50_001_00, occupancy: "residential", workType: "new_construction" },
          "BLD-VAL-50K01-100K",
        ),
      ).toBe(19_800 + 240);
      // $2,001 in band 2: $30.00 base + one whole $3.50 step.
      expect(
        amountFor(
          littlerockSeed,
          "building",
          { valuationCents: 2_001_00, occupancy: "residential", workType: "new_construction" },
          "BLD-VAL-501-50K",
        ),
      ).toBe(3_000 + 350);
    });

    it("floors every permit at $30.00 and charges the data processing fee", () => {
      // A tiny commercial job: plan-check minimum $50 alone clears $30.
      // A residential valuation of $2,000 (inside the $30-base band) pays $30 + $3.
      const total = totalFor(littlerockSeed, "building", {
        valuationCents: 200_000,
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(total).toBe(3_000 + 300);
    });

    it("keeps the plan-check fee on commercial work only, at 50% of the permit fee", () => {
      const residential = calculate(littlerockSeed, "building", {
        valuationCents: 22_000_000,
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(residential.components.find((c) => c.code === "BLD-PLAN-CHECK-50")).toBeUndefined();

      const commercial = calculate(littlerockSeed, "building", {
        valuationCents: 2_000_000,
        occupancy: "commercial",
        workType: "alteration",
      });
      // Permit $99.00 (band 2: $30 + $3.50 × 20 rounded up); plan check min $50 > 50% × $99.
      expect(commercial.components.find((c) => c.code === "BLD-PLAN-CHECK-50")?.amountCents).toBe(
        5_000,
      );
    });

    it("prices new dwellings at $0.08/sq ft under roof on both trades", () => {
      // The worked example: 2,000 sq ft × $0.08 = $160 + $3 data fee.
      expect(computeWorkedExample(littlerockSeed, "electrical")!.totalCents).toBe(16_300);
      // Plumbing: 2,400 sq ft × $0.08 = $192 + $3 data fee.
      expect(
        totalFor(littlerockSeed, "plumbing", {
          squareFootage: 2_400,
          valuationCents: 3_000_000,
          occupancy: "residential",
          workType: "new_construction",
        }),
      ).toBe(19_200 + 300);
    });

    it("prices plumbing alterations from unit costs and keeps the $30 floor live", () => {
      // The worked example: 6 outlets × $5 + $15 water heater + $3 data = $48.
      expect(computeWorkedExample(littlerockSeed, "plumbing")!.totalCents).toBe(4_800);
      // A single $5 fixture alone pays the $30 minimum + $3 data fee.
      const tiny = calculate(littlerockSeed, "plumbing", {
        valuationCents: 100_000,
        fixtures: 1,
      });
      expect(tiny.totalCents).toBe(3_000 + 300);
    });

    it("prices load centers by the amperage ladder", () => {
      expect(
        amountFor(
          littlerockSeed,
          "electrical",
          { custom: { amperage: 200 } },
          "ELEC-LC-200",
        ),
      ).toBe(3_300);
      // Over 200 amps: $5 per 100 amps or fraction — 350 amps is two steps.
      expect(
        amountFor(
          littlerockSeed,
          "electrical",
          { custom: { amperage: 350 } },
          "ELEC-LC-OVER-200",
        ),
      ).toBe(1_000);
      expect(
        amountFor(littlerockSeed, "electrical", { custom: { amperage: 100 } }, "ELEC-LC-100"),
      ).toBe(1_600);
    });

    it("prices the openings ladder by bracket", () => {
      expect(
        amountFor(littlerockSeed, "electrical", { custom: { openings: 20 } }, "ELEC-OPEN-1-20"),
      ).toBe(1_000);
      expect(
        amountFor(littlerockSeed, "electrical", { custom: { openings: 21 } }, "ELEC-OPEN-21-60"),
      ).toBe(2_500);
      expect(
        amountFor(
          littlerockSeed,
          "electrical",
          { custom: { openings: 450 } },
          "ELEC-OPEN-OVER-400",
        ),
      ).toBe(8_000 + 1_000); // $80 for the first 400 + 2 whole 25-blocks × $5 (rounded up: 50/25 = 2)
    });
  });

  describe("Fort Smith, AR", () => {
    it("identifies the jurisdiction, its state and its county", () => {
      expect(fortsmithSeed.state).toMatchObject({ code: "AR", slug: "arkansas", fipsCode: "05" });
      expect(fortsmithSeed.county).toMatchObject({ key: "sebastian-county", fipsCode: "05131" });
      expect(fortsmithSeed.jurisdiction).toMatchObject({
        key: "fort-smith",
        slug: "fort-smith",
        countyKey: "sebastian-county",
        timezone: "America/Chicago",
        isActive: true,
      });
    });

    checkSeedShape(fortsmithSeed, "Fort Smith");

    it("reproduces the building worked example — $220,000 single-family home", () => {
      const result = computeWorkedExample(fortsmithSeed, "building");
      // $37.50 + $1.50 × 218 whole thousands = $364.50. No plan review (residential).
      expect(result!.totalCents).toBe(36_450);
      expect(result!.components.find((c) => c.code === "FS-RES-2001-UP")?.amountCents).toBe(
        36_450,
      );
      expect(result!.components.find((c) => c.code === "FS-PLAN-REVIEW-20")).toBeUndefined();
    });

    it("rounds the residential top band up and prorates the nonresidential bands", () => {
      // Residential: the row prints "or fraction thereof" — $2,001,000 is 1,999
      // whole thousands after the first $2,000 → $37.50 + 1,999 × $1.50 = $3,036.00.
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 2_001_000_00, occupancy: "residential", workType: "new_construction" },
          "FS-RES-2001-UP",
        ),
      ).toBe(303_600);
      // Nonresidential rows omit the phrase — $2,101 prorates exactly:
      // $67.50 + 0.101 × $4.50 × 1,000/1,000 = $67.50 + $0.4545 → $67.95.
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 210_100, occupancy: "commercial", workType: "alteration" },
          "FS-COM-2001-10K",
        ),
      ).toBe(6_795);
    });

    it("chains the nonresidential bands exactly as the schedule prints them", () => {
      // $10,000 → $67.50 + 8 × $4.50 = $103.50 (band 6's printed base)
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 1_000_000, occupancy: "commercial", workType: "alteration" },
          "FS-COM-2001-10K",
        ),
      ).toBe(10_350);
      // $50,000 → $103.50 + 40 × $3.75 = $253.50 (band 7's base)
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 5_000_000, occupancy: "commercial", workType: "alteration" },
          "FS-COM-10K01-50K",
        ),
      ).toBe(25_350);
      // $100,000 → $253.50 + 50 × $3.00 = $403.50 (band 8's base)
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 10_000_000, occupancy: "commercial", workType: "alteration" },
          "FS-COM-50K01-100K",
        ),
      ).toBe(40_350);
      // $1,000,000 → the band computes $403.50 + 900 × $2.25 = $2,428.50, but the
      // schedule's own top band prints $2,536.50 — a $108.00 discontinuity the
      // document itself contains (Fargo's 25-cent and Detroit's 7-cent seam, again).
      // Charged as printed.
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 100_000_000, occupancy: "commercial", workType: "alteration" },
          "FS-COM-100K01-1M",
        ),
      ).toBe(242_850);
      expect(
        amountFor(
          fortsmithSeed,
          "building",
          { valuationCents: 100_000_100, occupancy: "commercial", workType: "alteration" },
          "FS-COM-1M-UP",
        ),
      ).toBe(253_650); // $2,536.50 base; $1.00 above $1M prorates to $0.0015, which rounds to a whole cent as $0.00
    });

    it("caps the 20% plan review at $1,500 and keeps it off residential work", () => {
      // $220,000 commercial: $403.50 for the first $100,000 + $2.25 × 120 prorated
      // exactly (no fraction phrase) = $673.50; plan review 20% = $134.70.
      const mid = calculate(fortsmithSeed, "building", {
        valuationCents: 22_000_000,
        occupancy: "commercial",
        workType: "alteration",
      });
      expect(mid.components.find((c) => c.code === "FS-COM-100K01-1M")?.amountCents).toBe(67_350);
      expect(mid.components.find((c) => c.code === "FS-PLAN-REVIEW-20")?.amountCents).toBe(13_470);

      // $10,000,000 commercial: permit $2,536.50 + $1.50 × 9,000 = $16,036.50; 20% would
      // be $3,207.30 → capped at $1,500.
      const huge = calculate(fortsmithSeed, "building", {
        valuationCents: 1_000_000_000,
        occupancy: "commercial",
        workType: "new_construction",
      });
      expect(huge.components.find((c) => c.code === "FS-PLAN-REVIEW-20")?.amountCents).toBe(
        150_000,
      );

      const residential = calculate(fortsmithSeed, "building", {
        valuationCents: 1_000_000_000,
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(residential.components.find((c) => c.code === "FS-PLAN-REVIEW-20")).toBeUndefined();
    });

    it("prices electrical by the active-circuit ladder — the worked example's 24 circuits", () => {
      const result = computeWorkedExample(fortsmithSeed, "electrical");
      // 4 × $5.50 + 6 × $5.00 + 10 × $4.50 + 4 × $4.00 = $113.00.
      expect(result!.totalCents).toBe(11_300);
      expect(result!.components.find((c) => c.code === "ELEC-CIRCUITS")?.amountCents).toBe(11_300);
    });

    it("reaches the $30.00 electrical minimum from below", () => {
      // One circuit at $5.50 pays the $30.00 floor.
      const tiny = calculate(fortsmithSeed, "electrical", { custom: { circuits: 1 } });
      expect(tiny.components.find((c) => c.code === "ELEC-CIRCUITS")?.amountCents).toBe(550);
      expect(tiny.components.find((c) => c.code === "ELEC-MINIMUM-30")?.amountCents).toBe(2_450);
      expect(tiny.totalCents).toBe(3_000);
    });

    it("prices the plumbing worked example — 6 outlets, 1 water heater, final", () => {
      const result = computeWorkedExample(fortsmithSeed, "plumbing");
      // 6 × $5.50 + 1 × $4.00 + $12.00 = $49.00.
      expect(result!.totalCents).toBe(4_900);
      expect(result!.components.find((c) => c.code === "PL-FIXTURE-OUTLETS")?.amountCents).toBe(
        3_300,
      );
      expect(result!.components.find((c) => c.code === "PL-APPLIANCES")?.amountCents).toBe(400);
      expect(result!.components.find((c) => c.code === "PL-FINAL-INSPECTION")?.amountCents).toBe(
        1_200,
      );
    });

    it("floors the plumbing permit at $24.00", () => {
      const tiny = calculate(fortsmithSeed, "plumbing", { fixtures: 1 });
      expect(tiny.components.find((c) => c.code === "PL-FIXTURE-OUTLETS")?.amountCents).toBe(550);
      expect(tiny.components.find((c) => c.code === "PL-MINIMUM-24")?.amountCents).toBe(1_850);
      expect(tiny.totalCents).toBe(2_400);
    });

    it("excludes unpriced per-unit rows by condition, not by missing input", () => {
      // A gas-only permit names its outlets and never its fixtures: the fixture
      // row is excluded as conditions_not_met, so the breakdown never implies the
      // schedule priced a count the applicant did not give.
      const gasOnly = calculate(fortsmithSeed, "plumbing", { custom: { outlets: 2 } });
      const excludedFixtures = gasOnly.excluded.find((e) => e.code === "PL-FIXTURE-OUTLETS");
      expect(excludedFixtures?.reason).toBe("conditions_not_met");
    });

    it("prices gas piping with the five-outlet allowance", () => {
      // 8 gas outlets: $5.50 for the first five + 3 × $1.50 = $10.00.
      const gas = calculate(fortsmithSeed, "plumbing", { custom: { outlets: 8 } });
      expect(gas.components.find((c) => c.code === "PL-GAS-SERVICE")?.amountCents).toBe(1_000);
    });

    it("prices the flat special-purpose electrical rows", () => {
      expect(
        amountFor(
          fortsmithSeed,
          "electrical",
          { custom: { panel_replacement: true } },
          "ELEC-PANEL-REPLACEMENT",
        ),
      ).toBe(3_000);
      expect(
        amountFor(
          fortsmithSeed,
          "electrical",
          { custom: { temporary_service: true } },
          "ELEC-TEMP-SERVICE",
        ),
      ).toBe(3_000);
    });
  });
});
