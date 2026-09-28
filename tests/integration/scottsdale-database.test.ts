import { sql, type SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import { scottsdaleSeed } from "@/content/scottsdale";
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
 * Scottsdale, end to end, against a real PostgreSQL database.
 *
 * Skipped unless `DATABASE_URL` is set.
 *
 * The check worth this file is the second area. `covered_square_footage` lives
 * inside the rule's JSONB `config`, like every other rule parameter, so it travels
 * to the database and back without a column or a constraint to protect it — and for
 * a while while this jurisdiction was being written, two of the rules read
 * `square_footage` instead. They validated, they computed, and they were wrong. So
 * the assertions below are about *which* stored fact each rule reads, not only about
 * the total it produces.
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

describeWithDatabase("Scottsdale — database", () => {
  it("resolves the second Arizona jurisdiction through the query layer", async () => {
    const context = await getJurisdictionContext("arizona", "scottsdale");

    expect(context).not.toBeNull();
    expect(context?.state.code).toBe("AZ");
    expect(context?.jurisdiction.slug).toBe("scottsdale");
    expect(context?.jurisdiction.officialName).toBe("City of Scottsdale");
    expect(context?.jurisdiction.timezone).toBe("America/Phoenix");
    expect(context?.sources.length).toBe(scottsdaleSeed.sources.length);
    expect(context?.profile?.lastReviewedAt).toBe(scottsdaleSeed.profile.lastReviewedAt);
    expect(context?.profile?.headline).toContain("Scottsdale");
  });

  it("shares Arizona, Maricopa County and the permit catalogue with Phoenix", async () => {
    // Scottsdale links to the county row Phoenix created rather than opening its own.
    const counties = await rawRows<{ slug: string; c: string; n: number }>(
      sql`select c.slug, c.name as c, count(j.id)::int as n
          from counties c left join jurisdictions j on j.county_id = c.id
          group by 1, 2 order by 1`,
    );
    // One row per county any payload links to, with how many jurisdictions use
    // it — derived, so Nevada adding Clark County with two jurisdictions is a
    // passing test rather than an edit to a list.
    const expectedCounties = [...ALL_SEEDS.reduce((counts, seed) => {
      counts.set(seed.county.slug, (counts.get(seed.county.slug) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())]
      .map(([slug, n]) => `${slug}=${n}`)
      .sort();

    // Sorted here rather than left in the server's order. The claim is that both
    // sides hold the same counties with the same counts, and PostgreSQL's
    // collation is not V8's: it ignores the punctuation that separates
    // `kent-county` from `kent` and `jefferson-county` from
    // `jefferson-county-ky`, so the same set arrives in a different order. The
    // counties Delaware, Kentucky and Rhode Island added are the first to sit on
    // both sides of that difference.
    expect(counties.map((row) => `${row.slug}=${row.n}`).sort()).toEqual(expectedCounties);
    expect(counties.find((row) => row.slug === "maricopa-county")?.c).toBe("Maricopa County");

    const jurisdictions = await rawRows<{ slug: string; n: number }>(
      sql`select slug, count(*)::int as n from jurisdictions
          where slug in ('phoenix', 'scottsdale') group by 1 order by 1`,
    );
    expect(jurisdictions.map((row) => `${row.slug}=${row.n}`)).toEqual([
      "phoenix=1",
      "scottsdale=1",
    ]);

    const permitTypes = await rawRows<{ key: string; n: number }>(
      sql`select key, count(*)::int as n from permit_types group by 1 order by 1`,
    );
    for (const row of permitTypes) {
      expect(row.n, `permit type ${row.key} exists more than once`).toBe(1);
    }
  });

  it("stores the two areas as two distinct bases", async () => {
    const bases = await rawRows<{ basis: string; n: number }>(
      sql`select r.config->>'basis' as basis, count(*)::int as n
          from fee_rules r
          join jurisdictions j on j.id = r.jurisdiction_id
          where j.slug = 'scottsdale' group by 1 order by 1`,
    );
    const byBasis = new Map(bases.map((row) => [row.basis, row.n]));

    // Four on the area with A/C — the new-work and remodel rates, each on the permit
    // and on the review — two on the covered area, and one flat base fee with no
    // basis at all.
    expect(byBasis.get("square_footage")).toBe(4);
    expect(byBasis.get("covered_square_footage")).toBe(2);
    expect(byBasis.has("valuation")).toBe(false);

    // And the covered rules read the covered fact, not the other one.
    const covered = await rawRows<{ code: string; fact: string }>(
      sql`select r.code, r.conditions->'all'->1->>'field' as fact
          from fee_rules r join jurisdictions j on j.id = r.jurisdiction_id
          where j.slug = 'scottsdale' and r.config->>'basis' = 'covered_square_footage'
          order by 1`,
    );
    expect(covered.map((row) => row.code)).toEqual([
      "PERMIT-COVERED-AREA",
      "REVIEW-COVERED-AREA",
    ]);
    for (const row of covered) {
      expect(row.fact, row.code).toBe("custom.covered_square_footage");
    }
  });

  describe("published pages", () => {
    it("serves exactly the three pages the payload publishes", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      expect(context).not.toBeNull();
      if (!context) return;

      const pages = await listPermitPages(context.jurisdiction.id);
      expect(pages.map((page) => page.slug).sort()).toEqual([
        "building-permit-cost",
        "electrical-permit-cost",
        "plumbing-permit-cost",
      ]);
    });

    it("404s every page Scottsdale does not publish", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      expect(context).not.toBeNull();
      if (!context) return;

      for (const slug of [
        "mechanical-permit-cost",
        "demolition-permit-cost",
        "roofing-permit-cost",
        "solar-permit-cost",
      ]) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, `${slug} resolved but should not`).toBeNull();
      }
    });

    it("passes the editorial gate on the data PostgreSQL actually returned", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      expect(context).not.toBeNull();
      if (!context) return;

      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      expect(detail).not.toBeNull();
      if (!detail) return;

      const active = detail.feeRuleRecords.filter(
        (rule) =>
          rule.status === "active" &&
          isWithinEffectiveWindow(asOf, rule.effectiveFrom, rule.effectiveTo),
      );

      const gate = evaluatePublishability({
        publishStatus: detail.page.publishStatus,
        noindex: detail.page.noindex,
        intro: detail.page.intro,
        localSummary: detail.page.localSummary,
        sourceCount: detail.sources.length,
        feeRuleCount: active.length,
        lastVerifiedAt: detail.lastVerifiedAt,
        faqCount: Array.isArray(detail.page.faqs) ? detail.page.faqs.length : 0,
        asOf,
      });

      expect(gate.failures, gate.failures.join("; ")).toEqual([]);
      expect(gate.indexable).toBe(true);
      expect(active.length).toBe(7);
    });

    it("cites the residential and commercial documents from the page itself", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const titles = detail.sources.map((source) => source.title);
      expect(titles.some((title) => title.includes("Residential"))).toBe(true);
      expect(titles.some((title) => title.includes("Commercial"))).toBe(true);
      expect(titles.some((title) => title.includes("Miscellaneous"))).toBe(true);
      for (const source of detail.sources) {
        expect(source.lastVerifiedAt, source.title).toBe("2026-09-24");
      }
    });
  });

  describe("the arithmetic, from the stored rules", () => {
    it("stores rules the engine can compute", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const buildingRules = scottsdaleSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === "building",
      );
      expect(detail.feeRuleRecords.length).toBe(buildingRules.length);
      for (const rule of detail.feeRuleRecords) {
        const validation = validateFeeRule(rule);
        expect(validation.ok, `${rule.code}: ${validation.ok ? "" : validation.error}`).toBe(true);
      }
    });

    it("stores the trade rules, and they carry no area basis at all", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;

      for (const [slug, expected] of [
        ["electrical-permit-cost", ["TEMP-POWER-POLE", "SOLAR-RESIDENTIAL", "TRADE-MINIMUM-ONE-DISCIPLINE", "REINSPECTION"]],
        ["plumbing-permit-cost", ["WATER-HEATER", "SOLAR-WATER-HEATER", "TRADE-MINIMUM-ONE-DISCIPLINE", "REINSPECTION"]],
      ] as const) {
        const detail = await getPermitPageDetail(context.jurisdiction.id, slug);
        expect(detail, slug).not.toBeNull();
        if (!detail) continue;

        expect(detail.feeRuleRecords.map((rule) => rule.code).sort(), slug).toEqual(
          [...expected].sort(),
        );
        for (const rule of detail.feeRuleRecords) {
          const validation = validateFeeRule(rule);
          expect(validation.ok, `${rule.code}: ${validation.ok ? "" : validation.error}`).toBe(
            true,
          );
          // Not one of them is a rate: a trade permit is not priced by the area
          // schedules, which price construction.
          expect(rule.feeType, rule.code).toBe("flat");
        }
      }
    });

    it("charges one published fee at a time and never the minimum plus an item", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "plumbing-permit-cost");
      if (!detail) return;

      const run = (input: Record<string, unknown>) =>
        calculatePermitFees({ asOf, ...input }, detail.feeRuleRecords);

      // No item selected: the published one-discipline minimum.
      expect(run({}).totalCents).toBe(12_100);
      // A water heater: the City's flat $63, and not $63 + $121.
      const heater = run({ custom: { schedule_item: "water_heater" } });
      expect(heater.totalCents).toBe(6_300);
      expect(heater.components).toHaveLength(1);
      expect(heater.excluded.map((excluded) => excluded.code)).toContain(
        "TRADE-MINIMUM-ONE-DISCIPLINE",
      );
      expect(
        heater.excluded.find((excluded) => excluded.code === "TRADE-MINIMUM-ONE-DISCIPLINE")
          ?.reason,
      ).toBe("conditions_not_met");
    });

    it("reproduces the two-area example to the cent", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const result = calculatePermitFees(
        {
          asOf,
          squareFootage: 2_500,
          workType: "new_construction",
          occupancy: "residential",
          custom: { covered_square_footage: 400 },
        },
        detail.feeRuleRecords,
      );

      const byCode = new Map(result.components.map((component) => [component.code, component]));
      expect(byCode.get("PERMIT-BASE")?.amountCents).toBe(23_700);
      expect(byCode.get("PERMIT-AC-AREA")?.amountCents).toBe(235_000);
      expect(byCode.get("PERMIT-COVERED-AREA")?.amountCents).toBe(21_600);
      expect(byCode.get("REVIEW-AC-AREA")?.amountCents).toBe(135_000);
      expect(byCode.get("REVIEW-COVERED-AREA")?.amountCents).toBe(13_600);
      expect(cents(result.totalCents)).toBe("$4289.00");
    });

    it("does not charge the covered rate on the area with A/C", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const result = calculatePermitFees(
        { asOf, squareFootage: 2_500, workType: "new_construction", occupancy: "residential" },
        detail.feeRuleRecords,
      );

      expect(cents(result.totalCents)).toBe("$3937.00");
      expect(result.excluded.map((excluded) => excluded.code)).toContain("PERMIT-COVERED-AREA");
    });

    it("charges 30% of the area rate on a remodel, and reviews the conditioned area only", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      const result = calculatePermitFees(
        {
          asOf,
          squareFootage: 1_200,
          workType: "remodel",
          occupancy: "residential",
          custom: { covered_square_footage: 400 },
        },
        detail.feeRuleRecords,
      );

      const byCode = new Map(result.components.map((component) => [component.code, component]));
      expect(byCode.get("PERMIT-AC-REMODEL")?.amountCents).toBe(33_840); // 1,200 x $0.282
      expect(byCode.get("PERMIT-COVERED-AREA")?.amountCents).toBe(21_600); // the full $0.54
      expect(byCode.get("REVIEW-AC-REMODEL")?.amountCents).toBe(19_440); // 1,200 x $0.162
      expect(byCode.has("REVIEW-COVERED-AREA")).toBe(false);
      expect(cents(result.totalCents)).toBe("$985.80");
    });

    it("charges nothing rather than guessing at a work type it has not modelled", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;
      const detail = await getPermitPageDetail(context.jurisdiction.id, "building-permit-cost");
      if (!detail) return;

      // The 70% roof-modification, 95% shell-only and 25% foundation-only rows are
      // published and not modelled. Work that is none of the three modelled types has
      // to produce no fee and say so.
      const result = calculatePermitFees(
        { asOf, squareFootage: 2_500, workType: "other", occupancy: "residential" },
        detail.feeRuleRecords,
      );
      expect(result.totalCents).toBe(0);
      expect(result.warnings.join(" ")).toContain("No fee rules matched");
    });

    it("computes the published worked example from its own stored inputs", async () => {
      const context = await getJurisdictionContext("arizona", "scottsdale");
      if (!context) return;

      const expectedPerPage: Record<string, number> = {
        "building-permit-cost": 428_900,
        "electrical-permit-cost": 12_100,
        "plumbing-permit-cost": 6_300,
      };

      for (const page of scottsdaleSeed.permitPages) {
        if (!page.workedExample) continue;
        const detail = await getPermitPageDetail(context.jurisdiction.id, page.slug);
        expect(detail).not.toBeNull();
        if (!detail) continue;

        const result = calculatePermitFees(
          { ...page.workedExample.inputs, asOf },
          detail.feeRuleRecords,
        );
        expect(result.totalCents, page.slug).toBe(expectedPerPage[page.slug]);
      }
    });
  });

  it("lists Scottsdale's page in the sitemap and none it does not publish", async () => {
    const entries = await listSitemapEntries();
    const paths = entries.map((entry) => entry.path);

    expect(paths).toContain("/arizona/");
    expect(paths).toContain("/arizona/scottsdale/");
    expect(paths).toContain("/arizona/scottsdale/building-permit-cost/");
    expect(paths).toContain("/arizona/scottsdale/electrical-permit-cost/");
    expect(paths).toContain("/arizona/scottsdale/plumbing-permit-cost/");

    for (const absent of [
      "/arizona/scottsdale/mechanical-permit-cost/",
      "/arizona/scottsdale/demolition-permit-cost/",
    ]) {
      expect(paths, `${absent} should not be advertised`).not.toContain(absent);
    }
  });
});
