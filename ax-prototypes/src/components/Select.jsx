/**
 * AX Prototypes — Select
 * Single-choice dropdown (no native <select>). Closes on outside-click.
 *
 *   <Select label="Owner" value={owner} onChange={setOwner}
 *           options={[{ value: 'a', label: 'Alice' }, { value: 'b', label: 'Bob' }]} />
 *   <Select value={op} onChange={setOp} options={ops} width={92} placeholder="—" />
 *
 * Props: label, value, options [{ value, label }], onChange, disabled, width, placeholder.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

export function Select({ label, value, options = [], onChange, disabled, width, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const sel = options.find((o) => o.value === value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: width || '100%' }}>
      {label && <label style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>{label}</label>}
      <div ref={ref} style={{ position: 'relative' }}>
        <button type="button" onClick={() => !disabled && setOpen((o) => !o)} style={{
          height: 40, width: '100%', background: disabled ? DS.actionDisabledBg : DS.bgSurface,
          border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`, borderRadius: 6, padding: '8px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: DS.ff, ...TY.b2,
          color: sel ? DS.textDefault : DS.textPlaceholder,
        }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sel ? sel.label : (placeholder || '—')}
          </span>
          <Ico.ChevDown s={18} c={DS.textSecondary} />
        </button>
        {open && !disabled && (
          <div style={{ position: 'absolute', top: 44, left: 0, width: '100%', background: DS.bgCard,
                        border: `1px solid ${DS.borderDefault}`, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        zIndex: 50, overflow: 'hidden', maxHeight: 240, overflowY: 'auto' }}>
            {options.map((o) => (
              <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                   onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
                   onMouseLeave={(e) => (e.currentTarget.style.background = DS.bgCard)}
                   style={{ minHeight: 40, padding: '0 12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', cursor: 'pointer', ...TY.b2, color: DS.textDefault, fontFamily: DS.ff }}>
                {o.label}{o.value === value && <Ico.Check s={16} c={DS.actionPrimary} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Select;
