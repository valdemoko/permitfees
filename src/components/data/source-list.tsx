import { Badge } from "@/components/ui/badge";
import { EditorialText } from "@/components/ui/editorial-text";
import { formatIsoDate } from "@/lib/dates";
import type { SourceRow } from "@/lib/db/schema";

/**
 * Source attribution.
 *
 * Every published number traces to a row rendered here. Presenting the issuing
 * authority, the document type and the dates is what lets a reader verify the
 * claim themselves instead of taking our word for it.
 *
 * These are set as a ruled ledger rather than as cards: a source is a record of
 * provenance, and a bordered box per document would suggest each one is a
 * product on a shelf. The left rule turns accent on hover, which is the only
 * affordance needed.
 *
 * External links use `rel="nofollow"` on purpose: we are not passing authority to
 * municipal websites, and more importantly we are not turning an attribution into
 * an SEO arrangement.
 */

const SOURCE_TYPE_LABELS: Record<SourceRow["sourceType"], string> = {
  municipal_website: "City website",
  municipal_code: "Municipal code",
  ordinance: "Ordinance",
  fee_schedule_pdf: "Fee schedule (PDF)",
  state_agency: "State agency",
  county_website: "County website",
  official_calculator: "Official calculator",
  permit_portal: "Permit portal",
  other: "Official document",
};

const AUTHORITY_KIND_LABELS: Record<SourceRow["authorityKind"], string> = {
  city: "City",
  county: "County",
  state: "State",
  other: "Authority",
};

/** One line of dates, in the order a reader would ask for them. */
function describeSourceDates(source: SourceRow): string {
  const parts = [source.issuingAuthority];
  parts.push(
    source.documentDate
      ? `Document dated ${formatIsoDate(source.documentDate)}`
      : "Undated document",
  );
  if (source.effectiveFrom) parts.push(`Effective ${formatIsoDate(source.effectiveFrom)}`);
  parts.push(`Retrieved ${formatIsoDate(source.retrievedAt)}`);
  return parts.join(" · ");
}

export function SourceList({ sources }: { sources: SourceRow[] }) {
  if (sources.length === 0) {
    return (
      <p className="empty">
        No official sources have been recorded for this page yet, which is why it is not published
        for search engines.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.375rem" }}>
      {sources.map((source) => (
        <li className="source" key={source.id}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
            <Badge tone="accent">{SOURCE_TYPE_LABELS[source.sourceType]}</Badge>
            <Badge>{AUTHORITY_KIND_LABELS[source.authorityKind]}</Badge>
            {source.isPrimary ? <Badge tone="verified">Primary source</Badge> : null}
          </div>

          <p style={{ margin: 0 }}>
            <a
              className="source__title"
              href={source.url}
              rel="nofollow noopener"
              target="_blank"
            >
              {source.title}
            </a>
          </p>

          <p className="source__meta" style={{ margin: 0 }}>
            {describeSourceDates(source)}
          </p>

          {source.notes ? (
            <div className="source__note">
              <EditorialText text={source.notes} className="editorial--compact" />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
