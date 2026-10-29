/**
 * Overview — Contacts module
 * PAGE ONLY — renders inside the app shell. Design system is IMPORTED.
 *
 * Same content as the current production Overview, re-skinned on the new UI —
 * no widget added or removed:
 *   header        Time T-1 · Time T · export image · filter population
 *   row 1–2       Communities of engagement (industry vs base, diverging bars)
 *                 Communities history · Performances · Completion rate · Use case
 *   row 3–4       Age distribution · Recency distribution · Average cart · Geomarketing
 *
 * What changed is only the components: DS PageHeader, DS section shell
 * (borderSection · radius 12 · shadowSm · titleMd + labelMd description), DS
 * Tooltip on the info icons, DS IconBtn / Btn, recharts styled with DS tokens,
 * and a DS table for Performances.
 *
 * ⚠ Geomarketing is a Placeholder — there is no map component in the code yet
 *   (PM call: build it or keep the placeholder).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, LabelList, Cell,
} from 'recharts';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import IconBtn from '../../components/Iconbtn';
import PageHeader from '../../components/PageHeader';
import Tooltip from '../../components/Tooltip';
import Placeholder from '../../components/Placeholder';
import Toast from '../../components/Toast';
import StatePreview from '../../components/StatePreview';

/* ════════════════════════════ Data (as on production) ════════════════════════════ */

const nf = new Intl.NumberFormat('en-US');

/* Industry share (left) vs this base at Time T (right), widest level last. */
const COMMUNITIES = [
  { level: 'Promoters',      industry: 1.33,  base: 5.8 },
  { level: 'Regular buyers', industry: 10.04, base: 21.3 },
  { level: 'Buyers',         industry: 48.03, base: 48.6 },
  { level: 'Engaged',        industry: 60.14, base: 72.4 },
  { level: 'Contacts',       industry: 100,   base: 100, count: 330011 },
];

const HISTORY = [
  { t: 'T-1', Contacts: 318204, Engaged: 225925, Buyers: 151782, 'Regular buyers': 65232, Promoters: 17501 },
  { t: 'T',   Contacts: 330011, Engaged: 238928, Buyers: 160385, 'Regular buyers': 70292, Promoters: 19141 },
];

const PERFORMANCE = [
  { label: 'Delivered', emails: 192472, rate: null },
  { label: 'Opened',    emails: 49895,  rate: 25.9 },
  { label: 'Clicked',   emails: 5915,   rate: 3.1 },
];

const COMPLETION = [
  { field: 'Email address', T: 92, T1: 88 },
  { field: 'Last name',     T: 98, T1: 96 },
  { field: 'First name',    T: 97, T1: 95 },
  { field: 'Address',       T: 61, T1: 55 },
  { field: 'Date of birth', T: 44, T1: 39 },
  { field: 'Gender',        T: 72, T1: 70 },
];

const USE_CASES = [
  { org: 'Folies Gruss', initials: 'FG', text: 'Discover how the Gruss company centralizes and streamlines the management of incoming requests (quotes, invitations…) thanks to forms and automation.' },
  { org: 'Stade Rennais', initials: 'SR', text: 'See how Stade Rennais turns match-day buyers into season-ticket holders with segmented reactivation campaigns.' },
  { org: 'Paris Musées', initials: 'PM', text: 'Learn how Paris Musées unified ticketing and shop data to send one consistent newsletter per visitor profile.' },
];

const AGES = [
  { range: '0-20',  men: 1200,  women: 2100 },
  { range: '21-30', men: 6800,  women: 12400 },
  { range: '31-40', men: 15600, women: 29200 },
  { range: '41-50', men: 23800, women: 44700 },
  { range: '51-60', men: 24700, women: 46100 },
  { range: '61-70', men: 18400, women: 34900 },
  { range: '71-80', men: 8700,  women: 16800 },
  { range: '81+',   men: 2800,  women: 5600 },
];
const MEN_PCT = 39.5, WOMEN_PCT = 60.5, AVG_AGE = 52;

const RECENCY = [
  { bucket: '< 6 months',     short: '< 6 mo',  pct: 5.8 },
  { bucket: '6 to 12 months', short: '6–12 mo', pct: 5.9 },
  { bucket: '1 to 3 years',   short: '1–3 yrs', pct: 26.8 },
  { bucket: '> 3 years',      short: '> 3 yrs', pct: 61.5 },
];
const AVG_RECENCY_DAYS = 1993;

const CART = { carts: 4693, volume: 2.1, value: 64.5 };

/* Chart palette — DS primitives only. */
const C_INDUSTRY = DS.orange400;
const C_BASE = DS.brandPrimary;
const C_MEN = DS.orange400;
const C_WOMEN = DS.teal500;
const C_PREV = DS.blue300;
const HISTORY_COLORS = {
  Contacts: DS.brandPrimary, Engaged: DS.purple400, Buyers: DS.teal500,
  'Regular buyers': DS.teal300, Promoters: DS.orange400,
};

const AXIS = { fontSize: 12, fill: DS.textSecondary, fontFamily: DS.ff };
const TIP = { borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 };

/* ════════════════════════════ Atoms ════════════════════════════ */

/* DS section shell — same as Consents / List record. */
function Section({ title, sub, inline = false, info, right, children, style }) {
  return (
    <section style={{
      background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl,
      boxShadow: DS.shadowSm, padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10,
      minWidth: 0, boxSizing: 'border-box', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, rowGap: 4, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ ...TY.titleMd, color: DS.textStrong, fontFamily: DS.ff }}>{title}</span>
            {info && (
              <Tooltip label={info}>
                <span style={{ display: 'flex', cursor: 'help' }}><Ico.Info s={16} c={DS.textSecondary} /></span>
              </Tooltip>
            )}
            {sub && inline && <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>{sub}</span>}
          </div>
          {sub && !inline && <div style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const Legend = ({ items }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
    {items.map((it) => (
      <span key={it.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.labelMd, color: DS.textDefault, fontFamily: DS.ff }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: it.color }} />
        {it.label}
        {it.value && <strong style={{ color: DS.textStrong, fontWeight: 600 }}>{it.value}</strong>}
      </span>
    ))}
  </div>
);

/* Footnote line: label + brand figure, as the production cards end. */
const Footnote = ({ label, value }) => (
  <div style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff, marginTop: 'auto' }}>
    {label} <strong style={{ color: DS.brandOnSurface, fontWeight: 600 }}>{value}</strong>
  </div>
);

/* Header date control: "Time T-1" label + date, one 36px bordered field. */
function TimeField({ label, value, onChange }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 10px 0 12px',
      border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg, background: DS.surfaceCanvas,
      boxSizing: 'border-box', cursor: 'pointer',
    }}>
      <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, whiteSpace: 'nowrap' }}>{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
             style={{ border: 'none', outline: 'none', background: 'transparent', ...TY.bodyMdBold, color: DS.textStrong, fontFamily: DS.ff, width: 118 }} />
    </label>
  );
}

/* ════════════════════════════ Widgets ════════════════════════════ */

/* Industry (left) vs base (right): one row per community level, bars growing
   outward from a shared centre axis.
   Layout: the bars are a fixed 38px; each row is a slot that may grow to 62px,
   so spare height becomes even air between the bars (8 → 24px at most) and
   anything beyond that is split above and below the block. Light gridlines at
   every 20% run behind the bars and line up with the scale underneath, so the
   bars, the axis and the scale read as one figure. */
const BAR_H = 38;
const TICKS = [0, 20, 40, 60, 80, 100];

function Half({ side, children }) {
  // Gridlines for one half — left half mirrors (100 at the outer edge).
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {TICKS.map((t) => (
        <span key={t} style={{
          position: 'absolute', top: 0, bottom: 0, width: 1,
          [side === 'left' ? 'right' : 'left']: `${t}%`,
          background: t === 0 ? DS.borderDefault : DS.borderDivider,
        }} />
      ))}
      <div style={{
        position: 'relative', height: '100%', display: 'flex', alignItems: 'center', gap: 8,
        justifyContent: side === 'left' ? 'flex-end' : 'flex-start',
      }}>
        {children}
      </div>
    </div>
  );
}

function CommunitiesChart() {
  const label = { ...TY.labelMd, fontFamily: DS.ff, whiteSpace: 'nowrap' };
  const tick = { ...TY.captionSm, color: DS.textSecondary, fontFamily: DS.ff, position: 'absolute', top: 0 };
  const last = COMMUNITIES.length - 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <Legend items={[
        { label: 'Average for your industry', color: C_INDUSTRY },
        { label: 'Your base at Time T', color: C_BASE },
      ]} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {COMMUNITIES.map((c, idx) => {
          const inside = c.base >= 60;
          const text = c.count ? `${nf.format(c.count)} contacts · ${c.base}%` : `${c.level} · ${c.base}%`;
          const bar = { height: BAR_H, borderRadius: DS.radiusMd, display: 'flex', alignItems: 'center', boxSizing: 'border-box' };
          return (
            <div key={c.level} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4,
              flex: `1 1 ${BAR_H + 8}px`, minHeight: BAR_H + 8, maxHeight: BAR_H + 24,
            }}>
              <Half side="left">
                {c.industry < 85 && <span style={{ ...label, color: DS.textSecondary }}>{c.industry}%</span>}
                <div style={{ ...bar, width: `${c.industry}%`, minWidth: 6, background: C_INDUSTRY, paddingLeft: 10 }}>
                  {c.industry >= 85 && <span style={{ ...label, color: DS.textOnBrand, fontWeight: 600 }}>{c.industry}%</span>}
                </div>
              </Half>
              <Half side="right">
                <div style={{
                  ...bar, width: `${c.base}%`, background: C_BASE, justifyContent: 'flex-end', paddingRight: 10,
                  opacity: 0.55 + 0.45 * (idx / last),
                }}>
                  {inside && <span style={{ ...label, color: DS.textOnBrand, fontWeight: 600 }}>{text}</span>}
                </div>
                {!inside && <span style={{ ...label, color: DS.textDefault, fontWeight: 600 }}>{text}</span>}
              </Half>
            </div>
          );
        })}
        {/* Scale — same 20% steps as the gridlines, mirrored on the left */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4, height: 16, marginTop: 2 }}>
          <div style={{ position: 'relative' }}>
            {TICKS.map((t) => (
              <span key={t} style={{ ...tick, right: `${t}%`, transform: t === 100 ? 'translateX(100%)' : 'translateX(50%)' }}>{t}</span>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            {TICKS.filter((t) => t > 0).map((t) => (
              <span key={t} style={{ ...tick, left: `${t}%`, transform: t === 100 ? 'translateX(-100%)' : 'translateX(-50%)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Proposition B — bars anchored on the outer edges: industry grows from the
   left, the base grows from the right, each value next to its bar end. The
   100% "Contacts" level is not a bar but a full-width band underneath, which
   both sides share. Thinner 22px bars; rows breathe 8 → 22px with spare
   height, the rest is split above and below. */
function CommunitiesEdges() {
  const pct = { ...TY.labelMd, fontFamily: DS.ff, whiteSpace: 'nowrap' };
  const levels = COMMUNITIES.filter((c) => !c.count);
  const total = COMMUNITIES.find((c) => c.count);
  const bar = (w, color) => ({ width: `${w}%`, minWidth: 6, height: 22, borderRadius: DS.radiusMd, background: color, flexShrink: 0 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <Legend items={[
        { label: 'Average for your industry', color: C_INDUSTRY },
        { label: 'Your base at Time T', color: C_BASE },
      ]} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {levels.map((c) => (
          <div key={c.level} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, alignItems: 'center',
            flex: '1 1 30px', minHeight: 30, maxHeight: 44,
          }}>
            {/* Industry — from the left edge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={bar(c.industry * 0.7, C_INDUSTRY)} />
              <span style={{ ...pct, color: DS.textSecondary }}>{c.industry}%</span>
            </div>
            {/* Base — from the right edge, name + value before the bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
              <span style={{ ...pct, color: DS.textDefault }}>
                {c.level} <strong style={{ color: DS.textStrong, fontWeight: 600 }}>{c.base}%</strong>
              </span>
              <div style={bar(c.base * 0.7, C_BASE)} />
            </div>
          </div>
        ))}
        {/* Contacts — the 100% both sides are measured against */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8,
          height: 36, padding: '0 12px', borderRadius: DS.radiusLg, background: DS.surfaceSubtle,
          border: `1px solid ${DS.borderSection}`,
        }}>
          <span style={{ ...TY.bodyMdBold, color: DS.orange800, fontFamily: DS.ff }}>100%</span>
          <span style={{ ...TY.bodyMdBold, color: DS.textStrong, fontFamily: DS.ff }}>
            {nf.format(total.count)} contacts · 100%
          </span>
        </div>
      </div>
    </div>
  );
}

/* Proposition C — one comparison bar per level (bullet chart). Base and
   industry share ONE 0–100% track, so each level reads in a single glance:
   the blue fill is your base, the orange marker is the industry average, and
   the right column gives the base value with its gap to the industry in
   points. Levels go from Contacts (100%) down the funnel. Rows share the
   card's height (36 → 56px), so the card is filled evenly, never stretched. */
function CommunitiesBullet() {
  const levels = [...COMMUNITIES].reverse(); // Contacts first, then down the funnel
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.labelMd, color: DS.textDefault, fontFamily: DS.ff }}>
          <span style={{ width: 14, height: 8, borderRadius: DS.radiusPill, background: C_BASE }} />Your base at Time T
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.labelMd, color: DS.textDefault, fontFamily: DS.ff }}>
          <span style={{ width: 3, height: 14, borderRadius: 2, background: C_INDUSTRY }} />Average for your industry
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {levels.map((c, idx) => {
          const gap = Math.round((c.base - c.industry) * 10) / 10;
          const tone = gap > 0 ? DS.feedbackSuccess : gap < 0 ? DS.feedbackError : DS.textSecondary;
          return (
            <div key={c.level} style={{
              display: 'grid', gridTemplateColumns: 'minmax(96px, 128px) minmax(0, 1fr) 112px', columnGap: 16,
              alignItems: 'center', flex: '1 1 36px', minHeight: 36, maxHeight: 56,
              borderTop: idx === 0 ? 'none' : `1px solid ${DS.borderDivider}`,
            }}>
              <span style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff, fontWeight: idx === 0 ? 600 : 400 }}>
                {c.level}
              </span>
              {/* Track · base fill · industry marker */}
              <div style={{ position: 'relative', height: 12, borderRadius: DS.radiusPill, background: DS.surfaceSubtle }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: `${c.base}%`, borderRadius: DS.radiusPill,
                  background: C_BASE, opacity: 0.55 + 0.45 * ((levels.length - 1 - idx) / (levels.length - 1)),
                }} />
                {/* Positioned by its own box: the Tooltip wrapper is relative,
                    so the offset must live outside it. */}
                <div style={{ position: 'absolute', top: -5, left: `calc(${c.industry}% - 1.5px)` }}>
                  <Tooltip label={`Industry average: ${c.industry}%`}>
                    <span style={{
                      display: 'block', height: 22, width: 3, borderRadius: 2, background: C_INDUSTRY,
                      boxShadow: `0 0 0 2px ${DS.surfaceCanvas}`, cursor: 'help',
                    }} />
                  </Tooltip>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                <span style={{ ...TY.bodyMdBold, color: DS.textStrong, fontFamily: DS.ff, whiteSpace: 'nowrap' }}>
                  {c.count ? `${nf.format(c.count)}` : `${c.base}%`}
                </span>
                <span style={{ ...TY.captionSm, fontFamily: DS.ff, whiteSpace: 'nowrap', color: c.count ? DS.textSecondary : tone }}>
                  {c.count ? 'contacts · 100%' : `${gap > 0 ? '+' : gap < 0 ? '−' : ''}${Math.abs(gap)} pts vs industry`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryChart() {
  const keys = Object.keys(HISTORY_COLORS);
  return (
    <div style={{ flex: 1, minHeight: 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={HISTORY} margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
          <CartesianGrid stroke={DS.borderDivider} vertical={false} />
          <XAxis dataKey="t" tick={AXIS} axisLine={{ stroke: DS.borderDefault }} tickLine={false} interval={0} />
          <YAxis hide />
          <RTooltip formatter={(v, n) => [nf.format(v), n]} contentStyle={TIP} />
          {keys.map((k) => (
            <Area key={k} type="linear" dataKey={k} stroke={HISTORY_COLORS[k]} strokeWidth={2}
                  fill={HISTORY_COLORS[k]} fillOpacity={0.35} isAnimationActive={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function PerformanceTable({ onTrack }) {
  const th = { ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, padding: '5px 10px', textAlign: 'right', background: DS.surfaceHeader };
  const td = { ...TY.bodyMd, color: DS.textStrong, fontFamily: DS.ff, padding: '6px 10px', textAlign: 'right', borderTop: `1px solid ${DS.borderTableSep}`, fontVariantNumeric: 'tabular-nums' };
  return (
    <>
      <div style={{ border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusLg, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }} />
              <th style={th}>Emails</th>
              <th style={th}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {PERFORMANCE.map((r) => (
              <tr key={r.label}>
                <td style={{ ...td, textAlign: 'left', color: DS.textDefault }}>{r.label}</td>
                <td style={{ ...td, fontWeight: 600 }}>{nf.format(r.emails)}</td>
                <td style={td}>{r.rate == null ? '—' : `${r.rate}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* A text link, not a button: it wraps in a quarter-width card. */}
      <button type="button" onClick={onTrack} style={{
        marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4,
        border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
        ...TY.labelMd, fontWeight: 600, color: DS.actionPrimary, fontFamily: DS.ff,
      }}>
        Track the impact of your 1 campaign
        <Ico.ArrowRightSmall s={16} c={DS.actionPrimary} />
      </button>
    </>
  );
}

function CompletionChart() {
  return (
    <>
      <div style={{ flex: 1, minHeight: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={COMPLETION} outerRadius="68%" margin={{ top: 4, right: 30, bottom: 4, left: 30 }}>
            <PolarGrid stroke={DS.borderDivider} />
            <PolarAngleAxis dataKey="field" tick={{ ...AXIS, fontSize: 11 }} />
            <RTooltip formatter={(v, n) => [`${v}%`, n === 'T' ? 'Time T' : 'Time T-1']} contentStyle={TIP} />
            <Radar dataKey="T1" stroke={C_PREV} fill={C_PREV} fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
            <Radar dataKey="T" stroke={C_BASE} fill={C_BASE} fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function UseCase({ onDownload }) {
  const [i, setI] = React.useState(0);
  const uc = USE_CASES[i];
  const n = USE_CASES.length;
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: DS.textStrong, color: DS.textOnBrand,
            display: 'flex', alignItems: 'center', justifyContent: 'center', ...TY.bodyMdBold, fontFamily: DS.ff,
          }}>
            {uc.initials}
          </span>
          <span style={{ ...TY.bodyMdBold, color: DS.textStrong, fontFamily: DS.ff }}>{uc.org}</span>
        </div>
        <span style={{
          ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {uc.text}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconBtn kind="Outline" size="Sm" icon={<Ico.ArrowLeftSmall s={16} />} aria-label="Previous use case" title="Previous"
                 onClick={() => setI((i + n - 1) % n)} />
        <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>{i + 1} / {n}</span>
        <IconBtn kind="Outline" size="Sm" icon={<Ico.ArrowRightSmall s={16} />} aria-label="Next use case" title="Next"
                 onClick={() => setI((i + 1) % n)} />
        <div style={{ flex: 1 }} />
        <IconBtn kind="Outline" size="Sm" icon={<Ico.Download s={16} />} aria-label="Download the use case" title="Download"
                 onClick={() => onDownload(uc)} />
      </div>
    </>
  );
}

function AgeChart() {
  return (
    <>
      <Legend items={[
        { label: 'Men', value: `${MEN_PCT}%`, color: C_MEN },
        { label: 'Women', value: `${WOMEN_PCT}%`, color: C_WOMEN },
      ]} />
      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={AGES} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid stroke={DS.borderDivider} horizontal={false} />
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => nf.format(v)} />
            <YAxis type="category" dataKey="range" tick={AXIS} axisLine={false} tickLine={false} width={44} />
            <RTooltip formatter={(v, n) => [nf.format(v), n === 'men' ? 'Men' : 'Women']} contentStyle={TIP} cursor={{ fill: DS.surfaceSubtle }} />
            <Bar dataKey="men" stackId="a" fill={C_MEN} isAnimationActive={false} />
            <Bar dataKey="women" stackId="a" fill={C_WOMEN} radius={[0, 4, 4, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Footnote label="Average age of your community:" value={`${AVG_AGE} years`} />
    </>
  );
}

function RecencyChart() {
  return (
    <>
      <div style={{ flex: 1, minHeight: 110 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={RECENCY} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%">
            <XAxis dataKey="short" tick={AXIS} axisLine={{ stroke: DS.borderDefault }} tickLine={false} interval={0} />
            <YAxis hide domain={[0, 70]} />
            <RTooltip formatter={(v) => [`${v}%`, 'Buyers']} labelFormatter={(_, p) => p?.[0]?.payload?.bucket ?? ''}
                      contentStyle={TIP} cursor={{ fill: DS.surfaceSubtle }} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {RECENCY.map((r, i) => <Cell key={r.bucket} fill={C_BASE} fillOpacity={0.45 + i * 0.18} />)}
              <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`}
                         style={{ fontSize: 12, fontWeight: 600, fill: DS.textStrong, fontFamily: DS.ff }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Footnote label="Average time since the last purchase:" value={`${nf.format(AVG_RECENCY_DAYS)} days`} />
    </>
  );
}

function CartTile({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 0,
      padding: '6px 12px', borderRadius: DS.radiusLg, border: `1px solid ${DS.borderSection}`, background: DS.surfaceCanvas,
    }}>
      <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.bgIcons, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>{label}</span>
        <span style={{ ...TY.titleMd, color: DS.brandOnSurface, fontFamily: DS.ff }}>{value}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════ Responsive layout ════════════════════════════ */

/* The grid follows the PAGE width, not the window: opening or collapsing the
   sidebar changes the room by ~200px, so the breakpoints are read from the
   page's own box (ResizeObserver) rather than media queries.
     wide    ≥ 960   4 columns — the production arrangement, sidebar open or
                     closed; the cards are built to read at a quarter width
     medium  ≥ 640   2 columns — Communities and Geomarketing full width,
                     the small cards paired, Age beside Recency + Average cart
     narrow  < 640   1 column, in reading order */
function useLayout(ref) {
  const [w, setW] = React.useState(1280);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w >= 960 ? 'wide' : w >= 640 ? 'medium' : 'narrow';
}

/* Grid placement per layout: [column span, row span]. */
const PLACEMENT = {
  wide:   { communities: [2, 2], geo: [2, 2], age: [1, 2] },
  medium: { communities: [2, 1], geo: [2, 1], age: [1, 2] },
  narrow: {},
};
const COLS = { wide: 4, medium: 2, narrow: 1 };

/* ════════════════════════════ Page ════════════════════════════ */

export default function Overview() {
  const navigate = useNavigate();
  const [t1, setT1] = React.useState('2026-07-04');
  const [t, setT] = React.useState('2026-10-23');
  const [toast, setToast] = React.useState(null);
  const [pyramid, setPyramid] = React.useState('bullet'); // bullet | edges | mirrored — design comparison
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const rootRef = React.useRef(null);
  const layout = useLayout(rootRef);
  const gap = layout === 'narrow' ? 16 : 20;
  const grid = { display: 'grid', gridTemplateColumns: `repeat(${COLS[layout]}, minmax(0, 1fr))`, gap };
  const place = (key) => {
    const [c, r] = PLACEMENT[layout][key] ?? [1, 1];
    return { gridColumn: `span ${c}`, gridRow: `span ${r}` };
  };

  const geo = (
    <Section title="Geomarketing" sub="Where your contacts live" style={place('geo')}>
      <Placeholder name="Maps / Geomarketing" note="Heat map of contacts by area — no map component in the code yet"
                   height="100%" style={{ flex: 1, minHeight: 260 }} />
    </Section>
  );

  return (
    <div ref={rootRef} style={{ fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap, paddingBottom: 32 }}>
      <PageHeader
        title="Overview"
        description="How your contact base is built, engaged and buying, compared between Time T-1 and Time T."
        actions={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TimeField label="Time T-1" value={t1} onChange={setT1} />
            <TimeField label="Time T" value={t} onChange={setT} />
            <IconBtn kind="Outline" icon={<Ico.Download s={18} />} aria-label="Export as image" title="Export as image"
                     onClick={() => showToast('Overview exported as an image (demo).')} />
            <IconBtn kind="Filled" icon={<Ico.Filter s={18} />} aria-label="Filter the population" title="Filter the population"
                     onClick={() => showToast('Population filter (demo) — the filter panel is not in this prototype.')} />
          </div>
        )}
      />

      {/* Rows 1–2 */}
      <div style={grid}>
        <Section title="Communities of engagement" sub="Distribution of your contacts according to their level of engagement"
                 style={place('communities')}>
          {pyramid === 'bullet' ? <CommunitiesBullet /> : pyramid === 'edges' ? <CommunitiesEdges /> : <CommunitiesChart />}
        </Section>

        <Section title="Communities history" info="Size of each community at Time T-1 and Time T.">
          <HistoryChart />
        </Section>

        <Section title="Performances" sub="over the last 3 months" inline info="Emails sent to your base in the 3 months before Time T.">
          <PerformanceTable onTrack={() => navigate('/performances-v3')} />
        </Section>

        <Section title="Completion rate"
                 right={<Legend items={[{ label: 'Time T', color: C_BASE }, { label: 'Time T-1', color: C_PREV }]} />}>
          <CompletionChart />
        </Section>

        <Section title="Use case">
          <UseCase onDownload={(uc) => showToast(`${uc.org} use case downloaded (demo).`)} />
        </Section>
      </div>

      {/* Rows 3–4 */}
      <div style={grid}>
        <Section title="Age distribution" sub="Distribution of your contacts by gender and age" style={place('age')}>
          <AgeChart />
        </Section>

        <Section title="Recency distribution" sub="Average time since last purchase" info="Share of buyers by time since their last purchase.">
          <RecencyChart />
        </Section>

        {/* In 2 columns the map takes its own full-width row after Average
            cart, so Age sits beside Recency + Average cart. */}
        {layout !== 'medium' && geo}

        <Section title="Average cart" sub={`Over the 3 months prior to T · on ${nf.format(CART.carts)} carts`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <CartTile icon={<Ico.Ticket s={18} c={DS.actionPrimary} />} label="Average order volume" value={`${CART.volume} tickets`} />
            <CartTile icon={<Ico.Cart s={18} c={DS.actionPrimary} />} label="Average order value" value={`€${CART.value}`} />
          </div>
        </Section>

        {layout === 'medium' && geo}
      </div>

      <Toast toast={toast} />
      <StatePreview groups={[{ label: 'Engagement chart', value: pyramid, onChange: setPyramid,
        options: [
          { id: 'bullet', label: 'C · Comparison bars' },
          { id: 'edges', label: 'B · From the edges' },
          { id: 'mirrored', label: 'A · Mirrored' },
        ] }]} />
    </div>
  );
}
