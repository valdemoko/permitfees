# New York City, New York — research record

**Research pass:** 13 (New York)
**Read on:** 2026-09-25
**Jurisdiction:** City of New York (the five counties of New York City; the payload is filed
against New York County, fips 36061, because City Hall sits in it)
**Pages published:** building, electrical, plumbing

## Sources actually read

| # | Source | URL | Type | Effective / dated |
| --- | --- | --- | --- | --- |
| 1 | Local Law 77 of 2023 (Council Int. 875-B), §14 reprint of Table 28-112.2 | `https://intro.nyc/local-laws/2023-77` | ordinance (City Clerk) | Passed 2023-05-11, returned unsigned 2023-06-13, "takes effect immediately" |
| 2 | Local Law 128 of 2024 (Council Int. 436-A), §§12–13 amending §28-112.2 and Table 28-112.2 | `https://www.nyc.gov/assets/buildings/local_laws/ll128of2024.pdf` (DOB's own copy; identical bytes at `https://intro.nyc/local-laws/2024-128`) | ordinance (NYC Council) | Passed 2024-11-21, returned unsigned 2024-12-23; §29: "takes effect 1 year after it becomes law and applies to work performed pursuant to applications for construction document approval filed on and after such effective date" |
| 3 | 1 RCNY §101-03, "Fees payable to the Department of Buildings" (11 pp.) | `https://www.nyc.gov/assets/buildings/rules/1_RCNY_101-03.pdf` | municipal_code (DOB rules) | Rule effective 2008-07-01; most recent amendment effective **2026-08-13** per the promulgation details (`…/1_RCNY_101-03_prom_details_date.pdf`) |
| 4 | DOB promulgation details for 1 RCNY §101-03 | `https://www.nyc.gov/assets/buildings/rules/1_RCNY_101-03_prom_details_date.pdf` | municipal_code | Amendment history and effective dates |
| 5 | DOB, "Obtaining a Permit" | `https://www.nyc.gov/site/buildings/industry/obtaining-a-permit.page` | municipal_website | Read 2026-09-25 |
| 6 | DOB, "Electrical Permit" | `https://www.nyc.gov/site/buildings/property-or-business-owner/electrical-permit.page` | municipal_website | Read 2026-09-25 |
| 7 | DOB NOW: Build — Payment FAQs | `https://www.nyc.gov/site/buildings/industry/payment-buildfaqs.page` | municipal_website | Read 2026-09-25 |
| 8 | DOB Service Notice, "Follow up #1: 2022 Construction Codes: Fee Changes in BIS and DOB NOW" | `https://www.nyc.gov/assets/buildings/pdf/changefees_bis_dobnow-sn.pdf` | municipal_website | 2023-08-31 |
| 9 | DOB, "2014 Construction Codes" (Plumbing Code contents: "Appendix A. Plumbing Permit Fee Schedule (RESERVED)") | `https://www.nyc.gov/site/buildings/codes/2014-construction-codes.page` | municipal_website | Read 2026-09-25 |

All nine returned HTTP 200 from this environment on 2026-09-25.

## Access notes (why the codifier was not used)

- The official codifier of the NYC Administrative Code, American Legal Publishing
  (`codelibrary.amlegal.com/codes/newyorkcity/…`), answers every request from this
  environment with **HTTP 403**, with or without browser headers. This is the same shape
  as Newark in New Jersey: the official text exists but the official *host* is unreadable.
- The local laws themselves are published as PDFs by the **Office of the City Clerk**
  (`intro.nyc`) and mirrored by DOB on `nyc.gov/assets/buildings/local_laws/` — both
  reachable, both primary (a local law as enacted is a higher instrument than the
  codifier's consolidation of it). Every figure on this site's NYC pages comes from those
  PDFs, read with `pdftotext -layout`.
- `nycadmincode.readthedocs.io` (an unofficial mirror of Article 112) is reachable but
  **stale**: it still prints the pre-2023 table ($0.12/sq ft for one- to three-family new
  buildings, $5.15 per $1,000 on alterations). It was used only to enumerate section
  numbers (§§28-112.1 through 28-112.8), never for a figure. The stale mirror is the
  reason this record states so precisely *which* local law each figure comes from.
- `codes.iccsafe.org` renders client-side; its HTML carries no text to read.

## What prices a permit in New York City

Three instruments, in this order:

1. **Table 28-112.2 of the Administrative Code** (Title 28, Chapter 1, Article 112) — the
   fee schedule for building work. Assembled state: the full table reprinted by **LL 77 of
   2023** (items 1–39), plus the "Permit for electrical work" row **added by LL 128 of
   2024** ("As provided by department rules"), plus §28-112.2's opening sentence and the
   new **§28-112.2.1** payment schedule from the same law.
2. **§28-112.2.1 / §28-112.2.2 (as added by LL 128/2024)** — *when* money is paid:
   non-electrical work that changes or creates a certificate of occupancy pays 50% of the
   total fee (but not less than $130) with the first submission and the balance before the
   permit issues; work that does not change the certificate pays **100% at filing, but not
   less than $130**; electrical work pays 50% (min $130) at filing and the balance before
   any Department inspection.
3. **1 RCNY §101-03** — the Department's own rule, which is where **electrical permit
   fees actually live** ("Fees for electrical work requiring a permit shall be in
   accordance with department rules", §28-112.2.2). The rule's electrical block prices
   initial applications, unit counts, service switches, entrance cables, panels, signs,
   elevators and boiler-control wiring.

The chain is confirmed by DOB's own words: the *Repeal of Rules Relating to the Electrical
Code* notice on `rules.cityofnewyork.us` (2025) states "The permit fees are currently
addressed in 1 RCNY § 101-03 and § 28-112.2 of the Administrative Code."

## The table, as read (LL 77/2023 + LL 128/2024)

Numbering below is the table's own item numbers.

**New buildings (floor-area priced, with a per-structure minimum):**

| Item | Applies to | Rate | Minimum |
| --- | --- | --- | --- |
| 1 | one-, two- or three-family, **no** existing building elements retained | $0.06 per sq ft of floor area | $130 per structure |
| 4 | all other new buildings, <7 stories and <100,000 sq ft, no elements retained | $0.26 per sq ft | $280 per structure |
| 6 | ≥7 stories or ≥100,000 sq ft, R-2, ≥50% affordable (165% AMI, city-financed), no elements retained | $0.26 per sq ft | $130 per structure |
| 8 | all other new buildings ≥7 stories or ≥100,000 sq ft, no elements retained | $0.45 per sq ft | $290 per structure |

**New buildings with existing building elements retained in place (§28-101.4.5)** — the
fee switches from floor area to *cost of alteration*:

| Item | Applies to | Formula |
| --- | --- | --- |
| 2 | one-, two- or three-family | min filing fee **$130** for the first $5,000 of cost, plus **$2.60** per $1,000 (or fraction) over $5,000 |
| 5 | other, <7 stories <100,000 sq ft | **$280** for the first $3,000, plus **$10.30** per $1,000 over $3,000 |
| 7 | R-2 affordable, ≥7 st/≥100k | **$280** first $3,000, plus **$10.30** per $1,000 over |
| 10 | all other ≥7 st/≥100k | **$290** first $3,000, plus **$17.75** per $1,000 over |

Item 3: accessory garage (≤3 cars) filed with a one- to three-family house — $130.
Item 9: subsequent applications filed before the first TCO — $130.

**Alterations** — a *type minimum* (Alteration Type 1/2/3 or Limited Alteration
Application) plus a per-thousand charge over a first tranche of cost:

| Item | Applies to | Type minimums | Then |
| --- | --- | --- | --- |
| 11 | one-, two- or three-family dwellings | ALT-1 **$170**; ALT-2 **$130**; ALT-3 **$130**; LAA **$130** | + $2.60 per $1,000 over the first $5,000 of cost |
| 12 | all other buildings <7 stories and <100,000 sq ft | ALT-1 **$280**; ALT-2 **$225**; ALT-3 **$195**; LAA **$195** | + $10.30 per $1,000 over the first $3,000 |
| 13 | ≥7 st/≥100k, R-2 affordable (≥50% at 165% AMI, city-financed) | ALT-1 **$280**; ALT-2 **$280**; ALT-3 **$195**; LAA **$195** | + $10.30 per $1,000 over the first $3,000 |
| 14 | all other ≥7 st/≥100k (incl. aerial towers, tanks, fire escapes…) | ALT-1 and subsequent/related filings **$290** | + $17.75 per $1,000 over the first $3,000 |
| 15 | all other ≥7 st/≥100k (same class) | ALT-2 **$225**; ALT-3 **$195**; LAA **$195** | + $10.30 per $1,000 over the first $3,000 |

**Renewal fee column:** $130 per work type for every new-building and alteration row.
**Item 16:** permit to install or alter service equipment *except plumbing and fire
suppression piping service equipment* — "Filing fee calculated as for respective building
alteration", renewal $130. **Item 17:** oil-burning/gas/electric heating equipment — $130
per type/device/equipment, renewal $130.
**Item 24 (amendments):** the greater of $130 or the recalculated fee.
The remaining items (18–23 earthwork/golf/demolition/curb cuts, 25–33 signs, 34–38
temporary structures and scaffolds, 39 reinstatement) are read but not modelled — see
"not modelled" below.

## Readings this dataset depends on

**(a) Which text is current.** Three candidate consolidations disagree. The readthedocs
mirror prints $0.12/sq ft and $5.15 per $1,000 — the pre-2023 table. The ICC library and
Google's index of the official codifier both print **$0.06 / $2.60 / $10.30 / $17.75**,
which is exactly LL 77/2023's own text. The local law PDF is the highest instrument and
the figures match the two independent current mirrors, so LL 77/2023's text is the
schedule this site computes.

**(b) The effective date of LL 128/2024.** §29: "takes effect 1 year after it becomes law
and applies to work performed pursuant to applications … filed on and after such
effective date." The City Clerk's certification records the law as passed 2024-11-21 and
returned unsigned 2024-12-23 — one year later is **2025-12-23**, which is in force on
this reading date. The law's payment percentages and its electrical row are therefore
modelled as current. (Third-party fee guides print slightly different December 2025 /
January 2026 dates for the same event; none of them is the law, and the arithmetic above
is taken from the law's own certification page.)

**(c) "Or fraction thereof" rounds the chargeable cost up.** Every per-thousand formula
in items 2, 5, 7, 10–15 prints "each $1,000, or fraction thereof" — the engine's
`incrementCents: 100_000` on those rules, asserted in the content test at a mid-band
valuation.

**(d) The $130 floors of §28-112.2.1 are *payment* floors, not fee floors.** They set the
minimum paid at each stage, not the computed fee (every type minimum in the table is
already ≥$130). The page says so in prose; no rule is added for them.

**(e) Electrical fees come from the rule, not the table.** LL 128's own table row says
"As provided by department rules", §28-112.2.2 says the same, and 1 RCNY §101-03
supplies the numbers: $40 initial application (excluding minor work); unit pricing
(each outlet, fixture, hp of motor or air-conditioner, kW of heater, kVA of transformer =
one unit; **1–10 units $0, over 10 units $0.25 each**, total additional fee capped at
$5,000); service switches $8 / $30 / $105 / $225 / $375 by amperage band (0–100, 101–200,
201–600, 601–1200, over 1200); entrance cables and feeders $15 / $30 / $45 / $75 by
conductor size (up to #2, over #2–#1/0, over #1/0–250 MCM, over 250 MCM); panels $15 /
$37.50 / $50 / $75 (1-phase ≤20-1 or 10-2 pole cutouts, 1-phase over, 3-phase ≤225 A,
3-phase over 225 A); signs manufactured $40 in-shop, $65 / $90 / $115 on-site by size;
elevators $125 (≤10 floors) + $83 per additional ten floors; boiler-control rewiring $12
and $15 (two adjacent amounts as printed). Minor electrical work under §27-3018(h) is
listed with no amount in §101-03 and is not charged here.

**(f) The unit count is one blended count.** §101-03's note computes "the total additional
fee … by calculating the sum of the units" — outlets, fixtures, motors, heaters, air
conditioners and transformers are summed into one count, and the first ten are free. The
engine needed a fact to hold that sum, so a new per-unit kind, `electrical_units`, was
added to the engine (additive, like `meters` and `low_voltage_points` before it) rather
than charging a transformer as an "outlet".

**(g) Plumbing permits are not separately priced — and the page says exactly that.**
§28-112.2 (as amended) requires a fee for permits for "plumbing … systems" "in accordance
with the fee schedule of Table 28-112.2", but the current table prints **no plumbing
row**: LL 77/2023's rewrite dropped the pre-2023 row ("Permit to install and/or alter
plumbing … in existing building: one-, two- or three-family dwelling"), and the only
surviving mention of plumbing is item 16's carve-out — service equipment "*except*
plumbing and fire suppression piping service equipment … calculated as for respective
building alteration". Three pieces of evidence line up behind the reading that a plumbing
permit is charged as the alteration application for the building:
1. the code's own direction that plumbing permits take their fee from the table;
2. item 16's carve-out, which points plumbing back at the alteration rows by exclusion;
3. DOB NOW's payment FAQ — "The filing fee populates on an **Alteration** when the
   Estimated Job Cost is provided" — and "fees according to the NYC Construction Codes …
   Please see Table 28-112.2".
The NYC Plumbing Code's own fee appendix is **"(RESERVED)"** (DOB's 2014 Construction
Codes contents page), i.e. the plumbing code deliberately carries no fee schedule of its
own. The plumbing page therefore publishes the alteration rows under a plumbing permit
type and states this reading in the prose rather than hiding it.

**(h) No separate plan-examination fee was found in the fee instruments read.** §101-03
prints "First plan examination review — Included in the filing fee" for the fee rows where
it charges one, and neither Article 112 nor LL 77/128 prints a construction plan-review
percentage. Nothing on this site charges one for NYC.

**(i) Renewals are $130 per work type** — the table's own renewal column, modelled as a
flat rule gated on a renewal fact.

**(j) No "technology fee" appears in any instrument read.** Third-party guides cite a
"$76 plus applicable technology fee" figure attributed to "item 16"; item 16 of the current
table is the service-equipment carve-out and prints no $76. The claim is not in LL 77,
LL 128, or §101-03, and this site charges nothing for it.

## Requirements read (for the requirement rows)

From DOB's own pages: construction documents are filed by a New York State licensed
Professional Engineer or Registered Architect (or a licensed contractor for minor work);
the Department plan examiner reviews for legal and zoning objections before approval;
"Minor Alterations Without Permits" — installing new kitchen cabinets needs no permit but
the contractor needs a DCA/WP Home Improvement Contractor license; electrical work must be
performed by electricians licensed by the Department (all ED16A filings in DOB NOW:
Build); electrical plan review runs through the DOB Electrical Plan Review team under
Rule 4000-01; consequences of working without a permit include violations, summonses and
fines for both owner and performer.

## Not modelled (named on the page, never papered over)

- **Demolition (item 21):** street frontage × stories × $2.60, min $260 — a product of
  two facts the engine does not multiply.
- **Signs (items 25–33), temporary structures and scaffolds (34–38), earthwork, golf
  driving range, curb cuts, asbestos, reinstatement (39):** read, not transcribed — the
  building page covers the new-building and alteration schedules and says the rest of the
  table is not charged here.
- **Table 28-112.8 special fees** (copies, certifications, boiler filings, elevator
  filings) and **§28-112.7.1 crane fees**: adjacent instruments, out of scope for these
  three pages.
- **§101-03's non-electrical fees** (records management fee $45/$165, energy-code review
  $220/$525/$875, variations $1,000, appeals $2,500, façade and parking-structure
  reports): named where the page could invite the question, not charged.
- **License fees** (electrician's license $310/$90/…, filing-representative registration):
  licensing, not permitting.

## Effective dates on record

| Instrument | Effective |
| --- | --- |
| Table 28-112.2 as printed by LL 77/2023 | 2023-06-13 ("immediately") |
| LL 128/2024 amendments (§28-112.2, §28-112.2.1, §28-112.2.2, electrical row) | one year after becoming law — **2025-12-23**, applications filed on and after |
| 1 RCNY §101-03 as downloaded | original 2008-07-01; latest amendment 2026-08-13 (sidewalk-shed fees; the electrical block is unchanged by it) |

## Open questions

1. The official codifier (amlegal) is unreadable from this environment; a reading taken
   against it directly would close the loop the local-law PDFs opened.
2. Table rows carry the sentence "The rates and fees set forth above shall be subject to
   increases as provided by department rules." No such increase appears in §101-03 as
   read; if DOB ever promulgates one, every floor-area and per-thousand figure here moves.
3. Items 14 and 15 share one permit-type description but price different alteration
   types at different rates ($17.75 for ALT-1 and subsequent filings, $10.30 for ALT-2,
   ALT-3 and LAA). The split is the table's own; each type's pairing was read with a
   table-preserving extraction of the enacted PDF (`pdftotext -table`), because a plain
   extraction interleaves the two columns and mispairs them.
4. §101-03 prints two adjacent amounts for boiler-control rewiring ($12.00 / $15) whose
   line assignment the text extraction cannot separate with certainty; the row is not
   charged.
