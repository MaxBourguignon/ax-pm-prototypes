/**
 * AX Prototypes — Feedback states
 * Shared empty / error / confirm patterns so every prototype renders them the
 * same way. (Skeleton lives in ./Skeleton.jsx.)
 *
 *   <EmptyState icon={<Ico.List s={24} c={DS.textSecondary}/>} title="No lists yet"
 *               sub="Create your first list." cta={<Btn>Create</Btn>} />
 *   <ErrorState title="Couldn't load consents." sub="Something went wrong."
 *               retryLabel="Retry" onRetry={reload} />
 *   <ConfirmDialog open={!!target} title="Delete this list?" body="This can't be undone."
 *                  confirmLabel="Delete" cancelLabel="Cancel" danger
 *                  onConfirm={...} onCancel={...} />
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';
import Btn from './Btn';
import Modal from './Modal';

export function EmptyState({ icon, title, sub, cta }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '52px 24px', textAlign: 'center' }}>
      {icon && (
        <span style={{ width: 48, height: 48, borderRadius: 12, background: DS.bgSurface,
                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      )}
      <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
      {sub && <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, maxWidth: 360 }}>{sub}</div>}
      {cta && <div style={{ marginTop: 6 }}>{cta}</div>}
    </div>
  );
}

/* The one completion state. Every action modal ended on its own version of this
   — 52px vs 64px mark, tinted vs solid fill, teal vs green tick, titleMd vs
   15/600 — so finishing two different actions looked like two different products.
   Taken from the add-to-list flow, which was the most used.
   No DS node: the DS has no success screen. Codebase-only, like EmptyState. */
/* The mark on its own, for a completion screen that carries more than a title
   and a line of text (the export's file card, say) but must still wear the same
   badge as every other one. */
export function SuccessMark() {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: DS.feedbackSuccessBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Ico.Check s={24} c={DS.teal500} />
    </div>
  );
}

export function SuccessState({ title, children }) {
  return (
    <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
      <SuccessMark />
      <div style={{ fontSize: 15, fontWeight: 600, color: DS.textStrong, fontFamily: DS.ff }}>{title}</div>
      {children && (
        <div style={{ fontSize: 13, color: DS.textMuted, fontFamily: DS.ff, maxWidth: 300, lineHeight: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ title = "Couldn't load this data.", sub, retryLabel = 'Retry', onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '52px 24px', textAlign: 'center' }}>
      <span style={{ width: 48, height: 48, borderRadius: 12, background: DS.feedbackErrorBg,
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ico.Alert s={24} c={DS.feedbackError} />
      </span>
      <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
      {sub && <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, maxWidth: 360 }}>{sub}</div>}
      {onRetry && (
        <Btn type="Secondary" size="Small" iconLeft={<Ico.Refresh s={16} />} onClick={onRetry}>
          {retryLabel}
        </Btn>
      )}
    </div>
  );
}

export function ConfirmDialog({ open = true, title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
                               danger = false, confirmIcon, onConfirm, onCancel }) {
  const icon = confirmIcon !== undefined ? confirmIcon : (danger ? <Ico.Trash s={18} /> : undefined);
  return (
    <Modal open={open} onClose={onCancel} variant="center" size="sm" title={title}
           footer={
             <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
               <Btn type="Tertiary" size="Medium" onClick={onCancel}>{cancelLabel}</Btn>
               <Btn type="Primary" size="Medium" onClick={onConfirm} iconLeft={icon}
                    style={danger ? { background: DS.feedbackError, border: `1px solid ${DS.feedbackError}` } : {}}>
                 {confirmLabel}
               </Btn>
             </div>
           }>
      <div style={{ padding: 24, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{body}</div>
    </Modal>
  );
}

export default { EmptyState, ErrorState, ConfirmDialog };
