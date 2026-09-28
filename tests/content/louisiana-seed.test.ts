import { describe, expect, it } from "vitest";

import { batonrougeSeed } from "@/content/batonrouge";
import { neworleansSeed } from "@/content/neworleans";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

const asOf = "2026-09-26";

function rulesFor(seed: typeof neworleansSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(
  seed: typeof neworleansSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(seed, permitTypeKey));
}

function totalFor(
  seed: typeof neworleansSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
): number {
  return calculate(seed, permitTypeKey, input).totalCents;
}

function amountFor(
  seed: typeof neworleansSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(seed, permitTypeKey, input).components.find((c) => c.code === code)
    ?.amountCents;
}

function computeWorkedExample(seed: typeof neworleansSeed, permitTypeKey: string) {
  const page = seed.permitPages.find(
    (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
  );
  if (!page || !page.workedExample) return null;
  const input: CalculationInput = {
    asOf,
    ...(page.workedExample.inputs as Partial<CalculationInput>),
  };
  return calculatePermitFees(input, rulesFor(seed, permitTypeKey));
}

function checkSeedShape(seed: typeof neworleansSeed, label: string) {
  it(`${label}: every fee rule validates through the engine schema`, () => {
    for (const entry of seed.feeRules) {
      const validation = validateFeeRule(entry.rule);
      expect(validation.ok, `${entry.rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
        true,
      );
    }
    const ids = seed.feeRules.map((entry) => entry.rule.id);
    expect(new Set(ids).size, "rule ids are the primary key").toBe(ids.length);
  });

  it(`${label}: publishes 3 pages that clear the editorial gate`, () => {
    expect(seed.permitPages).toHaveLength(3);
    expect(seed.permitPages.map((p) => p.slug).sort()).toEqual([
      "building-permit-cost",
      "electrical-permit-cost",
      "plumbing-permit-cost",
    ]);
    for (const page of seed.permitPages) {
      expect(page.intro.length, `${page.slug} intro`).toBeGreaterThanOrEqual(MIN_INTRO_LENGTH);
      expect(page.localSummary.length, `${page.slug} localSummary`).toBeGreaterThanOrEqual(
        MIN_LOCAL_SUMMARY_LENGTH,
      );
      expect(page.faqs?.length ?? 0, `${page.slug} faqs`).toBeGreaterThanOrEqual(4);
      expect(page.publishStatus).toBe("published");
      expect(page.noindex).toBe(false);

      const gate = evaluatePublishability({
        publishStatus: page.publishStatus,
        noindex: page.noindex,
        intro: page.intro,
        localSummary: page.localSummary,
        sourceCount: seed.sources.length,
        feeRuleCount: rulesFor(seed, page.permitTypeKey).length,
        lastVerifiedAt: page.lastReviewedAt,
        faqCount: page.faqs?.length ?? 0,
        asOf,
      });
      expect(gate.failures, `${page.slug}: ${gate.failures.join("; ")}`).toEqual([]);
      expect(gate.indexable).toBe(true);
    }
  });

  it(`${label}: computes every worked example above zero with only condition exclusions`, () => {
    for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
      const result = computeWorkedExample(seed, permitTypeKey);
      expect(result, `worked example for ${permitTypeKey}`).not.toBeNull();
      expect(result!.components.length).toBeGreaterThan(0);
      expect(result!.totalCents, `${permitTypeKey} total`).toBeGreaterThan(0);
      for (const excluded of result!.excluded) {
        expect(excluded.reason).toBe("conditions_not_met");
      }
    }
  });

  it(`${label}: ties every rule's source to a declared primary official source`, () => {
    expect(seed.sources.length).toBeGreaterThan(0);
    const sourceKeys = new Set(seed.sources.map((source) => source.key));
    for (const source of seed.sources) {
      expect(source.isPrimary, source.key).toBe(true);
      expect(source.lastVerifiedAt, source.key).not.toBeNull();
      expect(new URL(source.url).protocol, source.url).toBe("https:");
    }
    for (const entry of seed.feeRules) {
      if (entry.rule.sourceId !== null) {
        expect(sourceKeys.has(entry.rule.sourceId), entry.rule.sourceId).toBe(true);
      }
    }
  });

  it(`${label}: verifies every permit page in the ledger`, () => {
    for (const page of seed.permitPages) {
      const record = seed.verifications.find(
        (entry) => entry.entityType === "permit_page" && entry.entityKey === page.slug,
      );
      expect(record, page.slug).toBeDefined();
      expect(record?.status, page.slug).toBe("verified");
      expect(record?.verifiedAt, page.slug).toBe(page.lastReviewedAt);
    }
  });
}

describe("Louisiana seed payloads", () => {
  describe("New Orleans, LA", () => {
    it("identifies the jurisdiction, its state and its parish", () => {
      expect(neworleansSeed.state).toMatchObject({ code: "LA", slug: "louisiana", fipsCode: "22" });
      expect(neworleansSeed.county).toMatchObject({ key: "orleans-parish", fipsCode: "22071" });
      expect(neworleansSeed.jurisdiction).toMatchObject({
        key: "new-orleans",
        slug: "new-orleans",
        countyKey: "orleans-parish",
        timezone: "America/Chicago",
        isActive: true,
      });
    });

    it("names the Sewerage & Water Board as the plumbing authority", () => {
      // Two departments, and the plumbing one is the Board's — the split the
      // City's own guide states.
      const plumbingDept = neworleansSeed.departments.find((d) => d.key === "swbno-plumbing");
      expect(plumbingDept).toBeDefined();
      expect(plumbingDept!.name).toContain("Sewerage & Water Board");
      const plumbingPage = neworleansSeed.permitPages.find((p) => p.permitTypeKey === "plumbing");
      expect(plumbingPage!.title).toContain("Sewerage & Water Board");
      const plumbingSource = neworleansSeed.sources.find(
        (s) => s.key === neworleansSeed.feeRules.find((f) => f.permitTypeKey === "plumbing")!
          .rule.sourceId,
      );
      expect(plumbingSource!.issuingAuthority).toContain("Sewerage & Water Board");
      expect(plumbingSource!.authorityKind).toBe("other");
    });

    checkSeedShape(neworleansSeed, "New Orleans");

    it("reproduces the building worked example — $220,000 with plan review", () => {
      const result = computeWorkedExample(neworleansSeed, "building");
      // $60 + $5 × 220 = $1,160.00; plan review $1 × 220 = $220.00. Total $1,380.00.
      expect(result!.totalCents).toBe(138_000);
      expect(result!.components.find((c) => c.code === "NOLA-BLD-PERMIT")?.amountCents).toBe(
        116_000,
      );
      expect(result!.components.find((c) => c.code === "NOLA-BLD-PLAN-REVIEW")?.amountCents).toBe(
        22_000,
      );
    });

    it("prorates the per-$1,000 rates — the City's own formula multiplies straight through", () => {
      // $60 + $5 × 220.5 = $1,162.50 — no round-up anywhere.
      expect(
        amountFor(
          neworleansSeed,
          "building",
          { valuationCents: 220_500_00, occupancy: "residential", workType: "new_construction" },
          "NOLA-BLD-PERMIT",
        ),
      ).toBe(116_250);
    });

    it("keeps the $60 plan review minimum live on small jobs", () => {
      // $1 per $1,000 of a $20,000 job is $20 — the $60 minimum charges.
      const small = calculate(neworleansSeed, "building", {
        valuationCents: 2_000_000,
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(small.components.find((c) => c.code === "NOLA-BLD-PLAN-REVIEW")?.amountCents).toBe(
        6_000,
      );
    });

    it("charges the 50% historic surcharge on the permit fee, and only inside the districts", () => {
      // Same $220,000 job inside the VCC: permit $1,160 + $580 surcharge + $220 plan review.
      const historic = calculate(neworleansSeed, "building", {
        valuationCents: 22_000_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: { historic_district: true },
      });
      expect(historic.components.find((c) => c.code === "NOLA-BLD-HISTORIC-50")?.amountCents).toBe(
        58_000,
      );
      expect(historic.totalCents).toBe(116_000 + 58_000 + 22_000);

      const ordinary = calculate(neworleansSeed, "building", {
        valuationCents: 22_000_000,
        occupancy: "commercial",
        workType: "alteration",
        custom: { historic_district: false },
      });
      expect(ordinary.components.find((c) => c.code === "NOLA-BLD-HISTORIC-50")).toBeUndefined();
    });

    it("prices demolition from its own base, not the building permit's", () => {
      // $95 + $5 × 50 = $345.00 on a $50,000 demolition.
      expect(
        amountFor(
          neworleansSeed,
          "building",
          { valuationCents: 5_000_000, workType: "demolition" },
          "NOLA-BLD-DEMO",
        ),
      ).toBe(34_500);
    });

    it("reproduces the electrical worked example — 12 circuits on 200 amps", () => {
      const result = computeWorkedExample(neworleansSeed, "electrical");
      // $40 + 12 × $3 + 200 × $0.30 = $136.00.
      expect(result!.totalCents).toBe(13_600);
      expect(result!.components.find((c) => c.code === "NOLA-ELEC-APPLICATION")?.amountCents).toBe(
        4_000,
      );
      expect(result!.components.find((c) => c.code === "NOLA-ELEC-CIRCUITS")?.amountCents).toBe(
        3_600,
      );
      expect(result!.components.find((c) => c.code === "NOLA-ELEC-AMPERAGE")?.amountCents).toBe(
        6_000,
      );
    });

    it("carries only the one published SWB amount, and states the gap", () => {
      const result = computeWorkedExample(neworleansSeed, "plumbing");
      expect(result!.totalCents).toBe(5_000);
      expect(result!.components.map((c) => c.code)).toEqual(["NOLA-PLUMB-SWB-FILING"]);

      // The page's prose must state the unpublished remainder — that is what
      // keeps the honest gap from becoming an invented number.
      const page = neworleansSeed.permitPages.find((p) => p.permitTypeKey === "plumbing");
      expect(page!.intro).toMatch(/publishes no complete public schedule/i);
      const verification = neworleansSeed.verifications.find(
        (v) => v.entityType === "fee_schedule" && v.entityKey === "nola-plumbing-schedule",
      );
      expect(verification!.status).toBe("needs_review");
    });
  });

  describe("Baton Rouge, LA", () => {
    it("identifies the jurisdiction, its state and its parish", () => {
      expect(batonrougeSeed.state).toMatchObject({ code: "LA", slug: "louisiana", fipsCode: "22" });
      expect(batonrougeSeed.county).toMatchObject({
        key: "east-baton-rouge-parish",
        fipsCode: "22033",
      });
      expect(batonrougeSeed.jurisdiction).toMatchObject({
        key: "baton-rouge",
        slug: "baton-rouge",
        countyKey: "east-baton-rouge-parish",
        timezone: "America/Chicago",
        isActive: true,
      });
    });

    checkSeedShape(batonrougeSeed, "Baton Rouge");

    it("reproduces the residential worked example — 2,500 sq ft new home", () => {
      const result = computeWorkedExample(batonrougeSeed, "building");
      // 2,500 × $0.80 + $125 = $2,125.00; technology $25.00. Total $2,150.00.
      expect(result!.totalCents).toBe(215_000);
      expect(result!.components.find((c) => c.code === "BRLA-RES-NEW")?.amountCents).toBe(212_500);
      expect(result!.components.find((c) => c.code === "BRLA-TECH-FEE")?.amountCents).toBe(2_500);
    });

    it("enforces the residential minimums by work type", () => {
      // A small addition (100 sq ft): $80 + $125 = $205 → the $250 minimum charges.
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { squareFootage: 100, occupancy: "residential", workType: "addition" },
          "BRLA-RES-ADDITION",
        ),
      ).toBe(25_000);
      // The same 100 sq ft as a new building pays $125 + $80 = $205 — above its $125 minimum.
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { squareFootage: 100, occupancy: "residential", workType: "new_construction" },
          "BRLA-RES-NEW",
        ),
      ).toBe(20_500);
    });

    it("prices the commercial ladder with chained bases and exact prorating", () => {
      // $150,000 → $500 + 50 × $4 = $700.00 exactly.
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 15_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-COM-100K-500K",
        ),
      ).toBe(70_000);
      // The chains: $10,000 → 10 × $5 = $50.00 (band 2's base is $500 at $100k, verified
      // by $100,000 → 100 × $5 = $500).
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 10_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-COM-100K",
        ),
      ).toBe(50_000);
      // $500,000 → $500 + 400 × $4 = $2,100.00 (band 3's printed base).
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 50_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-COM-100K-500K",
        ),
      ).toBe(210_000);
      // $500,000 plan review → 500 × $3 = $1,500.00 (band 2's printed base).
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 50_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-PLAN-500K",
        ),
      ).toBe(150_000);
    });

    it("prices the $220,000 commercial job with plan review and technology fee", () => {
      // The page's commercial narrative: permit $500 + $4 × 120 = $980; plan review
      // $3 × 220 = $660; tech $25. Total $1,665.
      const result = calculate(batonrougeSeed, "building", {
        valuationCents: 22_000_000,
        squareFootage: 4_000,
        occupancy: "commercial",
        workType: "alteration",
      });
      expect(result.totalCents).toBe(166_500);
      expect(result.components.find((c) => c.code === "BRLA-COM-100K-500K")?.amountCents).toBe(
        98_000,
      );
      expect(result.components.find((c) => c.code === "BRLA-PLAN-500K")?.amountCents).toBe(66_000);
      expect(result.components.find((c) => c.code === "BRLA-TECH-FEE")?.amountCents).toBe(2_500);
    });

    it("keeps the $100 commercial minimums live", () => {
      // A $10,000 commercial job: $5 × 10 = $50 → the $100 minimum charges.
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 1_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-COM-100K",
        ),
      ).toBe(10_000);
      // Plan review on the same job: $3 × 10 = $30 → $100 minimum.
      expect(
        amountFor(
          batonrougeSeed,
          "building",
          { valuationCents: 1_000_000, occupancy: "commercial", workType: "alteration" },
          "BRLA-PLAN-500K",
        ),
      ).toBe(10_000);
    });

    it("prices trade permits flat by occupancy and valuation band", () => {
      // Residential flat $125 + tech $25.
      expect(computeWorkedExample(batonrougeSeed, "plumbing")!.totalCents).toBe(15_000);
      // Commercial electrical at $220,000: $300 band + $25 tech.
      const elec = calculate(batonrougeSeed, "electrical", {
        valuationCents: 22_000_000,
        occupancy: "commercial",
        workType: "alteration",
      });
      expect(elec.components.find((c) => c.code === "BRLA-ELEC-COM")?.amountCents).toBe(30_000);
      expect(elec.totalCents).toBe(32_500);
      // Over $2M: the $600 band.
      expect(
        amountFor(
          batonrougeSeed,
          "electrical",
          { valuationCents: 250_000_000, occupancy: "commercial", workType: "new_construction" },
          "BRLA-ELEC-COM",
        ),
      ).toBe(60_000);
    });

    it("keeps the two commercial ladders from answering residential work", () => {
      const res = calculate(batonrougeSeed, "building", {
        valuationCents: 22_000_000,
        squareFootage: 2_500,
        occupancy: "residential",
        workType: "new_construction",
      });
      expect(res.components.find((c) => c.code === "BRLA-COM-100K-500K")).toBeUndefined();
      expect(res.components.find((c) => c.code === "BRLA-PLAN-500K")).toBeUndefined();
    });
  });
});
