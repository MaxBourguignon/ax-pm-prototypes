/**
 * Loyalty — reward configuration modal.
 * Based on the earlier HTML mockup (loyalty-module-en.html, "New reward"):
 *   1 Reward (name, fan-facing description, cost, minimum tier)
 *   2 Availability (stock, per-member limit, dates)
 *   3 Distribution: email claim · promo code (file import or e-shop connector) · manual assignment
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field, TextArea } from '../../components/Field';
import { Select } from '../../components/Select';
import { Radio } from '../../components/Controls';
import { Chip } from '../../components/Chip';
import { Modal } from '../../components/Modal';
import { useLang } from './i18n';
import { DISTRIBUTIONS } from './rewardDistributions';

let _uid = 1;
const uid = () => `reward-${_uid++}`;


const CODE_SOURCES = ['import', 'shopify', 'prestashop', 'woocommerce'];

function defaults(r) {
  return {
    name: r?.name ?? { fr: '', en: '' },
    description: r?.description ?? { fr: '', en: '' },
    cost: r?.cost ?? '',
    minTier: r?.minTier ?? 'all',
    stockLimited: r ? r.stock !== null : false,
    stock: r?.stock ?? '',
    perMember: r?.perMember ?? '',
    from: '2025-09-01', to: '2026-06-30',
    distribution: r?.distribution ?? 'email',
    emailSubject: '', sender: 'RCSC', template: 'default', linkExpiry: 14,
    codeSource: r?.codeSource ?? 'import', codesLoaded: r?.codeSource === 'import' ? (r?.stock ?? 0) : 0,
    lowStock: 20, shopUrl: '', apiKey: '', discountType: 'pct', discountValue: 15, codeValidity: 30,
    connectionOk: false,
    adminEmail: 'loyalty@club.com', sla: 3, memberMsg: '',
  };
}

function Section({ title, children, last }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: last ? 0 : 20,
                  borderBottom: last ? 'none' : `1px solid ${DS.borderDefault}` }}>
      <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>{title}</div>
      {children}
    </div>
  );
}

const grid = (cols) => ({ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'start' });

export function RewardModal({ open, reward, tiers, onClose, onSave }) {
  const { t, tr, lang, fmt } = useLang();
  const [f, setF] = React.useState(() => defaults(reward));
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => { if (open) { setF(defaults(reward)); setErrors({}); } }, [open, reward]);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const setText = (k, v) => setF(p => ({ ...p, [k]: { ...p[k], [lang]: v } }));
  const num = (v) => (v === '' || v === null || v === undefined ? '' : String(v));
  const toInt = (v) => (v === '' ? '' : parseInt(v, 10));

  function save(status) {
    const e = {};
    if (!tr(f.name)?.trim()) e.name = t('rm.err.name');
    if (!(Number(f.cost) > 0)) e.cost = t('rm.err.cost');
    setErrors(e);
    if (Object.keys(e).length) return;
    const fill = (v) => ({ fr: v.fr || v.en, en: v.en || v.fr });
    const stock = f.stockLimited ? (Number(f.stock) || 0) : null;
    onSave({
      id: reward?.id ?? uid(),
      status,
      name: fill(f.name),
      description: fill(f.description),
      cost: Number(f.cost),
      minTier: f.minTier === 'all' ? null : f.minTier,
      distribution: f.distribution,
      codeSource: f.distribution === 'code' ? f.codeSource : undefined,
      stock,
      stockLeft: stock === null ? undefined : (reward?.stockLeft ?? stock),
      perMember: f.perMember === '' ? null : f.perMember,
      redeemed: reward?.redeemed ?? 0,
    });
  }

  const footer = (
    <>
      <span style={{ flex: 1 }} />
      <Btn type="Tertiary" onClick={onClose}>{t('common.cancel')}</Btn>
      <Btn type="Secondary" onClick={() => save('draft')}>{t('rm.saveDraft')}</Btn>
      <Btn type="Primary" onClick={() => save('active')}>{t('rm.saveReward')}</Btn>
    </>
  );

  const shopName = t(`rm.src.${f.codeSource}`);

  return (
    <Modal open={open} onClose={onClose} variant="center" size="lg" footer={footer}
      title={reward ? t('rm.titleEdit') : t('rm.titleNew')} subtitle={t('rm.subtitle')}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: DS.ff }}>

        {/* 1 · Reward */}
        <Section title={t('rm.s1')}>
          <div style={grid('1fr 1fr')}>
            <Field label={t('rm.name')} required value={tr(f.name)} placeholder={t('rm.namePh')}
              onChange={e => setText('name', e.target.value)} error={errors.name} style={{ width: '100%' }} />
            <div style={grid('1fr 1fr')}>
              <Field label={t('rm.cost')} required type="number" value={num(f.cost)} placeholder="pts"
                onChange={e => set('cost', toInt(e.target.value))} error={errors.cost} style={{ width: '100%' }} />
              <Select label={t('rm.minTier')} width="100%" value={f.minTier}
                options={[{ value: 'all', label: t('rw.allMembers') }, ...tiers.map(x => ({ value: x.id, label: `${x.name}+` }))]}
                onChange={v => set('minTier', v)} />
            </div>
          </div>
          <TextArea label={t('rm.desc')} value={tr(f.description)} placeholder={t('rm.descPh')} rows={2}
            onChange={e => setText('description', e.target.value)} style={{ width: '100%' }} />
        </Section>

        {/* 2 · Availability */}
        <Section title={t('rm.s2')}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ ...TY.labelMd, color: DS.textStrong }}>{t('rm.stockMode')}</span>
            <Radio checked={!f.stockLimited} onChange={() => set('stockLimited', false)} label={t('rm.stockUnlimited')} />
            <Radio checked={f.stockLimited} onChange={() => set('stockLimited', true)} label={t('rm.stockLimited')} />
          </div>
          <div style={grid('1fr 1fr 1fr 1fr')}>
            {f.stockLimited && (
              <Field label={t('rm.stockQty')} type="number" value={num(f.stock)}
                onChange={e => set('stock', toInt(e.target.value))} style={{ width: '100%' }} />
            )}
            <Field label={t('rm.perMember')} type="number" value={num(f.perMember)} placeholder={t('rm.perMemberPh')}
              onChange={e => set('perMember', toInt(e.target.value))} style={{ width: '100%' }} />
            <Field label={t('rm.validFrom')} type="date" value={f.from}
              onChange={e => set('from', e.target.value)} style={{ width: '100%' }} />
            <Field label={t('rm.validTo')} type="date" value={f.to}
              onChange={e => set('to', e.target.value)} style={{ width: '100%' }} />
          </div>
        </Section>

        {/* 3 · Distribution */}
        <Section title={t('rm.s3')} last>
          <div style={grid('repeat(3, 1fr)')}>
            {DISTRIBUTIONS.map(d => {
              const on = f.distribution === d.id;
              const Icon = d.icon;
              return (
                <button key={d.id} type="button" onClick={() => set('distribution', d.id)} aria-pressed={on}
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, textAlign: 'left',
                           cursor: 'pointer', borderRadius: DS.radiusLg, fontFamily: DS.ff,
                           background: on ? DS.brandPrimarySubtle : DS.surfaceCanvas,
                           border: `1px solid ${on ? DS.actionPrimary : DS.borderDefault}` }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.labelLg, color: DS.textStrong }}>
                    <Icon s={16} c={DS.actionPrimary} /> {t(`rw.dist.${d.id}`)}
                  </span>
                  <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary }}>{t(`rm.${d.id}Sub`)}</span>
                </button>
              );
            })}
          </div>

          {f.distribution === 'email' && (
            <div style={grid('1fr 1fr')}>
              <Field label={t('rm.emailSubject')} value={f.emailSubject} placeholder={t('rm.emailSubjectPh')}
                onChange={e => set('emailSubject', e.target.value)} style={{ width: '100%' }} />
              <Field label={t('rm.sender')} value={f.sender}
                onChange={e => set('sender', e.target.value)} style={{ width: '100%' }} />
              <Select label={t('rm.template')} width="100%" value={f.template}
                options={[{ value: 'default', label: t('rm.tpl.default') }, { value: 'custom', label: t('rm.tpl.custom') }]}
                onChange={v => set('template', v)} />
              <Field label={t('rm.linkExpiry')} type="number" value={num(f.linkExpiry)}
                onChange={e => set('linkExpiry', toInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}

          {f.distribution === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...TY.labelMd, color: DS.textStrong, marginRight: 4 }}>{t('rm.codeSource')}</span>
                {CODE_SOURCES.map(src => (
                  <Chip key={src} label={t(`rm.src.${src}`)} selected={f.codeSource === src}
                    onClick={() => setF(p => ({ ...p, codeSource: src, connectionOk: false }))} />
                ))}
              </div>

              {f.codeSource === 'import' ? (
                <div style={grid('2fr 1fr')}>
                  <button type="button" onClick={() => set('codesLoaded', f.codesLoaded || 500)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 20,
                             cursor: 'pointer', borderRadius: DS.radiusLg, fontFamily: DS.ff, background: DS.surfaceSubtle,
                             border: `1.5px dashed ${f.codesLoaded ? DS.feedbackSuccess : DS.borderDefault}` }}>
                    {f.codesLoaded ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...TY.labelLg, color: DS.feedbackSuccess }}>
                        <Ico.Check s={16} c={DS.feedbackSuccess} /> {t('rm.codesLoaded', { n: fmt(f.codesLoaded) })}
                      </span>
                    ) : (
                      <>
                        <Ico.Download s={20} c={DS.textSecondary} />
                        <span style={{ ...TY.labelLg, color: DS.textStrong }}>{t('rm.dropzone')}</span>
                        <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary }}>{t('rm.dropzoneSub')}</span>
                      </>
                    )}
                  </button>
                  <Field label={t('rm.lowStockAlert')} type="number" value={num(f.lowStock)}
                    onChange={e => set('lowStock', toInt(e.target.value))} style={{ width: '100%' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: DS.radiusLg,
                              border: `1px solid ${DS.borderDefault}`, background: DS.surfaceSubtle }}>
                  <div>
                    <div style={{ ...TY.labelLg, color: DS.textStrong }}>{t('rm.connector', { shop: shopName })}</div>
                    <div style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary }}>{t('rm.connectorSub')}</div>
                  </div>
                  <div style={grid('1fr 1fr')}>
                    <Field label={t('rm.shopUrl')} value={f.shopUrl} placeholder="https://"
                      onChange={e => set('shopUrl', e.target.value)} style={{ width: '100%' }} />
                    <Field label={t('rm.apiKey')} type="password" value={f.apiKey} placeholder="••••••••"
                      onChange={e => set('apiKey', e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div style={grid('1fr 1fr 1fr')}>
                    <Select label={t('rm.discountType')} width="100%" value={f.discountType}
                      options={['pct', 'fixed', 'shipping'].map(o => ({ value: o, label: t(`rm.disc.${o}`) }))}
                      onChange={v => set('discountType', v)} />
                    {f.discountType !== 'shipping' && (
                      <Field label={t('rm.discountValue')} type="number" value={num(f.discountValue)}
                        onChange={e => set('discountValue', toInt(e.target.value))} style={{ width: '100%' }} />
                    )}
                    <Field label={t('rm.codeValidity')} type="number" value={num(f.codeValidity)}
                      onChange={e => set('codeValidity', toInt(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Btn type="Secondary" size="Sm" iconLeft={<Ico.Connect s={14} />} onClick={() => set('connectionOk', true)}>
                      {t('rm.testConnection')}
                    </Btn>
                    {f.connectionOk && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...TY.labelMd, color: DS.feedbackSuccess }}>
                        <Ico.Check s={14} c={DS.feedbackSuccess} /> {t('rm.connectionOk')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {f.distribution === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={grid('1fr 1fr')}>
                <Field label={t('rm.adminEmail')} type="email" value={f.adminEmail}
                  onChange={e => set('adminEmail', e.target.value)} style={{ width: '100%' }} />
                <Field label={t('rm.sla')} type="number" value={num(f.sla)}
                  onChange={e => set('sla', toInt(e.target.value))} style={{ width: '100%' }} />
              </div>
              <TextArea label={t('rm.memberMsg')} value={f.memberMsg} placeholder={t('rm.memberMsgPh')} rows={2}
                onChange={e => set('memberMsg', e.target.value)} style={{ width: '100%' }} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderRadius: DS.radiusLg,
                        background: DS.feedbackInfoBg, border: `1px solid ${DS.feedbackInfo}` }}>
            <Ico.Info s={16} c={DS.feedbackInfo} />
            <span style={{ ...TY.bodySm, color: DS.feedbackInfo }}>{t('rm.pointsInfo')}</span>
          </div>
        </Section>
      </div>
    </Modal>
  );
}

export default RewardModal;
