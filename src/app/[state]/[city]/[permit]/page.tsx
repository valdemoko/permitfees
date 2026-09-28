import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SourceList } from "@/components/data/source-list";
import { VerificationBadge, VerificationNote } from "@/components/data/verification-badge";
import { WorkedExamplePanel } from "@/components/data/worked-example";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { EditorialText } from "@/components/ui/editorial-text";
import { DataTable, Td, Th, Tr } from "@/components/ui/table";
import {
  COMPONENT_TYPE_LABELS,
  calculatePermitFees,
  describeApplicability,
  describeFeeRule,
  validateFeeRule,
  type FeeRuleRecord,
  type ValidatedFeeRule,
} from "@/lib/calc";
import { isWithinEffectiveWindow } from "@/lib/dates";
import {

  getJurisdictionContext,
  getPermitPageDetail,
  listPermitPages,
  readFaqs,
  readWorkedExample,
  DatabaseUnavailableError,
 } from "@/lib/db/queries";
import { evaluatePublishability } from "@/lib/editorial";
import { statesNoSchedule } from "@/lib/editorial/no-schedule";
import { formatCents, withIndefiniteArticle } from "@/lib/format";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import {
  buildMetadata,
  composeTitle,
  noindexMetadata,
  normalizeSeoDescription,
  normalizeSeoTitle,
} from "@/lib/seo/metadata";
import { isReservedSlug } from "@/lib/seo/slugs";
import { ROUTES, jurisdictionPath, permitPagePath, statePath } from "@/lib/seo/urls";
import { currentIsoDate } from "@/lib/time";

/**
 * Permit cost page — the page class that carries the intent this site exists for.
 *
 * Design notes:
 *
 * 1. **No total is shown without project inputs.** A single headline figure would
 *    have to assume a valuation, and an assumed figure presented as "the cost"
 *    is exactly the kind of unverifiable number this project refuses to publish.
 *    The page shows the fee *structure* — every component, its formula, its
 *    conditions and its range — plus a worked example when the record includes
 *    one. The example is *computed*, not written: its inputs are stored and the
 *    engine runs them against the rules from the database, so the figure on the
 *    page cannot outlive the schedule it came from. An interactive calculator
 *    that takes a reader's own valuation belongs on top of this.
 * 2. **The editorial gate runs here, not only in the query.** A row marked
 *    published but missing an intro, a source or a verification date does not get
 *    a URL. Content that has not earned a page 404s.
 * 3. **What is missing is stated.** Impact fees, utility connections and other
 *    departments' permits are named where the record says so, because an
 *    incomplete total presented as complete is the failure mode that matters most.
 *
 * Reading order on screen is the reader's order of questions: what is it, what
 * does it cost (structure), what would it cost for a concrete project (worked
 * example), what is different here, what is not included, what must I file, then
 * where the numbers come from.
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
export function generateStaticParams(): Array<{ state: string; city: string; permit: string }> {
  return [];
}

type PermitRouteProps = {
  params: Promise<{ state: string; city: string; permit: string }>;
};

export async function generateMetadata({ params }: PermitRouteProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug, permit: permitSlug } = await params;

  try {
    if (isReservedSlug(stateSlug) || isReservedSlug(citySlug) || isReservedSlug(permitSlug)) {
      return noindexMetadata(
        "Page not found | Permit Fee",
        `/${stateSlug}/${citySlug}/${permitSlug}/`,
      );
    }

    const context = await getJurisdictionContext(stateSlug, citySlug);
    if (!context) {
      return noindexMetadata(
        "Page not found | Permit Fee",
        permitPagePath(stateSlug, citySlug, permitSlug),
      );
    }

    const detail = await getPermitPageDetail(context.jurisdiction.id, permitSlug);
    if (!detail) {
      return noindexMetadata(
        "Page not found | Permit Fee",
        permitPagePath(stateSlug, citySlug, permitSlug),
      );
    }

    return buildMetadata({
      title: composeTitle(
        normalizeSeoTitle(
          detail.page.seoTitle ??
            `${detail.permitType.name} cost in ${context.jurisdiction.name}, ${context.state.code}`,
        ),
      ),
      description: normalizeSeoDescription(
        detail.page.seoDescription ??
          detail.page.localSummary ??
          `What ${withIndefiniteArticle(detail.permitType.name.toLowerCase())} costs in ${context.jurisdiction.name}, ${context.state.code}, with the formula and the official fee schedule behind it.`,
      ),
      path: permitPagePath(stateSlug, citySlug, permitSlug),
      modifiedTime: detail.lastVerifiedAt ?? detail.page.lastReviewedAt ?? null,
    });
  } catch (error) {
    // A failed database read must not escape `generateMetadata`: Next.js maps
    // errors thrown here to the not-found page (404), which would turn a
    // database outage into "this page does not exist". The page component runs
    // the same query and throws the same error, landing in `error.tsx`
    // (controlled 500 + retry) — the correct answer while the database is
    // unreadable. Genuinely missing rows still return null and still 404.
    if (error instanceof DatabaseUnavailableError) {
      return noindexMetadata(
        "Temporarily unavailable | Permit Fee",
        permitPagePath(stateSlug, citySlug, permitSlug),
      );
    }
    throw error;
  }
}

/**
 * The rules that applied on a given date, validated.
 *
 * A rule whose stored JSON does not validate is dropped rather than guessed at.
 * The admin surface (Phase 4) reports those for repair; a public page must not
 * invent a fee to fill the hole.
 */
function rulesInEffect(rules: FeeRuleRecord[], asOf: string): ValidatedFeeRule[] {
  return rules
    .filter(
      (rule) =>
        rule.status === "active" &&
        isWithinEffectiveWindow(asOf, rule.effectiveFrom, rule.effectiveTo),
    )
    .map((rule) => validateFeeRule(rule))
    .filter((result) => result.ok)
    .map((result) => result.rule);
}

export default async function PermitPage({ params }: PermitRouteProps) {
  const { state: stateSlug, city: citySlug, permit: permitSlug } = await params;

  if (isReservedSlug(stateSlug) || isReservedSlug(citySlug) || isReservedSlug(permitSlug)) {
    notFound();
  }

  const context = await getJurisdictionContext(stateSlug, citySlug);
  if (!context) notFound();

  const detail = await getPermitPageDetail(context.jurisdiction.id, permitSlug);
  if (!detail) notFound();

  const asOf = currentIsoDate();
  const applicableRules = rulesInEffect(detail.feeRuleRecords, asOf);
  const faqs = readFaqs(detail.page.faqs);
  const workedExample = readWorkedExample(detail.page.workedExample);

  /*
    An honest absence, stated in the page's own prose. Some jurisdictions —
    Jackson MS, Burlington VT, Charleston WV — publish no fee schedule at all
    (or none for this trade), and their pages say so instead of inventing an
    amount. The gate admits those pages as published; the predicate is how the
    page tells the gate that this is one of them, matched in the three places
    the statement is written. It only counts when the jurisdiction carries no
    rule rows at all: a page whose rules merely expired still has a schedule —
    that is stale data, and the gate must 404 it, not publish it as an absence.
  */
  const hasNoScheduleStatement =
    detail.totalRuleCount === 0 &&
    (statesNoSchedule(detail.page.intro) ||
      statesNoSchedule(detail.page.notIncluded) ||
      statesNoSchedule(context.profile?.notIncluded));

  // Computed from the rules as they were read from the database on this request,
  // as of today. `detail.feeRuleRecords` — all of them, not just the active ones
  // — so the breakdown can name the rules it left out and say why, which is how
  // the disputed minimum fee is explained rather than silently ignored.
  const workedExampleResult = workedExample
    ? calculatePermitFees({ ...workedExample.inputs, asOf }, detail.feeRuleRecords)
    : null;

  const gate = evaluatePublishability({
    publishStatus: detail.page.publishStatus,
    noindex: detail.page.noindex,
    intro: detail.page.intro,
    localSummary: detail.page.localSummary,
    sourceCount: detail.sources.length,
    feeRuleCount: applicableRules.length,
    totalRuleCount: detail.totalRuleCount,
    hasNoScheduleStatement,
    lastVerifiedAt: detail.lastVerifiedAt,
    faqCount: faqs.length,
    asOf,
  });

  if (!gate.publishable) notFound();

  const siblingPages = (await listPermitPages(context.jurisdiction.id)).filter(
    (page) => page.slug !== permitSlug,
  );

  const jurisdictionName = `${context.jurisdiction.name}, ${context.state.code}`;
  const heading =
    detail.page.title ?? `${detail.permitType.name} cost in ${jurisdictionName}`;

  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: context.state.name, path: statePath(stateSlug) },
    { name: context.jurisdiction.name, path: jurisdictionPath(stateSlug, citySlug) },
    { name: detail.permitType.name, path: permitPagePath(stateSlug, citySlug, permitSlug) },
  ];

  const notIncluded = detail.page.notIncluded ?? context.profile?.notIncluded ?? null;

  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            breadcrumbs={breadcrumbs}
            eyebrow={jurisdictionName}
            title={heading}
            lead={detail.page.intro ?? undefined}
            meta={
              <>
                <Badge tone="accent">Official fee schedule</Badge>
                <VerificationBadge lastVerifiedAt={detail.lastVerifiedAt} asOf={asOf} />
                <span className="muted" style={{ fontSize: "0.8125rem" }}>
                  {context.jurisdiction.officialName ?? context.jurisdiction.name}
                </span>
              </>
            }
            aside={
              /*
                The header's right-hand column, for the same reason the hub uses it: a
                facts block stacked under the lead leaves the reserved column empty and
                the page reads as a narrow strip with half the width doing nothing.
              */
              <div className="facts">
                <div className="facts__item">
                  <p className="facts__label">Permit type</p>
                  <p className="facts__value" style={{ fontSize: "0.9375rem" }}>
                    {detail.permitType.name}
                  </p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Fee components</p>
                  <p className="facts__value tnum">{applicableRules.length}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Sources</p>
                  <p className="facts__value tnum">{detail.sources.length}</p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Schedule as of</p>
                  <p className="facts__value tnum" style={{ fontSize: "0.9375rem" }}>
                    {asOf}
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
            <h2>How this fee is calculated</h2>
            <p>
              These are the components the schedule defines for this permit, as they applied on{" "}
              {asOf}. A component only applies to your project if its conditions match — read that
              column before assuming a figure. Want a figure for your own project?{" "}
              <Link
                href={`${ROUTES.calculator}?state=${stateSlug}&city=${citySlug}&permit=${detail.permitType.key}`}
              >
                Estimate this fee with the permit fee calculator
              </Link>
              .
            </p>
          </div>

          {applicableRules.length === 0 ? (
            <Callout variant="note" label="No published fee schedule">
              <p style={{ margin: 0 }}>
                {context.jurisdiction.name} does not publish a fee schedule we can calculate from, so
                this page does not show a figure. The department contact details and requirements are
                on the <Link href={jurisdictionPath(stateSlug, citySlug)}>jurisdiction page</Link>.
              </p>
            </Callout>
          ) : (
            <>
              <DataTable
                caption={`Fee components for ${withIndefiniteArticle(detail.permitType.name.toLowerCase())}`}
              >
                <thead>
                  <tr>
                    <Th>Component</Th>
                    <Th>Formula</Th>
                    <Th>Applies when</Th>
                    <Th align="right">Range</Th>
                  </tr>
                </thead>
                <tbody>
                  {applicableRules.map((rule) => (
                    <Tr key={rule.id}>
                      <Td strong>
                        {rule.label}
                        <span className="table__sub">
                          {COMPONENT_TYPE_LABELS[rule.componentType]}
                        </span>
                      </Td>
                      <Td>
                        <code className="formula">{describeFeeRule(rule)}</code>
                      </Td>
                      <Td muted>{describeApplicability(rule)}</Td>
                      <Td align="right" numeric muted>
                        {rule.minimumCents !== null || rule.maximumCents !== null
                          ? [
                              rule.minimumCents !== null
                                ? `min ${formatCents(rule.minimumCents)}`
                                : null,
                              rule.maximumCents !== null
                                ? `max ${formatCents(rule.maximumCents)}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")
                          : "—"}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </DataTable>

              <p className="muted" style={{ marginTop: "0.875rem", fontSize: "0.875rem", maxWidth: "68ch" }}>
                A real permit fee is these components added together. The department&rsquo;s final
                calculation is the one that applies — this is the schedule it will be based on.
              </p>
            </>
          )}
        </Container>
      </Section>

      {workedExample && workedExampleResult && workedExampleResult.components.length > 0 ? (
        <Section>
          {/*
            Wide, because the fee components table inside the panel is the widest
            data block on the page and the scenario prose keeps its own 68ch measure
            regardless. A narrow container here would push that table into a
            horizontal scroll for no gain.
          */}
          <Container width="wide">
            <div className="section-head">
              <h2>A worked example</h2>
              <p>
                Follow the arithmetic by hand. Every line is produced by the engine from the rules
                above, so the total cannot drift away from the schedule behind it.
              </p>
            </div>
            <WorkedExamplePanel example={workedExample} result={workedExampleResult} />
          </Container>
        </Section>
      ) : null}

      {detail.page.localSummary ? (
        <Section tone="subtle">
          <Container>
            <div className="section-head">
              <h2>What is different in {context.jurisdiction.name}</h2>
            </div>
            <EditorialText text={detail.page.localSummary} />
          </Container>
        </Section>
      ) : null}

      {notIncluded ? (
        <Section>
          <Container>
            <div className="section-head">
              <h2>What this figure does not include</h2>
              <p>
                Impact fees, utility connections and other departments&rsquo; permits are the usual
                omissions, and in some jurisdictions they are larger than the permit fee itself.
              </p>
            </div>
            <Callout variant="estimate" label="Not included in these figures">
              <EditorialText text={notIncluded} />
            </Callout>
          </Container>
        </Section>
      ) : null}

      {detail.requirements.length > 0 ? (
        <Section tone="surface">
          <Container>
            <div className="section-head">
              <h2>What you need before applying</h2>
            </div>
            <ul className="dataset" style={{ maxWidth: "72ch" }}>
              {detail.requirements.map((requirement) => (
                <li key={requirement.id} style={{ display: "block", cursor: "default" }}>
                  <span
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "0.625rem",
                    }}
                  >
                    <span className="dataset__primary">{requirement.title}</span>
                    <Badge tone={requirement.isMandatory ? "neutral" : "accent"}>
                      {requirement.isMandatory ? "Required" : "May be required"}
                    </Badge>
                  </span>
                  {requirement.description ? (
                    <div
                      style={{
                        marginTop: "0.375rem",
                        color: "var(--color-ink-600)",
                        fontSize: "0.9375rem",
                        maxWidth: "66ch",
                      }}
                    >
                      <EditorialText text={requirement.description} className="editorial--compact" />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {faqs.length > 0 ? (
        <Section>
          <Container>
            <div className="section-head">
              <h2>Common questions</h2>
            </div>
            <div style={{ maxWidth: "72ch", display: "grid", gap: "0.5rem" }}>
              {faqs.map((faq) => (
                <details className="disclosure" key={faq.question}>
                  <summary>{faq.question}</summary>
                  <div className="disclosure__body">
                    <EditorialText text={faq.answer} className="editorial--compact" />
                    {faq.attribution ? (
                      <p className="muted" style={{ margin: "0.4375rem 0 0", fontSize: "0.8125rem" }}>
                        {faq.attribution}
                      </p>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section tone="surface">
        <Container>
          <div className="section-head">
            <h2>Source and verification</h2>
            <p>
              The documents behind every figure on this page, with the dates that make them
              checkable.
            </p>
          </div>
          <div style={{ maxWidth: "72ch" }}>
            <SourceList sources={detail.sources} />
          </div>
          <div style={{ marginTop: "1.5rem", maxWidth: "72ch" }}>
            <VerificationNote lastVerifiedAt={detail.lastVerifiedAt} asOf={asOf} />
          </div>
        </Container>
      </Section>

      {siblingPages.length > 0 ? (
        <Section tone="subtle">
          <Container>
            <div className="section-head">
              <h2>Other permits in {context.jurisdiction.name}</h2>
            </div>
            <ul className="index-list">
              {siblingPages.map((page) => (
                <li key={page.id}>
                  <Link className="link-quiet" href={permitPagePath(stateSlug, citySlug, page.slug)}>
                    {page.permitTypeName} cost
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: heading,
            description: detail.page.seoDescription ?? detail.page.localSummary ?? heading,
            path: permitPagePath(stateSlug, citySlug, permitSlug),
            dateModified: detail.lastVerifiedAt ?? detail.page.lastReviewedAt ?? null,
          }),
          breadcrumbJsonLd(breadcrumbs),
          faqJsonLd(faqs),
        ]}
      />
    </>
  );
}
