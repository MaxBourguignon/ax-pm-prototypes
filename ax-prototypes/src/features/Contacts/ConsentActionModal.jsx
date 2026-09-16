import EntityActionModal from "./EntityActionModal";

// ─────────────────────────────────────────────────────────────────────────────
// CONSENT_MODES — wording for opting contacts in to / out of consents.
// ─────────────────────────────────────────────────────────────────────────────

const CONSENT_MODES = {
  add: {
    title:               "Add contacts to a consent",
    searchPlaceholder:   "Search and select a consent…",
    selectedSection:     "Selected consents",
    emptySelected:       "No selected consents",
    warningText:         "You are about to opt the selected contact(s) in to one or more consents. Make sure you have a lawful basis before proceeding. This action cannot be undone.",
    summaryContactLabel: "Contacts to add",
    summaryEntityLabel:  "Target consents",
    confirmCheckbox:     "I confirm that the contacts in this list have given their consent to receive this type of communication.",
    confirmBtnLabel:     "Confirm",
    successTitle:        "Action completed",
    successBody:         (n, c) => `${n} contact${n !== 1 ? "s have" : " has"} been added to ${c} consent${c !== 1 ? "s" : ""} successfully.`,
  },
  remove: {
    title:               "Remove contacts from consents",
    searchPlaceholder:   "Search a consent to remove from…",
    selectedSection:     "Selected consents",
    emptySelected:       "No selected consents",
    warningText:         "You are about to opt the selected contact(s) out of one or more consents. They will stop receiving the communications tied to those consents. This action cannot be undone.",
    summaryContactLabel: "Contacts to remove",
    summaryEntityLabel:  "From consents",
    confirmBtnLabel:     "Confirm removal",
    successTitle:        "Removal completed",
    successBody:         (n, c) => `${n} contact${n !== 1 ? "s have" : " has"} been removed from ${c} consent${c !== 1 ? "s" : ""} successfully.`,
  },
};

/**
 * ConsentActionModal — add or remove contacts to/from consents. Thin wrapper
 * over the shared EntityActionModal (same component used by ListActionModal),
 * so the consent flow stays identical to the list flow.
 *
 * Props:
 *   mode               {"add" | "remove"}
 *   open               {boolean}
 *   onClose            {function}
 *   onConfirm          {function}   — called with ({ consentIds, contactIds })
 *   selectedContactIds {string[]}
 *   consents           {Array}      — [{ id, name, count }]
 */
export default function ConsentActionModal({ mode = "add", open, onClose, onConfirm, selectedContactIds = [], consents = [] }) {
  return (
    <EntityActionModal
      mode={mode}
      modes={CONSENT_MODES}
      open={open}
      onClose={onClose}
      onConfirm={({ entityIds, contactIds }) => onConfirm?.({ consentIds: entityIds, contactIds })}
      selectedContactIds={selectedContactIds}
      entities={consents}
      step1Label="Choose consents"
      countUnit="contacts"
    />
  );
}
