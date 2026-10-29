/**
 * NewCardChooser: "New insights card", modelled on the current Fanalists
 * dialog (card type, then entry type). Manual entry comes in Batch 2.
 *
 * ManualEditor: the side panel for a manual card.
 *   Data     own values (for example offline revenue), added up, multiplied or
 *            divided left to right, with an optional target and progress bar.
 *   Content  a title, a subtitle and plain text.
 */
import React from 'react';
import { DS, TY } from '../../../utils/designSystem';
import Ico from '../../../utils/icons';
import Modal from '../../../components/Modal';
import { Btn } from '../../../components/Btn';
import IconBtn from '../../../components/Iconbtn';
import { Field, TextArea } from '../../../components/Field';
import Select from '../../../components/Select';
import Card from '../../../components/Card';
import { CardBodyAll } from './CardAll';
import { OPS, UNITS } from './mockDataAll';
import { has } from './batches';

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg, overflow: 'hidden' }}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value} type="button" disabled={o.disabled} onClick={() => onChange(o.value)} title={o.hint}
            style={{
              flex: 1, padding: '9px 12px', border: 'none', cursor: o.disabled ? 'not-allowed' : 'pointer',
              borderLeft: i ? `1px solid ${DS.borderDefault}` : 'none',
              background: active ? DS.surfaceMuted : DS.bgCard,
              color: o.disabled ? DS.textDisabled : DS.textStrong,
              ...TY.labelMd, fontFamily: DS.ff,
            }}
          >
            {o.label}
            {o.disabled && o.badge && <span style={{ display: 'block', ...TY.captionSm, color: DS.textMuted }}>{o.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

const Label = ({ children }) => (
  <div style={{ ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary, marginBottom: 6 }}>{children}</div>
);

export function NewCardChooser({ open, batch, onClose, onChoose }) {
  const [type, setType] = React.useState('custom');
  const [entry, setEntry] = React.useState('data');
  const manualOk = has(batch, 'manualData') || has(batch, 'manualText');
  React.useEffect(() => { if (open) { setType('custom'); setEntry('data'); } }, [open]);

  const footer = (
    <>
      <span style={{ flex: 1 }} />
      <Btn type="Secondary" onClick={onClose}>Cancel</Btn>
      <Btn type="Primary" onClick={() => onChoose(type === 'custom' ? { kind: 'custom' } : { kind: entry === 'data' ? 'manualData' : 'text' })}>Create</Btn>
    </>
  );

  return (
    <Modal open={open} onClose={onClose} variant="center" size="sm" title="New insights card" footer={footer}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: DS.ff }}>
        <div>
          <Label>Choose card type</Label>
          <Segmented
            value={type} onChange={setType}
            options={[
              { value: 'custom', label: 'Custom card' },
              { value: 'manual', label: 'Manual entry', disabled: !manualOk, badge: 'Batch 2', hint: manualOk ? '' : 'Comes in Batch 2' },
            ]}
          />
        </div>
        {type === 'manual' && (
          <div>
            <Label>Choose entry type</Label>
            <Segmented value={entry} onChange={setEntry} options={[{ value: 'data', label: 'Data' }, { value: 'content', label: 'Content' }]} />
          </div>
        )}
        <span style={{ ...TY.bodySm, color: DS.textSecondary }}>
          {type === 'custom'
            ? 'Build a card on your own data, with the same conditions as the segmentation engine.'
            : entry === 'data'
              ? 'Enter your own values, for example offline revenue, and add them up, multiply or divide them.'
              : 'Write a note for your team: plain text on a card.'}
        </span>
      </div>
    </Modal>
  );
}

const EMPTY_DATA = {
  kind: 'manualData', title: '', subtitle: '', unit: 'eur', op: 'sum', target: '',
  entries: [{ label: '', value: '' }, { label: '', value: '' }],
};
const EMPTY_TEXT = { kind: 'text', title: '', subtitle: '', text: '' };

export function ManualEditor({ open, initial, tabs, defaultTab, onClose, onSave }) {
  const [form, setForm] = React.useState(EMPTY_DATA);
  const [tab, setTab] = React.useState(defaultTab);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    const base = initial?.kind === 'text' ? EMPTY_TEXT : EMPTY_DATA;
    setForm({ ...base, ...initial, target: initial?.target ?? '' });
    setTab(initial?.tab ?? defaultTab);
    setError('');
  }, [open, initial, defaultTab]);

  const patch = (p) => { setForm((f) => ({ ...f, ...p })); setError(''); };
  const setEntry = (i, p) => patch({ entries: form.entries.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const isData = form.kind === 'manualData';

  const cleaned = isData
    ? { ...form, target: form.target === '' ? undefined : Number(form.target), entries: form.entries.map((e) => ({ label: e.label || 'Value', value: Number(e.value) || 0 })) }
    : form;

  const save = () => {
    if (!form.title.trim()) { setError('Give the card a title.'); return; }
    if (isData && form.entries.filter((e) => e.value !== '').length < 1) { setError('Enter at least one value.'); return; }
    if (!isData && !form.text.trim()) { setError('Write some text.'); return; }
    onSave({ ...cleaned, title: form.title.trim(), createdBy: initial?.createdBy ?? 'camille', createdAt: initial?.createdAt ?? 'today' }, tab);
  };

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
    <Modal open={open} onClose={onClose} title={`${initial?.id ? 'Edit' : 'New'} manual entry: ${isData ? 'data' : 'content'}`} footer={footer} width={460}>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: DS.ff }}>
        <Field label="Title" value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder={isData ? 'e.g. Season budget incl. partners' : 'e.g. Kidsclub'} />
        <Field label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} placeholder="Optional" />

        {isData ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select label="Unit" value={form.unit} options={UNITS} onChange={(v) => patch({ unit: v })} />
              <Select label="Calculation" value={form.op} options={OPS} onChange={(v) => patch({ op: v })} />
            </div>
            <div>
              <Label>Values {form.op === 'divide' ? '(the first divided by the next)' : ''}</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.entries.map((e, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '18px 1fr 120px 32px', gap: 8, alignItems: 'center' }}>
                    <span style={{ ...TY.labelMd, color: DS.textMuted, textAlign: 'center' }}>{i > 0 ? OPS.find((o) => o.value === form.op)?.sign : ''}</span>
                    <Field value={e.label} onChange={(ev) => setEntry(i, { label: ev.target.value })} placeholder="Label" />
                    <Field value={String(e.value)} onChange={(ev) => setEntry(i, { value: ev.target.value.replace(/[^0-9.,-]/g, '').replace(',', '.') })} placeholder="0" />
                    <IconBtn icon={<Ico.Trash s={14} />} kind="Ghost" size="Sm" aria-label="Remove value" disabled={form.entries.length <= 1}
                             onClick={() => patch({ entries: form.entries.filter((_, j) => j !== i) })} />
                  </div>
                ))}
                <div>
                  <Btn type="Ghost" size="Sm" iconLeft={<Ico.Plus s={14} c={DS.actionPrimary} />} style={{ color: DS.actionPrimary }}
                       onClick={() => patch({ entries: [...form.entries, { label: '', value: '' }] })}>
                    Add value
                  </Btn>
                </div>
              </div>
            </div>
            <Field label="Target (optional)" value={String(form.target)} onChange={(e) => patch({ target: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Shows a progress bar" />
          </>
        ) : (
          <TextArea label="Text" rows={6} value={form.text} onChange={(e) => patch({ text: e.target.value })} placeholder="One line per point" />
        )}

        <div>
          <Label>Preview</Label>
          <div style={{ border: `1px dashed ${DS.borderDefault}`, borderRadius: DS.radiusXl, padding: 4 }}>
            <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ ...TY.labelLg, color: DS.textStrong }}>{form.title || 'Untitled card'}</span>
                {form.subtitle && <span style={{ ...TY.bodySm, color: DS.textSecondary }}>{form.subtitle}</span>}
              </div>
              <CardBodyAll card={cleaned} comparison="yesterday" />
            </Card>
          </div>
        </div>
      </div>
    </Modal>
  );
}
