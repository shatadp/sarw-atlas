# AISHE 2021-22 — Extracted Data Dictionary

Source: All India Survey on Higher Education 2021-22 (Ministry of Education, GoI).
Grain: one row per State/UT, plus an `All India` total row. `state` column is
normalised to canonical names for joining with external datasets (PLFS, AICTE).

## state_master.csv  (the situational-awareness join — start here)
| column | meaning |
|---|---|
| state | Canonical State/UT name (join key) |
| universities_total | Total universities (AISHE Table 1) |
| colleges_registered | Colleges registered with AISHE (Table 4) |
| colleges_per_lakh_18_23 | Colleges per lakh population aged 18-23 — institution density |
| avg_enrolment_per_college | Average students per college |
| enrolment_total | Total higher-ed enrolment, all levels, incl. estimation (Table 6) |
| enrolment_ug_total / pg_total / phd_total | Enrolment by level |
| enrolment_female | Total female enrolment |
| ger_all_total | Gross Enrolment Ratio, all categories (Table 19) |

## table1_universities_by_type.csv
12 university-type columns (central_univ, state_public_univ, deemed_univ_private, …) + grand_total.

## table4_college_density.csv
colleges_registered, colleges_per_lakh_pop_18_23, avg_enrolment_per_college.

## table6_enrolment_by_level.csv
For each level (phd, mphil, pg, ug, pg_diploma, diploma, certificate, integrated, grand_total):
`_m` (male), `_f` (female), `_total`.

## table19_ger.csv
GER by social group × gender: ger_{all,sc,st}_{m,f,total}.

## Provenance / caveats
- Extracted via position-based grid parsing (cell boundaries from PDF ruling lines).
- This PDF's TEXT LAYER is partially corrupt: column headers render mirror-reversed,
  and the West-Bengal / All-India summary rows are coordinate-superimposed on the
  3-page enrolment table. Headers were read from rasterised page images; the two
  superimposed enrolment rows were verified against rasterised images.
- Every table validated against published All-India totals (1,168 universities;
  45,473 colleges; GER 28.4; 4.33 crore enrolment) and an internal sum check.
