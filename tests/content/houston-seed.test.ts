import { describe, expect, it } from "vitest";

import {
  HOUSTON_PUBLISHED_PERMIT_PAGES,
  HOUSTON_WITHHELD_PERMIT_PAGES,
  houstonSeed,
} from "@/content/houston";
import { validateFeeRule } from "@/lib/calc/schemas";
import { isReservedSlug } from "@/lib/seo/slugs";

/**
 * Seed integrity tests.
 *
 * These run without a database. They verify the payload *before* it can be
 * written, which is the only point at which "the seed would create a duplicate",
 * "this page would publish empty" or "this rule would not calculate" are cheap to
 * catch.
 *
 * The seed script repeats the rule validation at write time. Duplicating the check
 * is deliberate: the test explains *why* each invariant matters, and the script
 * guarantees it holds even if someone bypasses the test suite.
 */

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("Houston seed — identity", () => {
  it("uses URL-safe, non-reserved slugs", () => {
    const slugs = [
      houstonSeed.state.slug,
      houstonSeed.county.slug,
      houstonSeed.jurisdiction.slug,
      ...houstonSeed.permitTypes.map((permit) => permit.slug),
      ...houstonSeed.projectTypes.map((project) => project.slug),
      ...houstonSeed.permitPages.map((page) => page.slug),
    ];

    for (const slug of slugs) {
      expect(slug, `"${slug}" is not a canonical slug`).toMatch(slugPattern);
      // A permit page slug that collided with an editorial route would shadow it.
      expect(isReservedSlug(slug), `"${slug}" collides with a reserved route`).toBe(false);
    }
  });

  it("gives every permit page a unique slug within the jurisdiction", () => {
    const slugs = houstonSeed.permitPages.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every permit page a unique dedupe scope key", () => {
    // The scope key is the value PostgreSQL enforces uniqueness on. If two pages
    // shared one, the second would silently overwrite the first on upsert.
    const scopeKeys = houstonSeed.permitPages.map((page) => page.permitTypeKey);
    expect(new Set(scopeKeys).size).toBe(scopeKeys.length);
  });

  it("keeps the state code, county and jurisdiction wired together", () => {
    expect(houstonSeed.state.code).toBe("TX");
    expect(houstonSeed.jurisdiction.stateKey).toBe("tx");
    expect(houstonSeed.jurisdiction.countyKey).toBe(houstonSeed.county.key);
    expect(houstonSeed.jurisdiction.officialName).toBe("City of Houston");
  });
});

describe("Houston seed — every rule would calculate", () => {
  it("contains no rule the engine cannot validate", () => {
    for (const entry of houstonSeed.feeRules) {
      const result = validateFeeRule(entry.rule);
      expect(result.ok, `${entry.permitTypeKey}/${entry.rule.code}: ${result.ok ? "" : result.error}`).toBe(
        true,
      );
    }
  });

  it("has no duplicate rule code for the same permit type, trade or jurisdiction", () => {
    // This mirrors the `fee_rules_identity_uq` unique index. If two rules shared a
    // code and an effective date, one would silently overwrite the other and a
    // published fee would disappear.
    const seen = new Set<string>();
    for (const entry of houstonSeed.feeRules) {
      const key = `${entry.jurisdictionKey}|${entry.permitTypeKey}|${entry.rule.code}|${entry.rule.effectiveFrom}`;
      expect(seen.has(key), `duplicate rule identity: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("lets only one rule match any given valuation for the structural schedule", () => {
    // The nine brackets are discriminated by conditions. Two matching brackets
    // would add two permit fees together; none matching would calculate nothing.
    const structural = houstonSeed.feeRules.filter(
      (entry) =>
        entry.permitTypeKey === "building" &&
        entry.rule.code.startsWith("STRUCT-") &&
        entry.rule.status === "active",
    );

    const brackets = structural.map((entry) => {
      const conditions = entry.rule.conditions as {
        all: Array<{ field: string; op: string; value: number }>;
      };
      const lower = conditions.all.find((clause) => clause.op === "gt")?.value ?? 0;
      const upper = conditions.all.find((clause) => clause.op === "lte")?.value ?? Number.POSITIVE_INFINITY;
      return { code: entry.rule.code, lower, upper };
    });

    expect(brackets).toHaveLength(9);

    for (const valuation of [1, 700_000, 700_100, 15_000_000, 15_000_001, 6_000_000_000]) {
      const matches = brackets.filter(
        (bracket) => valuation > bracket.lower && valuation <= bracket.upper,
      );
      expect(matches, `valuation ${valuation} matched ${matches.length} brackets`).toHaveLength(1);
    }
  });

  it("cites only source keys that exist in the payload", () => {
    const sourceKeys = new Set(houstonSeed.sources.map((source) => source.key));

    for (const entry of houstonSeed.feeRules) {
      if (entry.rule.sourceId === null) continue;
      expect(
        sourceKeys.has(entry.rule.sourceId),
        `${entry.rule.code} cites unknown source "${entry.rule.sourceId}"`,
      ).toBe(true);
    }

    for (const requirement of houstonSeed.requirements) {
      if (requirement.sourceKey === null) continue;
      expect(sourceKeys.has(requirement.sourceKey)).toBe(true);
    }
  });

  it("ships disputed rules as draft so they cannot enter a total", () => {
    // Bldg. Code Sec. 118.1.3 (minimum) and Sec. 118.2.1 (flat $47) disagree for
    // small valuations. See research/texas/houston.md Ambiguity A8.
    const minimumRules = houstonSeed.feeRules.filter((entry) => entry.rule.code.startsWith("MIN-"));
    expect(minimumRules.length).toBeGreaterThan(0);

    for (const entry of minimumRules) {
      expect(entry.rule.status, `${entry.rule.code} must not be active`).toBe("draft");
    }

    const administrative = houstonSeed.feeRules.filter((entry) =>
      entry.rule.code.startsWith("ADMIN-"),
    );
    for (const entry of administrative) {
      expect(entry.rule.status).toBe("draft");
    }
  });
});

describe("Houston seed — the editorial gate holds", () => {
  it("publishes only pages that carry real content", () => {
    expect(HOUSTON_PUBLISHED_PERMIT_PAGES.length).toBeGreaterThanOrEqual(2);

    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const label = `/${houstonSeed.state.slug}/${houstonSeed.jurisdiction.slug}/${page.slug}/`;

      expect(page.intro.length, `${label} intro too short`).toBeGreaterThan(200);
      expect(page.localSummary.length, `${label} localSummary too short`).toBeGreaterThan(200);
      expect(page.notIncluded.length, `${label} notIncluded too short`).toBeGreaterThan(100);
      expect(page.workedExample, `${label} has no worked example`).not.toBeNull();
      expect(page.faqs?.length ?? 0, `${label} has too few FAQs`).toBeGreaterThanOrEqual(2);
      expect(page.lastReviewedAt, `${label} has no review date`).not.toBeNull();
      expect(page.seoTitle.length, `${label} seoTitle too long`).toBeLessThanOrEqual(200);
      expect(page.seoDescription.length, `${label} seoDescription too short`).toBeGreaterThan(80);
    }
  });

  it("gives every published page at least one active fee rule to calculate with", () => {
    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const active = houstonSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === page.permitTypeKey && entry.rule.status === "active",
      );
      expect(active.length, `${page.slug} has no active fee rule`).toBeGreaterThan(0);
    }
  });

  it("has a primary source for every published page's permit type", () => {
    // A page may not publish without a primary source behind its figures.
    const primarySources = houstonSeed.sources.filter((source) => source.isPrimary);
    expect(primarySources.length).toBeGreaterThan(0);

    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const rules = houstonSeed.feeRules.filter(
        (entry) => entry.permitTypeKey === page.permitTypeKey && entry.rule.status === "active",
      );
      for (const entry of rules) {
        expect(entry.rule.sourceId, `${page.slug}: ${entry.rule.code} has no source`).not.toBeNull();
      }
    }
  });

  it("keeps withheld pages out of the index and free of half-written copy", () => {
    expect(HOUSTON_WITHHELD_PERMIT_PAGES.length).toBeGreaterThan(0);

    for (const page of HOUSTON_WITHHELD_PERMIT_PAGES) {
      expect(page.noindex, `${page.slug} is withheld but indexable`).toBe(true);
      expect(page.publishStatus).not.toBe("published");
      expect(page.lastReviewedAt, `${page.slug} was never reviewed`).toBeNull();
      expect(page.seoTitle).toBe("");
    }
  });

  it("withholds exactly the pages research said were not ready", () => {
    // If someone later opens one of these without doing the research, this test is
    // where they find out what the blocking gap was.
    const withheld = HOUSTON_WITHHELD_PERMIT_PAGES.map((page) => page.permitTypeKey).sort();
    expect(withheld).toEqual(["demolition", "mechanical"]);
  });
});

describe("Houston seed — the verification ledger is honest", () => {
  it("records the disputed minimum fee rather than hiding the conflict", () => {
    const disputed = houstonSeed.verifications.filter(
      (verification) => verification.status === "disputed",
    );
    expect(disputed).toHaveLength(1);
    expect(disputed[0]?.entityKey).toBe("MIN-118.1.3");
    expect(disputed[0]?.notes).toContain("DISPUTED");
  });

  it("dates every verification and names the pass that made it", () => {
    for (const verification of houstonSeed.verifications) {
      expect(verification.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(verification.verifiedBy).toBeTruthy();
    }
  });

  it("gives every verification a resolvable target", () => {
    const permitTypeKeys = new Set(houstonSeed.permitTypes.map((permit) => permit.key));
    const sourceKeys = new Set(houstonSeed.sources.map((source) => source.key));

    for (const verification of houstonSeed.verifications) {
      if (verification.permitTypeKey) {
        expect(permitTypeKeys.has(verification.permitTypeKey)).toBe(true);
      }
      if (verification.sourceKey) {
        expect(sourceKeys.has(verification.sourceKey), verification.sourceKey).toBe(true);
      }
    }
  });

  it("never claims a page is verified when the research pass left it needing review", () => {
    const plumbing = houstonSeed.verifications.find(
      (verification) => verification.entityKey === "plumbing-permit-cost",
    );
    expect(plumbing?.status).toBe("needs_review");
    expect(plumbing?.notes).toContain("118.5.1");
  });
});

describe("Houston seed — content is jurisdiction-specific, not boilerplate", () => {
  it("does not reuse the same opening sentence across permit pages", () => {
    const openers = HOUSTON_PUBLISHED_PERMIT_PAGES.map((page) =>
      page.intro.split(" ").slice(0, 8).join(" "),
    );
    expect(new Set(openers).size).toBe(openers.length);
  });

  it("names concrete Houston figures and code sections in each page's own copy", () => {
    const expectations: Record<string, string[]> = {
      "building-permit-cost": ["118.2.1", "$5.36", "$47.00"],
      "electrical-permit-cost": ["118.6", "$94.00", "$1.34"],
      "plumbing-permit-cost": ["118.5.4", "$34.24", "$11.41"],
    };

    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const expected = expectations[page.slug];
      expect(expected, `no assertions declared for ${page.slug}`).toBeDefined();

      const harvest = [page.intro, page.localSummary, page.notIncluded].join("\n");
      for (const token of expected ?? []) {
        expect(harvest, `${page.slug} never mentions "${token}"`).toContain(token);
      }
    }
  });

  it("stores every worked example as inputs and prose, never as amounts", () => {
    const allowedKeys = ["inputs", "notes", "scenario"];

    for (const page of HOUSTON_PUBLISHED_PERMIT_PAGES) {
      const example = page.workedExample;
      expect(example, `${page.slug} has no worked example`).not.toBeNull();
      if (!example) continue;

      // The shape is the guarantee. A stored total, breakdown or figure is a
      // figure that can drift from the schedule it claims to come from, so the
      // only thing a published example is allowed to carry is what an engine
      // needs in order to compute one.
      for (const key of Object.keys(example)) {
        expect(allowedKeys, `${page.slug} stores "${key}"`).toContain(key);
      }

      expect(Object.keys(example.inputs).length).toBeGreaterThan(0);
      expect(Object.keys(example.inputs)).not.toContain("asOf");
      expect(example.scenario.length).toBeGreaterThan(40);

      // The scenario narrates the work, not the arithmetic. It may name the
      // schedule's own unit ("$1,000 of valuation") but not an amount with
      // cents, which is what a restated rate or a computed figure looks like.
      expect(example.scenario).not.toMatch(/\$\d[\d,]*\.\d{2}/);
      expect(example.scenario).not.toContain("Total");

      // Notes explain what the example assumes and leaves out, so they must say
      // something.
      expect((example.notes ?? "").length).toBeGreaterThan(80);
    }
  });

  it("gives every per-unit rule in a permit type its own count", () => {
    // Two per-unit rules reading the same fact key within one permit type would
    // charge the reader for the same items twice. This invariant is not
    // hypothetical: it is what caught Houston's electrical outlet row reading the
    // plumbing fixture count, and the septic tank row reading the same "openings"
    // count as the yard light row — both in the same permit type.
    const byPermitType = new Map<string, Map<string, string>>();

    for (const entry of houstonSeed.feeRules) {
      const rule = entry.rule;
      if (rule.feeType !== "per_unit") continue;

      const unit = (rule.config as { unit?: string }).unit;
      expect(unit, `${rule.code} has no unit`).toBeDefined();

      const seen = byPermitType.get(entry.permitTypeKey) ?? new Map<string, string>();
      const previous = seen.get(unit as string);

      expect(
        previous,
        `${rule.code} and ${previous} both read the count "${unit}" in ${entry.permitTypeKey}`,
      ).toBeUndefined();

      seen.set(unit as string, rule.code);
      byPermitType.set(entry.permitTypeKey, seen);
    }

    // Guard against a vacuous pass: plumbing is the permit type where the clash
    // was real, so it must have rules to have checked.
    expect(byPermitType.get("plumbing")?.size ?? 0).toBeGreaterThanOrEqual(5);
    expect(byPermitType.get("electrical")?.size ?? 0).toBeGreaterThanOrEqual(3);
  });
});
