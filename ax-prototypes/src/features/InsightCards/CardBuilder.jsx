/**
 * CardBuilder: the side panel that builds or edits one card.
 *
 * One builder, two entries (vision guideline):
 *   [1b] "Describe your number": a scripted stand-in for the AI fills every
 *        field below. Ambiguous readings become flagged chips ("assumed,
 *        check this"); data Arenametrix doesn't hold gets a refusal with the
 *        nearest card it can build; an unpickable question gets one ask-back.
 *   [1a] By hand: source, conditions, measure, form, comparison, title.
 *
 * Conditions are compact chips, one per line, AND between them. "+ Add
 * condition" reuses the Contacts object picker (AddFilterModal). Nested blocks
 * stay out of the panel (max 6 conditions, L3 decision 6).
 */
import React from 'react';
import { DS, TY } from '../../utils/designSystem';
import Ico from '../../utils/icons';
import Modal from '../../components/Modal';
import { Btn } from '../../components/Btn';
import { Field, TextArea } from '../../components/Field';
import Select from '../../components/Select';
import Chip from '../../components/Chip';
import Skeleton from '../../components/Skeleton';
import Card from '../../components/Card';
import { ConfirmDialog } from '../../components/Feedback';
import AddFilterModal from '../Contacts/AddFilterModal';
import { CardBody } from './InsightCard';
import {
  SOURCES, MEASURES, FORMS, CARD_COMPARISONS, AI_SCRIPTS, EXAMPLE_PROMPTS, MAX_CONDITIONS,
} from './mockData';

let _cid = 1;
const cid = () => `k${_cid++}`;

const EMPTY = {
  source: '', conditions: [], measure: 'people', form: 'number', comparison: 'page',
  title: '', breakdown: 'cities', value: null,
};

/* Base numbers per source, narrowed by each extra condition, so a hand-built
   card shows a plausible preview. Scripted prompts carry their own value. */
const BASE = { subscription: 8412, ticket: 32180, contact: 48210, order: 1523000, consumptions: 412300 };
const previewValue = (f) => {
  if (f.value !== null && f.value !== undefined) return f.value;
  const base = f.measure === 'revenue' ? 1523000 : f.measure === 'tickets' ? 32180 : (BASE[f.source] ?? 8000);
  return Math.round(base * Math.pow(0.58, Math.max(0, f.conditions.length - 1)));
};

const findScript = (text) => {
  const t = text.toLowerCase();
  return AI_SCRIPTS.find((s) => s.match.some((m) => t.includes(m)));
};

const toConditions = (list) => list.map((c) => ({ id: cid(), label: c.label, flagged: !!c.flagged }));

function SectionLabel({ children }) {
  return <div style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 6 }}>{children}</div>;
}

/* BUILD-CUSTOM (approved): a condition chip. Flagged = an AI assumption, in
   the warning tone, until the user confirms or changes it. */
function ConditionChip({ cond, onEdit, onRemove }) {
  return (
    <span
      onClick={onEdit}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%', boxSizing: 'border-box',
        padding: '5px 8px', borderRadius: DS.radiusLg, cursor: 'pointer',
        background: cond.flagged ? DS.feedbackWarningBg : DS.surfaceSubtle,
        border: `1px solid ${cond.flagged ? DS.feedbackWarning : DS.borderDefault}`,
        ...TY.labelMd, fontFamily: DS.ff, color: DS.textStrong,
      }}
    >
      {cond.flagged && <Ico.Warn s={14} c={DS.feedbackWarning} />}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cond.label}</span>
      <button
        type="button" aria-label="Remove condition"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{ display: 'flex', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
      >
        <Ico.Cross s={12} c={DS.textSecondary} />
      </button>
    </span>
  );
}

function ChipEditor({ cond, onDone, onCancel }) {
  const [label, setLabel] = React.useState(cond.label);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: DS.radiusLg, border: `1px solid ${DS.borderDefault}`, background: DS.surfaceCanvas }}>
      {cond.flagged && (
        <span style={{ ...TY.bodySm, fontFamily: DS.ff, color: DS.textSecondary }}>
          The AI assumed this. Confirm it, or change it.
        </span>
      )}
      <Field value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Condition" />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn type="Ghost" size="Sm" onClick={onCancel}>Cancel</Btn>
        <Btn type="Secondary" size="Sm" onClick={() => onDone(label)}>{cond.flagged && label === cond.label ? 'Confirm' : 'Done'}</Btn>
      </div>
    </div>
  );
}

export default function CardBuilder({ open, initial, tabs, defaultTab, period, comparison, onClose, onSave }) {
  const [form, setForm] = React.useState(EMPTY);
  const [tab, setTab] = React.useState(defaultTab);
  const [prompt, setPrompt] = React.useState('');
  const [phase, setPhase] = React.useState('idle'); // idle | building | failed
  const [refusal, setRefusal] = React.useState(null);
  const [ask, setAsk] = React.useState(null);
  const [handEdited, setHandEdited] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null); // 'discard' | 'replace'
  const [error, setError] = React.useState('');
  const isEdit = !!initial?.id;

  React.useEffect(() => {
    if (!open) return;
    if (initial?.id) {
      setForm({ ...EMPTY, ...initial, conditions: toConditions(initial.conditions.map((label) => ({ label }))), value: initial.values?.[period]?.[0] ?? null });
      setTab(initial.tab);
    } else {
      setForm(EMPTY);
      setTab(defaultTab);
    }
    setPrompt(initial?.prompt ?? '');
    setPhase('idle'); setRefusal(null); setAsk(null); setHandEdited(false); setDirty(false);
    setEditing(null); setError(''); setConfirm(null);
    if (initial?.prompt) runBuild(initial.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const patch = (p, byHand = true) => {
    setForm((f) => ({ ...f, ...p, ...(byHand && ('conditions' in p || 'source' in p || 'measure' in p) ? { value: null } : null) }));
    setDirty(true);
    if (byHand) setHandEdited(true);
    setError('');
  };

  function applyFill(fill) {
    setForm({ ...EMPTY, ...fill, conditions: toConditions(fill.conditions ?? []) });
    setHandEdited(false);
    setDirty(true);
  }

  function runBuild(text) {
    setRefusal(null); setAsk(null); setError(''); setEditing(null);
    setPhase('building');
    setTimeout(() => {
      const script = findScript(text);
      if (!script) { setPhase('failed'); return; }
      setPhase('idle');
      if (script.refuse) { setRefusal(script.refuse); setForm(EMPTY); return; }
      if (script.ask) { setAsk(script.ask); return; }
      applyFill(script.fill);
    }, 1100);
  }

  const onBuild = () => {
    if (!prompt.trim()) return;
    if (handEdited && form.conditions.length) { setConfirm('replace'); return; }
    runBuild(prompt);
  };

  const requestClose = () => (dirty ? setConfirm('discard') : onClose());

  const addCondition = (uc) => {
    if (form.conditions.length >= MAX_CONDITIONS) return;
    patch({ conditions: [...form.conditions, { id: cid(), label: uc.label, flagged: false }] });
  };

  const save = () => {
    if (!form.source) { setError('Choose a source first.'); return; }
    if (!form.conditions.length) { setError('Add at least one condition.'); return; }
    if (!form.title.trim()) { setError('Give the card a title.'); return; }
    if (form.conditions.some((c) => c.flagged)) { setError('Confirm the orange condition first.'); return; }
    onSave({
      ...(initial?.id ? initial : {}),
      title: form.title.trim(), form: form.form, measure: form.measure, source: form.source,
      comparison: form.comparison, breakdown: form.breakdown,
      conditions: form.conditions.map((c) => c.label),
      value: previewValue(form),
    }, tab);
  };

  const atCap = form.conditions.length >= MAX_CONDITIONS;
  const ready = form.source && form.conditions.length > 0;
  const v = previewValue(form);
  const previewCard = {
    ...form, conditions: form.conditions.map((c) => c.label),
    values: { [period]: [v, Math.round(v * 1.08)] },
  };

  const footer = (
    <>
      <span style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>Tab</span>
      <Select value={tab} onChange={setTab} width={170} options={tabs.map((t) => ({ value: t.id, label: t.name }))} />
      <span style={{ flex: 1, ...TY.labelMd, fontFamily: DS.ff, color: DS.feedbackDanger, textAlign: 'right' }}>{error}</span>
      <Btn type="Secondary" onClick={requestClose}>Cancel</Btn>
      <Btn type="Primary" onClick={save}>Save</Btn>
    </>
  );

  return (
    <>
      <Modal open={open} onClose={requestClose} title={isEdit ? 'Edit card' : 'New card'} footer={footer} width={460}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: DS.ff }}>

          {/* [1b] Text entry */}
          <div style={{ background: DS.brandPrimarySubtle, borderRadius: DS.radiusXl, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...TY.labelLg, color: DS.textStrong }}>
              <Ico.AIicon s={16} c={DS.actionPrimary} /> Describe your number
            </div>
            <TextArea
              value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2}
              placeholder="e.g. season ticket holders who did not renew yet"
              style={{ gap: 0 }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onBuild(); } }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {!prompt && EXAMPLE_PROMPTS.map((p) => (
                <Chip key={p} label={p} onClick={() => setPrompt(p)} />
              ))}
              <span style={{ flex: 1 }} />
              <Btn type="Primary" size="Sm" disabled={!prompt.trim() || phase === 'building'} iconRight={<Ico.ArrowRightSmall s={14} c={DS.textInverse} />} onClick={onBuild}>Build</Btn>
            </div>

            {phase === 'failed' && (
              <div style={{ ...TY.bodySm, color: DS.feedbackDanger }}>
                Couldn't build this card. Try other words or build it by hand.
              </div>
            )}
            {refusal && (
              <div style={{ background: DS.feedbackDangerSubtle, borderRadius: DS.radiusLg, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ ...TY.bodySm, color: DS.textStrong }}>{refusal.missing}</span>
                <span style={{ ...TY.bodySm, color: DS.textSecondary }}>I can build this instead:</span>
                <div>
                  <Btn type="Secondary" size="Sm" onClick={() => { setPrompt(refusal.suggestion.prompt); runBuild(refusal.suggestion.prompt); }}>
                    {refusal.suggestion.label}
                  </Btn>
                </div>
              </div>
            )}
            {ask && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ ...TY.bodySmBold, color: DS.textStrong }}>{ask.question}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ask.options.map((o) => (
                    <Chip key={o.label} label={o.label} onClick={() => { applyFill({ ...ask.base, ...o.fill }); setAsk(null); }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...TY.labelMd, color: DS.textMuted }}>
            <span style={{ flex: 1, height: 1, background: DS.borderDefault }} />
            or build it by hand
            <span style={{ flex: 1, height: 1, background: DS.borderDefault }} />
          </div>

          {phase === 'building' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={{ ...TY.bodySm, color: DS.textSecondary }}>Building your card...</span>
              {[80, 60, 70, 50].map((w, i) => <Skeleton key={i} w={`${w}%`} h={32} r={6} />)}
            </div>
          ) : (
            <>
              <Select label="Source" value={form.source} placeholder="Choose a source" options={SOURCES} onChange={(v) => patch({ source: v })} />

              <div>
                <SectionLabel>Conditions</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                  {form.conditions.length === 0 && (
                    <span style={{ ...TY.bodySm, color: DS.textMuted }}>No conditions yet.</span>
                  )}
                  {form.conditions.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && <span style={{ ...TY.captionSm, color: DS.textMuted }}>AND</span>}
                      {editing === c.id ? (
                        <div style={{ alignSelf: 'stretch' }}>
                          <ChipEditor
                            cond={c}
                            onCancel={() => setEditing(null)}
                            onDone={(label) => {
                              patch({ conditions: form.conditions.map((x) => x.id === c.id ? { ...x, label, flagged: false } : x) }, label !== c.label);
                              setEditing(null);
                            }}
                          />
                        </div>
                      ) : (
                        <ConditionChip
                          cond={c}
                          onEdit={() => setEditing(c.id)}
                          onRemove={() => patch({ conditions: form.conditions.filter((x) => x.id !== c.id) })}
                        />
                      )}
                    </React.Fragment>
                  ))}
                  {form.conditions.some((c) => c.flagged) && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, ...TY.captionSm, color: DS.textSecondary }}>
                      <Ico.Warn s={12} c={DS.feedbackWarning} /> Assumed, check this. Click the chip to confirm or change it.
                    </span>
                  )}
                  {atCap ? (
                    <span style={{ ...TY.bodySm, color: DS.textSecondary }}>
                      Too many conditions for a card. Build a segment in Contacts first.
                    </span>
                  ) : (
                    <Btn type="Ghost" size="Sm" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }} onClick={() => setPickerOpen(true)}>
                      Add condition
                    </Btn>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Select label="Measure" value={form.measure} options={MEASURES} onChange={(v) => patch({ measure: v })} />
                <Select label="Form" value={form.form} options={FORMS} onChange={(v) => patch({ form: v }, false)} />
              </div>
              <Select label="Comparison" value={form.comparison} options={CARD_COMPARISONS} onChange={(v) => patch({ comparison: v }, false)} />
              <Field label="Title" value={form.title} onChange={(e) => patch({ title: e.target.value }, false)} placeholder="e.g. Not renewed yet" />

              <div>
                <SectionLabel>Preview</SectionLabel>
                <div style={{ border: `1px dashed ${DS.borderDefault}`, borderRadius: DS.radiusXl, padding: 4 }}>
                  {ready ? (
                    <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <span style={{ ...TY.labelLg, color: DS.textStrong }}>{form.title || 'Untitled card'}</span>
                      <CardBody card={previewCard} period={period} comparison={comparison} />
                    </Card>
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', ...TY.bodySm, color: DS.textMuted }}>
                      Add a source to see your number
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </Modal>

      <AddFilterModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addCondition} />

      <ConfirmDialog
        open={confirm === 'discard'}
        title="Discard changes?"
        body="This card hasn't been saved. Your changes will be lost."
        confirmLabel="Discard" danger
        onConfirm={() => { setConfirm(null); onClose(); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'replace'}
        title="Replace your changes?"
        body="Building from the text again replaces what you changed by hand."
        confirmLabel="Replace"
        onConfirm={() => { setConfirm(null); runBuild(prompt); }}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
