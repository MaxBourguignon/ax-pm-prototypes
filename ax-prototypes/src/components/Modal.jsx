/**
 * AX Design System — Modal / Panel
 * Figma: Modals (259:2179) · HeaderModal (176:1133 / 269:2147).
 *
 * A surface with the DS gradient HeaderModal (bold white title + close) on top,
 * a scrollable body, and an optional footer band. Two layouts:
 *   variant="panel"  → right-anchored side panel (default, e.g. SidebarCreation 392w)
 *   variant="center" → centered modal (e.g. ExportColumnModal 665w)
 *
 * Props:
 *   open      boolean
 *   onClose   () => void              close via X button or scrim click
 *   title     string                  shown in the gradient header
 *   children  body content (scrolls)
 *   footer    node | null             rendered in a bordered footer band
 *   variant   "panel" | "center"      default "panel"
 *   width     number                  override (panel default 440, center default 665)
 *   headerContent node | null          rendered inside the gradient header, below the title row (e.g. tabs)
 *   headerActions node | null          rendered in the title row, just before the close button (e.g. icon buttons)
 *
 * Usage:
 *   <Modal open={open} onClose={close} title="Créer une liste" footer={<Btn>…</Btn>}>
 *     …body…
 *   </Modal>
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

const KEYFRAMES = `
@keyframes axModalFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes axModalSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes axModalPop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

function HeaderModal({ title, onClose, headerContent, headerActions }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{
      flexShrink: 0,
      background: `${DS.gradientBlueV}`,
      padding: headerContent ? '20px 20px 0' : 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ ...TY.h3, fontWeight: 700, color: DS.textInverse, fontFamily: DS.ff, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {headerActions}
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: 28, height: 28, flexShrink: 0, borderRadius: 6, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: hov ? 'rgba(255,255,255,0.18)' : 'transparent', transition: 'background .15s',
            }}
          >
            <Ico.Cross s={20} c={DS.textInverse} />
          </button>
        </div>
      </div>
      {headerContent}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, variant = 'panel', width, headerContent, headerActions }) {
  if (!open) return null;
  const isCenter = variant === 'center';
  const w = width || (isCenter ? 665 : 440);

  const surface = isCenter
    ? {
        position: 'relative', width: w, maxWidth: '94vw', maxHeight: '90vh',
        background: DS.bgCard, borderRadius: 10, overflow: 'hidden',
        boxShadow: '0 18px 50px rgba(0,0,0,0.22)', animation: 'axModalPop .18s ease',
        display: 'flex', flexDirection: 'column',
      }
    : {
        position: 'absolute', top: 0, right: 0, height: '100%', width: w, maxWidth: '94vw',
        background: DS.bgCard, boxShadow: '-8px 0 28px rgba(0,0,0,0.16)', animation: 'axModalSlide .22s ease',
        display: 'flex', flexDirection: 'column',
      };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: isCenter ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.45)', animation: 'axModalFade .15s ease' }} />
      <div style={surface}>
        <HeaderModal title={title} onClose={onClose} headerContent={headerContent} headerActions={headerActions} />
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</div>
        {footer && (
          <div style={{ flexShrink: 0, borderTop: `1px solid ${DS.borderDefault}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
      <style>{KEYFRAMES}</style>
    </div>
  );
}

export default Modal;
