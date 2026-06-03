import { useState } from "react";

import LogoAx from "../../assets/Logo Arenametrix détouré blanc HD.png";
import {DS} from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { Link } from "react-router-dom";

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDots = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="4"  r="1.2" fill="currentColor" />
    <circle cx="8" cy="8"  r="1.2" fill="currentColor" />
    <circle cx="8" cy="12" r="1.2" fill="currentColor" />
  </svg>
);

const IconLogo = () => (
  <img src={LogoAx} style={{ width: 18, height: 18 }} alt="Arenametrix" />
);

// ── Sidebar-specific overlays ─────────────────────────────────────────────────
const NAV_ITEM_ACTIVE    = "rgba(255,255,255,0.15)";
const NAV_ITEM_HOVER     = "rgba(255,255,255,0.07)";
const NAV_BORDER         = "rgba(255,255,255,0.12)";
const NAV_TEXT_MUTED     = "rgba(255,255,255,0.45)";
const NAV_TEXT_SECONDARY = "rgba(255,255,255,0.65)";

// ── Data ──────────────────────────────────────────────────────────────────────

const NAV_TABS_L1 = [
  {
    id: "contacts",
    label: "Contacts",
    icon: <Ico.Users s={16} c="rgba(255,255,255,0.80)" />,
    subitems: [
      { id: "overview",    label: "Overview page",  link: "/overview"   },
      { id: "contacts",    label: "Contacts",       link: "/contacts"   },
      { id: "structures",  label: "Structures",     link: "/structures" },
      { id: "lists",       label: "Lists",          link: "/lists"      },
      { id: "consents",    label: "Consents",       link: "/consents"   },
      { id: "arenaform",   label: "Arenaform",      link: "/arenaform"  }
    ],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: <Ico.Campaigns s={16} c="rgba(255,255,255,0.80)" />,
    subitems: [
      { id: "performances",    label: "Performances",        link: "/performances"   },
    ],
  },
  {
    id: "ventes",
    label: "Sales",
    icon: <Ico.Ticket s={16} c="rgba(255,255,255,0.80)" />,
    subitems: [
    ],
  },
  {
    id: "gestion",
    label: "B2B management",
    icon: <Ico.Organization s={16} c="rgba(255,255,255,0.80)" />,
    subitems: [
    ],
  },
  {
    id: "sso",
    label: "SSO",
    icon: <Ico.SSO s={16} c="rgba(255,255,255,0.80)" />,
    subitems: [
    ],
  },
];

// ── SubItem ───────────────────────────────────────────────────────────────────

function SubItem({ label, isActive, onClick, link }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={link}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: `${DS.space1} ${DS.space2}`,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: isActive ? 500 : 400,
        lineHeight: "18px",
        color: isActive ? DS.white : hovered ? "rgba(255,255,255,0.80)" : NAV_TEXT_SECONDARY,
        background: isActive ? NAV_ITEM_ACTIVE : hovered ? NAV_ITEM_HOVER : "transparent",
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: DS.ff,
        textDecoration: "none",
        transition: `background ${DS.durFast} ${DS.ease}, color ${DS.durFast} ${DS.ease}`,
      }}
    >
      {label}
    </Link>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────

function NavItem({ item, isOpen, onToggle, activeL2, onL2Click }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: DS.space2,
          padding: `9px ${DS.space2}`,
          borderRadius: DS.radiusCard,
          background: isOpen ? NAV_ITEM_ACTIVE : hovered ? NAV_ITEM_HOVER : "transparent",
          border: "none",
          cursor: "pointer",
          transition: `background ${DS.durBase} ${DS.ease}`,
          fontFamily: DS.ff,
        }}
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          opacity: isOpen ? 1 : 0.60,
          transition: `opacity ${DS.durBase} ${DS.ease}`,
        }}>
          {item.icon}
        </span>
        <span style={{
          flex: 1,
          fontSize: 14,
          fontWeight: isOpen ? 600 : 400,
          lineHeight: "20px",
          color: isOpen ? DS.white : NAV_TEXT_SECONDARY,
          textAlign: "left",
          transition: `color ${DS.durBase} ${DS.ease}`,
          fontFamily: DS.ff,
        }}>
          {item.label}
        </span>
        <span style={{
          display: "flex",
          alignItems: "center",
          color: isOpen ? "rgba(255,255,255,0.35)" : NAV_TEXT_MUTED,
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          transition: `transform 200ms ${DS.ease}`,
          flexShrink: 0,
        }}>
          <IconChevron />
        </span>
      </button>

      {isOpen && (
        <div style={{ position: "relative", padding: `${DS.space1} 0 ${DS.space1} 26px` }}>
          {/* Vertical track line */}
          <div style={{
            position: "absolute",
            left: 18,
            top: 4,
            bottom: 6,
            width: 1,
            background: NAV_BORDER,
            borderRadius: 1,
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {item.subitems.map((subtab) => (
              <SubItem
                key={subtab.id}
                label={subtab.label}
                link={subtab.link}
                isActive={activeL2 === `${item.id}-${subtab.id}`}
                onClick={() => onL2Click(`${item.id}-${subtab.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function FooterUser() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: DS.space4,
        display: "flex",
        alignItems: "center",
        gap: DS.space2,
        cursor: "pointer",
        background: hovered ? NAV_ITEM_HOVER : "transparent",
        transition: `background ${DS.durFast} ${DS.ease}`,
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.10)",
        border: `1px solid ${NAV_BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: "16px",
        color: DS.white,
        flexShrink: 0,
        letterSpacing: "0.5px",
        fontFamily: DS.ff,
      }}>
        MB
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: "18px",
          color: DS.white,
          margin: 0,
          fontFamily: DS.ff,
        }}>
          Maxence Bourguignon
        </p>
        <p style={{
          fontSize: 11,
          fontWeight: 400,
          lineHeight: "16px",
          color: NAV_TEXT_MUTED,
          margin: 0,
          fontFamily: DS.ff,
        }}>
          Arenametrix
        </p>
      </div>
      <span style={{ color: NAV_TEXT_MUTED, display: "flex" }}>
        <IconDots />
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Sidebar() {
  const [openItem, setOpenItem] = useState("contacts");
  const [activeL2, setActiveL2] = useState("contacts-overview");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const toggle = (id) => setOpenItem((prev) => (prev === id ? null : id));

  return (
    <aside style={{
      width: 280,
      minHeight: "100vh",
      background: DS.navy,
      borderRight: `1px solid ${NAV_BORDER}`,
      display: "flex",
      flexDirection: "column",
      fontFamily: DS.ff,
    }}>

      {/* Logo */}
      <div style={{
        padding: `${DS.space4} ${DS.space4}`,
        display: "flex",
        alignItems: "center",
        gap: DS.space2,
        borderBottom: `1px solid ${NAV_BORDER}`,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: DS.radiusCard,
          background: "rgba(255,255,255,0.10)",
          border: `1px solid ${NAV_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <IconLogo />
        </div>
        <span style={{
          fontSize: 15,
          fontWeight: 600,
          lineHeight: "22px",
          color: DS.white,
          letterSpacing: "-0.3px",
          fontFamily: DS.ff,
        }}>
          Arenametrix
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: DS.space3, borderBottom: `1px solid ${NAV_BORDER}` }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: DS.space2,
          background: searchFocused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          border: `1px solid ${searchFocused ? "rgba(255,255,255,0.25)" : NAV_BORDER}`,
          borderRadius: 7,
          padding: `0 ${DS.space2}`,
          height: 32,
          transition: `background ${DS.durFast} ${DS.ease}, border ${DS.durFast} ${DS.ease}`,
        }}>
          <span style={{ flexShrink: 0, color: NAV_TEXT_MUTED, display: "flex" }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 13,
              lineHeight: "20px",
              color: DS.white,
              outline: "none",
              width: "100%",
              fontFamily: DS.ff,
            }}
          />
          <span style={{
            fontSize: 10,
            color: NAV_TEXT_MUTED,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${NAV_BORDER}`,
            borderRadius: DS.radiusButton,
            padding: "1px 5px",
            flexShrink: 0,
            fontFamily: DS.ff,
          }}>
            ⌘K
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: `${DS.space3} ${DS.space2}`,
        display: "flex",
        flexDirection: "column",
        gap: DS.space1,
        overflowY: "auto",
      }}>
        {NAV_TABS_L1.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isOpen={openItem === item.id}
            onToggle={() => toggle(item.id)}
            activeL2={activeL2}
            onL2Click={setActiveL2}
          />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ height: 1, flexShrink: 0, background: NAV_BORDER }} />
      <FooterUser />
    </aside>
  );
}

export default Sidebar;