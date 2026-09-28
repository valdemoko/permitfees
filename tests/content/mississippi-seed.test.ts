import { describe, expect, it } from "vitest";

import { gulfportSeed } from "@/content/gulfport";
import { jacksonSeed } from "@/content/jackson";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import type { CalculationInput, FeeRuleRecord } from "@/lib/calc/types";
import { MIN_INTRO_LENGTH, MIN_LOCAL_SUMMARY_LENGTH, evaluatePublishability } from "@/lib/editorial";

const asOf = "2026-09-26";

function rulesFor(seed: typeof gulfportSeed, permitTypeKey: string): FeeRuleRecord[] {
  return seed.feeRules
    .filter((entry) => entry.permitTypeKey === permitTypeKey)
    .map((entry) => entry.rule);
}

function calculate(
  seed: typeof gulfportSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
) {
  return calculatePermitFees({ asOf, ...input }, rulesFor(seed, permitTypeKey));
}

function totalFor(
  seed: typeof gulfportSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
): number {
  return calculate(seed, permitTypeKey, input).totalCents;
}

function amountFor(
  seed: typeof gulfportSeed,
  permitTypeKey: string,
  input: Omit<CalculationInput, "asOf">,
  code: string,
): number | undefined {
  return calculate(seed, permitTypeKey, input).components.find((c) => c.code === code)
    ?.amountCents;
}

function checkSeedShape(
  seed: typeof gulfportSeed,
  label: string,
  opts: { hasNoScheduleStatement?: boolean } = {},
) {
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
        hasNoScheduleStatement: opts.hasNoScheduleStatement,
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
      // A no-schedule jurisdiction publishes pages with no worked example at
      // all (Jackson); every worked example that exists must compute.
      if (result === null) {
        const page = seed.permitPages.find(
          (p) => p.publishStatus === "published" && p.permitTypeKey === permitTypeKey,
        );
        expect(page?.workedExample, `${permitTypeKey} page`).toBeNull();
        continue;
      }
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.totalCents, `${permitTypeKey} total`).toBeGreaterThan(0);
      for (const excluded of result.excluded) {
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

function computeWorkedExample(seed: typeof gulfportSeed, permitTypeKey: string) {
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

describe("Mississippi seed payloads", () => {
  describe("Gulfport, MS", () => {
    checkSeedShape(gulfportSeed, "Gulfport");

    it("identifies the jurisdiction, its state and its county", () => {
      expect(gulfportSeed.state).toMatchObject({ code: "MS", slug: "mississippi", fipsCode: "28" });
      expect(gulfportSeed.county).toMatchObject({
        key: "harrison-county-ms",
        name: "Harrison County",
        fipsCode: "28047",
      });
      expect(gulfportSeed.jurisdiction).toMatchObject({
        key: "gulfport",
        officialName: expect.stringContaining("Building Code Services"),
        websiteUrl: "https://www.gulfport-ms.gov",
      });
    });

    it("charges the $30.00 base fee on every permit type", () => {
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        const result = calculate(gulfportSeed, permitTypeKey, {});
        const base = result.components.find((c) => c.code.endsWith("-BASE-30"));
        expect(base?.amountCents, `${permitTypeKey}: ${base?.code}`).toBe(3_000);
      }
    });

    it("prices the building ladder from the schedule's own prose rule", () => {
      // $220,000: $30 base + $24 first $1,000 + 219 x $4 (or fraction thereof)
      expect(totalFor(gulfportSeed, "building", { valuationCents: 22_000_000 })).toBe(93_000);

      // The printed rows are the same arithmetic: $89,002-$90,001 prints $380.00
      // ($24 + 89 x $4), plus the $30 base = $410.
      expect(totalFor(gulfportSeed, "building", { valuationCents: 9_000_000 })).toBe(41_000);
      expect(amountFor(gulfportSeed, "building", { valuationCents: 9_000_000 }, "GP-BLD-LADDER")).toBe(
        38_000,
      );

      // A fraction into a band rounds up: $1,500 buys two bands.
      expect(amountFor(gulfportSeed, "building", { valuationCents: 150_000 }, "GP-BLD-LADDER")).toBe(
        2_800,
      );
    });

    it("switches to the printed top band above $500,001", () => {
      // $500,001 exactly: last rung of the $4 ladder = $24 + 500 x $4 = $2,024 (+ base)
      expect(amountFor(gulfportSeed, "building", { valuationCents: 50_000_100 }, "GP-BLD-LADDER")).toBe(
        202_400,
      );
      // $500,002 and up: $2,020 for the first $500,000 + $3.20 per additional $1,000 or fraction
      // ($500,001 of valuation is one fraction into the top band: $2,020 + $3.20)
      expect(
        amountFor(gulfportSeed, "building", { valuationCents: 50_000_101 }, "GP-BLD-500K-UP"),
      ).toBe(202_320);
      // $1,000,000: $2,020 + 500 x $3.20 = $3,620 (+ $30 base = $3,650)
      expect(totalFor(gulfportSeed, "building", { valuationCents: 100_000_000 })).toBe(365_000);
    });

    it("prices the electrical service ladder by amperage", () => {
      const amps = (amperage: number) =>
        calculate(gulfportSeed, "electrical", { custom: { amperage } }).components.find(
          (c) => c.code.startsWith("GP-ELEC-SVC") && c.code !== "GP-ELEC-SVC-1000UP",
        )?.amountCents;

      expect(amps(100)).toBe(1_000); // $10
      expect(amps(125)).toBe(2_000); // $20
      expect(amps(200)).toBe(2_000);
      expect(amps(400)).toBe(3_000); // $30
      expect(amps(600)).toBe(4_000); // $40
      expect(amps(800)).toBe(5_000); // $50
      expect(amps(801)).toBeUndefined(); // above the printed bands: per-ampere row takes over
    });

    it("charges $2.00 per additional ampere above the service ladder", () => {
      // 1,000 A: $2.00 x (1,000 - 800) = $400.00, on top of the $30 base fee
      expect(
        amountFor(gulfportSeed, "electrical", { custom: { amperage: 1_000 } }, "GP-ELEC-SVC-1000UP"),
      ).toBe(40_000);
      // 850 A: $2.00 x 50 = $100.00
      expect(
        amountFor(gulfportSeed, "electrical", { custom: { amperage: 850 } }, "GP-ELEC-SVC-1000UP"),
      ).toBe(10_000);
    });

    it("charges $0.25 per ampere for distribution and sub-panels — the bands are the same rate", () => {
      // The printed ranges ($31.25-$50.00 at 125-200 A) are 125 x .25 to 200 x .25.
      // Gated on the job including a distribution/sub-panel row.
      const subpanel = (amperage: number) =>
        amountFor(
          gulfportSeed,
          "electrical",
          { custom: { subpanel: true, amperage } },
          "GP-ELEC-SUBPANEL",
        );
      expect(subpanel(200)).toBe(5_000);
      expect(subpanel(125)).toBe(3_125);
      expect(subpanel(100)).toBe(2_500);
      // Not charged when the job has no sub-panel row.
      expect(
        amountFor(gulfportSeed, "electrical", { custom: { amperage: 200 } }, "GP-ELEC-SUBPANEL"),
      ).toBeUndefined();
    });

    it("prices branch circuits, appliance rows and the miscellaneous $30 charges", () => {
      expect(
        amountFor(gulfportSeed, "electrical", { custom: { circuits: 4 } }, "GP-ELEC-BRANCH"),
      ).toBe(2_400);
      expect(
        amountFor(gulfportSeed, "electrical", { custom: { ac_units: 1 } }, "GP-ELEC-WINDOWAC"),
      ).toBe(1_200);
      expect(
        amountFor(
          gulfportSeed,
          "electrical",
          { custom: { temporary_service: true } },
          "GP-ELEC-TEMP-SVC",
        ),
      ).toBe(3_000);
      // Worked example: 200A service + 4 branch circuits + window A/C
      // = $30 + $20 + $24 + $12 = $86. Feeder circuits are a separate ladder keyed
      // to feeder amperage (custom.feeder_amperage) and stay out of this total.
      expect(
        totalFor(gulfportSeed, "electrical", {
          valuationCents: 1_200_000,
          occupancy: "residential",
          workType: "alteration",
          custom: { amperage: 200, circuits: 4, ac_units: 1 },
        }),
      ).toBe(8_600);
    });

    it("prices the plumbing fixture list, with the $50 water connection as the standout row", () => {
      // Worked example: base $30 + 3 x $5 fixtures + $7 lavatory + $7 floor drain
      // + $10 water heater + $50 water connection = $119
      expect(
        totalFor(gulfportSeed, "plumbing", {
          valuationCents: 1_000_000,
          occupancy: "residential",
          workType: "alteration",
          fixtures: 3,
          custom: {
            lavatories: 1,
            floor_drains: 1,
            water_heaters: 1,
            water_service_connections: 1,
          },
        }),
      ).toBe(11_900);
      expect(amountFor(gulfportSeed, "plumbing", { fixtures: 1 }, "GP-PL-WATER-CONN")).toBeUndefined();
    });

    it("prices sprinkler heads at $10 for 1-5 and $2 each additional", () => {
      expect(amountFor(gulfportSeed, "plumbing", { custom: { sprinkler_heads: 5 } }, "GP-PL-SPRINKLERS")).toBe(
        1_000,
      );
      expect(amountFor(gulfportSeed, "plumbing", { custom: { sprinkler_heads: 10 } }, "GP-PL-SPRINKLERS")).toBe(
        2_000,
      );
    });

    it("keeps the FY 2002 vintage stated in the sources and the schedules", () => {
      for (const key of ["gulfport-electrical-fee-schedule", "gulfport-plumbing-fee-schedule"]) {
        const source = gulfportSeed.sources.find((s) => s.key === key);
        expect(source?.documentDate, key).toBe("2002-10-01");
      }
      // And the page prose states it.
      const elecPage = gulfportSeed.permitPages.find((p) => p.permitTypeKey === "electrical");
      expect(elecPage!.intro).toMatch(/FY 2002/i);
      const plumbPage = gulfportSeed.permitPages.find((p) => p.permitTypeKey === "plumbing");
      expect(plumbPage!.intro).toMatch(/FY 2002/i);
    });
  });

  describe("Jackson, MS", () => {
    checkSeedShape(jacksonSeed, "Jackson", { hasNoScheduleStatement: true });

    it("identifies the jurisdiction, its state and its county", () => {
      expect(jacksonSeed.state).toMatchObject({ code: "MS", slug: "mississippi", fipsCode: "28" });
      expect(jacksonSeed.county).toMatchObject({
        key: "hinds-county-ms",
        name: "Hinds County",
        fipsCode: "28049",
      });
      expect(jacksonSeed.jurisdiction).toMatchObject({
        key: "jackson",
        officialName: expect.stringContaining("Code Services"),
        websiteUrl: "https://www.jacksonms.gov",
      });
    });

    it("publishes zero fee rules — the honest no-schedule case", () => {
      expect(jacksonSeed.feeRules).toHaveLength(0);
      for (const permitTypeKey of ["building", "electrical", "plumbing"]) {
        expect(rulesFor(jacksonSeed, permitTypeKey)).toHaveLength(0);
      }
    });

    it("clears the editorial gate through the no-schedule statement, not through rules", () => {
      for (const page of jacksonSeed.permitPages) {
        const gate = evaluatePublishability({
          publishStatus: page.publishStatus,
          noindex: page.noindex,
          intro: page.intro,
          localSummary: page.localSummary,
          sourceCount: jacksonSeed.sources.length,
          feeRuleCount: 0,
          hasNoScheduleStatement: true,
          lastVerifiedAt: page.lastReviewedAt,
          faqCount: page.faqs?.length ?? 0,
          asOf,
        });
        expect(gate.publishable, `${page.slug}: ${gate.failures.join("; ")}`).toBe(true);
      }
      // And the counterfactual: without the statement, a zero-rule page fails.
      const failing = evaluatePublishability({
        publishStatus: "published",
        noindex: false,
        intro: "x".repeat(MIN_INTRO_LENGTH),
        localSummary: "x".repeat(MIN_LOCAL_SUMMARY_LENGTH),
        sourceCount: 1,
        feeRuleCount: 0,
        lastVerifiedAt: asOf,
        faqCount: 1,
        asOf,
      });
      expect(failing.publishable).toBe(false);
      expect(failing.failures.some((f) => f.includes("no active fee rules"))).toBe(true);
    });

    it("carries no worked example and no dollar amount in any page prose or FAQ", () => {
      for (const page of jacksonSeed.permitPages) {
        expect(page.workedExample, page.slug).toBeNull();
      }
      // The intro of every page states the absence.
      for (const page of jacksonSeed.permitPages) {
        expect(page.intro.toLowerCase()).toMatch(/publishes no|not published|no public|isn't published|is not published/);
      }
      // FAQ answers may name the process but must not price it: no "$X" amounts
      // asserted as Jackson's own fees. The one exception quotes the uncorroborated
      // third-party figure in order to warn against it — pinned explicitly.
      for (const page of jacksonSeed.permitPages) {
        for (const faq of page.faqs ?? []) {
          if (faq.question.startsWith("Why doesn't Jackson publish")) {
            expect(faq.answer, `${page.slug}: ${faq.question}`).toMatch(/\$85 base/);
            continue;
          }
          expect(faq.answer, `${page.slug}: ${faq.question}`).not.toMatch(/\$\d/);
        }
      }
    });

    it("records the OpenGov login-wall finding in the fee-schedule verification row", () => {
      const record = jacksonSeed.verifications.find(
        (entry) => entry.entityType === "fee_schedule",
      );
      expect(record?.status).toBe("needs_review");
      expect(record?.method).toBe("official_portal_check");
      expect(record?.notes).toMatch(/Viewpoint Cloud|sign-in/i);
    });

    it("cites only official primary sources", () => {
      for (const source of jacksonSeed.sources) {
        expect(source.isPrimary).toBe(true);
        expect(new URL(source.url).hostname).toMatch(/jacksonms\.gov|opengov\.com|municode\.com$/);
      }
    });
  });
});
