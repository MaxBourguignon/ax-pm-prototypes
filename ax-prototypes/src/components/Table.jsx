/**
 * AX Design System — Table
 *
 * Built from the Figma template "Table / Contacts" (Design page)
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=2052-38194
 * verified with get_design_context 2026-09. Composed of the DS parts:
 *   Molecules/TableToolbar (1784:33159) · Molecules/Cell (530:185) ·
 *   Molecules/PaginationBar (1774:4443) · Atoms/Checkbox · Atoms/IconButton
 *
 * Shell:      border 1px borderSection, radius 12, shadowSm, overflow hidden
 * Toolbar:    surfaceCanvas, padding 12/16, left = column config, right = options + search
 * Header row: DS `Cell Type=Text|Number, Background=Header` — surfaceHeader,
 *             48px, px16/py12, gap 8, label labelMd in textSecondary, 16px sort
 *             icon, Number right-aligned. The filter-input header
 *             (`Type=Input, Background=Header`, underlined with borderField) is
 *             a separate DS variant: opt in per column with `filter: true`.
 * Data row:   surfaceCanvas, cells 48px tall, padding 12/16, bodyMd.
 *             The FIRST column is weight 500 (labelLg) — the DS emphasises the
 *             identity column. Numeric columns align right.
 * Footer:     PaginationBar — "X–Y of Z" left, pager right
 * Separators: 1px borderTableSep between toolbar/header and body/footer
 *
 * Per the DS "Construction des tableaux" convention the header row is the master
 * and data rows are its instances — so both are driven by the same `columns`
 * config here rather than styled independently.
 *
 * Usage
 *   <Table
 *     columns={[
 *       { key: 'last',  label: 'Last name', filter: true },
 *       { key: 'age',   label: 'Age', type: 'number' },
 *       { key: 'email', label: 'Email' },
 *     ]}
 *     rows={rows}
 *     rowId={(r) => r.id}
 *     cell={(r, key) => r[key]}
 *     selectable                                   // checkbox column
 *     selected={selected} onSelectedChange={setSelected}
 *     sortKey={sortKey} sortDir={sortDir} onSort={setSort}
 *     filters={filters} onFilterChange={setFilter} // per-column header inputs
 *     actions={(r) => <IconBtn … />}               // trailing actions column
 *     toolbar={{ onConfigureColumns, onOptions, search, onSearchChange,
 *                folderLabel, onFolderClick, onAddFolder,
 *                secondaryAction, primaryAction }}  // see TableToolbar below
 *     page={page} pages={pages} setPage={setPage} total={n} pageSize={PER}
 *   />
 *
 * Column: { key, label, width (px, fixed), align 'left'|'right',
 *           type — any DS Cell type: 'text' | 'number' | 'empty' | 'actions' |
 *             'checkbox' | 'switch' | 'tags' | 'group' | 'total' | 'drag' |
 *             'status' | 'input' | 'titleDescription',
 *           sortable (default true when onSort given),
 *           filter — true to use the DS filter-input header for this column,
 *           onToggle — (row, next) for type 'switch' }
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import { Btn } from './Btn';
import { Badge } from './Tag';

/* ⚠ HORIZONTAL GUTTER DEVIATION. The DS pads the toolbar, header cells, data
   cells and pagination bar at 12px/16px. They are all at 12px/24px here, on the
   PM's call, so the table lines up with the panels above it (the segment builder
   uses a 24px gutter). Changed together on purpose: moving only the toolbar
   would have pushed it 8px out of line with its own column headers. Vertical
   padding is untouched, so the 48px cell and 60px bar heights still match spec.
   The FIXED-WIDTH columns are excluded: the 40px checkbox column and the 96px
   actions column have no room for a 24px gutter (the checkbox column would be
   left -8px of content), so they keep 12px and 16px respectively. */
const CELL_H = 48;
const CHECK_W = 40;
const EXPAND_W = 40;

/* ── TableToolbar (Molecules/TableToolbar 1784:33159) ─────────────────────────
   "Top bar of a data table: column config button on the left, secondary options
   + quick search on the right."  — Figma component description

   Figma exposes 7 props. Booleans become slot presence here (idiomatic React):
     showColumnConfig    → onConfigureColumns
     showFolderFilter    → folderLabel / onFolderClick / onAddFolder
     showOptions         → onOptions
     showSearch          → onSearchChange
     showSecondaryButton → secondaryAction  (node)
     showPrimaryButton   → primaryAction    (node)
     searchPlaceholder   → searchPlaceholder
   Right-hand order is fixed by the DS: Options · Search · Secondary · Primary.
   Labels are overridable because the DS labels are French and our copy is English. */
export function TableToolbar({
  onConfigureColumns,
  configureColumnsLabel = 'Configure columns',
  columnConfig,   // node — replaces the built-in button (e.g. <ColumnCustomizer/>)
  folderLabel,
  onFolderClick,
  onAddFolder,
  onOptions,
  optionsLabel = 'Options',
  options,        // node — replaces the built-in button (e.g. <OptionsMenu/>)
  search,
  onSearchChange,
  searchPlaceholder = 'Quick search…',
  secondaryAction,
  primaryAction,
  leftExtra,      // node — appended to ToolbarLeft (e.g. a Toggle)
}) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 24px', background: DS.surfaceCanvas,
    }}>
      {/* ToolbarLeft — gap 12. The DS says items-start, but all its own children
          are 36px tall so start/center render identically there. Centring makes
          shorter `leftExtra` content (a Toggle is ~20px) line up with the
          buttons instead of hanging off the top. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {columnConfig ?? (onConfigureColumns && (
          <Btn type="Secondary" iconLeft={<Ico.Settings s={16} />} onClick={onConfigureColumns}>
            {configureColumnsLabel}
          </Btn>
        ))}
        {folderLabel != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={onFolderClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: 240, height: 36,
                padding: '10px 12px', boxSizing: 'border-box',
                background: DS.surfaceCanvas, border: `1px solid ${DS.borderField}`,
                borderRadius: DS.radiusLg, cursor: onFolderClick ? 'pointer' : 'default',
                fontFamily: DS.ff, ...TY.bodyMd, color: DS.textDefault, textAlign: 'left',
              }}
            >
              <span style={{
                flex: '1 0 0', minWidth: 0, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {folderLabel}
              </span>
              <Ico.ChevDown s={16} c={DS.textDefault} />
            </button>
            {onAddFolder && (
              <button
                type="button"
                onClick={onAddFolder}
                title="Add a folder"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, flexShrink: 0, border: 'none',
                  background: DS.actionPrimary, borderRadius: DS.radiusMdPlus,
                  cursor: 'pointer',
                }}
              >
                <Ico.Plus s={16} c={DS.textOnBrand} />
              </button>
            )}
          </div>
        )}
        {leftExtra}
      </div>

      {/* ToolbarRight — gap 8, items-center, DS order */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {options ?? (onOptions && (
          <Btn type="Secondary" iconLeft={<Ico.Dots s={16} />} onClick={onOptions}>
            {optionsLabel}
          </Btn>
        ))}
        {onSearchChange && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            background: DS.surfaceCanvas, borderRadius: DS.radiusMdPlus,
            border: `1px solid ${focus ? DS.borderFocus : DS.borderSubtle}`,
            transition: `border-color ${DS.durFast} ${DS.ease}`,
          }}>
            <Ico.Search s={16} c={DS.textMuted} />
            <input
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder={searchPlaceholder}
              style={{
                ...TY.bodySm, fontFamily: DS.ff, color: DS.textStrong,
                width: 180, border: 'none', outline: 'none', background: 'transparent',
                padding: 0, textAlign: 'left',
              }}
            />
          </div>
        )}
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
}

/* ── Header cell ──────────────────────────────────────────────────────────── */
function HeadCell({ col, sortKey, sortDir, onSort, filters, onFilterChange }) {
  // ⚠ The sort glyph requires `onSort`. The DS ships `Sortable` defaulting to
  //   true, so a table that forgets `onSort` silently renders NO arrows — that
  //   caught three call sites. Keeping the coupling (an arrow that doesn't sort
  //   is worse than none) but warning loudly in dev instead of failing quietly.
  const sortable = col.sortable !== false && !!onSort;
  if (import.meta.env?.DEV && col.sortable === true && !onSort) {
    console.warn(
      `[Table] column "${col.key}" sets sortable: true but the Table has no onSort — ` +
      `no sort arrow will render. Pass onSort (and sortKey/sortDir) to enable it.`,
    );
  }
  // Header cells are DS `Type=Text|Number, Background=Header` by DEFAULT.
  // The filter-input header (`Type=Input, Background=Header`) is a separate DS
  // variant — opt in per column with `filter: true`.
  const filterable = col.filter === true && !!onFilterChange;
  const align = col.align || (col.type === 'number' ? 'right' : 'left');
  const active = sortKey === col.key;

  /* DS `Type=Text, Background=Header` / `Type=Number, Background=Header`:
     surfaceHeader · h48 · px16 py12 · gap 8 · label Label/Medium in
     text/secondary · 16px sort icon · Number justifies right. */
  if (!filterable) {
    return (
      <div style={{
        ...flexCell(col), height: CELL_H, padding: '12px 24px', gap: 8,
        background: CELL_BG.Header, boxSizing: 'border-box',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        cursor: sortable ? 'pointer' : 'default', userSelect: 'none',
      }} onClick={sortable ? () => onSort(col.key) : undefined}>
        <span style={{
          ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {col.label}
        </span>
        {sortable && (
          /* Text/Number headers use the DS's own simple glyph — `SortIcon`
             (528:110), a single caret. The two-way `sort-vertical-01` chevron
             belongs to the Input header variant below, not here.
             Rotating for ascending and tinting the active column are minimal
             extensions: the DS defines no active state for this glyph. */
          <span style={{
            display: 'flex', flexShrink: 0,
            transform: active && sortDir === 'asc' ? 'rotate(180deg)' : 'none',
            transition: `transform ${DS.durFast} ${DS.ease}`,
          }}>
            <Ico.SortIcon s={16} c={active ? DS.brandOnSurface : DS.textSecondary} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      ...flexCell(col), height: CELL_H, padding: '10px 8px',
      background: DS.surfaceHeader, justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flex: '1 0 0', minWidth: 0, height: '100%', gap: 6, padding: '4px 6px',
        background: DS.surfaceCanvas, borderBottom: `1px solid ${DS.borderField}`,
      }}>
        <input
          className="ax-th-filter"
          value={filters?.[col.key] ?? ''}
          onChange={(e) => onFilterChange(col.key, e.target.value)}
          placeholder={col.label}
          aria-label={`Filter by ${col.label}`}
          style={{
            ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong,
            flex: '1 0 0', minWidth: 0, border: 'none', outline: 'none',
            background: 'transparent', padding: 0, textAlign: 'left',
          }}
        />
        {sortable && (
          <span
            onClick={() => onSort(col.key)}
            style={{ display: 'flex', flexShrink: 0, cursor: 'pointer' }}
            title={`Sort by ${col.label}`}
          >
            <Ico.SortVertical s={12} c={active ? DS.brandOnSurface : DS.textStrong} />
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Cell (Molecules/Cell 530:185) ────────────────────────────────────────────
   13 types × 5 backgrounds, verified with get_design_context 2026-09.

   Backgrounds:  Base → surfaceCanvas · Alt → surfaceSubtle · Selected →
   brandPrimarySubtle · Muted → surfaceSubtle (same value as Alt in the DS) ·
   Header → surfaceHeader.

   `Tags` uses the shared `Badge` atom from Tag.jsx.
   ⚠ `Status` and `Switch` still render DS-exact inline: Atoms/StatusChip and
   Atoms/Switch are not yet real atoms (Controls.jsx `Toggle` is 32×18 where the
   DS Switch is 36×20). Promote those two and swap these out. */
const CELL_BG = {
  Base: DS.surfaceCanvas,
  Alt: DS.surfaceSubtle,
  Selected: DS.brandPrimarySubtle,
  Muted: DS.surfaceSubtle,
  Header: DS.surfaceHeader,
};

function CellStatusChip({ label, tone = DS.feedbackSuccess }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
      borderRadius: DS.radiusPill,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: DS.radiusPill, background: tone, flexShrink: 0 }} />
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: tone, whiteSpace: 'nowrap' }}>{label}</span>
    </span>
  );
}

function CellSwitch({ on = false, onChange }) {
  return (
    <span
      role="switch"
      aria-checked={!!on}
      tabIndex={0}
      onClick={() => onChange && onChange(!on)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange && onChange(!on); } }}
      style={{
        position: 'relative', width: 36, height: 20, flexShrink: 0,
        borderRadius: 10, background: on ? DS.actionPrimary : DS.surfaceMuted,
        cursor: onChange ? 'pointer' : 'default', display: 'inline-block',
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16,
        borderRadius: 8, background: DS.surfaceCanvas,
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.2)',
        transition: `left ${DS.durFast} ${DS.ease}`,
      }} />
    </span>
  );
}

/**
 * Cell — renders the DS chrome for one cell. `value` is whatever the table's
 * `cell(row, key)` returned; its expected shape depends on `type`:
 *   text | number | total | group   → string/number  (group: {label, count})
 *   tags                            → [{label, tone}] or [string]
 *   status                          → {label, tone} or string
 *   switch                          → boolean        (+ col.onToggle)
 *   titleDescription                → {title, description}
 *   checkbox | actions | drag | empty | input → value unused
 */
export function Cell({ type = 'text', background = 'inherit', align, value, width, children, onToggle, emphasis = false }) {
  // 'inherit' → transparent, so the ROW paints Base/Alt/Selected/hover as one
  // block (visually identical to the DS, where every cell in a row shares the
  // same background) and hover works without repainting each cell.
  const bg = background === 'inherit' ? 'transparent' : (CELL_BG[background] ?? 'transparent');
  const box = {
    ...(width ? { width, flexShrink: 0 } : { flex: '1 0 0', minWidth: 0 }),
    background: bg, boxSizing: 'border-box', overflow: 'hidden',
    display: 'flex', alignItems: 'center',
  };
  const pad = { padding: '12px 24px' };
  const t = String(type).toLowerCase();

  if (t === 'empty') return <div style={{ ...box, height: CELL_H }} />;

  if (t === 'drag') {
    return (
      <div style={{ ...box, height: CELL_H, padding: '0 12px', justifyContent: 'center' }}>
        <Ico.Drag s={16} c={DS.textMuted} />
      </div>
    );
  }

  if (t === 'titledescription') {
    const v = value ?? {};
    return (
      <div style={{ ...box, ...pad, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <span style={{ ...TY.bodySmBold, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
          {v.title}
        </span>
        <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted, whiteSpace: 'nowrap' }}>
          {v.description}
        </span>
      </div>
    );
  }

  if (t === 'group') {
    const v = typeof value === 'object' && value !== null ? value : { label: value };
    return (
      <div style={{ ...box, ...pad, height: CELL_H, gap: 8 }}>
        <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
          {v.label}
        </span>
        {v.count != null && (
          <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap' }}>
            {v.count}
          </span>
        )}
      </div>
    );
  }

  if (t === 'total') {
    // The DS forces surfaceSubtle on Total even when Background=Base.
    return (
      <div style={{ ...box, ...pad, height: CELL_H, background: DS.surfaceSubtle, justifyContent: 'flex-end' }}>
        <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
          {value}
        </span>
      </div>
    );
  }

  if (t === 'status') {
    const v = typeof value === 'object' && value !== null ? value : { label: value };
    return (
      <div style={{ ...box, ...pad, height: CELL_H }}>
        {v.label != null && <CellStatusChip label={v.label} tone={v.tone} />}
      </div>
    );
  }

  if (t === 'tags') {
    const list = Array.isArray(value) ? value : [];
    return (
      <div style={{ ...box, ...pad, height: CELL_H, gap: 6 }}>
        {list.map((tag, i) => {
          const o = typeof tag === 'object' && tag !== null ? tag : { label: tag };
          return <Badge key={i} tone={o.tone}>{o.label}</Badge>;
        })}
      </div>
    );
  }

  if (t === 'switch') {
    return (
      <div style={{ ...box, ...pad, height: CELL_H }}>
        <CellSwitch on={!!value} onChange={onToggle} />
      </div>
    );
  }

  if (t === 'checkbox' || t === 'actions') {
    return (
      <div style={{
        ...box, ...pad, height: CELL_H, gap: 8,
        justifyContent: t === 'actions' ? 'flex-end' : 'flex-start',
      }}>
        {children}
      </div>
    );
  }

  // text | number  (number right-aligns and uses textDefault)
  const isNum = t === 'number';
  const a = align || (isNum ? 'right' : 'left');
  return (
    <div style={{ ...box, ...pad, height: CELL_H, justifyContent: a === 'right' ? 'flex-end' : 'flex-start' }}>
      <span style={{
        // The Table/Contacts template renders the identity column at weight 500
        // (labelLg), overriding the Cell default of Body/Medium/Regular.
        ...(emphasis ? TY.labelLg : TY.bodyMd),
        fontFamily: DS.ff, color: isNum ? DS.textDefault : DS.textStrong,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {children ?? value}
      </span>
    </div>
  );
}

/* Fixed-width columns stay fixed; everything else shares the remaining space. */
function flexCell(col) {
  return col.width
    ? { display: 'flex', alignItems: 'center', width: col.width, flexShrink: 0, overflow: 'hidden' }
    : { display: 'flex', alignItems: 'center', flex: '1 0 0', minWidth: 0, overflow: 'hidden' };
}

/* ── Checkbox (Atoms/Checkbox: 16px, 1.5px border, radius 2) ──────────────── */
function CellCheckbox({ checked, indeterminate, onChange }) {
  const on = checked || indeterminate;
  return (
    <span
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : !!checked}
      tabIndex={0}
      onClick={() => onChange && onChange(!checked)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange && onChange(!checked); } }}
      style={{
        width: 16, height: 16, flexShrink: 0, borderRadius: DS.radiusSm,
        border: `1.5px solid ${on ? DS.actionPrimary : DS.borderDefault}`,
        background: on ? DS.actionPrimary : DS.surfaceCanvas,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxSizing: 'border-box',
      }}
    >
      {indeterminate
        ? <span style={{ width: 8, height: 1.5, background: DS.textOnBrand, borderRadius: 1 }} />
        : checked && <Ico.Check s={12} c={DS.textOnBrand} />}
    </span>
  );
}

/* ── Table ────────────────────────────────────────────────────────────────── */
export function Table({
  columns,
  rows,
  rowId,
  cell,
  selectable = false,
  selected,
  onSelectedChange,
  sortKey,
  sortDir,
  onSort,
  filters,
  onFilterChange,
  actions,
  // The Principles page says the Actions column is "toujours en dernière colonne,
  // largeur fixe" (always last, FIXED width). The Table/Contacts template gives it
  // flex-1, which stretches it to a full data-column width. Following Principles —
  // it is the usage authority, and a stretched actions column is clearly not the
  // intent on a 7-column table. Pass actionsWidth={null} for template behaviour.
  actionsWidth = 96,
  // Zebra striping uses the DS Cell `Alt` background. Off by default — the
  // Table/Contacts template renders every row on Base.
  zebra = false,
  onRowClick,
  // Per-row style override, (row, index) => style. Used for things the column
  // config cannot express — a rule above the first row of a group, say.
  rowStyle,
  // ⚠ EXPANDABLE ROWS ARE NOT IN THE DS. There is no expand/collapse spec on any
  // component page, so this is a codebase extension: passing `expandedContent`
  // adds a 40px chevron column and renders the returned node in a full-width
  // sub-row. The sub-row sits on brand/primary-subtle (#EFF4FF) with a 3px
  // brand/primary rail down its left edge — the DS's own tint for secondary
  // chrome (it is what surface/header and the PageHeader Contact type use), and
  // the rail ties the detail block to the row it belongs to. The Cell `Alt` grey
  // was the first pass and read as a dead zone. Flag it if a design takes it over.
  expandedContent,
  isExpandable,
  toolbar,
  page,
  pages,
  setPage,
  total = null,
  pageSize = null,
  emptyState = null,
  style: styleProp,
}) {
  const ids = React.useMemo(() => rows.map((r) => rowId(r)), [rows, rowId]);
  const [openRows, setOpenRows] = React.useState([]);
  const canExpand = (row) => !!expandedContent && (isExpandable ? isExpandable(row) : true);
  const toggleRow = (id) =>
    setOpenRows((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const sel = selected ?? [];
  const allChecked = ids.length > 0 && ids.every((id) => sel.includes(id));
  const someChecked = !allChecked && ids.some((id) => sel.includes(id));

  function toggleAll(next) {
    if (!onSelectedChange) return;
    onSelectedChange(next ? ids : []);
  }
  function toggleOne(id, next) {
    if (!onSelectedChange) return;
    onSelectedChange(next ? [...sel, id] : sel.filter((x) => x !== id));
  }

  const hasToolbar = !!toolbar && Object.values(toolbar).some((v) => v != null);
  const hasFooter = pages != null || total != null;
  // The template uses a literal #E7E8EA for these, not the border/divider token.
  const sep = <div style={{ height: 1, background: DS.borderTableSep, flexShrink: 0 }} />;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'stretch',
      background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`,
      borderRadius: DS.radiusXl, boxShadow: DS.shadowSm, overflow: 'hidden',
      ...styleProp,
    }}>
      {hasToolbar && (
        <>
          <TableToolbar {...toolbar} />
          {sep}
        </>
      )}

      {/* Header row — the master; data rows below mirror its column config */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {expandedContent && (
          <div style={{
            width: EXPAND_W, flexShrink: 0, height: CELL_H,
            background: DS.surfaceHeader, boxSizing: 'border-box',
          }} />
        )}
        {selectable && (
          <div style={{
            display: 'flex', alignItems: 'center', width: CHECK_W, flexShrink: 0,
            height: CELL_H, padding: '12px', background: DS.surfaceHeader,
            boxSizing: 'border-box',
          }}>
            <CellCheckbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} />
          </div>
        )}
        {columns.map((col) => (
          <HeadCell
            key={col.key}
            col={col}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={onSort}
            filters={filters}
            onFilterChange={onFilterChange}
          />
        ))}
        {actions && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            ...(actionsWidth ? { width: actionsWidth, flexShrink: 0 } : { flex: '1 0 0', minWidth: 0 }),
            height: CELL_H, padding: '12px 16px', gap: 8,
            background: DS.surfaceHeader, boxSizing: 'border-box',
          }}>
            <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, textAlign: 'right' }}>
              Actions
            </span>
          </div>
        )}
      </div>

      {/* Data rows */}
      {rows.length === 0 && emptyState}
      {rows.map((row, ri) => {
        const id = rowId(row);
        const isSel = sel.includes(id);
        const expandable = canExpand(row);
        const isOpen = expandable && openRows.includes(id);
        // Row paints the Cell background for the whole row (see Cell's note).
        const rowBg = isSel
          ? CELL_BG.Selected
          : zebra && ri % 2 === 1 ? CELL_BG.Alt : CELL_BG.Base;
        return (
          <React.Fragment key={id}>
          <div
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = DS.surfaceSubtle; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = rowBg; }}
            style={{
              display: 'flex', alignItems: 'stretch', background: rowBg,
              cursor: onRowClick ? 'pointer' : 'default',
              transition: `background ${DS.durFast} ${DS.ease}`,
              ...(rowStyle ? rowStyle(row, ri) : null),
            }}
          >
            {expandedContent && (
              <div
                onClick={(e) => { e.stopPropagation(); if (expandable) toggleRow(id); }}
                title={expandable ? (isOpen ? 'Hide details' : 'Show details') : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: EXPAND_W, flexShrink: 0, height: CELL_H, boxSizing: 'border-box',
                  cursor: expandable ? 'pointer' : 'default',
                }}
              >
                {expandable && (
                  <span style={{
                    display: 'flex', transition: `transform ${DS.durFast} ${DS.ease}`,
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>
                    <Ico.ChevDown s={16} c={DS.textSecondary} />
                  </span>
                )}
              </div>
            )}
            {selectable && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', width: CHECK_W, flexShrink: 0,
                  height: CELL_H, padding: '12px', boxSizing: 'border-box',
                }}
              >
                <CellCheckbox checked={isSel} onChange={(next) => toggleOne(id, next)} />
              </div>
            )}
            {columns.map((col, i) => (
              <Cell
                key={col.key}
                type={col.type || 'text'}
                align={col.align}
                width={col.width}
                emphasis={i === 0}
                value={cell(row, col.key)}
                onToggle={col.onToggle ? (next) => col.onToggle(row, next) : undefined}
              />
            ))}
            {actions && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  ...(actionsWidth ? { width: actionsWidth, flexShrink: 0 } : { flex: '1 0 0', minWidth: 0 }),
                  height: CELL_H, padding: '12px 16px', gap: 8,
                  boxSizing: 'border-box',
                }}
              >
                {actions(row)}
              </div>
            )}
          </div>
          {isOpen && (
            <div style={{
              background: DS.brandPrimarySubtle,
              borderTop: `1px solid ${DS.borderTableSep}`,
              boxShadow: `inset 3px 0 0 0 ${DS.brandPrimary}`,
            }}>
              {expandedContent(row)}
            </div>
          )}
          </React.Fragment>
        );
      })}

      {hasFooter && (
        <>
          {sep}
          <PaginationBar page={page} pages={pages} setPage={setPage} total={total} pageSize={pageSize} />
        </>
      )}
    </div>
  );
}

/* ── PaginationBar (Molecules/PaginationBar 1774:4443) ────────────────────────
   "Table footer: result count on the left, page navigation on the right."      */
export function PaginationBar({ page = 0, pages = 1, setPage, total = null, pageSize = null }) {
  const from = total != null && pageSize ? page * pageSize + 1 : null;
  const to = total != null && pageSize ? Math.min((page + 1) * pageSize, total) : null;

  // Windowed page list with a trailing ellipsis, as in the template.
  const MAX = 5;
  const start = Math.max(0, Math.min(page - Math.floor(MAX / 2), Math.max(0, pages - MAX)));
  const shown = Array.from({ length: Math.min(MAX, pages) }, (_, i) => start + i);

  const arrow = (icon, to_, disabled, label) => (
    <span
      onClick={disabled ? undefined : () => setPage(to_)}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {icon}
    </span>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 24px', background: DS.surfaceCanvas,
    }}>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textMuted }}>
        {total != null && pageSize ? `${from}-${to} of ${total}` : ''}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {arrow(<Ico.ChevFirst s={16} c={DS.textMuted} />, 0, page === 0, 'First page')}
        {arrow(<Ico.ChevL s={16} c={DS.textMuted} />, page - 1, page === 0, 'Previous page')}

        {shown.map((p) => {
          const active = p === page;
          return (
            <span
              key={p}
              onClick={() => setPage(p)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, flexShrink: 0, borderRadius: DS.radiusMd,
                background: active ? DS.brandPrimary : 'transparent',
                color: active ? DS.textOnBrand : DS.textMuted,
                fontFamily: DS.ff, fontSize: 14, lineHeight: '20px',
                fontWeight: active ? TY.weightSemiBold : TY.weightRegular,
                cursor: 'pointer', userSelect: 'none',
              }}
            >
              {p + 1}
            </span>
          );
        })}

        {start + shown.length < pages && (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, ...TY.bodyMd, fontFamily: DS.ff, color: DS.textMuted,
          }}>…</span>
        )}

        {arrow(<Ico.ChevRight s={16} c={DS.textMuted} />, page + 1, page >= pages - 1, 'Next page')}
        {arrow(<Ico.ChevLast s={16} c={DS.textMuted} />, pages - 1, page >= pages - 1, 'Last page')}
      </div>
    </div>
  );
}

export default Table;
