/**
 * Insights, all batches: one mockup with every feature agreed so far
 * (session with Maxence, 21 October 2026), switchable per batch.
 *
 * The floating "Mockup" control at the bottom sets the batch (or ?batch=2 in
 * the URL, and ?tab=season for a tab): the page then
 * shows the product as it stands after that batch. "Checklist" lists the
 * features per batch; ticks are kept in this browser only.
 *
 * The Lot 1 prototype at /insights stays as it was (it is in the demo videos).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DS, TY } from '../../../utils/designSystem';
import Ico from '../../../utils/icons';
import PageHeader from '../../../components/PageHeader';
import { Btn } from '../../../components/Btn';
import IconBtn from '../../../components/Iconbtn';
import Tooltip from '../../../components/Tooltip';
import Tabs from '../../../components/Tabs';
import Select from '../../../components/Select';
import Modal from '../../../components/Modal';
import Card from '../../../components/Card';
import Toast from '../../../components/Toast';
import { EmptyState, ConfirmDialog } from '../../../components/Feedback';
import CardAll from './CardAll';
import BuilderAll from './BuilderAll';
import { NewCardChooser, ManualEditor } from './NewCard';
import { BATCHES, FEATURES, has } from './batches';
import { ACCOUNT, INITIAL_TABS, INITIAL_CARDS, COMPARISONS, cardAvailable, newId } from './mockDataAll';

const CHECK_KEY = 'insights-all-checklist';
const BATCH_KEY = 'insights-all-batch';
const readStore = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const writeStore = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked: ticks just don't persist */ } };

const query = () => { try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); } };

const tabWidth = (name) => Math.max(120, Math.round(name.length * 8.2) + 32);

function MockupControl({ batch, setBatch, onChecklist }) {
  return (
    <div style={{
      position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8,
      background: DS.bgCard, border: `1px solid ${DS.borderDefault}`, borderRadius: 12, padding: '6px 8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.14)', fontFamily: DS.ff,
    }}>
      <span style={{ ...TY.labelMd, color: DS.textSecondary, padding: '0 4px' }}>Mockup: product after</span>
      {BATCHES.map((b) => (
        <button key={b.value} type="button" onClick={() => setBatch(b.value)} title={b.sub}
                style={{
                  border: `1px solid ${b.value === batch ? DS.actionPrimary : DS.borderDefault}`,
                  background: b.value === batch ? DS.actionPrimary : DS.bgCard,
                  color: b.value === batch ? DS.textInverse : DS.textStrong,
                  borderRadius: 8, padding: '5px 10px', cursor: 'pointer', ...TY.labelMd, fontFamily: DS.ff,
                }}>
          {b.label}
        </button>
      ))}
      <Btn type="Ghost" size="Sm" iconLeft={<Ico.Check s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }} onClick={onChecklist}>Checklist</Btn>
    </div>
  );
}

function Checklist({ open, batch, checks, setChecks, onClose, setBatch }) {
  const done = FEATURES.filter((f) => checks[f.id]).length;
  return (
    <Modal open={open} onClose={onClose} title="Feature checklist" width={440}
           footer={<><span style={{ flex: 1, ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{done} of {FEATURES.length} ticked</span><Btn type="Secondary" onClick={onClose}>Close</Btn></>}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: DS.ff }}>
        <span style={{ ...TY.bodySm, color: DS.textSecondary }}>
          Tick a feature when it works in the mockup, or later when it is built. Ticks are saved in this browser only.
        </span>
        {BATCHES.map((b) => (
          <div key={b.value} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...TY.labelLg, color: DS.textStrong, flex: 1 }}>{b.label}: {b.sub}</span>
              <Btn type="Ghost" size="Sm" style={{ color: DS.actionPrimary }} onClick={() => { setBatch(b.value); onClose(); }}>
                {b.value === batch ? 'Showing' : 'Show'}
              </Btn>
            </div>
            {FEATURES.filter((f) => f.batch === b.value).map((f) => (
              <label key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', ...TY.bodySm, color: DS.textDefault }}>
                <input type="checkbox" checked={!!checks[f.id]} onChange={(e) => setChecks({ ...checks, [f.id]: e.target.checked })} style={{ marginTop: 2 }} />
                <span style={{ textDecoration: checks[f.id] ? 'line-through' : 'none', color: checks[f.id] ? DS.textMuted : DS.textDefault }}>{f.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function InsightsAll() {
  const navigate = useNavigate();
  const [batch, setBatchState] = React.useState(() => { const q = Number(query().get('batch')); return [1, 2, 3].includes(q) ? q : readStore(BATCH_KEY, 1); });
  const [checks, setChecksState] = React.useState(() => readStore(CHECK_KEY, {}));
  const [checklistOpen, setChecklistOpen] = React.useState(false);
  const [tabs] = React.useState(INITIAL_TABS);
  const [activeTab, setActiveTab] = React.useState(() => query().get('tab') || 'fanbase');
  const [cards, setCards] = React.useState(INITIAL_CARDS);
  const [comparison, setComparison] = React.useState('yesterday');
  const [chooser, setChooser] = React.useState(false);
  const [builder, setBuilder] = React.useState(null);  // null | { initial }
  const [manual, setManual] = React.useState(null);    // null | { initial }
  const [deleteCard, setDeleteCard] = React.useState(null);
  const [highlight, setHighlight] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [drag, setDrag] = React.useState({ id: null, over: null });

  const setBatch = (b) => { setBatchState(b); writeStore(BATCH_KEY, b); };
  const setChecks = (c) => { setChecksState(c); writeStore(CHECK_KEY, c); };
  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const visibleTabs = tabs.filter((t) => !t.needs || has(batch, t.needs));
  const tab = visibleTabs.find((t) => t.id === activeTab) ?? visibleTabs[0];
  const tabCards = cards.filter((c) => c.tab === tab.id && cardAvailable(c, batch));
  const hiddenHere = cards.filter((c) => c.tab === tab.id && !cardAvailable(c, batch)).length;

  const flash = (id) => { setHighlight(id); setTimeout(() => setHighlight(null), 1800); };

  const saveCard = (data, tabId) => {
    if (data.id) {
      setCards((cs) => cs.map((c) => (c.id === data.id ? { ...c, ...data, tab: tabId } : c)));
      flash(data.id);
    } else {
      const id = newId();
      setCards((cs) => [...cs, { ...data, id, tab: tabId }]);
      flash(id);
    }
    setActiveTab(tabId); setBuilder(null); setManual(null);
    notify(`Card saved to ${tabs.find((t) => t.id === tabId)?.name}`);
  };

  const edit = (card) => (card.kind === 'manualData' || card.kind === 'text' ? setManual({ initial: card }) : setBuilder({ initial: card }));

  const duplicate = (card) => {
    const id = newId();
    setCards((cs) => [...cs, { ...card, id, title: `${card.title} (copy)` }]);
    flash(id);
  };

  const move = (card, tabId) => {
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, tab: tabId } : c)));
    notify(`Moved to ${tabs.find((t) => t.id === tabId)?.name}`);
  };

  const openSegment = (card) => {
    navigate('/contacts', { state: { fromCard: { title: card.title, count: card.value, conditions: card.conditions } } });
  };

  /* Drag-and-drop (Batch 3): drop a card on another card to put it there. */
  const dropOn = (overId) => {
    const from = drag.id;
    setDrag({ id: null, over: null });
    if (!from || from === overId) return;
    setCards((cs) => {
      const moving = cs.find((c) => c.id === from);
      const rest = cs.filter((c) => c.id !== from);
      const at = rest.findIndex((c) => c.id === overId);
      rest.splice(at, 0, moving);
      return rest;
    });
  };
  const dragProps = (id) => ({
    draggable: true,
    onDragStart: (e) => { e.dataTransfer.effectAllowed = 'move'; setDrag({ id, over: null }); },
    onDragOver: (e) => { e.preventDefault(); if (drag.over !== id) setDrag((d) => ({ ...d, over: id })); },
    onDrop: (e) => { e.preventDefault(); dropOn(id); },
    onDragEnd: () => setDrag({ id: null, over: null }),
  });

  return (
    <div style={{ fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 64 }}>
      <PageHeader
        title="Insights"
        description={`${ACCOUNT.name} · your key numbers, built by you`}
        actions={<Btn type="Primary" iconLeft={<Ico.Plus s={16} c={DS.textInverse} />} onClick={() => setChooser(true)}>Make new card</Btn>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${DS.borderDefault}`, flexWrap: 'wrap' }}>
        <Tabs value={tab.id} onChange={setActiveTab} tabs={visibleTabs.map((t) => ({ value: t.id, label: t.name, width: tabWidth(t.name) }))} />
        <Tooltip label="Add a tab">
          <IconBtn icon={<Ico.Plus s={16} />} kind="Ghost" size="Sm" aria-label="Add a tab" onClick={() => notify('Tabs work as in the Lot 1 prototype')} />
        </Tooltip>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <Select label="Compare with" value={comparison} options={COMPARISONS} width={260} onChange={setComparison} />
        {has(batch, 'dnd') && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...TY.bodySm, color: DS.textSecondary, paddingBottom: 8 }}>
            <Ico.Drag s={14} c={DS.textMuted} /> Drag a card to move it
          </span>
        )}
      </div>

      {tabCards.length === 0 ? (
        <Card style={{ padding: 8 }}>
          <EmptyState icon={<Ico.Chart s={24} c={DS.textSecondary} />} title="No cards on this tab yet." sub="Make a card, or move one here." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
          {tabCards.map((c) => (
            <CardAll
              key={c.id} card={c} comparison={comparison} batch={batch} tabs={visibleTabs}
              highlight={highlight === c.id}
              onEdit={edit} onDuplicate={duplicate} onMove={move} onDelete={setDeleteCard} onOpenSegment={openSegment}
              dragProps={dragProps(c.id)} dragging={drag.id === c.id} dropHint={drag.id && drag.over === c.id && drag.id !== c.id}
            />
          ))}
        </div>
      )}

      {hiddenHere > 0 && (
        <span style={{ ...TY.bodySm, color: DS.textMuted }}>
          {hiddenHere} more {hiddenHere === 1 ? 'card' : 'cards'} on this tab {hiddenHere === 1 ? 'needs' : 'need'} a later batch.
        </span>
      )}

      <NewCardChooser
        open={chooser} batch={batch} onClose={() => setChooser(false)}
        onChoose={(c) => { setChooser(false); if (c.kind === 'custom') setBuilder({ initial: null }); else setManual({ initial: { kind: c.kind } }); }}
      />
      <BuilderAll
        open={!!builder} initial={builder?.initial} batch={batch} tabs={visibleTabs} defaultTab={tab.id} comparison={comparison}
        onClose={() => setBuilder(null)} onSave={saveCard}
      />
      <ManualEditor
        open={!!manual} initial={manual?.initial} tabs={visibleTabs} defaultTab={tab.id}
        onClose={() => setManual(null)} onSave={saveCard}
      />
      <ConfirmDialog
        open={!!deleteCard} title="Delete this card?"
        body={deleteCard ? `"${deleteCard.title}" disappears for everyone at ${ACCOUNT.name}.` : ''}
        confirmLabel="Delete" danger
        onConfirm={() => { setCards((cs) => cs.filter((c) => c.id !== deleteCard.id)); setDeleteCard(null); notify('Card deleted'); }}
        onCancel={() => setDeleteCard(null)}
      />
      <Checklist open={checklistOpen} batch={batch} checks={checks} setChecks={setChecks} setBatch={setBatch} onClose={() => setChecklistOpen(false)} />
      <MockupControl batch={batch} setBatch={setBatch} onChecklist={() => setChecklistOpen(true)} />
      <Toast toast={toast} />
    </div>
  );
}
