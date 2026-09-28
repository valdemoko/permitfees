import { describe, expect, it } from "vitest";

import { boiseSeed } from "@/content/boise";
import { meridianSeed } from "@/content/meridian";
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

describe("Idaho seed payloads", () => {
  describe("Boise, ID", () => {
    checkSeedShape(boiseSeed, "Boise, ID");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(boiseSeed.state).toMatchObject({ code: "ID", slug: "idaho", fipsCode: "16" });
      expect(boiseSeed.county).toMatchObject({
        key: "ada-county-id",
        name: "Ada County",
        fipsCode: "16001",
      });
      expect(boiseSeed.jurisdiction).toMatchObject({
        key: "boise",
        officialName: expect.stringContaining("Planning & Development Services"),
        websiteUrl: "https://www.cityofboise.org",
      });
    });

    it("prices the Table 1-A ladder band by band", () => {
      // $10,000 → band 2: $70.76 + 8 × $12.71 = $172.44
      expect(amountFor(boiseSeed, "building", { valuationCents: 1_000_000 }, "BOI-BLD-25K")).toBe(
        17_244,
      );
      // $300,000 → band 5: $913.09 + 200 × $5.17 = $1,947.09
      expect(
        amountFor(boiseSeed, "building", { valuationCents: 30_000_000 }, "BOI-BLD-100K-UP"),
      ).toBe(194_709);
      // The first $500 prices $26.37 (band 1 covers $1-$2,000).
      expect(
        amountFor(boiseSeed, "building", { valuationCents: 50_000 }, "BOI-BLD-2K"),
      ).toBe(2_637);
    });

    it("adds residential plan review at 20% and commercial at 65%", () => {
      const input = { valuationCents: 30_000_000, occupancy: "residential" as const };
      expect(amountFor(boiseSeed, "building", input, "BOI-BLD-REVIEW-RES")).toBe(38_942);
      const comm = { valuationCents: 30_000_000, occupancy: "commercial" as const };
      expect(amountFor(boiseSeed, "building", comm, "BOI-BLD-REVIEW-COMM")).toBe(126_561);
    });

    it("prices new residential wiring per dwelling unit by square-footage band", () => {
      const base = {
        occupancy: "residential" as const,
        workType: "new_construction" as const,
        units: 1,
        custom: { new_residential_wiring: true },
      };
      // 2,000 sq ft → $135
      expect(
        amountFor(boiseSeed, "electrical", { ...base, squareFootage: 2_000 }, "BOI-ELEC-NEW-RES-2500"),
      ).toBe(13_500);
      // 3,000 sq ft → $155
      expect(
        amountFor(boiseSeed, "electrical", { ...base, squareFootage: 3_000 }, "BOI-ELEC-NEW-RES-3500"),
      ).toBe(15_500);
      // 5,000 sq ft → $210 + one rounded 1,000-band extra ($65) = $275
      expect(
        totalFor(boiseSeed, "electrical", { ...base, squareFootage: 5_000 }),
      ).toBe(27_500);
    });

    it("charges the commercial electrical base plus wiring-cost segments", () => {
      const input = { valuationCents: 5_000_000, occupancy: "commercial" as const };
      // $14 base + $84.32 + 1.14% of ($50,000 − $2,000) = $547.20 → $645.52
      expect(totalFor(boiseSeed, "electrical", input)).toBe(64_552);
      expect(amountFor(boiseSeed, "electrical", input, "BOI-ELEC-COMM-BASE")).toBe(1_400);
    });

    it("prices multi-fixture residential plumbing at $32 base plus $12 per fixture", () => {
      const input = {
        occupancy: "residential" as const,
        fixtures: 6,
        custom: { residential_fixtures: true },
      };
      expect(totalFor(boiseSeed, "plumbing", input)).toBe(10_400);
      expect(amountFor(boiseSeed, "plumbing", input, "BOI-PL-FIX-BASE")).toBe(3_200);
      expect(amountFor(boiseSeed, "plumbing", input, "BOI-PL-FIXTURE-12")).toBe(7_200);
    });

    it("prices commercial plumbing at 2.28% of value under $500,000", () => {
      const input = { valuationCents: 10_000_000, occupancy: "commercial" as const };
      // $32 base + 2.28% of $100,000 = $2,280 + $32 = $2,312
      expect(totalFor(boiseSeed, "plumbing", input)).toBe(231_200);
    });
  });

  describe("Meridian, ID", () => {
    checkSeedShape(meridianSeed, "Meridian, ID");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(meridianSeed.state).toMatchObject({ code: "ID", slug: "idaho", fipsCode: "16" });
      expect(meridianSeed.county).toMatchObject({
        key: "ada-county-id",
        name: "Ada County",
        fipsCode: "16001",
      });
      expect(meridianSeed.jurisdiction).toMatchObject({
        key: "meridian",
        officialName: expect.stringContaining("Building Services"),
      });
    });

    it("prices every building permit from the $50 + $5.50/$1,000 formula", () => {
      // $188,120 → $50 + 189 bands × $5.50 = $1,089.50
      expect(totalFor(meridianSeed, "building", { valuationCents: 18_812_000 })).toBe(108_950);
      // A fraction into a band rounds up: $1,001 → $50 + 2 × $5.50 = $61
      expect(totalFor(meridianSeed, "building", { valuationCents: 100_100 })).toBe(6_100);
      // The $50 base covers the first $1,000.
      expect(totalFor(meridianSeed, "building", { valuationCents: 100_000 })).toBe(5_000);
    });

    it("adds the commercial plan check at 65%", () => {
      const input = { valuationCents: 18_812_000, occupancy: "commercial" as const };
      // 65% of $1,089.50 = $708.18 (half-up) — permit $1,089.50 + $708.18
      expect(amountFor(meridianSeed, "building", input, "MER-BLD-PLAN-CHECK")).toBe(70_818);
    });

    it("prices new residential wiring by service size", () => {
      const base = {
        occupancy: "residential" as const,
        workType: "new_construction" as const,
        custom: { new_residential_wiring: true },
      };
      // 200 A or unspecified → $120; 300 A → $210
      expect(totalFor(meridianSeed, "electrical", { ...base, custom: { ...base.custom } })).toBe(
        12_000,
      );
      expect(
        totalFor(meridianSeed, "electrical", { ...base, custom: { ...base.custom, amperage: 300 } }),
      ).toBe(21_000);
    });

    it("prices existing residential wiring at $40 plus $10 per branch circuit", () => {
      const input = {
        occupancy: "residential" as const,
        workType: "alteration" as const,
        custom: { existing_residential_wiring: true, circuits: 4 },
      };
      expect(totalFor(meridianSeed, "electrical", input)).toBe(8_000);
      expect(amountFor(meridianSeed, "electrical", input, "MER-ELEC-EXIST-CIRC")).toBe(4_000);
    });

    it("prices multi-family electrical at $120 per building plus $60 per unit", () => {
      const input = { occupancy: "residential" as const, units: 10 };
      expect(totalFor(meridianSeed, "electrical", input)).toBe(72_000);
    });

    it("prices commercial wiring cost in three segments", () => {
      const comm = { occupancy: "commercial" as const };
      // $50,000 wiring: $100 + 1% of $50,000 = $600
      expect(totalFor(meridianSeed, "electrical", { ...comm, valuationCents: 5_000_000 })).toBe(
        60_000,
      );
      // $1,500 wiring: $40 + 2.5% of $1,500 = $77.50
      expect(totalFor(meridianSeed, "electrical", { ...comm, valuationCents: 150_000 })).toBe(
        7_750,
      );
      // $100,000 wiring: $180 + 0.5% of $90,000 = $630
      expect(totalFor(meridianSeed, "electrical", { ...comm, valuationCents: 10_000_000 })).toBe(
        63_000,
      );
    });

    it("prices plumbing per living unit and per fixture", () => {
      const input = { occupancy: "residential" as const, units: 2, fixtures: 10 };
      expect(totalFor(meridianSeed, "plumbing", input)).toBe(14_000);
      expect(amountFor(meridianSeed, "plumbing", input, "MER-PL-UNIT-30")).toBe(6_000);
      expect(amountFor(meridianSeed, "plumbing", input, "MER-PL-FIXTURE-8")).toBe(8_000);
    });

    it("prices the plumbing project-value ladder at 3% up to $20,000", () => {
      const input = {
        occupancy: "commercial" as const,
        valuationCents: 1_000_000,
        custom: { plumbing_by_value: true },
      };
      // 3% of $10,000 = $300
      expect(totalFor(meridianSeed, "plumbing", input)).toBe(30_000);
    });
  });
});
