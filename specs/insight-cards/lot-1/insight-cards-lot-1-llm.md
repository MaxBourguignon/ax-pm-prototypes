--- BEGIN LLM SPEC ---

# SPEC: Insight Cards: Lot 1: Insights page and card builder (1a + 1b)

## Vision context (read first)
- Feature: Insight Cards (area: data analysis module, Business Analytics, under ARENAPulse)
- Overall context: Fanalists clients had Insight cards (key numbers on themed pages and their home page) but found them hard to build without CS. On the Arenametrix platform, any client user builds a card by hand or from plain text, with the AI filling in a segmentation-style builder.
- This lot unlocks the JTBD: 02 Build my own number (core), 01 See where I stand, 03 Compare with before, 04 Act on a lagging number, 05 Keep my Insights.
- This lot's scope: a new Insights page (tabs, card grid, Period + Comparison), a card builder side panel (by hand [1a] and by text [1b]), three card forms (number, ranked breakdown, per day), a definition on every card, and "Open as segment" to the Contacts list [1b].
- Fidelity: Clickable
- Full vision: specs/insight-cards/vision-spec.md

## Already built in prior lots: EXTEND, do not rebuild
> First lot: no prior lot code. This lot creates the feature folder.
> Proposed folder: src/features/InsightCards/ (confirm with the PM).
> Reuse from existing features: the segmentation filter logic and rows in
> src/features/Contacts/Contacts.jsx, the object picker AddFilterModal.jsx, and the
> drawer pattern in ContactFormDrawer.jsx. Object ids come from utils/dataObject.

## Goals (feature-wide)
1. A client user builds a correct card without CS, by hand in the builder or from plain text with the AI filling in the builder.
2. Every Fanalists Insight job cluster can be rebuilt, or the builder says clearly it cannot.
3. Cards rerun on open without AI cost.
4. From a card that counts people, the user opens that group as a segment in one click.

## Not in scope (this lot + future lots)
- Cards shown on Contacts > Overview or Sales > Salesboard (Lot 2).
- Target card with a progress bar (Lot 2).
- Interpretation, explanations or advice about a number (ARENAPulse, level 2).
- Custom dashboards, scheduled or shareable reports, benchmarks across clients.
- Personal boards per user (cards are per client account).
- Nested condition blocks inside the builder panel.

## User stories (this lot)

### Story 1: Build a card [1a + 1b]
- Role: client user (marketing or ticketing manager) · Action: describe a number in plain text, or build it by hand, and get a card to check and adjust · Outcome: no dependence on CS
- Reached via: Insights > "Make new card" (primary button) > side panel
- Acceptance criteria:
  - [1b] Text box "Describe your number" with a "Build" button at the top of the panel; on Build, source, conditions, measure, form, comparison and title are filled in.
  - [1b] Ambiguous readings: the most likely reading is chosen and shown as a flagged chip (orange) with the note "assumed, check this"; clicking the chip confirms or changes it. Only when no reading can be chosen, the panel asks one question back with options.
  - [1b] Data not held: a banner states what is missing and offers the nearest card it can build; no number is shown.
  - [1a] Without the text box, the same fields are filled by hand.
  - Every condition is a chip; the preview updates on every change.
  - Save to a chosen tab; the panel closes; the new card appears in that tab with a short highlight.
- States: Empty: preview "Add a source to see your number" · Error: "Couldn't build this card. Try other words or build it by hand." · Loading: builder skeleton + "Building your card..."

### Story 2: See my cards [1a]
- Role: client user · Action: open Insights and read cards for a chosen period vs. a comparison · Outcome: knows at a glance whether the club is on track
- Reached via: "Insights" entry in the sidebar (stands for the top menu)
- Acceptance criteria:
  - Period and Comparison selects at page level drive every card in the tab, immediately.
  - Card: title, value or chart, % change vs. comparison (green up, red down; no colour without a comparison), "Data as of 09:00".
  - (i) opens a popover: source, conditions, measure, "Created by [name], [date]".
  - Tabs: add ("+"), rename and reorder via a tab menu.
  - Card ⋮ menu: Edit (reopens the panel), Duplicate, Move to tab, Delete (confirmation modal).
- States: Empty: "No cards yet. Make your first card." with three example cards to add · Error: per card "Couldn't load this number." + Retry · Loading: card skeletons

### Story 3: Open as segment [1b]
- Role: client user · Action: open the people behind a card · Outcome: can act on a lagging number with a list and campaign
- Reached via: "Open as segment" link on cards whose measure is "Count people"
- Acceptance criteria:
  - Only on people-count cards.
  - Navigates to the Contacts list with the card's filter tree pre-filled and a banner "From card: [title]".
  - The header count equals the card's value; rows are a sample from contacts.json.
  - Save as list and campaign use the existing Contacts flow.
- States: Empty: n/a · Error: "Couldn't open this segment." + Retry · Loading: the Contacts list's own state

## Pages to build (this lot)
- **Insights** (NEW this lot): layout: grid page
  - header: PageHeader "Insights" + one primary Btn "Make new card"
  - tabs: themed tabs + "+" tab; tab menu for rename and reorder
  - period-bar: Period select (This season, This month, Last 7 days) + Comparison select (Last season, Same period last year, None)
  - grid: 3 columns, mixed heights; 1 column on narrow screens
  - card-number: big value, % change, "Data as of"
  - card-breakdown: top 5 + "Other", neutral grey bars, values
  - card-per-day: bar series (per week beyond 31 days), today's value, % change
  - card-chrome: title, (i) popover, ⋮ ActionMenu, "Open as segment" on people cards [1b]
  - states: empty tab, per-card error, per-card "No access to this data", per-card "No comparison data", skeletons via StatePreview
- **Card builder** (NEW this lot): layout: side panel (about 440px) over Insights, page dimmed behind
  - text-entry [1b]: textarea + Build; scripted responses for the 7 mock prompts
  - flagged-chip [1b]: orange chip + "assumed, check this"
  - refusal-banner [1b]: Banner with what is missing and a suggested card
  - ask-back [1b]: one question with 2 to 3 option chips
  - source: select of DATA_OBJECTS (contact, ticket, order, subscription, consumptions)
  - conditions: compact chips, one per line, AND between; click opens the existing filter row; "+ Add condition" opens AddFilterModal; max 6
  - measure: Count people, Count tickets, Sum of revenue
  - form: Number, Ranked breakdown, Per day
  - comparison: Use page comparison, None
  - title: text Field
  - preview: live card render
  - footer: tab select, Cancel, Save (primary)
- **Contacts list** (EXTENDS Contacts V3) [1b]
  - entry-banner: "From card: [title]" with a link back to Insights
  - prefilled-filters: the card's tree in the existing filter UI; header count from the card

## System-design decisions (resolved: implement these)
- Cards and tabs are per client account; every user sees and edits the same set; (i) shows creator and date.
- Building needs the same rights as the segmentation engine; a card on data the user cannot see shows "No access to this data".
- The panel closes via ✕, Cancel or click outside; with unsaved changes a "Discard changes?" confirmation.
- [1b] Build again after hand edits asks "Replace your changes?".
- Preview updates immediately; no submit step.
- Max 6 conditions in the panel; beyond: "Too many conditions for a card. Build a segment in Contacts first."
- Period and Comparison apply immediately, remembered per tab.
- No comparison history: show the value without % and "No comparison data".
- Ranked breakdown: top 5 + "Other". Per day up to 31 days, per week beyond.
- Caps: 10 tabs, 12 cards per tab; at the cap "Make new card" is disabled with a Tooltip.
- Delete card: confirmation Modal, removed at once, Toast "Card deleted". Delete a tab with cards: Modal with "Move cards to [tab]" or "Delete them too".
- Cards rerun on open without AI cost; "Data as of [time]" on each card.

## Mock data (this lot)
- **Account**: FC Demo (fictional French club) × 1; users: Camille Martin (Marketing manager), Hugo Lefebvre (Ticketing manager), Sarah Benali (CRM officer): edge cases: none
- **Tabs**: Season tickets, Renewals, Matchday, Partners (empty) × 4: edge cases: one empty tab
- **Cards**: title, form, sourceObj, conditions[], measure, comparison, value, previousValue, createdBy, createdAt, countsPeople × 12: one tab holds 12 (cap); edge cases: very long title ("Season ticket holders from Île-de-France who bought at least one away match ticket"), value 0, -38% trend, no comparison data, no access, load error, 1,234,567 total fans, revenue in €
- **Series**: date, value, valueLastYear × 31 days + 12 weeks: edge cases: a zero day (no match), a peak on the on-sale day
- **Breakdowns**: cities (Paris, Lyon, Lille, Marseille, Bordeaux, Other), ticket categories, sales channels (Online, Box office, Partner resale): edge cases: one label at 70%, one long label
- **AI prompts** × 7: (1) "season ticket holders who did not renew yet" → subscription, season 25/26 AND no 26/27 subscription ⚑, count people, number; (2) "tickets sold per day for the next home match" → ticket, next home match ⚑, count tickets, per day; (3) "where do our season ticket holders live" → subscription + contact city, count people, ranked breakdown; (4) "revenue this season vs. last season" → order, sum of revenue, number; (5) "new fans this month" → contact, created this month, count people, number; (6) "how many people watched us on TV" → refusal: TV audience not held, suggests "tickets sold per match"; (7) "our best fans" → ask back: "Best by: spending · matches attended · season ticket years"
- **Segment hand-off**: card "Not renewed yet" 1,284 → Contacts V3 with the same filters; header 1,284; rows: the 17 contacts.json records as a sample
Use realistic values; keep data consistent with prior lots (same contact/campaign keeps
its identity across screens and lots).

## Constraints
- Stack: Arenametrix design system · Accessibility: WCAG AA
- Performance: Good and scalable performance
- Copy language: English only.

## Flag, do not silently resolve
- B38: whether count tickets, sum of revenue and per-day series are possible in the segmentation engine. Build them in the prototype, mark them in the open-questions log.
- B6: comparison history. Show the "No comparison data" state on one card.
- IC5: "Insights" as a top-menu item is not agreed yet; the prototype uses a sidebar entry.
- Job 04 is inferred; "Open as segment" is to be validated with clients (C14).

---

## Agent instructions (prototype pipeline)

You are building this lot INTO the `ax-prototypes` Vite + React 19 repo as a feature —
NOT a standalone HTML file. Follow the design-system pipeline.

### Before you write a single line of code
1. Run **design-consistency** on this spec to get the Component Manifest (REUSE / EXTEND /
   BUILD-TO-DS / BUILD-CUSTOM). It scans the shared design system, this feature's prior-lot
   code, and the Figma DS (`nIMtO7v8dDamI8b2vnMcRc`) — including the Principles page's usage
   rules, which expand each spec element into its required companions.
2. Confirm the destination feature folder/file (Lot 1: ask the PM; lot ≥ 2: the existing folder).
3. Confirm every page in "Pages to build" maps to your plan, every acceptance criterion
   maps to a visible testable UI state, and all 3 edge states exist per major view.
4. Nothing from "Not in scope" is included. Open questions are surfaced as flags, not resolved.

### What to build
- A **page-only** React feature at `src/features/<Folder>/<File>.jsx` (no app shell —
  the nav/sidebar/header already exist and wrap every route).
- **Import** the design system — never redefine it: `{ DS, TY }` from `utils/designSystem`,
  `Ico` from `utils/icons`, and shared components from `components/*` (including the shared
  `PageHeader`, `Btn`, `Field`, `Controls`, `Tag`, `Card`, `Modal`, `Kpi`, `StatePreview`, …).
  Declaring a local `DS`/`TY`/`Ico` in a feature file is a hard failure.
- For lot ≥ 2: extend the existing feature files — reuse prior-lot screens/components/mock data.
- **Any component not already in `components/` is a PM decision.** Before building it,
  ask — once, batched, with a recommendation per item — whether to **build it** or leave
  a `<Placeholder/>` (a dashed labelled box that keeps the gap visible in the running
  prototype). Never silently invent a component or drop the element.
- **BUILD-TO-DS** items (not in code but specced in Figma — e.g. table `Cell`, `Tooltip`,
  `Tab`, `Breadcrumb`) are built from their Figma node, not improvised.
  **BUILD-CUSTOM** items (in neither — charts, timelines) use libs already in package.json
  (recharts/highcharts/tabulator-tables) and go in the open-questions log, since nothing in
  the DS backs them. New icons go in `utils/icons.jsx`, never inline.
- Follow the DS **usage rules** (`design-prototypes/references/usage-rules.md`): one Primary
  per view, Tooltip on every IconButton, confirmation modal on every Destructive action,
  Inputs wrapped in FormField, StatusChip (not Badge) for business status.
- Show all 3 edge states for every major view, driven by the shared `StatePreview` switcher.
- Mock data from the spec — realistic, consistent across screens and lots.
- All copy in English.

### Deliver alongside the prototype
**Artifact 1 — the feature file(s)** (page-only, importing the shared design system).
**Artifact 2 — Traceability report**
| Spec item | Story / criterion | Screen | Status |
|---|---|---|---|
[one row per acceptance criterion — Implemented / Partial / Missing]
**Artifact 3 — Open questions log**
| Gap or assumption | What was assumed | PM action needed? |
|---|---|---|

Then hand the feature file path + exported component name to **ship-prototype** (it wires
the route/sidebar/home-card — only for Lot 1, or only the new bits for later lots — then
builds and launches).

### Stop conditions
Do not build — stop and ask — if: this lot has no user stories; >30% of acceptance
criteria reference undefined terms; a page has no description; or this lot duplicates a
prior lot's screen without a stated difference.

--- END LLM SPEC ---
