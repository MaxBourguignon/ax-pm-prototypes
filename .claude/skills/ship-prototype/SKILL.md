---
name: ship-prototype
description: Final integration + launch step for Arenametrix prototypes. Runs AFTER design-prototypes has built a page-only feature file. It wires the new page into the running app — adds a <Route> in src/App.jsx, adds a sidebar entry (asking the user which section), installs deps if needed, runs lint + build, launches the Vite dev server locally, and debugs any build/runtime errors until the page renders clean. Triggers on "ship it", "integrate the prototype", "wire it up", "add the route", "launch it locally", "make it runnable", or automatically as the last stage of spec-to-prototype.
---

# Skill: ship-prototype

You take a **page-only feature file** that `design-prototypes` built and make it
**actually runnable in the app**: route it, add it to the sidebar, add a launch card
to the Home page, build it, launch it locally, and debug until it works. You do not
design or restyle the page — that is `design-prototypes`' job. You do not recreate the
nav/sidebar/shell — they exist.

App = Vite + React 19 in **`ax-prototypes/`** (the dir with `package.json` + `src/`).
Dev server: `npm run dev` (Vite, default `http://localhost:5173`).

---

## Inputs

- Path to the feature file, e.g. `src/features/<Folder>/<File>.jsx`.
- The exported component name (check the file: `export default X` or `export function X`).
- A suggested route slug (optional — derive from the feature name if absent).

If the feature file path is unknown, ask once or locate the most recently created
file under `src/features/`.

**Lot-aware.** The pipeline is lot-based. Lot 1 is the integration pass — it wires the
route, sidebar entry, and Home card for the first time. For **lot ≥ 2** the feature is
already integrated: the route, sidebar entry, and Home card usually already exist. In that
case do NOT duplicate them — detect what's present and only add what's genuinely new (e.g. a
brand-new sub-page route this lot introduces). Always still run lint + build and relaunch.
Before wiring anything, grep `src/App.jsx`, `SideBar.jsx`, and `HomePage.jsx` for the slug
to decide add-vs-skip per item.

---

## Procedure

### 1. Locate + sanity-check
```
find . -maxdepth 3 -name package.json -not -path '*/node_modules/*'   # app root
```
- Confirm the feature file exists and read its export (default vs named) — you must
  import it correctly.
- Compute the slug (kebab-case of the feature, e.g. `Performance V3` → `/performance-v3`).

### 2. Wire the route in `src/App.jsx`
- **Lot ≥ 2:** if the feature's route + import already exist, SKIP this step (the page is
  already routed). Only add a route if this lot introduces a genuinely new sub-page slug.
- Add the import near the other feature imports:
  `import <Component> from './features/<Folder>/<File>'`  (drop the `.jsx`).
  Use a named import `{ X }` if the file uses a named export.
- Add a route INSIDE the existing layout route (the `<Route element={<AppLayoutSidebar/>}>`
  block), matching the surrounding style:
  `<Route path="/<slug>" element={<Component />} />`
- **Check for a slug collision first** (grep existing `path=` values). If it exists,
  do not overwrite — ask the user for a different slug.

### 3. Add the sidebar entry — ASK where
**Lot ≥ 2:** if a sidebar subitem with this slug already exists, SKIP this step — do not
re-add or re-ask. Only continue below for Lot 1 or a genuinely new sub-page.

The sidebar data lives in `src/layout/Header/SideBar.jsx` as `NAV_TABS_L1` — an array
of L1 sections, each `{ id, label, icon, subitems: [{ id, label, link }] }`.

Ask the user (do not guess):
> "Where should this appear in the sidebar? Pick an existing section — Contacts,
> Campaigns, Sales, B2B management, SSO — or tell me a new section name."

- **Existing section** → push `{ id:'<slug>', label:'<Feature label>', link:'/<slug>' }`
  into that section's `subitems`.
- **New section** → add a new `NAV_TABS_L1` entry; ask for its label and pick an
  existing `Ico.*` for its icon (match the icon prop style already used:
  `<Ico.X s={16} c="rgba(255,255,255,0.80)" />`).
- Keep the link exactly equal to the route slug.
- A subitem with `disabled: true` renders greyed with an "Unable" tag and is
  non-clickable. A freshly-wired page has a real route, so add its subitem **without**
  the `disabled` flag (omit it = enabled). Only set `disabled: true` for IA entries
  whose page isn't built yet.

### 3b. Add the Home page launch card
**Lot ≥ 2:** if a `MODULES` card with this slug already exists, SKIP — never duplicate it.
Only add a card for Lot 1 (or optionally refresh the existing card's `desc` if the lot
materially expanded the page — but do not duplicate).

The Home page lives at `src/pages/HomePage.jsx` and renders a `MODULES` array — each
entry is one launch card `{ icon, label, desc, bg, link }`.

- Append one entry to `MODULES` for the new page:
  `{ icon: "<emoji>", label: "<Feature label>", desc: "<one-line summary>", bg: "#EFF6FF", link: "/<slug>" }`
- Keep `link` exactly equal to the route slug (same value used for the route and the
  sidebar entry).
- Pick a relevant emoji for `icon` (match the existing playful style: 🚀 ✨ 🏆 ⚗️ 📋).
  Reuse the `bg: "#EFF6FF"` the other cards use.
- Do NOT restyle `ModuleCard` or the grid — only add the data entry.
- If a card with the same `link` already exists, do not duplicate it.

### 4. Install + build
- If `node_modules` is missing or deps changed: `npm install` in the app dir.
- Run `npm run lint` then `npm run build`. Capture all output.

### 5. Debug loop (until clean)
Iterate: read the first error, fix it, re-run `npm run build` (and `lint`). Repeat
until both pass. Common failures and fixes:
- **Wrong import path / depth** — a file at `src/features/<F>/<File>.jsx` reaches
  shared code via `../../utils/...`, `../../components/...`. Fix the `../` count.
- **Bad export/import mismatch** — default vs named (`import X` vs `import { X }`).
- **Undefined `Ico.Foo`** — the icon key doesn't exist in `utils/icons.jsx`. Either
  use an existing key or add the icon to `utils/icons.jsx` (per design-prototypes §11).
- **Inline `DS`/`TY`/`Ico` redefinition in the feature** — replace with imports from
  `utils/designSystem` / `utils/icons` (this is a design-consistency violation; fix it).
- **ESLint: unused vars / hooks deps** — remove unused, satisfy `react-hooks` rules.
- **Missing dependency** — prefer a lib already in `package.json`
  (`recharts`/`highcharts`/`tabulator-tables`); only `npm install` a new one if the
  user approves.
Keep fixes limited to wiring + build correctness. Do NOT redesign the page; if a fix
would change intended design, flag it instead.

### 6. Launch locally
- Start the dev server in the background: `npm run dev` (run_in_background).
- Read the startup output for the actual local URL/port (Vite may pick 5174+ if 5173
  is busy).
- Report the deep link: `http://localhost:<port>/<slug>`.
- If you can, do a lightweight render check (e.g. curl the dev URL for a 200 / no
  overlay error). Note that Vite serves the SPA shell, so a hard render check needs a
  browser — at minimum confirm the dev server compiled with no errors in its output.

### 7. Report
```
━━ SHIPPED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Feature file   src/features/<Folder>/<File>.jsx
  Route          /<slug>            (src/App.jsx)
  Sidebar        <Section> › <Label>  (SideBar.jsx)
  Home card      <Label>             (HomePage.jsx)
  Build          lint ✓   build ✓
  Dev server     http://localhost:<port>/<slug>   (running)
  Fixes applied  [list, or none]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Hard rules

1. Never redesign or restyle the page — only integrate, wire, and fix build/runtime errors.
2. Never recreate or edit the nav bar / sidebar shell beyond adding the one nav entry.
3. Always ASK which sidebar section to use (or whether to create a new one).
3b. Always add a Home page launch card (`MODULES` in `src/pages/HomePage.jsx`),
    keeping its `link` equal to the route slug — never duplicate an existing card.
4. Never overwrite an existing route — flag slug collisions and ask.
5. Keep the route slug, the sidebar `link`, and the imported component consistent.
6. Do not declare done until `npm run lint` and `npm run build` pass and the dev
   server starts without compile errors.
7. Launch the dev server in the background and report the exact local URL.
8. If a build fix would alter intended design, stop and flag it rather than changing the look.
9. Lot-aware: for lot ≥ 2, never duplicate an existing route / sidebar entry / Home card —
   detect what's already wired and add only what's genuinely new; always still build + relaunch.
