# ax-pm-prototypes

> [!WARNING]
> **Not ready for production.** This repository holds product-management prototypes for Arenametrix. It has not gone through the full development process (no code review, QA, tests, accessibility or security pass). It must not be deployed or used as a base for production code as-is. Specs and screens here are working material and may change at any time.

## What this is

A sandbox where PMs turn feature ideas into specs and clickable React prototypes aligned with the Arenametrix design system. The prototypes run on mock data only; there is no backend or API connection.

## Repository layout

```
.
├── ax-prototypes/        React + Vite prototype app
│   ├── contacts.json     Mock contact dataset (fake people, example.com emails, subscription lines)
│   ├── src/
│   │   ├── components/   Shared design-system components (Btn, Table, Tabs, Kpi, Modal, PageHeader…)
│   │   ├── features/     One folder per feature prototype
│   │   ├── layout/       App shell: sidebar and top header
│   │   ├── pages/        Home and Contacts list pages
│   │   └── utils/        Design tokens (designSystem.js), icons, segmentation filter catalogue
│   │                     (dataObject.js) and its pre-configured use cases (useCases.js)
│   └── .storybook/       Storybook config for shared components
├── specs/                Feature specs (HTML / PDF / Markdown)
└── .claude/skills/       Claude Code skills that drive the spec → prototype pipeline
```

## Prototypes

Grouped as in the sidebar.

| Section | Route | Feature |
|---|---|---|
| | `/home` | Home |
| Contacts | `/overview` | Overview: communities of engagement, history, performances, completion, age, recency, carts |
| Contacts | `/contacts` | Contacts list: views, segmentation engine (filter blocks, use cases per category), bulk actions (lists, consents, structure, export, merge, delete), contact creation |
| Contacts | `/contacts/:id` | Contact record: KPIs, purchase history, campaigns, lists, consents (opt in / out with confirmation), notes, contributions |
| Contacts | `/acquisition` | Acquisition |
| Contacts | `/lists-v3` | Lists: list table and list record, with "Update list criteria" in the segmentation engine |
| Contacts | `/consents-v3` | Consents management |
| Contacts | `/arenaform` | Arenaform |
| Campaigns | `/performances-v3` | Performance dashboard |
| Campaigns | `/sms` | SMS management |
| Analytics | `/insights` | Insight cards |
| Analytics | `/insights/all-batches` | Insight cards: all batches (mockup) |
| Loyalty | `/loyalty/dashboard` | Loyalty dashboard: KPIs, tier split, top actions |
| Loyalty | `/loyalty/settings` | Loyalty settings: programme, tiers, action rules |
| Loyalty | `/loyalty/rewards` | Loyalty rewards catalogue (beyond the MVP spec) |
| Admin console | `/admin` | Admin console home (CS only) |
| Admin console | `/admin/entity-merge` | Admin: entity merge |

Most pages have a floating state switcher (ready, loading, empty, error) to preview their states.

### Segmentation filters

The filter catalogue in `src/utils/dataObject.js` follows the segmentation spec: Contacts, All purchases, Ticketing, E-commerce, Registrations, Subscription, plus Campaigns, Consents and Access control. Each field carries its spec `group` (picker section) and `status`. The shared order conditions (order date, status, payment, coupon, sales channel, location, period, connector) appear in every activity. Subscription filters are evaluated line by line on the mock subscription lines in `contacts.json`.

## Specs

Written specs live in `specs/`: acquisition, consents v3, performance v3, SMS management, the loyalty module MVP and insight cards (vision, roadmap and lot 1). Features are specced as a light overall vision first, then delivered in incremental lots.

## Running locally

Requires Node.js 20+.

```bash
cd ax-prototypes
npm install
npm run dev              # Vite dev server
npm run build            # Single-file build (vite-plugin-singlefile) in dist/
npm run lint             # ESLint
npm run storybook        # Storybook on http://localhost:6006
```

Stack: React 19, React Router 7, Vite 7, Highcharts, Recharts, Tabulator, Storybook.

## Design system

UI follows the Arenametrix design system in Figma (file `nIMtO7v8dDamI8b2vnMcRc`). Tokens live in `src/utils/designSystem.js` and shared components in `src/components/`. Reuse those instead of redefining styles. Components the design system doesn't cover yet are shown as a visible `<Placeholder/>` rather than invented.

Project UI rules on top of the Figma file:

- UI copy is in English.
- Field labels sit above their value.
- No grey text directly on the page background.
- Cancel in a modal or drawer is a Tertiary button; create/edit drawer footer buttons carry no icon.
- A Secondary button is navy, label and icon; the Secondary icon button keeps a blue icon.
- Modals use the shared `Modal` (gradient header, scrim, Escape closes the top-most modal only).

## Claude Code pipeline

The skills in `.claude/skills/` chain a feature from idea to running prototype:

1. **specs-builder**: interviews the PM (vision or lot mode) and compiles a brief.
2. **specs-docs**: turns the brief into a human-readable spec and an LLM-ready markdown.
3. **design-consistency**: lists what can be reused from the codebase and the Figma design system.
4. **design-prototypes**: builds the page against the design system.
5. **ship-prototype**: adds the route and sidebar entry, runs lint and build, and launches the app.

**spec-to-prototype** runs the whole chain. **ticket-build** turns a feature into short engineering tickets for the Build project.
