/**
 * AX Prototypes — SMS Management (CRM Marketing)
 * PM: M. Bourguignon · Q1 2027 · near-production
 *
 * One feature, two tabs (Campaigns list / Statistics) + a full-page builder flow
 * launched by the "Create campaign" CTA. Sending mechanics are out of scope — the
 * builder ends at a Review/Send step. V1 KPIs only: messages sent, delivery %, click %.
 *
 * Imports the shared design system + components (no inline DS/TY/Ico, no app shell).
 * BUILD-NEW (feature-local): PhonePreview, SmsCounter, builder section
 * checklist, delivery/clicks chart (recharts), DateRange picker.
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import { Field, SearchField, TextArea } from '../../components/Field';
import { StatusBadge } from '../../components/Tag';
import Select from '../../components/Select';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import Banner from '../../components/Banner';
import KpiCard from '../../components/Kpi';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import Pagination from '../../components/Pagination';
import ActionMenu from '../../components/ActionMenu';
import StatePreview from '../../components/StatePreview';
import PageHeader from '../../components/PageHeader';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';
import Tabs from '../../components/Tabs';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend,
} from 'recharts';

/* ════════════════════════════ Mock data ════════════════════════════ */

const SEGMENTS = [
  { id: 'seg1', name: 'Acheteurs 2024',        contactCount: 92340 }, // large
  { id: 'seg2', name: 'Newsletter SMS opt-in', contactCount: 18420 },
  { id: 'seg3', name: 'Panier abandonné 30j',  contactCount: 1230 },
  { id: 'seg4', name: 'VIP abonnés',           contactCount: 40 },    // tiny
];

const SENDERS = [
  { id: 'snd1', label: 'VElectro',   number: 'VElectro' },     // alphanumeric sender ID
  { id: 'snd2', label: 'Versailles', number: 'Versailles' },
  { id: 'snd3', label: '+33 7 56 84 12 03', number: '+33756841203' }, // numeric
];

const VARIABLES = [
  { token: '{firstname}', sampleValue: 'Marie' },
  { token: '{lastname}',  sampleValue: 'Durand' },
  { token: '{event}',     sampleValue: 'Versailles Electro — Grande Écurie' }, // long sample
  { token: '{date}',      sampleValue: '18/05/26' },
];

const TAGS = ['Billetterie', 'Annulation', 'Rappel'];

const CAMPAIGNS = [
  {
    id: '3299',
    name: 'Disponibilité billetterie — Beethoven Symphony Day & Night Experience 2026 (rappel J-3)',
    status: 'Draft', lastEdited: 'Nov 25, 2025', sendDate: null,
    senderId: 'snd1', segmentId: 'seg1', tags: ['Billetterie'],
    messageBody: 'Billetterie {event} encore disponible jusqu’au {date}. Réservez vite !',
    recipients: null, messagesSent: null, deliveryRate: null, clickRate: null,
  },
  {
    id: '2849',
    name: 'Annulation Versailles Electro 2025',
    status: 'Sent', lastEdited: 'May 13, 2025', sendDate: 'May 13, 2025',
    senderId: 'snd1', segmentId: 'seg2', tags: ['Annulation'],
    messageBody: 'Annulation de {event} le {date}. Vous allez recevoir un email avec les informations utiles.',
    recipients: 8420, messagesSent: 8420, deliveryRate: 98.4, clickRate: 4.2,
  },
  {
    id: '2847',
    name: 'Billetterie disponible — VE 25',
    status: 'Sent', lastEdited: 'May 11, 2025', sendDate: 'May 11, 2025',
    senderId: 'snd2', segmentId: 'seg2', tags: ['Billetterie'],
    messageBody: 'Bonjour {firstname}, la billetterie {event} est ouverte. Profitez-en !',
    recipients: 3698, messagesSent: 3698, deliveryRate: 97.9, clickRate: 5.1,
  },
  {
    id: '2538',
    name: 'Rappel — Requiem de Mozart',
    status: 'Sent', lastEdited: 'Dec 16, 2024', sendDate: 'Dec 16, 2024',
    senderId: 'snd2', segmentId: 'seg1', tags: ['Rappel'],
    messageBody: 'Rappel : Requiem de Mozart ce soir 20h. À tout à l’heure {firstname} !',
    recipients: 12540, messagesSent: 12540, deliveryRate: 85.2, clickRate: 0.3, // poor delivery + near-zero click
  },
  {
    id: '2065',
    name: 'Annulation VE 2024',
    status: 'Sent', lastEdited: 'Apr 25, 2024', sendDate: 'Apr 25, 2024',
    senderId: 'snd1', segmentId: 'seg3', tags: ['Annulation'],
    messageBody: 'Annulation de {event} le {date}. Un email suit avec les détails.',
    recipients: 2065, messagesSent: 2065, deliveryRate: 99.1, clickRate: 3.7,
  },
];

/* Aggregated delivery & clicks over time — one dip day for a visible downward trend. */
const TIMESERIES = [
  { date: '02 Jun', delivered: 98.1, clicks: 4.4 },
  { date: '04 Jun', delivered: 97.6, clicks: 4.1 },
  { date: '06 Jun', delivered: 98.3, clicks: 4.8 },
  { date: '08 Jun', delivered: 86.0, clicks: 1.2 }, // dip
  { date: '10 Jun', delivered: 97.9, clicks: 4.6 },
  { date: '12 Jun', delivered: 98.6, clicks: 5.0 },
  { date: '14 Jun', delivered: 98.2, clicks: 4.3 },
  { date: '16 Jun', delivered: 98.8, clicks: 4.9 },
];

/* ════════════════════════════ Helpers ════════════════════════════ */

const fmt = (n) => (n == null ? '—' : n.toLocaleString('en-US'));
const pct = (n) => (n == null ? '—' : `${n}%`);
const segName = (id) => SEGMENTS.find((s) => s.id === id)?.name ?? '—';
const sndLabel = (id) => SENDERS.find((s) => s.id === id)?.label ?? '—';

/* Resolve {variables} → sample values for the live preview / char estimate. */
function resolveVars(text) {
  let out = text || '';
  VARIABLES.forEach((v) => { out = out.split(v.token).join(v.sampleValue); });
  return out;
}

/* Compute SMS segmentation from the resolved message. GSM-7 → 160/153;
   if any non-GSM (accent/emoji) char is present → Unicode 70/67. */
function smsCount(resolvedText) {
  const len = resolvedText.length;
  const unicode = [...resolvedText].some((ch) => ch.charCodeAt(0) > 127); // any non-ASCII -> unicode mode
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  if (len === 0) return { len, segments: 1, capacity: single, unicode };
  if (len <= single) return { len, segments: 1, capacity: single, unicode };
  const segments = Math.ceil(len / multi);
  return { len, segments, capacity: segments * multi, unicode };
}

const CARD = { margin: 0, padding: 16 };
const PAGE_X = 32;

/* ════════════════════════════ BUILD-NEW: SmsCounter ════════════════════════════ */
function SmsCounter({ resolved }) {
  const c = smsCount(resolved);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
          {c.segments} SMS · variables counted with sample values
        </span>
        <span style={{ ...TY.b3, fontFamily: DS.ff, fontWeight: 600,
                       color: c.segments > 1 ? DS.feedbackWarning : DS.textSecondary }}>
          {c.len}/{c.capacity}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: DS.borderDefault, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(100, (c.len / c.capacity) * 100)}%`,
                      background: c.segments > 1 ? DS.feedbackWarning : DS.actionPrimary, transition: 'width .15s' }} />
      </div>
      {c.unicode && (
        <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.feedbackWarning }}>
          Special characters / accents detected — the per-SMS limit drops to {c.segments > 1 ? 67 : 70} characters.
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════ BUILD-NEW: PhonePreview ════════════════════════════ */
function PhonePreview({ message, sender }) {
  const resolved = resolveVars(message);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 268, height: 520, borderRadius: 36, background: DS.neutral900, padding: 12,
                    boxShadow: '0 18px 50px rgba(0,0,0,0.22)', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 26, background: DS.bgSurface,
                      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* status bar */}
          <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 90, height: 16, borderRadius: 999, background: DS.neutral900 }} />
          </div>
          {/* sender */}
          <div style={{ textAlign: 'center', padding: '4px 0 10px', borderBottom: `1px solid ${DS.borderDefault}` }}>
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>SMS</div>
            <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault }}>{sender || 'Sender'}</div>
          </div>
          {/* bubble */}
          <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
            {resolved.trim() ? (
              <div style={{ maxWidth: '85%', background: DS.bgCard, border: `1px solid ${DS.borderDefault}`,
                            borderRadius: '4px 14px 14px 14px', padding: '10px 12px', ...TY.b2,
                            fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {resolved}
              </div>
            ) : (
              <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textPlaceholder, textAlign: 'center', marginTop: 24 }}>
                Your message preview appears here.
              </div>
            )}
          </div>
        </div>
      </div>
      <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
        Live preview — {'{variables}'} shown with sample values
      </span>
    </div>
  );
}

/* ════════════════════════════ BUILD-NEW: Builder section checklist row ════════════════════════════ */
function SectionRow({ done, title, children }) {
  return (
    <Card style={{ ...CARD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex',
                       alignItems: 'center', justifyContent: 'center',
                       background: done ? DS.feedbackSuccessBg : DS.bgSurface,
                       border: `1px solid ${done ? DS.feedbackSuccess : DS.borderDefault}` }}>
          {done && <Ico.Check s={14} c={DS.feedbackSuccess} />}
        </span>
        <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault }}>{title}</span>
      </div>
      {children}
    </Card>
  );
}

/* ════════════════════════════ BUILD-NEW: DateRange picker ════════════════════════════ */
const RANGES = [
  { value: '7',   label: 'Last 7 days',  display: '10 Jun – 16 Jun, 2026' },
  { value: '30',  label: 'Last 30 days', display: '17 May – 16 Jun, 2026' },
  { value: '90',  label: 'Last 90 days', display: '18 Mar – 16 Jun, 2026' },
  { value: 'ytd', label: 'This year',    display: '01 Jan – 16 Jun, 2026' },
];
function DateRange({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);
  const sel = RANGES.find((r) => r.value === value) || RANGES[1];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        height: 40, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        background: DS.bgSurface, border: `1px solid ${open ? DS.borderFocus : DS.borderDefault}`,
        borderRadius: 6, fontFamily: DS.ff, ...TY.b2, color: DS.textDefault }}>
        <Ico.Calendar s={16} c={DS.textSecondary} />
        {sel.display}
        <Ico.ChevDown s={16} c={DS.textSecondary} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 44, left: 0, minWidth: 180, background: DS.bgCard,
                      border: `1px solid ${DS.borderDefault}`, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      zIndex: 50, padding: 6 }}>
          {RANGES.map((r) => (
            <div key={r.value} role="button" onClick={() => { onChange(r.value); setOpen(false); }}
                 style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', ...TY.b2, fontFamily: DS.ff,
                          color: r.value === value ? DS.actionPrimary : DS.textDefault,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = DS.actionSecondaryHover)}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {r.label}{r.value === value && <Ico.Check s={16} c={DS.actionPrimary} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════ Campaign builder (full-page takeover) ════════════════════════════ */
function CampaignBuilder({ draft, onClose, onSent, onTest }) {
  const [name, setName] = React.useState(draft?.name || 'Untitled SMS campaign');
  const [message, setMessage] = React.useState(draft?.messageBody || '');
  const [senderId, setSenderId] = React.useState(draft?.senderId || '');
  const [segmentId, setSegmentId] = React.useState(draft?.segmentId || '');
  const [sendDate, setSendDate] = React.useState('');

  const msgDone = message.trim().length > 0;
  const senderDone = !!senderId;
  const recipientsDone = !!segmentId;
  const configDone = !!sendDate;
  const allDone = msgDone && senderDone && recipientsDone && configDone;

  const insertVar = (token) => setMessage((m) => `${m}${token}`);
  const segContacts = SEGMENTS.find((s) => s.id === segmentId)?.contactCount;
  const segs = smsCount(resolveVars(message)).segments;

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage, display: 'flex', flexDirection: 'column' }}>
      {/* Builder header (own header — back + send actions) */}
      <div style={{ background: DS.bgCard, borderBottom: `1px solid ${DS.borderDefault}`,
                    padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button type="button" onClick={onClose} aria-label="Back to campaigns"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <Ico.ArrowBack s={20} c={DS.textDefault} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'nowrap',
                           overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 520 }}>{name}</span>
            <StatusBadge status="inactive">Draft</StatusBadge>
          </div>
          <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
            Auto-saved as draft · sending mechanics are out of scope for this prototype
          </span>
        </div>
        <Btn type="Secondary" size="Medium" iconLeft={<Ico.Mail />} onClick={onTest} disabled={!msgDone}>Send test</Btn>
        <Btn type="Primary" size="Medium" iconLeft={<Ico.Campaigns />} onClick={onSent} disabled={!allDone}>Send</Btn>
      </div>

      {/* Two-pane body: editor (60%) + live preview (40%) */}
      <div style={{ flex: 1, display: 'flex', gap: 16, padding: PAGE_X, alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 60%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          <SectionRow done={!!name.trim()} title="Campaign name">
            <Field value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Billetterie disponible — VE 26" />
          </SectionRow>

          <SectionRow done={msgDone} title="Message content">
            <TextArea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                      placeholder="Write your SMS… insert {variables} for personalization." />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              <span style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, alignSelf: 'center',
                             display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Ico.Code s={14} c={DS.textSecondary} /> Insert variable:
              </span>
              {VARIABLES.map((v) => (
                <Chip key={v.token} label={v.token} onClick={() => insertVar(v.token)} />
              ))}
            </div>
            <SmsCounter resolved={resolveVars(message)} />
          </SectionRow>

          <SectionRow done={senderDone} title="Sender">
            <Select label="Sending number / sender ID" value={senderId} onChange={setSenderId}
                    placeholder="Select a sender"
                    options={SENDERS.map((s) => ({ value: s.id, label: s.label }))} />
          </SectionRow>

          <SectionRow done={recipientsDone} title="Recipients">
            <Select label="Target segment (existing CRM segment)" value={segmentId} onChange={setSegmentId}
                    placeholder="Select a segment"
                    options={SEGMENTS.map((s) => ({ value: s.id, label: `${s.name} · ${fmt(s.contactCount)} contacts` }))} />
            {segContacts != null && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 6, background: DS.feedbackInfoBg,
                            ...TY.b3, fontFamily: DS.ff, color: DS.feedbackInfo }}>
                Estimated send: {fmt(segContacts)} contacts × {segs} SMS = {fmt(segContacts * segs)} messages.
              </div>
            )}
          </SectionRow>

          <SectionRow done={configDone} title="Config">
            <Field label="Send date" type="date" value={sendDate} onChange={(e) => setSendDate(e.target.value)} />
          </SectionRow>

          {!allDone && (
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary, display: 'inline-flex',
                          alignItems: 'center', gap: 6 }}>
              <Ico.Info s={14} c={DS.textSecondary} /> Complete every section to enable Send.
            </div>
          )}
        </div>

        <div style={{ flex: '0 0 38%', position: 'sticky', top: PAGE_X }}>
          <PhonePreview message={message} sender={sndLabel(senderId) !== '—' ? sndLabel(senderId) : ''} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ Statistics tab ════════════════════════════ */
function StatTable({ rows, onReport }) {
  return (
    <Card style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 90px',
                    padding: '12px 16px', background: DS.blue100, ...TY.h5, fontFamily: DS.ff, color: DS.textDefault }}>
        <span>ID</span><span>Name</span><span>Sent</span><span>Delivered</span><span>Clicked</span><span>Date</span><span></span>
      </div>
      {rows.map((c) => (
        <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '80px 2fr 1fr 1fr 1fr 1fr 90px',
                                 alignItems: 'center', padding: '12px 16px', borderTop: `1px solid ${DS.borderDefault}`,
                                 ...TY.b3, fontFamily: DS.ff, color: DS.textDefault }}>
          <span style={{ color: DS.textSecondary }}>#{c.id}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>{c.name}</span>
          <span>{fmt(c.messagesSent)}</span>
          <span style={{ color: c.deliveryRate < 90 ? DS.feedbackWarning : DS.textDefault, fontWeight: 600 }}>{pct(c.deliveryRate)}</span>
          <span style={{ color: c.clickRate < 1 ? DS.feedbackError : DS.textDefault, fontWeight: 600 }}>{pct(c.clickRate)}</span>
          <span style={{ color: DS.textSecondary }}>{c.sendDate}</span>
          <button type="button" onClick={() => onReport(c)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex',
                           alignItems: 'center', gap: 4, ...TY.b3, fontFamily: DS.ff, color: DS.actionPrimary }}>
            <Ico.Eye s={14} c={DS.actionPrimary} /> report
          </button>
        </div>
      ))}
    </Card>
  );
}

/* ════════════════════════════ Main page ════════════════════════════ */
export function SmsManagement() {
  const [state, setState] = React.useState('ready'); // ready | loading | empty | error
  const [tab, setTab] = React.useState('campaigns'); // campaigns | statistics
  const [query, setQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [tagFilter, setTagFilter] = React.useState('all');
  const [page, setPage] = React.useState(0);
  const [range, setRange] = React.useState('30');

  const [editing, setEditing] = React.useState(null);     // campaign draft in builder (or {} for new)
  const [reportOf, setReportOf] = React.useState(null);   // campaign shown in side panel
  const [deleteOf, setDeleteOf] = React.useState(null);   // campaign pending delete confirm
  const [toast, setToast] = React.useState(null);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const allCampaigns = state === 'empty' ? [] : CAMPAIGNS;

  const filtered = allCampaigns.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (tagFilter !== 'all' && !c.tags.includes(tagFilter)) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase()) && !c.id.includes(query)) return false;
    return true;
  });

  const PER = 4;
  const pages = Math.ceil(filtered.length / PER) || 1;
  const pageRows = filtered.slice(page * PER, page * PER + PER);
  React.useEffect(() => { setPage(0); }, [query, statusFilter, tagFilter, tab, state]);

  const sent = allCampaigns.filter((c) => c.status === 'Sent');
  const totalSent = sent.reduce((a, c) => a + (c.messagesSent || 0), 0);
  const avgDelivery = sent.length ? (sent.reduce((a, c) => a + c.deliveryRate, 0) / sent.length).toFixed(1) : null;
  const avgClick = sent.length ? (sent.reduce((a, c) => a + c.clickRate, 0) / sent.length).toFixed(1) : null;

  const rowActions = (c) => (
    <ActionMenu items={[
      { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: () => notify(`Duplicated "${c.name.slice(0, 28)}…"`) },
      { label: 'Rename',    icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => setEditing(c) },
      { label: 'Delete',    icon: <Ico.Trash s={16} c={DS.feedbackError} />, danger: true,
        hidden: c.status === 'Sent', onClick: () => setDeleteOf(c) }, // sent campaigns can't be deleted
    ]} />
  );

  /* ── Builder takes over the whole page ── */
  if (editing) {
    return (
      <>
        <CampaignBuilder
          draft={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onTest={() => notify('Test SMS sent to your number')}
          onSent={() => { setEditing(null); notify('Campaign ready to send (dispatch out of scope)'); }}
        />
        <Toast toast={toast} />
        <StatePreview groups={[{ label: 'State', value: state, onChange: setState,
          options: ['ready', 'loading', 'empty', 'error'] }]} />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100%', background: DS.bgPage, paddingBottom: 40 }}>
      <PageHeader
        icon={<Ico.Sms s={20} c={DS.actionPrimary} />}
        title="SMS Management"
        description="Build, send and analyze SMS campaigns from your CRM segments"
        actions={<Btn type="Primary" iconLeft={<Ico.Plus />} onClick={() => setEditing({})}>Create campaign</Btn>}
      />

      {/* Tabs */}
      <div style={{ padding: `16px ${PAGE_X}px 0` }}>
        <Tabs value={tab} onChange={setTab} divider tabs={[
          { value: 'campaigns',  label: 'Campaigns'  },
          { value: 'statistics', label: 'Statistics' },
        ]} />
      </div>

      <div style={{ padding: `16px ${PAGE_X}px`, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {state === 'error' ? (
          <Card style={CARD}><ErrorState title="Couldn't load your campaigns." sub="Something went wrong."
                                         onRetry={() => setState('ready')} /></Card>
        ) : tab === 'campaigns' ? (
          /* ════ Campaigns tab ════ */
          <>
            {/* Filter bar */}
            <Card style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px', minWidth: 220 }}>
                <SearchField value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a campaign…" />
              </div>
              <Select width={150} value={statusFilter} onChange={setStatusFilter} options={[
                { value: 'all', label: 'All statuses' }, { value: 'Draft', label: 'Draft' }, { value: 'Sent', label: 'Sent' },
              ]} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Chip label="All tags" selected={tagFilter === 'all'} onClick={() => setTagFilter('all')} />
                {TAGS.map((t) => <Chip key={t} label={t} selected={tagFilter === t} onClick={() => setTagFilter(t)} />)}
              </div>
            </Card>

            {/* List / states */}
            {state === 'loading' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <Card key={i} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Skeleton w={44} h={44} r={10} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Skeleton w={280} h={14} /><Skeleton w={160} h={12} />
                    </div>
                    <Skeleton w={90} h={24} r={999} />
                  </Card>
                ))}
              </div>
            ) : allCampaigns.length === 0 ? (
              <Card style={CARD}>
                <EmptyState icon={<Ico.Sms s={24} c={DS.textSecondary} />} title="No SMS campaigns yet"
                            sub="Create your first campaign to reach your contacts by SMS."
                            cta={<Btn type="Primary" iconLeft={<Ico.Plus />} onClick={() => setEditing({})}>Create campaign</Btn>} />
              </Card>
            ) : filtered.length === 0 ? (
              <Card style={CARD}>
                <EmptyState icon={<Ico.Search s={24} c={DS.textSecondary} />} title="No campaigns match these filters"
                            sub="Try a different search, status, or tag."
                            cta={<Btn type="Secondary" onClick={() => { setQuery(''); setStatusFilter('all'); setTagFilter('all'); }}>Clear filters</Btn>} />
              </Card>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pageRows.map((c) => (
                    <Banner key={c.id}
                      icon={<Ico.Sms s={20} c={DS.actionPrimary} />}
                      title={c.name}
                      badge={c.status === 'Sent'
                        ? <StatusBadge status="success">Sent</StatusBadge>
                        : <StatusBadge status="inactive">Draft</StatusBadge>}
                      description={`#${c.id} · ${c.status === 'Sent' ? `Sent ${c.sendDate}` : `Last edited ${c.lastEdited}`} · ${segName(c.segmentId)}`}
                      columns={c.status === 'Sent' ? [
                        { label: 'SENT', value: fmt(c.messagesSent), basis: '90px' },
                        { label: 'DELIVERED', value: pct(c.deliveryRate), basis: '90px' },
                        { label: 'CLICKED', value: pct(c.clickRate), basis: '90px' },
                      ] : [{ label: 'STATUS', value: 'Not sent', basis: '90px' }]}
                      actions={rowActions(c)}
                      onClick={() => (c.status === 'Sent' ? (setTab('statistics'), setReportOf(c)) : setEditing(c))}
                    />
                  ))}
                </div>
                <Pagination page={page} pages={pages} setPage={setPage} />
              </>
            )}
          </>
        ) : (
          /* ════ Statistics tab ════ */
          <>
            <Card style={{ ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <DateRange value={range} onChange={setRange} />
              <Btn type="Secondary" iconLeft={<Ico.Download />}
                   disabled={state === 'loading' || sent.length === 0}
                   onClick={() => notify('Exported performance.csv')}>Export (.csv)</Btn>
            </Card>

            {/* KPI strip */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <KpiCard title="Messages sent" value={state === 'loading' ? '' : (sent.length ? fmt(totalSent) : '—')}
                       sub="across sent campaigns" icon={<Ico.Sms s={18} c={DS.actionPrimary} />} loading={state === 'loading'} />
              <KpiCard title="Delivery rate" value={state === 'loading' ? '' : (avgDelivery ? `${avgDelivery}%` : '—')}
                       sub="delivered / sent" icon={<Ico.TrendUp s={18} c={DS.actionPrimary} />}
                       accent={avgDelivery && avgDelivery < 90 ? DS.feedbackWarning : DS.actionPrimary} loading={state === 'loading'} />
              <KpiCard title="Click rate" value={state === 'loading' ? '' : (avgClick ? `${avgClick}%` : '—')}
                       sub="clicks / sent" icon={<Ico.Chart s={18} c={DS.actionPrimary} />} loading={state === 'loading'} />
            </div>

            {state === 'loading' ? (
              <Card style={CARD}><Skeleton width="100%" height={260} radius={8} /></Card>
            ) : sent.length === 0 ? (
              <Card style={CARD}>
                <EmptyState icon={<Ico.Chart s={24} c={DS.textSecondary} />} title="No campaigns sent in this period"
                            sub="Adjust the date range or send a campaign to see performance here." />
              </Card>
            ) : (
              <>
                {/* Chart */}
                <Card style={CARD}>
                  <div style={{ ...TY.h4, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 12 }}>Delivery &amp; clicks over time</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={TIMESERIES} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gDel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={DS.actionPrimary} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={DS.actionPrimary} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gClk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={DS.teal500} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={DS.teal500} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={DS.borderDefault} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: DS.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: DS.textSecondary }} axisLine={false} tickLine={false} />
                      <RTooltip />
                      <Legend />
                      <Area type="monotone" dataKey="delivered" name="Delivery %" stroke={DS.actionPrimary} fill="url(#gDel)" strokeWidth={2} />
                      <Area type="monotone" dataKey="clicks" name="Click %" stroke={DS.teal500} fill="url(#gClk)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Per-campaign table */}
                <StatTable rows={sent} onReport={setReportOf} />
              </>
            )}
          </>
        )}
      </div>

      {/* Per-campaign report side panel */}
      <Modal open={!!reportOf} onClose={() => setReportOf(null)} title={reportOf ? `Report — ${reportOf.name}` : ''}>
        {reportOf && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <KpiCard title="Messages sent" value={fmt(reportOf.messagesSent)} icon={<Ico.Sms s={18} c={DS.actionPrimary} />} />
              <KpiCard title="Delivery rate" value={pct(reportOf.deliveryRate)}
                       accent={reportOf.deliveryRate < 90 ? DS.feedbackWarning : DS.actionPrimary} icon={<Ico.TrendUp s={18} c={DS.actionPrimary} />} />
              <KpiCard title="Click rate" value={pct(reportOf.clickRate)}
                       accent={reportOf.clickRate < 1 ? DS.feedbackError : DS.actionPrimary} icon={<Ico.Chart s={18} c={DS.actionPrimary} />} />
            </div>
            <div>
              <div style={{ ...TY.h5, fontFamily: DS.ff, color: DS.textDefault, marginBottom: 8 }}>Sent message</div>
              <div style={{ background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`, borderRadius: 10,
                            padding: 14, ...TY.b2, fontFamily: DS.ff, color: DS.textDefault, whiteSpace: 'pre-wrap' }}>
                {resolveVars(reportOf.messageBody)}
              </div>
            </div>
            <div style={{ ...TY.b3, fontFamily: DS.ff, color: DS.textSecondary }}>
              Sender: {sndLabel(reportOf.senderId)} · Segment: {segName(reportOf.segmentId)} · Sent {reportOf.sendDate}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      {deleteOf && (
        <ConfirmDialog open title="Delete this campaign?"
          body={`"${deleteOf.name}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete" cancelLabel="Cancel" danger
          onCancel={() => setDeleteOf(null)}
          onConfirm={() => { const n = deleteOf.name; setDeleteOf(null); notify(`Deleted "${n.slice(0, 28)}…"`); }} />
      )}

      <Toast toast={toast} />
      <StatePreview groups={[{ label: 'State', value: state, onChange: setState,
        options: ['ready', 'loading', 'empty', 'error'] }]} />
    </div>
  );
}

export default SmsManagement;
