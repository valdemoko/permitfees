# Indiana — state notes

Indiana is **published** with two jurisdictions: **Indianapolis** (Marion County, the Department
of Business and Neighborhood Services) and **South Bend** (St. Joseph County, the St. Joseph
County / City of South Bend Building Department). Both were read in the same pass, on 2026-09-26.

## Why these two

Both were reachable and both publish a real instrument rather than a page about one. They also
turned out to be opposite ends of the same question — *what does a schedule read?* — which is
why they were taken together:

- **South Bend** publishes one seventeen-page PDF for four trades. Its building section reads a
  **valuation** (new construction at `CSF × TSF × .00098`) or a **banded cost ladder**, and its
  electrical and plumbing sections are **price lists of item rows** with their own $60.00 floors.
- **Indianapolis** publishes one **spreadsheet**. Its Permits sheet states its own mechanism in
  its header row — application / review / issuance — and no row on any modelled page reads a
  valuation at all. Its nine structural subtypes read a subtype and an area; its craft rows read
  a subtype and, in one case, a fixture count.

## Authorities checked and not taken

- **Fort Wayne / Allen County.** Reachable (`https://www.allencounty.in.gov/234/Building-Department`,
  200), and it publishes a fee schedule PDF (`/DocumentCenter/View/14441/T6-A10-Fee-Schedule`) —
  but the file is **scanned**: nine pages of images with no font resources at all
  (`SECnvtToPDF V1.0`, `/Font` absent, `/Image` present), so `pdftotext` returns nine blank
  pages. Without an OCR toolchain in this environment none of its rates can be read, and reading
  them off a rendered image would be transcription from a picture rather than from a document.
  The city's own code library (`codelibrary.amlegal.com/codes/ftwayne`) carries Chapters 99 and
  153 but not the building permit table, which the county department issues.
- **Mishawaka, New Carlisle and Walkerton.** Named by South Bend's own schedule as having their
  own departments, and therefore outside it. Not probed.
- **Bloomington** and **Cedar Rapids** (a different state) returned 403 to scripted requests and
  were not pursued, since two jurisdictions were already available.

## What a third Indiana jurisdiction would need

Fort Wayne is the obvious candidate, and it needs a way to read a scanned document — either an
OCR pass or a human transcription of the nine-page fee schedule, recorded as such. Everything
else about it is already in place: the PDF is stable, the department publishes it, and its
ordinance section (T6-A10) is named.
