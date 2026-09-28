import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import { kingCountySeed } from "@/content/kingcounty";
import { SEATTLE_LAST_VERIFIED, SEATTLE_PUBLISHED_PERMIT_PAGES, seattleSeed } from "@/content/seattle";
import { calculatePermitFees, validateFeeRule, type CalculationInput } from "@/lib/calc";
import type { FeeRuleRecord } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Seattle's content, checked against the fee subtitle it came from — without a database.
 *
 * Three properties are what these tests exist for.
 *
 * 1. **The fee is an index charged twice.** Table D-1 returns a Development Fee Index
 *    and Table D-2 makes the permit fee 100% of it and the plan review fee 100% of the
 *    same index, so the two components must be equal at every valuation — and the index
 *    has to close at its seams, because a seam error would be paid twice.
 * 2. **The technology fee is 5% of the whole bill**, not of one component. It reads the
 *    engine's `fee_subtotal` basis, and the tests assert the figure it produces against
 *    the sum it is supposed to be a percentage of.
 * 3. **Plumbing is not Seattle's.** The rules are the county's records, imported
 *    rather than restated, so the two pages cannot drift apart.
 */

const AS_OF = "2026-09-24";

const rulesFor = (permitTypeKey: string): FeeRuleRecord[] =>
  seattleSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);

const componentTotal = (
  permitTypeKey: string,
  componentType: string,
  input: Partial<CalculationInput> = {},
  valuationCents?: number,
) =>
  calculatePermitFees(
    { asOf: AS_OF, ...(valuationCents === undefined ? {} : { valuationCents }), ...input },
    rulesFor(permitTypeKey),
  )
    .components.filter((component) => component.componentType === componentType)
    .reduce((sum, component) => sum + component.amountCents, 0);

const buildingTotal = (valuationCents: number, input: Partial<CalculationInput> = {}) =>
  calculatePermitFees({ asOf: AS_OF, valuationCents, ...input }, rulesFor("building")).totalCents;

/** The index, read off the run rather than recomputed: it is the base component. */
const indexAt = (valuationCents: number) =>
  componentTotal("building", "base", {}, valuationCents);

describe("Seattle payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of seattleSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(seattleSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(seattleSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...seattleSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of seattleSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) {
        expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
      }
    }

    for (const page of seattleSeed.permitPages) {
      expect(permitTypeKeys, page.permitTypeKey).toContain(page.permitTypeKey);
    }
  });

  it("defines Washington and King County again, without opening a second state row", () => {
    expect(seattleSeed.state.code).toBe(kingCountySeed.state.code);
    expect(seattleSeed.county.key).toBe(kingCountySeed.county.key);
    expect(seattleSeed.jurisdiction.type).toBe("city");
    expect(seattleSeed.permitTypes).toEqual([]);
    expect(seattleSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages and clears the editorial gate on each", () => {
    expect(SEATTLE_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    for (const page of SEATTLE_PUBLISHED_PERMIT_PAGES) {
      const source = seattleSeed.permitPages.find((entry) => entry.slug === page.slug)!;
      expect(source.intro.length, page.slug).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      const verdict = evaluatePublishability({
        publishStatus: source.publishStatus,
        noindex: source.noindex,
        intro: source.intro,
        localSummary: source.localSummary,
        sourceCount: seattleSeed.sources.length,
        feeRuleCount: rulesFor(source.permitTypeKey).length,
        lastVerifiedAt: SEATTLE_LAST_VERIFIED,
        faqCount: source.faqs?.length ?? 0,
        asOf: AS_OF,
      });
      expect(verdict.publishable, `${page.slug}: ${verdict.failures.join("; ")}`).toBe(true);
    }
  });

  it("imports the county's plumbing rules rather than restating them", () => {
    // The City's own code sends plumbing fees to the county health department, so the
    // two payloads must carry the *same* rule records — not two transcriptions of one
    // schedule, which is how a pair of pages ends up disagreeing about a fee.
    const seattlePlumbing = rulesFor("plumbing");
    const countyPlumbing = kingCountySeed.feeRules
      .filter((entry) => entry.permitTypeKey === "plumbing")
      .map((entry) => entry.rule);

    expect(seattlePlumbing.map((rule) => rule.code).sort()).toEqual(
      countyPlumbing.map((rule) => rule.code).sort(),
    );
    for (const rule of seattlePlumbing) {
      const twin = countyPlumbing.find((entry) => entry.code === rule.code)!;
      expect(rule.config, rule.code).toEqual(twin.config);
      expect(rule.sourceId, rule.code).toBe(twin.sourceId);
    }
  });
});

describe("Seattle building fee — one index, charged twice", () => {
  it("charges the permit fee and the plan review fee as equal readings of the index", () => {
    for (const valuation of [100_000, 2_500_000, 50_000_000, 200_000_000, 2_000_000_000]) {
      const base = componentTotal("building", "base", {}, valuation);
      const review = componentTotal("building", "plan_review", {}, valuation);
      expect(review, `valuation ${valuation}`).toBe(base);
      expect(indexAt(valuation)).toBeGreaterThan(0);
    }
  });

  const ONE_AND_A_HALF_MILLION = 150_000_000;
  const TWO_MILLION = 200_000_000;

  it("closes the seams of the index, and rounds up to the next thousand past them", () => {
    // The band opening at $1,500,001 starts at $11,734.00 and the band below produces
    // exactly that at $1,500,000; the same holds at $2,000,000 for $14,984.00. One cent
    // beyond a seam, the table's own words apply to the new band — "or fraction
    // thereof" — so the next whole thousand is charged.
    expect(indexAt(ONE_AND_A_HALF_MILLION)).toBe(1_173_400);
    expect(indexAt(ONE_AND_A_HALF_MILLION + 1)).toBe(1_173_400 + 650);
    expect(indexAt(TWO_MILLION)).toBe(1_498_400);
    expect(indexAt(TWO_MILLION + 1)).toBe(1_498_400 + 600);
  });

  it("takes the review to 40% of the index for a subject-to-field-inspection project", () => {
    expect(buildingTotal(TWO_MILLION)).toBe(1_498_400 + 1_498_400 + 149_840 + 650);
    expect(
      componentTotal(
        "building",
        "plan_review",
        { custom: { review_type: "stfi" } },
        TWO_MILLION,
      ),
    ).toBe(599_360);
  });

  it("charges the technology fee as 5% of the components it applies to", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: TWO_MILLION, custom: { building_class: "commercial" } },
      rulesFor("building"),
    );
    const technology = result.components.filter((c) => c.componentType === "technology");
    const subject = result.components
      .filter((c) => c.componentType === "base" || c.componentType === "plan_review")
      .reduce((sum, c) => sum + c.amountCents, 0);
    expect(technology).toHaveLength(1);
    expect(technology[0]!.amountCents).toBe(subject / 20);
    expect(result.totalCents).toBe(1_498_400 + 1_498_400 + 149_840 + 2_500);
  });

  it("charges the state fee at $6.50 or $25.00, and $2.00 per additional unit", () => {
    const residential = componentTotal("building", "state_surcharge", {}, TWO_MILLION);
    const commercial = componentTotal(
      "building",
      "state_surcharge",
      { custom: { building_class: "commercial" } },
      TWO_MILLION,
    );
    expect(residential).toBe(650);
    expect(commercial).toBe(2_500);
    expect(componentTotal("building", "state_surcharge", { units: 4 }, TWO_MILLION)).toBe(
      650 + 3 * 200,
    );
  });
});

describe("Seattle Table D-15 — items, not valuations", () => {
  const electrical = (
    custom: Record<string, string | number | boolean>,
    counts: Record<string, number> = {},
  ) =>
    calculatePermitFees(
      { asOf: AS_OF, custom: { ...custom, ...counts } },
      rulesFor("electrical"),
    );

  it("prices a service by size and adds the administrative fee once", () => {
    expect(electrical({ electrical_item: "service", service_amps: 100 }).totalCents).toBe(
      14_600 + 5_548 + Math.round((14_600 + 5_548) / 20),
    );
    expect(electrical({ electrical_item: "service", service_amps: 200 }).totalCents).toBe(36_485);
    expect(electrical({ electrical_item: "service", service_amps: 350 }).totalCents).toBe(36_500 + 5_548 + 2_102);
  });

  it("leaves 126 to 149 amperes unpublished rather than inventing a band", () => {
    // The table jumps from \"Up to 125 amperes\" to \"150 to 200 amperes\".
    const result = electrical({ electrical_item: "service", service_amps: 130 });
    expect(
      result.components.filter((component) => component.code.startsWith("ELEC-SERVICE")),
    ).toHaveLength(0);
  });

  it("prices a branch circuit per circuit, banded by the circuit's amperage", () => {
    expect(
      electrical({ electrical_item: "branch_circuit", service_amps: 20 }, { circuits: 1 })
        .totalCents,
    ).toBe(2_628 + 5_548 + Math.round((2_628 + 5_548) / 20));
    expect(
      electrical({ electrical_item: "branch_circuit", service_amps: 20 }, { circuits: 6 })
        .totalCents,
    ).toBe(6 * 2_628 + 5_548 + Math.round((6 * 2_628 + 5_548) / 20));
    // The same amperage on the service row is a different price: 200 A is a $146.00
    // branch circuit and a $292.00 service.
    expect(
      electrical({ electrical_item: "branch_circuit", service_amps: 200 }, { circuits: 1 })
        .totalCents,
    ).toBeLessThan(electrical({ electrical_item: "service", service_amps: 200 }).totalCents);
  });

  it("keeps the two items from being charged together", () => {
    const result = electrical(
      { electrical_item: "branch_circuit", service_amps: 200 },
      { circuits: 1 },
    );
    expect(
      result.components.filter((component) => component.code.startsWith("ELEC-SERVICE")),
    ).toHaveLength(0);
  });

  it("charges low-voltage per control unit and per device", () => {
    expect(electrical({ electrical_item: "low_voltage" }).totalCents).toBe(1_752 + 5_548 + Math.round((1_752 + 5_548) / 20));
    const withDevices = electrical({ electrical_item: "low_voltage" }, { connections: 8 });
    expect(withDevices.totalCents).toBe(
      1_752 + 8 * 292 + 5_548 + Math.round((1_752 + 8 * 292 + 5_548) / 20),
    );
  });

  it("charges no administrative fee when no item carries one", () => {
    expect(electrical({}).totalCents).toBe(0);
  });

  it("puts the technology fee on the electrical bill too", () => {
    const result = electrical({ electrical_item: "service", service_amps: 200 });
    const technology = result.components.filter((component) => component.componentType === "technology");
    expect(technology).toHaveLength(1);
    expect(technology[0]!.amountCents).toBe(Math.round((29_200 + 5_548) / 20));
  });
});

describe("Seattle worked examples — the payload against its own prose", () => {
  /**
   * The figures the pages state in their notes. Computed here from the stored inputs, so
   * a page cannot describe one number while rendering another.
   */
  const expected: Record<string, number> = {
    "building-permit-cost": 3_149_140, // $14,984.00 × 2 + $1,498.40 + $25.00
    "electrical-permit-cost": 36_485, // $292.00 + $55.48 + $17.37
    "plumbing-permit-cost": 24_500, // $137.00 + 4 × $27.00
  };

  it("computes the figure each page's notes describe", () => {
    for (const page of SEATTLE_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );
      expect(result.totalCents, page.slug).toBe(expected[page.slug]);
    }
  });

  it("states the subject-to-field-inspection variant the same way the engine computes it", () => {
    const page = SEATTLE_PUBLISHED_PERMIT_PAGES.find(
      (entry) => entry.slug === "building-permit-cost",
    )!;
    const inputs = page.workedExample!.inputs;
    const stfi = calculatePermitFees(
      { asOf: AS_OF, ...inputs, custom: { ...inputs.custom, review_type: "stfi" } },
      rulesFor("building"),
    );
    // $14,984.00 + $5,993.60 + 5% of those + $25.00 = $22,051.48, which is the figure
    // the page's notes print.
    expect(stfi.totalCents).toBe(2_205_148);
  });
});
