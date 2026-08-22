# Understudy

**Built for the SLAB hackathon, NIT Hamirpur — powered by [webcmd](https://www.npmjs.com/package/@agentrhq/webcmd).**

Understudy is a pair of AI-powered dashboards for product teams: one that keeps
a pulse on a Jira/Trello board (**Understudy-PM**), and one that keeps a pulse
on what users are actually saying in the wild (**Understudy-BA**). A third,
lightweight layer stitches the two together into a single Jira-style board
where a human can review and approve tickets drafted from real user feedback.

---

## Table of contents

1. [What this project is](#what-this-project-is)
2. [Why two dashboards, not one](#why-two-dashboards-not-one)
3. [Full architecture](#full-architecture)
4. [Where webcmd fits — and where it deliberately doesn't](#where-webcmd-fits--and-where-it-deliberately-doesnt)
5. [Data flow, end to end](#data-flow-end-to-end)
6. [Project structure on disk](#project-structure-on-disk)
7. [Understudy-PM — phase by phase](#understudy-pm--phase-by-phase)
8. [Understudy-BA — phase by phase](#understudy-ba--phase-by-phase)
9. [Integration phases (F1–F3)](#integration-phases-f1f3)
10. [The human-approval rule](#the-human-approval-rule)
11. [External accounts & setup checklist](#external-accounts--setup-checklist)
12. [Running everything locally](#running-everything-locally)
13. [SLAB hackathon context](#slab-hackathon-context)
14. [Build order / what to demo if time runs out](#build-order--what-to-demo-if-time-runs-out)

---

## What this project is

Product teams juggle two very different kinds of signal:

- **Internal signal** — what's moving (or stuck) on the sprint board. Overdue
  cards, blocked work, who's overloaded.
- **External signal** — what users are actually saying, scattered across
  Reddit threads, Play Store reviews, and whatever feedback form you bothered
  to build.

Understudy reads both, turns raw noise into structured digests using an LLM,
detects when something's trending, and — crucially — never writes anything
back to Jira without a human clicking "Approve" first.

## Why two dashboards, not one

Understudy-PM and Understudy-BA are built as **two fully independent apps**,
each with its own frontend, backend, and port:

| | Frontend | Backend | Main endpoint |
|---|---|---|---|
| **Understudy-PM** | React, port `5173` | Express, port `3001` | `GET /api/pm-digest` |
| **Understudy-BA** | React, port `5174` | Express, port `3002` | `GET /api/ba-digest` |

Reasons this split was deliberate, not accidental:

- They read **completely different sites** (Trello/Jira vs. Reddit/Play
  Store/a feedback form) — no shared scraping logic to force together.
- They can be **demoed and judged independently**. If one breaks mid-demo,
  the other still stands on its own.
- It avoids a tangled single codebase under hackathon time pressure.

A unification layer (**F3**, see below) was added *after* both stood on
their own — it does not replace the two-app split, it sits on top of it.

## Full architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│  Data sources    │────▶│  PM pipeline     │────▶│                      │
│  Jira/Trello     │     │  webcmd explore, │     │                      │
│  (via webcmd)    │     │  classify, diff  │     │                      │
└─────────────────┘     └─────────────────┘     │   Unified dashboard   │
                                                  │   (F3, lives inside  │
┌─────────────────┐     ┌─────────────────┐     │   the BA backend)     │
│  Data sources    │────▶│  BA pipeline     │────▶│   Digest + candidate │
│  Reddit, Play    │     │  scrape/fetch,   │     │   ticket queue       │
│  Store, forms    │     │  sentiment,      │     │                      │
│  (NO webcmd)     │     │  cluster themes  │     └──────────┬───────────┘
└─────────────────┘     └─────────────────┘                  │
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │   Human approval      │
                                                    │   Gate before ticket  │
                                                    │   creation            │
                                                    └──────────┬───────────┘
                                                               ▼
                                                    ┌──────────────────────┐
                                                    │   Jira ticket created  │
                                                    │   (real write — later, │
                                                    │   separate, opt-in)    │
                                                    └──────────┬───────────┘
                                                               │
                                                    loops back into data sources
```

Key point the diagram makes explicit: the loop only closes through the
**human approval gate**. Nothing in this system ever auto-creates a Jira
ticket. F1's approve endpoint currently only flips a local status field —
wiring it to a real Jira write is an explicit, separate, opt-in step for
later, not part of the default build.

## Where webcmd fits — and where it deliberately doesn't

This is the part worth being precise about, because it's easy to get wrong
by copy-pasting fields across the two pipelines.

**webcmd is a PM-only tool.**

- It is the thing that actually drives a real browser against your
  Trello/Jira board (Phase **P2**), the way a person would — opening the
  page, reading cards, and remembering what it learned about that specific
  site's structure between runs.
- That "memory" is the whole point of the PM dashboard's **run-type
  indicator** utility: was this run `"explored"` (webcmd had to freshly
  figure out the board's structure) or `"cached"` (it reused what it
  already learned)? The PM frontend surfaces this as a badge — "🔍 Learning
  the board" vs. "✅ Understudy's got this."
- Nowhere else in the system calls webcmd. Not the BA pipeline, not the
  aggregator in F3, not the feedback form.

**BA never touches webcmd, by design.**

- Reddit source (**B2**) starts as a dummy JSON file you write yourself,
  and *optionally* later swaps in a real Reddit API call — neither path
  goes through webcmd.
- Play Store source (**B3**) uses the `google-play-scraper` npm package
  directly — no browser automation needed, no account needed.
- Feedback form source (**B4**) is your own HTML form POSTing straight to
  your own backend — again, no browser automation involved.

**A gap worth flagging (and how it was fixed):** early drafts of both
digest shapes included a `run_type` field, copy-pasted from the PM shape
into the BA shape. On the PM side it was also hardcoded to the literal
string `"explored"` instead of reflecting what webcmd actually reported.
Both are wrong:

- **PM fix** — `exploreBoard.js` (P2) now inspects webcmd's own CLI
  output to determine whether the run was a fresh explore or a cache hit,
  and returns `{ cards, run_type: "explored" | "cached" }`. The PM
  pipeline (P5) passes that real value through into the digest instead of
  hardcoding it.
- **BA fix** — the `run_type` field is removed from the BA digest shape
  entirely, since BA never calls webcmd and the field would be meaningless
  there. If a "freshness" indicator is still wanted on the BA frontend,
  it's a differently-named, honest field like `data_fetched_at` (a
  timestamp), not a fake copy of PM's badge.

**Consequence for the unified dashboard (F3):** the `pm` slice of the
unified digest can show a real explored/cached badge (PmMiniPanel). The
`ba` slice has no equivalent — and shouldn't be forced to have one just
for visual symmetry with the PM panel.

## Data flow, end to end

**PM side:**

```
Trello/Jira board
   → webcmd (exploreBoard.js) reads it, reports cards + real run_type
   → Claude (classifyCards.js) classifies into overdue/stale/blocked/workload
   → snapshotStore.js diffs against yesterday's saved snapshot
   → combined into one digest, served at GET /api/pm-digest
   → PM React frontend renders it
```

**BA side:**

```
Reddit (dummy JSON, or real API later)  ─┐
Google Play (google-play-scraper)        ├─▶ combineSources.js merges all
Feedback form (your own POST endpoint)  ─┘    three into one shared shape
   → Claude (classifyReviews.js) produces sentiment_summary + themes
   → spikeDetector.js compares today's theme counts against theme-history.json
   → (F1) any spike gets drafted into a candidate ticket via Claude,
     stored as { status: "pending" } in candidate-tickets.json
   → combined into one digest, served at GET /api/ba-digest
   → BA React frontend renders it
```

**Unified layer (F3), built into the existing BA project:**

```
BA backend adds ONE new route: GET /api/unified-digest
   → fetches PM's own /api/pm-digest over HTTP (the only cross-service call)
   → reuses its own pipeline output in-process (no HTTP hop to itself)
   → reuses its own candidate-tickets.json in-process
   → combines into { generated_at, pm, ba, candidate_tickets }

BA frontend adds ONE new tab: "Board"
   → Jira-style kanban: Pending / Approved / Rejected columns
   → clicking a ticket card opens a detail modal
   → Approve/Reject buttons call the EXISTING F1 endpoints on the same backend
   → board refetches the unified digest after any approve/reject action
```

No third backend, no third frontend, no new ports. The unification lives
entirely inside the BA project because BA already owns the candidate-ticket
data that the board is built around.

## Project structure on disk

```
understudy-pm-backend/
├── src/
│   ├── index.js            # pipeline orchestration (P5)
│   ├── server.js            # Express, GET /api/pm-digest (P5)
│   ├── exploreBoard.js      # webcmd integration (P2)
│   ├── classifyCards.js     # LLM classification (P3)
│   └── snapshotStore.js     # save/load/diff snapshots (P4)
├── data/
│   └── snapshot-<date>.json
├── .env.example              # TRELLO_BOARD_URL, ANTHROPIC_API_KEY, STALE_DAYS_THRESHOLD
└── package.json

understudy-pm-frontend/
└── src/components/
    ├── Header.jsx
    ├── StandupCard.jsx
    ├── OverdueCard.jsx
    ├── StaleCard.jsx
    ├── BlockedCard.jsx
    └── WorkloadChart.jsx

understudy-ba-backend/
├── src/
│   ├── index.js               # pipeline orchestration (B8)
│   ├── server.js                # Express: /api/ba-digest, /api/feedback,
│   │                             #   /api/candidate-tickets*, /api/unified-digest
│   ├── sources/
│   │   ├── redditSource.js      # dummy JSON, real API later (B2)
│   │   ├── playStoreSource.js   # google-play-scraper (B3)
│   │   └── feedbackSource.js    # reads your own form's submissions (B4)
│   ├── combineSources.js        # merges all three sources (B5)
│   ├── classifyReviews.js       # LLM sentiment + theme clustering (B6)
│   ├── spikeDetector.js         # theme spike detection (B7)
│   ├── draftTicket.js           # LLM drafts a ticket from a spike (F1)
│   ├── ticketStore.js           # candidate ticket CRUD, local only (F1)
│   └── aggregateUnified.js      # merges PM + BA + tickets (F3)
├── data/
│   ├── dummy-reddit.json
│   ├── feedback-submissions.json
│   ├── theme-history.json
│   └── candidate-tickets.json
├── feedback-form.html            # standalone, opens directly in a browser (B4)
├── .env.example                    # ANTHROPIC_API_KEY, PLAYSTORE_APP_ID
└── package.json

understudy-ba-frontend/
└── src/components/
    ├── Header.jsx
    ├── SentimentSummary.jsx
    ├── ThemeList.jsx
    ├── SpikeAlerts.jsx
    ├── NavTabs.jsx              # switches between "BA Digest" and "Board" (F3)
    ├── PmMiniPanel.jsx          # F3
    ├── TicketBoard.jsx           # F3
    ├── TicketCard.jsx            # F3
    └── TicketDetailModal.jsx     # F3

understudy-landing/                # optional, do last
└── index.html                     # two cards linking to :5173 and :5174 (F2)
```

## Understudy-PM — phase by phase

| Phase | What it builds | External setup needed |
|---|---|---|
| **P1** | Bare Node/ESM scaffold, logs "ready" | None |
| **P2** | `exploreBoard.js` — shells out to webcmd against a real board URL, returns cards + real `run_type` | Public Trello board (or Jira + API token), `npm install -g @agentrhq/webcmd` |
| **P3** | `classifyCards.js` — Claude call producing `{overdue, stale, blocked, workload_per_assignee}` | Anthropic API key |
| **P4** | `snapshotStore.js` — save/load/diff today vs. yesterday's cards | None |
| **P5** | Wires P2→P3→P4 into one digest, serves `GET /api/pm-digest` on `:3001` | `npm install express cors` |
| **P6** | React frontend, hardcoded first (Stage 1), then live-fetching (Stage 2) | `npm create vite@latest` |

## Understudy-BA — phase by phase

| Phase | What it builds | External setup needed |
|---|---|---|
| **B1** | Bare Node/ESM scaffold, logs "ready" | None |
| **B2** | `redditSource.js` — reads a dummy JSON fixture, shaped for an easy real-API swap later | You hand-write `data/dummy-reddit.json` (8–10 entries) |
| **B3** | `playStoreSource.js` — real reviews via `google-play-scraper` | `npm install google-play-scraper`, pick a target app's package name |
| **B4** | `POST /api/feedback` route + `feedbackSource.js` + a standalone `feedback-form.html` | None — form is entirely self-hosted |
| **B5** | `combineSources.js` — merges Reddit + Play Store + feedback into one shared shape | None |
| **B6** | `classifyReviews.js` — Claude call producing `{sentiment_summary, themes}` (quotes paraphrased, capped at 2/theme) | Same Anthropic API key as PM |
| **B7** | `spikeDetector.js` — flags themes at >2x their historical average, or brand-new | None |
| **B8** | Wires B5→B6→B7 into one digest, serves `GET /api/ba-digest` on `:3002` | `npm install express cors` |
| **B9** | React frontend, hardcoded first (Stage 1), then live-fetching (Stage 2) | `npm create vite@latest` |

## Integration phases (F1–F3)

Only attempted **after** both dashboards work independently.

- **F1 — Candidate ticket drafting.** `draftTicketFromSpike()` sends a
  spike's theme + paraphrased sample quotes to Claude, gets back
  `{title, description}`, stores it with `status: "pending"` in
  `candidate-tickets.json`. `GET /api/candidate-tickets` lists pending
  drafts. `POST /api/candidate-tickets/:id/approve` (and `/reject`)
  **only flip the local status field** — no real Jira API call happens
  here. That's an explicit, separate, later step.
- **F2 — Shared landing page** *(optional, do last)*. One static HTML
  file with two cards linking to the PM frontend (`:5173`) and BA
  frontend (`:5174`). No routing library, no build step.
- **F3 — Unified dashboard.** Built *inside* the existing BA project
  (no new service). Adds `GET /api/unified-digest` to the BA backend
  (fetches PM's digest over HTTP, reuses BA's own pipeline and ticket
  store in-process) and a new "Board" tab to the BA frontend — a
  Jira-style kanban (Pending / Approved / Rejected) that reuses F1's
  existing approve/reject endpoints.

## The human-approval rule

This is the one rule that holds the whole system together and is worth
restating plainly: **no code path in this project writes to a real Jira
board.** The furthest any pipeline goes on its own is drafting a
candidate ticket and marking it `pending`. A human has to open the
ticket in the Board tab and click Approve before its status changes —
and even that only updates a local JSON file. Turning "approved" into an
actual Jira `POST` is a deliberate, separate integration you'd add later,
gated behind your own explicit decision to do it, using a real Jira API
token.

## External accounts & setup checklist

| Need | For | Where |
|---|---|---|
| Anthropic API key | Every LLM call, both dashboards | console.anthropic.com |
| webcmd CLI | PM board reading only | `npm install -g @agentrhq/webcmd` |
| Public Trello board (or Jira + token) | PM pipeline source data | trello.com or id.atlassian.com |
| Reddit dev app *(optional)* | BA — skip and use dummy JSON first | reddit.com/prefs/apps |
| `google-play-scraper` | BA Play Store source | `npm install google-play-scraper`, no account needed |
| Your own feedback form | BA feedback source | plain HTML, POSTs to your backend |
| MongoDB Atlas *(optional)* | Longer snapshot history than flat files | mongodb.com/atlas, free tier |
| Jira API token *(stretch)* | Real ticket creation from the approval queue | id.atlassian.com |

## Running everything locally

```bash
# Terminal 1 — PM backend
cd understudy-pm-backend && npm install && npm start   # :3001

# Terminal 2 — PM frontend
cd understudy-pm-frontend && npm install && npm run dev  # :5173

# Terminal 3 — BA backend (also serves the unified dashboard's API)
cd understudy-ba-backend && npm install && npm start    # :3002

# Terminal 4 — BA frontend (also serves the "Board" tab)
cd understudy-ba-frontend && npm install && npm run dev  # :5174
```

The unified Board tab (F3) lives inside the BA frontend/backend, so no
extra terminal is needed for it. Open the optional landing page
(`understudy-landing/index.html`, F2) directly in a browser if you built
it — it just links out to `:5173` and `:5174`.

## SLAB hackathon context

Understudy was built for the **SLAB hackathon at NIT Hamirpur**, powered
by webcmd. The project's shape — two independent, individually-demoable
dashboards before any integration — was chosen specifically for hackathon
conditions: it lets you have a complete, working demo (PM alone) as early
as possible, adds a second complete demo (BA alone) next, and only
attempts to merge them once there's confidence and time left over. The
strict "human approval, no auto-writes to Jira" boundary was also a
deliberate hackathon-safety choice — it means a bug in the classification
or spike-detection logic can never result in garbage tickets actually
landing in a real Jira project during a live demo.

## Build order / what to demo if time runs out

1. **Understudy-PM (Section 4, P1–P6) — complete this first.** It's a
   full, demoable project entirely on its own.
2. **Understudy-BA (Section 5, B1–B9) — complete this second.** Same
   standard: demoable alone.
3. **Everything else is stretch, attempted only if time remains, in this
   order:** F1 (candidate tickets) → F2 (landing page) → F3 (unified
   Jira-style board).

If the clock runs out partway through Section 6, that's fine — two
independently working dashboards, each showing off webcmd's PM-side
board reading and the BA side's LLM sentiment/spike pipeline, is already
a complete story to present.
