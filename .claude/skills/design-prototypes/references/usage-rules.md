# AX DS — Component usage rules

Extracted 2026-08-31 from Figma `nIMtO7v8dDamI8b2vnMcRc`, page **📐 Principles** (`10:2`).

This is the **usage/decision layer** of the design system: which component to pick, which
variant, what the props mean, and what not to do. §4 of SKILL.md tells you a component's
size and variant matrix; **this file tells you when and how to use it.** Read the relevant
entry before building any component that appears here.

Source text is French; translated below. Section names kept in parentheses for findability.

The Principles page is organised into 8 groups: Actions, Saisie (Input), Affichage & statut
(Display & status), Navigation, Menus, Tableaux (Tables), Kanban, Overlays.

> **Unwritten entries.** The designer left these as literal "Description" placeholders —
> there is **no guidance yet**, so do not infer any: `Select` (when-to-use + do/don't),
> `SelectField`, `NotificationBadge`, `PageHeader` (when-to-use), `ThemeSwitch`, `MenuItem`
> (when-to-use), `TableToolbar`, `PaginationBar`, `Organisms · Pagination`,
> `Cell / Header with Input`, `AssigneeDropdown`, `KanbanDropTarget`, `KanbanInlineAdd`,
> and the Do/Don't for `IconButton` and `Badge`. If a spec depends on one, ask the user.

---

## Actions

### Button — `1092:117`

**Anatomy / props** (`Anatomie`): `Variant` (Primary/Secondary/Ghost/Destructive) ·
`Size` (Sm 28px / Md 36px / Lg 44px height) · `State` (Default/Hover/Disabled) ·
`Show Icon Left` (boolean) · `Show Icon Right` (boolean) ·
**`Show Label` (boolean — false = icon-only, i.e. use IconButton instead)**

**Decision tree** (`Arbre de décision`):

| Variant | Use for | Examples | Rule |
|---|---|---|---|
| **Primary** | the page's or modal's main action | Save · Create · Confirm · Continue | **One Primary per view** |
| **Secondary** | secondary or back action | Cancel · Previous · Export · Edit | Always alongside a neighbouring Primary |
| **Ghost** | tertiary action, low visual emphasis | View details · Close · Dismiss | Never the main CTA of a form |
| **Destructive** | irreversible or high-impact action | Delete · Deactivate · Revoke | **Always with a confirmation modal** |

**Interactive states:** Default (at rest) · Hover (mouse over) · Disabled (interaction blocked).

**Do / Don't:**
- ✅ One Primary (CTA) accompanied by a Secondary — clear visual hierarchy.
- ❌ Two Primary side by side: the eye no longer knows where to go. Use Primary + Secondary.

**In context:** Arenametrix PageHeader — Primary (Save) + Secondary (Cancel).

### IconButton — `1106:220`

**When to use:** icon-only action in constrained spaces — toolbar, table cell, list header.
**Does not replace Button when a label is possible** — the label aids comprehension and
accessibility. **Always add a Tooltip to an IconButton** to convey the action on hover.

- `Filled` = strong primary action
- `Outline` = identified secondary action
- `Ghost` = discreet action in dense zones
- `Color=Danger` = destructive action (delete, remove)

---

## Saisie (Input)

### Input — `1106:386`

**Interactive states:** Default (at rest) · Focus (being typed in) · Error (invalid value) ·
Disabled (not editable).

**Do / Don't:**
- ✅ **Always wrap Input in a FormField** for forms. The label and helptext are essential.
- ❌ Input alone with no label or helptext: the user doesn't know what to enter or in what format.

**In context:** inside a FormField (with label, helptext and error message).

### Select — `1106:424`

**Decision tree — Select vs Input:**

| Component | Use for | Examples |
|---|---|---|
| **Select** | a choice from a **closed list** of predefined values | country, category, contact type, status |
| **Input** | free entry of an unconstrained value | name, email, address, free amount |

**Interactive states:** Default (placeholder) · Open (dropdown visible) · Disabled.

*When-to-use and Do/Don't are unwritten in Figma.*

### Textarea — `1107:896`

**When to use:** long-text entry — notes, descriptions, messages. **Prefer Textarea over
Input when the expected value exceeds one line** (e.g. biography, comment). Like Input,
**always wrap in a FormField** to get label + helptext + error message.

**Option:** `Show Info` (true/false).

### FormField — `1108:848`

**Decision tree:**

| Choice | Use for | Why |
|---|---|---|
| **FormField** | any user-facing form | Label + HelpText + error message are essential for accessibility and comprehension |
| **Input alone** | inline field in a table, or a filter search with no form context | e.g. editable table cell, toolbar searchbar |

**Interactive states:** Default (at rest) · Focus (active field) · Error (invalid value) ·
Disabled (not editable).

**Do / Don't:**
- ✅ Specific, actionable error message: *"Invalid email address — check the format."*
- ❌ Generic error message *"Invalid field"* with no indication of how to fix it.

**Option:** `Show Info` (true/false).

### SelectField — `2207:40426`

**Option:** `Show Info` (true/false). *When-to-use is unwritten in Figma.*

### Checkbox — `1105:128`

**When to use:** independent multiple choice in a form. **`Indeterminate` = partial
selection of a group** (e.g. "Select all" in a table or list).
For an exclusive choice use **Radio**. For immediate activation with no Save step use **Switch**.

### Radio — `1105:178`

**When to use:** exclusive choice within a group — only one item selectable at a time.
**Always group several Radios in a FormField (RadioGroup). Never use one alone** — an
isolated Radio makes no sense without an alternative. For an immediate binary toggle,
prefer **Switch**.

### Switch — `1105:214`

**When to use:** immediate enable/disable of an option, with no validation step.
e.g. enable notifications, switch to dark mode, enable a filter.
**If the action needs a "Save" button to take effect, use Checkbox instead.**

---

## Affichage & statut (Display & status)

### Badge — `1105:252`

**When to use:** categorical or informational label (**non-interactive**). e.g. segmentation
tags, standards, campaign categories.
**For business statuses (active, archived, pending) use StatusChip — not Badge.**
**Never use Badge as a button or clickable link.**

### StatusChip — `1105:294`

**When to use:** business status of a record (contact, case, campaign). **Always tied to a
state defined in the data model — never invent ad-hoc statuses.**
In a table, use `Cell Type=Status` to embed the StatusChip in a cell.

**Badge vs StatusChip:** Badge = free-form label · StatusChip = controlled business state.

### Chip — `1106:359`

**When to use:** interactive selectable filter in a filter bar (e.g. contact segmentation).

**Contrast with Badge:** Badge = non-interactive label · Chip = clickable/selectable element.
**Group several Chips in a horizontal scrollable bar if the count exceeds 5–6.**

### Avatar — `1106:298`

**When to use:** visual representation of a user or contact in lists, tables, UserCard, comments.

- `Sm` — compact tables or activity feeds
- `Md` — standard in lists and menus
- `Lg` — contact record, profile, any context where identity is central

**Initials are auto-computed from the name — always pass the full name in the `Initials` prop.**

### Tooltip — `1106:332`

**When to use:** short explanation (**max 1 line**) on an element with no visible label.
**Mandatory on every IconButton.**
- Don't put a Tooltip on an element that already has an explicit label.
- **Don't put interactive content in a Tooltip** (links, buttons).
- Placement: `bottom` by default; adapt if the tooltip would leave the viewport.

### KPI Card — `1955:2027`

| Type | Use for | Examples |
|---|---|---|
| **Stat** | a raw numeric indicator with its variation | contact count, revenue, conversion rate |
| **Donut** | a breakdown into categories | lead statuses, acquisition sources |
| **Progress** | a numeric goal with a target value | quota progress, fill rate |

**`Label`, `Value` and `Delta` are the same props across all three types.**

---

## Navigation

> All of these are **app-shell components** — the prototyper does **not** build or restyle
> them (SKILL.md §0.4). Listed because the rules constrain how a page behaves inside them.

### Sidebar — `1109:1685`

**Anatomy & behaviour:**
- `Open` (288px): NavItems with `Compact=false` — icon + label visible. UserCard at the bottom.
- `Close` (68px): NavItems with `Compact=true` — icon only, **Tooltip on hover for the label**.
- The Sidebar is the container for all NavItems. Open/Close is triggered by the toggle button at the bottom.
- **When `State=Close`, all NavItems must be `Compact=true` and `SubmenuState=None`.**

**In context:** occupies the left edge on all pages. **Independent of the central content —
never nest it inside a page; it is a global layout component.** Open/Close state is
persisted as a user preference (localStorage).

### TopBar — `1108:1350`

**When to use:** present on **all** pages, always `position: fixed` at the top.
**Never modify the TopBar per page** — it is a global component with no per-screen dynamic
content. Notifications are handled via the `NotificationBadge` on the bell icon.

**Options:** `ShowBreadcrumb` · `ShowSearch` · `ShowNotifications` · `ShowMessages` ·
`ShowSettings` · `Has dark mode switch` — each toggles that element's visibility.

### SubNavBar — `1108:1473`

**When to use:** secondary navigation under the TopBar, when a section has several views
(e.g. Contacts / Companies / Segmentation).
**Don't use SubNavBar for filtering** — use Toolbar + Chip/Select.
One `Tab` Active at a time; the active tab matches the current route.

### PageHeader — `1108:1507`

**Options:** `Show primary action` · `Show secondary action` — both false gives a header
with no actions. *When-to-use is unwritten in Figma.*

### NavItem — `1108:1035`

**Decision tree:**

| Prop | Value | Meaning |
|---|---|---|
| `Compact` | `false` | Sidebar `State=Open` — icon + label. Default sidebar state. |
| `Compact` | `true` | Sidebar `State=Close` — icon only. Syncs with `Organisms/Sidebar State=Close`. |
| `SubmenuState` | `None` | No sub-navigation. No chevron; click = direct navigation. |
| `SubmenuState` | `Closed` / `Open` | Sub-navigation available. Closed = hidden, Open = visible with NavSubItems. |

**In context: NavItem is used exclusively inside `Organisms / Sidebar`, never standalone.**

### NavSubItem — `1107:950`

Displayed under a NavItem with `SubmenuState=Open`. Represents a child page.
**One NavSubItem Active at a time per sub-navigation group.**

### Tab — `1107:560`

**When to use:** tabbed navigation within a single page (e.g. contacts / companies in one view).
SubNavBar uses instances of Tab. **Never use Tab standalone** — always inside a SubNavBar or
TabBar container. One Tab Active at a time per group.

### Breadcrumb — `1107:590`

`Simple`: classic hierarchical navigation. **Renders inside the TopBar via its
`ShowBreadcrumb` property, not in the page content.** The last segment is the current page.

### UserCard — `1107:980`

Shows the signed-in user at the **bottom of the Sidebar**. `Open` = user menu visible
(UserMenu); `Close` = compact card only. **Always at the bottom of the Sidebar, never elsewhere.**

### UserMenu — `1107:1011`

Dropdown invoked by `UserCard State=Open`. Contains profile, settings, sign-out.
**Don't reuse it for another kind of menu** — use MenuItem + MenuSection.
- `Compact=false`: full trigger — avatar + name + chevron.
- `Compact=true`: badge only, disc centred in the circle, no label. For a narrow utility bar,
  or when the name is already shown elsewhere.
- **Don't fake `Compact=true` by hiding the name on `Compact=false`.**

---

## Menus

### MenuItem — `1109:1386`

**Decision tree:**

| Kind | Use for | Examples |
|---|---|---|
| `Text` | simple action, no extra context | Edit, Duplicate, Archive |
| `WithIcon` | action with an icon for fast visual differentiation | Download, Share |
| `WithCheckbox` | multi-select filter in a menu | a table's "Visible columns" menu |
| `WithRadio` | exclusive choice in a menu | "Sort by" — one sort active at a time |
| `WithChevron` | sub-menu entry (nested menu) | chevron signals a click opens a sub-menu |
| `WithChevronValue` | entry showing the current value | "Language — French" — active value visible directly |

**Interactive states:** Default · Hover · Selected · Disabled.

### MenuSection — `1107:1040`

Grouping container for the MenuItems of a dropdown.
- `HasLabel=true`: the group has a visible category title (e.g. "My account", "Actions").
- `HasLabel=false`: simple visual separation, no group title.

---

## Tableaux (Tables)

### Cell — `1109:1510`

**⚠ Table construction convention:** *"To build a table, see the 'Construction des tableaux'
convention — **the header row is the master component and the data rows are its instances**."*
Compose rows from Cells; don't style `<td>` ad hoc.

**Decision tree:**

| Type | Use for | Rule |
|---|---|---|
| `Header` / `HeaderNum` | column header, text (left) or numeric (right) | enable `Sortable` if the column is sortable |
| `Text` / `Number` | text or numeric data cell | **Number aligns right, Text aligns left** |
| `Status` | a column showing a business status | embeds a **StatusChip**. **Do not use Badge here.** |
| `Actions` | actions column: IconButtons (edit, delete) | **always the last column, fixed width** |
| `Tags` | column showing one or more Badges | e.g. categorisation tags |
| `Group` | grouping row (merged) | spans the full width, `Alt` background |

**Options:** `Sortable` · `Has count`.

### Toolbar — `1108:1561`

**When to use:** **always above a table or a results list.**
- Search = inline Input · Filters = Select/Chip · Columns = column visibility management ·
  Options = export/import.
- **Never put a primary CTA in the Toolbar** — main actions go in the PageHeader.

### Pagination (Molecules) — `1107:845`

**When to use:** when the result count exceeds the configurable page size (10, 25, 50).
**Always accompany with an "X–Y of Z results" indicator.**
**Don't show it if all results fit on one page.**

---

## Kanban

### KanbanCard — `2107:41989`

`State=Default` is the card at rest in the column. `State=Hover` reveals the edit action
(icon button) on mouse-over, **without changing the card's height**.

**Reassignment, drag-and-drop and quick-add are three separate components**, placed manually
per context — they are **not** card variants, because their structure differs too much:
- `Molecules/AssigneeDropdown` — reassignment dropdown, overlaid below the card
- `Molecules/KanbanDropTarget` — placeholder shown during a drag & drop
- `Molecules/KanbanInlineAdd` — quick-entry form replacing the "Add a card" link

### KanbanColumn — `2107:42122`

Holds a variable number of `Molecules/KanbanCard`.
- `Show card 3` / `Show card 4` drive the visibility of the 3rd and 4th slots. **Disable both
  to represent a column with few or zero cards.**
- `Has drop target` shows a `KanbanDropTarget` in the column's first slot — **enable only
  during an in-progress drag & drop; off by default.**
- `Show inline add` replaces the "Add a card" link with a `KanbanInlineAdd`.
- **The coloured band at the top of the column (`AccentRail`) is a fixed gradient baked into
  the component — not driven by a property. There is no per-column colour customisation today.**

---

## Overlays

### Modal — `1969:2196`

Variants only; no written usage rules on the Principles page. See SKILL.md §4.15 for the
sizes and the four documented compositions.
