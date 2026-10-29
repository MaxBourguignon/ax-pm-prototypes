/**
 * Loyalty — Rewards page (/loyalty/rewards).
 * Post-MVP exploration: the MVP spec puts point consumption and rewards out of
 * scope (loyalty_reward, redeem_reward(), fulfilment, stock). Flagged in the header.
 *   KPI row · catalogue (filter by distribution, create / edit / duplicate / delete, activate).
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Toggle } from '../../components/Controls';
import { StatusBadge } from '../../components/Tag';
import { Chip } from '../../components/Chip';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/Kpi';
import { Toast } from '../../components/Toast';
import { ActionMenu } from '../../components/ActionMenu';
import { StatePreview } from '../../components/StatePreview';
import Card from '../../components/Card';
import { TierBadge } from './TierBadge';
import { RewardModal } from './RewardModal';
import { DISTRIBUTIONS } from './rewardDistributions';
import { useLang } from './i18n';
import { REWARDS, REWARD_STATS, LOYALTY_TIERS } from './loyaltyMock';

let _uid = 1;
const copyId = () => `copy-${_uid++}`;

const LOW_STOCK_RATIO = 0.2;

function RewardRow({ reward, tiers, onToggle, onEdit, onDuplicate, onDelete }) {
  const { t, tr, fmt } = useLang();
  const tier = tiers.find(x => x.id === reward.minTier);
  const dist = DISTRIBUTIONS.find(d => d.id === reward.distribution);
  const DistIcon = dist.icon;
  const limited = reward.stock !== null && reward.stock !== undefined;
  const low = limited && reward.stockLeft <= reward.stock * LOW_STOCK_RATIO;
  const isActive = reward.status === 'active';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px minmax(240px, 1fr) 110px 120px 140px 40px 32px', gap: 16,
                  alignItems: 'center', padding: '12px 16px', borderRadius: 8,
                  border: `1px solid ${DS.borderDefault}`, background: isActive ? DS.bgCard : DS.bgSurface }}>
      <span style={{ width: 40, height: 40, borderRadius: 8, background: DS.bgIcons, display: 'flex',
                     alignItems: 'center', justifyContent: 'center' }}>
        <Ico.Medal s={20} c={DS.actionPrimary} />
      </span>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: DS.textStrong }}>{tr(reward.name)}</span>
          {!isActive && <StatusBadge status="inactive">{t('rw.draft')}</StatusBadge>}
        </div>
        <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tr(reward.description)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
                      ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.textSecondary }}>
          <DistIcon s={12} c={DS.textSecondary} />
          <span style={{ whiteSpace: 'nowrap' }}>{t(`rw.dist.${reward.distribution}`)}</span>
          <span>·</span>
          <span style={{ whiteSpace: 'nowrap' }}>{t('rw.redeemed', { n: fmt(reward.redeemed) })}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Ico.Star s={14} c={DS.feedbackWarning} />
        <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: DS.textStrong, whiteSpace: 'nowrap' }}>{fmt(reward.cost)} pts</span>
      </div>

      <div>
        {tier ? <TierBadge name={`${tier.name}+`} color={tier.color} size="small" />
              : <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>{t('rw.allMembers')}</span>}
      </div>

      <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: low ? DS.feedbackWarning : DS.textSecondary }}>
        {limited ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {low && <Ico.Warn s={14} c={DS.feedbackWarning} />}
            {t('rw.stockLeft', { n: fmt(reward.stockLeft) })} / {fmt(reward.stock)}
          </span>
        ) : t('common.unlimited')}
      </div>

      <Toggle on={isActive} onChange={onToggle} />

      <ActionMenu items={[
        { label: t('common.edit'), icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: onEdit },
        { label: t('common.duplicate'), icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: onDuplicate },
        { label: t('common.delete'), icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: onDelete, danger: true },
      ]} />
    </div>
  );
}

function RewardsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: '1 1 200px', minHeight: 110, background: DS.bgCard, borderRadius: 10,
                                border: `1px solid ${DS.borderDefault}`, padding: 16, display: 'flex',
                                flexDirection: 'column', gap: 10 }}>
            <Skeleton w={120} h={14} r={3} /><Skeleton w={80} h={28} r={4} /><Skeleton w={140} h={12} r={3} />
          </div>
        ))}
      </div>
      <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} w="100%" h={64} r={8} />)}
      </Card>
    </div>
  );
}

export default function LoyaltyRewards() {
  const { t, fmt } = useLang();
  const [pageState, setPageState] = React.useState('ready');
  const [rewards, setRewards]     = React.useState(REWARDS.map(r => ({ ...r })));
  const [filter, setFilter]       = React.useState('all');
  const [modal, setModal]         = React.useState(null); // null | 'new' | reward
  const [toast, setToast]         = React.useState(null);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const tiers = LOYALTY_TIERS;

  const visible = filter === 'all' ? rewards : rewards.filter(r => r.distribution === filter);
  const activeCount = rewards.filter(r => r.status === 'active').length;
  const spentPct = Math.round((REWARD_STATS.points_spent / REWARD_STATS.points_awarded) * 100);

  function saveReward(r) {
    const exists = rewards.some(x => x.id === r.id);
    setRewards(prev => exists ? prev.map(x => x.id === r.id ? r : x) : [...prev, r]);
    notify(exists ? t('rw.updated') : t('rw.created'));
    setModal(null);
  }

  function renderContent() {
    if (pageState === 'loading') return <RewardsSkeleton />;
    if (pageState === 'error') return <ErrorState title={t('rw.errorTitle')} sub={t('rw.errorSub')} />;
    if (pageState === 'empty') {
      return (
        <EmptyState icon={<Ico.Medal s={28} c={DS.textSecondary} />} title={t('rw.emptyTitle')} sub={t('rw.emptySub')}
          cta={<Btn type="Primary" iconLeft={<Ico.Plus s={16} />} onClick={() => setModal('new')}>{t('rw.new')}</Btn>} />
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <KpiCard title={t('rw.kpi.active')} value={fmt(activeCount)} sub={t('rw.kpi.activeSub', { n: rewards.length })}
            icon={<Ico.Medal s={18} c={DS.actionPrimary} />} accent={DS.actionPrimary} />
          <KpiCard title={t('rw.kpi.redeemed')} value={fmt(REWARD_STATS.redeemed)} sub={t('rw.kpi.redeemedSub')}
            icon={<Ico.Check s={18} c={DS.teal500} />} accent={DS.teal500} />
          <KpiCard title={t('rw.kpi.spent')} value={fmt(REWARD_STATS.points_spent)} sub={t('rw.kpi.spentSub', { n: spentPct })}
            icon={<Ico.Star s={18} c={DS.feedbackWarning} />} accent={DS.feedbackWarning} />
        </div>

        <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{t('rw.catalog')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>{t('rw.filter')}</span>
              <Chip label={t('common.all')} selected={filter === 'all'} onClick={() => setFilter('all')} />
              {DISTRIBUTIONS.map(d => (
                <Chip key={d.id} label={t(`rw.dist.${d.id}`)} selected={filter === d.id} onClick={() => setFilter(d.id)} />
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, padding: '24px 0' }}>{t('rw.noMatch')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.map(r => (
                <RewardRow key={r.id} reward={r} tiers={tiers}
                  onToggle={v => setRewards(prev => prev.map(x => x.id === r.id ? { ...x, status: v ? 'active' : 'draft' } : x))}
                  onEdit={() => setModal(r)}
                  onDuplicate={() => { setRewards(prev => [...prev, { ...r, id: copyId(), status: 'draft', redeemed: 0 }]); notify(t('rw.duplicated')); }}
                  onDelete={() => { setRewards(prev => prev.filter(x => x.id !== r.id)); notify(t('rw.deleted')); }} />
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <PageHeader
        icon={<Ico.Medal s={20} c={DS.actionPrimary} />}
        title={t('rw.title')}
        description={t('rw.desc')}
        actions={
          <>
            <StatusBadge status="info">{t('rw.postMvp')}</StatusBadge>
            {pageState === 'ready' && (
              <Btn type="Primary" iconLeft={<Ico.Plus s={16} />} onClick={() => setModal('new')}>{t('rw.new')}</Btn>
            )}
          </>
        }
      />

      <div style={{ padding: 24 }}>
        {renderContent()}
      </div>

      <RewardModal open={modal !== null} reward={modal === 'new' ? null : modal} tiers={tiers}
        onClose={() => setModal(null)} onSave={saveReward} />

      <Toast toast={toast} />

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
