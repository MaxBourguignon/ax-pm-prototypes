/**
 * Report Builder IA — the CLOSED visualisation catalogue.
 *
 * Eleven types and no others. Anything the agent cannot express as one of these is
 * refused in the chat, never improvised here. `WidgetView` renders ONLY from a
 * WidgetSpec — the canvas never reads data directly, so the spec panel and the chat
 * stay the single source of truth.
 *
 * Reuse (per the component manifest):
 *   kpi · ratio_gauge · funnel  → shared `KpiCard` (DS Molecules 2006:6803)
 *   text_card                   → shared `Card`
 * Build-custom (⚠ no Figma authority — logged in the open-questions report):
 *   timeseries · category_bar · topn · overlap · segment_compare · histogram ·
 *   countdown, all drawn with `recharts` (already a project dependency).
 */
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Cell, LabelList,
} from 'recharts';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Card from '../../components/Card';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import { SERIES, fmtNumber, fmtValue, daysUntil } from './analyticsData';

/* Categorical ramp — same order as the DS donut uses (Kpi.jsx SEGMENT_COLORS). */
const CAT = [DS.brandPrimary, DS.orange400, DS.teal500, DS.purple400, DS.pink700];

const AXIS = { ...TY.labelMd, fontFamily: DS.ff, fill: DS.textSecondary };

/* Long dimension values (the 78-character product name) get cut, never wrapped —
   a wrapped label would push the plot area around between refreshes. */
const truncate = (s, n = 22) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s);

function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: DS.surfaceCanvas, border: `1px solid ${DS.borderDefault}`,
      borderRadius: DS.radiusMd ?? 4, padding: '6px 10px', boxShadow: DS.shadowMd,
      ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong, textAlign: 'left',
    }}>
      <div style={{ color: DS.textSecondary, marginBottom: 2 }}>{label}</div>
      <div>{fmtValue(payload[0].value, unit)}</div>
    </div>
  );
}

/* ── Empty / loading shells ─────────────────────────────────────────────────── */

export function WidgetEmpty({ note }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, minHeight: 180, padding: 24, textAlign: 'center',
      border: `1px dashed ${DS.borderDefault}`, borderRadius: DS.radiusLg ?? 8,
      background: DS.surfaceSubtle,
    }}>
      <Ico.Chart s={24} c={DS.textMuted} />
      <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>
        No rows returned
      </div>
      <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, maxWidth: 380 }}>
        {note || 'The query is valid but matches nothing yet. You can still save this widget — it will fill in as soon as there is data.'}
      </div>
    </div>
  );
}

export function WidgetSkeleton({ height = 220 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height }}>
      <Skeleton w="45%" h={14} />
      <Skeleton w="100%" h={height - 60} r={8} />
      <Skeleton w="70%" h={12} />
    </div>
  );
}

/* ── 1. kpi ─────────────────────────────────────────────────────────────────── */

function KpiWidget({ spec, data }) {
  const unit = spec.format?.unit;
  const delta = spec.comparison === 'previous_period' && data?.previous
    ? `${(((data.value - data.previous) / data.previous) * 100).toFixed(1)}%`
    : null;
  return (
    <KpiCard
      type="stat"
      label={spec.title}
      value={fmtValue(data?.value, unit)}
      delta={delta}
      trend={delta && data.value >= data.previous ? 'up' : 'down'}
      sub={spec.comparison === 'previous_period' ? 'vs previous period' : undefined}
      style={{ width: '100%' }}
    />
  );
}

/* ── 2. countdown ───────────────────────────────────────────────────────────── */

function CountdownWidget({ spec, data }) {
  const days = daysUntil(spec.targetDate ?? data?.targetDate);
  const past = days < 0;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6, padding: 20,
      border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg ?? 8,
      background: past ? DS.surfaceSubtle : DS.brandPrimarySubtle, textAlign: 'left',
    }}>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {past ? 'Event has passed' : 'Days remaining'}
      </span>
      <span style={{ ...TY.displayLg, fontFamily: DS.ff, color: past ? DS.textMuted : DS.brandOnSurface }}>
        {past ? `−${Math.abs(days)}` : days}
      </span>
      <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>
        {data?.label ?? spec.title} · {new Date(spec.targetDate ?? data?.targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
      {past && (
        <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.feedbackWarning }}>
          The target date is in the past — the daily job keeps decrementing. See open question 3.
        </span>
      )}
    </div>
  );
}

/* ── 3. timeseries ──────────────────────────────────────────────────────────── */
/* Bars, one per day. A day with no data renders as an ABSENT bar, never as a zero
   bar — the spec's two-day gap has to stay visible as a gap. */

function TimeseriesWidget({ spec, data }) {
  const unit = spec.format?.unit;
  const rows = (data || []).map((d) => ({
    ...d,
    day: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  }));
  const gaps = rows.filter((r) => r.value == null).length;
  return (
    <div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={DS.borderSubtle} />
            <XAxis dataKey="day" tick={AXIS} axisLine={{ stroke: DS.borderDefault }} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={56}
              tickFormatter={(v) => fmtValue(v, unit)} />
            <RTooltip content={<ChartTip unit={unit} />} cursor={{ fill: DS.surfaceSubtle }} />
            <Bar dataKey="value" fill={DS.brandPrimary} radius={[4, 4, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {gaps > 0 && (
        <div style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 8 }}>
          {gaps} day{gaps > 1 ? 's' : ''} with no orders — shown as a gap, not as a zero.
        </div>
      )}
    </div>
  );
}

/* ── 4 & 9. category_bar and topn ───────────────────────────────────────────── */
/* Same mark, different contract: topn is capped and always sorted; category_bar
   shows every value up to `limit`. The "Other" bucket renders muted so it never
   reads as a real dimension value. */

function BarsWidget({ spec, data }) {
  const unit = spec.format?.unit;
  const dim = spec.dimension || {};
  let rows = [...(data || [])];
  if (dim.sort === 'asc') rows.sort((a, b) => a.value - b.value);
  else if (dim.sort === 'desc') rows.sort((a, b) => b.value - a.value);
  if (!dim.other_bucket) rows = rows.filter((r) => !r.isOther);
  if (dim.limit) {
    const others = rows.filter((r) => r.isOther);
    rows = rows.filter((r) => !r.isOther).slice(0, dim.limit).concat(others);
  }

  return (
    <div style={{ height: Math.max(200, rows.length * 34 + 24) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
          <CartesianGrid horizontal={false} stroke={DS.borderSubtle} />
          <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}
            tickFormatter={(v) => fmtValue(v, unit)} />
          <YAxis type="category" dataKey="label" width={150} tick={AXIS}
            axisLine={false} tickLine={false} tickFormatter={(v) => truncate(v, 20)} />
          <RTooltip content={<ChartTip unit={unit} />} cursor={{ fill: DS.surfaceSubtle }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {rows.map((r) => (
              <Cell key={r.label} fill={r.isOther ? DS.neutral300 : DS.brandPrimary} />
            ))}
            <LabelList dataKey="value" position="right"
              formatter={(v) => fmtValue(v, unit)}
              style={{ ...TY.labelMd, fontFamily: DS.ff, fill: DS.textStrong }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── 5. overlap ─────────────────────────────────────────────────────────────── */
/* A base cohort, then what that cohort also did. The cohort line is stated above
   the bars because the percentages are meaningless without it. */

function OverlapWidget({ spec, data }) {
  const rows = data || [];
  const top = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px',
        background: DS.brandPrimarySubtle, borderRadius: DS.radiusMd ?? 4,
      }}>
        <Ico.Users s={16} c={DS.brandOnSurface} />
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong }}>
          Base cohort: {spec.cohort?.label} · {fmtNumber(spec.cohort?.size)} contacts
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 190, flexShrink: 0, ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}
              title={r.label}>
              {truncate(r.label, 28)}
            </span>
            <div style={{ flex: 1, minWidth: 0, height: 20, background: DS.surfaceSubtle, borderRadius: DS.radiusMd ?? 4 }}>
              <div style={{
                width: `${(r.value / top) * 100}%`, height: '100%',
                background: CAT[i % CAT.length], borderRadius: DS.radiusMd ?? 4,
                transition: 'width .25s ease',
              }} />
            </div>
            <span style={{ width: 108, flexShrink: 0, textAlign: 'right', ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong }}>
              {fmtNumber(r.value)} · {r.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 6. funnel ──────────────────────────────────────────────────────────────── */
/* Reuses the DS KPI Card's funnel body, which already floors a zero stage to a
   visible sliver — exactly the behaviour the spec's zero-step case needs. */

function FunnelWidget({ spec, data }) {
  const rows = data || [];
  return (
    <KpiCard
      type="funnel"
      label={spec.title}
      meta={spec.stages ? `${spec.stages.length} steps` : undefined}
      stages={rows}
      style={{ width: '100%' }}
    />
  );
}

/* ── 7. segment_compare ─────────────────────────────────────────────────────── */
/* Segments are business definitions, not a data column — flagged on the widget so
   nobody reads them as a field. */

function SegmentCompareWidget({ spec, data }) {
  const unit = spec.format?.unit;
  const rows = data || [];
  return (
    <div>
      <div style={{ height: Math.max(180, rows.length * 40 + 20) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 0 }}>
            <CartesianGrid horizontal={false} stroke={DS.borderSubtle} />
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}
              tickFormatter={(v) => fmtValue(v, unit)} />
            <YAxis type="category" dataKey="label" width={170} tick={AXIS}
              axisLine={false} tickLine={false} tickFormatter={(v) => truncate(v, 24)} />
            <RTooltip content={<ChartTip unit={unit} />} cursor={{ fill: DS.surfaceSubtle }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {rows.map((r, i) => <Cell key={r.label} fill={CAT[i % CAT.length]} />)}
              <LabelList dataKey="value" position="right"
                formatter={(v) => fmtValue(v, unit)}
                style={{ ...TY.labelMd, fontFamily: DS.ff, fill: DS.textStrong }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 8 }}>
        Segments are business definitions held in the semantic layer — not a column in the data.
      </div>
    </div>
  );
}

/* ── 8. histogram ───────────────────────────────────────────────────────────── */

function HistogramWidget({ spec, data }) {
  const unit = spec.format?.unit;
  const rows = data || [];
  return (
    <div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={DS.borderSubtle} />
            <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: DS.borderDefault }} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={56}
              tickFormatter={(v) => fmtValue(v, unit)} />
            <RTooltip content={<ChartTip unit={unit} />} cursor={{ fill: DS.surfaceSubtle }} />
            {/* No gap between bars — a histogram's bins are contiguous, unlike a bar chart's categories. */}
            <Bar dataKey="value" fill={DS.brandPrimary} barCategoryGap={0} maxBarSize={72} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 8 }}>
        Events attended per contact · last bucket groups {spec.dimension?.buckets ?? 6} and above.
      </div>
    </div>
  );
}

/* ── 10. ratio_gauge ────────────────────────────────────────────────────────── */
/* Reuses the DS KPI Card donut: numerator / denominator as two segments. */

function RatioGaugeWidget({ spec, data }) {
  const num = data?.numerator ?? 0;
  const den = data?.denominator ?? 1;
  const pct = (num / den) * 100;
  return (
    <KpiCard
      type="donut"
      label={spec.title}
      segments={[
        { label: 'Sold', value: num, display: fmtNumber(num), color: DS.brandPrimary },
        { label: 'Remaining', value: Math.max(den - num, 0), display: fmtNumber(Math.max(den - num, 0)), color: DS.neutral200 },
      ]}
      total={`${pct.toFixed(spec.format?.decimals ?? 1)}%`}
      totalLabel="fill rate"
      note={`${fmtNumber(num)} of ${fmtNumber(den)} seats`}
      style={{ width: '100%' }}
    />
  );
}

/* ── 11. text_card ──────────────────────────────────────────────────────────── */

function TextCardWidget({ spec, onBodyChange }) {
  return (
    <Card style={{ padding: 20, background: DS.surfaceSubtle, borderStyle: 'solid' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Ico.Edit s={16} c={DS.textSecondary} />
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Text card · no metric
        </span>
      </div>
      {onBodyChange ? (
        <textarea
          value={spec.body || ''}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'vertical',
            border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusMd ?? 4,
            padding: 10, background: DS.surfaceCanvas,
            ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault, textAlign: 'left',
          }}
        />
      ) : (
        <p style={{ margin: 0, ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault, textAlign: 'left' }}>
          {spec.body}
        </p>
      )}
    </Card>
  );
}

/* ── Dispatcher ─────────────────────────────────────────────────────────────── */

const RENDERERS = {
  kpi: KpiWidget,
  countdown: CountdownWidget,
  timeseries: TimeseriesWidget,
  category_bar: BarsWidget,
  topn: BarsWidget,
  overlap: OverlapWidget,
  funnel: FunnelWidget,
  segment_compare: SegmentCompareWidget,
  histogram: HistogramWidget,
  ratio_gauge: RatioGaugeWidget,
  text_card: TextCardWidget,
};

export const CATALOGUE_TYPES = Object.keys(RENDERERS);

/**
 * The only way a widget reaches the screen. Renders from `spec` alone — `dataKey`
 * points into the pre-computed SERIES, mirroring how the real thing would re-run
 * the resolved spec against fresh data every night.
 */
export function WidgetView({ spec, loading = false, dimmed = false, onBodyChange }) {
  if (loading) return <WidgetSkeleton />;
  if (!spec) return null;

  const Renderer = RENDERERS[spec.type];
  if (!Renderer) {
    // Unreachable by design: the agent only ever emits catalogue types. Kept as a
    // visible guard rather than a silent blank, so a bad spec is obvious.
    return <WidgetEmpty note={`"${spec.type}" is not in the closed catalogue, so there is nothing to render.`} />;
  }

  const data = spec.dataKey ? SERIES[spec.dataKey] : null;
  const isEmpty = Array.isArray(data) && data.length === 0;

  return (
    <div style={{ opacity: dimmed ? 0.45 : 1, transition: 'opacity .2s ease' }}>
      {isEmpty
        ? <WidgetEmpty />
        : <Renderer spec={spec} data={data} onBodyChange={onBodyChange} />}
    </div>
  );
}

export default WidgetView;
