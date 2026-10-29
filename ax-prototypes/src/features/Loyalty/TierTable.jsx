import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import { ActionMenu } from '../../components/ActionMenu';
import { TierBadge } from './TierBadge';

let _uid = 100;
const uid = () => `new-${_uid++}`;

const PRESET_COLORS = ['#CD7F32', '#A8A9AD', '#FFD700', '#C41E3A', '#9333EA', '#14B8A6', '#F97316', '#017BFE'];

function detectOverlaps(tiers) {
  const overlapping = new Set();
  for (let i = 0; i < tiers.length; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      const a = tiers[i];
      const b = tiers[j];
      const aMin = a.min === '' ? 0 : Number(a.min);
      const aMax = a.max === null || a.max === '' ? Infinity : Number(a.max);
      const bMin = b.min === '' ? 0 : Number(b.min);
      const bMax = b.max === null || b.max === '' ? Infinity : Number(b.max);
      if (aMin < bMax && aMax > bMin) {
        overlapping.add(a.id);
        overlapping.add(b.id);
      }
    }
  }
  return overlapping;
}

function ColorPicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(o => !o)} title="Changer la couleur"
        style={{ width: 28, height: 28, borderRadius: '50%', background: value,
                 border: `2px solid ${DS.bgCard}`, outline: `2px solid ${DS.borderDefault}`,
                 cursor: 'pointer', transition: 'outline-color 0.15s' }}>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 34, left: 0, zIndex: 20, background: DS.bgCard,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: 8, padding: 8,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'grid',
                      gridTemplateColumns: 'repeat(4, 24px)', gap: 6 }}>
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => { onChange(c); setOpen(false); }}
              style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                       border: value === c ? `2px solid ${DS.textDefault}` : '2px solid transparent' }} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TierTable({ tiers, setTiers }) {
  const overlapping = detectOverlaps(tiers);

  function addTier() {
    setTiers(prev => [...prev, { id: uid(), name: '', min: '', max: null, color: '#9333EA' }]);
  }

  function updateTier(id, field, value) {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function deleteTier(id) {
    setTiers(prev => prev.filter(t => t.id !== id));
  }

  const COLS = '20px 1fr 130px 130px 44px 36px';

  return (
    <div>
      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12,
                    padding: '0 12px 10px', alignItems: 'center' }}>
        {['', 'Nom', 'Points min', 'Points max', 'Couleur', ''].map((h, i) => (
          <span key={i} style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
        ))}
      </div>

      {tiers.length === 0 && (
        <div style={{ padding: '28px 16px', textAlign: 'center',
                      border: `1.5px dashed ${DS.borderDefault}`, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>
            Aucun tier défini.
          </div>
          <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 4 }}>
            Suggestion : Bronze (0–499) → Silver (500–1 499) → Gold (1 500–2 999) → Legend (3 000+)
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {tiers.map(tier => {
          const isOverlap = overlapping.has(tier.id);
          return (
            <div key={tier.id} style={{
              display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '10px 12px',
              alignItems: 'center', background: DS.bgCard,
              border: `1px solid ${isOverlap ? DS.feedbackError : DS.borderDefault}`,
              borderRadius: 8, transition: 'border-color 0.15s',
            }}>
              <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                <Ico.Drag s={16} c={DS.textSecondary} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Field value={tier.name} onChange={e => updateTier(tier.id, 'name', e.target.value)}
                  placeholder="ex: Bronze"
                  error={!tier.name.trim() ? 'Requis' : undefined}
                  style={{ flex: 1, minWidth: 0 }} />
                {tier.name && (
                  <TierBadge name={tier.name} color={tier.color} size="small" />
                )}
              </div>

              <Field
                value={tier.min === null || tier.min === undefined ? '' : String(tier.min)}
                onChange={e => updateTier(tier.id, 'min', e.target.value === '' ? '' : e.target.value)}
                placeholder="0" type="number"
                error={isOverlap ? 'Chevauchement' : undefined}
              />

              <Field
                value={tier.max === null ? '' : String(tier.max)}
                onChange={e => updateTier(tier.id, 'max', e.target.value === '' ? null : e.target.value)}
                placeholder="∞ (illimité)" type="number"
              />

              <ColorPicker value={tier.color} onChange={c => updateTier(tier.id, 'color', c)} />

              <ActionMenu items={[
                { label: 'Supprimer', icon: <Ico.Trash s={16} c={DS.feedbackError} />,
                  onClick: () => deleteTier(tier.id), danger: true },
              ]} />
            </div>
          );
        })}
      </div>

      {overlapping.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '10px 14px',
                      background: DS.feedbackErrorBg, borderRadius: 6,
                      border: `1px solid ${DS.feedbackError}` }}>
          <Ico.Warn s={16} c={DS.feedbackError} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackErrorText }}>
            Les plages de points se chevauchent. Corrigez-les avant d'enregistrer.
          </span>
        </div>
      )}

      <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={16} />} onClick={addTier}>
        Ajouter un tier
      </Btn>
    </div>
  );
}

export default TierTable;
