/**
 * Insight Cards: Lot 1 (1a + 1b), the Insights page.
 *
 * Spec: specs/insight-cards/lot-1/insight-cards-lot-1-llm.md
 *
 * Themed tabs of cards per client account (L3 decision 1), one Period +
 * Comparison per tab driving every card, a side-panel builder (CardBuilder)
 * and "Open as segment" into Contacts on cards that count people.
 *
 * In the product "Insights" is an item in the top menu (IC5, not agreed yet);
 * here it is a sidebar entry like every other prototype.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import PageHeader from '../../components/PageHeader';
import { Btn } from '../../components/Btn';
import IconBtn from '../../components/Iconbtn';
import Tooltip from '../../components/Tooltip';
import Tabs from '../../components/Tabs';
import Select from '../../components/Select';
import ActionMenu from '../../components/ActionMenu';
import Modal from '../../components/Modal';
import { Field } from '../../components/Field';
import Card from '../../components/Card';
import Toast from '../../components/Toast';
import StatePreview from '../../components/StatePreview';
import { EmptyState, ErrorState, ConfirmDialog } from '../../components/Feedback';
import InsightCard, { CardSkeleton } from './InsightCard';
import CardBuilder from './CardBuilder';
import {
  ACCOUNT, INITIAL_TABS, INITIAL_CARDS, PERIODS, COMPARISONS, EXAMPLE_CARDS,
  MAX_TABS, MAX_CARDS_PER_TAB, newId,
} from './mockData';

const tabWidth = (name) => Math.max(120, Math.round(name.length * 8.2) + 32);

export default function InsightCards() {
  const navigate = useNavigate();
  const [state, setState] = React.useState('ready');
  const [tabs, setTabs] = React.useState(INITIAL_TABS);
  const [activeTab, setActiveTab] = React.useState('season');
  const [cards, setCards] = React.useState(INITIAL_CARDS);
  const [builder, setBuilder] = React.useState(null); // null | { initial }
  const [highlight, setHighlight] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [deleteCard, setDeleteCard] = React.useState(null);
  const [tabModal, setTabModal] = React.useState(null); // null | { mode: 'rename' | 'delete', id }
  const [tabName, setTabName] = React.useState('');
  const [moveTarget, setMoveTarget] = React.useState('');

  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const tab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const tabCards = cards.filter((c) => c.tab === tab.id);
  const cardCap = tabCards.length >= MAX_CARDS_PER_TAB;
  const tabCap = tabs.length >= MAX_TABS;

  /* Period + Comparison are remembered per tab (L3 decision 7). */
  const patchTab = (id, p) => setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const addTab = () => {
    const id = `t${Date.now()}`;
    setTabs((ts) => [...ts, { id, name: `New tab ${ts.length - 3 > 0 ? ts.length - 3 : ''}`.trim(), period: 'season', comparison: 'lastSeason' }]);
    setActiveTab(id);
  };

  const moveTab = (dir) => setTabs((ts) => {
    const i = ts.findIndex((t) => t.id === tab.id);
    const j = i + dir;
    if (j < 0 || j >= ts.length) return ts;
    const next = [...ts];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const openBuilder = (initial = null) => setBuilder({ initial });

  const saveCard = (data, tabId) => {
    if (data.id) {
      setCards((cs) => cs.map((c) => (c.id === data.id ? { ...c, ...data, tab: tabId, values: c.values && data.value === c.values?.[tab.period]?.[0] ? c.values : undefined } : c)));
      setHighlight(data.id);
    } else {
      const id = newId();
      setCards((cs) => [...cs, { ...data, id, tab: tabId, createdBy: 'camille', createdAt: 'today' }]);
      setHighlight(id);
    }
    setActiveTab(tabId);
    setBuilder(null);
    notify(`Card saved to ${tabs.find((t) => t.id === tabId)?.name}`);
    setTimeout(() => setHighlight(null), 1800);
  };

  const duplicate = (card) => {
    if (cards.filter((c) => c.tab === card.tab).length >= MAX_CARDS_PER_TAB) { notify('This tab is full (12 cards).'); return; }
    const id = newId();
    setCards((cs) => [...cs, { ...card, id, title: `${card.title} (copy)` }]);
    setHighlight(id);
    setTimeout(() => setHighlight(null), 1800);
  };

  const move = (card, tabId) => {
    setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, tab: tabId } : c)));
    notify(`Moved to ${tabs.find((t) => t.id === tabId)?.name}`);
  };

  const openSegment = (card, value) => {
    navigate('/contacts', { state: { fromCard: { title: card.title, count: value, conditions: card.conditions } } });
  };

  const tabMenu = [
    { label: 'Rename tab', icon: <Ico.Edit s={16} c={DS.textSecondary} />, onClick: () => { setTabName(tab.name); setTabModal({ mode: 'rename', id: tab.id }); } },
    { label: 'Move left', icon: <Ico.ChevLeft s={16} c={DS.textSecondary} />, onClick: () => moveTab(-1), disabled: tabs[0].id === tab.id },
    { label: 'Move right', icon: <Ico.ChevRight s={16} c={DS.textSecondary} />, onClick: () => moveTab(1), disabled: tabs[tabs.length - 1].id === tab.id },
    { label: 'Delete tab', icon: <Ico.Trash s={16} c={DS.actionDanger} />, danger: true, disabled: tabs.length === 1,
      onClick: () => { setMoveTarget(tabs.find((t) => t.id !== tab.id)?.id ?? ''); setTabModal({ mode: 'delete', id: tab.id }); } },
  ];

  const deleteTab = (moveCards) => {
    const id = tabModal.id;
    setCards((cs) => (moveCards ? cs.map((c) => (c.tab === id ? { ...c, tab: moveTarget } : c)) : cs.filter((c) => c.tab !== id)));
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    setActiveTab(moveCards ? moveTarget : rest[0].id);
    setTabModal(null);
    notify('Tab deleted');
  };

  const makeBtn = (
    <Btn type="Primary" iconLeft={<Ico.Plus s={16} c={DS.textInverse} />} disabled={cardCap || state !== 'ready'} onClick={() => openBuilder()}>
      Make new card
    </Btn>
  );

  let content;
  if (state === 'loading') {
    content = <Grid>{[0, 1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}</Grid>;
  } else if (state === 'error') {
    content = <Card style={{ padding: 8 }}><ErrorState title="Couldn't load your cards." sub="Something went wrong on our side." onRetry={() => setState('ready')} /></Card>;
  } else if (state === 'empty' || tabCards.length === 0) {
    content = (
      <Card style={{ padding: 8 }}>
        <EmptyState
          icon={<Ico.Chart s={24} c={DS.textSecondary} />}
          title="No cards yet. Make your first card."
          sub="Describe a number in your own words, or start from an example."
          cta={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {EXAMPLE_CARDS.map((e) => (
                <Btn key={e.title} type="Secondary" size="Sm" onClick={() => openBuilder({ prompt: e.prompt })}>{e.title}</Btn>
              ))}
            </div>
          }
        />
      </Card>
    );
  } else {
    content = (
      <Grid>
        {tabCards.map((c) => (
          <InsightCard
            key={c.id} card={c} period={tab.period} comparison={tab.comparison} tabs={tabs}
            highlight={highlight === c.id}
            onEdit={(card) => openBuilder(card)}
            onDuplicate={duplicate}
            onMove={move}
            onDelete={setDeleteCard}
            onOpenSegment={openSegment}
          />
        ))}
      </Grid>
    );
  }

  return (
    <div style={{ fontFamily: DS.ff, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StatePreview groups={[{ label: 'State', value: state, onChange: setState, options: ['ready', 'loading', 'empty', 'error'] }]} />

      <PageHeader
        title="Insights"
        description={`${ACCOUNT.name} · your key numbers, built by you`}
        actions={cardCap
          ? <Tooltip label="This tab is full (12 cards). Use another tab.">{makeBtn}</Tooltip>
          : makeBtn}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderBottom: `1px solid ${DS.borderDefault}`, flexWrap: 'wrap' }}>
        <Tabs value={tab.id} onChange={setActiveTab} tabs={tabs.map((t) => ({ value: t.id, label: t.name, width: tabWidth(t.name) }))} />
        <Tooltip label={tabCap ? 'Max 10 tabs' : 'Add a tab'}>
          <IconBtn icon={<Ico.Plus s={16} />} kind="Ghost" size="Sm" aria-label="Add a tab" disabled={tabCap} onClick={addTab} />
        </Tooltip>
        <span style={{ flex: 1 }} />
        <ActionMenu items={tabMenu} size="Sm" width={200} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <Select label="Period" value={tab.period} options={PERIODS} width={200} onChange={(v) => patchTab(tab.id, { period: v })} />
        <Select label="Comparison" value={tab.comparison} options={COMPARISONS} width={240} onChange={(v) => patchTab(tab.id, { comparison: v })} />
      </div>

      {content}

      <CardBuilder
        open={!!builder}
        initial={builder?.initial}
        tabs={tabs}
        defaultTab={tab.id}
        period={tab.period}
        comparison={tab.comparison}
        onClose={() => setBuilder(null)}
        onSave={saveCard}
      />

      <ConfirmDialog
        open={!!deleteCard}
        title="Delete this card?"
        body={deleteCard ? `"${deleteCard.title}" disappears for everyone at ${ACCOUNT.name}.` : ''}
        confirmLabel="Delete" danger
        onConfirm={() => { setCards((cs) => cs.filter((c) => c.id !== deleteCard.id)); setDeleteCard(null); notify('Card deleted'); }}
        onCancel={() => setDeleteCard(null)}
      />

      <Modal
        open={tabModal?.mode === 'rename'} variant="center" size="sm" title="Rename tab"
        onClose={() => setTabModal(null)}
        footer={<><span style={{ flex: 1 }} /><Btn type="Secondary" onClick={() => setTabModal(null)}>Cancel</Btn>
          <Btn type="Primary" disabled={!tabName.trim()} onClick={() => { patchTab(tabModal.id, { name: tabName.trim() }); setTabModal(null); }}>Save</Btn></>}
      >
        <div style={{ padding: 20 }}><Field label="Tab name" value={tabName} onChange={(e) => setTabName(e.target.value)} /></div>
      </Modal>

      <Modal
        open={tabModal?.mode === 'delete'} variant="center" size="sm" title="Delete tab"
        onClose={() => setTabModal(null)}
        footer={<><span style={{ flex: 1 }} /><Btn type="Secondary" onClick={() => setTabModal(null)}>Cancel</Btn>
          <Btn type="Destructive" onClick={() => deleteTab(false)}>Delete them too</Btn>
          <Btn type="Primary" disabled={!moveTarget} onClick={() => deleteTab(true)}>Move cards</Btn></>}
      >
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, ...TY.bodyMd, color: DS.textDefault }}>
          <span>This tab holds {cards.filter((c) => c.tab === tabModal?.id).length} cards. Move them to another tab, or delete them too.</span>
          <Select label="Move cards to" value={moveTarget} onChange={setMoveTarget}
                  options={tabs.filter((t) => t.id !== tabModal?.id).map((t) => ({ value: t.id, label: t.name }))} />
        </div>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
      {children}
    </div>
  );
}
