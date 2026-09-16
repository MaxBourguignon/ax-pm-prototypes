import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Btn } from "../../components/Btn";
import { Field, TextArea } from "../../components/Field";
import { Select } from "../../components/Select";
import ConfirmSummaryCard from "../../components/ConfirmSummaryCard";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// CreateListModal — turn the current segment into a new list (fully simulated).
// Built on the shared AX Modal + Btn + Field + Select components, so it shares
// the app-wide dialog language rather than a Contacts-local copy.
//
// Flow: Step 1 (details) → Step 2 (confirm) → fake create → success.
// Folder names + type options mirror src/features/Lists/ListsV3.jsx.
// ─────────────────────────────────────────────────────────────────────────────

const FOLDERS = ["Loyalty & VIP", "Campaigns", "Events", "Retail", "Reactivation", "Imports", "B2B", "Compliance"];

const LIST_TYPES = [
  {
    id:    "dynamic",
    label: "Dynamic",
    icon:  (c) => <Ico.Refresh s={16} c={c} />,
    desc:  "Auto-updates as contacts start or stop matching the segment.",
  },
  {
    id:    "static",
    label: "Static",
    icon:  (c) => <Ico.List s={16} c={c} />,
    desc:  "A fixed snapshot of the contacts matching right now.",
  },
];

const CREATE_LATENCY_MS = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// TYPE PICKER — two selectable cards (matches the shared field label style)
// ─────────────────────────────────────────────────────────────────────────────

const TypePicker = ({ value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <label style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff }}>List type</label>
    <div style={{ display: "flex", gap: 10 }}>
      {LIST_TYPES.map((t) => {
        const isSel = value === t.id;
        return (
          <div key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1, cursor: "pointer", padding: "12px 14px", borderRadius: 6,
              border: `1.5px solid ${isSel ? DS.actionPrimary : DS.borderDefault}`,
              background: isSel ? DS.blue100 : DS.bgCard, transition: "all .15s",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              {t.icon(isSel ? DS.actionPrimary : DS.textSecondary)}
              <span style={{ ...TY.b2, fontWeight: 600, color: isSel ? DS.actionPrimary : DS.textDefault, fontFamily: DS.ff }}>
                {t.label}
              </span>
              {isSel && <div style={{ marginLeft: "auto" }}><Ico.Check s={14} c={DS.actionPrimary} /></div>}
            </div>
            <div style={{ ...TY.b3, color: DS.textSecondary, fontFamily: DS.ff }}>
              {t.desc}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR — light bar, sits at the top of the body
// ─────────────────────────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }) => {
  const steps = [{ n: 1, label: "List details" }, { n: 2, label: "Confirm" }];
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 0" }}>
      {steps.map((s, i) => {
        const done   = currentStep > s.n;
        const active = currentStep === s.n;
        const dotBg     = done ? DS.teal100 : active ? DS.blue100 : DS.bgSurface;
        const dotBorder = done ? DS.teal500 : active ? DS.actionPrimary : DS.borderDefault;
        const dotColor  = done ? DS.teal500 : active ? DS.actionPrimary : DS.textSecondary;
        const textColor = done ? DS.teal500 : active ? DS.actionPrimary : DS.textSecondary;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `1.5px solid ${dotBorder}`, background: dotBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all .2s",
              }}>
                {done
                  ? <Ico.Check s={10} c={dotColor} />
                  : <span style={{ ...TY.b3, fontSize: 10, fontWeight: 700, color: dotColor, fontFamily: DS.ff }}>{s.n}</span>}
              </div>
              <span style={{ ...TY.b3, fontWeight: 500, color: textColor, fontFamily: DS.ff, transition: "color .2s" }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 20, height: 1, background: DS.borderDefault, margin: "0 8px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CONFIRMATION
// A preview of the list about to be created (mirrors how it appears in Lists),
// rather than a receipt of the form fields. Uses the shared ConfirmSummaryCard.
// ─────────────────────────────────────────────────────────────────────────────

// Type identity mirrors src/features/Lists/ListsV3.jsx (dynamic = teal Zap,
// static = blue List) so the preview reads as a rehearsal of the real item.
const TYPE_META = {
  dynamic: { label: "Dynamic", bg: DS.green100, fg: DS.green500, Icon: Ico.Zap },
  static:  { label: "Static",  bg: DS.blue100,  fg: DS.actionPrimary,  Icon: Ico.List },
};

const TypeBadge = ({ bg, fg, icon, label }) => {
  const I = icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 999,
      padding: "3px 9px", background: bg, color: fg, ...TY.b3, fontWeight: 500, fontFamily: DS.ff,
    }}>
      <I s={12} c={fg} />{label}
    </span>
  );
};

const Step2 = ({ name, description, type, folder, contactCount }) => {
  const t = TYPE_META[type] ?? TYPE_META.static;
  const I = t.Icon;
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <ConfirmSummaryCard
        icon={<I s={20} c={t.fg} />}
        accent={{ bg: t.bg, fg: t.fg }}
        title={name}
        subtitle={folder}
        badge={<TypeBadge bg={t.bg} fg={t.fg} icon={t.Icon} label={t.label} />}
        description={description}
        metric={{
          value: contactCount.toLocaleString(),
          label: `contact${contactCount !== 1 ? "s" : ""} at creation`,
        }}
        note={{
          icon: <t.Icon s={13} c={DS.textSecondary} />,
          text: type === "dynamic"
            ? "This list keeps updating automatically as contacts start or stop matching the segment."
            : "This list is a fixed snapshot — new matching contacts won't be added later.",
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STATE
// ─────────────────────────────────────────────────────────────────────────────

const SuccessState = ({ name, folder }) => (
  <div style={{ padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: DS.teal100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ico.Check s={24} c={DS.teal500} />
    </div>
    <div style={{ ...TY.h4, color: DS.textDefault, fontFamily: DS.ff }}>List created</div>
    <div style={{ ...TY.b2, color: DS.textSecondary, fontFamily: DS.ff, maxWidth: 320 }}>
      <strong style={{ color: DS.textDefault }}>{name}</strong> has been created in <strong style={{ color: DS.textDefault }}>{folder}</strong>.
    </div>
  </div>
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

  // Footer varies by step / status
  let footer = null;
  if (done) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Primary" size="Medium" onClick={onClose}>Close</Btn>
      </div>
    );
  } else if (step === 1) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" onClick={onClose}>Cancel</Btn>
        <Btn type="Primary" size="Medium" iconRight={<Ico.ChevRight />} disabled={!step1Valid} onClick={() => setStep(2)}>Next</Btn>
      </div>
    );
  } else {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" disabled={creating} onClick={() => setStep(1)}>Back</Btn>
        <Btn type="Primary" size="Medium" iconLeft={creating ? <Ico.Refresh /> : <Ico.Check />} disabled={creating} onClick={handleCreate}>
          {creating ? "Creating…" : "Create list"}
        </Btn>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a list"
      variant="center"
      width={600}
      footer={footer}
    >
      {done ? (
        <SuccessState name={name.trim()} folder={folder} />
      ) : (
        <>
          <StepIndicator currentStep={step} />

          <div style={{ minHeight: 220, paddingBottom: 24 }}>
            {step === 1 && (
              <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 16 }}>
                <Field
                  label={<>List title <span style={{ color: DS.feedbackError }}>*</span></>}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Active buyers — Paris"
                  maxLength={80}
                  autoFocus
                />
                <TypePicker value={type} onChange={setType} />
                <Select
                  label={<>Folder <span style={{ color: DS.feedbackError }}>*</span></>}
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
                  rows={3}
                />
              </div>
            )}
            {step === 2 && (
              <Step2 name={name.trim()} description={description.trim()} type={type} folder={folder} contactCount={contactCount} />
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
