/**
 * Performance V3 — CRM Marketing
 * PM: M. Bourguignon · Fidelity: Near-production
 *
 * PAGE ONLY — renders inside the existing app shell (nav/sidebar/header live in
 * layout/*). Design system is IMPORTED, never redefined.
 *
 * OPEN QUESTIONS (flagged, not silently resolved — validate before shipping over V2):
 *  - All 4 JTBDs are "assumed" (0/4 observed). Core job = transparent attributed
 *    revenue. Validate with marketing managers first.
 *  - Job 3 (log offline campaign) success signal is soft ("completeness of channel mix").
 *  - Kill criteria: if attribution is too unreliable/sparse, or there aren't enough
 *    metrics for managers to understand their activity, don't ship over V2.
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { IconBtn } from '../../components/Iconbtn';
import { Field } from '../../components/Field';
import Select from '../../components/Select';
import Banner from '../../components/Banner';
import ActionMenu from '../../components/ActionMenu';
import Modal from '../../components/Modal';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import Pagination from '../../components/Pagination';
import Card from '../../components/Card';
import Toast from '../../components/Toast';
import StatePreview from '../../components/StatePreview';
import PageHeader from '../../components/PageHeader';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

let _uid = 100;
const uid = () => String(_uid++);

/* Spacing scale — consistent rhythm across the page */
const SP = { page: 24, section: 20, card: 16, gap: 16, tight: 12 };
/* Soft SaaS card elevation + radius */
const SHADOW = '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)';
const CARD = { padding: SP.card, boxShadow: SHADOW, borderRadius: 12 };

/* ── Reference "now" for the prototype (today) ───────────────────────────── */
const NOW = new Date('2026-06-10');

/* ── Channel metadata — single brand-blue accent for all UI (no per-channel colours) ── */
const CH = {
  Email:    { label: 'Email',    color: DS.actionPrimary, icon: (s, c) => <Ico.Mail s={s} c={c} /> },
  SMS:      { label: 'SMS',      color: DS.actionPrimary, icon: (s, c) => <Ico.Sms s={s} c={c} /> },
  WhatsApp: { label: 'WhatsApp', color: DS.actionPrimary, icon: (s, c) => <Ico.Whatsapp s={s} c={c} /> },
  Wallet:   { label: 'Wallet',   color: DS.actionPrimary, icon: (s, c) => <Ico.Wallet s={s} c={c} /> },
  Manual:   { label: 'Manual',   color: DS.neutralLGrey,  icon: (s, c) => <Ico.Edit s={s} c={c} /> },
};
const ONLINE = ['Email', 'SMS', 'WhatsApp', 'Wallet'];
/* Monochrome blue scale — used ONLY where charts must separate channel series */
const CHART = { Email: DS.blue600, SMS: DS.blue500, WhatsApp: DS.blue300, Wallet: DS.blue200 };

/* Per-channel funnel stage config — adapts to each channel's tracking fidelity.
 * `def` supplies a value when the metric isn't tracked per-campaign (e.g. Email delivery). */
const FUNNEL = {
  Email:    [{ k: 'delivery', label: 'Delivery rate', def: 99.2 }, { k: 'open', label: 'Open rate' }, { k: 'click', label: 'Click rate' }, { k: 'conv', label: 'Placed order rate' }],
  SMS:      [{ k: 'delivery', label: 'Delivery rate' }, { k: 'click', label: 'Click rate' }, { k: 'conv', label: 'Placed order rate' }],
  WhatsApp: [{ k: 'delivery', label: 'Delivery rate' }, { k: 'read', label: 'Read rate' }, { k: 'click', label: 'Click rate' }, { k: 'conv', label: 'Placed order rate' }],
  Wallet:   [{ k: 'install', label: 'Install rate', def: 62 }, { k: 'conv', label: 'Placed order rate' }],
};
/* Stable representative period-over-period deltas per funnel stage (prototype). */
const FUNNEL_DELTA = {
  Email:    { delivery: 1.2, open: 6.5, click: -2.1, conv: 3.4 },
  SMS:      { delivery: 0.8, click: 4.2, conv: 5.1 },
  WhatsApp: { delivery: 1.0, read: 4.3, click: 6.0, conv: 7.2 },
  Wallet:   { install: 2.4, conv: 1.9 },
};
/* Conversion-rule trigger = the campaign ACTION that opens the attribution window,
 * limited to what each channel actually tracks. */
const TRIGGER_ACTIONS = {
  Email:    ['Received', 'Opened', 'Clicked'],
  SMS:      ['Received', 'Clicked'],
  WhatsApp: ['Received', 'Read', 'Clicked'],
  Wallet:   ['Installed', 'Viewed'],
};

/* ── Mock data — 20 campaigns (10 Email · 4 SMS · 2 WhatsApp · 1 Wallet · 3 Manual) ── */
const RULE_DEFAULT = { trigger: 'Opened', range: 5 };
function d(s) { return new Date(s); }
const CAMPAIGNS_SEED = [
  // ── Email ×10 ──
  { id: '1238', name: 'NL Générale_Juin 2026', channel: 'Email', date: d('2026-06-03'), recipients: 27705,
    open: 22.6, click: 4.1, conv: 0.76, revenue: 30600, openDelta: 6.5, subject: 'Votre actu culturelle du mois', segment: 'Base complète', sendTime: '09:00' },
  { id: '1245', name: '[Email de service] Fermeture exceptionnelle 13h', channel: 'Email', date: d('2026-06-02'), recipients: 37,
    open: 75.7, click: 12.3, conv: 21.6, revenue: 1768, openDelta: 2.1, subject: 'Information pratique', segment: 'Détenteurs billets du jour', sendTime: '08:15' },
  { id: '1220', name: 'NL_SMI_mai 2026', channel: 'Email', date: d('2026-05-28'), recipients: 4344,
    open: 31.6, click: 6.2, conv: 1.4, revenue: 5276, openDelta: 1.8, subject: 'Programmation de printemps', segment: 'Abonnés newsletter', sendTime: '10:30' },
  { id: '1236', name: 'Cérémonie du 28/05 — invitation B2B', channel: 'Email', date: d('2026-05-26'), recipients: 57,
    open: 45.6, click: 18.9, conv: 5.3, revenue: 18479, openDelta: -3.4, subject: 'Vous êtes convié', segment: 'Mécènes & partenaires', sendTime: '14:00' },
  { id: '1221', name: 'Actualité de la recherche en histoire militaire n°155', channel: 'Email', date: d('2026-05-22'), recipients: 2638,
    open: 34.2, click: 5.1, conv: 0.9, revenue: 670, openDelta: 0.4, subject: 'Nouvel article disponible', segment: 'Communauté scientifique', sendTime: '11:00' },
  { id: '1237', name: 'Actualité de la recherche en histoire militaire n°156', channel: 'Email', date: d('2026-05-05'), recipients: 2629,
    open: 34.0, click: 0.0, conv: 0.0, revenue: 0, openDelta: -1.2, subject: 'Nouvel article disponible', segment: 'Communauté scientifique', sendTime: '11:00' }, // EDGE: zero revenue
  { id: '1205', name: 'Offre printemps — invitation aux adhérents avec un nom volontairement très long pour tester la troncature', channel: 'Email', date: d('2026-04-28'), recipients: 9120,
    open: 28.9, click: 7.4, conv: 2.1, revenue: 12430, openDelta: 3.2, subject: 'Offre réservée aux adhérents', segment: 'Adhérents actifs', sendTime: '09:30' }, // EDGE: long name
  { id: '1198', name: 'Relance abonnement saison 26/27', channel: 'Email', date: d('2026-04-14'), recipients: 6210,
    open: 41.2, click: 9.8, conv: 3.6, revenue: 22840, openDelta: 5.1, subject: 'Renouvelez votre abonnement', segment: 'Abonnés saison expirée', sendTime: '17:00' },
  { id: '1182', name: 'Save the date — Nuit des musées', channel: 'Email', date: d('2026-03-30'), recipients: 18430,
    open: 26.4, click: 3.9, conv: 0.6, revenue: 4120, openDelta: -4.8, subject: 'Réservez la date', segment: 'Grand public', sendTime: '12:00' }, // EDGE: negative delta
  { id: '1169', name: 'Billetterie ouverte — exposition temporaire', channel: 'Email', date: d('2026-03-18'), recipients: 14080,
    open: 33.1, click: 8.2, conv: 2.9, revenue: 28760, openDelta: 2.7, subject: 'Les billets sont en vente', segment: 'Visiteurs récents', sendTime: '10:00' },
  // ── SMS ×4 (open NOT tracked) ──
  { id: '1240', name: 'SMS Rappel concert ce soir', channel: 'SMS', date: d('2026-06-04'), recipients: 1820,
    delivery: 98.4, click: 11.2, conv: 6.8, revenue: 9240, openDelta: null, subject: 'Rappel J-0', segment: 'Détenteurs billets concert', sendTime: '16:00' },
  { id: '1212', name: 'SMS Vente flash week-end', channel: 'SMS', date: d('2026-05-16'), recipients: 5400,
    delivery: 97.1, click: 8.6, conv: 4.2, revenue: 14180, openDelta: null, subject: 'Vente flash -20%', segment: 'Acheteurs 12 derniers mois', sendTime: '10:00' },
  { id: '1190', name: 'SMS Dernières places expo', channel: 'SMS', date: d('2026-04-09'), recipients: 3120,
    delivery: 98.9, click: 9.4, conv: 5.1, revenue: 8650, openDelta: null, subject: 'Dernières places', segment: 'Liste d\'attente', sendTime: '11:30' },
  { id: '1176', name: 'SMS Confirmation atelier famille', channel: 'SMS', date: d('2026-03-24'), recipients: 410,
    delivery: 99.2, click: 14.1, conv: 9.3, revenue: 2110, openDelta: null, subject: 'Atelier confirmé', segment: 'Inscrits atelier', sendTime: '09:00' },
  // ── WhatsApp ×2 ──
  { id: '1242', name: 'WhatsApp Programme du mois', channel: 'WhatsApp', date: d('2026-06-06'), recipients: 2240,
    delivery: 96.8, read: 71.4, click: 18.9, conv: 7.2, revenue: 11320, openDelta: 4.3, subject: 'Le programme de juin', segment: 'Opt-in WhatsApp', sendTime: '18:30' },
  { id: '1208', name: 'WhatsApp Invitation vernissage', channel: 'WhatsApp', date: d('2026-05-11'), recipients: 860,
    delivery: 97.5, read: 78.2, click: 24.6, conv: 12.1, revenue: 6480, openDelta: 6.0, subject: 'Vernissage privé', segment: 'VIP & mécènes', sendTime: '19:00' },
  // ── Wallet ×1 (open/click NOT tracked) ──
  { id: '1244', name: 'Wallet Carte de fidélité — mise à jour', channel: 'Wallet', date: d('2026-06-01'), recipients: 3960,
    views: 1840, install: 62.0, conv: 1.9, revenue: 1290, openDelta: null, subject: 'Votre carte mise à jour', segment: 'Porteurs de carte', sendTime: '08:00' },
  // ── Manual / offline ×3 (engagement n/a) ──
  { id: 'M-01', name: 'Mailing papier — saison 26/27', channel: 'Manual', date: d('2026-05-20'), recipients: 5000,
    conv: null, revenue: 8400, openDelta: null, subject: 'Campagne courrier postal', segment: 'Abonnés historiques', sendTime: '—', isManual: true, cost: 2300 }, // EDGE: revenue, no engagement
  { id: 'M-02', name: 'Affichage urbain — exposition', channel: 'Manual', date: d('2026-04-22'), recipients: 0,
    conv: null, revenue: 3100, openDelta: null, subject: 'Campagne affichage 4x3', segment: 'Hors base', sendTime: '—', isManual: true, cost: 5400 },
  { id: 'M-03', name: 'Encart presse locale', channel: 'Manual', date: d('2026-03-15'), recipients: 0,
    conv: null, revenue: 0, openDelta: null, subject: 'Demi-page quotidien régional', segment: 'Hors base', sendTime: '—', isManual: true, cost: 1800 },
].map((c) => ({ isManual: false, cost: null, rule: { ...RULE_DEFAULT }, editableOnline: ['description'], ...c }));

/* ── Daily sales series (~90 days) — general sales trend, with a spike + a flat stretch ── */
function buildDailySales() {
  const out = [];
  const start = new Date('2026-03-12');
  for (let i = 0; i < 91; i++) {
    const day = new Date(start); day.setDate(start.getDate() + i);
    const base = 5200 + Math.sin(i / 6) * 900 + (i > 55 && i < 66 ? 4200 : 0) - (i > 30 && i < 42 ? 1600 : 0);
    const wobble = ((i * 37) % 11) * 90;
    out.push({ date: day, sales: Math.round(base + wobble) });
  }
  return out;
}
const DAILY_SALES = buildDailySales();

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const nf = new Intl.NumberFormat('fr-FR');
const eur = (n) => n == null ? '—' : nf.format(Math.round(n)) + ' €';
const pct = (n) => n == null ? '—' : `${n.toFixed(1)} %`;
const fmtDate = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
const mdLabel = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
const daysAgo = (dt) => Math.round((NOW - dt) / 86400000);
const metricValue = (c, m) => ({ open: c.open, click: c.click, delivery: c.delivery, read: c.read, install: c.install, views: c.views, conv: c.conv }[m]);

const RANGE_PRESETS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 180, label: 'Last 6 months' },
  { value: 365, label: 'Last 12 months' },
];

/* ── Delta pill ──────────────────────────────────────────────────────────── */
function Delta({ value, size = 'b3' }) {
  if (value == null) return null;
  const up = value >= 0;
  const color = value === 0 ? DS.textSecondary : up ? DS.feedbackSuccess : DS.feedbackError;
  const Tr = value === 0 ? Ico.TrendFlat : up ? Ico.TrendUp : Ico.TrendDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color, ...TY[size], fontFamily: DS.ff, fontWeight: 600 }}>
      <Tr s={14} c={color} />{up && value !== 0 ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

/* ── Channel tag ─────────────────────────────────────────────────────────── */
function ChannelTag({ channel }) {
  const meta = CH[channel];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999,
                   background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, ...TY.b3, fontFamily: DS.ff,
                   color: DS.textDefault, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {meta.icon(13, meta.color)}{meta.label}{channel === 'Manual' && ' · offline'}
    </span>
  );
}

/* ════════════════════════════════ TABS ═══════════════════════════════════ */
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${DS.borderDefault}` }}>
      {tabs.map((t) => {
        const on = t.value === active;
        return (
          <button key={t.value} type="button" onClick={() => onChange(t.value)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                     padding: '0 2px 12px', fontFamily: DS.ff, ...TY.b1, fontWeight: 500,
                     color: on ? DS.actionPrimary : DS.navText, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {t.icon}{t.label}
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 4, borderRadius: '4px 4px 0 0', background: DS.navActiveTab }} />}
          </button>
        );
      })}
    </div>
  );
}

function ChartFrame({ title, sub, right, children, height = 260 }) {
  return (
    <Card style={CARD}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SP.tight, gap: SP.tight }}>
        <div>
          <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</div>
          {sub && <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  );
}

/* ════════════════ Channel funnel — fill-box columns, with dropdown ═══════ */
function ChannelFunnel({ channel, onChannel, stages, loading }) {
  const BOX_H = 72;
  return (
    <Card style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SP.card, gap: SP.tight, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>
          {CH[channel].icon(18, DS.actionPrimary)} {CH[channel].label} funnel summary
        </div>
        <div style={{ width: 200 }}>
          <Select value={channel} onChange={onChannel} options={ONLINE.map((c) => ({ value: c, label: CH[c].label }))} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: SP.gap }}>
        {stages.map((st) => {
          const noData = !loading && (st.value == null || st.value === 0);
          const dColor = st.delta == null ? DS.textSecondary : st.delta >= 0 ? DS.feedbackSuccess : DS.feedbackError;
          const fillH = st.value != null ? Math.max(4, Math.min(100, st.value)) : 0;
          return (
            <div key={st.k} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.label}</div>
              {loading
                ? <div style={{ margin: '4px 0 8px' }}><Skeleton w={96} h={22} /></div>
                : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '3px 0 8px' }}>
                    <span style={{ ...TY.h4, fontFamily: DS.ff, color: noData ? DS.textSecondary : DS.textDefault }}>
                      {st.value == null ? '0.00' : st.value.toFixed(2)}%
                    </span>
                    {st.delta != null && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...TY.b3, fontFamily: DS.ff, color: dColor, fontWeight: 600 }}>
                        {st.delta >= 0 ? '▲' : '▼'} {Math.abs(st.delta).toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              {/* fill box — height proportional to the rate; "no activity" when empty */}
              <div style={{ height: BOX_H, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 10,
                            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading
                  ? <Skeleton w={'82%'} h={BOX_H - 14} r={6} />
                  : noData
                    ? <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textPlaceholder }}>no activity</span>
                    : <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillH}%`,
                                    background: DS.actionPrimary, borderRadius: fillH >= 99 ? 8 : '4px 4px 8px 8px' }} />}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Attributed revenue by channel (donut) ───────────────────────────────── */
function ChannelDonut({ composition, total }) {
  return (
    <ChartFrame title="Attributed revenue by channel" sub="Selected période" height={240}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SP.gap, height: '100%' }}>
        <div style={{ width: 168, height: '100%', position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={composition} dataKey="revenue" nameKey="channel" innerRadius={50} outerRadius={76} paddingAngle={2} stroke="none">
                {composition.map((e) => <Cell key={e.channel} fill={CHART[e.channel]} />)}
              </Pie>
              <RTooltip formatter={(v, n) => [eur(v), n]} contentStyle={{ borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>Total</span>
            <span style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff }}>{eur(total)}</span>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {composition.map((e) => (
            <div key={e.channel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: CHART[e.channel], flexShrink: 0 }} />
              <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, flex: 1 }}>{e.channel}</span>
              <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600 }}>{eur(e.revenue)}</span>
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, width: 46, textAlign: 'right' }}>
                {e.share > 0 && e.share < 0.5 ? '~0%' : `${e.share.toFixed(0)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}

/* ── Revenue over time (revenue only, stacked by channel) ────────────────── */
function RevenueOverTime({ buckets }) {
  return (
    <ChartFrame title="Revenue over time" sub="Attributed revenue · selected période" height={240}>
      <ResponsiveContainer>
        <BarChart data={buckets} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }} tickLine={false} axisLine={{ stroke: DS.borderDefault }} />
          <YAxis tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
          <RTooltip formatter={(v, n) => [eur(v), n]} contentStyle={{ borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: DS.ff, fontSize: 12 }} />
          {ONLINE.map((ch) => <Bar key={ch} dataKey={ch} name={ch} stackId="s" fill={CHART[ch]} maxBarSize={26} radius={[2, 2, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ════ Tab 2 — Conversions generated vs. total sales + campaign sends ══════ */
function ConversionsVsSales({ series, markers, periode }) {
  return (
    <Card style={CARD}>
      <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        Conversions generated vs. total sales
      </div>
      <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, margin: '2px 0 12px' }}>
        Cumulative over the selected période — campaign sends marked on the timeline below
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={series} margin={{ top: 6, right: 10, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DS.feedbackSuccess} stopOpacity={0.32} />
                <stop offset="100%" stopColor={DS.feedbackSuccess} stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DS.actionPrimary} stopOpacity={0.45} />
                <stop offset="100%" stopColor={DS.actionPrimary} stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }} tickLine={false} axisLine={{ stroke: DS.borderDefault }} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 11, fill: DS.textSecondary, fontFamily: DS.ff }} tickLine={false} axisLine={false} />
            <RTooltip formatter={(v, n) => [nf.format(v), n === 'sales' ? 'Total sales' : 'Conversions generated']}
                      contentStyle={{ borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontFamily: DS.ff, fontSize: 12 }} formatter={(v) => v === 'sales' ? 'Total sales' : 'Conversions generated'} />
            <Area type="monotone" dataKey="sales" name="sales" stroke={DS.feedbackSuccess} strokeWidth={2} fill="url(#gSales)" />
            <Area type="monotone" dataKey="conv" name="conv" stroke={DS.actionPrimary} strokeWidth={2} fill="url(#gConv)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Campaign sends timeline */}
      <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${DS.borderDefault}` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary,
                      textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
          <Ico.Campaigns s={14} c={DS.textSecondary} /> Campaign sends
        </div>
        <div style={{ position: 'relative', height: 40, marginLeft: 48, marginRight: 12 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 18, height: 1, background: DS.borderDefault }} />
          {markers.map((m) => {
            const left = Math.min(99, Math.max(0, ((periode - daysAgo(m.date)) / periode) * 100));
            return (
              <div key={m.id} title={`${m.name} · ${m.channel} · ${eur(m.revenue)}`}
                   style={{ position: 'absolute', left: `${left}%`, top: 6, transform: 'translateX(-50%)' }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                               background: DS.bgCard, border: `1.5px solid ${CH[m.channel].color}` }}>
                  <Ico.Campaigns s={14} c={CH[m.channel].color} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ── Campaign detail drawer (Modal variant="panel") ──────────────────────── */
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: `1px solid ${DS.borderDefault}` }}>
      <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
      <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function CampaignDrawer({ campaign, rule, onClose }) {
  if (!campaign) return null;
  const meta = CH[campaign.channel];
  const appliedRule = rule || campaign.rule;
  const offline = campaign.isManual;
  const kpis = offline
    ? [['Reach', nf.format(campaign.recipients)], ['Attributed revenue', eur(campaign.revenue)], ['Cost', eur(campaign.cost)]]
    : [['Recipients', nf.format(campaign.recipients)], ['Conversion', pct(campaign.conv)], ['Attributed revenue', eur(campaign.revenue)]];
  const stages = offline ? [] : (FUNNEL[campaign.channel] || []);
  return (
    <Modal open onClose={onClose} variant="panel" width={420} title="Campaign detail">
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>{meta.icon(20, meta.color)}<ChannelTag channel={campaign.channel} /></div>
        <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 2 }}>{campaign.name}</div>
        <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 18 }}>#{campaign.id} · {fmtDate(campaign.date)} · {campaign.sendTime}</div>

        <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 6 }}>Dedicated KPIs</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {kpis.map(([l, v]) => (
            <div key={l} style={{ flex: 1, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: 12 }}>
              <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{l}</div>
              <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.actionPrimary, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        {!offline && (
          <>
            <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 2 }}>Funnel</div>
            {stages.map((s) => {
              const v = s.k === 'conv' ? campaign.conv : (metricValue(campaign, s.k) ?? s.def);
              return <DetailRow key={s.k} label={s.label} value={v == null ? 'Not tracked' : pct(v)} />;
            })}
          </>
        )}
        {offline && (
          <div style={{ background: DS.feedbackInfoBg, border: `1px solid ${DS.feedbackInfo}`, borderRadius: 10, padding: 12, marginBottom: 18,
                        ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo, display: 'flex', gap: 8 }}>
            <Ico.Info s={16} c={DS.feedbackInfo} /> Offline campaign — engagement is not tracked. Revenue counts toward the total; rates are excluded from averages.
          </div>
        )}

        <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, margin: '18px 0 2px' }}>Campaign info</div>
        <DetailRow label="Subject" value={campaign.subject} />
        <DetailRow label="Segment" value={campaign.segment} />
        <DetailRow label="Send time" value={campaign.sendTime} />
        {!offline && <DetailRow label="Conversion rule" value={`${appliedRule.trigger} · within ${appliedRule.range}d`} />}
      </div>
    </Modal>
  );
}

/* ── Log campaign modal ──────────────────────────────────────────────────── */
const EMPTY_LOG = { name: '', channel: 'Manual', date: '', recipients: '', cost: '' };
function LogCampaignModal({ open, onClose, onSave }) {
  const [f, setF] = React.useState(EMPTY_LOG);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { if (open) { setF(EMPTY_LOG); setSaving(false); } }, [open]);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() && f.date.trim();
  function save() { setSaving(true); setTimeout(() => { onSave({ ...f }); setSaving(false); onClose(); }, 700); }
  return (
    <Modal open={open} onClose={onClose} variant="center" width={520} title="Log a campaign"
      footer={<div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <Btn type="Tertiary" onClick={onClose}>Cancel</Btn>
                <Btn type="Primary" disabled={!valid || saving} onClick={save} iconLeft={saving ? undefined : <Ico.Check s={16} />}>{saving ? 'Saving…' : 'Save campaign'}</Btn>
              </div>}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: SP.gap }}>
        <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
          Log an offline campaign (postal, print, OOH…) so it's analyzed alongside online ones. Bounded fields only.
        </div>
        <Field label="Campaign name" value={f.name} onChange={(e) => set('name')(e.target.value)} placeholder="e.g. Mailing papier — saison 26/27" />
        <div style={{ display: 'flex', gap: SP.tight }}>
          <Select label="Channel / type" width="100%" value={f.channel} onChange={set('channel')}
                  options={[{ value: 'Manual', label: 'Offline / Manual' }, ...ONLINE.map((c) => ({ value: c, label: CH[c].label }))]} />
          <Field label="Date sent" type="date" value={f.date} onChange={(e) => set('date')(e.target.value)} style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: SP.tight }}>
          <Field label="Reach / recipients" type="number" value={f.recipients} onChange={(e) => set('recipients')(e.target.value)} placeholder="0" style={{ flex: 1 }} />
          <Field label="Cost (optional)" type="number" value={f.cost} onChange={(e) => set('cost')(e.target.value)} placeholder="€" style={{ flex: 1 }} />
        </div>
      </div>
    </Modal>
  );
}

/* ── Conversion rules dialog (admin) — simple stacked form ───────────────── */
function FormField({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault }}>{label}</div>
      {hint && <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{hint}</div>}
      <div style={{ marginTop: 2 }}>{children}</div>
    </div>
  );
}
function ConversionRulesDialog({ open, onClose, rules, onSave, isAdmin }) {
  const [draft, setDraft] = React.useState(rules);
  const [active, setActive] = React.useState('Email');
  React.useEffect(() => { if (open) { setDraft(rules); setActive('Email'); } }, [open, rules]);
  const RANGES = [{ value: 3, label: '3 days' }, { value: 5, label: '5 days' }, { value: 7, label: '7 days' }];
  const setRule = (ch, patch) => setDraft((d2) => ({ ...d2, [ch]: { ...d2[ch], ...patch } }));
  const r = draft[active];
  const actions = TRIGGER_ACTIONS[active].map((a) => ({ value: a, label: a }));
  return (
    <Modal open={open} onClose={onClose} variant="center" width={540} title="Conversion rules"
      footer={<div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
                {!isAdmin && <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginRight: 'auto' }}>Read-only — admin access required to edit.</span>}
                <Btn type="Tertiary" onClick={onClose}>Close</Btn>
                <Btn type="Primary" disabled={!isAdmin} onClick={() => { onSave(draft); onClose(); }} iconLeft={<Ico.Refresh s={16} />}>Save &amp; recompute</Btn>
              </div>}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: SP.section }}>
        {!isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.feedbackWarningBg, border: `1px solid ${DS.feedbackWarning}`,
                        borderRadius: 8, padding: '8px 12px', ...TY.b3, fontFamily: DS.ff, color: DS.feedbackWarning }}>
            <Ico.Warn s={16} c={DS.feedbackWarning} /> You're viewing as a client — these rules are read-only.
          </div>
        )}

        {/* Channel tabs — all channels visible; pick one to configure */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${DS.borderDefault}` }}>
          {ONLINE.map((ch) => {
            const on = ch === active;
            return (
              <button key={ch} type="button" onClick={() => setActive(ch)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px 12px',
                         display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: DS.ff, ...TY.b2, fontWeight: on ? 600 : 400,
                         color: on ? DS.actionPrimary : DS.textSecondary }}>
                {CH[ch].icon(15, on ? DS.actionPrimary : DS.textSecondary)}{CH[ch].label}
                {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, borderRadius: '3px 3px 0 0', background: DS.actionPrimary }} />}
              </button>
            );
          })}
        </div>

        <FormField label="Trigger action" hint="The campaign action that opens the conversion window.">
          <Select width="100%" value={r.trigger} options={actions} disabled={!isAdmin} onChange={(v) => setRule(active, { trigger: v })} />
        </FormField>

        <FormField label="Attribution window" hint="How long an order is counted as a conversion after the action.">
          <Select width="100%" value={r.range} options={RANGES} disabled={!isAdmin} onChange={(v) => setRule(active, { range: v })} />
        </FormField>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: '12px 14px' }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: DS.blue100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico.Info s={14} c={DS.actionPrimary} />
          </span>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            A conversion is attributed when a contact who{' '}
            <strong style={{ color: DS.textDefault, fontWeight: 600 }}>{r.trigger.toLowerCase()}</strong> the {CH[active].label} campaign places an order within{' '}
            <strong style={{ color: DS.textDefault, fontWeight: 600 }}>{r.range} days</strong>.
          </span>
        </div>
      </div>
    </Modal>
  );
}

/* ── Shared picker trigger (used by both the quick filter and the range picker) ── */
function PickerTrigger({ icon, label, onClick }) {
  return (
    <Btn type="Secondary" iconLeft={icon} iconRight={<Ico.ChevDown s={16} />} onClick={onClick}>
      {label}
    </Btn>
  );
}

/* ── Range picker — calendar trigger + presets + "since a date" ──────────── */
function RangePicker({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [since, setSince] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const current = RANGE_PRESETS.find((p) => p.value === value);
  const label = current ? current.label : `Last ${value} days`;
  const applySince = () => { if (since) { onChange(Math.max(1, daysAgo(new Date(since)))); setOpen(false); } };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <PickerTrigger icon={<Ico.Calendar s={16} c={DS.textSecondary} />} label={label} open={open} minWidth={210} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 50, width: 250, background: DS.bgCard,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', padding: 6 }}>
          {RANGE_PRESETS.map((p) => {
            const on = p.value === value;
            return (
              <div key={p.value} role="button" onClick={() => { onChange(p.value); setOpen(false); }}
                   onMouseEnter={(e) => (e.currentTarget.style.background = on ? DS.blue100 : DS.actionSecondaryHover)}
                   onMouseLeave={(e) => (e.currentTarget.style.background = on ? DS.blue100 : 'transparent')}
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6,
                            cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: on ? DS.actionPrimary : DS.textDefault,
                            fontWeight: on ? 600 : 400, background: on ? DS.blue100 : 'transparent' }}>
                {p.label}{on && <Ico.Check s={16} c={DS.actionPrimary} />}
              </div>
            );
          })}
          <div style={{ borderTop: `1px solid ${DS.borderDefault}`, margin: '6px 4px', paddingTop: 10 }}>
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, padding: '0 6px 6px' }}>Since a specific date</div>
            <div style={{ display: 'flex', gap: 6, padding: '0 6px 4px', alignItems: 'flex-end' }}>
              <Field type="date" value={since} onChange={(e) => setSince(e.target.value)} style={{ flex: 1 }} />
              <Btn type="Secondary" size="Small" disabled={!since} onClick={applySince}>Apply</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════ PAGE ═══════════════════════════════════ */
export default function PerformanceV3() {
  const [role, setRole] = React.useState('admin');
  const [demo, setDemo] = React.useState('ready');
  const [tab, setTab] = React.useState('sales');   // 'sales' → "Performances" (default, first), 'performance' → "Campaigns"
  const [funnelChannel, setFunnelChannel] = React.useState('Email');
  const [periode, setPeriode] = React.useState(90);
  const [channelFilter, setChannelFilter] = React.useState('all');
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [campaigns, setCampaigns] = React.useState(CAMPAIGNS_SEED);
  const [drawer, setDrawer] = React.useState(null);
  const [logOpen, setLogOpen] = React.useState(false);
  const [rulesOpen, setRulesOpen] = React.useState(false);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [recomputing, setRecomputing] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [rules, setRules] = React.useState({
    Email: { trigger: 'Opened', range: 5 }, SMS: { trigger: 'Clicked', range: 3 },
    WhatsApp: { trigger: 'Read', range: 5 }, Wallet: { trigger: 'Installed', range: 7 },
  });
  const optRef = React.useRef(null);
  const quickRef = React.useRef(null);
  const isAdmin = role === 'admin';
  const loading = demo === 'loading' || recomputing;
  const errored = demo === 'error';
  const forceEmpty = demo === 'empty';

  React.useEffect(() => {
    const f = (e) => {
      if (optRef.current && !optRef.current.contains(e.target)) setOptionsOpen(false);
      if (quickRef.current && !quickRef.current.contains(e.target)) setQuickOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  React.useEffect(() => { setPage(1); }, [periode, channelFilter, tab]);
  const fireToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  /* ── Derived data ── */
  const filtered = React.useMemo(() => {
    if (forceEmpty) return [];
    return campaigns
      .filter((c) => daysAgo(c.date) <= periode)
      .filter((c) => channelFilter === 'all' || c.channel === channelFilter)
      .sort((a, b) => b.date - a.date);
  }, [campaigns, periode, channelFilter, forceEmpty]);

  const revenue = React.useMemo(() => filtered.reduce((s, c) => s + (c.revenue || 0), 0), [filtered]);

  /* Headline KPI value cards (cross-channel) */
  const kpiValues = React.useMemo(() => {
    const online = filtered.filter((c) => !c.isManual);
    const reach = online.reduce((s, c) => s + (c.recipients || 0), 0);
    const conversions = Math.round(online.reduce((s, c) => s + (c.conv != null ? c.recipients * c.conv / 100 : 0), 0));
    return {
      revenue,
      revDelta: filtered.length ? 6.5 : null,
      conversions,
      convRate: reach ? (conversions / reach) * 100 : null,
      count: filtered.length,
    };
  }, [filtered, revenue]);

  /* Per-channel funnel stages (Delivery → … → Placed order, channel-aware) */
  const funnelStages = React.useMemo(() => {
    const list = filtered.filter((c) => c.channel === funnelChannel);
    const avg = (k) => { const xs = list.map((c) => metricValue(c, k)).filter((v) => v != null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    return (FUNNEL[funnelChannel] || []).map((st) => ({
      k: st.k,
      label: st.label,
      value: list.length ? (avg(st.k) ?? st.def ?? 0) : null,   // null → "no activity"
      delta: list.length ? ((FUNNEL_DELTA[funnelChannel] || {})[st.k] ?? null) : null,
    }));
  }, [filtered, funnelChannel]);

  const composition = React.useMemo(() => {
    const by = {}; let total = 0;
    ONLINE.forEach((ch) => { by[ch] = 0; });
    filtered.forEach((c) => { if (!c.isManual && by[c.channel] != null) { by[c.channel] += c.revenue || 0; total += c.revenue || 0; } });
    return ONLINE.map((ch) => ({ channel: ch, revenue: by[ch], share: total ? (by[ch] / total) * 100 : 0 }));
  }, [filtered]);

  const buckets = React.useMemo(() => {
    const weeks = Math.min(13, Math.ceil(periode / 7));
    const arr = Array.from({ length: weeks }, (_, i) => {
      const row = { label: `S-${weeks - 1 - i}` }; ONLINE.forEach((ch) => { row[ch] = 0; }); return row;
    });
    filtered.forEach((c) => {
      if (c.isManual) return;
      const idx = arr.length - 1 - Math.floor(daysAgo(c.date) / 7);
      if (idx >= 0 && idx < arr.length) arr[idx][c.channel] += c.revenue || 0;
    });
    return arr;
  }, [filtered, periode]);

  /* Tab 2 — cumulative conversions vs total sales over the période */
  const series = React.useMemo(() => {
    const start = new Date(NOW); start.setDate(NOW.getDate() - periode);
    const days = DAILY_SALES.filter((p) => p.date >= start && p.date <= NOW);
    const convByDay = {};
    filtered.filter((c) => !c.isManual).forEach((c) => {
      const key = c.date.toDateString();
      convByDay[key] = (convByDay[key] || 0) + Math.round((c.recipients || 0) * (c.conv || 0) / 100);
    });
    const full = days.reduce((acc, p) => {
      const prev = acc[acc.length - 1] || { sales: 0, conv: 0 };
      acc.push({
        label: mdLabel(p.date),
        sales: prev.sales + Math.round(p.sales / 48),         // €→orders (~48€ avg order)
        conv: prev.conv + (convByDay[p.date.toDateString()] || 0),
      });
      return acc;
    }, []);
    const step = Math.max(1, Math.round(full.length / 30));
    return full.filter((_, i) => i % step === 0 || i === full.length - 1);
  }, [filtered, periode]);

  /* ── Actions ── */
  function handleLogSave(form) {
    const c = {
      id: 'M-' + uid(), name: form.name, channel: form.channel || 'Manual',
      date: form.date ? new Date(form.date) : new Date(NOW), recipients: Number(form.recipients) || 0,
      conv: null, revenue: 0, openDelta: null, subject: 'Logged manually', segment: form.channel === 'Manual' ? 'Hors base' : '—',
      sendTime: '—', isManual: form.channel === 'Manual', cost: form.cost ? Number(form.cost) : null,
      rule: { ...RULE_DEFAULT }, editableOnline: ['description'],
    };
    setCampaigns((s) => [c, ...s]);
    fireToast('Campaign logged — added to the timeline');
  }
  function handleRulesSave(next) {
    setRules(next); setRulesOpen(false); setRecomputing(true);
    setTimeout(() => { setRecomputing(false); fireToast('Conversion rules updated — figures recomputed'); }, 1600);
  }
  function handleDelete(c) { setCampaigns((s) => s.filter((x) => x.id !== c.id)); setConfirmDel(null); fireToast('Campaign deleted'); }

  /* ── Banner row ── */
  function campaignBanner(c, compact = false) {
    const meta = CH[c.channel];
    // Columns common to every campaign only — channel-specific stats (open/delivery/install) live in the drawer.
    const cols = compact
      ? [{ label: 'Date', value: fmtDate(c.date), basis: '90px' }, { label: 'Revenue', value: eur(c.revenue), basis: '110px' }]
      : [
          { label: 'Date', value: fmtDate(c.date), basis: '96px' },
          { label: 'Contacts', value: c.recipients ? nf.format(c.recipients) : '—', basis: '100px' },
          { label: 'Conv.', value: c.isManual ? 'n/a' : pct(c.conv), basis: '88px' },
          { label: 'Revenue', value: eur(c.revenue), basis: '116px' },
        ];
    const actions = (
      <ActionMenu items={[
        { label: 'Open', icon: <Ico.Eye s={16} c={DS.blue500} />, onClick: () => setDrawer(c) },
        { label: c.isManual ? 'Edit' : 'Edit description', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => fireToast(c.isManual ? 'Edit manual campaign (prototype)' : 'Edit description only — tracked metrics locked') },
        { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, danger: true, hidden: !c.isManual, onClick: () => setConfirmDel(c) },
      ]} />
    );
    return (
      <Banner key={c.id} icon={meta.icon(20, meta.color)} iconBg={DS.bgSurface}
              title={c.name} badge={<ChannelTag channel={c.channel} />}
              description={`#${c.id} · ${c.subject} · ${c.segment}`}
              columns={cols} actions={actions} onClick={() => setDrawer(c)} dim={c.isManual} />
    );
  }

  const PER = 20;
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pageItems = filtered.slice((page - 1) * PER, page * PER);

  function listArea(compact) {
    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} style={{ padding: SP.card }}><div style={{ display: 'flex', alignItems: 'center', gap: SP.gap }}><Skeleton w={44} h={44} r={10} /><div style={{ flex: 1 }}><Skeleton w={240} h={14} /><div style={{ height: 8 }} /><Skeleton w={160} h={10} /></div><Skeleton w={90} h={12} /></div></Card>
    ))}</div>;
    if (errored) return <ErrorState title="Couldn't load campaign data." sub="Some channels may be temporarily unavailable. Other data still renders." onRetry={() => setDemo('ready')} />;
    if (!pageItems.length) return <EmptyState icon={<Ico.Campaigns s={24} c={DS.textSecondary} />} title="No campaigns in this period"
      sub="Adjust the filters or log a campaign to populate the analysis." cta={<Btn type="Secondary" iconLeft={<Ico.Plus s={16} />} onClick={() => setLogOpen(true)}>Log a campaign</Btn>} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pageItems.map((c) => campaignBanner(c, compact))}
        {pages > 1 && <div style={{ marginTop: 6 }}><Pagination page={page} pages={pages} setPage={setPage} /></div>}
      </div>
    );
  }

  return (
    <div style={{ background: DS.bgPage, minHeight: '100%', paddingBottom: 48 }}>
      <StatePreview groups={[
        { label: 'Role', value: role, onChange: setRole, options: ['admin', 'client'] },
        { label: 'State', value: demo, onChange: setDemo, options: ['ready', 'loading', 'empty', 'error'] },
      ]} />

      {/* ── Page header ── */}
      <PageHeader
        icon={<Ico.Campaigns s={20} c={DS.actionPrimary} />}
        title="Performances"
        description="Cross-channel campaign performance & attributed revenue"
        actions={<>
          <Btn type="Primary" iconLeft={<Ico.Plus s={16} />} onClick={() => setLogOpen(true)}>Create campaign</Btn>
          <div ref={optRef} style={{ position: 'relative' }}>
            <Btn type="Secondary" iconRight={<Ico.ChevDown s={16} />} onClick={() => setOptionsOpen((o) => !o)}>Options</Btn>
            {optionsOpen && (
              <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 40, width: 200, background: DS.bgCard,
                            border: `1px solid ${DS.borderDefault}`, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 6 }}>
                {[['Import', <Ico.Download s={16} c={DS.textSecondary} />], ['Synchronise', <Ico.Refresh s={16} c={DS.textSecondary} />]].map(([l, ic]) => (
                  <div key={l} role="button" onClick={() => { setOptionsOpen(false); fireToast(`${l} (prototype)`); }}
                       onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
                       onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                       style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
                    {ic}{l}
                  </div>
                ))}
              </div>
            )}
          </div>
          <IconBtn type="Secondary" icon={<Ico.Settings s={18} c={isAdmin ? DS.actionPrimary : DS.actionDisabledText} />}
                   aria-label="Conversion rules" onClick={() => setRulesOpen(true)} style={!isAdmin ? { opacity: 0.55 } : undefined} />
        </>}
      />

      {/* ── Controls — quick filter + range, right-aligned ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP.tight, padding: `${SP.card}px ${SP.page}px 0` }}>
        {recomputing && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo }}>
            <Ico.Refresh s={14} c={DS.feedbackInfo} /> Recomputing…
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: SP.tight }}>
          {/* Quick filter — channel */}
          <div ref={quickRef} style={{ position: 'relative' }}>
            <PickerTrigger icon={<Ico.Filter s={16} c={DS.textSecondary} />}
                           label={channelFilter === 'all' ? 'All channels' : CH[channelFilter].label}
                           open={quickOpen} minWidth={190} onClick={() => setQuickOpen((o) => !o)} />
            {quickOpen && (
              <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 40, width: 200, background: DS.bgCard,
                            border: `1px solid ${DS.borderDefault}`, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 6 }}>
                {[{ value: 'all', label: 'All channels' }, ...['Email', 'SMS', 'WhatsApp', 'Wallet', 'Manual'].map((c) => ({ value: c, label: CH[c].label }))].map((o) => {
                  const on = o.value === channelFilter;
                  return (
                    <div key={o.value} role="button" onClick={() => { setChannelFilter(o.value); setQuickOpen(false); }}
                         onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
                         onMouseLeave={(e) => (e.currentTarget.style.background = on ? DS.blue100 : 'transparent')}
                         style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 10px', borderRadius: 6,
                                  cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: on ? DS.actionPrimary : DS.textDefault,
                                  fontWeight: on ? 600 : 400, background: on ? DS.blue100 : 'transparent' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {o.value !== 'all' && CH[o.value].icon(15, on ? DS.actionPrimary : DS.textSecondary)}{o.label}
                        </span>
                        {on && <Ico.Check s={16} c={DS.actionPrimary} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <RangePicker value={periode} onChange={setPeriode} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: `${SP.tight}px ${SP.page}px 0` }}>
        <TabBar active={tab} onChange={setTab}
          tabs={[
            { value: 'sales', label: 'Performances', icon: <Ico.TrendUp s={18} c={tab === 'sales' ? DS.actionPrimary : DS.navText} /> },
            { value: 'performance', label: 'Campaigns', icon: <Ico.Campaigns s={18} c={tab === 'performance' ? DS.actionPrimary : DS.navText} /> },
          ]} />
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: `${SP.section}px ${SP.page}px`, display: 'flex', flexDirection: 'column', gap: SP.section }}>
        {/* Headline KPI value cards — shared across both tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP.gap }}>
          <KpiCard title="Attributed revenue" loading={loading} accent={DS.textDefault} value={eur(kpiValues.revenue)}
                   icon={<Ico.Chart s={16} c={DS.actionPrimary} />}
                   sub={kpiValues.revDelta != null ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Delta value={kpiValues.revDelta} /> vs. période préc.</span> : '—'} />
          <KpiCard title="Conversions" loading={loading} accent={DS.textDefault} value={nf.format(kpiValues.conversions)}
                   icon={<Ico.Cart s={16} c={DS.actionPrimary} />} sub="orders attributed" />
          <KpiCard title="Conversion rate" loading={loading} accent={DS.textDefault} value={pct(kpiValues.convRate)}
                   icon={<Ico.TrendUp s={16} c={DS.actionPrimary} />} sub="of recipients" />
          <KpiCard title="Campaigns sent" loading={loading} accent={DS.textDefault} value={nf.format(kpiValues.count)}
                   icon={<Ico.Campaigns s={16} c={DS.actionPrimary} />} sub="in selected période" />
        </div>

        {tab === 'performance' ? (
          <>
            {!errored && !forceEmpty && (
              <ChannelFunnel channel={funnelChannel} onChannel={setFunnelChannel} stages={funnelStages} loading={loading} />
            )}
            {errored && <ErrorState onRetry={() => setDemo('ready')} />}

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SP.tight }}>
                <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>Campaigns</span>
                {!loading && !errored && <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>{filtered.length} campaign{filtered.length > 1 ? 's' : ''} · most recent first</span>}
              </div>
              {listArea(false)}
            </div>
          </>
        ) : (
          <>
            {loading ? <Card style={{ padding: SP.card }}><Skeleton w={'50%'} h={18} /><div style={{ height: 12 }} /><Skeleton w={'100%'} h={260} /></Card>
              : errored ? <ErrorState onRetry={() => setDemo('ready')} />
              : forceEmpty ? <EmptyState icon={<Ico.TrendUp s={24} c={DS.textSecondary} />} title="No sales data in this period" sub="Adjust the période to see conversions vs. total sales." />
              : (
                <>
                  <ConversionsVsSales series={series} markers={filtered.filter((c) => !c.isManual)} periode={periode} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP.gap }}>
                    <ChannelDonut composition={composition} total={revenue} />
                    <RevenueOverTime buckets={buckets} />
                  </div>
                </>
              )}
          </>
        )}
      </div>

      {/* ── Overlays ── */}
      <CampaignDrawer campaign={drawer} rule={drawer && !drawer.isManual ? rules[drawer.channel] : null} onClose={() => setDrawer(null)} />
      <LogCampaignModal open={logOpen} onClose={() => setLogOpen(false)} onSave={handleLogSave} />
      <ConversionRulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} rules={rules} onSave={handleRulesSave} isAdmin={isAdmin} />
      {confirmDel && (
        <ConfirmDialog title="Delete this campaign?" danger confirmLabel="Delete"
          body={`"${confirmDel.name}" will be removed and its revenue dropped from the aggregates. This can't be undone.`}
          onConfirm={() => handleDelete(confirmDel)} onCancel={() => setConfirmDel(null)} />
      )}
      <Toast toast={toast} />
    </div>
  );
}
