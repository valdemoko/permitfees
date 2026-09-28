# Idaho — research ledger

Status: **BLOCKED — no reachable primary source.**

## What the docs require

- Verifiability first: a jurisdiction appears only when it has real, readable,
  primary-source fee figures, published with URLs, hashes, effective dates and a
  verification date.
- A county appears as its own entry when it issues permits for unincorporated
  areas.

## Test

~10 Idaho government domains were fetched from this environment, all returning
HTTP 000 (unreachable / connection failed) within the 12 s limit:

| URL | Result |
| --- | --- |
| `https://idaho.gov/` | 000 |
| `https://www.ada.id.gov/` (Ada County) | 000 |
| `https://idahodocs.gov/` | 000 |
| `https://www.igov.state.id.us/` | 000 |
| `https://idahocounty.gov/` | 000 |
| `https://eao.idahocounty.gov/` | 000 |
| `https://icbc.idaho.gov/` | 000 |
| `https://idahobuilding.org/` | 000 |
| `https://idahodivisionofbuildingsafety.com/` | 000 |
| `https://idaba.org/` | 307 (redirect to a German-language site, no Idaho content) |

## Conclusion

No reachable, primary-source, readable Idaho permit fee schedule exists in this
environment. The next-state gate ("verifiability first") fails, so the Idaho
cycle is not started. Nothing is modelled, nothing is seeded, nothing is
published. This is a data-availability blocker, not a code or engine issue.

## Open

The cycle can start the moment a reachable primary source appears — e.g. Ada
County's fee schedule re-hosted on a public, accessible host, or a state-level
Idaho Division of Building Safety fee schedule. If that source becomes
available, drop it in `research/idaho/` and re-run the cycle.
