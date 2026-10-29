/**
 * AX Prototypes — Placeholder
 *
 * The canonical "this component doesn't exist yet" box. Renders a dashed outline
 * labelled with the component's name and its Figma node, so a missing piece is
 * VISIBLE in the running prototype instead of being silently invented or skipped.
 *
 * Use it only after asking the PM which they want for a missing component:
 *   (a) build it now, or (b) leave a placeholder.
 * See design-prototypes §0.6 — never choose on the PM's behalf.
 *
 *   <Placeholder name="Molecules / CarouselDots" node="1973:6506"
 *                note="in the DS, not in code" height={40} />
 *   <Placeholder name="Maps / Full Map" height={232}
 *                note="not on any DS component page" />
 *
 * Props:
 *   name    string  — the DS component name, e.g. "Molecules / Tab"
 *   node    string  — Figma node id, when the component exists in the DS
 *   note    string  — why it's missing, or what it should contain
 *   height  number  — box height (default 80). Match the real component's height
 *                     so the surrounding layout reads correctly.
 *   width   number|string — optional; defaults to filling its container
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';

export function Placeholder({ name, node, note, height = 80, width, style: styleProp }) {
  return (
    <div
      role="presentation"
      style={{
        height,
        width: width ?? '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        padding: 12,
        border: `1px dashed ${DS.borderStrong}`,
        borderRadius: DS.radiusLg,
        background: DS.surfaceSubtle,
        ...styleProp,
      }}
    >
      {name && (
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{name}</span>
      )}
      {node && (
        <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{node}</span>
      )}
      {note && (
        <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{note}</span>
      )}
    </div>
  );
}

export default Placeholder;
