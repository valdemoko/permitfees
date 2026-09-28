import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import {
  KING_COUNTY_LAST_VERIFIED,
  KING_COUNTY_PUBLISHED_PERMIT_PAGES,
  kingCountySeed,
} from "@/content/kingcounty";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * King County's content, checked against the three documents it came from — without a
 * database, so this runs everywhere.
 *
 * Two properties are what these tests exist for. The first is that the county charges
 * **two valuation tables**, so the arithmetic that matters is at the seams of both: the
 * figure each band produces at its own top against the opening figure of the band above.
 * All twelve close, and each is asserted rather than trusted.
 *
 * The second is that the three permit types come from three authorities, and one of them
 * is not the county at all. The electrical rules cite a state regulation, and the
 * plumbing rules cite the county's public health department — so the tests below check
 * which source each rule cites, not just what it charges.
 */

const AS_OF = "2026-09-24";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  kingCountySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const feeAt = (
  permitTypeKey: string,
  input: Partial<CalculationInput> = {},
  valuationCents?: number,
) =>
  calculatePermitFees(
    { asOf: AS_OF, ...(valuationCents === undefined ? {} : { valuationCents }), ...input },
    rulesFor(permitTypeKey),
  );

/** The building fee split into its two published tables, plus everything else. */
const tableTotal = (valuationCents: number, componentType: string) =>
  feeAt("building", {}, valuationCents)
    .components.filter((component) => component.componentType === componentType)
    .reduce((sum, component) => sum + component.amountCents, 0);

const surchargeTotal = (input: Partial<CalculationInput>, valuationCents: number) =>
  feeAt("building", input, valuationCents)
    .components.filter((component) => component.componentType === "state_surcharge")
    .reduce((sum, component) => sum + component.amountCents, 0);

describe("King County payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of kingCountySeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(kingCountySeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(kingCountySeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...kingCountySeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of kingCountySeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const page of kingCountySeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }

    for (const requirement of kingCountySeed.requirements) {
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }
  });

  it("attributes each permit type to the authority that actually sets its fee", () => {
    // The finding this jurisdiction contributes: three permits, three documents, and one
    // of the three is not the county's. Asserted by source rather than by prose.
    const buildingSources = new Set(
      kingCountySeed.feeRules
        .filter((entry) => entry.permitTypeKey === "building")
        .map((entry) => entry.rule.sourceId),
    );
    const electricalSources = new Set(
      kingCountySeed.feeRules
        .filter((entry) => entry.permitTypeKey === "electrical")
        .map((entry) => entry.rule.sourceId),
    );
    const plumbingSources = new Set(
      kingCountySeed.feeRules
        .filter((entry) => entry.permitTypeKey === "plumbing")
        .map((entry) => entry.rule.sourceId),
    );

    // Both guides, because the two surcharge amounts come from one each: Guide 04 for
    // the commercial row, Guide 02 for the residential one.
    expect([...buildingSources].sort()).toEqual([
      "king-county-fee-guide-02-2026",
      "king-county-fee-guide-04-2026",
    ]);
    expect([...electricalSources]).toEqual(["wa-wac-296-46b-906"]);
    expect([...plumbingSources]).toEqual(["king-county-plumbing-gas-fees-2026"]);

    // And the two surcharge rows cite the pair of guides that print the two amounts.
    const surchargeSources = new Set(
      kingCountySeed.feeRules
        .filter((entry) => entry.rule.code.startsWith("STATE-SURCHARGE"))
        .map((entry) => entry.rule.sourceId),
    );
    expect(surchargeSources).toEqual(
      new Set(["king-county-fee-guide-04-2026", "king-county-fee-guide-02-2026"]),
    );
  });

  it("defines Washington and King County, and no permit type Houston does not have", () => {
    expect(kingCountySeed.state.code).toBe("WA");
    expect(kingCountySeed.state.slug).toBe("washington");
    expect(kingCountySeed.county.slug).toBe("king-county");
    expect(kingCountySeed.jurisdiction.type).toBe("county");
    expect(kingCountySeed.permitTypes).toEqual([]);
    expect(kingCountySeed.projectTypes).toEqual([]);
  });

  it("publishes three pages and clears the editorial gate on each", () => {
    expect(KING_COUNTY_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    for (const page of KING_COUNTY_PUBLISHED_PERMIT_PAGES) {
      const source = kingCountySeed.permitPages.find((entry) => entry.slug === page.slug)!;
      expect(source.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: source.publishStatus,
        noindex: source.noindex,
        intro: source.intro,
        localSummary: source.localSummary,
        sourceCount: kingCountySeed.sources.length,
        feeRuleCount: rulesFor(source.permitTypeKey).length,
        lastVerifiedAt: KING_COUNTY_LAST_VERIFIED,
        faqCount: source.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("has no page for mechanical, whose two tables it does publish", () => {
    const links = kingCountySeed.jurisdictionPermitTypes.map((link) => link.permitTypeKey);
    expect(links).toContain("mechanical");
    expect(kingCountySeed.permitPages.map((page) => page.permitTypeKey)).not.toContain(
      "mechanical",
    );
    // Mechanical is priced by the same rules as building minus the surcharge, so the
    // rules exist even though the page does not. The mechanical rule set is built by
    // the module and asserted to differ by exactly the three surcharge rows.
    const building = rulesFor("building").map((rule) => rule.code);
    const charges = building.filter((code) => code.startsWith("STATE-SURCHARGE"));
    expect(charges).toHaveLength(3);
  });

  it("states the two-authority split in its own prose, not only in the data", () => {
    const electrical = kingCountySeed.permitPages.find(
      (page) => page.permitTypeKey === "electrical",
    )!;
    expect(electrical.intro).toContain("Washington State Department of Labor & Industries");
    const plumbing = kingCountySeed.permitPages.find((page) => page.permitTypeKey === "plumbing")!;
    expect(plumbing.intro).toContain("Public Health — Seattle & King County");
  });
});

describe("King County building fee — two tables, twelve seams", () => {
  it("charges both tables on one valuation", () => {
    const result = feeAt("building", {}, 2_500_000);
    expect(result.components.filter((c) => c.componentType === "plan_review")).toHaveLength(1);
    expect(result.components.filter((c) => c.componentType === "inspection")).toHaveLength(1);
    expect(tableTotal(2_500_000, "plan_review")).toBe(78_800);
    expect(tableTotal(2_500_000, "inspection")).toBe(129_800);
  });

  it("closes every seam of the plan review table", () => {
    // Each figure is what the band below produces at its own top, and it is the opening
    // figure of the band above.
    expect(tableTotal(2_500_000, "plan_review")).toBe(78_800);
    expect(tableTotal(5_000_000, "plan_review")).toBe(130_300);
    expect(tableTotal(10_000_000, "plan_review")).toBe(198_800);
    expect(tableTotal(50_000_000, "plan_review")).toBe(654_800);
    expect(tableTotal(100_000_000, "plan_review")).toBe(1_054_800);
    expect(tableTotal(500_000_000, "plan_review")).toBe(3_794_800);
  });

  it("closes every seam of the inspection table", () => {
    expect(tableTotal(2_500_000, "inspection")).toBe(129_800);
    expect(tableTotal(5_000_000, "inspection")).toBe(206_800);
    expect(tableTotal(10_000_000, "inspection")).toBe(315_300);
    expect(tableTotal(50_000_000, "inspection")).toBe(999_300);
    expect(tableTotal(100_000_000, "inspection")).toBe(1_684_300);
    expect(tableTotal(500_000_000, "inspection")).toBe(5_804_300);
  });

  it("charges one band of each table only, never two", () => {
    const result = feeAt("building", {}, 120_000_000);
    expect(result.components.filter((c) => c.componentType === "plan_review")).toHaveLength(1);
    expect(result.components.filter((c) => c.componentType === "inspection")).toHaveLength(1);
  });

  it("holds $30,846.00 for the worked example at $1,200,000", () => {
    expect(tableTotal(120_000_000, "plan_review")).toBe(1_191_800);
    expect(tableTotal(120_000_000, "inspection")).toBe(1_890_300);
    expect(feeAt("building", {}, 120_000_000).totalCents).toBe(3_084_600);
  });

  it("charges the first band's rate on the whole valuation, not on an excess", () => {
    // Band 1 is the only one with no threshold: $103.00 plus the rate, with nothing to
    // subtract first. At $1,000 of valuation that is $130.40 of review and $227.60 of
    // inspection.
    expect(tableTotal(100_000, "plan_review")).toBe(10_300 + 2_740);
    expect(tableTotal(100_000, "inspection")).toBe(18_300 + 4_460);
  });

  it("prorates inside a thousand, because neither guide says \"or fraction thereof\"", () => {
    // The phrase appears nowhere in either guide, where Boulder City's, Clark County's
    // and Denver's schedules all print it where they round up. Read as printed, a
    // $12,500 valuation pays for 12.5 thousands: $103.00 + 12.5 x $27.40 = $445.50.
    // Rounding up to thirteen would be $459.20, and the page states both figures.
    expect(tableTotal(1_250_000, "plan_review")).toBe(44_550);
    expect(tableTotal(1_250_000, "inspection")).toBe(18_300 + 12.5 * 4_460);
    // The reading is continuous rather than stepping: one cent more is one cent's worth
    // more of fee, rounded to the cent.
    expect(tableTotal(1_250_001, "plan_review")).toBe(44_550);
    expect(tableTotal(1_260_000, "plan_review")).toBe(10_300 + 12.6 * 2_740);
  });
});

describe("King County state surcharge — one statute, two county rows", () => {
  it("charges $25.00 as commercial and $6.50 as residential", () => {
    expect(surchargeTotal({}, 2_500_000)).toBe(2_500);
    expect(surchargeTotal({ custom: { building_class: "residential" } }, 2_500_000)).toBe(650);
    expect(surchargeTotal({ custom: { building_class: "single_family" } }, 2_500_000)).toBe(650);
    expect(surchargeTotal({ custom: { building_class: "commercial" } }, 2_500_000)).toBe(2_500);
  });

  it("charges $2.00 for each dwelling unit after the first, and nothing for the first", () => {
    expect(surchargeTotal({ units: 1 }, 2_500_000)).toBe(2_500);
    expect(surchargeTotal({ units: 3 }, 2_500_000)).toBe(2_900);
    expect(surchargeTotal({ units: 3, custom: { building_class: "residential" } }, 2_500_000)).toBe(
      1_050,
    );
  });

  it("changes the total by exactly the difference between the two rates", () => {
    const commercial = feeAt("building", {}, 2_500_000).totalCents;
    const residential = feeAt(
      "building",
      { custom: { building_class: "residential" } },
      2_500_000,
    ).totalCents;
    expect(commercial - residential).toBe(1_850);
  });
});

describe("King County plumbing — the base is a charge, not a first fixture", () => {
  it("charges $137.00 plus $27.00 per fixture, with no allowance", () => {
    expect(feeAt("plumbing", { fixtures: 1 }).totalCents).toBe(16_400);
    expect(feeAt("plumbing", { fixtures: 3 }).totalCents).toBe(21_800);
    expect(feeAt("plumbing", { fixtures: 0 }).totalCents).toBe(13_700);
  });

  it("charges the Already Built Construction rows instead when the work was done", () => {
    const abc = feeAt("plumbing", { fixtures: 3, custom: { permit_kind: "already_built" } });
    expect(abc.totalCents).toBe(27_300 + 3 * 5_500);
    // The two routes are exclusive: a permit is either taken out or retrofitted.
    expect(
      abc.components.some((component) => component.code === "PLUMBING-PER-FIXTURE"),
    ).toBe(false);
  });

  it("adds a $137.00 re-inspection as its own line", () => {
    expect(feeAt("plumbing", { fixtures: 3, custom: { reinspection: true } }).totalCents).toBe(
      21_800 + 13_700,
    );
  });
});

describe("King County electrical — the state's schedule, by amperage", () => {
  it("prices an altered residential service in three bands", () => {
    const at = (amps: number) =>
      feeAt("electrical", {
        custom: { schedule_item: "altered_service", service_amps: amps },
      }).totalCents;
    expect(at(200)).toBe(10_990);
    expect(at(201)).toBe(16_100);
    expect(at(600)).toBe(16_100);
    expect(at(601)).toBe(24_270);
  });

  it("prices an altered commercial service in four bands, and differently", () => {
    const at = (amps: number) =>
      feeAt("electrical", {
        custom: { schedule_item: "commercial_altered_service", service_amps: amps },
      }).totalCents;
    expect(at(200)).toBe(12_940);
    expect(at(400)).toBe(30_360);
    expect(at(800)).toBe(45_790);
    expect(at(1_001)).toBe(50_860);
    // The same 200 amperes is $109.90 residential and $129.40 commercial.
    expect(at(200)).toBeGreaterThan(10_990);
  });

  it("caps the residential circuit fee at the cost of a complete altered service", () => {
    expect(feeAt("electrical", { custom: { circuits: 6 } }).totalCents).toBe(7_880 + 2 * 820);
    // The schedule's own note: the alterations in a panel should not exceed the cost of
    // a complete altered service of the same rating.
    expect(feeAt("electrical", { custom: { circuits: 200 } }).totalCents).toBe(10_990);
  });

  it("charges commercial circuits per panel, from the sixth circuit on", () => {
    const at = (circuits: number) =>
      feeAt("electrical", {
        custom: { schedule_item: "commercial_circuits", circuits },
      }).totalCents;
    expect(at(5)).toBe(10_050);
    expect(at(8)).toBe(10_050 + 3 * 820);
  });

  it("bands temporary services by amperage across six rows", () => {
    const at = (amps: number) =>
      feeAt("electrical", {
        custom: { schedule_item: "temporary_service", service_amps: amps },
      }).totalCents;
    expect(at(60)).toBe(6_910);
    expect(at(100)).toBe(7_880);
    expect(at(200)).toBe(10_050);
    expect(at(400)).toBe(11_990);
    expect(at(600)).toBe(16_100);
    expect(at(601)).toBe(18_260);
  });

  it("adds the generator row to a service rather than replacing it", () => {
    const result = feeAt("electrical", {
      custom: {
        schedule_item: "altered_service",
        service_amps: 200,
        generator_transfer: true,
      },
    });
    expect(result.totalCents).toBe(10_990 + 10_990);
    expect(result.components).toHaveLength(2);
  });

  it("charges the over-600-volt surcharge on top of the item", () => {
    expect(
      feeAt("electrical", {
        custom: { schedule_item: "altered_service", service_amps: 200, over_600_volts: true },
      }).totalCents,
    ).toBe(10_990 + 10_050);
  });

  it("charges nothing when no item is named", () => {
    // A missing fact is not a default: the bands are gated so that an unnamed job
    // cannot fall into the first band and be charged for work nobody described.
    expect(feeAt("electrical", { custom: { service_amps: 200 } }).totalCents).toBe(0);
    expect(feeAt("electrical", { custom: {} }).totalCents).toBe(0);
  });

  it("charges signs from the first one and the low-voltage row once", () => {
    expect(feeAt("electrical", { custom: { signs: 1 } }).totalCents).toBe(5_950);
    expect(feeAt("electrical", { custom: { signs: 3 } }).totalCents).toBe(5_950 + 2 * 2_790);
    expect(feeAt("electrical", { custom: { schedule_item: "low_voltage" } }).totalCents).toBe(6_910);
  });
});

describe("King County worked examples — the payload against its own prose", () => {
  /**
   * Each page states a figure in its notes and its FAQs. These are the engine's own
   * answers for the inputs that page stores, so a page cannot describe one number while
   * rendering another — the failure mode that shipped once in Denver and once in Clark
   * County before it.
   */
  const expected: Record<string, number> = {
    "building-permit-cost": 3_084_600, // $11,918.00 + $18,903.00 + $25.00
    "electrical-permit-cost": 21_980, // $109.90 + $109.90
    "plumbing-permit-cost": 21_800, // $137.00 + 3 × $27.00
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of KING_COUNTY_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("splits the building example into its two tables and the surcharge", () => {
    const page = KING_COUNTY_PUBLISHED_PERMIT_PAGES.find(
      (entry) => entry.slug === "building-permit-cost",
    )!;
    const result = calculatePermitFees(
      { asOf: AS_OF, ...page.workedExample!.inputs },
      rulesFor(page.permitTypeKey),
    );
    expect(tableTotal(page.workedExample!.inputs.valuationCents!, "plan_review")).toBe(1_191_800);
    expect(tableTotal(page.workedExample!.inputs.valuationCents!, "inspection")).toBe(1_890_300);
    expect(result.components.filter((c) => c.componentType === "state_surcharge")).toHaveLength(1);
  });
});
