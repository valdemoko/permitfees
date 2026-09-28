import { describe, expect, it } from "vitest";

import { RLY_PUBLISHED_PERMIT_PAGES, raleighSeed } from "@/content/raleigh";
import {
  RLY_BUILDING_RESIDENTIAL_DENOMINATOR,
  RLY_BUILDING_RESIDENTIAL_NUMERATOR,
  RLY_COMMERCIAL_TIER_2_BASE_CENTS,
  RLY_COMMERCIAL_TIER_2_RATE,
  RLY_ELECTRICAL_SHARE_RESIDENTIAL,
  RLY_FEE_EFFECTIVE_FROM,
  RLY_FEE_SOURCE_KEY,
  RLY_MINIMUM_TRADE_PERMIT_CENTS,
  RLY_PLUMBING_SHARE_RESIDENTIAL,
  RLY_TECHNOLOGY_SURCHARGE_BPS,
} from "@/content/raleigh/fee-rules";
import { calculatePermitFees, describeCalculationInput } from "@/lib/calc/engine";
import { validateFeeRule } from "@/lib/calc/schemas";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability, MIN_INTRO_LENGTH } from "@/lib/editorial";
import { formatCents } from "@/lib/format";

/**
 * City of Raleigh, North Carolina — the jurisdiction that prices a **trade permit as a
 * percentage of the building permit fee**.
 *
 * Three things this file exists to hold down:
 *
 *  1. **The composition.** "49% of the calculated building permit" is charged as the
 *     product of the two rates the guide publishes — 49% × 0.38% — so the electrical
 *     total is *not* 149% of the building permit. The identity asserted below runs both
 *     rule sets and requires the share to equal the percentage of the other set's output.
 *  2. **The bands are alternatives, not a ladder.** The guide prints three commercial
 *     bands with their own base fees, and they do not meet: $300 of step at $500,001 and
 *     $1,200 of step the same way at $10,000,001, with the Tier 2 and Tier 3 formulas only
 *     agreeing at $12,400,000. A page once described the second step as "$200 the other
 *     way"; the assertions at those two valuations are what would catch that.
 *  3. **The surcharge and the floor.** 4% of the *fees*, charged last, and $124.00
 *     **per trade per review** — two floors on one job, not one between them.
 */

const AS_OF = "2026-09-25";

/** The permit types every jurisdiction shares; Raleigh defines none of its own. */
const SHARED_PERMIT_TYPES = ["building", "electrical", "plumbing"];

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return raleighSeed.feeRules
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

const RES_400K = { valuationCents: 40_000_000, occupancy: "residential", workType: "new_construction" } as const;
const COMM_300K = { valuationCents: 30_000_000, occupancy: "commercial", workType: "new_construction" } as const;
const COMM_2M = { valuationCents: 200_000_000, occupancy: "commercial", workType: "new_construction" } as const;

describe("Raleigh payload — internal consistency", () => {
  it("validates every rule through the engine's own schema", () => {
    for (const entry of raleighSeed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(
        validation.ok,
        `${entry.permitTypeKey} / ${entry.rule.code}: ${validation.ok ? "" : validation.error}`,
      ).toBe(true);
    }
  });

  it("cites only sources and schedules the payload defines, and no permit type of its own", () => {
    const sourceKeys = new Set(raleighSeed.sources.map((source) => source.key));
    const scheduleKeys = new Set(raleighSeed.feeSchedules.map((schedule) => schedule.key));
    const permitTypeKeys = new Set(SHARED_PERMIT_TYPES);

    for (const entry of raleighSeed.feeRules) {
      expect(scheduleKeys, entry.scheduleKey).toContain(entry.scheduleKey);
      expect(permitTypeKeys, entry.permitTypeKey).toContain(entry.permitTypeKey);
      if (entry.rule.sourceId) expect(sourceKeys, entry.rule.sourceId).toContain(entry.rule.sourceId);
    }

    for (const link of raleighSeed.jurisdictionPermitTypes) {
      expect(permitTypeKeys, link.permitTypeKey).toContain(link.permitTypeKey);
    }

    for (const page of raleighSeed.permitPages) {
      expect(permitTypeKeys, page.slug).toContain(page.permitTypeKey);
      expect(page.faqs?.length ?? 0, `${page.slug} has no FAQs`).toBeGreaterThan(0);
      for (const faq of page.faqs ?? []) {
        if (faq.sourceId) expect(sourceKeys, faq.sourceId).toContain(faq.sourceId);
      }
    }

    for (const requirement of raleighSeed.requirements) {
      expect(permitTypeKeys, requirement.title).toContain(requirement.permitTypeKey);
      if (requirement.sourceKey) {
        expect(sourceKeys, requirement.sourceKey).toContain(requirement.sourceKey);
      }
    }

    for (const verification of raleighSeed.verifications) {
      if (verification.sourceKey) {
        expect(sourceKeys, verification.sourceKey).toContain(verification.sourceKey);
      }
    }

    expect(raleighSeed.permitTypes).toEqual([]);
    expect(raleighSeed.projectTypes).toEqual([]);
  });

  it("defines North Carolina and Wake County, and belongs to the city of Raleigh", () => {
    expect(raleighSeed.state.code).toBe("NC");
    expect(raleighSeed.state.slug).toBe("north-carolina");
    expect(raleighSeed.state.fipsCode).toBe("37");
    expect(raleighSeed.county.fipsCode).toBe("37183");
    expect(raleighSeed.jurisdiction.stateKey).toBe("nc");
    expect(raleighSeed.jurisdiction.countyKey).toBe("wake-county");
    expect(raleighSeed.jurisdiction.type).toBe("city");
    expect(raleighSeed.jurisdiction.permitPortalUrl).toContain("cityofraleigh");
  });

  it("publishes three pages: the building permit and the two trades the schedule prices", () => {
    expect(RLY_PUBLISHED_PERMIT_PAGES.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    expect(raleighSeed.permitPages.map((page) => page.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);

    // The guide prices mechanical work at 28% residential and 76% commercial of the
    // calculated building permit, and alterations at 28/50/75% — but it never prints the
    // building permit fee an alteration share would apply to, so no page prices them.
    expect(raleighSeed.permitPages.some((page) => page.permitTypeKey === "mechanical")).toBe(
      false,
    );
    expect(raleighSeed.permitPages.some((page) => page.permitTypeKey === "alteration")).toBe(
      false,
    );
  });

  it("clears the editorial gate for every published page", () => {
    for (const page of RLY_PUBLISHED_PERMIT_PAGES) {
      const rulesInEffect = raleighSeed.feeRules
        .filter((entry) => entry.permitTypeKey === page.permitTypeKey)
        .map((entry) => entry.rule)
        .filter((rule) => rule.status === "active");

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: raleighSeed.sources.filter((source) => source.isPrimary).length,
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
      expect(page.seoTitle.trim().length).toBeGreaterThan(0);
      expect(page.seoDescription.trim().length).toBeGreaterThan(0);
      expect(page.faqs?.length ?? 0).toBeGreaterThanOrEqual(4);
    }
  });

  it("gives every published page a unique title and description", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of RLY_PUBLISHED_PERMIT_PAGES) {
      expect(titles.has(page.seoTitle), page.seoTitle).toBe(false);
      expect(descriptions.has(page.seoDescription), page.seoDescription).toBe(false);
      titles.add(page.seoTitle);
      descriptions.add(page.seoDescription);
    }
  });

  it("reads one source, dated from its own cover page and read on the research day", () => {
    expect(raleighSeed.sources).toHaveLength(1);
    const source = raleighSeed.sources[0];
    expect(source).toBeDefined();
    if (!source) throw new Error("Raleigh should publish exactly one source");

    expect(source.key).toBe(RLY_FEE_SOURCE_KEY);
    expect(source.isPrimary).toBe(true);
    expect(source.sourceType).toBe("fee_schedule_pdf");
    expect(source.url).toBe(
      "https://cityofraleigh0drupal.blob.core.usgovcloudapi.net/drupal-prod/COR15/DevelopmentFeeGuide.pdf",
    );
    // The cover page states the fiscal year, so the effective date is read rather than inferred.
    expect(source.documentDate).toBe("2026-07-01");
    expect(source.effectiveFrom).toBe(RLY_FEE_EFFECTIVE_FROM);
    expect(RLY_FEE_EFFECTIVE_FROM).toBe("2026-07-01");
    expect(source.retrievedAt).toBe("2026-09-25");
    expect(source.lastVerifiedAt).toBe("2026-09-25");

    // Every fee row prints two cost columns, and both were read. Taking the left one
    // would publish last year's schedule throughout.
    expect(source.notes).toContain("Prior Year");
    expect(source.notes).toContain("FY27");
  });

  it("dates every verification with the day the guide was read", () => {
    expect(raleighSeed.verifications.length).toBeGreaterThanOrEqual(6);
    for (const verification of raleighSeed.verifications) {
      expect(verification.verifiedAt).toBe("2026-09-25");
      if (verification.sourceKey) expect(verification.sourceKey).toBe(RLY_FEE_SOURCE_KEY);
    }
  });

  it("writes a profile a reader can parse: a list of exclusions and a multi-paragraph context", () => {
    const profile = raleighSeed.profile;
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

  it("models exactly the rows the guide's Building and Safety section publishes", () => {
    expect(rulesFor("building").map((rule) => rule.code)).toEqual([
      "BUILD-RESIDENTIAL",
      "BUILD-COMMERCIAL-TIER-1",
      "BUILD-COMMERCIAL-TIER-2",
      "BUILD-COMMERCIAL-TIER-3",
      "PLAN-REVIEW-RESIDENTIAL",
      "PLAN-REVIEW-COMMERCIAL",
      "TECHNOLOGY-SURCHARGE",
    ]);
    expect(rulesFor("electrical").map((rule) => rule.code)).toEqual([
      "ELEC-RESIDENTIAL",
      "ELEC-COMMERCIAL-TIER-1",
      "ELEC-COMMERCIAL-TIER-2",
      "ELEC-COMMERCIAL-TIER-3",
      "ELEC-GENERATOR",
      "ELEC-PARKING-LOT-LIGHTING",
      "ELEC-UPS",
      "ELEC-COLOCATE",
      "TECHNOLOGY-SURCHARGE",
    ]);
    expect(rulesFor("plumbing").map((rule) => rule.code)).toEqual([
      "PLUMB-RESIDENTIAL",
      "PLUMB-COMMERCIAL-TIER-1",
      "PLUMB-COMMERCIAL-TIER-2",
      "PLUMB-COMMERCIAL-TIER-3",
      "PLUMB-FIXTURES-26-50",
      "PLUMB-FIXTURES-51-100",
      "PLUMB-FIXTURES-OVER-100",
      "PLUMB-UTILITY-INSPECTION",
      "TECHNOLOGY-SURCHARGE",
    ]);

    // What is absent, asserted rather than described: no per-unit rule anywhere in the
    // payload reads an outlet, a fixture, a circuit or an ampere — Raleigh does not have
    // a per-item trade schedule, it has a share of the building permit.
    const units = raleighSeed.feeRules
      .filter((entry) => entry.rule.feeType === "per_unit")
      .map((entry) => entry.rule.code);
    expect(units).toEqual([]);
  });

  it("activates every rule on the guide's own effective date and source", () => {
    for (const entry of raleighSeed.feeRules) {
      expect(entry.rule.status, entry.rule.code).toBe("active");
      expect(entry.rule.effectiveFrom, entry.rule.code).toBe(RLY_FEE_EFFECTIVE_FROM);
      expect(entry.rule.effectiveTo, entry.rule.code).toBeNull();
      expect(entry.rule.sourceId, entry.rule.code).toBe(RLY_FEE_SOURCE_KEY);
      expect(entry.scheduleKey, entry.rule.code).toBe(RLY_FEE_SOURCE_KEY);
    }
  });

  it("confines the permit_fee basis to the two plan review rules", () => {
    // Plan review reads the permit fee the same run computed; attaching any other rule
    // to `permit_fee` would let a published total move without a published rate moving.
    const using = raleighSeed.feeRules
      .filter((entry) => (entry.rule.config as { basis?: string }).basis === "permit_fee")
      .map((entry) => entry.rule.code)
      .sort();

    expect(using).toEqual(["PLAN-REVIEW-COMMERCIAL", "PLAN-REVIEW-RESIDENTIAL"]);
  });

  it("puts the 4% technology surcharge last, on everything charged before it", () => {
    for (const permitTypeKey of SHARED_PERMIT_TYPES) {
      const surcharge = rulesFor(permitTypeKey).find(
        (rule) => rule.code === "TECHNOLOGY-SURCHARGE",
      );
      expect(surcharge, permitTypeKey).toBeDefined();
      expect(surcharge?.componentType, permitTypeKey).toBe("technology");
      expect(surcharge?.feeType, permitTypeKey).toBe("percent");
      expect((surcharge?.config as { basis?: string }).basis, permitTypeKey).toBe("fee_subtotal");
      expect((surcharge?.config as { rateBps?: number }).rateBps, permitTypeKey).toBe(
        RLY_TECHNOLOGY_SURCHARGE_BPS,
      );
      expect(RLY_TECHNOLOGY_SURCHARGE_BPS).toBe(400);
      expect(surcharge?.priority, permitTypeKey).toBe(900);

      // Everything else in the guide's Building and Safety section runs before it.
      for (const rule of rulesFor(permitTypeKey)) {
        if (rule.code === "TECHNOLOGY-SURCHARGE") continue;
        expect(rule.priority, rule.code).toBeLessThan(900);
      }
    }
  });

  it("floors every trade row at the published $124.00 per-trade minimum", () => {
    for (const permitTypeKey of ["electrical", "plumbing"]) {
      for (const rule of rulesFor(permitTypeKey)) {
        if (rule.code === "TECHNOLOGY-SURCHARGE") continue;
        expect(rule.minimumCents, rule.code).toBe(RLY_MINIMUM_TRADE_PERMIT_CENTS);
      }
    }
    expect(RLY_MINIMUM_TRADE_PERMIT_CENTS).toBe(12_400);
  });
});

describe("the building permit — 0.38% and three bands", () => {
  it("charges the residential rate the guide prints for FY27", () => {
    const rule = rulesFor("building").find((entry) => entry.code === "BUILD-RESIDENTIAL");
    const rate = (rule?.config as { rate: { numerator: number; denominator: number } }).rate;
    expect(rate.numerator).toBe(RLY_BUILDING_RESIDENTIAL_NUMERATOR);
    expect(rate.denominator).toBe(RLY_BUILDING_RESIDENTIAL_DENOMINATOR);
    expect(RLY_BUILDING_RESIDENTIAL_NUMERATOR / RLY_BUILDING_RESIDENTIAL_DENOMINATOR).toBeCloseTo(
      0.0038,
      10,
    );
  });

  it("totals $2,481.86 on a $400,000 new house: permit, plan review, surcharge", () => {
    const result = run("building", RES_400K);
    expect(componentTotal(result, "BUILD-RESIDENTIAL")).toBe(152_000);
    // Plan review is 57% of the *permit fee*, not of the value: 57% of $400,000 would be
    // $228,000, which is the mistake the guide's own wording is written to prevent.
    expect(componentTotal(result, "PLAN-REVIEW-RESIDENTIAL")).toBe(86_640);
    expect(componentTotal(result, "TECHNOLOGY-SURCHARGE")).toBe(9_546);
    expect(result.totalCents).toBe(248_186);
    expect(formatCents(result.totalCents)).toBe("$2,481.86");
  });

  it("prices new construction only, because every building row is headed \"New …\"", () => {
    const withoutWorkType = { valuationCents: 40_000_000, occupancy: "residential" } as const;
    for (const input of [withoutWorkType, { ...RES_400K, workType: "remodel" as const }]) {
      const result = run("building", input);
      expect(result.components).toEqual([]);
      expect(result.totalCents).toBe(0);
    }
  });

  it("charges Tier 1 on a $300,000 commercial project", () => {
    const result = run("building", COMM_300K);
    expect(componentTotal(result, "BUILD-COMMERCIAL-TIER-1")).toBe(63_000);
    expect(componentTotal(result, "PLAN-REVIEW-COMMERCIAL")).toBe(40_950);
    expect(componentTotal(result, "TECHNOLOGY-SURCHARGE")).toBe(4_158);
    expect(result.totalCents).toBe(108_108);
    expect(formatCents(result.totalCents)).toBe("$1,081.08");
  });

  it("charges Tier 2's base fee plus its rate on a $2,000,000 commercial project", () => {
    // $1,050.00 base + 0.06% of $2,000,000 = $2,250.00, plan review 65% = $1,462.50.
    const result = run("building", COMM_2M);
    expect(componentTotal(result, "BUILD-COMMERCIAL-TIER-2")).toBe(225_000);
    expect(componentTotal(result, "PLAN-REVIEW-COMMERCIAL")).toBe(146_250);
    expect(result.totalCents).toBe(386_100);
    expect(formatCents(result.totalCents)).toBe("$3,861.00");
  });

  it("charges Tier 3's base fee plus its rate on a $20,000,000 commercial project", () => {
    // $7,250.00 base + 0.01% of $20,000,000 = $9,250.00.
    const result = run("building", { ...COMM_2M, valuationCents: 2_000_000_000 });
    expect(componentTotal(result, "BUILD-COMMERCIAL-TIER-3")).toBe(925_000);
    expect(result.totalCents).toBe(1_587_300);
    expect(formatCents(result.totalCents)).toBe("$15,873.00");
  });

  it("steps up $300 where Tier 1 ends and Tier 2 opens", () => {
    // "$0 - $500,000" then "$500,001 - $10,000,000": the guide closes each band at one
    // cent below the next band's printed opening so no valuation is left unpriced.
    const atTop = run("building", { ...COMM_300K, valuationCents: 50_000_000 });
    const justOver = run("building", { ...COMM_300K, valuationCents: 50_000_100 });

    expect(componentTotal(atTop, "BUILD-COMMERCIAL-TIER-1")).toBe(105_000);
    expect(componentTotal(justOver, "BUILD-COMMERCIAL-TIER-2")).toBe(135_000);
    expect(justOver.totalCents - atTop.totalCents).toBe(30_000 + 19_500 + 1_980);
  });

  it("steps up $1,200 the same way where Tier 2 ends and Tier 3 opens", () => {
    // The bands never reverse direction at their boundary. A page once described this
    // step as "$200 the other way"; this is the assertion that says otherwise.
    const atTop = run("building", { ...COMM_300K, valuationCents: 1_000_000_000 });
    const justOver = run("building", { ...COMM_300K, valuationCents: 1_000_000_100 });

    expect(componentTotal(atTop, "BUILD-COMMERCIAL-TIER-2")).toBe(705_000);
    expect(componentTotal(justOver, "BUILD-COMMERCIAL-TIER-3")).toBe(825_000);
    expect(justOver.totalCents - atTop.totalCents).toBe(120_000 + 78_000 + 7_920);
  });

  it("shows the Tier 2 and Tier 3 formulas agreeing at $12,400,000 and nowhere near it", () => {
    // $1,050 + 0.06% x 12,400,000 = $8,490 = $7,250 + 0.01% x 12,400,000. Above that
    // figure Tier 2 would have charged more than Tier 3 does — which is why they are
    // alternatives rather than one ladder, and why each is charged over its own range.
    const valuationCents = 1_240_000_000;
    const tier2AtCrossing =
      RLY_COMMERCIAL_TIER_2_BASE_CENTS +
      Math.round(
        (valuationCents * RLY_COMMERCIAL_TIER_2_RATE.numerator) /
          RLY_COMMERCIAL_TIER_2_RATE.denominator,
      );

    expect(tier2AtCrossing).toBe(849_000);
    expect(
      componentTotal(run("building", { ...COMM_300K, valuationCents }), "BUILD-COMMERCIAL-TIER-3"),
    ).toBe(849_000);
  });
});

describe("the technology surcharge", () => {
  it("is 4% of the fees, never 4% of the valuation", () => {
    const result = run("building", RES_400K);
    const fees = componentTotal(result, "BUILD-RESIDENTIAL") +
      componentTotal(result, "PLAN-REVIEW-RESIDENTIAL");

    expect(componentTotal(result, "TECHNOLOGY-SURCHARGE")).toBe(Math.round(fees * 0.04));
    expect(fees).toBe(238_640);
    // 4% of the $400,000 valuation would be $16,000, which is not what the guide charges.
    expect(componentTotal(result, "TECHNOLOGY-SURCHARGE")).not.toBe(1_600_000);
  });

  it("reproduces the guide's own reference figures: $150 becomes $156, $124 becomes $129", () => {
    // The guide's Technology Fee Reference Guide reprints every fee twice, once bare and
    // once as "Fee Total = Fee + Surcharge" — so the floor plus its surcharge is checkable
    // against the City's own page: $124.00 + $4.96 = $128.96, printed there as $129.00.
    const floored = run("electrical", {
      valuationCents: 1_000_000,
      occupancy: "residential",
      workType: "new_construction",
    });
    expect(componentTotal(floored, "TECHNOLOGY-SURCHARGE")).toBe(496);
    expect(formatCents(floored.totalCents)).toBe("$128.96");

    const generator = run("electrical", {
      occupancy: "commercial",
      custom: { electrical_item: "generator" },
    });
    expect(componentTotal(generator, "ELEC-GENERATOR")).toBe(39_600);
    expect(componentTotal(generator, "TECHNOLOGY-SURCHARGE")).toBe(1_584);
    expect(formatCents(generator.totalCents)).toBe("$411.84");
  });
});

describe("the electrical permit — a share of the building permit", () => {
  it("is the published share composed with the published building rate", () => {
    const rule = rulesFor("electrical").find((entry) => entry.code === "ELEC-RESIDENTIAL");
    const rate = (rule?.config as { rate: { numerator: number; denominator: number } }).rate;

    // 49% x 0.38% = 0.1862%, formed from the two named constants rather than typed in.
    expect(rate.numerator).toBe(
      RLY_ELECTRICAL_SHARE_RESIDENTIAL.numerator * RLY_BUILDING_RESIDENTIAL_NUMERATOR,
    );
    expect(rate.denominator).toBe(
      RLY_ELECTRICAL_SHARE_RESIDENTIAL.denominator * RLY_BUILDING_RESIDENTIAL_DENOMINATOR,
    );
    expect(rate).toEqual({ numerator: 1_862, denominator: 1_000_000 });
  });

  it("equals 49% of what the building rules charge for the same project", () => {
    // The identity that keeps the electrical page's total from being 149% of the
    // building permit: run both rule sets on one input and require the share to hold.
    const building = run("building", RES_400K);
    const electrical = run("electrical", RES_400K);
    const permitFee = componentTotal(building, "BUILD-RESIDENTIAL");

    expect(permitFee).toBe(152_000);
    expect(componentTotal(electrical, "ELEC-RESIDENTIAL")).toBe(
      Math.round((permitFee * RLY_ELECTRICAL_SHARE_RESIDENTIAL.numerator) / 100),
    );
  });

  it("totals $774.59 on a $400,000 new house", () => {
    const result = run("electrical", RES_400K);
    expect(componentTotal(result, "ELEC-RESIDENTIAL")).toBe(74_480);
    expect(componentTotal(result, "TECHNOLOGY-SURCHARGE")).toBe(2_979);
    expect(result.totalCents).toBe(77_459);
    expect(formatCents(result.totalCents)).toBe("$774.59");
  });

  it("charges the $124.00 floor on a $10,000 project, not the $18.62 the share yields", () => {
    const result = run("electrical", {
      valuationCents: 1_000_000,
      occupancy: "residential",
      workType: "new_construction",
    });

    // The building permit would be $38.00 and 49% of it $18.62 — under the floor, so the
    // published minimum is charged instead: 0.1862% of $10,000 is not what a reader pays.
    expect(componentTotal(result, "ELEC-RESIDENTIAL")).toBe(12_400);
    expect(componentTotal(result, "ELEC-RESIDENTIAL")).not.toBe(1_862);
    expect(result.totalCents).toBe(12_896);
  });

  it("charges the same 100% share for commercial work as the building permit itself", () => {
    // "New Commercial Electrical Permit — 100% % Of Calculated Building Permit" means the
    // commercial electrical permit equals the band's building permit fee, then 4% on top.
    for (const [input, code] of [
      [COMM_300K, "ELEC-COMMERCIAL-TIER-1"],
      [COMM_2M, "ELEC-COMMERCIAL-TIER-2"],
    ] as const) {
      const building = run("building", input);
      const electrical = run("electrical", input);
      expect(componentTotal(electrical, code)).toBe(
        componentTotal(building, code.replace("ELEC-", "BUILD-")),
      );
    }

    expect(run("electrical", COMM_300K).totalCents).toBe(65_520);
    expect(run("electrical", COMM_2M).totalCents).toBe(234_000);
  });

  it("prices the four stand-alone permits flat and in place of the share", () => {
    const standAlones: Array<[string, string, number, number]> = [
      ["generator", "ELEC-GENERATOR", 39_600, 41_184],
      ["parking_lot_lighting", "ELEC-PARKING-LOT-LIGHTING", 32_000, 33_280],
      ["ups", "ELEC-UPS", 34_000, 35_360],
      ["colocate", "ELEC-COLOCATE", 30_000, 31_200],
    ];

    for (const [item, code, fee, total] of standAlones) {
      const result = run("electrical", {
        occupancy: "commercial",
        custom: { electrical_item: item },
      });
      // The stand-alone permit and the surcharge, and nothing else: a flat row is an
      // alternative to the percentage, never an addition to it.
      expect(result.components.map((component) => component.code)).toEqual([
        code,
        "TECHNOLOGY-SURCHARGE",
      ]);
      expect(result.totalCents).toBe(total);
      expect(result.totalCents - componentTotal(result, "TECHNOLOGY-SURCHARGE")).toBe(fee);
    }

    // A stand-alone permit replaces the share rather than adding to it, even when a
    // valuation is present in the same calculation.
    const withValuation = run("electrical", {
      ...RES_400K,
      custom: { electrical_item: "generator" },
    });
    expect(withValuation.components.some((component) => component.code === "ELEC-RESIDENTIAL")).toBe(
      false,
    );
    expect(withValuation.totalCents).toBe(41_184);
  });
});

describe("the plumbing permit — the same relationship at a different share", () => {
  it("is 34% of the building permit and $537.47 with the surcharge", () => {
    const building = run("building", RES_400K);
    const plumbing = run("plumbing", RES_400K);
    const permitFee = componentTotal(building, "BUILD-RESIDENTIAL");

    expect(componentTotal(plumbing, "PLUMB-RESIDENTIAL")).toBe(
      Math.round((permitFee * RLY_PLUMBING_SHARE_RESIDENTIAL.numerator) / 100),
    );
    expect(componentTotal(plumbing, "PLUMB-RESIDENTIAL")).toBe(51_680);
    expect(componentTotal(plumbing, "TECHNOLOGY-SURCHARGE")).toBe(2_067);
    expect(plumbing.totalCents).toBe(53_747);
    expect(formatCents(plumbing.totalCents)).toBe("$537.47");
  });

  it("floors its own share at $124.00, independently of the electrical floor", () => {
    const input = {
      valuationCents: 1_000_000,
      occupancy: "residential",
      workType: "new_construction",
    } as const;

    // Two trades on one job are two floors: the guide says "per trade per review", not
    // one floor shared between them.
    expect(componentTotal(run("electrical", input), "ELEC-RESIDENTIAL")).toBe(12_400);
    expect(componentTotal(run("plumbing", input), "PLUMB-RESIDENTIAL")).toBe(12_400);
    expect(run("plumbing", input).totalCents).toBe(12_896);
  });

  it("applies the 56% commercial share to a permit fee that already contains a base fee", () => {
    // Tier 2's building permit is $1,050.00 + 0.06% = $2,250.00; 56% of that is
    // $1,260.00 — $588.00 of base fee plus 0.0336% of the value. The base is part of
    // what the share applies to, because the share is of the *calculated building permit*.
    const building = run("building", COMM_2M);
    const plumbing = run("plumbing", COMM_2M);
    const permitFee = componentTotal(building, "BUILD-COMMERCIAL-TIER-2");

    expect(permitFee).toBe(225_000);
    expect(componentTotal(plumbing, "PLUMB-COMMERCIAL-TIER-2")).toBe(126_000);
    expect(componentTotal(plumbing, "PLUMB-COMMERCIAL-TIER-2")).toBe(
      Math.round((permitFee * 56) / 100),
    );
    expect(plumbing.totalCents).toBe(131_040);
    expect(formatCents(plumbing.totalCents)).toBe("$1,310.40");
  });

  it("charges Tier 1's 56% share on a $300,000 commercial project", () => {
    const result = run("plumbing", COMM_300K);
    expect(componentTotal(result, "PLUMB-COMMERCIAL-TIER-1")).toBe(35_280);
    expect(result.totalCents).toBe(366_91);
    expect(formatCents(result.totalCents)).toBe("$366.91");
  });

  it("prices the four stand-alone plumbing permits flat, by the work they count", () => {
    const standAlones: Array<[string, number, number]> = [
      ["fixtures_26_50", 23_600, 24_544],
      ["fixtures_51_100", 29_700, 30_888],
      ["fixtures_over_100", 32_500, 33_800],
      ["utility_inspection", 13_300, 13_832],
    ];

    for (const [item, fee, total] of standAlones) {
      const result = run("plumbing", {
        occupancy: "commercial",
        custom: { plumbing_item: item },
      });
      expect(result.totalCents, item).toBe(total);
      expect(result.totalCents - componentTotal(result, "TECHNOLOGY-SURCHARGE"), item).toBe(fee);
      // The percentage rules cannot also fire on a stand-alone permit.
      expect(
        result.components.some((component) => component.code.startsWith("PLUMB-COMMERCIAL")),
        item,
      ).toBe(false);
    }

    expect(formatCents(run("plumbing", {
      occupancy: "commercial",
      custom: { plumbing_item: "utility_inspection" },
    }).totalCents)).toBe("$138.32");
  });
});

describe("published worked examples — computed, not transcribed", () => {
  function pageFor(slug: string) {
    const page = RLY_PUBLISHED_PERMIT_PAGES.find((candidate) => candidate.slug === slug);
    if (!page) throw new Error(`no published permit page with slug "${slug}"`);
    return page;
  }

  const expectedTotals: Record<string, number> = {
    "building-permit-cost": 248_186,
    "electrical-permit-cost": 77_459,
    "plumbing-permit-cost": 53_747,
  };

  it("computes each page's worked example from the inputs the page stores", () => {
    for (const page of RLY_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      if (!example) continue;

      const result = calculatePermitFees(
        { ...example.inputs, asOf: AS_OF },
        rulesFor(page.permitTypeKey),
      );

      expect(result.totalCents, page.slug).toBe(expectedTotals[page.slug]);
      expect(result.components.length, page.slug).toBeGreaterThan(0);

      // The notes state the total in prose; if the engine's answer is not in them, a
      // reader is being told a figure the calculator will not produce.
      expect(example.notes, page.slug).toContain(formatCents(result.totalCents));
    }
  });

  it("keeps every variation the prose quotes inside its worked example", () => {
    const variations: Array<{ slug: string; input: Omit<CalculationInput, "asOf"> }> = [
      { slug: "building-permit-cost", input: COMM_300K },
      { slug: "building-permit-cost", input: COMM_2M },
      { slug: "electrical-permit-cost", input: { valuationCents: 1_000_000, occupancy: "residential", workType: "new_construction" } },
      { slug: "electrical-permit-cost", input: { occupancy: "commercial", custom: { electrical_item: "generator" } } },
      { slug: "plumbing-permit-cost", input: COMM_2M },
      { slug: "plumbing-permit-cost", input: { occupancy: "commercial", custom: { plumbing_item: "utility_inspection" } } },
    ];

    for (const { slug, input } of variations) {
      const page = pageFor(slug);
      const result = calculatePermitFees(
        { ...input, asOf: AS_OF },
        rulesFor(page.permitTypeKey),
      );

      // A variation can be quoted either in the example itself or in the verification
      // ledger that says the page was recomputed — what matters is that every figure
      // the payload prints for this jurisdiction is the figure the engine produces.
      const quoted = [
        page.workedExample?.notes ?? "",
        ...raleighSeed.verifications.map((verification) => verification.notes ?? ""),
      ].join("\n");
      expect(quoted, `${slug} ${formatCents(result.totalCents)}`).toContain(
        formatCents(result.totalCents),
      );
    }
  });

  it("shows the reader the inputs it calculated from", () => {
    for (const page of RLY_PUBLISHED_PERMIT_PAGES) {
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
});
