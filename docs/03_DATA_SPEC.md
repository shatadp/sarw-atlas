# Data Specification — SARW Atlas

What data exists, its grain, its limits, and how it's validated. This is the
source of truth for what the Atlas can and cannot claim.

---

## 1. Source

**All India Survey on Higher Education (AISHE) 2021-22** — Ministry of Education,
Government of India. Released Jan 2024. This is the *latest published edition*
(the 2022-23 cycle is still in collection as of early 2026).

356-page PDF, ~48 data tables. V1 uses 6 validated tables.

## 2. Tables in V1 (extracted, normalised, validated)

| File | Grain | Key fields | Source table |
|---|---|---|---|
| `state_master.csv` | per State/UT | the joined headline metrics — START HERE | derived |
| `table38_population_18_23.csv` | per State/UT | 18-23 population (M/F/total) | Table 38 |
| `table4_college_density.csv` | per State/UT | colleges, colleges/lakh 18-23, avg enrolment/college | Table 4 |
| `table6_enrolment_by_level.csv` | per State/UT | enrolment by level (PhD…UG…Cert) × M/F/total | Table 6 |
| `table19_ger.csv` | per State/UT | GER by social group × gender | Table 19 |
| `table1_universities_by_type.csv` | per State/UT | universities by type | Table 1 |
| `discipline_enrolment.csv` | per discipline (NATIONAL only) | UG & PG enrolment by discipline | Tables 12, 13 |

## 3. Headline numbers (validated against published totals)

- **18-23 population:** 152,452,016 (~15.25 crore)
- **Total higher-ed enrolment:** 43,268,181 (~4.33 crore)
- **UG enrolment (discipline universe):** 33,127,729
- **Universities:** 1,168 · **Colleges:** 45,473
- **National GER:** 28.4

## 4. THE critical limitation (UI must respect this)

**Discipline never crosses geography in AISHE.** There is no "engineering students
in Karnataka" anywhere in the source. Discipline data (Table 12/13) is national-only;
geographic data (Tables 4/6/19/38) has no discipline split.

→ The Atlas shows discipline mix as a **national** view, clearly labelled as such.
It must NOT imply a discipline-by-state breakdown exists. Closing this gap requires
external data (AICTE intake) — a later phase.

## 5. Other honest caveats

- Tables marked "based on actual response" (incl. discipline, pass-outs) are
  **undercounts** of the true national figure — valid for *relative* comparison
  between states/disciplines, not for absolute TAM claims.
- 18-23 population is a 2011-census-based projection (AISHE's own GER denominator).
- State sum of 18-23 population ≈ 95% of the national figure (small UTs / rounding);
  use the published All-India total (152,452,016) for the national number.

## 6. Provenance & extraction notes

The AISHE PDF text layer is **partially corrupt**: column headers render
mirror-reversed; West-Bengal/All-India summary rows are coordinate-superimposed.
Extraction therefore uses **position-based grid parsing** (cell boundaries from PDF
ruling lines), headers read from rasterised page images, and the superimposed rows
verified against images. Every table is validated against published All-India totals
plus an internal sum check before use.

## 7. Canonical state codes (the map-join key)

Every state carries a canonical code (ISO 3166-2:IN). The data JSON and the GeoJSON
both join on this code — never on name. The name-resolver in the pipeline maps source
spelling variants ("Chhatisgarh"→Chhattisgarh, "Uttrakhand"→Uttarakhand) to canonical.
