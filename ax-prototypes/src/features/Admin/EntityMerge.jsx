/**
 * AX Prototypes — Entity merge (Admin · CS back-office)
 * PM: M. Bourguignon · minimal prototype, workflow validation only
 *
 * Problem: clients create ticketed events before the line-up is known
 * ("Match J12"), sell on that partial event, then create a SECOND event once the
 * real name exists ("Stade Rennais — Olympique Lyonnais"). Attendance ends up
 * split across two records.
 *
 * The workflow this page validates, and nothing more:
 *   1. CS opens the back-office page (never visible to the client)
 *   2. picks the level — Representations or Events (two tabs, one flat table each)
 *   3. ticks two or more rows → the Merge button above the table enables
 *   4. states the final name the surviving record takes
 *   5. merge → tickets move to that record, the others are deleted, and one line
 *      is appended to the action log (author, timestamps, status, JSON message)
 *
 * ⚠ The action log's `endpoint` column is a placeholder — the PM still has to
 *   provide the real back-office endpoint. It renders as "to provide" on purpose.
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import Table from '../../components/Table';
import IconBtn from '../../components/Iconbtn';
import Tabs from '../../components/Tabs';
import Stepper from '../../components/Stepper';
import ColumnCustomizer from '../../components/ColumnCustomizer';
import PageHeader from '../../components/PageHeader';
import StatePreview from '../../components/StatePreview';
import { Badge, StatusBadge } from '../../components/Tag';
import { EmptyState } from '../../components/Feedback';

/* ════════════════════════════ Mock data ════════════════════════════ */

const CS_USER = 'maxence.bourguignon@arenametrix.com';

/* Identifiers are the ticketing's 20-digit ids. Two duplicate pairs + one trio
   on the events tab, the matching showings on the representations tab. */
const EVENTS = [
  { id: '48201573920048117326', name: 'Match J12 — Ligue 1',                      tickets: 4820, date: '2026-02-14', createdAt: '2025-06-02' },
  { id: '48201573920051224871', name: 'Stade Rennais — Olympique Lyonnais',        tickets: 1240, date: '2026-02-14', createdAt: '2026-01-20' },
  { id: '48201573920048117327', name: 'Match J13 — Ligue 1',                      tickets: 5010, date: '2026-02-28', createdAt: '2025-06-02' },
  { id: '48201573920053390142', name: 'Stade Rennais — LOSC Lille',                tickets: 860,  date: '2026-02-28', createdAt: '2026-02-03' },
  { id: '48201573920048117328', name: 'Match J14 — Ligue 1',                      tickets: 4610, date: '2026-03-14', createdAt: '2025-06-02' },
  { id: '48201573920054118903', name: 'Stade Rennais — OGC Nice',                  tickets: 1105, date: '2026-03-14', createdAt: '2026-02-24' },
  { id: '48201573920048117329', name: 'Match J15 — Ligue 1',                      tickets: 4980, date: '2026-04-04', createdAt: '2025-06-02' },
  { id: '48201573920055027764', name: 'Stade Rennais — Olympique de Marseille',    tickets: 1310, date: '2026-04-04', createdAt: '2026-03-09' },
  { id: '48201573920055027765', name: 'SRFC / OM — J15 (billetterie VIP)',         tickets: 210,  date: '2026-04-04', createdAt: '2026-03-11' },
  { id: '48201573920048117330', name: 'Match J16 — Ligue 1',                      tickets: 4410, date: '2026-04-18', createdAt: '2025-06-02' },
  { id: '48201573920048117331', name: 'Match J17 — Ligue 1',                      tickets: 4260, date: '2026-05-02', createdAt: '2025-06-02' },
  { id: '48201573920056440118', name: 'Stade Rennais — Paris Saint-Germain',       tickets: 2870, date: '2026-05-02', createdAt: '2026-04-07' },
  { id: '48201573920048117332', name: 'Match J18 — Ligue 1',                      tickets: 3980, date: '2026-05-16', createdAt: '2025-06-02' },
  { id: '48201573920048117333', name: 'Match J19 — Ligue 1',                      tickets: 4130, date: '2026-05-30', createdAt: '2025-06-02' },
  { id: '48201573920059220913', name: 'Stade Rennais — Toulouse FC',               tickets: 990,  date: '2026-05-30', createdAt: '2026-05-04' },
  { id: '48201573920042086774', name: 'Coupe de France — 16es de finale',          tickets: 3120, date: '2026-01-07', createdAt: '2025-11-18' },
  { id: '48201573920057991204', name: 'Stade Rennais — FC Nantes (Coupe)',         tickets: 640,  date: '2026-01-07', createdAt: '2025-12-15' },
  { id: '48201573920041980553', name: 'Trophée des Champions 2025',                tickets: 7320, date: '2025-08-03', createdAt: '2025-04-11' },
  { id: '48201573920058330471', name: 'Match amical — présaison',                  tickets: 1890, date: '2025-07-19', createdAt: '2025-05-30' },
  { id: '48201573920060014557', name: 'Concert au Roazhon Park — été 2026',        tickets: 8940, date: '2026-07-11', createdAt: '2026-01-09' },
];

const REPRESENTATIONS = [
  { id: '91330415720048117326', name: 'Match J12 — 14 Feb 2026 · 20:45',           tickets: 4820, date: '2026-02-14', createdAt: '2025-06-02' },
  { id: '91330415720051224871', name: 'SRFC / OL — 14 Feb 2026 · 20:45',           tickets: 1240, date: '2026-02-14', createdAt: '2026-01-20' },
  { id: '91330415720048117327', name: 'Match J13 — 28 Feb 2026 · 17:00',           tickets: 5010, date: '2026-02-28', createdAt: '2025-06-02' },
  { id: '91330415720053390142', name: 'SRFC / LOSC — 28 Feb 2026 · 17:00',         tickets: 860,  date: '2026-02-28', createdAt: '2026-02-03' },
  { id: '91330415720048117328', name: 'Match J14 — 14 Mar 2026 · 21:00',           tickets: 4610, date: '2026-03-14', createdAt: '2025-06-02' },
  { id: '91330415720054118903', name: 'SRFC / Nice — 14 Mar 2026 · 21:00',         tickets: 1105, date: '2026-03-14', createdAt: '2026-02-24' },
  { id: '91330415720048117329', name: 'Match J15 — 4 Apr 2026 · 17:00',            tickets: 4980, date: '2026-04-04', createdAt: '2025-06-02' },
  { id: '91330415720055027764', name: 'SRFC / OM — 4 Apr 2026 · 17:00',            tickets: 1310, date: '2026-04-04', createdAt: '2026-03-09' },
  { id: '91330415720055027765', name: 'SRFC / OM — 4 Apr 2026 · 17:00 (VIP)',      tickets: 210,  date: '2026-04-04', createdAt: '2026-03-11' },
  { id: '91330415720048117330', name: 'Match J16 — 18 Apr 2026 · 19:00',           tickets: 4410, date: '2026-04-18', createdAt: '2025-06-02' },
  { id: '91330415720048117331', name: 'Match J17 — 2 May 2026 · 21:00',            tickets: 4260, date: '2026-05-02', createdAt: '2025-06-02' },
  { id: '91330415720056440118', name: 'SRFC / PSG — 2 May 2026 · 21:00',           tickets: 2870, date: '2026-05-02', createdAt: '2026-04-07' },
  { id: '91330415720048117332', name: 'Match J18 — 16 May 2026 · 17:00',           tickets: 3980, date: '2026-05-16', createdAt: '2025-06-02' },
  { id: '91330415720048117333', name: 'Match J19 — 30 May 2026 · 21:00',           tickets: 4130, date: '2026-05-30', createdAt: '2025-06-02' },
  { id: '91330415720059220913', name: 'SRFC / Toulouse — 30 May 2026 · 21:00',     tickets: 990,  date: '2026-05-30', createdAt: '2026-05-04' },
  { id: '91330415720042086774', name: 'Coupe de France 16es — 7 Jan 2026 · 21:10', tickets: 3120, date: '2026-01-07', createdAt: '2025-11-18' },
  { id: '91330415720057991204', name: 'SRFC / Nantes (Coupe) — 7 Jan 2026 · 21:10', tickets: 640, date: '2026-01-07', createdAt: '2025-12-15' },
  { id: '91330415720041980553', name: 'Trophée des Champions — 3 Aug 2025 · 21:00', tickets: 7320, date: '2025-08-03', createdAt: '2025-04-11' },
  { id: '91330415720058330471', name: 'Amical présaison — 19 Jul 2025 · 18:30',    tickets: 1890, date: '2025-07-19', createdAt: '2025-05-30' },
  { id: '91330415720060014557', name: 'Concert Roazhon Park — 11 Jul 2026 · 20:00', tickets: 8940, date: '2026-07-11', createdAt: '2026-01-09' },
];

/* ── Column catalogue, as on the Contacts table: the customizer and the table
   both read from it. A config is an ordered [{ key, visible }] over every
   column; `date` and `created_at` ship hidden so the default line stays
   checkbox · name · identifier · tickets. Every column uses the DS filter-input
   header (`Cell Type=Input, Background=Header`) rather than a text header. ── */
const ALL_COLUMNS = [
  { key: 'name',      label: 'Name',                filter: true },
  { key: 'id',        label: 'Identifier',          filter: true, width: 240 },
  { key: 'tickets',   label: 'Tickets',             filter: true, width: 120, type: 'number' },
  { key: 'date',      label: 'Representation date', filter: true, width: 200 },
  { key: 'createdAt', label: 'Created at',          filter: true, width: 170 },
];

const DEFAULT_COLUMN_KEYS = ['name', 'id', 'tickets'];
const DEFAULT_COLUMN_CONFIG = ALL_COLUMNS.map((c) => ({ key: c.key, visible: DEFAULT_COLUMN_KEYS.includes(c.key) }));

const resolveColumns = (config) => (config ?? DEFAULT_COLUMN_CONFIG)
  .filter((c) => c.visible)
  .map((c) => ALL_COLUMNS.find((a) => a.key === c.key))
  .filter(Boolean);

const LEVELS = {
  representation: { label: 'Representations', one: 'representation', type: 'MERGE_REPRESENTATION' },
  event:          { label: 'Events',          one: 'event',          type: 'MERGE_EVENT' },
};

/* One seeded log line so the table is readable from the start. */
const SEED_LOG = [
  {
    id: '4192',
    name: 'Merge of Match J11 — Ligue 1',
    actionType: 'MERGE_EVENT',
    author: 'camille.roux@arenametrix.com',
    createdAt: '2026-08-28 14:22:07',
    endAt: '2026-08-28 14:22:51',
    status: 'success',
    message: {
      action_id: '4192',
      type: 'MERGE_EVENT',
      target: { id: '48201573920042210118', name: 'Stade Rennais — Stade Brestois' },
      sources: [{ id: '48201573920042086119', name: 'Match J11 — Ligue 1', tickets_moved: 4380 }],
      tickets_moved: 4380,
      tickets_skipped: 0,
      final_name: 'Stade Rennais — Stade Brestois',
      duration_ms: 44_000,
      status: 'success',
    },
  },
];

const STATUS_TONE = {
  success: DS.feedbackSuccess,
  partial: DS.feedbackWarning,
  failed:  DS.feedbackError,
  running: DS.feedbackInfo,
};

/* ════════════════════════════ Helpers ════════════════════════════ */

const fmt = (n) => n.toLocaleString('en-US');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

function stamp(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} `
    + `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const CARD = { margin: 0, padding: 16 };
const PER_PAGE = 10;

/* Searchable text behind a cell — both the raw and the displayed form, so
   "4820", "4,820", "2026-02-14" and "14 Feb 2026" all match. */
function haystack(row, key) {
  if (key === 'tickets') return `${row.tickets} ${fmt(row.tickets)}`;
  if (key === 'date' || key === 'createdAt') return `${row[key]} ${fmtDate(row[key])}`;
  return String(row[key] ?? '');
}

/* ── Radio row: which record survives the merge ── */
function KeepRow({ checked, onClick, row }) {
  return (
    <div role="radio" aria-checked={checked} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer',
               borderRadius: 8, boxSizing: 'border-box',
               border: `1px solid ${checked ? DS.actionPrimary : DS.borderDefault}`,
               background: checked ? DS.brandPrimarySubtle : DS.surfaceCanvas }}>
      <span style={{ width: 16, height: 16, flexShrink: 0, borderRadius: '50%', background: DS.surfaceCanvas,
                     border: `1.5px solid ${checked ? DS.actionPrimary : DS.borderDefault}`,
                     display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <span style={{ width: 8, height: 8, borderRadius: '50%', background: DS.actionPrimary }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</div>
        <div style={{ ...TY.monoMd, fontFamily: DS.ffm, color: DS.textSecondary, marginTop: 3 }}>
          {row.id} · {fmt(row.tickets)} tickets
        </div>
      </div>
    </div>
  );
}

/* ── Impact recap — one line per selected record, plus the resulting total ── */
const RECAP_GRID = '1fr 210px 110px 190px';

function RecapRow({ cells, head = false, total = false }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: RECAP_GRID, gap: 12, alignItems: 'center',
      padding: '10px 14px', boxSizing: 'border-box',
      background: head ? DS.surfaceHeader : total ? DS.surfaceSubtle : DS.surfaceCanvas,
      borderTop: head ? 'none' : `1px solid ${DS.borderTableSep}`,
    }}>
      {cells}
    </div>
  );
}

function ImpactRecap({ keep, removed, moved }) {
  const th = { ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary };
  const td = { ...TY.bodyMd, fontFamily: DS.ff, color: DS.textStrong, minWidth: 0,
               whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
  const mono = { ...TY.monoMd, fontFamily: DS.ffm, color: DS.textSecondary };
  const num = { ...TY.bodyMd, fontFamily: DS.ff, color: DS.textStrong, textAlign: 'right' };

  return (
    <div style={{ border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusLg, overflow: 'hidden' }}>
      <RecapRow head cells={<>
        <span style={th}>Record</span>
        <span style={th}>Identifier</span>
        <span style={{ ...th, textAlign: 'right' }}>Tickets</span>
        <span style={th}>Outcome</span>
      </>} />

      {/* The survivor */}
      <RecapRow cells={<>
        <span style={{ ...td, fontWeight: 500 }}>{keep.name}</span>
        <span style={mono}>{keep.id}</span>
        <span style={num}>{fmt(keep.tickets)} → <strong>{fmt(keep.tickets + moved)}</strong></span>
        <StatusBadge status="success">Kept</StatusBadge>
      </>} />

      {/* The records that go away */}
      {removed.map((r) => (
        <RecapRow key={r.id} cells={<>
          <span style={{ ...td, color: DS.textSecondary, textDecoration: 'line-through' }}>{r.name}</span>
          <span style={mono}>{r.id}</span>
          <span style={{ ...num, color: DS.textSecondary }}>{fmt(r.tickets)} → 0</span>
          <StatusBadge status="error">Deleted</StatusBadge>
        </>} />
      ))}

      <RecapRow total cells={<>
        <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong }}>
          {fmt(moved)} tickets re-attached
        </span>
        <span />
        <span style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong, textAlign: 'right' }}>
          {fmt(keep.tickets + moved)}
        </span>
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>on the kept record</span>
      </>} />
    </div>
  );
}

/* ════════════════════════════ Merge modal — 2 steps ════════════════════════════ */
function MergeModal({ open, rows, level, onClose, onConfirm }) {
  const [step, setStep] = React.useState(0); // 0 = record to keep · 1 = impact
  const [keepId, setKeepId] = React.useState(null);
  const one = LEVELS[level].one;
  const Label = one.charAt(0).toUpperCase() + one.slice(1);

  React.useEffect(() => {
    if (!open || !rows.length) return;
    setStep(0);
    setKeepId(rows[0].id);
  }, [open, rows]);

  if (!open || rows.length < 2) return null;

  /* The kept record's own name is the final name — no free-text rename. */
  const keep = rows.find((r) => r.id === keepId) ?? rows[0];
  const removed = rows.filter((r) => r.id !== keep.id);
  const moved = removed.reduce((a, r) => a + r.tickets, 0);

  const footer = step === 0 ? (
    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
      <Btn type="Tertiary" onClick={onClose}>Cancel</Btn>
      <Btn type="Primary" onClick={() => setStep(1)}>Next</Btn>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
      <Btn type="Tertiary" onClick={() => setStep(0)}>Back</Btn>
      <Btn type="Primary" iconLeft={<Ico.Merge />}
           onClick={() => onConfirm({ keep, removed, finalName: keep.name, moved })}>
        Confirm merge
      </Btn>
    </div>
  );

  return (
    /* One title across both steps, as the DS modal flow does — the stepper
       carries the progress. */
    <Modal open={open} onClose={onClose} variant="center" width={780} footer={footer}
           title={`Merge ${rows.length} ${one}s`}>
      {/* DS modal body: 20px top · 24px sides · 24px bottom · gap 16, stepper first */}
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Stepper steps={[`${Label} to keep`, 'Impact']} current={step} onStepClick={setStep} />

        {step === 0 ? (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>
              Which {one} should be kept?
            </span>
            <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
              Its name is the one that survives. Tickets from the others are re-attached to it, and the others
              are deleted.
            </span>
            {rows.map((r) => (
              <KeepRow key={r.id} row={r} checked={r.id === keep.id} onClick={() => setKeepId(r.id)} />
            ))}
          </section>
        ) : (
          <>
            {/* The warning comes before the numbers — it is the point of the step */}
            <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: DS.radiusMdPlus,
                          background: DS.feedbackWarningSubtle,
                          border: `1px solid ${DS.feedbackWarning}` }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}><Ico.Warn s={16} c={DS.feedbackWarning} /></span>
              <div style={{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textSecondary }}>
                You are about to merge {rows.length} {one}s. {removed.length}{' '}
                {one}{removed.length > 1 ? 's' : ''} {removed.length > 1 ? 'are' : 'is'} deleted from the database
                and {fmt(moved)} tickets change owner. This action is irreversible — only merge records that
                describe the same physical event.
              </div>
            </div>

            <ImpactRecap keep={keep} removed={removed} moved={moved} />
          </>
        )}
      </div>
    </Modal>
  );
}

/* ════════════════════════════ Message (JSON) modal ════════════════════════════ */
function MessageModal({ log, onClose }) {
  if (!log) return null;
  return (
    <Modal open onClose={onClose} variant="center" width={620} title={`Message — action ${log.id}`}>
      <div style={{ padding: 20 }}>
        <pre style={{ margin: 0, padding: 14, borderRadius: 8, overflowX: 'auto',
                      background: DS.surfaceSubtle, border: `1px solid ${DS.borderDefault}`,
                      ...TY.monoMd, fontFamily: DS.ffm, color: DS.textDefault, lineHeight: 1.6 }}>
{JSON.stringify(log.message, null, 2)}
        </pre>
      </div>
    </Modal>
  );
}

/* ════════════════════════════ Main page ════════════════════════════ */
export function EntityMerge() {
  const [role, setRole] = React.useState('cs');            // cs | client
  const [level, setLevel] = React.useState('representation'); // representation | event
  const [reps, setReps] = React.useState(REPRESENTATIONS);
  const [events, setEvents] = React.useState(EVENTS);
  const [columnConfig, setColumnConfig] = React.useState(DEFAULT_COLUMN_CONFIG);
  const [filters, setFilters] = React.useState({});
  const [sort, setSort] = React.useState({ key: null, dir: 'asc' });
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [log, setLog] = React.useState(SEED_LOG);
  const [openMessage, setOpenMessage] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const one = LEVELS[level].one;
  const all = level === 'event' ? events : reps;

  /* Header inputs narrow the list; every filled one has to match. */
  const matching = all.filter((r) => Object.entries(filters).every(([k, v]) => (
    !v || haystack(r, k).toLowerCase().includes(v.toLowerCase())
  )));

  /* Header sort. Numbers and dates compare numerically; everything else by
     locale string. Filter first, then sort, then paginate. */
  const sorted = React.useMemo(() => {
    if (!sort.key) return matching;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...matching].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av === bv) return 0;
      const both = (x) => (sort.key === 'date' || sort.key === 'createdAt' ? +new Date(x || 0) : x);
      const A = both(av), B = both(bv);
      return (typeof A === 'number' && typeof B === 'number'
        ? A - B
        : String(A ?? '').localeCompare(String(B ?? ''))) * dir;
    });
  }, [matching, sort]);

  const pages = Math.ceil(sorted.length / PER_PAGE) || 1;
  const rows = sorted.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  /* Selection is held on the full list, so ticking rows on page 1 and page 2
     and merging them together works. */
  const picked = all.filter((r) => selected.includes(r.id));

  const columns = resolveColumns(columnConfig).map((c) => ({
    ...c,
    label: c.key === 'name' ? (level === 'event' ? 'Event' : 'Representation') : c.label,
  }));

  /* Selection and filters never survive a tab switch — merging across levels is
     exactly the mistake this page must not allow. */
  React.useEffect(() => { setSelected([]); setFilters({}); setPage(0); }, [level]);
  React.useEffect(() => { setPage(0); }, [filters]);
  /* A merge (or a filter) can leave the current page beyond the last one. */
  React.useEffect(() => { if (page > pages - 1) setPage(pages - 1); }, [page, pages]);

  function runMerge({ keep, removed, finalName, moved }) {
    const goneIds = removed.map((r) => r.id);
    const apply = (prev) => prev
      .filter((r) => !goneIds.includes(r.id))
      .map((r) => (r.id === keep.id ? { ...r, name: finalName, tickets: r.tickets + moved } : r));

    if (level === 'event') setEvents(apply); else setReps(apply);

    const start = new Date();
    const end = new Date(start.getTime() + 38_000);
    setLog((prev) => [{
      id: String(4200 + prev.length),
      name: `Merge of ${removed.map((r) => r.name).join(', ')}`,
      actionType: LEVELS[level].type,
      author: CS_USER,
      createdAt: stamp(start),
      endAt: stamp(end),
      status: 'success',
      message: {
        action_id: String(4200 + prev.length),
        type: LEVELS[level].type,
        target: { id: keep.id, name: finalName },
        sources: removed.map((r) => ({ id: r.id, name: r.name, tickets_moved: r.tickets })),
        tickets_moved: moved,
        tickets_skipped: 0,
        final_name: finalName,
        duration_ms: 38_000,
        status: 'success',
      },
    }, ...prev]);

    setModal(false);
    setSelected([]);
    setToast(`${fmt(moved)} tickets moved to “${finalName}” · ${goneIds.length} ${one}${goneIds.length > 1 ? 's' : ''} deleted`);
    setTimeout(() => setToast(null), 3200);
  }

  /* Client accounts must never see this page. */
  if (role !== 'cs') {
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PageHeader title="Entity merge" description="Back-office tool" />
        <Card style={CARD}>
          <EmptyState icon={<Ico.AccessControl s={24} c={DS.textSecondary} />}
            title="Restricted to the Arenametrix CS team"
            sub="Merging records rewrites ticket attribution and deletes rows, so it stays in the back-office. Ask your CS contact to run it." />
        </Card>
        <StatePreview groups={[{ label: 'Role', value: role, onChange: setRole,
          options: [{ id: 'cs', label: 'CS (back-office)' }, { id: 'client', label: 'Client user' }] }]} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>
      <PageHeader
        title="Entity merge"
        description="Merge two or more records that describe the same representation, so attendance is counted once"
        actions={<Badge tone="danger">CS only</Badge>}
      />

      {/* DS Molecules/Tab (Figma 465:94) — secondary navigation between levels */}
      <Tabs value={level} onChange={setLevel} tabs={[
        { value: 'representation', label: LEVELS.representation.label, width: 160 },
        { value: 'event', label: LEVELS.event.label },
      ]} />

      {/* The list — checkbox · name · identifier · tickets, with Merge on top */}
      <Table
        columns={columns}
        rows={rows}
        rowId={(r) => r.id}
        cell={(r, k) => {
          if (k === 'tickets') return fmt(r.tickets);
          if (k === 'date' || k === 'createdAt') return fmtDate(r[k]);
          if (k === 'id') return <span style={{ ...TY.monoMd, fontFamily: DS.ffm, color: DS.textSecondary }}>{r.id}</span>;
          return r.name;
        }}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        filters={filters}
        onFilterChange={(key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(0); }}
        sortKey={sort.key}
        sortDir={sort.dir}
        onSort={(key) => {
          setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
          setPage(0);
        }}
        toolbar={{
          columnConfig: (
            <ColumnCustomizer config={columnConfig} allColumns={ALL_COLUMNS}
                              defaultConfig={DEFAULT_COLUMN_CONFIG} onChange={setColumnConfig} />
          ),
          primaryAction: (
            <Btn type="Primary" iconLeft={<Ico.Merge />} disabled={selected.length < 2} onClick={() => setModal(true)}>
              Merge
            </Btn>
          ),
          secondaryAction: selected.length > 0
            ? <Btn type="Tertiary" onClick={() => setSelected([])}>Clear selection</Btn>
            : null,
        }}
        page={page} pages={pages} setPage={setPage} total={matching.length} pageSize={PER_PAGE}
        emptyState={
          <EmptyState icon={<Ico.Search s={24} c={DS.textSecondary} />}
            title={all.length === 0 ? `No ${one} left` : `No ${one} matches the column filters`}
            sub={all.length === 0 ? undefined : 'Clear a header input to widen the list.'}
            cta={all.length > 0 ? <Btn type="Secondary" onClick={() => setFilters({})}>Clear filters</Btn> : undefined} />
        }
      />

      {/* Action log */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>Action log</span>
        <div style={{ overflowX: 'auto' }}>
          <Table
            style={{ minWidth: 1320 }}
            columns={[
              { key: 'id', label: 'ID', width: 80, sortable: false },
              { key: 'name', label: 'Action', sortable: false },
              { key: 'endpoint', label: 'Endpoint', width: 190, sortable: false },
              { key: 'actionType', label: 'Action type', width: 210, sortable: false },
              { key: 'author', label: 'Author', width: 250, sortable: false },
              { key: 'createdAt', label: 'Created at', width: 165, sortable: false },
              { key: 'endAt', label: 'End at', width: 165, sortable: false },
              { key: 'status', label: 'Status', type: 'status', width: 130, sortable: false },
              { key: 'message', label: 'Message', width: 100, sortable: false },
            ]}
            rows={log}
            rowId={(r) => r.id}
            cell={(r, k) => {
              switch (k) {
                case 'endpoint':
                  // PM still has to provide the real back-office endpoint.
                  return <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textMuted, fontStyle: 'italic' }}>to provide</span>;
                case 'actionType':
                  return <span style={{ ...TY.monoMd, fontFamily: DS.ffm, color: DS.textSecondary }}>{r.actionType}</span>;
                case 'status':
                  return { label: r.status, tone: STATUS_TONE[r.status] ?? DS.textMuted };
                case 'message':
                  return (
                    <IconBtn kind="Ghost" size="Sm" aria-label="View JSON message"
                             icon={<Ico.Code s={16} c={DS.actionPrimary} />}
                             onClick={() => setOpenMessage(r)} />
                  );
                default:
                  return r[k];
              }
            }}
            emptyState={<EmptyState icon={<Ico.Clock s={24} c={DS.textSecondary} />} title="No action recorded yet" />}
          />
        </div>
      </section>

      <MergeModal open={modal} rows={picked} level={level}
                  onClose={() => setModal(false)} onConfirm={runMerge} />

      <MessageModal log={openMessage} onClose={() => setOpenMessage(null)} />

      <Toast toast={toast} />
      <StatePreview groups={[{ label: 'Role', value: role, onChange: setRole,
        options: [{ id: 'cs', label: 'CS (back-office)' }, { id: 'client', label: 'Client user' }] }]} />
    </div>
  );
}

export default EntityMerge;
