# Insight Cards Lot 1: prototype report

Built 2026-10-09 on branch `insight-cards`. Route `/insights`; sidebar section "Insights"; Home card "Insight Cards".

Files: `ax-prototypes/src/features/InsightCards/` (`InsightCards.jsx` page, `InsightCard.jsx` card and forms, `CardBuilder.jsx` side panel, `format.js`, `mockData.js`). Touched: `App.jsx` (route), `layout/Header/SideBar.jsx` (section), `pages/HomePage.jsx` (card), `features/Contacts/Contacts.jsx` (arrival from a card).

Checked with a scripted click-through in headless Chrome: all steps below pass; no errors from the new code (two existing `fill-rule`/`clip-rule` warnings come from `utils/icons.jsx`). Lint is clean on the new files; `Contacts.jsx` keeps one existing lint error (`selectedContact` unused, line 1036), not introduced here.

## Traceability

| Spec item | Story / criterion | Screen | Status |
|---|---|---|---|
| Text box + Build fills source, conditions, measure, form, comparison, title | Story 1 [1b] | Card builder | Implemented (scripted for 7 prompts) |
| Ambiguity: flagged chip "assumed, check this", confirm or change | Story 1 [1b] | Card builder | Implemented; save is blocked until confirmed |
| Ask back only when no reading can be picked | Story 1 [1b] | Card builder | Implemented ("our best fans") |
| Refusal names what is missing and the nearest card | Story 1 [1b] | Card builder | Implemented ("watched us on TV") |
| Build by hand, step by step | Story 1 [1a] | Card builder | Implemented |
| Conditions as chips, editable; live preview | Story 1 | Card builder | Implemented (chip edits inline, see Q3) |
| Save to a chosen tab, card appears at once | Story 1 | Insights | Implemented, with highlight and toast |
| Empty / error / loading in the builder | Story 1 | Card builder | Implemented |
| Period + Comparison drive every card, per tab | Story 2 | Insights | Implemented |
| % change, colour only with a comparison | Story 2 | Insights | Implemented; bars neutral |
| (i) definition with source, conditions, measure, creator | Story 2 | Insights | Implemented as a fold-open section |
| Tabs: add, rename, reorder, delete with move-or-delete | Story 2 | Insights | Implemented |
| Card menu: edit, duplicate, move to tab, delete with confirmation | Story 2 | Insights | Implemented |
| Empty tab with example cards; per-card error + Retry; skeletons | Story 2 | Insights | Implemented (StatePreview for page states) |
| No access, no comparison data, value 0, long title, big number | Edge cases | Insights | Implemented (Renewals, Matchday tabs) |
| Caps: 10 tabs, 12 cards per tab | L3 | Insights | Implemented (Matchday at the cap) |
| Open as segment only on people-count cards | Story 3 [1b] | Insights | Implemented |
| Contacts opens with the card's filters, banner, count | Story 3 [1b] | Contacts | Implemented; rows are sample data |
| Unsaved changes: "Discard changes?"; rebuild: "Replace your changes?" | L3 | Card builder | Implemented |

## Open questions and assumptions

| Gap or assumption | What was assumed | PM action needed? |
|---|---|---|
| Q1. Per-day chart (recharts) has no DS node | Built custom in brand blue, no axes, tooltip on hover | Yes: Maxence or a designer to add a chart pattern to the DS |
| Q2. Ranked breakdown bars have no DS node | Built custom, neutral grey bars styled like KpiCard progress rows | Yes: as Q1 |
| Q3. Flagged condition chip has no DS node | Warning-tone chip with a warning icon; editing is an inline text field, not the Contacts filter row | Yes: confirm the inline edit is enough for the demo; the real builder opens the filter row |
| Q4. The AI is scripted | 7 prompts by keyword; any other text gives "Couldn't build this card" | No, for the demo. The live builder depends on IC1 (test set) |
| Q5. "Insights" is a sidebar section, not a top-menu item | The prototype shell has a sidebar; the spec says top menu (IC5) | Agree IC5 with Maxence |
| Q6. Contacts filter mapping | Card conditions are written into "Plan name contains ..." filter rows under a subscription anchor | No: illustrative only |
| Q7. B38 and B6 | Count tickets, sum of revenue, per-day series and comparisons are shown as if the engine supports them | Yes: answer B38 and B6 before build |
| Q8. Builder textarea height | The shared TextArea has a 120px minimum, taller than the 2 rows intended | No |
