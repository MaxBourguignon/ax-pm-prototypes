import React from 'react';
import { createPortal } from 'react-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Btn from '../../components/Btn';
import { Field, TextArea } from '../../components/Field';
import { Radio } from '../../components/Controls';
import { Badge, StatusBadge } from '../../components/Tag';
import Modal from '../../components/Modal';
import StatePreview from '../../components/StatePreview';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import Table from '../../components/Table';
import Select, { MenuItem } from '../../components/Select';
import { panelShell, PANEL_MAX_H } from '../../components/menuPanel';
import PageHeader from '../../components/PageHeader';
import ActionMenu from '../../components/ActionMenu';
import Toast from '../../components/Toast';
import { DrawerSection } from '../Contacts/ContactFormDrawer';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';

/* =====================================================================
   Arenametrix — Consents V3  (CRM Marketing)
   Page only — renders inside the existing app shell (no nav/sidebar here).

   Refreshed 2026-10 on the patterns Lists V3 and Contacts now share:
     - page    PageHeader (Secondary + one Primary, no kebab) · no extra
               horizontal inset (AppLayout already pads 32px) · 16px rhythm
     - cards   DS container shell: borderSection · radius 12 · shadowSm;
               titles Title/Medium, captions Label/Medium text/muted
     - KPIs    DS KpiCard Type=Stat (label · value · delta) and Type=Donut
               for the channel split
     - filters shared Select (fixed width → small arrow) for the range; the
               consent picker reuses Select's panel + MenuItem
     - list    the DS Table (toolbar search + bulk Options, two-line cells,
               row ActionMenu, selection) replaces BannerTable
     - drawers ContactFormDrawer's blue section bands, label-above-value
               fields, full-width Select (big arrow), Secondary Cancel
   Local-only, no DS counterpart: the evolution line chart, the sparkline
   and the activity-log timeline.
   ===================================================================== */

// ── Per-consent line colours (CONSENT_COLORS pattern) ──────────────────
// 2026 brand secondary palette + two warm accents — a full spectrum so the
// multi-line chart reads as distinct series (blue appears only once).
const CONSENT_COLORS = {
  'nl-public':   DS.brandViolet,   // #4F32FE
  'nl-vip':      DS.brandMagenta,  // #B93177
  'activites':   DS.brandMintInk,  // #17B08F
  'sms-promo':   DS.brandYellowInk,// #D9A400
  'wa-billet':   DS.coral,         // #EE5A4F
  'analytics':   DS.orange,        // #FE9D55
  'sms-partner': DS.actionPrimary,       // #2575fc (single blue)
};

const CHANNEL_ICON = {
  Email:    Ico.Mail,
  SMS:      Ico.Sms,
  WhatsApp: Ico.Whatsapp,
  Push:     Ico.Bell,
};

const MONTH_LABELS = [
  'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25',
  'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26',
];

// ── Mock data — 7 consents across channels, with the spec's edge cases ──
const CONSENTS = [
  {
    id: 'nl-public', name: 'Newsletter Public', channel: 'Email', optIn: 'double',
    purpose: 'Monthly editorial + ticketing newsletter to the general opted-in public.',
    status: 'active', createdAt: '2022-09-14', createdBy: 'Camille Rousseau',
    contacts: 18420, netTrend: 26, optInRate: 64, optOutRate: 4,
    series: [14210, 14580, 14930, 15270, 15640, 16020, 16380, 16740, 17120, 17480, 17820, 18180, 18420],
    log: [
      { event: 'updated',  date: '2026-04-22 09:14', author: 'Camille Rousseau', note: 'Opt-in wording updated on the site signup form.' },
      { event: 'updated',  date: '2026-02-08 16:40', author: 'Maxence Bourguignon', note: 'Double opt-in enabled for the newsletter.' },
      { event: 'created',  date: '2022-09-14 11:31', author: 'Camille Rousseau', note: 'Consent created.' },
    ],
  },
  {
    id: 'nl-vip', name: 'Newsletter VIP & Loges', channel: 'Email', optIn: 'double',
    purpose: 'Exclusive communications for VIP and box-seat contacts.',
    status: 'active', createdAt: '2023-06-02', createdBy: 'Sophie Lemaire',
    contacts: 1284, netTrend: 15, optInRate: 58, optOutRate: 6,
    series: [1010, 1040, 1065, 1090, 1115, 1140, 1170, 1195, 1220, 1245, 1265, 1278, 1284],
    log: [
      { event: 'updated', date: '2026-01-18 10:02', author: 'Sophie Lemaire', note: 'Audience scope widened to new VIP tier.' },
      { event: 'created', date: '2023-06-02 14:20', author: 'Sophie Lemaire', note: 'Consent created.' },
    ],
  },
  {
    id: 'activites', name: 'Activités & événements partenaires', channel: 'Email', optIn: 'single',
    purpose: 'Partner activities and events promotion.',
    status: 'active', createdAt: '2023-01-10', createdBy: 'Léo Martin',
    contacts: 6890, netTrend: 9, optInRate: 47, optOutRate: 7,
    series: [5300, 5420, 5560, 5700, 5860, 6010, 6180, 6340, 6500, 6650, 6760, 6840, 6890],
    log: [
      { event: 'updated', date: '2025-11-30 12:00', author: 'Léo Martin', note: 'Partner list refreshed for the new season.' },
      { event: 'created', date: '2023-01-10 09:45', author: 'Léo Martin', note: 'Consent created.' },
    ],
  },
  {
    id: 'sms-promo', name: 'SMS Promotions', channel: 'SMS', optIn: 'single',
    purpose: 'Promotional SMS for last-minute offers.',
    status: 'active', createdAt: '2022-11-20', createdBy: 'Camille Rousseau',
    contacts: 9210, netTrend: -8, optInRate: 38, optOutRate: 12,
    series: [10010, 9920, 9830, 9740, 9650, 9560, 9480, 9410, 9350, 9300, 9260, 9230, 9210],
    log: [
      { event: 'updated', date: '2026-03-02 15:30', author: 'Maxence Bourguignon', note: 'Send frequency reduced to limit opt-outs.' },
      { event: 'created', date: '2022-11-20 08:10', author: 'Camille Rousseau', note: 'Consent created.' },
    ],
  },
  {
    id: 'wa-billet', name: 'WhatsApp Billetterie', channel: 'WhatsApp', optIn: 'double',
    purpose: 'Ticketing reminders and updates over WhatsApp.',
    status: 'active', createdAt: '2026-03-05', createdBy: 'Sophie Lemaire',
    contacts: 540, netTrend: 42, optInRate: 71, optOutRate: 3,
    series: [null, null, null, null, null, null, null, null, null, 380, 440, 500, 540],
    log: [
      { event: 'created', date: '2026-03-05 17:22', author: 'Sophie Lemaire', note: 'Consent created (pilot).' },
    ],
  },
  {
    id: 'analytics',
    name: 'Consentement analytics & suivi comportemental multi-canal longue durée',
    channel: 'Push', optIn: 'single',
    purpose: 'Behavioural analytics tracking across channels.',
    status: 'active', createdAt: '2023-09-01', createdBy: 'Léo Martin',
    contacts: 120, netTrend: 0, optInRate: 22, optOutRate: 9,
    series: [118, 119, 120, 119, 121, 120, 120, 121, 119, 120, 120, 121, 120],
    log: [
      { event: 'created', date: '2023-09-01 11:00', author: 'Léo Martin', note: 'Consent created.' },
    ],
  },
  {
    id: 'sms-partner', name: 'Consentement partenaires SMS', channel: 'SMS', optIn: 'single',
    purpose: 'Partner SMS communications (archived programme).',
    status: 'deactivated', createdAt: '2022-08-07', createdBy: 'Camille Rousseau',
    contacts: 3100, netTrend: -3, optInRate: 19, optOutRate: 15,
    series: [3400, 3360, 3320, 3280, 3250, 3220, 3200, 3180, 3160, 3150, 3140, 3120, 3100],
    log: [
      { event: 'deactivated', date: '2026-05-12 09:00', author: 'Maxence Bourguignon', note: 'Programme archived — partner contract ended.' },
      { event: 'reactivated', date: '2025-02-04 10:30', author: 'Camille Rousseau', note: 'Reactivated for a one-off partner campaign.' },
      { event: 'deactivated', date: '2024-10-01 14:15', author: 'Camille Rousseau', note: 'Paused after season close.' },
      { event: 'created', date: '2022-08-07 16:05', author: 'Camille Rousseau', note: 'Consent created.' },
    ],
  },
];

const DATE_RANGES = [
  { id: '3m', label: '3 months', months: 3 },
  { id: '6m', label: '6 months', months: 6 },
  { id: '12m', label: '12 months', months: 12 },
  { id: 'ytd', label: 'Since 01/01', months: 5 },
];

const MAX_SERIES = 6;

// ── Helpers ────────────────────────────────────────────────────────────
const fmtNum = (n) => n == null ? '—' : n.toLocaleString('en-US');

function niceCeil(v) {
  if (v <= 0) return 100;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const base = v / pow;
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return nice * pow;
}

function trendMeta(t) {
  if (t > 0) return { Icon: Ico.TrendUp, color: DS.feedbackSuccess, label: `+${t}%` };
  if (t < 0) return { Icon: Ico.TrendDown, color: DS.feedbackError, label: `${t}%` };
  return { Icon: Ico.TrendFlat, color: DS.textSecondary, label: `${t}%` };
}

const fmtDate = (s) => (s ? new Date(`${s.slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB') : '—');

/* DS container shell — same as PageHeader, Table and the Lists record cards. */
const shell = {
  background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`,
  borderRadius: DS.radiusXl, boxShadow: DS.shadowSm, boxSizing: 'border-box',
};

function SectionCard({ title, sub, right, children, style }) {
  return (
    <section style={{ ...shell, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TY.titleMd, color: DS.textStrong, fontFamily: DS.ff }}>{title}</div>
          {sub && <div style={{ ...TY.labelMd, color: DS.textMuted, fontFamily: DS.ff, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// =====================================================================
//  Root
// =====================================================================
export default function ConsentsV3() {
  const [viewState, setViewState] = React.useState('ready'); // ready | empty | error | loading
  const [rangeId, setRangeId] = React.useState('12m');
  const [selection, setSelection] = React.useState(['nl-public', 'sms-promo', 'activites', 'nl-vip']);
  const [query, setQuery] = React.useState('');
  const [checked, setChecked] = React.useState([]);
  const [openConsent, setOpenConsent] = React.useState(null); // consent object for detail drawer
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingConsent, setEditingConsent] = React.useState(null); // consent being edited, or null = create
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const range = DATE_RANGES.find((r) => r.id === rangeId) ?? DATE_RANGES[2];
  const active = CONSENTS.filter((c) => c.status === 'active');

  // Headline KPIs (active only)
  const activeOptIns = active.reduce((s, c) => s + c.contacts, 0);
  const deltaVsRef = 1240; // new opt-ins since reference date (mock)
  const activeConsents = active.length;
  const optInRate = Math.round(active.reduce((s, c) => s + c.optInRate, 0) / Math.max(1, active.length));

  const channelTotals = Object.keys(CHANNEL_COLORS)
    .map((ch) => ({ ch, value: active.filter((c) => c.channel === ch).reduce((s, c) => s + c.contacts, 0) }))
    .filter((x) => x.value > 0);

  const filtered = CONSENTS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const loading = viewState === 'loading';

  function toggleConsent(id) {
    setSelection((sel) => sel.includes(id) ? sel.filter((x) => x !== id) : (sel.length >= MAX_SERIES ? sel : [...sel, id]));
  }
  const openCreate = () => { setEditingConsent(null); setCreateOpen(true); };
  const openEdit = (c) => { setOpenConsent(null); setEditingConsent(c); setCreateOpen(true); };

  const toolbar = {
    search: query,
    onSearchChange: setQuery,
    searchPlaceholder: 'Search a consent…',
    // Bulk actions on the ticked consents — the same "Options" menu as Lists.
    options: (
      <ActionMenu
        label={checked.length ? `Options (${checked.length})` : 'Options'}
        size="Md"
        align="left"
        width={240}
        disabled={checked.length === 0}
        disabledTooltip="Select at least one consent to use these options"
        items={[
          { label: 'Compare in the chart', icon: <Ico.TrendUp s={16} c={DS.textSecondary} />,
            onClick: () => { setSelection(checked.slice(0, MAX_SERIES)); showToast(`Chart now compares ${Math.min(checked.length, MAX_SERIES)} consent${checked.length === 1 ? '' : 's'}.`); } },
          { label: 'Export', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => showToast('Export generated (demo).') },
        ]}
      />
    ),
  };

  return (
    <div style={{ minHeight: '100%', fontFamily: DS.ff, paddingBottom: 48 }}>
      {/* Prototype state switcher — shared floating control */}
      <StatePreview groups={[{
        label: 'State', value: viewState, onChange: setViewState,
        options: ['ready', 'loading', 'empty', 'error'],
      }]} />

      {/* ── Page header — Secondary + one Primary, as on Lists ─────────── */}
      <PageHeader
        icon={<Ico.Scan s={20} c={DS.actionPrimary} />}
        title="Consents"
        description="Track and manage opt-in consents across your channels"
        actions={(
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Btn type="Tertiary" size="Medium" iconLeft={<Ico.AIicon />} onClick={() => showToast('Ask AI (demo).')}>Ask AI</Btn>
            <Btn type="Secondary" size="Medium" iconLeft={<Ico.Download s={18} />} onClick={() => showToast('Export generated (demo).')}>Export</Btn>
            <Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a consent</Btn>
          </div>
        )}
      />

      {viewState === 'error' && (
        <ErrorState title="Couldn’t load consents." sub="Something went wrong on our side."
                    retryLabel="Retry" onRetry={() => setViewState('ready')} />
      )}
      {viewState === 'empty' && (
        <EmptyState icon={<Ico.Scan s={24} c={DS.textSecondary} />} title="No consents yet"
                    sub="Create your first consent to start tracking opt-ins over time."
                    cta={<Btn type="Primary" size="Medium" iconLeft={<Ico.Plus s={18} />} onClick={openCreate}>Create a consent</Btn>} />
      )}

      {(viewState === 'ready' || loading) && (
        /* No horizontal inset: AppLayout already pads the page by 32px. */
        <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI strip — 3 columns; the dataviz row below aligns to them */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
            <KpiCard loading={loading} label="Active opt-ins" value={fmtNum(activeOptIns)}
                     delta={`+${fmtNum(deltaVsRef)} since Jan 1`} trend="up" />
            <KpiCard loading={loading} label="Active consents" value={String(activeConsents)}
                     delta="Excludes deactivated" trend="flat" />
            <KpiCard loading={loading} label="Opt-in rate" value={`${optInRate}%`}
                     delta="Average across active consents" trend="flat" />
          </div>

          {/* Dataviz row: evolution spans 2 columns, channel split 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
            <SectionCard
              style={{ gridColumn: 'span 2' }}
              title="Consents evolution"
              sub="Monthly opted-in contacts, compared over time"
              right={(
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ConsentsFilter consents={CONSENTS} selection={selection} onToggle={toggleConsent} />
                  <Select width={160} value={rangeId} onChange={setRangeId}
                          options={DATE_RANGES.map((r) => ({ value: r.id, label: r.label }))} />
                </div>
              )}
            >
              {loading
                ? <Skeleton width="100%" height={300} radius={8} />
                : <EvolutionChart consents={CONSENTS} selection={selection} months={range.months} labels={MONTH_LABELS} />}
            </SectionCard>

            {/* DS KPI Card Type=Donut — the breakdown into categories. */}
            <KpiCard
              type="donut"
              loading={loading}
              label="Channel breakdown"
              total={fmtNum(activeOptIns)}
              totalLabel="opt-ins"
              segments={channelTotals.map(({ ch, value }) => ({
                label: ch, value, color: CHANNEL_COLORS[ch],
                display: `${fmtNum(value)} · ${Math.round((value / Math.max(1, activeOptIns)) * 100)}%`,
              }))}
              note="Share of active opt-ins per channel"
            />
          </div>

          {/* Consents list — one DS Table (toolbar · rows · pagination) */}
          <Table
            columns={CONSENT_COLUMNS}
            rows={loading ? SKELETON_ROWS : filtered}
            rowId={(c) => c.id}
            cell={loading ? skeletonCell : consentCell}
            onRowClick={loading ? undefined : (c) => setOpenConsent(c)}
            rowStyle={(c) => (c.status === 'deactivated' ? { opacity: 0.6 } : undefined)}
            selectable={!loading}
            selected={checked}
            onSelectedChange={setChecked}
            actions={loading ? undefined : (c) => (
              <ActionMenu items={[
                { label: 'View details', icon: <Ico.Eye s={16} c={DS.actionPrimary} />, onClick: () => setOpenConsent(c) },
                { label: 'Edit', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => openEdit(c) },
                { label: 'Export this consent', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => showToast(`“${c.name}” exported (demo).`) },
              ]} />
            )}
            toolbar={toolbar}
            page={0} pages={1} setPage={() => {}} total={loading ? null : filtered.length} pageSize={filtered.length || 1}
            emptyState={<EmptyState icon={<Ico.Search s={24} />} title="No results" sub={`No consent matches “${query}”.`} />}
          />
        </div>
      )}

      {/* ── Detail drawer ───────────────────────────────────────────── */}
      <Modal open={!!openConsent} onClose={() => setOpenConsent(null)}
             variant="panel" width={540} title={openConsent?.name || ''}
             footer={openConsent ? (
               <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                 <Btn type="Secondary" size="Medium" iconLeft={<Ico.EditSquare s={16} />} onClick={() => openEdit(openConsent)}>Edit</Btn>
                 <Btn type="Primary" size="Medium" onClick={() => setOpenConsent(null)}>Close</Btn>
               </div>
             ) : null}>
        {openConsent && <DetailDrawer consent={openConsent} onExport={() => showToast(`“${openConsent.name}” exported (demo).`)} />}
      </Modal>

      {/* ── Create / edit drawer (+ unsaved guard) ──────────────────── */}
      <CreateDrawer open={createOpen} editing={editingConsent}
                    onSaved={(name, editing) => showToast(editing ? `“${name}” updated.` : `“${name}” created.`)}
                    onRequestClose={() => { setCreateOpen(false); setEditingConsent(null); }} />
      <Toast toast={toast} />
    </div>
  );
}

// =====================================================================
//  Consents quick-filter — Select's trigger box + panel + MenuItem, with
//  the series colour dot and the 6-series cap the chart needs (MultiSelect
//  has neither, so this stays a thin local composition).
// =====================================================================
function ConsentsFilter({ consents, selection, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const trigRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const atCap = selection.length >= MAX_SERIES;

  React.useEffect(() => {
    if (!open) return undefined;
    const f = (e) => {
      if (trigRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, [open]);

  React.useEffect(() => {
    if (!open || !trigRef.current) return;
    const r = trigRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 4, left: r.right + window.scrollX - 300 });
  }, [open]);

  return (
    <>
      <button
        ref={trigRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
          boxSizing: 'border-box', borderRadius: DS.radiusLg, background: DS.surfaceCanvas,
          border: `1px solid ${open ? DS.borderFocus : DS.borderField}`, cursor: 'pointer',
          ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'nowrap',
          transition: `border-color ${DS.durFast} ${DS.ease}`,
        }}
      >
        Consents
        <Badge tone="primary">{selection.length}/{MAX_SERIES}</Badge>
        {open ? <Ico.ArrowUpSmall s={16} c={DS.textSecondary} /> : <Ico.ArrowDownSmall s={16} c={DS.textSecondary} />}
      </button>
      {open && pos && createPortal(
        <div ref={panelRef} style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}>
          <div style={{ ...panelShell, width: 300, maxHeight: PANEL_MAX_H }}>
            <div style={{ padding: '8px 12px', ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>
              Pick up to {MAX_SERIES} consents to compare.
            </div>
            {consents.map((c) => {
              const on = selection.includes(c.id);
              const lock = !on && atCap;
              return (
                <div key={c.id} title={lock ? `Remove one to add another (max ${MAX_SERIES})` : undefined}
                     style={{ opacity: lock ? 0.45 : 1, pointerEvents: lock ? 'none' : 'auto' }}>
                  <MenuItem
                    selected={on}
                    onClick={() => onToggle(c.id)}
                    label={(
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[c.id], flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      </span>
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// =====================================================================
//  Evolution chart  (lighter restyle of the ConsentsPage line chart)
// =====================================================================
function EvolutionChart({ consents, selection, months, labels }) {
  // Responsive width (measured) + fixed pixel height → consistent on any screen,
  // no aspect-ratio collapse on narrower laptop columns.
  const wrapRef = React.useRef(null);
  const [W, setW] = React.useState(1080);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setW(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 300;
  const PAD_L = 60, PAD_R = 24, PAD_T = 20, PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const span = Math.min(months + 1, labels.length);
  const shownLabels = labels.slice(-span);
  const selected = consents.filter((c) => selection.includes(c.id))
    .map((c) => ({ ...c, points: c.series.slice(-span) }));
  const allValues = selected.flatMap((s) => s.points).filter((v) => v != null);
  const yMax = niceCeil(allValues.length ? Math.max(...allValues) : 100);
  const xStep = innerW / Math.max(1, shownLabels.length - 1);
  const xAt = (i) => PAD_L + i * xStep;
  const yAt = (v) => PAD_T + innerH - (v / yMax) * innerH;
  const ticks = Array.from({ length: 4 }, (_, i) => Math.round((yMax / 3) * i));
  const xEvery = Math.max(1, Math.ceil(shownLabels.length / 9));

  const [hoverIdx, setHoverIdx] = React.useState(null);
  const svgRef = React.useRef(null);
  function onMove(e) {
    if (!svgRef.current || !selected.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (x < PAD_L - 10 || x > W - PAD_R + 10) { setHoverIdx(null); return; }
    setHoverIdx(Math.max(0, Math.min(shownLabels.length - 1, Math.round((x - PAD_L) / xStep))));
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" height={H}
           style={{ display: 'block', overflow: 'visible' }}
           onMouseMove={onMove} onMouseLeave={() => setHoverIdx(null)}>
        {/* light gridlines — fewer, softer */}
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke={DS.borderDefault}
                    strokeWidth="1" strokeDasharray={i === 0 ? '0' : '2 5'} opacity={i === 0 ? 0.8 : 0.5} />
              <text x={PAD_L - 12} y={y + 4} textAnchor="end" fontSize="12"
                    fill={DS.textSecondary} fontFamily="Inter, sans-serif">{fmtNum(t)}</text>
            </g>
          );
        })}
        {shownLabels.map((l, i) => {
          if (i % xEvery !== 0 && i !== shownLabels.length - 1) return null;
          return (
            <text key={i} x={xAt(i)} y={H - PAD_B + 22} textAnchor="middle" fontSize="12"
                  fill={DS.textSecondary} fontFamily="Inter, sans-serif">{l}</text>
          );
        })}
        {/* hover guide line */}
        {hoverIdx != null && selected.length > 0 && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B}
                stroke={DS.borderDefault} strokeWidth="1" strokeDasharray="3 3" />
        )}
        {selected.map((s) => {
          const color = CONSENT_COLORS[s.id];
          const pts = s.points.map((v, i) => v != null ? { x: xAt(i), y: yAt(v) } : null).filter(Boolean);
          if (!pts.length) return null;
          let d = `M ${pts[0].x} ${pts[0].y}`;
          for (let i = 1; i < pts.length; i++) {
            const cx = (pts[i - 1].x + pts[i].x) / 2;
            d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
          }
          const last = pts[pts.length - 1];
          const hov = hoverIdx != null && s.points[hoverIdx] != null;
          return (
            <g key={s.id}>
              <path d={d} fill="none" stroke={color} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
              {/* end dot */}
              <circle cx={last.x} cy={last.y} r="3.5" fill={DS.surfaceCanvas} stroke={color} strokeWidth="2" />
              {/* hovered point */}
              {hov && (
                <circle cx={xAt(hoverIdx)} cy={yAt(s.points[hoverIdx])} r="6"
                        fill={DS.surfaceCanvas} stroke={color} strokeWidth="2.5" />
              )}
            </g>
          );
        })}
        {selected.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="15"
                fill={DS.textSecondary} fontFamily="Inter, sans-serif">
            Select a consent to see its evolution
          </text>
        )}
      </svg>

      {/* hover tooltip / modal */}
      {hoverIdx != null && selected.length > 0 && (
        <div style={{ position: 'absolute', top: 12,
                      left: `calc(${(xAt(hoverIdx) / W) * 100}% + ${xAt(hoverIdx) > W / 2 ? '-240px' : '16px'})`,
                      background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`,
                      borderRadius: DS.radiusLg, boxShadow: DS.shadowMd,
                      padding: 12, minWidth: 224, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ ...TY.labelMd, color: DS.textMuted, marginBottom: 8,
                        textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {shownLabels[hoverIdx]}
          </div>
          {selected.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[s.id], flexShrink: 0 }} />
              <span style={{ flex: 1, ...TY.bodySm, color: DS.textDefault, overflow: 'hidden',
                             textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ ...TY.bodyMdBold, color: DS.textStrong }}>{fmtNum(s.points[hoverIdx])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Channel palette — one brand hue per channel ─────────────────────
// CHANNEL_COLORS: pale brand hues for large solid fills (donut arcs, legend swatches).
const CHANNEL_COLORS = { Email: DS.brandViolet, SMS: DS.brandMagenta, WhatsApp: DS.brandMint, Push: DS.brandYellow };
// CHANNEL_INK: darkened variants for small 14px icons that need contrast on white.
const CHANNEL_INK = { Email: DS.brandViolet, SMS: DS.brandMagenta, WhatsApp: DS.brandMintInk, Push: DS.brandYellowInk };


// =====================================================================
//  Sparkline  (reused pattern from ConsentsPage.jsx)
// =====================================================================
function Sparkline({ data, color }) {
  const W = 120, H = 36;
  const nonNull = data.filter((v) => v != null);
  if (!nonNull.length || nonNull.every((v) => v === 0)) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1="0" x2={W} y1={H - 2} y2={H - 2} stroke={DS.borderDefault} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  const min = Math.min(...nonNull), max = Math.max(...nonNull);
  const rng = Math.max(1, max - min);
  const step = data.length > 1 ? W / (data.length - 1) : W;
  let d = '';
  data.forEach((v, i) => {
    if (v == null) return;
    const x = i * step;
    const y = H - 2 - ((v - min) / rng) * (H - 6);
    d += (d ? ' L' : 'M') + ` ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const lastX = (data.length - 1) * step;
  const areaD = d ? `${d} L ${lastX} ${H} L 0 ${H} Z` : '';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <path d={areaD} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// =====================================================================
//  Consents list — shared BannerTable (same table component as Lists)

// =====================================================================
//  Consents list — DS Table columns + cells
// =====================================================================
const CONSENT_COLUMNS = [
  // Name over purpose, in the DS two-line cell. Capped like the Lists name
  // column so it doesn't swallow every spare pixel.
  { key: 'name',     label: 'Consent',     type: 'titleDescription', width: 340 },
  { key: 'channel',  label: 'Channel' },
  { key: 'optIn',    label: 'Opt-in' },
  { key: 'status',   label: 'Status' },
  { key: 'created',  label: 'Creation date' },
  // Count over its trend, right-aligned — same cell as the Lists contacts.
  { key: 'contacts', label: 'Contacts',    type: 'titleDescription', width: 150, align: 'right' },
  { key: 'trend',    label: '12-mo trend', width: 140 },
];

const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

function consentCell(c, key) {
  const ChIcon = CHANNEL_ICON[c.channel] || Ico.Mail;
  switch (key) {
    case 'name':
      return { title: c.name, description: c.purpose };
    case 'channel':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...clip }}>
          <ChIcon s={16} c={CHANNEL_INK[c.channel] || DS.textSecondary} />{c.channel}
        </span>
      );
    case 'optIn':
      return <Badge tone="neutral">{c.optIn === 'double' ? 'Double' : 'Single'}</Badge>;
    case 'status':
      return c.status === 'deactivated'
        ? <StatusBadge status="inactive">Deactivated</StatusBadge>
        : <StatusBadge status="success">Active</StatusBadge>;
    case 'created':
      return fmtDate(c.createdAt);
    case 'contacts': {
      const t = trendMeta(c.netTrend);
      return {
        title: fmtNum(c.contacts),
        description: <span style={{ color: t.color }}>{t.label} over 12 months</span>,
      };
    }
    case 'trend':
      return <div style={{ width: '100%' }}><Sparkline data={c.series} color={CONSENT_COLORS[c.id] || DS.actionPrimary} /></div>;
    default:
      return null;
  }
}

/* Loading keeps the table shell — toolbar, headers stay put while rows fill in. */
const SKELETON_ROWS = [0, 1, 2, 3, 4].map((i) => ({ id: `skel-${i}` }));
const skeletonCell = (_row, key) => {
  if (key === 'name')     return { title: <Skeleton width={180} height={12} />, description: <Skeleton width={240} height={9} /> };
  if (key === 'contacts') return { title: <Skeleton width={54} height={12} />, description: <Skeleton width={90} height={9} /> };
  return <Skeleton width={80} height={12} />;
};

// =====================================================================
//  Detail drawer body
// =====================================================================
const EVENT_META = {
  created:     { color: DS.feedbackSuccess, label: 'Created' },
  updated:     { color: DS.actionPrimary,   label: 'Updated' },
  deactivated: { color: DS.textSecondary,   label: 'Deactivated' },
  reactivated: { color: DS.feedbackWarning, label: 'Reactivated' },
};

/* Label above value — the one field format of the prototypes. */
function InfoItem({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.bodyMd, color: DS.textStrong, fontFamily: DS.ff }}>{children}</span>
    </div>
  );
}

function DetailDrawer({ consent, onExport }) {
  const t = trendMeta(consent.netTrend);
  const ChIcon = CHANNEL_ICON[consent.channel] || Ico.Mail;
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DrawerSection title="Information" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <InfoItem label="Channel"><ChIcon s={16} c={CHANNEL_INK[consent.channel] || DS.textSecondary} />{consent.channel}</InfoItem>
        <InfoItem label="Opt-in type">{consent.optIn === 'double' ? 'Double opt-in' : 'Single opt-in'}</InfoItem>
        <InfoItem label="Status">
          {consent.status === 'deactivated'
            ? <StatusBadge status="inactive">Deactivated</StatusBadge>
            : <StatusBadge status="success">Active</StatusBadge>}
        </InfoItem>
        <InfoItem label="Created">{fmtDate(consent.createdAt)} · {consent.createdBy}</InfoItem>
      </div>
      <InfoItem label="Purpose">{consent.purpose}</InfoItem>

      <DrawerSection title="Performance" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <InfoItem label="Contacts"><span style={{ ...TY.titleMd }}>{fmtNum(consent.contacts)}</span></InfoItem>
        <InfoItem label="Net opt-in trend"><span style={{ ...TY.titleMd, color: t.color }}>{t.label}</span></InfoItem>
        <InfoItem label="Opt-in rate"><span style={{ ...TY.titleMd }}>{consent.optInRate}%</span></InfoItem>
        <InfoItem label="Opt-out rate"><span style={{ ...TY.titleMd }}>{consent.optOutRate}%</span></InfoItem>
      </div>
      <div style={{ ...shell, boxShadow: 'none', padding: 12 }}>
        <EvolutionChart consents={[consent]} selection={[consent.id]} months={12} labels={MONTH_LABELS} />
      </div>

      <DrawerSection title="Activity log" />
      {consent.log.length === 0 ? (
        <span style={{ ...TY.bodyMd, color: DS.textMuted, fontFamily: DS.ff }}>No activity recorded yet.</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {consent.log.map((ev, i) => {
            const m = EVENT_META[ev.event] || EVENT_META.updated;
            const last = i === consent.log.length - 1;
            return (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, marginTop: 5 }} />
                  {!last && <span style={{ flex: 1, width: 2, background: DS.borderSection, margin: '2px 0' }} />}
                </div>
                <div style={{ paddingBottom: last ? 0 : 16, display: 'flex', flexDirection: 'column', gap: 2, fontFamily: DS.ff }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ ...TY.bodyMdBold, color: m.color }}>{m.label}</span>
                    <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textMuted }}>{ev.date}</span>
                  </div>
                  <span style={{ ...TY.bodySm, color: DS.textDefault }}>{ev.note}</span>
                  <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Ico.User s={12} c={DS.textSecondary} />{ev.author}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex' }}>
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Download s={16} />} onClick={onExport}>
          Export this consent (CSV / PDF)
        </Btn>
      </div>
    </div>
  );
}

// =====================================================================
//  Create / edit drawer (+ unsaved-changes guard)
//  Same build as ContactFormDrawer: blue section bands, label above the
//  field, full-width Select, Secondary Cancel + one Primary.
// =====================================================================
const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push'];

function CreateDrawer({ open, editing, onRequestClose, onSaved }) {
  const [name, setName] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [channel, setChannel] = React.useState('Email');
  const [optIn, setOptIn] = React.useState('double');
  const [confirm, setConfirm] = React.useState(false);
  const [wasOpen, setWasOpen] = React.useState(false);

  // Render-time reset when the drawer opens — prefill from `editing` if present.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(editing?.name || '');
      setPurpose(editing?.purpose || '');
      setChannel(editing?.channel || 'Email');
      setOptIn(editing?.optIn || 'double');
      setConfirm(false);
    }
  }

  const dirty = editing
    ? (name !== editing.name || purpose !== (editing.purpose || '') || channel !== editing.channel || optIn !== editing.optIn)
    : (name.trim() || purpose.trim() || channel !== 'Email' || optIn !== 'double');

  function attemptClose() { if (dirty) setConfirm(true); else onRequestClose(); }
  function discard() { setConfirm(false); onRequestClose(); }
  function save() { onSaved?.(name.trim(), !!editing); onRequestClose(); }

  return (
    <>
      <Modal open={open} onClose={attemptClose} variant="panel" width={460}
             title={editing ? 'Edit consent' : 'Create a consent'}
             footer={
               <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
                 <Btn type="Secondary" size="Medium" onClick={attemptClose}>Cancel</Btn>
                 <Btn type="Primary" size="Medium" disabled={!name.trim()} onClick={save}>{editing ? 'Save' : 'Create consent'}</Btn>
               </div>
             }>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DrawerSection title="Consent information" />
          <Field label="Consent name" required value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Newsletter Public" />
          <TextArea label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    placeholder="What this consent is used for…" />

          <DrawerSection title="Collection" />
          <Select label="Channel" value={channel} onChange={setChannel}
                  options={CHANNELS.map((ch) => ({ value: ch, label: ch }))} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>Opt-in type</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <Radio name="optin" value="single" checked={optIn === 'single'}
                     onChange={() => setOptIn('single')} label="Single opt-in" />
              <Radio name="optin" value="double" checked={optIn === 'double'}
                     onChange={() => setOptIn('double')} label="Double opt-in" />
            </div>
            <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textMuted, fontFamily: DS.ff }}>
              Double opt-in asks the contact to confirm by email before the consent counts.
            </span>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirm} title={editing ? 'Discard changes?' : 'Discard this consent?'}
                     body={editing ? 'You have unsaved changes. If you leave now, they won’t be saved.' : 'You have unsaved changes. If you leave now, this consent won’t be created.'}
                     confirmLabel="Discard" cancelLabel="Keep editing" danger confirmIcon={null}
                     onConfirm={discard} onCancel={() => setConfirm(false)} />
    </>
  );
}
