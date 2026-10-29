import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import { ActionMenu } from '../../components/ActionMenu';
import { TierBadge } from './TierBadge';
import { useLang } from './i18n';
import { HeadRow, Note } from './LoyaltyUI';

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
  const { t } = useLang();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(o => !o)} title={t('tiers.changeColor')}
        style={{ width: 28, height: 28, borderRadius: '50%', background: value,
                 border: `2px solid ${DS.surfaceCanvas}`, outline: `2px solid ${DS.borderDefault}`,
                 cursor: 'pointer', transition: 'outline-color 0.15s' }}>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 34, left: 0, zIndex: 20, background: DS.surfaceCanvas,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg, padding: 8,
                      boxShadow: DS.shadowMd, display: 'grid',
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
  const { t } = useLang();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      <HeadRow cols={COLS} gap={12} labels={['', t('tiers.col.name'), t('tiers.col.min'), t('tiers.col.max'), t('tiers.col.color'), '']} />

      {tiers.length === 0 && (
        <div style={{ padding: '28px 16px', textAlign: 'center',
                      border: `1.5px dashed ${DS.borderDefault}`, borderRadius: DS.radiusLg }}>
          <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>
            {t('tiers.none')}
          </div>
          <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 4 }}>
            {t('tiers.suggestion')}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tiers.map(tier => {
          const isOverlap = overlapping.has(tier.id);
          return (
            <div key={tier.id} style={{
              display: 'grid', gridTemplateColumns: COLS, gap: 12, padding: '10px 12px',
              alignItems: 'center', background: DS.surfaceCanvas,
              border: `1px solid ${isOverlap ? DS.feedbackError : DS.borderDefault}`,
              borderRadius: DS.radiusLg, transition: 'border-color 0.15s',
            }}>
              <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                <Ico.Drag s={16} c={DS.textSecondary} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Field value={tier.name} onChange={e => updateTier(tier.id, 'name', e.target.value)}
                  placeholder={t('tiers.namePh')}
                  error={!tier.name.trim() ? t('common.required') : undefined}
                  style={{ flex: 1, minWidth: 0 }} />
                {tier.name && (
                  <TierBadge name={tier.name} color={tier.color} size="small" />
                )}
              </div>

              <Field
                value={tier.min === null || tier.min === undefined ? '' : String(tier.min)}
                onChange={e => updateTier(tier.id, 'min', e.target.value === '' ? '' : e.target.value)}
                placeholder="0" type="number"
                error={isOverlap ? t('tiers.overlap') : undefined}
              />

              <Field
                value={tier.max === null ? '' : String(tier.max)}
                onChange={e => updateTier(tier.id, 'max', e.target.value === '' ? null : e.target.value)}
                placeholder={t('tiers.maxPh')} type="number"
              />

              <ColorPicker value={tier.color} onChange={c => updateTier(tier.id, 'color', c)} />

              <ActionMenu items={[
                { label: t('common.delete'), icon: <Ico.Trash s={16} c={DS.feedbackError} />,
                  onClick: () => deleteTier(tier.id), danger: true },
              ]} />
            </div>
          );
        })}
      </div>

      {overlapping.size > 0 && <Note tone="error">{t('tiers.overlapMsg')}</Note>}

      <div style={{ marginTop: 4 }}>
        <Btn type="Secondary" size="Small" iconLeft={<Ico.Plus s={16} />} onClick={addTier}>
          {t('tiers.add')}
        </Btn>
      </div>
    </div>
  );
}

export default TierTable;
