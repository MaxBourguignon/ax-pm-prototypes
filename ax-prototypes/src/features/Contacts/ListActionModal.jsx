import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import DS from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// MODE CONFIGS — only wording differs, zero colour/style changes
// ─────────────────────────────────────────────────────────────────────────────

const MODES = {
  add: {
    title:               "Add contacts to a static list",
    searchPlaceholder:   "Search and select a list…",
    selectedSection:     "Selected lists",
    emptySelected:       "No selected lists",
    warningText:         "You are about to add the selected contact(s) to one or more lists. This action cannot be undone. Be careful not to repeat this action too many times successively.",
    summaryContactLabel: "Contacts to add",
    summaryListLabel:    "Target lists",
    confirmBtnLabel:     "Confirm",
    successTitle:        "Action completed",
    successBody:         (n, l) => `${n} contact${n !== 1 ? "s have" : " has"} been added to ${l} list${l !== 1 ? "s" : ""} successfully.`,
  },
  remove: {
    title:               "Remove contacts from lists",
    searchPlaceholder:   "Search a list to remove from…",
    selectedSection:     "Selected lists",
    emptySelected:       "No selected lists",
    warningText:         "You are about to remove the selected contact(s) from one or more lists. This action cannot be undone. Be careful not to repeat this action too many times successively.",
    summaryContactLabel: "Contacts to remove",
    summaryListLabel:    "From lists",
    confirmBtnLabel:     "Confirm removal",
    successTitle:        "Removal completed",
    successBody:         (n, l) => `${n} contact${n !== 1 ? "s have" : " has"} been removed from ${l} list${l !== 1 ? "s" : ""} successfully.`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const Btn = ({ label, onClick, variant = "primary", iconLeft, iconRight, disabled = false }) => {
  const [hovered, setHovered] = useState(false);
  const h = hovered && !disabled;
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "0 16px", height: 36, borderRadius: 4, fontFamily: DS.ff,
    fontSize: 13, fontWeight: 400,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "all .15s", whiteSpace: "nowrap",
    border: "1px solid transparent",
  };
  const variants = {
    primary:   { background: h ? DS.blue300  : DS.blue500,    border: `1px solid ${h ? DS.blue300  : DS.blue500}`,  color: DS.neutral0   },
    secondary: { background: h ? DS.blue100  : DS.neutral0,   border: `1px solid ${h ? DS.blue300  : DS.blue500}`,  color: DS.neutral900 },
    tertiary:  { background: h ? DS.blue100  : "transparent", border: "1px solid transparent",                      color: DS.neutral900 },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant] }}>
      {iconLeft}{label}{iconRight}
    </button>
  );
};

const CloseBtn = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: 28, height: 28, borderRadius: 4, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "background .15s",
      }}>
      <Ico.Cross s={16} c={DS.neutral0} />
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }) => {
  const steps = [{ n: 1, label: "Choose lists" }, { n: 2, label: "Confirm" }];
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px 0" }}>
      {steps.map((s, i) => {
        const done   = currentStep > s.n;
        const active = currentStep === s.n;
        const dotBg     = done ? DS.teal100 : active ? DS.blue100 : DS.neutral100;
        const dotBorder = done ? DS.teal500 : active ? DS.blue500 : DS.neutral200;
        const dotColor  = done ? DS.teal500 : active ? DS.blue500 : DS.neutral500;
        const textColor = done ? DS.teal500 : active ? DS.blue500 : DS.neutral500;
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
              <div style={{ width: 20, height: 1, background: DS.neutral200, margin: "0 8px" }} />
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
// STEP 1 — LIST SELECTION
// ─────────────────────────────────────────────────────────────────────────────

const Step1 = ({ lists, selectedListIds, onToggle, cfg }) => {
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
  const filtered = lists.filter(l =>
    (!trimmed || l.name.toLowerCase().includes(trimmed)) &&
    !selectedListIds.has(l.id)
  );

  const handleSelect = (id) => {
    onToggle(id);
    setSearch("");
    setDropOpen(false);
    searchRef.current?.focus();
  };

  const selectedLists = lists.filter(l => selectedListIds.has(l.id));

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
              background: DS.neutral0,
              border: `1px solid ${DS.neutral200}`,
              borderRadius: 6,
              boxShadow: "0 12px 32px rgba(15,23,42,.2)",
              maxHeight: 180,
              overflowY: "auto",
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "12px 14px", fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>
                  {trimmed
                    ? "No list found"
                    : selectedListIds.size === lists.length
                      ? "All lists already selected"
                      : "Start typing to search…"}
                </div>
              ) : filtered.map((l, i) => (
                <DropdownListItem
                  key={l.id}
                  list={l}
                  isLast={i === filtered.length - 1}
                  onSelect={() => handleSelect(l.id)}
                />
              ))}
            </div>
          </PortalDropdown>
        )}
      </div>

      {/* Selected lists — always visible */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
          textTransform: "uppercase", color: DS.neutral500,
          fontFamily: DS.ff, marginBottom: 8,
        }}>
          {cfg.selectedSection}
        </div>

        {selectedLists.length === 0 ? (
          <div style={{
            padding: "10px 12px",
            border: `1px dashed ${DS.neutral200}`,
            borderRadius: 6,
            fontSize: 12, color: DS.neutral500, fontFamily: DS.ff,
          }}>
            {cfg.emptySelected}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedLists.map(l => (
              <SelectedChip key={l.id} list={l} onRemove={() => onToggle(l.id)} />
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
      border: `1px solid ${focused ? DS.blue500 : DS.neutral200}`,
      borderRadius: 4, background: DS.neutral100, transition: "border-color .15s",
    }}>
      <Ico.Search s={14} c={DS.neutral500} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: DS.ff, fontSize: 13, color: DS.neutral900 }}
      />
      {value && (
        <span onClick={() => onChange("")} style={{ cursor: "pointer", fontSize: 11, color: DS.neutral500, lineHeight: 1 }}>✕</span>
      )}
    </div>
  );
};

const DropdownListItem = ({ list, isLast, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={e => { e.preventDefault(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
        cursor: "pointer",
        borderBottom: isLast ? "none" : `0.5px solid ${DS.neutral200}`,
        background: hovered ? DS.blue100 : DS.neutral0,
        transition: "background .1s",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: hovered ? DS.blue500 : DS.neutral900, fontFamily: DS.ff, lineHeight: "18px", transition: "color .1s" }}>
          {list.name}
        </div>
        <div style={{ fontSize: 11, color: DS.neutral500, fontFamily: DS.ff, marginTop: 1 }}>
          {list.count.toLocaleString()} contacts
        </div>
      </div>
      <Ico.Plus s={13} c={hovered ? DS.blue500 : DS.neutral500} />
    </div>
  );
};

const SelectedChip = ({ list, onRemove }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 8px 4px 10px", borderRadius: 999,
      background: DS.blue100, border: `1px solid ${DS.blue200}`,
    }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: DS.blue500, fontFamily: DS.ff, lineHeight: "16px" }}>
        {list.name}
      </span>
      <button
        onClick={onRemove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, borderRadius: "50%",
          background: hovered ? DS.blue500 : "transparent",
          border: "none", cursor: "pointer", padding: 0,
          transition: "background .12s", flexShrink: 0,
        }}
      >
        <Ico.Cross s={10} c={hovered ? DS.neutral0 : DS.blue500} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────

const Step2 = ({ selectedContactCount, selectedLists, confirmValue, onConfirmChange, cfg }) => {
  const inputRef = useRef();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const isValid   = confirmValue === "1";
  const isInvalid = confirmValue !== "" && !isValid;

  const inputBorder = isValid ? DS.green600   : isInvalid ? DS.red600   : DS.neutral200;
  const inputBg     = isValid ? DS.greenLight : isInvalid ? DS.redLight : DS.neutral0;
  const inputColor  = isValid ? "#14532D"     : isInvalid ? DS.red600   : DS.neutral900;
  const hintColor   = isValid ? DS.green600   : isInvalid ? DS.red600   : DS.neutral500;
  const hintText    = isValid
    ? "✓ Confirmed — you can proceed"
    : isInvalid
    ? "The value does not match the expected number."
    : "This safeguard prevents accidental bulk operations.";

  return (
    <div style={{ padding: "20px 20px 0" }}>

      {/* Warning banner — same amber style for both modes */}
      <div style={{
        background: "#FEF3C7", border: `1px solid ${DS.amber}`,
        borderRadius: 6, padding: "12px 14px",
        display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16,
      }}>
        <div style={{ flexShrink: 0, marginTop: 1, placeItems: "center" }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={DS.amber600} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2L2 17h16L10 2z"/><path d="M10 9v4"/><circle cx="10" cy="15.5" r=".5" fill={DS.amber100}/>
          </svg>
        </div>
        <div style={{ fontSize: 12, color: "#92400E", lineHeight: "18px", fontFamily: DS.ff }}>
          {cfg.warningText}
        </div>
      </div>

      {/* Summary */}
      <div style={{
        background: DS.neutral100, border: `1px solid ${DS.neutral200}`,
        borderRadius: 6, padding: "10px 14px", marginBottom: 24,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>{cfg.summaryContactLabel}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: DS.neutral900, fontFamily: DS.ff }}>
            {selectedContactCount} contact{selectedContactCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ height: 1, background: DS.neutral200 }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, color: DS.neutral500, fontFamily: DS.ff, flexShrink: 0, paddingTop: 2 }}>{cfg.summaryListLabel}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
            {selectedLists.map(l => (
              <span key={l.id} style={{
                fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                background: DS.blue100, color: DS.blue500, fontFamily: DS.ff,
              }}>
                {l.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm block */}
      <div style={{
        border: `1px solid ${isValid ? DS.green600 : isInvalid ? DS.red600 : DS.neutral200}`,
        borderRadius: 6, padding: "12px 14px", marginBottom: 32,
        transition: "border-color .2s",
        background: isValid ? DS.greenLight : isInvalid ? DS.redLight : DS.neutral0,
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: DS.neutral900, fontFamily: DS.ff, marginBottom: 10 }}>
          Enter{" "}
          <code style={{
            fontFamily: "monospace", fontSize: 12,
            background: isValid || isInvalid ? "rgba(255,255,255,.6)" : DS.neutral100,
            padding: "1px 6px", borderRadius: 3,
            border: `1px solid ${isValid ? DS.green600 : isInvalid ? DS.red600 : DS.neutral200}`,
            color: isValid ? "#14532D" : isInvalid ? DS.red800 : DS.neutral900,
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
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS STATE
// ─────────────────────────────────────────────────────────────────────────────

const SuccessState = ({ contactCount, listCount, onClose, cfg }) => (
  <div style={{ padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: DS.teal100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ico.Check s={24} c={DS.teal500} />
    </div>
    <div style={{ fontSize: 15, fontWeight: 600, color: DS.neutral900, fontFamily: DS.ff }}>{cfg.successTitle}</div>
    <div style={{ fontSize: 13, color: DS.neutral500, fontFamily: DS.ff, maxWidth: 300, lineHeight: "20px" }}>
      {cfg.successBody(contactCount, listCount)}
    </div>
    <Btn label="Close" variant="primary" onClick={onClose} />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ListActionModal — reusable for adding or removing contacts from lists.
 * Only wording differs between modes — all colours, styles and layout are identical.
 *
 * Props:
 *   mode               {"add" | "remove"}  — switches all copy strings
 *   open               {boolean}
 *   onClose            {function}
 *   onConfirm          {function}          — called with ({ listIds, contactIds })
 *   selectedContactIds {string[]}
 *   lists              {Array}             — [{ id, name, count }]
 *
 * Usage:
 *   <ListActionModal mode="add"    open={open} lists={lists} selectedContactIds={ids} onClose={…} onConfirm={…} />
 *   <ListActionModal mode="remove" open={open} lists={lists} selectedContactIds={ids} onClose={…} onConfirm={…} />
 */
export default function ListActionModal({
  mode = "add",
  open,
  onClose,
  onConfirm,
  selectedContactIds = [],
  lists = [],
}) {
  const cfg = MODES[mode] ?? MODES.add;

  const [step,            setStep]            = useState(1);
  const [selectedListIds, setSelectedListIds] = useState(new Set());
  const [confirmValue,    setConfirmValue]    = useState("");
  const [done,            setDone]            = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedListIds(new Set());
      setConfirmValue("");
      setDone(false);
    }
  }, [open]);

  if (!open) return null;

  const toggleList = (id) =>
    setSelectedListIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleNext    = () => { if (selectedListIds.size > 0) setStep(2); };
  const handleBack    = () => { setStep(1); setConfirmValue(""); };
  const handleConfirm = () => { onConfirm?.({ listIds: [...selectedListIds], contactIds: selectedContactIds }); setDone(true); };
  const handleClose   = () => onClose?.();

  const selectedLists = lists.filter(l => selectedListIds.has(l.id));
  const canConfirm    = confirmValue === "1";

  return createPortal(
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(31,41,55,.45)",
      zIndex: 1200, backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: DS.neutral0, borderRadius: 8,
          width: 560, maxWidth: "96vw",
          boxShadow: "0 20px 60px rgba(15,23,42,.22)",
          overflow: "visible",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Inner clip for rounded corners on header/footer */}
        <div style={{ borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Header — always visible, including after success */}
          <div style={{
            background: "linear-gradient(91deg, #2CB1A2 0%, #5585B8 100%)",
            padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: DS.neutral0, fontFamily: DS.ff, lineHeight: "18px" }}>
              {cfg.title}
            </span>
            <CloseBtn onClick={handleClose} />
          </div>

          {done ? (
            <SuccessState
              contactCount={selectedContactIds.length}
              listCount={selectedListIds.size}
              onClose={handleClose}
              cfg={cfg}
            />
          ) : (
            <>
              {/* Step indicator */}
              <StepIndicator currentStep={step} />

              {/* Body */}
              <div style={{ minHeight: 200 }}>
                {step === 1 && (
                  <Step1
                    lists={lists}
                    selectedListIds={selectedListIds}
                    onToggle={toggleList}
                    cfg={cfg}
                  />
                )}
                {step === 2 && (
                  <Step2
                    selectedContactCount={selectedContactIds.length}
                    selectedLists={selectedLists}
                    confirmValue={confirmValue}
                    onConfirmChange={setConfirmValue}
                    cfg={cfg}
                  />
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 20px",
                borderTop: `1px solid ${DS.neutral200}`,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                gap: 8, background: DS.neutral100,
              }}>
                {step === 1 && <Btn label="Cancel" variant="tertiary" onClick={handleClose} />}
                {step === 2 && <Btn label="Back"   variant="tertiary" onClick={handleBack} />}
                {step === 1 && (
                  <Btn
                    label="Next"
                    variant="primary"
                    iconRight={<Ico.ChevRight s={12} c={DS.neutral0} />}
                    disabled={selectedListIds.size === 0}
                    onClick={handleNext}
                  />
                )}
                {step === 2 && (
                  <Btn
                    label={cfg.confirmBtnLabel}
                    variant="primary"
                    iconLeft={<Ico.Check s={14} c={DS.neutral0} />}
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}