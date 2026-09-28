"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";

import { PRIMARY_NAV, SECONDARY_NAV, isCurrentPath } from "@/lib/nav";

/**
 * Site navigation.
 *
 * A client component for three reasons, all of them user-visible rather than
 * decorative:
 *
 *   1. **Which section am I in.** A top-level nav that never says where you are is
 *      a nav the reader has to re-derive on every page. `usePathname` is the only
 *      way to know, and it costs a fraction of a kilobyte.
 *   2. **Closing the mobile panel.** The panel is a native `<details>`, which is
 *      right — it needs no JavaScript to open. But a client-side navigation does
 *      not reset DOM state, so the panel would stay open over the page you just
 *      asked for. The pathname effect closes it.
 *   3. **The item for the page you are already reading.** A `Link` to the current
 *      URL does not navigate, so the router never resets the scroll position and the
 *      click does nothing at all. See `onNavClick` below.
 *
 * Everything else about the header is server-rendered.
 */

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  /**
   * The nav item for the page you are on is a link to where you already are, so the
   * router does nothing — no navigation, and therefore no scroll reset. Clicking it
   * is a gesture that means "take me to the top of this", so it does that instead of
   * leaving the reader wondering whether the click registered.
   */
  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isCurrentPath(pathname, href)) return;
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    menu.open = false;
  }, [pathname]);

  return (
    <>
      <nav aria-label="Primary" className="hidden sm:block">
        <ul className="nav">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav__link"
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => onNavClick(event, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <details className="menu sm:hidden" ref={menuRef}>
        <summary aria-label="Open navigation menu">
          <span className="menu__glyph" aria-hidden="true">
            <span />
            <span />
          </span>
          Menu
        </summary>
        <nav aria-label="Primary" className="menu__panel">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="menu__link"
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  onClick={(event) => onNavClick(event, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu__sep" aria-hidden="true" />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SECONDARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="menu__link"
                  onClick={(event) => onNavClick(event, item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>
    </>
  );
}
