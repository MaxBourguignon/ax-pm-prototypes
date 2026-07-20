import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import contactsData from "../../../contacts.json";
import AddFilterModal from "./AddFilterModal";
import {DS} from "../../utils/designSystem";
import Ico from '../../utils/icons';
import { Btn }        from '../../components/Btn';
import IconBtn from "../../components/Iconbtn";
import { Toggle }     from '../../components/Controls';
import { StatusBadge } from '../../components/Tag';
import PageHeader from '../../components/PageHeader';
import { SearchField } from '../../components/Field';
import Pagination from '../../components/Pagination';
import { SortHeader } from '../../components/SortHeader';
import DATA_OBJECTS from "../../utils/dataObject";
import ListActionModal from "./ListActionModal";
import CreateListModal from "./CreateListModal";
import DeleteContactsModal from "./DeleteContactsModal";
import ConsentActionModal from "./ConsentActionModal";
import ColumnCustomizer from "./ColumnCustomizer";
import ViewsBar from "./ViewsBar";
import ViewModal from "./ViewModal";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHANNEL SCOPES & FIELD MAPS
// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL_SCOPES = [
  { id: "all",           label: "All channels"  },
  { id: "ticketing",     label: "Ticketing"     },
  { id: "ecommerce",     label: "E-commerce"    },
  { id: "subscriptions", label: "Subscriptions" },
];

const CONSUMPTIONS_CHANNEL_FIELDS = {
  all: [],
  ticketing: [
    { id: "eventName",          label: "Event name",          type: "string" },
    { id: "representationName", label: "Representation",      type: "string" },
    { id: "representationDate", label: "Representation date", type: "date"   },
    { id: "season",             label: "Season",              type: "string" },
    { id: "venue",              label: "Venue",               type: "string" },
  ],
  ecommerce: [
    { id: "productName",     label: "Product name", type: "string" },
    { id: "productCategory", label: "Category",     type: "string" },
  ],
  subscriptions: [
    { id: "subscriptionName", label: "Plan name",    type: "string" },
    { id: "renewalDate",      label: "Renewal date", type: "date"   },
  ],
};

const ECOMMERCE_LEVEL_FIELDS = {
  purchase: ["purchaseCount", "purchaseDate", "orderAmount", "supplier"],
  product:  ["productCount", "productName", "productCategory", "orderStatus", "unitPrice"],
};

const SUBSCRIPTION_LEVEL_FIELDS = {
  purchase:     ["purchaseCount", "purchaseDate"],
  subscription: ["subscriptionCount", "subscriptionName", "subscriptionStatus", "startDate", "endDate", "amount"],
};

// Returns refinement fields for a given object + anchor state.
// Ticket: fields tagged "any" always shown; count fields cross-referenced by level.
const getRefinementFields = (objId, anchorLevel, channelScope = "all") => {
  const obj = DATA_OBJECTS.find(o => o.id === objId);
  if (!obj) return [];
  if (objId === "consumptions") {
    return [...obj.fields, ...(CONSUMPTIONS_CHANNEL_FIELDS[channelScope] ?? [])];
  }
  if (objId === "ticket") {
    return obj.fields.filter(f => f.level === "any" || f.level === anchorLevel);
  }
  if (objId === "order") {
    const ids = ECOMMERCE_LEVEL_FIELDS[anchorLevel] ?? [];
    return obj.fields.filter(f => ids.includes(f.id));
  }
  if (objId === "subscription") {
    const ids = SUBSCRIPTION_LEVEL_FIELDS[anchorLevel] ?? [];
    return obj.fields.filter(f => ids.includes(f.id));
  }
  return obj.fields;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. OBJECT ANCHORS
// ─────────────────────────────────────────────────────────────────────────────

const OBJECT_ANCHORS = {
  consumptions: {
    defaultLevel: "purchase",
    defaultChannelScope: "all",
    levels: {
      purchase: {
        positive: { label: "Has made a purchase",       fieldId: "purchaseCount", op: "gte", val: "1" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq",  val: "0" },
      },
    },
  },
  ticket: {
    defaultLevel: "ticket",
    levels: {
      ticket: {
        positive: { label: "Has bought a ticket",     fieldId: "ticketCount",  op: "gte", val: "1", refinementLevelKey: "ticket"   },
        negative: { label: "Has not bought a ticket", fieldId: "ticketCount",  op: "eq",  val: "0", refinementLevelKey: "ticket"   },
      },
      purchase: {
        positive: { label: "Has made a purchase",       fieldId: "purchaseCount", op: "gte", val: "1", refinementLevelKey: "purchase" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq",  val: "0", refinementLevelKey: "purchase" },
      },
    },
  },
  order: {
    defaultLevel: "purchase",
    levels: {
      purchase: {
        positive: { label: "Has made a purchase",       fieldId: "purchaseCount", op: "gte", val: "1", refinementLevelKey: "purchase" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq",  val: "0", refinementLevelKey: "purchase" },
      },
      product: {
        positive: { label: "Has ordered a product",       fieldId: "productCount", op: "gte", val: "1", refinementLevelKey: "product" },
        negative: { label: "Has never ordered a product", fieldId: "productCount", op: "eq",  val: "0", refinementLevelKey: "product" },
      },
    },
  },
  subscription: {
    defaultLevel: "subscription",
    levels: {
      purchase: {
        positive: { label: "Has made a purchase",       fieldId: "purchaseCount",     op: "gte", val: "1", refinementLevelKey: "purchase"     },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount",     op: "eq",  val: "0", refinementLevelKey: "purchase"     },
      },
      subscription: {
        positive: { label: "Has a subscription",  fieldId: "subscriptionCount", op: "gte", val: "1", refinementLevelKey: "subscription" },
        negative: { label: "Has no subscription", fieldId: "subscriptionCount", op: "eq",  val: "0", refinementLevelKey: "subscription" },
      },
    },
  },
  campaign: {
    defaultLevel: "campaign",
    levels: {
      campaign: {
        positive: { label: "Has received a campaign",     fieldId: "campaignName", op: "is_set",     val: "" },
        negative: { label: "Has not received a campaign", fieldId: "campaignName", op: "is_not_set", val: "" },
      },
    },
  },
  consent: {
    defaultLevel: "consent",
    levels: {
      consent: {
        positive: { label: "Has consented",     fieldId: "consentStatus", op: "is", val: "Opt-in"  },
        negative: { label: "Has not consented", fieldId: "consentStatus", op: "is", val: "Opt-out" },
      },
    },
  },
  accessControl: {
    defaultLevel: "visit",
    levels: {
      visit: {
        positive: { label: "Has visited an event",     fieldId: "numberOfControls", op: "gte", val: "1" },
        negative: { label: "Has not visited an event", fieldId: "numberOfControls", op: "eq",  val: "0" },
      },
    },
  },
};

const getAnchorConfig = (objId, level, polarity = "positive") =>
  OBJECT_ANCHORS[objId]?.levels?.[level]?.[polarity] ?? null;

const makeDefaultAnchorFilter = (objId, uidFn) => {
  const anchor = OBJECT_ANCHORS[objId];
  if (!anchor) return null;
  const level  = anchor.defaultLevel;
  const config = anchor.levels[level].positive;
  const scope  = anchor.defaultChannelScope ?? null;
  return {
    id: uidFn(), objId,
    fieldId: config.fieldId, op: config.op, val: config.val,
    isAnchor: true, anchorPolarity: "positive", anchorLevel: level,
    ...(scope ? { channelScope: scope } : {}),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONTACTS DATA
// ─────────────────────────────────────────────────────────────────────────────

// Deterministic short hash from a contact id — used to display anonymized PII.
const anonHash = (id) => {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0").slice(0, 8).toUpperCase();
};

const CONTACTS = contactsData.map((c, i) => {
  // Contacts linked to purchases are anonymized on deletion rather than removed —
  // they stay in the base with their PII replaced by a hash. (~1 in 6 here.)
  const anonymized = i % 6 === 3;
  const base = {
    id: c.id,
    firstName: c.identity.firstName, lastName: c.identity.lastName,
    email: c.identity.email, age: c.identity.age, gender: c.identity.gender,
    phone: c.coordinates?.phone, postalCode: c.coordinates?.postalCode, country: c.coordinates?.country,
    structure: c.structure, loyalty: c.loyalty, lists: c.lists,
    acquisitionSource: c.source?.acquisitionSource, createdAt: c.source?.createdAt,
    totalSpending: c.stats?.totalSpending?.amount, lastPurchaseDate: c.stats?.lastPurchase?.date,
    _fullData: c, anonymized,
  };
  if (!anonymized) return base;
  const h = anonHash(c.id);
  // PII scrubbed; analytics fields (age, spending, country…) preserved.
  return { ...base, firstName: "Anonymized", lastName: `#${h}`, email: `${h.toLowerCase()}@anonymized`, phone: "•••• •••• ••", gender: "—" };
});

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────────────────────────────────────
// 4. OPERATORS
// ─────────────────────────────────────────────────────────────────────────────

const OPS = {
  string: [
    { v: "in", l: "in" }, { v: "not in", l: "not in" },
    { v: "is", l: "is equal to" }, { v: "is_not", l: "is not equal to" },
    { v: "contains", l: "contains" }, { v: "not_contains", l: "does not contain" },
    { v: "starts_with", l: "starts with" }, { v: "is_set", l: "is set" }, { v: "is_not_set", l: "is not set" },
  ],
  enum: [
    { v: "is", l: "is" }, { v: "is_not", l: "is not" },
    { v: "in", l: "is in list" }, { v: "is_set", l: "is set" }, { v: "is_not_set", l: "is not set" },
  ],
  number: [
    { v: "gte", l: "at least" }, { v: "gt", l: "more than" }, { v: "eq", l: "exactly" },
    { v: "neq", l: "is not equal to" },  // ← new
    { v: "lt", l: "less than" }, { v: "lte", l: "at most" }, { v: "between", l: "between" },
    { v: "is_set", l: "is set" }, { v: "is_not_set", l: "is not set" },
  ],

  date: [
    // absolute
    { v: "is",           l: "is on"          },
    { v: "is_today",     l: "is today"       },
    { v: "before",       l: "before"         },
    { v: "after",        l: "after"          },
    { v: "between",      l: "between"        },
    { v: "last_n_time",         l: "in the last"    },
    { v: "next_n_time",         l: "in the next"    },
    { v: "more_than_n_time_ago",l: "more than time ago"},
    { v: "exactly_n_time_ago",  l: "exactly time ago"  }, 
    { v: "in_time",             l: "exactly in"   },
    { v: "is_set",       l: "is set"         },
    { v: "is_not_set",   l: "is not set"     },
  ],
};

const ANCHOR_OPS = [
  { v: "eq", l: "exactly" }, { v: "gte", l: "at least" }, { v: "gt", l: "more than" }, 
  { v: "lt",  l: "less than" }, { v: "lte", l: "at most" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

let _uid = 1;
const uid       = () => String(_uid++);
const noValue   = (op) => ["is_set", "is_not_set", "is_today", "is_tomorrow", "was_yesterday", "is_this_week", "is_this_month"].includes(op);
const getObj    = (id) => DATA_OBJECTS.find((o) => o.id === id) ?? DATA_OBJECTS[0];
const getField  = (objId, fId) => { const o = getObj(objId); return o.fields.find((f) => f.id === fId) ?? o.fields[0]; };
const getOps    = (objId, fId) => OPS[getField(objId, fId).type] ?? OPS.string;
const makeBlock = () => ({ id: uid(), logic: "AND", filters: [] });
const makeSeg   = () => ({ topLogic: "AND", blocks: [] });

// ─────────────────────────────────────────────────────────────────────────────
// 6. EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

const evalCond = (contact, cond) => {
  const field = getField(cond.objId, cond.fieldId);
  const raw   = contact[cond.fieldId] ?? contact[field.id];
  const op    = cond.op;
  if (op === "is_set")     return raw !== undefined && raw !== null && raw !== "" && !(Array.isArray(raw) && raw.length === 0);
  if (op === "is_not_set") return !raw || (Array.isArray(raw) && raw.length === 0);
  const val = String(cond.val || "").toLowerCase().trim();
  if (!val) return true;
  if (Array.isArray(raw)) {
    const items = raw.map((t) => String(t).toLowerCase());
    if (op === "is")       return items.includes(val);
    if (op === "is_not")   return !items.includes(val);
    if (op === "contains") return items.some((t) => t.includes(val));
    return true;
  }
  if (field.type === "number") {
    const n = parseFloat(val), r = parseFloat(raw);
    if (isNaN(n) || isNaN(r)) return true;
    if (op === "eq")  return r === n;
    if (op === "gt")  return r > n;
    if (op === "gte") return r >= n;
    if (op === "lt")  return r < n;
    if (op === "lte") return r <= n;
    return true;
  }
  const s = String(raw || "").toLowerCase();
  if (op === "is")          return s === val;
  if (op === "is_not")      return s !== val;
  if (op === "contains")    return s.includes(val);
  if (op === "not_contains") return !s.includes(val);
  if (op === "starts_with") return s.startsWith(val);
  return true;
};

const evalBlock = (c, b) =>
  b.logic === "OR"
    ? b.filters.some((f)  => evalCond(c, f))
    : b.filters.every((f) => evalCond(c, f));

const evalSeg = (contacts, seg) => {
  if (!seg || !seg.blocks.length) return contacts;
  return contacts.filter((c) =>
    seg.topLogic === "OR"
      ? seg.blocks.some((b)  => evalBlock(c, b))
      : seg.blocks.every((b) => evalBlock(c, b))
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. OBJ ICON
// ─────────────────────────────────────────────────────────────────────────────

const ObjIcon = ({ id, s = 13 }) => {
  const obj = getObj(id);
  const p   = { s, c: obj.color };
  const map = {
    contact:       <Ico.User          {...p} />,
    consumptions:  <Ico.Card          {...p} />,
    ticket:        <Ico.Ticket        {...p} />,
    order:         <Ico.Cart          {...p} />,
    subscription:  <Ico.Subscriptions {...p} />,
    campaign:      <Ico.Mail          {...p} />,
    consent:       <Ico.Eye           {...p} />,
    accessControl: <Ico.AccessControl {...p} />,
  };
  return map[id] ?? <Ico.User {...p} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. HOOKS
// ─────────────────────────────────────────────────────────────────────────────

const usePortalDropdown = () => {
  const [open, setOpen] = useState(false);
  const triggerRef      = useRef();
  const dropdownRef     = useRef();
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return { open, setOpen, triggerRef, dropdownRef };
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 10. PORTAL DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const PortalDropdown = ({ triggerRef, open, children, minWidth }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect      = triggerRef.current.getBoundingClientRect();
    const dropH     = 380;
    const showAbove = window.innerHeight - rect.bottom < dropH && rect.top > dropH;
    setPos({
      top:  showAbove ? rect.top + window.scrollY - dropH - 4 : rect.bottom + window.scrollY + 4,
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

const dropdownShell = {
  background: DS.white,
  border: `1px solid ${DS.neutral200}`,
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(15,23,42,.15)",
  overflow: "hidden",
};

const DropdownItem = ({ label, isSelected, onClick }) => (
  <div onClick={onClick}
    style={{ padding: "8px 12px", cursor: "pointer", fontSize: 13, fontFamily: DS.ff, transition: "background .1s", color: isSelected ? DS.blue500 : DS.neutral900, background: isSelected ? DS.blue100 : "transparent" }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = DS.neutral100; }}
    onMouseLeave={e => { e.currentTarget.style.background = isSelected ? DS.blue100 : "transparent"; }}>
    {label}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 11. OP PICKER
// ─────────────────────────────────────────────────────────────────────────────

const OpPicker = ({ ops, value, onChange, minWidth = 240 }) => {
  const { open, setOpen, triggerRef, dropdownRef } = usePortalDropdown();
  const selected = ops.find((o) => o.v === value);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button ref={triggerRef} onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 36, minWidth, borderRadius: 4, border: `1px solid ${open ? DS.blue500 : DS.neutral200}`, background: DS.neutral100, cursor: "pointer", fontFamily: DS.ff, fontSize: 13, color: DS.neutral900, transition: "border-color .15s" }}>
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.l ?? "—"}</span>
        <Ico.ChevDown s={12} c={open ? DS.blue500 : DS.neutral500} />
      </button>
      <PortalDropdown triggerRef={triggerRef} open={open} minWidth={minWidth}>
        <div ref={dropdownRef} style={{ ...dropdownShell, minWidth }}>
          {ops.map((op) => (
            <DropdownItem key={op.v} label={op.l} isSelected={op.v === value}
              onClick={() => { onChange(op.v); setOpen(false); }} />
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. VAL INPUT
// ─────────────────────────────────────────────────────────────────────────────

const N_TIMELINE_OPS  = ["last_n_time", "next_n_time", "more_than_n_time_ago", "since_n_time_ago", "in_time", "exactly_n_time_ago"];
const isNTimeline     = (op) => N_TIMELINE_OPS.includes(op);
const isBetween       = (op) => op === "between";
const parseNTimeline  = (val) => { if (!val) return { n: "1", unit: "days" }; const [n, unit] = String(val).split("|"); return { n: n || "1", unit: unit || "days" }; };
const formatNTimeline = (n, unit) => `${n}|${unit}`;
const parseBetween    = (val) => { if (!val) return { a: "", b: "" }; const [a, b] = String(val).split("|"); return { a: a || "", b: b || "" }; };
const formatBetween   = (a, b) => `${a}|${b}`;

const ValInput = ({ field, value, op, onChange }) => {
  const { open, setOpen, triggerRef, dropdownRef }                            = usePortalDropdown();
  const { open: uOpen, setOpen: setUOpen, triggerRef: uRef, dropdownRef: uDropRef } = usePortalDropdown();
  const [focused,  setFocused]  = useState(false);
  const [focusedB, setFocusedB] = useState(false);
  const UNITS    = [{ v: "days", l: "days" }, { v: "months", l: "months" }, { v: "years", l: "years" }];
  const inputBase = { height: 36, padding: "0 12px", borderRadius: 4, background: DS.neutral100, fontFamily: DS.ff, fontSize: 13, color: DS.neutral900, outline: "none", transition: "border-color .15s" };

  if (isNTimeline(op)) {
    const { n, unit } = parseNTimeline(value);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <input type="number" min="1" value={n}
          onChange={e => onChange(formatNTimeline(e.target.value, unit))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...inputBase, minWidth: 80, width: 80, border: `1px solid ${focused ? DS.blue500 : DS.neutral200}`, background: DS.white }} />
        <div style={{ position: "relative" }}>
          <button ref={uRef} onClick={() => setUOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 6, ...inputBase, minWidth: 130, border: `1px solid ${uOpen ? DS.blue500 : DS.neutral200}`, cursor: "pointer" }}>
            <span style={{ flex: 1, textAlign: "left" }}>{UNITS.find(u => u.v === unit)?.l ?? "days"}</span>
            <Ico.ChevDown s={12} c={uOpen ? DS.blue500 : DS.neutral500} />
          </button>
          <PortalDropdown triggerRef={uRef} open={uOpen} minWidth={120}>
            <div ref={uDropRef} style={{ ...dropdownShell, minWidth: 120 }}>
              {UNITS.map(u => (
                <DropdownItem key={u.v} label={u.l} isSelected={u.v === unit}
                  onClick={() => { onChange(formatNTimeline(n, u.v)); setUOpen(false); }} />
              ))}
            </div>
          </PortalDropdown>
        </div>
      </div>
    );
  }

  if (isBetween(op)) {
    const { a, b } = parseBetween(value);
    const isDate = field.type === "date";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <input type={isDate ? "date" : "number"} value={a}
          onChange={e => onChange(formatBetween(e.target.value, b))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={isDate ? "" : "Min"}
          style={{ ...inputBase, minWidth: isDate ? 170 : 120, width: isDate ? 170 : 120, border: `1px solid ${focused ? DS.blue500 : DS.neutral200}`, background: DS.white }} />
        <span style={{ fontSize: 12, color: DS.neutral500, fontFamily: DS.ff, flexShrink: 0 }}>and</span>
        <input type={isDate ? "date" : "number"} value={b}
          onChange={e => onChange(formatBetween(a, e.target.value))}
          onFocus={() => setFocusedB(true)} onBlur={() => setFocusedB(false)}
          placeholder={isDate ? "" : "Max"}
          style={{ ...inputBase, minWidth: isDate ? 170 : 120, width: isDate ? 170 : 120, border: `1px solid ${focusedB ? DS.blue500 : DS.neutral200}`, background: DS.white }} />
      </div>
    );
  }

  if (field.type === "enum") {
    return (
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button ref={triggerRef} onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...inputBase, minWidth: 240, border: `1px solid ${open ? DS.blue500 : DS.neutral200}`, color: value ? DS.neutral900 : DS.neutral500, cursor: "pointer" }}>
          <span style={{ flex: 1, textAlign: "left" }}>{value || "Choose…"}</span>
          <Ico.ChevDown s={12} c={open ? DS.blue500 : DS.neutral500} />
        </button>
        <PortalDropdown triggerRef={triggerRef} open={open} minWidth={220}>
          <div ref={dropdownRef} style={{ ...dropdownShell, minWidth: 220 }}>
            {field.choices.map(c => (
              <DropdownItem key={c} label={c} isSelected={c === value}
                onClick={() => { onChange(c); setOpen(false); }} />
            ))}
          </div>
        </PortalDropdown>
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase, minWidth: 180, border: `1px solid ${focused ? DS.blue500 : DS.neutral200}`, background: DS.white }} />
    );
  }

  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={field.type === "number" ? "0" : "Value…"}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputBase, minWidth: 240, border: `1px solid ${focused ? DS.blue500 : DS.neutral200}`, background: DS.white }} />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. FIELD PICKER DROPDOWN (shared by FilterRow and ContextualFieldPicker)
// Single consistent UI: no search bar, neutral100 hover, blue100 when active.
// ─────────────────────────────────────────────────────────────────────────────

const FieldPickerDropdown = ({ objId, fields, selectedFieldId, onSelect, dropdownRef }) => {
  const obj       = getObj(objId);
  const typeLabel = { string: "Aa", number: "#", enum: "≡", date: "cal" };
  return (
    <div ref={dropdownRef}
      style={{ ...dropdownShell, width: 240, maxHeight: 320, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "7px 12px 6px", borderBottom: `1px solid ${DS.neutral200}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 16, height: 16, borderRadius: 3, background: obj.bg, border: `1px solid ${obj.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ObjIcon id={obj.id} s={10} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: obj.color, textTransform: "uppercase", letterSpacing: ".07em", fontFamily: DS.ff }}>
          {obj.label}
        </span>
      </div>
      {/* Field list */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {fields.map(f => {
          const isSel = selectedFieldId === f.id;
          return (
            <div key={f.id} onClick={() => onSelect(f)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", cursor: "pointer", background: isSel ? DS.blue100 : "transparent", transition: "background .1s" }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = DS.neutral100; }}
              onMouseLeave={e => { e.currentTarget.style.background = isSel ? DS.blue100 : "transparent"; }}>
              <span style={{ fontSize: 12, fontFamily: DS.ff, color: isSel ? DS.blue500 : DS.neutral900, fontWeight: isSel ? 500 : 400 }}>
                {f.label}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: DS.neutral500, padding: "1px 4px", borderRadius: 3, background: DS.neutral100, fontFamily: DS.ff }}>
                  {typeLabel[f.type] ?? "?"}
                </span>
                {isSel && <Ico.Check s={11} c={DS.blue500} />}
              </div>
            </div>
          );
        })}
        {fields.length === 0 && (
          <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: DS.neutral500, fontFamily: DS.ff }}>
            No fields available
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. ANCHOR ROW
// ─────────────────────────────────────────────────────────────────────────────

const AnchorRow = ({ objId, filter, onPatch, onRemove }) => {
  const anchorDef = OBJECT_ANCHORS[objId];
  const obj       = getObj(objId);
  const { open: levelOpen, setOpen: setLevelOpen, triggerRef: levelRef, dropdownRef: levelDropRef } = usePortalDropdown();
  const { open: scopeOpen, setOpen: setScopeOpen, triggerRef: scopeRef, dropdownRef: scopeDropRef } = usePortalDropdown();
  const { open: opOpen,    setOpen: setOpOpen,    triggerRef: opRef,    dropdownRef: opDropRef    } = usePortalDropdown();
  const [numFocused, setNumFocused] = useState(false);

  if (!anchorDef) return null;

  const currentLevel      = filter.anchorLevel    ?? anchorDef.defaultLevel;
  const currentPolarity   = filter.anchorPolarity ?? "positive";
  const currentScope      = filter.channelScope   ?? "all";
  const isPositive        = currentPolarity === "positive";
  const isConsumptions    = objId === "consumptions";
  const hasMultipleLevels = Object.keys(anchorDef.levels).length > 1;
  const config            = getAnchorConfig(objId, currentLevel, currentPolarity);
  if (!config) return null;

  const selectedOp      = ANCHOR_OPS.find(o => o.v === filter.op) ?? ANCHOR_OPS[0];
  const selectedChannel = CHANNEL_SCOPES.find(s => s.id === currentScope) ?? CHANNEL_SCOPES[0];

  const selectLevelOption = (levelId, polarity) => {
    const target = anchorDef.levels[levelId][polarity];
    onPatch({
      fieldId:        target.fieldId,
      op:             isPositive ? filter.op  : target.op,
      val:            isPositive ? filter.val : target.val,
      anchorLevel:    levelId,
      anchorPolarity: polarity,
    });
    setLevelOpen(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", flexWrap: "wrap" }}>

      {/* Level + polarity pill */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button ref={levelRef} onClick={() => setLevelOpen(o => !o)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", borderRadius: 4, background: obj.bg, border: `1.5px solid ${obj.color}40`, cursor: "pointer", fontFamily: DS.ff, fontSize: 12, fontWeight: 600, color: obj.color, whiteSpace: "nowrap", boxShadow: levelOpen ? `0 0 0 2px ${obj.color}20` : "none", transition: "box-shadow .15s" }}>
          <ObjIcon id={objId} s={12} />
          {config.label}
          <Ico.ChevDown s={11} c={obj.color} />
        </button>
        <PortalDropdown triggerRef={levelRef} open={levelOpen} minWidth={260}>
          <div ref={levelDropRef} style={{ ...dropdownShell, minWidth: 260 }}>
            {Object.entries(anchorDef.levels).map(([levelId, levelDef], li) => (
              <div key={levelId}>
                {li > 0 && <div style={{ height: 1, background: DS.neutral200 }} />}
                {hasMultipleLevels && (
                  <div style={{ padding: "6px 12px 2px", fontSize: 10, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: DS.neutral500, fontFamily: DS.ff }}>
                    {{ purchase: "By purchase", ticket: "By ticket", product: "By product", subscription: "By subscription" }[levelId] ?? levelId}
                  </div>
                )}
                {[["positive", levelDef.positive], ["negative", levelDef.negative]].map(([pol, def]) => {
                  const isActive = currentLevel === levelId && currentPolarity === pol;
                  return (
                    <div key={pol} onClick={() => selectLevelOption(levelId, pol)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", background: isActive ? obj.bg : "transparent", transition: "background .1s" }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = DS.neutral100; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isActive ? obj.bg : "transparent"; }}>
                      {isActive ? <Ico.Check s={11} c={obj.color} /> : <div style={{ width: 11 }} />}
                      <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 12, color: isActive ? obj.color : DS.neutral900, fontWeight: isActive ? 600 : 400 }}>
                        {def.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </PortalDropdown>
      </div>

      {/* Channel scope (consumptions only) */}
      {isConsumptions && (
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button ref={scopeRef} onClick={() => setScopeOpen(o => !o)}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 4, border: `1px solid ${scopeOpen ? DS.blue500 : DS.neutral200}`, background: DS.neutral100, cursor: "pointer", fontFamily: DS.ff, fontSize: 12, color: DS.neutral800, whiteSpace: "nowrap", transition: "border-color .15s" }}>
            {selectedChannel.label}
            <Ico.ChevDown s={11} c={scopeOpen ? DS.blue500 : DS.neutral500} />
          </button>
          <PortalDropdown triggerRef={scopeRef} open={scopeOpen} minWidth={200}>
            <div ref={scopeDropRef} style={{ ...dropdownShell, minWidth: 200 }}>
              {CHANNEL_SCOPES.map(scope => {
                const isSel = scope.id === currentScope;
                return (
                  <div key={scope.id}
                    onClick={() => { onPatch({ channelScope: scope.id }); setScopeOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", background: isSel ? DS.blue100 : "transparent" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = DS.neutral100; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isSel ? DS.blue100 : "transparent"; }}>
                    {isSel ? <Ico.Check s={11} c={DS.blue500} /> : <div style={{ width: 11 }} />}
                    <p style={{ margin: 0, fontFamily: DS.ff, fontSize: 12, color: isSel ? DS.blue500 : DS.neutral900, fontWeight: isSel ? 500 : 400 }}>
                      {scope.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </PortalDropdown>
        </div>
      )}

      {/* Operator + count value (positive polarity only) */}
      {isPositive && (
        <>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button ref={opRef} onClick={() => setOpOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 36, minWidth: 110, borderRadius: 4, border: `1px solid ${opOpen ? DS.blue500 : DS.neutral200}`, background: DS.neutral100, cursor: "pointer", fontFamily: DS.ff, fontSize: 12, color: DS.neutral900, transition: "border-color .15s" }}>
              <span style={{ flex: 1, textAlign: "left" }}>{selectedOp.l}</span>
              <Ico.ChevDown s={11} c={opOpen ? DS.blue500 : DS.neutral500} />
            </button>
            <PortalDropdown triggerRef={opRef} open={opOpen} minWidth={140}>
              <div ref={opDropRef} style={{ ...dropdownShell, minWidth: 140 }}>
                {ANCHOR_OPS.map(op => {
                  const isSel = op.v === filter.op;
                  return (
                    <div key={op.v} onClick={() => { onPatch({ op: op.v }); setOpOpen(false); }}
                      style={{ padding: "8px 12px", cursor: "pointer", background: isSel ? DS.blue100 : "transparent", fontFamily: DS.ff, fontSize: 12, color: isSel ? DS.blue500 : DS.neutral900 }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = DS.neutral100; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSel ? DS.blue100 : "transparent"; }}>
                      {op.l}
                    </div>
                  );
                })}
              </div>
            </PortalDropdown>
          </div>
          <input type="number" min="0" value={filter.val}
            onChange={e => onPatch({ val: e.target.value })}
            onFocus={() => setNumFocused(true)} onBlur={() => setNumFocused(false)}
            style={{ height: 36, padding: "0 10px", borderRadius: 4, width: 72, border: `1px solid ${numFocused ? DS.blue500 : DS.neutral200}`, background: DS.white, fontFamily: DS.ff, fontSize: 13, color: DS.neutral900, outline: "none", transition: "border-color .15s" }} />
        </>
      )}

      <IconBtn type="Tertiary" size="sm" icon={<Ico.Cross s={16} c={DS.neutral500} />} onClick={onRemove} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. FILTER ROW — uses shared FieldPickerDropdown
// ─────────────────────────────────────────────────────────────────────────────

const FilterRow = ({ filter, onPatch, onRemove, anchorLevel, channelScope }) => {
  const availableFields = getRefinementFields(filter.objId, anchorLevel, channelScope);
  const field           = availableFields.find(f => f.id === filter.fieldId) ?? availableFields[0] ?? getField(filter.objId, filter.fieldId);
  const ops             = getOps(filter.objId, filter.fieldId);
  const isNoVal         = noValue(filter.op);

  const { open: fpOpen, setOpen: setFpOpen, triggerRef: fpRef, dropdownRef: fpDropRef } = usePortalDropdown();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
      {/* Field trigger */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button ref={fpRef} onClick={() => setFpOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "space-between", padding: "0 12px", height: 36, minWidth: 200, borderRadius: 4, border: `1px solid ${fpOpen ? DS.blue500 : DS.neutral200}`, background: DS.neutral100, cursor: "pointer", fontFamily: DS.ff, fontSize: 12, color: DS.neutral800, fontWeight: 500, whiteSpace: "nowrap", transition: "border-color .15s" }}>
          <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{field.label}</span>
          <Ico.ChevDown s={11} c={fpOpen ? DS.blue500 : DS.neutral500} />
        </button>
        <PortalDropdown triggerRef={fpRef} open={fpOpen} minWidth={240}>
          <FieldPickerDropdown
            objId={filter.objId}
            fields={availableFields}
            selectedFieldId={filter.fieldId}
            dropdownRef={fpDropRef}
            onSelect={(f) => {
              const newOps = getOps(filter.objId, f.id);
              onPatch({ fieldId: f.id, op: newOps[0].v, val: "" });
              setFpOpen(false);
            }}
          />
        </PortalDropdown>
      </div>

      <OpPicker ops={ops} value={filter.op} onChange={(op) => onPatch({ op, val: "" })} />

      {isNoVal
        ? <div style={{ height: 36, minWidth: 80, padding: "0 12px", borderRadius: 4, border: `1px dashed ${DS.neutral200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>—</div>
        : <ValInput field={field} value={filter.val} op={filter.op} onChange={(val) => onPatch({ val })} />
      }

      <IconBtn type="Tertiary" size="sm" icon={<Ico.Cross s={16} c={DS.neutral500} />} onClick={onRemove} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 16. CONTEXTUAL FIELD PICKER — uses shared FieldPickerDropdown
// ─────────────────────────────────────────────────────────────────────────────

const ContextualFieldPicker = ({ objId, onAdd, anchorLevel, channelScope = "all" }) => {
  const { open, setOpen, triggerRef, dropdownRef } = usePortalDropdown();
  const obj    = getObj(objId);
  const fields = getRefinementFields(objId, anchorLevel, channelScope);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button ref={triggerRef} onClick={() => setOpen((o) => !o)}
        onMouseEnter={e => { e.currentTarget.style.background = obj.bg; e.currentTarget.style.borderColor = `${obj.color}60`; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${obj.color}30`; }}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px", borderRadius: 4, border: `1px solid ${obj.color}30`, background: "transparent", cursor: "pointer", fontFamily: DS.ff, fontSize: 11, color: obj.color, fontWeight: 500, transition: "all .12s" }}>
        <Ico.Plus s={10} c={obj.color} />
        Refine {obj.label.toLowerCase()}
      </button>
      <PortalDropdown triggerRef={triggerRef} open={open} minWidth={240}>
        <FieldPickerDropdown
          objId={objId}
          fields={fields}
          selectedFieldId={null}
          dropdownRef={dropdownRef}
          onSelect={(f) => {
            const ops = getOps(objId, f.id);
            onAdd({ id: uid(), objId, fieldId: f.id, op: ops[0].v, val: "", isAnchor: false });
            setOpen(false);
          }}
        />
      </PortalDropdown>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 17. FILTER BLOCK
// ─────────────────────────────────────────────────────────────────────────────

const groupFiltersByObj = (filters) => {
  const groups = [];
  filters.forEach((f) => {
    const last = groups[groups.length - 1];
    if (!f.isAnchor && last && last.objId === f.objId) { last.filters.push(f); }
    else { groups.push({ objId: f.objId, filters: [f] }); }
  });
  return groups;
};

const FilterBlock = ({ block, idx, topLogic, onTopLogicChange, onPatchBlock, onRemoveBlock, onOpenFilterModal, onAddBlock, isLastBlock }) => {
  const patchFilter  = (fid, patch) => onPatchBlock({ filters: block.filters.map((f) => f.id === fid ? { ...f, ...patch } : f) });
  const removeFilter = (fid)        => onPatchBlock({ filters: block.filters.filter((f) => f.id !== fid) });

  const addToGroup = (objId, newFilter) => {
    onPatchBlock((prev) => {
      const filters = [...(prev?.filters ?? block.filters)];
      let lastIdx = -1;
      filters.forEach((f, i) => { if (f.objId === objId && !f.isAnchor) lastIdx = i; });
      if (lastIdx === -1) filters.forEach((f, i) => { if (f.objId === objId) lastIdx = i; });
      filters.splice(lastIdx + 1, 0, newFilter);
      return { filters };
    });
  };

  const groups = groupFiltersByObj(block.filters);

  return (
    <div>
      {idx > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 8px 4px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", height: 26, borderRadius: 4, border: `1px solid ${DS.neutral200}`, background: DS.neutral100, overflow: "hidden", flexShrink: 0 }}>
            {["AND", "OR"].map(opt => {
              const active = topLogic === opt;
              return (
                <button key={opt} onClick={() => onTopLogicChange(opt)}
                  style={{ padding: "0 10px", height: "100%", border: "none", background: active ? DS.blue500 : "transparent", color: active ? DS.white : DS.neutral500, fontSize: 10, fontWeight: 700, fontFamily: DS.ff, cursor: "pointer", letterSpacing: ".06em", transition: "all .15s" }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: 11, color: DS.neutral500, fontFamily: DS.ff }}>between groups</span>
        </div>
      )}

      <div style={{ border: `1px solid ${DS.neutral200}`, borderRadius: 8, background: DS.white }}>
        {/* Group header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderBottom: block.filters.length > 0 ? `1px solid ${DS.neutral200}` : "none" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.blue500, fontFamily: DS.ff, letterSpacing: ".04em" }}>
            GROUP {idx + 1}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <IconBtn size="sm" type="Tertiary" icon={<Ico.Cross s={16} c={DS.neutral500} />} onClick={onRemoveBlock} />
          </div>
        </div>

        {/* Empty state */}
        {block.filters.length === 0 && (
          <div style={{ padding: "20px 16px", textAlign: "center" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: DS.neutral500, fontFamily: DS.ff }}>
              No filters yet — choose an object and use case to get started.
            </p>
            <Btn size="sm" type="Secondary" label="Add a filter" iconLeft={<Ico.Plus s={12} c={DS.blue500} />} onClick={() => onOpenFilterModal(block.id)} />
          </div>
        )}

        {/* Filter groups */}
        {block.filters.length > 0 && (
          <div style={{ padding: "16px" }}>
            {groups.map((group, gi) => {
              const obj             = getObj(group.objId);
              const isContact       = group.objId === "contact";
              const hasAnchor       = !!OBJECT_ANCHORS[group.objId];
              const anchorFilter    = group.filters.find(f => f.isAnchor);
              const refinements     = group.filters.filter(f => !f.isAnchor);
              const filtersToRender = isContact ? group.filters : refinements;
              const anchorLevel     = anchorFilter?.anchorLevel  ?? OBJECT_ANCHORS[group.objId]?.defaultLevel;
              const channelScope    = anchorFilter?.channelScope ?? "all";

              return (
                <div key={anchorFilter ? anchorFilter.id : group.objId + gi}>
                  {gi > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
                      <div style={{ width: 14, height: 1, background: DS.neutral200 }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: DS.neutral500, fontFamily: DS.ff, letterSpacing: ".08em", padding: "2px 8px", borderRadius: 4, border: `1px solid ${DS.neutral200}`, background: DS.neutral100 }}>AND</span>
                    </div>
                  )}

                  <div style={{ borderLeft: `3px solid ${obj.color}35`, paddingLeft: 12 }}>
                    {/* Anchor */}
                    {!isContact && hasAnchor && anchorFilter && (
                      <AnchorRow
                        objId={group.objId} filter={anchorFilter}
                        onPatch={(patch) => patchFilter(anchorFilter.id, patch)}
                        onRemove={() => removeFilter(anchorFilter.id)}
                      />
                    )}

                    {/* Refinements */}
                    {filtersToRender.length > 0 && (
                      <div style={{ marginLeft: (!isContact && hasAnchor) ? 16 : 0, marginTop: (!isContact && hasAnchor) ? 4 : 0, borderLeft: (!isContact && hasAnchor) ? `1.5px solid ${obj.color}25` : "none", paddingLeft: (!isContact && hasAnchor) ? 12 : 0 }}>
                        {filtersToRender.map((filter, fi) => (
                          <div key={filter.id}>
                            {fi > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 16px" }}>
                                <div style={{ width: 10, height: 1, background: DS.neutral200 }} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: DS.neutral500, fontFamily: DS.ff, letterSpacing: ".08em", padding: "1px 6px", borderRadius: 4, border: `1px solid ${DS.neutral200}`, background: DS.neutral100 }}>AND</span>
                              </div>
                            )}
                            <FilterRow
                              filter={filter} anchorLevel={anchorLevel} channelScope={channelScope}
                              onPatch={(patch) => patchFilter(filter.id, patch)}
                              onRemove={() => removeFilter(filter.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Refine button */}
                    <div style={{ marginTop: 6, marginLeft: (!isContact && hasAnchor) ? (filtersToRender.length > 0 ? 28 : 0) : 0 }}>
                      <ContextualFieldPicker
                        objId={group.objId} anchorLevel={anchorLevel} channelScope={channelScope}
                        onAdd={(newFilter) => addToGroup(group.objId, newFilter)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${DS.neutral200}` }}>
              <Btn size="sm" type="Tertiary" iconLeft={<Ico.Plus s={11} c={DS.blue500} />} onClick={() => onOpenFilterModal(block.id)}>Add a filter</Btn>
            </div>
          </div>
        )}
      </div>

      {isLastBlock && (
        <div style={{ marginTop: 10, paddingLeft: 2 }}>
          <Btn size="sm" type="Tertiary" iconLeft={<Ico.Plus s={11} c={DS.blue500} />} onClick={onAddBlock}>Add a group of filters</Btn>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 18. TABLE
// ─────────────────────────────────────────────────────────────────────────────

// Master column catalogue — the customizer & views reference these by key.
const ALL_COLUMNS = [
  { key: "lastName",         label: "Last name"         },
  { key: "firstName",        label: "First name"        },
  { key: "email",            label: "Email"             },
  { key: "age",              label: "Age",              align: "right" },
  { key: "structure",        label: "Structure"         },
  { key: "postalCode",       label: "Postal code"       },
  { key: "country",          label: "Country"           },
  { key: "phone",            label: "Phone"             },
  { key: "gender",           label: "Gender"            },
  { key: "loyalty",          label: "Loyalty"           },
  { key: "totalSpending",    label: "Total spending",   align: "right" },
  { key: "acquisitionSource",label: "Acquisition source"},
];

const DEFAULT_COLUMN_KEYS = ["lastName", "firstName", "email", "age", "structure", "postalCode", "country"];

// A column config is an ordered list of { key, visible } covering every column.
const DEFAULT_COLUMN_CONFIG = ALL_COLUMNS.map((c) => ({ key: c.key, visible: DEFAULT_COLUMN_KEYS.includes(c.key) }));

// Resolve a config into the ordered, visible column definitions the table renders.
const resolveColumns = (config) =>
  (config ?? DEFAULT_COLUMN_CONFIG)
    .filter((c) => c.visible)
    .map((c) => ALL_COLUMNS.find((a) => a.key === c.key))
    .filter(Boolean);

const ContactsTable = ({ data, columns = ALL_COLUMNS, selected, onToggle, onToggleAll, onContactClick, sortKey, sortDir, onSort }) => {
  const COLUMNS = columns;
  const allSelected  = data.length > 0 && data.every((c) => selected.has(c.id));
  const someSelected = data.some((c) => selected.has(c.id)) && !allSelected;
  const LINE      = "#EEF0F3";   // cool light hairline
  const HEAD_BG   = "#FAFBFD";   // subtle header wash
  const CELL_TEXT = "#374151";   // body cell text
  return (
    <div style={{ width: "100%", overflow: "auto", border: `1px solid ${LINE}`, borderBottom: "none", borderRadius: "10px 10px 0 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: DS.ff }}>
        <thead>
          <tr style={{ background: HEAD_BG }}>
            <th style={{ width: 52, padding: "0 16px", height: 44, borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
              <div onClick={onToggleAll}
                style={{ width: 18, height: 18, borderRadius: 5, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${allSelected || someSelected ? DS.blue500 : "#CBD5E1"}`, background: allSelected ? DS.blue500 : DS.white }}>
                {allSelected  && <Ico.Check s={11} c={DS.white} />}
                {someSelected && <div style={{ width: 9, height: 2, background: DS.blue500, borderRadius: 1 }} />}
              </div>
            </th>
            {COLUMNS.map((col) => (
              <SortHeader key={col.key} label={col.label} active={sortKey === col.key} dir={sortDir}
                onClick={() => onSort(col.key)} align={col.align} />
            ))}
            <th style={{ width: 72, padding: "0 16px", height: 44, borderBottom: `1px solid ${LINE}` }} />
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 2} style={{ padding: 40, textAlign: "center", fontSize: 13, color: DS.neutral500, fontFamily: DS.ff }}>
                No contacts match this segmentation
              </td>
            </tr>
          ) : data.map((contact, i) => {
            const isSel   = selected.has(contact.id);
            const rowBase = isSel ? DS.blue100 : i % 2 === 0 ? DS.white : "#FCFCFF";
            return (
              <tr key={contact.id} style={{ background: rowBase, transition: "background .12s" }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F7F9FC"; }}
                onMouseLeave={e => { e.currentTarget.style.background = rowBase; }}>
                <td style={{ padding: "0 16px", height: 52, borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
                  <div onClick={() => onToggle(contact.id)}
                    style={{ width: 18, height: 18, borderRadius: 5, margin: "0 auto", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${isSel ? DS.blue500 : "#CBD5E1"}`, background: isSel ? DS.blue500 : DS.white }}>
                    {isSel && <Ico.Check s={11} c={DS.white} />}
                  </div>
                </td>
                {COLUMNS.map((col, ci) => (
                  <td key={col.key} style={{ padding: "0 16px", height: 52, borderBottom: `1px solid ${LINE}`, fontSize: 13, fontWeight: ci === 0 ? 700 : 400, lineHeight: "18px", textAlign: col.align ?? "left", color: ci === 0 ? DS.navy : CELL_TEXT, whiteSpace: "nowrap" }}>
                    {contact[col.key] ?? "—"}
                  </td>
                ))}
                <td style={{ padding: "0 16px", height: 52, borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconBtn type="Secondary" size="sm" icon={<Ico.Eye s={14} c={DS.blue500} />} onClick={() => onContactClick(contact)} title="View profile" />
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
// 19. TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────

const OptionsMenu = ({ disabled = false, selected = new Set() }) => {
  const [open,              setOpen]              = useState(false);
  const [addOpen,           setAddOpen]           = useState(false);
  const [removeOpen,        setRemoveOpen]        = useState(false);
  const [consentAddOpen,    setConsentAddOpen]    = useState(false);
  const [consentRemoveOpen, setConsentRemoveOpen] = useState(false);
  const [deleteOpen,        setDeleteOpen]        = useState(false);

  const STATIC_LISTS = [
    { id: 1,  name: "VIP Subscribers",    count: 1240 },
    { id: 2,  name: "Newsletter — April", count: 8300 },
    { id: 3,  name: "VIP Subscribers",    count: 1240 },
    { id: 4,  name: "Newsletter — April", count: 8300 },
    { id: 5,  name: "VIP Subscribers",    count: 1240 },
    { id: 6,  name: "Newsletter — April", count: 8300 },
    { id: 7,  name: "VIP Subscribers",    count: 1240 },
    { id: 8,  name: "Newsletter — April", count: 8300 },
    { id: 9,  name: "VIP Subscribers",    count: 1240 },
    { id: 10, name: "Newsletter — April", count: 8300 },
  ];

  const STATIC_CONSENTS = [
    { id: "nl-public", name: "Newsletter Public",       count: 18420 },
    { id: "nl-vip",    name: "Newsletter VIP & Loges",  count: 1284  },
    { id: "activites", name: "Activités partenaires",   count: 6890  },
    { id: "sms-promo", name: "SMS Promotions",          count: 9210  },
    { id: "wa-billet", name: "WhatsApp Billetterie",    count: 540   },
    { id: "analytics", name: "Analytics & tracking",    count: 120   },
  ];

  const handleModal = (item) => {
    if (item.label === "Add to a list")              { setAddOpen(true);           setOpen(false); }
    else if (item.label === "Remove from a list")    { setRemoveOpen(true);        setOpen(false); }
    else if (item.label === "Add to a consent")      { setConsentAddOpen(true);    setOpen(false); }
    else if (item.label === "Remove from a consent") { setConsentRemoveOpen(true); setOpen(false); }
    else if (item.label === "Delete contacts")       { setDeleteOpen(true);        setOpen(false); }
    else                                             { setOpen(false); }
  };

  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const items = [
    { icon: <Ico.Download     s={16} />, label: "Export contacts"            },
    { icon: <Ico.Merge        s={16} />, label: "Merge contact records"      },
    { icon: <Ico.UserPlus     s={16} />, label: "Add to a list"              },
    { icon: <Ico.UserPlus     s={16} />, label: "Add to a consent"           },
    { icon: <Ico.UserMinus    s={16} />, label: "Remove from a list"         },
    { icon: <Ico.UserMinus    s={16} />, label: "Remove from a consent"      },
    { icon: <Ico.Trash        s={16} />, label: "Delete contacts"            },
    { icon: <Ico.Organization s={16} />, label: "Associate with a structure" },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Btn onClick={() => { if (!disabled) setOpen(o => !o); }} disabled={disabled} type="Secondary" iconLeft={<Ico.Dots />}>Options</Btn>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 9999, background: DS.white, border: `1px solid ${DS.blue500}`, borderRadius: 4, padding: 5, display: "flex", flexDirection: "column", minWidth: 240 }}>
          {items.map((item, i) => (
            <div key={i} onClick={() => handleModal(item)}
              style={{ display: "flex", alignItems: "center", gap: 15, padding: "0 10px", height: 32, borderRadius: 4, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.blue100; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              {item.icon}
              <span style={{ fontSize: 12, fontWeight: 400, lineHeight: "20px", fontFamily: DS.ff, color: DS.neutral900, whiteSpace: "nowrap" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
      <ListActionModal mode="add"    open={addOpen}    lists={STATIC_LISTS} selectedContactIds={[...selected]} onClose={() => setAddOpen(false)}    onConfirm={() => {}} />
      <ListActionModal mode="remove" open={removeOpen} lists={STATIC_LISTS} selectedContactIds={[...selected]} onClose={() => setRemoveOpen(false)} onConfirm={() => {}} />
      <ConsentActionModal mode="add"    open={consentAddOpen}    consents={STATIC_CONSENTS} selectedContactIds={[...selected]} onClose={() => setConsentAddOpen(false)}    onConfirm={() => {}} />
      <ConsentActionModal mode="remove" open={consentRemoveOpen} consents={STATIC_CONSENTS} selectedContactIds={[...selected]} onClose={() => setConsentRemoveOpen(false)} onConfirm={() => {}} />
      <DeleteContactsModal open={deleteOpen} count={selected.size} onClose={() => setDeleteOpen(false)} onConfirm={() => {}} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 20. CREATE CONTACT SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const CreateContactSidebar = ({ open, onClose }) => {
  const INITIAL = { email: "", nom: "", prenom: "", dateNaissance: "", telephone: "", adresse: "", codePostal: "", pays: "" };
  const [form,     setForm]     = useState(INITIAL);
  const [sections, setSections] = useState({ infos: true, coords: true, listes: false, consentements: false });
  const patch  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k)    => setSections(s => ({ ...s, [k]: !s[k] }));

  if (!open) return null;

  const SH = ({ label, sKey }) => (
    <div onClick={() => toggle(sKey)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, cursor: "pointer" }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: DS.blue600, fontFamily: DS.ff }}>{label}</span>
      {sections[sKey] ? <Ico.ChevDown s={16} c={DS.blue600} /> : <Ico.ChevRight s={16} c={DS.blue600} />}
    </div>
  );

  const F = ({ label, fKey, type = "text" }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      <span style={{ fontSize: 14, color: DS.neutral500, fontFamily: DS.ff }}>{label}</span>
      <input type={type} value={form[fKey]} onChange={(e) => patch(fKey, e.target.value)}
        style={{ height: 40, padding: "4px 12px", borderRadius: 4, width: "100%", boxSizing: "border-box", border: `1px solid ${DS.neutral200}`, background: DS.neutral100, fontFamily: DS.ff, fontSize: 14, color: DS.neutral900, outline: "none" }}
        onFocus={e => e.target.style.borderColor = DS.blue500}
        onBlur={e  => e.target.style.borderColor = DS.neutral200} />
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: DS.white, zIndex: 1001, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(15,23,42,.15)" }}>
        <div style={{ background: DS.brandGradientH, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: DS.white, fontFamily: DS.ff }}>Create a contact</span>
          <IconBtn type="Tertiary" size="sm" icon={<Ico.Cross s={16} c={DS.white} />} onClick={onClose} style={{ borderColor: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
          <SH label="Information"  sKey="infos"        />
          {sections.infos   && <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 10px" }}><F label="Email" fKey="email" type="email" /><F label="Last name" fKey="nom" /><F label="First name" fKey="prenom" /><F label="Date of birth" fKey="dateNaissance" type="date" /></div>}
          <SH label="Coordinates" sKey="coords"        />
          {sections.coords  && <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 10px" }}><F label="Phone" fKey="telephone" type="tel" /><F label="Address" fKey="adresse" /><F label="Postal code" fKey="codePostal" /><F label="Country" fKey="pays" /></div>}
          <SH label="Lists"       sKey="listes"        />
          <SH label="Consents"    sKey="consentements" />
        </div>
        <div style={{ padding: "16px 24px", display: "flex", flexShrink: 0, alignItems: "center", justifyContent: "center", gap: 12, borderTop: `1px solid ${DS.neutral200}` }}>
          <Btn type="Tertiary" onClick={() => { setForm(INITIAL); onClose(); }}>Cancel</Btn>
          <Btn type="Primary" onClick={onClose}>Save</Btn>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 21. VIEWS — a view = a saved { filters + column layout + sort }
// ─────────────────────────────────────────────────────────────────────────────

const clone  = (x) => JSON.parse(JSON.stringify(x));
const idless = (k, v) => (k === "id" ? undefined : v);
const segSig = (seg) => JSON.stringify(seg ?? makeSeg(), idless);

// Serialize a view config for dirty detection (ignore volatile block/filter ids).
const configSignature = (cfg) =>
  JSON.stringify({ seg: segSig(cfg.segment), sortKey: cfg.sortKey, sortDir: cfg.sortDir, columns: cfg.columns });

const segHasFilters = (seg) => (seg?.blocks ?? []).some((b) => b.filters?.length);

// Turn a single filter condition into a readable label, e.g. "Age at least 18".
const opLabel = (objId, fieldId, op) => {
  const field = getField(objId, fieldId);
  const list = OPS[field.type] ?? OPS.string;
  return (list.find((o) => o.v === op) || ANCHOR_OPS.find((o) => o.v === op) || { l: op }).l;
};
const describeFilter = (f) => {
  if (f.isAnchor) {
    const lbl = OBJECT_ANCHORS[f.objId]?.levels?.[f.anchorLevel]?.[f.anchorPolarity]?.label;
    if (lbl) return lbl;
  }
  const field = getField(f.objId, f.fieldId);
  const ol = opLabel(f.objId, f.fieldId, f.op);
  if (noValue(f.op)) return `${field.label} ${ol}`;
  const val = Array.isArray(f.val) ? f.val.join(", ") : (f.val ?? "");
  return `${field.label} ${ol}${val !== "" ? ` ${val}` : ""}`.trim();
};
const describeSeg = (seg) => (seg?.blocks ?? []).flatMap((b) => (b.filters ?? []).map(describeFilter));

// Human-readable, per-facet diff between the live config and the saved view.
const diffConfig = (cur, saved) => {
  const changes = [];
  if (segSig(cur.segment) !== segSig(saved.segment)) {
    const curF = describeSeg(cur.segment);
    const savF = describeSeg(saved.segment);
    savF.filter((d) => !curF.includes(d)).forEach((d) => changes.push({ facet: "filters", label: d, kind: "remove" }));
    curF.filter((d) => !savF.includes(d)).forEach((d) => changes.push({ facet: "filters", label: d, kind: "add" }));
  }
  if (JSON.stringify(cur.columns) !== JSON.stringify(saved.columns)) {
    const visNow   = cur.columns.filter((c) => c.visible).map((c) => c.key);
    const visSaved = saved.columns.filter((c) => c.visible).map((c) => c.key);
    const label = JSON.stringify(visNow) !== JSON.stringify(visSaved)
      ? `${visNow.length} column${visNow.length !== 1 ? "s" : ""} shown`
      : "columns reordered";
    changes.push({ facet: "columns", label });
  }
  if (cur.sortKey !== saved.sortKey || cur.sortDir !== saved.sortDir) changes.push({ facet: "sort", label: "sort changed" });
  return changes;
};

const INITIAL_VIEWS = [
  {
    id: "all", name: "All contacts", standard: true,
    config: { segment: makeSeg(), sortKey: "lastName", sortDir: "asc", columns: DEFAULT_COLUMN_CONFIG },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 22. PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactsPage({ selectedContact, setSelectedContact }) {
  const navigate = useNavigate();

  const [builderOpen, setBuilderOpen] = useState(false);
  const [segment,     setSegment]     = useState(makeSeg);
  const [applied,     setApplied]     = useState(null);
  const isDirty = JSON.stringify(segment) !== JSON.stringify(applied ?? makeSeg());

  const [filterModalOpen,          setFilterModalOpen]          = useState(false);
  const [filterModalTargetBlockId, setFilterModalTargetBlockId] = useState(null);

  const { topLogic, blocks } = segment;
  const setTopLogic = (l)    => setSegment((s) => ({ ...s, topLogic: l }));
  const setBlocks   = (fn)   => setSegment((s) => ({ ...s, blocks: fn(s.blocks) }));
  const removeBlock = (id)   => setBlocks((bs) => bs.filter((b) => b.id !== id));
  const patchBlock  = (id, p) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, ...(typeof p === "function" ? p(b) : p) } : b));

  const handleApply  = () => { setApplied(JSON.parse(JSON.stringify(segment))); setSelected(new Set()); setPage(1); };
  const handleCancel = () => { setSegment(applied ? JSON.parse(JSON.stringify(applied)) : makeSeg()); setBuilderOpen(false); };

  const openFilterModal = (blockId) => { setFilterModalTargetBlockId(blockId); setFilterModalOpen(true); };

  const handleFilterModalSelect = (uc) => {
    const rawFilters = uc.filters
      ? uc.filters.map(f => ({ id: uid(), ...f }))
      : (() => {
          const anchorFilter = makeDefaultAnchorFilter(uc.filter?.objId, uid);
          if (anchorFilter) return [anchorFilter];
          return [{ id: uid(), ...uc.filter, isAnchor: false }];
        })();
    setBlocks((bs) => bs.map((b) => b.id === filterModalTargetBlockId ? { ...b, filters: [...b.filters, ...rawFilters] } : b));
  };

  const [search,   setSearch]   = useState("");
  const [showAnonymized, setShowAnonymized] = useState(true);
  const [sortKey,  setSortKey]  = useState("lastName");
  const [sortDir,  setSortDir]  = useState("asc");
  const [selected, setSelected] = useState(new Set());
  const [page,     setPage]     = useState(1);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);

  // ── Views & columns ────────────────────────────────────────────────────────
  const [views,        setViews]        = useState(INITIAL_VIEWS);
  const [activeViewId, setActiveViewId] = useState("all");
  const [columns,      setColumns]      = useState(() => clone(DEFAULT_COLUMN_CONFIG));
  const [viewModal,    setViewModal]    = useState(null); // null | { mode: "create" | "rename", id? }

  const currentConfig = { segment: applied ?? makeSeg(), sortKey, sortDir, columns };
  const activeView    = views.find((v) => v.id === activeViewId);
  const viewDirty     = activeView ? configSignature(currentConfig) !== configSignature(activeView.config) : false;
  const viewChanges   = activeView && viewDirty ? diffConfig(currentConfig, activeView.config) : [];

  // Summary of the live configuration (for the view-name hover card).
  const filterDescs = describeSeg(currentConfig.segment);
  const nCols       = columns.filter((c) => c.visible).length;
  const sortLabel   = ALL_COLUMNS.find((c) => c.key === sortKey)?.label ?? sortKey;
  const viewSetup   = [
    ...(filterDescs.length
      ? filterDescs.map((d) => ({ facet: "filters", label: d }))
      : [{ facet: "filters", label: "No filters", muted: true }]),
    { facet: "columns", label: `${nCols} column${nCols !== 1 ? "s" : ""} shown` },
    { facet: "sort",    label: `Sorted by ${sortLabel} (${sortDir === "asc" ? "A→Z" : "Z→A"})` },
  ];

  const applyView = (id) => {
    const v = views.find((x) => x.id === id);
    if (!v) return;
    const c = v.config;
    setSegment(clone(c.segment));
    setApplied(segHasFilters(c.segment) ? clone(c.segment) : null);
    setSortKey(c.sortKey);
    setSortDir(c.sortDir);
    setColumns(clone(c.columns));
    setActiveViewId(id);
    setBuilderOpen(segHasFilters(c.segment)); // show the view's filters when it has any
    setSelected(new Set());
    setPage(1);
  };

  const createView = (name) => {
    const id = "view-" + uid();
    setViews((vs) => [...vs, { id, name, standard: false, config: clone(currentConfig) }]);
    setActiveViewId(id);
  };
  const saveViewChanges = () => setViews((vs) => vs.map((v) => (v.id === activeViewId ? { ...v, config: clone(currentConfig) } : v)));
  const revertView      = () => { if (activeView) applyView(activeView.id); };
  const renameView      = (id, name) => setViews((vs) => vs.map((v) => (v.id === id ? { ...v, name } : v)));
  const deleteView      = (id) => { setViews((vs) => vs.filter((v) => v.id !== id)); if (activeViewId === id) applyView("all"); };

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = evalSeg(CONTACTS, applied).filter((c) => {
    if (!showAnonymized && c.anonymized) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.firstName ?? "").toLowerCase().includes(q)
        || (c.lastName  ?? "").toLowerCase().includes(q)
        || (c.email     ?? "").toLowerCase().includes(q)
        || (c.structure ?? "").toLowerCase().includes(q);
  });

  const sorted     = [...filtered].sort((a, b) => {
    const d  = sortDir === "asc" ? 1 : -1;
    const av = String(a[sortKey] ?? "").toLowerCase();
    const bv = String(b[sortKey] ?? "").toLowerCase();
    return av < bv ? -d : av > bv ? d : 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData   = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleOne = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    const ids    = pageData.map(c => c.id);
    const allSel = ids.every(id => selected.has(id));
    setSelected(s => { const n = new Set(s); ids.forEach(id => allSel ? n.delete(id) : n.add(id)); return n; });
  };

  const handleContactClick = (c) => { setSelectedContact(c._fullData ?? c); navigate(`/contacts/${c.id}`); };

  const startSegmentation = () => {
    // Editing a view that already has filters → open the builder on those filters
    // (don't wipe them). Otherwise start a fresh filter block.
    if (segHasFilters(applied)) {
      setSegment(clone(applied));
      setBuilderOpen(true);
      return;
    }
    const emptyBlock = makeBlock();
    setBlocks(() => [emptyBlock]);
    setBuilderOpen(true);
    openFilterModal(emptyBlock.id);
  };

  return (
    <div style={{ fontFamily: DS.ff, minHeight: "100%", display: "flex", flexDirection: "column" }}>

      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>

        {/* Page header — transparent, aligned with content */}
        <PageHeader
          title="Contacts"
          description="Browse, segment and manage every contact in your CRM"
          actions={<>
            <Btn type="Primary" iconLeft={<Ico.Filter s={16} c={DS.white} />} disabled={builderOpen} onClick={startSegmentation}>{segHasFilters(applied) ? "Edit filters" : "Start segmentation"}</Btn>
            <Btn type="Secondary" iconLeft={<Ico.Plus c={DS.blue500} />} onClick={() => setShowCreateSidebar(true)}>Add a contact</Btn>
          </>}
        />

        {/* Views tab bar */}
        <div style={{ margin: "8px 32px 0" }}>
          <ViewsBar
            views={views}
            activeViewId={activeViewId}
            dirty={viewDirty}
            changes={viewChanges}
            setup={viewSetup}
            onSelect={applyView}
            onCreate={() => setViewModal({ mode: "create" })}
            onRevert={revertView}
            onSaveChanges={saveViewChanges}
            onSaveAsNew={() => setViewModal({ mode: "create" })}
            onRename={(id) => setViewModal({ mode: "rename", id })}
            onDelete={deleteView}
          />
        </div>

        {/* Segment builder */}
        {builderOpen && (
          <div style={{ margin: "16px 32px 0", backgroundColor: DS.white, border: `1px solid ${DS.neutral200}`, borderRadius: 8, overflow: "visible" }}>
            <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
              {blocks.map((block, i) => (
                <FilterBlock
                  key={block.id} block={block} idx={i}
                  topLogic={topLogic} onTopLogicChange={setTopLogic}
                  onPatchBlock={(p) => patchBlock(block.id, p)}
                  onRemoveBlock={() => removeBlock(block.id)}
                  onOpenFilterModal={openFilterModal}
                  isLastBlock={i === blocks.length - 1}
                  isOnlyBlock={blocks.length === 1}
                  onAddBlock={() => { const b = makeBlock(); setBlocks((bs) => [...bs, b]); openFilterModal(b.id); }}
                />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 32px", borderTop: `0.5px solid ${DS.neutral200}`, background: DS.neutral100, gap: 8, borderRadius: "0 0 8px 8px" }}>
              <Btn type="Primary" iconLeft={<Ico.List c={DS.white} />} onClick={() => setCreateListOpen(true)}>Create a list</Btn>
              <div style={{ flex: 1 }} />
              <Btn type="Tertiary"  disabled={!isDirty} onClick={handleCancel}>Cancel</Btn>
              <Btn type="Secondary" disabled={!isDirty} onClick={handleApply}>Save</Btn>
            </div>
          </div>
        )}

        {/* Result bar */}
        {(builderOpen || applied) && (
          <div style={{ margin: "10px 32px 0", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: DS.neutral900, fontFamily: DS.ff }}>
              <strong style={{ color: DS.blue500 }}>{sorted.length}</strong> contact{sorted.length !== 1 ? "s" : ""}
            </span>
            {applied           && <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: DS.green100, color: DS.success, fontSize: 11, fontWeight: 500 }}>Segmented</span>}
            {selected.size > 0 && <span style={{ padding: "2px 8px", borderRadius: 999, backgroundColor: DS.blue200,    color: DS.blue500,   fontSize: 11, fontWeight: 500 }}>{selected.size} selected</span>}
          </div>
        )}

        {/* Add filter modal */}
        <AddFilterModal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} onSelect={handleFilterModalSelect} />

        {/* Table toolbar */}
        <div style={{ margin: "12px 32px 0" }}>
          <div style={{ padding: "10px 0", display: "flex", alignItems: "center", borderBottom: `1px solid #EEF0F3`, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ColumnCustomizer config={columns} allColumns={ALL_COLUMNS} defaultConfig={DEFAULT_COLUMN_CONFIG} onChange={setColumns} />
              <Toggle
                on={showAnonymized}
                onChange={setShowAnonymized}
                label={<span style={{ fontSize: 12, color: DS.neutral700, fontFamily: DS.ff, whiteSpace: "nowrap" }}>Show anonymized contacts</span>}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <OptionsMenu disabled={selected.size === 0} selected={selected} />
              <SearchField value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Quick search…" style={{ width: 220 }} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginInline: 32 }}>
          <ContactsTable data={pageData} columns={resolveColumns(columns)} selected={selected} onToggle={toggleOne} onToggleAll={toggleAll} onContactClick={handleContactClick} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        </div>

        {/* Pagination */}
        <div style={{ marginInline: 32, marginBottom: 24, backgroundColor: DS.white, border: `1px solid #EEF0F3`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
          <Pagination page={page - 1} pages={totalPages} setPage={(p) => setPage(p + 1)} total={sorted.length} pageSize={PAGE_SIZE} />
        </div>

      </div>

      <CreateContactSidebar open={showCreateSidebar} onClose={() => setShowCreateSidebar(false)} />

      <CreateListModal
        open={createListOpen}
        onClose={() => setCreateListOpen(false)}
        contactCount={sorted.length}
        segment={applied ?? segment}
        onCreated={(list) => console.log("Created list (simulated):", list)}
      />


      <ViewModal
        key={viewModal ? viewModal.mode + (viewModal.id ?? "") : "closed"}
        open={!!viewModal}
        mode={viewModal?.mode ?? "create"}
        initialName={viewModal?.mode === "rename" ? (views.find((v) => v.id === viewModal.id)?.name ?? "") : ""}
        onClose={() => setViewModal(null)}
        onSubmit={(name) => { if (viewModal?.mode === "rename") renameView(viewModal.id, name); else createView(name); }}
      />
    </div>
  );
}