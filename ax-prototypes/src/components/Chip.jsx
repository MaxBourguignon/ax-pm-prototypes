/**
 * AX Prototypes — Chip
 * Toggleable filter pill (e.g. a type/segment filter row). For removable
 * coloured tags use `Tag` from ./Tag; for a multi-select dropdown use ./Select.
 *
 *   <Chip label="All" selected={f === 'all'} onClick={() => setF('all')} />
 *   <Chip label="Dynamic" icon={<Ico.Zap s={14} />} color={DS.green500}
 *         selected={f === 'dynamic'} onClick={() => setF('dynamic')} />
 *
 * Props: label, selected, color (accent when selected), onClick, icon.
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function Chip({ label, selected, color, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, padding: '5px 10px',
      ...TY.b3, fontFamily: DS.ff, cursor: 'pointer', transition: 'all .15s',
      background: selected ? (color || DS.actionPrimary) : DS.bgCard,
      color: selected ? DS.textInverse : (color || DS.blue600),
      border: `1px solid ${selected ? (color || DS.actionPrimary) : DS.borderDefault}`,
    }}>{icon}{label}</button>
  );
}

export default Chip;
