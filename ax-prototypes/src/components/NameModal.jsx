import { useState } from "react";
import { Modal } from "./Modal";
import { Btn } from "./Btn";
import { Field } from "./Field";
import { DS, TY } from "../utils/designSystem";

/**
 * NameModal — a small dialog to create or rename something identified by a
 * single name (a view, a folder, …). Built on the shared Modal + Field + Btn so
 * every "name this thing" dialog looks and behaves identically instead of each
 * feature re-inventing its own.
 *
 * Props:
 *   open        {boolean}
 *   title       {string}    header text (e.g. "Create a view")
 *   label       {string}    field label (default "Name")
 *   description {string}    optional helper paragraph above the field
 *   placeholder {string}    input placeholder
 *   initialName {string}    prefilled value (rename flows)
 *   submitLabel {string}    primary button text (default "Create")
 *   maxLength   {number}    default 50
 *   validate    {function}  (trimmedName) => errorString | null
 *   onClose     {function}
 *   onSubmit    {function}  called with the trimmed name
 */
export default function NameModal({
  open,
  title,
  label = "Name",
  description,
  placeholder = "Name",
  initialName = "",
  submitLabel = "Create",
  maxLength = 50,
  validate,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState(initialName);
  const [wasOpen, setWasOpen] = useState(false);

  // Render-time reset on open, so reopening picks up the current initialName.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setName(initialName);
  }

  if (!open) return null;

  const trimmed   = name.trim();
  const error     = trimmed.length > 0 && validate ? validate(trimmed) : null;
  const canSubmit = trimmed.length > 0 && !error;

  const submit = () => { if (canSubmit) { onSubmit(trimmed); onClose(); } };

  const footer = (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
      <Btn type="Tertiary" size="Medium" onClick={onClose}>Cancel</Btn>
      <Btn type="Primary" size="Medium" disabled={!canSubmit} onClick={submit}>{submitLabel}</Btn>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={title} variant="center" width={460} footer={footer}>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {description && (
          <p style={{ margin: 0, fontFamily: DS.ff, ...TY.b2, color: DS.textSecondary }}>{description}</p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Field
            label={<>{label} <span style={{ color: DS.feedbackError }}>*</span></>}
            value={name}
            maxLength={maxLength}
            autoFocus
            placeholder={placeholder}
            error={error || undefined}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <span style={{ alignSelf: "flex-end", fontFamily: DS.ff, ...TY.b3, color: DS.textSecondary }}>
            {name.length}/{maxLength}
          </span>
        </div>
      </div>
    </Modal>
  );
}
