---
name: design-prototypes
description: "Use this skill to build ANY React UI page or component that must conform to the Arenametrix design system (Figma file NUOoC3GC7mB4U1AydRKIoy). Trigger whenever the user asks to create, redesign, or update a page, screen, form, table, dashboard, modal, or any UI element in this codebase — even if they never mention \"design system\" or \"Figma\". This skill is the single source of truth for tokens, component specs, and implementation rules; always read it before writing any React or CSS code."
---

# AX Design System — React Implementation Skill

## 0. Codebase integration — READ FIRST (overrides everything below)

Prototypes are **integrated directly into the `ax-prototypes` repo** as new
features — NOT standalone HTML files. The app is **Vite + React 19** (the dir with
`package.json` + `src/`). The repo already ships the design system; your job is to
**reuse it, not recreate it**.

### Build pipeline (in order)

1. **Run `design-consistency` first.** It scans the codebase + Figma and returns a
   Component Manifest (REUSE / EXTEND / BUILD-NEW per element). If it reports
   conflicts (e.g. a file that redefines tokens inline, a route collision), resolve
   them before continuing. If it wasn't run, run it now.

2. **Destination — depends on the lot.** The pipeline is lot-based; the LLM spec is for
   ONE lot and names what prior lots already built.
   - **Lot 1 (new feature):** ask the user two questions before writing code:
     - "What should the **feature folder** be called?" → `src/features/<Folder>/`
     - "What should the **component file** be called?" → `<File>.jsx`
     Do not invent these — ask. Use PascalCase for both unless told otherwise.
   - **Lot ≥ 2:** do NOT create a new folder/file or ask. Build **into the existing
     feature folder** the manifest identified. **Extend** the prior-lot files — reuse their
     screens, components, helpers and mock data; add only what this lot introduces. Never
     recreate or overwrite prior-lot work, and never duplicate a screen a prior lot built.

3. **Import the design system — never redefine it.** From the new feature file:
   ```js
   import { DS, TY } from '../../utils/designSystem';   // colours + typography
   import Ico from '../../utils/icons';                  // icon catalog (default export)
   import PageHeader from '../../components/PageHeader';  // shared top-of-page banner (EVERY page)
   import { Btn } from '../../components/Btn';
   import { IconBtn } from '../../components/Iconbtn';
   import { Field, SearchField, TextArea } from '../../components/Field';
   import { Checkbox, Radio, Toggle } from '../../components/Controls';
   import { Tag, StatusBadge, Avatar, IconBadge } from '../../components/Tag';
   import Modal from '../../components/Modal';                 // right drawer / center dialog
   import StatePreview from '../../components/StatePreview';   // prototype state switcher
   import KpiCard from '../../components/Kpi';                 // headline metric card
   import Skeleton from '../../components/Skeleton';           // loading shimmer bar
   import Banner from '../../components/Banner';               // full-width list row
   import Select from '../../components/Select';               // single-choice dropdown
   import Pagination from '../../components/Pagination';        // prev/next pager
   import Card from '../../components/Card';                    // plain surface container
   import Chip from '../../components/Chip';                    // toggle filter pill
   import Toast from '../../components/Toast';                  // transient confirmation
   import ActionMenu from '../../components/ActionMenu';        // ⋯ overflow row actions
   import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';
   ```
   Adjust `../../` to the real depth of your file. **Declaring a local `DS`, `TY`,
   or `Ico` object in a feature file is a hard failure** — that is the exact drift
   this pipeline exists to prevent.

   **Prototype state management — always use `StatePreview`.** Every prototype that
   has demo states (ready / loading / empty / error) — or other prototype-only
   toggles like role — must drive them through the shared
   `components/StatePreview.jsx`, rendered once at the top of the page. It is a
   single slight floating CTA pinned bottom-right that opens a small window of
   options, so state controls never clutter the page. Do NOT hand-roll a per-feature
   demo/state bar (no top "PROTOTYPE" strip, no inline state buttons) — that is the
   exact drift this component prevents. Usage:
   ```js
   const [state, setState] = React.useState('ready');
   <StatePreview groups={[{ label: 'State', value: state, onChange: setState,
     options: ['ready', 'loading', 'empty', 'error'] }]} />
   // multiple groups (e.g. role + state) — pass more entries in `groups`.
   ```

4. **Build the PAGE ONLY — never the app shell.** The nav bar, sidebar, header and
   layout already exist (`layout/Header/NavBar.jsx`, `layout/Header/SideBar.jsx`,
   `layout/Layout/*`) and wrap every route. Your feature renders *inside* that
   shell, so:
   - Do NOT re-code or re-style the navigation bar, sidebar, or app frame.
   - Do NOT add a top nav / sub-menu / sidebar inside the feature file.
   - Build from the page header / content down — assume the shell is already there.

5. **Build only the BUILD-NEW items** from the manifest (e.g. charts, timelines,
   drawers) inside the feature folder. Reuse libraries already in `package.json`
   (`recharts`, `highcharts`, `tabulator-tables`) for charts/tables rather than
   adding deps. A genuinely new icon goes into `utils/icons.jsx` per §11 — not
   inline in the feature.

6. **Hand off to `ship-prototype`.** You do NOT wire routes, touch the sidebar, run
   the build, or launch the app — that is `ship-prototype`'s job. When the feature
   file is complete, deliver your artifacts and hand the file path + component name
   to `ship-prototype`, which integrates and launches it.

### What the sections below mean now

- Sections 2–3 (DS/TY) and 4–11 (components) are the **API contract** for the code
  you import, and the **build spec for BUILD-NEW components only**. Use them to know
  a component's props and Figma origin — not as something to paste into a feature
  file. The live token/icon values are whatever `utils/designSystem.js` and
  `utils/icons.jsx` currently export — read those, they win over any copy here.
- `TY` in the repo currently provides `h3 h4 h5 b1 b2 b3` (+ weight tokens). If you
  need `h1/h2`, add them to `utils/designSystem.js` rather than hardcoding sizes.

### Deliverables

Artifact 1 — the feature file(s) in `src/features/<Folder>/`, page-only (no shell),
importing the shared design system. (Route + sidebar + launch are done by
`ship-prototype`, not here.)
Artifact 2 — traceability report (criterion → screen → status).
Artifact 3 — open-questions / assumptions log, including every BUILD-NEW item and
any icon/token added to the shared files.
Then hand the file path + exported component name to `ship-prototype`.

---

## Mandatory first step

After §0 (manifest + destination + imports resolved), fetch the relevant Figma
nodes for any **BUILD-NEW** or **EXTEND** component using `Figma:get_design_context`:

```
Figma:get_design_context(fileKey="NUOoC3GC7mB4U1AydRKIoy", nodeId="<ID>")
```

Use the node IDs in Section 9 as your starting point. **Never rely on memory alone for pixel values.** If `get_design_context` fails, fall back to `Figma:get_screenshot` on the same node ID.

Figma also exposes **three variable collections** — always read them alongside the visual nodes:
- **"Variable collection"** — primitive colour tokens (raw hex values)
- **"Semantic"** — semantic colour aliases with `when to use` descriptions (source of truth for component colours)
- **"Typography"** — font size, weight, line-height, letter-spacing tokens with `when to use` descriptions

Read variable descriptions to understand *when* to apply each token — they are more reliable than visual inference.

---

## 1. Stack & styling rules

| Rule | Value |
|------|-------|
| Framework | React 19 (functional components + hooks), built into the Vite `ax-prototypes` app |
| File output | A feature at `src/features/<Folder>/<File>.jsx` (folder + filename asked from the user) — never a standalone HTML file |
| Styling | Inline `style={{}}` props — **no Tailwind**, no external CSS |
| Font | `'Inter', sans-serif` — always via `DS.ff` |
| Token objects | **Import** `{ DS, TY }` from `utils/designSystem` and `Ico` from `utils/icons` — NEVER declare them in a feature file (see §0) |
| Shared components | **Import** `Btn`, `IconBtn`, `Field`, `Checkbox`/`Toggle`, `Tag`/`StatusBadge` etc. from `components/*` per the design-consistency manifest — only build what's BUILD-NEW |
| Text alignment | Always `textAlign: 'left'` — never centre-align labels, fields, or body text unless Figma explicitly shows it |
| Copy language | **English only** — all labels, titles, buttons, empty/error copy in English (never French) |
| Card padding | `Card` has **no default padding** — always pass `style={{ padding: … }}` (e.g. `padding: 16`) |
| Page header | Use the shared `PageHeader` component on every page — never hand-roll the header banner |
| No `<form>` tags | Use `onClick` / `onChange` handlers exclusively |
| Hover effects | `onMouseEnter` / `onMouseLeave` on `e.currentTarget.style` |
| Dropdowns | Close via `useRef` + `document.addEventListener("mousedown", …)` cleaned up in `useEffect` return |
| State updates | Always spread / map — never mutate in place |
| Unique IDs | Module-level counter: `let _uid = 1; const uid = () => String(_uid++)` |

---

## 2. Colour tokens — `DS` constant

Two layers: **primitives** (what the colour is) and **semantic aliases** (when to use it).
Always reach for a semantic token first. Fall back to a primitive only if no semantic token exists for your use case.

```js
const DS = {
  // ── Semantic — action ─────────────────────────────────────────────────────
  // Use these for all interactive elements (buttons, links, controls)
  actionPrimary:           '#017BFE',  // Primary button bg/border default → Primary/Blue/500
  actionPrimaryHover:      '#96C2FE',  // Primary button bg/border on hover → Primary/Blue/300
  actionSecondaryBorder:   '#017BFE',  // Secondary button border + focus ring → Primary/Blue/500
  actionSecondaryHover:    '#EFF4FF',  // Secondary/Tertiary button hover bg → Primary/Blue/100
  actionSecondaryTextHover:'#017BFE',  // Secondary button text on hover
  actionTertiaryHover:     '#EFF4FF',  // Tertiary button hover bg
  actionTertiaryTextHover: '#017BFE',  // Tertiary button text on hover
  actionDisabledBg:        '#E2DDDD',  // Disabled element background → Neutral/200
  actionDisabledText:      '#9A9EA5',  // Disabled element text/icon → Neutral/500

  // ── Semantic — feedback ───────────────────────────────────────────────────
  // Always use the full triad: foreground + background + (text if on bg)
  feedbackSuccess:         '#16A34A',  // Success border/icon/text → Supporting/Green/600
  feedbackSuccessBg:       '#DEF9F4',  // Success badge/banner bg → Secondary/Green/100
  feedbackWarning:         '#D97706',  // Warning border/icon/text → Supporting/Amber
  feedbackWarningBg:       '#FEF3C7',  // Warning badge/banner bg → Supporting/Amber/100
  feedbackError:           '#DC2626',  // Error border/icon/text → Supporting/Red/600
  feedbackErrorBg:         '#FFEBE8',  // Error input/banner bg → Supporting/Red/100
  feedbackErrorText:       '#991B1B',  // Error text ON error bg → Supporting/Red/800
  feedbackInfo:            '#017BFE',  // Info border/icon → Primary/Blue/500
  feedbackInfoBg:          '#EFF4FF',  // Info badge/banner bg → Primary/Blue/100

  // ── Semantic — border ─────────────────────────────────────────────────────
  borderDefault:           '#E2DDDD',  // Cards, table cells, inputs default → Neutral/200
  borderFocus:             '#017BFE',  // Input focus/active state border → Primary/Blue/500
  borderError:             '#DC2626',  // Input error state border → Supporting/Red/600

  // ── Semantic — text ───────────────────────────────────────────────────────
  textDefault:             '#1F2937',  // Primary text — all body, labels, headings → Neutral/900
  textSecondary:           '#9A9EA5',  // Supporting labels, metadata → Neutral/500
  textPlaceholder:         '#9A9EA5',  // Empty input placeholder → Neutral/500
  textDisabled:            '#9A9EA5',  // Disabled control text → Neutral/500
  textInverse:             '#FFFFFF',  // Text on dark/coloured bg (buttons, nav) → Neutral/0

  // ── Semantic — background ─────────────────────────────────────────────────
  bgPage:                  '#F0F2F5',  // Root page background — never use inside cards
  bgCard:                  '#FFFFFF',  // Card and panel surfaces → Neutral/0
  bgSurface:               '#F9FBFB',  // Alt rows, toolbars, secondary panels → Neutral/100

  // ── Semantic — navigation ─────────────────────────────────────────────────
  navActiveTab:            '#4E6FC7',  // Active tab bottom-border only → Nav/Active-tab
  navGradientFrom:         '#2CB1A2',  // Sub-menu gradient start → Nav/Gradient-from
  navGradientTo:           '#5585B8',  // Sub-menu gradient end → Nav/Gradient-to
  navText:                 '#242731',  // Nav tab label text

  // ── Primitives — use only when no semantic token fits ─────────────────────
  blue600:     '#0D69D4',  neutralGrey: '#717171',
  blue500:     '#017BFE',  neutralBlack:'#212121',
  blue300:     '#96C2FE',  neutral500:  '#9A9EA5',
  blue200:     '#C6E2FF',  neutralLGrey:'#89939E',
  blue100:     '#EFF4FF',  neutral200:  '#E2DDDD',
  neutral900:  '#1F2937',  neutral100:  '#F9FBFB',
  neutral0:    '#FFFFFF',  red800:      '#991B1B',
  red600:      '#DC2626',  red100:      '#FFEBE8',
  green600:    '#16A34A',  teal500:     '#34B0A1',
  teal300:     '#7ECFC2',  teal200:     '#B4EBE2',
  teal100:     '#DEF9F4',  amber:       '#D97706',
  amberLight:  '#FEF3C7',  orange:      '#FE9D55',
  purple:      '#7C3AED',  purpleLight: '#EDE9FE',

  ff: "'Inter', sans-serif",
};
```

---

## 3. Typography tokens — `TY` constant

Always set `fontSize`, `fontWeight`, **and** `lineHeight` together.
Apply via spread: `style={{ ...TY.h4, color: DS.textDefault, fontFamily: DS.ff }}`.

```js
const TY = {
  // ── Ready-made style objects ───────────────────────────────────────────────
  h1: { fontSize: 36, fontWeight: 600, lineHeight: '44px' }, // Hero titles, landing page headings
  h2: { fontSize: 28, fontWeight: 600, lineHeight: '36px' }, // Page titles — one per page max
  h3: { fontSize: 20, fontWeight: 600, lineHeight: '28px' }, // Card titles, nav section labels
  h4: { fontSize: 16, fontWeight: 600, lineHeight: '22px' }, // Card headers, modal headings
  h5: { fontSize: 14, fontWeight: 600, lineHeight: '18px' }, // Table headers, form group labels
  b1: { fontSize: 16, fontWeight: 400, lineHeight: '22px' }, // Default body, descriptions
  b2: { fontSize: 14, fontWeight: 400, lineHeight: '18px' }, // Buttons, inputs, dropdowns — most used
  b3: { fontSize: 12, fontWeight: 400, lineHeight: '16px' }, // Table cells, captions, error text — minimum

  // ── Individual tokens ─────────────────────────────────────────────────────
  weightSemiBold: 600,  // Headlines only (H1–H5) — never use on body text
  weightRegular:  400,  // All body, button labels, input values
  weightMedium:   500,  // Nav tab labels only

  lsDefault: 0,    // All headlines and body — do not override
  lsUI:      0.1,  // Nav labels, form subtitles, DS annotation text only
};
```

---

## 4. Components

### 4.1 Buttons (Figma node `196:1229`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1229&t=0aj54c6Vsn4YIYrL-4)

All share: `fontFamily: DS.ff`, `borderRadius: 6`, `display: 'inline-flex'`, `alignItems: 'center'`, `transition: 'all .15s'`, `padding: '0 16px'`.

**Sizes:** Medium `height: 40` + `TY.b2` | Small `height: 32` + `TY.b3`.
**With icon:** add `gap: 8`, icon 20px (medium) or 16px (small).

| Variant | Default bg | Hover bg | Border | Text default | Text hover |
|---------|-----------|---------|--------|-------------|------------|
| **Primary** | `actionPrimary` | `actionPrimaryHover` | `1px solid` same as bg | `textInverse` | `textInverse` |
| **Secondary** | `bgCard` | `actionSecondaryHover` | `1px solid actionSecondaryBorder` | `textDefault` | `actionSecondaryTextHover` |
| **Tertiary** | transparent | `actionTertiaryHover` | none | `textDefault` | `actionTertiaryTextHover` |
| **Tertiary danger** | transparent | `feedbackErrorBg` | none | `feedbackError` | `feedbackError` |

**Disabled** (all): `bg: actionDisabledBg`, `color: actionDisabledText`, `cursor: 'not-allowed'`, `opacity: 0.45`, `border: 'none'`.

**Icon buttons** (node `66:944`): `borderRadius: 6`, `border: '1px solid'`, `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'center'`.

| Type | Size | Default | Hover |
|------|------|---------|-------|
| Primary Small/Medium | 28px / 40px | `bg actionPrimary`, `border actionPrimary` | `bg actionPrimaryHover`, `border actionPrimaryHover` |
| Secondary Small/Medium | 28px / 40px | `bg bgCard`, `border actionSecondaryBorder` | `bg actionSecondaryHover`, `border actionPrimaryHover` |

**Tab Large** (Header, node `123:3030`): `fontSize: 20, fontWeight: 500, lineHeight: '24px'`, `color: DS.navText`. Active: `4px` bar `bg: DS.navActiveTab`.
**Tab Small** (node `52:2010`): `...TY.b2`, `color: DS.navText`. Active text: `DS.actionPrimary` + `4px` bar `bg: DS.navActiveTab`.

---

### 4.2 Form fields (Figma node `196:1333`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1333&t=0aj54c6Vsn4YIYrL-4)

Base: `bg: DS.bgSurface`, `border: '1px solid ' + DS.borderDefault`, `borderRadius: 4`, `padding: '8px 12px'`, `height: 40`, `minWidth: 200`, `fontFamily: DS.ff`, `...TY.b2`.

| State | Border | Bg | Text |
|-------|--------|-----|------|
| Default | `borderDefault` | `bgSurface` | `textPlaceholder` |
| Focus/Active | `borderFocus` | `bgSurface` | `textDefault` |
| Filled | `borderDefault` | `bgSurface` | `textDefault` |
| Error | `borderError` | `feedbackErrorBg` | `feedbackErrorText` |
| Disabled | `borderDefault` | `actionDisabledBg` | `textDisabled` |

Error message below: `...TY.b3`, `color: DS.feedbackError`, `marginTop: 4`.

**FieldInput** (node `185:3168`): label (`...TY.b2`, `color: DS.textSecondary`) + input, `gap: 8`. All states `height: 40` — no layout shift.
**TextArea**: same base, `height: 120`, `resize: 'vertical'`.

---

### 4.3 Select controls (Figma node `196:1311`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1311&t=0aj54c6Vsn4YIYrL-4)

**Checkbox**: `16×16px`, `borderRadius: 4`. Default: `border: DS.textSecondary`. Active: `bg + border: DS.actionPrimary`, white checkmark.
**Radio**: `16×16px`, `borderRadius: '50%'`. Active: blue outer, white `8×8px` dot.
**Toggle**: `32×16px`, `borderRadius: 100`. Default: `border: DS.neutralLGrey`. Active: `bg + border: DS.actionPrimary`.
**ControlsText**: `gap: 8`, label `...TY.b3`, `color: DS.neutralBlack`.

---

### 4.4 Tags & Chips (Figma node `196:1978`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1978&t=0aj54c6Vsn4YIYrL-4)

**Unselected** (node `55:913`): `bg: DS.blue100`, `border: '1px solid ' + DS.blue600`, `borderRadius: 10`, `padding: '4px 8px'`, `...TY.b3`, `color: DS.blue600`.
**Selected** (node `183:1065`): `bg: DS.teal500`, `borderRadius: 10`, `padding: '4px 8px'`, `gap: 8`, `...TY.b3`, `color: DS.textInverse` + close icon 10px.
**Badge/name** (node `183:1060`): circle `borderRadius: '50px'`, `bg: DS.teal300`, `padding: 10`, initials `...TY.b2`, `color: DS.textInverse`.
**Badge/icon** (node `190:1139`): same but `bg: DS.teal200`, user icon 20px.

---

### 4.5 Status badges

`borderRadius: 999`, `padding: '3px 10px'`, `...TY.b3`, `fontWeight: 500`, `6×6px` dot.

| Status | bg | text + dot |
|--------|----|-----------|
| Active | `feedbackSuccessBg` | `feedbackSuccess` |
| Pending | `feedbackWarningBg` | `feedbackWarning` |
| Inactive | `bgSurface` | `textSecondary` |
| Error | `feedbackErrorBg` | `feedbackError` |

---

### 4.6 Avatar

`borderRadius: '50%'`, initials SemiBold. Colour by `name.charCodeAt(0) % 4`:
0 → `bg: blue100 / actionPrimary` | 1 → `feedbackSuccessBg / feedbackSuccess` | 2 → `feedbackWarningBg / feedbackWarning` | 3 → `purpleLight / purple`.

**Nav avatar** (node `123:3050`): `60×60px`, `bg: DS.actionPrimary`, `color: DS.textInverse`, `...TY.h3`.

---

### 4.7 Table (Figma node `196:1794`)

Pure HTML `<table>`, no libraries.

| Zone | bg | border |
|------|----|--------|
| Header | `DS.blue100` | `0.2px solid DS.borderDefault` all sides |
| Body cell | `DS.bgCard` | `borderLeft + borderTop: '0.5px solid DS.borderDefault'` |
| Hover/selected row | `DS.blue100` | unchanged |
| Icon cell | `DS.bgCard` | left + right + top `0.5px DS.borderDefault` |

Header: `minWidth: 175`, `padding: '12px'`, title `...TY.h5`, `color: DS.textDefault`.
Body: `minWidth: 175`, `padding: '12px'`, text `...TY.b3`, `color: DS.neutralBlack`.
Icon cell: `height: 36`, eye button `28×28px`, `border: '1px solid ' + DS.actionSecondaryBorder`, hover `bg: DS.actionSecondaryHover`.
**Empty state**: centred icon + `...TY.h4` title + `...TY.b2` subtitle.
**Loading**: `height: 12`, `bg: DS.borderDefault`, `borderRadius: 4` placeholder bars.
**Pagination**: `borderRadius: '0 0 10px 10px'`, Secondary/Small buttons, page number `...TY.b2`.

---

### 4.8 Dropdown (Figma node `196:1558`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1558&t=0aj54c6Vsn4YIYrL-4)

Container: `width: 212`, `borderRadius: 4`, `border: '1px solid ' + DS.borderDefault`, `bg: DS.bgCard`, `boxShadow: '0 2px 4px rgba(0,0,0,0.08)'`.
Item: `height: 40`, `padding: '0 10px'`, `gap: 10`, `...TY.b2`, `color: DS.textDefault`. Hover: `bg: DS.actionSecondaryHover`.

---

### 4.9 Navigation (Figma node `196:1226`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1226&t=0aj54c6Vsn4YIYrL-4)

This is the navbar of the current application, always remove it from the final outcome but keep it in optional.

**Top header** (node `123:3026`): `bg: DS.bgCard`, `borderBottom: '1px solid ' + DS.borderDefault`, `height: 136`, `padding: '24px 40px'`, `gap: 25`. Logo `117×117px`. Tabs `flex: 1`, `height: 48`, `gap: 24`. Avatar `60×60px` + Chevron `30×30px`.

**Sub-menu** (node `254:2115`): `height: 72`, gradient `DS.navGradientFrom → DS.navGradientTo`. Links `fontSize: 18, fontWeight: 500, lineHeight: '24px', color: DS.textInverse`, `gap: 40`, `padding: 25`. Active: white `4px` bar `position: absolute, bottom: 0`.

---

### 4.10 Cards (Figma node `218:1575`, https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=218-1575&t=0aj54c6Vsn4YIYrL-4)

Always rely on this card design/UI to build main page KPIs on top of the page, if KPI cards are specified in the specifications.

Content card: `bg: DS.bgCard`, `border: '1px solid ' + DS.borderDefault`, `borderRadius: 10`, `margin: '0 24px'`, `padding: 16`.
CardStats (node `220:1603`): `width: 195`, `borderRadius: 10`, `padding: 15`, `gap: 5`. Title `...TY.b2` (`textSecondary`) + value `...TY.h4` (`actionPrimary`) + sub-value `...TY.b3` (`textSecondary`).
Toolbar `borderRadius: '10px 10px 0 0'` | table no top-border | pagination `borderRadius: '0 0 10px 10px'`.

---

## 5. Page layout structure (node `360-1403` , https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=360-1403&t=0aj54c6Vsn4YIYrL-4)

The general structure of all main page must follow this one:
Header with left PageTitle infos and on the right Call-To-actions.
The NavBar is optional, only when required by the specifications.

**The page header is a shared component — import it, don't rebuild it.** Every page uses
`PageHeader` from `components/PageHeader.jsx` (icon badge + title + description subtitle +
right-side CTAs). Its subtitle is always a short **description** of the page — never an item
count ("Manage your consents", not "42 consents"). The `PageHeaderInfos` block drawn below
is the spec for that shared component; reuse the component rather than re-implementing it.

```
OPTIONAL
┌─ Top header (bgCard, borderBottom borderDefault, h:136, p:'24px 40px') ───┐
│  Logo 117px │ Tab Large nav flex:1, gap:24 │ Avatar 60px + Chevron 30px   │
└───────────────────────────────────────────────────────────────────────────┘
┌─ Sub-menu (gradient navFrom→navTo, h:72, p:25) ───────────────────────────┐
│  Links gap:40  textInverse  18/500  │  active: white 4px bottom bar       │
└───────────────────────────────────────────────────────────────────────────┘

Root: bg DS.bgPage (#F0F2F5)

┌─ PageHeaderInfos (bgCard, borderBottom borderDefault, p:'16px 24px') ─────────┐
│  Icon badge 36×36 │ TY.h4 title │ TY.b2 subtitle          Primary CTA    │
└───────────────────────────────────────────────────────────────────────────┘
┌─ PageHeaderActions(bgCard, border borderDefault, r:10, m:'0 24px', p:16) ────┐
│  Stack with gap: 12                                                        │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Inline SVG icon conventions

**Implementation rules are in §11.** This section lists the Figma reference nodes.

Signature: `({ s=20, c=DS.actionPrimary })`. Stroke: `strokeWidth:1.5`, `strokeLinecap:'round'`, `strokeLinejoin:'round'`, `fill:'none'`. Sizes: 12/14/16/18/20px.

| Name | Node | Keywords | Ico key |
|------|------|----------|---------|
| Icons/Plus | `33:1702` | plus, add | `Plus` |
| Icons/Dot/Vertical | `33:1705` | more options | `Dots` |
| Icons/Chevron/Right | `33:1708` | arrow right | `ChevRight` |
| Icons/Chevron/Down | `33:1711` | arrow down, dropdown | `ChevDown` |
| Icons/Check/Large | `46:910` | checkmark large | `Check` |
| Icons/Check/Small | `46:913` | check, confirm | `Check` |
| Icons/Ticket | `37:2575` | ticket | `Ticket` |
| Icons/search | `43:884` | search | `Search` |
| Icons/Funnel | `37:2441` | filter | `Filter` |
| Icons/Chevron/Left | `37:2535` | arrow left | `ChevL` |
| Icons/Arrow/Down | `46:890` | sort arrow | `SortUp` |
| Icons/Plus/Rounded | `52:2876` | add rounded | `Plus` |
| Icons/User/Plus | `55:919` | add user | `UserPlus` |
| Icons/User | `69:971` | user | `User` |
| Icons/Box | `72:984` | box | — |
| Icons/Trash | `77:1008` | delete | `Trash` |
| Icons/Settings | `74:974` | settings | `Settings` |
| Icons/Bookmark | `76:1007` | save | `Subscriptions` |
| Icons/Tag | `85:1028` | tag | `Tag` |
| Icons/Eye | `112:1235` | view, preview | `Eye` |
| Icons/Cross/Large | `183:1072` | close | `Cross` |
| Icons/Cross/Small | `183:1082` | close small | `Cross` |
| Icons/Card | `220:1585` | payment, period | `Card` |
| Icons/Mail | `220:1635` | email | `Mail` |
| Icons/Organization | `227:2114` | company | `Organization` |
| Icons/Campaigns | `308:817` | campaign, send | `Campaigns` |
| Icons/List | `247:2037` | list view | `List` |
| Icons/AI-Sparkles | `284:2034` | AI, sparkles | `AIicon` |

---

## 7. Composed components (Figma node `196:1223`)

**ContactSidebar** (`196:1685`): left panel 416px (avatar + CardSections) + right panel 416px (tags + consents).
**Accordion** (`189:1337` / `191:1343`): `height: 48`, label left + chevron right, `borderBottom: DS.borderDefault`.
**FieldInput** (`185:3168`): label + input, `gap: 8`, all states `height: 40`.
**CardSection** (`227:1091`): Accordion + 4x FieldInput, ~358px.
**Modal**: `width: 665`, `borderRadius: 10`, header `height: 100` (`...TY.h4` + close icon), body `padding: 24`, footer buttons right-aligned `gap: 8`.
**CardStats** (`220:1603`): `width: 195`, title `...TY.b2` + value `...TY.h4` (blue) + sub `...TY.b3`.

---

## 8. Feedback token usage rules

Always apply the **full triad** — never a single feedback token alone:

| Context | Background | Border/Icon | Text on bg |
|---------|-----------|------------|-----------|
| Success | `feedbackSuccessBg` | `feedbackSuccess` | `feedbackSuccess` |
| Warning | `feedbackWarningBg` | `feedbackWarning` | `feedbackWarning` |
| Error | `feedbackErrorBg` | `feedbackError` | **`feedbackErrorText`** |
| Info | `feedbackInfoBg` | `feedbackInfo` | `feedbackInfo` |

Error inputs: use `feedbackErrorText` (#991B1B) for field text — darker than `feedbackError` (#DC2626) for contrast on the error background.

---

## 9. Figma node reference

| Section | Node ID |
|---------|---------|
| Colors | `30:721` |
| Typography | `60:64` |
| Buttons | `196:1229` |
| Select controls | `196:1311` |
| Fields | `196:1333` |
| Dropdown | `196:1558` |
| Table | `196:1794` |
| Tags & Badges | `196:1978` |
| Tabs | `196:2034` |
| Cards | `218:1575` |
| ContactSidebar | `196:1685` |
| Navigation | `196:1226` |
| Icons | `36:563` |

```
https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=<NODE-ID-WITH-DASHES>
```

---

## 10. Quick-start checklist

1. **Run `design-consistency`** → get the Component Manifest; resolve any conflicts.
2. **Ask the user** for the feature folder name + `.jsx` filename (§0).
3. **Import** `{ DS, TY }` from `utils/designSystem` + `Ico` from `utils/icons` + the
   REUSE components from `components/*`. Never declare these in the feature file.
4. **Fetch Figma nodes** (Section 9) only for BUILD-NEW / EXTEND components.
5. **Semantic tokens first** — primitives only as fallback.
6. **Build only BUILD-NEW** items (charts, timelines, drawers) in the feature folder;
   use existing libs (`recharts`/`highcharts`/`tabulator-tables`) for charts/tables.
7. **Inline styles only** — no Tailwind, no CSS. `textAlign: 'left'` by default.
8. **Typography spread** — `{ ...TY.hX, fontFamily: DS.ff, color: DS.textX }` always.
9. **Feedback triads** — bg + border + text together, never a single token (Section 8).
10. **Implement all states** — hover, focus, disabled, error, empty, loading.
11. **Page only** — never build/restyle the nav bar, sidebar, or app shell; the
    feature renders inside the existing layout. Use the shared `PageHeader` for the page banner.
11b. **Lot ≥ 2** — extend the existing feature folder/files; reuse prior-lot screens,
    components, and mock data; add only this lot's additions. Never overwrite or duplicate.
11c. **English copy only**; `Card` needs explicit padding.
12. **Icons** — follow §11; reuse `Ico.*`, add new icons to `utils/icons.jsx`. Never use
    `<img>`, remote URLs, emoji, or Figma asset URLs for icons.
13. **Hand off to `ship-prototype`** — it wires the route + sidebar, builds, and launches.
    Do not do those here.
14. *ALWAYS* reuse the design system; never assume something not in it — ask the user.

---

## 11. Icon implementation system — `Ico` object

### 11.1 Source of truth

The canonical icon catalog lives in the codebase as an `Ico` object exported from a dedicated file (e.g. `icons.js` or `designSystem/icons.js`). This file is the **single source of truth** — if an icon exists there, use it. If it doesn't, generate it following the rules below and add it to the object.

### 11.2 Signature & pattern

Every icon is a React functional component with exactly this signature:

```js
const Ico = {
  IconName: ({ s = 16, c = DS.defaultColor }) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      {/* paths using stroke={c} or fill={c} */}
    </svg>
  ),
};
```

| Rule | Value |
|------|-------|
| Props | `s` (size, default varies per icon: 14/16/18/20) and `c` (color, default = a `DS.*` token) |
| SVG wrapper | `width={s} height={s}`, `viewBox="0 0 20 20"` (or `0 0 16 16` / `0 0 24 24` if the path data requires it), `fill="none"` unless it's a filled icon |
| Paths | Use `stroke={c}` for outlined icons, `fill={c}` for filled icons. Never hardcode a hex colour in a path — always use `{c}` |
| Stroke defaults | `strokeWidth="1.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"` |
| Naming | PascalCase key in the `Ico` object matching the concept (e.g. `Filter`, `ChevDown`, `Campaigns`). See §6 table for the Figma name → Ico key mapping |
| Default color | Choose the most common usage context. Interactive → `DS.blue500`. Neutral/decorative → `DS.neutral900` or `DS.neutral500`. Semantic → `DS.feedbackError`, `DS.teal500`, etc. |
| No external assets | **Never** use `<img src="...">`, Figma API asset URLs, emoji, or CSS filter tricks to render icons. All icons are pure inline SVG |

### 11.3 Using icons in components

```js
// In a button — pass s and c explicitly
<Btn iconLeft={<Ico.Plus s={16} c={DS.textInverse} />} label="Add" type="Primary" />

// In an IconButton — icon inherits container context
<IconBtn icon={<Ico.Eye s={16} c={DS.blue500} />} type="Secondary" size="Small" />

// Inline in text — use s matching the text size
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
  <Ico.Mail s={14} c={DS.textSecondary} /> Email sent
</span>
```

Size guidance:
- **Inside Small buttons (h=32):** `s=14` or `s=16`
- **Inside Medium buttons (h=40):** `s=16`, `s=18`, or `s=20`
- **Standalone / decorative:** `s=20`
- **Inline with b3 text (12px):** `s=12` or `s=14`

### 11.4 Adding a new icon

When a design requires an icon not yet in the `Ico` object:

1. **Check §6 table** — find the Figma node ID for the concept
2. **Fetch the SVG** from Figma via `get_design_context` on that node
3. **Convert** the Figma output to the `({ s, c }) => <svg>` pattern:
   - Replace all hardcoded colours with `{c}`
   - Set `width={s} height={s}` on the root `<svg>`
   - Remove any Tailwind classes, `className`, or wrapper `<div>`
   - Use `strokeWidth`, `strokeLinecap`, `strokeLinejoin` (camelCase) for React
   - Use `fillRule`, `clipRule` (camelCase) not `fill-rule`, `clip-rule`
4. **Pick a default color** based on the most common context (see §11.2)
5. **Add the entry** to the `Ico` object with a PascalCase key
6. **Update §6 table** with the new `Ico key` column value

If no Figma node exists for the concept, design a new SVG following the stroke conventions (`1.5` width, `round` caps, `20×20` viewBox) and add it. Flag it in the open questions log as "icon not in Figma DS — custom SVG created".

### 11.5 What NOT to do

- ❌ `<img src="https://www.figma.com/api/mcp/asset/..." />` — remote URLs expire and break
- ❌ `<FigmaIcon src={...} />` with CSS filter colour hacks — fragile and non-standard
- ❌ Emoji as icons (`📈`, `📊`) — not DS-compliant, inconsistent across platforms
- ❌ Inventing icons without checking the existing `Ico` catalog first — leads to duplicates
- ❌ Hardcoding hex colours inside SVG paths — always use `{c}` prop