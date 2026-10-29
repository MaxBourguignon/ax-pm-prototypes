import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import { useLang } from './i18n';

export function TierProgress({ current, nextTierAt, tierColor, nextTierName }) {
  const { t, fmt } = useLang();
  const atMax = !nextTierAt;
  const pct = atMax ? 100 : Math.min((current / nextTierAt) * 100, 100);
  const remaining = atMax ? 0 : nextTierAt - current;

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600 }}>
          {fmt(current)} pts
        </span>
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
          {atMax
            ? t('tiers.maxReached')
            : t('tiers.ptsBefore', { n: fmt(remaining), tier: nextTierName })}
        </span>
      </div>
      <div style={{ height: 6, background: DS.borderDefault, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: tierColor || DS.actionPrimary,
          borderRadius: 999,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

export default TierProgress;
