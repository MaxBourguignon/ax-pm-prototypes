import { useState } from "react";
import Modal from "../../components/Modal";
import { Btn } from "../../components/Btn";
import { Checkbox, Toggle } from "../../components/Controls";
import { Field } from "../../components/Field";
import Select from "../../components/Select";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { SuccessMark } from "../../components/Feedback";

// ─────────────────────────────────────────────────────────────────────────────
// ExportContactsModal — name the file, pick the columns, export (simulated).
//
// Built on the DS Organisms/Modal (1223:3646): gradient header, body padding
// 20/24/24 with gap 16, footer = Secondary + one Primary, right-aligned.
// Width 560 = the DS's widest documented composition ("Ajouter une opportunité",
// 2099:41154).
//
// The column picker follows the "Show advanced settings" disclosure of the mass
// import modal: one accordion row per field group (48px, label left, chevron
// right, borderBottom border/default — the SKILL §7 Accordion spec), opening
// onto the group's checkboxes. Deliberately spare: seven group rows fit without
// scrolling, so the row carries a name, a quiet "n of m" and the chevron —
// no counter pill, no open-state fill, and no field search to filter 26 labels
// that are all one click away.
//
// ⚠ No DS node for the picker itself: the DS has a column-config slot in
// TableToolbar but no panel behind it (the gap ColumnCustomizer lives in).
// Chrome follows the DS surface tokens and type scale; the grouped-checkbox
// interaction is codebase-only.
//
// Scope is the table selection — only selected contacts are exported, which is
// also why the Options menu that opens this stays disabled without one.
// ─────────────────────────────────────────────────────────────────────────────

// The sections, their order and their fields mirror the contact record's rail
// (ContactRecord.jsx — Personal information · Coordinates · Preferences ·
// Others), so the export offers the record as the user reads it, with lists and
// consents pulled out into their own part at the end.
// The engagement/spending group is gone: the record has no such section.
const FIELD_GROUPS = [
  {
    id: "personal",
    label: "Personal information",
    fields: [
      { key: "email",       label: "Email" },
      { key: "firstName",   label: "First name" },
      { key: "lastName",    label: "Last name" },
      { key: "dateOfBirth", label: "Date of birth" },
      { key: "age",         label: "Age" },
      { key: "civility",    label: "Civility" },
      { key: "gender",      label: "Gender" },
    ],
  },
  {
    id: "coordinates",
    label: "Coordinates",
    fields: [
      { key: "phone",      label: "Phone" },
      { key: "address",    label: "Address" },
      { key: "postalCode", label: "Postal code" },
      { key: "city",       label: "City" },
      { key: "country",    label: "Country" },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    fields: [
      { key: "favoriteAthlete", label: "Favorite athlete" },
      { key: "favoriteGenre",   label: "Favorite music genre" },
      { key: "favoriteVenue",   label: "Favorite venue" },
    ],
  },
  {
    id: "others",
    label: "Others",
    fields: [
      { key: "organisation",      label: "Organisation" },
      { key: "role",              label: "Role" },
      { key: "rolesStructures",   label: "Roles & structures" },
      { key: "createdAt",         label: "Created" },
      { key: "acquisitionSource", label: "Acquisition source" },
      { key: "contactId",         label: "Contact ID" },
    ],
  },
  // Lists and consents are not attributes of the contact — they are what the
  // contact belongs to and has agreed to — so `band` splits them out into their
  // own box under the record's fields.
  {
    id: "lists",
    label: "Lists",
    band: "memberships",
    fields: [
      { key: "lists", label: "Lists" },
    ],
  },
  {
    id: "consents",
    label: "Consents",
    band: "memberships",
    fields: [
      { key: "consents",      label: "Consents" },
      { key: "consentsSince", label: "Consent granted since" },
    ],
  },
];

const RECORD_GROUPS     = FIELD_GROUPS.filter((g) => !g.band);
const MEMBERSHIP_GROUPS = FIELD_GROUPS.filter((g) => g.band);

const ALL_KEYS = FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

// Opens on the seven columns the contacts table shows by default, so the export
// starts from what the user is already looking at.
const DEFAULT_KEYS = ["lastName", "firstName", "email", "age", "organisation", "postalCode", "country"];

const FORMATS = [
  { value: "xlsx", label: "Excel (.xlsx)" },
  { value: "csv",  label: "CSV (.csv)" },
];

const EXPORT_LATENCY_MS = 1100;

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");

const defaultFileName = () => `contacts-export-${new Date().toISOString().slice(0, 10)}`;

const KEYFRAMES = `
@keyframes axExportBar {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// ACCORDION GROUP — SKILL §7: h48 row, label left, chevron right, borderBottom.
// The header checkbox toggles the whole group; the rest of the row expands it.
// ─────────────────────────────────────────────────────────────────────────────

const AccordionGroup = ({ group, selected, onToggle, onToggleGroup, open, onOpenChange }) => {
  const count = group.fields.filter((f) => selected.has(f.key)).length;
  const all   = count === group.fields.length;

  return (
    <div>
      <div
        onClick={() => onOpenChange(!open)}
        style={{
          height: 48, padding: "0 12px", display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", background: "transparent",
          transition: `background ${DS.durFast} ${DS.ease}`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = DS.surfaceSubtle; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <span onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexShrink: 0 }}>
          <Checkbox checked={all} onChange={() => onToggleGroup(group, !all)} />
        </span>

        <span style={{ ...TY.bodySm, fontWeight: 600, color: DS.textStrong, fontFamily: DS.ff, flex: 1, minWidth: 0 }}>
          {group.label}
        </span>

        <span style={{ ...TY.labelMd, fontFamily: DS.ff, flexShrink: 0, color: DS.textMuted }}>
          {count} of {group.fields.length}
        </span>

        <span style={{
          display: "flex", flexShrink: 0,
          transform: open ? "rotate(180deg)" : "none",
          transition: `transform ${DS.durBase} ${DS.ease}`,
        }}>
          <Ico.ChevDown s={16} c={DS.textSecondary} />
        </span>
      </div>

      {open && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px",
          padding: "4px 12px 14px 38px",
        }}>
          {group.fields.map((f) => (
            <Checkbox
              key={f.key}
              checked={selected.has(f.key)}
              onChange={() => onToggle(f.key)}
              label={
                <span style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff }}>
                  {f.label}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* Lists and consents are included whole or not at all — there is nothing to
   unfold and nothing to pick inside — so they are a Switch, not an accordion.
   Per the DS rule (Checkbox vs Switch): a switch takes effect immediately,
   which is what toggling a column in this picker does. */
const MembershipRow = ({ group, selected, onToggleGroup }) => {
  const on = group.fields.every((f) => selected.has(f.key));
  return (
    <Toggle
      on={on}
      onChange={(next) => onToggleGroup(group, next)}
      label={
        <span style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff }}>
          Include {group.label.toLowerCase()}
        </span>
      }
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RUNNING / DONE
// ─────────────────────────────────────────────────────────────────────────────

const Running = () => (
  <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    <span style={{ ...TY.bodyMd, color: DS.textDefault, fontFamily: DS.ff }}>Preparing your export…</span>
    <div style={{ width: 220, height: 6, borderRadius: DS.radiusPill, background: DS.surfaceMuted, overflow: "hidden" }}>
      <div style={{
        width: "25%", height: "100%", borderRadius: DS.radiusPill,
        background: DS.actionPrimary, animation: "axExportBar 1.1s ease-in-out infinite",
      }} />
    </div>
    <style>{KEYFRAMES}</style>
  </div>
);

const Done = ({ fileName, rows, columns }) => (
  <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    {/* The badge is the shared one — every completion screen wears the same mark
        — while the rest of this screen stays its own: the file it produced is
        the point of it. */}
    <SuccessMark />
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: 0, ...TY.titleMd, color: DS.textStrong, fontFamily: DS.ff }}>Your export is ready</p>
      <p style={{ margin: "4px 0 0", ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
        {fmt(rows)} contact{rows === 1 ? "" : "s"} · {columns} column{columns === 1 ? "" : "s"}
      </p>
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", boxSizing: "border-box",
      padding: 12, borderRadius: DS.radiusLg, border: `1px solid ${DS.borderDefault}`, background: DS.surfaceCanvas,
    }}>
      <span style={{
        width: 36, height: 36, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.bgIcons,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ico.Export s={18} c={DS.actionPrimary} />
      </span>
      <span style={{ ...TY.bodySm, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff, wordBreak: "break-all" }}>
        {fileName}
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%", boxSizing: "border-box" }}>
      <span style={{ display: "flex", flexShrink: 0, paddingTop: 1 }}>
        <Ico.Info s={16} c={DS.textMuted} />
      </span>
      <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
        Large exports can take a few minutes to download. Keep this tab open until the file
        has finished downloading.
      </span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ExportContactsModal — export the contacts selected in the table.
 *
 * Props:
 *   open           {boolean}
 *   onClose        {function}
 *   selectedCount  {number}   contacts ticked in the table
 *   onExport       {function} ({ fileName, format, columns }) — fired on confirm
 */
export default function ExportContactsModal({ open, onClose, selectedCount = 0, onExport }) {
  const [phase,    setPhase]    = useState("configure"); // configure | running | done
  const [name,     setName]     = useState(defaultFileName);
  const [format,   setFormat]   = useState("xlsx");
  const [selected, setSelected] = useState(() => new Set(DEFAULT_KEYS));
  const [openIds,  setOpenIds]  = useState(() => new Set(["personal"]));
  const [wasOpen,  setWasOpen]  = useState(open);

  // Render-time reset, so every open starts from a clean configure step.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPhase("configure");
      setName(defaultFileName());
      setFormat("xlsx");
      setSelected(new Set(DEFAULT_KEYS));
      setOpenIds(new Set(["personal"]));
    }
  }

  if (!open) return null;

  const count    = selected.size;
  const trimmed  = name.trim();
  const fileName = `${trimmed || defaultFileName()}.${format}`;
  const canExport = count > 0 && trimmed.length > 0;

  const toggle = (key) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleGroup = (group, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      group.fields.forEach((f) => (on ? next.add(f.key) : next.delete(f.key)));
      return next;
    });

  const setGroupOpen = (id, on) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const handleExport = () => {
    if (!canExport) return;
    setPhase("running");
    onExport?.({ fileName, format, columns: [...selected] });
    setTimeout(() => setPhase("done"), EXPORT_LATENCY_MS);
  };

  let footer;
  if (phase === "configure") {
    footer = (
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
          {count} column{count === 1 ? "" : "s"} selected
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Btn type="Secondary" onClick={onClose}>Cancel</Btn>
          <Btn
            type="Primary"
            iconLeft={<Ico.Download s={16} c={canExport ? DS.textOnBrand : DS.textMuted} />}
            disabled={!canExport}
            onClick={handleExport}
          >
            Export
          </Btn>
        </div>
      </div>
    );
  } else if (phase === "running") {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Secondary" onClick={onClose}>Cancel</Btn>
      </div>
    );
  } else {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Secondary" onClick={onClose}>Close</Btn>
        <Btn type="Primary" iconLeft={<Ico.Download s={16} c={DS.textOnBrand} />} onClick={onClose}>
          Download file
        </Btn>
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Export contacts" variant="center" size="md" footer={footer}>
      {phase === "running" && <Running />}
      {phase === "done" && <Done fileName={fileName} rows={selectedCount} columns={count} />}

      {phase === "configure" && (
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Scope — the selection, stated rather than chosen */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
            padding: 12, borderRadius: DS.radiusLg,
            border: `1px solid ${DS.borderDefault}`, background: DS.feedbackInfoBg,
          }}>
            <span style={{
              width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.surfaceCanvas,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Ico.Users s={16} c={DS.actionPrimary} />
            </span>
            <span style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff }}>
              <strong style={{ fontWeight: 600 }}>
                {fmt(selectedCount)} selected contact{selectedCount === 1 ? "" : "s"}
              </strong>{" "}
              will be exported.
            </span>
          </div>

          {/* File name + format */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Field
              label="File name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contacts-export"
              // The field opens pre-filled, so the error only ever appears after
              // the user clears it — and the error message takes the help slot.
              error={trimmed ? undefined : "A file name is required."}
              help={`Saved as ${fileName}`}
              style={{ flex: 1, minWidth: 0 }}
            />
            <div style={{ width: 176, flexShrink: 0 }}>
              <Select label="File format" value={format} options={FORMATS} onChange={setFormat} />
            </div>
          </div>

          {/* Columns */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 28, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>
                Columns to export
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <Btn type="Ghost" size="Sm" onClick={() => setSelected(new Set(ALL_KEYS))}>Select all</Btn>
                <Btn type="Ghost" size="Sm" onClick={() => setSelected(new Set())}>Clear</Btn>
              </div>
            </div>

            <div style={{
              maxHeight: 220, overflowY: "auto",
              border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg,
              background: DS.surfaceCanvas, overflowX: "hidden",
            }}>
              {RECORD_GROUPS.map((group) => (
                <AccordionGroup
                  key={group.id}
                  group={group}
                  selected={selected}
                  onToggle={toggle}
                  onToggleGroup={toggleGroup}
                  open={openIds.has(group.id)}
                  onOpenChange={(on) => setGroupOpen(group.id, on)}
                />
              ))}
            </div>
          </div>

          {/* Advanced settings — what the contact BELONGS to rather than what it
              is. All-or-nothing, so each one is a switch, not a column group.
              Bare rows, no box: the switch is its own affordance and a container
              around two of them only adds chrome. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 28, display: "flex", alignItems: "center" }}>
              <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>
                Advanced settings
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MEMBERSHIP_GROUPS.map((group) => (
                <MembershipRow
                  key={group.id}
                  group={group}
                  selected={selected}
                  onToggleGroup={toggleGroup}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
