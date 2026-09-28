/**
 * Detection of an honestly-stated absence of a fee schedule.
 *
 * Some jurisdictions — Jackson MS, Burlington VT, Charleston WV — publish no
 * fee schedule at all (or none for a trade), and their permit pages say so in
 * prose instead of inventing an amount. The editorial gate admits such pages
 * through its `hasNoScheduleStatement` input; this module is how a page and its
 * tests decide, from the stored text alone, whether a page is one of them.
 *
 * Why prose rather than a database column: the statement already exists in the
 * text, it is already shown to the reader, and every sentence in this dataset
 * was written to be verifiable. A duplicate boolean column would be a second
 * fact to keep in sync with the prose — and the prose is the thing the reader
 * actually sees.
 *
 * The predicate is deliberately strict. Three dataset sentences shaped the
 * checks, each a false positive for a naive "publishes no … fee schedule"
 * match:
 *
 * - Atlanta: "publishes no separate plan-review percentage … the fee table
 *   prints no plan-review line" — a true statement about one *component* of a
 *   schedule that exists and is priced.
 * - Wilmington: "no published minimum: the Department of Licenses &
 *   Inspections fee table prices …" — the schedule noun is not the object of
 *   the negative; a determiner-bound noun phrase intervenes.
 * - Burlington: "publishes no stand-alone trade fee schedule online" — a
 *   genuine whole-schedule absence, which must keep firing.
 *
 * `statesNoSchedule` is only truthful when the page carries **zero** rule
 * rows. A page whose rules merely expired still has a schedule — the data is
 * stale, and the gate must 404 it rather than publish it as an honest absence.
 * That guard lives at the call site, where the rule rows are at hand.
 */

/** Verbs that state the absence itself. */
const NEGATIVE_TRIGGER =
  /(?:does not publish|publishes no|publishes none online|no published|no priced)/gi;

/** The absent document. */
const SCHEDULE_NOUN = /(?:fee schedule|fee table)/i;

/** A notIncluded list entry that names the absent table itself. */
const ABSENT_TABLE_ENTRY =
  /a priced (?:electrical|plumbing|mechanical|building) fee table|no priced fee table/i;

/** "The adopted schedule … is not online", "the fee schedule is not posted". */
const SCHEDULE_NOT_POSTED =
  /(?:fee schedule|fee table)[^.]{0,80}(?:is not (?:published|online|posted))/i;

/**
 * Component nouns: when one sits between the negative trigger and the schedule
 * noun, the sentence is about a missing piece of a priced schedule (Atlanta),
 * not about an absent schedule.
 */
const COMPONENT_NOUN =
  /(?:plan[- ]review|plan check|zoning|land[- ]use|impact|utility|separate|\bfee\b)/i;

/**
 * A definite article between the trigger and the noun means the noun is not
 * the object of the negative (Wilmington): "no published minimum: the … fee
 * table" names the table in order to use it. Genuine absences bind the noun
 * with a possessive ("does not publish its fee schedule") or an adjective
 * ("no plumbing fee schedule"), never an article.
 */
const ARTICLE_INTERVENING = /\b(?:the|this)\b/i;

/**
 * True when the stored text states, in the page's own words, that the
 * jurisdiction publishes no fee schedule (for this permit). `intro`, the
 * page's `notIncluded` list and the profile's `notIncluded` list are the three
 * places a writer of this site records the absence; the page route checks all
 * three.
 */
export function statesNoSchedule(text: string | null | undefined): boolean {
  if (!text) return false;

  if (SCHEDULE_NOT_POSTED.test(text) || ABSENT_TABLE_ENTRY.test(text)) return true;

  // Walk every negative trigger and inspect what stands between it and the
  // schedule noun it governs.
  for (const trigger of text.matchAll(NEGATIVE_TRIGGER)) {
    const after = text.slice((trigger.index ?? 0) + trigger[0].length);
    const nounMatch = /(.{0,140}?)((?:fee schedule|fee table))/is.exec(after);
    if (!nounMatch) continue;
    const between = nounMatch[1] ?? "";
    if (COMPONENT_NOUN.test(between)) continue;
    if (ARTICLE_INTERVENING.test(between)) continue;
    return true;
  }

  return false;
}
