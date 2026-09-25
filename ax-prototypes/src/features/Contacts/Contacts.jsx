import { useState } from "react";
import { useNavigate } from "react-router-dom";
import contactsData from "../../../contacts.json";
import AddFilterModal from "./AddFilterModal";
import ContactFormDrawer from "./ContactFormDrawer";
import { DS, TY } from "../../utils/designSystem";
import Ico from '../../utils/icons';
import { Btn } from '../../components/Btn';
import IconBtn from "../../components/Iconbtn";
import { Toggle } from '../../components/Controls';
import { StatusBadge, Badge } from '../../components/Tag';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import Select from '../../components/Select';
import DATA_OBJECTS from "../../utils/dataObject";
import ListActionModal from "./ListActionModal";
import CreateListModal from "./CreateListModal";
import DeleteContactsModal from "./DeleteContactsModal";
import ExportContactsModal from "./ExportContactsModal";
import AssociateStructureModal from "./AssociateStructureModal";
import ConsentActionModal from "./ConsentActionModal";
import ColumnCustomizer from "../../components/ColumnCustomizer";
import ActionMenu from "../../components/ActionMenu";
import ViewsBar from "./ViewsBar";
import ViewModal from "./ViewModal";

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHANNEL SCOPES & FIELD MAPS
// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL_SCOPES = [
  { id: "all", label: "All channels" },
  { id: "ticketing", label: "Ticketing" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "subscriptions", label: "Subscriptions" },
];

const CONSUMPTIONS_CHANNEL_FIELDS = {
  all: [],
  ticketing: [
    { id: "eventName", label: "Event name", type: "string" },
    { id: "representationName", label: "Representation", type: "string" },
    { id: "representationDate", label: "Representation date", type: "date" },
    { id: "season", label: "Season", type: "string" },
    { id: "venue", label: "Venue", type: "string" },
  ],
  ecommerce: [
    { id: "productName", label: "Product name", type: "string" },
    { id: "productCategory", label: "Category", type: "string" },
  ],
  subscriptions: [
    { id: "subscriptionName", label: "Plan name", type: "string" },
    { id: "renewalDate", label: "Renewal date", type: "date" },
  ],
};

const ECOMMERCE_LEVEL_FIELDS = {
  purchase: ["purchaseCount", "purchaseDate", "orderAmount", "supplier"],
  product: ["productCount", "productName", "productCategory", "orderStatus", "unitPrice"],
};

const SUBSCRIPTION_LEVEL_FIELDS = {
  purchase: ["purchaseCount", "purchaseDate"],
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
        positive: { label: "Has made a purchase", fieldId: "purchaseCount", op: "gte", val: "1" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq", val: "0" },
      },
    },
  },
  ticket: {
    defaultLevel: "ticket",
    levels: {
      ticket: {
        positive: { label: "Has bought a ticket", fieldId: "ticketCount", op: "gte", val: "1", refinementLevelKey: "ticket" },
        negative: { label: "Has not bought a ticket", fieldId: "ticketCount", op: "eq", val: "0", refinementLevelKey: "ticket" },
      },
      purchase: {
        positive: { label: "Has made a purchase", fieldId: "purchaseCount", op: "gte", val: "1", refinementLevelKey: "purchase" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq", val: "0", refinementLevelKey: "purchase" },
      },
    },
  },
  order: {
    defaultLevel: "purchase",
    levels: {
      purchase: {
        positive: { label: "Has made a purchase", fieldId: "purchaseCount", op: "gte", val: "1", refinementLevelKey: "purchase" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq", val: "0", refinementLevelKey: "purchase" },
      },
      product: {
        positive: { label: "Has ordered a product", fieldId: "productCount", op: "gte", val: "1", refinementLevelKey: "product" },
        negative: { label: "Has never ordered a product", fieldId: "productCount", op: "eq", val: "0", refinementLevelKey: "product" },
      },
    },
  },
  subscription: {
    defaultLevel: "subscription",
    levels: {
      purchase: {
        positive: { label: "Has made a purchase", fieldId: "purchaseCount", op: "gte", val: "1", refinementLevelKey: "purchase" },
        negative: { label: "Has never made a purchase", fieldId: "purchaseCount", op: "eq", val: "0", refinementLevelKey: "purchase" },
      },
      subscription: {
        positive: { label: "Has a subscription", fieldId: "subscriptionCount", op: "gte", val: "1", refinementLevelKey: "subscription" },
        negative: { label: "Has no subscription", fieldId: "subscriptionCount", op: "eq", val: "0", refinementLevelKey: "subscription" },
      },
    },
  },
  campaign: {
    defaultLevel: "campaign",
    levels: {
      campaign: {
        positive: { label: "Has received a campaign", fieldId: "campaignName", op: "is_set", val: "" },
        negative: { label: "Has not received a campaign", fieldId: "campaignName", op: "is_not_set", val: "" },
      },
    },
  },
  consent: {
    defaultLevel: "consent",
    levels: {
      consent: {
        positive: { label: "Has consented", fieldId: "consentStatus", op: "is", val: "Opt-in" },
        negative: { label: "Has not consented", fieldId: "consentStatus", op: "is", val: "Opt-out" },
      },
    },
  },
  accessControl: {
    defaultLevel: "visit",
    levels: {
      visit: {
        positive: { label: "Has visited an event", fieldId: "numberOfControls", op: "gte", val: "1" },
        negative: { label: "Has not visited an event", fieldId: "numberOfControls", op: "eq", val: "0" },
      },
    },
  },
};

const getAnchorConfig = (objId, level, polarity = "positive") =>
  OBJECT_ANCHORS[objId]?.levels?.[level]?.[polarity] ?? null;

const makeDefaultAnchorFilter = (objId, uidFn) => {
  const anchor = OBJECT_ANCHORS[objId];
  if (!anchor) return null;
  const level = anchor.defaultLevel;
  const config = anchor.levels[level].positive;
  const scope = anchor.defaultChannelScope ?? null;
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
    { v: "is", l: "is on" },
    { v: "is_today", l: "is today" },
    { v: "before", l: "before" },
    { v: "after", l: "after" },
    { v: "between", l: "between" },
    { v: "last_n_time", l: "in the last" },
    { v: "next_n_time", l: "in the next" },
    { v: "more_than_n_time_ago", l: "more than time ago" },
    { v: "exactly_n_time_ago", l: "exactly time ago" },
    { v: "in_time", l: "exactly in" },
    { v: "is_set", l: "is set" },
    { v: "is_not_set", l: "is not set" },
  ],
};

const ANCHOR_OPS = [
  { v: "eq", l: "exactly" }, { v: "gte", l: "at least" }, { v: "gt", l: "more than" },
  { v: "lt", l: "less than" }, { v: "lte", l: "at most" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

let _uid = 1;
const uid = () => String(_uid++);
const noValue = (op) => ["is_set", "is_not_set", "is_today", "is_tomorrow", "was_yesterday", "is_this_week", "is_this_month"].includes(op);
const getObj = (id) => DATA_OBJECTS.find((o) => o.id === id) ?? DATA_OBJECTS[0];
const getField = (objId, fId) => { const o = getObj(objId); return o.fields.find((f) => f.id === fId) ?? o.fields[0]; };
const getOps = (objId, fId) => OPS[getField(objId, fId).type] ?? OPS.string;
const makeBlock = () => ({ id: uid(), logic: "AND", filters: [] });
const makeSeg = () => ({ topLogic: "AND", blocks: [] });

// ─────────────────────────────────────────────────────────────────────────────
// 6. EVALUATOR
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
    const n = parseFloat(val), r = parseFloat(raw);
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. OBJ ICON
// ─────────────────────────────────────────────────────────────────────────────

const ObjIcon = ({ id, s = 13 }) => {
  const obj = getObj(id);
  const p = { s, c: obj.text };
  const map = {
    contact: <Ico.User          {...p} />,
    consumptions: <Ico.Card          {...p} />,
    ticket: <Ico.Ticket        {...p} />,
    order: <Ico.Cart          {...p} />,
    subscription: <Ico.Subscriptions {...p} />,
    campaign: <Ico.Mail          {...p} />,
    consent: <Ico.Eye           {...p} />,
    accessControl: <Ico.AccessControl {...p} />,
  };
  return map[id] ?? <Ico.User {...p} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. HOOKS
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 9. PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 10. PORTAL DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────


// Matches the shared Select's panel: surfaceCanvas · borderDefault · radiusLg ·
// shadowSm, with 4px padding so MenuItem rows keep their radius clear of the edge.


// ─────────────────────────────────────────────────────────────────────────────
// 11. OP PICKER
// ─────────────────────────────────────────────────────────────────────────────

// Operator picker — the shared DS Select. `portal` because it opens inside the
// scrolling segment builder and would otherwise clip.
const OpPicker = ({ ops, value, onChange, minWidth = 240 }) => (
  <Select
    portal
    minWidth={minWidth}
    width={minWidth}
    value={value}
    onChange={onChange}
    placeholder="—"
    options={ops.map((o) => ({ value: o.v, label: o.l }))}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// 12. VAL INPUT
// ─────────────────────────────────────────────────────────────────────────────

const N_TIMELINE_OPS = ["last_n_time", "next_n_time", "more_than_n_time_ago", "since_n_time_ago", "in_time", "exactly_n_time_ago"];
const isNTimeline = (op) => N_TIMELINE_OPS.includes(op);
const isBetween = (op) => op === "between";
const parseNTimeline = (val) => { if (!val) return { n: "1", unit: "days" }; const [n, unit] = String(val).split("|"); return { n: n || "1", unit: unit || "days" }; };
const formatNTimeline = (n, unit) => `${n}|${unit}`;
const parseBetween = (val) => { if (!val) return { a: "", b: "" }; const [a, b] = String(val).split("|"); return { a: a || "", b: b || "" }; };
const formatBetween = (a, b) => `${a}|${b}`;

const ValInput = ({ field, value, op, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [focusedB, setFocusedB] = useState(false);
  const UNITS = [{ v: "days", l: "days" }, { v: "months", l: "months" }, { v: "years", l: "years" }];
  const inputBase = { height: 36, padding: "0 12px", borderRadius: DS.radiusLg, background: DS.surfaceSubtle, fontFamily: DS.ff, fontSize: 13, color: DS.textStrong, outline: "none", transition: "border-color .15s" };

  if (isNTimeline(op)) {
    const { n, unit } = parseNTimeline(value);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <input type="number" min="1" value={n}
          onChange={e => onChange(formatNTimeline(e.target.value, unit))}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...inputBase, minWidth: 80, width: 80, border: `1px solid ${focused ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas }} />
        <Select
          portal
          minWidth={130}
          width={130}
          value={unit || "days"}
          options={UNITS.map(u => ({ value: u.v, label: u.l }))}
          onChange={(v) => onChange(formatNTimeline(n, v))}
        />
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
          style={{ ...inputBase, minWidth: isDate ? 170 : 120, width: isDate ? 170 : 120, border: `1px solid ${focused ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas }} />
        <span style={{ fontSize: 12, color: DS.textMuted, fontFamily: DS.ff, flexShrink: 0 }}>and</span>
        <input type={isDate ? "date" : "number"} value={b}
          onChange={e => onChange(formatBetween(a, e.target.value))}
          onFocus={() => setFocusedB(true)} onBlur={() => setFocusedB(false)}
          placeholder={isDate ? "" : "Max"}
          style={{ ...inputBase, minWidth: isDate ? 170 : 120, width: isDate ? 170 : 120, border: `1px solid ${focusedB ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas }} />
      </div>
    );
  }

  if (field.type === "enum") {
    return (
      <Select
        portal
        minWidth={240}
        width={240}
        value={value || null}
        placeholder="Choose…"
        options={field.choices.map(c => ({ value: c, label: c }))}
        onChange={onChange}
      />
    );
  }

  if (field.type === "date") {
    return (
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputBase, minWidth: 180, border: `1px solid ${focused ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas }} />
    );
  }

  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      placeholder={field.type === "number" ? "0" : "Value…"}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{ ...inputBase, minWidth: 240, border: `1px solid ${focused ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas }} />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. FIELD PICKER DROPDOWN (shared by FilterRow and ContextualFieldPicker)
// Single consistent UI: no search bar, neutral100 hover, blue100 when active.
// ─────────────────────────────────────────────────────────────────────────────

// Type glyph shown as the trailing `meta` pill on each field option.
const TYPE_GLYPH = { string: "Aa", number: "#", enum: "≡", date: "cal" };
const fieldOptions = (fields) =>
  fields.map((f) => ({ value: f.id, label: f.label, meta: TYPE_GLYPH[f.type] ?? "?" }));

// The object badge used as the Select panel's MenuSection label. The icon and
// per-object accent are data-driven (DATA_OBJECTS), so they aren't DS tokens.
const ObjHeaderLabel = ({ objId }) => {
  const obj = getObj(objId);
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: DS.radiusSm, background: obj.surface, border: `1px solid ${obj.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ObjIcon id={obj.id} s={10} />
      </span>
      <span style={{ ...TY.labelMd, color: obj.text, fontFamily: DS.ff }}>{obj.label}</span>
    </span>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// 14. ANCHOR ROW
// ─────────────────────────────────────────────────────────────────────────────

const AnchorRow = ({ objId, filter, onPatch, onRemove }) => {
  const anchorDef = OBJECT_ANCHORS[objId];
  const obj = getObj(objId);
  const [numFocused, setNumFocused] = useState(false);

  if (!anchorDef) return null;

  const currentLevel = filter.anchorLevel ?? anchorDef.defaultLevel;
  const currentPolarity = filter.anchorPolarity ?? "positive";
  const currentScope = filter.channelScope ?? "all";
  const isPositive = currentPolarity === "positive";
  const isConsumptions = objId === "consumptions";
  const hasMultipleLevels = Object.keys(anchorDef.levels).length > 1;
  const config = getAnchorConfig(objId, currentLevel, currentPolarity);
  if (!config) return null;


  const selectLevelOption = (levelId, polarity) => {
    const target = anchorDef.levels[levelId][polarity];
    onPatch({
      fieldId: target.fieldId,
      op: isPositive ? filter.op : target.op,
      val: isPositive ? filter.val : target.val,
      anchorLevel: levelId,
      anchorPolarity: polarity,
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", flexWrap: "wrap" }}>

      {/* Level + polarity — grouped DS Select. Options are "<levelId>|<polarity>";
          each level becomes a MenuSection group when there's more than one. */}
      <Select
        portal
        minWidth={260}
        value={`${currentLevel}|${currentPolarity}`}
        options={Object.entries(anchorDef.levels).flatMap(([levelId, levelDef]) =>
          [["positive", levelDef.positive], ["negative", levelDef.negative]].map(([pol, def]) => ({
            value: `${levelId}|${pol}`,
            label: def.label,
            group: hasMultipleLevels
              ? ({ purchase: "By purchase", ticket: "By ticket", product: "By product", subscription: "By subscription" }[levelId] ?? levelId)
              : undefined,
          })),
        )}
        onChange={(v) => { const [levelId, pol] = v.split("|"); selectLevelOption(levelId, pol); }}
        trigger={({ open, toggle }) => (
          <button onClick={toggle}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", boxSizing: "border-box", borderRadius: DS.radiusLg, background: obj.surface, border: `1.5px solid ${obj.border}`, cursor: "pointer", fontFamily: DS.ff, ...TY.labelMd, color: obj.text, whiteSpace: "nowrap", boxShadow: open ? `0 0 0 2px ${obj.border}66` : "none", transition: "box-shadow .15s" }}>
            <ObjIcon id={objId} s={14} />
            {config.label}
            <Ico.ChevDown s={16} c={obj.text} />
          </button>
        )}
      />

      {/* Channel scope (consumptions only) */}
      {isConsumptions && (
        <Select
          portal
          minWidth={200}
          width={200}
          value={currentScope}
          options={CHANNEL_SCOPES.map(s => ({ value: s.id, label: s.label }))}
          onChange={(v) => onPatch({ channelScope: v })}
        />
      )}

      {/* Operator + count value (positive polarity only) */}
      {isPositive && (
        <>
          <Select
            portal
            minWidth={140}
            width={140}
            value={filter.op}
            options={ANCHOR_OPS.map(op => ({ value: op.v, label: op.l }))}
            onChange={(v) => onPatch({ op: v })}
          />
          <input type="number" min="0" value={filter.val}
            onChange={e => onPatch({ val: e.target.value })}
            onFocus={() => setNumFocused(true)} onBlur={() => setNumFocused(false)}
            style={{ height: 36, padding: "0 10px", borderRadius: DS.radiusLg, width: 72, border: `1px solid ${numFocused ? DS.actionPrimary : DS.borderDefault}`, background: DS.surfaceCanvas, fontFamily: DS.ff, fontSize: 13, color: DS.textStrong, outline: "none", transition: "border-color .15s" }} />
        </>
      )}

      <IconBtn type="Tertiary" size="sm" icon={<Ico.Cross s={16} c={DS.textMuted} />} onClick={onRemove} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 15. FILTER ROW — uses shared FieldPickerDropdown
// ─────────────────────────────────────────────────────────────────────────────

const FilterRow = ({ filter, onPatch, onRemove, anchorLevel, channelScope }) => {
  const availableFields = getRefinementFields(filter.objId, anchorLevel, channelScope);
  const field = availableFields.find(f => f.id === filter.fieldId) ?? availableFields[0] ?? getField(filter.objId, filter.fieldId);
  const ops = getOps(filter.objId, filter.fieldId);
  const isNoVal = noValue(filter.op);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0" }}>
      {/* Field picker — shared DS Select (portal: opens inside the scrolling builder) */}
      <Select
        portal
        minWidth={240}
        width={200}
        value={filter.fieldId}
        header={<ObjHeaderLabel objId={filter.objId} />}
        options={fieldOptions(availableFields)}
        onChange={(fid) => {
          const newOps = getOps(filter.objId, fid);
          onPatch({ fieldId: fid, op: newOps[0].v, val: "" });
        }}
      />

      <OpPicker ops={ops} value={filter.op} onChange={(op) => onPatch({ op, val: "" })} />

      {isNoVal
        ? <div style={{ height: 36, minWidth: 80, padding: "0 12px", borderRadius: DS.radiusLg, border: `1px dashed ${DS.borderDefault}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: DS.textMuted, fontFamily: DS.ff }}>—</div>
        : <ValInput field={field} value={filter.val} op={filter.op} onChange={(val) => onPatch({ val })} />
      }

      <IconBtn type="Tertiary" size="sm" icon={<Ico.Cross s={16} c={DS.textMuted} />} onClick={onRemove} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 16. CONTEXTUAL FIELD PICKER — uses shared FieldPickerDropdown
// ─────────────────────────────────────────────────────────────────────────────

const ContextualFieldPicker = ({ objId, onAdd, anchorLevel, channelScope = "all" }) => {
  const obj = getObj(objId);
  const fields = getRefinementFields(objId, anchorLevel, channelScope);

  // Same DS Select panel as every other picker; only the opener differs — this
  // one is an "add" affordance, not a value box, so it uses Select's `trigger`
  // escape hatch (Btn Sm geometry + the per-object accent).
  return (
    <Select
      portal
      minWidth={240}
      value={null}
      header={<ObjHeaderLabel objId={objId} />}
      options={fieldOptions(fields)}
      onChange={(fid) => {
        const ops = getOps(objId, fid);
        onAdd({ id: uid(), objId, fieldId: fid, op: ops[0].v, val: "", isAnchor: false });
      }}
      trigger={({ open, toggle }) => (
        <button onClick={toggle}
          onMouseEnter={e => { e.currentTarget.style.background = obj.surface; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 28, padding: "0 8px", boxSizing: "border-box", borderRadius: DS.radiusLg, border: `1px solid ${obj.border}`, background: open ? obj.surface : "transparent", cursor: "pointer", fontFamily: DS.ff, ...TY.labelMd, color: obj.text, transition: "all .12s", whiteSpace: "nowrap" }}>
          <Ico.Plus s={14} c={obj.text} />
          Refine {obj.label.toLowerCase()}
        </button>
      )}
    />
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

/* The AND marker between filters and between object groups. The mockup draws it
   as a bare grey token — no border, no connector line into it; the indentation
   already says what belongs to what. */
const LOGIC_CHIP = {
  fontSize: 10, fontWeight: 600, letterSpacing: ".08em", fontFamily: DS.ff,
  color: DS.textMuted, background: DS.surfaceSubtle,
  padding: "2px 7px", borderRadius: DS.radiusMd,
};

const FilterBlock = ({ block, idx, topLogic, onTopLogicChange, onPatchBlock, onRemoveBlock, onOpenFilterModal, onAddBlock, isLastBlock }) => {
  const patchFilter = (fid, patch) => onPatchBlock({ filters: block.filters.map((f) => f.id === fid ? { ...f, ...patch } : f) });
  const removeFilter = (fid) => onPatchBlock({ filters: block.filters.filter((f) => f.id !== fid) });

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
          {/* Segmented control: a 2px track holding two pills, each a flex box so
              the label centres on its own metrics. The previous one stretched its
              buttons with height:100% inside a bordered 26px box, which left the
              10px labels sitting off-centre, and its hard blue fill shouted next
              to the quiet AND chips used everywhere else in the builder. */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 2, padding: 2,
            borderRadius: DS.radiusLg, background: DS.surfaceSubtle, flexShrink: 0,
          }}>
            {["AND", "OR"].map(opt => {
              const active = topLogic === opt;
              return (
                <button key={opt} type="button" onClick={() => onTopLogicChange(opt)}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    height: 20, padding: "0 10px", border: "none", borderRadius: DS.radiusMdPlus,
                    background: active ? DS.brandPrimary : "transparent",
                    color: active ? DS.textOnBrand : DS.textMuted,
                    fontSize: 10, fontWeight: 600, letterSpacing: ".08em", fontFamily: DS.ff,
                    cursor: "pointer", transition: `background ${DS.durFast} ${DS.ease}, color ${DS.durFast} ${DS.ease}`,
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>
          <span style={{ ...TY.captionSm, color: DS.textMuted, fontFamily: DS.ff }}>between groups</span>
        </div>
      )}

      {/* The block keeps an outline so several groups stay tellable apart — but
          only the outline: the header rule, the object rails and the dashed rule
          above "Add a filter" are all gone, so the box is the one piece of
          chrome doing that job. */}
      <div style={{ border: `1px solid ${DS.borderDefault}`, borderRadius: DS.radiusLg, padding: "8px 16px 14px" }}>
        {/* Group header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.actionPrimary, fontFamily: DS.ff, letterSpacing: ".04em" }}>
            GROUP {idx + 1}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <IconBtn size="sm" type="Tertiary" icon={<Ico.Cross s={16} c={DS.textMuted} />} onClick={onRemoveBlock} />
          </div>
        </div>

        {/* Empty state */}
        {block.filters.length === 0 && (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: DS.textMuted, fontFamily: DS.ff }}>
              No filters yet — choose an object and use case to get started.
            </p>
            <Btn size="sm" type="Secondary" label="Add a filter" iconLeft={<Ico.Plus s={12} c={DS.actionPrimary} />} onClick={() => onOpenFilterModal(block.id)} />
          </div>
        )}

        {/* Filter groups */}
        {block.filters.length > 0 && (
          <div style={{ padding: "4px 0 0" }}>
            {groups.map((group, gi) => {
              const obj = getObj(group.objId);
              const isContact = group.objId === "contact";
              const hasAnchor = !!OBJECT_ANCHORS[group.objId];
              const anchorFilter = group.filters.find(f => f.isAnchor);
              const refinements = group.filters.filter(f => !f.isAnchor);
              const filtersToRender = isContact ? group.filters : refinements;
              const anchorLevel = anchorFilter?.anchorLevel ?? OBJECT_ANCHORS[group.objId]?.defaultLevel;
              const channelScope = anchorFilter?.channelScope ?? "all";

              return (
                <div key={anchorFilter ? anchorFilter.id : group.objId + gi}>
                  {gi > 0 && (
                    <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                      <span style={LOGIC_CHIP}>AND</span>
                    </div>
                  )}

                  <div>
                    {/* Anchor */}
                    {!isContact && hasAnchor && anchorFilter && (
                      <AnchorRow
                        objId={group.objId} filter={anchorFilter}
                        onPatch={(patch) => patchFilter(anchorFilter.id, patch)}
                        onRemove={() => removeFilter(anchorFilter.id)}
                      />
                    )}

                    {/* Refinements. ONE rail ties them back to their anchor: it
                        runs down the refinements only — the anchor is what it
                        points at, so wrapping the anchor in it too (as the outer
                        rail used to) said the same thing twice. */}
                    {filtersToRender.length > 0 && (
                      <div style={{
                        marginLeft: (!isContact && hasAnchor) ? 8 : 0,
                        marginTop: (!isContact && hasAnchor) ? 2 : 0,
                        borderLeft: (!isContact && hasAnchor) ? `3px solid ${obj.border}` : "none",
                        paddingLeft: (!isContact && hasAnchor) ? 13 : 0,
                      }}>
                        {filtersToRender.map((filter, fi) => (
                          <div key={filter.id}>
                            {fi > 0 && (
                              <div style={{ display: "flex", alignItems: "center", margin: "6px 0" }}>
                                <span style={LOGIC_CHIP}>AND</span>
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
                    <div style={{ marginTop: 4, marginLeft: (!isContact && hasAnchor) ? 24 : 0 }}>
                      <ContextualFieldPicker
                        objId={group.objId} anchorLevel={anchorLevel} channelScope={channelScope}
                        onAdd={(newFilter) => addToGroup(group.objId, newFilter)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 8 }}>
              <Btn size="sm" type="Tertiary" iconLeft={<Ico.Plus s={11} c={DS.actionPrimary} />} onClick={() => onOpenFilterModal(block.id)}>Add a filter</Btn>
            </div>
          </div>
        )}
      </div>

      {isLastBlock && (
        // No rule here: the block's own outline already closes the group, so a
        // separator under it drew the same boundary twice.
        <div style={{ marginTop: 10, paddingLeft: 2 }}>
          <Btn size="sm" type="Tertiary" iconLeft={<Ico.Plus s={11} c={DS.actionPrimary} />} onClick={onAddBlock}>Add a group of filters</Btn>
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
  { key: "lastName", label: "Last name" },
  { key: "firstName", label: "First name" },
  { key: "email", label: "Email" },
  { key: "age", label: "Age", align: "right" },
  { key: "structure", label: "Structure" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "loyalty", label: "Loyalty" },
  { key: "totalSpending", label: "Total spending", align: "right" },
  { key: "acquisitionSource", label: "Acquisition source" },
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

// ─────────────────────────────────────────────────────────────────────────────
// 19. TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────

const STRUCTURES = [...new Set(CONTACTS.map((c) => c.structure).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ id: name, name }));

const OptionsMenu = ({ disabled = false, selected = new Set() }) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [structureOpen, setStructureOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [consentAddOpen, setConsentAddOpen] = useState(false);
  const [consentRemoveOpen, setConsentRemoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const STATIC_LISTS = [
    { id: 1, name: "VIP Subscribers", count: 1240 },
    { id: 2, name: "Newsletter — April", count: 8300 },
    { id: 3, name: "VIP Subscribers", count: 1240 },
    { id: 4, name: "Newsletter — April", count: 8300 },
    { id: 5, name: "VIP Subscribers", count: 1240 },
    { id: 6, name: "Newsletter — April", count: 8300 },
    { id: 7, name: "VIP Subscribers", count: 1240 },
    { id: 8, name: "Newsletter — April", count: 8300 },
    { id: 9, name: "VIP Subscribers", count: 1240 },
    { id: 10, name: "Newsletter — April", count: 8300 },
  ];

  const STATIC_CONSENTS = [
    { id: "nl-public", name: "Newsletter Public", count: 18420 },
    { id: "nl-vip", name: "Newsletter VIP & Loges", count: 1284 },
    { id: "activites", name: "Activités partenaires", count: 6890 },
    { id: "sms-promo", name: "SMS Promotions", count: 9210 },
    { id: "wa-billet", name: "WhatsApp Billetterie", count: 540 },
    { id: "analytics", name: "Analytics & tracking", count: 120 },
  ];

  return (
    <>
      {/* Molecules/MenuItem (554:2953) via the shared ActionMenu — this used to
          be a local dropdown on a 6px radius with a brand-blue outline and 32px
          rows, none of which the DS has. */}
      <ActionMenu
        label="Options"
        size="Md"
        align="left"
        width={260}
        disabled={disabled}
        disabledTooltip="Select at least one contact to use these options"
        items={[
          { label: "Export contacts", icon: <Ico.Download s={16} c={DS.textSecondary} />, onClick: () => setExportOpen(true) },
          { label: "Merge contact records", icon: <Ico.Merge s={16} c={DS.textSecondary} /> },
          { label: "Add to a list", icon: <Ico.UserPlus s={16} c={DS.textSecondary} />, onClick: () => setAddOpen(true) },
          { label: "Add to a consent", icon: <Ico.UserPlus s={16} c={DS.textSecondary} />, onClick: () => setConsentAddOpen(true) },
          { label: "Remove from a list", icon: <Ico.UserMinus s={16} c={DS.textSecondary} />, onClick: () => setRemoveOpen(true) },
          { label: "Remove from a consent", icon: <Ico.UserMinus s={16} c={DS.textSecondary} />, onClick: () => setConsentRemoveOpen(true) },
          { label: "Associate with a structure", icon: <Ico.Organization s={16} c={DS.textSecondary} />, onClick: () => setStructureOpen(true) },
          { label: "Delete contacts", icon: <Ico.Trash s={16} c={DS.actionDanger} />, onClick: () => setDeleteOpen(true), danger: true },
        ]}
      />

      <ListActionModal mode="add" open={addOpen} lists={STATIC_LISTS} selectedContactIds={[...selected]} onClose={() => setAddOpen(false)} onConfirm={() => { }} />
      <ListActionModal mode="remove" open={removeOpen} lists={STATIC_LISTS} selectedContactIds={[...selected]} onClose={() => setRemoveOpen(false)} onConfirm={() => { }} />
      <ConsentActionModal mode="add" open={consentAddOpen} consents={STATIC_CONSENTS} selectedContactIds={[...selected]} onClose={() => setConsentAddOpen(false)} onConfirm={() => { }} />
      <ConsentActionModal mode="remove" open={consentRemoveOpen} consents={STATIC_CONSENTS} selectedContactIds={[...selected]} onClose={() => setConsentRemoveOpen(false)} onConfirm={() => { }} />
      <DeleteContactsModal open={deleteOpen} count={selected.size} onClose={() => setDeleteOpen(false)} onConfirm={() => { }} />
      <ExportContactsModal open={exportOpen} onClose={() => setExportOpen(false)} selectedCount={selected.size} />
      <AssociateStructureModal
        open={structureOpen}
        onClose={() => setStructureOpen(false)}
        structures={STRUCTURES}
        selectedCount={selected.size}
        onConfirm={(st) => console.log("Associated with structure (simulated):", st.name)}
      />
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
    const visNow = cur.columns.filter((c) => c.visible).map((c) => c.key);
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
  const [segment, setSegment] = useState(makeSeg);
  const [applied, setApplied] = useState(null);
  const isDirty = JSON.stringify(segment) !== JSON.stringify(applied ?? makeSeg());

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterModalTargetBlockId, setFilterModalTargetBlockId] = useState(null);

  const { topLogic, blocks } = segment;
  const setTopLogic = (l) => setSegment((s) => ({ ...s, topLogic: l }));
  const setBlocks = (fn) => setSegment((s) => ({ ...s, blocks: fn(s.blocks) }));
  const removeBlock = (id) => setBlocks((bs) => bs.filter((b) => b.id !== id));
  const patchBlock = (id, p) => setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, ...(typeof p === "function" ? p(b) : p) } : b));

  const handleApply = () => { setApplied(JSON.parse(JSON.stringify(segment))); setSelected(new Set()); setPage(1); };
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

  const [search, setSearch] = useState("");
  const [showAnonymized, setShowAnonymized] = useState(true);
  const [sortKey, setSortKey] = useState("lastName");
  const [sortDir, setSortDir] = useState("asc");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [showCreateSidebar, setShowCreateSidebar] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);

  // ── Views & columns ────────────────────────────────────────────────────────
  const [views, setViews] = useState(INITIAL_VIEWS);
  const [activeViewId, setActiveViewId] = useState("all");
  const [columns, setColumns] = useState(() => clone(DEFAULT_COLUMN_CONFIG));
  const [viewModal, setViewModal] = useState(null); // null | { mode: "create" | "rename", id? }

  const currentConfig = { segment: applied ?? makeSeg(), sortKey, sortDir, columns };
  const activeView = views.find((v) => v.id === activeViewId);
  const viewDirty = activeView ? configSignature(currentConfig) !== configSignature(activeView.config) : false;
  const viewChanges = activeView && viewDirty ? diffConfig(currentConfig, activeView.config) : [];

  // Summary of the live configuration (for the view-name hover card).
  const filterDescs = describeSeg(currentConfig.segment);
  const nCols = columns.filter((c) => c.visible).length;
  const sortLabel = ALL_COLUMNS.find((c) => c.key === sortKey)?.label ?? sortKey;
  const viewSetup = [
    ...(filterDescs.length
      ? filterDescs.map((d) => ({ facet: "filters", label: d }))
      : [{ facet: "filters", label: "No filters", muted: true }]),
    { facet: "columns", label: `${nCols} column${nCols !== 1 ? "s" : ""} shown` },
    { facet: "sort", label: `Sorted by ${sortLabel} (${sortDir === "asc" ? "A→Z" : "Z→A"})` },
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
  const revertView = () => { if (activeView) applyView(activeView.id); };
  const renameView = (id, name) => setViews((vs) => vs.map((v) => (v.id === id ? { ...v, name } : v)));
  const deleteView = (id) => { setViews((vs) => vs.filter((v) => v.id !== id)); if (activeViewId === id) applyView("all"); };

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = evalSeg(CONTACTS, applied).filter((c) => {
    if (!showAnonymized && c.anonymized) return false;
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

  // Selection is owned by <Table/> now — it reports the full id array back and
  // this page keeps it as a Set (the rest of the page reads `selected.size`).

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
          // The DS count line, in PageHeader's `meta` slot. CONTACTS, not the
          // filtered set: "in total" means the whole base, so a segmentation
          // must not move this number.
          meta={`${CONTACTS.length.toLocaleString("en-US").replace(/,/g, " ")} contact${CONTACTS.length === 1 ? "" : "s"} in total`}
          actions={<>
            <Btn type="Primary" iconLeft={<Ico.Filter s={16} c={DS.surfaceCanvas} />} disabled={builderOpen} onClick={startSegmentation}>{segHasFilters(applied) ? "Edit filters" : "Start segmentation"}</Btn>
            <Btn type="Secondary" iconLeft={<Ico.Plus c={DS.actionPrimary} />} onClick={() => setShowCreateSidebar(true)}>Add a contact</Btn>
          </>}
        />

        {/* Views tab bar */}
        <div style={{ padding: '24px 0' }}>
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
          <div style={{ backgroundColor: DS.surfaceCanvas, border: `1px solid ${DS.borderDefault}`, borderRadius: 8, overflow: "visible" }}>
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
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
            {/* Footer shares the panel's surfaceCanvas — a subtle fill here read as
                a separate grey band. Separator matches the FilterBlock header rule
                above it: 1px solid borderDefault. */}
            <div style={{ display: "flex", alignItems: "center", padding: "8px 24px 16px", background: DS.surfaceCanvas, gap: 8, borderRadius: "0 0 8px 8px" }}>
              <Btn type="Primary" iconLeft={<Ico.List c={DS.surfaceCanvas} />} onClick={() => setCreateListOpen(true)}>Create a list</Btn>
              <div style={{ flex: 1 }} />
              <Btn type="Tertiary" disabled={!isDirty} onClick={handleCancel}>Cancel</Btn>
              <Btn type="Secondary" disabled={!isDirty} onClick={handleApply}>Search</Btn>
            </div>
          </div>
        )}

        {/* Result bar */}
        {(builderOpen || applied) && (
          <div style={{ margin: "10px 32px 0", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: DS.textStrong, fontFamily: DS.ff }}>
              <strong style={{ color: DS.actionPrimary }}>{sorted.length}</strong> contact{sorted.length !== 1 ? "s" : ""}
            </span>
            {/* DS Atoms/Badge — was hand-rolled at 11px; the atom is labelMd 12/16/500. */}
            {applied && <Badge tone="success">Segmented</Badge>}
            {selected.size > 0 && <Badge>{selected.size} selected</Badge>}
          </div>
        )}

        {/* Add filter modal */}
        <AddFilterModal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} onSelect={handleFilterModalSelect} />

        {/* Table — shared DS component (Figma `Table / Contacts` 2052:38194).
            Toolbar, header, rows and pagination all live inside one shell now;
            the three separately-bordered blocks this replaced were faking it. */}
        <div>
          <Table
            columns={resolveColumns(columns).map((c) => ({
              key: c.key,
              label: c.label,
              type: c.align === "right" ? "number" : "text",
            }))}
            rows={pageData}
            rowId={(c) => c.id}
            cell={(c, key) => c[key] ?? "—"}
            selectable
            selected={[...selected]}
            onSelectedChange={(ids) => setSelected(new Set(ids))}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            actions={(c) => (
              <IconBtn
                type="Secondary"
                size="Small"
                icon={<Ico.Eye s={16} c={DS.actionPrimary} />}
                onClick={() => handleContactClick(c)}
                title="View profile"
              />
            )}
            toolbar={{
              columnConfig: (
                <ColumnCustomizer config={columns} allColumns={ALL_COLUMNS}
                  defaultConfig={DEFAULT_COLUMN_CONFIG} onChange={setColumns} />
              ),
              leftExtra: (
                <Toggle
                  on={showAnonymized}
                  onChange={setShowAnonymized}
                  label={<span style={{ ...TY.labelMd, color: DS.textSecondary, fontFamily: DS.ff, whiteSpace: "nowrap" }}>Show anonymized contacts</span>}
                />
              ),
              options: <OptionsMenu disabled={selected.size === 0} selected={selected} />,
              search,
              onSearchChange: (v) => { setSearch(v); setPage(1); },
            }}
            page={page - 1}
            pages={totalPages}
            setPage={(p) => setPage(p + 1)}
            total={sorted.length}
            pageSize={PAGE_SIZE}
            emptyState={(
              <div style={{ padding: 40, textAlign: "center", ...TY.bodySm, color: DS.textMuted, fontFamily: DS.ff }}>
                No contacts match this segmentation
              </div>
            )}
          />
        </div>

      </div>

      {/* The same form the contact record edits with, in create mode — one set
          of fields and labels for one object, rather than a second hand-rolled
          sidebar that drifts from it. */}
      <ContactFormDrawer
        mode="create"
        open={showCreateSidebar}
        onClose={() => setShowCreateSidebar(false)}
        onSave={() => setShowCreateSidebar(false)}
      />

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