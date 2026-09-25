import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Btn } from "../../components/Btn";
import { Field, TextArea } from "../../components/Field";
import { Select } from "../../components/Select";
import { Badge } from "../../components/Tag";
import ConfirmSummaryCard from "../../components/ConfirmSummaryCard";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { SuccessState as SharedSuccessState } from "../../components/Feedback";

// ─────────────────────────────────────────────────────────────────────────────
// CreateListModal — turn the current segment into a new list (fully simulated).
//
// Rebased onto the DS Organisms/Modal spec (1223:3646, read 2026-09):
//   shell 480 base (560 here — the DS "Ajouter une opportunité" composition,
//   2099:41154, is the widest documented and the type cards need the room)
//   body  padding 24 · gap 16
//   footer  Secondary (Cancel/Back) + one Primary, right-aligned
// Form controls come from the shared Field / Select / TextArea, so the label
// row, radius and border are the DS FormField ones rather than local copies.
//
// Flow: Step 1 (details) → Step 2 (confirm) → fake create → success.
// Folder names + type identity mirror src/features/Lists/ListsV3.jsx.
// ─────────────────────────────────────────────────────────────────────────────

const FOLDERS = ["Loyalty & VIP", "Campaigns", "Events", "Retail", "Reactivation", "Imports", "B2B", "Compliance"];

// Type identity mirrors ListsV3's TYPES — dynamic reads on the success pair,
// static on the brand pair — so the picker, the confirm preview and the real
// Lists page all colour the same concept the same way.
const LIST_TYPES = [
  {
    id:    "dynamic",
    label: "Dynamic",
    Icon:  Ico.Zap,
    tone:  "success",
    bg:    DS.feedbackSuccessBg,
    fg:    DS.feedbackSuccess,
    desc:  "Auto-updates as contacts start or stop matching the segment.",
    note:  "This list keeps updating automatically as contacts start or stop matching the segment.",
  },
  {
    id:    "static",
    label: "Static",
    Icon:  Ico.List,
    tone:  "primary",
    bg:    DS.brandPrimarySubtle,
    fg:    DS.brandOnSurface,
    desc:  "A fixed snapshot of the contacts matching right now.",
    note:  "This list is a fixed snapshot — new matching contacts won't be added later.",
  },
];

const typeMeta = (id) => LIST_TYPES.find((t) => t.id === id) ?? LIST_TYPES[1];

const CREATE_LATENCY_MS = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// TYPE PICKER — two selectable cards.
// No DS node: the DS has no card-radio. Built on DS primitives instead —
// FormField's label row (Label/Medium in text/strong, h16, gap 4), the Input's
// radius 8 + border/field outline, and brand/primary-subtle for the selection,
// so it sits in the form without inventing a visual language.
// ─────────────────────────────────────────────────────────────────────────────

const TypeCard = ({ type, selected, onSelect }) => {
  const [hover, setHover] = useState(false);
  const I  = type.Icon;
  const fg = selected ? DS.brandOnSurface : DS.textStrong;

  return (
    <div
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(type.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        minWidth: 0,
        cursor: "pointer",
        padding: 12,
        boxSizing: "border-box",
        borderRadius: DS.radiusLg,
        border: `1px solid ${selected ? DS.brandPrimary : DS.borderField}`,
        background: selected ? DS.brandPrimarySubtle : hover ? DS.surfaceSubtle : DS.surfaceCanvas,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: `background ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <I s={16} c={selected ? DS.brandOnSurface : DS.textSecondary} />
        <span style={{ ...TY.labelLg, color: fg, fontFamily: DS.ff }}>{type.label}</span>
        {selected && (
          <span style={{ marginLeft: "auto", display: "flex" }}>
            <Ico.Check s={16} c={DS.brandOnSurface} />
          </span>
        )}
      </div>
      <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary, fontFamily: DS.ff }}>
        {type.desc}
      </span>
    </div>
  );
};

const TypePicker = ({ value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
    {/* Same label row as Molecules/FormField (484:115) */}
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 16 }}>
      <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff, whiteSpace: "nowrap" }}>
        List type
      </span>
    </div>
    <div role="radiogroup" style={{ display: "flex", gap: 12 }}>
      {LIST_TYPES.map((t) => (
        <TypeCard key={t.id} type={t} selected={value === t.id} onSelect={onChange} />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR — no DS node (the DS has no stepper). Built from DS tokens:
// brand/primary for the active step, the feedback/success pair for a completed
// one, border/default + text/secondary for the step still ahead.
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [{ n: 1, label: "List details" }, { n: 2, label: "Confirm" }];

const StepIndicator = ({ currentStep }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {STEPS.map((s, i) => {
      const done   = currentStep > s.n;
      const active = currentStep === s.n;
      const dotBg     = done ? DS.feedbackSuccessBg : active ? DS.brandPrimarySubtle : DS.surfaceSubtle;
      const dotBorder = done ? DS.feedbackSuccess   : active ? DS.brandPrimary       : DS.borderDefault;
      const fg        = done ? DS.feedbackSuccess   : active ? DS.brandOnSurface     : DS.textSecondary;
      return (
        <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: DS.radiusPill, boxSizing: "border-box",
              border: `1px solid ${dotBorder}`, background: dotBg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: `background ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
            }}>
              {done
                ? <Ico.Check s={12} c={fg} />
                : <span style={{ ...TY.captionSm, fontWeight: 500, color: fg, fontFamily: DS.ff }}>{s.n}</span>}
            </div>
            <span style={{ ...TY.labelMd, color: fg, fontFamily: DS.ff }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 24, height: 1, background: DS.borderDefault, margin: "0 8px" }} />
          )}
        </div>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CONFIRMATION
// A preview of the list about to be created (mirrors how it appears in Lists),
// rather than a receipt of the form fields. Uses the shared ConfirmSummaryCard.
// ─────────────────────────────────────────────────────────────────────────────

const Step2 = ({ name, description, type, folder, contactCount }) => {
  const t = typeMeta(type);
  const I = t.Icon;
  return (
    <ConfirmSummaryCard
      icon={<I s={20} c={t.fg} />}
      accent={{ bg: t.bg, fg: t.fg }}
      title={name}
      subtitle={folder}
      badge={<Badge tone={t.tone}>{t.label}</Badge>}
      description={description}
      metric={{
        value: contactCount.toLocaleString(),
        label: `contact${contactCount !== 1 ? "s" : ""} at creation`,
      }}
      note={{
        icon: <I s={14} c={DS.textSecondary} />,
        text: t.note,
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STATE — left-aligned per the DS text rule (centre only where Figma
// shows it), on the feedback/success pair.
// ─────────────────────────────────────────────────────────────────────────────

const CreatedState = ({ name, folder }) => (
  <SharedSuccessState title="List created">
    <strong style={{ fontWeight: 600, color: DS.textDefault }}>{name}</strong> has been created
    in {folder} successfully.
  </SharedSuccessState>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CreateListModal — create a new list from the current segment (simulated).
 *
 * Props:
 *   open          {boolean}
 *   onClose       {function}
 *   onCreated     {function}  — called with the created-list object on success
 *   contactCount  {number}    — contacts matched by the current segment
 *   segment       {object}    — the current segment definition (stored on the list)
 */
export default function CreateListModal({ open, onClose, onCreated, contactCount = 0, segment = null }) {
  const [step,   setStep]   = useState(1);
  const [name,   setName]   = useState("");
  const [description, setDescription] = useState("");
  const [type,   setType]   = useState("dynamic");
  const [folder, setFolder] = useState("");
  const [status, setStatus] = useState("idle"); // idle | creating | done
  const [wasOpen, setWasOpen] = useState(false);

  // Render-time reset on open (no effect) — matches ListFormPanel in ListsV3.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(1);
      setName("");
      setDescription("");
      setType("dynamic");
      setFolder("");
      setStatus("idle");
    }
  }

  if (!open) return null;

  const step1Valid = name.trim().length > 0 && !!folder;
  const creating   = status === "creating";
  const done       = status === "done";

  const handleCreate = () => {
    setStatus("creating");
    // Fake webservice call — no backend.
    setTimeout(() => {
      const created = {
        id:          `lst_${Date.now().toString(36)}`,
        name:        name.trim(),
        description: description.trim(),
        type,
        folder,
        contacts:  contactCount,
        segment,
        createdAt: new Date().toISOString(),
      };
      onCreated?.(created);
      setStatus("done");
    }, CREATE_LATENCY_MS);
  };

  // Footer — one Primary per view, Secondary alongside it (DS Button decision
  // tree: Cancel / Previous are Secondary, never Ghost, next to a Primary).
  let actions;
  if (done) {
    actions = <Btn type="Primary" size="Md" onClick={onClose}>Close</Btn>;
  } else if (step === 1) {
    actions = (
      <>
        <Btn type="Secondary" size="Md" onClick={onClose}>Cancel</Btn>
        <Btn type="Primary" size="Md" iconRight={<Ico.ChevRight />} disabled={!step1Valid} onClick={() => setStep(2)}>
          Next
        </Btn>
      </>
    );
  } else {
    actions = (
      <>
        <Btn type="Secondary" size="Md" disabled={creating} onClick={() => setStep(1)}>Back</Btn>
        <Btn type="Primary" size="Md" iconLeft={creating ? <Ico.Refresh /> : <Ico.Check />} disabled={creating} onClick={handleCreate}>
          {creating ? "Creating…" : "Create list"}
        </Btn>
      </>
    );
  }

  const footer = (
    // DS footer (1223:3664): a flexible spacer pushes the actions right, gap 8.
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{ flex: "1 0 0", minWidth: 0 }} />
      {actions}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Create a list" variant="center" size="md" footer={footer}>
      {/* DS Modal body (1223:3651): padding 24, column, gap 16 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24, minHeight: 240, boxSizing: "border-box" }}>
        {done ? (
          <CreatedState name={name.trim()} folder={folder} />
        ) : (
          <>
            <StepIndicator currentStep={step} />

            {step === 1 ? (
              <>
                <Field
                  label="List title"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Active buyers — Paris"
                  maxLength={80}
                  autoFocus
                />
                <TypePicker value={type} onChange={setType} />
                <Select
                  label="Folder"
                  required
                  value={folder}
                  onChange={setFolder}
                  options={FOLDERS.map((f) => ({ value: f, label: f }))}
                  placeholder="Select a folder…"
                />
                <TextArea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this list for? (optional)"
                  help="Optional — helps your team understand what the list is for."
                />
              </>
            ) : (
              <Step2
                name={name.trim()}
                description={description.trim()}
                type={type}
                folder={folder}
                contactCount={contactCount}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
