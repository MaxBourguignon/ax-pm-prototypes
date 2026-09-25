/**
 * AX Design System — ActionMenu
 *
 * One trigger that opens a dropdown of actions. Closes on outside-click and on
 * selection. Hidden items are dropped; if none remain it renders nothing.
 *
 * The rows are Figma Molecules/MenuItem (554:2953), read from the variant board
 * 1017:20589 with get_design_context 2026-09:
 *   h 40 · padding 10/12 · radius 4 · gap 8 · w 240
 *   Default   no fill · label Body/Medium/Regular (14/20/400) in text/default
 *   Hover     fill surface/subtle
 *   Selected  fill brand/primary-subtle · label brand/on-surface
 *   Disabled  label text/disabled
 *   Kind=WithIcon puts a 16px icon before the label.
 *
 * ⚠ The DS has no DESTRUCTIVE menu item. `danger` is a local extension — the
 *   label takes action/danger and the hover fill feedback/danger-subtle — kept
 *   because Delete needs to not look like Duplicate.
 *
 * Trigger: pass `label` for a Secondary button with the ellipsis on its left
 * (the record header's "Options"); omit it for the bare ⋯ icon button used in
 * table rows.
 *
 *   <ActionMenu label="Options" items={[
 *     { label: 'Anonymize', icon: <Ico.User s={16} c={DS.textSecondary} />, onClick: anon },
 *     { label: 'Delete',    icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: del, danger: true },
 *   ]} />
 *
 * Props: items [{ label, icon, onClick, danger, disabled, selected, hidden }],
 *        label, size ('Sm'|'Md'|'Lg', DS scale), width, align, icon,
 *        disabled (the whole menu — the trigger cannot be opened),
 *        disabledTooltip (why, shown on hover — Atoms/Tooltip 462:49).
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import IconBtn from './Iconbtn';
import { Btn } from './Btn';
import Tooltip from './Tooltip';

function MenuItem({ item, onSelect }) {
  const [hover, setHover] = React.useState(false);
  const { label, icon, danger, disabled, selected } = item;

  const fill = disabled ? 'transparent'
    : selected ? DS.brandPrimarySubtle
    : hover ? (danger ? DS.feedbackDangerSubtle : DS.surfaceSubtle)
    : 'transparent';

  const color = disabled ? DS.textDisabled
    : danger ? DS.actionDanger
    : selected ? DS.brandOnSurface
    : DS.textDefault;

  return (
    <div
      role="button"
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 40, padding: '10px 12px', boxSizing: 'border-box',
        borderRadius: DS.radiusMd, background: fill,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...TY.bodyMd, fontFamily: DS.ff, color,
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      {icon}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

export function ActionMenu({
  items = [],
  label,
  /* Passed straight to Btn/IconBtn, which own the DS size scale (Sm 28 / Md 36 /
     Lg 44) and its legacy aliases. This used to map 'Small'→Sm and EVERYTHING
     ELSE→Md, which silently made Lg impossible and duplicated a mapping the
     button components already do. */
  size = 'Sm',
  width = 240,
  align = 'right',
  icon,
  disabled = false,
  /* Why the menu is disabled, shown on hover. A disabled <button> dispatches no
     mouse events, so the trigger gets pointer-events: none and the Tooltip's
     own wrapper picks the hover up instead. */
  disabledTooltip,
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  const visible = items.filter((it) => it && !it.hidden);
  if (!visible.length) return null;

  const trigger = label
    ? (
      <Btn
        type="Secondary"
        size={size}
        disabled={disabled}
        style={disabled && disabledTooltip ? { pointerEvents: 'none' } : undefined}
        iconLeft={icon || <Ico.Dots s={16} />}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Btn>
    ) : (
      <IconBtn
        kind="Outline"
        size={size}
        disabled={disabled}
        active={open}
        aria-label="Actions"
        title="Actions"
        icon={icon || <Ico.Dots s={16} c={DS.actionPrimary} />}
        onClick={() => setOpen((o) => !o)}
      />
    );

  const opener = disabled && disabledTooltip
    ? <Tooltip label={disabledTooltip}>{trigger}</Tooltip>
    : trigger;

  return (
    /* inline-FLEX, not inline-block: an inline-block wrapper sits on the text
       baseline, so it picks up the line box's descender space and the trigger
       ends up a few pixels taller than a plain Btn standing beside it. */
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      {opener}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', [align]: 0, zIndex: 30, width,
          background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`,
          borderRadius: DS.radiusLg, boxShadow: DS.shadowMd, padding: 6,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {visible.map((it, i) => (
            <MenuItem
              key={i}
              item={it}
              onSelect={() => { setOpen(false); it.onClick?.(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;
