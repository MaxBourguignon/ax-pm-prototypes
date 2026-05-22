import { useState, useMemo, useRef } from "react";
import { NavLink, useParams } from "react-router";
import contactsData from '../../../contacts.json';
import MiniCards from "./MiniCards";

import DS from "../../utils/designSystem";
import Ico from "../../utils/icons";

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB');
};

const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatStatus = (status) => {
  if (!status) return '—';
  const isSuccess = status === 'Vendu';
  return (
    <div style={{
      color: isSuccess ? DS.green600 : DS.red600,
      backgroundColor: isSuccess ? DS.green100 : DS.red100,
      display: 'inline-flex',
      padding: '4px 12px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 400,
      whiteSpace: 'nowrap',
      fontFamily: DS.ff,
    }}>
      {isSuccess ? 'Sold' : status}
    </div>
  );
};

const Divider = () => (
  <div style={{ height: 1, background: DS.neutral200, width: '100%', flexShrink: 0 }} />
);

const BadgeAvatar = ({ initials }) => (
  <div style={{
    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
    background: DS.green100, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <span style={{ fontFamily: DS.ff, fontSize: 14, fontWeight: 600, color: DS.green600 }}>
      {initials}
    </span>
  </div>
);

const ListTag = ({ label }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px',
    borderRadius: 10, background: DS.blue100, border: `1px solid ${DS.blue500}`,
    fontFamily: DS.ff, fontSize: 12, fontWeight: 400, lineHeight: '20px',
    color: DS.blue800, whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

const FieldDisplay = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0 8px' }}>
    <span style={{ fontFamily: DS.ff, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: DS.neutral500, textAlign: 'left' }}>
      {label}
    </span>
    <div style={{ display: 'flex', height: 25, alignItems: 'center', marginBottom: '4px' }}>
      <span style={{ fontFamily: DS.ff, fontSize: 14, fontWeight: 400, lineHeight: '10px', color: DS.neutral900, textAlign: 'left' }}>
        {value || '—'}
      </span>
    </div>
  </div>
);

const Accordion = ({ title, open, onToggle, children }) => (
  <div style={{ width: '100%' }}>
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', height: 48, padding: 8, background: 'none', border: 'none',
      cursor: 'pointer', boxSizing: 'border-box',
    }}>
      <span style={{ fontFamily: DS.ff, fontSize: 18, fontWeight: 600, lineHeight: '28px', color: DS.blue800, textAlign: 'left' }}>
        {title}
      </span>
      {open ? <Ico.ChevDown color={DS.neutral500} size={20} /> : <Ico.ChevRight color={DS.neutral500} size={20} />}
    </button>
    {open && children}
  </div>
);

const ChevronToggle = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 20 20" fill="none"
    style={{ transition: 'transform .18s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}
  >
    <path d="M7.5 5l5 5-5 5" stroke={DS.blue500} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Regroupe les tickets par panier (basketId ou, à défaut, par date+event)
function groupTickets(tickets) {
  const map = new Map();
  tickets.forEach((t) => {
    const key = t.basketId || `${t.purchaseDate}__${t.event}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        purchaseDate: t.purchaseDate,
        event: t.event,
        type: t.type,
        status: t.status,
        items: [],
      });
    }
    map.get(key).items.push(t);
  });

  return Array.from(map.values()).map((basket) => ({
    ...basket,
    totalAmount: basket.items.reduce((sum, t) => sum + (t.total ?? t.price * (t.quantity || 1) ?? 0), 0),
    totalQty: basket.items.reduce((sum, t) => sum + (t.quantity || 1), 0),
    currency: basket.items[0]?.currency || 'EUR',
  }));
}

const PanelTab = ({ label, active, onClick }) => (
  <div>
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start',
      background: 'none', border: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ paddingTop: 12, paddingLeft: 16, paddingRight: 16 }}>
        <span style={{
          fontFamily: DS.ff, fontSize: 14, fontWeight: 400, lineHeight: '24px',
          color: active ? DS.blue500 : '#242731', whiteSpace: 'nowrap', display: 'block', textAlign: 'left',
        }}>
          {label}
        </span>
      </div>
    </button>
    {active && <div style={{ height: 4, width: '100%', background: '#007aff' }} />}
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────

function computeSpending(tickets = [], contributions = []) {
  let tickets_total = 0, subs_total = 0, merch_total = 0;
  tickets.forEach(t => { tickets_total += t.total ?? t.price * (t.quantity || 1) ?? 0; });
  contributions.forEach(c => {
    if (c.category === 'Subscription') subs_total += c.amount ?? 0;
    else merch_total += c.amount ?? 0;
  });
  const grand = tickets_total + subs_total + merch_total;
  return { grand, tickets_total, subs_total, merch_total };
}

function computeEngagement(campaigns = []) {
  const total = campaigns.length;
  const opened = campaigns.filter(c => c.openedAt).length;
  const clicked = campaigns.filter(c => c.clickedAt).length;
  const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
  const clickRate = total > 0 ? Math.round((clicked / total) * 100) : 0;
  return { total, opened, openRate, clickRate };
}

// ── DonutChart ────────────────────────────────────────────────────────────

function DonutChart({ segments, onHover, onLeave }) {
  const size = 160, cx = 80, cy = 80, r = 62, stroke = 16;
  let offset = -Math.PI / 2;

  const arcs = segments.map(({ value, color, dimmed }, i) => {
    const angle = (value / 100) * 2 * Math.PI;
    const startX = cx + r * Math.cos(offset);
    const startY = cy + r * Math.sin(offset);
    offset += angle;
    const endX = cx + r * Math.cos(offset);
    const endY = cy + r * Math.sin(offset);
    const large = angle > Math.PI ? 1 : 0;
    return {
      d: `M ${startX} ${startY} A ${r} ${r} 0 ${large} 1 ${endX} ${endY}`,
      color: dimmed ? color + '40' : color,
      i,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible' }}>
      {arcs.map((arc) => (
        <path
          key={arc.i}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          style={{ transition: 'stroke .15s', cursor: 'default' }}
          onMouseEnter={(e) => onHover?.(arc.i, e)}
          onMouseLeave={() => onLeave?.()}
        />
      ))}
    </svg>
  );
}

// ── CardSpending ──────────────────────────────────────────────────────────
function CardSpending({ tickets = [], contributions = [] }) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const { grand, tickets_total, subs_total, merch_total } = computeSpending(tickets, contributions);
  const pct = (v) => grand > 0 ? Math.round((v / grand) * 100) : 0;

  const categories = [
    { label: 'Tickets', color: DS.blue500, amount: tickets_total, p: pct(tickets_total) },
    { label: 'Subscriptions', color: DS.green600, amount: subs_total, p: pct(subs_total) },
    { label: 'Merch', color: '#F59E0B', amount: merch_total, p: pct(merch_total) },
  ];

  const active = hovered !== null ? categories[hovered] : null;

  const handleHover = (i, e) => {
    const rect = cardRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top - 72,
    });
    setHovered(i);
  };

  return (
    <div ref={cardRef} style={{
      flex: 1, background: DS.neutral0, border: `1px solid ${DS.neutral200}`,
      borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <span style={{ fontFamily: DS.ff, fontSize: 16, fontWeight: 400, color: DS.neutral500 }}>
        SPENDINGS
      </span>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <DonutChart
            segments={categories.map((c, i) => ({
              value: c.p, color: c.color,
              dimmed: hovered !== null && hovered !== i,
            }))}
            onHover={handleHover}
            onLeave={() => setHovered(null)}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: DS.ff, fontSize: 16, fontWeight: 600, color: DS.neutral900 }}>
              {formatCurrency(grand)}
            </span>
            <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>
              total
            </span>
          </div>
        </div>
      </div>

      {active && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x,
          top: tooltipPos.y,
          background: DS.neutral0,
          border: `1px solid ${DS.neutral200}`,
          borderRadius: 8,
          padding: '10px 14px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: active.color, flexShrink: 0 }} />
            <span style={{ fontFamily: DS.ff, fontSize: 12, color: DS.neutral500 }}>{active.label}</span>
          </div>
          <span style={{ fontFamily: DS.ff, fontSize: 18, fontWeight: 600, color: DS.neutral900, display: 'block' }}>
            {formatCurrency(active.amount)}
          </span>
          <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500 }}>
            {active.p}% of total
          </span>
        </div>
      )}
    </div>
  );
}

// ── CardEngagement ────────────────────────────────────────────────────────

function CardEngagement({ campaigns = [] }) {
  const { total, opened, openRate, clickRate } = computeEngagement(campaigns);

  const bars = [
    { label: 'Open rate', value: openRate, display: `${openRate}%`, color: DS.blue500 },
    { label: 'Click rate', value: clickRate, display: `${clickRate}%`, color: DS.green600 },
    { label: 'Campaigns sent', value: 100, display: `${total}`, color: DS.neutral200 },
  ];

  return (
    <div style={{
      flex: 1, background: DS.neutral0, border: `1px solid ${DS.neutral200}`,
      borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column',
    }}>
      <span style={{ fontFamily: DS.ff, fontSize: 16, fontWeight: 400, color: DS.neutral500 }}>
        ENGAGEMENT
      </span>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ fontFamily: DS.ff, fontSize: 32, fontWeight: 600, color: DS.neutral900, lineHeight: 1 }}>
            {openRate}
          </span>
          <span style={{ fontFamily: DS.ff, fontSize: 18, fontWeight: 400, color: DS.neutral500 }}>%</span>
        </div>
        <span style={{ fontFamily: DS.ff, fontSize: 12, color: DS.neutral500 }}>
          {opened} / {total} opened
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {bars.map(({ label, value, display, color }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: DS.ff, fontSize: 12, color: DS.neutral500 }}>{label}</span>
              <span style={{ fontFamily: DS.ff, fontSize: 12, fontWeight: 500, color: DS.neutral900 }}>{display}</span>
            </div>
            <div style={{ height: 6, background: DS.blue100, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const DataTable = ({ columns, rows, tickets }) => {
  const [openBaskets, setOpenBaskets] = useState({});

  const toggle = (key) =>
    setOpenBaskets((prev) => ({ ...prev, [key]: !prev[key] }));

  const baskets = useMemo(
    () => (tickets ? groupTickets(tickets) : []),
    [tickets]
  );

  if (tickets) {

    if (baskets.length === 0) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <span style={{ fontFamily: DS.ff, fontSize: 14, color: DS.neutral500 }}>
            No data available
          </span>
        </div>
      );
    }

    const cell = (content, extra = {}) => ({
      fontFamily: DS.ff, fontSize: 12, fontWeight: 400,
      lineHeight: '16px', color: '#000', whiteSpace: 'nowrap', ...extra,
    });

    const th = {
      background: DS.blue100, border: `0.2px solid ${DS.neutral200}`,
      padding: '0 12px', height: 50,
      fontFamily: DS.ff, fontSize: 14, fontWeight: 600,
      lineHeight: '20px', color: DS.neutral900, whiteSpace: 'nowrap',
      textAlign: 'left',
    };

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              {/* Colonnes réduites : toggle | Date | Événement | Qté | Total | Statut */}
              <th style={{ ...th, width: 36 }} />
              <th style={th}>Purchase date</th>
              <th style={th}>Event</th>
              <th style={{ ...th, textAlign: 'right' }}>Quantity</th>
              <th style={{ ...th, textAlign: 'right' }}>Total</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {baskets.map((basket) => {
              const isOpen = !!openBaskets[basket.key];
              const rowBg = isOpen ? DS.blue100 : DS.neutral0;

              return (
                <>
                  {/* ── Ligne panier (parent) ── */}
                  <tr
                    key={`basket-${basket.key}`}
                    onClick={() => toggle(basket.key)}
                    style={{ cursor: 'pointer', background: rowBg }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = DS.blue100; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = DS.neutral0; }}
                  >
                    {/* Chevron */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 10px', height: 40, width: 36, textAlign: 'center',
                    }}>
                      <ChevronToggle open={isOpen} />
                    </td>

                    {/* Date d'achat */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 12px', height: 40,
                    }}>
                      <span style={cell(null, { fontWeight: 500 })}>
                        {formatDate(basket.purchaseDate)}
                      </span>
                    </td>

                    {/* Événement */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 12px', height: 40,
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={cell(null, { fontWeight: 500, color: DS.neutral900 })}>
                          {basket.event || '—'}
                        </span>
                        {basket.type && (
                          <span style={{ fontFamily: DS.ff, fontSize: 11, color: DS.neutral500, lineHeight: '14px' }}>
                            {basket.type}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Qté totale */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 12px', height: 40, textAlign: 'right',
                    }}>
                      <span style={cell(null, { color: DS.neutral500 })}>
                        {basket.totalQty} ticket{basket.totalQty > 1 ? 's' : ''}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 12px', height: 40, textAlign: 'right',
                    }}>
                      <span style={cell(null, { fontWeight: 600, color: DS.neutral900 })}>
                        {formatCurrency(basket.totalAmount, basket.currency)}
                      </span>
                    </td>

                    {/* Statut */}
                    <td style={{
                      borderLeft: `0.5px solid ${DS.neutral200}`,
                      borderTop: `0.5px solid ${DS.neutral200}`,
                      padding: '0 12px', height: 40,
                    }}>
                      {formatStatus(basket.status)}
                    </td>
                  </tr>

                  {/* ── Lignes tickets (enfants) — visibles si panier ouvert ── */}
                  {isOpen && basket.items.map((t, idx) => (
                    <tr
                      key={`ticket-${basket.key}-${idx}`}
                      style={{ background: '#F5F8FF' }}
                    >
                      {/* Indent visuel */}
                      <td style={{
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: 0, width: 36,
                      }}>
                        {/* Trait vertical gauche */}
                        <div style={{
                          width: 3, height: '100%', minHeight: 36,
                          background: DS.blue300, marginLeft: 'auto',
                        }} />
                      </td>

                      {/* Date de l'événement (à la place de la date d'achat) */}
                      <td style={{
                        borderLeft: `0.5px solid ${DS.neutral200}`,
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: '0 12px', height: 36,
                      }}>
                        <span style={{ ...cell(), color: DS.neutral500 }}>
                          {formatDate(t.eventDate)}
                        </span>
                      </td>

                      {/* Catégorie/tarif */}
                      <td style={{
                        borderLeft: `0.5px solid ${DS.neutral200}`,
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: '0 12px', height: 36,
                      }}>
                        <span style={cell()}>
                          {t.category || t.label || '—'}
                        </span>
                      </td>

                      {/* Qté */}
                      <td style={{
                        borderLeft: `0.5px solid ${DS.neutral200}`,
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: '0 12px', height: 36, textAlign: 'right',
                      }}>
                        <span style={cell()}>{t.quantity || 1}</span>
                      </td>

                      {/* Prix unitaire */}
                      <td style={{
                        borderLeft: `0.5px solid ${DS.neutral200}`,
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: '0 12px', height: 36, textAlign: 'right',
                      }}>
                        <span style={cell()}>{formatCurrency(t.price)}</span>
                      </td>

                      {/* Statut individuel */}
                      <td style={{
                        borderLeft: `0.5px solid ${DS.neutral200}`,
                        borderTop: `0.5px solid ${DS.neutral200}`,
                        padding: '0 12px', height: 36,
                      }}>
                        {formatStatus(t.status)}
                      </td>
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Mode générique (autres onglets : campagnes, consentements…) ──
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                background: DS.blue100, border: `0.2px solid ${DS.neutral200}`,
                padding: '0 10px', height: 50, textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: DS.ff, fontSize: 14, fontWeight: 600, lineHeight: '20px', color: DS.neutral900, whiteSpace: 'nowrap' }}>
                    {col.label}
                  </span>
                  <Ico.SortUp />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}
              onMouseEnter={e => e.currentTarget.style.background = DS.blue100}
              onMouseLeave={e => e.currentTarget.style.background = DS.neutral0}
            >
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  background: 'inherit', borderLeft: `0.5px solid ${DS.neutral200}`,
                  borderTop: `0.5px solid ${DS.neutral200}`, padding: '0 10px', height: 36,
                  textAlign: columns[ci]?.align || 'left',
                }}>
                  <span style={{ fontFamily: DS.ff, fontSize: 12, fontWeight: 400, lineHeight: '16px', color: '#000', whiteSpace: 'nowrap' }}>
                    {cell}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function ContactRecord({ selectedContact, onClose }) {
  const [infoOpen, setInfoOpen] = useState(true);
  const [coordOpen, setCoordOpen] = useState(true);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [listesOpen, setListesOpen] = useState(true);
  const [consentOpen, setConsentOpen] = useState(true);
  const [prefOpen, setPrefOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  const { id } = useParams();
  const contactId = selectedContact?.id || id;

  const contact = useMemo(() => {
    if (!contactId || !Array.isArray(contactsData)) return null;
    return contactsData.find(c => c.id === contactId);
  }, [contactId]);

  const contactData = useMemo(() => {
    if (!contact) return null;
    return {
      name: `${contact.identity?.firstName || ''} ${contact.identity?.lastName || ''}`.trim(),
      initials: contact.initials || '??',
      info: [
        { label: 'Email', value: contact.identity?.email },
        { label: 'Last name', value: contact.identity?.lastName },
        { label: 'First name', value: contact.identity?.firstName },
        { label: 'Date of birth', value: formatDate(contact.identity?.dateOfBirth) },
        { label: 'Age', value: contact.identity?.age },
        { label: 'Gender', value: contact.identity?.gender },
      ],
      coords: [
        { label: 'Phone', value: contact.coordinates?.phone },
        { label: 'Address', value: contact.coordinates?.address },
        { label: 'Postal code', value: contact.coordinates?.postalCode },
        { label: 'Country', value: contact.coordinates?.country },
      ],
      preferences: (contact.preferences || []).map(p => ({
        label: p.label,
        value: p.value,
      })),
      source: [
        { label: 'Creation date', value: formatDate(contact.source?.createdAt) },
        { label: 'Acquisition source', value: contact.source?.acquisitionSource },
      ],
      lists: contact.lists || [],
      consents: (contact.consents || []).map(c => ({
        label: c.label,
        date: `Since ${formatDate(c.grantedSince)}`,
      })),
      structure: contact.structure || '—',
      stats: contact.stats || {}
    };
  }, [contact]);

  const TABS = useMemo(() => {
    if (!contact) return {};
    return {
      tickets: {
        cols: [
          { label: "Purchase date" },
          { label: "Event type" },
          { label: "Event" },
          { label: "Event date" },
          { label: "Price", align: "right" },
          { label: "Quantity", align: "right" },
          { label: "Status" },
          { label: "Total", align: "right" },
        ],
        rows: (contact.tickets || []).map(t => [
          formatDate(t.purchaseDate),
          t.type || '—',
          t.event || '—',
          formatDate(t.eventDate),
          formatCurrency(t.price),
          t.quantity || '—',
          formatStatus(t.status),
          formatCurrency(t.total),
        ]),
      },
      campaigns: {
        cols: [
          { label: "Campaign name" },
          { label: "Type" },
          { label: "Send date" },
          { label: "Received" },
          { label: "Opened" },
        ],
        rows: (contact.campaigns || []).map(c => [
          c.name || '—',
          c.type || '—',
          formatDate(c.sentAt),
          formatDate(c.receivedAt),
          c.openedAt ? formatDate(c.openedAt) : '—',
        ]),
      },
      consents: {
        cols: [
          { label: "Consent type" },
          { label: "Action" },
          { label: "Action date" },
          { label: "Channel" }
        ],
        rows: (contact.consents || []).map(c => [
          c.label || '—',
          'optin',
          formatDate(c.grantedSince),
          'Email',
        ]),
      },
      access: {
        cols: [
          { label: "Role" },
          { label: "Structure" },
          { label: "Assigned on" },
          { label: "Assigned by" },
          { label: "Status" },
        ],
        rows: (contact.accessControls || []).map(a => [
          a.role || '—',
          a.structure || '—',
          formatDate(a.assignedAt),
          a.assignedBy || '—',
          a.status || '—',
        ]),
      },
      contributions: {
        cols: [
          { label: "Product" },
          { label: "Category" },
          { label: "Date" },
          { label: "Quantity", align: "right" },
          { label: "Amount", align: "right" },
        ],
        rows: (contact.contributions || []).map(c => [
          c.product || '—',
          c.category || '—',
          formatDate(c.purchaseDate),
          c.quantity || '—',
          formatCurrency(c.amount),
        ]),
      },
    };
  }, [contact]);

  const panelTabs = [
    { id: 'tickets', label: 'Purchase history' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'consents', label: 'Consents' },
    { id: 'access', label: "Access controls" },
    { id: 'contributions', label: 'Contributions' },
  ];

  if (!contact || !contactData) {
    return (
      <div style={{
        fontFamily: DS.ff, minHeight: '100vh', background: DS.neutral100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 16, color: DS.neutral500 }}>
          {contactId ? `Contact "${contactId}" not found` : 'No contact selected'}
        </span>
        {onClose && (
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 4, border: `1px solid ${DS.neutral200}`,
            background: DS.neutral0, cursor: 'pointer', fontFamily: DS.ff, fontSize: 14, color: DS.neutral900,
          }}>
            ← Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: DS.ff, minHeight: '100vh', background: DS.neutral100, display: 'flex', flexDirection: 'column' }}>
      {onClose && (
        <div style={{ padding: 16, background: DS.neutral0, borderBottom: `1px solid ${DS.neutral200}` }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 6, border: `1px solid ${DS.neutral200}`,
            background: DS.neutral0, cursor: 'pointer', fontFamily: DS.ff, fontSize: 14, color: DS.neutral900,
          }}>
            ← Back
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left sidebar */}
        <div style={{
          width: 280, flexShrink: 0, background: DS.neutral0,
          borderRight: `1px solid ${DS.neutral200}`, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 10px 16px' }}>
            <NavLink to="/contacts"><Ico.ArrowBack /></NavLink>
            <BadgeAvatar initials={contactData.initials} />
            <span style={{ fontFamily: DS.ff, fontSize: 18, fontWeight: 600, lineHeight: '28px', color: '#000', textAlign: 'left', flex: 1 }}>
              {contactData.name}
            </span>
            <Ico.Dots />
          </div>
          <Divider />

          <Accordion title="Information" open={infoOpen} onToggle={() => setInfoOpen(o => !o)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {contactData.info.map((f, i) => <FieldDisplay key={i} {...f} />)}
            </div>
          </Accordion>

          <Accordion title="Coordinates" open={coordOpen} onToggle={() => setCoordOpen(o => !o)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {contactData.coords.map((f, i) => <FieldDisplay key={i} {...f} />)}
            </div>
          </Accordion>

          <Accordion title="Preferences" open={prefOpen} onToggle={() => setPrefOpen(o => !o)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {contactData.preferences.map((f, i) => <FieldDisplay key={i} {...f} />)}
            </div>
          </Accordion>

          <Accordion title="Source" open={sourceOpen} onToggle={() => setSourceOpen(o => !o)}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {contactData.source.map((f, i) => <FieldDisplay key={i} {...f} />)}
            </div>
          </Accordion>

          <Accordion title="Notes" open={notesOpen} onToggle={() => setNotesOpen(o => !o)}>
            <div style={{ padding: '0 10px 12px' }}>
              <textarea placeholder="Add a note…" style={{
                width: '100%', height: 120, minHeight: 80, background: DS.neutral100,
                border: `1px solid ${DS.neutral200}`, borderRadius: 4, padding: '10px 15px',
                resize: 'vertical', fontFamily: DS.ff, fontSize: 14, fontWeight: 400,
                lineHeight: '20px', color: DS.neutral500, boxSizing: 'border-box', outline: 'none', textAlign: 'left',
              }} />
            </div>
          </Accordion>
        </div>

        {/* Center column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: DS.neutral0 }}>

          <MiniCards
            tickets={contact.tickets || []}
            contributions={contact.contributions || []}
            campaigns={contact.campaigns || []}
            consents={contact.consents || []}
            accessControls={contact.accessControls || []}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div style={{
            background: DS.neutral0,
            borderBottom: `1px solid ${DS.neutral200}`,
            display: 'flex',
            alignItems: 'flex-start',
            padding: '0 6px',
            flexShrink: 0,
            marginTop: 16,
            position: 'relative', // Add this
            zIndex: 1, // Add this
          }}>
            {panelTabs.map(t => (
              <PanelTab key={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
            ))}
          </div>

          <div style={{ padding: 16 }}>
            <div style={{ background: DS.neutral0, border: `0.5px solid ${DS.neutral200}`, overflow: 'hidden' }}>
              {activeTab === 'tickets' ? (
                <DataTable tickets={contact.tickets || []} />
              ) : TABS[activeTab] && TABS[activeTab].rows.length > 0 ? (
                <DataTable columns={TABS[activeTab].cols} rows={TABS[activeTab].rows} />
              ) : (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <span style={{ fontFamily: DS.ff, fontSize: 14, color: DS.neutral500 }}>No data available</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{
          width: 280, flexShrink: 0, background: DS.neutral0,
          borderLeft: `1px solid ${DS.neutral200}`, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>
          <Accordion title="Roles & structures" open={rolesOpen} onToggle={() => setRolesOpen(o => !o)}>
            <div style={{ padding: '0 10px 12px' }}>
              <FieldDisplay label="Structure" value={contactData.structure} />
            </div>
          </Accordion>

          <Accordion title="Lists" open={listesOpen} onToggle={() => setListesOpen(o => !o)}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 8px 12px' }}>
              {contactData.lists.length > 0 ? (
                contactData.lists.map((l, i) => <ListTag key={i} label={l} />)
              ) : (
                <span style={{ fontFamily: DS.ff, fontSize: 14, color: DS.neutral500 }}>No lists</span>
              )}
            </div>
          </Accordion>

          <Accordion title="Consents" open={consentOpen} onToggle={() => setConsentOpen(o => !o)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px' }}>
              {contactData.consents.length > 0 ? (
                contactData.consents.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 40 }}>
                      <span style={{ fontFamily: DS.ff, fontSize: 14, fontWeight: 400, lineHeight: '20px', color: DS.neutral900, textAlign: 'left' }}>
                        {c.label}
                      </span>
                      <span style={{ fontFamily: DS.ff, fontSize: 12, fontWeight: 400, lineHeight: '16px', color: DS.neutral500, textAlign: 'left' }}>
                        {c.date}
                      </span>
                    </div>
                    <span style={{ width: "10px", height: "10px", backgroundColor: DS.green100, borderRadius: '50%' }} />
                  </div>
                ))
              ) : (
                <span style={{ fontFamily: DS.ff, fontSize: 14, color: DS.neutral500 }}>No consents</span>
              )}
            </div>
          </Accordion>

        </div>
      </div>
    </div>
  );
}