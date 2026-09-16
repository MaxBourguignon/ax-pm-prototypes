/**
 * Acquisition — Contacts module
 * Dashboard only · keyed on contact creation date.
 *
 * PAGE ONLY — renders inside the existing app shell (nav/sidebar/header live in
 * layout/*). Design system is IMPORTED, never redefined.
 *
 * Answers "where do our contacts come from?" at three levels:
 *   1. By source TYPE   — Datasource / Forms / Manual          → donut + stacked trend
 *   2. By source NAME   — Vivenu, GVS, Brevo forms, imports…   → ranking + by-source trend
 *   3. Over TIME        — monthly evolution, stacked by type   → area chart
 *
 * OPEN QUESTIONS (flagged, not silently resolved):
 *  - Source taxonomy assumed: types = Datasource / Forms / Manual. Confirm the real
 *    CRM source-type enum (e.g. is "Brevo" its own type or a Forms provider?).
 *  - Attribution assumed one source per contact. Multi-touch acquisition out of scope.
 *  - Date framing is monthly buckets; sub-month granularity (weekly) not built.
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import StatePreview from '../../components/StatePreview';
import PageHeader from '../../components/PageHeader';
import { EmptyState, ErrorState } from '../../components/Feedback';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ════════════════════════════ Tokens / layout ═══════════════════════════ */
const SP = { page: 32, section: 20, card: 16, gap: 16, tight: 12 };
const SHADOW = '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)';
const CARD = { padding: SP.card, boxShadow: SHADOW, borderRadius: 12 };
const NOW = new Date('2026-06-01');
const nf = new Intl.NumberFormat('en-US');

/* Source TYPE catalog — the high-level bucket. */
const TYPES = {
  Datasource: { label: 'Datasource', color: DS.actionPrimary,   icon: (s, c) => <Ico.Connect s={s} c={c} /> },
  Forms:      { label: 'Forms',      color: DS.greenBrand, icon: (s, c) => <Ico.Form s={s} c={c} /> },
  Manual:     { label: 'Manual',     color: DS.orange,     icon: (s, c) => <Ico.UserPlus s={s} c={c} /> },
};
const TYPE_KEYS = ['Datasource', 'Forms', 'Manual'];
/* "Automated" = anything not entered by hand. */
const AUTOMATED = new Set(['Datasource', 'Forms']);

/* Palette for the by-source (named) views. */
const NAME_PALETTE = [DS.actionPrimary, DS.greenBrand, DS.orange, DS.purple600, DS.teal500,
                      DS.indigoBrand, DS.blue300, DS.amber600, DS.blue700, DS.green400];

/* Source NAME catalog — the specific origin within a type.
 * base = ~monthly volume · trend = month-over-month drift · onlyOld/new = edge cases. */
const SOURCES = [
  { name: 'Vivenu',                  type: 'Datasource', base: 430, trend:  0.035 },
  { name: 'GVS',                     type: 'Datasource', base: 300, trend:  0.012 },
  { name: 'Newsletter signup',       type: 'Forms',      base: 250, trend:  0.02 },
  { name: 'Event RSVP form',         type: 'Forms',      base: 175, trend: -0.01 },
  { name: 'Membership renewal form', type: 'Forms',      base: 95,  trend:  0.0 },
  // edge: very long name
  { name: 'Festival 2026 — early-bird waitlist registration form', type: 'Forms', base: 70, trend: 0.05 },
  { name: 'Manual import',           type: 'Manual',     base: 150, trend: -0.02 },
  { name: 'Manual entry',            type: 'Manual',     base: 65,  trend: -0.005 },
  // edge: brand-new source — zero until 3 months ago, then ramps hard
  { name: 'TikTok lead form',        type: 'Forms',      base: 120, trend: 0.0, newAfter: 3 },
  // edge: legacy source — only had data >12 months ago, zero in any recent range
  { name: 'Legacy CSV import 2023',  type: 'Manual',     base: 90,  trend: 0.0, deadAfter: 14 },
];

const RANGE_PRESETS = [
  { value: 3,  label: 'Last 3 months' },
  { value: 6,  label: 'Last 6 months' },
  { value: 12, label: 'Last 12 months' },
];

/* ════════════════════════════ Mock data engine ══════════════════════════ */
/* Deterministic PRNG so the dashboard is stable across renders. */
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* 24 months of per-source monthly counts (index 0 = oldest, 23 = current month).
 * 24 months lets us compute deltas vs the previous equal-length window for every preset. */
const MATRIX = (() => {
  const months = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(NOW); d.setMonth(NOW.getMonth() - i);
    months.push({ monthsAgo: i, label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), counts: {} });
  }
  SOURCES.forEach((src, si) => {
    const rand = rng(si * 9973 + 17);
    months.forEach((m) => {
      const age = m.monthsAgo;                       // 0 = current month
      let v = 0;
      if (src.deadAfter != null) {
        // legacy: only had data older than the window — zero in any recent range
        v = age >= src.deadAfter ? src.base * (0.7 + rand() * 0.6) : 0;
      } else if (src.newAfter != null) {
        // brand-new: zero before it launched, then ramps up to recent months
        const ramp = age <= src.newAfter ? (1 - age / (src.newAfter + 1)) : 0;
        v = src.base * ramp * (0.7 + rand() * 0.5);
      } else {
        const growth = Math.pow(1 + src.trend, 23 - age);
        const season = 1 + 0.18 * Math.sin((age + si) / 1.9);
        v = src.base * growth * season * (0.85 + rand() * 0.3);
      }
      m.counts[src.name] = Math.max(0, Math.round(v));
    });
  });
  return months;
})();

const sum = (arr, f) => arr.reduce((a, b) => a + f(b), 0);
const pct = (n, d) => (d ? (n / d) * 100 : 0);

/* ════════════════════════════ Small UI helpers ══════════════════════════ */
function ChartFrame({ title, sub, right, children, height = 280 }) {
  return (
    <Card style={CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SP.tight, gap: SP.tight, flexWrap: 'wrap' }}>
        <div>
          <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
          {sub && <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  );
}

function Delta({ v, suffix = 'vs prev. period', pp = false }) {
  if (v == null) return <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>No prior period</span>;
  const up = v >= 0;
  const color = up ? DS.feedbackSuccess : DS.feedbackError;
  const Arrow = up ? Ico.TrendUp : Ico.TrendDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.b3, fontFamily: DS.ff, color }}>
      <Arrow s={14} c={color} />
      {up ? '+' : ''}{v.toFixed(1)}{pp ? ' pp' : '%'}
      <span style={{ color: DS.textSecondary, marginLeft: 2 }}>{suffix}</span>
    </span>
  );
}

function TypeTag({ type }) {
  const t = TYPES[type] || {};
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999,
                   background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color || DS.textSecondary }} />
      {t.label || type}
    </span>
  );
}

/* Range picker — calendar trigger + month presets. */
function RangePicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const current = RANGE_PRESETS.find((p) => p.value === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, minWidth: 200, padding: '0 14px',
                       background: DS.bgCard, border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`, borderRadius: 6,
                       cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Ico.Calendar s={16} c={DS.textSecondary} />{current ? current.label : `Last ${value} months`}
        </span>
        <Ico.ChevDown s={16} c={DS.textSecondary} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 50, width: 220, background: DS.bgCard,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', padding: 6 }}>
          {RANGE_PRESETS.map((p) => {
            const on = p.value === value;
            return (
              <div key={p.value} role="button" onClick={() => { onChange(p.value); setOpen(false); }}
                   onMouseEnter={(e) => (e.currentTarget.style.background = on ? DS.blue100 : DS.actionSecondaryHover)}
                   onMouseLeave={(e) => (e.currentTarget.style.background = on ? DS.blue100 : 'transparent')}
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6,
                            cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: on ? DS.actionPrimary : DS.textDefault,
                            fontWeight: on ? 600 : 400, background: on ? DS.blue100 : 'transparent' }}>
                {p.label}{on && <Ico.Check s={16} c={DS.actionPrimary} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const chartTooltip = { borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 };

/* ════════════════════════════════ PAGE ══════════════════════════════════ */
export default function Acquisition() {
  const [demo, setDemo] = React.useState('ready');
  const [range, setRange] = React.useState(6);          // months
  const [trendBy, setTrendBy] = React.useState('type'); // 'type' | 'source'
  const [rankType, setRankType] = React.useState('all'); // ranking-card filter

  const loading = demo === 'loading';
  const errored = demo === 'error';
  const forceEmpty = demo === 'empty';

  /* Months in the selected window (most recent `range` months). */
  const windowMonths = React.useMemo(
    () => (forceEmpty ? [] : MATRIX.filter((m) => m.monthsAgo < range)),
    [range, forceEmpty]);
  const prevMonths = React.useMemo(
    () => MATRIX.filter((m) => m.monthsAgo >= range && m.monthsAgo < range * 2),
    [range]);

  /* Per-source totals over the window. */
  const bySource = React.useMemo(() => {
    const tot = {}; const prevTot = {};
    SOURCES.forEach((s) => { tot[s.name] = 0; prevTot[s.name] = 0; });
    windowMonths.forEach((m) => SOURCES.forEach((s) => { tot[s.name] += m.counts[s.name] || 0; }));
    prevMonths.forEach((m) => SOURCES.forEach((s) => { prevTot[s.name] += m.counts[s.name] || 0; }));
    const total = sum(SOURCES, (s) => tot[s.name]);
    const hasPrev = prevMonths.length === range;
    return SOURCES.map((s, i) => ({
      name: s.name, type: s.type, color: NAME_PALETTE[i % NAME_PALETTE.length],
      count: tot[s.name], prev: prevTot[s.name],
      delta: hasPrev && prevTot[s.name] > 0 ? pct(tot[s.name] - prevTot[s.name], prevTot[s.name]) : (tot[s.name] > 0 && hasPrev ? 100 : null),
      isNew: s.newAfter != null, share: pct(tot[s.name], total),
    })).sort((a, b) => b.count - a.count);
  }, [windowMonths, prevMonths, range]);

  /* Per-type totals (donut + KPI). */
  const byType = React.useMemo(() => {
    const t = {}; const prev = {};
    TYPE_KEYS.forEach((k) => { t[k] = 0; prev[k] = 0; });
    bySource.forEach((s) => { t[s.type] += s.count; prev[s.type] += s.prev; });
    const total = sum(TYPE_KEYS, (k) => t[k]);
    return TYPE_KEYS.map((k) => ({ key: k, label: TYPES[k].label, color: TYPES[k].color,
      count: t[k], prev: prev[k], share: pct(t[k], total) }));
  }, [bySource]);

  /* Headline KPIs. */
  const kpis = React.useMemo(() => {
    const total = sum(bySource, (s) => s.count);
    const prevTotal = sum(bySource, (s) => s.prev);
    const hasPrev = prevMonths.length === range;
    const activeSources = bySource.filter((s) => s.count > 0).length;
    const top = bySource[0] || null;
    const automated = sum(bySource.filter((s) => AUTOMATED.has(s.type)), (s) => s.count);
    const prevAutomated = sum(bySource.filter((s) => AUTOMATED.has(s.type)), (s) => s.prev);
    const autoPct = pct(automated, total);
    const prevAutoPct = pct(prevAutomated, prevTotal);
    return {
      total, totalDelta: hasPrev && prevTotal ? pct(total - prevTotal, prevTotal) : null,
      activeSources,
      top,
      autoPct, autoDelta: hasPrev && prevTotal ? autoPct - prevAutoPct : null,
    };
  }, [bySource, prevMonths, range]);

  /* Trend chart data — stacked by type or by top sources. */
  const trendData = React.useMemo(() => {
    if (trendBy === 'type') {
      return windowMonths.map((m) => {
        const row = { label: m.label };
        TYPE_KEYS.forEach((k) => { row[k] = 0; });
        SOURCES.forEach((s) => { row[s.type] += m.counts[s.name] || 0; });
        return row;
      });
    }
    const top = bySource.slice(0, 5).map((s) => s.name);
    return windowMonths.map((m) => {
      const row = { label: m.label };
      top.forEach((n) => { row[n] = m.counts[n] || 0; });
      return row;
    });
  }, [windowMonths, trendBy, bySource]);
  const trendSeries = trendBy === 'type'
    ? TYPE_KEYS.map((k) => ({ key: k, color: TYPES[k].color }))
    : bySource.slice(0, 5).map((s) => ({ key: s.name, color: s.color }));

  const rankRows = rankType === 'all' ? bySource : bySource.filter((s) => s.type === rankType);
  const rankMax = Math.max(1, ...rankRows.map((s) => s.count));

  /* ── State gates ── */
  const showEmpty = forceEmpty || (!loading && !errored && kpis.total === 0);

  return (
    <div style={{ background: DS.bgPage, minHeight: '100%', paddingBottom: 48 }}>
      <StatePreview groups={[
        { label: 'State', value: demo, onChange: setDemo, options: ['ready', 'loading', 'empty', 'error'] },
      ]} />

      <PageHeader
        icon={<Ico.UserPlus s={20} c={DS.actionPrimary} />}
        title="Acquisition"
        description="Where your CRM contacts come from — by source, over time"
        actions={
          <Btn type="Secondary" iconLeft={<Ico.Download s={16} />} onClick={() => {}}>Export</Btn>
        }
      />

      {/* ── Global controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP.tight, padding: `${SP.card}px ${SP.page}px 0` }}>
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Ico.Calendar s={14} c={DS.textSecondary} /> By contact creation date
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <RangePicker value={range} onChange={setRange} />
        </div>
      </div>

      {errored ? (
        <div style={{ padding: `${SP.section}px ${SP.page}px` }}>
          <Card style={CARD}>
            <ErrorState title="Couldn't load acquisition data."
                        sub="One or more sources may be temporarily unavailable. Try again."
                        onRetry={() => setDemo('ready')} />
          </Card>
        </div>
      ) : showEmpty ? (
        <div style={{ padding: `${SP.section}px ${SP.page}px` }}>
          <Card style={CARD}>
            <EmptyState icon={<Ico.UserPlus s={24} c={DS.textSecondary} />}
                        title="No contacts acquired in this range"
                        sub="No contacts were created from any source in the selected period. Try widening the date range."
                        cta={<Btn type="Secondary" iconLeft={<Ico.Calendar s={16} />} onClick={() => setRange(12)}>View last 12 months</Btn>} />
          </Card>
        </div>
      ) : (
        <>
          {/* ── KPI strip ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP.gap, padding: `${SP.section}px ${SP.page}px 0` }}>
            <KpiCard title="Contacts acquired" loading={loading}
                     value={loading ? '' : nf.format(kpis.total)}
                     icon={<Ico.UserPlus s={16} c={DS.actionPrimary} />}
                     sub={loading ? undefined : <Delta v={kpis.totalDelta} />} />
            <KpiCard title="Active sources" loading={loading}
                     value={loading ? '' : `${kpis.activeSources}`}
                     accent={DS.textDefault}
                     icon={<Ico.Connect s={16} c={DS.actionPrimary} />}
                     sub={loading ? undefined : `of ${SOURCES.length} configured`} />
            <KpiCard title="Top source" loading={loading}
                     value={loading ? '' : (kpis.top ? kpis.top.name : '—')}
                     accent={DS.textDefault}
                     icon={<Ico.Star s={16} c={DS.actionPrimary} />}
                     sub={loading ? undefined : (kpis.top ? `${nf.format(kpis.top.count)} contacts · ${kpis.top.share.toFixed(0)}% of total` : undefined)} />
            <KpiCard title="Automated acquisition" loading={loading}
                     value={loading ? '' : `${kpis.autoPct.toFixed(0)}%`}
                     icon={<Ico.Zap s={16} c={DS.actionPrimary} />}
                     sub={loading ? undefined : <Delta v={kpis.autoDelta} pp suffix="vs prev. period" />} />
          </div>

          {/* ── Trend over time ── */}
          <div style={{ padding: `${SP.section}px ${SP.page}px 0` }}>
            <ChartFrame
              title="Acquisition over time"
              sub={`Contacts created per month · last ${range} months`}
              right={
                <div style={{ display: 'inline-flex', gap: 8 }}>
                  <Chip label="By type" selected={trendBy === 'type'} onClick={() => setTrendBy('type')} />
                  <Chip label="By source" selected={trendBy === 'source'} onClick={() => setTrendBy('source')} />
                </div>
              }>
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer>
                  <AreaChart data={trendData} margin={{ top: 6, right: 12, left: 4, bottom: 0 }}>
                    <defs>
                      {trendSeries.map((s) => (
                        <linearGradient key={s.key} id={`g-${cssId(s.key)}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={s.color} stopOpacity={0.04} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }}
                           tickLine={false} axisLine={{ stroke: DS.borderDefault }} interval="preserveStartEnd" minTickGap={20} />
                    <YAxis tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }} tickLine={false} axisLine={false}
                           tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                    <RTooltip formatter={(v, n) => [nf.format(v), n]} contentStyle={chartTooltip} />
                    <Legend wrapperStyle={{ fontFamily: DS.ff, fontSize: 12 }} />
                    {trendSeries.map((s) => (
                      <Area key={s.key} type="monotone" dataKey={s.key} name={s.key} stackId="a"
                            stroke={s.color} strokeWidth={2} fill={`url(#g-${cssId(s.key)})`} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartFrame>
          </div>

          {/* ── Type split + Source ranking ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP.gap, padding: `${SP.section}px ${SP.page}px 0`, alignItems: 'stretch' }}>
            {/* Donut — by source type */}
            <div style={{ flex: '1 1 320px', minWidth: 320, display: 'flex' }}>
              <div style={{ width: '100%' }}>
                <ChartFrame title="By source type" sub="Share of acquired contacts" height={240}>
                  {loading ? <ChartSkeleton /> : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: SP.gap, height: '100%' }}>
                      <div style={{ width: 168, height: '100%', position: 'relative' }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={byType} dataKey="count" nameKey="label" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                              {byType.map((e) => <Cell key={e.key} fill={e.color} />)}
                            </Pie>
                            <RTooltip formatter={(v, n) => [nf.format(v), n]} contentStyle={chartTooltip} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                          <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>Total</span>
                          <span style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff }}>{nf.format(kpis.total)}</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {byType.map((t) => (
                          <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: t.color, flexShrink: 0 }} />
                            <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, flex: 1 }}>{t.label}</span>
                            <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600 }}>{nf.format(t.count)}</span>
                            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, width: 42, textAlign: 'right' }}>{t.share.toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ChartFrame>
              </div>
            </div>

            {/* Ranking — by source name */}
            <div style={{ flex: '2 1 520px', minWidth: 360, display: 'flex' }}>
              <div style={{ width: '100%' }}>
                <ChartFrame
                  title="Top sources"
                  sub="Named origins, ranked by contacts acquired"
                  height="auto"
                  right={
                    <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
                      <Chip label="All" selected={rankType === 'all'} onClick={() => setRankType('all')} />
                      {TYPE_KEYS.map((k) => (
                        <Chip key={k} label={TYPES[k].label} selected={rankType === k} color={TYPES[k].color} onClick={() => setRankType(k)} />
                      ))}
                    </div>
                  }>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Skeleton w={150} h={12} /><div style={{ flex: 1 }}><Skeleton h={10} /></div><Skeleton w={50} h={12} />
                        </div>
                      ))}
                    </div>
                  ) : rankRows.length === 0 ? (
                    <EmptyState icon={<Ico.Filter s={24} c={DS.textSecondary} />} title="No sources of this type"
                                sub="No contacts came from this source type in the selected range." />
                  ) : (
                    <RankingTable rows={rankRows} max={rankMax} />
                  )}
                </ChartFrame>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Ranking rows: name + type tag + bar + count + share + delta ── */
function RankingTable({ rows, max }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 8px', ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
        <span style={{ flex: '1 1 auto', minWidth: 0 }}>Source</span>
        <span style={{ width: 90, textAlign: 'right' }}>Contacts</span>
        <span style={{ width: 56, textAlign: 'right' }}>Share</span>
        <span style={{ width: 150, textAlign: 'right' }}>Trend</span>
      </div>
      {rows.map((s) => {
        const dead = s.count === 0;
        return (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: `1px solid ${DS.borderDefault}`, opacity: dead ? 0.55 : 1 }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span title={s.name} style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 500,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 230 }}>{s.name}</span>
                <TypeTag type={s.type} />
                {s.isNew && !dead && (
                  <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackSuccess, background: DS.feedbackSuccessBg,
                                 borderRadius: 999, padding: '1px 7px', fontWeight: 600 }}>New</span>
                )}
              </div>
              <div style={{ marginTop: 6, height: 6, background: DS.bgSurface, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${pct(s.count, max)}%`, height: '100%', background: s.color, borderRadius: 999 }} />
              </div>
            </div>
            <span style={{ width: 90, textAlign: 'right', ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600 }}>
              {dead ? '—' : nf.format(s.count)}
            </span>
            <span style={{ width: 56, textAlign: 'right', ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
              {dead ? '—' : `${s.share.toFixed(1)}%`}
            </span>
            <span style={{ width: 150, textAlign: 'right' }}>
              {dead ? <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>No activity</span>
                    : <Delta v={s.delta} suffix="" />}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 0' }}>
      {[80, 140, 110, 170, 120, 190, 150, 100].map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
          <Skeleton width="100%" height={h} radius={6} />
        </div>
      ))}
    </div>
  );
}

/* recharts gradient ids must be CSS-safe. */
function cssId(s) { return String(s).replace(/[^a-zA-Z0-9]/g, ''); }
