import React from 'react';
import DS from '../../utils/designSystem';

/* =====================================================================
   Arenametrix — Colors & Type
   ---------------------------------------------------------------------
   All tokens derived from the official "AX Design System (NEW)" Figma.
   Brand: French CRM platform for sports/cultural venues, donor &
   audience management. Inter-only typography. Blue-primary palette,
   teal+blue brand gradient, soft orange + coral accents from the
   "A" logo monogram.
   ===================================================================== */
   
// ═══════════════════════════════════════════════════════════════════════
// SECTION 1 — BASE ATOMS (components.jsx)
// ═══════════════════════════════════════════════════════════════════════


// data.js — mock data for Consent Management V3.
// "Today" anchor: 13 May 2026 — values are realistic for a French sports/cultural CRM.
// Wrapped in an IIFE so top-level identifiers don't leak into the shared
// script scope (Babel-transpiled scripts share globals, which would collide).
(function () {

  const CONSENT_COLORS = {
    "newsletter-public": DS.blue500,
    "newsletter-vip":    DS.indigoBrand,
    "activites":         DS.orange,
    "sms":               DS.coral,
    "whatsapp":          DS.greenBrand,
  };
  
  // 13 monthly points: May-2025 → May-2026 (the 13th point is "today, partial month").
  const MONTH_LABELS_FR = [
    "Mai 25", "Juin 25", "Juil. 25", "Août 25", "Sept. 25", "Oct. 25",
    "Nov. 25", "Déc. 25", "Janv. 26", "Févr. 26", "Mars 26", "Avr. 26", "Mai 26",
  ];
  
  const CONSENTS = [
    {
      id: "newsletter-public",
      name: "Newsletter Public",
      channel: "Email",
      description:
        "Newsletter mensuelle envoyée à l'ensemble du public ayant opté pour les communications marketing : actualités du club, billetterie, contenus rédactionnels.",
      createdAt: "2022-09-14",
      createdBy: "Camille Rousseau",
      contactsTotal: 18420,
      series: [14210, 14580, 14930, 15270, 15640, 16020, 16380, 16740, 17120, 17480, 17820, 18180, 18420],
      legalBasis: "Consentement explicite (Art. 6.1.a RGPD)",
      doubleOptIn: true,
      auditLog: [
        { author: "Camille Rousseau",    date: "2026-04-22", change: "Mise à jour du libellé d'opt-in dans le formulaire d'inscription site." },
        { author: "Maxence Bourguignon", date: "2026-02-08", change: "Activation du double opt-in pour la newsletter." },
        { author: "Léa Garcia",          date: "2025-11-30", change: "Synchronisation avec la liste 'Abonnés saison 25/26'." },
        { author: "Camille Rousseau",    date: "2025-09-04", change: "Ajout des contacts importés via Brevo (4 219 contacts)." },
        { author: "Camille Rousseau",    date: "2022-09-14", change: "Création du consentement." },
      ],
    },
    {
      id: "newsletter-vip",
      name: "Newsletter VIP & Loges",
      channel: "Email",
      description:
        "Communications exclusives à destination des détenteurs d'abonnements VIP, loges et hospitalités : invitations privées, avant-premières billetterie.",
      createdAt: "2023-06-02",
      createdBy: "Thomas Léveillé",
      contactsTotal: 1284,
      series: [1102, 1118, 1140, 1158, 1172, 1190, 1208, 1224, 1238, 1252, 1264, 1278, 1284],
      legalBasis: "Consentement explicite (Art. 6.1.a RGPD)",
      doubleOptIn: true,
      auditLog: [
        { author: "Thomas Léveillé", date: "2026-05-04", change: "Ajout de 12 contacts saisis manuellement (renouvellements de loges)." },
        { author: "Thomas Léveillé", date: "2026-01-15", change: "Modification de la description (mention des avant-premières)." },
        { author: "Léa Garcia",      date: "2025-08-18", change: "Création du consentement." },
      ],
    },
    {
      id: "activites",
      name: "Activités & événements partenaires",
      channel: "Email",
      description:
        "Annonces d'événements organisés en partenariat avec les sponsors et les organisations partenaires du club (tournois, stages, animations grand public).",
      createdAt: "2024-01-18",
      createdBy: "Léa Garcia",
      contactsTotal: 6842,
      series: [5210, 5380, 5520, 5680, 5810, 5940, 6080, 6210, 6340, 6470, 6590, 6720, 6842],
      legalBasis: "Consentement explicite (Art. 6.1.a RGPD)",
      doubleOptIn: false,
      auditLog: [
        { author: "Léa Garcia",          date: "2026-03-11", change: "Désactivation du double opt-in suite à validation DPO." },
        { author: "Maxence Bourguignon", date: "2025-12-02", change: "Renommage : 'Activités' → 'Activités & événements partenaires'." },
        { author: "Léa Garcia",          date: "2024-01-18", change: "Création du consentement." },
      ],
    },
    {
      id: "sms",
      name: "SMS",
      channel: "SMS",
      description:
        "Notifications SMS transactionnelles & marketing : rappels de match, alertes billetterie, codes d'accès. Coût par envoi — consentement à privilégier.",
      createdAt: "2021-03-29",
      createdBy: "Maxence Bourguignon",
      contactsTotal: 2486,
      series: [4120, 4040, 3920, 3810, 3690, 3540, 3380, 3210, 3050, 2890, 2740, 2610, 2486],
      legalBasis: "Consentement explicite (Art. 6.1.a RGPD)",
      doubleOptIn: false,
      auditLog: [
        { author: "Maxence Bourguignon", date: "2026-04-30", change: "Nettoyage : suppression de 312 contacts dont le téléphone n'est plus valide." },
        { author: "Camille Rousseau",    date: "2026-02-15", change: "Désinscription en masse suite à campagne mal ciblée (−480 contacts)." },
        { author: "Maxence Bourguignon", date: "2025-09-22", change: "Mise à jour du texte d'opt-in suite à audit CNIL." },
        { author: "Maxence Bourguignon", date: "2021-03-29", change: "Création du consentement." },
      ],
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      channel: "WhatsApp",
      description:
        "Canal WhatsApp Business — communications conversationnelles pilotes avec les abonnés Premium. Phase de test, aucune campagne lancée pour le moment.",
      createdAt: "2026-04-29",
      createdBy: "Maxence Bourguignon",
      contactsTotal: 0,
      series: [null, null, null, null, null, null, null, null, null, null, null, 0, 0],
      legalBasis: "Consentement explicite (Art. 6.1.a RGPD) — en attente d'activation",
      doubleOptIn: true,
      auditLog: [
        { author: "Maxence Bourguignon", date: "2026-04-29", change: "Création du consentement (canal en phase pilote, opt-in non publié)." },
      ],
    },
  ];
  
  const DEFAULT_CHART_SELECTION = ["newsletter-public", "newsletter-vip", "activites", "sms"];
  
  const DATE_RANGES = [
    { id: "3m",  label: "3 mois",       months: 3 },
    { id: "6m",  label: "6 mois",       months: 6 },
    { id: "12m", label: "12 mois",      months: 12 },
    { id: "ytd", label: "Depuis 01/01", months: 5 },
  ];
  
  window.AX_DATA = {
    CONSENTS,
    CONSENT_COLORS,
    MONTH_LABELS_FR,
    DEFAULT_CHART_SELECTION,
    DATE_RANGES,
  };
  
  })();

// ──────────────────────────── Icons ───────────────────────────────────
const AxIconPaths = {
  plus:         <path d="M12 5v14M5 12h14" />,
  search:       <g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></g>,
  funnel:       <path d="M4 4h16l-6 8v6l-4 2v-8z" />,
  mail:         <g><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></g>,
  user:         <g><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></g>,
  userPlus:     <g><circle cx="9" cy="8" r="4"/><path d="M3 21a8 8 0 0 1 12-6"/><path d="M18 14v6M15 17h6"/></g>,
  userMinus:    <g><circle cx="9" cy="8" r="4"/><path d="M3 21a8 8 0 0 1 12-6"/><path d="M15 17h6"/></g>,
  organization: <g><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h2M8 12h2M14 8h2M14 12h2M14 16h2M8 16h2"/><path d="M11 21v-4h2v4"/></g>,
  ticket:       <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/>,
  card:         <g><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></g>,
  tag:          <g><path d="M3 12L12 3h8v8l-9 9z"/><circle cx="15" cy="9" r="1.5"/></g>,
  bookmark:     <path d="M6 4h12v17l-6-4-6 4z"/>,
  settings:     <g><circle cx="12" cy="12" r="3"/><path d="M19.4 13.6a7 7 0 0 0 0-3.2l2.1-1.6-2-3.4-2.5.9a7 7 0 0 0-2.8-1.6L13.6 2h-3.2l-.6 2.7a7 7 0 0 0-2.8 1.6l-2.5-.9-2 3.4 2.1 1.6a7 7 0 0 0 0 3.2L2.5 15.2l2 3.4 2.5-.9a7 7 0 0 0 2.8 1.6l.6 2.7h3.2l.6-2.7a7 7 0 0 0 2.8-1.6l2.5.9 2-3.4z"/></g>,
  eye:          <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></g>,
  download:     <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16"/>,
  trash:        <g><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></g>,
  check:        <polyline points="5 12 10 17 19 7"/>,
  x:            <path d="M6 6l12 12M18 6L6 18"/>,
  chevronDown:  <path d="M6 9l6 6 6-6"/>,
  chevronLeft:  <path d="M15 18l-6-6 6-6"/>,
  chevronRight: <path d="M9 18l6-6-6-6"/>,
  arrowDown:    <path d="M12 4v16m0 0l-6-6m6 6l6-6"/>,
  arrowBack:    <path d="M19 12H5m0 0l6-6m-6 6l6 6"/>,
  dots:         <g><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></g>,
  campaigns:    <path d="M3 11l18-7-5 18-4-8-9-3z"/>,
  aiSparkles:   <g><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/></g>,
  academy:      <g><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4"/></g>,
  zoomQuestion: <g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M9.5 9.5a2 2 0 1 1 2.5 2c-.6.4-1 1-1 1.5"/><circle cx="11" cy="14.5" r="0.4"/></g>,
  clipboard:    <g><rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></g>,
  directions:   <g><path d="M10 3v3M10 9v3M10 15v3M8 21h4"/><path d="M10 6h7l3 3-3 3h-7zM10 12h-3l-3 3 3 3h3"/></g>,
  list:         <path d="M4 6h16M4 12h16M4 18h16"/>,
  send:         <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>,
  // extras — channel + audit icons
  email:        <g><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></g>,
  sms:          <g><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></g>,
  whatsapp:     <g><path d="M4 20l1.6-5A8 8 0 1 1 9 19.4z"/><path d="M9.5 10.5c.4 1.6 1.4 2.6 3 3l1-1.3 2 1c-.3 1-1.2 1.6-2.2 1.6a5 5 0 0 1-5-5c0-1 .6-1.9 1.6-2.2l1 2z"/></g>,
  push:         <g><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></g>,
  scan:         <g><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/></g>,
  calendar:     <g><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></g>,
  edit:         <g><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></g>,
  clock:        <g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
  info:         <g><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/></g>,
  refresh:      <g><path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/></g>,
  alert:        <g><path d="M12 3l10 18H2z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></g>,
  trendUp:      <path d="M3 17l6-6 4 4 8-8M21 7h-5m5 0v5"/>,
  trendDown:    <path d="M3 7l6 6 4-4 8 8M21 17h-5m5 0v-5"/>,
  trendFlat:    <path d="M4 12h16m0 0l-4-4m4 4l-4 4"/>,
  copy:         <g><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></g>,
  filter:       <path d="M4 4h16l-6 8v6l-4 2v-8z"/>,
  zap:          <path d="M13 3L4 14h6l-1 7 9-11h-6z"/>,
};

function Icon({ name, size = 20, strokeWidth = 1.5, style, ...rest }) {
  const path = AxIconPaths[name];
  if (!path) return null;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      {...rest}
    >{path}</svg>
  );
}

// ──────────────────────────── Buttons ─────────────────────────────────
function Button({ variant = "primary", size = "md", leftIcon, rightIcon, children, ...rest }) {
  const base = {
    fontFamily: DS.ff, fontWeight: 500,
    border: "1px solid transparent",
    borderRadius: DS.radiusButton,
    display: "inline-flex", alignItems: "center", gap: 8,
    cursor: "pointer",
    transition: `background ${DS.durFast} ${DS.ease}, color ${DS.durFast} ${DS.ease}, border-color ${DS.durFast} ${DS.ease}`,
    whiteSpace: "nowrap", userSelect: "none",
  };
  const sizes = {
    sm: { height: 32, padding: "0 12px", fontSize: 12, lineHeight: "16px" },
    md: { height: 40, padding: "0 16px", fontSize: 14, lineHeight: "20px" },
    lg: { height: 48, padding: "0 20px", fontSize: 16, lineHeight: "22px" },
  };
  const variants = {
    primary:          { background: DS.blue500,  color: "#fff",                  borderColor: DS.blue500 },
    secondary:        { background: "#fff",                color: DS.fg,           borderColor: DS.blue500 },
    tertiary:         { background: "transparent",         color: DS.fg,           borderColor: "transparent" },
    danger:           { background: DS.danger,    color: "#fff",                  borderColor: DS.danger },
    "primary-hover":  { background: DS.blue300,  color: "#fff",                  borderColor: DS.blue300 },
    "secondary-hover":{ background: DS.blue100,  color: DS.blue500,    borderColor: DS.blue500 },
    "tertiary-hover": { background: DS.blue100,  color: DS.blue500,    borderColor: "transparent" },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseEnter={(e) => { if (variants[variant + "-hover"]) Object.assign(e.currentTarget.style, variants[variant + "-hover"]); }}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, variants[variant])}
      {...rest}
    >
      {leftIcon  && <Icon name={leftIcon}  size={16} strokeWidth={2} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={16} strokeWidth={2} />}
    </button>
  );
}
// ──────────────────────────── Fields ──────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", error, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const ctrl = {
    height: 40, padding: "0 12px",
    background: focused ? "#fff" : DS.neutral100,
    border: `1px solid ${error ? DS.danger : focused ? DS.blue500 : DS.border}`,
    borderRadius: DS.radiusField,
    font: DS.body2, color: DS.neutral900,
    outline: "none", width: "100%", boxSizing: "border-box",
    ...(error ? { background: DS.dangerBg, color: DS.danger } : {}),
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <div style={{ font: DS.body2, color: DS.neutral500 }}>{label}</div>}
      <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={ctrl} {...rest} />
      {error && <div style={{ font: DS.body3, color: DS.danger }}>{error}</div>}
    </div>
  );
}

function SearchField({ value, onChange, placeholder = "Rechercher…", style }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{
      height: 40, padding: "0 12px",
      background: focused ? "#fff" : DS.neutral100,
      border: `1px solid ${focused ? DS.blue500 : DS.border}`,
      borderRadius: DS.radiusField,
      display: "flex", alignItems: "center", gap: 8, ...style,
    }}>
      <Icon name="search" size={18} style={{ color: DS.neutral500 }} />
      <input value={value ?? ""} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: "none", background: "transparent", outline: "none",
                 font: DS.body2, color: DS.neutral900 }} />
    </div>
  );
}

// ──────────────────────────── Tags ────────────────────────────────────
function Tag({ children, variant = "default", onRemove }) {
  const variants = {
    default: { background: DS.blue100,    color: DS.blue600,    border: `1px solid ${DS.blue600}` },
    active:  { background: DS.green500,   color: "#fff",                  border: `1px solid ${DS.green500}` },
    muted:   { background: DS.neutral100, color: DS.neutral700, border: `1px solid ${DS.border}` },
    warn:    { background: "#FFF1E5",               color: "#B05A21",               border: "1px solid #FFCFA7" },
    success: { background: DS.green100,   color: "#0E7A56",               border: "1px solid #6BC4AA" },
    danger:  { background: DS.dangerBg,   color: DS.danger,      border: `1px solid ${DS.danger}` },
  };
  return (
    <span style={{
      ...variants[variant],
      borderRadius: DS.radiusTag, padding: "2px 10px",
      font: DS.labelSm,
      display: "inline-flex", alignItems: "center", gap: 6,
      height: 24, boxSizing: "border-box", whiteSpace: "nowrap",
    }}>
      {children}
      {onRemove && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ display: "inline-flex", cursor: "pointer", opacity: 0.85 }}>
          <Icon name="x" size={12} strokeWidth={2} />
        </span>
      )}
    </span>
  );
}

// ──────────────────────────── Avatar ──────────────────────────────────
const AVATAR_COLORS = [
  DS.blue500, DS.green400, DS.orange,
  DS.indigoBrand, DS.coral, DS.green300,
];
function colorFor(seed = "") {
  let n = 0;
  for (const ch of seed) n = (n + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}
function Avatar({ name = "", size = 32, color }) {
  const initials = name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: color ?? colorFor(name), color: "#fff",
      font: size >= 32 ? DS.labelMd : DS.labelSm,
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>{initials || "?"}</span>
  );
}

// ──────────────────────────── StatCard ────────────────────────────────
function StatCard({ kicker, icon, value, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 180, padding: 16,
      border: `1px solid ${DS.border}`, borderRadius: DS.radiusCardLg,
      background: "#fff", display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ font: DS.body3, color: DS.neutral500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{kicker}</div>
        {icon && <Icon name={icon} size={20} style={{ color: DS.blue500 }} />}
      </div>
      <div style={{ font: DS.h2, color: DS.blue500, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ font: DS.body3, color: DS.neutral500 }}>{sub}</div>}
    </div>
  );
}

// ──────────────────────────── Accordion ───────────────────────────────
function Accordion({ title, defaultOpen = true, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div onClick={() => setOpen(!open)}
           style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 12px", cursor: "pointer", userSelect: "none" }}>
        <span style={{ font: DS.h4, color: DS.blue600 }}>{title}</span>
        <Icon name={open ? "chevronDown" : "chevronRight"} size={18} strokeWidth={2} style={{ color: DS.blue600 }} />
      </div>
      {open && <div style={{ padding: "0 12px 12px" }}>{children}</div>}
    </div>
  );
}

// ──────────────────────────── Checkbox ────────────────────────────────
function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8,
                    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
                    font: DS.body2, color: DS.neutral900 }}>
      <span style={{ width: 16, height: 16, borderRadius: 3,
                     border: `1px solid ${checked ? DS.blue500 : DS.neutral500}`,
                     background: checked ? DS.blue500 : "#fff",
                     display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {checked && <Icon name="check" size={12} strokeWidth={3} style={{ color: "#fff" }} />}
      </span>
      <input type="checkbox" checked={!!checked} disabled={disabled}
             onChange={(e) => onChange && onChange(e.target.checked)}
             style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      {label}
    </label>
  );
}

// ──────────────────────────── Toggle ──────────────────────────────────
function Toggle({ on, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8,
                    cursor: "pointer", font: DS.body2, color: DS.neutral900 }}>
      <span style={{ width: 32, height: 18, borderRadius: 100,
                     background: on ? DS.blue500 : "#fff",
                     border: `1px solid ${on ? DS.blue500 : DS.neutral600}`,
                     padding: 2, display: "inline-flex", alignItems: "center",
                     justifyContent: on ? "flex-end" : "flex-start",
                     transition: `background ${DS.durFast} ${DS.ease}` }}
            onClick={() => onChange && onChange(!on)}>
        <span style={{ width: 12, height: 12, borderRadius: "50%",
                       background: on ? "#fff" : DS.neutral500,
                       transition: `background ${DS.durFast} ${DS.ease}` }} />
      </span>
      {label}
    </label>
  );
}

// ──────────────────────────── PillTabs ────────────────────────────────
function PillTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "inline-flex", gap: 6, padding: 6,
                  background: "#fff", border: `1px solid ${DS.border}`, borderRadius: 8 }}>
      {tabs.map((t) => (
        <div key={t.id} onClick={() => onChange(t.id)}
             style={{ padding: "6px 14px", font: DS.labelMd,
                      color: active === t.id ? DS.blue500 : DS.neutral700,
                      background: active === t.id ? DS.blue100 : "transparent",
                      borderRadius: 6, cursor: "pointer",
                      fontWeight: active === t.id ? 600 : 500 }}>{t.label}</div>
      ))}
    </div>
  );
}

// ──────────────────────────── UnderlineTabs ───────────────────────────
function UnderlineTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 24, borderBottom: `1px solid ${DS.border}` }}>
      {tabs.map((t) => (
        <div key={t.id} onClick={() => onChange(t.id)}
             style={{ position: "relative", padding: "12px 4px", font: DS.labelLg,
                      color: active === t.id ? DS.blue500 : DS.neutral800, cursor: "pointer" }}>
          {t.label}
          {active === t.id && (
            <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 3,
                           background: DS.blueIos, borderRadius: "2px 2px 0 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 2 — EXTRAS (extras.jsx)
// ═══════════════════════════════════════════════════════════════════════

function StatusChip({ kind = "info", children }) {
  const styles = {
    info:    { bg: DS.blue100,    fg: DS.blue600 },
    success: { bg: DS.green100,   fg: "#0E7A56" },
    warn:    { bg: "#FFF1E5",               fg: "#B05A21" },
    danger:  { bg: DS.dangerBg,   fg: DS.danger },
    muted:   { bg: DS.neutral100, fg: DS.neutral700 },
  }[kind];
  return (
    <span style={{
      background: styles.bg, color: styles.fg,
      borderRadius: 100, padding: "2px 8px",
      font: DS.labelSm, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function ChannelBadge({ channel, size = 40 }) {
  const map = {
    Email:    { icon: "email",    bg: DS.blue100,  fg: DS.blue500 },
    SMS:      { icon: "sms",      bg: "#FFF1E5",             fg: "#C46A2A" },
    WhatsApp: { icon: "whatsapp", bg: DS.green100, fg: "#1F8F77" },
    Push:     { icon: "push",     bg: "#EDE9FE",             fg: "#5E48C7" },
  };
  const c = map[channel] ?? map.Email;
  return (
    <div style={{ width: size, height: size, borderRadius: 8,
                  background: c.bg, color: c.fg,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={c.icon} size={Math.round(size * 0.55)} strokeWidth={1.75} />
    </div>
  );
}

function fmtNumberFR(n) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("fr-FR");
}
function fmtDateFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtDateLongFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtRelDayFR(d) {
  const date = d instanceof Date ? d : new Date(d);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7)  return `il y a ${days} jours`;
  if (days < 31) return `il y a ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? "s" : ""}`;
}

function IconButton({ icon, size = 32, onClick, "aria-label": ariaLabel, active, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ width: size, height: size, padding: 0,
                     background: active || hover ? DS.blue100 : "transparent",
                     color: active ? DS.blue500 : DS.neutral700,
                     border: "1px solid transparent", borderRadius: 6, cursor: "pointer",
                     display: "inline-flex", alignItems: "center", justifyContent: "center",
                     transition: `background ${DS.durFast} ${DS.ease}` }}
            {...rest}>
      <Icon name={icon} size={18} strokeWidth={2} />
    </button>
  );
}

function Skeleton({ width = "100%", height = 16, radius = 4, style }) {
  return (
    <span aria-hidden="true" style={{
      display: "inline-block", width, height, borderRadius: radius,
      background: `linear-gradient(90deg, ${DS.neutral100} 0%, #EDEEF1 50%, ${DS.neutral100} 100%)`,
      backgroundSize: "200% 100%",
      animation: "axShimmer 1.4s ease-in-out infinite", ...style,
    }} />
  );
}

function StateBlock({ icon = "box", iconColor, title, description, action, tone = "muted", minHeight = 240 }) {
  const toneFg = { muted: DS.neutral500, danger: DS.danger }[tone];
  return (
    <div style={{ minHeight, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8, padding: 32, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%",
                    background: tone === "danger" ? DS.dangerBg : DS.neutral100,
                    color: iconColor || toneFg,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
        <Icon name={icon} size={26} strokeWidth={1.75} />
      </div>
      <div style={{ font: DS.h4, color: DS.neutral900 }}>{title}</div>
      {description && (
        <div style={{ font: DS.body2, color: DS.neutral700, maxWidth: 420 }}>{description}</div>
      )}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}

function channelIcon(channel) {
  return { Email: "email", SMS: "sms", WhatsApp: "whatsapp", Push: "push" }[channel] ?? "mail";
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 3 — NAVIGATION (navigation.jsx)
// ═══════════════════════════════════════════════════════════════════════

function ConsentHeader({ onCreate }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 10 }}>
      
      {/* Page-title bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${DS.border}`,
                    padding: "20px 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: DS.blue100,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: DS.blue500 }}>
            <Icon name="scan" size={22} strokeWidth={1.75} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ font: DS.body3, color: DS.neutral700 }}>Contacts</span>
              <Icon name="chevronRight" size={12} strokeWidth={2} style={{ color: DS.neutral500 }} />
              <span style={{ font: DS.body3, color: DS.neutral700 }}>Consentements</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={{ font: DS.h2 }}>Consentements</h2>
              <StatusChip kind="success">RGPD à jour</StatusChip>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="secondary" leftIcon="download">Exporter</Button>
          <Button variant="primary" leftIcon="plus" onClick={onCreate}>Créer un consentement</Button>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 4 — CHART (chart.jsx)
// ═══════════════════════════════════════════════════════════════════════

function ConsentChart({ state, consents, selection, onSelectionChange, range, onRangeChange, onRetry }) {
  const { CONSENTS, CONSENT_COLORS, MONTH_LABELS_FR, DATE_RANGES } = window.AX_DATA;
  return (
    <section data-screen-label="01 Consentements — Évolution"
             style={{ background: "#fff", border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusCard, overflow: "hidden" }}>
      {/* Card header */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h3 style={{ font: DS.h3 }}>Évolution des consentements</h3>
          <div style={{ font: DS.body3, color: DS.neutral700 }}>
            Volumes mensuels de contacts ayant donné leur consentement, par canal.
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <IconButton icon="refresh"  aria-label="Rafraîchir" />
          <IconButton icon="download" aria-label="Exporter le graphique" />
          <IconButton icon="dots"     aria-label="Plus d'options" />
        </div>
      </div>

      {/* Controls bar */}
      <div style={{ padding: "12px 20px", background: DS.neutral100,
                    borderTop: `1px solid ${DS.border}`, borderBottom: `1px solid ${DS.border}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 16, flexWrap: "wrap" }}>
        <ConsentSelector consents={consents} selection={selection} onChange={onSelectionChange} />
        <DateRangeTabs value={range} onChange={onRangeChange} ranges={DATE_RANGES} />
      </div>

      {/* Chart body */}
      <div style={{ padding: 20, minHeight: 360 }}>
        {state === "loading" && <ChartSkeleton />}
        {state === "error" && (
          <StateBlock icon="alert" tone="danger"
            title="Impossible de charger les données du graphique"
            description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
            action={<Button variant="secondary" leftIcon="refresh" onClick={onRetry}>Réessayer</Button>} />
        )}
        {state === "empty" && (
          <StateBlock icon="scan"
            title="Aucune donnée de consentement disponible"
            description="Créez un premier consentement pour visualiser l'évolution de vos communautés."
            action={<Button variant="primary" leftIcon="plus">Créer un consentement</Button>} />
        )}
        {state === "ready" && (
          <ChartCanvas consents={consents} selection={selection}
                       months={range.months} allLabels={MONTH_LABELS_FR} colors={CONSENT_COLORS} />
        )}
      </div>
    </section>
  );
}

function ConsentSelector({ consents, selection, onChange }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function toggle(id) {
    if (selection.includes(id)) onChange(selection.filter((x) => x !== id));
    else onChange([...selection, id]);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <span style={{ font: DS.body2, color: DS.neutral700, marginRight: 4 }}>
        Consentements affichés :
      </span>
      {selection.map((id) => {
        const c = consents.find((x) => x.id === id);
        if (!c) return null;
        const color = window.AX_DATA.CONSENT_COLORS[id];
        return (
          <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                                   padding: "3px 8px 3px 10px", background: "#fff",
                                   border: `1px solid ${DS.border}`, borderRadius: 100,
                                   font: DS.labelSm, fontWeight: 500, color: DS.neutral900,
                                   height: 28, boxSizing: "border-box" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            {c.name}
            <button type="button" aria-label={`Retirer ${c.name}`} onClick={() => toggle(id)}
                    style={{ width: 18, height: 18, marginLeft: 2, border: "none", background: "transparent",
                             display: "inline-flex", alignItems: "center", justifyContent: "center",
                             color: DS.neutral500, cursor: "pointer", padding: 0 }}>
              <Icon name="x" size={12} strokeWidth={2.5} />
            </button>
          </span>
        );
      })}
      <button type="button" onClick={() => setOpen((v) => !v)}
              style={{ height: 28, padding: "0 10px",
                       background: open ? DS.blue100 : "#fff",
                       border: `1px dashed ${DS.blue500}`, color: DS.blue500,
                       borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 4,
                       font: DS.labelSm, fontWeight: 600, cursor: "pointer" }}
              aria-haspopup="listbox" aria-expanded={open}>
        <Icon name="plus" size={14} strokeWidth={2.5} />
        Ajouter un consentement
      </button>
      {open && (
        <div role="listbox" style={{ position: "absolute", top: "calc(100% + 8px)", left: 0,
                                      background: "#fff", minWidth: 280,
                                      border: `1px solid ${DS.border}`, borderRadius: 8,
                                      boxShadow: DS.shadowLg, padding: 6, zIndex: 20 }}>
          {consents.map((c) => {
            const checked = selection.includes(c.id);
            const color = window.AX_DATA.CONSENT_COLORS[c.id];
            return (
              <div key={c.id} role="option" aria-selected={checked} onClick={() => toggle(c.id)}
                   style={{ display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 10px", borderRadius: 4, cursor: "pointer",
                            background: checked ? DS.blue100 : "transparent" }}
                   onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = DS.neutral100; }}
                   onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ width: 16, height: 16, borderRadius: 3,
                               border: `1px solid ${checked ? DS.blue500 : DS.neutral500}`,
                               background: checked ? DS.blue500 : "#fff",
                               display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  {checked && <Icon name="check" size={11} strokeWidth={3} style={{ color: "#fff" }} />}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ flex: 1, font: DS.body2, color: DS.neutral900 }}>{c.name}</span>
                <span style={{ font: DS.body3, color: DS.neutral500 }}>{c.channel}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DateRangeTabs({ value, onChange, ranges }) {
  return (
    <div style={{ display: "inline-flex", padding: 4, background: "#fff",
                  border: `1px solid ${DS.border}`, borderRadius: 6 }}>
      {ranges.map((r) => {
        const active = r.id === value.id;
        return (
          <button key={r.id} type="button" onClick={() => onChange(r)}
                  style={{ padding: "6px 12px", font: DS.labelMd,
                           fontWeight: active ? 600 : 500,
                           color: active ? DS.blue500 : DS.neutral700,
                           background: active ? DS.blue100 : "transparent",
                           border: "none", borderRadius: 4, cursor: "pointer" }}>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function ChartCanvas({ consents, selection, months, allLabels, colors }) {
  const W = 1080, H = 320;
  const PAD_L = 64, PAD_R = 24, PAD_T = 16, PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const series = React.useMemo(() => consents.map((c) => {
    const full = c.series.slice(-Math.min(months + 1, c.series.length));
    return { id: c.id, name: c.name, points: full, channel: c.channel };
  }), [consents, months]);

  const labels = allLabels.slice(-Math.min(months + 1, allLabels.length));
  const selected = series.filter((s) => selection.includes(s.id));
  const allValues = selected.flatMap((s) => s.points).filter((v) => v != null);
  const yMaxRaw = allValues.length ? Math.max(...allValues) : 100;
  const yMax = niceCeil(yMaxRaw);

  const xStep = innerW / Math.max(1, labels.length - 1);
  const xAt = (i) => PAD_L + i * xStep;
  const yAt = (v) => PAD_T + innerH - (v / yMax) * innerH;

  const [hoverIdx, setHoverIdx] = React.useState(null);
  const svgRef = React.useRef(null);
  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    if (x < PAD_L - 8 || x > W - PAD_R + 8) { setHoverIdx(null); return; }
    const idx = Math.max(0, Math.min(labels.length - 1, Math.round((x - PAD_L) / xStep)));
    setHoverIdx(idx);
  }
  function onLeave() { setHoverIdx(null); }

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((yMax / yTicks) * i));
  const xLabelEvery = Math.max(1, Math.ceil(labels.length / 12));

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%"
           style={{ display: "block", overflow: "visible" }}
           onMouseMove={onMove} onMouseLeave={onLeave}
           role="img" aria-label="Évolution des consentements par mois">
        {ticks.map((t, i) => {
          const y = yAt(t);
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                    stroke={DS.neutral200} strokeWidth="1"
                    strokeDasharray={i === 0 ? "0" : "3 3"} />
              <text x={PAD_L - 10} y={y + 4} textAnchor="end"
                    fontSize="11" fill={DS.neutral600} fontFamily="Inter, sans-serif">
                {fmtNumberFR(t)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => {
          if (i % xLabelEvery !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={xAt(i)} y={H - PAD_B + 18} textAnchor="middle"
                  fontSize="11" fill={DS.neutral600} fontFamily="Inter, sans-serif">{l}</text>
          );
        })}
        {hoverIdx != null && (
          <line x1={xAt(hoverIdx)} x2={xAt(hoverIdx)} y1={PAD_T} y2={H - PAD_B}
                stroke={DS.neutral400} strokeWidth="1" strokeDasharray="3 3" />
        )}
        {selected.map((s) => {
          const color = colors[s.id];
          const d = pathFromPoints(s.points, xAt, yAt);
          return (
            <g key={s.id}>
              <path d={d} fill="none" stroke={color} strokeWidth="2.25"
                    strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((v, i) => v == null ? null : (
                <circle key={i} cx={xAt(i)} cy={yAt(v)} r={hoverIdx === i ? 4.5 : 2.5}
                        fill="#fff" stroke={color} strokeWidth="2" />
              ))}
              {s.points.every((v) => v === 0 || v == null) && s.points.some((v) => v === 0) && (
                <text x={xAt(s.points.length - 1) + 6} y={yAt(0) - 6}
                      fontSize="11" fill={color} fontFamily="Inter, sans-serif" fontWeight="600">
                  0 contact
                </text>
              )}
            </g>
          );
        })}
        {selected.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle"
                fontSize="14" fill={DS.neutral500} fontFamily="Inter, sans-serif">
            Sélectionnez au moins un consentement pour afficher le graphique.
          </text>
        )}
      </svg>
      {hoverIdx != null && selected.length > 0 && (
        <ChartTooltip label={labels[hoverIdx]}
          rows={selected.map((s) => ({ id: s.id, name: s.name, color: colors[s.id], value: s.points[hoverIdx] }))}
          xPct={(xAt(hoverIdx) / W) * 100} />
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12, paddingTop: 12,
                    borderTop: `1px solid ${DS.border}` }}>
        {series.map((s) => {
          const active = selection.includes(s.id);
          return (
            <div key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                                      opacity: active ? 1 : 0.4,
                                      font: DS.body3, color: DS.neutral700 }}>
              <span style={{ width: 14, height: 3, borderRadius: 2, background: colors[s.id] }} />
              {s.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function pathFromPoints(points, xAt, yAt) {
  const pts = [];
  for (let i = 0; i < points.length; i++) {
    if (points[i] == null) continue;
    pts.push({ x: xAt(i), y: yAt(points[i]) });
  }
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} l 0 0`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function niceCeil(v) {
  if (v <= 0) return 100;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const base = v / pow;
  const nice = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
  return nice * pow;
}

function ChartTooltip({ label, rows, xPct }) {
  const flip = xPct > 70;
  return (
    <div style={{ position: "absolute",
                  left: `calc(${xPct}% + ${flip ? -16 : 16}px)`,
                  top: 16, transform: flip ? "translateX(-100%)" : "none",
                  background: "#fff", border: `1px solid ${DS.border}`,
                  borderRadius: 8, boxShadow: DS.shadowMd,
                  padding: 12, minWidth: 220, pointerEvents: "none", zIndex: 5 }}>
      <div style={{ font: DS.labelSm, color: DS.neutral700,
                    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      {rows.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
          <span style={{ flex: 1, font: DS.body2, color: DS.neutral900 }}>{r.name}</span>
          <span style={{ font: DS.labelMd, fontWeight: 600, color: DS.neutral900 }}>
            {r.value == null ? "—" : fmtNumberFR(r.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 320 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flex: 1, padding: "16px 0" }}>
        {Array.from({ length: 13 }).map((_, i) => (
          <Skeleton key={i} width={`${100 / 13}%`} height={120 + ((i * 37) % 120)} radius={6} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={140} height={12} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 5 — BANNERS (banners.jsx)
// ═══════════════════════════════════════════════════════════════════════

function ConsentBanners({ consents, onOpen, onDelete }) {
  return (
    <section data-screen-label="01 Consentements — Liste"
             style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 4px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h3 style={{ font: DS.h3 }}>Liste des consentements</h3>
          <span style={{ font: DS.body3, color: DS.neutral700 }}>
            {consents.length} consentement{consents.length > 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <SearchField placeholder="Rechercher un consentement…" style={{ width: 280 }} onChange={() => {}} />
          <Button variant="secondary" leftIcon="filter">Filtres</Button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {consents.map((c) => (
          <ConsentBanner key={c.id} consent={c} onOpen={() => onOpen(c)} onDelete={() => onDelete(c)} />
        ))}
      </div>
    </section>
  );
}

function ConsentBanner({ consent, onOpen, onDelete }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    function onDoc(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const last12 = consent.series.slice(-12);
  const nonNull = last12.filter((v) => v != null);
  const isZero = consent.contactsTotal === 0;
  const first = nonNull[0] ?? 0;
  const last  = nonNull[nonNull.length - 1] ?? 0;
  const delta = first ? Math.round(((last - first) / first) * 100) : 0;
  const trend = isZero ? "flat" : delta > 1 ? "up" : delta < -1 ? "down" : "flat";

  return (
    <div data-screen-label={`01 Consentements — ${consent.name}`}
         onClick={onOpen} role="button" tabIndex={0}
         onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
         style={{ background: "#fff", border: `1px solid ${DS.border}`,
                  borderRadius: DS.radiusCard, padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1.4fr) repeat(3, minmax(140px, 1fr)) 120px 40px",
                  alignItems: "center", gap: 20, cursor: "pointer",
                  transition: `border-color ${DS.durFast} ${DS.ease}, background ${DS.durFast} ${DS.ease}` }}
         onMouseEnter={(e) => { e.currentTarget.style.borderColor = DS.blue300; e.currentTarget.style.background = "#FCFDFF"; }}
         onMouseLeave={(e) => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "#fff"; }}>
      <ChannelBadge channel={consent.channel} size={44} />
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ font: DS.h4, color: DS.neutral900,
                         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {consent.name}
          </span>
          {consent.doubleOptIn && <StatusChip kind="info">Double opt-in</StatusChip>}
          {isZero && <StatusChip kind="warn">Phase pilote</StatusChip>}
        </div>
        <div style={{ font: DS.body3, color: DS.neutral700,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
          {consent.description}
        </div>
      </div>
      <BannerStat icon={channelIcon(consent.channel)} label="Canal" value={consent.channel} />
      <BannerStat icon="calendar" label="Créé le" value={fmtDateFR(consent.createdAt)} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: DS.labelSm, color: DS.neutral500,
                       textTransform: "uppercase", letterSpacing: "0.04em" }}>Contacts</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ font: DS.h3, color: isZero ? DS.neutral500 : DS.neutral900 }}>
            {fmtNumberFR(consent.contactsTotal)}
          </span>
          {!isZero && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2,
                           font: DS.body3, fontWeight: 600,
                           color: trend === "up" ? DS.success : trend === "down" ? DS.danger : DS.neutral600 }}>
              <Icon name={trend === "up" ? "trendUp" : trend === "down" ? "trendDown" : "trendFlat"} size={14} strokeWidth={2} />
              {delta > 0 ? "+" : ""}{delta}%
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 36 }}>
        <Sparkline data={last12} color={window.AX_DATA.CONSENT_COLORS[consent.id]} />
      </div>
      <div ref={menuRef} style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
        <IconButton icon="dots" aria-label={`Actions pour ${consent.name}`} active={menuOpen}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }} />
        {menuOpen && (
          <div role="menu" onClick={(e) => e.stopPropagation()}
               style={{ position: "absolute", top: "calc(100% + 4px)", right: 0,
                        background: "#fff", minWidth: 220,
                        border: `1px solid ${DS.border}`, borderRadius: 6,
                        boxShadow: DS.shadowLg, padding: 4, zIndex: 10 }}>
            <MenuItem icon="eye"   onClick={() => { setMenuOpen(false); onOpen(); }}>Ouvrir le détail</MenuItem>
            <MenuItem icon="trash" tone="danger" onClick={() => { setMenuOpen(false); onDelete(); }}>Supprimer</MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function BannerStat({ icon, label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ font: DS.labelSm, color: DS.neutral500,
                     textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                     font: DS.body2, fontWeight: 500, color: DS.neutral900,
                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {icon && <Icon name={icon} size={14} style={{ color: DS.neutral600 }} />}
        {value}
      </span>
    </div>
  );
}

function MenuItem({ icon, children, onClick, tone = "default" }) {
  const [hover, setHover] = React.useState(false);
  const color = tone === "danger" ? DS.danger : DS.neutral900;
  const hoverBg = tone === "danger" ? DS.dangerBg : DS.blue100;
  return (
    <button type="button" role="menuitem" onClick={onClick}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                     padding: "8px 10px", background: hover ? hoverBg : "transparent",
                     border: "none", borderRadius: 4, color, cursor: "pointer", textAlign: "left",
                     font: DS.body2, fontWeight: 500 }}>
      <Icon name={icon} size={16} strokeWidth={2} />
      {children}
    </button>
  );
}

function Sparkline({ data, color }) {
  const W = 120, H = 36;
  const nonNull = data.filter((v) => v != null);
  if (nonNull.length === 0 || nonNull.every((v) => v === 0)) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <line x1="0" x2={W} y1={H - 2} y2={H - 2}
              stroke={DS.neutral300} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  const min = Math.min(...nonNull);
  const max = Math.max(...nonNull);
  const range = Math.max(1, max - min);
  const step = data.length > 1 ? W / (data.length - 1) : W;
  let d = "";
  data.forEach((v, i) => {
    if (v == null) return;
    const x = i * step;
    const y = H - 2 - ((v - min) / range) * (H - 6);
    d += (d ? " L" : "M") + ` ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const areaD = d ? `${d} L ${(data.length - 1) * step} ${H} L 0 ${H} Z` : "";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <path d={areaD} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BannersSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${DS.border}`,
                              borderRadius: DS.radiusCard, padding: "16px 20px",
                              display: "grid",
                              gridTemplateColumns: "44px 1fr 140px 140px 140px 120px 32px",
                              alignItems: "center", gap: 20 }}>
          <Skeleton width={44} height={44} radius={8} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width={220} height={18} />
            <Skeleton width="80%" height={12} />
          </div>
          <Skeleton width={100} height={14} />
          <Skeleton width={100} height={14} />
          <Skeleton width={80}  height={22} />
          <Skeleton width="100%" height={28} radius={4} />
          <Skeleton width={20}  height={20} radius={4} />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 6 — MODAL (modal.jsx)
// ═══════════════════════════════════════════════════════════════════════

function ConsentDetailModal({ state, consent, onClose, onRetry }) {
  return (
    <div data-screen-label="02 Consentements — Détail"
         style={{ position: "fixed", inset: 0, background: "rgba(31,41,55,0.35)",
                  zIndex: 100, animation: `axFade 0.18s ${DS.ease}` }}
         onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()}
             role="dialog" aria-modal="true" aria-label="Détail du consentement"
             style={{ position: "absolute", top: 0, right: 0, bottom: 0,
                      width: 560, maxWidth: "100vw", background: "#fff",
                      display: "flex", flexDirection: "column",
                      boxShadow: DS.shadowModal,
                      animation: `axSlideLeft 0.24s ${DS.easeOut}` }}>
        {/* Header */}
        <div style={{ background: DS.brandGradientH, padding: "16px 24px",
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, color: "#fff" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ font: DS.body3, opacity: 0.85 }}>Détail du consentement</div>
            <div style={{ font: DS.h3, fontWeight: 700,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {state === "ready" ? consent.name : "Consentement"}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
                  style={{ width: 32, height: 32, padding: 0, background: "rgba(255,255,255,0.18)",
                           border: "none", borderRadius: 6, color: "#fff", cursor: "pointer",
                           display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", background: DS.neutral100 }}>
          {state === "loading" && <DetailSkeleton />}
          {state === "error" && (
            <StateBlock icon="alert" tone="danger"
              title="Impossible de charger le détail"
              description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
              action={<Button variant="secondary" leftIcon="refresh" onClick={onRetry}>Réessayer</Button>}
              minHeight={420} />
          )}
          {state === "empty" && (
            <StateBlock icon="scan"
              title="Aucun consentement sélectionné"
              description="Sélectionnez un consentement dans la liste pour afficher ses détails."
              minHeight={420} />
          )}
          {state === "ready" && consent && <DetailBody consent={consent} />}
        </div>

        {/* Footer */}
        {state === "ready" && consent && (
          <div style={{ padding: "16px 24px", background: "#fff", borderTop: `1px solid ${DS.border}`,
                        display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
            <Button variant="tertiary" leftIcon="trash">Supprimer</Button>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="secondary" onClick={onClose}>Fermer</Button>
              <Button variant="primary" leftIcon="edit">Modifier</Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailBody({ consent }) {
  const isZero = consent.contactsTotal === 0;
  const last12 = consent.series.slice(-12);
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero card */}
      <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                    borderRadius: DS.radiusCard, padding: 20,
                    display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <ChannelBadge channel={consent.channel} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: DS.h3, color: DS.neutral900, marginBottom: 4 }}>{consent.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatusChip kind="info">{consent.channel}</StatusChip>
              {consent.doubleOptIn && <StatusChip kind="success">Double opt-in</StatusChip>}
              {isZero && <StatusChip kind="warn">Phase pilote — 0 contact</StatusChip>}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: DS.neutral100,
                        display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ font: DS.labelSm, color: DS.neutral700,
                           textTransform: "uppercase", letterSpacing: "0.04em" }}>Contacts</span>
            <span style={{ font: DS.h2, color: isZero ? DS.neutral500 : DS.blue500 }}>
              {fmtNumberFR(consent.contactsTotal)}
            </span>
            <span style={{ font: DS.body3, color: DS.neutral700 }}>au {fmtDateFR("2026-05-13")}</span>
          </div>
          <div style={{ padding: 12, borderRadius: 8, background: DS.neutral100,
                        display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ font: DS.labelSm, color: DS.neutral700,
                           textTransform: "uppercase", letterSpacing: "0.04em" }}>Tendance 12 mois</span>
            <div style={{ height: 44, marginTop: 2 }}>
              <Sparkline data={last12} color={window.AX_DATA.CONSENT_COLORS[consent.id]} />
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      <PropertiesCard title="Propriétés">
        <PropertyRow label="Description">
          <p style={{ font: DS.body2, color: DS.neutral900, margin: 0, textWrap: "pretty" }}>
            {consent.description}
          </p>
        </PropertyRow>
        <PropertyRow label="Canal marketing">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name={channelIcon(consent.channel)} size={16} style={{ color: DS.neutral700 }} />
            <span style={{ font: DS.body2, color: DS.neutral900, fontWeight: 500 }}>{consent.channel}</span>
          </span>
        </PropertyRow>
        <PropertyRow label="Base légale">{consent.legalBasis}</PropertyRow>
        <PropertyRow label="Date de création">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name="calendar" size={14} style={{ color: DS.neutral600 }} />
            <span>{fmtDateLongFR(consent.createdAt)}</span>
            <span style={{ color: DS.neutral500 }}>· par {consent.createdBy}</span>
          </span>
        </PropertyRow>
        <PropertyRow label="Double opt-in">
          <Toggle on={consent.doubleOptIn} label={consent.doubleOptIn ? "Activé" : "Désactivé"} />
        </PropertyRow>
        <PropertyRow label="Identifiant">
          <code style={{ font: DS.body3, background: DS.neutral100,
                         border: `1px solid ${DS.border}`, borderRadius: 4, padding: "2px 6px",
                         color: DS.neutral700 }}>cnst_{consent.id}</code>
        </PropertyRow>
      </PropertiesCard>

      {/* Audit trail */}
      <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                    borderRadius: DS.radiusCard, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                      borderBottom: `1px solid ${DS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="clock" size={18} style={{ color: DS.blue500 }} />
            <span style={{ font: DS.h4 }}>Journal de modifications</span>
          </div>
          <span style={{ font: DS.body3, color: DS.neutral700 }}>
            {consent.auditLog.length} entrée{consent.auditLog.length > 1 ? "s" : ""}
          </span>
        </div>
        <ol style={{ margin: 0, padding: "8px 16px 16px 16px", listStyle: "none" }}>
          {consent.auditLog.map((entry, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 12,
                                  padding: "8px 0",
                                  borderBottom: i < consent.auditLog.length - 1 ? `1px dashed ${DS.neutral200}` : "none" }}>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, width: 1, background: DS.neutral300 }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%",
                              background: i === 0 ? DS.blue500 : "#fff",
                              border: `2px solid ${i === 0 ? DS.blue500 : DS.neutral400}`,
                              marginTop: 6, position: "relative", zIndex: 1 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Avatar name={entry.author} size={20} />
                  <span style={{ font: DS.labelMd, fontWeight: 600, color: DS.neutral900 }}>{entry.author}</span>
                  <span style={{ font: DS.body3, color: DS.neutral700 }}>
                    {fmtDateFR(entry.date)} · {fmtRelDayFR(entry.date)}
                  </span>
                </div>
                <div style={{ font: DS.body2, color: DS.neutral800, textWrap: "pretty" }}>{entry.change}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PropertiesCard({ title, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                  borderRadius: DS.radiusCard, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, font: DS.h4 }}>{title}</div>
      <dl style={{ margin: 0, padding: 0 }}>
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, { isFirst: i === 0, isLast: i === React.Children.count(children) - 1 })
        )}
      </dl>
    </div>
  );
}

function PropertyRow({ label, children, isFirst }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr",
                  padding: "12px 16px",
                  borderTop: isFirst ? "none" : `1px solid ${DS.neutral200}`,
                  gap: 16, alignItems: "flex-start" }}>
      <dt style={{ font: DS.body2, color: DS.neutral700, paddingTop: 1 }}>{label}</dt>
      <dd style={{ margin: 0, font: DS.body2, color: DS.neutral900, minWidth: 0, wordBreak: "break-word" }}>
        {children}
      </dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                    borderRadius: DS.radiusCard, padding: 20,
                    display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Skeleton width={56} height={56} radius={8} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width="60%" height={22} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton height={76} radius={8} />
          <Skeleton height={76} radius={8} />
        </div>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                    borderRadius: DS.radiusCard, padding: 16,
                    display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton width="30%" height={16} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16 }}>
            <Skeleton height={14} />
            <Skeleton height={14} width="70%" />
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                    borderRadius: DS.radiusCard, padding: 16,
                    display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton width="40%" height={16} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <Skeleton width={20} height={20} radius={10} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="50%" height={12} />
              <Skeleton width="85%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 7 — APP SHELL (app.jsx)
// ═══════════════════════════════════════════════════════════════════════

export default function ConsentsPage() {
  const AX = window.AX_DATA;
  const [consents, setConsents] = React.useState(AX.CONSENTS);
  const [selection, setSelection] = React.useState(AX.DEFAULT_CHART_SELECTION);
  const [range,     setRange]     = React.useState(AX.DATE_RANGES[2]);
  const [openConsent, setOpenConsent] = React.useState(null);
  const [modalState,  setModalState]  = React.useState("ready");
  const [chartView,  setChartView]  = React.useState("ready");
  const [listView,   setListView]   = React.useState("ready");
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  function openConsentDetail(c) {
    setOpenConsent(c);
    setModalState("loading");
    const id = setTimeout(() => setModalState("ready"), 450);
    return () => clearTimeout(id);
  }
  function closeModal() { setOpenConsent(null); setModalState("ready"); }
  function retryChart() { setChartView("loading"); setTimeout(() => setChartView("ready"), 600); }
  function retryModal() { setModalState("loading"); setTimeout(() => setModalState("ready"), 500); }

  const chartConsents = listView === "empty" ? [] : consents;
  const chartEffectiveState = listView === "empty" ? "empty" : chartView;

  return (
    <div style={{ minHeight: "100vh" }}>
      <ConsentHeader onCreate={() => alert("Création d'un consentement — non maquetté dans ce prototype.")} />

      <main style={{ padding: "24px 24px 96px", background: DS.bgCanvas,
                     minHeight: "calc(100vh - 78px - 48px - 84px)",
                     display: "flex", flexDirection: "column", gap: 24 }}>
        <ConsentChart state={chartEffectiveState} consents={chartConsents}
                      selection={selection} onSelectionChange={setSelection}
                      range={range} onRangeChange={setRange} onRetry={retryChart} />

        {listView === "ready" && (
          <ConsentBanners consents={consents} onOpen={openConsentDetail} onDelete={(c) => setConfirmDelete(c)} />
        )}
        {listView === "loading" && <BannersSkeleton />}
        {listView === "error" && (
          <div style={{ background: "#fff", border: `1px solid ${DS.border}`, borderRadius: DS.radiusCard }}>
            <StateBlock icon="alert" tone="danger"
              title="Impossible de charger les consentements"
              description="Une erreur réseau est survenue. Veuillez réessayer dans quelques instants."
              action={<Button variant="secondary" leftIcon="refresh" onClick={() => {
                setListView("loading");
                setTimeout(() => setListView("ready"), 700);
              }}>Réessayer</Button>} />
          </div>
        )}
        {listView === "empty" && (
          <div style={{ background: "#fff", border: `1px solid ${DS.border}`, borderRadius: DS.radiusCard }}>
            <StateBlock icon="scan"
              title="Aucun consentement"
              description="Créez votre premier consentement pour commencer à suivre vos communautés."
              action={<Button variant="primary" leftIcon="plus">Créer un consentement</Button>} />
          </div>
        )}
      </main>

      {openConsent && (
        <ConsentDetailModal state={modalState} consent={modalState === "ready" ? openConsent : null}
                            onClose={closeModal} onRetry={retryModal} />
      )}

      {confirmDelete && (
        <DeleteConfirm consent={confirmDelete}
                       onCancel={() => setConfirmDelete(null)}
                       onConfirm={() => {
                         setConsents((cs) => cs.filter((x) => x.id !== confirmDelete.id));
                         setSelection((sel) => sel.filter((id) => id !== confirmDelete.id));
                         setConfirmDelete(null);
                       }} />
      )}

      <DevPanel chartView={chartView} setChartView={setChartView}
                listView={listView}   setListView={setListView}
                modalState={modalState} setModalState={setModalState}
                onForceOpenEmpty={()   => { setOpenConsent({});          setModalState("empty");   }}
                onForceOpenError={()   => { setOpenConsent(consents[0]); setModalState("error");   }}
                onForceOpenLoading={() => { setOpenConsent(consents[0]); setModalState("loading"); }}
                modalOpen={!!openConsent} />
    </div>
  );
}

function DeleteConfirm({ consent, onCancel, onConfirm }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(31,41,55,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 200, animation: `axFade 0.18s ${DS.ease}` }}
         onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
           style={{ width: 480, maxWidth: "calc(100vw - 40px)", background: "#fff",
                    borderRadius: DS.radiusCard, overflow: "hidden",
                    boxShadow: DS.shadowModal }}>
        <div style={{ background: DS.brandGradientH, padding: "16px 24px", color: "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ font: DS.h3, fontWeight: 700 }}>Supprimer le consentement</div>
          <Icon name="x" size={20} strokeWidth={2.5} style={{ cursor: "pointer" }} onClick={onCancel} />
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ font: DS.body1, color: DS.neutral900 }}>
            Vous êtes sur le point de supprimer le consentement <strong>« {consent.name} »</strong>.
          </p>
          <div style={{ padding: 12, background: DS.dangerBg,
                        border: `1px solid ${DS.danger}`, borderRadius: 6,
                        display: "flex", gap: 10, alignItems: "flex-start", color: DS.danger }}>
            <Icon name="alert" size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ font: DS.body2 }}>
              Cette action est irréversible. {fmtNumberFR(consent.contactsTotal)} contact
              {consent.contactsTotal > 1 ? "s seront" : " sera"} dissociés de ce consentement.
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${DS.border}`,
                      background: DS.neutral100,
                      display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="tertiary" onClick={onCancel}>Annuler</Button>
          <Button variant="danger" leftIcon="trash" onClick={onConfirm}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

function DevPanel(props) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 300,
                  display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      {open && (
        <div style={{ background: "#fff", border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusCard, boxShadow: DS.shadowLg,
                      padding: 16, width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="zap" size={18} style={{ color: DS.orange }} />
              <span style={{ font: DS.h4 }}>États du prototype</span>
            </div>
            <Icon name="x" size={16} strokeWidth={2.5}
                  style={{ cursor: "pointer", color: DS.neutral600 }}
                  onClick={() => setOpen(false)} />
          </div>
          <p style={{ font: DS.body3, color: DS.neutral700, margin: 0 }}>
            Bascule entre les états vide / chargement / erreur pour chaque vue.
          </p>
          <StateGroup label="Graphique (Story 1)"        value={props.chartView} onChange={props.setChartView} />
          <StateGroup label="Liste des consentements"    value={props.listView}  onChange={props.setListView} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: DS.labelMd, color: DS.neutral900 }}>Détail consentement (Story 2)</span>
            <span style={{ font: DS.body3, color: DS.neutral700 }}>Ouvrir le panneau dans un état :</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <Button size="sm" variant="secondary" onClick={props.onForceOpenLoading}>Chargement</Button>
              <Button size="sm" variant="secondary" onClick={props.onForceOpenError}>Erreur</Button>
              <Button size="sm" variant="secondary" onClick={props.onForceOpenEmpty}>Vide</Button>
              <Button size="sm" variant="tertiary"
                      onClick={() => window.dispatchEvent(new CustomEvent("__open-first-consent"))}>
                Réel (Newsletter Public)
              </Button>
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen((v) => !v)}
              aria-label="Panneau d'états du prototype"
              style={{ height: 44, padding: "0 14px", background: DS.neutral900,
                       color: "#fff", border: "none", borderRadius: 100,
                       display: "inline-flex", alignItems: "center", gap: 8,
                       font: DS.labelMd, fontWeight: 600,
                       cursor: "pointer", boxShadow: DS.shadowLg }}>
        <Icon name="zap" size={16} style={{ color: DS.orange }} />
        États du prototype
      </button>
    </div>
  );
}

function StateGroup({ label, value, onChange }) {
  const options = [
    { id: "ready",   label: "Normal" },
    { id: "loading", label: "Chargement" },
    { id: "empty",   label: "Vide" },
    { id: "error",   label: "Erreur" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ font: DS.labelMd, color: DS.neutral900 }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    background: DS.neutral100, border: `1px solid ${DS.border}`,
                    borderRadius: 6, padding: 2, gap: 2 }}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button key={o.id} type="button" onClick={() => onChange(o.id)}
                    style={{ padding: "6px 0",
                             background: active ? "#fff" : "transparent",
                             border: "none", borderRadius: 4,
                             font: DS.labelSm, fontWeight: active ? 600 : 500,
                             color: active ? DS.blue500 : DS.neutral700,
                             boxShadow: active ? DS.shadowSm : "none",
                             cursor: "pointer" }}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}
