import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/data/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { UsStatesMap } from "@/components/map/us-states-map";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/container";
import { US_STATE_SHAPES } from "@/content/geo/us-states";
import { listStateDirectory } from "@/lib/db/queries";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata, composeTitle } from "@/lib/seo/metadata";
import { ROUTES, jurisdictionPath, statePath } from "@/lib/seo/urls";

/**
 * The state directory.
 *
 * Laid out as a directory rather than a landing page: the map answers "where can
 * I go" in one glance, and the two lists below answer "what exactly is there".
 *
 * The lists are split on purpose. A published state gets a row with its cities and
 * their permit-page counts, because that is the thing the reader came for. The
 * states we have not published are an index of names — not forty-nine table rows
 * whose only value is "—", which is how a directory ends up looking empty when it
 * is merely young. Neither list hides anything: every state appears exactly once.
 *
 * Only states with at least one published jurisdiction count as published, so
 * every link leads somewhere real. When there is nothing at all — as in a fresh
 * deployment — the page says so and is excluded from search rather than
 * presenting an empty table as content.
 *
 * Rendered on demand and cached with ISR: the dataset lives in a database that may
 * not be reachable at build time.
 */

export const revalidate = 3_600;

const PAGE_PATH = ROUTES.states;

async function loadDirectory() {
  const directory = await listStateDirectory();
  const cityCount = directory.reduce((total, entry) => total + entry.jurisdictions.length, 0);
  const permitPageCount = directory.reduce(
    (total, entry) =>
      total + entry.jurisdictions.reduce((sum, item) => sum + item.permitPageCount, 0),
    0,
  );

  return { directory, cityCount, permitPageCount };
}

export async function generateMetadata(): Promise<Metadata> {
  const { directory, cityCount } = await loadDirectory();

  return buildMetadata({
    title: composeTitle("Building permit costs by state"),
    description:
      directory.length === 0
        ? "Permit fee data is being added one city at a time. No states are published yet."
        : `Permit fees calculated from official fee schedules for ${cityCount} cities across ${directory.length} states. Each entry links to the schedule it came from.`,
    path: PAGE_PATH,
    // An empty directory is not content yet, so it does not go into the index.
    noindex: directory.length === 0,
  });
}

export default async function StatesPage() {
  const { directory, cityCount, permitPageCount } = await loadDirectory();

  const publishedCodes = new Set(directory.map((entry) => entry.stateCode));
  const pendingStates = US_STATE_SHAPES.filter((state) => !publishedCodes.has(state.code));

  const breadcrumbs = [
    { name: "Home", path: ROUTES.home },
    { name: "States", path: PAGE_PATH },
  ];

  const title = "Permit costs by state";

  return (
    <>
      <Section padding="lead">
        <Container width="wide">
          <PageHeader
            breadcrumbs={breadcrumbs}
            eyebrow="Directory"
            title={title}
            lead={
              directory.length === 0
                ? "Nothing is published yet. A city only appears here once its fee schedule has been read and verified against the official document."
                : `Every state, with the cities whose permit fees we have calculated from an official schedule. A state is only coloured on the map when there is something verified behind it.`
            }
            aside={
              directory.length > 0 ? (
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

      {directory.length === 0 ? (
        <Section tone="surface" ruled>
          <Container>
            <EmptyState
              title="No states are published yet"
              action={{ label: "Read the methodology", href: ROUTES.methodology }}
            >
              <p style={{ margin: 0 }}>
                This site only lists a city once its fee schedule is verified, so the directory starts
                empty and grows deliberately. The methodology explains what has to be in place before a
                city is added.
              </p>
            </EmptyState>
          </Container>
        </Section>
      ) : (
        <>
          <Section tone="surface" ruled padding="tight">
            <Container width="wide">
              <UsStatesMap directory={directory} />
            </Container>
          </Section>

          <Section ruled>
            <Container width="wide">
              <div className="section-head">
                <p className="eyebrow">Published</p>
                <h2>Where the fees are calculated</h2>
              </div>

              <ul className="dataset">
                {directory.map((entry) => (
                  <li key={entry.stateId}>
                    <div className="dataset__row" style={{ alignItems: "flex-start" }}>
                      <div style={{ display: "grid", gap: "0.5rem", minWidth: "12rem" }}>
                        <Link
                          href={statePath(entry.stateSlug)}
                          className="dataset__primary link-quiet"
                        >
                          {entry.stateName}
                        </Link>
                        <span className="dataset__meta">
                          <Badge tone="verified" dot>
                            Available
                          </Badge>
                        </span>
                      </div>

                      <div style={{ display: "grid", gap: "0.375rem", flex: "1 1 18rem" }}>
                        {entry.jurisdictions.map((city) => (
                          <Link
                            key={city.id}
                            href={jurisdictionPath(entry.stateSlug, city.slug)}
                            className="link-arrow"
                            style={{ fontSize: "0.9375rem" }}
                          >
                            {city.name}
                            <span className="dataset__meta" style={{ marginLeft: "0.375rem" }}>
                              {city.permitPageCount}{" "}
                              {city.permitPageCount === 1 ? "permit page" : "permit pages"}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Container>
          </Section>

          {/* Only rendered when there really is something pending: with every
              state published, "0 states are not covered yet" is a heading that
              says nothing and contradicts the directory above it. */}
          {pendingStates.length > 0 ? (
          <Section tone="subtle" ruled padding="tight">
            <Container width="wide">
              <div className="section-head">
                <p className="eyebrow">Not yet published</p>
                <h2 style={{ fontSize: "1.125rem" }}>
                  {pendingStates.length}{" "}
                  {pendingStates.length === 1 ? "state is" : "states are"} not covered yet
                </h2>
                <p className="muted" style={{ fontSize: "0.9375rem", maxWidth: "70ch" }}>
                  A state only moves up when one of its cities has a published fee schedule we have
                  read and verified. Nothing is generated from an average, and nothing is listed
                  before it exists.
                </p>
              </div>

              <ul className="index-list">
                {pendingStates.map((state) => (
                  <li key={state.code}>{state.name}</li>
                ))}
              </ul>
            </Container>
          </Section>
          ) : null}
        </>
      )}

      <JsonLdBlocks
        blocks={[
          webPageJsonLd({
            title: composeTitle(title),
            description: `Permit fees calculated from official fee schedules for ${cityCount} cities.`,
            path: PAGE_PATH,
          }),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
    </>
  );
}
