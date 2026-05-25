# Product Requirements Document — SARW Atlas (V1)

**Project:** SARW Atlas — India Higher Education & Skills Landscape
**Owner:** SARW Labs (solo founder)
**Status:** V1 scope locked
**Last updated:** 2026

---

## 1. Purpose (why this exists)

SARW Labs is building a skill-building venture. Before committing capital — lab
locations, cohort design, market sizing — the founder needs **situational
awareness** of India's higher-education landscape: where the students are, where
the institutions are, where the participation gaps are, and what the discipline
mix looks like.

SARW Atlas turns the official AISHE 2021-22 data into an interactive, visuals-first
map and dashboard that answers founder questions directly. It is built **in public,
under SARW Labs branding**, so the same artifact doubles as a credibility asset:
evidence that SARW understands the terrain it operates in.

**V1 is a decision-support instrument for the founder, published openly.**

## 2. Primary user (V1)

The founder of SARW Labs. Every V1 decision optimizes for *his* questions. The
public can view it (and that's intentional positioning), but V1 is not designed
around external user needs — those come in later phases.

## 3. The questions V1 must answer

| # | Founder question | Decision it feeds | Data |
|---|---|---|---|
| Q1 | Where is the 18-23 population largest? | Raw market size by geography | Table 38 |
| Q2 | Which states have highest institution *density* (not just count)? | Lab-location shortlist | Table 4 |
| Q3 | Where is higher-ed participation (GER) high vs low? | Where the system over/under-serves | Table 19 |
| Q4 | How big is each state's enrolled student base, by level? | Funnel sizing per geography | Table 6 |
| Q5 | What is the national discipline mix? (esp. Design scarcity) | Cohort-mix feasibility | Table 12 |

## 4. Scope

### In scope (V1)
- Interactive **state-level** choropleth map of India (36 States/UTs).
- Switchable map layers: population (18-23), institution density, GER, enrolment.
- Linked non-map charts: discipline mix (national), enrolment by level, state rankings.
- Click a state → detail panel with that state's full profile.
- Short, opinionated **founder's-read narrative** framing the data (not a neutral dump).
- SARW Labs branding, header, and framing throughout.
- All data baked as static JSON from validated Python extractors.
- Hosted on GitHub Pages, deployed via GitHub Actions.

### Explicitly OUT of scope (V1) — scaffolded for, not built
- **District-level** maps (state-level only in V1; districts are a fast-follow).
- **AI / natural-language interface** (needs a backend; Phase 3).
- **Jobs / unemployment / skills-demand data** (enrichment; Phase 4).
- **Streaming / live data** (needs a backend; later).
- The remaining ~42 AISHE tables (add incrementally as questions demand).

## 5. Success criteria (V1 is "done" when)
- All five questions Q1-Q5 are answerable in under 10 seconds of interaction.
- Map renders all 36 States/UTs, correctly joined to data (no missing/mismatched states).
- Every displayed number traces back to a validated extractor output.
- Site loads in under 3 seconds on a normal connection; works on mobile.
- Deployed live at a SARW-branded GitHub Pages URL.
- The founder can show it to a third party as a SARW credibility piece without caveats.

## 6. Non-goals / principles
- **Visuals-first.** The map is the product; tables are secondary.
- **Opinionated, not neutral.** It reflects SARW's read of the landscape.
- **Honest about limits.** Where data can't answer something (e.g. discipline ×
  geography does not exist in AISHE), the UI says so rather than faking it.
- **Solo-builder pragmatic.** No paid dependencies; nothing that needs a team to run.
