import { useMemo, useState } from "react";
import contactsData from "../../../contacts.json";
import Modal from "../../components/Modal";
import { Btn } from "../../components/Btn";
import Stepper from "../../components/Stepper";
import EntityPicker from "../../components/EntityPicker";
import { Radio } from "../../components/Controls";
import { Avatar, Badge } from "../../components/Tag";
import { SuccessState } from "../../components/Feedback";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// MergeContactsModal — merge a duplicate into the contact being kept.
//
// Same shell and manners as the other contact CTA modals (CreateListModal,
// AssociateStructureModal, ExportContactsModal):
//   DS Organisms/Modal (1223:3646), centre, one title for the whole flow
//   body   padding 20/24/24 · gap 16 · Stepper first (DS 1477:3166)
//   footer spacer + Secondary (Cancel / Back) + one Primary, right-aligned
//   flow   steps → running ("Merging…") → SuccessState + Close
// Width 720 (Modal size lg): the review step is a three-column comparison and
// the 560 the other modals use leaves each value ~170px.
//
//   1. Select contact   the kept contact is fixed; the duplicate is searched by
//                       name or email (shared EntityPicker), then shows as the
//                       picked card with "Change", like the structure picker.
//   2. Review data      only the fields that differ, Field · Kept · Removed;
//                       each value is a card with a DS Radio, one per row, the
//                       kept value picked by default. Identical fields fold
//                       into "N identical fields"; identifier, phone numbers
//                       (all kept) and notes (combined) sit apart, read-only.
//   3. Confirm          summary + irreversible warning (the bulk modals' amber
//                       banner), then "Merge contacts".
//
// Out of scope (spec): quick merge, preview panel, undo.
// Mock data: contacts.json carries no language — it is derived from the
// country (LANG_BY_COUNTRY) until the dataset has one.
// ─────────────────────────────────────────────────────────────────────────────

const MERGE_LATENCY_MS = 900;
const CONTACTS = Array.isArray(contactsData) ? contactsData : [];
const STEPS = ["Select contact", "Review data", "Confirm"];

const LANG_BY_COUNTRY = {
  France: "French", Belgium: "French", Switzerland: "French",
  "United Kingdom": "English", "United States": "English",
  Germany: "German", Italy: "Italian", Spain: "Spanish",
};

/* A raw contact in the details shape the record and the form use. */
function toDetails(c) {
  if (!c) return null;
  return {
    email: c.identity?.email ?? "",
    firstName: c.identity?.firstName ?? "",
    lastName: c.identity?.lastName ?? "",
    dateOfBirth: c.identity?.dateOfBirth ?? "",
    age: c.identity?.age ?? "",
    civility: c.identity?.civility ?? "",
    gender: c.identity?.gender ?? "",
    phones: [c.coordinates?.phone].filter(Boolean),
    addressLines: [c.coordinates?.address].filter(Boolean),
    postalCode: c.coordinates?.postalCode ?? "",
    city: c.coordinates?.city ?? "",
    country: c.coordinates?.country ?? "",
    organisation: c.structure ?? "",
    role: (c.accessControls || [])[0]?.role ?? "",
    notes: c.notes ?? "",
  };
}

const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/* The rows of step 2, in the spec's order. `read` turns details into the text
   shown; `take` copies the chosen side's value onto the merged contact. */
const FIELDS = [
  { key: "email", label: "Email" },
  { key: "civility", label: "Civility" },
  { key: "lastName", label: "Last name" },
  { key: "firstName", label: "First name" },
  { key: "gender", label: "Gender" },
  { key: "dateOfBirth", label: "Birthdate", read: (d) => fmtDate(d.dateOfBirth),
    take: (d) => ({ dateOfBirth: d.dateOfBirth, age: d.age }) },
  { key: "role", label: "Job title" },
  { key: "organisation", label: "Organization" },
  { key: "addressLines", label: "Address", read: (d) => (d.addressLines ?? []).join(", ") },
  { key: "postalCode", label: "Zip code" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "language", label: "Language", read: (d) => LANG_BY_COUNTRY[d.country] ?? "" },
];
const readField = (f, d) => String((f.read ? f.read(d) : d[f.key]) ?? "").trim();
const fullName = (d) => `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim() || "Unnamed contact";
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* The merged contact: kept values, overwritten where the removed side was
   picked; every phone kept once; notes combined, the removed one's last. */
function mergeDetails(kept, removed, picks) {
  const out = { ...kept };
  FIELDS.forEach((f) => {
    if (picks[f.key] !== "removed" || f.key === "language") return; // language follows the country here
    Object.assign(out, f.take ? f.take(removed) : { [f.key]: removed[f.key] });
  });
  out.phones = [...new Set([...(kept.phones ?? []), ...(removed.phones ?? [])])];
  out.notes = [kept.notes?.trim(), removed.notes?.trim() ? `Merged from ${fullName(removed)}:\n${removed.notes.trim()}` : ""]
    .filter(Boolean).join("\n\n");
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED BITS — lifted from the sibling modals so they read the same
// ─────────────────────────────────────────────────────────────────────────────

/* Same section label as "Structure" / "Selected lists" in the sibling modals. */
const SectionLabel = ({ children }) => (
  <div style={{ height: 28, display: "flex", alignItems: "center" }}>
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
      textTransform: "uppercase", color: DS.textMuted, fontFamily: DS.ff,
    }}>
      {children}
    </span>
  </div>
);

/* A contact as a row card. `picked` = the brand-tinted "chosen" card of the
   structure picker; otherwise the neutral card of a fixed value. */
const ContactCard = ({ details, badge, picked, action }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
    padding: 12, borderRadius: DS.radiusLg,
    border: `1px solid ${picked ? DS.brandPrimary : DS.borderDefault}`,
    background: picked ? DS.brandPrimarySubtle : DS.surfaceCanvas,
  }}>
    <Avatar name={fullName(details)} size={32} />
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <span style={{ ...TY.bodyMd, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {fullName(details)}
      </span>
      <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {details.email || "No email"}
      </span>
    </div>
    {badge}
    {action}
  </div>
);

/* The info box of ExportContactsModal's scope line: icon tile + text. */
const InfoBox = ({ icon, children }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 10, boxSizing: "border-box",
    padding: 12, borderRadius: DS.radiusLg,
    border: `1px solid ${DS.borderDefault}`, background: DS.feedbackInfoBg,
  }}>
    <span style={{
      width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.surfaceCanvas,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {icon}
    </span>
    <div style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff, display: "flex", flexDirection: "column", gap: 4, paddingTop: 6 }}>
      {children}
    </div>
  </div>
);

const Strong = ({ children }) => <strong style={{ fontWeight: 600, color: DS.textDefault }}>{children}</strong>;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — SELECT CONTACT
// ─────────────────────────────────────────────────────────────────────────────

const SelectStep = ({ primaryId, kept, removedRaw, reopen, onPick, onChange }) => {
  const entities = useMemo(() => CONTACTS
    .filter((c) => c.id !== primaryId) // the same contact cannot be picked
    .map((c) => ({ id: c.id, name: fullName(toDetails(c)), hint: c.identity?.email })), [primaryId]);
  const removed = toDetails(removedRaw);

  return (
    <>
      <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
        Choose the duplicate of <Strong>{fullName(kept)}</Strong>. Its history moves to the primary
        contact, and it is deleted once merged.
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Primary contact · kept</SectionLabel>
        <ContactCard details={kept} badge={<Badge tone="success">Kept</Badge>} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Contact to merge · removed</SectionLabel>
        {removed ? (
          // Picked: the field gives way to the choice, with a way back.
          <ContactCard
            details={removed}
            picked
            badge={<Badge tone="danger">Removed</Badge>}
            action={<Btn type="Ghost" size="Sm" onClick={onChange}>Change</Btn>}
          />
        ) : (
          <EntityPicker
            entities={entities}
            autoFocus={reopen}
            onSelect={onPick}
            placeholder="Search a contact by name or email…"
            emptyLabel={({ query }) => (query ? `No contact matches “${query}”` : "Start typing to search…")}
          />
        )}
      </div>

      {removedRaw && (
        <InfoBox icon={<Ico.Merge s={16} c={DS.actionPrimary} />}>
          <span>
            Moving to <Strong>{fullName(kept)}</Strong>:{" "}
            {[
              plural(removedRaw.tickets?.length ?? 0, "ticket"),
              plural(removedRaw.campaigns?.length ?? 0, "campaign interaction"),
              plural(removedRaw.consentHistory?.length ?? 0, "consent event"),
              plural(removedRaw.lists?.length ?? 0, "list membership"),
            ].join(" · ")}
          </span>
        </InfoBox>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — REVIEW DATA
// ─────────────────────────────────────────────────────────────────────────────

const COLS = "140px minmax(0, 1fr) minmax(0, 1fr)";

/* One value to keep, as a small card: the chosen one is outlined in brand on a
   brand-subtle fill, the other stays quiet (muted text) so the decision reads
   from the choice itself rather than from a row colour. */
const ValueOption = ({ name, text, checked, onSelect }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "8px 10px", borderRadius: DS.radiusLg, cursor: "pointer", boxSizing: "border-box", height: "100%",
        border: `1px solid ${checked ? DS.brandPrimary : hover ? DS.borderFocus : DS.borderDefault}`,
        background: checked ? DS.brandPrimarySubtle : DS.surfaceCanvas,
        transition: `border-color ${DS.durFast} ${DS.ease}, background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <Radio
        name={name}
        checked={checked}
        onChange={onSelect}
        label={(
          <span style={{
            ...TY.bodyMd, fontFamily: DS.ff, overflowWrap: "anywhere",
            color: !text ? DS.textMuted : checked ? DS.textDefault : DS.textSecondary,
          }}>
            {text || "Empty"}
          </span>
        )}
      />
    </div>
  );
};

const Plain = ({ children, empty, mono }) => (
  <div style={{
    padding: "8px 10px", ...TY.bodyMd, whiteSpace: "pre-wrap", overflowWrap: "anywhere",
    fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : DS.ff, fontSize: mono ? 12 : 14,
    color: empty ? DS.textMuted : DS.textDefault,
  }}>
    {children}
  </div>
);
const Value = ({ text, empty = "Empty", mono }) => <Plain empty={!text} mono={mono}>{text || empty}</Plain>;

const Row = ({ label, hint, kept, removed, first }) => (
  <div style={{
    display: "grid", gridTemplateColumns: COLS, alignItems: "stretch", columnGap: 8,
    padding: "6px 12px", borderTop: first ? "none" : `1px solid ${DS.borderSection}`, background: DS.surfaceCanvas,
  }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: "8px 0" }}>
      <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>{label}</span>
      {hint && <span style={{ ...TY.captionSm, color: DS.textSecondary, fontFamily: DS.ff }}>{hint}</span>}
    </div>
    {kept}
    {removed}
  </div>
);

/* Table shell = the DS Table container (radius 12, border/section). */
const Shell = ({ children }) => (
  <div style={{ border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl, overflow: "hidden" }}>
    {children}
  </div>
);

const ColumnsHeader = ({ kept, removed }) => (
  <div style={{
    display: "grid", gridTemplateColumns: COLS, alignItems: "center", columnGap: 8,
    padding: "10px 12px", background: DS.surfaceSubtle, borderBottom: `1px solid ${DS.borderSection}`,
  }}>
    <span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff }}>Field</span>
    {[[kept, "success", "Kept"], [removed, "danger", "Removed"]].map(([d, tone, word]) => (
      <div key={word} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", minWidth: 0 }}>
        <span style={{ ...TY.bodyMd, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fullName(d)}
        </span>
        <Badge tone={tone}>{word}</Badge>
      </div>
    ))}
  </div>
);

/* Collapsible block header — big arrow, as for every section disclosure. */
const Disclosure = ({ open, onToggle, label }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px",
      background: DS.surfaceSubtle, border: "none", cursor: "pointer", textAlign: "left",
      borderBottom: open ? `1px solid ${DS.borderSection}` : "none",
    }}
  >
    <span style={{ display: "flex", transform: open ? "rotate(180deg)" : "none", transition: `transform ${DS.durFast} ${DS.ease}` }}>
      <Ico.ArrowDown s={14} c={DS.textStrong} />
    </span>
    <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>{label}</span>
  </button>
);

const ReviewStep = ({ kept, removed, primaryId, removedId, picks, setPick }) => {
  const [showSame, setShowSame] = useState(false);
  const diffs = FIELDS.filter((f) => readField(f, kept) !== readField(f, removed));
  const same = FIELDS.filter((f) => readField(f, kept) === readField(f, removed));
  const taken = diffs.filter((f) => picks[f.key] === "removed").length;
  const allPhones = [...new Set([...(kept.phones ?? []), ...(removed.phones ?? [])])];

  return (
    <>
      <InfoBox icon={<Ico.Info s={16} c={DS.actionPrimary} />}>
        <span>Some information differs between the two contacts. Select which values you want to keep for the final contact.</span>
        <span><Strong>All history</Strong> (sales, consents, marketing data) is transferred to the primary contact. Notes are combined.</span>
      </InfoBox>

      {/* 1 — Only the fields that need a decision. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <SectionLabel>{diffs.length ? `${plural(diffs.length, "field")} to review` : "Fields to review"}</SectionLabel>
          {diffs.length > 0 && (
            <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
              {plural(taken, "value")} taken from {fullName(removed)}
            </span>
          )}
        </div>
        <Shell>
          <ColumnsHeader kept={kept} removed={removed} />
          {diffs.length ? diffs.map((f, i) => {
            const pick = picks[f.key] ?? "kept";
            return (
              <Row
                key={f.key}
                first={i === 0}
                label={f.label}
                hint={f.key === "language" ? "Follows the country here" : undefined}
                kept={<ValueOption name={f.key} text={readField(f, kept)} checked={pick === "kept"} onSelect={() => setPick(f.key, "kept")} />}
                removed={<ValueOption name={f.key} text={readField(f, removed)} checked={pick === "removed"} onSelect={() => setPick(f.key, "removed")} />}
              />
            );
          }) : (
            <div style={{ padding: 16, ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
              Both contacts hold the same information — nothing to choose.
            </div>
          )}
        </Shell>
      </div>

      {/* 2 — Identical fields, folded away: there to check, not to decide. */}
      {same.length > 0 && (
        <Shell>
          <Disclosure open={showSame} onToggle={() => setShowSame((v) => !v)} label={`${plural(same.length, "identical field")}`} />
          {showSame && same.map((f, i) => (
            <Row key={f.key} first={i === 0} label={f.label} kept={<Value text={readField(f, kept)} />} removed={<Value text={readField(f, removed)} />} />
          ))}
        </Shell>
      )}

      {/* 3 — Handled automatically: no choice, just what will happen. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Handled automatically</SectionLabel>
        <Shell>
          <Row first label="Identifier" hint="The primary one is kept" kept={<Value text={primaryId} mono />} removed={<Value text={removedId} mono />} />
          <Row label="Phone number" hint={`All kept · ${plural(allPhones.length, "number")}`} kept={<Value text={(kept.phones ?? []).join("\n")} />} removed={<Value text={(removed.phones ?? []).join("\n")} />} />
          <Row label="Notes" hint="Combined" kept={<Value text={kept.notes?.trim()} empty="No notes" />} removed={<Value text={removed.notes?.trim()} empty="No notes" />} />
        </Shell>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — CONFIRM
// ─────────────────────────────────────────────────────────────────────────────

const SummaryRow = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
    <span style={{ ...TY.labelMd, fontWeight: 400, color: DS.textSecondary, fontFamily: DS.ff, flexShrink: 0, paddingTop: 2 }}>{label}</span>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end", textAlign: "right", ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff }}>
      {children}
    </div>
  </div>
);

const ConfirmStep = ({ kept, removed, picks }) => {
  const taken = FIELDS.filter((f) => picks[f.key] === "removed" && readField(f, kept) !== readField(f, removed));
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Contact to keep</SectionLabel>
        <ContactCard details={kept} badge={<Badge tone="success">Kept</Badge>} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <SectionLabel>Contact to merge</SectionLabel>
        <ContactCard details={removed} badge={<Badge tone="danger">Will be removed</Badge>} />
      </div>

      {/* Summary — the receipt box of the add/remove modals. */}
      <div style={{
        background: DS.surfaceSubtle, border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg,
        padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8,
      }}>
        <SummaryRow label={`Values from ${fullName(removed)}`}>
          {taken.length ? taken.map((f) => <Badge key={f.key}>{f.label}</Badge>) : "None"}
        </SummaryRow>
        <div style={{ height: 1, background: DS.borderDefault }} />
        <SummaryRow label="Combined">Phone numbers · notes</SummaryRow>
        <div style={{ height: 1, background: DS.borderDefault }} />
        <SummaryRow label="Transferred">Sales, consents and marketing history</SummaryRow>
      </div>

      {/* Warning — the amber banner of the bulk add/remove confirm step. */}
      <div style={{
        background: DS.feedbackWarningBg, border: `1px solid ${DS.feedbackWarning}`, borderRadius: DS.radiusLg,
        padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <span style={{ display: "flex", flexShrink: 0, paddingTop: 1 }}><Ico.Alert s={16} c={DS.feedbackWarning} /></span>
        <span style={{ ...TY.bodySm, color: DS.orange800, fontFamily: DS.ff }}>
          <strong style={{ fontWeight: 600 }}>This action is irreversible.</strong> The merged contact cannot be restored.
        </span>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props:
 *   open · onClose
 *   primaryId    {string}  the contact kept
 *   primary      {object}  optional — the kept contact's live details (the
 *                          record's edited state), ContactFormDrawer's shape
 *   secondaryId  {string}  optional — preselects the contact to merge (bulk
 *                          action with two contacts ticked)
 *   onConfirm    {function} (mergedDetails, removedContact) — fired on merge
 */
export default function MergeContactsModal({ open, onClose, primaryId, primary, secondaryId, onConfirm }) {
  const [step, setStep] = useState(1);
  const [removedId, setRemovedId] = useState(null);
  const [picks, setPicks] = useState({});
  const [reopen, setReopen] = useState(false);       // arrived back via "Change"
  const [phase, setPhase] = useState("steps");       // steps | running | done
  const [wasOpen, setWasOpen] = useState(false);

  // Render-time reset, so every open starts clean.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(1); setPicks({}); setReopen(false); setPhase("steps");
      setRemovedId(secondaryId && secondaryId !== primaryId ? secondaryId : null);
    }
  }

  const kept = primary ?? toDetails(CONTACTS.find((c) => c.id === primaryId));
  const removedRaw = CONTACTS.find((c) => c.id === removedId) ?? null;
  const removed = toDetails(removedRaw);

  if (!open || !kept) return null;

  const handleMerge = () => {
    setPhase("running");
    onConfirm?.(mergeDetails(kept, removed, picks), removedRaw);
    setTimeout(() => setPhase("done"), MERGE_LATENCY_MS);
  };

  let actions;
  if (phase === "done") {
    actions = <Btn type="Primary" size="Md" onClick={onClose}>Close</Btn>;
  } else if (step === 1) {
    actions = (
      <>
        <Btn type="Secondary" size="Md" onClick={onClose}>Cancel</Btn>
        <Btn type="Primary" size="Md" iconRight={<Ico.ArrowRightSmall />} disabled={!removed} onClick={() => setStep(2)}>Next</Btn>
      </>
    );
  } else if (step === 2) {
    actions = (
      <>
        <Btn type="Secondary" size="Md" onClick={() => setStep(1)}>Back</Btn>
        <Btn type="Primary" size="Md" iconRight={<Ico.ArrowRightSmall />} onClick={() => setStep(3)}>Next</Btn>
      </>
    );
  } else {
    const running = phase === "running";
    actions = (
      <>
        <Btn type="Secondary" size="Md" disabled={running} onClick={() => setStep(2)}>Back</Btn>
        <Btn type="Primary" size="Md" iconLeft={running ? <Ico.Refresh /> : <Ico.Merge />} disabled={running} onClick={handleMerge}>
          {running ? "Merging…" : "Merge contacts"}
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
    <Modal open={open} onClose={onClose} title="Merge contacts" variant="center" size="lg" footer={footer}>
      {phase === "done" ? (
        <SuccessState title="Contacts merged">
          <Strong>{fullName(removed)}</Strong> has been merged into <Strong>{fullName(kept)}</Strong> successfully.
        </SuccessState>
      ) : (
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16, minHeight: 240, boxSizing: "border-box" }}>
          <Stepper steps={STEPS} current={step - 1} />
          {step === 1 && (
            <SelectStep
              primaryId={primaryId}
              kept={kept}
              removedRaw={removedRaw}
              reopen={reopen}
              onPick={(id) => { setRemovedId(id); setPicks({}); }}
              onChange={() => { setRemovedId(null); setReopen(true); }}
            />
          )}
          {step === 2 && removed && (
            <ReviewStep
              kept={kept} removed={removed} primaryId={primaryId} removedId={removedId}
              picks={picks} setPick={(k, v) => setPicks((p) => ({ ...p, [k]: v }))}
            />
          )}
          {step === 3 && removed && <ConfirmStep kept={kept} removed={removed} picks={picks} />}
        </div>
      )}
    </Modal>
  );
}
