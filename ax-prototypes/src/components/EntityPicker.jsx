/**
 * AX Prototypes — EntityPicker
 *
 * Search field + dropdown for picking one entity at a time out of a set (lists,
 * consents, …). Extracted from EntityActionModal so the record's Lists drawer
 * and the bulk "add to list" flow pick from the same control rather than two
 * look-alikes that drift apart — which is the reason EntityActionModal itself
 * exists for the modal flows.
 *
 * No DS node: the DS specs a SearchBar (171:44) and MenuItem (554:2953) but not
 * the two combined into a picker, so the composition is codebase-only.
 *
 * The dropdown renders in a PORTAL, positioned against the field. Inside a modal
 * or drawer with `overflow: hidden` on its body, an absolutely-positioned menu
 * gets clipped at the panel edge; a portal escapes it.
 *
 * Props
 *   entities      [{ id, name, ref?, count?, disabled?, hint? }]
 *                 `ref` is shown muted before the name ("4821 · Patrons circle")
 *                 `disabled` greys the row and blocks selection; `hint` is the
 *                 short reason, shown on the right (e.g. "automatic")
 *   selectedIds   Set — already-picked ids
 *   onSelect      (id) => void
 *   placeholder · countUnit · hideSelected (default true — drop picked rows;
 *                 pass false to keep them visible in a selected state)
 *   emptyLabel    ({ query, allSelected }) => string
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

export const PortalDropdown = ({ anchorRef, children }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    setRect(anchorRef.current.getBoundingClientRect());
  }, [anchorRef]);

  if (!rect) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}>
      {children}
    </div>,
    document.body,
  );
};

/**
 * The opener, shaped as the DS Select (Atoms/Select 556:2948):
 *   surface/canvas · 1px border/field · h 44 · padding 10/12 · gap 8 · radius 8
 *   Body/Medium/Regular, placeholder in text/secondary · 16px chevron
 * It is still a text input — you type to filter — so it carries a chevron like a
 * select rather than a magnifier, and swaps it for a clear cross once there is
 * something to clear. A select you can type into is the honest shape for a
 * control that both opens a list and narrows it.
 */
export const SearchBox = ({ value, onChange, onFocus, inputRef, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', height: 44,
      boxSizing: 'border-box',
      border: `1px solid ${focused ? DS.borderFocus : DS.borderField}`,
      borderRadius: DS.radiusLg, background: DS.surfaceCanvas,
      transition: `border-color ${DS.durFast} ${DS.ease}`,
    }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: DS.ff, ...TY.bodyMd,
          color: value ? DS.textDefault : DS.textSecondary,
        }}
      />
      {value
        ? (
          <span onClick={() => onChange('')} title="Clear" style={{ cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
            <Ico.Cross s={16} c={DS.textMuted} />
          </span>
        )
        : <Ico.ChevDown s={16} c={DS.textSecondary} />}
    </div>
  );
};

/**
 * One row of the dropdown, built to the DS list item (1477:3215):
 *   name Body/Medium 14 in text/default over a 12px count line in text/muted
 *   (the DS row sets the name SemiBold; it reads too heavy on a long menu, so
 *   it runs regular here and only the colour changes on hover/selection)
 * The design's trailing icon button is deliberately not here — it is a delete
 * action on a row that exists to be ADDED, so it would mean the opposite thing.
 * A plus fades in on hover instead, and an already-picked row carries a check.
 *
 * The row sits on the plain surface; the tint is reserved for the SELECTED
 * state, so "already on this contact" is the only thing colour means here.
 */
export const DropdownItem = ({ entity, countUnit, selected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const off = !!entity.disabled || selected;
  const lit = hovered && !off;
  return (
    <div
      onMouseDown={off ? undefined : (e) => { e.preventDefault(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, padding: '10px 12px',
        cursor: off ? 'default' : 'pointer',
        background: selected ? DS.brandPrimarySubtle : lit ? DS.surfaceSubtle : DS.surfaceCanvas,
        opacity: entity.disabled ? 0.6 : 1,
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <span style={{
          ...TY.bodyMd, fontFamily: DS.ff,
          color: selected || lit ? DS.actionPrimary : DS.textDefault,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          transition: `color ${DS.durFast} ${DS.ease}`,
        }}>
          {/* `ref` prefixes the name — the identifier people quote to each
              other, kept muted so the name still leads the row. */}
          {entity.ref != null && (
            <span style={{ color: DS.textMuted }}>
              {entity.ref}
              {' · '}
            </span>
          )}
          {entity.name}
        </span>
        {entity.count != null && (
          <span style={{ ...TY.labelMd, fontWeight: TY.weightRegular, color: DS.textMuted, fontFamily: DS.ff }}>
            {entity.count.toLocaleString()} {countUnit}
          </span>
        )}
      </div>
      {selected
        ? <Ico.Check s={16} c={DS.actionPrimary} />
        : entity.hint
          ? <span style={{ ...TY.captionSm, color: DS.textMuted, flexShrink: 0 }}>{entity.hint}</span>
          : !off && (
            <span style={{ display: 'flex', flexShrink: 0, opacity: lit ? 1 : 0, transition: `opacity ${DS.durFast} ${DS.ease}` }}>
              <Ico.Plus s={16} c={DS.actionPrimary} />
            </span>
          )}
    </div>
  );
};

/* Folder heading. The DS has MenuSection (558:2960) for exactly this — a label
   that separates groups inside a menu. Kept quiet: plain Label/Medium in
   text/muted, no fill and no rule, so the folder names order the menu without
   competing with the list names for attention. Not sticky either — with no
   background, rows would scroll straight through it. */
const GroupHeading = ({ label }) => (
  <div style={{ padding: '10px 12px 4px' }}>
    <span style={{ ...TY.labelMd, textTransform: 'uppercase', letterSpacing: '0.04em',
                   color: DS.textMuted, fontFamily: DS.ff }}>
      {label}
    </span>
  </div>
);

export function EntityPicker({
  entities = [],
  selectedIds,
  onSelect,
  // Mount with the field focused and the full list already down — for a picker
  // that replaces a previous choice, where the next thing to do is obviously to
  // choose again.
  autoFocus = false,
  placeholder = 'Search…',
  countUnit = '',
  hideSelected = true,
  groupBy,                  // entity key to group rows under (e.g. 'folder')
  emptyLabel,
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(autoFocus);
  const inputRef = useRef();
  const wrapRef = useRef();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!open) return undefined;
    // Closed on an outside mousedown, not on blur: blur fires before the click
    // reaches a row, so the menu would close out from under it.
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const picked = selectedIds ?? new Set();
  const trimmed = search.trim().toLowerCase();
  const filtered = entities.filter((e) =>
    (!trimmed || e.name.toLowerCase().includes(trimmed)) &&
    (!hideSelected || !picked.has(e.id)));

  const handleSelect = (id) => {
    onSelect(id);
    setSearch('');
    setOpen(false);
    inputRef.current?.focus();
  };

  /* Rows grouped under their folder, folders in first-seen order so the
     catalogue's own ordering survives. Without `groupBy` this is one nameless
     group and nothing renders a heading. */
  const groups = [];
  filtered.forEach((e) => {
    const key = groupBy ? (e[groupBy] ?? 'Other') : null;
    const bucket = groups.find(([g]) => g === key);
    if (bucket) bucket[1].push(e);
    else groups.push([key, [e]]);
  });

  const empty = emptyLabel
    ? emptyLabel({ query: search.trim(), allSelected: picked.size === entities.length })
    : (trimmed ? 'No match found' : 'Start typing to search…');

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <SearchBox
        value={search}
        placeholder={placeholder}
        onChange={(v) => { setSearch(v); setOpen(true); }}
        onFocus={() => setOpen(true)}
        inputRef={inputRef}
      />
      {open && (
        <PortalDropdown anchorRef={wrapRef}>
          <div style={{
            background: DS.surfaceCanvas,
            border: `1px solid ${DS.borderSection}`,
            borderRadius: DS.radiusLg,
            boxShadow: '0 12px 32px rgba(15,23,42,.2)',
            maxHeight: 528,
            overflowY: 'auto',
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', ...TY.labelMd, color: DS.textMuted, fontFamily: DS.ff }}>
                {empty}
              </div>
            ) : groups.map(([group, rows]) => (
              <div key={group ?? '—'}>
                {group != null && <GroupHeading label={group} />}
                {rows.map((e) => (
                  <DropdownItem
                    key={e.id}
                    entity={e}
                    countUnit={countUnit}
                    selected={picked.has(e.id)}
                    onSelect={() => handleSelect(e.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </PortalDropdown>
      )}
    </div>
  );
}

export default EntityPicker;
