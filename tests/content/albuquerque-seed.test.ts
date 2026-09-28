import { describe, expect, it } from "vitest";

import { albuquerqueSeed } from "@/content/albuquerque";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Albuquerque, New Mexico — the data, and the arithmetic the City prints itself.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The modifier splits by construction, not occupancy.** Table 112-A is priced twice —
 *     .67 for apartments, public and commercial, .50 for one- and two-family and townhouses —
 *     and both columns must come from the same raw ladder. The two sides are asserted against
 *     one valuation, and neither is charged without the `one_two_family` answer, because a
 *     missing construction class is not a reason to quote the cheaper rate.
 *  2. **The $23.50 floor sits after the multiplication.** The City's own handout crosses the
 *     floor at $801 on the commercial side and $1,201 on the residential side; those are the
 *     valuations asserted here, one cent either way. A floor applied to the raw figure first
 *     would move both crossings.
 *  3. **The bands are the table's own, seams included.** $2,000 is the last $3.05-a-$100 row
 *     and $2,001 the first $14.00-a-$1,000 row, so the price jumps rather than continues —
 *     the boundary assertions separate "band formula" from "one blended rate".
 *  4. **Plan review is a separate charge, on top.** §112.3 says "in addition to the permit
 *     fees", so 65% of the permit fee is a second component, gated behind the input, and the
 *     investigation fee doubles only the permit — the part §112.4.2 defines.
 *  5. **The trade tables are printed rates.** Modifier 1.0 means $47.00, $1.50, $0.90, $1.00,
 *     $8.00, $10.00, $15.00/$30.00 charged exactly as written — asserted at their seams.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return albuquerqueSeed.feeRules
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

describe("Albuquerque seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(albuquerqueSeed.state).toMatchObject({
      code: "NM",
      slug: "new-mexico",
      fipsCode: "35",
    });
    expect(albuquerqueSeed.county).toMatchObject({
      key: "bernalillo-county",
      fipsCode: "35001",
    });
    expect(albuquerqueSeed.jurisdiction).toMatchObject({
      key: "albuquerque",
      slug: "albuquerque",
      officialName: "City of Albuquerque",
      countyKey: "bernalillo-county",
      timezone: "America/Denver",
      isActive: true,
    });
  });

  it("shares the New Mexico state row rather than defining its own permit types", () => {
    expect(albuquerqueSeed.state.code).toBe("NM");
    expect(albuquerqueSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(albuquerqueSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(albuquerqueSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(3);
    for (const entry of albuquerqueSeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(
        true,
      );
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), `unknown source ${entry.rule.sourceId}`).toBe(
          true,
        );
      }
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
  });

  it("keeps the building table disjoint: exactly one column answers, or neither", () => {
    const commercial = calculate("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false },
    });
    const columns = commercial.components.filter((component) =>
      component.code.startsWith("BLD-"),
    );
    expect(columns.filter((component) => component.code !== "BLD-PLAN-REVIEW")).toHaveLength(1);

    // No construction-class answer is not a reason to quote the cheaper rate: both columns
    // state their conditions, neither matches, and the valuation goes unpriced.
    const unanswered = calculate("building", { valuationCents: 25_000_000 });
    expect(unanswered.components).toEqual([]);
    expect(unanswered.totalCents).toBe(0);
    expect(
      unanswered.excluded.find((rule) => rule.code === "BLD-COMMERCIAL-TABLE")?.reason,
    ).toBe("conditions_not_met");
    expect(
      unanswered.excluded.find((rule) => rule.code === "BLD-RESIDENTIAL-TABLE")?.reason,
    ).toBe("conditions_not_met");
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = albuquerqueSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(albuquerqueSeed.permitPages).toHaveLength(3);
    expect(published.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    for (const page of published) {
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
        sourceCount: albuquerqueSeed.sources.length,
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
    // The route does not read `page.lastReviewedAt`: it reads `lastVerifiedAt` from the
    // verification records joined on the page id. A page with no permit_page record gets
    // `null`, the gate fails with "The page has never been verified", and the route 404s
    // — while every content-level test above still passes. This asserts the join exists.
    for (const page of albuquerqueSeed.permitPages) {
      const record = albuquerqueSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Albuquerque building permits", () => {
  it("charges the commercial column at .67 and the residential at .50 on the same valuation", () => {
    // The worked example's $250,000 valuation: the raw ladder prices it at $1,833.75, and the
    // two modifiers split that figure — $1,228.61 and $916.88 — a difference of more than a
    // third for a question about construction class rather than about the building.
    const commercial = totalFor("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false },
    });
    const residential = totalFor("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: true },
    });

    expect(commercial).toBe(122_861);
    expect(residential).toBe(91_688);
  });

  it("applies the $23.50 floor after the modifier, at the handout's own crossings", () => {
    // The published handout's columns cross the floor at different valuations because the
    // minimum is taken against the multiplied figure: $801 commercial, $1,201 residential.
    const cases: Array<[boolean, number, number, number]> = [
      // one_two_family, valuation in cents, just below the crossing, at the crossing
      [false, 80_000, 2_350, 2_350], // $800: raw $32.65 × .67 = $21.88 — floored
      [false, 80_100, 2_350, 2_392], // $801: raw $35.70 × .67 = $23.92 — above the floor
      [true, 120_000, 2_350, 2_350], // $1,200: raw $44.85 × .50 = $22.43 — floored
      [true, 120_100, 2_350, 2_395], // $1,201: raw $47.90 × .50 = $23.95
    ];

    for (const [oneTwoFamily, valuationCents, expectedBelow, expectedAt] of cases) {
      const below = totalFor("building", {
        valuationCents: valuationCents - 100,
        custom: { one_two_family: oneTwoFamily },
      });
      const at = totalFor("building", {
        valuationCents,
        custom: { one_two_family: oneTwoFamily },
      });

      expect(below, `$${(valuationCents - 10_000) / 100}`).toBe(expectedBelow);
      expect(at, `$${valuationCents / 100}`).toBe(expectedAt);
    }
  });

  it("keeps the table's own seams: $2,000 is the last $3.05 row, $2,001 the first $14.00 row", () => {
    // The band formula changes at $2,000 and the price jumps with it — $46.40 to $55.78 on
    // the commercial side — which is what separates "six bands" from "one blended rate".
    const seam = totalFor("building", {
      valuationCents: 200_000,
      custom: { one_two_family: false },
    });
    const above = totalFor("building", {
      valuationCents: 200_100,
      custom: { one_two_family: false },
    });

    expect(seam).toBe(4_640); // $69.25 + $14.00 × 0 thousands... raw $69.25 at $2,000 → .67
    expect(above).toBe(5_578); // raw $83.25 at $2,001 → .67
    expect(above).toBeGreaterThan(seam);
  });

  it("charges plan review as a separate component in addition to the permit", () => {
    const withPlans = calculate("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false, plan_review: true },
    });
    const permitOnly = calculate("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false },
    });

    expect(
      withPlans.components.find((component) => component.code === "BLD-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(79_860); // 65% of $1,228.61
    expect(withPlans.components.map((component) => component.componentType).sort()).toEqual([
      "base",
      "plan_review",
    ]);
    expect(withPlans.totalCents).toBe(202_721);
    expect(permitOnly.totalCents).toBe(122_861);
    expect(
      permitOnly.components.some((component) => component.code === "BLD-PLAN-REVIEW"),
    ).toBe(false);
  });

  it("doubles only the permit fee when the work was done without one", () => {
    // §112.4.2: the investigation fee "shall be equal to the amount of the permit fee" — the
    // base component, not the bill, so plan review is not doubled with it.
    const result = calculate("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false, plan_review: true, unpermitted_work: true },
    });

    const surcharge = result.components.find(
      (component) => component.code === "BLD-INVESTIGATION-FEE",
    );
    expect(surcharge?.amountCents).toBe(122_861);
    expect(surcharge?.componentType).toBe("surcharge");
    expect(result.totalCents).toBe(122_861 + 79_860 + 122_861);

    const withoutPermit = totalFor("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false, unpermitted_work: true },
    });
    expect(withoutPermit).toBe(245_722);
  });

  it("adds the $47.00 re-inspection only when one is needed", () => {
    const reinspection = totalFor("building", {
      valuationCents: 25_000_000,
      custom: { one_two_family: false, reinspection: true },
    });
    expect(reinspection).toBe(122_861 + 4_700);
  });
});

describe("Albuquerque electrical permits", () => {
  it("charges the administrative charge with no other facts at all", () => {
    // Table 112-B item 1 applies to "all applications and additions to permits" — a permit
    // whose work is undescribed still carries the $47.00, and every other row is excluded
    // for a fact nobody gave.
    const result = calculate("electrical", {});
    expect(result.totalCents).toBe(4_700);
    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-ADMINISTRATIVE-CHARGE",
    ]);
  });

  it("splits outlets at twenty without charging the first twenty at the lower rate", () => {
    const at20 = calculate("electrical", { custom: { outlets: 20 } });
    const at21 = calculate("electrical", { custom: { outlets: 21 } });

    expect(at20.components.find((component) => component.code === "ELEC-OUTLETS-FIRST-20")?.amountCents).toBe(
      3_000,
    ); // 20 × $1.50
    expect(at20.totalCents).toBe(7_700);
    expect(at21.components.find((component) => component.code === "ELEC-OUTLETS-OVER-20")?.amountCents).toBe(
      3_090,
    ); // $30.00 + $0.90
    expect(at21.totalCents).toBe(7_790);
    expect(
      at21.components.filter((component) => component.code.startsWith("ELEC-OUTLETS")),
    ).toHaveLength(1);
  });

  it("splits lighting fixtures at twenty at their own over-twenty dollar", () => {
    // Outlets drop to $0.90 above twenty and lighting fixtures only to $1.00 — the same
    // count, two schedules, two totals. At twenty-one the over-twenty row carries the whole
    // count: $30.00 for the first twenty plus $1.00 for the twenty-first.
    const at20 = calculate("electrical", { custom: { lighting_fixtures: 20 } });
    expect(
      at20.components.find((component) => component.code === "ELEC-LIGHTING-FIRST-20")?.amountCents,
    ).toBe(3_000);
    expect(at20.totalCents).toBe(4_700 + 3_000);

    const at21 = calculate("electrical", { custom: { lighting_fixtures: 21 } });
    expect(
      at21.components.find((component) => component.code === "ELEC-LIGHTING-OVER-20")?.amountCents,
    ).toBe(3_100);
    expect(
      at21.components.filter((component) => component.code.startsWith("ELEC-LIGHTING")),
    ).toHaveLength(1);
    expect(at21.totalCents).toBe(4_700 + 3_100);
  });

  it("charges panels and meter loops per device at the printed rates", () => {
    expect(totalFor("electrical", { custom: { panels: 3 } })).toBe(4_700 + 2_400);
    expect(totalFor("electrical", { custom: { meters: 2 } })).toBe(4_700 + 8_000);
    expect(totalFor("electrical", { custom: { signs: 1 } })).toBe(4_700 + 4_000);
  });

  it("takes plan review at 25 percent of the permit fee, gated behind the input", () => {
    const withPlans = calculate("electrical", {
      custom: { outlets: 40, lighting_fixtures: 12, panels: 1, plan_review: true },
    });
    const withoutPlans = calculate("electrical", {
      custom: { outlets: 40, lighting_fixtures: 12, panels: 1 },
    });

    expect(
      withPlans.components.find((component) => component.code === "ELEC-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(3_025); // 25% of the $121.00 permit fee
    expect(withPlans.totalCents).toBe(15_125);
    expect(withoutPlans.totalCents).toBe(12_100);
    expect(
      withoutPlans.components.some((component) => component.code === "ELEC-PLAN-REVIEW"),
    ).toBe(false);
  });

  it("doubles the permit fee — not the bill — for work without a permit", () => {
    const result = calculate("electrical", {
      custom: { outlets: 40, lighting_fixtures: 12, panels: 1, plan_review: true, unpermitted_work: true },
    });
    expect(
      result.components.find((component) => component.code === "ELEC-INVESTIGATION-FEE")
        ?.amountCents,
    ).toBe(12_100);
    expect(result.totalCents).toBe(12_100 + 3_025 + 12_100);
  });
});

describe("Albuquerque plumbing permits", () => {
  it("charges the administrative charge and each fixture at $10.00", () => {
    const result = calculate("plumbing", { fixtures: 8 });
    expect(result.components.map((component) => component.code).sort()).toEqual([
      "PLUMB-ADMINISTRATIVE-CHARGE",
      "PLUMB-FIXTURES",
    ]);
    expect(
      result.components.find((component) => component.code === "PLUMB-FIXTURES")?.amountCents,
    ).toBe(8_000);
    expect(result.totalCents).toBe(12_700);
  });

  it("prices backflow devices by size, defaulting to the two-inch row", () => {
    const small = calculate("plumbing", { custom: { backflow_devices: 2 } });
    expect(
      small.components.find((component) => component.code === "PLUMB-BACKFLOW-TO-2IN")?.amountCents,
    ).toBe(3_000); // 2 × $15.00
    expect(small.totalCents).toBe(7_700);

    const large = calculate("plumbing", {
      custom: { backflow_devices: 2, backflow_over_2in: true },
    });
    expect(
      large.components.find((component) => component.code === "PLUMB-BACKFLOW-OVER-2IN")
        ?.amountCents,
    ).toBe(6_000); // 2 × $30.00
    expect(
      large.components.some((component) => component.code === "PLUMB-BACKFLOW-TO-2IN"),
    ).toBe(false);
    expect(large.totalCents).toBe(4_700 + 6_000);
  });

  it("charges the sprinkler row per meter and the septic row per tank", () => {
    expect(totalFor("plumbing", { custom: { meters: 1 } })).toBe(4_700 + 1_800);
    expect(totalFor("plumbing", { custom: { meters: 3 } })).toBe(4_700 + 5_400);
    expect(totalFor("plumbing", { custom: { septic_tanks: 2 } })).toBe(4_700 + 16_000);
  });

  it("charges the three connection rows only when the job makes them", () => {
    const all = totalFor("plumbing", {
      custom: { water_service: true, sewer_tap: true, house_sewer: true },
    });
    expect(all).toBe(4_700 + 1_400 + 1_800 + 2_800);

    // Stating the answer as false is answered work, not missing work — and it still charges
    // nothing, because the row is for a service the permit does not include.
    const none = calculate("plumbing", {
      custom: { water_service: false, sewer_tap: false, house_sewer: false },
    });
    expect(none.totalCents).toBe(4_700);
    expect(none.components.map((component) => component.code)).toEqual([
      "PLUMB-ADMINISTRATIVE-CHARGE",
    ]);
  });

  it("takes plumbing plan review at 25 percent of the permit fee", () => {
    const withPlans = calculate("plumbing", {
      fixtures: 8,
      custom: { backflow_devices: 2, meters: 1, plan_review: true },
    });
    expect(
      withPlans.components.find((component) => component.code === "PLUMB-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(4_375); // 25% of the $175.00 permit fee
    expect(withPlans.totalCents).toBe(21_875);
  });
});

describe("Albuquerque's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // The examples carry no amounts — only inputs and prose — so this is the arithmetic the
    // page performs at render time, asserted against the schedules it cites. The expected
    // totals are the ones each example's notes state in words.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 202_721], // $1,228.61 permit + $798.60 plan review
      ["electrical-permit-cost", "electrical", 15_125], // $121.00 permit + $30.25 plan review
      ["plumbing-permit-cost", "plumbing", 21_875], // $175.00 permit + $43.75 plan review
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = albuquerqueSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
