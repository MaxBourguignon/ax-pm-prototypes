/**
 * BuilderAll: the side panel that builds a custom card.
 *
 * Everything follows from the source (Joost, 22 October):
 *   1 Source          where the card starts: one of the four shops
 *   2 What to count   only the measures of that source
 *   3 Conditions      only the fields of that source, "field is value"
 *   4 Show as         the formats that fit the measure; Split by uses a field
 *                     of the same source, Per day runs on the source's date
 *   5 Compare with    per card, Batch 3
 *   6 Title
 *
 * The batch limits each step: Batch 1 counts profiles only (number,
 * breakdown as bars or a donut, share of all); Batch 2 adds counting
 * transactions, revenue, per day, progress to a target and days until an
 * event (countdown); Batch 3 adds "Describe your number" (a scripted AI
 * stand-in), Compare with, a saved segment as a condition and calculated
 * custom fields.
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
import { CardBodyAll } from './CardAll';
import { SOURCES, sourceOf, kindsFor, EVENTS, AI_PROMPTS, AI_SCRIPTS_ALL, COMPARISONS, defaultCompare, SEGMENTS, SEGMENT_PREFIX } from './mockDataAll';
import { has } from './batches';

let _k = 1;
const kid = () => `q${_k++}`;

const EMPTY = {
  source: '', measure: '', conditions: [], kind: 'number', split: '', chart: 'bars', target: '',
  compare: 'yesterday', title: '', subtitle: '', value: null,
};

const BASE_VALUE = { people: 48210, tickets: 32180, orders: 5762, subscriptions: 12447, items: 36099, revenue: 1523000 };
const previewValue = (f) => {
  if (f.value !== null && f.value !== undefined) return f.value;
  return Math.round((BASE_VALUE[f.measure] ?? 8000) * Math.pow(0.58, Math.max(0, f.conditions.length - 1)));
};

const eventValue = (label) => EVENTS.find((e) => e.label === label)?.value ?? 'main';

function Step({ n, title, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          width: 20, height: 20, borderRadius: 10, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: DS.brandPrimarySubtle, color: DS.actionPrimary, ...TY.captionSm, fontFamily: DS.ff, fontWeight: 600,
        }}>{n}</span>
        <span style={{ ...TY.labelLg, fontFamily: DS.ff, color: DS.textStrong }}>{title}</span>
        {hint && <span style={{ ...TY.captionSm, fontFamily: DS.ff, color: DS.textMuted }}>{hint}</span>}
      </div>
      <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

/* The fields of a source that the batch offers: calculated custom fields
   wait for Batch 3. */
const fieldsIn = (source, batch) => (sourceOf(source)?.fields ?? []).filter((f) => !f.needs || has(batch, f.needs));

/* Pick one field of the card's own source and one value: "Status is Active".
   From Batch 3 a saved segment is offered too, which may come from another
   shop: "In segment: Subscription holders 26/27". */
const SEGMENT_FIELD = 'In segment';

function ConditionPicker({ source, batch, onAdd, onCancel }) {
  const fields = [
    ...fieldsIn(source, batch),
    ...(has(batch, 'segmentCond') ? [{ field: SEGMENT_FIELD, values: SEGMENTS }] : []),
  ];
  const [field, setField] = React.useState(fields[0]?.field ?? '');
  const values = fields.find((f) => f.field === field)?.values ?? [];
  const [value, setValue] = React.useState(values[0] ?? '');
  React.useEffect(() => { setValue(values[0] ?? ''); }, [field]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: DS.radiusLg, border: `1px solid ${DS.borderDefault}`, background: DS.surfaceCanvas }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
        <Select value={field} options={fields.map((f) => ({ value: f.field, label: f.field }))} onChange={setField} />
        <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>{field === SEGMENT_FIELD ? ':' : 'is'}</span>
        <Select value={value} options={values.map((v) => ({ value: v, label: v }))} onChange={setValue} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn type="Ghost" size="Sm" onClick={onCancel}>Cancel</Btn>
        <Btn type="Secondary" size="Sm" disabled={!field || !value} onClick={() => onAdd(field === SEGMENT_FIELD ? `${SEGMENT_PREFIX}${value}` : `${field} is ${value}`)}>Add</Btn>
      </div>
    </div>
  );
}

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

export default function BuilderAll({ open, initial, batch, tabs, defaultTab, onClose, onSave }) {
  const [form, setForm] = React.useState(EMPTY);
  const [tab, setTab] = React.useState(defaultTab);
  const [prompt, setPrompt] = React.useState('');
  const [phase, setPhase] = React.useState('idle');
  const [note, setNote] = React.useState(null);
  const [picker, setPicker] = React.useState(false);
  const [error, setError] = React.useState('');

  const sources = SOURCES.filter((s) => !s.needs || has(batch, s.needs));
  const src = sourceOf(form.source);
  const measures = (src?.measures ?? []).filter((m) => has(batch, m.needs));
  const kinds = kindsFor(form.measure).filter((k) => has(batch, k.value));
  const isCountdown = form.measure === 'days';
  /* Split by a field you have not already fixed with a condition. */
  const usedFields = form.conditions.map((c) => c.label.split(' is ')[0]);
  const splitFields = fieldsIn(form.source, batch).filter((f) => !usedFields.includes(f.field));
  /* Compare with another value of one of your own conditions: pick the
     condition, then the value to compare with (e.g. Season 26/27 vs. 25/26). */
  const condFields = [...new Set(form.conditions.map((c) => c.label.split(' is ')[0]))]
    .filter((f) => src?.fields.some((x) => x.field === f));
  const otherValues = (field) => {
    const current = form.conditions.filter((c) => c.label.startsWith(`${field} is `)).map((c) => c.label.slice(field.length + 4));
    return (src?.fields.find((x) => x.field === field)?.values ?? []).filter((v) => !current.includes(v));
  };
  const compareOptions = COMPARISONS.filter((c) => c.value !== 'condition' || condFields.length);
  const chooseCompare = (v) => patch(v === 'condition'
    ? { compare: v, compareWith: { field: condFields[0], value: otherValues(condFields[0])[0] } }
    : { compare: v, compareWith: undefined });
  const showCompare = has(batch, 'compareChoice') && ['number', 'share', 'perDay'].includes(form.kind);
  React.useEffect(() => {
    if (form.kind === 'breakdown' && splitFields.length && !splitFields.some((f) => f.field === form.split)) {
      setForm((f) => ({ ...f, split: splitFields[0].field }));
    }
  }, [form.kind, form.split, form.conditions]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Picking a source starts the card over: its measures, fields and split come from it. */
  const startFrom = (source, rest = {}) => {
    const s = sourceOf(source);
    const m = s.measures.filter((x) => has(batch, x.needs))[0]?.value ?? '';
    const k = kindsFor(m).filter((x) => has(batch, x.value))[0]?.value ?? 'number';
    return { ...EMPTY, source, measure: m, kind: k, split: s.fields[0]?.field ?? '', ...rest };
  };

  React.useEffect(() => {
    if (!open) return;
    if (initial?.id) {
      setForm({ ...EMPTY, ...initial, chart: initial.chart ?? 'bars', target: initial.target ?? '', subtitle: initial.subtitle ?? '', compare: initial.compare ?? 'yesterday',
        conditions: (initial.conditions ?? []).map((label) => ({ id: kid(), label, flagged: false })) });
      setTab(initial.tab);
    } else {
      setForm(EMPTY);
      setTab(defaultTab);
    }
    setPrompt(''); setPhase('idle'); setNote(null); setPicker(false); setError('');
  }, [open, initial, defaultTab]);

  const patch = (p) => { setForm((f) => ({ ...f, ...p, ...('conditions' in p || 'measure' in p ? { value: null } : null) })); setError(''); };

  const chooseSource = (v) => {
    if (v === form.source) return;
    setForm((f) => startFrom(v, { title: f.title, subtitle: f.subtitle, compare: defaultCompare(v) }));
    setPicker(false); setError('');
  };
  const chooseMeasure = (v) => {
    const allowed = kindsFor(v).filter((k) => has(batch, k.value)).map((k) => k.value);
    patch({ measure: v, kind: allowed.includes(form.kind) ? form.kind : allowed[0] });
  };

  const runAI = (text) => {
    setPhase('building'); setNote(null);
    setTimeout(() => {
      const t = text.toLowerCase();
      const s = AI_SCRIPTS_ALL.find((x) => x.match.some((m) => t.includes(m)));
      setPhase('idle');
      if (!s) { setNote({ tone: 'danger', text: "Couldn't build this card. Try other words or build it by hand." }); return; }
      if (s.refuse) { setNote({ tone: 'danger', text: s.refuse }); setForm(EMPTY); return; }
      const f = s.fill;
      setForm(startFrom(f.source, { ...f, conditions: f.conditions.map((c) => ({ id: kid(), label: c.label, flagged: !!c.flagged })) }));
    }, 1000);
  };

  const save = () => {
    if (!form.source) { setError('Choose a source first.'); return; }
    /* Conditions are optional: none means everything in the source. Two
       formats do need one: a share of all needs a part to compare, and a
       countdown needs to know which event. */
    if (form.kind === 'share' && !form.conditions.length) { setError('A share needs a condition: the part you compare with all.'); return; }
    if (isCountdown && !form.conditions.some((c) => c.label.startsWith('Event is '))) { setError('Choose the event with a condition.'); return; }
    if (form.kind === 'target' && !Number(form.target)) { setError('Set a target.'); return; }
    if (showCompare && form.compare === 'condition' && !condFields.includes(form.compareWith?.field)) { setError('Compare with: choose one of your conditions.'); return; }
    if (!form.title.trim()) { setError('Give the card a title.'); return; }
    if (form.conditions.some((c) => c.flagged)) { setError('Confirm the orange condition first.'); return; }
    const v = previewValue(form);
    const eventCond = form.conditions.find((c) => c.label.startsWith('Event is '));
    onSave({
      ...(initial?.id ? initial : {}),
      source: form.source, measure: form.measure, kind: form.kind,
      title: form.title.trim(), subtitle: form.subtitle,
      conditions: form.conditions.map((c) => c.label),
      split: form.kind === 'breakdown' ? form.split : undefined,
      chart: form.kind === 'breakdown' ? form.chart : undefined,
      needs: [
        ...(form.conditions.some((c) => c.label.startsWith(SEGMENT_PREFIX)) ? ['segmentCond'] : []),
        ...((src?.fields ?? []).some((f) => f.needs === 'calcFields' && (form.split === f.field && form.kind === 'breakdown' || form.conditions.some((c) => c.label.startsWith(`${f.field} is `)))) ? ['calcFields'] : []),
      ],
      event: isCountdown ? eventValue(eventCond?.label.slice(9)) : undefined,
      base: form.kind === 'share' ? { label: src.noun, value: Math.round(v / 0.45) } : undefined,
      target: form.kind === 'target' ? Number(form.target) : undefined,
      compare: form.compare, compareWith: form.compare === 'condition' ? form.compareWith : undefined,
      value: v, prev: { yesterday: Math.round(v * 0.995), lastYear: Math.round(v * 0.92), condition: Math.round(v * 0.9) },
      createdBy: initial?.createdBy ?? 'camille', createdAt: initial?.createdAt ?? 'today',
    }, tab);
  };

  const preview = (() => {
    const v = previewValue(form);
    const eventCond = form.conditions.find((c) => c.label.startsWith('Event is '));
    return {
      ...form, value: v, conditions: form.conditions.map((c) => c.label),
      prev: { yesterday: Math.round(v * 0.995), lastYear: Math.round(v * 0.92), condition: Math.round(v * 0.9) },
      base: { label: src?.noun, value: Math.round(v / 0.45) },
      target: Number(form.target) || Math.round(v * 1.2),
      event: eventValue(eventCond?.label.slice(9)),
    };
  })();
  const ready = !!form.source;

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
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit card' : 'New custom card'} footer={footer} width={480}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: DS.ff }}>

        {has(batch, 'ai') && (
          <>
            <div style={{ background: DS.brandPrimarySubtle, borderRadius: DS.radiusXl, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...TY.labelLg, color: DS.textStrong }}>
                <Ico.AIicon s={16} c={DS.actionPrimary} /> Describe your number
              </div>
              <span style={{ ...TY.bodySm, color: DS.textSecondary }}>The AI fills in the steps below. Check them, then save.</span>
              <TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder="e.g. subscribers who did not renew yet"
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

        {phase === 'building' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ ...TY.bodySm, color: DS.textSecondary }}>Building your card...</span>
            {[80, 60, 70, 50].map((w, i) => <Skeleton key={i} w={`${w}%`} h={30} r={6} />)}
          </div>
        ) : (
          <>
            <Step n={1} title="Source" hint="where the card starts">
              <Select value={form.source} placeholder="Choose a source" options={sources} onChange={chooseSource} />
            </Step>

            {src && (
              <>
                <Step n={2} title="What to count" hint={`from ${src.label.toLowerCase()}`}>
                  <Select value={form.measure} options={measures} onChange={chooseMeasure} />
                </Step>

                <Step n={3} title="Conditions" hint={`optional, ${src.label.toLowerCase()} fields only`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                    {!form.conditions.length && (
                      <span style={{ ...TY.bodySm, color: DS.textSecondary }}>No conditions: the card counts all {src.noun}.</span>
                    )}
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
                  </div>
                  {picker ? (
                    <ConditionPicker
                      key={form.source} source={form.source} batch={batch} onCancel={() => setPicker(false)}
                      onAdd={(label) => { patch({ conditions: [...form.conditions, { id: kid(), label, flagged: false }] }); setPicker(false); }}
                    />
                  ) : (
                    <div>
                      <Btn type="Ghost" size="Sm" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }} onClick={() => setPicker(true)}>
                        Add condition
                      </Btn>
                    </div>
                  )}
                </Step>

                <Step n={4} title="Show as">
                  {isCountdown ? (
                    <span style={{ ...TY.bodySm, color: DS.textSecondary }}>Countdown: days until the event in your condition.</span>
                  ) : (
                    <Select value={form.kind} options={kinds} onChange={(v) => patch({ kind: v })} />
                  )}
                  {form.kind === 'breakdown' && (
                    <>
                      <Select label="Split by" value={form.split} options={splitFields.map((f) => ({ value: f.field, label: f.field }))} onChange={(v) => patch({ split: v })} />
                      <Select label="Draw as" value={form.chart} options={[{ value: 'bars', label: 'Bars' }, { value: 'donut', label: 'Donut' }]} onChange={(v) => patch({ chart: v })} />
                    </>
                  )}
                  {form.kind === 'share' && (
                    <span style={{ ...TY.bodySm, color: DS.textSecondary }}>Shows the number as a share of all {src.noun}, without your conditions.</span>
                  )}
                  {form.kind === 'perDay' && (
                    <span style={{ ...TY.bodySm, color: DS.textSecondary }}>One bar per day of the {src.dateField.toLowerCase()}, last 31 days.</span>
                  )}
                  {form.kind === 'target' && (
                    <Field label="Target" value={String(form.target)} onChange={(e) => patch({ target: e.target.value.replace(/[^0-9]/g, '') })} placeholder="e.g. 14000" />
                  )}
                </Step>

                {showCompare && (
                  <Step n={5} title="Compare with">
                    <Select value={form.compare} options={compareOptions} onChange={chooseCompare} />
                    {form.compare === 'condition' && form.compareWith && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Select value={form.compareWith.field} width={180} options={condFields.map((f) => ({ value: f, label: f }))}
                          onChange={(f) => patch({ compareWith: { field: f, value: otherValues(f)[0] } })} />
                        <span style={{ ...TY.bodySm, color: DS.textSecondary }}>is</span>
                        <Select value={form.compareWith.value} width={180} options={otherValues(form.compareWith.field).map((v) => ({ value: v, label: v }))}
                          onChange={(v) => patch({ compareWith: { ...form.compareWith, value: v } })} />
                      </div>
                    )}
                  </Step>
                )}

                <Step n={showCompare ? 6 : 5} title="Title">
                  <Field value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g. Not renewed yet" />
                  <Field value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="Subtitle (optional)" />
                </Step>

                <div>
                  <div style={{ ...TY.labelMd, color: DS.textSecondary, marginBottom: 6 }}>Preview</div>
                  <div style={{ border: `1px dashed ${DS.borderDefault}`, borderRadius: DS.radiusXl, padding: 4 }}>
                    {ready ? (
                      <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ ...TY.labelLg, color: DS.textStrong }}>{form.title || 'Untitled card'}</span>
                          {form.subtitle && <span style={{ ...TY.bodySm, color: DS.textSecondary }}>{form.subtitle}</span>}
                        </div>
                        <CardBodyAll card={preview} comparison={has(batch, 'compareChoice') ? form.compare : defaultCompare(form.source)} />
                      </Card>
                    ) : (
                      <div style={{ padding: 20, textAlign: 'center', ...TY.bodySm, color: DS.textMuted }}>Choose a source to see your number</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
