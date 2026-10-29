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
import { TierTable } from './TierTable';
import { LOYALTY_PROGRAM, LOYALTY_TIERS, LOYALTY_RULES, SEGMENTS } from './loyaltyMock';

const TABS = [
  { id: 'programme',   label: 'Programme',         icon: Ico.Settings },
  { id: 'tiers',       label: 'Tiers de fidélité', icon: Ico.Star },
  { id: 'rules',       label: 'Règles de points',  icon: Ico.Zap },
];

function TabBar({ active, onChange }) {
  return (
    <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`,
                  padding: '0 24px', display: 'flex', gap: 4 }}>
      {TABS.map(t => {
        const isActive = t.id === active;
        const Icon = t.icon;
        return (
          <button key={t.id} type="button" onClick={() => onChange(t.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px',
                     background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: DS.ff,
                     ...TY.b2, fontWeight: isActive ? 600 : 400,
                     color: isActive ? DS.actionPrimary : DS.textSecondary,
                     borderBottom: isActive ? `3px solid ${DS.actionPrimary}` : '3px solid transparent',
                     transition: 'color 0.15s, border-color 0.15s', marginBottom: -1 }}>
            <Icon s={16} c={isActive ? DS.actionPrimary : DS.textSecondary} />
            {t.label}
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
  const isActive = programme.status === 'active';

  function validate() {
    const e = {};
    if (!programme.name.trim()) e.name = 'Le nom du programme est requis';
    if (!programme.start_date)  e.start_date = 'La date de début est requise';
    if (!programme.eligible_segment) e.eligible_segment = 'Le segment éligible est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleToggle() {
    if (isActive) {
      setProgramme(p => ({ ...p, status: 'inactive' }));
      notify('Programme désactivé');
    } else {
      if (!validate()) return;
      setProgramme(p => ({ ...p, status: 'active' }));
      notify('Programme activé avec succès');
    }
  }

  function set(field, value) {
    setProgramme(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle title="Configuration du programme"
        sub="Définissez le nom, le segment éligible et les paramètres généraux du programme." />

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: DS.bgSurface, borderRadius: 8, marginBottom: 24,
                    border: `1px solid ${DS.borderDefault}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>Statut du programme :</span>
          <StatusBadge status={isActive ? 'active' : 'inactive'}>
            {isActive ? 'Actif' : 'Inactif'}
          </StatusBadge>
        </div>
        <Btn type={isActive ? 'Secondary' : 'Primary'} size="Medium"
          iconLeft={isActive ? <Ico.Cross s={16} /> : <Ico.Check s={16} />}
          onClick={handleToggle}>
          {isActive ? 'Désactiver le programme' : 'Activer le programme'}
        </Btn>
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Field label="Nom du programme *"
          value={programme.name}
          onChange={e => set('name', e.target.value)}
          placeholder="ex : Fidélité RCSC 2025–2026"
          error={errors.name} />

        <Select label="Segment éligible *"
          value={programme.eligible_segment}
          options={SEGMENTS}
          onChange={v => set('eligible_segment', v)}
          placeholder="Choisir un segment…" />

        <div>
          <Field label="Date de début *"
            type="date" value={programme.start_date || ''}
            onChange={e => set('start_date', e.target.value)}
            disabled={isActive}
            error={errors.start_date} />
          {isActive && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.Info s={12} c={DS.textSecondary} />
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
                Non modifiable après activation
              </span>
            </div>
          )}
        </div>

        <Field label="Expiration des points (mois)"
          type="number" value={programme.expiration_months === null ? '' : String(programme.expiration_months)}
          onChange={e => set('expiration_months', e.target.value === '' ? null : parseInt(e.target.value, 10))}
          placeholder="Aucune expiration" />
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
            Le programme est actif. Les points sont calculés automatiquement à partir des données Walnut.
            La date de début ne peut plus être modifiée.
          </InfoBanner>
        </div>
      )}
    </Card>
  );
}

// ── Tiers Tab ─────────────────────────────────────────────────────────────────

function TiersTab({ tiers, setTiers }) {
  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle title="Tiers de fidélité"
        sub="Définissez les paliers de fidélité et leurs plages de points. Les plages ne doivent pas se chevaucher." />
      <TierTable tiers={tiers} setTiers={setTiers} />
    </Card>
  );
}

// ── Rules Tab ─────────────────────────────────────────────────────────────────

function RulesTab({ rules, setRules, notify }) {
  const [ruleErrors, setRuleErrors] = React.useState({});

  function updateRule(id, field, value) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    if (ruleErrors[id]) setRuleErrors(e => { const n = { ...e }; delete n[id]; return n; });
  }

  function saveRules() {
    const errs = {};
    rules.forEach(r => {
      if (r.active) {
        const v = parseInt(String(r.pts), 10);
        if (isNaN(v) || v <= 0) errs[r.id] = 'Doit être un entier positif';
      }
    });
    if (Object.keys(errs).length > 0) { setRuleErrors(errs); return; }
    setRuleErrors({});
    notify('Règles de points enregistrées');
  }

  const COL = '1fr 80px 140px 1fr';

  return (
    <Card style={{ padding: 24 }}>
      <SectionTitle title="Barème des points"
        sub="Configurez les points attribués pour chaque action Walnut. Les actions inactives ne génèrent aucun point." />

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 16,
                    padding: '0 12px 10px', alignItems: 'center' }}>
        {['Action', 'Actif', 'Points', 'Description interne'].map((h, i) => (
          <span key={i} style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rules.map(rule => (
          <div key={rule.id} style={{
            display: 'grid', gridTemplateColumns: COL, gap: 16, padding: '12px',
            alignItems: 'center', background: rule.active ? DS.bgCard : DS.bgSurface,
            border: `1px solid ${DS.borderDefault}`, borderRadius: 8,
            opacity: rule.active ? 1 : 0.75, transition: 'opacity 0.2s, background 0.2s',
          }}>
            {/* Action name */}
            <div>
              <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: rule.active ? 600 : 400 }}>
                {rule.label}
              </div>
              <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>
                {rule.action}
              </div>
            </div>

            {/* Toggle */}
            <Toggle on={rule.active} onChange={v => updateRule(rule.id, 'active', v)} />

            {/* Points field */}
            <Field
              value={String(rule.pts)}
              onChange={e => updateRule(rule.id, 'pts', e.target.value)}
              type="number"
              disabled={!rule.active}
              error={ruleErrors[rule.id]}
              placeholder="pts"
            />

            {/* Description */}
            <Field
              value={rule.description}
              onChange={e => updateRule(rule.id, 'description', e.target.value)}
              disabled={!rule.active}
              placeholder="Description interne…"
            />
          </div>
        ))}
      </div>

      {Object.keys(ruleErrors).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px',
                      background: DS.feedbackErrorBg, borderRadius: 6,
                      border: `1px solid ${DS.feedbackError}` }}>
          <Ico.Warn s={16} c={DS.feedbackError} />
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackErrorText }}>
            Corrigez les valeurs de points invalides avant d'enregistrer.
          </span>
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn type="Primary" size="Medium" iconLeft={<Ico.Check s={16} />} onClick={saveRules}>
          Enregistrer les règles
        </Btn>
      </div>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LoyaltySettings() {
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
          title="Aucun programme de fidélité"
          sub="Créez votre premier programme pour commencer à scorer l'engagement de vos fans."
          cta={
            <Btn type="Primary" iconLeft={<Ico.Plus s={16} />} onClick={() => setPageState('ready')}>
              Créer un programme
            </Btn>
          }
        />
      );
    }

    if (pageState === 'error') {
      return (
        <ErrorState
          title="Impossible de charger le paramétrage"
          sub="Une erreur est survenue lors du chargement des données du programme."
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
          <RulesTab rules={rules} setRules={setRules} notify={notify} />
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage }}>
      <PageHeader
        icon={<Ico.Star s={20} c={DS.actionPrimary} />}
        title="Paramétrage Loyalty"
        description="Configurez votre programme de fidélité, les tiers et les règles de points."
        actions={
          pageState === 'ready' ? (
            <StatusBadge status={isActive ? 'active' : 'inactive'}>
              {isActive ? 'Programme actif' : 'Programme inactif'}
            </StatusBadge>
          ) : null
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
