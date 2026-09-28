import { describe, expect, it } from "vitest";

import { lasCrucesSeed } from "@/content/lascruces";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Las Cruces, New Mexico — the data, and the arithmetic Resolution 21-019 prints itself.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **Two building paths, one sentence between them.** The $0.20/sq ft residential-new
 *     rate and the seven-band Fee Table are mutually exclusive — the same facts cannot
 *     charge both — and the boundary assertions run each side of it.
 *  2. **The Fee Table prorates and the trade ladders round up, and the document says so
 *     in its own words.** The fee table prints "$10 for each additional $1000" with no
 *     "or fraction thereof"; the plumbing ladder prints the phrase and charges a whole
 *     increment for a fraction. $2,001 of building valuation is $50.01 and $1,001 of
 *     plumbing valuation is $105.00 — the pair of assertions is the reading itself.
 *  3. **The table's own seams.** Each band closes at exactly the next band's printed base
 *     ($280, $480, $830, $5,830) — and the one place it does not, the $100 jump at
 *     $500,000 where the $500,001 band opens at $3,330 against the $3,230 below it, is
 *     asserted from both sides rather than reconciled.
 *  4. **Plan check is not added.** "The first 25% of the building permit fee" is a payment
 *     schedule, so no component charges it — the worked example's total is the fee table
 *     band plus the technology fee, and nothing else.
 *  5. **Tripling doubles the permit fee and not its neighbors.** The schedule triples the
 *     *permit fee*, so the surcharge reads `permit_fee` (base only) and the technology fee
 *     and plan check stay outside it.
 */

const asOf = "2026-09-25";

function rulesFor(permitTypeKey: string) {
  return lasCrucesSeed.feeRules
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

/** A commercial-process building input at a valuation: the Fee Table path, with its tech fee. */
function buildingInput(valuationDollars: number): Omit<CalculationInput, "asOf"> {
  return {
    valuationCents: valuationDollars * 100,
    occupancy: "commercial",
    workType: "remodel",
    custom: { one_two_family: false },
  };
}

describe("Las Cruces seed payload", () => {
  it("identifies the jurisdiction, its state and its county", () => {
    expect(lasCrucesSeed.state).toMatchObject({
      code: "NM",
      slug: "new-mexico",
      fipsCode: "35",
    });
    expect(lasCrucesSeed.county).toMatchObject({
      key: "dona-ana-county",
      fipsCode: "35013",
    });
    expect(lasCrucesSeed.jurisdiction).toMatchObject({
      key: "las-cruces",
      slug: "las-cruces",
      officialName: "City of Las Cruces",
      countyKey: "dona-ana-county",
      timezone: "America/Denver",
      isActive: true,
    });
  });

  it("shares the New Mexico state row rather than defining its own permit types", () => {
    expect(lasCrucesSeed.state.code).toBe("NM");
    expect(lasCrucesSeed.permitTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(lasCrucesSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(lasCrucesSeed.feeSchedules.map((schedule) => schedule.key));

    expect(sourceKeys.size).toBe(1);
    for (const entry of lasCrucesSeed.feeRules) {
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

  it("charges the two building paths exclusively — never both", () => {
    const resNew = calculate("building", {
      occupancy: "residential",
      workType: "new_construction",
      squareFootage: 1_600,
      custom: { one_two_family: true },
    });
    const baseCodes = resNew.components
      .filter((component) => component.componentType === "base")
      .map((component) => component.code);
    expect(baseCodes).toEqual(["BLD-RES-NEW-SF"]);
    expect(resNew.totalCents).toBe(34_000); // $320.00 + $20 technology fee

    const remodelSameHouse = calculate("building", {
      occupancy: "residential",
      workType: "remodel",
      valuationCents: 10_000_000,
      custom: { one_two_family: true },
    });
    expect(
      remodelSameHouse.components.some((component) => component.code === "BLD-RES-NEW-SF"),
    ).toBe(false);
    expect(amountFor("building", buildingInput(10_000), "BLD-TABLE-2001-25000")).toBe(13_000);
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = lasCrucesSeed.permitPages.filter(
      (page) => page.publishStatus === "published" && !page.noindex,
    );

    expect(lasCrucesSeed.permitPages).toHaveLength(3);
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
        sourceCount: lasCrucesSeed.sources.length,
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
    for (const page of lasCrucesSeed.permitPages) {
      const record = lasCrucesSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.permitTypeKey, page.slug).toBe(page.permitTypeKey);
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
});

describe("Las Cruces building permits", () => {
  it("prorates the Fee Table's partial thousands, as the table is worded", () => {
    // "$50 for the first $2,000 plus $10 for each additional $1000" with no "or
    // fraction thereof" — so $2,001 is $50.01, one cent into the band.
    expect(amountFor("building", buildingInput(2_000), "BLD-TABLE-UNDER-2000")).toBe(5_000);
    expect(amountFor("building", buildingInput(2_001), "BLD-TABLE-2001-25000")).toBe(5_001);
    expect(amountFor("building", buildingInput(2_500), "BLD-TABLE-2001-25000")).toBe(5_500);
  });

  it("closes each band at exactly the next band's printed base", () => {
    const seams: Array<[number, string, number]> = [
      [25_000, "BLD-TABLE-2001-25000", 28_000],
      [25_001, "BLD-TABLE-25001-50000", 28_001],
      [50_000, "BLD-TABLE-25001-50000", 48_000],
      [100_000, "BLD-TABLE-50001-100000", 83_000],
      [1_000_000, "BLD-TABLE-500001-1000000", 583_000],
      [1_000_001, "BLD-TABLE-OVER-1000000", 583_000],
    ];

    for (const [valuationDollars, code, expected] of seams) {
      expect(amountFor("building", buildingInput(valuationDollars), code), `$${valuationDollars.toLocaleString("en-US")}`).toBe(
        expected,
      );
    }
  });

  it("charges the table's own $100 jump at $500,000 rather than reconciling it", () => {
    // The band below computes $3,230 at $500,000; the $500,001 band opens at the printed
    // $3,330. Both are the document's — asserted from both sides, smoothed by neither.
    expect(amountFor("building", buildingInput(500_000), "BLD-TABLE-100001-500000")).toBe(
      323_000,
    );
    expect(amountFor("building", buildingInput(500_001), "BLD-TABLE-500001-1000000")).toBe(
      333_001,
    );
    expect(amountFor("building", buildingInput(500_001), "BLD-TABLE-100001-500000")).toBeUndefined();
  });

  it("charges plan check as a payment schedule rather than a component", () => {
    // "Plan check fee is the first 25% of the building permit fee" — part of the fee, paid
    // at application. Nothing here adds 25% to a total.
    const result = calculate("building", buildingInput(120_000));
    expect(
      result.components.some((component) => component.componentType === "plan_review"),
    ).toBe(false);
    expect(result.totalCents).toBe(105_000); // $950 band + $100 technology fee, nothing else
  });

  it("takes the technology fee at its floor for small commercial jobs", () => {
    // $10,000 valuation → band fee $130.00; 5% is $6.50, so the $100 floor binds.
    const small = calculate("building", buildingInput(10_000));
    expect(
      small.components.find((component) => component.code === "BLD-TECHNOLOGY-COMMERCIAL")
        ?.amountCents,
    ).toBe(10_000);
    expect(small.totalCents).toBe(23_000);

    // $400,000 → band fee $2,630.00; 5% is $131.50, above the floor.
    const large = calculate("building", buildingInput(400_000));
    expect(
      large.components.find((component) => component.code === "BLD-TECHNOLOGY-COMMERCIAL")
        ?.amountCents,
    ).toBe(13_150);
    expect(large.totalCents).toBe(276_150);
  });

  it("charges the flat residential technology fee on the residential process", () => {
    const result = calculate("building", {
      occupancy: "residential",
      workType: "remodel",
      valuationCents: 1_000_000,
      custom: { one_two_family: true },
    });
    expect(result.totalCents).toBe(15_000); // $130 band + $20 technology fee
  });

  it("charges no technology fee when the occupancy is not answered", () => {
    // Both technology rows state conditions — residential by occupancy, commercial by a
    // non-residential occupancy — and a comparison against a fact nobody gave is not a
    // match. The valuation still prices, because the Fee Table asks for the valuation.
    const result = calculate("building", {
      valuationCents: 1_000_000,
      custom: { one_two_family: false },
    });
    expect(result.totalCents).toBe(13_000);
    expect(
      result.components.some((component) => component.code.startsWith("BLD-TECHNOLOGY")),
    ).toBe(false);
  });

  it("adds expedited review as the greater of $1,000 or another permit fee", () => {
    const small = calculate("building", { ...buildingInput(120_000), isExpedited: true });
    // Permit fee $950 — below $1,000, so the floor is what is paid.
    expect(
      small.components.find((component) => component.code === "BLD-EXPEDITED")?.amountCents,
    ).toBe(100_000);
    expect(small.totalCents).toBe(205_000);

    const large = calculate("building", { ...buildingInput(400_000), isExpedited: true });
    // Permit fee $2,630 — an additional payment of the permit fee exceeds $1,000.
    expect(
      large.components.find((component) => component.code === "BLD-EXPEDITED")?.amountCents,
    ).toBe(263_000);
    expect(large.totalCents).toBe(539_150);
  });

  it("triples the permit fee for work started without one, and only the permit fee", () => {
    const result = calculate("building", {
      ...buildingInput(120_000),
      custom: { one_two_family: false, unpermitted_work: true },
    });
    const surcharge = result.components.find(
      (component) => component.code === "BLD-UNPERMITTED-WORK",
    );
    expect(surcharge?.amountCents).toBe(190_000); // 2 × $950
    // $950 × 3 + the $100 technology fee: the fee triples, its neighbors do not.
    expect(result.totalCents).toBe(295_000);

    const reinspection = totalFor("building", {
      ...buildingInput(120_000),
      custom: { one_two_family: false, reinspection: true },
    });
    expect(reinspection).toBe(105_000 + 4_500);
  });
});

describe("Las Cruces electrical permits", () => {
  const residential = (
    squareFootage: number,
    custom: Record<string, unknown> = {},
  ): Omit<CalculationInput, "asOf"> => ({
    squareFootage,
    occupancy: "residential",
    workType: "remodel",
    custom: { one_two_family: true, ...custom },
  });

  it("charges the residential area ladder with its step at 1,000 and its slope above 2,000", () => {
    const cases: Array<[number, number, number]> = [
      // square feet, area component, total with the $10 technology fee
      [999, 3_500, 4_500],
      [1_000, 6_500, 7_500],
      [1_499, 6_500, 7_500],
      [1_500, 11_000, 12_000],
      [2_000, 11_000, 12_000],
      [2_400, 13_000, 14_000],
    ];

    for (const [squareFootage, areaCents, total] of cases) {
      const result = calculate("electrical", residential(squareFootage));
      const area = result.components.find((component) =>
        component.code.startsWith("ELEC-RES-AREA"),
      );
      expect(area?.amountCents, `${squareFootage} sq ft`).toBe(areaCents);
      expect(result.totalCents, `${squareFootage} sq ft total`).toBe(total);
    }
  });

  it("prorates the per-100 addition, because the row omits the round-up phrase", () => {
    // "$110.00 plus $5.00 per 100 sf over 2,000 sf" — 50 square feet over 2,000 adds
    // $2.50, not $5.00, and 400 over adds $20.00.
    expect(amountFor("electrical", residential(2_001), "ELEC-RES-AREA-OVER-2000")).toBe(11_005);
    expect(amountFor("electrical", residential(2_050), "ELEC-RES-AREA-OVER-2000")).toBe(11_250);
    expect(amountFor("electrical", residential(2_400), "ELEC-RES-AREA-OVER-2000")).toBe(13_000);
  });

  it("charges the commercial amperage ladder, where 401 and 400 cost the same", () => {
    const amps = (amperage: number): Omit<CalculationInput, "asOf"> => ({
      occupancy: "commercial",
      custom: { amperage },
    });

    const cases: Array<[number, number]> = [
      [100, 13_000],
      [150, 13_000],
      [151, 20_000],
      [200, 20_000],
      [201, 30_000],
      [400, 30_000],
      [401, 30_000],
      [451, 32_500], // $300 + $50 per 100 amps prorated over 401: 50 A × $0.50
      [501, 35_000], // $300 + 100 A × $0.50
    ];

    for (const [amperage, expected] of cases) {
      expect(totalFor("electrical", amps(amperage)) - 1_000, `${amperage} A`).toBe(expected);
    }
  });

  it("leaves a residential service upgrade unpriced rather than charging commercial rates", () => {
    // The amperage ladder sits in the commercial section and the commercial Service Change
    // row is printed with no amount — so a dwelling's service work has no row, and the
    // model says so instead of borrowing one.
    const result = calculate("electrical", {
      occupancy: "residential",
      workType: "repair",
      custom: { one_two_family: true, amperage: 200 },
    });
    expect(result.totalCents).toBe(1_000); // the technology fee, and nothing else
    expect(
      result.components.some((component) => component.code.startsWith("ELEC-COMM-AMPS")),
    ).toBe(false);
    expect(
      result.components.some((component) => component.code.startsWith("ELEC-RES-AREA")),
    ).toBe(false);
  });

  it("lets the bundled solar fee stand down for the area rows it contains", () => {
    const result = calculate("electrical", {
      ...residential(1_600),
      custom: { one_two_family: true, solar_pv: true },
    });
    expect(
      result.components.find((component) => component.code === "ELEC-SOLAR-PV-RESIDENTIAL")
        ?.amountCents,
    ).toBe(25_000);
    expect(
      result.components.some((component) => component.code.startsWith("ELEC-RES-AREA")),
    ).toBe(false);
    expect(result.totalCents).toBe(26_000);
  });

  it("prices pools by dwelling type and takes plan review as its own $45", () => {
    expect(
      totalFor("electrical", {
        occupancy: "residential",
        workType: "repair",
        custom: { one_two_family: true, swimming_pool: true },
      }),
    ).toBe(10_000);
    expect(
      totalFor("electrical", {
        occupancy: "commercial",
        custom: { one_two_family: false, swimming_pool: true },
      }),
    ).toBe(19_000);

    const withPlans = calculate("electrical", {
      ...residential(2_400),
      custom: { one_two_family: true, plan_review: true },
    });
    expect(
      withPlans.components.find((component) => component.code === "ELEC-PLAN-REVIEW")
        ?.amountCents,
    ).toBe(4_500);
    expect(withPlans.totalCents).toBe(18_500);
  });

  it("triples the electrical permit fee for unpermitted work, base only", () => {
    const result = calculate("electrical", {
      ...residential(2_400),
      custom: { one_two_family: true, unpermitted_work: true },
    });
    expect(
      result.components.find((component) => component.code === "ELEC-UNPERMITTED-WORK")
        ?.amountCents,
    ).toBe(26_000); // 2 × $130 — the area fee, not the technology fee
    expect(result.totalCents).toBe(13_000 + 1_000 + 26_000);
  });
});

describe("Las Cruces plumbing permits", () => {
  const newDwelling = (
    units: number,
    bathrooms?: number,
  ): Omit<CalculationInput, "asOf"> => ({
    occupancy: "residential",
    workType: "new_construction",
    units,
    custom: {
      one_two_family: true,
      ...(bathrooms !== undefined ? { bathrooms } : {}),
    },
  });

  it("prices new construction by the bathroom-and-unit pairs the table prints", () => {
    const cases: Array<[Omit<CalculationInput, "asOf">, number, string]> = [
      [newDwelling(1, 1), 10_000, "one unit, one bath"],
      [newDwelling(1, 1.5), 10_000, "one unit, 1½ baths"],
      [newDwelling(1, 2), 15_000, "one unit, two baths"],
      [newDwelling(2, 3.5), 15_000, "two units, 3½ baths"],
      [newDwelling(2, 4), 20_000, "two units, four baths"],
    ];

    for (const [input, expected, label] of cases) {
      const result = calculate("plumbing", input);
      const base = result.components.find((component) => component.componentType === "base");
      expect(base?.amountCents, label).toBe(expected);
      expect(result.totalCents, label).toBe(expected + 1_000);
    }
  });

  it("prices structures above two units by the per-unit ladder", () => {
    // $200.00 plus $30.00 per unit over two: four units is $260.00.
    expect(amountFor("plumbing", newDwelling(4, 2), "PLUMB-NEW-OVER-2DU")).toBe(26_000);
    expect(totalFor("plumbing", newDwelling(4, 2))).toBe(27_000);
  });

  it("leaves a bathroom count in no printed band unpriced rather than guessing", () => {
    // The bands run 1½-or-less, 2-to-3½, and 4-or-more: 3¾ baths is in none of them, and
    // the valuation rows are excluded by the same new-construction gate.
    const inNoBand = calculate("plumbing", newDwelling(2, 3.75));
    expect(inNoBand.totalCents).toBe(1_000); // the technology fee and nothing else
    expect(
      inNoBand.components.some((component) => component.code.startsWith("PLUMB-VAL")),
    ).toBe(false);

    // Answering the units without the bathrooms is the same position.
    const noBathroomCount = calculate("plumbing", newDwelling(1));
    expect(noBathroomCount.totalCents).toBe(1_000);
  });

  it("rounds the plumbing ladder's partial thousands up — the phrase is printed", () => {
    const valuation = (dollars: number): Omit<CalculationInput, "asOf"> => ({
      occupancy: "residential",
      workType: "remodel",
      valuationCents: dollars * 100,
      custom: { one_two_family: true },
    });

    expect(amountFor("plumbing", valuation(500), "PLUMB-VAL-LE-500")).toBe(5_000);
    expect(amountFor("plumbing", valuation(501), "PLUMB-VAL-501-1000")).toBe(10_000);
    expect(amountFor("plumbing", valuation(1_000), "PLUMB-VAL-501-1000")).toBe(10_000);
    // "$100.00 for the first $1000.00 plus 5.00 for each additional $1,000.00 or fraction
    // thereof": $1,001 buys a whole increment — $105.00, where the building fee table's
    // own $1 of valuation would have cost a cent.
    expect(amountFor("plumbing", valuation(1_001), "PLUMB-VAL-OVER-1000")).toBe(10_500);
    expect(amountFor("plumbing", valuation(2_000), "PLUMB-VAL-OVER-1000")).toBe(10_500);
    expect(amountFor("plumbing", valuation(2_001), "PLUMB-VAL-OVER-1000")).toBe(11_000);
  });

  it("triples the plumbing permit fee for unpermitted work, base only", () => {
    const result = calculate("plumbing", {
      ...newDwelling(1, 1),
      custom: { one_two_family: true, bathrooms: 1, unpermitted_work: true },
    });
    expect(
      result.components.find((component) => component.code === "PLUMB-UNPERMITTED-WORK")
        ?.amountCents,
    ).toBe(20_000); // 2 × $100
    expect(result.totalCents).toBe(10_000 + 1_000 + 20_000);

    const reinspection = totalFor("plumbing", {
      ...newDwelling(1, 1),
      custom: { one_two_family: true, bathrooms: 1, reinspection: true },
    });
    expect(reinspection).toBe(11_000 + 4_500);
  });
});

describe("Las Cruces's worked examples", () => {
  it("computes each page's own example from its own stored inputs", () => {
    // The examples carry no amounts — only inputs and prose — so this is the arithmetic the
    // page performs at render time, asserted against the schedules it cites. The expected
    // totals are the ones each example's notes state in words.
    const expected: Array<[string, string, number]> = [
      ["building-permit-cost", "building", 105_000], // $950 Fee Table + $100 technology fee
      ["electrical-permit-cost", "electrical", 14_000], // $130 area fee + $10 technology fee
      ["plumbing-permit-cost", "plumbing", 11_000], // $100 bathroom band + $10 technology fee
    ];

    for (const [slug, permitTypeKey, total] of expected) {
      const page = lasCrucesSeed.permitPages.find((entry) => entry.slug === slug);
      expect(page?.workedExample, `${slug} has an example`).toBeDefined();

      const inputs = page?.workedExample?.inputs ?? {};
      expect(totalFor(permitTypeKey, inputs), slug).toBe(total);
    }
  });
});
