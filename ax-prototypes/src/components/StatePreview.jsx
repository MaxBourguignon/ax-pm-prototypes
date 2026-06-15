/**
 * AX Prototypes — StatePreview
 *
 * The canonical "prototype state management" control. Use this in every
 * prototype to switch demo states (ready / loading / empty / error) and any
 * other prototype-only toggles (e.g. role). It renders as ONE slight floating
 * CTA pinned to the bottom-right that opens a small window of options — so the
 * state controls never clutter the page itself.
 *
 * Do NOT hand-roll a per-feature state/demo bar — import this instead, so every
 * prototype manages state the same way.
 *
 * Usage — single state group:
 *   const [state, setState] = useState('ready');
 *   <StatePreview groups={[
 *     { label: 'State', value: state, onChange: setState,
 *       options: ['ready', 'loading', 'empty', 'error'] },
 *   ]} />
 *
 * Usage — multiple groups (e.g. role + data state):
 *   <StatePreview groups={[
 *     { label: 'Role',  value: role, onChange: setRole,
 *       options: [{ id: 'admin', label: 'Admin' }, { id: 'user', label: 'User' }] },
 *     { label: 'State', value: dataState, onChange: setDataState,
 *       options: ['ready', 'loading', 'error'] },
 *   ]} />
 *
 * Each option may be a string (used as both id and label) or { id, label }.
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

const norm = (opt) => (typeof opt === 'string' ? { id: opt, label: opt } : opt);

export function StatePreview({ groups = [], label = 'Preview' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (!groups.length) return null;

  // CTA summary = current label of the last group (usually the data state).
  const lastGroup = groups[groups.length - 1];
  const current = norm((lastGroup.options || []).find((o) => norm(o).id === lastGroup.value) || lastGroup.value || '');

  return (
    <div ref={ref} style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50 }}>
      {open && (
        <div style={{ position: 'absolute', bottom: 48, right: 0, width: 188, background: DS.bgCard,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.16)', padding: 6 }}>
          {groups.map((g, gi) => (
            <div key={g.label || gi} style={{ marginBottom: gi === groups.length - 1 ? 0 : 6 }}>
              <div style={{ ...TY.b3, color: DS.textSecondary, padding: '4px 8px 4px',
                            textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {g.label}
              </div>
              {(g.options || []).map((opt) => {
                const o = norm(opt);
                const active = g.value === o.id;
                return (
                  <div key={o.id} role="button" onClick={() => { g.onChange(o.id); setOpen(false); }}
                       style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '7px 8px', borderRadius: 6, cursor: 'pointer', ...TY.b2,
                                textTransform: 'capitalize',
                                color: active ? DS.actionPrimary : DS.textDefault,
                                fontWeight: active ? TY.weightSemiBold : 400,
                                background: active ? DS.blue100 : 'transparent' }}
                       onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = DS.actionSecondaryHover; }}
                       onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                    {o.label}
                    {active && <Ico.Check s={16} c={DS.actionPrimary} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} title={label}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 14px',
                       background: DS.bgCard, border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`,
                       borderRadius: 999, boxShadow: '0 4px 14px rgba(0,0,0,0.14)', cursor: 'pointer',
                       ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
        <Ico.Settings s={16} c={DS.actionPrimary} />
        <span style={{ textTransform: 'capitalize', color: DS.textDefault, fontWeight: TY.weightSemiBold }}>
          {current.label || label}
        </span>
      </button>
    </div>
  );
}

export default StatePreview;
