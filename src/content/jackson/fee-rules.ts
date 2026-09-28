import type { FeeRuleRecord } from "@/lib/calc/types";

/**
 * Jackson, Mississippi fee rules — REAL DATA, an honest absence.
 *
 * The City publishes no fee schedule anywhere online:
 *   - Code of Ordinances Ch. 26, Sec. 26-2 says only "The adopted schedule of
 *     fees shall govern" (Ord. No. 2019-30(9), eff. 2019-03-05) and does not
 *     reproduce it;
 *   - the City's Building Permits and Residential Building pages describe the
 *     application process without amounts;
 *   - the OpenGov portal (`jacksonms.portal.opengov.com/categories/1071`)
 *     lists the permit catalogue, but every "Apply Online" action routes to
 *     the Viewpoint Cloud sign-in, so no fee is visible before authentication
 *     (checked live 2026-09-26 on the Plumbing Permit record type);
 *   - third-party guides circulate figures ("$85 base + $8 per $1,000" et
 *     al.) that no .gov source corroborates. NOT adopted — never guessed.
 *
 * So this module exports **zero rules**, and the pages state the absence
 * (the editorial gate's `hasNoScheduleStatement` case). If the adopted
 * schedule is ever published, this file is where the rows go; see
 * research/mississippi/jackson.md for the full verification record.
 *
 * Verified: 2026-09-26.
 */

export const JK_FEE_EFFECTIVE_FROM = "2019-03-05"; // Ord. No. 2019-30(9), which enacted Sec. 26-2's clause

export const JK_SOURCE_KEY = "jackson-code-26-2";

/**
 * No fee rules exist in any public Jackson document. The empty array is the
 * honest payload: a rule invented here would be a fee the City has never
 * published, charged to a reader.
 */
export const JK_BUILDING_RULES: FeeRuleRecord[] = [];
export const JK_ELECTRICAL_RULES: FeeRuleRecord[] = [];
export const JK_PLUMBING_RULES: FeeRuleRecord[] = [];
