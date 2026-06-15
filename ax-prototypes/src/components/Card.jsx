/**
 * AX Prototypes — Card
 * Plain surface container (white bg, hairline border, rounded). Compose anything
 * inside; pass `style` to tweak margin/padding/overflow per use.
 *
 *   <Card style={{ margin: '0 24px', padding: 16 }}>…</Card>
 */
import React from 'react';
import { DS } from '../utils/designSystem';

export function Card({ children, style }) {
  return (
    <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

export default Card;
