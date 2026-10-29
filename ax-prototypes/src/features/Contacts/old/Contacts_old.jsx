import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ContactRecord from "../ContactRecord";
import contactsData from "../../../../contacts.json";

import DS from "../../../utils/design-system";
import Ico from "../../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATA — Contacts transform
// ─────────────────────────────────────────────────────────────────────────────
const CONTACTS = contactsData.map((c) => ({
  id: c.id,
  firstName: c.identity.firstName,
  lastName: c.identity.lastName,
  email: c.identity.email,
  age: c.identity.age,
  gender: c.identity.gender,
  phone: c.coordinates?.phone,
  postalCode: c.coordinates?.postalCode,
  country: c.coordinates?.country,
  structure: c.structure,
  loyalty: c.loyalty,
  lists: c.lists,
  acquisitionSource: c.source?.acquisitionSource,
  createdAt: c.source?.createdAt,
  totalSpending: c.stats?.totalSpending?.amount,
  lastPurchaseDate: c.stats?.lastPurchase?.date,
  _fullData: c,
}));

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// 3. DATA — Segment objects & operators
// ─────────────────────────────────────────────────────────────────────────────
const DATA_OBJECTS = [
  {
    id: "contact",
    label: "Contact",
    color: DS.actionPrimary,
    bg: DS.blue100,
    fields: [
      { id: "firstName", label: "First name", type: "string" },
      { id: "lastName", label: "Last name", type: "string" },
      { id: "email", label: "Email", type: "string" },
      { id: "civility", label: "Civility", type: "enum", choices: ["Mr.", "Mrs.", "Other"] },
      { id: "gender", label: "Gender", type: "enum", choices: ["Male", "Female", "Other"] },
      { id: "birthdate", label: "Date of birth", type: "date" },
      { id: "city", label: "City", type: "string" },
      { id: "zipcode", label: "Postal code", type: "string" },
      { id: "country", label: "Country", type: "string" },
      { id: "region", label: "Region", type: "string" },
      { id: "language", label: "Language", type: "string" },
      { id: "profession", label: "Profession", type: "string" },
      { id: "acquisitionSource", label: "Acquisition source", type: "enum", choices: ["Web", "App", "Partner", "Event", "Referral", "Ticketing"] },
      { id: "timeslotPreference", label: "Timeslot preference", type: "enum", choices: ["Morning", "Afternoon", "Evening", "Weekend"] },
      { id: "tag", label: "Tag", type: "enum", choices: ["VIP", "Patron", "Club friend"] },
      { id: "favoriteAthlete", label: "Favorite athlete", type: "string" },
      { id: "favoriteArtist", label: "Favorite artist", type: "string" },
      { id: "favoriteMusicGenre", label: "Favorite music genre", type: "string" },
      { id: "createdAt", label: "Creation date", type: "date" },
      { id: "rfmScore", label: "RFM score", type: "number" },
      { id: "engagementScore", label: "Engagement score", type: "number" },
    ],
  },
  {
    id: "consumptions",
    label: "Global consumptions",
    color: DS.neutral500,
    bg: DS.neutral200,
    fields: [
      { id: "dataType", label: "Data type", type: "enum", choices: ["All", "Ticketing", "E-commerce", "Subscriptions"] },
      { id: "recency", label: "Recency", type: "number" },
      { id: "loyalty", label: "Loyalty", type: "number" },
      { id: "purchaseDelay", label: "Purchase delay", type: "number" },
      { id: "averageBasketValue", label: "Average basket value", type: "number" },
      { id: "averageBasketVolume", label: "Average basket volume", type: "number" },
      { id: "totalAmount", label: "Total amount", type: "number" },
      { id: "totalTickets", label: "Total tickets", type: "number" },
      { id: "averagePrice", label: "Average price", type: "number" },
      { id: "maxPrice", label: "Max price", type: "number" },
      { id: "ticketCount", label: "Ticket count", type: "number" },
      { id: "purchaseCount", label: "Purchase count", type: "number" },
      { id: "cumulativeAmount", label: "Cumulative amount", type: "number" },
    ],
  },
  {
    id: "ticket",
    label: "Ticketing",
    color: DS.purple,
    bg: DS.purpleLight,
    fields: [
      { id: "eventName", label: "Event name", type: "string" },
      { id: "eventType", label: "Event type", type: "string" },
      { id: "eventStatus", label: "Event status", type: "enum", choices: ["Ongoing", "Ended", "Cancelled"] },
      { id: "ticketStatus", label: "Ticket status", type: "enum", choices: ["Sold", "Cancelled", "Refunded"] },
      { id: "ticketCategory", label: "Category", type: "string" },
      { id: "pricingFormula", label: "Pricing formula", type: "string" },
      { id: "eventStartDate", label: "Start date", type: "date" },
      { id: "eventEndDate", label: "End date", type: "date" },
      { id: "purchaseDate", label: "Purchase date", type: "date" },
      { id: "ticketPrice", label: "Ticket price", type: "number" },
      { id: "venue", label: "Venue", type: "string" },
      { id: "season", label: "Season", type: "string" },
      { id: "supplier", label: "Sales channel", type: "string" },
      { id: "source", label: "Source", type: "string" },
    ],
  },
  {
    id: "order",
    label: "E-commerce",
    color: DS.teal500,
    bg: DS.teal100,
    fields: [
      { id: "productName", label: "Product name", type: "string" },
      { id: "ticketCategory", label: "Category", type: "string" },
      { id: "pricingFormula", label: "Pricing formula", type: "string" },
      { id: "orderStatus", label: "Status", type: "enum", choices: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"] },
      { id: "purchaseDate", label: "Purchase date", type: "date" },
      { id: "supplier", label: "Sales channel", type: "string" },
      { id: "source", label: "Source", type: "string" },
      { id: "sizeVariant", label: "Size / Variant", type: "string" },
    ],
  },
  {
    id: "campaign",
    label: "Campaigns",
    color: DS.amber,
    bg: DS.amberLight,
    fields: [
      { id: "campaignName", label: "Campaign name", type: "string" },
      { id: "channelType", label: "Channel", type: "enum", choices: ["Email", "SMS", "Push", "Wallet"] },
      { id: "campaignTag", label: "Category", type: "string" },
      { id: "sentDate", label: "Send date", type: "date" },
      { id: "deliverDate", label: "Delivery date", type: "date" },
      { id: "openDate", label: "Open date", type: "date" },
      { id: "clickDate", label: "Click date", type: "date" },
      { id: "hasOpened", label: "Has opened", type: "enum", choices: ["Yes", "No"] },
      { id: "hasClicked", label: "Has clicked", type: "enum", choices: ["Yes", "No"] },
      { id: "supplier", label: "Marketing platform", type: "string" },
    ],
  },
  {
    id: "consent",
    label: "Consents",
    color: DS.teal500,
    bg: DS.teal100,
    fields: [
      { id: "consentName", label: "Consent name", type: "string" },
      { id: "channel", label: "Channel", type: "enum", choices: ["Email", "SMS", "Push", "Mail"] },
      { id: "consentStatus", label: "Status", type: "enum", choices: ["Opt-in", "Opt-out"] },
      { id: "actionDate", label: "Action date", type: "date" },
    ],
  },
  {
    id: "subscription",
    label: "Subscriptions",
    color: DS.orangeDark,
    bg: DS.orangeLight,
    fields: [
      { id: "subscriptionName", label: "Subscription name", type: "string" },
      { id: "subscriptionType", label: "Subscription type", type: "string" },
      { id: "subscriptionStatus", label: "Status", type: "enum", choices: ["Active", "Inactive", "Suspended", "Cancelled"] },
      { id: "startDate", label: "Start date", type: "date" },
      { id: "endDate", label: "End date", type: "date" },
      { id: "purchaseDate", label: "Purchase date", type: "date" },
      { id: "amount", label: "Amount", type: "number" },
      { id: "supplier", label: "Sales channel", type: "string" },
      { id: "source", label: "Source", type: "string" },
    ],
  },
  {
    id: "beneficiary",
    label: "Beneficiaries",
    color: DS.orange,
    bg: DS.amberLight,
    fields: [
      { id: "relationship", label: "Relationship with buyer", type: "enum", choices: ["Spouse", "Child", "Friend", "Colleague", "Other"] },
    ],
  },
  {
    id: "accessControl",
    label: "Access control",
    color: DS.indigoDark,
    bg: DS.indigoLight,
    fields: [
      { id: "accessPoint", label: "Event", type: "string" },
      { id: "numberOfControls", label: "Number of visits", type: "number" },
      { id: "createdAt", label: "Visit date", type: "date" },
    ],
  },
];

const OPS = {
  string: [
    { v: "is", l: "is equal to" },
    { v: "is_not", l: "is not equal to" },
    { v: "contains", l: "contains" },
    { v: "not_contains", l: "does not contain" },
    { v: "starts_with", l: "starts with" },
    { v: "ends_with", l: "ends with" },
    { v: "in", l: "is in list" },
    { v: "is_set", l: "is set" },
    { v: "is_not_set", l: "is not set" },
  ],
  enum: [
    { v: "is", l: "is" },
    { v: "is_not", l: "is not" },
    { v: "in", l: "is in list" },
    { v: "is_set", l: "is set" },
    { v: "is_not_set", l: "is not set" },
  ],
  number: [
    { v: "eq", l: "is equal to" },
    { v: "gt", l: "is greater than" },
    { v: "gte", l: "is greater than or equal to" },
    { v: "lt", l: "is less than" },
    { v: "lte", l: "is less than or equal to" },
    { v: "between", l: "is between" },
    { v: "is_set", l: "is set" },
    { v: "is_not_set", l: "is not set" },
  ],
  date: [
    { v: "is", l: "is on" },
    { v: "is_today", l: "is today" },
    { v: "is_this_week", l: "is this week" },
    { v: "before", l: "before" },
    { v: "after", l: "after" },
    { v: "between", l: "is between" },
    { v: "last_n_days", l: "in the last N days" },
    { v: "last_n_months", l: "in the last N months" },
    { v: "last_n_years", l: "in the last N years" },
    { v: "next_n_days", l: "in the next N days" },
    { v: "next_n_months", l: "in the next N months" },
    { v: "next_n_years", l: "in the next N years" },
    { v: "more_than_n_days_ago", l: "more than N days ago" },
    { v: "more_than_n_months_ago", l: "more than N months ago" },
    { v: "more_than_n_years_ago", l: "more than N years ago" },
    { v: "less_than_n_days_ago", l: "less than N days ago" },
    { v: "less_than_n_months_ago", l: "less than N months ago" },
    { v: "less_than_n_years_ago", l: "less than N years ago" },
    { v: "is_set", l: "is set" },
    { v: "is_not_set", l: "is not set" },
  ],
};

const QUICK_FILTERS = [
  {
    id: 'first_time_buyers',
    label: 'First-time buyers',
    description: 'Contacts with exactly one purchase ever.',
    filter: { objId: 'consumptions', fieldId: 'purchaseCount', op: 'eq', val: '1' },
  },
  {
    id: 'buyers_this_year',
    label: "This year's buyers",
    description: 'Purchased at least once during the current year.',
    filter: { objId: 'ticket', fieldId: 'purchaseDate', op: 'last_n_months', val: '12' },
  },
  {
    id: 'yesterday_buyers',
    label: "Yesterday's buyers",
    description: 'Bought yesterday — hot leads ready to re-engage.',
    filter: { objId: 'ticket', fieldId: 'purchaseDate', op: 'last_n_days', val: '1' },
  },
  {
    id: 'tomorrow_attendees',
    label: "Tomorrow's attendees",
    description: 'Hold a ticket for an event taking place tomorrow.',
    filter: { objId: 'ticket', fieldId: 'eventStartDate', op: 'next_n_days', val: '1' },
  },
  {
    id: 'buyers',
    label: 'Buyers',
    description: 'Any contact with at least one purchase of any type.',
    filter: { objId: 'consumptions', fieldId: 'purchaseCount', op: 'gte', val: '1' },
  },
  {
    id: 'non_buyers',
    label: 'Non-buyers',
    description: 'Contacts who have never completed a purchase.',
    filter: { objId: 'consumptions', fieldId: 'purchaseCount', op: 'eq', val: '0' },
  },
  {
    id: 'new_contacts',
    label: 'New contacts',
    description: 'Created in the last 30 days and not yet buyers.',
    filter: { objId: 'contact', fieldId: 'createdAt', op: 'last_n_days', val: '30' },
  },
  {
    id: 'inactive',
    label: 'Inactive contacts',
    description: 'No purchase recorded in over 12 months — reactivation targets.',
    filter: { objId: 'consumptions', fieldId: 'recency', op: 'gt', val: '365' },
  },
  {
    id: 'promoters',
    label: 'Promoters',
    description: 'High engagement score — your most loyal and active audience.',
    filter: { objId: 'contact', fieldId: 'engagementScore', op: 'gte', val: '80' },
  },
  {
    id: 'newsletter_subscribers',
    label: 'Newsletter subscribers',
    description: 'Opted in to newsletter communications via email.',
    filter: { objId: 'consent', fieldId: 'consentStatus', op: 'is', val: 'Opt-in' },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEGMENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────
let _uid = 1;
const uid = () => String(_uid++);
const noValue = (op) => op === "is_set" || op === "is_not_set";
const getObj = (id) => DATA_OBJECTS.find((o) => o.id === id) ?? DATA_OBJECTS[0];
const getField = (objId, fId) => { const o = getObj(objId); return o.fields.find((f) => f.id === fId) ?? o.fields[0]; };
const getOps = (objId, fId) => OPS[getField(objId, fId).type] ?? OPS.string;
const makeFilter = (objId = "contact") => { const o = getObj(objId); const f = o.fields[0]; return { id: uid(), objId, fieldId: f.id, op: getOps(objId, f.id)[0].v, val: "" }; };
const makeBlock = () => ({ id: uid(), logic: "AND", filters: [makeFilter()] });
const makeSeg = () => ({ topLogic: "AND", blocks: [makeBlock()] });

// ─────────────────────────────────────────────────────────────────────────────
// 5. SEGMENT EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────
const evalCond = (contact, cond) => {
  const field = getField(cond.objId, cond.fieldId);
  const raw = contact[cond.fieldId] ?? contact[field.id];
  const op = cond.op;

  if (op === "is_set") return raw !== undefined && raw !== null && raw !== "" && !(Array.isArray(raw) && raw.length === 0);
  if (op === "is_not_set") return !raw || (Array.isArray(raw) && raw.length === 0);

  const val = String(cond.val || "").toLowerCase().trim();
  if (!val) return true;

  if (Array.isArray(raw)) {
    const items = raw.map((t) => String(t).toLowerCase());
    if (op === "is") return items.includes(val);
    if (op === "is_not") return !items.includes(val);
    if (op === "contains") return items.some((t) => t.includes(val));
    return true;
  }

  if (field.type === "number") {
    const n = parseFloat(val);
    const r = parseFloat(raw);
    if (isNaN(n) || isNaN(r)) return true;
    if (op === "eq") return r === n;
    if (op === "gt") return r > n;
    if (op === "gte") return r >= n;
    if (op === "lt") return r < n;
    if (op === "lte") return r <= n;
    return true;
  }

  const s = String(raw || "").toLowerCase();
  if (op === "is") return s === val;
  if (op === "is_not") return s !== val;
  if (op === "contains") return s.includes(val);
  if (op === "not_contains") return !s.includes(val);
  if (op === "starts_with") return s.startsWith(val);
  return true;
};

const evalBlock = (c, b) =>
  b.logic === "OR"
    ? b.filters.some((f) => evalCond(c, f))
    : b.filters.every((f) => evalCond(c, f));

const evalSeg = (contacts, seg) => {
  if (!seg || !seg.blocks.length) return contacts;
  return contacts.filter((c) =>
    seg.topLogic === "OR"
      ? seg.blocks.some((b) => evalBlock(c, b))
      : seg.blocks.every((b) => evalBlock(c, b))
  );
};

const ObjIcon = ({ id, s = 13 }) => {
  const obj = getObj(id);
  const p = { s, c: obj.color };
  const map = {
    contact: <Ico.User {...p} />,
    consumptions: <Ico.Card {...p} />,
    consent: <Ico.Eye {...p} />,
    ticket: <Ico.Ticket {...p} />,
    order: <Ico.Cart {...p} />,
    campaign: <Ico.Mail {...p} />,
    beneficiary: <Ico.Users {...p} />,
    subscription: <Ico.Subscriptions {...p} />,
    accessControl: <Ico.AccessControl {...p} />,
  };
  return map[id] ?? <Ico.User {...p} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. SHARED HOOKS
// ─────────────────────────────────────────────────────────────────────────────
const usePortalDropdown = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return { open, setOpen, triggerRef, dropdownRef };
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Btn = ({
  label, onClick, variant = "primary", size = "md",
  iconLeft, iconRight, disabled = false, style: extra = {},
}) => {
  const [hovered, setHovered] = useState(false);
  const h = hovered && !disabled;
  const sm = size === "sm";

  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "0 16px", height: sm ? 32 : 40, borderRadius: 4,
    fontFamily: DS.ff, fontSize: sm ? 12 : 14, fontWeight: 400,
    lineHeight: sm ? "16px" : "20px",
    cursor: hovered ? "pointer" : null,
    opacity: disabled ? 0.4 : 1,
    transition: "all .15s", whiteSpace: "nowrap", border: "1px solid transparent",
  };

  const variants = {
    primary: { background: h ? DS.blue300 : DS.actionPrimary, border: `1px solid ${h ? DS.blue300 : DS.actionPrimary}`, color: DS.neutral0 },
    secondary: { background: h ? DS.blue100 : DS.neutral0, border: `1px solid ${h ? DS.blue300 : DS.actionPrimary}`, color: h ? DS.actionPrimary : DS.neutral900 },
    tertiary: { background: h ? DS.blue100 : "transparent", border: "1px solid transparent", color: h ? DS.actionPrimary : DS.neutral900 },
  };

  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant], ...extra }}>
      {iconLeft}{label}{iconRight}
    </button>
  );
};

const IconBtn = ({
  icon, onClick, variant = "primary", size = "md",
  disabled = false, title, style: extra = {},
}) => {
  const [hovered, setHovered] = useState(false);
  const h = hovered && !disabled;
  const dim = size === "sm" ? 28 : 40;

  const variants = {
    primary: { background: h ? DS.blue300 : DS.actionPrimary, border: `1px solid ${h ? DS.blue300 : DS.actionPrimary}` },
    secondary: { background: h ? DS.blue100 : DS.neutral0, border: `1px solid ${h ? DS.blue300 : DS.actionPrimary}` },
    tertiary: { background: h ? DS.blue100 : "transparent", border: "1px solid transparent" },
  };

  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: dim, height: dim, borderRadius: 4, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1, transition: "all .15s",
        ...variants[variant], ...extra,
      }}>
      <span style={{ display: 'flex' }}>
        {icon}
      </span>
    </button>
  );
};

const LogicPill = ({ value, onChange }) => {
  const isAnd = value === "AND";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", height: 24, borderRadius: 4,
      border: `1px solid ${DS.neutral200}`, background: DS.neutral100, overflow: "hidden", flexShrink: 0,
    }}>
      {["AND", "OR"].map((opt) => {
        const active = value === opt;
        const isAndOpt = opt === "AND";
        return (
          <button key={opt} onClick={() => onChange(opt)}
            style={{
              padding: "0 10px", height: "100%", border: "none",
              background: active ? DS.actionPrimary : "transparent",
              color: active ? DS.neutral0 : DS.neutral500,
              fontSize: 10, fontWeight: 700, fontFamily: DS.ff, cursor: "pointer",
              letterSpacing: "0.06em", transition: "all .15s",
            }}>
            {isAndOpt ? "AND" : "OR"}
          </button>
        );
      })}
    </div>
  );
};

const PagBtn = ({ children, onClick, disabled, active }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 4,
        border: `1px solid ${active ? DS.actionPrimary : DS.neutral200}`,
        background: active ? DS.actionPrimary : hovered ? DS.neutral100 : DS.neutral0,
        color: active ? DS.neutral0 : DS.neutral900,
        fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: DS.ff,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.4 : 1, transition: "all .15s",
      }}>
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. PORTAL DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────
const PortalDropdown = ({ triggerRef, open, children, minWidth }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropH = 380;
    const showAbove = window.innerHeight - rect.bottom < dropH && rect.top > dropH;
    setPos({
      top: showAbove ? rect.top + window.scrollY - dropH - 4 : rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });
  }, [open, triggerRef]);

  if (!open) return null;
  return createPortal(
    <div style={{ position: "absolute", top: pos.top, left: pos.left, minWidth: minWidth ?? 160, zIndex: 9999 }}>
      {children}
    </div>,
    document.body
  );
};

const dropdownListStyle = {
  background: DS.neutral0, border: `1px solid ${DS.neutral200}`,
  borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,.15)", overflow: "hidden",
};

const DropdownItem = ({ label, isSelected, onClick }) => (
  <div onClick={onClick}
    style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, fontFamily: DS.ff, transition: "background .1s", color: isSelected ? DS.actionPrimary : DS.neutralBlack, background: isSelected ? DS.blue100 : "transparent" }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = DS.neutral100; }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? DS.blue100 : "transparent"; }}>
    {label}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 10. SEGMENT BUILDER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_TYPE_TAG = { string: "Aa", number: "#", enum: "≡", date: "cal" };

const FieldPickerPanel = ({ value, onChange, onQuick }) => {
  const { open, setOpen, triggerRef, dropdownRef } = usePortalDropdown();
  const [search, setSearch] = useState('');
  const [hoveredQuick, setHoveredQuick] = useState(null);
  const searchRef = useRef();

  const currentObj = value ? DATA_OBJECTS.find(o => o.id === value.objId) : null;
  const currentField = currentObj ? currentObj.fields.find(f => f.id === value.fieldId) : null;

  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 10); }, [open]);

  const q = search.toLowerCase();
  const filtered = DATA_OBJECTS
    .map(obj => ({ ...obj, fields: obj.fields.filter(f => !q || f.label.toLowerCase().includes(q) || obj.label.toLowerCase().includes(q)) }))
    .filter(o => o.fields.length > 0);

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* ── Trigger button ─────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 12px', height: 40, minWidth: 210, borderRadius: 4,
          border: `1px solid ${open ? DS.actionPrimary : currentObj ? currentObj.color + '50' : DS.neutral200}`,
          background: currentObj ? currentObj.bg : DS.neutral100,
          cursor: 'pointer', fontFamily: DS.ff, fontSize: 14,
          color: currentField ? currentObj.color : DS.neutral500,
          fontWeight: currentField ? 500 : 400,
          transition: 'border-color .15s',
        }}
      >
        {currentObj && <ObjIcon id={currentObj.id} s={13} />}
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentField ? currentField.label : 'Choose a field…'}
        </span>
        <Ico.ChevD s={13} c={open ? DS.actionPrimary : (currentField ? currentObj.color : DS.neutral500)} />
      </button>

      {/* ── Portal panel ───────────────────────────────────────────────────── */}
      <PortalDropdown triggerRef={triggerRef} open={open} minWidth={700}>
        <div
          ref={dropdownRef}
          style={{
            width: 700,
            background: DS.neutral0,
            border: `1px solid ${DS.neutral200}`,
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(15,23,42,.14)',
            display: 'flex',
            overflow: 'hidden',
            maxHeight: 440,
          }}
        >

          {/* ── Left : all fields ──────────────────────────────────────────── */}
          <div style={{
            width: 280, flexShrink: 0,
            borderRight: `1px solid ${DS.neutral200}`,
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: `1px solid ${DS.neutral200}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: DS.ff, fontSize: 11, fontWeight: 700,
                color: DS.neutral500, textTransform: 'uppercase', letterSpacing: '.07em',
              }}>
                All fields
              </span>
              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 8px', height: 32, borderRadius: 4,
                border: `1px solid ${DS.neutral200}`, background: DS.neutral100,
                marginTop: 8,
              }}>
                <Ico.Search s={13} c={DS.neutral500} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search a field…"
                  style={{
                    flex: 1, border: 'none', outline: 'none',
                    background: 'transparent', fontFamily: DS.ff,
                    fontSize: 12, color: DS.neutralBlack,
                  }}
                />
              </div>
            </div>

            {/* Fields list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map(obj => (
                <div key={obj.id}>
                  {/* Group label */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px 4px',
                    background: DS.neutral100,
                    borderTop: `1px solid ${DS.neutral200}`,
                    position: 'sticky', top: 0, zIndex: 1,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 3,
                      background: obj.bg, border: `1px solid ${obj.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <ObjIcon id={obj.id} s={11} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: obj.color, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: DS.ff }}>
                      {obj.label}
                    </span>
                  </div>

                  {/* Fields */}
                  {obj.fields.map(f => {
                    const isSel = value?.objId === obj.id && value?.fieldId === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => { onChange({ objId: obj.id, fieldId: f.id }); setOpen(false); setSearch(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 12px 7px 22px', cursor: 'pointer',
                          background: isSel ? DS.blue100 : 'transparent',
                          transition: 'background .1s',
                        }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = DS.neutral100; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: 13, fontFamily: DS.ff, color: isSel ? DS.actionPrimary : DS.neutralBlack, fontWeight: isSel ? 500 : 400 }}>
                          {f.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: DS.neutral500, padding: '1px 5px', borderRadius: 3, background: DS.neutral100, fontFamily: DS.ff }}>
                            {FIELD_TYPE_TAG[f.type]}
                          </span>
                          {isSel && <Ico.Check s={12} c={DS.actionPrimary} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>
                  No field found
                </div>
              )}
            </div>
          </div>

          {/* ── Right : quick filters (vertical list) ──────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
              padding: '10px 14px 8px',
              borderBottom: `1px solid ${DS.neutral200}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: DS.ff, fontSize: 11, fontWeight: 700,
                color: DS.neutral500, textTransform: 'uppercase', letterSpacing: '.07em',
              }}>
                Quick filters
              </span>
            </div>

            {/* Vertical list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {QUICK_FILTERS.map((qf, i) => {
                const isHov = hoveredQuick === qf.id;
                return (
                  <div
                    key={qf.id}
                    onClick={() => { onQuick(qf.filter); setOpen(false); }}
                    onMouseEnter={() => setHoveredQuick(qf.id)}
                    onMouseLeave={() => setHoveredQuick(null)}
                    style={{
                      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                      gap: 12, padding: '9px 14px',
                      borderBottom: i < QUICK_FILTERS.length - 1 ? `1px solid ${DS.neutral200}` : 'none',
                      background: isHov ? DS.blue100 : DS.neutral0,
                      cursor: 'pointer',
                      transition: 'background .1s',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, lineHeight: '18px',
                        color: isHov ? DS.actionPrimary : DS.neutralBlack,
                        fontFamily: DS.ff,
                        transition: 'color .1s',
                      }}>
                        {qf.label}
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 400, lineHeight: '15px',
                        color: DS.neutral500, fontFamily: DS.ff,
                        marginTop: 2,
                      }}>
                        {qf.description}
                      </div>
                    </div>
                    <svg
                      width="12" height="12" viewBox="0 0 16 16" fill="none"
                      style={{ flexShrink: 0, opacity: isHov ? 0.6 : 0.25, transition: 'opacity .1s' }}
                    >
                      <path d="M6 4l4 4-4 4" stroke={isHov ? DS.actionPrimary : DS.neutralBlack} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </PortalDropdown>
    </div>
  );
};

const OpPicker = ({ ops, value, onChange }) => {
  const { open, setOpen, triggerRef, dropdownRef } = usePortalDropdown();
  const selected = ops.find((o) => o.v === value);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button ref={triggerRef} onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "0 12px", height: 40, minWidth: 170, borderRadius: 4,
          border: `1px solid ${open ? DS.actionPrimary : DS.neutral200}`,
          background: DS.neutral100, cursor: "pointer", fontFamily: DS.ff, fontSize: 14,
          color: DS.neutralBlack, transition: "border-color .15s",
        }}>
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.l ?? "—"}</span>
        <Ico.ChevD s={13} c={open ? DS.actionPrimary : DS.neutral500} />
      </button>

      <PortalDropdown triggerRef={triggerRef} open={open} minWidth={210}>
        <div ref={dropdownRef} style={{ ...dropdownListStyle, minWidth: 210 }}>
          {ops.map((op) => (
            <DropdownItem key={op.v} label={op.l} isSelected={op.v === value} onClick={() => { onChange(op.v); setOpen(false); }} />
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
};

const ValInput = ({ field, value, onChange }) => {
  const { open, setOpen, triggerRef, dropdownRef } = usePortalDropdown();
  const [focused, setFocused] = useState(false);

  const inputBase = {
    height: 40, padding: "0 12px", borderRadius: 4, minWidth: 140,
    background: DS.neutral100, fontFamily: DS.ff, fontSize: 14,
    color: DS.neutralBlack, outline: "none", transition: "border-color .15s",
  };

  if (field.type === "enum") {
    return (
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button ref={triggerRef} onClick={() => setOpen((o) => !o)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...inputBase, border: `1px solid ${open ? DS.actionPrimary : DS.neutral200}`, color: value ? DS.neutralBlack : DS.neutral500, cursor: "pointer" }}>
          <span style={{ flex: 1, textAlign: "left" }}>{value || "Choose…"}</span>
          <Ico.ChevD s={13} c={open ? DS.actionPrimary : DS.neutral500} />
        </button>
        <PortalDropdown triggerRef={triggerRef} open={open} minWidth={160}>
          <div ref={dropdownRef} style={{ ...dropdownListStyle, minWidth: 160 }}>
            {field.choices.map((c) => (
              <DropdownItem key={c} label={c} isSelected={c === value} onClick={() => { onChange(c); setOpen(false); }} />
            ))}
          </div>
        </PortalDropdown>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase, border: `1px solid ${focused ? DS.actionPrimary : DS.neutral200}`, background: DS.neutral0 }} />
    );
  }

  return (
    <input value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={field.type === "number" ? "0" : "Value…"}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputBase, border: `1px solid ${focused ? DS.actionPrimary : DS.neutral200}`, background: DS.neutral0 }} />
  );
};

const FilterRow = ({ filter, onPatch, onRemove }) => {
  const field = getField(filter.objId, filter.fieldId);
  const ops = getOps(filter.objId, filter.fieldId);
  const isNoVal = noValue(filter.op);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 6px", borderRadius: 6, transition: "background .1s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = DS.neutral100; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>

      <FieldPickerPanel
        value={{ objId: filter.objId, fieldId: filter.fieldId }}
        onChange={({ objId, fieldId }) => { const newOps = getOps(objId, fieldId); onPatch({ objId, fieldId, op: newOps[0].v, val: '' }); }}
        onQuick={(filter) => { const newOps = getOps(filter.objId, filter.fieldId); onPatch({ ...filter, op: filter.op, val: filter.val }); }}
      />
      <OpPicker ops={ops} value={filter.op} onChange={(op) => onPatch({ op, val: "" })} />
      {isNoVal
        ? <div style={{ height: 40, minWidth: 80, padding: "0 12px", borderRadius: 4, border: `1px dashed ${DS.neutral200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: DS.neutral500, fontFamily: DS.ff }}>—</div>
        : <ValInput field={field} value={filter.val} onChange={(val) => onPatch({ val })} />
      }
      <IconBtn variant="tertiary" size="sm" icon={<Ico.Cross s={12} c={DS.neutral500} />} onClick={onRemove} />
    </div>
  );
};

const FilterBlock = ({ block, idx, topLogic, onTopLogicChange, onPatchBlock, onRemoveBlock }) => {
  const patchFilter = (fid, patch) => onPatchBlock({ filters: block.filters.map((f) => f.id === fid ? { ...f, ...patch } : f) });
  const removeFilter = (fid) => onPatchBlock({ filters: block.filters.filter((f) => f.id !== fid) });
  const addFilter = () => onPatchBlock({ filters: [...block.filters, makeFilter(block.filters[0]?.objId ?? "contact")] });

  return (
    <div>
      {idx > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 8px 16px" }}>
          <div style={{ width: 1, height: 24, background: DS.neutral200 }} />
          <LogicPill value={topLogic} onChange={onTopLogicChange} />
          <span style={{ fontSize: 11, color: DS.neutral500, fontFamily: DS.ff }}>between blocks — click to change</span>
        </div>
      )}

      <div style={{ border: `1px solid ${DS.neutral200}`, borderRadius: 8, background: DS.neutral0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: "4px 4px 0 0" }}>
          <div style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: DS.actionPrimary, fontFamily: DS.ff }}>{idx + 1}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: DS.neutral900, fontFamily: DS.ff }}>Block {idx + 1}</span>
          <div style={{ marginLeft: "auto" }}>
            <IconBtn size="sm" variant="tertiary" icon={<Ico.Cross s={12} c={DS.neutral500} />} onClick={onRemoveBlock} />
          </div>
        </div>

        <div style={{ padding: "8px 8px 4px" }}>
          {block.filters.map((filter, fi) => (
            <div key={filter.id}>
              {fi > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px" }}>
                  <div style={{ width: 1, height: 12, background: DS.neutral200, marginLeft: 8 }} />
                  <LogicPill value={block.logic} onChange={(l) => onPatchBlock({ logic: l })} />
                </div>
              )}
              <FilterRow filter={filter}
                onPatch={(patch) => patchFilter(filter.id, patch)}
                onRemove={() => removeFilter(filter.id)} />
            </div>
          ))}
          <Btn size="sm" variant="tertiary" label="Add a filter" iconLeft={<Ico.Plus s={12} c={DS.actionPrimary} />} onClick={addFilter} />
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. TABLE
// ─────────────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "lastName", label: "Last name" },
  { key: "firstName", label: "First name" },
  { key: "email", label: "Email" },
  { key: "age", label: "Age", align: "right" },
  { key: "structure", label: "Structure" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

const ContactsTable = ({ data, selected, onToggle, onToggleAll, onContactClick, sortKey, sortDir, onSort }) => {
  const allSelected = data.length > 0 && data.every((c) => selected.has(c.id));
  const someSelected = data.some((c) => selected.has(c.id)) && !allSelected;

  return (
    <div style={{ width: "100%", overflowX: "auto", borderLeft: `1px solid ${DS.neutral200}`, borderRight: `1px solid ${DS.neutral200}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: DS.ff }}>
        <thead>
          <tr style={{ background: DS.blue100 }}>
            <th style={{ width: 44, padding: "0 12px", height: 44, borderBottom: `1px solid ${DS.neutral200}`, textAlign: "center" }}>
              <div onClick={onToggleAll}
                style={{ width: 16, height: 16, borderRadius: 4, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${allSelected || someSelected ? DS.actionPrimary : DS.neutral500}`, background: allSelected ? DS.actionPrimary : DS.neutral0 }}>
                {allSelected && <Ico.Check s={10} c={DS.neutral0} />}
                {someSelected && <div style={{ width: 8, height: 2, background: DS.actionPrimary, borderRadius: 1 }} />}
              </div>
            </th>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => onSort(col.key)}
                style={{ padding: "0 8px", height: 44, borderLeft: `1px solid ${DS.neutral200}`, borderBottom: `1px solid ${DS.neutral200}`, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", textAlign: col.align ?? "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "18px", color: DS.neutral900 }}>{col.label}</span>
                  <Ico.SortUp active={sortKey === col.key && sortDir === "asc"} />
                </div>
              </th>
            ))}
            <th style={{ padding: "0 8px", height: 44, borderLeft: `1px solid ${DS.neutral200}`, borderBottom: `1px solid ${DS.neutral200}`, textAlign: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: "18px", color: DS.neutral900 }}>Profile</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 2} style={{ padding: 32, textAlign: "center", fontSize: 13, color: DS.neutral500, fontFamily: DS.ff }}>
                No contacts match this segmentation
              </td>
            </tr>
          ) : data.map((contact, i) => {
            const isSel = selected.has(contact.id);
            const rowBase = isSel ? DS.blue100 : i % 2 === 0 ? DS.neutral0 : DS.neutral100;
            return (
              <tr key={contact.id} style={{ background: rowBase, transition: "background .1s" }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = DS.neutral100; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = rowBase; }}>
                <td style={{ padding: "0 12px", height: 40, borderBottom: `0.5px solid ${DS.neutral200}`, borderRight: `1px solid ${DS.neutral200}`, textAlign: "center" }}>
                  <div onClick={() => onToggle(contact.id)}
                    style={{ width: 16, height: 16, borderRadius: 4, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${isSel ? DS.actionPrimary : DS.neutral500}`, background: isSel ? DS.actionPrimary : DS.neutral0 }}>
                    {isSel && <Ico.Check s={10} c={DS.neutral0} />}
                  </div>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} style={{ padding: "0 12px", height: 40, borderRight: `1px solid ${DS.neutral200}`, borderBottom: `0.5px solid ${DS.neutral200}`, fontSize: 12, fontWeight: 400, lineHeight: "16px", textAlign: col.align ?? "left", color: DS.neutralBlack, whiteSpace: "nowrap" }}>
                    {contact[col.key] ?? "—"}
                  </td>
                ))}
                <td style={{ padding: "0 12px", height: 40, borderBottom: `0.5px solid ${DS.neutral200}`, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconBtn variant="secondary" size="sm" icon={<Ico.Eye s={14} c={DS.actionPrimary} />} onClick={() => onContactClick(contact)} title="View profile" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. TOOLBAR COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const SearchField = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 40, width: 180, borderRadius: 4, background: DS.neutral100, transition: "border-color .15s", border: `1px solid ${focused ? DS.actionPrimary : DS.neutral200}` }}>
      <Ico.Search s={14} c={DS.neutral500} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Quick search…"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: DS.ff, fontSize: 14, fontWeight: 400, lineHeight: "20px", color: DS.neutralBlack }} />
      {value && <span onClick={() => onChange("")} style={{ cursor: "pointer", fontSize: 12, color: DS.neutral500, lineHeight: 1 }}>✕</span>}
    </div>
  );
};

const OptionsMenu = ({ disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const items = [
    { icon: <Ico.Download s={16} />, label: "Export contacts" },
    { icon: <Ico.UserPlus s={16} />, label: "Add to a list" },
    { icon: <Ico.UserPlus s={16} />, label: "Add to a consent" },
    { icon: <Ico.UserMinus s={16} />, label: "Remove from a list" },
    { icon: <Ico.UserMinus s={16} />, label: "Remove from a consent" },
    { icon: <Ico.Trash s={16} />, label: "Delete contacts" },
    { icon: <Ico.Organization s={16} />, label: "Associate with a structure" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Btn onClick={() => { if (!disabled) setOpen(o => !o); }} disabled={disabled} variant="secondary" iconLeft={<Ico.Dots />} label="Options" />
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 9999, background: DS.neutral0, border: `1px solid ${DS.actionPrimary}`, borderRadius: 4, padding: 5, display: "flex", flexDirection: "column", minWidth: 200 }}>
          {items.map((item, i) => (
            <div key={i} onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 15, padding: "0 10px", height: 32, borderRadius: 4, cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = DS.blue100; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              {item.icon}
              <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", fontFamily: DS.ff, color: DS.neutralBlack, whiteSpace: "nowrap" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. SIDEBARS
// ─────────────────────────────────────────────────────────────────────────────
const CreateContactSidebar = ({ open, onClose }) => {
  const INITIAL_FORM = { email: "", nom: "", prenom: "", dateNaissance: "", telephone: "", adresse: "", codePostal: "", pays: "" };
  const [form, setForm] = useState(INITIAL_FORM);
  const [openSections, setOpenSections] = useState({ infos: true, coords: true, listes: false, consentements: false });

  const patch = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  const handleCancel = () => { setForm(INITIAL_FORM); onClose(); };

  if (!open) return null;

  const SectionHeader = ({ label, sKey }) => (
    <div onClick={() => toggleSection(sKey)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, padding: "8 10px", cursor: "pointer", borderBottom: `0.5px solid ${DS.neutral200}` }}>
      <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "18px", color: DS.blue800, fontFamily: DS.ff }}>{label}</span>
      {openSections[sKey] ? <Ico.ChevD s={16} c={DS.blue800} /> : <Ico.ChevR s={16} c={DS.blue800} />}
    </div>
  );

  const Field = ({ label, fKey, type = "text" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: DS.neutral500, fontFamily: DS.ff }}>{label}</span>
      <input type={type} value={form[fKey]} onChange={(e) => patch(fKey, e.target.value)}
        style={{ height: 40, padding: "4px 12px", borderRadius: 4, width: "100%", boxSizing: "border-box", border: `1px solid ${DS.neutral200}`, background: DS.neutral100, fontFamily: DS.ff, fontSize: 14, color: DS.neutral900, outline: "none", transition: "border-color .15s" }}
        onFocus={(e) => { e.target.style.borderColor = DS.actionPrimary; }}
        onBlur={(e) => { e.target.style.borderColor = DS.neutral200; }} />
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: DS.neutral0, zIndex: 1001, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(15,23,42,.15)", overflowY: "auto" }}>
        <div style={{ background: "linear-gradient(90.88deg, #5577BF 0%, #2CB1A2 100%)", padding: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 600, lineHeight: "22px", color: DS.neutral0, fontFamily: DS.ff }}>Create a contact</span>
          <IconBtn variant="tertiary" size="sm" icon={<Ico.Cross s={12} c={DS.neutral0} />} onClick={onClose} style={{ borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)" }} />
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
          <SectionHeader label="Information" sKey="infos" />
          {openSections.infos && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 10px" }}>
              <Field label="Email" fKey="email" type="email" />
              <Field label="Last name" fKey="nom" />
              <Field label="First name" fKey="prenom" />
              <Field label="Date of birth" fKey="dateNaissance" type="date" />
            </div>
          )}
          <SectionHeader label="Coordinates" sKey="coords" />
          {openSections.coords && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 10px" }}>
              <Field label="Phone" fKey="telephone" type="tel" />
              <Field label="Address" fKey="adresse" />
              <Field label="Postal code" fKey="codePostal" />
              <Field label="Country" fKey="pays" />
            </div>
          )}
          <SectionHeader label="Lists" sKey="listes" />
          <SectionHeader label="Consents" sKey="consentements" />
        </div>

        <div style={{ padding: "16px 24px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, borderTop: `1px solid ${DS.neutral200}` }}>
          <Btn variant="tertiary" label="Cancel" onClick={handleCancel} />
          <Btn variant="primary" label="Save" onClick={onClose} />
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ContactsPage({ selectedContact, setSelectedContact }) {
  const navigate = useNavigate();

  const [builderOpen, setBuilderOpen] = useState(false);
  const [segment, setSegment] = useState(makeSeg);
  const [applied, setApplied] = useState(null);
  const isDirty = JSON.stringify(segment) !== JSON.stringify(applied ?? makeSeg());

  const { topLogic, blocks } = segment;
  const setTopLogic = (l) => setSegment((s) => ({ ...s, topLogic: l }));
  const setBlocks = (fn) => setSegment((s) => ({ ...s, blocks: fn(s.blocks) }));
  const addBlock = () => setBlocks((bs) => [...bs, makeBlock()]);
  const removeBlock = (id) => setBlocks((bs) => bs.filter((b) => b.id !== id));
  const patchBlock = (id, p) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, ...p } : b));
  const handleApply = () => { setApplied(JSON.parse(JSON.stringify(segment))); setSelected(new Set()); setPage(1); };
  const handleCancel = () => setSegment(applied ? JSON.parse(JSON.stringify(applied)) : makeSeg());

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("lastName");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = evalSeg(CONTACTS, applied).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.firstName ?? "").toLowerCase().includes(q)
      || (c.lastName ?? "").toLowerCase().includes(q)
      || (c.email ?? "").toLowerCase().includes(q)
      || (c.structure ?? "").toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    const d = sortDir === "asc" ? 1 : -1;
    const av = String(a[sortKey] ?? "").toLowerCase();
    const bv = String(b[sortKey] ?? "").toLowerCase();
    return av < bv ? -d : av > bv ? d : 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleOne = (id) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    const pageIds = pageData.map((c) => c.id);
    const allSel = pageIds.every((id) => selected.has(id));
    setSelected((s) => { const n = new Set(s); pageIds.forEach((id) => allSel ? n.delete(id) : n.add(id)); return n; });
  };

  const handleContactClick = (c) => {
    setSelectedContact(c._fullData ?? c);
    navigate(`/contacts/${c.id}`);
  };

  const paginationRange = () => {
    const total = Math.min(5, totalPages);
    let start;
    if (totalPages <= 5) start = 1;
    else if (page <= 3) start = 1;
    else if (page >= totalPages - 2) start = totalPages - 4;
    else start = page - 2;
    return Array.from({ length: total }, (_, i) => start + i);
  };

  return (
    <div style={{ fontFamily: DS.ff, backgroundColor: "#F0F2F5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      <div style={{ backgroundColor: DS.neutral0, borderBottom: `1px solid ${DS.neutral200}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: DS.blue100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico.User s={18} c={DS.actionPrimary} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, lineHeight: "22px", color: DS.neutral900, fontFamily: DS.ff }}>Contacts</h1>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 400, lineHeight: "16px", color: DS.neutral500, fontFamily: DS.ff }}>{CONTACTS.length} contacts total</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Btn
            variant="primary"
            iconLeft={<Ico.Filter s={16} c={DS.neutral0} />}
            label="Start the segmentation"
            disabled={builderOpen}
            onClick={() => setBuilderOpen(true)}
          />
          {/* <IconBtn variant="secondary" icon={<Ico.AIicon c={DS.actionPrimary} />} /> */}
          <Btn variant="secondary" iconLeft={<Ico.Plus c={DS.actionPrimary} />} label="Add a contact" onClick={() => setShowCreateSidebar(true)} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: "calc(100% - 160px)", margin: "0 auto" }}>

        {/* ── Applied summary bar — shown when filters are applied and builder is closed ── */}
        {(builderOpen || applied) && (
          <>
            <div style={{ margin: "16px 24px 0", backgroundColor: DS.neutral0, border: `1px solid ${DS.neutral200}`, borderRadius: 4, overflow: "visible" }}>


              {/* ── Builder ── */}
              {builderOpen && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderRadius: "4px 4px 0 0" }}>

                  </div>

                  <div style={{ padding: "0px 16px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
                    {blocks.map((block, i) => (
                      <FilterBlock key={block.id} block={block} idx={i}
                        topLogic={topLogic} onTopLogicChange={setTopLogic}
                        onPatchBlock={(p) => patchBlock(block.id, p)}
                        onRemoveBlock={() => removeBlock(block.id)} />
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", padding: "8px 32px", borderTop: `0.5px solid ${DS.neutral200}`, background: DS.neutral100, gap: 8, borderRadius: "0 0 4px 4px" }}>
                    <Btn variant="primary" iconLeft={<Ico.List c={DS.neutral0} />} label="Create a list" />
                    <Btn variant="tertiary" iconLeft={<Ico.Plus s={13} c={DS.actionPrimary} />} label="Add a filter block" onClick={addBlock} />
                    <div style={{ flex: 1 }} />
                    <Btn variant="tertiary" label="Cancel" disabled={!isDirty} onClick={() => { handleCancel(); setBuilderOpen(false); }} />
                    <Btn variant="secondary" label="Search" disabled={!isDirty} onClick={() => { handleApply(); setBuilderOpen(false); }} />
                  </div>
                </>
              )}
            </div>
            <>
              <div style={{ margin: "12px 24px 0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 400, lineHeight: "20px", color: DS.neutral900, fontFamily: DS.ff }}>
                    <strong style={{ color: DS.actionPrimary }}>{sorted.length}</strong>&nbsp;contact{sorted.length !== 1 ? "s" : ""}
                  </span>
                  {applied && (
                    <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: DS.greenLight, color: DS.green600, fontSize: 11, fontWeight: 500 }}>Segmented</span>
                  )}
                  {selected.size > 0 && (
                    <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: DS.blue200, color: DS.actionPrimary, fontSize: 11, fontWeight: 500 }}>
                      {selected.size} selected
                    </span>
                  )}
                </div>
              </div>
            </>
          </>

        )}


        <div style={{ margin: "12px 24px 0" }}>


          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", borderBottom: `1px solid ${DS.neutral200}`, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn variant="secondary" iconLeft={<Ico.Settings />} label="Configure columns" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <OptionsMenu disabled={selected.size === 0} />
              <SearchField value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
            </div>
          </div>
        </div>

        <div style={{ marginInline: 24 }}>
          <ContactsTable
            data={pageData} selected={selected}
            onToggle={toggleOne} onToggleAll={toggleAll}
            onContactClick={handleContactClick}
            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        </div>

        <div style={{ marginInline: 24, marginBottom: 24, backgroundColor: DS.neutral0, border: `1px solid ${DS.neutral200}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", color: DS.neutral500, fontFamily: DS.ff }}>
            {sorted.length === 0 ? "No results" : `${Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–${Math.min(page * PAGE_SIZE, sorted.length)} of ${sorted.length}`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><Ico.ChevL s={13} c={DS.neutral900} /></PagBtn>
            {paginationRange().map((p) => (
              <PagBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><Ico.ChevR s={13} c={DS.neutral900} /></PagBtn>
          </div>
        </div>

        {selectedContact && (
          <ContactRecord contact={selectedContact} onClose={() => setSelectedContact(null)} />
        )}
      </div>

      <CreateContactSidebar open={showCreateSidebar} onClose={() => setShowCreateSidebar(false)} />
    </div>
  );
}