import type { NextConfig } from "next";

/**
 * Architectural decisions encoded here (see /ARCHITECTURE.md and /SEO.md):
 *
 * - `trailingSlash: true` gives every canonical URL exactly one form
 *   ("/texas/houston/"). Next.js then 308-redirects the non-slash variant,
 *   so we never serve the same content on two URLs by accident.
 * - `poweredByHeader: false` removes a free fingerprinting header.
 * - `reactStrictMode` stays on so double-render bugs surface in development.
 * - No CSP yet on purpose: Next.js needs a nonce strategy to avoid
 *   `unsafe-inline`, and shipping a broken CSP is worse than shipping none.
 *   Tracked in ROADMAP.md as a Phase 2 item.
 * - `/index/` has no route of its own; the dynamic state segment would otherwise
 *   capture it and render the homepage content at a second URL. A 308 to `/`
 *   keeps one URL for the homepage from the first crawl.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  async redirects() {
    return [{ source: "/index", destination: "/", permanent: true }];
  },
  // Surfaces accidental client bundles from server-only modules during build.
  serverExternalPackages: ["@neondatabase/serverless"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
