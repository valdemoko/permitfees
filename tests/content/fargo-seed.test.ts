import { describe, expect, it } from "vitest";

import { fargoSeed } from "@/content/fargo";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Fargo, North Dakota — the data, and the arithmetic the sheets print.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **Two sheets, one switch, never both.** The residential and commercial building
 *     sheets are separate schedules split on `custom.one_two_family` — the sheet's own
 *     "(one- and two-family dwellings)" scope line — and the exclusivity assertions run
 *     every class-sensitive input through both prefixes.
 *  2. **Every band rounds up, because every band prints the phrase.** "Or fraction
 *     thereof" appears in both sheets' bands after the first, so $1,500 of valuation
 *     pays one whole step (residential $5.56, commercial $12.75) rather than the
 *     prorated fraction — asserted where the two readings diverge.
 *  3. **The seams close to the cent — except the one the sheet itself breaks.** Every
 *     band's endpoint is the printed base of the band above it, and the commercial
 *     sheet's own 25-cent discontinuity at $50,000 ($578.50 computed vs $578.75
 *     printed) is asserted from both sides rather than reconciled.
 *  4. **Electrical is the state board's table, because Fargo publishes none.** Both
 *     NDSEB bands with their exact seam at $440.00, the $50 minimum, the late
 *     certificate — all as state fees, with the City's own fee-schedule index proving
 *     the absence of a city schedule.
 *  5. **Plumbing prices rows and fixtures, never costs** — the allowance sits inside
 *     the $50 base, and no plumbing rule reads a valuation at all.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return fargoSeed.feeRules
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

describe("Fargo seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(fargoSeed.state).toMatchObject({ code: "ND", slug: "north-dakota", fipsCode: "38" });
    expect(fargoSeed.county).toMatchObject({ key: "cass-county", fipsCode: "38017" });
    expect(fargoSeed.jurisdiction).toMatchObject({
      key: "fargo",
      slug: "fargo",
      officialName: "City of Fargo",
      countyKey: "cass-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the North Dakota state row rather than defining its own permit types", () => {
    expect(fargoSeed.state.code).toBe("ND");
    expect(fargoSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(fargoSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(fargoSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(9);
    expect(scheduleKeys.size).toBe(4);
    for (const entry of fargoSeed.feeRules) {
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

    const ids = fargoSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("splits the rules by permit type the way the schedules do", () => {
    // 22 building rules (3 residential bands + 7 commercial bands + plan review + 6 flat
    // rows + 5 unpermitted rows), 3 electrical (two NDSEB bands + the late certificate),
    // 8 plumbing (the inside-permit, six rows, the doubling).
    expect(rulesFor("building")).toHaveLength(22);
    expect(rulesFor("electrical")).toHaveLength(3);
    expect(rulesFor("plumbing")).toHaveLength(8);
  });

  it("prices electrical from the state board's source only — no city fee exists", () => {
    for (const rule of rulesFor("electrical")) {
      expect(rule.sourceId, rule.code).toBe("fargo-ndseb-inspection-fees");
    }
    for (const rule of rulesFor("electrical")) {
      expect(rule.componentType, rule.code).toBe("state_surcharge");
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(fargoSeed.permitPages).toHaveLength(3);
    expect(
      fargoSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of fargoSeed.permitPages) {
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
        sourceCount: fargoSeed.sources.length,
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
    for (const page of fargoSeed.permitPages) {
      const record = fargoSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Fargo building permits — two sheets, one switch", () => {
  it("charges exactly one sheet's rows for any input, never a mix", () => {
    const classSensitive: Array<Omit<CalculationInput, "asOf">> = [
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: true } },
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: false } },
      { workType: "alteration", valuationCents: 6_000_000, custom: {} },
      { workType: "new_construction", valuationCents: 100_000, custom: { one_two_family: true } },
      { workType: "demolition", valuationCents: 6_000_000, custom: { one_two_family: false } },
      { workType: "demolition", custom: { one_two_family: true } },
      {
        workType: "alteration",
        valuationCents: 1_000_000,
        custom: { one_two_family: false, unpermitted_work: true },
      },
    ];

    for (const input of classSensitive) {
      const baseCodes = calculate("building", input).components
        .filter((component) => component.componentType === "base")
        .map((component) => component.code);
      const residential = baseCodes.filter((code) => code.startsWith("FARGO-RES-"));
      const commercial = baseCodes.filter((code) => code.startsWith("FARGO-COM-"));
      expect(
        residential.length === 0 || commercial.length === 0,
        `both sheets answered for ${JSON.stringify(input)}: ${baseCodes.join(", ")}`,
      ).toBe(true);
    }
  });

  it("keeps the ladder out of demolition, where the sheet's own flat row answers instead", () => {
    // The flat rows ("Demolition Permit: $100.00") are separate permits rather than a
    // band of the ladder, so the bands exclude demolition work even when a valuation is
    // present — the flat row alone answers.
    const input: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      valuationCents: 6_000_000,
      custom: { one_two_family: false },
    };
    const baseCodes = calculate("building", input).components
      .filter((component) => component.componentType === "base")
      .map((component) => component.code);
    expect(baseCodes).toEqual(["FARGO-DEMOLITION"]);
    expect(totalFor("building", input)).toBe(10_000);
  });

  it("walks the residential ladder's edges, rounding every band up to a whole $1,000", () => {
    const edges: Array<[number, number]> = [
      // valuation cents, total (nothing else answers a bare residential alteration)
      [100_000, 5_000], // $1,000 → the flat first band
      [100_100, 5_556], // $1,001 → $50.00 + one whole $5.56 step for the $1 fraction
      [150_000, 5_556], // $1,500 → still one step (prorated would be $52.78)
      [10_000_000, 60_044], // $100,000 → $50 + 99 × $5.56, exactly band 3's printed base
      [10_000_100, 60_350], // $100,001 → band 3's base + one $3.06 step
      [150_000_000, 488_444], // $1.5M → $600.44 + 1,400 × $3.06
    ];

    for (const [valuationCents, total] of edges) {
      const input: Omit<CalculationInput, "asOf"> = {
        workType: "alteration",
        valuationCents,
        custom: { one_two_family: true },
      };
      expect(totalFor("building", input), `$${valuationCents / 100}`).toBe(total);
    }
  });

  it("walks the commercial ladder's edges, including the two seams it closes", () => {
    const edges: Array<[number, number]> = [
      [100_000, 5_500], // $1,000 → flat first band
      [100_100, 6_775], // $1,001 → $55.00 + one whole $12.75 step
      [150_000, 6_775], // $1,500 → still one step (prorated would be $61.38)
      [2_500_000, 36_100], // $25,000 → $55 + 24 × $12.75 = exactly band 3's printed base
      [5_000_000, 57_850], // $50,000 → band 3 computes $578.50 (see the jump below)
      [10_000_000, 88_575], // $100,000 → $578.75 + 50 × $6.14, exactly band 5's base
      [50_000_000, 288_175], // $500,000 → $885.75 + 400 × $4.99, exactly band 6's base
      [100_000_000, 531_675], // $1,000,000 → $2,881.75 + 500 × $4.87, exactly band 7's base
    ];

    for (const [valuationCents, total] of edges) {
      const input: Omit<CalculationInput, "asOf"> = {
        workType: "alteration",
        valuationCents,
        custom: { one_two_family: false },
      };
      expect(totalFor("building", input), `$${valuationCents / 100}`).toBe(total);
    }
  });

  it("keeps the commercial sheet's own $0.25 jump at $50,000, asserted from both sides", () => {
    // The document's arithmetic, not the model's: band 3 ("$361.00 for the first
    // $25,000 plus $8.70 for each additional $1,000 … to and including $50,000")
    // computes exactly $578.50 at $50,000, while band 4 prints its base as $578.75.
    // Both are charged as printed — the same way Las Cruces's $100 jump is kept.
    const atBoundary = totalFor("building", {
      workType: "alteration",
      valuationCents: 5_000_000,
      custom: { one_two_family: false },
    });
    expect(atBoundary).toBe(57_850); // the computed side

    const above = totalFor("building", {
      workType: "alteration",
      valuationCents: 5_000_100,
      custom: { one_two_family: false },
    });
    expect(above).toBe(58_489); // printed base $578.75 + one whole $6.14 step
    expect(above - 614).toBe(57_875); // the printed base of the band above
    expect(atBoundary).not.toBe(57_875); // the 25-cent discontinuity, left in place
  });

  it("charges plan review at 20% of the permit fee — commercial only, and only with plans", () => {
    // $40,000 → band 3: $361.00 + 15 × $8.70 = $491.50 of permit fee, 20% is $98.30.
    const larger: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 4_000_000,
      custom: { one_two_family: false, plan_review: true },
    };
    expect(amountFor("building", larger, "FARGO-COM-25001-50000")).toBe(49_150);
    expect(amountFor("building", larger, "FARGO-COM-PLAN-REVIEW")).toBe(9_830);
    expect(totalFor("building", larger)).toBe(58_980);

    // The $50 floor binds below a $250 permit fee: $1,001 computes 20% of $67.75.
    const smaller: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 100_100,
      custom: { one_two_family: false, plan_review: true },
    };
    expect(amountFor("building", smaller, "FARGO-COM-PLAN-REVIEW")).toBe(5_000);
    expect(totalFor("building", smaller)).toBe(6_775 + 5_000);

    // Without plans the sheet's own condition ("when a plan review is required") keeps
    // the line off the total entirely.
    const noPlans = { ...smaller, custom: { one_two_family: false } };
    expect(amountFor("building", noPlans, "FARGO-COM-PLAN-REVIEW")).toBeUndefined();

    // And the residential sheet prints no plan-review line at all: the absence is kept.
    const residential: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 4_000_000,
      custom: { one_two_family: true, plan_review: true },
    };
    expect(codesFor("building", residential).some((code) => code.includes("PLAN-REVIEW"))).toBe(
      false,
    );
    expect(totalFor("building", residential)).toBe(26_684); // $50 + 39 × $5.56, no review
  });

  it("prices the flat rows both sheets print, with their two-condition reductions", () => {
    const demolition: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      custom: { one_two_family: true },
    };
    expect(amountFor("building", demolition, "FARGO-DEMOLITION")).toBe(10_000);

    const reducedDemo = { ...demolition, custom: { one_two_family: true, demo_reduced: true } };
    expect(amountFor("building", reducedDemo, "FARGO-DEMOLITION")).toBeUndefined();
    expect(totalFor("building", reducedDemo)).toBe(5_000);

    const moving: Omit<CalculationInput, "asOf"> = {
      custom: { house_moving: true },
    };
    expect(amountFor("building", moving, "FARGO-MOVING")).toBe(30_000);

    const extraterritorial = { custom: { house_moving: true, extraterritorial: true } };
    expect(amountFor("building", extraterritorial, "FARGO-MOVING")).toBeUndefined();
    expect(amountFor("building", extraterritorial, "FARGO-MOVING-EXTRATERRITORIAL")).toBe(15_000);

    const reducedMove = { custom: { house_moving: true, demo_reduced: true } };
    expect(amountFor("building", reducedMove, "FARGO-MOVING-REDUCED")).toBe(5_000);
    expect(codesFor("building", reducedMove).some((code) => code === "FARGO-MOVING")).toBe(false);

    const appeals: Omit<CalculationInput, "asOf"> = {
      custom: { board_of_appeals: true },
    };
    expect(amountFor("building", appeals, "FARGO-BOARD-OF-APPEALS")).toBe(15_000);
  });

  it("applies the unpermitted-work table's three bands with each sheet's own floors", () => {
    // Doubled, $0–$50,000: both sheets print it identically, so one rule with no class
    // gate — and the surcharge equals the permit fee the ladder computed.
    const doubled: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 1_000_000, // $10,000 → band 2: $50 + 9 × $5.56 = $100.04
      custom: { one_two_family: true, unpermitted_work: true },
    };
    expect(amountFor("building", doubled, "FARGO-RES-1001-100000")).toBe(10_004);
    const surcharge = calculate("building", doubled).components.find(
      (component) => component.code === "FARGO-UNPERMITTED-DOUBLED",
    );
    expect(surcharge?.amountCents).toBe(10_004);
    expect(surcharge?.componentType).toBe("surcharge");
    expect(totalFor("building", doubled)).toBe(20_008);

    // 50% band, residential floor: $100,000 → permit $600.44, half is $300.22, and the
    // sheet's $550 minimum binds.
    const resFloor: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 10_000_000,
      custom: { one_two_family: true, unpermitted_work: true },
    };
    expect(amountFor("building", resFloor, "FARGO-UNPERMITTED-50-RES")).toBe(55_000);

    // Above the floor: $300,000 → permit $1,212.44, half is $606.22 — paid as computed.
    const resAbove: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 30_000_000,
      custom: { one_two_family: true, unpermitted_work: true },
    };
    expect(amountFor("building", resAbove, "FARGO-UNPERMITTED-50-RES")).toBe(60_622);
    expect(amountFor("building", resAbove, "FARGO-UNPERMITTED-50-COM")).toBeUndefined();

    // The commercial floor on the same band: $60,000 → permit $640.15, half is $320.08,
    // and the commercial sheet's $980 minimum binds where the residential one would not.
    const comFloor: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: false, unpermitted_work: true },
    };
    expect(amountFor("building", comFloor, "FARGO-UNPERMITTED-50-COM")).toBe(98_000);

    // 25% band, above the floor: $3,000,000 → permit $9,474.44, a quarter is $2,368.61.
    const resTwentyFive: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 300_000_000,
      custom: { one_two_family: true, unpermitted_work: true },
    };
    expect(amountFor("building", resTwentyFive, "FARGO-UNPERMITTED-25-RES")).toBe(236_861);

    // 25% band, commercial floor: $600,000 → a quarter of $3,368.75 is below $2,500.
    const comTwentyFive: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 60_000_000,
      custom: { one_two_family: false, unpermitted_work: true },
    };
    expect(amountFor("building", comTwentyFive, "FARGO-UNPERMITTED-25-COM")).toBe(250_000);
    expect(amountFor("building", comTwentyFive, "FARGO-UNPERMITTED-25-RES")).toBeUndefined();
  });
});

describe("Fargo electrical permits — the state board's table, because there is no city fee", () => {
  it("charges the first band's minimum until the balance starts, then 2% of it", () => {
    const edges: Array<[number, number]> = [
      [10_000, 5_000], // $100 → the printed minimum, "Up to $500.00 — $50.00 (minimum fee)"
      [50_000, 5_000], // $500 → threshold exactly, balance nothing
      [1_050_000, 25_000], // $10,500 → $50 + 2% of $10,000
      [2_000_000, 44_000], // $20,000 → the formula closes at exactly the band above's base
      [4_000_000, 46_000], // $40,000 → $440 + 1/10 of 1% of $20,000
    ];

    for (const [valuationCents, total] of edges) {
      const input: Omit<CalculationInput, "asOf"> = { valuationCents };
      expect(totalFor("electrical", input), `$${valuationCents / 100}`).toBe(total);
    }
  });

  it("adds the late wiring certificate's $50 as its own state line", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      valuationCents: 1_050_000,
      custom: { late_certificate: true },
    };
    expect(amountFor("electrical", input, "ELEC-NDSEB-LATE-CERTIFICATE")).toBe(5_000);
    const late = calculate("electrical", input).components.find(
      (component) => component.code === "ELEC-NDSEB-LATE-CERTIFICATE",
    );
    expect(late?.componentType).toBe("state_surcharge");
    expect(totalFor("electrical", input)).toBe(30_000);
  });

  it("asks for the valuation when a band needs it, instead of dropping out silently", () => {
    // The first band is gated as a negated greater-than precisely so a calculation with
    // no valuation still reaches the rule — the rule then fails on its basis and the
    // warning names the input the page must ask for.
    const result = calculate("electrical", { custom: {} });
    expect(result.totalCents).toBe(0);
    expect(result.warnings.join(" ")).toContain('"valuation"');
  });
});

describe("Fargo plumbing permits — rows and fixtures, never costs", () => {
  it("holds the fixture allowance inside the $50 base", () => {
    const cases: Array<[number, number]> = [
      [3, 5_000], // inside the allowance
      [5, 5_000], // the allowance's edge
      [6, 6_000], // one over
      [8, 8_000], // three over: $50 + 3 × $10
    ];

    for (const [fixtures, total] of cases) {
      const input: Omit<CalculationInput, "asOf"> = {
        fixtures,
        custom: { inside_plumbing: true },
      };
      expect(totalFor("plumbing", input), `${fixtures} fixtures`).toBe(total);
    }

    // Without the inside-permit fact the row answers nothing — it is a permit type, not
    // an automatic charge on every plumbing job.
    const outside: Omit<CalculationInput, "asOf"> = { fixtures: 4, custom: {} };
    expect(codesFor("plumbing", outside).some((code) => code === "PLUMB-INSIDE")).toBe(false);
  });

  it("asks for the fixture count when the inside-permit answers without one", () => {
    const result = calculate("plumbing", { custom: { inside_plumbing: true } });
    expect(result.totalCents).toBe(0);
    expect(result.warnings.join(" ")).toContain('"fixtures"');
  });

  it("prices every row of the schedule at its printed amount", () => {
    const rows: Array<[Record<string, string | number | boolean>, string, number]> = [
      [{ water_heating: true }, "PLUMB-WATER-HEATING", 3_500],
      [{ sewer_original: true }, "PLUMB-SEWER-ORIGINAL", 12_500],
      [{ sewer_disconnect: true }, "PLUMB-SEWER-DISCONNECT", 7_000],
      [{ sewer_additional: true }, "PLUMB-SEWER-ADDITIONAL", 3_000],
      [{ sewer_repair: true }, "PLUMB-SEWER-REPAIR", 7_500],
      [{ lawn_sprinkler: true }, "PLUMB-LAWN-SPRINKLER", 4_000],
    ];

    for (const [custom, code, amount] of rows) {
      const input: Omit<CalculationInput, "asOf"> = { custom };
      expect(totalFor("plumbing", input), code).toBe(amount);
      expect(amountFor("plumbing", input, code), code).toBe(amount);
    }

    // The rows the job triggers add up, as the schedule's total adds them.
    const combined: Omit<CalculationInput, "asOf"> = {
      fixtures: 8,
      custom: { inside_plumbing: true, sewer_original: true },
    };
    expect(totalFor("plumbing", combined)).toBe(8_000 + 12_500);
  });

  it("ignores the valuation entirely — no plumbing rule reads a cost", () => {
    const cheap: Omit<CalculationInput, "asOf"> = {
      fixtures: 4,
      valuationCents: 100_000,
      custom: { inside_plumbing: true },
    };
    const expensive: Omit<CalculationInput, "asOf"> = {
      fixtures: 4,
      valuationCents: 900_000_000,
      custom: { inside_plumbing: true },
    };
    expect(totalFor("plumbing", cheap)).toBe(5_000);
    expect(totalFor("plumbing", expensive)).toBe(totalFor("plumbing", cheap));
  });

  it("doubles the permit fee for work commenced without a permit", () => {
    // "Double fees for all work commenced without a permit" — a surcharge equal to the
    // plumbing permit fee, the same reading Las Cruces's tripling gets.
    const input: Omit<CalculationInput, "asOf"> = {
      fixtures: 8,
      custom: { inside_plumbing: true, unpermitted_work: true },
    };
    const surcharge = calculate("plumbing", input).components.find(
      (component) => component.code === "PLUMB-UNPERMITTED-DOUBLE",
    );
    expect(surcharge?.amountCents).toBe(8_000);
    expect(surcharge?.componentType).toBe("surcharge");
    expect(totalFor("plumbing", input)).toBe(16_000);
  });
});

describe("Fargo's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // Inputs and prose only, as everywhere: these totals are the arithmetic the page
    // performs when it renders, asserted against the amounts its own notes state.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 58_980], // $491.50 + $98.30
      ["electrical-permit-cost", "electrical", 25_000], // $50 + 2% of $10,000
      ["plumbing-permit-cost", "plumbing", 20_500], // $80.00 + $125.00
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = fargoSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
