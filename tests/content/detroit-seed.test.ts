import { describe, expect, it } from "vitest";

import { detroitSeed } from "@/content/detroit";
import { validateFeeRule } from "@/lib/calc";
import { calculatePermitFees } from "@/lib/calc/engine";
import type { FeeRuleRecord } from "@/lib/calc/types";
import { evaluatePublishability } from "@/lib/editorial";

/**
 * Michigan, pass 15 — Detroit, the state's first jurisdiction.
 *
 * One 51-page schedule, three mechanisms, and the four things each can get
 * wrong are what the arithmetic below pins:
 *
 *  1. the building ladder **rounds up**, because every rate row prints "or
 *     fraction thereof" — $2,000.01 pays a full $34.09 step ($305.52), and the
 *     first band is a floor stated as a row ($1,500 is $271.43, not less);
 *  2. the bands **do not chain**, so each is charged from its own printed base
 *     — the seam at $25,000 is $1,055.50 against the printed $1,055.57, and
 *     both sides are asserted;
 *  3. electrical's eight service rows are gated by **two** facts — amperage
 *     within a voltage class — so exactly one can fire, the fixture split
 *     defaults commercial, and the $66 base fee sits in front of everything;
 *  4. plumbing's $73 application fee is **non-refundable and credited
 *     nowhere**, so it is a line rather than a floor, while the $146 drain row
 *     reads `connections` and the $44 catch-all reads `fixtures`.
 *
 * Demolition is refused by every building band (the schedule prices wrecking
 * by cubic volume), and plan review's three published forms are named on the
 * pages and summed nowhere.
 */

const AS_OF = "2026-09-25";

function rulesFor(permitTypeKey: string): FeeRuleRecord[] {
  return detroitSeed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function amountOf(result: ReturnType<typeof calculatePermitFees>, code: string): number | undefined {
  return result.components.find((component) => component.code === code)?.amountCents;
}

describe("Detroit seed", () => {
  it("validates all fee rules through the engine schema", () => {
    for (const entry of detroitSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(true);
    }
  });

  it("has 25 rules across the three permits Detroit publishes", () => {
    expect(detroitSeed.feeRules).toHaveLength(25);
    expect(rulesFor("building")).toHaveLength(9);
    expect(rulesFor("electrical")).toHaveLength(12);
    expect(rulesFor("plumbing")).toHaveLength(4);
  });

  it("publishes exactly building, electrical and plumbing", () => {
    expect(detroitSeed.jurisdictionPermitTypes.map((entry) => entry.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(detroitSeed.permitPages.map((page) => page.permitTypeKey)).toEqual([
      "building",
      "electrical",
      "plumbing",
    ]);
    expect(detroitSeed.profile.notIncluded).toContain("mechanical block");
  });

  it("keeps every rule code unique inside a permit type", () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const codes = rulesFor(permitTypeKey).map((rule) => rule.code);
      expect(new Set(codes).size, permitTypeKey).toBe(codes.length);
    }
  });

  it("keeps every cited source inside the payload", () => {
    const keys = new Set(detroitSeed.sources.map((source) => source.key));
    for (const entry of detroitSeed.feeRules) {
      if (entry.rule.sourceId) expect(keys.has(entry.rule.sourceId), entry.rule.code).toBe(true);
    }
    for (const page of detroitSeed.permitPages) {
      for (const faq of page.faqs ?? []) {
        expect(keys.has(faq.sourceId as string), `${page.slug}: ${faq.question}`).toBe(true);
      }
    }
    for (const requirement of detroitSeed.requirements) {
      if (requirement.sourceKey) {
        expect(keys.has(requirement.sourceKey), requirement.title).toBe(true);
      }
    }
    for (const verification of detroitSeed.verifications) {
      if (verification.sourceKey) {
        expect(keys.has(verification.sourceKey), verification.entityKey).toBe(true);
      }
    }
  });

  it("has 3 published permit pages that clear the editorial gate", () => {
    expect(detroitSeed.permitPages).toHaveLength(3);
    for (const page of detroitSeed.permitPages) {
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const result = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: detroitSeed.sources.length,
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
    for (const page of detroitSeed.permitPages) {
      const faqs = page.faqs ?? [];
      expect(faqs.length, page.slug).toBeGreaterThanOrEqual(4);
      expect(faqs.length, page.slug).toBeLessThanOrEqual(6);
      for (const faq of faqs) {
        expect(faq.sourceId, `${page.slug}: ${faq.question}`).toBeTruthy();
      }
    }
  });

  it("verifies every source and the fee schedule on the research date", () => {
    expect(detroitSeed.sources.length).toBeGreaterThanOrEqual(6);
    for (const source of detroitSeed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).toBe(AS_OF);
      expect(source.retrievedAt, source.key).toBe(AS_OF);
    }

    const keys = detroitSeed.sources.map((source) => source.key);
    const urls = detroitSeed.sources.map((source) => source.url);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(urls).size).toBe(urls.length);

    expect(detroitSeed.feeSchedules).toHaveLength(1);
    expect(detroitSeed.feeSchedules[0]?.status).toBe("active");
    expect(detroitSeed.feeSchedules[0]?.effectiveFrom).toBe("2024-01-01");
    expect(detroitSeed.feeSchedules[0]?.lastVerifiedAt).toBe(AS_OF);
  });

  it("records verifications for the profile, every page, the schedule and the sources", () => {
    const types = new Set(detroitSeed.verifications.map((entry) => entry.entityType));
    expect(types).toContain("jurisdiction_profile");
    expect(types).toContain("permit_page");
    expect(types).toContain("fee_schedule");
    expect(types).toContain("source");
    expect(types).toContain("fee_rule");

    for (const source of detroitSeed.sources) {
      const record = detroitSeed.verifications.find(
        (entry) => entry.entityType === "source" && entry.entityKey === source.key,
      );
      expect(record, source.key).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    for (const page of detroitSeed.permitPages) {
      const record = detroitSeed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.verifiedAt).toBe(AS_OF);
    }

    // Whether the $66 electrical base fee is per permit or per application is
    // the one reading the schedule does not settle; it is recorded rather than
    // smoothed over, and it is the only such record in this payload.
    const needsReview = detroitSeed.verifications.filter(
      (entry) => entry.status === "needs_review",
    );
    expect(needsReview.map((entry) => entry.entityKey)).toEqual(["DET-ELEC-BASE"]);
    expect(detroitSeed.verifications.filter((entry) => entry.status === "disputed")).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Building — the nine-band ladder, its floor, its round-up and its seams  */
  /* ---------------------------------------------------------------------- */

  it("treats the first band as the floor stated as a row", () => {
    const result = calculatePermitFees({ asOf: AS_OF, valuationCents: 150_000 }, rulesFor("building"));

    // $1,500 of project cost is "$2,000 or less — Flat — $271.43", and the
    // ladder's other eight bands are excluded rather than layered.
    expect(result.components.map((component) => component.code)).toEqual(["DET-BLD-BAND-1"]);
    expect(result.totalCents).toBe(27_143);
    expect(result.warnings).toEqual([]);
    expect(
      result.excluded.filter((entry) => entry.reason === "conditions_not_met"),
    ).toHaveLength(8);
  });

  it("rounds the amount above the threshold up to a whole $1,000", () => {
    const exact = calculatePermitFees({ asOf: AS_OF, valuationCents: 200_000 }, rulesFor("building"));
    expect(amountOf(exact, "DET-BLD-BAND-1")).toBe(27_143); // $2,000 exactly is still band 1

    const oneCentOver = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 200_001 },
      rulesFor("building"),
    );
    // One cent above the threshold buys a whole $1,000 step: $271.43 + $34.09
    // = $305.52, not $271.4343.
    expect(amountOf(oneCentOver, "DET-BLD-BAND-2")).toBe(30_552);
    expect(oneCentOver.totalCents).toBe(30_552);
    expect(oneCentOver.warnings).toEqual([]);
  });

  it("charges each band from its own printed base, never from chained arithmetic", () => {
    // At exactly $25,000 the second band computes $271.43 + 23 × $34.09.
    const atSeam = calculatePermitFees({ asOf: AS_OF, valuationCents: 2_500_000 }, rulesFor("building"));
    expect(amountOf(atSeam, "DET-BLD-BAND-2")).toBe(105_550); // $1,055.50 — not the printed $1,055.57

    // One cent later the third band takes over at its printed base plus one
    // rounded-up step: $1,055.57 + $24.53 = $1,080.10.
    const overSeam = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 2_500_001 },
      rulesFor("building"),
    );
    expect(amountOf(overSeam, "DET-BLD-BAND-3")).toBe(108_010);
    expect(overSeam.totalCents).toBe(108_010);
  });

  it("prices a mid-ladder project from the fourth band's printed figures", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 18_000_000, workType: "remodel" },
      rulesFor("building"),
    );

    expect(result.components.map((component) => component.code)).toEqual(["DET-BLD-BAND-4"]);
    // $80,000 above the threshold = 80 steps × $27.82 = $2,225.60, plus the
    // band's printed Base of $2,895.29.
    expect(amountOf(result, "DET-BLD-BAND-4")).toBe(512_089);
    expect(result.totalCents).toBe(512_089);
    expect(result.warnings).toEqual([]);
  });

  it("prices the open top band above $50,000,000", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 6_000_000_000 },
      rulesFor("building"),
    );

    // $10,000,000 above the threshold = 10,000 steps × $1.81 = $18,100.00,
    // plus the printed Base of $271,433.32.
    expect(amountOf(result, "DET-BLD-BAND-9")).toBe(28_953_332);
    expect(result.totalCents).toBe(28_953_332);
  });

  it("refuses the ladder for demolition, because wrecking is priced by volume", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, valuationCents: 18_000_000, workType: "demolition" },
      rulesFor("building"),
    );

    expect(result.components).toEqual([]);
    expect(result.excluded.map((entry) => entry.code)).toEqual(
      expect.arrayContaining([
        "DET-BLD-BAND-1",
        "DET-BLD-BAND-4",
        "DET-BLD-BAND-5",
        "DET-BLD-BAND-9",
      ]),
    );
    expect(result.excluded.every((entry) => entry.reason === "conditions_not_met")).toBe(true);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });

  it("charges nothing when no project cost is declared, and says so", () => {
    const result = calculatePermitFees({ asOf: AS_OF }, rulesFor("building"));

    // Every band is gated on the valuation, so nothing computes and nothing is
    // invented: the nine bands are excluded and the absence is reported.
    expect(result.components).toEqual([]);
    expect(result.excluded).toHaveLength(9);
    expect(result.warnings.join(" ")).toContain("No fee rules matched");
  });

  /* ---------------------------------------------------------------------- */
  /* Electrical — base fee, counts, and eight gated service bands            */
  /* ---------------------------------------------------------------------- */

  it("stacks base fee, circuits, fixtures and exactly one service band", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        occupancy: "residential",
        fixtures: 6,
        custom: { circuits: 4, amperage: 200, over_1000_volts: false },
      },
      rulesFor("electrical"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "DET-ELEC-BASE",
      "DET-ELEC-CIRCUIT",
      "DET-ELEC-FIXTURE-RES",
      "DET-ELEC-SVC-100-200",
    ]);
    expect(amountOf(result, "DET-ELEC-BASE")).toBe(6_600);
    expect(amountOf(result, "DET-ELEC-CIRCUIT")).toBe(8_000); // 4 × $20
    expect(amountOf(result, "DET-ELEC-FIXTURE-RES")).toBe(702); // 6 × $1.17
    expect(amountOf(result, "DET-ELEC-SVC-100-200")).toBe(11_700);
    expect(result.totalCents).toBe(27_002);
    expect(result.warnings).toEqual([]);
  });

  it("defaults the fixture row to commercial when no occupancy is declared", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        fixtures: 6,
        custom: { circuits: 4, amperage: 200, over_1000_volts: false },
      },
      rulesFor("electrical"),
    );

    // Same permit, commercial figure: 6 × $1.46 = $8.76 instead of $7.02.
    expect(amountOf(result, "DET-ELEC-FIXTURE-COM")).toBe(876);
    expect(result.appliedRuleIds).not.toContain("detroit-elec-fixture-res");
    expect(
      result.excluded.find((entry) => entry.code === "DET-ELEC-FIXTURE-RES")?.reason,
    ).toBe("conditions_not_met");
    expect(result.totalCents).toBe(27_176);
  });

  it("picks the voltage class first, so exactly one service row can fire", () => {
    const result = calculatePermitFees(
      {
        asOf: AS_OF,
        occupancy: "commercial",
        fixtures: 1,
        custom: { circuits: 1, amperage: 200, over_1000_volts: true },
      },
      rulesFor("electrical"),
    );

    // 200 A above 1,000 volts takes the high-voltage table ($281), not the
    // low-voltage "Over 100 to 200 amperes" band ($117).
    expect(amountOf(result, "DET-ELEC-SVC-HV-LE200")).toBe(28_100);
    const serviceCodes = result.excluded
      .map((entry) => entry.code)
      .filter((code) => code.startsWith("DET-ELEC-SVC"));
    expect(serviceCodes.sort()).toEqual(
      [
        "DET-ELEC-SVC-LE100",
        "DET-ELEC-SVC-100-200",
        "DET-ELEC-SVC-200-400",
        "DET-ELEC-SVC-400-800",
        "DET-ELEC-SVC-800-1200",
        "DET-ELEC-SVC-GT1200",
        "DET-ELEC-SVC-HV-GT200",
      ].sort(),
    );
    expect(result.totalCents).toBe(36_846);
    expect(result.warnings).toEqual([]);
  });

  it("reports the missing inputs it refuses to guess instead of pricing zero", () => {
    const result = calculatePermitFees({ asOf: AS_OF, fixtures: 1 }, rulesFor("electrical"));

    // The base fee and the fixture row still compute; the circuit count has no
    // default and is named as missing, while every service band is excluded
    // on its condition rather than charged at some band.
    expect(result.components.map((component) => component.code)).toEqual([
      "DET-ELEC-BASE",
      "DET-ELEC-FIXTURE-COM",
    ]);
    expect(result.totalCents).toBe(6_746);
    expect(result.warnings.join(" ")).toContain("custom.circuits");
    expect(
      result.excluded
        .filter((entry) => entry.code.startsWith("DET-ELEC-SVC"))
        .every((entry) => entry.reason === "conditions_not_met"),
    ).toBe(true);
  });

  /* ---------------------------------------------------------------------- */
  /* Plumbing — application line, catch-all items, drains, re-inspection     */
  /* ---------------------------------------------------------------------- */

  it("charges the application fee as its own line plus the counted rows", () => {
    const result = calculatePermitFees(
      { asOf: AS_OF, fixtures: 5, custom: { connections: 1 } },
      rulesFor("plumbing"),
    );

    expect(result.components.map((component) => component.code)).toEqual([
      "DET-PLUMB-APPLICATION",
      "DET-PLUMB-ITEM",
      "DET-PLUMB-DRAIN",
    ]);
    expect(amountOf(result, "DET-PLUMB-APPLICATION")).toBe(7_300);
    expect(amountOf(result, "DET-PLUMB-ITEM")).toBe(22_000); // 5 × $44
    expect(amountOf(result, "DET-PLUMB-DRAIN")).toBe(14_600);
    expect(result.totalCents).toBe(43_900);
    expect(result.warnings).toEqual([]);
  });

  it("adds the re-inspection only when one is actually counted", () => {
    const without = calculatePermitFees(
      { asOf: AS_OF, fixtures: 5, custom: { connections: 1 } },
      rulesFor("plumbing"),
    );
    expect(
      without.excluded.find((entry) => entry.code === "DET-PLUMB-REINSPECTION")?.reason,
    ).toBe("conditions_not_met");

    const withReinspection = calculatePermitFees(
      { asOf: AS_OF, fixtures: 5, custom: { connections: 1, re_inspection: true } },
      rulesFor("plumbing"),
    );
    expect(amountOf(withReinspection, "DET-PLUMB-REINSPECTION")).toBe(17_600);
    expect(withReinspection.totalCents).toBe(61_500);
  });

  it("keeps the fixture count and the connection count in their own namespaces", () => {
    const result = calculatePermitFees({ asOf: AS_OF, fixtures: 1 }, rulesFor("plumbing"));

    // One fixture prices the $44 row only; the drain row has no connection
    // count to read and says so rather than borrowing the fixture count.
    expect(result.totalCents).toBe(11_700);
    expect(result.warnings.join(" ")).toContain("custom.connections");
    expect(result.appliedRuleIds).not.toContain("detroit-plumb-drain");
  });

  /* ---------------------------------------------------------------------- */
  /* The published worked examples, recomputed                               */
  /* ---------------------------------------------------------------------- */

  it("recomputes each published worked example to the total its notes state", () => {
    const expected: Record<string, { totalCents: number; stated: string }> = {
      "building-permit-cost": { totalCents: 512_089, stated: "$5,120.89" },
      "electrical-permit-cost": { totalCents: 27_002, stated: "$270.02" },
      "plumbing-permit-cost": { totalCents: 43_900, stated: "$439.00" },
    };

    for (const page of detroitSeed.permitPages) {
      const example = page.workedExample;
      expect(example, page.slug).not.toBeNull();
      const want = expected[page.slug];
      expect(want, page.slug).toBeDefined();

      const result = calculatePermitFees(
        { asOf: AS_OF, ...example!.inputs },
        rulesFor(page.permitTypeKey),
      );

      expect(result.totalCents, page.slug).toBe(want!.totalCents);
      expect(result.warnings, page.slug).toEqual([]);
      expect(example!.notes, page.slug).toContain(want!.stated);
    }
  });

  it("names the exclusions the pages must not silently drop", () => {
    const profile = detroitSeed.profile;
    expect(profile.notIncluded).toContain("Plan review");
    expect(profile.notIncluded).toContain("square-foot cost table");
    expect(profile.notIncluded).toContain("Demolition and wrecking");
    expect(profile.localContext).toContain("permits.detroitmi.gov");
    expect(profile.valuationBasis).toContain("$305.52");
    expect(detroitSeed.permitPages[0]?.notIncluded).toContain("35%");
  });
});
