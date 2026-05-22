import { useState } from "react";
import { NavLink } from "react-router";

const MODULES = [
  { icon: "🚀", label: "Contacts page V3", desc: "New contact page with brand new segmentation engine to welcome Fanalists clients", bg: "#EFF6FF", link: "/contacts" },
  { icon: "✨", label: "Consents page V3", desc: "New consent page with consents management", bg: "#EFF6FF", link: "/consents" },
  { icon: "🏆", label: "Performances page V3", desc: "New performances page with performances management", bg: "#EFF6FF", link: "/performances" },
];


function ModuleCard({ icon, label, desc, bg, link }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#60A5FA" : "#D2D5DA"}`,
        borderRadius: 10,
        padding: "26px 22px 22px",
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
        cursor: "pointer", textDecoration: "none",
        boxShadow: hovered ? "0 8px 24px rgba(78,111,199,0.12)" : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* top accent bar */}
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(to right, #2CB1A2, #5585B8)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s",
      }} />

      <div style={{
        width: 42, height: 42, borderRadius: 10, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>
        {icon}
      </div>

      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 15, color: "#242731" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#6D7280", lineHeight: 1.55 }}>
        {desc}
      </span>

      {/* arrow */}
      <NavLink to={link}>
        <span style={{
          onClf: "flex-end",
          width: 26, height: 26, borderRadius: "50%",
          background: hovered ? "#007AFF" : "#F9FAFB",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: hovered ? "#fff" : "#4E6FC7",
          transition: "background 0.15s, color 0.15s",
        }}
        >
          →
        </span>
      </NavLink>

    </a>
  );
}


export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", flexDirection: "column" }}>

      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "start",
        padding: "56px 40px",
      }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
            fontSize: 34, color: "#242731", letterSpacing: -0.5, marginBottom: 10,
          }}>
            Welcome to the Arenametrix Prototype Sandbox
          </h1>
        </div>


        {/* Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18, maxWidth: 940, width: "100%",
        }}>
          {MODULES.map((m) => (
            <ModuleCard key={m.label} {...m} />
          ))}
        </div>

      </main>
    </div>
  );
}
