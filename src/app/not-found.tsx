import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { buildMetadata } from "@/lib/seo/metadata";
import { ROUTES } from "@/lib/seo/urls";

/**
 * 404.
 *
 * This is a real page with real navigation rather than a dead end. On a directory
 * site, a 404 is most often a mistyped city or a jurisdiction we have not
 * published yet, so the useful response is to route the reader somewhere that
 * exists.
 */

export const metadata: Metadata = buildMetadata({
  title: "Page not found | Permit Fee",
  description: "That page does not exist. Browse the states we cover instead.",
  path: "/404/",
  noindex: true,
});

export default function NotFound() {
  return (
    <Section>
      <Container>
        <PageHeader
          eyebrow="404"
          title="We don’t have that page"
          lead="Either the address is wrong, or it is a jurisdiction we have not published yet. We only create a page when we have the official fee schedule behind it, so gaps are normal while the dataset grows."
          actions={
            <>
              <ButtonLink href={ROUTES.states} variant="primary">
                Browse states we cover
              </ButtonLink>
              <ButtonLink href={ROUTES.methodology}>How we source the data</ButtonLink>
            </>
          }
        />

        <div className="prose-editorial" style={{ marginTop: "2.5rem" }}>
          <h2>If you expected something here</h2>
          <p>
            It is probably one of two things: the jurisdiction exists but does not publish a fee
            schedule we can cite, or we have not researched it yet. Both are worth telling us
            about — see <a href={ROUTES.contact}>contact</a>.
          </p>
        </div>
      </Container>
    </Section>
  );
}
