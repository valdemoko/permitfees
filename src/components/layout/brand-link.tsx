"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isCurrentPath } from "@/lib/nav";
import { ROUTES } from "@/lib/seo/urls";

/**
 * The brand, as a link home.
 *
 * Client-side for one reason, and it is the reason `SiteNav` is client-side too:
 * the router only resets the scroll position when it actually navigates. Clicking
 * the brand while already on the home page — or the nav item for the page you are
 * reading — is a no-op as far as the router is concerned, so nothing scrolls and
 * the click looks broken.
 *
 * With `scroll-behavior: smooth` removed there is no animation to be interrupted
 * on a real navigation, so this only has to cover the same-URL case: stop the
 * navigation that will not happen, and put the reader back at the top.
 *
 * The alternative was a client effect watching `usePathname` and forcing the scroll
 * position on every route change. That would also break the browser's own
 * back/forward restoration, which this does not touch.
 */
export function BrandLink({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Link
      href={ROUTES.home}
      className="brand"
      onClick={(event) => {
        if (!isCurrentPath(pathname, ROUTES.home)) return;
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }}
    >
      {children}
    </Link>
  );
}
