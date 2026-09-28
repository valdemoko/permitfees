/**
 * Shapes for the human-written content attached to jurisdictions and pages.
 *
 * These are stored as JSONB on the editorial tables. They are kept here, rather
 * than inside the schema module, because they are a content contract: the
 * publishing gate, the page templates and (later) the admin forms all read them.
 *
 * See CONTENT_STRATEGY.md for the editorial rules these shapes serve.
 */

import type { CalculationInput } from "@/lib/calc/types";

/** A real question someone asked, answered in one or two sentences. */
export type FaqEntry = {
  question: string;
  /** The answer, in plain language. No filler, no restating the question. */
  answer: string;
  /** Where the answer came from, when it is not the page's main source. */
  sourceId?: string;
  /** Free-text attribution, e.g. "permitted by phone with the permit office". */
  attribution?: string;
};

/**
 * The inputs a worked example is computed from.
 *
 * `asOf` is deliberately absent: the example is computed as of the date the page
 * is rendered, so a published figure can never outlive the rule that produced it.
 */
export type WorkedExampleInputs = Omit<CalculationInput, "asOf">;

/**
 * A worked example.
 *
 * This carries inputs and prose ONLY. It contains no amounts, no breakdown and no
 * total, because a stored figure is a figure that can drift away from the fee
 * schedule it claims to come from. The page runs the engine over these inputs and
 * the rules read from the database, so what a reader sees is computed at the
 * moment it is served, from a rule that is in effect on that date.
 *
 * A consequence worth stating plainly: editing a rate changes every example that
 * uses it, and a rendered total that no longer matches what we published before is
 * a signal, not a bug.
 *
 * Validation lives in `worked-example.ts`; an example that does not parse is
 * dropped rather than rendered half-way.
 */
export type WorkedExample = {
  /**
   * The scenario in prose. Deliberately does not repeat the numbers, which live
   * only in `inputs` — a figure written twice is a figure that can disagree with
   * itself.
   */
  scenario: string;
  /** Engine inputs. Every number the example uses comes from here. */
  inputs: WorkedExampleInputs;
  /** Anything the example assumes or leaves out, stated plainly. */
  notes?: string;
};

/** The set of informational fields a jurisdiction page can carry. */
export type JurisdictionProfileContent = {
  headline: string | null;
  summary: string | null;
  localContext: string | null;
  valuationBasis: string | null;
  notIncluded: string | null;
};

/** The set of informational fields a permit page can carry. */
export type PermitPageContent = {
  title: string | null;
  intro: string | null;
  localSummary: string | null;
  notIncluded: string | null;
  workedExample: WorkedExample | null;
  faqs: FaqEntry[] | null;
};
