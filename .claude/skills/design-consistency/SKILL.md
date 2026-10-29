---
name: design-consistency
description: Component-scanner / resolver for Arenametrix prototypes. Runs BEFORE design-prototypes. Given a spec (or a list of UI elements to build), it (1) derives the components the spec needs, (2) scans the ax-prototypes codebase (components, utils, layout, features) for what already exists, (3) cross-references the Figma design system (file nIMtO7v8dDamI8b2vnMcRc) for anything missing, and returns a reuse-vs-build manifest so the prototyper imports existing code instead of redefining tokens/components. Triggers whenever a prototype/feature is about to be built, or when the user asks to "check design consistency", "find existing components", "what can I reuse", or before any design-prototypes run.
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

**The Figma DS is ahead of the code.** It ships ~47 components; the codebase has ~22.
So "not in the codebase" no longer means "invent it" — most of the time there IS a
Figma spec to build against. Distinguishing those two cases is now your main value
(see the verdict taxonomy in §3).

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
| CSS-variable token copy | `index.css` (`--ax-*`) — **live**: drives body bg, body text colour, h1–h5 | — |
| Icon catalog | `utils/icons.jsx` (`Ico` — default export, 69 icons) | `import Ico from '../../utils/icons'` |
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
| Missing-component placeholder | `components/Placeholder.jsx` (`Placeholder`) — dashed labelled box for a component that isn't built yet (§ the build-or-placeholder ask) | `import Placeholder from '../../components/Placeholder'` |
| **DS data table** | `components/Table.jsx` — `Table` (default), plus named `TableToolbar` and `PaginationBar` which are **usable standalone above/below any list, not just a table**. Built from `Table / Contacts` (`2052:38194`) + `Molecules/TableToolbar` (`1784:33159`). `TableToolbar` slots: column config · folder filter + add · options · search · secondaryAction · primaryAction | `import Table, { TableToolbar, PaginationBar } from '../../components/Table'` |
| Pagination | `components/Pagination.jsx` (`Pagination`) — prev/next pager (page/pages/setPage) | `import Pagination from '../../components/Pagination'` |
| Card surface | `components/Card.jsx` (`Card`) — white rounded container, **no default padding** (pass `style={{ padding }}`) | `import Card from '../../components/Card'` |
| Page header banner | `components/PageHeader.jsx` (`PageHeader`) — the shared top-of-page banner EVERY feature uses (icon badge + title + description subtitle + right-side CTAs). Subtitle is always a description, never an item count | `import PageHeader from '../../components/PageHeader'` |
| Filter chip | `components/Chip.jsx` (`Chip`) — toggle filter pill (≠ removable `Tag`) | `import Chip from '../../components/Chip'` |
| Toast | `components/Toast.jsx` (`Toast`) — transient bottom-centre confirmation | `import Toast from '../../components/Toast'` |
| Row actions menu | `components/ActionMenu.jsx` (`ActionMenu`) — single ⋯ that opens a dropdown of row actions (`items[{label,icon,onClick,danger,hidden}]`) | `import ActionMenu from '../../components/ActionMenu'` |
| Empty / error / confirm | `components/Feedback.jsx` (`EmptyState`, `ErrorState`, `ConfirmDialog`) | `import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback'` |
| Layout shell | `layout/Layout/AppLayout.jsx`, `AppLayout_bis.jsx` | wired in `App.jsx` |
| Nav / sidebar | `layout/Header/NavBar.jsx`, `SideBar.jsx`, `NewSideBar.jsx` | — |
| Existing features | `features/<Name>/*.jsx` | reference for patterns |
| Routing | `src/App.jsx` (`react-router-dom` `<Route>`s) | add a route here |

Import-path depth: a feature at `src/features/<Folder>/<File>.jsx` reaches shared
code with `../../` (two levels up to `src/`). Always compute the relative depth
from where the new file will live.

---

## The Figma DS coverage map

Figma file **`nIMtO7v8dDamI8b2vnMcRc`** — 8 content pages: **Principles `10:2`**,
Foundations `10:4`, Icons `10:5`, Atoms `10:6`, Molecules `10:7`, Organisms `10:8`,
**Design (assembled screens) `10:12`**.
Full node index lives in **design-prototypes §9** — this table is the reuse-resolution
view of the same data.

**The Principles page (`10:2`) is the usage authority** — anatomy, prop semantics, decision
trees, Do/Don't, when-to-use per component. It is extracted to
`.claude/skills/design-prototypes/references/usage-rules.md`. **Read it when resolving**, for
two reasons:

1. **It often settles a verdict.** A spec saying "status pill" resolves to `StatusChip`, not
   `Badge`, because the rules define Badge as a non-interactive free label and StatusChip as a
   controlled business state. A spec saying "filter pill" resolves to `Chip`. Cite the rule in
   the manifest so the prototyper doesn't re-litigate it.
2. **It names required companions.** Some components are never resolved alone:
   - `IconButton` → **always** also needs a `Tooltip`
   - `Input` / `Textarea` in a form → **always** wrapped in `FormField`
   - `Destructive` button → **always** a confirmation modal
   - table business status → `Cell Type=Status` (which embeds StatusChip)
   - `Radio` → always a group inside a FormField, never standalone
   - `Tab` → always inside a SubNavBar/TabBar container
   Add these to the manifest as their own line items — a spec that says "delete button" needs
   three entries, not one.

Some entries are unwritten in Figma (literal "Description" placeholders) — the reference file
lists which. **Never infer a rule for those**; flag them instead.

**Has a code equivalent → resolve to REUSE (or EXTEND where noted):**

| DS component | Node | Code | Gap to watch |
|---|---|---|---|
| Button | `455:322` | `Btn.jsx` | DS is Primary/Secondary/**Ghost**/**Destructive** × Sm 28/Md 36/Lg 44. Code still has `Tertiary` + 32/40 |
| IconButton | `525:101` | `Iconbtn.jsx` | DS is Filled/Outline/Ghost × Default/Danger × Sm/Md/Lg |
| Input | `460:84` | `Field.jsx` | DS height is **36** (was 40) |
| FormField | `464:107` | `Field.jsx` | DS adds a `Required` axis |
| Textarea | `887:334` | `Field.jsx` `TextArea` | 8-variant matrix |
| Checkbox / Radio / Switch | `458:65` / `459:46` / `459:55` | `Controls.jsx` | DS Checkbox adds `Indeterminate`; Switch is 36×20 |
| Select | `556:2972` | `Select.jsx` | DS height **44** |
| Chip | `556:2973` | `Chip.jsx` | — |
| Badge / StatusChip | `523:73` / `524:80` | `Tag.jsx` (`StatusBadge`) | DS splits these into two distinct atoms |
| Avatar | `47:8` | `Tag.jsx` (`Avatar`) | DS adds **XL 64px** |
| SearchBar | `171:44` | `Field.jsx` (`SearchField`) | partial |
| Pagination | `470:109` / `1321:463` | `Pagination.jsx` | — |
| KPI Card | `2006:6803` | `Kpi.jsx` | code has `Stat` only; DS adds **Donut** + **Progress** |
| MenuItem / MenuSection | `554:2953` / `558:2960` | `ActionMenu.jsx` | partial — DS has 24 MenuItem variants |
| Modal | `1223:3646` | `Modal.jsx` | DS base width **480** (was 665) |
| PageHeader | `2053:459` | `PageHeader.jsx` | DS adds a **`Contact`** type (h 112) |
| Sidebar / TopBar / SubNavBar / Toolbar | `56:412` / `172:138` / `465:224` / `466:163` | `layout/*` | **app shell — never build** (§0.4 of design-prototypes) |
| NavItem / NavSubItem / UserCard / UserMenu | `50:52` / `52:27` / `52:35` / `2137:402` | `layout/*` | app shell |

**In the Figma DS, NOT in the codebase → resolve to BUILD-TO-DS (there is a spec):**

| DS component | Node | Notes |
|---|---|---|
| ~~Cell / TableToolbar / PaginationBar~~ | `530:185` / `1784:33159` / `1774:4443` | **BUILT** — `components/Table.jsx`. Resolve a bordered data table to **REUSE `Table`**. The **full Cell matrix is implemented**: all 13 types (text · number · empty · actions · checkbox · switch · tags · group · total · drag · status · input · titleDescription) × 5 backgrounds, declared per column via `type`. Headers default to `Type=Text/Number, Background=Header`; the filter-input header is opt-in with `filter: true`. |
| ~~Badge / StatusChip / Switch~~ | `523:73` / `524:80` / `459:55` | **PARTIAL** — rendered DS-exact *inside* `Table`'s Cell (tags/status/switch) but **not yet standalone atoms**. `Tag.jsx` `StatusBadge` and `Controls.jsx` `Toggle` are pre-DS (Toggle is 32×18 vs the DS 36×20). Resolve a standalone badge/status/switch to **BUILD-TO-DS**, then swap `Table`'s provisional inline versions out. |
| Tooltip | `462:49`, `1305:32925` | bottom + left placements only |
| Breadcrumb | `696:324` | `Variant=Simple` |
| Tab | `465:93` | `Active` — 120 × 48 |
| NotificationBadge / NotificationDot | `47:9` / `47:11` | 20×20 count / 8×8 dot |
| SelectField | `2106:426` | Select + label wrapper |
| FileUpload | `2016:40784` | + Dropzone `2016:317`, FileItem `2016:345` |
| CarouselDots | `1973:6506` | — |
| KanbanCard / KanbanColumn | `2080:40722` / `2071:40432` | — |
| KanbanDropTarget / KanbanInlineAdd | `2111:465` / `2111:467` | — |
| AssigneeDropdown | `2111:464` | — |
| ScreenBackdrop | `2041:340` | — |
| ThemeSwitch | `1786:4523` | **Blocked** — dark-mode values not extracted. Do not resolve to build. |

**Codebase-only, no DS node → the DS has no authority here:**
`Toast`, `Skeleton`, `Card`, `Banner`, `BannerTable`, `SortHeader`, `ConfirmSummaryCard`,
`NameModal`, `Feedback` (`EmptyState`/`ErrorState`/`ConfirmDialog`), `TopHeader`,
`StatePreview` (prototype-only).

Resolve these to REUSE as-is. If a spec asks for one of them **restyled**, flag it —
there is no Figma spec to restyle against, so it needs a PM/designer decision.

---

## Token traps — check these every run

The token layer was re-synced to the new DS on 2026-08-27 (colours re-verified
2026-09). Six things bite:

1. **`DS.blue500` is NOT the brand blue.** It is `#017BFE` (= `brandAccent`).
   The brand blue is `DS.actionPrimary` (`#2575FC`). Flag any spec or prior-lot code
   reaching for `blue500` when it means the brand colour.
2. **The legacy alias block.** `DS` still exports dropped names (`white`,
   `neutral700/800/900`, `green100/400/500`, `purple*`, `amber*`, `rose*`, `indigo*`,
   `navy`, `coral`, …) mapped to their nearest new token, so old features compile.
   **New code must not use them.** Flag any appearing in the spec or a BUILD item.
3. **The type scale has a `Label/*` family that Foundations doesn't show.**
   `labelMd` 12/16/500 · `labelLg` 14/20/500 · `labelXl` 16/24/500 — plus
   `headlineMd` 22/28/**700** and `captionSm` **11**/16/400 (so 11px, not 12px, is the
   real floor). Five styles in total that Foundations does not display. The UI-control
   scale (buttons, chips, inputs), all weight 500. A **16px step does exist** (an
   earlier version of this skill wrongly said it didn't). `TY.h4`/`b1` are 16px at
   600/400, so they're near-misses on weight, not absent steps. 20px (`h3`) is still
   unconfirmed. Prefer Figma names: `displayLg headlineLg titleMd bodyMd bodyMdBold
   bodySm labelMd labelLg labelXl monoMd`.
3b. **Unbound swatches.** `get_variable_defs` returns only variable-BOUND values.
   Foundations has 40 primitive swatches; 8 are unbound and therefore invisible to it
   (`Blue/400`, `Purple/500`, `Purple/900` #180636, `Coral/500` #FF7C6D, `Pink/600`
   #B93177, `Yellow/200`, `Mint/400`). Reading colours via variables alone already
   produced three wrong values in this repo. **Verify any colour that matters with
   `get_design_context` on `26:9` / `28:98`.** Also: the Tokens section is badged **WIP**
   and its `→ Primitive` alias arrows are wrong in ~9 places — trust the hex, not the arrow.
4. **Tokens with no published value** — do not let anyone invent these:
   `bgPage` / `surface/app-background`, `surface/header`, `border/field`,
   `border/section`, `border/divider`, and the Coral / Yellow / Mint primitives
   (`DS.coral`, `DS.brandYellow`, `DS.brandMint`, `DS.brandMintInk`, `DS.brandYellowInk`).
   The code carries unverified legacy values for these. If a spec needs one, ask the user.
4b. **A faithful token can still be wired wrongly.** `DS.actionSecondaryBorder` /
   `actionSecondaryHover` hold the real `action/secondary/*` Foundations values, but the
   DS **Button** doesn't use them — its Secondary variant uses `border/default` +
   `surface/subtle`. `Btn.jsx` wires the wrong ones and renders a near-black border.
   When resolving a component, check which tokens the *component node* uses, not which
   token name sounds right.
5. **Two token copies must stay in step.** `utils/designSystem.js` (React inline
   styles) and `index.css` (`--ax-*`, live for body/h1–h5). A change to one without the
   other is drift — flag it as a conflict.

**No dark mode.** The DS documents one (node `2143:386`) but its hex values are not
extractable via MCP yet. If a spec asks for dark mode or a theme toggle, PAUSE and
tell the user it needs a `use_figma` extraction pass first.

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
(e.g. page header banner, KPI card, filter chips, tabs, table cells, area chart, timeline,
banner row, right side panel/drawer, status chip, empty/error/loading states). Every page
needs the shared `PageHeader` banner — always resolve it to REUSE.

**Then expand the list using the usage rules**: add every required companion component
(Tooltip for each IconButton, FormField around each form Input, confirmation modal for each
Destructive action, …). A spec's element count is always lower than the real component count.

### 3. Resolve each needed element to ONE verdict

Four verdicts — the middle two are the ones that changed:

- **REUSE** — an existing export covers it. Record the exact import path + the
  component's props/API (read the file to get the real signature, don't guess).
- **EXTEND** — an existing component is close but missing a prop/variant. Record
  what to add and whether it should be a wrapper in the feature folder vs a change
  to the shared component (default: wrapper — don't mutate shared components unless
  the user approves). Use the "Gap to watch" column above to spot these.
- **BUILD-TO-DS** — not in the codebase, but **there is a Figma node** (see the
  coverage map). Record the node ID and the variant matrix. The prototyper must
  `get_design_context` that node — not invent a design. Say explicitly whether it
  belongs in the feature folder or should be promoted to `components/` (a DS-specced
  component used by more than one feature should be promoted — ask the user).
- **BUILD-CUSTOM** — in neither the codebase nor the DS (e.g. an area chart, a
  campaign timeline). Record the library to use if relevant (repo already has
  `recharts`, `highcharts`, `tabulator-tables`) and the file it should live in.
  **Every BUILD-CUSTOM item is an open question** — it means the prototype will ship
  something with no design authority behind it. List them prominently.

**⚠ Every BUILD-TO-DS and BUILD-CUSTOM item is a PM decision, not a foregone build.**
`design-prototypes` §0.6 requires it to ask, once and batched, whether each missing
component should be **built** or left as a `<Placeholder/>`. Your job is to make that
ask cheap: collect all of them into a single `build_or_placeholder` list, each with
the name, the Figma node (or "not in the DS"), and **your recommendation with a
reason** — how many screens need it, whether a spec exists, how much it costs. The
prototyper asks the question; you supply the evidence.

### 4. Token + icon check
- Confirm every colour the spec implies maps to a `DS.*` **semantic** token; flag any
  that don't, and any that only map to a legacy alias.
- Run the five token traps above against the spec and any prior-lot code.
- Map every icon the spec needs to an existing `Ico.*` key. Missing icons are found in
  the Figma **Thin Library** (`2224:926`, 20 categories — see design-prototypes §6) and
  added to `utils/icons.jsx`, never redefined locally. Figma names are kebab-case;
  `Ico` keys are PascalCase — record the mapping.

### 5. Conflict scan
Flag and PAUSE on:
- A feature/page that already **redefines** `DS`/`TY`/`Ico` inline (must be replaced
  with imports).
- The spec asking for a component that duplicates an existing one under a different
  name — or one the DS already specs under a different name (e.g. a "status pill"
  that is really `StatusChip`).
- A route/feature name that already exists in `App.jsx` (collision).
- **New code using a legacy alias, `DS.blue500`-as-brand, or `TY.h3/h4/b1`.**
- **A spec requiring dark mode / a theme toggle** — blocked on value extraction.
- **A spec requiring a token with no published value** (trap 4).
- **The two token copies out of sync** (trap 5).

---

## Output — Component Manifest

Return exactly this structure (also render a readable summary to the user):

```
━━ COMPONENT MANIFEST — [feature name] ━━━━━━━━━━━━━

  App root: <path to dir with package.json+src>
  Import base from a feature file: ../../  (adjust to final folder depth)
  Figma DS: nIMtO7v8dDamI8b2vnMcRc

  TOKENS
  · DS, TY        → REUSE  import { DS, TY } from '<rel>/utils/designSystem'
  · Missing / unpublished tokens needed → [none | list]
  · Legacy aliases requested           → [none | ⚠ list]
  · Type steps with no DS counterpart  → [none | ⚠ h3/h4/b1]

  ICONS  (import Ico from '<rel>/utils/icons')
  · Reuse:  Plus, ChevDown, Eye, Download, Settings, Campaigns, …
  · Build-new (add to utils/icons.jsx): [name → Figma kebab-name @ category node | none]

  PRIOR-LOT CODE (lot ≥ 2 — reuse the feature's own existing files)
  · <Screen/comp from a prior lot> → REUSE/EXTEND  src/features/<Folder>/<File>.jsx
  · (none — first lot)

  COMPONENTS
  · Page header     → REUSE        PageHeader from '<rel>/components/PageHeader'  (every page)
  · Button          → REUSE        { Btn } from '<rel>/components/Btn'  props: type,size,iconLeft,…
  · Field/Input     → REUSE        { Field, TextArea } from '<rel>/components/Field'
  · Status chip     → EXTEND       Tag.jsx StatusBadge — DS splits Badge/StatusChip (523:73 / 524:80)
  · Table cells     → BUILD-TO-DS  Figma 530:185 — Cell, 13 Type × 5 Background
  · Tabs            → BUILD-TO-DS  Figma 465:93 — 120×48, Active axis
  · Area chart      → BUILD-CUSTOM (recharts available) — ⚠ no DS authority
  · Timeline        → BUILD-CUSTOM custom SVG — ⚠ no DS authority

  BUILD-OR-PLACEHOLDER — the PM must choose per item (design-prototypes §0.6)
  · Molecules/Tab   465:93    → recommend BUILD    (specced, used on 3 screens)
  · Maps/Full Map   —         → recommend PLACEHOLDER (not in the DS at all)
  · CarouselDots    1973:6506 → recommend PLACEHOLDER (decorative, 1 screen)

  ROUTING
  · Add <Route path="/<slug>" element={<NewFeature/>} /> in src/App.jsx
  · Route collision: [none | ⚠ /<slug> exists]

  USAGE RULES (from Principles 10:2 — cite so the prototyper doesn't re-decide)
  · Status column   → Cell Type=Status embeds StatusChip — NOT Badge
  · Delete action   → Destructive Btn + confirmation modal (2 items)
  · Each IconButton → + Tooltip (mandatory)
  · Unwritten rules for: [none | list of components with no Figma guidance]

  CONFLICTS / PAUSE
  · [none | ⚠ <file> redefines DS inline → import instead]
  · [⚠ spec requires dark mode — blocked, values not extracted]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```json
{
  "app_root": "string",
  "import_base": "../../",
  "figma_file": "nIMtO7v8dDamI8b2vnMcRc",
  "tokens": {
    "reuse": ["DS","TY"], "import": "…/utils/designSystem",
    "unpublished_needed": [], "legacy_aliases_requested": [], "type_gaps": []
  },
  "icons":  { "import": "…/utils/icons", "reuse": [],
              "build_new": [{ "ico_key": "string", "figma_name": "string", "category_node": "string" }] },
  "prior_lot_reuse": [
    { "need": "string", "verdict": "REUSE|EXTEND", "file": "src/features/<Folder>/<File>.jsx" }
  ],
  "components": [
    { "need": "string", "verdict": "REUSE|EXTEND|BUILD-TO-DS|BUILD-CUSTOM",
      "import": "string|null", "api": "string|null",
      "figma_node": "string|null", "variant_matrix": "string|null",
      "library": "string|null", "file": "string|null", "promote_to_shared": false }
  ],
  "build_or_placeholder": [
    { "need": "string", "figma_node": "string|null", "screens": 0,
      "recommend": "BUILD|PLACEHOLDER", "why": "string" }
  ],
  "usage_rules": [{ "need": "string", "rule": "string", "source_node": "string" }],
  "usage_rules_unwritten": ["string"],
  "routing": { "file": "src/App.jsx", "suggested_path": "/slug", "collision": false },
  "conflicts": ["string"]
}
```

---

## Handoff

End with:
> "Manifest ready. Handing the reuse list to design-prototypes — it will import the
> REUSE items, extend the EXTEND ones, fetch Figma context for BUILD-TO-DS, and only
> invent the BUILD-CUSTOM ones."

If `conflicts` is non-empty, do NOT hand off — surface them and wait for the user
to resolve (e.g. confirm replacing inline tokens with imports).

---

## Hard rules

1. Never write feature/prototype code — you only resolve and report.
2. Always READ the real component file to record its true API — never guess props.
3. Default to REUSE. Only build when nothing existing fits.
4. **Prefer BUILD-TO-DS over BUILD-CUSTOM.** Before calling anything custom, check the
   coverage map — the DS is ahead of the code and probably already specs it.
5. Never tell the prototyper to redefine `DS`/`TY`/`Ico` — those are always imports.
6. Never mutate shared components silently — EXTEND defaults to a feature-local wrapper.
7. Always run the conflict scan and PAUSE on inline-token redefinition or route collisions.
8. Re-scan the codebase every run — do not trust a cached catalog.
9. For lot ≥ 2, ALWAYS scan the feature's own prior-lot code and resolve to REUSE/EXTEND
   against those files — the prototyper extends existing lot work, never rebuilds it.
10. Every page reuses the shared `PageHeader` banner; `Card` has no default padding (the
    prototyper must pass explicit padding).
11. Run the five token traps every time. `DS.blue500` is not the brand blue.
12. Never resolve dark mode / `ThemeSwitch` to a build verdict — it's blocked upstream.
13. `Figma:search_design_system` does **not** work on this file (its variables are
    file-local, so search silently returns the OLD library). Use
    `Figma:get_variable_defs` / `get_design_context` with an explicit node ID. Likewise
    `get_metadata` with no nodeId returns a **truncated** page list — use the node index.
14. Resolve component *choice* against the Principles page, not vocabulary in the spec.
    "Pill", "tag", "label", "badge" are ambiguous; the rules disambiguate
    Badge / StatusChip / Chip. Cite the rule in the manifest.
15. Expand every spec element into its required companions before counting components.
