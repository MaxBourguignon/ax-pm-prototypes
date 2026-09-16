import NameModal from "../../components/NameModal";

/**
 * ViewModal — create or rename a contact view. A thin wrapper over the shared
 * NameModal so it stays identical to every other "name this thing" dialog
 * (e.g. Create a folder on the Lists page).
 *
 * Props:
 *   open        {boolean}
 *   mode        {"create" | "rename"}
 *   initialName {string}
 *   onClose     {function}
 *   onSubmit    {function}  — called with the trimmed name
 */
export default function ViewModal({ open, mode = "create", initialName = "", onClose, onSubmit }) {
  const isRename = mode === "rename";
  return (
    <NameModal
      open={open}
      title={isRename ? "Rename view" : "Create a view"}
      label="Name"
      description={isRename ? undefined : "A view is a way to dynamically display contacts based on a saved combination of filters, visible columns and table sorting."}
      placeholder="New view"
      initialName={initialName}
      submitLabel={isRename ? "Save" : "Create a view"}
      maxLength={50}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
