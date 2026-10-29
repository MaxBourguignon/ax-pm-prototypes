/**
 * Loyalty — shared DS building blocks for the three Loyalty pages.
 *   Section    DS section shell (surfaceCanvas · borderSection · radius 12 ·
 *              shadowSm · titleMd + labelMd description), as on Overview,
 *              Consents and the List record
 *   HeadRow    column labels above a list of row cards (labelMd, text/secondary)
 *   Note       info / error message box (feedback tint, 32px icon tile)
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';

export function Section({ title, sub, right, children, style }) {
  return (
    <section style={{
      background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl,
      boxShadow: DS.shadowSm, padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16,
      minWidth: 0, boxSizing: 'border-box', fontFamily: DS.ff, ...style,
    }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TY.titleMd, color: DS.textStrong }}>{title}</div>
            {sub && <div style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary, marginTop: 2 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function HeadRow({ labels, cols, gap = 16, padding = '0 12px' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap, padding, alignItems: 'center' }}>
      {labels.map((h, i) => (
        <span key={i} style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{h}</span>
      ))}
    </div>
  );
}

const NOTE_TONES = {
  info:  { bg: DS.feedbackInfoBg,  icon: (s) => <Ico.Info s={s} c={DS.feedbackInfo} /> },
  error: { bg: DS.feedbackErrorBg, icon: (s) => <Ico.Warn s={s} c={DS.feedbackError} /> },
};

export function Note({ tone = 'info', children, style }) {
  const t = NOTE_TONES[tone] ?? NOTE_TONES.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: 12, boxSizing: 'border-box',
      borderRadius: DS.radiusLg, border: `1px solid ${DS.borderDefault}`, background: t.bg, ...style,
    }}>
      <span style={{
        width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.surfaceCanvas,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {t.icon(16)}
      </span>
      <div style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff, flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
