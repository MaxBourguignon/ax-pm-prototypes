import { useState, useRef, useEffect } from "react";
import { Modal } from "../../components/Modal";
import { Btn } from "../../components/Btn";
import { DS } from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }) => {
  const steps = [{ n: 1, label: "Review" }, { n: 2, label: "Confirm" }, { n: 3, label: "Done" }];
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px 0" }}>
      {steps.map((s, i) => {
        const done   = currentStep > s.n;
        const active = currentStep === s.n;
        const dotBg     = done ? DS.teal100 : active ? DS.blue100 : DS.neutral100;
        const dotBorder = done ? DS.teal500 : active ? DS.actionPrimary : DS.neutral200;
        const dotColor  = done ? DS.teal500 : active ? DS.actionPrimary : DS.neutral500;
        const textColor = done ? DS.teal500 : active ? DS.actionPrimary : DS.neutral500;
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
// STEP 1 — WHAT WILL HAPPEN
// ─────────────────────────────────────────────────────────────────────────────

const ConsequenceRow = ({ icon, bg, iconColor, children }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon(iconColor)}
    </div>
    <p style={{ margin: 0, paddingTop: 4, fontFamily: DS.ff, fontSize: 13, lineHeight: "19px", color: DS.neutral700 }}>
      {children}
    </p>
  </div>
);

const Step1 = ({ count, overLimit }) => (
  <div style={{ padding: "20px 20px 0" }}>
    <p style={{ margin: "0 0 16px", fontFamily: DS.ff, fontSize: 13, lineHeight: "19px", color: DS.neutral700 }}>
      You are about to delete{" "}
      <strong style={{ color: DS.neutral900 }}>{count} contact{count !== 1 ? "s" : ""}</strong>.
      Please review what this means before continuing.
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <ConsequenceRow
        bg={DS.feedbackErrorBg}
        iconColor={DS.feedbackError}
        icon={(c) => <Ico.Trash s={14} c={c} />}
      >
        This action will <strong style={{ color: DS.neutral900 }}>permanently delete</strong> the selected contacts. It cannot be undone.
      </ConsequenceRow>

      <ConsequenceRow
        bg={DS.neutral100}
        iconColor={DS.neutral500}
        icon={(c) => <Ico.Eye s={14} c={c} />}
      >
        If these contacts are <strong style={{ color: DS.neutral900 }}>linked with purchases</strong>, they will be anonymized instead — to preserve your transaction history.
      </ConsequenceRow>
    </div>

    {/* Safety limit notice */}
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      marginTop: 16, padding: "10px 12px", borderRadius: 6,
      background: overLimit ? DS.feedbackWarningBg : DS.neutral100,
      border: `1px solid ${overLimit ? DS.feedbackWarning : DS.neutral200}`,
    }}>
      {overLimit
        ? <Ico.Alert s={15} c={DS.feedbackWarning} />
        : <Ico.Info  s={15} c={DS.neutral500} />}
      <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 12, lineHeight: "17px", color: overLimit ? "#92400E" : DS.neutral700 }}>
        For safety, Arenametrix does not allow deleting more than <strong>20 contacts</strong> at once. Contact our team for a bulk deletion.
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — TYPE-TO-CONFIRM
// ─────────────────────────────────────────────────────────────────────────────

const Step2 = ({ count, confirmValue, onConfirmChange }) => {
  const inputRef = useRef();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const target    = String(count);
  const isValid   = confirmValue === target && count > 0;
  const isInvalid = confirmValue !== "" && !isValid;

  const inputBorder = isValid ? DS.feedbackSuccess : isInvalid ? DS.feedbackError : DS.neutral200;
  const hintColor   = isValid ? DS.feedbackSuccess : isInvalid ? DS.feedbackErrorText : DS.neutral500;
  const hintText    = isValid
    ? "✓ Confirmed — you can proceed."
    : isInvalid
    ? `The value does not match.`
    : "This safeguard prevents accidental bulk deletion.";

  return (
    <div style={{ padding: "20px 20px 0" }}>

      {/* Danger banner */}
      <div style={{
        background: DS.feedbackErrorBg, border: `1px solid ${DS.rose100}`,
        borderRadius: 6, padding: "12px 14px",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
      }}>
        <span style={{ fontFamily: DS.ff, fontSize: 26, fontWeight: 700, lineHeight: "28px", color: DS.feedbackErrorText, flexShrink: 0 }}>
          {count}
        </span>
        <span style={{ fontFamily: DS.ff, fontSize: 13, lineHeight: "18px", color: DS.feedbackErrorText }}>
          contact{count !== 1 ? "s" : ""} will be permanently deleted or anonymized. This cannot be undone.
        </span>
      </div>

      {/* Confirm block */}
      <div style={{
        border: `1px solid ${inputBorder}`,
        borderRadius: 6, padding: "12px 14px",
        transition: "border-color .2s",
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: DS.neutral900, fontFamily: DS.ff, marginBottom: 10 }}>
          Enter{" "}
          <code style={{
            fontFamily: "monospace", fontSize: 12,
            background: DS.neutral100, padding: "1px 6px", borderRadius: 3,
            border: `1px solid ${DS.neutral200}`, color: DS.neutral900,
          }}>
            {target}
          </code>
          {" "}to confirm the number of contacts
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            ref={inputRef}
            value={confirmValue}
            onChange={e => onConfirmChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && isValid) e.preventDefault(); }}
            inputMode="numeric"
            maxLength={6}
            placeholder="—"
            autoComplete="off"
            style={{
              width: 72, height: 32, padding: "0 8px", borderRadius: 4,
              border: `1.5px solid ${inputBorder}`,
              background: DS.white,
              color: isInvalid ? DS.feedbackErrorText : DS.neutral900,
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
// STEP 3 — COMPLETION SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

const SummaryRow = ({ icon, bg, iconColor, value, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", borderRadius: 8,
    background: DS.neutral100, border: `1px solid ${DS.neutral200}`,
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon(iconColor)}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontFamily: DS.ff, fontSize: 20, fontWeight: 700, lineHeight: "24px", color: DS.neutral900 }}>{value}</span>
      <span style={{ fontFamily: DS.ff, fontSize: 13, lineHeight: "18px", color: DS.neutral700 }}>{label}</span>
    </div>
  </div>
);

const Step3 = ({ deleted, anonymized }) => (
  <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: "50%", background: DS.teal100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Ico.Check s={24} c={DS.teal500} />
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 15, fontWeight: 600, color: DS.neutral900 }}>Deletion completed</p>
      <p style={{ margin: "4px 0 0", fontFamily: DS.ff, fontSize: 13, lineHeight: "18px", color: DS.neutral500 }}>
        Here is a summary of what was processed.
      </p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <SummaryRow
        bg={DS.feedbackErrorBg}
        iconColor={DS.feedbackError}
        icon={(c) => <Ico.Trash s={15} c={c} />}
        value={deleted}
        label={`contact${deleted !== 1 ? "s" : ""} permanently deleted`}
      />
      <SummaryRow
        bg={DS.neutral200}
        iconColor={DS.neutral500}
        icon={(c) => <Ico.Eye s={15} c={c} />}
        value={anonymized}
        label={`contact${anonymized !== 1 ? "s" : ""} anonymized`}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DeleteContactsModal — two-step destructive confirmation, matching the
 * ListActionModal dialog language (gradient header, step indicator, footer).
 *
 * Props:
 *   open      {boolean}
 *   count     {number}    — number of selected contacts
 *   onClose   {function}
 *   onConfirm {function}
 */
export default function DeleteContactsModal({ open, count = 0, onClose, onConfirm }) {
  const [step,         setStep]         = useState(1);
  const [confirmValue, setConfirmValue] = useState("");
  const [result,       setResult]       = useState(null);
  const [wasOpen,      setWasOpen]      = useState(false);

  // Render-time reset on open, so each open starts on step 1.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setStep(1); setConfirmValue(""); setResult(null); }
  }

  if (!open) return null;

  const MAX_DELETE  = 20;
  const overLimit   = count > MAX_DELETE;
  const target      = String(count);
  const canConfirm  = confirmValue === target && count > 0;
  const handleNext    = () => { if (!overLimit) setStep(2); };
  const handleBack    = () => { setStep(1); setConfirmValue(""); };
  const handleConfirm = () => {
    if (!canConfirm) return;
    // Mock split: contacts linked with purchases are anonymized, the rest deleted.
    const anonymized = Math.floor(count * 0.35);
    setResult({ deleted: count - anonymized, anonymized });
    onConfirm?.();
    setStep(3);
  };

  let footer;
  if (step === 1) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" onClick={onClose}>Cancel</Btn>
        <Btn type="Primary" size="Medium" iconRight={<Ico.ChevRight />} disabled={overLimit} onClick={handleNext}>Continue</Btn>
      </div>
    );
  } else if (step === 2) {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Tertiary" size="Medium" onClick={handleBack}>Back</Btn>
        <Btn type="Danger" size="Medium" iconLeft={<Ico.Trash />} disabled={!canConfirm} onClick={handleConfirm}>Delete</Btn>
      </div>
    );
  } else {
    footer = (
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
        <Btn type="Primary" size="Medium" onClick={onClose}>Close</Btn>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete contacts"
      variant="center"
      width={520}
      footer={footer}
    >
      <StepIndicator currentStep={step} />
      <div style={{ minHeight: 180, paddingBottom: 15 }}>
        {step === 1 && <Step1 count={count} overLimit={overLimit} />}
        {step === 2 && <Step2 count={count} confirmValue={confirmValue} onConfirmChange={setConfirmValue} />}
        {step === 3 && result && <Step3 deleted={result.deleted} anonymized={result.anonymized} />}
      </div>
    </Modal>
  );
}
