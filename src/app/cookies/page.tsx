import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

const PAGE_PATH = ROUTES.cookies;
const PAGE_TITLE = composeTitle("Cookie policy");

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: site.descriptions.cookies,
  path: PAGE_PATH,
});

/**
 * IMPORTANT — this page describes the site as it actually behaves today: it sets
 * no cookies of its own, and no analytics or advertising scripts run on it. That
 * accuracy is the point, exactly as on the privacy page. When advertising or
 * analytics are added (see ROADMAP.md), this page must be updated in the same
 * change, together with a consent mechanism, or it becomes misleading.
 */
export default function CookiesPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="Cookies"
            title="Cookie policy"
            lead="The honest version: this site sets no cookies today. Here is what that means, what a cookie is, and what will change if the site ever needs one."
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>What a cookie is</h2>
            <p>
              A cookie is a small piece of data a website asks your browser to store and send back on
              later requests. Cookies are how sites remember a login, remember a preference, measure
              how many people visited a page, or select advertising. They fall into categories by
              purpose: strictly necessary (the site cannot work without them), preferences (remembering
              your choices), analytics (measuring usage), and advertising (selecting and measuring ads).
            </p>

            <h2>Cookies this site uses</h2>
            <p>None. The table below is the whole inventory:</p>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Used?</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Strictly necessary</td>
                  <td>No</td>
                  <td>
                    No session is created: every page is served the same way to every visitor, so
                    there is nothing to remember between requests.
                  </td>
                </tr>
                <tr>
                  <td>Preferences</td>
                  <td>No</td>
                  <td>No settings are stored in your browser.</td>
                </tr>
                <tr>
                  <td>Analytics</td>
                  <td>No</td>
                  <td>No analytics script runs, and no usage profile is built.</td>
                </tr>
                <tr>
                  <td>Advertising</td>
                  <td>No</td>
                  <td>No advertising is served today.</td>
                </tr>
              </tbody>
            </table>
            <p>
              The site also sets no cookies through other browser storage: there is no use of local
              storage or session storage in the code. Nothing to consent to is why there is no consent
              banner here — a banner with nothing behind it would be theatre, and we would rather not
              pretend otherwise.
            </p>

            <h2>Cookies on the sites we link to</h2>
            <p>
              Pages link to official government documents — fee schedules, ordinances and permit
              portals on city, county and state domains. Those are other people&rsquo;s sites with
              their own cookies and their own cookie policies, which we do not control and cannot
              describe here. Our links open those sites; cookies there are set by them, under their
              policy.
            </p>

            <h2>Managing cookies in your browser</h2>
            <p>
              Because this site sets none, blocking or deleting cookies will not affect it — the pages
              will look and work exactly the same. For other sites, every mainstream browser lets you
              view, block and delete cookies in its privacy or site-data settings, and most let you
              block cookies from third parties while allowing those from the site you are on. If you
              clear cookies generally, nothing about this site is stored, lost or reset by doing so.
            </p>

            <h2>If that changes</h2>
            <p>
              If this site ever adds advertising (Google AdSense is the likely provider, as stated in
              our privacy policy) or analytics, that service will set cookies, a consent mechanism
              will appear before they do where the law requires it, and this page will be updated in
              the same change. You will be able to refuse those cookies without losing access to the
              content.
            </p>

            <h2>Changes</h2>
            <p>
              If this policy changes materially, the change will be described here rather than made
              quietly. Questions about any of the above can go to the address on the{" "}
              <a href={ROUTES.contact}>contact page</a>. For what we collect beyond cookies, see the{" "}
              <a href={ROUTES.privacy}>privacy policy</a>; for the terms of use, see{" "}
              <a href={ROUTES.terms}>terms</a>.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="note" label="Plain-language summary">
              <p style={{ margin: 0 }}>
                This site sets no cookies, uses no analytics and runs no advertising — so there is
                nothing here to consent to and nothing for a banner to do. If that changes, this page
                and the consent mechanism change together.
              </p>
            </Callout>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: site.descriptions.cookies,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
