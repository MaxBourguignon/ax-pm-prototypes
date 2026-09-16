import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Modal } from "../../components/Modal";
import { Btn } from "../../components/Btn";
import { Checkbox } from "../../components/Controls";
import { Badge, RemovableChip } from "../../components/Tag";
import { DS } from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// EntityActionModal — reusable "add/remove contacts to/from an entity" flow.
// The entity is generic (a list, a consent, …): callers pass the entities to
// pick from and a `modes` config that holds the per-mode wording. Lists and
// consents share this one component via thin wrappers (ListActionModal,
// ConsentActionModal) so the two flows never drift apart.
//
// A `modes` entry looks like:
//   {
//     title, searchPlaceholder, selectedSection, emptySelected, warningText,
//     summaryContactLabel, summaryEntityLabel, confirmBtnLabel,
//     successTitle, successBody(contactCount, entityCount)
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep, step1Label }) => {
  const steps = [{ n: 1, label: step1Label }, { n: 2, label: "Confirm" }];
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px 0" }}>
      {steps.map((s, i) => {
        const done   = currentStep > s.n;
        const active = currentStep === s.n;
        const dotBg     = done ? DS.feedbackSuccessBg : active ? DS.brandPrimarySubtle : DS.surfaceSubtle;
        const dotBorder = done ? DS.teal500 : active ? DS.actionPrimary : DS.borderDefault;
        const dotColor  = done ? DS.teal500 : active ? DS.actionPrimary : DS.textMuted;
        const textColor = done ? DS.teal500 : active ? DS.actionPrimary : DS.textMuted;
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
                  : <span style={{ fontSize: 10, fontWeight: 700, color: dotColor, fontFamily: DS.ff }}>{s.n}</span>
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: textColor, fontFamily: DS.ff, transition: "color .2s" }}>
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
// PORTAL DROPDOWN — renders outside modal so it is never clipped
// ─────────────────────────────────────────────────────────────────────────────

const PortalDropdown = ({ anchorRef, children }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!anchorRef.current) return;
    setRect(anchorRef.current.getBoundingClientRect());
  }, [anchorRef]);

  if (!rect) return null;

  return createPortal(
    <div style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}>
      {children}
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — ENTITY SELECTION
// ─────────────────────────────────────────────────────────────────────────────

const Step1 = ({ entities, selectedIds, onToggle, cfg, countUnit }) => {
  const [search,   setSearch]   = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const searchRef = useRef();
  const wrapRef   = useRef();

  useEffect(() => {
    if (!dropOpen) return;
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropOpen]);

  const trimmed  = search.trim().toLowerCase();
  const filtered = entities.filter(e =>
    (!trimmed || e.name.toLowerCase().includes(trimmed)) &&
    !selectedIds.has(e.id)
  );

  const handleSelect = (id) => {
    onToggle(id);
    setSearch("");
    setDropOpen(false);
    searchRef.current?.focus();
  };

  const selectedEntities = entities.filter(e => selectedIds.has(e.id));

  return (
    <div style={{ padding: "20px 20px 0" }}>

      {/* Search + portal dropdown */}
      <div ref={wrapRef} style={{ position: "relative", marginBottom: 16 }}>
        <SearchBox
          value={search}
          placeholder={cfg.searchPlaceholder}
          onChange={(v) => { setSearch(v); setDropOpen(true); }}
          onFocus={() => setDropOpen(true)}
          inputRef={searchRef}
        />

        {dropOpen && (
          <PortalDropdown anchorRef={wrapRef}>
            <div style={{
              background: DS.surfaceCanvas,
              border: `1px solid ${DS.borderDefault}`,
              borderRadius: 6,
              boxShadow: "0 12px 32px rgba(15,23,42,.2)",
              maxHeight: 180,
              overflowY: "auto",
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "12px 14px", fontSize: 12, color: DS.textMuted, fontFamily: DS.ff }}>
                  {trimmed
                    ? "No match found"
                    : selectedIds.size === entities.length
                      ? "Everything is already selected"
                      : "Start typing to search…"}
                </div>
              ) : filtered.map((e, i) => (
                <DropdownItem
                  key={e.id}
                  entity={e}
                  countUnit={countUnit}
                  isLast={i === filtered.length - 1}
                  onSelect={() => handleSelect(e.id)}
                />
              ))}
            </div>
          </PortalDropdown>
        )}
      </div>

      {/* Selected entities — always visible */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
          textTransform: "uppercase", color: DS.textMuted,
          fontFamily: DS.ff, marginBottom: 8,
        }}>
          {cfg.selectedSection}
        </div>

        {selectedEntities.length === 0 ? (
          <div style={{
            padding: "10px 12px",
            border: `1px dashed ${DS.borderDefault}`,
            borderRadius: 6,
            fontSize: 12, color: DS.textMuted, fontFamily: DS.ff,
          }}>
            {cfg.emptySelected}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedEntities.map(e => (
              <SelectedChip key={e.id} entity={e} onRemove={() => onToggle(e.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SearchBox = ({ value, onChange, onFocus, inputRef, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36,
      border: `1px solid ${focused ? DS.actionPrimary : DS.borderDefault}`,
      borderRadius: 4, background: DS.surfaceSubtle, transition: "border-color .15s",
    }}>
      <Ico.Search s={14} c={DS.textMuted} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: DS.ff, fontSize: 13, color: DS.textStrong }}
      />
      {value && (
        <span onClick={() => onChange("")} style={{ cursor: "pointer", fontSize: 11, color: DS.textMuted, lineHeight: 1 }}>✕</span>
      )}
    </div>
  );
};

const DropdownItem = ({ entity, countUnit, isLast, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={e => { e.preventDefault(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
        cursor: "pointer",
        borderBottom: isLast ? "none" : `0.5px solid ${DS.borderDefault}`,
        background: hovered ? DS.brandPrimarySubtle : DS.surfaceCanvas,
        transition: "background .1s",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: hovered ? DS.actionPrimary : DS.textStrong, fontFamily: DS.ff, lineHeight: "18px", transition: "color .1s" }}>
          {entity.name}
        </div>
        {entity.count != null && (
          <div style={{ fontSize: 11, color: DS.textMuted, fontFamily: DS.ff, marginTop: 1 }}>
            {entity.count.toLocaleString()} {countUnit}
          </div>
        )}
      </div>
      <Ico.Plus s={13} c={hovered ? DS.actionPrimary : DS.textMuted} />
    </div>
  );
};

// DS Atoms/Chip (556:2973) — the removable pill, via the shared atom.
const SelectedChip = ({ entity, onRemove }) => (
  <RemovableChip onRemove={onRemove}>{entity.name}</RemovableChip>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────

const Step2 = ({ selectedContactCount, selectedEntities, confirmValue, onConfirmChange, ackChecked, onAckChange, cfg }) => {
  const inputRef = useRef();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const isValid   = confirmValue === "1";
  const isInvalid = confirmValue !== "" && !isValid;

  const inputBorder = isValid ? DS.feedbackSuccess   : isInvalid ? DS.feedbackError   : DS.borderDefault;
  const inputBg     = isValid ? DS.feedbackSuccessBg : isInvalid ? DS.feedbackErrorBg : DS.surfaceCanvas;
  const inputColor  = isValid ? DS.green800     : isInvalid ? DS.feedbackError   : DS.textStrong;
  const hintColor   = isValid ? DS.feedbackSuccess   : isInvalid ? DS.feedbackError   : DS.textMuted;
  const hintText    = isValid
    ? "✓ Confirmed — you can proceed"
    : isInvalid
    ? "The value does not match the expected number."
    : "This safeguard prevents accidental bulk operations.";

  return (
    <div style={{ padding: "20px 20px 0" }}>

      {/* Warning banner — same amber style for both modes */}
      <div style={{
        background: DS.feedbackWarningBg, border: `1px solid ${DS.feedbackWarning}`,
        borderRadius: 6, padding: "12px 14px",
        display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16,
      }}>
        <div style={{ flexShrink: 0, marginTop: 1, placeItems: "center" }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={DS.amber600} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2L2 17h16L10 2z"/><path d="M10 9v4"/><circle cx="10" cy="15.5" r=".5" fill={DS.amber100}/>
          </svg>
        </div>
        <div style={{ fontSize: 12, color: DS.orange800, lineHeight: "18px", fontFamily: DS.ff }}>
          {cfg.warningText}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        background: DS.surfaceSubtle, border: `1px solid ${DS.borderDefault}`,
        borderRadius: 6, padding: "10px 14px", marginBottom: 24,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: DS.textMuted, fontFamily: DS.ff }}>{cfg.summaryContactLabel}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: DS.textStrong, fontFamily: DS.ff }}>
            {selectedContactCount} contact{selectedContactCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ height: 1, background: DS.borderDefault }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, color: DS.textMuted, fontFamily: DS.ff, flexShrink: 0, paddingTop: 2 }}>{cfg.summaryEntityLabel}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
            {/* DS Atoms/Badge — non-interactive summary labels (labelMd 12/16/500,
                not the 11px this previously hand-rolled). */}
            {selectedEntities.map(e => (
              <Badge key={e.id}>{e.name}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm block */}
      <div style={{
        border: `1px solid ${inputBorder}`,
        borderRadius: 6, padding: "12px 14px", marginBottom: cfg.confirmCheckbox ? 14 : 32,
        transition: "border-color .2s",
        background: inputBg,
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: DS.textStrong, fontFamily: DS.ff, marginBottom: 10 }}>
          Enter{" "}
          <code style={{
            fontFamily: "monospace", fontSize: 12,
            background: isValid || isInvalid ? "rgba(255,255,255,.6)" : DS.surfaceSubtle,
            padding: "1px 6px", borderRadius: 3,
            border: `1px solid ${isValid ? DS.feedbackSuccess : isInvalid ? DS.feedbackError : DS.borderDefault}`,
            color: isValid ? DS.green800 : isInvalid ? DS.feedbackErrorText : DS.textStrong,
            transition: "all .2s",
          }}>
            1
          </code>
          {" "}to confirm
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            ref={inputRef}
            value={confirmValue}
            onChange={e => onConfirmChange(e.target.value)}
            maxLength={3}
            placeholder="—"
            autoComplete="off"
            style={{
              width: 56, height: 32, padding: "0 8px", borderRadius: 4,
              border: `1.5px solid ${inputBorder}`,
              background: "rgba(255,255,255,.8)",
              color: inputColor,
              fontFamily: DS.ff, fontSize: 14, outline: "none",
              textAlign: "center", transition: "all .15s", flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: hintColor, fontFamily: DS.ff, lineHeight: "15px", transition: "color .15s" }}>
            {hintText}
          </span>
        </div>
      </div>

      {/* Acknowledgement checkbox (consent add only) — borderless, below the input */}
      {cfg.confirmCheckbox && (
        <div style={{ marginBottom: 32 }}>
          <Checkbox
            checked={ackChecked}
            onChange={onAckChange}
            label={<span style={{ fontSize: 12, color: DS.textSecondary, fontFamily: DS.ff, lineHeight: "17px" }}>{cfg.confirmCheckbox}</span>}
          />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STATE
// ─────────────────────────────────────────────────────────────────────────────

const SuccessState = ({ contactCount, entityCount, cfg }) => (
  <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: DS.feedbackSuccessBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ico.Check s={24} c={DS.teal500} />
    </div>
    <div style={{ fontSize: 15, fontWeight: 600, color: DS.textStrong, fontFamily: DS.ff }}>{cfg.successTitle}</div>
    <div style={{ fontSize: 13, color: DS.textMuted, fontFamily: DS.ff, maxWidth: 300, lineHeight: "20px" }}>
      {cfg.successBody(contactCount, entityCount)}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EntityActionModal — add or remove contacts to/from a set of entities.
 *
 * Props:
 *   mode               {"add" | "remove"}  — selects the config in `modes`
 *   modes              {object}            — { add: {...}, remove: {...} } wording configs
 *   open               {boolean}
 *   onClose            {function}
 *   onConfirm          {function}          — called with ({ entityIds, contactIds })
 *   selectedContactIds {string[]}
 *   entities           {Array}             — [{ id, name, count? }]
 *   step1Label         {string}            — step indicator label for step 1
 *   countUnit          {string}            — unit shown under each entity (default "contacts")
 */
export default function EntityActionModal({
  mode = "add",
  modes,
  open,
  onClose,
  onConfirm,
  selectedContactIds = [],
  entities = [],
  step1Label = "Choose",
  countUnit = "contacts",
}) {
  const cfg = modes[mode] ?? Object.values(modes)[0];

  const [step,         setStep]         = useState(1);
  const [selectedIds,  setSelectedIds]  = useState(new Set());
  const [confirmValue, setConfirmValue] = useState("");
  const [done,         setDone]         = useState(false);
  const [ackChecked,   setAckChecked]   = useState(false);
  const [wasOpen,      setWasOpen]      = useState(false);

  // Render-time reset on open, so each open starts fresh on step 1.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setStep(1); setSelectedIds(new Set()); setConfirmValue(""); setDone(false); setAckChecked(false); }
  }

  if (!open) return null;

  const toggle = (id) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleNext    = () => { if (selectedIds.size > 0) setStep(2); };
  const handleBack    = () => { setStep(1); setConfirmValue(""); };
  const handleConfirm = () => { onConfirm?.({ entityIds: [...selectedIds], contactIds: selectedContactIds }); setDone(true); };
  const handleClose   = () => onClose?.();

  const selectedEntities = entities.filter(e => selectedIds.has(e.id));
  const canConfirm       = confirmValue === "1" && (!cfg.confirmCheckbox || ackChecked);

  let footer;
  if (done) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Primary" size="Medium" onClick={handleClose}>Close</Btn>
      </div>
    );
  } else if (step === 1) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" onClick={handleClose}>Cancel</Btn>
        <Btn type="Primary" size="Medium" iconRight={<Ico.ChevRight />} disabled={selectedIds.size === 0} onClick={handleNext}>Next</Btn>
      </div>
    );
  } else {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" onClick={handleBack}>Back</Btn>
        <Btn type="Primary" size="Medium" iconLeft={<Ico.Check />} disabled={!canConfirm} onClick={handleConfirm}>{cfg.confirmBtnLabel}</Btn>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={cfg.title}
      variant="center"
      width={560}
      footer={footer}
    >
      {done ? (
        <SuccessState contactCount={selectedContactIds.length} entityCount={selectedIds.size} cfg={cfg} />
      ) : (
        <>
          <StepIndicator currentStep={step} step1Label={step1Label} />
          <div style={{ minHeight: 200, paddingBottom: 8 }}>
            {step === 1 && (
              <Step1
                entities={entities}
                selectedIds={selectedIds}
                onToggle={toggle}
                cfg={cfg}
                countUnit={countUnit}
              />
            )}
            {step === 2 && (
              <Step2
                selectedContactCount={selectedContactIds.length}
                selectedEntities={selectedEntities}
                confirmValue={confirmValue}
                onConfirmChange={setConfirmValue}
                ackChecked={ackChecked}
                onAckChange={setAckChecked}
                cfg={cfg}
              />
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
