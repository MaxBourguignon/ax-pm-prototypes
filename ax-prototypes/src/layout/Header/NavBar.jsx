import { useState } from "react";
import logo from '../../assets/Logo-Arenametrix-écriture-verte.png'

const NAV_TABS_L1 = [
  "Contacts",
  "Campagnes",
  "Ventes",
  "Gestion commerciale",
];

const NAV_TABS_L2 = [
  "Vue d'ensemble",
  "Contacts",
  "Structure V1",
  "Structures",
  "Listes",
  "Consentements",
  "Importer",
];

// ── Inline SVG icons (white, 20×20) ──────────────────────────────────────────

const IconClipboardList = ({ s = 20, c = "white" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_254_2064)">
<path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 12H9.01" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13 12H15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 16H9.01" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13 16H15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_254_2064">
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
</svg>);

const IconAcademy = ({ s = 20, c = "white" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_254_2065)">
<path d="M22 9L12 5L2 9L12 13L22 9ZM22 9V15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 10.6V16C6 16.7957 6.63214 17.5587 7.75736 18.1213C8.88258 18.6839 10.4087 19 12 19C13.5913 19 15.1174 18.6839 16.2426 18.1213C17.3679 17.5587 18 16.7957 18 16V10.6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_254_2065">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>

);

const IconDirections = ({ s = 20, c = "white" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_254_2076)">
<path d="M12 21V17" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 13V9" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 5V3" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 21H14" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 5V9H19L21 7L19 5H8Z" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 13V17H6L4 15L6 13H14Z" stroke="#FFFFFF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_254_2076"><rect width="24" height="24" fill="white"/></clipPath></defs>
</svg>);

const IconZoomQuestion = ({ s = 20, c = "white" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_254_2067)">
<path d="M3 10C3 10.9193 3.18106 11.8295 3.53284 12.6788C3.88463 13.5281 4.40024 14.2997 5.05025 14.9497C5.70026 15.5998 6.47194 16.1154 7.32122 16.4672C8.1705 16.8189 9.08075 17 10 17C10.9193 17 11.8295 16.8189 12.6788 16.4672C13.5281 16.1154 14.2997 15.5998 14.9497 14.9497C15.5998 14.2997 16.1154 13.5281 16.4672 12.6788C16.8189 11.8295 17 10.9193 17 10C17 9.08075 16.8189 8.1705 16.4672 7.32122C16.1154 6.47194 15.5998 5.70026 14.9497 5.05025C14.2997 4.40024 13.5281 3.88463 12.6788 3.53284C11.8295 3.18106 10.9193 3 10 3C9.08075 3 8.1705 3.18106 7.32122 3.53284C6.47194 3.88463 5.70026 4.40024 5.05025 5.05025C4.40024 5.70026 3.88463 6.47194 3.53284 7.32122C3.18106 8.1705 3 9.08075 3 10Z" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 21L15 15" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 13V13.01" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 10C10.2517 10.0001 10.4994 9.93691 10.7202 9.81618C10.9411 9.69545 11.128 9.52108 11.2638 9.30914C11.3996 9.0972 11.4798 8.85449 11.4972 8.60339C11.5145 8.35228 11.4684 8.10085 11.3631 7.87225C11.2577 7.64365 11.0966 7.44523 10.8944 7.29527C10.6923 7.14532 10.4556 7.04864 10.2063 7.01415C9.95697 6.97966 9.70297 7.00847 9.46769 7.09791C9.23242 7.18736 9.02344 7.33458 8.86 7.526" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_254_2067">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>);

// ─────────────────────────────────────────────────────────────────────────────

export default function Header({
  activeL1 = "Contacts",
  activeL2 = "Contacts",
  onL1Change,
  onL2Change,
}) {
  const [l1, setL1] = useState(activeL1);
  const [l2, setL2] = useState(activeL2);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const handleL1 = (tab) => { setL1(tab); onL1Change?.(tab); };
  const handleL2 = (tab) => { setL2(tab); onL2Change?.(tab); };

  const iconBtnStyle = (key) => ({
    background: hoveredIcon === key ? "rgba(255,255,255,0.15)" : "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  });

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEVEL 1 ── */}
      <nav style={{
        background: "#fff",
        height: 72,
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        gap: 32,
        borderBottom: "1px solid #D2D5DA",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {/* Logo */}
        <img src={logo} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0, width: '60px', height: '62.6px' }} alt="Arenametrix" />

        {/* L1 Tabs */}
        <div style={{ display: "flex", alignItems: "center", height: 72, flex: 1, gap: 10 }}>
          {NAV_TABS_L1.map((tab) => {
            const isActive = l1 === tab;
            return (
              <button
                key={tab}
                onClick={() => handleL1(tab)}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-start", justifyContent: "flex-end",
                  padding: "0 16px",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                <span style={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 16, color: "#242731",
                  paddingBottom: 8, whiteSpace: "nowrap",
                }}>
                  {tab}
                </span>
                <span style={{
                  display: "block", height: 4, width: "100%",
                  borderRadius: "2px 2px 0 0",
                  background: isActive ? "#4E6FC7" : "transparent",
                  transition: "background 0.2s",
                }}/>
              </button>
            );
          })}
        </div>

        {/* Right: avatar + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          <div style={{
            width: 36, height: 36, background: "#017BFE", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "#FFFFFF", cursor: "pointer",
          }}>
            MB
          </div>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontWeight: 500, color: "#4B5563",
            fontFamily: "'Inter', sans-serif",
          }}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1l5 5 5-5" stroke="#6D7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── LEVEL 2 ── */}
      <nav style={{
        height: 52,
        background: "linear-gradient(to right, #2CB1A2, #5585B8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
      }}>
        {/* L2 Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 36}}>
          {NAV_TABS_L2.map((tab) => {
            const isActive = l2 === tab;
            return (
              <button
                key={tab}
                onClick={() => handleL2(tab)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                  whiteSpace: "nowrap",
                  padding: "6px 0",
                  position: "relative",
                  transition: "color 0.2s",
                }}
              >
                {tab}
                {isActive && (
                  <span style={{
                    position: "absolute", bottom: -8, left: 0, right: 0,
                    height: 3, background: "#fff",
                    borderRadius: "2px 2px 0 0", display: "block",
                  }}/>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: icon CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Clipboard-list icon */}
          <button
            title="Tâches"
            style={iconBtnStyle("clipboard")}
            onMouseEnter={() => setHoveredIcon("clipboard")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <IconClipboardList s={32} />
          </button>

          {/* Separator */}
          <div style={{
            width: 1.5, height: 22,
            background: "#FFFFFF",
            margin: "0 6px",
          }} />

          {/* Academy icon */}
          <button
            title="Académie"
            style={iconBtnStyle("academy")}
            onMouseEnter={() => setHoveredIcon("academy")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <IconAcademy s={32} />
          </button>

          {/* Directions icon */}
          <button
            title="Navigation"
            style={iconBtnStyle("directions")}
            onMouseEnter={() => setHoveredIcon("directions")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <IconDirections s={32} />
          </button>

          {/* Zoom/Question icon */}
          <button
            title="Aide"
            style={iconBtnStyle("help")}
            onMouseEnter={() => setHoveredIcon("help")}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <IconZoomQuestion s={32} />
          </button>
        </div>
      </nav>

    </header>
  );
}