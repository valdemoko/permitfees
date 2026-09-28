import type { Metadata, Viewport } from "next";
import { Archivo, Besley, IBM_Plex_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ConsentScripts } from "@/components/seo/consent-scripts";
import { JsonLdBlocks } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { composeTitle } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

import "./globals.css";

/**
 * Root layout.
 *
 * Fonts are self-hosted by `next/font`, which inlines the `@font-face` rules and
 * emits preloaded font files. No render-blocking request to a font CDN, and no
 * layout shift from a late-swapping webfont.
 *
 * Three faces, three jobs:
 *
 *   - **Besley** (display). A Clarendon slab, the vernacular of nineteenth-century
 *     technical, legal and municipal publishing — which is exactly the register
 *     this product speaks in. A high-contrast serif would read as fashion; a
 *     grotesque would read as a startup; a slab reads as a printed schedule.
 *   - **Archivo** (body and UI). A workhorse grotesque with a tall x-height and a
 *     tight and tidy texture at small sizes. Legible in dense tables without
 *     being Inter, Roboto or Open Sans.
 *   - **IBM Plex Mono** (figures). Fee amounts, formulas and code sections. Fixed
 *     advance width is the reason: digits must line up between rows.
 *
 * Note what this file deliberately does NOT set: no canonical URL, no Open Graph
 * URL, no per-page description. Metadata that is page-specific is only set by the
 * page, so a forgotten field cannot silently inherit a wrong value — an inherited
 * canonical pointing at the home page is a genuinely damaging SEO bug.
 */

const besley = Besley({
  subsets: ["latin"],
  variable: "--font-besley",
  display: "swap",
  weight: ["500", "600"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: composeTitle("Construction permit costs from official fee schedules", {
      withSiteName: false,
    }),
    // "%s" is a deliberate no-op template. Pages build their own complete titles
    // through `composeTitle`, and a real template here would double-suffix them.
    template: "%s",
  },
  description: site.descriptions.home,
  applicationName: site.name,
  // Site-wide indexability switch. Pages override this with their own gate result;
  // this is the floor, so nothing is ever indexable by accident on a preview or
  // staging deployment.
  robots: site.isIndexable
    ? { index: true, follow: true }
    : { index: false, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={site.locale}
      className={`${besley.variable} ${archivo.variable} ${plexMono.variable}`}
    >
      <body>
        {/* Google consent integration: Consent Mode v2 default denied + the
            official Google CMP (Privacy & Messaging) + AdSense loader.
            All env-gated; nothing loads without configuration. */}
        <ConsentScripts />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <SiteHeader />
          <main id="main" style={{ flex: 1 }}>
            {children}
          </main>
          <SiteFooter />
        </div>
        <JsonLdBlocks blocks={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
