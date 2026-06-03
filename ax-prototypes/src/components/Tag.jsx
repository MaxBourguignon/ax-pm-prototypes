/**
 * AX Design System — Tag & Badge components
 * Figma nodes: 196:1978 (Tags), 4.5 (Status badges)
 * https://www.figma.com/design/NUOoC3GC7mB4U1AydRKIoy/AX-DESIGN-SYSTEM--NEW-?node-id=196-1978
 *
 * Exports:
 *   Tag          — filter chip, two DS variants: "unselected" | "active" (removable)
 *   StatusBadge  — inline status pill with coloured dot, four states
 *   Avatar       — initials circle, DS §4.6 colour logic
 *   IconBadge    — square icon container, DS §4.7
 *
 * ── Tag ─────────────────────────────────────────────────────────────
 *   Unselected: bg blue100, border blue600, text blue600
 *   Active:     bg teal500, no border, text textInverse + Cross icon
 *   Both use borderRadius 10, padding '4px 8px', TY.b3
 *
 * ── StatusBadge ─────────────────────────────────────────────────────
 *   status: "success" | "warning" | "error" | "inactive" | "info"
 *   borderRadius 999, padding '3px 10px', TY.b3, fontWeight 500, 6×6 dot
 *
 * ── Avatar ──────────────────────────────────────────────────────────
 *   DS §4.6: colour by name.charCodeAt(0) % 4
 *   0 → blue100/actionPrimary  1 → feedbackSuccessBg/feedbackSuccess
 *   2 → feedbackWarningBg/feedbackWarning  3 → purpleLight/purple
 *
 * ── IconBadge ───────────────────────────────────────────────────────
 *   DS §4.7: bg blue100, borderRadius 6, padding 10
 *   size "Medium" → width 40 | size "Small" → 28×28, centred
 *
 * Usage:
 *   <Tag>Newsletter</Tag>
 *   <Tag variant="active" onRemove={() => …}>SMS</Tag>
 *   <StatusBadge status="success">Actif</StatusBadge>
 *   <Avatar name="Marie Blanc" size={32} />
 *   <IconBadge icon={<Ico.Campaigns s={20} c={DS.actionPrimary} />} />
 */

import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Ico from '../utils/icons';

// ─── Tag ─────────────────────────────────────────────────────────────────────
const TAG_STYLES = {
  unselected: {
    background: DS.blue100,
    border:     `1px solid ${DS.blue600}`,
    color:      DS.blue600,
  },
  active: {
    background: DS.teal500,
    border:     'none',
    color:      DS.textInverse,
  },
  // Feedback variants — for use as status chips (full triad §8)
  success: { background: DS.feedbackSuccessBg, border: `1px solid ${DS.feedbackSuccess}`, color: DS.feedbackSuccess },
  warning: { background: DS.feedbackWarningBg, border: `1px solid ${DS.feedbackWarning}`, color: DS.feedbackWarning },
  error:   { background: DS.feedbackErrorBg,   border: `1px solid ${DS.feedbackError}`,   color: DS.feedbackError   },
  info:    { background: DS.feedbackInfoBg,    border: `1px solid ${DS.feedbackInfo}`,    color: DS.feedbackInfo    },
  muted:   { background: DS.bgSurface,         border: `1px solid ${DS.borderDefault}`,   color: DS.textSecondary   },
};

export function Tag({ children, variant = 'unselected', onRemove }) {
  const s = TAG_STYLES[variant] ?? TAG_STYLES.unselected;
  const isActive = variant === 'active';

  return (
    <span
      style={{
        ...s,
        borderRadius:   10,
        padding:        '4px 8px',
        fontFamily:     DS.ff,
        ...TY.b3,
        display:        'inline-flex',
        alignItems:     'center',
        gap:            isActive ? 6 : 0,
        height:         24,
        boxSizing:      'border-box',
        whiteSpace:     'nowrap',
      }}
    >
      {children}

      {/* Remove button — active variant only */}
      {isActive && onRemove && (
        <span
          role="button"
          aria-label="Retirer"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ display: 'inline-flex', cursor: 'pointer', opacity: 0.85, lineHeight: 0 }}
        >
          <Ico.CrossSm s={10} c={DS.textInverse} />
        </span>
      )}
    </span>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
// Inline pill: coloured dot + label. DS §4.5
const STATUS_STYLES = {
  success:  { bg: DS.feedbackSuccessBg, fg: DS.feedbackSuccess },
  warning:  { bg: DS.feedbackWarningBg, fg: DS.feedbackWarning },
  error:    { bg: DS.feedbackErrorBg,   fg: DS.feedbackError   },
  inactive: { bg: DS.bgSurface,         fg: DS.textSecondary   },
  info:     { bg: DS.feedbackInfoBg,    fg: DS.feedbackInfo    },
};

export function StatusBadge({ status = 'inactive', children }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        background:     s.bg,
        color:          s.fg,
        borderRadius:   999,
        padding:        '3px 10px',
        fontFamily:     DS.ff,
        ...TY.b3,
        fontWeight:     500,
        whiteSpace:     'nowrap',
      }}
    >
      {/* 6×6 dot */}
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg, flexShrink: 0 }} />
      {children}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
// DS §4.6: charCodeAt(0) % 4 determines palette
const AVATAR_PALETTE = [
  { bg: DS.blue100,          fg: DS.actionPrimary    }, // 0
  { bg: DS.feedbackSuccessBg, fg: DS.feedbackSuccess  }, // 1
  { bg: DS.feedbackWarningBg, fg: DS.feedbackWarning  }, // 2
  { bg: DS.purpleLight,       fg: DS.purple           }, // 3
];

export function Avatar({ name = '', size = 32 }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palette = AVATAR_PALETTE[(name.charCodeAt(0) || 0) % 4];

  return (
    <span
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        flexShrink:     0,
        background:     palette.bg,
        color:          palette.fg,
        fontFamily:     DS.ff,
        ...TY.b3,
        fontWeight:     TY.weightSemiBold,
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      {initials || '?'}
    </span>
  );
}

// ─── IconBadge ────────────────────────────────────────────────────────────────
// DS §4.7: square badge, blue100 bg, borderRadius 6, padding 10
// Medium: width 40  |  Small: 28×28, centred
export function IconBadge({ icon, size = 'Medium' }) {
  const isSmall = size === 'Small';
  return (
    <div
      style={{
        background:     DS.blue100,
        borderRadius:   6,
        padding:        10,
        width:          isSmall ? 28 : 40,
        height:         isSmall ? 28 : undefined,
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: isSmall ? 'center' : 'flex-start',
      }}
    >
      {icon}
    </div>
  );
}