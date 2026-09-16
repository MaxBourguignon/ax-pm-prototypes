---
name: design-prototypes
description: "Use this skill to build ANY React UI page or component that must conform to the Arenametrix design system (Figma file nIMtO7v8dDamI8b2vnMcRc). Trigger whenever the user asks to create, redesign, or update a page, screen, form, table, dashboard, modal, or any UI element in this codebase — even if they never mention \"design system\" or \"Figma\". This skill is the single source of truth for tokens, component specs, and implementation rules; always read it before writing any React or CSS code."
---

# AX Design System — React Implementation Skill

## 0. Codebase integration — READ FIRST (overrides everything below)

Prototypes are **integrated directly into the `ax-prototypes` repo** as new
features — NOT standalone HTML files. The app is **Vite + React 19** (the dir with
`package.json` + `src/`). The repo already ships the design system; your job is to
**reuse it, not recreate it**.

### Build pipeline (in order)

1. **Run `design-consistency` first.** It scans the codebase + Figma and returns a
   Component Manifest (REUSE / EXTEND / BUILD-TO-DS / BUILD-CUSTOM per element). If it reports
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
   import Table from '../../components/Table';                  // DS bordered data table
   import Placeholder from '../../components/Placeholder';      // dashed "not built yet" box (§0.6)
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

5. **Build only what the manifest says to build.** Two different jobs:
   - **BUILD-TO-DS** — the component isn't in the codebase but **Figma specs it**.
     `get_design_context` the node from the manifest and build to that spec. Do NOT
     improvise a design. The DS is ahead of the code (~47 components vs ~22), so this
     is the common case — `Cell`, `Tooltip`, `Tab`, `Breadcrumb`, `TableToolbar`, the
     Kanban set, etc. all have specs waiting.
   - **BUILD-CUSTOM** — in neither the codebase nor the DS (charts, timelines).
     Reuse libraries already in `package.json` (`recharts`, `highcharts`,
     `tabulator-tables`) rather than adding deps. **Every BUILD-CUSTOM item goes in
     the open-questions log** — it ships with no design authority behind it.

   A genuinely new icon goes into `utils/icons.jsx` per §11 — not inline in the feature.

6. **⚠ MISSING COMPONENT? ASK — never decide alone.** Before writing a single line
   for any component that does **not already exist in `components/`** — whether the
   manifest marked it BUILD-TO-DS or BUILD-CUSTOM — stop and ask the PM which they
   want:

   - **(a) Build it** — you propose the component: a name, its props, and either the
     Figma node it's built from (BUILD-TO-DS) or a note that it's custom with no
     design authority (BUILD-CUSTOM). Then build it.
   - **(b) Placeholder** — render the shared
     `<Placeholder name="Molecules / Tab" node="465:93" note="in the DS, not in code" />`
     from `components/Placeholder.jsx`: a dashed outline labelled with the component
     name and node, sized to the real component's height so the surrounding layout
     still reads. The gap stays **visible in the running prototype**.

   Rules for the ask:
   - **Ask once, batched.** List every missing component in a single question at the
     start of the build — never interrupt per component mid-build.
   - **Recommend per item** (in prose, not a multiple-choice prompt): say which way
     you'd lean and why — e.g. "Tab is specced in Figma and used on three screens,
     worth building; Maps/Full Map isn't in the DS at all, I'd placeholder it."
   - **Never silently invent** a component, and **never silently skip** the element.
     Both hide the gap; the placeholder is what makes it reviewable.
   - If the PM doesn't answer, **default to the placeholder** — it's the reversible
     option.
   - A placeholder is not a shortcut for something that already exists. Check
     `components/` first; the manifest's REUSE list is the answer.

   Every placeholder left in the delivered feature goes in Artifact 3.

7. **Hand off to `ship-prototype`.** You do NOT wire routes, touch the sidebar, run
   the build, or launch the app — that is `ship-prototype`'s job. When the feature
   file is complete, deliver your artifacts and hand the file path + component name
   to `ship-prototype`, which integrates and launches it.

### What the sections below mean now

- Sections 2–3 (DS/TY) and 4–11 (components) are the **API contract** for the code
  you import, and the **build spec for BUILD-TO-DS components**. Use them to know
  a component's props and Figma origin — not as something to paste into a feature
  file. The live token/icon values are whatever `utils/designSystem.js` and
  `utils/icons.jsx` currently export — read those, they win over any copy here.
- `TY` exports the Figma scale (`displayLg headlineLg titleMd bodyMd bodyMdBold
  bodySm labelMd labelLg labelXl monoMd`) plus the established `h1–h5 / b1–b3`
  aliases. Prefer the Figma names in new code.
- **⚠ The Foundations page is NOT the full type inventory.** Its Typography section
  (`35:258`) shows 8 styles. Components use at least **five more**, none of them
  variable-bound — so neither the section nor `get_variable_defs` reveals them. They
  surface only via `get_design_context` on a component that uses them:

  | Style | Spec | `TY` key | Found on |
  |---|---|---|---|
  | `Headline/Medium` | Inter **Bold** 22/28 | `headlineMd` | PageHeader title, Avatar XL |
  | `Label/XLarge` | Inter Medium 16/24 | `labelXl` | Button Lg |
  | `Label/Large` | Inter Medium 14/20 | `labelLg` | Button Md, table identity column |
  | `Label/Medium` | Inter Medium 12/16 | `labelMd` | Button Sm, table headers |
  | `Caption/Small` | Inter Regular **11**/16 | `captionSm` | PageHeader meta line |

  So a 16px step **does** exist (weight 500), and **11px is the real floor**, not 12px.
  Never conclude "the DS has no X" from Foundations alone — check a component first.
  Expect more styles to appear as further components are read.

### Deliverables

Artifact 1 — the feature file(s) in `src/features/<Folder>/`, page-only (no shell),
importing the shared design system. (Route + sidebar + launch are done by
`ship-prototype`, not here.)
Artifact 2 — traceability report (criterion → screen → status).
Artifact 3 — open-questions / assumptions log, including **every `<Placeholder/>` left
in the feature** (name + node + why), every **BUILD-CUSTOM** item (no design
authority), any BUILD-TO-DS component you promoted to `components/`, any icon/token
added to the shared files, and any place the spec implied a 16px/20px type step or an
unpublished token (§2).
Then hand the file path + exported component name to `ship-prototype`.

---

## Mandatory first step

After §0 (manifest + destination + imports resolved), fetch the relevant Figma
nodes for any **BUILD-TO-DS** or **EXTEND** component using `Figma:get_design_context`:

```
Figma:get_design_context(fileKey="nIMtO7v8dDamI8b2vnMcRc", nodeId="<ID>")
```

Use the node IDs in §9 as your starting point. **Never rely on memory alone for pixel
values.** If `get_design_context` fails, fall back to `Figma:get_screenshot` on the same
node ID.

### File structure — 8 content pages

⚠ `get_metadata` with no `nodeId` **returns a truncated page list** (only Cover +
Foundations). The real structure, found by probing node IDs:

| Page | Node | What lives there |
|------|------|------------------|
| 🖼️ Cover | `0:1` | — |
| **📐 Principles** | **`10:2`** | **usage rules: anatomy, prop semantics, decision trees, Do/Don't, when-to-use — see `references/usage-rules.md`** |
| `--- Design System ---` | `10:3` | divider |
| 🧪 Foundations | `10:4` | primitives, semantic tokens, dark mode, type, spacing, radius, logo |
| ✨ Icons | `10:5` | ~1650 icon symbols in 4 libraries |
| ⚛️ Atoms | `10:6` | Button, Input, Checkbox, Badge, IconButton, Select, … |
| 🧬 Molecules | `10:7` | FormField, Cell, MenuItem, KPI Card, Kanban*, … |
| 🦠 Organisms | `10:8` | Sidebar, TopBar, PageHeader, Modal, KanbanColumn, … |
| `--- Conception ---` | `10:9` | divider |
| 🎨 Design | `10:12` | **assembled reference screens** — see §12 |

(`10:10` / `10:11` do not resolve — deleted pages.)

### ⚠ Read the standalone component, not just its instance in a template

An **instance** on the Design page only shows the props that instance happens to
enable — `get_design_context` renders the resolved output, so disabled slots are
invisible. `TableToolbar` read from the `Table / Contacts` template looked like 3 props;
the standalone component (`1784:33159`) has **7**, including a whole FolderFilter group.

So for any BUILD-TO-DS component: read the **component node from §9** to get the real
prop surface, and read the **template instance** only to see how it's composed and
laid out. Both, not either.

### ⚠ Read `references/usage-rules.md` before building any component

§4 below gives you a component's **size and variant matrix**. The Principles page gives you
the **decision rules** — which variant to pick, what each prop means, and what not to do.
That content is extracted into **`references/usage-rules.md`** in this skill folder. Read the
relevant entry before you build. It is the difference between a technically-correct component
and a correctly-*used* one.

A few rules from it that are violated most often:

- **One Primary button per view.** Two Primaries side by side is an explicit Don't.
- **Destructive actions always get a confirmation modal.**
- **Every IconButton needs a Tooltip.** Mandatory, not optional.
- **Always wrap Input/Textarea in a FormField** in a form — bare Input only for inline
  table cells and toolbar search.
- **Badge ≠ StatusChip ≠ Chip.** Badge = non-interactive free label; StatusChip = controlled
  business state from the data model; Chip = clickable filter. In a table, business status
  goes in `Cell Type=Status` (which embeds a StatusChip) — **never a Badge**.
- **Checkbox vs Switch:** Switch = takes effect immediately; Checkbox = needs a Save step.
- **Never put a primary CTA in a Toolbar** — main actions belong in the PageHeader.
- **Table `Actions` column is always last, fixed width. `Number` cells align right.**

Variables live in the file's **`Semantic`** and **`Typography`** collections plus the
primitive ramps. They are **local to the file, not published as a library** — so
`Figma:search_design_system` will NOT find them (it returns the old published
libraries instead, which is a trap). Read them with
`Figma:get_variable_defs(fileKey="nIMtO7v8dDamI8b2vnMcRc", nodeId="<ID>")` scoped to a
node that uses them — e.g. `28:98` returns the full semantic set.

### Dark mode — do not implement yet

The Foundations page documents a dark mode (node `2143:386`) with these rules:

- **Elevation ladder:** `surface/app-background` (darkest) < `surface/canvas` < `surface/subtle` < `surface/muted`. Never give the page background and the cards the same value — the screen reads as one slab.
- **Brand:** `brand/primary` stays the colour of *fills* (primary button, active nav, pagination pip) with white on top. `brand/on-surface` carries the brand on a neutral surface (text, icons, links) and lightens in dark to stay legible. **Never paint text with `brand/primary` in dark** — contrast falls to 2.25:1.
- **`-subtle` tokens** in dark are dark tinted surfaces. Never the light-mode value, never the full colour.
- **`surface/header`** follows the light logic: one step *lighter* than the canvas, not darker.
- **Borders:** `divider` and `subtle` share the most discreet step; `section` and `default` the median; `field` a marked-enough step to hold the 3:1 threshold for field outlines.

**The dark hex values are not readable via the MCP variable API** (it resolves the
default mode only). `utils/designSystem.js` is light-only by design. Do not add a
dark theme by guessing — it needs a `use_figma` extraction pass first. There is an
`Atoms / ThemeSwitch` component (`1786:4523`) waiting for it.

---

## 1. Stack & styling rules

| Rule | Value |
|------|-------|
| Framework | React 19 (functional components + hooks), built into the Vite `ax-prototypes` app |
| File output | A feature at `src/features/<Folder>/<File>.jsx` (folder + filename asked from the user) — never a standalone HTML file |
| Styling | Inline `style={{}}` props — **no Tailwind**, no external CSS |
| Font | `'Inter', sans-serif` — always via `DS.ff`. Monospace (`Roboto Mono`) via `DS.ffm`, paired with `TY.monoMd` |
| Token objects | **Import** `{ DS, TY }` from `utils/designSystem` and `Ico` from `utils/icons` — NEVER declare them in a feature file (see §0) |
| Shared components | **Import** `Btn`, `IconBtn`, `Field`, `Checkbox`/`Toggle`, `Tag`/`StatusBadge` etc. from `components/*` per the design-consistency manifest — only build what the manifest marks BUILD-TO-DS or BUILD-CUSTOM |
| Text alignment | Always `textAlign: 'left'` — never centre-align labels, fields, or body text unless Figma explicitly shows it |
| Copy language | **English only** — all labels, titles, buttons, empty/error copy in English (never French) |
| Card padding | `Card` has **no default padding** — always pass `style={{ padding: … }}` (e.g. `padding: 16`) |
| Page header | Use the shared `PageHeader` component on every page — never hand-roll the header banner |
| Radius | Use the scale: `radiusSm 2` / `radiusMd 4` / `radiusLg 8` / `radiusPill 999`. **6px no longer exists** — `radiusButton` is now 4px |
| No `<form>` tags | Use `onClick` / `onChange` handlers exclusively |
| Hover effects | `onMouseEnter` / `onMouseLeave` on `e.currentTarget.style` |
| Dropdowns | Close via `useRef` + `document.addEventListener("mousedown", …)` cleaned up in `useEffect` return |
| State updates | Always spread / map — never mutate in place |
| Unique IDs | Module-level counter: `let _uid = 1; const uid = () => String(_uid++)` |

---

## 2. Colour tokens — `DS` constant

Two layers: **primitives** (what the colour is) and **semantic aliases** (when to use it).
Always reach for a semantic token first. Fall back to a primitive only if no semantic token exists for your use case.

Source: Foundations › Colors – Tokens (node `28:98`). Slash paths become camelCase:
`text/secondary` → `textSecondary`, `action/primary/hover` → `actionPrimaryHover`.

```js
// ── Semantic — brand ────────────────────────────────────────────────────────
brandPrimary:       '#2575FC',  // main CTA fill, active nav, pagination pip. ONE per view.
brandPrimarySubtle: '#EFF4FF',  // tinted brand background
brandAccent:        '#017BFE',  // secondary brand blue (= Blue/500)
brandOnSurface:     '#2575FC',  // brand as text/icon/link ON a neutral surface
brandGradientFrom:  '#4F32FE',  // gradient start (violet)
brandGradientTo:    '#A23192',  // gradient end (magenta)

// ── Semantic — surface ──────────────────────────────────────────────────────
bgPage:         '#F4F9FF',  // ⚠ NOT in Figma — see note below
surfaceCanvas:  '#FFFFFF',  // cards, panels, modals  (alias: bgCard)
surfaceSubtle:  '#F4F5F5',  // alt table rows, toolbars, secondary panels (alias: bgSurface)
surfaceMuted:   '#DEE0E3',  // one step darker than subtle
bgIcons:        '#EFF4FF',  // icon chip behind page-header / card icons

// ── Semantic — border ───────────────────────────────────────────────────────
borderSubtle:  '#F4F5F5',  // hairline dividers
borderDefault: '#DEE0E3',  // cards, table cells, inputs
borderStrong:  '#9A9EA5',  // emphasised outlines
borderFocus:   '#2575FC',  // input focus/active
borderError:   '#DC2626',

// ── Semantic — text ─────────────────────────────────────────────────────────
textDefault:   '#073973',  // body, labels, headings — deep NAVY, not charcoal
textStrong:    '#073973',  // headings
textSecondary: '#3E4E65',  // supporting labels, metadata
textMuted:     '#9A9EA5',  // de-emphasised metadata
textDisabled:  '#AFB6C1',
textInverse:   '#FFFFFF',  // on dark/coloured bg
textOnBrand:   '#FFFFFF',  // on a brand fill

// ── Semantic — feedback (always use the full pair: fg + subtle bg) ──────────
feedbackSuccess: '#16A34A',  feedbackSuccessBg: '#DEF9F4',
feedbackError:   '#DC2626',  feedbackErrorBg:   '#FFEBE8',  feedbackErrorText: '#991B1B',
feedbackWarning: '#FE9D55',  feedbackWarningBg: '#FCEDDE',
feedbackInfo:    '#017BFE',  feedbackInfoBg:    '#EFF4FF',

// ── Semantic — action ───────────────────────────────────────────────────────
actionPrimary:            '#2575FC',
actionPrimaryHover:       '#0D69D4',
actionPrimaryActive:      '#0D69D4',
actionPrimarySubtle:      '#EFF4FF',
actionSecondaryBorder:    '#1F2937',  // ⚠ secondary is NEUTRAL now, not blue
actionSecondaryHover:     '#9A9EA5',
actionSecondaryTextHover: '#2575FC',
actionTertiaryHover:      '#F4F5F5',
actionTertiaryTextHover:  '#1F2937',
actionDanger:             '#DC2626',
actionDangerHover:        '#991B1B',
actionDisabledBg:         '#DEE0E3',
actionDisabledText:       '#AFB6C1',

// ── Primitives — only when no semantic token fits ───────────────────────────
neutral0   '#FFFFFF'  neutral100 '#F4F5F5'  neutral200 '#DEE0E3'  neutral300 '#AFB6C1'
neutral500 '#9A9EA5'
slate400   '#94A3B8'  slate500   '#64748B'  slate700   '#3E4E65'  slate900   '#1F2937'
slate950   '#151B26'
blue100    '#EFF4FF'  blue200    '#C6E2FF'  blue300    '#96C2FE'  blue500    '#017BFE'
blue600    '#0D69D4'
teal100    '#DEF9F4'  teal200    '#B4EBE2'  teal300    '#7ECFC2'  teal500    '#34B0A1'
green600   '#16A34A'  green800   '#14532D'
orange100  '#FCEDDE'  orange400  '#FE9D55'  orange800  '#78350F'
red100     '#FFEBE8'  red400     '#F87171'  red600     '#DC2626'  red800     '#991B1B'
purple300  '#A78BFA'  purple400  '#6B52FE'  purple800  '#3B2A7A'
pink300    '#D97BB0'  pink700    '#A23192'
```

**`brandPrimary` (#2575FC) is NOT part of the Blue ramp** — `blue500` is `#017BFE`
(= `brandAccent`). Don't use `blue500` when you mean the brand blue; use
`actionPrimary`.

### Known token gaps — do not invent values

| Token | Status |
|-------|--------|
| `bgPage` / `surface/app-background` | Named in the dark-mode prose but **not bound to any swatch**, so no published light value. Code keeps `#F4F9FF` from the 2026 rebrand. |
| `surface/header`, `border/field`, `border/section`, `border/divider` | Same — referenced in the dark-mode rules only. No published values. |
| `feedback/error-text` | Dropped from the new DS. Code maps it to `red800` (#991B1B), matching the old intent. |
| `Blue/400`, `Purple/500` | Each carries a **fill/label conflict** on Foundations — Blue/400's fill renders `#2575fc` but its label reads `#3F98FD`; Purple/500's label reads `#4F32FE` but the fill resolves `#2575fc`. Confirm with the designer before relying on either. |
| `brandMintInk`, `brandYellowInk` | Not in the DS at all — locally darkened variants for thin lines/text on white. Keep local. |

If a design needs one of these, ask the user rather than guessing.

### ⚠ Unbound swatches — the trap that breaks colour reads

**`get_variable_defs` only returns variable-BOUND values.** Foundations documents 40
primitive swatches; only 32 are bound, so the variable API silently omits eight:
`Blue/400`, `Purple/500`, **`Purple/900` #180636**, **`Coral/500` #FF7C6D**,
**`Pink/600` #B93177**, `Yellow/200` #FAEA87, `Mint/400` #6FE8B8 — plus one it does
show under a different story. Reading colours *only* via variables produced three wrong
values in this repo before it was caught.

**Always read Foundations with `get_design_context` on node `26:9` (Primitives) and
`28:98` (Tokens), not with `get_variable_defs`.** The rendered swatches carry both the
token name and its hex label.

Same lesson as the type scale: **Foundations + the variable API together are still an
incomplete view of the DS.** When a value matters, read the rendered node.

Two further cautions on the Tokens section (`28:98`):

- It is badged **WIP** by the designer ("Tokens sémantiques — aliasés sur les primitives,
  responsive Light/Dark"). Expect churn.
- Its **`→ Primitive` alias annotations are unreliable** — roughly nine disagree with the
  actual ramp (e.g. `text/muted` #9a9ea5 is labelled "→ Neutral/200" but Neutral/200 is
  #dee0e3; `feedback/warning-subtle` #fcedde is labelled "→ Blue/100"). **Trust the hex,
  not the arrow.** Don't rebuild the semantic layer from the alias column.

`DS` also carries a **legacy alias block** (`white`, `neutral700/800/900`,
`green100/400/500`, `purple*`, `amber*`, `rose*`, `indigo*`, `navy`, …) mapping dropped
names onto their nearest new token, so existing features keep compiling. **Do not use
these in new code.**

---

## 3. Typography tokens — `TY` constant

Always set `fontSize`, `fontWeight`, **and** `lineHeight` together.
Apply via spread: `style={{ ...TY.bodyMd, color: DS.textDefault, fontFamily: DS.ff }}`.

Source: Foundations › Typography (node `35:258`). These eight styles are the complete scale.

```js
displayLg:  { fontSize: 40, fontWeight: 700, lineHeight: '48px' }, // Inter Bold — hero numbers, landing titles
headlineLg: { fontSize: 28, fontWeight: 600, lineHeight: '36px' }, // page titles — one per page max
titleMd:    { fontSize: 18, fontWeight: 600, lineHeight: '24px' }, // card titles, modal headings, section labels
bodyMd:     { fontSize: 14, fontWeight: 400, lineHeight: '20px' }, // default body, buttons, inputs — MOST USED
bodyMdBold: { fontSize: 14, fontWeight: 600, lineHeight: '20px' }, // table headers, form group labels
bodySm:     { fontSize: 13, fontWeight: 400, lineHeight: '18px' }, // dense secondary copy
labelMd:    { fontSize: 12, fontWeight: 500, lineHeight: '16px' }, // table cells, captions, error text
headlineMd: { fontSize: 22, fontWeight: 700, lineHeight: '28px' }, // Inter BOLD — PageHeader title, Avatar XL
labelLg:    { fontSize: 14, fontWeight: 500, lineHeight: '20px' }, // Button Md, table identity column
labelXl:    { fontSize: 16, fontWeight: 500, lineHeight: '24px' }, // Button Lg
captionSm:  { fontSize: 11, fontWeight: 400, lineHeight: '16px' }, // PageHeader meta — SMALLEST in the DS
monoMd:     { fontSize: 12, fontWeight: 500, lineHeight: '16px' }, // pair with DS.ffm (Roboto Mono)

weightRegular: 400,  weightMedium: 500,  weightSemiBold: 600,  weightBold: 700,
```

**Established aliases** (kept so existing features compile — prefer the names above in new code):

| Alias | Maps to | Note |
|-------|---------|------|
| `h1` | `displayLg` | 40/48 700 |
| `h2` | `headlineLg` | 28/36 600 — exact match |
| `h3` | — | 20/28 600. 20px still unconfirmed — no component read so far uses one |
| `h4` | ~`labelXl` | 16/22 600 → DS 16px step is 16/24 **500**, not 600 |
| `h5` | `bodyMdBold` | line-height changed 18 → 20 |
| `b1` | ~`labelXl` | 16/22 400 → DS 16px step is 16/24 **500**, not 400 |
| `b2` | `bodyMd` | line-height changed 18 → 20 |
| `b3` | `labelMd` | weight changed 400 → **500** |

The DS has no 12px-regular: all 12px text is Medium 500. The `Label/*` family is the
UI-control scale (buttons, chips, inputs) and runs 12/14/16px all at weight 500 —
distinct from `bodyMd` (14/20/**400**) and `bodyMdBold` (14/20/**600**), which are for
prose. Pick `label*` for anything inside an interactive control.

---

## 4. Components

> **Verification status.** The sizes and variant matrices below are read from Figma
> node metadata and are reliable. Per-component **padding, gaps and colour
> assignments are NOT verified** — call `get_design_context` on the node ID before
> building or restyling any component. Do not treat the visual details here as
> pixel-accurate.

### 4.1 Button (Atoms, node `455:322`)

**36 variants:** `Variant` × `Size` × `State`.

| Axis | Values |
|------|--------|
| Variant | `Primary` · `Secondary` · `Ghost` · `Destructive` |
| Size | `Sm` (h 28) · `Md` (h 36) · `Lg` (h 44) |
| State | `Default` · `Hover` · `Disabled` |

Plus three boolean props: `Show Icon Left` · `Show Icon Right` ·
**`Show Label`** (false = icon-only → use `IconButton` instead).

`Ghost` replaces the old `Tertiary`. `Destructive` is new — use `actionDanger` /
`actionDangerHover`. Heights changed from the old 32/40 to **28/36/44**.

Type: `Sm` → `TY.labelMd`, `Md`/`Lg` → `TY.bodyMd`. Radius: `DS.radiusMd` (4).

**Variant choice is specified — don't guess.** Primary = the one main action (Save/Create/
Confirm), max one per view. Secondary = Cancel/Back/Export, always next to a Primary. Ghost =
tertiary, never a form's main CTA. Destructive = irreversible, **always with a confirmation
modal**. Full decision tree in `references/usage-rules.md`.

### 4.2 IconButton (Atoms, node `525:101`)

**36 variants:** `Kind` × `Color` × `State` × `Size`.

| Axis | Values |
|------|--------|
| Kind | `Filled` (strong primary) · `Outline` (identified secondary) · `Ghost` (discreet, dense zones) |
| Color | `Default` · `Danger` (destructive: delete/remove) |
| State | `Default` · `Hover` |
| Size | `Sm` (28×28) · `Md` (32×32) · `Lg` (36×36) |

**Every IconButton must carry a Tooltip** (mandatory per the Principles page). Use IconButton
only where a label won't fit — toolbars, table cells, list headers; a labelled `Btn` is always
preferred when there's room.

### 4.3 Input (Atoms, node `460:84`) & FormField (Molecules, node `464:107`)

**Input — 12 variants:** `State` (`Default` · `Focus` · `Error` · `Disabled`) ×
`Icon` (`False` · `True` (left) · `Right`). Size **240 × 36** — height changed from 40 to **36**.

**FormField — 8 variants:** `State` (`Default` · `Focus` · `Error` · `Disabled`) ×
`Required` (`false` · `true`). Size 280 × 76 (label + input + message slot).
All states are the same height — no layout shift.

**Textarea** (Molecules, node `887:334`): same 8-variant matrix, 280 × 135.

**Select** (Atoms, node `556:2972`): 6 variants — `State` (`Default` · `Open` ·
`Disabled`) × `HasValue` (`false` · `true`). Size 240 × **44**.

> ⚠ Input is 36px tall but Select is 44px in the same form row. This looks like a DS
> inconsistency — raise it with the designer rather than silently picking one.

**SelectField** (Molecules, node `2106:426`): Select + label wrapper, 280 × 84.

### 4.4 Selection controls (Atoms)

| Component | Node | Variants |
|-----------|------|----------|
| Checkbox | `458:65` | `State` (`Unchecked` · `Checked` · `Indeterminate`) × `Disabled` — 16×16 |
| Radio | `459:46` | `Selected` × `Disabled` — 16×16 |
| Switch | `459:55` | `Value` (`Off` · `On`) × `Disabled` — 36×20 |

### 4.5 Badge, StatusChip, Chip, Tag (Atoms)

**Badge** (`523:73`): `Kind=Subtle` × `Color` (`Primary` · `Accent` · `Success` ·
`Warning` · `Danger`) — 48×20. Use the feedback `*Bg` + fg pairs.

**StatusChip** (`524:80`): `Status` (`Active` · `Pending` · `Inactive` · `Archived`) — h 24.

**Chip** (`556:2973`): single variant, 69×28 — the toggle filter pill.

Badge and StatusChip are distinct components in the DS. `radiusPill` (999) for both.

### 4.6 Avatar & notifications (Atoms)

**Avatar** (`47:8`): `Size` = `Sm` 24 · `Md` 32 · `Lg` 40 · `XL` 64. Circle, initials SemiBold.
Initials are **auto-computed** — pass the full name in the `Initials` prop, not pre-cut letters.
Sizing intent: `Sm` compact tables / activity feeds · `Md` lists and menus · `Lg` contact
record or profile where identity is central.
**NotificationBadge** (`47:9`): 20×20 count bubble. **NotificationDot** (`47:11`): 8×8 unread dot.

### 4.7 Tooltip (Atoms, nodes `462:49` bottom, `1305:32925` left)

Two placements only — bottom and left. h 28.

### 4.8 Table system (Molecules)

The table is built from **`Cell`** (`530:185`) — **58 variants**, `Type` × `Background`:

| Axis | Values |
|------|--------|
| Type | `Text` · `Number` · `Input` · `Checkbox` · `Empty` · `Actions` · `Switch` · `Tags` · `Status` · `Group` · `Total` · `Drag` · `TitleDescription` |
| Background | `Base` · `Alt` · `Selected` · `Muted` · `Header` |

Extra options: **`Sortable`** · **`Has count`**.

**Built in `components/Table.jsx` — the whole matrix.** Declare a cell type per column
(`type: 'status'`, `'tags'`, `'switch'`, `'total'`, `'group'`, `'drag'`,
`'titleDescription'`, …); `Cell` is exported for standalone use. Notes from the verified
spec (`get_design_context`, 2026-09):

- **Headers** are `Type=Text|Number, Background=Header`: label `labelMd` in
  `textSecondary`, gap 8, **16px** sort icon, Number right-aligned. The filter-input
  header (`Type=Input, Background=Header`) is a *separate variant* — opt in per column
  with `filter: true`, don't use it as the default.
- `Alt` and `Muted` resolve to the **same** value (`#F4F5F5`) — a DS redundancy.
- `Total` forces `surfaceSubtle` **even on `Background=Base`**.
- The `Actions` cell holds **two** 28px icon buttons in the DS, not one.
- `TitleDescription` has **no fixed height** (title `bodySmBold` 13/18 + description
  `captionSm` 11/16); every other type is 48px.

Standard cell 160 × 48; `TitleDescription` is 160 × 62.

**Construction convention (from the Principles page):** *the header row is the master
component and the data rows are its instances.* Compose rows from Cells — never style `<td>`
ad hoc. Also: `Number` aligns **right**, `Text` aligns left; the `Actions` column is
**always last with a fixed width**; `Status` embeds a **StatusChip — never a Badge**;
`Group` spans the full width on an `Alt` background.

**TableToolbar** (`1784:33159`): 1092 × 60 — above the table.
**PaginationBar** (`1774:4443`): 1092 × 60 — below the table.
**Pagination** (Molecules `470:109`, 332 × 36; Organisms `1321:463`, 1440 × 60).
**SortHeader** is codebase-only — no DS counterpart.

### 4.9 Menus & navigation (Molecules)

**MenuItem** (`554:2953`): **24 variants** — `Kind` (`Text` · `WithIcon` ·
`WithCheckbox` · `WithRadio` · `WithChevron` · `WithChevronValue`) × `State`
(`Default` · `Hover` · `Selected` · `Disabled`). 240 × 40.
**MenuSection** (`558:2960`): `HasLabel` (`false` · `true`) — group divider inside a menu.
**NavItem** (`50:52`): `Compact` × `Active` × `SubmenuState` (`None` · `Closed` · `Open`). 248 × 44; compact 36 × 36.
**NavSubItem** (`52:27`): `Active` — 248 × 36.
**Breadcrumb** (`696:324`): `Variant=Simple` — 289 × 40.
**Tab** (`465:93`): `Active` — 120 × 48.
**SearchBar** (`171:44`): 190 × 40. **UserMenu** (`2137:402`): `Compact` — 160 × 40 / 40 × 40.
**UserCard** (`52:35`): `State` (`Open` 248 × 48 · `Close` 36 × 36).

### 4.10 KPI Card (Molecules, node `2006:6803`)

`Type` = `Stat` (260 × 128) · `Donut` (351 × 200) · `Progress` (480 × 226).
`Label`, `Value` and `Delta` are **the same props across all three types**.

Pick by data shape: `Stat` = a raw number with its variation · `Donut` = a breakdown into
categories · `Progress` = a numeric goal against a target.

### 4.11 FileUpload (Molecules)

**Dropzone** (`2016:317`): `State` (`Default` · `Dragover` · `Disabled`) — 480 × 158.
**FileItem** (`2016:345`): `State` (`Uploading` · `Success` · `Error`) — 480 × 100.
**Composite** (`2016:40784`): 480 × 378.

### 4.12 Kanban (Molecules + Organisms)

| Component | Node | Size |
|-----------|------|------|
| KanbanCard | `2080:40722` | 288 × 188 — `State` (`Default` · `Hover`) |
| KanbanColumn | `2071:40432` | 320 × 1008 |
| KanbanDropTarget | `2111:465` | 288 × 100 |
| KanbanInlineAdd | `2111:467` | 288 × 108 |
| AssigneeDropdown | `2111:464` | 256 × 124 |

`State=Hover` reveals the card's edit action **without changing card height**. Reassignment,
drag-and-drop and quick-add are deliberately **three separate components**, not card variants —
place them per context.

`KanbanColumn` props: `Show card 3` / `Show card 4` (disable both for a near-empty column) ·
`Has drop target` (only during an active drag) · `Show inline add` (swaps the "Add a card"
link for `KanbanInlineAdd`). The coloured `AccentRail` at the top is a **fixed gradient baked
into the component — there is no per-column colour customisation.**

### 4.13 Organisms — app shell

**Do not build these** (§0.4) — they already exist in `layout/`. Listed for reference only.

| Component | Node | Size |
|-----------|------|------|
| Sidebar | `56:412` | `State` (`Open` 288 · `Close` 68) × h 1080 |
| TopBar | `172:138` | 1440 × **72** |
| SubNavBar | `465:224` | 1440 × **48** |
| Toolbar | `466:163` | 1440 × 56 |
| ScreenBackdrop | `2041:340` | 1440 × 72 |

Shell behaviour that constrains your page:

- **TopBar** is `position: fixed`, global, identical on every page. Its options
  (`ShowBreadcrumb`, `ShowSearch`, `ShowNotifications`, `ShowMessages`, `ShowSettings`,
  `Has dark mode switch`) are app-level, not per-screen. **The Breadcrumb renders inside
  the TopBar — never in your page content.**
- **Sidebar** `Close` forces every NavItem to `Compact=true` + `SubmenuState=None`, with
  Tooltips supplying the labels. Open/Close persists in localStorage.
- **SubNavBar** is for navigating between views of a section — **not for filtering**.
  Filtering goes in a Toolbar with Chip/Select.
- **Toolbar** sits above a table or results list and holds search / filters / column
  visibility / export. **Never put a primary CTA there** — it belongs in the PageHeader.

### 4.14 PageHeader (Organisms, node `2053:459`)

Verified with `get_design_context` 2026-09 — `Default` `466:150`, `Contact` `2053:449`.
Built in `components/PageHeader.jsx`.

Shared shell: `borderSection` 1px · radius **12** · `shadowSm` · padding **24px 32px** ·
actions right, gap 8, **Secondary before Primary**.

| | Default | Contact |
|---|---|---|
| Background | `surfaceCanvas` | **`surfaceHeader`** #EFF4FF |
| Height | fixed **88** | auto |
| Title | `headlineMd` (Inter **Bold** 22/28) `textStrong` | same, + optional status: 6px dot + `labelLg` in `feedbackSuccess` |
| Sub-line | `captionSm` (**11**/16) `textMuted` | details row: `bodySm` `textSecondary`, 4px dots between items |
| Leading | — | **Avatar XL 64**, `tone="brand"` (brand fill, white Bold initials) |

Options: `Show primary action` · `Show secondary action` (both false = no actions).
**This is where a page's main CTAs live** — not in the Toolbar.

> ⚠ **The DS PageHeader contradicts three standing project rules.** It is implemented
> DS-first, with each conflict switchable rather than silently resolved:
> 1. *"Never a white banner — the header sits transparently on the page background."*
>    The DS Default is a white bordered card with a shadow.
> 2. *"Keep page headers compact — title 20px/600, subtitle ~13px."* The DS is 22px/700
>    in a fixed 88px shell.
>    → `variant="plain"` restores the transparent, compact rendering for both.
> 3. *"The subtitle is always a page DESCRIPTION, never an item count."* The DS sub-line
>    is literally `"1 234 contacts · Mis à jour il y a 5 min"`.
>    → `description` keeps sentence semantics; `meta` is the opt-in slot for the DS
>      count/freshness line. Neither is forced.
>
> Note the 11px `captionSm` slot was designed for a short count line, not a 60-character
> sentence. If a page passes a long `description`, prefer `variant="plain"` or shorten it.

Use the shared `components/PageHeader.jsx` — icon badge + title + description
subtitle + right-side CTAs. **The subtitle is always a short description of the page,
never an item count** ("Manage your consents", not "42 consents"). The `Contact` type
is not yet implemented in the shared component — flag it if a spec needs it.

### 4.15 Modal (Organisms, node `1223:3646`)

Base **480** wide (was 665). Radius `radiusLg`. Four documented compositions:

| Modal | Node | Size |
|-------|------|------|
| Base | `1223:3646` | 480 × 332 |
| Ajouter une opportunité | `2099:41154` | 560 × 460 |
| Ajouter un filtre | `1225:3688` | 480 × 731 |
| Contacts (filtre) | `1227:3713` | 480 × 246 |
| Configurer les colonnes | `1229:3734` | 360 × 466 |

The named modals are French in Figma — **your implementation copy stays English** (§1).

### 4.16 ThemeSwitch (Atoms, node `1786:4523`)

`Mode` (`Light` · `Dark`) — 96 × 36. **Do not wire this up** until dark-mode values are
extracted (see "Mandatory first step").

---

## 5. Page layout structure

The general structure of all main pages:
Header with left PageTitle infos and on the right Call-To-actions.
The NavBar is optional, only when required by the specifications.

**The page header is a shared component — import it, don't rebuild it.** Every page uses
`PageHeader` from `components/PageHeader.jsx`.

```
OPTIONAL — already provided by the app shell, do not rebuild
┌─ TopBar (surfaceCanvas, borderBottom borderDefault, h:72) ────────────────┐
│  Logo │ nav │ SearchBar │ UserMenu                                        │
└───────────────────────────────────────────────────────────────────────────┘
┌─ SubNavBar (h:48) ────────────────────────────────────────────────────────┐
│  Links │ active: 4px bottom bar                                           │
└───────────────────────────────────────────────────────────────────────────┘

Root: bg DS.bgPage (#F4F9FF)

┌─ PageHeader — Type=Default (surfaceCanvas, borderBottom borderDefault, h:88) ─┐
│  Icon badge │ TY.titleMd title │ TY.bodyMd subtitle        Primary CTA     │
└───────────────────────────────────────────────────────────────────────────┘
┌─ Toolbar (h:56) ──────────────────────────────────────────────────────────┐
│  Filters / search / view controls                                         │
└───────────────────────────────────────────────────────────────────────────┘
┌─ Content (Card: surfaceCanvas, border borderDefault, r:radiusLg, p:16) ───┐
│  Cell-composed table, or KPI Card row, or feature content                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Icons — Figma reference

The Icons page (`10:5`) carries **~1650 symbols** across four libraries:

| Library | Node | Use |
|---------|------|-----|
| **Thin Library** | `2224:926` | **Default.** 20 categorised subsections. |
| Library | `46:102` | Older general set |
| Fat Icons | `122:15` | Filled variants |
| Thin Library Legacy | `515:4074` | Superseded — avoid |

**Thin Library subsections** — go straight to the category node:

| Category | Node | Category | Node |
|----------|------|----------|------|
| Arrows | `2224:934` | Charts | `2224:1004` |
| General | `2224:941` | Profiles & Users | `2224:1011` |
| Finance | `2224:948` | Layout | `2224:1018` |
| Media | `2224:955` | Development | `2224:1025` |
| Alerts | `2224:962` | Communication | `2224:1032` |
| Security | `2224:969` | Time | `2224:1039` |
| Images | `2224:976` | Editor | `2224:1046` |
| Files | `2224:983` | Shapes | `2224:1053` |
| Weather | `2224:990` | Education | `2224:1060` |
| Travel & Location | `2224:997` | | |

Figma names are **kebab-case** (`Icons / arrow-curve-left-down`); the codebase `Ico`
object is **PascalCase** (`ChevDown`). Map when you port one across.

Signature: `({ s=20, c=DS.actionPrimary })`. Stroke: `strokeWidth:1.5`,
`strokeLinecap:'round'`, `strokeLinejoin:'round'`, `fill:'none'`. Sizes: 12/14/16/18/20px.

`utils/icons.jsx` currently exports **69** icons — read it before adding anything.
Implementation rules are in §11.

---

## 7. Composed components

**Accordion**: `height: 48`, label left + chevron right, `borderBottom: DS.borderDefault`.
**CardSection**: Accordion + stacked FormFields.
**ContactSidebar**: two 416px panels (avatar + sections | tags + consents). No node in the new DS — treat as BUILD-CUSTOM and confirm with the user.

Anything not listed in §4 has no counterpart in the new DS. **Codebase-only components**
(no Figma node — do not assume a spec exists): `Toast`, `Skeleton`, generic `Card`,
`Banner`, `BannerTable`, `SortHeader`, `ConfirmSummaryCard`, `NameModal`, `Feedback`
(`EmptyState` / `ErrorState` / `ConfirmDialog`), `TopHeader`, `StatePreview`.
Reuse them as-is; if a spec needs them restyled, flag it — the DS has no authority there.

---

## 8. Feedback token usage rules

Always apply the **full pair** — never a single feedback token alone:

| Context | Background | Border/Icon | Text on bg |
|---------|-----------|------------|-----------|
| Success | `feedbackSuccessBg` | `feedbackSuccess` | `feedbackSuccess` |
| Warning | `feedbackWarningBg` | `feedbackWarning` | `feedbackWarning` |
| Error | `feedbackErrorBg` | `feedbackError` | **`feedbackErrorText`** |
| Info | `feedbackInfoBg` | `feedbackInfo` | `feedbackInfo` |

Error inputs: use `feedbackErrorText` (#991B1B) for field text — darker than
`feedbackError` (#DC2626) for contrast on the error background.

---

## 9. Figma node reference

File: **`nIMtO7v8dDamI8b2vnMcRc`** ("AX DESIGN SYSTEM")

**Principles (`10:2`)** — usage rules. Full extraction in `references/usage-rules.md`.

| Group | Node | | Group | Node |
|---|---|---|---|---|
| Actions | `2276:3013` | | Menus | `2276:3046` |
| Saisie (Input) | `2276:3019` | | Tableaux (Tables) | `2276:3053` |
| Affichage & statut | `2276:3027` | | Kanban | `2276:3060` |
| Navigation | `2276:3037` | | Overlays | `2276:3069` |

**Foundations (`10:4`)**

| Section | Node |
|---------|------|
| Colors – Primitives | `26:9` |
| Colors – Tokens | `28:98` |
| Dark mode rules | `2143:386` |
| Typography | `35:258` |
| Spacing | `32:248` |
| Radius | `32:292` |
| Logo | `54:351` |

**Atoms (`10:6`)**

| Component | Node | | Component | Node |
|---|---|---|---|---|
| Avatar | `47:8` | | Badge | `523:73` |
| NotificationBadge | `47:9` | | StatusChip | `524:80` |
| NotificationDot | `47:11` | | IconButton | `525:101` |
| Button | `455:322` | | Select | `556:2972` |
| Checkbox | `458:65` | | Chip | `556:2973` |
| Radio | `459:46` | | Tooltip (bottom) | `462:49` |
| Switch | `459:55` | | Tooltip (left) | `1305:32925` |
| Input | `460:84` | | ThemeSwitch | `1786:4523` |

**Molecules (`10:7`)**

| Component | Node | | Component | Node |
|---|---|---|---|---|
| NavItem | `50:52` | | Breadcrumb | `696:324` |
| NavSubItem | `52:27` | | Textarea | `887:334` |
| UserCard | `52:35` | | CarouselDots | `1973:6506` |
| SearchBar | `171:44` | | PaginationBar | `1774:4443` |
| UserMenu | `2137:402` | | TableToolbar | `1784:33159` |
| FormField | `464:107` | | KPI Card | `2006:6803` |
| Tab | `465:93` | | FileUpload | `2016:40784` |
| Pagination | `470:109` | | KanbanCard | `2080:40722` |
| Cell | `530:185` | | SelectField | `2106:426` |
| MenuItem | `554:2953` | | AssigneeDropdown | `2111:464` |
| MenuSection | `558:2960` | | KanbanDropTarget | `2111:465` |
| | | | KanbanInlineAdd | `2111:467` |

**Organisms (`10:8`)**

| Component | Node | | Component | Node |
|---|---|---|---|---|
| Sidebar | `56:412` | | Modal | `1223:3646` |
| TopBar | `172:138` | | Pagination | `1321:463` |
| SubNavBar | `465:224` | | ScreenBackdrop | `2041:340` |
| Toolbar | `466:163` | | KanbanColumn | `2071:40432` |
| PageHeader | `2053:459` | | | |

**Design — assembled reference screens (`10:12`)**

| Screen | Node | | Screen | Node |
|---|---|---|---|---|
| Layout / Navigation | `2052:42298` | | Light Mode / Dark Mode | `2052:44797` |
| Liste des contacts | `2052:37879` | | Modales | `2052:44813` |
| Page contact | `2052:43955` | | Tableau cellules 2 lignes | `2052:44806` |
| Filtres / Segmentation | `2052:44373` | | Kanban Pipeline | `2071:40637` |

```
https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/AX-DESIGN-SYSTEM?node-id=<NODE-ID-WITH-DASHES>
```

---

## 12. The Design page — assembled screens

Page `10:12` holds **full screens composed from the DS**, not component specs. Use them to
see how components combine — page rhythm, spacing between blocks, how a Toolbar sits above a
table, how a contact record lays out.

**When a spec resembles one of these screens, `get_design_context` the screen node** before
building. It answers layout questions the component nodes can't.

Two notes:

- `Tableau cellules 2 lignes` (`2052:44806`) is the reference for the `TitleDescription`
  cell type (the 62px-tall two-line row).
- **`Light Mode / Dark Mode` (`2052:44797`) is the most likely place to recover the dark-mode
  values** that `get_variable_defs` can't reach. If dark mode gets unblocked, start there.

---

## 10. Quick-start checklist

1. **Run `design-consistency`** → get the Component Manifest; resolve any conflicts.
2. **Ask the user** for the feature folder name + `.jsx` filename (§0).
3. **Import** `{ DS, TY }` from `utils/designSystem` + `Ico` from `utils/icons` + the
   REUSE components from `components/*`. Never declare these in the feature file.
3b. **Read `references/usage-rules.md`** for every component you touch — it carries the
   decision trees and Do/Don't from the Principles page. Not optional.
4. **Fetch Figma nodes** (§9) for every BUILD-TO-DS / EXTEND component, plus the matching
   assembled screen on the Design page (§12) when the spec resembles one. Remember the
   file's variables are local, not published — `search_design_system` won't see them.
5. **Semantic tokens first** — primitives only as fallback. Never use `blue500` when
   you mean the brand blue (`actionPrimary`).
6. **ASK before building anything not already in `components/`** (§0.6) — build-it vs
   `<Placeholder/>` is the PM's call, asked once and batched. Then: BUILD-TO-DS →
   fetch the node and build to spec; BUILD-CUSTOM → invent, and log it as an open
   question. Use existing libs (`recharts`/`highcharts`/`tabulator-tables`) for
   charts/tables. Never improvise a component that the DS already specs.
7. **Inline styles only** — no Tailwind, no CSS. `textAlign: 'left'` by default.
8. **Typography spread** — `{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textX }` always.
   Prefer the Figma names; `h3`/`h4`/`b1` have no DS counterpart.
9. **Feedback pairs** — bg + border + text together, never a single token (§8).
10. **Implement all states** — the DS ships Hover and Disabled for most atoms; match
    the variant matrix in §4 rather than inventing states.
11. **Page only** — never build/restyle the nav bar, sidebar, or app shell; the
    feature renders inside the existing layout. Use the shared `PageHeader`.
11b. **Lot ≥ 2** — extend the existing feature folder/files; reuse prior-lot screens,
    components, and mock data; add only this lot's additions. Never overwrite or duplicate.
11c. **English copy only**; `Card` needs explicit padding.
12. **Icons** — follow §11; reuse `Ico.*`, add new icons to `utils/icons.jsx`. Never use
    `<img>`, remote URLs, emoji, or Figma asset URLs for icons.
13. **No dark mode** — values aren't extracted yet. Don't guess.
14. **Hand off to `ship-prototype`** — it wires the route + sidebar, builds, and launches.
15. *ALWAYS* reuse the design system; never assume something not in it — ask the user.
    That includes the token gaps listed in §2, and the components whose usage rules the
    designer left unwritten (listed at the top of `references/usage-rules.md`).
16. **Respect the usage rules**, not just the specs: one Primary per view, Tooltip on every
    IconButton, confirmation modal on every Destructive action, Input wrapped in FormField,
    StatusChip (never Badge) for business status, no primary CTA in a Toolbar.

---

## 11. Icon implementation system — `Ico` object

### 11.1 Source of truth

The canonical icon catalog lives at `src/utils/icons.jsx`, exported as a default `Ico`
object (currently **69** icons). This file is the **single source of truth** — if an icon
exists there, use it. If it doesn't, generate it following the rules below and add it.

### 11.2 Signature & pattern

Every icon is a React functional component with exactly this signature:

```js
const Ico = {
  IconName: ({ s = 16, c = DS.actionPrimary }) => (
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
| Naming | PascalCase key in the `Ico` object matching the concept (e.g. `Filter`, `ChevDown`, `Campaigns`) |
| Default color | Choose the most common usage context. Interactive → `DS.actionPrimary`. Neutral/decorative → `DS.textSecondary` or `DS.textMuted`. Semantic → `DS.feedbackError`, `DS.teal500`, etc. |
| No external assets | **Never** use `<img src="...">`, Figma API asset URLs, emoji, or CSS filter tricks to render icons. All icons are pure inline SVG |

### 11.3 Using icons in components

```js
// In a button — pass s and c explicitly
<Btn iconLeft={<Ico.Plus s={16} c={DS.textOnBrand} />} label="Add" type="Primary" />

// In an IconButton
<IconBtn icon={<Ico.Eye s={16} c={DS.actionPrimary} />} type="Secondary" size="Small" />

// Inline in text — use s matching the text size
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
  <Ico.Mail s={14} c={DS.textSecondary} /> Email sent
</span>
```

Size guidance, matched to the DS button heights (§4.1):
- **Inside `Sm` buttons (h=28):** `s=14`
- **Inside `Md` buttons (h=36):** `s=16`
- **Inside `Lg` buttons (h=44):** `s=18` or `s=20`
- **Standalone / decorative:** `s=20`
- **Inline with `labelMd` text (12px):** `s=12` or `s=14`

### 11.4 Adding a new icon

1. **Find it in the Thin Library** — go to the category node in §6 and
   `get_design_context` on it, or on the specific icon symbol.
2. **Convert** the Figma output to the `({ s, c }) => <svg>` pattern:
   - Replace all hardcoded colours with `{c}`
   - Set `width={s} height={s}` on the root `<svg>`
   - Remove any Tailwind classes, `className`, or wrapper `<div>`
   - Use `strokeWidth`, `strokeLinecap`, `strokeLinejoin` (camelCase) for React
   - Use `fillRule`, `clipRule` (camelCase) not `fill-rule`, `clip-rule`
3. **Pick a default color** based on the most common context (see §11.2)
4. **Add the entry** to `utils/icons.jsx` with a PascalCase key
5. **Note it** in the open-questions log (Figma kebab name → `Ico` key)

If the concept isn't in the Thin Library, check Library / Fat Icons before designing a
new SVG. If you do design one, flag it as "icon not in Figma DS — custom SVG created".

### 11.5 What NOT to do

- ❌ `<img src="https://www.figma.com/api/mcp/asset/..." />` — remote URLs expire and break
- ❌ `<FigmaIcon src={...} />` with CSS filter colour hacks — fragile and non-standard
- ❌ Emoji as icons (`📈`, `📊`) — not DS-compliant, inconsistent across platforms
- ❌ Inventing icons without checking the existing `Ico` catalog first — leads to duplicates
- ❌ Pulling from **Thin Library Legacy** — it's superseded
