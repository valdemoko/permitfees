import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

const PAGE_PATH = ROUTES.terms;
const PAGE_TITLE = composeTitle("Terms of use");

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: site.descriptions.terms,
  path: PAGE_PATH,
});

/**
 * IMPORTANT — these terms describe an independent reference site honestly: it
 * publishes estimates, not official figures, and it disclaims the decisions a
 * reader might make from them. The operator should have them reviewed for the
 * jurisdictions they serve before launch, in particular the governing-law clause,
 * which is deliberately left generic here rather than invented.
 */
export default function TermsPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="Terms"
            title="Terms of use"
            lead="The short version: use the site freely, understand that the numbers are estimates rather than official figures, and do not rely on them as the sole basis for a decision about money."
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>What you are agreeing to</h2>
            <p>
              By using this site you accept these terms. If you do not, the remedy is simply not to use
              it. We may update these terms; the version published here is the one that applies.
            </p>

            <h2>Estimates, not official figures</h2>
            <p>
              Every calculated amount on this site is an estimate produced by applying published fee
              schedules to the information you or we supplied. It is not a quotation, an invoice, a
              permit, or a decision by any government body.
            </p>
            <p>
              Permit fees are set by ordinance and applied by the issuing department. That department
              is the only authority on what your permit costs. Where our estimate and their figure
              differ, theirs applies. Before committing money to a project, confirm the fee with the
              permit office.
            </p>

            <h2>No warranty of accuracy</h2>
            <p>
              We work hard on this — sources are cited, rules are tested, and pages carry the date we
              last checked them — but we provide the site &ldquo;as is&rdquo;, without warranties of
              any kind. Fee schedules change, sometimes without notice, and our review of a document
              can be wrong. We do not warrant that any figure is current, complete or applicable to
              your project.
            </p>

            <h2>Not professional advice</h2>
            <p>
              {site.disclaimers.notLegalAdvice} Nothing here is a substitute for advice from a licensed
              architect, engineer, contractor, attorney or the permit office itself.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, we are not liable for any loss arising from
              reliance on this site, including costs incurred, projects delayed, or decisions made on
              the basis of an estimate. You use the information at your own risk, and you are
              responsible for verifying anything that matters.
            </p>

            <h2>Independence</h2>
            <p>
              This site is an independent reference. {site.disclaimers.notOfficial} We are not
              affiliated with any permit department, and we do not act on behalf of one.
            </p>

            <h2>Using our content</h2>
            <p>
              You may read, quote and link to this site freely. You may not republish substantial parts
              of it as your own, resell it, or use automated means to extract the dataset. Government
              fee schedules themselves are public documents; our record of them, the calculations, and
              the written explanations are not.
            </p>

            <h2>Outbound links</h2>
            <p>
              We link to official documents and department websites so you can verify what we publish.
              We do not control those sites and are not responsible for their content or availability.
            </p>

            <h2>Reporting a problem</h2>
            <p>
              If something here is wrong, telling us is the fastest way to fix it. See{" "}
              <a href={ROUTES.contact}>contact</a>.
            </p>

            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of the operator&rsquo;s jurisdiction of residence,
              without regard to conflict-of-law rules. Nothing in these terms limits any right you have
              under mandatory consumer law where you live.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="warning" label="Before you rely on a number">
              <p style={{ margin: 0 }}>{site.disclaimers.estimate}</p>
            </Callout>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: site.descriptions.terms,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
