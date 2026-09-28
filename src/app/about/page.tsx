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

const PAGE_PATH = ROUTES.about;
const PAGE_TITLE = composeTitle("About this site");
const PAGE_DESCRIPTION =
  "What PermitFees is, what it is not, and the editorial standards it holds itself to.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
});

export default function AboutPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader eyebrow="About" title="What this site is" lead={PAGE_DESCRIPTION} />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>The problem</h2>
            <p>
              Ask what a building permit costs and the honest answer is &ldquo;it depends on your
              city, what you are building, and what it is worth&rdquo;. The city knows. The city
              publishes a fee schedule. What almost never exists is an explanation that connects the
              two — what the number will be for a specific project, why it is that number, and where
              it came from.
            </p>
            <p>
              Most of what ranks for that question is a range someone guessed, repeated across
              hundreds of pages with the city name swapped. That is not useful when you are deciding
              whether a project is viable, and it is not honest about how much the answer varies.
            </p>

            <h2>What we do instead</h2>
            <p>
              We read the official document, record what it says as structured rules, and calculate
              from those rules. Every result shows its arithmetic, every claim links to its source,
              and every page carries the date we last checked it. Where a jurisdiction publishes
              nothing, we say that rather than filling the gap with an approximation.
            </p>
            <p>
              The <Link href={ROUTES.methodology}>methodology</Link> sets out the whole process,
              including what our estimates leave out.
            </p>

            <h2>What this site is not</h2>
            <ul>
              <li>
                <strong>Not an official government service.</strong> We are an independent
                reference. No city, county or state agency operates, endorses or reviews this site.
              </li>
              <li>
                <strong>Not a quote.</strong> A calculated estimate is arithmetic applied to a
                published schedule. The permit office&rsquo;s own calculation is the one that
                applies, and it wins every disagreement.
              </li>
              <li>
                <strong>Not legal, engineering or design advice.</strong> We can tell you what a fee
                schedule says. We cannot tell you whether your project complies, or what to submit.
              </li>
              <li>
                <strong>Not a lead-generation service.</strong> We do not sell your enquiry to
                contractors, and we do not take payment to rank a jurisdiction favourably.
              </li>
            </ul>

            <h2>How the content is produced</h2>
            <p>
              Pages are written and reviewed by a person against the record for that jurisdiction.
              Fee rules are entered as data, validated, and tested against the official document
              before a page is published. A page is only opened to search engines once it has the
              source, the verification date and something genuinely specific to say; until then it
              does not exist.
            </p>
            <p>
              Calculations are deterministic. The same inputs and the same recorded rule set always
              produce the same result, and that result is reproducible by hand from the working shown
              on the page. There is no model, no prediction and no inference anywhere in the path
              from document to number.
            </p>

            <h2>Who maintains this site</h2>
            <p>
              PermitFees is maintained by an independent operator, publishing from the project&rsquo;s own research record
              rather than on behalf of any agency or firm. Every page names what was read, when it
              was read, and which office publishes it, so you can check any figure against the
              authority that charges it — you never have to take ours on faith. More about the person
              behind the project on the <Link href={ROUTES.author}>About the author</Link> page.
            </p>
            <p>
              The maintenance standard is the one the <Link href={ROUTES.methodology}>methodology</Link>{" "}
              describes: a figure is published only with a primary source and a verification date;
              schedules are re-checked at least quarterly and around fiscal-year starts; and anything
              the record does not show is left out rather than filled in. This site does not claim
              engineering, legal or code-official credentials, and nothing here substitutes for the
              permit office&rsquo;s own calculation.
            </p>

            <h2>Corrections</h2>
            <p>
              Fee schedules change, sometimes mid-year and sometimes without a notice we would catch
              immediately. If you find a figure that no longer matches the document it cites — or a
              rule we have read wrongly — please{" "}
              <Link href={ROUTES.contact}>tell us</Link>. Say which page and, if you have it, which
              document you are looking at. Corrections are recorded against the source so the
              history shows what changed and when.
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
