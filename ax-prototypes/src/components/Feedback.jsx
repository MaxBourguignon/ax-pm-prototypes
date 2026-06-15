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
    <Modal open={open} onClose={onCancel} variant="center" width={420} title={title}
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
