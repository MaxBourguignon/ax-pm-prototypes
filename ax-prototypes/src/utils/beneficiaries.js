/**
 * Mock beneficiary data — who each ticket line was bought FOR.
 *
 * contacts.json only records the buyer. Until the dataset carries a real
 * beneficiary, about 3 ticket lines in 10 are deterministically handed to
 * another contact of the base, so the buyer's "Beneficiary" column and the
 * beneficiary's "Received tickets" tab always tell the same story. A line with
 * no beneficiary was bought for the buyer themself.
 */
import contactsData from "../../contacts.json";

const CONTACTS = Array.isArray(contactsData) ? contactsData : [];

const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

const ref = (c) => ({
  id: c.id,
  name: `${c.identity?.firstName ?? ""} ${c.identity?.lastName ?? ""}`.trim() || c.id,
});

const beneficiaryFor = (buyer, ticket, index) => {
  const h = hash(`${buyer.id}:${ticket.purchaseId ?? ""}:${index}`);
  if (h % 10 >= 3) return null;
  const others = CONTACTS.filter((c) => c.id !== buyer.id);
  return others.length ? ref(others[h % others.length]) : null;
};

/* Every ticket line of the base, with its buyer and (when it differs) its beneficiary. */
const LINES = CONTACTS.flatMap((buyer) =>
  (buyer.tickets || []).map((t, i) => ({ ...t, buyer: ref(buyer), beneficiary: beneficiaryFor(buyer, t, i) })),
);

/* The contact's own purchases, each line carrying its beneficiary (null = themself). */
export const purchasedTickets = (contactId) => LINES.filter((t) => t.buyer.id === contactId);

/* Lines someone else bought for this contact. */
export const receivedTickets = (contactId) => LINES.filter((t) => t.beneficiary?.id === contactId);
