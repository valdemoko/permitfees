import type { Metadata } from "next";
import Link from "next/link";

import { HeroPlate } from "@/components/brand/hero-plate";
import { PageHeader } from "@/components/layout/page-header";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Container, Section } from "@/components/ui/container";
import { listStateDirectory } from "@/lib/db/queries";
import { webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

/**
 * Home.
 *
 * Not a landing page. It is the front matter of a reference work: what this is,
 * the sequence a fee page goes through before it is published, what the coverage
 * actually is today (read from the database, so it cannot overstate itself), and
 * the rule that governs what we are willing to publish.
 *
 * The process ledger is the argument of the page. It shows the reader the shape of
 * the product — states, a state, a city, a permit, a calculation — as a path they
 * can follow, instead of three identical feature cards saying the same thing three
 * ways.
 *
 * No figures are printed on this page. We publish no number we cannot source, and
 * the home page has no schedule behind it; the coverage counts are rows, not fees.
 *
 * Rendered on demand and cached with ISR: the dataset lives in a database that may
 * not be reachable at build time.
 */

export const revalidate = 3_600;

const PAGE_PATH = ROUTES.home;
const PAGE_TITLE = composeTitle("Construction permit costs from official fee schedules", {
  withSiteName: false,
});

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: site.descriptions.home,
  path: PAGE_PATH,
});

/** The sequence from document to published page. The path is the URL it produces. */
const PROCESS = [
  {
    title: "Find the authority",
    path: "/texas/",
    body: "Usually the city, but sometimes the county — a Houston address outside the city limits is not Houston’s permit to issue. The page names the authority that applies.",
  },
  {
    title: "Read the schedule",
    path: "/texas/houston/",
    body: "Each line of the fee schedule becomes a separate rule with its own conditions: residential or commercial, valuation thresholds, per-unit charges, minimums and caps.",
  },
  {
    title: "Calculate in the open",
    path: "/texas/houston/building-permit-cost/",
    body: "Every component, its formula, and the intermediate values, so the arithmetic can be followed by hand. Nothing is rounded into a headline number.",
  },
  {
    title: "Record the check",
    path: "/texas/houston/",
    body: "Every claim carries a source document and a verification date. When a schedule changes the old rule is closed and a new one added; the history is not overwritten.",
  },
];

/** Descriptions only — no figures, because we publish no figure we cannot source. */
const COVERED_PERMITS = [
  {
    name: "Building permits",
    detail:
      "The structural permit that covers the work itself. Almost always the largest single fee, and the one most often quoted as a percentage of project valuation.",
  },
  {
    name: "Electrical, plumbing and mechanical permits",
    detail:
      "Trade permits, sometimes priced separately and sometimes folded into the building permit. Which of the two applies is a local fact, not a general one.",
  },
  {
    name: "Plan review fees",
    detail:
      "Charged for reviewing the drawings, usually calculated on top of the permit fee and often as a percentage of it or of the project valuation.",
  },
  {
    name: "Add-on and per-unit fees",
    detail:
      "Technology and automation charges, per-dwelling-unit fees, state surcharges and inspection fees that appear as separate lines on the actual invoice.",
  },
];

export default async function HomePage() {
  const directory = await listStateDirectory();
  const cityCount = directory.reduce((total, entry) => total + entry.jurisdictions.length, 0);
  const permitPageCount = directory.reduce(
    (total, entry) =>
      total + entry.jurisdictions.reduce((sum, item) => sum + item.permitPageCount, 0),
    0,
  );
  const hasCoverage = directory.length > 0;

  return (
    <>
      <div className="hero">
        <HeroPlate />
        <Section padding="lead">
          <Container>
            <PageHeader
              title="What a permit costs, from the city’s own fee schedule"
              lead="PermitFees turns published municipal and county fee schedules into a clear cost estimate — with the formula, the official source, and the date we last checked it. No guessing, and no averaging two cities together."
              actions={
                <>
                  <ButtonLink href={ROUTES.calculator} variant="primary">
                    Estimate a permit fee
                  </ButtonLink>
                  <ButtonLink href={ROUTES.states}>Find your state</ButtonLink>
                  <ButtonLink href={ROUTES.methodology}>How the numbers are produced</ButtonLink>
                </>
              }
              aside={
                hasCoverage ? (
                  <ul className="facts">
                    <li className="facts__item">
                      <span className="facts__label">States published</span>
                      <span className="facts__value tnum">{directory.length}</span>
                    </li>
                    <li className="facts__item">
                      <span className="facts__label">Cities covered</span>
                      <span className="facts__value tnum">{cityCount}</span>
                    </li>
                    <li className="facts__item">
                      <span className="facts__label">Permit fee pages</span>
                      <span className="facts__value tnum">{permitPageCount}</span>
                    </li>
                  </ul>
                ) : undefined
              }
            />
          </Container>
        </Section>
      </div>

      <Section ruled>
        <Container width="wide">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From a published schedule to a number you can check</h2>
            <p className="muted">
              Four steps, in this order, for every jurisdiction. A city only appears on this site when
              all four are done.
            </p>
          </div>

          <ol className="steps">
            {PROCESS.map((step, index) => (
              <li className="step" key={step.title}>
                <span className="step__index tnum">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="step__title">{step.title}</h3>
                  <span className="step__path">{step.path}</span>
                </div>
                <p className="step__body" style={{ margin: 0 }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="surface" ruled>
        <Container width="wide">
          <div className="spread">
            <div className="spread__rail">
              <p className="eyebrow">Sourcing</p>
              <h2>Every figure starts with an official document</h2>
            </div>
            <div className="spread__body">
              <p>
                A permit fee is not a market price. It is set by an ordinance, printed in a fee
                schedule, and applied by a specific department. So we treat it that way: we find the
                document the jurisdiction publishes, record what it says, and link to it.
              </p>
              <p>
                That is also why we refuse to estimate a jurisdiction that publishes nothing.
                &ldquo;We cannot find a published fee schedule for this city&rdquo; is a useful
                answer. A plausible number with no source behind it is not, especially when someone
                is deciding whether they can afford to build.
              </p>
              <Callout variant="estimate" label="The rule we hold ourselves to">
                <p style={{ margin: 0 }}>
                  If we cannot cite the document a number came from, we do not publish the number.
                  Where a jurisdiction publishes no schedule, the page says so and points you at the
                  department instead.
                </p>
              </Callout>
            </div>
          </div>
        </Container>
      </Section>

      <Section ruled>
        <Container width="wide">
          <div className="spread">
            <div className="spread__rail">
              <p className="eyebrow">Limits</p>
              <h2>What an estimate is not</h2>
            </div>
            <div className="spread__body">
              <p>
                Our calculation is arithmetic applied to a published schedule. It is not a quote, and
                it is not the permit office&rsquo;s number. Real invoices differ for reasons we can
                name: a jurisdiction may compute valuation differently from your contractor, add
                school or utility impact fees we do not model, charge for revisions, or apply a
                policy that is not written in the schedule. Every estimate says what it left out.
              </p>
              <p>
                Where a schedule contradicts itself, both readings are kept and the disagreement is
                published rather than resolved in our favour. Where a rule is still being
                checked, it is marked as such on the page instead of being presented as settled.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section ruled>
        <Container width="wide">
          <div className="section-head">
            <p className="eyebrow">Coverage</p>
            <h2>What we cover</h2>
            <p className="muted">
              The same four questions come up in every city. They are priced differently everywhere,
              which is the entire reason this site exists.
            </p>
          </div>

          <dl className="grid-cards" style={{ margin: 0 }}>
            {COVERED_PERMITS.map((item) => (
              <div key={item.name}>
                <dt className="dataset__primary">{item.name}</dt>
                <dd
                  style={{
                    margin: "0.4375rem 0 0",
                    color: "var(--color-ink-600)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="subtle" ruled padding="tight">
        <Container>
          <div className="cluster-between">
            <div style={{ maxWidth: "54ch" }}>
              <h2 style={{ fontSize: "1.125rem" }}>
                The directory is being built one city at a time
              </h2>
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "var(--color-ink-600)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                }}
              >
                A city only appears once its fee schedule has been read and verified against the
                official document. States without published cities are not listed at all, so nothing
                here leads to an empty page.
              </p>
            </div>
            <ButtonLink href={ROUTES.states}>See what is published</ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="surface" ruled>
        <Container>
          <div className="prose-editorial">
            <h2>Where to start</h2>
            <p>
              To put your own project's numbers in, use the{" "}
              <Link href={ROUTES.calculator}>permit fee calculator</Link> — it applies the same
              published schedules with your valuation, area or counts, and shows every step. If you
              already know your city, the <Link href={ROUTES.states}>state directory</Link> is the
              fastest route. If you want to know how a number was produced before you trust it —
              which is the right instinct — read the{" "}
              <Link href={ROUTES.methodology}>methodology</Link>. If a figure looks wrong,{" "}
              <Link href={ROUTES.contact}>tell us</Link> and we will re-check the source.
            </p>
          </div>
        </Container>
      </Section>

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: PAGE_TITLE,
            description: site.descriptions.home,
            path: PAGE_PATH,
          }),
        ]}
      />
    </>
  );
}
