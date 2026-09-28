import { sql, type SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { dallasSeed } from "@/content/dallas";
import { calculatePermitFees, validateFeeRule } from "@/lib/calc";
import { isWithinEffectiveWindow } from "@/lib/dates";
import { getDb } from "@/lib/db/client";
import {
  getJurisdictionContext,
  getPermitPageDetail,
  listPermitPages,
  listSitemapEntries,
} from "@/lib/db/queries";
import { evaluatePublishability } from "@/lib/editorial";
import { currentIsoDate } from "@/lib/time";

/**
 * Dallas, end to end, against a real PostgreSQL database.
 *
 * Skipped unless `DATABASE_URL` is set. When it runs, it answers the questions a
 * fixture cannot: does the second jurisdiction actually resolve through the same
 * query layer as the first, are its pages indexable on the data PostgreSQL returns,
 * and — the check worth the whole file — does this site's engine, reading the
 * *stored* rules, reproduce the City of Dallas's own published worked examples to
 * the cent, including the plan review line it refuses to charge.
 */

const DATABASE_URL = process.env.DATABASE_URL;
const db = getDb();

const describeWithDatabase = describe.skipIf(!DATABASE_URL);

async function rawRows<T>(query: SQL): Promise<T[]> {
  if (!db) return [];
  const result: unknown = await db.execute(query);
  if (Array.isArray(result)) return result as T[];
  const envelope = result as { rows?: unknown };
  return Array.isArray(envelope.rows) ? (envelope.rows as T[]) : [];
}

const asOf = currentIsoDate();
const cents = (value: number): string => `$${(value / 100).toFixed(2)}`;

describeWithDatabase("Dallas — database", () => {
  it("resolves the second Texas jurisdiction through the query layer", async () => {
    const context = await getJurisdictionContext("texas", "dallas");

    expect(context).not.toBeNull();
    expect(context?.state.code).toBe("TX");
    expect(context?.jurisdiction.slug).toBe("dallas");
    expect(context?.jurisdiction.officialName).toBe("City of Dallas");
    expect(context?.sources.length).toBe(dallasSeed.sources.length);
    // The query returns a jurisdiction hub only when its profile is published, so
    // reaching this line is the assertion; the date is what proves it is current.
    expect(context?.profile?.lastReviewedAt).toBe(dallasSeed.profile.lastReviewedAt);
    expect(context?.profile?.headline).toContain("Dallas");
  });

  it("shares the state and the permit catalogue with Houston instead of duplicating them", async () => {
    const rows = await rawRows<{ n: number }>(
      sql`select count(*)::int as n from jurisdictions j
          join states s on s.id = j.state_id
          where s.code = 'TX'`,
    );
    expect(rows[0]?.n).toBe(2);

    const permitTypes = await rawRows<{ key: string; n: number }>(
      sql`select key, count(*)::int as n from permit_types group by 1 order by 1`,
    );
    for (const row of permitTypes) {
      expect(row.n, `permit type ${row.key} exists more than once`).toBe(1);
    }
    expect(permitTypes.map((row) => row.key).sort()).toEqual([
      "building",
      "demolition",
      "electrical",
      "mechanical",
      "plumbing",
    ]);
  });

  /* ---------------------------------------------------------------------- */
  /* Pages                                                                  */
  /* ---------------------------------------------------------------------- */

  describe("published pages", () => {
    it("serves exactly the three pages the payload publishes", async () => {
      const context = await getJurisdictionContext("texas", "dallas");
      expect(context).not.toBeNull();
      if (!context) return;

      const pages = await listPermitPages(context.jurisdiction.id);
      expect(pages.map((page) => page.slug).sort()).toEqual([
        "building-permit-cost",
        "electrical-permit-cost",
        "plumbing-permit-cost",
      ]);
    });

    it("404s every page Dallas does not have", async () => {
      const context = await getJurisdictionContext("texas", "dallas");
      expect(context).not.toBeNull();
      if (!context) return;

      for (const slug of [
        "mechanical-permit-cost",
        "demolition-permit-cost",
        "roofing-permit-cost",
        "electrical-inspection-cost",
      ]) {
        expect(await getPermitPageDetail(context.jurisdiction.id, slug), slug).toBeNull();
      }
    });

    it("passes the editorial gate for every published page, from the stored rows", async () => {
      const context = await getJurisdictionContext("texas", "dallas");
      expect(context).not.toBeNull();
      if (!context) return;

      const pages = await listPermitPages(context.jurisdiction.id);
      expect(pages.length).toBe(3);

      for (const summary of pages) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, summary.slug);
        expect(detail, summary.slug).not.toBeNull();
        if (!detail) continue;

        const applicableRules = detail.feeRuleRecords
          .filter(
            (rule) =>
              rule.status === "active" &&
              isWithinEffectiveWindow(asOf, rule.effectiveFrom, rule.effectiveTo),
          )
          .map((rule) => validateFeeRule(rule))
          .filter((result) => result.ok);

        const gate = evaluatePublishability({
          publishStatus: detail.page.publishStatus,
          noindex: detail.page.noindex,
          intro: detail.page.intro,
          localSummary: detail.page.localSummary,
          sourceCount: detail.sources.length,
          feeRuleCount: applicableRules.length,
          lastVerifiedAt: detail.lastVerifiedAt,
          faqCount: Array.isArray(detail.page.faqs) ? detail.page.faqs.length : 0,
          asOf,
        });

        expect(gate.failures, summary.slug).toEqual([]);
        expect(gate.indexable, summary.slug).toBe(true);
      }
    });
  });

  /* ---------------------------------------------------------------------- */
  /* The City's own worked examples, from the stored rules                  */
  /* ---------------------------------------------------------------------- */

  describe("the City's own worked examples, recomputed from PostgreSQL", () => {
    const scenarios = [
      {
        label: "worksheet 1: new single-family dwelling, 2,500 sq ft, 4 trades",
        input: {
          asOf,
          squareFootage: 2_500,
          occupancy: "residential" as const,
          workType: "new_construction" as const,
          custom: { project_class: "one_and_two_family", trades: 4 },
        },
        // S2 prints $2,084.50 for this house, including its $577 plan review.
        cityTotalCents: 208_450,
        publishedCents: 150_750,
      },
      {
        label: "worksheet 3: new commercial office building, $6,000,500, 8 trades",
        input: {
          asOf,
          valuationCents: 600_050_000,
          squareFootage: 25_000,
          occupancy: "commercial" as const,
          workType: "new_construction" as const,
          custom: { project_class: "commercial", trades: 8 },
        },
        cityTotalCents: 3_383_755,
        publishedCents: 3_268_755,
      },
      {
        label: "worksheet 5: multi-family, 200 dwelling units, 6 trades",
        input: {
          asOf,
          units: 200,
          squareFootage: 180_000,
          occupancy: "residential" as const,
          workType: "new_construction" as const,
          custom: { project_class: "multifamily", trades: 6 },
        },
        cityTotalCents: 13_944_500,
        publishedCents: 13_116_500,
      },
    ];

    for (const scenario of scenarios) {
      it(scenario.label, async () => {
        const context = await getJurisdictionContext("texas", "dallas");
        expect(context).not.toBeNull();
        if (!context) return;

        const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
        expect(detail).not.toBeNull();
        if (!detail) return;

        const result = calculatePermitFees(scenario.input, detail.feeRuleRecords);
        expect(cents(result.totalCents)).toBe(cents(scenario.publishedCents));

        // Same stored rules and inputs, with the draft status lifted off the
        // disputed plan review rule. The total must then equal the City's own.
        const withPlanReview = detail.feeRuleRecords.map((record) =>
          record.code === "PLAN-REVIEW-303" ? { ...record, status: "active" as const } : record,
        );
        const cityResult = calculatePermitFees(scenario.input, withPlanReview);
        const planReview = cityResult.components.find(
          (component) => component.code === "PLAN-REVIEW-303",
        );

        expect(planReview, "the plan review rule did not compute").toBeDefined();
        expect(
          cents(cityResult.totalCents),
          `${cents(result.totalCents)} + ${cents(planReview?.amountCents ?? 0)} plan review`,
        ).toBe(cents(scenario.cityTotalCents));
      });
    }
  });

  /* ---------------------------------------------------------------------- */
  /* The dispute, and what it must not do                                   */
  /* ---------------------------------------------------------------------- */

  describe("the disputed plan review rule", () => {
    it("is stored as draft on every permit type", async () => {
      const rows = await rawRows<{ status: string; n: number }>(
        sql`select status::text as status, count(*)::int as n from fee_rules
            where code = 'PLAN-REVIEW-303' group by 1`,
      );
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("draft");
      expect(rows[0]?.n).toBe(3);
    });

    it("carries its published floor and never enters a total", async () => {
      const context = await getJurisdictionContext("texas", "dallas");
      expect(context).not.toBeNull();
      if (!context) return;

      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      expect(detail).not.toBeNull();
      if (!detail) return;

      const stored = detail.feeRuleRecords.find((rule) => rule.code === "PLAN-REVIEW-303");
      expect(stored?.minimumCents).toBe(57_700);

      const result = calculatePermitFees(
        { asOf, squareFootage: 25_000, custom: { trades: 8 } },
        detail.feeRuleRecords,
      );
      expect(result.components.map((component) => component.code)).not.toContain(
        "PLAN-REVIEW-303",
      );
      expect(result.excluded.map((excluded) => excluded.code)).toContain("PLAN-REVIEW-303");
    });

    it("has a disputed verification record, which nothing else in Dallas has", async () => {
      const rows = await rawRows<{ status: string; notes: string | null }>(
        sql`select v.status::text as status, v.notes
            from verification_records v
            join fee_rules r on r.id = v.entity_id
            where v.entity_type = 'fee_rule' and r.code = 'PLAN-REVIEW-303'`,
      );
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.status).toBe("disputed");
        expect(row.notes).toContain("$0.46");
        expect(row.notes).toContain("0.046");
      }

      const disputedElsewhere = await rawRows<{ juris: string; code: string }>(
        sql`select distinct j.slug as juris, r.code
            from verification_records v
            join fee_rules r on r.id = v.entity_id
            join jurisdictions j on j.id = r.jurisdiction_id
            where v.entity_type = 'fee_rule' and v.status = 'disputed'
              and r.code <> 'PLAN-REVIEW-303'`,
      );
      // Other jurisdictions may ship their own disputed readings — Houston's
      // minimum, Madison's Group II rate — each a different code on a different
      // jurisdiction. What must never appear is a second disputed rule inside
      // Dallas, and Houston's must still be there to anchor the ledger.
      expect(disputedElsewhere.map((row) => row.juris)).not.toContain("dallas");
      expect(disputedElsewhere.map((row) => row.code)).toContain("MIN-118.1.3");
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Sitemap                                                                */
  /* ---------------------------------------------------------------------- */

  describe("sitemap", () => {
    it("lists Dallas's three pages and the jurisdiction hub, and nothing it should not", async () => {
      const entries = await listSitemapEntries();
      const paths = entries.map((entry) => entry.path);

      expect(paths).toContain("/texas/dallas/");
      expect(paths).toContain("/texas/dallas/building-permit-cost/");
      expect(paths).toContain("/texas/dallas/electrical-permit-cost/");
      expect(paths).toContain("/texas/dallas/plumbing-permit-cost/");

      const dallasPaths = paths.filter((path) => path.includes("/dallas/"));
      expect(dallasPaths).toHaveLength(4);

      for (const withdrawn of ["mechanical", "demolition", "roofing"]) {
        expect(
          paths.filter((path) => path.includes("dallas") && path.includes(withdrawn)),
          withdrawn,
        ).toEqual([]);
      }
    });
  });
});
