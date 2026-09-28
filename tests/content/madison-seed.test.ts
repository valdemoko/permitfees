import { describe, expect, it } from "vitest";

import { madisonSeed } from "@/content/madison";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Wisconsin, pass 11.
 *
 * Madison is the first jurisdiction whose fees are three enacted schedules
 * rather than one — MGO 29.09, 18.09 and 19.11 — printed by the division as a
 * single four-column table. The tests below pin the four things that structure
 * turns on: the group table, the 50% shell reduction, the two Group IV
 * mechanisms (a valuation increment and a block of openings), and the one cell
 * where the ordinance and the City's own fee page disagree.
 */

const AS_OF = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return madisonSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

describe("Madison seed", () => {
  it("validates all fee rules through the engine schema", () => {
    for (const entry of madisonSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("has 15 rules across the three schedules Madison publishes", () => {
    expect(madisonSeed.feeRules).toHaveLength(15);
    expect(rulesFor("building")).toHaveLength(8);
    expect(rulesFor("electrical")).toHaveLength(4);
    expect(rulesFor("plumbing")).toHaveLength(3);
  });

  it("keeps every rule code unique inside a permit type", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("has 3 published permit pages that clear the editorial gate", () => {
    expect(madisonSeed.permitPages).toHaveLength(3);
    for (const page of madisonSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const result = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: madisonSeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf: AS_OF,
      });

      expect(result.publishable, `${page.slug}: ${result.failures.join(" ")}`).toBe(true);
      expect(result.indexable).toBe(true);
    }
  });

  it("gives every page between four and six FAQs that cite a source", () => {
    for (const page of madisonSeed.permitPages) {
      const faqs = page.faqs ?? [];
      expect(faqs.length, page.slug).toBeGreaterThanOrEqual(4);
      expect(faqs.length, page.slug).toBeLessThanOrEqual(6);
      for (const faq of faqs) {
        expect(faq.sourceId, `${page.slug}: ${faq.question}`).toBeTruthy();
      }
    }
  });

  it("verifies every source and the fee schedule on the research date", () => {
    expect(madisonSeed.sources.length).toBeGreaterThanOrEqual(6);
    for (const source of madisonSeed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).toBe("2026-09-25");
      expect(source.retrievedAt, source.key).toBe("2026-09-25");
    }

    const keys = madisonSeed.sources.map((source) => source.key);
    const urls = madisonSeed.sources.map((source) => source.url);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(urls).size).toBe(urls.length);

    expect(madisonSeed.feeSchedules).toHaveLength(1);
    expect(madisonSeed.feeSchedules[0]?.status).toBe("active");
    expect(madisonSeed.feeSchedules[0]?.effectiveFrom).toBe("2021-03-27");
    expect(madisonSeed.feeSchedules[0]?.lastVerifiedAt).toBe("2026-09-25");
  });

  it("records verifications for the profile, every page, the schedule and the sources", () => {
    const types = new Set(madisonSeed.verifications.map((entry) => entry.entityType));
    expect(types).toContain("jurisdiction_profile");
    expect(types).toContain("permit_page");
    expect(types).toContain("fee_schedule");
    expect(types).toContain("source");
    expect(types).toContain("fee_rule");

    for (const page of madisonSeed.permitPages) {
      const record = madisonSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.verifiedAt).toBe("2026-09-25");
    }

    // The one disagreement between the ordinance and the City's fee page is
    // recorded as disputed rather than quietly verified.
    const disputed = madisonSeed.verifications.filter((entry) => entry.status === "disputed");
    expect(disputed.map((entry) => entry.entityKey)).toEqual(["PLUMB-NEW-GROUP"]);
  });

  /* ---------------------------------------------------------------------- */
  /* Building — MGO 29.09                                                   */
  /* ---------------------------------------------------------------------- */

  it("prices a new house from the group table, plus plan review and the zoning fee", () => {
    const input: CalculationInput = {
      asOf: AS_OF,
      squareFootage: 2_400,
      occupancy: "residential",
      workType: "new_construction",
      custom: { fee_group: 1, single_or_two_family: true },
    };

    const result = calculatePermitFees(input, rulesFor("building"));

    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-NEW-GROUP",
      "BLD-PLAN-REVIEW-RES-NEW",
      "BLD-ZONING-REVIEW",
    ]);
    // 2,400 sq ft at $.10 = $240.00; flat plan review $100.00; zoning at $0.03 = $72.00.
    expect(result.totalCents).toBe(41_200);
    expect(result.warnings).toEqual([]);
  });

  it("selects the published rate for each group rather than one stated rate", () => {
    const groupFee = (feeGroup: number) =>
      calculatePermitFees(
        {
          asOf: AS_OF,
          squareFootage: 1_000,
          workType: "new_construction",
          custom: { fee_group: feeGroup },
        },
        rulesFor("building"),
      ).components.find((component) => component.code === "BLD-NEW-GROUP")?.amountCents;

    // 1,000 sq ft at the group's published rate: $.10, $.18, $.12 a square foot.
    expect(groupFee(1)).toBe(10_000);
    expect(groupFee(2)).toBe(18_000);
    expect(groupFee(3)).toBe(12_000);
  });

  it("halves the group fee for a shell-only or interior build-out", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 2_400,
        workType: "new_construction",
        custom: { fee_group: 1, shell_only: true },
      },
      rulesFor("building"),
    );

    // The half is on the group row; the two fees that ride on every building
    // permit still fire at their own figures.
    expect(result.appliedRuleIds).toContain("madison-bld-new-group-shell");
    const shell = result.components.find(
      (component) => component.code === "BLD-NEW-GROUP-SHELL",
    );
    expect(shell?.amountCents).toBe(12_000); // half of $240.00
    // $120.00 shell + $100.00 commercial plan review (the $.04 rate is $96.00,
    // floored at its $100.00 minimum) + $72.00 zoning review.
    expect(result.totalCents).toBe(29_200);
  });

  it("charges an alteration $11.00 per $1,000 of value, rounding a part thousand up", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        valuationCents: 1_240_000, // $12,400 -> thirteen increments
        squareFootage: 1_200,
        workType: "alteration",
        custom: { single_or_two_family: true },
      },
      rulesFor("building"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "BLD-EXISTING-ALTERATIONS",
      "BLD-PLAN-REVIEW-RES-ALTER",
      "BLD-ZONING-REVIEW",
    ]);
    // 13 x $11.00 = $143.00, plus the $25.00 flat alteration plan review, plus
    // 1,200 sq ft of zoning review at $0.03 = $36.00.
    expect(result.totalCents).toBe(20_400);
  });

  it("floors the alteration fee at $25.00", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 50_000, workType: "repair" }, // $500 -> one increment
      rulesFor("building"),
    );

    const alteration = result.components.find(
      (component) => component.code === "BLD-EXISTING-ALTERATIONS",
    );
    expect(alteration?.amountCents).toBe(2_500); // the $25.00 minimum, not $11.00
  });

  /* ---------------------------------------------------------------------- */
  /* Electrical — MGO 19.11                                                 */
  /* ---------------------------------------------------------------------- */

  it("prices new-work electrical from the same area and group as the building", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 2_400,
        workType: "new_construction",
        custom: { fee_group: 1 },
      },
      rulesFor("electrical"),
    );

    expect(result.appliedRuleIds).toEqual(["madison-elec-new-group"]);
    expect(result.totalCents).toBe(21_600); // 2,400 sq ft at $.09
  });

  it("prices alterations by the opening block, then the service panel", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        squareFootage: 1_800,
        valuationCents: 800_000,
        workType: "alteration",
        custom: { openings: 14, panels: 1 },
      },
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "ELEC-OPENINGS",
      "ELEC-SERVICE-REPLACEMENT",
    ]);
    // Ten openings are one $25.00 block, four more at $1.00, plus $50.00 a panel.
    expect(result.totalCents).toBe(7_900);
    expect(result.warnings).toEqual([]);
  });

  it("does not charge the service row on a permit that does not touch the service", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, workType: "alteration", custom: { openings: 10 } },
      rulesFor("electrical"),
    );

    expect(result.totalCents).toBe(2_500); // the block alone
  });

  /* ---------------------------------------------------------------------- */
  /* Plumbing — MGO 18.09                                                   */
  /* ---------------------------------------------------------------------- */

  it("prices a plumbing alteration per fixture, with the $25.00 minimum", () => {
    const cheap = calculatePermitFees(
      { asOf: AS_OF, workType: "alteration", fixtures: 2 },
      rulesFor("plumbing"),
    );
    expect(cheap.totalCents).toBe(2_500); // 2 x $8.00 = $16.00, floored

    const full = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 600_000, workType: "alteration", fixtures: 6 },
      rulesFor("plumbing"),
    );
    expect(full.components.map((component) => component.code)).toEqual(["PLUMB-FIXTURES"]);
    expect(full.totalCents).toBe(4_800); // 6 x $8.00
  });

  it("charges the enacted $.10 for Group II plumbing, which is the disputed cell", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, squareFootage: 1_000, workType: "new_construction", custom: { fee_group: 2 } },
      rulesFor("plumbing"),
    );

    // MGO 18.09 enacts $.10 per sq ft; the City's fee page prints $.11. The
    // enacted figure is charged and the page's is named on the page itself.
    expect(result.totalCents).toBe(10_000);
  });

  it("never lets the new-work and existing-work regimes fire together", () => {
    const input: CalculationInput = {
      asOf: AS_OF,
      valuationCents: 500_000,
      squareFootage: 1_400,
      workType: "alteration",
      custom: { fee_group: 1, single_or_two_family: true },
    };

    const result = calculatePermitFees(input, rulesFor("building"));

    expect(result.appliedRuleIds).not.toContain("madison-bld-existing-alterations");
    expect(result.appliedRuleIds).toContain("madison-bld-new-group");
  });
});
