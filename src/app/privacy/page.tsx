import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

const PAGE_PATH = ROUTES.privacy;
const PAGE_TITLE = composeTitle("Privacy");

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: site.descriptions.privacy,
  path: PAGE_PATH,
});

/**
 * IMPORTANT — this page describes the site as it actually behaves today: no
 * accounts, no cookies set by us, no analytics, no advertising. That accuracy is
 * the point. When advertising or analytics are added (see ROADMAP.md), this page
 * must be updated in the same change, along with a consent mechanism, or it
 * becomes misleading.
 *
 * The operator should still have this reviewed against the jurisdictions they
 * actually serve before launch.
 */
export default function PrivacyPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="Privacy"
            title="What this site collects"
            lead="Short version: almost nothing, because the site has no accounts, no advertising and no analytics. Here is the detail, including what changes when that does."
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>Information you give us</h2>
            <p>
              The only way to send us information is to email us. If you do, we hold your message and
              address for as long as it takes to deal with the issue, and no longer. We do not add
              you to a mailing list, and we do not share your message with anyone else except where
              we need to ask the relevant permit office about a correction you reported.
            </p>

            <h2>Information collected automatically</h2>
            <p>
              We do not run analytics, we do not set tracking cookies, and we do not build a profile of
              you. The site is served as static pages and by our hosting provider, which — like any web
              host — keeps standard server logs including IP address, request time and user agent for
              security and operational purposes. Those logs are the host&rsquo;s, are short-lived, and
              we do not use them to identify individuals.
            </p>

            <h2>Cookies</h2>
            <p>
              This site sets no cookies of its own. A cookie banner would therefore be theatre at this
              point, and we would rather not pretend otherwise. If that changes, the banner will appear
              with the change and this page will be updated at the same time.
            </p>

            <h2>Advertising, and what will change</h2>
            <p>
              This site may carry advertising in future, which is how an independent reference like
              this one pays to keep researching fee schedules. Advertising is not implemented today. If
              it is added:
            </p>
            <ul>
              <li>
                Ad providers — likely Google AdSense — will set cookies and may use identifiers to
                select and measure ads.
              </li>
              <li>
                You will be asked for consent before those cookies are set, where the law requires it,
                and you will be able to refuse without losing access to the content.
              </li>
              <li>
                Ads will not be placed inside a calculation, above the answer, or in a position that
                makes an advertisement look like our content.
              </li>
              <li>This page will be updated before any of that goes live.</li>
            </ul>

            <h2>Third-party links</h2>
            <p>
              Pages link to official government documents. Those are other people&rsquo;s sites with
              their own privacy practices, which we do not control and cannot describe here.
            </p>

            <h2>Your rights</h2>
            <p>
              Depending on where you live, you may have the right to ask what personal information an
              organisation holds about you, to have it corrected, or to have it deleted. In practice
              the answer here will almost always be &ldquo;none, unless you emailed us&rdquo; — and if
              we do hold your email, you can ask us to delete it and we will.
            </p>

            <h2>Security</h2>
            <p>
              Data is transmitted over HTTPS. Our database is hosted with a managed provider and is not
              reachable from the public internet. Access to the internal tools used to edit fee data is
              restricted to the people maintaining the site. We do not store payment details, because we
              do not take payments or handle any.
            </p>

            <h2>Changes</h2>
            <p>
              If this policy changes materially, the change will be described here rather than made
              quietly. Questions about any of the above can go to the address on the{" "}
              <a href={ROUTES.contact}>contact page</a>.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="note" label="Plain-language summary">
              <p style={{ margin: 0 }}>
                No accounts, no tracking cookies, no analytics, no advertising today. Standard web
                server logs at our host. Email us and we hold your address only long enough to answer.
              </p>
            </Callout>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: site.descriptions.privacy,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
