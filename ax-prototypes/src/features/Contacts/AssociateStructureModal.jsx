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
// Shell: DS Organisms/Modal (1223:3646) centre variant, body 20/24/24 with
// gap 16, footer Secondary + one Primary.
// The picker is the shared EntityPicker — the same control the list and consent
// flows search with, so "search a thing and choose it" looks the same everywhere.
// ─────────────────────────────────────────────────────────────────────────────

const ASSOCIATE_LATENCY_MS = 900;

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");

/**
 * Props:
 *   open           {boolean}
 *   onClose        {function}
 *   structures     [{ id, name }] — the set to search
 *   selectedCount  {number}  contacts ticked in the table
 *   onConfirm      {function} (structure) — fired on confirm
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

  const handleConfirm = () => {
    if (!picked) return;
    setPhase("running");
    onConfirm?.(picked);
    setTimeout(() => setPhase("done"), ASSOCIATE_LATENCY_MS);
  };

  const footer =
    phase === "done" ? (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Primary" onClick={onClose}>Close</Btn>
      </div>
    ) : (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Secondary" onClick={onClose}>Cancel</Btn>
        <Btn
          type="Primary"
          disabled={!picked || phase === "running"}
          onClick={handleConfirm}
        >
          {phase === "running" ? "Associating…" : "Associate"}
        </Btn>
      </div>
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Associate with a structure"
      variant="center"
      size="md"
      footer={footer}
    >
      {phase === "done" ? (
        <SuccessState title="Action completed">
          {fmt(selectedCount)} contact{selectedCount === 1 ? " has" : "s have"} been
          associated with {picked?.name} successfully.
        </SuccessState>
      ) : (
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ ...TY.bodySm, color: DS.textSecondary, fontFamily: DS.ff }}>
            The <strong style={{ fontWeight: 600, color: DS.textDefault }}>
              {fmt(selectedCount)} selected contact{selectedCount === 1 ? "" : "s"}
            </strong> will be attached to the structure you choose. A contact belongs
            to one structure at a time, so this replaces any current one.
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Same section label as "Selected lists" in the add-to-list modal. */}
            <div style={{ height: 28, display: "flex", alignItems: "center" }}>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
                textTransform: "uppercase", color: DS.textMuted, fontFamily: DS.ff,
              }}>
                Structure
              </span>
            </div>

            {picked ? (
              // Picked: the field is spent, so it gives way to the choice itself
              // with a way back rather than sitting there half-used.
              <div style={{
                display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box",
                padding: 12, borderRadius: DS.radiusLg,
                border: `1px solid ${DS.brandPrimary}`, background: DS.brandPrimarySubtle,
              }}>
                <span style={{
                  width: 32, height: 32, flexShrink: 0, borderRadius: DS.radiusMd, background: DS.surfaceCanvas,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ico.Organization s={16} c={DS.actionPrimary} />
                </span>
                <span style={{ ...TY.bodyMd, fontWeight: 600, color: DS.textDefault, fontFamily: DS.ff, flex: 1, minWidth: 0 }}>
                  {picked.name}
                </span>
                {/* Change drops the choice AND drops the list back open on the
                    full set — picking again is the only reason to press it. */}
                <Btn type="Ghost" size="Sm" onClick={() => { setPicked(null); setReopen(true); }}>Change</Btn>
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
