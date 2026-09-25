/**
 * Report Builder IA — split-view DIALOG (Analytics builder, Sales module)
 *
 * Spec: "Report Builder IA" · Area: Analytics / Dashboards · Fidelity: Clickable
 * Stories 1–4. This is not a page: the feature has ONE page (Dashboard.jsx) and
 * building a report happens in this dialog, opened from it. The dialog owns the
 * conversation; the page owns the saved cards.
 *
 * How it works: the agent is SCRIPTED (analyticsData.js › AGENT_SCRIPT). Free typing
 * is matched by loose keyword containment; anything unrecognised falls through to the
 * clarification flow rather than guessing — which is the behaviour the spec asks for
 * anyway. No LLM call, by design.
 *
 * The canvas renders ONLY from the WidgetSpec. The chat and the "Spec details" panel
 * are two editors over the same object, so story 2's "manual edit produces the same
 * result" criterion is structural rather than duplicated logic.
 *
 * ── OPEN QUESTIONS (flagged, not resolved — see the delivery report) ──────────
 *  1. Semantic-layer coverage at launch: this prototype publishes all three families
 *     (Ticketing, CRM, Marketing). If launch is ticketing + CRM only, drop the
 *     Marketing measures from MEASURES.                            (owner: PM)
 *  2. TOPN_THRESHOLD is 30 distinct values. Unvalidated on real data. (owner: PM/Data)
 *  3. Daily refresh against a past event: the countdown widget keeps decrementing
 *     into negatives here. Stop the job, or freeze the value?        (owner: PM)
 *  4. Widget ownership (org-wide vs creator-only) is not modelled — every widget is
 *     visible to everyone in this prototype.                         (owner: PM)
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Card from '../../components/Card';
import { Btn } from '../../components/Btn';
import { IconBtn } from '../../components/Iconbtn';
import { Field } from '../../components/Field';
import { Radio, Toggle } from '../../components/Controls';
import Select from '../../components/Select';
import Chip from '../../components/Chip';
import Modal from '../../components/Modal';
import Tooltip from '../../components/Tooltip';
import { EmptyState } from '../../components/Feedback';
import { WidgetView, WidgetSkeleton, CATALOGUE_TYPES } from './widgets';
import {
  MEASURES, DIMENSIONS, EVENTS, DASHBOARDS, RESOLVED_SPECS, SUGGESTIONS,
  STARTER_QUESTIONS, TOPN_THRESHOLD, AGENT_SCRIPT,
  DEGRADED_WIDGET,
  matchScript, applyPatch, measureById, dimensionById, widgetById,
} from './analyticsData';

let _uid = 1;
const uid = () => String(_uid++);

const SP = { page: 16, card: 20, gap: 16, tight: 12 };
const SHELL = { border: `1px solid ${DS.borderSection}`, borderRadius: 12, boxShadow: DS.shadowSm };

/* Corrections offered when an assumption chip is clicked. Keyed by a substring of
   the assumption; anything unmatched falls back to keep / drop. */
const ASSUMPTION_FIXES = [
  {
    match: 'confirmed',
    options: [
      {
        label: 'Include cancelled lines too',
        detail: 'Adds the 6 528 cancelled order lines back into the count',
        patch: {
          filters: [{ field: 'order_status', op: 'in', value: 'confirmed, cancelled' }],
          assumptions: ['Tickets = all order lines, cancelled included'],
        },
      },
      { label: 'Keep confirmed only', detail: 'No change to the spec', patch: null },
    ],
  },
  {
    match: 'visitor stand',
    options: [
      {
        label: 'Exclude the visitor stand',
        detail: 'Capacity drops from 29 778 to 29 000 seats',
        patch: { assumptions: ['Capacity excludes the 778 visitor seats'] },
      },
      { label: 'Keep it included', detail: 'No change to the spec', patch: null },
    ],
  },
];

function fixesFor(assumption) {
  const hit = ASSUMPTION_FIXES.find((f) => assumption.toLowerCase().includes(f.match));
  return hit ? hit.options : [
    { label: 'Keep this assumption', detail: 'No change to the spec', patch: null },
    { label: 'Drop it from the widget', detail: 'The assumption stops being shown under the chart', patch: { __dropAssumption: assumption } },
  ];
}

/* ── Chat pieces ────────────────────────────────────────────────────────────── */

function Bubble({ role, children }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '88%', padding: '10px 14px', borderRadius: 12,
        borderBottomRightRadius: isUser ? 4 : 12,
        borderBottomLeftRadius: isUser ? 12 : 4,
        background: isUser ? DS.brandPrimary : DS.surfaceSubtle,
        color: isUser ? DS.textOnBrand : DS.textDefault,
        ...TY.bodyMd, fontFamily: DS.ff, textAlign: 'left',
      }}>
        {children}
      </div>
    </div>
  );
}

function AgentAvatar() {
  return (
    <span style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      background: DS.brandPrimarySubtle, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Ico.AIicon s={16} c={DS.brandOnSurface} />
    </span>
  );
}

function Thinking({ label = 'The agent is building the report' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <AgentAvatar />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderRadius: 12, borderBottomLeftRadius: 4, background: DS.surfaceSubtle,
      }}>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 6, height: 6, borderRadius: 999, background: DS.textMuted,
              animation: `axThink 1.1s ${i * 0.16}s infinite ease-in-out`,
            }} />
          ))}
        </span>
        <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
      </div>
    </div>
  );
}

/* Clarification / nearest-field / type-change buttons. Never renders a widget —
   that is the whole point of story 3. */
function OptionButtons({ options, onPick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onPick(o)}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = DS.brandPrimary; e.currentTarget.style.background = DS.brandPrimarySubtle; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.borderDefault; e.currentTarget.style.background = DS.surfaceCanvas; }}
          style={{
            display: 'flex', flexDirection: 'column', gap: 2, width: '100%',
            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${DS.borderDefault}`, background: DS.surfaceCanvas,
            textAlign: 'left', fontFamily: DS.ff, transition: 'all .15s',
          }}
        >
          <span style={{ ...TY.labelLg, color: DS.textStrong }}>{o.label}</span>
          {o.detail && <span style={{ ...TY.captionSm, color: DS.textSecondary }}>{o.detail}</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Spec details panel — the manual editor over the same object ─────────────── */

function SpecRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{label}</span>
      {children}
    </div>
  );
}

function SpecPanel({ spec, onChange, open, setOpen }) {
  const dim = spec.dimension || {};
  const hasDimension = !!dim.id;

  const patch = (p) => onChange(applyPatch(spec, p));

  return (
    <div style={{ borderTop: `1px solid ${DS.borderSubtle}` }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          width: '100%', height: 48, padding: '0 4px', border: 'none', background: 'transparent',
          cursor: 'pointer', fontFamily: DS.ff, textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Ico.Code s={16} c={DS.textSecondary} />
          <span style={{ ...TY.bodyMdBold, color: DS.textStrong }}>Spec details</span>
          <span style={{ ...TY.captionSm, color: DS.textMuted }}>
            everything the agent resolved — editable
          </span>
        </span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s', display: 'inline-flex' }}>
          <Ico.ChevDown s={16} c={DS.textSecondary} />
        </span>
      </button>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP.gap, padding: '4px 4px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: SP.gap }}>
            <SpecRow label="Title">
              <Field value={spec.title} onChange={(v) => patch({ title: typeof v === 'string' ? v : v?.target?.value })} />
            </SpecRow>

            <SpecRow label="Visualisation type">
              <Select
                value={spec.type}
                options={CATALOGUE_TYPES.map((t) => ({ value: t, label: t }))}
                onChange={(v) => patch({ type: v })}
              />
            </SpecRow>

            <SpecRow label="Measure">
              <Select
                value={spec.measure?.id ?? ''}
                placeholder="No measure (countdown / text card)"
                options={MEASURES.map((m) => ({ value: m.id, label: `${m.label} · ${m.agg}` }))}
                onChange={(v) => patch({ measure: { id: v, agg: measureById(v)?.agg } })}
              />
            </SpecRow>

            <SpecRow label="Dimension">
              <Select
                value={dim.id ?? ''}
                placeholder="No dimension"
                options={DIMENSIONS.map((d) => ({
                  value: d.id,
                  label: `${d.label} · ${d.cardinality} values${d.cardinality > TOPN_THRESHOLD ? ' ⚠' : ''}`,
                }))}
                onChange={(v) => patch({ dimension: { id: v } })}
              />
            </SpecRow>

            {hasDimension && (
              <>
                <SpecRow label="Limit">
                  <Select
                    value={String(dim.limit ?? 10)}
                    options={[{ value: '5', label: '5' }, { value: '10', label: '10' }, { value: '15', label: '15' }]}
                    onChange={(v) => patch({ dimension: { limit: Number(v) } })}
                  />
                </SpecRow>
                <SpecRow label="Sort">
                  <Select
                    value={dim.sort ?? 'desc'}
                    options={[{ value: 'desc', label: 'Descending' }, { value: 'asc', label: 'Ascending' }]}
                    onChange={(v) => patch({ dimension: { sort: v } })}
                  />
                </SpecRow>
              </>
            )}

            <SpecRow label="Time window">
              <Select
                value={spec.time?.range ?? 'all_time'}
                options={[
                  { value: '7d', label: 'Last 7 days (rolling)' },
                  { value: '30d', label: 'Last 30 days (rolling)' },
                  { value: '90d', label: 'Last 90 days (rolling)' },
                  { value: 'season', label: 'Current season' },
                  { value: 'event_lifetime', label: 'Event lifetime' },
                  { value: 'all_time', label: 'All time' },
                ]}
                onChange={(v) => patch({ time: { ...(spec.time || {}), range: v } })}
              />
            </SpecRow>

            <SpecRow label="Refresh">
              <Select value={spec.refresh ?? 'daily'} disabled
                options={[{ value: 'daily', label: 'Daily — not configurable' }]} onChange={() => {}} />
            </SpecRow>
          </div>

          {hasDimension && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <Toggle
                on={!!dim.other_bucket}
                onChange={(v) => patch({ dimension: { other_bucket: v } })}
                label={'Group the tail into an "Other" bucket'}
              />
              {dimensionById(dim.id)?.cardinality > TOPN_THRESHOLD && (
                <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.feedbackWarning }}>
                  {dimensionById(dim.id).cardinality} distinct values — above the {TOPN_THRESHOLD}-value threshold
                </span>
              )}
            </div>
          )}

          {/* Filters */}
          <SpecRow label={`Filters (${spec.filters?.length ?? 0})`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {(spec.filters || []).map((f, i) => (
                <span key={`${f.field}-${i}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px 5px 10px',
                  borderRadius: 999, border: `1px solid ${DS.borderDefault}`, background: DS.surfaceSubtle,
                  ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong,
                }}>
                  {f.field} {f.op} {EVENTS.find((e) => e.id === f.value)?.name ?? f.value}
                  <button type="button" aria-label={`Remove filter on ${f.field}`}
                    onClick={() => patch({ filters: spec.filters.filter((_, j) => j !== i) })}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', padding: 0 }}>
                    <Ico.Cross s={12} c={DS.textSecondary} />
                  </button>
                </span>
              ))}
              <Select
                placeholder="Add an event filter"
                value=""
                width={220}
                options={EVENTS.map((e) => ({ value: e.id, label: e.name }))}
                onChange={(v) => patch({
                  filters: [...(spec.filters || []).filter((f) => f.field !== 'event_id'),
                            { field: 'event_id', op: 'eq', value: v }],
                })}
              />
            </div>
          </SpecRow>

          {/* Raw spec — what actually gets versioned on save */}
          <details>
            <summary style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, cursor: 'pointer' }}>
              Raw WidgetSpec JSON — this is what gets frozen and versioned on save
            </summary>
            <pre style={{
              margin: '8px 0 0', padding: 12, overflowX: 'auto',
              background: DS.surfaceSubtle, borderRadius: 8, border: `1px solid ${DS.borderSubtle}`,
              ...TY.monoMd, fontFamily: DS.ffm, color: DS.textDefault,
            }}>
              {JSON.stringify({ ...spec, dataKey: undefined }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

/* ── Save modal ─────────────────────────────────────────────────────────────── */

const SIZES = [
  { id: 'third', label: 'One third', detail: 'Compact — KPIs, gauges, countdowns' },
  { id: 'half', label: 'Half width', detail: 'Default — most charts' },
  { id: 'full', label: 'Full width', detail: 'Wide — long time series, big rankings' },
];

function SaveModal({ open, onClose, spec, saveState, onConfirm }) {
  const noDashboards = saveState === 'no-dashboards';
  const dashboards = noDashboards ? [] : DASHBOARDS;

  const [dashboardId, setDashboardId] = React.useState(dashboards[0]?.id ?? '');
  const [title, setTitle] = React.useState(spec?.title ?? '');
  const [size, setSize] = React.useState('half');
  const [freeze, setFreeze] = React.useState(false); // off by default, per the spec
  const [newName, setNewName] = React.useState('');

  // Reset only when the modal (re)opens — inputs must survive a failed save.
  React.useEffect(() => {
    if (open) { setTitle(spec?.title ?? ''); setDashboardId(dashboards[0]?.id ?? ''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, spec?.id]);

  const loading = saveState === 'loading';
  const failed = saveState === 'error';

  return (
    <Modal
      open={open}
      // Non-dismissable while saving — the spec is explicit about it.
      onClose={loading ? () => {} : onClose}
      variant="center"
      size="md"
      title="Save to a dashboard"
      footer={(
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Btn type="Secondary" size="Md" disabled={loading} onClick={onClose}>Cancel</Btn>
          <Btn
            type="Primary" size="Md"
            disabled={loading || (!dashboardId && !newName.trim())}
            iconLeft={loading ? undefined : <Ico.Save s={16} c={DS.textOnBrand} />}
            onClick={() => onConfirm({ dashboardId, title, size, freeze, newName })}
          >
            {loading ? 'Saving…' : 'Save widget'}
          </Btn>
        </div>
      )}
    >
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: SP.card }}>
        {failed && (
          <div style={{
            display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8,
            background: DS.feedbackErrorBg, border: `1px solid ${DS.feedbackError}`,
          }}>
            <Ico.Alert s={16} c={DS.feedbackError} />
            <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.feedbackErrorText ?? DS.red800 }}>
              Couldn&apos;t save the widget — the dashboard service did not respond. Your entries are
              still here; try again.
            </span>
          </div>
        )}

        {noDashboards ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>
              You have no dashboard yet. Name one and this widget becomes its first card.
            </span>
            <Field label="New dashboard name" value={newName} required
              placeholder="e.g. Match-day performance"
              onChange={(v) => setNewName(typeof v === 'string' ? v : v?.target?.value)} />
          </div>
        ) : (
          <Select
            label="Target dashboard"
            value={dashboardId}
            options={dashboards.map((d) => ({ value: d.id, label: `${d.name} · ${d.cardOrder.length} cards` }))}
            onChange={setDashboardId}
          />
        )}

        <Field label="Card title" required value={title}
          help="Pre-filled by the agent from the resolved spec."
          onChange={(v) => setTitle(typeof v === 'string' ? v : v?.target?.value)} />

        {/* Radio group — never a lone Radio (Principles 10:2) */}
        <div role="radiogroup" aria-label="Card size" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>Card size</span>
          {SIZES.map((s) => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <Radio name="card-size" value={s.id} checked={size === s.id} onChange={() => setSize(s.id)} />
              <span style={{ display: 'flex', flexDirection: 'column', marginTop: -2 }}>
                <span style={{ ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault }}>{s.label}</span>
                <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary }}>{s.detail}</span>
              </span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Toggle on={freeze} onChange={setFreeze} label="Freeze the dates on today" />
          <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary, paddingLeft: 46 }}>
            {freeze
              ? 'The window is pinned to today’s dates and stops moving.'
              : 'Off — the time window stays relative and rolls forward every day.'}
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
          borderRadius: 8, background: DS.feedbackInfoBg,
        }}>
          <Ico.Refresh s={16} c={DS.feedbackInfo} />
          <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>
            The spec is frozen and versioned on save, then re-run every night on fresh data.
          </span>
        </div>
      </div>
    </Modal>
  );
}

/* ── The dialog ─────────────────────────────────────────────────────────────── */
/*
 * Props:
 *   open, onClose      — controlled by the page
 *   initialWidget      — a saved widget id to load (story 6, "Edit in chat")
 *   degradedOnOpen     — open in degraded mode for that widget (story 6, error)
 *   demoState          — ready | loading | empty | error, driven by the page's
 *                        StatePreview so the builder's edge states stay demoable
 *   saveState          — ready | loading | error | no-dashboards, same idea
 *   onSaved(message)   — the page shows the confirmation and refreshes its grid
 */
export function ReportBuilderDialog({
  open, onClose, initialWidget = null, degradedOnOpen = false,
  demoState = 'ready', saveState = 'ready', onSaved,
}) {
  const [spec, setSpec] = React.useState(null);
  const [turns, setTurns] = React.useState([]);
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [recalculating, setRecalculating] = React.useState(false);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadingSpec, setLoadingSpec] = React.useState(false);
  const [degraded, setDegraded] = React.useState(null);

  const scrollRef = React.useRef(null);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  /* Keyframes for the thinking dots — injected once. */
  React.useEffect(() => {
    if (document.getElementById('ax-think-kf')) return;
    const el = document.createElement('style');
    el.id = 'ax-think-kf';
    el.textContent = '@keyframes axThink{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}';
    document.head.appendChild(el);
  }, []);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, thinking]);

  /* Story 6 — "Edit in chat" from a card hands the dialog a saved widget id. The
     split view shows its skeleton while the spec loads, then opens normally or in
     DEGRADED mode when a field it depends on was pulled from the semantic layer. */
  React.useEffect(() => {
    if (!open) return;

    // A fresh open with no widget starts an empty conversation.
    if (!initialWidget) {
      setSpec(null); setTurns([]); setDegraded(null); setLoadingSpec(false);
      return;
    }

    const saved = widgetById(initialWidget);
    if (!saved) return;

    setLoadingSpec(true);
    later(() => {
      setLoadingSpec(false);
      setSpec(saved.spec);

      if (degradedOnOpen && DEGRADED_WIDGET.widgetId === initialWidget) {
        setDegraded(DEGRADED_WIDGET);
        setTurns([{
          id: uid(), role: 'agent',
          text: `I opened "${saved.spec.title}" in degraded mode. The measure it was built on — "${DEGRADED_WIDGET.missingField.label}" — is no longer published in the semantic layer, so this card cannot refresh as it stands. The closest published measure is below.`,
          options: [
            {
              label: `Use "${DEGRADED_WIDGET.replacement.label}" instead`,
              detail: 'sum · € · Ticketing — the nearest published measure',
              patch: { measure: { id: DEGRADED_WIDGET.replacement.id, agg: 'sum' } },
            },
            { label: 'Leave it broken for now', detail: 'The card stays on the dashboard and keeps failing to refresh', patch: null },
          ],
        }]);
        return;
      }

      setDegraded(null);
      setTurns([{
        id: uid(), role: 'agent',
        text: `Loaded "${saved.spec.title}" from your dashboard. The spec is below — tell me what to change and I will patch it, or edit it by hand in the panel.`,
        chips: SUGGESTIONS[saved.spec.type] || [],
      }]);
    }, 700);
  }, [open, initialWidget, degradedOnOpen]);

  /* Story 1 error state — the agent explains the resolution failure and offers the
     nearest published fields. Driven from StatePreview so it is demoable. */
  React.useEffect(() => {
    if (!open || demoState !== 'error') return;
    const miss = AGENT_SCRIPT.find((s) => s.id === 'unknown_field_budget');
    setSpec(null);
    setTurns([
      { id: uid(), role: 'user', text: 'What was our marketing budget per event?' },
      { id: uid(), role: 'agent', text: miss.message, options: miss.options },
    ]);
  }, [open, demoState]);

  React.useEffect(() => {
    if (open && demoState === 'empty') { setSpec(null); setTurns([]); }
  }, [open, demoState]);

  const push = (turn) => setTurns((t) => [...t, { id: uid(), ...turn }]);

  /* ── The agent turn ──────────────────────────────────────────────────────── */

  const run = (text) => {
    if (!text.trim()) return;
    push({ role: 'user', text });
    setDraft('');

    const match = matchScript(text);
    const isPatch = match?.kind === 'patch';

    // A refinement keeps the previous widget on screen at reduced opacity while it
    // recalculates (story 2); a new build shows a skeleton instead.
    if (isPatch && spec) setRecalculating(true); else setThinking(true);

    later(() => {
      setThinking(false);
      setRecalculating(false);

      if (!match) {
        push({
          role: 'agent',
          text: 'I could not map that to anything in the semantic layer, and I will not guess. Pick a family and I will list what is published in it.',
          options: [
            { label: 'Ticketing measures', detail: 'Tickets sold, revenue, fill rate, refunds…', resolves: 'kpi_tickets' },
            { label: 'CRM measures', detail: 'Contacts, new contacts, opt-in rate…', resolves: 'topn_city' },
            { label: 'Marketing measures', detail: 'Emails sent, open rate, click rate…', resolves: 'funnel_campaign' },
          ],
        });
        return;
      }

      if (match.kind === 'patch') {
        if (!spec) {
          push({ role: 'agent', text: 'There is no widget in the canvas yet, so there is nothing to adjust. Ask me for a report first.' });
          return;
        }
        setSpec((s) => applyPatch(s, match.patch));
        push({ role: 'agent', text: match.message, chips: SUGGESTIONS[spec.type] || [] });
        return;
      }

      if (match.kind === 'widget') {
        const next = RESOLVED_SPECS[match.resolves];
        setSpec(next);
        push({ role: 'agent', text: match.message, chips: SUGGESTIONS[next.type] || [] });
        return;
      }

      if (match.kind === 'refuse') {
        push({
          role: 'agent', text: match.message,
          options: [{ label: 'Create a text card instead', detail: 'No metric, no chart — just the note', resolves: 'text_card' }],
        });
        return;
      }

      // clarify · field_miss · incompatible — nothing is rendered.
      push({ role: 'agent', text: match.message, options: match.options });
    }, isPatch ? 450 : 900);
  };

  const pickOption = (opt) => {
    push({ role: 'user', text: opt.label });
    setThinking(true);
    later(() => {
      setThinking(false);
      if (opt.patch === null) { push({ role: 'agent', text: 'Left as it was — the spec is unchanged.' }); return; }
      if (opt.patch) {
        setSpec((s) => {
          if (opt.patch.__dropAssumption) {
            return { ...s, assumptions: (s.assumptions || []).filter((a) => a !== opt.patch.__dropAssumption) };
          }
          return applyPatch(s, opt.patch);
        });
        setDegraded(null);
        push({ role: 'agent', text: 'Done — I patched the existing spec rather than rebuilding it, so everything else is untouched.' });
        return;
      }
      const next = RESOLVED_SPECS[opt.resolves];
      setSpec(next);
      push({
        role: 'agent',
        text: `Resolved as "${next.title}". The full spec is in the panel under the widget — check the assumptions before you save.`,
        chips: SUGGESTIONS[next.type] || [],
      });
    }, 800);
  };

  const clickAssumption = (a) => {
    push({ role: 'user', text: `About the assumption: "${a}"` });
    setThinking(true);
    later(() => {
      setThinking(false);
      push({ role: 'agent', text: `That assumption is mine, not yours — here is how to change it.`, options: fixesFor(a) });
    }, 500);
  };

  const confirmSave = ({ dashboardId, title, size, freeze, newName }) => {
    if (saveState === 'error' || saveState === 'no-dashboards') {
      // Keep the modal open and the entries intact — the spec is explicit.
      if (saveState === 'no-dashboards' && newName.trim()) {
        setSaveOpen(false);
        onSaved?.(`Created "${newName.trim()}" and saved "${title}" as its first card.`);
        onClose?.();
      }
      return;
    }
    setSubmitting(true);
    later(() => {
      setSubmitting(false);
      setSaveOpen(false);
      const dash = DASHBOARDS.find((d) => d.id === dashboardId);
      onSaved?.(`Saved "${title}" to ${dash?.name} · ${size} width · ${freeze ? 'dates frozen' : 'rolling dates'} · refreshed daily`, { dashboardId, size });
      onClose?.();
    }, 1100);
  };

  const canvasLoading = demoState === 'loading' || loadingSpec;
  const showWidget = !!spec && !canvasLoading;
  const lastAgent = [...turns].reverse().find((t) => t.role === 'agent');

  if (!open) return null;

  return (
    /* The save dialog is a SIBLING of the builder, not a child: both use the shared
       Modal at the same z-index, so DOM order is what puts the save step on top. */
    <>
      <Modal
        open
        onClose={onClose}
        variant="center"
        width={1280}
        title={initialWidget ? 'Edit report' : 'New report'}
        headerContent={(
          /* The DS modal header is the brand gradient, so this sits on white at
             ~85% — textMuted would fall below AA against it. */
          <span style={{
            ...TY.bodySm, fontFamily: DS.ff, color: 'rgba(255,255,255,0.88)',
            paddingBottom: 16, display: 'block', textAlign: 'left',
          }}>
            Describe the report you want — the agent builds it from the semantic layer,
            and never invents a field.
          </span>
        )}
        footer={(
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SP.tight, width: '100%' }}>
            <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary }}>
              {spec
                ? 'Relative windows roll forward daily. Freeze the dates in the save step for a fixed snapshot.'
                : 'Build a widget before saving.'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn type="Secondary" size="Md" onClick={onClose}>Cancel</Btn>
              <Btn type="Primary" size="Md" disabled={!spec}
                iconLeft={<Ico.Save s={16} c={spec ? DS.textOnBrand : DS.actionDisabledText} />}
                onClick={() => setSaveOpen(true)}>
                Save to a dashboard
              </Btn>
            </div>
          </div>
        )}
      >
      <div style={{ display: 'flex', gap: SP.gap, alignItems: 'stretch', height: '68vh', minHeight: 480, padding: SP.gap, boxSizing: 'border-box', fontFamily: DS.ff }}>

        {/* ── Chat, 40% ─────────────────────────────────────────────────────── */}
        <Card style={{ ...SHELL, flex: '0 0 40%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
            borderBottom: `1px solid ${DS.borderSubtle}`,
          }}>
            <AgentAvatar />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...TY.bodyMdBold, color: DS.textStrong }}>Report agent</span>
              <span style={{ ...TY.captionSm, color: DS.textMuted }}>
                {MEASURES.length} measures · {DIMENSIONS.length} dimensions published
              </span>
            </div>
          </div>

          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: SP.tight }}>
            {turns.length === 0 && !thinking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP.tight }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <AgentAvatar />
                  <Bubble role="agent">
                    Ask me for a report in plain language. I only build from published measures and
                    dimensions — I will never invent a field, and I will ask rather than guess when a
                    request is ambiguous.
                  </Bubble>
                </div>
                <div style={{ paddingLeft: 38, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ ...TY.captionSm, color: DS.textMuted }}>Try one of these:</span>
                  <OptionButtons
                    options={STARTER_QUESTIONS.map((q) => ({ label: q }))}
                    onPick={(o) => run(o.label)}
                  />
                </div>
              </div>
            )}

            {turns.map((t) => (
              <div key={t.id} style={{ display: 'flex', gap: 10, flexDirection: t.role === 'user' ? 'row-reverse' : 'row' }}>
                {t.role === 'agent' && <AgentAvatar />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Bubble role={t.role}>{t.text}</Bubble>
                  {t.options && <OptionButtons options={t.options} onPick={pickOption} />}
                </div>
              </div>
            ))}

            {thinking && <Thinking label={spec ? 'The agent is thinking' : 'The agent is building the report'} />}

            {/* Contextual suggestion chips under the last agent message */}
            {!thinking && lastAgent?.chips?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 38, marginTop: 2 }}>
                {lastAgent.chips.map((c) => (
                  <Chip key={c} label={c} onClick={() => run(c)} />
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <div style={{ padding: 16, borderTop: `1px solid ${DS.borderSubtle}`, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Field
                value={draft}
                placeholder="e.g. tickets sold by stand, revenue over the last 7 days…"
                onChange={(v) => setDraft(typeof v === 'string' ? v : v?.target?.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(draft); } }}
              />
            </div>
            <Tooltip label="Send to the agent">
              <IconBtn
                kind="Filled"
                size="Lg"
                aria-label="Send to the agent"
                disabled={!draft.trim() || thinking}
                icon={<Ico.Send s={18} c={DS.textInverse} />}
                onClick={() => run(draft)}
              />
            </Tooltip>
          </div>
        </Card>

        {/* ── Canvas, 60% ───────────────────────────────────────────────────── */}
        <Card style={{ ...SHELL, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: SP.card }}>
            {canvasLoading && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: SP.gap }}>
                  <Ico.Refresh s={16} c={DS.brandOnSurface} />
                  <span style={{ ...TY.bodySm, color: DS.textSecondary }}>The agent is building the report…</span>
                </div>
                <WidgetSkeleton height={280} />
              </>
            )}

            {!canvasLoading && !spec && (
              <EmptyState
                icon={<Ico.Chart s={24} c={DS.textMuted} />}
                title="Nothing to preview yet"
                sub="Ask the agent a question on the left. The widget will render here, with the full resolved spec underneath it."
              />
            )}

            {showWidget && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: SP.gap }}>
                {/* Degraded mode — a field this spec depends on is gone (story 6) */}
                {degraded && (
                  <div style={{
                    display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 8,
                    background: DS.feedbackWarningBg, border: `1px solid ${DS.feedbackWarning}`,
                  }}>
                    <Ico.Warn s={18} c={DS.feedbackWarning} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ ...TY.bodyMdBold, color: DS.textStrong }}>Degraded mode</span>
                      <span style={{ ...TY.bodySm, color: DS.textSecondary }}>
                        <code style={{ ...TY.monoMd, fontFamily: DS.ffm }}>{degraded.missingField.id}</code>
                        {' '}is no longer published in the semantic layer. The preview below uses the last
                        resolved spec and will not refresh until you swap the measure.
                      </span>
                    </div>
                  </div>
                )}

                {/* Widget header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: SP.tight }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...TY.titleMd, color: DS.textStrong }}>{spec.title}</div>
                    <div style={{ ...TY.captionSm, color: DS.textMuted, marginTop: 2 }}>
                      {spec.type}
                      {spec.measure && ` · ${measureById(spec.measure.id)?.label ?? spec.measure.id}`}
                      {spec.dimension?.id && ` by ${dimensionById(spec.dimension.id)?.label ?? spec.dimension.id}`}
                      {' · refreshed daily'}
                    </div>
                  </div>
                  <span style={{
                    ...TY.labelMd, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                    background: spec.confidence >= 0.85 ? DS.feedbackSuccessBg : DS.feedbackWarningBg,
                    color: spec.confidence >= 0.85 ? DS.feedbackSuccess : DS.feedbackWarning,
                  }}>
                    {Math.round((spec.confidence ?? 1) * 100)}% confidence
                  </span>
                </div>

                <WidgetView
                  spec={spec}
                  dimmed={recalculating}
                  onBodyChange={spec.type === 'text_card' ? (body) => setSpec((s) => ({ ...s, body })) : undefined}
                />

                {/* Assumptions — visible under the widget, clickable to correct */}
                {spec.assumptions?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ ...TY.labelMd, color: DS.textSecondary }}>
                      Assumptions the agent made — click one to change it
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {spec.assumptions.map((a) => (
                        <Chip key={a} label={a} icon={<Ico.Info s={14} c={DS.feedbackWarning} />}
                          color={DS.feedbackWarning} onClick={() => clickAssumption(a)} />
                      ))}
                    </div>
                  </div>
                )}

                <SpecPanel spec={spec} onChange={setSpec} open={panelOpen} setOpen={setPanelOpen} />
              </div>
            )}
          </div>

        </Card>
      </div>
      </Modal>

      <SaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        spec={spec}
        saveState={submitting ? 'loading' : saveState}
        onConfirm={confirmSave}
      />
    </>
  );
}

export default ReportBuilderDialog;
