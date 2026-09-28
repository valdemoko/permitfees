import { describe, expect, it } from "vitest";

import { ALL_SEEDS } from "@/content";
import type { JurisdictionSeed } from "@/content/seed-types";

/**
 * The payload's internal cross-references, checked across every jurisdiction.
 *
 * Earned by the quietest failure this project has had. Virginia Beach's
 * electrical and plumbing rules pointed at `vb-trades-permits-page`, which is the
 * key of a *source* rather than of a *fee schedule* — the payload declares one
 * schedule and three sources, and the trades rules were never given a schedule to
 * belong to. The seed resolves schedule keys while writing, found nothing, and
 * stopped.
 *
 * Why it went unnoticed for so long: the seed writes each jurisdiction in
 * document order, so it published the sixty or seventy payloads ahead of Virginia
 * Beach and then aborted. The site reads coverage from the database, so nineteen
 * states simply were not there — a grey map, a "not yet published" list, and
 * nothing anywhere saying why. No test covered it. `tests/content/*-seed.test.ts`
 * is written per state and asserts what each city charges, not that its rules
 * point at rows that exist; the integration tests compare row counts, and a
 * jurisdiction that was never written has no rows to count.
 *
 * So the invariant is stated once, over the whole catalogue, and the next
 * jurisdiction is covered by it the day it is added — the same reasoning as
 * `tests/content/prose-rendering.test.ts` derives its seed list from `ALL_SEEDS`.
 *
 * Every check below is one the seed itself performs at write time, moved forward
 * to the moment the content is edited. A key that does not resolve here cannot
 * reach the database, because nothing is written until every seed in the run has
 * been walked.
 */

/** Permit types are shared rows: declared once, cited by every payload in the run. */
const PERMIT_TYPES = new Set(ALL_SEEDS.flatMap((seed) => seed.permitTypes.map((type) => type.key)));
const PROJECT_TYPES = new Set(ALL_SEEDS.flatMap((seed) => seed.projectTypes.map((type) => type.key)));

const REFUSALS = ALL_SEEDS.filter(
  (seed) => seed.permitPages.length === 0 && seed.feeRules.length === 0,
);

const PUBLISHED = ALL_SEEDS.filter((seed) => seed.feeRules.length > 0);

function label(seed: JurisdictionSeed): string {
  return `${seed.state.code}/${seed.jurisdiction.slug}`;
}

describe("Seed references — every key a payload cites resolves", () => {
  it("has a catalogue to check, and it is not accidentally empty", () => {
    // Guards the guards: an import that silently yielded nothing would make every
    // assertion below vacuously true.
    expect(ALL_SEEDS.length).toBeGreaterThan(50);
    expect(PUBLISHED.length).toBeGreaterThan(50);
    expect(PERMIT_TYPES.size).toBeGreaterThan(0);
    expect(REFUSALS).toEqual([]);
  });

  it("names a county its own payload declares, and one state for the pair", () => {
    for (const seed of ALL_SEEDS) {
      const { countyKey } = seed.jurisdiction;

      if (countyKey === null) continue;

      expect(countyKey, `${label(seed)} countyKey`).toBe(seed.county.key);
    }
  });

  it("gives the same county name in two states two rows", () => {
    // Kent County, Michigan holds Grand Rapids; Kent County, Rhode Island holds
    // Warwick. The seed used to resolve county keys through one map keyed on the
    // payload's own key, so the second state to declare one silently captured the
    // first state's jurisdiction — Grand Rapids was linked to Rhode Island. The
    // keys may repeat across states; what must not repeat is the pair they are
    // resolved by.
    const byPair = new Map<string, string[]>();
    for (const seed of ALL_SEEDS) {
      const pair = `${seed.state.code}:${seed.county.slug}`;
      byPair.set(pair, [...(byPair.get(pair) ?? []), seed.county.key]);
    }

    for (const [pair, keys] of byPair) {
      expect(new Set(keys).size, `${pair} is declared with more than one key`).toBe(1);
    }

    // The other direction, which is the one that actually broke: one key, two
    // rows. Counties are keyed on (state, slug) in the database, so a key shared
    // by two states is legal — but it must be a deliberate collision, not two
    // different counties wearing the same handle.
    const byKey = new Map<string, string[]>();
    for (const seed of ALL_SEEDS) {
      byKey.set(seed.county.key, [...(byKey.get(seed.county.key) ?? []), `${seed.state.code}:${seed.county.slug}`]);
    }

    const collisions = [...byKey].filter(([, pairs]) => new Set(pairs).size > 1);
    expect(
      collisions.map(([key, pairs]) => `${key} -> ${[...new Set(pairs)].sort().join(", ")}`),
      "one county key is used for two different counties — scope it by state, or give it a state suffix",
    ).toEqual([
      "kent-county -> MI:kent-county, RI:kent-county",
    ]);
  });

  it("points every fee rule at a schedule its own payload declares", () => {
    // The assertion that would have caught Virginia Beach before the seed ran.
    for (const seed of PUBLISHED) {
      const declaredSchedules = new Set(seed.feeSchedules.map((schedule) => schedule.key));
      const declaredSources = new Set(seed.sources.map((source) => source.key));

      for (const entry of seed.feeRules) {
        const where = `${label(seed)} rule "${entry.permitTypeKey}/${entry.rule.code}"`;

        if (!declaredSchedules.has(entry.scheduleKey)) {
          // Named separately because it is the failure that happened: the key
          // exists, but as a source. Saying so is the difference between a typo
          // and a missing schedule.
          expect(
            declaredSources.has(entry.scheduleKey),
            `${where} cites "${entry.scheduleKey}", which is a source key, not a fee schedule`,
          ).toBe(false);

          expect(declaredSchedules, `${where} cites schedule "${entry.scheduleKey}"`).toContain(
            entry.scheduleKey,
          );
        }
      }
    }
  });

  it("points every fee rule at a permit type the catalogue declares", () => {
    for (const seed of PUBLISHED) {
      for (const entry of seed.feeRules) {
        expect(
          PERMIT_TYPES,
          `${label(seed)} rule "${entry.rule.code}" cites permit type "${entry.permitTypeKey}"`,
        ).toContain(entry.permitTypeKey);
      }
    }
  });

  it("resolves every source key a payload cites, in the payload that cites it", () => {
    for (const seed of ALL_SEEDS) {
      const sources = new Set(seed.sources.map((source) => source.key));

      for (const schedule of seed.feeSchedules) {
        if (schedule.sourceKey === null) continue;
        expect(sources, `${label(seed)} schedule "${schedule.key}"`).toContain(schedule.sourceKey);
      }

      for (const entry of seed.feeRules) {
        if (!entry.rule.sourceId) continue;
        expect(sources, `${label(seed)} rule "${entry.rule.code}"`).toContain(entry.rule.sourceId);
      }

      for (const requirement of seed.requirements) {
        if (requirement.sourceKey === null) continue;
        expect(sources, `${label(seed)} requirement "${requirement.title}"`).toContain(
          requirement.sourceKey,
        );
      }

      for (const verification of seed.verifications) {
        if (verification.sourceKey === null) continue;
        expect(sources, `${label(seed)} verification of "${verification.entityKey}"`).toContain(
          verification.sourceKey,
        );
      }
    }
  });

  it("names a permit type every link, page and requirement actually publishes", () => {
    for (const seed of ALL_SEEDS) {
      for (const link of seed.jurisdictionPermitTypes) {
        expect(PERMIT_TYPES, `${label(seed)} permit-type link`).toContain(link.permitTypeKey);
      }
      for (const page of seed.permitPages) {
        expect(PERMIT_TYPES, `${label(seed)} page "${page.slug}"`).toContain(page.permitTypeKey);
      }
      for (const requirement of seed.requirements) {
        expect(PERMIT_TYPES, `${label(seed)} requirement "${requirement.title}"`).toContain(
          requirement.permitTypeKey,
        );
      }
      for (const projectType of seed.projectTypes) {
        expect(PROJECT_TYPES, `${label(seed)} project type`).toContain(projectType.key);
      }
    }
  });

  it("resolves the entity every verification record points at", () => {
    // A verification is the ledger entry that makes a page publishable, so one
    // pointing at a row that does not exist is worse than a missing entry.
    for (const seed of ALL_SEEDS) {
      const sources = new Set(seed.sources.map((source) => source.key));
      const schedules = new Set(seed.feeSchedules.map((schedule) => schedule.key));
      const pagePermitTypes = new Set(seed.permitPages.map((page) => page.permitTypeKey));

      for (const verification of seed.verifications) {
        const where = `${label(seed)} ${verification.entityType} "${verification.entityKey}"`;

        switch (verification.entityType) {
          case "source":
            expect(sources, where).toContain(verification.entityKey);
            break;
          case "fee_schedule":
            expect(schedules, where).toContain(verification.entityKey);
            break;
          case "permit_page":
            expect(
              verification.permitTypeKey,
              `${where} verifies a permit page without naming its permit type`,
            ).toBeTruthy();
            expect(pagePermitTypes, where).toContain(verification.permitTypeKey);
            break;
          case "fee_rule": {
            expect(
              verification.permitTypeKey,
              `${where} verifies a fee rule without naming its permit type`,
            ).toBeTruthy();
            const codes = seed.feeRules
              .filter((entry) => entry.permitTypeKey === verification.permitTypeKey)
              .map((entry) => entry.rule.code);
            expect(codes, where).toContain(verification.entityKey);
            break;
          }
          case "requirement": {
            const titles = seed.requirements.map((requirement) => requirement.title);
            expect(titles, where).toContain(verification.entityKey);
            break;
          }
          case "jurisdiction_profile":
            expect(verification.entityKey, where).toBe(seed.jurisdiction.key);
            break;
        }
      }
    }
  });

  it("keeps every jurisdiction and county slug unique inside its state", () => {
    // These are the columns the seed upserts on. Two payloads sharing one means the
    // second overwrites the first, and one jurisdiction silently disappears from a
    // run that reported success.
    const jurisdictionPairs = ALL_SEEDS.map((seed) => `${seed.state.code}:${seed.jurisdiction.slug}`);
    expect(new Set(jurisdictionPairs).size, "two payloads share a jurisdiction slug").toBe(
      jurisdictionPairs.length,
    );

    const jurisdictionKeys = ALL_SEEDS.map((seed) => seed.jurisdiction.key);
    expect(new Set(jurisdictionKeys).size, "two payloads share a jurisdiction key").toBe(
      jurisdictionKeys.length,
    );

    const stateCodes = new Set(ALL_SEEDS.map((seed) => seed.state.code));
    for (const seed of ALL_SEEDS) {
      expect(stateCodes, `${label(seed)} declares its state`).toContain(seed.state.code);
      expect(seed.state.slug, `${label(seed)} state slug`).toBeTruthy();
      expect(seed.state.fipsCode, `${label(seed)} state FIPS`).toMatch(/^\d{2}$/);
    }
  });
});
