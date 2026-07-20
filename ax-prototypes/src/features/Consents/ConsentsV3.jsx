import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Btn from '../../components/Btn';
import IconBtn from '../../components/Iconbtn';
import { SearchField, Field, TextArea } from '../../components/Field';
import { Radio } from '../../components/Controls';
import { Tag, StatusBadge } from '../../components/Tag';
import Modal from '../../components/Modal';
import StatePreview from '../../components/StatePreview';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import BannerTable, { BannerIdentity } from '../../components/BannerTable';
import PageHeader from '../../components/PageHeader';
import ActionMenu from '../../components/ActionMenu';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';

/* =====================================================================
   Arenametrix — Consents V3  (CRM Marketing)
   Page only — renders inside the existing app shell (no nav/sidebar here).
   Tokens: AX Design System — import { DS, TY } + Ico (never redefined inline).
   Reuses the lighter-restyled multi-line chart + sparkline patterns from
   ConsentsPage.jsx. BUILD-NEW: KPI cards, time toggle, channel donut,
   activity-log timeline, edge-state skeletons.
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
  'sms-partner': DS.blue500,       // #2575fc (single blue)
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

// =====================================================================
//  Root
// =====================================================================
export default function ConsentsV3() {
  const [viewState, setViewState] = React.useState('ready'); // ready | empty | error | loading
  const [range, setRange] = React.useState(DATE_RANGES[2]);
  const [selection, setSelection] = React.useState(['nl-public', 'sms-promo', 'activites', 'nl-vip']);
  const [query, setQuery] = React.useState('');
  const [openConsent, setOpenConsent] = React.useState(null); // consent object for detail drawer
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editingConsent, setEditingConsent] = React.useState(null); // consent being edited, or null = create

  const active = CONSENTS.filter((c) => c.status === 'active');

  // Headline KPIs (active only)
  const activeOptIns = active.reduce((s, c) => s + c.contacts, 0);
  const deltaVsRef = 1240; // new opt-ins since reference date (mock)
  const activeConsents = active.length;
  const optInRate = Math.round(active.reduce((s, c) => s + c.optInRate, 0) / Math.max(1, active.length));

  const filtered = CONSENTS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  function toggleConsent(id) {
    setSelection((sel) => sel.includes(id) ? sel.filter((x) => x !== id) : (sel.length >= MAX_SERIES ? sel : [...sel, id]));
  }

  return (
    <div style={{ background: DS.bgPage, minHeight: '100%', fontFamily: DS.ff, paddingBottom: 40 }}>
      {/* Prototype state switcher — shared floating control */}
      <StatePreview groups={[{
        label: 'State', value: viewState, onChange: setViewState,
        options: ['ready', 'loading', 'empty', 'error'],
      }]} />

      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        icon={<Ico.Scan s={20} c={DS.actionPrimary} />}
        title="Consents"
        description="Track and manage opt-in consents across your channels"
        actions={<>
          <Btn type="Tertiary" size="Medium" iconLeft={<Ico.AIicon />} onClick={() => {}}>Ask AI</Btn>
          <Btn type="Primary" size="Medium" iconLeft={<Ico.Plus />} onClick={() => { setEditingConsent(null); setCreateOpen(true); }}>Create a consent</Btn>
          <ActionMenu size="Medium" align="right" icon={<Ico.Dots s={18} c={DS.actionPrimary} />} items={[
            { label: 'Export', icon: <Ico.Export s={16} c={DS.textSecondary} />, onClick: () => {} },
          ]} />
        </>}
      />

      {viewState === 'error' && (
        <ErrorState title="Couldn’t load consents." sub="Something went wrong on our side."
                    retryLabel="Retry" onRetry={() => setViewState('ready')} />
      )}
      {viewState === 'empty' && (
        <EmptyState icon={<Ico.Scan s={24} c={DS.textSecondary} />} title="No consents yet"
                    sub="Create your first consent to start tracking opt-ins over time."
                    cta={<Btn type="Primary" size="Medium" iconLeft={<Ico.Plus />} onClick={() => setCreateOpen(true)}>Create a consent</Btn>} />
      )}
      {viewState === 'loading' && <OverviewSkeleton />}

      {viewState === 'ready' && (
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* KPI strip — 3-column grid; the charts below align to the same columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
            <KpiCard title="Active opt-ins" value={fmtNum(activeOptIns)}
                     sub={`+${fmtNum(deltaVsRef)} since Jan 1`} subColor={DS.feedbackSuccess} />
            <KpiCard title="Active consents" value={String(activeConsents)} sub="excludes deactivated" />
            <KpiCard title="Opt-in rate" value={`${optInRate}%`} sub="avg across active consents" />
          </div>

          {/* Dataviz row: evolution spans 2 KPI columns, channel breakdown spans 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
            <section style={{ gridColumn: 'span 2', minWidth: 0, background: DS.bgCard,
                              border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ ...TY.h4, color: DS.textDefault }}>Consents evolution</div>
                  <div style={{ ...TY.b3, color: DS.textSecondary, marginTop: 2 }}>
                    Monthly opted-in contacts, compared over time.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ConsentsFilter consents={CONSENTS} selection={selection} onToggle={toggleConsent} />
                  <RangeDropdown value={range} onChange={setRange} />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <EvolutionChart consents={CONSENTS} selection={selection}
                                months={range.months} labels={MONTH_LABELS} />
              </div>
            </section>

            <section style={{ gridColumn: 'span 1', minWidth: 0, background: DS.bgCard,
                              border: `1px solid ${DS.borderDefault}`, borderRadius: 10, padding: 20,
                              display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...TY.h4, color: DS.textDefault }}>Channel breakdown</div>
              <div style={{ ...TY.b3, color: DS.textSecondary, marginTop: 2 }}>
                Share of active opt-ins per channel.
              </div>
              <ChannelDonut consents={active} />
            </section>
          </div>

          {/* List of consents */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ ...TY.h4, color: DS.textDefault }}>
                Consents list <span style={{ ...TY.b3, color: DS.textSecondary }}>{filtered.length} consents</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SearchField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a consent…" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ ...TY.b2, color: DS.textSecondary, padding: '24px 0', textAlign: 'left' }}>
                No consent matches “{query}”.
              </div>
            ) : (
              <BannerTable
                columns={CONSENT_COLUMNS}
                rows={filtered}
                rowId={(c) => c.id}
                onRowClick={(c) => setOpenConsent(c)}
                dim={(c) => c.status === 'deactivated'}
                cell={consentCell}
                actions={(c) => (
                  <ActionMenu items={[
                    { label: 'View details', icon: <Ico.Eye s={16} c={DS.actionPrimary} />, onClick: () => setOpenConsent(c) },
                    { label: 'Export this consent', icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => {} },
                  ]} />
                )}
              />
            )}
          </section>
        </div>
      )}

      {/* ── Detail drawer ───────────────────────────────────────────── */}
      <Modal open={!!openConsent} onClose={() => setOpenConsent(null)}
             variant="panel" width={540} title={openConsent?.name || ''}
             footer={openConsent ? (
               <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                 <Btn type="Secondary" size="Medium" iconLeft={<Ico.Edit />}
                      onClick={() => { const c = openConsent; setOpenConsent(null); setEditingConsent(c); setCreateOpen(true); }}>Edit</Btn>
                 <Btn type="Primary" size="Medium" onClick={() => setOpenConsent(null)}>Close</Btn>
               </div>
             ) : null}>
        {openConsent && <DetailDrawer consent={openConsent} />}
      </Modal>

      {/* ── Create / edit drawer (+ unsaved guard) ──────────────────── */}
      <CreateDrawer open={createOpen} editing={editingConsent}
                    onRequestClose={() => { setCreateOpen(false); setEditingConsent(null); }} />
    </div>
  );
}

// =====================================================================
//  Popover  (BUILD-NEW — outside-click dropdown shell)
// =====================================================================
function Popover({ trigger, children, width = 280, align = 'right' }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div style={{ position: 'absolute', top: 44, [align]: 0, zIndex: 20, width,
                      background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', padding: 6,
                      maxHeight: 300, overflowY: 'auto' }}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function DropdownTrigger({ open, onClick, icon, children }) {
  return (
    <button type="button" onClick={onClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40,
                     padding: '0 12px', background: DS.bgCard, ...TY.b2, fontFamily: DS.ff,
                     color: DS.textDefault, cursor: 'pointer', whiteSpace: 'nowrap',
                     border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`, borderRadius: 6 }}>
      {icon}
      {children}
      <span style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
        <Ico.ChevDown s={16} c={DS.textSecondary} />
      </span>
    </button>
  );
}

// =====================================================================
//  Consents quick-filter  (BUILD-NEW — compact multi-select)
// =====================================================================
function ConsentsFilter({ consents, selection, onToggle }) {
  const atCap = selection.length >= MAX_SERIES;
  return (
    <Popover width={300} align="left" trigger={(open, toggle) => (
      <DropdownTrigger open={open} onClick={toggle}
                       icon={<Ico.List s={16} c={DS.actionPrimary} />}>
        Consents
        <span style={{ ...TY.b3, fontWeight: TY.weightSemiBold, color: DS.actionPrimary,
                       background: DS.blue100, borderRadius: 10, padding: '1px 7px' }}>
          {selection.length}/{MAX_SERIES}
        </span>
      </DropdownTrigger>
    )}>
      {() => (
        <>
          <div style={{ ...TY.b3, color: DS.textSecondary, padding: '6px 10px 8px' }}>
            Pick up to {MAX_SERIES} consents to compare.
          </div>
          {consents.map((c) => {
            const on = selection.includes(c.id);
            const lock = !on && atCap;
            return (
              <div key={c.id} role="button" aria-disabled={lock}
                   title={lock ? `Remove one to add another (max ${MAX_SERIES})` : undefined}
                   onClick={() => !lock && onToggle(c.id)}
                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                            borderRadius: 6, cursor: lock ? 'not-allowed' : 'pointer',
                            opacity: lock ? 0.45 : 1, ...TY.b2, color: DS.textDefault }}
                   onMouseEnter={(e) => { if (!lock) e.currentTarget.style.background = DS.actionSecondaryHover; }}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ width: 10, height: 10, borderRadius: '50%',
                               background: CONSENT_COLORS[c.id], flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.name}
                </span>
                {on && <Ico.Check s={16} c={DS.actionPrimary} />}
              </div>
            );
          })}
        </>
      )}
    </Popover>
  );
}

// =====================================================================
//  Date-range dropdown  (BUILD-NEW — single dropdown)
// =====================================================================
function RangeDropdown({ value, onChange }) {
  return (
    <Popover width={180} align="right" trigger={(open, toggle) => (
      <DropdownTrigger open={open} onClick={toggle}
                       icon={<Ico.Calendar s={16} c={DS.actionPrimary} />}>
        {value.label}
      </DropdownTrigger>
    )}>
      {(close) => DATE_RANGES.map((r) => {
        const active = r.id === value.id;
        return (
          <div key={r.id} role="button" onClick={() => { onChange(r); close(); }}
               style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 10px', borderRadius: 6, cursor: 'pointer', ...TY.b2,
                        color: active ? DS.actionPrimary : DS.textDefault,
                        fontWeight: active ? TY.weightSemiBold : 400,
                        background: active ? DS.blue100 : 'transparent' }}
               onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = DS.actionSecondaryHover; }}
               onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
            {r.label}
            {active && <Ico.Check s={16} c={DS.actionPrimary} />}
          </div>
        );
      })}
    </Popover>
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
                stroke={DS.neutral200} strokeWidth="1" strokeDasharray="3 3" />
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
              <circle cx={last.x} cy={last.y} r="3.5" fill={DS.bgCard} stroke={color} strokeWidth="2" />
              {/* hovered point */}
              {hov && (
                <circle cx={xAt(hoverIdx)} cy={yAt(s.points[hoverIdx])} r="6"
                        fill={DS.bgCard} stroke={color} strokeWidth="2.5" />
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
                      background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      padding: 12, minWidth: 224, pointerEvents: 'none', zIndex: 5 }}>
          <div style={{ ...TY.b3, color: DS.textSecondary, marginBottom: 8,
                        textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {shownLabels[hoverIdx]}
          </div>
          {selected.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CONSENT_COLORS[s.id], flexShrink: 0 }} />
              <span style={{ flex: 1, ...TY.b3, color: DS.textDefault, overflow: 'hidden',
                             textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              <span style={{ ...TY.h5, color: DS.textDefault }}>{fmtNum(s.points[hoverIdx])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
//  Channel breakdown donut  (BUILD-NEW)
// =====================================================================
// One brand secondary colour per channel — exactly four channels, four brand hues.
// CHANNEL_COLORS: pale brand hues for large solid fills (donut arcs, legend swatches).
const CHANNEL_COLORS = { Email: DS.brandViolet, SMS: DS.brandMagenta, WhatsApp: DS.brandMint, Push: DS.brandYellow };
// CHANNEL_INK: darkened variants for small 14px icons that need contrast on white.
const CHANNEL_INK = { Email: DS.brandViolet, SMS: DS.brandMagenta, WhatsApp: DS.brandMintInk, Push: DS.brandYellowInk };

function ChannelDonut({ consents }) {
  const totals = {};
  consents.forEach((c) => { totals[c.channel] = (totals[c.channel] || 0) + c.contacts; });
  const channels = Object.keys(CHANNEL_COLORS).filter((ch) => totals[ch]);
  const total = channels.reduce((s, ch) => s + totals[ch], 0) || 1;

  const R = 70, SW = 22, C = 90, circ = 2 * Math.PI * R;
  let offset = 0;
  const arcs = channels.map((ch) => {
    const frac = totals[ch] / total;
    const seg = { ch, frac, dash: frac * circ, offset };
    offset += frac * circ;
    return seg;
  });

  return (
    <div style={{ marginTop: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Donut — centered in the flexible space */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
        <svg width={C * 2} height={C * 2} viewBox={`0 0 ${C * 2} ${C * 2}`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke={DS.bgSurface} strokeWidth={SW} />
          {arcs.map((a) => (
            <circle key={a.ch} cx={C} cy={C} r={R} fill="none" stroke={CHANNEL_COLORS[a.ch]}
                    strokeWidth={SW} strokeDasharray={`${a.dash} ${circ - a.dash}`}
                    strokeDashoffset={-a.offset} transform={`rotate(-90 ${C} ${C})`}
                    strokeLinecap="butt" />
          ))}
          <text x={C} y={C - 4} textAnchor="middle" style={{ ...TY.h3 }} fill={DS.textDefault}>
            {fmtNum(total)}
          </text>
          <text x={C} y={C + 16} textAnchor="middle" fontSize="11" fill={DS.textSecondary}
                fontFamily="Inter, sans-serif">opt-ins</text>
        </svg>
      </div>
      {/* Legend — rows spread with dividers so the card fills evenly */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {channels.map((ch, i) => {
          const pct = (totals[ch] / total) * 100;
          return (
            <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0',
                                   borderTop: i === 0 ? 'none' : `1px solid ${DS.borderDefault}`,
                                   ...TY.b3, color: DS.textDefault }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: CHANNEL_COLORS[ch], flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{ch}</span>
              <span style={{ color: DS.textSecondary }}>{fmtNum(totals[ch])}</span>
              <span style={{ width: 48, textAlign: 'right', fontWeight: TY.weightSemiBold }}>
                {pct < 1 ? '<1' : pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
const CONSENT_COLUMNS = [
  { key: 'name',     label: 'Consent',     basis: 'minmax(220px, 2.4fr)' },
  { key: 'channel',  label: 'Channel',     basis: '130px' },
  { key: 'created',  label: 'Created',     basis: '120px' },
  { key: 'contacts', label: 'Contacts',    basis: '150px' },
  { key: 'trend',    label: '12-mo trend', basis: '130px' },
];

function consentCell(c, key) {
  const ChIcon = CHANNEL_ICON[c.channel] || Ico.Mail;
  switch (key) {
    case 'name':
      return (
        <BannerIdentity
          icon={<ChIcon s={20} c={DS.actionPrimary} />}
          title={c.name}
          badge={c.status === 'deactivated' ? <StatusBadge status="inactive">Deactivated</StatusBadge> : null}
          description={c.purpose}
        />
      );
    case 'channel':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <ChIcon s={14} c={CHANNEL_INK[c.channel] || DS.textSecondary} />{c.channel}
        </span>
      );
    case 'created':
      return <span style={{ color: DS.textSecondary, whiteSpace: 'nowrap' }}>{c.createdAt}</span>;
    case 'contacts': {
      const t = trendMeta(c.netTrend);
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 700, color: DS.textDefault }}>{fmtNum(c.contacts)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...TY.b3, color: t.color }}>
            <t.Icon s={14} c={t.color} />{t.label}
          </span>
        </span>
      );
    }
    case 'trend':
      return <Sparkline data={c.series} color={CONSENT_COLORS[c.id] || DS.blue500} />;
    default:
      return null;
  }
}

// =====================================================================
//  Detail drawer body
// =====================================================================
const EVENT_META = {
  created:     { color: DS.feedbackSuccess, label: 'Created' },
  updated:     { color: DS.actionPrimary,   label: 'Updated' },
  deactivated: { color: DS.textSecondary,   label: 'Deactivated' },
  reactivated: { color: DS.feedbackWarning, label: 'Reactivated' },
};

function DetailDrawer({ consent }) {
  const t = trendMeta(consent.netTrend);
  const ChIcon = CHANNEL_ICON[consent.channel] || Ico.Mail;
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* sub-header: tags + channel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Tag variant="unselected">{consent.optIn === 'double' ? 'Double opt-in' : 'Single opt-in'}</Tag>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...TY.b3, color: DS.textSecondary }}>
          <ChIcon s={14} c={CHANNEL_INK[consent.channel] || DS.textSecondary} />{consent.channel}
        </span>
        {consent.status === 'deactivated' && <StatusBadge status="inactive">Deactivated</StatusBadge>}
      </div>

      {/* per-consent KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MiniKpi label="Net opt-in trend" value={t.label} color={t.color} />
        <MiniKpi label="Contacts" value={fmtNum(consent.contacts)} />
        <MiniKpi label="Opt-in rate" value={`${consent.optInRate}%`} />
        <MiniKpi label="Opt-out rate" value={`${consent.optOutRate}%`} />
      </div>

      {/* single-consent evolution */}
      <div>
        <div style={{ ...TY.h5, color: DS.textDefault, marginBottom: 8 }}>Evolution (12 months)</div>
        <div style={{ border: `1px solid ${DS.borderDefault}`, borderRadius: 8, padding: 12 }}>
          <EvolutionChart consents={[consent]} selection={[consent.id]} months={12} labels={MONTH_LABELS} />
        </div>
      </div>

      {/* activity log */}
      <div>
        <div style={{ ...TY.h5, color: DS.textDefault, marginBottom: 10 }}>Activity log</div>
        {consent.log.length === 0 ? (
          <div style={{ ...TY.b2, color: DS.textSecondary }}>No activity recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {consent.log.map((ev, i) => {
              const m = EVENT_META[ev.event] || EVENT_META.updated;
              const last = i === consent.log.length - 1;
              return (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, marginTop: 4 }} />
                    {!last && <span style={{ flex: 1, width: 2, background: DS.borderDefault, margin: '2px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: last ? 0 : 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ ...TY.b2, color: m.color, fontWeight: TY.weightSemiBold }}>{m.label}</span>
                      <span style={{ ...TY.b3, color: DS.textSecondary }}>{ev.date}</span>
                    </div>
                    <div style={{ ...TY.b3, color: DS.textDefault, marginTop: 2 }}>{ev.note}</div>
                    <div style={{ ...TY.b3, color: DS.textSecondary, marginTop: 2,
                                  display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Ico.User s={12} c={DS.textSecondary} />{ev.author}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* export */}
      <div style={{ borderTop: `1px solid ${DS.borderDefault}`, paddingTop: 16 }}>
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Download />} onClick={() => {}}>
          Export this consent (CSV / PDF)
        </Btn>
      </div>
    </div>
  );
}

function MiniKpi({ label, value, color = DS.textDefault }) {
  return (
    <div style={{ background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`,
                  borderRadius: 8, padding: 12 }}>
      <div style={{ ...TY.b3, color: DS.textSecondary }}>{label}</div>
      <div style={{ ...TY.h4, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

// =====================================================================
//  Create drawer (+ unsaved-changes guard)
// =====================================================================
const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push'];

function CreateDrawer({ open, editing, onRequestClose }) {
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

  return (
    <>
      <Modal open={open} onClose={attemptClose} variant="panel" width={540}
             title={editing ? 'Edit consent' : 'Create a consent'}
             footer={
               <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                 <Btn type="Tertiary" size="Medium" onClick={attemptClose}>Cancel</Btn>
                 <Btn type="Primary" size="Medium" onClick={onRequestClose}>{editing ? 'Save changes' : 'Create consent'}</Btn>
               </div>
             }>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Consent name" value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Newsletter Public" />
          <TextArea label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    placeholder="What this consent is used for…" />
          <div>
            <div style={{ ...TY.b2, color: DS.textSecondary, marginBottom: 8 }}>Channel</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {CHANNELS.map((ch) => (
                <Radio key={ch} name="channel" value={ch} checked={channel === ch}
                       onChange={() => setChannel(ch)} label={ch} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ ...TY.b2, color: DS.textSecondary, marginBottom: 8 }}>Opt-in type</div>
            <div style={{ display: 'flex', gap: 14 }}>
              <Radio name="optin" value="single" checked={optIn === 'single'}
                     onChange={() => setOptIn('single')} label="Single opt-in" />
              <Radio name="optin" value="double" checked={optIn === 'double'}
                     onChange={() => setOptIn('double')} label="Double opt-in" />
            </div>
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

// =====================================================================
//  Loading skeleton
// =====================================================================
function OverviewSkeleton() {
  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                                borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton width={110} height={12} /><Skeleton width={80} height={24} /><Skeleton width={130} height={10} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '1 1 560px', background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 10, padding: 20, height: 360 }}>
          <Skeleton width={200} height={16} />
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-end', gap: 8, height: 250 }}>
            {Array.from({ length: 13 }).map((_, i) => (
              <Skeleton key={i} width={`${100 / 13}%`} height={60 + ((i * 37) % 170)} radius={6} />
            ))}
          </div>
        </div>
        <div style={{ flex: '1 1 320px', background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                      borderRadius: 10, padding: 20, height: 360, display: 'flex',
                      flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Skeleton width={160} height={16} />
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: DS.borderDefault, opacity: 0.6, marginTop: 16 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                                borderRadius: 10, padding: '14px 20px', height: 70,
                                display: 'flex', alignItems: 'center', gap: 20 }}>
            <Skeleton width={40} height={40} radius={8} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width={240} height={14} /><Skeleton width={160} height={10} />
            </div>
            <Skeleton width={120} height={36} />
          </div>
        ))}
      </div>
    </div>
  );
}
