import { z } from "zod";

import { OCCUPANCY_CLASSES, WORK_TYPES } from "@/lib/calc/types";

import type { WorkedExample } from "./types";

/**
 * Validation for a stored worked example.
 *
 * The example arrives as JSONB, which is untrusted input even though we wrote it:
 * a typo in an input key would otherwise be a silently ignored fact, and the page
 * would render a total computed from fewer inputs than it displays. `.strict()`
 * turns that typo into a refusal to render instead of a wrong number.
 *
 * The refusal is quiet on the page — the example section simply does not appear —
 * and loud in the tests, which compute every published example from the same
 * definitions the seed writes.
 */

const scalar = z.union([z.string(), z.number(), z.boolean()]);

const inputsSchema = z
  .object({
    valuationCents: z.number().int().min(0).optional(),
    squareFootage: z.number().min(0).optional(),
    units: z.number().int().min(0).optional(),
    fixtures: z.number().int().min(0).optional(),
    occupancy: z.enum(OCCUPANCY_CLASSES).optional(),
    workType: z.enum(WORK_TYPES).optional(),
    constructionType: z.string().trim().min(1).optional(),
    isExpedited: z.boolean().optional(),
    isOwnerBuilder: z.boolean().optional(),
    custom: z.record(z.string(), scalar.nullable()).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "a worked example needs at least one input to calculate from",
  });

export const workedExampleSchema = z
  .object({
    scenario: z.string().trim().min(1),
    notes: z.string().trim().min(1).optional(),
    inputs: inputsSchema,
  })
  .strict();

/**
 * Read a stored example, or `null` when it is absent or malformed.
 *
 * Returning `null` rather than throwing is what keeps a content mistake from
 * taking down a public page. The page already refuses to publish without a
 * published status, a source and a verification date; a broken example is one
 * section missing, not a 500.
 */
export function parseWorkedExample(value: unknown): WorkedExample | null {
  if (value === null || value === undefined) return null;

  const parsed = workedExampleSchema.safeParse(value);
  if (!parsed.success) return null;

  return parsed.data as WorkedExample;
}
