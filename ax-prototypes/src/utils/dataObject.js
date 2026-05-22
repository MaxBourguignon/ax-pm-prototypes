import DS from "./designSystem"

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

export const ECOMMERCE_LEVEL_FIELDS = {
  purchase: ["purchaseCount", "purchaseDate", "orderAmount", "supplier"],
  product:  ["productCount", "productName", "productCategory", "orderStatus", "unitPrice"],
};

export const SUBSCRIPTION_LEVEL_FIELDS = {
  purchase:     ["purchaseCount", "purchaseDate"],
  subscription: ["subscriptionCount", "subscriptionName", "subscriptionStatus", "startDate", "endDate", "amount"],
};

// ─── DATA OBJECTS ─────────────────────────────────────────────────────────────
const DATA_OBJECTS = [
  {
    id: "contact",
    label: "Contacts",
    description: "Filter contacts by their profile attributes",
    color: DS.blue500, bg: DS.blue100,
    fields: [
      { id: "firstName",         label: "First name",         type: "string" },
      { id: "lastName",          label: "Last name",          type: "string" },
      { id: "email",             label: "Email",              type: "string" },
      { id: "civility",          label: "Civility",           type: "enum", choices: ["Mr.", "Mrs.", "Other"] },
      { id: "gender",            label: "Gender",             type: "enum", choices: ["Male", "Female", "Other"] },
      { id: "birthdate",         label: "Date of birth",      type: "date" },
      { id: "city",              label: "City",               type: "string" },
      { id: "zipcode",           label: "Postal code",        type: "string" },
      { id: "country",           label: "Country",            type: "string" },
      { id: "nationality",       label: "Nationality",        type: "string" },
      { id: "region",            label: "Region",             type: "string" },
      { id: "language",          label: "Language",           type: "string" },
      { id: "acquisitionSource", label: "Acquisition source", type: "enum", choices: ["Web", "App", "Partner", "Event", "Referral", "Ticketing"] },
      { id: "tag",               label: "Tag",                type: "enum", choices: ["VIP", "Patron", "Club friend"] },
      { id: "createdAt",         label: "Creation date",      type: "date" },
      { id: "rfmScore",          label: "RFM score",          type: "number" },
      { id: "engagementScore",   label: "Engagement score",   type: "number" },
      { id: "favoriteArtist",    label: "Favourite artist",   type: "string" },
      { id: "favoriteAthlete",   label: "Favourite athlete",  type: "string" },
      { id: "favoriteClub",      label: "Favourite club",     type: "string" },
      { id: "favoriteSport",     label: "Favourite sport",    type: "string" },
      { id: "favoritePlayer",    label: "Favourite player",   type: "string" },
      { id: "favoriteVenue",     label: "Favourite venue",    type: "string" },
      { id: "favoriteGenre",     label: "Favourite genre",    type: "string" },
      { id: "favoriteTimeSlot",  label: "Favourite timeslot", type: "enum", choices: ["Morning", "Afternoon", "Evening", "Night"] },
    ],
  },

  // ── Purchase summary ────────────────────────────────────────────────────────
  // Transaction-level, all channels by default.
  // Channel scope token on the anchor unlocks CONSUMPTIONS_CHANNEL_FIELDS[scope].
  {
    id: "consumptions",
    label: "Purchase summary",
    description: "Filter by number of purchases or spending, across all channels",
    color: DS.neutral500, bg: DS.neutral200,
    fields: [
      { id: "purchaseCount",      label: "Number of purchases",         type: "number" },
      { id: "totalAmount",        label: "Total amount spent",          type: "number" },
      { id: "averageBasketValue", label: "Average basket value",        type: "number" },
      { id: "recency",            label: "Days since last purchase",    type: "number" },
      { id: "purchaseDelay",      label: "Avg. days between purchases", type: "number" },
      // Channel-specific fields injected at render time from CONSUMPTIONS_CHANNEL_FIELDS
    ],
  },

  // ── Ticketing ───────────────────────────────────────────────────────────────
  // Two anchor levels — ticket / purchase.
  // Representation is not an anchor — it is a refinement field.
  // All fields are flat (level: "any") and shown regardless of which anchor is active.
  // ticketCount is the anchor field for "Has bought a ticket".
  // purchaseCount is the anchor field for "Has made a purchase".
  {
    id: "ticket",
    label: "Ticketing",
    description: "Filter by representations, tickets or purchases — event, type, seat, or date",
    color: DS.purple600, bg: DS.purple100,
    fields: [
      // ── Event ────────────────────────────────────────────────────────────────
      { id: "eventName",           label: "Event name",                type: "string", level: "any" },
      { id: "eventType",           label: "Event type",                type: "string", level: "any" },
      { id: "eventStartDate",      label: "Event start date",          type: "date",   level: "any" },
      { id: "eventEndDate",        label: "Event end date",            type: "date",   level: "any" },
      { id: "season",              label: "Season",                    type: "string", level: "any" },

      // ── Representation ───────────────────────────────────────────────────────
      { id: "representationName",  label: "Representation",            type: "string", level: "any" },
      { id: "representationDate",  label: "Representation date",       type: "date",   level: "any" },
      { id: "venue",               label: "Venue",                     type: "string", level: "any" },

      // ── Ticket ───────────────────────────────────────────────────────────────
      { id: "ticketCategory",      label: "Ticket category",           type: "string", level: "any" },
      { id: "ticketStatus",        label: "Ticket status",             type: "enum",   level: "any", choices: ["Sold", "Cancelled", "Refunded"] },
      { id: "ticketPrice",         label: "Ticket pricing formula",    type: "number", level: "any" },

      // ── Purchase ─────────────────────────────────────────────────────────────
      { id: "purchaseDate",        label: "Purchase date",             type: "date",   level: "any" },
      { id: "purchaseAmount",      label: "Purchase amount",           type: "number", level: "any" },
      { id: "supplier",            label: "Sales channel",             type: "string", level: "any" },

       // ── Counts — used by anchors and as refinements ──────────────────────────
       { id: "ticketCount",         label: "Number of tickets",         type: "number", level: "purchase" },
       { id: "purchaseCount",       label: "Number of purchases",       type: "number", level: "ticket" },
       { id: "representationCount", label: "Number of representations", type: "number", level: "any" },
       { id: "eventCount",          label: "Number of events",          type: "number", level: "any" },
    ],
  },

  // ── E-commerce ──────────────────────────────────────────────────────────────
  // Two anchor levels — purchase / product.
  {
    id: "order",
    label: "E-commerce",
    description: "Filter by products or purchases — item, category, or status",
    color: DS.teal500, bg: DS.teal100,
    fields: [
      { id: "purchaseCount",   label: "Number of purchases", type: "number", level: "purchase" },
      { id: "purchaseDate",    label: "Purchase date",       type: "date",   level: "purchase" },
      { id: "orderAmount",     label: "Purchase amount",     type: "number", level: "purchase" },
      { id: "supplier",        label: "Sales channel",       type: "string", level: "purchase" },

      { id: "productCount",    label: "Number of products",  type: "number", level: "product" },
      { id: "productName",     label: "Product name",        type: "string", level: "product" },
      { id: "productCategory", label: "Product category",    type: "string", level: "product" },
      { id: "orderStatus",     label: "Status",              type: "enum",   level: "product", choices: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Refunded"] },
      { id: "unitPrice",       label: "Unit price",          type: "number", level: "product" },
    ],
  },

  // ── Subscriptions ───────────────────────────────────────────────────────────
  // Two anchor levels — purchase / subscription.
  {
    id: "subscription",
    label: "Subscriptions",
    description: "Filter contacts who have or had a subscription",
    color: DS.orange500, bg: DS.orange100,
    fields: [
      { id: "purchaseCount",      label: "Number of purchases",     type: "number", level: "purchase"     },
      { id: "purchaseDate",       label: "Purchase date",           type: "date",   level: "purchase"     },

      { id: "subscriptionCount",  label: "Number of subscriptions", type: "number", level: "subscription" },
      { id: "subscriptionName",   label: "Plan name",               type: "string", level: "subscription" },
      { id: "subscriptionStatus", label: "Status",                  type: "enum",   level: "subscription", choices: ["Active", "Inactive", "Suspended", "Cancelled"] },
      { id: "startDate",          label: "Start date",              type: "date",   level: "subscription" },
      { id: "endDate",            label: "End date",                type: "date",   level: "subscription" },
      { id: "amount",             label: "Amount",                  type: "number", level: "subscription" },
    ],
  },

  {
    id: "campaign",
    label: "Campaigns",
    description: "Filter contacts who received or interacted with a campaign",
    color: DS.amber600, bg: DS.amber100,
    fields: [
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
    color: DS.rose600, bg: DS.rose100,
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
    color: DS.indigo800, bg: DS.indigo100,
    fields: [
      { id: "accessPoint",      label: "Event",            type: "string" },
      { id: "numberOfControls", label: "Number of visits", type: "number" },
      { id: "createdAt",        label: "Visit date",       type: "date"   },
    ],
  },
];

export default DATA_OBJECTS;