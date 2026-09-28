import type { JurisdictionSeed } from "./seed-types";
import { albuquerqueSeed } from "./albuquerque";
import { birminghamSeed } from "./birmingham";
import { bostonSeed } from "./boston";
import { cambridgeSeed } from "./cambridge";
import { greenBaySeed } from "./greenbay";
import { minneapolisSeed } from "./minneapolis";
import { saintPaulSeed } from "./saintpaul";
import { southBendSeed } from "./southbend";
import { indianapolisSeed } from "./indianapolis";
import { kansascitySeed } from "./kansascity";
import { springfieldSeed } from "./springfield";
import { nashvilleSeed } from "./nashville";
import { memphisSeed } from "./memphis";
import { detroitSeed } from "./detroit";
import { grandrapidsSeed } from "./grandrapids";
import { boulderCitySeed } from "./bouldercity";
import { chicagoSeed } from "./chicago";
import { clarkCountySeed } from "./clarkcounty";
import { dallasSeed } from "./dallas";
import { denverSeed } from "./denver";
import { durhamSeed } from "./durham";
import { houstonSeed } from "./houston";
import { anchorageSeed } from "./anchorage";
import { fairbanksSeed } from "./fairbanks";
import { huntsvilleSeed } from "./huntsville";
import { lasCrucesSeed } from "./lascruces";
import { kingCountySeed } from "./kingcounty";
import { manchesterSeed } from "./manchester";
import { madisonSeed } from "./madison";
import { miamiDadeSeed } from "./miamidade";
import { multnomahCountySeed } from "./multnomahcounty";
import { nashuaSeed } from "./nashua";
import { newarkSeed } from "./newark";
import { philadelphiaSeed } from "./philadelphia";
import { pittsburghSeed } from "./pittsburgh";
import { newYorkCitySeed } from "./newyorkcity";
import { buffaloSeed } from "./buffalo";
import { fargoSeed } from "./fargo";
import { bismarckSeed } from "./bismarck";
import { clevelandSeed } from "./cleveland";
import { toledoSeed } from "./toledo";
import { oklahomaCitySeed } from "./oklacity";
import { tulsaSeed } from "./tulsa";
import { desMoinesSeed } from "./desmoines";
import { cedarRapidsSeed } from "./cedarrapids";
import { wichitaSeed } from "./wichita";
import { overlandParkSeed } from "./overlandpark";
import { siouxFallsSeed } from "./siouxfalls";
import { rapidCitySeed } from "./rapidcity";
import { billingsSeed } from "./billings";
import { missoulaSeed } from "./missoula";
import { littlerockSeed } from "./littlerock";
import { fortsmithSeed } from "./fortsmith";
import { neworleansSeed } from "./neworleans";
import { batonrougeSeed } from "./batonrouge";
import { jacksonSeed } from "./jackson";
import { gulfportSeed } from "./gulfport";
import { louisvilleSeed } from "./louisville";
import { lexingtonSeed } from "./lexington";
import { atlantaSeed } from "./atlanta";
import { savannahSeed } from "./savannah";
import { virginiaBeachSeed } from "./virginiabeach";
import { richmondSeed } from "./richmond";
import { charlestonSeed } from "./charleston";
import { columbiaSeed } from "./columbia";
import { annapolisSeed } from "./annapolis";
import { baltimoreSeed } from "./baltimore";
import { wilmingtonSeed } from "./wilmington";
import { doverSeed } from "./dover";
import { bridgeportSeed } from "./bridgeport";
import { newHavenSeed } from "./new-haven";
import { providenceSeed } from "./providence";
import { warwickSeed } from "./warwick";
import { honoluluSeed } from "./honolulu";
import { hiloSeed } from "./hilo";
import { portlandMeSeed } from "./portlandme";
import { lewistonSeed } from "./lewiston";
import { provoSeed } from "./provo";
import { saltLakeCitySeed } from "./saltlakecity";
import { burlingtonSeed } from "./burlington";
import { montpelierSeed } from "./montpelier";
import { jerseyCitySeed } from "./jerseycity";
import { lincolnSeed } from "./lincoln";
import { oakParkSeed } from "./oakpark";
import { omahaSeed } from "./omaha";
import { orangeCountySeed } from "./orangecounty";
import { phoenixSeed } from "./phoenix";
import { portlandSeed } from "./portland";
import { raleighSeed } from "./raleigh";
import { sacramentoSeed } from "./sacramento";
import { sanDiegoSeed } from "./sandiego";
import { scottsdaleSeed } from "./scottsdale";
import { seattleSeed } from "./seattle";
import { westminsterSeed } from "./westminster";
import { charlestonWvSeed } from "./charlestonwv";
import { huntingtonSeed } from "./huntington";
import { boiseSeed } from "./boise";
import { meridianSeed } from "./meridian";
import { cheyenneSeed } from "./cheyenne";
import { casperSeed } from "./casper";

/**
 * Every jurisdiction payload this project publishes, in seed order.
 *
 * This module exists because the list used to be written out in four places —
 * `scripts/seed.ts` and three integration tests each held their own copy — and
 * adding Nevada broke all three tests at once while the seeder, which had been
 * updated, ran perfectly. A list of what the site contains is a fact about the
 * site, not a detail of any one script, so it is stated once here.
 *
 * The order is the order the jurisdictions were researched: it matters only for
 * readability, because every entry upserts on natural keys and the shared rows
 * (states, counties, permit types) are de-duplicated before they are touched.
 *
 * Adding a jurisdiction means importing it here and nowhere else.
 */
export const ALL_SEEDS: JurisdictionSeed[] = [
  houstonSeed,
  dallasSeed,
  phoenixSeed,
  scottsdaleSeed,
  clarkCountySeed,
  boulderCitySeed,
  // The county is seeded before the city: the two share a county public health
  // department as their plumbing authority, and the source row for its fee schedule is
  // already attributed to the county when Seattle's payload references it.
  kingCountySeed,
  seattleSeed,
  // Oregon is seeded as a pair, and the city first for the same reason: the state
  // surcharge and the OAR valuation method are cited by both payloads under the same
  // keys, and the shared row belongs to whichever payload the seeder reaches first.
  portlandSeed,
  multnomahCountySeed,
  // Florida is a state of counties rather than of cities, and Orange County is
  // seeded first of the two because it is the one whose fee directory is a single
  // document that quotes the state's surcharge and its own valuation table alike.
  orangeCountySeed,
  miamiDadeSeed,
  // Colorado is a county-driven state: the two jurisdictions share a county public
  // health department, and the county's schedule is the one the shared rows belong
  // to, so the county pair is ordered before the cities.
  denverSeed,
  westminsterSeed,

  // California opens a new mechanism rather than a new pair: San Diego's building permit
  // is priced as plan check plus inspection from area, and its trade permits per unit of
  // work. Sacramento is the state's second jurisdiction and the opposite shape — a
  // valuation ladder that hands over to a printed formula, and flat named scopes for the
  // trades.
  sanDiegoSeed,
  sacramentoSeed,
  // North Carolina opens with a mechanism nothing else has: Raleigh prices a trade
  // permit as a share of the building permit fee it belongs to, and floors every trade
  // at $124.00 per trade per review.
  raleighSeed,
  // Durham is North Carolina's second jurisdiction and Raleigh's opposite: a new house
  // is priced from gross square footage and commercial work from a construction contract,
  // the trades from the count of what is permitted, and the technology surcharge is
  // already inside every published amount rather than charged as its own row.
  durhamSeed,
  // Illinois is the state in two halves. Oak Park comes first: it prices new
  // construction as area × the ICC construction-cost chart × .0194, with the
  // electrical and plumbing trades as stand-alone permits of their own — the
  // opposite of Chicago, whose building fee is the product of two of its own
  // factor tables (CF × RF × A) and whose trades are a flat fee schedule that
  // stacks when one permit covers more than one listed scope.
  oakParkSeed,
  chicagoSeed,
  // Alabama is represented by its two largest economic centres: Birmingham
  // prices construction from project valuation ($9.50/$1,000) with state craft
  // training fund surcharges and a 50% plan review fee, while Huntsville prices
  // new single-family dwellings from heated and unheated square-foot formulas
  // and other work from a 0.0055 contract valuation multiplier.
  birminghamSeed,
  huntsvilleSeed,

  // Nebraska is seeded as a pair, Omaha first. Both of its jurisdictions price the same
  // shape of valuation table, and both chain exactly: Omaha's Table 43-91 and Lincoln's
  // Table 1A each open a band with the figure the band below produces at its top — the
  // opposite of Houston's and Denver's seams. Omaha also carries a third component, the
  // Planning Department's Technology and Training fee, whose bands are selected by the
  // size of the permit fee itself.
  omahaSeed,
  // Lincoln is the project's first jurisdiction to publish fewer than three permit pages
  // for a reason that is a fact about its code rather than a gap in the research: its
  // plumbing and mechanical fees are set by the City Council and provided by the Code
  // Official, so the code publishes no amount to quote. The withheld plumbing page is
  // carried as `draft` so that absence is visible in the data.
  lincolnSeed,

  // New Hampshire is seeded as a pair, Manchester first, and the two cities price the
  // same three trades with two different mechanisms. Manchester charges a *rate on the
  // estimated cost of the work* (.006 / .010 / .015) with a $25.00 application fee and a
  // $30.00 minimum that the City's own forms print as one line: $55.00. Nashua charges
  // *published per-unit and per-square-foot rates* — $0.18 and $0.28 per square foot of
  // building area, $9.50 and $12.00 per fixture, $1.00 per outlet — under a $50.00
  // application fee, and both cities put their whole fee schedule in the municipal code
  // rather than in a separate document.
  manchesterSeed,
  nashuaSeed,

  // Alaska is seeded as a pair. Anchorage (Municipality) comes first: its building
  // permit is a straight valuation multiplier (0.009 residential / 0.015 commercial)
  // with a two-tier plan review (50% / 65%). Fairbanks is the opposite shape — a
  // nine-band valuation ladder (Table 3-A) with a flat 75% plan review and per-unit
  // trade fees ($255 SFD electrical flat, $15/fixture plumbing).
  anchorageSeed,
  fairbanksSeed,

  // New Jersey is seeded as a pair, Newark first, and it is the first state whose fees are
  // shaped by a *State* rule rather than only by the city: N.J.A.C. 5:23-4.18 requires every
  // municipal construction fee to be computed on the volume of the building or, for
  // alterations, on the estimated construction cost, and each city sets the unit rates. Both
  // of these cities charge new construction per cubic foot, which is why this release added
  // the `cubic_footage` basis, and both price electrical devices in *blocks* — Newark's "First
  // 50 — $58; Each additional 20 — $12" — which is why `per_unit` gained `incrementUnits`.
  // They also disagree with the State about the State's own surcharge: both print an older
  // amount of N.J.A.C. 5:23-4.19(b), so each page names the City's figure beside the one
  // charged, and both cities' codes point at the regulation for the amount.
  newarkSeed,
  jerseyCitySeed,

  // New Mexico starts with Albuquerque, whose fee table is *derived* rather than transcribed:
  // the UAC's Table 112-A is one raw six-band ladder that §112.2.1 multiplies by a regional
  // modifier — .67 for apartments, public and commercial, .50 for one- and two-family and
  // townhouses including renovations and additions, with the $23.50 minimum taken *after*
  // the multiplication — so `albuquerque/fee-rules.ts` generates the very column the City's
  // own fee handout prints. All 335 of the handout's rows were reproduced from that formula
  // before a line was written, which is also the check that proved the floor sits after the
  // modifier (the two columns cross $23.50 at different valuations: $801 and $1,201). Plan
  // review there is a real surcharge on top of the permit — 65% of building, 25% of trade,
  // §112.3's "separate fees ... in addition to the permit fees" — the opposite of Newark's
  // credited prepayment, and the trade tables sit at modifier 1.0 so their printed rows are
  // charged as written.
  albuquerqueSeed,

  // Las Cruces is the second New Mexico city and a different animal: one 2020 resolution
  // repealed seven older fee schedules and replaced them with a single document whose
  // building side has two paths drawn in one sentence — $0.20/sq ft for a new dwelling,
  // "Remodels and additions follow the commercial process" (the seven-band Fee Table).
  // Its content tests pin the two readings this pair of cities turned on: Las Cruces's fee
  // table *prorates* (no "or fraction thereof" printed) while its mechanical and plumbing
  // ladders round up (phrase printed), and its plan check is the first 25% *of* the fee —
  // a payment schedule like Newark's, not a surcharge like Albuquerque's.
  lasCrucesSeed,

  // Wisconsin opens with Madison, and the shape is a schedule in three parts rather than one:
  // MGO 29.09, 18.09 and 19.11 were repealed and recreated together in March 2021 and were
  // written to match — the same three use groups, the same $25.00 minimum, the same 50% shell
  // reduction, the same Group IV definition — so a new building's building, electrical and
  // plumbing permits are the *same square footage* multiplied by a different group rate
  // ($.10/.18/.12, $.09/.11/.06, $.09/.10/.06), while work on an existing structure leaves
  // the groups entirely and is priced by what it is: $11.00 per $1,000 of value, $25.00 for
  // the first ten electrical openings, $8.00 a plumbing fixture. No occupancy fact derives
  // those groups — Group I holds houses *and* apartment space, Group II holds hotels — which
  // is why `custom.fee_group` exists and why it is the switch between the two regimes.
  // Madison is also the first jurisdiction whose own two City sources disagree on a published
  // rate: MGO 18.09 enacts $.10 for Group II plumbing and the division's fee page prints $.11,
  // so the enacted figure is charged and the page's is printed beside it.
  madisonSeed,

  // New York is the first jurisdiction whose trade fees come from a *rule* rather than from
  // the fee table: §28-112.2.2 sends electrical work to "department rules", and 1 RCNY §101-03
  // is the rule — $40 to file, ten free units, $0.25 after, five service switch bands — while
  // building and plumbing are Table 28-112.2's thirty-nine rows, whose alteration ladder
  // ($130/$170 to $290 base, then $2.60, $10.30 or $17.75 per $1,000 or fraction) is priced by
  // *two* facts: the building's size and the Alteration Type filed. Plumbing has no schedule of
  // its own — it rides those same rows, and DOB's published LAA charts reprint them as a price
  // list, which is the independent check no other jurisdiction has. And New York City is the
  // first with no percentage anywhere: no plan review, no technology fee, no state or county
  // surcharge, because searches for each phrase come back empty in the City's text.
  newYorkCitySeed,

  // Pennsylvania opens with Philadelphia, and its mechanism is a stack rather than a rate:
  // every L&I permit is a filing fee that is nonrefundable *and* credited toward the permit
  // fee — which makes it a floor on that fee, charged as the shortfall, not a fifth charge —
  // plus the permit fee, plus $3.00 City and $4.50 State surcharges, with no separate plan
  // review line anywhere because plan review is inside the permit fee. The permit fee itself
  // is priced three ways by trade: building in square-footage bands ("$253 for the first 500
  // sq. ft.; plus $73 for each additional 100 sq. ft. or fraction") with a flat $1,328
  // residential column, electrical at $25 per $1,000 or fraction of estimated cost between a
  // published $63 minimum and a published $18,975 maximum — the first ceiling this dataset
  // takes from the schedule itself rather than leaving the ladder open — and plumbing in
  // seven-fixture blocks with a residential exception on every category. Philadelphia is also
  // the first jurisdiction whose schedule is promulgated by CPI arithmetic rather than by
  // Council vote: L&I multiplies the July 1, 2017 fee by a published multiplier (26.5%), and
  // the chain from the superseded 16.1% schedule checks at ×1.0896 row for row.
  philadelphiaSeed,

  // Pittsburgh is Pennsylvania's second city and the first whose whole fee stack is *one* number:
  // total construction value times a rate per $1,000, clamped — $6.00/$130–$8,000 residential,
  // $7.00/$605–$95,000 commercial — with no "or fraction thereof" anywhere in the block, so the
  // multiplication is prorated ($25,100 is $150.60, not $156) and the clamp lands on the
  // multiplied figure. Three add-ons ride every permit (a technology fee whose four brackets are
  // selected by the size of the base fee itself, the State's $4.50 training fund under Act 37 of
  // 2017, and $5.00 of record retention), and one published figure *reduces* a total: the 15%
  // Third Party Agency discount that PLI requires on commercial electrical permits, folded into
  // that row's rate as $5.95 per $1,000 with the clamps scaled to match — scaling and clamping
  // commute, so the fold reproduces the City's clamp-then-discount exactly. Its third page is
  // mechanical rather than plumbing because the City issues no plumbing permits at all: Allegheny
  // County Health Department does, which is a fact about jurisdiction rather than a gap.
  pittsburghSeed,

  // Buffalo is the second jurisdiction whose commercial sheet reproduces its own
  // arithmetic as worked examples — both totals ($32,792.50 and $8,377.50) are asserted
  // cent for cent — and the first whose two building sheets are *different schedules*
  // rather than one schedule with a column split: detached 1- and 2-family dwellings on
  // flat area bands and a prorated $5-per-$1,000 row, everything else on mean
  // construction cost at $8 per $1,000 that rounds the cost up to a whole thousand in the
  // sheet's own "or portion thereof" words. It is also the first electrical schedule
  // modelled as a published multiplier table times a fixed rate (Schedule A × Schedule B,
  // blanks included), and the first plumbing price list where no valuation is a fee basis
  // at all — the declared valuation "does not replace the required permit fees", so the
  // fees are made only of counts: fixtures, and linear feet of underground pipe in
  // 100-foot segments.
  buffaloSeed,

  // North Dakota is the pair of readings the round-up phrase decides, carried as two
  // cities on opposite schedules: Fargo's sheets print "or fraction thereof" in every
  // band after the first and round up ($1,001 of residential valuation pays a whole
  // $5.56 step; $1,500 of commercial pays two whole $12.75 steps' worth of one), while
  // Bismarck's sheets never print it and prorate ($2,500 is $71.95 where a whole-
  // thousand reading would be $76.15). Fargo is also the first jurisdiction whose
  // electrical page exists because the City's own fee-schedule index proves it
  // publishes no electrical fee — the dollars are NDSEB's, billed to the homeowner at
  // rough-in — and the first whose commercial ladder's arithmetic is discontinuous on
  // the sheet's own face: $578.50 computed at $50,000 against the $578.75 the band
  // above prints, both asserted from both sides. Bismarck is the first where the two
  // building sheets print *numerically identical* ladders, so one rule set answers both
  // classes and the class switch does only the one job the sheets actually differ on —
  // an unconditional 20% review fee that reads "all Commercial Building Permits",
  // gated by nothing but the class, with no application fee on either sheet for it to
  // have swallowed.
  fargoSeed,
  bismarckSeed,

  // Massachusetts opens with Boston, whose schedule is a two-page ISD handout rather than
  // a code table: five building rows chosen by what the filing *is* (the Short Form is the
  // catch-all), three electrical branches chosen by what the job *does* (amperage with a
  // voltage band, a device count, or cost where neither applies), and one plumbing line of
  // $20.00 plus $5.00 a fixture. It is the first jurisdiction whose per-$1,000 rate
  // prorates, because its sheet never prints "or fraction thereof" — and the first whose
  // live permit pages confirm the handout line for line, four rows with the same two
  // numbers in both texts, which also exposes the one place they disagree: the PDF's
  // "$.75 amp up to 480 Volts" against the web's "$0.75/amp over 480 volts", charged as
  // one band above 240 volts so no voltage is left unpriced.
  bostonSeed,

  // Cambridge closes Massachusetts as the rounding mirror of Boston, three miles east:
  // its building rows print "or fraction thereof" four times and round up to the whole
  // thousand where Boston prorates, its Exemption line is a $15.00 *rate* for buildings
  // of three residential units or less (a waiver in name only, charged wherever the unit
  // count is absent), its electrical page is a price list whose rows stack where Boston's
  // branches, and its plumbing is a $50.00 block with a five-fixture allowance where
  // Boston charges straight per fixture — every contrast asserted in both cities' tests.
  cambridgeSeed,

  // Michigan opens with Detroit, whose one 51-page schedule holds three different
  // mechanisms: a nine-band ladder on project cost where every rate row prints "or
  // fraction thereof" (so the step above each threshold rounds up — the opposite of
  // Pittsburgh's prorated block, and each band is charged from its own printed base
  // because the seams between them are 7¢ at $25,000 and $26.67 at $50,000,000), an
  // electrical section that opens PART A with a flat $66 and then prices circuits,
  // fixtures and eight service bands gated by amperage *and* voltage class so exactly
  // one fires, and a plumbing block headed by a $73 application fee that is
  // non-refundable and credited nowhere. Plan review exists in three published forms
  // in the same document — 7% per trade, a 35% deposit two sentences later called
  // 30%, and $158 + $53 a sheet — and none is summed, each for its own stated reason.
  detroitSeed,

  // Ohio opens with Cleveland, where the city's two publications disagree and the
  // ordinance wins: § 3105.25's four-row valuation ladder ($10/$5 residential, $12
  // then $7 and $15 then $11 commercial, each side of the $1,000,000 seam its own
  // rule so $1,000,000 pays $12,000 and $1,000,001 pays $12,007), and the two
  // consecutive surcharge paragraphs that put the RC 3781.10(E) 1% *inside* OBC
  // rates while requiring it itemised on residential permit and plan-examination
  // fees — one class surcharged, the other already containing it. The department's
  // fee page adds what the section omits (plan exam at $20 per 1,000 sq ft, late-fee
  // tiers, the certificate) and contradicts the ordinance in three places ($13 vs
  // $50 potable, "3% added" vs "included", a zoning row the code omits); every
  // conflict is quoted rather than averaged, and the state statute itself answers
  // to no fetch from this environment.
  clevelandSeed,

  // Toledo is the jurisdiction whose City's own website prints two rates swapped —
  // plan review at "$.20" and the permit at "$.03" — against its table, the code and
  // the application form, all three agreeing. Chapter 1307 prices building work on
  // area ($60/$75 base + $0.20 per gross sq ft, 100 sq ft minimum), plan review on
  // the same area at $0.03, demolition on cubic feet in three bands (the top one
  // read on whole volume, seam jump recorded unresolved), and § 1307.13's state
  // surcharge as 1%/3% "of total" — where the City's own worked example defines the
  // total as plan review plus permit, certificate outside, and this seed reproduces
  // its $1,414.00 line for line.
  toledoSeed,

  // Green Bay closes Wisconsin as the dataset's matrix jurisdiction: one ordinance-keyed
  // schedule, four trades, every trade split three ways by what the building is — the
  // property class the City's own application forms ask for — with the residential rate
  // written as the catch-all. It contributes two firsts: the fire sprinkler row that
  // publishes both a floor and a ceiling in its own parenthetical ($2.50 per head, $70.00
  // minimum, up to $200.00), and a commercial electrical section offering two ways to
  // price one job — area rates or a project-cost ladder — where the ladder replaces the
  // area rates rather than adding to them.
  greenBaySeed,

  // Grand Rapids is Michigan's second jurisdiction and Detroit's opposite on the same state
  // code: a $54 application plus $6.80 per each additional $1,000 — with the partial step
  // charged whole, because the City's 500-row fee chart is keyed by $1,000 value ranges —
  // topped by two components that are percentages of the fee itself: a commercial-only plan
  // review at max($50, floor(units × $0.68)) in whole dollars (modelled as the chart's own 501
  // printed tiers, since no engine percentage can floor to a dollar) and a zoning fee that is
  // $25 flat residential and 10% of application-plus-permit clamped $25–$290 commercial. The
  // City publishes that arithmetic twice — chart and inline calculator — and the two disagree
  // twice; the chart is the schedule, so the chart wins and the disagreement is flagged.
  grandrapidsSeed,

  // Minnesota opens with Minneapolis, whose building schedule prints its own three-
  // component formula — permit fee + 65% plan review + 0.0005 state surcharge — over a
  // nine-band marginal ladder whose per-band bases are the schedule's own printed
  // numbers (the $578.00-vs-$578.20 seam is the document's rounding, charged as
  // printed), and whose plumbing sheet prices $41.40 rows with a minimum that INCLUDES
  // the surcharge where the building minimum EXCLUDES it — both parentheticals read
  // literally. The electrical permit is the State's own under 326B.37, priced from DLI's
  // fee worksheets — the Fargo/NDSEB authority boundary, one state west — and the
  // "$41.40 per 100 linear feet" block forced a fractional per-foot rate, adding the
  // linear_feet basis to the engine.
  minneapolisSeed,

  // Minnesota's second jurisdiction is Minneapolis's counterpoint, and answers the one
  // question Minneapolis raised: where the electrical trade belongs. In Saint Paul it is
  // the City's own — DSI's Electrical Inspection Department publishes six sub-permit
  // tables — while Minneapolis's is the State's, so the same river has two authorities.
  // Its building schedule is the dataset's first long closed table, 103 printed valuation
  // rows that resolve to four segments of one arithmetic (111 of the 112 rows reproduce
  // exactly; the sheet omits two rows and misprints a third, all three named on the page),
  // with printed bases that STEP DOWN at every open seam — $1,522 at $100,000, $1,499 at
  // $100,001 — and the state surcharge read from M.S. 326B.148 itself, whose six bands are
  // marginal rates the statute already states. Plumbing is the shortest table in the
  // dataset: a $92 base and four counts.
  saintPaulSeed,

  // Tennessee opens with Nashville, whose building permit is the dataset's first assembled
  // from four separately stated components — a $25 zoning examination fee, the valuation fee,
  // a codes tech fee of 10% of the valuation fee, and a plan review — and whose schedule says
  // so in its own first four lines. Three of the four commercial band bases are not the
  // arithmetic below them ($372.71 vs $372.55, $651.38 vs $651.21, $2,326.84 vs $2,327.38),
  // and the plan review turns over at $275,000: one-half of the permit fee up to the seam,
  // then $1,338.54 plus $0.18 a thousand — a 93% step for one dollar of valuation. Dwellings
  // and townhouses are a branch of their own at $5.00 per $1,000 with no plans examination at
  // all (subsection G.2), and multifamily is explicitly not residential. The tech fee's own
  // ordinance (BL2022-1254, cited on the sheet) is why the zoning fee is charged as an `other`
  // component rather than a base one: a fee that is 10% of the valuation fee cannot be 10% of
  // itself. Plumbing and electrical are price lists with a $75 floor, and the electrical page
  // names the class-based rows it does not yet price.
  nashvilleSeed,

  // Memphis closes Tennessee as the county OCCE's one schedule for six cities —
  // Memphis, Arlington, Germantown, Lakeland, Millington and the county itself —
  // whose cover line is the surcharge mechanism the tests assert on every permit type:
  // $4.00 admin plus $1 residential / $5 commercial ($5/$9 totals) as `other`.
  // Commercial building is the mirror of Nashville's: prorated (no "or fraction thereof")
  // rather than rounded, and the four bands chain exactly rather than stepping $0.16–$0.54
  // off the band below; plan review is nine flat valuations ($80–$3,000) rather than half
  // the permit fee. Residential is $0.07 a foot with a $125 floor and alteration at $5.00
  // per $1,000 clamped $50–$325 — the only Tennessee page where area is the basis.
  memphisSeed,

  // Indiana opens with South Bend, whose building section is two mechanisms that meet at one
  // number: new construction and additions at `CSF × TSF × .00098` — 0.00098 of the
  // construction valuation the ICC table produces, under a $60.00 minimum — and a
  // remodeling/alteration ladder of one hundred printed rows that its own arithmetic
  // reproduces to the cent, $60.00 at $1–$3,000 and $5.00 per $1,000 band to $545.00 at
  // $100,000. Above it the sheet prints bases that step **up** at the seam ($550.00 against
  // the $545.00 the ladder reaches), the opposite of Minneapolis's two-cent step and Saint
  // Paul's $23 one, and then $0.90 and $0.60 per $1,000. Its electrical and plumbing sections
  // are the opposite shape again — price lists of item rows stacked on a single permit, each
  // trade stating its own "minimum permit fee being $60.00" — with a fire-protection row
  // charged as $0.80 a head inside a ten-head block and a solar row whose percentage the
  // schedule declines to publish.
  southBendSeed,

  // Indianapolis closes Indiana with the dataset's first schedule published as a workbook
  // rather than a PDF — and the format is the mechanism. Read cell by cell, the Permits
  // sheet's header states what the PDFs elsewhere only imply: "Permit Type |
  // Subtype/Description | Application Fee | Review Fee | Issuance Fee". Every Structural
  // Permit row fills all three — $40 (536-619's additional service fee, which Proposal 239
  // shows rising from $32), a plan review, and the permit fee — and every plumbing,
  // electrical and heating/cooling row fills only the first, its two neighbours empty. Nine
  // structural subtypes × (application + review + issuance), one figure per craft subtype,
  // and not one row that reads a valuation: the plumbing commercial row is the only count in
  // either trade, at $182 for ten fixtures and $23 per block of five. Proposal 239 also
  // places the $250 administrative fee (536-609, from $215) that every worksheet's header
  // prints — assessed on a permit that has not been closed, and therefore stated as a
  // requirement rather than charged to every applicant.
  indianapolisSeed,

  // Missouri opens with Kansas City, and its ladder is the dataset's only *flat table* under
  // $50,000: fifty valuation brackets printed as amounts rather than as a rate, so $12,300 of
  // valuation pays the $12,001–13,000 row ($223.50) instead of a cent rate on the whole. Above
  // the table the bands chain exactly rather than step — $686 → $2,561 → $9,201 — and plan
  // review is a *credited prepayment* (half at submission, credited at issuance), the third
  // relationship between a plan review and a permit after Newark's credit and Albuquerque's
  // surcharge. One sheet prices every trade, per building, on each trade's own valuation.
  kansascitySeed,

  // Springfield closes Missouri as Kansas City's opposite: the basis is not a declared
  // valuation but a **construction factor** — Gross Area × 85 × the IBC Type Factor matrix —
  // and the fee is a marginal table at **half cents** (0.5 / 0.4 / 0.3 / 0.15¢ commercial,
  // 0.4 / 0.3 / 0.2 / 0.1¢ residential), which is why the tier carries an exact
  // `{numerator, denominator}` rate rather than a whole-cent field. Plan review at 75% and
  // technology at 18.5% are percentages of the permit fee, each with its own floor — and the
  // 279-cell matrix is named on every page rather than carried as 279 rules.
  springfieldSeed,

  // Oklahoma opens with Oklahoma City, whose whole fee apparatus is one ordinance-book
  // chapter — Ch. 60 holds all four trades — printed by Ord. 27978 (11-18-25) in two
  // columns, one per fiscal year, with the "July 1, 2026 and thereafter" column the one
  // in force: $78 first demolition story (not $74), $478 mobile-home-park minimum (not
  // $434). Two sections price two different jobs — § 60-12-7's alteration ladder at $6.00
  // per $1,000 *without* "or fraction thereof" (so it prorates, the Bismarck reading)
  // under a $75 floor, and § 60-12-9's five class rates per square foot (warehouse $0.19
  // to office $0.28) under the same floor, keyed on custom.building_class because
  // "commercial" does not say whether a building is a warehouse or an office. Plan review
  // is 50% *credited toward* the total — Pittsburgh's share again, summed nowhere — and
  // the Development Impact Fees page is a second instrument entirely: a six-by-four
  // land-use-by-assessment-area streets matrix plus $0.53/sq ft parks for residential only,
  // stored as the schedule's own rateTables product.
  oklahomaCitySeed,

  // Iowa opens with Des Moines, whose Permit and Development Center prices dwellings by
  // flat finished-floor-area rows ($1,050–$1,750, basement and garage excluded) and
  // commercial work by a six-band valuation ladder with whole-$1,000 round-ups — plus a
  // 65% plan check charged in addition. Cedar Rapids closes it on one resolution
  // (1707-12-24): flat area tables that bundle the trades for new dwellings, Table A
  // valuation bands above $100,000, a $20 administration fee, the 40% plan check for
  // non-R-3 buildings, and one shared trade ladder — $25 flat, then marginal bands from
  // 1% down to 0.2% — read by electrical and plumbing alike.
  desMoinesSeed,
  cedarRapidsSeed,

  // Kansas opens with the state's two largest permit offices. Wichita runs on MABCD —
  // the joint city/county department under the Unified Building and Trade Code — whose
  // Table B prices new dwellings per square foot ($0.38 finished / $0.30 unfinished) and
  // everything else on an eight-band valuation ladder whose bases chain exactly, with a
  // 60% plan review from code §109.5.1 and item-price-list trade tables (Tables I and H)
  // that each add a $25.00 issuance fee. Overland Park is the two-multiplier regime:
  // 0.0035 on ICC-derived new-construction value, 0.0050 on submitted value at the
  // $19,000 seam, $30/$50 flats with a $30 flat plan review below it — and no separate
  // trade permits at all, the trades priced inside the building permit.
  wichitaSeed,
  overlandParkSeed,

  // Sioux Falls opens South Dakota: Building Services re-adopts its fee schedule
  // annually (residential valuation reviewed since 1985), and the regime's signature
  // is derived valuations — new houses never declare a value, the schedule's square-foot
  // factors ($128 finished / $79 finished basement / $41 unfinished / $42 attached
  // garage) build the number that walks the Table 1-A ladder. Table 1-B prices declared
  // commercial value; both ladders' bands chain exactly above their $40 flat bands with
  // "or fraction thereof" round-ups, plan review is 25% of the Table 1-B fee charged
  // once, and the electrical, mechanical and plumbing trades have shared one common
  // eight-band valuation ladder since 2022 (resolving Table 104.5's higher plumbing
  // bases in favor of the City's own MEP form).
  siouxFallsSeed,

  // Rapid City closes South Dakota as the resolution-priced jurisdiction: the code
  // never prints a fee (§ 15.04.320 delegates everything to Common Council resolution),
  // and the operative documents are the two one-page Table PDFs Building Services
  // publishes — 100-A residential, 100-C commercial — both starting at a $37.00 flat
  // band and chaining to $3,539.50 / $5,608.75 bases above $1,000,000 with "or fraction
  // thereof" round-ups. Plan review is the region's sharpest pair: 10% for 1–2 family
  // dwellings, 50% for everything else. The adopted trade chapters price nothing, so
  // stand-alone trade-scale work models through the building ladder by declared
  // valuation, and the residential $2,000 seam is modelled as printed ($39 vs $45).
  rapidCitySeed,

  // Montana opens with two fee-set cultures. Billings is the stand-alone
  // resolution: 26-11315 (Feb 2026) CUT every schedule 23–31%, consolidated the
  // building ladders into ONE eight-band table for both occupancies (seams
  // chaining exactly to a $9,529 base), kept commercial plan review at 60% and
  // eliminated the residential plan-review fee outright; the adopted PDF is a
  // scan whose page 1 was read visually against the Gazette's text-layer draft.
  // Missoula is the exhibit resolution: the FY2026 schedule (Resolution 8887)
  // prices a fine $1,000-wide project-cost grid into four wide marginal bands
  // ($11.73/$7.82/$5.87 per $1,000 above $100,000) with plan review at 30% of
  // the permit fee — and every rule ends 2026-09-30, the day before Resolution
  // 8970's successor amounts (5% up, commercial review 65%) take effect.
  billingsSeed,
  missoulaSeed,

  // Tulsa closes Oklahoma as the stack jurisdiction: Chapter 1 applies its five lines to
  // every permit in Title 49 — $4.00 state + $0.50 City + $5.50 and 8% of the permit fee
  // (evaluated before the state lines exist, so it reads the chapter's fee only) + $5.00
  // processing + a global $80 floor charged last against fee_subtotal — and each trade
  // chapter repeats the instruction. Its building fee is also the schedule this engine
  // added `incrementRounding: "nearest"` for: § 302's bands round "to the closest One
  // Thousand Dollars" (a phrase Google's index confirms in the City's 2021 PDF, so not a
  // 2026 typo), and the over-$150k band is charged as B's own ceiling ($927.00) plus
  // $3.09/k of the excess — the full-valuation reading kept beside it under needs_review,
  // because the City publishes no example that settles it. § 301 is credited and never
  // summed; § 306's storm shelter pays its flat plus Section 100 and nothing else, which
  // is the carve-out wired as the stack's own stand-down condition.
  tulsaSeed,

  // Arkansas is seeded as a pair of one-section cities whose schedules live in a single
  // code chapter each. Little Rock prices everything from Sec. 8-31: a valuation ladder
  // whose four bands all print "or fraction thereof", a 50% commercial plan check, a
  // $3–$8 data processing fee on every trade, and a $30 minimum expressed as a
  // permit_minimum shortfall; new dwellings on every trade pay $0.08/sq ft under roof.
  // Fort Smith prices from Chapter 6: a cost-of-construction schedule whose residential
  // top band rounds up while its nonresidential bands prorate (the phrase decided
  // band-by-band inside one section), a nonresidential ladder that chains at three seams
  // and steps UP $108.00 at its own printed $1M base (the Fargo/Detroit discontinuity
  // pattern), a 20% plan review capped at $1,500, electrical priced per active circuit on
  // a marginal ladder over the engine's new `circuits` basis, and plumbing inspection
  // fees floored at $24.
  littlerockSeed,
  fortsmithSeed,

  // Louisiana is a state of two regimes. New Orleans splits its permits between two
  // governments — the City's Safety & Permits prices building ($60 + $5/$1,000, plan
  // review $1/$1,000 min $60, 50% HDLC/Vieux Carré surcharge) and electrical ($40 +
  // $3/circuit + $0.30/ampere), while plumbing belongs to the Sewerage & Water Board,
  // a separate political corporation whose published figure is a $50 filing fee and
  // whose inspection fees appear in no published schedule (stated, never guessed).
  // Baton Rouge — a consolidated city-parish — prices residential by area ($0.80/sq ft
  // + $125) and commercial by valuation on chained bands ($5/$4/$1.50 per $1,000, all
  // prorating, plan review a second valuation table), with flat MEP trade rows.
  neworleansSeed,
  batonrougeSeed,

  // Kentucky pairs a promulgated commercial schedule with a state-split trade
  // pattern. Louisville prices buildings by KBC occupancy per square foot ($.105
  // residential to $.16) with a $75 permit minimum, and its plumbing page prices
  // Kentucky's state permit (815 KAR 20:050) because the local schedule has no
  // plumbing section. Lexington prices residential $.10/sq ft + $180, commercial
  // by use $.28-$.90/sq ft, carries a flat $10 electrical permit from its own
  // page, and shares the same state plumbing permit. Louisville's electrical
  // amperage rows charge in three segments ($.25/amp to 600, $150 flat, $.50/amp
  // over) so the printed arithmetic holds at any service size.
  louisvilleSeed,
  lexingtonSeed,

  // Mississippi pairs an honest absence with a plain-spoken schedule set.
  // Jackson publishes NO fee schedule anywhere online — Sec. 26-2 defers to an
  // "adopted schedule of fees" the City never posts, and the OpenGov portal's
  // application forms sit behind the Viewpoint Cloud login — so its three
  // pages publish zero fee rules and state the absence (the editorial gate's
  // hasNoScheduleStatement case; nothing is invented). Gulfport's Building
  // Code Services links three PDFs that carry a $30.00 base fee plus a $4/
  // $1,000-or-fraction building ladder, an FY 2002 electrical sheet (service
  // and feeder amperage ladders, $6 per branch circuit, 25¢/amp sub-panels)
  // and an FY 2002 plumbing fixture list ($5 fixtures, $7 lavatories and floor
  // drains, $10 water heaters, $50 water connection), dated honestly.
  jacksonSeed,
  gulfportSeed,

  // Georgia is seeded as a pair of opposite readings of one rate shape. Atlanta
  // prices construction at $7 per $1,000 of sworn cost of construction with no
  // fraction language (so it prorates), a $150 minimum, and a $25 technology fee
  // on every permit; its trade permits are published base/minimum pairs ($150/$75
  // electrical, $150/$175 plumbing). Savannah prices an all-inclusive building
  // permit from a marginal ladder ($8/$4/$2 per $1,000) over a City-defined cost
  // of construction (floor area x $80/$125 per sq ft), with banded plan review;
  // its trades round up because the Revenue Ordinance prints "any fraction
  // thereof" — the same rounding pair Fargo and Bismarck carry, one state east.
  atlantaSeed,
  savannahSeed,

  // Virginia is the 2%-levy state: both of its cities add the same state
  // surcharge to every permit's final calculated fee, on opposite fee shapes.
  // Virginia Beach prices building work by AREA — $50 + $7 per 100 sq ft of
  // heated residential space ($8 commercial), every row reading "or fraction
  // thereof" — with trade permits priced per 50 amps, per circuit and per
  // fixture, while Richmond prices building AND the trades alike on the value
  // of work (the higher of the contractor estimate or RS Means) at $63 + $6.07
  // or $131 + $8.50 per $1,000 or fraction above the first $2,000.
  virginiaBeachSeed,
  richmondSeed,

  // South Carolina is the chained-ladder state: Charleston's ordinance schedule
  // prints band bases that are exactly what the band below produces at its top
  // ($290 at $50,000, $522 at $100,000, $1,600 at $500,000) with a 50% plan
  // review and a $40 application fee, while Columbia's commercial ladder chains
  // the same way ($905/$4,505/$16,505 at each seam) beside a flat $25 residential
  // review — and both print "or fraction thereof" on every rate row.
  charlestonSeed,
  columbiaSeed,

  // Maryland is the split-basis state: Baltimore's Building Code §109 prices
  // new construction on cubic feet ($10/$20 per 1,000 cu ft or fraction) with
  // amperage-banded electrical service and $5 plumbing fixtures, while
  // Annapolis's FY26 schedule prices the same permits on declared value
  // ($250 + 0.8% over $10,000), amperage dwelling rows ($150 + $8/100 A) and
  // first-fixture-plus-$15 plumbing.
  baltimoreSeed,
  annapolisSeed,

  // Delaware is the dated-schedule state: Wilmington's L&I fee table is the
  // increase schedule "Effective June 1, 2014" — one valuation rate ($12 per
  // $1,000) with every trade row flat at $20 — while Dover's Appendix F (adopted
  // through Ordinances #2024-15/#2024-19, effective July 8, 2024) prices building
  // work in three marginal legs ($25 first $1,000 + $8/$6/$5 per $1,000, "or
  // multiples thereof") and makes its electrical permits FREE by ordinance
  // (§22-109(a) "No fee"), so Dover's third published page is mechanical.
  wilmingtonSeed,
  doverSeed,

  // Connecticut — Bridgeport prices every permit from the Building Department's
  // value-of-work table ($40/$60 first brackets, then $60 + $30 per $1,000 or part
  // of, the schedule's own printed formula, eff. 5/18/16) with the $40 electrical
  // water-heater carve-out; New Haven prices building, electrical and plumbing
  // alike from two linear cost tables ($50.26 + $27.26/k residential, $55.26 +
  // $35.26/k commercial, the .26 endings carrying the state education surcharge).
  bridgeportSeed,
  newHavenSeed,

  // Rhode Island — a statewide-fee state: 510-RICR-00-00-21 (amendment effective
  // 2023-12-10) computes every municipality's building permit fee from its §21.12
  // schedules. Providence (§21.12(A)(28)): $23/$21/$19 per $1,000 chained bands,
  // $125 minimum. Warwick (§21.12(A)(35)): $10/$8/$6, $75 minimum. Both cities
  // price electrical and plumbing permits on the same valuation ladder.
  providenceSeed,
  warwickSeed,

  // Hawaii — Honolulu prices one consolidated building permit (electrical,
  // plumbing and mechanical ride the valuation per ROH § 18-6.2(b)) from Table
  // 18-A's eight bands, whose rates read the TOTAL valuation with printed bases
  // as floors — the only monotone reading; plan review 20% capped $25,000.
  // Hawai'i County (Hilo, the county seat) prices a textbook chained marginal
  // ladder under HCC § 5-7-3 ($10/$1.50-per-$100/$7.50/$6/$3 per $1,000, 'or
  // fraction thereof' in every band, plan review 20%).
  honoluluSeed,
  hiloSeed,

  // Maine — Portland prices permits from the cost-of-work formula printed on
  // the City's own permit forms ($30 first $1,000 + $10 per $1,000); Lewiston
  // prices renovations at $25 base + $5 per $1,000 of value with per-sq-ft rows
  // for new construction (City Council-adopted schedule, eff. 7/01/2013).
  portlandMeSeed,
  lewistonSeed,
  // Utah
  saltLakeCitySeed,
  provoSeed,
  // Vermont
  burlingtonSeed,
  montpelierSeed,

  // West Virginia opens with its capital and its Ohio River city, and the pair is a
  // study in what a municipality publishes about its own fees. Charleston's building
  // schedule is a complete printed ladder (effective 2008-04-14) whose closing note
  // waives the fee to $2,500 and whose closing note adds $5.00 per $1,000 above
  // $30,000; its electrical amounts live on a scanned permit application, and its
  // plumbing amounts are on an application the City never posts — so the plumbing page
  // publishes no figure at all and says why. Huntington is the opposite: a division
  // small enough to publish *one* schedule (IBC 2000 §108.2) for plan examination,
  // permits and inspections alike, which is why its electrical and plumbing pages
  // price the same project-cost ladder and state that the City posts no trade table.
  // Between them the state carries both halves of the verifiability rule: a page that
  // has real primary amounts, and a page that honestly has none.
  charlestonWvSeed,
  huntingtonSeed,
  // Idaho — Boise prices building permits from the ICC-shaped Table 1-A ladder
  // and its trades from four separate adopted code schedules (the FY27 proposed
  // redlines are deliberately not priced); Meridian runs everything through one
  // $50 + $5.50/$1,000 formula its own worksheets print as cell arithmetic.
  boiseSeed,
  meridianSeed,
  // Wyoming — both cities publish one valuation table that serves building AND
  // trade scope alike, but with opposite fee philosophy: Cheyenne's Ordinance
  // 4254 ladder chains eight bands to $3.65/$1,000 above $1M, while Casper's
  // combined schedule opens at $60 and adds a 25%/35% plan check over $25,000.
  cheyenneSeed,
  casperSeed,
];

/** Permit pages that clear the editorial gate, across every jurisdiction. */
export const ALL_PUBLISHED_PERMIT_PAGES = ALL_SEEDS.flatMap((seed) =>
  seed.permitPages
    .filter((page) => page.publishStatus === "published" && !page.noindex)
    .map((page) => ({ seed, page })),
);
