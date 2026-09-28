import { describe, expect, it } from "vitest";

import { HOUSTON_PUBLISHED_PERMIT_PAGES, houstonSeed } from "@/content/houston";
import {
  HOUSTON_PLUMBING_SEPTIC,
  HOUSTON_PLUMBING_YARD_LIGHT,
} from "@/content/houston/fee-rules";
import { calculatePermitFees, describeCalculationInput } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { formatCents } from "@/lib/format";

/**
 * The published worked examples, computed.
 *
 * The pages do not store their totals — they store inputs and run the engine over
 * the rules read from the database. That makes these tests the contract for what a
 * reader sees: if a rate changes and a published figure moves, this file says so
 * before the page does.
 *
 * Every expected value below is the City of Houston's own arithmetic, quoted from
 * its published schedule (Department HPW, `As Of 01/01/2026`, read 2026-09-23):
 *
 *   building, $400,000   -> $1,536.83 + (100 x $4.36)      = $1,972.83
 *   building, $100,000   ->    $47.00 +  (93 x $5.36)      =   $545.48
 *   plumbing, 10 fixtures->    $34.24 +   (7 x $11.41)     =   $114.11
 *   electrical, 1 loop   ->    $94.00                      =   $147.60
 *              40 outlets     + (40 x $1.34) $53.60
 *
 * The rules are taken from the same module the seed writes to PostgreSQL, so a
 * page cannot compute from a rule the database does not have, or the other way
 * round.
 */

/** The date every amount in the City-Wide Fee Schedule carries, plus the read date. */
const AS_OF = "2026-09-23";

function pageFor(slug: string) {
  const page = HOUSTON_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`no published permit page with slug "${slug}"`);
  return page;
}

/** Every rule the seed attaches to a permit type, exactly as the seed writes them. */
function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return houstonSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function exampleInputs(slug: string): Omit<CalculationInput, "asOf"> {
  const example = pageFor(slug).workedExample;
  if (!example) throw new Error(`${slug} has no worked example to compute`);
  return example.inputs;
}

function compute(slug: string, inputs?: Omit<CalculationInput, "asOf">) {
  const page = pageFor(slug);
  return calculatePermitFees(
    { ...(inputs ?? exampleInputs(slug)), asOf: AS_OF },
    rulesFor(page.permitTypeKey),
  );
}

describe("published worked examples — computed, not transcribed", () => {
  it("matches the City's published arithmetic for each published page", () => {
    const expected: Record<string, number> = {
      "building-permit-cost": 197_283,
      "electrical-permit-cost": 14_760,
      "plumbing-permit-cost": 11_411,
    };

    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const want = expected[page.slug];
      expect(want, `no expected total declared for ${page.slug}`).toBeDefined();
      if (want === undefined) continue;

      const result = compute(page.slug);
      expect(result.totalCents).toBe(want);
      // A page renders a worked example only when the engine produced something.
      expect(result.components.length).toBeGreaterThan(0);
    }
  });

  it("reproduces the Phase 1 regression figures through the full rule set", () => {
    // These four are the figures the engine was accepted against. Computing them
    // here — with every rule the seed attaches to the permit type, including the
    // draft ones the page must leave out — proves the totals do not depend on a
    // hand-picked subset of rules.
    expect(formatCents(compute("building-permit-cost", { valuationCents: 10_000_000 }).totalCents)).toBe(
      "$545.48",
    );
    expect(formatCents(compute("building-permit-cost", { valuationCents: 40_000_000 }).totalCents)).toBe(
      "$1,972.83",
    );
    expect(formatCents(compute("plumbing-permit-cost", { fixtures: 10 }).totalCents)).toBe("$114.11");
    expect(formatCents(compute("electrical-permit-cost", { custom: { outlets: 40 } }).totalCents)).toBe(
      "$147.60",
    );
  });

  it("charges per item on the electrical example, with the outlet count named", () => {
    // The regression this guards: the outlet row used to read the plumbing fixture
    // count, so the breakdown would have described 40 outlets as 40 fixtures.
    const result = compute("electrical-permit-cost");
    const outlet = result.components.find((component) => component.code === "ELEC-118.6.1-OUTLET");

    expect(outlet).toBeDefined();
    expect(outlet?.amountCents).toBe(5_360);
    expect(outlet?.steps.map((step) => step.label).join(" ")).toContain("outlet");
    expect(outlet?.steps.map((step) => step.label).join(" ")).not.toContain("fixture");
  });

  it("prices a septic tank from its own count, never from openings", () => {
    // §118.5.4 (septic) used to read the `openings` count that §118.5.3 (yard
    // light or BBQ grill) reads, so one count would have priced both rows. Both
    // rules ship on the plumbing permit type, which is exactly where it bites.
    const rules = [HOUSTON_PLUMBING_YARD_LIGHT, HOUSTON_PLUMBING_SEPTIC];

    const openings = calculatePermitFees({ asOf: AS_OF, custom: { openings: 2 } }, rules);
    expect(openings.appliedRuleIds).toEqual(["hou-plumb-yardlight-118.5.3"]);
    // $34.24 for the first opening, plus $11.41 for the second.
    expect(openings.totalCents).toBe(4_565);

    const tanks = calculatePermitFees({ asOf: AS_OF, custom: { septic_tanks: 2 } }, rules);
    expect(tanks.appliedRuleIds).toEqual(["hou-plumb-septic-118.5.4"]);
    expect(tanks.totalCents).toBe(10_742);
  });

  it("attaches the transcribed yard-light row to the plumbing permit type", () => {
    // The plumbing page names yard lights in its own copy. A row that exists in
    // the module but is attached to nothing is a page describing a fee it cannot
    // show.
    const codes = rulesFor("plumbing").map((rule) => rule.code);
    expect(codes).toContain("PLUMB-118.5.3");
  });

  it("names, rather than silently ignores, the rules the example leaves out", () => {
    // The disputed minimum and administrative fees ship as `draft`. A reader who
    // was told the total is not complete deserves to see them listed with a reason.
    const result = compute("building-permit-cost");
    const excludedCodes = result.excluded.map((rule) => rule.code);

    expect(excludedCodes).toContain("MIN-118.1.3");
    expect(excludedCodes).toContain("ADMIN-118.1.1");
    expect(result.excluded.every((rule) => rule.detail.length > 0)).toBe(true);
  });

  it("shows the reader the inputs it calculated from", () => {
    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      if (!example) continue;

      const rows = describeCalculationInput(example.inputs);
      expect(rows.length, `${page.slug} would render an empty inputs table`).toBe(
        Object.keys(example.inputs).length,
      );
      for (const row of rows) {
        expect(row.value.length).toBeGreaterThan(0);
      }
    }
  });

  it("describes the outlet input in the schedule's own words", () => {
    const rows = describeCalculationInput({ custom: { outlets: 40 } });
    expect(rows).toEqual([{ label: "Number of outlets", value: "40" }]);
  });

  it("keeps whole-dollar inputs whole and shows cents when they exist", () => {
    expect(describeCalculationInput({ valuationCents: 40_000_000 })).toEqual([
      { label: "Project valuation", value: "$400,000" },
    ]);
    expect(describeCalculationInput({ valuationCents: 40_000_050 })).toEqual([
      { label: "Project valuation", value: "$400,000.50" },
    ]);
  });
});
