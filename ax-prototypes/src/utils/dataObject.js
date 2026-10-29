import {DS, CHIPS} from "./designSystem"

// ─── CHANNEL SCOPES ───────────────────────────────────────────────────────────
// Used by the consumptions anchor to scope metrics to a single channel.
export const CHANNEL_SCOPES = [
  { id: "all",           label: "All channels"  },
  { id: "ticketing",     label: "Ticketing"     },
  { id: "ecommerce",     label: "E-commerce"    },
  { id: "subscriptions", label: "Subscriptions" },
];

// ─── CHANNEL-SPECIFIC EXTRA FIELDS FOR CONSUMPTIONS ──────────────────────────
// Injected into the refinement picker when a channel scope is active.
export const CONSUMPTIONS_CHANNEL_FIELDS = {
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



/* Season of a subscription, from its start date: a season runs August → June,
   so a start in Aug–Dec 2025 or Jan–Jun 2026 is "2025-26". */
export const seasonOf = (iso) => {
  if (!iso) return "";
  const [y, m] = iso.split("-").map(Number);
  const first = m >= 8 ? y : y - 1;
  return `${first}-${String(first + 1).slice(2)}`;
};

/* Package status (spec): cancelled when the order was cancelled or refunded;
   otherwise upcoming / active / expired against the prototype's "today". */
const STATUS_TODAY = "2026-06-05";
const packageStatus = (l) => {
  if (["Cancelled", "Refunded"].includes(l.order_status)) return "Cancelled";
  if (l.subscription_start_date > STATUS_TODAY) return "Upcoming";
  if (l.subscription_end_date < STATUS_TODAY) return "Expired";
  return "Active";
};

// ─── FILTER CATALOGUE (segmentation spec, 2026-10) ────────────────────────────
// Every object below merges the spec's filter list into the filters the
// builder already had: existing ids are KEPT (saved segments and use cases rely
// on them) and relabelled / regrouped to the spec where they match; the spec's
// other filters are added. Per field:
//   group   section heading in the field picker (spec "group")
//   status  spec status — live · spec · proposed · to_add · shared
//           (reference only, not shown)
//   tech    source field the prototype data reads (Subscriptions mock lines)
//   derive  computes a front-only value from a data line
//   metric  contact-level metric computed over all lines ("min" / "max" of tech)
//   anchorOnly  drives an anchor ("Has made a purchase"…) but is not offered
//           in the field picker
// Spec types map to the builder's: text → string, list with open values →
// string (several typed values), list/enum with known values → enum,
// boolean → enum Yes / No. Choice lists for `values_from` fields are
// illustrative until the real values come from the data.
const YES_NO = ["Yes", "No"];
const RELATION = ["Buyer", "Beneficiary", "Buyer or beneficiary"];
// Package titles in the mock data (spec: values from product_packs.name).
const PACKAGE_TITLES = [
  "Parking pass 2025-26 — P1",
  "Season ticket 2023-24 — Loges",
  "Season ticket 2023-24 — Tribune Nord",
  "Season ticket 2023-24 — Virage Mordelles",
  "Season ticket 2024-25 — Loges",
  "Season ticket 2024-25 — Tribune Nord",
  "Season ticket 2024-25 — Tribune Sud",
  "Season ticket 2024-25 — Virage Mordelles",
  "Season ticket 2025-26 — Loges",
  "Season ticket 2025-26 — Tribune Nord",
  "Season ticket 2025-26 — Tribune Sud",
  "Season ticket 2025-26 — Virage Mordelles",
  "Second-half pass 2025-26 — Virage Mordelles",
];

/* "Order conditions" — the order-level filters the spec shares from All
   purchases into every activity (Ticketing, E-commerce, Registrations,
   Subscription). `skip` drops the ones an object already carries under its own
   id; `extra` overrides a definition for that object. */
const ORDER_CONDITIONS = [
  { id: "orderDate",     label: "Order date",     type: "date" },
  { id: "orderStatus",   label: "Order status",   type: "enum", choices: ["Completed", "Pending", "Cancelled", "Refunded"] },
  { id: "paymentStatus", label: "Payment status", type: "enum", choices: ["Paid", "Unpaid", "Partially paid", "Refunded"] },
  { id: "paymentType",   label: "Payment type",   type: "enum", choices: ["Credit card", "PayPal", "Direct debit", "Cash", "Gift card"] },
  { id: "coupon",        label: "Coupon",         type: "string" },
  { id: "salesChannel",  label: "Sales channel",  type: "enum", choices: ["Online shop", "Website", "Box office", "Call centre", "Partner"] },
  { id: "orderLocation", label: "Order location", type: "string" },
  { id: "orderPeriod",   label: "Order period",   type: "enum", choices: ["Pre-sale", "Regular sale", "Renewal campaign", "Last minute"] },
  { id: "connector",     label: "Connector",      type: "enum", choices: ["SecuTix", "Weezevent", "Shopify", "Ticketmaster"] },
];
const orderConditions = ({ skip = [], extra = {} } = {}) => ORDER_CONDITIONS
  .filter((f) => !skip.includes(f.id))
  .map((f) => ({ ...f, ...(extra[f.id] ?? {}), level: "any", group: "Order conditions", status: "shared" }));

// ─── DATA OBJECTS ─────────────────────────────────────────────────────────────
const DATA_OBJECTS = [
  // ── Contacts ────────────────────────────────────────────────────────────────
  {
    id: "contact",
    label: "Contacts",
    description: "Filter contacts by their profile attributes",
    chip: "chip1", ...CHIPS.chip1, // Purple
    fields: [
      // Identity
      { id: "email",             label: "Email",              type: "string", group: "Identity", status: "spec" },
      { id: "firstName",         label: "First name",         type: "string", group: "Identity", status: "spec" },
      { id: "lastName",          label: "Last name",          type: "string", group: "Identity", status: "spec" },
      // Account
      { id: "accountStatus",     label: "Account status",     type: "enum",   group: "Account", status: "spec", choices: ["Active", "Inactive", "Blocked"] },
      { id: "createdAt",         label: "Created on",         type: "date",   group: "Account", status: "spec" },
      { id: "crmSegments",       label: "CRM segments",       type: "string", group: "Account", status: "spec" },
      { id: "connector",         label: "Origin",             type: "enum",   group: "Account", status: "spec", choices: ["SecuTix", "Weezevent", "Shopify", "Ticketmaster"] },
      { id: "acquisitionSource", label: "Acquisition source", type: "enum",   group: "Account", choices: ["Web", "App", "Partner", "Event", "Referral", "Ticketing"] },
      { id: "tag",               label: "Tag",                type: "enum",   group: "Account", choices: ["VIP", "Patron", "Club friend"] },
      // Profile
      { id: "age",               label: "Age",                type: "number", group: "Profile", status: "spec" },
      { id: "gender",            label: "Gender",             type: "enum",   group: "Profile", status: "spec", choices: ["Male", "Female", "Other"] },
      { id: "language",          label: "Language",           type: "enum",   group: "Profile", status: "spec", choices: ["French", "English", "German", "Italian", "Spanish"] },
      { id: "civility",          label: "Civility",           type: "enum",   group: "Profile", choices: ["Mr.", "Mrs.", "Other"] },
      { id: "birthdate",         label: "Date of birth",      type: "date",   group: "Profile" },
      { id: "nationality",       label: "Nationality",        type: "string", group: "Profile" },
      // Location
      { id: "city",              label: "City",               type: "string", group: "Location", status: "spec" },
      { id: "zipcode",           label: "Postal code",        type: "string", group: "Location", status: "spec" },
      { id: "country",           label: "Country",            type: "enum",   group: "Location", status: "spec", choices: ["France", "Belgium", "Switzerland", "Italy", "United Kingdom", "Germany", "Spain"] },
      { id: "region",            label: "Region",             type: "string", group: "Location" },
      // Preferences — the former "Favourite …" fields keep their ids
      { id: "favoriteArtist",    label: "Preferred artists",        type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteAthlete",   label: "Preferred athletes",       type: "string", group: "Preferences", status: "spec" },
      { id: "preferredBrands",   label: "Preferred brands",         type: "string", group: "Preferences", status: "spec" },
      { id: "preferredCategories", label: "Preferred categories",   type: "string", group: "Preferences", status: "spec" },
      { id: "preferredChannel",  label: "Preferred channel",        type: "enum",   group: "Preferences", status: "spec", choices: ["Email", "SMS", "Phone", "Postal mail"] },
      { id: "preferredEvents",   label: "Preferred events",         type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteVenue",     label: "Preferred locations",      type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteGenre",     label: "Preferred music styles",   type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteSport",     label: "Preferred sports",         type: "string", group: "Preferences", status: "spec" },
      { id: "preferredSubcategories", label: "Preferred subcategories", type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteClub",      label: "Preferred teams",          type: "string", group: "Preferences", status: "spec" },
      { id: "favoriteTimeSlot",  label: "Preferred timeslot",       type: "enum",   group: "Preferences", status: "spec", choices: ["Morning", "Afternoon", "Evening", "Night"] },
      { id: "preferredTransportation", label: "Preferred transportation", type: "enum", group: "Preferences", status: "spec", choices: ["Public transport", "Car", "Bike", "On foot"] },
      { id: "favoritePlayer",    label: "Favourite player",         type: "string", group: "Preferences" },
      // Consent
      { id: "emailOptIn",        label: "Email opt-in",       type: "enum",   group: "Consent", status: "spec", choices: YES_NO },
      { id: "validEmail",        label: "Valid email",        type: "enum",   group: "Consent", status: "spec", choices: YES_NO },
      // Scores
      { id: "rfmScore",          label: "RFM score",          type: "number", group: "Scores" },
      { id: "engagementScore",   label: "Engagement score",   type: "number", group: "Scores" },
    ],
  },

  // ── All purchases (formerly "Purchase summary") ─────────────────────────────
  // Every order, all channels. Channel scope token on the anchor unlocks
  // CONSUMPTIONS_CHANNEL_FIELDS[scope]. Counts in orders.
  {
    id: "consumptions",
    label: "All purchases",
    description: "Filter by orders or spending, across all channels",
    chip: "chip3", ...CHIPS.chip3, // Amber
    fields: [
      // Order
      ...ORDER_CONDITIONS.map((f) => ({ ...f, group: "Order", status: "spec" })),
      // Order content
      { id: "orderAmount",          label: "Order amount",            type: "number", group: "Order content", status: "spec" },
      { id: "includesGift",         label: "Includes a gift",         type: "enum",   group: "Order content", status: "proposed", choices: YES_NO },
      { id: "boughtForSomeoneElse", label: "Bought for someone else", type: "enum",   group: "Order content", status: "proposed", choices: YES_NO },
      // Totals — existing ids kept
      { id: "firstPurchaseDate",    label: "First purchase date",     type: "date",   group: "Totals", status: "spec" },
      { id: "lastPurchaseDate",     label: "Last purchase date",      type: "date",   group: "Totals", status: "spec" },
      { id: "purchaseCount",        label: "Number of orders",        type: "number", group: "Totals", status: "spec" },
      { id: "totalAmount",          label: "Total spend",             type: "number", group: "Totals", status: "spec" },
      { id: "averageBasketValue",   label: "Average basket",          type: "number", group: "Totals", status: "spec" },
      { id: "categoriesBought",     label: "Categories bought",       type: "enum",   group: "Totals", status: "proposed", choices: ["Ticketing", "E-commerce", "Registrations", "Subscription"] },
      { id: "numberOfCategoriesBought", label: "Number of categories bought", type: "number", group: "Totals", status: "proposed" },
      { id: "mainCategory",         label: "Main category",           type: "enum",   group: "Totals", status: "proposed", choices: ["Ticketing", "E-commerce", "Registrations", "Subscription"] },
      { id: "seasonsWithAPurchase", label: "Seasons with a purchase", type: "number", group: "Totals", status: "proposed" },
      { id: "purchaseDelay",        label: "Average days between orders", type: "number", group: "Totals", status: "proposed" },
      { id: "recency",              label: "Days since last purchase",    type: "number", group: "Totals" },
      { id: "receivedFromOthers",   label: "Received from others",    type: "enum",   group: "Totals", status: "proposed", choices: YES_NO },
      { id: "loyaltyScore",         label: "Loyalty score",           type: "number", group: "Totals", status: "spec" },
      // Channel-specific fields injected at render time from CONSUMPTIONS_CHANNEL_FIELDS
    ],
  },

  // ── Ticketing ───────────────────────────────────────────────────────────────
  // Two anchor levels — ticket / purchase. Fields are flat (level "any") and
  // shown whatever the anchor; the two counts swap with the level.
  {
    id: "ticket",
    label: "Ticketing",
    description: "Filter by representations, tickets or purchases — event, type, seat, or date",
    chip: "chip2", ...CHIPS.chip2, // Teal
    fields: [
      // Role — no Relation condition = Buyer, so older segments keep their meaning.
      { id: "relation",            label: "Relation",               type: "enum",   level: "any", group: "Role", status: "live", choices: RELATION },
      // Event
      { id: "eventName",           label: "Event name",             type: "string", level: "any", group: "Event", status: "live" },
      { id: "eventType",           label: "Event type",             type: "string", level: "any", group: "Event", status: "live" },
      { id: "eventStartDate",      label: "Event start date",       type: "date",   level: "any", group: "Event", status: "live" },
      { id: "eventEndDate",        label: "Event end date",         type: "date",   level: "any", group: "Event", status: "live" },
      { id: "season",              label: "Season",                 type: "string", level: "any", group: "Event", status: "live" },
      { id: "representationName",  label: "Representation",         type: "string", level: "any", group: "Event", status: "live" },
      { id: "representationDate",  label: "Representation date",    type: "date",   level: "any", group: "Event", status: "live" },
      { id: "venue",               label: "Venue",                  type: "string", level: "any", group: "Event", status: "live" },
      { id: "dayPart",             label: "Day part",               type: "enum",   level: "any", group: "Event", status: "to_add", choices: ["Morning", "Afternoon", "Evening"] },
      { id: "eventBrand",          label: "Brand",                  type: "string", level: "any", group: "Event", status: "to_add" },
      { id: "artists",             label: "Artists",                type: "string", level: "any", group: "Event", status: "to_add" },
      { id: "headliners",          label: "Headliners",             type: "string", level: "any", group: "Event", status: "to_add" },
      { id: "musicStyles",         label: "Music styles",           type: "string", level: "any", group: "Event", status: "to_add" },
      { id: "audience",            label: "Audience",               type: "enum",   level: "any", group: "Event", status: "to_add", choices: ["Family", "Adults", "Young audience", "Schools"] },
      { id: "eventGroup",          label: "Group",                  type: "string", level: "any", group: "Event", status: "to_add" },
      { id: "subcategory",         label: "Subcategory",            type: "enum",   level: "any", group: "Event", status: "to_add", choices: ["Ballet", "Opera", "Concert", "Match", "Theatre"] },
      // Ticket — the pricing formula is a tariff name, so a choice list (spec note), not a number
      { id: "ticketCategory",      label: "Ticket category",        type: "string", level: "any", group: "Ticket", status: "live" },
      { id: "ticketStatus",        label: "Ticket status",          type: "enum",   level: "any", group: "Ticket", status: "live", choices: ["Reserved", "Sold", "Refunded", "Cancelled"] },
      { id: "ticketPrice",         label: "Ticket pricing formula", type: "enum",   level: "any", group: "Ticket", status: "live", choices: ["Full price", "Reduced", "Youth", "Senior", "Group", "Invitation"] },
      { id: "access",              label: "Access",                 type: "enum",   level: "any", group: "Ticket", status: "to_add", choices: ["Main entrance", "North gate", "South gate", "VIP entrance"] },
      // Product
      { id: "classification",      label: "Classification",         type: "enum",   level: "any", group: "Product", status: "to_add", choices: ["Ticket", "E-commerce item", "Registration", "Membership"] },
      { id: "price",               label: "Price",                  type: "number", level: "any", group: "Product", status: "to_add" },
      { id: "priceExclTax",        label: "Price excl. tax",        type: "number", level: "any", group: "Product", status: "to_add" },
      { id: "specification",       label: "Specification",          type: "string", level: "any", group: "Product", status: "to_add" },
      // Order — line-level order fields
      { id: "purchaseDate",        label: "Purchase date",          type: "date",   level: "any", group: "Order", status: "live" },
      { id: "supplier",            label: "Sales channel",          type: "string", level: "any", group: "Order", status: "live" },
      // Summary — counts used by anchors and as refinements
      { id: "ticketCount",         label: "Number of tickets",          type: "number", level: "purchase", group: "Summary", status: "to_add" },
      // Anchor only ("Has made a purchase") — not offered as a refinement.
      { id: "purchaseCount",       label: "Number of purchases",        type: "number", level: "ticket",   group: "Summary", status: "live", anchorOnly: true },
      { id: "representationCount", label: "Number of representations",  type: "number", level: "any",      group: "Summary", status: "live" },
      { id: "eventCount",          label: "Number of events",           type: "number", level: "any",      group: "Summary", status: "live" },
      // Order conditions — shared; Purchase date / Sales channel already above
      ...orderConditions({ skip: ["orderDate", "salesChannel"] }),
    ],
  },

  // ── E-commerce ──────────────────────────────────────────────────────────────
  // Two anchor levels — purchase (orders) / product (order lines). Same model
  // as Ticketing now: flat fields, counts swap with the level.
  {
    id: "order",
    label: "E-commerce",
    description: "Filter by products or orders — item, category, price or status",
    chip: "chip4", ...CHIPS.chip4, // Pink
    fields: [
      { id: "relation",        label: "Relation",              type: "enum",   level: "any", group: "Role", status: "proposed", choices: RELATION },
      // Order line
      { id: "isGift",          label: "Is gift",               type: "enum",   level: "any", group: "Order line", status: "spec", choices: YES_NO },
      // Product — existing ids kept
      { id: "productName",     label: "Product title",         type: "string", level: "any", group: "Product", status: "spec" },
      { id: "productBrand",    label: "Brand",                 type: "string", level: "any", group: "Product", status: "spec" },
      { id: "productCategory", label: "Category",              type: "enum",   level: "any", group: "Product", status: "spec", choices: ["Merch", "Apparel", "Accessories", "Books & media", "Food & drink", "Gift cards"] },
      { id: "productType",     label: "Product type",          type: "enum",   level: "any", group: "Product", status: "spec", choices: ["E-commerce item", "Gift card", "Voucher"] },
      { id: "unitPrice",       label: "Price",                 type: "number", level: "any", group: "Product", status: "spec" },
      { id: "priceExclTax",    label: "Price excl. tax",       type: "number", level: "any", group: "Product", status: "spec" },
      // Summary
      { id: "purchaseCount",   label: "Number of orders",      type: "number", level: "product",  group: "Summary", status: "spec" },
      // Anchor only ("Has ordered a product") — not offered as a refinement.
      { id: "productCount",    label: "Number of order lines", type: "number", level: "purchase", group: "Summary", status: "spec", anchorOnly: true },
      // Order conditions — Order date / status / channel keep their existing ids
      { id: "purchaseDate",    label: "Order date",            type: "date",   level: "any", group: "Order conditions", status: "shared" },
      { id: "orderStatus",     label: "Order status",          type: "enum",   level: "any", group: "Order conditions", status: "shared",
        choices: ["Pending", "Confirmed", "Shipped", "Delivered", "Completed", "Cancelled", "Refunded"] },
      { id: "supplier",        label: "Sales channel",         type: "enum",   level: "any", group: "Order conditions", status: "shared",
        choices: ORDER_CONDITIONS.find((f) => f.id === "salesChannel").choices },
      ...orderConditions({ skip: ["orderDate", "orderStatus", "salesChannel"] }),
    ],
  },

  // ── Registrations (new) ─────────────────────────────────────────────────────
  // Two anchor levels — registration / activity. Same model as Ticketing.
  {
    id: "registration",
    label: "Registrations",
    description: "Filter by registrations to activities — workshop, session, location or date",
    chip: "chip9", ...CHIPS.chip9, // Orange
    fields: [
      { id: "relation",          label: "Relation",        type: "enum",   level: "any", group: "Role", status: "proposed", choices: RELATION },
      // Activity
      { id: "activityTitle",     label: "Title",           type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "season",            label: "Season",          type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["2024-25", "2025-26", "2026-27"] },
      { id: "year",              label: "Year",            type: "number", level: "any", group: "Activity", status: "spec" },
      { id: "activityType",      label: "Type",            type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["Workshop", "Guided tour", "Course", "Conference"] },
      { id: "classification",    label: "Classification",  type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["Registration", "Ticket", "Membership"] },
      { id: "category",          label: "Category",        type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["Sport", "Culture", "Education", "Wellbeing"] },
      { id: "subcategory",       label: "Subcategory",     type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["Yoga", "Painting", "Dance", "Photography"] },
      { id: "activityGroup",     label: "Group",           type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "brand",             label: "Brand",           type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "status",            label: "Status",          type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["Open", "Closed"] },
      { id: "specification",     label: "Specification",   type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "startDate",         label: "Start date",      type: "date",   level: "any", group: "Activity", status: "spec" },
      { id: "endDate",           label: "End date",        type: "date",   level: "any", group: "Activity", status: "spec" },
      { id: "sessionDate",       label: "Session date",    type: "date",   level: "any", group: "Activity", status: "spec" },
      { id: "location",          label: "Location",        type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "city",              label: "City",            type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "postalCode",        label: "Postal code",     type: "string", level: "any", group: "Activity", status: "spec" },
      { id: "country",           label: "Country",         type: "enum",   level: "any", group: "Activity", status: "spec", choices: ["France", "Belgium", "Switzerland"] },
      // Price
      { id: "price",             label: "Price",           type: "number", level: "any", group: "Price", status: "spec" },
      { id: "priceExclTax",      label: "Price excl. tax", type: "number", level: "any", group: "Price", status: "spec" },
      // Summary — counts used by anchors and as refinements
      { id: "registrationCount", label: "Number of registrations", type: "number", level: "activity",     group: "Summary", status: "spec" },
      { id: "activityCount",     label: "Number of activities",    type: "number", level: "registration", group: "Summary", status: "spec" },
      { id: "dateCount",         label: "Number of dates",         type: "number", level: "any", group: "Summary", status: "spec" },
      { id: "totalSpend",        label: "Total spend",             type: "number", level: "any", group: "Summary", status: "spec" },
      { id: "firstRegistrationDate", label: "First registration date", type: "date", level: "any", group: "Summary", status: "spec" },
      { id: "lastRegistrationDate",  label: "Last registration date",  type: "date", level: "any", group: "Summary", status: "spec" },
      ...orderConditions(),
    ],
  },

  // ── Subscription ────────────────────────────────────────────────────────────
  // Two anchor levels — subscription (memberships) / purchase. Fields read the
  // contact's subscription LINES (contacts.json → subscriptions[]) through
  // `tech` / `derive`; `metric` fields are computed over all of a contact's
  // lines. Technical ids and sync fields stay in the data but are not offered.
  // Cancelled and refunded lines never count unless the filter targets order
  // or payment status (evaluator in Contacts.jsx).
  {
    id: "subscription",
    label: "Subscription",
    description: "Filter by memberships or subscription purchases — package, season, status, renewal or date",
    chip: "chip6", ...CHIPS.chip6, // Sky
    fields: [
      // Role — read on the anchor line: a gift bought for someone else makes the
      // contact the buyer only; otherwise they are both buyer and member.
      { id: "relation",                derive: (l) => (l.is_buyer_and_receiver ? RELATION : ["Buyer", "Buyer or beneficiary"]),
                                                                         label: "Relation",       type: "enum",   level: "any", group: "Role", status: "proposed", choices: RELATION },
      // Membership — spec names on the existing ids
      { id: "subscriptionTitle",       tech: "subscription_title",       label: "Package title",  type: "enum",   level: "any", group: "Membership", status: "spec", choices: PACKAGE_TITLES },
      { id: "packageType",             tech: "package_type",             label: "Package type",   type: "enum",   level: "any", group: "Membership", status: "spec", choices: ["Subscription", "Membership", "Pass"] },
      { id: "subscriptionStatus",      derive: (l) => packageStatus(l),  label: "Package status", type: "enum",   level: "any", group: "Membership", status: "spec",
        choices: ["Upcoming", "Active", "Expired", "Cancelled"] },
      { id: "subscriptionStartDate",   tech: "subscription_start_date",  label: "Package start",  type: "date",   level: "any", group: "Membership", status: "spec" },
      { id: "subscriptionEndDate",     tech: "subscription_end_date",    label: "Package end",    type: "date",   level: "any", group: "Membership", status: "spec" },
      { id: "role",                    tech: "subscription_role",        label: "Role",           type: "enum",   level: "any", group: "Membership", status: "spec", choices: ["Anchor", "Member ticket", "Guest", "Add-on"] },
      { id: "season",                  derive: (l) => seasonOf(l.subscription_start_date),
                                                                         label: "Season",         type: "enum",   level: "any", group: "Membership", choices: ["2023-24", "2024-25", "2025-26"] },
      { id: "subscriptionCategory",    tech: "subscription_category",    label: "Category",       type: "enum",   level: "any", group: "Membership", choices: ["Season ticket", "Pass", "Add-on"] },
      { id: "subscriptionSubcategory", tech: "subscription_subcategory", label: "Subcategory",    type: "enum",   level: "any", group: "Membership", choices: ["Seat", "Parking"] },
      { id: "subscriptionType",        tech: "subscription_type",        label: "Rate",           type: "enum",   level: "any", group: "Membership", choices: ["Full price", "Reduced", "Youth", "Senior"] },
      { id: "fulfillmentType",         tech: "fulfillment_type",         label: "Delivery",       type: "enum",   level: "any", group: "Membership", choices: ["Digital", "Physical card"] },
      { id: "isGift",                  tech: "is_gift",                  label: "Gift subscription",   type: "enum", level: "any", group: "Membership", choices: YES_NO },
      { id: "holderIsBuyer",           tech: "is_buyer_and_receiver",    label: "Holder is the buyer", type: "enum", level: "any", group: "Membership", choices: YES_NO },
      // Plan & brand
      { id: "subscriptionPlan",        tech: "subscription_plan",        label: "Plan or block code", type: "string", level: "any", group: "Plan & brand" },
      { id: "subscriptionBrand",       tech: "subscription_brand",       label: "Brand",              type: "enum",   level: "any", group: "Plan & brand", choices: ["Stade Rennais FC", "SRFC Women"] },
      // Price
      { id: "subscriptionPrice",       tech: "subscription_price",        label: "Price (incl. tax)", type: "number", level: "any", group: "Price" },
      { id: "subscriptionPriceExTax",  tech: "subscription_price_ex_tax", label: "Price (excl. tax)", type: "number", level: "any", group: "Price" },
      // Usage and renewal
      { id: "linkedTickets",           tech: "linked_tickets",              label: "Linked tickets",           type: "number", level: "any", group: "Usage and renewal", status: "spec" },
      { id: "renewalStatus",           tech: "subscription_renewal_status", label: "Renewal status",           type: "enum",   level: "any", group: "Usage and renewal", choices: ["Renewed", "Not renewed"] },
      { id: "renewalType",             tech: "subscription_renewal_type",   label: "Renewal type",             type: "enum",   level: "any", group: "Usage and renewal", choices: ["Automatic", "Manual"] },
      // Summary — counts used by anchors and as refinements, plus contact metrics
      { id: "subscriptionCount",       label: "Number of memberships",  type: "number", level: "purchase",     group: "Summary", status: "spec" },
      { id: "purchaseCount",           label: "Number of purchases",    type: "number", level: "subscription", group: "Summary" },
      { id: "firstMembershipDate",     tech: "order_date", metric: "min", label: "First membership date", type: "date", level: "any", group: "Summary", status: "spec" },
      { id: "lastMembershipDate",      tech: "order_date", metric: "max", label: "Last membership date",  type: "date", level: "any", group: "Summary", status: "spec" },
      // Order conditions — shared; the line fields keep their existing ids
      ...orderConditions({
        skip: ["coupon", "salesChannel"],
        extra: {
          orderDate:     { tech: "order_date" },
          orderStatus:   { tech: "order_status",   choices: ["Reserved", "Sold", "Refunded", "Cancelled"] },
          paymentStatus: { tech: "payment_status", choices: ["Paid", "Unpaid", "Refunded"] },
          paymentType:   { tech: "payment_type" },
          orderLocation: { tech: "order_pointofsale" },
          orderPeriod:   { tech: "order_period" },
          connector:     { tech: "connector" },
        },
      }),
      { id: "couponTitle",        tech: "coupon_title",               label: "Coupon",              type: "string", level: "any", group: "Order conditions", status: "shared" },
      { id: "subscriptionSource", tech: "subscription_source",        label: "Sales channel",       type: "enum",   level: "any", group: "Order conditions", status: "shared", choices: ["Web", "Box office", "Partner"] },
      { id: "orderStatusDetail",  tech: "order_status_specification", label: "Status detail",       type: "string", level: "any", group: "Order conditions" },
    ],
  },

  {
    id: "campaign",
    label: "Campaigns",
    description: "Filter contacts who received or interacted with a campaign",
    chip: "chip7", ...CHIPS.chip7, // Coral
    fields: [
      { id: "campaignCount", label: "Number of campaigns received", type: "number" },
      { id: "campaignName", label: "Campaign name", type: "string" },
      { id: "channelType",  label: "Channel",       type: "enum", choices: ["Email", "SMS", "Push", "Wallet"] },
      { id: "sentDate",     label: "Send date",     type: "date"   },
      { id: "hasOpened",    label: "Has opened",    type: "enum", choices: ["Yes", "No"] },
      { id: "hasClicked",   label: "Has clicked",   type: "enum", choices: ["Yes", "No"] },
      { id: "openDate",     label: "Open date",     type: "date"   },
      { id: "clickDate",    label: "Click date",    type: "date"   },
    ],
  },

  {
    id: "consent",
    label: "Consents",
    description: "Filter contacts by consent status",
    chip: "chip8", ...CHIPS.chip8, // Slate
    fields: [
      { id: "consentName",   label: "Consent name", type: "string" },
      { id: "channel",       label: "Channel",      type: "enum", choices: ["Email", "SMS", "Push", "Mail"] },
      { id: "consentStatus", label: "Status",       type: "enum", choices: ["Opt-in", "Opt-out"] },
      { id: "actionDate",    label: "Action date",  type: "date"  },
    ],
  },

  {
    id: "accessControl",
    label: "Access control",
    description: "Filter contacts by event attendance",
    chip: "chip5", ...CHIPS.chip5, // Lime
    fields: [
      { id: "accessPoint",      label: "Event",            type: "string" },
      { id: "numberOfControls", label: "Number of visits", type: "number" },
      { id: "createdAt",        label: "Visit date",       type: "date"   },
    ],
  },
];

export default DATA_OBJECTS;