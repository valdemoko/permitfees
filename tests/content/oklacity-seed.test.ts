import { describe, expect, it } from "vitest";

import { oklahomaCitySeed } from "@/content/oklacity";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Oklahoma City, Oklahoma — the data, and the arithmetic Chapter 60 prints.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The two-column dating.** Ord. 27978 printed FY2025-26 and FY2026+
 *     columns; every two-column row must carry 2026-07-01 and the single-amount
 *     sections 2025-11-18, or the page would charge a superseded figure.
 *  2. **The two sections never both answer.** § 60-12-7's ladder takes
 *     alterations, § 60-12-9's class table takes new construction — and the
 *     class table answers *nothing* without custom.building_class, because
 *     guessing a class is worse than not charging.
 *  3. **The prorating reading.** § 60-12-7 prints no "or fraction thereof", so
 *     $1,500 computes $9.00 before the $75 floor — the opposite of Cleveland.
 *  4. **Electrical's 4,000 sq ft seam and 200-amp threshold**, and the fact
 *     that Title 18 states no minimum.
 *  5. **Plumbing reads counts only**, and one_/two_family is a fact rather than
 *     an occupancy label — the exclusion is what moves multifamily.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return oklahomaCitySeed.feeRules
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

describe("Oklahoma City seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(oklahomaCitySeed.state).toMatchObject({ code: "OK", slug: "oklahoma", fipsCode: "40" });
    expect(oklahomaCitySeed.county).toMatchObject({ key: "oklahoma-county", fipsCode: "40109" });
    expect(oklahomaCitySeed.jurisdiction).toMatchObject({
      key: "oklahoma-city",
      slug: "oklahoma-city",
      officialName: "City of Oklahoma City",
      countyKey: "oklahoma-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the Oklahoma state row rather than defining its own permit types", () => {
    expect(oklahomaCitySeed.state.code).toBe("OK");
    expect(oklahomaCitySeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(oklahomaCitySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(oklahomaCitySeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(5);
    expect(scheduleKeys.size).toBe(4);
    // The three code titles and the impact-fee page carry figures of their own;
    // the hub page only links, which is why it is not primary.
    expect(oklahomaCitySeed.sources.filter((source) => source.isPrimary)).toHaveLength(4);

    for (const entry of oklahomaCitySeed.feeRules) {
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

    const ids = oklahomaCitySeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("dates every two-column figure at 2026-07-01 and single-amount sections at the ordinance date", () => {
    const byCode = new Map(
      oklahomaCitySeed.feeRules.map((entry) => [entry.rule.code, entry.rule]),
    );

    // Two-column rows: the 2026 column is in force on this pass.
    expect(byCode.get("BLD-DEMO")?.effectiveFrom).toBe("2026-07-01");
    expect(byCode.get("BLD-PV")?.effectiveFrom).toBe("2026-07-01");
    expect(byCode.get("BLD-MOBILE-HOME-PARK")?.effectiveFrom).toBe("2026-07-01");
    expect(byCode.get("ELEC-RES-NEW-BASE")?.effectiveFrom).toBe("2026-07-01");
    expect(byCode.get("PL-RES-ALTER-BASE")?.effectiveFrom).toBe("2026-07-01");
    expect(byCode.get("PL-COMM-BASE")?.effectiveFrom).toBe("2026-07-01");

    // Single-amount sections carry the ordinance that printed them.
    expect(byCode.get("BLD-ALTER")?.effectiveFrom).toBe("2025-11-18");
    expect(byCode.get("BLD-NEW-CLASS")?.effectiveFrom).toBe("2025-11-18");
    expect(byCode.get("ELEC-COMM-NEW-LARGE-BASE")?.effectiveFrom).toBe("2025-11-18");
    expect(byCode.get("IMPACT-STREETS")?.effectiveFrom).toBe("2017-01-01");
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(oklahomaCitySeed.permitPages).toHaveLength(3);
    expect(
      oklahomaCitySeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of oklahomaCitySeed.permitPages) {
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
        sourceCount: oklahomaCitySeed.sources.length,
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
    for (const page of oklahomaCitySeed.permitPages) {
      const record = oklahomaCitySeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Oklahoma City building permits — two sections, one class fact", () => {
  it("prorates the alteration ladder and floors it at $75", () => {
    // $1,500 at $6.00 per $1,000 with no "or fraction thereof" — $9.00, floored.
    expect(
      totalFor("building", {
        valuationCents: 150_000,
        occupancy: "residential",
        workType: "alteration",
        custom: {},
      }),
    ).toBe(7_500 + 50);

    // $2,000,000 computes $12,000.00 — no floor involved, prorated exactly.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 200_000_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: {},
        },
        "BLD-ALTER",
      ),
    ).toBe(1_200_000);
  });

  it("prices new construction from the class table, and answers nothing without a class", () => {
    const office = totalFor("building", {
      squareFootage: 49_500,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { building_class: "office" },
    });
    expect(office).toBe(49_500 * 28 + 50); // $13,860.00 + $0.50

    const warehouse = amountFor(
      "building",
      {
        squareFootage: 10_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { building_class: "warehouse" },
      },
      "BLD-NEW-CLASS",
    );
    expect(warehouse).toBe(10_000 * 19);

    // "commercial" alone does not say warehouse or office, so the schedule's own
    // class is required: without it the rule answers nothing rather than guessing.
    const noClass = calculate("building", {
      squareFootage: 49_500,
      occupancy: "commercial",
      workType: "new_construction",
      custom: {},
    });
    expect(noClass.components.find((c) => c.code === "BLD-NEW-CLASS")).toBeUndefined();
    expect(noClass.totalCents).toBe(50); // the state line still charges
  });

  it("keeps the ladder and the class table from ever both answering", () => {
    // A job with both a valuation and an area still prices one section: the
    // ladder answers alterations only, the class table new construction only.
    const alteration = calculate("building", {
      valuationCents: 50_000_000,
      squareFootage: 49_500,
      occupancy: "commercial",
      workType: "alteration",
      custom: { building_class: "office" },
    });
    expect(alteration.components.map((c) => c.code)).toEqual(["BLD-ALTER", "BLD-OUCC"]);

    const newWork = calculate("building", {
      valuationCents: 50_000_000,
      squareFootage: 49_500,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { building_class: "office" },
    });
    expect(newWork.components.map((c) => c.code)).toEqual(["BLD-NEW-CLASS", "BLD-OUCC"]);
  });

  it("prices demolition by stories, not by cost or area", () => {
    // $78 first story + $12 each additional: three stories is $102.00 + $0.50.
    expect(
      totalFor("building", {
        occupancy: "commercial",
        workType: "demolition",
        custom: { stories: 3 },
      }),
    ).toBe(10_200 + 50);

    expect(
      amountFor(
        "building",
        { occupancy: "commercial", workType: "demolition", custom: { stories: 1 } },
        "BLD-DEMO",
      ),
    ).toBe(7_800);
  });

  it("carries the $0.50 state line on every permit of every trade", () => {
    expect(
      amountFor(
        "building",
        { valuationCents: 1_000_000, workType: "alteration", custom: {} },
        "BLD-OUCC",
      ),
    ).toBe(50);
    expect(
      amountFor(
        "electrical",
        { squareFootage: 1_000, occupancy: "commercial", workType: "alteration", custom: {} },
        "ELEC-OUCC",
      ),
    ).toBe(50);
    expect(
      amountFor("plumbing", { custom: { one_two_family: true, fixtures: 2 } }, "PL-OUCC"),
    ).toBe(50);
  });

  it("selects each misc row by its own fact, with the roof row's 500 sq ft scope", () => {
    const rows = calculate("building", {
      valuationCents: 1_000_000,
      squareFootage: 900,
      occupancy: "residential",
      workType: "repair",
      custom: {
        swimming_pool: true,
        roof_replacement: true,
        insulation_installation: true,
      },
    });
    expect(rows.components.map((c) => c.code).sort()).toEqual([
      "BLD-ALTER",
      "BLD-INSULATION",
      "BLD-OUCC",
      "BLD-POOL",
      "BLD-ROOF",
    ]);
    // $0.03 per sq ft of insulation on a residential job.
    expect(rows.components.find((c) => c.code === "BLD-INSULATION")?.amountCents).toBe(900 * 3);

    // The roof row's scope is the schedule's own: over 500 square feet.
    const underScope = calculate("building", {
      squareFootage: 400,
      occupancy: "residential",
      workType: "repair",
      custom: { roof_replacement: true },
    });
    expect(underScope.components.find((c) => c.code === "BLD-ROOF")).toBeUndefined();

    // Insulation is residential in the schedule's word.
    const commercialInsulation = calculate("building", {
      squareFootage: 900,
      occupancy: "commercial",
      workType: "repair",
      custom: { insulation_installation: true },
    });
    expect(
      commercialInsulation.components.find((c) => c.code === "BLD-INSULATION"),
    ).toBeUndefined();
  });

  it("charges the mobile home park as minimum plus every lot", () => {
    // $478 minimum + $5.00 per lot being created, first lot included in the per-lot
    // count because the schedule says minimum PLUS per lot: 100 lots is $978.00.
    expect(
      amountFor(
        "building",
        { workType: "new_construction", units: 100, custom: { mobile_home_park: true } },
        "BLD-MOBILE-HOME-PARK",
      ),
    ).toBe(47_800 + 100 * 500);
  });

  it("assesses streets from the six-by-four table and parks for residential only", () => {
    // Streets: Residential × Core = $0.34 per sq ft.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_000,
          workType: "new_construction",
          custom: {
            building_class: "residential",
            land_use_category: "Residential",
            streets_assessment_area: "Core",
          },
        },
        "IMPACT-STREETS",
      ),
    ).toBe(10_000 * 34);

    // The same land use in Rural is $0.47 — the table's own row, not an average.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_000,
          workType: "new_construction",
          custom: {
            building_class: "residential",
            land_use_category: "Residential",
            streets_assessment_area: "Rural",
          },
        },
        "IMPACT-STREETS",
      ),
    ).toBe(10_000 * 47);

    // Parks fires for the Residential category ($0.53)…
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_000,
          workType: "new_construction",
          custom: {
            building_class: "residential",
            land_use_category: "Residential",
            streets_assessment_area: "Core",
          },
        },
        "IMPACT-PARKS",
      ),
    ).toBe(10_000 * 53);

    // …and not for any other category.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_000,
          workType: "new_construction",
          custom: {
            building_class: "office",
            land_use_category: "Office/Institutional/Lodging",
            streets_assessment_area: "Infill",
          },
        },
        "IMPACT-PARKS",
      ),
    ).toBeUndefined();

    // No category supplied: no impact fee at all — the honest exclusion.
    const bare = calculate("building", {
      squareFootage: 10_000,
      workType: "new_construction",
      custom: { building_class: "residential" },
    });
    expect(bare.components.find((c) => c.code.startsWith("IMPACT"))).toBeUndefined();
  });
});

describe("Oklahoma City electrical permits — five regimes, no floor", () => {
  it("adds the residential amp row from 200 and rounds whole hundreds", () => {
    // 400 amps: 200 over the base's 200 = two additional hundreds at $50.
    expect(
      totalFor("electrical", {
        squareFootage: 2_000,
        occupancy: "residential",
        workType: "new_construction",
        custom: { amperage: 400 },
      }),
    ).toBe(17_500 + 10_000 + 5_000 + 5_000 + 50);

    // 350 amps rounds 150 up to 200 — the same two hundreds.
    expect(
      amountFor(
        "electrical",
        { squareFootage: 2_000, occupancy: "residential", workType: "new_construction", custom: { amperage: 350 } },
        "ELEC-RES-NEW-AMPS",
      ),
    ).toBe(10_000);

    // 200 amps or fewer pays no amp row — the rule answers with a zero step
    // rather than disappearing, and charges nothing.
    expect(
      amountFor(
        "electrical",
        { squareFootage: 2_000, occupancy: "residential", workType: "new_construction", custom: { amperage: 200 } },
        "ELEC-RES-NEW-AMPS",
      ),
    ).toBe(0);
  });

  it("reproduces the worked example — commercial new construction, 5,000 sq ft, 400 amps", () => {
    const result = calculate("electrical", {
      squareFootage: 5_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { amperage: 400 },
    });
    expect(result.totalCents).toBe(47_650); // $476.50
    expect(result.components.find((c) => c.code === "ELEC-COMM-NEW-LARGE-BASE")?.amountCents).toBe(
      22_100,
    );
    expect(
      result.components.find((c) => c.code === "ELEC-COMM-NEW-LARGE-AMPS")?.amountCents,
    ).toBe(20_700); // 2 additional hundreds at $103.50
  });

  it("meets the 4,000 sq ft seam from both sides", () => {
    const below = codesFor("electrical", {
      squareFootage: 3_999,
      occupancy: "commercial",
      workType: "new_construction",
      custom: {},
    });
    expect(below).toContain("ELEC-COMM-NEW-SMALL-BASE");
    expect(below).not.toContain("ELEC-COMM-NEW-LARGE-BASE");

    const at = codesFor("electrical", {
      squareFootage: 4_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: {},
    });
    expect(at).toContain("ELEC-COMM-NEW-LARGE-BASE");
    expect(at).not.toContain("ELEC-COMM-NEW-SMALL-BASE");
  });

  it("makes the five-outlet permit standalone while it is selected", () => {
    const result = calculate("electrical", {
      squareFootage: 2_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { amperage: 300, five_outlets_standalone: true },
    });
    // The branch regimes stand down: only the standalone row and the state line.
    expect(result.components.map((c) => c.code).sort()).toEqual([
      "ELEC-FIVE-OUTLETS",
      "ELEC-OUCC",
    ]);
    expect(result.totalCents).toBe(10_000 + 50);
  });

  it("states no minimum — a small electrical permit pays its rows, under $75", () => {
    // A meter base inspection ($50) + the state line: $50.50, no floor anywhere.
    expect(
      totalFor("electrical", {
        occupancy: "residential",
        workType: "repair",
        custom: { meter_base: true },
      }),
    ).toBe(5_000 + 50);
  });
});

describe("Oklahoma City plumbing permits — counts, and a fact instead of a label", () => {
  it("reproduces the worked example — a one-/two-family dwelling, three bathrooms", () => {
    const result = calculate("plumbing", {
      occupancy: "residential",
      workType: "new_construction",
      custom: {
        one_two_family: true,
        bathrooms: 3,
        water_service_connections: 1,
        connections: 1,
      },
    });
    expect(result.totalCents).toBe(17_050); // $170.50
    expect(result.components.find((c) => c.code === "PL-RES-NEW-BASE")?.amountCents).toBe(8_300);
    expect(result.components.find((c) => c.code === "PL-RES-NEW-BATHROOMS")?.amountCents).toBe(
      5_700,
    ); // first bathroom inside the base
    expect(result.components.find((c) => c.code === "PL-RES-NEW-WATER")?.amountCents).toBe(1_500);
    expect(result.components.find((c) => c.code === "PL-RES-NEW-SEWER")?.amountCents).toBe(1_500);
  });

  it("moves multifamily to the commercial schedule by the exclusion, not by occupancy", () => {
    // Residential occupancy, but not one-/two-family: § 60-42-9 answers.
    const multifamily = calculate("plumbing", {
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: false, fixtures: 0 },
    });
    expect(multifamily.components.map((c) => c.code)).toContain("PL-COMM-BASE");
    expect(multifamily.components.map((c) => c.code)).not.toContain("PL-RES-NEW-BASE");

    // One-/two-family alterations take § 60-42-7's schedule instead.
    const alteration = calculate("plumbing", {
      occupancy: "residential",
      workType: "alteration",
      fixtures: 6,
      custom: { one_two_family: true, water_service_connections: 1 },
    });
    expect(alteration.components.find((c) => c.code === "PL-RES-ALTER-BASE")?.amountCents).toBe(
      8_400,
    );
    expect(alteration.components.find((c) => c.code === "PL-RES-ALTER-FIXTURES")?.amountCents).toBe(
      4_200,
    );
    expect(alteration.components.find((c) => c.code === "PL-RES-ALTER-WATER")?.amountCents).toBe(
      2_550,
    );
  });

  it("keeps the residential schedules from reading fixtures a new dwelling already includes", () => {
    // § 60-42-6's $83 base says "all fixtures integral to the structure": a new
    // one-/two-family dwelling with fixtures given pays no per-fixture row.
    const result = calculate("plumbing", {
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true, fixtures: 8, bathrooms: 1 },
    });
    // The $7 fixture row exists only on § 60-42-7 and § 60-42-9 — a new dwelling's
    // fixtures are inside its $83 base, and no per-fixture line answers here.
    expect(result.components.some((c) => c.code.includes("FIXTURE"))).toBe(false);
    expect(result.totalCents).toBe(8_300 + 50);
  });

  it("prices the special rows by their own counts", () => {
    const result = calculate("plumbing", {
      custom: {
        grease_interceptors: 2,
        commercial_dishwasher: true,
        yard_sprinkler: true,
      },
    });
    expect(result.components.find((c) => c.code === "PL-INTERCEPTOR")?.amountCents).toBe(3_000);
    expect(result.components.find((c) => c.code === "PL-DISHWASHER")?.amountCents).toBe(1_500);
    expect(result.components.find((c) => c.code === "PL-YARD-SPRINKLER")?.amountCents).toBe(3_000);
    expect(result.totalCents).toBe(3_000 + 1_500 + 3_000 + 50);
  });
});
