import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Chip } from '../../components/Chip';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/Kpi';
import { StatePreview } from '../../components/StatePreview';
import { Section, Note } from './LoyaltyUI';
import { TierBadge } from './TierBadge';
import { useLang } from './i18n';
import { SNAPSHOT_STATS, TIER_DISTRIBUTION, TOP_ACTIONS, LOYALTY_TIERS } from './loyaltyMock';

const PERIODS = ['30d', '90d', '12m', 'season'];

// ── Custom Recharts tooltip ────────────────────────────────────────────────────
function TierTooltip({ active, payload }) {
  const { t, fmt } = useLang();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: DS.surfaceCanvas, border: `1px solid ${DS.borderDefault}`,
                  borderRadius: DS.radiusLg, padding: '8px 12px', boxShadow: DS.shadowSm }}>
      <TierBadge name={d.tier} color={d.color} size="small" />
      <div style={{ marginTop: 6, ...TY.bodySm, fontFamily: DS.ff, color: DS.textDefault }}>
        <strong style={{ color: DS.textStrong }}>{fmt(d.count)}</strong> {t('dash.fans')}
      </div>
    </div>
  );
}

// ── Loading Skeletons ──────────────────────────────────────────────────────────
// Same shells as the ready state: KPI cards, then two DS sections.
const SKELETON_SHELL = {
  background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl,
  boxShadow: DS.shadowSm, boxSizing: 'border-box',
};

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...SKELETON_SHELL, flex: '1 1 200px', minWidth: 200, minHeight: 112,
                                padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton w={120} h={12} r={3} />
            <Skeleton w={80} h={28} r={4} />
            <Skeleton w={140} h={12} r={3} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
        <div style={{ ...SKELETON_SHELL, padding: '16px 20px 20px', height: 360 }}>
          <Skeleton w={160} h={20} r={4} />
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Skeleton w={200} h={200} r={100} />
          </div>
        </div>
        <div style={{ ...SKELETON_SHELL, padding: '16px 20px 20px', height: 360 }}>
          <Skeleton w={160} h={20} r={4} />
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} w="100%" h={40} r={6} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Widget — DS section with a per-widget error state ─────────────────────────
function Widget({ title, children, error }) {
  const { t } = useLang();
  return (
    <Section title={title}>
      {error ? <Note tone="error">{t('dash.widgetError')}</Note> : children}
    </Section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LoyaltyDashboard() {
  const { t, tr, fmt } = useLang();
  const [pageState, setPageState] = React.useState('ready');
  const [period, setPeriod]       = React.useState('season');

  const stats   = SNAPSHOT_STATS;
  const pts     = stats.points_awarded[period] || 0;
  const manual  = stats.manual_adjustments[period] || 0;

  const th = { ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, padding: '8px 12px', textAlign: 'left', background: DS.surfaceHeader };
  const td = { ...TY.bodyMd, fontFamily: DS.ff, color: DS.textStrong, padding: '10px 12px', borderTop: `1px solid ${DS.borderTableSep}`, fontVariantNumeric: 'tabular-nums' };

  // Custom legend — 8px dots, labelMd, as on Overview
  const renderLegend = ({ payload }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 8 }}>
      {payload.map((entry, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.labelMd, fontFamily: DS.ff, color: DS.textDefault }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          {entry.value}
        </span>
      ))}
    </div>
  );

  function renderContent() {
    if (pageState === 'loading') return <DashboardSkeleton />;

    if (pageState === 'empty') {
      return (
        <EmptyState
          icon={<Ico.Loyalty s={28} c={DS.textSecondary} />}
          title={t('dash.emptyTitle')}
          sub={t('dash.emptySub')}
          cta={null}
        />
      );
    }

    if (pageState === 'error') {
      return <ErrorState title={t('dash.errorTitle')} sub={t('dash.errorSub')} />;
    }

    // ready
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI cards — DS Stat type (no icon / accent) */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <KpiCard label={t('dash.kpi.enrolled')} value={fmt(stats.fans_enrolled)}
            sub={t('dash.kpi.enrolledSub', { n: stats.pct_eligible })} />
          <KpiCard label={t('dash.kpi.coverage')} value={`${stats.pct_eligible}%`}
            sub={t('dash.kpi.coverageSub')} />
          <KpiCard label={t('dash.kpi.points')} value={fmt(pts)} sub={t(`dash.p.${period}`)} />
          <KpiCard label={t('dash.kpi.manual')} value={fmt(manual)} sub={t(`dash.p.${period}`)} />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>

          {/* Donut — Tier distribution */}
          <Widget title={t('dash.tierSplit')}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={TIER_DISTRIBUTION} cx="50%" cy="45%"
                  innerRadius={62} outerRadius={96} paddingAngle={3} dataKey="count" stroke="none">
                  {TIER_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<TierTooltip />} />
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>

            {/* Count summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 8 }}>
              {TIER_DISTRIBUTION.map((d) => (
                <div key={d.tier} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                                           background: DS.surfaceSubtle, borderRadius: DS.radiusLg }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>{fmt(d.count)}</div>
                    <div style={{ ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.textSecondary }}>{d.tier}</div>
                  </div>
                </div>
              ))}
            </div>
          </Widget>

          {/* Top actions table — DS table header + separators */}
          <Widget title={t('dash.topActions')}>
            <div style={{ border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusLg, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>{t('dash.col.action')}</th>
                    <th style={{ ...th, textAlign: 'right' }}>{t('dash.col.events')}</th>
                    <th style={{ ...th, textAlign: 'right' }}>{t('dash.col.points')}</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_ACTIONS.map((row, i) => (
                    <tr key={i}>
                      <td style={td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 28, height: 28, borderRadius: DS.radiusMd, background: DS.brandPrimarySubtle,
                                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Ico.Zap s={14} c={DS.actionPrimary} />
                          </span>
                          <span style={{ color: DS.textDefault }}>{tr(row.action)}</span>
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmt(row.events)}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmt(row.points)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tier legend (reference) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{t('dash.activeTiers')}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LOYALTY_TIERS.map(tier => (
                  <TierBadge key={tier.id} name={tier.name} color={tier.color} size="small" />
                ))}
              </div>
            </div>
          </Widget>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 48 }}>
      <PageHeader
        title={t('dash.title')}
        description={t('dash.desc')}
        actions={pageState === 'ready' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {PERIODS.map(p => (
              <Chip key={p} label={t(`dash.p.${p}`)} selected={period === p} onClick={() => setPeriod(p)} />
            ))}
          </div>
        ) : null}
      />

      {renderContent()}

      <StatePreview groups={[{
        label: t('common.state'),
        value: pageState,
        onChange: setPageState,
        options: [
          { id: 'ready',   label: t('common.ready') },
          { id: 'loading', label: t('common.loading') },
          { id: 'empty',   label: t('common.empty') },
          { id: 'error',   label: t('common.error') },
        ],
      }]} />
    </div>
  );
}
