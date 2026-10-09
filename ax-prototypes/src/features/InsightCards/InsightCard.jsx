/**
 * InsightCard: one card on the Insights page, in one of three forms.
 *
 *   number     big value + % change vs. the comparison
 *   breakdown  top 5 + "Other" as neutral bars (BUILD-CUSTOM, no DS node)
 *   perDay     bar series per day, per week beyond 31 days (BUILD-CUSTOM, recharts)
 *
 * Colour only carries meaning with a comparison (vision guideline): the bars
 * stay neutral, and green/red appears only on the % change.
 *
 * The (i) does not open a Tooltip: the DS caps a Tooltip at one line with no
 * interactive content, and a definition is several lines. It folds a
 * definition section open inside the card instead.
 */
import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Card from '../../components/Card';
import { Btn } from '../../components/Btn';
import IconBtn from '../../components/Iconbtn';
import Tooltip from '../../components/Tooltip';
import ActionMenu from '../../components/ActionMenu';
import Skeleton from '../../components/Skeleton';
import { ErrorState } from '../../components/Feedback';
import { BREAKDOWNS, SOURCES, MEASURES, USERS, DATA_AS_OF } from './mockData';
import { fmt, seriesFor } from './format';


const COMPARISON_LABEL = { lastSeason: 'vs. last season', lastYear: 'vs. same period last year' };
const labelOf = (list, v) => list.find((o) => o.value === v)?.label ?? v;

export function Delta({ current, previous, comparison }) {
  if (comparison === 'none') return null;
  if (previous === null || previous === undefined) {
    return <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textMuted }}>No comparison data</span>;
  }
  if (previous === 0) {
    return <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textMuted }}>New {COMPARISON_LABEL[comparison]}</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct > 0;
  const flat = pct === 0;
  const color = flat ? DS.textSecondary : up ? DS.feedbackSuccess : DS.feedbackDanger;
  const Arrow = flat ? Ico.TrendFlat : up ? Ico.TrendUp : Ico.TrendDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.labelMd, fontFamily: DS.ff, color }}>
      <Arrow s={14} c={color} />
      {up ? '+' : ''}{pct}% <span style={{ color: DS.textSecondary }}>{COMPARISON_LABEL[comparison]}</span>
    </span>
  );
}

export function BreakdownBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr auto', alignItems: 'center', gap: 10 }}>
          <span title={r.label} style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
          <div style={{ height: 6, borderRadius: 3, background: DS.surfaceMuted }}>
            <div style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, height: '100%', borderRadius: 3, background: DS.textMuted }} />
          </div>
          <span style={{ ...TY.bodySmBold, fontFamily: DS.ff, color: DS.textStrong, textAlign: 'right' }}>{r.value.toLocaleString('en-US')}</span>
        </div>
      ))}
    </div>
  );
}


export function PerDayChart({ period, height = 96 }) {
  const { data } = seriesFor(period);
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="x" hide />
          <ChartTooltip
            cursor={{ fill: DS.surfaceSubtle }}
            formatter={(v) => [v.toLocaleString('en-US'), 'Tickets']}
            labelFormatter={() => ''}
            contentStyle={{ fontFamily: DS.ff, fontSize: 12, borderRadius: 6, border: `1px solid ${DS.borderDefault}` }}
          />
          <Bar dataKey="v" fill={DS.actionPrimary} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Definition({ card }) {
  const user = USERS[card.createdBy];
  const row = (k, v) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <span style={{ color: DS.textMuted, minWidth: 76 }}>{k}</span>
      <span style={{ color: DS.textDefault }}>{v}</span>
    </div>
  );
  return (
    <div style={{ background: DS.surfaceSubtle, borderRadius: DS.radiusLg, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, ...TY.bodySm, fontFamily: DS.ff }}>
      {row('Source', labelOf(SOURCES, card.source))}
      {row('Conditions', card.conditions.join(' AND '))}
      {row('Measure', labelOf(MEASURES, card.measure))}
      {user && row('Created by', `${user.name}, ${card.createdAt}`)}
    </div>
  );
}

export function CardBody({ card, period, comparison }) {
  if (card.form === 'breakdown') return <BreakdownBars rows={BREAKDOWNS[card.breakdown] ?? BREAKDOWNS.cities} />;
  const [current, previous] = card.values?.[period] ?? [card.value ?? 0, null];
  const cmp = card.comparison === 'none' ? 'none' : comparison;
  if (card.form === 'perDay') {
    const { unit, data } = seriesFor(period);
    const last = data[data.length - 1].v;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <PerDayChart period={period} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ ...TY.titleMd, fontFamily: DS.ff, color: DS.textStrong }}>{last.toLocaleString('en-US')}</span>
          <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{unit === 'week' ? 'this week' : 'today'}</span>
        </div>
        <div style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>
          {fmt(current, card.measure)} in total · <Delta current={current} previous={previous} comparison={cmp} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ ...TY.headlineLg, fontFamily: DS.ff, color: DS.textStrong }}>{fmt(current, card.measure)}</span>
      <Delta current={current} previous={previous} comparison={cmp} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton w="60%" h={14} />
      <Skeleton w="40%" h={28} />
      <Skeleton w="50%" h={12} />
    </Card>
  );
}

export default function InsightCard({ card, period, comparison, tabs, highlight, onEdit, onDuplicate, onMove, onDelete, onOpenSegment }) {
  const [showDef, setShowDef] = React.useState(false);
  const [failed, setFailed] = React.useState(!!card.loadError);
  const [retrying, setRetrying] = React.useState(false);

  const retry = () => {
    setRetrying(true);
    setTimeout(() => { setRetrying(false); setFailed(false); }, 900);
  };

  const countsPeople = card.measure === 'people' && card.form === 'number';
  const value = card.values?.[period]?.[0] ?? card.value;

  const menu = [
    { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(card) },
    { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => onDuplicate(card) },
    ...tabs.filter((t) => t.id !== card.tab).map((t) => ({
      label: `Move to ${t.name}`, icon: <Ico.ArrowBack s={16} c={DS.textSecondary} />, onClick: () => onMove(card, t.id),
    })),
    { label: 'Delete', icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: () => onDelete(card), danger: true },
  ];

  let body;
  if (card.noAccess) {
    body = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.bodySm, fontFamily: DS.ff, color: DS.textMuted, padding: '8px 0' }}>
        <Ico.Eye s={16} c={DS.textMuted} />
        No access to this data. Ask an admin for access to {labelOf(SOURCES, card.source)}.
      </div>
    );
  } else if (retrying) {
    body = <Skeleton w="45%" h={28} />;
  } else if (failed) {
    body = <ErrorState title="Couldn't load this number." retryLabel="Retry" onRetry={retry} />;
  } else {
    body = <CardBody card={card} period={period} comparison={comparison} />;
  }

  return (
    <div style={{
      borderRadius: DS.radiusXl,
      boxShadow: highlight ? `0 0 0 2px ${DS.actionPrimary}` : 'none',
      transition: 'box-shadow 1.2s ease',
    }}>
      <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
          <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: DS.textStrong, flex: 1, minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={card.title}>
            {card.title}
          </span>
          <Tooltip label={showDef ? 'Hide definition' : 'How this number is defined'}>
            <IconBtn icon={<Ico.Info s={16} />} kind="Ghost" size="Sm" active={showDef} aria-label="Definition" onClick={() => setShowDef((s) => !s)} />
          </Tooltip>
          <ActionMenu items={menu} size="Sm" width={220} />
        </div>

        {body}

        {showDef && <Definition card={card} />}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 28 }}>
          <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>Data as of {DATA_AS_OF}</span>
          {countsPeople && !card.noAccess && !failed && (
            <Btn type="Ghost" size="Sm" iconRight={<Ico.ChevRight s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }}
                 onClick={() => onOpenSegment(card, value)}>
              Open as segment
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}
