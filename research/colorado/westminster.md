# Westminster, Colorado — research record

**Status: published.** Three permit pages: building, electrical, plumbing.
Colorado is published with two jurisdictions, Denver and Westminster.

- **Verification date:** 2026-09-24
- **Issuing authority:** City of Westminster, Building Division
- **Effective date:** the schedule's own words, "Effective January 1, 2026"

| Document | sha256 (first 16) | Where |
| --- | --- | --- |
| Building Division Fee Schedule (one page) | `8d77172fe6affc1d` | `https://www.westminsterco.gov/DocumentCenter/View/6284/Fee-Schedule-V3-2026` |
| Fees (the City's own fees page) | — (HTML) | `https://www.westminsterco.gov/979/Fees` |

Both were read on 2026-09-24 and are recorded as `sources` in the seed payload. The
schedule is primary; the fees page is corroboration for the two percentage rows and for
the dating of the use tax change.

## 1. What the mechanism is

**One valuation table, two percentage rows, two flat lists.** The schedule's opening
sentence states the shape of the whole thing: *"Building permit fees are valuation based
and shall include the permit and plan review fees, use tax and trade fees (as
applicable)."* Four lines make up one permit:

| Row | What it is | Charged on |
| --- | --- | --- |
| Valuation table, 8 bands | the permit fee | the total valuation |
| Plan review | 65% of the building permit fee | the permit fee |
| Estimated use tax | 4.25% of 50% of the total valuation | the valuation |
| Permit trade fees | +15% of the permit fee, per trade | the permit fee |
| Plan review trade fees | +15% of the review fee, per trade | the review fee |

**All seven seams close.** Every band is written as *"$X for the first $N plus $Y for each
additional $1,000, or fraction thereof"*, and the figure the band below produces at its own
top is exactly the figure the band above opens with:

| At | The band below produces | The band above opens with |
| --- | --- | --- |
| $500 | $19.50 | $19.50 — closes |
| $2,000 | $59.25 | $59.25 — closes |
| $25,000 | $332.95 | $332.95 — closes |
| $50,000 | $546.70 | $546.70 — closes |
| $100,000 | $844.20 | $844.20 — closes |
| $500,000 | $2,684.20 | $2,684.20 — closes |
| $1,000,000 | $4,659.20 | $4,659.20 — closes |

This is the first schedule on this site that is internally exact. Denver is a dollar short
at one handover, Clark County four cents short at another, Houston's brackets deliberately
do not chain at all, and Boulder City's handovers close but on a table half this size. Each
seam is asserted in `tests/content/westminster-seed.test.ts` and recomputed from
PostgreSQL in `npm run db:verify`, because "the table agrees with itself" is a claim worth
checking rather than a courtesy to the document.

**One band counts in hundreds.** "`$19.50 for the first $500 plus $2.65 for each
additional $100, or fraction thereof`" — the only row of its kind here. The engine reads a
rate per $1,000 of a stated increment, so the increment is carried as 10,000 cents and the
rate as $26.50 per $1,000: the same rate in the unit the engine publishes. $59.25 at
$2,000 is what proves the conversion.

**A trade permit here is not a permit.** This is the finding that makes Westminster and
Denver a genuinely useful pair rather than two transcripts. Denver: "separate permits are
required for each discipline", each priced "based on the valuation of the work for that
specific trade". Westminster: "**an additional 15% of the permit fee** for each of the
following; mechanical, plumbing, electric", plus 15% of the plan review fee for each. One
state, twenty minutes apart, and the same job carries a different fee in each — and the
Westminster figure cannot be looked up at all, because it is a percentage of a number that
has to be computed first.

**The use tax is a percentage of a percentage.** "4.25% of 50% of Total Valuation
(effective 1/1/2026)" is 2.125%, which is 212.5 basis points. It is carried as the exact
fraction **17/800** — the same extension Dallas forced on the `percent` primitive — rather
than rounded. On a $250,000 project it is $5,312.50: the largest line in the bill, and
more than three times the permit fee.

**Two flat lists price jobs rather than work.** "Miscellaneous SFD Residential Permit
Fees" fixes a water heater replacement at $40.00, re-roofing at $100.00, a detached
storage shed at $80.00, air conditioner $80.00, furnace $60.00, evaporative cooler $60.00,
lawn irrigation sprinkler $60.00, gas log $60.00, fence $50.00 and an above-ground pool at
$50.00. The miscellaneous list beside it fixes solar systems at $300.00, a mobile home
set-up with electrical at $125.00, a construction trailer with electrical at $125.00 and a
demolition permit at $25.00. These are the first flat-by-job fees this project has
published: Denver has no water-heater row at all, so the same job there is priced from a
valuation near the bottom of its table.

## 2. The two readings, and which one is used

`-raw` and `-table` disagree on this document by exactly one row in both flat lists and in
the "Other Inspections and Fees" block: `-raw` places each value on the line **above** its
label, `-table` pairs them. The test applied is the project's usual one — read the document
two ways and prefer the reading that is coherent — and here the two readings agree
*exactly* once the one-row shift is allowed for, on every line of both lists, including the
asterisks (`$80.00*` for air conditioners, `$60.00**` for gas logs). The paired reading is
the one used.

One consequence is that no figure is taken from the "Other Inspections and Fees" block at
all. There, the two readings put the $100.00 either on operational permits or on fire
department fees, and unlike the flat lists there is no internal evidence that settles it.
Nothing in that block is a permit fee this site publishes, so the ambiguity costs the
reader nothing and the alternative — publishing the wrong row — would cost them the
figure.

**What is a reading rather than a printed figure.** The schedule prices four flat rows with
the asterisk "* May also require an electrical permit fee" — air conditioner, furnace
replacement, evaporative cooler and spa/hot tub — and it publishes exactly one electrical
rate, the 15% trade fee. Applying that 15% to the row's own flat figure is this site's
reading: an $80.00 air-conditioner permit carries $12.00 of electrical permit fee, so the
job is $92.00. It is stated as a reading on the page, with its result, and it is recorded
here as an open question. What the schedule genuinely does not price is a stand-alone
electrical permit for work that is not part of a permitted project, and no page pretends
otherwise.

A second reading, smaller: **the flat lists are charged as printed**, with no plan review
and no use tax added. The schedule prints one figure for those jobs where the valuation
route prints a permit fee and a review fee separately, and the two are alternatives rather
than charges that stack. The page says so rather than presenting it as certain.

## 3. What was built

- **Rules:** 8 valuation bands, the 65% review row, the 17/800 use tax, three pairs of
  trade rules (15% of the permit fee and 9.75% of the permit fee as the review share of
  15% of 65%), 15 flat item rows and the four electrical-note rules. Every rule cites the
  schedule.
- **No engine change.** The exact-fraction `percent` was Dallas's extension, the
  `permit_fee` basis was Phoenix's, the mutually exclusive `custom.schedule_item` pattern
  was Scottsdale's, and the boolean-conditioned surcharge was Clark County's. **This is the
  third jurisdiction in a row to need nothing added** — Denver, and before it Boulder City.
- **The double-charge guard.** The trade rules carry `custom.schedule_item absent` as well
  as their boolean, so a flat single-family row (where the row's own figure *is* the
  permit) cannot also be charged a project trade fee. Without it an air-conditioner permit
  would show $92.00 on one page and $104.00 on another for the same job. It is asserted in
  the content test and recomputed from PostgreSQL.
- **Pages:** `building-permit-cost` ($250,000 with three trades → **$8,983.06**),
  `electrical-permit-cost` (air-conditioner replacement → **$92.00**),
  `plumbing-permit-cost` (water heater replacement → **$40.00**), each with 6 FAQs and its
  own metadata.
- **Mechanical is a permit type with no page**: the schedule prices it (15% of the permit
  fee, plus three flat rows of its own) and no page claims it in this release.

## 4. Open questions

- **What a stand-alone trade permit costs.** The 15% is defined against a project's permit
  fee. For an electrical or plumbing job with no building permit, and no row on either flat
  list, the schedule publishes nothing. That is the one honest gap on the trade pages, and
  both of them say so.
- **Whether plan review attaches to the flat rows.** They are printed as a single figure;
  the pages charge them as printed and state the reading.
- **Which row the $100.00 in the "Other Inspections and Fees" block belongs to** —
  operational permits or fire department fees. Unresolved, and nothing is published from
  that block because of it.

## 5. Postscript to Denver's record

Denver's research record ended with a section headed "second jurisdiction, measured but not
modelled", and the reason given was the shape of this trade mechanism: a percentage of
another component's value, per trade, with no published base for a stand-alone trade
permit. That diagnosis was right about the *open question* and wrong about the *page*: the
percentage can be computed as long as the page is honest that it is answering a question
about a project's fees, and the answer it produces — $150.03 of the $2,425.26 a $60,000
project pays, of which $90.93 is the trade fee itself — is a real answer to the question
people actually ask. Denver's record has been corrected. The lesson is the one this project
keeps relearning in a new form: **"this cannot be modelled" is a claim to test, not a
conclusion to file.**
