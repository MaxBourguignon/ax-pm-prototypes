import EntityActionModal from "./EntityActionModal";

// ─────────────────────────────────────────────────────────────────────────────
// LIST_MODES — wording for adding/removing contacts to/from static lists.
// ─────────────────────────────────────────────────────────────────────────────

const LIST_MODES = {
  add: {
    title:               "Add contacts to a static list",
    searchPlaceholder:   "Search and select a list…",
    selectedSection:     "Selected lists",
    emptySelected:       "No selected lists",
    warningText:         "You are about to add the selected contact(s) to one or more lists. This action cannot be undone. Be careful not to repeat this action too many times successively.",
    summaryContactLabel: "Contacts to add",
    summaryEntityLabel:  "Target lists",
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
    summaryEntityLabel:  "From lists",
    confirmBtnLabel:     "Confirm removal",
    successTitle:        "Removal completed",
    successBody:         (n, l) => `${n} contact${n !== 1 ? "s have" : " has"} been removed from ${l} list${l !== 1 ? "s" : ""} successfully.`,
  },
};

/**
 * ListActionModal — add or remove contacts to/from static lists. Thin wrapper
 * over the shared EntityActionModal (same component used by ConsentActionModal),
 * so the two flows stay identical.
 *
 * Props:
 *   mode               {"add" | "remove"}
 *   open               {boolean}
 *   onClose            {function}
 *   onConfirm          {function}   — called with ({ listIds, contactIds })
 *   selectedContactIds {string[]}
 *   lists              {Array}      — [{ id, name, count }]
 */
export default function ListActionModal({ mode = "add", open, onClose, onConfirm, selectedContactIds = [], lists = [] }) {
  return (
    <EntityActionModal
      mode={mode}
      modes={LIST_MODES}
      open={open}
      onClose={onClose}
      onConfirm={({ entityIds, contactIds }) => onConfirm?.({ listIds: entityIds, contactIds })}
      selectedContactIds={selectedContactIds}
      entities={lists}
      step1Label="Choose lists"
      countUnit="contacts"
    />
  );
}
