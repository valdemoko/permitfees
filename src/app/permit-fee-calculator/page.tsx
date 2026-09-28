import type { Metadata } from "next";
import Link from "next/link";

import { PermitFeeCalculator } from "@/components/calculator/permit-fee-calculator";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { EditorialText } from "@/components/ui/editorial-text";
import {
  CALCULATOR_DESCRIPTION,
  CALCULATOR_FAQS,
  CALCULATOR_H1,
  CALCULATOR_INPUT_EXAMPLES,
  CALCULATOR_LEAD,
  CALCULATOR_METHODOLOGY_NOTE,
  CALCULATOR_PATH,
  CALCULATOR_RULE_PATTERNS,
  CALCULATOR_SECTIONS,
  CALCULATOR_TITLE,
} from "@/lib/content/calculator-page";
import { listCalculatorJurisdictions } from "@/lib/db/queries";
import { breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";

import { fetchCalculatorRules } from "./actions";

/**
 * The permit fee calculator — the site's one interactive tool.
 *
 * Architecture follows the site's own rules:
 *
 * - **Server component for everything static.** Metadata, JSON-LD, breadcrumbs,
 *   the editorial sections, the FAQ and the jurisdiction catalogue render on the
 *   server; the client bundle is the calculator component alone.
 * - **The catalogue is slim.** Only slugs and names cross the network; the fee
 *   rules for a selection are fetched per selection by the server action, so no
 *   rule JSON for the other jurisdictions reaches the browser.
 * - **The engine is shared, not duplicated.** The calculator calls the same
 *   `calculatePermitFees` the published permit pages call, on the same rule
 *   records read from PostgreSQL, so an estimate here can never disagree with a
 *   worked example there.
 * - **Canonical is self-referencing and stable.** Prefill arrives by query
 *   parameters, which never become separate URLs: the canonical tag points at
 *   the bare path regardless.
 *
 * `revalidate` matches the other data-backed routes: the catalogue is curated
 * data, cached for an hour and revalidated on demand after data edits.
 */

export const revalidate = 3_600;

const PAGE_TITLE = composeTitle(CALCULATOR_TITLE);

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: CALCULATOR_DESCRIPTION,
  path: CALCULATOR_PATH,
});

const breadcrumbs = [
  { name: "Home", path: ROUTES.home },
  { name: CALCULATOR_H1, path: CALCULATOR_PATH },
];

/**
 * Prefill arrives only through the client component, which reads the query
 * string after mount from `window.location`. The page itself never reads
 * `searchParams`, and the client component does not use `useSearchParams`:
 * the first keeps the route static under the site's ISR policy, and the second
 * keeps the calculator shell in the prerendered HTML rather than behind a
 * Suspense fallback.
 */
export default async function PermitFeeCalculatorPage() {
  // One query, slim rows. A database outage propagates to `error.tsx` exactly as
  // on every other data-backed route: a controlled 500 with a retry, never a
  // fake-empty calculator.
  const jurisdictions = await listCalculatorJurisdictions();

  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            breadcrumbs={breadcrumbs}
            eyebrow="Free tool"
            title={CALCULATOR_H1}
            lead={CALCULATOR_LEAD}
            aside={
              <div className="facts">
                <div className="facts__item">
                  <p className="facts__label">How it works</p>
                  <p className="facts__value" style={{ fontSize: "0.9375rem" }}>
                    Estimated from the jurisdiction&rsquo;s published fee schedule — every component
                    shown, source linked.
                  </p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Coverage</p>
                  <p className="facts__value tnum">
                    {jurisdictions.length} jurisdiction{jurisdictions.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="facts__item">
                  <p className="facts__label">Limits</p>
                  <p className="facts__value" style={{ fontSize: "0.9375rem" }}>
                    An estimate, not a quote. Verify the final amount with the issuing authority.
                  </p>
                </div>
              </div>
            }
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container width="wide">
          <PermitFeeCalculator jurisdictions={jurisdictions} fetchRules={fetchCalculatorRules} />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="prose-editorial">
            {CALCULATOR_SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                {section.heading === "How permit fee estimates are calculated" ? (
                  <ul>
                    {CALCULATOR_RULE_PATTERNS.map((pattern) => (
                      <li key={pattern.term}>
                        <strong>{pattern.term}</strong> — {pattern.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.heading === "What information do you need?" ? (
                  <ul>
                    {CALCULATOR_INPUT_EXAMPLES.map((example) => (
                      <li key={example.term}>
                        <strong>{example.term}</strong> — {example.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <h2>Why this calculator is different</h2>
            <p>
              Most permit fee tools online show one number with no working. This one is built on the
              same engine that produces every worked example on this site: the jurisdiction&rsquo;s
              own published rules, applied exactly as written — including &ldquo;per $1,000 or
              fraction thereof&rdquo; rounding, minimums, maximums and conditional components — with
              every step of the arithmetic visible and every rule that did not apply listed with its
              reason.
            </p>
            <p>
              The rates come from primary sources: the fee schedules, codes and ordinances published
              by the issuing authority, each with a verification date. Where a jurisdiction&rsquo;s
              schedule is ambiguous, the pages document the ambiguity rather than pick a reading
              quietly. And where we have no verified data, the calculator says so instead of
              estimating — a missing answer is more useful than a plausible wrong one.
            </p>
            <p>
              Read the {CALCULATOR_METHODOLOGY_NOTE.toLowerCase()} on the{" "}
              <Link href={ROUTES.methodology}>methodology page</Link>.
            </p>
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="section-head">
            <h2>Common questions</h2>
          </div>
          <div style={{ maxWidth: "72ch", display: "grid", gap: "0.5rem" }}>
            {CALCULATOR_FAQS.map((faq) => (
              <details className="disclosure" key={faq.question}>
                <summary>{faq.question}</summary>
                <div className="disclosure__body">
                  <EditorialText text={faq.answer} className="editorial--compact" />
                </div>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Callout variant="info" label="Where to go next">
            <p style={{ margin: 0 }}>
              Every estimate links to the jurisdiction&rsquo;s own pages here — the fee structure,
              what is excluded, the issuing department&rsquo;s contact details and the official
              documents. Start from the <Link href={ROUTES.states}>state directory</Link>, or read{" "}
              <Link href={ROUTES.methodology}>how the numbers are produced</Link>.
            </p>
          </Callout>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: CALCULATOR_TITLE,
            description: CALCULATOR_DESCRIPTION,
            path: CALCULATOR_PATH,
          }),
          breadcrumbJsonLd(breadcrumbs),
          faqJsonLd(CALCULATOR_FAQS),
        ]}
      />
    </>
  );
}
