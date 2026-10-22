/**
 * BuilderAll: the side panel that builds a custom card, limited to what the
 * chosen batch offers.
 *
 *   Batch 1  profile sources and "Count profiles" only; number, breakdown,
 *            share of a base. Same conditions as the segmentation engine.
 *   Batch 2  + transaction sources and measures; per day, progress to a
 *            target, countdown.
 *   Batch 3  + "Describe your number" (scripted AI stand-in) and dragging a
 *            field onto "Split by".
 */
import React from 'react';
import { DS, TY } from '../../../utils/designSystem';
import Ico from '../../../utils/icons';
import Modal from '../../../components/Modal';
import { Btn } from '../../../components/Btn';
import { Field, TextArea } from '../../../components/Field';
import Select from '../../../components/Select';
import Chip from '../../../components/Chip';
import Skeleton from '../../../components/Skeleton';
import Card from '../../../components/Card';
import AddFilterModal from '../../Contacts/AddFilterModal';
import { AI_SCRIPTS } from '../mockData';
import { CardBodyAll } from './CardAll';
import { SOURCES, MEASURES, KINDS, SPLIT_FIELDS, EVENTS, AI_PROMPTS } from './mockDataAll';
import { has } from './batches';

let _k = 1;
const kid = () => `q${_k++}`;

const EMPTY = {
  source: '', conditions: [], measure: 'people', kind: 'number', split: 'gender', base: 'fans',
  target: '', event: 'derby', title: '', subtitle: '', value: null,
};

const BASES = [
  { value: 'fans', label: 'All fans', count: 221509 },
  { value: 'holders', label: 'Season ticket holders', count: 12447 },
];

const BASE_VALUE = { people: 48210, tickets: 32180, orders: 5762, subscriptions: 12447, revenue: 1523000 };
const previewValue = (f) => {
  if (f.value !== null && f.value !== undefined) return f.value;
  return Math.round((BASE_VALUE[f.measure] ?? 8000) * Math.pow(0.58, Math.max(0, f.conditions.length - 1)));
};

/* Map a scripted AI answer from the Lot 1 prototype onto this builder. */
const fromScript = (fill) => ({
  ...EMPTY,
  source: fill.source === 'subscription' ? 'subscription' : fill.source === 'order' ? 'order' : fill.source,
  measure: fill.measure ?? 'people',
  kind: fill.form ?? 'number',
  split: fill.breakdown === 'cities' ? 'city' : 'gender',
  title: fill.title ?? '',
  value: fill.value ?? null,
  conditions: (fill.conditions ?? []).map((c) => ({ id: kid(), label: c.label, flagged: !!c.flagged })),
});

const Label = ({ children }) => (
  <div style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 6 }}>{children}</div>
);

function CondChip({ cond, onConfirm, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: DS.radiusLg,
      background: cond.flagged ? DS.feedbackWarningBg : DS.surfaceSubtle,
      border: `1px solid ${cond.flagged ? DS.feedbackWarning : DS.borderDefault}`,
      ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong,
    }}>
      {cond.flagged && <Ico.Warn s={14} c={DS.feedbackWarning} />}
      <span onClick={cond.flagged ? onConfirm : undefined} style={{ cursor: cond.flagged ? 'pointer' : 'default' }}
            title={cond.flagged ? 'Assumed by the AI. Click to confirm.' : ''}>{cond.label}</span>
      <button type="button" aria-label="Remove condition" onClick={onRemove}
              style={{ display: 'flex', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
        <Ico.Cross s={12} c={DS.textSecondary} />
      </button>
    </span>
  );
}

export default function BuilderAll({ open, initial, batch, tabs, defaultTab, comparison, onClose, onSave }) {
  const [form, setForm] = React.useState(EMPTY);
  const [tab, setTab] = React.useState(defaultTab);
  const [prompt, setPrompt] = React.useState('');
  const [phase, setPhase] = React.useState('idle');
  const [note, setNote] = React.useState(null);
  const [picker, setPicker] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState('');

  const ai = has(batch, 'ai');
  const tx = has(batch, 'tx');
  const dnd = has(batch, 'dnd');

  React.useEffect(() => {
    if (!open) return;
    if (initial?.id) {
      const baseKey = initial.base?.value === 12447 ? 'holders' : 'fans';
      setForm({ ...EMPTY, ...initial, base: baseKey, target: initial.target ?? '', subtitle: initial.subtitle ?? '',
        conditions: (initial.conditions ?? []).map((label) => ({ id: kid(), label, flagged: false })) });
      setTab(initial.tab);
    } else {
      setForm(EMPTY);
      setTab(defaultTab);
    }
    setPrompt(''); setPhase('idle'); setNote(null); setError('');
  }, [open, initial, defaultTab]);

  const patch = (p) => { setForm((f) => ({ ...f, ...p, ...('conditions' in p || 'measure' in p || 'source' in p ? { value: null } : null) })); setError(''); };

  const sources = SOURCES.filter((s) => s.people || tx);
  const measures = MEASURES.filter((m) => m.value === 'people' || tx);
  const kinds = KINDS.filter((k) => has(batch, k.value));

  const runAI = (text) => {
    setPhase('building'); setNote(null);
    setTimeout(() => {
      const t = text.toLowerCase();
      const s = AI_SCRIPTS.find((x) => x.match.some((m) => t.includes(m)));
      setPhase('idle');
      if (!s) { setNote({ tone: 'danger', text: "Couldn't build this card. Try other words or build it by hand." }); return; }
      if (s.refuse) { setNote({ tone: 'danger', text: s.refuse.missing }); setForm(EMPTY); return; }
      if (s.ask) { setNote({ tone: 'info', text: `${s.ask.question} Pick one: ${s.ask.options.map((o) => o.label).join(', ')}.` }); return; }
      setForm(fromScript(s.fill));
    }, 1000);
  };

  const onDropField = (e) => {
    e.preventDefault(); setDragOver(false);
    const v = e.dataTransfer.getData('text/field');
    if (v) patch({ kind: 'breakdown', split: v });
  };

  const save = () => {
    const countdown = form.kind === 'countdown';
    if (!countdown && !form.source) { setError('Choose a source first.'); return; }
    if (!countdown && !form.conditions.length) { setError('Add at least one condition.'); return; }
    if (form.kind === 'target' && !Number(form.target)) { setError('Set a target.'); return; }
    if (!form.title.trim()) { setError('Give the card a title.'); return; }
    if (form.conditions.some((c) => c.flagged)) { setError('Confirm the orange condition first.'); return; }
    const v = previewValue(form);
    const base = BASES.find((b) => b.value === form.base);
    onSave({
      ...(initial?.id ? initial : {}),
      kind: form.kind, measure: countdown ? undefined : form.measure, source: countdown ? undefined : form.source,
      title: form.title.trim(), subtitle: form.subtitle,
      conditions: countdown ? undefined : form.conditions.map((c) => c.label),
      split: form.split, event: form.event,
      base: form.kind === 'share' ? { label: base.label.toLowerCase(), value: base.count } : undefined,
      target: form.kind === 'target' ? Number(form.target) : undefined,
      value: v, prev: { yesterday: Math.round(v * 0.995), lastYear: Math.round(v * 0.92) },
      createdBy: initial?.createdBy ?? 'camille', createdAt: initial?.createdAt ?? 'today',
    }, tab);
  };

  const preview = (() => {
    const v = previewValue(form);
    const base = BASES.find((b) => b.value === form.base);
    return {
      ...form, value: v, conditions: form.conditions.map((c) => c.label),
      prev: { yesterday: Math.round(v * 0.995), lastYear: Math.round(v * 0.92) },
      base: { label: base.label.toLowerCase(), value: base.count },
      target: Number(form.target) || Math.round(v * 1.2),
    };
  })();
  const ready = form.kind === 'countdown' || (form.source && form.conditions.length > 0);

  const footer = (
    <>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>Tab</span>
      <Select value={tab} onChange={setTab} width={170} options={tabs.map((t) => ({ value: t.id, label: t.name }))} />
      <span style={{ flex: 1, ...TY.labelMd, fontFamily: DS.ff, color: DS.feedbackDanger, textAlign: 'right' }}>{error}</span>
      <Btn type="Secondary" onClick={onClose}>Cancel</Btn>
      <Btn type="Primary" onClick={save}>Save</Btn>
    </>
  );

  return (
    <>
      <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit card' : 'New custom card'} footer={footer} width={480}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: DS.ff }}>

          {ai && (
            <>
              <div style={{ background: DS.brandPrimarySubtle, borderRadius: DS.radiusXl, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...TY.labelLg, color: DS.textStrong }}>
                  <Ico.AIicon s={16} c={DS.actionPrimary} /> Describe your number
                </div>
                <TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="e.g. season ticket holders who did not renew yet"
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (prompt.trim()) runAI(prompt); } }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {!prompt && AI_PROMPTS.map((p) => <Chip key={p} label={p} onClick={() => setPrompt(p)} />)}
                  <span style={{ flex: 1 }} />
                  <Btn type="Primary" size="Sm" disabled={!prompt.trim() || phase === 'building'} onClick={() => runAI(prompt)}>Build</Btn>
                </div>
                {note && <span style={{ ...TY.bodySm, color: note.tone === 'danger' ? DS.feedbackDanger : DS.textStrong }}>{note.text}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.labelMd, color: DS.textMuted }}>
                <span style={{ flex: 1, height: 1, background: DS.borderDefault }} /> or build it by hand <span style={{ flex: 1, height: 1, background: DS.borderDefault }} />
              </div>
            </>
          )}

          {!tx && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: DS.feedbackInfoBg, borderRadius: DS.radiusLg, padding: '10px 12px', ...TY.bodySm, color: DS.textDefault }}>
              <Ico.Info s={16} c={DS.feedbackInfo} />
              Same conditions as the segmentation engine. The result is a card with a number of profiles, not a list.
            </div>
          )}

          {phase === 'building' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ ...TY.bodySm, color: DS.textSecondary }}>Building your card...</span>
              {[80, 60, 70, 50].map((w, i) => <Skeleton key={i} w={`${w}%`} h={30} r={6} />)}
            </div>
          ) : (
            <>
              <Select label="Format" value={form.kind} options={kinds} onChange={(v) => patch({ kind: v, ...(v === 'share' ? { measure: 'people' } : null) })} />

              {form.kind === 'countdown' ? (
                <Select label="Event" value={form.event} options={EVENTS} onChange={(v) => patch({ event: v })} />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Select label="Source" value={form.source} placeholder="Choose a source" options={sources} onChange={(v) => patch({ source: v })} />
                    <Select label="Measure" value={form.measure} options={form.kind === 'share' ? measures.filter((m) => m.value === 'people') : measures} onChange={(v) => patch({ measure: v })} />
                  </div>

                  <div>
                    <Label>Conditions</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                      {!form.conditions.length && <span style={{ ...TY.bodySm, color: DS.textMuted }}>No conditions yet.</span>}
                      {form.conditions.map((c, i) => (
                        <React.Fragment key={c.id}>
                          {i > 0 && <span style={{ ...TY.captionSm, color: DS.textMuted }}>AND</span>}
                          <CondChip
                            cond={c}
                            onConfirm={() => patch({ conditions: form.conditions.map((x) => (x.id === c.id ? { ...x, flagged: false } : x)) })}
                            onRemove={() => patch({ conditions: form.conditions.filter((x) => x.id !== c.id) })}
                          />
                        </React.Fragment>
                      ))}
                      <Btn type="Ghost" size="Sm" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }} onClick={() => setPicker(true)}>
                        Add condition
                      </Btn>
                    </div>
                  </div>

                  {form.kind === 'breakdown' && (
                    dnd ? (
                      <div>
                        <Label>Split by (drag a field here)</Label>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={onDropField}
                          style={{
                            padding: 12, borderRadius: DS.radiusLg, textAlign: 'center',
                            border: `1.5px dashed ${dragOver ? DS.actionPrimary : DS.borderDefault}`,
                            background: dragOver ? DS.actionPrimarySubtle : DS.bgCard, ...TY.labelMd, color: DS.textStrong,
                          }}
                        >
                          {SPLIT_FIELDS.find((f) => f.value === form.split)?.label ?? 'Drop a field'}
                        </div>
                      </div>
                    ) : (
                      <Select label="Split by" value={form.split} options={SPLIT_FIELDS} onChange={(v) => patch({ split: v })} />
                    )
                  )}

                  {dnd && (
                    <div>
                      <Label>Fields</Label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {SPLIT_FIELDS.map((f) => (
                          <span key={f.value} draggable onDragStart={(e) => e.dataTransfer.setData('text/field', f.value)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: DS.radiusPill,
                                         border: `1px solid ${DS.borderDefault}`, background: DS.surfaceSubtle, cursor: 'grab', ...TY.labelMd, color: DS.textStrong }}>
                            <Ico.Drag s={12} c={DS.textMuted} /> {f.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.kind === 'share' && (
                    <Select label="Share of" value={form.base} options={BASES} onChange={(v) => patch({ base: v })} />
                  )}
                  {form.kind === 'target' && (
                    <Field label="Target" value={String(form.target)} onChange={(e) => patch({ target: e.target.value.replace(/[^0-9]/g, '') })} placeholder="e.g. 14000" />
                  )}
                </>
              )}

              <Field label="Title" value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g. Not renewed yet" />
              <Field label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="Optional" />

              <div>
                <Label>Preview</Label>
                <div style={{ border: `1px dashed ${DS.borderDefault}`, borderRadius: DS.radiusXl, padding: 4 }}>
                  {ready ? (
                    <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <span style={{ ...TY.labelLg, color: DS.textStrong }}>{form.title || 'Untitled card'}</span>
                      <CardBodyAll card={preview} comparison={comparison} />
                    </Card>
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', ...TY.bodySm, color: DS.textMuted }}>Add a source and a condition to see your number</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
      <AddFilterModal open={picker} onClose={() => setPicker(false)}
                      onSelect={(uc) => patch({ conditions: [...form.conditions, { id: kid(), label: uc.label, flagged: false }] })} />
    </>
  );
}
