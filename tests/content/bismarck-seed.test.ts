import { describe, expect, it } from "vitest";

import { bismarckSeed } from "@/content/bismarck";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Bismarck, North Dakota — the data, and the arithmetic the sheets print.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **One ladder, both sheets, asserted identical.** The residential and commercial
 *     sheets print numerically identical tables, so the ladder is one rule set — and
 *     the tests charge both construction classes at several valuations and require the
 *     ladder component to be the same number each time. The class switch does only the
 *     one job the sheets differ on: the unconditional 20% review fee.
 *  2. **Every band prorates, because no band prints the round-up phrase.** $2,500 of
 *     job cost is $71.95 where a whole-thousand reading would be $76.15 — the reading
 *     that stands opposite Fargo's, where every band prints "or fraction thereof".
 *  3. **The ladder closes at all six seams.** $40 + 15 × $1.85 = $67.75, and the chain
 *     runs through $260.95, $413.45, $623.45, $1,983.45 and $3,408.45, each closing
 *     figure being the next band's printed base.
 *  4. **Electrical is two governments' fees**: the City's flat $25 as the base, the
 *     state board's job-cost bands as state surcharges, meeting at exactly $440.00.
 *  5. **Plumbing is a ladder, not a price list** — four bands on the total cost of job,
 *     prorated, closing at $20,000 and $100,000, with septic as its own row.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return bismarckSeed.feeRules
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

describe("Bismarck seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(bismarckSeed.state).toMatchObject({ code: "ND", slug: "north-dakota", fipsCode: "38" });
    expect(bismarckSeed.county).toMatchObject({ key: "burleigh-county", fipsCode: "38015" });
    expect(bismarckSeed.jurisdiction).toMatchObject({
      key: "bismarck",
      slug: "bismarck",
      officialName: "City of Bismarck",
      countyKey: "burleigh-county",
      timezone: "America/Chicago",
      isActive: true,
    });
  });

  it("shares the North Dakota state row rather than defining its own permit types", () => {
    expect(bismarckSeed.state.code).toBe("ND");
    expect(bismarckSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(bismarckSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(bismarckSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(6);
    expect(scheduleKeys.size).toBe(4);
    for (const entry of bismarckSeed.feeRules) {
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

    const ids = bismarckSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("splits the rules by permit type the way the schedules do", () => {
    // 14 building (8 shared ladder bands + the review fee + 5 trade rows), 4 electrical
    // (the City's permit, two NDSEB bands, the late certificate), 5 plumbing (4 ladder
    // bands + septic).
    expect(rulesFor("building")).toHaveLength(14);
    expect(rulesFor("electrical")).toHaveLength(4);
    expect(rulesFor("plumbing")).toHaveLength(5);
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(bismarckSeed.permitPages).toHaveLength(3);
    expect(
      bismarckSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of bismarckSeed.permitPages) {
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
        sourceCount: bismarckSeed.sources.length,
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
    // The route reads `lastVerifiedAt` from the verification records joined on the page
    // id, not `page.lastReviewedAt` — a page with no permit_page record 404s while every
    // content-level test above still passes. This asserts the join exists.
    for (const page of bismarckSeed.permitPages) {
      const record = bismarckSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Bismarck building permits — one ladder printed on both sheets", () => {
  it("charges both construction classes the identical ladder, differing only by the review fee", () => {
    // The sheets' tables are the same table — asserted by charging each class at several
    // valuations and requiring the ladder component to be the same number each time.
    const shared: Array<[number, number]> = [
      // valuation cents, ladder component
      [100_000, 4_925], // $1,000 → $40.00 + 500's share of $1.85/$100
      [2_500_000, 26_095], // $25,000 → the second seam
      [60_000_000, 226_845], // $600,000 → band 7
    ];

    for (const [valuationCents, ladder] of shared) {
      const residential: Omit<CalculationInput, "asOf"> = {
        workType: "alteration",
        valuationCents,
        custom: { one_two_family: true },
      };
      const commercial: Omit<CalculationInput, "asOf"> = {
        workType: "alteration",
        valuationCents,
        custom: { one_two_family: false },
      };

      const ladderAmountFor = (input: Omit<CalculationInput, "asOf">) => {
        const component = calculate("building", input).components.find((entry) =>
          entry.code.startsWith("BLD-LADDER-"),
        );
        return component?.amountCents;
      };

      expect(ladderAmountFor(residential), `$${valuationCents / 100} residential`).toBe(ladder);
      expect(ladderAmountFor(commercial), `$${valuationCents / 100} commercial`).toBe(ladder);

      // The one difference the sheets print: the review fee, commercial only.
      expect(amountFor("building", residential, "BLD-REVIEW-20")).toBeUndefined();
      expect(amountFor("building", commercial, "BLD-REVIEW-20")).toBe(ladder * 0.2);
    }
  });

  it("charges the review fee unconditionally on commercial — no plan-review fact exists", () => {
    // "A Review Fee of 20% of the permit fee will be added to all Commercial Building
    // Permits." The sentence conditions it on nothing, so the class is the only gate.
    const input: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: false },
    };
    const review = calculate("building", input).components.find(
      (component) => component.code === "BLD-REVIEW-20",
    );
    expect(review?.amountCents).toBe(9_109); // 20% of $455.45
    expect(review?.componentType).toBe("plan_review");
    expect(totalFor("building", input)).toBe(45_545 + 9_109);

    // And the residential sheet's silence: the fact cannot summon a review fee that was
    // never printed.
    const residential: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: true, plan_review: true },
    };
    expect(codesFor("building", residential).some((code) => code.includes("REVIEW"))).toBe(false);
  });

  it("walks the ladder's edges, prorating every fraction", () => {
    // No band prints "or fraction thereof" — the phrase Fargo's sheets carry and
    // Bismarck's never print — so every fraction is charged as the fraction it is.
    const edges: Array<[number, number]> = [
      [50_000, 4_000], // $500 → the flat first band
      [50_100, 4_002], // $501 → $40.00 plus one cent-and-a-half of the $1.85/$100 rate
      [150_000, 5_850], // $1,500 → $40.00 + ten whole $1.85 steps
      [200_000, 6_775], // $2,000 → $40 + 15 × $1.85, exactly band 3's printed base
      [250_000, 7_195], // $2,500 → $67.75 + $4.20 prorated (whole-thousand: $76.15)
      [2_500_000, 26_095], // $25,000 → $67.75 + 23 × $8.40, exactly band 4's base
      [5_000_000, 41_345], // $50,000 → $260.95 + 25 × $6.10, exactly band 5's base
      [10_000_000, 62_345], // $100,000 → $413.45 + 50 × $4.20, exactly band 6's base
      [50_000_000, 198_345], // $500,000 → $623.45 + 400 × $3.40, exactly band 7's base
      [100_000_000, 340_845], // $1,000,000 → $1,983.45 + 500 × $2.85, exactly band 8's base
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

  it("keeps the ladder out of demolition, where the trade sheet's flat row answers", () => {
    // The trade sheet prices demolition at its own $75 row, so the ladder bands exclude
    // demolition work even when a valuation is present — the same exclusion Fargo gets.
    const demolition: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      valuationCents: 6_000_000,
      custom: { one_two_family: true },
    };
    expect(codesFor("building", demolition)).toEqual(["BLD-DEMOLITION"]);
    expect(totalFor("building", demolition)).toBe(7_500);

    // The same valuation on construction work runs the ladder and no flat row.
    const alteration: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: true },
    };
    expect(codesFor("building", alteration).some((code) => code === "BLD-DEMOLITION")).toBe(false);
    expect(totalFor("building", alteration)).toBe(45_545); // $413.45 + 10 × $4.20 = $455.45
  });

  it("prices the trade sheet's building-shaped rows on their own facts", () => {
    const rows: Array<[Record<string, string | number | boolean>, string, number]> = [
      [{ house_moving: true }, "BLD-MOVING", 2_500],
      [{ manufactured_home: true }, "BLD-MANUFACTURED-HOME", 15_000],
      [{ home_occupation: true }, "BLD-HOME-OCCUPATION", 2_500],
      [{ temporary_use: true }, "BLD-TEMPORARY-USE", 5_000],
    ];

    for (const [custom, code, amount] of rows) {
      const input: Omit<CalculationInput, "asOf"> = { custom: { ...custom, one_two_family: true } };
      expect(totalFor("building", input), code).toBe(amount);
      expect(amountFor("building", input, code), code).toBe(amount);
      // Residential class: no review fee can join the total, because the residential
      // sheet prints none.
      expect(amountFor("building", input, "BLD-REVIEW-20")).toBeUndefined();
    }

    // Rows the job triggers add up beside the ladder, as the sheets' own totals add them.
    const combined: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 100_000,
      custom: { one_two_family: true, temporary_use: true },
    };
    expect(totalFor("building", combined)).toBe(4_925 + 5_000);
  });
});

describe("Bismarck electrical permits — two governments, one total", () => {
  it("charges the City's flat $25 on every permit, with no condition", () => {
    const bare: Omit<CalculationInput, "asOf"> = { custom: {} };
    expect(amountFor("electrical", bare, "ELEC-CITY-PERMIT")).toBe(2_500);

    const withJob: Omit<CalculationInput, "asOf"> = { valuationCents: 1_050_000, custom: {} };
    const city = calculate("electrical", withJob).components.find(
      (component) => component.code === "ELEC-CITY-PERMIT",
    );
    expect(city?.componentType).toBe("base");
    expect(amountFor("electrical", withJob, "ELEC-CITY-PERMIT")).toBe(2_500);
  });

  it("charges the board's bands as state fees, meeting at exactly $440.00", () => {
    const edges: Array<[number, number]> = [
      // valuation cents, total (the City's $25 is in every one of these)
      [10_000, 7_500], // $100 → the $50 minimum + $25
      [50_000, 7_500], // $500 → threshold exactly, balance nothing
      [1_050_000, 27_500], // $10,500 → $50 + 2% of $10,000 = $250, + $25
      [2_000_000, 46_500], // $20,000 → the formula closes at exactly $440.00
      [4_000_000, 48_500], // $40,000 → $440 + 1/10 of 1% of $20,000 = $460, + $25
    ];

    for (const [valuationCents, total] of edges) {
      const input: Omit<CalculationInput, "asOf"> = { valuationCents, custom: {} };
      expect(totalFor("electrical", input), `$${valuationCents / 100}`).toBe(total);
    }

    const atSeam = calculate("electrical", { valuationCents: 2_000_000, custom: {} }).components
      .find((component) => component.code === "ELEC-NDSEB-UP-TO-20000");
    expect(atSeam?.amountCents).toBe(44_000);
    expect(atSeam?.componentType).toBe("state_surcharge");
  });

  it("adds the late wiring certificate's $50 as its own state line", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      valuationCents: 1_050_000,
      custom: { late_certificate: true },
    };
    const late = calculate("electrical", input).components.find(
      (component) => component.code === "ELEC-NDSEB-LATE-CERTIFICATE",
    );
    expect(late?.amountCents).toBe(5_000);
    expect(late?.componentType).toBe("state_surcharge");
    expect(totalFor("electrical", input)).toBe(32_500);
  });

  it("asks for the valuation when a band needs it, instead of dropping out silently", () => {
    // The first band is gated as a negated greater-than precisely so a calculation with
    // no valuation still reaches the rule — the rule then fails on its basis and the
    // warning names the input the page must ask for.
    const result = calculate("electrical", { custom: {} });
    expect(result.warnings.join(" ")).toContain('"valuation"');
  });
});

describe("Bismarck plumbing permits — a ladder on job cost, prorated", () => {
  it("walks the four bands' edges, prorating every fraction", () => {
    const edges: Array<[number, number]> = [
      [200_000, 4_000], // $2,000 → the flat first band
      [250_000, 4_083], // $2,500 → $40.00 + $500's share of $1.65 (whole-$1,000: $41.65)
      [2_000_000, 6_970], // $20,000 → $40 + 18 × $1.65, exactly band 3's printed base
      [2_500_000, 7_520], // $25,000 → $69.70 + $500's share of $1.10
      [10_000_000, 15_770], // $100,000 → $69.70 + 80 × $1.10, exactly band 4's base
      [100_000_000, 69_770], // $1,000,000 → $157.70 + 900 × $0.60
    ];

    for (const [valuationCents, total] of edges) {
      expect(totalFor("plumbing", { valuationCents }), `$${valuationCents / 100}`).toBe(total);
    }
  });

  it("adds the septic row beside the ladder, on its own fact", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      valuationCents: 100_000,
      custom: { septic_drainfield: true },
    };
    expect(amountFor("plumbing", input, "PLUMB-SEPTIC-DRAINFIELD")).toBe(7_500);
    expect(totalFor("plumbing", input)).toBe(4_000 + 7_500); // band 1 + the row

    const without: Omit<CalculationInput, "asOf"> = { valuationCents: 100_000, custom: {} };
    expect(amountFor("plumbing", without, "PLUMB-SEPTIC-DRAINFIELD")).toBeUndefined();
  });
});

describe("Bismarck's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // Inputs and prose only, as everywhere: these totals are the arithmetic the page
    // performs when it renders, asserted against the amounts its own notes state.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 54_654], // $455.45 + $91.09
      ["electrical-permit-cost", "electrical", 27_500], // $25 + $250
      ["plumbing-permit-cost", "plumbing", 8_070], // $69.70 + $11.00
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = bismarckSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
