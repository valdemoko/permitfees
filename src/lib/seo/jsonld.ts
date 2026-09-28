import type { FaqEntry } from "@/lib/content/types";
import { stripMarkdownEmphasis } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

import { absoluteUrl } from "./urls";

/**
 * Structured data.
 *
 * Only markup that reflects content visible on the page. Deliberately omitted:
 * `Product`, `Offer`, `AggregateRating` and `SoftwareApplication`. There is no
 * product, no price and no rating here — inventing them would be inaccurate
 * markup, which is exactly what earns manual actions. For a site asking people to
 * trust numbers about money, that trade is never worth it.
 *
 * See SEO.md section 6.
 */

export type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    description: site.descriptions.about,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: site.locale,
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Root-relative path, or `ROUTES.home` for the first item. */
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type WebPageJsonLdInput = {
  title: string;
  description: string;
  path: string;
  /** From verification or review records. Never the build date. */
  dateModified?: string | null;
  datePublished?: string | null;
};

export function webPageJsonLd(input: WebPageJsonLdInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: site.locale,
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

/**
 * FAQ markup, or `null` when there are no FAQs.
 *
 * Returning `null` rather than an empty list is deliberate: an empty `FAQPage`
 * is worse than none, because it declares structure the page does not have.
 */
export function faqJsonLd(faqs: FaqEntry[]): JsonLdObject | null {
  const usable = faqs
    // FAQ answers are stored as editorial prose and may carry Markdown emphasis;
    // structured data is plain text, so the markers must not reach the markup.
    .map((faq) => ({ question: stripMarkdownEmphasis(faq.question), answer: stripMarkdownEmphasis(faq.answer) }))
    .filter((faq) => faq.question.trim() && faq.answer.trim());
  if (usable.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: usable.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Serialize for embedding in a `<script type="application/ld+json">`.
 *
 * `<` is escaped so that a value containing `</script>` cannot terminate the tag,
 * and the two JavaScript line separators are escaped because they are legal in
 * JSON but break inline scripts in some parsers.
 */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
