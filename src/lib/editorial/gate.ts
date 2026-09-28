import { daysBetween, normalizeIsoDate } from "@/lib/dates";
import { site } from "@/lib/site";

/**
 * The editorial gate.
 *
 * This is what enforces "quality over quantity" in code rather than in
 * discipline. A page is indexable only when it clears every check here; until
 * then it either does not exist (the route 404s) or is served `noindex`.
 *
 * The sitemap calls the same function as the routes, so the sitemap and the
 * router can never disagree about what is published.
 *
 * See SEO.md section 3 and CONTENT_STRATEGY.md section 1.
 */

export type PublishStatus = "draft" | "published" | "hidden";

/**
 * Minimum prose length for a permit page's opening section.
 *
 * This is a floor, not a target. It exists to catch an accidental empty field,
 * not to encourage padding: the editorial rule is that the prose has to say
 * something true about *this* jurisdiction, and no length threshold can enforce
 * that. A human does.
 */
export const MIN_INTRO_LENGTH = 240;

/** Minimum length for the local summary that makes a page specific to a place. */
export const MIN_LOCAL_SUMMARY_LENGTH = 120;

export type PublishabilityInput = {
  publishStatus: PublishStatus;
  /** The explicit "keep this out of search" switch. */
  noindex: boolean;
  intro: string | null;
  localSummary: string | null;
  /** How many primary sources back the page. */
  sourceCount: number;
  /** How many active fee rules exist for this page as of `asOf`. */
  feeRuleCount: number;
  /**
   * How many fee rules the page carries in total, before the effective window
   * and status filters are applied.
   *
   * The distinction matters because a page whose entire schedule has expired
   * (every rule's `effectiveTo` has passed) would otherwise read as "no fee
   * schedule is published here" — which is false and would publish an empty
   * page with a dishonest absence statement. Expiry is a data problem the page
   * must not paper over; a jurisdiction that genuinely publishes nothing is a
   * fact the page is allowed to state.
   */
  totalRuleCount?: number;
  /**
   * True when the jurisdiction genuinely publishes no fee schedule and the page
   * says so. An honest "no published fee schedule" page is publishable; a page
   * that pretends to estimate when there is nothing to estimate from is not.
   */
  hasNoScheduleStatement?: boolean;
  /** Most recent verification date, from the verification ledger. */
  lastVerifiedAt: string | null;
  faqCount: number;
  /** The date the gate is evaluated for. Required, like everywhere else. */
  asOf: string;
};

export type PublishabilityResult = {
  /** Whether the route may render content at all. */
  publishable: boolean;
  /**
   * Whether this page may appear in search results and in the sitemap, before the
   * deployment-wide indexability switch is applied.
   */
  indexable: boolean;
  /** Reasons the page cannot be published. Empty when `publishable` is true. */
  failures: string[];
  /** Non-blocking issues worth fixing. */
  warnings: string[];
};

function isSubstantial(value: string | null, minimum: number): boolean {
  if (value === null) return false;
  return value.trim().length >= minimum;
}

export function isVerificationFresh(
  lastVerifiedAt: string | null,
  asOf: string,
  windowDays: number = site.verificationFreshnessDays,
): boolean {
  if (lastVerifiedAt === null) return false;
  const age = daysBetween(normalizeIsoDate(lastVerifiedAt), normalizeIsoDate(asOf));
  return age <= windowDays;
}

export function evaluatePublishability(input: PublishabilityInput): PublishabilityResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (input.publishStatus !== "published") {
    failures.push(`Publish status is "${input.publishStatus}", not "published".`);
  }

  if (!isSubstantial(input.intro, MIN_INTRO_LENGTH)) {
    failures.push(
      `The introductory section is missing or shorter than ${MIN_INTRO_LENGTH} characters.`,
    );
  }

  if (!isSubstantial(input.localSummary, MIN_LOCAL_SUMMARY_LENGTH)) {
    failures.push(
      `The locality-specific summary is missing or shorter than ${MIN_LOCAL_SUMMARY_LENGTH} characters.`,
    );
  }

  if (input.sourceCount < 1) {
    failures.push("The page cites no primary source.");
  }

  const hasCalculableFees = input.feeRuleCount > 0;
  if (!hasCalculableFees && input.hasNoScheduleStatement !== true) {
    failures.push(
      "The page has no active fee rules and does not state that no fee schedule is published.",
    );
  }

  // An honest absence (the jurisdiction publishes no schedule at all) is
  // publishable; an exhausted one (the schedule expired and nothing replaced
  // it) is not. When the caller does not supply the total the distinction is
  // unavailable and the page keeps the stricter treatment it had before.
  if (
    hasCalculableFees &&
    input.totalRuleCount !== undefined &&
    input.feeRuleCount < input.totalRuleCount
  ) {
    warnings.push(
      "Some fee rules are outside their effective window; the page may be showing a partial schedule.",
    );
  }

  if (input.lastVerifiedAt === null) {
    failures.push("The page has never been verified.");
  }

  if (input.faqCount === 0) {
    warnings.push(
      "No FAQs on this page. Add ones drawn from real queries or department guidance when they exist, and leave it empty rather than inventing them.",
    );
  }

  if (!isVerificationFresh(input.lastVerifiedAt, input.asOf)) {
    warnings.push(
      "Verification is older than the freshness window; the page is due for review.",
    );
  }

  if (input.noindex && input.publishStatus === "published") {
    warnings.push("The page is published but explicitly excluded from search.");
  }

  const publishable = failures.length === 0;
  // Page-level indexability only. Whether the *deployment* is indexable at all is
  // a separate switch applied by `buildMetadata` and `robots.txt`. Keeping the two
  // apart means this gate can be reasoned about and tested on its own terms.
  const indexable = publishable && input.noindex === false;

  return { publishable, indexable, failures, warnings };
}
