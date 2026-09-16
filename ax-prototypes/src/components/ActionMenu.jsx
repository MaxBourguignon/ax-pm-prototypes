/**
 * AX Prototypes — ActionMenu
 * A single overflow (⋯) button that opens a small dropdown of row actions —
 * use it to collapse a cluster of icon buttons into one CTA. Closes on
 * outside-click and on selection. Hidden items are dropped; if none remain it
 * renders nothing.
 *
 *   <ActionMenu items={[
 *     { label: 'View',      icon: <Ico.Eye s={16} c={DS.actionPrimary} />,       onClick: open },
 *     { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: dup },
 *     { label: 'Delete',    icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: del, danger: true, hidden: !canManage },
 *   ]} />
 *
 * Props: items [{ label, icon, onClick, danger, hidden }], size ('Small'|'Medium'),
 *        width, align ('right'|'left'), icon (override the trigger glyph).
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import IconBtn from './Iconbtn';

export function ActionMenu({ items = [], size = 'Small', width = 200, align = 'right', icon, borderColor = DS.actionPrimary }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  const visible = items.filter((it) => it && !it.hidden);
  if (!visible.length) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <IconBtn type="Secondary" size={size} active={open} aria-label="Actions"
               icon={icon || <Ico.Dots s={16} c={DS.actionPrimary} />}
               onClick={() => setOpen((o) => !o)} />
      {open && (
        <div style={{ position: 'absolute', top: size === 'Small' ? 34 : 44, [align]: 0, zIndex: 30,
                      width, background: DS.bgCard, border: `1px solid ${borderColor}`, borderRadius: 8,
                      boxShadow: '0 3px 10px rgba(0,0,0,0.08)', padding: 6 }}>
          {visible.map((it, i) => (
            <div key={i} role="button" onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
                 style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6,
                          cursor: 'pointer', ...TY.b2, fontFamily: DS.ff,
                          color: it.danger ? DS.feedbackError : DS.textDefault }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = it.danger ? DS.feedbackErrorBg : DS.actionSecondaryHover)}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {it.icon}{it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;
