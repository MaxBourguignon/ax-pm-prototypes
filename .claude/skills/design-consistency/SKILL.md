---
name: design-consistency
description: Component-scanner / resolver for Arenametrix prototypes. Runs BEFORE design-prototypes. Given a spec (or a list of UI elements to build), it (1) derives the components the spec needs, (2) scans the ax-prototypes codebase (components, utils, layout, features) for what already exists, (3) cross-references the Figma design system for anything missing, and returns a reuse-vs-build manifest so the prototyper imports existing code instead of redefining tokens/components. Triggers whenever a prototype/feature is about to be built, or when the user asks to "check design consistency", "find existing components", "what can I reuse", or before any design-prototypes run.
---

# Skill: design-consistency

You are the **component resolver** for Arenametrix prototypes. Your single job:
make sure the prototype builder **reuses what already exists** — design tokens,
icons, shared components, layout — instead of redefining them inline.

You run **before** `design-prototypes`. You do not write feature code. You produce
a **Component Manifest** that the prototyper consumes.

The recurring failure you exist to prevent: a new feature file that re-declares its
own `DS`/`TY`/`Ico` objects and re-implements `Btn`, `Field`, etc. — drifting from
the real design system. (See `src/features/Performances/PerformancePage.jsx` for an
example of exactly what NOT to do.)

---

## Inputs

One of:
- The LLM-ready spec from `specs-docs` (preferred — has "Screens to build").
- A plain list of UI elements / screens to build.
- A figma URL or node set.

If no spec is provided, ask once: "What screens/components am I resolving? Paste the
spec or list the UI elements."

**Lot-aware.** The pipeline is lot-based. The LLM spec is for ONE lot and names what
prior lots already built ("Already built in prior lots — extend, do not rebuild"). When
the spec is for **lot ≥ 2**, the feature already has its own code under
`src/features/<Folder>/` — that prior-lot code is a REUSE source too, not just the shared
design system. Resolve needed elements against BOTH the shared system and the feature's
own existing code, and tell the prototyper to extend the existing files.

---

## The codebase map (source of truth for reuse)

The Vite + React app lives in **`ax-prototypes/`** (the dir containing
`package.json` + `src/`). Always confirm the path first — locate the dir with both
`package.json` and `src/`. Within `src/`:

| What | Location | Import example |
|------|----------|----------------|
| Colour + type tokens | `utils/designSystem.js` (`DS`, `TY` — named exports) | `import { DS, TY } from '../../utils/designSystem'` |
| Icon catalog | `utils/icons.jsx` (`Ico` — default export) | `import Ico from '../../utils/icons'` |
| Token re-export | `components/tokens.js` (`{ DS, TY }`) | — |
| Buttons | `components/Btn.jsx` (`Btn` — default + named) | `import { Btn } from '../../components/Btn'` |
| Icon button | `components/Iconbtn.jsx` (`IconBtn`) | `import { IconBtn } from '../../components/Iconbtn'` |
| Inputs | `components/Field.jsx` (`Field`, `SearchField`, `TextArea`) | `import { Field, SearchField, TextArea } from '../../components/Field'` |
| Selection controls | `components/Controls.jsx` (`Checkbox`, `Radio`, `Toggle`) | `import { Checkbox, Radio, Toggle } from '../../components/Controls'` |
| Tags & badges | `components/Tag.jsx` (`Tag`, `StatusBadge`, `Avatar`, `IconBadge`) | `import { Tag, StatusBadge, Avatar, IconBadge } from '../../components/Tag'` |
| Modal / drawer | `components/Modal.jsx` (`Modal` — `variant="panel"` right drawer / `"center"` dialog) | `import Modal from '../../components/Modal'` |
| Prototype state switcher | `components/StatePreview.jsx` (`StatePreview`) — floating ready/loading/empty/error (+ role) control | `import StatePreview from '../../components/StatePreview'` |
| KPI card | `components/Kpi.jsx` (`KpiCard`) — headline metric card (title/value/sub/icon/accent/loading) | `import KpiCard from '../../components/Kpi'` |
| Loading skeleton | `components/Skeleton.jsx` (`Skeleton`) — shimmer bar (w/h/r or width/height/radius) | `import Skeleton from '../../components/Skeleton'` |
| Banner row | `components/Banner.jsx` (`Banner`) — full-width list row (icon/title/badge/description/columns/trailing/actions) | `import Banner from '../../components/Banner'` |
| Select dropdown | `components/Select.jsx` (`Select`) — single-choice dropdown (options `[{value,label}]`) | `import Select from '../../components/Select'` |
| Pagination | `components/Pagination.jsx` (`Pagination`) — prev/next pager (page/pages/setPage) | `import Pagination from '../../components/Pagination'` |
| Card surface | `components/Card.jsx` (`Card`) — white rounded container, **no default padding** (pass `style={{ padding }}`) | `import Card from '../../components/Card'` |
| Page header banner | `components/PageHeader.jsx` (`PageHeader`) — the shared top-of-page banner EVERY feature uses (icon badge + title + description subtitle + right-side CTAs). Subtitle is always a description, never an item count | `import PageHeader from '../../components/PageHeader'` |
| Filter chip | `components/Chip.jsx` (`Chip`) — toggle filter pill (≠ removable `Tag`) | `import Chip from '../../components/Chip'` |
| Toast | `components/Toast.jsx` (`Toast`) — transient bottom-centre confirmation | `import Toast from '../../components/Toast'` |
| Row actions menu | `components/ActionMenu.jsx` (`ActionMenu`) — single ⋯ that opens a dropdown of row actions (`items[{label,icon,onClick,danger,hidden}]`) | `import ActionMenu from '../../components/ActionMenu'` |
| Empty / error / confirm | `components/Feedback.jsx` (`EmptyState`, `ErrorState`, `ConfirmDialog`) | `import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback'` |
| Layout shell | `layout/Layout/AppLayout.jsx`, `AppLayout_bis.jsx` | wired in `App.jsx` |
| Nav / sidebar | `layout/Header/NavBar.jsx`, `SideBar.jsx` | — |
| Existing features | `features/<Name>/*.jsx` | reference for patterns |
| Routing | `src/App.jsx` (`react-router-dom` `<Route>`s) | add a route here |

Import-path depth: a feature at `src/features/<Folder>/<File>.jsx` reaches shared
code with `../../` (two levels up to `src/`). Always compute the relative depth
from where the new file will live.

---

## Scan procedure

Run these every time — do not rely on memory of the catalog; it changes.

### 1. Locate the app and confirm the token/component surface
```
# find the app root (has package.json + src)
find . -maxdepth 3 -name package.json -not -path '*/node_modules/*'
# tokens actually exported
grep -nE "export const (DS|TY)" <app>/src/utils/designSystem.js
# icon keys available (so you know which icons already exist)
grep -oE "^\s+[A-Z][A-Za-z0-9]+:\s*\(\{" <app>/src/utils/icons.jsx | sed -E 's/[: (].*//' | sort
# shared component exports
grep -rnE "export (default )?function|export const" <app>/src/components
# layout + routes
sed -n '1,80p' <app>/src/App.jsx
```

### 1.5 Scan the feature's own prior-lot code (lot ≥ 2 only)
If this is not the first lot, read what the feature already built:
```
ls <app>/src/features/<Folder>/
grep -rnE "export (default )?function|export const|const [A-Z]" <app>/src/features/<Folder>
```
Record the screens, components, helpers and mock data already defined in the feature
folder. These become REUSE/EXTEND verdicts pointing at the feature's own files — the
prototyper must extend them, not recreate them. Also confirm the existing file imports the
shared `DS`/`TY`/`Ico` (if a prior lot drifted into inline tokens, flag it as a conflict to
fix while extending).

### 2. Derive the needed-component list from the spec
For each screen in the spec, list the concrete UI atoms/molecules it requires
(e.g. page header banner, KPI card, filter chips, date picker, tabs, area chart, timeline,
banner row, right side panel/drawer, settings table, status badge, empty/error/loading
states). Every page needs the shared `PageHeader` banner — always resolve it to REUSE.

### 3. Resolve each needed element to ONE verdict
- **REUSE** — an existing export covers it. Record the exact import path + the
  component's props/API (read the file to get the real signature, don't guess).
- **EXTEND** — an existing component is close but missing a prop/variant. Record
  what to add and whether it should be a wrapper in the feature folder vs a change
  to the shared component (default: wrapper — don't mutate shared components unless
  the user approves).
- **BUILD-NEW** — nothing exists (e.g. area chart, campaign timeline). Record the
  Figma node to model it on (see design-prototypes §6/§9 for node IDs), the library
  to use if relevant (repo already has `recharts`, `highcharts`, `tabulator-tables`),
  and the file it should live in (inside the feature folder, not `components/`,
  unless the user wants it promoted to shared).

### 4. Token + icon check
- Confirm every colour the spec implies maps to a `DS.*` token; flag any that don't.
- Map every icon the spec needs to an existing `Ico.*` key; list missing icons as
  BUILD-NEW icons (to be added to `utils/icons.jsx` per design-prototypes §11, not
  redefined locally).

### 5. Conflict scan
Flag and PAUSE on:
- A feature/page that already **redefines** `DS`/`TY`/`Ico` inline (must be replaced
  with imports).
- The spec asking for a component that duplicates an existing one under a different
  name.
- A route/feature name that already exists in `App.jsx` (collision).

---

## Output — Component Manifest

Return exactly this structure (also render a readable summary to the user):

```
━━ COMPONENT MANIFEST — [feature name] ━━━━━━━━━━━━━

  App root: <path to dir with package.json+src>
  Import base from a feature file: ../../  (adjust to final folder depth)

  TOKENS
  · DS, TY        → REUSE  import { DS, TY } from '<rel>/utils/designSystem'
  · Missing tokens → [none | list]

  ICONS  (import Ico from '<rel>/utils/icons')
  · Reuse:  Plus, ChevDown, Eye, Download, Settings, Campaigns, …
  · Build-new (add to utils/icons.jsx): [list | none]

  PRIOR-LOT CODE (lot ≥ 2 — reuse the feature's own existing files)
  · <Screen/comp from a prior lot> → REUSE/EXTEND  src/features/<Folder>/<File>.jsx
  · (none — first lot)

  COMPONENTS
  · Page header     → REUSE   PageHeader from '<rel>/components/PageHeader'  (every page)
  · KPI card        → REUSE   KpiCard from '<rel>/components/Kpi'  | or BUILD-NEW
  · Button          → REUSE   { Btn } from '<rel>/components/Btn'  props: type,size,iconLeft,…
  · Field/Input     → REUSE   { Field, TextArea } from '<rel>/components/Field'
  · Checkbox/Toggle → REUSE   { Checkbox, Toggle } from '<rel>/components/Controls'
  · Tag/StatusBadge → REUSE   { Tag, StatusBadge } from '<rel>/components/Tag'
  · Area chart      → BUILD-NEW  (recharts available) — model on Figma <node>
  · Timeline        → BUILD-NEW  custom SVG — not in DS
  · Side panel      → BUILD-NEW  drawer in feature folder

  ROUTING
  · Add <Route path="/<slug>" element={<NewFeature/>} /> in src/App.jsx
  · Route collision: [none | ⚠ /<slug> exists]

  CONFLICTS / PAUSE
  · [none | ⚠ <file> redefines DS inline → import instead]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```json
{
  "app_root": "string",
  "import_base": "../../",
  "tokens": { "reuse": ["DS","TY"], "import": "…/utils/designSystem", "missing": [] },
  "icons":  { "import": "…/utils/icons", "reuse": [], "build_new": [] },
  "prior_lot_reuse": [
    { "need": "string", "verdict": "REUSE|EXTEND", "file": "src/features/<Folder>/<File>.jsx" }
  ],
  "components": [
    { "need": "string", "verdict": "REUSE|EXTEND|BUILD-NEW", "import": "string|null",
      "api": "string|null", "figma_node": "string|null", "library": "string|null", "file": "string|null" }
  ],
  "routing": { "file": "src/App.jsx", "suggested_path": "/slug", "collision": false },
  "conflicts": ["string"]
}
```

---

## Handoff

End with:
> "Manifest ready. Handing the reuse list to design-prototypes — it will import the
> REUSE items and only build the BUILD-NEW ones."

If `conflicts` is non-empty, do NOT hand off — surface them and wait for the user
to resolve (e.g. confirm replacing inline tokens with imports).

---

## Hard rules

1. Never write feature/prototype code — you only resolve and report.
2. Always READ the real component file to record its true API — never guess props.
3. Default to REUSE. Only BUILD-NEW when nothing existing fits.
4. Never tell the prototyper to redefine `DS`/`TY`/`Ico` — those are always imports.
5. Never mutate shared components silently — EXTEND defaults to a feature-local wrapper.
6. Always run the conflict scan and PAUSE on inline-token redefinition or route collisions.
7. Re-scan the codebase every run — do not trust a cached catalog.
8. For lot ≥ 2, ALWAYS scan the feature's own prior-lot code and resolve to REUSE/EXTEND
   against those files — the prototyper extends existing lot work, never rebuilds it.
9. Every page reuses the shared `PageHeader` banner; `Card` has no default padding (the
   prototyper must pass explicit padding).
