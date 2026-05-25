# Architecture & Technical Decisions — SARW Atlas

This document records *what* we're building on and *why*, so Claude Code builds
consistently and future-you remembers the reasoning.

---

## 1. The core architectural decision: static now, backend-ready

GitHub Pages serves **static files only** — no server, no database, no running code.
For a data-viz site whose data refreshes yearly (AISHE), this is ideal: bake data
into static JSON at build time, let the browser render it. Free, fast, versioned, zero ops.

**But** the AI interface and streaming data planned for later **cannot** run on Pages
(an LLM endpoint holds a secret API key that must never reach a browser; streaming
needs a persistent process). So we adopt a deliberate split:

```
  ┌─────────────────────────────┐         ┌──────────────────────────┐
  │  STATIC SITE (GitHub Pages)  │         │  FUTURE BACKEND          │
  │  - React + maps + charts     │  fetch  │  (Cloudflare Worker /    │
  │  - reads baked JSON          │ ──────► │   free-tier service)     │
  │  - V1 lives entirely here    │  later  │  - AI query endpoint     │
  │                              │         │  - streaming ingest      │
  └─────────────────────────────┘         └──────────────────────────┘
```

**The rule that makes "later" cheap:** the frontend fetches data through a single
data-access layer. In V1 that layer reads local JSON files. When the backend arrives,
only that layer changes to call an API — the components rendering maps and charts
never know the difference, because the data *shape* is identical either way.

> Design principle: **never entangle data-fetching with rendering.** One module owns
> "get me the data"; everything else just receives it.

## 2. Stack (chosen for a solo builder on Claude Code, no paid deps)

| Layer | Choice | Why |
|---|---|---|
| Build/dev | **Vite + React + TypeScript** | Fast, mainstream, Claude Code generates it fluently. TS catches data-shape bugs early. |
| Maps | **MapLibre GL JS** | Open-source fork of Mapbox GL. No token, no billing — critical for a free public site. Handles choropleth + interaction well. |
| Charts | **D3** (only for non-map charts) | For bars/treemaps/rankings. Don't use D3 for the map — MapLibre owns that. |
| Data | **Static JSON**, baked from Python extractors | No DB in V1. JSON is the contract between data pipeline and frontend. |
| Styling | **CSS modules or Tailwind** (builder's choice) | Either is fine; pick one and stay consistent. |
| Deploy | **GitHub Actions → GitHub Pages** | Push to main → auto-build → auto-deploy. |

### Tradeoffs worth knowing
- **MapLibre vs react-simple-maps:** react-simple-maps is simpler but less capable
  for layered/interactive maps. MapLibre is the right call given maps are the product
  and we want district layers later. (This is a clear-cut call, not a coin-flip.)
- **D3 vs a chart library (Recharts/Chart.js):** Recharts is faster to build with but
  less flexible. For V1's handful of charts, *Recharts is acceptable and faster*; use
  D3 only if a specific chart needs custom control. (This one genuinely depends — let
  the builder choose per-chart.)

## 3. Data flow

```
AISHE PDF ──[Python extractors]──► validated CSVs ──[build script]──► /public/data/*.json
                                        │                                      │
                                   (provenance +                          (frontend reads
                                    validation gates)                      via data layer)
```

- Extractors already exist and are validated against published totals.
- A small build step converts CSVs → JSON shaped for the frontend (one file per view).
- JSON files ship in the repo under `/public/data/` and deploy as static assets.

## 4. The known risk to de-risk in Phase 1: the map-data join

India's state boundaries must come from a GeoJSON file, and the **join between map
geometry and our data must be by a stable code, not by name.** Names are unreliable
(we already hit "Chhatisgarh" / "Uttrakhand" spelling variants in the source PDF).

**Mitigation:** assign every state a canonical code (use the standard 2-letter
ISO 3166-2:IN / census state codes). The GeoJSON and the data JSON both carry that
code; the frontend joins on code. Validate in Phase 1 that all 36 join cleanly
before building any visualization on top.

## 5. Repo layout (target)

```
sarw-atlas/
├── docs/                 # PRD, this file, data spec, roadmap
├── data-pipeline/        # Python extractors + CSV→JSON build script
│   └── extracted/        # validated CSVs
├── public/
│   └── data/             # baked JSON (the frontend's data contract)
│   └── geo/              # India state GeoJSON (with canonical codes)
├── src/
│   ├── data/             # THE data-access layer (the swap point for future backend)
│   ├── components/       # map, charts, state-detail panel
│   ├── views/            # composed dashboard layouts
│   └── content/          # founder's-read narrative text
└── .github/workflows/    # GitHub Actions deploy
```
