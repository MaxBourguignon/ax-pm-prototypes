/**
 * Lists V3 — Contact Lists management (CRM > Contacts)
 * Built via the design-prototypes workflow. PAGE ONLY — renders inside the app
 * shell. Imports the shared design system + components.
 *
 * Lot: full-page List record — list information, criteria, audience dataviz
 * (synthetic profile per list) and a CTA into the full contact list.
 *
 * Re-aligned on the new AX DS (Figma nIMtO7v8dDamI8b2vnMcRc, 2026-09):
 *   - semantic tokens only — surfaceCanvas / surfaceSubtle / borderSection /
 *     textMuted replace the bgCard / bgSurface / neutral* legacy aliases
 *   - Figma type names (headlineMd · titleMd · bodyMd · labelMd · captionSm)
 *     replace the h1–h5 / b1–b3 aliases
 *   - card shells follow the DS container rule: 1px borderSection, radius 12,
 *     shadowSm — same shell as PageHeader and Table
 *   - no tabs on the record for now: Audience analysis is V2 (AUDIENCE_V2)
 *   - the chart palette is sourced from DS primitives, no raw hexes
 *   - the record follows the Contact record: DS PageHeader (record type) with
 *     an Options ActionMenu, a KpiCard strip, then the Information and Criteria cards
 * Local-only, no DS counterpart (flagged, not silently DS-badged): the
 * dataviz atoms (Donut / BarList / ReachRow / TrendChart).
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { IconBtn } from '../../components/Iconbtn';
import { Field, TextArea } from '../../components/Field';
import { Badge } from '../../components/Tag';
import { Modal } from '../../components/Modal';
import StatePreview from '../../components/StatePreview';
import Skel from '../../components/Skeleton';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Table from '../../components/Table';
import NameModal from '../../components/NameModal';
import ActionMenu from '../../components/ActionMenu';
import KpiCard from '../../components/Kpi';
import Toast from '../../components/Toast';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const TODAY = new Date('2026-06-05T00:00:00');
const d = (s) => new Date(s + 'T00:00:00');
const fmtDate = (dt) => dt.toLocaleDateString('en-GB'); // dd/mm/yyyy
const num = (n) => (n == null ? '—' : new Intl.NumberFormat('en-US').format(n));

/* ── Mock data ──────────────────────────────────────────────────────────────── */
const OWNERS = ['Camille Rey', 'Hugo Martin', 'Léa Dubois', 'Yanis Benali'];
/* Fake folders — a simple label grouping for now (no folder navigation yet). */
const FOLDERS = ['Loyalty & VIP', 'Campaigns', 'Events', 'Retail', 'Reactivation', 'Imports', 'B2B', 'Compliance'];
/* The whole CRM contact base — used to compute each list's share of the base. */
const BASE_TOTAL = 142380;

/* Dynamic-list criteria live in the segmentation engine's own format (the
   Contacts builder: { topLogic, blocks: [{ logic, filters }] }), so "Update
   list criteria" can open the engine on them as they are. `criteria` is the
   readable form the record shows, derived from it. */
const SEG_FIELDS = {
  rfmScore: 'RFM score', engagementScore: 'Engagement score', city: 'City', country: 'Country',
  tag: 'Tag', acquisitionSource: 'Acquisition source', birthdate: 'Date of birth',
};
const SEG_OPS = { gt: 'more than', gte: 'at least', lt: 'less than', eq: 'exactly', is: 'is', is_not: 'is not', contains: 'contains', is_set: 'is set' };
let segUid = 0;
const segOf = (...conds) => ({
  topLogic: 'AND',
  blocks: [{
    id: `lb${++segUid}`, logic: 'AND',
    filters: conds.map(([fieldId, op, val]) => ({ id: `lf${++segUid}`, objId: 'contact', fieldId, op, val, isAnchor: false })),
  }],
});
const criteriaOf = (segment) => (segment?.blocks ?? []).flatMap((b, bi) => b.filters.map((f, fi) => ({
  logic: bi === 0 && fi === 0 ? 'Where' : (fi === 0 ? segment.topLogic : b.logic) === 'OR' ? 'Or' : 'And',
  field: SEG_FIELDS[f.fieldId] ?? f.fieldId,
  op: SEG_OPS[f.op] ?? f.op,
  value: Array.isArray(f.val) ? f.val.join(', ') : f.val,
})));
const segmentOf = (l) => l.segment ?? { topLogic: 'AND', blocks: [] };

function buildLists() {
  return [
    { id: 'l1', name: 'VIP Clients — Top 5%', description: 'Best customers by annual revenue.', type: 'dynamic', folder: 'Loyalty & VIP', contacts: 1240, owner: 'Camille Rey', created: '2025-11-02', updated: '2026-06-05', status: 'active', tags: ['VIP', 'Loyalty'], segment: segOf(['rfmScore', 'gt', '450'], ['engagementScore', 'gte', '70']) },
    { id: 'l2', name: 'Newsletter — Active subscribers', description: 'Contacts who opened an email in the last 90 days.', type: 'dynamic', folder: 'Campaigns', contacts: 28940, owner: 'Hugo Martin', created: '2025-09-14', updated: '2026-06-03', status: 'active', tags: ['Email'], segment: segOf(['engagementScore', 'gte', '50']) },
    { id: 'l3', name: 'Prospects Paris Expo 2026 — spring edition, porte de Versailles', description: 'Leads collected at the booth.', type: 'static', folder: 'Events', contacts: 412, owner: 'Léa Dubois', created: '2026-03-21', updated: '2026-05-28', status: 'active', tags: ['Event', 'Prospect'], criteria: [] },
    { id: 'l4', name: 'Lyon store — local customers', description: 'Customers attached to the Lyon point of sale.', type: 'dynamic', folder: 'Retail', contacts: 3120, owner: 'Yanis Benali', created: '2025-12-08', updated: '2026-05-30', status: 'active', tags: ['Retail'], segment: segOf(['city', 'is', 'Lyon']) },
    { id: 'l5', name: 'Re-engagement — inactive 6 months', description: '', type: 'dynamic', folder: 'Reactivation', contacts: 8760, owner: 'Camille Rey', created: '2026-01-19', updated: '2026-04-12', status: 'active', tags: ['Winback'], segment: segOf(['engagementScore', 'lt', '20']) },
    { id: 'l6', name: 'CSV import — March (to clean up)', description: 'Manual import, duplicates to review.', type: 'import', folder: 'Imports', contacts: 0, owner: 'Hugo Martin', created: '2026-03-02', updated: '2026-03-02', status: 'active', tags: ['Import'], criteria: [] },
    { id: 'l7', name: 'Loyalty program members', description: 'Loyalty card holders.', type: 'dynamic', folder: 'Loyalty & VIP', contacts: 52310, owner: 'Léa Dubois', created: '2025-07-22', updated: '2026-06-01', status: 'active', tags: ['Loyalty', 'Wallet'], segment: segOf(['tag', 'is', 'Club friend']) },
    { id: 'l8', name: 'VIP — private evening invitations', description: 'Manual selection for the June 20 event.', type: 'static', folder: 'Events', contacts: 180, owner: 'Camille Rey', created: '2026-05-15', updated: '2026-06-04', status: 'active', tags: ['Event', 'VIP'], criteria: [] },
    { id: 'l9', name: 'Black Friday 2025 buyers', description: 'Contacts who ordered during the sale.', type: 'static', folder: 'Campaigns', contacts: 6420, owner: 'Yanis Benali', created: '2025-12-01', updated: '2026-02-10', status: 'active', tags: ['Promo'], criteria: [] },
    { id: 'l10', name: 'SMS — mobile opt-in', description: 'Contacts who consented to the SMS channel.', type: 'dynamic', folder: 'Compliance', contacts: 14200, owner: 'Hugo Martin', created: '2025-10-03', updated: '2026-05-20', status: 'active', tags: ['SMS', 'Consent'], segment: segOf(['acquisitionSource', 'is', 'App']) },
    { id: 'l11', name: 'Birthdays of the month', description: 'Auto-updated every month.', type: 'dynamic', folder: 'Campaigns', contacts: 2310, owner: 'Léa Dubois', created: '2026-02-28', updated: '2026-06-01', status: 'active', tags: ['Automation'], segment: segOf(['birthdate', 'is_set', '']) },
    { id: 'l12', name: 'Key B2B accounts', description: 'Organizations with more than 50 attached contacts.', type: 'dynamic', folder: 'B2B', contacts: 96, owner: 'Yanis Benali', created: '2025-08-30', updated: '2026-04-25', status: 'active', tags: ['B2B'], segment: segOf(['acquisitionSource', 'is', 'Partner']) },
    { id: 'l13', name: 'Unsubscribed — global exclusion', description: 'To exclude from all campaigns.', type: 'dynamic', folder: 'Compliance', contacts: 3870, owner: 'Hugo Martin', created: '2025-06-11', updated: '2026-05-12', status: 'active', tags: ['Suppression'], segment: segOf(['engagementScore', 'eq', '0']) },
    { id: 'l14', name: 'Salesforce import — key accounts', description: 'One-off sync from the external CRM.', type: 'import', folder: 'Imports', contacts: 2040, owner: 'Yanis Benali', created: '2026-05-18', updated: '2026-05-18', status: 'active', tags: ['Import', 'CRM'], criteria: [] },
  ].map((l) => (l.segment ? { ...l, criteria: criteriaOf(l.segment) } : l));
}

/* Coming back from the segmentation engine (Contacts) with router state:
   { listUpdated: { id, segment, criteria } } — the list's criteria changed;
   { listCreated: { …list } } — a new list was saved from those filters;
   { openList: id } — the user went back without saving. */
function applyReturn(lists, ret) {
  if (ret?.listUpdated) {
    const u = ret.listUpdated;
    return lists.map((l) => (l.id === u.id ? { ...l, segment: u.segment, criteria: u.criteria, updated: '2026-06-05' } : l));
  }
  if (ret?.listCreated) {
    const c = ret.listCreated;
    return [{
      id: c.id, name: c.name, description: c.description ?? '', type: c.type, folder: c.folder,
      contacts: c.contacts ?? 0, owner: OWNERS[0], created: '2026-06-05', updated: '2026-06-05',
      status: 'active', tags: [], segment: c.segment, criteria: c.criteria ?? [],
    }, ...lists];
  }
  return lists;
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

/* ── Local atoms ─────────────────────────────────────────────────────────────── */
/* Tone pairs come from the DS Badge tones (Tag.jsx BADGE_TONES). `import` has
   no DS tone — the DS Badge ships 5 colours, none neutral — so it borrows the
   surface/subtle + text/secondary pair rather than misusing `warning`. */
const TYPES = {
  dynamic: { label: 'Dynamic',       long: 'Dynamic (auto)',       tone: 'success' },
  static:  { label: 'Static',        long: 'Static (manual)',      tone: 'primary' },
  import:  { label: 'Manual import', long: 'Manual import (file)', tone: 'neutral' },
};
/* The list type is a plain qualifier, so it renders as the DS Atoms/Badge
   (523:73) and nothing else — no leading icon. The icon was a local extension
   on top of the atom; dropping it leaves the chips uniform with every other
   badge in the app. `neutral` is a tone this file added to Badge (see Tag.jsx). */
function TypeBadge({ type }) {
  const t = TYPES[type] || TYPES.static;
  return <Badge tone={t.tone}>{t.label}</Badge>;
}

/* ── Lists table — the shared DS Table ────────────────────────────────────────
   Was the BannerTable (free-standing card rows). Now Molecules/Cell composed by
   components/Table.jsx, i.e. the Figma `Table / Contacts` template (2052:38194):
   one bordered shell, a TableToolbar on top and a PaginationBar underneath —
   the same chrome the Contacts table already uses.
   The name column is a plain text cell: the DS gives the first column weight 500
   (Label/Large), which is the identity emphasis BannerIdentity was after. The
   description line under the name is gone — it lives on the list record. */
const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const LIST_COLUMNS = [
  // The name column is capped rather than flexible: left to flex it swallowed
  // every spare pixel and pushed the other columns to the far right.
  { key: 'name',     label: 'Name',          width: 360 },
  { key: 'type',     label: 'Type' },
  { key: 'created',  label: 'Creation date' },
  { key: 'folder',   label: 'Folder' },
  { key: 'owner',    label: 'Owner' },
  // Count over its share of the base, in the DS two-line cell, right-aligned.
  { key: 'contacts', label: 'Contacts',      type: 'titleDescription', width: 170, align: 'right' },
];

const pctOfBase = (n) => `${((n / BASE_TOTAL) * 100).toFixed(2)}% of the database`;

/* Folders are plain names in the mock data, so a folder identifier is derived
   from the name — stable across reloads, and shaped like the list ids. */
const folderId = (name) => `fld_${hashSeed(name).toString(36)}`;

/* Clipboard access throws in an insecure context and is absent in some
   embedded webviews, so the toast reports what actually happened. */
async function copyId(value, label, onToast) {
  try {
    await navigator.clipboard.writeText(value);
    onToast(`${label} copied — ${value}`);
  } catch {
    onToast(`Could not reach the clipboard. ${label}: ${value}`);
  }
}

function listCell(l, key) {
  switch (key) {
    case 'name':     return <span style={clip}>{l.name}</span>;
    case 'type':     return <TypeBadge type={l.type} />;
    case 'created':  return fmtDate(d(l.created));
    case 'folder':   return <span style={clip}>{l.folder}</span>;
    case 'owner':    return <span style={clip}>{l.owner}</span>;
    case 'contacts': return { title: num(l.contacts), description: pctOfBase(l.contacts) };
    default:         return null;
  }
}

/* Loading keeps the table shell — toolbar, headers and pager stay put while the
   rows fill in, instead of the page swapping to a stack of floating skeletons. */
const SKELETON_ROWS = [0, 1, 2, 3, 4, 5].map((i) => ({ id: `skel-${i}` }));
const skeletonCell = (_row, key) => {
  if (key === 'name')     return <Skel w={180} h={12} />;
  if (key === 'contacts') return { title: <Skel w={54} h={12} />, description: <Skel w={90} h={9} /> };
  return <Skel w={90} h={12} />;
};

function ListsTable({
  data, sortKey, sortDir, onSort, canManage, loading,
  onOpen, onEdit, onDuplicate, onDelete, onToast,
  toolbar, page, pages, setPage, total, pageSize, emptyState,
  checked, onCheckedChange,
}) {
  return (
    <Table
      columns={LIST_COLUMNS}
      rows={loading ? SKELETON_ROWS : data}
      rowId={(l) => l.id}
      cell={loading ? skeletonCell : listCell}
      sortKey={sortKey} sortDir={sortDir} onSort={loading ? undefined : onSort}
      onRowClick={loading ? undefined : (l) => onOpen(l.id)}
      /* Row checkboxes feed the bulk actions, which are admin-only — a viewer
         has nothing to do with a selection, so they get no checkbox column. */
      selectable={canManage && !loading}
      selected={checked}
      onSelectedChange={onCheckedChange}
      actions={loading ? undefined : (l) => (
        <ActionMenu items={[
          { label: 'View', icon: <Ico.Eye s={16} c={DS.actionPrimary} />, onClick: () => onOpen(l.id) },
          { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => onDuplicate(l) },
          { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => onEdit(l), hidden: !canManage },
          { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, onClick: () => onDelete(l), danger: true, hidden: !canManage },
          { label: 'Export', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => onToast('Export generated (demo).'), hidden: canManage },
          { label: 'Copy list identifier', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => copyId(l.id, 'List identifier', onToast), hidden: !canManage },
          { label: 'Copy folder identifier', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => copyId(folderId(l.folder), 'Folder identifier', onToast), hidden: !canManage },
        ]} />
      )}
      toolbar={toolbar}
      page={page} pages={pages} setPage={setPage} total={total} pageSize={pageSize}
      emptyState={emptyState}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FULL-PAGE LIST RECORD — dataviz atoms
   ═══════════════════════════════════════════════════════════════════════════ */
/* Categorical chart palette — DS primitives only, no raw hexes. Five hues that
   stay distinguishable next to each other on surfaceCanvas. */
const CHART_BLUE   = DS.brandPrimary,   // #2575FC
      CHART_INDIGO = DS.purple400,      // #6B52FE
      CHART_TEAL   = DS.teal500,        // #34B0A1
      CHART_ORANGE = DS.orange400,      // #FE9D55
      CHART_PURPLE = DS.pink700;        // #A23192

/* Section card — the DS container shell (borderSection · radius 12 · shadowSm),
   title over an optional one-line description, as on the Consents page. No
   icon tile: the title names the block. */
function RecordCard({ title, sub, right, children, style }) {
  return (
    <section style={{ background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl, boxShadow: DS.shadowSm, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, ...style }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...TY.titleMd, color: DS.textStrong, fontFamily: DS.ff }}>{title}</div>
            {sub && <div style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, marginTop: 2 }}>{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/* One field — label above value, the single field format used across the app. */
function InfoItem({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', ...TY.bodyMd, color: DS.textStrong, fontFamily: DS.ff }}>{children}</span>
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
        <circle cx={C} cy={C} r={R} fill="none" stroke={DS.surfaceSubtle} strokeWidth={SW} />
        {arcs.map((a) => (
          <circle key={a.label} cx={C} cy={C} r={R} fill="none" stroke={a.color}
                  strokeWidth={SW} strokeDasharray={`${a.dash} ${circ - a.dash}`}
                  strokeDashoffset={-a.off} transform={`rotate(-90 ${C} ${C})`} strokeLinecap="butt" />
        ))}
        <text x={C} y={C - 2} textAnchor="middle" style={{ ...TY.titleMd }} fill={DS.textStrong} fontFamily={DS.ff}>{centerValue}</text>
        <text x={C} y={C + 16} textAnchor="middle" style={{ ...TY.captionSm }} fill={DS.textMuted} fontFamily={DS.ff}>{centerLabel}</text>
      </svg>
      <div style={{ flex: 1, minWidth: 130, display: 'flex', flexDirection: 'column' }}>
        {data.map((x, i) => (
          <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: i === 0 ? 'none' : `1px solid ${DS.borderDivider}`, ...TY.labelMd, color: DS.textDefault, fontFamily: DS.ff }}>
            <span style={{ width: 10, height: 10, borderRadius: DS.radiusSm, background: x.color, flexShrink: 0 }} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>
            <span style={{ color: DS.textDefault }}>{it.label}</span>
            <span style={{ fontWeight: TY.weightSemiBold, color: DS.textDefault }}>{it.pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: DS.radiusPill, background: DS.surfaceSubtle, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${it.pct}%`, background: it.color, borderRadius: DS.radiusPill, transition: 'width .3s' }} />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.labelMd, fontFamily: DS.ff }}>
        {icon}
        <span style={{ flex: 1, color: DS.textDefault }}>{label}</span>
        <span style={{ color: DS.textSecondary }}>{reach}% reachable · <span style={{ color, fontWeight: TY.weightSemiBold }}>{optin}% opt-in</span></span>
      </div>
      <div style={{ position: 'relative', height: 10, borderRadius: DS.radiusPill, background: DS.surfaceSubtle, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${reach}%`, background: `${color}33`, borderRadius: DS.radiusPill }} />
        <div style={{ position: 'absolute', inset: 0, width: `${optin}%`, background: color, borderRadius: DS.radiusPill }} />
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
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontSize="12" fill={DS.textSecondary} fontFamily={DS.ff}>{num(t)}</text>
            </g>
          );
        })}
        {/* x-axis month labels */}
        {months.map((m, i) => (
          <text key={i} x={xAt(i)} y={H - PAD_B + 22} textAnchor="middle" fontSize="11"
                fill={hoverIdx === i ? DS.textDefault : DS.textSecondary} fontFamily={DS.ff}>{m}</text>
        ))}
        {/* hover guide */}
        {hoverIdx != null && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B}
                stroke={DS.neutral200} strokeWidth="1" strokeDasharray="3 3" />
        )}
        <path d={areaD} fill="url(#lvTrend)" />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* end dot */}
        <circle cx={last.x} cy={last.y} r="3.5" fill={DS.surfaceCanvas} stroke={color} strokeWidth="2" />
        {/* hovered point */}
        {hoverIdx != null && (
          <circle cx={xAt(hoverIdx)} cy={yAt(values[hoverIdx])} r="6" fill={DS.surfaceCanvas} stroke={color} strokeWidth="2.5" />
        )}
      </svg>

      {/* hover tooltip — white card (ConsentsV3 EvolutionChart pattern) */}
      {hoverIdx != null && (
        <div style={{ position: 'absolute', top: 12,
                      left: `calc(${(xAt(hoverIdx) / W) * 100}% + ${xAt(hoverIdx) > W / 2 ? '-200px' : '16px'})`,
                      background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusLg,
                      boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 12, minWidth: 184, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ ...TY.labelMd, color: DS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: DS.ff }}>
            {months[hoverIdx]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ flex: 1, ...TY.labelMd, color: DS.textDefault, fontFamily: DS.ff }}>Contacts</span>
            <span style={{ ...TY.bodyMdBold, color: DS.textDefault }}>{num(values[hoverIdx])}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* Folder menu — input-style dropdown to switch the viewed folder or create one. */
/* Folder filter — the DS Atoms/Select (556:2972) via components/Select.jsx,
   replacing the hand-rolled dropdown that came before. No folder icons anywhere.
   The count lives in the option label — "Campaigns (12 lists)" — rather than in
   a trailing pill or numeral: it reads as one phrase, and it carries into the
   closed trigger, so the active folder still states its size.
   "Create a folder" is the Select's footerAction — an action under the rule,
   not a selectable folder. */
/* Folder name, then its size in text/muted — no parentheses. The name is what
   you scan for, so it keeps text/default at full weight and the count trails it
   a shade quieter, the way the app writes every other piece of metadata. It is
   a node rather than a string, so the closed trigger renders it the same way. */
const withCount = (name, n) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    <span style={{ ...TY.labelMd, color: DS.textMuted, flexShrink: 0 }}>
      {n} list{n === 1 ? '' : 's'}
    </span>
  </span>
);

function FolderSelect({ folders, value, counts, total, onChange, onRequestCreateFolder }) {
  return (
    <Select
      width={240}
      portal
      value={value}
      onChange={onChange}
      options={[
        { value: 'all', label: withCount('All folders', total) },
        ...folders.map((f) => ({ value: f, label: withCount(f, counts[f] ?? 0) })),
      ]}
      footerAction={{
        label: 'Create a folder',
        icon: <Ico.Plus s={16} c={DS.actionPrimary} />,
        onClick: onRequestCreateFolder,
      }}
    />
  );
}

/* ── Full-page List record ──────────────────────────────────────────────────── */
/* Bulk "Move to another folder" — pick the destination for the ticked lists. */
function MoveToFolderModal({ open, count, folders, onClose, onConfirm }) {
  const [folder, setFolder] = useState(null);
  const close = () => { setFolder(null); onClose(); };
  return (
    <Modal
      open={open}
      onClose={close}
      title="Move to another folder"
      variant="center"
      size="sm"
      footer={(
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
          <Btn type="Tertiary" size="Medium" onClick={close}>Cancel</Btn>
          <Btn type="Primary" size="Medium" disabled={!folder} onClick={() => { onConfirm(folder); setFolder(null); }}>Move</Btn>
        </div>
      )}
    >
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span style={{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault }}>
          <strong>{count} list{count > 1 ? 's' : ''}</strong> will be moved to the folder you choose.
        </span>
        <Select portal label="Folder" value={folder} onChange={setFolder} placeholder="Select a folder…"
                options={folders.map((f) => ({ value: f, label: f }))} />
      </div>
    </Modal>
  );
}

/* Audience analysis is V2: its content stays below, switched off, and the
   record shows no tabs until it returns. */
const AUDIENCE_V2 = false;

const TYPE_STATUS = {
  dynamic: { label: 'Dynamic · updates automatically', tone: DS.feedbackSuccess },
  static:  { label: 'Static · managed by hand',        tone: DS.brandPrimary },
  import:  { label: 'Imported from a file',            tone: DS.textSecondary },
};

/* Full-page list record, on the Contact record pattern: back link, the DS
   PageHeader (record type) with Options · View contacts · Edit list, a KPI
   strip, then the Information and Criteria cards. */
function ListRecordPage({ list: l, canManage, onBack, onEdit, onDelete, onViewContacts, onUpdateCriteria, onToast }) {
  const p = buildProfile(l);
  const status = TYPE_STATUS[l.type] || TYPE_STATUS.static;

  const pctLabel = p.pctOfBase < 0.1 ? '<0.1%' : `${p.pctOfBase.toFixed(1)}%`;
  const genderData = [
    { label: 'Female', value: p.gender[0], color: CHART_PURPLE },
    { label: 'Male',   value: p.gender[1], color: CHART_BLUE },
    { label: 'Other',  value: p.gender[2], color: DS.neutral300 },
  ];
  const catchmentData = [
    { label: 'Local (< 25 km)', value: p.catchment[0], color: CHART_BLUE },
    { label: 'Regional',        value: p.catchment[1], color: CHART_TEAL },
    { label: 'National',        value: p.catchment[2], color: DS.neutral300 },
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
  const deltaLabel = `${trendDelta >= 0 ? '+' : '−'}${num(Math.abs(trendDelta))} over 12 months`;

  return (
    <div style={{ fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <Btn type="Tertiary" size="Small" iconLeft={<Ico.ArrowBack s={16} c={DS.actionPrimary} />} onClick={onBack}>Back to lists</Btn>

        <div style={{ alignSelf: 'stretch' }}>
          <PageHeader
            type="contact"
            title={l.name}
            leading={(
              <span style={{ width: 64, height: 64, borderRadius: DS.radiusXl, background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ico.List s={28} c={DS.actionPrimary} />
              </span>
            )}
            status={status.label}
            statusTone={status.tone}
            details={[
              l.folder,
              `${num(l.contacts)} contacts`,
              `Created by ${l.owner} on ${fmtDate(d(l.created))}`,
              `Updated ${fmtDate(d(l.updated))}`,
            ]}
            actions={(
              <>
                <ActionMenu
                  label="Options"
                  size="Md"
                  items={[
                    { label: 'Export', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => onToast('Export generated (demo).') },
                    { label: 'Delete', icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: () => onDelete(l), danger: true, hidden: !canManage },
                  ]}
                />
                <Btn type={canManage ? 'Secondary' : 'Primary'} onClick={onViewContacts}>View contacts</Btn>
                {canManage && <Btn type="Primary" onClick={() => onEdit(l)}>Edit list</Btn>}
              </>
            )}
          />
        </div>
      </div>

      {/* KPI strip — DS KpiCard Type=Stat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KpiCard label="Contacts" value={num(p.total)} delta={deltaLabel} trend={trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'flat'} />
        <KpiCard label="Share of base" value={pctLabel} sub={`of ${num(BASE_TOTAL)} contacts`} />
        <KpiCard label="Email opt-in" value={`${p.emailOptin}%`} sub={`${p.emailReach}% have an email`} />
        <KpiCard label="SMS opt-in" value={`${p.smsOptin}%`} sub={`${p.smsReach}% have a mobile`} />
      </div>

      {(
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <RecordCard title="Information" style={{ flex: '1 1 380px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px 24px' }}>
              <InfoItem label="Type"><TypeBadge type={l.type} /></InfoItem>
              <InfoItem label="Folder">{l.folder}</InfoItem>
              <InfoItem label="Created by">{l.owner}</InfoItem>
              <InfoItem label="Created on">{fmtDate(d(l.created))}</InfoItem>
              <InfoItem label="Last updated">{fmtDate(d(l.updated))}</InfoItem>
              <InfoItem label="Tags">
                {l.tags?.length ? l.tags.map((tg) => <Badge key={tg} tone="neutral">{tg}</Badge>) : '—'}
              </InfoItem>
            </div>
            <div style={{ borderTop: `1px solid ${DS.borderDivider}`, paddingTop: 16 }}>
              <InfoItem label="Description">
                <span style={{ whiteSpace: 'pre-wrap', color: l.description ? DS.textStrong : DS.textSecondary }}>
                  {l.description || 'No description provided.'}
                </span>
              </InfoItem>
            </div>
          </RecordCard>

          <RecordCard
            title="Criteria"
            sub={hasCriteria ? 'Filters that define this dynamic audience' : undefined}
            right={l.type === 'dynamic' && canManage
              ? <Btn type="Secondary" size="Small" onClick={() => onUpdateCriteria(l)}>Update list criteria</Btn>
              : undefined}
            style={{ flex: '1 1 380px' }}
          >
            {hasCriteria ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {l.criteria.map((cr, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.surfaceSubtle, borderRadius: DS.radiusLg, padding: '10px 12px', ...TY.bodyMd, fontFamily: DS.ff }}>
                    <span style={{ ...TY.labelMd, color: DS.textSecondary, width: 44 }}>{cr.logic ?? (i === 0 ? 'Where' : 'And')}</span>
                    <span style={{ ...TY.labelLg, color: DS.textStrong }}>{cr.field}</span>
                    <span style={{ color: DS.textSecondary }}>{cr.op}</span>
                    {cr.value !== '' && cr.value != null && <span style={{ ...TY.labelLg, color: DS.brandOnSurface }}>{cr.value}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Ico.List s={22} />}
                title={l.type === 'dynamic' ? 'No criteria yet' : l.type === 'import' ? 'Imported list' : 'Static list'}
                sub={l.type === 'dynamic' ? 'Use “Update list criteria” to define who belongs to this list.'
                  : l.type === 'import' ? 'Contacts come from a file import — there are no dynamic criteria.' : 'Contacts are added by hand — there are no dynamic criteria.'}
              />
            )}
          </RecordCard>
        </div>
      )}

      {AUDIENCE_V2 && (
        <>
          <RecordCard
            title="Contacts — last 12 months"
            sub="Monthly evolution of this list"
            right={(
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.bodyMdBold, fontFamily: DS.ff, color: trendDelta >= 0 ? DS.feedbackSuccess : DS.feedbackError }}>
                {trendDelta >= 0 ? <Ico.TrendUp s={16} c={DS.feedbackSuccess} /> : <Ico.TrendDown s={16} c={DS.feedbackError} />}
                {deltaLabel}
              </span>
            )}
          >
            <TrendChart months={p.months} values={p.trend} />
          </RecordCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            <RecordCard title="Gender split">
              <Donut data={genderData} centerValue={num(p.total)} centerLabel="contacts" />
            </RecordCard>
            <RecordCard title="Age cohorts" sub={`Average age ${p.avgAge} years`}>
              <BarList items={ageItems} />
            </RecordCard>
            <RecordCard title="Engagement lifecycle" sub="New · Active · At risk · Lapsed">
              <BarList items={lifeItems} />
            </RecordCard>
            <RecordCard title="Loyalty — purchase frequency" sub={`≈ ${p.avgPurch.toFixed(1)} purchases per contact`}>
              <BarList items={loyItems} />
            </RecordCard>
            <RecordCard title="Recency — last purchase">
              <BarList items={recItems} />
            </RecordCard>
            <RecordCard title="Location & catchment">
              <Donut data={catchmentData} centerValue={`${p.catchment[0]}%`} centerLabel="local" size={130} />
              <div style={{ borderTop: `1px solid ${DS.borderDivider}`, paddingTop: 12 }}>
                <div style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, marginBottom: 6 }}>Top cities</div>
                {p.cities.map((city, i) => (
                  <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', ...TY.labelMd, fontFamily: DS.ff }}>
                    <span style={{ flex: 1, color: DS.textDefault }}>{city}</span>
                    <span style={{ color: DS.textStrong, fontWeight: TY.weightSemiBold }}>{p.cityPct[i]}%</span>
                  </div>
                ))}
              </div>
            </RecordCard>
            <RecordCard title="Reachability & consent" sub="Contactable share and opt-in per channel">
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
  );
}

/* ── Create / edit panel ────────────────────────────────────────────────────── */
function ListFormPanel({ open, editing, onClose, onSave, folders = FOLDERS }) {
  // Information only — criteria are edited in the segmentation engine, through
  // "Update list criteria" on the list record.
  const blank = { name: '', description: '', type: 'static', owner: OWNERS[0], folder: folders[0], tags: '' };
  const [form, setForm] = useState(blank);
  const [initial, setInitial] = useState(blank); // what the drawer opened with
  const [err, setErr] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) { // render-time reset on open (no effect)
    setWasOpen(open);
    if (open) {
      const start = editing
        ? { name: editing.name, description: editing.description, type: editing.type, owner: editing.owner, folder: editing.folder || folders[0], tags: editing.tags.join(', ') }
        : blank;
      setForm(start); setInitial(start);
      setErr({}); setConfirmClose(false);
    }
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  // Only real changes ask before closing — not a pre-filled edit form.
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const tryClose = () => { if (dirty) setConfirmClose(true); else onClose(); };
  const save = () => {
    const e = {}; if (!form.name.trim()) e.name = 'Name is required.';
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
            <Btn type="Primary" size="Medium" onClick={save}>{editing ? 'Save' : 'Create list'}</Btn>
          </div>
        )}
      >
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="List name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. VIP Clients — Paris" error={err.name} />
        <TextArea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What is this list for?" />
        <Select label="Type" value={form.type} onChange={(v) => set('type', v)} options={[{ value: 'dynamic', label: 'Dynamic — auto-updated' }, { value: 'static', label: 'Static — manual selection' }, { value: 'import', label: 'Manual import — from a file' }]} />
        <Select label="Folder" value={form.folder} onChange={(v) => set('folder', v)} options={folders.map((f) => ({ value: f, label: f }))} />
        <Select label="Owner" value={form.owner} onChange={(v) => set('owner', v)} options={OWNERS.map((o) => ({ value: o, label: o }))} />
        <Field label="Tags (comma-separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="VIP, Loyalty" />
      </div>
      </Modal>
      {confirmClose && <ConfirmDialog title="Discard changes?" body="The information you entered will be lost." confirmLabel="Discard" cancelLabel="Cancel" confirmIcon={null} danger onConfirm={() => { setConfirmClose(false); onClose(); }} onCancel={() => setConfirmClose(false)} />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function ListsV3() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ret] = useState(() => location.state ?? {});
  const [role, setRole] = useState('admin');
  const [dataState, setDataState] = useState('ready');
  const [lists, setLists] = useState(() => applyReturn(buildLists(), ret));
  const [query, setQuery] = useState('');
  const [folders, setFolders] = useState(FOLDERS);
  const [folderFilter, setFolderFilter] = useState('all');
  const [folderPendingDelete, setFolderPendingDelete] = useState(null);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(ret.listUpdated?.id ?? ret.listCreated?.id ?? ret.openList ?? null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [checked, setChecked] = useState([]);   // ids ticked for bulk actions
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [toast, setToast] = useState(ret.listUpdated ? 'List criteria updated. Contacts refresh at the next update.'
    : ret.listCreated ? `List “${ret.listCreated.name}” created.` : null);
  const [sortKey, setSortKey] = useState('created');
  const [sortDir, setSortDir] = useState('desc');
  const [folderModal, setFolderModal] = useState(false);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  /* Consume the return state once: clear the toast it set, and drop it from
     history so a refresh doesn't re-apply it. */
  useEffect(() => {
    if (!location.state) return;
    navigate(location.pathname, { replace: true, state: null });
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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

  // A list is born from a segmentation, so "Create a list" hands over to the
  // Contacts page and its segment builder rather than opening a form here.
  // ListFormPanel stays for EDIT, which still works on an existing list.
  const openCreate = () => navigate('/contacts');
  // The drawer opens over the current page — editing from the record keeps
  // the record open behind it.
  const openEdit = (l) => { setEditing(l); setFormOpen(true); };
  const duplicate = (l) => { const id = 'l' + Date.now(); setLists((ls) => [{ ...l, id, name: l.name + ' (copy)', updated: '2026-06-05', created: '2026-06-05' }, ...ls]); showToast('List duplicated.'); };
  const save = (form, edit) => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (edit) {
      setLists((ls) => ls.map((l) => (l.id === edit.id ? { ...l, name: form.name, description: form.description, type: form.type, owner: form.owner, folder: form.folder, tags, updated: '2026-06-05' } : l)));
      showToast('List updated.');
    } else {
      const id = 'l' + Date.now();
      setLists((ls) => [{ id, name: form.name, description: form.description, type: form.type, owner: form.owner, folder: form.folder, tags, criteria: [], contacts: 0, status: 'active', created: '2026-06-05', updated: '2026-06-05' }, ...ls]);
      showToast('List created.');
    }
    setFormOpen(false); setEditing(null);
  };
  const confirmDelete = () => { const t = deleteTarget; setLists((ls) => ls.filter((l) => l.id !== t.id)); setChecked((ids) => ids.filter((id) => id !== t.id)); setDeleteTarget(null); setSelected(null); showToast('List deleted.'); };
  const confirmMove = (folder) => {
    const n = checked.length;
    setLists((ls) => ls.map((l) => (checked.includes(l.id) ? { ...l, folder, updated: '2026-06-05' } : l)));
    setChecked([]);
    setMoveOpen(false);
    showToast(`${n} list${n > 1 ? 's' : ''} moved to “${folder}”.`);
  };
  const confirmBulkDelete = () => {
    const n = checked.length;
    setLists((ls) => ls.filter((l) => !checked.includes(l.id)));
    setChecked([]);
    setBulkDeleteOpen(false);
    showToast(`${n} list${n > 1 ? 's' : ''} deleted.`);
  };

  const recordList = selected ? lists.find((x) => x.id === selected) : null;

  /* The folder filter, the folder rename/delete actions and the search all sit
     in the DS TableToolbar now (Molecules/TableToolbar 1784:33159) instead of a
     hand-rolled strip above the rows — so they stay with the table in every
     state, including loading. */
  const toolbarLeft = renamingFolder ? (
    <>
      <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { renameFolder(folderFilter, renameValue); setRenamingFolder(false); }
          if (e.key === 'Escape') setRenamingFolder(false);
        }}
        style={{ width: 240, height: 36, boxSizing: 'border-box', padding: '0 12px', borderRadius: DS.radiusLg,
                 border: `1px solid ${DS.borderFocus}`, background: DS.surfaceCanvas, outline: 'none',
                 fontFamily: DS.ff, ...TY.bodyMd, color: DS.textDefault }} />
      <Btn type="Primary" size="Small" onClick={() => { renameFolder(folderFilter, renameValue); setRenamingFolder(false); }}>Save</Btn>
      <Btn type="Tertiary" size="Small" onClick={() => setRenamingFolder(false)}>Cancel</Btn>
    </>
  ) : (
    <>
      <FolderSelect
        folders={folders}
        value={folderFilter}
        counts={folderCounts}
        total={lists.length}
        onChange={(v) => { setFolderFilter(v); setPage(0); }}
        onRequestCreateFolder={() => setFolderModal(true)}
      />
      {folderFilter !== 'all' && canManage && (
        <>
          <IconBtn type="Secondary" size="Small" aria-label="Rename folder" title="Rename folder"
            icon={<Ico.EditSquare s={16} />}
            onClick={() => { setRenameValue(folderFilter); setRenamingFolder(true); }} />
          <IconBtn type="Secondary" size="Small" aria-label="Delete folder" title="Delete folder"
            icon={<Ico.TrashBin s={16} c={DS.feedbackError} />}
            onClick={() => setFolderPendingDelete(folderFilter)} />
        </>
      )}
    </>
  );

  const tableToolbar = {
    leftExtra: toolbarLeft,
    search: query,
    onSearchChange: (v) => { setQuery(v); setPage(0); },
    searchPlaceholder: 'Search a list…',
    // Bulk actions on the ticked lists — the same "Options" menu as Contacts.
    options: canManage ? (
      <ActionMenu
        label={checked.length ? `Options (${checked.length})` : 'Options'}
        size="Md"
        align="left"
        width={240}
        disabled={checked.length === 0}
        disabledTooltip="Select at least one list to use these options"
        items={[
          { label: 'Move to another folder', icon: <Ico.Inbox s={16} c={DS.textSecondary} />, onClick: () => setMoveOpen(true) },
          { label: checked.length > 1 ? `Delete ${checked.length} lists` : 'Delete list', icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: () => setBulkDeleteOpen(true), danger: true },
        ]}
      />
    ) : undefined,
  };

  const body = () => {
    if (dataState === 'error') return <ErrorState title="Unable to load the lists." retryLabel="Retry" onRetry={() => setDataState('ready')} />;
    // Nothing to filter yet — the toolbar would be dead chrome, so the empty
    // state stands on its own rather than inside an empty table shell.
    if (dataState === 'ready' && lists.length === 0) return <EmptyState icon={<Ico.List s={24} />} title="No lists yet" sub="Create your first contact list to segment your CRM." cta={<Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a list</Btn>} />;
    return (
      <ListsTable
        data={pageItems}
        loading={dataState === 'loading'}
        sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}
        canManage={canManage}
        onOpen={(id) => setSelected(id)} onEdit={openEdit} onDuplicate={duplicate}
        onDelete={(x) => setDeleteTarget(x)} onToast={showToast}
        toolbar={tableToolbar}
        page={pageSafe} pages={pages} setPage={setPage}
        total={sorted.length} pageSize={pageSize}
        checked={checked} onCheckedChange={setChecked}
        emptyState={<EmptyState icon={<Ico.Search s={24} />} title="No results" sub="No list matches your search or the selected filter." />}
      />
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
          onUpdateCriteria={(x) => navigate('/contacts', {
            state: { listCriteria: { id: x.id, name: x.name, segment: segmentOf(x) } },
          })}
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
            title="Lists"
            // The DS count/freshness line, which is what PageHeader's `meta`
            // slot is for — it takes precedence over `description`.
            meta={`${lists.length} list${lists.length === 1 ? '' : 's'} in ${folders.length} folder${folders.length === 1 ? '' : 's'} in total`}
            actions={(
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Btn type="Secondary" size="Medium" iconLeft={<Ico.Download s={18} />} onClick={() => showToast('Import a list (demo).')}>Import a list</Btn>
                <Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a list</Btn>
              </div>
            )}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 16 }}>
            {/* List section — one DS Table (toolbar · rows · pagination) */}
            {/* No horizontal margin: AppLayout already insets the page by 32px,
                so the table shell lines up with the PageHeader above it. */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
      <MoveToFolderModal open={moveOpen} count={checked.length} folders={folders}
        onClose={() => setMoveOpen(false)} onConfirm={confirmMove} />
      {bulkDeleteOpen && (() => {
        const names = lists.filter((l) => checked.includes(l.id)).map((l) => `“${l.name}”`);
        const shown = names.slice(0, 3).join(', ') + (names.length > 3 ? ` and ${names.length - 3} more` : '');
        return (
          <ConfirmDialog
            title={`Delete ${names.length} list${names.length > 1 ? 's' : ''}?`}
            body={`${shown} will be permanently deleted. The contacts are not deleted — only the lists are.`}
            confirmLabel="Delete" cancelLabel="Cancel" danger
            onConfirm={confirmBulkDelete} onCancel={() => setBulkDeleteOpen(false)}
          />
        );
      })()}
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
