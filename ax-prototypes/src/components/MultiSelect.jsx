/**
 * AX Prototypes — MultiSelect
 * Several values from one dropdown. The sibling of ./Select: same trigger box,
 * same panel and MenuItems (imported from Select so the two never drift), but a
 * pick toggles the value and the panel stays open.
 *
 * No DS node: the DS specs a single-choice Select (556:2972) only. This is a
 * codebase-only composition of Select's panel + RemovableChip for the values.
 *
 * Trigger  the chosen values as RemovableChips; past `maxChips` the rest
 *          collapse into a "+N" badge. Empty → placeholder in text/secondary.
 * Panel    options with the Select check on picked rows. With `creatable`, a
 *          type-in field heads the panel: it filters the options, and Enter (or
 *          the "Add" row) adds the typed text as a value of its own.
 *
 * Props
 *   value       string[]
 *   onChange    (string[]) => void
 *   options     [{ value, label }] — may be empty when `creatable`
 *   creatable   boolean — free values allowed (text fields with no fixed list)
 *   placeholder · width · minWidth (panel) · maxChips (default 2)
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import { RemovableChip, Badge } from './Tag';
import { MenuItem, MenuSection } from './Select';
import { panelShell, PANEL_MAX_H } from './menuPanel';

export function MultiSelect({
  value = [], onChange, options = [], creatable = false,
  placeholder = 'Choose…', width = 240, minWidth, maxChips = 2,
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [pos, setPos] = React.useState(null);
  const trigRef = React.useRef(null);
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const f = (e) => {
      if (trigRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
      setQuery('');
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open]);

  // Always portalled — it lives in the scrolling segment builder.
  React.useEffect(() => {
    if (!open || !trigRef.current) return;
    const r = trigRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const flip = below < PANEL_MAX_H && r.top > below;
    setPos({
      top: flip ? r.top + window.scrollY - PANEL_MAX_H - 4 : r.bottom + window.scrollY + 4,
      left: r.left + window.scrollX,
      width: Math.max(minWidth ?? 0, r.width),
    });
  }, [open, minWidth, value.length]);

  const labelOf = (v) => options.find((o) => o.value === v)?.label ?? v;
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const remove = (v) => onChange(value.filter((x) => x !== v));

  const q = query.trim();
  // Typed values are options too, so they can be unticked from the panel.
  const all = [...options, ...value.filter((v) => !options.some((o) => o.value === v)).map((v) => ({ value: v, label: v }))];
  const shown = q ? all.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : all;
  const canAdd = creatable && q && !all.some((o) => o.label.toLowerCase() === q.toLowerCase());
  const add = () => { if (canAdd) onChange([...value, q]); setQuery(''); };

  const visible = value.slice(0, maxChips);
  const overflow = value.length - visible.length;

  const panel = (
    <div ref={panelRef} style={{ ...panelShell, width: pos?.width }}>
      {creatable && (
        <>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="Type a value, press Enter"
            style={{
              width: '100%', height: 36, boxSizing: 'border-box', padding: '0 12px',
              border: 'none', outline: 'none', background: 'transparent',
              ...TY.bodyMd, fontFamily: DS.ff, color: DS.textStrong,
            }}
          />
          {(shown.length > 0 || canAdd) && <MenuSection />}
        </>
      )}
      {shown.map((o) => (
        <MenuItem key={o.value} label={o.label} selected={value.includes(o.value)} onClick={() => toggle(o.value)} />
      ))}
      {canAdd && (
        <MenuItem label={`Add “${q}”`} onClick={add} />
      )}
      {!creatable && options.length === 0 && (
        <div style={{ padding: 12, textAlign: 'center', ...TY.bodySm, fontFamily: DS.ff, color: DS.textMuted }}>
          No options available
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: 'relative', width, flexShrink: 0 }}>
      <div
        ref={trigRef}
        role="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          height: 36, width: '100%', boxSizing: 'border-box',
          padding: '0 12px', borderRadius: DS.radiusLg,
          display: 'flex', alignItems: 'center', gap: 4,
          background: DS.surfaceCanvas,
          border: `1px solid ${open ? DS.borderFocus : DS.borderField}`,
          cursor: 'pointer', fontFamily: DS.ff, ...TY.bodyMd,
          transition: `border-color ${DS.durFast} ${DS.ease}`,
        }}
      >
        <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
          {value.length === 0 && (
            <span style={{ color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {placeholder}
            </span>
          )}
          {visible.map((v) => (
            // Stop the click so removing a value doesn't also open the panel.
            <span key={v} onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', minWidth: 0 }}>
              <RemovableChip onRemove={() => remove(v)}>{labelOf(v)}</RemovableChip>
            </span>
          ))}
          {overflow > 0 && <Badge tone="neutral">+{overflow}</Badge>}
        </div>
        {open ? <Ico.ArrowUpSmall s={16} c={DS.textSecondary} /> : <Ico.ArrowDownSmall s={16} c={DS.textSecondary} />}
      </div>

      {open && pos && createPortal(
        <div style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}>{panel}</div>,
        document.body,
      )}
    </div>
  );
}

export default MultiSelect;
