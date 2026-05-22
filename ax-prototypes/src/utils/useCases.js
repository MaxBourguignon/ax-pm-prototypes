// ─── USE CASES ────────────────────────────────────────────────────────────────
//
// Each use case now carries anchorLevel and (for consumptions) channelScope
// on the anchor filter, so the AnchorRow renders the correct sentence
// and the ContextualFieldPicker shows the right fields.
//
// Filter structure per object:
//   isAnchor: true   → rendered by AnchorRow
//   isAnchor: false  → rendered by FilterRow (refinement, level-aware)
//
// ─────────────────────────────────────────────────────────────────────────────

const USE_CASES = {

    contact: [
        { id: "contact_all", label: "All my contacts",
          filter: { objId: "contact", fieldId: "email", op: "contains", val: "" } },
        { id: "contact_new", label: "New contacts (last 30 days)",
          filter: { objId: "contact", fieldId: "createdAt", op: "last_n_time", val: "30|days" } },
        { id: "contact_birthday", label: "Contacts with a birthday tomorrow",
          filter: { objId: "contact", fieldId: "birthdate", op: "next_n_days", val: "1" } },
    ],

    consumptions: [
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
        // ── Ticket anchor ─────────────────────────────────────────────────────
        { id: "ticket_has_ticket",
          label: "Contacts who have bought a ticket",
          filters: [
              { objId: "ticket", fieldId: "ticketCount", op: "gte", val: "1",
                isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
          ] },
        { id: "ticket_yesterday",
          label: "Contacts who bought a ticket yesterday",
          filters: [
              { objId: "ticket", fieldId: "ticketCount",  op: "gte",                val: "1",      isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
              { objId: "ticket", fieldId: "purchaseDate", op: "exactly_n_time_ago", val: "1|days", isAnchor: false },
          ] },
        { id: "ticket_specific_representation",
          label: "Contacts who bought a ticket for a specific representation",
          hint: "Fill in the representation name below",
          filters: [
              { objId: "ticket", fieldId: "ticketCount",        op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
              { objId: "ticket", fieldId: "representationName", op: "contains", val: "",  isAnchor: false },
          ] },
        { id: "ticket_representation_tomorrow",
          label: "Contacts who bought a ticket for a representation tomorrow",
          filters: [
              { objId: "ticket", fieldId: "ticketCount",        op: "gte",        val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
              { objId: "ticket", fieldId: "representationDate", op: "next_n_days", val: "1", isAnchor: false },
          ] },
        { id: "ticket_multi_buyers_year",
          label: "Multi-buyers this year",
          hint: "More than 1 ticket and more than 3 representations in the last 12 months",
          filters: [
              { objId: "ticket", fieldId: "ticketCount",         op: "gt",         val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "ticket" },
              { objId: "ticket", fieldId: "representationCount", op: "gt",         val: "3",         isAnchor: false },
              { objId: "ticket", fieldId: "purchaseDate",        op: "last_n_time", val: "12|months", isAnchor: false },
          ] },

        // ── Purchase anchor ───────────────────────────────────────────────────
        { id: "ticket_has_purchase",
          label: "Contacts who have made a ticketing purchase",
          filters: [
              { objId: "ticket", fieldId: "purchaseCount", op: "gte", val: "1",
                isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
          ] },
        { id: "ticket_last_3_years",
          label: "Contacts who made a purchase in the last 3 years",
          filters: [
              { objId: "ticket", fieldId: "purchaseCount", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
              { objId: "ticket", fieldId: "purchaseDate",  op: "last_n_time", val: "3|years", isAnchor: false },
          ] },
        { id: "ticket_specific_event",
          label: "Contacts who purchased a specific event",
          hint: "Fill in the event name below",
          filters: [
              { objId: "ticket", fieldId: "purchaseCount", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
              { objId: "ticket", fieldId: "eventName",     op: "contains", val: "",  isAnchor: false },
          ] },
    ],

    order: [
        { id: "order_buyers",
          label: "Contacts who have made a purchase",
          filters: [
              { objId: "order", fieldId: "purchaseCount", op: "gte", val: "1",         isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
              { objId: "order", fieldId: "orderStatus",   op: "is",  val: "Delivered", isAnchor: false },
          ] },
        { id: "order_specific_product",
          label: "Contacts who ordered a specific product",
          hint: "Fill in the product name below",
          filters: [
              { objId: "order", fieldId: "purchaseCount", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive", anchorLevel: "purchase" },
              { objId: "order", fieldId: "productName",   op: "contains", val: "",  isAnchor: false },
          ] },
    ],

    subscription: [
        { id: "sub_active",
          label: "Contacts with an active subscription",
          filters: [
              { objId: "subscription", fieldId: "subscriptionCount",  op: "gte", val: "1",      isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
              { objId: "subscription", fieldId: "subscriptionStatus", op: "is",  val: "Active", isAnchor: false },
          ] },
        { id: "sub_expiring",
          label: "Subscriptions expiring in the next 30 days",
          hint: "Good for renewal campaigns",
          filters: [
              { objId: "subscription", fieldId: "subscriptionCount", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive", anchorLevel: "subscription" },
              { objId: "subscription", fieldId: "endDate",           op: "next_n_time", val: "30|days", isAnchor: false },
          ] },
    ],

    campaign: [
        { id: "campaign_received",
          label: "Contacts who received a campaign",
          filters: [
              { objId: "campaign", fieldId: "campaignName", op: "gte",      val: "1", isAnchor: true, anchorPolarity: "positive" },
              { objId: "campaign", fieldId: "campaignName", op: "contains", val: "",  isAnchor: false },
          ] },
        { id: "campaign_clicked",
          label: "Contacts who clicked a campaign",
          filters: [
              { objId: "campaign", fieldId: "campaignName", op: "gte",      val: "1",   isAnchor: true, anchorPolarity: "positive" },
              { objId: "campaign", fieldId: "campaignName", op: "contains", val: "",    isAnchor: false },
              { objId: "campaign", fieldId: "hasClicked",   op: "is",       val: "Yes", isAnchor: false },
          ] },
        { id: "campaign_not_opened",
          label: "Contacts who didn't open a campaign",
          filters: [
              { objId: "campaign", fieldId: "campaignName", op: "gte", val: "1",  isAnchor: true, anchorPolarity: "positive" },
              { objId: "campaign", fieldId: "hasOpened",    op: "is",  val: "No", isAnchor: false },
          ] },
    ],

    consent: [
        { id: "consent_optin",
          label: "Contacts who have opted in",
          filters: [
              { objId: "consent", fieldId: "consentStatus", op: "gte", val: "1",      isAnchor: true, anchorPolarity: "positive" },
              { objId: "consent", fieldId: "consentStatus", op: "is",  val: "Opt-in", isAnchor: false },
          ] },
    ],

    accessControl: [
        { id: "ac_visited",
          label: "Contacts who attended an event",
          filters: [
              { objId: "accessControl", fieldId: "numberOfControls", op: "gte", val: "1", isAnchor: true, anchorPolarity: "positive" },
          ] },
        { id: "ac_recent",
          label: "Contacts who attended recently",
          filters: [
              { objId: "accessControl", fieldId: "numberOfControls", op: "gte",        val: "1",       isAnchor: true, anchorPolarity: "positive" },
              { objId: "accessControl", fieldId: "createdAt",        op: "last_n_time", val: "30|days", isAnchor: false },
          ] },
    ],
};

export default USE_CASES;