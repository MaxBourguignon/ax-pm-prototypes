/**
 * AX Design System — KPI Card
 *
 * Figma Molecules/KPI Card (component set 2006:6803), read with
 * get_design_context on the usage board 1887:33 (2026-09):
 *   Type=Stat      1885:6214 · 260 × 128
 *   Type=Donut     2006:6801 · 351 × 200
 *   Type=Progress  2006:6802 · 480 × 226
 *   https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=1887-33
 *
 * Figma description: "Card de métrique polyvalente. Type=Stat (chiffre clé +
 * delta), Type=Donut (répartition en camembert), Type=Progress (barres de
 * progression)." — pick the type by data shape: a single number with its
 * variation · a breakdown into categories · values against a target.
 *
 * Shared shell (all three types)
 *   surfaceCanvas · 6px left rail carrying the brand gradient (violet → magenta,
 *   top to bottom) · shadow/md · overflow hidden
 * Type=Stat      padding 20 · gap 8 · radius 12
 *   label   Label/Medium (12/16/500) text/secondary
 *   value   Headline/Large (28/36/600) brand/on-surface
 *   delta   6px gap: arrow Body/Medium/Bold in mint/400, text Label/Medium text/secondary
 * Type=Donut     padding 20px 40px · gap 24 · radius 8
 *   label   Label/Medium uppercase text/secondary
 *   chart   120px donut + breakdown rows (6px dot · label 14/20/400 text/secondary
 *           · value Body/Medium/Bold text/strong) + 11px text/muted note
 *   centre  value 11px text/strong over an 11px text/muted caption
 * Type=Progress  padding 20px 40px · gap 16 · radius 8
 *   header  label Label/Medium uppercase text/secondary + right meta captionSm text/muted
 *   value   Title/Medium (18/24/600) text/strong
 *   rows    gap 12 · label row (14/20/400 secondary ↔ Body/Medium/Bold strong)
           — rendered at the 12px step here, see the density note on the shell
 *           over a 4px pill track: surfaceMuted, fill brand/primary
 *           (tone="muted" fills with text/muted — the DS uses it for a row that
 *           is a count rather than a rate)
 *
 * ⚠ Deviations from the DS, flagged rather than silently resolved:
 *   1. RADIUS — the DS gives Stat radius 12 and Donut/Progress radius/lg 8. Kept
 *      as specced (per type), but it looks like a DS inconsistency: raise it.
 *   2. `icon` / `accent` — NOT in the DS, which has no icon slot and paints the
 *      Stat value with brand/on-surface. Both props are kept because five
 *      existing pages pass them; omit them for DS-exact rendering.
 *   3. SIZE — the DS types are fixed-size. The card here is fluid (flex 1 with a
 *      min height per type) so existing KPI strips keep laying out.
 *   4. A NEGATIVE delta has no DS variant. `trend="down"` renders the arrow in
 *      feedbackDanger; `trend="flat"` drops the arrow.
 *   5. The donut arcs are drawn from the data, not from the exported Figma SVGs —
 *      those encode one fixed dataset (€240 / €70) and would not follow `segments`.
 *
 * Usage
 *   <KpiCard label="Contacts" value="12 458" delta="+5.2% vs last week" trend="up" />
 *
 *   <KpiCard type="donut" label="Spending" total="€ 310.00" totalLabel="total"
 *            segments={[{ label: 'Tickets', value: 240, display: '€ 240.00' },
 *                       { label: 'Other',   value: 70,  display: '€ 70.00' }]}
 *            note="5 purchases · 5 events" />
 *
 *   <KpiCard type="progress" label="Engagement" value="60%" meta="3 / 5 opened"
 *            rows={[{ label: 'Open rate', value: '60%', pct: 60 },
 *                   { label: 'Campaigns sent', value: 5, pct: 8, tone: 'muted' }]} />
 *
 * Props
 *   type       'stat' | 'donut' | 'progress' | 'funnel'            default 'stat'
 *              ('funnel' is NOT a DS type — see the note above FunnelBody)
 *   label      string  (alias: title)
 *   value      node
 *   loading    bool — type-shaped skeleton
 *   style      style overrides on the card shell
 *   — stat      delta (string) · trend 'up'|'down'|'flat' · sub/subColor (legacy
 *               delta text, no arrow) · icon · accent (value colour)
 *   — donut     segments [{ label, value, display?, color? }] · total · totalLabel · note
 *   — funnel    meta · stages [{ label, value }] — bars centred, widths relative
 *               to the largest stage
 *   — progress  meta (right of the label) · rows [{ label, value, pct, tone }]
 *               `value` is the headline figure and is OPTIONAL here (the DS
 *               always shows one); omit it when the rows already say it
 */
import React from 'react';
import { DS, TY } from '../utils/designSystem';
import Skeleton from './Skeleton';

/* Progress and Funnel rows share one pitch so two cards standing side by side
   rule up together: 26px of content (a 16px label line + 6px + the 4px track)
   plus the 10px gap between rows. A funnel bar is 20px, centred in the same 26. */
const ROW_H = 26;
const ROW_GAP = 10;

/* Categorical segment palette — DS primitives, in the order the DS donut uses
   them (brand blue first, orange second). */
const SEGMENT_COLORS = [DS.brandPrimary, DS.orange400, DS.teal500, DS.purple400, DS.pink700];

const SHELL = {
  position: 'relative',
  background: DS.surfaceCanvas,
  boxShadow: DS.shadowMd,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

/* The 6px brand rail on the left edge. Drawn as an absolute strip rather than a
   border so it can carry the gradient. */
function Rail() {
  return <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: DS.gradientBrandV }} />;
}

/* Label/Medium, uppercase on the Donut and Progress types. */
function CardLabel({ children, upper = false }) {
  return (
    <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary,
                   textTransform: upper ? 'uppercase' : 'none', letterSpacing: upper ? '0.04em' : 0 }}>
      {children}
    </span>
  );
}

/* ── Type=Stat ─────────────────────────────────────────────────────────────── */
function StatBody({ label, value, delta, trend, sub, subColor, icon, accent, loading }) {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : null;
  const arrowColor = trend === 'down' ? DS.feedbackDanger : DS.mint400;
  const footer = delta ?? sub;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
        <CardLabel>{label}</CardLabel>
        {/* Local extension — the DS Stat has no icon slot (deviation 2). */}
        {icon && (
          <span style={{ width: 28, height: 28, borderRadius: DS.radiusMd, background: DS.bgIcons,
                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icon}
          </span>
        )}
      </div>
      {loading ? <Skeleton w={120} h={28} /> : (
        <>
          <span style={{ ...TY.headlineLg, fontFamily: DS.ff, color: accent ?? DS.brandOnSurface }}>{value}</span>
          {footer != null && footer !== '' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {delta != null && arrow && (
                <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: arrowColor }}>{arrow}</span>
              )}
              <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: subColor ?? DS.textSecondary }}>{footer}</span>
            </span>
          )}
        </>
      )}
    </>
  );
}

/* ── Type=Donut ────────────────────────────────────────────────────────────── */
/* 120/18 in the DS; stepped down with the card padding (see the density note
   on the shell) so the chart keeps its proportions inside a tighter box. */
const DONUT_SIZE = 104, DONUT_SW = 16;

function Donut({ segments, total, totalLabel }) {
  const R = DONUT_SIZE / 2 - DONUT_SW / 2;
  const C = DONUT_SIZE / 2;
  const circ = 2 * Math.PI * R;
  const sum = segments.reduce((s, x) => s + (x.value || 0), 0);
  let acc = 0;
  return (
    <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle cx={C} cy={C} r={R} fill="none" stroke={DS.surfaceSubtle} strokeWidth={DONUT_SW} />
      {sum > 0 && segments.map((sgm, i) => {
        const frac = (sgm.value || 0) / sum;
        const dash = frac * circ;
        const off = acc * circ;
        acc += frac;
        return (
          <circle key={sgm.label ?? i} cx={C} cy={C} r={R} fill="none"
                  stroke={sgm.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                  strokeWidth={DONUT_SW} strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-off} transform={`rotate(-90 ${C} ${C})`} strokeLinecap="butt" />
        );
      })}
      {/* TotalLabel — two 11px lines, centred */}
      <text x={C} y={C - 1} textAnchor="middle" fontFamily={DS.ff} style={{ ...TY.captionSm }} fill={DS.textStrong}>{total}</text>
      <text x={C} y={C + 14} textAnchor="middle" fontFamily={DS.ff} style={{ ...TY.captionSm }} fill={DS.textMuted}>{totalLabel}</text>
    </svg>
  );
}

function DonutBody({ label, segments, total, totalLabel, note, loading }) {
  if (loading) {
    return (
      <>
        <CardLabel upper>{label}</CardLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Skeleton w={DONUT_SIZE} h={DONUT_SIZE} r={DONUT_SIZE / 2} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton w={140} h={14} /><Skeleton w={120} h={14} /><Skeleton w={100} h={11} />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <CardLabel upper>{label}</CardLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Donut segments={segments} total={total} totalLabel={totalLabel} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          {segments.map((sgm, i) => (
            <div key={sgm.label ?? i} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                             background: sgm.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
              <span style={{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textSecondary,
                             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sgm.label}</span>
              <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>
                {sgm.display ?? sgm.value}
              </span>
            </div>
          ))}
          {note && <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{note}</span>}
        </div>
      </div>
    </>
  );
}

/* ── Type=Progress ─────────────────────────────────────────────────────────── */
function ProgressRow({ label, value, pct, tone }) {
  const width = Math.max(0, Math.min(100, pct ?? 0));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', height: ROW_H, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
        <span style={{ ...TY.labelMd, fontWeight: TY.weightSemiBold, fontFamily: DS.ff, color: DS.textStrong }}>{value}</span>
      </div>
      <div style={{ height: 4, width: '100%', borderRadius: DS.radiusPill, background: DS.surfaceMuted, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, borderRadius: DS.radiusPill,
                      background: tone === 'muted' ? DS.textMuted : DS.brandPrimary, transition: 'width .3s' }} />
      </div>
    </div>
  );
}

function ProgressBody({ label, value, meta, rows, loading }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <CardLabel upper>{label}</CardLabel>
        {meta && <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{meta}</span>}
      </div>
      {/* The DS Progress card always carries a headline figure. It is optional
          here: when every row already states its own number, the headline only
          repeats one of them. Omit `value` to drop it. */}
      {value != null && (loading
        ? <Skeleton w={80} h={24} />
        : <span style={{ ...TY.titleMd, fontFamily: DS.ff, color: DS.textStrong }}>{value}</span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP, width: '100%' }}>
        {loading
          ? [0, 1, 2].map((i) => <Skeleton key={i} w="100%" h={20} />)
          : rows.map((r, i) => <ProgressRow key={r.label ?? i} {...r} />)}
      </div>
    </>
  );
}

/* ── Type=Funnel — NOT IN THE DS ─────────────────────────────────────────────
   There is no funnel anywhere in the Figma file, so this is a BUILD-CUSTOM
   fourth type with no design authority behind it. It exists because a nested
   sequence (sent ⊇ received ⊇ opened ⊇ clicked) is a funnel by nature: bars
   centred on one axis make the drop-off the shape of the chart, which three
   equal-length progress tracks cannot show.

   Everything it is built from IS on-system: the card shell, the type scale, and
   a blue ramp stepping brand/primary → blue/500 → blue/300 → blue/200. The
   lower two steps are too light to carry white, so their count flips to
   text/strong. Flag it if the DS ever specs a funnel. */
const FUNNEL_STEPS = [
  { fill: DS.brandPrimary, ink: DS.textOnBrand },
  { fill: DS.blue500,      ink: DS.textOnBrand },
  { fill: DS.blue300,      ink: DS.textStrong  },
  { fill: DS.blue200,      ink: DS.textStrong  },
];

function FunnelBody({ label, meta, stages, loading }) {
  const top = stages.reduce((m, s) => Math.max(m, s.value || 0), 0) || 1;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <CardLabel upper>{label}</CardLabel>
        {meta && <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{meta}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP, width: '100%' }}>
        {stages.map((stage, i) => {
          const step = FUNNEL_STEPS[i % FUNNEL_STEPS.length];
          // Floored so a zero stage still reads as a stage rather than vanishing.
          const width = Math.max(6, ((stage.value || 0) / top) * 100);
          const share = Math.round(((stage.value || 0) / top) * 100);
          return (
            <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: 10, height: ROW_H, boxSizing: 'border-box' }}>
              <span style={{ width: 68, flexShrink: 0, ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>
                {stage.label}
              </span>
              <div style={{ flex: '1 0 0', minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                {loading ? <Skeleton w="100%" h={20} /> : (
                  <div style={{
                    width: `${width}%`, height: 20, borderRadius: DS.radiusMd, background: step.fill,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: `width ${DS.durBase} ${DS.ease}`,
                  }}>
                    <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: step.ink }}>{stage.value}</span>
                  </div>
                )}
              </div>
              <span style={{ width: 36, flexShrink: 0, textAlign: 'right', ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong }}>
                {share}%
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
export function KpiCard({
  type = 'stat',
  title, label,
  value,
  delta, trend = 'up',
  sub, subColor,
  icon, accent,
  segments = [], total, totalLabel = 'total', note,
  meta, rows = [],
  stages = [],
  loading = false,
  style,
}) {
  const heading = label ?? title;
  const isStat = type === 'stat';

  return (
    <div style={{
      ...SHELL,
      flex: '1 1 200px',
      minWidth: isStat ? 200 : 240,
      minHeight: isStat ? 112 : undefined,
      borderRadius: isStat ? DS.radiusXl : DS.radiusLg,
      // DENSITY DEVIATION: the DS boxes are 20px/40px with a 24px gap on Donut
      // and 16px on Progress, which reads as a lot of air on a record page where
      // two cards sit side by side. Tightened one step; the type scale is
      // untouched, so only the whitespace changed.
      padding: isStat ? '16px 16px 16px 22px' : '16px 24px 16px 30px',
      gap: isStat ? 6 : type === 'donut' ? 16 : 12,
      ...style,
    }}>
      <Rail />
      {type === 'donut' ? (
        <DonutBody label={heading} segments={segments} total={total} totalLabel={totalLabel} note={note} loading={loading} />
      ) : type === 'progress' ? (
        <ProgressBody label={heading} value={value} meta={meta} rows={rows} loading={loading} />
      ) : type === 'funnel' ? (
        <FunnelBody label={heading} meta={meta} stages={stages} loading={loading} />
      ) : (
        <StatBody label={heading} value={value} delta={delta} trend={trend} sub={sub} subColor={subColor}
                  icon={icon} accent={accent} loading={loading} />
      )}
    </div>
  );
}

export default KpiCard;
