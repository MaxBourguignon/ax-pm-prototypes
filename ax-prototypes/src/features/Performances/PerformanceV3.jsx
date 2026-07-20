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
import { Field, TextArea } from '../../components/Field';
import Select from '../../components/Select';
import BannerTable, { BannerIdentity } from '../../components/BannerTable';
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
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

let _uid = 100;
const uid = () => String(_uid++);

/* Spacing scale — consistent rhythm across the page */
const SP = { page: 32, section: 20, card: 16, gap: 16, tight: 12 };
/* Soft SaaS card elevation + radius */
const SHADOW = '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)';
const CARD = { padding: SP.card, boxShadow: SHADOW, borderRadius: 12 };

/* Canonical text tiers — one system for every card header & category label on the page.
 *  · title   — card heading
 *  · sub     — one-line description under a title
 *  · eyebrow — small uppercase category/column label (stat cards, table headers) */
const LBL = {
  title:   { ...TY.h4, fontFamily: DS.ff, color: DS.textDefault },
  sub:     { ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary },
  eyebrow: { ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
};
function CardHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: SP.tight, marginBottom: SP.card }}>
      <div style={{ minWidth: 0 }}>
        <div style={LBL.title}>{title}</div>
        {sub && <div style={{ ...LBL.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

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
/* Distinct per-channel accent (Channel performance donut + Campaigns list).
 * All values are DS palette tokens. */
const CHANNEL_TEXT = {
  Email:    DS.actionPrimary, // blue
  SMS:      DS.coral,         // light rose / red
  WhatsApp: DS.greenBrand,    // green
  Wallet:   DS.purple600,     // purple
  Manual:   DS.textSecondary, // neutral / offline
};

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
/* Representative per-recipient send cost by channel (prototype) — drives ROI/ROAS.
 * Manual campaigns carry a real, explicitly-logged cost instead. */
const COST_PER_RECIPIENT = { Email: 0.012, SMS: 0.045, WhatsApp: 0.038, Wallet: 0.02, Manual: 0 };
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
].map((c) => {
  const base = { isManual: false, cost: null, rule: { ...RULE_DEFAULT }, editableOnline: ['description'], ...c };
  // Derive a send cost for online channels when not explicitly provided (Manual carries its real, logged cost).
  if (base.cost == null && !base.isManual) base.cost = Math.round((base.recipients || 0) * (COST_PER_RECIPIENT[base.channel] || 0));
  return base;
});

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
const pct = (n, d = 1) => n == null ? '—' : `${n.toFixed(d).replace('.', ',')} %`;
const fmtDate = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
const mdLabel = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
const daysAgo = (dt) => Math.round((NOW - dt) / 86400000);
const metricValue = (c, m) => ({ open: c.open, click: c.click, delivery: c.delivery, read: c.read, install: c.install, views: c.views, conv: c.conv }[m]);
const trunc = (s, n = 32) => (s && s.length > n ? s.slice(0, n) + '…' : s);
const median = (arr) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const RANGE_PRESETS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: 180, label: 'Last 6 months' },
  { value: 365, label: 'Last 12 months' },
];

/* Per-channel funnel benchmarks ("norm") — what a healthy rate looks like for each stage. */
const BENCHMARKS = {
  Email:    { delivery: 99, open: 30, click: 6, conv: 1.8 },
  SMS:      { delivery: 98, click: 9, conv: 5 },
  WhatsApp: { delivery: 97, read: 72, click: 18, conv: 8 },
  Wallet:   { install: 60, conv: 1.8 },
};

/* ── Peer / market benchmarks — "clients of the same type" (sector + size bucket).
 * Prototype values: peer median (p50) and top-quartile (p75) across similar Arenametrix
 * clients. Drives the Analysis tab's market-comparison block & benchmark recommendations. */
const MARKET = {
  convRate:   { med: 2.4, p75: 4.0 },    // overall conversion rate (%)
  revPerSend: { med: 0.50, p75: 0.85 },  // attributed revenue per recipient (€)
  channelConv: {                         // per-channel conversion rate (%)
    Email:    { med: 1.8, p75: 3.2 },
    SMS:      { med: 5.0, p75: 7.5 },
    WhatsApp: { med: 8.0, p75: 12.0 },
    Wallet:   { med: 1.8, p75: 3.0 },
  },
  revPerContact: {                       // per-channel attributed revenue per contact (€), peer median
    Email: 1.10, SMS: 2.50, WhatsApp: 4.50, Wallet: 0.60,
  },
};

/* ── Buyer-profile model — who actually converts, by channel ───────────────────
 * Drives the Analysis tab's "Typical buyer" block. We have no per-purchase identity
 * in the prototype, so each online channel carries a representative demographic skew
 * of its converters (age / gender / location). The block aggregates these across the
 * filtered campaigns, weighted by each campaign's estimated converters, so the profile
 * shifts as the channel/period filters change. Offline (Manual) campaigns carry no
 * individual identity and are excluded. Each distribution sums to 100. */
const AGE_BANDS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
const GENDERS = ['Female', 'Male', 'Other'];
const LOCATIONS = ['Local', 'Regional', 'National'];
/* Customer relationship tier — first purchase ever, repeat buyer, or a promoter
 * (high-frequency / high-value advocate). */
const TIERS = ['First-time buyer', 'Regular buyer', 'Promoter'];
const PROFILE = {
  Email:    { age: [5, 12, 18, 24, 23, 18], gender: [58, 40, 2], loc: [46, 34, 20], tier: [22, 58, 20] },
  SMS:      { age: [12, 24, 26, 20, 12, 6],  gender: [55, 43, 2], loc: [58, 30, 12], tier: [30, 52, 18] },
  WhatsApp: { age: [18, 30, 24, 15, 9, 4],   gender: [52, 46, 2], loc: [50, 32, 18], tier: [18, 50, 32] },
  Wallet:   { age: [8, 20, 24, 22, 16, 10],  gender: [60, 38, 2], loc: [68, 24, 8],  tier: [10, 55, 35] },
};

/* ── Products / events purchased after a campaign — drives the drawer's Stats pie.
 * No per-order line items in the prototype, so each campaign's attributed revenue is
 * split across a representative product mix, deterministically derived from its id
 * (stable across renders). */
const PRODUCT_CATS = [
  { key: 'Tickets',       color: DS.blue500 },
  { key: 'Subscriptions', color: DS.teal500 },
  { key: 'Memberships',   color: DS.purple600 },
  { key: 'Workshops',     color: DS.orange500 },
  { key: 'Shop',          color: DS.amber600 },
];
function productMix(campaign) {
  const rev = campaign.revenue || 0;
  if (rev <= 0) return [];
  const seed = Number(String(campaign.id).replace(/\D/g, '')) || 1;
  const weights = PRODUCT_CATS.map((_, i) => ((seed * (i + 3)) % 7) + 1);
  const tot = weights.reduce((a, b) => a + b, 0);
  return PRODUCT_CATS
    .map((c, i) => ({ name: c.key, color: c.color, value: Math.round((weights[i] / tot) * rev) }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
}

/* ── Delta tag — canonical "vs market/period" indicator. Plain colored text,
 * ▲/▼ glyph, green up / red down. ─────────────────────────────────────────────── */
function DeltaTag({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  const color = up ? DS.feedbackSuccess : DS.feedbackError;
  return (
    <span style={{ ...TY.b3, fontFamily: DS.ff, color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {`${up ? '▲' : '▼'} ${Math.abs(Math.round(value))} %`}
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
function TabBar({ tabs, active, onChange, tone = 'default' }) {
  const onGradient = tone === 'gradient';
  const activeColor = onGradient ? '#FFFFFF' : DS.actionPrimary;
  const idleColor = onGradient ? 'rgba(255,255,255,0.72)' : DS.navText;
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${onGradient ? 'rgba(255,255,255,0.28)' : DS.borderDefault}` }}>
      {tabs.map((t) => {
        const on = t.value === active;
        return (
          <button key={t.value} type="button" onClick={() => onChange(t.value)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                     padding: '0 2px 12px', fontFamily: DS.ff, ...TY.b1, fontWeight: 500,
                     color: on ? activeColor : idleColor, display: 'inline-flex', alignItems: 'center' }}>
            {t.label}
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 4, borderRadius: '4px 4px 0 0', background: onGradient ? '#FFFFFF' : DS.navActiveTab }} />}
          </button>
        );
      })}
    </div>
  );
}

function ChartFrame({ title, sub, right, children, height = 260 }) {
  return (
    <Card style={CARD}>
      <CardHead title={title} sub={sub} right={right} />
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  );
}

/* ════════════════ Channel funnel — fill-box columns, with dropdown ═══════ */
function ChannelFunnel({ channel, onChannel, stages, loading }) {
  const BOX_H = 72;
  return (
    <Card style={CARD}>
      <CardHead title="Channel funnel" sub="Stage conversion vs benchmark — for the selected channel"
                right={<div style={{ width: 200 }}>
                  <Select value={channel} onChange={onChannel} options={ONLINE.map((c) => ({ value: c, label: CH[c].label }))} />
                </div>} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: SP.gap }}>
        {stages.map((st) => {
          const noData = !loading && (st.value == null || st.value === 0);
          const fillH = st.value != null ? Math.max(4, Math.min(100, st.value)) : 0;
          return (
            <div key={st.k} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.label}</div>
              {loading
                ? <div style={{ margin: '4px 0 8px' }}><Skeleton w={96} h={22} /></div>
                : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '3px 0 8px' }}>
                    <span style={{ ...TY.h4, fontFamily: DS.ff, color: noData ? DS.textSecondary : DS.textDefault }}>
                      {pct(st.value ?? 0, 2)}
                    </span>
                    <DeltaTag value={st.delta} plain />
                  </div>
                )}
              {/* fill box — height proportional to the rate; "no activity" when empty. Dashed line = benchmark. */}
              <div style={{ height: BOX_H, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 10,
                            position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading
                  ? <Skeleton w={'82%'} h={BOX_H - 14} r={6} />
                  : noData
                    ? <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textPlaceholder }}>no activity</span>
                    : <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillH}%`,
                                    background: DS.actionPrimary, borderRadius: fillH >= 99 ? 8 : '4px 4px 8px 8px' }} />}
                {!loading && !noData && st.bench != null && (
                  <div title={`Benchmark ${pct(st.bench)}`} style={{ position: 'absolute', left: 0, right: 0,
                              bottom: `${Math.min(100, st.bench)}%`, height: 0, borderTop: `2px dashed ${DS.textSecondary}`, opacity: 0.5 }} />
                )}
              </div>
              {!loading && !noData && st.bench != null && (
                <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  norm {pct(st.bench)}
                  <span style={{ fontWeight: 600, color: st.value >= st.bench ? DS.feedbackSuccess : DS.feedbackError }}>
                    · {st.value >= st.bench ? 'above' : 'below'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ════ Tab 2 — Conversions generated vs. total sales + campaign sends ══════ */
function ConversionsVsSales({ series, markers, periode, onMarker }) {
  const [hovered, setHovered] = React.useState(null);
  return (
    <Card style={CARD}>
      <CardHead title="Conversions generated vs. total sales" sub="Cumulative over the selected period — campaign sends marked on the timeline below" />
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
            const on = hovered === m.id;
            return (
              <div key={m.id} role={onMarker ? 'button' : undefined} onClick={() => onMarker && onMarker(m)}
                   onMouseEnter={() => setHovered(m.id)} onMouseLeave={() => setHovered(null)}
                   style={{ position: 'absolute', left: `${left}%`, top: 6, transform: 'translateX(-50%)', cursor: onMarker ? 'pointer' : 'default', zIndex: on ? 60 : 1 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                               background: on ? CH[m.channel].color : DS.bgCard, border: `1.5px solid ${CH[m.channel].color}` }}>
                  <Ico.Campaigns s={14} c={on ? DS.textInverse : CH[m.channel].color} />
                </span>
                {on && (
                  <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', width: 220, textAlign: 'left',
                                background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.16)', padding: 12 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6, ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>
                      {CH[m.channel].icon(14, CHANNEL_TEXT[m.channel] || CH[m.channel].color)}{CH[m.channel].label}
                    </div>
                    <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600, lineHeight: 1.3,
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.name}</div>
                    <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, margin: '2px 0 8px' }}>Sent {fmtDate(m.date)}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, ...TY.b3, fontFamily: DS.ff }}>
                      <span style={{ color: DS.textSecondary }}>Contacts</span>
                      <span style={{ color: DS.textDefault, fontWeight: 600 }}>{m.recipients ? nf.format(m.recipients) : '—'}</span>
                    </div>
                    {onMarker && <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.actionPrimary, marginTop: 8 }}>Click to open detail</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ── Campaign detail drawer (Modal variant="panel") ──────────────────────── */
/* Read-only field — borderless list item: small label above, value below. */
function InfoField({ label, value, last }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0',
                  borderBottom: last ? 'none' : `1px solid ${DS.borderDefault}` }}>
      <span style={{ fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>{label}</span>
      <span style={{ fontFamily: DS.ff, ...TY.b1, color: DS.textDefault, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
/* Stats KPI mini-card — eyebrow label + value (compact). */
function StatCard({ label, value }) {
  return (
    <div style={{ background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ ...LBL.eyebrow }}>{label}</div>
      <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, marginTop: 3 }}>{value}</div>
    </div>
  );
}
/* Funnel stage as a labelled progress bar — value right-aligned, fill ∝ rate. */
function FunnelBar({ label, value }) {
  const known = value != null;
  const w = known ? Math.max(2, Math.min(100, value)) : 0;
  return (
    <div style={{ padding: '9px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
        <span style={{ ...TY.b2, fontFamily: DS.ff, color: known ? DS.textDefault : DS.textPlaceholder, fontWeight: 700 }}>{known ? pct(value) : 'Not tracked'}</span>
      </div>
      <div style={{ height: 8, background: DS.bgSurface, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', borderRadius: 999, background: DS.actionPrimary }} />
      </div>
    </div>
  );
}
function CampaignDrawer({ campaign, onClose, onToast }) {
  const [tab, setTab] = React.useState('info');
  const [editing, setEditing] = React.useState(false);
  const [desc, setDesc] = React.useState('');
  const campaignId = campaign && campaign.id;
  // Reset tab + edit mode + description when a different campaign opens (keyed by id).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { setTab('info'); setEditing(false); setDesc((campaign && campaign.description) || ''); }, [campaignId]);
  if (!campaign) return null;
  const meta = CH[campaign.channel];
  const offline = campaign.isManual;
  const stages = offline ? [] : (FUNNEL[campaign.channel] || []);
  const products = productMix(campaign);
  const toast = (m) => onToast && onToast(m);
  const revPerContact = campaign.recipients ? campaign.revenue / campaign.recipients : null;
  const resetDesc = () => setDesc(campaign.description || '');
  const handleClose = () => { setEditing(false); resetDesc(); onClose(); };

  const infoRows = [
    { label: 'Campaign', value: campaign.name },
    { label: 'Campaign ID', value: `#${campaign.id}` },
    { label: 'Channel', value: `${meta.label}${offline ? ' · offline' : ''}` },
    { label: 'Subject', value: campaign.subject },
    { label: 'Segment', value: campaign.segment },
    { label: 'Sent on', value: `${fmtDate(campaign.date)} · ${campaign.sendTime}` },
    { label: 'Recipients', value: campaign.recipients ? nf.format(campaign.recipients) : '—' },
    { label: 'Send cost', value: campaign.cost != null ? eur(campaign.cost) : '—' },
  ];

  const statCards = [
    { label: 'Revenue generated', value: eur(campaign.revenue) },
    { label: 'Revenue / contact', value: revPerContact != null ? eurCents(revPerContact) : '—' },
    { label: 'Conversion rate', value: offline ? 'n/a' : pct(campaign.conv) },
    { label: 'Recipients', value: campaign.recipients ? nf.format(campaign.recipients) : '—' },
  ];

  return (
    <Modal open onClose={handleClose} variant="panel" width={520} title="Campaign detail"
           headerContent={
             <TabBar active={tab} onChange={setTab} tone="gradient" tabs={[
               { value: 'info',  label: 'Information' },
               { value: 'stats', label: 'Stats' },
             ]} />
           }
           footer={
             editing ? (
               <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                 <Btn type="Secondary" onClick={() => { resetDesc(); setEditing(false); }}>Cancel</Btn>
                 <Btn type="Primary" iconLeft={<Ico.Check s={16} />}
                      onClick={() => { setEditing(false); toast('Description saved (prototype)'); }}>Save</Btn>
               </div>
             ) : (
               <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                 <Btn type="Secondary" iconLeft={<Ico.Edit s={16} />} onClick={() => { setTab('info'); setEditing(true); }}>Edit</Btn>
                 <Btn type="Primary" onClick={handleClose}>Close</Btn>
               </div>
             )
           }>
      <div style={{ padding: 20 }}>
        {/* Quick actions — top of the page, across both tabs */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
          <IconBtn icon={<Ico.Form s={16} />} type="Secondary" size="Small" aria-label="Open campaign template"
                   onClick={() => toast('Opening campaign template (prototype)')} />
          <IconBtn icon={<Ico.Export s={16} />} type="Secondary" size="Small" aria-label="Open report in another tool"
                   onClick={() => toast('Opening report in external analytics tool (prototype)')} />
        </div>
        {tab === 'info' ? (
          /* ── Tab 1 — everything about the campaign, as a borderless field list ── */
          <div>
            {infoRows.map((r) => <InfoField key={r.label} label={r.label} value={r.value} />)}
            {editing ? (
              <div style={{ paddingTop: 16 }}>
                <TextArea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)}
                          placeholder="Add a description for this campaign…" rows={3} />
              </div>
            ) : (
              <InfoField label="Description" value={desc || 'No description'} last />
            )}
          </div>
        ) : (
          /* ── Tab 2 — Stats: KPIs + funnel + products/events purchased ── */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
              {statCards.map((s) => <StatCard key={s.label} label={s.label} value={s.value} />)}
            </div>

            {offline ? (
              <div style={{ background: DS.feedbackInfoBg, border: `1px solid ${DS.feedbackInfo}`, borderRadius: 10, padding: 12,
                            ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo, display: 'flex', gap: 8 }}>
                <Ico.Info s={16} c={DS.feedbackInfo} /> Offline campaign — engagement is not tracked. Revenue counts toward the total; rates are excluded from averages.
              </div>
            ) : (
              <>
                <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 4 }}>Funnel</div>
                {stages.map((s) => {
                  const v = s.k === 'conv' ? campaign.conv : (metricValue(campaign, s.k) ?? s.def);
                  return <FunnelBar key={s.k} label={s.label} value={v == null ? null : v} />;
                })}
              </>
            )}

            <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, margin: '24px 0 2px' }}>Products & events purchased</div>
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 14 }}>Attributed revenue split by what buyers purchased</div>
            {products.length === 0 ? (
              <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>No attributed purchases for this campaign.</div>
            ) : (
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={products} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none"
                           label={pieLabel} labelLine={false}>
                        {products.map((p) => <Cell key={p.name} fill={p.color} />)}
                      </Pie>
                      <RTooltip formatter={(v, n) => [eur(v), n]} contentStyle={{ borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {products.map((p) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: 3, background: p.color }} />
                      <span style={{ flex: 1, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>{p.name}</span>
                      <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 700 }}>{eur(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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

/* ── Range label helper (presets + custom "since" fallback) ──────────────── */
function rangeLabel(value) {
  const current = RANGE_PRESETS.find((p) => p.value === value);
  return current ? current.label : `Last ${value} days`;
}

/* ── Filter dialog — manage channel + date range together ─────────────────── */
function FilterDialog({ open, onClose, channel, periode, onApply }) {
  const [draftChannel, setDraftChannel] = React.useState(channel);
  const [draftPeriode, setDraftPeriode] = React.useState(periode);
  const [since, setSince] = React.useState('');
  React.useEffect(() => { if (open) { setDraftChannel(channel); setDraftPeriode(periode); setSince(''); } }, [open, channel, periode]);

  const channelOpts = [{ value: 'all', label: 'All channels' }, ...['Email', 'SMS', 'WhatsApp', 'Wallet', 'Manual'].map((c) => ({ value: c, label: CH[c].label }))];
  const applySince = (v) => { setSince(v); if (v) setDraftPeriode(Math.max(1, daysAgo(new Date(v)))); };

  return (
    <Modal open={open} onClose={onClose} variant="center" width={540} title="Filter"
      footer={<div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <Btn type="Tertiary" onClick={onClose}>Cancel</Btn>
                <Btn type="Primary" iconLeft={<Ico.Filter s={16} />} onClick={() => { onApply(draftChannel, draftPeriode); onClose(); }}>Apply filters</Btn>
              </div>}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: SP.section }}>
        <FormField label="Channel" hint="Limit the analysis to a single channel, or show all.">
          <Select width="100%" value={draftChannel} options={channelOpts} onChange={setDraftChannel} />
        </FormField>

        <FormField label="Date range" hint="Period analysed across every chart and the campaign list.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RANGE_PRESETS.map((p) => {
              const on = !since && p.value === draftPeriode;
              return (
                <button key={p.value} type="button" onClick={() => { setSince(''); setDraftPeriode(p.value); }}
                  style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: 8, fontFamily: DS.ff, ...TY.b2,
                           border: `1px solid ${on ? DS.actionPrimary : DS.borderDefault}`,
                           background: on ? DS.blue100 : DS.bgCard, color: on ? DS.actionPrimary : DS.textDefault, fontWeight: on ? 600 : 400 }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <FormField label="Since a specific date" hint="Analyse everything from a chosen start date up to today.">
          <Field type="date" value={since} onChange={(e) => applySince(e.target.value)} />
        </FormField>
      </div>
    </Modal>
  );
}

/* ── Recommendations — AI-style auto-generated, prioritized takeaways ─────────── */
const INSIGHT_TONE = {
  positive: { bg: DS.feedbackSuccessBg, bd: DS.feedbackSuccess, fg: DS.feedbackSuccess, tag: 'Opportunity', icon: (s, c) => <Ico.TrendUp s={s} c={c} /> },
  warning:  { bg: DS.feedbackWarningBg, bd: DS.feedbackWarning, fg: DS.feedbackWarning, tag: 'Watch-out',  icon: (s, c) => <Ico.Warn s={s} c={c} /> },
  neutral:  { bg: DS.bgSurface,         bd: DS.borderDefault,   fg: DS.actionPrimary,   tag: 'Insight',    icon: (s, c) => <Ico.Chart s={s} c={c} /> },
};
/* ── Recommendations — a simple list of prioritized takeaways, each with an action ── */
function ActionRecommendations({ items }) {
  if (!items.length) return null;
  return (
    <Card style={{ ...CARD, flex: 1, minWidth: 340 }}>
      <CardHead title="Recommendations" sub="Prioritized actions from your data" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, i) => {
          const t = INSIGHT_TONE[it.tone] || INSIGHT_TONE.neutral;
          return (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${DS.borderDefault}` }}>
              <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: '50%', background: t.fg, marginTop: 7 }} />
              <span style={{ flex: 1, minWidth: 0, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, lineHeight: 1.45 }}>
                {it.text}
                {it.cta && (
                  <button type="button" onClick={it.cta.onClick}
                          style={{ marginLeft: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                   ...TY.b2, fontFamily: DS.ff, color: DS.actionPrimary, fontWeight: 600 }}>
                    {it.cta.label} →
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* Donut slice label — percentage, drawn inside the ring; hidden for tiny slices. */
const PIE_RAD = Math.PI / 180;
function pieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + r * Math.cos(-midAngle * PIE_RAD);
  const y = cy + r * Math.sin(-midAngle * PIE_RAD);
  return <text x={x} y={y} fill={DS.textInverse} fontSize={11} fontWeight={600} fontFamily={DS.ff} textAnchor="middle" dominantBaseline="central">{pct(percent * 100, 0)}</text>;
}

/* ── Channel performance — revenue split (donut) + detailed table, one card ──── */
function ChannelPerformance({ rows, total, onSelect }) {
  const pick = (ch) => { if (onSelect && rows.find((r) => r.channel === ch && r.revenue > 0)) onSelect(ch); };
  const GRID = '1.5fr 1.2fr 0.8fr 1fr 0.9fr';
  const head = (t, r) => <span style={{ ...LBL.eyebrow, textAlign: r ? 'right' : 'left' }}>{t}</span>;
  const val = { ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, textAlign: 'right' };
  return (
    <ChartFrame title="Channel performance" sub="Revenue split, share, conversion & ROI by channel — click a channel to filter · selected period" height="auto">
      {rows.length === 0 ? (
        <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>No channel activity for this selection.</div>
      ) : (
        <div style={{ display: 'flex', gap: SP.section, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Revenue split donut — total in the centre */}
          <div style={{ width: 200, height: 200, position: 'relative', flexShrink: 0, margin: '0 auto' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={rows} dataKey="revenue" nameKey="channel" innerRadius={58} outerRadius={88} paddingAngle={2} stroke="none"
                     label={pieLabel} labelLine={false}
                     onClick={(e) => e && pick(e.channel || (e.payload && e.payload.channel))} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
                  {rows.map((r) => <Cell key={r.channel} fill={CHANNEL_TEXT[r.channel] || DS.neutralLGrey} />)}
                </Pie>
                <RTooltip formatter={(v, n) => [eur(v), n]} contentStyle={{ borderRadius: 8, border: `1px solid ${DS.borderDefault}`, fontFamily: DS.ff, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>Total</span>
              <span style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff }}>{eur(total)}</span>
            </div>
          </div>
          {/* Detailed table — doubles as the donut legend (matching colours) */}
          <div style={{ flex: 1, minWidth: 340, overflowX: 'auto' }}>
            <div style={{ minWidth: 420 }}>
              <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: SP.tight, padding: '0 4px 8px', borderBottom: `1px solid ${DS.borderDefault}` }}>
                {head('Channel')}{head('Revenue', true)}{head('Share', true)}{head('Conv. rate', true)}{head('Campaigns', true)}
              </div>
              {rows.map((r) => {
                const color = CHANNEL_TEXT[r.channel] || DS.textDefault;
                const clickable = onSelect && r.revenue > 0;
                return (
                  <div key={r.channel} role={clickable ? 'button' : undefined} onClick={() => pick(r.channel)}
                       onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = DS.actionSecondaryHover; }}
                       onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                       style={{ display: 'grid', gridTemplateColumns: GRID, gap: SP.tight, alignItems: 'center', padding: '10px 4px', borderBottom: `1px solid ${DS.borderDefault}`, borderRadius: 6, cursor: clickable ? 'pointer' : 'default' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
                      {CH[r.channel].icon(15, color)}{CH[r.channel].label}
                    </span>
                    <span style={{ ...val, fontWeight: 700 }}>{eur(r.revenue)}</span>
                    <span style={val}>{pct(r.share, 0)}</span>
                    <span style={val}>{r.convRate == null ? 'n/a' : pct(r.convRate)}</span>
                    <span style={val}>{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </ChartFrame>
  );
}

/* ── Compare palette — YOU vs MARKET. Uses the brand gradient endpoints
 * (blue → teal, mirroring DS.gradientBlueV) so the analysis reads as part of the
 * same visual system. ─────────────────────────────────────────────────────────── */
const GRAD_BLUE = '#017BFE';   // gradient start (blue)
const GRAD_TEAL = '#34C9AE';   // gradient end (teal)
const C_YOU = GRAD_BLUE;       // blue — "you"
const C_MKT = GRAD_TEAL;       // teal — "market / peers"

const eurShort = (v) => {
  if (v == null) return '—';
  if (v >= 10000) return Math.round(v / 1000) + ' k€';
  if (v >= 1000) return (v / 1000).toFixed(1).replace('.', ',') + ' k€';
  return nf.format(Math.round(v)) + ' €';
};
const eurCents = (v) => (v == null ? '—' : v.toFixed(2).replace('.', ',') + ' €');

/* ── Channel pill (text only) — used in the ranked lists ─────────────────────── */
function MiniTag({ channel }) {
  return (
    <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, background: DS.bgSurface,
                   border: `1px solid ${DS.borderDefault}`, borderRadius: 6, padding: '1px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {CH[channel].label}
    </span>
  );
}

/* ── Top banner — two cards: top revenue campaign + top converting campaign,
 * each with a small mention of the runner-up. ───────────────────────────────── */
function TopCard({ label, icon, items, valOf, onOpen }) {
  const first = items[0], second = items[1];
  return (
    <Card style={{ ...CARD, padding: 18, paddingLeft: 22, flex: '1 1 300px', minWidth: 300, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg, ${GRAD_BLUE} 0%, ${GRAD_TEAL} 100%)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...LBL.eyebrow, marginBottom: 8 }}>
        {icon} {label}
      </div>
      {!first ? (
        <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>No campaigns in this selection.</div>
      ) : (
        <>
          <div role="button" onClick={() => onOpen(first.c)}
               onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
               onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
               style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderRadius: 8, cursor: 'pointer' }}>
            <span style={{ flex: 1, minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ minWidth: 0, ...TY.b1, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{first.c.name}</span>
              <MiniTag channel={first.c.channel} />
            </span>
            <span style={{ flexShrink: 0, ...TY.h3, fontFamily: DS.ff, color: DS.textDefault }}>{valOf(first)}</span>
          </div>
          {second && (
            <div role="button" onClick={() => onOpen(second.c)}
                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, marginTop: 6, cursor: 'pointer' }}>
              <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>2nd · {trunc(second.c.name, 26)}</span>
              <span style={{ flexShrink: 0, color: DS.textDefault, fontWeight: 600 }}>{valOf(second)}</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function TopBanner({ byRevenue, byConversion, onOpen }) {
  return (
    <div style={{ display: 'flex', gap: SP.gap, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <TopCard label="Top revenue" icon={<Ico.TrendUp s={14} c={DS.feedbackSuccess} />} items={byRevenue} valOf={(x) => x.main} onOpen={onOpen} />
      <TopCard label="Top converting" icon={<Ico.Cart s={14} c={DS.actionPrimary} />} items={byConversion} valOf={(x) => `${x.main} · ${x.sub}`} onOpen={onOpen} />
    </div>
  );
}

/* ── Diverging "you vs market" comparison — value hugs each bar end ──────────── */
const CMP_GRID = '128px 1fr 1fr';
function DivergingRow({ market, you, metric, decimals, scaleMax }) {
  const fmt = (v) => pct(v, decimals);
  const w = (v) => `${Math.max(2, Math.min(100, (v / scaleMax) * 100))}%`;
  const delta = market > 0 ? ((you - market) / market) * 100 : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: CMP_GRID, alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>{metric}</span>
      {/* market — value hugging the left end of the bar (bar grows toward the centre) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
        <span style={{ flexShrink: 0, ...TY.b3, fontFamily: DS.ff, color: C_MKT, fontWeight: 600 }}>{fmt(market)}</span>
        <div style={{ flexShrink: 1, minWidth: 0, width: w(market), height: 14, background: C_MKT, borderRadius: '7px 0 0 7px' }} />
      </div>
      {/* you — bar from the centre, value + variation chip hugging its right end */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8, minWidth: 0 }}>
        <div style={{ flexShrink: 1, minWidth: 0, width: w(you), height: 14, background: C_YOU, borderRadius: '0 7px 7px 0' }} />
        <span style={{ flexShrink: 0, ...TY.b3, fontFamily: DS.ff, color: C_YOU, fontWeight: 700 }}>{fmt(you)}</span>
        <span style={{ flexShrink: 0 }}><DeltaTag value={delta} /></span>
      </div>
    </div>
  );
}

/* ── Market comparison — metric bars + revenue-per-contact (all channels), one card ── */
function MarketComparison({ rows, rpcCampaigns, rpcMarket }) {
  const scaleMax = (Math.max(1, ...rows.flatMap((r) => [r.market, r.you])) * 1.6) || 1;
  const reach = rpcCampaigns.reduce((s, c) => s + (c.recipients || 0), 0);
  const rev = rpcCampaigns.reduce((s, c) => s + (c.revenue || 0), 0);
  const you = reach ? rev / reach : 0;
  const delta = rpcMarket > 0 ? ((you - rpcMarket) / rpcMarket) * 100 : 0;
  // per-channel revenue per contact
  const perChannel = ONLINE.map((cn) => {
    const cs = rpcCampaigns.filter((c) => c.channel === cn);
    const r = cs.reduce((s, c) => s + (c.recipients || 0), 0);
    const rv = cs.reduce((s, c) => s + (c.revenue || 0), 0);
    return { cn, value: r ? rv / r : null, market: MARKET.revPerContact[cn] ?? null };
  }).filter((x) => x.value != null);
  return (
    <Card style={{ ...CARD, padding: 18 }}>
      <CardHead title="Market comparison" sub="Your rates vs the peer median · this period" />
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Left — metric bars vs market */}
        <div style={{ flex: '1 1 300px', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: CMP_GRID, gap: 10, marginBottom: 8, ...LBL.eyebrow }}>
            <span />
            <span style={{ textAlign: 'right', color: C_MKT }}>MARKET</span>
            <span style={{ textAlign: 'left', color: C_YOU }}>YOU</span>
          </div>
          {rows.length === 0 ? (
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, padding: '10px 0' }}>No comparable metrics for this selection.</div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {rows.map((r) => <DivergingRow key={r.metric} {...r} scaleMax={scaleMax} />)}
            </div>
          )}
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: DS.borderDefault }} />
        {/* Right — revenue per contact, overall + per channel */}
        <div style={{ flex: '1 1 300px', minWidth: 300, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...LBL.eyebrow, marginBottom: 6 }}>Revenue per contact</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...TY.h3, fontFamily: DS.ff, color: C_YOU }}>{eurCents(you)}</span>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>vs market <span style={{ color: C_MKT, fontWeight: 700 }}>{eurCents(rpcMarket)}</span></span>
            <DeltaTag value={delta} />
          </div>
          <div style={{ borderTop: `1px solid ${DS.borderDefault}`, margin: '14px 0' }} />
          {perChannel.length === 0 ? (
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>No channel activity.</div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 0.8fr', columnGap: 10, alignContent: 'space-between', alignItems: 'center' }}>
              {perChannel.map((x) => {
                const cDelta = x.market > 0 ? ((x.value - x.market) / x.market) * 100 : null;
                return (
                  <React.Fragment key={x.cn}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
                      {CH[x.cn].icon(14, CHANNEL_TEXT[x.cn] || DS.textDefault)}{CH[x.cn].label}
                    </span>
                    <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, fontWeight: 700, textAlign: 'right' }}>{eurCents(x.value)}</span>
                    <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, textAlign: 'right' }}>vs {eurCents(x.market)}</span>
                    <span style={{ justifySelf: 'end' }}><DeltaTag value={cDelta} /></span>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ── Distribution bar group — labelled horizontal bars, share hugging each bar end ── */
function DistGroup({ title, rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div style={{ flex: '1 1 200px', minWidth: 180 }}>
      <div style={{ ...LBL.eyebrow, marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map((r) => {
          const top = r.value === max;
          return (
            <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '78px 1fr 40px', alignItems: 'center', gap: 8 }}>
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: top ? DS.textDefault : DS.textSecondary, fontWeight: top ? 600 : 400, lineHeight: 1.15 }}>{r.label}</span>
              <div style={{ height: 12, background: DS.bgSurface, borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, height: '100%', borderRadius: 6,
                              background: top ? DS.actionPrimary : DS.neutralLGrey }} />
              </div>
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: top ? DS.textDefault : DS.textSecondary, fontWeight: top ? 700 : 400, textAlign: 'right' }}>{pct(r.value, 0)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Buyer profile — the typical customer who converted after a campaign, given the
 * active channel + period filters. Persona summary + age/gender/location breakdown. ── */
function BuyerProfile({ profile }) {
  return (
    <Card style={{ ...CARD, padding: 18 }}>
      <CardHead title="Typical buyer profile"
                sub="Who converted after a campaign — age, gender, location & customer type · current filters" />
      {!profile || profile.buyers === 0 ? (
        <div style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary }}>No tracked conversions for this selection.</div>
      ) : (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <DistGroup title="Age" rows={profile.age} />
          <DistGroup title="Gender" rows={profile.gender} />
          <DistGroup title="Location" rows={profile.loc} />
          <DistGroup title="Customer type" rows={profile.tier} />
        </div>
      )}
    </Card>
  );
}

/* ════════════════════════════════ PAGE ═══════════════════════════════════ */
export default function PerformanceV3() {
  const [role, setRole] = React.useState('admin');
  const [demo, setDemo] = React.useState('ready');
  const [tab, setTab] = React.useState('sales');   // 'sales' → "Performances" (default), 'analysis' → "Analysis"
  const [funnelChannel, setFunnelChannel] = React.useState('Email');
  const [periode, setPeriode] = React.useState(90);
  const [channelFilter, setChannelFilter] = React.useState('all');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState('date');
  const [sortDir, setSortDir] = React.useState('desc');
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
  const isAdmin = role === 'admin';
  const loading = demo === 'loading' || recomputing;
  const errored = demo === 'error';
  const forceEmpty = demo === 'empty';

  React.useEffect(() => {
    const f = (e) => {
      if (optRef.current && !optRef.current.contains(e.target)) setOptionsOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  React.useEffect(() => { setPage(1); }, [periode, channelFilter, tab, sortKey]);
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

  /* Previous comparable period (same length, immediately before) — drives real deltas. */
  const prev = React.useMemo(() => {
    if (forceEmpty) return { revenue: 0, conversions: 0, has: false };
    const list = campaigns
      .filter((c) => { const a = daysAgo(c.date); return a > periode && a <= periode * 2; })
      .filter((c) => channelFilter === 'all' || c.channel === channelFilter);
    const online = list.filter((c) => !c.isManual);
    return {
      revenue: list.reduce((s, c) => s + (c.revenue || 0), 0),
      conversions: Math.round(online.reduce((s, c) => s + (c.conv != null ? c.recipients * c.conv / 100 : 0), 0)),
      has: list.length > 0,
    };
  }, [campaigns, periode, channelFilter, forceEmpty]);
  const deltaPct = (cur, was) => (was > 0 ? ((cur - was) / was) * 100 : null);

  /* Headline KPI value cards (cross-channel) */
  const kpiValues = React.useMemo(() => {
    const online = filtered.filter((c) => !c.isManual);
    const reach = online.reduce((s, c) => s + (c.recipients || 0), 0);
    const conversions = Math.round(online.reduce((s, c) => s + (c.conv != null ? c.recipients * c.conv / 100 : 0), 0));
    return {
      revenue,
      revDelta: filtered.length && prev.has ? deltaPct(revenue, prev.revenue) : null,
      conversions,
      convDelta: filtered.length && prev.has ? deltaPct(conversions, prev.conversions) : null,
      convRate: reach ? (conversions / reach) * 100 : null,
      count: filtered.length,
    };
  }, [filtered, revenue, prev]);

  /* Per-channel funnel stages (Delivery → … → Placed order, channel-aware) */
  const funnelStages = React.useMemo(() => {
    const list = filtered.filter((c) => c.channel === funnelChannel);
    const avg = (k) => { const xs = list.map((c) => metricValue(c, k)).filter((v) => v != null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    return (FUNNEL[funnelChannel] || []).map((st) => ({
      k: st.k,
      label: st.label,
      value: list.length ? (avg(st.k) ?? st.def ?? 0) : null,   // null → "no activity"
      delta: list.length ? ((FUNNEL_DELTA[funnelChannel] || {})[st.k] ?? null) : null,
      bench: (BENCHMARKS[funnelChannel] || {})[st.k] ?? null,
    }));
  }, [filtered, funnelChannel]);

  /* Tab 2 — cumulative conversions vs total sales over the period */
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

  /* Impact-map points — online campaigns with tracked conversions; revenue × conversions.
   * Median lines come from this selection, so quadrants are filter-relative. */
  const impact = React.useMemo(() => {
    const pts = filtered
      .filter((c) => !c.isManual && c.conv != null)
      .map((c) => ({
        id: c.id, name: c.name, channel: c.channel, c,
        x: Math.round((c.recipients || 0) * (c.conv || 0) / 100),  // conversions (count)
        y: c.revenue || 0,                                          // attributed revenue (€)
        z: c.recipients || 0,                                       // reach → bubble size
      }));
    return { pts, medX: median(pts.map((p) => p.x)), medY: median(pts.map((p) => p.y)) };
  }, [filtered]);

  /* Top campaigns — top 3 by revenue and top 3 by conversions (placed-order count). */
  const topCampaigns = React.useMemo(() => {
    const online = filtered.filter((c) => !c.isManual && c.conv != null);
    const convCount = (c) => Math.round((c.recipients || 0) * (c.conv || 0) / 100);
    const byRevenue = [...online].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 2)
      .map((c) => ({ c, main: eurShort(c.revenue) }));
    const byConversion = [...online].sort((a, b) => convCount(b) - convCount(a)).slice(0, 2)
      .map((c) => ({ c, main: nf.format(convCount(c)), sub: pct(c.conv || 0) }));
    return { byRevenue, byConversion };
  }, [filtered]);

  /* "You vs market" rows — reach-weighted you-value vs peer median (BENCHMARKS). */
  const marketRows = React.useMemo(() => {
    const online = filtered.filter((c) => !c.isManual);
    const wavg = (list, key) => {
      const xs = list.filter((c) => c[key] != null);
      if (!xs.length) return null;
      const r = xs.reduce((s, c) => s + (c.recipients || 0), 0);
      return r ? xs.reduce((s, c) => s + c[key] * (c.recipients || 0), 0) / r
               : xs.reduce((s, c) => s + c[key], 0) / xs.length;
    };
    const email = online.filter((c) => c.channel === 'Email');
    const sms = online.filter((c) => c.channel === 'SMS');
    const whatsapp = online.filter((c) => c.channel === 'WhatsApp');
    const reach = online.reduce((s, c) => s + (c.recipients || 0), 0);
    const conv = online.reduce((s, c) => s + (c.conv != null ? (c.recipients || 0) * c.conv / 100 : 0), 0);
    const rows = [
      { metric: 'Email open rate', you: wavg(email, 'open'), market: BENCHMARKS.Email.open, decimals: 1 },
      { metric: 'WhatsApp open rate', you: wavg(whatsapp, 'read'), market: BENCHMARKS.WhatsApp.read, decimals: 1 },
      { metric: 'SMS click rate', you: wavg(sms, 'click'), market: BENCHMARKS.SMS.click, decimals: 1 },
      { metric: 'Email click rate', you: wavg(email, 'click'), market: BENCHMARKS.Email.click, decimals: 1 },
      { metric: 'Conversion rate', you: reach ? (conv / reach) * 100 : null, market: MARKET.convRate.med, decimals: 2 },
    ];
    return rows.filter((r) => r.you != null);
  }, [filtered]);

  /* Campaign list — sortable copy of the filtered set. */
  const listSorted = React.useMemo(() => {
    const roasOf = (c) => (c.cost > 0 ? (c.revenue || 0) / c.cost : -1);
    // Base comparators are descending; sortDir flips them.
    const base = {
      date: (a, b) => b.date - a.date,
      revenue: (a, b) => (b.revenue || 0) - (a.revenue || 0),
      conv: (a, b) => (b.conv || 0) - (a.conv || 0),
      roas: (a, b) => roasOf(b) - roasOf(a),
    }[sortKey] || ((a, b) => b.date - a.date);
    const dir = sortDir === 'asc' ? -1 : 1;
    return [...filtered].sort((a, b) => dir * base(a, b));
  }, [filtered, sortKey, sortDir]);

  const onCampaignSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  /* Top / under-performer flags (by revenue) for the list. */
  const perfFlags = React.useMemo(() => {
    const flags = {};
    if (!filtered.length) return flags;
    const best = filtered.reduce((m, c) => ((c.revenue || 0) > (m.revenue || 0) ? c : m));
    if ((best.revenue || 0) > 0) flags[best.id] = 'top';
    filtered.forEach((c) => { if (!c.isManual && (c.revenue || 0) === 0) flags[c.id] = 'low'; });
    return flags;
  }, [filtered]);

  /* Per-channel comparison rows (Analysis tab). */
  const channelStats = React.useMemo(() => {
    const rows = [...ONLINE, 'Manual'].map((ch) => {
      const cs = filtered.filter((c) => c.channel === ch);
      const online = cs.filter((c) => !c.isManual);
      const revenue = cs.reduce((s, c) => s + (c.revenue || 0), 0);
      const reach = online.reduce((s, c) => s + (c.recipients || 0), 0);
      const conv = online.reduce((s, c) => s + (c.recipients || 0) * (c.conv || 0) / 100, 0);
      return { channel: ch, count: cs.length, revenue, convRate: ch === 'Manual' ? null : (reach ? (conv / reach) * 100 : null) };
    }).filter((r) => r.count > 0);
    const tot = rows.reduce((s, r) => s + r.revenue, 0);
    rows.forEach((r) => { r.share = tot ? (r.revenue / tot) * 100 : 0; });
    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  /* Buyer profile — converters' demographics, aggregated from the filtered online
   * campaigns and weighted by each campaign's estimated converters. */
  const buyerProfile = React.useMemo(() => {
    const age = AGE_BANDS.map(() => 0), gender = GENDERS.map(() => 0), loc = LOCATIONS.map(() => 0), tier = TIERS.map(() => 0);
    let buyers = 0;
    filtered.filter((c) => !c.isManual && c.conv).forEach((c) => {
      const skew = PROFILE[c.channel]; if (!skew) return;
      const w = (c.recipients || 0) * c.conv / 100;   // estimated converters for this campaign
      if (w <= 0) return;
      buyers += w;
      skew.age.forEach((p, i) => { age[i] += (p / 100) * w; });
      skew.gender.forEach((p, i) => { gender[i] += (p / 100) * w; });
      skew.loc.forEach((p, i) => { loc[i] += (p / 100) * w; });
      skew.tier.forEach((p, i) => { tier[i] += (p / 100) * w; });
    });
    if (buyers === 0) return { buyers: 0 };
    const norm = (arr, labels) => arr.map((v, i) => ({ label: labels[i], value: (v / buyers) * 100 }));
    const top = (rows) => rows.reduce((a, b) => (b.value > a.value ? b : a)).label;
    const ageRows = norm(age, AGE_BANDS);          // age stays in natural order
    const genderRows = norm(gender, GENDERS).sort((a, b) => b.value - a.value);
    const locRows = norm(loc, LOCATIONS).sort((a, b) => b.value - a.value);
    const tierRows = norm(tier, TIERS);            // tier stays in lifecycle order (first → regular → promoter)
    return {
      buyers: Math.round(buyers),
      age: ageRows, gender: genderRows, loc: locRows, tier: tierRows,
      topAge: top(ageRows), topGender: genderRows[0].label, topLoc: locRows[0].label, topTier: top(tierRows),
    };
  }, [filtered]);

  /* Smart recommendations — quadrant- & benchmark-driven, ranked by potential impact. */
  const smartRecs = React.useMemo(() => {
    if (loading || errored || !filtered.length) return [];
    const out = [];
    const { pts, medX, medY } = impact;
    const online = filtered.filter((c) => !c.isManual);

    // Scale-ups — high conversions, below-median revenue (bottom-right): efficient & under-invested.
    const scaleUps = pts.filter((p) => p.x >= medX && p.y < medY).sort((a, b) => b.x - a.x);
    if (scaleUps.length) {
      const p = scaleUps[0];
      out.push({ tone: 'positive', tag: 'Scale-up', sort: 90, est: 'high upside',
        text: `"${trunc(p.name)}" converts strongly (${nf.format(p.x)} orders) yet sits below median revenue — efficient and under-invested. Duplicate it to a larger segment.`,
        cta: { label: 'Open campaign', onClick: () => setDrawer(p.c) } });
    }
    // Volume plays — high revenue, below-median conversions (top-left): broad but inefficient.
    const volume = pts.filter((p) => p.x < medX && p.y >= medY).sort((a, b) => b.y - a.y);
    if (volume.length) {
      const p = volume[0];
      out.push({ tone: 'warning', tag: 'Refine', sort: 70,
        text: `"${trunc(p.name)}" drives strong revenue (${eur(p.y)}) but converts below the selection median — tighten targeting or creative to lift efficiency.`,
        cta: { label: 'Open campaign', onClick: () => setDrawer(p.c) } });
    }
    // Benchmark gap vs peers — biggest below-median channel = the market opportunity.
    let oppCh = null, winCh = null;
    channelStats.forEach((r) => {
      if (r.channel === 'Manual' || r.convRate == null) return;
      const b = MARKET.channelConv[r.channel]; if (!b) return;
      if (r.convRate < b.med && (!oppCh || (b.med - r.convRate) > oppCh.gap)) oppCh = { ch: r.channel, rate: r.convRate, med: b.med, gap: b.med - r.convRate };
      if (r.convRate >= b.p75 && (!winCh || r.convRate > winCh.rate)) winCh = { ch: r.channel, rate: r.convRate };
    });
    if (oppCh) out.push({ tone: 'warning', tag: 'Below market', sort: 80,
      text: `${CH[oppCh.ch].label} converts at ${pct(oppCh.rate)} — under the peer median of ${pct(oppCh.med)} for similar clients. Closing the gap is your biggest market opportunity.`,
      cta: { label: `Filter ${CH[oppCh.ch].label}`, onClick: () => setChannelFilter(oppCh.ch) } });
    if (winCh) out.push({ tone: 'neutral', tag: 'Ahead of market', sort: 40,
      text: `${CH[winCh.ch].label} converts at ${pct(winCh.rate)} — in the top 25% of similar clients. Keep the cadence and protect what works.` });
    // Zero-revenue campaigns.
    const zero = online.filter((c) => (c.revenue || 0) === 0);
    if (zero.length) out.push({ tone: 'warning', tag: 'No revenue', sort: 60,
      text: `${zero.length} campaign${zero.length > 1 ? 's' : ''} generated €0 this period — review targeting or content${zero.length === 1 ? `: "${trunc(zero[0].name)}"` : ''}.`,
      cta: zero.length === 1 ? { label: 'Open campaign', onClick: () => setDrawer(zero[0]) } : null });

    return out.sort((a, b) => b.sort - a.sort).slice(0, 3);
  }, [filtered, impact, channelStats, loading, errored]);

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

  // Columns for the campaigns BannerTable (mirrors the Lists table). Compact drops
  // Date/Contacts/Conv. when the list shares the row with a side panel.
  const CAMPAIGN_COLUMNS = [
    { key: 'name',     label: 'Campaign', basis: 'minmax(220px, 2.4fr)', sortable: false },
    { key: 'channel',  label: 'Channel',  basis: '150px', sortable: false },
    { key: 'date',     label: 'Date',     basis: '110px' },
    { key: 'contacts', label: 'Contacts', basis: '110px', sortable: false },
    { key: 'conv',     label: 'Conv.',    basis: '100px', sortable: false },
    { key: 'revenue',  label: 'Revenue',  basis: '120px', align: 'right', sortable: false },
  ];
  const CAMPAIGN_COLUMNS_COMPACT = [
    { key: 'name',    label: 'Campaign', basis: 'minmax(180px, 2fr)', sortable: false },
    { key: 'channel', label: 'Channel',  basis: '140px', sortable: false },
    { key: 'revenue', label: 'Revenue',  basis: '120px', align: 'right', sortable: false },
  ];

  const campaignBadge = (c) => {
    const flag = perfFlags[c.id];
    if (flag !== 'top' && flag !== 'low') return null;
    const pill = (bg, fg, Icon, text) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 999, ...TY.b3,
                     fontFamily: DS.ff, fontWeight: 600, background: bg, color: fg }}><Icon s={12} c={fg} />{text}</span>
    );
    return flag === 'top'
      ? pill(DS.feedbackSuccessBg, DS.feedbackSuccess, Ico.TrendUp, 'Top performer')
      : pill(DS.feedbackWarningBg, DS.feedbackWarning, Ico.Warn, 'No revenue');
  };

  const campaignCell = (c, key) => {
    const meta = CH[c.channel];
    switch (key) {
      case 'name':
        return (
          <BannerIdentity
            icon={meta.icon(20, meta.color)} iconBg={DS.bgSurface}
            title={c.name} badge={campaignBadge(c)}
            description={`#${c.id} · ${c.subject} · ${c.segment}`}
          />
        );
      case 'channel':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: DS.textDefault, whiteSpace: 'nowrap' }}>
            {meta.icon(14, CHANNEL_TEXT[c.channel] || DS.textDefault)}{meta.label}{c.channel === 'Manual' ? ' · offline' : ''}
          </span>
        );
      case 'date':     return <span style={{ color: DS.textSecondary, whiteSpace: 'nowrap' }}>{fmtDate(c.date)}</span>;
      case 'contacts': return <span style={{ whiteSpace: 'nowrap' }}>{c.recipients ? nf.format(c.recipients) : '—'}</span>;
      case 'conv':     return <span style={{ whiteSpace: 'nowrap' }}>{c.isManual ? 'n/a' : pct(c.conv)}</span>;
      case 'revenue':  return <span style={{ fontWeight: 700, color: DS.textDefault, whiteSpace: 'nowrap' }}>{eur(c.revenue)}</span>;
      default:         return null;
    }
  };

  const campaignActions = (c) => (
    <ActionMenu items={[
      { label: 'Open', icon: <Ico.Eye s={16} c={DS.blue500} />, onClick: () => setDrawer(c) },
      { label: c.isManual ? 'Edit' : 'Edit description', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => fireToast(c.isManual ? 'Edit manual campaign (prototype)' : 'Edit description only — tracked metrics locked') },
      { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, danger: true, hidden: !c.isManual, onClick: () => setConfirmDel(c) },
    ]} />
  );

  const PER = 20;
  const pages = Math.max(1, Math.ceil(listSorted.length / PER));
  const pageItems = listSorted.slice((page - 1) * PER, page * PER);

  function listArea(compact) {
    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} style={{ padding: SP.card }}><div style={{ display: 'flex', alignItems: 'center', gap: SP.gap }}><Skeleton w={44} h={44} r={10} /><div style={{ flex: 1 }}><Skeleton w={240} h={14} /><div style={{ height: 8 }} /><Skeleton w={160} h={10} /></div><Skeleton w={90} h={12} /></div></Card>
    ))}</div>;
    if (errored) return <ErrorState title="Couldn't load campaign data." sub="Some channels may be temporarily unavailable. Other data still renders." onRetry={() => setDemo('ready')} />;
    if (!pageItems.length) return <EmptyState icon={<Ico.Campaigns s={24} c={DS.textSecondary} />} title="No campaigns in this period"
      sub="Adjust the filters or log a campaign to populate the analysis." cta={<Btn type="Secondary" iconLeft={<Ico.Plus s={16} />} onClick={() => setLogOpen(true)}>Log a campaign</Btn>} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <BannerTable
          columns={compact ? CAMPAIGN_COLUMNS_COMPACT : CAMPAIGN_COLUMNS}
          rows={pageItems}
          rowId={(c) => c.id}
          sortKey={sortKey} sortDir={sortDir} onSort={onCampaignSort}
          onRowClick={(c) => setDrawer(c)}
          dim={(c) => c.isManual}
          cell={campaignCell}
          actions={campaignActions}
        />
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
          <Btn type="Primary" iconLeft={<Ico.Filter s={16} />} onClick={() => setFilterOpen(true)}>Filter</Btn>
          <div ref={optRef} style={{ position: 'relative' }}>
            <Btn type="Secondary" iconRight={<Ico.ChevDown s={16} />} onClick={() => setOptionsOpen((o) => !o)}>Options</Btn>
            {optionsOpen && (
              <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 40, width: 200, background: DS.bgCard,
                            border: `1px solid ${DS.borderDefault}`, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 6 }}>
                {[
                  { label: 'Create campaign', icon: <Ico.Plus s={16} c={DS.textSecondary} />, onClick: () => setLogOpen(true) },
                  { label: 'Import', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => fireToast('Import (prototype)') },
                  { label: 'Synchronise', icon: <Ico.Refresh s={16} c={DS.textSecondary} />, onClick: () => fireToast('Synchronise (prototype)') },
                ].map((it) => (
                  <div key={it.label} role="button" onClick={() => { setOptionsOpen(false); it.onClick(); }}
                       onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
                       onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                       style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', ...TY.b2, fontFamily: DS.ff, color: DS.textDefault }}>
                    {it.icon}{it.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <IconBtn type="Secondary" icon={<Ico.Settings s={18} c={isAdmin ? DS.actionPrimary : DS.actionDisabledText} />}
                   aria-label="Conversion rules" onClick={() => setRulesOpen(true)} style={!isAdmin ? { opacity: 0.55 } : undefined} />
        </>}
      />

      {/* ── Controls — active-filter summary (managed via the Filter dialog) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SP.tight, padding: `${SP.card}px ${SP.page}px 0` }}>
        {recomputing && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo }}>
            <Ico.Refresh s={14} c={DS.feedbackInfo} /> Recomputing…
          </span>
        )}
        <button type="button" onClick={() => setFilterOpen(true)}
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                   background: 'none', border: 'none', padding: 0, ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
          <Ico.Filter s={14} c={DS.textSecondary} />
          {channelFilter === 'all' ? 'All channels' : CH[channelFilter].label} · {rangeLabel(periode)}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: `${SP.tight}px ${SP.page}px 0` }}>
        <TabBar active={tab} onChange={setTab}
          tabs={[
            { value: 'sales', label: 'Performances', icon: <Ico.TrendUp s={18} c={tab === 'sales' ? DS.actionPrimary : DS.navText} /> },
            { value: 'analysis', label: 'Analysis', icon: <Ico.Zap s={18} c={tab === 'analysis' ? DS.actionPrimary : DS.navText} /> },
          ]} />
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: `${SP.section}px ${SP.page}px`, display: 'flex', flexDirection: 'column', gap: SP.section }}>
        {/* Headline KPI value cards — shown on Performances & Campaigns, hidden on Analysis */}
        {tab !== 'analysis' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP.gap }}>
          <KpiCard title="Attributed revenue" loading={loading} accent={DS.textDefault} value={eur(kpiValues.revenue)}
                   icon={<Ico.Chart s={16} c={DS.actionPrimary} />}
                   sub={kpiValues.revDelta != null ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><DeltaTag value={kpiValues.revDelta} plain /> vs. previous period</span> : 'No prior period to compare'} />
          <KpiCard title="Conversions" loading={loading} accent={DS.textDefault} value={nf.format(kpiValues.conversions)}
                   icon={<Ico.Cart s={16} c={DS.actionPrimary} />}
                   sub={kpiValues.convDelta != null ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><DeltaTag value={kpiValues.convDelta} plain /> orders vs. previous</span> : 'orders attributed'} />
          <KpiCard title="Conversion rate" loading={loading} accent={DS.textDefault} value={pct(kpiValues.convRate)}
                   icon={<Ico.TrendUp s={16} c={DS.actionPrimary} />} sub="of recipients" />
          <KpiCard title="Campaigns sent" loading={loading} accent={DS.textDefault} value={nf.format(kpiValues.count)}
                   icon={<Ico.Campaigns s={16} c={DS.actionPrimary} />} sub="in selected period" />
        </div>
        )}

        {tab === 'analysis' ? (
          <>
            {loading ? <Card style={{ padding: SP.card }}><Skeleton w={'50%'} h={18} /><div style={{ height: 12 }} /><Skeleton w={'100%'} h={180} /></Card>
              : errored ? <ErrorState onRetry={() => setDemo('ready')} />
              : forceEmpty ? <EmptyState icon={<Ico.Zap s={24} c={DS.textSecondary} />} title="No data to analyse" sub="Adjust the filters or period to generate insights." />
              : (
                <>
                  <TopBanner byRevenue={topCampaigns.byRevenue} byConversion={topCampaigns.byConversion} onOpen={(c) => setDrawer(c)} />
                  <MarketComparison rows={marketRows} rpcCampaigns={filtered.filter((c) => !c.isManual)} rpcMarket={MARKET.revPerSend.med} />
                  <ActionRecommendations items={smartRecs} />
                  <ChannelPerformance rows={channelStats} total={revenue} onSelect={(ch) => setChannelFilter(ch)} />
                  <ChannelFunnel channel={funnelChannel} onChannel={setFunnelChannel} stages={funnelStages} loading={loading} />
                  <BuyerProfile profile={buyerProfile} />
                </>
              )}
          </>
        ) : (
          <>
            {loading ? <Card style={{ padding: SP.card }}><Skeleton w={'50%'} h={18} /><div style={{ height: 12 }} /><Skeleton w={'100%'} h={260} /></Card>
              : errored ? <ErrorState onRetry={() => setDemo('ready')} />
              : forceEmpty ? <EmptyState icon={<Ico.TrendUp s={24} c={DS.textSecondary} />} title="No sales data in this period" sub="Adjust the period to see conversions vs. total sales." />
              : (
                <>
                  <ConversionsVsSales series={series} markers={filtered.filter((c) => !c.isManual)} periode={periode} onMarker={(m) => setDrawer(m)} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP.tight, marginBottom: SP.tight, flexWrap: 'wrap' }}>
                      <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
                        Campaigns
                        <span style={{ ...TY.b2, fontFamily: DS.ff, color: DS.textSecondary, fontWeight: 400 }}>{filtered.length}</span>
                      </span>
                      <div style={{ width: 180 }}>
                        <Select header="Sort by" value={sortKey} onChange={setSortKey} options={[
                          { value: 'date', label: 'Most recent' },
                          { value: 'revenue', label: 'Revenue' },
                          { value: 'conv', label: 'Conversion rate' },
                        ]} />
                      </div>
                    </div>
                    {listArea(false)}
                  </div>
                </>
              )}
          </>
        )}
      </div>

      {/* ── Overlays ── */}
      <FilterDialog open={filterOpen} onClose={() => setFilterOpen(false)} channel={channelFilter} periode={periode}
                    onApply={(ch, per) => { setChannelFilter(ch); setPeriode(per); }} />
      <CampaignDrawer campaign={drawer} onClose={() => setDrawer(null)} onToast={fireToast} />
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
