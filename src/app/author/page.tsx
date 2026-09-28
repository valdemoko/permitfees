import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

const PAGE_PATH = ROUTES.author;
const PAGE_TITLE = composeTitle("About the author");
const PAGE_DESCRIPTION =
  "Who writes and maintains PermitFees, and the editorial standard behind every page.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
});

/**
 * The author page is the only place on the site that names the person behind the
 * project. Everywhere else the site speaks as the brand: the footer, the header
 * and the copyright carry `site.name`, and links here use the generic label
 * "About the author" so personal details stay in one place that is kept, not
 * scattered.
 *
 * It records only what is real: the name, the public profile link, and what the
 * work here actually is. No photograph, address, phone number, employer or
 * credential is stated, because none has been supplied for publication.
 */
export default function AuthorPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="About the author"
            title="Who is behind PermitFees"
            lead={PAGE_DESCRIPTION}
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>The author</h2>
            <p>
              PermitFees is written and maintained by{" "}
              <strong>Miguel Iglesias Valenzuela</strong>, an independent operator. You can find his
              public professional profile on{" "}
              <a
                href="https://www.linkedin.com/in/miguel-iglesias-valenzuela-14069b367/"
                target="_blank"
                rel="nofollow noopener"
              >
                LinkedIn
              </a>
              .
            </p>
            <p>
              He is not affiliated with, endorsed by, or employed by any city, county, state or
              federal agency. The site is an independent project that organises information published
              by official sources, and it says so wherever a fee is shown: it is an independent
              reference, not an official service of any government body.
            </p>

            <h2>What the work here is</h2>
            <p>
              Every page starts from an official document: a fee schedule, an ordinance, or a permit
              department&rsquo;s own instructions. What that document says is recorded as structured
              rules, the calculation is shown step by step, and each page carries the source it came
              from and the date it was last checked. The{" "}
              <Link href={ROUTES.methodology}>methodology</Link> describes the whole process,
              including what an estimate leaves out.
            </p>

            <h2>The standard</h2>
            <p>
              A figure is published only with a primary source and a verification date. Schedules are
              re-checked at least quarterly and around fiscal-year starts. Fee amounts can change —
              sometimes mid-year — so anything that matters for a real application should be confirmed
              with the permit office that charges the fee, whose own calculation is the one that
              applies. What the record does not show is left out rather than filled in.
            </p>

            <h2>Corrections</h2>
            <p>
              If a figure here no longer matches the document it cites, that is worth knowing about.{" "}
              <Link href={ROUTES.contact}>Get in touch</Link> with the page and, if possible, the
              document you are looking at; corrections are recorded against the source so the history
              shows what changed and when.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="note" label="Independence">
              <p style={{ margin: 0 }}>{site.disclaimers.notOfficial}</p>
            </Callout>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: PAGE_DESCRIPTION,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
