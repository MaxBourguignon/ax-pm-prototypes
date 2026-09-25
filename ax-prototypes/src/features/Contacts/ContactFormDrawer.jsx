/**
 * ContactFormDrawer — the one contact form, in two modes.
 *
 *   mode="edit"    the record's "Edit contact" action; email is locked, because
 *                  it identifies the contact and changing it would make a
 *                  different one rather than an edit
 *   mode="create"  the contacts list's "Add a contact" action; email is the
 *                  first thing you type
 *
 * Same sections, same order and same field set as the contact record's right
 * rail — personal information, coordinates, professional — so a field is filled
 * in where it is later read.
 *
 * Shared rather than duplicated on purpose: the create sidebar and the edit
 * drawer used to be two hand-rolled forms with different inputs, different
 * labels and different footers for the same object.
 */
import React, { useMemo, useState } from "react";
import contactsData from "../../../contacts.json";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import Modal from "../../components/Modal";
import { Btn } from "../../components/Btn";
import IconBtn from "../../components/Iconbtn";
import { Field } from "../../components/Field";
import Select from "../../components/Select";

const EMPTY_CONTACT = {
  email: "", firstName: "", lastName: "", dateOfBirth: "", age: "",
  civility: "", gender: "",
  phones: [""], addressLines: [""], postalCode: "", city: "", country: "",
  organisation: "", role: "",
};

const CIVILITIES = ["Mr.", "Ms.", "Mx."];
const GENDERS = ["Male", "Female", "Other"];
const COUNTRIES = ["France", "United Kingdom", "Germany", "Italy", "Spain"];

/* Organisations are picked from the ones the base already holds rather than
   typed, so two spellings of the same company cannot enter the data. A contact
   whose organisation predates the list still keeps it — it is folded in below. */
function useOrganisations(current) {
  return useMemo(() => {
    const known = new Set(
      (Array.isArray(contactsData) ? contactsData : [])
        .map((c) => c.structure)
        .filter(Boolean),
    );
    if (current) known.add(current);
    return [...known].sort((a, b) => a.localeCompare(b));
  }, [current]);
}

/* Dialling codes, and the country each one defaults from. A phone is stored as
   one string ("+39 06 4559 8102") — splitting it into two persisted fields would
   mean every reader had to recombine them. The form splits it for editing and
   joins it back on change, so the record keeps a single phone value. */
const DIAL_CODES = [
  { code: "+33", country: "France" },
  { code: "+44", country: "United Kingdom" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+1", country: "United States" },
];

function splitPhone(phone, country) {
  const raw = String(phone ?? "").trim();
  // Longest match first, so +33 never loses to +3.
  const hit = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length)
    .find((d) => raw.startsWith(d.code));
  if (hit) return [hit.code, raw.slice(hit.code.length).trim()];
  const fallback = DIAL_CODES.find((d) => d.country === country)?.code ?? "+33";
  return [fallback, raw];
}

/* The blue band that opens each section of the drawer. */
function DrawerSection({ title }) {
  return (
    <div style={{
      background: DS.brandPrimarySubtle, borderRadius: DS.radiusMd,
      padding: "8px 12px", marginTop: 4,
    }}>
      <span style={{ ...TY.bodyMdBold, lineHeight: "16px", color: DS.brandPrimary, fontFamily: DS.ff }}>
        {title}
      </span>
    </div>
  );
}

/* One phone row: a dialling code beside the national number. The code is a
   closed set, so it is a Select; the number is free text. They write back as one
   string, which is what the rest of the record reads. */
function PhoneRow({ value, country, onChange, onRemove }) {
  const [code, rest] = splitPhone(value, country);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* The closed control shows the code alone — the country is spelled out
            in the panel, and again in the Country field below. `trigger` is the
            Select's own hook for this: the opener is custom, the panel stays
            DS-conformant. */}
        <Select
          value={code}
          onChange={(next) => onChange(`${next} ${rest}`.trim())}
          options={DIAL_CODES.map((d) => ({ value: d.code, label: `${d.code}  ${d.country}` }))}
          minWidth={200}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "space-between",
                gap: 6, width: 92, height: 36, padding: "0 10px", boxSizing: "border-box",
                borderRadius: DS.radiusLg, background: DS.surfaceCanvas,
                border: `1px solid ${open ? DS.borderFocus : DS.borderField}`,
                cursor: "pointer", ...TY.bodyMd, fontFamily: DS.ff, color: DS.textDefault,
              }}
            >
              {code}
              <Ico.ChevDown s={16} c={DS.textSecondary} />
            </button>
          )}
        />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Field
          value={rest}
          onChange={(e) => onChange(`${code} ${e.target.value}`.trim())}
          placeholder="1 23 45 67 89"
        />
      </div>
      {onRemove && (
        <IconBtn
          kind="Ghost"
          size="Md"
          color="Danger"
          icon={<Ico.Trash s={16} c={DS.actionDanger} />}
          title="Remove this number"
          aria-label="Remove this number"
          onClick={onRemove}
        />
      )}
    </div>
  );
}

/* A contact can hold several numbers — a mobile and a switchboard, say. The
   first is the one the record's header and rail show; the rest sit under it. */
function PhoneFields({ values, country, onChange }) {
  const list = values.length > 0 ? values : [""];
  const set = (i, v) => onChange(list.map((p, idx) => (idx === i ? v : p)));
  const removeAt = (i) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ ...TY.labelMd, color: DS.textStrong, fontFamily: DS.ff }}>Phone</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((phone, i) => (
          <PhoneRow
            key={i}
            value={phone}
            country={country}
            onChange={(v) => set(i, v)}
            onRemove={list.length > 1 ? () => removeAt(i) : undefined}
          />
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <Btn
          type="Tertiary"
          size="Sm"
          iconLeft={<Ico.Plus s={14} />}
          onClick={() => onChange([...list, ""])}
        >
          Add a number
        </Btn>
      </div>
    </div>
  );
}

/* The address runs up to four lines — building, floor, and so on — which is how
   the record stores it. Only the first is shown to begin with; the rest are
   added as needed, and the control stops offering more at the fourth. */
const MAX_ADDRESS_LINES = 4;

function AddressFields({ values, onChange }) {
  const list = values.length > 0 ? values : [""];
  const set = (i, v) => onChange(list.map((line, idx) => (idx === i ? v : line)));
  const removeAt = (i) => onChange(list.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {list.map((line, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Field
              label={i === 0 ? "Address" : `Address ${i + 1}`}
              value={line}
              onChange={(e) => set(i, e.target.value)}
              placeholder={i === 0 ? "Street and number" : "Building, floor, …"}
            />
          </div>
          {list.length > 1 && (
            <IconBtn
              kind="Ghost"
              size="Md"
              color="Danger"
              icon={<Ico.Trash s={16} c={DS.actionDanger} />}
              title="Remove this line"
              aria-label="Remove this address line"
              onClick={() => removeAt(i)}
            />
          )}
        </div>
      ))}
      {list.length < MAX_ADDRESS_LINES && (
        <div style={{ display: "flex" }}>
          <Btn type="Tertiary" size="Sm" iconLeft={<Ico.Plus s={14} />}
               onClick={() => onChange([...list, ""])}>
            Add an address line
          </Btn>
        </div>
      )}
    </div>
  );
}

export function ContactFormDrawer({ open, onClose, mode = "edit", value = EMPTY_CONTACT, onSave }) {
  const [form, setForm] = useState(value);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {            // render-time reset on open, no effect needed
    setWasOpen(open);
    if (open) setForm(value);
  }
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setText = (k) => (e) => set(k)(e.target.value);
  const creating = mode === "create";
  const organisations = useOrganisations(value.organisation);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={creating ? "Create a contact" : "Edit contact"}
      width={460}
      footer={(
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
          <Btn type="Tertiary" onClick={onClose}>Cancel</Btn>
          <Btn type="Primary" onClick={() => onSave?.(form)}>
            {creating ? "Create contact" : "Save"}
          </Btn>
        </div>
      )}
    >
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <DrawerSection title="Personal information" />
        {/* On an existing contact the email is read-only: it identifies the
            record, so changing it would be a different contact rather than an
            edit. Shown rather than hidden — you still need to see which address
            the record is keyed on. */}
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={creating ? setText("email") : undefined}
          disabled={!creating}
          placeholder="name@example.com"
          help={creating ? undefined : "The email identifies this contact and cannot be changed here."}
        />
        <Field label="First name" value={form.firstName} onChange={setText("firstName")} placeholder="First name" />
        <Field label="Last name" value={form.lastName} onChange={setText("lastName")} placeholder="Last name" />
        {/* type="date" gives the platform's own calendar. The DS has no date
            picker of its own — flag it if one ever lands, since this control is
            the browser's and follows its chrome, not ours. */}
        <Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={setText("dateOfBirth")} />
        <Select label="Civility" value={form.civility} onChange={set("civility")} placeholder="Select…"
                options={CIVILITIES.map((c) => ({ value: c, label: c }))} />
        <Select label="Gender" value={form.gender} onChange={set("gender")} placeholder="Select…"
                options={GENDERS.map((g) => ({ value: g, label: g }))} />

        <DrawerSection title="Coordinates" />
        <PhoneFields values={form.phones ?? []} country={form.country} onChange={set("phones")} />
        <AddressFields values={form.addressLines ?? []} onChange={set("addressLines")} />
        <Field label="Postal code" value={form.postalCode} onChange={setText("postalCode")} placeholder="Postal code" />
        <Field label="City" value={form.city} onChange={setText("city")} placeholder="City" />
        <Select label="Country" value={form.country} onChange={set("country")} placeholder="Select…"
                options={COUNTRIES.map((c) => ({ value: c, label: c }))} />

        <DrawerSection title="Professional information" />
        <Select label="Organisation" value={form.organisation} onChange={set("organisation")}
                placeholder="Select an organisation…"
                options={organisations.map((o) => ({ value: o, label: o }))} />
        <Field label="Role" value={form.role} onChange={setText("role")} placeholder="e.g. Head of programming" />
      </div>
    </Modal>
  );
}

export default ContactFormDrawer;
