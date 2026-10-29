import { useState, useRef, useEffect } from "react";
import { DS, TY } from "../../utils/designSystem";
import Ico from "../../utils/icons";
import { SearchField } from "../../components/Field";
import IconBtn from "../../components/Iconbtn";
import { MenuItem as SelectMenuItem, MenuSection, FooterAction } from "../../components/Select";

// ─────────────────────────────────────────────────────────────────────────────
// SMALL BUTTONS / MENU
// ─────────────────────────────────────────────────────────────────────────────

/* Right-toolbar actions use the DS IconBtn, Secondary (Outline) — the classic
   secondary icon button (Figma 1627:114). The + next to the tabs keeps its
   own bare style. */

const MenuItem = ({ icon, label, danger, disabled, onClick }) => {
  const [hover, setHover] = useState(false);
  const color = disabled ? DS.textMuted : danger ? DS.feedbackError : DS.textDefault;
  return (
    <div onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "0 12px", height: 34,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        background: hover && !disabled ? (danger ? DS.feedbackErrorBg : DS.surfaceSubtle) : "transparent",
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
  const color = kind === "add" ? DS.feedbackSuccess : kind === "remove" ? DS.feedbackError : muted ? DS.textMuted : DS.textDefault;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", minHeight: 32 }}>
      {kind
        ? <span style={{ width: 14, flexShrink: 0, textAlign: "center", fontFamily: DS.ff, fontSize: 14, fontWeight: 700, color }}>{kind === "add" ? "+" : "−"}</span>
        : <span style={{ width: 14, flexShrink: 0, display: "flex", justifyContent: "center" }}><FacetIcon facet={facet} s={14} c={muted ? DS.textMuted : DS.actionPrimary} /></span>}
      <span style={{ flex: 1, minWidth: 0, fontFamily: DS.ff, ...TY.bodySm, color, textDecoration: kind === "remove" ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </div>
  );
};

/* Hover card under the active view's name — same shell and MenuSection labels
   as the view picker, so the two dropdowns of the bar read as one family. */
const ViewInfoPopover = ({ left, setup, changes, isStandard }) => (
  <div style={{
    position: "absolute", top: "calc(100% + 6px)", left, zIndex: 9999, width: 300,
    background: DS.surfaceCanvas, borderRadius: DS.radiusXl,
    boxShadow: "0 18px 50px rgba(15,23,42,.22)", overflowY: "auto", maxHeight: 380, padding: "4px 8px 8px",
  }}>
    <div style={{ padding: "4px 0 2px" }}><MenuSection label="View configuration" /></div>
    {setup.map((s, i) => <InfoRow key={i} facet={s.facet} label={s.label} muted={s.muted} />)}

    <div style={{ padding: "8px 0 2px" }}>
      <MenuSection label={(
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...TY.labelMd, fontFamily: DS.ff, color: DS.textSecondary }}>
          {changes.length > 0 && !isStandard && <span style={{ width: 7, height: 7, borderRadius: "50%", background: DS.feedbackWarning }} />}
          Unsaved changes
        </span>
      )} />
    </div>
    {changes.length > 0
      ? changes.map((c, i) => <InfoRow key={i} facet={c.facet} label={c.label} kind={c.kind} />)
      : <div style={{ padding: "0 12px", minHeight: 32, display: "flex", alignItems: "center", fontFamily: DS.ff, ...TY.bodySm, color: DS.textMuted }}>No unsaved changes</div>}
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
  const [pickLeft, setPickLeft] = useState(24);   // view picker: just right of the +
  const [search,   setSearch]   = useState("");
  const barRef = useRef();

  useEffect(() => {
    // Close on any press outside the open menu AND its trigger — including a
    // press elsewhere in the bar (another tab), which the old bar-wide check
    // let through. Escape closes too.
    const h = (e) => { if (!e.target.closest?.("[data-views-menu]")) setMenu(null); };
    const k = (e) => { if (e.key === "Escape") setMenu(null); };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const activeView = views.find((v) => v.id === activeViewId);
  const isStandard = activeView?.standard;

  const q        = search.trim().toLowerCase();
  const match    = (v) => !q || v.name.toLowerCase().includes(q);
  const standard = views.filter((v) => v.standard && match(v));
  const custom   = views.filter((v) => !v.standard && match(v));

  return (
    <div ref={barRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "0 24px", borderBottom: `1px solid ${DS.borderSection}`, minHeight: 44 }}>

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
                color: active ? DS.actionPrimary : DS.textSecondary,
              }}
              onMouseEnter={(e) => {
                if (!active) { e.currentTarget.style.color = DS.textDefault; return; }
                const r = e.currentTarget.getBoundingClientRect();
                const br = barRef.current?.getBoundingClientRect();
                if (br) setPopLeft(Math.max(24, r.left - br.left));
                setTabHover(true);
              }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = DS.textSecondary; else setTabHover(false); }}>
              {active && dirty && !v.standard && <span style={{ width: 7, height: 7, borderRadius: "50%", background: DS.feedbackWarning, flexShrink: 0 }} />}
              {v.name}
            </button>
          );
        })}

        <button
          onClick={(e) => {
            // Open the picker to the right of the + it belongs to, not at the
            // bar's left edge under the first tab.
            const r = e.currentTarget.getBoundingClientRect();
            const br = barRef.current?.getBoundingClientRect();
            if (br) setPickLeft(Math.max(0, Math.min(r.right - br.left + 4, br.width - 340)));
            setSearch(""); setMenu((m) => (m === "picker" ? null : "picker"));
          }}
          title="Browse views"
          data-views-menu=""
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 44, border: "none", background: "transparent", cursor: "pointer" }}>
          <Ico.Plus s={16} c={DS.actionPrimary} />
        </button>
      </div>

      {/* View-name hover card: current setup + unsaved changes */}
      {tabHover && menu === null && <ViewInfoPopover left={popLeft} setup={setup} changes={changes} isStandard={isStandard} />}

      {/* View picker — a search, the views as DS MenuItems under MenuSection
          labels, and "Create a view" as the menu's footer action. No header:
          it is a dropdown, closed by clicking outside. */}
      {menu === "picker" && (
        <div data-views-menu="" style={{
          position: "absolute", top: "calc(100% + 6px)", left: pickLeft, zIndex: 9999, width: 340,
          background: DS.surfaceCanvas, borderRadius: DS.radiusXl,
          boxShadow: "0 18px 50px rgba(15,23,42,.22)", overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "12px 12px 4px" }}>
            <SearchField autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search a view…" />
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto", padding: "0 8px 8px" }}>
            <PickerGroup label="Standard views" views={standard} activeViewId={activeViewId} onSelect={(id) => { onSelect(id); setMenu(null); }} />
            <PickerGroup label="Custom views"   views={custom}   activeViewId={activeViewId} onSelect={(id) => { onSelect(id); setMenu(null); }} empty={q ? "No view matches your search" : "No custom views yet"} />
          </div>
          <div style={{ padding: "0 8px 8px", borderTop: `1px solid ${DS.borderDivider}`, paddingTop: 8 }}>
            <FooterAction label="Create a view" icon={<Ico.Plus s={16} c={DS.actionPrimary} />} onClick={() => { setMenu(null); onCreate(); }} />
          </div>
        </div>
      )}

      {/* Right toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {dirty && (
          <IconBtn type="Secondary" icon={<Ico.Refresh />} title="Discard changes" aria-label="Discard changes" onClick={onRevert} />
        )}

        {dirty && (
          <div data-views-menu="" style={{ position: "relative" }}>
            <IconBtn type="Secondary" icon={<Ico.Save />} active={menu === "save"} title="Save" aria-label="Save"
                     onClick={() => setMenu((m) => (m === "save" ? null : "save"))} />

            {/* Click: choose how to save */}
            {menu === "save" && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 9999, minWidth: 220, background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)", padding: "5px 0", overflow: "hidden" }}>
                <MenuItem icon={<Ico.Save s={14} c={isStandard ? DS.textMuted : DS.textDefault} />} label="Save changes" disabled={isStandard} onClick={() => { setMenu(null); onSaveChanges(); }} />
                <MenuItem icon={<Ico.Plus s={14} c={DS.textDefault} />} label="Save as a new view" onClick={() => { setMenu(null); onSaveAsNew(); }} />
              </div>
            )}
          </div>
        )}

        {activeView && !isStandard && (
          <div data-views-menu="" style={{ position: "relative" }}>
            <IconBtn type="Secondary" icon={<Ico.Dots />} active={menu === "more"} title="View options" aria-label="View options"
                     onClick={() => setMenu((m) => (m === "more" ? null : "more"))} />
            {menu === "more" && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 9999, minWidth: 180, background: DS.surfaceCanvas, border: `1px solid ${DS.borderSection}`, borderRadius: 8, boxShadow: "0 12px 32px rgba(15,23,42,.16)", padding: "5px 0", overflow: "hidden" }}>
                <MenuItem icon={<Ico.Edit s={14} c={DS.textDefault} />} label="Rename view" onClick={() => { setMenu(null); onRename(activeView.id); }} />
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
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <div style={{ padding: "4px 0 2px" }}><MenuSection label={label} /></div>
    {views.length === 0 ? (
      empty ? <div style={{ padding: "6px 12px 8px", fontFamily: DS.ff, ...TY.bodySm, color: DS.textMuted }}>{empty}</div> : null
    ) : views.map((v) => (
      <SelectMenuItem key={v.id} label={v.name} selected={v.id === activeViewId} onClick={() => onSelect(v.id)} />
    ))}
  </div>
);
