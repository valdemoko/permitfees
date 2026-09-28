import { daysBetween, formatIsoDate, normalizeIsoDate } from "@/lib/dates";
import { site } from "@/lib/site";

/**
 * Verification presentation logic.
 *
 * Lives here rather than inside a component because it is domain logic: the rule
 * for "this data is past its review window" is a product decision, and it has to
 * be identical everywhere it is displayed.
 *
 * See DATA_SOURCES.md section 4 for the status definitions.
 */

export type VerificationStatus =
  | "unverified"
  | "verified"
  | "needs_review"
  | "outdated"
  | "disputed";

export type VerificationTone = "verified" | "caution" | "danger" | "neutral";

export type VerificationDescription = {
  status: VerificationStatus;
  /** Badge text, e.g. "Verified Sep 2026". */
  label: string;
  /** Sentence suitable for a source block or page footer. */
  sentence: string;
  tone: VerificationTone;
  ageDays: number | null;
  isFresh: boolean;
};

const TONES: Record<VerificationStatus, VerificationTone> = {
  verified: "verified",
  needs_review: "caution",
  outdated: "caution",
  disputed: "danger",
  unverified: "neutral",
};

function monthAndYear(iso: string): string {
  // "September 2026" — month and year are what matter for a review date, and
  // the exact day adds precision a reader does not need while implying more
  // freshness than we can promise.
  const formatted = formatIsoDate(iso);
  const parts = formatted.split(" ");
  const month = parts[0] ?? "";
  const year = parts[2] ?? "";
  return `${month.slice(0, 3)} ${year}`;
}

export function describeVerification(input: {
  lastVerifiedAt: string | null;
  asOf: string;
  status?: VerificationStatus;
  /** Overrides the default freshness window, for page classes that differ. */
  freshnessDays?: number;
}): VerificationDescription {
  const freshnessDays = input.freshnessDays ?? site.verificationFreshnessDays;

  if (input.lastVerifiedAt === null) {
    return {
      status: input.status ?? "unverified",
      label: "Not yet verified",
      sentence: "We have not yet checked this against the official source.",
      tone: "neutral",
      ageDays: null,
      isFresh: false,
    };
  }

  const verifiedAt = normalizeIsoDate(input.lastVerifiedAt);
  const ageDays = daysBetween(verifiedAt, normalizeIsoDate(input.asOf));
  const isFresh = ageDays <= freshnessDays;
  const status = input.status ?? (isFresh ? "verified" : "needs_review");

  const when = monthAndYear(verifiedAt);

  const sentences: Record<VerificationStatus, string> = {
    verified: `Last verified against the official source in ${when}.`,
    needs_review: `Last verified in ${when}, which is past our review window. The numbers may have changed.`,
    outdated: `Last verified in ${when}. This schedule has been replaced and the page is being updated.`,
    disputed: `Sources for this figure disagree. Details are recorded on the page.`,
    unverified: `This figure has not been checked against an official source.`,
  };

  return {
    status,
    label: status === "verified" ? `Verified ${when}` : sentences[status].split(".")[0] ?? when,
    sentence: sentences[status],
    tone: TONES[status],
    ageDays,
    isFresh,
  };
}
