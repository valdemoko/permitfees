import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { Container, Section } from "@/components/ui/container";
import { DataTable, Td, Th, Tr } from "@/components/ui/table";
import {
 getStateBySlug, getStateCoverage, listJurisdictionSummaries,
  DatabaseUnavailableError,
 } from "@/lib/db/queries";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import {
  buildMetadata,
  composeTitle,
  noindexMetadata,
  normalizeSeoDescription,
} from "@/lib/seo/metadata";
import { isReservedSlug } from "@/lib/seo/slugs";
import { ROUTES, jurisdictionPath, statePath } from "@/lib/seo/urls";

/**
 * State hub.
 *
 * A state is published only when it has at least one published jurisdiction, so
 * this route can never render an empty shell that says nothing. That is the same
 * rule SEO.md states and the sitemap enforces, applied at the route.
 *
 * Visually this is a register, not a landing page: a short header, the counts
 * that matter, then the jurisdictions themselves with their permit pages
 * numbered. Someone who lands here from a search wants to get to a city in one
 * click and see how much has been verified before they do.
 */

export const revalidate = 3_600;

/**
 * Opt this dynamic segment into ISR.
 *
 * In the App Router, a segment with dynamic params and **no**
 * `generateStaticParams` is rendered dynamically on every request and the
 * segment's `revalidate` is ignored — responses come back
 * `Cache-Control: private, no-store` with no `x-nextjs-cache`, which is exactly
 * what the 2026-09-28 audits measured (0.3–1.8 s per request, DB read every
 * time). Exporting `generateStaticParams` switches the segment to on-demand
 * revalidation: unknown params still render on demand (`dynamicParams` stays at
 * its default, so real 404s stay 404s), and every rendered page is cached for
 * `revalidate` seconds and served with `s-maxage=3600, stale-while-revalidate`.
 *
 * Returning an empty list is deliberate: it enables on-demand ISR without
 * prerendering all N pages at build time, so a build needs no database, a
 * transient query failure cannot fail the build, and pages are rendered from
 * live data on first request instead of build-time data. The freshness
 * semantics are unchanged: `revalidate` still governs the update window.
 *
 * Verified 2026-09-28 against next@16.3.6: first request MISS, second request
 * `x-nextjs-cache: HIT` at ~4 ms, `s-maxage=3600` present.
 */
export function generateStaticParams(): Array<{ state: string }> {
  return [];
}

type StateRouteProps = { params: Promise<{ state: string }> };

const JURISDICTION_TYPE_LABELS: Record<string, string> = {
  city: "City",
  county: "County",
  town: "Town",
  village: "Village",
  borough: "Borough",
  special_district: "Special district",
};

export async function generateMetadata({ params }: StateRouteProps): Promise<Metadata> {
  const { state: stateSlug } = await params;

  try {

    if (isReservedSlug(stateSlug)) {
      return noindexMetadata("Page not found | Permit Fee", `/${stateSlug}/`);
    }

    const stateRow = await getStateBySlug(stateSlug);
    if (!stateRow) {
      return noindexMetadata("Page not found | Permit Fee", `/${stateSlug}/`);
    }

    const jurisdictions = await listJurisdictionSummaries(stateRow.id);

    return buildMetadata({
      title: composeTitle(`${stateRow.name} building permit costs by city`),
      description: normalizeSeoDescription(
        `Permit fees in ${stateRow.name}, city by city, calculated from official fee schedules. ${jurisdictions.length} ${
          jurisdictions.length === 1 ? "jurisdiction" : "jurisdictions"
        } with verified data.`,
      ),
      path: statePath(stateSlug),
      noindex: jurisdictions.length === 0,
    });

  } catch (error) {
    // A failed database read must not escape `generateMetadata`: Next.js
    // maps errors thrown here to the not-found page (404), which would turn
    // a database outage into "this page does not exist". The page component
    // runs the same query and throws the same error, landing in `error.tsx`
    // (controlled 500 + retry) — the correct answer while the database is
    // unreadable. Genuinely missing rows still return null and still 404.
    if (error instanceof DatabaseUnavailableError) {
      return noindexMetadata("Temporarily unavailable | Permit Fee", `/${stateSlug}/`);
    }
    throw error;
  }
}

export default async function StatePage({ params }: StateRouteProps) {
  const { state: stateSlug } = await params;

  // Cheap guard before touching the database: a reserved word can never be a
  // state slug, so this is a 404 and not a query.
  if (isReservedSlug(stateSlug)) notFound();

  const stateRow = await getStateBySlug(stateSlug);
  if (!stateRow) notFound();

  const jurisdictions = await listJurisdictionSummaries(stateRow.id);
  if (jurisdictions.length === 0) notFound();

  const coverage = await getStateCoverage(stateRow.id);

  const pageTotal = jurisdictions.reduce((sum, row) => sum + row.permitPageCount, 0);

  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: stateRow.name, path: statePath(stateSlug) },
  ];

  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            breadcrumbs={breadcrumbs}
            eyebrow="State"
            title={`${stateRow.name} permit costs by city`}
            lead={`Every figure on these pages comes from the fee schedule the city or county publishes. ${jurisdictions.length} ${
              jurisdictions.length === 1 ? "jurisdiction" : "jurisdictions"
            } so far.`}
            aside={
              /*
                In the aside, not below it. The header reserves a right-hand column at
                desktop widths, and a facts block stacked under the lead leaves it empty —
                which made this page read as a narrow column with half the screen blank.
              */
              
              <div className="facts">
                <div className="facts__item">
                  <p className="facts__label">Jurisdictions</p>
                  <p className="facts__value tnum">{jurisdictions.length}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Permit pages</p>
                  <p className="facts__value tnum">{pageTotal}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">State code</p>
                  <p className="facts__value">{stateRow.code}</p>
                </div>
              </div>
            }
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container width="wide">
          <div className="section-head">
            <h2>Where we have fee data</h2>
            <p>
              A county appears as its own entry when it issues permits for unincorporated areas. That
              is a real distinction, not a technicality: an address outside a city&rsquo;s limits is
              often the county&rsquo;s permit to issue. Use our{" "}
              <Link
                href={`${ROUTES.calculator}?state=${stateSlug}${jurisdictions.length === 1 ? `&city=${jurisdictions[0]?.slug ?? ""}` : ""}`}
              >
                permit fee calculator
              </Link>{" "}
              to estimate fees for these jurisdictions.
            </p>
          </div>

          <DataTable caption={`Jurisdictions in ${stateRow.name} with published permit data`}>
            <thead>
              <tr>
                <Th>Jurisdiction</Th>
                <Th>Issuing authority</Th>
                <Th align="right">Permit pages</Th>
              </tr>
            </thead>
            <tbody>
              {jurisdictions.map((jurisdiction) => (
                <Tr key={jurisdiction.id}>
                  <Td>
                    <Link className="link-arrow" href={jurisdictionPath(stateSlug, jurisdiction.slug)}>
                      {jurisdiction.name}
                    </Link>
                  </Td>
                  <Td muted>
                    {JURISDICTION_TYPE_LABELS[jurisdiction.type] ?? jurisdiction.type}
                    {jurisdiction.officialName ? (
                      <span
                        style={{
                          display: "block",
                          color: "var(--color-ink-500)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {jurisdiction.officialName}
                      </span>
                    ) : null}
                  </Td>
                  <Td align="right" numeric>
                    {jurisdiction.permitPageCount}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        </Container>
      </Section>

      {coverage && coverage.permitPageCount > 0 ? (
        <Section tone="surface">
          <Container width="wide">
            <div className="spread">
              <div className="spread__rail">
                <p className="eyebrow">Coverage</p>
                <h2>What the {stateRow.name} record contains</h2>
              </div>
              <div className="spread__body">
                {/*
                  Everything in this section is counted from published rows, so
                  the page states exactly what its record shows and nothing
                  more. When a state's coverage grows, the numbers move; when a
                  permit kind is not covered here, it is not named.
                */}
                <p>
                  This page covers {coverage.jurisdictionCount}{" "}
                  {coverage.jurisdictionCount === 1 ? "jurisdiction" : "jurisdictions"} in{" "}
                  {stateRow.name} with {coverage.permitPageCount} published{" "}
                  {coverage.permitPageCount === 1 ? "permit page" : "permit pages"}, built from{" "}
                  {coverage.feeRuleCount} recorded fee {coverage.feeRuleCount === 1 ? "rule" : "rules"}
                  {" "}and {coverage.sourceCount} official {coverage.sourceCount === 1 ? "source" : "sources"}
                  {coverage.verificationCount > 0
                    ? `, with ${coverage.verificationCount} verification ${coverage.verificationCount === 1 ? "entry" : "entries"} recorded`
                    : ""}
                  .
                </p>
                {coverage.permitKinds.length > 0 ? (
                  <>
                    <p>
                      The permit kinds worked out so far in {stateRow.name}:
                    </p>
                    <ul>
                      {coverage.permitKinds.map((kind) => (
                        <li key={kind.permitTypeName}>
                          {kind.permitTypeName} — {kind.permitPageCount}{" "}
                          {kind.permitPageCount === 1 ? "page" : "pages"}
                          {kind.lastVerifiedAt
                            ? `, last reviewed ${kind.lastVerifiedAt}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p>
                  Cities and counties not listed yet are not covered: the methodology only adds a
                  jurisdiction once its official fee schedule has been read and verified. See{" "}
                  <Link href={ROUTES.methodology}>the methodology</Link> for what a source has to
                  satisfy before a figure appears here.
                </p>
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: `${stateRow.name} building permit costs by city`,
            description: `Permit fees in ${stateRow.name} calculated from official fee schedules.`,
            path: statePath(stateSlug),
          }),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
    </>
  );
}
