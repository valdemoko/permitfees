import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

const PAGE_PATH = ROUTES.contact;
const PAGE_TITLE = composeTitle("Contact and data corrections");

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: site.descriptions.contact,
  path: PAGE_PATH,
});

/**
 * The contact page is part of the data-integrity process, not just a legal
 * requirement: it is the route by which a reader can tell us a fee schedule
 * changed. It therefore explains exactly what makes a correction actionable.
 *
 * The address comes from `NEXT_PUBLIC_CONTACT_EMAIL`, set once per deployment so
 * there is a single place to change it. It is not hardcoded here: the same inbox
 * is the site's only contact channel, and duplicating it across templates is how
 * an old address outlives its replacement.
 */
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";

export default function ContactPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="Contact"
            title="Report an error or suggest a jurisdiction"
            lead="Corrections from people who are actually looking at the documents are how this dataset stays accurate. They are also the fastest way to get a city added."
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>Where to write</h2>
            <p>
              Email{" "}
              <a href={`mailto:${CONTACT_EMAIL}?subject=Data%20correction`}>{CONTACT_EMAIL}</a>.
              Please put the city or permit type in the subject line.
            </p>

            <h2>What makes a correction actionable</h2>
            <p>
              We can act fastest when a message includes:
            </p>
            <ul>
              <li>The page you are looking at.</li>
              <li>The figure or statement you believe is wrong, and what it should be.</li>
              <li>
                The document you are reading it from — a fee schedule, a code section, or a written
                answer from the permit office. A link is ideal.
              </li>
              <li>Its effective date, if it has one.</li>
            </ul>
            <p>
              With those four things we can usually verify and correct within a few days. Without the
              document we will re-check the source we had, which may reach the same answer we
              originally published.
            </p>

            <h2>Suggesting a city</h2>
            <p>
              Cities get added based on demand and on whether a fee schedule is actually published. A
              suggestion is genuinely helpful when it names the permit department and, if you know it,
              where the fee schedule lives. A jurisdiction with no public schedule is still worth
              telling us about: &ldquo;no published fee schedule&rdquo; is a legitimate page, and a
              useful answer.
            </p>

            <h2>What we cannot help with</h2>
            <p>
              We cannot review your drawings, tell you whether your project needs a permit, estimate
              your construction cost, recommend a contractor, or interpret how a code applies to your
              property. Those questions belong with the permit office or a licensed professional — and
              they will give you a more reliable answer than we can.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="note" label="Your details">
              <p style={{ margin: 0 }}>
                We keep correspondence only as long as it takes to resolve the issue, and we do not
                add you to anything. See <a href={ROUTES.privacy}>privacy</a> for the detail.
              </p>
            </Callout>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: site.descriptions.contact,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
