import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import {
  describeVerification,
  type VerificationStatus,
} from "@/lib/sources/verification";

/**
 * Verification display.
 *
 * Showing *when* data was checked, and being honest when it is overdue, is half
 * of what separates this from a scraped fee table. The badge is the compact form;
 * the note is the full sentence, used on the pages where the date matters most.
 */

const TONE_TO_BADGE: Record<string, BadgeTone> = {
  verified: "verified",
  caution: "caution",
  danger: "danger",
  neutral: "neutral",
};

export function VerificationBadge({
  lastVerifiedAt,
  asOf,
  status,
  freshnessDays,
}: {
  lastVerifiedAt: string | null;
  asOf: string;
  status?: VerificationStatus;
  freshnessDays?: number;
}) {
  const description = describeVerification({ lastVerifiedAt, asOf, status, freshnessDays });
  return <Badge tone={TONE_TO_BADGE[description.tone] ?? "neutral"}>{description.label}</Badge>;
}

export function VerificationNote({
  lastVerifiedAt,
  asOf,
  status,
  freshnessDays,
}: {
  lastVerifiedAt: string | null;
  asOf: string;
  status?: VerificationStatus;
  freshnessDays?: number;
}) {
  const description = describeVerification({ lastVerifiedAt, asOf, status, freshnessDays });

  return (
    <Callout variant={description.isFresh ? "verified" : "note"} label="Verification">
      <p style={{ margin: 0 }}>{description.sentence}</p>
      {!description.isFresh && description.ageDays !== null ? (
        <p style={{ marginTop: "0.375rem", color: "var(--color-ink-600)", fontSize: "0.875rem" }}>
          Checked {description.ageDays} days before this page was rendered.
        </p>
      ) : null}
    </Callout>
  );
}
