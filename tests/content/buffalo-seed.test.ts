import { describe, expect, it } from "vitest";

import { buffaloSeed } from "@/content/buffalo";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Buffalo, New York — the data, and the arithmetic the Department's sheets print.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **Two sheets, one switch, never both.** The residential and commercial building
 *     sheets are different schedules split on `custom.one_two_family`, and the
 *     exclusivity assertions run every class-sensitive input through both prefixes.
 *  2. **The commercial sheet's own worked examples reproduce to the cent.** Example 1
 *     ($3,741,600 → $32,792.50) and Example 2 ($945,496 → $8,377.50) are the City's own
 *     arithmetic — the strongest check this jurisdiction has, and the reason the
 *     round-up reading of "$0.75 / $8 per $1,000 … or portion thereof" is pinned.
 *  3. **The residential row prorates and the commercial rows round up**, each in the
 *     sheet's own words: $12,001 of residential cost is $60.01 (a whole-thousand
 *     reading would be $60.00), and the $50 / $75 / $100 floors are asserted where
 *     they bind.
 *  4. **The electrical regimes are an either/or the schedule itself declares**, and
 *     Schedule B's multiplier table is asserted product by product — with I-2, I-3
 *     and I-4, whose rows print no multiplier, priced by nothing at all.
 *  5. **Plumbing prices counts, never costs**: the declared valuation changes no
 *     total, fixtures split by class, underground pipe runs in whole 100-foot
 *     segments past the flat first hundred.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return buffaloSeed.feeRules
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

describe("Buffalo seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(buffaloSeed.state).toMatchObject({ code: "NY", slug: "new-york", fipsCode: "36" });
    expect(buffaloSeed.county).toMatchObject({ key: "erie-county", fipsCode: "36029" });
    expect(buffaloSeed.jurisdiction).toMatchObject({
      key: "buffalo",
      slug: "buffalo",
      officialName: "City of Buffalo",
      countyKey: "erie-county",
      timezone: "America/New_York",
      isActive: true,
    });
  });

  it("shares the New York state row rather than defining its own permit types", () => {
    expect(buffaloSeed.state.code).toBe("NY");
    expect(buffaloSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(buffaloSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(buffaloSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(7);
    expect(scheduleKeys.size).toBe(4);
    for (const entry of buffaloSeed.feeRules) {
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

    const ids = buffaloSeed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it("publishes three pages that clear the editorial gate", () => {
    expect(buffaloSeed.permitPages).toHaveLength(3);
    expect(
      buffaloSeed.permitPages.map((page) => page.slug).sort(),
    ).toEqual(["building-permit-cost", "electrical-permit-cost", "plumbing-permit-cost"]);

    for (const page of buffaloSeed.permitPages) {
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
        sourceCount: buffaloSeed.sources.length,
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
    for (const page of buffaloSeed.permitPages) {
      const record = buffaloSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Buffalo building permits — two sheets, one switch", () => {
  it("charges exactly one sheet's rows for any input, never a mix", () => {
    const classSensitive: Array<Omit<CalculationInput, "asOf">> = [
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: true } },
      { workType: "alteration", valuationCents: 6_000_000, custom: { one_two_family: false } },
      { workType: "alteration", valuationCents: 6_000_000, custom: {} },
      { workType: "new_construction", squareFootage: 2_400, custom: { one_two_family: true } },
      { workType: "demolition", squareFootage: 4_000, custom: { one_two_family: false } },
      { workType: "demolition", custom: { one_two_family: true } },
      {
        workType: "alteration",
        valuationCents: 1_000_000,
        custom: { one_two_family: false, change_of_use: true },
      },
    ];

    for (const input of classSensitive) {
      const baseCodes = calculate("building", input).components
        .filter((component) => component.componentType === "base")
        .map((component) => component.code);
      const residential = baseCodes.filter((code) => code.startsWith("BLD-RES-"));
      const commercial = baseCodes.filter((code) => code.startsWith("BLD-COM-"));
      expect(
        residential.length === 0 || commercial.length === 0,
        `both sheets answered for ${JSON.stringify(input)}: ${baseCodes.join(", ")}`,
      ).toBe(true);
    }
  });

  it("reproduces the commercial sheet's own Example 1, cent for cent", () => {
    // Page 3 of the sheet: $3,741,600 of mean cost, rounded to $3,742,000 before it is
    // multiplied — $50.00 + $2,806.50 + $29,936.00 = $32,792.50.
    const result = calculate("building", {
      valuationCents: 374_160_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, plan_review: true },
    });

    expect(amountFor("building", {
      valuationCents: 374_160_000,
      occupancy: "commercial",
      workType: "new_construction",
      custom: { one_two_family: false, plan_review: true },
    }, "BLD-COM-APPLICATION")).toBe(5_000);
    expect(
      result.components.find((component) => component.code === "BLD-COM-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(280_650); // 3,742 × $0.75
    expect(
      result.components.find((component) => component.code === "BLD-COM-PERMIT")?.amountCents,
    ).toBe(2_993_600); // 3,742 × $8.00
    expect(result.totalCents).toBe(3_279_250); // $32,792.50
  });

  it("reproduces the commercial sheet's own Example 2, cent for cent", () => {
    // Page 4: $945,496 of mean cost with an occupancy change — $50.00 + $709.50 +
    // $7,568.00 + $50.00 use permit = $8,377.50.
    const result = calculate("building", {
      valuationCents: 94_549_600,
      occupancy: "commercial",
      workType: "alteration",
      custom: { one_two_family: false, plan_review: true, change_of_use: true },
    });

    expect(
      result.components.find((component) => component.code === "BLD-COM-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(70_950); // 946 × $0.75
    expect(
      result.components.find((component) => component.code === "BLD-COM-PERMIT")?.amountCents,
    ).toBe(756_800); // 946 × $8.00
    expect(result.totalCents).toBe(837_750); // $8,377.50
  });

  it("holds the commercial floors: $75 of plan review and $100 of permit at $1,000 of cost", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      valuationCents: 100_000,
      workType: "alteration",
      custom: { one_two_family: false, plan_review: true },
    };
    expect(amountFor("building", input, "BLD-COM-PLAN-REVIEW")).toBe(7_500);
    expect(amountFor("building", input, "BLD-COM-PERMIT")).toBe(10_000);
    expect(totalFor("building", input)).toBe(22_500); // $50 + $75 + $100

    // Without plans the review line is not charged at all — the gate is the sheet's
    // own "(if work requires plans)".
    const noPlans = { ...input, custom: { one_two_family: false } };
    expect(amountFor("building", noPlans, "BLD-COM-PLAN-REVIEW")).toBeUndefined();
    expect(totalFor("building", noPlans)).toBe(15_000);
  });

  it("bands a new one-family dwelling by floor area at the sheet's four edges", () => {
    const bands: Array<[number, number]> = [
      // square feet, permit fee component
      [1_000, 50_000],
      [1_001, 60_000],
      [3_000, 60_000],
      [3_001, 75_000],
      [5_000, 75_000],
      [5_001, 90_000],
    ];

    for (const [squareFootage, fee] of bands) {
      const input: Omit<CalculationInput, "asOf"> = {
        workType: "new_construction",
        squareFootage,
        custom: { one_two_family: true },
      };
      expect(amountFor("building", input, "BLD-RES-APPLICATION"), `${squareFootage} sq ft`).toBe(
        2_500,
      );
      const bandCode = codesFor("building", input).find((code) =>
        code.startsWith("BLD-RES-NEW-1F"),
      );
      expect(amountFor("building", input, bandCode ?? ""), `${squareFootage} sq ft band`).toBe(
        fee,
      );
    }
  });

  it("prices a two-family flat and a townhouse per unit, and neither band answers either", () => {
    const twoFamily: Omit<CalculationInput, "asOf"> = {
      workType: "new_construction",
      units: 2,
      squareFootage: 1_800,
      custom: { one_two_family: true },
    };
    expect(amountFor("building", twoFamily, "BLD-RES-NEW-2F")).toBe(100_000);
    expect(codesFor("building", twoFamily).some((code) => code.startsWith("BLD-RES-NEW-1F"))).toBe(
      false,
    );

    const townhouse: Omit<CalculationInput, "asOf"> = {
      workType: "new_construction",
      units: 3,
      squareFootage: 3_600,
      custom: { one_two_family: true, townhouse: true },
    };
    expect(amountFor("building", townhouse, "BLD-RES-NEW-TOWNHOUSE")).toBe(150_000); // 3 × $500
    expect(codesFor("building", townhouse).some((code) => code.startsWith("BLD-RES-NEW-1F"))).toBe(
      false,
    );
    expect(amountFor("building", townhouse, "BLD-RES-NEW-2F")).toBeUndefined();
  });

  it("prorates the residential $5 row and floors it at $50 — the sheet prints no round-up", () => {
    // $12,001 → $60.01: a whole-$1,000 reading would be $60.00, which is the whole
    // point of the reading — the commercial rows round and this one does not.
    const mid: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 1_200_100,
      custom: { one_two_family: true },
    };
    expect(amountFor("building", mid, "BLD-RES-COST")).toBe(6_001);
    expect(totalFor("building", mid)).toBe(8_501); // + $25 application

    // The floor binds at $10,000 and below, and releases one cent above it.
    const atFloor: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 1_000_000,
      custom: { one_two_family: true },
    };
    expect(amountFor("building", atFloor, "BLD-RES-COST")).toBe(5_000);
    expect(
      amountFor(
        "building",
        { ...atFloor, valuationCents: 1_000_100 },
        "BLD-RES-COST",
      ),
    ).toBe(5_001);
    expect(
      amountFor(
        "building",
        { ...atFloor, valuationCents: 200_100 },
        "BLD-RES-COST",
      ),
    ).toBe(5_000); // $2,001 computes $10.01 and the floor takes it to $50.00
  });

  it("takes 20% of the permit fee for residential plan review, without the application in the basis", () => {
    // $60,000 of cost → $300.00 permit fee → 20% is $60.00, above the $25 floor. If the
    // $25 application had been folded into the base the answer would be $65.00.
    const larger: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: true, plan_review: true },
    };
    expect(amountFor("building", larger, "BLD-RES-COST")).toBe(30_000);
    expect(amountFor("building", larger, "BLD-RES-PLAN-REVIEW")).toBe(6_000);
    expect(totalFor("building", larger)).toBe(38_500);

    // $20,000 of cost → 20% of $100.00 is $20.00, below the floor, so $25.00 is paid.
    const smaller: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 2_000_000,
      custom: { one_two_family: true, plan_review: true },
    };
    expect(amountFor("building", smaller, "BLD-RES-PLAN-REVIEW")).toBe(2_500);
    expect(totalFor("building", smaller)).toBe(15_000);
  });

  it("adds the residential flat fees beside the permit fee, as the sheet's total does", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      workType: "alteration",
      valuationCents: 6_000_000,
      custom: { one_two_family: true, chimney: true, fence: true },
    };
    expect(amountFor("building", input, "BLD-RES-CHIMNEY")).toBe(2_500);
    expect(amountFor("building", input, "BLD-RES-FENCE")).toBe(2_500);
    // $300.00 permit + $25 application + the two flat rows — each added beside the
    // permit, as the sheet's own total adds them.
    expect(totalFor("building", input)).toBe(30_000 + 2_500 + 2_500 + 2_500);
  });

  it("prices demolition by the row each sheet prints, and the penalty as a surcharge", () => {
    const dwelling: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      custom: { one_two_family: true },
    };
    expect(totalFor("building", dwelling)).toBe(30_000 + 2_500);

    const accessory: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      custom: { one_two_family: true, accessory_structure: true },
    };
    expect(totalFor("building", accessory)).toBe(7_500 + 2_500);

    // Commercial: $0.12 per sq. ft. with a $500 floor — 4,000 sq. ft. computes $480 and
    // pays $500; 5,000 computes $600 and pays it.
    const small: Omit<CalculationInput, "asOf"> = {
      workType: "demolition",
      squareFootage: 4_000,
      custom: { one_two_family: false },
    };
    expect(amountFor("building", small, "BLD-COM-DEMO-AREA")).toBe(50_000);
    expect(totalFor("building", { ...small, squareFootage: 5_000 })).toBe(60_000 + 5_000);
    expect(amountFor("building", small, "BLD-COM-PERMIT")).toBeUndefined(); // the sheet prices demolition elsewhere

    // The $1,500 no-permit penalty is a surcharge on top, not a fifth fee line.
    const unpermitted = { ...small, custom: { one_two_family: false, unpermitted_work: true } };
    const penalty = calculate("building", unpermitted).components.find(
      (component) => component.code === "BLD-COM-DEMO-NO-PERMIT",
    );
    expect(penalty?.amountCents).toBe(150_000);
    expect(penalty?.componentType).toBe("surcharge");
    expect(totalFor("building", unpermitted)).toBe(5_000 + 50_000 + 150_000);
  });
});

describe("Buffalo electrical permits — two regimes the schedule itself splits", () => {
  it("charges one flat row beside the application, whichever job fact answers", () => {
    const rows: Array<[Record<string, string | number | boolean>, string, number]> = [
      [{ elec_one_family: true }, "ELEC-FLAT-ONE-FAMILY", 5_000],
      [{ elec_two_family_both: true }, "ELEC-FLAT-TWO-FAMILY-BOTH", 7_500],
      [{ meter_release: true }, "ELEC-FLAT-METER-RELEASE", 5_000],
      [{ low_voltage_system: true }, "ELEC-FLAT-LOW-VOLTAGE", 7_500],
      [{ elec_site_work: true }, "ELEC-FLAT-SITE-WORK", 7_500],
    ];

    for (const [custom, code, amount] of rows) {
      const input: Omit<CalculationInput, "asOf"> = { custom };
      const flatCodes = codesFor("electrical", input).filter((c) => c.startsWith("ELEC-FLAT-"));
      expect(flatCodes, code).toEqual([code]);
      expect(amountFor("electrical", input, code), code).toBe(amount);
      expect(amountFor("electrical", input, "ELEC-APPLICATION"), code).toBe(5_000);
      // "APPLICATION FEE of $50 PLUS one of the following" — and never Schedule A's rows.
      expect(codesFor("electrical", input).some((c) => c.startsWith("ELEC-AREA-"))).toBe(false);
    }
  });

  it("keeps the regimes apart by the schedule's own either/or", () => {
    const withPlans: Omit<CalculationInput, "asOf"> = {
      squareFootage: 5_000,
      custom: { plans_required: true, elec_occupancy: "R-2", elec_one_family: true },
    };
    expect(codesFor("electrical", withPlans).some((code) => code.startsWith("ELEC-FLAT-"))).toBe(
      false,
    );

    const withoutPlans: Omit<CalculationInput, "asOf"> = {
      squareFootage: 5_000,
      custom: { elec_occupancy: "R-2", elec_one_family: true },
    };
    expect(codesFor("electrical", withoutPlans).some((code) => code.startsWith("ELEC-AREA-"))).toBe(
      false,
    );
  });

  it("computes Schedule A's rows as the schedule's constant times Schedule B's multiplier", () => {
    // 20,000 sq. ft., every occupancy the table prints a multiplier for, asserted on the
    // permit row: 0.0275 × SF × multiplier in dollars (2.75 × multiplier cents per sq ft).
    const products: Array<[string, number]> = [
      ["A-1", 82_500], // 4.125 ¢/sf — 1.5
      ["A-5", 82_500],
      ["E", 82_500],
      ["B", 55_000], // 2.75 ¢/sf — 1
      ["F-1", 55_000],
      ["M", 55_000],
      ["H-3", 123_750], // 6.1875 ¢/sf — 2.25
      ["I-1", 96_250], // 4.8125 ¢/sf — 1.75
      ["R-1", 70_400], // 3.52 ¢/sf — 1.28
      ["R-2", 70_400],
      ["R-3", 27_500], // 1.375 ¢/sf — 0.5
      ["R-4", 73_700], // 3.685 ¢/sf — 1.34
      ["S-1", 38_500], // 1.925 ¢/sf — 0.7
      ["S-2", 38_500],
      ["U", 46_750], // 2.3375 ¢/sf — 0.85
    ];

    for (const [occupancy, permitCents] of products) {
      const input: Omit<CalculationInput, "asOf"> = {
        squareFootage: 20_000,
        custom: { plans_required: true, elec_occupancy: occupancy },
      };
      expect(
        amountFor("electrical", input, "ELEC-AREA-PERMIT-INSPECTION"),
        occupancy,
      ).toBe(permitCents);
    }
  });

  it("floors both area charges at $50 and lets the floor release", () => {
    // 5,000 sq. ft. of R-2: plan review computes $16.00 (floor to $50.00) and permit and
    // inspection computes $176.00 (above its floor).
    const input: Omit<CalculationInput, "asOf"> = {
      squareFootage: 5_000,
      custom: { plans_required: true, elec_occupancy: "R-2" },
    };
    expect(amountFor("electrical", input, "ELEC-AREA-PLAN-REVIEW")).toBe(5_000);
    expect(amountFor("electrical", input, "ELEC-AREA-PERMIT-INSPECTION")).toBe(17_600);
    expect(totalFor("electrical", input)).toBe(27_600); // $50 + $50 + $176.00

    // At 20,000 sq. ft. the plan review computes $64.00 and the floor stops binding.
    const larger = { ...input, squareFootage: 20_000 };
    expect(amountFor("electrical", larger, "ELEC-AREA-PLAN-REVIEW")).toBe(6_400);
  });

  it("prices nothing for the occupancies Schedule B leaves blank", () => {
    // I-2, I-3 and I-4 print no multiplier — the I-2 row of the City's document stops
    // mid-sentence — so no area row answers and no figure is invented.
    for (const occupancy of ["I-2", "I-3", "I-4"]) {
      const input: Omit<CalculationInput, "asOf"> = {
        squareFootage: 5_000,
        custom: { plans_required: true, elec_occupancy: occupancy },
      };
      const areaCodes = codesFor("electrical", input).filter((code) =>
        code.startsWith("ELEC-AREA-"),
      );
      expect(areaCodes, occupancy).toEqual([]);
      expect(totalFor("electrical", input), occupancy).toBe(5_000); // the application only
    }

    // An occupancy nobody answered asks for the input rather than inventing a rate.
    const unanswered = calculate("electrical", {
      squareFootage: 5_000,
      custom: { plans_required: true },
    });
    expect(unanswered.warnings.join(" ")).toContain("custom.elec_occupancy");
  });

  it("adds the meter and solar rows Schedule A prints beside the two charges", () => {
    const base: Omit<CalculationInput, "asOf"> = {
      squareFootage: 5_000,
      custom: { plans_required: true, elec_occupancy: "R-2" },
    };
    expect(totalFor("electrical", base)).toBe(27_600);

    const withMeters = {
      ...base,
      custom: { ...base.custom, meters: 3 },
    };
    expect(amountFor("electrical", withMeters, "ELEC-AREA-METER")).toBe(7_500); // 3 × $25
    expect(totalFor("electrical", withMeters)).toBe(27_600 + 7_500);

    const withSolar = {
      ...base,
      custom: { ...base.custom, commercial_solar: true, panels: 10 },
    };
    expect(amountFor("electrical", withSolar, "ELEC-AREA-SOLAR-PANEL")).toBe(3_000); // 10 × $3
    expect(totalFor("electrical", withSolar)).toBe(27_600 + 3_000);
  });

  it("charges the low-voltage $75 plus $5.00 per termination, flat regime only", () => {
    const input: Omit<CalculationInput, "asOf"> = {
      custom: { low_voltage_system: true, low_voltage_points: 20 },
    };
    expect(amountFor("electrical", input, "ELEC-FLAT-LOW-VOLTAGE")).toBe(7_500);
    expect(amountFor("electrical", input, "ELEC-FLAT-LOW-VOLTAGE-TERMINATIONS")).toBe(10_000);
    expect(totalFor("electrical", input)).toBe(5_000 + 7_500 + 10_000);
  });
});

describe("Buffalo plumbing permits — counts, never costs", () => {
  it("charges the fixture rows at each class's own rate, and neither answers the other", () => {
    const residential = { fixtures: 4, custom: { one_two_family: true } };
    expect(amountFor("plumbing", residential, "PLUMB-FIXTURES-RESIDENTIAL")).toBe(4_800); // 4 × $12
    expect(amountFor("plumbing", residential, "PLUMB-FIXTURES-COMMERCIAL")).toBeUndefined();
    expect(totalFor("plumbing", residential)).toBe(5_000 + 4_800);

    // $50 first fixture + 3 × $20 = $110.00 — the same four fixtures, the other sheet.
    const commercial = { fixtures: 4, custom: { one_two_family: false } };
    expect(amountFor("plumbing", commercial, "PLUMB-FIXTURES-COMMERCIAL")).toBe(11_000);
    expect(amountFor("plumbing", commercial, "PLUMB-FIXTURES-RESIDENTIAL")).toBeUndefined();

    // A plumbing job with no fixtures charged — an underground-only run — pays no
    // fixture line at all rather than the commercial row's first-fixture base.
    const noFixtures = { custom: { one_two_family: false, linear_feet: 150 } };
    expect(codesFor("plumbing", noFixtures).some((code) => code.includes("FIXTURES"))).toBe(false);
  });

  it("prices underground piping in flat-then-segments, by pipe size", () => {
    const first100 = { custom: { linear_feet: 100 } };
    expect(amountFor("plumbing", first100, "PLUMB-UG-FIRST-100")).toBe(6_000);
    expect(
      codesFor("plumbing", first100).some((code) => code.startsWith("PLUMB-UG-PIPE")),
    ).toBe(false);

    const justOver = { custom: { linear_feet: 101 } };
    expect(amountFor("plumbing", justOver, "PLUMB-UG-PIPE-6IN-AND-UNDER")).toBe(2_000); // one whole segment

    const run = { custom: { linear_feet: 250 } };
    expect(amountFor("plumbing", run, "PLUMB-UG-PIPE-6IN-AND-UNDER")).toBe(4_000); // two segments

    const large = { custom: { linear_feet: 300, ug_over_6in: true } };
    expect(amountFor("plumbing", large, "PLUMB-UG-PIPE-OVER-6IN")).toBe(11_000); // 2 × $55
    expect(amountFor("plumbing", large, "PLUMB-UG-PIPE-6IN-AND-UNDER")).toBeUndefined();
  });

  it("ignores the declared valuation entirely — it prices nothing", () => {
    const cheap: Omit<CalculationInput, "asOf"> = {
      fixtures: 4,
      valuationCents: 100_000,
      custom: { one_two_family: true },
    };
    const expensive: Omit<CalculationInput, "asOf"> = {
      fixtures: 4,
      valuationCents: 900_000_000,
      custom: { one_two_family: true },
    };
    expect(totalFor("plumbing", cheap)).toBe(9_800);
    expect(totalFor("plumbing", expensive)).toBe(totalFor("plumbing", cheap));
  });

  it("charges plan review only when plans are required, and a reinspection when one happened", () => {
    const base = { fixtures: 4, custom: { one_two_family: true } };
    expect(amountFor("plumbing", base, "PLUMB-PLAN-REVIEW")).toBeUndefined();

    const withPlans = { ...base, custom: { ...base.custom, plan_review: true } };
    expect(amountFor("plumbing", withPlans, "PLUMB-PLAN-REVIEW")).toBe(10_000);

    const reinspected = { ...base, custom: { ...base.custom, reinspection: true } };
    expect(amountFor("plumbing", reinspected, "PLUMB-REINSPECTION")).toBe(7_500);
    expect(
      calculate("plumbing", reinspected).components.find(
        (component) => component.code === "PLUMB-REINSPECTION",
      )?.componentType,
    ).toBe("inspection");
  });
});

describe("Buffalo's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // Inputs and prose only, as everywhere: these totals are the arithmetic the page
    // performs when it renders, asserted against the amounts its own notes state.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 3_279_250], // $50.00 + $2,806.50 + $29,936.00
      ["electrical-permit-cost", "electrical", 27_600], // $50 + $50 + $176.00
      ["plumbing-permit-cost", "plumbing", 29_800], // $50 + $100 + $48 + $60 + $40
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = buffaloSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
