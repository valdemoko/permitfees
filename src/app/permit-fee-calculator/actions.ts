"use server";

import { and, eq } from "drizzle-orm";

import {
  getCalculatorRuleSet,
  safeQuery,
  toFeeRuleRecord,
} from "@/lib/db/queries";
import {
  jurisdictions,
  jurisdictionPermitPages,
  permitTypes,
  states,
} from "@/lib/db/schema";

/**
 * Server action behind the calculator's "load this jurisdiction's rules" step.
 *
 * The slugs arrive from the client, so they are treated as untrusted input:
 * both are matched against the database with parameterised Drizzle queries
 * (no string-built SQL), and only a published jurisdiction + published permit
 * page combination resolves to rules. Anything else returns `{ ok: false }`,
 * which the calculator renders as a controlled error — never as "$0" and never
 * as if the combination did not exist.
 *
 * A database failure propagates as `DatabaseUnavailableError`. The client
 * component cannot receive an thrown error across the action boundary usefully,
 * so it is caught here and returned as `ok: false` — with the distinction that
 * matters preserved: the calculator shows its temporary-error state, not a
 * "no data" message. No rule JSON for any other jurisdiction is ever returned.
 */
export async function fetchCalculatorRules(
  jurisdictionSlug: string,
  permitTypeKey: string,
): Promise<{
  ok: boolean;
  feeRuleRecords?: ReturnType<typeof toFeeRuleRecord>[];
  lastVerifiedAt?: string | null;
}> {
  if (!jurisdictionSlug || !permitTypeKey) return { ok: false };

  try {
    const resolved = await safeQuery(
      "calculatorResolvePermitPage",
      async (db) => {
        const [row] = await db
          .select({
            jurisdictionId: jurisdictions.id,
            permitTypeId: permitTypes.id,
          })
          .from(jurisdictions)
          .innerJoin(states, eq(states.id, jurisdictions.stateId))
          .innerJoin(
            jurisdictionPermitPages,
            eq(jurisdictionPermitPages.jurisdictionId, jurisdictions.id),
          )
          .innerJoin(permitTypes, eq(permitTypes.id, jurisdictionPermitPages.permitTypeId))
          .where(
            and(
              eq(jurisdictions.slug, jurisdictionSlug),
              eq(jurisdictions.isActive, true),
              eq(permitTypes.key, permitTypeKey),
              eq(jurisdictionPermitPages.publishStatus, "published"),
              eq(jurisdictionPermitPages.noindex, false),
            ),
          )
          .limit(1);
        return row ?? null;
      },
      null,
    );

    if (!resolved) return { ok: false };

    const ruleSet = await getCalculatorRuleSet(resolved.jurisdictionId, resolved.permitTypeId);
    return {
      ok: true,
      feeRuleRecords: ruleSet.feeRuleRecords,
      lastVerifiedAt: ruleSet.lastVerifiedAt,
    };
  } catch {
    // A database outage reaches the reader as the calculator's temporary-error
    // state — the same policy the routes apply through `error.tsx`, adapted to
    // an action boundary that cannot render one.
    return { ok: false };
  }
}
