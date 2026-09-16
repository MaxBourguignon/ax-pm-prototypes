/**
 * ContactRecord — /contacts/:id
 *
 * Rebuilt 2026-09 to the Figma design "Fiche contact — Variante 1" (2052:42310)
 * https://www.figma.com/design/nIMtO7v8dDamI8b2vnMcRc/Arenametrix-DS--WIP-?node-id=2065-40250
 *
 * Shape:
 *   Page header    Organisms/PageHeader Type=Contact (2053:449) — the shared
 *                  DS card: surfaceHeader, Avatar 64, status, dot-separated
 *                  details, actions right. (The "Fiche contact" mockup showed a
 *                  flush bespoke band instead; the DS component wins.)
 *   Body           main column (flex) + 280px right rail
 *     main         Metrics (a 2-page KPI Carousel) · Tabs · transactions
 *                  table · notes textarea + events map
 *                  The table's columns are configurable PER TAB (shared
 *                  ColumnCustomizer in the DS TableToolbar slot). Purchase
 *                  history is one row per TICKET; tickets of one booking are
 *                  marked as a group rather than nested under a parent row.
 *     rail         6 collapsible sections, aligned on the DS rail 2052:42366
 *                  (blue section titles, 14/20 boxes); every field is
 *                  label-over-value — see the note on RailRow
 *
 * DS components reused: PageHeader (Type=Contact — which supplies the Avatar,
 *   status and details) · Btn · KpiCard · Badge ·
 *   Table (+ its Cell matrix and PaginationBar) · TextArea.
 *
 * MISSING — rendered as a shared <Placeholder/> box so the gap stays visible
 * (design-prototypes §0.6 — build-vs-placeholder is the PM's call):
 *   · Maps / Full Map — used by this screen but NOT on any DS component page
 * (Molecules/Tab 465:93 and Molecules/CarouselDots 1973:6506 were placeheld here
 * too; `components/Tabs.jsx` and `components/Carousel.jsx` implement them now,
 * so the tab bar and the metrics pager are the real components.)
 * The right-rail accordion has no DS node either, so it is composed here from
 * tokens rather than placeheld — it is layout, not a component.
 *
 * `Kpi.jsx` now implements all three DS KPI Card types, so the two metric slots
 * use the type that matches their data: Donut for the purchase split (total in
 * the centre, spend by category around it, loyalty + recency on the note line)
 * and Progress for campaign engagement (received / opened / clicked rates, all
 * against campaigns sent, plus the muted count row the DS uses for a total).
 */
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import contactsData from "../../../contacts.json";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { Btn } from "../../components/Btn";
import { Badge } from "../../components/Tag";
import { TextArea } from "../../components/Field";
import KpiCard from "../../components/Kpi";
import Table from "../../components/Table";
import Tabs from "../../components/Tabs";
import Carousel from "../../components/Carousel";
import ColumnCustomizer from "../../components/ColumnCustomizer";
import Placeholder from "../../components/Placeholder";
import PageHeader from "../../components/PageHeader";

const PAGE_SIZE = 10;
/* The mock dataset is anchored to a fixed "now" so recency labels stay stable. */
const TODAY = new Date("2026-06-05T00:00:00");
/* The loyalty window. Declared up here with TODAY, not next to the metrics that
   read it: CONSUMPTION_ROWS and CONSUMPTION_BASE below run at module-evaluation
   time, so a later `const` would sit in the temporal dead zone and throw on
   import — which a build cannot catch, because a build never runs the module. */
const LOYALTY_MONTHS = 36;

const formatDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB");
};
/* Date + 24h time, for the campaign timestamps: "15/05/2023 09:24". */
const formatDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};
const formatCurrency = (a, currency = "EUR") =>
  a == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(a);
const formatStatus = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "—");
const pctOf = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
const isCancelled = (status) => String(status).toLowerCase().startsWith("cancel");
/* Status chips were all painted feedbackSuccess, so a cancelled line rendered
   green. Tone follows the value now. */
const statusTone = (status) => {
  const v = String(status).toLowerCase();
  if (v.startsWith("cancel")) return DS.feedbackDanger;
  if (v.startsWith("partly")) return DS.feedbackWarning;
  return DS.feedbackSuccess;
};

/* How long ago, in human terms — used for purchase recency. */
const sinceLabel = (iso) => {
  if (!iso) return "never";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "never";
  const days = Math.max(0, Math.round((TODAY - then) / 86400000));
  if (days < 31) return `${days}d ago`;
  const months = Math.round(days / 30.44);
  return months < 24 ? `${months} mo ago` : `${Math.round(months / 12)} yr ago`;
};

/* ── Purchase metrics ───────────────────────────────────────────────────────
   Spend split by what was bought, plus the two facts the donut's note line
   carries: loyalty (purchases inside the 36-month window) and recency (time
   since the last one). Cancelled tickets count as neither spend nor purchase.
   Tickets group by `type` (Concert, Exposition, …), contributions by `category`
   (Abonnement, Don, …); the long tail past four slices folds into "Other" so the
   legend stays readable. */
function purchaseMetrics(contact) {
  const since = new Date(TODAY);
  since.setMonth(since.getMonth() - LOYALTY_MONTHS);

  const items = [
    ...(contact.tickets || [])
      .filter((t) => !isCancelled(t.status))
      .map((t) => ({ date: t.purchaseDate, label: t.type || "Tickets", amount: t.total ?? 0 })),
    ...(contact.contributions || [])
      .map((c) => ({ date: c.purchaseDate, label: c.category || "Contributions", amount: c.amount ?? 0 })),
  ];

  const total = items.reduce((sum, it) => sum + it.amount, 0);
  const inWindow = items.filter((it) => it.date && new Date(it.date) >= since);
  const lastDate = items.reduce((max, it) => (it.date && (!max || it.date > max) ? it.date : max), null);

  const byLabel = new Map();
  items.forEach((it) => byLabel.set(it.label, (byLabel.get(it.label) ?? 0) + it.amount));
  // A zero-value group (a free ticket, a €0 line) would render a legend row with
  // no arc behind it — drop it rather than show a dot for nothing.
  const ranked = [...byLabel.entries()].map(([label, value]) => ({ label, value }))
    .filter((g) => g.value > 0)
    .sort((a, b) => b.value - a.value);
  const segments = ranked.length > 5
    ? [...ranked.slice(0, 4), { label: "Other", value: ranked.slice(4).reduce((sum, r) => sum + r.value, 0) }]
    : ranked;

  return {
    total, segments, count: items.length, countInWindow: inWindow.length,
    lastDate, currency: contact.stats?.totalSpending?.currency || "EUR",
  };
}

/* ── Baskets ─────────────────────────────────────────────────────────────────
   A basket is one checkout. The Purchase history table is flat (one row per
   ticket) but the metrics still count PURCHASES, not lines — loyalty and average
   basket would both be wrong if a three-item order counted as three. Item lines
   within a basket are unique on event + category + price + status, so identical
   lines merge and their quantities add up.
   Baskets come from `purchaseId`; where the data has none, lines bought on the
   same day are one basket. */
const itemKey = (t) => [t.event, t.category || t.type, t.price, t.status].join("§");

function buildPurchases(tickets = []) {
  const baskets = new Map();
  tickets.forEach((t) => {
    const bid = t.purchaseId || `date-${t.purchaseDate}`;
    if (!baskets.has(bid)) baskets.set(bid, { id: bid, reference: t.purchaseNumber || "—", purchaseDate: t.purchaseDate, lines: new Map() });
    const b = baskets.get(bid);
    const k = itemKey(t);
    const prev = b.lines.get(k);
    if (prev) {
      prev.quantity += t.quantity ?? 0;
      prev.total += t.total ?? 0;
    } else {
      b.lines.set(k, {
        event: t.event, category: t.category || t.type, eventDate: t.eventDate,
        price: t.price ?? 0, status: t.status, quantity: t.quantity ?? 0, total: t.total ?? 0,
      });
    }
  });

  return [...baskets.values()]
    .map((b) => {
      const items = [...b.lines.values()];
      const live = items.filter((i) => !isCancelled(i.status));
      const events = [...new Set(items.map((i) => i.event).filter(Boolean))];
      return {
        id: b.id,
        reference: b.reference,
        purchaseDate: b.purchaseDate,
        items,
        event: events.length === 1 ? events[0] : `${events.length} events`,
        quantity: items.reduce((sum, i) => sum + i.quantity, 0),
        // A cancelled line is not money, so it does not count toward the basket
        // total — a fully cancelled basket totals 0 and carries a Cancelled chip.
        total: live.reduce((sum, i) => sum + i.total, 0),
        status: live.length === 0 ? "Cancelled" : live.length === items.length ? "Sold" : "Partly cancelled",
      };
    })
    .sort((a, b) => String(b.purchaseDate || "").localeCompare(String(a.purchaseDate || "")));
}

/* ── Consumption metrics ─────────────────────────────────────────────────────
   The purchase-behaviour figures a CRM actually reads a contact by. Each one is
   plotted against the WHOLE CONTACT BASE rather than a target: the track runs
   from the base minimum to the base maximum and the fill marks where this
   contact falls. So the bar answers "heavy or light buyer, recent or lapsed,
   compared with everyone else" — a single contact's 49 days means nothing until
   you know the base runs 12 to 900.

   That is the reading of the reference chart ("Données de consommations
   moyennes", min → max base contacts). Six of its nine measures are kept — the
   ones that are not restatements of each other: average price, max price and
   total tickets all fall out of the basket figures already shown.

   Note the bar is positional, NOT a judgement: a long Recency bar means "bought
   longer ago than most", which is bad news, while a long Total spent bar is good
   news. Both are brand/primary — colouring them by sentiment would need a rule
   per metric that the DS does not have. */
const CONSUMPTION_ROWS = [
  { key: "recency", label: "Recency",                            format: (v) => `${Math.round(v)} days` },
  { key: "loyalty", label: `Loyalty (${LOYALTY_MONTHS} mo)`,      format: (v) => `${v} purchase${v === 1 ? "" : "s"}` },
  { key: "total",   label: "Total spent",                        format: (v, cur) => formatCurrency(v, cur) },
  { key: "basket",  label: "Average basket",                     format: (v, cur) => formatCurrency(v, cur) },
];

function consumptionMetrics(contact) {
  const purchases = buildPurchases(contact.tickets || []).filter((p) => p.status !== "Cancelled");
  const since = new Date(TODAY);
  since.setMonth(since.getMonth() - LOYALTY_MONTHS);

  const lines = (contact.tickets || []).filter((t) => !isCancelled(t.status));
  const last = lines.reduce((max, t) => (t.purchaseDate && (!max || t.purchaseDate > max) ? t.purchaseDate : max), null);
  const total = lines.reduce((sum, t) => sum + (t.total ?? 0), 0);
  const n = purchases.length;

  return {
    recency: last ? Math.max(0, (TODAY - new Date(last)) / 86400000) : 0,
    loyalty: purchases.filter((p) => p.purchaseDate && new Date(p.purchaseDate) >= since).length,
    total,
    basket: n > 0 ? total / n : 0,
  };
}

/* The scale behind every track: each metric's min and max across the whole base,
   computed once at module load. */
const CONSUMPTION_BASE = (() => {
  const everyone = (Array.isArray(contactsData) ? contactsData : []).map(consumptionMetrics);
  const range = {};
  CONSUMPTION_ROWS.forEach(({ key }) => {
    const values = everyone.map((m) => m[key]).filter((v) => Number.isFinite(v));
    // The scale runs from the base MINIMUM to the base maximum, as the reference
    // chart does — not from zero, which would flatten the spread between
    // contacts into the bottom of every track.
    range[key] = values.length > 0
      ? { min: Math.min(...values), max: Math.max(...values) }
      : { min: 0, max: 0 };
  });
  return range;
})();

/* Where a value sits between the base min and max. Floored at 2% so the lightest
   contact in the base still shows a mark rather than an empty track. */
function basePct(key, value) {
  const { min, max } = CONSUMPTION_BASE[key] ?? {};
  if (!(max > min)) return 100;
  return Math.max(2, Math.min(100, ((value - min) / (max - min)) * 100));
}

/* The consent action history, grouped per consent. Inside a consent the newest
   action is on top — that row IS the consent's current state, and the rows under
   it are how it got there. Consents themselves are ordered by whichever changed
   most recently, so the one that just moved is the one you see first. */
function buildConsentRows(history = []) {
  const byConsent = new Map();
  history.forEach((a) => {
    const key = a.consent || "—";
    if (!byConsent.has(key)) byConsent.set(key, []);
    byConsent.get(key).push(a);
  });

  return [...byConsent.entries()]
    .map(([consent, actions]) => ({
      consent,
      actions: [...actions].sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    }))
    .sort((a, b) => String(b.actions[0]?.date || "").localeCompare(String(a.actions[0]?.date || "")))
    .flatMap((group) => group.actions)
    .map((a, i) => ({
      id: `k${i}`,
      consent: a.consent || "—",
      _raw: { consent: a.consent || "", date: +new Date(a.date || 0),
              origin: a.origin || "", action: a.action || "" },
      cells: {
        consent: a.consent || "—",
        date: formatDate(a.date),
        origin: a.origin || "—",
        action: {
          label: a.action || "—",
          // Opt-in is the permissive state, opt-out the restrictive one — the
          // pair reads at a glance only if the tones differ.
          tone: String(a.action).toLowerCase().startsWith("opt-in")
            ? DS.feedbackSuccess : DS.feedbackDanger,
        },
      },
    }));
}

/* Where each consent stands right now: the most recent action wins. The rail
   shows the state, the Consents tab shows how it got there. */
function currentConsents(history = []) {
  const latest = new Map();
  history.forEach((a) => {
    const key = a.consent || "—";
    const held = latest.get(key);
    if (!held || String(a.date || "") > String(held.date || "")) latest.set(key, a);
  });
  return [...latest.entries()]
    .map(([label, a]) => ({ label, on: String(a.action).toLowerCase().startsWith("opt-in") }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/* One ticket line per row, newest purchase first. Tickets of the same booking
   stay adjacent, which is what lets the table mark them as one order without a
   parent row: a group is simply a RUN OF CONSECUTIVE ROWS sharing a reference.
   Sort by any other column and the runs break up on their own — the marks
   disappear rather than claiming a grouping that is no longer there. */
function buildTicketRows(tickets = []) {
  return [...(tickets || [])]
    .sort((a, b) => String(b.purchaseDate || "").localeCompare(String(a.purchaseDate || ""))
      || String(a.purchaseId || "").localeCompare(String(b.purchaseId || "")))
    .map((t, i) => ({
      id: `t${i}`,
      // The grouping key is the internal purchase id; the purchase NUMBER is what
      // the table prints. Two lines of one checkout share both.
      purchaseId: t.purchaseId || `date-${t.purchaseDate}`,
      _raw: {
        purchaseDate: +new Date(t.purchaseDate || 0),
        purchaseNumber: t.purchaseNumber || "",
        purchaseId: t.purchaseId || "",
        productType: t.productType || "",
        eventType: t.type || "",
        event: t.event || "",
        performance: +new Date(t.performance || t.eventDate || 0),
        venue: t.venue || "",
        category: t.category || "",
        priceFormula: t.priceFormula || "",
        salesChannel: t.salesChannel || "",
        ticketCount: t.quantity ?? 0,
        unitPrice: t.price ?? 0,
        totalAmount: t.total ?? 0,
        status: t.status || "",
      },
      cells: {
        purchaseDate: formatDate(t.purchaseDate),
        purchaseNumber: t.purchaseNumber || "—",
        purchaseId: t.purchaseId || "—",
        productType: t.productType || "—",
        eventType: t.type || "—",
        event: t.event || "—",
        performance: t.performance ? formatDateTime(t.performance) : formatDate(t.eventDate),
        venue: t.venue || "—",
        category: t.category || "—",
        priceFormula: t.priceFormula || "—",
        salesChannel: t.salesChannel || "—",
        ticketCount: t.quantity ?? "—",
        unitPrice: formatCurrency(t.price),
        totalAmount: formatCurrency(t.total),
        status: { label: formatStatus(t.status), tone: statusTone(t.status) },
      },
    }));
}

/* ── Campaign metrics ───────────────────────────────────────────────────────
   Computed from the campaign rows themselves rather than the pre-baked
   `stats.engagement`, so the card and the Campaigns tab below it never disagree.
   All three rates share `sent` as the denominator, which keeps the bars nested
   (received ≥ opened ≥ clicked) and directly comparable. */
function campaignMetrics(contact) {
  const rows = contact.campaigns || [];
  const sent = rows.filter((c) => c.sentAt).length || rows.length;
  const received = rows.filter((c) => c.receivedAt).length;
  const opened = rows.filter((c) => c.openedAt).length;
  const clicked = rows.filter((c) => c.clickedAt).length;
  return { sent, received, opened, clicked };
}

/* ── Right-rail collapsible section ───────────────────────────────────────────
   Aligned on the DS rail (Design page, node 2052:42366) read with
   get_design_context 2026-09:
     section  px 20 · py 14 · gap 8 · divider 1px border/divider
     header   title Inter SemiBold 14/16 in BRAND/PRIMARY (not text/strong) +
              16px chevron, down when open, rotated -90° when closed
     rows     the DS has two variants — stacked (label over value) and inline
              (label left, value right, used on Segmentation / Membership /
              Metadata) — plus three specials: a "→ role — structure" line in
              brand/primary Medium, an email link in brand/primary with a
              leading icon, and a monospaced id.

   ⚠ DELIBERATE DEVIATION: the inline variant is NOT used here. Every field on
     this record is rendered label-over-value, on the PM's instruction — one
     field format everywhere beats matching the DS's two, because a rail that
     switches alignment halfway down reads as two different lists. The specials
     keep their own treatment; only the alignment is unified.

   ⚠ The rail's row text is Inter Regular 12/15, which is NOT a published style:
     the scale's 12px step (Label/Medium) is Medium 500 at 15/16. Kept local
     rather than added to TY — raise it with the designer if it spreads.
   ⚠ Its LINE HEIGHTS are not uniform either. Same 12px size, three leadings:
     15px on the label/value rows, 14px on the contact lines (email, phone) and
     on the id label, 13px on the monospaced id itself. Reproduced exactly here
     (RAIL_TEXT / RAIL_TIGHT / RAIL_MONO), but it reads as drift rather than
     intent — one leading for one size would be the fix.
   ⚠ The DS node also omits the divider between Personal identity and Contact
     details while every other section has one. Read as a slip, so every section
     here carries the rule.
   ⚠ Tags stay on the shared DS `Badge`. The design's pills are 10px (below the
     11px DS floor) in #16704A / #EEE5FF, neither of which exists in the token
     set — matching them exactly would introduce three off-system values. */
const RAIL_TEXT  = { fontSize: 12, fontWeight: 400, lineHeight: "15px" }; // label/value rows
const RAIL_TIGHT = { fontSize: 12, fontWeight: 400, lineHeight: "14px" }; // contact lines, id label
const RAIL_MONO  = { fontSize: 12, fontWeight: 500, lineHeight: "13px" }; // the id itself

function RailRow({ label, value, values, type }) {
  const labelStyle = { ...RAIL_TEXT, fontFamily: DS.ff, color: DS.textMuted };
  const valueStyle = { ...RAIL_TEXT, fontFamily: DS.ff, color: DS.textStrong };
  const clip = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

  if (type === "role") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={labelStyle}>{label}</span>
        {values.map((v, i) => (
          <span key={i} style={{ ...RAIL_TEXT, fontWeight: 500, fontFamily: DS.ff, color: DS.brandPrimary }}>→ {v}</span>
        ))}
      </div>
    );
  }

  if (type === "link") {
    const line = (
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <Ico.Mail s={12} c={DS.textMuted} />
        <span style={{ ...RAIL_TIGHT, fontFamily: DS.ff, color: DS.brandPrimary, ...clip }}>{value}</span>
      </div>
    );
    if (!label) return line;
    return (
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={labelStyle}>{label}</span>
        {line}
      </div>
    );
  }

  // Label over value — the one field format on this record.
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      <span style={{
        ...(type === "mono" ? { ...RAIL_MONO, fontFamily: DS.ffm, color: DS.textMuted } : valueStyle),
        ...clip,
      }}>
        {value}
      </span>
    </div>
  );
}

/* A list of named states — not a field, so it is the one thing in the rail that
   is not label-over-value: the name reads on the left and its state as a pill on
   the right, which is how a permission list is read. */
function RailStates({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ ...RAIL_TEXT, fontFamily: DS.ff, color: DS.textStrong,
                         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {it.label}
          </span>
          <Badge tone={it.on ? "success" : "danger"}>{it.on ? "Opt-in" : "Opt-out"}</Badge>
        </div>
      ))}
    </div>
  );
}

function RailSection({ title, rows, tags, states, open, onToggle, last }) {
  const shown = (rows || []).filter((r) =>
    r.type === "role" ? r.values?.length > 0 : r.value != null && r.value !== "");

  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${DS.borderDivider}` }}>
      {/* DS section box: one container at px20/py14 with an 8px gap, so the
          header-to-first-row rhythm matches the row-to-row rhythm. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "14px 20px" }}>
        <button
          type="button"
          onClick={onToggle}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8, padding: 0, background: "transparent", border: "none", cursor: "pointer",
            fontFamily: DS.ff, ...TY.bodyMdBold, lineHeight: "16px", color: DS.brandPrimary,
            textAlign: "left",
          }}
        >
          {title}
          <span style={{
            display: "flex", flexShrink: 0,
            transform: open ? "none" : "rotate(-90deg)",
            transition: `transform ${DS.durFast} ${DS.ease}`,
          }}>
            <Ico.ChevDown s={16} c={DS.textStrong} />
          </span>
        </button>

        {open && (
          <>
            {tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {tags.map((t, i) => <Badge key={i}>{t}</Badge>)}
              </div>
            )}
            {states?.length > 0 && <RailStates items={states} />}
            {shown.map((r, i) => <RailRow key={i} {...r} />)}
            {shown.length === 0 && !tags?.length && !states?.length && (
              <span style={{ ...RAIL_TEXT, fontFamily: DS.ff, color: DS.textMuted }}>No data</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ContactRecord({ selectedContact }) {
  const { id } = useParams();
  const contactId = selectedContact?.id || id;

  // Tab switching is inert until Molecules/Tab exists — see the placeholder below.
  const [activeTab, setActiveTab] = useState("tickets");
  const [notes, setNotes] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  /* Column visibility + order, kept PER TAB so each transaction table remembers
     its own setup. Keyed by tab; a tab with no entry yet shows every column. */
  const [columnConfig, setColumnConfig] = useState({});
  const [page, setPage] = useState(0);
  const [openSections, setOpenSections] = useState({
    personal: true, coordinates: true, segmentation: true,
    consents: true, preferences: false, others: false,
  });
  const toggle = (k) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  const contact = useMemo(
    () => (contactId && Array.isArray(contactsData) ? contactsData.find((c) => c.id === contactId) : null),
    [contactId],
  );

  const TABS = useMemo(() => {
    if (!contact) return {};
    return {
      /* One row per TICKET. The basket-level parent row this replaced made the
         column manager ambiguous — half the columns belonged to the order and
         half to the item — so the table is flat again and the booking is shown
         by grouping instead. */
      tickets: {
        label: "Purchase history",
        groupBy: "purchaseId",
        /* Every field the purchase record carries is available here; the ones a
           user reaches for less often ship hidden, so the default table stays
           readable and the column configuration does the rest. */
        columns: [
          { key: "purchaseDate", label: "Purchase date" },
          { key: "purchaseNumber", label: "Purchase number" },
          { key: "purchaseId", label: "Purchase ID", defaultHidden: true },
          { key: "productType", label: "Product type", defaultHidden: true },
          { key: "eventType", label: "Event type", defaultHidden: true },
          { key: "event", label: "Event" },
          { key: "performance", label: "Performance", defaultHidden: true },
          { key: "venue", label: "Venue", defaultHidden: true },
          { key: "category", label: "Category" },
          { key: "priceFormula", label: "Price formula", defaultHidden: true },
          { key: "salesChannel", label: "Sales channel", defaultHidden: true },
          { key: "ticketCount", label: "Tickets", type: "number" },
          { key: "unitPrice", label: "Unit price", type: "number" },
          { key: "totalAmount", label: "Total amount", type: "number" },
          { key: "status", label: "Status", type: "status" },
        ],
        rows: buildTicketRows(contact.tickets),
      },
      campaigns: {
        label: "Campaigns",
        columns: [
          { key: "name", label: "Campaign name" },
          { key: "type", label: "Type" },
          { key: "sendDate", label: "Send date" },
          { key: "received", label: "Received" },
          { key: "opened", label: "Opened" },
          { key: "clicked", label: "Clicked" },
        ],
        /* The data carries sentAt / receivedAt / openedAt / clickedAt; this
           mapping used to read sendDate / received / opened, which do not exist,
           so every row rendered "—" and "No". */
        /* Received / Opened / Clicked carry the moment it happened rather than a
           yes-no: the timestamp answers both questions at once, and an em dash
           reads as "never" without needing a word for it. Sorting is on the
           timestamp, so a column orders by when, with the blanks together. */
        rows: (contact.campaigns || []).map((c, i) => ({
          id: `c${i}`,
          _raw: { name: c.name || "", type: c.type || "", sendDate: +new Date(c.sentAt || 0),
                  received: +new Date(c.receivedAt || 0), opened: +new Date(c.openedAt || 0),
                  clicked: +new Date(c.clickedAt || 0) },
          name: c.name || "—",
          type: c.type || "—",
          sendDate: formatDateTime(c.sentAt),
          received: formatDateTime(c.receivedAt),
          opened: formatDateTime(c.openedAt),
          clicked: formatDateTime(c.clickedAt),
        })),
      },
      /* The consent ACTION HISTORY, not the current state: one row per opt-in or
         opt-out, newest first. What a consent is set to today is the top row for
         that consent; how it got there is everything under it, which is the part
         that matters when someone asks why a contact is being mailed. */
      consents: {
        label: "Consents",
        groupBy: "consent",
        columns: [
          { key: "consent", label: "Consent" },
          { key: "date", label: "Date" },
          { key: "origin", label: "Origin" },
          { key: "action", label: "Action", type: "status" },
        ],
        rows: buildConsentRows(contact.consentHistory),
      },
      access: { label: "Access controls", columns: [{ key: "label", label: "Access" }], rows: [] },
      contributions: {
        label: "Contributions",
        columns: [
          { key: "label", label: "Contribution" },
          { key: "amount", label: "Amount", type: "number" },
        ],
        rows: (contact.contributions || []).map((c, i) => ({
          id: `n${i}`, label: c.label || c.type || "—", amount: formatCurrency(c.amount),
          _raw: { label: c.label || c.type || "", amount: c.amount ?? 0 },
        })),
      },
    };
  }, [contact]);

  if (!contact) {
    return (
      <div style={{
        fontFamily: DS.ff, minHeight: 400, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
      }}>
        <span style={{ ...TY.headlineMd, color: DS.textStrong }}>Contact not found</span>
        <span style={{ ...TY.bodyMd, color: DS.textMuted }}>No contact matches this id.</span>
      </div>
    );
  }

  const ident = contact.identity || {};
  const coords = contact.coordinates || {};
  const purchases = purchaseMetrics(contact);
  const consumption = consumptionMetrics(contact);
  const campaigns = campaignMetrics(contact);
  const name = `${ident.firstName || ""} ${ident.lastName || ""}`.trim() || "Unnamed contact";
  const tab = TABS[activeTab] ?? TABS.tickets;
  const tabKeys = Object.keys(TABS);

  const allColumns = tab.columns ?? [];
  const defaultConfig = allColumns.map((c) => ({ key: c.key, visible: !c.defaultHidden }));
  const config = columnConfig[activeTab] ?? defaultConfig;
  const visibleColumns = config
    .filter((c) => c.visible)
    .map((c) => allColumns.find((col) => col.key === c.key))
    .filter(Boolean);
  const setConfig = (next) => setColumnConfig((s) => ({ ...s, [activeTab]: next }));
  const selectTab = (key) => { setActiveTab(key); setSort({ key: null, dir: "asc" }); setPage(0); };

  // Sort on `_raw` — the displayed values are formatted strings, so sorting
  // those would order dates and currency lexicographically.
  const sortedRows = (() => {
    if (!sort.key) return tab.rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...tab.rows].sort((a, b) => {
      const av = a._raw?.[sort.key] ?? a[sort.key];
      const bv = b._raw?.[sort.key] ?? b[sort.key];
      if (av === bv) return 0;
      return (typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv))) * dir;
    });
  })();

  const pages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  /* A group is a run of consecutive rows sharing the tab's `groupBy` value —
     one booking on Purchase history, one consent on Consents — decided on the
     rows AS DISPLAYED. Re-sorting by any column simply dissolves the groups
     rather than marking a grouping that no longer holds. The run is computed
     over the full sorted list, not the page, so a group split across a page
     break still reads correctly on the second page. */
  const groupBy = tab.groupBy;
  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((r, i) => {
    const absolute = page * PAGE_SIZE + i;
    const previous = sortedRows[absolute - 1];
    return {
      ...r,
      _firstOfGroup: !groupBy || !previous || previous[groupBy] !== r[groupBy],
    };
  });
  const handleSort = (key) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
    setPage(0);
  };

  return (
    /* One page rhythm: 32px gutter (the app-shell standard), 24px top, and a
       single 24px column gap between the header and the body. Previously the
       header wrapper had 0 bottom padding and the body 0 top, so the KPI cards
       butted straight against the header card. */
    <div style={{ fontFamily: DS.ff, display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Page header — shared DS Organisms/PageHeader, Type=Contact (2053:449).
             Replaces the bespoke flush "Identity band" this page first used: the
             two Figma designs disagreed and the DS component is the resolution. */}
      <div>
        <PageHeader
          type="contact"
          title={name}
          avatarName={name}
          status="Active client"
          details={[
            ident.email,
            coords.phone,
            [coords.address, coords.country].filter(Boolean).join(", "),
            ident.dateOfBirth
              ? `Born ${formatDate(ident.dateOfBirth)}${ident.age ? ` (${ident.age})` : ""}`
              : null,
          ]}
          actions={(
            <>
              <Btn type="Secondary">Segment</Btn>
              <Btn type="Primary">Edit contact</Btn>
            </>
          )}
        />
      </div>

      {/* ── Body: main column + 280 rail ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>

        <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Metrics — a Carousel of KPI pages, as the design shows: two cards
              with the DS CarouselDots (1973:6506) beneath. Page 1 uses the two
              KPI Card types that fit this record's data (Molecules/KPI Card
              2006:6803) — spend is a breakdown, so Donut; campaign engagement is
              a set of rates against a total, so Progress. Page 2 carries the
              headline numbers those two don't state outright, as Stat cards. */}
          <Carousel
            label="metrics page"
            pages={[
            <div key="p1" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex" }}>
                <KpiCard
                  type="progress"
                  label="Purchase behaviour"
                  meta="vs. the whole contact base"
                  rows={CONSUMPTION_ROWS.map((r) => ({
                    label: r.label,
                    value: r.format(consumption[r.key], purchases.currency),
                    pct: basePct(r.key, consumption[r.key]),
                  }))}
                />
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex" }}>
                {/* A funnel rather than progress tracks: these four figures are
                    nested (sent ⊇ received ⊇ opened ⊇ clicked), so the drop-off
                    between stages is the story, and equal-length tracks hide it. */}
                <KpiCard
                  type="funnel"
                  label="Campaign engagement"
                  meta={`${pctOf(campaigns.opened, campaigns.sent)}% open · ${pctOf(campaigns.clicked, campaigns.sent)}% click`}
                  stages={[
                    { label: "Sent", value: campaigns.sent },
                    { label: "Received", value: campaigns.received },
                    { label: "Opened", value: campaigns.opened },
                    { label: "Clicked", value: campaigns.clicked },
                  ]}
                />
              </div>
            </div>,
            <div key="p2" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {/* The spend breakdown moved here when page 1 took on the
                  behaviour stats — it answers a different question (where the
                  money went) and was worth keeping. */}
              <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex" }}>
                <KpiCard
                  type="donut"
                  label="Spending by category"
                  total={formatCurrency(purchases.total, purchases.currency)}
                  totalLabel="total"
                  segments={purchases.segments.map((sgm) => ({
                    ...sgm,
                    display: formatCurrency(sgm.value, purchases.currency),
                  }))}
                  note={`${purchases.countInWindow} purchase${purchases.countInWindow === 1 ? "" : "s"} in ${LOYALTY_MONTHS} mo · last ${sinceLabel(purchases.lastDate)}`}
                />
              </div>
              <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex" }}>
                <KpiCard
                  label="Customer since"
                  value={sinceLabel(contact.source?.createdAt)}
                  sub={[formatDate(contact.source?.createdAt), contact.source?.acquisitionSource].filter(Boolean).join(" · ")}
                />
              </div>
            </div>,
          ]}
          />

          {/* Tabs — shared DS Molecules/Tab (465:93). This was a <Placeholder/>
              while the component was missing from the codebase; it exists now. */}
          <Tabs
            value={activeTab}
            onChange={selectTab}
            divider
            tabs={tabKeys.map((key) => ({
              value: key,
              label: TABS[key].label,
              // The DS tab is a fixed 120; these labels are longer, so each tab
              // takes the width its own label needs.
              width: Math.max(120, TABS[key].label.length * 8 + 32),
            }))}
          />

          {/* Orders table — shared DS Table. The design uses a bespoke
              "Row / Table Commandes" symbol (1796:4649); the generic Cell matrix
              covers the same row shape, so this uses Table. */}
          <Table
            columns={visibleColumns}
            rows={pageRows}
            rowId={(r) => r.id}
            cell={(r, key) => (r.cells ? r.cells[key] : r[key])}
            /* Every cell reads the same on every row; the grouping is carried by
               the rule alone — it opens each new group, and rows inside a group
               have none, so one booking (or one consent's history) reads as a
               single block. */
            rowStyle={groupBy ? (r) => (r._firstOfGroup
              ? { borderTop: `1px solid ${DS.borderTableSep}` }
              : null) : undefined}
            toolbar={{
              columnConfig: (
                <ColumnCustomizer
                  label="Configure columns"
                  config={config}
                  allColumns={allColumns}
                  defaultConfig={defaultConfig}
                  onChange={setConfig}
                />
              ),
            }}
            sortKey={sort.key}
            sortDir={sort.dir}
            onSort={handleSort}
            page={page}
            pages={pages}
            setPage={setPage}
            total={sortedRows.length}
            pageSize={PAGE_SIZE}
            emptyState={(
              <div style={{ padding: 40, textAlign: "center", ...TY.bodySm, color: DS.textMuted, fontFamily: DS.ff }}>
                Nothing to show for {tab.label.toLowerCase()}
              </div>
            )}
          />

          {/* Notes + events map */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div style={{ flex: "1 0 0", minWidth: 0 }}>
              <TextArea
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this contact…"
                rows={8}
              />
            </div>
            <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...TY.labelMd, color: DS.textSecondary }}>Events</span>
              <Placeholder name="Maps / Full Map" height={232} note="used by this screen but absent from every DS component page" />
            </div>
          </div>
        </div>

        {/* ── Right rail (2052:42366) — 280 wide ───────────────────────────── */}
        <div style={{
          width: 280, flexShrink: 0, background: DS.surfaceCanvas,
          border: `1px solid ${DS.borderSection}`, borderRadius: DS.radiusXl,
          boxShadow: DS.shadowSm, overflow: "hidden",
        }}>
          <RailSection
            title="Personal information"
            open={openSections.personal}
            onToggle={() => toggle("personal")}
            rows={[
              { label: "Email", type: "link", value: ident.email },
              { label: "First name", value: ident.firstName },
              { label: "Last name", value: ident.lastName },
              // The DS pairs birth date and age on one line: "05/05/1962 (63 ans)".
              { label: "Date of birth", value: ident.dateOfBirth
                ? `${formatDate(ident.dateOfBirth)}${ident.age ? ` (${ident.age})` : ""}` : null },
              { label: "Civility", value: ident.civility },
              { label: "Gender", value: ident.gender },
            ]}
          />
          <RailSection
            title="Coordinates"
            open={openSections.coordinates}
            onToggle={() => toggle("coordinates")}
            rows={[
              { label: "Phone", value: coords.phone },
              { label: "Address", value: coords.address },
              { label: "Postal code", value: coords.postalCode },
              { label: "City", value: coords.city },
              { label: "Country", value: coords.country },
            ]}
          />
          <RailSection
            title="Segmentation"
            open={openSections.segmentation}
            onToggle={() => toggle("segmentation")}
            tags={contact.lists || []}
          />
          <RailSection
            title="Consents"
            open={openSections.consents}
            onToggle={() => toggle("consents")}
            states={currentConsents(contact.consentHistory)}
          />
          <RailSection
            title="Preferences"
            open={openSections.preferences}
            onToggle={() => toggle("preferences")}
            rows={(contact.preferences || []).map((p) => ({ label: p.label, value: p.value }))}
          />
          {/* Everything the four named sections do not claim: the professional
              side of the record plus its provenance. */}
          <RailSection
            title="Others"
            open={openSections.others}
            onToggle={() => toggle("others")}
            last
            rows={[
              { label: "Organisation", value: contact.structure },
              { label: "Role", value: (contact.accessControls || [])[0]?.role },
              {
                label: "Roles & structures",
                type: "role",
                values: (contact.accessControls || []).map((a) => `${a.role} — ${a.structure}`),
              },
              { label: "Created", value: formatDate(contact.source?.createdAt) },
              { label: "Acquisition source", value: contact.source?.acquisitionSource },
              { label: "Contact ID", type: "mono", value: contact.id },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
