import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import { Select } from '../../components/Select';
import { Toggle } from '../../components/Controls';
import { StatusBadge } from '../../components/Tag';
import { Skeleton } from '../../components/Skeleton';
import { EmptyState, ErrorState } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { Toast } from '../../components/Toast';
import { StatePreview } from '../../components/StatePreview';
import { Tabs } from '../../components/Tabs';
import { Section, HeadRow, Note } from './LoyaltyUI';
import { ActionMenu } from '../../components/ActionMenu';
import { TierTable } from './TierTable';
import { ActionRuleModal } from './ActionRuleModal';
import { useLang } from './i18n';
import { LOYALTY_PROGRAM, LOYALTY_TIERS, LOYALTY_RULES, SEGMENTS } from './loyaltyMock';

const TABS = [
  { value: 'programme', label: 'settings.tab.programme' },
  { value: 'tiers',     label: 'settings.tab.tiers' },
  { value: 'rules',     label: 'settings.tab.rules' },
];

function LoadingSkeleton() {
  return (
    <Section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton w={180} h={20} r={4} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[200, 160, 220, 140].map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton w={80} h={12} r={3} />
              <Skeleton w={w} h={40} r={6} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── Programme Tab ─────────────────────────────────────────────────────────────

function ProgrammeTab({ programme, setProgramme, errors, setErrors, notify }) {
  const { t, tr } = useLang();
  const isActive = programme.status === 'active';

  function validate() {
    const e = {};
    if (!programme.name.trim()) e.name = t('prog.err.name');
    if (!programme.start_date)  e.start_date = t('prog.err.start');
    if (!programme.eligible_segment) e.eligible_segment = t('prog.err.segment');
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleToggle() {
    if (isActive) {
      setProgramme(p => ({ ...p, status: 'inactive' }));
      notify(t('prog.deactivated'));
    } else {
      if (!validate()) return;
      setProgramme(p => ({ ...p, status: 'active' }));
      notify(t('prog.activated'));
    }
  }

  function set(field, value) {
    setProgramme(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  return (
    <Section title={t('prog.title')} sub={t('prog.sub')}>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '12px 16px', background: DS.surfaceSubtle, borderRadius: DS.radiusLg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textSecondary }}>{t('prog.status')}</span>
          <StatusBadge status={isActive ? 'active' : 'inactive'}>
            {isActive ? t('prog.active') : t('prog.inactive')}
          </StatusBadge>
        </div>
        <Btn type={isActive ? 'Secondary' : 'Primary'} size="Medium"
          iconLeft={isActive ? <Ico.Cross s={16} /> : <Ico.Check s={16} />}
          onClick={handleToggle}>
          {isActive ? t('prog.deactivate') : t('prog.activate')}
        </Btn>
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Field label={t('prog.name')}
          value={programme.name}
          onChange={e => set('name', e.target.value)}
          placeholder={t('prog.namePh')}
          error={errors.name} />

        <Select label={t('prog.segment')}
          value={programme.eligible_segment}
          options={SEGMENTS.map(o => ({ ...o, label: tr(o.label) }))}
          onChange={v => set('eligible_segment', v)}
          placeholder={t('prog.segmentPh')} />

        <div>
          <Field label={t('prog.start')}
            type="date" value={programme.start_date || ''}
            onChange={e => set('start_date', e.target.value)}
            disabled={isActive}
            error={errors.start_date} />
          {isActive && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.Info s={12} c={DS.textSecondary} />
              <span style={{ ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.textSecondary }}>
                {t('prog.startLocked')}
              </span>
            </div>
          )}
        </div>

        <Field label={t('prog.expiry')}
          type="number" value={programme.expiration_months === null ? '' : String(programme.expiration_months)}
          onChange={e => set('expiration_months', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          placeholder={t('prog.expiryPh')} />
      </div>

      {errors.eligible_segment && (
        <span style={{ ...TY.labelMd, fontWeight: 400, fontFamily: DS.ff, color: DS.feedbackError, marginTop: -8 }}>
          {errors.eligible_segment}
        </span>
      )}

      {isActive && <Note>{t('prog.activeInfo')}</Note>}
    </Section>
  );
}

// ── Tiers Tab ─────────────────────────────────────────────────────────────────

function TiersTab({ tiers, setTiers }) {
  const { t } = useLang();
  return (
    <Section title={t('tiers.title')} sub={t('tiers.sub')}>
      <TierTable tiers={tiers} setTiers={setTiers} />
    </Section>
  );
}

// ── Rules Tab ─────────────────────────────────────────────────────────────────

function RulesTab({ rules, setRules, tiers, notify }) {
  const { t, tr, lang } = useLang();
  const [ruleErrors, setRuleErrors] = React.useState({});
  // null = closed · 'new' = create · rule object = configure that rule
  const [modal, setModal] = React.useState(null);

  function updateRule(id, field, value) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    if (ruleErrors[id]) setRuleErrors(e => { const n = { ...e }; delete n[id]; return n; });
  }

  function saveRules() {
    const errs = {};
    rules.forEach(r => {
      if (r.active && (r.config?.calc?.mode ?? 'fixed') === 'fixed') {
        const v = parseInt(String(r.pts), 10);
        if (isNaN(v) || v <= 0) errs[r.id] = t('rules.err.positive');
      }
    });
    if (Object.keys(errs).length > 0) { setRuleErrors(errs); return; }
    setRuleErrors({});
    notify(t('rules.saved'));
  }

  function saveFromModal(rule) {
    const exists = rules.some(r => r.id === rule.id);
    setRules(prev => exists ? prev.map(r => r.id === rule.id ? rule : r) : [...prev, rule]);
    notify(exists ? t('rules.updated') : t('rules.created'));
    setModal(null);
  }

  // Non-fixed modes can't be edited inline — the table shows the modal's summary instead.
  function calcSummary(rule) {
    const c = rule.config?.calc;
    if (!c || c.mode === 'fixed') return null;
    if (c.mode === 'euro')     return t('am.pv.euro', { n: c.perEuro });
    if (c.mode === 'brackets') return t('am.pv.brackets', { n: c.brackets.length });
    if (c.mode === 'streak')   return t('am.pv.streak', { pts: c.streakPts, n: c.streakN });
    return t('am.pv.multiplier', { base: c.multBase, x: c.multX });
  }

  const COL = '1fr 80px 140px 1fr 36px';

  return (
    <Section title={t('rules.title')} sub={t('rules.sub')}
      right={(
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Plus s={16} />} onClick={() => setModal('new')}>
          {t('rules.new')}
        </Btn>
      )}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <HeadRow cols={COL} labels={[t('rules.col.action'), t('rules.col.active'), t('rules.col.points'), t('rules.col.desc'), '']} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rules.map(rule => {
          const summary = calcSummary(rule);
          return (
          <div key={rule.id} style={{
            display: 'grid', gridTemplateColumns: COL, gap: 16, padding: '12px',
            alignItems: 'center', background: rule.active ? DS.surfaceCanvas : DS.surfaceSubtle,
            border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg,
            opacity: rule.active ? 1 : 0.75, transition: 'opacity 0.2s, background 0.2s',
          }}>
            {/* Action name */}
            <div>
              <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>
                {tr(rule.label)}
              </div>
              <div style={{ ...TY.monoMd, fontFamily: DS.ffm, color: DS.textSecondary, marginTop: 2 }}>
                {rule.action}
              </div>
            </div>

            {/* Toggle */}
            <Toggle on={rule.active} onChange={v => updateRule(rule.id, 'active', v)} />

            {/* Points field (Fixed mode) or calculation summary */}
            {summary ? (
              <button type="button" onClick={() => setModal(rule)} title={t('rules.configure')}
                style={{ ...TY.labelMd, fontWeight: 600, fontFamily: DS.ff, color: DS.actionPrimary, background: 'none', border: 'none',
                         padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                {summary}
              </button>
            ) : (
              <Field
                value={String(rule.pts)}
                onChange={e => updateRule(rule.id, 'pts', e.target.value)}
                type="number"
                disabled={!rule.active}
                error={ruleErrors[rule.id]}
                placeholder="pts"
              />
            )}

            {/* Description */}
            <Field
              value={tr(rule.description)}
              onChange={e => updateRule(rule.id, 'description', { ...rule.description, [lang]: e.target.value })}
              disabled={!rule.active}
              placeholder={t('rules.descPh')}
            />

            <ActionMenu items={[
              { label: t('rules.configure'), icon: <Ico.Settings s={16} c={DS.textSecondary} />,
                onClick: () => setModal(rule) },
              { label: t('common.delete'), icon: <Ico.Trash s={16} c={DS.feedbackError} />, danger: true,
                onClick: () => { setRules(prev => prev.filter(r => r.id !== rule.id)); notify(t('rules.deleted')); } },
            ]} />
          </div>
          );
        })}
      </div>
      </div>

      {Object.keys(ruleErrors).length > 0 && <Note tone="error">{t('rules.err.fix')}</Note>}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn type="Primary" size="Medium" onClick={saveRules}>
          {t('rules.save')}
        </Btn>
      </div>

      <ActionRuleModal open={modal !== null} rule={modal === 'new' ? null : modal} tiers={tiers}
        onClose={() => setModal(null)} onSave={saveFromModal} />
    </Section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LoyaltySettings() {
  const { t } = useLang();
  const [pageState, setPageState] = React.useState('ready');
  const [tab, setTab]             = React.useState('programme');
  const [programme, setProgramme] = React.useState({ ...LOYALTY_PROGRAM });
  const [tiers, setTiers]         = React.useState(LOYALTY_TIERS.map(t => ({ ...t })));
  const [rules, setRules]         = React.useState(LOYALTY_RULES.map(r => ({ ...r })));
  const [errors, setErrors]       = React.useState({});
  const [toast, setToast]         = React.useState(null);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const isActive = programme.status === 'active';

  function renderContent() {
    if (pageState === 'loading') return <LoadingSkeleton />;

    if (pageState === 'empty') {
      return (
        <EmptyState
          icon={<Ico.Loyalty s={28} c={DS.textSecondary} />}
          title={t('settings.emptyTitle')}
          sub={t('settings.emptySub')}
          cta={
            <Btn type="Primary" iconLeft={<Ico.Plus s={16} />} onClick={() => setPageState('ready')}>
              {t('settings.emptyCta')}
            </Btn>
          }
        />
      );
    }

    if (pageState === 'error') {
      return (
        <ErrorState
          title={t('settings.errorTitle')}
          sub={t('settings.errorSub')}
        />
      );
    }

    // ready
    return (
      <>
        {tab === 'programme' && (
          <ProgrammeTab programme={programme} setProgramme={setProgramme}
            errors={errors} setErrors={setErrors} notify={notify} />
        )}
        {tab === 'tiers' && (
          <TiersTab tiers={tiers} setTiers={setTiers} />
        )}
        {tab === 'rules' && (
          <RulesTab rules={rules} setRules={setRules} tiers={tiers} notify={notify} />
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100%', fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 48 }}>
      <PageHeader
        title={t('settings.title')}
        description={t('settings.desc')}
        actions={
          pageState === 'ready' ? (
            <StatusBadge status={isActive ? 'active' : 'inactive'}>
              {isActive ? t('settings.progActive') : t('settings.progInactive')}
            </StatusBadge>
          ) : null
        }
      />

      {pageState === 'ready' && (
        <Tabs value={tab} onChange={setTab} divider width={140}
          tabs={TABS.map(x => ({ value: x.value, label: t(x.label) }))} />
      )}

      {renderContent()}

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
