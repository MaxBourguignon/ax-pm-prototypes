# ax-pm-prototypes

> [!WARNING]
> **Not ready for production.** This repository holds product-management prototypes for Arenametrix. It has not gone through the full development process (no code review, QA, tests, accessibility or security pass). It must not be deployed or used as a base for production code as-is. Specs and screens here are working material and may change at any time.

## What this is

A sandbox where PMs turn feature ideas into specs and clickable React prototypes aligned with the Arenametrix design system. The prototypes run on mock data only; there is no backend or API connection.

## Repository layout

```
.
├── ax-prototypes/        React + Vite prototype app
│   ├── contacts.json     Mock contact dataset (fake people, example.com emails)
│   ├── src/
│   │   ├── components/   Shared design-system components (Btn, Table, Tabs, Kpi, Modal, PageHeader…)
│   │   ├── features/     One folder per feature prototype
│   │   ├── layout/       App shell: sidebar and top header
│   │   ├── pages/        Home and Contacts list pages
│   │   └── utils/        Design tokens (designSystem.js), icons, segmentation data model (dataObject.js)
│   └── .storybook/       Storybook config for shared components
├── specs/                Feature specs (HTML / PDF / Markdown)
└── .claude/skills/       Claude Code skills that drive the spec → prototype pipeline
```

## Prototypes

| Route | Feature |
|---|---|
| `/home` | Home |
| `/contacts` | Contacts list: views, filters/segmentation, bulk actions (lists, consents, export, delete) |
| `/contacts/:id` | Contact record: KPIs, purchase history, campaigns, consents, contributions, side panel |
| `/acquisition` | Acquisition |
| `/consents-v3` | Consents management (v3) |
| `/performances-v3` | Performance dashboard (v3) |
| `/lists-v3` | Lists (v3) |
| `/arenaform` | Arenaform |
| `/sms` | SMS management |
| `/admin/entity-merge` | Admin: entity merge |

## Specs

Written specs live in `specs/`: acquisition, consents v3, performance v3 and SMS management. Features are specced as a light overall vision first, then delivered in incremental lots.

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

## Claude Code pipeline

The skills in `.claude/skills/` chain a feature from idea to running prototype:

1. **specs-builder**: interviews the PM (vision or lot mode) and compiles a brief.
2. **specs-docs**: turns the brief into a human-readable spec and an LLM-ready markdown.
3. **design-consistency**: lists what can be reused from the codebase and the Figma design system.
4. **design-prototypes**: builds the page against the design system.
5. **ship-prototype**: adds the route and sidebar entry, runs lint and build, and launches the app.

**spec-to-prototype** runs the whole chain. **ticket-build** turns a feature into short engineering tickets for the Build project.
