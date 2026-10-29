# Acquisition — LLM Spec

## Feature
- **Name:** Acquisition
- **Module:** Contacts
- **Fidelity:** Clickable prototype
- **Scope:** Dashboard only (no per-contact view, no app shell — page only)

## Problem / context
Marketing managers need to understand **where their CRM contacts come from**. Today
acquisition source is scattered and not visualised. This page answers "where do our
contacts come from?" keyed on **contact creation date**, at three levels of
granularity, with evolution over time.

## Goals
1. Show total contacts acquired in a date range, broken down by source.
2. Let the user see acquisition at two granularities: source **type** (bucket) and
   source **name** (specific origin).
3. Show how acquisition **evolves over time**, stacked by source type.
4. Filterable by date range and by source type, with no page reload.

## Not in scope
- Per-contact collection-point detail (lives on the contact profile page).
- Editing / importing contacts from this page.
- Any action/CTA on a contact.

## Source taxonomy (two levels)
- **Source type** (high-level bucket): Datasource, Forms (Brevo), Manual.
- **Source name** (specific origin within a type):
  - Datasource → Vivenu, GVS (ticketing platforms)
  - Forms → named Brevo forms (e.g. "Newsletter signup", "Event RSVP")
  - Manual → Manual import, Manual entry
- Every contact has a `created_at` date and is attributed to exactly one source name
  (which rolls up to one source type).

## User stories
- **As a marketing manager**, I want to see how many contacts I acquired in a period
  and from which sources, so that I know which channels are growing.
  - Acceptance: KPI strip shows total acquired + breakdown; changing the date range
    updates every block with no reload.
  - Acceptance: I can switch the trend/ranking between source TYPE and source NAME.
  - Reached via: Contacts sidebar → Acquisition.

## Screens / blocks (single page, top to bottom)
1. **Page header** — title "Acquisition", subtitle describing the page; a date-range
   control + a source-type filter pinned at the top right (Controls).
2. **KPI strip** — 4 KPIs: Total contacts acquired (range), Active sources count,
   Top source (name + count), % automated vs manual. Each KPI shows a delta vs the
   previous comparable period.
3. **Trend chart** — contacts acquired over time (by month/week), **stacked by source
   type**. Date-range filter applies. Legend toggles series.
4. **Source-type split** — donut or horizontal bar of the type buckets (Datasource /
   Forms / Manual) with counts + % of total.
5. **Source-name ranking** — sortable table/bar of named sources (Vivenu, GVS, Brevo
   forms, Manual import…) with: source name, source type tag, contacts acquired,
   % of total, trend sparkline/delta. Filterable by source type. This is the
   drill-down from the type level.

## States
- **Empty:** No contacts acquired in the selected range → empty state with prompt to
  widen the date range.
- **Loading:** Skeletons matching KPI strip, chart, and table.
- **Error:** Per-block error with retry; a failing block does not blank the page.

## Mock data
- **Contact acquisition records** (~5,000 aggregated): fields = `source_name`,
  `source_type`, `created_at`, `count`. Spread across ~12 months.
- **Sources** (~10–14): `name`, `type`, `total_contacts`, `pct_of_total`,
  `delta_pct`. Include edge cases: a source with 0 in current range, a very long
  Brevo form name, a brand-new source (huge positive delta).
- Source types: Datasource, Forms, Manual.

## Constraints
- Stack: Arenametrix design system (import DS / TY / Ico + shared components).
- UI copy in **English**. Proper names (Vivenu, GVS, Brevo) unchanged.
- WCAG AA; good, scalable performance; no page reload on filter change.
