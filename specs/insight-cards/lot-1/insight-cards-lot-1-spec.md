# Insight Cards: Lot 1: Insights page and card builder (1a + 1b)

> **Product area:** Data analysis module (Business Analytics), under ARENAPulse · **PM:** Joost Mouw · **Fidelity:** Clickable
> **Date:** 2026-10-09 · **Vision:** `specs/insight-cards/vision-spec.pdf`

> ⚠ Agent notes: (1) the measures "count tickets" and "sum of revenue" and the per-day series depend on B38 (can the segmentation engine do them); (2) the comparison depends on B6 (history); (3) "Insights" as a top-menu item needs Maxence's agreement (IC5); in the prototype it is a sidebar entry; (4) the AI behaviour in the prototype is scripted for 7 prompts, not a live model.

## 1. Lot scope

**This lot unlocks:** 02 Build my own number (by hand in 1a, in my own words in 1b), 01 See where I stand, 03 Compare with before, 04 Act on a lagging number (1b), 05 Keep my Insights.

Specced as one round covering Lot 1a and Lot 1b; each story is tagged. The development order stays 1a, then 1b; both are in the Q1 2027 release.

- **1a:** "Insights" in the AX top menu; tabs per theme (add, rename, reorder); card grid; page bar with Period, Comparison and "Make new card"; card builder as a side panel, by hand (source, conditions, measure, form, comparison, live preview, save to tab); card forms number, ranked breakdown, per day; (i) definition on every card; card menu (edit, duplicate, move to tab, delete).
- **1b:** text entry where the AI fills the builder, with flagged assumptions and refusals; "Open as segment".
- **Not in this lot:** cards on Contacts > Overview and Sales > Salesboard, and the target card with a progress bar (Lot 2).

**Builds on prior lots:** first lot, vision only.

## 2. Goals & guidelines (feature-wide, for context)

1. A client user builds a correct card without CS, by hand in the builder or from plain text with the AI filling in the builder.
2. Every Fanalists Insight job cluster can be rebuilt, or the builder says clearly it cannot.
3. Cards rerun on open without AI cost.
4. From a card that counts people, the user opens that group as a segment in one click.

**Not in scope:** interpretation and advice (ARENAPulse, level 2); custom dashboards and automatic reports (level 3); a scheduled, shareable report (D17); benchmarks across clients (C39); data Arenametrix does not hold.

**Guidelines:** one builder, two entries; never invent a number, refuse when the data is not there; every card shows how its number is defined; colour only means something with a target or comparison; the client chooses which cards show where.

## 3. User stories (this lot)

Role for all stories: a client user, a marketing or ticketing manager at a club or venue.

**Story 1 [1a + 1b]: build a card**

| Field | Value |
|----|----------------|
| As a… | client user |
| I want to… | describe a number in my own words, or build it by hand, and get a card I can check and adjust |
| So that… | I don't depend on CS (job 02; KPIs self-building, correct numbers) |
| Reached via | Insights > "Make new card" > side panel |
| Acceptance criteria | [1b] a text box on top; on "Build" the AI fills source, conditions, measure, form and comparison in the builder; [1b] when a reading is ambiguous, the AI picks the most likely one and marks it as a flagged chip "assumed, check this"; it asks back only when it cannot pick at all; [1a] without the text box, the user builds the same card by hand, step by step; every condition is an editable chip and the preview updates on every change; [1b] when the data is not there, the AI says what is missing and names the nearest card it can build, and never invents a number; save to a chosen tab, and the card appears there at once |
| Happy path | Make new card → type "season ticket holders who did not renew yet" → the builder fills, preview shows 1,284 → confirm the flagged chip → save to tab "Renewals" |
| Empty / Error / Loading | Preview "Add a source to see your number" / "Couldn't build this card. Try other words or build it by hand." / builder skeleton and "Building your card..." |

**Story 2 [1a]: see my cards**

| Field | Value |
|----|----------------|
| As a… | client user |
| I want to… | open Insights and see my cards for the period I pick, against an earlier period |
| So that… | I know at a glance whether we're on track (jobs 01, 03, 05; KPI weekly card use) |
| Reached via | Top menu > Insights |
| Acceptance criteria | Period and Comparison at page level drive every card; each card shows title, number or chart and % change vs. the comparison, with colour only when there is a comparison; the (i) shows the definition in plain words (source, conditions, measure, created by and when); tabs can be added, renamed and reordered; the card menu offers edit, duplicate, move to tab and delete |
| Happy path | Insights → tab "Season tickets" → Period "This season", Comparison "Last season" → read the cards → open (i) on one card |
| Empty / Error / Loading | "No cards yet. Make your first card." with three example cards / per card "Couldn't load this number. Retry." / card skeletons in the grid |

**Story 3 [1b]: open as segment**

| Field | Value |
|----|----------------|
| As a… | client user |
| I want to… | open the people behind a card as a segment |
| So that… | I can act on a number that lags (job 04, validate first, C14; KPI card to action) |
| Reached via | A card that counts people > "Open as segment" |
| Acceptance criteria | Only on cards that count people; opens the contacts list with the same filter tree and a banner "From card: [title]"; the count matches the card; from there the existing flow: save as list, campaign |
| Happy path | Card "Not renewed yet: 1,284" → Open as segment → contacts list, 1,284 → save as list → campaign |
| Empty / Error / Loading | n/a / "Couldn't open this segment. Retry." / the contacts list's own loading state |

## 4. Pages (this lot)

| Page | New or extends | Layout | Components & behaviour |
|---|---|---|----------------|
| Insights | New | Grid page | nav: "Insights" in the top menu (prototype: sidebar entry); header: title + primary "Make new card"; tabs: themed, "+" adds one, rename and reorder via the tab menu; period-bar: Period + Comparison drive every card; grid: 3 columns, mixed heights; card: title, (i) definition popover, ⋮ menu (edit, duplicate, move to tab, delete with confirmation), body by form (number with % change; ranked breakdown with neutral bars; per day with bars and today's value), "Data as of [time]"; open-as-segment [1b]: only on people-count cards; states: empty tab, per-card error with Retry, skeletons |
| Card builder | New | Side panel (about 440px) over Insights | text-entry [1b]: "Describe your number" + "Build", fills every step; assumptions as flagged chips; refusal banner [1b]; source [1a]; conditions: compact chips, one per line; clicking a chip opens the existing Contacts filter row; "+ Add condition" opens the existing object picker (AddFilterModal); measure: count people, count tickets, sum of revenue; form: number, ranked breakdown, per day; comparison: page comparison or none; title; live preview; footer: tab picker, Cancel, Save; save closes the panel and highlights the new card; edit reopens the same panel |
| Contacts list | Extends Contacts V3 [1b] | Existing list page | entry from "Open as segment": filters pre-filled with the card's tree, banner "From card: [title]", count matches the card; save as list and campaign as today |

## 5. System-design decisions (this lot)

- Cards and tabs are per client account: every user of the client sees the same tabs and can edit them; the (i) shows "Created by [name], [date]". Personal boards are a later lot.
- Building needs the same rights as the segmentation engine; a card on data a user cannot see shows "No access to this data".
- The panel closes via ✕, Cancel or click outside; with unsaved changes, a "Discard changes?" confirmation.
- [1b] "Build" again after hand edits asks "Replace your changes?"; the new text overwrites the builder.
- The preview updates immediately on every change.
- Max 6 conditions in the panel; beyond that: "Too many conditions for a card. Build a segment in Contacts first." Nested blocks stay out of the panel.
- Period and Comparison update every card immediately, without a reload; the choice is remembered per tab.
- No history for the comparison: the card shows the number without % and "No comparison data".
- Ranked breakdown: top 5 + "Other". Per day: up to 31 days per day, beyond that per week automatically.
- Caps: max 10 tabs, max 12 cards per tab; at the cap "Make new card" is disabled with a tooltip.
- Delete card: confirmation modal, disappears at once, toast "Card deleted". Delete a tab with cards: the modal offers "Move cards to [tab]" or "Delete them too".
- Cards rerun on page open, without AI cost; each card shows "Data as of [time]" from the last data sync.

## 6. Mock data (this lot)

All data belongs to a fictional French club, **FC Demo** (season tickets, matches, fans in Paris, Lyon, Lille and elsewhere), so it resembles no real client.

| Entity | Key fields | Volume | Edge cases |
|----|--------|---|--------|
| Account and users | client name; users: name, role | 1 account, 3 users | Needed for "Created by" |
| Tabs | name, order, period and comparison per tab | 4 | One empty tab |
| Cards | title, form, source (DATA_OBJECTS id), conditions, measure, comparison, value, previous value, created by and at, counts people yes/no | 12 (one tab at the cap) | Very long title; value 0; -38% trend; no comparison data; no access; load error; 1,234,567; revenue in € |
| Series | date, value, value same period last year | 31 days and 12 weeks | A zero day (no match); a peak on the on-sale day |
| Breakdowns | label, value | 3 (cities, ticket categories, channels), top 5 + Other | One label at 70%; one long label |
| AI prompts (scripted) | text, expected builder fill, flagged assumptions | 7 | 3 clean; 2 with a flagged assumption; 1 refusal (data not held); 1 that asks back; taken from the Fanalists Insights list (IC1), in English |
| Segment hand-off | card filter tree mapped to Contacts V3 filters, count | 1 | The card says 1,284 while contacts.json has 17 rows: the header shows the card's count, the rows are a sample |

## 7. Constraints

| Constraint | Value |
|----|----------|
| Stack | Arenametrix design system |
| Accessibility | WCAG AA |
| Performance | Good and scalable performance |
| Other | None |

## 8. Validate before build

- Job 04 "Act on a lagging number" is inferred: test "Open as segment" in client conversations first (C14).
- B38: whether the segmentation engine can count tickets, sum revenue and return a series per day. If not, Lot 1a ships with "count people" only.
- B6: whether history exists for the comparison.
- IC6: whether an Insights page without cards on Overview and Salesboard lifts the "Looker / Insights" migration blocker.
