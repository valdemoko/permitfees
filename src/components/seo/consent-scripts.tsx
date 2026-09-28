/**
 * Google consent integration — the single consent system for the site.
 *
 * Implementation note (why raw <script> and not next/script):
 * Google's documented Consent Mode integration is a plain inline snippet in
 * the page, followed by the CMP tag. Raw scripts avoid next/script's
 * `beforeInteractive` in App Router server components (an ESLint-flagged
 * anti-pattern) while keeping the ordering guarantee: the inline
 * consent-default executes synchronously during HTML parsing, before any
 * external async script (CMP, AdSense) can run.
 *
 *  1. Consent Mode v2 with all four signals DEFAULT DENIED is emitted inline
 *     before any Google script runs, so no Google service can set cookies
 *     while consent is outstanding.
 *  2. Google Privacy & Messaging (the CMP generated from
 *     AdSense → Privacy & messaging → European regulations) shows the official
 *     message and updates the consent signals per the user's real decision.
 *     This site does not duplicate that logic and does not render its own
 *     banner.
 *  3. The AdSense library loads (async) only when a publisher ID and the CMP
 *     URL are configured; the CMP blocks serving until consent exists in
 *     regulated regions.
 *
 * Configure NEXT_PUBLIC_GOOGLE_CMP_SRC with the exact script URL Google
 * generates (do not build it by hand). Empty = no CMP and no ad serving.
 */

const CONSENT_MODE_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
`;

const GOOGLE_CMP_SRC = process.env.NEXT_PUBLIC_GOOGLE_CMP_SRC?.trim() ?? "";
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() ?? "";

export function ConsentScripts() {
  const cmpConfigured = GOOGLE_CMP_SRC.length > 0;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: CONSENT_MODE_DEFAULT }} />
      {cmpConfigured && <script async src={GOOGLE_CMP_SRC} />}
      {cmpConfigured && ADSENSE_CLIENT && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
