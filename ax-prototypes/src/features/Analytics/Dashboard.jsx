/**
 * Analytics builder — the feature's ONLY page (Sales module)
 *
 * Spec: "Report Builder IA" · Stories 5 and 6, and the entry point for 1–4.
 * PAGE ONLY — shell lives in layout/*.
 *
 * Building a report is a DIALOG, not a second page: "New report" and a card's
 * "Edit in chat" both open ReportBuilderDialog over this grid. The page owns the
 * saved cards and every demo-state toggle; the dialog owns the conversation.
 *
 * Drag & drop and resize are real, not simulated: cards are HTML5-draggable to
 * reorder, and each card carries a right-edge handle that snaps its width to the
 * three published sizes (1/3, 1/2, full) as you drag. The grid is 6 columns, so
 * third = 2, half = 3, full = 6.
 *
 * Card refresh states, all three visible at once on "Audience & campaigns" and
 * "Match-day performance":
 *   ok     — freshness badge, live value
 *   stale  — daily job failed: last known value greyed, last success timestamped,
 *            Retry offered
 *   empty  — query valid, zero rows (wgt_11)
 *
 * ⚠ OPEN QUESTION 4 (owner: PM): widgets here are org-wide. Whether a widget belongs
 * to its creator or to the organisation is undecided, so there is no owner column.
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import { Btn } from '../../components/Btn';
import Select from '../../components/Select';
import ActionMenu from '../../components/ActionMenu';
import Toast from '../../components/Toast';
import Tooltip from '../../components/Tooltip';
import StatePreview from '../../components/StatePreview';
import { StatusChip } from '../../components/Tag';
import { EmptyState, ConfirmDialog } from '../../components/Feedback';
import { WidgetView, WidgetSkeleton } from './widgets';
import { ReportBuilderDialog } from './ReportBuilder';
import {
  DASHBOARDS, SAVED_WIDGETS, EVENTS, SHARED_WIDGETS, GLOBAL_FILTER_INCOMPATIBLE,
  SERIES, freshness, widgetById,
} from './analyticsData';

const SP = { page: 16, card: 16, gap: 16, tight: 12 };
const SHELL = { border: `1px solid ${DS.borderSection}`, borderRadius: 12, boxShadow: DS.shadowSm };

const SPAN = { third: 2, half: 3, full: 6 };
const SIZE_LABEL = { third: 'One third', half: 'Half width', full: 'Full width' };

/* ── Freshness badge ────────────────────────────────────────────────────────── */
/* StatusChip (DS 524:80) carries a controlled business state — here, the refresh
   status of the nightly job. Its four tones map onto our three outcomes. */

function FreshnessBadge({ widget }) {
  if (widget.refreshStatus === 'stale') {
    return (
      <Tooltip label={`Last successful refresh: ${new Date(widget.lastSuccessAt).toLocaleString('en-GB')}`}>
        <StatusChip status="archived">Stale · {freshness(widget.lastSuccessAt)}</StatusChip>
      </Tooltip>
    );
  }
  const data = widget.spec.dataKey ? SERIES[widget.spec.dataKey] : null;
  if (Array.isArray(data) && data.length === 0) {
    return <StatusChip status="inactive">No rows · {freshness(widget.updatedAt)}</StatusChip>;
  }
  return <StatusChip status="active">{freshness(widget.updatedAt)}</StatusChip>;
}

/* ── One card ───────────────────────────────────────────────────────────────── */

function WidgetCard({
  widget, size, loading, dragging, dropTarget, incompatible,
  onDragStart, onDragOver, onDragEnd, onDrop,
  onResizeStart, onEdit, onDuplicate, onDelete, onRetry,
}) {
  const stale = widget.refreshStatus === 'stale';

  return (
    <div
      draggable={!loading}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      style={{
        gridColumn: `span ${SPAN[size]}`,
        opacity: dragging ? 0.4 : 1,
        transition: 'opacity .15s ease',
      }}
    >
      <Card style={{
        ...SHELL, padding: 0, height: '100%', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        outline: dropTarget ? `2px solid ${DS.brandPrimary}` : 'none',
        outlineOffset: -1,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: SP.tight,
          padding: '14px 14px 10px 10px',
        }}>
          <span
            title="Drag to reorder"
            style={{ cursor: loading ? 'default' : 'grab', paddingTop: 2, display: 'inline-flex', flexShrink: 0 }}
          >
            <Ico.Drag s={16} c={DS.textMuted} />
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...TY.bodyMdBold, fontFamily: DS.ff, color: DS.textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              title={widget.spec.title}>
              {widget.spec.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {loading ? null : <FreshnessBadge widget={widget} />}
              <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>
                {widget.spec.type}
              </span>
            </div>
          </div>

          <ActionMenu
            size="Sm"
            items={[
              { label: 'Edit in chat', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: onEdit },
              { label: 'Duplicate', icon: <Ico.Copy s={16} c={DS.textSecondary} />, onClick: onDuplicate },
              { label: 'Delete', icon: <Ico.Trash s={16} c={DS.feedbackError} />, danger: true, onClick: onDelete },
            ]}
          />
        </div>

        {/* A global filter that cannot apply to this card's dimensions is stated,
           not silently dropped. */}
        {incompatible && !loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, margin: '0 14px 10px',
            padding: '6px 10px', borderRadius: 6, background: DS.feedbackWarningBg,
          }}>
            <Ico.Warn s={14} c={DS.feedbackWarning} />
            <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textSecondary }}>
              The event filter does not apply here — this card has no event dimension.
            </span>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, padding: '0 14px 14px' }}>
          {loading ? (
            <WidgetSkeleton height={200} />
          ) : stale ? (
            <div>
              {/* Last known value, greyed — the card does not pretend to be current. */}
              <div style={{ opacity: 0.45, filter: 'grayscale(1)', pointerEvents: 'none' }}>
                <WidgetView spec={widget.spec} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: SP.tight, marginTop: SP.tight, padding: '10px 12px', borderRadius: 8,
                background: DS.feedbackErrorBg, border: `1px solid ${DS.feedbackError}`, flexWrap: 'wrap',
              }}>
                <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.feedbackErrorText ?? DS.red800, flex: 1, minWidth: 180 }}>
                  {widget.failureReason}. Showing the last successful values, from{' '}
                  {new Date(widget.lastSuccessAt).toLocaleString('en-GB')}.
                </span>
                <Btn type="Secondary" size="Sm" iconLeft={<Ico.Refresh s={14} />} onClick={onRetry}>
                  Retry
                </Btn>
              </div>
            </div>
          ) : (
            <WidgetView spec={widget.spec} />
          )}
        </div>

        {/* Resize handle — snaps to the three published sizes while dragging. */}
        {!loading && (
          <div
            onMouseDown={onResizeStart}
            title={`${SIZE_LABEL[size]} — drag to resize`}
            style={{
              position: 'absolute', top: 0, right: 0, width: 10, height: '100%',
              cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ width: 3, height: 28, borderRadius: 999, background: DS.borderDefault }} />
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default function AnalyticsBuilder() {
  const [state, setState] = React.useState('ready');             // ready | loading | empty
  const [builderState, setBuilderState] = React.useState('ready'); // ready | loading | empty | error
  const [saveState, setSaveState] = React.useState('ready');       // ready | loading | error | no-dashboards

  /* The builder dialog. `widget` is the saved card being edited, null for a new one. */
  const [builder, setBuilder] = React.useState({ open: false, widget: null, degraded: false });
  const openBuilder = (widget = null, degraded = false) => setBuilder({ open: true, widget, degraded });
  const closeBuilder = () => setBuilder((b) => ({ ...b, open: false }));

  const [dashboardId, setDashboardId] = React.useState('dsh_1');
  const [period, setPeriod] = React.useState('30d');
  const [eventId, setEventId] = React.useState('evt_442');
  const [toast, setToast] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);

  /* Live card model, seeded from the saved widgets. Order and size are local so
     drag & drop and resize actually persist for the session. */
  const [layout, setLayout] = React.useState(() =>
    Object.fromEntries(DASHBOARDS.map((d) => [
      d.id,
      d.cardOrder.map((id) => ({ id, size: widgetById(id)?.size ?? 'half' })),
    ])));

  const [dragIndex, setDragIndex] = React.useState(null);
  const [overIndex, setOverIndex] = React.useState(null);
  const gridRef = React.useRef(null);
  const resizing = React.useRef(null);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const dashboard = DASHBOARDS.find((d) => d.id === dashboardId);
  const isEmpty = state === 'empty' || dashboardId === 'dsh_3';
  const loading = state === 'loading';
  const cards = layout[dashboardId] ?? [];

  const flash = (msg) => { setToast(msg); later(() => setToast(null), 3000); };

  /* ── Drag to reorder ─────────────────────────────────────────────────────── */

  const handleDrop = (index) => {
    if (dragIndex == null || dragIndex === index) { setDragIndex(null); setOverIndex(null); return; }
    setLayout((l) => {
      const next = [...l[dashboardId]];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return { ...l, [dashboardId]: next };
    });
    setDragIndex(null);
    setOverIndex(null);
    flash('Card order saved.');
  };

  /* ── Drag to resize — snaps to third / half / full ───────────────────────── */

  const startResize = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    const colWidth = (gridRef.current?.offsetWidth ?? 1200) / 6;
    resizing.current = { index, startX: e.clientX, startSize: cards[index].size, colWidth };

    const onMove = (ev) => {
      const r = resizing.current;
      if (!r) return;
      const deltaCols = Math.round((ev.clientX - r.startX) / r.colWidth);
      const startSpan = SPAN[r.startSize];
      const target = Math.min(6, Math.max(2, startSpan + deltaCols));
      // Snap the free span onto the nearest published size.
      const size = target <= 2 ? 'third' : target <= 4 ? 'half' : 'full';
      r.lastSize = size; // read back on mouseup — `layout` in this closure is stale
      setLayout((l) => {
        const arr = l[dashboardId];
        if (arr[r.index].size === size) return l;
        const next = [...arr];
        next[r.index] = { ...next[r.index], size };
        return { ...l, [dashboardId]: next };
      });
    };

    const onUp = () => {
      const r = resizing.current;
      resizing.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (r?.lastSize && r.lastSize !== r.startSize) {
        flash(`Card resized to ${SIZE_LABEL[r.lastSize].toLowerCase()}.`);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  /* ── Card actions ────────────────────────────────────────────────────────── */

  const editInChat = (id) => {
    // wgt_09 opens degraded on purpose — one of its fields was pulled from the
    // semantic layer (story 6's error state).
    openBuilder(id, id === 'wgt_09');
  };

  const duplicate = (index) => {
    setLayout((l) => {
      const next = [...l[dashboardId]];
      next.splice(index + 1, 0, { ...next[index], id: next[index].id, copyOf: next[index].id, key: `copy-${Date.now()}` });
      return { ...l, [dashboardId]: next };
    });
    flash('Duplicated as an independent copy — editing it will not touch the original.');
  };

  const askDelete = (card, index) => {
    const shared = SHARED_WIDGETS.includes(card.id);
    setConfirm({
      index,
      title: shared ? 'Delete a card used on several dashboards?' : 'Delete this card?',
      body: shared
        ? `"${widgetById(card.id)?.spec.title}" also appears on another dashboard. Deleting it here removes it from this dashboard only — the other copy keeps running. This cannot be undone.`
        : `"${widgetById(card.id)?.spec.title}" will be removed from ${dashboard?.name}. This cannot be undone.`,
    });
  };

  const doDelete = () => {
    setLayout((l) => ({ ...l, [dashboardId]: l[dashboardId].filter((_, i) => i !== confirm.index) }));
    setConfirm(null);
    flash('Card deleted.');
  };

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SP.page, fontFamily: DS.ff }}>
      <StatePreview groups={[
        { label: 'Dashboard', value: state, onChange: setState, options: ['ready', 'loading', 'empty'] },
        { label: 'Builder', value: builderState, onChange: setBuilderState, options: ['ready', 'loading', 'empty', 'error'] },
        { label: 'Save flow', value: saveState, onChange: setSaveState, options: ['ready', 'loading', 'error', 'no-dashboards'] },
      ]} />

      <PageHeader
        title="Analytics builder"
        description="Describe a report in plain language and it becomes a card, refreshed every night"
        actions={(
          <Btn type="Primary" size="Md" iconLeft={<Ico.AIicon s={16} c={DS.textOnBrand} />}
            onClick={() => openBuilder()}>
            New report
          </Btn>
        )}
      />

      {/* Global filter bar — Toolbar pattern: Select + Chip, never a primary CTA */}
      <Card style={{ ...SHELL, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SP.tight, flexWrap: 'wrap' }}>
          <Select
            value={dashboardId}
            width={260}
            options={DASHBOARDS.map((d) => ({ value: d.id, label: d.name }))}
            onChange={setDashboardId}
          />
          <span style={{ width: 1, height: 24, background: DS.borderDefault }} />
          <Select
            value={period}
            width={180}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: 'season', label: 'Current season' },
            ]}
            onChange={setPeriod}
          />
          <Select
            value={eventId}
            width={280}
            options={[{ value: 'all', label: 'All events' },
                      ...EVENTS.map((e) => ({ value: e.id, label: e.name }))]}
            onChange={setEventId}
          />
          <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted, marginLeft: 'auto' }}>
            Global filters override a card&apos;s own filters where the dimensions allow it.
          </span>
        </div>
      </Card>

      {/* Grid */}
      {isEmpty ? (
        <Card style={{ ...SHELL, padding: SP.card }}>
          <EmptyState
            icon={<Ico.Chart s={24} c={DS.textMuted} />}
            title="No cards on this dashboard yet"
            sub="Describe the report you want in the Analytics builder and save it here. It then refreshes every night on fresh data."
            cta={(
              <Btn type="Primary" size="Md" iconLeft={<Ico.AIicon s={16} c={DS.textOnBrand} />}
                onClick={() => openBuilder()}>
                Build your first report
              </Btn>
            )}
          />
        </Card>
      ) : (
        <div
          ref={gridRef}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: SP.gap, alignItems: 'stretch' }}
        >
          {cards.map((card, i) => {
            const widget = widgetById(card.id);
            if (!widget) return null;
            const incompatible = eventId !== 'all'
              && GLOBAL_FILTER_INCOMPATIBLE.eventId.includes(card.id);
            return (
              <WidgetCard
                key={card.key ?? card.id}
                widget={widget}
                size={card.size}
                // Progressive loading: cards resolve one after another, not all at once.
                loading={loading && i > 1}
                dragging={dragIndex === i}
                dropTarget={overIndex === i && dragIndex !== i}
                incompatible={incompatible}
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
                onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                onDrop={(e) => { e.preventDefault(); handleDrop(i); }}
                onResizeStart={(e) => startResize(i, e)}
                onEdit={() => editInChat(card.id)}
                onDuplicate={() => duplicate(i)}
                onDelete={() => askDelete(card, i)}
                onRetry={() => flash('Refresh queued — the connector will be retried within the hour.')}
              />
            );
          })}
        </div>
      )}

      <ReportBuilderDialog
        open={builder.open}
        onClose={closeBuilder}
        initialWidget={builder.widget}
        degradedOnOpen={builder.degraded}
        demoState={builderState}
        saveState={saveState}
        onSaved={(message) => flash(message)}
      />

      {confirm && (
        <ConfirmDialog
          open
          danger
          title={confirm.title}
          body={confirm.body}
          confirmLabel="Delete card"
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
