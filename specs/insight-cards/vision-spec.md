# Insight Cards: Feature Vision

> **Product area:** Data analysis module (Business Analytics), under ARENAPulse · **PM:** Joost Mouw · **Quarter:** build Q4 2026 (dev sprint from November), live Q1 2027
> **Fidelity:** Clickable · **Date:** 2026-10-09

> ⚠ Agent notes: (1) the HubSpot AI report builder is described from general knowledge, check it before naming it on a slide; (2) KPI targets are open (C38); (3) the card model depends on B38 (can the segmentation engine do sums, ticket counts and series) and B6 (history for the comparison); (4) a new top-menu item needs Maxence's agreement (IC5); (5) "ARENAPulse" means both the AI product line and level 2 (IC4).

---

## 1. Context & struggle

On the Fanalists platform, clients see their key numbers as Insight cards, arranged over themed pages, and each client chooses which cards show on its home page so the main KPIs show on login. Clients get real value from them, but building them was hard: CS set up a default set at go-live and taught clients to build their own during onboarding, and afterwards both CS and clients found it complicated, and clients often did not understand it. Insights block the migration for 21 Fanalists clients and are "essential" for 7. Why now: the Fanalists clients need their Insights back on the Arenametrix platform, and with AI building a card from plain text, every client, Fanalists and AXG, can make and understand its own cards without CS.

**Struggle:** frequency, nobody knows yet. Severity high for migrating clients (no Insights, no migration); for the rest, cards that go stale because only CS can change them. Use stays light today: 62 of 88 rated Fanalists clients are light or minimal users.

## 2. The bet: value, KPIs & kill criteria

- **Core value moment:** on login the user sees, without CS, that a number lags (renewals, tickets per day vs. last year) and acts at once with a campaign to exactly that group, instead of noticing afterwards.
- **KPIs** (targets open, C38):
  1. Weekly card use: % of active clients where a user interacts with a card at least once a week (leading indicator; interaction, not views).
  2. Self-building: % of active clients that built at least 3 cards without CS.
  3. Correct numbers: % of AI-built cards matching the expected answer in the test set (IC1).
  4. Card to action: % of active clients per month starting a segment or campaign from a card.
  5. Value named: % of release clients who can name something they did because of a card.
- **Competes with:** for Fanalists clients, their old Insights (a forced switch; the migration removes them). For AXG clients, fixed pages (Contacts > Overview, Sales > Salesboard, the BA-pack dashboards): for them the cards are new, they can add their own metrics, which was not possible before.
- **Action path:** a card that counts people opens that group as a segment in one click, then list and campaign. A card is a segmentation-engine filter tree plus a measure, a shape and a comparison.

**Kill criteria:** (1) an integrated AI that builds a personal board from recent actions, live campaigns and tickets sold makes manual cards redundant. (2) Failure: after the Q1 2027 release, fewer than 1 in 4 release clients build cards themselves without CS, or the share of correct numbers in the test set stays below the bar.

## 3. Goals & guidelines

**Goals**

1. A client user builds a correct card without CS, by hand in the builder or from plain text with the AI filling in the builder.
2. Every Fanalists Insight job cluster can be rebuilt, or the builder says clearly it cannot (migration requirement).
3. Cards rerun on open without AI cost.
4. From a card that counts people, the user opens that group as a segment in one click.

**Not in scope (feature-wide)**

- Interpretation and advice (ARENAPulse, level 2).
- Custom dashboards and automatic reports (Pro dashboards, level 3).
- A scheduled, shareable report such as Racing 92's (candidate, D17).
- Benchmarks across clients (candidate, C39).
- Data Arenametrix does not hold.

**Guidelines**

- One builder, two entries: by hand as in the segmentation engine, or by text; an AI-built card opens in that builder to review, edit or save straight away.
- Never invent a number; refuse when the data is not there.
- Every card shows how its number is defined: source, conditions, measure.
- Colour only means something with a target or a comparison.
- The client chooses which cards show where: on the Insights page in Lot 1, on Contacts > Overview and Sales > Salesboard from Lot 2.

## 4. High-level JTBDs

**01. See where I stand.** When I log in, especially during a sales period, I want my key numbers in view so that I know at a glance whether we're on track, without asking anyone.
_Evidence: observed (Fanalists Start page cards, Insights use in the migration sheet)_

**02. Build my own number.** When I have a question about my fans that no card answers yet, I want to describe it in my own words and get a card, so that I don't depend on CS.
_Evidence: observed (Fanalists, CS dependency) · core job · feels: "I'm in control of my own numbers"; seen as the one who has the numbers ready in the management meeting_

**03. Compare with before.** When I look at a number, I want to see it against the same period last year so that I know whether it's good or bad.
_Evidence: observed (AXG CS and Sales)_

**04. Act on a lagging number.** When a number lags, I want to open exactly that group and send them a campaign, so that I can still turn it around.
_Evidence: inferred; validate first in client conversations (C14)_

**05. Keep my Insights through the migration.** When we move to the Arenametrix platform, I want my existing cards to be there, so that my routine reporting doesn't break.
_Evidence: observed (Fanalists migration blocker, 21 clients)_

**06. Track progress to a target.** When a season or campaign has a target, I want a card that shows progress towards it, so that I see how far we are.
_Evidence: inferred (HOS "insights targets", the Fanalists "Main Targets" tab). Not in the top 5 for the slide, but in the feature_

## 5. Structure vision

**Current pages:** (1) Fanalists "Inzichten" page and Start page, the model; (2) AX Contacts > Overview, fixed widgets; (3) AX Sales > Salesboard, a fixed KPI row with Period and Comparison pickers. Screenshots in `projects/insight-cards/current_insights/` (umbrella repo).

- **Keep:** Fanalists themed tabs, "+" for a tab, "Make new card", three card forms (number, ranked breakdown, short series per day); the AX Salesboard number card (big number, % change, label, link, where the link becomes "Open as segment"); the AX Period + Comparison picker at page level, driving every card's comparison; the AX white card grid with title and (i), where the (i) shows the definition.
- **Likes:** calm; a number, a title, a subtitle.
- **Fixing:** AX pages are fixed, clients cannot add their own number; building was hard (Fanalists); similar cards disagree and definitions are hidden; green/red bars read as good vs. bad; "Main Targets" without targets; technical labels and ISO dates.

**Inspirations:**

- **HubSpot AI report builder:** question in plain text, AI picks source, fields, filters and chart, preview, edit in the normal editor, pin. Leave its report and dashboard depth (level 3).
- **AX segmentation engine:** the clear source per block and the visible parameters and conditions; the same view whether a card is built by hand or by AI, so every card can be checked.
- **AX Salesboard:** the number card and Period + Comparison at page level.

**Structure.** "Insights" is its own item in the AX top menu, because cards span contacts, ticketing and other data. The page has tabs per theme (add, rename, reorder), a page bar with Period, Comparison and "Make new card", and a card grid (3 columns, mixed heights). A card shows its title, its number or chart, the % change vs. the comparison, an (i) with its definition, "Open as segment" on cards that count people, and a menu (edit, duplicate, move to tab, delete). Card forms: number, ranked breakdown, per day, and target with progress bar. The builder is a side panel over the page, so the other cards stay in view: (1) a text box "Describe your number", whose answer the AI turns into the steps below; (2) source; (3) conditions as segmentation-engine blocks and chips; (4) measure, form, comparison, optional target; (5) live preview; (6) save to tab.

```
Top menu: Contacts · Campaigns · Sales · ... · Insights
                                                  │
  Insights page ── tabs ── card grid ── card (i) definition
       │                                   │
       │                                   └─ Open as segment ─> Contacts list
       │                                                          ─> Lists ─> Campaigns
       └─ "Make new card" ─> Builder side panel
                               text ─> AI fills ─> source · conditions ·
                               measure · form · comparison ─> preview ─> save

  Lot 2:   card "Show on" ─> Contacts > Overview / Sales > Salesboard ("My cards")
  Later:   shareable scheduled report (D17) · benchmarks (C39)
  Level 2: ARENAPulse, "explain this card"
  Level 3: Pro dashboards (Looker replacement)
```

## 6. Lot roadmap

| Lot | JTBD (job this lot unlocks) | Impact | Key features |
|-----|-----------------------------|--------|--------------|
| Lot 1a | 02 Build my own number (by hand), 01, 03, 05 | High: the foundation the AI fills later; CS can already rebuild Fanalists cards for the migration; the team can start in November without waiting for IC1 or B38 | Insights page in the top menu, tabs, card grid · builder side panel by hand (segmentation blocks) · forms: number, breakdown, per day · Period + Comparison · definition (i) on every card |
| Lot 1b | 02 Build my own number (in my own words), 04 Act on a lagging number | High: completes the core job | Text entry where the AI fills the builder · Open as segment |
| Lot 2 | 01 See where I stand (on login), 06 Track progress to a target | High: cards seen where clients land | "Show on" Contacts > Overview / Sales > Salesboard ("My cards" row) · target card with progress bar |
| Candidates | No V5 job yet | Low/Med, rough | Shareable scheduled report (D17) · sector benchmarks (C39) |

Lots 1a and 1b together are the Q1 2027 release. Risk: until Lot 2, Fanalists clients do not see their cards on login; whether that holds up their migration depends on IC6.

## 7. Constraints (inherited by every lot)

Stack: Arenametrix design system · Accessibility: WCAG AA · Performance: good and scalable performance
