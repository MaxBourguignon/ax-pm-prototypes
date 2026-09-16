import { useState, useRef, useEffect } from "react";
import { DS } from "../../utils/designSystem";
import Ico from "../../utils/icons";

// ─────────────────────────────────────────────────────────────────────────────
// SMALL BUTTONS / MENU
// ─────────────────────────────────────────────────────────────────────────────

const IcoBtn = ({ children, onClick, title }) => {
  const [hover, setHover] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        opacity: hover ? 0.65 : 1, transition: "opacity .12s",
      }}>
      {children}
    </button>
  );
};

const MenuItem = ({ icon, label, danger, disabled, onClick }) => {
  const [hover, setHover] = useState(false);
  const color = disabled ? DS.neutral500 : danger ? DS.feedbackError : DS.neutral900;
  return (
    <div onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 34,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        background: hover && !disabled ? (danger ? DS.feedbackErrorBg : DS.neutral100) : "transparent",
      }}>
      {icon}
      <span style={{ fontFamily: DS.ff, fontSize: 13, color, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
};

const FacetIcon = ({ facet, s = 12, c = DS.actionPrimary }) => {
  if (facet === "filters") return <Ico.Filter s={s} c={c} />;
  if (facet === "columns") return <Ico.List   s={s} c={c} />;
  if (facet === "sort")    return <Ico.SortUp s={s} c={c} />;
  return null;
};

// Hover card shown under the active view's name — current setup + unsaved changes.
const InfoRow = ({ facet, label, muted, kind }) => {
  const color = kind === "add" ? DS.feedbackSuccess : kind === "remove" ? DS.feedbackError : muted ? DS.neutral500 : DS.neutral700;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", minHeight: 28 }}>
      {kind
        ? <span style={{ width: 12, flexShrink: 0, textAlign: "center", fontFamily: DS.ff, fontSize: 14, fontWeight: 700, color }}>{kind === "add" ? "+" : "−"}</span>
        : <span style={{ flexShrink: 0, display: "flex" }}><FacetIcon facet={facet} c={muted ? DS.neutral500 : DS.actionPrimary} /></span>}
      <span style={{ flex: 1, minWidth: 0, fontFamily: DS.ff, fontSize: 12, color, textDecoration: kind === "remove" ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </div>
  );
};

const SectionLabel = ({ children, dot }) => (
  <div style={{ padding: "8px 12px 3px", display: "flex", alignItems: "center", gap: 6 }}>
    {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: DS.feedbackWarning }} />}
    <span style={{ fontFamily: DS.ff, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: DS.neutral500 }}>{children}</span>
  </div>
);

const ViewInfoPopover = ({ left, setup, changes, isStandard }) => (
  <div style={{
    position: "absolute", top: "calc(100% - 1px)", left, zIndex: 9999, width: 260,
    background: DS.white, border: `1px solid ${DS.neutral200}`, borderRadius: 8,
    boxShadow: "0 12px 32px rgba(15,23,42,.16)", overflowY: "auto", maxHeight: 380, paddingBottom: 6,
  }}>
    <SectionLabel>View configuration</SectionLabel>
    {setup.map((s, i) => <InfoRow key={i} facet={s.facet} label={s.label} muted={s.muted} />)}

    <div style={{ height: 1, background: DS.neutral200, margin: "6px 0" }} />

    <SectionLabel dot={changes.length > 0 && !isStandard}>Unsaved changes</SectionLabel>
    {changes.length > 0
      ? changes.map((c, i) => <InfoRow key={i} facet={c.facet} label={c.label} kind={c.kind} />)
      : <div style={{ padding: "0 12px", height: 28, display: "flex", alignItems: "center", fontFamily: DS.ff, fontSize: 12, color: DS.neutral500 }}>No unsaved changes</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS BAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ViewsBar — tab strip + view picker + a compact save/undo toolbar.
 * The ongoing changes surface on hover of the save button.
 *
 * Props:
 *   views, activeViewId, dirty, changes  ([{ facet, label }])
 *   onSelect(id) · onCreate() · onRevert() · onSaveChanges() · onSaveAsNew()
 *   onRename(id) · onDelete(id)
 */
export default function ViewsBar({
  views, activeViewId, dirty, changes = [], setup = [],
  onSelect, onCreate, onRevert, onSaveChanges, onSaveAsNew, onRename, onDelete,
}) {
  const [menu,     setMenu]     = useState(null);   // "picker" | "save" | "more" | null
  const [tabHover, setTabHover] = useState(false);  // hovering the active view's name
  const [popLeft,  setPopLeft]  = useState(24);
  const [search,   setSearch]   = useState("");
  const barRef = useRef();

  useEffect(() => {
    const h = (e) => { if (!barRef.current?.contains(e.target)) setMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeView = views.find((v) => v.id === activeViewId);
  const isStandard = activeView?.standard;

  const q        = search.trim().toLowerCase();
  const match    = (v) => !q || v.name.toLowerCase().includes(q);
  const standard = views.filter((v) => v.standard && match(v));
  const custom   = views.filter((v) => !v.standard && match(v));

  return (
    <div ref={barRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "0 24px", borderBottom: `1px solid ${DS.neutral200}`, minHeight: 44 }}>

      {/* Tabs + picker */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 2, flex: 1, minWidth: 0, overflowX: "auto" }}>
        {views.map((v) => {
          const active = v.id === activeViewId;
          return (
            <button key={v.id} onClick={() => onSelect(v.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 44,
                border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
                borderBottom: `2px solid ${active ? DS.actionPrimary : "transparent"}`,
                fontFamily: DS.ff, fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? DS.actionPrimary : DS.neutral700,
              }}
              onMouseEnter={(e) => {
                if (!active) { e.currentTarget.style.color = DS.neutral900; return; }
                const r = e.currentTarget.getBoundingClientRect();
                const br = barRef.current?.getBoundingClientRect();
                if (br) setPopLeft(Math.max(24, r.left - br.left));
                setTabHover(true);
              }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = DS.neutral700; else setTabHover(false); }}>
              {active && dirty && !v.standard && <span style={{ width: 7, height: 7, borderRadius: "50%", background: DS.feedbackWarning, flexShrink: 0 }} />}
              {v.name}
            </button>
          );
        })}

        <button onClick={() => { setSearch(""); setMenu((m) => (m === "picker" ? null : "picker")); }} title="Browse views"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 44, border: "none", background: "transparent", cursor: "pointer" }}>
          <Ico.Plus s={16} c={DS.actionPrimary} />
        </button>
      </div>

      {/* View-name hover card: current setup + unsaved changes */}
      {tabHover && menu === null && <ViewInfoPopover left={popLeft} setup={setup} changes={changes} isStandard={isStandard} />}

      {/* View picker dropdown */}
      {menu === "picker" && (
        <div style={{ position: "absolute", top: "calc(100% - 1px)", left: 24, zIndex: 9999, width: 300, background: DS.white, border: `1px solid ${DS.neutral200}`, borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)", overflow: "hidden" }}>
          <div style={{ padding: 8, borderBottom: `1px solid ${DS.neutral200}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", height: 34, border: `1px solid ${DS.neutral200}`, borderRadius: 6, background: DS.neutral100 }}>
              <Ico.Search s={14} c={DS.neutral500} />
              <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a view…"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: DS.ff, fontSize: 13, color: DS.neutral900 }} />
            </div>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto", padding: "6px 0" }}>
            <PickerGroup label="Standard views" views={standard} activeViewId={activeViewId} onSelect={(id) => { onSelect(id); setMenu(null); }} />
            <PickerGroup label="Custom views"   views={custom}   activeViewId={activeViewId} onSelect={(id) => { onSelect(id); setMenu(null); }} empty="No custom views yet" />
          </div>
          <div onClick={() => { setMenu(null); onCreate(); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: 40, cursor: "pointer", borderTop: `1px solid ${DS.neutral200}` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = DS.neutral100; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Ico.Plus s={14} c={DS.actionPrimary} />
            <span style={{ fontFamily: DS.ff, fontSize: 13, fontWeight: 500, color: DS.actionPrimary }}>Create a view</span>
          </div>
        </div>
      )}

      {/* Right toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {dirty && (
          <IcoBtn title="Discard changes" onClick={onRevert}>
            <Ico.Refresh s={15} c={DS.actionPrimary} />
          </IcoBtn>
        )}

        {dirty && (
          <div style={{ position: "relative" }}>
            <IcoBtn title="Save" onClick={() => setMenu((m) => (m === "save" ? null : "save"))}>
              <Ico.Save s={15} c={DS.actionPrimary} />
            </IcoBtn>

            {/* Click: choose how to save */}
            {menu === "save" && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 9999, minWidth: 220, background: DS.white, border: `1px solid ${DS.neutral200}`, borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)", padding: "5px 0", overflow: "hidden" }}>
                <MenuItem icon={<Ico.Save s={14} c={isStandard ? DS.neutral500 : DS.neutral900} />} label="Save changes" disabled={isStandard} onClick={() => { setMenu(null); onSaveChanges(); }} />
                <MenuItem icon={<Ico.Plus s={14} c={DS.neutral900} />} label="Save as a new view" onClick={() => { setMenu(null); onSaveAsNew(); }} />
              </div>
            )}
          </div>
        )}

        {activeView && !isStandard && (
          <div style={{ position: "relative" }}>
            <IcoBtn title="View options" onClick={() => setMenu((m) => (m === "more" ? null : "more"))}>
              <Ico.Dots s={16} c={DS.actionPrimary} />
            </IcoBtn>
            {menu === "more" && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 9999, minWidth: 180, background: DS.white, border: `1px solid ${DS.neutral200}`, borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)", padding: "5px 0", overflow: "hidden" }}>
                <MenuItem icon={<Ico.Edit s={14} c={DS.neutral900} />} label="Rename view" onClick={() => { setMenu(null); onRename(activeView.id); }} />
                <MenuItem icon={<Ico.Trash s={14} c={DS.feedbackError} />} label="Delete view" danger onClick={() => { setMenu(null); onDelete(activeView.id); }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const PickerGroup = ({ label, views, activeViewId, onSelect, empty }) => (
  <div>
    <div style={{ padding: "6px 14px 4px", fontFamily: DS.ff, fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: DS.neutral500 }}>
      {label}
    </div>
    {views.length === 0 ? (
      empty ? <div style={{ padding: "4px 14px 8px", fontFamily: DS.ff, fontSize: 12, color: DS.neutral500 }}>{empty}</div> : null
    ) : views.map((v) => {
      const active = v.id === activeViewId;
      return (
        <div key={v.id} onClick={() => onSelect(v.id)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 14px", height: 34, cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = DS.neutral100; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
          <span style={{ fontFamily: DS.ff, fontSize: 13, fontWeight: active ? 600 : 400, color: active ? DS.actionPrimary : DS.neutral900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {v.name}
          </span>
          {active && <Ico.Check s={13} c={DS.actionPrimary} />}
        </div>
      );
    })}
  </div>
);
