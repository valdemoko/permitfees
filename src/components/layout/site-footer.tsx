import Link from "next/link";

import { BrandMark } from "@/components/brand/mark";
import { Container } from "@/components/ui/container";
import { FOOTER_SECTIONS } from "@/lib/nav";
import { site } from "@/lib/site";
import { ROUTES } from "@/lib/seo/urls";

/**
 * Site footer.
 *
 * The disclaimer is not decorative. This site publishes numbers about fees levied
 * by public bodies, so it must be unmistakable that it is an independent reference
 * and not an official service. That is a trust requirement, a trademark-risk
 * mitigation and an AdSense-review concern all at once, which is why it lives on
 * every page rather than only on the About page.
 *
 * The footer is the only place with a full site index, and it is deliberately
 * small: three short lists. A footer with a hundred links is an SEO gesture, not
 * navigation.
 *
 * The brand block is a link home, like the one in the header — a footer wordmark
 * that does not navigate is a dead end on a page that might be the reader's
 * landing page. It is also wider than the link columns, because it carries the
 * description and the disclaimer needs a readable measure.
 *
 * The copyright year is rendered, not hard-coded, and the pages that carry this
 * footer revalidate hourly, so it does not drift.
 */

const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="footer">
      <Container width="wide">
        <div className="footer__inner">
          <div className="footer__cols">
            <div>
              <Link href={ROUTES.home} className="footer__brand">
                <BrandMark size={20} />
                <span className="brand__name" style={{ fontSize: "1.0625rem" }}>
                  {site.name}
                </span>
              </Link>
              <p className="footer__tagline">
                Permit costs calculated from official fee schedules, with the source and the date we
                checked it.
              </p>
            </div>

            {FOOTER_SECTIONS.map((section) => (
              <nav key={section.heading} aria-label={section.heading}>
                <h2 className="footer__heading">{section.heading}</h2>
                <ul className="footer__list">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="footer__link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="footer__legal">
            {/*
              All three disclaimers, in order of legal weight, read from `site.ts`
              rather than re-typed here: a disclaimer that exists in two versions is
              a disclaimer that will disagree with itself.
            */}
            <p className="footer__disclaimer">{site.disclaimers.notOfficial}</p>
            <p className="footer__disclaimer">{site.disclaimers.estimate}</p>
            <p className="footer__disclaimer">{site.disclaimers.notLegalAdvice}</p>
            <p className="footer__disclaimer">
              &copy; {CURRENT_YEAR} {site.name}. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
