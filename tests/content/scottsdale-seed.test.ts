import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import { phoenixSeed } from "@/content/phoenix";
import { SCOTTSDALE_PUBLISHED_PERMIT_PAGES, scottsdaleSeed } from "@/content/scottsdale";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Scottsdale's content, checked against the documents it came from — without a
 * database, so this runs everywhere.
 *
 * The interesting checks here are structural, because Scottsdale's fee is a shape
 * neither Texas city has:
 *
 *  1. **Two areas, not one total.** The permit and plan review fees read two
 *     different facts — the area with A/C and the covered area without it — and a
 *     test asserts that no rule reads the first where it means the second.
 *  2. **Nothing reads a valuation.** Scottsdale has no valuation anywhere, so if a
 *     rule ever acquired a valuation basis the page would be quietly wrong.
 *  3. **Plan review carries no base fee**, which is the difference from Phoenix, and
 *     is asserted rather than left to prose.
 *  4. **The 30% remodel rate is exact.** `$0.94 x 30%` is $0.282, published, and the
 *     arithmetic has to land on the cent.
 */

const AS_OF = "2026-09-24";

describe("Scottsdale payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of scottsdaleSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the run defines", () => {
    const sourceKeys = new Set(scottsdaleSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(scottsdaleSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...scottsdaleSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of scottsdaleSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const link of scottsdaleSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of scottsdaleSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
    }

    for (const requirement of scottsdaleSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }

    for (const verification of scottsdaleSeed.verifications) {
      if (verification.sourceKey) {
        expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
      }
    }
  });

  it("adds no state, county, permit type or project type that Arizona already defines", () => {
    // Phoenix defined Arizona and Maricopa County; a city row links to them.
    expect(scottsdaleSeed.state.code).toBe(phoenixSeed.state.code);
    expect(scottsdaleSeed.county.key).toBe(phoenixSeed.county.key);
    expect(scottsdaleSeed.jurisdiction.stateKey).toBe("az");
    expect(scottsdaleSeed.jurisdiction.countyKey).toBe(phoenixSeed.county.key);
    expect(scottsdaleSeed.permitTypes).toEqual([]);
    expect(scottsdaleSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: the building permit and the two items it prices flat", () => {
    expect(SCOTTSDALE_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(scottsdaleSeed.permitPages).toHaveLength(3);

    // Mechanical gets no page: nothing in the Miscellaneous schedule is mechanical,
    // so it would be a statement of absence. Demolition is priced and still gets no
    // page: $379 and one exception is not a page.
    expect(scottsdaleSeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(
      false,
    );
    expect(scottsdaleSeed.permitPages.some((page) => page.permitTypeKey === "demolition")).toBe(
      false,
    );
  });

  it("issues trade permits and prices a short list of items flat", () => {
    const buildingRules = scottsdaleSeed.feeRules.filter(
      (entry) => entry.permitTypeKey === "building",
    );
    expect(buildingRules).toHaveLength(7);

    for (const link of scottsdaleSeed.jurisdictionPermitTypes) {
      expect(link.notes, link.permitTypeKey).toBeTruthy();
    }
  });
});

describe("Scottsdale payload — the two-area mechanism", () => {
  const rules = scottsdaleSeed.feeRules
    .filter((entry) => entry.permitTypeKey === "building")
    .map((entry) => entry.rule);

  function evaluate(input: Omit<CalculationInput, "asOf">) {
    return calculatePermitFees({ asOf: AS_OF, ...input }, rules);
  }

  function fee(input: Omit<CalculationInput, "asOf">): number {
    return evaluate(input).components
      .filter((component) => component.componentType === "base")
      .reduce((sum, component) => sum + component.amountCents, 0);
  }

  function total(input: Omit<CalculationInput, "asOf">): number {
    return evaluate(input).totalCents;
  }

  const newHome = (squareFootage: number, coveredSquareFootage?: number) => ({
    squareFootage,
    workType: "new_construction" as const,
    occupancy: "residential" as const,
    custom:
      coveredSquareFootage === undefined
        ? {}
        : { covered_square_footage: coveredSquareFootage },
  });

  it("charges the base fee, then each area at its own rate", () => {
    // $237 + 2,500 x $0.94 + 400 x $0.54 = $2,803.00 in permit fees.
    expect(fee(newHome(2_500, 400))).toBe(280_300);
    // Plan review is its own pair of rates and carries no base fee:
    // 2,500 x $0.54 + 400 x $0.34 = $1,486.00.
    expect(total(newHome(2_500, 400)) - fee(newHome(2_500, 400))).toBe(148_600);
    expect(total(newHome(2_500, 400))).toBe(428_900); // $4,289.00
  });

  it("does not charge the covered rate on the area with A/C", () => {
    // The mistake this schedule invites: reading the two rows as two rates on one
    // total. 2,500 sq ft with no covered area is $237 + 2,500 x $0.94, and nothing
    // more; the covered component is absent, not applied at $0.54 to the same 2,500.
    expect(fee(newHome(2_500))).toBe(258_700); // $2,587.00
    expect(total(newHome(2_500))).toBe(393_700); // $2,587.00 + 2,500 x $0.54

    const result = evaluate(newHome(2_500));
    expect(result.excluded.map((excluded) => excluded.code)).toContain("PERMIT-COVERED-AREA");
    expect(result.warnings.join(" ")).not.toContain("covered");
  });

  it("charges the covered area on its own when there is no conditioned area", () => {
    // A detached covered structure: the base fee and the covered rate, no area rate.
    const result = evaluate({
      workType: "new_construction",
      occupancy: "residential",
      custom: { covered_square_footage: 600 },
    });
    expect(result.totalCents).toBe(76_500); // $237 + 600 x $0.54 + 600 x $0.34 = $765.00
    expect(result.excluded.map((excluded) => excluded.code)).toContain("PERMIT-AC-AREA");
    expect(result.excluded.map((excluded) => excluded.code)).toContain("REVIEW-AC-AREA");
  });

  it("charges 30% of the area rate on a remodel, on both the permit and the review", () => {
    // $237 + 1,200 x $0.282 + 400 x $0.54 = $791.40, then plan review on the
    // conditioned area only: 1,200 x $0.162 = $194.40.
    const remodel = {
      squareFootage: 1_200,
      workType: "remodel" as const,
      occupancy: "residential" as const,
      custom: { covered_square_footage: 400 },
    };
    expect(fee(remodel)).toBe(79_140); // $791.40
    expect(total(remodel)).toBe(98_580); // $985.80

    const result = evaluate(remodel);
    // The covered area is charged the full permit rate, and is absent from the
    // review, because no published remodel row prices a covered area in review.
    expect(result.excluded.map((excluded) => excluded.code)).toContain("REVIEW-COVERED-AREA");
    expect(result.excluded.map((excluded) => excluded.code)).not.toContain("PERMIT-COVERED-AREA");
  });

  it("charges the same rates for commercial work as for residential", () => {
    // The one place a rule could have drifted: the two schedules are separate
    // documents whose rows differ only in their labels.
    const commercial = {
      squareFootage: 2_500,
      workType: "new_construction" as const,
      occupancy: "commercial" as const,
      custom: { covered_square_footage: 400 },
    };
    expect(total(commercial)).toBe(total(newHome(2_500, 400)));
  });

  it("reads no valuation anywhere", () => {
    const bases = rules
      .flatMap((rule) => (rule.feeType === "flat" ? [] : [(rule.config as { basis?: string }).basis]))
      .filter((basis): basis is string => basis !== undefined);

    expect([...new Set(bases)].sort()).toEqual(["covered_square_footage", "square_footage"]);
    expect(bases).not.toContain("valuation");

    // And a valuation buys nothing at all here. The base fee is charged whatever the
    // project costs; every area component drops out, because each one's condition
    // requires the area it is charged on to have been supplied. Money in, money out
    // and no area fee is the only honest outcome for a valuation-only estimate.
    const valued = evaluate({ valuationCents: 40_000_000, workType: "new_construction" });
    expect(valued.totalCents).toBe(23_700); // the $237 base fee, and nothing else
    expect(valued.components).toHaveLength(1);
    expect(valued.excluded).toHaveLength(6);
    expect(valued.excluded.every((excluded) => excluded.reason === "conditions_not_met")).toBe(
      true,
    );
  });

  it("publishes no per-item trade rate", () => {
    // Dallas prices a trade by how many trades a job involves and Houston by the
    // outlet and the fixture. Scottsdale prices neither.
    expect(rules.filter((rule) => rule.feeType === "per_unit")).toEqual([]);
  });

  it("puts no base fee in plan review", () => {
    const reviewRules = rules.filter((rule) => rule.componentType === "plan_review");
    expect(reviewRules).toHaveLength(3);
    expect(reviewRules.filter((rule) => rule.feeType === "flat")).toEqual([]);
    expect(reviewRules.every((rule) => rule.minimumCents === null)).toBe(true);
  });

  it("charges nothing rather than guessing at a work type it has not modelled", () => {
    // The 70% roof-modification, 95% shell-only and 25% foundation-only rows are
    // published and deliberately not modelled. Work entered as something other than
    // new construction, an addition or a remodel has to produce no area fee and say
    // so, not inherit the new-construction rate.
    for (const workType of ["other", "repair", "demolition"] as const) {
      const result = evaluate({ squareFootage: 2_500, workType, occupancy: "residential" });
      expect(result.totalCents, workType).toBe(0);
      expect(result.warnings.join(" "), workType).toContain("No fee rules matched");
    }
  });

  it("states the applicability of each rule in the schedule's own terms", () => {
    const reviewCovered = rules.find((rule) => rule.code === "REVIEW-COVERED-AREA");
    expect(reviewCovered).toBeDefined();
    expect(JSON.stringify(reviewCovered?.conditions)).toContain("new_construction");
  });
});

describe("Scottsdale trade permits — flat fees, never a sum", () => {
  const rulesFor = (permitTypeKey: string) =>
    scottsdaleSeed.feeRules
      .filter((entry) => entry.permitTypeKey === permitTypeKey)
      .filter((entry) => entry.rule.status === "active")
      .map((entry) => entry.rule);

  function total(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
    return calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey)).totalCents;
  }

  it("models four rules on each trade, and the same one-discipline minimum on both", () => {
    expect(rulesFor("electrical").map((rule) => rule.code).sort()).toEqual([
      "REINSPECTION",
      "SOLAR-RESIDENTIAL",
      "TEMP-POWER-POLE",
      "TRADE-MINIMUM-ONE-DISCIPLINE",
    ]);
    expect(rulesFor("plumbing").map((rule) => rule.code).sort()).toEqual([
      "REINSPECTION",
      "SOLAR-WATER-HEATER",
      "TRADE-MINIMUM-ONE-DISCIPLINE",
      "WATER-HEATER",
    ]);
  });

  it("charges the published minimum when no flat item prices the permit", () => {
    // "Minimum Permit (one discipline) $121" — a floor, and the only figure the City
    // publishes about a permit taken out for a single trade on its own.
    expect(total("electrical", {})).toBe(12_100);
    expect(total("plumbing", {})).toBe(12_100);
  });

  it("prices each flat item at the City's figure, one at a time", () => {
    const electrical: Array<[string, number]> = [
      ["temporary_power_pole", 12_100],
      ["residential_solar", 16_800],
    ];
    for (const [item, expected] of electrical) {
      expect(total("electrical", { custom: { schedule_item: item } }), item).toBe(expected);
    }

    const plumbing: Array<[string, number]> = [
      ["water_heater", 6_300],
      ["solar_water_heater", 9_000],
    ];
    for (const [item, expected] of plumbing) {
      expect(total("plumbing", { custom: { schedule_item: item } }), item).toBe(expected);
    }
  });

  it("never adds the minimum to a flat item fee", () => {
    // The decision this test protects: the schedule lists these as separate permit
    // fees and does not say the $121 floors them, so a water heater permit is $63 and
    // not $184. If a future pass decides to floor the flat fees instead, this is the
    // assertion that has to be changed deliberately rather than drifted past.
    expect(total("plumbing", { custom: { schedule_item: "water_heater" } })).toBe(6_300);
    expect(total("plumbing", { custom: { schedule_item: "water_heater" } })).not.toBe(18_400);
    expect(total("electrical", { custom: { schedule_item: "temporary_power_pole" } })).not.toBe(
      24_200,
    );
  });

  it("charges the re-inspection only when one is selected", () => {
    expect(total("electrical", {})).toBe(12_100);
    expect(total("electrical", { custom: { reinspection: true } })).toBe(24_200);
  });

  it("computes the published worked examples", () => {
    const electricalPage = scottsdaleSeed.permitPages.find(
      (page) => page.slug === "electrical-permit-cost",
    );
    const plumbingPage = scottsdaleSeed.permitPages.find(
      (page) => page.slug === "plumbing-permit-cost",
    );
    expect(electricalPage?.workedExample).toBeTruthy();
    expect(plumbingPage?.workedExample).toBeTruthy();

    expect(
      calculatePermitFees(
        { asOf: AS_OF, ...electricalPage?.workedExample?.inputs },
        rulesFor("electrical"),
      ).totalCents,
    ).toBe(12_100);
    expect(
      calculatePermitFees(
        { asOf: AS_OF, ...plumbingPage?.workedExample?.inputs },
        rulesFor("plumbing"),
      ).totalCents,
    ).toBe(6_300);
  });

  it("carries no area rate on a trade permit, because the schedules price construction", () => {
    for (const permitTypeKey of ["electrical", "plumbing"]) {
      const bases = rulesFor(permitTypeKey)
        .flatMap((rule) =>
          rule.feeType === "flat" ? [] : [(rule.config as { basis?: string }).basis],
        )
        .filter((basis): basis is string => basis !== undefined);

      expect(bases, permitTypeKey).toEqual([]);
      expect(rulesFor(permitTypeKey).some((rule) => rule.code === "PERMIT-BASE"), permitTypeKey).toBe(
        false,
      );
    }
  });
});

describe("Scottsdale payload — the editorial gate", () => {
  it("passes for the published page, on the payload's own data", () => {
    for (const page of scottsdaleSeed.permitPages) {
      const permitRules = scottsdaleSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === page.permitTypeKey,
      );
      const activeRules = permitRules.filter((entry) => entry.rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: scottsdaleSeed.sources.length,
        feeRuleCount: activeRules.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, page.slug).toEqual([]);
      expect(gate.publishable, page.slug).toBe(true);
      expect(gate.indexable, page.slug).toBe(true);
      expect(gate.warnings.filter((warning) => warning.includes("freshness"))).toEqual([]);
    }
  });

  it("gives the page prose long enough to be worth its URL", () => {
    for (const page of scottsdaleSeed.permitPages) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThan(600);
      expect(page.notIncluded.length, `${page.slug} notIncluded`).toBeGreaterThan(300);
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);
    }
  });

  it("carries a real verification date on every page, source and rule", () => {
    for (const page of scottsdaleSeed.permitPages) {
      expect(page.lastReviewedAt, page.slug).toBe(AS_OF);
    }
    for (const source of scottsdaleSeed.sources) {
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
      expect(source.url, source.key).toMatch(/^https:\/\/www\.scottsdaleaz\.gov\//);
    }
    for (const entry of scottsdaleSeed.feeRules) {
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe("2026-07-01");
      expect(entry.rule.status, entry.rule.code).toBe("active");
    }
  });

  it("records the unread calculator instead of quoting it", () => {
    // The City links a permit fee calculator that answered 403 to this environment.
    // The honest record is that it was not read.
    const feesPage = scottsdaleSeed.sources.find(
      (source) => source.key === "scottsdale-fees-page",
    );
    expect(feesPage?.notes).toContain("403");
    expect(feesPage?.notes).toContain("no figure was taken");

    const verification = scottsdaleSeed.verifications.find(
      (entry) => entry.entityKey === "scottsdale-fees-page",
    );
    expect(verification?.status).toBe("verified");
  });

  it("publishes the department's contact details, which are traceable", () => {
    // Dallas's are deliberately absent because they could not be verified; these can,
    // so they are present, and the source is named.
    const department = scottsdaleSeed.departments[0];
    expect(department?.phone).toBe("480-312-2500");
    expect(department?.email).toBe("OneStopShopStaff@ScottsdaleAZ.gov");
    expect(department?.addressLine).toBe("7447 E. Indian School Road, Scottsdale, AZ 85251");
    expect(department?.hours).toContain("Wednesday");

    const source = scottsdaleSeed.sources.find(
      (entry) => entry.key === "scottsdale-one-stop-shop",
    );
    expect(source?.notes).toContain("7447 E. Indian School Road");
  });
});
