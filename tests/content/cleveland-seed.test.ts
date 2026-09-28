import { describe, expect, it } from "vitest";

import { clevelandSeed } from "@/content/cleveland";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Cleveland, Ohio — the data, and the arithmetic § 3105.25 prints.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The $1,000,000 seam meets from both sides.** $1,000,000 pays the lower tier
 *     in full ($12,000) and $1,000,001 pays the upper tier's $12,000 + $7 — the
 *     ordinance's "From $1,000,001.00 up" is a threshold, not a replacement rate.
 *  2. **The state surcharge is one class and not the other.** The ordinance says OBC
 *     fees "include the required surcharge" and requires the residential 1% to be
 *     "separately itemized" on permit and plan-examination fees — so the residential
 *     inputs must carry a state line and the OBC inputs must not, and the residential
 *     base must exclude zoning and late fees the paragraph does not name.
 *  3. **Every row rounds or floors in the schedule's own words.** "or fraction"
 *     rounds the basis up to a whole thousand; the published floors ($150, $30, $300,
 *     $50, $20) bind where the arithmetic falls short and release above it.
 *  4. **Electrical is one calculation path per permit** — the area row and the item
 *     rows are an either/or the schedule itself declares.
 *  5. **Plumbing prices counts and floors the permit**: six fixtures compute $48 and
 *     pay $50, and the potable row is the ordinance's $50, not the page's $13.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return clevelandSeed.feeRules
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

describe("Cleveland seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(clevelandSeed.state).toMatchObject({ code: "OH", slug: "ohio", fipsCode: "39" });
    expect(clevelandSeed.county).toMatchObject({ key: "cuyahoga-county", fipsCode: "39035" });
    expect(clevelandSeed.jurisdiction).toMatchObject({
      key: "cleveland",
      slug: "cleveland",
      officialName: "City of Cleveland",
      countyKey: "cuyahoga-county",
      timezone: "America/New_York",
      isActive: true,
      permitPortalUrl: "https://coc-prod-publicportal.accela.com",
    });
  });

  it("shares the Ohio state row rather than defining its own permit types", () => {
    expect(clevelandSeed.state.code).toBe("OH");
    expect(clevelandSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(clevelandSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(clevelandSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(3);
    expect(scheduleKeys.size).toBe(2);
    // Both of the City's own publications are primary, so the gate's primary-source
    // requirement does not rest on the department contact page.
    expect(clevelandSeed.sources.filter((source) => source.isPrimary)).toHaveLength(2);
    // RC 3781.10 could not be fetched and is therefore cited in prose, never as a source.
    expect([...sourceKeys].some((key) => key.includes("3781"))).toBe(false);

    for (const entry of clevelandSeed.feeRules) {
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

    const ids = clevelandSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(clevelandSeed.permitPages).toHaveLength(3);
    expect(
      clevelandSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of clevelandSeed.permitPages) {
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
        sourceCount: clevelandSeed.sources.length,
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
    for (const page of clevelandSeed.permitPages) {
      const record = clevelandSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Cleveland building permits — four rows, one seam", () => {
  it("meets the $1,000,000 seam from both sides", () => {
    const atSeam = amountFor(
      "building",
      {
        valuationCents: 100_000_000,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { one_two_family: false },
      },
      "BLD-OBC-NEW-BELOW",
    );
    expect(atSeam).toBe(1_200_000); // 1,000 × $12 — the lower tier in full

    const aboveSeam = amountFor(
      "building",
      {
        valuationCents: 100_000_001,
        occupancy: "commercial",
        workType: "new_construction",
        custom: { one_two_family: false },
      },
      "BLD-OBC-NEW-ABOVE",
    );
    expect(aboveSeam).toBe(1_200_700); // $12,000 + one whole thousand at $7

    // The lower tier does not answer a dollar above the seam, ever.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 100_000_001,
          occupancy: "commercial",
          workType: "new_construction",
          custom: { one_two_family: false },
        },
        "BLD-OBC-NEW-BELOW",
      ),
    ).toBeUndefined();
  });

  it("answers with exactly one class's rows for every class-sensitive input", () => {
    const inputs: Array<Omit<CalculationInput, "asOf">> = [
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: true } },
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: false } },
      { workType: "alteration", valuationCents: 6_000_000, custom: {} },
      { workType: "new_construction", valuationCents: 200_000_000, custom: { one_two_family: true } },
      { workType: "demolition", squareFootage: 4_000, custom: { one_two_family: true } },
      { workType: "demolition", squareFootage: 4_000, custom: { one_two_family: false } },
      { workType: "repair", valuationCents: 1_000_000, custom: { one_two_family: false } },
    ];

    for (const input of inputs) {
      const baseCodes = calculate("building", input).components
        .filter((component) => component.componentType === "base")
        .map((component) => component.code);
      const residential = baseCodes.filter((code) => code.includes("-RES-"));
      const obc = baseCodes.filter((code) => code.includes("-OBC-"));
      expect(
        residential.length === 0 || obc.length === 0,
        `both classes answered for ${JSON.stringify(input)}: ${baseCodes.join(", ")}`,
      ).toBe(true);
    }
  });

  it("rounds the cost up to a whole $1,000 — \"or fraction\" — on every valuation row", () => {
    // $50,500 is 51 whole thousands at $10 each; a prorated reading would be $505.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 5_050_000,
          occupancy: "residential",
          workType: "new_construction",
          custom: { one_two_family: true },
        },
        "BLD-RES-NEW",
      ),
    ).toBe(51_000);

    // The OBC alteration row rounds the same way, at its own rate: $15 per $1,000.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 5_050_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false },
        },
        "BLD-OBC-ALTER-BELOW",
      ),
    ).toBe(76_500); // 51 × $15
  });

  it("holds every published floor and releases above it", () => {
    const floors: Array<[Omit<CalculationInput, "asOf">, string, number]> = [
      // Residential alteration: $2,000 computes $10 and pays the $30 floor.
      [
        { valuationCents: 200_000, occupancy: "residential", workType: "alteration", custom: { one_two_family: true } },
        "BLD-RES-ALTER",
        3_000,
      ],
      // OBC new under the floor: $10,000 computes $120 and pays $300.
      [
        { valuationCents: 1_000_000, occupancy: "commercial", workType: "new_construction", custom: { one_two_family: false } },
        "BLD-OBC-NEW-BELOW",
        30_000,
      ],
      // OBC alteration: $2,000 computes $30 and pays $150.
      [
        { valuationCents: 200_000, occupancy: "commercial", workType: "alteration", custom: { one_two_family: false } },
        "BLD-OBC-ALTER-BELOW",
        15_000,
      ],
      // OBC demolition of 12,300 sq ft computes 13 × $15 = $195 and pays the $300 floor.
      [
        { squareFootage: 12_300, occupancy: "commercial", workType: "demolition", custom: { one_two_family: false } },
        "BLD-DEMO-OBC",
        30_000,
      ],
    ];

    for (const [input, code, expected] of floors) {
      expect(amountFor("building", input, code), code).toBe(expected);
    }

    // …and a floor that has stopped binding: $50,000 of OBC alteration is $750.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 5_000_000,
          occupancy: "commercial",
          workType: "alteration",
          custom: { one_two_family: false },
        },
        "BLD-OBC-ALTER-BELOW",
      ),
    ).toBe(75_000);
  });

  it("prices demolition on floor area, rounding each partial thousand up", () => {
    // 10,500 sq ft is eleven thousands at $10 for a house, above the $50 floor.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_500,
          occupancy: "residential",
          workType: "demolition",
          custom: { one_two_family: true },
        },
        "BLD-DEMO-RES",
      ),
    ).toBe(11_000);

    // …and the OBC demolition row measures the same area at its own rate — 24,500 sq ft
    // is 25 whole thousands at $15, above the $300 floor that bound at 10,500.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 24_500,
          occupancy: "commercial",
          workType: "demolition",
          custom: { one_two_family: false },
        },
        "BLD-DEMO-OBC",
      ),
    ).toBe(37_500); // 25 × $15

    // At 10,500 sq ft the arithmetic is $165 and the $300 floor is what is paid.
    expect(
      amountFor(
        "building",
        {
          squareFootage: 10_500,
          occupancy: "commercial",
          workType: "demolition",
          custom: { one_two_family: false },
        },
        "BLD-DEMO-OBC",
      ),
    ).toBe(30_000);
  });

  it("charges plan examination per thousand with its floor, and never twice", () => {
    const withArea = {
      valuationCents: 2_000_000,
      squareFootage: 1_500,
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false, plan_review: true },
    } as const;

    expect(amountFor("building", withArea, "BLD-PLAN-EXAM-AREA")).toBe(4_000); // 2 × $20
    expect(amountFor("building", withArea, "BLD-PLAN-EXAM-FLAT")).toBeUndefined();

    // No floor area (parking lot, sign, roof): the $20 floor is the fee itself.
    const withoutArea = {
      valuationCents: 2_000_000,
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false, plan_review: true },
    } as const;
    expect(amountFor("building", withoutArea, "BLD-PLAN-EXAM-FLAT")).toBe(2_000);
    expect(amountFor("building", withoutArea, "BLD-PLAN-EXAM-AREA")).toBeUndefined();

    // Under a thousand square feet still costs one whole unit of $20.
    expect(
      amountFor(
        "building",
        { ...withArea, squareFootage: 500 },
        "BLD-PLAN-EXAM-AREA",
      ),
    ).toBe(2_000);

    // And without the plan-review flag, neither row answers.
    expect(
      amountFor(
        "building",
        { ...withArea, custom: { one_two_family: false } },
        "BLD-PLAN-EXAM-AREA",
      ),
    ).toBeUndefined();
  });

  it("itemises the 1% on residential work and adds no line at all on OBC work", () => {
    const residential = {
      valuationCents: 5_000_000,
      squareFootage: 800,
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true, plan_review: true },
    } as const;

    const stateLine = amountFor("building", residential, "BLD-STATE-SURCHARGE-1PCT");
    expect(stateLine).toBe(520); // 1% of $500 permit + $20 plan exam

    // The OBC counterpart of the same inputs carries no state line — the ordinance
    // says its fees "include the required surcharge".
    const obc = {
      valuationCents: 5_000_000,
      squareFootage: 800,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, plan_review: true },
    } as const;
    expect(amountFor("building", obc, "BLD-STATE-SURCHARGE-1PCT")).toBeUndefined();
    expect(codesFor("building", obc).some((code) => code.includes("STATE-SURCHARGE"))).toBe(false);
  });

  it("sur-charges permit and plan examination only — zoning sits outside the base", () => {
    // The paragraph names "permit and plan examination fees"; the zoning line is
    // added by a different division. $500 permit + $20 plan exam → 1% is $5.20,
    // not 1% of the $150 zoning too.
    expect(
      amountFor(
        "building",
        {
          valuationCents: 5_000_000,
          squareFootage: 800,
          occupancy: "residential",
          workType: "new_construction",
          custom: { one_two_family: true, plan_review: true, zoning_residential: true },
        },
        "BLD-STATE-SURCHARGE-1PCT",
      ),
    ).toBe(520);
    expect(
      amountFor(
        "building",
        {
          valuationCents: 5_000_000,
          squareFootage: 800,
          occupancy: "residential",
          workType: "new_construction",
          custom: { one_two_family: true, plan_review: true, zoning_residential: true },
        },
        "BLD-ZONING-RESIDENTIAL",
      ),
    ).toBe(2_000);
  });

  it("prices the late-fee tiers on the required permit fee, outside the surcharge base", () => {
    const within72 = {
      valuationCents: 5_000_000,
      occupancy: "residential",
      workType: "new_construction",
      custom: { one_two_family: true, work_started: "within_72h" },
    } as const;
    expect(amountFor("building", within72, "BLD-LATE-72")).toBe(22_500); // $100 + 25% × $500
    // The 1% reads the $500 permit, not the $225 penalty stacked on it.
    expect(amountFor("building", within72, "BLD-STATE-SURCHARGE-1PCT")).toBe(500);

    const after72 = { ...within72, custom: { one_two_family: true, work_started: "after_72h" } } as const;
    expect(amountFor("building", after72, "BLD-LATE-AFTER-72")).toBe(32_500); // $200 + 25% × $500
    expect(amountFor("building", after72, "BLD-LATE-72")).toBeUndefined();
  });

  it("adds the misc rows beside the ladder, each by its own fact", () => {
    const base = {
      valuationCents: 1_000_000,
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true },
    } as const;

    expect(
      amountFor("building", { ...base, custom: { ...base.custom, accessory_structure: true } }, "BLD-MISC-ACCESSORY"),
    ).toBe(5_000);
    expect(
      amountFor("building", { ...base, custom: { ...base.custom, pool: true } }, "BLD-MISC-POOL"),
    ).toBe(5_000);
    // Residential fence is flat; commercial fence is $15 per $1,000 with a $150 floor.
    expect(
      amountFor("building", { ...base, custom: { ...base.custom, fence: true } }, "BLD-MISC-FENCE-RES"),
    ).toBe(5_000);
    expect(
      amountFor(
        "building",
        { valuationCents: 5_000_000, occupancy: "commercial", workType: "alteration", custom: { one_two_family: false, fence: true } },
        "BLD-MISC-FENCE-COM",
      ),
    ).toBe(75_000);
    // The tent row needs an area over 120 sq ft; at or under, no fee answers (free).
    expect(
      amountFor("building", { ...base, squareFootage: 300, custom: { ...base.custom, tent: true } }, "BLD-TENT"),
    ).toBe(7_500);
    expect(
      amountFor("building", { ...base, squareFootage: 100, custom: { ...base.custom, tent: true } }, "BLD-TENT"),
    ).toBeUndefined();
  });

  it("keeps the festival trio out of the standard plan-exam rows", () => {
    const festival = {
      occupancy: "residential",
      workType: "other",
      custom: { one_two_family: true, festival: true },
    } as const;

    expect(amountFor("building", festival, "BLD-FESTIVAL-PLAN")).toBe(2_000);
    expect(amountFor("building", festival, "BLD-FESTIVAL-USE")).toBe(2_000);
    expect(amountFor("building", festival, "BLD-FESTIVAL-TENT")).toBe(2_500);
    expect(amountFor("building", festival, "BLD-PLAN-EXAM-AREA")).toBeUndefined();
    expect(amountFor("building", festival, "BLD-PLAN-EXAM-FLAT")).toBeUndefined();
  });
});

describe("Cleveland electrical permits — one path per permit", () => {
  it("never answers the area row and an item row together", () => {
    const areaOnly = {
      squareFootage: 6_000,
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("electrical", areaOnly, "ELEC-AREA")).toBe(30_000);
    expect(codesFor("electrical", areaOnly).some((code) => code.startsWith("ELEC-SIGN") || code === "ELEC-REPAIR" || code === "ELEC-TEMP-POWER")).toBe(false);

    const withSigns = { ...areaOnly, custom: { one_two_family: true, signs: 3 } } as const;
    expect(amountFor("electrical", withSigns, "ELEC-SIGNS")).toBe(11_000);
    expect(amountFor("electrical", withSigns, "ELEC-AREA")).toBeUndefined();

    // And the area row rounds each partial thousand up: 6,400 sq ft is seven units.
    expect(
      amountFor("electrical", { ...areaOnly, squareFootage: 6_400 }, "ELEC-AREA"),
    ).toBe(35_000);
  });

  it("prices signs as one row with the first sign inside its base", () => {
    expect(
      amountFor(
        "electrical",
        { occupancy: "commercial", workType: "repair", custom: { one_two_family: false, signs: 1 } },
        "ELEC-SIGNS",
      ),
    ).toBe(5_000);
    expect(
      amountFor(
        "electrical",
        { occupancy: "commercial", workType: "repair", custom: { one_two_family: false, signs: 4 } },
        "ELEC-SIGNS",
      ),
    ).toBe(14_000); // $50 + 3 × $30
  });

  it("holds the $50 permit floor without inflating anything above it", () => {
    const repair = {
      occupancy: "commercial",
      workType: "repair",
      custom: { one_two_family: false, elec_repair: true },
    } as const;
    expect(amountFor("electrical", repair, "ELEC-REPAIR")).toBe(5_000);
    expect(amountFor("electrical", repair, "ELEC-MIN")).toBe(0);

    const blanket = { ...repair, custom: { one_two_family: false, blanket_permit: true } } as const;
    expect(amountFor("electrical", blanket, "ELEC-BLANKET")).toBe(20_000);
    expect(amountFor("electrical", blanket, "ELEC-MIN")).toBe(0);
  });

  it("sur-charges a residential electrical permit and not an OBC one", () => {
    expect(
      amountFor(
        "electrical",
        { squareFootage: 6_000, occupancy: "residential", workType: "alteration", custom: { one_two_family: true } },
        "ELEC-STATE-SURCHARGE-1PCT",
      ),
    ).toBe(300); // 1% of $300
    expect(
      codesFor(
        "electrical",
        { squareFootage: 6_000, occupancy: "commercial", workType: "alteration", custom: { one_two_family: false } },
      ).some((code) => code.includes("STATE-SURCHARGE")),
    ).toBe(false);
  });

  it("prices nothing from a valuation — electrical reads area and signs", () => {
    const cheap = {
      squareFootage: 6_000,
      occupancy: "residential",
      workType: "alteration",
      valuationCents: 1,
      custom: { one_two_family: true },
    } as const;
    const rich = { ...cheap, valuationCents: 900_000_000 } as const;
    expect(totalFor("electrical", cheap)).toBe(totalFor("electrical", rich));
  });
});

describe("Cleveland plumbing permits — counts, a floor, and one contested row", () => {
  it("floors the permit at $50 and charges the shortfall only below it", () => {
    const six = {
      fixtures: 6,
      occupancy: "residential",
      workType: "alteration",
      custom: { one_two_family: true },
    } as const;
    expect(amountFor("plumbing", six, "PLUMB-FIXTURES")).toBe(4_800);
    expect(amountFor("plumbing", six, "PLUMB-MIN")).toBe(200); // the $2.00 shortfall

    const seven = { ...six, fixtures: 7 } as const;
    expect(amountFor("plumbing", seven, "PLUMB-FIXTURES")).toBe(5_600);
    expect(amountFor("plumbing", seven, "PLUMB-MIN")).toBe(0);
  });

  it("prices pipe in whole 100-foot segments", () => {
    const pipe = (feet: number) =>
      amountFor(
        "plumbing",
        { occupancy: "commercial", workType: "repair", custom: { one_two_family: false, pipe_gas: true, linear_feet: feet } },
        "PLUMB-PIPE-GAS",
      );

    expect(pipe(100)).toBe(1_300); // one segment
    expect(pipe(101)).toBe(2_600); // two segments — "or fraction"
    expect(pipe(250)).toBe(3_900); // three segments
  });

  it("charges the ordinance's $50 potable row, not the department page's $13", () => {
    const potable = clevelandSeed.feeRules.find(
      (entry) => entry.rule.code === "PLUMB-POTABLE",
    )?.rule;
    expect(potable?.sourceId).toBe("cleveland-code-3105-25-permit-fees");
    expect(
      amountFor(
        "plumbing",
        { occupancy: "commercial", workType: "repair", custom: { one_two_family: false, potable_connection: true } },
        "PLUMB-POTABLE",
      ),
    ).toBe(5_000);
    expect(describesTheRecordedConflict(potable)).toBe(true);
  });

  it("sums the schedule's groups — fixtures beside one pipe run", () => {
    const both = {
      fixtures: 4,
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false, pipe_water: true, linear_feet: 150 },
    } as const;
    expect(amountFor("plumbing", both, "PLUMB-FIXTURES")).toBe(3_200);
    expect(amountFor("plumbing", both, "PLUMB-PIPE-WATER")).toBe(2_600);
    expect(totalFor("plumbing", both)).toBe(5_800);
  });

  it("prices nothing from a valuation — plumbing reads fixtures and feet", () => {
    const cheap = {
      fixtures: 7,
      occupancy: "commercial",
      workType: "alteration",
      valuationCents: 1,
      custom: { one_two_family: false },
    } as const;
    const rich = { ...cheap, valuationCents: 900_000_000 } as const;
    expect(totalFor("plumbing", cheap)).toBe(totalFor("plumbing", rich));
  });
});

/** The potable row's description must carry the recorded conflict, not hide it. */
function describesTheRecordedConflict(rule: { description: string | null } | undefined): boolean {
  return (rule?.description ?? "").includes("$13.00");
}

describe("Cleveland's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 781_000], // $7,500 + $160 + $150
      ["electrical-permit-cost", "electrical", 30_300], // $300 + 1% = $3.00
      ["plumbing-permit-cost", "plumbing", 5_050], // $48 floored to $50 + 1% = $0.50
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = clevelandSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
