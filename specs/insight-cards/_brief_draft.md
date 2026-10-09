# Insight Cards: vision brief (working draft, specs-builder interview)

Running record of the answers locked so far, so the interview survives a break. Compiled into the vision document by specs-docs at the end.

## V1 Information (locked)
Feature: Insight Cards · Module: data analysis module (Business Analytics), under ARENAPulse · PM: Joost Mouw · Quarter: build Q4 2026 (sprint from November), live Q1 2027 · Fidelity: clickable

## V2 Context & struggle (locked 2026-10-09)
On the Fanalists platform, clients see their key numbers as Insight cards, arranged over themed pages, and each client chooses which cards show on its home page so the main KPIs show on login. Clients get real value from them, but building them was hard: CS set up a default set at go-live and taught clients to build their own during onboarding, and afterwards both CS and clients found it complicated, and clients often did not understand it. Use stays light (62 of 88 rated clients are light or minimal users). Insights block the migration for 21 clients and are "essential" for 7. Why now: the Fanalists clients need their Insights back on the Arenametrix platform, and with AI building a card from plain text, every client, Fanalists and AXG, can make and understand its own cards without CS.
Struggle: frequency nobody knows yet · severity high for migrating clients (no Insights, no migration); for the rest, cards that go stale because only CS can change them.

## V3 The bet (locked 2026-10-09)
- Core value moment: on login the user sees, without CS, that a number lags (renewals, tickets per day vs. last year) and acts at once with a campaign to exactly that group, instead of noticing afterwards.
- KPIs: (1) weekly card use, % of active clients where a user interacts with a card at least once a week (leading indicator; interaction, not views, since cards sit on the home page); (2) self-building, % of active clients that built at least 3 cards without CS; (3) correct numbers, % of AI-built cards matching the expected answer in the test set (IC1); (4) card to action, % of active clients per month starting a segment or campaign from a card; (5) value named, % of release clients who can name something they did because of a card. Targets open (C38).
- Competes with: Fanalists clients, their old Insights (forced switch, the migration removes them). AXG clients, fixed BA-pack dashboards: for them the cards are new, they can add their own metrics and see them on their home page, which was not possible before.
- Action path: a card that counts people opens that group as a segment in one click, then list and campaign. In Lot 1. Card = segmentation-engine filter tree + measure + shape + comparison (conditional on B38, B6).
- Kill criteria: an integrated AI that builds a personal board from recent actions, live campaigns and tickets sold makes manual cards redundant. Second, failure criterion (locked): after the Q1 2027 release, fewer than 1 in 4 release clients build cards themselves without CS, or the share of correct numbers in the test set stays below the bar.

## V4 Goals, guidelines & non-goals (locked 2026-10-09)
Goals: (1) a client user builds a correct card without CS, by hand in the builder or from plain text with the AI filling in the builder; (2) every Fanalists Insight job cluster can be rebuilt, or the builder says clearly it cannot (migration requirement); (3) cards rerun on open without AI cost; (4) from a card that counts people, the user opens that group as a segment in one click.
Not in scope: interpretation and advice (ARENAPulse, level 2); custom dashboards and automatic reports (Pro, level 3); a scheduled, shareable report such as Racing 92's (later, D17); benchmarks across clients (C39); data Arenametrix does not hold.
Guidelines: one builder, two entries (by hand as in the segmentation engine, or by text; an AI-built card opens in that builder to review, edit or save straight away); never invent a number, refuse when the data isn't there; every card shows how its number is defined; colour only means something with a target or comparison; the client chooses which cards show where (on the Insights page in Lot 1; on Contacts > Overview and Sales > Salesboard from version 2, see V6).
- Two ways to build, one builder: by hand as in the segmentation engine, or in plain text with the AI filling in the builder; then review and edit, or save straight away.

## V5 JTBDs (core job locked 2026-10-09, emotional line pending)
01 See where I stand (home page, on track at a glance) · observed (FNL)
02 Build my own number (own words, no CS) · observed (FNL) · CORE JOB (Joost)
03 Compare with before (vs. same period last year) · observed (AXG)
04 Act on a lagging number (open group, campaign) · inferred, validate first
05 Keep my Insights through the migration · observed (FNL)
06 Track progress to a target (goal with a progress bar) · inferred (HOS "insights targets", "Main Targets" tab); not in the top 5 for the slide, but in the feature (Joost)
V5 locked 2026-10-09: emotional line for 02 'I'm in control of my own numbers' (not dependent on CS; seen as the one who has the numbers ready in the management meeting). 04 stays in Lot 1, first to validate in client conversations (C14).

## V6 Step A: current pages and placement (locked 2026-10-09)
Current pages: (1) Fanalists "Inzichten" page + Start page, the model; (2) AX Contacts > Overview, fixed widgets; (3) AX Sales > Salesboard, fixed KPI row with Period + Comparison pickers. Screenshots in `projects/insight-cards/current_insights/` (umbrella repo).
Placement: "Insights" as its own item in the AX top menu (Contacts, Campaigns, Sales, ..., Insights), because cards span contacts, ticketing and other data. Same shape as the Fanalists "Inzichten" page: themed tabs, "+" for a tab, "Make new card". A full Insights page, not half, because Insights is a migration blocker for 21 Fanalists clients.
Version 2: per card "Show on" Contacts > Overview and/or Sales > Salesboard, as a "My cards" row on top. Not in Lot 1 because those pages are hardcoded today; must be added (Joost).
Keep: Fanalists themed tabs, "+", "Make new card", three card forms (number, ranked breakdown, short series per day); AX Salesboard number card (big number, % change, label, "details >>", which becomes "Open as segment"); AX Period + Comparison picker at page level, driving every card's comparison; AX white card grid with title + (i), the (i) shows the definition.
Likes: calm, a number, a title, a subtitle.
Fixing: AX pages are fixed, no own numbers; building was hard (Fanalists); similar cards disagree and definitions are hidden; green/red bars read as good vs. bad; "Main Targets" without targets; technical labels and ISO dates.

## V6 Step B: inspirations (locked 2026-10-09)
- HubSpot AI report builder: take the flow question in plain text, AI picks source, fields, filters and chart, preview, edit in the normal editor, pin. Leave its report and dashboard depth (level 3). Joost likes the look; details as I know them, to be checked before naming it on a slide.
- AX segmentation engine: take the clear source per block and the visible parameters and conditions (Joost: you see exactly which source you fish from and what you select on); the same view whether built by hand or by AI, so every card can be checked.
- AX Salesboard: take the number card (big number, % change, label, link) and Period + Comparison at page level.

## V6 Step C: structure and whole-product map (locked 2026-10-09)
Top menu > Insights: tabs per theme (add, rename, reorder); page bar with Period, Comparison, "Make new card"; card grid (3 columns, mixed heights). Card: title, number or chart, % change vs. comparison, (i) definition, "Open as segment" on people cards, menu (edit, duplicate, move to tab, delete). Card forms: number, ranked breakdown, per day, target with progress bar.
Builder: a side panel over the page (Joost, chosen over a modal or a full page): 1 text box "Describe your number" (AI fills the steps below), 2 source, 3 conditions as segmentation-engine blocks/chips, 4 measure, form, comparison, optional target, 5 live preview, 6 save to tab.
Whole-product map: Lot 1 Insights page, builder (hand + text), card forms, comparison, definition, Open as segment, then the existing Contacts list, Lists and Campaigns. Version 2: "Show on" Contacts > Overview / Sales > Salesboard. Later: shareable scheduled report (D17), benchmarks (C39). Level 2 ARENAPulse: explain this card. Level 3 Pro dashboards.

## V7 Lot roadmap (locked 2026-10-09)
- Lot 1a (Q1 2027 release, dev from November): jobs 02 (by hand), 01, 03, 05 · High, the foundation the AI fills later, and CS can already rebuild Fanalists cards for the migration · Insights page in the top menu with tabs and card grid; builder side panel by hand (segmentation blocks); forms number, breakdown, per day; Period + Comparison; definition (i) on every card.
- Lot 1b (same Q1 2027 release): jobs 02 (in own words) and 04 · High, completes the core job · text entry where the AI fills the builder; Open as segment.
- Lot 2: jobs 01 on login and 06 · High, cards seen where clients land · "Show on" Contacts > Overview / Sales > Salesboard ("My cards" row); target card with progress bar.
- Candidates, not a lot (no V5 job yet): shareable scheduled report (D17), sector benchmarks (C39).
Risk: until Lot 2, Fanalists clients do not see their cards on login; whether that holds up the migration depends on IC6.

# LOT 1 (1a + 1b in one spec round)

## L0 Lot framing (locked 2026-10-09)
Lot 1: Insights page, card builder by hand and by text. Specced as one round covering Lot 1a and 1b, each story tagged 1a or 1b, so the prototype and the 14 October demo show the AI route (Joost). Dev order stays 1a then 1b.
Unlocks: 02 Build my own number (by hand 1a, in own words 1b), 01 See where I stand, 03 Compare with before, 04 Act on a lagging number (1b), 05 Keep my Insights.
Scope 1a: Insights in the AX top menu; tabs per theme (add, rename, reorder); card grid; page bar with Period + Comparison and "Make new card"; builder side panel by hand (source, conditions as segmentation-engine blocks, measure, form, comparison, live preview, save to tab); forms number, ranked breakdown, per day; (i) definition on every card; card menu (edit, duplicate, move to tab, delete).
Scope 1b: text entry where the AI fills the builder; Open as segment.
Not here: Show on Overview/Salesboard and target card (Lot 2).
Builds on: vision only, first lot.

## L1 User stories (locked 2026-10-09)
Role for all: client user, a marketing or ticketing manager at a club or venue.
Story 1 [1a + 1b] Build a card: describe a number in my own words, or build it by hand, and get a card I can check and adjust, so that I don't depend on CS. Via Insights > "Make new card" > side panel. Serves 02, KPIs self-building and correct numbers. Acceptance: [1b] text box on top, AI fills source, conditions, measure, form, comparison; [1a] same card by hand step by step; every condition an editable chip, preview updates live; [1b] no data: AI says so and names what it can do instead, never invents a number; save to a chosen tab, card appears at once. Ambiguity (Joost, option A): the AI picks the most likely reading and marks its assumptions as highlighted chips "assumed, check this"; it only asks a question when it cannot pick at all. Happy path: Make new card, type "season ticket holders who did not renew yet", builder fills, preview 1,284, adjust a chip, save to tab "Renewals". Empty: preview "Add a source to see your number". Error: "Couldn't build this card. Try other words or build it by hand." Loading: builder skeleton + "Building your card...".
Story 2 [1a] See my cards: open Insights and see my cards for the chosen period against an earlier one. Via top menu > Insights. Serves 01, 03, 05, KPI weekly card use. Acceptance: Period + Comparison drive every card; title, number or chart, % change, colour only with a comparison; (i) definition in plain words; tabs add/rename/reorder; card menu edit/duplicate/move/delete. Empty: "No cards yet. Make your first card." + examples. Error per card: "Couldn't load this number. Retry." Loading: card skeletons.
Story 3 [1b] Open as segment: from a people-count card open the same filter tree in the contacts list; count matches; then the existing list and campaign flow. Serves 04 (validate first, C14), KPI card to action. Error: "Couldn't open this segment. Retry." Loading: the contacts list's own state.

## L2 Page structure (locked 2026-10-09)
Sketch: `mockup-l2.html` (static, mock data; not the prototype).
A. Insights, grid page, NEW. Nav: "Insights" in the top menu (prototype: sidebar entry). Tabs per theme, "+" adds one, rename/reorder via tab menu. Period + Comparison bar drives every card; % change and colour only from the comparison. Card: title, (i) definition popover (source, conditions, measure), ⋮ menu (edit, duplicate, move to tab, delete with confirmation); body by form: number, ranked breakdown (neutral bars), per day (bars + today). [1b] "Open as segment" only on people-count cards. States: empty tab "No cards yet. Make your first card." with 3 example cards; per-card error + Retry; skeleton cards.
B. Card builder, side panel (~440px) over A, NEW. [1b] text box "Describe your number" + Build, fills every step; assumptions as flagged chips "assumed, check this", click to confirm or change. [1b] refusal banner names what is missing and offers the nearest card it can build. [1a] Source; Conditions shown compactly as chips, one per line; clicking a chip opens the existing Contacts filter row to edit; "+ Add condition" opens the existing object picker (AddFilterModal). Nested blocks stay out of the panel: for that, build a segment in Contacts first (Joost agreed). Measure: count people, count tickets, sum of revenue. Form: number, ranked breakdown, per day. Comparison: page comparison or none. Title. Live preview. Footer: tab picker, Cancel, Save; save closes the panel and highlights the new card; edit reopens the same panel.
C. Contacts list, EXTENDS Contacts V3 [1b]. From "Open as segment": list opens with the card's filter tree pre-filled and a banner "From card: <title>"; count matches the card; save as list and campaign as today.

## L3 Design decisions (locked 2026-10-09)
1. Cards and tabs are per client account (Joost: "per klant"): every user of the client sees the same tabs and can edit them; the (i) shows "Created by <name>, <date>". Personal boards are a later lot.
2. Building needs the same rights as the segmentation engine; a card on data a user cannot see shows "No access to this data".
3. Panel closes via ✕, Cancel or click outside; with unsaved changes a "Discard changes?" confirmation.
4. [1b] "Build" again after hand edits asks "Replace your changes?"; the new text overwrites the builder.
5. Preview updates immediately on every change.
6. Max 6 conditions in the panel; beyond that "Too many conditions for a card. Build a segment in Contacts first."
7. Period + Comparison update every card immediately, no reload; remembered per tab.
8. No history for the comparison (B6): the card shows the number without % and "No comparison data".
9. Ranked breakdown: top 5 + "Other". Per day: up to 31 days per day, beyond that per week automatically.
10. Caps: max 10 tabs, max 12 cards per tab; at the cap "Make new card" is disabled with a tooltip.
11. Delete card: confirmation modal, disappears at once, toast "Card deleted". Delete a tab with cards: modal offers "Move cards to <tab>" or "Delete them too".
12. Cards rerun on page open (no AI cost); each card shows "Data as of <time>" from the last data sync.

## L4 Mock data (locked 2026-10-09)
Client: a fictional French club "FC Demo" (season tickets, matches, cities Paris, Lyon, Lille...), so the French audience recognises it and it resembles no real client (Joost).
Account x1, users x3 (for "Created by"). Tabs x4, one empty. Cards x12 (one tab at the cap) with edge cases: very long title, value 0, -38% trend, no comparison data, no access, load error, 1,234,567, revenue in €. Series per day (31) and per week (12) with last-year values; a zero day and an on-sale peak. Breakdowns x3 (cities, ticket categories, channels), top 5 + Other, one dominant label, one long label. AI prompts x7 scripted from the Fanalists Insights list (IC1), in English: 3 clean, 2 with a flagged assumption, 1 refusal, 1 that asks back. Segment hand-off x1: card count in the Contacts header, contacts.json's 17 rows as a sample.
