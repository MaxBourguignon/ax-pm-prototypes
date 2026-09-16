import { useState } from "react";
import LogoAx from "../../assets/logo_2026_logo-dark.svg";

// ── Design System tokens ─────────────────────────────────────────────────────
const DS = {
  actionPrimary: "#4F32FE",
  feedbackError: "#DC2626",
  borderDefault: "#E2DDDD",
  textDefault: "#1F2937",
  textSecondary: "#9A9EA5",
  textInverse: "#FFFFFF",
  bgCard: "#FFFFFF",
  bgSurface: "#F9FBFB",
  navGradientFrom: "#2CB1A2",
  navGradientTo: "#5585B8",
  blue100: "#EFF4FF",
  ff: "'Inter', sans-serif",
};

const TY = {
  b2: { fontSize: 14, fontWeight: 400, lineHeight: "18px" },
  b3: { fontSize: 12, fontWeight: 400, lineHeight: "16px" },
};

// ── Icons (Ico object, §11 pattern) ──────────────────────────────────────────
const Ico = {
  Dashboard: ({ s = 20, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6a1 1 0 011-1h4a1 1 0 011 1v6h3a1 1 0 001-1V10"
        stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Mail: ({ s = 20, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={c} strokeWidth="1.5" />
      <path d="M3 7l9 6 9-6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Campaigns: ({ s = 20, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 11l18-7-7 18-2.5-7.5L3 11z" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Settings: ({ s = 20, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Icons: ({ s = 20, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9 18V5l12-2v13" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="16" r="3" stroke={c} strokeWidth="1.5" />
    </svg>
  ),
  ChevDown: ({ s = 16, c = DS.textSecondary }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Logo: ({ s = 28 }) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <path d="M16 3L4 27h6l6-12 6 12h6L16 3z" fill={DS.navGradientFrom} />
      <path d="M16 11l-5 10h10l-5-10z" fill={DS.navGradientTo} />
    </svg>
  ),
};

// ── Sidebar navigation model ──────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: Ico.Dashboard },
  {
    key: "contacts", label: "Contacts", icon: Ico.Mail, badge: 2,
    children: ["Vue d'ensemble", "Contacts", "Structures", "Listes", "Importer"],
  },
  { key: "campagnes", label: "Campagnes", icon: Ico.Campaigns },
  { key: "parametrages", label: "Paramétrages", icon: Ico.Settings },
  { key: "icones", label: "Icônes", icon: Ico.Icons },
];

export default function NewSideBar({
  activeItem: activeItemProp = "contacts",
  activeSub: activeSubProp = "Vue d'ensemble",
  onSelect,
}) {
  const [activeItem, setActiveItem] = useState(activeItemProp);
  const [activeSub, setActiveSub] = useState(activeSubProp);
  const [openItem, setOpenItem] = useState(activeItemProp);
  const [hovered, setHovered] = useState(null);

  const IconLogo = () => (
    <img src={LogoAx} style={{ width: 48, height: 48 }} alt="Arenametrix" />
  );

  const toggle = (item) => {
    setActiveItem(item.key);
    if (item.children) {
      setOpenItem(openItem === item.key ? null : item.key);
    } else {
      setOpenItem(null);
      onSelect?.({ item: item.key, sub: null });
    }
  };

  return (
    <aside style={{
      width: 248, height: "100vh", flexShrink: 0,
      background: DS.bgCard, borderRight: `1px solid ${DS.borderDefault}`,
      display: "flex", flexDirection: "column", fontFamily: DS.ff,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "20px", height: 64, flexShrink: 0,
        width: 64,
        borderRadius: DS.radiusCard,
        background: "rgba(255,255,255,0.10)",
      }}>
        <IconLogo /> 
        <span style={{
          fontSize: 18,
          fontWeight: 600,
          lineHeight: "22px",
          color: DS.textDefault,
          letterSpacing: "-0.3px",
          fontFamily: DS.ff,
        }}>
          Arenametrix
        </span>
      </div>
      
      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((item) => {
          const isActive = activeItem === item.key;
          const isOpen = openItem === item.key;
          const isHovered = hovered === item.key;
          const IconCmp = item.icon;
          const iconColor = isActive ? DS.textInverse : DS.textSecondary;

          return (
            <div key={item.key}>
              <button
                onClick={() => toggle(item)}
                onMouseEnter={() => setHovered(item.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%", height: 44, padding: "0 12px",
                  display: "flex", alignItems: "center", gap: 12,
                  background: isActive ? DS.actionPrimary : isHovered ? DS.blue100 : "transparent",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: DS.ff, textAlign: "left",
                }}
              >
                <IconCmp s={20} c={iconColor} />
                <span style={{
                  flex: 1, ...TY.b2, fontWeight: isActive ? 600 : 500,
                  color: isActive ? DS.textInverse : DS.textDefault,
                }}>
                  {item.label}
                </span>

                {item.badge != null && (
                  <span style={{
                    minWidth: 18, height: 18, padding: "0 5px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: DS.feedbackError, color: DS.textInverse,
                    borderRadius: 999, fontSize: 11, fontWeight: 600,
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.children && (
                  <Ico.ChevDown s={16} c={isActive ? DS.textInverse : DS.textSecondary} />
                )}
              </button>

              {/* Sub-items */}
              {item.children && isOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "4px 0", paddingLeft: 44 }}>
                  {item.children.map((sub) => {
                    const subActive = activeSub === sub && activeItem === item.key;
                    const subHovered = hovered === `${item.key}:${sub}`;
                    return (
                      <button
                        key={sub}
                        onClick={() => {
                          setActiveItem(item.key);
                          setActiveSub(sub);
                          onSelect?.({ item: item.key, sub });
                        }}
                        onMouseEnter={() => setHovered(`${item.key}:${sub}`)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          height: 34, padding: "0 12px",
                          display: "flex", alignItems: "center",
                          background: subHovered ? DS.bgSurface : "transparent",
                          border: "none", borderRadius: 6, cursor: "pointer",
                          fontFamily: DS.ff, textAlign: "left",
                          ...TY.b2,
                          fontWeight: subActive ? 600 : 400,
                          color: subActive ? DS.actionPrimary : DS.textSecondary,
                        }}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: client */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 20px", flexShrink: 0,
        borderTop: `1px solid ${DS.borderDefault}`,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 6, flexShrink: 0,
          background: DS.bgSurface, border: `1px solid ${DS.borderDefault}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 8, fontWeight: 700, color: DS.textSecondary, lineHeight: "9px",
        }}>
          PARIS
        </div>
        <span style={{ ...TY.b2, fontWeight: 600, color: DS.textDefault }}>
          Nom du client
        </span>
      </div>
    </aside>
  );
}