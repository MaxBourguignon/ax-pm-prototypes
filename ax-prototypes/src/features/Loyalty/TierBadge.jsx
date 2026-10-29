import React from 'react';
import { DS, TY } from '../../utils/designSystem';

export function TierBadge({ name, color, size = 'medium' }) {
  const sm = size === 'small';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: sm ? '2px 8px' : '4px 12px',
      borderRadius: 999,
      background: color || DS.neutral500,
      color: color === '#FFD700' ? '#1a1a1a' : DS.textInverse,
      fontFamily: DS.ff,
      ...(sm ? TY.labelMd : TY.bodySm),
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {name}
    </span>
  );
}

export default TierBadge;
