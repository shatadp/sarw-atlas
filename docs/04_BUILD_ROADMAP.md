# Build Roadmap — SARW Atlas (Claude Code execution plan)

Phased plan for a solo builder using Claude Code on Windows. Each phase has:
concrete deliverables, the Claude Code tasks to run, and a **validation gate**
you must pass before moving on. Do not skip gates — they catch the failures that
break this kind of project.

---

## Phase 0 — Repo & data foundation  ✅ (data already done)

**Deliverables**
- Git repo initialised, pushed to GitHub.
- `docs/` (these 4 files) committed.
- `data-pipeline/extracted/` — the validated CSVs (already produced).
- Build script: CSVs → `/public/data/*.json` shaped per view.

**Claude Code tasks**
1. "Initialise a Vite + React + TypeScript project in this repo. Set up the folder
   structure from docs/02_ARCHITECTURE.md section 5."
2. "Write a Python script in data-pipeline/ that reads extracted/*.csv and emits
   /public/data/states.json (one record per state with all metrics joined by a
   canonical state code) and /public/data/disciplines.json (national discipline mix)."

**Validation gate**
- `states.json` has exactly 36 state records + national totals, each with a code.
- Every number in JSON matches the CSV it came from (spot-check 3 states).

---

## Phase 1 — Map + data join (the riskiest part, do it first)

**Deliverables**
- India state GeoJSON in `/public/geo/`, every feature tagged with the canonical code.
- A bare MapLibre choropleth that colours states by ONE metric (population), reading
  from `states.json`, joined by code.
- Proof that all 36 states render and join with no name/code mismatches.

**Claude Code tasks**
1. "Source an India States GeoJSON. Add a canonical state code property to each
   feature matching the codes in states.json. Write a validation script that confirms
   every GeoJSON feature code has a matching states.json record and vice versa."
2. "Build a MapLibre GL choropleth component that loads the GeoJSON and colours each
   state by population_18_23, joining geometry to data on the canonical code."

**Validation gate** (this is the make-or-break gate)
- Validation script reports **zero** unmatched states in either direction.
- Map visibly renders all 36 states coloured; hovering shows the right state name.
- If any state is grey/missing → STOP and fix the join before building anything else.

---

## Phase 2 — Visualization layer (the actual product)

**Deliverables**
- Layer switcher: population / institution density / GER / enrolment.
- Click-a-state → detail panel with that state's full profile.
- Linked charts: national discipline mix (treemap or bar, Design highlighted),
  enrolment-by-level, state rankings.
- SARW Labs branding + founder's-read narrative from `src/content/`.
- Responsive / mobile-friendly.

**Claude Code tasks**
1. "Add a layer switcher that recolours the choropleth by the selected metric, with
   a legend and sensible colour scales (sequential for counts, diverging for GER vs
   national average)."
2. "Build a state detail panel: clicking a state shows population, colleges, college
   density, GER, enrolment by level, top university types."
3. "Build a national discipline-mix chart from disciplines.json. Highlight that Design
   is 0.14% of UG enrolment. Label the whole view clearly as NATIONAL — per the
   discipline×geography limitation in docs/03_DATA_SPEC.md."
4. "Apply SARW Labs branding and drop in the narrative copy from src/content/."

**Validation gate**
- All 5 PRD questions (Q1-Q5) answerable in <10s of interaction.
- Discipline view is unambiguously labelled national; nothing implies a state split.
- Loads <3s; usable on a phone.

---

## Phase 3 — Deploy to GitHub Pages

**Deliverables**
- GitHub Actions workflow: push to main → build → deploy to Pages.
- Live SARW-branded URL.

**Claude Code tasks**
1. "Write a GitHub Actions workflow that builds the Vite app and deploys to GitHub
   Pages. Set the correct base path for a project Pages site."

**Validation gate**
- Live URL loads, maps and charts work, data is correct in production.
- Founder can share the link as a SARW credibility piece without caveats.

---

## LATER (scaffolded, not built in V1)
- **Districts:** add district GeoJSON + district data; same code-join discipline.
- **AI interface:** stand up a Cloudflare Worker holding the API key; frontend's
  data layer gains an API path. (The split from docs/02 section 1 pays off here.)
- **Enrichment:** AICTE intake (unlocks discipline×geography), PLFS (unemployment).
- **Streaming:** only when there's a genuine live source (SARW cohort telemetry).

---

## Cross-cutting rules for Claude Code
- Read docs/02_ARCHITECTURE.md and docs/03_DATA_SPEC.md before writing code.
- Keep the data-access layer (src/data/) the ONLY place that knows where data
  comes from. Components receive data, never fetch it directly.
- Never invent numbers. Every displayed figure comes from /public/data/.
- When the data can't answer something, say so in the UI — don't fabricate.
