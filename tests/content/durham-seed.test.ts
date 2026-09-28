import { describe, expect, it } from "vitest";

import { DUR_PUBLISHED_PERMIT_PAGES, durhamSeed } from "@/content/durham";
import {
  DUR_ELECTRICAL_MINIMUM_PERMIT_CENTS,
  DUR_ELECTRICAL_MINIMUM_ROUGH_IN_COMMERCIAL_CENTS,
  DUR_ELECTRICAL_MINIMUM_ROUGH_IN_RESIDENTIAL_CENTS,
  DUR_FEE_EFFECTIVE_FROM,
  DUR_MECHANICAL_SOURCE_KEY,
  DUR_SCHEDULE_A_BANDS,
  DUR_SCHEDULE_E_BANDS,
} from "@/content/durham/fee-rules";
import { raleighSeed } from "@/content/raleigh";
import { calculatePermitFees, describeCalculationInput } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";
import { formatCents } from "@/lib/format";

/**
 * Durham, North Carolina — the jurisdiction with **no technology surcharge rule at all**,
 * because its schedules say the surcharge is already inside every published amount.
 *
 * What this file exists to hold down:
 *
 *  1. **Four bases in one document.** A new house by gross area, nonresidential work by
 *     construction contract value with a per-thousand increment, multi-family per unit,
 *     everything else flat. Each is asserted at the boundary the schedule prints.
 *  2. **The three seams of Schedule E** — $455.00 at $50,000 against $456.00 at $50,001,
 *     an exact meeting at $100,000, and a 25-cent step at $500,001 — carried as printed
 *     rather than interpolated.
 *  3. **Floors that stack instead of adding.** Electrical states three minimums for one
 *     permit; the assertions require $65.00 → $100.00 / $150.00 as successive shortfalls,
 *     never $215.00.
 *  4. **The absence itself**: no rule in this payload carries a `technology` component or
 *     reads `fee_subtotal`, while Raleigh's does — asserted side by side, because a
 *     surcharge that is already included and a surcharge charged last look identical in
 *     a total and are opposite claims about a document.
 */

const AS_OF = "2026-09-25";

const SHARED_PERMIT_TYPES = ["building", "electrical", "plumbing"];

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return durhamSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function run(permitTypeKey: string, input: Omit<CalculationInput, "asOf">) {
  return calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey));
}

function componentTotal(result: ReturnType<typeof calculatePermitFees>, code: string): number {
  const component = result.components.find((entry) => entry.code === code);
  expect(component, `component ${code} should be present`).toBeDefined();
  return component?.amountCents ?? 0;
}

const newDwelling = (squareFootage: number): Omit<CalculationInput, "asOf"> => ({
  squareFootage,
  custom: { building_schedule: "new_dwelling" },
});

const nonresidential = (valuationCents: number): Omit<CalculationInput, "asOf"> => ({
  valuationCents,
  custom: { building_schedule: "nonresidential" },
});

describe("Durham payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of durhamSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, schedules and permit types the payload defines", () => {
    const sourceKeys = new Set(durhamSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(durhamSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set(SHARED_PERMIT_TYPES);

    for (const entry of durhamSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of durhamSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of durhamSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
      expect(page.faqs?.length ?? 0, `${page.slug} has no FAQs`).toBeGreaterThan(0);
      for (const faq of page.faqs ?? []) {
        if (faq.sourceId) expect(sourceKeys, faq.sourceId).toContain(faq.sourceId);
      }
    }

    for (const requirement of durhamSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
    }

    for (const verification of durhamSeed.verifications) {
      if (verification.sourceKey) expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
    }

    expect(durhamSeed.permitTypes).toEqual([]);
    expect(durhamSeed.projectTypes).toEqual([]);
  });

  it("defines Durham County and one department covering the City and the County", () => {
    expect(durhamSeed.state.code).toBe("NC");
    expect(durhamSeed.state.fipsCode).toBe("37");
    expect(durhamSeed.county.slug).toBe("durham-county");
    expect(durhamSeed.county.fipsCode).toBe("37063");
    expect(durhamSeed.jurisdiction.stateKey).toBe("nc");
    expect(durhamSeed.jurisdiction.countyKey).toBe("durham-county");
    expect(durhamSeed.jurisdiction.type).toBe("city");
    expect(durhamSeed.departments).toHaveLength(1);
    const department = durhamSeed.departments[0];
    expect(department?.phone).toBe("919-560-1200");
    expect(department?.notes ?? "").toContain("City and County of Durham");
  });

  it("publishes three pages, one per priced schedule", () => {
    expect(DUR_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(durhamSeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(false);
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of DUR_PUBLISHED_PERMIT_PAGES) {
      const rulesInEffect = durhamSeed.feeRules
        .filter((entry) => entry.permitTypeKey === page.permitTypeKey)
        .map((entry) => entry.rule)
        .filter((rule) => rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: durhamSeed.sources.filter((source) => source.isPrimary).length,
        feeRuleCount: rulesInEffect.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.publishable).toBe(true);
      expect(gate.indexable).toBe(true);
      expect(page.intro.length).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length).toBeGreaterThanOrEqual(120);
      expect(page.faqs?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(page.seoTitle.trim().length).toBeGreaterThan(0);
      expect(page.seoDescription.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every published page a unique title and description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of DUR_PUBLISHED_PERMIT_PAGES) {
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }
  });

  it("dates every source and verification to the day the schedules were read", () => {
    for (const source of durhamSeed.sources) {
      expect(source.retrievedAt, source.key).toBe(AS_OF);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
    }
    for (const verification of durhamSeed.verifications) {
      expect(verification.verifiedAt, verification.entityKey).toBe(AS_OF);
    }

    // The effective date is printed on the documents themselves, not inferred from
    // when a previous version stopped.
    expect(DUR_FEE_EFFECTIVE_FROM).toBe("2018-07-01");
    for (const schedule of durhamSeed.feeSchedules) {
      expect(schedule.effectiveFrom, schedule.key).toBe("2018-07-01");
      expect(schedule.status, schedule.key).toBe("active");
    }
  });

  it("cites the mechanical schedule it deliberately does not price", () => {
    const mechanical = durhamSeed.sources.find((source) => source.key === DUR_MECHANICAL_SOURCE_KEY);
    expect(mechanical, "the fourth schedule is named, not dropped").toBeDefined();
    expect(mechanical?.notes).toContain("prices a mechanical permit in any jurisdiction");
    expect(durhamSeed.feeSchedules.some((schedule) => schedule.sourceKey === DUR_MECHANICAL_SOURCE_KEY)).toBe(
      false,
    );
  });

  it("writes a profile a reader can parse: a list of exclusions and a multi-paragraph context", () => {
    const profile = durhamSeed.profile;
    expect(profile.publishStatus).toBe("published");
    expect(profile.noindex).toBe(false);
    expect(profile.notIncluded).toContain("\n- ");
    expect(profile.localContext.split("\n\n").length).toBeGreaterThanOrEqual(3);
    expect(profile.valuationBasis.length).toBeGreaterThanOrEqual(120);
  });
});

describe("the rule inventory", () => {
  it("gives every rule a unique code within its permit type", () => {
    for (const permitTypeKey of SHARED_PERMIT_TYPES) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("models the building schedule's six priced schedules and nothing else", () => {
    expect(rulesFor("building").map((rule) => rule.code).sort()).toEqual(
      [
        "BUILD-A-NEW-DWELLING",
        "BUILD-A-PLAN-REVIEW",
        "BUILD-B-MULTIFAMILY",
        "BUILD-B-PLAN-REVIEW",
        "BUILD-C-ACCESSORY",
        "BUILD-C-FOOTING",
        "BUILD-C-PLAN-REVIEW",
        "BUILD-D-RENOVATION",
        "BUILD-D-FOOTING",
        "BUILD-D-PLAN-REVIEW",
        "BUILD-E-UP-TO-5000",
        "BUILD-E-5001-50000",
        "BUILD-E-50001-100000",
        "BUILD-E-100001-500000",
        "BUILD-E-OVER-500000",
        "BUILD-E-PLAN-UP-TO-5000",
        "BUILD-E-PLAN-5001-50000",
        "BUILD-E-PLAN-50001-100000",
        "BUILD-E-PLAN-100001-500000",
        "BUILD-E-PLAN-OVER-500000",
        "BUILD-F-MOBILE-HOME",
        "BUILD-F-MODULAR-UNIT",
        "BUILD-F-MOVING",
        "BUILD-F-DEMOLITION-UP-TO-5000",
        "BUILD-F-DEMOLITION-OVER-5000",
        "BUILD-F-DEMOLITION-WITH-PERMIT",
        "BUILD-F-REROOFING",
        "BUILD-F-DECK",
        "BUILD-F-CHANGE-OF-OCCUPANCY",
        "BUILD-F-ROOFING-COMMERCIAL-UP-TO-20000",
        "BUILD-F-ROOFING-COMMERCIAL-OVER-20000",
      ].sort(),
    );
  });

  it("charges plan review as its own component wherever the schedule prints a column", () => {
    const planReview = rulesFor("building").filter((rule) => rule.componentType === "plan_review");
    expect(planReview.map((rule) => rule.code).sort()).toEqual(
      [
        "BUILD-A-PLAN-REVIEW",
        "BUILD-B-PLAN-REVIEW",
        "BUILD-C-PLAN-REVIEW",
        "BUILD-D-PLAN-REVIEW",
        "BUILD-E-PLAN-UP-TO-5000",
        "BUILD-E-PLAN-5001-50000",
        "BUILD-E-PLAN-50001-100000",
        "BUILD-E-PLAN-100001-500000",
        "BUILD-E-PLAN-OVER-500000",
      ].sort(),
    );
    // Neither trade schedule publishes a plan review fee, so neither trade carries one.
    for (const permitTypeKey of ["electrical", "plumbing"]) {
      expect(rulesFor(permitTypeKey).some((rule) => rule.componentType === "plan_review")).toBe(false);
    }
  });

  it("activates every rule on the schedules' own effective date", () => {
    for (const entry of durhamSeed.feeRules) {
      expect(entry.rule.status, entry.rule.code).toBe("active");
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe("2018-07-01");
      expect(entry.rule.effectiveTo, entry.rule.code).toBeNull();
      expect(entry.rule.sourceId, entry.rule.code).toMatch(/^durham-/);
    }
  });

  it("carries no technology surcharge rule, because the amounts already include it", () => {
    const technology = durhamSeed.feeRules.filter((entry) => entry.rule.componentType === "technology");
    expect(technology).toEqual([]);

    const readingTheBill = durhamSeed.feeRules.filter(
      (entry) => (entry.rule.config as { basis?: string }).basis === "fee_subtotal",
    );
    expect(readingTheBill).toEqual([]);

    // Raleigh is the counterpart: a 4% surcharge printed as its own row and charged last.
    // Both are North Carolina, and the two payloads must not converge.
    const raleighSurcharges = raleighSeed.feeRules.filter(
      (entry) => entry.rule.componentType === "technology",
    );
    expect(raleighSurcharges.length).toBeGreaterThanOrEqual(3);
    expect(
      raleighSurcharges.every((entry) => (entry.rule.config as { rateBps?: number }).rateBps === 400),
    ).toBe(true);
  });

  it("states all three electrical floors as permit-level rules, in ascending order", () => {
    const floors = rulesFor("electrical").filter((rule) => rule.feeType === "permit_minimum");
    expect(floors.map((rule) => rule.code).sort()).toEqual([
      "ELEC-MINIMUM-PERMIT",
      "ELEC-MINIMUM-ROUGH-IN-COMMERCIAL",
      "ELEC-MINIMUM-ROUGH-IN-RESIDENTIAL",
    ]);
    expect(DUR_ELECTRICAL_MINIMUM_PERMIT_CENTS).toBe(6_500);
    expect(DUR_ELECTRICAL_MINIMUM_ROUGH_IN_RESIDENTIAL_CENTS).toBe(10_000);
    expect(DUR_ELECTRICAL_MINIMUM_ROUGH_IN_COMMERCIAL_CENTS).toBe(15_000);

    for (const floor of floors) {
      expect((floor.config as { basis?: string }).basis, floor.code).toBe("permit_fee");
      // Each floor only fires while the permit is below it, so a cleared floor is not
      // rendered as a $0.00 line and a higher floor can read the one before it.
      expect(JSON.stringify(floor.conditions), floor.code).toContain('"permit_fee"');
    }
    expect(floors.find((rule) => rule.code === "ELEC-MINIMUM-PERMIT")?.priority).toBe(500);
  });
});

describe("the building permit — four bases in one document", () => {
  it("prices a new house from gross area, not from valuation", () => {
    const rule = rulesFor("building").find((entry) => entry.code === "BUILD-A-NEW-DWELLING");
    expect(rule?.feeType).toBe("tiered_table");
    expect((rule?.config as { basis?: string }).basis).toBe("square_footage");
    expect(DUR_SCHEDULE_A_BANDS).toHaveLength(8);
    expect(DUR_SCHEDULE_A_BANDS[0]?.permitCents).toBe(14_600);
    expect(DUR_SCHEDULE_A_BANDS[DUR_SCHEDULE_A_BANDS.length - 1]?.permitCents).toBe(81_000);
  });

  it("charges the bracket the gross area falls in, with the flat plan review beside it", () => {
    const atFloor = run("building", newDwelling(1_200));
    expect(componentTotal(atFloor, "BUILD-A-NEW-DWELLING")).toBe(14_600);
    expect(componentTotal(atFloor, "BUILD-A-PLAN-REVIEW")).toBe(14_600);
    expect(atFloor.totalCents).toBe(29_200);

    const example = run("building", newDwelling(2_000));
    expect(componentTotal(example, "BUILD-A-NEW-DWELLING")).toBe(40_000);
    expect(componentTotal(example, "BUILD-A-PLAN-REVIEW")).toBe(14_600);
    expect(example.totalCents).toBe(54_600);
    expect(formatCents(example.totalCents)).toBe("$546.00");

    // The plan review column is $146.00 in every bracket — not a share of the permit
    // and not a second rate on the area.
    expect(componentTotal(example, "BUILD-A-PLAN-REVIEW")).toBe(
      componentTotal(run("building", newDwelling(5_001)), "BUILD-A-PLAN-REVIEW"),
    );
    expect(run("building", newDwelling(5_001)).totalCents).toBe(95_600);
    expect(run("building", newDwelling(8_000)).totalCents).toBe(95_600);
  });

  it("prices multi-family per dwelling unit with a $450 plan review for the first unit", () => {
    const result = run("building", {
      units: 4,
      custom: { building_schedule: "multifamily" },
    });
    expect(componentTotal(result, "BUILD-B-MULTIFAMILY")).toBe(75_000);
    expect(componentTotal(result, "BUILD-B-PLAN-REVIEW")).toBe(45_000);
    expect(result.totalCents).toBe(120_000);
    expect(formatCents(result.totalCents)).toBe("$1,200.00");

    // $300.00 for the first unit and $150.00 for each one after it — not $300 per unit.
    const single = run("building", { units: 1, custom: { building_schedule: "multifamily" } });
    expect(componentTotal(single, "BUILD-B-MULTIFAMILY")).toBe(30_000);
  });

  it("adds the footing line only when a footing is required", () => {
    const without = run("building", { custom: { building_schedule: "accessory" } });
    expect(componentTotal(without, "BUILD-C-ACCESSORY")).toBe(5_000);
    expect(without.components.some((component) => component.code === "BUILD-C-FOOTING")).toBe(false);
    expect(without.totalCents).toBe(10_000);

    const withFooting = run("building", {
      custom: { building_schedule: "accessory", footing: true },
    });
    expect(componentTotal(withFooting, "BUILD-C-FOOTING")).toBe(5_000);
    expect(withFooting.totalCents).toBe(15_000);
    expect(formatCents(withFooting.totalCents)).toBe("$150.00");
  });

  it("prices renovations from the construction contract in two bands", () => {
    const small = run("building", {
      valuationCents: 500_000,
      custom: { building_schedule: "renovation_addition" },
    });
    expect(componentTotal(small, "BUILD-D-RENOVATION")).toBe(12_500);
    expect(componentTotal(small, "BUILD-D-PLAN-REVIEW")).toBe(12_500);
    expect(small.totalCents).toBe(25_000);

    const large = run("building", {
      valuationCents: 5_000_000,
      custom: { building_schedule: "renovation_addition", footing: true },
    });
    expect(componentTotal(large, "BUILD-D-RENOVATION")).toBe(25_000);
    expect(componentTotal(large, "BUILD-D-FOOTING")).toBe(5_000);
    expect(large.totalCents).toBe(42_500);
  });

  it("prices nonresidential work by contract value with its per-thousand increment", () => {
    const small = run("building", nonresidential(300_000));
    expect(componentTotal(small, "BUILD-E-UP-TO-5000")).toBe(10_400);
    expect(small.totalCents).toBe(20_800);

    // $786.00 + 300 increments of $4.32 over $100,000 = $2,082.00, plan review $400.00.
    const example = run("building", nonresidential(40_000_000));
    expect(componentTotal(example, "BUILD-E-100001-500000")).toBe(208_200);
    expect(componentTotal(example, "BUILD-E-PLAN-100001-500000")).toBe(40_000);
    expect(example.totalCents).toBe(248_200);
    expect(formatCents(example.totalCents)).toBe("$2,482.00");

    const huge = run("building", nonresidential(2_000_000_000));
    expect(componentTotal(huge, "BUILD-E-OVER-500000")).toBe(2_688_800);
    expect(componentTotal(huge, "BUILD-E-PLAN-OVER-500000")).toBe(130_000);
    expect(huge.totalCents).toBe(2_818_800);
  });

  it("carries Schedule E's three seams exactly as printed", () => {
    expect(DUR_SCHEDULE_E_BANDS).toHaveLength(5);

    // $50,000: $104.00 + 45 increments of $7.80 = $455.00. The band above opens at
    // $50,001 printing $456.00 — a dollar the schedule does not explain.
    const atTop = run("building", nonresidential(5_000_000));
    const justOver = run("building", nonresidential(5_000_100));
    expect(componentTotal(atTop, "BUILD-E-5001-50000")).toBe(45_500);
    expect(componentTotal(justOver, "BUILD-E-50001-100000")).toBe(46_260);
    expect(justOver.components[0]?.amountCents ?? 0).toBe(46_260);
    expect((justOver.components[0]?.amountCents ?? 0) - (atTop.components[0]?.amountCents ?? 0)).toBe(
      760,
    );

    // $100,000: $456.00 + 50 increments of $6.60 = $786.00, which is what the band above
    // prints as its base — this seam closes.
    expect(componentTotal(run("building", nonresidential(10_000_000)), "BUILD-E-50001-100000")).toBe(
      78_600,
    );
    expect(componentTotal(run("building", nonresidential(10_000_100)), "BUILD-E-100001-500000")).toBe(
      79_032,
    );

    // $500,000: $786.00 + 400 increments of $4.32 = $2,514.00. The band above opens at
    // $500,001 with $2,513.00 plus one $1.25 increment — 25 cents higher.
    expect(componentTotal(run("building", nonresidential(50_000_000)), "BUILD-E-100001-500000")).toBe(
      251_400,
    );
    expect(componentTotal(run("building", nonresidential(50_000_100)), "BUILD-E-OVER-500000")).toBe(
      251_425,
    );
  });

  it("keeps the plan review column flat across each nonresidential band", () => {
    // The increment is printed on the permit column alone: if plan review carried it,
    // the $50,001–$100,000 band would collect $560 at $100,000 and print $400 next.
    expect(componentTotal(run("building", nonresidential(10_000_000)), "BUILD-E-PLAN-50001-100000")).toBe(
      23_000,
    );
    expect(componentTotal(run("building", nonresidential(40_000_000)), "BUILD-E-PLAN-100001-500000")).toBe(
      40_000,
    );
    const published = DUR_SCHEDULE_E_BANDS.map((band) => band.planReviewCents);
    expect(published).toEqual([10_400, 10_400, 23_000, 40_000, 130_000]);
  });

  it("prices the Schedule F flats by the thing that decides them", () => {
    const demolitionSmall = run("building", {
      squareFootage: 3_000,
      custom: { building_item: "demolition" },
    });
    expect(componentTotal(demolitionSmall, "BUILD-F-DEMOLITION-UP-TO-5000")).toBe(7_500);

    const demolitionLarge = run("building", {
      squareFootage: 6_000,
      custom: { building_item: "demolition" },
    });
    expect(componentTotal(demolitionLarge, "BUILD-F-DEMOLITION-OVER-5000")).toBe(15_000);

    const roofingSmall = run("building", {
      valuationCents: 1_000_000,
      custom: { building_item: "roofing_commercial" },
    });
    expect(componentTotal(roofingSmall, "BUILD-F-ROOFING-COMMERCIAL-UP-TO-20000")).toBe(10_000);

    const roofingLarge = run("building", {
      valuationCents: 5_000_000,
      custom: { building_item: "roofing_commercial" },
    });
    expect(componentTotal(roofingLarge, "BUILD-F-ROOFING-COMMERCIAL-OVER-20000")).toBe(15_000);

    expect(run("building", { custom: { building_item: "deck" } }).totalCents).toBe(10_000);
    expect(run("building", { custom: { building_item: "moving" } }).totalCents).toBe(12_500);
  });

  it("prices nothing at all when no schedule is selected", () => {
    const result = run("building", { valuationCents: 40_000_000 });
    expect(result.components).toEqual([]);
    expect(result.totalCents).toBe(0);
  });
});

describe("the electrical permit — counts, and three floors in order", () => {
  it("prices house service flat by size", () => {
    expect(run("electrical", { custom: { electrical_service: "service_100_200" } }).totalCents).toBe(
      15_600,
    );
    expect(run("electrical", { custom: { electrical_service: "service_400" } }).totalCents).toBe(18_700);
  });

  it("covers the first ten outlets together and charges each one after that", () => {
    const ten = run("electrical", { custom: { outlets: 10 } });
    expect(componentTotal(ten, "ELEC-OUTLETS")).toBe(2_100);

    const eighteen = run("electrical", { custom: { outlets: 18 } });
    expect(componentTotal(eighteen, "ELEC-OUTLETS")).toBe(2_764);

    // $21.00 for the first ten, not ten times $21.00, and not $0.83 for all eighteen.
    expect(componentTotal(run("electrical", { custom: { outlets: 1 } }), "ELEC-OUTLETS")).toBe(2_100);
  });

  it("prices fixtures on their own row in the same shape", () => {
    expect(componentTotal(run("electrical", { fixtures: 12 }), "ELEC-FIXTURES")).toBe(2_266);
    expect(componentTotal(run("electrical", { fixtures: 5 }), "ELEC-FIXTURES")).toBe(2_100);
  });

  it("floors a small job at $65.00 rather than adding a second charge", () => {
    const small = run("electrical", { custom: { outlets: 3 } });
    expect(componentTotal(small, "ELEC-OUTLETS")).toBe(2_100);
    expect(componentTotal(small, "ELEC-MINIMUM-PERMIT")).toBe(4_400);
    expect(small.totalCents).toBe(6_500);
    expect(formatCents(small.totalCents)).toBe("$65.00");

    // A job that already clears the floor is not charged for it, and not shown a $0 line.
    const service = run("electrical", { custom: { electrical_service: "service_100_200" } });
    expect(service.components.some((component) => component.code === "ELEC-MINIMUM-PERMIT")).toBe(false);
    expect(service.totalCents).toBe(15_600);
  });

  it("reaches the rough-in floor as a second shortfall, never as two charges", () => {
    const residential = run("electrical", {
      occupancy: "residential",
      custom: { outlets: 3, rough_in: true },
    });
    expect(componentTotal(residential, "ELEC-MINIMUM-PERMIT")).toBe(4_400);
    expect(componentTotal(residential, "ELEC-MINIMUM-ROUGH-IN-RESIDENTIAL")).toBe(3_500);
    expect(residential.totalCents).toBe(10_000);
    expect(formatCents(residential.totalCents)).toBe("$100.00");

    const commercial = run("electrical", {
      occupancy: "commercial",
      custom: { outlets: 3, rough_in: true },
    });
    expect(componentTotal(commercial, "ELEC-MINIMUM-ROUGH-IN-COMMERCIAL")).toBe(8_500);
    expect(commercial.totalCents).toBe(15_000);
    expect(formatCents(commercial.totalCents)).toBe("$150.00");

    // $65 + $100 would be $165 if the floors were added rather than stacked.
    expect(residential.totalCents).not.toBe(16_500);
  });

  it("prices service equipment by ampacity when Schedule A house service is not chosen", () => {
    const upTo100 = run("electrical", { custom: { amperage: 100 } });
    expect(componentTotal(upTo100, "ELEC-SERVICE-EQUIPMENT")).toBe(3_400);

    const twoHundred = run("electrical", { custom: { amperage: 200 } });
    expect(componentTotal(twoHundred, "ELEC-SERVICE-EQUIPMENT")).toBe(4_097);

    // 450 A: $34.00 for the first 100, then four rounded 100-ampere increments at $6.97.
    const fourFifty = run("electrical", { custom: { amperage: 450 } });
    expect(componentTotal(fourFifty, "ELEC-SERVICE-EQUIPMENT")).toBe(6_188);
    expect(formatCents(fourFifty.totalCents)).toBe("$65.00");

    // The two service rows are alternatives: selecting Schedule A house service takes
    // the ampacity rule out of the calculation entirely.
    const houseService = run("electrical", {
      custom: { amperage: 200, electrical_service: "service_400" },
    });
    expect(houseService.components.some((component) => component.code === "ELEC-SERVICE-EQUIPMENT")).toBe(
      false,
    );
    expect(houseService.totalCents).toBe(18_700);
  });

  it("adds the $5.00 paper-application surcharge to the total, not to the floor", () => {
    const result = run("electrical", {
      custom: { outlets: 18, paper_application: true },
    });
    expect(componentTotal(result, "ELEC-OUTLETS")).toBe(2_764);
    expect(componentTotal(result, "ELEC-PAPER-SURCHARGE")).toBe(500);
    // 18 outlets plus the surcharge is still below the minimum: the floor is measured
    // against the permit fee, and the surcharge is added after it.
    expect(componentTotal(result, "ELEC-MINIMUM-PERMIT")).toBe(3_736);
    expect(result.totalCents).toBe(7_000);
    expect(formatCents(result.totalCents)).toBe("$70.00");
  });

  it("prices water heaters and sign circuits by count", () => {
    expect(componentTotal(run("electrical", { custom: { heaters: 3 } }), "ELEC-WATER-HEATERS")).toBe(
      3_270,
    );
    // First circuit $10.90, then $3.22 each: four circuits are $10.90 + 3 × $3.22.
    expect(componentTotal(run("electrical", { custom: { circuits: 4 } }), "ELEC-SIGN-CIRCUITS")).toBe(
      2_056,
    );
    expect(run("electrical", { custom: { electrical_item: "solar_residential" } }).totalCents).toBe(
      10_000,
    );
  });
});

describe("the plumbing permit — six scopes, minima on the rows", () => {
  it("prices a new dwelling as one flat amount", () => {
    const result = run("plumbing", { custom: { plumbing_schedule: "new_dwelling" } });
    expect(result.components).toHaveLength(1);
    expect(result.totalCents).toBe(17_000);
    expect(formatCents(result.totalCents)).toBe("$170.00");
  });

  it("floors the multi-family row at $127.00 and lets a larger job pay the rate", () => {
    const atFloor = run("plumbing", {
      fixtures: 12,
      custom: { plumbing_schedule: "multifamily" },
    });
    expect(componentTotal(atFloor, "PLUMB-B-MULTIFAMILY")).toBe(12_700);
    expect(atFloor.totalCents).toBe(12_700);

    const aboveFloor = run("plumbing", {
      fixtures: 40,
      custom: { plumbing_schedule: "multifamily" },
    });
    expect(componentTotal(aboveFloor, "PLUMB-B-MULTIFAMILY")).toBe(24_960);
    expect(formatCents(aboveFloor.totalCents)).toBe("$249.60");

    // The floor sits on the row the schedule prints it beside, not on the permit: it is
    // a `minimumCents` on this rule and there is no permit-level floor in the payload.
    expect(rulesFor("plumbing").some((rule) => rule.feeType === "permit_minimum")).toBe(false);
  });

  it("selects one of the two nonresidential minima by the water and sewer line", () => {
    const without = run("plumbing", {
      fixtures: 10,
      custom: { plumbing_schedule: "nonresidential" },
    });
    expect(componentTotal(without, "PLUMB-C-NONRESIDENTIAL")).toBe(18_700);
    expect(without.components.some((component) => component.code === "PLUMB-C-NONRESIDENTIAL-WATER-SEWER")).toBe(
      false,
    );

    const with_ = run("plumbing", {
      fixtures: 10,
      custom: { plumbing_schedule: "nonresidential", water_sewer: true },
    });
    expect(componentTotal(with_, "PLUMB-C-NONRESIDENTIAL-WATER-SEWER")).toBe(26_500);
    expect(with_.totalCents).toBe(26_500);

    // A job large enough to clear both minima pays the rate instead: 60 × $7.90.
    const many = run("plumbing", {
      fixtures: 60,
      custom: { plumbing_schedule: "nonresidential" },
    });
    expect(componentTotal(many, "PLUMB-C-NONRESIDENTIAL")).toBe(47_400);
  });

  it("prices an addition from its fixture bracket, plus the sewer and water line when asked", () => {
    const five = run("plumbing", { fixtures: 5, custom: { plumbing_schedule: "addition" } });
    expect(componentTotal(five, "PLUMB-D-FIXTURES-1-7")).toBe(9_400);
    expect(five.totalCents).toBe(9_400);

    const twelve = run("plumbing", { fixtures: 12, custom: { plumbing_schedule: "addition" } });
    expect(componentTotal(twelve, "PLUMB-D-FIXTURES-8-15")).toBe(11_900);

    const withSewer = run("plumbing", {
      fixtures: 12,
      custom: { plumbing_schedule: "addition", sewer_water: true },
    });
    expect(componentTotal(withSewer, "PLUMB-D-SEWER-WATER")).toBe(6_500);
    expect(withSewer.totalCents).toBe(18_400);
    expect(formatCents(withSewer.totalCents)).toBe("$184.00");

    // Above fifteen fixtures the schedule switches to a per-fixture rate.
    const twenty = run("plumbing", { fixtures: 20, custom: { plumbing_schedule: "addition" } });
    expect(componentTotal(twenty, "PLUMB-D-FIXTURES-OVER-15")).toBe(15_800);
  });

  it("prices fixture replacement in two brackets with the water heater permit beside it", () => {
    const three = run("plumbing", { fixtures: 3, custom: { plumbing_schedule: "replacement" } });
    expect(componentTotal(three, "PLUMB-E-REPLACEMENT-1-4")).toBe(6_500);

    const ten = run("plumbing", { fixtures: 10, custom: { plumbing_schedule: "replacement" } });
    expect(componentTotal(ten, "PLUMB-E-REPLACEMENT-5-PLUS")).toBe(6_860);

    const twelve = run("plumbing", { fixtures: 12, custom: { plumbing_schedule: "replacement" } });
    expect(formatCents(twelve.totalCents)).toBe("$82.32");

    const withHeater = run("plumbing", {
      fixtures: 3,
      custom: { plumbing_schedule: "replacement", water_heater: true },
    });
    expect(componentTotal(withHeater, "PLUMB-E-WATER-HEATER")).toBe(6_500);
    expect(withHeater.totalCents).toBe(13_000);
  });

  it("prices the four Schedule F flats and the paper surcharge", () => {
    expect(run("plumbing", { custom: { plumbing_item: "residential_sprinkler" } }).totalCents).toBe(
      17_000,
    );
    expect(run("plumbing", { custom: { plumbing_item: "mobile_unit" } }).totalCents).toBe(6_500);
    expect(run("plumbing", { custom: { plumbing_item: "modular_unit" } }).totalCents).toBe(7_800);
    expect(run("plumbing", { custom: { plumbing_item: "other_water_sewer" } }).totalCents).toBe(6_500);

    const paper = run("plumbing", {
      custom: { plumbing_schedule: "new_dwelling", paper_application: true },
    });
    expect(paper.totalCents).toBe(17_500);
    expect(formatCents(paper.totalCents)).toBe("$175.00");
  });
});

describe("published worked examples — computed, not transcribed", () => {
  function pageFor(slug: string) {
    const page = DUR_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
    if (!page) throw new Error(`no published permit page with slug "${slug}"`);
    return page;
  }

  const expectedTotals: Record<string, number> = {
    "building-permit-cost": 54_600,
    "electrical-permit-cost": 18_364,
    "plumbing-permit-cost": 17_000,
  };

  it("computes each page's worked example from the inputs the page stores", () => {
    for (const page of DUR_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      if (!example) continue;

      const result = calculatePermitFees(
        { ...example.inputs, asOf: AS_OF },
        rulesFor(page.permitTypeKey),
      );

      expect(result.totalCents, page.slug).toBe(expectedTotals[page.slug]);
      expect(result.components.length, page.slug).toBeGreaterThan(0);
      expect(result.warnings, page.slug).toEqual([]);
      expect(example.notes, page.slug).toContain(formatCents(result.totalCents));
    }
  });

  it("keeps every variation the prose quotes inside its worked example", () => {
    const variations: Array<{ slug: string; input: Omit<CalculationInput, "asOf"> }> = [
      { slug: "building-permit-cost", input: { units: 4, custom: { building_schedule: "multifamily" } } },
      {
        slug: "building-permit-cost",
        input: { custom: { building_schedule: "accessory", footing: true } },
      },
      { slug: "building-permit-cost", input: nonresidential(40_000_000) },
      { slug: "electrical-permit-cost", input: { custom: { outlets: 3 } } },
      {
        slug: "electrical-permit-cost",
        input: { occupancy: "residential", custom: { outlets: 3, rough_in: true } },
      },
      { slug: "electrical-permit-cost", input: { custom: { amperage: 450 } } },
      { slug: "plumbing-permit-cost", input: { fixtures: 12, custom: { plumbing_schedule: "multifamily" } } },
      { slug: "plumbing-permit-cost", input: { fixtures: 40, custom: { plumbing_schedule: "multifamily" } } },
      {
        slug: "plumbing-permit-cost",
        input: { fixtures: 12, custom: { plumbing_schedule: "addition", sewer_water: true } },
      },
      { slug: "plumbing-permit-cost", input: { fixtures: 12, custom: { plumbing_schedule: "replacement" } } },
    ];

    for (const { slug, input } of variations) {
      const page = pageFor(slug);
      const result = calculatePermitFees({ ...input, asOf: AS_OF }, rulesFor(page.permitTypeKey));
      expect(result.totalCents, `${slug} computed nothing for these inputs`).toBeGreaterThan(0);
      expect(page.workedExample?.notes, `${slug} ${formatCents(result.totalCents)}`).toContain(
        formatCents(result.totalCents),
      );
    }
  });

  it("shows the reader the inputs it calculated from", () => {
    for (const page of DUR_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      if (!example) continue;

      const rows = describeCalculationInput(example.inputs);
      // One row per top-level input, plus one per key inside `custom` — a table that
      // lists `custom` as one opaque line would tell a reader nothing.
      const expectedRows =
        Object.entries(example.inputs).filter(
          ([key, value]) => key !== "custom" && value !== undefined,
        ).length + Object.keys(example.inputs.custom ?? {}).length;
      expect(rows.length, `${page.slug} would render an empty inputs table`).toBe(expectedRows);
      for (const row of rows) {
        expect(row.value.length).toBeGreaterThan(0);
      }
    }
  });
});
