/**
 * Tooltip — Atoms / Tooltip (Figma nIMtO7v8dDamI8b2vnMcRc, node 462:49 "bottom",
 * 1305:32925 "left"). Verified with get_design_context 2026-09.
 *
 * DS spec, read off 462:49:
 *   Bubble  — bg action/secondary/default #1F2937 · padding 6px 10px · radius 4
 *   Label   — Caption/Small (Inter Regular 11/16) in #FFFFFF, single line
 *   Arrow   — 7×7 square rotated 45°, same fill, centred on the bubble edge
 *   Height  — 28
 *
 * Usage rules (Principles 10:2 › Affichage & statut › Tooltip 1106:332):
 *   · Short explanation, MAX ONE LINE, on an element with no visible label.
 *   · MANDATORY on every IconButton.
 *   · Never on an element that already carries an explicit label.
 *   · Never put interactive content (links, buttons) inside one.
 *
 * The DS ships bottom and left placements only — `placement` is limited to those.
 * "bottom" is the DS name for the variant whose arrow sits at the bottom of the
 * bubble, i.e. the bubble floats ABOVE its trigger (see the Figma render).
 */
import React from 'react';
import { createPortal } from 'react-dom';
import { DS, TY } from '../utils/designSystem';

const BUBBLE_BG = DS.actionSecondaryDefault; // #1F2937

export function Tooltip({ label, placement = 'bottom', children, disabled = false }) {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const ref = React.useRef(null);
  const show = open && !disabled && !!label && !!rect;

  // The bubble renders in a PORTAL, positioned against the trigger. Anchored
  // inside the wrapper it was clipped by any ancestor with overflow: hidden —
  // the Table shell, a modal body, a menu panel — which is most of the places a
  // tooltip is mandatory. Fixed coordinates escape all of them.
  const place = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  };

  const bubble = {
    position: 'fixed',
    zIndex: 10000,
    background: BUBBLE_BG,
    borderRadius: DS.radiusMd ?? 4,
    padding: '6px 10px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    ...TY.captionSm,
    fontFamily: DS.ff,
    color: DS.textInverse,
    textAlign: 'left',
    ...(rect && (placement === 'left'
      ? { top: rect.top + rect.height / 2, left: rect.left - 9, transform: 'translate(-100%, -50%)' }
      : { top: rect.top - 9, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' })),
  };

  // 7px square rotated 45° — the DS arrow, not a CSS border triangle.
  const arrow = {
    position: 'absolute',
    width: 7,
    height: 7,
    background: BUBBLE_BG,
    ...(placement === 'left'
      ? { left: '100%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }
      : { top: '100%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }),
  };

  return (
    <span
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => { place(); setOpen(true); }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => { place(); setOpen(true); }}
      onBlur={() => setOpen(false)}
    >
      {children}
      {show && createPortal(
        <span role="tooltip" style={bubble}>
          {label}
          <span style={arrow} />
        </span>,
        document.body,
      )}
    </span>
  );
}

export default Tooltip;
