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
import Card from '../../components/Card';
import { TierBadge } from './TierBadge';
import { SNAPSHOT_STATS, TIER_DISTRIBUTION, TOP_ACTIONS, LOYALTY_TIERS } from './loyaltyMock';

const PERIODS = [
  { id: '30d',    label: '30 derniers jours' },
  { id: '90d',    label: '90 derniers jours' },
  { id: '12m',    label: '12 derniers mois' },
  { id: 'season', label: 'Saison en cours' },
];

function fmt(n) {
  return n.toLocaleString('fr-BE');
}

// ── Custom Recharts tooltip ────────────────────────────────────────────────────
function TierTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                  borderRadius: 8, padding: '8px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <TierBadge name={d.tier} color={d.color} size="small" />
      <div style={{ marginTop: 6, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
        <strong>{fmt(d.count)}</strong> fans
      </div>
    </div>
  );
}

// ── Loading Skeletons ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Period selector skeleton */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[100, 120, 110, 130].map((w, i) => <Skeleton key={i} w={w} h={32} r={10} />)}
      </div>
      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: '1 1 200px', minWidth: 200, minHeight: 110,
                                background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                                borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton w={120} h={14} r={3} />
            <Skeleton w={80} h={28} r={4} />
            <Skeleton w={140} h={12} r={3} />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 10, padding: 24, height: 320 }}>
          <Skeleton w={160} h={18} r={4} />
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Skeleton w={240} h={240} r={120} />
          </div>
        </div>
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 10, padding: 24, height: 320 }}>
          <Skeleton w={160} h={18} r={4} />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} w="100%" h={48} r={6} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Widget wrapper with per-widget error state ─────────────────────────────────
function Widget({ title, icon: Icon, children, error }) {
  return (
    <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && <Icon s={18} c={DS.actionPrimary} />}
        <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</span>
      </div>
      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                      background: DS.feedbackErrorBg, borderRadius: 6 }}>
          <Ico.Alert s={16} c={DS.feedbackError} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackErrorText }}>
            Données temporairement indisponibles
          </span>
        </div>
      ) : children}
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LoyaltyDashboard() {
  const [pageState, setPageState] = React.useState('ready');
  const [period, setPeriod]       = React.useState('season');

  const stats   = SNAPSHOT_STATS;
  const pts     = stats.points_awarded[period] || 0;
  const manual  = stats.manual_adjustments[period] || 0;

  // Render custom legend entry
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 8 }}>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  function renderContent() {
    if (pageState === 'loading') return <DashboardSkeleton />;

    if (pageState === 'empty') {
      return (
        <EmptyState
          icon={<Ico.Chart s={28} c={DS.textSecondary} />}
          title="Aucune donnée disponible"
          sub="Activez un programme de fidélité pour commencer à collecter des données et visualiser les KPIs."
          cta={null}
        />
      );
    }

    if (pageState === 'error') {
      return (
        <ErrorState
          title="Impossible de charger le dashboard"
          sub="Une erreur est survenue lors du chargement des données de fidélité."
        />
      );
    }

    // ready
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Period selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>Période :</span>
          {PERIODS.map(p => (
            <Chip key={p.id} label={p.label} selected={period === p.id}
              onClick={() => setPeriod(p.id)} />
          ))}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <KpiCard
            title="Fans inscrits"
            value={fmt(stats.fans_enrolled)}
            sub={`${stats.pct_eligible}% du segment éligible`}
            icon={<Ico.Users s={18} c={DS.actionPrimary} />}
            accent={DS.actionPrimary}
          />
          <KpiCard
            title="% segment couvert"
            value={`${stats.pct_eligible}%`}
            sub="Part du segment avec un solde de points"
            icon={<Ico.Chart s={18} c={DS.teal500} />}
            accent={DS.teal500}
          />
          <KpiCard
            title="Points attribués"
            value={fmt(pts)}
            sub={PERIODS.find(p => p.id === period)?.label}
            icon={<Ico.Star s={18} c={DS.feedbackWarning} />}
            accent={DS.feedbackWarning}
          />
          <KpiCard
            title="Ajustements manuels"
            value={fmt(manual)}
            sub={PERIODS.find(p => p.id === period)?.label}
            icon={<Ico.Edit s={18} c={DS.textSecondary} />}
            accent={DS.textSecondary}
          />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Donut — Tier distribution */}
          <Widget title="Répartition par tier" icon={Ico.Donut}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={TIER_DISTRIBUTION} cx="50%" cy="45%"
                  innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="count">
                  {TIER_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<TierTooltip />} />
                <Legend content={renderLegend} formatter={(v) => v} />
              </PieChart>
            </ResponsiveContainer>

            {/* Count summary */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {TIER_DISTRIBUTION.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '8px 12px', background: DS.bgSurface,
                                      borderRadius: 8, flex: '1 1 100px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{fmt(t.count)}</div>
                    <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{t.tier}</div>
                  </div>
                </div>
              ))}
            </div>
          </Widget>

          {/* Top actions table */}
          <Widget title="Top actions (points attribués)" icon={Ico.Zap}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0,
                          border: `1px solid ${DS.borderDefault}`, borderRadius: 8, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px',
                            background: DS.blue100, padding: '10px 16px' }}>
                {['Action', 'Événements', 'Points totaux'].map((h, i) => (
                  <span key={i} style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                                          textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>

              {TOP_ACTIONS.map((row, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 120px',
                  padding: '14px 16px', alignItems: 'center',
                  borderTop: i > 0 ? `1px solid ${DS.borderDefault}` : 'none',
                  background: DS.bgCard,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: DS.bgIcons,
                                   display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ico.Zap s={14} c={DS.actionPrimary} />
                    </span>
                    <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{row.action}</span>
                  </div>
                  <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{fmt(row.events)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico.Star s={14} c={DS.feedbackWarning} />
                    <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600 }}>
                      {fmt(row.points)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier legend (reference) */}
            <div style={{ marginTop: 8 }}>
              <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 8 }}>
                Tiers actifs
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LOYALTY_TIERS.map(t => (
                  <TierBadge key={t.id} name={t.name} color={t.color} size="small" />
                ))}
              </div>
            </div>
          </Widget>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <PageHeader
        icon={<Ico.Chart s={20} c={DS.actionPrimary} />}
        title="Dashboard Loyalty"
        description="Suivez la dynamique du programme de fidélité et la répartition des fans par tier."
      />

      <div style={{ padding: 24 }}>
        {renderContent()}
      </div>

      <StatePreview groups={[{
        label: 'État',
        value: pageState,
        onChange: setPageState,
        options: [
          { id: 'ready',   label: 'Prêt' },
          { id: 'loading', label: 'Chargement' },
          { id: 'empty',   label: 'Vide' },
          { id: 'error',   label: 'Erreur' },
        ],
      }]} />
    </div>
  );
}
