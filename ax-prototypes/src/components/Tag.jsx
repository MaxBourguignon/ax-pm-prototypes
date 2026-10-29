/**
 * AX Design System — Tag & Badge components
 * Figma: Atoms › Chip 556:2973 · Badge 523:73 · StatusChip 524:80 · Avatar 47:8
 * https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/AX-DESIGN-SYSTEM?node-id=523-73
 *
 * ⚠ The new DS splits these into four distinct atoms (Chip, Badge, StatusChip,
 *   Avatar) where this file merges them. Avatar also gains an XL (64px) size.
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

/**
 * Avatar — Figma Atoms/Avatar (47:8). DS sizes: Sm 24 · Md 32 · Lg 40 · XL 64.
 * Initials are auto-computed from the full name (pass the whole name, per the
 * Principles page).
 *
 *   tone="palette"  (default) — name-derived pastel, the historical behaviour
 *   tone="brand"    — solid brand/primary with white initials, as the DS
 *                     PageHeader Contact type specifies
 */
export function Avatar({ name = '', size = 32, tone = 'palette' }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palette = AVATAR_PALETTE[(name.charCodeAt(0) || 0) % 4];
  const brand = tone === 'brand';
  // XL carries Headline/Medium initials in Figma; smaller sizes stay compact.
  const typo = size >= 64 ? TY.headlineMd : size >= 40 ? TY.labelLg : TY.b3;

  return (
    <span
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        flexShrink:     0,
        background:     brand ? DS.brandPrimary : palette.bg,
        color:          brand ? DS.textOnBrand : palette.fg,
        fontFamily:     DS.ff,
        ...typo,
        fontWeight:     brand && size >= 64 ? TY.weightBold : TY.weightSemiBold,
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}
    >
      {initials || '?'}
    </span>
  );
}

// ─── Badge (DS Atoms/Badge 523:73) ────────────────────────────────────────────
/**
 * Non-interactive categorical label. DS Atoms/Badge, Kind=Subtle, 5 colours
 * (523:63/65/67/69/71). Verified via get_design_context 2026-09:
 *   px 8 / py 2 · radius 999 · Label/Medium (12/16/500)
 *
 * Per the Principles page: Badge is a free-form label and must NEVER be a button
 * or link. For a business status use StatusBadge; for a clickable filter use Chip.
 */
const BADGE_TONES = {
  primary: { bg: DS.brandPrimarySubtle,  fg: DS.brandOnSurface   },
  accent:  { bg: DS.feedbackInfoSubtle,  fg: DS.feedbackInfo     },
  success: { bg: DS.feedbackSuccessBg,   fg: DS.feedbackSuccess  },
  warning: { bg: DS.feedbackWarningBg,   fg: DS.feedbackWarning  },
  danger:  { bg: DS.feedbackErrorBg,     fg: DS.feedbackDanger   },
  // ⚠ LOCAL EXTENSION — the DS Badge (523:73) ships five tones, all of them
  // either brand or feedback. A neutral one is needed for a label that
  // qualifies without signalling anything (e.g. a list's "Manual import" type);
  // painting it with a feedback tone would read as a state it isn't.
  neutral: { bg: DS.surfaceSubtle,       fg: DS.textSecondary    },
};

export function Badge({ children, tone = 'primary' }) {
  const t = BADGE_TONES[tone] ?? BADGE_TONES.primary;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: DS.radiusPill,
        background: t.bg,
        ...TY.labelMd,
        fontFamily: DS.ff,
        color: t.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

// ─── RemovableChip (DS Atoms/Chip 556:2973) ───────────────────────────────────
/**
 * The DS's `Atoms/Chip`. Re-read 2026-09 from the contact record screen
 * (2476:40567), where the rail's list memberships are built from it:
 *   h 28 · pl 8 / pr 6 / py 4 · gap 4 · radius 8
 *   default   bg feedback/info-subtle #EFF4FF · border 1px border/field #CBD5E1
 *             label Label/Medium in text/strong
 *   removable bg slate/300 #CBD5E1 · border 1px border/default · 12px cross
 *
 * ⚠ Two divergences from the standalone component, which specs radius 6, a
 *   surface/subtle fill and a border/default outline. The screen wins here
 *   because it is the usage the record is being built to — worth reconciling
 *   with the designer, since one of the two is stale.
 * Removable state, re-read off `Atoms / Chip` 1477:3189 (the chip as the
 * add-to-list modal uses it) 2026-09:
 *   fill surface/subtle #F4F5F5 · 1px border/default · radius 8
 *   padding 4px 6px 4px 8px · gap 4
 *   label Label/Medium (12/16/500) in text/default · 12px cross
 * The fill was slate/300 #CBD5E1 here before, which read as a much heavier
 * object than the node draws; the height was pinned to 28 where the node's own
 * padding computes 26.
 *
 * A removable chip wears its removable state ALWAYS, not on hover: whether a
 * membership can be taken off is a property of the list, not something to go
 * hunting for with a pointer. So the slate fill and the cross are permanent, and
 * a read-only chip is plainly a different-looking object.
 *
 * ⚠ Naming: `components/Chip.jsx` also exports `Chip`, but that one is the
 *   pre-DS *toggle* filter pill (blue/white, radius 10, no remove) — a different
 *   component with different semantics. The DS's Chip is this one. The two need
 *   reconciling; until then use RemovableChip when following the DS.
 */
export function RemovableChip({ children, onRemove }) {
  const [hovered, setHovered] = React.useState(false);
  const removable = !!onRemove;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: removable ? '4px 6px 4px 8px' : '4px 8px',
        boxSizing: 'border-box',
        borderRadius: DS.radiusLg,
        background: removable ? DS.surfaceSubtle : DS.feedbackInfoSubtle,
        border: `1px solid ${removable ? DS.borderDefault : DS.borderField}`,
        ...TY.labelMd,
        fontFamily: DS.ff,
        color: DS.textStrong,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        transition: `background ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 12, height: 12, padding: 0, flexShrink: 0,
            border: 'none', background: 'transparent', cursor: 'pointer',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Ico.Cross s={12} c={hovered ? DS.actionDanger : DS.textStrong} />
        </button>
      )}
    </span>
  );
}

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
/* ──────────────────────────────────────────────────────────────────────────────
 * StatusChip — Atoms / StatusChip (Figma node 524:80). Verified with
 * get_design_context 2026-09.
 *
 * DS spec: transparent pill, padding 4px 10px, radius 999, gap 6, h 24.
 *   6px round dot + Label/Medium (Inter Medium 12/16), dot and label share the
 *   colour. Four statuses, each with its own token pair:
 *     Active   dot+text feedback/success  #16A34A
 *     Pending  dot+text feedback/warning  #FE9D55
 *     Inactive dot text/muted #9A9EA5 · label text/secondary #3E4E65
 *     Archived dot+text feedback/danger   #DC2626
 *
 * Usage rule (Principles 10:2): StatusChip carries a CONTROLLED business state
 * from the data model — never an ad-hoc label. For a free-form label use `Badge`;
 * for a clickable filter use `Chip`. This is deliberately distinct from the
 * pre-DS `StatusBadge` above, which is kept for existing call sites.
 *
 * `children` overrides the default French label so callers can supply their own
 * copy (prototype copy is English) while keeping the DS status tones.
 * ────────────────────────────────────────────────────────────────────────────── */
const STATUS_CHIP = {
  active:   { dot: DS.feedbackSuccess, text: DS.feedbackSuccess, label: 'Active'   },
  pending:  { dot: DS.feedbackWarning, text: DS.feedbackWarning, label: 'Pending'  },
  inactive: { dot: DS.textMuted,       text: DS.textSecondary,   label: 'Inactive' },
  archived: { dot: DS.feedbackDanger,  text: DS.feedbackDanger,  label: 'Archived' },
};

export function StatusChip({ status = 'active', children }) {
  const s = STATUS_CHIP[status] ?? STATUS_CHIP.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      ...TY.labelMd, fontFamily: DS.ff, color: s.text,
      whiteSpace: 'nowrap', textAlign: 'left',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      {children ?? s.label}
    </span>
  );
}
