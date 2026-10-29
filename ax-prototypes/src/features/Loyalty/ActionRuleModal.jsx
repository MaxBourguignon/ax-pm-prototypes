/**
 * Loyalty — action configuration modal (points rule builder).
 * Structure taken from the earlier HTML mockup (loyalty-module-en.html,
 * "New scoring rule"), rebuilt on the shared DS components:
 *   1 Identification · 2 Triggering action (+ per-category filters)
 *   3 Conditions · 4 Points calculation (5 modes + live preview) · 5 Caps & stacking
 * Categories are limited to data Arenametrix already holds (the mockup's
 * "Social & Digital" was dropped: no source for it in the platform).
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field } from '../../components/Field';
import { Select } from '../../components/Select';
import { Checkbox } from '../../components/Controls';
import { Chip } from '../../components/Chip';
import { Modal } from '../../components/Modal';
import { useLang } from './i18n';

let _uid = 1;
const uid = () => `rule-${_uid++}`;

const CATEGORIES = [
  { id: 'ticketing',    icon: Ico.Ticket,    action: 'TICKET_PURCHASED' },
  { id: 'attendance',   icon: Ico.Scan,      action: 'MATCH_ATTENDED' },
  { id: 'subscription', icon: Ico.Subscriptions, action: 'SEASON_SUBSCRIPTION' },
  { id: 'shop',         icon: Ico.Cart,      action: 'SHOP_PURCHASE' },
  { id: 'email',        icon: Ico.Mail,      action: 'EMAIL_CLICK' },
  { id: 'contribution', icon: Ico.Form,      action: 'FORM_SUBMITTED' },
];

// Per-category filters: [filter key, label key, option keys]. 'all' is always first.
const FILTERS = {
  ticketing: [
    ['eventType', 'am.eventType', ['am.ev.home', 'am.ev.away', 'am.ev.cup', 'am.ev.special']],
    ['channel',   'am.channel',   ['am.ch.online', 'am.ch.boxoffice', 'am.ch.app', 'am.ch.reseller']],
    ['seat',      'am.seat',      ['am.seat.general', 'am.seat.central', 'am.seat.vip']],
    ['period',    'am.period',    ['am.per.season', 'am.per.first', 'am.per.second', 'am.per.playoffs']],
  ],
  attendance: [
    ['scanType',  'am.scanType',  ['am.scan.ticket', 'am.scan.card']],
    ['eventType', 'am.eventType', ['am.ev.home', 'am.ev.cup', 'am.ev.special']],
  ],
  subscription: [
    ['subType',   'am.subType',   ['am.sub.full', 'am.sub.half', 'am.sub.family']],
    ['trigger',   'am.trigger',   ['am.trig.initial', 'am.trig.renewal', 'am.trig.early']],
  ],
  shop: [
    ['shopChannel', 'am.shopChannel',   ['am.shop.online', 'am.shop.physical']],
    ['product',     'am.productFamily', ['am.prod.jerseys', 'am.prod.accessories', 'am.prod.limited']],
  ],
  email: [
    ['emailEvent',   'am.emailEvent',   ['am.email.open', 'am.email.click']],
    ['campaignType', 'am.campaignType', ['am.camp.newsletter', 'am.camp.ticketing', 'am.camp.partner']],
  ],
  contribution: [
    ['form', 'am.form', ['am.form.survey', 'am.form.profile', 'am.form.contest']],
  ],
};

// Amount conditions only make sense where the action carries a value.
const HAS_AMOUNT = new Set(['ticketing', 'shop', 'subscription']);

const MODES = ['fixed', 'euro', 'brackets', 'streak', 'multiplier'];

function defaults(rule) {
  const c = rule?.config || {};
  return {
    name: rule ? rule.label : { fr: '', en: '' },
    description: rule ? rule.description : { fr: '', en: '' },
    category: c.category || 'ticketing',
    filters: c.filters || {},
    cond: { minAmount: '', maxAmount: '', minQty: '', tier: '', tierOn: false, datesOn: false,
            from: '2025-09-01', to: '2026-06-30', satOp: 'any', satVal: '', ...(c.cond || {}) },
    calc: { mode: 'fixed', pts: rule?.pts ?? 10, perEuro: 1, rounding: 'down',
            brackets: [{ from: 0, pts: 50 }, { from: 50, pts: 120 }, { from: 100, pts: 200 }],
            streakN: 5, streakPts: 500, streakRepeat: 'every',
            multBase: 100, multX: 2, multIf: 't3', ...(c.calc || {}) },
    caps: { member: '', per: 'day', budget: '', stack: 'yes', retro: false, ...(c.caps || {}) },
  };
}

// ── Small layout helpers ─────────────────────────────────────────────────────

function Section({ title, help, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20,
                  borderBottom: `1px solid ${DS.borderDefault}` }}>
      <div>
        <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textStrong }}>{title}</div>
        {help && <div style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>{help}</div>}
      </div>
      {children}
    </div>
  );
}

const grid = (cols) => ({ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'start' });

function CategoryTile({ cat, selected, onClick, t }) {
  const Icon = cat.icon;
  return (
    <button type="button" onClick={onClick} aria-pressed={selected}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left',
               cursor: 'pointer', borderRadius: 8, fontFamily: DS.ff,
               background: selected ? DS.brandPrimarySubtle : DS.bgCard,
               border: `1px solid ${selected ? DS.actionPrimary : DS.borderDefault}`,
               transition: 'border-color .15s, background .15s' }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, display: 'flex',
                     alignItems: 'center', justifyContent: 'center',
                     background: selected ? DS.bgCard : DS.bgIcons }}>
        <Icon s={16} c={DS.actionPrimary} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ ...TY.labelLg, display: 'block', color: DS.textStrong }}>{t(`am.cat.${cat.id}`)}</span>
        <span style={{ ...TY.labelMd, display: 'block', color: DS.textSecondary, fontWeight: 400 }}>
          {t(`am.cat.${cat.id}Sub`)}
        </span>
      </span>
    </button>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

export function ActionRuleModal({ open, rule, tiers, onClose, onSave }) {
  const { t, tr, lang } = useLang();
  const [f, setF] = React.useState(() => defaults(rule));
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => { if (open) { setF(defaults(rule)); setErrors({}); } }, [open, rule]);

  const set = (path, value) => setF(prev => {
    const [a, b] = path.split('.');
    return b ? { ...prev, [a]: { ...prev[a], [b]: value } } : { ...prev, [a]: value };
  });
  const setText = (key, value) => setF(prev => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));

  const all = { value: 'all', label: t('common.all') };
  const opts = (keys) => [all, ...keys.map(k => ({ value: k, label: t(k) }))];
  const tierOpts = tiers.map(x => ({ value: x.id, label: x.name }));
  const num = (v) => (v === '' || v === null || v === undefined ? '' : String(v));
  const toInt = (v) => (v === '' ? '' : parseInt(v, 10));

  const { calc } = f;
  const tierName = (id) => tiers.find(x => x.id === id)?.name ?? '';
  const preview = {
    fixed:      t('am.pv.fixed', { n: calc.pts || 0 }),
    euro:       t('am.pv.euro', { n: calc.perEuro || 0 }),
    brackets:   t('am.pv.brackets', { n: calc.brackets.length }),
    streak:     t('am.pv.streak', { pts: calc.streakPts || 0, n: calc.streakN || 0 }),
    multiplier: t('am.pv.multiplier', { base: calc.multBase || 0, x: calc.multX || 0 }),
  }[calc.mode];

  function save() {
    const e = {};
    if (!tr(f.name)?.trim()) e.name = t('am.err.name');
    const mainPts = { fixed: calc.pts, euro: calc.perEuro, streak: calc.streakPts, multiplier: calc.multBase }[calc.mode];
    if (mainPts !== undefined && !(Number(mainPts) > 0)) e.points = t('am.err.points');
    setErrors(e);
    if (Object.keys(e).length) return;

    // Fill the other language with the typed one when it was left empty.
    const fill = (v) => ({ fr: v.fr || v.en, en: v.en || v.fr });
    const cat = CATEGORIES.find(c => c.id === f.category);
    onSave({
      id: rule?.id ?? uid(),
      action: rule?.action ?? cat.action,
      active: rule?.active ?? true,
      label: fill(f.name),
      description: fill(f.description),
      pts: calc.mode === 'fixed' ? calc.pts : (rule?.pts ?? calc.pts),
      config: { category: f.category, filters: f.filters, cond: f.cond, calc, caps: f.caps },
    });
  }

  const footer = (
    <>
      <span style={{ flex: 1 }} />
      <Btn type="Secondary" onClick={onClose}>{t('common.cancel')}</Btn>
      <Btn type="Primary" iconLeft={<Ico.Check s={16} />} onClick={save}>{t('am.saveRule')}</Btn>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} variant="center" width={760} footer={footer}
      title={rule ? t('am.titleEdit') : t('am.titleNew')} subtitle={t('am.subtitle')}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: DS.ff }}>

        {/* 1 · Identification */}
        <Section title={t('am.s1')}>
          <div style={grid('1fr 1fr')}>
            <Field label={t('am.name')} required value={tr(f.name)} placeholder={t('am.namePh')}
              onChange={e => setText('name', e.target.value)} error={errors.name} style={{ width: '100%' }} />
            <Field label={`${t('am.desc')} (${t('common.optional')})`} value={tr(f.description)}
              placeholder={t('am.descPh')} onChange={e => setText('description', e.target.value)}
              style={{ width: '100%' }} />
          </div>
        </Section>

        {/* 2 · Triggering action */}
        <Section title={t('am.s2')} help={t('am.s2help')}>
          <div style={grid('repeat(3, 1fr)')}>
            {CATEGORIES.map(c => (
              <CategoryTile key={c.id} cat={c} t={t} selected={f.category === c.id}
                onClick={() => setF(p => ({ ...p, category: c.id, filters: {} }))} />
            ))}
          </div>
          <div style={grid('1fr 1fr')}>
            {FILTERS[f.category].map(([key, labelKey, optionKeys]) => (
              <Select key={key} label={t(labelKey)} width="100%" options={opts(optionKeys)}
                value={f.filters[key] || 'all'}
                onChange={v => set('filters', { ...f.filters, [key]: v })} />
            ))}
            {f.category === 'contribution' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <Select label={t('am.satisfaction')} width="100%" value={f.cond.satOp}
                  options={['any', 'gte', 'lte'].map(o => ({ value: o, label: t(`am.op.${o}`) }))}
                  onChange={v => set('cond.satOp', v)} />
                {f.cond.satOp !== 'any' && (
                  <Field value={num(f.cond.satVal)} type="number" placeholder="/10" min={0} max={10}
                    onChange={e => set('cond.satVal', toInt(e.target.value))} style={{ width: 90 }} />
                )}
              </div>
            )}
          </div>
          {f.category === 'attendance' && (
            <InlineInfo>{t('am.scanInfo')}</InlineInfo>
          )}
        </Section>

        {/* 3 · Conditions */}
        <Section title={`${t('am.s3')} (${t('common.optional')})`}>
          {HAS_AMOUNT.has(f.category) && (
            <div style={grid('1fr 1fr 1fr')}>
              <Field label={t('am.minAmount')} type="number" placeholder="—" value={num(f.cond.minAmount)}
                onChange={e => set('cond.minAmount', toInt(e.target.value))} style={{ width: '100%' }} />
              <Field label={t('am.maxAmount')} type="number" placeholder="—" value={num(f.cond.maxAmount)}
                onChange={e => set('cond.maxAmount', toInt(e.target.value))} style={{ width: '100%' }} />
              <Field label={t('am.minQty')} type="number" placeholder="—" value={num(f.cond.minQty)}
                onChange={e => set('cond.minQty', toInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36 }}>
            <Checkbox checked={f.cond.tierOn} onChange={v => set('cond.tierOn', v)} label={t('am.restrictTier')} />
            {f.cond.tierOn && (
              <Select width={180} options={tierOpts} value={f.cond.tier || tiers[0]?.id}
                onChange={v => set('cond.tier', v)} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36, flexWrap: 'wrap' }}>
            <Checkbox checked={f.cond.datesOn} onChange={v => set('cond.datesOn', v)} label={t('am.limitDates')} />
            {f.cond.datesOn && (
              <>
                <span style={{ ...TY.bodySm, color: DS.textSecondary }}>{t('am.from')}</span>
                <Field type="date" value={f.cond.from} onChange={e => set('cond.from', e.target.value)} style={{ width: 160 }} />
                <span style={{ ...TY.bodySm, color: DS.textSecondary }}>{t('am.to')}</span>
                <Field type="date" value={f.cond.to} onChange={e => set('cond.to', e.target.value)} style={{ width: 160 }} />
              </>
            )}
          </div>
        </Section>

        {/* 4 · Points calculation */}
        <Section title={t('am.s4')}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <Chip key={m} label={t(`am.mode.${m}`)} selected={calc.mode === m}
                onClick={() => set('calc.mode', m)} />
            ))}
          </div>

          {calc.mode === 'fixed' && (
            <div style={grid('200px 1fr')}>
              <Field label={t('am.ptsPerAction')} type="number" value={num(calc.pts)} error={errors.points}
                onChange={e => set('calc.pts', toInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}

          {calc.mode === 'euro' && (
            <div style={grid('200px 200px')}>
              <Field label={t('am.ptsPerEuro')} type="number" value={num(calc.perEuro)} error={errors.points}
                onChange={e => set('calc.perEuro', toInt(e.target.value))} style={{ width: '100%' }} />
              <Select label={t('am.rounding')} width="100%" value={calc.rounding}
                options={['down', 'up', 'nearest'].map(o => ({ value: o, label: t(`am.round.${o}`) }))}
                onChange={v => set('calc.rounding', v)} />
            </div>
          )}

          {calc.mode === 'brackets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {calc.brackets.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <Field label={i === 0 ? t('am.bracketFrom') : undefined} type="number" value={num(b.from)}
                    style={{ width: 160 }}
                    onChange={e => set('calc.brackets', calc.brackets.map((x, j) => j === i ? { ...x, from: toInt(e.target.value) } : x))} />
                  <Field label={i === 0 ? t('am.bracketPts') : undefined} type="number" value={num(b.pts)}
                    style={{ width: 160 }}
                    onChange={e => set('calc.brackets', calc.brackets.map((x, j) => j === i ? { ...x, pts: toInt(e.target.value) } : x))} />
                  {calc.brackets.length > 1 && (
                    <Btn type="Ghost" size="Sm" aria-label={t('common.delete')}
                      iconLeft={<Ico.Trash s={14} c={DS.textSecondary} />}
                      onClick={() => set('calc.brackets', calc.brackets.filter((_, j) => j !== i))} />
                  )}
                </div>
              ))}
              <div>
                <Btn type="Ghost" size="Sm" iconLeft={<Ico.Plus s={14} />}
                  onClick={() => set('calc.brackets', [...calc.brackets, { from: '', pts: '' }])}>
                  {t('am.addBracket')}
                </Btn>
              </div>
            </div>
          )}

          {calc.mode === 'streak' && (
            <div style={grid('1fr 1fr 1fr')}>
              <Field label={t('am.streakN')} type="number" value={num(calc.streakN)}
                onChange={e => set('calc.streakN', toInt(e.target.value))} style={{ width: '100%' }} />
              <Field label={t('am.streakPts')} type="number" value={num(calc.streakPts)} error={errors.points}
                onChange={e => set('calc.streakPts', toInt(e.target.value))} style={{ width: '100%' }} />
              <Select label={t('am.streakRepeat')} width="100%" value={calc.streakRepeat}
                options={['every', 'once'].map(o => ({ value: o, label: t(`am.rep.${o}`) }))}
                onChange={v => set('calc.streakRepeat', v)} />
            </div>
          )}

          {calc.mode === 'multiplier' && (
            <div style={grid('1fr 1fr 1fr')}>
              <Field label={t('am.multBase')} type="number" value={num(calc.multBase)} error={errors.points}
                onChange={e => set('calc.multBase', toInt(e.target.value))} style={{ width: '100%' }} />
              <Field label={t('am.multX')} type="number" step="0.5" value={num(calc.multX)}
                onChange={e => set('calc.multX', e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%' }} />
              <Select label={t('am.multIf')} width="100%" value={calc.multIf}
                options={[...tiers.map(x => ({ value: x.id, label: t('am.multIf.tier', { tier: x.name }) })),
                          { value: 'first', label: t('am.multIf.first') }]}
                onChange={v => set('calc.multIf', v)} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8,
                        background: DS.feedbackInfoBg, border: `1px solid ${DS.feedbackInfo}` }}>
            <Ico.Star s={16} c={DS.feedbackInfo} />
            <span style={{ ...TY.bodySm, color: DS.feedbackInfo }}>
              <strong>{t('am.preview')}</strong> {preview}
              {calc.mode === 'multiplier' && ` — ${calc.multIf === 'first' ? t('am.multIf.first') : t('am.multIf.tier', { tier: tierName(calc.multIf) })}`}
            </span>
          </div>
        </Section>

        {/* 5 · Caps & stacking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textStrong }}>{t('am.s5')}</div>
          <div style={grid('1fr 1fr 1fr')}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <Field label={t('am.capMember')} type="number" placeholder={t('common.unlimited')}
                value={num(f.caps.member)} onChange={e => set('caps.member', toInt(e.target.value))}
                style={{ flex: 1, minWidth: 0 }} />
              <Select width={120} value={f.caps.per}
                options={['day', 'month', 'season'].map(o => ({ value: o, label: t(`am.capPer.${o}`) }))}
                onChange={v => set('caps.per', v)} />
            </div>
            <Field label={t('am.budget')} type="number" placeholder={t('common.unlimited')}
              value={num(f.caps.budget)} onChange={e => set('caps.budget', toInt(e.target.value))}
              style={{ width: '100%' }} />
            <Select label={t('am.stackable')} width="100%" value={f.caps.stack}
              options={[{ value: 'yes', label: t('am.stack.yes') }, { value: 'no', label: t('am.stack.no') },
                        { value: 'sameType', label: t('am.stack.sameType') }]}
              onChange={v => set('caps.stack', v)} />
          </div>
          <div>
            <Checkbox checked={f.caps.retro} onChange={v => set('caps.retro', v)} label={t('am.retro')} />
            <div style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary, marginTop: 4, marginLeft: 24 }}>
              {t('am.retroHelp')}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InlineInfo({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderRadius: 8,
                  background: DS.feedbackInfoBg, border: `1px solid ${DS.feedbackInfo}` }}>
      <Ico.Info s={16} c={DS.feedbackInfo} />
      <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.feedbackInfo }}>{children}</span>
    </div>
  );
}

export default ActionRuleModal;
