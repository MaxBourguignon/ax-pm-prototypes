import { useState } from "react";
import Modal from "../../components/Modal";
import { Btn } from "../../components/Btn";
import EntityPicker from "../../components/EntityPicker";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { SuccessState } from "../../components/Feedback";

// ─────────────────────────────────────────────────────────────────────────────
// AssociateStructureModal — attach the selected contacts to ONE structure.
//
// Deliberately a single step, unlike EntityActionModal (the two-step add/remove
// flow behind ListActionModal and ConsentActionModal): a contact belongs to one
// structure at a time, so there is nothing to accumulate and nothing to review —
// pick it, confirm it.
//
// Same DS/UX language as MergeContactsModal (the reference CTA modal):
//   Shell   DS Organisms/Modal (1223:3646) centre, body 20/24/24 gap 16
//   Body    scope InfoBox · "Structure" section label · EntityPicker, which
//           gives way to the brand-tinted picked card with "Change"
//           The top message also says that a current structure is replaced —
//           no separate warning once a structure is picked.
//   Footer  spacer · Tertiary Cancel · Primary "Associate" (no icon)
//   After   running label → SuccessState with Close
// ─────────────────────────────────────────────────────────────────────────────

const ASSOCIATE_LATENCY_MS = 900;

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");
const plural = (n, one, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`;

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

const IconTile = ({ children }) => (
  <span style={{
    width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.surfaceCanvas,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    {children}
  </span>
);

const Note = ({ icon, children }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
    padding: 12, borderRadius: DS.radiusLg,
    border: `1px solid ${DS.borderDefault}`, background: DS.feedbackInfoBg,
  }}>
    <IconTile>{icon}</IconTile>
    <div style={{ ...TY.bodySm, color: DS.textDefault, fontFamily: DS.ff, flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const Strong = ({ children }) => <strong style={{ fontWeight: 600, color: DS.textDefault }}>{children}</strong>;

/**
 * Props:
 *   open               {boolean}
 *   onClose            {function}
 *   structures         [{ id, name }] — the set to search
 *   selectedCount      {number}  contacts ticked in the table
 *   onConfirm          {function} (structure) — fired on confirm
 */
export default function AssociateStructureModal({
  open,
  onClose,
  structures = [],
  selectedCount = 0,
  onConfirm,
}) {
  const [picked,  setPicked]  = useState(null);   // structure object
  const [reopen,  setReopen]  = useState(false);  // arrived back via "Change"
  const [phase,   setPhase]   = useState("pick"); // pick | running | done
  const [wasOpen, setWasOpen] = useState(open);

  // Render-time reset, so every open starts clean.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setPicked(null); setPhase("pick"); setReopen(false); }
  }

  if (!open) return null;

  const running = phase === "running";
  const handleConfirm = () => {
    if (!picked) return;
    setPhase("running");
    onConfirm?.(picked);
    setTimeout(() => setPhase("done"), ASSOCIATE_LATENCY_MS);
  };

  const actions = phase === "done" ? (
    <Btn type="Primary" size="Md" onClick={onClose}>Close</Btn>
  ) : (
    <>
      <Btn type="Tertiary" size="Md" disabled={running} onClick={onClose}>Cancel</Btn>
      <Btn type="Primary" size="Md" disabled={!picked || running} onClick={handleConfirm}>
        {running ? "Associating…" : "Associate"}
      </Btn>
    </>
  );

  const footer = (
    // DS footer (1223:3664): a flexible spacer pushes the actions right, gap 8.
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{ flex: "1 0 0", minWidth: 0 }} />
      {actions}
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Associate with a structure" variant="center" size="md" footer={footer}>
      {phase === "done" ? (
        <SuccessState title="Contacts associated">
          {plural(selectedCount, "contact")} {selectedCount === 1 ? "is" : "are"} now associated
          with <Strong>{picked?.name}</Strong>.
        </SuccessState>
      ) : (
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Note icon={<Ico.Users s={16} c={DS.actionPrimary} />}>
            The <Strong>{plural(selectedCount, "selected contact")}</Strong> will be attached to the
            structure you choose.
            <br />
            A contact belongs to one structure at a time, so this replaces any structure it is
            already associated with.
          </Note>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SectionLabel>Structure</SectionLabel>
            {picked ? (
              // Picked: the field gives way to the choice, with a way back.
              <div style={{
                display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
                padding: 12, borderRadius: DS.radiusLg,
                border: `1px solid ${DS.brandPrimary}`, background: DS.brandPrimarySubtle,
              }}>
                <IconTile><Ico.Organization s={16} c={DS.actionPrimary} /></IconTile>
                <span style={{ flex: 1, minWidth: 0, ...TY.bodyMd, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {picked.name}
                </span>
                {/* Change drops the choice and reopens the list on the full set. */}
                <Btn type="Ghost" size="Sm" disabled={running} onClick={() => { setPicked(null); setReopen(true); }}>Change</Btn>
              </div>
            ) : (
              <EntityPicker
                entities={structures}
                autoFocus={reopen}
                onSelect={(id) => setPicked(structures.find((s) => s.id === id) ?? null)}
                placeholder="Search a structure…"
                emptyLabel={({ query }) =>
                  query ? `No structure matches “${query}”` : "Start typing to search…"}
              />
            )}
          </div>

        </div>
      )}
    </Modal>
  );
}
