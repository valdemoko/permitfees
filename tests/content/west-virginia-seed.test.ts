import { describe, expect, it } from "vitest";

import { charlestonWvSeed } from "@/content/charlestonwv";
import { huntingtonSeed } from "@/content/huntington";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

const asOf = "2026-09-27";

type Seed = typeof charlestonWvSeed;

function rulesFor(seed: Seed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(
  seed: Seed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(seed, permitTypeKey));
}

function totalFor(seed: Seed, permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculate(seed, permitTypeKey, input).totalCents;
}

function amountFor(
  seed: Seed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(seed, permitTypeKey, input).components.find((c) => c.code === code)?.amountCents;
}

function checkSeedShape(seed: Seed, label: string) {
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

  it(`${label}: publishes three pages that clear the editorial gate`, () => {
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

      const feeRuleCount = rulesFor(seed, page.permitTypeKey).length;
      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: seed.sources.length,
        feeRuleCount,
        // A page with no rules is publishable only when it states the absence.
        hasNoScheduleStatement: feeRuleCount === 0 ? true : undefined,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it(`${label}: every published worked example computes above zero`, () => {
    for (const page of seed.permitPages) {
      if (!page.workedExample) {
        expect(rulesFor(seed, page.permitTypeKey).length, `${page.slug} no-rule page`).toBe(0);
        continue;
      }
      const result = calculate(seed, page.permitTypeKey, {
        ...(page.workedExample.inputs as Partial<CalculationInput>),
      });
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.totalCents, `${page.workedExample.scenario}`).toBeGreaterThan(0);
      for (const excluded of result.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
      }
    }
  });

  it(`${label}: ties every rule's source to a declared primary official source`, () => {
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

describe("West Virginia seed payloads", () => {
  describe("Charleston, WV", () => {
    checkSeedShape(charlestonWvSeed, "Charleston");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(charlestonWvSeed.state).toMatchObject({
        code: "WV",
        slug: "west-virginia",
        fipsCode: "54",
      });
      expect(charlestonWvSeed.county).toMatchObject({
        key: "kanawha-county-wv",
        name: "Kanawha County",
        fipsCode: "54039",
      });
      expect(charlestonWvSeed.jurisdiction).toMatchObject({
        key: "charleston-wv",
        slug: "charleston",
        websiteUrl: "https://www.charlestonwv.gov",
      });
    });

    it("waives the building fee at or below $2,500 of job cost", () => {
      expect(totalFor(charlestonWvSeed, "building", { valuationCents: 200_000 })).toBe(0);
      expect(totalFor(charlestonWvSeed, "building", { valuationCents: 250_000 })).toBe(0);
      // The first charged band opens at $2,501: $18.50 + one $4.00 step.
      expect(amountFor(charlestonWvSeed, "building", { valuationCents: 250_100 }, "CH-BLD-LADDER")).toBe(
        2_250,
      );
    });

    it("reproduces the printed ladder to $30,000 and the $5.00 step above it", () => {
      expect(amountFor(charlestonWvSeed, "building", { valuationCents: 3_000_000 }, "CH-BLD-LADDER")).toBe(
        13_050,
      );
      // $60,000: $130.50 + 30 × $5.00 = $280.50 — the schedule's own checkpoint.
      expect(
        amountFor(charlestonWvSeed, "building", { valuationCents: 6_000_000 }, "CH-BLD-30K-UP"),
      ).toBe(28_050);
      // $1,000,000: $130.50 + 970 × $5.00 = $4,980.50.
      expect(
        amountFor(charlestonWvSeed, "building", { valuationCents: 100_000_000 }, "CH-BLD-30K-UP"),
      ).toBe(498_050);
    });

    it("charges plan review at .00075 of commercial construction $50,000 and above", () => {
      // The schedule's own examples: $50,000 → $37.50 and $100,000 → $75.00.
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 5_000_000, occupancy: "commercial" },
          "CH-BLD-PLAN-REVIEW",
        ),
      ).toBe(3_750);
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 10_000_000, occupancy: "commercial" },
          "CH-BLD-PLAN-REVIEW",
        ),
      ).toBe(7_500);
      // Residential work pays none, and commercial work below $50,000 pays none.
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 10_000_000, occupancy: "residential" },
          "CH-BLD-PLAN-REVIEW",
        ),
      ).toBeUndefined();
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 4_000_000, occupancy: "commercial" },
          "CH-BLD-PLAN-REVIEW",
        ),
      ).toBeUndefined();
    });

    it("prices demolition at a flat $30.00 up to $5,000 instead of the ladder", () => {
      expect(totalFor(charlestonWvSeed, "building", { valuationCents: 400_000, workType: "demolition" })).toBe(
        3_000,
      );
      // Above $5,000 the demolition is priced by the ladder, not by the flat line.
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 600_000, workType: "demolition" },
          "CH-BLD-DEMOLITION",
        ),
      ).toBeUndefined();
      expect(
        amountFor(
          charlestonWvSeed,
          "building",
          { valuationCents: 600_000, workType: "demolition" },
          "CH-BLD-LADDER",
        ),
      ).toBeGreaterThan(3_000);
    });

    it("adds the $15.00 final inspection fee to every electrical permit", () => {
      for (const occupancy of ["residential", "commercial"] as const) {
        const component = amountFor(
          charlestonWvSeed,
          "electrical",
          { occupancy },
          "CH-ELEC-FINAL-INSPECTION",
        );
        expect(component, occupancy).toBe(1_500);
      }
    });

    it("prices the residential electrical rows flat, keyed on amperage where the form is", () => {
      // Service upgrade $20.00 + final inspection $15.00.
      expect(
        totalFor(charlestonWvSeed, "electrical", {
          occupancy: "residential",
          custom: { service_upgrade: true },
        }),
      ).toBe(3_500);
      // New 150-amp service falls in the 100–200 A band: $40.00.
      expect(
        amountFor(
          charlestonWvSeed,
          "electrical",
          { occupancy: "residential", custom: { amperage: 150 } },
          "CH-ELEC-RES-SVC-100",
        ),
      ).toBe(4_000);
      // Residential openings are $5.00 each.
      expect(
        amountFor(
          charlestonWvSeed,
          "electrical",
          { occupancy: "residential", custom: { openings: 4 } },
          "CH-ELEC-RES-OPENINGS",
        ),
      ).toBe(2_000);
    });

    it("prices the commercial electrical job-cost ladder and its own rows", () => {
      // $20,000 of electrical cost: $60.00 + $1.00 × 10 = $70.00.
      expect(
        amountFor(
          charlestonWvSeed,
          "electrical",
          { occupancy: "commercial", valuationCents: 2_000_000 },
          "CH-ELEC-COMM-COST-10K-UP",
        ),
      ).toBe(7_000);
      // Commercial openings are $0.50 each, not $5.00.
      expect(
        amountFor(
          charlestonWvSeed,
          "electrical",
          { occupancy: "commercial", custom: { openings: 6 } },
          "CH-ELEC-COMM-OPENINGS",
        ),
      ).toBe(300);
      // Worked example: $70.00 + $3.00 + $30.00 + $15.00 = $118.00.
      expect(
        totalFor(charlestonWvSeed, "electrical", {
          occupancy: "commercial",
          valuationCents: 2_000_000,
          workType: "alteration",
          custom: { openings: 6, low_voltage: true },
        }),
      ).toBe(11_800);
    });

    it("publishes no plumbing fee rules because the City publishes no plumbing table", () => {
      expect(rulesFor(charlestonWvSeed, "plumbing")).toHaveLength(0);
      const plumbing = charlestonWvSeed.permitPages.find(
        (page) => page.permitTypeKey === "plumbing",
      );
      expect(plumbing?.workedExample).toBeNull();
    });
  });

  describe("Huntington, WV", () => {
    checkSeedShape(huntingtonSeed, "Huntington");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(huntingtonSeed.state).toMatchObject({ code: "WV", slug: "west-virginia" });
      expect(huntingtonSeed.county).toMatchObject({
        key: "cabell-county-wv",
        name: "Cabell County",
        fipsCode: "54011",
      });
      expect(huntingtonSeed.jurisdiction).toMatchObject({
        key: "huntington-wv",
        slug: "huntington",
        websiteUrl: "https://www.cityofhuntington.com",
      });
    });

    it("reproduces the printed ladder's own checkpoints", () => {
      // $15,000: $32.50 + 13 × $6.00 = $110.50 (band $2,001–$25,000).
      expect(
        amountFor(huntingtonSeed, "building", { valuationCents: 1_500_000 }, "HU-BLD-2001-25000"),
      ).toBe(11_050);
      // $60,000: the printed row is $313.00.
      expect(
        amountFor(huntingtonSeed, "building", { valuationCents: 6_000_000 }, "HU-BLD-50001-100000"),
      ).toBe(31_300);
      // $150,000: $433.00 + 50 × $2.50 = $558.00.
      expect(
        amountFor(huntingtonSeed, "building", { valuationCents: 15_000_000 }, "HU-BLD-OVER-100K"),
      ).toBe(55_800);
    });

    it("charges the $20.00 application fee on every permit type", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const component = calculate(huntingtonSeed, permitTypeKey, {}).components.find((c) =>
          c.code.endsWith("-APP-20"),
        );
        expect(component?.amountCents, permitTypeKey).toBe(2_000);
      }
    });

    it("computes the three published worked examples to the cent", () => {
      // Building $60,000 → $313.00 + $20.00 = $333.00.
      expect(
        totalFor(huntingtonSeed, "building", { valuationCents: 6_000_000, occupancy: "commercial" }),
      ).toBe(33_300);
      // Electrical $150,000 → $558.00 + $20.00 = $578.00.
      expect(
        totalFor(huntingtonSeed, "electrical", {
          valuationCents: 15_000_000,
          occupancy: "commercial",
        }),
      ).toBe(57_800);
      // Plumbing $15,000 → $110.50 + $20.00 = $130.50.
      expect(
        totalFor(huntingtonSeed, "plumbing", { valuationCents: 1_500_000, occupancy: "residential" }),
      ).toBe(13_050);
    });

    it("charges no fee under $500 of project cost, but still takes the application fee", () => {
      expect(totalFor(huntingtonSeed, "building", { valuationCents: 40_000 })).toBe(2_000);
      // $600 lands in the $500–$1,100 flat band: $20.00 + the $20.00 application fee.
      expect(
        amountFor(huntingtonSeed, "building", { valuationCents: 60_000 }, "HU-BLD-FLAT-20"),
      ).toBe(2_000);
    });
  });
});
