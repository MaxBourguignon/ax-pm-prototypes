/**
 * AX Design System — Stepper
 *
 * The DS way to show progress inside a multi-step modal. Read with
 * get_design_context 2026-09 off `Modales / Ajout contacts à une liste — FR`
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=1477-3166
 * (Stepper nodes 1477:3173 · 1477:3201 · 1477:3248 · 1484:3670).
 *
 * Spec:
 *   row       flex · gap 8 · items centre · FIRST element of the modal BODY
 *             (never in the gradient header). DS body = padding 20px 24px 24px,
 *             gap 16, so the stepper sits 20px under the header rule.
 *   step      flex · gap 6 · items centre
 *   circle    22×22 · radius 11
 *               upcoming  surface/canvas · 1.5px border/default · 11px Medium text/muted
 *               current   brand/primary   · no border            · 11px SemiBold on-brand
 *               done      feedback/success · no border            · ✓ on-brand
 *   label     13px
 *               upcoming  Medium   text/muted
 *               current   Medium   brand/primary
 *               done      Regular  feedback/success
 *   connector 32×1 rectangle between two steps
 *               border/default while the next step is unreached
 *               brand/primary once it has been passed
 *
 * ⚠ Divergences, flagged rather than silently applied:
 *   - 13/500 is not in the published type scale (TY has 13/400 bodySm and
 *     13/600 bodySmBold), so the label is bodySm with an explicit weight.
 *   - the DS draws the done state's tick as a text "✓" glyph; this renders
 *     Ico.Check at 12px instead — same mark, crisper at any zoom.
 *   - `onStepClick` (jump back to an earlier step) is not in the DS.
 *
 * Usage:
 *   <Stepper steps={['Record to keep', 'Impact']} current={step} />
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

const CIRCLE = {
  width: 22, height: 22, borderRadius: 11, flexShrink: 0, boxSizing: 'border-box',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

function StepCircle({ index, state }) {
  if (state === 'done') {
    return (
      <span style={{ ...CIRCLE, background: DS.feedbackSuccess }}>
        <Ico.Check s={12} c={DS.textOnBrand} />
      </span>
    );
  }
  const current = state === 'current';
  return (
    <span style={{
      ...CIRCLE,
      background: current ? DS.brandPrimary : DS.surfaceCanvas,
      border: current ? 'none' : `1.5px solid ${DS.borderDefault}`,
      fontFamily: DS.ff, fontSize: 11, lineHeight: '11px',
      fontWeight: current ? 600 : 500,
      color: current ? DS.textOnBrand : DS.textMuted,
    }}>
      {index + 1}
    </span>
  );
}

export function Stepper({ steps = [], current = 0, onStepClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {steps.map((s, i) => {
        const label = typeof s === 'string' ? s : s.label;
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        const back = onStepClick && state === 'done';
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <span style={{
                width: 32, height: 1, flexShrink: 0,
                background: current > i - 1 ? DS.brandPrimary : DS.borderDefault,
              }} />
            )}
            <span
              onClick={back ? () => onStepClick(i) : undefined}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                cursor: back ? 'pointer' : 'default',
              }}
            >
              <StepCircle index={i} state={state} />
              <span style={{
                ...TY.bodySm,
                fontFamily: DS.ff,
                fontWeight: state === 'done' ? 400 : 500,
                color: state === 'done' ? DS.feedbackSuccess
                  : state === 'current' ? DS.brandPrimary : DS.textMuted,
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Stepper;
