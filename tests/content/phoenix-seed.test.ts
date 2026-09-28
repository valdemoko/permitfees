import { describe, expect, it } from "vitest";

import { houstonSeed } from "@/content/houston";
import { PHOENIX_PUBLISHED_PERMIT_PAGES, phoenixSeed } from "@/content/phoenix";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";

/**
 * Phoenix's content, checked against the document it came from — without a
 * database, so this runs everywhere.
 *
 * Three kinds of check live here:
 *
 *  1. **The payload is internally complete.** Every rule cites a source, a permit
 *     type and a schedule that exist in the same payload or a sibling's; every
 *     published page clears the editorial gate with what the payload provides.
 *  2. **The arithmetic is the City's.** Table A's seven published rows are
 *     boundary values, and the City's own worked example — $250,500 -> a $2,512
 *     permit fee — is recomputed here.
 *  3. **The capability Phoenix needed is used by Phoenix and nowhere else.** The
 *     `permit_fee` basis is the new engine primitive; this asserts it is confined
 *     to the two rules that page describes, so a future jurisdiction cannot adopt
 *     it by accident and change a published total.
 */

const AS_OF = "2026-09-24";

describe("Phoenix payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of phoenixSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources, permit types and schedules the payload defines", () => {
    const sourceKeys = new Set(phoenixSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(phoenixSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set([
      ...phoenixSeed.permitTypes.map((type) => type.key),
      ...houstonSeed.permitTypes.map((type) => type.key),
    ]);

    for (const entry of phoenixSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of phoenixSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of phoenixSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
    }

    for (const requirement of phoenixSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }

    for (const verification of phoenixSeed.verifications) {
      if (verification.sourceKey) {
        expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
      }
    }
  });

  it("defines Arizona and Maricopa County, but no permit type Houston does not have", () => {
    // Phoenix is the first jurisdiction outside Texas, so it DOES own its state and
    // county rows. Permit types stay global: "the building permit" is one concept.
    expect(phoenixSeed.state.code).toBe("AZ");
    expect(phoenixSeed.state.fipsCode).toBe("04");
    expect(phoenixSeed.county.fipsCode).toBe("04013");
    expect(phoenixSeed.jurisdiction.stateKey).toBe("az");
    expect(phoenixSeed.permitTypes).toEqual([]);
    expect(phoenixSeed.projectTypes).toEqual([]);
  });

  it("publishes three pages: the building permit and the two trades the schedule prices", () => {
    expect(PHOENIX_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(phoenixSeed.permitPages.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    // Mechanical is the one that does not clear the bar, and this is the assertion
    // that says so rather than leaving it to a comment: the schedule prices no
    // mechanical work, only periodic inspections of refrigeration systems, and a
    // periodic inspection is not a permit.
    expect(phoenixSeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(
      false,
    );
    expect(phoenixSeed.permitPages.some((page) => page.permitTypeKey === "demolition")).toBe(
      false,
    );
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of PHOENIX_PUBLISHED_PERMIT_PAGES) {
      const rulesInEffect = phoenixSeed.feeRules
        .filter((entry) => entry.permitTypeKey === page.permitTypeKey)
        .map((entry) => entry.rule)
        .filter((rule) => rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: phoenixSeed.sources.filter((source) => source.isPrimary).length,
        feeRuleCount: rulesInEffect.length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.publishable).toBe(true);
      expect(page.intro.length).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
    }
  });

  it("gives every published page a unique title, description and a single H1", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of PHOENIX_PUBLISHED_PERMIT_PAGES) {
      expect(page.seoTitle.trim().length).toBeGreaterThan(0);
      expect(page.seoDescription.trim().length).toBeGreaterThan(0);
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }
  });

  it("dates every source and every verification with the day it was actually read", () => {
    // The date is the research pass's, not "today". It is the same day for this
    // jurisdiction because every document was fetched live in one pass.
    for (const source of phoenixSeed.sources) {
      expect(source.retrievedAt).toBe("2026-09-24");
    }
    for (const verification of phoenixSeed.verifications) {
      expect(verification.verifiedAt).toBe("2026-09-24");
    }
  });

  it("records the unreadable valuation table as unread rather than as verified", () => {
    const table = phoenixSeed.sources.find(
      (source) => source.key === "phoenix-building-valuation-table",
    );
    expect(table).toBeDefined();
    // The PDF has no text layer and was never read; lastVerifiedAt is the date the
    // document's existence, URL and hash were confirmed — no rate came from it.
    expect(table?.lastVerifiedAt).toBe("2026-09-24");
    expect(table?.notes).toContain("NOT read");

    const verification = phoenixSeed.verifications.find(
      (entry) => entry.entityKey === "phoenix-building-valuation-table",
    );
    expect(verification?.status).toBe("needs_review");
  });
});

describe("Phoenix Table A — the City's own figures", () => {
  // The building permit's rules only. Table A is shared with the two trade permit
  // types, so taking every row in the payload would compute it three times — which is
  // exactly what the first version of this file did after the trade pages landed.
  const rules = phoenixSeed.feeRules
    .filter((entry) => entry.permitTypeKey === "building")
    .map((entry) => entry.rule);
  const baseAt = (valuationCents: number): number => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents }, rules);
    return result.components.find((component) => component.code === "TABLE-A")?.amountCents ?? -1;
  };

  const publishedRows: Array<{ valuation: number; cents: number; row: string }> = [
    { valuation: 1_000, cents: 19_500, row: "$195 Base fee only" },
    { valuation: 10_000, cents: 30_300, row: "$303 on first $10,000" },
    { valuation: 50_000, cents: 70_300, row: "$703 on first $50,000" },
    { valuation: 200_000, cents: 205_300, row: "$2,053 on first $200,000" },
    { valuation: 1_000_000, cents: 925_300, row: "$9,253 on first $1,000,000" },
    { valuation: 10_000_000, cents: 5_425_300, row: "$54,253 on first $10,000,000" },
  ];

  for (const { valuation, cents, row } of publishedRows) {
    it(`reproduces the row "${row}"`, () => {
      expect(baseAt(valuation * 100)).toBe(cents);
    });
  }

  it("reproduces the City's own worked example, valuation $250,500", () => {
    // S1: "$2,053 base fee plus $459 (51 x $9) on the project valuation = Total
    // permit fee cost of $2,512".
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 25_050_000, workType: "new_construction" },
      rules,
    );

    const base = result.components.find((component) => component.code === "TABLE-A");
    const review = result.components.find((component) => component.code === "PLAN-REVIEW-80");

    expect(base?.amountCents).toBe(251_200);
    expect(review?.amountCents).toBe(200_960);
    expect(result.totalCents).toBe(452_160);
  });

  it("charges only the base fee below the plan review threshold", () => {
    // Item 1.b: no plan review fee under $5,000 at the counter, so a $4,000 project
    // is the table alone: $195 plus three $12 increments.
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 400_000 }, rules);
    expect(result.components.map((component) => component.code)).toEqual(["TABLE-A"]);
    expect(result.totalCents).toBe(23_100);
  });

  it("lets the total fall at the $50,000 plan review step, as the schedule does", () => {
    const atBoundary = calculatePermitFees({ asOf: AS_OF, valuationCents: 5_000_000 }, rules);
    const justOver = calculatePermitFees({ asOf: AS_OF, valuationCents: 5_000_100 }, rules);

    // $50,000: $703 permit fee + 100% plan review = $1,406.
    expect(atBoundary.totalCents).toBe(140_600);
    // $50,001: $712 permit fee + 80% plan review = $1,281.60. The project grew and
    // the permit got cheaper.
    expect(justOver.totalCents).toBe(128_160);
    expect(justOver.totalCents).toBeLessThan(atBoundary.totalCents);
  });
});

describe("the permit_fee basis is confined to the rules that need it", () => {
  it("is used only by Phoenix's two plan review rules", () => {
    const using = phoenixSeed.feeRules
      .filter((entry) => {
        const config = entry.rule.config as { basis?: string };
        return config.basis === "permit_fee";
      })
      .map((entry) => entry.rule.code)
      .sort();

    expect(using).toEqual(["PLAN-REVIEW-100", "PLAN-REVIEW-80"]);
  });

  it("publishes the $195 minimum on both plan review rules, as the schedule does", () => {
    for (const code of ["PLAN-REVIEW-100", "PLAN-REVIEW-80"]) {
      const rule = phoenixSeed.feeRules.find((entry) => entry.rule.code === code)?.rule;
      expect(rule?.minimumCents, code).toBe(19_500);
      expect(rule?.componentType, code).toBe("plan_review");
      expect(rule?.status, code).toBe("active");
    }
  });

  it("models three building rules and no others", () => {
    // The $98 water heater and fence minimum, the $234 pool minimum with its $30
    // surcharge, the hourly review services and the event fees are all published and
    // all deliberately absent: the schedule does not say how the two minima combine
    // with the base charge, so charging either reading would be a guess.
    const building = phoenixSeed.feeRules
      .filter((entry) => entry.permitTypeKey === "building")
      .map((entry) => entry.rule.code);

    expect(building).toEqual(["TABLE-A", "PLAN-REVIEW-100", "PLAN-REVIEW-80"]);
  });
});

describe("Phoenix trade permits — the fees the schedule does publish for a trade", () => {
  const rulesFor = (permitTypeKey: string) =>
    phoenixSeed.feeRules
      .filter((entry) => entry.permitTypeKey === permitTypeKey)
      .map((entry) => entry.rule);

  function total(permitTypeKey: string, input: Record<string, unknown>): number {
    return calculatePermitFees({ asOf: AS_OF, ...input }, rulesFor(permitTypeKey)).totalCents;
  }

  it("models four rules on each trade, and no per-item trade rate", () => {
    expect(rulesFor("electrical").map((rule) => rule.code)).toEqual([
      "TABLE-A",
      "METER-ELECTRIC-ADDITIONAL",
      "TEMPORARY-POWER",
      "REINSPECTION",
    ]);
    expect(rulesFor("plumbing").map((rule) => rule.code)).toEqual([
      "TABLE-A",
      "METER-GAS-WATER-ADDITIONAL",
      "BACKFLOW-DEVICES",
      "REINSPECTION",
    ]);

    // What is still absent, asserted rather than described: no per-unit rule in the
    // whole payload reads an outlet, a fixture, a circuit or a panel.
    const kinds = phoenixSeed.feeRules
      .filter((entry) => entry.rule.feeType === "per_unit")
      .map((entry) => (entry.rule.config as { unit?: string }).unit);
    expect([...new Set(kinds)].sort()).toEqual(["backflow_devices", "meters"]);
  });

  it("includes one meter of each type and charges $98 for each one after it", () => {
    // The row that would have been misread: "First Gas, Electric, or Water Meter — No
    // additional fee (included with the permit fee for one meter of each type)".
    // No valuation, so Table A cannot be computed and drops out as a missing input:
    // these assertions are about the meter arithmetic alone.
    const meters = (count: number) => total("electrical", { custom: { meters: count } });

    expect(meters(1)).toBe(0);
    expect(meters(2)).toBe(9_800);
    expect(meters(3)).toBe(19_600);
    // The charge is per utility: three meters are two chargeable meters, and a rule
    // with no allowance would have charged $294 here.
    expect(meters(3)).not.toBe(29_400);
  });

  it("charges backflow devices $195 for the first and $98 for each one after", () => {
    const devices = (count: number) =>
      total("plumbing", { custom: { backflow_devices: count } });

    expect(devices(1)).toBe(19_500);
    expect(devices(2)).toBe(29_300);
    expect(devices(3)).toBe(39_100);
  });

  it("computes the electrical worked example", () => {
    // $383 Table A + $196 for three meters (two chargeable) + $195 temporary power.
    expect(
      total("electrical", {
        valuationCents: 1_800_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, temporary_power: true },
      }),
    ).toBe(77_400);
  });

  it("computes the plumbing worked example", () => {
    // $603 Table A + $196 for three meters + $391 for three backflow devices.
    expect(
      total("plumbing", {
        valuationCents: 4_000_000,
        workType: "new_construction",
        occupancy: "commercial",
        custom: { meters: 3, backflow_devices: 3 },
      }),
    ).toBe(119_000);
  });

  it("charges no re-inspection unless one is selected", () => {
    // The initial inspection and the first correction visit are included in the
    // permit fee, so an unconditional $195 would overstate every job on the site.
    expect(total("electrical", { valuationCents: 1_800_000 })).toBe(38_300);
    expect(total("electrical", { valuationCents: 1_800_000, custom: { reinspection: true } })).toBe(
      38_300 + 19_500,
    );
  });

  it("does not charge plan review on a trade permit, because the schedule does not", () => {
    // The review rules are scoped in their own words to new construction, additions
    // and remodels of a building. Attaching them here would multiply an inference.
    for (const permitTypeKey of ["electrical", "plumbing"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(codes, permitTypeKey).not.toContain("PLAN-REVIEW-100");
      expect(codes, permitTypeKey).not.toContain("PLAN-REVIEW-80");
    }
  });
});
