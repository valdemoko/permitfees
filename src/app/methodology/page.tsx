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

const PAGE_PATH = ROUTES.methodology;
const PAGE_TITLE = composeTitle("Methodology: how we source and calculate permit fees");
const PAGE_DESCRIPTION =
  "Where permit fee data comes from, the standard a source has to meet, how the calculation works, and what our estimates deliberately leave out.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
});

/**
 * This page carries the site's trust argument, so it is deliberately concrete:
 * named source types, named failure modes, named limits. It is revised whenever
 * the method changes rather than on a calendar, which is why it carries no
 * decorative "last updated" stamp that would only track the build date.
 */
export default function MethodologyPage() {
  return (
    <>
      <Section padding="tight">
        <Container>
          <PageHeader
            eyebrow="Methodology"
            title="How we source, check and calculate permit fees"
            lead={PAGE_DESCRIPTION}
          />
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <div className="prose-editorial">
            <h2>What counts as a source</h2>
            <p>
              A published fact has exactly one primary source, and it has to be the authority that
              sets the fee. In practice that means one of these:
            </p>
            <ul>
              <li>The permit department&rsquo;s own fee schedule, whether a web page or a PDF.</li>
              <li>
                The municipal or county code, including the ordinance that adopts it — often more
                authoritative than a summary page, and usually where the details live.
              </li>
              <li>A state agency schedule, where the state sets the fee or a surcharge.</li>
              <li>
                The jurisdiction&rsquo;s own permit portal or calculator, when it itemises fees for a
                real application.
              </li>
            </ul>
            <p>
              Third-party fee tables, contractor blogs and aggregator sites are not sources. We may
              use them to work out which cities are worth researching, but a number never reaches a
              page because another website said so.
            </p>

            <h2>Verification, and why every page carries a date</h2>
            <p>
              Each figure records who checked it, how, and when. &ldquo;How&rdquo; matters: reading the
              published PDF is a different quality of evidence from a phone call, and both are
              recorded as what they are. When a schedule and a staff answer disagree, both are kept
              and the disagreement is shown rather than quietly resolved in our favour.
            </p>
            <p>
              Schedules are re-checked at least quarterly, and always around the start of a fiscal
              year, because that is when many jurisdictions reset their fees. When a page passes its
              review window it says so instead of pretending the number is current. When a schedule
              is replaced, the old rule is closed and a new one added — we never overwrite a fee and
              lose the record of what it used to be.
            </p>

            <h2>How a fee is actually calculated</h2>
            <p>
              Published schedules use a small number of patterns, and we model those patterns
              directly rather than importing anyone else&rsquo;s estimate. Every component of a fee
              is one of these:
            </p>
            <ul>
              <li>
                <strong>Flat</strong> — a fixed amount, for example a $150 base permit fee.
              </li>
              <li>
                <strong>Percentage</strong> — a rate applied to project valuation or floor area.
              </li>
              <li>
                <strong>Marginal bands</strong> — a base amount plus different rates for different
                portions, the way income tax works.
              </li>
              <li>
                <strong>Bracket table</strong> — a fixed amount for any project falling in a
                valuation range.
              </li>
              <li>
                <strong>Per unit</strong> — a rate applied to dwelling units, fixtures, circuits or
                similar countable things.
              </li>
            </ul>
            <p>
              A real permit fee is a set of these added together: the base permit fee, plus plan
              review, plus a technology charge, plus any state surcharge. Each one keeps its own
              conditions — residential or commercial, above or below a valuation threshold, new
              construction or alteration — and its own minimum or maximum.
            </p>
            <p>
              That is why every result shows its working. If a component does not apply to your
              project, you see it listed as excluded with the reason, rather than absent and
              unexplained. The same engine powers the{" "}
              <Link href={ROUTES.calculator}>permit fee calculator</Link>, where you can enter your
              own project's numbers and watch the schedule produce an estimate from them.
            </p>

            <h2>Money and rounding</h2>
            <p>
              Amounts are calculated in whole cents using integer arithmetic, not floating point, and
              rounded once at the end of each component. Rates are stored exactly, as hundredths of a
              percent. Where a schedule says &ldquo;per $1,000 or fraction thereof&rdquo;, that
              rounding is applied as written, because it changes the answer.
            </p>
            <p>
              The consequence is that our result should reconcile to the cent with the schedule for
              the inputs we were given. If it does not, that is a bug and we want to hear about it.
              Adjacent brackets are tested on both sides of every boundary for exactly this reason.
            </p>

            <h2>What we do not include</h2>
            <p>
              These come up often enough to name explicitly. Unless a page says otherwise, our
              estimate excludes:
            </p>
            <ul>
              <li>School, park and transportation impact fees levied per new dwelling.</li>
              <li>Utility and water connections, and sewer capacity charges.</li>
              <li>Fire, health or environmental permits issued by a different department.</li>
              <li>
                Fees that apply after review starts: revisions, re-inspections, extensions and
                expirations.
              </li>
              <li>Expedited or priority review surcharges.</li>
              <li>
                Professional costs — architects, engineers, and the time spent getting a plan through
                review.
              </li>
            </ul>
            <p>
              These are not small. In some jurisdictions the impact fees on a new house exceed the
              permit fee several times over. Omitting them from the arithmetic is correct; omitting
              them from the page would not be, which is why every estimate lists what is missing.
            </p>

            <h2>What we deliberately do not do</h2>
            <ul>
              <li>
                <strong>No estimates without a source.</strong> If a jurisdiction publishes nothing,
                the page says that.
              </li>
              <li>
                <strong>No borrowing rules between cities.</strong> Two Texas cities can price the
                same permit in completely different ways.
              </li>
              <li>
                <strong>No machine-generated numbers.</strong> Every calculation is a rule we read in
                a document and recorded. Nothing is inferred, approximated or extrapolated, because a
                permit fee is a deterministic published figure and treating it as a prediction would
                be a different and much worse product.
              </li>
              <li>
                <strong>No pages without something to say.</strong> A city page exists when we have
                the schedule and something true to say about it.
              </li>
            </ul>

            <h2>Keeping this honest</h2>
            <p>
              Nothing here is a substitute for the permit office&rsquo;s own answer. Our estimate is
              arithmetic on a schedule; the invoice is the authority. Every page links to the
              document we used so you can check us, and every page tells you when we last did.
            </p>
            <p>
              If you find a figure that has changed, or one that does not match what the department
              told you, <Link href={ROUTES.contact}>send us the correction</Link> with the document
              you are looking at. Corrections are recorded against the source, not edited in silently.
            </p>
          </div>

          <div style={{ marginTop: "2rem", maxWidth: "68ch" }}>
            <Callout variant="warning" label="Not legal advice">
              <p style={{ margin: 0 }}>
                {site.disclaimers.notLegalAdvice} Permit requirements depend on your specific project,
                site and local amendments to the code. For anything that matters, speak to the permit
                office directly.
              </p>
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
