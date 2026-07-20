/**
 * Lists V3 — Contact Lists management (CRM > Contacts)
 * Built via the design-prototypes workflow. PAGE ONLY — renders inside the app
 * shell. Imports the shared design system + components; only BUILD-NEW pieces
 * (Select, Chip, KPI card, table, criteria editor, full-page record) are local.
 *
 * Lot: full-page List record — list information, criteria, audience dataviz
 * (synthetic profile per list) and a CTA into the full contact list.
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { IconBtn } from '../../components/Iconbtn';
import { Field, TextArea, SearchField } from '../../components/Field';
import { StatusBadge, Avatar } from '../../components/Tag';
import { Modal } from '../../components/Modal';
import StatePreview from '../../components/StatePreview';
import Skel from '../../components/Skeleton';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Pagination from '../../components/Pagination';
import BannerTable, { BannerIdentity } from '../../components/BannerTable';
import NameModal from '../../components/NameModal';
import ActionMenu from '../../components/ActionMenu';
import Toast from '../../components/Toast';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const TODAY = new Date('2026-06-05T00:00:00');
const d = (s) => new Date(s + 'T00:00:00');
const fmtDate = (dt) => dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const num = (n) => (n == null ? '—' : new Intl.NumberFormat('en-US').format(n));

/* ── Mock data ──────────────────────────────────────────────────────────────── */
const OWNERS = ['Camille Rey', 'Hugo Martin', 'Léa Dubois', 'Yanis Benali'];
const FIELDS = ['City', 'Country', 'Tags', 'Last purchase', 'RFM score', 'Preferred channel'];
const OPS = ['is', 'is not', 'contains', '>', '<'];
/* Fake folders — a simple label grouping for now (no folder navigation yet). */
const FOLDERS = ['Loyalty & VIP', 'Campaigns', 'Events', 'Retail', 'Reactivation', 'Imports', 'B2B', 'Compliance'];
/* The whole CRM contact base — used to compute each list's share of the base. */
const BASE_TOTAL = 142380;

function buildLists() {
  return [
    { id: 'l1', name: 'VIP Clients — Top 5%', description: 'Best customers by annual revenue.', type: 'dynamic', folder: 'Loyalty & VIP', contacts: 1240, owner: 'Camille Rey', created: '2025-11-02', updated: '2026-06-05', status: 'active', tags: ['VIP', 'Loyalty'], criteria: [{ field: 'RFM score', op: '>', value: '450' }, { field: 'Last purchase', op: '<', value: '60 days' }] },
    { id: 'l2', name: 'Newsletter — Active subscribers', description: 'Contacts who opened an email in the last 90 days.', type: 'dynamic', folder: 'Campaigns', contacts: 28940, owner: 'Hugo Martin', created: '2025-09-14', updated: '2026-06-03', status: 'active', tags: ['Email'], criteria: [{ field: 'Preferred channel', op: 'is', value: 'Email' }] },
    { id: 'l3', name: 'Prospects Paris Expo 2026 — spring edition, porte de Versailles', description: 'Leads collected at the booth.', type: 'static', folder: 'Events', contacts: 412, owner: 'Léa Dubois', created: '2026-03-21', updated: '2026-05-28', status: 'active', tags: ['Event', 'Prospect'], criteria: [] },
    { id: 'l4', name: 'Lyon store — local customers', description: 'Customers attached to the Lyon point of sale.', type: 'dynamic', folder: 'Retail', contacts: 3120, owner: 'Yanis Benali', created: '2025-12-08', updated: '2026-05-30', status: 'active', tags: ['Retail'], criteria: [{ field: 'City', op: 'is', value: 'Lyon' }] },
    { id: 'l5', name: 'Re-engagement — inactive 6 months', description: '', type: 'dynamic', folder: 'Reactivation', contacts: 8760, owner: 'Camille Rey', created: '2026-01-19', updated: '2026-04-12', status: 'active', tags: ['Winback'], criteria: [{ field: 'Last purchase', op: '>', value: '180 days' }] },
    { id: 'l6', name: 'CSV import — March (to clean up)', description: 'Manual import, duplicates to review.', type: 'import', folder: 'Imports', contacts: 0, owner: 'Hugo Martin', created: '2026-03-02', updated: '2026-03-02', status: 'active', tags: ['Import'], criteria: [] },
    { id: 'l7', name: 'Loyalty program members', description: 'Loyalty card holders.', type: 'dynamic', folder: 'Loyalty & VIP', contacts: 52310, owner: 'Léa Dubois', created: '2025-07-22', updated: '2026-06-01', status: 'active', tags: ['Loyalty', 'Wallet'], criteria: [{ field: 'Tags', op: 'contains', value: 'Loyalty card' }] },
    { id: 'l8', name: 'VIP — private evening invitations', description: 'Manual selection for the June 20 event.', type: 'static', folder: 'Events', contacts: 180, owner: 'Camille Rey', created: '2026-05-15', updated: '2026-06-04', status: 'active', tags: ['Event', 'VIP'], criteria: [] },
    { id: 'l9', name: 'Black Friday 2025 buyers', description: 'Contacts who ordered during the sale.', type: 'static', folder: 'Campaigns', contacts: 6420, owner: 'Yanis Benali', created: '2025-12-01', updated: '2026-02-10', status: 'archived', tags: ['Promo'], criteria: [] },
    { id: 'l10', name: 'SMS — mobile opt-in', description: 'Contacts who consented to the SMS channel.', type: 'dynamic', folder: 'Compliance', contacts: 14200, owner: 'Hugo Martin', created: '2025-10-03', updated: '2026-05-20', status: 'active', tags: ['SMS', 'Consent'], criteria: [{ field: 'Preferred channel', op: 'is', value: 'SMS' }] },
    { id: 'l11', name: 'Birthdays of the month', description: 'Auto-updated every month.', type: 'dynamic', folder: 'Campaigns', contacts: 2310, owner: 'Léa Dubois', created: '2026-02-28', updated: '2026-06-01', status: 'active', tags: ['Automation'], criteria: [{ field: 'Tags', op: 'contains', value: 'June birthday' }] },
    { id: 'l12', name: 'Key B2B accounts', description: 'Organizations with more than 50 attached contacts.', type: 'dynamic', folder: 'B2B', contacts: 96, owner: 'Yanis Benali', created: '2025-08-30', updated: '2026-04-25', status: 'active', tags: ['B2B'], criteria: [{ field: 'Tags', op: 'contains', value: 'Key account' }] },
    { id: 'l13', name: 'Unsubscribed — global exclusion', description: 'To exclude from all campaigns.', type: 'dynamic', folder: 'Compliance', contacts: 3870, owner: 'Hugo Martin', created: '2025-06-11', updated: '2026-05-12', status: 'active', tags: ['Suppression'], criteria: [{ field: 'Tags', op: 'contains', value: 'Unsubscribed' }] },
    { id: 'l14', name: 'Salesforce import — key accounts', description: 'One-off sync from the external CRM.', type: 'import', folder: 'Imports', contacts: 2040, owner: 'Yanis Benali', created: '2026-05-18', updated: '2026-05-18', status: 'active', tags: ['Import', 'CRM'], criteria: [] },
  ];
}

/* ── Synthetic audience profile (deterministic per list) ─────────────────────── */
/* Lists have no real linked contacts — only a count — so the profile
   distributions below are mock. They are seeded by the list id so they stay
   stable across renders, and nudged by the list's name/tags so each list reads
   plausibly (a "winback" list skews lapsed, a "VIP" list skews loyal, etc.). */
function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Normalise weights to integer percentages that sum to exactly 100. */
function toPct(weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (w / sum) * 100);
  const floor = raw.map((x) => Math.floor(x));
  let rem = 100 - floor.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; k < rem; k++) floor[order[k % order.length][1]]++;
  return floor;
}
function buildProfile(l) {
  const rnd = mulberry32(hashSeed(l.id + l.name));
  const r = (min, max) => min + rnd() * (max - min);
  const kw = `${l.name} ${(l.tags || []).join(' ')} ${l.description || ''}`.toLowerCase();
  const has = (s) => kw.includes(s);
  const older = has('loyal') || has('vip') || has('b2b');
  const younger = has('sms') || has('mobile') || has('birthday');
  const lapsedList = has('inactive') || has('winback') || has('re-engagement') || has('unsubscrib') || has('suppression');
  const activeList = has('active') || has('newsletter');
  const local = has('lyon') || has('retail') || has('local') || has('store');

  const gender = toPct([r(0.9, 1.3), r(0.85, 1.2), r(0.03, 0.08)]); // Female, Male, Other

  let ageW = [r(0.8, 1.4), r(1.0, 1.6), r(0.9, 1.4), r(0.6, 1.2)];
  if (older) ageW = [r(0.4, 0.8), r(0.9, 1.3), r(1.1, 1.6), r(1.0, 1.5)];
  if (younger) ageW = [r(1.2, 1.8), r(1.2, 1.7), r(0.7, 1.1), r(0.4, 0.8)];
  const age = toPct(ageW);
  const avgAge = Math.round(age.reduce((s, p, i) => s + (p / 100) * [21, 32, 48, 64][i], 0));

  let lifeW = [r(0.5, 1.0), r(1.0, 1.8), r(0.6, 1.1), r(0.4, 0.9)];
  if (lapsedList) lifeW = [r(0.1, 0.3), r(0.2, 0.5), r(0.8, 1.2), r(1.4, 2.2)];
  if (activeList) lifeW = [r(0.6, 1.0), r(1.4, 2.0), r(0.5, 0.9), r(0.2, 0.5)];
  const life = toPct(lifeW);

  let loyW = [r(1.2, 1.8), r(1.0, 1.5), r(0.6, 1.0), r(0.3, 0.8)];
  if (older) loyW = [r(0.3, 0.6), r(0.7, 1.1), r(1.1, 1.6), r(1.2, 1.9)];
  const loyalty = toPct(loyW);
  const avgPurch = (loyalty[0] * 1 + loyalty[1] * 2.5 + loyalty[2] * 5 + loyalty[3] * 9) / 100;

  let recW = [r(0.8, 1.4), r(0.9, 1.3), r(0.6, 1.0), r(0.5, 1.0)];
  if (lapsedList) recW = [r(0.05, 0.15), r(0.2, 0.4), r(0.6, 1.0), r(1.6, 2.4)];
  const recency = toPct(recW);

  let geoW = [r(0.9, 1.6), r(0.8, 1.2), r(0.4, 0.9)];
  if (local) geoW = [r(1.7, 2.5), r(0.6, 1.0), r(0.2, 0.5)];
  const catchment = toPct(geoW); // Local (<25 km), Regional, National

  const CITY_POOL = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes', 'Nice', 'Strasbourg', 'Rennes'];
  const cities = [...CITY_POOL].sort(() => rnd() - 0.5).slice(0, 4);
  const cityPct = toPct([r(1.2, 2.2), r(0.8, 1.4), r(0.5, 1.0), r(0.4, 0.8)]);

  let emailReach = Math.round(r(72, 96));
  let smsReach = Math.round(r(38, 72));
  const postalReach = Math.round(r(55, 85));
  if (has('sms') || has('mobile')) smsReach = Math.round(r(85, 99));
  if (has('email') || has('newsletter')) emailReach = Math.round(r(90, 99));
  if (has('unsubscrib') || has('suppression')) { emailReach = Math.round(r(5, 20)); smsReach = Math.round(r(3, 15)); }
  const emailOptin = Math.round(emailReach * r(0.75, 0.95));
  const smsOptin = Math.round(smsReach * r(0.6, 0.9));

  let subShare = Math.round(r(15, 45));
  if (has('vip') || has('loyal') || has('member')) subShare = Math.round(r(55, 85));
  if (has('prospect') || has('import') || has('lead')) subShare = Math.round(r(3, 18));

  // 12-month contact evolution — ends at the current total, grows (or, for
  // winback/inactive lists, shrinks) toward it with light month-to-month noise.
  const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const startRatio = lapsedList ? r(1.15, 1.5) : r(0.45, 0.72);
  const start = Math.round(l.contacts * startRatio);
  const trend = MONTHS.map((_, i) =>
    i === 11 ? l.contacts : Math.max(0, Math.round((start + (l.contacts - start) * (i / 11)) * (1 + (rnd() - 0.5) * 0.06))));

  return {
    total: l.contacts, pctOfBase: (l.contacts / BASE_TOTAL) * 100,
    gender, age, avgAge, life, loyalty, avgPurch, recency, catchment, cities, cityPct,
    emailReach, smsReach, postalReach, emailOptin, smsOptin, subShare,
    months: MONTHS, trend,
  };
}

/* ── Local BUILD-NEW atoms ──────────────────────────────────────────────────── */
const TYPES = {
  dynamic: { label: 'Dynamic',       long: 'Dynamic (auto)',        bg: DS.green100,   fg: DS.green500,   icon: Ico.Zap },
  static:  { label: 'Static',        long: 'Static (manual)',       bg: DS.blue100,    fg: DS.blue500,    icon: Ico.List },
  import:  { label: 'Manual import', long: 'Manual import (file)',  bg: '#EFF1F4',     fg: '#5B6472',     icon: Ico.Download },
};
function TypeBadge({ type }) {
  const t = TYPES[type] || TYPES.static;
  const I = t.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '3px 10px', background: t.bg, color: t.fg, ...TY.b3, fontWeight: 500, fontFamily: DS.ff, whiteSpace: 'nowrap' }}>
      <I s={12} c={t.fg} />{t.label}
    </span>
  );
}

/* ── Lists table — the shared BannerTable (header strip + grid banner rows) ──── */
const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const LIST_COLUMNS = [
  { key: 'name',     label: 'Name',          basis: 'minmax(200px, 2.4fr)' },
  { key: 'type',     label: 'Type',          basis: '132px' },
  { key: 'created',  label: 'Creation date', basis: '120px' },
  { key: 'folder',   label: 'Folder',        basis: '150px' },
  { key: 'owner',    label: 'Owner',         basis: '170px' },
  { key: 'contacts', label: 'Contacts',      basis: '110px', align: 'right' },
];

function ListsBanners({ data, sortKey, sortDir, onSort, canManage, onOpen, onEdit, onDuplicate, onDelete, onToast }) {
  const cell = (l, key) => {
    switch (key) {
      case 'name':
        return (
          <BannerIdentity
            title={l.name}
            badge={l.status === 'archived' ? <StatusBadge status="warning">Archived</StatusBadge> : null}
            description={l.description || 'No description'}
          />
        );
      case 'type':     return <TypeBadge type={l.type} />;
      case 'created':  return <span style={{ color: DS.textSecondary, whiteSpace: 'nowrap' }}>{fmtDate(d(l.created))}</span>;
      case 'folder':   return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <Ico.Inbox s={14} c={DS.textSecondary} /><span style={clip}>{l.folder}</span>
        </span>
      );
      case 'owner':    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Avatar name={l.owner} size={22} /><span style={clip}>{l.owner}</span>
        </span>
      );
      case 'contacts': return <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{num(l.contacts)}</span>;
      default:         return null;
    }
  };
  return (
    <BannerTable
      columns={LIST_COLUMNS}
      rows={data}
      rowId={(l) => l.id}
      sortKey={sortKey} sortDir={sortDir} onSort={onSort}
      onRowClick={(l) => onOpen(l.id)}
      dim={(l) => l.status === 'archived'}
      cell={cell}
      actions={(l) => (
        <ActionMenu items={[
          { label: 'View', icon: <Ico.Eye s={16} c={DS.blue500} />, onClick: () => onOpen(l.id) },
          { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => onDuplicate(l) },
          { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(l), hidden: !canManage },
          { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: () => onDelete(l), danger: true, hidden: !canManage },
          { label: 'Export', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => onToast('Export generated (demo).'), hidden: canManage },
        ]} />
      )}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FULL-PAGE LIST RECORD — dataviz atoms
   ═══════════════════════════════════════════════════════════════════════════ */
const CHART_BLUE = DS.blue500, CHART_INDIGO = '#4E6FC7', CHART_TEAL = '#14B8A6',
      CHART_ORANGE = DS.orange500, CHART_PURPLE = '#9333EA';

function RecordCard({ icon, title, sub, right, children, style }) {
  return (
    <div style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      {(title || icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ width: 32, height: 32, borderRadius: 8, background: DS.bgSurface, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff }}>{title}</div>
            {sub && <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/* One labelled fact inside the Information block: small uppercase label with
   its value below — left-aligned, no divider lines (unlike the old receipt). */
function InfoItem({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                     color: DS.textSecondary, fontFamily: DS.ff }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.b2, color: DS.textDefault, fontFamily: DS.ff }}>{value}</span>
    </div>
  );
}

/* Donut + legend (mirrors ConsentsV3 ChannelDonut idiom). */
function Donut({ data, centerValue, centerLabel, size = 150, renderValue }) {
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  const R = size / 2 - 12, SW = 20, C = size / 2, circ = 2 * Math.PI * R;
  const fracs = data.map((x) => x.value / total);
  const arcs = data.map((x, i) => ({
    ...x,
    dash: fracs[i] * circ,
    off: fracs.slice(0, i).reduce((a, b) => a + b, 0) * circ,
  }));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke={DS.bgSurface} strokeWidth={SW} />
        {arcs.map((a) => (
          <circle key={a.label} cx={C} cy={C} r={R} fill="none" stroke={a.color}
                  strokeWidth={SW} strokeDasharray={`${a.dash} ${circ - a.dash}`}
                  strokeDashoffset={-a.off} transform={`rotate(-90 ${C} ${C})`} strokeLinecap="butt" />
        ))}
        <text x={C} y={C - 2} textAnchor="middle" style={{ ...TY.h4 }} fill={DS.textDefault}>{centerValue}</text>
        <text x={C} y={C + 15} textAnchor="middle" fontSize="10" fill={DS.textSecondary} fontFamily="Inter, sans-serif">{centerLabel}</text>
      </svg>
      <div style={{ flex: 1, minWidth: 130, display: 'flex', flexDirection: 'column' }}>
        {data.map((x, i) => (
          <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: i === 0 ? 'none' : `1px solid ${DS.borderDefault}`, ...TY.b3, color: DS.textDefault, fontFamily: DS.ff }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: x.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{x.label}</span>
            <span style={{ fontWeight: TY.weightSemiBold }}>{renderValue ? renderValue(x.value) : `${x.value < 1 ? '<1' : Math.round(x.value)}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Horizontal bar list — one row per category, fill width = percentage. */
function BarList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            <span style={{ color: DS.textDefault }}>{it.label}</span>
            <span style={{ fontWeight: TY.weightSemiBold, color: DS.textDefault }}>{it.pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 6, background: DS.bgSurface, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.pct}%`, background: it.color, borderRadius: 6, transition: 'width .3s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Reachability row — reachable share plus opt-in share on the same track. */
function ReachRow({ icon, label, reach, optin, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.b3, fontFamily: DS.ff }}>
        {icon}
        <span style={{ flex: 1, color: DS.textDefault }}>{label}</span>
        <span style={{ color: DS.textSecondary }}>{reach}% reachable · <span style={{ color, fontWeight: TY.weightSemiBold }}>{optin}% opt-in</span></span>
      </div>
      <div style={{ position: 'relative', height: 10, borderRadius: 6, background: DS.bgSurface, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${reach}%`, background: `${color}33`, borderRadius: 6 }} />
        <div style={{ position: 'absolute', inset: 0, width: `${optin}%`, background: color, borderRadius: 6 }} />
      </div>
    </div>
  );
}

/* Round a value up to a "nice" axis ceiling (1 / 2 / 5 × 10ⁿ). */
function niceCeil(v) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const norm = v / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

/* 12-month evolution — measured-width line + area with gridlines, y-axis and a
   hover tooltip. Mirrors the ConsentsV3 EvolutionChart idiom. */
function TrendChart({ months, values, height = 280 }) {
  const wrapRef = useRef(null);
  const [W, setW] = useState(760);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setW(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = height;
  const PAD_L = 56, PAD_R = 20, PAD_T = 18, PAD_B = 34;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = values.length;
  const yMax = niceCeil(Math.max(...values, 1));
  const xStep = innerW / Math.max(1, n - 1);
  const xAt = (i) => PAD_L + i * xStep;
  const yAt = (v) => PAD_T + innerH - (v / yMax) * innerH;
  const ticks = Array.from({ length: 4 }, (_, i) => Math.round((yMax / 3) * i));
  const color = DS.actionPrimary;

  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  function onMove(e) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (x < PAD_L - 10 || x > W - PAD_R + 10) { setHoverIdx(null); return; }
    setHoverIdx(Math.max(0, Math.min(n - 1, Math.round((x - PAD_L) / xStep))));
  }

  const pts = values.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  let lineD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    lineD += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const areaD = `${lineD} L ${pts[n - 1].x} ${PAD_T + innerH} L ${pts[0].x} ${PAD_T + innerH} Z`;
  const last = pts[n - 1];

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
           style={{ display: 'block', overflow: 'visible' }}
           onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="lvTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines + y-axis ticks */}
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke={DS.borderDefault}
                    strokeWidth="1" strokeDasharray={i === 0 ? '0' : '2 5'} opacity={i === 0 ? 0.8 : 0.5} />
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontSize="12" fill={DS.textSecondary} fontFamily="Inter, sans-serif">{num(t)}</text>
            </g>
          );
        })}
        {/* x-axis month labels */}
        {months.map((m, i) => (
          <text key={i} x={xAt(i)} y={H - PAD_B + 22} textAnchor="middle" fontSize="11"
                fill={hoverIdx === i ? DS.textDefault : DS.textSecondary} fontFamily="Inter, sans-serif">{m}</text>
        ))}
        {/* hover guide */}
        {hoverIdx != null && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B}
                stroke={DS.neutral200} strokeWidth="1" strokeDasharray="3 3" />
        )}
        <path d={areaD} fill="url(#lvTrend)" />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* end dot */}
        <circle cx={last.x} cy={last.y} r="3.5" fill={DS.bgCard} stroke={color} strokeWidth="2" />
        {/* hovered point */}
        {hoverIdx != null && (
          <circle cx={xAt(hoverIdx)} cy={yAt(values[hoverIdx])} r="6" fill={DS.bgCard} stroke={color} strokeWidth="2.5" />
        )}
      </svg>

      {/* hover tooltip — white card (ConsentsV3 EvolutionChart pattern) */}
      {hoverIdx != null && (
        <div style={{ position: 'absolute', top: 12,
                      left: `calc(${(xAt(hoverIdx) / W) * 100}% + ${xAt(hoverIdx) > W / 2 ? '-200px' : '16px'})`,
                      background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 8,
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 12, minWidth: 184, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ ...TY.b3, color: DS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: DS.ff }}>
            {months[hoverIdx]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ flex: 1, ...TY.b3, color: DS.textDefault, fontFamily: DS.ff }}>Contacts</span>
            <span style={{ ...TY.h5, color: DS.textDefault }}>{num(values[hoverIdx])}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* Tabs (mirrors PerformanceV3 TabBar idiom). */
function RecordTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${DS.borderDefault}` }}>
      {tabs.map((tb) => {
        const on = tb.value === active;
        const color = on ? DS.actionPrimary : DS.textSecondary;
        return (
          <button key={tb.value} type="button" onClick={() => onChange(tb.value)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                     padding: '0 2px 12px', fontFamily: DS.ff, ...TY.b1, fontWeight: 500, color,
                     display: 'inline-flex', alignItems: 'center' }}>
            {tb.label}
            {on && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, borderRadius: '3px 3px 0 0', background: DS.actionPrimary }} />}
          </button>
        );
      })}
    </div>
  );
}

/* Folder menu — input-style dropdown to switch the viewed folder or create one. */
function FolderRow({ active, count, onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ minHeight: 38, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
               background: active ? DS.blue100 : hover ? DS.actionSecondaryHover : 'transparent',
               ...TY.b2, fontFamily: DS.ff, color: active ? DS.actionPrimary : DS.textDefault }}>
      <Ico.Inbox s={14} c={active ? DS.actionPrimary : DS.textSecondary} />
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {children}
        <span style={{ ...TY.b3, color: DS.textSecondary, marginLeft: 6 }}>— {count} list{count === 1 ? '' : 's'}</span>
      </span>
      {active && <Ico.Check s={16} c={DS.actionPrimary} />}
    </div>
  );
}

function FolderMenu({ folders, value, counts, total, onChange, onRequestCreateFolder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  const label = value === 'all' ? 'All folders' : value;

  return (
    <div ref={ref} style={{ position: 'relative', width: 260 }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ height: 40, width: '100%', background: DS.bgSurface, border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`,
                 borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                 fontFamily: DS.ff, ...TY.b2, color: DS.textDefault }}>
        <Ico.Inbox s={16} c={DS.textSecondary} />
        <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ ...TY.b3, color: DS.textSecondary }}>{value === 'all' ? total : (counts[value] ?? 0)}</span>
        <Ico.ChevDown s={18} c={DS.textSecondary} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, left: 0, width: '100%', background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', zIndex: 50, overflow: 'hidden' }}>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            <FolderRow active={value === 'all'} count={total} onClick={() => { onChange('all'); setOpen(false); }}>All folders</FolderRow>
            {folders.map((f) => (
              <FolderRow key={f} active={value === f} count={counts[f] ?? 0} onClick={() => { onChange(f); setOpen(false); }}>{f}</FolderRow>
            ))}
          </div>
          <div style={{ height: 1, background: DS.borderDefault }} />
          <div onClick={() => { setOpen(false); onRequestCreateFolder(); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                     ...TY.b2, fontWeight: 600, color: DS.actionPrimary, fontFamily: DS.ff }}>
            <Ico.Plus s={16} c={DS.actionPrimary} />Create a folder
          </div>
        </div>
      )}
    </div>
  );
}

/* Labeled "Options" menu — a Secondary button that opens Edit / Export / Delete. */
function OptionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const visible = items.filter((it) => it && !it.hidden);
  if (!visible.length) return null;
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <Btn type="Secondary" size="Medium" iconLeft={<Ico.Dots s={16} c={DS.actionPrimary} />} onClick={() => setOpen((o) => !o)}>Options</Btn>
      {open && (
        <div style={{ position: 'absolute', top: 46, right: 0, zIndex: 30, width: 200, background: DS.bgCard,
                      border: `1px solid ${DS.actionPrimary}`, borderRadius: 8, boxShadow: '0 3px 10px rgba(0,0,0,0.08)', padding: 6 }}>
          {visible.map((it, i) => (
            <div key={i} role="button" onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
                 style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                          ...TY.b2, fontFamily: DS.ff, color: it.danger ? DS.feedbackError : DS.textDefault }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = it.danger ? DS.feedbackErrorBg : DS.actionSecondaryHover)}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {it.icon}{it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Full-page List record ──────────────────────────────────────────────────── */
function ListRecordPage({ list: l, canManage, onBack, onEdit, onDelete, onViewContacts, onToast }) {
  const t = TYPES[l.type] || TYPES.static;
  const TypeIcon = t.icon;
  const [tab, setTab] = useState('info');
  const p = buildProfile(l);

  const pctLabel = p.pctOfBase < 0.1 ? '<0.1%' : `${p.pctOfBase.toFixed(1)}%`;
  const genderData = [
    { label: 'Female', value: p.gender[0], color: CHART_PURPLE },
    { label: 'Male',   value: p.gender[1], color: CHART_BLUE },
    { label: 'Other',  value: p.gender[2], color: DS.neutral400 },
  ];
  const catchmentData = [
    { label: 'Local (< 25 km)', value: p.catchment[0], color: CHART_BLUE },
    { label: 'Regional',        value: p.catchment[1], color: CHART_TEAL },
    { label: 'National',        value: p.catchment[2], color: DS.neutral400 },
  ];
  const ageItems = ['Gen Z (18–24)', 'Millennials (25–40)', 'Gen X (41–56)', 'Boomers (57+)']
    .map((label, i) => ({ label, pct: p.age[i], color: [CHART_BLUE, CHART_INDIGO, CHART_TEAL, CHART_ORANGE][i] }));
  const lifeItems = ['New', 'Active', 'At risk', 'Lapsed']
    .map((label, i) => ({ label, pct: p.life[i], color: [CHART_BLUE, DS.feedbackSuccess, DS.feedbackWarning, DS.neutral500][i] }));
  const loyItems = ['1 purchase', '2–3 purchases', '4–6 purchases', '7+ purchases']
    .map((label, i) => ({ label, pct: p.loyalty[i], color: CHART_PURPLE }));
  const recItems = ['< 30 days', '30–90 days', '90–180 days', '> 180 days']
    .map((label, i) => ({ label, pct: p.recency[i], color: CHART_TEAL }));
  const hasCriteria = l.type === 'dynamic' && l.criteria.length > 0;
  const trendDelta = p.trend[p.trend.length - 1] - p.trend[0];

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Back */}
      <div style={{ padding: '18px 24px 0' }}>
        <Btn type="Tertiary" size="Small" iconLeft={<Ico.ArrowBack s={16} c={DS.actionPrimary} />} onClick={onBack}>Back to lists</Btn>
      </div>

      {/* Record header */}
      <div style={{ padding: '12px 24px 4px', display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ width: 52, height: 52, borderRadius: 12, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TypeIcon s={26} c={t.fg} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ ...TY.h3, color: DS.textDefault, fontFamily: DS.ff }}>{l.name}</span>
            <TypeBadge type={l.type} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999,
                           padding: '3px 10px', background: '#EFF1F4', color: '#5B6472', ...TY.b3, fontWeight: 500, fontFamily: DS.ff }}>
              <Ico.Inbox s={12} c="#5B6472" />{l.folder}
            </span>
          </div>
          <div style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>{l.description || 'No description'}</div>
        </div>
        <OptionsMenu items={[
          { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(l), hidden: !canManage },
          { label: 'Export', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => onToast('Export generated (demo).') },
          { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: () => onDelete(l), danger: true, hidden: !canManage },
        ]} />
      </div>

      <div style={{ padding: '12px 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <RecordTabs
          tabs={[
            { value: 'info', label: 'Information', icon: Ico.Info },
            { value: 'audience', label: 'Audience analysis', icon: Ico.Chart },
          ]}
          active={tab} onChange={setTab}
        />

        {tab === 'info' && (
        <>
        {/* Information (left) · contacts share (right) — two separate cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
          <RecordCard icon={<Ico.Info s={18} c={DS.actionPrimary} />} title="Information" style={{ flex: '2 1 380px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px 24px' }}>
              <InfoItem label="Created by" value={<><Avatar name={l.owner} size={22} />{l.owner}</>} />
              <InfoItem label="Created on" value={fmtDate(d(l.created))} />
              <InfoItem label="Folder" value={<><Ico.Inbox s={14} c={DS.textSecondary} />{l.folder}</>} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: `1px solid ${DS.borderDefault}`, paddingTop: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                             color: DS.textSecondary, fontFamily: DS.ff }}>Description</span>
              <span style={{ ...TY.b2, color: l.description ? DS.textDefault : DS.textPlaceholder, fontFamily: DS.ff, whiteSpace: 'pre-wrap' }}>
                {l.description || 'No description provided.'}
              </span>
            </div>
          </RecordCard>

          <RecordCard icon={<Ico.Chart s={18} c={CHART_BLUE} />} title="Share of base" style={{ flex: '1 1 200px' }}>
            <div style={{ textAlign: 'center', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...TY.h2, color: DS.textDefault, fontFamily: DS.ff, lineHeight: 1.1 }}>{pctLabel}</div>
              <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff, marginTop: 4 }}>
                {num(p.total)} of {num(BASE_TOTAL)} contacts
              </div>
              <div style={{ height: 6, borderRadius: 3, background: DS.bgSurface, overflow: 'hidden', marginTop: 12 }}>
                <div style={{ width: `${Math.max(2, Math.min(100, p.pctOfBase))}%`, height: '100%', background: CHART_BLUE, borderRadius: 3 }} />
              </div>
            </div>
          </RecordCard>
        </div>

        {/* Criteria — full width */}
        <RecordCard icon={<Ico.Filter s={18} c={DS.actionPrimary} />} title="Criteria" sub={hasCriteria ? 'Filters defining this dynamic audience' : undefined}>
            {hasCriteria ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {l.criteria.map((cr, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 8, padding: '9px 12px', ...TY.b3, fontFamily: DS.ff }}>
                    <span style={{ ...TY.b3, color: DS.textPlaceholder, fontWeight: 700 }}>{i === 0 ? 'WHERE' : 'AND'}</span>
                    <span style={{ color: DS.textDefault, fontWeight: 600 }}>{cr.field}</span>
                    <span style={{ color: DS.textSecondary }}>{cr.op}</span>
                    <span style={{ color: DS.actionPrimary, fontWeight: 600 }}>{cr.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Ico.List s={22} />}
                title={l.type === 'import' ? 'Imported list' : 'Static list'}
                sub={l.type === 'import' ? 'Contacts come from a file import — there are no dynamic criteria.' : 'Contacts are added manually — there are no dynamic criteria.'}
              />
            )}
          </RecordCard>
        </>
        )}

        {tab === 'audience' && (
        <>
        {/* Contact evolution — last 12 months */}
        <RecordCard
          icon={<Ico.TrendUp s={18} c={DS.actionPrimary} />}
          title="Contacts — last 12 months"
          sub="Monthly evolution of this list"
          right={(
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.b2, fontFamily: DS.ff, fontWeight: TY.weightSemiBold, color: trendDelta >= 0 ? DS.feedbackSuccess : DS.feedbackError }}>
              {trendDelta >= 0 ? <Ico.TrendUp s={15} c={DS.feedbackSuccess} /> : <Ico.TrendDown s={15} c={DS.feedbackError} />}
              {trendDelta >= 0 ? '+' : '−'}{num(Math.abs(trendDelta))} over 12 mo
            </span>
          )}
        >
          <TrendChart months={p.months} values={p.trend} />
        </RecordCard>

        {/* View contacts — below the overall chart */}
        <div style={{ display: 'flex' }}>
          <Btn type="Primary" size="Medium" iconLeft={<Ico.Users s={18} c={DS.white} />} onClick={onViewContacts}>View contacts</Btn>
        </div>

        {/* Audience profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <Ico.Chart s={18} c={DS.textDefault} />
          <span style={{ ...TY.h5, color: DS.textDefault, fontFamily: DS.ff }}>Audience profile</span>
          <span style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>· who the contacts in this list are</span>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <RecordCard icon={<Ico.Users s={18} c={CHART_PURPLE} />} title="Gender split" style={{ flex: '1 1 340px' }}>
            <Donut data={genderData} centerValue={num(p.total)} centerLabel="contacts" />
          </RecordCard>

          <RecordCard icon={<Ico.User s={18} c={CHART_BLUE} />} title="Age cohorts" sub={`Average age ${p.avgAge} years`} style={{ flex: '1 1 340px' }}>
            <BarList items={ageItems} />
          </RecordCard>

          <RecordCard icon={<Ico.Refresh s={18} c={DS.feedbackSuccess} />} title="Engagement lifecycle" sub="New · Active · At risk · Lapsed" style={{ flex: '1 1 340px' }}>
            <BarList items={lifeItems} />
          </RecordCard>

          <RecordCard icon={<Ico.Star s={18} c={CHART_PURPLE} />} title="Loyalty — purchase frequency" sub={`≈ ${p.avgPurch.toFixed(1)} purchases per contact`} style={{ flex: '1 1 340px' }}>
            <BarList items={loyItems} />
          </RecordCard>

          <RecordCard icon={<Ico.Clock s={18} c={CHART_TEAL} />} title="Recency — last purchase" style={{ flex: '1 1 340px' }}>
            <BarList items={recItems} />
          </RecordCard>

          <RecordCard icon={<Ico.Globe s={18} c={CHART_BLUE} />} title="Location & catchment" style={{ flex: '1 1 340px' }}>
            <Donut data={catchmentData} centerValue={`${p.catchment[0]}%`} centerLabel="local" size={130} />
            <div style={{ borderTop: `1px solid ${DS.borderDefault}`, paddingTop: 10 }}>
              <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff, marginBottom: 6 }}>Top cities</div>
              {p.cities.map((city, i) => (
                <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', ...TY.b3, fontFamily: DS.ff }}>
                  <span style={{ flex: 1, color: DS.textDefault }}>{city}</span>
                  <span style={{ color: DS.textSecondary, fontWeight: TY.weightSemiBold }}>{p.cityPct[i]}%</span>
                </div>
              ))}
            </div>
          </RecordCard>

          <RecordCard icon={<Ico.Mail s={18} c={CHART_INDIGO} />} title="Reachability & consent" sub="Contactable share and opt-in per channel" style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ReachRow icon={<Ico.Mail s={14} c={CHART_INDIGO} />} label="Email" reach={p.emailReach} optin={p.emailOptin} color={CHART_INDIGO} />
              <ReachRow icon={<Ico.Sms s={14} c={CHART_TEAL} />} label="SMS" reach={p.smsReach} optin={p.smsOptin} color={CHART_TEAL} />
              <ReachRow icon={<Ico.Organization s={14} c={CHART_ORANGE} />} label="Postal" reach={p.postalReach} optin={p.postalReach} color={CHART_ORANGE} />
            </div>
          </RecordCard>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

/* ── Create / edit panel ────────────────────────────────────────────────────── */
function ListFormPanel({ open, editing, onClose, onSave, folders = FOLDERS }) {
  const blank = { name: '', description: '', type: 'static', owner: OWNERS[0], folder: folders[0], tags: '', criteria: [] };
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) { // render-time reset on open (no effect)
    setWasOpen(open);
    if (open) {
      setForm(editing
        ? { name: editing.name, description: editing.description, type: editing.type, owner: editing.owner, folder: editing.folder || folders[0], tags: editing.tags.join(', '), criteria: editing.criteria.map((c) => ({ ...c })) }
        : blank);
      setErr({}); setConfirmClose(false);
    }
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = form.name !== '' || form.description !== '' || form.criteria.length > 0;
  const tryClose = () => { if (dirty) setConfirmClose(true); else onClose(); };
  const addCriterion = () => setForm((f) => ({ ...f, criteria: [...f.criteria, { field: FIELDS[0], op: OPS[0], value: '' }] }));
  const setCriterion = (i, k, v) => setForm((f) => ({ ...f, criteria: f.criteria.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) }));
  const removeCriterion = (i) => setForm((f) => ({ ...f, criteria: f.criteria.filter((_, idx) => idx !== i) }));
  const save = () => {
    const e = {}; if (!form.name.trim()) e.name = 'Name is required.';
    if (form.type === 'dynamic' && form.criteria.length === 0) e.criteria = 'A dynamic list needs at least one criterion.';
    setErr(e); if (Object.keys(e).length) return; onSave(form, editing);
  };
  return (
    <>
      <Modal
        open={open}
        onClose={tryClose}
        title={editing ? 'Edit list' : 'Create a list'}
        width={460}
        footer={(
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Btn type="Tertiary" size="Medium" onClick={tryClose}>Cancel</Btn>
            <Btn type="Primary" size="Medium" iconLeft={<Ico.Check s={18} />} onClick={save}>{editing ? 'Save' : 'Create list'}</Btn>
          </div>
        )}
      >
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="List name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. VIP Clients — Paris" error={err.name} />
        <TextArea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What is this list for?" />
        <Select label="Type" value={form.type} onChange={(v) => set('type', v)} options={[{ value: 'dynamic', label: 'Dynamic — auto-updated' }, { value: 'static', label: 'Static — manual selection' }, { value: 'import', label: 'Manual import — from a file' }]} />
        <Select label="Folder" value={form.folder} onChange={(v) => set('folder', v)} options={folders.map((f) => ({ value: f, label: f }))} />
        <Select label="Owner" value={form.owner} onChange={(v) => set('owner', v)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
        {form.type === 'dynamic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>Criteria</label>
              <Btn type="Tertiary" size="Small" iconLeft={<Ico.Plus s={14} />} onClick={addCriterion}>Add</Btn>
            </div>
            {form.criteria.length === 0 && <div style={{ ...TY.b3, color: DS.textPlaceholder, fontFamily: DS.ff }}>No criteria — add one to define the audience.</div>}
            {form.criteria.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Select value={c.field} onChange={(v) => setCriterion(i, 'field', v)} options={FIELDS.map((f) => ({ value: f, label: f }))} width={130} />
                <Select value={c.op} onChange={(v) => setCriterion(i, 'op', v)} options={OPS.map((o) => ({ value: o, label: o }))} width={92} />
                <Field value={c.value} onChange={(e) => setCriterion(i, 'value', e.target.value)} placeholder="value" style={{ flex: 1 }} />
                <IconBtn icon={<Ico.Trash s={16} c={DS.feedbackError} />} type="Secondary" size="Small" onClick={() => removeCriterion(i)} aria-label="Remove" />
              </div>
            ))}
            {err.criteria && <span style={{ ...TY.b3, color: DS.feedbackError, fontFamily: DS.ff }}>{err.criteria}</span>}
          </div>
        )}
        <Field label="Tags (comma-separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="VIP, Loyalty" />
      </div>
      </Modal>
      {confirmClose && <ConfirmDialog title="Discard changes?" body="The information you entered will be lost." confirmLabel="Discard" cancelLabel="Cancel" confirmIcon={null} danger onConfirm={onClose} onCancel={() => setConfirmClose(false)} />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function ListsV3() {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [dataState, setDataState] = useState('ready');
  const [lists, setLists] = useState(buildLists);
  const [query, setQuery] = useState('');
  const [folders, setFolders] = useState(FOLDERS);
  const [folderFilter, setFolderFilter] = useState('all');
  const [folderPendingDelete, setFolderPendingDelete] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortKey, setSortKey] = useState('created');
  const [sortDir, setSortDir] = useState('desc');
  const [folderModal, setFolderModal] = useState(false);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const canManage = role === 'admin';

  const filtered = lists.filter((l) =>
    (folderFilter === 'all' || l.folder === folderFilter) &&
    (query.trim() === '' || l.name.toLowerCase().includes(query.toLowerCase()) || l.description.toLowerCase().includes(query.toLowerCase()))
  );
  const sortVal = (l, key) => {
    if (key === 'contacts') return l.contacts;
    if (key === 'created')  return d(l.created).getTime();
    if (key === 'updated')  return d(l.updated).getTime();
    if (key === 'type')     return TYPES[l.type]?.label ?? l.type;
    return (l[key] ?? '').toString().toLowerCase();
  };
  const sorted = [...filtered].sort((a, b) => {
    const av = sortVal(a, sortKey), bv = sortVal(b, sortKey);
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const pageSize = 8;
  const pages = Math.ceil(sorted.length / pageSize) || 1;
  const pageSafe = Math.min(page, pages - 1);
  const pageItems = sorted.slice(pageSafe * pageSize, (pageSafe + 1) * pageSize);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };

  const folderCounts = lists.reduce((m, l) => { m[l.folder] = (m[l.folder] || 0) + 1; return m; }, {});
  const addFolder = (name) => {
    const n = name.trim();
    if (!n) return;
    if (folders.includes(n)) { setFolderFilter(n); setPage(0); showToast('Folder already exists.'); return; }
    setFolders((fs) => [...fs, n]);
    setFolderFilter(n); setPage(0);
    showToast(`Folder “${n}” created.`);
  };
  const renameFolder = (oldName, newName) => {
    const n = newName.trim();
    if (!n || n === oldName) return;
    if (folders.includes(n)) { showToast('Folder already exists.'); return; }
    setFolders((fs) => fs.map((f) => (f === oldName ? n : f)));
    setLists((ls) => ls.map((l) => (l.folder === oldName ? { ...l, folder: n } : l)));
    setFolderFilter((ff) => (ff === oldName ? n : ff));
    showToast(`Folder renamed to “${n}”.`);
  };
  const confirmDeleteFolder = () => {
    const name = folderPendingDelete;
    const fallback = folders.filter((f) => f !== name)[0] ?? 'Unfiled';
    setFolders((fs) => fs.filter((f) => f !== name));
    setLists((ls) => ls.map((l) => (l.folder === name ? { ...l, folder: fallback } : l)));
    setFolderFilter((ff) => (ff === name ? 'all' : ff));
    setFolderPendingDelete(null);
    showToast(`Folder “${name}” deleted.`);
  };

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (l) => { setSelected(null); setEditing(l); setFormOpen(true); };
  const duplicate = (l) => { const id = 'l' + Date.now(); setLists((ls) => [{ ...l, id, name: l.name + ' (copy)', updated: '2026-06-05', created: '2026-06-05' }, ...ls]); showToast('List duplicated.'); };
  const save = (form, edit) => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (edit) {
      setLists((ls) => ls.map((l) => (l.id === edit.id ? { ...l, name: form.name, description: form.description, type: form.type, owner: form.owner, folder: form.folder, tags, criteria: form.criteria, updated: '2026-06-05' } : l)));
      showToast('List updated.');
    } else {
      const id = 'l' + Date.now();
      setLists((ls) => [{ id, name: form.name, description: form.description, type: form.type, owner: form.owner, folder: form.folder, tags, criteria: form.criteria, contacts: 0, status: 'active', created: '2026-06-05', updated: '2026-06-05' }, ...ls]);
      showToast('List created.');
    }
    setFormOpen(false); setEditing(null);
  };
  const confirmDelete = () => { const t = deleteTarget; setLists((ls) => ls.filter((l) => l.id !== t.id)); setDeleteTarget(null); setSelected(null); showToast('List deleted.'); };

  const recordList = selected ? lists.find((x) => x.id === selected) : null;

  const body = () => {
    if (dataState === 'loading') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: DS.bgCard,
                                   border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: '14px 16px' }}>
              <Skel w={44} h={44} r={10} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}><Skel w="40%" h={14} /><Skel w="60%" h={10} /></div>
              <Skel w={90} h={16} /><Skel w={90} h={16} /><Skel w={90} h={16} />
            </div>
          ))}
        </div>
      );
    }
    if (dataState === 'error') return <ErrorState title="Unable to load the lists." retryLabel="Retry" onRetry={() => setDataState('ready')} />;
    if (lists.length === 0) return <EmptyState icon={<Ico.List s={24} />} title="No lists yet" sub="Create your first contact list to segment your CRM." cta={<Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a list</Btn>} />;
    if (filtered.length === 0) return <EmptyState icon={<Ico.Search s={24} />} title="No results" sub="No list matches your search or the selected filter." />;
    return (
      <>
        <ListsBanners
          data={pageItems}
          sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}
          canManage={canManage}
          onOpen={(id) => setSelected(id)} onEdit={openEdit} onDuplicate={duplicate}
          onDelete={(x) => setDeleteTarget(x)} onToast={showToast}
        />
        <Pagination page={pageSafe} pages={pages} setPage={setPage} total={sorted.length} pageSize={pageSize} />
      </>
    );
  };

  return (
    <div style={{ minHeight: '100%', paddingBottom: 48 }}>
      {recordList ? (
        <ListRecordPage
          list={recordList}
          canManage={canManage}
          onBack={() => setSelected(null)}
          onEdit={openEdit}
          onDelete={(x) => setDeleteTarget(x)}
          onViewContacts={() => navigate('/contacts')}
          onToast={showToast}
        />
      ) : (
        <>
          <StatePreview groups={[
            { label: 'Role', value: role, onChange: setRole,
              options: [{ id: 'admin', label: 'Admin' }, { id: 'user', label: 'User' }] },
            { label: 'State', value: dataState, onChange: setDataState,
              options: [{ id: 'ready', label: 'Ready' }, { id: 'loading', label: 'Loading' }, { id: 'error', label: 'Error' }] },
          ]} />

          {/* Page header */}
          <PageHeader
            icon={<Ico.List s={20} c={DS.actionPrimary} />}
            title="Lists"
            description="Manage the contact lists in your CRM"
            actions={canManage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a list</Btn>
                <OptionsMenu items={[
                  { label: 'Import a list',    icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => showToast('Import a list (demo).') },
                  { label: 'Export all lists', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => showToast('Export of all lists (demo).') },
                  { label: 'Manage folders',   icon: <Ico.Inbox s={16} c={DS.textSecondary} />,    onClick: () => showToast('Manage folders (demo).') },
                ]} />
              </div>
            )}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
            {/* List section — free-standing banners (no table card) */}
            <section style={{ margin: '0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {renamingFolder ? (
                    <>
                      <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { renameFolder(folderFilter, renameValue); setRenamingFolder(false); }
                          if (e.key === 'Escape') setRenamingFolder(false);
                        }}
                        style={{ width: 220, height: 40, padding: '0 12px', borderRadius: 6, border: `1px solid ${DS.borderFocus}`,
                                 background: DS.bgSurface, outline: 'none', fontFamily: DS.ff, ...TY.b2, color: DS.textDefault }} />
                      <Btn type="Primary" size="Small" onClick={() => { renameFolder(folderFilter, renameValue); setRenamingFolder(false); }}>Save</Btn>
                      <Btn type="Tertiary" size="Small" onClick={() => setRenamingFolder(false)}>Cancel</Btn>
                    </>
                  ) : (
                    <>
                      <FolderMenu
                        folders={folders}
                        value={folderFilter}
                        counts={folderCounts}
                        total={lists.length}
                        onChange={(v) => { setFolderFilter(v); setPage(0); }}
                        onRequestCreateFolder={() => setFolderModal(true)}
                      />
                      {folderFilter !== 'all' && canManage && (
                        <>
                          <IconBtn type="Secondary" size="Small" aria-label="Rename folder"
                            icon={<Ico.EditSquare s={16} />}
                            onClick={() => { setRenameValue(folderFilter); setRenamingFolder(true); }} />
                          <IconBtn type="Secondary" size="Small" aria-label="Delete folder"
                            icon={<Ico.TrashBin s={16} c={DS.feedbackError} />}
                            onClick={() => setFolderPendingDelete(folderFilter)} />
                        </>
                      )}
                    </>
                  )}
                </div>
                <SearchField value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search a list…" />
              </div>
              {(query.trim() !== '' || folderFilter !== 'all') && (
                <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>{filtered.length} result{filtered.length > 1 ? 's' : ''}</div>
              )}
              {body()}
            </section>
          </div>
        </>
      )}

      <ListFormPanel open={formOpen} editing={editing} folders={folders} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={save} />
      <NameModal
        open={folderModal}
        title="Create a folder"
        label="Folder name"
        placeholder="e.g. Campaigns"
        submitLabel="Create a folder"
        validate={(n) => folders.some((f) => f.toLowerCase() === n.toLowerCase()) ? 'A folder with this name already exists.' : null}
        onClose={() => setFolderModal(false)}
        onSubmit={addFolder}
      />
      {deleteTarget && <ConfirmDialog title="Delete this list?" body={`“${deleteTarget.name}” will be permanently deleted. The contacts are not deleted — only the list is.`} confirmLabel="Delete" cancelLabel="Cancel" danger onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      {folderPendingDelete && (() => {
        const cnt = folderCounts[folderPendingDelete] || 0;
        const fallback = folders.filter((f) => f !== folderPendingDelete)[0] ?? 'Unfiled';
        return <ConfirmDialog
          title={`Delete folder “${folderPendingDelete}”?`}
          body={cnt > 0 ? `${cnt} list${cnt > 1 ? 's' : ''} will be moved to “${fallback}”. The folder itself will be removed.` : 'This empty folder will be removed.'}
          confirmLabel="Delete" cancelLabel="Cancel" danger onConfirm={confirmDeleteFolder} onCancel={() => setFolderPendingDelete(null)} />;
      })()}
      <Toast toast={toast} />
      <style>{KEYFRAMES}</style>
    </div>
  );
}

const KEYFRAMES = `
@keyframes lvShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes lvSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes lvFade { from { opacity: 0; } to { opacity: 1; } }
`;
