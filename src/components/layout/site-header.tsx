import { BrandMark } from "@/components/brand/mark";
import { BrandLink } from "@/components/layout/brand-link";
import { SiteNav } from "@/components/layout/site-nav";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";

/**
 * Site header.
 *
 * Three things and no more: the mark, the name, and three destinations. The
 * header is the one surface every page shares, so anything added here is paid for
 * on all of them.
 *
 * Two small client components live here and nowhere else in the layout: the nav,
 * which carries the current-section marker and closes the mobile panel after a
 * navigation, and the brand link, which handles the one click a router cannot — the
 * brand while you are already on the home page, where there is no navigation to
 * reset the scroll position. Both exist to make the header behave the way a reader
 * assumes it does. See each file for why the trade is worth it.
 */

export function SiteHeader() {
  return (
    <header className="header">
      <Container width="wide">
        <div className="header__inner">
          <BrandLink>
            <BrandMark />
            <span className="brand__name">{site.name}</span>
          </BrandLink>

          <SiteNav />
        </div>
      </Container>
    </header>
  );
}
