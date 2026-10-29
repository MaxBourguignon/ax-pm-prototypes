/**
 * CardAll: one card on the all-batches Insights page.
 *
 *   number      value + a fixed comparison per shop                   Batch 1
 *   breakdown   top 5 + "Other" as bars or a donut                     Batch 1
 *   share       value as a share of a base, % bar                      Batch 1
 *   perDay      bar series per day                                     Batch 2
 *   target      value + progress bar towards a target                  Batch 2
 *   countdown   days until an event                                    Batch 2
 *   manualData  own values added up, multiplied or divided             Batch 2
 *   text        plain text                                             Batch 2
 *
 * Progress colours follow the current Fanalists start page: red under 30%,
 * blue from 30%, green from 70%.
 */
import React from 'react';
import { DS, TY } from '../../../utils/designSystem';
import Ico from '../../../utils/icons';
import Card from '../../../components/Card';
import { Btn } from '../../../components/Btn';
import IconBtn from '../../../components/Iconbtn';
import Tooltip from '../../../components/Tooltip';
import ActionMenu from '../../../components/ActionMenu';
import { PerDayChart } from '../InsightCard';
import {
  USERS, compareShort, compareLabel, EVENTS, OPS, manualResult, comparisonOf, sourceOf, measureOf, rowsFor,
} from './mockDataAll';
import { has } from './batches';

const labelOf = (list, v) => list.find((o) => o.value === v)?.label ?? v;

const fmtValue = (n, measureOrUnit) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  if (measureOrUnit === 'revenue' || measureOrUnit === 'eur') {
    const decimals = Math.abs(n) < 1000 && n % 1 !== 0 ? 2 : 0;
    return `€ ${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }
  if (measureOrUnit === 'pct') return `${(n * 100).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
  return n.toLocaleString('en-US', { maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
};

const pctColor = (pct) => (pct < 30 ? DS.feedbackDanger : pct < 70 ? DS.actionPrimary : DS.feedbackSuccess);

export function ProgressBar({ pct }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: DS.surfaceMuted, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, Math.max(2, pct))}%`, height: '100%', borderRadius: 3, background: pctColor(pct) }} />
    </div>
  );
}

function Variation({ value, prev }) {
  if (prev === null || prev === undefined) {
    return <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textMuted }}>No earlier count yet</span>;
  }
  const diff = value - prev;
  const pct = prev ? Math.round((diff / prev) * 1000) / 10 : 0;
  const color = diff === 0 ? DS.textSecondary : diff > 0 ? DS.feedbackSuccess : DS.feedbackDanger;
  const Arrow = diff === 0 ? Ico.TrendFlat : diff > 0 ? Ico.TrendUp : Ico.TrendDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.labelMd, fontFamily: DS.ff, color }}>
      <Arrow s={14} c={color} />
      {diff > 0 ? '+' : ''}{diff.toLocaleString('en-US')} ({diff > 0 ? '+' : ''}{pct}%)
    </span>
  );
}

const Big = ({ children }) => (
  <span style={{ ...TY.headlineLg, fontFamily: DS.ff, color: DS.textStrong }}>{children}</span>
);
const Small = ({ children, style }) => (
  <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, ...style }}>{children}</span>
);

/* A row opens as a segment (Batch 3) when the card counts people; "Other"
   is a remainder, not a value, so it does not. */
const rowProps = (r, onRow) => (onRow && r.label !== 'Other'
  ? { onClick: () => onRow(r), title: `Open ${r.label} as a segment`, style: { cursor: 'pointer' } }
  : { style: {} });

function BreakdownBars({ rows, measure, onRow }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label} {...rowProps(r, onRow)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr auto', alignItems: 'center', gap: 10, ...rowProps(r, onRow).style }}>
          <span title={r.label} style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
          <div style={{ height: 6, borderRadius: 3, background: DS.surfaceMuted }}>
            <div style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, height: '100%', borderRadius: 3, background: DS.textMuted }} />
          </div>
          <span style={{ ...TY.bodySmBold, fontFamily: DS.ff, color: DS.textStrong, textAlign: 'right' }}>{fmtValue(r.value, measure)}</span>
        </div>
      ))}
    </div>
  );
}

/* The donut uses the brand blue in steps, with "Other" in grey, so the
   segments stay one family and the legend carries the labels. */
const DONUT_COLORS = [DS.blue600, DS.blue400, DS.blue300, DS.blue200, DS.blue100];

function BreakdownDonut({ rows, measure, onRow }) {
  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  const R = 34; const C = 2 * Math.PI * R;
  let offset = 0;
  const color = (r, i) => (r.label === 'Other' ? DS.neutral300 : DONUT_COLORS[i % DONUT_COLORS.length]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={96} height={96} viewBox="0 0 96 96" style={{ flexShrink: 0 }} role="img" aria-label="Donut chart">
        <g transform="rotate(-90 48 48)">
          {rows.map((r, i) => {
            const len = (r.value / total) * C;
            const seg = <circle key={r.label} cx={48} cy={48} r={R} fill="none" stroke={color(r, i)} strokeWidth={14}
                                strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`} strokeDashoffset={-offset} />;
            offset += len;
            return seg;
          })}
        </g>
      </svg>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <div key={r.label} {...rowProps(r, onRow)} style={{ display: 'flex', alignItems: 'center', gap: 8, ...rowProps(r, onRow).style }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: color(r, i), flexShrink: 0 }} />
            <span title={r.label} style={{ flex: 1, minWidth: 0, ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
            <span style={{ ...TY.bodySmBold, fontFamily: DS.ff, color: DS.textStrong }}>{fmtValue(r.value, measure)}</span>
            <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted, width: 32, textAlign: 'right' }}>{Math.round((r.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardBodyAll({ card, comparison, onRow }) {
  const prev = card.prev?.[comparison];
  const variation = comparison === 'none' ? null : (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <Variation value={card.value} prev={prev} /> <Small>{compareShort(card, comparison)}</Small>
    </span>
  );

  switch (card.kind) {
    case 'breakdown': {
      const Chart = card.chart === 'donut' ? BreakdownDonut : BreakdownBars;
      return <Chart rows={rowsFor(card.source, card.split)} measure={card.measure} onRow={onRow} />;
    }

    case 'share': {
      const pct = card.base?.value ? (card.value / card.base.value) * 100 : 0;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Big>{fmtValue(card.value, card.measure)}</Big>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Small>of {card.base?.value?.toLocaleString('en-US')} {card.base?.label}</Small>
            <Small style={{ color: DS.textStrong }}>{Math.round(pct)}%</Small>
          </div>
          <ProgressBar pct={pct} />
          {variation}
        </div>
      );
    }

    case 'perDay':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <PerDayChart period="month" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ ...TY.titleMd, fontFamily: DS.ff, color: DS.textStrong }}>{fmtValue(card.value, card.measure)}</span>
            <Small>in the last 31 days</Small>
          </div>
          {variation}
        </div>
      );

    case 'target': {
      const pct = card.target ? (card.value / card.target) * 100 : 0;
      const left = card.target - card.value;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Big>{fmtValue(card.value, card.measure)}</Big>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <Small>Target {fmtValue(card.target, card.measure)}</Small>
            <Small style={{ color: DS.textStrong }}>{Math.round(pct)}%</Small>
          </div>
          <ProgressBar pct={pct} />
          <Small>{left > 0 ? `${fmtValue(left, card.measure)} to go` : `Target reached, ${fmtValue(-left, card.measure)} above`}</Small>
        </div>
      );
    }

    case 'countdown': {
      const ev = EVENTS.find((e) => e.value === card.event) ?? EVENTS[0];
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((Date.parse(`${ev.date}T00:00:00`) - today.getTime()) / 864e5);
      const nice = new Date(`${ev.date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Big>{days > 0 ? `${days} days` : days === 0 ? 'Today' : 'Played'}</Big>
          <Small>{ev.label}, {nice}</Small>
        </div>
      );
    }

    case 'manualData': {
      const result = manualResult(card);
      const sign = OPS.find((o) => o.value === card.op)?.sign ?? '+';
      const pct = card.target ? (result / card.target) * 100 : null;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Big>{fmtValue(result, card.unit)}</Big>
          {pct !== null && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <Small>Target {fmtValue(card.target, card.unit)}</Small>
                <Small style={{ color: DS.textStrong }}>{Math.round(pct)}%</Small>
              </div>
              <ProgressBar pct={pct} />
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: DS.surfaceSubtle, borderRadius: DS.radiusLg, padding: '8px 10px' }}>
            {card.entries.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, ...TY.bodySm, fontFamily: DS.ff }}>
                <span style={{ width: 12, color: DS.textMuted }}>{i > 0 ? sign : ''}</span>
                <span style={{ flex: 1, color: DS.textSecondary }}>{e.label}</span>
                <span style={{ color: DS.textStrong }}>{Number(e.value).toLocaleString('en-US')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'text':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...TY.bodySm, fontFamily: DS.ff, color: DS.textDefault }}>
          {(card.text ?? '').split('\n').map((l, i) => <span key={i}>{l}</span>)}
        </div>
      );

    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Big>{fmtValue(card.value, card.measure)}</Big>
          {variation}
        </div>
      );
  }
}

function Definition({ card, batch }) {
  const user = USERS[card.createdBy];
  const row = (k, v) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ color: DS.textMuted, minWidth: 76 }}>{k}</span>
      <span style={{ color: DS.textDefault }}>{v}</span>
    </div>
  );
  const manual = card.kind === 'manualData' || card.kind === 'text';
  return (
    <div style={{ background: DS.surfaceSubtle, borderRadius: DS.radiusLg, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, ...TY.bodySm, fontFamily: DS.ff }}>
      {manual ? row('Source', 'Manual entry') : row('Source', sourceOf(card.source)?.label ?? card.source)}
      {card.conditions && row('Conditions', card.conditions.join(' AND '))}
      {card.measure && row('Measure', measureOf(card.source, card.measure)?.label ?? card.measure)}
      {card.kind === 'breakdown' && row('Split by', card.split)}
      {card.kind === 'breakdown' && row('Drawn as', card.chart === 'donut' ? 'Donut' : 'Bars')}
      {card.kind === 'perDay' && row('Per day of', sourceOf(card.source)?.dateField)}
      {card.kind === 'share' && row('Share of', `all ${card.base?.label ?? sourceOf(card.source)?.noun}`)}
      {card.prev && row('Compared with', compareLabel(card, comparisonOf(card, batch)))}
      {card.kind !== 'manualData' && card.target && row('Target', fmtValue(card.target, card.measure ?? card.unit))}
      {card.kind === 'manualData' && row('Calculation', labelOf(OPS, card.op))}
      {user && row(manual ? 'Entered by' : 'Created by', `${user.name}, ${card.createdAt}`)}
    </div>
  );
}

export default function CardAll({
  card, batch, tabs, highlight, onEdit, onDuplicate, onMove, onDelete, onOpenSegment,
  dragProps, dragging, dropHint,
}) {
  const [showDef, setShowDef] = React.useState(false);
  const canSegment = has(batch, 'segment') && card.measure === 'people' && ['number', 'share', 'breakdown'].includes(card.kind);
  /* On a breakdown each row is its own group: the card's conditions plus "split is row". */
  const openRow = canSegment && card.kind === 'breakdown'
    ? (r) => onOpenSegment({ ...card, value: r.value, conditions: [...(card.conditions ?? []), `${card.split} is ${r.label}`] })
    : undefined;
  const manual = card.kind === 'manualData' || card.kind === 'text';
  const dnd = has(batch, 'dnd');

  const menu = [
    { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(card) },
    { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => onDuplicate(card) },
    ...tabs.filter((t) => t.id !== card.tab).map((t) => ({
      label: `Move to ${t.name}`, icon: <Ico.ArrowBack s={16} c={DS.textSecondary} />, onClick: () => onMove(card, t.id),
    })),
    { label: 'Delete', icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: () => onDelete(card), danger: true },
  ];

  return (
    <div
      {...(dnd ? dragProps : {})}
      style={{
        borderRadius: DS.radiusXl,
        opacity: dragging ? 0.4 : 1,
        boxShadow: highlight || dropHint ? `0 0 0 2px ${DS.actionPrimary}` : 'none',
        transition: 'box-shadow 1.2s ease',
      }}
    >
      <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          {dnd && (
            <span title="Drag to move" style={{ cursor: 'grab', paddingTop: 2, display: 'flex' }}>
              <Ico.Drag s={16} c={DS.textMuted} />
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: DS.textStrong }} title={card.title}>{card.title}</span>
            {card.subtitle && <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>{card.subtitle}</span>}
          </div>
          <Tooltip label={showDef ? 'Hide definition' : 'How this card is defined'}>
            <IconBtn icon={<Ico.Info s={16} />} kind="Ghost" size="Sm" active={showDef} aria-label="Definition" onClick={() => setShowDef((s) => !s)} />
          </Tooltip>
          <ActionMenu items={menu} size="Sm" width={220} />
        </div>

        <CardBodyAll card={card} comparison={comparisonOf(card, batch)} onRow={openRow} />

        {showDef && <Definition card={card} batch={batch} />}

        {/* No refresh time on the card: cards run on the warehouse copy of the
            client's data, so freshness depends on the import, not the card run. */}
        {(manual || canSegment) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 28 }}>
            <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>
              {manual ? `Manual entry · ${USERS[card.createdBy]?.name ?? ''}` : ''}
            </span>
            {canSegment && card.kind === 'breakdown' && (
              <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>Click a row to open it as a segment</span>
            )}
            {canSegment && card.kind !== 'breakdown' && (
              <Btn type="Ghost" size="Sm" iconRight={<Ico.ArrowRightSmall s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }}
                   onClick={() => onOpenSegment(card)}>
                Open as segment
              </Btn>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
