"use client";

import { useEffect } from "react";

import { Container, Section } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { ROUTES } from "@/lib/seo/urls";

/**
 * Route-level error boundary.
 *
 * The failure this page will actually see is a database one: these routes read
 * PostgreSQL on demand, and Neon can be unreachable. The reader is told what
 * happened in plain terms, offered a retry that does not lose their place, and
 * routed to the pages that do not depend on the failing request.
 *
 * `error.message` is deliberately not rendered. It is a database driver message,
 * and the last audit of this codebase established that those must not reach a
 * browser — they can carry connection detail.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only part safe to surface: Next generates it, and it
    // matches the server log line without exposing the underlying message.
    console.error("Route error", error.digest ?? "(no digest)");
  }, [error]);

  return (
    <Section padding="lead">
      <Container>
        <div style={{ maxWidth: "48rem" }}>
          <p className="eyebrow eyebrow--accent">Something went wrong</p>
          <h1 className="page-head__title" style={{ marginTop: "0.5rem" }}>
            We could not load these figures
          </h1>
          <p className="lede">
            This page is generated from our own database of verified fee schedules, and that request
            failed. Nothing has been guessed at to fill the gap — the numbers are missing because we
            could not read them.
          </p>

          <div className="page-head__actions">
            <Button type="button" variant="primary" onClick={() => reset()}>
              Try again
            </Button>
            <ButtonLink href={ROUTES.states}>Browse published states</ButtonLink>
            <ButtonLink href={ROUTES.methodology} variant="quiet">
              How the data is sourced
            </ButtonLink>
          </div>

          <div style={{ marginTop: "2.25rem" }}>
            <Callout variant="warning" label="If it keeps failing">
              <p style={{ margin: 0 }}>
                The most likely cause is a temporary database outage on our side, which resolves
                without any action from you. If it persists, tell us which page you were reading
                through the <a href={ROUTES.contact}>contact page</a> and we will look at it.
              </p>
            </Callout>
          </div>
        </div>
      </Container>
    </Section>
  );
}
