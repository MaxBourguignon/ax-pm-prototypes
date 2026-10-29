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
import Card from '../../components/Card';
import { ActionMenu } from '../../components/ActionMenu';
import { TierTable } from './TierTable';
import { ActionRuleModal } from './ActionRuleModal';
import { useLang } from './i18n';
import { LangSwitch } from './LangSwitch';
import { LOYALTY_PROGRAM, LOYALTY_TIERS, LOYALTY_RULES, SEGMENTS } from './loyaltyMock';

const TABS = [
  { id: 'programme',   label: 'settings.tab.programme', icon: Ico.Settings },
  { id: 'tiers',       label: 'settings.tab.tiers',     icon: Ico.Star },
  { id: 'rules',       label: 'settings.tab.rules',     icon: Ico.Zap },
];

function TabBar({ active, onChange }) {
  const { t } = useLang();
  return (
    <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`,
                  padding: '0 24px', display: 'flex', gap: 4 }}>
      {TABS.map(tab => {
        const isActive = tab.id === active;
        const Icon = tab.icon;
        return (
          <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                     background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: DS.ff,
                     ...TY.b2, fontWeight: isActive ? 600 : 400,
                     color: isActive ? DS.actionPrimary : DS.textSecondary,
                     borderBottom: isActive ? `3px solid ${DS.actionPrimary}` : '3px solid transparent',
                     transition: 'color 0.15s, border-color 0.15s', marginBottom: -1 }}>
            <Icon s={16} c={isActive ? DS.actionPrimary : DS.textSecondary} />
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
      {sub && <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function InfoBanner({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                  background: DS.feedbackInfoBg, borderRadius: 6,
                  border: `1px solid ${DS.feedbackInfo}` }}>
      <Ico.Info s={16} c={DS.feedbackInfo} />
      <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo }}>{children}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Skeleton w={180} h={18} r={4} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[200, 160, 220, 140].map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton w={80} h={12} r={3} />
              <Skeleton w={w} h={40} r={6} />
            </div>
          ))}
        </div>
      </div>
    </Card>
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
    <Card style={{ padding: 24 }}>
      <SectionTitle title={t('prog.title')} sub={t('prog.sub')} />

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: DS.bgSurface, borderRadius: 8, marginBottom: 24,
                    border: `1px solid ${DS.borderDefault}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>{t('prog.status')}</span>
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
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
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
        <div style={{ marginTop: 8 }}>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackError }}>
            {errors.eligible_segment}
          </span>
        </div>
      )}

      {isActive && (
        <div style={{ marginTop: 20 }}>
          <InfoBanner>
            {t('prog.activeInfo')}
          </InfoBanner>
        </div>
      )}
    </Card>
  );
}

// ── Tiers Tab ─────────────────────────────────────────────────────────────────

function TiersTab({ tiers, setTiers }) {
  const { t } = useLang();
  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle title={t('tiers.title')} sub={t('tiers.sub')} />
      <TierTable tiers={tiers} setTiers={setTiers} />
    </Card>
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
    <Card style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <SectionTitle title={t('rules.title')} sub={t('rules.sub')} />
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Plus s={16} />} onClick={() => setModal('new')}>
          {t('rules.new')}
        </Btn>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 16,
                    padding: '0 12px 10px', alignItems: 'center' }}>
        {[t('rules.col.action'), t('rules.col.active'), t('rules.col.points'), t('rules.col.desc'), ''].map((h, i) => (
          <span key={i} style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rules.map(rule => {
          const summary = calcSummary(rule);
          return (
          <div key={rule.id} style={{
            display: 'grid', gridTemplateColumns: COL, gap: 16, padding: '12px',
            alignItems: 'center', background: rule.active ? DS.bgCard : DS.bgSurface,
            border: `1px solid ${DS.borderDefault}`, borderRadius: 8,
            opacity: rule.active ? 1 : 0.75, transition: 'opacity 0.2s, background 0.2s',
          }}>
            {/* Action name */}
            <div>
              <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: rule.active ? 600 : 400 }}>
                {tr(rule.label)}
              </div>
              <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>
                {rule.action}
              </div>
            </div>

            {/* Toggle */}
            <Toggle on={rule.active} onChange={v => updateRule(rule.id, 'active', v)} />

            {/* Points field (Fixed mode) or calculation summary */}
            {summary ? (
              <button type="button" onClick={() => setModal(rule)} title={t('rules.configure')}
                style={{ ...TY.b3, fontFamily: DS.ff, color: DS.actionPrimary, background: 'none', border: 'none',
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

      {Object.keys(ruleErrors).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px',
                      background: DS.feedbackErrorBg, borderRadius: 6,
                      border: `1px solid ${DS.feedbackError}` }}>
          <Ico.Warn s={16} c={DS.feedbackError} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackErrorText }}>
            {t('rules.err.fix')}
          </span>
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn type="Primary" size="Medium" iconLeft={<Ico.Check s={16} />} onClick={saveRules}>
          {t('rules.save')}
        </Btn>
      </div>

      <ActionRuleModal open={modal !== null} rule={modal === 'new' ? null : modal} tiers={tiers}
        onClose={() => setModal(null)} onSave={saveFromModal} />
    </Card>
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
          icon={<Ico.Star s={28} c={DS.textSecondary} />}
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
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <PageHeader
        icon={<Ico.Star s={20} c={DS.actionPrimary} />}
        title={t('settings.title')}
        description={t('settings.desc')}
        actions={
          <>
            {pageState === 'ready' && (
              <StatusBadge status={isActive ? 'active' : 'inactive'}>
                {isActive ? t('settings.progActive') : t('settings.progInactive')}
              </StatusBadge>
            )}
            <LangSwitch />
          </>
        }
      />

      {pageState === 'ready' && (
        <TabBar active={tab} onChange={setTab} />
      )}

      <div style={{ padding: 24 }}>
        {renderContent()}
      </div>

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
