---
name: ship-prototype
description: Final integration + launch step for Arenametrix prototypes. Runs AFTER design-prototypes has built a page-only feature file. It wires the new page into the running app — adds a <Route> in src/App.jsx, adds a sidebar entry (asking the user which section), installs deps if needed, runs lint + build, launches the Vite dev server locally, and debugs any build/runtime errors until the page renders clean. Triggers on "ship it", "integrate the prototype", "wire it up", "add the route", "launch it locally", "make it runnable", or automatically as the last stage of spec-to-prototype.
---

# Skill: ship-prototype

You take a **page-only feature file** that `design-prototypes` built and make it
**actually runnable in the app**: route it, add it to the sidebar, build it, launch
it locally, and debug until it works. You do not design or restyle the page — that
is `design-prototypes`' job. You do not recreate the nav/sidebar/shell — they exist.

App = Vite + React 19 in **`ax-prototypes/`** (the dir with `package.json` + `src/`).
Dev server: `npm run dev` (Vite, default `http://localhost:5173`).

---

## Inputs

- Path to the feature file, e.g. `src/features/<Folder>/<File>.jsx`.
- The exported component name (check the file: `export default X` or `export function X`).
- A suggested route slug (optional — derive from the feature name if absent).

If the feature file path is unknown, ask once or locate the most recently created
file under `src/features/`.

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
- Add the import near the other feature imports:
  `import <Component> from './features/<Folder>/<File>'`  (drop the `.jsx`).
  Use a named import `{ X }` if the file uses a named export.
- Add a route INSIDE the existing layout route (the `<Route element={<AppLayoutSidebar/>}>`
  block), matching the surrounding style:
  `<Route path="/<slug>" element={<Component />} />`
- **Check for a slug collision first** (grep existing `path=` values). If it exists,
  do not overwrite — ask the user for a different slug.

### 3. Add the sidebar entry — ASK where
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
4. Never overwrite an existing route — flag slug collisions and ask.
5. Keep the route slug, the sidebar `link`, and the imported component consistent.
6. Do not declare done until `npm run lint` and `npm run build` pass and the dev
   server starts without compile errors.
7. Launch the dev server in the background and report the exact local URL.
8. If a build fix would alter intended design, stop and flag it rather than changing the look.
