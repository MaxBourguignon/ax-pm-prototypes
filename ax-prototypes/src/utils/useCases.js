// ─── USE CASES — V1 ────────────────────────────────────────────────────────
//
// Scope: every object in the Add a filter modal has at least 3 use cases, so
// each category can be entered — contact, consumptions (All purchases),
// ticket, order (E-commerce), registration, subscription, accessControl,
// campaign, consent.
//
// Each use case carries anchorLevel and (for consumptions) channelScope
// on the anchor filter, so the AnchorRow renders the correct sentence
// and the ContextualFieldPicker shows the right fields.
//
// Filter structure per object:
//   isAnchor: true   → rendered by AnchorRow
//   isAnchor: false  → rendered by FilterRow (refinement, level-aware)
//
// BUG FIXES vs. the original draft:
//   - campaign_* : anchor was comparing `campaignName` (a string) with
//     `gte "1"`. Replaced with a real count field, `campaignCount`.
//   - consent_optin : anchor was comparing `consentStatus` (categorical)
//     with `gte "1"`. Replaced with a direct `op: "is"` check — no count
//     gate needed for a status field.
//   - consent_optout / consent_no_record are new, added to round the
//     category out to 3 use cases (see chat for rationale). consent_no_record
//     assumes an "is_empty" operator exists for unset fields — swap for
//     whatever the real engine uses if that op isn't implemented yet.
//
// ─────────────────────────────────────────────────────────────────────────

const USE_CASES = {

  contact: [
      { id: "contact_all", label: "All my contacts",
        filter: { objId: "contact", fieldId: "email", op: "contains", val: "" } },
      { id: "contact_new", label: "New contacts (last 30 days)",
        filter: { objId: "contact", fieldId: "createdAt", op: "last_n_time", val: "30|days" } },
      { id: "contact_birthday", label: "Contacts with a birthday tomorrow",
        filter: { objId: "contact", fieldId: "birthdate", op: "next_n_days", val: "1" } },
      { id: "contact_emailable", label: "Contacts I can email",
        hint: "Email opt-in and a valid email address",
        filters: [
            { objId: "contact", fieldId: "emailOptIn", op: "is", val: ["Yes"], isAnchor: false },
            { objId: "contact", fieldId: "validEmail", op: "is", val: ["Yes"], isAnchor: false },
        ] },
  ],

  consumptions: [
      { id: "cons_coupon",
        label: "Contacts who used a coupon",
        hint: "Any channel, last 12 months",
        filters: [
            { objId: "consumptions", fieldId: "purchaseCount", op: "gte",         val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase", channelScope: "all" },
            { objId: "consumptions", fieldId: "coupon",        op: "is_set",      val: "",          isAnchor: false },
            { objId: "consumptions", fieldId: "orderDate",     op: "last_n_time", val: "12|months", isAnchor: false },
        ] },
      { id: "cons_buyers",
        label: "Contacts who have made at least one purchase",
        hint: "Counts across all channels",
        filters: [
            { objId: "consumptions", fieldId: "purchaseCount", op: "gte", val: "1",
              isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase", channelScope: "all" },
        ] },
      { id: "cons_non_buyers",
        label: "Contacts who have never purchased",
        filters: [
            { objId: "consumptions", fieldId: "purchaseCount", op: "eq", val: "0",
              isAnchor: true, anchorPolarity: "negative", anchorLevel: "purchase", channelScope: "all" },
        ] },
      { id: "cons_repeat_event",
        label: "Contacts who made multiple purchases for a specific event",
        hint: "Ticketing channel — fill in the event name below",
        filters: [
            { objId: "consumptions", fieldId: "purchaseCount", op: "gte", val: "2",
              isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase", channelScope: "ticketing" },
            { objId: "consumptions", fieldId: "eventName", op: "contains",    val: "",        isAnchor: false },
            { objId: "consumptions", fieldId: "recency",   op: "last_n_time", val: "4|years", isAnchor: false },
        ] },
  ],

  ticket: [
      { id: "ticket_family",
        label: "Contacts who bought for a family show",
        filters: [
            { objId: "ticket", fieldId: "ticketCount", op: "gte", val: "1",        isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
            { objId: "ticket", fieldId: "audience",    op: "is",  val: ["Family"], isAnchor: false },
        ] },
      { id: "ticket_specific_representation",
        label: "Contacts who bought a ticket for a specific representation",
        hint: "Fill in the representation name below",
        filters: [
            { objId: "ticket", fieldId: "ticketCount",        op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
            { objId: "ticket", fieldId: "representationName", op: "contains", val: "",  isAnchor: false },
        ] },
      { id: "ticket_multi_buyers_year",
        label: "Multi-buyers this year",
        hint: "More than 1 ticket and more than 3 representations in the last 12 months",
        filters: [
            { objId: "ticket", fieldId: "ticketCount",         op: "gt",         val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
            { objId: "ticket", fieldId: "representationCount", op: "gt",         val: "3",         isAnchor: false },
            { objId: "ticket", fieldId: "purchaseDate",        op: "last_n_time", val: "12|months", isAnchor: false },
        ] },
      { id: "ticket_representation_tomorrow",
        label: "Contacts who bought a ticket for a representation tomorrow",
        filters: [
            { objId: "ticket", fieldId: "ticketCount",        op: "gte",        val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
            { objId: "ticket", fieldId: "representationDate", op: "next_n_days", val: "1", isAnchor: false },
        ] },
  ],

  /* E-commerce — anchor by order or by order line (product), then refine. */
  order: [
      { id: "ecom_buyers_12m",
        label: "E-commerce buyers in the last 12 months",
        filters: [
            { objId: "order", fieldId: "purchaseCount", op: "gte",         val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
            { objId: "order", fieldId: "purchaseDate",  op: "last_n_time", val: "12|months", isAnchor: false },
        ] },
      { id: "ecom_category",
        label: "Contacts who bought in a product category",
        hint: "Fill in the category below",
        filters: [
            { objId: "order", fieldId: "productCount",    op: "gte", val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "product" },
            { objId: "order", fieldId: "productCategory", op: "is",  val: [],  isAnchor: false },
        ] },
      { id: "ecom_gift",
        label: "Contacts who bought a gift",
        filters: [
            { objId: "order", fieldId: "productCount", op: "gte", val: "1",     isAnchor: true, anchorPolarity: "positive", anchorLevel: "product" },
            { objId: "order", fieldId: "isGift",       op: "is",  val: ["Yes"], isAnchor: false },
        ] },
      { id: "ecom_never",
        label: "Contacts who never ordered online",
        filters: [
            { objId: "order", fieldId: "purchaseCount", op: "eq", val: "0", isAnchor: true, anchorPolarity: "negative", anchorLevel: "purchase" },
        ] },
  ],

  /* Access control — anchor on visits, then refine by event or date. */
  accessControl: [
      { id: "access_visited",
        label: "Contacts who visited an event",
        filters: [
            { objId: "accessControl", fieldId: "numberOfControls", op: "gte", val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "visit" },
        ] },
      { id: "access_recent",
        label: "Visitors in the last 30 days",
        filters: [
            { objId: "accessControl", fieldId: "numberOfControls", op: "gte",         val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "visit" },
            { objId: "accessControl", fieldId: "createdAt",        op: "last_n_time", val: "30|days", isAnchor: false },
        ] },
      { id: "access_frequent",
        label: "Frequent visitors",
        hint: "5 visits or more",
        filters: [
            { objId: "accessControl", fieldId: "numberOfControls", op: "gte", val: "5", isAnchor: true, anchorPolarity: "positive", anchorLevel: "visit" },
        ] },
      { id: "access_never",
        label: "Contacts who never came",
        hint: "Pair with a Ticketing filter to find no-shows",
        filters: [
            { objId: "accessControl", fieldId: "numberOfControls", op: "eq", val: "0", isAnchor: true, anchorPolarity: "negative", anchorLevel: "visit" },
        ] },
  ],

  /* Registrations — anchor by registration or by activity, then refine. */
  registration: [
      { id: "reg_activity_type",
        label: "Contacts registered to a type of activity",
        hint: "Pick the type below — workshop, guided tour…",
        filters: [
            { objId: "registration", fieldId: "registrationCount", op: "gte", val: "1",            isAnchor: true, anchorPolarity: "positive", anchorLevel: "registration" },
            { objId: "registration", fieldId: "activityType",      op: "is",  val: ["Workshop"],   isAnchor: false },
        ] },
      { id: "reg_upcoming_session",
        label: "Contacts with a session in the next 7 days",
        hint: "Good for practical reminders",
        filters: [
            { objId: "registration", fieldId: "registrationCount", op: "gte",         val: "1",      isAnchor: true, anchorPolarity: "positive", anchorLevel: "registration" },
            { objId: "registration", fieldId: "sessionDate",       op: "next_n_time", val: "7|days", isAnchor: false },
        ] },
      { id: "reg_regulars",
        label: "Regulars — 3 activities or more this season",
        filters: [
            { objId: "registration", fieldId: "activityCount", op: "gte", val: "3",          isAnchor: true, anchorPolarity: "positive", anchorLevel: "activity" },
            { objId: "registration", fieldId: "season",        op: "is",  val: ["2025-26"], isAnchor: false },
        ] },
  ],

  /* Subscriptions — same shape as Ticketing: an anchor (by subscription or by
     purchase) plus refinements from the subscription fields. */
  subscription: [
      { id: "sub_active",
        label: "Contacts with an active subscription",
        filters: [
            { objId: "subscription", fieldId: "subscriptionCount",  op: "gte", val: "1",        isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
            { objId: "subscription", fieldId: "subscriptionStatus", op: "is",  val: ["Active"], isAnchor: false },
        ] },
      { id: "sub_lapsed_season",
        label: "Last season's subscribers who have not come back",
        hint: "Subscribed in 2024-25, no subscription in 2025-26 — win-back",
        filters: [
            { objId: "subscription", fieldId: "subscriptionCount", op: "gte", val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
            { objId: "subscription", fieldId: "season",            op: "is",  val: ["2024-25"], isAnchor: false },
            { objId: "subscription", fieldId: "renewalStatus",     op: "is",  val: ["Not renewed"], isAnchor: false },
        ] },
      { id: "sub_ending_soon",
        label: "Subscriptions ending in the next 30 days",
        hint: "Good for renewal campaigns",
        filters: [
            { objId: "subscription", fieldId: "subscriptionCount",   op: "gte",         val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
            { objId: "subscription", fieldId: "subscriptionEndDate", op: "next_n_time", val: "30|days", isAnchor: false },
        ] },
      { id: "sub_not_renewed",
        label: "Subscribers who did not renew",
        hint: "Ended in the last 3 months and not renewed",
        filters: [
            { objId: "subscription", fieldId: "subscriptionCount",   op: "gte",         val: "1",            isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
            { objId: "subscription", fieldId: "renewalStatus",       op: "is",          val: ["Not renewed"], isAnchor: false },
            { objId: "subscription", fieldId: "subscriptionEndDate", op: "last_n_time", val: "3|months",     isAnchor: false },
        ] },
      { id: "sub_specific_plan",
        label: "Contacts who bought a specific plan",
        hint: "Fill in the plan name below",
        filters: [
            { objId: "subscription", fieldId: "purchaseCount",    op: "gte", val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
            { objId: "subscription", fieldId: "subscriptionPlan", op: "starts_with", val: "", isAnchor: false },
        ] },
      { id: "sub_gift",
        label: "Contacts who received a gift subscription",
        filters: [
            { objId: "subscription", fieldId: "subscriptionCount", op: "gte", val: "1",     isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
            { objId: "subscription", fieldId: "isGift",            op: "is",  val: ["Yes"], isAnchor: false },
        ] },
  ],

  campaign: [
      { id: "campaign_received",
        label: "Contacts who received a campaign",
        filters: [
            { objId: "campaign", fieldId: "campaignCount", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "campaign" },
            { objId: "campaign", fieldId: "campaignName",  op: "contains", val: "",  isAnchor: false },
        ] },
      { id: "campaign_clicked",
        label: "Contacts who clicked a campaign",
        filters: [
            { objId: "campaign", fieldId: "campaignCount", op: "gte",      val: "1",   isAnchor: true, anchorPolarity: "positive", anchorLevel: "campaign" },
            { objId: "campaign", fieldId: "campaignName",  op: "contains", val: "",    isAnchor: false },
            { objId: "campaign", fieldId: "hasClicked",    op: "is",       val: "Yes", isAnchor: false },
        ] },
      { id: "campaign_not_opened",
        label: "Contacts who didn't open a campaign",
        filters: [
            { objId: "campaign", fieldId: "campaignCount", op: "gte", val: "1",  isAnchor: true, anchorPolarity: "positive", anchorLevel: "campaign" },
            { objId: "campaign", fieldId: "hasOpened",     op: "is",  val: "No", isAnchor: false },
        ] },
  ],

  consent: [
      { id: "consent_optin",
        label: "Contacts who have opted in",
        filters: [
            { objId: "consent", fieldId: "consentStatus", op: "is", val: "Opt-in",
              isAnchor: true, anchorPolarity: "positive" },
        ] },
      { id: "consent_optout",
        label: "Contacts who have opted out",
        hint: "Suppression list for campaigns",
        filters: [
            { objId: "consent", fieldId: "consentStatus", op: "is", val: "Opt-out",
              isAnchor: true, anchorPolarity: "negative" },
        ] },
      { id: "consent_no_record",
        label: "Contacts with no consent record on file",
        hint: "Compliance gap — needs a permission campaign. Swap `is_empty` for the real unset/null operator if different.",
        filters: [
            { objId: "consent", fieldId: "consentStatus", op: "is_empty", val: "",
              isAnchor: true, anchorPolarity: "negative" },
        ] },
  ],
};

export default USE_CASES;

// // ─── USE CASES ────────────────────────────────────────────────────────────────
// //
// // Each use case now carries anchorLevel and (for consumptions) channelScope
// // on the anchor filter, so the AnchorRow renders the correct sentence
// // and the ContextualFieldPicker shows the right fields.
// //
// // Filter structure per object:
// //   isAnchor: true   → rendered by AnchorRow
// //   isAnchor: false  → rendered by FilterRow (refinement, level-aware)
// //
// // ─────────────────────────────────────────────────────────────────────────────

// const USE_CASES = {

//     contact: [
//         { id: "contact_all", label: "All my contacts",
//           filter: { objId: "contact", fieldId: "email", op: "contains", val: "" } },
//         { id: "contact_new", label: "New contacts (last 30 days)",
//           filter: { objId: "contact", fieldId: "createdAt", op: "last_n_time", val: "30|days" } },
//         { id: "contact_birthday", label: "Contacts with a birthday tomorrow",
//           filter: { objId: "contact", fieldId: "birthdate", op: "next_n_days", val: "1" } },
//     ],

//     consumptions: [
//         { id: "cons_buyers",
//           label: "Contacts who have made at least one purchase",
//           hint: "Counts across all channels",
//           filters: [
//               { objId: "consumptions", fieldId: "purchaseCount", op: "gte", val: "1",
//                 isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase", channelScope: "all" },
//           ] },
//         { id: "cons_non_buyers",
//           label: "Contacts who have never purchased",
//           filters: [
//               { objId: "consumptions", fieldId: "purchaseCount", op: "eq", val: "0",
//                 isAnchor: true, anchorPolarity: "negative", anchorLevel: "purchase", channelScope: "all" },
//           ] },
//         { id: "cons_repeat_event",
//           label: "Contacts who made multiple purchases for a specific event",
//           hint: "Ticketing channel — fill in the event name below",
//           filters: [
//               { objId: "consumptions", fieldId: "purchaseCount", op: "gte", val: "2",
//                 isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase", channelScope: "ticketing" },
//               { objId: "consumptions", fieldId: "eventName", op: "contains",    val: "",        isAnchor: false },
//               { objId: "consumptions", fieldId: "recency",   op: "last_n_time", val: "4|years", isAnchor: false },
//           ] },
//     ],

//     ticket: [
//         // ── Ticket anchor ─────────────────────────────────────────────────────
//         { id: "ticket_has_ticket",
//           label: "Contacts who have bought a ticket",
//           filters: [
//               { objId: "ticket", fieldId: "ticketCount", op: "gte", val: "1",
//                 isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
//           ] },
//         { id: "ticket_yesterday",
//           label: "Contacts who bought a ticket yesterday",
//           filters: [
//               { objId: "ticket", fieldId: "ticketCount",  op: "gte",                val: "1",      isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
//               { objId: "ticket", fieldId: "purchaseDate", op: "exactly_n_time_ago", val: "1|days", isAnchor: false },
//           ] },
//         { id: "ticket_specific_representation",
//           label: "Contacts who bought a ticket for a specific representation",
//           hint: "Fill in the representation name below",
//           filters: [
//               { objId: "ticket", fieldId: "ticketCount",        op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
//               { objId: "ticket", fieldId: "representationName", op: "contains", val: "",  isAnchor: false },
//           ] },
//         { id: "ticket_representation_tomorrow",
//           label: "Contacts who bought a ticket for a representation tomorrow",
//           filters: [
//               { objId: "ticket", fieldId: "ticketCount",        op: "gte",        val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
//               { objId: "ticket", fieldId: "representationDate", op: "next_n_days", val: "1", isAnchor: false },
//           ] },
//         { id: "ticket_multi_buyers_year",
//           label: "Multi-buyers this year",
//           hint: "More than 1 ticket and more than 3 representations in the last 12 months",
//           filters: [
//               { objId: "ticket", fieldId: "ticketCount",         op: "gt",         val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
//               { objId: "ticket", fieldId: "representationCount", op: "gt",         val: "3",         isAnchor: false },
//               { objId: "ticket", fieldId: "purchaseDate",        op: "last_n_time", val: "12|months", isAnchor: false },
//           ] },

//         // ── Purchase anchor ───────────────────────────────────────────────────
//         { id: "ticket_has_purchase",
//           label: "Contacts who have made a ticketing purchase",
//           filters: [
//               { objId: "ticket", fieldId: "purchaseCount", op: "gte", val: "1",
//                 isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
//           ] },
//         { id: "ticket_last_3_years",
//           label: "Contacts who made a purchase in the last 3 years",
//           filters: [
//               { objId: "ticket", fieldId: "purchaseCount", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
//               { objId: "ticket", fieldId: "purchaseDate",  op: "last_n_time", val: "3|years", isAnchor: false },
//           ] },
//         { id: "ticket_specific_event",
//           label: "Contacts who purchased a specific event",
//           hint: "Fill in the event name below",
//           filters: [
//               { objId: "ticket", fieldId: "purchaseCount", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
//               { objId: "ticket", fieldId: "eventName",     op: "contains", val: "",  isAnchor: false },
//           ] },
//     ],

//     order: [
//         { id: "order_buyers",
//           label: "Contacts who have made a purchase",
//           filters: [
//               { objId: "order", fieldId: "purchaseCount", op: "gte", val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
//               { objId: "order", fieldId: "orderStatus",   op: "is",  val: "Delivered", isAnchor: false },
//           ] },
//         { id: "order_specific_product",
//           label: "Contacts who ordered a specific product",
//           hint: "Fill in the product name below",
//           filters: [
//               { objId: "order", fieldId: "purchaseCount", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
//               { objId: "order", fieldId: "productName",   op: "contains", val: "",  isAnchor: false },
//           ] },
//     ],

//     subscription: [
//         { id: "sub_active",
//           label: "Contacts with an active subscription",
//           filters: [
//               { objId: "subscription", fieldId: "subscriptionCount",  op: "gte", val: "1",      isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
//               { objId: "subscription", fieldId: "subscriptionStatus", op: "is",  val: "Active", isAnchor: false },
//           ] },
//         { id: "sub_expiring",
//           label: "Subscriptions expiring in the next 30 days",
//           hint: "Good for renewal campaigns",
//           filters: [
//               { objId: "subscription", fieldId: "subscriptionCount", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
//               { objId: "subscription", fieldId: "endDate",           op: "next_n_time", val: "30|days", isAnchor: false },
//           ] },
//     ],

//     campaign: [
//         { id: "campaign_received",
//           label: "Contacts who received a campaign",
//           filters: [
//               { objId: "campaign", fieldId: "campaignName", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive" },
//               { objId: "campaign", fieldId: "campaignName", op: "contains", val: "",  isAnchor: false },
//           ] },
//         { id: "campaign_clicked",
//           label: "Contacts who clicked a campaign",
//           filters: [
//               { objId: "campaign", fieldId: "campaignName", op: "gte",      val: "1",   isAnchor: true, anchorPolarity: "positive" },
//               { objId: "campaign", fieldId: "campaignName", op: "contains", val: "",    isAnchor: false },
//               { objId: "campaign", fieldId: "hasClicked",   op: "is",       val: "Yes", isAnchor: false },
//           ] },
//         { id: "campaign_not_opened",
//           label: "Contacts who didn't open a campaign",
//           filters: [
//               { objId: "campaign", fieldId: "campaignName", op: "gte", val: "1",  isAnchor: true, anchorPolarity: "positive" },
//               { objId: "campaign", fieldId: "hasOpened",    op: "is",  val: "No", isAnchor: false },
//           ] },
//     ],

//     consent: [
//         { id: "consent_optin",
//           label: "Contacts who have opted in",
//           filters: [
//               { objId: "consent", fieldId: "consentStatus", op: "gte", val: "1",      isAnchor: true, anchorPolarity: "positive" },
//               { objId: "consent", fieldId: "consentStatus", op: "is",  val: "Opt-in", isAnchor: false },
//           ] },
//     ],

//     accessControl: [
//         { id: "ac_visited",
//           label: "Contacts who attended an event",
//           filters: [
//               { objId: "accessControl", fieldId: "numberOfControls", op: "gte", val: "1", isAnchor: true, anchorPolarity: "positive" },
//           ] },
//         { id: "ac_recent",
//           label: "Contacts who attended recently",
//           filters: [
//               { objId: "accessControl", fieldId: "numberOfControls", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive" },
//               { objId: "accessControl", fieldId: "createdAt",        op: "last_n_time", val: "30|days", isAnchor: false },
//           ] },
//     ],
// };

// export default USE_CASES;