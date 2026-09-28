import { describe, expect, it } from "vitest";

import { kansascitySeed } from "@/content/kansascity";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

/**
 * Kansas City, Missouri — the one commercial schedule that is fifty flat brackets
 * to $50,000 and then three valuation bands that chain exactly.
 *
 * The checks that matter, in the order they would catch a real error:
 *
 *  1. **The $1–$50,000 block is a table, not a rate.** Fifty brackets, one amount
 *     per $1,000 window — $12,300 pays the $12,001–13,000 row ($223.50), not a rate
 *     on the whole valuation. A swapped table entry would fail nine ways at once.
 *  2. **The three bands above $50,000 chain exactly.** $686.00 + 150 × $12.50 is
 *     $2,561.00, and $2,561.00 + 800 × $8.30 is $9,201.00 — so the seams disappear.
 *  3. **\"Or fraction thereof\" rounds every band.** Even $1 above a threshold buys
 *     a whole $12.50 or $8.30 or $3.60 step; the KCMO sheet prints the phrase on
 *     every per-$1,000 clause, the opposite of the prorated ladders.
 *  4. **Plan review is a credited prepayment.** No rule adds 50% — it is paid at
 *     submission and credited at issuance, named on every page. A 50% row would
 *     lift every small commercial permit.
 *  5. **One ladder, three trades.** Building, electrical and plumbing read the
 *     same four rules against their own valuation; the per-building instruction
 *     makes one schedule answer three permits at different inputs.
 */

const asOf = "2026-09-26";

function rulesFor(permitTypeKey: string) {
  return kansascitySeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function totalFor(permitTypeKey: string, input: Omit<CalculationInput, "asOf">): number {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).totalCents;
}

function codesFor(
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  prefix: string,
): string[] {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey))
    .components.filter((component) => component.code.startsWith(prefix))
    .map((component) => component.code);
}

function componentFor(
  permitTypeKey: string,
  code: string,
  input: Omit<CalculationInput, "asOf">,
): number | undefined {
  return calculatePermitFees({ asOf, ...input }, rulesFor(permitTypeKey)).components.find(
    (component) => component.code === code,
  )?.amountCents;
}

describe("Kansas City seed payload", () => {
  it("identifies the jurisdiction and its county", () => {
    expect(kansascitySeed.state).toMatchObject({ code: "MO", fipsCode: "29" });
    expect(kansascitySeed.county).toMatchObject({
      key: "jackson-county",
      name: "Jackson County",
      fipsCode: "29095",
    });
    expect(kansascitySeed.jurisdiction).toMatchObject({
      key: "kansas-city",
      slug: "kansas-city",
      countyKey: "jackson-county",
      isActive: true,
    });
  });

  it("shares the Missouri state row and the permit catalogue", () => {
    expect(kansascitySeed.state.code).toBe("MO");
    expect(kansascitySeed.permitTypes).toEqual([]);
    expect(kansascitySeed.projectTypes).toEqual([]);
  });

  it("cites only sources it can reference, and every rule validates", () => {
    const sourceKeys = new Set(kansascitySeed.sources.map((s) => s.key));
    const scheduleKeys = new Set(kansascitySeed.feeSchedules.map((s) => s.key));
    for (const entry of kansascitySeed.feeRules) {
      expect(scheduleKeys.has(entry.scheduleKey), `unknown schedule ${entry.scheduleKey}`).toBe(true);
      if (entry.rule.sourceId !== null) expect(sourceKeys.has(entry.rule.sourceId)).toBe(true);
      const v = validateFeeRule(entry.rule);
      expect(v.ok, `${entry.rule.code}: ${v.ok ? "" : (v as { error: string }).error}`).toBe(true);
    }
  });

  it("publishes three pages that clear the editorial gate", () => {
    const published = kansascitySeed.permitPages.filter((p) => p.publishStatus === "published" && !p.noindex);
    expect(kansascitySeed.permitPages).toHaveLength(3);
    expect(published.map((p) => p.slug).sort()).toEqual([
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
        sourceCount: kansascitySeed.sources.length,
        feeRuleCount: rulesFor(page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it("verifies the single source, the schedule, the three pages and the profile", () => {
    const sv = kansascitySeed.verifications.filter((v) => v.entityType === "source");
    expect(sv.map((v) => v.entityKey).sort()).toEqual(kansascitySeed.sources.map((s) => s.key).sort());
    for (const v of kansascitySeed.verifications) {
      expect(v.status, v.entityKey).toBe("verified");
      expect(v.verifiedAt, v.entityKey).toBe("2026-09-26");
      expect(v.verifiedBy, v.entityKey).toContain("Missouri");
    }
  });

  it("uses exactly one source and twelve rules, four per trade", () => {
    expect(kansascitySeed.sources).toHaveLength(1);
    expect(kansascitySeed.feeSchedules).toHaveLength(1);
    expect(kansascitySeed.feeRules).toHaveLength(12);
    expect(rulesFor("building")).toHaveLength(4);
    expect(rulesFor("electrical")).toHaveLength(4);
    expect(rulesFor("plumbing")).toHaveLength(4);
  });

  it("prints no plan_review rule at all", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      for (const rule of rulesFor(permitTypeKey)) {
        expect(rule.componentType, `${permitTypeKey} ${rule.code}`).not.toBe("plan_review");
      }
    }
  });

  it("keeps every per_thousand band rounded up in $1,000 steps", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      for (const rule of rulesFor(permitTypeKey).filter((r) => r.feeType === "per_thousand")) {
        expect((rule.config as { incrementCents?: number }).incrementCents, `${rule.code} increment`).toBe(100_000);
      }
    }
  });
});

describe("Kansas City building permits — the fifty-bracket table", () => {
  it("prices every window of the $1–$50,000 flat table by bracket", () => {
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 30_000 })).toBe(4_800);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 50_000 })).toBe(4_800);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 50_100 })).toBe(8_600);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 200_000 })).toBe(8_600);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 200_100 })).toBe(9_850);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 300_000 })).toBe(9_850);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 1_230_000 })).toBe(22_350);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 1_300_000 })).toBe(22_350);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 1_300_100 })).toBe(23_600);
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 5_000_000 })).toBe(68_600);
    expect(totalFor("building", { valuationCents: 1_230_000 })).toBe(22_350);
    expect(totalFor("building", { valuationCents: 1_500_000 })).toBe(24_850);
  });

  it("leaves the table at $50,000 and reads the first band's base only from the next tier", () => {
    // Exactly at the seam the table still answers; one cent above, the band does.
    expect(codesFor("building", { valuationCents: 5_000_000 }, "BLD")).toEqual(["BLD-TABLE-1-50000"]);
    expect(codesFor("building", { valuationCents: 5_000_100 }, "BLD")).toEqual(["BLD-50K-200K"]);
    // The band's $686.00 is not an arithmetic of the table — it is the table's last row, priced again.
    expect(componentFor("building", "BLD-TABLE-1-50000", { valuationCents: 5_000_000 })).toBe(68_600);
    expect(componentFor("building", "BLD-50K-200K", { valuationCents: 5_010_000 })).toBe(68_600 + 1_250);
  });
});

describe("Kansas City building permits — the chained valuation bands", () => {
  it("chains exactly: $686 → $2,561 → $9,201", () => {
    // $50,000 → $686.00, $200,000 → $2,561.00, $1,000,000 → $9,201.00
    expect(totalFor("building", { valuationCents: 5_000_000 })).toBe(68_600);
    expect(totalFor("building", { valuationCents: 20_000_000 })).toBe(256_100);
    expect(totalFor("building", { valuationCents: 100_000_000 })).toBe(920_100);
    // The printed bases are derivable: $686 + 150×$12.50 = $2,561; $2,561 + 800×$8.30 = $9,201.
    expect(68_600 + 150 * 1_250).toBe(256_100);
    expect(256_100 + 800 * 830).toBe(920_100);
    // And the three are the seams between the four rule tiers.
    expect(totalFor("building", { valuationCents: 20_000_100 })).toBe(256_100 + 830);
    expect(totalFor("building", { valuationCents: 100_000_100 })).toBe(920_100 + 360);
  });

  it('rounds \"or fraction thereof\" up to the next whole $1,000', () => {
    // $50,100 is $686 + one whole $12.50; $75,100 is +26 whole steps.
    expect(totalFor("building", { valuationCents: 5_010_000 })).toBe(68_600 + 1 * 1_250);
    expect(totalFor("building", { valuationCents: 7_510_000 })).toBe(68_600 + 26 * 1_250);
    // $251 of fraction still buys a whole $8.30 in the $200k band.
    expect(totalFor("building", { valuationCents: 20_025_100 })).toBe(256_100 + 1 * 830);
    expect(totalFor("building", { valuationCents: 100_025_100 })).toBe(920_100 + 1 * 360);
    // Exactly one band or the table charges at a time.
    expect(codesFor("building", { valuationCents: 12_300_000 }, "BLD")).toEqual(["BLD-50K-200K"]);
    expect(codesFor("building", { valuationCents: 40_000_000 }, "BLD")).toEqual(["BLD-200K-1M"]);
    expect(codesFor("building", { valuationCents: 200_000_000 }, "BLD")).toEqual(["BLD-1M-UP"]);
  });

  it("reproduces the schedule's worked totals", () => {
    // $75,100 → $686 + 26×$12.50 = $1,011.00
    expect(totalFor("building", { valuationCents: 7_510_000 })).toBe(101_100);
    // $500,000 → $2,561 + 300×$8.30 = $5,051.00
    expect(totalFor("building", { valuationCents: 50_000_000 })).toBe(256_100 + 300 * 830);
    expect(totalFor("building", { valuationCents: 50_000_000 })).toBe(505_100);
    // $2,000,000 → $9,201 + 1,000×$3.60 = $12,801.00
    expect(totalFor("building", { valuationCents: 200_000_000 })).toBe(920_100 + 1_000 * 360);
    expect(totalFor("building", { valuationCents: 200_000_000 })).toBe(1_280_100);
    // $400,000 building within the same mixed-use project → $2,561 + 200×$8.30 = $4,221.00
    expect(totalFor("building", { valuationCents: 40_000_000 })).toBe(256_100 + 200 * 830);
    expect(totalFor("building", { valuationCents: 8_000_000 })).toBe(68_600 + 30 * 1_250);
  });
});

describe("Kansas City electrical / plumbing — the same ladder on a different valuation", () => {
  it("charges electrical on the same ladder read against the electrical valuation", () => {
    expect(totalFor("electrical", { valuationCents: 50_000 })).toBe(4_800);
    expect(totalFor("electrical", { valuationCents: 50_100 })).toBe(8_600);
    expect(totalFor("electrical", { valuationCents: 8_000_000 })).toBe(68_600 + 30 * 1_250);
    expect(totalFor("electrical", { valuationCents: 40_000_000 })).toBe(256_100 + 200 * 830);
    // Same cents, different trade.
    expect(totalFor("electrical", { valuationCents: 8_000_000 })).toBe(
      totalFor("building", { valuationCents: 8_000_000 }),
    );
  });

  it("charges plumbing on the same ladder read against the plumbing valuation", () => {
    expect(totalFor("plumbing", { valuationCents: 1_500_000 })).toBe(24_850);
    expect(totalFor("plumbing", { valuationCents: 5_010_000 })).toBe(68_600 + 1_250);
    expect(totalFor("plumbing", { valuationCents: 25_000_000 })).toBe(256_100 + 50 * 830);
    expect(totalFor("plumbing", { valuationCents: 25_000_000 })).toBe(297_600);
    expect(totalFor("plumbing", { valuationCents: 25_000_000 })).toBe(
      totalFor("building", { valuationCents: 25_000_000 }),
    );
  });

  it("makes a three-trade project the sum of three filings, not one valuation's rate", () => {
    // Mixed-use within the worked example: building $400k, plumbing $80k, electrical $60k as three trades.
    const building = totalFor("building", { valuationCents: 40_000_000 });
    const plumbing = totalFor("plumbing", { valuationCents: 8_000_000 });
    const electrical = totalFor("electrical", { valuationCents: 6_000_000 });
    expect(building).toBe(422_100);
    expect(plumbing).toBe(106_100);
    expect(electrical).toBe(81_100);
    expect(building + plumbing + electrical).toBe(609_300);
    // One project valuation of $540,000 would not equal that: it is $5,383.00, not $6,093.00.
    expect(totalFor("building", { valuationCents: 54_000_000 })).not.toBe(building + plumbing + electrical);
  });
});
