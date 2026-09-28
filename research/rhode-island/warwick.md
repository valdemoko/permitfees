# Warwick, Rhode Island — research record

**Research pass:** Rhode Island (second jurisdiction)
**Read on:** 2026-09-26
**Jurisdiction:** City of Warwick (Kent County, fips 44003; the Building
Inspection & Zoning Enforcement office issues building and trade permits)
**Pages published:** building, electrical, plumbing

## The instrument

The same statewide regulation governs Warwick: **510-RICR-00-00-21 "State
Wide Permitting Fee"** (amendment effective **2023-12-10**) computes every
municipality's building permit fee from its §21.12 schedule.

**City of Warwick schedule** (§21.12(A)(35)):

| Project valuation | Fee |
| --- | --- |
| $1 to $10,000 | $10.00 per $1,000 |
| From $10,001 to $50,000 | $100 + $8.00 per $1,000 exceeding $10k |
| From $50,001 to no limit | $420 + $6.00 per $1,000 exceeding $50k |
| Note | **$75 minimum fee** |

Band bases chain exactly ($10.00 × 10 = $100; $100 + $8.00 × 40 = $420).
Warwick's ladder is the dataset's cleanest: three linear legs, chained
bases, one printed minimum.

## Discrepancies and how they were resolved

1. **Third-party "warwickri.gov" fee pages** could not be fetched reliably
   from this environment; the state regulation is the superior instrument
   anyway — §21.6 makes its §21.12 schedule the fee schedule municipalities
   must compute from, and §21.7 requires the Building Code Commission to
   keep each municipality's schedule posted current.
2. **Rounding of partial thousands** — same resolution as Providence:
   project-wide round-up convention, documented; band checkpoints exact.

## Sources actually read

| # | Source | URL | Type | Notes |
| --- | --- | --- | --- | --- |
| 1 | 510-RICR-00-00-21 State Wide Permitting Fee (§21.12(A)(35)) | `https://rules.sos.ri.gov/regulations/part/510-00-00-21` | municipal_code | Active rule, amendment eff. 2023-12-10; Warwick schedule read verbatim |
| 2 | City of Warwick — Building Inspection | `https://www.warwickri.gov/building-inspection-zoning-enforcement` | municipal_website | Issuing office for building and trade permits |
