import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SourceList } from "@/components/data/source-list";
import { VerificationBadge } from "@/components/data/verification-badge";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { EditorialText } from "@/components/ui/editorial-text";
import { DataTable, Td, Th, Tr } from "@/components/ui/table";
import {
 getJurisdictionContext, listPermitPages,
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
import { ROUTES, jurisdictionPath, permitPagePath, statePath } from "@/lib/seo/urls";
import { currentIsoDate } from "@/lib/time";

/**
 * Jurisdiction hub.
 *
 * Answers "what do I have to deal with to build here" — which authority issues
 * permits, what they call things, where to apply, and which permit costs we have
 * worked out. It routes; it does not repeat the fee tables, because a hub page
 * that duplicates its children competes with them.
 *
 * `getJurisdictionContext` returns `null` unless the profile is published and
 * indexable, so an unpublished jurisdiction is a 404 rather than a thin page.
 */

export const revalidate = 3_600;

/**
 * Opt this dynamic segment into ISR — same mechanism and same reasoning as in
 * `src/app/[state]/page.tsx` (see the comment there for the full explanation
 * and the 2026-09-28 verification). Without this export the segment's
 * `revalidate` is ignored at runtime and every request re-renders against the
 * database; with it, pages are cached for `revalidate` seconds via on-demand
 * ISR while unknown params keep rendering on demand (real 404s stay 404s).
 */
export function generateStaticParams(): Array<{ state: string; city: string }> {
  return [];
}

type JurisdictionRouteProps = { params: Promise<{ state: string; city: string }> };

export async function generateMetadata({
  params,
}: JurisdictionRouteProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;

  try {

    if (isReservedSlug(stateSlug) || isReservedSlug(citySlug)) {
      return noindexMetadata("Page not found | Permit Fee", `/${stateSlug}/${citySlug}/`);
    }

    const context = await getJurisdictionContext(stateSlug, citySlug);
    if (!context) {
      return noindexMetadata(
        "Page not found | Permit Fee",
        jurisdictionPath(stateSlug, citySlug),
      );
    }

    const permitPages = await listPermitPages(context.jurisdiction.id);

    return buildMetadata({
      title: composeTitle(
        `${context.jurisdiction.name}, ${context.state.code} permit fees and requirements`,
      ),
      description: normalizeSeoDescription(
        context.profile?.summary ??
          `Permit fees, requirements and the issuing authority for ${context.jurisdiction.name}, ${context.state.code}.`,
      ),
      path: jurisdictionPath(stateSlug, citySlug),
      modifiedTime: context.profile?.lastReviewedAt ?? null,
    });

  } catch (error) {
    // A failed database read must not escape `generateMetadata`: Next.js
    // maps errors thrown here to the not-found page (404), which would turn
    // a database outage into "this page does not exist". The page component
    // runs the same query and throws the same error, landing in `error.tsx`
    // (controlled 500 + retry) — the correct answer while the database is
    // unreadable. Genuinely missing rows still return null and still 404.
    if (error instanceof DatabaseUnavailableError) {
      return noindexMetadata("Temporarily unavailable | Permit Fee", jurisdictionPath(stateSlug, citySlug));
    }
    throw error;
  }
}

export default async function JurisdictionPage({ params }: JurisdictionRouteProps) {
  const { state: stateSlug, city: citySlug } = await params;

  if (isReservedSlug(stateSlug) || isReservedSlug(citySlug)) notFound();

  const context = await getJurisdictionContext(stateSlug, citySlug);
  if (!context) notFound();

  const permitPages = await listPermitPages(context.jurisdiction.id);
  const asOf = currentIsoDate();

  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: context.state.name, path: statePath(stateSlug) },
    { name: context.jurisdiction.name, path: jurisdictionPath(stateSlug, citySlug) },
  ];

  const title = `${context.jurisdiction.name}, ${context.state.code} permit fees and requirements`;
  const authority = context.jurisdiction.officialName ?? context.jurisdiction.name;

  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            breadcrumbs={breadcrumbs}
            eyebrow={context.state.name}
            title={title}
            lead={context.profile?.summary ?? undefined}
            /*
              The badge only. The authority used to be repeated here as muted text and
              again as the first fact below; with the facts now in the rail beside the
              title, saying it twice in one header was visible redundancy rather than
              reinforcement. It is stated once, as the labelled fact.
            */
            meta={
              <VerificationBadge
                lastVerifiedAt={context.profile?.lastReviewedAt ?? null}
                asOf={asOf}
              />
            }
            aside={
              /*
                The facts sit in the header's right-hand column rather than in a block
                under the lead: they answer "is this the right jurisdiction, and can I
                trust this number" before the summary is read, and the summary is long
                enough that stacking them underneath left the column empty and the page
                looking like one narrow strip of text.
              */
              <div className="facts">
                <div className="facts__item">
                  <p className="facts__label">Issuing authority</p>
                  <p className="facts__value" style={{ fontSize: "0.9375rem" }}>
                    {authority}
                  </p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Permit pages</p>
                  <p className="facts__value tnum">{permitPages.length}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Official sources</p>
                  <p className="facts__value tnum">{context.sources.length}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Profile reviewed</p>
                  <p className="facts__value tnum" style={{ fontSize: "0.9375rem" }}>
                    {context.profile?.lastReviewedAt ?? "Not yet"}
                  </p>
                </div>
              </div>
            }
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container width="wide">
          <div className="section-head">
            <h2>Permit costs we have worked out</h2>
            <p>
              Each page shows the fee components, the formula the jurisdiction uses, and a worked
              example you can follow by hand.
            </p>
          </div>

          {permitPages.length === 0 ? (
            <p className="muted">
              No individual permit pages are published for this jurisdiction yet. The fee schedule and
              requirements above are what we have verified so far.
            </p>
          ) : (
            <>
            <p style={{ margin: "0 0 0.875rem", maxWidth: "68ch" }}>
              Estimate your potential {context.jurisdiction.name} permit fee with our{" "}
              <Link
                href={`${ROUTES.calculator}?state=${stateSlug}&city=${citySlug}`}
              >
                Building Permit Fee Calculator
              </Link>
              .
            </p>
            <DataTable
              caption={`Permit pages for ${context.jurisdiction.name}`}
              captionVisible={false}
            >
              <thead>
                <tr>
                  <Th>Permit</Th>
                  <Th>Category</Th>
                  <Th align="right">Last reviewed</Th>
                </tr>
              </thead>
              <tbody>
                {permitPages.map((page) => (
                  <Tr key={page.id}>
                    <Td>
                      <Link
                        className="link-arrow"
                        href={permitPagePath(stateSlug, citySlug, page.slug)}
                      >
                        {page.title ?? `${page.permitTypeName} cost`}
                      </Link>
                    </Td>
                    <Td muted>{page.permitCategory}</Td>
                    <Td align="right" muted numeric>
                      {page.lastReviewedAt ?? "Not reviewed"}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
            </>
          )}
        </Container>
      </Section>

      {context.profile?.localContext ? (
        <Section>
          <Container width="wide">
            {/*
              The `.spread` rail rather than the two-column grid this replaced. Two
              auto-fitting columns gave the local context about 34rem, and it is
              several paragraphs long — so it rendered as a narrow, tall slab. The
              rail gives the heading its own column and the prose the rest, at a
              measure that is capped rather than merely available.
            */}
            <div className="spread">
              <div className="spread__rail">
                <p className="eyebrow">Local context</p>
                <h2>What is specific to {context.jurisdiction.name}</h2>
              </div>
              <div className="spread__body">
                <EditorialText text={context.profile.localContext} />
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      {context.profile?.valuationBasis ? (
        <Section tone="surface">
          <Container width="wide">
            <div className="spread">
              <div className="spread__rail">
                <p className="eyebrow">Valuation</p>
                <h2>How valuation is determined here</h2>
              </div>
              <div className="spread__body">
                <EditorialText text={context.profile.valuationBasis} />
              </div>
            </div>
          </Container>
        </Section>
      ) : null}

      {context.departments.length > 0 ? (
        <Section tone="surface">
          <Container width="wide">
            <div className="section-head">
              <h2>Who to contact</h2>
              <p>
                The office that issues the permit, with the details we have verified. Confirm current
                hours before travelling.
              </p>
            </div>

            <div className="grid-cards">
              {context.departments.map((department) => (
                <article className="panel" key={department.id}>
                  <div className="panel__body">
                    <h3 className="panel__title">{department.name}</h3>
                    <dl className="facts" style={{ marginTop: "0.875rem", border: 0, padding: 0 }}>
                      {department.phone ? (
                        <>
                          <dt className="facts__label">Phone</dt>
                          <dd className="facts__value" style={{ fontSize: "0.9375rem" }}>
                            {department.phone}
                          </dd>
                        </>
                      ) : null}
                      {department.hours ? (
                        <>
                          <dt className="facts__label">Hours</dt>
                          <dd className="facts__value" style={{ fontSize: "0.9375rem" }}>
                            {department.hours}
                          </dd>
                        </>
                      ) : null}
                    </dl>
                    {department.url ? (
                      <p style={{ margin: "0.875rem 0 0" }}>
                        <a
                          className="link-quiet"
                          href={department.url}
                          rel="nofollow noopener"
                          target="_blank"
                        >
                          Official website
                        </a>
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {context.profile?.notIncluded ? (
        <Section>
          <Container>
            <div className="section-head">
              <h2>What these fees do not include</h2>
              <p>
                The list is not a disclaimer: on a new house the fees left out can outweigh the
                permit fee several times over. Every entry here is stated on the permit page as well.
              </p>
            </div>
            <Callout variant="estimate" label="Not included in our estimates">
              <EditorialText text={context.profile.notIncluded} />
            </Callout>
          </Container>
        </Section>
      ) : null}

      <Section tone="surface">
        <Container>
          <div className="section-head">
            <h2>Official sources for this jurisdiction</h2>
            <p>
              The documents these figures are transcribed from. Where a source contradicts itself we
              keep both readings and say so on the permit page.
            </p>
          </div>
          <SourceList sources={context.sources} />
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title,
            description:
              context.profile?.summary ??
              `Permit fees and requirements for ${context.jurisdiction.name}.`,
            path: jurisdictionPath(stateSlug, citySlug),
            dateModified: context.profile?.lastReviewedAt ?? null,
          }),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
    </>
  );
}
