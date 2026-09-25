/**
 * AX Design System — Select
 * Single-choice dropdown (no native <select>). Closes on outside-click.
 *
 * Trigger — Figma Atoms/Select, component set 556:2972 (verified 2026-09):
 *   240 × 44 · radius 8 · padding 10px 12px · gap 8 · chevron 16
 *   label Body/Medium/Regular (14/20/400), flex:1 + ellipsis
 *     Default, no value   bg surface/canvas · border border/field · text text/secondary
 *     Default, has value  bg surface/canvas · border border/field · text text/default
 *     Disabled            bg surface/muted  · border border/subtle · text text/disabled
 *   The disabled state inverts the usual relationship — the fill gets DARKER
 *   while the border gets LIGHTER.
 *
 * Panel — Figma Molecules/MenuItem 554:2854 + MenuSection 558:2957:
 *   MenuItem   240 × 40 · px 12 py 10 · radius 4 · Body/Medium/Regular
 *     Default   no fill              · text text/default
 *     Hover     surface/subtle       · text text/default
 *     Selected  brand/primary-subtle · text brand/on-surface
 *   MenuSection (HasLabel=true)  pt 8 px 12 · Label/Medium in text/secondary
 *     + a 1px border/divider rule beneath
 *
 * Per the Principles page, Select is for "a choice from a CLOSED LIST of
 * predefined values". A list of *commands* is a menu — use MenuItem/ActionMenu,
 * not this.
 *
 * ⚠ Not in the DS, marked below: the `Open` trigger border (the DS Open variant
 *   was not read, so it keeps borderFocus) and the panel container itself (no
 *   Figma node — radius/shadow follow the trigger).
 * ⚠ The DS Select is 44 tall while a FormField Input is 36. They will not line
 *   up in the same row. DS-side inconsistency, not a bug here.
 *
 * Props
 *   value, onChange, disabled, width, placeholder, label, required
 *   options   [{ value, label, meta?, group? }]
 *               meta  → trailing annotation (e.g. a type glyph, a count)
 *               group → options are bucketed under a MenuSection per group
 *               A plain COUNT belongs in the option label, not here — a badge
 *               on every row reads as a row of qualifiers.
 *   header    string | node — rendered as the panel's MenuSection label
 *   footerAction  { label, icon?, onClick } — an action pinned under the
 *             options, below a label-less MenuSection rule: brand-coloured,
 *             never selected, never the value. For "Create a …" and the like.
 *   portal    boolean — render the panel in a portal anchored to the trigger,
 *             flipping above when there isn't room below. Required when the
 *             Select lives inside a scrolling/clipping container.
 *   minWidth  number — portal panel min width (defaults to the trigger width)
 *   trigger   ({ open, toggle }) => node — replace the standard trigger box
 *             when the opener isn't a Select-shaped control. The PANEL stays
 *             DS-conformant either way; this is what keeps otherwise-custom
 *             pickers harmonized.
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import { Badge } from './Tag';

const PANEL_MAX_H = 320;

function MenuItem({ label, meta, selected, onClick }) {
  const [hover, setHover] = React.useState(false);
  const bg = selected ? DS.brandPrimarySubtle : hover ? DS.surfaceSubtle : 'transparent';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, height: 40, padding: '10px 12px', boxSizing: 'border-box',
        borderRadius: DS.radiusLg, background: bg, cursor: 'pointer',
        ...TY.bodyMd, fontFamily: DS.ff,
        color: selected ? DS.brandOnSurface : DS.textDefault,
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <span style={{ flex: '1 0 0', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {meta != null && (
          // The Badge atom in its neutral tone, so a dropdown annotation and a
          // badge elsewhere in the app are the same object.
          <Badge tone="neutral">{meta}</Badge>
        )}
        {selected && <Ico.Check s={16} c={DS.brandOnSurface} />}
      </span>
    </div>
  );
}

// Molecules/MenuSection (558:2960). `HasLabel=false` — no title, just the rule —
// is the DS's own way to split a menu, which is what sets a footer action apart
// from the values above it.
function MenuSection({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 12px 0', boxSizing: 'border-box' }}>
      {label != null && (typeof label === 'string'
        ? <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
        : label)}
      <div style={{ height: 1, background: DS.borderDivider }} />
    </div>
  );
}

/* Footer action — a MenuItem Kind=WithIcon under a label-less MenuSection.
   It is an ACTION, not a value: it carries the brand colour, never a check, and
   never becomes the Select's value. Before this existed, "Create a folder" was
   smuggled in as an option row with a sentinel value, which read as a folder you
   could select. */
function FooterAction({ label, icon, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      role="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 40, padding: '10px 12px', boxSizing: 'border-box',
        borderRadius: DS.radiusLg, cursor: 'pointer',
        background: hover ? DS.surfaceSubtle : 'transparent',
        ...TY.labelLg, fontFamily: DS.ff, color: DS.actionPrimary,
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      {icon}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  );
}

const panelShell = {
  background: DS.surfaceCanvas,
  border: `1px solid ${DS.borderDefault}`,
  borderRadius: DS.radiusLg,
  boxShadow: DS.shadowSm,
  padding: 4,
  boxSizing: 'border-box',
  overflowY: 'auto',
  maxHeight: PANEL_MAX_H,
};

export function Select({
  label, required = false, value, options = [], onChange, disabled, width, placeholder, header,
  portal = false, minWidth, trigger, footerAction,
}) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const wrapRef = React.useRef(null);
  const trigRef = React.useRef(null);
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const f = (e) => {
      if (trigRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      if (!portal && wrapRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open, portal]);

  // Portal placement: below the trigger, flipping above when short on room.
  React.useEffect(() => {
    if (!open || !portal || !trigRef.current) return;
    const r = trigRef.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const flip = below < PANEL_MAX_H && r.top > below;
    setPos({
      top: flip ? r.top + window.scrollY - PANEL_MAX_H - 4 : r.bottom + window.scrollY + 4,
      left: r.left + window.scrollX,
      width: Math.max(minWidth ?? 0, r.width),
    });
  }, [open, portal, minWidth]);

  const sel = options.find((o) => o.value === value);
  const toggle = () => !disabled && setOpen((o) => !o);
  const pick = (v) => { onChange(v); setOpen(false); };

  // Group options when any carry a `group`, preserving first-seen order.
  const grouped = React.useMemo(() => {
    if (!options.some((o) => o.group)) return null;
    const out = [];
    options.forEach((o) => {
      const g = o.group ?? '';
      const bucket = out.find((b) => b.group === g);
      if (bucket) bucket.items.push(o);
      else out.push({ group: g, items: [o] });
    });
    return out;
  }, [options]);

  const panel = (
    <div ref={panelRef} style={portal ? { ...panelShell, width: pos?.width } : { ...panelShell, position: 'absolute', top: 48, left: 0, width: '100%', zIndex: 50 }}>
      {header && <MenuSection label={header} />}
      {grouped
        ? grouped.map((b) => (
            <React.Fragment key={b.group}>
              {b.group && <MenuSection label={b.group} />}
              {b.items.map((o) => (
                <MenuItem key={o.value} label={o.label} meta={o.meta}
                  selected={o.value === value} onClick={() => pick(o.value)} />
              ))}
            </React.Fragment>
          ))
        : options.map((o) => (
            <MenuItem key={o.value} label={o.label} meta={o.meta}
              selected={o.value === value} onClick={() => pick(o.value)} />
          ))}
      {options.length === 0 && !footerAction && (
        <div style={{ padding: 12, textAlign: 'center', ...TY.bodySm, fontFamily: DS.ff, color: DS.textMuted }}>
          No options available
        </div>
      )}
      {footerAction && (
        <>
          {options.length > 0 && <MenuSection />}
          <FooterAction
            label={footerAction.label}
            icon={footerAction.icon}
            onClick={() => { setOpen(false); footerAction.onClick?.(); }}
          />
        </>
      )}
    </div>
  );

  return (
    <div ref={wrapRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, width: width || (trigger ? undefined : '100%') }}>
      {/* Same label row as Molecules/FormField (484:115) — Label/Medium in
          text/strong, h16, gap 4, with the required marker in feedback/danger.
          Field.jsx and Select.jsx must read as one control family. */}
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 16, width: '100%' }}>
          <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {required && (
            <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.feedbackDanger }} aria-hidden="true">*</span>
          )}
        </div>
      )}
      <div style={{ position: 'relative', flexShrink: trigger ? 0 : undefined }}>
        {trigger ? (
          // The wrapper carries the ref (for positioning + outside-click), so the
          // caller's render prop never has to handle one.
          <span ref={trigRef} style={{ display: 'inline-flex' }}>
            {trigger({ open, toggle })}
          </span>
        ) : (
          <button
            ref={trigRef}
            type="button"
            onClick={toggle}
            style={{
              height: 36, width: '100%', boxSizing: 'border-box',
              padding: '10px 12px', borderRadius: DS.radiusLg,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              background: disabled ? DS.surfaceMuted : DS.surfaceCanvas,
              border: `1px solid ${disabled ? DS.borderSubtle : open ? DS.borderFocus : DS.borderField}`,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: DS.ff, ...TY.bodyMd, textAlign: 'left',
              color: disabled ? DS.textDisabled : sel ? DS.textDefault : DS.textSecondary,
              transition: `border-color ${DS.durFast} ${DS.ease}`,
            }}
          >
            <span style={{ flex: '1 0 0', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sel ? sel.label : (placeholder || 'Select…')}
            </span>
            <Ico.ChevDown s={16} c={disabled ? DS.textDisabled : DS.textSecondary} />
          </button>
        )}

        {open && !disabled && (
          portal
            ? (pos && createPortal(
                <div style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}>{panel}</div>,
                document.body,
              ))
            : panel
        )}
      </div>
    </div>
  );
}

export default Select;
