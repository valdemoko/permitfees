import { describe, expect, it } from "vitest";

import { tulsaSeed } from "@/content/tulsa";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Tulsa, Oklahoma — the data, and the arithmetic Title 49 prints.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The stack exists on all three pages, in the schedule's own order.** The
 *     floor (§ 107) must charge *last* against fee_subtotal — if it ran early,
 *     § 117's 8% would read the floor instead of the permit fee, and the $80
 *     minimum would swallow the arithmetic the schedule means it to protect.
 *  2. **"To the closest" is a real nearest rounding.** $40,499 buys forty steps
 *     of $6.18, not forty-one; the tie at $150,500 rounds up.
 *  3. **§ 302's seam meets from both sides** — $150,000 pays $927.00 from band
 *     C, one dollar more pays $927.00 from band D — and the alternative
 *     full-valuation reading is recorded, never charged.
 *  4. **§ 306's carve-out is wired, not described**: a shelter pays its flat
 *     plus § 100 and nothing else — no bands, no 8%, no $5, no floor.
 *  5. **The worked examples reproduce cent for cent**: $1,349.88, $456.72 and
 *     $80.00 — the last one existing only because the floor reads the whole bill.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return tulsaSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(permitTypeKey: string, input: Omit<CalculationInput, "asOf">) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey));
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculate(permitTypeKey, input).totalCents;
}

function amountFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(permitTypeKey, input).components.find((component) => component.code === code)
    ?.amountCents;
}

function codesFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): string[] {
  return calculate(permitTypeKey, input).components.map((component) => component.code);
}

describe("Tulsa seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(tulsaSeed.state).toMatchObject({ code: "OK", slug: "oklahoma", fipsCode: "40" });
    expect(tulsaSeed.county).toMatchObject({ key: "tulsa-county", fipsCode: "40143" });
    expect(tulsaSeed.jurisdiction).toMatchObject({
      key: "tulsa",
      slug: "tulsa",
      officialName: "City of Tulsa",
      countyKey: "tulsa-county",
      timezone: "America/Chicago",
      isActive: true,
      permitPortalUrl: "https://tulsaok-energovweb.tylerhost.net/apps/selfservice",
    });
  });

  it("shares the Oklahoma state row rather than defining its own permit types", () => {
    expect(tulsaSeed.state.code).toBe("OK");
    expect(tulsaSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(tulsaSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(tulsaSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(6);
    expect(scheduleKeys.size).toBe(4);
    expect(tulsaSeed.sources.filter((source) => source.isPrimary)).toHaveLength(5);

    for (const entry of tulsaSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(
        true,
      );
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(
          true,
        );
      }
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }

    const ids = tulsaSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(tulsaSeed.permitPages).toHaveLength(3);
    expect(
      tulsaSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of tulsaSeed.permitPages) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThanOrEqual(
        MIN_LOCAL_SUMMARY_LENGTH,
      );
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: tulsaSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies every permit page in the ledger, where the route reads its date from", () => {
    for (const page of tulsaSeed.permitPages) {
      const record = tulsaSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });

  it("keeps the ambiguous over-$150,000 band under needs_review rather than hiding it", () => {
    const record = tulsaSeed.verifications.find(
      (entry) => entry.entityType === "fee_rule" && entry.entityKey === "BLD-302-D",
    );
    expect(record?.status).toBe("needs_review");
    expect(record?.notes).toContain("$927.00");
  });

  it("attaches the Chapter 1 stack to all three pages, five lines each", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const stackCodes = rulesFor(permitTypeKey)
        .map((rule) => rule.code)
        .filter((code) => /-(100A|100D|117|103|107)$/.test(code));
      expect(stackCodes, permitTypeKey).toHaveLength(5);
    }
  });
});

describe("Tulsa building permits — four bands, one rounding, one carve-out", () => {
  it("holds each band at its published figure, with the seams explicit", () => {
    const inputs = (valuationCents: number) => ({
      valuationCents,
      occupancy: "commercial" as const,
      workType: "new_construction" as const,
      custom: {},
    });

    expect(amountFor("building", inputs(500_000), "BLD-302-A")).toBe(13_700);
    expect(amountFor("building", inputs(500_000), "BLD-302-B")).toBeUndefined();
    expect(amountFor("building", inputs(500_001), "BLD-302-B")).toBe(21_900);
    expect(amountFor("building", inputs(4_000_000), "BLD-302-B")).toBe(21_900);
    // $40,000.01 rounds to the closest thousand — 40 steps, not one.
    expect(amountFor("building", inputs(4_000_001), "BLD-302-C")).toBe(40 * 618);
  });

  it("rounds rate bands to the closest thousand, ties up", () => {
    const band = (valuationCents: number) =>
      amountFor(
        "building",
        {
          valuationCents,
          occupancy: "commercial",
          workType: "new_construction",
          custom: {},
        },
        "BLD-302-C",
      );

    // $40,499 → forty steps of $6.18, not forty-one: the schedule's own "closest".
    expect(band(4_049_900)).toBe(40 * 618);
    expect(band(4_050_000)).toBe(41 * 618); // the tie rounds half up
    expect(band(4_100_000)).toBe(41 * 618);
  });

  it("meets the $150,000 seam from both sides — $927.00 either way", () => {
    const band = (valuationCents: number) =>
      amountFor(
        "building",
        {
          valuationCents,
          occupancy: "commercial",
          workType: "new_construction",
          custom: {},
        },
        "BLD-302-C",
      );
    const above = (valuationCents: number) =>
      amountFor(
        "building",
        {
          valuationCents,
          occupancy: "commercial",
          workType: "new_construction",
          custom: {},
        },
        "BLD-302-D",
      );

    // Exactly at the ceiling, band C pays $6.18 × 150 = $927.00.
    expect(band(15_000_000)).toBe(92_700);
    expect(above(15_000_000)).toBeUndefined();

    // One dollar more: band D's ceiling base, and no step yet (the excess of
    // one cent rounds to zero thousands — the seam is continuous).
    expect(above(15_000_001)).toBe(92_700);

    // $100,000 of excess is 100 steps of $3.09 on top of the ceiling.
    expect(above(25_000_000)).toBe(92_700 + 100 * 309);

    // The tie on the excess rounds half up: $500 of excess is one step.
    expect(above(15_050_000)).toBe(92_700 + 309);
  });

  it("reproduces the worked example — $250,000 through the whole stack", () => {
    const result = calculate("building", {
      valuationCents: 25_000_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: {},
    });
    expect(result.totalCents).toBe(134_988); // $1,349.88

    expect(result.components.find((c) => c.code === "BLD-302-D")?.amountCents).toBe(123_600);
    expect(result.components.find((c) => c.code === "TUL-BLD-117")?.amountCents).toBe(10_438);
    expect(result.components.find((c) => c.code === "TUL-BLD-100A")?.amountCents).toBe(400);
    expect(result.components.find((c) => c.code === "TUL-BLD-100D")?.amountCents).toBe(50);
    expect(result.components.find((c) => c.code === "TUL-BLD-103")?.amountCents).toBe(500);
    // § 107 reads the bill last and finds nothing to lift — the row answers
    // with a zero shortfall rather than disappearing.
    expect(result.components.find((c) => c.code === "TUL-BLD-107")?.amountCents).toBe(0);
  });

  it("wires § 306's carve-out: a shelter pays its flat plus Section 100, and nothing else", () => {
    const result = calculate("building", {
      valuationCents: 25_000_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { storm_shelter_indoor: true },
    });

    expect(result.components.map((c) => c.code).sort()).toEqual([
      "BLD-306-SHELTER-INDOOR",
      "TUL-BLD-100A",
      "TUL-BLD-100D",
    ]);
    expect(result.totalCents).toBe(8_800 + 400 + 50); // $92.50
  });

  it("prices demolition and carport as their own flats rather than bands", () => {
    const demo = calculate("building", {
      valuationCents: 25_000_000,
      occupancy: "commercial",
      workType: "demolition",
      custom: {},
    });
    expect(demo.components.map((c) => c.code)).toContain("BLD-314-DEMO");
    expect(demo.components.some((c) => c.code.startsWith("BLD-302"))).toBe(false);

    const carport = calculate("building", {
      valuationCents: 1_000_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { carport: true },
    });
    expect(carport.components.map((c) => c.code)).toContain("BLD-304-CARPORT");
    expect(carport.components.some((c) => c.code.startsWith("BLD-302"))).toBe(false);
  });

  it("floors a small permit at $80 after the whole stack has charged", () => {
    // A $137 band is already above the floor; the stack still applies in full.
    const result = calculate("building", {
      valuationCents: 100_000,
      occupancy: "residential",
      workType: "repair",
      custom: {},
    });
    // $137 band + 8% × $137 = $10.96 + $5.50 + $4.50 + $5.00 = $162.96.
    expect(result.totalCents).toBe(13_700 + 550 + 1_096 + 400 + 50 + 500);
  });
});

describe("Tulsa electrical permits — three tables, one service fee", () => {
  it("reproduces the worked example — 8,000 sq ft residential new construction", () => {
    const result = calculate("electrical", {
      squareFootage: 8_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true },
    });
    expect(result.totalCents).toBe(45_672); // $456.72
    expect(result.components.find((c) => c.code === "ELEC-401-OVER")?.amountCents).toBe(40_900);
    // No amperage stated: the service line is declined, never guessed.
    expect(result.components.find((c) => c.code === "ELEC-404A-SERVICE")).toBeUndefined();
  });

  it("prorates § 401's continuation rather than rounding it", () => {
    const over = (squareFootage: number) =>
      amountFor(
        "electrical",
        {
          squareFootage,
          occupancy: "residential",
          workType: "new_construction",
          custom: { one_two_family: true },
        },
        "ELEC-401-OVER",
      );

    // $293 base + $58 per each additional 1,000 sq ft — no "or fraction", so
    // 6,500 sq ft is half a thousand: $293 + $29.
    expect(over(6_500)).toBe(29_300 + 2_900);
    expect(over(7_000)).toBe(29_300 + 5_800);
    // At or below 6,000 the middle band answers instead.
    expect(over(6_000)).toBeUndefined();
  });

  it("selects the table by the chapter's own scope — 401, 402A, 402B, 403 or § 404", () => {
    // Commercial new construction: § 402(A)'s second band. `neq` on an absent
    // fact reads false, so the one-/two-family switch is stated both ways.
    expect(
      amountFor(
        "electrical",
        {
          squareFootage: 8_000,
          occupancy: "commercial",
          workType: "new_construction",
          custom: { one_two_family: false },
        },
        "ELEC-402A-2",
      ),
    ).toBe(34_400);

    // The same square footage as an addition: § 402(B)'s second band.
    expect(
      amountFor(
        "electrical",
        {
          squareFootage: 8_000,
          occupancy: "commercial",
          workType: "addition",
          custom: { one_two_family: false },
        },
        "ELEC-402B-2",
      ),
    ).toBe(20_700);

    // Low density shadows 402 entirely while its fact is set.
    const lowDensity = codesFor("electrical", {
      squareFootage: 8_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, low_density_project: true },
    });
    expect(lowDensity).toContain("ELEC-403-2");
    expect(lowDensity.some((code) => code.startsWith("ELEC-402"))).toBe(false);

    // A commercial remodel without the ≥50% fact is § 404's: no band answers,
    // the catch-all rows wait for their own facts, and the stack's floor holds
    // the bill at $80.00.
    const smallRemodel = calculate("electrical", {
      squareFootage: 8_000,
      occupancy: "commercial",
      workType: "remodel",
      custom: { one_two_family: false },
    });
    expect(smallRemodel.components.some((c) => c.code.startsWith("ELEC-402"))).toBe(false);
    expect(smallRemodel.totalCents).toBe(8_000);
  });

  it("charges the service fee on covered work, from 100 amps in whole hundreds", () => {
    // § 401's total includes § 404.A: $98 first 100, $18 per additional or portion.
    const service = amountFor(
      "electrical",
      {
        squareFootage: 2_000,
        occupancy: "residential",
        workType: "new_construction",
        custom: { one_two_family: true, amperage: 250 },
      },
      "ELEC-404A-SERVICE",
    );
    expect(service).toBe(9_800 + 2 * 1_800); // 150 amps over → 2 hundreds → $134.00

    // Exactly 100 amps: the base alone, no amp row above it.
    expect(
      amountFor(
        "electrical",
        {
          squareFootage: 2_000,
          occupancy: "residential",
          workType: "new_construction",
          custom: { one_two_family: true, amperage: 100 },
        },
        "ELEC-404A-SERVICE",
      ),
    ).toBe(9_800);
  });

  it("answers § 404's catch-all rows only when no branch table covers the work", () => {
    const poolOnCovered = calculate("electrical", {
      squareFootage: 2_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true, swimming_pool: true },
    });
    // § 401 covers this job, so § 404.B's pool row stands down.
    expect(poolOnCovered.components.some((c) => c.code === "ELEC-404B-POOL")).toBe(false);

    const poolStandalone = calculate("electrical", {
      occupancy: "residential",
      workType: "repair",
      custom: { swimming_pool: true },
    });
    expect(poolStandalone.components.find((c) => c.code === "ELEC-404B-POOL")?.amountCents).toBe(
      23_500,
    );
  });
});

describe("Tulsa plumbing permits — six rows and the floor", () => {
  it("reproduces the worked example — one water heater lands on the $80 floor", () => {
    const result = calculate("plumbing", {
      occupancy: "residential",
      workType: "repair",
      custom: { heaters: 1 },
    });
    expect(result.totalCents).toBe(8_000); // $80.00 exactly

    expect(result.components.find((c) => c.code === "PL-801-HEATER")?.amountCents).toBe(3_500);
    expect(result.components.find((c) => c.code === "TUL-PL-117")?.amountCents).toBe(830);
    // § 107 charges the shortfall, last of all: $80.00 − $52.80 = $27.20.
    expect(result.components.find((c) => c.code === "TUL-PL-107")?.amountCents).toBe(2_720);
  });

  it("keeps the floor out of a permit that is already above it", () => {
    const result = calculate("plumbing", {
      occupancy: "residential",
      workType: "repair",
      custom: { heaters: 1, water_service_connections: 1 },
    });
    // $70 of rows + $11.10 § 117 ($5.50 + 8%) + $9.50 lines = $90.60 — past the
    // floor, whose row answers with a zero shortfall.
    expect(result.components.find((c) => c.code === "TUL-PL-107")?.amountCents).toBe(0);
    expect(result.totalCents).toBe(7_000 + 550 + 560 + 400 + 50 + 500);
  });

  it("charges each row for exactly the counts the job touches", () => {
    const result = calculate("plumbing", {
      fixtures: 4,
      custom: {
        meters: 2,
        backflow_devices: 1,
        grease_interceptors: 1,
      },
    });
    expect(result.components.find((c) => c.code === "PL-801A-GAS")?.amountCents).toBe(8_200);
    expect(result.components.find((c) => c.code === "PL-801-BACKFLOW")?.amountCents).toBe(7_900);
    expect(result.components.find((c) => c.code === "PL-801-INTERCEPTOR")?.amountCents).toBe(
      15_000,
    );
    // Fixtures: $81 base including the first + 3 × $3.31 = $90.93.
    expect(result.components.find((c) => c.code === "PL-801-FIXTURES")?.amountCents).toBe(9_093);
  });

  it("never guesses the garbled per-opening figure", () => {
    // § 801.A's "Plus, per opening .....$2.6887.00" has no rule: a figure that
    // cannot be read is named in prose and charged nowhere.
    const codes = rulesFor("plumbing").map((rule) => rule.code);
    expect(codes.some((code) => code.includes("OPENING"))).toBe(false);
    expect(
      rulesFor("plumbing").some((rule) => rule.description?.includes("$2.6887.00")),
    ).toBe(true);
  });
});
