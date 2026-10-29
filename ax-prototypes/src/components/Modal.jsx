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
 *   subtitle  string                  optional line under the title (white)
 *   children  body content (scrolls)
 *   footer    node | null             rendered in a bordered footer band
 *   variant   "panel" | "center"      default "panel"
 *   size      "sm" | "md" | "lg"      centre modals only, default "md"
 *   width     number                  explicit override, wins over `size`
 *   headerContent node | null          rendered inside the gradient header, below the title row (e.g. tabs)
 *   headerActions node | null          rendered in the title row, just before the close button (e.g. icon buttons)
 *   headerLeading node | null          rendered before the title (e.g. a back chevron + icon tile)
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

/* The official modal header (Modals / HeaderModal): Gradient/Brand band, bold
   white title, optional white subtitle under it, and an unframed close cross
   (background on hover only). Exported so popover panels that act as small dialogs
   (column configuration, view picker) wear the same header. */
export function ModalHeader({ title, subtitle, onClose, headerContent, headerActions, headerLeading, compact = false }) {
  // `compact` — the same header scaled for small popover panels: tighter
  // padding, 16px title, 12px subtitle, 28px close.
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{
      flexShrink: 0,
      // DS paint style `Gradient/Brand` (blue/550 → blue/300), verified on the
      // modal header at 1477:3168. Was the legacy gradientBlueV (blue→teal).
      background: DS.gradientBrand,
      padding: headerContent ? '20px 20px 0' : compact ? '12px 14px' : 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: subtitle ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {headerLeading}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ ...(compact ? TY.bodyMdBold : TY.h3), ...(compact ? { fontSize: 16, lineHeight: '22px' } : {}), fontWeight: 700, color: DS.textInverse, fontFamily: DS.ff, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ ...(compact ? TY.labelMd : TY.bodySm), fontWeight: 400, color: 'rgba(255,255,255,0.92)', fontFamily: DS.ff }}>{subtitle}</span>
          )}
        </div>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {headerActions}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              width: compact ? 28 : 36, height: compact ? 28 : 36, flexShrink: 0, borderRadius: compact ? 6 : DS.radiusLg, cursor: 'pointer',
              boxSizing: 'border-box', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // No frame at rest — the cross alone; a white wash on hover only.
              background: hov ? 'rgba(255,255,255,0.2)' : 'transparent', transition: 'background .15s',
            }}
          >
            <Ico.Cross s={compact ? 16 : 20} c={DS.textInverse} />
          </button>
        </div>
      </div>
      {headerContent}
    </div>
  );
}

/* Centre-modal width ladder. The app had grown twelve different widths by hand
   (420 · 460 · 520 · 540 · 560 · 620 · 665 · 780 · 1280), so two dialogs doing
   the same job rarely measured the same. Three steps instead, each a notch
   wider than what it replaces:
     sm  confirmations and single-field dialogs
     md  forms and action modals — the default
     lg  content-heavy: pickers, comparisons, anything two-column
   The DS documents a 480 base and a 560 widest composition (1223:3646); `lg` has
   no DS precedent and is ours. `width` still wins, for the rare outlier. */
const CENTER_W = { sm: 480, md: 600, lg: 720 };

/* Open modals, bottom to top. A dialog opened over a drawer (e.g. "Discard
   changes?") is the top one: only it reacts to Escape, and it lays a lighter
   scrim so the screen doesn't darken twice. */
const STACK = [];

export function Modal({ open, onClose, title, subtitle, children, footer, variant = 'panel', size = 'md', width, headerContent, headerActions, headerLeading }) {
  // Click-out: only a press that STARTS and ENDS on the scrim closes. A text
  // selection or a drag that begins inside the modal and is released over the
  // scrim no longer dismisses it (and loses what was typed). Escape closes the
  // top-most modal only.
  const downOnScrim = React.useRef(false);
  const [layer] = React.useState(() => ({}));
  const [depth, setDepth] = React.useState(0);
  const closeRef = React.useRef(onClose);
  React.useEffect(() => { closeRef.current = onClose; });
  React.useEffect(() => {
    if (!open) return undefined;
    STACK.push(layer);
    setDepth(STACK.length - 1);
    const k = (e) => {
      if (e.key !== 'Escape' || STACK[STACK.length - 1] !== layer) return;
      e.stopPropagation();
      closeRef.current?.();
    };
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('keydown', k);
      const i = STACK.indexOf(layer);
      if (i >= 0) STACK.splice(i, 1);
    };
  }, [open, layer]);

  if (!open) return null;
  const isCenter = variant === 'center';
  const w = width || (isCenter ? (CENTER_W[size] ?? CENTER_W.md) : 440);

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
    <div style={{ position: 'fixed', inset: 0, zIndex: 60 + depth, display: isCenter ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center' }}>
      <div
        onMouseDown={(e) => { downOnScrim.current = e.target === e.currentTarget; }}
        onClick={(e) => { if (downOnScrim.current && e.target === e.currentTarget) onClose?.(); downOnScrim.current = false; }}
        style={{ position: 'absolute', inset: 0, background: depth > 0 ? 'rgba(31,41,55,0.2)' : 'rgba(31,41,55,0.45)', animation: 'axModalFade .15s ease' }}
      />
      <div style={surface}>
        <ModalHeader title={title} subtitle={subtitle} onClose={onClose} headerContent={headerContent} headerActions={headerActions} headerLeading={headerLeading} />
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
