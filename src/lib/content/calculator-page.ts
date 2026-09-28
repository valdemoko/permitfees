/**
 * Editorial content for `/permit-fee-calculator/`.
 *
 * Written for this tool, in the site's own register: every claim is one the
 * calculator can actually honour, and every limitation is stated where a reader
 * will meet it. Nothing here is imported from a jurisdiction page, because a
 * calculator page that repeated a city's prose would compete with that city's
 * page rather than route to it.
 *
 * Kept as data rather than inline JSX so the FAQ structured data and the visible
 * section are guaranteed to render the same text — the JSON-LD rule for FAQs.
 */

import { ROUTES } from "@/lib/seo/urls";
import { site } from "@/lib/site";

export const CALCULATOR_PATH = "/permit-fee-calculator/";

export const CALCULATOR_H1 = "Building Permit Fee Calculator";

export const CALCULATOR_TITLE = "Building Permit Fee Calculator";

export const CALCULATOR_DESCRIPTION =
  "Estimate a building permit fee from a jurisdiction's published fee schedule. Select a city and permit type, enter your project details, and see the calculation, the rules used, and the official source.";

export const CALCULATOR_LEAD =
  "Select a jurisdiction and permit type, enter what your project involves, and get an estimated permit fee calculated from that jurisdiction's published fee schedule — with every component, the rules that produced it, and the official source to verify it against.";

/* -------------------------------------------------------------------------- */
/* SEO content                                                                */
/* -------------------------------------------------------------------------- */

export const CALCULATOR_SECTIONS: ReadonlyArray<{ heading: string; paragraphs: string[] }> = [
  {
    heading: "What is a building permit fee calculator?",
    paragraphs: [
      "A building permit fee calculator turns a jurisdiction's published fee schedule into an estimate for a specific project. Permit fees are not set by the market: a city or county adopts a schedule — a set of rates, brackets, minimums and conditions — and the permit office applies it to whatever your project involves. A calculator's job is to apply those same published rules to the numbers you supply, and to show the arithmetic.",
      "That is different from an average or a ballpark. Averages blend jurisdictions that price entirely differently, so an “average permit cost” for a $300,000 house can be wrong for every city it averages. An estimate calculated from one jurisdiction's own schedule is checkable: every component can be traced to a published rule, and the rule to a document.",
    ],
  },
  {
    heading: "How permit fee estimates are calculated",
    paragraphs: [
      "Published schedules use a small number of patterns, and this calculator models each one directly rather than approximating it:",
    ],
  },
  {
    heading: "What information do you need?",
    paragraphs: [
      "It depends on the jurisdiction, which is why the calculator asks different questions for different cities. The most common inputs are:",
    ],
  },
  {
    heading: "Why permit fees vary by jurisdiction",
    paragraphs: [
      "Each authority sets its own fees by ordinance or resolution, and there is no state or national standard. Two cities in the same state can price the same permit in opposite ways: one by project valuation at a rate per $1,000, another by square footage, a third as a flat fee per fixture. The same word — “building permit” — can describe a fee that differs by an order of magnitude across a metro area.",
      "Jurisdictions also change their schedules on their own calendars, often at the start of a fiscal year. This calculator always calculates with the rules in effect on today's date, and each estimate shows the date the underlying schedule was last verified.",
    ],
  },
  {
    heading: "What is included in the estimate?",
    paragraphs: [
      "An estimate includes the permit fee components published in the schedule this site has transcribed: the base permit fee, plan review where it is charged separately, technology or surcharge lines the schedule lists, and any state surcharge the jurisdiction adds. Each estimate names every component and every rule that was considered and did not apply.",
      "What is typically not included: impact fees (school, park, transportation), utility connection charges, permits from other departments, re-inspection fees, and any discretionary fee the schedule does not publish. On a new house these can exceed the permit fee itself. Each jurisdiction's permit page states its own exclusions specifically — follow the links under the result to see them.",
    ],
  },
  {
    heading: "How to verify the final permit fee",
    paragraphs: [
      "Every estimate links to the official document the rates came from: the fee schedule, municipal code section, or fee page published by the authority that issues the permit. To verify, compare the components shown in the calculation against that document, then contact the permit office with your project's specifics — valuation, square footage, scope of work — and ask them to quote the fee.",
      "The permit office's calculation is the one that applies. This site's estimate is arithmetic on a published schedule, not a quote; where a schedule is ambiguous, the ambiguity is documented on the jurisdiction's pages rather than resolved silently in the arithmetic.",
    ],
  },
];

/** The rule-pattern bullets under "How permit fee estimates are calculated". */
export const CALCULATOR_RULE_PATTERNS: ReadonlyArray<{ term: string; text: string }> = [
  {
    term: "Flat fee",
    text: "a fixed amount for the permit, whatever the project is worth.",
  },
  {
    term: "Percentage or per-$1,000 rate",
    text: "a rate applied to the project valuation, sometimes charged per whole $1,000 “or fraction thereof”, which rounds up.",
  },
  {
    term: "Marginal bands",
    text: "a base amount plus different rates for successive portions of the valuation, the way income tax works.",
  },
  {
    term: "Bracket table",
    text: "a fixed amount for any project whose valuation falls in a published range.",
  },
  {
    term: "Per unit",
    text: "a rate applied per countable thing — fixtures, outlets, circuits, dwelling units.",
  },
  {
    term: "Minimums and maximums",
    text: "floors and ceilings that override the calculated amount when it falls outside them, applied exactly as the schedule states.",
  },
];

/** The input bullets under "What information do you need?". */
export const CALCULATOR_INPUT_EXAMPLES: ReadonlyArray<{ term: string; text: string }> = [
  { term: "Project valuation", text: "the cost of construction; the most common basis by far." },
  { term: "Square footage", text: "some schedules price by area rather than value." },
  {
    term: "Unit counts",
    text: "fixtures, outlets, circuits, dwelling units — trade permits especially.",
  },
  {
    term: "Occupancy and work type",
    text: "residential or commercial, new construction or alteration, where the schedule distinguishes them.",
  },
];

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export type CalculatorFaq = { question: string; answer: string };

export const CALCULATOR_FAQS: CalculatorFaq[] = [
  {
    question: "How are building permit fees calculated?",
    answer:
      "A permit office applies its jurisdiction's published fee schedule to your project: a rate or bracket for the permit itself — often based on project valuation or square footage — plus separate components for plan review, technology fees, state surcharges and similar, each with its own conditions, minimums and maximums. This calculator applies those same published rules to the inputs you enter, and shows every component so the arithmetic can be followed.",
  },
  {
    question: "Are permit fee estimates exact?",
    answer:
      "No — and a calculator claiming exactness should not be trusted. The estimate reproduces the published schedule for the inputs you provide, but the final fee can depend on details a schedule does not capture: how the office computes valuation, additional review charges, fees from other departments. Use the estimate to budget, and confirm the final amount with the issuing authority.",
  },
  {
    question: "What information do I need to calculate a permit fee?",
    answer:
      "It depends on the jurisdiction. Most building permits are priced from project valuation (the cost of construction); some use square footage. Trade permits — electrical, plumbing, mechanical — are often priced per item: outlets, fixtures, circuits. The calculator asks only for the inputs the selected jurisdiction's rules actually use, and explains what each one means.",
  },
  {
    question: "Do all cities use the same permit fee schedule?",
    answer:
      "No. Every jurisdiction sets its own fees, and two cities in the same state can price the same permit in completely different ways — by valuation, by area, or as a flat fee per item. This is why the calculator first asks for the jurisdiction and only shows the permit types and inputs that jurisdiction's schedule supports.",
  },
  {
    question: "Can a permit fee include additional charges?",
    answer:
      "Yes, and they are usually itemised separately on the invoice: plan review, technology or automation fees, state surcharges, per-inspection charges. Where the jurisdiction's schedule publishes these as separate components, the estimate shows each one as its own line with its own calculation, rather than folding them into one number.",
  },
  {
    question: "How often do permit fees change?",
    answer:
      "There is no fixed cycle. Many jurisdictions adjust fees at the start of a fiscal year, others by periodic ordinance. Each estimate shows the date the underlying schedule was last verified against the official source, and the calculation always uses the rules in effect on the date you calculate.",
  },
  {
    question: "Where can I verify the final fee?",
    answer:
      "With the authority that issues the permit. Every estimate links to the official document the rates came from — the fee schedule, code section or fee page published by the city or county — and to that jurisdiction's permit pages, which list the department's contact details. The permit office's own calculation is the one that applies.",
  },
];

/**
 * The estimate-callout disclaimer, reusing the site-wide estimate disclaimer
 * (`site.disclaimers.estimate`) plus the calculator's own scope sentence — one
 * source of truth for the promise, one sentence about what this tool covers.
 */
export function calculatorEstimateDisclaimer(jurisdictionName: string): string {
  return `This estimate covers the published fee rules available for ${jurisdictionName}. Additional review, inspection, technology, impact or other fees may apply. ${site.disclaimers.estimate}`;
}

export const CALCULATOR_SOURCES_HEADING = "Official source";

export const CALCULATOR_METHODOLOGY_NOTE =
  "How the fee schedules are sourced, verified and calculated";

export function calculatorPath(): string {
  return CALCULATOR_PATH;
}

export { ROUTES };
